import CardTimeline from '../base/cardTimeline.js'
import CardOperationModel from '../cardOperationModel.js'
import operaionBiz from '../../components/card-operation-compt/biz.js'
import SelfDriveCommon from './selfdriveCommon.js'

export default class SelfDriveTimeline extends CardTimeline {
  constructor(originCard) {
    super(originCard, SelfDriveCommon);
    this.headTitle = this._timelineHeaderTitle();
    this.icon = this._timelineHeaderIcon();
    this.title = this._title();
    this.vendorLogo = this._vendorLogo();
    this.confirmationNo = this._confirmationNo();
    this.addressTip = this._addressTip();
    this.address = this._address();
    this.operations = this._timelineOperations();
  }

  _isOverseaSelfDriving() {
    return this.originCard.cardType === 702;
  }
  _orderID() {//
    return this.originCard.selfDrivingCard.orderId;
  }

  _orderStatusName() {
    return this.originCard.selfDrivingCard.orderStatusName;
  }

  _orderDetailUrl() {
    return this.originCard.selfDrivingCard.orderDetailUrl;
  }

  _orderStatusActionCode() {
    return this._isOverseaSelfDriving() ? "c_oversea_selfdriving_order_statusbar_click" : "c_selfdriving_order_statusbar_click";
  }

  _orderDetailActionCode() {
    return this._isOverseaSelfDriving() ? 'c_oversea_selfdriving_order_service_click' : 'c_selfdriving_order_service_click'
  }
  //主轴需要实现的接口
  _timelineHeaderTitle() {
    return '租车';

  }

  _timelineHeaderIcon() {
    return 'https://pages.c-ctrip.com/schedule/pic/wxxcx/cts_card_header_car@2x.png';
  }

  _timelineOperations() {
    let options = [];

    if (this.originCard.cardSource == 1) {//订单
      let orderDetail = new CardOperationModel({
        optType: 1,
        name: '订单详情',
        path: this._orderDetailUrl(),
        actionCode: this.orderDetailActionCode
      });
      options.push(orderDetail);
    }

    return operaionBiz?.cardOperationData({
      orderStatusStyle: this.originCard.selfDrivingCard.orderStatusStyle || 0,
      orderStatusName: this._orderStatusName(),
      cardSource: this.originCard.cardSource,
      operationList: options,
      orderDetailUrl: this._orderDetailUrl(),
      orderStatusActionCode: this._orderStatusActionCode(),
      logParameter: this.operationList
    }) || {};
  }

  _title(){
    let selfDriveModel = this.originCard.selfDrivingCard;
    let title = selfDriveModel.pickupCityName ? selfDriveModel.pickupCityName + "用车" : "--";
    return title;
  }

  _vendorLogo(){
    let selfDriveModel = this.originCard.selfDrivingCard;
    return selfDriveModel.vendorLogo;
  }

  _confirmationNo(){
    let selfDriveModel = this.originCard.selfDrivingCard;
    return selfDriveModel.type === 1 ? selfDriveModel.confirmationNo : "";
  }

  _addressTip(){
    let selfDriveModel = this.originCard.selfDrivingCard;
    let addressTip;
    if (selfDriveModel.type === 1) {
      addressTip = "取车地点";
    } else {
      addressTip = "还车地点";
    }
    return addressTip;
  }

  _address(){
    let selfDriveModel = this.originCard.selfDrivingCard;
    let address;
    if (selfDriveModel.type === 1) {
      address = selfDriveModel.pickupAddress;
    } else {
      address = selfDriveModel.returnAddress;
    }
    return address;
  }
}