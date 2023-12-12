import { cwx } from '../../../../cwx/cwx.js';

export default {
    storageDateTrace: function (options) {
        const page = cwx.getCurrentPage();
        const { inDay, outDay } = options;
        try {
            page.ubtDevTrace && page.ubtDevTrace('htl_c_applet_date_storage', {
                inday: '缓存的入住日期' + inDay,
                outday: '缓存的离店日期' + outDay
            });
        } catch (e) {

        }
    }
};
