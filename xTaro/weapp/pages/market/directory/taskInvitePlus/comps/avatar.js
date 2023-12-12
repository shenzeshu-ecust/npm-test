Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      value: null
    },
    legaoInfo: {
      type: Object,
      value: null
    },
    index: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    status: 0, // 0 未邀请 1 已邀请，未领奖 2 已领奖
  },

  observers: {
    /**
     * 
     */
    'item': function (item) {
      if (!item.data?.headUrl) {
        this.setData({
          status: 0
        })
      } else {
        if (item.data?.awardStatus == 0) {
          this.setData({
            status: 1
          })
        } else {
          this.setData({
            status: 2
          })
        }
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    clickSmallAward: function() {
      this.triggerEvent('clickSmallAward', { index: this.data.index })
    },
    clickAvatar: function() {
      this.triggerEvent('clickAvatar',  { index: this.data.index })
    }
  }
})
