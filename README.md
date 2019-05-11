# react-native-easy-upgrade
Easy to upgrade your react-native app

## Getting started

`$ npm install react-native-easy-upgrade --save`

### Mostly automatic installation

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

#### 2019-5-11 Note:

由于android7.0+提供了file provider权限控制，如果android7.0+机型需在主项目中使用file provider，否则将没有权限访问文件！详见demo AndroidManifest.xml及res/xml/provider_paths.xml.

## Usage

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

 async startUpgrade() {
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


