import { cwx, __global } from '../cwx.js';

function checkIsTimeStamp(ts) {
    if(typeof ts === 'number' && (ts + '').length === 13) {
        return true;
    }
    return false;
}

function sendUbtOfRequest(res, url, timeline) {
    if (cwx.sendUbtByPage && cwx.sendUbtByPage.ubtMetric && res) {
        let currentTimeStamp =  new Date().getTime();
        // 状态码的属性名有好几种，分别、分优先级处理（todo??? 注意兼容各种类型的小程序）
        const DEFAULT_CODE = "na";
        let statusCode = res ? (res.statusCode || res.errno || res.errCode || res.errCode || res.error) : DEFAULT_CODE; // 先取出真正的值
        statusCode = typeof statusCode !== "undefined" ? statusCode + "" : DEFAULT_CODE; // 转换成字符串类型
        let status = !isNaN(statusCode) && statusCode * 1 < 400 ? 'success' : 'fail';
        let wxReqDuration = currentTimeStamp - timeline.wxReqCallTime;
        let totalDuration = currentTimeStamp - timeline.startTime;

        if(currentTimeStamp < timeline.startTime){
            try {
                throw new Error("request call Error");
            } catch (e) {
                cwx.sendUbtByPage.ubtDevTrace("wxapp_cwx_request_call_error", {
                    stack: e.stack || '',
                    startTime: timeline.startTime,
                    currentTimeStamp
                });
            }
        }
        
        let ubt_metric = {
            name: 100371, // 历史遗留的埋点，可能原先的请求埋点数据有人在用，保留
            tag: {
                status,
                rootMessageId: res.header && (res.header.rootmessageid || res.header.RootMessageId || ''),
                url,
                statusCode, // fail 的 res 跟 success 的不一样
                waitDuration: timeline.wxReqCallTime - timeline.cwxReqCallTime, // 从调用 cwx.request 到真正调用 wx.request, 耗时
                wxReqDuration,
                mcdAppId: cwx.mcdAppId
            },
            value: totalDuration
        };
        cwx.sendUbtByPage.ubtMetric(ubt_metric); // 可能原先的请求埋点数据有人在用，保留

        let requestPerformance = {
            name: status === 'success' ? 'wxapp_cwx_request_success_new' : 'wxapp_cwx_request_fail_new', // wxapp_cwx_request_succeess, wxapp_cwx_request_fail
            tag: {
                url: url.split('?')[0],
                rootMessageId: res.header && (res.header.rootmessageid || res.header.RootMessageId || ''),
                statusCode,
                totalDuration: totalDuration,
                wxReqDuration,
                mcdAppId: cwx.mcdAppId,
                newDate: currentTimeStamp,
                wxReqCallTime: timeline.wxReqCallTime,
                cwxReqCallTime: timeline.cwxReqCallTime,
                startTime: timeline.startTime,
            },
            value: totalDuration
        };

        // 如果 requestStart 或 requestEnd 不是时间戳，就不使用微信 profile 中的数据了
        if (res && res.profile && checkIsTimeStamp(res.profile.requestEnd) && checkIsTimeStamp(res.profile.requestStart)) {
            requestPerformance['tag']['connectDuration'] = res.profile.connectEnd - res.profile.connectStart;
            requestPerformance['tag']['wxReqDuration'] = res.profile.requestEnd - res.profile.requestStart;
            requestPerformance['tag']['responseDuration'] = res.profile.responseEnd - res.profile.responseStart;
        }

        let domain = requestPerformance.tag.url.match(/^(https?:)?\/\/[^/]+/) ? requestPerformance.tag.url.match(/^(https?:)?\/\/[^/]+/)[0] : '';
        // 过滤错误的值、测试环境的url（duration 应该是个时间段，而不是时间戳）
        if(domain.includes(__global.host) && !checkIsTimeStamp(requestPerformance.tag.totalDuration) && !checkIsTimeStamp(requestPerformance.tag.wxReqDuration)) {
            cwx.sendUbtByPage.ubtMetric(requestPerformance); // 将请求成功/失败分别用2个埋点记录，不同的小程序埋点也不同
        }

        if(status === 'fail' || wxReqDuration > 3000) {
            let keys = "";
            let res = "";
            try {
                keys = JSON.stringify(Object.keys(res));
                res = JSON.stringify(res);
            } catch (e) {
                res = JSON.stringify({
                    statusCode,
                    message: res.message || res.errMsg || "",
                    stack: res.stack || '',
                    errMsg: e.message,
                    errStack: e.stack
                })
            }
            cwx.sendUbtByPage.ubtTrace(status === 'fail' ? 'wxapp_cwx_request_fail_err' : 'wxapp_cwx_request_slow', {
                keys,
                res
            });
        }
    }
}

export default {
	sendUbtOfRequest
}
