import CtsConstant from "./utils/CtsConstant.js";
import { cwx } from "../../cwx/cwx.js";
let ubt = cwx.sendUbtByPage;
//删除卡片埋点
export const deleteCardAC = function(cardType) {

  let actionCode = "";
  if (cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_FLIGHT_INLAND || cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_FLIGHT_GLOBAL) { //机票
    actionCode = "c_flight_delete";
  } else if (cardType === CtsConstant.SUBBIZTYPE.CardSubBizType_HOTEL_INLAND ||
    cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_HOTEL_OVERSEA ||
    cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_HOTEL_POI_INLAND ||
    cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_HOTEL_POI_OVERSEA ||
    cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_FLIGHT_HOTEL_INLAND_HOTEL ||
    cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_FLIGHT_HOTEL_OVERSEA_HOTEL) { //酒店
    actionCode = "c_hotel_delete";
  } else if (cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_TRAIN ||
    cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_TRAIN_FLIGHT_INLAND ||
    cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_TRAIN_FLIGHT_OVERSEA ||
    cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_TRAIN_OVERSEA) { //火车
    actionCode = "c_train_delete";
  } else if (cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_BUS) { //汽车
    actionCode = "c_bus_delete";
  } else if (cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_POI_VIEWSPOT || cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_POI_HOTEL_VIEWSPOT) { //poi
    actionCode = "c_poi_delete";
  } else if (cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_POI_SHOPPING || cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_POI_HOTEL_SHOPPING) { //购物
    actionCode = "c_shopping_delete";
  } else if (cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_POI_FOOD || cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_POI_HOTEL_FOOD) { //餐饮
    actionCode = "c_food_delete";
  } else if (cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_CAR_AIRPORT_DROPOFF) { //国内送机
    actionCode = "c_car_send_plane_delete";
  } else if (cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_CAR_AIRPORT_PICKUP) { //国内接机
    actionCode = "c_car_pickup_plane_delete";
  } else if (cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_CAR_AIRPORT_DROPOFF_OVERSEA) { //海外接机
    actionCode = "c_oversea_car_send_plane_delete";
  } else if (cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_CAR_AIRPORT_PICKUP_OVERSEA) { //海外接机
    actionCode = "c_oversea_car_pickup_plane_delete";
  } else if (cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_CAR_SELFDRIVE_INLAND) { //国内自驾
    actionCode = "c_selfdriving_delete";
  } else if (cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_CAR_SELFDRIVE_OVERSEA) { //海外自驾
    actionCode = "c_oversea_selfdriving_delete";
  } else if (cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_CAR_RENTAL) { //国内包车
    actionCode = "c_daydriving_delete";
  } else if (cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_CAR_AIRPORT_CHARTER_OVERSEA) { //海外包车
    actionCode = "c_oversea_daydriving_delete";
  } else if (cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_CAR_Call_TAXI) { //马上叫车
    actionCode = "c_car_fastcall_delete";
  }
  ubt.ubtTrace(102325, {
    actionCode: actionCode,
    actionType: 'click'
  });

}
