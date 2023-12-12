Component({
    properties: {
        isHourroom: {
            type: Boolean,
            value: false
        },
        dateInfo: {
            type: Object
        },
        showCalendarBar: {
            type: Boolean,
            value: false
        }
    },
    data: {},
    methods: {
        showCalender (e) {
            this.triggerEvent('showCalender', e);
        }
    }
});
