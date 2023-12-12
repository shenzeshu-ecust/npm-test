import {
  cwx,
  CPage
} from '../../../../cwx/cwx.js';

import {
  shareListSearch,
  getAuthInfo
} from '../sendService.js'
import dateUtil from '../dateUtils.js'
import {
  shareSuccess
} from '../../utils/util.js';
import { logExpose } from '../../utils/actionCode';
import { SHARE_CARD_LIST_BUTTON } from '../constant';
import CtsConstant from '../../utils/CtsConstant';

CPage({
  pageId: "10650011693",
  checkPerformance: true,
  locationInfo: {
    cityID: 0
  },

  /*
   * 页面的初始数据
   */
  data: {
    headImageUrl: "",
    headCitys: "",
    cardList: [],
    smartTripIds: "", // ,号隔开
    isShowTraveler: false,
    fromUid: null,
    addActionCode: "c_alltrip_share_addtrip_click",
    checktripActionCode: "c_alltrip_share_checktrip_click",
    isShowRealnameEntry: false,
    addBtnStatus: -1,
    isFinishLoading: false
  },

  onLoad: function (options) {
    let parmeter = options || {};
    this.setData({
      smartTripIds: options.smartTripIds,
      isShowTraveler: options.isShowTraveler === '1',
      fromUid: options.uid,
    })
    // this.data.smartTripIds = options.smartTripIds;
    this.startLocation();
  },

  startLocation: function () {
    let localThis = this;
    cwx.locate.startGetCtripCity(function (resp) {
      if (!resp.error) {
        let ciytEntity = resp.data.CityEntities[0];
        if (ciytEntity) {
          localThis.locationInfo.cityID = ciytEntity.CityID;
        }
      }
      cwx.startPullDownRefresh();
    }, 'schedule-wxlbs');
  },

  onPullDownRefresh: function() {
    Promise.all([this.getSharedList(), this.getRealnameInfo()])
      .then(([cardList, isShowRealnameEntry]) => {
        const cardTypeList = cardList.map(t => t.cardType);
        // 埋点
        logExpose({
          AC: 'schedule_cardShare_page',
          EXT: {
            businessType: cardTypeList.join(','),
            cardCount: cardList?.length,
            ifCF: isShowRealnameEntry,
            addButtonType: this.data.addBtnStatus
          }
        })
      })
      .catch(e => console.log(e))
  },

  getSharedList: function () {
    cwx.showLoading({
      title: '加载中',
      mask: true
    })
    return shareListSearch({
      cityId: this.locationInfo.cityID,
      smartTripIds: this.data.smartTripIds,
      fromUid: this.data.fromUid
    }).then(res => {
      let handDate = this.handleCardSource(res.cardList);
      this.setData({
        headImageUrl: res.headImage || '',
        headCitys: handDate.citys,
        cardList: handDate.cards,
        addBtnStatus: res.buttonType,
        isFinishLoading: true
      })
      cwx.stopPullDownRefresh();
      return handDate.cards;
    }).catch(error => {
      cwx.stopPullDownRefresh();
      this.setData({
        isFinishLoading: true
      })
    }).finally(() => {
      cwx.hideLoading();
    });
  },

  handleCardSource: function (cardList) {
    let list = cardList || [];
    let lastDate = '';
    let cityList = [];
    let cards = list.map((item) => {
      let model = {
        smartTripId: item.smartTripId,
        cardIcon: item.cardIcon,
        cardType: item.cardType,
        cardSource: item.cardSource,
        timePoint: item.timePoint,
        startCityName: item.startCityName,
        endCityName: item.endCityName,
        displayedCityName: item.displayedCityName,
        isCommonCard: item.isCommonCard,
        flightCard: item.sharedFlightCard ? item.sharedFlightCard.card : null,
        trainCard: item.sharedTrainCard ? item.sharedTrainCard.card : null,
        carCard: item.sharedCarCard ? item.sharedCarCard.card : null,
        selfDrivingCard: item.sharedSelfDrivingCard ? item.sharedSelfDrivingCard.card : null,
        busCard: item.sharedBusCard ? item.sharedBusCard.card : null,
        shipCard: item.sharedShipCard ? item.sharedShipCard.card : null,
        hotelCard: item.sharedHotelCard ? item.sharedHotelCard.card : null,
        bnbCard: item.sharedBnbCard ? item.sharedBnbCard.card : null,
        customizedHotelCard: item.sharedCustomizedHotelCard ? item.sharedCustomizedHotelCard.card : null,
        ticketCard: item.sharedTicketCard ? item.sharedTicketCard.card : null,
        teamTourCard: item.sharedTeamTourCard ? item.sharedTeamTourCard.card : null,
        ttdCard: item.sharedTtdCard ? item.sharedTtdCard.card : null,
        wiFiCard: item.sharedWiFiCard ? item.sharedWiFiCard.card : null,
        memoCard: item.sharedMemoCard ? item.sharedMemoCard.card : null,
        calendarMemoCard: item.sharedCalendarMemoCard ? item.sharedCalendarMemoCard.card : null,
        activityMemoCard: item.sharedActivityMemoCard ? item.sharedActivityMemoCard.card : null,
        airportLoungeCard: item.sharedAirportLoungeCard ? item.sharedAirportLoungeCard.card : null,
        cruiseCard: item.sharedCruiseCard ? item.sharedCruiseCard.card : null,
        travelPlanCard: item.sharedTravelPlanCard ? item.sharedTravelPlanCard : null,
        commonCard: item.sharedCommonCard ? item.sharedCommonCard.card : null
      }
      // model.isShowTime = !dateUtil.isSameDate(lastDate, item.timePoint);
      model.sharedCard = true;
      model.marginLeft = 24;
      model.marginRight = 24;
      model.isShowTraveler = this.data.isShowTraveler;
      lastDate = item.timePoint;
      // 接送机&包车展示新卡片样式
      if (CtsConstant.IS_CHARTERED_PICK_DROP.includes(item.cardType)) {
        model.isNewCarCard = true;
      }
      if (cityList.indexOf(item.displayedCityName) === -1){
        cityList.push(item.displayedCityName)
      }
      return model;
    })

    return {
      cards,
      citys: cityList.reduce(((total, next) => {
        if(total){
          return total + '·' + next;
        }else{
          return total + next;
        }
      }), "")
    }
  },


  onShareAppMessage: function (res) {

    let localThis = this;
    if (res.from === 'button') {
      this.ubtTrace(102325, {
        actionCode: 'c_alltrip_share_click',
        actionType: 'click'
      });
    }
  
    return {
      title: "行程信息",
      path: '/pages/schedule/pages/shareList/shareList?smartTripIds=' + this.data.smartTripIds,
      imageUrl: 'https://pages.ctrip.com/schedule/photo/sku_wxshare_itinerary.png',
      success: function (res) {
        shareSuccess(res, localThis);
      }
    };
  },
  getRealnameInfo: function() {
    return getAuthInfo().then(data => {
      const authFlag = data.userAuthInfo?.authFlag;
      const cardType = data.userAuthInfo?.cardType;
      // 0未实名 3弱实名（但不包含港澳、台、护照）展示实名入口引导
      const isShowRealnameEntry = authFlag === 0 || (authFlag === 3 && ![2,7, 8].includes(cardType));
      this.setData({
        isShowRealnameEntry
      })
      return isShowRealnameEntry;
    }).catch(e => console.log(e, 999999))
  },
  onAddSchedule: function() {
    this.setData({
      addBtnStatus: SHARE_CARD_LIST_BUTTON.LOOK_MY_SCHEDULE
    })
  }
})