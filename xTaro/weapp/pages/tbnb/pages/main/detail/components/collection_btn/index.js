import { TComponent, twx } from '../../../../../business/tjbase/index';
import utils from '../../../../../utils/index';
import houseDetailApi from '../../../../../api/houseDetailApi';
import globalVariable from '../../../../../business/variable_config/js/variable.ctrip';
var IS_TUJIA = globalVariable.platformName === 'tujia';
var _app = getApp();
TComponent({
  properties: {
    contractModule: {
      type: Object,
      value: {},
      observer: function (data) {
        if (data) {
          this.setData({
            contractModule: data
          });
        }
      }
    },
    unitId: {
      type: String,
      value: ''
    },
    favoriteCount: {
      type: Number,
      value: 0,
      observer: function (num) {
        num && this._handleFavoriteCount(num);
      }
    },
    hotelId: {
      type: Number
    },
    landlordId: {
      type: Number
    },
    favoriteHouseIdList: {
      type: Array,
      value: [],
      observer: function (favoriteHouseIdList) {
        var index = favoriteHouseIdList === null || favoriteHouseIdList === void 0 ? void 0 : favoriteHouseIdList.indexOf(Number(this.properties.unitId));
        if (index > -1) {
          this.setData({
            isCollection: true
          });
        } else {
          this.setData({
            isCollection: false
          });
        }
      }
    }
  },
  data: {
    numbersOfCollectionsDesc: '',
    isCollection: false,
    hearderCollectionImgList: globalVariable.hearderCollectionImgList,
    favoriteEventName: ''
  },
  lifetimes: {
    ready: function () {
      this._handleSetListener();
    }
  },
  methods: {
    _handleFavoriteCount: function (num) {
      var _numbersOfCollectionsDesc = '';
      if (num < 1000) {
        _numbersOfCollectionsDesc = num + '';
      } else if (num >= 1000 && num < 10000) {
        _numbersOfCollectionsDesc = num.toString().charAt(0) + "k+";
      } else if (num >= 10000 && num < 100000) {
        _numbersOfCollectionsDesc = num.toString().charAt(0) + "w+";
      } else {
        _numbersOfCollectionsDesc = '9w+';
      }
      this.setData({
        numbersOfCollectionsDesc: _numbersOfCollectionsDesc
      });
    },
    _handleCollect: function () {
      var _this = this;
      var _a = this.properties,
        hotelId = _a.hotelId,
        landlordId = _a.landlordId;
      var params = {
        hotelId: hotelId,
        landlordId: landlordId
      };
      utils.platformLogin(params, function () {
        _this._handleCollectOption();
      });
    },
    _handleCollectOption: function () {
      var _this = this;
      var isCollection = this.data.isCollection;
      var unitId = this.properties.unitId;
      var favoriteCount = this.properties.favoriteCount;
      isCollection ? favoriteCount-- : favoriteCount++;
      this.properties.favoriteCount = favoriteCount;
      this._handleFavoriteCount(favoriteCount);
      this.setData({
        isCollection: !isCollection
      });
      houseDetailApi[isCollection ? 'deleteFavorite' : 'addFavorite']({
        params: {
          houseId: Number(unitId)
        },
        passthrough: {
          apiType: utils.distinguishPlatform({
            ctrip: 0,
            qunar: 1
          })
        }
      }).then(function () {
        var _a, _b;
        _this.setData({
          isCollection: !isCollection
        });
        utils.toast(isCollection ? '收藏取消' : '收藏成功');
        if (IS_TUJIA) {
          if (isCollection) {
            _app.globalData.deleteFavorite(unitId);
          } else {
            _app.globalData.addFavorite(unitId);
          }
          (_a = twx.tjTbnb) === null || _a === void 0 ? void 0 : _a.event.emit(_this.data.favoriteEventName, !isCollection);
          (_b = twx.tjTbnb) === null || _b === void 0 ? void 0 : _b.event.emit('favoriteStatusUpdate', {
            unitId: unitId,
            isFavorite: !isCollection
          });
        }
      }).catch(function (err) {
        console.log('收藏错误error：', err);
        utils.toast('收藏失败');
        favoriteCount--;
        _this._handleFavoriteCount(favoriteCount);
        _this.setData({
          isCollection: !isCollection
        });
      });
    },
    _handleSetListener: function () {
      var unitId = this.properties.unitId;
      this.setData({
        favoriteEventName: "favoriteEvent_" + unitId
      });
    }
  }
});