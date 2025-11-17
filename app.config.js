export default {
  expo: {
    name: "Pixel Study Hub",
    slug: "pixel-study-helper",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#DEF"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.joseochoa.pixelstudyhelper",
      buildNumber: "1",
      requireFullScreen: false,
      infoPlist: {
        NSUserTrackingUsageDescription: "This app does not track users across apps or websites."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#DEF"
      },
      package: "com.joseochoa.pixelstudyhelper",
      versionCode: 1
    },
    web: {
      favicon: "./assets/favicon.svg"
    },
    extra: {
      eas: {
        projectId: "pixel-study-helper"
      }
    }
  }
};

