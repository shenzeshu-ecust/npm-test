var BaseModel = require('basemodel.js').BaseModel;

var PaymentWayModel = function(settings){
    
    settings = settings || {};
    settings.url = '/restful/soa2/13578/payListSearch';
	settings.serviceCode = '31000102';

    return new BaseModel(settings);
};

var PaymentWayServerModel = function(settings){
    
    settings = settings || {};
    settings.url = '/restful/soa2/13578/unifiedPayListSearch';
	settings.serviceCode = '31100102';

    return new BaseModel(settings);
};

var PayMentV3Model = function(settings){
    
    settings = settings || {};
    settings.url = '/restful/soa2/13578/paymentSubmitSearchV3';
	settings.serviceCode = '31000303';
    return new BaseModel(settings);
};


var WxholdWayModel = function(settings){
    
    settings = settings || {};
    settings.url = '/restful/soa2/13578/bindPayListSearch';
	settings.serviceCode = '31002001';

    return new BaseModel(settings);
};

var WxholdWaysModel = function(settings){
    
    settings = settings || {};
    settings.url = '/restful/soa2/13578/UnifiedBindPayListSearch';
	settings.serviceCode = '31102001';

    return new BaseModel(settings);
};

var WxholdResultModel = function(settings){
    
    settings = settings || {};
    settings.url = '/restful/soa2/13578/queryThirdPayStatus';
	settings.serviceCode = '31002301';

    return new BaseModel(settings);
};

var WxholdPayModel = function(settings){
    
    settings = settings || {};
    settings.url = '/restful/soa2/13578/UnifiedBindPaySubmit';
	settings.serviceCode = '31102002';

    return new BaseModel(settings);
};

var WxscoreStateModel = function(settings){
    
    settings = settings || {};
	settings.url = '/restful/soa2/13578/queryPayPointStatus';
	settings.serviceCode = '31003802';

    return new BaseModel(settings);
};

var WxscoreDataModel = function(settings){
    
    settings = settings || {};
    settings.url = '/restful/soa2/13578/openPayPointService';
	settings.serviceCode = '31003901';

    return new BaseModel(settings);
};


var RealNameModel = function(settings){
    
    settings = settings || {};
    settings.url = '/restful/soa2/14523/sendPacket';
	settings.serviceCode = '32007105';

    return new BaseModel(settings);
};

var CardBinQuery = function(settings) {
    settings = settings || {};
    settings.url = '/restful/soa2/13578/queryCardInfoByCardNo';
	settings.serviceCode = '31001301';

    return new BaseModel(settings);
}

var RefundQuery = function(settings) {
    settings = settings || {};
    settings.url = '/restful/soa2/13578/refundInfoSearch';
	settings.serviceCode = '31001301';

    return new BaseModel(settings);
}


var ExceptionInfoCollectModel = function(settings){
    
    settings = settings || {};
    settings.url = '/restful/soa2/10289/exceptioninfo/update';
	settings.serviceCode = '31001401';
    return new BaseModel(settings);
};



module.exports = {
    PaymentWayModel : PaymentWayModel,
    PaymentWayServerModel: PaymentWayServerModel,
    PayMentV3Model : PayMentV3Model,
    PayMentModel : PayMentV3Model,
    WxholdWayModel : WxholdWayModel,
    WxholdWaysModel: WxholdWaysModel,
	WxholdPayModel : WxholdPayModel,
    WxholdResultModel : WxholdResultModel,
    RealNameModel: RealNameModel,
    WxscoreStateModel: WxscoreStateModel,
    WxscoreDataModel: WxscoreDataModel,
    CardBinQuery: CardBinQuery,
    RefundQuery: RefundQuery,
    ExceptionInfoCollectModel : ExceptionInfoCollectModel
};
