const mainClassConfig = {
    mainColor: "mainColor",
    headerBgColor: "headerBgColor",
    titleColor: "titleColor",
    mainBackColor: "mainBackColor",
    borderColor: "borderColor",
    lightMainColor: "lightMainColor",
    lightBorder: "lightBorder",
    lightBakColor: "lightBakColor",
    veryLightBakColor: "veryLightBakColor",
    linearBackground: "linearBackground",
    sloganImage: "ctripSlogan",
};
const mainColorConfig = {
    mainColor: "#0086F6",
    headerBgColor: "#0086F6",
    mainBackColor: "#0086F6",
    titleColor: "#ffffff",
};
const main = {
    classConfig: mainClassConfig,
    colorConfig: mainColorConfig,
};
const bus = main;
const ColorConfig = {
    main: main,
    wx0e6ed4f51db9d078: main,
    wx1746b19d13d9bbe7: bus,
};

function colorConfigWithAppid(appid) {
    const appColorConfig = ColorConfig[appid] || {
        classConfig: {},
        colorConfig: {},
    };
    appColorConfig.classConfig = Object.assign(
        {},
        mainClassConfig,
        appColorConfig.classConfig
    );
    appColorConfig.colorConfig = Object.assign(
        {},
        mainColorConfig,
        appColorConfig.colorConfig
    );
    return appColorConfig;
}

export { ColorConfig, colorConfigWithAppid };
