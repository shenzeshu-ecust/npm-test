import { cwx, __global, _ } from "../../../../../../cwx/cwx.js";
import util from "../../../../../../cwx/ext/util.js";
const cUtil = require('../../../../common/utils/util.js');

Component({
	properties: {
		hotelList: {
			type: Array,
			value: [],
			observer: 'oberverHotelList'
		},
		clearHotelList: {
			type: Boolean,
			value: false,
			observer: 'oberverClearHotel'
		},
		// 显示好友推荐的酒店ID
		friendRecommendHotelId: {
			type: Number,
			value: 0,
		},
	},
	data: {
		leftList: [],
		rightList: [],
	},

	methods: {
		oberverHotelList: function (nval, oval, change) {
			if (_.isArray(nval)) {
				this.onHotelLoadedSuccess(nval);
			}
		},
		oberverClearHotel: function (nval) {
			if (_.isBoolean(nval) && nval === true) {
				this.setData({
					leftList: [],
					rightList: [],
				});
			}
		},
		onHotelLoadedSuccess: function (hotelInfoList) {
			const self = this;
			var data = {};

			self.queryHotelListLRHeights((res) => {
				let leftHeight =
					res?.length > 0 && res[0] && res[0].length > 0
						? res[0].map((o) => o.height).reduce((a, b) => a + b)
						: 0;
				let rightHeight =
					res?.length > 1 && res[1] && res[1].length > 0
						? res[1].map((o) => o.height).reduce((a, b) => a + b)
						: 0;
				let leftMoreThanRight = leftHeight - rightHeight > 0;
				// 瀑布流左右高度差需要通过数据补正的个数
				let heightDiff = Math.floor(
					Math.abs(leftHeight - rightHeight) / 300
				);
				let curLeftList = [],
					curRightList = [];

				for (let index = 0; index < hotelInfoList.length; index++) {
					/**
					 * 左右高度差超过阈值根据heightDiff补高度
					 * 通过把高度值大的那边的待填充数据拆到高度值低的一边来补高度
					 * heightDiff：需要补正的数据量
					 */
					const targetCondition =
						heightDiff > 0 &&
						index + heightDiff * 2 >= hotelInfoList.length - 1;
					targetCondition && leftMoreThanRight && index % 2 == 0
						? curRightList.push(hotelInfoList[index]) &&
						  heightDiff--
						: targetCondition &&
						  !leftMoreThanRight &&
						  index % 2 != 0
						? curLeftList.push(hotelInfoList[index]) && heightDiff--
						: index % 2 == 0 // 左右高度差正常情况取模拆分左右列
						? curLeftList.push(hotelInfoList[index])
						: curRightList.push(hotelInfoList[index]);

						// 图片兜底切图
						if (hotelInfoList[index]?.logoPic) {
							hotelInfoList[index].logoPic = cUtil.convertCrop(hotelInfoList[index].logoPic, 'C', 400, 600, 5, 70)
						}
				}
				data.leftList = this.data.leftList.concat(curLeftList);
				data.rightList = this.data.rightList.concat(curRightList);
				// 筛选出促销标签
				data.leftList.forEach((e) => self.mapPromotionTags(e));
				data.rightList.forEach((e) => self.mapPromotionTags(e));
				this.setDataAsync(
					{
						leftList: data.leftList,
						rightList: data.rightList,
					},
					()=>{}
				);
			});
		},

		queryHotelListLRHeights: function (resolve) {
			let query = wx.createSelectorQuery().in(this);
			query.selectAll(".wrap-left > .item").boundingClientRect();
			query.selectAll(".wrap-right > .item").boundingClientRect();
			query.exec(function (res) {
				resolve(res);
			});
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

		mapPromotionTags: function (e) {
			e.prepayTags = [];
			e.featureTags = [];
			e.cutPriceTag = "";
			if (e.promotionTags && e.promotionTags.length > 0) {
				e.promotionTags.forEach((p) => {
					const id = p.id;
					const name = p.name;
					if (
						id.indexOf("prepay") > -1 ||
						id.indexOf("veildifprice") > -1 ||
						id.indexOf("normal") > -1 ||
						id.indexOf("PrimeVip") > -1 ||
						id.indexOf("Gift") > -1 ||
						id.indexOf("fgcoupon") > -1 ||
						id.indexOf("memberpoints") > -1 ||
						id.indexOf("feature") > -1 ||
						id.indexOf("quick") > -1 ||
						id.indexOf("invoice") > -1
					) {
						if (name) {
							if (id.indexOf("PrimeVip") > -1) {
								p.style = 2;
							}
							if (id.indexOf("feature") > -1) {
								p.style = 3;
							}
							e.prepayTags.push(p);
						}
					}
					if (/^(kanjia)/.test(id) && name) {
						e.cutPriceTag = name;
					}
				});
			}
			if (e.lastBookingTimeRemark && e.lastBookingTimeRemark != "") {
				e.timeRemark = e.lastBookingTimeRemark;
			}
		},

		hoteltap: function (e) {
			const data = e.currentTarget.dataset;

			this.triggerEvent("onTap", e);
		},
	},
});
