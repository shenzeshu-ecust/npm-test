// pages/live/webcast/masterInfo/masterInfo.js
import common from '../../common/common.js';
import LiveUtil from '../../common/LiveUtil';
import DeviceUtil from '../../common/device.js';
import {
  cwx
} from '../../../../cwx/cwx.js';
import {
  getLiveAds
} from '../service/webcastRequest';

Component({
  /**
   * 组件的属性列表
   */
  // master,totalUserCount,noticeState,noticeList, headerTop, pageType, preVideoInfo,hotBanners,preVideMuted
  properties: {
    liveID:{
      type:Number,
      value:0
    },
    commentKeybordBottom: {
      type: Number,
      value: 0
    },
    master: {
      type: Object,
      value: {}
    },
    totalUserCount: {
      type: Number,
      value: 0
    },
    // noticeState: {
    //   type: Number,
    //   value: 0
    // },
    // noticeList: {
    //   type: Array,
    //   value: []
    // },
    headerTop: {
      type: Number,
      value: 0
    },
    pageType: {
      type: Number,
      value: 0
    },
    preVideoInfo: {
      type: Object,
      value: {}
    },
    // hotBanners: {
    //   type: Array,
    //   value: []
    // },
    preVideMuted: {
      type: Boolean,
      value: false
    }
  },
  lifetimes: {
    ready() {
      this.currentPage = cwx.getCurrentPage() || {};
    },
    detached() {

    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    hotBanners: [],
    noticeList: [],
    noticeState: 0,
  },
  tapShowNotice: false,
  hotBannersTraceList: [],

  /**
   * 组件的方法列表
   */
  methods: {
    showHotBanner: function (flag) {
      let hotBanners = this.data.hotBanners;
      let param = {
        liveId: this.properties.liveID,
        displayVersion: 2,
      };
      let prenoticeList = this.data.noticeList || [];
      let noticeState = 0;
      let noticeList = [];
      let noticeListCloseSwitch = null;
      let preNoticeState = this.data.noticeState;
      let needAutoHide = false;
      if (flag) {
        if (hotBanners && hotBanners.length) {
          hotBanners.map((item, index) => {
            if (item && item.name != 'topic') {
              item.items = [];
            }
          })
          this.setData({
            hotBanners: hotBanners
          })
        }
        getLiveAds(param, (res) => {
          if (common.checkResponseAck(res)) {
            //console.log('showHotBanner',res.data)
            hotBanners = res.data.liveAdModules || [];
            noticeList = res.data.announcements || [];
            noticeListCloseSwitch = res.data.announcementsCloseSwitch;
            if (noticeList && noticeList.length) {
              noticeState = this.handleNoticeState(noticeList) ? 1 : 0;
              if (noticeState == 1) {
                needAutoHide = true;
              }
            }
            if (prenoticeList.length > noticeList.length) { //删除的时候要展开
              noticeState = 1;
            }
            if (preNoticeState == 1 && noticeState == 1 && this.noticeTimer) {
              clearTimeout(this.noticeTimer);
              this.noticeTimer = null;
            }
            if (preNoticeState == 1 && noticeState == 0) { //更新挂件的时候 防止自动收起
              noticeState = 1;
            }

            hotBanners = this.handleHotBannerData(hotBanners);
            this.hotBannersTraceList = hotBanners;
            //console.log('_cover201',res.data.announcements,noticeList,noticeState)
            this.setData({
              hotBanners: hotBanners,
              noticeList: noticeList,
              noticeState: noticeState,
              // noticeListCloseSwitch: noticeListCloseSwitch
            }, () => {
              if (hotBanners && hotBanners.length) {
                hotBanners.forEach((item, index) => {
                  if (item && item.items && item.items[0]) {
                    let currentBanner = item.items[0];
                    this.hotBannerTrace('o_gs_tripshoot_lvpailive_activityicon_show', currentBanner, index, 0);
                    item.items[0].isLogged = true;
                  }
                })
                this.hotBannersTraceList = hotBanners;
              }
              if (noticeList.length > 0 && noticeState == 1) {
                LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_noticeopen_show')
                if (!this.tapShowNotice && noticeListCloseSwitch === true) {
                  this.hideNoticeAuto();
                }

              }

            })
          }
        })
      } else {
        this.setData({
          hotBanners: []
        })
        this.hotBannersTraceList = [];
      }
    },
    handleNoticeState: function (noticeList) {
      let storageNoticeList = wx.getStorageSync('LP_WEBCAST_NOTICELIST') || [];
      let liveID = this.properties.liveID;
      let needShowNotice = false;

      let currentNeedStorageList = [];
      noticeList.map((item, index) => {
        let hasSameNotice = false;
        if (storageNoticeList && storageNoticeList.length) {
          storageNoticeList.map((listItem, listIndex) => {
            if (listItem.liveID == liveID && listItem.id == item.id) {
              hasSameNotice = true;
              if (item.lastUpdateTime > listItem.lastUpdateTime) {
                needShowNotice = true;
                listItem.lastUpdateTime = item.lastUpdateTime;
              }
            }
          })
        }
        if (storageNoticeList.length <= 0 || !hasSameNotice) {
          let obj = item;
          item.liveID = liveID;
          currentNeedStorageList.push(obj);
        }
      })
      if (needShowNotice || currentNeedStorageList.length > 0) {
        needShowNotice = true;
      }
      if (currentNeedStorageList.length > 0) {
        storageNoticeList = storageNoticeList.concat(currentNeedStorageList);
      }
      wx.setStorage({
        key: "LP_WEBCAST_NOTICELIST",
        data: storageNoticeList
      })
      return needShowNotice;
    },
    handleHotBannerData: function (data) {
      let windowInfo = {
       windowWidth:DeviceUtil.windowWidth,
       windowHeight:DeviceUtil.windowHeight
      };
      if (data && data.length) {
        data.forEach((item, index) => {
          let position = item.position;
          let xRatio = position.xRatio || 0;
          let yRatio = position.yRatio || 0;
          let positionX = xRatio * windowInfo.windowWidth;
          let positionY = yRatio * windowInfo.windowHeight;
          let size = item.size;
          let bannerWidth = size.width * windowInfo.windowWidth || 0;
          let bannerHeight = size.height * windowInfo.windowWidth || 0;
          if (positionX + bannerWidth > windowInfo.windowWidth) {
            positionX = windowInfo.windowWidth - bannerWidth;
          }
          if (positionX < 0) {
            positionX = 0;
          }

          if (positionY + bannerHeight > windowInfo.windowHeight) {
            positionY = windowInfo.windowHeight - bannerHeight;
          }
          if (positionY < 0) {
            positionY = 0;
          }
          item.positionX = positionX;
          item.positionY = positionY;
          item.bannerWidth = bannerWidth;
          item.bannerHeight = bannerHeight;
        })
      }
      //console.log("handleHotBannerData",data,windowInfo)
      return data
    },
    hideNoticeAuto: function () {
      let noticeState = this.data.noticeState;
      let noticeList = this.data.noticeList;
      let hideNoticeTime = noticeList.length == 2 ? 8000 : 5000;

      if (noticeState == 1 && noticeList.length > 0) {
        this.noticeTimer = setTimeout(() => {
          this.setData({
            noticeState: 2
          })
        }, hideNoticeTime)
      }
    },
    hotBannerTrace: function (actionCode, data, swpierIndex, current) {
      let hotBannerTrace = this.hotBannersTraceList;
      let currentBanner = hotBannerTrace[swpierIndex];
      if (actionCode == 'o_gs_tripshoot_lvpailive_activityicon_show' && !currentBanner.items[current].isLogged || actionCode == 'o_gs_tripshoot_lvpailive_activityicon_click') {
        LiveUtil.sendUbtTrace(actionCode,{
          // liveID: this.currentPage.liveID,
          // liveState: this.currentPage.liveStatusText,
          activity_id: data.id,
          activity_type: 'widget',
          activityposition: current + 1,
        })
      }

    },

    showNotice: function () { //公告的状态
      console.log("showNotice")
      let noticeState = this.data.noticeState;
      if (noticeState == 1) {
        noticeState = 2;
        this.tapShowNotice = false;
        if (this.noticeTimer) {
          clearTimeout(this.noticeTimer);
          this.noticeTimer = null;
        }
      } else {
        noticeState = 1;
        this.tapShowNotice = true;
      }
      LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_notice_click', {
        noticeState: noticeState == 1 ? '点击后打开' : '点击后关闭'
      });
      if (noticeState == 1) {
        LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_noticeopen_show');
      }
      this.setData({
        noticeState: noticeState
      })
    },


    hideNoticeAuto: function () {
      let noticeState = this.data.noticeState;
      let noticeList = this.data.noticeList;
      let hideNoticeTime = noticeList.length == 2 ? 8000 : 5000;

      if (noticeState == 1 && noticeList.length > 0) {
        this.noticeTimer = setTimeout(() => {
          this.setData({
            noticeState: 2
          })
        }, hideNoticeTime)
      }
    },
    openVoice: function () {
      // let preVideMuted = this.data.preVideMuted;
      // this.setData({
      //     preVideMuted: !preVideMuted
      // })
      // LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_ismute', {
      //     isMute: preVideMuted ? '非静音' : '静音'
      // });
     this.triggerEvent('openVoice');
    },
    swiperChange: function (e) {
      //console.log("swiperChange",e)
      let name = e.currentTarget.dataset && e.currentTarget.dataset.name || '';
      let current = e.detail.current;
      let hotBanners = this.data.hotBanners;
      let currentBanner = {};
      let swpierIndex = e.currentTarget.dataset.swpierindex || 0;
      hotBanners.forEach((item, index) => {
        if (item && item.name == name) {
          currentBanner = item.items[current];
          this.hotBannerTrace('o_gs_tripshoot_lvpailive_activityicon_show', currentBanner, swpierIndex, current);

          item.items[current].isLogged = true;
        }
      })
      this.hotBannersTraceList = hotBanners;
    },
    jumpToHotBanner: function (e) {
      let data = e.currentTarget.dataset.info || {};
      let bannerIndex = e.currentTarget.dataset.index || 0;
      let swpierIndex = e.currentTarget.dataset.swpierindex || 0;
      if (data.wxUrl) {
        this.hotBannerTrace('o_gs_tripshoot_lvpailive_activityicon_click', data, swpierIndex, bannerIndex);
        this.currentPage.liveGoodsId = data.id || 0;
        if (data.wxUrl.includes('liveMore') && this.currentPage.selectComponent('.webcast-recommend')) {
          this.currentPage.selectComponent('.webcast-recommend')._showRecommentList();
        } else {
          LiveUtil.jumpToProductItem(data.wxUrl);
        }

      }
    },
    jumpToMasterHome: function () {
      const props = this.properties;
      let userId = props.master.masterID;
      LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_liveUser_icon');
      if (!cwx.user.isLogin()) {
        this.currentPage.toLogin();
        return;
      }
      this.triggerEvent('getUserInfo',{userId}, {});
      // this.currentPage.getUserInfo(userId);
    },
    doMasterFollow: function () {
      const props = this.properties;
      let master = props.master;
      let id = master.masterID;
      LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_liveUser_follow',{
        follow: "false",
        isLiveUser: 1,
      })
      this.triggerEvent('doTriggerFollow',{id}, {});
      // this.currentPage.doFollow(id);
    },
    doJumpGroupChatForUserIcon: function () {
      LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_follower_gruopChat_click')
      // this.currentPage.doJumpGroupChat();
      this.triggerEvent('doJumpGroupChat');
    },
    jumptoPoi: function (e) {
      let url = e.currentTarget.dataset.url || '';
      LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_desitnation_click')
      LiveUtil.jumpToProductItem(url);
    },
  }
})