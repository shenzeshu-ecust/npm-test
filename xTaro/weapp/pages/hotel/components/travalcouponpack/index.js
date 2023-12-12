import { cwx } from '../../../../cwx/cwx.js';
Component({
    properties: {
        confirmButtonText: {
            type: String
        },
        couponInfo: {
            type: Object
        }
    },
    data: {},
    attached: function () {
        cwx.sendUbtExpose.observe(this); // 在 attached 中绑定监听器
    },
    methods: {
        closeLayer () {
            this.triggerEvent('closeLayer');
        },
        handleConfirm () {
            this.triggerEvent('confirm', {
                id: this.properties.couponInfo.id
            });
        }
    }
});
