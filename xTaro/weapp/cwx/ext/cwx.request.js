// 统一收口请求接口，添加默认信息
let __global = require('./global.js').default;
import sensitiveWordsWrapper from "./cwx.checkSensitive";
import utils from './cwx.requestUtils.js';
import sendUbtPerformence from "./cwx.sendUbtPerformence.js";
import cryptoRequestData from "./cwx.cryptoRequestData.js";
let cwx = __global.cwx;

let requestIDMapping = {};     // 存 requestID 和 RequestTask 的对应关系，调用 cancel 时，能根据 requestID 取 对应的 RequestTask
const __kMaxRequestCount = 29; // 同一时刻，正在进行的请求的最大数量
let _requestQueue = [];      // 等待的queue
let _runQueue = [];          // 正在请求的request
let isLogining = false;
let requestTimeline = {}; // 记录每个请求触发各阶段方法的时间戳

// 取消等待队列中的请求 或 中断请求任务
function cancel(requestID) {
    if (typeof requestID === 'number') {
        if (typeof requestIDMapping[requestID] !== 'undefined') {
            // 已经调用了 wx.request, 需要调用 task 的 abort() 来取消请求
            try {
                let task = requestIDMapping[requestID];
                if (task && task.abort) {
                    task.abort();
                    delete requestIDMapping[requestID]
                    return 1;
                }
            } catch (error) {

            }
        }

        if (requestID > 0) {
            // 从等待队列中移除
            for (let i = 0; i < _requestQueue.length; i++) {
                const obj = _requestQueue[i];
                if (obj.requestID == requestID) {
                    _requestQueue.splice(i, 1);
                    return 1;
                }
            }
        }
    }

    return 0;
}

function checkLoginOverdue(res) {
    let isOverDue = false;
    try {
        const responseStatus = (res && res.ResponseStatus) || (res && res.data && res.data.ResponseStatus);
        if (responseStatus) {
            const ack = responseStatus.Ack || responseStatus.ack;
            const errors = responseStatus.Errors;
            if (ack === 'Failure' || +ack === 1) {
                if ((errors instanceof Array) && errors.length > 0) {
                    //考虑到可能存在多个error的情况
                    for (let i = 0, error; i < errors.length; i++) {
                        error = errors[i];
                        if (error && error.ErrorCode && (error.ErrorCode === 'MobileRequestFilterException' || error.ErrorCode === 'AccountsMobileRequestFilterException')) {
                            isOverDue = true;
                            break;
                        }
                    }
                }
            }
        }
    } catch (e) {

    }
    return isOverDue;
}

const flushQuery = function () {
    setTimeout(function () {
        if (_requestQueue.length > 0) {
            let nextRequestObject = _requestQueue.splice(0, 1)[0];
            pushTimeline(nextRequestObject.requestID, "wxReqCallTime");
            addStartReqToCache(nextRequestObject);
        }
    }, 0);
}

function removeCompleteReqFromCache(requestID) {
    // 移除请求
    for (let i = 0; i < _runQueue.length; i++) {
        const obj = _runQueue[i];
        if (obj.requestID == requestID) {
            _runQueue.splice(i, 1);
            break;
        }
    }
    delete requestIDMapping[requestID];
}

function addStartReqToCache(object) {
    _runQueue.push(object);
    let reqTask = wx.request(object);
    requestIDMapping[object.requestID] = reqTask; // 塞到这里的一定是已经调用了 wx.request 的 request 任务
}

function pushTimeline (requestID, key) {
    if (!requestTimeline[requestID]) {
        requestTimeline[requestID] = {};
    }
    requestTimeline[requestID][key] = new Date().getTime();
}

//发送网络请求, 异步返回结果，函数返回值为本次请求生成的requestID， 该requestID在cancel时候可以使用
/**
 * @name _request
 * @function
 * @param {map} object
 */
function request(object) {
    let requestID = utils.generateRequestID();
    // 1. 递增的ID，用于 cancel
    object.requestID = requestID
    // 2. 开始执行 cwx.request 的时间
    pushTimeline(requestID, "cwxReqCallTime")
    // 3. 整合 object.header
    object.header = utils.createHeader(object.header);
    // 4. 整合 object.data, 添加默认的 head属性
    object.data = object.data || {}; // 添加兜底值
    let notAddDataHead = typeof object.notAddDataHead === 'undefined' ? false : object.notAddDataHead; // 用于控制是否给 data 添加 head 的默认值，即 data.head
    if(!notAddDataHead) { // 主动设置 object.notAddDataHead 为 true，则不处理 data.head
        object.data.head = utils.createDataHead(object.data);
    }
    delete object.notAddDataHead;
    // 5. 整合 object.url
    // 新增url中拼接 clientId的参数
    object.url = utils.appendSuffix(utils.formatRequestURL(object.url));
    object.method = object.method || 'POST';

    let isForceLoggin = object.forceLogin; // todo???
    const oComplete = object.complete || function () {};
    const nComplete = wrapperCBFunc({
      object,
      cbName: "complete",
      prefixProcess: function (res) {
        removeCompleteReqFromCache(requestID);
        sendUbtPerformence.sendUbtOfRequest(res, object.url, requestTimeline[requestID]);
        delete requestTimeline[requestID];
      },
      suffixProcess: function (res) {
        //todo? 暂时只是通知BU过期了
        let isOverdue = checkLoginOverdue(res)
        if (isOverdue && isForceLoggin) {
            isLogining = true;
            _requestQueue.push(object);
            //跳转到登录
            cwx.user.login({
                param: {},
                callback: function () {
                    flushQuery();
                }
            });
        } else {
            if (isOverdue) {
                res.miniappOverdue = true;
            }
            if (oComplete) {
                oComplete(res);
            }
            flushQuery();
        }
      }
    })
    pushTimeline(requestID, "startTime")
    object.complete = nComplete;

    let oSuccess = object.success || function () {};
    object.success = wrapperCBFunc({
      object,
      cbName: "success",
      prefixProcess: function (res) {
        // res = utils.compatibleResStatus(res); // alipay 独有
      },
      suffixProcess: function (res) {
        if (oSuccess) {
          oSuccess(res);
        }
      }
    });

    let oFail = object.fail || function () {};
    object.fail = wrapperCBFunc({
      object,
      cbName: "fail",
      prefixProcess: function (res) {},
      suffixProcess: function (res) {
        if (oFail) {
          oFail(res);
        }
      }
    });

    // 这里对object处理完毕，可开始加密
    let proReq = cryptoRequestData.processReq(object);
    object.headers = proReq.header || proReq.headers;
    object.data = proReq.data;

    //tczhu 添加一个正在请求的队列
    if (_runQueue.length >= __kMaxRequestCount || isLogining) {
        // console.log("加入等待队列 ",object);
        _requestQueue.push(object);
    } else {
        pushTimeline(requestID, "wxReqCallTime");
        addStartReqToCache(object);
    }

    return requestID;
}

function wrapperCBFunc ({
  object,
  cbName,
  prefixProcess,
  suffixProcess
}) {
  return function (res) {
    // 前序处理
    if (typeof prefixProcess === "function") {
      res = prefixProcess(res) || res; // 若无须处理，则会返回原值
    }
    // if (!object.url.includes("_ma.gif?")) {
    //   console.error('请求 返回值 解密前 -----------------')
    //   console.error(res)
    //   console.error(object.url)
    // }

    // 统一解密
    let decodedRes = cryptoRequestData.processRes(res, cbName, object.url);
    // 后续处理
    if (typeof suffixProcess === "function") {
      decodedRes = suffixProcess(decodedRes) || decodedRes; // 若无须处理，则取返回原值
    }
  }
}

/**
 * @name request
 * @function
 * @param {map} parms
 */
export default {
    request: function (object) {
        if (!object.isNotCheckSensitive) {
            object = sensitiveWordsWrapper(object);
        } else {
            delete object.isNotCheckSensitive;
        }
        return request.apply(this, arguments);
    },
    _request: request,
    cancel
}
