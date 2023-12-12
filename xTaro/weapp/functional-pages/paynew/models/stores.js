var BaseStore = require('basestore.js').BaseStore;

var OrderDetailStore = function(settings){
    
    settings = settings || {};
    settings.key = 'PAYMENT_ORDER_DETAIL_STORE';

    return new BaseStore(settings);
};

var PayParamsStore = function(settings){
    
    settings = settings || {};
    settings.key = 'PAYMENT_PARAMS_STORE';

    return new BaseStore(settings);
};

var PayWayStore = function(settings) {

  settings = settings || {};
  settings.key = 'PAYMENT6_PAY_WAY_STORE';

  return new BaseStore(settings);
};


module.exports = {
    OrderDetailStore : OrderDetailStore,
    PayWayStore: PayWayStore,
    PayParamsStore : PayParamsStore,
};
