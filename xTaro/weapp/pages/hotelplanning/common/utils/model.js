/** *************
 * 下面的服务列表请保持对齐
 * 左边的服务名一律全小写
 ************/

import { _ } from "../../../../cwx/cwx.js";

const netServiceList = ["10398", "11126", "11754"];

// 测试子环境设置
let isTest = false;
let fatEnv = "fat2";
try {
	const configSubEnv = wx.getStorageSync("P_HOTEL_TEST_SUB_ENV");
	if (configSubEnv && configSubEnv !== "default") {
		if (configSubEnv === "fws") {
			isTest = false;
		} else {
			isTest = true;
			fatEnv = configSubEnv;
		}
	}
} catch (e) {
	// ignore
}
// 堡垒测试参数
let isBastion = false;
try {
	isBastion = wx.getStorageSync("P_HOTEL_BASTION_TEST") === "1";
} catch (e) {
	// ignore
}
const baseurl = {
	/* 24812: {AppID: 100038156, Description: 小程序SOA接口新版} */
	h5switchresult: "/restapi/soa2/24812/getH5SwitchResult", // 开关配置
	getCouponList: "/restapi/soa2/24812/getCouponList", // 获取优惠券列表
	getCouponById: "/restapi/soa2/24812/getCouponById", // 领券
	wifiHome: "/restapi/soa2/24812/wifiHome", // ebk维护的wifi列表
	SmzGetModuleListV3: "/restapi/soa2/24812/getModuleList", // 落地页大接口
	getUnionVipEntity: "/restapi/soa2/24812/GetUnionVipEntity",
	guestServiceList: "/restapi/soa2/24812/guestServiceList", //宾客服务
	getShuttleCar: "/restapi/soa2/24812/getShuttleCar", // wifi连接页租车模块
	getNearbySight: "/restapi/soa2/24812/getNearbySight", // wifi连接页附近景点门票
	getWifiConnectModules: "/restapi/soa2/24812/getWifiConnectModules", // wifi连接页模块展示配置
	wifiError: "/restapi/soa2/24812/wifiError",
	getWeComQrCode: "/restapi/soa2/24812/getWeComQrCode",
	esportsRoom: "/restapi/soa2/24812/EsportsRoom", // 电竞房服务
	restaurantProductInfoList: "/restapi/soa2/24812/restaurantProductInfoList", // 客房点单
	getRoomVendingReward: "/restapi/soa2/24812/getRoomVendingReward",
	getThirdPartyUrl: "/restapi/soa2/24812/GetThirdPartyUrl", // 联合会员落地页第三方供应商授权服务
	getGroupEntryQrCode: "/restapi/soa2/24812/GetGroupEntryQrCode", // 获取平台企微二维码
	unionVipPushReceivedMessage: "/restapi/soa2/24812/UnionVipPushReceivedMessage", // 用户订阅消息推送
    recordWifiConnectSuc: "/restapi/soa2/24812/RecordWifiConnectSuc", // 连接成功的wifi绑定码的key
	matchPmsOrderInfo: "/restapi/soa2/24812/MatchPmsOrderInfo", // 去呼呼渠道
    recordQrCodeNearbyWifi: "/restapi/soa2/24812/RecordQrCodeNearbyWifi", // 记录安卓附近WIFI与ebk维护WIFI交集
    updateEbkWifi: "/restapi/soa2/24812/UpdateEbkWifi", // 更新wifi密码
	getWechatUrl: "/restapi/soa2/24812/getWechatUrl", // 路由中转页获取页面地址
    putinvoiceinfo: "/restapi/soa2/24812/PutInvoiceInfo", // 开发票
    getAbTestVersion: "/restapi/soa2/24812/GetAbTestVersion", // 获取AB实验结果
    createHotelSuggestion: "/restapi/soa2/24812/CreateHotelSuggestion", // 吐槽反馈
    sendShortMessage: "/restapi/soa2/24812/SendShortMessage", // 发送短信引导平台新客下载app

    /* 14160: {AppID: 100012416, Description: 小程序SOA接口} */
	videoRoom: "/restapi/soa2/14160/videoRoom", // 小帅影音房授权接口,等后期没有流量之后删掉
  
    /* 18119: {AppID: 100023407, Description: 砍价} */
	getHomeInfo: "/restapi/soa2/18119/cuthomeinfo", // 砍价首页大接口
	cutpriceswitchresult: "/restapi/soa2/18119/getH5SwitchResult",
	assistCutPrice: "/restapi/soa2/18119/assistCutPrice",
	createCut: "/restapi/soa2/18119/createcutpriceaction", // 创建砍价单
	cutPriceVerifyToken: "/restapi/soa2/18119/cutPriceVerifyToken", // 砍价风控校验
	userBrowseRecord: "/restapi/soa2/18119/userBrowseRecord", // 砍价商化记录用户浏览
	getSwitch: "/restapi/soa2/18119/getH5SwitchResult",
	assistingCutPriceList: "/restapi/soa2/18119/assistingCutPriceList", //获取助力列表
	assistingAvatarCarousel: "/restapi/soa2/18119/assistingAvatarCarousel", //获取轮播助力用户信息
	assistcheckpoint: "/restapi/soa2/18119/assistcheckpoint", //开启新关卡
	getHotelABTest:"/restapi/soa2/18119/getHotelABTest", //拿服务端AB结果
	assistingWeWorkWelfare: "/restapi/soa2/18119/assistingWeWorkWelfare",
	receiveAssistingWeWorkWelfare: "/restapi/soa2/18119/receiveAssistingWeWorkWelfare",
	assistNotice: "/restapi/soa2/18119/assistNotice",

	/* 14605: {AppID: 100014036, Description: H5 Java API接口} */
	timezone: "/restapi/soa2/14605/timezone",
	newhotellist: "/restapi/soa2/14605/getHotelList",
	hotelswitch: "/restapi/soa2/14605/getswitch",
	gethoteldetail: "/restapi/soa2/14605/gethoteldetail",
	getSessionKey: "/restapi/soa2/14605/getSessionKey",
	getdestination: "/restapi/soa2/14605/getdestination",
	cityList: "/restapi/soa2/14605/cityList",
	getHolidays: "/restapi/soa2/14605/getHolidays",
	batchreceivecoupon: "/restapi/soa2/14605/batchreceivecoupon", // 批量领券

    /* 18518: {AppID: 100022864, Description: 联合会员} */
	smzReceiveUnionVip: "/restapi/soa2/18518/smzReceiveUnionVip", // 领卡
	roomVendingRecord: "/restapi/soa2/18518/roomVendingRecord", // 自动售货机
	roomVendingSupplierConfig: "/restapi/soa2/18518/roomVendingSupplierConfig",
	getHotelMallProductList: "/restapi/soa2/18518/getHotelMallProductList", // 酒店美食店内套餐
	groupArticleInfoListGet: "/restapi/soa2/18518/groupArticleInfoListGet", // 达人探店
  
    /* 22370: {AppID: 100032236, Description: 新版主版集成服务} */
	getroomlist: '/restapi/soa2/22370/getroomlist', // 获取房型列表
	integratedHotelList: "/restapi/soa2/22370/gethotellist", // 酒店列表
	
	// 其他
	hotelMiniProgramUrlGet: "/restapi/soa2/22141/hotelMiniProgramUrlGet",	// 酒店官网入口
};


module.exports = {
	serveUrl: function (urlName) {
		const urlPath = baseurl[urlName];
		if (!urlName || !urlPath) {
			return null;
		}

		if (!isTest && !isBastion) {
			return urlPath;
		}

		const isNet = _.find(netServiceList, (s) => urlPath.indexOf(s) > -1);
		const subEnv = isTest
			? "?subEnv=" + fatEnv
			: isNet
			? "?isBastionRequest=true"
			: "?isCtripCanaryReq=1";

		// 反爬服务没有测试环境，直接返回生产环境绝对地址
		if (urlPath.indexOf("11754") > -1) {
			return "https://m.ctrip.com" + urlPath;
		} else {
			return baseurl[urlName] + subEnv;
		}
	},
};
