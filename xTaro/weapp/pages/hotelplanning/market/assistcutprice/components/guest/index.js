const trace = require('../../../../common/trace/cutpricetrace');
const StorageUtil = require('../../../../common/utils/storage.js');
import date from '../../../../common/utils/date.js';
const util = require('../../../../common/utils/util.js');
const hotellist = require('../../../../common/hotellist/hotellist.js');
const cityModel = require('../../../../common/city/index.js');
const huser = require('../../../../common/hpage/huser')
import Api from '../../indexrest.js';
import { cwx, __global, _ } from '../../../../../../cwx/cwx.js';

const CITY_HISTORY_INLAND = 'P_CUTPRICE_CITY_HISTORY_INLAND';
const CITY_HISTORY_OVERSEA = 'P_CUTPRICE_CITY_HISTORY_OVERSEA';

Component({
	properties: {
		homeInfo: {
			type: Object,
			value: {},
			observer: 'observerHomeInfo'
		},
		orderId: {
			type: Number,
			value: 0,
		},
		jumpLink: {
			type: Array,
		},
		showHotel: {
			type: Number,
		},
		showHotellistSwitch: {
			type: Boolean,
		},
		current: {
			type: Number,
		},
	},
	data: {
		userInfo: {},
		creater: null,
		loadingState: "", // 不显示SUCCESS/空，加载中LOADING，到底了END, 失败FAILURE
		clearWaterfallHotelList: false,
		// 助力状态 11=帮TA助力, 12=召集好友 为TA助力, 13=看看周边热卖酒店
		bigButtonStatus: 0,
		bigButtonSubtitle: "",
		nickSubtitle: "",
		sponsorInfo: null,
		cutCoupons: [],
		cutUserRightsInterests: [],
		hotelInfo: {},
		recommendHotelList: [],
		location: {
			cityId: 2,
			cityName: "上海",
			type: "domestic",
		},
		// 与页面渲染无关的一些参数
		pageStatus: {
			hotelListLoadProcessing: false, // 是否正在加载酒店列表
			onCutPriceProcessing: false, //  是否正在请求砍价
			idGroups: [],
			hasReloadPage: false, // 是否正在刷新页面
		},
		userRewards: [],
		// 瀑布流相关 start
		model: {
			hotelListRequest: {
				cityId: 2,
				districtId: 0,
				checkinDate: date.today(),
				checkoutDate: date.tomorrow(),
				pageIndex: 1,
				pageSize: 10,
				filterInfo: {
					lowestPrice: 0,
					highestPrice: 0,
					starItemList: [],
					filterItemList: [],
					orderItem: "sort-0|1",
				},
				channel: 1,
				preHotelIds: "",
			},
			pageHotelCount: 0,
		},
		showResultMask: false,
		// assistCutPrice 助力服务返回
		assistResult: {
			coupons: [],
			message: "",
			result: false,
			userRightsInterests: [],
		},
		friendRecommendHotelId: 0,
		__isNoSence: false,
		fetchNewHotelList: true,
        hasAssist: false,
		showAssistPopupV1: false,
	},

	lifetimes: {},

	pageLifetimes: {
		show: function () {},
	},
	methods: {
		observerHomeInfo: function (nval, oval, change) {
			if (!_.isEmpty(nval)) {
				this.showPage(nval);
			}
		},
		// 推荐酒店回调
		onRefreshRecommendHotel: function (e) {
			this.loadHotels(true);
		},
		onTapAssist: function () {
			if (this.data.bigButtonStatus === 11) {
				huser.checkLoginStatus(true).then((isLogin) => {
					if (isLogin) {
						huser
							.getUesrInfo()
							.then((userInfo) => {
								this.setData({ userInfo: userInfo });
								this.triggerEvent("onTapGuestAssist");
							})
							.catch((error) => {
								this.setData({ userInfo: {} });
							});
					} else {
						huser.smartLogin({
							callback: (isLogin) => {
								if (isLogin) {
									this.triggerEvent("InitFatherPage");
								}
							},
						});
					}
				}).catch(e => {});
			} else {
				// 跳转列表页
				this.openMiniHotelList();
			}
		},
		showMessage: function (sMessage) {
			this.triggerEvent("showMessage", {
				message: sMessage,
			});
		},
		onSubmitResultMask: function (e) {
			const {
				url = "",
				result = false,
				coupons = [],
				userRightsInterests = [],
			} = e.currentTarget.dataset || {};
			const { assistCashbackAmount, totalAmount } = this.data.homeInfo;
			const close =
				assistCashbackAmount === totalAmount ||
				this.data.currentCheckpoint != this.data.current;
			var _operate = "";

			if (_.isEmpty(coupons) && _.isEmpty(userRightsInterests)) {
				_operate = "看看热卖酒店";
			} else {
				_operate = "立即使用";
			}
			this.logWithUbtTrace("197555", {
				orderid: this.data.orderId,
				type: this.data.assistResult.result ? "助力奖励" : "助力失败",
				operate: this.data.assistResult.result
					? _operate
					: close
					? "我知道了"
					: "召集好友 为TA助力",
			});

			if (
				result &&
				_.isEmpty(coupons) &&
				_.isEmpty(userRightsInterests)
			) {
				this.openMiniHotelList();
			} else if (result && url) {
				this.openWebview(url);
			} else if (result) {
				cwx.navigateTo({
					url: "/pages/hotel/inquire/index",
				});
			} else if (close) {
				this.setData({ showResultMask: false });
			}
			return;
		},
		onGotoCouponsRights: function (e) {
			const { url } = e.currentTarget.dataset || {};

			if (url) {
				this.openWebview(url);
			} else {
				cwx.navigateTo({
					url: "/pages/hotel/inquire/index",
				});
			}
		},
		onCloseResultMask: function () {
			this.logWithUbtTrace("197555", {
				orderid: this.data.orderId,
				type: this.data.assistResult.result ? "助力奖励" : "助力失败",
				operate: "关闭",
			});
			this.setData({ showResultMask: false });
		},

		handleSelectCity: function (e) {
			const self = this;
			let type =
				(e.target.dataset && e.target.dataset.type) ||
				"domestic" ||
				"hourroom";

			let _cityHistoryInland =
				StorageUtil.getStorage(CITY_HISTORY_INLAND) || [];
			let _cityHistoryOversea =
				StorageUtil.getStorage(CITY_HISTORY_OVERSEA) || [];

			const setHistory = function (cityData) {
				if (cityData && cityData.inlandCities) {
					cityData.inlandCities.historyCities = _cityHistoryInland;
				}
				if (cityData && cityData.interCities) {
					cityData.interCities.historyCities = _cityHistoryOversea;
				}
				if (cityData) {
					cityData.type = type;
				}
			};
			// 城市点击埋点
			trace.citySelectClick(self);

			cwx.component.city(
				{
					selectedCityName: self.data?.location?.cityName || "",
					loadData: function (callback) {
						const citydata = StorageUtil.getStorage(
							"hotelCutPriceCities"
						);
						if (citydata) {
							setHistory(citydata);
							callback(citydata);
						} else {
							cityModel.doRequest((citydata) => {
								StorageUtil.setStorage(
									"hotelCutPriceCities",
									citydata,
									720
								);
								setHistory(citydata);
								callback(citydata);
							});
						}
					},
					handleSearch: function (inputValue, currentTab, callback) {
						cityModel.doSearch(
							inputValue,
							currentTab,
							(searchResult) => {
								callback && callback(searchResult);
							}
						);
					},
					handleCurrentPosition: function (data, next) {
						self.getGeoLocation(
							(city) => {
								next({
									cityName: city.cityName + " ",
									address: city.address || "",
									title: city.address || "",
									poiName: city.poiName,
									cityId: city.cityId,
									did: 0,
									type: city.type,
									biz: city.biz,
									lat: city.lat,
									lng: city.lng,
									isGeo: true,
								});
							},
							() => {
								next(null);
							}
						);
					},
					handleClearHistory: function () {
						StorageUtil.removeStorage("hotelCutPriceCities");
						StorageUtil.removeStorage(CITY_HISTORY_INLAND);
						StorageUtil.removeStorage(CITY_HISTORY_OVERSEA);
					},
				},
				function (selectedcity) {
					self.data.model.hotelListRequest.preHotelIds = ""
					if (selectedcity.cityId != self.data.location.cityId) {
						let updateData = {
							location: {
								cityId: selectedcity.cityId,
								cityName: selectedcity.cityName,
								type:
									selectedcity.type == 2
										? "oversea"
										: "domestic",
							},
						};
						self.data.model.hotelListRequest.cityId =
							selectedcity.cityId;
						const { hotelInfo, showBusinessHotel } = self.data;
						if (showBusinessHotel && hotelInfo) {
							if (hotelInfo.cityId === selectedcity.cityId) {
								const hotelList = [].concat(
									"" + hotelInfo.hotelId
								);
								self.data.model.hotelListRequest.topHotelIds =
									hotelList;
								self.update({ queryByHotel: true });
							}
						}
						self.update(updateData);
						self.loadHotels(true);

						// 记录用户选择城市
						setTimeout(() => {
							if (selectedcity && selectedcity.type === 2) {
								_cityHistoryOversea =
									_cityHistoryOversea.filter(
										(v) => v.cityId !== selectedcity.cityId
									);
								_cityHistoryOversea.unshift(selectedcity);
								StorageUtil.setStorage(
									CITY_HISTORY_OVERSEA,
									_cityHistoryOversea
								);
							} else {
								_cityHistoryInland = _cityHistoryInland.filter(
									(v) => v.cityId !== selectedcity.cityId
								);
								_cityHistoryInland.unshift(selectedcity);
								StorageUtil.setStorage(
									CITY_HISTORY_INLAND,
									_cityHistoryInland
								);
							}
						}, 100);
					}
				}
			);
		},

		// 获取城市定位信息
		getGeoLocation: (success, error) => {
			const checkResponse = function (res) {
				return (
					!res.error &&
					res.data.CityEntities &&
					res.data.CityEntities.length > 0 &&
					!!getRealZxCity(res.data.CityEntities)
				);
			};
			const getRealZxCity = function (cityList) {
				const cityZX = { 1: "北京", 2: "上海", 3: "天津", 4: "重庆" };
				let flagCity = cityList[0];
				_.each(cityList, function (v) {
					if (cityZX[v.CityID]) {
						flagCity = v;
						return false;
					}
				});
				return flagCity;
			};
			const handleCityInfo = function (rsp) {
				if (checkResponse(rsp)) {
					const cityInfo = rsp.data;
					const lng = cityInfo.CityLongitude;
					const lat = cityInfo.CityLatitude;
					const city =
						cityInfo.CityEntities &&
						cityInfo.CityEntities.length > 0
							? getRealZxCity(cityInfo.CityEntities)
							: null;
					const type =
						cityInfo.CountryName !== "中国"
							? "oversea"
							: "domestic";
					if (!city) {
						error(cityInfo);
						return;
					}

					let cityName = city?.CityName || '';
					if (cityName.indexOf("市") !== -1) {
						cityName = cityName.replace("市", "").trim();
					}

					success({
						cityId: city.CityID,
						cityName: cityName,
						did: 0,
						type: type,
						lng: lng,
						lat: lat,
					});
				} else {
					error();
				}
			};

			let cachedCity = cwx.locate.getCachedCtripCity();

			cachedCity != null
				? handleCityInfo(cachedCity)
				: cwx.locate.startGetCtripCity((rsp) => {
						handleCityInfo(rsp);
				  }, "hotel-unionvip");
		},

		showPage: async function (oHomeInfo) {
			if (_.isEmpty(oHomeInfo)) {
				return;
			}

			// 助力状态(1-进行中, 2-订单取消, 3-助力结束，未到达返现点 4-助力结束，到达返现点，返现中，5-已返现)
			var _assistStatus = util.getAttr(oHomeInfo, "assistStatus");
			var _assistCashbackAmount =
				util.getAttr(oHomeInfo, "assistCashbackAmount") || 0;
			var _hotelId = util.getAttr(oHomeInfo, "hotel.id");
			// isAssisted: 当前用户助力状态(0-未助力，1-已助力，2-助力失败)
			// bigButtonStatus: 客态传参：11=帮TA助力, 12=召集好友 为TA助力, 13=看看周边热卖酒店
			var _bigButtonStatus = oHomeInfo.isAssisted === 0 ? 11 : 12;
			var _bigButtonSubtitle =
				{
					0: "帮好友助力，你也可以领好礼",
					1: "你已经帮TA助力过",
					2: "抱歉，暂不满足助力条件",
				}[oHomeInfo.isAssisted] || "";
			var _nickSubtitle = "我在携程订了酒店，快来助力帮我领现金吧！";
			const assistTop =
				oHomeInfo.assistCashbackAmount === oHomeInfo.totalAmount;
			if (_assistStatus != 1) {
				_bigButtonStatus = 13;

				if (oHomeInfo.isAssisted === 0) {
					_bigButtonSubtitle = "活动结束，无法助力啦";
				} else if (
					oHomeInfo.assistCashbackAmount === oHomeInfo.totalAmount
				) {
					_bigButtonSubtitle = "好友已通关，无法助力啦";
				}

				if (_assistStatus === 4 || _assistStatus === 5) {
					_nickSubtitle =
						"我在携程订了酒店，领到" +
						_assistCashbackAmount +
						"元现金！";
				} else {
					_nickSubtitle = "订酒店用携程，你也来看看吧！";
				}
			} else if (assistTop) {
				_bigButtonStatus = 13;
				_bigButtonSubtitle = "好友已通关，无法助力啦";
			}
			// 自动帮砍
			huser.checkLoginStatus(true).then((isLogin) => {
				if (
					isLogin &&
					_assistStatus === 1 &&
					oHomeInfo.isAssisted === 0 &&
					!assistTop
				) {
					this.setData({ __isNoSence: true });
					setTimeout(() => {
						this.onTapAssist();
					}, 100);
				} else {
					this.setData({ __isNoSence: false });
				}
			}).catch(e => {});

			if (oHomeInfo.isAssisted === 1) {
                this.setData({
                    hasAssist: true
                })
				this.setPopupDisplay(oHomeInfo.cutCoupons, oHomeInfo.userRightsInterests, oHomeInfo.newGuest)
			}

			if (oHomeInfo?.creator?.avatar) {
				oHomeInfo.creator.avatar = util.convertCrop(oHomeInfo.creator.avatar, 'C', 100, 100, 0, 70)
			}

			this.setData({
				friendRecommendHotelId:
					oHomeInfo.signed && this.data.showHotel === 1
						? oHomeInfo?.hotel.id
						: 0,
				showBusinessHotel: oHomeInfo.signed,
				cutCoupons: oHomeInfo.cutCoupons,
				cutUserRightsInterests: this.getFormate_rights(
					oHomeInfo.userRightsInterests,
					oHomeInfo.newGuest
				),
				creater: oHomeInfo.creator,
				bigButtonStatus: _bigButtonStatus,
				bigButtonSubtitle: _bigButtonSubtitle,
				nickSubtitle: _nickSubtitle,
			});

			this.initHotel(_hotelId);
			this.initRecommendHotels(oHomeInfo);
		},

		initRecommendHotels: function (oHomeInfo) {
			let homeInfo = oHomeInfo;

			var errCallback = () => {
				let updateData = {
					location: {
						cityId: 2,
						cityName: "上海",
						type: "domestic",
					},
				};
				this.update(updateData);
				this.loadHotels(true);
			};

			this.getGeoLocation(
				(city) => {
					if (city && city.cityId) {
						this.data.model.hotelListRequest.cityId = city.cityId;
						let updateData = {
							location: {
								cityId: city.cityId,
								cityName: city.cityName,
								type: city.type,
							},
						};
						this.update(updateData);
						if (this.data.showBusinessHotel && homeInfo) {
							if (homeInfo.hotel?.cityId === city.cityId) {
								const hotelList = [].concat(
									"" + homeInfo.hotel.id
								);
								this.data.model.hotelListRequest.topHotelIds =
									hotelList;
								this.update({ queryByHotel: true });
							}
						}
						this.loadHotels(true);
					} else {
						errCallback();
					}
				},
				(err) => {
					errCallback();
				}
			);
		},

		// 酒店详情数据
		initHotel: function (nHotelId) {
			if (util.getAttr(this.data, "hotelInfo.hotelId") === nHotelId) {
				return;
			}

			Api.getHotelDetail(nHotelId)
				.then((res) => {
					if (res && res.name && res.cityId) {
						res.hotelId = nHotelId;
						this.setData({ hotelInfo: res });
					} else {
						this.setData({ hotelInfo: {} });
					}
				})
				.catch((err) => {
					this.setData({ hotelInfo: {} });
				});
		},
		// 热门酒店推荐
		loadHotels: function (clear) {
			if (
				(this.data.loadingState !== "LOADING" &&
					this.data.loadingState !== "END") ||
				clear
			) {
				this.doHotelListLoad(clear);
			}
		},
		// 父层调用 向下滚动加载
		loadMorelHotels: function () {
			this.loadHotels(false);
		},

		// 父层调用 发起砍价服务
		loadCutPrice: function ({
			from = "",
			appFrom = "",
			openId = 0,
			currentCheckpoint = 0,
		}) {
			this.setData({ currrentCheckpoint: currentCheckpoint });
			const _fetch = (avatar, nick) => {
				wx.showLoading({ title: "加载中..." });

				Api.assistCutPrice({
					orderId: this.data.orderId,
					user: {
						avatar: avatar,
						nick: nick,
						mktOpenId: openId,
					},
					from: from,
					appFrom: appFrom,
					currentCheckpoint: currentCheckpoint,
				})
					.then(async (res) => {
						const { assistCashbackAmount, totalAmount, newGuest } =
							this.data.homeInfo;
						if (!(res?.ResponseStatus?.Ack !== "Failure")) {
							throw "assistCutPrice请求失败";
						}
						wx.hideLoading();
						
						let popupDisplay = {}
						if (res.result) {
                            this.setData({
                                hasAssist: true
                            })
							popupDisplay = this.setPopupDisplay(res.coupons, res.userRightsInterests, newGuest)
						}

						// 助力成功 && 有红包或权益 && && 新客 && 命中实验组 展示新版弹窗
						const showAssistPopupV1 = res.result && popupDisplay.itemCount > 0 && newGuest

						if (showAssistPopupV1) {
							this.logWithUbtTrace("197554", {
								orderid: this.data.orderId,
								type: "新帮砍奖励",
								operate: "用助力优惠订酒店",
							});
						} else {
							this.logWithUbtTrace("197554", {
								orderid: this.data.orderId,
								type: res.result ? "助力奖励" : "助力失败",
								operate: res.result
									? "立即使用；关闭"
									: assistCashbackAmount === totalAmount ||
									  currentCheckpoint != this.data.current
									? "我知道了；关闭"
									: "召集好友 为TA助力；关闭",
							});
						}
						this.setData({
							showAssistPopupV1,
							assistResult: res,
							cutCoupons: res.coupons || [],
							cutUserRightsInterests:
								this.getFormate_rights(
									res.userRightsInterests, newGuest
								) || [],
							showResultMask: true,
							bigButtonStatus:
								assistCashbackAmount === totalAmount ||
								currentCheckpoint != this.data.current
									? 13
									: 12,
							bigButtonSubtitle: res.result
								? "你已经帮TA助力过"
								: assistCashbackAmount === totalAmount
								? "好友已通关，无法助力啦"
								: "抱歉，暂不满足助力条件",
						});
						this.triggerEvent("getAssistStatus", res.result);
					})
					.catch((err) => {
						wx.hideLoading();
						this.showMessage("哎呀，服务出错啦，请重新点击进入~");
						this.triggerEvent("getAssistStatus", false);
					});
			};

			if (util.getAttr(this.data, "homeInfo.assistStatus") != 1) {
				this.showMessage("助力失败，请稍后再试试。");
				this.triggerEvent("getAssistStatus", false);
				return;
			}

			huser.smartLogin({
				callback: (isLogin) => {
					if (isLogin) {
						const { avatarUrl, nickName } =
							this.data.userInfo || {};

						_fetch(avatarUrl, nickName);
					}
				},
			});
		},

		doHotelListLoad: function (clear) {
			const self = this;
			const data = {
				loadingState: "LOADING",
				clearWaterfallHotelList: false,
			};

			if (this.data.userRewards && 0 in this.data.userRewards) {
				this.data.model.hotelListRequest.filterInfo.filterItemList = [
					"kanjia-666|||砍价促销|@hoteldiscount",
				];
			}
			if (clear) {
				data.clearWaterfallHotelList = true;
				data.recommendHotelList = [];
				this.data.model.pageHotelCount = 0;
				this.data.model.hotelListRequest.pageIndex = 1;
			}

			this.setDataAsync(data);

			// 断开引用，否则会引起前后端埋点不一致的问题
			const requestData = util.clone(this.data.model.hotelListRequest);

			hotellist.doRequest(
				self,
				requestData,
				(rsp) => {
					if (rsp.hotelInfoList && rsp.hotelInfoList.length) {
						const curCount = self.data.model.pageHotelCount;
						const totalCount = rsp.hotelCount;
						if (curCount < totalCount) {
							self.data.model.hotelListRequest.pageIndex++;
							self.data.model.pageHotelCount =
								curCount + rsp.hotelInfoList.length;
							self.data.model.hotelListRequest.preHotelIds =
								self.data.model.hotelListRequest.preHotelIds
									.split(",")
									.filter((i) => i)
									.concat(
										rsp.hotelInfoList.map((i) => i.hotelId)
									)
									.join(",");

							self.setData({
								clearWaterfallHotelList: false,
								recommendHotelList: rsp.hotelInfoList,
								loadingState: "SUCCESS",
							});
						} else {
							self.setData({
								loadingState: "END",
								clearWaterfallHotelList: false,
							});
						}
					} else {
						self.setData({
							loadingState: "END",
							clearWaterfallHotelList: false,
						});
					}

					self.data.model.hotelListRequest.topHotelIds = [];
				},
				function (error) {
					self.setDataAsync({
						loadingState: "FAILURE",
						clearWaterfallHotelList: false,
					});
				}
			);
		},

		setDataAsync: function (data, callback) {
			const self = this;
			if (!this.__delayData) {
				this.__dataTimer = 1;
				this.__delayData = [{}];
			}

			this.data = _.assignIn(this.data, data);
			this.__delayData.push(data);

			clearTimeout(this.__dataTimer);
			this.__dataTimer = setTimeout(() => {
				self.setData(_.assignIn.apply(_, self.__delayData), callback);
				self.__delayData = null;
			}, 0);
		},

		update: function (obj) {
			this.setData({ ...obj });
		},

		waterHotelTap: function (e) {
			if (e && e.detail) {
				this.hoteltap(e.detail);
			}
		},

		hoteltap: function (e) {
			const hotelListRequest = this.data.model.hotelListRequest;
			const data = e.currentTarget.dataset;
			this.logWithUbtTrace("108911", {
				masterhotelid: data.id,
				orderid: this.data.orderid,
			});
			let detailUrl = `/pages/hotel/detail/index?id=${data.id}&inday=${hotelListRequest.checkinDate}&outday=${hotelListRequest.checkoutDate}`;

			if (data.decimal !== undefined) {
				detailUrl += `&price_decimal=${data.decimal ? '1' : '0'}`
			}

			cwx.navigateTo({
				url: detailUrl,
			});
		},

		openMiniHotelList() {
			const hotelListRequest = this.data.model.hotelListRequest;
			const cityId = this.data.location.cityId;
			const listlUrl = `/pages/hotel/list/index?cityid=${cityId}&inday=${hotelListRequest.checkinDate}&outday=${hotelListRequest.checkoutDate}`;

			cwx.navigateTo({ url: listlUrl });
		},

		openWebview(h5jumpurl) {
			cwx.navigateTo({
				url:
					"/pages/hotel/components/webview/webview?data=" +
					JSON.stringify({
						url: encodeURIComponent(h5jumpurl),
					}),
			});
		},

		logWithUbtTrace: function (ubtKey, data) {
			if (!ubtKey) return;
			let log = cwx.sendUbtByPage.ubtTrace || this.ubtTrace;
			log(ubtKey, data);
		},

		getFormate_rights: function (arrRights, newGuest) {
			let res = []
			if (util.isArray(arrRights)) {
				res = arrRights.map((v) => {
					if (v.effectDate) {
						v.fm_effectDate = date.formatTime(
							"yyyy.MM.dd",
							+v.effectDate
						);
					}
					switch(v.deductionType) {
						case 2:
							v.img = 'https://pages.c-ctrip.com/hotels/wechat/market/assistcutprice/mianfeizaocan.png'
							break;
						case 3:
							v.img = 'https://pages.c-ctrip.com/hotels/wechat/market/assistcutprice/fangxingshengji.png'
							break;
						case 4:
							v.img = 'https://pages.c-ctrip.com/hotels/wechat/market/assistcutprice/yanchituifang.png'
							break;
						case 5:
							v.img = 'https://pages.c-ctrip.com/hotels/wechat/market/assistcutprice/mianfeiquxiao.png'
							break;
					}
					return v;
				});
				if (!newGuest) {
					res = res.filter(r => r.deductionType === 1)
				}
			}

			return res;
		},

		setPopupDisplay: function(coupons, rights, newGuest) {
			const assistPopupDisplay = {
				showCoupon: false,
				show85Right: false,
				showRights: false,
				sizeClass: '',
				itemCount: 0
			}
			const sizeClassMap = {
				1: 'reward-size-xlarge',
				2: 'reward-size-large',
				3: 'reward-size-normal'
			}
			if (coupons?.length) {
				assistPopupDisplay.showCoupon = true
				assistPopupDisplay.itemCount++
			}
			if (rights?.length && rights.some(r => r.deductionType === 1)) {
				assistPopupDisplay.show85Right = true
				assistPopupDisplay.itemCount++
			}
			// B版新客 展示4大权益
			if (newGuest && rights?.length && rights.some(r => [2, 3, 4, 5].includes(r.deductionType))) {
				assistPopupDisplay.showRights = true
				assistPopupDisplay.itemCount++
			}
			assistPopupDisplay.sizeClass = sizeClassMap[assistPopupDisplay.itemCount]
			this.setData({
				assistPopupDisplay
			})
			return assistPopupDisplay
		},

		goHotelSearch: function(e) {
			const { type } = e.currentTarget?.dataset || {}
			if (type === '1') {
				this.logWithUbtTrace("203105", {
					page: '10650010043',
					operate_type: 4
				})
			}
			if (type === "2") {
				this.logWithUbtTrace("197555", {
					orderid: this.data.orderId,
					type: '新帮砍奖励',
					operate: '用助力优惠订酒店'
				})
			}

			cwx.navigateTo({
				url: "/pages/hotel/inquire/index",
			});
		},

		goHotelList: function() {
			cwx.navigateTo({
				url: "/pages/hotel/list/index"
			})
		}
	},
});
