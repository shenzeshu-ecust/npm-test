import { cwx, CPage } from "../../../../cwx/cwx.js";

const wifirest = require('./wifirest.js');
import Api from '../../common/apis/restapi.js';
import hPromise from '../../common/hpage/hpromise';
const detaildata = require('../../components/roomlist/detaildata.js');
const wifitrace = require('../../common/trace/wifitrace.js');
import trace from '../../common/trace/smztrace';
import DateUtil from '../../common/utils/date.js';
const util = require('../../common/utils/util');
const huser = require('../../common/hpage/huser');
import commonrest from '../../common/commonrest';
import C from '../../common/Const.js';
const StorageUtil = require("../../common/utils/storage");
const BaseGeo = require('../../common/geo/basegeo');
const basegeo = new BaseGeo()
const baseUrl = "https://pages.c-ctrip.com/hotels/wechat/market/smz/wifi/";
const curPageId = "10650022492";
const tipList = [
	{
		imgUrl: "tip0.png",
		text: "点击左上角“设置”返回设置列表",
	},
	{
		imgUrl: "tip1.png",
		text: "从设置列表顶部进入“无线局域网”",
	},
	{
		imgUrl: "tip2.png",
		text: "等待WiFi列表刷新",
	},
	{
		imgUrl: "tip3.png",
		text: "返回小程序选择信号最强的WiFi连接",
	},
];

const traceConnWifiConnType = ["startpage_coupon", "coupon", "common"]; // 红包页面连接按钮，点击埋点加字段，与其他点击数据区分开
const exploreList = new Set();
cwx.onAppHide(() => {
	// 监听onapphide事件，埋点
	const cPage = cwx.getCurrentPage();
	if (cPage && cPage.pageId === curPageId && cPage.ubtTrace) {
		try {
			cPage.ubtTrace("189996", {
				click_type: "2",
				source: "wifi-connect",
			});
		} catch (e) {}
	}
});

CPage({
	pageId: curPageId,
	timer: 3000,
	postIndex: -1,
	checkPerformance: true,// 白屏标志位
	pageStatus: {
		checkStay: false,
		fromStay: false, // 用于 iOS 获取信号失败后，控制返回显示界面为 停留时间超时
		stayTime: 30000, // 超时时间更改为获取到WiFi信号后30s，时间可配置
		fakePromotionId: -1, // 未登录态酒店券 id
		sysInfo: wx.getSystemInfoSync(),
		isAndroid10: false,
		newPwd: "",
		wifiEnabled: false,
		isHTLNewUser: false, // 平台新客
		enableWhiteList: false, // 是否启用 酒店白名单功能
		ignoreHtlNewUser: false, // 用于开发环境忽略平台新客条件
	},
	info: {
		curWifiInfo: {}, // 当前连接 wifi
		curWifiIndex: -1, // 当前操作的 wifi index
		localList: [], // 安卓本地 wifiList
		originList: [], // 服务下发 搜索筛选 wifiList
		originAllList: [], // 服务下发 wifiList
		timer: null, // 停留 timmer
		loadTimer: null, // 等待信号 timmer
		showTimer: null, // 教程 timmer
		stepTimer: null, // new教程 timmer
	},
	data: {
		pageId: curPageId,
		cardContent: "",
		hotelID: 0,
		codeID: "",
		wifiList: [],
		searchWifiList: [],
		addList: [],
		filtedList: [], // for unlogin and connected case
		couponList: [],
		connectedIndex: -1,
		showCoupon: false,
		postSSID: "",
		isIOS: false,
		scrollViewHeight: 0,
		topStyle: "",
		needSignal: "",
		isDoingConnect: false,
		connectName: "",
		isAlertShow: false, // 判断输入弹窗是否弹出
		connectState: "", // 连接结果状态
		connectText: "", // 连接结果文案
		isJoinWifiAble: false, // 输入密码长度
		showInitFail: false, // wx wifi 初始化失败
		showSignalTip: false, // ios 获取信号教程
		showSignalAlert: false, // ios 获取信号弹窗
		loadStr: "",
		tipInfo: {
			baseUrl: baseUrl,
			tipList: tipList,
		},
		tipIndex: 0,
		getWifiListErrCode: 0,
		showOpenWifiGPSConfirm: false, // Android无法获取到信号，根据报错提示用户开启WiFi、GPS
		showIOSGetSignal: false, // ios获取信号前，未连接WiFi且酒店有WiFi信息时，提示去系统获取信号 || ios未获取信号且已连接WiFi时，原WiFi列表展示去获取信号
		showIosWifiGuide: false, // WiFi教程页面
		isIPhoneX: false,
		connType: 0, // 红包页面连接按钮，点击埋点加字段，与其他点击数据区分开
		showStep: 1, // new get signal guide show step
		showFirstLoading: true,
		neverShowStay: false,
		loginStatus: false,
		showShortList: false, // 未登录用户连接后默认展示缩起 list
		isCopyJoinWifiAble: true, // 输入密码长度
		isCopyWifiAlertShow: false, // 判断复制wifi密码弹窗是否弹出
		curWifi: null,
		isPwdErr: false,
		isAndroid10: false,
		isHotelWhiteList: false, // 是否 酒店id 在白名单中
		isNetSupervisorHotel: false,
		showServiceComponent: false, // 如果showServiceComponent==true 展示店内服务模块，不然展示老逻辑
		hotelBaseInfo: {},
		waterModuleSwitch: false, // 瀑布流开关-酒店维度
		wifiPageComponentSwitch: false,
		hotelTel: "", // 前台电话
		functions: [], // 店内服务
		yoyocardBg:
			"https://pages.c-ctrip.com/hotels/wechat/market/smz/aggregate/yoyocard_HTLold.png",
		yoyocardBg1:
			"https://pages.c-ctrip.com/hotels/wechat/market/smz/aggregate/hotel-yoyo-card.png",
		yoyocardBtns: [],
		yoyoRights: [],
		showPassword: false,
		lowDiscount: false, // 8折和68折区分
		sequence: [],
		nucleicImageUrl: "",
		discountValue: "",
		rightsTag: "",
		isShowModal: false,
		communityQRCode: {},
		showPasswordToast: false,
		wifiConnectTipText: "",
		showFailPage: false, // 展示wifi连接失败页
		showCopyToast: false,
		isIntersection: false, // 判断本地与ebk维护wifi交集是否为空
		isFromNewLanding: false, //是否是从新版落地页跳转到wifi连接页
        isWifiMoreThen10: false, // wifi数量是否大于10
        isShowSearchMask: false,
        isFocus: false,
        isShowSwitchWifi: false, //是否展示切换wifi按钮
        showNearbyWifiSwitch: false, //展示附近wifi开关
        isShowNearByWifi: false, //是否展示附近wifi
        commonPassword: "", // 安卓连接附近wifi时使用的密码
		disablePlatformDiscount:false,
        isSendMessageInWifiPage: false,
        showCopySignal: 0,
        isShowConnectBtn: false, //联系前台按钮开关
	},
	
	onLoad: function (options) {
		const self = this;
		const {
			platform,
			windowHeight,
			system,
			wifiEnabled = false
		} = wx.getSystemInfoSync();
		this.pageStatus.wifiEnabled = wifiEnabled;
		self.options = options;

		// check is iPhone X
		let isIPhoneX = util.isIPhoneX();

		const { sourceFrom } = options;
		this.isXshuai(options.xshuaiWifi);
		setTimeout(() => {
			self.setData({
				showFirstLoading: false,
			});
		}, 1000);

		let versMatched = system.match(/(\d+)/) || [0];
		let isAndroid10 =
			(versMatched.length ? versMatched[0] : 0) >= 10 &&
			system.toLocaleLowerCase().indexOf("ios") == -1;

		this.pageStatus.isAndroid10 = isAndroid10;
		self.setData({
			isIOS: platform.toLowerCase() === "ios",
			hotelID: parseInt(self.options.hotelId, 10),
			codeID: self.options.codeID,
			windowHeight: windowHeight,
			isIPhoneX,
			isAndroid10,
			sid: self.options.sid,
			allianceid: self.options.aid,
			sourceFrom,
            isFromNewLanding: options.isFromNewLanding === "1",
            isSendMessageInWifiPage: self.options.isSendMessageInWifiPage === "true"
		});
		this.checkLoginStatus();
		self.checkUniversalSwitches();
		// this.fetchModuleList();
		basegeo.getPoint(true, ()=>{
			this.fetchModuleList();
		}, ()=>{
			this.fetchModuleList();
		},true)
		detaildata.doRequest(
			{ a: self.options.hotelId },
			this.detailLoad,
			this.detailLoadErr.bind(this),
			this
		);
		exploreList && exploreList.clear();
		setTimeout(() => {
			self.exposureOnScroll();
		}, 5000);
		trace.pageScene(self, {
			page: self.pageId,
			scene_value: cwx.scene,
			source: options?.mini || "",
			masterhotelid: options?.hotelId || 0,
			sourceFrom
		});
	},
	fetchModuleList() {
		const self = this;
		this.createTasksPromise(self.options.hotelId, self.options.codeID).then(
			(res) => {
				self.handleCreateTasks(res);
				self.loadWifi();
				if (!res || res[0].result === false) {
					util.logException(
						self,
						1,
						"SmzGetModuleListV3",
						self.pageId
					);
				}
			}
		);
	},
	getWifiConnectModules: async function () {
		const self = this;
		const res = await Api.getWifiConnectModules({
			hotelId: this.data.hotelID
		});
		const modules = res ? res?.modules : [];

		this.setData(
			{
				sequence: modules,
			},
			() => {
				setTimeout(() => {
					self.exposureOnScroll();
				}, 1000);
			}
		);
	},
    onShareAppMessage: function (){
        wifitrace.clickShare(this,{
            page: curPageId
        })
        const {wifiPageUrl = "", hotelId = ""} = this.options
        const landingPageUrl = wifiPageUrl ? decodeURIComponent(wifiPageUrl) : `/pages/hotelplanning/aggregate/main?a=${hotelId}&channel=wifi-landing`
        return {
			bu: "hotel",
			title: "一键连WIFI，续住更方便",
			path: landingPageUrl,
			imageUrl: "https://pages.c-ctrip.com/hotels/wechat/market/smz/wifi/wifi-page-share.png",
		};
    },
	exposureOnScroll: function () {
		const self = this;
		const { windowHeight } = wx.getSystemInfoSync();
		const query = wx.createSelectorQuery();
		query.selectAll(".wifi-label-exposure").boundingClientRect();
		query
			.selectAll("#shuttle-car >>> .wifi-label-exposure")
			.boundingClientRect();
		query.exec(function (res) {
			res?.forEach((resArray) => {
				resArray?.forEach((item) => {
					if (
						item.top < windowHeight &&
						item.top + item.height > 0 &&
						item.height > 0
					) {
						self.exposureTrace(
							item.dataset?.type,
							item.dataset?.text
						);
					}
				});
			});
		});
	},
	exposureTrace: function (type, text) {
		const self = this;
		if (
			type &&
			type.length > 0 &&
			text &&
			text.length > 0 &&
			exploreList &&
			!exploreList.has(type)
		) {
			const options = {
				page: self.pageId,
				type: text,
			};
			if (type === "7") {
				options.typevalue = {
					masterhotelid: self.data.hotelID,
					window_type: self.data.communityQRCode?.qrCodeType,
				};
			}
			trace.wifiConnShow(self, options);
			exploreList.add(type);
		}
	},
	onSaveExitState: function () {
		var exitState = {}; // 需要保存的数据
		return {
			data: exitState,
			expireTimeStamp: Date.now() + 2 * 24 * 60 * 60 * 1000, // 超时时刻
		};
	},

	onScroll: util.throttle(function (e) {
		const scrollTop = e.detail.scrollTop;
		let query = wx.createSelectorQuery();

		this.exposureOnScroll();
	}, 300),

	onShow: function () {
		const { wifiEnabled = false } = wx.getSystemInfoSync();
		this.isXshuaiConnected();
		this.pageStatus.wifiEnabled = wifiEnabled;
        cwx.Observer.addObserverForKeyOnly('privacy_authorize',this.handleAuthorize)
	},

    handleAuthorize(e) {
       if(!e?.agree){
            this.handleBack()
       }
    },

	createTasksPromise: function (hotelId, codeID) {
		let tasks = [];

		// request function list
		tasks.push(
			Api.getSmzModuleListV3({
				hotelId: hotelId,
				codeID: codeID,
				unionId: cwx.cwx_mkt.unionid,
				source: "wifi_connect_suc"
			})
		);

		return hPromise.all(tasks);
	},

	handleCreateTasks: function (result) {
		const moduleList = result[0];
		const {
			functions,
			uninonVipType,
			unionVipFunc,
			wifiFunc,
			yoyocardBtns,
		} = this.transModuleList(moduleList, this.pageStatus.originList);
		const { hotelId, source, hotelBaseInfo } = this.data;
		const isHTLNewUser =
			this.pageStatus.ignoreHtlNewUser || moduleList.isHTLNewUser;
		this.pageStatus.isHTLNewUser = isHTLNewUser;
		//获取酒店是否屏蔽随机立减
		const subtract = functions.find((item) => item.id === '35');//根据随机立减对应id找到该模块 随机立减id: 35
		this.setData(
			{
				functions,
				uninonVipType,
				unionVipFunc,
				hotelTel: moduleList.telephone,
				waterModuleSwitch: moduleList.waterModuleSwitch,
				yoyocardBg:
					isHTLNewUser && hotelBaseInfo.needShowPrimeIcon
						? "https://pages.c-ctrip.com/hotels/wechat/market/smz/aggregate/yoyocard_HTLnew.png"
						: "https://pages.c-ctrip.com/hotels/wechat/market/smz/aggregate/yoyocard_HTLold.png",
				lowDiscount: isHTLNewUser && hotelBaseInfo.needShowPrimeIcon,
				yoyocardBtns,
				yoyoRights: moduleList.yoyoRights,
				communityQRCode: moduleList.communityQRCode,
				disablePlatformDiscount: subtract ? !subtract.open : false,
			}
		);
	},

	transModuleList: function (moduleList) {
		const functionList = moduleList.sourceFunctions || [];
		const unionVip = moduleList.unionVip || {};
		let ticket = moduleList.ticket || {};
		let functions = [];
		let uninonVipType = "unionvip";
		let wifiFunc = {};
		let yoyocardBtns = [];
		let unionVipFunc = {};

		// 联合会员判断
		if (unionVip.hasOpenUnionVip) {
			if (unionVip.isBlackListHotel || !unionVip.isSwitchEnable) {
				// 屏蔽黑名单 + 开关未开启
				uninonVipType = "";
			} else if (unionVip.hasBindUnionVip) {
				uninonVipType = "unionvip";
				unionVipFunc = unionVip;
			} else {
				uninonVipType = "pendingVip";
				unionVipFunc = unionVip;
			}
		} else {
			uninonVipType = "";
		}

		for (let i = 0; i < functionList.length; i++) {
			if (functionList[i].id === "9") {
				if (uninonVipType == "pendingVip") {
					uninonVipType = "";
				}
			}
			if (functionList[i].id === "6") {
				functionList[i].name = "切换WiFi";
			}
			if (
				functionList[i].id === "15" &&
				functionList[i].open &&
				functionList[i].moduleSwitch
			) {
				yoyocardBtns.push({
					id: "15",
					title: "会员价续住本店",
				});
			}
			if (
				functionList[i].id === "16" &&
				functionList[i].open &&
				functionList[i].moduleSwitch
			) {
				yoyocardBtns.push({
					id: "16",
					title: "会员价订下一程",
				});
			}

			functions.push(functionList[i]);
		}

		return {
			functions,
			uninonVipType,
			unionVipFunc,
			wifiFunc,
			ticket,
			yoyocardBtns,
		};
	},

	onClickShowWifiList: function () {
		// 若当前页面为wifi连接失败页，点击 切换wifi 效果等同于关闭连接失败弹窗
		if (this.data.showFailPage) {
			this.setData({
				isCopyWifiAlertShow: false,
				needSignal: "",
				showFailPage: false,
				showCopyToast: false,
			});
			wifitrace.wifiChangeClick(this, { page: this.data.pageId });
		}
		this.setData({
			showServiceComponent: false,
            topStyle: ""
		});


		const options = {
			type: "切换wifi",
			page: this.data.pageId,
		};
		trace.wifiConnClick(this, options);
	},

	detailLoad: function (res) {
		const { starLevel, customerEval } = res;
		this.setData({
			highStar: starLevel >= 4 || customerEval >= 4,
		});
		const pictureHost =
			res.pictureHost || "https://dimg04.c-ctrip.com/images";
		const headerPictureList = res.headerPictureList || [];
		this.pageStatus.headPictureCount = headerPictureList.length;
		const pictures = headerPictureList.map((item) => {
			const cutParam = item.params || "_C_750_375_Q70";
			return `${pictureHost}${item.url}${cutParam}${item.ext}`;
		});
		const data = {
			headPicture: pictures[0],
			hotelBaseInfo: res,
			yoyocardBg:
				this.pageStatus.isHTLNewUser && res.needShowPrimeIcon
					? "https://pages.c-ctrip.com/hotels/wechat/market/smz/aggregate/yoyocard_HTLnew.png"
					: "https://pages.c-ctrip.com/hotels/wechat/market/smz/aggregate/yoyocard_HTLold.png",
			lowDiscount: this.pageStatus.isHTLNewUser && res.needShowPrimeIcon,
			yoyocardBg1:
				starLevel >= 4 || customerEval >= 4
					? "https://pages.c-ctrip.com/hotels/wechat/market/smz/aggregate/hotel-union-card.png"
					: "https://pages.c-ctrip.com/hotels/wechat/market/smz/aggregate/hotel-yoyo-card.png",
		};
		this.setData(data);
		this.getWifiConnectModules();
	},

	detailLoadErr(err) {
		let type = err ? 0 : 1;
		util.logException(this, type, "gethoteldetail", this.pageId);
	},

	/**
	 * 获取 wifi超时刷新开关和时间
	 */
	checkUniversalSwitches: function () {
		const { SMZ_WIFI_CHECK_STAY, SMZ_WIFI_STAY_TIME, SMZ_FAKE_HOTEL_PROMTIONID, WIFI_HOTEL_IDS, WIFI_HOTEL_ENABLE_WHITELIST, WIFI_PAGE_ADD_COMPONENT, SWITCH_IOS_WHITE_LIST, SWITCH_SEARCHWIFI, IGNORE_HOTEL_NEW_USER, YOYOCARD_INSTRUCTION, NUCLEIC_ACID_IMAGE_URL, WIFI_CONNECT_NEW_CUSTOMER_DISCOUNT, WIFI_CONNECT_CONTINUE_LIVE_PROFIT, WIFI_CONNECT_TIP_TEXT, SHOW_NEARBYWIFI_SWITCH, SCAN_IN_PRICE_TAG, LIMIT_CHOOSE_DAY, CALENDAR_LIMIT_CHOOSE_DAY, COPY_PASSWORD_WIFI_SIGNAL, CONNECT_FRONTDESKK_SWITCH } = C; 
		const key = [
			SMZ_WIFI_CHECK_STAY,
			SMZ_WIFI_STAY_TIME,
			SMZ_FAKE_HOTEL_PROMTIONID,
			WIFI_HOTEL_IDS,
			WIFI_HOTEL_ENABLE_WHITELIST,
			WIFI_PAGE_ADD_COMPONENT,
			SWITCH_IOS_WHITE_LIST,
			SWITCH_SEARCHWIFI,
			IGNORE_HOTEL_NEW_USER,
			YOYOCARD_INSTRUCTION,
			NUCLEIC_ACID_IMAGE_URL,
			WIFI_CONNECT_NEW_CUSTOMER_DISCOUNT,
			WIFI_CONNECT_CONTINUE_LIVE_PROFIT,
			WIFI_CONNECT_TIP_TEXT,
			SCAN_IN_PRICE_TAG, //扫码一口价标签名称
            SHOW_NEARBYWIFI_SWITCH,
			LIMIT_CHOOSE_DAY, // 日历最大可选时间
            COPY_PASSWORD_WIFI_SIGNAL,
            CONNECT_FRONTDESKK_SWITCH,
		];
		commonrest.getWechatSoaSwitch(key, (data) => {
			if (data?.result) {
				const res = data.result;
				this.pageStatus.checkStay = res[SMZ_WIFI_CHECK_STAY] === "1";
				this.pageStatus.stayTime = ~~res[SMZ_WIFI_STAY_TIME] || 30000;
				this.pageStatus.fakePromotionId = ~~res[SMZ_FAKE_HOTEL_PROMTIONID] || "-1";
				this.pageStatus.hotelIds = JSON.parse(res[WIFI_HOTEL_IDS] || "[]");
				this.pageStatus.enableWhiteList = +(res[WIFI_HOTEL_ENABLE_WHITELIST] || "0"); // wifi酒店白名单开关 1 开，0 关闭
				const isHotelWhiteList = this.pageStatus.hotelIds.includes(
					this.data.hotelID
				);
				this.pageStatus.enableIosWhiteList = +(res[SWITCH_IOS_WHITE_LIST] || "0"); // 是否启用所有ios使用白名单 开关 1 开，0 关闭
				this.pageStatus.ignoreHtlNewUser = res[IGNORE_HOTEL_NEW_USER] === "1";
				this.setData({
					cardContent: res[YOYOCARD_INSTRUCTION] || "",
					isHotelWhiteList,
					wifiPageComponentSwitch: res[WIFI_PAGE_ADD_COMPONENT] === "1",
					enableSearchWifi: +(res[SWITCH_SEARCHWIFI] || "0"),
					nucleicImageUrl:
						res[NUCLEIC_ACID_IMAGE_URL] ||
						"https://pages.c-ctrip.com/hotels/wechat/market/smz/wifi/nucleicAcid.png",
					discountValue: res[WIFI_CONNECT_NEW_CUSTOMER_DISCOUNT] || "",
					rightsTag: res[WIFI_CONNECT_CONTINUE_LIVE_PROFIT] || "",
					wifiConnectTipText: res[WIFI_CONNECT_TIP_TEXT] || "",
					scanPriceTag: data.result[SCAN_IN_PRICE_TAG] || "",
                    showNearbyWifiSwitch: data.result[SHOW_NEARBYWIFI_SWITCH] === "1",
					calendarLimitChooseDay: data.result[LIMIT_CHOOSE_DAY] || CALENDAR_LIMIT_CHOOSE_DAY,
                    showCopySignal: Number(res[COPY_PASSWORD_WIFI_SIGNAL]) || 0,
                    isShowConnectBtn: res[CONNECT_FRONTDESKK_SWITCH] === "1"
				});
			} else {
				util.logException(this, 1, "getH5SwitchResult", this.pageId);
			}
			this.checkStay();
		}, "json");
	},

	loadWifi: function () {
		/* 获取 "酒店名称"、 "WiFiList"*/
		wifirest
			.getWifiInit(
				this.data.hotelID,
				!!this.isEnableHotelWhiteList(),
				this.options?.materialKey
			)
			.then((res) => {
				if (res && res.result) {
					this.info.originList = this.transParams(res.wifiList || []); // 服务下发 wifiList
					if (this.isEnableHotelWhiteList()) {
						this.info.originList = this.info.originList.filter(
							(info) => info.type === 1
						); // 筛选ebk上传的wifi
					}
					if (this.xshuaiInfo?.ssid) {
						const { ssid, password } = this.xshuaiInfo;
						this.info.originList = [
							{
								SSID: ssid,
								ssid: ssid,
								pbulicFlag: false,
								password: password,
								type: 1,
								secure: true,
							},
						];
					}
					this.info.originAllList = cwx.util.copy(
						this.info.originList
					);

					this.setData({
						isNetSupervisorHotel: res?.netSupervisorHotel,
                        searchWifiList: this.info.originAllList,
                        isShowSwitchWifi: !!this.info.originAllList?.length
					});
					this.startWifi();
				} else {
					util.logException(this, 1, "wifiHome", this.pageId);
				}
			});
	},
	bindKeyWordInput: function (e) {
		this.setData({
			wifi_search_keyword: e.detail.value,
		});
		this.ubtTrace("htl_c_wechat_wificonnect_click", {
			click_type: 2,
		});
		this.debounce(this.searchWiFiByKeyWord, 500, false)();
	},
	bindClearKeyWordInput: function () {
		this.setData({
			wifi_search_keyword: "",
		});
		this.ubtTrace("htl_c_wechat_wificonnect_click", {
			click_type: 3,
		});
		this.debounce(this.searchWiFiByKeyWord, 500, false)();
	},
	/**
	 * 根据关键字搜索wifi
	 */
	searchWiFiByKeyWord: function () {
		try {
			var reg = new RegExp(this.data.wifi_search_keyword, "gi");
			let searchWifiList = this.info.originAllList.filter((wifi) => {
				reg.lastIndex = 0;
				return reg.test(wifi.SSID) || reg.test(wifi.roomId);
			});
			this.setData({ searchWifiList });
            if(!searchWifiList?.length){
                cwx.showToast({
                    title: "抱歉，您搜索的wifi信息酒店尚未维护",
                    icon: "none",
                    duration: 3000,
                });
            }
		} catch (e) {
			console.error(e);
		}
	},

	/**
	 * 登陆状态检测
	 */
	checkLoginStatus: function () {
		let that = this;
		huser
			.checkLoginStatus(true)
			.then((isLogin) => {
				that.setData({
					loginStatus: isLogin,
				});
			})
			.catch(() => {
				util.logException(that, 2, "userLogin", that.pageId);
			});
	},

	onUnload: function () {
		this.ubtTrace("189996", {
			click_type: "4",
			source: "wifi-connect",
		});
		wx.stopWifi();
		this.pageStatus.isAndroid10 = false;
		this.pageStatus.newPwd = "";
		this.info.curWifiInfo = {};
		this.info.curWifiIndex = -1;
		wx.offGetWifiList && wx.offGetWifiList();
	},

	// 打开 wx wifi 权限
	startWifi: function () {
		let self = this;
		let { isAndroid10 } = this.data;
		wx.startWifi({
			success(res) {
				if (self.isEnableHotelWhiteList()) {
					// 白名單逻辑
					(async function () {
						let res = await self
							.generalWxPromise(wx.getConnectedWifi)()
							.catch((err) => err);
						if (res && res.wifi) {
							self.info.curWifiInfo = res.wifi;
							self.onConnectWifiSuccess.apply(self);
						} else {
							if (self.data.isIOS) {
								// ios
								!wx.getSystemInfoSync().wifiEnabled &&
									self.setData({
										showOpenWifiGPSConfirm: true,
									});
							}
						}
						self.buildWifiList();
					})();
					return;
				}
				if (!self.data.isIOS) {
					// Android
					self.searchWiFi(isAndroid10);
					self.wifiList(isAndroid10);
				} else {
					// iOS
					self.getCurWifiInfo();
					if (self.options.showGuide) {
						self.goWifiGuide();
					}
				}
			},
			fail(err) {
				self.setData({
					showInitFail: true,
				});
				util.logException(self, 2, "startWifi", self.pageId);
			},
		});
	},

	// Android onLoad 期间获取周边 wifilist
	searchWiFi: function (isAndroid10) {
		let self = this;
		wx.getWifiList({
			success(res) {
			},
			fail(err) {
				console.error("searchWiFi: fail! ", err);

				self.buildWifiList();
                let errCode = 0
                if(err.errno == 103){  //errno: 103 用户拒绝授权
                    errCode = 12006
                }else if (err.errno == 1505002){   //errno: 1505002 系统WiFi开关未开启
                    errCode = 12005
                }else {
                    errCode = err.errCode
                }
				self.setData({
					showOpenWifiGPSConfirm: true, // Android 无法获取到信号，根据报错提示用户开启WiFi、GPS
					getWifiListErrCode: errCode ,
				});
				const params = {
					hotelId: self.data.hotelID,
					errmsg: err.errMsg,
					errCode: err.errCode,
                    errno: err.errno
				};
				wifitrace.failGetWifiList(self, params);
			},
		});
	},

	wifiList: function (isAndroid10) {
		const { hotelBaseInfo, hotelID } = this.data;
		let self = this;
		wx.onGetWifiList((res) => {
			self.info.localList = res.wifiList;
			if (res?.wifiList?.length) {
				const traceInfo = {
					page: "10650022492",
					masterhotelid: hotelID,
					hotelname: hotelBaseInfo.name,
          star: hotelBaseInfo.starLevel,
					wifi_info: res.wifiList.map((item) => ({
						wifi_name: item.SSID,
						wifi_signal_strength: item.signalStrength,
					})),
				};
				wifitrace.androidWifiStrength(self, traceInfo);
			}
			self.setData({
				needSignal: "success",
			});
			self.getCurWifiInfo();
			wx.offGetWifiList && wx.offGetWifiList();
		});
	},

	// 当前连接的 wifi
	getCurWifiInfo: function (wifi) {
		let self = this;
		wx.getConnectedWifi({
			success(res) {
				if (res && res.wifi) {
					if (res.wifi.SSID == self.info.curWifiInfo?.SSID) {
						wifi && self.traceSuccess();
					}
					self.info.curWifiInfo = res.wifi;
					self.onConnectWifiSuccess.apply(self);
				}
			},
			fail(res) {
				console.error("getCurWifiInfo fail.", res);
				if (wifi) {
					self.info.curWifiInfo = wifi;
					self.info.curWifiIndex = self.data.wifiList.findIndex(
						(info) => info.SSID === wifi.SSID
					);
				}
			},
			complete() {
				// 未获取到附近WiFi信号前，不展示WiFi列表，并提示去获取信号
				// ios未获取信号且已连接WiFi时，原WiFi列表展示去获取信号
				if (self.data.isIOS) {
					self.setData({
						showIOSGetSignal: true,
					});
				}

				self.buildWifiList();
			},
		});
	},

	handleGetSignal: function () {
		if (this.data.isIOS) {
			this.setData({
				showSignalTip: true,
				showSignalAlert: false,
			});
			this.handleTipAnimation();
		} else {
			this.handleReload();
		}
	},

	// 获取信号
	handleReload: function () {
		this.setData({
			needSignal: "load",
		});
		this.checkStay();
		let self = this;
		wx.getWifiList({
			success() {
				self.getSignal();
			},
			fail(err) {
				console.error("searchWiFi: fail! ", err);
				self.setData({
					needSignal: "fail",
				});
				if (!self.data.isIOS) {
					cwx.showToast({
						title: "WiFi列表刷新失败，请稍后重试",
						icon: "none",
						duration: 1500,
					});
				}
				const params = {
					hotelId: self.data.hotelID,
					errmsg: err.errMsg,
					errCode: err.errCode,
				};
				wifitrace.failGetWifiList(self, params);
				self.checkStay();
			},
			complete() {
				self.closeTip();
				self.handleLoadAnimation();
			},
		});
	},
	closeTip: function () {
		this.setData({
			showSignalTip: false,
			tipIndex: 0,
		});
		clearInterval(this.info.showTimer);
	},

	getSignal: function () {
		let self = this;
		wx.onGetWifiList((res) => {
			wx.offGetWifiList && wx.offGetWifiList();
			clearInterval(this.info.loadTimer);
			if (res.wifiList.length > 0) {
				if (self.data.isIOS) {
					self.setData({
						needSignal: "success",
						showIOSGetSignal: false,
					});
				} else {
					self.setData({
						needSignal: "success",
						showOpenWifiGPSConfirm: false,
						getWifiListErrCode: 0,
					});
				}
				self.info.localList = res.wifiList;
				self.buildWifiList();
			} else {
				self.setData({
					needSignal: "fail",
                    isDoingConnect: false,
                    connectState: ""
				});
				if (!self.data.isIOS) {
					cwx.showToast({
						title: "WiFi列表刷新失败，请稍后重试",
						icon: "none",
						duration: 1500,
					});
				}
			}
			self.checkStay();
		});
	},

	buildWifiList: function (option) {
		let addList = [];
		if (!this.info.localList) {
			this.info.localList = [];
		}
		if (!this.info.originList) {
			this.info.originList = [];
		}

		let originList = cwx.util.copy(this.info.originList);
        this.info.localList.sort((a, b) => {
            return b.signalStrength - a.signalStrength;
        });
		this.info.localList.forEach((wifi) => {
			if (this.data.isIOS) {
				wifi.signalStrength = parseInt(wifi.signalStrength * 100);
			}
			wifi.signal = wifi.signalStrength;
			wifi.signalStrength = this.transSignal(wifi.signalStrength);
		});
		this.info.localList.forEach((wifi) => {
			if (wifi.SSID === "") {
				return;
			}
			const idx = this.checkInList(wifi, originList);
			if (idx === -1) {
				wifi.local = true;
				wifi.type = 0;
				addList.push(wifi);
			} else if (idx !== -1 && !originList[idx].local) {
				// 判断是否已经处理过同名 wifi
				originList[idx] = {
					...originList[idx],
					local: true,
					signalStrength: wifi.signalStrength,
                    signal: wifi.signal,
                    status: wifi.signal < this.data.showCopySignal ? 2 : originList[idx].status, // 信号弱的WIFI展示复制密码
				};
				if (originList[idx].BSSID === "") {
					originList[idx].BSSID = wifi.BSSID;
				}
			}
		});
		if (this.data.needSignal == "success") {
			// 过滤无信号 wifi
			originList = originList.filter((wifi) => {
				return wifi.local;
			});
		}

		// 安卓做交集运算 && 根据信号强弱排序
		let mixedWiFi = cwx.util.copy(originList)
		if(!this.data.isIOS){
			mixedWiFi = mixedWiFi.filter((wifi) => {
				return wifi.local;
			});
            originList.sort(this.sortRule);
		    addList.sort(this.sortRule);
		}
		
        // 安卓交集强信号wifi落库
        this.handleHighSrengthWifi(originList)

		const curConnectedWiFi =
			this.info.curWifiInfo?.SSID &&
			this.info.curWifiInfo.SSID.length > 0 &&
			!this.info.curWifiInfo.SSID.includes("unknown"); //当前连接wifi且wifi不为unknown

        let isShowSwitchWifi = this.data.isShowSwitchWifi

		// 进入页面已连接 wifi
		if (curConnectedWiFi) {
			let index = this.checkInList(this.info.curWifiInfo, originList);
			if (index !== -1) {
				// 直连 wifi
				this.info.curWifiInfo = originList[index];
				this.info.curWifiIndex = index;
                // 酒店只维护了一个wifi或者安卓交集只有一个 && 且用户已连接该wifi --则不展示切换按钮
                if(originList.length == 1) {
                    isShowSwitchWifi = false
                }
			} else {
				index = this.checkInList(this.info.curWifiInfo, addList);
				// 验证 wifi
				if (index !== -1) {
					addList.splice(index, 1);
				}
				// 未知 wifi
				const wifi = this.info.curWifiInfo;
				const wifiInfo = {
					SSID: wifi.SSID,
					password: "",
					secure: wifi.secure,
					type: -1, // unknow
					signal: wifi.signalStrength || 0,
					signalStrength: this.transSignal(wifi.signalStrength || 0),
				};
				originList.push(wifiInfo);
				this.info.curWifiInfo = wifiInfo;
				this.info.curWifiIndex = originList.length - 1;
			}
		}
        // 判断安卓交集是否为空
		let isIntersection = !this.data.isIOS && !(mixedWiFi.length > 0);
        let isShowNearByWifi = false
        let highStrengthList = []
        if(isIntersection) {
            trace.showIntersection(this, {
                page: this.pageId,
                masterhotelid: this.data.hotelID,
            });
            if(this.data.showNearbyWifiSwitch) {
                // 安卓交集为空 & ebk wifi密码都相同或者无密码 展示附近wifi
                const hasSamePassword = this.hasSamePassword()
                highStrengthList = addList.filter(wifi => wifi.signal >= 88) //筛选附近wifi信号为3格的wifi
                isShowNearByWifi = hasSamePassword && highStrengthList?.length > 0
                if(isShowNearByWifi){
                    const { hotelBaseInfo, hotelID } = this.data;
                    const param = {
                        page: "10650022492",
                        masterhotelid: hotelID,
                        hotelname: hotelBaseInfo.name,
                        wifilist: highStrengthList,
                        key: this.options.materialKey
                    }
                    wifitrace.showNearbyWifiList(this, param)
                    this.setData({
                        isShowNearByWifi: true
                    })
                }
            }
        }

		const connectedIndex =
			this.info.curWifiIndex >= 0 && curConnectedWiFi
				? this.info.curWifiIndex
				: -1;
		let { wifi_search_keyword, searchWifiList } = this.data;
        const finalWifiList = isIntersection 
                                ? (isShowNearByWifi ? highStrengthList : this.info.originList) 
                                : cwx.util.copy(originList);
        
        const isWifiMoreThen10 = finalWifiList.length > 10;
        const showSearchMask = StorageUtil.getStorage('showSearchMask');
        let isShowSearchMask = false;
        if(isWifiMoreThen10 && !showSearchMask && this.data.isIOS && connectedIndex == -1){
            StorageUtil.setStorage('showSearchMask',true);
            isShowSearchMask = true;
        }
        // 未连接状态 && 该酒店未维护wifi 出弹窗提示
        if(connectedIndex == -1 && !this.info.originAllList?.length){
            this.toastForNoWifi(0)
        }
		this.setData({
			wifiList: originList,
			addList: addList,
			isIntersection,
			searchWifiList: wifi_search_keyword
				? searchWifiList
				: finalWifiList,
			connectedIndex: connectedIndex,
			scrollViewHeight: this.transListHeight(
				connectedIndex,
				addList,
				finalWifiList
			),
            isWifiMoreThen10,
            isShowSearchMask,
            isFocus: !isShowSearchMask && isWifiMoreThen10,
            isShowSwitchWifi,
            isDoingConnect: false,
            connectState: ""
		});
		this.trasnContentStyle();
		// wifiLoad 埋点
		this.traceWifiLoad([].concat(originList, addList));
		this.systemTrace("onload");

		this.checkStay();
		this.isXshuaiConnected();
	},

    hasSamePassword: function () {
        const originList = this.info.originList
        let commonPassword = ""
        let isShowNearByWifi = originList?.length > 0
        for(let i = 0; i < originList.length; i++){
            const password = originList[i]?.password || ""
            if(password && password !== commonPassword) {
                if(!commonPassword) {
                    commonPassword = password
                }else {
                    isShowNearByWifi = false
                    break
                }
            }
        }
        this.setData({
            commonPassword
        })
        return isShowNearByWifi
    },

    handleHighSrengthWifi: function (originList) {
        if(originList?.length > 0){
            let nearbyWifiList = []
            originList.map(wifi=>{
                if(wifi?.signal >= 88) {
                    nearbyWifiList.push({
                        ssid: wifi.SSID,
                        signalStrength: wifi.signal
                    })
                }
            })
            if(nearbyWifiList?.length) {
                this.recordQrCodeNearbyWifi(nearbyWifiList)
            }
        }
    },

    recordQrCodeNearbyWifi: async function (nearbyWifiList) {
        const reqData = {
            hotelId: this.data.hotelID,
            urlKey: this.options.materialKey,
            nearbyWifiList
        }
        try {
            await Api.recordQrCodeNearbyWifi(reqData);
        }catch (e) {
            console.error(e)
        }
    },

	trasnContentStyle: function () {
		const { isIOS, connectedIndex, needSignal, showFailPage } = this.data;
		let topStyle = "";
		if (connectedIndex > -1 || ( (needSignal == '' || needSignal == 'init') && !showFailPage && isIOS)) {
			topStyle = ""; //新版样式
		} else {
			topStyle = "list-top";
		}
		this.setData({
			topStyle: topStyle,
		});
	},

	transSignal: function (signal) {
		let res = 0;
		if (signal >= 88) {
			res = 3;
		} else if (signal >= 77) {
			res = 2;
		} else if (signal >= 55) {
			res = 1;
		}
		return res;
	},

	transListHeight: function (idx, localList, originList) {
		let res = 0,
			titleHeight = 54,
			addWifiHeight = 48,
			originWifiHeight = 84,
			search = 66;
		let { enableSearchWifi, isIOS } = this.data;
		if (localList.length > 0) {
			res += titleHeight + localList.length * addWifiHeight;
		}
		originList.forEach((item, index) => {
			if (index == idx) {
				return;
			}
			if (item.type === 1 || item.userName) {
				res += originWifiHeight;
			} else {
				res += addWifiHeight;
			}
		});
		if (res > 0) {
			res += 10;
		}
		if (res > 0 && enableSearchWifi && isIOS) {
			res += search;
			return res > 400 ? 400 : res;
		}
		return res > 350 ? 350 : res;
	},

	isEnableHotelWhiteList: function () {
		// 获取是否使用 酒店白名单功能 状态
		let { isHotelWhiteList, isIOS } = this.data;
		if (!isIOS) {
			// 安卓白名单
			this.setData({
				whiteList: isHotelWhiteList && this.pageStatus.enableWhiteList,
			});
			return isHotelWhiteList && this.pageStatus.enableWhiteList;
		} else {
			// ios全走IOS白名单
			this.setData({ whiteList: this.pageStatus.enableIosWhiteList });
			return this.pageStatus.enableIosWhiteList;
		}
	},

	// 连接直连 wifi
	connectWifi: async function (e) {
        const { idx = -1, dataset = {} } = e.currentTarget
		const wifiInfo = dataset?.wifi || null;
        const { searchWifiList = [], isShowNearByWifi } = this.data
		let curWifi = wifiInfo || searchWifiList[idx] || null;
		this.info.curWifiIndex = this.data.wifiList.findIndex(
			(item) => item.SSID === curWifi?.SSID
		);
        this.info.curWifiInfo = isShowNearByWifi ? wifiInfo : this.data.wifiList[this.info.curWifiIndex];
		
		this.wxConnectWifi();
		/* 埋点 */
		wifitrace.connectWifi(this, {
			hotelId: this.data.hotelID,
			wifiName: this.data.wifiList[idx]?.SSID,
			wifitype: this.data.wifiList[idx]?.type, // 是否为官方推荐
			isSecure: this.data.wifiList[idx]?.secure,
            type: isShowNearByWifi ? 2 : ""
		});
	},

	wxConnectWifi: function () {
		let self = this;
		let currentWifi = this.info.curWifiInfo;
        const {isShowNearByWifi, commonPassword} = this.data;
		if (!currentWifi || !currentWifi.SSID) {
			return;
		}
		this.setData({
			isDoingConnect: true,
            connectState: "",
			connectName: currentWifi.SSID,
			currentWifi,
		});

		wx.connectWifi({
			SSID: currentWifi?.SSID || "",
			password: isShowNearByWifi ? commonPassword : (currentWifi?.password || ""),
			success(res) {
				self.checkConnectedWiFi.apply(self);
			},
			fail(err) {
				if (self.isEnableHotelWhiteList()) {
					self.setData({
						isDoingConnect: false
					});
					self.pageStatus.isPwdErr = err.errCode === 12002;
				} else {
					self.setData({
						isDoingConnect: false
					});
					self.pageStatus.isPwdErr = err.errCode === 12002;
				}
				self.showCopyWifiAlert(currentWifi);
				/* 埋点 */
				self.failtrace(err, "wxConnectWifi");

				self.checkStay();
				clearInterval(self.info.timer);
				self.info.timer = setInterval(
					self.handleStayState,
					self.pageStatus.stayTime
				);
			},
		});
	},

	checkConnectedWiFi: function () {
		let self = this;
		let currentWifi = this.info.curWifiInfo;
		let { isHotelWhiteList } = this.data;
		wx.getConnectedWifi({
			success(res) {
				if (res && res.wifi) {
					// 切换wifi失败
					if (res.wifi?.SSID !== self.info.curWifiInfo?.SSID) {
						if (self.isEnableHotelWhiteList()) {
							self.setData({
								isDoingConnect: false,
								connectedIndex: -1,
							});
						} else {
							self.setData({
								isDoingConnect: false,
								connectedIndex: -1,
							});
						}
						self.showCopyWifiAlert(self.info.curWifiInfo);
						return;
					}
                    self.recordWifiConnectSuc()
					/* 埋点 */
                    const {isShowNearByWifi, commonPassword} = self.data
                    const password = isShowNearByWifi ? commonPassword : self.info.curWifiInfo?.password
                    self.sendMessgae()
					wifitrace.sucConnected(self, {
						hotelId: self.data.hotelID,
						wifiName: self.info.curWifiInfo?.SSID,
						wifitype:
							self.info.curWifiIndex >= 0
								? self.info.curWifiInfo.type
								: 2, // 是否为官方推荐
						isSecure: self.info.curWifiInfo.password ? true : false,
						materialKey: self.options.materialKey,
						model: self.pageStatus?.sysInfo?.model || "",
						brand: self.pageStatus?.sysInfo?.brand,
                        BSSID: res.wifi?.BSSID || "",
                        password: password || "",
                        type: self.data.isShowNearByWifi ? 2 : ""
					});

					const currentWifi = self.info.curWifiInfo;
					if (self.info?.curWifiIndex < 0) {
						const wifiInfo = {
							SSID: currentWifi?.SSID,
							password: currentWifi.password,
							secure:
								currentWifi.password &&
								currentWifi.password.length > 0,
							type: 0,
							signal:
								currentWifi.signal || res.wifi.signalStrength,
							signalStrength:
								currentWifi.signalStrength ||
								self.transSignal(res.wifi.signalStrength),
						};
						if (self.postIndex !== -1) {
							self.data.addList.splice(self.postIndex, 1);
						}
                        // 把已连接的wifi加到wifi列表中
						self.info.originList.push(wifiInfo);
						self.data.wifiList.push(wifiInfo);
						self.info.curWifiIndex = self.data.wifiList.length - 1;
						self.setData({
							wifiList: self.data.wifiList,
							addList: self.data.addList,
						});
						self.closeAlert();
					}
					let filtedList = self.data.wifiList.map((wifi, index) => {
						return {
							...wifi,
							idx: index,
						};
					});
					filtedList = filtedList.filter((wifi) => {
						return wifi.idx != self.info.curWifiIndex;
					});
					filtedList = filtedList.slice(
						0,
						Math.min(filtedList.length, 2)
					);

					self.onConnectWifiSuccess.apply(self);
                    let {isShowSwitchWifi, searchWifiList = []} = self.data;
                    // 当前展示的wifi数量为1 && 用户成功连接该wifi，则不展示切换按钮
                    if(searchWifiList?.length == 1 && currentWifi?.SSID == searchWifiList[0]?.SSID){
                        isShowSwitchWifi = false;
                    }
					self.setData({
						connectedIndex: self.info.curWifiIndex,
						showCoupon: true,
						scrollViewHeight: self.transListHeight(
							self.info.curWifiIndex,
							self.data.addList,
							self.data.wifiList
						),
						connectState: "connected",
						connectText: "网络安全保护中",
						connectName: "",
						neverShowStay: true,
						filtedList: filtedList,
						showShortList: !self.data.loginStatus,
                        isShowSwitchWifi,
                        isDoingConnect: false
					});

					self.postIndex = -1;
					self.clearDoingConnect(self.timmer);
					self.info.curWifiInfo = {};
					self.info.curWifiIndex = -1;
					self.checkStay();
				}
			},
			fail(err) {
				/* 获取当前WiFi信息失败 */
				console.error("get connectedWifi fail");
				// 连接失败 参数
				let { isCopyWifiAlertShow } = self.data;

				self.pageStatus.isPwdErr = err.errCode === 12002;
				!isCopyWifiAlertShow && self.showCopyWifiAlert(currentWifi);
				/* 连接失败 埋点 */
				self.failtrace(err, "getConnectedWifi");

				self.checkStay();
				clearInterval(self.info.timer);
				self.info.timer = setInterval(
					self.handleStayState,
					self.pageStatus.stayTime
				);
			},
		});
	},

    //将连接成功的wifi和对应的key落库
    recordWifiConnectSuc: async function () {
        const curWifiInfo = this.info.curWifiInfo
        if(curWifiInfo && curWifiInfo.SSID){
            const res = await Api.recordWifiConnectSuc({
                hotelId: this.data.hotelID,
                urlKey: this.options.materialKey,
                ssid: curWifiInfo.SSID,
            });
        }
    },

	/**
	 * wifi连接成功
	 */
	onConnectWifiSuccess: function () {
		this.setData({
			showServiceComponent: true,
		});
		const { uninonVipType } = this.data;
		trace.yoyoCardShow(this, {
			IsYoyoCardShow: uninonVipType === "unionvip" ? "T" : "F",
			source: "wifi-connect",
		});
	},

	checkInList: function (obj, arr) {
		let res = -1;
		for (let i = 0, len = arr.length; i < len; i++) {
			if (obj.SSID === arr[i].SSID) {
				res = i;
				break;
			}
		}
		return res;
	},

	transFailReason: function (errCode) {
		switch (errCode) {
			case 12002:
				return "密码错误";
			case 12003:
				return "连接超时";
			case 12005:
				return "wifi关闭";
			case 12006:
				return "GPS关闭";
			default:
				return errCode;
		}
	},

	connectLocalSecure: function (e) {
		this.setData({
			isAlertShow: false,
		});
		this.joinWifi({
			password: e.detail.value.pwd,
			secure: true,
		});
	},

	closeAlert: function () {
		this.info.curWifiInfo = {};
		this.setData({
			isAlertShow: false,
			postSSID: "",
		});
	},

	/**
	 * wifi连接失败
	 * @param {*} curWifi
	 * @returns
	 */
	showCopyWifiAlert: function (curWifi) {
		if (!curWifi) return;
		if (curWifi.target) {
			curWifi = null;
		}

		const { isPwdErr } = this.pageStatus;
		const { curWifiInfo } = this.info || {};
		const { SSID } = curWifiInfo || {};
		const { highStar, uninonVipType } = this.data;
		const showFailPage =
            !highStar && !isPwdErr &&
			curWifi &&
			uninonVipType === "unionvip";
		curWifi = curWifi || (SSID && curWifiInfo) || null;
		this.setData({
			isCopyWifiAlertShow: true,
			isDoingConnect: false,
			curWifi,
			isPwdErr,
			showFailPage,
			// isPwdErr: true
		});
		const traceOptions = { page: this.data.pageId };
		wifitrace.errorShow(this, traceOptions);

		if (showFailPage) {
			wifitrace.wifiConnectFailure(this, traceOptions);
		}
	},

	closeCopyWifiAlert: function () {
		this.setData({
			isCopyWifiAlertShow: false,
			needSignal: "",
		});
	},

	closeSignalAlert: function () {
		this.setData({
			showSignalAlert: false,
		});
	},

	throttle: function (fn, delay) {
		var lastCall = 0;
		var delay = delay || 200;
		return function (...args) {
			const now = new Date().getTime();
			if (now - lastCall < delay) {
				return;
			}
			lastCall = now;
			return fn(...args);
		};
	},

	checkPwdInput: function (e) {
		if (e && e.detail && e.detail.cursor) {
			const isJoinWifiAble = e.detail.cursor > 7 ? true : false;
			if (this.data.isJoinWifiAble != isJoinWifiAble) {
				this.setData({
					isJoinWifiAble: e.detail.cursor > 7 ? true : false,
				});
			}
		}
	},

	checkCopyPwdInput: function (e) {
		let { isCopyJoinWifiAble } = this.data;
		if (e && e.detail && e.detail.cursor) {
			const status = e.detail.cursor > 7 ? true : false;
			this.pageStatus.newPwd = status ? e.detail.value : "";
			if (isCopyJoinWifiAble === status) return;
			this.setData({
				isCopyJoinWifiAble: status,
			});
		}
	},

	// IOS 连接自填 wifi
	connectIOSWiFi: function (e) {
		const { pwd, ssid } = e.detail.value;
		if (util.isEmpty(ssid)) {
			cwx.showToast({
				title: "请输入WiFi名",
				icon: "none",
				duration: 1000,
			});
			return;
		}
		if (pwd.length > 0 && pwd.length < 8) {
			cwx.showToast({
				title: "WiFi密码位数不足",
				icon: "none",
				duration: 1000,
			});
			return;
		}
		this.info.curWifiInfo = {
			SSID: ssid,
			BSSID: "",
			password: pwd,
			secure: pwd.length > 0,
			needPost: true,
		};
		this.info.curWifiIndex = -1;
		this.wxConnectWifi();
		/* 埋点 */
		wifitrace.connectWifi(this, {
			hotelId: this.data.hotelID,
			wifiName: this.info.curWifiInfo?.SSID,
			wifitype: 0, // 是否为官方推荐
			isSecure: this.info.curWifiInfo.secure,
			connType: traceConnWifiConnType[this.data.connType],
		});
	},

	// 安卓 去认证 wifi 的连接
	joinWifi: function (wifi) {
		this.info.curWifiInfo.password = wifi.password;
		this.info.curWifiInfo.secure = wifi.secure;
		this.wxConnectWifi();
		wifitrace.connectWifi(this, {
			hotelId: this.data.hotelID,
			wifiName: this.info.curWifiInfo?.SSID,
			wifitype: 2, // 是否为官方推荐
			isSecure: this.info.curWifiInfo.secure,
		});
	},

	clearDoingConnect: function (timer, errCode) {
		setTimeout(() => {
			this.setData({
				isDoingConnect: false,
			});
			if (errCode) {
				// 密码错误则重新弹窗
				if (errCode === 12002) {
					this.setData({
						isAlertShow: true,
						postSSID: this.info.curWifiInfo?.SSID,
					});
				} else {
					this.info.curWifiInfo = {};
					this.info.curWifiIndex = -1;
					this.postIndex = -1;
				}
			}
		}, timer);
	},

	// 转换服务下发 wifilist params
	transParams(list) {
		return list.map((item) => {
			return {
				SSID: item.ssid,
				BSSID: item.bssid,
				password: item.password,
				...item,
			};
		});
	},

	// wifiload 埋点
	traceWifiLoad: function (list) {
		const wifiList = list.map((wifi) => {
			return {
				wifiName: wifi.SSID,
				wifitype: wifi.type, // 是否为官方推荐
				isSecure: wifi.secure,
			};
		});
		wifitrace.wifiLoad(this, {
			hotelId: this.data.hotelID,
			wifiList: wifiList,
			source: this.options.source || "",
		});
	},

	systemTrace: function (
		apiName = "load",
		err = { errMsg: "", errCode: "" }
	) {
		const { model, system, version, brand } = this.pageStatus.sysInfo;
		const params = {
			masterhotelid: this.data.hotelID,
			wifiname: this.info.curWifiInfo?.SSID || "",
			wifitype:
				this.info.curWifiIndex >= 0 ? this.info.curWifiInfo?.type : 2, // 是否为官方推荐
			ispassword: this.info.curWifiInfo?.isSecure || false,
			password: this.info.curWifiInfo?.password || "",
			signalStrength: this.info.curWifiInfo?.signalStrength || 0,
			errmsg: err.errMsg,
			errCode: err.errCode,
			failurereasons: this.transFailReason(err.errCode),
			api: apiName,
			version, // 微信版本
			system, // 操作系统及版本
			model, // 设备型号
			brand // 品牌号
		};
		this.ubtTrace && this.ubtTrace(184945, params);
	},
	// 连接失败 埋点
	failtrace: function (err, apiName) {
		const { model, system, version } = this.pageStatus.sysInfo;
        const {isShowNearByWifi, commonPassword} = this.data
        const password = isShowNearByWifi ? commonPassword : this.info.curWifiInfo?.password
		const params = {
			hotelId: this.data.hotelID,
			wifiName: this.info.curWifiInfo?.SSID || "",
			wifitype:
				this.info.curWifiIndex >= 0 ? this.info.curWifiInfo.type : 2, // 是否为官方推荐
			isSecure: this.info.curWifiInfo?.password ? true : false,
			password: password || "",
			signalStrength: this.info.curWifiInfo?.signalStrength || 0,
			reason: this.transFailReason(err.errCode),
			errmsg: err.errMsg,
			errCode: err.errCode,
            errno: err.errno,
			api: apiName,
			version, // 微信版本
			system, // 操作系统及版本
			model, // 设备型号
			openid: cwx.cwx_mkt ? cwx.cwx_mkt.openid : "",
			materialKey: this.options.materialKey,
			model: this.pageStatus?.sysInfo?.model || "",
			brand: this.pageStatus?.sysInfo?.brand,
            type: this.data.isShowNearByWifi ? 2 : ""
		};
		wifitrace.failConnected(this, params);
		wifitrace.failConnectedMsg(this, params);
	},

	// wifi 排序规则
	sortRule: function (a, b) {
		const singnalA = a.signalStrength >= 0 ? a.signalStrength : -1;
		const singnalB = b.signalStrength >= 0 ? b.signalStrength : -1;
		// const typeA = a.type >= 0 ? a.type : -1;
		// const typeB = b.type >= 0 ? b.type : -1;
		// if (typeB == typeA) {
		// 排序逻辑调整：数据库wifi（酒店维护+用户上传），按照WiFi信号强度排序，不区分酒店维护、用户上传
		// if (singnalB - singnalA != 0) {
		return singnalB - singnalA;
		// } else {
		//     const numA = a.connectCount || 0;
		//     const numB = b.connectCount || 0;
		//     return numB - numA;
		// }
		// } else {
		//     return typeB - typeA;
		// }
	},

	// 停留
	checkStay: function () {
		let { checkStay } = this.pageStatus;
		let { isCopyWifiAlertShow } = this.data;
		if (
			!checkStay ||
			isCopyWifiAlertShow ||
			this.isEnableHotelWhiteList()
		) {
			// 开关
			return;
		}
		if (
			/* this.data.connectedIndex === -1 && */ this.data.needSignal ===
			"success"
		) {
			if (!this.info.timer) {
				this.info.timer = setInterval(
					this.handleStayState,
					this.pageStatus.stayTime
				);
			}
		} else {
			clearInterval(this.info.timer);
		}
	},
	handleStayState: function () {
		let { isCopyWifiAlertShow } = this.data;
		if (this.isEnableHotelWhiteList()) {
			return;
		}
		this.setData({
			needSignal: "stay",
			showSignalAlert: false,
			isCopyWifiAlertShow,
			isDoingConnect: false,
		});
		clearInterval(this.info.timer);
	},
	// 动画
	handleTipAnimation: function () {
		let self = this;
		let showAnimation = function () {
			if (self.data.tipIndex < 3) {
				self.setData({
					tipIndex: self.data.tipIndex + 1,
				});
			} else {
				clearInterval(self.info.showTimer);
			}
		};
		this.info.showTimer = setInterval(showAnimation, 600);
	},
	handleLoadAnimation: function () {
		let self = this;
		let loadAnimation = function () {
			if (self.data.loadStr.length < 6) {
				self.setData({
					loadStr: self.data.loadStr + "· ",
				});
			} else {
				self.setData({
					loadStr: "",
				});
			}
		};
		this.info.loadTimer = setInterval(loadAnimation, 600);
	},

	debounce: function (func, wait, immediate) {
		var timeout, args, context, timestamp, result;
		var later = function () {
			// 据上一次触发时间间隔
			var last = new Date().getTime() - timestamp;
			// 上次被包装函数被调用时间间隔last小于设定时间间隔wait
			if (last < wait && last > 0) {
				timeout = setTimeout(later, wait - last);
			} else {
				timeout = null;
				// 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
				if (!immediate) {
					result = func.apply(context, args);
					if (!timeout) context = args = null;
				}
			}
		};
		return function () {
			context = this;
			args = arguments;
			timestamp = new Date().getTime();
			var callNow = immediate && !timeout;
			// 如果延时不存在，重新设定延时
			if (!timeout) timeout = setTimeout(later, wait);
			if (callNow) {
				result = func.apply(context, args);
				context = args = null;
			}
			return result;
		};
	},

	/**
	 * Android无法获取到信号，根据报错提示用户开启WiFi、GPS
	 */
	checkWifiGPSOpened: function () {
		const self = this;
		if (self.data.isIOS) {
			return;
		}
        self.setData({
            isDoingConnect: true,
            connectState: "loading"
        })
		// self.setData({
		//     needSignal: 'load',
		// });
		self.checkStay();
		wx.getWifiList({
			// 用户点击我已打开，重新获取WiFi信号，刷新页面
			success(res) {
			},
			// 获取失败停留在该页面，获取成功，出为你发现WiFi页面
			fail(err) {
				console.error("searchWiFi: fail! ", err);
                let errCode = 0
                if(err.errno == 103){  //errno: 103 用户拒绝授权
                    errCode = 12006
                }else if (err.errno == 1505002){   //errno: 1505002 系统WiFi开关未开启
                    errCode = 12005
                }else {
                    errCode = err.errCode
                }

				// 未获取到附近WiFi信号，页面提示开启WiFi、GPS才能连接，不展示WiFi列表
				if (errCode === 12005 || errCode === 12006) {
					cwx.showToast({
						title: `你还未打开${
							err.errCode === 12005 ? "WiFi" : "GPS"
						}，请前往开启`,
						icon: "none",
					});
				}

				const params = {
					hotelId: self.data.hotelID,
					errmsg: err.errMsg,
					errCode: err.errCode,
                    errno: err.errno
				};
				wifitrace.failGetWifiList(self, params);

				self.setData({
					needSignal: "fail",
					showOpenWifiGPSConfirm: true,
					getWifiListErrCode: errCode || 0,
                    isDoingConnect: false,
                    connectState: ""
				});
				self.checkStay();
			},
			complete() {
				self.handleLoadAnimation();
			},
		});
		self.getSignal();
	},

	/**
	 * 点击刷新，重新获取WiFi信号
	 * Android 若刷新失败toast提示：WiFi列表刷新失败，请稍后重试
	 * iOS 点击重新获取信号，跳转教程页，之后流程同未获取信号
	 */
	handleReloadWifi: function () {
		const self = this;
		// self.setData({
		//     needSignal: 'load'
		// });
		self.checkStay();

		if (self.data.isIOS) {
			self.setData({
				showIosWifiGuide: true,
				showStep: 1,
			});
			self.stepAnimation();
			this.pageStatus.fromStay = true;
			return;
		}

		wx.getWifiList({
			success() {
				self.getSignal();
			},
			fail(err) {
				console.error("searchWiFi: fail! ", err);
				self.setData({
					needSignal: "stay",
				});
				cwx.showToast({
					title: "WiFi列表刷新失败，请稍后重试",
					icon: "none",
					duration: 1500,
				});
				const params = {
					hotelId: self.data.hotelID,
					errmsg: err.errMsg,
					errCode: err.errCode,
				};
				wifitrace.failGetWifiList(self, params);
				self.checkStay();
			},
			complete() {},
		});
	},

	/**
	 * new ios get signal guide page animation
	 */
	stepAnimation: function () {
		const self = this;
		this.info.stepTimer = setInterval(() => {
			let step = self.data.showStep;
			if (step === 4) {
				clearInterval(self.info.stepTimer);
			}
			step++;
			self.setData({
				showStep: step,
			});
		}, 600);
	},

	/**
	 * 点击识别附近WiFi跳转WiFi教程页面
	 */
	goWifiGuide: function () {
		this.setData({
			// showIOSGetSignal: false,
			showIosWifiGuide: true,
			showStep: 1,
		});
		this.stepAnimation();
		this.pageStatus.fromStay = false;
	},

	getIosWifiOpenCheck: function () {
		const self = this;
		const { wifiEnabled = false } = wx.getSystemInfoSync();
		self.ubtTrace("htl_c_wechat_wificonnect_click", { click_type: 1 });
		if (wifiEnabled) {
			self.ubtTrace("htl_c_wechat_wificonnect_toast_show", {
				IsRetryWiFiShow: "F",
			});
			self.setData({ showOpenWifiGPSConfirm: false });
			(async () => {
				let res = await self
					.generalWxPromise(wx.getConnectedWifi)()
					.catch((err) => err);
				if (res && res.wifi) {
					self.info.curWifiInfo = res.wifi;
				}
				self.buildWifiList();
			})();
			self.toastForNoWifi(0);
		} else {
			self.ubtTrace("htl_c_wechat_wificonnect_toast_show", {
				IsRetryWiFiShow: "T",
			});
			cwx.showToast({
				title: "正在检测WIFI状态, 请打开后连接",
				icon: "none",
				duration: 1500,
			});
		}
	},

	/**
	 * 去系统获取返回结果展示：
	 * 信号获取失败，均返回当前页面，并toast提示：获取失败，请再次尝试
	 * 获取成功，出已获取WiFi信号页面
	 */
	getIosSignal: function () {
		const self = this;
		self.setData({
			// needSignal: 'load',
			showIosWifiGuide: false,
			// showIOSGetSignal: !self.pageStatus.fromStay
		});
		this.checkStay();
		wx.getWifiList({
			success() {},
			fail(res) {
				console.error("searchWiFi: fail! ", res);
				self.setData({
					needSignal: self.pageStatus.fromStay ? "stay" : "fail",
				});
				cwx.showToast({
					title: "获取失败，请稍后重试",
					icon: "none",
					duration: 1500,
				});
				const params = {
					hotelId: self.data.hotelID,
					errmsg: res.errMsg,
					errCode: res.errCode,
				};
				wifitrace.failGetWifiList(self, params);

				self.checkStay();
			},
			complete() {},
		});
		self.getSignal();
	},

	closeSignalGuide: function () {
		this.setData({
			showIosWifiGuide: false,
		});
	},

	handleShowMore: function () {
		this.setData({
			showShortList: false,
		});
	},

	copyOrConnectWifi: async function () {
		const traceOptions = {
			page: this.data.pageId,
			button_type: "1",
		};
		wifitrace.errorClick(this, traceOptions);
		let { curWifi, isPwdErr, isIOS } = this.data;
		let { newPwd } = this.pageStatus;
		newPwd = newPwd || curWifi.password;
		let self = this;
		if (isPwdErr && newPwd) {
            this.setData({
                isDoingConnect: true,
                connectName: curWifi.SSID,
                connectState: "",
                isCopyWifiAlertShow: false,
            })
            
			// 用户输入新密码直接连接
			let wifi = Object.assign({}, curWifi, { password: newPwd });
			let { SSID, password } = wifi;
			let result = await new Promise((resolve) => {
				wx.connectWifi({
					SSID,
					password,
					success(res) {
						self.info.curWifiInfo = wifi;
						self.info.curWifiIndex = self.data.wifiList.findIndex(
							(info) => info.SSID === wifi.SSID
						);
                        if(isIOS){
                            self.checkConnectedWiFi.apply(self);
                            resolve(1);
                            return
                        }
                        self.setData({
                            connectState: "connected",
                            isDoingConnect: false,
						});
                        // 参数1用来区分是用户主动输入新密码直接连接
                        const type = self.pageStatus.newPwd ? (self.data.isShowNearByWifi ? 3 : 1) : 0
						self.traceSuccess(type);
                        self.updateEbkWifi()
                        resolve(1);
					},
					fail(err) {
						self.setData({
							connectedIndex: -1,
                            isDoingConnect: false,
                            showFailPage: !self.data.highStar,  //低星酒店输入密码连接失败跳失败页
						});
						resolve(0);
					},
				});
			});
            if(isIOS && curWifi?.status === 3) {
                return
            }

			cwx.showToast({
				title: result ? "连接成功" : "连接失败",
				icon: "none",
				duration: 1000,
			});
			if (!result) {
				(async () => {
					let res = await self
						.generalWxPromise(wx.getConnectedWifi)()
						.catch((err) => err);
					res &&
						!res.errMsg.includes("fail") &&
						self.traceSuccess(); /* 成功埋点 */
				})();
				return;
			}
			this.getCurWifiInfo(wifi);
			return;
		}
		// 复制密码，打开设置用户手动连接
		curWifi.password &&
			(await cwx.setClipboardData({
				data: curWifi.password,
				success(res) {
					cwx.showToast({
						title: "密码已复制",
						icon: "none",
						duration: 2000,
					});
				},
			}));
		try {
			if (isIOS) {
				// await wx.getWifiList(); // ios 打开手机的 设置-》wifi
			} else {
				await wx.connectWifi({
					SSID: curWifi?.SSID,
					password: newPwd,
					maunal: true,
				}); // 打开手机的 设置-》wifi
			}
		} catch (err) {
			console.error("err: ", err);
		}
		this.closeCopyWifiAlert();
		// isIOS && wx.offGetWifiList && await wx.offGetWifiList();
	},

    updateEbkWifi: async function () {
        const { hotelID, curWifi } = this.data
        const { newPwd } = this.pageStatus
        if(!curWifi?.SSID || !newPwd) {
            return
        }
        const reqData = {
            masterHotelId: hotelID,
            ssid: curWifi?.SSID,
            oldPassWord: curWifi?.password,
            newPassWord: newPwd
        }
        try {
            const res = await Api.updateEbkWifi(reqData);
        }catch (e) {
            console.error(e)
        }
    },

	generalWxPromise: function (api) {
		function func(options, ...params) {
			return new Promise((resolve, reject) => {
				api(
					Object.assign({}, options, {
						success: (res) => {
							resolve(res);
						},
						fail: reject,
					}),
					...params
				);
			});
		}
		return func;
	},

	traceSuccess: function (type) {
		/* 成功埋点 */
		let self = this;
        const {isShowNearByWifi, commonPassword, isSendMessageInWifiPage, hotelID} = self.data
        self.sendMessgae()
        const password = isShowNearByWifi ? commonPassword : self.info.curWifiInfo?.password
		self.info.curWifiInfo?.SSID &&
			wifitrace.sucConnected(self, {
				hotelId: self.data.hotelID,
				wifiName: self.info.curWifiInfo.SSID,
				wifitype:
					self.info.curWifiIndex >= 0
						? self.info.curWifiInfo.type
						: 2, // 是否为官方推荐
				isSecure: self.info.curWifiInfo.password ? true : false,
				materialKey: self.options.materialKey,
				model: self.pageStatus?.sysInfo?.model || "",
				brand: self.pageStatus?.sysInfo?.brand,
                BSSID: self.info.curWifiInfo?.BSSID || "",
                password: password || "",
                type: type || ""
			});
	},

    sendMessgae: function() {
        const {isSendMessageInWifiPage, hotelID} = this.data
        if(isSendMessageInWifiPage){
            Api.sendShortMessage({
                masterHotelId: hotelID,
                sendScene: "wifi_connect_suc"
            })
        }
    },
	handleBack: function (e) {
		let curPages = getCurrentPages();
		const { mini = "", aid: allianceid = "", codeID: b = "", sid = "", materialKey: key = "", hotelId: a = "", sourceFrom: channel = "" } = this.options || {};

		// 如果是通过冷启动，重定向到wifi落地页
		if (
			curPages.length > 1 &&
			curPages[0].pageId === "10320613574" &&
			curPages[1].pageId === "10650022492"
		) {
			let qs = `a=${this.options.hotelId}&b=${this.options.codeID}`;
			cwx.redirectTo({
				url: `/pages/hotelplanning/aggregate/main?${qs}&channel=wifi-landing`,
			});
		} else if (mini) {
			cwx.redirectTo({
				url: `/pages/hotelplanning/aggregate/main?a=${a}&b=${b}&channel=${channel}&source=wifi&allianceid=${allianceid}&sid=${sid}&key=${key}`,
			});
		} else {
			cwx.navigateBack();
		}
	},
	toastForNoWifi: function (num) {
		// Toast提示酒店没有在ebk维护可使用wifi列表
		let self = this;
		if (self.data.searchWifiList.length == num) {
			cwx.showToast({
				title: "抱歉！该酒店尚未维护wifi信息",
				icon: "none",
				duration: 3000,
			});
		}
	},
	bindConnectWifi: function (e) {
        const { isIntersection, isShowNearByWifi, isIOS } = this.data
        const currentClickWifi = e?.currentTarget?.dataset?.wifi || {};
        const { SSID, status = "" } = currentClickWifi
        if((!isIntersection || isIOS) && status == 3) {
            // status=3表示密码错误WIFI,展示密码输入弹窗，让用户手动输入密码连接
            this.setData({
                curWifi: currentClickWifi,
                isCopyWifiAlertShow: true,
                isPwdErr: true,
                isCopyJoinWifiAble: false
            })
        }else if ((isIntersection && !isShowNearByWifi) || status == 2) {
            // status=2表示WIFI名字错误，展示复制密码按钮
			this.showPassword(SSID);
		}else {
			// 点击连接WiFi防抖
			const debouceConnectWifi = this.debounce(
				this.connectWifi,
				500,
				false
			);
			debouceConnectWifi(e);
		}
	},
	showPassword: function (SSID) {
		const { searchWifiList = [] } = this.data;
		if (!SSID || searchWifiList.length < 0) return;
		let newSearchWifiList = cwx.util.copy(searchWifiList);
		newSearchWifiList.map((wifi, index) => {
			if (wifi.SSID === SSID) {
				newSearchWifiList[index].isShowPassword =
					!newSearchWifiList[index].isShowPassword;
			}
		});
		this.setData({
			searchWifiList: newSearchWifiList,
		});
	},
	copyWifiPassword: function (e) {
		const { SSID = "", password = "", status = "", signal } = e.currentTarget?.dataset?.wifi || {};
        const { showCopySignal, hotelID, isIntersection } = this.data
		//复制密码
		wx.setClipboardData({
			data: password || " ",
			success(res) {
			},
		});
        // 安卓跳转到系统设置页进行连接（ios暂不跳转，因为ios跳转到微信权限设置页，需要用户手动返回）
        if(!this.data.isIOS){
            if(!isIntersection && status == 2 && signal < showCopySignal){
                // 安卓弱信号WIFI 复制密码按钮 点击量
                const params = {
                    page: this.pageId,
                    masterhotelid: hotelID,
                    wifiname: SSID
                }
                wifitrace.weakSignalCopyPsw(this, params)
            }
            wx.connectWifi({
                SSID: SSID,
                password: password,
                maunal: true,
            })
        }
	},
	onClickShowPassword: function () {
		this.setData({
			showPassword: !this.data.showPassword,
		});
		const options = {
			type: "查看密码",
			page: this.data.pageId,
		};
		trace.wifiConnClick(this, options);
	},
	openModal: function () {
		const { pageId, communityQRCode, hotelID } = this.data;
		this.setData({
			isShowModal: true,
		});
		const clickOptions = {
			type: "社群模块",
			page: pageId,
			typevalue: {
				masterhotelid: hotelID,
				window_type: communityQRCode?.qrCodeType,
			},
		};
		trace.wifiConnClick(this, clickOptions);

		const showOptions = {
			page: pageId,
			window_type: communityQRCode.qrCodeType,
			masterhotelid: hotelID,
		};
		trace.groupToastShow(this, showOptions);
	},
	setVipLayerShow: function () {
		const child = this.selectComponent("#yoyocard");
		if (child) {
			child.setVipLayerShow && child.setVipLayerShow();
		}
	},
	onGetVipCardSuccess: function () {
		this.fetchModuleList();
	},
	handlePasswordToast: function (e) {
		const { showPasswordToast, isShowNearByWifi, commonPassword } = this.data;
		if (!showPasswordToast) {
			const { type } = e?.currentTarget?.dataset || {};
			if (type === "notConectTip") {
				wifitrace.passwordToastClick(this, { page: this.pageId });
			}
			wifitrace.passwordToastShow(this, { page: this.pageId });
			//复制密码
			wx.setClipboardData({
				data: isShowNearByWifi ? commonPassword : (this.info.curWifiInfo?.password || ""),
				success(res) {
				},
			});
		}
		this.setData({
			showPasswordToast: !showPasswordToast,
		});
	},
	handleCopyPassword() {
		const { curWifi } = this.data;
		wx.setClipboardData({
			data: curWifi?.password || "",
			success(res) {
			},
		});

		this.setData({
			showCopyToast: true,
		});

		wifitrace.wifiCopyPassword(this, { page: this.data.pageId });
	},

	xshuaiAuth() {
		if (this.xshuaiInfo?.url)
			// 如果是投屏渠道，拿到url后进行授权
			cwx.request({
				url: this.xshuaiInfo?.url,
				method: "GET",
				timeout: 2000,
				success: (res) => {
					if (res.data === "ok") {
						cwx.showToast({
							title: "投屏功能已授权",
							icon: "none",
							duration: 3000,
						});
					} else {
						cwx.showToast({
							title: "授权失败，请稍后再试",
							icon: "none",
							duration: 3000,
						});
					}
				},
				fail: (err) => {
					// 请求失败表示用户未连wifi，无法访问授权url
					cwx.showToast({
						title: "授权失败，请稍后再试",
						icon: "none",
						duration: 3000,
					});
				},
			});
	},

	/**
	 * 影音房投屏功能
	 * @param {*} codefrom 
	 */
	async isXshuai(codefrom) {
		const _self = this
		const {tpid,scene} = this.options
		if (codefrom) {
			wx.onWifiConnected((res)=>{
		       if (res && res.wifi) {
		       if (res.wifi.SSID == _self.xshuaiInfo?.ssid) {
		       	 _self.xshuaiAuth();
		       }
		    }
		   	})
			let res = {}
			if(scene === 'third'){
				res = await Api.getThirdPartyUrl({
					appid: tpid,
					devid: codefrom 
				})
			}else{
				res = await Api.videoRoom({
					codefrom,
				});
			}
			const { code, data = {} } = res;
			const { ssid = "", password = "", url = "" } = data;
			if (code === "0" || data.code === 0) {
				this.setData({
					xshuaiInfo: {
						ssid,
						password,
						url,
					},
				});
				this.xshuaiInfo = {ssid, password, url}
			}
		}
	},

	xshuaiConnectWifi() {
		this.info.curWifiInfo = this.info.originList[0];
		let currentWifi = this.info.curWifiInfo;
		const self = this;
		self.setData({
			isDoingConnect: true,
		});
		wx.connectWifi({
			SSID: currentWifi?.SSID || '',
			password: currentWifi?.password || "",
			success(res) {
				self.checkConnectedWiFi.apply(self);
			},
			fail(err) {
				if (self.isEnableHotelWhiteList()) {
					self.setData({
						isDoingConnect: false,
						connectedIndex: -1,
					});
					self.pageStatus.isPwdErr = err.errCode === 12002;
				} else {
					self.setData({
						isDoingConnect: false,
						connectedIndex: -1,
					});
					self.pageStatus.isPwdErr = err.errCode === 12002;
				}
				self.showCopyWifiAlert(currentWifi);
				/* 埋点 */
				self.failtrace(err, "wxConnectWifi");
				self.checkStay();
				clearInterval(self.info.timer);
				self.info.timer = setInterval(
					self.handleStayState,
					self.pageStatus.stayTime
				);
			},
		});
	},

	isXshuaiConnected() {
    	const _self = this;
		if (this.xshuaiInfo?.ssid) {
			wx.getConnectedWifi({
				success(res) {
					if (res && res.wifi) {
						if (res.wifi.SSID == _self.xshuaiInfo?.ssid) {
							_self.xshuaiAuth();
						} else {
							_self.xshuaiConnectWifi();
						}
					}
				},
				fail() {
					_self.xshuaiConnectWifi();
				},
				complete() {},
			});
		} else {
			return;
		}
	},

    closeSearchMask() {
        this.setData({
            isShowSearchMask: false,
            isFocus: true
        })
    },
    closeFocus() {
        this.setData({
            isFocus: false
        })
    },
    openSetting() {
        let self = this
        wx.openSetting({
            success(res) {
                self.checkWifiGPSOpened()
            }
        })
    },
    callHotelPhone() {
        cwx.makePhoneCall({
            phoneNumber: this.data.hotelTel
        });
    }
});
