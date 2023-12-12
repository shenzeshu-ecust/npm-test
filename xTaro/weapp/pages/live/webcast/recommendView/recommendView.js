const behavior = require('../beh/recommendBeh')
Component({
  behaviors: [behavior],
  /**
   * 组件的属性列表
   */
  properties: {
    liveID: {
      type: Number,
      value: 0
    },
    source: {
      type: String,
      value: ""
    },
    commentKeybordBottom: {
      type: Number,
      value: 0
    },
    bottomSafe: {
      type: Number,
      value: 0
    },
    inputHeight:{
      type: Number,
      value: 0
    },
    askCardHeight:{
      type: Number,
      value: 0
    },
  },
  observers:{
    masterRecommendGoods: function(params) {
      // console.log("1231231" + JSON.stringify(params))
      this.setData({
        current: 0
      })
    },
    displayThemes: function(params) {
      this.refreshBg()
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    current: 0,
  },
  lifetimes: {
    attached: function() {
      // this.reqRecommend(this.properties.liveID, this.properties.source)
    },
    detached: function() {
    
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    swiperchange: function(e){
      this.setData({
        current: e.detail.current
      })
    },
    reqRecommends: function(liveID, source){
      this.reqRecommend(liveID, source)
    },
    clickRecommend: function(e){
      let item = e.currentTarget.dataset.item;
      this.triggerEvent('showRecommendCardDetail', item);
    }
  }
})
