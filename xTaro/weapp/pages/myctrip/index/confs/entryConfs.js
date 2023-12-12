const PIC_COMMON_PATH = 'https://images4.c-ctrip.com/target/';
const PROD_DOMAIN = 'https://m.ctrip.com/';

const ENTRY_INFOS = {
    "mobileSearchListData": {
        "entryUrl": "/pages/myctrip/list/mobilesearchlist/mobilesearchlist",
        "id": "c_click_list_mobile",
        "metricId": "手机查单入口"
    },
    "avatar": {
        "defaultImgUrl": "",
        "entryUrl": `${PROD_DOMAIN}webapp/h5myinfo/myinfo?isHideHeader=true`,
        "id": "c_click_myctrip_avatar",
        "metricId": "头像"
    },
    "vipLevel": {
        "title": "普通会员",
        "entryUrl": `${PROD_DOMAIN}webapp/member/growup?isHideNavBar=YES`,
        "id": "c_click_member_center",
        "metricId": "会员",
        "isShow": true
    },
    "toVerify": {
        "title": "去实名",
        "entryUrl": "/pages/wallet/setrealname/index?pageSource=ctripwechatmini_ctriphome",
        "id": "c_click_user_verify",
        "isShow": true,
        "metricId": "去实名"
    },
    "userVerify": {
        "title": "已认证",
        "entryUrl": "/pages/wallet/setrealname/index?pageSource=ctripwechatmini_ctriphome",
        "id": "c_click_user_verify",
        "isShow": true,
        "metricId": "已认证"
    },
    "favorite": {
        "title": "我的收藏",
        "entryUrl": `${PROD_DOMAIN}webapp/favorite/index`,
        "id": "c_click_favorite",
        "isShow": true,
        "metricId": "我的收藏"
    },
    "point": {
        "title": "积分",
        "entryUrl": "/pages/market/signIn/index?activityid=wechat_signin_activity",
        "id": "c_click_myctrip_coins",
        "isShow": true,
        "metricId": "积分"
    },
    "coupon": {
        "title": "优惠券",
        "entryUrl": "/pages/market/promocode/index/index",
        "id": "c_click_coupon",
        "isShow": true,
        "metricId": "优惠券"
    },
    "setting": {
        "title": "设置",
        "entryUrl": "/cwx/component/messageRecommend/index",
        "id": "c_click_myctrip_setup",
        "needLogin": false,
        "metricId": "设置"
    },
    "signIn": {
        "title": "签到",
        "entryUrl": "/pages/market/signIn/index?activityid=wechat_signin_activity",
        "id": "c_click_sign_in",
        "needLogin": true,
        "metricId": "签到"
    },
    "userHome": {
        "title": "个人主页",
        "entryUrl": `${PROD_DOMAIN}webapp/you/tripshoot/user/home?seo=0&isHideHeader=true&isHideNavBar=YES&isMini=2`,
        "id": "c_click_myctrip_shequ",
        "needLogin": true,
        "metricId": "个人主页"
    },
    "orders": [
        {
            "title": "全部订单",
            "iconUrl": `${PIC_COMMON_PATH}0zc16120008iiysyt68E1.png`,
            "entryUrl": "../list/list",
            "newEntryUrl": "../taro/list/list",
            "id": "all",
            "metricId": "全部订单"
        },
        {
            "title": "待付款",
            "iconUrl": `${PIC_COMMON_PATH}0zc63120008iiyq8w59EC.png`,
            "entryUrl": "../list/list",
            "newEntryUrl": "../taro/list/list?data={\"id\":\"unPaid\"}",
            "id": "unpaid",
            "metricId": "待付款"
        },
        {
            "title": "未出行",
            "iconUrl": `${PIC_COMMON_PATH}0zc47120008iiymuwBCB3.png`,
            "entryUrl": "../list/list",
            "newEntryUrl": "../taro/list/list?data={\"id\":\"unTravel\"}",
            "id": "untravel",
            "metricId": "未出行"
        },
        {
            "title": "待点评",
            "iconUrl": `${PIC_COMMON_PATH}0zc0l120008iiytvu2348.png`,
            "entryUrl": "../list/list",
            "newEntryUrl": "../taro/list/list?data={\"id\":\"unReview\"}",
            "id": "unreview",
            "metricId": "待点评"
        }
    ],
    "activityCenter": [],
    "activityCenterMore": {},
    "activityCenterTitle": "",
    "tools": [
        {
            "title": "我的奖品",
            "iconUrl": `${PIC_COMMON_PATH}0zc231200088kcuaa0797.png`,
            "entryUrl": "https://contents.ctrip.com/huodong/myprize/index",
            "id": "c_click_myctrip_mkt",
            "needLogin": true,
            "metricId": "我的奖品"
        },
        {
            "title": "航班助手",
            "iconUrl": `${PIC_COMMON_PATH}0zc221200088kcp06910E.png`,
            "entryUrl": "/pages/flightschedule/pages/detail/detail?origin=104",
            "id": "c_click_flight_schedule",
            "needLogin": true,
            "metricId": "航班助手"
        },
        {
            "title": "手机查单",
            "iconUrl": `${PIC_COMMON_PATH}0zc71120008qefc30505B.png`,
            "entryUrl": "/pages/myctrip/list/mobilesearchlist/mobilesearchlist",
            "id": "c_click_tool_list_mobile",
            "needPhoneLogin": true,
            "metricId": "手机查单"
        },
        {
            "title": "我的钱包",
            "iconUrl": "https://pic.c-ctrip.com/platform/h5/mini_programe/paywallet.png",
            "entryUrl": 'https://secure.ctrip.com/webapp/paywallet/wechatminimywallet?sceneid=wechatmini_myctrip',
            "id": "c_click_myctrip_paywallet",
            "needLogin": true,
            "metricId": "我的钱包"
        },
        {
            "title": "借钱",
            "iconUrl": "https://pic.c-ctrip.com/platform/h5/mini_programe/jieqian.png",
            "entryUrl": "/pages/webView/index?mktype=c_mini_mytrip",
            "appId": "wx637a5185157f1c60",
            "id": "c_click_myctrip_jieqian",
            "needLogin": true,
            "metricId": "借钱"
        },
        {
            "title": "旅行足迹",
            "iconUrl": `${PIC_COMMON_PATH}0zc611200088kbdsz32DC.png`,
            "entryUrl": `${PROD_DOMAIN}webapp/mytravels/travelsforactivity?source=myctrip`,
            "id": "c_click_wxmp_my_travels",
            "needLogin": true,
            "metricId": "旅行足迹"
        },
        {
            "title": "关注公众号",
            "iconUrl": "https://pic.c-ctrip.com/platform/h5/mini_programe/mp.png",
            "entryUrl": "https://mp.weixin.qq.com/s/xIxkRbYIEB8cMmFZmoReYA",
            "id": "c_click_mp",
            "needLogin": false,
            "metricId": "关注公众号"
        }
    ],
    "businessLicense": {
        "title": "营业执照",
        "entryUrl": `${PROD_DOMAIN}webapp/mytravels/travelsforactivity?source=myctrip`,
        "id": "c_click_business_license",
        "metricId": "营业执照",
        "isShow": true
    }
};

export default ENTRY_INFOS;
export {
    PIC_COMMON_PATH
};