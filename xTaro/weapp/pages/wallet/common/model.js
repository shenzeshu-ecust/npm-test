import {
    cwx,
    __global
} from '../../../cwx/cwx.js';
// import {
//     APP_VERSION,
// } from 'config'

const APP_VERSION = 1.0

// function sendPostSOA(url, mParams, options) {
//     cwx.locate.startGetGeoPoint({
//         success: function(data) {
//             modelRequest(url, mParams, options,data)
//         },
//         fail: function(e) {
//             this.data.currentAir = {
//                 cityName: '定位失败'
//             };
//             console.log("cwx.locate.startGetGeoPoint error ", e);
//         }.bind(this)
//     });
// }

function modelRequest(scode, mParams, options) {
    var urlname = '';
    const accountInfo = wx.getAccountInfoSync();
    var env = __global.env || accountInfo.miniProgram.envVersion
    var host = (env === 'develop' || env === 'fat') ? 'https://gateway.secure.fws.qa.nt.ctripcorp.com': 'https://gateway.secure.ctrip.com';
    var domainUrl = host + '/restful/soa2/14523';
    var payLoads = {
        ver: APP_VERSION,
        servicecode: scode,
        plat: 5,
        reqbody: JSON.stringify(mParams)
    };
    var page = cwx.getCurrentPage();
    if (scode == '32007105') {
        urlname = '/noAuthSendPacket'
    } else if(/32007201|32007202|32005601|32005530|32007205/.test(scode)){
        urlname = '/serviceDoOnDemand?subEnv=fat20';
        domainUrl = host + '/restful/soa2/20553';
        payLoads = {
            requestHead: JSON.stringify({
                "serviceCode": scode,
                "loginType":"CTRIP",
                "key": "200564"
            }),
            payload: {
                "plat"  : 5,
                "ver"   : "8.23",
                "cver"  : "8.13"
            }
        }
        const payloadData = Object.assign(payLoads.payload, mParams);
        payLoads.payload = JSON.stringify(payloadData);
    }else if(/32001110/.test(scode)){
      urlname = '?subEnv=fat18&serviceCode=32001110';
      domainUrl = host + '/restful/soa2/20553/serviceDo';
      payLoads = {
        requestHead: JSON.stringify({
            "serviceCode": scode,
            "loginType":"CTRIP",
            "key": "200564"
        }),
        payload: {
            "plat"  : 5,
            "ver"   : "8.23",
            "cver"  : "8.13"
        }
    }
    const payloadData = Object.assign(payLoads.payload, mParams);
    payLoads.payload = JSON.stringify(payloadData);
    } else {
        urlname = '/sendPacket';
    }
    mParams.ver = '8.0.0';
    mParams.cver = '7.16';
    mParams.plat = 50;
    mParams.mchid = 'CTRP';
    //cwx.user.auth = '4D13E2C0B04CBA1B39111BF5E5E2C4BCF97B656CE3FCD1D4B7219FA138CF9396'; //测试环境用
    if (page && page.ubtTrace) {
        page.ubtTrace('request_service', {
            servicecode: scode,
            requestParams: mParams
        })
    }
    const url = domainUrl + urlname
    console.log('request url', url )
    cwx.request({
        url, //生产
        //url: 'https://gateway.secure.ctrip.com/restful/soa2/14523/sendPacket?isCtripCanaryReq=1',//堡垒环境
        // url: 'https://gateway.secure.fws.qa.nt.ctripcorp.com/restful/soa2/14523/sendPacket', //测试环境
        method: "POST",
        data: payLoads,
        success: function (res) {
         
            if(/32007201|32007202|32005601|32005530|32007205|32001110/.test(scode)){
                const responseData = res.data || {};
                const payLoad = responseData.payload || '{}';
                try {
                    const payloadJson = JSON.parse(payLoad);
                    console.log('wallet response' , scode , payloadJson)
                    options.onSuccess && options.onSuccess(payloadJson);
                } catch (e) {
                    if (page && page.ubtTrace) {
                        page.ubtTrace('request_service', {
                            errMsg: 'try catch errMsg: ' + e.message
                        })
                    }
                    options.onError && options.onError({rmsg: '系统异常，请稍后重试！-E09'});
                } 
            }else {
                if (res.data.rc == 0) {
                    var resp = '';
                    !!res.data.resbody ? resp = JSON.parse(res.data.resbody) : false;
                    options.onSuccess && options.onSuccess(resp);
                } else {
                    options.onError && options.onError(res.data);
                    console.log("错误1：" + JSON.stringify(res))
                }
            }
        },
        fail: function (res) {
        
            options.onError && options.onError(res.data);
            console.log("错误2：" + JSON.stringify(res));
            //console.log("auth:" + cwx.user.auth)
        }
    })
}
// export function WalletAccountCheckModel(mParams,options){
//   var scode = "32000103";
//   modelRequest(scode,mParams,options);
// }
// export function WalletUserInfoCheckModel(mParams,options){
//   var scode = "32000505";
//   modelRequest(scode,mParams,options);
// }
// export function WalletAccountSearchModel(mParams,options){
//   var scode = "32000101";
//   modelRequest(scode,mParams,options);
// }
// export function WalletPublicQueryTextModel(mParams,options){
//   var scode = "32000601";
//   modelRequest(scode,mParams,options);
// }
// export function WalletUserInfoSearchModel(mParams, options) {
//     var scode = "32000501";
//     modelRequest(scode, mParams, options);
// }
// export function WalletWithdrawLimitModel(mParams,options){
//   var scode = "32000105";
//     modelRequest(url,mParams,options);
// }
// export function WalletGetWXUserInfoModel(mParams, options) {
//     var scode = "32007105";
//     modelRequest(scode, mParams, options);
// }

export function WalletGetAuthCodeModel(mParams, options) {
    var scode = "32007201";
    modelRequest(scode, mParams, options);
}

export function WalletSetRealNameModel(mParams, options) {
    var scode = "32007202";
    modelRequest(scode, mParams, options);
}

export function WalletSetAdultModel(mParams, options) {
    var scode = "32007205";
    modelRequest(scode, mParams, options);
}

// export function WalletGetProtocolText(mParams, options) {
//     var scode = "32005601";
//     modelRequest(scode, mParams, options);
// }

export function WalletCheckAgeModel(mParams, options) {
    var scode = "32005530";
    modelRequest(scode, mParams, options);
}

export function WalletFetchUserInfoHomeModel(mParams,options){

  var scode = "32001110";
  modelRequest(scode, mParams, options);
}
