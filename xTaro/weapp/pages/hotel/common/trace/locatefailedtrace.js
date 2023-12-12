import { cwx } from '../../../../cwx/cwx.js';
export default {
    showlocatefailedTrace: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('165049', {
                sourceid: cwx.scene,
                location_failure: options.location_failure || '',
                cid: cwx.clientID || ''
            });
        } catch (e) {
            // ignore
        }
    },

    clickLocateFailedButtonTrace: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('165052', {
                sourceid: cwx.scene,
                location_failure: options.location_failure,
                button_name: options.button_name,
                cid: cwx.clientID || ''
            });
        } catch (e) {
            // ignore
        }
    },
    locateFailtoSuccessTrace: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('165058', {
                sourceid: cwx.scene,
                location_failure: options.location_failure,
                is_success: options.is_success,
                cid: cwx.clientID || ''
            });
        } catch (e) {
            // ignore
        }
    }
};
