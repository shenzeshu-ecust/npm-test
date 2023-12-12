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
    },
    data: {},
    methods: {
        closeModal: function() {
            this.setData({
                isShowModal: false
            })
        },
        callPhone: function() {
            this.triggerEvent('callPhone');
        }
    }
});