//@author qiuwf@Ctrip.com

import CardCommon from '../base/cardCommon.js'
import dateUtil from "../../utils/dateUtils.js";
import { ctsFormatFromStringDate, CTS_DATE_FORMATE } from "../../utils/ctsDateUtil.js";

const TAKE_TAXI_TYPE = [11, 16, 17, 18]; // 打车类型
export default class CarCommon extends CardCommon{
  constructor(originCard) {
    super(originCard);
    this.title = this.getTitle();
    this.titleSub = this._titleSubText();
    this.cardHeaderTitle = this._cardHeaderTitle();
    this.departureMain = this._departureMain();
    this.departureSub = this._departureSub();
    this.arriveMain = this._arriveMain();
    this.arriveSub = this._arriveSub();
    this.carNumber = this._carNumber();
    this.isShowNavigation = this._isShowNavigation();
    this.carCard = originCard.carCard;
    this.location = this._getLocation();
    this.address = this._address();
    this.mapText = this._mapText();
    this.tips = this._tips();
    this.timelineHeaderSubtitle = this._timelineHeaderSubtitle();
    //custom
    this.isCharteredBus = this._isCharteredBus();
    this.isCarRental = this._isCarRental(); // 租车
    this.isBusCard = this._isBusCard(); // 汽车票
    this.isShowSmallTitle = this._isShipCard(); // 船票
    this.isTakeTaxi = this._isTakeTaxi(); // 打车
    this.driveInfo = this._driveInfo();
    this.useCarTimeText = this._useCarTimeText();
    this.showSubTitle = !(this.isCharteredBus || this.isCarRental || this._isShipCard() || this._isTakeTaxi()); // 租车和包车、船票、打车不展示副标题
    this.isShowTopLine = !(this._isBusCard() && (originCard.carCard.ticketCheck || originCard.carCard.passengerList)); //汽车票有出行人/检票口时不展示分割线
    this.smallTitle = this._getSmallTitle();
    this.locationUrl = this._locationUrl();
  }

  _smartTripId() {
    return this.originCard.smartTripId;
  }
  _locationUrl() {
    const { pickupLocationUrl, locationUrl } = this.originCard.carCard;
    if (this._isShipCard()) {
      return locationUrl;
    }
    return pickupLocationUrl;
  }
  _getSmallTitle() {
    if (this._isShipCard()) {
      const { estimatedTime = '' } = this.originCard.shipCard;

      if (estimatedTime) {
        return `· 约${estimatedTime}`;
      }
    }
  }

  _shareModel() {
    let carCard = this.originCard.carCard;
    return {
      title: this._shareTitle(),
      path: '/pages/schedule/pages/cardShare/carShare/carShare?smartTripId=' + this.originCard.smartTripId,
      imageUrl: 'https://pages.ctrip.com/schedule/photo/sku_wxshare_car_service.png'
    }
  }

  _mapLocation() {//地图控件需要用到的数据模型
    let location = {};
    let carCard = this.originCard.carCard;
    let originLocation = carCard.pickupLocation || {};
    location["title"] = carCard.pickupAddress;
    location["name"] = carCard.pickupAddress;
    location["address"] = carCard.pickupAddress;
    location["longitude"] = originLocation.longitude;
    location["latitude"] = originLocation.latitude;
    location["description"] = carCard.pickupAirportAddress;
    return location;
  }

  _shareTitle() {
    let month = dateUtil.monthForTimeStr2(this.originCard.carCard.usingTime);
    let day = dateUtil.dayForTimeStr2(this.originCard.carCard.usingTime);
    let shareTitle = this._cardHeaderTitle();
    let mainTitle;
    if (this.originCard.carCard.type == 12) {//超级巴士的时间
      mainTitle = `${shareTitle}·${this.originCard.carCard.displayedDateTime}`;
    } else {//接送机，接送站，包车
      let hour = dateUtil.hourForTimeStr2(this.originCard.carCard.usingTime);
      let minutes = dateUtil.minuteForTimeStr(this.originCard.carCard.usingTime);
      mainTitle = `${shareTitle}·${month}月${day}日·${hour}:${minutes}`;
    }
    return mainTitle;
  }

  _cardHeaderTitle() {
    const { carCard, selfDrivingCard, busCard, shipCard } = this.originCard;
    const map = ['', '送机', '接机', '送火车', '接火车', '包车', '送机', '接机', '送火车', '接火车', '包车'];
    
    if (selfDrivingCard) {
      return '租车';
    }
    if (busCard) {
      return '汽车票';
    }
    if (shipCard) {
      return '船票';
    }
    if (carCard && TAKE_TAXI_TYPE.includes(carCard.type)) { // 打车
      return '打车';
    }

    return map[carCard?.type];
  }

  _departureMain() {
    const { startDate, pickupAddress, pickupTime, departureStationName, departurePort } = this.originCard.carCard;
    if (this._isCharteredBus()) {
      return this._getTime(startDate) + '上车';
    }
    if (this._isCarRental()) {
      return this._getTime(pickupTime) + '取车';
    }
    if (this._isBusCard()) {
      return departureStationName;
    }
    if (this._isShipCard()) {
      return departurePort;
    }
    return pickupAddress;
  }

  _departureSub() {
    const { pickupAddress } = this.originCard.carCard;
    if (this._isCharteredBus()) {
      return pickupAddress;
    }
  }

  _arriveMain() {
    const { endDate, takeOffAddress, returnTime, arrivalStationName, arrivalPort } = this.originCard.carCard;
    if (this._isCharteredBus()) {
      return this._getTime(endDate) + '下车';
    }
    if (this._isCarRental()) {
      return this._getTime(returnTime) + '还车';
    }
    if (this._isBusCard()) {
      return arrivalStationName;
    }
    if (this._isShipCard()) {
      return arrivalPort;
    }
    return takeOffAddress;
  }
  _arriveSub() {
    const { takeOffAddress } = this.originCard.carCard;
    if (this._isCharteredBus()) {
      return takeOffAddress;
    }
  }
  _carNumber() {
    return this.originCard.carCard.carNumber;
  }

  _isShowNavigation() {
    // 租车
    if (this._isCarRental()) {
      const { type, pickupLocation, returnLocation } = this.originCard.selfDrivingCard;
      return '';
      // return type === 1 ? pickupLocation : returnLocation; // 1取车 2换车
    }
    const { isShowNavigation, pickupLocationUrl, departureLocation, locationUrl, pickupLocation } = this.originCard.carCard;
    // 包车
    if (this._isCharteredBus()) {
      return isShowNavigation;
    }
    // 汽车票
    if (this._isBusCard()) {
      return departureLocation;
    }
    // 船票
    if (this._isShipCard()) {
      return locationUrl;
    }
    // 打车
    if (this._isTakeTaxi()) {
      return pickupLocation;
    }
    // 7国内送机、704海外送机、713送机、711送站、710接站
    const isDropOff = [7, 704, 713, 711, 710].includes(this.originCard.cardType);
    // 送机、接送站不展示导航，只有接机展示（根据是否有url判断）
    return isDropOff ? '' : pickupLocationUrl;
  }

  _getTime(dateTime) {
    const date = ctsFormatFromStringDate(dateTime, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_03);
    const time = ctsFormatFromStringDate(dateTime, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_06);

    return `${date} ${time}`
  }
  getTitle() {
    const { selfDrivingCard, busCard, shipCard } = this.originCard;
    if (selfDrivingCard) {
      return selfDrivingCard?.cardInfo;
    } else if (busCard) {
      const departureTime = ctsFormatFromStringDate(busCard.departureTime, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_06);
      return departureTime;
    } else if (shipCard) {
      return shipCard?.ticketTitle;
    } else {
      return this.titleText();
    }
  }
  titleText() {
    const { type, carColor = '', carBrand = '', vehicleSeries = '', vehicleType = '' } = this.originCard.carCard;

    if (type <= 10) {
      let str = '';
      if (carBrand || vehicleSeries) {
        str += `${carBrand}${vehicleSeries}`;
        if (carColor) str = `${carColor} · ${str}` ;
      } else {
        str = vehicleType;
      };
      return str;
    }
    if (TAKE_TAXI_TYPE.includes(type)) { // 打车
      const carColorText = carColor ? `${carColor}·` : '';
      return carBrand ? `${carColorText}${carBrand}` : vehicleType;
    }
    if (type == 12) {//超级巴士
      if (!this.originCard.carCard.displayedDateTime) {
        return "--";
      }

      return this.originCard.carCard.displayedDateTime + "用车";
    } else {
      if (!this.originCard.carCard.usingTime) {
        return "--";
      }
      return dateUtil.hourForTimeStr(this.originCard.carCard.usingTime) + ":" + dateUtil.minuteForTimeStr(this.originCard.carCard.usingTime) + "用车";
    }
  }
  _titleSubText() {
    const { productName, usingTime } = this.originCard.carCard;

    if (this._isCharteredBus()) {
      return productName;
    }
    if (this._isBusCard()) {
      return '发车';
    }
    const time = ctsFormatFromStringDate(usingTime, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_06);
    return `${time}用车`;
  }

  /**
   * 包车
   */
  _isCharteredBus() {

    let carCard = this.originCard.carCard;

    return carCard.type === 10 || carCard.type === 5;
  }

  _isBusCard() {
    return this.originCard.busCard;
  }

  _getLocation() {
    const { carCard, selfDrivingCard, busCard } = this.originCard;

    if (this._isBusCard()) {
      return busCard.departureLocation;
    }
    if (selfDrivingCard) {
      return selfDrivingCard.type === 1 ? selfDrivingCard.pickupLocation : selfDrivingCard.returnLocation;
    }
    return carCard.pickupLocation;
  }

  _address() {
    const { carCard, selfDrivingCard, busCard } = this.originCard;

    if (this._isBusCard()) {
      return busCard.departureStationName;
    }
    if (selfDrivingCard) {
      return selfDrivingCard.type === 1 ? selfDrivingCard.pickupAddress : selfDrivingCard.returnAddress;
    }
    return carCard.pickupAddress;
  }
  _mapText() {
    const { carCard, selfDrivingCard } = this.originCard;

    if (carCard && !selfDrivingCard) {
      return '上车点';
    }
    if (this._isShipCard()) {
      return '港口';
    }
    return selfDrivingCard.type === 1 ? '取车点' : '还车点';
  }
  _tips() {
    const { carCard, selfDrivingCard, shipCard } = this.originCard;

    if (selfDrivingCard) {
      return selfDrivingCard.type === 1 ? selfDrivingCard.pickupType : selfDrivingCard.returnType;
    }
    if (shipCard) {
      const { licensePlateNo = '', vehicleType = '', ticketCnt = '' } = shipCard;
      const licensePlateNoText = licensePlateNo.length > 15 ? `${licensePlateNo.slice(0, 15)}...` : licensePlateNo;
      return `${licensePlateNo ? `${licensePlateNoText} · ` : ''}${vehicleType}${ticketCnt}张`;
    }
    return carCard.appointmentTips;
  }
  _timelineHeaderSubtitle() {
    const { carCard, sharedCard } = this.originCard;
    
    if (sharedCard) {
      return ctsFormatFromStringDate(carCard.usingTime, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_03);
    }
  }
  _isCarRental() {
    const { selfDrivingCard } = this.originCard;

    return selfDrivingCard;
  }
  _isShipCard() {
    return this.originCard.shipCard;
  }
  _isTakeTaxi() {
    const { carCard } = this.originCard;
    return carCard && TAKE_TAXI_TYPE.includes(carCard.type);
  }
  _driveInfo(){

    let text = this.originCard.carCard.carBrand || "";

    if (this.originCard.carCard.carColor && this.originCard.carCard.carColor.length > 0) {
      if (text.length > 0) {
        text = text + " " + this.originCard.carCard.carColor;
      }
      else {
        text = this.originCard.carCard.carColor;
      }
    }

    if (text && this.originCard.carCard.driverName){
      this.originCard.carCard.driverName = '·' + this.originCard.carCard.driverName
    }
    return text;

  }

  _useCarTimeText() {
    let model = this.originCard.carCard;
    if (model.type === 12) {
      return model.displayedDateTime + ' 用车';
    } else {
      return dateUtil.hourForTimeStr(model.usingTime) + ':' + dateUtil.minuteForTimeStr(model.usingTime) + ' 用车';
    }
  }

}