import { cwx, CPage, __global, _ } from "../../../cwx/cwx.js";
import Api from "../common/apis/restapi";
import hPromise from "../common/hpage/hpromise";
import trace from "../common/trace/smztrace";
import smztrace from "../common/trace/smztrace";
import commonfunc from "../common/commonfunc";
import DateUtil from "../common/utils/date.js";
import commonrest from "../common/commonrest";
import storageUtil from "../common/utils/storage";

const detaildata = require("../components/roomlist/detaildata.js");
const huser = require("../common/hpage/huser");
const BaseGeo = require("../common/geo/basegeo");
const util = require("../common/utils/util.js");
const urlUtil = require("../common/utils/url");
import C from '../common/Const.js';

const { ZERO_WIFI, FRONT_DESK, HIGHSTAR_QR, GROUP_QR } = C;
cwx.onAppHide(() => {
	// 监听onapphide事件，埋点
	const cPage = cwx.getCurrentPage();
	if (cPage && cPage.pageId === C.WIFI_AGGREGATE_PAGEID) {
		cPage.ubtTrace("189996", {
			click_type: "2",
			source: C.WIFI_AGGREGATE_SOURCE,
		});
	}
});


const aggregateCore = {
	hoteldetailAjaxUrl: "gethoteldetail",
	data: {
        pageId: "",
		hotelId: "",
		codeID: "",
		allianceid: "",
		sid: "",
		unionVipFunc: {},
		uninonVipType: "",
		hotelDetail: {},
		isIPhoneX: false,
		showCustomNav: commonfunc.showCustomNav(),
		hotelBaseInfo: {},
		navBarHeight: 0,
		waterModuleSwitch: false, // 瀑布流开关-酒店维度
		waterFllowSwitch: false,
		showGoTop: false,
		inday: DateUtil.today(),
		outday: DateUtil.tomorrow(), // 带入房型日历组件的参数
		continueLiveSwitch: false, // 续住开关-酒店维度
		mediaPreviewer: {
			showMediaPreviewer: false, // 是否展示点评预览组件
			title: "",
			content: "",
		},

		isSubRoomLayerHidden: true,
		refactorList: [],
		officialuid: "",
		communityQRCode: {},
		telephone: "",
		scrollTopValue: 0,
		hasLogin: false,
		noBenefit: true, // 无优惠券 && 无权益
		enableFullRoomApply: false, //满房申请参数
		appscan: 0,
		isOrderCode: false,
		personalRecommendSwitch: true,
		showBenefitList: false,
		groupQRCode: {}, // 平台企微
		showBack: false, // 是否展示返回按钮
		matchedRoomParam: {},
		showPmsLayer: false,
		disablePlatformDiscount: false,
		bannerList: [],
		isBannerShow: false,
		modals: {
			[ZERO_WIFI]: false,  // 灰wifi弹窗
			[FRONT_DESK]: false, // 联系前台弹窗
			[HIGHSTAR_QR]: false, // 高星/员工码弹窗
			[GROUP_QR]: false, // 平台企微弹窗
		},
        isShowVipCardToast: true,
        isShowSubscribeMessage: true,
        isSendMessageInWifiPage: false,
	},

	pageStatus: {
		fromLogin: false, // 从登陆页返回状态
		afterCouponBooking: false, // 领券订返回
		needRefreshRoomList: false, // 需要重刷房型列表（填写页不可订返回）
		bannerItemStore: [], // banner列表
		modalStrategies: {   // 配置弹窗关闭开启时执行的回调，没有回调可以不写
			[FRONT_DESK]: {
				open() {
					const options = {
						page: this?.pageId,
						masterhotelid: this?.data?.hotelId,
						window_type: this?.data?.communityQRCode?.qrCodeType,
					};
					trace.groupModalShow(this, options);
				}, 
				close() {
					this.showHotelTelModal(1); 
				}
			},
			[GROUP_QR]: {
				open(detail) {
					if (detail) {
						const { popupShortTitle = "", popupTitle = "", qrCodeUrl = "", qrCodeType = 0, isNewABTest = false } = detail;
						this.setData({
						  groupQRCode: {
							type: "wifi_wework",
							popupShortTitle,
							popupTitle,
							qrCodeUrl,
							qrCodeType,
                            isNewABTest
						  },
						})
					}
				}, 
				close() {
                    this.setData({
                        [`modals.${GROUP_QR}`]: false
                    });
                    if(this.data?.groupQRCode?.isNewABTest) {
                        const {hotelId, codeID, allianceid, sid, sourceFrom, materialKey, scene} = this.data
                        cwx.navigateTo({
                            url: `../market/wifi/index?hotelId=${hotelId}&codeID=${codeID}&aid=${allianceid}&sid=${sid}&sourceFrom=${sourceFrom}&materialKey=${materialKey}&scene=${scene}`,
                        });
                    }
				}
			}
		}
	},
	onLoad: async function (options = {}) {
		const { a: hotelId = "", b: codeID = "", eid = "", key: materialKey = "", channel = "", appscan = "", source = "", appid = "", allianceid = "", sid = "", scene = "", showcoupon = "", mini = "", isOpenCouponModal = "" } = options || {};
		const { AGGREGATE_SOURCE, EMPLOYEE_SOURCE, AUTO_GET_VIP_CARD_SWITCH, WATERFALL_SWITCH, SWITCH_SUBSCRIPT, SUBSCRIPT_TEMPLATEIDS_ROOM, EMPLOYEE_APP_SCAN, SCAN_IN_PRICE_TAG, ORDER_ROOM_CIKA_SWITCH, LIVE_IN_CIKA_SWITCH, QUESTIONNAIRE_TITLE, QUESTIONNAIRE_URL_WEBVIEW, LIMIT_CHOOSE_DAY, CALENDAR_LIMIT_CHOOSE_DAY } = C;
		const { personalRecommendSwitch = true } = await cwx.getPRSetting(); // 获取个推开关
		const isOrderCode = channel && (channel === AGGREGATE_SOURCE || channel === EMPLOYEE_SOURCE); // 判断订房码
		const { inday = DateUtil.today(), outday = DateUtil.tomorrow(), matchedRoomParam = {} } = await this.getPmsOrderInfo(isOrderCode); // 获取去呼呼匹配信息
		this.options = options || {};
		this.options.b = codeID;
		this.scrollTopValue = 0;

        // 新版落地页 source 和 pageId 需要重新赋值
        this.source = channel ? channel : this.source;

		// 获取当前页面 url
		const currentPage = cwx.getCurrentPage();
		const currentUrl = urlUtil.setParams(
			currentPage.route,
			currentPage.options
		);

		// 埋点
		this.sendPV(channel, currentUrl);
		this.traceScene(hotelId, channel, source, scene, appscan, mini);

		// 开关 && 配置
		const keys = [
			AUTO_GET_VIP_CARD_SWITCH, // 自动领卡开关
			WATERFALL_SWITCH, // 信息流（高星达人探店）总开关
			SWITCH_SUBSCRIPT, // 订阅消息总开关
			SUBSCRIPT_TEMPLATEIDS_ROOM, // 订阅消息模板
			EMPLOYEE_APP_SCAN, // 员工码扫码一口价开关
			SCAN_IN_PRICE_TAG, // 扫码一口价标签名称
			ORDER_ROOM_CIKA_SWITCH, // 订房码次卡开关
			LIVE_IN_CIKA_SWITCH, // 住中码次卡开关
			QUESTIONNAIRE_TITLE, // 问卷调查标题
            QUESTIONNAIRE_URL_WEBVIEW, // 问卷调查h5链接
			LIMIT_CHOOSE_DAY, // 日历最大可选时间
		];
		commonrest.getWechatSoaSwitch(keys, (data) => {
			const configObj = data?.result;
			if (configObj) {
				this.setData({
					autoGetVipCard: configObj[AUTO_GET_VIP_CARD_SWITCH] === "1",
					waterFllowSwitch: configObj[WATERFALL_SWITCH] === "1",
					switchUserSubscript: configObj[SWITCH_SUBSCRIPT] === "1",
					subscriptTemplateIds:
						JSON.parse(configObj[SUBSCRIPT_TEMPLATEIDS_ROOM] || "[]") || [],
					enableFullRoomApply: isOrderCode,
					appscan:
					    configObj[EMPLOYEE_APP_SCAN] === "1" && appscan === "1"
							? 1
							: 0,
					scanPriceTag: configObj[SCAN_IN_PRICE_TAG] || "",
					cikaSwitch: isOrderCode ? configObj[ORDER_ROOM_CIKA_SWITCH] === "1" : configObj[LIVE_IN_CIKA_SWITCH] === "1", // 订房码和住中码次卡读不同开关
					calendarLimitChooseDay: configObj[LIMIT_CHOOSE_DAY] || CALENDAR_LIMIT_CHOOSE_DAY
				});

				const isShowQuestionnaire = !isOrderCode && !!configObj[QUESTIONNAIRE_TITLE] && !!configObj[QUESTIONNAIRE_URL_WEBVIEW];
				if (isShowQuestionnaire) {
					this.pageStatus.bannerItemStore.push({
						bannerModuleName: "questionnaire",
						moduleType: 2,
						title: "问卷调研",
						buttonText: "立即参与",
						shortTitle: configObj[QUESTIONNAIRE_TITLE],
						url: configObj[QUESTIONNAIRE_URL_WEBVIEW]
					})
				}

				this.createTasksPromise(hotelId, codeID);
			} else {
				util.logException(this, 1, "getH5SwitchResult", this.pageId);
			}

			this.initTrace(hotelId, this.source);
		}, 'json');

		// 酒店详情
		detaildata.doRequest(
			options,
			this.detailLoad.bind(this),
			this.detailLoadErr.bind(this),
			this
		);

		this.setData({
			hotelId,
			codeID,
			allianceid,
			sid,
			isIPhoneX: util.isIPhoneX(), // Judge is iphone x
			source: this.source,
			navBarHeight: this.getNavBarHeight(),
			materialKey,
			scene,
			wifiPageUrl: currentUrl,
			showBenefitList: (showcoupon && showcoupon === "1") || isOpenCouponModal === "1", // 企微菜单栏来源带showcoupon参数唤起优惠券浮层
            eid,
            pageId: this.pageId,
			personalRecommendSwitch, //个性化推荐开关
			isOrderCode, // 新版落地页 如果source是员工码或者前台码， isOrderCode为true（icon两行展示）
			inday,
			outday,
			matchedRoomParam
		});
	},

	sendPV(channel, currentUrl) {
        if(channel) {
            switch(channel) {
                case C.HIGH_WIFI_AGGREGATE_SOURCE:
                    this.pageId = C.HIGH_WIFI_AGGREGATE_PAGEID;
                    break;
                case C.WIFI_AGGREGATE_SOURCE:
                    this.pageId = C.WIFI_AGGREGATE_PAGEID;
                    break;
                case C.AGGREGATE_SOURCE:
                    this.pageId = C.AGGREGATE_PAGEID;
                    break;
                case C.EMPLOYEE_SOURCE:
                    this.pageId = C.EMPLOYEE_PAGEID;
                    break;
                default:
                    break;
            }

            this.ubtSendPV({
				pageId: this.pageId,
				url: currentUrl,
			});
        }
	},

	traceScene(hotelId, channel, source, scene, appscan, mini) {
		let traceSource = channel || source || this.source;
		// moments-企微朋友圈渠道特殊source, ygm-员工码欢迎语卡片渠道, OfficialAccounts-员工码公众号渠道埋点, fenxiangbendian-分享本店渠道埋点
		if (["moments", "ygm", "OfficialAccounts", "fenxiangbendian"].includes(scene)) {
			traceSource = scene;
		}
		if (appscan === "1") {
			// app扫码渠道标识
			traceSource = "appscan";
		}
		if (mini === "ctripwechat") {
			traceSource = "ctripwechat";
		}
		trace.pageScene(this, {
			page: this.pageId,
			scene_value: cwx.scene,
			source: traceSource,
			masterhotelid: hotelId,
			sourceFrom: this.source,
		});
	},

	getNavBarHeight() {
		const systemInfo = wx.getSystemInfoSync();
		// 胶囊按钮位置信息
		let navBarHeight = 0;
		let menuButtonInfo = null;
		try {
			// wx.getMenuButtonBoundingClientRect在某些机型上会偶尔报错
			menuButtonInfo = wx.getMenuButtonBoundingClientRect();
		} catch (e) {
			console.error(e);
			return navBarHeight;
		}
		// 导航栏高度 = 状态栏到胶囊的间距（胶囊距上距离-状态栏高度） * 2 + 胶囊高度 + 状态栏高度
		if (menuButtonInfo && systemInfo) {
			navBarHeight =
				(menuButtonInfo.top - systemInfo.statusBarHeight) * 2 +
				menuButtonInfo.height +
				systemInfo.statusBarHeight;
		}
		return navBarHeight;
	},

	async getPmsOrderInfo(isOrderCode) {
		let { inday, outday, a: masterHotelId = "" } = this.options || {};
		
		// wifi落地页下午2点之前今住明离，2点之后明住后离
		if (!isOrderCode) {
			const d = new Date();
			inday = inday || (d.getHours() < 14 ? DateUtil.today() : DateUtil.tomorrow());
			outday = outday || (d.getHours() < 14 ? DateUtil.tomorrow() : DateUtil.aftertomorrow());
			return {
				inday,
				outday
			}
		}
		
		const isLogin = await huser.checkLoginStatus(true);
		if (!isLogin) {
			return {
				inday,
				outday
			}
		}

		const data = await Api.matchPmsOrderInfo({ masterHotelId });
		const { checkIn, checkOut, guestName, guestPhone, saleRoomId } = data?.matchOrderInfo || {};

		if (!saleRoomId) {
			return {
				inday,
				outday
			}
		}

		return {
			inday: checkIn,
			outday: checkOut,
			matchedRoomParam: {
				guestName,
				guestPhone,
				saleRoomId
			}
		}
	},

	onSaveExitState: function () {
		var exitState = {}; // 需要保存的数据
		return {
			data: exitState,
			expireTimeStamp: Date.now() + 2 * 24 * 60 * 60 * 1000, // 超时时刻
		};
	},

	onShow: function () {
		if (this.pageStatus.afterCouponBooking) {
			// booking领券订返回(包含重刷优惠券列表和房型列表)
			this.reloadCouponList();
			this.pageStatus.afterCouponBooking = false;
		} else if (this.pageStatus.needRefreshRoomList) {
			// 填写页返回刷房型(不可订等)
			this.reloadRoomList();
			this.pageStatus.needRefreshRoomList = false;
		}
		this.getLoginStatus();
		this.setData({
			showBack: cwx?.scene === 1089 || cwx?.scene === 1001, // 区分场景放开返回按钮
		});
	},

	detailLoad: function (res) {
		const { isOversea } = res;

		this.setData({
		    hotelBaseInfo: res,
			biz: parseInt(this.options.biz)? parseInt(this.options.biz) : isOversea ? 2 : 1
		});
	},

	detailLoadErr(err) {
		let type = err ? 0 : 1;
		util.logException(this, type, "gethoteldetail", this.pageId);
	},

	// 房型列表加载成功回调
	roomlistLoadSuccess() {
	},

	transModuleList: function (moduleList = {}) {
        const { sourceFunctions: refactorList = [], unionVip = {}, success: isSuccessModule, errorMessage = '', roomListSwitch = false, telephone = '' } = moduleList || {};

		// 联合会员判断
		let unionVipFunc = {};
		let uninonVipType = C.UNIONVIP_FETCHED;
		if (unionVip.hasOpenUnionVip) {
			if (unionVip.isBlackListHotel || !unionVip.isSwitchEnable) {
				// 屏蔽黑名单 + 开关未开启
				uninonVipType = "";
			} else if (unionVip.hasBindUnionVip) {
				uninonVipType = C.UNIONVIP_FETCHED;
				unionVipFunc = unionVip;
				this.thirdAuthorize()
				if (!this.notToXshuai) {
					this.xshuaiToWifi();
				}
			} else {
				uninonVipType = C.UNIONVIP_PENDING;
				unionVipFunc = unionVip;
			}
		} else {
			uninonVipType = "";
		}

		return {
			unionVipFunc,
			uninonVipType,
			continueLiveSwitch: roomListSwitch && uninonVipType,
			refactorList,
			isSuccessModule,
			errorMessage,
			telephone
		};
	},

	createTasksPromise: async function (hotelId, codeID, fromGetCard = false, fromLogin = false) {
        const { SEND_MESSAGE_DOWNLOAD_TEST, CID_AB_TEST } = C
		let tasks = [];
		tasks.push(
			Api.getSmzModuleListV3({
				hotelId: hotelId,
				codeID: codeID,
				source: this.getModuleSource(),
				unionId: cwx.cwx_mkt.unionid,
			})
		);
        // 发送短信引导平台新客下载app 实验
        tasks.push(
            Api.getAbTestVersion({
                abTestName: SEND_MESSAGE_DOWNLOAD_TEST,
                testDivisionType: CID_AB_TEST
            })
        );
     
		hPromise.all(tasks)
			.then(
				(res) => {
					this.handleCreateTasks(res, fromGetCard, fromLogin);
					if (this.checkException(res)) {
						util.logException(this, 1, "SmzGetModuleListV3", this.pageId);
					}
				}
			)
	},

	getModuleSource() {
		let source = this.source;
		
		if (this.source === C.HIGH_WIFI_AGGREGATE_SOURCE) {
			source = "high_star";
		} else if (this.source === C.WIFI_AGGREGATE_SOURCE) {
			source = "not_high_star";
		} else if (this.source === C.AGGREGATE_SOURCE) {
			source = "front_desk";
		}

		return source;
	},

	initTrace: function (hotelId, source) {
		cwx.mkt.getUnion((data) => {
			const allianceid = data?.allianceid || "";
			const sid = data?.sid || "";
			this.setData(
				{
					allianceid,
					sid,
				});
			trace.pageLoad(this, { hotelId, source, allianceid, sid });
		});
	},

	onShareAppMessage: function (res) {
		// return custom share data when user share.
		const desc = "住得好一点，很有必要，携程让你的每一天都成为一种享受";
		const { hotelBaseInfo = {}, inday, outday, biz, source } = this.data;
		const { commentScore, commentTags, name = "", shareLogo } = hotelBaseInfo || {};
		const { a, b, allianceid, sid, eid, channel } = this.options;
		
		this.ubtTrace("189996", {
			click_type: "3",
			source: this.source,
			sourceFrom: source,
			id: a,
			inday,
			outday,
			biz,
			subtab: biz === 1 ? "inland" : "oversea",
			isctripshare: res?.from === "button" ? "T" : "F", // 成功分享埋点，区分携程与微信分享按钮
		});

		let title = "";
		if (commentScore > 3.5) {
			let commentTag =
				commentTags && commentTags.length > 0
					? commentTags[0] + ","
					: "";
			title =
				"评分" +
				commentScore.toFixed(1) +
				"分," +
				commentTag +
				name;
		} else {
			title =
				"在吗？我发现了一家超棒的酒店，" +
				name;
		}

		let path = `/${this.route}?a=${a}&b=${b}&allianceid=${allianceid}&sid=${sid}&eid=${eid}&channel=${channel}`;
		if (cwx.clientID) {
			path += `&sf=${cwx.clientID}`;
		}

		return {
			bu: "hotel",
			title: title,
			desc: desc,
			path: path,
			imageUrl: shareLogo || "",
		};
	},

	handleScrollToLower: function (e) {
		if (this.waterfallInfo) {
			this.waterfallInfo.getListMore();
		}
	},

    onMainVersionScroll: util.throttle(function (e) {
		const scrollTop = e?.detail?.scrollTop || 0;
		if (scrollTop > 60 && this.source === C.HIGH_WIFI_AGGREGATE_SOURCE) {
			this.setData({
				showGoTop: !!(scrollTop > 600),
			});
		}
		this.scrollTopValue = scrollTop;
	}, 300),

	handleCreateTasks: function (result = [], isRefresh = false, isFromLogin = false) {
		const moduleList = result[0];
		const {
			unionVipFunc,
			uninonVipType,
			continueLiveSwitch,
			refactorList,
			isSuccessModule,
			telephone,
			errorMessage,
		} = this.transModuleList(moduleList);

        // 登录 && 已领卡用户进行去呼呼匹配
		if (isFromLogin && moduleList?.unionVip?.hasBindUnionVip) {
			this.pageStatus.fromLogin = true;
		}
		//获取酒店是否屏蔽随机立减
		const subtract = refactorList.find((item) => item.id === '35');//根据随机立减对应id找到该模块 随机立减id: 35
		//构造bannerList，埋点约定企微1，问卷2
		const isQRCodeShow = moduleList.communityQRCode?.qrCodeType === 1;
		if (isQRCodeShow) {
			this.pageStatus.bannerItemStore.push({
				bannerModuleName: "communityQRCode",
				...moduleList.communityQRCode,
				moduleType: 1
			})
		}
        const { EMPLOYEE_SOURCE, WIFI_AGGREGATE_SOURCE, HIGH_WIFI_AGGREGATE_SOURCE } = C
        if(this.source === EMPLOYEE_SOURCE){
            // 员工码 取消领卡弹窗，取消订阅消息授权
            this.setData({
                isShowVipCardToast: false,
                isShowSubscribeMessage: false
            })
        }

        if(this.source === WIFI_AGGREGATE_SOURCE || this.source === HIGH_WIFI_AGGREGATE_SOURCE){
            const messageABResult = result[1] || {}
            let messageVersion = "A"
            if(messageABResult && messageABResult.resultCode == 0 && messageABResult.version){
                messageVersion = messageABResult.version
            }
            // B版 进wifi连接页，成功连接WIFI后，触发短信
            // C版 进wifi码落地页，触发短信
            if(messageVersion === "C"){
                Api.sendShortMessage({
                    masterHotelId: this.data.hotelId,
                    sendScene: "wifi_landing"
                })
            }else if(messageVersion === "B"){
                this.setData({
                    isSendMessageInWifiPage: true
                })
            }
        }
		
		this.setData(
			{
				refactorList,
				unionVipFunc,
				uninonVipType,
				waterModuleSwitch: moduleList.waterModuleSwitch,
				communityQRCode: moduleList.communityQRCode || {},
				continueLiveSwitch,
				showPmsLayer: (!isRefresh || this.pageStatus.fromLogin) && uninonVipType === C.UNIONVIP_FETCHED,
				disablePlatformDiscount: subtract ? !subtract.open : false,
				bannerList: this.pageStatus.bannerItemStore.sort((a, b) => a.moduleType - b.moduleType),
				isBannerShow: this.pageStatus.bannerItemStore.length > 0 && !errorMessage,
				telephone,
			},
			() => { 
				this.traceBannerExpose(); 
			} // 保证第0个数据加载完毕后曝光，发送埋点
		);

		!isSuccessModule && errorMessage && this.showEmptyModule(errorMessage); // 酒店未开通联合会员
		this.waterfallInfo = this.selectComponent("#waterfallInfo"); // 获取waterfall 对象
	},

	backToHotelSearchPage() {
		this.ubtTrace("189996", {
			click_type: "4",
			source: this.source,
			sourceFrom: this.data.source,
		});
		cwx.redirectTo({ url: "/pages/hotel/inquire/index" });
	},

	showEmptyModule: function (text) {
		cwx.showModal({
			content: text,
			showCancel: false,
			confirmText: "知道了",
			success: function (res) { },
		});
	},

	/**
	 * 回到顶部
	 */
	goTop: function () {
		let self = this;
		self.setData({
			scrollTopValue: 0,
			showGoTop: false,
		});
	},

	noop: function () {
		return;
	},

	closeMediaPreviewer() {
		this.setData({
			"mediaPreviewer.showMediaPreviewer": false,
		});
	},
	
	handleClickExplore(e) {
		const itemdata = e?.detail || {};
		const {
			dataType,
			title,
			mediaTitle,
			content,
			detailPictureUrlList,
			avatarUrl,
			authorTypeName,
			authorTypeClass,
			nickName,
			authorLevel,
			h5Url,
			wxUrl,
		} = itemdata;
		let authorVipIcon = "";
		if (authorLevel === "1") {
			authorVipIcon =
				"https://pages.c-ctrip.com/hotels/wechat/market/smz/aggregate/yellow_vip.png";
		} else if (authorLevel === "2") {
			authorVipIcon =
				"https://pages.c-ctrip.com/hotels/wechat/market/smz/aggregate/blue_vip.png";
		}
		/** 埋点 */
		let logInfo = {
			jumpurl: wxUrl || h5Url,
			biztype:
				dataType === 1 ? "guidence" : dataType === 2 ? "comment" : "",
			masterhotelid: this.data.hotelId,
			sourceFrom: this.data.source,
		};
		this.ubtTrace("188485", logInfo);

		if (dataType === 2) {
			this.setData({
				"mediaPreviewer.showMediaPreviewer": true,
				"mediaPreviewer.title": mediaTitle,
				"mediaPreviewer.content": title,
				"mediaPreviewer.mediaList": detailPictureUrlList,
				"mediaPreviewer.authorInfo": {
					avatarUrl,
					authorTypeName,
					authorTypeClass,
					nickName,
					authorLevel,
					authorVipIcon,
				},
			});
		}
		if (dataType === 1) {
			if (wxUrl) {
				cwx.navigateTo({
					url: wxUrl,
				});
				return;
			} else if (h5Url) {
				cwx.navigateTo({
					url:
						"/pages/hotel/components/webview/webview?data=" +
						JSON.stringify({
							url: encodeURIComponent(h5Url),
						}),
				});
				return;
			} else {
				this.setData({
					"mediaPreviewer.showMediaPreviewer": true,
					"mediaPreviewer.title": mediaTitle,
					"mediaPreviewer.content": title,
					"mediaPreviewer.mediaList": detailPictureUrlList,
					"mediaPreviewer.authorInfo": {
						avatarUrl,
						authorTypeName,
						authorTypeClass,
						nickName,
						authorLevel,
						authorVipIcon,
					},
				});
			}
		}
	},


	triggerRoomLayer() {
		this.setData({
			isSubRoomLayerHidden: !this.data.isSubRoomLayerHidden,
		});
	},

	reloadRoomList() {
		const child = this.selectComponent("#room-list-new");
		if (child) {
			child.reqRoomList();
		}
	},

	reloadCouponList() {
		const couponChild = this.selectComponent("#coupon-list");
		if (couponChild) {
			couponChild.checkCouponStatus();
		}
	},

	checkException(res) {
		return !res || res.result === false;
	},

	logRoomException(e) {
		let detail = e?.detail;
		if (detail) {
			util.logException(this, detail.type, detail.errVal, this.pageId);
		}
	},

	resetInAndOutDay(e) {
		const self = this;
		if (e && e.detail) {
			self.setData(
				{
					inday: e.detail.inDay,
					outday: e.detail.outDay
				},
				() => {
					const coupon = self.selectComponent("#coupon-list");
					if (coupon) {
						coupon.pageOnload();
					}
				}
			);
		}
	},

	openQrCodeModal() {
		this.openCModal({
			detail: {
				modalName: HIGHSTAR_QR
			}
		});
    },

	callPhone() {
		const event = {
			detail : {
				modalName: C.FRONT_DESK
			}
		}
		this.closeCModal(event);
	},

	showHotelTelModal(source) {
		// source 1:金刚去点击联系弹窗 2:无wifi点击电话
		const options = {
			page: this.pageId,
			source,
			masterhotelid: this.data.hotelId,
		};
		trace.callPhoneClick(this, options);
		let { telephone } = this.data;
		if (telephone) {
			cwx.makePhoneCall({
				phoneNumber: telephone
			});
		} else {
			cwx.showToast({
				title: "电话补录中",
				icon: "none",
				duration: 2000,
			});
		}
	},

	showNoWifiHotelTelModal() {
		this.showHotelTelModal(2);
	},

	receiveCouponBooking: function () {
		this.pageStatus.afterCouponBooking = true;
		this.pageStatus.needRefreshRoomList = true;
	},

	onToggleSubRoom: function (e) {
		const { rect = {} } = e?.detail || {};
		const { top } = rect || {};
		const { navBarHeight } = this.data;
		const newScrollTopValue = this.scrollTopValue + top - navBarHeight;
		if (
			newScrollTopValue > 0 &&
			navBarHeight > 0 &&
			top > 0 &&
			this.scrollTopValue >= 0
		) {
			this.setData({
				scrollTopValue: newScrollTopValue,
			});
		}
	},

	async onVipCardModalClose() {
        if(!this.data.isShowSubscribeMessage){
            return
        }
        //消息订阅
		this.openSubscribeMessage(
			this.postUserSubsInfo.bind(this),
			null,
			() => {
				// 订阅消息关闭后出去呼呼浮层
				this.setData({
					showPmsLayer: true
				})
			}
		);
	},

	onGetVipCardSuccess() {
		const coupon = this.selectComponent("#coupon-list");
		if (coupon) {
			coupon.pageOnload();
		}
		this.reloadRoomList();
	},

	onGetVipCardFinish() {
		this.notToXshuai = true;
		this.thirdAuthorize()
		this.xshuaiToWifi();
		this.createTasksPromise(this.data.hotelId, this.options.b, true);
	},

	setVipLayerShow() {
		let child = this.selectComponent("#yoyocard");

		if (child) {
			child.setVipLayerShow && child.setVipLayerShow();
		}
	},

	goLogin: function () {
		const self = this;
		huser.login({
			param: {
				IsAuthentication: "F",
			},
			async callback(res) {
				if (res && res.ReturnCode === "0") {
					// 登录成功返回页面，重新请求modulelistV3、刷新房型列表
					self.createTasksPromise(self.data.hotelId, self.data.codeID, false, true);

					// 订房码非强登异常情况兜底，请求去呼呼接口拿入离日期重刷房型列表
					if (self.data.isOrderCode) {
						const { inday = DateUtil.today(), outday = DateUtil.tomorrow(), matchedRoomParam = {} } = await self.getPmsOrderInfo(self.data.isOrderCode);
						self.setData({
							inday,
							outday,
							matchedRoomParam
						}, () => {
							self.initRoomDate();
							self.reloadCouponList();
						})
						return
					}
					self.reloadCouponList();
				}
			},
		});
	},


	getLoginStatus: function () {
		huser.checkLoginStatus(true).then((isLogin) => {
			this.setData({
				hasLogin: isLogin
			});
		});
	},

	// 更新无优惠券&&无权益样式，房型列表上方增大padding预留位置
	updateNoBenefit(e) {
		if (e && e.detail) {
			this.setData({
				noBenefit: e.detail.noBenefit,
			});
		}
	},
  
	// 小帅影音房渠道 调用对方接口触发设备登录
	callXShuaiAuthorize() {
		const { scene, codefrom } = this.options;
		if (scene !== "xshuai") return;
		const [_, from] = codefrom?.split("_");
		if (from === "Tp") {
			this.xshuaiWifi = codefrom;
			return;
		}
		Api.videoRoom({
			codefrom,
		}).then((res) => {
			const { code } = res;
			if (code === "0" && from === "Vod") {
				cwx.showToast({
					title: "已解锁播放权益",
					icon: "none",
					duration: 3000,
				});
			}
		});
	},

	noImageTrace(e) {
		let errMsg = e?.detail?.errMsg || "";
		const param = {
			page: this.pageId,
			type: e?.detail?.type || "",
		};
		smztrace.logNoImageTrace(this, param);

		if (errMsg && !/(R|C|D|W|Z|X|Y)_/.test(errMsg)) {
			smztrace.logNoCropImageTrace(this, param);
		}
	},

	/**
	 * 影音房投屏跳转wifi
	 */
	xshuaiToWifi() {
		const {tpid='', scene} = this.options
		if (this.xshuaiWifi) {
			cwx.navigateTo({
				url: `../market/wifi/index?hotelId=${this.data.hotelId}&codeID=${this.data.codeID}&aid=${this.data.allianceid}&sid=${this.data.sid}&sourceFrom=${this.data.sourceFrom}&materialKey=${this.data.materialKey}&xshuaiWifi=${this.xshuaiWifi}&tpid=${tpid}&scene=${scene}`,
			});
		}
	},

	/**
	 * 电竞渠道，调用对方接口触发设备登录
	 */
	callEsportsAuthorize(){
		const {scene, devid = ''} = this.options
		if(scene !== 'esports'){
			return;
		}
		Api.esportsRoom({
			devid
		}).then((res) => {
			const { code } = res?.data || {};
			if (code == 0) {
				cwx.showToast({
					title: "海量游戏权益已解锁",
					icon: "none",
					duration: 3000,
				});
			}
		});
	},

	/**
	 * 第三方供应商授权等统一方法
	 */
    callThirdAuthorize(){
		const { scene, devid = '', codefrom = '', tpid } = this.options 
		//codefrom 兼容小帅影音房
		if(scene !== 'third') return;
		const [_, from] = codefrom?.split("_");
		const [_dev, devScene] = devid?.split("_")
		if (from === "Tp") {
			this.xshuaiWifi = codefrom;
			return;
		}else if (devScene === "Tp"){
			this.xshuaiWifi = devid
			return;
		}

		Api.getThirdPartyUrl({
			appid: tpid,
			devid: codefrom || devid
		}).then((res) => {
			const { code , toast = "已解锁"} = res?.data || {};
			if (code === 0) {
				cwx.showToast({
					title: toast,
					icon: "none",
					duration: 3000,
				});
			}
		});
	},

	thirdAuthorize(){
		this.callXShuaiAuthorize();
		this.callEsportsAuthorize();
		this.callThirdAuthorize();
	},

	handleGotoQuestionnaire() {
		const questionnaire = this.data?.bannerList?.find(item => item?.bannerModuleName === 'questionnaire') || {};
		const urlQuery = JSON.stringify({
			url: encodeURIComponent(
				questionnaire.url || ""
			),
			title: "酒店入住调研问卷",
		});
		try {
			cwx.navigateTo({
				url: `/pages/hotel/components/webview/webview?data=${urlQuery}`
			});
		} catch (e) {
			console.log(e);
		}
	},

	// 初始房型日历时间为传入日期
	initRoomDate() {
		const child = this.selectComponent("#room-list-new");
		if (child) {
			child.initDate();
		}
	},

	handleSwiperTap(e) {
		const index = e?.currentTarget?.dataset?.id || 0;
		const { moduleType : moduletype = '', bannerModuleName = '' } = this.data.bannerList[index] || {}
		const methodMap = {
			"questionnaire": this.handleGotoQuestionnaire,
			"communityQRCode": this.openQrCodeModal
		}
		if (methodMap[bannerModuleName]) {
			methodMap[bannerModuleName]();
			trace.traceBannerClick(this, {
				moduletype
			})
		}
	},

	traceBannerExpose() {
		this.data.bannerList.forEach((item) => {
			const { moduleType : moduletype = '' } = item || {}
			trace.traceBannerExpose(this, {
				moduletype
			})
		})
	},

	pageImageSuccess (e) {
        storageUtil.setStorage('P_HOTEL_S_WBEP', 'true');
    },

	openCModal(e) {
		const { detail } = e || {};
		const { modalName } = detail || {};
		const strategy = this.pageStatus?.modalStrategies[modalName];
		if (strategy?.open) {
		  strategy.open.call(this, detail);
		}
		this.setData({
		  [`modals.${modalName}`]: true,
		});
	},

	closeCModal(e) {
		const { detail } = e || {};
		const { modalName } = detail || {};
		const strategy = this.pageStatus?.modalStrategies[modalName];
		if (strategy?.close) {
			strategy.close.call(this, detail);
		}
		this.setData({
			[`modals.${modalName}`]: false,
		});
	},
};

export default aggregateCore;
