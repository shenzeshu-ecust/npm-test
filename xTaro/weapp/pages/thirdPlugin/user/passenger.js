//maxCount:最多选择常旅的人数, 传0时候，不限制选择常旅条数
//choosedPassengers: 已经选择的常旅信息
//filterFunc: 用户选择一个常旅对象时候，会调用该函数，判断该旅客是否满足当前业务证件需求
//callbackFunc: 用户最终选择的常旅信息，通过该回掉函数返回
import { cwx } from '../../../cwx/cwx.js';
var Passenger={
  choosePassenger: function (callbackFunc, maxCount, choosedPassengers, filterFunc, displayitems){
    if (typeof callbackFunc !== 'function') {
      console.log('调用方式不正确, choosePassenger 的 callback 为必填项, 且为第一个参数!');
      return;
    }
    var page = cwx.getCurrentPage(),
      data = { maxCount, choosedPassengers, filterFunc, displayitems};

    page.navigateTo({
      url: "/pages/passenger/passengerlist",
      data: data,
      callback: callbackFunc.bind(page)
    });
  },
  sharePassenger: function (callbackFunc, c1, maxCount,displayitems) {
    if (typeof callbackFunc !== 'function') {
      console.log('调用方式不正确, sharePassenger 的 callback 为必填项, 且为第一个参数!');
      return;
    }
    if (typeof c1 !== 'string') {
      console.log('调用方式不正确, sharePassenger 的 c1 为必填项, 且为第二个参数!');
      return;
    }
    var page = cwx.getCurrentPage(),
      data = { c1,maxCount,displayitems };

    page.navigateTo({
      url: "/pages/passenger/shark/editpage/index",
      data: data,
      callback: callbackFunc.bind(page)
    });
  }
}

module.exports = Passenger;