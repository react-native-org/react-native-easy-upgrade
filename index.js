import { NativeModules, NetInfo, Platform } from 'react-native';
import ReactNativeFS from 'react-native-fs';

const { RNAppUpgrade } = NativeModules;

let jobId = -1;
const ORIGIN_IOS_APP_LOOKUP_URL = 'https://itunes.apple.com/lookup?id=';
const IS_ANDROID = Platform.OS === 'android';

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

  async _getCheckParams() {
    const localVersionName = RNAppUpgrade.versionName;
    const localVersionCode = RNAppUpgrade.versionCode;
    let extraParams = {};
    const { getExtraParams } = this.options;
    if (getExtraParams && typeof getExtraParams === 'function') {
      extraParams = await this.options.getExtraParams();
    }
    return {
      localVersionName,
      localVersionCode,
      extraParams
    };
  }

  async _checkAndroidUpdate() {
    try {
      const checkUpdateUrl = this.options.checkUpdateUrl;
      const params = await this._getCheckParams();
      const result = await this._requestUrlAsync('POST', checkUpdateUrl, params);
      if (result.isUpdate) {
        this._updateApp(result);
      } else {
        this.options.notNeedUpdateApp && this.options.notNeedUpdateApp();
      }
    } catch (err) {
      this._handleError(err);
    }
  }

  _updateApp(remoteParams) {
    const apkUrl = remoteParams.apkUrl;
    if (remoteParams.forceUpdate) {
      if (this.options.forceUpdateApp) {
        this.options.forceUpdateApp();
      }
      this._downloadApk(apkUrl);
    } else if (this.options.needUpdateApp) {
      this.options.needUpdateApp(isUpdate => {
        if (isUpdate) {
          this._downloadApk(apkUrl);
        }
      });
    }
  }

  get downloading() {
    return jobId > -1;
  }

  downloadSetting = ()=> {
    const progress = data => {
      const percentage = (100 * data.bytesWritten / data.contentLength) | 0;
      this.options.downloadApkProgress && this.options.downloadApkProgress(percentage);
    };
    const begin = res => {
      this.options.downloadApkStart && this.options.downloadApkStart();
    };

    return {progress, begin};
  }

  _downloadApk(apkUrl) {
    if (this.downloading) {
      return;
    }

    const progressDivider = 1;
    const downloadDestPath = this.options.downloadApkSavePath
      ? this.options.downloadApkSavePath
      : `${ReactNativeFS.DocumentDirectoryPath}/NewApp.apk`;

    const ret = ReactNativeFS.downloadFile({
      fromUrl: apkUrl,
      toFile: downloadDestPath,
      begin,
      progress,
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

  async _checkiOSUpdate() {
    // iOSAppId不存在
    if (!this.options.iOSAppId) {
      return;
    }
    try {
      const data = await this._requestUrlAsync('GET', ORIGIN_IOS_APP_LOOKUP_URL + this.options.iOSAppId);
      this._handleResult(data);
    } catch (err) {
      this._handleError(err);
    }
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

  _getNetwork() {
    NetInfo.fetch().done;
  }

  checkUpdate() {
    if (IS_ANDROID) {
      this._checkAndroidUpdate();
    } else {
      this._checkiOSUpdate();
    }
  }
}

export default AppUpgrade;
