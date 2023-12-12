import { cwx } from '../../../../cwx/cwx.js';
import dateUtil from '../utils/dateUtils.js'
import CtsConstant from '../../utils/CtsConstant.js'

function handleCardSource(cardList) {
    let list = cardList || [];
    let lastDate = '';
    let result = [];
    list.map((item, index) => {
      let needAdd = true;
      item.smartTripId = item.jsSmartTripId;
      switch (item.cardType) {
        case CtsConstant.SUBBIZTYPE.CardSubBizType_FLIGHT_INLAND:
        case CtsConstant.SUBBIZTYPE.CardSubBizType_FLIGHT_GLOBAL:
        case CtsConstant.SUBBIZTYPE.CardSubBizType_FLIGHT_HOTEL_INLAND_FIGHT:
        case CtsConstant.SUBBIZTYPE.CardSubBizType_FLIGHT_HOTEL_OVERSEA_FIGHT:
          {
            if (item.flightCard && item.flightCard.orderStatusName === '处理中') {
              needAdd = false;
            }
            item.orderId = item.flightCard.orderId;
            item.orderStatusName = item.flightCard.orderStatusName;
            break;
          }
        case CtsConstant.SUBBIZTYPE.CardSubBizType_TRAIN_FLIGHT_OVERSEA: //机火
        case CtsConstant.SUBBIZTYPE.CardSubBizType_TRAIN_FLIGHT_INLAND:
          {
            needAdd = false;
            item.orderId = item.trainCard.orderId;
            item.orderStatusName = item.trainCard.orderStatusName;
            break;
          }
        case CtsConstant.SUBBIZTYPE.CardSubBizType_TRAIN: //火车
        case CtsConstant.SUBBIZTYPE.CardSubBizType_TRAIN_OVERSEA:
          {
            if (item.trainCard && item.trainCard.orderStatusName === '待付款') {
              needAdd = false;
            }
            item.orderId = item.trainCard.orderId;
            item.orderStatusName = item.trainCard.orderStatusName;
            break;
          }
        case CtsConstant.SUBBIZTYPE.CardSubBizType_BUS:
        // case CtsConstant.SUBBIZTYPE.CardSubBizType_TRAVEL_BUS:
          { //汽车票
            if (item.busCard && item.busCard.orderStatusName === '待支付') {
              needAdd = false;
            }
            item.orderId = item.busCard.orderId;
            item.orderStatusName = item.busCard.orderStatusName;
            break;
          }
        case CtsConstant.SUBBIZTYPE.CardSubBizType_CAR_AIRPORT_PICKUP:
        case CtsConstant.SUBBIZTYPE.CardSubBizType_CAR_AIRPORT_DROPOFF:
        case CtsConstant.SUBBIZTYPE.CardSubBizType_CAR_AIRPORT_PICKUP_OVERSEA:
        case CtsConstant.SUBBIZTYPE.CardSubBizType_CAR_AIRPORT_DROPOFF_OVERSEA: //接送机
        case CtsConstant.SUBBIZTYPE.CardSubBizType_CAR_RENTAL:
        case CtsConstant.SUBBIZTYPE.CardSubBizType_CAR_AIRPORT_CHARTER_OVERSEA: //包车
        case CtsConstant.SUBBIZTYPE.CardSubBizType_CAR_Call_TAXI:
          { //马上叫车:
            if (item.carCard && (item.carCard.orderStatusName === '待支付' || item.carCard.orderStatusName === '已取消')) {
              needAdd = false;
            }
            item.orderId = item.carCard.orderId;
            item.orderStatusName = item.carCard.orderStatusName;
            break;
          }
        case CtsConstant.SUBBIZTYPE.CardSubBizType_CAR_SELFDRIVE_INLAND:
        case CtsConstant.SUBBIZTYPE.CardSubBizType_CAR_SELFDRIVE_OVERSEA:
          { //自驾
            if (item.selfDrivingCard && (item.selfDrivingCard.orderStatusName === '待支付' || item.selfDrivingCard.orderStatusName === '已取消')) {
              needAdd = false;
            }
            item.orderId = item.selfDrivingCard.orderId;
            item.orderStatusName = item.selfDrivingCard.orderStatusName;
            break;
          }

        case CtsConstant.SUBBIZTYPE.CardSubBizType_POI_FOOD: //POI 餐饮
        case CtsConstant.SUBBIZTYPE.CardSubBizType_POI_SHOPPING: //POI 购物
        case CtsConstant.SUBBIZTYPE.CardSubBizType_POI_ENTERTAINMENT: //POI 娱乐
        case CtsConstant.SUBBIZTYPE.CardSubBizType_POI_VIEWSPOT: //POI 景点
        case CtsConstant.SUBBIZTYPE.CardSubBizType_POI_DAYTOUR_LINE:
        case CtsConstant.SUBBIZTYPE.CardSubBizType_POI_HOTEL_VIEWSPOT:
        case CtsConstant.SUBBIZTYPE.CardSubBizType_POI_HOTEL_ENTERTAINMENT:
        case CtsConstant.SUBBIZTYPE.CardSubBizType_POI_HOTEL_SHOPPING:
        case CtsConstant.SUBBIZTYPE.CardSubBizType_POI_HOTEL_FOOD:
        case CtsConstant.SUBBIZTYPE.CardSubBizType_DAYTOUR_SELECTTION:
        case CtsConstant.SUBBIZTYPE.CardSubBizType_TRAVEL_PLAN:
          {
            if (item.ticketCard && item.ticketCard.orderStatusName === '待付款') {
              needAdd = false;
            }
            item.orderId = item.ticketCard.orderId;
            item.orderStatusName = item.ticketCard.orderStatusName;
            break;
          }
      }
      item.canDelete = true;
      item.optionViewWidth = 160;
      if (needAdd) {
        item.isShowTime = !dateUtil.isSameDate(lastDate, item.timePoint);
        lastDate = item.timePoint;
        item.positionId = "position-" + item.smartTripId;
        result.push(item);
      }
    })
    return result;
  }
//列表服务
export const scheduleListSearch = function(parameter) {
  cwx.request({
    url: '/restapi/soa2/14912/json/ScheduleListSearch',
    data: {
      clientTimeZone: dateUtil.fetchPhoneTimeZone(),
      locatedCityId: parameter.cityId,
      selectors: [
        "RefreshFlag.Flight", //机票（不包含机酒）
        "RefreshFlag.Hotel", //酒店（不包含景酒，机酒）
        "RefreshFlag.Train", //火车票
        "RefreshFlag.POI", //门票
        "RefreshFlag.Bus", //汽车票
        "RefreshFlag.SelfDriving", //自驾
        "RefreshFlag.InlandCar", //国内用车
        "RefreshFlag.OutlandCar", // 海外用车
        "RefreshFlag.Bnb", // 民宿
        "Feature",
        "RefreshFlag.Ship", // 船票
      ],
    },
    success: function(res) {
      if (res.statusCode === 200 && res.data && res.data.result === 0) {
        if (!cwx.schedule) {
          cwx.schedule = {};
        }
        cwx.schedule.timelineToken = res.data.token;
        console.log('list data::::::', res.data);
        res.data.cardList = handleCardSource(res.data.cardList);
        parameter.callback(true, res.data);
      } else {
        parameter.callback(false);
      }
    },
    fail: function(error) {
      parameter.callback(false);
    }
  })
}

//我的行程服务
export const getTravelPlanInfo = function(parameter) {
  cwx.request({
    url: '/restapi/soa2/14912/json/GetTravelPlanInfo',
    data: {
      requestType: 0
    },
    success: function(res) {
      if (res.statusCode === 200 && res.data && res.data.result === 0) {
        parameter.callback(true, res.data);
      } else {
        parameter.callback(false);
      }
    },
    fail: function(error) {
      parameter.callback(false);
    }
  })
}

export const getActivityInformationRequest = function(version) {
  return new Promise(function(resolve, reject) {
    cwx.request({
      url: '/restapi/soa2/14912/json/GetActivityInformation',
      data: {
        version: version || null,
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.result === 0 && res.data.activity) {
          resolve(res.data.activity);
        } else {
          resolve(null);
        }
      },
      fail: (err) => {
        resolve(null);
      }
    });
  })
}

export const deleteCard = function(param) {
  let smartTripId = param.smartTripId;
  return new Promise(function(resolve, reject) {
    if (smartTripId && smartTripId > 0) {
      cwx.request({
        url: '/restapi/soa2/14912/json/DeleteSmartTrip',
        data: {
          head: {
            cver: '',
            extension: [{
              // 'uid': cwx.
            }]
          },
          smartTripId: smartTripId,
          type: 0,
          clientTimeZone: dateUtil.fetchPhoneTimeZone(),
          token: cwx.schedule.timelineToken,
          locationCityId: param.locationCityId
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data && res.data.result === 0) {
            resolve(res.data);
          } else {
            reject('DeleteSmartTrip接口报错');
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    } else {
      reject('DeleteSmartTrip接口报错');
    }
  })
}