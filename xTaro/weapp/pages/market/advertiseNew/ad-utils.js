import { cwx } from "../../../cwx/cwx.js";
// 裁剪核心逻辑
export function mainClipfn(whObj, fwObj, screenRatio =100){
  // console.log( whObj,fwObj)
  let scaleRadio = 1, swiperStyle = '', wraperStyle = '', _transformY = 0, _transformX = 0, innerscaleRatio =1
  if(whObj.crWidth.indexOf('%')!=-1 && whObj.crHeight.indexOf('%')!=-1){
    wraperStyle = `width:${whObj.crWidth};height:${whObj.crHeight};overflow:hidden;position:relative;` 
    swiperStyle = `width:${whObj.crWidth};height:${whObj.crHeight};overflow:hidden;transform:translateY(0);transform-origin:0 0;`
  } else {
    if (whObj.crWidth && whObj.crHeight) {
      if (whObj.crWidth >= whObj.screenWidth) {
        scaleRadio = whObj.screenWidth / whObj.crWidth
      }
      // 外层样式
      wraperStyle = `width:${whObj.crWidth * scaleRadio}px;height:${whObj.crHeight * scaleRadio}px;overflow:hidden;position:relative;` 
      // 内层样式
      innerscaleRatio = whObj.crWidth / fwObj.fwWidth
      let _fwHeight = fwObj.fwHeight * innerscaleRatio
      if (whObj.crHeight <= _fwHeight){
        _transformY = (_fwHeight - whObj.crHeight) / innerscaleRatio
        swiperStyle = `width:${fwObj.fwWidth * innerscaleRatio}px;height:${fwObj.fwHeight * innerscaleRatio}px;overflow:hidden;transform:translateY(-${parseInt(_transformY * innerscaleRatio)}px);transform-origin:0 0;`
      } else {
        let _fwHeight = fwObj.fwHeight * scaleRadio
        let lsScale = whObj.crHeight * scaleRadio / _fwHeight
        let _fwWidth = fwObj.fwWidth * lsScale * scaleRadio
        let _crWidth = whObj.crWidth * scaleRadio
        _transformX = ((_fwWidth - _crWidth) / 2) / lsScale / scaleRadio
        swiperStyle = `width:${fwObj.fwWidth * innerscaleRatio}px;height:${fwObj.fwHeight * innerscaleRatio}px;overflow:hidden;transform:translateX(-${parseInt(_transformX * innerscaleRatio)}px);transform-origin:0 0;`
      }
    } else {
      // 没有传入宽高，默认取服务端宽高第一条
      if (fwObj.fwWidth >= whObj.screenWidth) {
        if (screenRatio){
          scaleRadio = whObj.screenWidth * (screenRatio/100) / fwObj.fwWidth
          innerscaleRatio = scaleRadio
        } else {
          scaleRadio = whObj.screenWidth / fwObj.fwWidth
        }
     
      }
      swiperStyle = `width:${fwObj.fwWidth * scaleRadio}px;height:${fwObj.fwHeight * scaleRadio}px;overflow:hidden;`
    }
  }
  
  return {
    scaleRadio: innerscaleRatio,
    swiperStyle: swiperStyle,
    wraperStyle: wraperStyle,
    _transformY: _transformY,
    _transformX: _transformX
  }
}
// 替换时间戳函数
function replaceTsFn(url) {
  let nowTs = new Date().getTime()
  if (url.indexOf('__TS__') != -1 || url.indexOf('{{TS}}') != -1) {
    url = url.replace('__TS__', nowTs)
    url = url.replace('{{TS}}', nowTs)
    return url
  } else {
    return url
  }
}

// 替换领券成功与否宏
function replaceMacroFn(url,type,data) {
  if (url.indexOf(type) != -1) {
    url = url.replace(type, data)
    return url
  } else {
    return url
  }
}


function sendExposeByurl(sendUrl,type){
  sendUrl = replaceTsFn(sendUrl)
  let logItem = {
    data:{
      data: sendUrl,
      event: type,
      type:'min_app'
    }
  }
  try{
    cwx.request({
      url: sendUrl,
			header: {
				'Content-Type': 'image/gif' //image/gif | application/x-tgif
			},
			method: 'GET',
      dataType: 'image',
      notAddDataHead: true,
      success: function (res) {
        logItem.success = JSON.stringify(res)
        cwx.sendUbtByPage.ubtTrace && cwx.sendUbtByPage.ubtTrace('129055', logItem)
      },
      fail: function (e) {
        logItem.error = JSON.stringify(e)
        // 请求失败埋点
        cwx.sendUbtByPage.ubtTrace && cwx.sendUbtByPage.ubtTrace('129056', logItem)
      }
    })
  } catch(err){
    logItem.error = JSON.stringify(err) +'catch error'
    // 请求失败埋点
    cwx.sendUbtByPage.ubtTrace && cwx.sendUbtByPage.ubtTrace('129056', logItem)
  }

}

// 客户端曝光链接监测发送
export function sendExposefn(pvObj, type,times) {
  if(!pvObj.creativeMaterial || pvObj.creativeMaterial && !pvObj.creativeMaterial.impTrackingUrls){
    return false
  }
  let impTrack = pvObj.creativeMaterial.impTrackingUrls
  let clickTrack =pvObj.creativeMaterial.clickTrackingUrls
  let clickEffective = 1
  const {linkUrl} = pvObj.creativeMaterial
  if (!linkUrl) {
    clickEffective = 0
  }

  if(type =='show'){
    if(impTrack && impTrack.length>0){
      for (let i = 0; i < impTrack.length; i++) {
        (function(j){
            setTimeout(function(){
                sendExposeByurl(`${j}&firstImp=${(!times || times=='first')?1:0 }`,type)
            },10*i);
        })(impTrack[i]);
    }
    }
  }
  if(type =='click'){
    if(clickTrack && clickTrack.length>0){
      clickTrack.forEach(item=>{
        sendExposeByurl(`${item}&clickEffective=${clickEffective}`,type)
      })
    }
  }
}


export function sendComponentClick(trackingExtras,type,macro){
  if(!trackingExtras || trackingExtras && trackingExtras.length ==0){
    return false
  }
  trackingExtras.forEach(item=>{
    if(item.trackingEvent ==type){
      item.trackingUrls.forEach(itm=>{
        if(type=='componentClick'){
          itm = replaceMacroFn(itm,'__RESULT__',macro)
        }
        sendExposeByurl(itm,type)
        // console.log(itm,'exposedataurl')
      })
    }
  })

}
export function isJSON(str) {
  if (typeof str == 'string') {
    try {
      var obj = JSON.parse(str)
      if (typeof obj == 'object' && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
}


export function getArrayValue (data, type) {
  if (!data || data.length == 0) {
    return false
  }
  let value = ''
  data.forEach(item => {
    if (item.name == type) {
      value = item.value
    }
  })
  return value
}

/**
 * 判断是否使用wxSDK
 */
export function isuseWechatAd(adsData) {
    if (adsData && adsData.exts) {
        let unionCreativeMaterial = getArrayValue(adsData.exts, 'unionCreativeMaterial')
        if (unionCreativeMaterial && isJSON(unionCreativeMaterial)) {
          let unionMateriallist = JSON.parse(unionCreativeMaterial).unionMaterialList
          if (unionMateriallist && unionMateriallist.length > 0) {
            let unionCode = unionMateriallist[0].unionCode
            let sdkType = unionMateriallist[0].sdkType
            let sdkGroupType = unionMateriallist[0].sdkGroupType
              return { isuse: true, unionCode, sdkType, sdkGroupType }
          } else {
            return { isuse: false }
          }
        } else {
          return { isuse: false }
        }
      } else {
        return { isuse: false }
     }
}