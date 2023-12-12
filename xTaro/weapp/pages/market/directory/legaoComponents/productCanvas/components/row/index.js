const behavior = require('./../../utils/behavior')

Component({
  behaviors: [behavior],
  externalClasses: [],
  options: {
    multipleSlots: true 
  },
  properties: {
    data: {
      type: Object,
      observer: (val, oldVal) => {
        // console.log('查看求讲解的样式', val)
      }
    },
  },

  data: {
    sceneBoxStyle: null,
    isIphone: false,
  },
  lifetimes: {
    async attached() {
      const res = wx.getSystemInfoSync()
      const isIphone = res.model.indexOf("iPhone") > -1 ? true : false
      this.setData({
        isIphone: isIphone
      })
    },
    detached() {

    },
  },
  methods: {


  }
})
