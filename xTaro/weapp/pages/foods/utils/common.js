import cwx from '../../../cwx/cwx.js'


function getRealNameStatus() {
  return new Promise(function (resolve, reject) {
    cwx.request({
      url: `/restapi/soa2/15416/json/isUserRealName`,
      success: (res) => {
        if (res.statusCode == 200 && res.data && res.data.ResponseStatus.Ack === "Success") {
          resolve(res.data.isRealName);
        } else {
          reject("getRealNameStatus接口错误")
        }
      }
    });
  });
}

function getCityId() {
  return new Promise((resolve, reject) => {
    cwx.locate.startGetCtripCity(function (info) {
      if (info.data && info.data.ResponseStatus && info.data.ResponseStatus.Ack === "Success") {
        resolve(info.data);
      } else {
        resolve({ noLocation: true })
      }
    },"food-wechatmini")
  })
}

function systemInfo() {
  let statusBarHeight
  return new Promise((resolve, reject) => {
    wx.getSystemInfo({
      success: (res) => {
        resolve({ systemInfo: res })
      },
      fail: (res) => {
        console.log(res)
      }
    })
  })
}

//节流
const throttle = (func, wait) => {
  let prev = 0;
  return function () {
    let args = arguments,
      now = new Date().getTime();
    if (now - prev >= wait) {
      prev = new Date().getTime()
      func.apply(this, args)
    }
  }
}
//收藏与检查页面是否收藏
const checkIsFavorite = (id) => {
  return new Promise((resolve, reject) => {
    cwx.request({
      data: {
        pageId: id
      },
      url: `/restapi/soa2/14248/json/isFavoriteSpecialFoodPage`,
      success: (res) => {
        if (res.statusCode == 200 && res.data && res.data.ResponseStatus.Ack === "Success") {
          resolve(res.data);
        } else {
          reject("getisFavoriteSpecialFoodPage接口错误")
        }
      }
    })
  })
}
const toggleFavorite = ({ ...datas }) => {
  console.log(datas)
  return new Promise((resolve, reject) => {
    cwx.request({
      data: {
        pageId: datas.id,
        favorite: datas.isFav
      },
      url: `/restapi/soa2/14248/json/favoriteSpecialFoodPage`,
      success: (res) => {
        if (res.statusCode == 200 && res.data && res.data.ResponseStatus.Ack === "Success") {
          resolve(res.data);
        } else {
          reject("getFavoriteSpecialFoodPage接口错误")
        }
      }
    })
  })
}
//收藏单个餐馆
const checkIsFavoriteRes = (id, collectionType) => {
  return new Promise((resolve, reject) => {
    cwx.request({
      data: {
        RestaurantId: id,
        CollectionType: collectionType
      },
      url: `/restapi/soa2/10332/json/queryisfavoritedv618`,
      success: (res) => {
        if (res.statusCode == 200 && res.data && res.data.ResponseStatus.Ack === "Success") {
          resolve(res.data);
        } else {
          reject("queryisfavoritedv618出错")
        }
      }
    })
  })
}
const addFavoriteRes = (id, collectionType) => {
  return new Promise((resolve, reject) => {
    cwx.request({
      data: {
        RestaurantId: id,
        CollectionType: collectionType
      },
      url: `/restapi/soa2/10332/json/addFavouriteV618`,
      success: (res) => {
        if (res.statusCode == 200 && res.data && res.data.ResponseStatus.Ack === "Success") {
          resolve(res.data);
        } else {
          reject("addFavouriteV618")
        }
      }
    })
  })
}
const cancelFavoriteRes = (id, collectionType) => {
  return new Promise((resolve, reject) => {
    cwx.request({
      data: {
        RestaurantId: id,
        CollectionType: collectionType
      },
      url: `/restapi/soa2/10332/json/cancelFavouriteV618`,
      success: (res) => {
        if (res.statusCode == 200 && res.data && res.data.ResponseStatus.Ack === "Success") {
          resolve(res.data);
        } else {
          reject("cancelFavouriteV618")
        }
      }
    })
  })
}

function base64Encode(str) { // 编码，配合encodeURIComponent使用
  let c1, c2, c3;
  let base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let i = 0, len = str.length, strin = '';
  while (i < len) {
    c1 = str.charCodeAt(i++) & 0xff;
    if (i == len) {
      strin += base64EncodeChars.charAt(c1 >> 2);
      strin += base64EncodeChars.charAt((c1 & 0x3) << 4);
      strin += "==";
      break;
    }
    c2 = str.charCodeAt(i++);
    if (i == len) {
      strin += base64EncodeChars.charAt(c1 >> 2);
      strin += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
      strin += base64EncodeChars.charAt((c2 & 0xF) << 2);
      strin += "=";
      break;
    }
    c3 = str.charCodeAt(i++);
    strin += base64EncodeChars.charAt(c1 >> 2);
    strin += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
    strin += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
    strin += base64EncodeChars.charAt(c3 & 0x3F)
  }
  return strin
}
function webviewHomeConfig() {
  let url, param, urlconfig;
  if (__global.env.toLowerCase() === 'uat') {
    url = 'http://m.uat.qa.nt.ctripcorp.com/webapp/you/paipai/home?isMini=2&disable_redirect_https=1';
  } else {
    url = 'https://m.ctrip.com/webapp/you/livestream/paipai/home.html?isMini=2';
  }
  param = {
    url: encodeURIComponent(url),
    needLogin: false,
    isNavigate: true
  }
  urlconfig = JSON.stringify(param);
  return urlconfig;
}
function getQueryString(url, name) { //获取url里的参数

  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  var url_index = url.indexOf("?");
  var new_url = url.substr(url_index);
  var r = new_url.substr(1).match(reg); //匹配目标参数
  if (r != null) return decodeURI(r[2]);
  return; //返回参数值
}

export {
  getRealNameStatus,
  getCityId,
  systemInfo,
  throttle,
  checkIsFavorite,
  toggleFavorite,
  checkIsFavoriteRes,
  addFavoriteRes,
  cancelFavoriteRes,
  base64Encode,
  webviewHomeConfig,
  getQueryString
}