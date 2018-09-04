# React-Native-Easy-Upgrade

> A simple `React Native` upgrade component.

### Getting started

`$ npm install react-native-easy-upgrade --save`

### Mostly automatic installation

`$ react-native link react-native-easy-upgrade`

### Manual installation
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
### Usage

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
### Config

config | iOS  | Android | isRequired | default | details
------ | ---- | ------- | --- | --- |----
iOSAppLookupUrl | OK | - | NO| AppStore Url| iOSAppLookupUrl
iOSAppId | OK | - | YES | - | iOSAppId
shouldCheckApkHasDownloaded | - | OK | NO | true | whether to check local has downloaded apk file
downloadTitle | - | OK | NO | 下载更新包 | download manager title
downloadDescription | - | OK | NO | 新版本更新包下载中 | download manager description
downloadDestDirectory | - | OK | NO | DocumentDirectoryPath | downloaded apk directory
downloadApkName | - | OK | NO | newVersion.apk | downloaded apk name
downloadApkEnd | - | OK | YES | - | download apk end callback
onError | - | OK | NO | - | error callback

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

- none - device is offline
- wifi - device is online and connected via wifi, or is the iOS simulator
- cellular - device is connected via Edge, 3G, WiMax, or LTE
- unknown - error case and the network status is unknown
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


