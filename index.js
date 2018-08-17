import { NativeModules, NetInfo, Platform } from 'react-native';
import { download, isFileExists } from './lib/downloadHelper';

const { RNEasyUpgrade } = NativeModules;

let jobId = -1;
const isAndroid = Platform.OS === 'android';

const VERSION_NAME = RNEasyUpgrade.versionName;
const VERSION_CODE = RNEasyUpgrade.versionCode;
const DEFAULT_DOWNLOAD_APK_NAME = `newVersion.apk`;

const DocumentDirectoryPath = isAndroid && RNEasyUpgrade.RNDocumentDirectoryPath;

const defaults = {
  iOSAppLookupUrl: 'https://itunes.apple.com/lookup?id={0}',
  downloadTitle: '下载更新包',
  downloadDescription: '新版本更新包下载中',
  downloadDestDirectory: DocumentDirectoryPath,
  downloadApkName: DEFAULT_DOWNLOAD_APK_NAME,
  downloadApkEnd: path => RNEasyUpgrade.installApk(path),
  shouldCheckApkHasDownloaded: true,
  onError: () => {}
};

class AppUpgrade {
  /**
   *
   * @param {object} options
   * @param {string} [options.iOSAppLookupUrl] 可选，ios检查更新的地址
   * @param {string} options.iOSAppId IOS的AppID
   */
  constructor(options) {
    this.options = Object.assign({}, defaults, options);
  }

  get downloadDestPath() {
    return this.options.downloadDestDirectory +  '/' + this.options.downloadApkName;
  }

  get downloadDestDirectory() {
    return this.options.downloadDestDirectory;
  }

  get downloading() {
    return jobId > -1;
  }

  _handleError(err) {
    console.log('downloadApkError', err);
    this.options.onError(err);
  }

  getNetworkStatus() {
    return new Promise(async resolve => {
      NetInfo.fetch().done(resolve);
    });
  }

  getLocalVersionInfo() {
    return { VERSION_NAME, VERSION_CODE };
  }

  checkApkHasDownloaded = async (path = this.downloadDestPath) => {
    return await isFileExists(path);
  };

  /**
   * update app and install
   * @param apkUrl
   */
  updateAndroidApp(apkUrl) {
    if (this.downloading) {
      return;
    }

    const tempDownloadApkName = 'temp_download.apk';
    const tempDownloadPath = this.downloadDestDirectory + '/' + tempDownloadApkName;

    const downloadConf = {
      downloadTitle: this.options.downloadTitle,
      downloadDescription: this.options.downloadDescription,
      saveAsName: this.options.shouldCheckApkHasDownloaded ? tempDownloadApkName : this.options.downloadApkName,
      allowedInRoaming: true,
      allowedInMetered: true,
      showInDownloads: true,
      external: true, //when false basically means use the default Download path
      path: this.downloadDestDirectory //if "external" is true then use this path
    };
    jobId = 1;
    download(apkUrl, downloadConf)
      .then(async res => {
        jobId = -1;
        if (this.options.shouldCheckApkHasDownloaded) {
          await RNEasyUpgrade.moveFile(tempDownloadPath, this.downloadDestPath);
        }
        this.options.downloadApkEnd(this.downloadDestPath);
      })
      .catch(err => {
        console.log(err);
        jobId = -1;
        this._handleError(err);
      });
  }

  installApk(apkPath = this.downloadDestPath) {
    console.log(apkPath);
    RNEasyUpgrade.installApk(apkPath);
  }

  /**
   * Check the ios app version info from app store.
   */
  async checkAppVersionIOS() {
    if (!this.options.iOSAppId) {
      throw new Error('Must provide iOSAppId.');
    }
    const iosCheckVersionUrl = (this.options.iOSAppLookupUrl || '').replace(/\{0\}/g, this.options.iOSAppId);
    const data = await fetch(iosCheckVersionUrl).then(res => res.json());
    const result = ((data || {}).results || [])[0] || {};
    const latestVersion = result.version;
    const localVersion = VERSION_NAME;
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
    RNEasyUpgrade.openURL(trackViewUrl || this.trackViewUrl);
  }

  startAppUpdate(apkUrl, appStoreUrl = this.trackViewUrl) {
    if (isAndroid) {
      if (this.options.shouldCheckApkHasDownloaded) {
        this.checkApkHasDownloaded().then(async hasDownloaded => {
          if (hasDownloaded) {
            this.options.downloadApkEnd(this.downloadDestPath);
          } else {
            this.updateAndroidApp(apkUrl);
          }
        });
      } else {
        this.updateAndroidApp(apkUrl);
      }
    } else {
      this.navigateToAppStore(appStoreUrl);
    }
  }
}

export default AppUpgrade;
