import { NativeModules, NetInfo, Platform } from 'react-native';
import ReactNativeFS from 'react-native-fs';

const { RNAppUpgrade } = NativeModules;

let jobId = -1;

const defaults = {
  iosAppLookupUrl: 'https://itunes.apple.com/lookup?id={0}',
  downloadDestPath: `${ReactNativeFS.DocumentDirectoryPath}/Temp_App${RNAppUpgrade.versionName}.apk`
};

class AppUpgrade {
  /**
   *
   * @param {object} options
   * @param {string} [options.iosAppLookupUrl] 可选，ios检查更新的地址
   * @param {string} options.iosAppId IOS的AppID
   */
  constructor(options) {
    this.options = Object.assign({}, defaults, options);
  }

  get downloadDestPath() {
    return this.options.downloadDestPath;
  }

  get downloading() {
    return jobId > -1;
  }

  progress = (data) => {
    const percentage = (100 * data.bytesWritten / data.contentLength) | 0;
    this.options.downloadApkProgress && this.options.downloadApkProgress(percentage);
  }

  begin = () => {
    this.options.downloadApkStart && this.options.downloadApkStart();
  };

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

    const ret = ReactNativeFS.downloadFile({
      fromUrl: apkUrl,
      toFile: this.downloadDestPath,
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
          this.options.downloadApkEnd(this.downloadDestPath);

        jobId = -1;
      })
      .catch(err => {
        this._handleError(err);

        jobId = -1;
      });
  }

  installApk() {
    RNAppUpgrade.installApk(this.downloadDestPath);
  }

  /**
   * Check the ios app version info from app store.
   */
  async checkAppVersionIOS() {
    if (!this.options.iosAppId) {
      throw new Error('Must provide iosAppId.');
    }
    const iosCheckVersionUrl = (this.options.iosAppLookupUrl || '').replace(/\{0\}/g, this.options.iosAppId);
    const data = await fetch(iosCheckVersionUrl).then(res => res.json());
    const result = ((data || {}).results || [])[0] || {};
    const latestVersion = result.version;
    const localVersion = RNAppUpgrade.versionName;
    this.trackViewUrl = result.trackViewUrl;
    const hasNewVersion = latestVersion !== localVersion; // 简单认为，版本号不一致就是有新版本
    return {
      latestVersion,
      localVersion,
      hasNewVersion,
      trackViewUrl: this.trackViewUrl,
      lookupInfo: result
    };
  }

  /**
   * navigate to app store download page.
   * @param {string} [trackViewUrl] [Optional] The app download page
   */
  navigateToAppStore(trackViewUrl) {
    RNAppUpgrade.openURL(trackViewUrl || this.trackViewUrl);
  }
}

export default AppUpgrade;
