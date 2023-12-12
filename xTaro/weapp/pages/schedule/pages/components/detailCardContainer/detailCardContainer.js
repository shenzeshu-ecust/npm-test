Component({
  /**
   * 组件的属性列表
   */
  properties: {
    smartTripId: {
      type: String,
      value: ''
    },
    fromUid: {
      type: Number,
      value: 0
    },
    theme: {
      type: Number,
      value: 0//0=分享+添加，1=分享
    },
    addActionCode: {//添加行程点击埋点
      type: String,
      value:''
    },
    checktripActionCode: {//去行程查看埋点
      type: String,
      value: ''
    },
    cardStatus: String,
    detailUrl: String,
    actionCode:String,//订单详情埋点
    loadSuccess:{
      type: Boolean,
      value:false
    },
    showFailView:{
      type: Boolean,
      value: false
    }
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

  }
})
