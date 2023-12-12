var passengerUtils ={
  store: {}
};

  //验证身份证
passengerUtils.identityCodeValid= function(code) {
  var city = { 11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江 ", 31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北 ", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏 ", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外 " };
  var pass = true;
  if (!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)) {
    pass = false;
  } else if (!city[code.substr(0, 2)]) {
    pass = false;
  } else {
    //18位身份证需要验证最后一位校验位
    if (code.length == 18) {
      code = code.split('');
      //∑(ai×Wi)(mod 11)
      //加权因子
      var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
      //校验位
      var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
      var sum = 0;
      var ai = 0;
      var wi = 0;
      for (var i = 0; i < 17; i++) {
        ai = code[i];
        wi = factor[i];
        sum += ai * wi;
      }
      var last = parity[sum % 11];
      if (parity[sum % 11] != code[17]) {
        pass = false;
      }
    }
  }
  return pass;
};
//根据身份证获取出生日期
passengerUtils.getBirthday=function(idCard) {
  if (idCard.length == 18) {
    var birth = idCard.slice(6, 14);
    //18位：提取第17位数字；15位：提取最后一位数字
    var order = idCard.slice(-2, -1);
    var b = ([birth.slice(0, 4), birth.slice(4, 6), birth.slice(-2)]).join('-');
    return b;
  } else {
    var birth = idCard.slice(6, 12);
    //18位：提取第17位数字；15位：提取最后一位数字
    var order = idCard.slice(-1);
    var b = (['19' + birth.slice(0, 2), birth.slice(2, 4), birth.slice(-2)].join('-'));
    return b;
  }
};
//根据身份证获取性别
passengerUtils.getGender=function(idCard) {
  var birth = (idCard.length == 18) ? idCard.slice(6, 14) : idCard.slice(6, 12);
  //18位：提取第17位数字；15位：提取最后一位数字
  var order = (idCard.length == 18) ? idCard.slice(-2, -1) : idCard.slice(-1);
  //余数为0代表女性，不为0代表男性
  var sex = (order % 2 === 0 ? 'F' : 'M');
  return sex;
};
//时期转换
passengerUtils.formatDate= function (date) {
  var d = "";
  if (date != "") {
    var birthDay = new Date(date.replace(/-/g, "/"));
    var month = birthDay ? birthDay.getMonth() + 1 : undefined, date = birthDay ? birthDay.getDate() : undefined;
    month = month < 10 ? "0" + month : month;
    date = date < 10 ? "0" + date : date;
    d = birthDay.getFullYear() + "-" + month + "-" + date;
    if (birthDay == "1-01-01") {
      d = "";
    }
  }
  return d;
};
//错误提示显示
passengerUtils.modalWarnShow = function (cwx,msg, btnText) {
  var btext = btnText ? btnText : "确定";
  cwx.showModal({
    title: '提示',
    content: msg,
    confirmText: btext,
    showCancel: false,
    success: function (res) {
      if (res.confirm == 1) { }
    }
  })
};
/*
*获取Cookie
*/
passengerUtils.getPassengerStorage = function (cwx, key, validTime) {
  try {
    if (validTime == null){
      validTime = 24 * 60 * 60 * 1000;
    }else{
      validTime = validTime *= 60 * 60 * 1000;
    }
  } catch (e) { }
  var store = passengerUtils.store[key];  
  if (store){
    if ((+new Date()) - store.d > validTime) {
      passengerUtils.store[key] = {
        v: null,
        d: null
      }
      return null;
    } else {
      try{
        var stroelen = JSON.parse(store.v).items.length;
        if (stroelen >= 10) {
          return 1;
        } else {
          return null;
        }
      }catch(e){}      
    }
  }
  return null;
};
passengerUtils.setPassengerStorage = function (cwx,key, value) {
  var days = 1;
  var exp = new Date();
  exp.setTime(exp.getTime() + days * 24 * 60 * 60 * 1000);
  try {
    value = JSON.stringify(value);
  } catch (e) { }

  passengerUtils.store[key] = {
    v: value,
    d: +(new Date())
  }
};
passengerUtils.showLoading = function (cwx) {
  cwx.showToast({
    title: '加载中...',
    icon: 'loading',
    duration: 10000
  })
};
passengerUtils.hideLoading=function (cwx) {
    cwx.hideToast()
};
/**
* 扩展对象
* @param  {[type]} obj1 [description]
* @param  {[type]} obj2 [description]
* @return {[type]}      [description]
*/
passengerUtils.extendObj=function (obj1, obj2) {
  try {
    for (var prop in obj2) {
      obj1[prop] = obj2[prop];
    }
  } catch (err) { }

  return obj1;
},
module.exports = passengerUtils;