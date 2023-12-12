//@author qiuwf@Ctrip.com

import CardTimeline from '../base/cardTimeline.js'
import CardOperationModel from '../cardOperationModel.js'
import operaionBiz from '../../components/card-operation-compt/biz.js'
import CarCommon from './carCommon.js'

export default class CarTimeline extends CardTimeline {
  constructor(originCard) {
    super(originCard, CarCommon);

    this.carInfo = this.cardInfoText();
    this.timelineActionCode = this._timelineActionCode();
  }

  _orderID() {//
    return this.originCard.carCard.orderId;
  }

  _orderStatusName() {
    return this.originCard.carCard.orderStatusName;
  }

  _orderDetailUrl() {
    return this.originCard.carCard.orderDetailUrl;
  }

  _orderDetailActionCode() {
    return this._timelineActionCode().orderDetail;
  }

  //主轴需要实现的接口
  _timelineHeaderTitle() {
    return this.cardHeaderTitle;
  }

  _timelineOperations() {
    let originCard = this.originCard;

    let options = [];
    let orderUrl = '';
    if (originCard.cardSource == 1) {//订单
      orderUrl = originCard.carCard.orderDetailUrl;
      let orderDetail = new CardOperationModel({
        optType: 1,
        name: '订单详情',
        path: orderUrl,
        actionCode: this._timelineActionCode().orderDetail
      });
      options.push(orderDetail);
    }
    if (originCard.cardSource === 2) { // 分享导入
      options.push(new CardOperationModel({
          optType: 1,
          name: '查看详情',
          path: originCard.carCard.orderDetailUrl,
          actionCode: `c_car_cardType_${originCard.cardType}_detail_click`
      }))
    }

    return operaionBiz?.cardOperationData({
      orderStatusStyle: originCard.carCard.orderStatusStyle || 0,
      orderStatusName: originCard.carCard.orderStatusName,
      cardSource: originCard.cardSource,
      operationList: options,
      orderDetailUrl: orderUrl,
      orderStatusActionCode: this._timelineActionCode().orderStatus,
      logParameter: this.operationList
    }) || {};
  }

  cardInfoText() {
    return this.driveInfo;
  }

  _timelineActionCode() {
    let carCard = this.originCard.carCard;

    if (carCard.type == 1 || carCard.type == 3) {//国内送机、站
      return {
        orderDetail: 'c_car_send_plane_order_service_click',
        orderStatus: 'c_car_send_plane_order_statusbar_click',
        cardClick: 'c_car_send_plane_card_click_to_card_detail',
        cardShare: 'c_car_send_plane_card_share'
      }
    } else if (carCard.type == 2 || carCard.type == 4) {//国内接机、站
      return {
        orderDetail: 'c_car_pickup_plane_order_service_click',
        orderStatus: 'c_car_pickup_plane_order_statusbar_click',
        cardClick: 'c_car_pickup_plane_card_click_to_card_detail',
        cardShare: 'c_car_pickup_plane_card_share'
      }
    } else if (carCard.type == 6 || carCard.type == 8) {//海外送机、站
      return {
        orderDetail: 'c_oversea_car_send_plane_order_service_click',
        orderStatus: 'c_oversea_car_send_plane_order_statusbar_click',
        cardClick: 'c_oversea_car_send_plane_card_click_to_card_detail',
        cardShare: 'c_oversea_car_send_plane_card_share'
      }
    } else if (carCard.type == 7 || carCard.type == 9) {//海外接机、站
      return {
        orderDetail: 'c_oversea_car_pickup_plane_order_service_click',
        orderStatus: 'c_oversea_car_pickup_plane_order_statusbar_click',
        cardClick: 'c_oversea_car_pickup_plane_card_click_to_card_detail',
        cardShare: 'c_oversea_car_pickup_plane_share'
      }
    } else if (carCard.type == 5) {//国内包车
      return {
        orderDetail: 'c_daydriving_order_service_click',
        orderStatus: 'c_daydriving_order_statusbar_click',
        cardClick: 'c_daydriving_card_timeline_click',
        cardShare: 'c_daydriving_card_share'
      }
    } else if (carCard.type == 10) {//海外包车
      return {
        orderDetail: 'c_oversea_daydriving_order_service_click',
        orderStatus: 'c_oversea_daydriving_order_statusbar_click',
        cardClick: 'c_oversea_daydriving_card_timeline_click',
        cardShare: 'c_oversea_daydriving_card_share'
      }
    } else if (carCard.type == 11) {//11=马上叫车
      return {
        orderDetail: 'c_car_fastcall_order_service_click',
        orderStatus: 'c_car_fastcall_order_statusbar_click',
        cardClick: 'c_car_fastcall_card_click_to_card_detail',
        cardShare: 'c_car_fastcall_card_share'
      }
    } else if (carCard.type == 12) {//超级巴士
      return {
        orderDetail: 'c_superbus_order_service_click',
        orderStatus: 'c_superbus_order_statusbar_click',
        cardClick: 'c_superbus_card_click_to_card_detail',
        cardShare: 'c_superbus_card_share'
      }
    } else if ([2201, 2202].includes(this.originCard.cardType)) { // 汽车票
      return {
        orderDetail: 'c_bus_order_service_click',
        orderStatus: 'c_bus_order_statusbar_click',
        cardClick: 'c_bus_card_click_to_card_detail',
        cardShare: 'c_bus_card_share'
      }
    } else {
      return {
        orderDetail: '',
        orderStatus: '',
        cardClick: '',
        cardShare: ''
      };
    }
  }
}