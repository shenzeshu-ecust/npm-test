import { cwx } from "../../../../../../cwx/cwx";
const subMessage = require("../../../../common/market/subMessage.js");

Component({
	properties: {
		isSponsor: {
			// 主态or客态
			type: Boolean,
			value: "",
		},
		assistStatus: {
			// 砍价状态，根据主客态和砍价状态展示不同文案, 客态传参：11=帮TA助力, 12=召集好友 为TA助力, 13=看看周边热卖酒店
			type: Number,
			value: 0,
		},
		helperCount: {
			type: Number,
			value: 0,
		},
		assistCashbackAmount: {
			type: Number,
			value: 0,
		},
		orderId: {
			type: Number,
			value: "",
		},
		hotel: {
			type: Object,
			value: "",
		},
		isTop: {
			// 是否砍到顶额（订单进行中 但已经砍到顶额，展示逻辑按照 assistStatus 4 订单已结束可返现未返现来处理
			type: Boolean,
			value: false,
		},
		assistBubbleText: {
			type: String,
			value: "",
		},
		current: {
			type: Number,
			value: "",
		},
		showSubMessage:{
			type: String,
			value: "",
		}
	},
	data: {
		title: "",
		subTitle: "",
	},
	observers: {
		"isSponsor, assistStatus, helperCount, assistCashbackAmount, isTop":
			function () {
				this.updateTitle();
			},
	},
	lifetimes: {
		ready: function () {
			this.updateTitle();
		},
	},
	methods: {
		updateTitle() {
			const {
				isSponsor,
				assistStatus,
				helperCount,
				assistCashbackAmount,
				isTop,
			} = this.data;
			let title = "",
				subTitle = "";
			// 主态
			if (isSponsor) {
				if (assistStatus === 1 && isTop) {
					title = "看看其他酒店";
					subTitle =
						"返现将在订单成交后3-5个工作日内存入【我的-我的钱包】";
				} else if (assistStatus === 1) {
					title = helperCount > 0 ? "邀请好友助力" : "立即领现金";
					this.shareWechatShow();
				} else {
					title = "看看其他酒店";
					switch (assistStatus) {
						case 2:
							subTitle = "抱歉，无法继续参与活动哦";
							break;
						case 3:
							subTitle = "很遗憾，未邀满足够好友，返现失败";
							break;
						case 4:
							subTitle =
								"返现将在订单成交后3-5个工作日内存入【我的-我的钱包】";
							break;
						case 5:
							subTitle = `${assistCashbackAmount}元返现已到账，可在【我的-我的钱包】中查看`;
							break;
						default:
							break;
					}
				}
			} else {
				// 助力状态 11,12,13
				if (assistStatus === 11) {
					title = "帮TA助力";
				} else if (assistStatus === 12) {
					this.shareWechatShow();
					title = "召集好友 为TA助力";
				} else {
					title = "看看周边热卖酒店";
				}
			}

			this.setData({
				title,
				subTitle,
			});
		},
		onTap(e) {
			if (!this.data.isSponsor) {
				this.ClickPowerButtonClick();
				if (this.data.assistStatus === 12) {
					this.logWithUbtTrace("203100", {
						orderid: this.data.orderId,
						id_check_show_hotel:
							this.data.hotelInfo?.hotelId > 0 ? "true" : "false",
						host_guest: "false",
						is_h5_wechat: "wechat",
						page: "10650010043",
                        type: "主按钮"
					});
					("nothing");
				} else {
					this.triggerEvent("buttonTap", e);
				}
			} else {
				if (
					this.data.assistStatus !== 1 ||
					(this.data.assistStatus === 1 && this.data.isTop)
				) {
					// 主态且助力已结束 去酒店列表页
					cwx.navigateTo({
						url: "/pages/hotel/list/index",
					});
				} else {
					this.triggerEvent("shareCutMessage");
				}
			}
		},
		logWithUbtTrace: function (ubtKey, data) {
			if (!ubtKey) return;
			let log = cwx.sendUbtByPage.ubtTrace || this.ubtTrace;
			log(ubtKey, data);
		},
		ClickPowerButtonClick: function () {
			this.logWithUbtTrace("203105", {
				operate_type:
					this.data.assistStatus === 11
						? "1"
						: this.data.assistStatus === 12
						? "2"
						: "3",
				page: "10650010043",
			});
		},
		shareWechatShow: function () {
			this.logWithUbtTrace("203101", {
				orderid: this.data.orderId,
				page: "10650010043",
			});
		},
	},
});
