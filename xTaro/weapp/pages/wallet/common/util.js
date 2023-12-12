import {
  cwx,
  _
} from '../../../cwx/cwx'
let ubtCount = 0

var util = {
  //EN setting idcard format and val
  //CN 设置身份证号6位与8位分割
  idCardEvent: function (val = '') {
    return val.replace(/\s/g, '')
      .replace(/(\S{6})(?=\S)/i, '$1 ')
      .replace(/(\S{8})(?=\S)/i, '$1 ');
  },
  //显示loading
  showLoading: function (c) {
    if (wx.showLoading) {
      return wx.showLoading({
        title: c || '正在加载...',
        mask: true
      })
    }
  },
  //隐藏loading
  hideLoading: function () {
    if (wx.hideLoading) {
      return wx.hideLoading()
    }
    cwx.hideToast()
  },
  showToast: function (msg, icon = 'none', callBack) {
    var msg = msg || "网络异常，请稍后再试";
    wx.showToast({
      title: msg,
      icon: icon,
      duration: 2000,
      success: function () {
        if (callBack) {
          callBack();
        }
      }
    })
  },
  showModal: function (str, callBack = () => {}) {
    cwx.showModal({
      title: '提示',
      content: str || '',
      confirmText: '确定',
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          return callBack();
        }
      }
    })
  },
  ubtTrace(code, ubtdata, isDevTrace = false) {
    this.sendUbt({
      code,
      ...ubtdata
    }, isDevTrace)
  },
  sendUbt: function (ubtdata, isDevTrace = false) {
    console.log('sendUbt', ubtdata)
    var mPage = cwx.getCurrentPage(),
      cTime = new Date().toLocaleString(),
      devicemode = '';
    try {
      devicemode = cwx.util.systemInfo || {};
      ubtdata.devicemode = devicemode.model || '';
      ubtdata.devicesystem = devicemode.system || '';
      ubtdata.version = devicemode.version || '';
      ubtdata.ubtCount = ++ubtCount
      ubtdata.sdkv = devicemode.SDKVersion || '';
    } catch (e) {}
    if (mPage && mPage.ubtTrace && _.isObject(ubtdata)) {
      mPage.pageId && (ubtdata.pageId = mPage.pageId);
      ubtdata.time = cTime;

      if (isDevTrace) {

        mPage.ubtDevTrace(ubtdata.code, JSON.stringify(ubtdata));
      } else {
        mPage.ubtTrace(ubtdata.code || 129944, JSON.stringify(ubtdata));
      }

      cwx.payment.traceNo++;
    }
  },
  throttle: function (func, wait, options) {
    var timeout, context, args, result;
    var previous = 0;
    if (!options) options = {};

    var later = function () {
      previous = options.leading === false ? 0 : new Date().getTime();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };

    var throttled = function () {
      var _now = new Date().getTime();
      if (!previous && options.leading === false) previous = _now;
      var remaining = wait - (_now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = _now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };

    throttled.cancel = function () {
      clearTimeout(timeout);
      previous = 0;
      timeout = context = args = null;
    };

    return throttled;
  },
  checkIDCard: function (idCard) {
    if (!idCard || typeof (idCard) != 'string') return false
    idCard = idCard.replace(/\s/g, '')
    if (idCard.length != 15 && idCard.length != 18 ||
      !idCard.match(/^[0-9]{15}$/) && !idCard.match(/^[0-9]{17}[0-9xX]$/) ||
      "111111111111111" == idCard) {
      return false;
    }
    //15位和18位身份证号码的正则表达式  
    var regIdCard = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
    //如果通过该验证，说明身份证格式正确，但准确性还需计算  
    if (regIdCard.test(idCard)) {
      if (idCard.length == 18) {
        var idCardWi = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2); //将前17位加权因子保存在数组里  
        var idCardY = new Array(1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2); //这是除以11后，可能产生的11位余数、验证码，也保存成数组  
        var idCardWiSum = 0; //用来保存前17位各自乖以加权因子后的总和  
        for (var i = 0; i < 17; i++) {
          idCardWiSum += idCard.substring(i, i + 1) * idCardWi[i];
        }
        var idCardMod = idCardWiSum % 11; //计算出校验码所在数组的位置  
        var idCardLast = idCard.substring(17); //得到最后一位身份证号码  
        //如果等于2，则说明校验码是10，身份证号码最后一位应该是X  
        if (idCardMod == 2) {
          if (idCardLast == "X" || idCardLast == "x") {
            return true;
            //alert("恭喜通过验证啦！");  
          } else {
            return false;
            //alert("身份证号码错误！");  
          }
        } else {
          //用计算出的验证码与最后一位身份证号码匹配，如果一致，说明通过，否则是无效的身份证号码  
          if (idCardLast == idCardY[idCardMod]) {
            //alert("恭喜通过验证啦！");  
            return true;
          } else {
            return false;
            //alert("身份证号码错误！");  
          }
        }
      }
    } else {
      //alert("身份证格式不正确!");  
      return false;
    }
  },
  serialize: function (obj) {
    var str = [];
    for (var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  },
  addParamToUrl: function (url, param) {
    if (_.isObject(param)) {
      param = this.serialize(param)
    }
    if (!url.includes("?")) {
      url = `${url}?${param}`;
    } else if (url.slice() !== "&") {
      url = `${url}&${param}`;
    } else {
      url = `${url}${param}`;
    }
    return url;
  }

}

export {
  util
};