import { mainClipfn } from '../../ad-utils.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    adData: Object,
    showSign: Object,
    adType: String,
    whObj:Object,
    screenRatio:Number,
    header:Object,
    trackingid:String
  },

  /**
   * 组件的初始数据
   */
  data: {
    wrapStyle:'',
    showClass:'',
    maskhide:false

  },
  lifetimes: {
    attached() {
      if (this.data.screenRatio) {
        let fwObj = {
          fwWidth: this.data.adData && this.data.adData.width,
          fwHeight: this.data.adData && this.data.adData.height
        }
        let slideStyle = mainClipfn(this.data.whObj, fwObj)
        this.setData({ wrapStyle: `width:${this.data.screenRatio}%;height:${this.data.adData.height * slideStyle.scaleRadio * (this.data.screenRatio / 100)}px` })
      }
    }
  },
  pageLifetimes:{
    hide: function() {
      // 页面被隐藏
      this.closeAd()
    }

  },

  /**
   * 组件的方法列表
   */
  methods: {
    closeAd(){
      this.setData({ maskhide: true, showClass:'boxout'})
      this.triggerEvent('closeDialogCallback', {}, { bubbles: true, composed: true })
    }
  }
})
