import { cwx, __global} from "../cwx.js";

// 发送的数据包含6个属性
// {
//   appId: __global.appId,
//   clientID: cwx.clientID,
//   mktOpenId: cwx.cwx_mkt.openid,
//   // code: r.code,
//   // encryptedData: res.encryptedData,
//   // iv5: res.iv
// };

// 需满足1个条件：app.js onShow 后，触发过一次 page onReady
// app.js onHide 时，将 isReadyToSendData 置为 false，下一次 page onReady 时再置为 true
let isReadyToSendData = false;

// isReadyToSendData 为 false 时组合完毕的数据，将暂存到数组中，等 page onReady 被触发时，遍历发送
let infoQueue = [];

// 发送数据的两个情况：
// 1. 数据先组合完毕（暂存数据到 infoQueue 中）， 随后 page onReady 触发时，在将 isReadyToSendData 置为 true 的同时 调用 flush 将 infoQueue 中暂存的数据逐个发送出去
// 2. page onReady 先触发（此时会使 isReadyToSendData 被置为 true ，并调用 flush ），随后数据组合完毕，暂存数据到 infoQueue 中，调用 flush
// flush 内部 判断 isReadyToSendData 的值，为 true 则 逐个发送

// 1. 功能：判断是否 ready ， ready 则遍历，发送请求
function flushGroupInfo() {
  if(!isReadyToSendData) {
    return;
  }
  let item;
  while(item = infoQueue.pop()) {
    if(Object.keys(item).length === 6) { // 这个判断可以移除无效数据
      fetchGroupInfo(item);
    }
  }
}

// 2. 功能：发送请求
function fetchGroupInfo(data) {
  cwx.request({
    url: '/restapi/soa2/11474/riskverifyformerchant',
    method: 'POST',
    data: {
      request: JSON.stringify({
        "eventPoint": "CP0006023",
        "eventBody": data,
        "requestTime": cwx.util.formatTime(new Date(), true)
      })
    },
    success(res) {
      console.log('>>>>>> 信安接口的返回值 success');
      // console.log(res);
    },
    fail(err) {
      console.log('>>>>>> 信安接口的返回值 fail');
      // console.log(err);
    },
    complete(res) {
      console.log('>>>>>> 信安接口的返回值 complete');
      // console.log(res);
    }
  })
}

// 3. 功能：获取 opengid密文、code
function getGroupInfo() {
  const groupSceneArr = [1008, 1158, 1160, 1185, 1044, 1036, 1048, 1088, 1096, 1100]; // todo, 测试一下 1048 是否可以获取 groupid 
  
  if(groupSceneArr.includes(Number(cwx.scene)) && (cwx.canIUse('getGroupEnterInfo') || cwx.canIUse('getShareInfo'))) {
    Promise.all([getGroupEnterInfo(), getCode()]).then(res => {
      console.log('>>> getGroupInfo then:', res);
      let info = {
        appId: __global.appId,
        clientID: cwx.clientID,
        mktOpenId: cwx.cwx_mkt.openid
      };
      res.forEach(item => {
        if(item && item.encryptedData) {
          info.encryptedData = item.encryptedData;
          info.iv5 = item.iv5;
        }
        if(item && item.code) {
          if(item.timer) {
            clearTimeout(item.timer);
          }
          info.code = item.code;
        }
      })
      infoQueue.push(info);
      flushGroupInfo();
    }).catch(err => {
      console.log('>>> getGroupInfo catch:', err);
    })
  } else {
    console.log(cwx.scene, ' scene 不在白名单内 ', groupSceneArr);
  }
}

// 3.1 功能：获取 opengid密文
function getGroupEnterInfo() {
  return new Promise((resolve) => {
    function success(res) {
      cwx.sendUbtByPage.ubtDevTrace('wxapp_getGroupEnterInfo_success', res);
      if(res.encryptedData && res.iv) {
        resolve({
          encryptedData: res.encryptedData,
          iv5: res.iv
        });
      } else {
        resolve({});
      }
    }

    cwx.getGroupEnterInfo({
      success,
      fail(err) {
        // 发埋点记录下 scene {errMsg: "getGroupEnterInfo:fail invalid scene"} 
        cwx.sendUbtByPage.ubtDevTrace('wxapp_getGroupEnterInfo_fail', err);
        // 低版本基础库 用 wx.getShareInfo 兼容
        cwx.getShareInfo({
          shareTicket: cwx.shareTicket,
          timeout: 2000,
          success(res) {
            if (typeof res === 'object') {
              res["apiType"] = "getShareInfo"
            }
            success(res);
          },
          fail() {
            resolve({});
          }
        })
      }
    })
  })
}

// 3.2 功能：获取 code
function getCode(data = {}) {
  return new Promise((resolve, reject) => {
    cwx.login({
      success (res) {
        if (res.code) {
          cwx.sendUbtByPage.ubtDevTrace('wxapp_getGroupInfo_getCode_success', res);
          if(data && data.timer) {
            clearTimeout(data.timer);
          }
          let timer = setTimeout(() => {
            getCode(data);
          }, 180000); // 3min

          data.timer = timer;
          data.code = res.code;
          resolve(data);
        } else {
          // console.log('登录失败！' + res.errMsg);
          cwx.sendUbtByPage.ubtDevTrace('wxapp_getGroupInfo_getCode_fail', res.errMsg);
          if(data && data.timer) {
            clearTimeout(data.timer);
          }
          reject({});
        }
      },
      fail (err) {
        // console.log('获取 code 失败 ======', err);
        cwx.sendUbtByPage.ubtDevTrace('wxapp_getGroupInfo_getCode_fail', err);
        if(data && data.timer) {
          clearTimeout(data.timer);
        }
        reject({});
      }
    })
  })
}

// 4. 功能：将 isReadyToSendData 置为 true，调用 flush
function handlerPageOnReady() {
  isReadyToSendData = true;
  flushGroupInfo();
}

// 5. 功能：当小程序转后台时，先发送数据，然后将 isReadyToSendData 置为 false，等待下一次 page onReady 将其置为 true
function handlerAppOnHide() {
  isReadyToSendData = true;
  flushGroupInfo();
  isReadyToSendData = false;
}

// 3个异步 获取 code, groupId, pageOnReady
// 在3个异步同时完成后，再发请求，需要匹配
// 获取 groupid, 不管哪个页面的onReady，都发请求，尽量把数据发出去

// 获取 groupid 和 code 的时机，app.js onShow

// app.js onShow 时，pageOnReady 为 false，开始请求 groupid，获取到 groupid，就先存到 queue 中；获取 code，code 隔3分钟就请求一次，当 queue 中没有值，停止定时获取code（code 和 groupid 是匹配的，一个 groupid 对应一个 code）
// app.js onShow 后的 page_onReady 执行时，pageOnReady 才置为 true，发送现有的 queue 中的数据，一个个发出去，请求 groupid 的回调中也要判断一下 pageOnReady, 若 pageOnReady 为 true, 不需要等下次 pageOnReady 执行，有 code 和 groupid 直接就可以发

// 首次页面 ready 的定义：app.js onShow 执行后的第一个 page onReady


export default {
  getGroupInfo,
  handlerPageOnReady,
  handlerAppOnHide
};