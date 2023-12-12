var _a, _b, _c;
import { TPage, twx } from '../../../business/tjbase/index';
import houseDetailApi from '../../../api/houseDetailApi';
import utils from '../../../utils/index';
import utilsDate from '../../../utils/date_format';
import variableJs from '../../../business/variable_config/js/variable.ctrip';
import DETAIL_CONFIG from './config/index';
var IS_TUJIA = variableJs.platformName === 'tujia';
var IS_CTRIP = variableJs.platformName === 'ctrip';
var IS_QUNAR = variableJs.platformName === 'qunar';
var app_type = 'weapp';
TPage({
  pageId: (_c = (_b = (_a = twx.trace) === null || _a === void 0 ? void 0 : _a.traceOptions) === null || _b === void 0 ? void 0 : _b.detail) === null || _c === void 0 ? void 0 : _c.pageId,
  data: {
    topNum: 0,
    unit: {},
    chatId: '',
    unitId: '',
    isPageError: false,
    isPageLoading: true,
    isPageErrorText: '页面加载失败，请重试',
    peopleCount: 1,
    isFromLandlord: false,
    isShare: false,
    landlordId: '',
    urlSence: '',
    _activityInfo: '',
    dateDescObj: {},
    dateObj: {},
    selectBegin: '',
    selectEnd: '',
    sWeekText: '',
    eWeekText: '',
    interval: 0,
    beginDate: null,
    endDate: null,
    productId: 0,
    currentNavIndex: 0,
    isShowNavBar: false,
    unitsSimilarHouseData: [],
    priceDescriptiopnData: {},
    peaceLiveData: {},
    businessLicenseModule: [],
    houseNumber: 0,
    navMapping: {
      topModule: '概览',
      facilityModule: '设施',
      landlordModule: '房东',
      commentModule: '点评',
      rulesModule: '须知',
      positionModule: '周边',
      unitsSimilarHouseModule: '推荐'
    },
    navBarList: [],
    topModule: {},
    facilityModule: null,
    landlordModule: null,
    commentModule: null,
    positionModule: null,
    rulesModule: null,
    pricePart: {},
    moduleSort: [],
    openLocationData: {},
    haowuProduct: {},
    favoriteHouseIdList: [],
    isLoginFlag: false,
    isShowDiscountPopup: false,
    isFirstLoad: true,
    isCtripOrQunar: IS_CTRIP || IS_QUNAR
  },
  _app: null,
  queryOptions: {},
  _unitId: '',
  beginDate: null,
  endDate: null,
  onLoad: function (options) {
    var _this = this;
    var _a, _b, _c;
    console.log('房屋详情页params:', options);
    wx.setNavigationBarTitle({
      title: variableJs.logoName
    });
    if (IS_CTRIP || IS_QUNAR) {
      if (IS_CTRIP) {
        utils.setRequestNeedHeadParamsToStorage({
          extension: {
            page: (_c = (_b = (_a = twx.trace) === null || _a === void 0 ? void 0 : _a.traceOptions) === null || _b === void 0 ? void 0 : _b.detail) === null || _c === void 0 ? void 0 : _c.pageId,
            channelid: options.channelid
          }
        });
      }
      var isProdEnv = twx.global.projectInfo.env.toLowerCase() === 'prd';
      var h5url = (!isProdEnv ? 'https://m.fvt.tujia.com' : 'https://m.tujia.com') + "/detail/" + options.unitId + ".htm?code=tbnbdetail" + ((options === null || options === void 0 ? void 0 : options.channelid) || '');
      var url = {
        h5url: encodeURIComponent(h5url)
      };
      wx.redirectTo({
        url: "/pages/tbnb/pages/common/webview/index?optionsData=" + JSON.stringify(url)
      });
      return;
    }
    if (IS_TUJIA) {
      this._app = getApp();
      if (this._app.getGlobalCode && this._app.getGlobalCode() == 'WxAppWifiCode') {
        options.code = 'WxAppWifiCode';
        options.istjsite = 'false';
      }
      this._app.initCfgAndCode && this._app.initCfgAndCode(options);
      if (options.activityInfo) {
        wx.getStorage({
          key: 'UNIT_LIST_PROMOTION_HOUSE',
          success: function (res) {
            if (res.data.houseId == options.unitId && res.data.advertUnitType === 8 && getCurrentPages().length > 1) {
              _this.adverHouseFeach(options.activityInfo);
            }
            wx.removeStorage({
              key: 'UNIT_LIST_PROMOTION_HOUSE'
            });
          },
          fail: function (err) {
            console.log(err);
          }
        });
      }
    }
    if (IS_QUNAR) {
      wx.setStorageSync('QUNAR_FROM_FOR_LOG', {
        fromForLog: options.fromForLog
      });
    }
    this._handleOptionsData(options);
    if (app_type === 'weapp' && IS_TUJIA && (options === null || options === void 0 ? void 0 : options.scene)) {
      return;
    }
    this._handlerAjaxData(options);
    this._handleSetDateText();
    this._handleCheckSharePage();
  },
  onShow: function () {
    var _this = this;
    if (app_type === 'weapp' && IS_TUJIA && this.data.urlSence) {
      return;
    }
    if (!IS_CTRIP && !IS_QUNAR) {
      this._getUnitDetailHouseDataHandle(this.beginDate, this.endDate).then(function (res) {
        _this._handleInitialNavModule(res);
        _this._getUnitsSimilarHouseDataHandle();
      });
    }
  },
  onShareAppMessage: function () {
    var houseInfo = this.data.topModule;
    var nextParsData = {
      unitId: this._unitId,
      beginDate: utilsDate.dateFormat(this.beginDate, 'yyyy-MM-dd'),
      endDate: utilsDate.dateFormat(this.endDate, 'yyyy-MM-dd')
    };
    var queryParams = Object.assign({}, this.queryOptions, nextParsData);
    if (!queryParams.code && IS_TUJIA) {
      queryParams.code = getApp().getGlobalCode();
    }
    return {
      title: houseInfo.houseName || '',
      imageUrl: houseInfo.housePicture && houseInfo.housePicture.housePics && houseInfo.housePicture.housePics[0] && houseInfo.housePicture.housePics[0].url,
      desc: "\u538C\u5026\u4E86\u5343\u7BC7\u4E00\u5F8B\u7684\u9152\u5E97\uFF1F\u8BD5\u8BD5" + variableJs.platformTitle + "\u5427\uFF0C\u5BA2\u6808\u3001\u6C11\u5BBF\u3001\u516C\u5BD3\u3001\u6700\u7F8E\u623F\u4E1C\uFF0C\u9664\u4E86\u9152\u5E97\uFF0C\u8FD9\u91CC\u4EC0\u4E48\u90FD\u6709~",
      path: utils.createUrlParamsString('/pages/tbnb/pages/main/detail/index', queryParams)
    };
  },
  adverHouseFeach: function (activityInfo) {
    var params = {
      parameters: activityInfo
    };
    houseDetailApi.forbidAttackHouseDetail({
      params: params
    });
  },
  handleDateSelectCallback: function (starDate, endDate, product) {
    this.beginDate = starDate;
    this.endDate = endDate;
    this._handleSetDateText();
    this._handleSetProductActivityInfo(product);
    this._getUnitDetailHouseDataHandle(starDate, endDate);
  },
  _handleSetProductActivityInfo: function (productInfo) {
    this.setData({
      _activityInfo: productInfo === null || productInfo === void 0 ? void 0 : productInfo.activityInfo
    });
  },
  _handleGetHouseData: function () {
    this._getUnitDetailHouseDataHandle(this.beginDate, this.endDate);
  },
  changeActiveUpdateHouse: function (e) {
    this.setData({
      productId: e.detail
    });
    this._handleGetHouseData();
  },
  _getUnitDetailHouseDataHandle: function (startDate, endDate) {
    var _this = this;
    var _a = this.data,
      _activityInfo = _a._activityInfo,
      peopleCount = _a.peopleCount,
      productId = _a.productId,
      isFirstLoad = _a.isFirstLoad;
    var params = {
      houseParameter: {
        houseId: this._unitId,
        houseGuid: '',
        graft: false,
        preview: false
      },
      productParameter: {
        activityInfo: _activityInfo,
        checkInDate: utilsDate.dateFormat(startDate, 'yyyy-MM-dd'),
        checkOutDate: utilsDate.dateFormat(endDate, 'yyyy-MM-dd'),
        needPrice: true,
        productId: productId,
        peopleCount: peopleCount
      }
    };
    isFirstLoad && this.setData({
      isPageLoading: true
    });
    return new Promise(function (resolve, reject) {
      houseDetailApi.getHouse({
        params: params,
        passthrough: {
          apiType: utils.distinguishPlatform({
            ctrip: 1,
            qunar: 1
          })
        }
      }).then(function (res) {
        var _a, _b, _c, _d, _e;
        console.log('新版详情页主接口:', res.data);
        var houseData = res.data || {};
        _this._handleSetProductActivityInfo((_b = (_a = houseData.pricePart) === null || _a === void 0 ? void 0 : _a.priceModule) === null || _b === void 0 ? void 0 : _b.product);
        _this.getDataOfEachModule(houseData);
        if ((_e = (_d = (_c = houseData.mainPart) === null || _c === void 0 ? void 0 : _c.dynamicModule) === null || _d === void 0 ? void 0 : _d.landlordModule) === null || _e === void 0 ? void 0 : _e.hotelId) {
          _this._handleSetVisitHouse(houseData);
        }
        if (IS_TUJIA) {
          var product = utils.formatGoodProduct(houseData);
          _this.setData({
            haowuProduct: product
          });
        }
        resolve(res.data);
      }).catch(function (err) {
        console.log('房屋信息主接口失败', err);
        var msg = err.errorMsg || '房屋信息错误';
        _this.setData({
          isPageError: true,
          isPageErrorText: msg
        });
        reject(err);
      }).finally(function () {
        isFirstLoad && _this.setData({
          isPageLoading: false,
          isFirstLoad: false
        });
      });
    });
  },
  getDataOfEachModule: function (res) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4;
    var _topModule = (_a = res.mainPart) === null || _a === void 0 ? void 0 : _a.topModule;
    var _positionModule = (_c = (_b = res.mainPart) === null || _b === void 0 ? void 0 : _b.dynamicModule) === null || _c === void 0 ? void 0 : _c.positionModule;
    var _openLocationData;
    if (_positionModule) {
      _openLocationData = {
        latitude: _positionModule === null || _positionModule === void 0 ? void 0 : _positionModule.latitude,
        longitude: _positionModule === null || _positionModule === void 0 ? void 0 : _positionModule.longitude,
        unitname: (_e = (_d = res.mainPart) === null || _d === void 0 ? void 0 : _d.topModule) === null || _e === void 0 ? void 0 : _e.houseName,
        address: _positionModule === null || _positionModule === void 0 ? void 0 : _positionModule.address,
        geoCoordSysType: _positionModule === null || _positionModule === void 0 ? void 0 : _positionModule.geoCoordSysType,
        isOversea: (_positionModule === null || _positionModule === void 0 ? void 0 : _positionModule.cityterritorytype) === 3
      };
    }
    var _commentModule = (_g = (_f = res.mainPart) === null || _f === void 0 ? void 0 : _f.dynamicModule) === null || _g === void 0 ? void 0 : _g.commentModule;
    res.houseCommentSummary = _commentModule;
    if (_commentModule) {
      var _subScores = ((_h = res.houseCommentSummary) === null || _h === void 0 ? void 0 : _h.subScores) || [];
      res.houseCommentSummary.overallDesc = utils.toDecimal((_commentModule === null || _commentModule === void 0 ? void 0 : _commentModule.overall) || 0, 1);
      res.houseCommentSummary.pictureCommentCount = ((_k = (_j = _commentModule === null || _commentModule === void 0 ? void 0 : _commentModule.comment) === null || _j === void 0 ? void 0 : _j.pictureList) === null || _k === void 0 ? void 0 : _k.length) || 0;
      if (_subScores && _subScores.length > 0) {
        res.houseCommentSummary.cleanlinessDesc = utils.getNumberFromString(_subScores[0] || '');
        res.houseCommentSummary.trafficDesc = utils.getNumberFromString(_subScores[1] || '');
        res.houseCommentSummary.servicesDesc = utils.getNumberFromString(_subScores[2] || '');
        res.houseCommentSummary.houseDecorationDesc = utils.getNumberFromString(_subScores[3] || '');
      }
      _commentModule.commentTagVo && _commentModule.commentTagVo.map(function (item) {
        item.count = utils.getNumberFromString(item.text);
        item.topic = item.text.slice(0, item.text.indexOf('('));
      });
      _commentModule.overall = utils.toDecimal(_commentModule.overall || 0, 1);
      if (_commentModule.comment) {
        _commentModule.comment.overall = utils.toDecimal(((_l = _commentModule.comment) === null || _l === void 0 ? void 0 : _l.overall) || 0, 1);
      } else {
        _commentModule.comment = {
          overall: utils.toDecimal(0, 1)
        };
      }
    }
    if (_topModule.commentBrief) {
      _topModule.commentBrief.overall = utils.toDecimal(((_m = _topModule === null || _topModule === void 0 ? void 0 : _topModule.commentBrief) === null || _m === void 0 ? void 0 : _m.overall) || 0, 1);
    }
    this.setData({
      unit: res,
      topModule: _topModule,
      facilityModule: (_p = (_o = res.mainPart) === null || _o === void 0 ? void 0 : _o.dynamicModule) === null || _p === void 0 ? void 0 : _p.facilityModule,
      landlordModule: (_r = (_q = res.mainPart) === null || _q === void 0 ? void 0 : _q.dynamicModule) === null || _r === void 0 ? void 0 : _r.landlordModule,
      rulesModule: (_t = (_s = res.mainPart) === null || _s === void 0 ? void 0 : _s.dynamicModule) === null || _t === void 0 ? void 0 : _t.rulesModule,
      priceDescriptiopnData: ((_u = res.mainPart) === null || _u === void 0 ? void 0 : _u.introductionModule) || {},
      businessLicenseList: ((_v = res.mainPart) === null || _v === void 0 ? void 0 : _v.businessLicenseModule) || [],
      houseNumber: res.houseId,
      peaceLiveData: ((_w = res.mainPart) === null || _w === void 0 ? void 0 : _w.ensureModule) || {},
      commentModule: _commentModule,
      positionModule: _positionModule,
      pricePart: res.pricePart,
      moduleSort: (_y = (_x = res.mainPart) === null || _x === void 0 ? void 0 : _x.dynamicModule) === null || _y === void 0 ? void 0 : _y.moduleSort,
      openLocationData: _openLocationData,
      chatId: (_1 = (_0 = (_z = res.pricePart) === null || _z === void 0 ? void 0 : _z.contractModule) === null || _0 === void 0 ? void 0 : _0.imSummary) === null || _1 === void 0 ? void 0 : _1.chatID,
      landlordId: (_4 = (_3 = (_2 = res.pricePart) === null || _2 === void 0 ? void 0 : _2.contractModule) === null || _3 === void 0 ? void 0 : _3.imSummary) === null || _4 === void 0 ? void 0 : _4.landlordAccountId
    });
  },
  _handleSetVisitHouse: function (houseData) {
    var _this = this;
    var _a, _b, _c, _d;
    var hotelId = (_c = (_b = (_a = houseData.mainPart) === null || _a === void 0 ? void 0 : _a.dynamicModule) === null || _b === void 0 ? void 0 : _b.landlordModule) === null || _c === void 0 ? void 0 : _c.hotelId;
    var _e = ((_d = houseData.mainPart) === null || _d === void 0 ? void 0 : _d.topModule) || {},
      houseName = _e.houseName,
      housePicture = _e.housePicture;
    twx.login.isLogin().then(function (resLogin) {
      if (resLogin) {
        houseDetailApi.visitHouse({
          params: {
            houseId: _this._unitId,
            hotelId: hotelId,
            houseName: houseName,
            housePicture: housePicture && housePicture.defaultPictureURL
          },
          passthrough: {
            apiType: utils.distinguishPlatform({
              ctrip: 2,
              qunar: 1
            })
          }
        }).then(function () {
          console.log('浏览器记录提交成功');
        });
      }
    });
  },
  _handleInitialNavModule: function (res) {
    var _a;
    var dynamicModule = (_a = res.mainPart) === null || _a === void 0 ? void 0 : _a.dynamicModule;
    var _navMapping = this.data.navMapping;
    var _navBarList = [];
    dynamicModule.moduleSort && dynamicModule.moduleSort.forEach(function (i) {
      var item = {
        name: _navMapping[i],
        top: 0,
        id: i
      };
      if (dynamicModule[i] && _navMapping[i]) {
        _navBarList.push(item);
      }
    });
    _navBarList.unshift({
      name: '概览',
      top: 0,
      id: 'topModule'
    });
    _navBarList.push({
      name: '推荐',
      top: 0,
      id: 'unitsSimilarHouseModule'
    });
    this.setData({
      navBarList: _navBarList
    });
  },
  _getUnitsSimilarHouseDataHandle: function () {
    var _this = this;
    var navBarList = this.data.navBarList;
    return new Promise(function (resolve, reject) {
      houseDetailApi.getSimilarUnits({
        params: {
          houseId: _this._unitId
        },
        passthrough: {
          apiType: utils.distinguishPlatform({
            ctrip: 0,
            qunar: 1
          })
        }
      }).then(function (res) {
        var similarHouseData = res.data || {};
        if (!similarHouseData.items || !similarHouseData.items.length) {
          navBarList.pop();
        }
        _this.setData({
          navBarList: navBarList,
          unitsSimilarHouseData: similarHouseData.items || []
        });
        console.log('unitsSimilarHouseData', _this.data.unitsSimilarHouseData);
        resolve(res.data);
      }).catch(function (err) {
        reject(err);
      }).finally(function () {
        _this.getAnchorIdTop();
        _this._getFavoriteHouseData();
      });
    });
  },
  _getFavoriteHouseData: function () {
    var _this = this;
    twx.login.isLogin().then(function (resLogin) {
      if (resLogin) {
        houseDetailApi.getfavorite({
          params: {},
          passthrough: {
            apiType: utils.distinguishPlatform({
              ctrip: 0,
              qunar: 1
            })
          }
        }).then(function (res) {
          var _a;
          console.log('favorite', res);
          _this.setData({
            favoriteHouseIdList: ((_a = res.data) === null || _a === void 0 ? void 0 : _a.houseIdList) || []
          }, function () {
            _this._matchFavoriteHouseById();
          });
        }).catch(function (err) {
          console.log(err);
        });
      }
    });
  },
  _matchFavoriteHouseById: function () {
    var _this = this;
    if (!this.data.unitsSimilarHouseData.length) {
      return;
    }
    var unitsSimilarHouseData = this.data.unitsSimilarHouseData;
    unitsSimilarHouseData.forEach(function (houseData, index) {
      if (_this.data.favoriteHouseIdList.indexOf(houseData.houseId) != -1) {
        unitsSimilarHouseData[index].isFavoriteHouse = true;
      } else {
        unitsSimilarHouseData[index].isFavoriteHouse = false;
      }
    });
    this.setData({
      unitsSimilarHouseData: unitsSimilarHouseData
    });
  },
  observeScroll: function (e) {
    var scrollTopVal = e.detail.scrollTop || 0;
    if (scrollTopVal >= this.data.navBarList[1].top) {
      this.setData({
        isShowNavBar: true
      });
    } else {
      this.setData({
        isShowNavBar: false
      });
    }
    var currentNav = 0;
    for (var i = this.data.navBarList.length - 1; i >= 0; i--) {
      if (scrollTopVal > this.data.navBarList[i].top) {
        currentNav = i;
        break;
      }
    }
    this.setData({
      currentNavIndex: currentNav
    });
  },
  _handleChangeNav: function (e) {
    var index = e.detail;
    var navBarList = this.data.navBarList;
    var _topNum = 0;
    if (index === 0) {
      _topNum = 0;
    } else {
      _topNum = navBarList[index].top + 8;
    }
    this.setData({
      topNum: _topNum
    });
  },
  getAnchorIdTop: function () {
    var _this = this;
    new Promise(function (resolve) {
      var query = wx.createSelectorQuery().in(_this);
      query.select("#headerSwiper").boundingClientRect();
      for (var i = 0; i < _this.data.navBarList.length; i++) {
        query.select("#" + _this.data.navBarList[i].id).boundingClientRect();
      }
      query.selectViewport().scrollOffset();
      query.exec(function (res) {
        resolve(res);
      });
    }).then(function (res) {
      var prevAnchorAllHeight = 0;
      for (var i = 0; i < _this.data.navBarList.length; i++) {
        prevAnchorAllHeight = !i ? 261 : prevAnchorAllHeight + res[i].height;
        _this.data.navBarList[i].top = prevAnchorAllHeight;
      }
    });
  },
  _handleOptionsData: function (options) {
    var _this = this;
    var numberRegx = /^[0-9]+$/g;
    this.queryOptions = options;
    if (options.beginDate) {
      var curDate = new Date();
      var optionsbegindate = new Date(options.beginDate).getTime();
      curDate.setHours(0, 0, 0, 0);
      if (optionsbegindate < curDate.getTime()) {
        options.beginDate = new Date().toISOString();
        options.endDate = new Date(curDate.setDate(curDate.getDate() + 1)).toISOString();
      }
    }
    if (options.nextPars) {
      var nextPars = void 0;
      try {
        nextPars = JSON.parse(decodeURIComponent(options.nextPars)) || {};
      } catch (e) {}
      options.unitId = nextPars.unitId;
      options.beginDate = nextPars.beginDate;
      options.endDate = nextPars.endDate;
    }
    if (options.isShare || options.nextPars) {
      this.setData({
        isShare: true
      });
    }
    var shareType = wx.getStorageSync('FROM_TYPE');
    if (options.scene) {
      var _a = utils.senceFilter(options.scene),
        id = _a[0],
        from = _a[1],
        landlordId = _a[2];
      var landlordSourceChannelCode = '';
      var customerSourceChannelCode = '';
      var landlordSearchInfo = {};
      var orderSourceLandlordId = landlordId;
      options.unitId = id;
      var urlSence = options.scene;
      var fromVal = numberRegx.test(from) && parseInt(from, 10);
      this.setData({
        isShare: true,
        landlordId: landlordId || '',
        urlSence: urlSence
      });
      if (IS_TUJIA) {
        if (fromVal === DETAIL_CONFIG.FROM_PC_HOUSE_DETAIL_QR) {
          this._handleSetGlobalCode(landlordId);
          return false;
        }
        if (fromVal === DETAIL_CONFIG.FROM_TYPE_SHARE_PUBLIC) {
          utils.dataTrack({
            traceKey: 'fangwureturnshijian',
            traceData: {
              fangwureturn: from
            },
            pageName: 'detail'
          });
        }
        if (fromVal === DETAIL_CONFIG.FROM_TYPE_LANDLORD_NEW || fromVal === DETAIL_CONFIG.FROM_LANDLORD_PACKGET) {
          landlordSourceChannelCode = 'fdlx010901';
          this.setData({
            isFromLandlord: true
          });
          this._handleSetGlobalCode(DETAIL_CONFIG.LANDLORD_NEW_CODE);
        }
        if (fromVal === DETAIL_CONFIG.FROM_TYPE_SHARE_HOUSE) {
          landlordSourceChannelCode = 'tjfy010901';
          this._handleSetGlobalCode(DETAIL_CONFIG.FROM_TYPE_SHARE_HOUSE_CODE);
        }
        if (app_type === 'weapp') {
          var isProdEnv = twx.global.projectInfo.env.toLowerCase() === 'prd';
          var h5url = (!isProdEnv ? 'https://m.fvt.tujia.com' : 'https://m.tujia.com') + "/detail/" + options.unitId + ".htm?code=" + (this._app.getGlobalCode() || '');
          var params = {
            h5url: encodeURIComponent(h5url)
          };
          Object.assign(params, {
            orderSourceLandlordId: orderSourceLandlordId,
            landlordSourceChannelCode: landlordSourceChannelCode,
            customerSourceChannelCode: customerSourceChannelCode,
            landlordSearchInfo: landlordSearchInfo
          });
          wx.redirectTo({
            url: "/pages/tbnb/pages/common/webview/index?optionsData=" + JSON.stringify(params)
          });
          return;
        }
      }
    } else if (IS_TUJIA && numberRegx.test(shareType) && parseInt(shareType, 10) === DETAIL_CONFIG.FROM_TYPE_SHARE_HOUSE) {
      this._handleSetGlobalCode(DETAIL_CONFIG.FROM_TYPE_SHARE_HOUSE_CODE);
      wx.getStorage({
        key: 'FROM_TYPE_SHARE_HOUSE_landlordId',
        success: function (res) {
          _this.setData({
            isShare: true,
            landlordId: res.data
          });
          wx.removeStorage({
            key: 'FROM_TYPE'
          });
          wx.removeStorage({
            key: 'FROM_TYPE_SHARE_HOUSE_landlordId'
          });
        }
      });
    }
  },
  _handleSetGlobalCode: function (code) {
    if (IS_TUJIA && this._app.setGlobalCode) {
      this._app.setGlobalCode(code);
    }
  },
  _handlerAjaxData: function (options) {
    this._unitId = options.unitId;
    this.beginDate = new Date();
    this.endDate = new Date(this.beginDate.getTime() + 1 * 24 * 60 * 60 * 1000);
    if (IS_TUJIA && !options.beginDate && !options.endDate) {
      options.beginDate = !!this._app.globalData.globalSearchData && this._app.globalData.globalSearchData.beginDate || '';
      options.endDate = !!this._app.globalData.globalSearchData && this._app.globalData.globalSearchData.endDate || '';
    }
    if (options.beginDate && options.endDate) {
      var oBeginDate = new Date(options.beginDate);
      var oEndDate = new Date(options.endDate);
      if (oBeginDate) {
        this.beginDate = this.beginDate > oBeginDate ? this.beginDate : oBeginDate;
        this.endDate = this.endDate > oEndDate ? this.endDate : oEndDate;
      }
    }
    if (options.activityInfo) {
      this.setData({
        _activityInfo: options.activityInfo
      });
    }
    this.setData({
      unitId: options.unitId
    });
  },
  _handleSetDateText: function () {
    var sBegin = utilsDate.dateFormat(this.beginDate, 'yyyy-MM-dd');
    var sEnd = utilsDate.dateFormat(this.endDate, 'yyyy-MM-dd');
    var beginShow = utilsDate.dateFormat(this.beginDate, 'MM月dd日');
    var endShow = utilsDate.dateFormat(this.endDate, 'MM月dd日');
    var weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    var sBeginNew = new Date(sBegin);
    var sEndNew = new Date(sEnd);
    var sWeekText = weekday[sBeginNew.getDay()];
    var eWeekText = weekday[sEndNew.getDay()];
    this.setData({
      dateDescObj: {
        monthDesc: utilsDate.dateFormat(this.beginDate, 'MM')
      },
      dateObj: {
        beginDate: sBegin,
        endDate: sEnd
      },
      selectBegin: beginShow,
      selectEnd: endShow,
      sWeekText: sWeekText,
      eWeekText: eWeekText,
      interval: (+sEndNew - +sBeginNew) / (1 * 24 * 60 * 60 * 1000),
      beginDate: this.beginDate.getTime(),
      endDate: this.endDate.getTime()
    });
  },
  _handleCheckSharePage: function () {
    var routes = getCurrentPages();
    if (routes.length <= 1) {
      this.setData({
        isShare: true
      });
    }
  },
  _handleOpenCalendarPage: function () {
    if (IS_CTRIP) {
      return;
    }
    var _a = this.data,
      beginDate = _a.beginDate,
      endDate = _a.endDate,
      unitId = _a.unitId,
      _activityInfo = _a._activityInfo;
    var urlPath = '/pages/tbnb/pages/common/calendar/index';
    var urlParams = {
      beginDate: utilsDate.dateFormat(new Date(beginDate), 'yyyy-MM-dd'),
      endDate: utilsDate.dateFormat(new Date(endDate), 'yyyy-MM-dd'),
      unitId: unitId
    };
    if (!!_activityInfo) {
      urlParams.activityInfo = _activityInfo;
    }
    wx.navigateTo({
      url: utils.createUrlParamsString(urlPath, urlParams)
    });
  },
  _handleUpdateLoginFlag: function (res) {
    this.setData({
      isLoginFlag: res.detail.isLogined
    });
  },
  openDiscountPopup: function () {
    this.setData({
      isShowDiscountPopup: true
    });
  }
});