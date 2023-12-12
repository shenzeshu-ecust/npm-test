import { cwx } from "../../../../cwx/cwx.js";

let prepageid = function () {
	try {
		const pages = getCurrentPages();
		const prevPage = pages[pages.length - 2];
		return prevPage.pageId;
	} catch (e) {
		return 0;
	}
};

module.exports = {
	showhotel: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("htlwechat_cutprice_hotel_show", {
					masterhotelid: options.hotelId,
					orderid: page.data.orderId,
				});
		} catch (e) {
			console.error(e);
		}
	},

	citySelectClick: function (page) {
		try {
			page.ubtTrace &&
				page.ubtTrace("htl_c_h5_cutprice_greatvaluehtl_click", {
					modelName: "瀑布流",
					modelPos: 1,
				});
		} catch (e) {
			console.error(e);
		}
	},

	shotLog: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("192463", {
					uid: cwx.user.duid,
					cid: cwx.clientID,
					status: options.progress,
				});
		} catch (e) {
			console.error(e);
		}
	},

	showSharePic: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("195751", {
					hotelid: page.data.hotelInfo?.hotelId || options.hotelId,
					uid: cwx.user.duid,
				});
		} catch (e) {
			console.error(e);
		}
	},

	initPage: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("212248", {
					object_type: options.objectType, //主客态 1主2客
					orderid: options.orderId,
					pageid: options.pageId
				});
		} catch (e) {
			console.error(e);
		}
	},

	popup: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace(options.keyid, {
					orderid: options.orderid,
					type: options.type,
					operate: options.operate || "",
					content: options.content || "",
				});
		} catch (e) {
			console.error(e);
		}
  },
  
	shareWechatClick: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("203100", {
					orderid: options.orderid,
					id_check_show_hotel: options.id_check_show_hotel,
					host_guest: options.host_guest,
					is_h5_wechat: "wechat",
					page: "10650010043",
                    type: options.type || '',
				});
		} catch (e) {
			console.error(e);
		}
	},

	shareFriendCircleShow: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("203104", {
					orderid: options.orderid,
					page: "10650010043",
				});
		} catch (e) {
			console.error(e);
		}
	},

	shareFriendCircleClick: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("203102", {
					orderid: options.orderid,
					id_check_show_hotel: options.id_check_show_hotel,
					host_guest: options.host_guest,
					is_h5_wechat: "wechat",
					page: "10650010043",
				});
		} catch (e) {
			console.error(e);
		}
	},

	logCutTrace: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("219299", {
					dimension: options.type === 0 ? '发起点击' : '帮砍点击',
					page: "10650010043",
				});
		} catch (e) {
			console.error(e);
		}
	},
	
	logCreateSuccess: function (page) {
		try {
			page.ubtTrace &&
				page.ubtTrace("219299", {
					dimension: '发起成功',
					page: "10650010043",
				});
		} catch (e) {
			console.error(e);
		}
	},

    showFreeTask: function (page,options) {
        try {
			page.ubtTrace &&
				page.ubtTrace("227057", {
				orderid: options.orderId,
                page: "10650010043",
                modelTabName: "免单",
                buttonText: options.buttonText
				});
		} catch (e) {
			console.error(e);
		}
    },

    clickFreeTask: function (page,options) {
        try {
			page.ubtTrace &&
				page.ubtTrace("227038", {
				orderid: options.orderId,
                page: "10650010043",
                modelTabName: "免单",
                buttonText: options.buttonText
				});
		} catch (e) {
			console.error(e);
		}
    },

};
