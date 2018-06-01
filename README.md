# react-native-appupgrade
Easy to upgrade your react-native app

## Getting started

`$ npm install @hm910705/react-native-appupgrade --save`

### Mostly automatic installation

`$ react-native link @hm910705/react-native-app-upgrade`

### Manual installation
#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-app-upgrade` and add `RNAppUpgrade.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNAppUpgrade.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
- Add `import com.reactlibrary.RNAppUpgradePackage;` to the imports at the top of the file
- Add `new RNAppUpgradePackage()` to the list returned by the `getPackages()` method

2. Append the following lines to `android/settings.gradle`:
```
include ':react-native-app-upgrade'
project(':react-native-app-upgrade').projectDir = new File(rootProject.projectDir,   '../node_modules/react-native-app-upgrade/android')
```

3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
```
  compile project(':react-native-app-upgrade')
```


## Usage
```javascript
import RNAppUpgrade from '@hm910705/react-native-appupgrade';
const appUpdate = new AppUpgrade({
      iOSAppId: '11111111',
      downloadApkSavePath: '', // if not set, default is data/newApp.apk
      needUpdateApp: needUpdate => {
        Alert.alert('提示', '发现新版本，是否更新?', [
          { text: '取消', onPress: () => {} },
          { text: '更新', onPress: () => needUpdate(true) }
        ]);
      },
      downloadApkStart: () => {
        console.log('Start');
      },
      downloadApkProgress: progress => {
        console.log(`Downloading ${progress}%...`);
      },
      downloadApkEnd: needUpdate => {
        Alert.alert('提示', '发现新版本，是否直接安装?', [
          { text: '取消', onPress: () => {} },
          { text: '安装', onPress: () => needUpdate(true) }
        ]);
      },
      onError: () => {
        console.log('downloadApkError');
      }
    });

#### Android
###### step 1 check should update
     you can get the local App version status like this,include `versionName` and `versionCode`
	const version = appUpdate.getLocalVersion()
###### step 2 check network and download the new apk
	you can get the NetworkStatus like this
	const networkStatus = await appUpdate.getNetworkStatus()
###### step 3 update app
    // if is Android
    appUpdate.updateAndroidApp(apkUrl);
#### iOS
    // if is iOS
    appUpdate.updateiOSApp();

RNAppUpgrade;
```
