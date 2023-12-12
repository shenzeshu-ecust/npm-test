export default {
    roomShowTrace: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('HTL_c_wechat_duration_exposure', options);
        } catch (e) {
            // console.error(e);
        }
    },
    enterHourRoomTrace: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(158516, {});
        } catch (err) {
            // ignore
        }
    }
};
