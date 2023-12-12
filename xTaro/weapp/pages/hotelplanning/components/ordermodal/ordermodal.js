Component({
    properties: {
        isShown: {
            type: Boolean,
            value: false,
        },
        roomInfo: {
            type: Object,
            value: {},
        }
    },
    data: {},
    methods: {
        closeOrderLayer() {
            this.triggerEvent('closeOrderLayer');
        },
        goBooking() {
            this.triggerEvent('goBooking')
        }
    }
});