Component({
  properties: {
    fooditem:Object,
    idx:Number,
    isSpecialDetail:Boolean,
    isNewStyle:Boolean
  },
  data: {

  },
  methods: {
    // 去详情页
    goDetail(e) {
      let foodDetail = e.currentTarget.dataset // detail对象，提供给事件监听函数
      this.triggerEvent('myevent', foodDetail)
    },
  }
})