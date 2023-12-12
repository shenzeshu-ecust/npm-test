import cwx from '../../../../cwx/cwx'
import C from '../../common/Const.js';

Component({
    properties: {
        communityQRCode:{
            type: Object,
            value: {}
        },
        isShowModal:{
            type: Boolean,
            value: false
        },
        type:{
            type: String,
            value: ""
        },
    },
    data: {},
    methods: {
        closeModal: function() {
            if(this.data.type === "wework"){
                this.triggerEvent("closeCModal",{modalName: C.GROUP_QR})
            }else {
                this.setData({
                    isShowModal: false
                })
            }
        },
        onLongPress: function() {
          // qrCodeType 1—本店企微 2—平台企微
            if (this.data.communityQRCode?.type === 'wifi_wework' || this.data.communityQRCode?.qrCodeType === 2) {
                this.logWithUbtTrace("221378", {});
            }
        },
        logWithUbtTrace: function (ubtKey, data) {
			if (!ubtKey) return;
			let log = cwx.sendUbtByPage.ubtTrace || this.ubtTrace;
			log(ubtKey, data);
		}
    }
});