var cardOperationComptBiz = require("../../components/card-operation-compt/biz.js");
var dateUtil = require("../../utils/dateUtils.js");
import cardOperationModel from "../../models/cardOperationModel.js";
import { logParameter } from '../../../utils/actionCode';
import ctsConstant, { isFlightHotelCard, isPoiHotelCard } from '../../../utils/CtsConstant';
import { hotelOrderDetailBaseUrl } from "../../../utils/util.js";
import { ctsFormatFromStringDate, CTS_DATE_FORMATE } from '../../utils/ctsDateUtil';

export const sortHotelCardData = function(cardModel) {
  const { smartTripId, hotelCard, cardType, cardSource, cardIcon, sharedCard, bnbCard, cardShare = {} } = cardModel;
  // 民宿bnbCard里面没有下发operationList了，所以改成从外层获取cardShare判断是否有分享（app目前都是从外层operationList获取操作项，是否分享看外层cardShare）
  const operationList = bnbCard ? [cardShare] : (hotelCard.operationList || []); 
  let sortedHotelCardData = { cardIcon };

  let hotelName = "";
  let hotelSubName = "";
  let subTitle = '';
  // 是否民宿
  const isBnB = [ctsConstant.SUBBIZTYPE.CardSubBizType_BedAndBreakfast_INLAND, ctsConstant.SUBBIZTYPE.CardSubBizType_BedAndBreakfast_OVERSEA].includes(cardType);
  
  if (cardType === ctsConstant.SUBBIZTYPE.CardSubBizType_HOTEL_OVERSEA ||
    cardType === ctsConstant.SUBBIZTYPE.CardSubBizType_HOTEL_POI_OVERSEA ||
    cardType === ctsConstant.SUBBIZTYPE.CardSubBizType_HOTEL_FLIGHT_OVERSEA_HOTEL) {
    hotelName = hotelCard.hotelNameEN ? hotelCard.hotelNameEN : "";
    hotelSubName = hotelCard.hotelName ? hotelCard.hotelName : "";
  } else if (isBnB) {
    hotelName = bnbCard.spaceName;
  } else {
    hotelName = hotelCard.hotelName ? hotelCard.hotelName : "";
    hotelSubName = "";
  }
  sortedHotelCardData["titleType"] = isBnB ? '民宿' : '酒店';
  sortedHotelCardData["title"] = hotelName;
  sortedHotelCardData["hotelSubName"] = hotelSubName;

  if (hotelCard.roomName) {
    sortedHotelCardData.roomInfo = isBnB ? hotelCard.roomName : `${hotelCard.roomName}·${hotelCard.roomCount}间`;
  }

  if (sharedCard && hotelCard.checkInDate) {
    sortedHotelCardData['subTitle'] = ctsFormatFromStringDate(hotelCard.checkInDate, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_03);;
  }
   
  const checkInDate = ctsFormatFromStringDate(hotelCard.checkInDate, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_03);
  const checkOutDate = ctsFormatFromStringDate(hotelCard.checkOutDate, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_03);
  const checkInTimeDesc = ctsFormatFromStringDate(hotelCard.checkInDate, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_06);
  const checkOutTimeDesc = ctsFormatFromStringDate(hotelCard.checkOutDate, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_06);
  const stayDuration = (hotelCard.checkOutDate - hotelCard.checkInDate) / 1000000;
  sortedHotelCardData["checkInDate"] = `${!hotelCard.isHourRoom ? checkInDate : checkInTimeDesc}入住`;
  sortedHotelCardData["checkOutDate"] = `${!hotelCard.isHourRoom ? checkOutDate : checkOutTimeDesc}离店`;
  sortedHotelCardData.duration = hotelCard.stayDurationDesc || `${stayDuration}晚`;

  sortedHotelCardData["hotelAddress"] = isBnB ? bnbCard.address : hotelCard.hotelAddress;
  sortedHotelCardData["location"] = isBnB ? bnbCard.locationList[0] : hotelCard.location;
  sortedHotelCardData["isCoordinateLegal"] = _isCoordinateLegal(hotelCard.location);
  const shareData = operationList.find(item => item.operationType === 3);
  sortedHotelCardData["cardOperationData"] = _customOperationData(smartTripId, hotelCard, cardSource, hotelName, cardType, shareData);
  sortedHotelCardData.showOperation = _isOrderCard(cardSource) || cardSource === 2;
  sortedHotelCardData.checkInDateOrigin = checkInDate;
  sortedHotelCardData["isHideArrow"] = isFlightHotelCard(cardType);
  return sortedHotelCardData;
}


const _isCoordinateLegal = function(location) {
  if (!location) return false;
  if (!location.latitude || !location.longitude) return false;
  if (location.latitude == 0 && location.longitude == 0) return false;
  return true;
}

const _customOperationData = function(smartTripId, hotelCard, cardSource, hotelName, cardType, shareData) {
  let operationData = {};
  let operationList = [];
  if (_isOrderCard(cardSource)) {
    let cardDetail = new cardOperationModel({
      optType: 1,
      name: "订单详情",
      path: _obtainOrderDetailUrl(hotelCard),
      actionCode: "c_hotel_order_service_click",
    })
    operationList.push(cardDetail);
  }
  if (cardSource === 2) {
    let cardDetail = new cardOperationModel({
      optType: 3,
      name: "查看详情",
      path: hotelCard.orderDetailUrl, // TODO hotelAroundUrl hotelDetailUrl
      actionCode: "c_hotel_card_detail",
    })
    operationList.push(cardDetail);
  }
  let shareDateString = dateUtil.monthForTimeStr2(hotelCard.checkInDate) + '月' + dateUtil.dayForTimeStr2(hotelCard.checkInDate) + '日';

  if (shareData && cardSource !== 2) {
    let cardShare = new cardOperationModel({
      optType: 0,
      title: hotelName + '·' + shareDateString + '入住',
      name: "分享",
      imageUrl: "https://pages.ctrip.com/schedule/photo/sku_wxshare_hotel.png",
      path: shareData.jumpUrl,
      actionCode: "c_hotel_card_share",
    })
    operationList.push(cardShare);
  }
  
  operationData["orderStatusStyle"] = hotelCard.orderStatusStyle;
  operationData["orderStatusName"] = hotelCard.orderStatusName;
  operationData["cardSource"] = cardSource;
  operationData["orderDetailUrl"] = _obtainOrderDetailUrl(hotelCard);
  operationData["operationList"] = operationList;
  operationData["orderStatusActionCode"] = "c_hotel_order_statusbar_click"
  operationData.logParameter = {
    ...logParameter({smartTripId, cardType, cardSource}),
    BH: 'entry',
    OT: 'card_opr'
  }
  return cardOperationComptBiz.cardOperationData(operationData);
}

const _obtainOrderDetailUrl = function(hotelCard) {
  return hotelCard.orderDetailUrl;
}

const _isOrderCard = function(cardSource) {
  return cardSource === 1;
}
