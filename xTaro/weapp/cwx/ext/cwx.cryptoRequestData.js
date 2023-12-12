let __global = require('./global.js').default;
let cwx = __global.cwx;
import cryptoFetch from './cwx.cryptoFetch.js';

/**
 * 监听MCD配置的 是否开启加解密 __global.enableEncryptSOA
 * url 的domain + path 是否在白名单内
 * 使用方入参 encodeReqData === 1
 * 3个条件都满足则对请求入参data 加密
 */
function processReq(object) {
  let { url, data, encodeReqData } = object;
  let headers = object.header || object.headers;
  let urlReg = /(https?:)?\/\/((sec-)?m\.ctrip|gateway\.m\.(fws|uat)\.qa\.nt\.ctripcorp)\.com\/restapi\//;
  let urlIsInWhiteArr = urlReg.test(url);
  const pageIns = cwx.getCurrentPage();
  // console.log(
  //   url,
  //   "====== MCD总开关: ",
  //   !!__global.enableEncryptSOA,
  //   "url在白名单内: ",
  //   urlIsInWhiteArr,
  //   "调接口时主动选择加密: ",
  //   encodeReqData === 1
  // );
  if (__global.enableEncryptSOA && urlIsInWhiteArr && encodeReqData === 1) {
    pageIns && pageIns.ubtMetric &&
      pageIns.ubtMetric({ // 埋点记录 加密前的数据
        name: 189772, //申请生成的Metric KEY
        tag: {
          url: url,
          header: JSON.stringify(headers),
          data: JSON.stringify(object.data),
        }, //自定义Tag
        value: 1, //number 值只能是数字
      });

    // 原始的 content-type 赋值给 'x-origin-ct'
    let originContentType =
      (headers && (headers["Content-Type"] || headers["content-type"])) || "";
    if (originContentType) {
      headers["x-origin-ct"] = originContentType;
    }
    headers["Content-Type"] = "text/plain";
    headers["content-type"] = "text/plain";
    headers["x-payload-accept"] = "camev1";
    headers["x-payload-encoding"] = "camev1";

    // 【注意】dataType 也应该在这里添加
    object.dataType = "text";

    object.data = cryptoFetch.encodeReqData(data, url, headers);
    // console.log('加密 object.data ======')
    // console.log(object.data)
    delete object.encodeReqData;

    pageIns && pageIns.ubtMetric &&
    pageIns.ubtMetric({ // 埋点记录 加密后的数据
      name: 190135, //申请生成的Metric KEY
      tag: {
        url: url,
        header: JSON.stringify(headers),
        data: JSON.stringify(object.data),
      }, //自定义Tag
      value: 1, //number 值只能是数字
    });
  } else {
    if (typeof object.data !== "string") {
      object.data = JSON.stringify(object.data);
    }
  }

  return object;
}

function processRes(object, funcType, url) {
  // console.log('processRes ======')
  // console.log(object)
  let headers = object.header || object.headers;

  let data = object.data;
  const pageIns = cwx.getCurrentPage();

  if (
    headers &&
    headers["x-payload-encoding"] &&
    headers["x-payload-encoding"] === "camev1" &&
    !data.isDecoded // 标志位
  ) {
    // console.log("即将对服务端返回的报文进行解密 ======")
    pageIns && pageIns.ubtMetric &&
      pageIns.ubtMetric({ // 埋点记录 解密前的报文
        name: 189773, //申请生成的Metric KEY
        tag: {
          url: url,
          headers: JSON.stringify(headers),
          data: JSON.stringify(object.data),
          funcType: funcType,
        }, //自定义Tag
        value: 1, //number 值只能是数字
      });

    object.data = cryptoFetch.decodeResData({
      data,
      url,
      headers,
      funcType,
    });
    // console.log(object.data);

    pageIns && pageIns.ubtMetric &&
    pageIns.ubtMetric({ // 埋点记录 解密后的报文
      name: 190139, //申请生成的Metric KEY
      tag: {
        url: url,
        headers: JSON.stringify(headers),
        data: JSON.stringify(object.data),
        funcType: funcType,
      }, //自定义Tag
      value: 1, //number 值只能是数字
    });

    try {
      // console.log("尝试JSON.parse 解密后的 object.data ======");
      // console.log(object.data);

      if (typeof object.data === "string") {
        let processData = object.data;
        object.data = JSON.parse(processData);
      }
      if(object.header) {
        object.header = headers
      }

      if(object.headers) {
        object.headers = headers
      }
    } catch (error) {
      pageIns && pageIns.ubtMetric &&
      pageIns.ubtMetric({
        name: 190141, //申请生成的Metric KEY
        tag: {
          url: url,
          headers: JSON.stringify(headers),
          data: JSON.stringify(object.data),
          funcType: funcType,
        }, //自定义Tag
        value: 1, //number 值只能是数字
      });
      console.error("error: JSON.parse response-data");
    }
  }

  // console.log(object)
  return object;
}

export default {
  processReq,
  processRes,
};
