import { __global } from './cwx/index';

var routeMap = {
  index: {
    route: 'pages/bus/index/index',
  },
  list: {
    route: 'pages/bus/taro/list/index',
  },
  newlist: {
    route: 'pages/bus/taro/list/index',
  },
  tarolist: {
    route: 'pages/bus/taro/list/index',
  },
  book: {
    route: 'pages/bus/book/book',
  },
  newBook: {
    route: 'pages/bus/taro/book/index',
  },
  obook: {
    route: 'pages/bus/obook/obook',
  },
  x: {
    route: 'pages/bus/book/x',
  },
  orderdetail: {
    route: 'pages/bus/orderdetail/orderdetail',
  },
  router: {
    route: 'pages/bus/router/index',
  },
  passenger: {
    route: 'pages/bus/passenger/passenger',
  },
  newPassenger: {
    route: 'pages/bus/taro/passenger/index',
  },
  insurance: {
    route: 'pages/bus/book/Insurance',
  },
  order: {
    route: 'pages/myctrip/list/list',
  },
  web: {
    route: 'pages/bus/web/index',
  },
  shareIndex: {
    route: 'pages/bus/share/shareIndex',
  },
  ship: {
    route: 'pages/ship/index/index',
  },
  stationPay: {
    route: 'pages/bus/stationPay/index',
  },
  sharePage: {
    route: 'pages/bus/share/index',
  },
  city: {
    route: 'pages/bus/city/index',
  },
  sendCoupon: {
    route: 'pages/bus/sendcoupon/index',
  },
  coupon: {
    route: 'pages/bus/coupon/coupon',
  },
};

var main = {
  index: {
    pageid: '10320614135',
    pageidPromotion: '10320661727',
  },
  newlist: {
    pageid: '10320614136',
    pageidPromotion: '10320661728',
  },
  list: {
    pageid: '10320614136',
    pageidPromotion: '10320661728',
  },
  tarolist: {
    pageid: '10320614136',
    pageidPromotion: '10320661728',
  },
  book: {
    pageid: '10320614137',
    pageidPromotion: '10320661729',
  },
  newBook: {
    pageid: '10320614137',
  },
  x: {
    pageid: '10650013558',
  },
  orderdetail: {
    pageid: '10320614138',
    pageidPromotion: '10320661730',
  },
  router: {
    pageid: '10320677779',
  },
  insurance: {
    pageid: '10650007096',
  },
  shareIndex: {
    pageid: '10650006898',
  },
  sharePage: {
    pageid: '10650006898',
  },
  stationPay: {
    pageid: '10650009916',
  },
  tips: {
    pageid: '10650011670',
  },
  quesIndex: {
    pageid: '10650026285',
  },
  quesResult: {
    pageid: '10650025392',
  },
  member: {
    pageid: '10650026563',
  },
  graduate: {
    pageid: '10650027189',
  },
  wallet: {
    pageid: '10650026784',
  },
  tasklist: {
    pageid: '10650028431',
  },
  purselist: {
    pageid: '10650028433',
  },
};

let weixin = {
  index: {
    pageid: '10650042969',
  },
  newlist: {
    pageid: '10650042973',
  },
  tarolist: {
    pageid: '10650042973',
  },
  list: {
    pageid: '10650042973',
  },
  x: {
    pageid: '10650076784',
  },
  book: {
    pageid: '10650042981',
  },
  newBook: {
    pageid: '10650042981',
  },
  orderdetail: {
    pageid: '10650047296',
  },
  city: {
    pageid: '10650067388',
  },
  obook: {
    pageid: '10650069124',
  },
};

var bus = {
  index: {
    pageid: '10320655420',
  },
  newlist: {
    pageid: '10320655422',
  },
  list: {
    pageid: '10320655422',
  },
  book: {
    pageid: '10320655423',
  },
  newBook: {
    pageid: '10320655423',
  },
  orderdetail: {
    pageid: '10320655424',
  },
};

var pageidConfig = {
  main: main,
  wx0e6ed4f51db9d078: weixin,
  wx1746b19d13d9bbe7: bus,
};

var RrouterMap = {};
var RouterMap = {};
(function merge() {
  var appid = __global.appId;
  var mainPidConfig = pageidConfig['main'];
  var pidConfig = pageidConfig[appid] || {};
  Object.setPrototypeOf(pidConfig, mainPidConfig);

  Object.keys(routeMap).forEach((key) => {
    var route = routeMap[key];
    var pageid = pidConfig[key];
    RouterMap[key] = route.route;
    RrouterMap[route.route] = Object.assign({ name: key }, route, pageid);
  });
})();

function pageId(page, isPromotion) {
  var route = RrouterMap[page.route];
  if (route) {
    return (
      (isPromotion ? route.pageidPromotion || route.pageid : route.pageid) ||
      '0'
    );
  } else {
    return '0';
  }
}

export default {
  routeMap,
  pageidConfig,
  pageId,
  RouterMap,
};

export { routeMap, pageidConfig, pageId, RouterMap };
