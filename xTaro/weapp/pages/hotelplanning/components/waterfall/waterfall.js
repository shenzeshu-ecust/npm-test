import { cwx } from "../../../../cwx/cwx";
import Api from "../../common/apis/restapi";
import util from '../../common/utils/util.js';

let currentWaterfallList = [], // 当前list
	pageIndex = 1,
	perPageCount = 20,
	coordinate = {
		latitude: null,
		longitude: null,
	},
	globalInfo = {
		type: 3,
		id: null,
		name: "",
	};

Component({
	properties: {
		cityId: {
			type: String,
		},
		cityName: {
			type: String,
		},
		coordinate: {
			type: Object,
		},
		hotelId: {
			type: String,
		},
		sourceFrom: {
			type: String,
			value: "-1",
		},
        isNew: {
			type: Boolean,
			value: false,
		},
	},
	data: {
		waterfallLeftList: [],
		waterfallRightList: [],
		waterfallLeftHeight: 0,
		waterfallRightHeight: 0,
		loadingState: 1, // 0正常，1加载中，2到底了 3失败
		windowHeight: cwx.wxSystemInfo.windowHeight,
		firstLoadExploreStore: true, // 是否第一次加载
		exploreCommentCount: 0,
	},
	lifetimes: {
		attached: function () {
			let self = this;

			// init params
			let {
				cityId,
				cityName,
				coordinate: { latitude, longitude },
			} = this.data;
			globalInfo.id = cityId;
			globalInfo.name = cityName;
			coordinate = {
				latitude,
				longitude,
			};
			self.initRelevantData();
		},
		detached: function () {
			if (this._observer) {
				// 解绑
				this._observer.disconnect();
			}
		},
	},
	methods: {
		getWaterList: function () {
			let tempCurrentWaterfallList = [];
			let loadingState = 1;

			/** 高星落地页，默认获取达人探店 */
			if (
				this.data.sourceFrom === "high-star-aggregate"
			) {
				this.getExploreStoreData();
			}
		},
		// 瀑布流处理 type 1: 目的地信息流 2: 达人探店瀑布流
		getWaterFallList: function (type) {
      let { waterfallLeftList, waterfallRightList, waterfallLeftHeight, waterfallRightHeight } = this.data;
			let self = this,
				leftList = waterfallLeftList,
				rightList = waterfallRightList,
				leftHeight = waterfallLeftHeight, // 左列高度
				rightHeight = waterfallRightHeight; // 右列高度
			let baseWidthHeight = 343;
			if (type === 2) {
				currentWaterfallList
					.filter((item) => item.dataType !== 3)
					.forEach((item, index) => {
						const [picWidth, picHeight] = this.processImageSize(
							baseWidthHeight,
							item.width,
							item.height
						);

						item.picWidth = picWidth;
						item.picHeight = picHeight;

						let authorVipIcon = "";
						if (item.authorLevel === "1" && item.dataType === 1) {
							item.authorVipIcon =
								"https://pages.c-ctrip.com/hotels/wechat/market/smz/aggregate/yellow_vip.png";
						} else if (
							item.authorLevel === "2" &&
							item.dataType === 1
						) {
							item.authorVipIcon =
								"https://pages.c-ctrip.com/hotels/wechat/market/smz/aggregate/blue_vip.png";
						}
						const titleArr = [];
						if (item.checkInDate)
							titleArr.push(`${item.checkInDate}入住`);
						if (item.createDate)
							titleArr.push(`${item.createDate}发表`);
						if (item.roomName) titleArr.push(item.roomName);
						item.mediaTitle = titleArr.join(" | ");

						if (item.authorTypeName === "点评新星") {
							item.authorTypeClass = "user-tag-blue";
						} else if (item.authorTypeName === "点评专家") {
							item.authorTypeClass = "user-tag-red";
						} else {
							item.authorTypeClass = "user-tag-orange";
						}

						if (item.avatarUrl) {
							const cropUrl = util.convertCrop(item.avatarUrl, 'C', 75, 75, 0, 70);
							// 若已切图，替换品质，否则使用切图
							if (cropUrl === item.avatarUrl) {
								item.avatarUrl = item.avatarUrl.replace(
									"_C_180_180",
									"_C_75_75"
								);
								item.avatarUrl = item.avatarUrl.replace(
									"_Q90",
									"_Q70"
								);
							} else {
								item.avatUrl = cropUrl;
							}
						}

						if (item.pictureUrl) {
							const cropPicUrl = util.convertCrop(item.pictureUrl, 'R', 320, 10000, 0, 70, 'source/tripcommunity');
							if (cropPicUrl === item.pictureUrl) {
								item.pictureUrl = item.pictureUrl.replace(
									"_R_640_10000",
									"_R_320_10000"
								);
								item.pictureUrl = item.pictureUrl.replace(
									"_Q90",
									"_Q70"
								);
							} else {
								item.pictureUrl = cropPicUrl;
							}
						}

						if (leftHeight <= rightHeight) {
							leftList.push(item);
							leftHeight =
								leftHeight +
								self.getWaterFallPicHeight(item.picHeight);
							waterfallLeftHeight = leftHeight;
						} else {
							rightList.push(item);
							rightHeight =
								rightHeight +
								self.getWaterFallPicHeight(item.picHeight);
							waterfallRightHeight = rightHeight;
						}
					});
			}

			self.setData(
				{
					waterfallLeftList: leftList,
					waterfallRightList: rightList,
					waterfallLeftHeight,
					waterfallRightHeight
				}
			);
		},

		// 换算图片尺寸
		processImageSize(baseWidth, width, height) {
			if (!width || width == "0") {
				width = baseWidth;
			}
			if (!height || height == "0") {
				height = baseWidth;
			}
			let picHeight = (baseWidth / width) * height;
			picHeight = parseInt(picHeight || 0);
			let picWidth = baseWidth;
			if (picHeight < baseWidth) {
				picHeight = baseWidth;
			}
			if (picHeight > parseInt((baseWidth * 4) / 3)) {
				picHeight = parseInt((baseWidth * 4) / 3);
			}
			return [picWidth, picHeight];
		},

		// 瀑布流图片高度
		getWaterFallPicHeight: function (picHeight) {
			return picHeight + 56 + 38 + 38 + 52; // 估算 加上的为底部信息的高度
		},
		getListMore: function () {
			let loadingState = this.data.loadingState;
			if (loadingState == 0) {
				this.setData({
					loadingState: 1,
				});
				this.getWaterList();
			}
		},
		// 错误重试
		refreshList: function () {
			this.setData({
				loadingState: 1,
			});
			this.getWaterList();
		},
		// 数据复位
		initRelevantData: function () {
      let self = this;
      pageIndex = 1;
      this.setData({
        waterfallLeftList: [],
        waterfallRightList: [],
        waterfallLeftHeight: 0,
        waterfallRightHeight: 0
      }, () => {
        self.getWaterList();
      })
		},
		getExploreStoreData: function () {
			const { hotelId } = this.data;
			Api.groupArticleInfoListGet({
				hotelId,
				pageIndex,
				pageSize: perPageCount,
				commentCount: this.data.exploreCommentCount,
			})
				.then((res) => {
					const {
						commentCount,
						hasMoreData,
						groupArticleInfoList,
						ResponseStatus,
					} = res;
					if (
						(!groupArticleInfoList ||
							!groupArticleInfoList.length ||
							ResponseStatus?.Ack !== "Success") &&
						this.data.firstLoadExploreStore
					) {
						this.setData({
							firstLoadExploreStore: false,
						});
						// 如果达人探店无数据，取目的地信息流
						this.initRelevantData();
						return;
					}
					this.setData({
						loadingState: hasMoreData ? 0 : 2,
						firstLoadExploreStore: false,
					});
					currentWaterfallList = groupArticleInfoList;
					pageIndex++;

					this.setData({
						exploreCommentCount: commentCount,
					});
					this.getWaterFallList(2);
				})
				.catch((err) => {
					this.setData(
						{
							loadingState: 3,
							firstLoadExploreStore: false,
						},
						() => {
							// this.initRelevantData();
						}
					);
				});
		},
		// ubt
		logWithUbtTrace: function (ubtKey, data) {
			if (!ubtKey) return;
			let log = cwx.sendUbtByPage.ubtTrace || this.ubtTrace;
			log(ubtKey, data);
		},
		handleClickExplore(e) {
			this.triggerEvent(
				"onClickExplore",
				e.currentTarget.dataset.itemdata
			);
		},
		noImageTrace(e) {
			let errMsg = e?.detail?.errMsg || '';
            this.triggerEvent('noImageTrace', { errMsg, type: '信息流' });
		}
	},
});
