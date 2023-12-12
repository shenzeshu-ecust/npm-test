const couponListRest = require("./couponlistrest");
const getCouponRest = require("./getcouponrest");
const detaildata = require("../roomlist/detaildata.js");
import { cwx, _ } from "../../../../cwx/cwx.js";
import DateUtil from "../../common/utils/date.js";
const util = require("../../common/utils/util.js");
const card = require("../../common/market/card.js");
import commonfunc from "../../common/commonfunc";
import components from "../components";
const calendarPlugin = "calendar";
import commonrest from "../../common/commonrest";
import C from "../../common/Const.js";

Component({
	properties: {
		hotelBaseInfo: {
			type: Object,
			value: {},
		},
		hotelId: {
			type: String,
			value: "",
		},
		source: {
			type: String,
			value: "",
		},
		couponType: {
			type: Number,
			value: 0,
		},
		discountValue: {
			type: String,
			value: "",
		},
		unionVipType: {
			type: String,
			value: ''
		},
		allianceid: {
			type: String,
			value: ''
		},
		sid: {
			type: String,
			value: ''
		},
		hasLogin: {
			type: Boolean,
			value: false
		},
		scanPriceTag: {
			type: String,
			value: ''
		},
		// 展示优惠券浮层
		showBenefitList: {
			type: Boolean,
			value: false
		},
		checkInDay: {
			type: String,
			value: ''
		},
		checkOutDay: {
			type: String,
			value: ''
		},
		disablePlatformDiscount: Boolean, // 屏蔽随机立减 false 不屏蔽，true 屏蔽
		calendarLimitChooseDay: {
			type: Number,
			value: 0
		}
	},
	data: {
		inDay: "",
		outDay: "",
		timeZoneDate: null,
		selectMorning: false,
		totalDays: 1,
		inDay_disp: [],
		outDay_disp: [],
		couponIconList: [
			{
				title: '续住不换房',
				icon: 'https://pages.c-ctrip.com/hotels/wechat/market/smz/unionvip/continue-origin-room.png'
			},
			{
				title: '灵活退改',
				icon: 'https://pages.c-ctrip.com/hotels/wechat/market/smz/unionvip/flexible-cancellation.png'
			},
			{
				title: '入住保障',
				icon: 'https://pages.c-ctrip.com/hotels/wechat/market/smz/unionvip/ccupancy-guarantee.png'
			}
		],
		discount: {}, // 折扣
		needReceive: true, // 是否有可领取的优惠券
		rightItemListBar: [], // 外露权益
		rightItemList: [], // 优惠券浮层权益
		newCouponInfoList: [], // 外露优惠券列表
		showRoomList: false, // 展示房型列表
		isOrderCode: false, // 非续住场景
		couponItemList: [], // 优惠券浮层优惠券列表
	},
	lifetimes: {
		ready: function () {
			this.pageOnload();
		},
	},
	methods: {
		pageOnload() {
            // 判断非续住场景
			const {source, couponType} = this.data
            if(couponType !== 3 && (source === "front-desk" || source === "employee")) {
                this.setData({
                  isOrderCode: true
                })
            }
			const inDay = this.getInDay();
			const outDay = this.getOutDay();
			const timeZoneDate = DateUtil.TimeZoneDate.create();
			this.setData({
				inDay,
				outDay,
				timeZoneDate,
			});
			const inDay_disp = this.getDateDisp(inDay);
			const outDay_disp = this.getDateDisp(outDay);
			this.setData({
				inDay_disp,
				outDay_disp,
			});
			if (cwx.user.isLogin()) {
				this.couponListReq().then((res) => {
					// 获取优惠详情
					this.getBenefitInfo(res);
				});
			}
		},
		/**
		 * 是否需要更新优惠券
		 * 场景: booking领券返回
		 */
		checkCouponStatus: function () {
			this.couponListReq().then((res) => {
				this.triggerEvent("reloadRoomList");
				// 获取优惠详情
				this.getBenefitInfo(res);
			});
		},

		/**
		 * 点击banner刷新优惠券
		 * 
		 */
		clickReloadCoupon: function (e) {
			if (e && e.detail) {
				this.data.inDay = e.detail.inDay;
				this.data.outDay = e.detail.outDay;
			}
			this.couponListReq().then((res) => {
				// 获取优惠详情
				this.getBenefitInfo(res);
			});
		},
		
		/**
		 * @returns 查券后结果promise
		 *
		 */
		couponListReq() {
			const {
				checkInDay,
				checkOutDay,
				hotelId,
				hotelBaseInfo = {},
				inDay,
				outDay
			} = this.data;
			const userCouponGetInfo = {
				hotelId: parseInt(hotelId, 10),
				pageFrom: 2,
				checkIn: checkInDay || inDay || DateUtil.today(),
				checkOut: checkOutDay || outDay || DateUtil.tomorrow(),
				desCity: hotelBaseInfo.cityId,
			};
			const params = {
				isOversea: (hotelBaseInfo || {}).isOversea || 0,
				userCouponGetInfo: userCouponGetInfo,
				isFirstPage: 0,
				isNewCoupon: 1,
			};
			return new Promise((resolve) => {
				couponListRest.doRequest(
					params,
					(res = {}) => {
						resolve(res);
					},
					(err) => {
						resolve({});
					}
				);
			});
		},
		getBenefitInfo(res) {
			if (!res) return
			const self = this;
			let { discount = {}, needReceive = false, newCouponInfoList = [], couponItemList = [], rightItemList = [] } = res;
			let rightItemListBar = [];
			let originNewCouponInfoList = JSON.parse(JSON.stringify(newCouponInfoList));
			
			if (discount && discount.discountName) {
				newCouponInfoList = [
					{
						couponTitle: discount.discountName,
						couponUnit: discount.discountUnit,
						couponValue: discount.discountValue
					}, ...newCouponInfoList
				]
			}

			if (newCouponInfoList) {
				newCouponInfoList = newCouponInfoList.slice(0, 2);
			}

			if (rightItemList) {
				rightItemListBar = rightItemList.slice(0, 2);
			}

			if (couponItemList) {
				couponItemList.forEach((item) =>{
					if(item.assistActivity){
						item.shareBeforeBinding = item.assistActivity.shareBeforeBinding || false;
						item.canStartAssist = item.assistActivity.canStartAssist || false;
						item.needIdCardAuth = item.assistActivity.needIdCardAuth || false;
						item.shareActivityUrl = item.assistActivity.shareActivityUrl || '';
						if(item.assistActivity.assistDetail){
							item.needTotalNum = item.assistActivity.assistDetail.needTotalNum;
							item.totalNum = item.assistActivity.assistDetail.assistUserList.length || 0;
						}
						if(item.shareBeforeBinding && !item.canStartAssist){
							item.needReceive = false;
						}
					};
				})
			}

			this.setData({
				discount,
				needReceive,
				newCouponInfoList,
				originNewCouponInfoList,
				couponItemList,
				rightItemList,
				rightItemListBar
			}, () => {
			    self.logShowTrace();
			});

            const {source} = this.data
			const noBenefit = (!newCouponInfoList || !newCouponInfoList.length) && (!rightItemList || !rightItemList.length);
            const judgeBenfit = (source ==="wifi-landing" || source === "high-star-aggregate") && noBenefit 
			this.triggerEvent("updateNoBenefit", { noBenefit: judgeBenfit });
		},
		handleCouponReceive: function (e) {
			const { id: promotionID, name } = e?.currentTarget?.dataset || {};
			const { hotelId, source, couponItemList } = this.data;
			const coupons = util.clone(couponItemList);
			
			this.logWithUbtTrace("201560", {
				masterhotelid: hotelId,
				source,
				promotionContent: name,
			});
			
			this.receiveCouponReq(promotionID, coupons).then((res) => {
				const couponIdx = coupons.findIndex(
					(c) => c.promotionID === promotionID
				);
				const dataToSet = {
					[`couponItemList[${couponIdx}].needReceive`]: false
				};
				res.disableDate &&
						_.assignIn(dataToSet, { [`couponItemList[${couponIdx}].couponUseRule`]:
						res.disableDate });
				this.setData(dataToSet);

				// 同步微信卡券
				this.addWechatCards([`${promotionID}`]);
				// 领券成功后刷新房型列表
				this.triggerEvent("reloadRoomList");
			}).catch(e => {});
		},
		handleHelpCoupon:function (e) {
			const { canstartassist = false, shareUrl } = e?.currentTarget?.dataset || {};
			if(canstartassist){// true 去助力
				cwx.navigateTo({
					url:shareUrl
				});
				this.toggleBenefitList()
			}
		},
		/**
		 * 根据策略ID发微信卡券
		 * @param promoitionIds {array} promoitionIds promoitionId(string) list
		 */
		addWechatCards: function (promoitionIds) {
			let self = this;
			if (promoitionIds && promoitionIds.length) {
				commonrest.getWechatSoaSwitch(
					[C.WECHAT_CARD_BOUND_COUPON],
					(data) => {
						if (data?.result) {
							const idStr = data.result[C.WECHAT_CARD_BOUND_COUPON] || "";
							if (idStr) {
								const vaildIds = idStr.split(",");
								const ids = promoitionIds.filter((id) => {
									return self._includes(id, vaildIds);
								});
								card.addWxCard(
									self,
									ids,
									function () {
										cwx.showToast({
											title: "领取成功，已放至您的微信卡包",
											icon: "none",
										});
									},
									function () {
										cwx.showToast({
											title: "领取成功",
											icon: "none",
										});
									}
								);
							}
						}
					},
					"json"
				);
			}
		},
		_includes: function (val, arr) {
			let rs = false;
			if (arr) {
				for (let i = 0, n = arr.length; i < n; i++) {
					if (val === arr[i]) {
						rs = true;
						break;
					}
				}
			}

			return rs;
		},
		receiveCouponReq(promotionID, coupons) {
			const coupon = coupons.find((c) => c.promotionID === promotionID);
			if (!coupon)
				return new Promise((resolve, reject) => {
					reject();
				});

			const params = {
				promotionId: promotionID,
				type: coupon.type,
				sourceFrom: coupon.sourceFrom,
				hotelId: this.data.hotelId,
			};
			return this.handelTheCoupon(params,promotionID)
		},
		handelTheCoupon(params,promotionID) {
			return new Promise((resolve, reject) => {		
				getCouponRest.getCouponById(params, (r) => {
					if (r && r.responseHead) {
						if(r.responseHead.code === 0){
							resolve(r);
						}else if(r.responseHead.code === 53){
							this.onShowRealNamePop({ msg: r.responseHead.message, promotionID });
						}else{
							cwx.showToast({
								title: "领券失败",
								icon: "none",
							});
							reject();
						}
					} else {
						cwx.showToast({
							title: "领券失败",
							icon: "none",
						});
						reject();
					}
				}, () => { console.error("error") });
			});
		},

		/* 每个券的按钮处理 */
		toHelpGetCoupon: function (e) {
			const {
				id: activityId,
				unitid: assistUnitId,
				name,
			} = e?.currentTarget?.dataset || {};
			const { hotelId, source } = this.data;
			this.logWithUbtTrace("201560", {
				masterhotelid: hotelId,
				source,
				promotionContent: name,
			});
			// TODO：拼活动id
			cwx.navigateTo({
				url:
					"/pages/market/directory/assistNew/index?activityId=" +
					activityId +
					"&assistActivityId=" +
					assistUnitId,
			});
		},
		/* Empty method, do nothing */
		noop: function () {},
		logWithUbtTrace: function (ubtKey, data) {
			if (!ubtKey) return;
			let log = cwx.sendUbtByPage.ubtTrace || this.ubtTrace;
			log(ubtKey, data);
		},
		logShowTrace() {
			const {
				hotelId,
				source,
				discount,
				originNewCouponInfoList,
				rightItemList,
				isOrderCode
			} = this.data;

			if ((!discount || !discount.discountName) && (!originNewCouponInfoList || !originNewCouponInfoList.length) && (!rightItemList || !rightItemList.length)) {
				return;
			}
			let couponshow = isOrderCode ? 2 : 4;
			this.logWithUbtTrace("194558", {
				masterhotelid: hotelId,
				source,
				couponshow,
				is85discountShow: discount && discount.discountName ? 1 : 0,
				isCouponCardShow: originNewCouponInfoList && originNewCouponInfoList.length ? 1 : 0,
				isHotelInterestCardShow: rightItemList && rightItemList.length ? 1 : 0
			});
		},
		showCalender: function () {
			const self = this;
			const originalDate = {
				inDay: this.data.inDay,
				outDay: this.data.outDay,
			};
			const endDay = DateUtil.addDay(DateUtil.today(), 365);
			components[calendarPlugin](
				Object.assign(
					{
						inDay: DateUtil.formatTime(
							"yyyy-M-d",
							DateUtil.parse(originalDate.inDay)
						),
						endDate: endDay,
						timeZoneDate: this.data.timeZoneDate,
						title: "选择日期",
						isMorning: self.data.isMorning,
						// source==wifi-landing 或者 wifi-connect 日期只能从明日开始选
						source: "wifi-connect",
						maxStayDays: this.data.calendarLimitChooseDay
					},
					{
						outDay: DateUtil.formatTime(
							"yyyy-M-d",
							DateUtil.parse(originalDate.outDay)
						),
					}
				),
				this.calendarChoseBack.bind(this)
			);
		},
		calendarChoseBack(date) {
			const { inDay, outDay } = date || {};
			let chooseDate = {};
			chooseDate.inDay = DateUtil.formatTime(
				"yyyy-MM-dd",
				DateUtil.parse(inDay)
			);
			chooseDate.outDay = DateUtil.formatTime(
				"yyyy-MM-dd",
				DateUtil.parse(outDay)
			);

			const yesterday =
				this.data.timeZoneDate && this.data.timeZoneDate.yesterday();
			this.data.selectMorning =
				this.data.selectMorning && chooseDate.inDay === yesterday;
			chooseDate = this.checkOutDay(chooseDate);
			this.data.inDay = chooseDate.inDay;
			this.data.outDay = chooseDate.outDay;
			this.clickReloadCoupon();
			this.resetDate();
		},
		checkOutDay: function (chooseDate) {
			const dates = {
				inDay: chooseDate.inDay,
				outDay: chooseDate.outDay,
			};

			const inDate = DateUtil.parse(dates.inDay);
			const outDate = DateUtil.parse(dates.outDay);
			if (outDate <= inDate) {
				dates.outDay = DateUtil.addDay(dates.inDay, 1);
			}

			return dates;
		},
		resetDate: function (data) {
			data = data || this.data;
			const inDay = this.data.inDay;
			const outDay = this.data.outDay;
			data.inDay_disp = this.getDateDisp(inDay);
			data.outDay_disp = this.getDateDisp(outDay);
			data.totalDays = DateUtil.calDays(inDay, outDay);
			this.__isOneDay();
			this.setData(data);
		},
		getDateDisp(date) {
			return commonfunc.getDateDisp(
				date,
				this.data.timeZoneDate,
				this.data.selectMorning
			);
		},
		__isOneDay: function () {
			const ps = this.data;
			const inDay = DateUtil.dateStrToDate(ps.inDay);
			const outDay = DateUtil.dateStrToDate(ps.outDay);

			if (inDay == null || outDay == null) {
				return;
			}

			inDay.setDate(inDay.getDate() + 1);
			this.data.isOneDay = inDay.getTime() === outDay.getTime();
			return (outDay.getTime() - inDay.getTime()) / 24 / 60 / 60 / 1000;
		},
		getInDay: function () {
			const d = new Date();
			return d.getHours() < 14 ? DateUtil.today() : DateUtil.tomorrow();
		},

		getOutDay: function () {
			const d = new Date();
			return d.getHours() < 14
				? DateUtil.tomorrow()
				: DateUtil.aftertomorrow();
		},
		handleClickCLBtn: function() {
			this.setData({
				showRoomList: true
			})
		},
        continueLiveNow: function() {
            const { couponType } = this.data
            if(couponType === 3){
                this.handleClickCLBtn()
            }
            this.toggleBenefitList()
        },
		setVipLayerShow: function() {
			this.triggerEvent('setVipLayerShow')
		},
		toggleBenefitList() {
			const { showBenefitList, newCouponInfoList, rightItemList, hotelId, source, discount, couponItemList } = this.data;
			if (
				(!newCouponInfoList || !newCouponInfoList.length) &&
				(!rightItemList || !rightItemList.length)
			) {
				return;
			}

			this.setData({
				showBenefitList: !showBenefitList
			});
	  
			if (!showBenefitList) {
				//刷新优惠券列表
				this.clickReloadCoupon()
				//埋点
				let promotionIDList = [];
				newCouponInfoList.map((item) => {
					if (item.promotionID) {
						promotionIDList.push(item.promotionID);
					}
				});

				// 领券点击
				this.logWithUbtTrace("194559", {
					promotionIDList,
					masterhotelid: hotelId,
					source
				});

				const promotionlist = couponItemList.map((coupon) => {
					return {
						promotions_id: coupon.promotionID,
						promotions_name: coupon.couponName
					}
				})

				const propertylist = rightItemList.map((right) => {
					return {
						propertyid: right.rewardId,
						propertyname: right.rightName
					}
				})

				// 优惠券浮层曝光
				this.logWithUbtTrace("217083", {
					masterhotelid: hotelId,
					is85discountShow: discount && discount.discountName ? 1 : 0,
					promotionlist,
					propertylist
				});
			}
		},
		onAuthRealNameCallback(e) {
            const { promotionID = ''} = e?.detail || {};
            if (promotionID) {
                // 领券banner单张券领取
                this.handleCouponReceive({ currentTarget: { dataset: { id: promotionID } } });
            } 
        },
		/* 打开实名认证弹窗 */
		onShowRealNamePop(e) {
			const { msg, promotionID } = e || {};
			this.setData({
				realNamePop: {
					enable: true,
					message: msg || '',
					promotionID, 
				}
			});
		},
		/* 关闭实名认证弹窗 */
		onCloseRealName(e) {
			this.setData({
				'realNamePop.enable': false
			});
		},
	},
});
