var cardOperationComptBiz = require("../../components/card-operation-compt/biz.js");
import { logParameter } from '../../../utils/actionCode';

export const bizModel = function(cardData) {
  let commonCard = cardData.commonCard;
  return {
    icon: commonCard.cardIcon,
    headerTitle: commonCard.cardTitle,
    title: commonCard.title,
    summary: commonCard.summary,
    summary2: commonCard.summary2,
    operationData: customOperationData(cardData)
  }
}

const customOperationData = function(cardData) {
  let commonCard = cardData.commonCard;
  let operationData = {};
  let operationList = [];
  if (cardData.operationList && cardData.operationList.length > 0) {
    const operate = cardData.operationList[0];
    let cardDetail = {
      optType: 1,
      name: operate.name,
      path: operate.jumpUrl,
      actionCode: operate.actionCode
    }
    operationList.push(cardDetail);
  }
  operationData.orderStatusStyle = commonCard.orderStatusStyle;
  operationData.orderStatusName = commonCard.orderStatusName;
  operationData.cardSource = cardData.cardSource;
  operationData.orderDetailUrl = commonCard.orderDetailUrl;
  operationData.operationList = operationList;
  operationData.orderStatusActionCode = "c_tuan_order_statusbar_click";
  operationData.logParameter = {
    ...logParameter(cardData),
    BH: 'entry',
    OT: 'card_opr'
  }
  return cardOperationComptBiz.cardOperationData(operationData);
}
