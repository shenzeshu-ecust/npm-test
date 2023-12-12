Component({
  /**
   * 组件的属性列表
   */
  properties: {
    legaoInfo: {
      type: Object,
      value: null
    },
    taskItem: {
      type: Object,
      value: null
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    styleStatus: 0,
    btnStyle: '',
    buttonText: '去完成'
  },

  observers: {
    'taskItem': function (taskItem) {
      let styleStatus = 0
      if (taskItem.status === 0) {
        if (taskItem.needReceive === 0) {
          styleStatus = 1
        } else {
          styleStatus = 0
        }
      } else {
        styleStatus = taskItem.status
      }
      const btnStyle = resolveBtnStyle(this.data.legaoInfo, styleStatus)

      let buttonText = resolveButtonText(taskItem)
      this.setData({
        buttonText,
        btnStyle,
        styleStatus
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleClickBtn() {
      this.triggerEvent('clickBtn')
    }
  }
})

function resolveButtonText(taskItem) {
  if (taskItem.status === 0 && taskItem.needReceive === 1) {
    return taskItem.buttonReceiveText || '领任务'
  }
  if (taskItem.status === 1) {
    return taskItem.buttonText || '去完成'
  }
  if (taskItem.status === 2) {
    return taskItem.buttonAwardText || '领奖励'
  }
  if (taskItem.status === 3) {
    return taskItem.buttonDoneText || '已完成'
  }
  if (taskItem.status === 4) {
    return taskItem.buttonLimitTimeText || '已失效'
  }
}

function resolveBtnStyle(legaoConfig, styleType) {
  const transformFields = transformField(legaoConfig)
  // 按钮背景图
  const btnBgImg = [
    transformFields.taskToReceiveBtnBgImg,
    transformFields.taskTodoBtnBgImg,
    transformFields.taskDoneBtnBgImg,
    transformFields.rewardDoneBtnBgImg,
    transformFields.taskInvalidBgImg || transformFields.rewardDoneBtnBgImg,
  ][styleType]
  // 按钮背景色
  const btnBgColor = [
    transformFields.taskToReceiveBtn,
    transformFields.taskTodoBtn,
    transformFields.taskDoneBtn,
    transformFields.rewardDoneBtn,
    transformFields.taskInvalidBtn || transformFields.rewardDoneBtn,
  ][styleType]
  // 按钮文字颜色
  const btnTextColor = [
    transformFields.taskToReceive,
    transformFields.taskTodo,
    transformFields.taskDone,
    transformFields.rewardDone,
    transformFields.taskInvalid || transformFields.rewardDone
  ][styleType]
  let btnStyle = ''
  if (btnBgImg) {
    btnStyle += `background-image: url(${btnBgImg});`
  }
  if (btnTextColor) {
    btnStyle += `color: ${btnTextColor};`
  }
  if (btnBgColor) {
    btnStyle += `background-color: ${btnBgColor};`
  } 
  if (!btnBgImg && !btnBgColor) {
    btnStyle += `background-color: rgb(255, 141, 1);`
  }
  return btnStyle
}

function transformField(fileds) {
  const {
      receiveBtnBgImage,
      todoBtnImage,
      receiveAwardBgImage,
      doneBgImage,

      receiveBtnBgColor,
      todoBtnBgColor,
      receiveAwardBgColor,
      doneBgColor,

      receiveBtnColor,
      todoBtnColor,
      receiveAwardColor,
      doneColor,
  } = fileds
  return {
      taskToReceiveBtnBgImg: receiveBtnBgImage,
      taskTodoBtnBgImg: todoBtnImage,
      taskDoneBtnBgImg: receiveAwardBgImage,
      rewardDoneBtnBgImg: doneBgImage,

      taskToReceiveBtn: receiveBtnBgColor,
      taskTodoBtn: todoBtnBgColor,
      taskDoneBtn: receiveAwardBgColor,
      rewardDoneBtn: doneBgColor,

      taskToReceive: receiveBtnColor,
      taskTodo: todoBtnColor,
      taskDone: receiveAwardColor,
      rewardDone: doneColor,
  }
}