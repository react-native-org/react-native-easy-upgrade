#  React-Native-Easy-Upgrade

> 一个简单的 `React Native` App 引导更新组件。

### 开始

`$ npm install react-native-easy-upgrade --save`

### 自动链接仓库

`$ react-native link react-native-easy-upgrade`

### 手动链接仓库
#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-easy-upgrade` and add `RNEasyUpgrade.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNEasyUpgrade.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
- Add `import org.hstar.reactnative.easyupgrade.RNEasyUpgradePackage;` to the imports at the top of the file
- Add `new RNEasyUpgradePackage()` to the list returned by the `getPackages()` method

2. Append the following lines to `android/settings.gradle`:
```
include ':react-native-easy-upgrade'
project(':react-native-easy-upgrade').projectDir = new File(rootProject.projectDir,   '../node_modules/react-native-easy-upgrade/android')
```

3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
```
  compile project(':react-native-easy-upgrade')
```

### 使用方式

#### 1.Init easyUpgrade componet

```javascript
import RNEasyUpgrade from 'react-native-easy-upgrade';

this.easyUpgrade = new RNEasyUpgrade({
  iOSAppId: '12345678',
  downloadTitle: 'Download package',
  downloadDescription: 'Packing downloading...',
  downloadApkEnd: () => {
   //eg: install apk
    this.easyUpgrade.installApk();
  },
  onError: () => {
    console.log('downloadApkError');
  }
});

```
### 配置

配置 | iOS  | Android | isRequired | default | 详情
------ | ---- | ------- | --- | --- |----
iOSAppLookupUrl | OK | - | NO| AppStore Url| iOSAppLookupUrl
iOSAppId | OK | - | YES | - | iOSAppId
shouldCheckApkHasDownloaded | - | OK | NO | true | 下载之前是否进行check，防止重复下载
downloadTitle | - | OK | NO | 下载更新包 | 任务栏下载标题
downloadDescription | - | OK | NO | 新版本更新包下载中 | 任务栏下载描述
downloadDestDirectory | - | OK | NO | DocumentDirectoryPath| 下载Apk文件目录
downloadApkName | - | OK | NO | newVersion.apk | 下载Apk文件名称
downloadApkEnd | - | OK | YES | - | 下载完成回调
onError | - | OK | NO | - | 下载出错回调

#### 2.Get upgrade info

```javascript
  async getUpdateInfo() {
    let updateInfo = {
      latestVersion: '3.0.0',
      hasNewVersion: true,
      apkUrl: 'http://{remoteApkDownloadUrl}'
    };
    if (isAndroid) {
      updateInfo = await fetch('http://{remoteUrl}/updateInfo.json')
    } else {
      updateInfo = await this.easyUpgrade.checkAppVersionIOS()
    }
    return updateInfo;
  }
```
#### 3.Start upgrade

```javascript
 async checkUpgrade() {
    const updateInfo = await this.getUpdateInfo();
    if (updateInfo.hasNewVersion) {
      Alert.alert(
        'Find a new version: ' + updateInfo.latestVersion,
        'Whether to upgrade app?',
        [
          {text: 'Ask me later', onPress: () => console.log('Ask me later pressed')},
          {text: 'Upgrade', onPress: () => this.easyUpgrade.startAppUpdate(updateInfo.apkUrl)},
        ],
      )
    }
  }
```
### More Details Please watch this example:
[example](https://github.com/react-native-org/react-native-easy-upgrade/tree/master/examples)

### Other Utils

### 1.getNetworkStatus()

Gets the Network status.

**Examples**

```js
const networkStatus = appUpgrade.getNetworkStatus();

```
**Notes**

- none - 设备处于离线状态

- wifi - 设备通过wifi联网，或者设备是iOS模拟器
- cellular - 设备通过蜂窝数据流量联网
- unknown - 联网状态异常

---
### 2.getLocalVersionInfo()

Gets the localVersion info.

**Examples**
```js
const localVersionInfo = appUpgrade.getLocalVersionInfo();

```
**Notes**
```js
localVersionInfo {
  versionName: '',
  versionCode: ''
}
```
### 3.installApk()
Install apk.

### 4.navigateToAppStore
Navigates to iOS AppStore


