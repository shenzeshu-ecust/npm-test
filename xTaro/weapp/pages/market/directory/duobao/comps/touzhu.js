// pages/market/directory/duobao/comps/touzhu.js
Component({
    options: {
        addGlobalClass: true,
        multipleSlots: true
    },
    /**
     * 组件的属性列表
     */
    properties: {
        clazz: {
            type: String,
            value: ''
        },
        numberList: {
            type: Array,
            value: []
        },
        winNumber: {
            type: Number,
            value: -1
        },
        maxNumber: {
            type: Number,
            value: 0
        },
        enableEdit: {
            type: Boolean,
            value: false
        }
    },
    observers:{
        numberList: function(val) {
            const len = val.length
            let noAddList = []
            if (this.data.maxNumber > 0) {
                noAddList = Array.from({ length: this.data.maxNumber - len }).fill('待投')
            }
            this.setData({
                numberListLocal: val,
                noAddList
            })
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        numberListLocal: [],
        noAddList: [],
        fouceIndex: -1,
    },

    /**
     * 组件的方法列表
     */
    methods: {
        handleChange: function(e) {
            const { value } = e.detail
            const { index } = e.target.dataset
            const {numberListLocal} = this.data
            numberListLocal[index] = +value
            this.setData({
                numberListLocal,
                fouceIndex: -1,
            })
            // const pass = this.checkNum(numberListLocal)
            this.triggerEvent('change', { list: numberListLocal })
        },
        checkNum: function(list) {
            for(let i = 0 ; i < list.length; i ++) {
                if (list[i] <= 0 || !list[i]) {
                    return false
                }
            }
            return true
        },
        handleFocus:function(e) {
          const { index } = e.target.dataset
          this.setData({
            fouceIndex: index
          })
          this.triggerEvent('focus', { index })
        },
        bindkeyboardheightchange: function(e) {
            const { height, duration } = e.detail
            this.triggerEvent('keyboardheightchange', { height, duration })
        }
    }
})
