Component({
  properties: {
    brglist: {
      type: Array,
      value: []
    }
  },
  data: {
    indicatorDots: false,
    vertical: true,
    autoplay: true,
    circular: true,
    interval: 2000,
    duration: 500,
    previousMargin: 0,
    nextMargin: 0
  },
  methods: {
    // 禁用手动滑动事件
    stopTouchMove() { }
  }
})
