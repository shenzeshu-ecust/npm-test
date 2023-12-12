Component({
    options: {
      addGlobalClass: true
    },
    properties: {
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
      type: {
        type: Number,
        value: 1
      }
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