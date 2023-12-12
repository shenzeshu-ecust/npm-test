import { cwx } from "../../../cwx/cwx.js";
import HPage from "../common/hpage/hpage.js";
import hPromise from "../common/hpage/hpromise";
import storage from "../common/utils/storage";
import cinvoiceTrace from "../common/trace/cinvoicetrace";
import commonrest from "../common/commonrest";

const cinvorest = require("../cinvoice/cinvoicetitlerest.js");

const INVOICE_LIST = "INVOICE_LIST";
const INVOICE_HISTORY = "INVOICE_HISTORY";
const invoiceTypeNames = {
	0: "INVOICE_LIST_PERSONAL",
	1: "INVOICE_LIST_BUSINESS",
};

const MAX_LIST_LENGTH = 10;

const companyTab = {
	text: "企业",
	type: "1",
	historyKey: invoiceTypeNames[1],
	keyName: "qy",
};
const personalTab = {
	text: "个人/其他",
	type: "0",
	historyKey: invoiceTypeNames[0],
	keyName: "other",
};
const marginInfo = {
	marginLong: 68,
	marginShort: 192,
	marginPerson: 382,
};

HPage({
	pageId: "10650005463",
	checkPerformance: true,// 白屏标志位
	pageStatus: {
		fakePromotionId: "",
	},
	data: {
		navigationBar: {
			title: "",
			back: false,
			color: "#fff",
			background: "",
		},
		isIPhoneXModel: false,
		unavailableTitles: [],
		invoiveCode: "",
		hotelId: "",
		sellerName: "",
		channelCode: "",
		placeholderText: [
			{
				title: "必填，请填写个人姓名",
				tele: "选填，请填写手机号接收发票信息",
				email: "选填，请填写邮箱接收电子发票",
				roomNo: "选填，如需预约取票请填写房间号"
			},
			{
				title: "必填，请填写企业名称",
				taxPayNum: "必填，请填写纳税人识别号",
				addr: "选填，请填写企业地址",
				phone: "选填，请填写企业电话",
				bank: "选填，请填写企业开户行",
				bankAccount: "选填，请填写企业开户行账号",
				tele: "选填，请填写手机号接收发票信息",
				email: "选填，请填写邮箱接收电子发票",
				roomNo: "选填，如需预约取票请填写房间号"
			},
		],
		tabs: [companyTab, personalTab],
		currentTab: companyTab, // 默认选中的tab对象
		defaultTitle: {}, // 默认情况下的发票信息
		CompanyTitle: {}, // 展示在首页的企业发票信息
		govTitle: {}, // 展示首页的政府发票信息
		personTitle: {}, // 展示首页的个人发票信息
		personalPhone: "",
		personalEmail: "",
		personalRoomNo: "",
		isShowMore: false, // 折叠信息
		searchResult: "", // 抬头搜索结果回填文案
		searchTitleList: [], // 搜索抬头列表
		historyTitleList: {}, // 历史抬头列表
		isShowSearchList: false, // 是否展示联想抬头列表
		visible: false, // 展示订单成功页
		clearIcon: {}, // 清除按钮list
		errorInfo: {}, // error信息提示
		footMargin: marginInfo.marginShort, // slogan margin top
		focus: {
			invoiceTitle: false,
			taxPayNumber: false,
			address: false,
			phone: false,
			bank: false,
			bankAccount: false,
			personalPhone: false,
			personalEmail: false,
			roomNo: false
		},
		successInfo: {},
		canShowPromotion: true, // 是否展示发券模块
		unionVip: {
			yoyocardBg:
				"https://pages.c-ctrip.com/hotels/wechat/market/smz/aggregate/yoyocard_HTLold.png",
			isHTLNewUser: false,
			hasNextTrip: false,
			yoyoRights: [],
			communityQrCodeUrl: '',
			telephone: ''
		},
		invoiceAlert: false,
        isShowWxTitle: true
	},
	onLoad: function (options) {
		this.data.invoiveCode = options.code || "";
		this.data.hotelId = options.hotelid || "";
		this.data.sellerName = options.hotel || "";
		this.data.channelCode = options.channelCode || "";

		this.setData({
			historyTitleList: storage.getStorage(INVOICE_LIST) || {},
		});

		const historyInvoice = storage.getStorage(INVOICE_HISTORY);
		if (historyInvoice) {
			this.handleChangeTag(historyInvoice.type);
			this.handleSetdefaultTitle(historyInvoice);
		}

		cinvoiceTrace.cinvoiceLoad(this, {
			hotelId: this.data.hotelId,
		});
		this.checkUniversalSwitches();
		this.getUnionEntity();
	},

    onShow() {
        cwx.Observer.addObserverForKeyOnly('privacy_authorize',this.handleAuthorize)
    },

    handleAuthorize(e) {
        this.setData({
            isShowWxTitle: e?.agree || false
        })
    },
	getUnionEntity: function () {
		cinvorest.getUnionVipEntity(this.data.hotelId).then((res) => {
			if (res) {
				this.setData({
					unionVip: {
						yoyocardBg: res.isHTLNewUser
							? "https://pages.c-ctrip.com/hotels/wechat/market/smz/aggregate/yoyocard_HTLnew.png"
							: "https://pages.c-ctrip.com/hotels/wechat/market/smz/aggregate/yoyocard_HTLold.png",
						isHTLNewUser: res.isHTLNewUser,
						hasNextTrip: res.showNextTrip,
						yoyoRights: res.yoyoRights,
						communityQrCodeUrl: res.communityQrCodeUrl || "",
						telephone: res.telephone || ""
					},
				});
			}
		});
	},

	checkUniversalSwitches: function () {
		const key = [
			"smz_fake_hotel_promtionid",
			"smz_cinvoice_hide_promotion",
			"cinvoice_room_no"
		];
		commonrest.getWechatSoaSwitch(
			key,
			(data) => {
				if (data) {
					const switches = data.result;
					this.pageStatus.fakePromotionId =
						~~switches["smz_fake_hotel_promtionid"] || "-1";
					this.setData({
						canShowPromotion:
							switches["smz_cinvoice_hide_promotion"] != "1",
						roomNoSwitch: switches["cinvoice_room_no"] === "1"
					});
				}
			},
			"json"
		);
	},

	// 切换tab
	handleChangeTag: function (e) {
		const self = this;
		let id = e.currentTarget ? e.currentTarget.dataset.id : e;
		if (id == self.data.currentTab.type) {
			return;
		}
		// 数据缓存
		switch (self.data.currentTab.type) {
			case "0":
				self.data.personTitle = self.data.defaultTitle;
				break;
			case "1":
				self.data.CompanyTitle = self.data.defaultTitle;
				break;
			default:
				break;
		}
		switch (id) {
			case "0":
				self.data.currentTab = personalTab;
				self.data.defaultTitle = self.data.personTitle;
				break;
			case "1":
				self.data.currentTab = companyTab;
				self.data.defaultTitle = self.data.CompanyTitle;
				break;
			default:
				self.data.currentTab = companyTab;
				break;
		}
		let footMargin = marginInfo.marginShort;
		if (id == 0) {
			footMargin = marginInfo.marginPerson;
		} else if (self.data.isShowMore) {
			footMargin = marginInfo.marginLong;
		}
		this.setData({
			currentTab: self.data.currentTab,
			defaultTitle: self.data.defaultTitle,
			isShowSearchList: false,
			errorInfo: {},
			clearIcon: {},
			footMargin: footMargin,
		});
	},
	// 展示更多input
	handleShowMore: function () {
		const isShowMore = !this.data.isShowMore;
		let footMargin = marginInfo.marginShort;
		if (isShowMore) {
			footMargin = marginInfo.marginLong;
		}
		this.setData({
			isShowMore: isShowMore,
			footMargin: footMargin,
		});
	},
	handleCloseSearchList: function (e) {
		// 点击抬头 需出历史 list
		if (e.target.dataset.name == "invoiceTitle") {
			return;
		}

		// 删除历史信息 不关闭
		if (e.target.dataset.name == "delete") {
			return;
		}
		this.setData({
			isShowSearchList: false,
		});
	},
	// 获取微信抬头
	getWxTitle: function () {
		let self = this;
		wx.chooseInvoiceTitle({
			success(res) {
				const defaultTitle = {
					invoiceTitle: res.title,
					taxPayNumber: res.taxNumber,
					address: res.companyAddress,
					phone: res.telephone,
					bank: res.bankName,
					bankAccount: res.bankAccount,
				};
				self.setData({
					defaultTitle: defaultTitle,
				});
				self.handleChangeTag(!res.type);
			},
		});
	},

	// 记录抬头信息变化状态
	handleTextChange: function (e) {
		const self = this;
		let value = e.detail.value.trim();
		const titleType =
			(this.data.currentTab && this.data.currentTab.text) || "企业";
		let searchHandler;
		let searchTitleList = [];
		let searchResult = "";
		this.HandleInputInfo(e);
		if (titleType == "个人/其他") {
			return;
		}

		if (value && value.length >= 2) {
			wx.request({
				url: "https://proxy.yipiaoyun.com/kaipiao-app/title/search",
				data: {
					// 参数为json格式数据
					keyword: value,
				},
				method: "POST",
				header: {
					// 设置参数内容类型为json
					"content-type": "application/json",
				},
				success: function (res) {
					let searchList = (res && res.data && res.data.entry) || [];

					if (searchList.length > 0) {
						searchResult = value;
						for (let i = 0; i < searchList.length && i < 10; i++) {
							searchList[i].type = titleType;
							searchList[i].parts = self.gethighlightPart(
								value,
								searchList[i].buyerTitle
							);
							searchTitleList.push(searchList[i]);
						}
						self.setData({
							isShowSearchList: true,
						});
					} else {
						self.setData({
							isShowSearchList: false,
						});
					}
					self.setData({
						searchResult: searchResult,
						searchTitleList: searchTitleList,
					});
				},
				error: function (err) {
					console.error(err);
				},
			});
		} else {
			searchHandler = setTimeout(() => {
				self.setData({
					searchResult: searchResult,
					searchTitleList: searchTitleList,
					isShowSearchList: false,
				});
			}, 2000);
		}
	},
	// 记录input变化状态
	HandleInputInfo: function (e) {
		let name = "";
		if (
			e.currentTarget.dataset.type &&
			e.currentTarget.dataset.type == "special"
		) {
			name = e.currentTarget.dataset.name;
		} else {
			name = "defaultTitle." + e.currentTarget.dataset.name;
		}
		let value = e.detail.value.trim();
		this.setData({
			[name]: value,
		});

		let iconInfo = "clearIcon." + e.currentTarget.dataset.name;
		if (value) {
			this.setData({
				[iconInfo]: true,
			});
		}
	},

	// 清除文本
	clearText: function (e) {
		let name = "";
		if (
			e.currentTarget.dataset.type &&
			e.currentTarget.dataset.type === "special"
		) {
			name = e.currentTarget.dataset.name;
		} else {
			name = "defaultTitle." + e.currentTarget.dataset.name;
		}
		let clearIcon = "clearIcon." + e.currentTarget.dataset.name;
		const isShowSearchList =
			e.currentTarget.dataset.name === "invoiceTitle";
		this.setData({
			isShowSearchList: isShowSearchList,
			[name]: "",
			[clearIcon]: false,
			focus: this.handleFocus(e.currentTarget.dataset.name),
		});
	},
	// 焦点记录
	handleFocus: function (name) {
		const focus = this.data.focus;
		Object.keys(focus).forEach((key) => {
			if (key === name) {
				focus[key] = true;
			} else {
				focus[key] = false;
			}
		});
		return focus;
	},
	// input点击（优先于focus）,清除错误提示,出全删按钮
	handleinputFocus: function (e) {
		const self = this;
		const name = e.currentTarget.dataset.name;
		let iconInfo = "clearIcon." + name;
		let value = e.detail.value;
		this.setData({
			clearIcon: {},
			errorInfo: {},
			focus: this.handleFocus(name),
		});
		if (value) {
			self.setData({
				[iconInfo]: true,
			});
		}

		if (
			this.data.historyTitleList[this.data.currentTab.historyKey] &&
			name === "invoiceTitle" &&
			this.data.defaultTitle?.invoiceTitle?.length === 0
		) {
			// 出历史记录
			self.setData({
				isShowSearchList: true,
			});
		}
	},
	//  记录失去焦点
	handleinputBlur: function (e) {
		const name = e.currentTarget.dataset.name;
		const focus = this.data.focus;
		focus[name] = false;
		this.setData({
			focus: focus,
		});
	},
	// 联想高亮
	gethighlightPart: function (kw, name) {
		let parts = [];
		let keyword = kw || "";
		if (name) {
			let re = new RegExp(this.escapeRegExp(keyword), "g");
			let separator = "|~|";
			let processStr = name.replace(re, separator + keyword + separator);
			let pArr = processStr.split(separator) || [];
			pArr.forEach(function (item) {
				item && parts.push(item);
			});
		}
		return parts;
	},
	escapeRegExp: function (str) {
		return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	},
	// 联想信息回填
	handleChangeTitle: function (e) {
		const index = e.currentTarget.dataset.index;
		let targetList = [];
		if (e.currentTarget.dataset.type === "history") {
			targetList =
				this.data.historyTitleList[this.data.currentTab.historyKey];
		} else {
			targetList = this.data.searchTitleList;
		}
		this.handleSetdefaultTitle(targetList[index] || {});
	},
	handleSetdefaultTitle: function (invoice = {}) {
		const defaultTitle = {};
		defaultTitle.invoiceTitle = invoice.buyerTitle;
		defaultTitle.taxPayNumber = invoice.taxNo;
		defaultTitle.address = invoice.buyAddress;
		defaultTitle.phone = invoice.buyPhone;
		defaultTitle.bank = invoice.bankName;
		defaultTitle.bankAccount = invoice.bankNo;
		this.setData({
			defaultTitle: defaultTitle,
			isShowSearchList: false,
			personalPhone: invoice.personalPhone || "",
			personalEmail: invoice.email || "",
			clearIcon: {},
		});
	},
	// 信息校验+提交
	handleOnSubmit: function (e) {
		this.recordSubmit();
		const self = this;
		let errorInfo = {};
		let key = "";
		if (!self.data.defaultTitle.invoiceTitle) {
			errorInfo.errorinvoTitle = true;
			if (!key) {
				key = "invoiceTitle";
			}
		}
		if (
			!self.data.defaultTitle.taxPayNumber &&
			self.data.currentTab.type == "1"
		) {
			errorInfo.errortaxNum = true;
			if (!key) {
				key = "taxPayNumber";
			}
		}

		// if(!self.data.personalPhone){
		//     errorInfo.errorphone = true;
		//     errorInfo.errorRightPhone = false;
		//     if (!key) {
		//         key = 'personalPhone';
		//     }
		// }else if(!/^1\d{10}$/.test(self.data.personalPhone)){
		//     errorInfo.errorphone = false;
		//     errorInfo.errorRightPhone = true;
		//     if (!key) {
		//         key = 'personalPhone';
		//     }
		// }

		if (self.data.personalPhone && self.data.personalPhone != "") {
			const PhoneReg = /^1\d{10}$/;
			const result = PhoneReg.test(self.data.personalPhone);
			if (!result) {
				errorInfo.errorRightPhone = true;
				if (!key) {
					key = "personalPhone";
				}
			}
		}

		if (self.data.personalEmail && self.data.personalEmail != "") {
			const emailReg = /^\w+([-.]\w+)*\@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
			const result = emailReg.test(self.data.personalEmail);
			if (!result) {
				errorInfo.errorRightEmail = true;
				if (!key) {
					key = "personalEmail";
				}
			}
		}
		if (Object.keys(errorInfo).length) {
			this.setData({
				errorInfo: errorInfo,
				isShowSearchList: false,
			});
			const query = wx.createSelectorQuery();
			query.select(`#${key}`).boundingClientRect();
			query.selectViewport().scrollOffset();
			let topVal = 0;
			query.exec(function (res) {
				topVal = res && res[0] && res[0].top; // #the-id节点的上边界坐标
				// 显示区域的竖直滚动位置res[1].scrollTop;
				wx.pageScrollTo({
					scrollTop: topVal,
					duration: 300,
				});
			});
			return;
		}

		let requestData = {
			invoiceCode: self.data.invoiveCode,
			hotelId: self.data.hotelId,
			sellerName: self.data.sellerName,
			invoiceTitleType: self.data.currentTab.type,
			invoiceTitle: self.data.defaultTitle.invoiceTitle,
			taxPayNumber: self.data.defaultTitle.taxPayNumber,
			bank: self.data.defaultTitle.bank,
			bankAccount: self.data.defaultTitle.bankAccount,
			address: self.data.defaultTitle.address,
			phone: self.data.defaultTitle.phone,
			roomNo: self.data.personalRoomNo,
			email: self.data.personalEmail,
			phoneNumber: self.data.personalPhone,
			channelCode: self.data.channelCode,
		};

		new hPromise((resolve, reject) => {
			cinvorest.onSubmit(requestData, resolve, reject);
		})
			.then((res) => {
				if (res.resultCode === 200) {
					self.setData({
						visible: true,
						successInfo: {
							invoiceTitle:
								self.data.defaultTitle.invoiceTitle || "",
							phoneNumber: self.maskCode(
								"phone",
								self.data.personalPhone || ""
							),
							taxPayNumber:
								self.data.defaultTitle.taxPayNumber || "",
							email: self.maskCode(
								"email",
								self.data.personalEmail || ""
							),
						},
					});
					cinvoiceTrace.yoyoCardShow(this, {
						isYoyoCardShow: "T",
						discountType: this.data.unionVip.isHTLNewUser ? 1 : 2,
					});
					if (self.data.unionVip.communityQrCodeUrl) {
						cinvoiceTrace.wechatReserveShow(this, {
							page: self.pageId,
							window_type: 1,
							masterhotelid: self.data.hotelId
						})
					}
					self.storeHistory(requestData);
				} else {
					cwx.showToast({
						title: "开票失败,请重试！",
						duration: 2000,
						icon: "none",
					});
				}
			})
			.catch((err) => {
				console.error("error");
			});
	},
	// 加掩码
	maskCode: function (style, str) {
		if (!str) {
			return "";
		}
		if (style == "phone") {
			let fromLen = 3;
			let endLen = 4;
			let len = str.length - fromLen - endLen;
			let star = "****";
			return (
				str.substring(0, fromLen) +
				star +
				str.substring(str.length - endLen)
			);
		}
		if (style == "email") {
			let emailParts = str.split("@");
			return emailParts[0].substring(0, 1) + "***@" + emailParts[1];
		}
	},
	// 提交埋点
	recordSubmit: function () {
		cinvoiceTrace.cinvoiceSubmit(this, {
			hotelId: this.data.hotelId,
		});
	},
	// 删除缓存记录
	handleDeleteHistory(e) {
		const idx = e.currentTarget.dataset.index;
		const typeName =
			this.data.currentTab.historyKey || "INVOICE_LIST_BUSINESS";
		const listMap = this.data.historyTitleList;
		listMap[typeName].splice(idx, 1);
		this.setData({
			historyTitleList: listMap,
		});
		storage.setStorage(INVOICE_LIST, listMap, 24 * 30);
	},
	// 缓存开票信息
	storeHistory(params) {
		const invoice = {
			buyerTitle: params.invoiceTitle,
			taxNo: params.taxPayNumber,
			buyAddress: params.address,
			buyPhone: params.phone,
			bankName: params.bank,
			bankNo: params.bankAccount,
			email: params.email,
			personalPhone: params.phoneNumber,
			type: params.invoiceTitleType,
		};
		// 保存上次历史
		storage.setStorage(INVOICE_HISTORY, invoice, 24 * 30);
		const typeName =
			invoiceTypeNames[params.invoiceTitleType] ||
			"INVOICE_LIST_BUSINESS";
		const listMap = this.data.historyTitleList;

		// 还没有同类型的
		if (!listMap[typeName]) {
			listMap[typeName] = [invoice];
			storage.setStorage(INVOICE_LIST, listMap, 24 * 30);
			return;
		}

		const targetIndex = listMap[typeName].findIndex((item) => {
			return item.buyerTitle === invoice.buyerTitle;
		});

		// 存在同名发票
		if (targetIndex > -1) {
			listMap[typeName].splice(targetIndex, 1); // 删除原来同名的发票
		}

		// 超出存储限制
		if (listMap[typeName].length >= MAX_LIST_LENGTH) {
			listMap[typeName].pop(); // 去掉最后的
		}

		listMap[typeName].unshift(invoice);
		storage.setStorage(INVOICE_LIST, listMap, 24 * 30);
	},
	// 处理领券结果

	handleClickYoyo: function (e) {
		cinvoiceTrace.yoyoCardClick(this, {
			clickType: 1,
		});
	},

	handleClickYoyoBtns: function (e) {
		const self = this;
		const { functionid } = e.target.dataset;

		cinvoiceTrace.yoyoCardClick(this, {
			clickType: 2,
		});
		cwx.navigateTo({ url: "/pages/hotel/inquire/index" });
	},

	closeDialog: function () {
		this.setData({ invoiceAlert: false });
	},

	clickInvoiceDetail: function () {
		this.setData({ invoiceAlert: true });
	},

	backToHotelSearchPage: function() {
		cwx.navigateBack()
	},

	calltoreserve: function() {
		const { unionVip } = this.data
		cwx.makePhoneCall({
			phoneNumber: unionVip.telephone,
		})
		cinvoiceTrace.reserveClick(this, {
			page: this.pageId,
			click_type: 2,
			masterhotelid: this.data.hotelId
		})
	},

	handleClickQrcode: function() {
		cinvoiceTrace.reserveClick(this, {
			page: this.pageId,
			click_type: 1,
			masterhotelid: this.data.hotelId
		})
	}
});
