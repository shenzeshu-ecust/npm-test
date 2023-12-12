import CardCommon from '../base/cardCommon.js';
import dateUtil from "../../utils/dateUtils.js";

export default class SelfDriveCommon extends CardCommon {
  constructor(originCard) {
    super(originCard);
  }

  _smartTripId() {
    return this.originCard.smartTripId;
  }

  _shareModel() {
    let selfDrivingCard = this.originCard.selfDrivingCard;
    return {
      title: this._shareTitle(),
      path: '/pages/schedule/pages/cardShare/selfDriveShare/selfDriveShare?smartTripId=' + this.originCard.smartTripId,
      imageUrl: 'https://pages.ctrip.com/schedule/photo/sku_wxshare_car_service.png'
    }
  }

  _shareTitle() {
    let selfDrivingCard = this.originCard.selfDrivingCard;
    let title = "用车·";
    if (selfDrivingCard.type == 1) {
      const date = dateUtil.monthForTimeStr2(selfDrivingCard.pickupTime) + "月" + dateUtil.dayForTimeStr2(selfDrivingCard.pickupTime) + "日";
      title = title + date + "取车";
    } else {
      const date = dateUtil.monthForTimeStr2(selfDrivingCard.returnTime) + "月" + dateUtil.dayForTimeStr2(selfDrivingCard.returnTime) + "日";
      title = title + date + "还车";
    }
    return title;
  }

  _mapLocation() { }

}