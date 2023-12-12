Component({
    properties: {
        show: {
            type: Boolean,
            value: false,
        },
        type: {
            type: String,
            value: '',
        },
        rules: {
            type: String,
            value: '',
        },
    },
    data: {},
    lifecycles: {
        detached() {},
    },
    methods: {
        share() {
            this.triggerEvent('share');
            this.closeModal();
        },

        closeModal() {
            this.triggerEvent('close', {
                type: this.properties.type,
            });
        },
    },
});
