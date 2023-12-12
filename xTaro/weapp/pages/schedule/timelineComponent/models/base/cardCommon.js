
//@author qiuwf@Ctrip.com

import { logError } from "../../../utils/util.js";

export default class CardCommon {
  constructor(originCard) {
    this.originCard = originCard;

    this.smartTripId = this._smartTripId();
    this.shareModel = this._shareModel();
    this.locationModel = this._mapLocation();
  }

  _smartTripId() {//卡片ID
    logError(this, 'class没有实现_smartTripId方法');
  }

  _shareModel() {//分享模型，同onShareAppMessage
    logError(this, 'class没有实现_shareModel方法');
  }

  _mapLocation() {//地图组件数据模型
    logError(this, 'class没有实现_mapLocation方法');
  }
}