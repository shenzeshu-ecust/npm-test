export default {
    bottombarClick: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('htlwechat_dtl_detail_bottombar_click', {
                functionId: options.id,
                hotelId: options.hotelId,
                source: options.source,
                wifiConnType: options.type || ''
            });
        } catch (e) {
            // console.error(e);
        }
    },
    bottombarShow: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('htlwechat_dtl_detail_bottombar_show', {
                buttonname: options.buttonname,
                masterhotelid: options.hotelId,
                source: options.source,
                wifiShowType: options.type
            });
        } catch (e) {
            // console.error(e);
        }
    },
    pageLoad: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('htlwechat_dtl_page_load', {
                masterhotelid: options.hotelId,
                source: options.source,
                aid: options.allianceid,
                sid: options.sid
            });
        } catch (e) {
            // console.error(e);
        }
    },
    wifiBtnClick: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('HTL_c_wechatapp_dmhy_action', {
                masterhotelid: options.hotelId,
                buttonname: options.name
            });
        } catch (e) {
            // console.error(e);
        }
    },
    connectWifi: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('HTL_c_wechatapp_dmhy_connwifi_click', {
                masterhotelid: options.hotelId,
                wifiname: options.SSID,
                wifitype: options.type,
                ispassword: options.secure,
                signalStrength: options.signalStrength
            });
        } catch (e) {
            // console.error(e);
        }
    },
    connectWifiResult: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('HTL_c_wechatapp_dmhy_wifiresult_click', {
                masterhotelid: options.hotelId,
                wifiname: options.SSID,
                wifitype: options.type,
                ispassword: options.secure,
                signalStrength: options.signalStrength,
                issuccessful: options.result,
                errmsg: options.errMsg || ''
            });
        } catch (e) {
            // console.error(e);
        }
    },
    allTicketClick: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('HTL_c_wechat_dmhy_allticket_click', {
                masterhotelid: options.hotelId,
                source: options.source
            });
        } catch (e) {
            // console.error(e);
        }
    },
    ticketClick: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('HTL_c_wechat_dmhy_ticket_click', {
                masterhotelid: options.hotelId,
                source: options.source
            });
        } catch (e) {
            // console.error(e);
        }
    },
    luckyDraw: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('134058', {
                masterhotelid: options.hotelId
            });
        } catch (e) {
            // console.error(e);
        }
    },
    luckyDrawClick: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('134059', {
                masterhotelid: options.hotelId,
                rank: options.rank,
                eventname: options.eventname
            });
        } catch (e) {
            // console.error(e);
        }
    },
    traceGuideLoginPage: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('158663', {
                cid: options.cid,
                sourceid: options.sourceid
            });
        } catch (e) {
            // console.error(e);
        }
    }
};
