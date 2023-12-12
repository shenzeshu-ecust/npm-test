import { ctsFormatFromStringDate, ctsFormate01DateWithString, CTS_DATE_FORMATE } from '../../utils/ctsDateUtil.js';
import { cardOperationData } from '../../components/card-operation-compt/biz.js'
import cardOperationModel from '../../models/cardOperationModel.js'
import { logParameter } from '../../../utils/actionCode';

export const getCardData = function(cardData){
  if (!checkCardData(cardData)){
    throw new Error('invaild TrainCardData');
  }
  let trainCard = cardData.trainCard
  return {
    cardIcon: cardData.cardIcon,
    smartTripId: cardData.smartTripId,
    headerTitle: getHeaderTitle(trainCard),
    headerSubTitle: getHeaderSubTitle(trainCard),
    departureStationName: trainCard.departureStationName,
    arrivalStationName: trainCard.arrivalStationName,
    departureTime: getFormatTime(trainCard.departureTime),
    arrivalTime: getFormatTime(trainCard.arrivalTime),
    trainName: trainCard.trainName,
    ticketGates: trainCard.ticketGates || '--',
    departureCityName: trainCard.departureCityName,
    arrivalCityName: trainCard.arrivalCityName,
    takeDay: getTakeDay(trainCard.departureTime, trainCard.arrivalTime),
    durationTime: getDurationTime(trainCard.departureTime, trainCard.arrivalTime),
    passengers: getPassengerInfos(trainCard.passengerList, cardData),
    cardSize: trainCard.cardSize,
    isFixed: trainCard.isFixed,
    grabTrainOrderInfo: !trainCard.isFixed ? getGrabTrainOrderInfo(trainCard.grabTrainOrderInfo) : {},
    cardOperationData: cardOperationData(getCardOperationData(cardData), 'train'),
    sharedCard: cardData.sharedCard
  }
}

const checkCardData = function (cardData) {
  let trainCard = cardData.trainCard
  if (!cardData.smartTripId || trainCard.isFixed && (!trainCard || !trainCard.departureCityName || !trainCard.arrivalCityName || !trainCard.trainName || !trainCard.departureStationName || !trainCard.arrivalStationName || !trainCard.departureTime || !trainCard.arrivalTime)) {
    return false
  }

  if (!trainCard.isFixed && (!trainCard || !trainCard.grabTrainOrderInfo)){
    return false
  }

  return true;
}

const getFormatTime = function (datetime) {
  if (!datetime || '00010101000000' === datetime) {
    return '--';
  } else {
    return ctsFormatFromStringDate(datetime, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_06);
  }
}

const getPassengerInfos = function (passengerList, cardData){
  if (!passengerList || passengerList.length < 1 || (cardData.sharedCard && !cardData.isShowTraveler)){
    return [];
  }

  let passengerInfos = [];
  passengerList.map(item => {
    passengerInfos.push({
      name: item.passengerName,
      seatNo: item.seatNo,
      seatName: item.seatName,
      seatPosition: item.seatPosition || ''
    })
  })

  return passengerInfos;
}

const getTakeDay = function(startTimeStr, endTimeStr){
  if (!startTimeStr || !endTimeStr){
    return null
  }
  let startTime = ctsFormate01DateWithString(startTimeStr);
  let endTime = ctsFormate01DateWithString(endTimeStr);
  let startDate = new Date();
  startDate.setFullYear(startTime.getFullYear());
  startDate.setMonth(startTime.getMonth());
  startDate.setDate(startTime.getDate());
  startDate.setHours(0);
  startDate.setMinutes(0);
  startDate.setSeconds(0);
  return Math.trunc((endTime.getTime() - startDate.getTime())/(1000*60*60*24));
}
const getDurationTime = function (startTimeStr, endTimeStr) {
  if (!startTimeStr || !endTimeStr){
    return null
  }
  let startTime = ctsFormate01DateWithString(startTimeStr);
  let endTime = ctsFormate01DateWithString(endTimeStr);
  const duration = endTime.getTime() - startTime.getTime();
  const day = Math.trunc(duration/(1000*60*60*24));
  const hour = Math.trunc(duration/(1000*60*60));
  const min = (duration - hour*60*60*1000)/(1000*60);
  return `${day?`${day}天`:''}${hour?`${hour}小时`:''}${min}分`
}
const getGrabTrainOrderInfo = function (grabTrainOrderdata){

  let result = {
    isReserve: grabTrainOrderdata.isReserve,
    buyingStatus: grabTrainOrderdata.buyingStatus,
    hasMultipleTrains: grabTrainOrderdata.hasMultipleTrains,
    hasStartedSelling: grabTrainOrderdata.hasStartedSelling
  }

  if (grabTrainOrderdata.startDate && grabTrainOrderdata.startDate !== '00010101000000'){
    result.startDate = ctsFormatFromStringDate(grabTrainOrderdata.startDate, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_03) + ctsFormatFromStringDate(grabTrainOrderdata.startDate, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_06)
  }

  return result
}

const getHeaderTitle = function (cardData){
  let result = ''
  if (!cardData.isFixed){
    result += '火车票抢票 '
    if (cardData.grabTrainOrderInfo.hasMultipleTrains){
      return result
    }
  }
  result += `${ cardData.trainName }`
  // if (cardData.ticketGates){
  //   result += `·检票口${cardData.ticketGates}`
  // }
  return result
}

const getHeaderSubTitle = function (cardData){
  const departTime = cardData?.departureTime || cardData?.arrivalTime;

  return ctsFormatFromStringDate(departTime, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_03);
}

const getCardOperationData = function (cardData){

  return {
      cardSource: cardData.cardSource,
      orderStatusStyle: cardData.trainCard.orderStatusStyle,
      orderStatusName: getOrderStatusName(cardData.trainCard),
      orderDetailUrl: cardData.trainCard.orderDetailUrl,
      orderStatusActionCode: 'c_train_order_statusbar_click',
      operationList: getOperationList(cardData),
      logParameter: {
        ...logParameter(cardData),
        BH: 'entry',
        OT: 'card_opr'
      }
    }
}

const getOrderStatusName = function (cardData){
  let orderStatusName = cardData.orderStatusName
  if (!cardData.isFixed){
    orderStatusName += `/${cardData.grabTrainOrderInfo.buyingStatus}`
  }
  return orderStatusName
}

const getOperationList = function (cardData){
  let result = []
  if (!cardData || !cardData.trainCard){
    return null
  }

  if (cardData.cardSource === 1){
    result.push(
      new cardOperationModel({
        optType: 1,
        name: '订单详情',
        path: cardData.trainCard.orderDetailUrl,
        actionCode: 'c_train_order_service_click'
      }))
  }
  if (cardData.cardSource === 2) {
    result.push(
      new cardOperationModel({
        optType: 1,
        name: '查看详情',
        path: `/pages/schedule/pages/cardDetail/train/train?smartTripId=${cardData.smartTripId}`,
        actionCode: 'c_train_card_detail_click'
    }))
  }

  if (cardData.trainCard.isFixed && cardData.cardSource !== 2){
    result.push(
      new cardOperationModel({
        optType: 0,
        name: '分享',
        title: `车次·${cardData.trainCard.trainName}·${cardData.trainCard.departureCityName}-${cardData.trainCard.arrivalCityName}·${getFormatDay(cardData.trainCard.departureTime)}`,
        imageUrl: 'https://pages.ctrip.com/schedule/photo/sku_wxshare_train.png',
        path: `/pages/schedule/pages/cardShare/trainShare/trainShare?smartTripId=${cardData.smartTripId}`,
        actionCode: 'c_train_card_share'
      }))
  }

  return result
}

const getFormatDay = function (datetime) {
  if (!datetime || '00010101000000' === datetime) {
    return '--';
  } else {
    return ctsFormatFromStringDate(datetime, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_03);
  }
}