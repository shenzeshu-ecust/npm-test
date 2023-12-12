const { cwx, _ } = require("../../../../cwx/cwx");

/*
 * @Chinese description: enter your description
 * @English description: enter your description
 * @Autor: lh_sun
 * @Date: 2022-04-07 15:44:52
 * @LastEditors: lh_sun
 * @LastEditTime: 2022-04-07 15:46:00
 */
var ret = {};
let paymentTraceId = ''

ret.isUrl = url => /https?:/.test(url);

/**
 * @description 生成sn
 * @returns {String} sn
 */
ret.CreateGuid  = function() {
  function S1() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(4);
  }

  function newGuid() {
    var guid = "";
    for (var i = 1; i <= 20; i++) {
      guid += S1();
      if (i === 8 || i === 12 || i === 16 || i === 20) {
        guid += "-";
      }
    }
    var num = parseInt(8 * Math.random());
    var date = new Date().getTime() + "";
    guid += date.slice(0, num);
    for (var j = 0; j < 4; j++) {
      guid += S1();
    }
    guid += date.slice(num + 5, 13);
    return guid;
  }
  return newGuid();
}

ret.getParam = (param, url)=>{
  if(!url) return null
    const paramStrArr = url.split('?');
    if(!paramStrArr.length){
        return null;
    }
    const paramStr = paramStrArr[1];
    const tempArray = paramStr.split('&');
    var tempObj = {};
    for (let i = 0; i < tempArray.length; i++) {
        let obj = tempArray[i];
        let innerTempArr = obj.split('=');
        tempObj[innerTempArr[0]] = innerTempArr[1];
    }
    if(tempObj[param]){
        return tempObj[param];
    }else{
        return null;
    }

};

ret.queryToParam = function (query) {
  const params = {};
  const arr = query.split('&');
  let key, value;
  for (var i = 0; i < arr.length; i++) {
      [key = '', value = ''] = arr[i].split('=');
      // 给对象赋值
      params[key] = value;
  }
  return params;
}

const serialize = function(obj) {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}

ret.addParamToUrl = (url, param)=> {
  if(_.isObject(param)){
    param = serialize(param)
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


ret.appendQuery = function (url, query) {
    var urlquery = (url + '&' + query) || '';
    return urlquery.replace(/[&?]{1,2}/, '?');
};

ret.pageQueryStr = function(data){
	return Object.keys(data).map(function (key) {
		let v = encodeURIComponent(data[key]);
		if(v === 'undefined'){
			v = ''
		}
        return encodeURIComponent(key) + "=" + v;
    }).join("&");
};

ret.transNumToFixedArray= function (num, maxlength) {
    num = num + '';
    if (!num) {
        return '';
    }
    //判断num是否是数字字符串
    var reg = /^\d*\.*\d+$/;
    if (!reg.test(num)) {
        return num;
    }
    maxlength = maxlength || 2;

    var array = num.split('.');
    var hzStr = '';
    var curlength = 0;
    if (array.length > 1) {
        curlength = array[1].length;
        hzStr = array[1];
    }

    for (var i = 0; i < (maxlength - curlength) ; i++) {
        hzStr += '0';
    }
    array[1] = hzStr;
    return array;
}

ret.dateFormat = function(fmt, date) {
    let regArr;
    const opt = {
        "Y+": date.getFullYear().toString(),
        "m+": (date.getMonth() + 1).toString(),
        "d+": date.getDate().toString(),
        "H+": date.getHours().toString(),
        "M+": date.getMinutes().toString(),
        "S+": date.getSeconds().toString()
    };
    for (let k in opt) {
        regArr = new RegExp("(" + k + ")").exec(fmt);
        if (regArr) {
            fmt = fmt.replace(regArr[1], (regArr[1].length == 1) ? (opt[k]) : (opt[k].padStart(regArr[1].length, "0")))
        }
    }
    return fmt;
}

ret.checkIDCard = function (idCard) {
    if (!idCard || typeof (idCard) != 'string') return false
    idCard = idCard.replace(/\s/g, '')
    if (idCard.length != 15 && idCard.length != 18
        || !idCard.match(/^[0-9]{15}$/) && !idCard.match(/^[0-9]{17}[0-9xX]$/)) {
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
            var idCardMod = idCardWiSum % 11;//计算出校验码所在数组的位置  
            var idCardLast = idCard.substring(17);//得到最后一位身份证号码  
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
}

ret.openWebview = (data)=>{
  data.url = encodeURIComponent(data.url)
  cwx.component.cwebview({
      data: {
          needLogin: true,
          isNavigate: false,
          ...data,
      }
  })
}


//获取唯一id
ret.getUniid = () => {
  let d = new Date().getTime();
  const traceid = 'xxxxxxxx-xxxx-2xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      // eslint-disable-next-line no-bitwise
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      // eslint-disable-next-line no-bitwise
      return (c == 'x' ? r : (r & 0x7) | 0x8).toString(16);
  });
  return traceid;
};

ret.getPaymentTraceId = ()=>{
  return paymentTraceId
}

ret.createPaymentTraceId = ()=>{
  paymentTraceId = ret.getUniid()
  return paymentTraceId
}

ret.getOrCreatePaymentTraceId = ()=>{
  paymentTraceId =  paymentTraceId || ret.getUniid()
  return paymentTraceId
}

ret.setPaymentTraceId = (id)=>{
  paymentTraceId = id
}

ret.clearPaymentTraceId = ()=>{
  paymentTraceId = ''
}


module.exports = ret;