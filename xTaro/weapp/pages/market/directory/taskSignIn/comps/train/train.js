Component({
    options: {
        styleIsolation: "shared",
        addGlobalClass: true
    },
    /**
     * 组件的属性列表
     */
    properties: {
        tempid: {
            type: String,
            value: ''
        },
        legaoInfo:{
            type: Object,
            value: null
        },
        signDetail:{
            type: Object,
            value: null
        },
        signList:{
            type: Array,
            value: []
        },
        showTips: {
          type: Boolean,
          value: false
        }
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
        showRuleModal: function() {
            this.triggerEvent('clickRule')
        },
        signToday: function() {
            this.triggerEvent('clickSignToday')
        }
    }
})
