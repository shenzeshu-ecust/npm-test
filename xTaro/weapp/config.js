// 创建独立小程序时必须修改的配置项
let miniappConfig = {
    appId: 'wx0e6ed4f51db9d078', // 当前运行的小程序的APPID（独立小程序必须修改）
    mcdAppId: '5227', // MCD APPID（独立小程序必须修改）
    "useProtectComponent":false,
    extMcdAppId: '5003', // 用于请求获取 abtest 的 MCD APPID（独立小程序根据需求自行修改）微信主板小程序由于历史遗留原因，暂未从 5003 迁移到 5227
    systemCode: '30', // 用于生成 clientid（独立小程序必须修改）SystemCode申请文档 ( http://conf.ctripcorp.com/display/RDPlatform/MobileService+SystemCode )
    accesscode: 'XTHYY69RNSKLWEICHATMINI', // 授权登录接入识别码（独立小程序必须修改）
    tabbar: [ // 每一个Tab的首页，用来判断页面层级，请谨慎修改，必须按照 app.json 中 tabBar.list 的顺序排列（独立小程序按需修改）
        "pages/home/homepage",
        "pages/lvpai/lvpaiHome/lvpaiHome",
        "pages/implus/messageList/messageList",
        "pages/schedule/index/index",
        "pages/myctrip/index/index"
    ],
    cwxVersion: '1.0.59', // 更新日志地址：http://tripdocs.nfes.ctripcorp.com/tripdocs/book?dynamicDir=189&docId=1254
    version: '1.1.193', // 小程序的版本号，与 MCD 发布版本号保持一致
    cversion: '101.193',
    isTaroMix: true, // 是否使用 小程序原生 和 Taro 混合开发（是否接入了主板Taro解决方案）}
    authFloatInfo: {
      logo: "https://pages.c-ctrip.com/miniapp/basicprofile.png",
      name: "携程旅行订酒店机票火车汽车门票",
    }
}

module.exports = miniappConfig;
