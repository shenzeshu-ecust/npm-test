import CtsConstant from '../../../utils/CtsConstant.js'

function cardOperationData(operationData, type) {
  let cardOperationData = {};

  let orderStatusStyle = operationData.orderStatusStyle;
  let orderStatusName = operationData.orderStatusName;
  let cardSource = operationData.cardSource;
  let operationList = operationData.operationList;
  let orderDetailUrl = operationData.orderDetailUrl;
  let orderStatusActionCode = operationData.orderStatusActionCode;
  const logParameter = operationData.logParameter;

  cardOperationData.orderStatusStyle = operationData.orderStatusStyle;
  cardOperationData["cardSource"] = cardSourceStr(cardSource, type);
  cardOperationData["orderStatusName"] = orderStatusName;
  cardOperationData["orderStatusNameColor"] = orderStatusNameColor(orderStatusStyle);
  cardOperationData["orderStatusArrow"] = orderStatusArrow(orderStatusStyle);
  cardOperationData["orderDetailUrl"] = orderDetailUrl;
  cardOperationData["orderStatusActionCode"] = orderStatusActionCode;
  cardOperationData.logParameter = logParameter || {};
  
  let shareOperations = [];
  let normalOperations = [];
  if (operationList) {
    operationList.forEach((item) => {
      if (item.optType == 0) {
        shareOperations.push(item);
      } else {
        normalOperations.push(item);
      }
    })
  }
  cardOperationData["shareOperations"] = shareOperations;
  cardOperationData["normalOperations"] = normalOperations;
  return cardOperationData;
}

function cardSourceStr(cardSource, type) {
  let cardSourceStr = "";
  if (cardSource === 13) { //13=商旅订单
    cardSourceStr = CtsConstant.CARDSOURCE.CARD_FROM_TRADE;
  } else if (cardSource === 8) { //8=航班关注
    cardSourceStr = CtsConstant.CARDSOURCE.CARD_FROM_FLIGHT_NOTICE;
  } else if (cardSource === 7) { //7=非携程订单值机导入
    cardSourceStr = CtsConstant.CARDSOURCE.CARD_FROM_FLIGHT_ONLINE_SELECTION;
  } else if (cardSource === 10 || cardSource === 11) { //10=实名获取;11=护照获取
    cardSourceStr = CtsConstant.CARDSOURCE.CARD_FROM_REAL_NAME;
  } else if (cardSource === 2) { // 2=分享导入
    cardSourceStr = CtsConstant.CARDSOURCE.CARD_FROM_SHARED_ADD;
  } else if (cardSource === 3 && type) { // 3手动添加
    const map = {
      flight: CtsConstant.CARDSOURCE.CARD_FROM_MANUAL_ADD_FLIGHT,
      train: CtsConstant.CARDSOURCE.CARD_FROM_MANUAL_ADD_TRAIN
    }
    cardSourceStr = map[type]
  }
  return cardSourceStr;
}

function orderStatusNameColor(orderStatusStyle) {
  let orderStatusNameColor = "";
  if (orderStatusStyle === 0) {
    orderStatusNameColor = "#666666";
  } else if (orderStatusStyle === 1) {
    orderStatusNameColor = "#ED494B";
  } else if (orderStatusStyle === 2) {
    orderStatusNameColor = "#666666";
  }
  return orderStatusNameColor;
}

function orderStatusArrow(orderStatusStyle) {
  let orderStatusArrow = "";
  if (orderStatusStyle === 0) {
    orderStatusArrow = "#666";
  } else if (orderStatusStyle === 1) {
    orderStatusArrow = "#f63b2e";
  } else if (orderStatusStyle === 2) {
    orderStatusArrow = "#666";
  }
  return orderStatusArrow;
}

module.exports = {
  cardOperationData: cardOperationData,
  orderStatusNameColor: orderStatusNameColor,
  orderStatusArrow: orderStatusArrow,
}