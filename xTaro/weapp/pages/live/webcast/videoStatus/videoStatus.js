// pages/live/webcast/videoStatus/videoStatus.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    loadingStatus: {
      type: Number,
      value: 0
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    reloadWatchLive: function(e){
      console.log("1111111")
      this.triggerEvent('reloadWatchLive', e);
    }
  }
})
