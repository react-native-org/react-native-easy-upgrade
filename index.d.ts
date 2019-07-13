export interface Options {
	downloadApkName?: string;
	downloadDescription?: string;
	downloadDestDirectory?: string;
	downloadTitle?: string;
	iOSAppId?: string;
	iOSAppLookupUrl?: string;
	shouldCheckApkHasDownloaded?: boolean
	downloadApkEnd?: (url: string) => void;
	onError?: (err: string) => void;
}

export default class AppUpgrade {
	constructor(options: Options);
	downloadDestPath(): string;
	downloadDestDirectory(): string;
	downloading(): boolean;
	getNetworkStatus(): Promise<string>;
	getLocalVersionInfo(): {
		VERSION_CODE: number;
		VERSION_NAME: string;
	};
	checkApkHasDownloaded(path?: string): Promise<boolean>;
	checkAppVersionIOS(): Promise<{
		latestVersion: string;
		localVersion: string;
		hasNewVersion: boolean;
		trackViewUrl: string;
		lookupInfo: any;
	}>
	installApk(path?: string): void;
	navigateToAppStore(path: string): void;
	startAppUpdate(path: string, storeurl?: string): void;
}
