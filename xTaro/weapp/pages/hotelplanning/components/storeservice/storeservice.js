import { cwx, CPage, _ } from "../../../../cwx/cwx.js";
import trace from "../../common/trace/smztrace";
import DateUtil from "../../common/utils/date.js";
import Api from "../../common/apis/restapi";
import C from "../../common/Const.js";

const targetTypeAttrs = {
	H5: 1,
	Page: 2,
	miniProgram: 3,
};

const jumpTypeAttrs = {
	Navigator: 1,
	Redirect: 2,
};

Component({
	properties: {
		functionList: {
			type: Array,
			value: [],
		},
		hotelId: {
			type: String,
			value: "",
		},
		sourceFrom: {
			type: String,
			value: "",
		},
		allianceid: {
			type: String,
			value: "",
		},
		sid: {
			type: String,
			value: "",
		},
		codeID: {
			type: String,
			value: "",
		},
		cityId: {
			type: String,
			value: "",
		},
		lat: {
			type: String,
			value: "",
		},
		lng: {
			type: String,
			value: "",
		},
		communityQRCode: {
			type: Object,
			value: false,
		},
		// 物料uuid 用于跳转wifi连接页时携带，埋点记录wifi和物料匹配关系
		materialKey: {
			type: String,
			value: ""
		},
		// 订房码
    	isOrderCode: {
            type: Boolean,
			value: false,
        },
        pageId: {
            type: Boolean,
			value: "",
        },
		scene: {
			type: String,
			value: "",
		},
		wifiPageUrl: {
			type: String,
			value: "",
		},
		telephone: {
			type: String,
			value: "",
		},
        isSendMessageInWifiPage:{
            type: Boolean,
			value: false
        },
	},
	data: {
		// 固定展示的五个店内服务
		serviceGroup: [],
		highlightService: {},
		swiperPoint: 0, // 滑动服务在第xx页
		percent: 0, // 滚动条宽度
		left: 0, // 滚动点距离左边的距离
	},
	lifetimes: {
		ready: function () {
			cwx.mkt.getUnion((data) => {
				this.allianceid = (data && data.allianceid) || "";
				this.sid = (data && data.sid) || "";
			});
			const { functionList, hotelId, sourceFrom, isOrderCode } = this.data;
            const swiperItemNum = isOrderCode ? 10 : 5
			let serviceGroup = [],
				highlightService = {},
				swiperList = [];
			functionList.map((item) => {
                const labelList = item.label.split(",")
                if(labelList.length > 1){
                    item.labelList = labelList
                }
				if (item.id === "15" || item.id === "23") {
					if (item.id === "23" && item.moduleSwitch) {
						let self = this;
						Api.hotelMiniProgramUrlGet({
							requestHead: {
								mktOpenId: cwx.cwx_mkt.openid,
								clientId: cwx.clientID,
							},
							masterHotelId: this.data.hotelId,
						}).then((res) => {
							if (res) {
								const {
									supportJump,
									miniProgramAppId,
									miniProgramUrl,
								} = res || {};
								if (supportJump) {
									item.targetType = 3;
									item.miniProgram = {
										appId: miniProgramAppId,
										path: miniProgramUrl,
										key: "199247",
									};
									swiperList.push(item);
									const matrixFunc = self.listToMatrix(
										swiperList,
										swiperItemNum
									);
									self.setData({
										matrixFunc,
										percent: 100 / matrixFunc.length,
									});
								}
							}
						});
					}
				} else {
					if (item.moduleSwitch && item.open && item.id !== "24" && item.icon || (item.moduleSwitch && item.id === "6" && !item.open)) {
                        swiperList.push(item);
					} 
				}
			});
			let matrixFunc = this.listToMatrix(swiperList, swiperItemNum);
			for (let i = 0; i < functionList.length; i++) {
				switch (functionList[i].id) {
					case "6":
					case "3":
					case "11":
					case "13":
					case "16":
						serviceGroup.push(functionList[i]);
						break;
					case "15":
						highlightService = functionList[i];
						break;
					default:
						break;
				}
			}
			this.setData({
				serviceGroup,
				highlightService,
				matrixFunc,
				percent: 100 / matrixFunc.length,
			});
			const functionName = matrixFunc.length
				? matrixFunc[0].map((func) => {
						return func.name;
				  })
				: [];
			this.logSwiper(hotelId, sourceFrom, functionName);
		},
	},
	methods: {
        noCatch: function(){
            // 防止误进photolist
        },
		jump: async function (e) {
			const self = this;
			const dataset = e?.currentTarget?.dataset || {};
			let index = this.data.swiperPoint * 5 + dataset.index + 1;
			this.logFunc(
				dataset.id,
				this.data.hotelId,
				this.data.sourceFrom,
				index,
				dataset.name
			);
			let func = self.data.functionList && self.data.functionList.find((f) => f.id === dataset.id) || {};

			if (func.id === "22") {
				this.goEatPlay(e);
				return;
			}
			if (func.id === "25") {
				this.logWithUbtTrace("203087", {
					page: this.data.pageId,
				});
				cwx.navigateTo({
					url: `/pages/hotelplanning/guestservice/index?hotelId=${
						this.data.hotelId
					}`,
				});
				return;
			}
			if (func.id !== "23" && !func.moduleSwitch) {
				cwx.showToast({
					title: "服务升级中，功能暂不可用",
					icon: "none",
					duration: 2000,
				});
				return;
			}
			if (func.id !== "23" && func.id !== "6" && !func.open) {
				cwx.showToast({
					title: "暂未开通此功能，请联系酒店开通",
					icon: "none",
					duration: 2000,
				});
				return;
			}

			if (
				dataset.id === "11" ||
				dataset.id === "12" ||
				dataset.id === "29" ||
				dataset.id === "30"
			) {
				//如果是白名单酒店
				if (this.data.communityQRCode?.qrCodeType === 1) {
					const eventDetail = {
						modalName: C.FRONT_DESK,
					}
					this.triggerEvent("openCModal", eventDetail);
				} else {
					this.showHotelTelModal();
				}
				return;
			}
			if (dataset.id === "15") {
				this.goHotelDetail();
				return;
			}
			if (dataset.id === "6") {
				if (this.data.sourceFrom === "wifi-connect") {
					this.triggerEvent("showWifiList", {});
					return
				}
				//没有维护wifi
				if ( func.open === false ) {
					const eventDetail = {
						modalName: C.ZERO_WIFI,
					}
					this.triggerEvent("openCModal", eventDetail);
					return;
				}
				const { hotelId, codeID, allianceid, sid, sourceFrom, materialKey, wifiPageUrl, scene, pageId, isSendMessageInWifiPage } = this.data;
				const wifiListPageUrl = `pages/hotelplanning/market/wifi/index?hotelId=${hotelId}&codeID=${codeID}&aid=${allianceid}&sid=${sid}&sourceFrom=${sourceFrom}&materialKey=${materialKey}&isSendMessageInWifiPage=${isSendMessageInWifiPage}&isFromNewLanding=1`;
                const landingPageUrl = `/${wifiListPageUrl}&wifiPageUrl=${encodeURIComponent("/" + wifiPageUrl)}`
				// 平台企微二维码流程
				if (!this.data.isOrderCode) {
					const res = await Api.getGroupEntryQrCode({
						scene,
						masterHotelId: hotelId,
						unionId: cwx.cwx_mkt.unionid,
						wifiPageUrl,
						wifiListPageUrl
					});
					if (res && res.groupEntryActiveQrCode) {
						const { groupEntryActiveQrCode : qrCodeUrl, title : popupTitle = "", subTitle : popupShortTitle = "", abTestResult = "" } = res;
						this.logWithUbtTrace("210385", {
							pageId,
							window_type: 2,
							masterhotelid: hotelId,
						});
						const eventDetail = {
							modalName: C.GROUP_QR,
							qrCodeUrl,
							popupTitle,
							popupShortTitle,
							qrCodeType: 2,
                            isNewABTest: abTestResult === "230822_HTL_qjqw2"
						}
						this.triggerEvent("openCModal", eventDetail);
						return
					}
				}

				cwx.navigateTo({
					url: landingPageUrl
				});
				return
			}

            if(dataset.id === "36"){
                const { pageId, hotelId } = this.data
                this.logWithUbtTrace("249572",{
                    page: pageId,
                    masterhotelid: hotelId
                })
                cwx.navigateTo({
					url: `/pages/hotelplanning/feedback/index?hotelId=${hotelId}`,
				});
                return;
            }

            if(dataset.id === "37"){
                const { hotelId, wifiPageUrl } = this.data
                cwx.navigateTo({
					url: `/pages/hotelplanning/activitysquare/index?hotelId=${hotelId}&wifiPageUrl=${encodeURIComponent("/" + wifiPageUrl)}`,
				});
                return;
            }
			const { jumpType, targetType, h5, page, miniProgram, id } = func;

			const action =
				jumpType === jumpTypeAttrs.Navigator
					? "navigateTo"
					: "redirectTo";

			checkJumpType();

			function checkJumpType() {
				if (targetType === targetTypeAttrs.Page) {
					self.doJump(action, page?.url);
					return;
				}

				if (targetType === targetTypeAttrs.H5) {
					self.doJump(
						action,
						`/pages/hotel/components/webview/webview?data=${JSON.stringify(
							{
								needLogin: h5?.needLogin,
								url: encodeURIComponent(h5?.url),
							}
						)}`
					);
					return;
				}

				if (targetType === targetTypeAttrs.miniProgram) {
					const { appId, path, key } = miniProgram;
					cwx.navigateToMiniProgram({
						appId,
						path,
						envVersion: "trial",
						success: () => {
							self.logWithUbtTrace(key, {
								masterhotelid: self.data.hotelId,
								jump_content: "1",
								click_type: "T",
							});
						},
						fail: (err) => {
							self.logWithUbtTrace(key, {
								masterhotelid: self.data.hotelId,
								jump_content: "1",
								click_type: "F",
							});
						},
					});
					return;
				}
			}
		},

		doJump: function (action, url) {
			try {
				cwx[action]({
					url,
					complete: () => {},
				});
			} catch (e) {
				// do nothing
			}
		},

		showHotelTelModal() {
			const { telephone } = this.data;
			if (telephone) {
				cwx.makePhoneCall({
					phoneNumber: telephone,
				});
			} else {
				cwx.showToast({
					title: "电话补录中",
					icon: "none",
					duration: 2000,
				});
			}
		},

		goHotelDetail() {
			const sid = this.data.sid ? this.data.sid.toString() : "";
			const aid = this.data.allianceid
				? this.data.allianceid.toString()
				: "";
			cwx.navigateTo({
				url: `/pages/hotel/detail/index?id=${
					this.data.hotelId
				}&inday=${DateUtil.tomorrow()}&outday=${DateUtil.aftertomorrow()}&allianceid=${aid}&sid=${sid}`,
			});
		},

		showWifiList() {},

		noop() {},

		// 将一维数组转换成每组jLength长度的二位数组
		listToMatrix(list, jLength) {
			var matrix = [],
				i,
				k;
			for (i = 0, k = -1; i < list.length; i++) {
				if (i % jLength === 0) {
					k++;
					matrix[k] = [];
				}
                if(list[i].label&& list[i].label.length){
                    if(list[i].label.length === 2){
                        list[i].labelClass="two-label"
                    }else if(list[i].label.length === 3){
                        list[i].labelClass="three-label"
                    }else {
                        list[i].labelClass="four-label"
                    }
                }
				matrix[k].push(list[i]);
			}
			return matrix;
		},


		swiperAnimationFinishNew: function (e) {
			if (e && e.detail) {
				const current = e.detail.current;
				const { percent, matrixFunc, hotelId, sourceFrom } = this.data;
				const left = current * percent;
				this.setData({
					swiperPoint: current,
					left,
				});
                const functionName = matrixFunc[current].map(
					(func) => {
						return func.name;
					}
				);
				this.logSwiper(hotelId, sourceFrom, functionName);
			}
		},

		goEatPlay(e) {
			const { page = {} } = e?.currentTarget?.dataset || {};
			const { url = ''} = page || {};
			cwx.navigateTo({
				url
			});
		},

		logWithUbtTrace: function (ubtKey, data) {
			try {
				if (!ubtKey) return;
				let log = cwx.sendUbtByPage.ubtTrace || this.ubtTrace;
				log(ubtKey, data);
			} catch (e) {
				console.log(ubtKey, e)
			}
		},

		logFunc(funcId, hotelId, sourceFrom, index, functionName) {
			if (!funcId) {
				return;
			}
			if (sourceFrom === "dmhy-landing") {
				this.logWithUbtTrace("108916", {
					masterhotelid: hotelId,
					functionid: funcId,
					source: sourceFrom,
				});
			} else {
				this.logWithUbtTrace("187926", {
					functionid: funcId,
					masterhotelid: hotelId,
					source: sourceFrom,
					rank: index,
					functionname: functionName,
					aid: this.allianceid,
					sid: this.sid,
				});
			}
		},
		logSwiper(hotelId, sourceFrom, functionName) {
			this.logWithUbtTrace("208464", {
				masterhotelid: hotelId,
				functionname: functionName,
				source: sourceFrom,
				aid: this.allianceid,
				sid: this.sid,
			});
		},
	},
});
