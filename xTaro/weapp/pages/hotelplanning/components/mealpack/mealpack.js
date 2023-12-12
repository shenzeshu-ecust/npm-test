import { cwx, __global } from "../../../../cwx/cwx.js";
import Api from "../../common/apis/restapi";
import DateUtil from '../../common/utils/date.js';

const urlUtil = require('../../common/utils/url')

Component({
	properties: {
		hotelId: {
			type: String,
			value: "",
		},
		hotelBaseInfo: {
			type: Object,
			value: {},
		},
		inday: {
			type: String,
			value: "",
		},
		outday: {
			type: String,
			value: "",
		},
		eid: {
			type: String,
			value: ""
		},
        source: {
            type: String,
			value: ""
        },
        pageId: {
            type: String,
			value: ""
        },
		cikaSwitch: {
			type: Boolean,
            value: false
		}
	},
	data: {
		isMealActive: true,
		isPackActive: false,
		highStarData: {
			mealProductTotal: 0,
			mealProductList: [],
			packProductTotal: 0,
			packProductList: [],
		},
		defaultMealUrl:
			"https://pages.c-ctrip.com/hotels/wechat/market/smz/aggregate/meal_default_pic.png",
		defaultPackUrl:
			"https://pages.c-ctrip.com/hotels/wechat/market/smz/aggregate/pack_default_pic.png",
		multipleCardList: [],
		multipleCardLen: 0,
		cardDesc: ['过期退', '随时退', '可拆分使用']
	},

	ready() {
	},

	observers: {
		"inday, outday": function () {
			const checkIn = DateUtil.formatTime(
				"yyyy-MM-dd",
				this.properties.inday
			);
			const checkOut = DateUtil.formatTime(
				"yyyy-MM-dd",
				this.properties.outday
			);
			this.getHotelMallProductList(checkIn, checkOut);
		},
	},

	methods: {
		selectTab(e) {
			const dataset = e.currentTarget.dataset;
			const { tabtype } = dataset;
			this.setData({
				isMealActive: tabtype === "1" ? true : false,
				isPackActive: tabtype === "2" ? true : false,
			});
			cwx.sendUbtByPage.ubtTrace("204227", {
				masterhotelid: this.properties.hotelId,
				tab_type: tabtype,
			});
		},

		modalShowTrace(type) {
			cwx.sendUbtByPage.ubtTrace("204226", {
				masterhotelid: this.properties.hotelId,
				show_type: type,
			});
		},

		getHotelMallProductList: function (checkIn, checkOut) {
			if (!this.properties.hotelId) {
				return;
			}
			Api.getHotelMallProductList({
				hotelId: this.properties.hotelId,
				checkIn,
				checkOut,
			}).then((res) => {
				if (res && res.retCode === 0) {
					const { packProductInfo, mealProductInfo } = res;
					if (mealProductInfo) {
						const { productInfoList = [], total = 0 } = mealProductInfo;
						let poiIdRecord = "";
						const productInfoListDisplay = productInfoList.splice(0,2).map(
							(p) => {
								if (p.restaurantInfo) {
									const {
										commentScore,
										cuisineNames,
										avgPrice,
										poiId,
									} = p.restaurantInfo;
									if (poiId === poiIdRecord) {
										p.restaurantInfo.showRestaurantInfo = false;
									} else {
										poiIdRecord = poiId;
										p.restaurantInfo.showRestaurantInfo = true;
									}
									p.restaurantInfo.commentText = "";
									if (commentScore > 0)
										p.restaurantInfo.commentText += `${commentScore.toFixed(
											1
										)}分 `;
									if (cuisineNames)
										p.restaurantInfo.commentText += `${cuisineNames.join(
											" "
										)} `;
									if (avgPrice > 0)
										p.restaurantInfo.commentText += `人均￥${avgPrice}`;
								}
								if (p.basicInfo?.picUrl) {
									p.basicInfo.picUrl =
										p.basicInfo.picUrl.replace(".jpg", "");
									p.basicInfo.picUrl = `${p.basicInfo.picUrl}_W_240_10000_Q70.jpg`;
								}
								return p;
							}
						);
						this.setData({
							"highStarData.mealProductList":
								productInfoListDisplay,
							"highStarData.mealProductTotal": total
						});
					}
					if (packProductInfo) {
						const { productInfoList = [], total = 0 } = packProductInfo;
						const { multipleCardList, multipleCardLen } = this.getMultipleCard(productInfoList);
						const productInfoListDisplay = productInfoList.splice(0,2).map(
							(p) => {
								if (p.mealInfos && p.mealInfos.length) {
									p.mealInfosText = p.mealInfos
										.map(
											(m) =>
												`${m.mealTypeDesc} ${m.mealNumDesc}`
										)
										.join(" + ");
								}
								if (
									p.productLabelInfos &&
									p.productLabelInfos.length
								) {
									p.showBOSSRecommend =
										p.productLabelInfos.some(
											(l) => l.labelId === 227
										);
								}
								if (p.basicInfo?.picUrl) {
									p.basicInfo.picUrl =
										p.basicInfo.picUrl.replace(".jpg", "");
									p.basicInfo.picUrl = `${p.basicInfo.picUrl}_W_320_10000_Q70.jpg`;
								}
								if (p.basicInfo?.roomName) {
									p.title = `${p.basicInfo.roomName} ${p.basicInfo.nights}晚`;
								} else {
									p.title = p.basicInfo.productName;
								}

                                if(p.basicInfo?.ticketMaxUseNum > 1) {
                                    p.title = p.title + "（可拆分）"
                                }
								return p;
							}
						);

						this.setData({
							"highStarData.packProductList":
								productInfoListDisplay,
							"highStarData.packProductTotal": total,
							multipleCardList,
							multipleCardLen
						});
					}
					// 曝光埋点
					const {
						highStarData: { mealProductList, packProductList },
					} = this.data;
					if (
						mealProductList.length > 0 &&
						packProductList.length > 0
					) {
						this.modalShowTrace("3");
					} else if (mealProductList.length > 0) {
						this.modalShowTrace("1");
					} else if (packProductList.length > 0) {
						this.modalShowTrace("2");
					}
				} else {
					cwx.sendUbtByPage.ubtTrace("202808", {
						type: 1,
						errVal: "getHotelMallProductList",
						page: this.data.pageId,
					});
				}
			});
		},

		getMultipleCard(productInfoList) {
			if (!productInfoList || !productInfoList.length) {
				return {
					multipleCardList: [],
					multipleCardLen: 0
				}
			} 

			let multipleCardList = JSON.parse(JSON.stringify(productInfoList));
		    multipleCardList = multipleCardList
								.filter(product => product.productLabelInfos.some(label => label.labelId === 887))
								.map(p => {
									p.soldQuantity = `已售${p.basicInfo?.soldQuantity || 0}`;
									p.hasSave = p.perNightPrice;
									return p;
								});
			return {
				multipleCardList: multipleCardList.slice(0, 3),
				multipleCardLen: multipleCardList.length
			};
		},

		gotoProductDetail: function (e) {
			const dataset = e.currentTarget.dataset;
			const { url, idx, producttype, clicktype } = dataset;
			const { h5Url, miniProgramUrl } = url;
			const { eid } = this.data
			this.hotelProductClick({
				masterhotelid: this.properties.hotelId,
				productrank: idx + 1,
				producttype: producttype,
				clicktype: clicktype,
				source: this.data.source,
			});
			// 对接方都是h5 url, 所以忽略小程序url，方便eid传参
			// if (miniProgramUrl) {
			// 	cwx.navigateTo({
			// 		url: miniProgramUrl,
			// 	});
			// 	return;
			// }
			let navigateUrl = h5Url
			if (navigateUrl && !urlUtil.checkIsFullUrl(navigateUrl)) {
				navigateUrl = `${
					__global.env === "fat"
						? "http://m.ares.fws.qa.nt.ctripcorp.com"
						: "https://m.ctrip.com"
				}${navigateUrl}`
			}
			if (eid) {
				navigateUrl = urlUtil.setParams(navigateUrl, { eid })
			}
            navigateUrl = urlUtil.setParams(navigateUrl, { fromscan: 1 })
			if (navigateUrl) {
				cwx.navigateTo({
					url:
						"/pages/hotel/components/webview/webview?data=" +
						JSON.stringify({ url: encodeURIComponent(navigateUrl) }),
				});
			} else {
				cwx.showToast({ title: "当前无法跳转", icon: "none" });
			}
		},

		hotelProductClick(options) {
			cwx.sendUbtByPage.ubtTrace("196054", {
				masterhotelid: options.masterhotelid,
				productrank: options.productrank,
				producttype: options.producttype,
				clicktype: options.clicktype,
				source: options.source,
			});
		},

		gotoProductList: function (e) {
			const hotelInfo = this.properties.hotelBaseInfo;
			const dataset = e.currentTarget.dataset;
			const { eid } = this.data
			this.hotelProductClick(this, {
				masterhotelid: this.properties.hotelId,
				producttype: dataset.producttype,
				clicktype: "3",
				source: this.data.source,
			});
			let navigateUrl = `${
				__global.env === "fat"
					? "http://m.ares.fws.qa.nt.ctripcorp.com"
					: "https://m.ctrip.com"
				}/webapp/cw/hotel/instoreflagship/instoreHome.html?cityName=${
					hotelInfo.cityName
				}&cityId=${hotelInfo.cityId}&masterHotelId=${
					this.properties.hotelId
				}&hotelName=${hotelInfo.name}&hotelId=${
					this.properties.hotelId
				}&hometype=1&fromscan=1`
			if (eid) {
				navigateUrl = urlUtil.setParams(navigateUrl, { eid })
			}
			cwx.navigateTo({
				url:
					"/pages/hotel/components/webview/webview?data=" +
					JSON.stringify({
						url: encodeURIComponent(navigateUrl),
					}),
			});
		},

		noImageTrace(e) {
            let errMsg = e?.detail?.errMsg || '';
            this.triggerEvent('noImageTrace', { errMsg, type: '酒店套餐' });
        },
	},
});
