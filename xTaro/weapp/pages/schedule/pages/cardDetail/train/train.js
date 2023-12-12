import { cwx, CPage } from '../../../../../cwx/cwx.js';
import { loadNeededCardData, loadLocalCardData } from './biz.js';
import { shareSuccess } from '../../../utils/util.js';
import { fetchCard } from '../../sendService.js';
import { localTrainCardDetail } from './data.js';

CPage({
  pageId: '10650009144',
  checkPerformance: true,
  _queryParam: undefined,
  _isFloat: false,

  data: {
    isLoadCompleted: false,
    loadSuccess: false,
    trainCardInfo: null,
    isShowDialog: false
  },

  onLoad: function(options) {
    console.log('trancarddetail')
    this._queryParam = options || {};
    //this._queryParam.smartTripId = 4036654;
    if (!options || !options.smartTripId) {
      this.loadFail();
    } else {
      this.loadData();
      //this.loadLocalData();
      if (options.isShowDialog) {
        this.setData({
          isShowDialog: true
        })
      }
    }

    wx.showShareMenu({
      withShareTicket: true,
    })
  },

  onPullDownRefresh: function() {
    this._isFloat ? wx.stopPullDownRefresh() : this.loadData();
  },

  showStopStationLayerEventListener: function(e){
    this._isFloat = e.detail.result;
  },

  onShareAppMessage: function(res) {
    let that = this;
    if (res.from === 'button') {
      this.ubtTrace(102324, {
        actionCode: 'c_train_detail_share_click',
        actionType: 'click',
      })
    }
    return {
      title: `车次·${this.data.trainCardInfo.trainName}·${this.data.trainCardInfo.departureCityName}-${this.data.trainCardInfo.arrivalCityName}·${this.data.trainCardInfo.departureDate}`,
      path: `/pages/schedule/pages/cardShare/trainShare/trainShare?smartTripId=${this._queryParam.smartTripId}`,
      imageUrl: 'https://pages.ctrip.com/schedule/photo/sku_wxshare_train.png',
      success: function(res) {
        shareSuccess(res, that);
      }
    }
  },

  loadLocalData: function() {
    this.setData({
      loadSuccess: true,
      isLoadCompleted: true,
      trainCardInfo: loadNeededCardData(localTrainCardDetail)
    })
  },

  loadData: function() {
    fetchCard(this._queryParam.smartTripId).then(res => {
      if (!res || !res.trainCard) {
        throw new Error('trainCardInfo error');
      }
      this.setData({
        loadSuccess: true,
        isLoadCompleted: true,
        trainCardInfo: loadNeededCardData(res)
      })
      if (this.data.trainCardInfo && !this.data.trainCardInfo.isFixed){
        wx.hideShareMenu();
      }
      wx.stopPullDownRefresh();
    }).catch(err => {
      wx.stopPullDownRefresh();
      this.loadFail();
    })
  },

  loadFail: function() {
    this.setData({
      loadSuccess: false,
      isLoadCompleted: true
    })
  }
})