//let ubt_cwx = require('../../../../../cwx/cpage/ubt_wx.js');
import { cwx } from "../../../../../cwx/cwx.js";
import { mainClipfn, sendExposefn,isuseWechatAd } from '../../ad-utils.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    adData : Array,
    whObj: Object,
    slideVideo:Object,
    showSign:Object,
    adType: String,
    borderRadius:String,
    header:Object,
    trackingid:String
  },

  /**
   * 组件的初始数据
   */
  data: {
    swiperData:{},
    dotStyle:'',
    dotCurrentStyle:'',
    dotWrapStyle:'',
    swiperStyle:'',
    wraperStyle:'',
    transformX:0,
    transformY:0,
    scaleRadio:1,
    currentSwiper: 0,
    autoplay:true,
    bgflag:[],
    snum:0,
    adOpeData:[]
  },
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached() {
      let initSwiper ={
        delayTime: 3000,
        dotShow:true,
        dotWidthAndHeight:[4,4],
        dotMargin:2,
        dotCurrentColor:'#fff',
        dotCurrentType:'pencil',
        dotColor:'#fff',
        dotOpacity:0.4,
        dotCurrentOpacity:1,
        dotPosition:'right',
        bottom:0,
        left:12,
        right:12
      }
      let swiperData = Object.assign({}, initSwiper, this.data.slideVideo), _dotWrapStyle, _dotStyle = '', _dotCurrentStyle=''
      if (swiperData.dotPosition == 'left'){
        _dotWrapStyle = `position:absolute;left:${swiperData.left}px;bottom:${swiperData.bottom}px;display:inline-block;`
      } else if (swiperData.dotPosition == 'right'){
        _dotWrapStyle = `position:absolute;right:${swiperData.left}px;bottom:${swiperData.bottom}px;display:inline-block;`
      } else {
        _dotWrapStyle = `position:absolute;left:50%;bottom:${swiperData.bottom}px;display:inline-block;transform:translateX(-50%)`
      }
      _dotStyle = `display:inline-block;width:${swiperData.dotWidthAndHeight[0]}px;height:${swiperData.dotWidthAndHeight[1]}px;margin:${swiperData.dotMargin}px;background-color:${swiperData.dotColor};opacity:${swiperData.dotOpacity};border-radius:${swiperData.dotWidthAndHeight[0]}px`
      let _width = swiperData.dotCurrentType == 'pencil' ? swiperData.dotWidthAndHeight[0] * 3:swiperData.dotWidthAndHeight[0]
      _dotCurrentStyle = `display:inline-block;width:${_width}px;height:${swiperData.dotWidthAndHeight[1]}px;margin:${swiperData.dotMargin}px;background-color:${swiperData.dotCurrentColor};opacity:${swiperData.dotCurrentOpacity};border-radius:${swiperData.dotWidthAndHeight[0]}px`
      this.setData({
        swiperData,
        dotStyle: _dotStyle,
        dotCurrentStyle: _dotCurrentStyle,
        dotWrapStyle: _dotWrapStyle
        })
      this.setSwiperStyle()
      this.operateAdData()
      // console.log(this.data.adData, swiperData,"adData")
    },
    moved() { },
    detached() { },
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show() { 
      this.setData({ autoplay: true, snum:0 })
    },
    hide() { 
      this.setData({ autoplay:false})
    },
    resize() {
     },
  },
  /**
   * 组件的方法列表
   */
  methods: {

    operateAdData(){
      if(this.data.adData.length>0){
        let _operateData =[]
        this.data.adData.forEach(item=>{
          let {isuse, unionCode, sdkType, sdkGroupType} =  isuseWechatAd(item)
          let top ='-12%'
          const {crHeight,crWidth} = this.data.whObj
          if(crHeight.indexOf('%')!=-1 && crWidth.indexOf('%')!=-1 ){
            top ='-4.3%'
          }
          if(isuse){
            item = Object.assign({},item,{isuse, unionCode, sdkType, sdkGroupType,top})
          }
          _operateData.push(item)
        })
        this.setData({
          adOpeData:_operateData
        })
      }
    },
    swiperChange: function (e) {
      let _current = e.detail.current
      let _snum = this.data.snum
      // 曝光
      if (!this.data.bgflag.includes(_current)){
        if(!this.data.adData[_current].creativeMaterial){
          return false
        }
        this.data.adData[_current].creativeMaterial.metricLogs.forEach(item=>{
          if (item.key == '102842') {
            cwx.sendUbtByPage.ubtTrace && cwx.sendUbtByPage.ubtTrace(item.key, item.value)
          }
        })
        this.data.bgflag.push(_current)
        sendExposefn(this.data.adData[_current],'show',_current==0?'second':'first')
      } 
      _snum ++
      if (e.detail && e.detail.source =='touch'){
        this.setData({
          currentSwiper: _current
        })
      } else {
        if (_snum < 500) {
          this.setData({
            currentSwiper: _current,
            snum: _snum
          })
        } else {
          this.setData({ autoplay: false })
        }
      }
    },
    
    setSwiperStyle(){
      let fwObj ={
        fwWidth: this.data.adData[0] && this.data.adData[0].width,
        fwHeight: this.data.adData[0] && this.data.adData[0].height
      }
    let slideStyle = mainClipfn(this.data.whObj, fwObj)
    let _wraperStyle = slideStyle.wraperStyle
    if(this.data.borderRadius){
      _wraperStyle = _wraperStyle +`border-radius:${this.data.borderRadius};`
    }
      this.setData({
        swiperStyle: slideStyle.swiperStyle,
        wraperStyle: _wraperStyle,
        transformX: slideStyle._transformX,
        transformY: slideStyle._transformY,
        scaleRadio: slideStyle.scaleRadio
      })
    },
    // 子组件video组件通信，控制swiper轮播等功能
    handleVideo:function(e){
      const {type,isPlay} = e.detail
      if(type === 'play'){
        if(isPlay){
          // 视频播放情况下关闭自动轮播
          this.data.videoTimer && clearTimeout(this.data._videoTimer)
          this.setData({ autoplay: false })
          cwx.sendUbtByPage &&  cwx.sendUbtByPage.ubtTrace && cwx.sendUbtByPage.ubtTrace('mkt_adsdk_videostatus', { type: 'feed_play' })
        }else{
          // 视频暂停,开启自动轮播
          this.setData({ autoplay: true})
          cwx.sendUbtByPage &&  cwx.sendUbtByPage.ubtTrace && cwx.sendUbtByPage.ubtTrace('mkt_adsdk_videostatus', { type: 'feed_break' })
        }
      }else if(type === 'error'){
        // 播放报错
        cwx.sendUbtByPage &&  cwx.sendUbtByPage.ubtTrace && cwx.sendUbtByPage.ubtTrace('mkt_adsdk_videostatus', { type: 'feed_error' })
      }else if(type === 'end'){
        // 播放完成
        this.setData({ autoplay: true})
        cwx.sendUbtByPage &&  cwx.sendUbtByPage.ubtTrace && cwx.sendUbtByPage.ubtTrace('mkt_adsdk_videostatus', { type: 'feed_over' })
      }
    }
  }
})
