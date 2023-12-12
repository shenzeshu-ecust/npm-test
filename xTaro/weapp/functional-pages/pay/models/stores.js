var BaseStore = require('basestore.js').BaseStore;

var OrderDetailStore = function(settings){
    
    settings = settings || {};
    settings.key = 'PAYMENT_ORDER_DETAIL_STORE';

    return new BaseStore(settings);
};

var HoldTokenStore = function(settings){
    
    settings = settings || {};
    settings.key = 'PAYMENT_HOLD_TOKEN_STORE';

    return new BaseStore(settings);
};

var OrderDetailExtendStore = function(settings){
    
    settings = settings || {};
    settings.key = 'PAYMENT_ORDER_DETAIL_EXTEND_STORE';

    return new BaseStore(settings);
};


var PayResultOrderStore = function(settings){
    
    settings = settings || {};
    settings.key = 'PAYMENT_RESULT_ORDER_STORE';

    return new BaseStore(settings);
};

var HoldResultOrderStore = function(settings){
    
    settings = settings || {};
    settings.key = 'PAYMENT_HOLD_RESULT_ORDER_STORE';

    return new BaseStore(settings);
};

var PayParamsStore = function(settings){
    
    settings = settings || {};
    settings.key = 'PAYMENT_PARAMS_STORE';

    return new BaseStore(settings);
};

var RealNameStore = function(settings){
    
    settings = settings || {};
    settings.key = 'PAYMENT_REALNAME_STORE';

    return new BaseStore(settings);
};


module.exports = {
    OrderDetailStore : OrderDetailStore,
    OrderDetailExtendStore : OrderDetailExtendStore,
    PayResultOrderStore : PayResultOrderStore,
    PayParamsStore : PayParamsStore,
	HoldTokenStore : HoldTokenStore,
    HoldResultOrderStore : HoldResultOrderStore,
    RealNameStore : RealNameStore
};
