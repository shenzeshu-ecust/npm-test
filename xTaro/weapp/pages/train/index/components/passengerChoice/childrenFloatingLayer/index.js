// 微信小程序通用浮层组件
Component({
  properties: {
    min: {
      type: Number,
      value: 0,
    },
    max: {
      type: Number,
      value: 100,
    },
    value: {
      type: Number,
      value: 0,
    },
    title: {
      type: String,
      value: '',
    },
    subtitle: {
      type: String,
      value: '请准确选择每位儿童/青年的年龄，以便为您查找合适的票种',
    },
    visible: {
      type: Boolean,
      value: false,
      observer: function(newValue) {
        if (newValue) {
          // 当show为true时，执行上移动画
          this.slideUp()
        } else {
          // 当show为false时，执行下移动画
          this.slideDown()
        }
      },
    },
  },
  data: {
    ages: [],
    selected: false,
    value: null,
    animationData: {},
  },
  lifetimes: {
    attached() {
      this.generateAges()
    },
  },
  methods: {
    generateAges() {
      const { min, max, value } = this.properties
      const ages = []
      for (let i = min; i <= max; i++) {
        ages.push(i)
      }
      this.setData({
        ages: ages,
        value
      })
    },
    selectAge(e) {
      const selectedAge = e.currentTarget.dataset.value
      this.triggerEvent('change', { selectedAge: selectedAge })
    },
    onClose() {
      this.triggerEvent('close')
    },
    slideUp() {
      const animation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease'
      })
      animation.translateY('100%').step();
      this.setData({
        animationData: animation.export()
      })
      setTimeout(() => {
        animation.translateY(0).step()
        this.setData({
          animationData: animation.export()
        })
      },50)
    },
    slideDown() {
      const animation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease'
      })
      animation.translateY(0).step();
      this.setData({
        animationData: animation.export()
      })
      setTimeout(() => {
        animation.translateY('100%').step()
        this.setData({
          animationData: animation.export()
        })
      },50)
    }
  },
})
