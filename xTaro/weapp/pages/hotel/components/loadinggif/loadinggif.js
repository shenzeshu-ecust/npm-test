Component({
    properties: {
        isShown: {
            type: Boolean,
            value: false,
            observer: 'onShownChange'
        }
    },
    data: {
    },
    methods: {
        onShownChange (newShown, oldShown) {
            this.setData({ isShown: newShown });
        },
        noop () {}
    },
    created: function () {
    },
    attached: function () {
    },
    ready: function () {
    },
    moved: function () {
    },
    detached: function () {
    }
});
