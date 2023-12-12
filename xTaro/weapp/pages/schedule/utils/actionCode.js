import { cwx } from "../../../cwx/cwx.js";
export const TRAIN_DETAIL_SHARE_CLICK = 'c_mp_train_detail_share_click';
export const TRAIN_DETAIL_ADDTRIP_CLICK = 'c_mp_train_detail_addtrip_click';
let ubt = cwx.sendUbtByPage;
const logCode = 'schedule_code';

export function logClick(parameter) {
  const value = {
    ...parameter,
    AT: 'click'
  }
  ubt.ubtTrace(logCode, value);
}

export function logExpose(parameter) {
  const value = {
    ...parameter,
    AT: 'exposure'
  }
  ubt.ubtTrace(logCode, value);
}

export function logParameter(cardModel) {
  let EXT = {
    count: cardModel.count,
    index: cardModel.index
  };
  if (cardModel.cardSource === 1) { // 订单
    EXT.orderId = cardModel.orderId;
    EXT.orderStatus = cardModel.orderStatusName;
  }

  let parameter = {
    AC: 'schedule-cardList',
    PC: '10650009139',
    FC: 'cardList',
    OID: `${cardModel.smartTripId}`,
    BU: `${cardModel.cardType}_${cardModel.cardSource}`,
    EXT
  };
  return parameter;
}

export function cardClickParameter(cardModel) {
  const parameter = { 
    ...logParameter(cardModel),
    OT: 'card',
  };
  return parameter;
}