
package org.hstar.reactnative.easyupgrade;

import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;

import android.os.Build;
import android.os.Environment;
import android.support.v4.content.FileProvider;
import android.support.v4.util.LongSparseArray;
import android.util.Log;
import com.facebook.react.bridge.*;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public class RNEasyUpgradeModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;
    private String versionName = "1.0.0";
    private int versionCode = 1;

    private EasyDownloadManager downloader;
    private LongSparseArray<Callback> appDownloads;

    private static final String RNDocumentDirectoryPath = "RNDocumentDirectoryPath";
    private static final String RNExternalStorageDirectoryPath = "RNExternalStorageDirectoryPath";
    private static final String RNPicturesDirectoryPath = "RNPicturesDirectoryPath";
    private static final String RNTemporaryDirectoryPath = "RNTemporaryDirectoryPath";
    private static final String RNCachesDirectoryPath = "RNCachesDirectoryPath";
    private static final String RNExternalCachesDirectoryPath = "RNExternalCachesDirectoryPath";

    public RNEasyUpgradeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;

        downloader = new EasyDownloadManager(reactContext);
        appDownloads = new LongSparseArray<>();
        IntentFilter filter = new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE);
        reactContext.registerReceiver(downloadReceiver, filter);

        try {
            PackageInfo pInfo = reactContext.getPackageManager().getPackageInfo(reactContext.getPackageName(), 0);
            versionName = pInfo.versionName;
            versionCode = pInfo.versionCode;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
    }

    @Override
    public String getName() {
        return "RNEasyUpgrade";
    }


    BroadcastReceiver downloadReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            try {
                long downloadId = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
                if (appDownloads.indexOfKey(downloadId) >= 0) {
                    WritableMap downloadStatus = downloader.checkDownloadStatus(downloadId);
                    Callback downloadOnDoneCb = appDownloads.get(downloadId);

                    if (downloadStatus.getString("status").equalsIgnoreCase("STATUS_SUCCESSFUL")) {
                        downloadOnDoneCb.invoke(null, downloadStatus);
                    } else {
                        downloadOnDoneCb.invoke(downloadStatus, null);
                    }
                    appDownloads.remove(downloadId);
                }

            } catch (Exception e) {
                Log.e("RN_DOWNLOAD_MANAGER", Log.getStackTraceString(e));
            }
        }
    };


    @ReactMethod
    public void download(String url, ReadableMap headers, ReadableMap config, Callback onDone) {
        try {
            DownloadManager.Request request = downloader.createRequest(url, headers, config);
            long downloadId = downloader.queueDownload(request);
            appDownloads.put(downloadId, onDone);
        } catch (Exception e) {
            onDone.invoke(e.getMessage(), null);
        }
    }

    @ReactMethod
    public void queueDownload(String url, ReadableMap headers, ReadableMap config, Callback onStart) {
        try {
            DownloadManager.Request request = downloader.createRequest(url, headers, config);
            long downloadId = downloader.queueDownload(request);
            onStart.invoke(null, String.valueOf(downloadId));
        } catch (Exception e) {
            onStart.invoke(e.getMessage(), null);
        }
    }

    @ReactMethod
    public void attachOnCompleteListener(String downloadId, Callback onComplete) {
        try {
            long dloadId = Long.parseLong(downloadId);
            appDownloads.put(dloadId, onComplete);
            WritableMap status = downloader.checkDownloadStatus(Long.parseLong(downloadId));
            ArrayList<String> alreadyDoneStatuses = new ArrayList<>(Arrays.asList("STATUS_SUCCESSFUL", "STATUS_FAILED"));
            String currentStatus = status.getString("status");
            if (alreadyDoneStatuses.contains(currentStatus)) {
                appDownloads.remove(dloadId);
                onComplete.invoke(null, status);
            }
        } catch (Exception e) {
            onComplete.invoke(e.getMessage(), null);
        }
    }


    @ReactMethod
    public void cancel(String downloadId, Callback onCancel) {
        try {
            downloader.cancelDownload(Long.parseLong(downloadId));
            onCancel.invoke(null, downloadId);
        } catch (Exception e) {
            onCancel.invoke(e.getMessage(), null);
        }
    }

    @ReactMethod
    public void checkStatus(String downloadId, Callback onStatus) {
        try {
            WritableMap status = downloader.checkDownloadStatus(Long.parseLong(downloadId));
            onStatus.invoke(null, status);
        } catch (Exception e) {
            onStatus.invoke(e.getMessage(), null);
        }
    }

    @ReactMethod
    public void isFileExists(String filepath, Promise promise) {
        try {
            File externalStorageDirectory = Environment.getExternalStorageDirectory();
            if (externalStorageDirectory != null && !filepath.contains(externalStorageDirectory.getAbsolutePath())) {
                filepath = externalStorageDirectory.getAbsolutePath() + filepath;
            }
            File file = new File(filepath);
            promise.resolve(file.exists());
        } catch (Exception ex) {
            ex.printStackTrace();
            reject(promise, filepath, ex);
        }
    }

    private void rejectFileNotFound(Promise promise, String filepath) {
        promise.reject("ENOENT", "ENOENT: no such file or directory, open '" + filepath + "'");
    }


    private void reject(Promise promise, String filepath, Exception ex) {
        if (ex instanceof FileNotFoundException) {
            rejectFileNotFound(promise, filepath);
            return;
        }

        promise.reject(null, ex.getMessage());
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();

        constants.put("versionName", versionName);
        constants.put("versionCode", versionCode);

        constants.put(RNDocumentDirectoryPath, this.getReactApplicationContext().getFilesDir().getAbsolutePath());
        constants.put(RNTemporaryDirectoryPath, this.getReactApplicationContext().getCacheDir().getAbsolutePath());
        constants.put(RNPicturesDirectoryPath, Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES).getAbsolutePath());
        constants.put(RNCachesDirectoryPath, this.getReactApplicationContext().getCacheDir().getAbsolutePath());

        File externalStorageDirectory = Environment.getExternalStorageDirectory();
        if (externalStorageDirectory != null) {
            constants.put(RNExternalStorageDirectoryPath, externalStorageDirectory.getAbsolutePath());
        } else {
            constants.put(RNExternalStorageDirectoryPath, null);
        }


        File externalCachesDirectory = this.getReactApplicationContext().getExternalCacheDir();
        if (externalCachesDirectory != null) {
            constants.put(RNExternalCachesDirectoryPath, externalCachesDirectory.getAbsolutePath());
        } else {
            constants.put(RNExternalCachesDirectoryPath, null);
        }

        return constants;
    }


    @ReactMethod
    public void installApk(String apkPath) {
        String changeModCommand = "chmod 777 " + apkPath;
        try {
            Runtime.getRuntime().exec(changeModCommand);
        } catch (Exception e) {
            e.printStackTrace();
        }

        Intent intent = new Intent(Intent.ACTION_VIEW);
        // 由于没有在Activity环境下启动Activity,设置下面的标签
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        // 对于安卓的path补全
        File externalStorageDirectory = Environment.getExternalStorageDirectory();
        if (externalStorageDirectory != null && !apkPath.contains(externalStorageDirectory.getAbsolutePath())) {
            apkPath = externalStorageDirectory.getAbsolutePath() + apkPath;
        }
        File apkFile = new File(apkPath);
        if (Build.VERSION.SDK_INT >= 23) {
            Uri contentUri = FileProvider.getUriForFile(reactContext, reactContext.getPackageName() + ".provider", apkFile);
            //添加这一句表示对目标应用临时授权该Uri所代表的文件
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.setDataAndType(contentUri, "application/vnd.android.package-archive");
        } else {
            intent.setDataAndType(Uri.fromFile(apkFile), "application/vnd.android.package-archive");
        }

        this.getCurrentActivity().startActivity(intent);
    }
}
