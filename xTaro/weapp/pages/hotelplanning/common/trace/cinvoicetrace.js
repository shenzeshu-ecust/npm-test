module.exports = {
	cinvoiceLoad: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("htl_invoice_qrcode_basic", {
					masterhotelid: options.hotelId,
					scanchannel: "微信小程序",
				});
		} catch (e) {
			console.error(e);
		}
	},
	cinvoiceSubmit: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("htl_invoice_invoicenow_click", {
					masterhotelid: options.hotelId,
				});
		} catch (e) {
			console.error(e);
		}
	},
	yoyoCardShow: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("191395", {
					IsYoyoCardShow: options.isYoyoCardShow,
					discount_type: options.discountType,
					source: "invoice",
				});
		} catch (e) {
			console.error(e);
		}
	},
	yoyoCardClick: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("191396", {
					click_type: options.clickType,
					source: "invoice",
				});
		} catch (e) {
			console.error(e);
		}
	},
	wechatReserveShow: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace(210385, {
					page: options.page,
					window_type: options.window_type,
					masterhotelid: options.masterhotelid,
				});
		} catch (e) {
			console.error(e);
		}
	},
	reserveClick: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace(213715, {
					page: options.page,
					click_type: options.click_type,
					masterhotelid: options.masterhotelid,
				});
		} catch (e) {
			console.error(e);
		}
	},
};
