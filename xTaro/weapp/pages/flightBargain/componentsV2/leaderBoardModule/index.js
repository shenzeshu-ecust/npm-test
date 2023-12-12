Component({

  behaviors: [],

  properties: {
    gloryList: Object
  }, // 定义父组件传入的参数类型

  data: {
    isOpen: false
  }, // 私有数据，可用于模版渲染

  // 方法
  methods: {
    openList() {
      this.setData({ isOpen: true })
    }
  }

})
