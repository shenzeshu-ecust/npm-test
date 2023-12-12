//@author qiuwf@Ctrip.com

import { _ } from '../../../../../cwx/cwx.js'
import { logParameter } from '../../../utils/actionCode';

export default class CardTimeline{
  constructor(originCard, CommonClassName) {
    this.originCard = originCard;
    if (CommonClassName) {
      let commonObj = new CommonClassName(originCard);
      _.extend(this, commonObj);
    }
    this.orderId = this._orderID();
    this.orderStatusName = this._orderStatusName();
    this.orderDetailUrl = this._orderDetailUrl();
    this.orderDetailActionCode = this._orderDetailActionCode();

    this.timelineHeaderTitle = this._timelineHeaderTitle();
    this.timelineHeaderIcon = originCard.cardIcon;
    this.timelineOperations = this._timelineOperations();
    //在这里添加其他展示数据处理逻辑
    this.opratLogParamter = {
      ...logParameter(originCard),
      OT: 'card_opr'
    }
  }

  _timelineOperations() {//主轴操作栏
    
  }
}