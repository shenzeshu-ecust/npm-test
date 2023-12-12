cwx.config.init();
import {
  cwx,
  CPage
} from '../../../cwx/cwx.js';
import CtsConstant from '../utils/CtsConstant.js'
import { shareSuccess, getTimelineService } from '../utils/util.js'
import { deleteCardAC } from "../cardEdit.js";
import { logClick, logParameter, logExpose, cardClickParameter } from '../utils/actionCode.js';

const duration = 300; //动画时长
const initMarginLeftValue = 60;
const initMarginRightValue = 20;

CPage({
  pageId: "10650009139",
  locationInfo: {
    cityID: 0
  },
  lastAuth: '',
  needPagecode: false,

  isLoadingScheduleList: false,
  isLoadingTravelInfoList: false,
  checkPerformance: true,
  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    cardList: [],
    activity: null,
    isLogin: true,
    travelPlanList: [],
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // clearHasSlideCard();

    wx.showShareMenu({
      withShareTicket: true,
    });
    this.lastAuth = cwx.user.auth;
    this.startLocation();
  },

  pageDisplayCode: function(){
    if(this.data.isLogin){
      if (this.data.cardList.length == 0){
        this.ubtTrace(102324, {
          actionCode: "schedule_empty_trip",
          actionType: 'display'
        });
      }
      else{
        this.ubtTrace(102324, {
          actionCode: "schedule",
          actionType: 'display'
        });
      }
    }
    else{
      this.ubtTrace(102324, {
        actionCode: "unlogin",
        actionType: 'display'
      });
    }
  },

  onShow: function (options) {
    let that = this;
    cwx.user.checkLoginStatusFromServer(function (res) {
      that.setData({
        isLogin: res
      })
    });
    if (cwx.user.auth != this.lastAuth){
      this.lastAuth = cwx.user.auth;
      this.setData({
        cardList: []
      });
      this.needPagecode = true;
      cwx.startPullDownRefresh();
    }
    else{
      if (!this.needPagecode){//避免与服务列表返回后的埋点重复
        this.pageDisplayCode();
      }
    }
  },

  startLocation: function () {
    let localThis = this;
    localThis.needPagecode = true;
    cwx.locate.startGetCtripCity(function (resp) {
      if (!resp.error) {
        let ciytEntity = resp.data.CityEntities[0];
        if (ciytEntity) {
          localThis._saveLocationCity(ciytEntity.cityName, resp.data.CityLatitude, resp.data.CityLongitude);
          localThis.locationInfo.cityID = ciytEntity.CityID;
          localThis.locationInfo.latitude = resp.data.CityLatitude;
          localThis.locationInfo.longitude = resp.data.CityLongitude;
          cwx.schedule.locationInfo = localThis.locationInfo;
        }
      }
      cwx.startPullDownRefresh();
    }, 'schedule-wxlbs');
  },

  onPullDownRefresh: function () {
    if (cwx.user.isLogin()) {
      this.setData({
        isLoading: true,
      });
      this.isLoadingScheduleList = true;
      this.isLoadingTravelInfoList = true;
      this.getScheduleList();
      this.getTravelPlanInfo();
    }
    else{
      if (this.needPagecode) {
        this.pageDisplayCode();
        this.needPagecode = false;
      }
      cwx.stopPullDownRefresh();
      this.setData({
        isLoading: false
      });
    }
  },

  checkNeedDismissLoading: function () {
    if (!this.isLoadingScheduleList && !this.isLoadingTravelInfoList) {
      cwx.stopPullDownRefresh();
      this.setData({
        isLoading: false,
      })
    }
  },

  getScheduleList: function () {
    cwx.schedule.districtIds = '';
    getTimelineService().then( send => {
        let scheduleListSearch = send.scheduleListSearch;
        let getActivityInformationRequest = send.getActivityInformationRequest;

        cwx.showLoading({
          title: '加载中',
          mask: true
        })
        scheduleListSearch({
            cityId: this.locationInfo.cityID,
            callback: (result, data) => {
              if (result) {
                try {
                  this.handleGroupSource(data.groupList);
                  const systeminfo = wx.getSystemInfoSync()
                  let list = data.cardList;
                  list.forEach((item, index) => {
                    item.index = index + 1;
                    item.count = list.length;
                    // 接送机&包车展示新卡片样式
                    if (CtsConstant.IS_CHARTERED_PICK_DROP.includes(item.cardType)) {
                      item.isNewCarCard = true;
                    }
                    // 租车、汽车票、船票新样式同包车卡片一致
                    if (item.selfDrivingCard || item.busCard || item.shipCard) {
                      item.isNewCarCard = true;
                      item.carCard = item.selfDrivingCard || item.busCard || item.shipCard;
                    }
                    // 民宿卡片与酒店卡片视觉一样
                    if (item.bnbCard) {
                      item.hotelCard = item.bnbCard
                    }
                    logExpose(cardClickParameter(item));
                  })
                  if(this.needPagecode){
                    this.data.cardList = list;
                    this.pageDisplayCode();
                    this.needPagecode = false;
                  }
                  this.setData({
                    cardList: list,
                  });
                } catch (e) {
                  this.setData({
                    cardList: data.cardList
                  });
                }
              }

              //活动入口
              getActivityInformationRequest("")
                .then(res => {
                  if (res && res.name && res.jumpUrl) {

                    this.ubtTrace(102324, {
                      actionCode: "o_schedule_marketing_display",
                      actionType: 'display'
                    });
                    this.setData({
                      activity: res
                    })
                  }
                });
              cwx.hideLoading()
              this.isLoadingScheduleList = false
              this.checkNeedDismissLoading()
            }
          })
    });
  },

  getTravelPlanInfo: function () {
    getTimelineService().then( send => {
      let getTravelPlanInfo = send.getTravelPlanInfo;
      getTravelPlanInfo({
        callback: (result, data) => {
          if (result) {
            this.setData({
              travelPlanList: data.travelPlanList ?? []
            });
          }
          this.isLoadingTravelInfoList = false
          this.checkNeedDismissLoading()
        }
      })
    });
  },

  handleGroupSource(groupList){
    if(groupList){
      let districtIds = '';
      let uniqList = [];
      groupList.forEach((groupItem) => {
        if (uniqList.indexOf(groupItem.districtId) === -1) {
          if (districtIds) {
            districtIds += ',';
          }
          districtIds += groupItem.districtId;
          uniqList.push(groupItem.districtId);
        }
      })
      cwx.schedule.districtIds = districtIds;
    }
  },

  showScheduleLayer: function () {
    this.ubtTrace(102324, {
      actionCode: "schedule_addtrip",
      actionType: 'click',
      page: this.data.cardList.length > 0 ? "schedule" : "schedule_empty_trip"
    });
    this.setData({
      showAddScheduleLayer: true
    })
    //添加浮层
    if (!this.containerAnimation) {
      this.containerAnimation = wx.createAnimation()
    }
    this.containerAnimation.translateY(0).step({
      duration: duration
    });

    //背景色
    if (!this.backgrondAnimation) {
      this.backgrondAnimation = wx.createAnimation()
    }
    this.backgrondAnimation.backgroundColor('rgba(51, 51, 51,0.2)').step({
      duration: duration
    });

    this.setData({
      containerAnimation: this.containerAnimation.export(),
      backgrondAnimation: this.backgrondAnimation.export()
    });

  },
  doNothing: function () {

  },
  hideScheduleLayer: function () {
    this.ubtTrace(102324, {
      actionCode: "c_addtrip_back_click",
      actionType: 'click'
    });
    this.containerAnimation.translateY(440).step({
      duration: duration
    });
    this.backgrondAnimation.backgroundColor('rgba(51, 51, 51,0.0)').step({
      duration: duration
    });

    this.setData({
      containerAnimation: this.containerAnimation.export(),
      backgrondAnimation: this.backgrondAnimation.export()
    })

    let localThis = this;
    setTimeout(function () {
      localThis.setData({
        showAddScheduleLayer: false
      });
    }, 300)
  },
  showAddPage: function (e) {
    let biztype = e.currentTarget.dataset.biztype;
    if (biztype == 'flight') {
      this.ubtTrace(102324, {
        actionCode: "c_addtrip_switch_to_flight_tab",
        actionType: 'click'
      });
      cwx.navigateTo({
        url: '/pages/schedule/pages/cardAdd/flight/flight',
      })
    } else if (biztype == 'train') {
      this.ubtTrace(102324, {
        actionCode: "c_addtrip_switch_to_train_tab",
        actionType: 'click'
      });
      cwx.navigateTo({
        url: '/pages/schedule/pages/cardAdd/trainAdd/trainAdd',
      })
    }
    this.hideScheduleLayer();
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {

    let localThis = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      let shareModel = res.target.dataset.sharemodel;
      let actionCode = shareModel.actionCode;
      this.ubtTrace(102325, {
        actionCode: actionCode,
        actionType: 'click'
      });
      return {
        title: shareModel.title,
        path: shareModel.path,
        imageUrl: shareModel.imageUrl,
        success: function (res) {
          shareSuccess(res, localThis);
        }
      }
    }
    return {
      title: '懂你的行程管家，一个就够了',
      path: '/pages/schedule/index/index',
      imageUrl: 'https://pages.ctrip.com/schedule/photo/sku_wxshare_itinerary.png',
      success: function (res) {
        shareSuccess(res, localThis);
      }
    };
  },

  _saveLocationCity(cityName, latitude, longitude) {
    cwx.schedule.g_locationCity = cityName;
    cwx.schedule.latitude = latitude;
    cwx.schedule.longitude = longitude;
  },

  touchStart: function (e) {
    let event = e.detail.event;
    let card = e.detail.card;
    card.touchStartX = event.touches[0].clientX;
    card.touchStartY = event.touches[0].clientY;

    let newCardList = this.data.cardList.map(item => {
      if (card.smartTripId == item.smartTripId) {
        item.touchStartX = card.touchStartX;
        item.touchStartY = card.touchStartY
      } else { //还原上一张卡片位置
        item.marginLeft = initMarginLeftValue;
        item.marginRight = initMarginRightValue;
        item.touchStartX = 0;
        item.touchStartY = 0;
      }
      return  item;
    });

    this.setData({
      cardList: newCardList,
    });
  },

  touchMove: function (e) {
    let event = e.detail.event;
    let card = e.detail.card;
    let touchMoveX = event.touches[0].clientX;
    let touchMoveY = event.touches[0].clientY;
    let distance = touchMoveX - card.touchStartX;
    let distanceY = touchMoveY - card.touchStartY;
    if (distance < 0 && Math.abs(distance) > Math.abs(distanceY)) { //左滑
      distance = Math.min(Math.abs(distance), card.optionViewWidth / 2);
      card.marginLeft = initMarginLeftValue - distance * 2;
      card.marginRight = initMarginRightValue + distance * 2;
    } else {
      card.marginLeft = initMarginLeftValue;
      card.marginRight = initMarginRightValue;
    }
    let newCardList = this.data.cardList.map(item => {
      if (card.smartTripId == item.smartTripId) {
        item.marginLeft = card.marginLeft;
        item.marginRight = card.marginRight;
      }
      return item;
    });
    this.setData({
      cardList: newCardList //this.handleCardSource(newCardList),
    });
  },

  touchEnd: function (e) {
    let event = e.detail.event;
    let card = e.detail.card;
    let touchMoveX = event.changedTouches[0].clientX;
    let distance = touchMoveX - card.touchStartX;
    if (Math.abs(distance) < 5) { //防止误滑操作
      return;
    }
    if (distance < 0 && Math.abs(distance) >= 80) { //左滑
    //   saveHasSlideCard(card.smartTripId);
      distance = Math.min(Math.abs(distance), card.optionViewWidth);
      card.marginLeft = initMarginLeftValue - card.optionViewWidth;
      card.marginRight = initMarginRightValue + card.optionViewWidth;
    } else {
    //   clearHasSlideCard();
      card.marginLeft = initMarginLeftValue;
      card.marginRight = initMarginRightValue;
    }
    let newCardList = this.data.cardList.map(item => {
      if (card.smartTripId == item.smartTripId) {
        item.marginLeft = card.marginLeft;
        item.marginRight = card.marginRight;
        item.animation = card.animation
      }
      return item;
    });

    this.setData({
      cardList: newCardList //this.handleCardSource(newCardList),
    });
  },

  touchCancel: function (e) {
    let newCardList = this.data.cardList.map(item => {
      item.marginLeft = initMarginLeftValue;
      item.marginRight = initMarginRightValue;
      item.touchStartX = 0;
      item.touchStartY = 0;
      return item;
    });
    this.setData({
      cardList: newCardList//this.handleCardSource(newCardList),
    });
  },

  deleteCard: function (e) {
    let card = e.detail.card;
    deleteCardAC(card.cardType);
    const cardSource = card.cardSource;
    if (cardSource == 1) {
      this._showDeleteDialog(card);
    } else {
      this._deleteCard(card);
    }
  },

  _deleteCard(card) {
    cwx.showLoading({
      title: '提交中',
      mask: true
    })

    logClick({
      ...logParameter(card),
      BH: 'del',
      SC: 'card'
    })
    getTimelineService().then( send => {
        let deleteCard = send.deleteCard;
        deleteCard({
            smartTripId: card.smartTripId,
            locationCityId: cwx.schedule.smartTripId
          }).then((result) => {
            cwx.hideLoading();
            cwx.startPullDownRefresh({});
          }).catch(error => {
            cwx.hideLoading();
            wx.showToast({
              icon: "none",
              title: '删除未成功，请稍后再试',
            });
          });
    });
  },

  _showDeleteDialog(card) {
    let that = this;
    wx.showModal({
      title: '',
      content: '卡片删除后将无法在行程中查看, 对应订单不会取消, 确认删除?',
      confirmText: '删除',
      confirmColor: "#1980FE",
      cancelColor: "#1980FE",
      success(res) {
        if (res.confirm) {
          that._deleteCard(card);
        }
      }
    })
  },

  //登陆
  login: function () {
    this.ubtTrace(102325, {
      actionCode: 'c_log_in',
      actionType: 'click',
    })

    let that = this;
    cwx.user.login({
      callback: (res) => {
        if (res.ReturnCode === "0") {//登录成功
          that.setData({
            isLogin: true
          }),
          cwx.startPullDownRefresh();
        }
      }
    })
  },

})