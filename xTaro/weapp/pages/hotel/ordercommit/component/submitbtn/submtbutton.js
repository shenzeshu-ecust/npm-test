Component({
    properties: {
        enableSubmit: {
            type: Boolean,
            value: false
        }
    },
    data: {},
    methods: {
        submitComment () {
            this.triggerEvent('submitComment');
        }
    }
});
