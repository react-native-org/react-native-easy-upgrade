import { NativeModules } from 'react-native';
const { RNEasyUpgrade } = NativeModules;

const normalizeFilePath = (path) => (path.startsWith('file://') ? path.slice(7) : path);

const getRequestConfig = (config, url) =>
  Object.assign(
    {},
    {
      downloadTitle: 'File Download',
      downloadDescription: url,
      saveAsName: 'Downloaded File - ' + new Date(),
      allowedInRoaming: true,
      allowedInMetered: true,
      showInDownloads: true,
      external: false,
      path: 'Download/'
    },
    config
  );

const download = (url = '', config = {}, headers = {}) => {
  const downloadRequestConfig = getRequestConfig(config, url);
  return new Promise((resolve, reject) => {
    RNEasyUpgrade.download(url, headers, downloadRequestConfig, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};

const queueDownload = (url = '', config = {}, headers = {}) => {
  const downloadRequestConfig = getRequestConfig(config, url);
  return new Promise((resolve, reject) => {
    RNEasyUpgrade.queueDownload(url, headers, downloadRequestConfig, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};

const attachOnCompleteListener = (downloadId = '') =>
  new Promise((resolve, reject) => {
    RNEasyUpgrade.attachOnCompleteListener(downloadId, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });

const cancel = (downloadId = '') =>
  new Promise((resolve, reject) => {
    RNEasyUpgrade.cancel(downloadId, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });

const checkStatus = (downloadId = '') =>
  new Promise((resolve, reject) => {
    RNEasyUpgrade.checkStatus(downloadId, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });

const isFileExists = path => {
  return RNEasyUpgrade.isFileExists(normalizeFilePath(path));
};

const deleteFile = path => {
  return RNEasyUpgrade.unlink(normalizeFilePath(path));
};

export {
  download,
  queueDownload,
  attachOnCompleteListener,
  cancel,
  checkStatus,
  isFileExists,
  deleteFile
}
