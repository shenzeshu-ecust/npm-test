var BaseModel = require('basemodel.js').BaseModel;
var PaymentWayModel = function(settings) {
  console.log('31100102 function', settings)
  settings = settings || {};    
  settings.url = '/restful/soa2/22882/paymentListSearch';    
  settings.serviceCode = '31100102';
  return new BaseModel(settings);
};

var PayMentV3Model = function(settings){
  console.log('31100303 function', settings)
    settings = settings || {};
    settings.url = '/restful/soa2/22888/submitPayment';    
    settings.serviceCode = '31100303';
    return new BaseModel(settings);
};


// 错误日志记录
const WriteLogModel = function (settings) {
  settings = settings || {};
  settings.url = '/restful/soa2/22882/WriteLog';
  settings.serviceCode = '31104404';
  return new BaseModel(settings);
};

module.exports = {
    PaymentWayModel : PaymentWayModel,
    PayMentV3Model : PayMentV3Model,
    WriteLogModel,
};
