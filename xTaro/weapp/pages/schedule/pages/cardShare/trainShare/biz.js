import { ctsFormatFromStringDate, CTS_DATE_FORMATE } from '../../ctsDateUtil.js';
import { isValidLocation, isValidCoordinate } from '../../../pages/components/detail-mapView-compt/detail-mapView-compt-biz.js';

export const loadNeededCardData = function (originCardDetail) {
  if (!originCardDetail || !originCardDetail.trainCard) {
    throw new Error('trainCardInfo error');
  }

  let result = {
    departureCityName: originCardDetail.trainCard.departureCityName,
    departureStationName: originCardDetail.trainCard.departureStationName,
    departureDateTime: originCardDetail.trainCard.departureTime,
    departureTime: getFormatTime(originCardDetail.trainCard.departureTime),
    departureDate: getFormatDate(originCardDetail.trainCard.departureTime),
    arrivalCityName: originCardDetail.trainCard.arrivalCityName,
    arrivalStationName: originCardDetail.trainCard.arrivalStationName,
    arrivalTime: getFormatTime(originCardDetail.trainCard.arrivalTime),
    arrivalDate: getFormatDate(originCardDetail.trainCard.arrivalTime),
    trainName: originCardDetail.trainCard.trainName,
    ticketGates: originCardDetail.trainCard.ticketGates,
    smartTripId: originCardDetail.smartTripId,
    isOrder: (originCardDetail.cardSource == 1/*订单*/ ||
      originCardDetail.cardSource == 10/*实名获取*/ ||
      originCardDetail.cardSource == 11/*护照获取*/ ||
      originCardDetail.cardSource == 13/*商旅订单*/) &&
      originCardDetail.trainCard.orderId &&
      originCardDetail.trainCard.orderId > 0,
    isShowHeader: false
  };

  if (originCardDetail.trainCard.departureLocation &&
    isValidCoordinate(originCardDetail.trainCard.departureLocation.latitude, originCardDetail.trainCard.departureLocation.longitude) &&
    originCardDetail.trainCard.departureStationName &&
    originCardDetail.trainCard.departureAddress) {
    result.location = {
      latitude: originCardDetail.trainCard.departureLocation.latitude,
      longitude: originCardDetail.trainCard.departureLocation.longitude,
      name: originCardDetail.trainCard.departureStationName,
      title: originCardDetail.trainCard.departureStationName,
      description: originCardDetail.trainCard.departureAddress,
      address: originCardDetail.trainCard.departureAddress,
      actionCode: 'c_train_share_map_navigate_click'
    };
  }

  result.isFixed = originCardDetail.trainCard.isFixed;
  if (originCardDetail.trainCard.grabTrainOrderInfo) {
    result.grabTrainOrderInfo = {
      isReserve: originCardDetail.trainCard.grabTrainOrderInfo.isReserve,
      buyingStatus: originCardDetail.trainCard.grabTrainOrderInfo.buyingStatus,
      departureDates: originCardDetail.trainCard.grabTrainOrderInfo.departureDates,
      trainNames: originCardDetail.trainCard.grabTrainOrderInfo.trainNames,
      hasMultipleTrains: originCardDetail.trainCard.grabTrainOrderInfo.hasMultipleTrains,
      seats: originCardDetail.trainCard.grabTrainOrderInfo.seats,
      hasStartedSelling: originCardDetail.trainCard.grabTrainOrderInfo.hasStartedSelling,
      startDate: originCardDetail.trainCard.grabTrainOrderInfo.startDate
    }
  }
  if (!result.isFixed && result.grabTrainOrderInfo && result.grabTrainOrderInfo.buyingStatus) {
    result.orderStatusName = originCardDetail.trainCard.orderStatusName + '/' + result.grabTrainOrderInfo.buyingStatus;
  }
  return result;
}

const getFormatTime = function (datetime) {
  if (!datetime || '00010101000000' === datetime) {
    return '--';
  } else {
    return ctsFormatFromStringDate(datetime, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_06);
  }
}

const getFormatDate = function (datetime) {
  if (!datetime || '00010101000000' === datetime) {
    return '--';
  } else {
    return ctsFormatFromStringDate(datetime, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_03)
  }
}