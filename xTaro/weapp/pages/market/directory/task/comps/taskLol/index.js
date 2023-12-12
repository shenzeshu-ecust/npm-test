// pages/market/directory/task/comps/taskLol/index.js

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    taskList: {
      type: Array,
      value: []
    },
    taskInfo: {
      type: Object,
      value: null
    },
    isLogin: {
      type: Boolean,
      value: false
    },
  },

  observers: {
    'taskList': function (taskList) {
      console.log('tasklist改变，重新计算buttonInfo')
      if (!Array.isArray(taskList)) {
        return
      }
      if (taskList.length < 2) {
        console.log('tasklist 数量不够')
        return
      }
      if (taskList[0].status == 0 || taskList[0].status == 1) {
        this.setData({
          buttonInfo: {
            index: 0,
            id: taskList[0].taskId,
            text: taskList[0].buttonText
          }
        })
      } else if (taskList[1].status == 0 || taskList[1].status == 1) {
        this.setData({
          buttonInfo: {
            index: 1,
            id: taskList[0].taskId,
            text: taskList[1].buttonText
          }
        })
      } else {
        this.setData({
          buttonInfo: {
            index: 2,
            id: taskList[0].taskId,
            text: '领红包封面'
          }
        })
      }
      // 设置头像昵称
      if (taskList[1]) {
        try {
          const headUrl = taskList[1].itemList[0].data.headUrl
          let showReceive = headUrl && taskList[1].itemList[0].data?.awardStatus == '0' // 已领奖
          this.setData({
            avatarInfo: {
              headUrl,
              showReceive
            }
          })
        } catch (error) {
          this.setData({
            avatarInfo: {
              headUrl: '',
              showReceive: false
            }
          })
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    buttonInfo: {
      index: 0,
      text: '',
    },
    avatarInfo: {
      headUrl: '',
      showReceive: false
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleTask: function (e) {
      const buttonInfo = this.data.buttonInfo
      if (buttonInfo.index == 0) {
        this.handleTask0()
      }
      if (buttonInfo.index == 1) {
        this.handleTask1()
      }
      if (buttonInfo.index == 2) {
        this.handleTask2()
      }
    },
    handleTask0: function () {
      const taskId = this.data.taskList[0].taskId
      this.triggerEvent('handleTask', {
        taskId
      })
    },
    handleTask1: function () {
      const buttonInfo = this.data.buttonInfo
      if (buttonInfo.index == 1) {
        const taskId = this.data.taskList[1].taskId
        this.triggerEvent('handleTask', {
          taskId
        })
      }
      if (buttonInfo.index == 0) {
        wx.showToast({
          title: '请先完成剪窗花哦~',
          icon: 'none'
        })
      }
    },
    handleTask2: function () {
      const buttonInfo = this.data.buttonInfo
      if (buttonInfo.index == 2) {
        const taskId = this.data.taskList[1].taskId
        this.triggerEvent('handleWithoutTask', {
          taskId
        })
      }
    },
    receiveSmallCoupon: function () {
      const taskId = this.data.taskList[1].taskId
      let idx = 0
      this.triggerEvent('clickAvatar', {
        taskId,
        idx
      })
    }
  }
})