import { ctsFormatFromStringDate, CTS_DATE_FORMATE } from "../../utils/ctsDateUtil.js";
import dateUtil from "../../utils/dateUtils.js";
import { __global } from '../../../../../cwx/cwx.js';

function h5UrlDomain() {
  if (__global.env == 'fat') {
    return 'https://m.ctrip.fat396.qa.nt.ctripcorp.com';
  } else if (__global.env == 'uat') {
    return 'https://m.ctrip.uat.qa.nt.ctripcorp.com';
  } else {
    return 'https://m.ctrip.com';
  }
}

export default class FlightBase {
  constructor(originCard) {
    this.originCard = originCard;

    //出发-到达城市
    this.departArrivalCityText = this.departArrivalCityText();

    //主时间提示
    this.mainDepartureTimeTip = this.mainDepartureTime();
    this.mainArrivalTimeTip = this.mainArrivalTime();
    //主时间
    this.mainDepartureTime = this.mainDepartureTimeText();
    this.mainArrivalTime = this.mainArrivalTimeText();

    //副时间提示
    this.secondDepartureTime = this.secondDepartureTimeTip();
    this.secondArrivalTime = this.secondArrivalTimeTip();

    //值机口
    this.checkInCounter = this.checkInCounterText()
    //登机口
    this.boardingGate = this.boardingGateText()
    //行李转盘
    this.baggageTurntable = this.baggageTurntableText()
    // 航司预订号
    this.airlineRecordNo = this.airlineRecordNoText();
    //出口
    this.exitNode = this.exitNodeText()

    //卡片背景色
    this.flightStatusColor = this.flightStatusColorText();
    //航班状态
    this.flightStatus = this.flightStatusText();

    //乘客列表
    this.passengerText = this.passengerTextList();

    //分享信息
    this.shareModel = this.detailShareModel();

    //航班动态跳转链接
    this.flightDynamicsUrl = this.flightDynamicsUrlText();

    //订单详情链接
    this.orderDetailUrl = this.orderDetailUrlText();
    // 出发日期
    this.departureDate = this.getDepartureDate();
  }

  mainDepartureTime() {
    let flightCard = this.originCard.flightCard;

    let timetype = "";
    if (flightCard.mainDepartureTimeType) {
      if (flightCard.mainDepartureTimeType == 1) {
        timetype = "计划";
      } else if (flightCard.mainDepartureTimeType == 2) {
        timetype = "预计";
      } else if (flightCard.mainDepartureTimeType == 3) {
        timetype = "实际";
      }

      // if ((flightCard.mainDepartureTimeType != 0 && timetype) || !this.isTimeline()) {
      //   if (dateUtil.isTimeValid(flightCard.mainDepartureTime)) {
      //     timetype = timetype + dateUtil.monthForTimeStr(flightCard.mainDepartureTime) + "月" + dateUtil.dayForTimeStr(flightCard.mainDepartureTime) + "日";
      //   }
      // }
    }
    return timetype;
  }

  mainArrivalTime() {
    let flightCard = this.originCard.flightCard;

    let arrivalTimeType = "";
    if (flightCard.mainArrivalTimeType) {
      if (flightCard.mainArrivalTimeType == 1) {
        arrivalTimeType = "计划";
      } else if (flightCard.mainArrivalTimeType == 2) {
        arrivalTimeType = "预计";
      } else if (flightCard.mainArrivalTimeType == 3) {
        arrivalTimeType = "实际";
      }
    }
    return arrivalTimeType;
  }

  mainDepartureTimeText() {
    let flightCard = this.originCard.flightCard;
    let mainDepartureTime
    if (flightCard.mainDepartureTime) {
      mainDepartureTime = dateUtil.hourForTimeStr(flightCard.mainDepartureTime) + ":" + dateUtil.minuteForTimeStr(flightCard.mainDepartureTime);
    }
    return mainDepartureTime;
  }

  mainArrivalTimeText() {
    let flightCard = this.originCard.flightCard;
    let mainArrivalTime
    if (flightCard.mainArrivalTime) {
      mainArrivalTime = dateUtil.hourForTimeStr(flightCard.mainArrivalTime) + ":" + dateUtil.minuteForTimeStr(flightCard.mainArrivalTime);
    }
    return mainArrivalTime;
  }

  secondDepartureTimeTip() {
    let flightCard = this.originCard.flightCard;

    let secondDepartureTime = "";
    if (flightCard.secondDepartureTimeType) {
      if (flightCard.secondDepartureTimeType == 1) {
        secondDepartureTime = "计划";
      } else if (flightCard.secondDepartureTimeType == 2) {
        secondDepartureTime = "预计";
      } else if (flightCard.secondDepartureTimeType == 3) {
        secondDepartureTime = "实际";
      } else if (flightCard.secondDepartureTimeType == 5) {
        secondDepartureTime = "原计划";
      }
      if (flightCard.secondDepartureTimeType != 0) {
        if (dateUtil.isTimeValid(flightCard.secondDepartureTime)) {
          secondDepartureTime = secondDepartureTime + dateUtil.hourForTimeStr(flightCard.secondDepartureTime) + ":" + dateUtil.minuteForTimeStr(flightCard.secondDepartureTime);
        } else {
          secondDepartureTime = secondDepartureTime + "--";
        }
      }
    }
    return secondDepartureTime;
  }

  secondArrivalTimeTip() {
    let flightCard = this.originCard.flightCard;

    let secondArrivalTime = "";
    if (flightCard.secondArrivalTimeType) {
      if (flightCard.secondArrivalTimeType == 1) {
        secondArrivalTime = "计划"
      } else if (flightCard.secondArrivalTimeType == 2) {
        secondArrivalTime = "预计"
      } else if (flightCard.secondArrivalTimeType == 3) {
        secondArrivalTime = "实际"
      } else if (flightCard.secondArrivalTimeType == 5) {
        secondArrivalTime = "原计划"
      }
      if (flightCard.secondArrivalTimeType != 0) {
        if (dateUtil.isTimeValid(flightCard.secondArrivalTime)) {
          secondArrivalTime = secondArrivalTime + dateUtil.hourForTimeStr(flightCard.secondArrivalTime) + ":" + dateUtil.minuteForTimeStr(flightCard.secondArrivalTime);
        } else {
          secondArrivalTime = secondArrivalTime + "--";
        }
      }
    }
    return secondArrivalTime;
  }

  checkInCounterText() {
    let flightCard = this.originCard.flightCard;
    return flightCard.checkInCounter || "--";
  }

  boardingGateText() {
    let flightCard = this.originCard.flightCard;
    return flightCard.boardingGate || "--";
  }

  baggageTurntableText() {
    let flightCard = this.originCard.flightCard;
    return flightCard.baggageTurntable || "--";
  }

  airlineRecordNoText() {
    let flightCard = this.originCard.flightCard;
    return flightCard.airlineRecordNo;
  }

  exitNodeText() {
    let flightCard = this.originCard.flightCard;
    return flightCard.exitNode || "--";
  }

  departArrivalCityText() {
    let flightCard = this.originCard.flightCard;
    let cityLine = "";
    if (flightCard.departureCityName) {
      cityLine = flightCard.departureCityName;
      cityLine = flightCard.arrivalCityName ? (cityLine + "-" + flightCard.arrivalCityName) : cityLine;
    }
    return cityLine;
  }

  flightStatusColorText() {
    let flightCard = this.originCard.flightCard;

    let flightStatusColor = "";
    if (flightCard.cardReminder != undefined) {
      if (flightCard.cardReminder === 0) { //正常   绿色
        flightStatusColor = "linear-gradient(to right, #00C05D, #00D087)";
      } else if (flightCard.cardReminder === 3) { //失联   灰色
        flightStatusColor = "#999999";
      } else if (flightCard.cardReminder === 4) { //提醒   橙色
        flightStatusColor = "linear-gradient(to right, #EFAE2F, #F6C71A)";
      } else { //异常提醒   红色
        flightStatusColor = "linear-gradient(to right, #FF6464, #FF7748)";
      }
    } else {
      flightStatusColor = "linear-gradient(to right, #00C05D, #00D087)";
    }
    return flightStatusColor;
  }

  flightStatusText() {
    let flightCard = this.originCard.flightCard;
    let flightStatus = "";
    if (flightCard.hasFlightChange) {
      flightStatus = "航班变动中"
    } else if (flightCard.cardSize !==2) {
      flightStatus = flightCard.flightStatus;
    }
    return flightStatus;
  }

  flightDynamicsUrlText() {
    let flightCard = this.originCard.flightCard;

    let planDateStr = ctsFormatFromStringDate(flightCard.planDepartureTime, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_02);
    let baseUrl = h5UrlDomain();
    //https://m.ctrip.com/webapp/flight/schedule/detail.html?origin=31&flightNo=CA1516&queryDate=2018-10-30&dcode=SHA&acode=PEK&isHideNavBar=YES
    let url = baseUrl + '/webapp/flight/schedule/detail.html?origin=31&flightNo=' + flightCard.flightNo
      + '&queryDate=' + (planDateStr || '')
      + '&acode=' + (flightCard.arrivalAirportCode || '')
      + '&dcode=' + (flightCard.departureAirportCode || '') + '&isHideNavBar=YES';
    return url;
  }

  orderDetailUrlText() {
    // let appUrl;
    // let oid = this.originCard.flightCard.orderId;
    // let subBizType = this.originCard.cardType;
    // if (subBizType === 101 || subBizType === 201) {//机酒套餐
    //   appUrl = this.originCard.flightCard.orderDetailUrl;
    // } else {
    //   appUrl = '/pages/flight/orderdetail?oid=' + oid;
    // }
    // return appUrl;
    return this.originCard.flightCard.orderDetailUrl;
  }
  getDepartureDate() {
    let flightCard = this.originCard.flightCard;
    const departTime = flightCard?.mainDepartureTime || flightCard?.planDepartureTime;

    return ctsFormatFromStringDate(departTime, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_03);
  }
  passengerTextList() {
    let flightCard = this.originCard.flightCard;
    if (flightCard.passengerList && flightCard.passengerList.length > 0) {
      let seatAndName = flightCard.passengerList.map((item) => {
        return item.passengerName + (item.seatNo ? '(' + item.seatNo + ')' : '');
      });
      return seatAndName.join('　');
    } else if (flightCard.checkinFlag === 0) {
      return '';
    }
    return undefined;
  }

  detailShareModel() {
    let flightCard = this.originCard.flightCard;

    const queryDate = ctsFormatFromStringDate(flightCard.mainDepartureTime, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_02);
    const path = '/pages/flightschedule/pages/detail/detail?origin=109&flightNo=' + flightCard.flightNo + '&queryDate=' + queryDate + '&dcode=' + flightCard.departureAirportCode + '&acode=' + flightCard.arrivalAirportCode;

    return {
      title: '实时航班信息·' + flightCard.flightNo + '·' + dateUtil.monthForTimeStr2(flightCard.planDepartureTime) + '月' + dateUtil.dayForTimeStr2(flightCard.planDepartureTime) + '日',
      path,
      imageUrl: 'https://pages.ctrip.com/schedule/photo/sku_wxshare_flight.png'
    }
  }

  isTimeline() {
    return false;
  }
}