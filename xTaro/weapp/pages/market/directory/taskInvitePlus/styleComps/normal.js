Component({
  /**
   * 组件的属性列表
   */
  properties: {
    taskList: {
      type: Array,
      value: []
    },
    legaoInfo: {
      type: Object,
      value: null
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    taskItem: null
  },

  observers: {
    'taskList': function(taskList) {
      if (taskList && taskList.length > 0) {
        this.setData({
          taskItem: taskList[0]
        })
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    clickBtn() {
      if (this.data.taskItem) {
        const { status } = this.data.taskItem
        // 去完成
        if (status === 0 || status === 1) {
          this.triggerEvent('onReceiveTask', { id: this.data.taskItem.id })
        } else if (status === 2) {
          // 领奖励
          this.triggerEvent('onReceiveAward', { id: this.data.taskItem.id })
        } else {
          // 已完成
        }
      }
    },
    handleClickAvatar(e) {
      const index = e.detail.index
      // 去完成
      if (!this.data.taskItem.itemList[index].data?.headUrl) {
        this.triggerEvent('onReceiveTask', { index, id: this.data.taskItem.id })
      }
    },
    handleClickSmallAward(e) {
      const index = e.detail.index
      this.triggerEvent('clickSmallAward', { index, id: this.data.taskItem.id })
    }
  
  }
})
