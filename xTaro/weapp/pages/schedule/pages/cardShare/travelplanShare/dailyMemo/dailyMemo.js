// {{component}}.js
Component({
    /**
     * Component properties
     */
    properties: {
        memoText: {
            type: String,
            value: ''
        }
    },

    /**
     * Component initial data
     */
    data: {
        maxShowTwoLine: true
    },

    /**
     * Component methods
     */
    methods: {
        showAllContent: function(e) {
            this.setData({ maxShowTwoLine: false });
        }
    }
})
