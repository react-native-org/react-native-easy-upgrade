# react-native-easy-upgrade
Easy to upgrade your react-native app

## Getting started

`$ npm install react-native-easy-upgrade --save`

### Mostly automatic installation

`$ react-native link react-native-easy-upgrade`

### Manual installation
#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-easy-upgrade` and add `RNAppUpgrade.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNAppUpgrade.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
- Add `import com.newegg.higo.RNAppUpgradePackage;` to the imports at the top of the file
- Add `new RNAppUpgradePackage()` to the list returned by the `getPackages()` method

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
import RNAppUpgrade from 'react-native-easy-upgrade';

const appUpdate = new AppUpgrade({
  iOSAppId: '12345678',
  downloadTitle: '安装包下载',
  downloadDescription: '正在下载中',
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
  Toast("发现新版本，正在下载");
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
