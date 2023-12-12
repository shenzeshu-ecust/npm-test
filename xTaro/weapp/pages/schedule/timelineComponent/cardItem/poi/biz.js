
var cardOperationComptBiz = require("../../components/card-operation-compt/biz.js");
import { logParameter } from '../../../utils/actionCode';
import { ctsFormatFromStringDate, CTS_DATE_FORMATE } from "../../utils/ctsDateUtil.js";

export const bizModel = function(cardData) {
  let ticketCard = cardData.ticketCard;
  return {
    status: status(cardData),
    operationData:customOperationData(cardData),
  }
}

const customOperationData = function(cardData) {
  let ticketCard = cardData.ticketCard;
  let operationData = {};
  let operationList = [];
  if (cardData.cardSource === 1) {
    let cardDetail = {
      optType: 1,
      name: "订单详情",
      path: ticketCard.orderDetailUrl,
      actionCode: "c_ticket_order_service_click",
    }
    operationList.push(cardDetail);
  }
  if (cardData.cardSource === 2) {
    let cardDetail = {
      optType: 1,
      name: "查看详情",
      path: ticketCard.orderDetailUrl,
      actionCode: "c_ticket_order_service_click",
    }
    operationList.push(cardDetail);
  }
  operationData.orderStatusStyle = ticketCard.orderStatusStyle;
  operationData.orderStatusName = ticketCard.orderStatusName;
  operationData.cardSource = cardData.cardSource;
  operationData.orderDetailUrl = ticketCard.orderDetailUrl;
  operationData.operationList = operationList;
  operationData.orderStatusActionCode = "c_ticket_order_statusbar_click";
  operationData.logParameter = {
    ...logParameter(cardData),
    OT: 'card_opr'
  }
  return cardOperationComptBiz.cardOperationData(operationData);
}

const status = function(cardData) {
  let ticketCard = cardData.ticketCard;
  var title;
  var seatAndGrade = ticketCard.packageSeat || '';
  var categoryAndCount = '';
  switch(cardData.cardType){
    case 12:
    case 905://美食
      title = "美食";
      break;
    case 9:
    case 902://景点
      title = "景点";
      break;
    case 11:
    case 904://购物
      title = "购物";
      break;
    case 10:
    case 903://娱乐
      title = "娱乐";
      break;
    default://门票
      title = "景点";
      break;
  }

  let subTitle = '';
  if (cardData.sharedCard) {
    subTitle = ctsFormatFromStringDate(ticketCard.usingDate, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_03);
  }
  let joinStr = (str1, str2) => {
    if (!str1 && !str2) return '';
    str1 = str1 || '';
    str2 = str2 || '';
    if (!str1) return str2;
    if (!str2) return str1;
    return `${str1} ${str2}`;
  }
  seatAndGrade = joinStr(seatAndGrade, ticketCard.roundAndSeat);
  seatAndGrade = joinStr(seatAndGrade, ticketCard.ticketGrade);

  if (ticketCard.peopleProperty) {
    categoryAndCount = `${ticketCard.peopleProperty} ${ticketCard.quantity}张`;
  }
  return {
    iconUrl : cardData.cardIcon,
    title : title || '',
    subTitle,
    seatAndGrade,
    categoryAndCount
  };
}