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

  _handleResult(data) {
    if (data.resultCount < 1) {
      return;
    }
    const result = data.results[0];
    const version = result.version;
    const trackViewUrl = result.trackViewUrl;
    if (version !== RNAppUpgrade.versionName) {
      if (this.options.needUpdateApp) {
        this.options.needUpdateApp(isUpdate => {
          if (isUpdate) {
            RNAppUpgrade.installFromAppStore(trackViewUrl);
          }
        });
      }
    }
  }

  _handleError(err) {
    console.log('downloadApkError', err);
    this.options.onError && this.options.onError(err);
  }


  getNetworkStatus() {
    return new Promise(async(resolve) => {
      NetInfo.fetch().done(resolve);
    })
  }

  getLocalVersion() {
    const localVersionName = RNAppUpgrade.versionName;
    const localVersionCode = RNAppUpgrade.versionCode;
    return {localVersionName, localVersionCode};
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
    const downloadDestPath = this.options.downloadApkSavePath || `${ReactNativeFS.DocumentDirectoryPath}/Temp_App${RNAppUpgrade.versionName}.apk`;

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

  async updateiOSApp() {
    // iOSAppId不存在
    if (!this.options.iOSAppId) {
      return;
    }
    try {
      const data = await this._requestUrlAsync('GET', DEFAULT_IOS_APP_LOOKUP_URL + this.options.iOSAppId);
      this._handleResult(data);
    } catch (err) {
      this._handleError(err);
    }
  }

}

export default AppUpgrade;
