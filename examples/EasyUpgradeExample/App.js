/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RNEasyUpgrade from 'react-native-easy-upgrade';

// const defaults = {
//   iOSAppLookupUrl: 'https://itunes.apple.com/lookup?id={0}',
//   downloadTitle: 'Download package',
//   downloadDescription: 'Packing downloading...',
//   downloadDestDirectory: DocumentDirectoryPath,
//   downloadApkName: 'newAppUpgrade.apk',
//   downloadApkEnd: path => RNEasyUpgrade.installApk(path),
//   shouldCheckApkHasDownloaded: true,
//   onError: () => {}
// };
const isAndroid = Platform.OS === 'android';

export default class App extends Component {

  componentDidMount() {
    this.easyUpgrade = new RNEasyUpgrade({
      iOSAppId: '12345678',
      downloadTitle: 'Download package',
      downloadDescription: 'Packing downloading...',
      downloadApkName: 'newAppUpgrade.apk',
      downloadApkEnd: () => {
        //eg: install apk
        this.easyUpgrade.installApk();
      },
      onError: err => {
        console.log('downloadApkError');
      }
    });
  }

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

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => this.checkUpgrade()}>
          <Text style={styles.welcome}>
            click to check upgrade
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10
  }
});
