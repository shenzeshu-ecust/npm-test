import FlightBase from './flightBase.js'
import dateUtil from "../../utils/dateUtils.js";
import CardOperationModel from '../cardOperationModel.js'
import operaionBiz from '../../components/card-operation-compt/biz.js'
import { logParameter } from '../../../utils/actionCode';
import { CARD_SOURCE } from '../../utils/constant';
import {CTS_DATE_FORMATE, ctsFormatFromStringDate} from "../../utils/ctsDateUtil";

export default class FlightTimeline extends FlightBase{
  constructor(originCard) {
    super(originCard);

    //是否是极小卡
    this.isMiniCard = (originCard.flightCard.cardSize == 2);
    //实际承运
    this.actualCarrierAirlineNameText = this.actualCarrierAirlineName();
    // 卡片来源
    // this.cardSourceText = this.getCardSource();
    //出发到达站
    this.timeline_departStationTerminalText = this.timeline_departStationTerminal();
    this.timeline_arriveStationTerminalText = this.timeline_arriveStationTerminal();
    //主时间提示
    this.timeline_departMainTimeText = this.timeline_departMainTime();
    this.timeline_arriveMainTimeText = this.timeline_arriveMainTime();
    //主时间
    this.timeline_departMainTimeTipText = this.timeline_departMainTimeTip();
    this.timeline_arriveMainTimeTipText = this.timeline_arriveMainTimeTip();
    //主轴主时间跨天数
    this.timeline_mainNumberOfDays = this.timeline_mainNumberOfDaysText();
    this.timeline_secondNumberOfDays = this.timeline_secondNumberOfDaysText();
    //副时间及提示
    this.timeline_secondDepartureTimeText = this.timeline_secondDepartureTimeTip();
    this.timeline_secondArrivalTimeText = this.timeline_secondArrivalTimeTip();
    //重要公告
    this.noticeList = this.timeline_noticeList();
    //主轴航班状态
    this.timeline_flightStatusName = this.timeline_flightStatusNameText();
    //值机信息
    this.timeline_showCheckInfo = this.timeline_showCheckInfoText();
    this.timeline_showCheckInfoEntry = this.timeline_showCheckInfoEntryText();
    this.timeline_flightStatusColor = this.timeline_flightStatusColorText();

    //航变信息
    this.timeline_flightChangeText = this.timeline_flightChange();
    //主轴出行人控制
    this.timeline_passengerText = this.timeline_passenger();

    //主轴操作栏
    this.timeline_operations = operaionBiz.cardOperationData(this.timeline_operationsText(originCard), 'flight');
    this.opratLogParamter = {
      ...logParameter(originCard),
      OT: 'card_opr'
    }
  }

  timeline_departStationTerminal() {
    let flightCard = this.originCard.flightCard;
    return flightCard.departureAirportName + (flightCard.departureTerminal || '');
  }

  timeline_arriveStationTerminal() {
    let flightCard = this.originCard.flightCard;
    return flightCard.arrivalAirportName + (flightCard.arrivalTerminal || '');
  }

  timeline_departMainTime() {
    let flightCard = this.originCard.flightCard;
    if (flightCard.mainDepartureTimeType == 0 || flightCard.cardSize == 2) {
      return undefined;
    }
    if (flightCard.mainDepartureTime) {
      let mainDepartureTime = dateUtil.hourForTimeStr(flightCard.mainDepartureTime) + ":" + dateUtil.minuteForTimeStr(flightCard.mainDepartureTime);
      return mainDepartureTime;
    }
    return '--';
  }

  timeline_arriveMainTime() {
    let flightCard = this.originCard.flightCard;

    if (flightCard.mainArrivalTimeType == 0 || flightCard.cardSize == 2) {
      return undefined;
    }
    if (flightCard.mainArrivalTime) {
      let mainArrivalTime = dateUtil.hourForTimeStr(flightCard.mainArrivalTime) + ":" + dateUtil.minuteForTimeStr(flightCard.mainArrivalTime);
      return mainArrivalTime;
    }
    return '--';
  }

  timeline_departMainTimeTip() {
    let flightCard = this.originCard.flightCard;

    if (flightCard.cardSize == 0 || flightCard.cardSize == 2) {
      return undefined;
    }
    return this.mainDepartureTimeTip;
  }

  timeline_arriveMainTimeTip() {
    let flightCard = this.originCard.flightCard;

    if (flightCard.cardSize == 0 || flightCard.cardSize == 2) {
      return undefined;
    }
    return this.mainArrivalTimeTip;
  }

  timeline_secondDepartureTimeTip() {
    let flightCard = this.originCard.flightCard;

    if (flightCard.cardSize == 0 || flightCard.cardSize == 2) {
      return undefined;
    }
    return this.secondDepartureTime;
  }

  timeline_secondArrivalTimeTip() {
    let flightCard = this.originCard.flightCard;

    if (flightCard.cardSize == 0 || flightCard.cardSize == 2) {
      return undefined;
    }
    return this.secondArrivalTime;
  }

  timeline_mainNumberOfDaysText() {
    let flightCard = this.originCard.flightCard;

    if (flightCard.mainDepartureTimeType == 0 || flightCard.mainArrivalTimeType == 0 || flightCard.cardSize == 2) {

    } else {
      let crossDay = dateUtil.daysBetweenDate(flightCard.mainDepartureTime, flightCard.mainArrivalTime);
      if (crossDay && crossDay > 0) {
        crossDay = "+" + crossDay;
      }
      return crossDay;
    }
  }

  timeline_secondNumberOfDaysText() {
    let flightCard = this.originCard.flightCard;
    if (flightCard.secondDepartureTimeType == 0 
      || flightCard.secondArrivalTimeType == 0 
      || flightCard.cardSize == 2
      || flightCard.cardSize == 0) {
        return '';
    } else {
      let crossDay = dateUtil.daysBetweenDate(flightCard.secondDepartureTime, flightCard.secondArrivalTime);
      if (crossDay && crossDay > 0) {
        crossDay = "+" + crossDay;
      }
      return crossDay;
    }
  }

  timeline_noticeList() {
    let flightCard = this.originCard.flightCard;

    let noticeList = [{
      textColor: '#666666',
      label: '',
      description:'航班动态仅供参考，请以机场发布为准',
    }];

    if (flightCard.feeyoTips) {
      let feeyoTips = "";
      let tips = flightCard.feeyoTips.split("|");
      for (let i = 0; i < tips.length; i++) {
        let notice = {
          textColor: '#ED494B',
          label: '重要公告：',
          description: tips[i]
        }
        noticeList.push(notice);
      }
    }

    if (flightCard.tips) {
      if (flightCard.boardingStatus || flightCard.originalFlightStatus) {
        let notice = {
          textColor: '#666666',
          label: (flightCard.boardingStatus || flightCard.originalFlightStatus) + "：",
          description: flightCard.tips,
          maybeDalay: flightCard.originalFlightStatus == '可能延误'
        }
        noticeList.push(notice);
      }
    }
    return noticeList;
  }

  timeline_flightChange() {
    let flightCard = this.originCard.flightCard;

    return flightCard.flightChangeTips;
  }

  timeline_passenger() {
    const { flightCard, sharedCard, isShowTraveler } =  this.originCard;

    if (flightCard.isDisplayPassenger && flightCard.travelPhase !==2 && (!sharedCard || isShowTraveler)) {
      return this.passengerText;
    }
  }

  timeline_flightStatusNameText() {
    let flightCard = this.originCard.flightCard;

    if (flightCard.cardSize == 0 || flightCard.cardSize == 2) {
      return undefined;
    }
    return this.flightStatus;
  }

  timeline_showCheckInfoText() {
    let flightCard = this.originCard.flightCard;
    
    return [1, 2].includes(flightCard.travelPhase); 
  }
  timeline_showCheckInfoEntryText() {
    let flightCard = this.originCard.flightCard;
    return flightCard.travelPhase === 1; 
  }

  timeline_flightStatusColorText() {
    let flightCard = this.originCard.flightCard;

    if (flightCard.cardSize == 2) {
      return "#ffffff";
    }
    return this.flightStatusColor;
  }

  actualCarrierAirlineName() {
    let flightCard = this.originCard.flightCard;
    if (flightCard.actualCarrierAirlineName || flightCard.actualCarrierFlightNo) {
      return '实际承运' + flightCard.actualCarrierAirlineName + flightCard.actualCarrierFlightNo;
    }
  }

  getCardSource() {
    let originCard = this.originCard;
    let cardSourceText = '';
    if (originCard.cardSource === CARD_SOURCE.CardTSourceType_SELFADD) {
      cardSourceText = '来自关注';
    };
    return cardSourceText;
  }

  timeline_operationsText() {
    let originCard = this.originCard;

    let options = [];
    let orderUrl = '';
    if (originCard.cardSource == 1) {//订单
      orderUrl = this.orderDetailUrl;
      let orderDetail = new CardOperationModel({
        optType: 1,
        name: '订单详情',
        path: orderUrl,
        actionCode: 'c_flight_order_service_click'
      });
      options.push(orderDetail);
    }
    if (originCard.cardSource == 2) { // 分享导入
      const flightCard = originCard.flightCard;
      const queryDate = ctsFormatFromStringDate(flightCard.planDepartureTime, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_02);
      const queryDateStr = queryDate ? ('&queryDate=' + queryDate) : '';
      const url = '/pages/flightschedule/pages/detail/detail?origin=108&flightNo=' + flightCard.flightNo + queryDateStr + '&dcode=' + flightCard.departureAirportCode + '&acode=' + flightCard.arrivalAirportCode;
  
      options.push(new CardOperationModel({
        optType: 1,
        name: '查看详情',
        path: url,
        actionCode: 'c_flight_card_detail_click'
      }));
    }
    if (originCard.cardSource !== 2) {
      let shareModel = new CardOperationModel({
        ...this.shareModel,
        optType: 0,
        name: '分享',
        actionCode: 'c_flight_share_click'
      });
      options.push(shareModel);
    }

    return {
      orderStatusStyle: originCard.flightCard.orderStatusStyle,
      orderStatusName: originCard.flightCard.orderStatusName,
      cardSource: originCard.cardSource,
      operationList: options,
      orderDetailUrl: orderUrl,
      orderStatusActionCode: 'c_flight_order_statusbar_click',
      logParameter: this.opratLogParamter
    }
  }

  flightStatusColorText() {//与native主轴保持一致，不需要渐变
    let flightCard = this.originCard.flightCard;

    let flightStatusColor = "";
    if (flightCard.cardReminder != undefined) {
      if (flightCard.cardReminder === 0) { //正常   绿色
        flightStatusColor = "#00b87a";
      } else if (flightCard.cardReminder === 3) { //失联   灰色
        flightStatusColor = "#999999";
      } else if (flightCard.cardReminder === 4) { //提醒   橙色
        flightStatusColor = "#EFAE2F";
      } else { //异常提醒   红色
        flightStatusColor = "#FF6464";
      }
    } else {
      flightStatusColor = "#00C05D";
    }
    return flightStatusColor;
  }

  isTimeline() {
    return true;
  }
}