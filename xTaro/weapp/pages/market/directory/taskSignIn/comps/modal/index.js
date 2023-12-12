Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    popupType: { // 弹出类型
        type: Number,
        value: 1
    },
    // 弹窗 class
    extClass: {
      type: String,
      value: ''
    },
    // 允许点击蒙层关闭弹窗
    maskClosable: {
      type: Boolean,
      value: true
    },
    // 是否需要 遮罩层
    mask: {
      type: Boolean,
      value: true
    },
    // 是否开启弹窗
    show: {
      type: Boolean,
      value: false
    },
  },
  methods: {
    close() {
      const data = this.data
      if (!data.maskClosable) return
      this.triggerEvent('close', {}, {})
    },
    stopEvent() {}
  }
})