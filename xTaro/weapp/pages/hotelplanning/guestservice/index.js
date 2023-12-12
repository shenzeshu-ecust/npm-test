import { cwx, CPage, _ } from '../../../cwx/cwx.js';
import commonfunc from '../common/commonfunc';
const util = require('../common/utils/util.js'),
  serviceModel = require('./serviceModel.js');

CPage({
	pageId: "10650070420",
	checkPerformance: true,// 白屏标志位
	data: {
		isIphoneX: util.isIPhoneX(),
		navigationBar: {
			// 自定义导航
			title: "",
			back: false,
			color: "#fff",
			background: "",
			show: true,
		},
		serviceList: [],
		facilityList: [],
		showCustomNav: commonfunc.showCustomNav(),
	},
	pageStatus: {
		servicePhone: "",
	},
	onLoad: function (options) {
		const { hotelId } = options;
        if (hotelId && parseInt(hotelId) !== 0) {
            this.queryServiceList(hotelId);
        }
	},
	queryServiceList(hotelId) {
		const errTip = (title) => {
			cwx.showToast({
				title,
				icon: "none",
				duration: 2000,
			});
		};

		serviceModel.queryService(
			{ hotelId: parseInt(hotelId) },
			(response) => {
				if (response && response.retCode === 0) {
					if (
						response.guestServiceList &&
						response.guestServiceList.length !== 0
					) {
						const serviceList = response.guestServiceList;
						if (serviceList && serviceList.length !== 0) {
							serviceList.map((item) => {
								const detailList = item.guestServiceDetailList;
								if (detailList && detailList.length !== 0) {
									item.leftList = detailList.filter(
										(_item, index) => index % 2 === 0
									);
									item.rightList = detailList.filter(
										(_item, index) => index % 2 !== 0
									);
									return item;
								}
							});
							this.pageStatus.servicePhone =
								response.servicePhone;
							this.setData({ serviceList });
						}
					}
					if (
						response.popularFacilityList &&
						response.popularFacilityList.length !== 0
					) {
						let facilityList = response.popularFacilityList;
						facilityList.map((item) => {
							switch (item.facilityType) {
								case "breakfast":
									item.facilityName = "早餐餐厅";
									item.order = 0;
									break;
								case "gym":
									item.facilityName = "健身房";
									item.order = 1;
									break;
								case "swim_pool":
									item.facilityName = "游泳池";
									item.order = 2;
									break;
							}
						});
						facilityList.sort((x, y) => x.order - y.order);
						this.setData({ facilityList });
					}
				} else {
					setTimeout(() => {
						errTip(response.message);
					}, 1000);
				}
			},
			(err) => {
				setTimeout(() => {
					errTip("服务异常，请稍后重试");
				}, 1000);
			}
		);
	},
	backTo() {
		cwx.navigateBack();
	},
	contactHotel() {
		this.ubtTrace("203088", {
			page: this.pageId,
		});
		if (this.pageStatus.servicePhone) {
			cwx.makePhoneCall({
				phoneNumber: this.pageStatus.servicePhone,
			});
		} else {
			cwx.showToast({
				title: "电话补录中",
				icon: "none",
				duration: 2000,
			});
		}
	},
	onScroll: util.throttle(function (e) {
		const scrollTop = e.detail.scrollTop;
		if (scrollTop > 60) {
			if (!this.data.navigationBar.title) {
				this.setData({
					"navigationBar.title": "客房送物",
					"navigationBar.background": "#fff",
					"navigationBar.color": "#000",
					"navigationBar.back": true,
				});
			}
		}
	}, 300),
	handleScrollToUpper: function (e) {
		this.setData({
			"navigationBar.title": "",
			"navigationBar.background": "",
			"navigationBar.color": "#fff",
			"navigationBar.back": false,
		});
	},
});
