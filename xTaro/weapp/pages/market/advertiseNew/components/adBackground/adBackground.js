import { mainClipfn, sendExposefn ,sendComponentClick} from '../../ad-utils.js'
import { cwx } from "../../../../../cwx/cwx.js";
// 是否支持WebView
const SupportWebView = cwx.canIUse('web-view');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    adData:{
      type:Object,
       observer:function(){
            this.setBackgtoundStyle()
            // 获取视频
            this.setVideoStyle()
            // 获取主标题样式
            this.getTitleStyle()
            // 获取副标题样式
            this.getSubheadsStyle()
            // 获取标签样式
            this.getTagStyle()
           // 获取按钮样式
           this.getButtontyle()
            // 裁剪参数设置
            this.setbannerStyle()
       }
    },
    whObj:Object,
    showSign:Object,
    adType:String,
    screenRatio:Number,
    borderRadius:String,
    header:Object,
    trackingid:String,
    adIndex:Number,
    adsNum:{
      type:Number,
      value: null
    },
    currentSwiper:{
      type:Number,
      observer:function() {
        this.setVideoPlay()
    }}
  },
  /**
   * 组件的初始数据
   */
  data: {
    backgroundStyle:'',
    videoStyle:'',
    videoBtnStyle:'',
    videoVoiceStyle:'',
    titleStyle:'',
    titleStyleWrap:'',
    tagStyle:[],
    subheadsStyle:[],
    subheadsStyleWrap:[],
    //裁剪数据
    swiperStyle:'',
    wraperStyle: '',
    buttonStyle:'',
    transformX: 0,
    transformY: 0,
    scaleRadio: 1,
    showSignStyleWrap:'',
    showSignStyle:'',
    showSignObj:{},
    posterUrl:'',
    videoStatus:false,
    videoMuted:true,
  },
  lifetimes: {
    attached(){
      this.setbannerStyle()
      // 获取视频实例
      this.setVideoPlay()
      if(this.data.adData && this.data.adData.creativeMaterial && this.data.adData.creativeMaterial.video){
        this.videoContext = wx.createVideoContext(`video-${this.data.adData.creativeMaterial.creativeid}`,this)
      }
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    cssBackGimg(imgae){
      if(imgae){
        return `url(${imgae})`
      } else {
        return ''
      }
    },
    setVideoPlay(){
      // 设置播放
      const _videoAutoPlay = this.data.currentSwiper === this.data.adIndex
      let creativeMaterial = this.data.adData.creativeMaterial
      let videoInfo = creativeMaterial &&  creativeMaterial.video
      if(videoInfo){
        setTimeout(() => {
          if( _videoAutoPlay && videoInfo.isAutoPlay){
            this.videoContext && this.videoContext.play()
          }else{
            this.videoContext && this.videoContext.pause()
          }
         }, 0);
      }
     
    },
    setBackgtoundStyle(){
      let creativeMaterial = this.data.adData.creativeMaterial
      let _bgObj = creativeMaterial.layout
      let _scaleRadio = this.data.scaleRadio
      if (_bgObj){
       let _bgStyle = `width:${_bgObj.width * _scaleRadio}px;height:${_bgObj.height * _scaleRadio}px;background:${_bgObj.backgroundColor} ${this.cssBackGimg(_bgObj.backgroundImage)} no-repeat 0 0;background-size:100% 100%;border-radius:${_bgObj.borderRadius}px;overflow:hidden;position:relative;`
        this.setData({ backgroundStyle: _bgStyle})
      }
    },
    setVideoStyle(){
      let creativeMaterial = this.data.adData.creativeMaterial
      let videoInfo = creativeMaterial.video
      let _images = creativeMaterial.images
      let _scaleRadio = this.data.scaleRadio
      if(videoInfo){
        let _videoStyle = `position:absolute;left:${videoInfo.leftMargin * _scaleRadio}px;top:${videoInfo.topMargin * _scaleRadio};width:${videoInfo.width * _scaleRadio}px;height:${videoInfo.height * _scaleRadio}px;`
        let _posterUrl = ''
        if(_images && _images.length){
          _posterUrl = _images[0].imageUrl
        }
        let _videoBtnStyle = `position:absolute;top:${(videoInfo.height * _scaleRadio)/4}px;left:${((videoInfo.width * _scaleRadio)-(videoInfo.height * _scaleRadio)/2)/2}px;width:${(videoInfo.height * _scaleRadio)/2}px;height:${(videoInfo.height * _scaleRadio)/2}px;`
        let _videoVoiceStyle = `position:absolute;right:5px;top:5px;width:30px;height:30px;`
        this.setData({ videoStyle: _videoStyle, posterUrl: _posterUrl, videoBtnStyle:_videoBtnStyle, videoVoiceStyle:_videoVoiceStyle })
      }
      
    },
    getCommonStyleWrap(styleObj){
      let verAlign = { 'TOP': 'flex-start', 'BOTTOM': 'flex-end', 'CENTER': 'center' }
      let horAlign = { 'LEFT': 'flex-start', 'RIGHT': 'flex-end', 'CENTER': 'center' }
      let _scaleRadio = this.data.scaleRadio
      return `position:absolute;width:${styleObj.width *_scaleRadio}px;height:${styleObj.height * _scaleRadio}px;left:${styleObj.leftMargin * _scaleRadio}px;top:${styleObj.topMargin * _scaleRadio}px;z-index:990;display:flex;text-align:${styleObj.horizontalAlign};align-items:${horAlign[styleObj.horizontalAlign]};justify-content:${verAlign[styleObj.verticalAlign]}`
    },
    getInnerStyle(styleObj){
      let _scaleRadio = this.data.scaleRadio
      return `font-size:${styleObj.fontSize *_scaleRadio}px;font-weight:${styleObj.isBold == 1 ? 'bold' : 'normal'};color:${styleObj.color};line-height:${styleObj.lineHeight?styleObj.lineHeight:1.2};width:${styleObj.width * _scaleRadio}px; overflow:hidden;text-overflow: ellipsis;display: -webkit-box; -webkit-line-clamp: ${styleObj.maxLine ? styleObj.maxLine : 1};-webkit-box-orient: vertical;word-break: break-all;`
    },
    getTitleStyle(){
      let creativeMaterial = this.data.adData.creativeMaterial
      let styleObj = creativeMaterial.title
      if (styleObj){
        let titleStyle =  this.getInnerStyle(styleObj)
        let titleStyleWrap= this.getCommonStyleWrap(styleObj)
        this.setData({ titleStyle,titleStyleWrap})
      }
    },
    getButtontyle(){
      let creativeMaterial = this.data.adData.creativeMaterial
      let styleObj = creativeMaterial.button
      let _scaleRadio = this.data.scaleRadio
      if (styleObj){
        let _lineheight = styleObj.height * _scaleRadio
        let buttonStyle = `position:absolute;width:${styleObj.width * _scaleRadio}px;height:${styleObj.height * _scaleRadio}px;font-size:${styleObj.fontSize * _scaleRadio}px;left:${styleObj.leftMargin * _scaleRadio}px;top:${styleObj.topMargin * _scaleRadio}px;color:${styleObj.fontColor};text-align:center;line-height:${_lineheight}px;background:${styleObj.backgroundColor};border:${styleObj.borderColor?`1px solid ${styleObj.borderColor}`:'none'};border-radius:${styleObj.borderRadius?styleObj.borderRadius * _scaleRadio:0}px;z-index:900;overflow:hidden;`
        this.setData({ buttonStyle})
      }
    },
    getSubheadsStyle(){
      let creativeMaterial = this.data.adData.creativeMaterial
      let styleObj = creativeMaterial.subTitles
      let _subheadsStyle = [];
      let _subheadsStyleWrap = [];
      if (styleObj && styleObj.length>0) {
        styleObj.forEach(item =>{
         let titleWrap = this.getCommonStyleWrap(item)
         let titleStyle = this.getInnerStyle(item)
          _subheadsStyle.push(titleStyle)
          _subheadsStyleWrap.push(titleWrap)
        })
        this.setData({ subheadsStyle: _subheadsStyle,subheadsStyleWrap:_subheadsStyleWrap })
      }
    },
    getTagStyle(){
      let creativeMaterial = this.data.adData.creativeMaterial
      let styleTagArray = creativeMaterial.tags
      let tagStyleList =[]
      let _scaleRadio = this.data.scaleRadio
      if (styleTagArray && styleTagArray.length>0) {
        styleTagArray.forEach(styleObj =>{
          let _lineheight = styleObj.height * _scaleRadio
          if (styleObj.verticalAlign == 'TOP') {
            _lineheight = styleObj.fontSize * _scaleRadio
          } else if (styleObj.verticalAlign == 'BOTTOM') {
            _lineheight = Number(styleObj.height * _scaleRadio) * 2 - Number(styleObj.fontSize * _scaleRadio)
          }
         let tagStyle = `position:absolute;width:${styleObj.width * _scaleRadio}px;height:${styleObj.height * _scaleRadio}px;font-size:${styleObj.fontSize * _scaleRadio}px;font-weight:${styleObj.isBold == 1 ? 'bold' : 'normal'};left:${styleObj.leftMargin * _scaleRadio}px;top:${styleObj.topMargin * _scaleRadio}px;color:${styleObj.color};text-align:${styleObj.horizontalAlign};line-height:${_lineheight}px;background:${styleObj.backgroundColor};border:${styleObj.hasBorder == 1 ? `2px solid ${styleObj.borderColor}` : ''};opacity: ${styleObj.opacity};border-radius:${styleObj.borderRadius?styleObj.borderRadius * _scaleRadio:0}px;z-index:700;overflow:hidden;`
          tagStyleList.push(tagStyle)
        })
        this.setData({ tagStyle: tagStyleList })
      }
    },
    setbannerStyle() {
      let fwObj = {
        fwWidth: this.data.adData && this.data.adData.width,
        fwHeight: this.data.adData && this.data.adData.height
      }
      let slideStyle = mainClipfn(this.data.whObj, fwObj, this.data.screenRatio)
      if (this.data.adType == 'BANNER') {
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
      } else {
        this.setData({
          transformX: slideStyle._transformX,
          transformY: slideStyle._transformY,
          scaleRadio: slideStyle.scaleRadio
        })
      }
      // 设置角标样式
      this.getShowSignStyle()
      // 设置背景样式
      this.setBackgtoundStyle()
      // 设置视频样式
      this.setVideoStyle()
      // 获取主标题样式
      this.getTitleStyle()
      // 获取副标题样式
      this.getSubheadsStyle()
      // 获取按钮样式
      this.getButtontyle()
      // 获取标签样式
      this.getTagStyle()
    },
    adItemJump(_adData,_creativeMaterial){
       // 广告点击埋点
       _creativeMaterial.metricLogs.forEach(item=>{
        if (item.key =='102840'){
          cwx.sendUbtByPage && cwx.sendUbtByPage.ubtTrace && cwx.sendUbtByPage.ubtTrace(item.key, item.value)
        }
      })
      // 第三方检测链接
      sendExposefn(_adData,'click')
      // console.log('此时接口的跳转链接', _creativeMaterial)
      if (_creativeMaterial.appId) {
        //跳转到独立小程序
        cwx.cwx_navigateToMiniProgram({//change by ybhao 20180605
          appId: _creativeMaterial.appId,
          path: _creativeMaterial.linkUrl,
          openEmbedded:true,
          envVersion: "release",
          success: function (res) {
            console.log("jump other success")
          },
          fail: function (res) {
            console.log("jump other fail")
          }
        })
      } else if (SupportWebView && /^(https?):\/\//i.test(_creativeMaterial.linkUrl)) { //跳转H5地址
        let jumpObj = {
          url: encodeURIComponent(_creativeMaterial.linkUrl)
        }
        if(_creativeMaterial.linkUrl && _creativeMaterial.linkUrl.toLowerCase().indexOf('needlogin')>-1){
          jumpObj.needLogin = true
        }
        if(_creativeMaterial.linkUrl && _creativeMaterial.linkUrl.toLowerCase().indexOf('isshareweburl')>-1){
          jumpObj.isShareWebUrl = true
        }
        cwx.component.cwebview({
          data: jumpObj
        })
      } else {
        if (_creativeMaterial.linkUrl) {
          cwx.navigateTo({
            url: _creativeMaterial.linkUrl,
            success: function (e) {
              console.log('success');
            }
          })
        }
      }
    },
    adItemClick(event,type){
      const {id} = event.target
      // 广告点击
      let _adData = this.data.adData
      let _creativeMaterial = _adData.creativeMaterial
      const layout = _creativeMaterial.layout
      let clickabled = layout && layout.clickabled
      if(id === 'videoPlayBtn'){
        // 点击播放和开启按钮
        if(!this.data.videoStatus){
          this.videoContext.play()
        }else{
          this.videoContext.pause()
        }
        return false
      }
      if(id === 'videoVoiceBtn'){
        // 点击视频音量按钮
        const _videoMuted = this.data.videoMuted
        this.setData({videoMuted:!_videoMuted})
        cwx.sendUbtByPage &&  cwx.sendUbtByPage.ubtTrace && cwx.sendUbtByPage.ubtTrace('mkt_adsdk_openVideoVoice', { value: _videoMuted?0:1 })
        return false
      }
      if(id.indexOf('video') && _creativeMaterial.video){
        // 点击的是视频
        let video_exptimedata = {
          data: JSON.stringify({
            impId:_adData.impId,
            url: _creativeMaterial.video.videoUrl || '',
            type: 'click'
          })
        }
        cwx.sendUbtByPage &&  cwx.sendUbtByPage.ubtTrace && cwx.sendUbtByPage.ubtTrace('o_mkt_banner_video_exptime', video_exptimedata)
      }


      if(_adData.impType=='2' && !clickabled && !type){
        return false
      }
      //优惠券领券逻辑
      if(_creativeMaterial.componentType && _creativeMaterial.componentType ==1 && _creativeMaterial.promoted){
        const params ={
          head:this.data.header,
          trackingId:this.data.trackingid,
          impId:_adData.impId,
          frame:_adData.index,
          componentType:_creativeMaterial.componentType,
          componentValue:_creativeMaterial.promoted.productId
        }
        // console.log(params)
        //请求数据前的埋点
        cwx.sendUbtByPage && cwx.sendUbtByPage.ubtTrace && cwx.sendUbtByPage.ubtTrace('mkt_adsdk_interaction_params', {data:JSON.stringify(params)})
        let _this = this
        cwx.request({
          url: '/restapi/soa2/13916/interaction.json',
          data: params,
          success: function (res) {
            let codeData =''
            let code =res.data.code
            if(code==1000015){
              codeData ='invalid'
            } else if(code==200){
              codeData ='success'
            } else {
              codeData ='fail'
            }
            sendComponentClick(_creativeMaterial.trackingExtras,'componentClick',codeData)
            _this.adItemJump(_adData,_creativeMaterial)
            // 和native保持一致埋点
            cwx.sendUbtByPage && cwx.sendUbtByPage.ubtTrace && cwx.sendUbtByPage.ubtTrace('o_mkt_ticker_response', {code:codeData,reason:JSON.stringify(res.data),impid:_adData.impId})
          },
          fail: function (e) {
             sendComponentClick(_creativeMaterial.trackingExtras,'componentClick','fail')
             _this.adItemJump(_adData,_creativeMaterial)
            //请求数据前的埋点
            cwx.sendUbtByPage && cwx.sendUbtByPage.ubtTrace && cwx.sendUbtByPage.ubtTrace('mkt_adsdk_interaction_fail', {code:'fail',reason:JSON.stringify(e),impid:_adData.impId})
          }
        });

      } else {
        this.adItemJump(_adData,_creativeMaterial)
      }


    },
    adButtonClick(event){
      this.adItemClick(event,'button')
    },
    getShowSignStyle(){
      let initShowSign ={
        show: true,
        position: 'left',
        left:0,
        right: 0,
        bottom: 0
      }
      let _showSign = Object.assign({}, initShowSign,this.data.showSign)
      // showSign样式书写
      let wrapSignStyle = `opacity: 0.3;background:#000;width:26px;height:14px;border-radius:4px;position:absolute;${_showSign.position}:${_showSign[_showSign.position]}px;bottom:${_showSign.bottom }px;z-index:99`
      if (_showSign.position == 'left' && _showSign.left ==0){
        wrapSignStyle = wrapSignStyle.concat('border-top-left-radius:0;border-bottom-left-radius:0;')
      }
      if (_showSign.position == 'right' && _showSign.right == 0) {
        wrapSignStyle = wrapSignStyle.concat('border-top-right-radius:0;border-bottom-right-radius:0;')
      }
      if (_showSign.bottom == 0){
        wrapSignStyle = wrapSignStyle.concat('border-bottom-left-radius:0;border-bottom-right-radius:0;')

      }
      if (_showSign.borderTopLeftRadius) {
        wrapSignStyle = wrapSignStyle.concat(`border-top-left-radius:${_showSign.borderTopLeftRadius}px;`)
      }
      if (_showSign.borderTopRightRadius) {
        wrapSignStyle = wrapSignStyle.concat(`border-top-right-radius:${_showSign.borderTopRightRadius}px;`)
      }
      if (_showSign.borderBottomRightRadius) {
        wrapSignStyle = wrapSignStyle.concat(`border-bottom-right-radius:${_showSign.borderBottomRightRadius}px;`)
      }
      if (_showSign.borderBottomLeftRadius) {
        wrapSignStyle = wrapSignStyle.concat(`border-bottom-left-radius:${_showSign.borderBottomLeftRadius}px;`)
      }
      let innerSignStyle = 'opacity: 0.9;color:#fff;font-size:9px;width:26px;height:14px;letter-spacing: 0;line-height:14px;display:block;text-align:center;'
      const isDialog = this.data.adData.impType == '2'
      if(isDialog){
        wrapSignStyle = wrapSignStyle.concat(`bottom:auto;top:0px;border-top-right-radius:0px;border-bottom-right-radius:7px;`)
      }
      // console.log(wrapSignStyle, innerSignStyle)
      this.setData({
        showSignStyleWrap: wrapSignStyle,
        showSignStyle: innerSignStyle,
        showSignObj: _showSign
        })
    },
    // 当开始/继续播放时触发 play 事件
    videoPlay(){
      this.setData({ videoStatus:true })
      this.triggerEvent('videoChange',{ isPlay: true, type: 'play' })
    },
    // 视频暂停
    videoPause(){
      this.setData({ videoStatus:false })
      this.triggerEvent('videoChange',{ isPlay: false, type: 'play' })
    },
    videoError(){
      this.setData({videoStatus:false })
      this.triggerEvent('videoChange',{ type: 'error' })
    },
    videoEnd(){
      this.setData({ videoStatus:false })
      // videoCtx.pause()
      this.triggerEvent('videoChange',{ type: 'end' })
    }
  }
})
