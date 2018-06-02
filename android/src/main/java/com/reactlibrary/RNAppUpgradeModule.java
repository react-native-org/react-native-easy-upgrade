
package com.reactlibrary;

import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

public class RNAppUpgradeModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;
    private String versionName = "1.0.0";
    private int versionCode = 1;

    public RNAppUpgradeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
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
        return "RNAppUpgrade";
    }

    @Override
    public Map<String, Object> getConstrants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("versionName", versionName);
        constants.put("versionCode", versionCode);
        return constants;
    }

    @ReactMethod
    public void installApk(String apkPath) {
        String changeModCommand = "chmod 777 " + apkPath;
        try {
            Runtime.getRuntime().exec(cmd);
        } catch (Exception e) {
            e.printStackTrace();
        }
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        intent.setDataAndType(Uri.parse("file://" + apkPath), "application/vnd.android.package-archive");
        this.getCurrentActivity().startActivity(intent);
    }
}
