import { NativeModules, NetInfo, Platform } from 'react-native';
import ReactNativeFS from 'react-native-fs';

const { RNAppUpgrade } = NativeModules;

let jobId = -1;
const DEFAULT_IOS_APP_LOOKUP_URL = 'https://itunes.apple.com/lookup?id=';

class AppUpgrade {
  constructor(options) {
    this.options = options;
  }

  async _requestUrlAsync(method, url, params) {
    let request = {};
    if (method === 'POST') {
      request = {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      };
    }

    return new Promise((resolve, reject) => {
      fetch(url, request)
        .then(response => response.json())
        .then(resolve)
        .catch(reject);
    });
  }

  get defaultApkSavePath() {
    return `${ReactNativeFS.DocumentDirectoryPath}/Temp_App${RNAppUpgrade.versionName}.apk`;
  }

  get downloading() {
    return jobId > -1;
  }

  progress(data) {
    const percentage = (100 * data.bytesWritten / data.contentLength) | 0;
    this.options.downloadApkProgress && this.options.downloadApkProgress(percentage);
  }

  begin() {
    this.options.downloadApkStart && this.options.downloadApkStart();
  }

  _handleError(err) {
    console.log('downloadApkError', err);
    this.options.onError && this.options.onError(err);
  }

  getNetworkStatus() {
    return new Promise(async resolve => {
      NetInfo.fetch().done(resolve);
    });
  }

  getLocalVersionInfo() {
    const versionName = RNAppUpgrade.versionName;
    const versionCode = RNAppUpgrade.versionCode;
    return { versionName, versionCode };
  }

  /**
   * update app and install
   * @param apkUrl
   */
  updateAndroidApp(apkUrl) {
    if (this.downloading) {
      return;
    }

    const progressDivider = 1;
    const downloadDestPath =
      this.options.downloadApkSavePath ||
      `${ReactNativeFS.DocumentDirectoryPath}/Temp_App${RNAppUpgrade.versionName}.apk`;

    const ret = ReactNativeFS.downloadFile({
      fromUrl: apkUrl,
      toFile: downloadDestPath,
      begin: this.begin,
      progress: this.progress,
      background: true,
      progressDivider
    });

    jobId = ret.jobId;

    ret.promise
      .then(res => {
        // console.log('downloadApkEnd');
        this.options.downloadApkEnd &&
        this.options.downloadApkEnd(needInstall => {
          if (needInstall) {
            RNAppUpgrade.installApk(downloadDestPath);
          }
        });

        jobId = -1;
      })
      .catch(err => {
        this._handleError(err);

        jobId = -1;
      });
  }

  checkiOSUpdate() {
    return new Promise(async (resolve, reject) => {
      if (!this.options.iOSAppId) {
        return reject('not found iOSAppId');
      }
      try {
        const data = await this._requestUrlAsync('GET', DEFAULT_IOS_APP_LOOKUP_URL + this.options.iOSAppId);
        if (data.resultCount < 1) {
          return reject('no result');
        }
        const result = data.results[0];
        const appStoreVersion = result.version;
        const localVersion = RNAppUpgrade.versionName;
        this.trackViewUrl = result.trackViewUrl;
        let isUpdate = false;
        if (appStoreVersion !== localVersion) {
          isUpdate = true;
        }
        const res = { appStoreVersion, localVersion, isUpdate };
        resolve(res);
      } catch (err) {
        reject(err);
        this._handleError(err);
      }
    });
  }

  navigateToAppStore(trackViewUrl) {
    if (!trackViewUrl) trackViewUrl = this.trackViewUrl;
    RNAppUpgrade.installFromAppStore(trackViewUrl);
  }
}

export default AppUpgrade;
