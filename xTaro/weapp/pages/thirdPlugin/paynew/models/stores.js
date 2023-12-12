var BaseStore = require('basestore.js').BaseStore;

var OrderDetailStore = function (settings) {

  settings = settings || {};
  settings.key = 'PAYMENT6_ORDER_DETAIL_STORE';

  return new BaseStore(settings);
};

var PayWayStore = function (settings) {

  settings = settings || {};
  settings.key = 'PAYMENT6_PAY_WAY_STORE';

  return new BaseStore(settings);
};

var HoldTokenStore = function (settings) {

  settings = settings || {};
  settings.key = 'PAYMENT6_HOLD_TOKEN_STORE';

  return new BaseStore(settings);
};

var OrderDetailExtendStore = function (settings) {

  settings = settings || {};
  settings.key = 'PAYMENT6_ORDER_DETAIL_EXTEND_STORE';

  return new BaseStore(settings);
};


var PayResultOrderStore = function (settings) {

  settings = settings || {};
  settings.key = 'PAYMENT6_RESULT_ORDER_STORE';

  return new BaseStore(settings);
};

var PayParamsStore = function (settings) {

  settings = settings || {};
  settings.key = 'PAYMENT6_PARAMS_STORE';

  return new BaseStore(settings);
};

var RealNameStore = function (settings) {

  settings = settings || {};
  settings.key = 'PAYMENT6_REALNAME_STORE';

  return new BaseStore(settings);
};

var WxscoreStore = function (settings) {

  settings = settings || {};
  settings.key = 'PAYMENT_WXSCORE_STORE';

  return new BaseStore(settings);
};

var HoldResultOrderStore = function(settings){
    
  settings = settings || {};
  settings.key = 'PAYMENT_HOLD_RESULT_ORDER_STORE';

  return new BaseStore(settings);
};

var HoldOrderInfoOrderStore = function(settings) {

  settings = settings || {};
  settings.key = 'PAYMENT_HOLD_ORDER_INFO_STORE';

  return new BaseStore(settings);
};


module.exports = {
  HoldOrderInfoOrderStore,
  HoldResultOrderStore,
  WxscoreStore,
  OrderDetailStore: OrderDetailStore,
  OrderDetailExtendStore: OrderDetailExtendStore,
  PayResultOrderStore: PayResultOrderStore,
  PayParamsStore: PayParamsStore,
  HoldTokenStore: HoldTokenStore,
  RealNameStore: RealNameStore,
  PayWayStore: PayWayStore
};