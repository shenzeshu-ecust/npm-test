import { cwx } from '../../../../cwx/cwx.js';
export default {
    showFLbutton: function (page) {
        try {
            page.ubtTrace && page.ubtTrace('158416', { scene_value: cwx.scene });
        } catch (e) {
            // ignore
        }
    },
    clickFLbutton: function (page) {
        try {
            page.ubtTrace && page.ubtTrace('158417', { scene_value: cwx.scene });
        } catch (e) {
            // ignore
        }
    }
};
