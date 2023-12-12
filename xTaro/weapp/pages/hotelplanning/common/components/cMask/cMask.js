Component({
	properties: {
        show: {
            type: Boolean,
            value: true,
        },
        lockScroll: {
            type: Boolean,
            value: true,
        },
        zIndex: {
            type: Number,
            value: 1000,
        },
        duration: {
            type: Number,
            value: 150,
        },
        fadeIn: {
            type: Boolean,
            value: true,
        }
	},
	data: {},
	methods: {
        onClick: function () {
            this.triggerEvent('click');
        },
        noop: function () {},
	},
});
