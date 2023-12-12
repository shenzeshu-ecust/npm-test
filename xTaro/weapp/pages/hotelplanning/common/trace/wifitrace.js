module.exports = {
	wifiLoad: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("htl_c_wechatapp_wifi_load", {
					masterhotelid: options.hotelId,
					wifilist: options.wifiList,
					source: options.source,
				});
		} catch (e) {
			console.error(e);
		}
	},
	connectWifi: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("htl_wifi_connection_click", {
					masterhotelid: options.hotelId,
					wifiname: options.wifiName,
					wifitype: options.wifitype,
					ispassword: options.isSecure,
					connType: options.connType,
                    type: options.type,
				});
		} catch (e) {
			console.error(e);
		}
	},
	sucConnected: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("htl_wifi_succonnected_click", {
					masterhotelid: options.hotelId,
					wifiname: options.wifiName,
					wifitype: options.wifitype,
					ispassword: options.isSecure,
					material_data: options.materialKey,
					model: options.model,
					brand : options.brand || "",
                    password: options.password || "",
                    type: options.type || "", // 1:用户手动输入密码  2: 附近wifi 3: 附近wifi手动输入密码
				});
		} catch (e) {
			console.error(e);
		}
	},
	failConnected: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("htl_wifi_failure_click", {
					masterhotelid: options.hotelId,
					wifiname: options.wifiName,
					wifitype: options.wifitype,
					ispassword: options.isSecure,
					failurereasons: options.reason,
					model: options.model || "",
					brand : options.brand || "",
					errCode: options.errCode || "",
                    errno: options.errno || "",
                    password: options.password,
                    type: options.type || "",
				});
		} catch (e) {
			console.error(e);
		}
	},
	failConnectedMsg: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace(104534, {
					masterhotelid: options.hotelId,
					wifiname: options.wifiName,
					ispassword: options.isSecure,
					password: options.password,
					signalStrength: options.signalStrength,
					errmsg: options.errmsg,
					errCode: options.errCode,
                    errno: options.errno || "",
					failurereasons: options.reason,
					api: options.api,
					version: options.version || "",
					system: options.system || "",
					model: options.model || "",
					material_data: options.materialKey,
					brand : options.brand || "",
                    type: options.type || "",
				});
		} catch (e) {
			console.error(e);
		}
	},
	failGetWifiList: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace(181904, {
					masterhotelid: options.hotelId,
					errmsg: options.errmsg,
					errCode: options.errCode,
					api: "getWifiList",
                    errno: options.errno,
				});
		} catch (e) {
			console.error(e);
		}
	},
	errorClick: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace(211984, {
					page: options.page,
					button_type: options.button_type,
				});
		} catch (e) {
			console.error(e);
		}
	},
	errorShow: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace(211985, {
					page: options.page,
				});
		} catch (e) {
			console.error(e);
		}
	},
	passwordToastShow: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace(215802, {
					page: options.page,
				});
		} catch (e) {
			console.error(e);
		}
	},
	passwordToastClick: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace(215801, {
					page: options.page,
				});
		} catch (e) {
			console.error(e);
		}
	},
	wifiConnectFailure(page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("217237", {
					page: options.page
				});
		} catch (error) {
			console.error("P0255_SP0001_exposure  ", error);
		}
	},
	wifiChangeClick(page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("217239", {
					page: options.page
				});
		} catch (error) {
			console.error("P0255_SP0001_M0000_ID0002_click  ", error);
		}
	},
	wifiCopyPassword(page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("217238", {
					page: options.page
				});
		} catch (error) {
			console.error("P0255_SP0001_M0000_ID0001_click  ", error);
		}
	},
	androidWifiStrength(page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("219853", {
					page: options.page,
					masterhotelid: options.masterhotelid,
					hotelname: options.hotelname,
					star: options.star,
					wifi_info: options.wifi_info
				});
		} catch (error) {
			console.error("htl_c_applet_mbrwifi_exposure  ", error);
		}
	},
    showNearbyWifiList(page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("241825", {
					page: options.page,
					masterhotelid: options.masterhotelid,
					hotelname: options.hotelname,
					wifilist: options.wifilist,
					key: options.key
				});
		} catch (error) {
			console.error("htl_c_applet_htl_c_applet_mbrwifi_nfind_exposure ", error);
		}
	},
    clickShare(page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("242922", {
                    page: options.page
				});
		} catch (error) {
			console.error("htl_c_applet_mbrwifi_sharewifi_click ", error);
		}
	},
    weakSignalCopyPsw(page, options) {
        try {
			page.ubtTrace &&
				page.ubtTrace("254081", {
                    page: options.page,
                    masterhotelid: options.masterhotelid,
                    wifi_name: options.wifiname,
				});
		} catch (error) {
			console.error("htl_c_applet_mbrwifi_success_copypwd_click ", error);
		}
    }
};
