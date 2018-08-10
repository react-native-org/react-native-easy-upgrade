# react-native-easy-upgrade

简易的升级您的 `React Native` APP的版本（全新安装包安装）

## 起步

`$ npm install react-native-easy-upgrade --save`

### 自动安装

`$ react-native link react-native-easy-upgrade`

### 手动安装
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
## Usage

```javascript
import RNEasyUpgrade from 'react-native-easy-upgrade';

const appUpdate = new RNEasyUpgrade({
  iOSAppId: '12345678',
  downloadTitle: 'Download package',
  downloadDescription: 'Packing downloading...',
  downloadApkEnd: () => {
   //eg: install apk
   showSomething()
  },
  onError: () => {
    console.log('downloadApkError');
  }
});

// For Android
if (Platform.os === 'android') {
  Toast("New version an available! Downloading...");
  checkUpdateInfo();
  appUpdate.downloadApk(apkFilePath);
} else if (Platform.OS === 'ios'){
  appUpdate.checkAppVersionIOS()
  .then(versionInfo => {
    if(versionInfo.hasNewVersion){
      // Navigate to AppStore
      appUpdate.navigateToAppStore();
    }
  });
}
```
