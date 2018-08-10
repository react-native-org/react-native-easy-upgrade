
#import "RNEasyUpgrade.h"
#import <UIKit/UIKit.h>

@interface RNEasyUpgrade()

@property (nonatomic, strong) NSString *versionName;
@property (nonatomic, strong) NSString *versionCode;

@end

@implementation RNEasyUpgrade

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}
RCT_EXPORT_MODULE()

- (instancetype)init {
    self = [super init];
    if (self) {
        _versionName = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleShortVersionString"];
        _versionCode = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleVersion"];
    }
    return self;
}

- (NSDictionary *)constantsToExport {
    return @{
             @"versionName":_versionName,
             @"versionCode":_versionCode,
             };
}

RCT_EXPORT_METHOD(openURL:(nonnull NSString *)trackViewURL) {
    UIApplication *application = [UIApplication sharedApplication];
    NSURL *URL = [NSURL URLWithString:trackViewURL];

    if ([application respondsToSelector:@selector(openURL:options:completionHandler:)]) {
        [application openURL:URL options:@{} completionHandler:nil];
    } else {
        [application openURL:URL];
    }
}

@end
