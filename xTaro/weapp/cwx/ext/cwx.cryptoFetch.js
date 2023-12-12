let __global = require('./global.js').default;
let cwx = __global.cwx;

let key = 'YnV0dGVycz3MzRkw'
key = cwx.aes.enc.Utf8.parse(key);   //十六位十六进制数作为密钥

// 加解密
function enableCrypto () {
    try {
      cwx.configService.watch('requestMsgSecurity', (res) => {
        console.log('【监听】MCD开关配置 返回: ', res.enableEncryptSOA)
        
        if(res && res.enableEncryptSOA && res.enableEncryptSOA === '1') {
          __global.enableEncryptSOA = true;
        } else {
          __global.enableEncryptSOA = false;
        }
        
        const pageIns = cwx.getCurrentPage();
        pageIns && pageIns.ubtMetric && pageIns.ubtMetric({
            name: 189756, //申请生成的Metric KEY
            tag: { 
              "enableEncryptSOA": JSON.stringify(__global.enableEncryptSOA),
              "res": JSON.stringify(res)
            }, //自定义Tag
            value: 1 //number 值只能是数字
        });
      })
    } catch(e) {
      console.error(e)
      const pageIns = cwx.getCurrentPage();
      pageIns && pageIns.ubtMetric && pageIns.ubtMetric({
          name: 189761, //申请生成的Metric KEY
          tag: { 
            "enableEncryptSOA": JSON.stringify(__global.enableEncryptSOA),
            "res": JSON.stringify(res),
            "errorMsg": e.message,
            "errorStack": e.stack,
          }, //自定义Tag
          value: 1 //number 值只能是数字
      });
      __global.enableEncryptSOA = false;
    }
}

function encodeReqData (reqData, url, header) {
  // console.log('对请求入参的 data 进行加密 ======');

  try {
    // 先 aes 加密，再 base64 转码
    let srcs = cwx.aes.enc.Utf8.parse(JSON.stringify(reqData)); 
    let encrypted = cwx.aes.AES.encrypt(srcs, key, {
      mode: cwx.aes.mode.ECB,
      padding: cwx.aes.pad.Pkcs7
    });
    let res = cwx.aes.enc.Base64.stringify(encrypted.ciphertext)

    return res;
  } catch (e) {
      console.error(e)
    
      const pageIns = cwx.getCurrentPage();
      pageIns && pageIns.ubtMetric && pageIns.ubtMetric({
          name: 189763, //申请生成的Metric KEY
          tag: { 
            "url": url,
            "header": JSON.stringify(header),
            "data": JSON.stringify(reqData),
            "errorMsg": e.message,
            "errorStack": e.stack,
          }, //自定义Tag
          value: 1 //number 值只能是数字
      });

      return reqData;
  }
}

function decodeResData ({data, url, header, funcType}) {
  // console.log('报文解密ing ======');
  try {
    // 先 base64 解码，再 aes 解密
    if(typeof data === 'object') { // complete
      return data;
    }
    // console.log('解密前的data值：')
    // console.log(data)
    let decrypt = cwx.aes.AES.decrypt(data, key, { mode: cwx.aes.mode.ECB, padding: cwx.aes.pad.Pkcs7 });
    let decryptedStr = decrypt.toString(cwx.aes.enc.Utf8);
    decryptedStr = JSON.parse(decryptedStr)
    decryptedStr['isDecoded'] = true; // 增加标志位，表示此data已解密过了
    // console.log(decryptedStr)
    return decryptedStr;
  } catch (e) {
    console.error(e)
  
    const pageIns = cwx.getCurrentPage();
    pageIns && pageIns.ubtMetric && pageIns.ubtMetric({
        name: 189765, //申请生成的Metric KEY
        tag: { 
          "url": url,
          "header": JSON.stringify(header),
          "funcType": funcType,
          "data": JSON.stringify(data),
          "errorMsg": e.message,
          "errorStack": e.stack,
        }, //自定义Tag
        value: 1 //number 值只能是数字
    });

    return data;
  }
}

export default {
  enableCrypto,
  encodeReqData,
  decodeResData
}