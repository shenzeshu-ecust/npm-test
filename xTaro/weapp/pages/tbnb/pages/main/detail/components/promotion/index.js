import { TComponent } from '../../../../../business/tjbase/index';
import redpacketsApi from '../../../../../api/getRedpacketsApi';
import variableJs from '../../../../../business/variable_config/js/variable.ctrip';
import utils from '../../../../../utils/index';
import { RED_PACKETS_API_STATUS } from './config/index';
var IS_TUJIA = variableJs.platformName === 'tujia';
TComponent({
  properties: {
    promotionInfo: {
      type: Object,
      value: {}
    },
    hotelId: {
      type: Number
    },
    landlordId: {
      type: Number
    }
  },
  data: {
    isShowBottomPopup: false,
    redpacketList: [],
    isTujia: IS_TUJIA
  },
  lifetimes: {},
  pageLifetimes: {},
  methods: {
    _wxToast: function (txt, sIcon) {
      if (sIcon === void 0) {
        sIcon = 'none';
      }
      wx.showToast({
        title: txt,
        icon: sIcon
      });
    },
    getRedPacketListData: function () {
      var _this = this;
      var promotionInfo = this.data.promotionInfo;
      return new Promise(function (resolve, reject) {
        redpacketsApi.getredpackets({
          params: {
            condition: promotionInfo.redPacketTagData.condition
          },
          passthrough: {
            apiType: utils.distinguishPlatform({
              ctrip: 0,
              qunar: 1
            })
          }
        }).then(function (res) {
          var _a, _b;
          console.log('红包列表数据:', res);
          if (((_a = res.data) === null || _a === void 0 ? void 0 : _a.list) && ((_b = res.data) === null || _b === void 0 ? void 0 : _b.list.length)) {
            _this.setData({
              redpacketList: res.data.list
            });
          }
          resolve(res);
        }).catch(function (err) {
          reject(err);
        });
      });
    },
    handleReceiveRedpackage: function () {
      var _this = this;
      var _a = this.properties,
        hotelId = _a.hotelId,
        landlordId = _a.landlordId;
      var params = {
        hotelId: hotelId,
        landlordId: landlordId
      };
      utils.platformLogin(params, function () {
        console.log('打开红包列表时登录成功');
        _this.getRedPacketListData().then(function () {
          var value = 1;
          if (_this.data.promotionInfo.redPacketTagData && _this.data.promotionInfo.redPacketTagData.partake) {
            value = 1;
          } else {
            value = 2;
          }
          utils.dataTrack({
            traceKey: 'house_detail_onClick_redPacket',
            traceData: {
              value: value
            },
            pageName: 'detail'
          });
          _this.setData({
            isShowBottomPopup: true
          });
        }).catch(function (err) {
          console.log('获取红包列表失败:', err);
          _this._wxToast('获取红包失败，请重试');
        });
      });
    },
    handleToggleDescription: function (e) {
      var redpacketList = this.data.redpacketList;
      var _a = e.currentTarget.dataset,
        parindex = _a.parindex,
        index = _a.index;
      redpacketList.forEach(function (ele, idx) {
        ele.items.forEach(function (eleItem, eleIdx) {
          if (idx === parindex && eleIdx === index) {
            eleItem.isOpenDesc = !eleItem.isOpenDesc;
          }
        });
      });
      this.setData({
        redpacketList: redpacketList
      });
    },
    handleTapReceive: function (event) {
      var _this = this;
      var _a = event.currentTarget.dataset,
        index = _a.index,
        code = _a.code;
      redpacketsApi.receiveredpacketsync({
        params: {
          activityCode: code
        },
        passthrough: {
          apiType: utils.distinguishPlatform({
            ctrip: 0,
            qunar: 1
          })
        }
      }).then(function (res) {
        console.log('领取红包', res);
        utils.dataTrack({
          traceKey: 'house_detail_receive_redPacket_status',
          traceData: {
            value: 1,
            code: code
          },
          pageName: 'detail'
        });
        _this._wxToast('领取成功');
        _this.getRedPacketListData();
        _this.triggerEvent('triggerRefreshHouseInfo');
      }).catch(function (err) {
        if (err.errorNo === RED_PACKETS_API_STATUS.RED_PACKET_OUT) {
          var redpacketlist_1 = [];
          _this.data.redpacketList.forEach(function (reditem) {
            reditem.items.forEach(function (val, idx) {
              if (idx === index) {
                val.isOut = true;
              }
            });
            redpacketlist_1.push(reditem);
          });
          _this.setData({
            redpacketList: redpacketlist_1
          });
        } else if (err.errorNo === RED_PACKETS_API_STATUS.NO_LOGIN) {
          var _a = _this.properties,
            hotelId = _a.hotelId,
            landlordId = _a.landlordId;
          var params = {
            hotelId: hotelId,
            landlordId: landlordId
          };
          utils.platformLogin(params, function () {
            console.log('领红包时登录成功');
          });
        } else if (err.errorNo === RED_PACKETS_API_STATUS.RED_PACKET_EXIST) {
          _this._wxToast('已领取');
        } else if (err.errorNo === RED_PACKETS_API_STATUS.RED_PACKET_END) {
          _this._wxToast('已结束');
        } else if (err.errorNo === RED_PACKETS_API_STATUS.RED_PACKET_ERROR) {
          _this._wxToast('领取失败');
          utils.dataTrack({
            traceKey: 'house_detail_receive_redPacket_status',
            traceData: {
              value: 2,
              code: code
            },
            pageName: 'detail'
          });
        }
      });
    },
    handleGoLinkList: function (event) {
      var item = event.currentTarget.dataset.item;
      var navigateUrl = item.goLink.navigateUrl;
      if (IS_TUJIA && navigateUrl && navigateUrl !== '#') {
        wx.navigateTo({
          url: navigateUrl
        });
      }
    },
    handlePromotionJump: function () {
      var _a;
      var promotionInfo = this.properties.promotionInfo;
      var jumpUrl = (_a = promotionInfo === null || promotionInfo === void 0 ? void 0 : promotionInfo.urgencyPromotion) === null || _a === void 0 ? void 0 : _a.jumpUrl;
      if (jumpUrl) {
        utils.openWebview(jumpUrl);
      }
    }
  }
});