module.exports = {
	pageLoad: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("htlwechat_dtl_page_load", {
					masterhotelid: options.hotelId,
					source: options.source,
					aid: options.allianceid,
					sid: options.sid,
				});
		} catch (e) {
			console.error(e);
		}
	},
	pageScene: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("189999", {
					page: options.page,
					scene_value: options.scene_value,
					source: options.source,
					sourceFrom: options.sourceFrom || "",
					masterhotelid: options.masterhotelid || "",
				});
		} catch (e) {
			console.error("htl_c_wechat_page_scene", e);
		}
	},
	yoyoCardShow: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("191395", {
					IsYoyoCardShow: options.IsYoyoCardShow,
					source: options.source,
				});
		} catch (e) {
			console.error("htl_c_wechat_yoyocard_show", e);
		}
	},

	wifiConnClick: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("209423", {
					page: options.page,
					type: options.type || '',
					typevalue: options.typevalue || {},
				});
		} catch (error) {
			console.error("htl_c_applet_wifi_connection_click", error);
		}
	},
	wifiConnShow: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("209424", {
					page: options.page,
					type: options.type || '',
					typevalue: options.typevalue || {},
				});
		} catch (error) {
			console.error("htl_c_applet_wifi_connection_show", error);
		}
	},
	groupModalShow: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("210386", {
					page: options.page,
					window_type: options.window_type,
					masterhotelid: options.masterhotelid
				});
		} catch (error) {
			console.error("htl_c_applet_contact_front_desk_show", error);
		}
	},
	callPhoneClick: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("210387", {
					page: options.page,
					source: options.source,
					masterhotelid: options.masterhotelid
				});
		} catch (error) {
			console.error("htl_c_applet_contact_front_desk_click	", error);
		}
	},
	groupToastShow: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("210385", {
					page: options.page,
					window_type: options.window_type,
					masterhotelid: options.masterhotelid,
				});
		} catch (error) {
			console.error("htl_c_applet_guide_join_show  ", error);
		}
	},
    showIntersection: function (page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("219853", {
					page: options.page,
                    masterhotelid: options.masterhotelid
				});
		} catch (e) {
			console.error(e);
		}
	},
	logNoImageTrace: function(page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("219300", {
					page: options.page,
					dimension: options.type + '_图片加载失败',
				});
		} catch (e) {
			console.error("htl_ctrip_applet_monitor_page_load ", e);
		}
	},
	logNoCropImageTrace: function(page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("219300", {
					page: options.page,
                    dimension: options.type + '_未切图图片加载失败'
				});
		} catch (e) {
			console.error("htl_ctrip_applet_monitor_page_load ", e);
		}
	},
	traceBannerExpose: function(page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("243206", {
					page: options.page,
					moduletype: options.moduletype,
				});
		} catch (e) {
			console.error("htl_c_applet_mbrwifi_subtop_exposure", e);
		}
	},
	traceBannerClick: function(page, options) {
		try {
			page.ubtTrace &&
				page.ubtTrace("243205", {
					page: options.page,
					moduletype: options.moduletype,
				});
		} catch (e) {
			console.error("htl_c_applet_mbrwifi_subtop_click", e);
		}
	},
    traceGuideLoginPage: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('158663', {
                cid: options.cid,
                sourceid: options.sourceid
            });
        } catch (e) {
			console.error("htl_c_mini_login_force", e);
        }
    },
    feedbackSubmitClick: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('249574', {
                page: options.page,
                masterhotelid: options.masterhotelid,
                context: options.context
            });
        } catch (e) {
			console.error("htl_c_applet_lsmbrwifi_feedback_fill_click", e);
        }
    },
    feedbackSubmitShow: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('249573', {
                page: options.page,
                masterhotelid: options.masterhotelid
            });
        } catch (e) {
			console.error("htl_c_applet_lsmbrwifi_feedback_fill_exposure", e);
        }
    },
    activitySquarePageShow: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('251606', {
                page: options.page,
                masterhotelid: options.masterhotelid,
                scenevalue: options.scenevalue
            });
        } catch (e) {
			console.error("htl_c_applet_activity_exposure", e);
        }
    },
    activitySquareModuleClick: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('251607', {
                page: options.page,
                masterhotelid: options.masterhotelid,
                type: options.type
            });
        } catch (e) {
			console.error("htl_c_applet_activity_ddz_click", e);
        }
    },
};
