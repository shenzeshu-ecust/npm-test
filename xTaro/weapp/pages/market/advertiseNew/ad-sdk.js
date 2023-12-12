import { cwx, __global } from '../../../cwx/cwx.js';
//let ubt_cwx = require('../../../cwx/cpage/ubt_wx.js');
import { sendExposefn ,isuseWechatAd,getArrayValue} from './ad-utils.js'
let __storeKey = "mkt_newlanAndLong";
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    mediaCode:String,
    pageCode:String,
    impId:String,
    width:String,
    height:String,
    slideVideo:Object,
    showSign:Object,
    site:Object,
    extension:Array,
    corp:Object,
    lonAndLat:Object,
    borderRadius:String,
    sequence:Number,
    callbackExtension: Array // 保存回调返回字段
  },
  observers:{
    'impId,site':function(impId,site){
      this.setAdStatus()
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    impType: '1',//广告位资源类型:1、横幅；2、插屏；3、信息流
    screenRatio:100,//仅仅针对插屏
    adType: 'BANNER',//BANNER，VIDEO，MULTI-BANNER,NATIVE  
    loadFlag:false,
    adData:[],
    whObj:{},
    showTencentAd:false,
    tencentAdCode:'',
    adStyle:'',
    trackingid:'',
    header:{},
    showAdCustomSDK: false,
    adCustomSDKStyle: ''
  },
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached() {
      // 获取广告数据并赋值data
      // this.setAdStatus()
     },
    moved() { },
    detached() { },
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    resize() {
      // 适配折叠屏，在resize的时候重新获取数据
      this.setAdStatus()
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /*
    *获取广告请求唯一ID 方式是当前时间戳+13位随机吗
    */
    getsingleId(){
      return new Date().getTime() + Math.random().toString(32).substr(2)
    },
    /**
     * 获取head信息
     */
    getHeadinfo(){
      //storage中获取clientID
      return {
        "syscode": "30",//(sdk must)
        "lang": cwx.wxSystemInfo.language,
        "cid": cwx.clientID,//(sdk must) clientId
        "cver": __global.version,
        "sid": __global.sid && __global.sid +'' || '',// (sdk must) sessionid
      }
    },
    getOsName(){
      let system = cwx.wxSystemInfo.system
      // console.log(cwx.wxSystemInfo, 'cwx.wxSystemInfo', __global)
      if (system){
        if(/android/i.test(system)){
          return 'ANDROID'
        } else if (/ios/i.test(system)){
          return 'IOS'
        } else {
          return 'APP'
        }
      } else {
        return 'APP'
      }
    },
    // 获取个性化推荐
    getPRSetting(){
      return new Promise((resolve, reject)=>{
        const pRSetting = {
          personalRecommendSwitch: false
        }
        if(cwx.getPRSetting){
          cwx.getPRSetting().then(res=>{
            resolve(res)
          }).catch(err=>{
            resolve(pRSetting)
          })
        }else{
          resolve(pRSetting)
        }
      })
    },
    /**
     * 创建广告请求体
     */
    getRequestParams({ personalRecommendSwitch } = {}){
      let requestParams = {
        isPersonalRecommend: personalRecommendSwitch,
        head: this.getHeadinfo(),
        id: `MINI_APP${this.getsingleId()}`,
        type: 'MINI_APP',
        sdkVer: "3.0.0",
        apiVer: "1.0.0",
        device: {
          deviceType: 'PHONE',
          os: this.getOsName(),
          osv: cwx.wxSystemInfo.system || __global.version,
          height: cwx.wxSystemInfo.screenHeight,
          width: cwx.wxSystemInfo.screenWidth,
          pxratio: cwx.wxSystemInfo.pixelRatio
        },
        user: {
          cid: cwx.clientID,
          vid: __global.vid,
          openid: cwx.cwx_mkt.openid
        },
        imps: [{
          impId: this.data.impId
        }],
        app: {
          ver: '1.0'
        },
        site:{
          url:getCurrentPages() && getCurrentPages()[0] && getCurrentPages()[0].route || ''
        }
      }
       // 支持刷次
       if(this.data.sequence) {
        requestParams.imps[0].sequence = this.data.sequence
      }
      // 付默认值
      let siteObj = Object.assign({}, { siteId: '', siteType:''},this.data.site)
      let corpObj = Object.assign({}, { corpId: '', corpType:''},this.data.corp)
      let lonAndLatObj = { isEnable: false, lon: '', lat: '', cityID: '', cityName:''}
      let lonAndLat = Object.assign({}, lonAndLatObj,this.data.lonAndLat)
      // 获取地理定位 -需要定位
      if (!!cwx.getStorageSync(__storeKey)) {
        try {
          let latstring = cwx.getStorageSync(__storeKey)
          if(typeof latstring =='string'){
            let geoobj = JSON.parse(latstring)
            geoobj.latitude && ( requestParams.device.geo = geoobj)
          }
        } catch (error) {
          console.log(error)
        }
       }
        cwx.locate.getCtripCity(function (resp) {
          if (resp && resp.data && resp.data.CityLatitude &&  resp.data.CityEntities &&  resp.data.CityEntities[0] && resp.data.CityEntities[0].CityID) {
            cwx.setStorageSync(__storeKey, JSON.stringify({
              "latitude": resp.data.CityLatitude,
              "longitude": resp.data.CityLongitude,
              "cityId": resp.data.CityEntities[0].CityID,
              "city": resp.data.CityEntities[0].CityName
            }))
          }
        }, "marketluckyactivity-lbs","gcj02",8000,!lonAndLat.isEnable);
        if (!lonAndLat.isEnable && lonAndLat.lon && lonAndLat.lat) {
         let crGeo = {
           "latitude": lonAndLat.lat,
           "longitude": lonAndLat.lon,
          }
          lonAndLat.cityName && (crGeo.cityName = lonAndLat.cityName)
          lonAndLat.country && (crGeo.country = lonAndLat.country)
          lonAndLat.region && (crGeo.region = lonAndLat.region)
          lonAndLat.cityID && (crGeo.cityId = lonAndLat.cityID)
          lonAndLat.countryId && (crGeo.countryId = lonAndLat.countryId)
          lonAndLat.regionId && (crGeo.regionId = lonAndLat.regionId)
          lonAndLat.destId && (crGeo.destId = lonAndLat.destId)
          requestParams.geo = crGeo
        }
      // 站点信息获取
      if (siteObj.siteId || siteObj.siteType ) {
        requestParams.user.data = requestParams.user.data || []
        if(siteObj.siteId ){
          requestParams.user.data.push({
            "name": "siteId",
            "value": siteObj.siteId + ''
          })
        }
        if(siteObj.siteType ){
          requestParams.user.data.push({
            "name": "siteType",
            "value": siteObj.siteType + ''
          })
        }
      }
      if (corpObj.corpId || corpObj.corpType ) {
        requestParams.user.data = requestParams.user.data || []
        if(corpObj.corpId ){
          requestParams.user.data.push({
            "name": "corpid",
            "value": corpObj.corpId  + ''
          })
        }
        if(corpObj.corpType ){
          requestParams.user.data.push({
            "name": "corptype",
            "value": corpObj.corpType + ''
          })
        }
      }

      // 获取业绩参数
      cwx.mkt.getUnion(function (uniondata) {
        requestParams.user.data = requestParams.user.data || []
        if (uniondata) {
          // console.log(uniondata,'uniondata')
          if (uniondata.allianceid) {
            requestParams.user.data.push({
              "name": "aid",
              "value": uniondata.allianceid + ''
            })
          }
          if (uniondata.sid) {
            requestParams.user.data.push({
              "name": "sid",
              "value": uniondata.sid + ''
            })
          }
          if (uniondata.ouid) {
            requestParams.user.data.push({
              "name": "ouid",
              "value": uniondata.ouid + ''
            })
          }
          if (uniondata.sourceid){
            requestParams.app.sourceId = uniondata.sourceid + ''
          }
        }
      })
      let _extension = this.data.extension
      let _callbackExtension = []
      if (_extension && Array.isArray(_extension) && _extension.length>0) {
        _extension.forEach((item, index) => {
          if (item.name && item.value) {
            // customData,配合信息流使用，用于回调函数返回
            if(item.name == 'customData') {
              _callbackExtension.push(item)
              _extension.splice(index, 1)
            }else {
              item.name = item.name + ''
              item.value = item.value + ''
            }
          } else {
            _extension.splice(index, 1)
          }
        })
        this.setData({
          callbackExtension: _callbackExtension
        })
        requestParams.exts = _extension
      }
      // 获取登录态信息-auth
      // console.log(cwx.getStorageSync('auth'))
      if (cwx.getStorageSync('auth')){
        requestParams.head.auth = cwx.getStorageSync('auth')
      }

      this.setData({
        header:requestParams.head
      })
      return requestParams
    },
    // 获取广告数据
    getAdResultPromise(){
      let _this = this
      return new Promise((resolve,reject) =>{
        this.getPRSetting().then(pRSetting=>{
          let requestParams = this.getRequestParams({...pRSetting})
          //请求数据前的埋点
          let _ubtData = {
            data:JSON.stringify(requestParams)
          }
          cwx.sendUbtByPage && cwx.sendUbtByPage.ubtTrace && cwx.sendUbtByPage.ubtTrace('marketadsdk_request_before', _ubtData)
         
          cwx.request({
            url: '/restapi/soa2/13916/tripAds.json',
            data: requestParams,
            success: function (res) {
              // console.log(res,'resresresres')
              let seatsData = res.data.seats
              resolve(seatsData)
              _this.setData({
                trackingid:res.data.trackingid
              })
              if (seatsData && seatsData.length>0){
                    // 数据成功埋点
                    cwx.sendUbtByPage && cwx.sendUbtByPage.ubtTrace && cwx.sendUbtByPage.ubtTrace('marketadsdk_response_success', {data:JSON.stringify(seatsData)})
                    _this.triggerEvent('getAdData', seatsData, { bubbles: true, composed: true })
                    // 新增拓展回调字段，配合信息流
                    let callbackExtensionData = {adData: seatsData, extension: _this.data.callbackExtension }
                    _this.triggerEvent('getExtensionAdData', callbackExtensionData, { bubbles: true, composed: true })
              } else {
                // 数据请求为空
                cwx.sendUbtByPage &&  cwx.sendUbtByPage.ubtTrace && cwx.sendUbtByPage.ubtTrace('marketadsdk_response_failed', {data:JSON.stringify(requestParams)})
                _this.triggerEvent('getAdData',[], { bubbles: true, composed: true })
                let callbackExtensionData = {adData: [], extension: _this.data.callbackExtension }
                _this.triggerEvent('getExtensionAdData', callbackExtensionData, { bubbles: true, composed: true })
              }

            },
            fail: function (e) {
              reject(e)
              // 请求失败埋点
              cwx.sendUbtByPage &&  cwx.sendUbtByPage.ubtTrace && cwx.sendUbtByPage.ubtTrace('marketadsdk_response_error', {data:JSON.stringify(e)})
              _this.triggerEvent('getAdData',[], { bubbles: true, composed: true })
              let callbackExtensionData = {adData: [], extension: _this.data.callbackExtension }
              _this.triggerEvent('getExtensionAdData', callbackExtensionData, { bubbles: true, composed: true })
            }
          });
        }).catch(error=>{
          cwx.sendUbtByPage &&  cwx.sendUbtByPage.ubtTrace && cwx.sendUbtByPage.ubtTrace('marketadsdk_response_error', {data:JSON.stringify(error)})
        })
      })
    },
    // wx自定义广告高度，根据产品需求，放大广告内容有效区域，整体上移3%
    getWxCustomSDKHight(height){
      if(height.includes('%')) {
        const heightArr = height.split('%')
        let _height = Number(heightArr[0])+4.3
        return `${_height}%`
      }else{
        return `${height}px`
      }
    },
    // 设置广告数据
    setAdStatus(){
      this.getAdResultPromise().then(res=>{
        let adsData = res && res.length>0 && res[0]&& res[0].ads || []
        let {isuse, unionCode, sdkType, sdkGroupType} = isuseWechatAd(adsData.length>0?adsData[0]: {})
        // 使用wxSDK
        if(isuse && unionCode && adsData.length ==1) {
          let ubtDate = {sdkType,unionCode,width:this.data.width,height:this.data.height,impId:this.data.impId}
          let showAdCustomSDK = false
          if(sdkGroupType == 3) {
            showAdCustomSDK = true
          }
          this.setData({
              showTencentAd:true,
              showAdCustomSDK,
              tencentAdCode:unionCode,
              adStyle:`background:#fff;width:${ubtDate.width}${ubtDate.width.includes('%') ? '' : 'px'};height:${ubtDate.height}${ubtDate.height.includes('%') ? '' : 'px'};display: block; justify-content: center;align-items: center;overflow:hidden;position:relative;`,
              adCustomSDKStyle:`background:#fff;width:${ubtDate.width}${ubtDate.width.includes('%') ? '' : 'px'};height:${this.getWxCustomSDKHight(ubtDate.height)};overflow:hidden;position:relative;top:${ubtDate.height.includes('%')?'-4.3%':0}`
          })
          cwx.sendUbtByPage && cwx.sendUbtByPage.ubtTrace && cwx.sendUbtByPage.ubtTrace('mkt_adsdk_alliancesdk_request', JSON.stringify(ubtDate))
        }else if (adsData && adsData.length>0){
          let _adType = adsData.length>1?'MULTI-BANNER':'BANNER'
          let _adData = _adType=='MULTI-BANNER'?[]:{}
          let _tempData =  adsData[0]
          let impType = _tempData.impType
          if (_adType =='BANNER'){
            _adData = adsData[0]
            let _creativeMaterial = _adData.creativeMaterial
            // 总曝光和曝光埋点
            _creativeMaterial && _creativeMaterial.metricLogs.forEach(item => {
              if (item.key == '102839' || item.key =='102842') {
                cwx.sendUbtByPage && cwx.sendUbtByPage.ubtTrace && cwx.sendUbtByPage.ubtTrace(item.key, item.value)
              }
            })
            sendExposefn(_adData,'show','first')
          } else if (_adType == 'MULTI-BANNER') {
            _adData = adsData
            //第一帧曝光
            sendExposefn(_adData[0],'show','first')
          }
          // console.log(_tempData,"_adData_adData")
          // console.log(_tempData,_tempData.impType,"_tempData.impType")
          // console.log(cwx.wxSystemInfo, __global,'cwx.wxSystemInfo.screenWidth')
          this.setData({
            impType: impType,//广告位资源类型:1、横幅；2、插屏；3、信息流
            screenRatio: _tempData.screenRatio || 100,//仅仅针对插屏
            adType: _adType,//BANNER，VIDEO，MULTI-BANNER,NATIVE  
            adData: _adData,
            loadFlag:true,
            whObj:{
              crWidth:this.data.width,
              crHeight:this.data.height,
              screenHeight: cwx.wxSystemInfo.windowHeight,
              screenWidth: cwx.wxSystemInfo.windowWidth
            },
            showTencentAd:false,
            tencentAdCode:'',
            adStyle:''
          })
          // console.log(this.data.adData, "_adData_adDatastate")
        } else {
          // 其他类型的广告
          let extData = res && res.length>0 && res[0]&& res[0].exts || []
          if(extData.length>0){
            let sdkType = getArrayValue(extData, 'sdkType')
            if (sdkType == 2) {
                let unionCode = getArrayValue(extData, 'unionCode')
                let ubtDate = {sdkType,unionCode,width:this.data.width,height:this.data.height,impId:this.data.impId}
                this.setData({
                    showTencentAd:true,
                    tencentAdCode:unionCode,
                    adStyle:`background:#fff;width:${ubtDate.width}${ubtDate.width.includes('%') ? '' : 'px'};height:${ubtDate.height}${ubtDate.height.includes('%') ? '' : 'px'};display: flex; justify-content: center;align-items: center;overflow:hidden;`
                })
                cwx.sendUbtByPage && cwx.sendUbtByPage.ubtTrace && cwx.sendUbtByPage.ubtTrace('mkt_adsdk_alliancesdk_request', JSON.stringify(ubtDate))
            }
          }
          this.setData({
            impType: '1',//广告位资源类型:1、横幅；2、插屏；3、信息流
            screenRatio: 100,//仅仅针对插屏
            adType: 'BANNER',//BANNER，VIDEO，MULTI-BANNER,NATIVE
            adData: [],
            loadFlag:false,
            whObj:{}
          })
        }
      })
    }
  }
})
