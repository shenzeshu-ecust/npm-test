import { cwx, __global, _ } from "../../../../cwx/cwx.js";
import HPage from "../../common/hpage/hpage";
import Api from "./indexrest.js";
import hPromise from "../../common/hpage/hpromise";

import {
	processAssistPopup,
	processJumpLink,
	processCheckpointData,
	isResSuccess,
} from "./util";

const util = require("../../common/utils/util");
import commonrest from '../../common/commonrest';
const deferred = require("../../common/utils/deferred");
import dateUtil from '../../common/utils/date.js';
const StorageUtil = require("../../common/utils/storage.js");
const huser = require("../../common/hpage/huser");
const trace = require("../../common/trace/cutpricetrace");
const subMessage = require("../../common/market/subMessage.js");

const popupObj = {
	isAssistPopupShow: false,
	title: "",
	desc: "",
	btnTxt: "",
	totalCashBackAmount: 0,
	assistingUserList: [],
	status: 0,
	needReload: false,
	showHeaderImg: false,
};

HPage({
	/**
	 * 页面的初始数据
	 */
	data: {
		orderId: 0,
		homeInfo: {},
		jumpLink: [],
		user: [], // 轮播展示助力用户信息
		swiperCurrent: 0,
		checkpointData: {},
		showHotel: false,
		showLayer: false,
		rule: "",
		assistPopup: Object.assign({}, popupObj),
		poster: {
			showPoster: false,
			image: "",
		},
		showPageLoading: true,
		showErrorPage: false,
		errorModal: {
			show: false,
			msg: "",
			btn: "我知道了",
		},
		modifyOrderInfo: {},
		// 是否显示修改单提示
		showModifyAlert: false,
		weworkInfo: {
			isWeworkPopupShow: false,
			assistUser: [],
			totalCashBackAmount: 0,
			needUserCount: 0
		},
        freeInfo: {
            isFreePopupShow: false,
            assistedUserAvatar: [],
            orderFreeAmount: 0,
            needUserCount: 0,
        },
        isShowFreeTask: false,
        freeTaskUser: 0,    
	},

	pageId: "10650010043",

	checkPerformance: true,// 白屏标志位

	// 与页面渲染无关的一些参数
	pageStatus: {
		idGroups: [],
		cutRes: null,
		host:
			__global.env === "fat"
				? "https://m.ctrip.fat369.qa.nt.ctripcorp.com"
				: "https://m.ctrip.com",
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		options.orderId = this.getLastestOrderId(
			options.orderId || options.orderid
		);
		this.option = options;
		this.initPage();
	},

	onShow() {
		cwx.Observer.addObserverForKey("onUserCaptureScreen", this.logTrace);
		const { weworkInfo, isShowFreeTask } = this.data
		if (weworkInfo.status === 1 || isShowFreeTask) {
			this.loadPage()
		}
	},

	onUnload() {
		cwx.Observer.removeObserverForKey("onUserCaptureScreen", this.logTrace);
		if (this._observer) this._observer.disconnect();
	},

	onHide() {
		cwx.Observer.removeObserverForKey("onUserCaptureScreen", this.logTrace);
	},

	logTrace() {
		let pages = getCurrentPages();
		const route = pages[pages.length - 1].route;
		const self = this;
		if (route && route.includes("hotelplanning/market/assistcutprice")) {
			huser.checkLoginStatus(true).then((isLogin) => {
				let progress = 0;
				const { homeInfo } = self.data;
				if (homeInfo) {
					const {
						assistStatus,
						isMine,
						assistCashbackAmount,
						totalAmount,
					} = homeInfo;
					if (isLogin) {
						if (isMine) {
							switch (assistStatus) {
								case 2:
									progress = 4;
									break;
								case 3:
									progress = 3;
									break;
								case 4:
								case 5:
									progress = 2;
									break;
								case 1:
									progress =
										assistCashbackAmount >= totalAmount
											? 2
											: 1;
									break;
							}
						} else {
							progress =
								this.pageStatus.cutRes === null
									? 7
									: this.pageStatus.cutRes
									? 5
									: 6;
						}
						trace.shotLog(self, { progress });
					} else {
						trace.shotLog(self, { progress: 7 });
					}
				}
			});
		}
	},

	onGetAssistStatus: function (res) {
		if (res) {
			this.pageStatus.cutRes = res.detail;
			!res.detail &&
				util.logException(this, 1, "assistCutPrice", this.pageId);
		}
	},

	initPage: async function () {
		this.loadPage();
	},

	// silence: 是否静默刷新
	loadPage: async function (silence) {
		// 初始化页面，请求getHomeInfo 根据结果判断创单or砍价
		const homeInfo = await Api.getHomeInfo(this.option);

		if (!isResSuccess(homeInfo)) {
			this.setData({
				showErrorPage: true,
			});
			util.logException(this, 1, "cuthomeinfo", this.pageId);
			return;
		}

		setTimeout(() => {
			this.setData({
				showPageLoading: false,
			});
		}, 300);

		cwx.showLoading();

		wx.stopPullDownRefresh();

		if (homeInfo && homeInfo.result) {
			// 修改单
			if (homeInfo.modifiedOrderInfo) {
				const { newOrderId } = homeInfo.modifiedOrderInfo;
				this.setLastestOrderId(this.option.orderId, newOrderId);
				this.option.orderId = newOrderId;

				// 若活动未结束，主态用户进入后出弹窗提示
				if (homeInfo.isMine && homeInfo.assistStatus === 1) {
					this.setData({
						modifyOrderInfo: homeInfo.modifiedOrderInfo,
						showModifyAlert: true,
					});
				}
			} else if (homeInfo.shareCutInfo) {
				this.setData({
					shareCutInfo: homeInfo.shareCutInfo,
				});
			}
			this.showPage(homeInfo, silence);
		} else {
			homeInfo.isMine = true;
			this.setData({ homeInfo });
			// 创建砍价单
			this.showVerification(0);
		}
	},

	initTrace() {
		const hotelId = this.data.homeInfo?.hotel?.id;
		const showHotel = this.data.showHotel;
		const showBusinessHotel = this.data && this.data.showBusinessHotel;
		if (showHotel === 1) {
			trace.showhotel(this, {
				hotelId: hotelId,
			});
			if (showBusinessHotel) {
				Api.userBrowseRecord(hotelId).then((res) => {
					if (res && res.result) {
						trace.showSharePic(this, { hotelId });
					}
				});
			}
		}
		if (
			this.data.homeInfo.isMine &&
			this.data.homeInfo.assistStatus === 1 &&
			!this.data.isAssistTop
		) {
			trace.shareFriendCircleShow(this, { orderid: this.data.orderId });
		}

		trace.initPage(this, {
			objectType: this.data.homeInfo.isMine ? 1 : 2,
			orderId: this.data.orderId, 
			pageId: this.pageId
		});
	},

	// silence: 是否静默刷新
	showPage: async function (homeInfo, silence) {
		const [assistList, switches = { result: {} }] = await hPromise.all([
			Api.getAssistList(this.option),
			this.getUniversalSwitches([
				"assist_cut_price_rule_text",
				"cut_price_receive_wx_switch",
				"cut_price_receive_wx_white_list",
				"cut_price_receive_wx_message",
				"cut_price_show_hotellist_switch",
				"cut_price_wx_sub_message",
                "wechat_cut_price_max_reward"
			]),
		]);

		if (!isResSuccess(assistList)) {
			this.setData({
				showErrorPage: true,
			});
			util.logException(this, 1, "assistingCutPriceList", this.pageId);
			return;
		}

		const { isMine, countdown, assistStatus, abTest = "", prizeStatus, helperCount } = homeInfo;
        if(abTest === "b" && helperCount > 0 && isMine){
            this.setData({
                isShowFreeTask: true,
                freeTaskUser: Math.min(helperCount, 5)
            })
            const options = {
                orderid: this.data.orderId,
                buttonText: prizeStatus === 0 ? "去完成" : (prizeStatus === 1 ? "去抽奖" : (prizeStatus === 2 ? "去查看" : "已结束"))
            }
            trace.showFreeTask(this, options)
        }

		let assistPopup = {},
			checkpointData = {};

		// 订阅
		const cutSubscriptSwitch =
			switches.result["cut_price_receive_wx_switch"] == "true";
		const whiteLists =
			switches.result["cut_price_receive_wx_white_list"] || "";
		const isCutSubscriptHotelWhiteList =
			homeInfo.hotel.id &&
			homeInfo.hotel.id != "" &&
			whiteLists.split(",").includes(homeInfo.hotel.id + "");

		// 订阅
		const showHotellistSwitch =
			switches.result["cut_price_show_hotellist_switch"] == "1";
		const tempIds = switches.result["cut_price_receive_wx_message"] || "";
		const cutSubscriptTemplateIds = tempIds.split(",");

		const { sponsorJumpLink, guestJumpLink } = processJumpLink(
			switches.assistIcons?.length ? switches.assistIcons : []
		);

		let swiperCurrent = 0;

        const showMaxRewardSwitch =
			switches.result["wechat_cut_price_max_reward"] == "1";
		checkpointData = processCheckpointData(assistList, homeInfo, showMaxRewardSwitch);

		if (isMine) {
			if (!silence) {
				assistPopup = processAssistPopup(checkpointData, homeInfo);
				this.setData({ assistPopup });
			}

			this.computeBubbleText(checkpointData, homeInfo);
			const isShowWeworkPopup = await this.processWeworkPopup(checkpointData);
			const { assistStatus, assistCashbackAmount, totalAmount } =
				homeInfo;
			const { currentStatus, current } = checkpointData;

            let isShowSuccessPopup = false;
			if (
				currentStatus === 1 &&
				assistStatus === 1 &&
				assistCashbackAmount < totalAmount
			) {
				// 当前关卡已过关 && 砍价单进行中 && 未砍到顶额 自动开启下一关
				isShowSuccessPopup = await this.openNextCheckpoint(
					this.option.orderId,
					checkpointData,
					homeInfo
				);
			} else if (homeInfo.nonRisk && currentStatus === 0 && current > 1) {
				// 非风险用户 && 当前关卡进行中 && 当前关卡大于第一关 && 未展示过闯关成功弹窗 则展示上一关闯关成功
				isShowSuccessPopup = this.showCheckpointSuccess(current, assistCashbackAmount, this.option.orderId)
			}

			if (assistPopup?.isAssistPopupShow) {
				trace.popup(this, {
					orderid: this.data.orderId,
					keyid: "197554",
					type:
						assistStatus === 1
							? "闯关成功"
							: assistStatus === 2
							? "风控"
							: assistStatus === 3
							? "闯关失败"
							: "闯关结束",
					operate:
						assistStatus === 1 &&
						assistCashbackAmount !== totalAmount &&
						currentStatus !== 1
							? "继续邀请，获更多返现；关闭"
							: assistStatus === 1 &&
							  assistCashbackAmount !== totalAmount &&
							  currentStatus === 1
							? "继续闯关;关闭"
							: assistStatus === 2
							? "我知道了；关闭"
							: "知道了；关闭",
					content: "助力进度",
				});
			}
            const isNotSilence = !silence || (silence instanceof Object)
            if(isNotSilence && !isShowWeworkPopup && !isShowSuccessPopup && homeInfo.abTest === "b" && homeInfo.helperCount > 0 && homeInfo.prizeStatus === 0) {
                this.processFreeOrderPopup(homeInfo, assistList);
            }

			this.getAssistingAvatar();
		}

        huser.checkLoginStatus(true).then((isLogin) => {
            this.setData({
                showHotellistSwitch: showHotellistSwitch && isLogin
            })
        })

		this.setData(
			{
				orderId: this.option.orderId,
				homeInfo: homeInfo,
				checkpointData,
				swiperCurrent: checkpointData.swiperCurrent,
				countdown: countdown
					? countdown.hour * 3600 +
					  countdown.minute * 60 +
					  countdown.second
					: 0,
				showHotel: homeInfo.isMine
					? 0
					: parseInt(this.option.sh || 0, 10),
				showBusinessHotel: homeInfo.signed && !homeInfo.consumeLimit,
				// qconfig配置
				rule: switches.result["assist_cut_price_rule_text"],
				cutSubscriptSwitch,
				isCutSubscriptHotelWhiteList,
				cutSubscriptTemplateIds,
				sponsorJumpLink,
				guestJumpLink,
				isAssistTop:
					homeInfo.assistCashbackAmount === homeInfo.totalAmount,
				showSubMessage: switches.result["cut_price_wx_sub_message"]
			},
			() => {
				this.initTrace();
			}
		);

		cwx.hideLoading();
	},

	getAssistingAvatar: async function () {
		const assistingAvatar = await Api.assistingAvatarCarousel(this.option);
		if (assistingAvatar?.result?.length) {
			this.setData({
				user: assistingAvatar.result.map((item) => ({
					avatar: item.user.avatar,
					nick: item.user.nick,
					price: item.price,
				})),
			});
		}
	},

	getUniversalSwitches: function (keys) {
		const def = deferred.create();

		commonrest.getWechatSoaSwitchCutPrice(
			keys,
			(res) => {
				def.resolve(res);
			},
			"json"
		);

		return def.promise;
	},

	showVerification: function (type, userInfo, tag) {
		// type: 0 - 创建砍价单
		// type: 1 - 砍价
		cwx.hideLoading();
		// 接风控滑块，根据type控制风控结束后操作创单/砍价
		let self = this;
		self.curUserInfo = userInfo;
		self.curTag = tag;
		self.showVerifyModule();
		self.setData({
			settings: {//settings为captcha标签内settings属性的值，可自行定义
				codeImageType: 'popup', //拼图验证码的模式 popup弹窗式，embed嵌入式
				appId: "100023407", // 申请的appId值
				businessSite: 'hotel_order_bargain_miniapp_pic', // 申请的businessSite值
				dev: __global.env === "prd" ? "pro" : "uat", // 接口环境
				width: '100%', // 拼图窗口宽度
				height: '40px', // 滑块宽度
				margin: 'auto', //拼图窗口边距
				language: cwx.util.systemInfo.language, //选择的语言
				
				// 单击选字右上角叉后调用的函数
				onSelectClose: function () {
					self.closeVerifyModule();
				},
			
				// 风险检测结果
				resultHandler: function (e) {
					self.closeVerifyModule();
					trace.logCutTrace(self, { type });
					
					if (
						e.checkState == "success" ||
						e.checkState == "hidden"
					) {
						let params = {
							token: e.token || "",
							rid: e.rid || "",
							version: e.version || "",
							extensions: [
								{
									key: "miniappVerify2",
									value: "1"
								}
							]
						};
						Api.cutPriceVerifyToken(params).then((res) => {
							if (res) {
								if (res.statusCode === 0) {
									if (type == 0) {
										cwx.showLoading();
										self.createCut();
									} else if (type == 1) {
										self.cutPrice(
											self.curUserInfo,
											self.curTag
										);
									}
								} else {
									return self.showerror(res.message);
								}
							} else {
								return self.showerror(
									"验证失败，请稍后重试"
								);
							}
						});
					} else {
						if (type == 0) {
							return self.showerror("验证错误，无法发起助力");
						} else {
							return self.showerror(
								"验证错误，无法帮好友助力"
							);
						}
					}
				}
			}
	    });
	},

	createCut: async function () {
		// 创建砍价单
		const createRet = await Api.createCut(this.option);
		cwx.hideLoading();
		if (!createRet || !createRet.result) {
			util.logException(this, 1, "createcutpriceaction", this.pageId);
		}
		if (!createRet) {
			return this.showerror(
				"您已经无法参与啦！<br/>可能原因：已到发起次数限制/活动结束/订单发生变动等，具体可查看活动规则"
			);
		}
		if (createRet.result) {
			trace.logCreateSuccess(this);
			return this.loadPage();
		}
		if (createRet.message) {
			return this.showerror(
				`您已经无法参与啦！<br/>${createRet.message}`
			);
		} else {
			return this.showerror("网络出错啦，请点击分享卡片重新进入");
		}
	},

	// 砍价触发风控
	onTapGuestAssist: function (e) {
		this.showVerification(1);
	},
	// guest弹窗
	onGuestShowMessage: function (e) {
		const _msg = util.getAttr(e, "detail.message");

		if (!util.isEmpty(_msg)) {
			this.showerror(_msg);
		}
	},
	// 调用guest组件砍价服务
	cutPrice: function () {
		const comGuest = this.selectComponent("#com-guest");
		const { from = "", appFrom = "", currentShareNo = 0 } = this.option;
		if (comGuest) {
			comGuest.loadCutPrice({
				from,
				appFrom,
				openId: cwx.cwx_mkt.openid,
				currentCheckpoint: currentShareNo,
			});
		}
	},

	showerror: function (errMsg) {
		if (!this.data.homeInfo.isMine) {
			trace.popup(this, {
				orderid: this.data.orderId,
				keyid: "197554",
				type: "助力失败",
				operate: "我知道了",
			});
		}
		this.setData({
			"errorModal.show": true,
			"errorModal.msg": errMsg,
		});
	},

	showVerifyModule: function () {
		this.setData({
			showVerify: true,
		});
	},

	closeVerifyModule: function () {
		this.setData({
			showVerify: false,
		});
	},

	handleSwiper: function (e) {
		const type = e.currentTarget?.dataset.type;
		const current = e.detail?.current;
		const { swiperCurrent } = this.data;
		this.setData({
			swiperCurrent:
				type === "left"
					? swiperCurrent - 1
					: type === "right"
					? swiperCurrent + 1
					: current,
		});
	},

	showLayer: function () {
		this.setData({
			showLayer: !this.data.showLayer,
		});
	},

	closeAssistPopup: async function (e) {
		const { homeInfo, orderId, currentStatus } = this.data;
		const { assistStatus, assistCashbackAmount, totalAmount } = homeInfo;
		const { close, btntype, needreload, modaltype } =
			e.currentTarget?.dataset;
		let traceType = "",
			traceOperate = "";
		
		traceType =
			assistStatus === 1
				? "闯关成功"
				: assistStatus === 2
				? "风控"
				: assistStatus === 3
				? "闯关失败"
				: "闯关结束";
		traceOperate = close
			? "关闭"
			: assistStatus === 1 &&
				assistCashbackAmount !== totalAmount &&
				currentStatus !== 1
			? "继续邀请，获更多返现"
			: assistStatus === 1 &&
				assistCashbackAmount !== totalAmount &&
				currentStatus === 1
			? "继续闯关"
			: assistStatus === 2
			? "我知道了"
			: "知道了";
			
		trace.popup(this, {
			orderid: this.data.orderId,
			keyid: "197555",
			type: traceType,
			operate: traceOperate,
			content: "助力进度",
		});
		if (needreload) {
			this.loadPage(true);
		}
		const newAssistPopup = { "assistPopup.isAssistPopupShow": false };
		this.setData(newAssistPopup);
	},

	onShareAppMessage: function () {
		const path = `pages/hotelplanning/market/assistcutprice/index?orderId=${
			this.data.orderId
		}&sh=${
			this.data.showHotel ? 1 : 0
		}&allianceid=263528&sid=1911556&from=${
			cwx.cwx_mkt.openid
		}&currentShareNo=${this.data.checkpointData?.current}`;
		return {
			bu: "hotel",
			title: "[有人@我] 就差你了！帮我助力送你大红包~",
			path,
			imageUrl:
				`https://pages.c-ctrip.com/hotels/wechat/market/assistcutprice/weixin_share.png?v=` +
				+new Date(),
		};
	},

	getLastestOrderId(orderId) {
		this.pageStatus.idGroups =
			StorageUtil.getStorage("OrderIdGroups") || [];
		if (!(0 in this.pageStatus.idGroups)) {
			return orderId;
		} else {
			// 根据当前订单id获取对应group中最新的那个修改单ID(数组最后一位)
			_.each(this.pageStatus.idGroups, (group) => {
				if (group.some((o) => o === orderId)) {
					orderId = group[group.length - 1];
				}
			});
			return orderId;
		}
	},

	setLastestOrderId(orderId, modifyOrderId) {
		let idGroups = this.pageStatus.idGroups;
		let orderIdIndex = -1,
			modifyOrderIdIndex = -1;
		for (let [index, group] of idGroups.entries()) {
			orderIdIndex = group.some((o) => o === orderId)
				? index
				: orderIdIndex;
			modifyOrderIdIndex = group.some((o) => o === modifyOrderId)
				? index
				: modifyOrderIdIndex;
		}
		if (orderIdIndex == -1 && modifyOrderIdIndex == -1) {
			// 都不在group中，记录一条新的group
			idGroups.push([orderId, modifyOrderId]);
		} else if (orderIdIndex != -1 && modifyOrderIdIndex == -1) {
			// 有旧ID没有新ID，新ID加入到旧ID的group的末尾
			idGroups[orderIdIndex].push(modifyOrderId);
		} else if (orderIdIndex == -1 && modifyOrderIdIndex != -1) {
			// 有新ID没有旧ID，旧ID加入到新ID的group的开头
			idGroups[modifyOrderIdIndex].unshift(orderId);
		} else if (
			orderIdIndex != -1 &&
			modifyOrderIdIndex != -1 &&
			orderIdIndex != modifyOrderIdIndex
		) {
			// 既有新ID的group又有旧ID的group，合并成一条group
			let mergedGroup = idGroups[orderIdIndex].concat(
				idGroups[modifyOrderIdIndex]
			);
			delete idGroups[orderIdIndex];
			delete idGroups[modifyOrderIdIndex];
			idGroups = idGroups.filter((o) => o != undefined);
			idGroups.push(mergedGroup);
		}
		this.pageStatus.idGroups = idGroups;
		StorageUtil.setStorage("OrderIdGroups", idGroups, 72);
	},

	// 砍价订阅
	shareCutMessage() {
		trace.shareWechatClick(this, {
			orderid: this.data.orderId,
			id_check_show_hotel: this.data.showHotel ? "true" : "false",
			host_guest: this.data.homeInfo.isMine ? "true" : "false",
		});
	},

	onGuestLoadMore: function () {
		const comGuest = this.selectComponent("#com-guest");

		comGuest.loadMorelHotels();
	},

	showPoster: function () {
		this.sendSubscribeMessage();
		trace.shareFriendCircleClick(this, {
			orderid: this.data.orderId,
			id_check_show_hotel: this.data.showHotel ? "true" : "false",
			host_guest: "true",
		});
		const { orderId, showHotel, checkpointData } = this.data;
		this.setData({
			poster: {
				showPoster: true,
				image: `${
					this.pageStatus.host
				}/webapp/hotelevents/assistingSharingPoster?orderId=${orderId}&sh=${
					showHotel ? 1 : 0
				}&currentShareNo=${checkpointData.current}`,
			},
		});
		cwx.showLoading();
	},

	hidePoster: function () {
		this.setData({
			"poster.showPoster": false,
		});
	},

	onPullDownRefresh: function (e) {
		// 下拉刷新
		this.loadPage();
	},

	onInvite: function (e) {
		const { status } =
			e.detail?.currentTarget?.dataset || e.currentTarget?.dataset || {};
		if (status !== 1) {
			this.setData({
				"errorModal.show": true,
				"errorModal.msg": "活动已结束",
			});
		} else {
            trace.shareWechatClick(this, {
                orderid: this.data.orderId,
                id_check_show_hotel: this.data.showHotel ? "true" : "false",
                host_guest: this.data.homeInfo.isMine ? "true" : "false",
                is_h5_wechat: "wechat",
                page: "10650010043",
                type: "待邀请"
            });
			// this.sendSubscribeMessage();
		}
	},

	noop: function () {},

	closeErrorPopup: function () {
		this.setData({
			"errorModal.show": false,
			"errorModal.msg": "",
		});
	},

	hideModifyAlert: function () {
		this.setData({
			showModifyAlert: false,
			modifyOrderInfo: {},
		});
	},

	openNextCheckpoint: async function (orderId, checkpointData, homeInfo) {
		const { current } = checkpointData;
		const { assistCashbackAmount, nonRisk } = homeInfo;
		const res = await Api.assistcheckpoint({ orderId });
		if (isResSuccess(res) && res.result) {
			this.sendSubscribeMessage();
			this.setData({
				assistPopup: {
					isAssistPopupShow: assistCashbackAmount > 0,
					title: `第${current}关闯关成功`,
					desc: "累计可返",
					btnTxt: "继续邀请，获更多返现",
					status: 1,
					assistCashbackAmount,
					btnType: "share",
					needReload: true,
					showHeaderImg: !nonRisk,	// 风险用户才展示闯关成功头图
				},
                // 闯关成功后 当前关卡数静默+1，关闭弹窗后reload页面
				checkpointData: {
					...checkpointData,
					current: current + 1
				}
			});
			StorageUtil.setStorage(`${orderId}_${current}`, 1)
            return assistCashbackAmount > 0;
		} else {
			this.setData({
				"errorModal.show": true,
				"errorModal.msg": "关卡开启失败，请刷新重试",
			});
			util.logException(this, 1, "assistcheckpoint", this.pageId);
            return false
		}
	},
	sendSubscribeMessage: function() {
		// 开关打开 并且 当前是风险用户 才出订阅消息
		if (this.data.showSubMessage  === 't' && !this.data.homeInfo?.nonRisk) {
			subMessage.subscribeMessage("PROCESS", {orderId: this.data.orderId, point: this.data.checkpointData?.current});
		}
	},
	computeBubbleText: function (checkpointData, homeInfo) {
		const { current, checkpointList } = checkpointData;
		// 当前处于第二关 并且 当前是风险用户 才出第二关提示气泡
		if (current === 2 && !homeInfo?.nonRisk) {
			const { assistingUserList } =
				checkpointList.length > 1 ? checkpointList[1] : {};
			if (assistingUserList.every((user) => user.toBeInvited)) {
				this.setData({
					bubbleText: "点这里分享第2关链接",
				});
			}
		}
		return "";
	},
	showCheckpointSuccess: function(current, assistCashbackAmount, orderId) {
		if (StorageUtil.getStorage(`${orderId}_${current-1}`)) {
			return false;
		}
		this.setData({
			assistPopup: {
				isAssistPopupShow: assistCashbackAmount > 0,
				title: `第${current - 1}关闯关成功`,
				desc: "累计可返",
				btnTxt: "继续邀请，获更多返现",
				status: 1,
				assistCashbackAmount,
				btnType: "share",
				showHeaderImg: false,	// 风险用户才展示闯关成功头图
			}
		});
		StorageUtil.setStorage(`${orderId}_${current-1}`, 1)
        return assistCashbackAmount > 0
	},
	processWeworkPopup: async function(checkpointData) {
		const weWorkWelfare = await Api.assistingWeWorkWelfare({
			orderId: this.option.orderId
		})

		const { status } = weWorkWelfare
		this.setData({
			'weworkInfo.status': status
		})

		const { checkpointList, current } = checkpointData
		if (!checkpointList?.length) return false;
		const currentCheckpoint = checkpointList[current - 1] || {}

		const { assistingUserList = [], canInvite = 0 } = currentCheckpoint
		const needUserCount = assistingUserList.filter(i => i.toBeInvited).length
		if (needUserCount === 0 || needUserCount === canInvite) {
			// 表示当前关卡未有用户助力或已助力满，直接return
			return false;
		}

		const assistedUserAvatar = assistingUserList.filter(i => !i.toBeInvited).map(i => i.user.avatar).filter(i => i)
		const storageKey = `wework_${this.data.orderId}`
		if (StorageUtil.getStorage(storageKey)) {
			return false;
		}
		StorageUtil.setStorage(storageKey, true)
		this.setData({
			weworkInfo: {
				isWeworkPopupShow: status === 1,
				assistedUserAvatar,
				assistCashbackAmount: currentCheckpoint.totalCashBackAmount,
				needUserCount,
				status
			}
		})
        return status === 1
	},

    processFreeOrderPopup(homeInfo, assistList) {
        const {
            helperCount = 0, 
            prizeAmount = 0
        } = homeInfo
        let needMoreUserCount = 0;

        if(helperCount > 0 && helperCount < 5){
            needMoreUserCount = 5 - helperCount;
            const hasShownFreePopup = StorageUtil.getStorage(`free_${this.data.orderId}`)
            if(hasShownFreePopup) return;

            StorageUtil.setStorage(`free_${this.data.orderId}`, true);
            const { checkpointList = [] } = assistList;
            if (!checkpointList?.length) return;
    
            const firstCheckpoint = checkpointList[0] || {}
            let currentUserList = JSON.parse(JSON.stringify(firstCheckpoint?.assistingUserList || []))
    
            if(checkpointList.length > 1) {
                const secondCheckPoint = checkpointList[1] || {}
                const secondassistingUser = secondCheckPoint?.assistingUserList || []
                if(secondassistingUser.length > 0){
                    currentUserList.push(secondassistingUser[0])
                }
            }
            const assistedUserAvatar = currentUserList.filter(i => !i.toBeInvited).map(i => i.user.avatar).filter(i => i).slice(-3)
            this.setData({
                freeInfo: {
                    isFreePopupShow: true,
                    assistedUserAvatar,
                    orderFreeAmount: prizeAmount,
                    needUserCount: needMoreUserCount
                }
            })
        }
    },

	closeWeworkPopup: function() {
		this.setData({
			'weworkInfo.isWeworkPopupShow': false
		})
	},
	gotoAddWework: function() {
		const weworkUrl = '/pages/market/web/index?from=https%3A%2F%2Fcontents.ctrip.com%2Factivitysetupapp%2Fmkt%2Findex%2F1000middlepage%3Fentryid%3D771%26innersid%3D400'
		cwx.navigateTo({ url: weworkUrl });
	},
	receiveWeWorkWelfare: async function() {
		const receiveRes = await Api.receiveAssistingWeWorkWelfare({
			orderId: this.data.orderId
		})
		const { status } = receiveRes
        if (status === 1) {
            // 领取成功 刷新页面
            this.loadPage()
        } else {
			cwx.showToast({ title: '领取失败，请重试', icon: "none" })
        }
	},
    closeFreePopup: function() {
		this.setData({
			'freeInfo.isFreePopupShow': false
		})
	},
    handleFinish() {
        const {
            homeInfo: {
                prizeStatus = 0
            }, 
            orderId
        } = this.data
        const options = {
            orderid: orderId,
            buttonText: prizeStatus === 0 ? "去完成" : (prizeStatus === 1 ? "去抽奖" : (prizeStatus === 2 ? "去查看" : "已结束"))
        }
        trace.clickFreeTask(this, options);
    },
    gotoLottery() {
        const {
            homeInfo: {
                prizeStatus = 0
            }, 
            orderId
        } = this.data
        const options = {
            orderid: orderId,
            buttonText: prizeStatus === 0 ? "去完成" : (prizeStatus === 1 ? "去抽奖" : (prizeStatus === 2 ? "去查看" : "已结束"))
        }
        trace.clickFreeTask(options);
        const navigateUrl = __global.env === "fat"
                        ? `https://m.ctrip.fat369.qa.nt.ctripcorp.com/webapp/hotel/eventsale/ninefloorzhuanpanhuodongye1?orderId=${orderId}`
                        : `https://m.ctrip.com/webapp/hotel/eventsale/nineflooryaohaoyouchoumiandan?orderId=${orderId}`
        cwx.navigateTo({
            url:
                "/pages/hotel/components/webview/webview?data=" +
                JSON.stringify({ url: encodeURIComponent(navigateUrl) }),
        });
    }
});
