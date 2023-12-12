import Api from "../../common/apis/restapi";
import { cwx, CPage, _ } from "../../../../cwx/cwx.js";
import trace from "../../common/trace/smztrace";
const BaseGeo = require("../../common/geo/basegeo");
const storage = require("../../common/utils/storage.js");

CPage({
	pageId: "10650057994",
	checkPerformance: true,// 白屏标志位
	isPIPGPage: true, // 个保指引页的标记（屏蔽个保授权弹窗）
	data: {
		navigationBar: {
			// 自定义导航
			title: "",
			back: false,
			color: "#fff",
			background: "transparent",
			show: true,
			animated: false,
			leftCls: "white", // 控制返回按钮颜色用
		},
		showBuyBtn: false,
		supplierConfig: {},
	},
	onLoad: function (options = {}) {
		const {
			hotelid,
			devid,
			goodsstock,
			allianceid,
			sid,
			originurl,
			source,
			unionvip, // unionvip 0  1(无酒店id)
            status,
		} = options || {};
		this.hasLoadModuleList = false
		this.hasBindUnionVip = false
        // satus 1:开启 2:关闭(黑名单设备) 
        this.isNotSupport = status === "2"
		this.unionVip = unionvip === "1"
		this.setData({
			hotelId: hotelid,
			devId: devid,
			goodsstock: goodsstock,
			allianceid: allianceid,
			sid: sid,
			originUrl: originurl,
			source: source,
		});
		trace.pageScene(this, {
			page: this.pageId,
			scene_value: cwx.scene,
			source: "charge-landing",
		});
        this.getSupplierConfig();
        if(status === "2") {
            return
        }
		this.isHotelNewCustomer();

		if (unionvip === "1") {
			this.checkVipCard();
		}

		this.getUcode();
	},
	onShow() {
		// 从其它页面返回时，需要再次确认绑定联合会员
		if (!this.hasBindUnionVip && this.hasLoadModuleList && !this.isNotSupport && this.unionVip) {
            this.getVipCard(); //联合会员领卡
		}
	},
	async getSupplierConfig() {
		const option = {
			sourceFrom: this.data.source || "",
		}
		const { appid = '', path = '' } = this.options || {}
		if(appid){
			option.appId = appid,
			option.path = path
		}
		const res = await Api.roomVendingSupplierConfig(option) || {};
		const { loginImg, supplierImg, appId, path: supplierPath, envVersion, querys, btnImg, getVipCard } = res;
		const supplierConfig = {
			loginImg,
			supplierImg,
			appId,
			path: supplierPath,
			envVersion,
			querys,
			devId: this.data.devid,
			btnImg,
		};

		this.setData({
			supplierConfig: supplierConfig,
			isGetVipCard: getVipCard,
		});
        if(this.isNotSupport) {
            this.setData({
                backImg: supplierImg,
                showBuyBtn: true
            })
        }
	},
	async checkVipCard() {
		const hotelId = this.data.hotelId;
		const res = await Api.getSmzModuleListV3({ hotelId: hotelId, source: "vending_machine" }) || {};
		const { unionVip = {} } = res;
		this.hasLoadModuleList = true
		if (unionVip && unionVip.hasBindUnionVip === false) {
			this.getVipCard();
		} else {
			this.hasBindUnionVip = unionVip && unionVip.hasBindUnionVip
		}
	},
	getVipCard() {
		let { hotelId, sid, allianceid } = this.data;
		Api.getVipCard({
            hotelid: hotelId,
            lat: 0,
            lng: 0,
            sid: sid ? sid.toString() : "",
            aid: allianceid ? allianceid.toString() : "",
            sceneId: cwx.scene || 0
        }).then((res) => {
            this.hasBindUnionVip = true
        });
	},
	async isHotelNewCustomer() {
		const res = await Api.getRoomVendingReward({}) || {};
		const { customerType } = res;
		const received = res && res.received == 1 ? true : false; // 是否已领取
		const newCustomer = customerType == 1 ? true : false;
		let backImg = "";
		let showBuyBtn = false;
		if (newCustomer && !received) {
			backImg = this.data.supplierConfig.loginImg;
		} else {
			backImg = this.data.supplierConfig.supplierImg;
			showBuyBtn = true;
		}
		this.setData({
			newCustomer,
			received,
			backImg,
			showBuyBtn,
		});
	},
	async goBuy() {
        const {appid, path, devid} = this.options
        if(this.isNotSupport && appid && path && devid) {
            cwx.cwx_navigateToMiniProgram({
                appId: appid,
                path: `${path}?q=${devid}`,
                complete: (res) => {
                },
                fail: (error) => {
                },
            });
        }
		const data = this.data;
		const supplierConfig = this.data.supplierConfig;
		if (data.retCode === -1 || !data.ucode) {
			await this.getUcode();
		}
		if (data.ucode) {
			try {
				cwx.cwx_navigateToMiniProgram({
					appId: supplierConfig.appId,
					path: `${supplierConfig.path}?code=${data.ucode}&q=${data.devId}`,
					extraData: {},
					envVersion: supplierConfig.envVersion, // 'trial',
					complete: (res) => {
					},
					fail: (error) => {
					},
				});
			} catch {
				cwx.showToast({
					title: "网络不稳定，请稍后再试",
					icon: "none",
					duration: 2000,
				});
			}
		}
	},
	async getUcode() {
		const data = this.data;
		const res =
			(await Api.roomVendingRecord({
				hotelId: data.hotelId,
				devId: data.devId,
				goodsStockStatus: data.goodsstock,
				sourceFrom: data.source,
			})) || {};
		const { retCode, ucode } = res;
		this.setData({
			retCode: retCode,
			ucode: ucode,
		});
	},
	clickCoupon() {
		const data = this.data;
		this.setData({
			showBuyBtn: true,
			backImg: data.supplierConfig.supplierImg,
			received: true,
		});
	}
});
