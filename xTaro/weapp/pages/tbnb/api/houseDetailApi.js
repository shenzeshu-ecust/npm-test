var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
import tjFetch from './tjFetch';
import hostConfig from '../config/ctrip/host';
import utils from '../utils/index';
import mpConfig from '../config/ctrip/mp_config';
var MP_TUJIA_HOST = hostConfig.MP_TUJIA_HOST;
var apiUrlConfig = {
  getHouse: utils.distinguishPlatform({
    tujia: MP_TUJIA_HOST + "/mphouse/gethouse/v3/bnb",
    ctrip: '/restapi/soa2/16593/getHouse4Bnb',
    qunar: '/app/house/gethouse/v3/bnb'
  }),
  getHouseCalendar: utils.distinguishPlatform({
    tujia: MP_TUJIA_HOST + "/mphouse/gethousecalendar",
    ctrip: '/restapi/soa2/16593/gethousecalendar',
    qunar: '/app/house/gethousecalendar'
  }),
  getSimilarUnits: utils.distinguishPlatform({
    tujia: MP_TUJIA_HOST + "/mpsearch/searchrecommendhouse/bnb",
    ctrip: '/restapi/soa2/18191/searchHouseRecommendListForBnb',
    qunar: '/app/search/searchrecommendhouse/bnb'
  }),
  visitHouse: utils.distinguishPlatform({
    tujia: MP_TUJIA_HOST + "/bingo/mp/footmark/visithouse",
    ctrip: '/bnbbingo/app/footmark/visithouse/bnb',
    qunar: '/app/footmark/visithouse/bnb'
  }),
  getOrderDetailPopup: utils.distinguishPlatform({
    tujia: MP_TUJIA_HOST + "/bingo/mp/promotion/ad/",
    ctrip: '',
    qunar: ''
  }),
  getServiceHotline: utils.distinguishPlatform({
    tujia: MP_TUJIA_HOST + "/mphotel/getservicehotline/bnb",
    ctrip: '/restapi/soa2/16593/getServiceHotLine4Bnb',
    qunar: '/app/hotel/getservicehotline/bnb'
  }),
  addFavorite: utils.distinguishPlatform({
    tujia: MP_TUJIA_HOST + "/bingo/mp/favorite/addfavorite",
    ctrip: '/restapi/soa2/18191/favoriteaddforbnb',
    qunar: '/app/favorite/addfavorite/bnb'
  }),
  deleteFavorite: utils.distinguishPlatform({
    tujia: MP_TUJIA_HOST + "/bingo/mp/favorite/deletefavorite",
    ctrip: '/restapi/soa2/18191/favoritedeleteforbnb',
    qunar: '/app/favorite/deletefavorite/bnb'
  }),
  getfavorite: utils.distinguishPlatform({
    tujia: MP_TUJIA_HOST + "/bingo/mp/favorite/getfavorite",
    ctrip: '/restapi/soa2/18191/getfavoriteforbnb',
    qunar: '/app/favorite/getfavorite/bnb'
  }),
  forbidAttackHouseDetail: utils.distinguishPlatform({
    tujia: MP_TUJIA_HOST + "/bingo/mp/page/houseDetail"
  })
};
var houseDetaiApi = {
  getHouse: function (params) {
    return tjFetch.post(apiUrlConfig.getHouse, {
      data: params
    });
  },
  getHouseCalendar: function (params) {
    return tjFetch.post(apiUrlConfig.getHouseCalendar, {
      data: params
    });
  },
  getSimilarUnits: function (params) {
    return tjFetch.post(apiUrlConfig.getSimilarUnits, {
      data: params,
      isHeaderGeo: true
    });
  },
  visitHouse: function (params) {
    return tjFetch.post(apiUrlConfig.visitHouse, {
      data: params
    });
  },
  getOrderDetailPopup: function (params) {
    return tjFetch.post(apiUrlConfig.getOrderDetailPopup, {
      params: __assign(__assign({}, params), {
        adLocationCode: mpConfig.DETAIL_TANPING_CODE
      })
    });
  },
  getServiceHotline: function (params) {
    return tjFetch.post(apiUrlConfig.getServiceHotline, {
      data: params
    });
  },
  addFavorite: function (params) {
    return tjFetch.post(apiUrlConfig.addFavorite, {
      data: params
    });
  },
  deleteFavorite: function (params) {
    return tjFetch.post(apiUrlConfig.deleteFavorite, {
      data: params
    });
  },
  getfavorite: function (params) {
    return tjFetch.post(apiUrlConfig.getfavorite, {
      data: params
    });
  },
  forbidAttackHouseDetail: function (params) {
    return tjFetch.post(apiUrlConfig.forbidAttackHouseDetail, {
      data: params
    });
  }
};
export default houseDetaiApi;