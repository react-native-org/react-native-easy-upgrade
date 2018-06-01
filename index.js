import { NativeModules, NetInfo, Platform } from 'react-native';
import ReactNativeFS from 'react-native-fs';

const { RNAppUpgrade } = NativeModules;

let jobId = -1;
const iOS_APP_URL = 'https://itunes.apple.com/lookup?id=';
const IS_ANDROID = Platform.OS === 'android';

class AppUpgrade {
  constructor(options) {
    this.options = options;
  }

  async _callRemote(method, url, params) {
    const request =
      method === 'POST'
        ? {
          method: method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(params)
        }
        : {};

    return new Promise((resolve, reject) => {
      fetch(url, request)
        .then(response => response.json())
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  async _getCheckParams() {
    const localVersionName = RNAppUpgrade.versionName;
    let extraOptions = {};
    if (this.options.getExtraOption) {
      extraOptions = await this.options.getExtraOption();
    }
    return {
      localVersionName,
      extraOptions
    };
  }

  async _checkAndroidUpdate() {
    try {
      const checkUpdateUrl = this.options.checkUpdateUrl;
      const params = await this._getCheckParams();
      const result = await this._callRemote('POST', checkUpdateUrl, params);
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

  _downloadApk(apkUrl) {
    NetInfo.fetch().done(res => {
      if (res === 'WIFI') {
        const progress = data => {
          const percentage = (100 * data.bytesWritten / data.contentLength) | 0;
          this.options.downloadApkProgress && this.options.downloadApkProgress(percentage);
        };
        const begin = res => {
          this.options.downloadApkStart && this.options.downloadApkStart();
        };
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
    });
  }

  async _getAppStoreVersion() {
    // iOSAppId不存在
    if (!this.options.iOSAppId) {
      return;
    }
    try {
      const data = await this._callRemote('GET', iOS_APP_URL + this.options.iOSAppId);
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

  checkUpdate() {
    if (IS_ANDROID) {
      this._checkAndroidUpdate();
    } else {
      this._getAppStoreVersion();
    }
  }
}

export default AppUpgrade;
