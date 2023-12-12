/**
 * @Author: jhyi jhyi@trip.com
 * @Date: 2023-02-07 19:04:35
 * @LastEditTime: 2023-04-20 20:15:03
 * @LastEditors: jhyi jhyi@trip.com
 * @Description:
 * @FilePath: /bus/commons/utils/traceStep.js
 * @
 */

import { cwx, __global, cDate } from '../cwx/index';
import { Pservice } from '../productservice';
import { ubtTrace, ubtMetric } from '../ubt';

global.appStartTime = global.appStartTime || new Date().getTime();

const BUS_PAY_STEP_TRACE_KEY = 'o_bus_pay_operation_step';
const BUS_PAY_STEP_METRIC_KEY = 'o_bus_pay_operation_step_metric';
const BUS_PAY_STEP = {
    appLaunch: 'appLaunch',
    pageLoad: 'pageLoad',
    getParams: 'getParams',
    beforeFetchData: 'beforeFetchData',
    afterFetchData: 'afterFetchData',
    beforeLogin: 'beforeLogin',
    afterLogin: 'afterLogin',
    beforeRetryLogin: 'beforeRetryLogin',
    afterRetryLogin: 'afterRetryLogin',
    unLogin: 'unLogin',
    beforeJump: 'beforeJump',
    beforePay: 'beforePay',
    afterPay: 'afterPay',
    error: 'error',
    jsError: 'jsError',
    end: 'end',
};
const STEP_MESSAGE = {
    appLaunch: '页面启动完成',
    pageLoad: '正在打开页面',
    getParams: '正在解析路径',
    beforeLogin: '正在登录',
    afterLogin: '登录成功',
    beforeRetryLogin: '重试登录',
    afterRetryLogin: '登录成功',
    unLogin: '登录失败',
    beforeJump: '正在跳转页面',
    beforeFetchData: '正在请求数据',
    afterFetchData: '请求数据成功',
    beforePay: '正在准备支付',
    afterPay: '支付完成',
    error: '啊哦，出错了',
    jsError: '啊哦，出错了呀',
    end: '扫码流程结束',
};

let lastStepTime = global.appStartTime;
let startTime = global.appStartTime;

const sendUbtDevTrace = function (traceName, value, traceFunc) {
    try {
        traceFunc(traceName, JSON.stringify(value));
    } catch (error) {
        console.log('error---');
    }
};

function stepMetric(info) {
    // metric只统计算每个步骤距离上一步的值
    ubtMetric({
        name: BUS_PAY_STEP_METRIC_KEY, //申请生成的Metric KEY
        tag: {
            pageId: info.pageId || 0,
            step: info.step || 'unknown',
            appid: info.appid || '0',
        }, //自定义Tag
        value: info.durationFromLast,
        // value: info.durationFromLast, //number 值只能是数字
    });
}

const steps = [];
const traceSteps = {
    clear: () => {
        steps.splice(0, steps.length);
    },
    add: (stepInfo) => {
        steps.push(stepInfo);
    },
    stepInfo: () => {
        return steps;
    },
};

let stopTraceCatchError;
function stepTrace(stepInfo = {}) {
    let stepTime = new Date().getTime();
    let durationFromLast = stepTime - lastStepTime;
    let durationFromStart = stepTime - startTime;
    lastStepTime = stepTime;
    const currentPage = cwx.getCurrentPage() || {};
    const pageId = currentPage.pageId;

    let traceInfo = {
        stepTime,
        startTime,
        durationFromStart,
        durationFromLast,
        appid: __global.appId,
        pageId,
        ...stepInfo,
    };
    traceSteps.add(traceInfo);
    if (traceInfo.step === BUS_PAY_STEP.pageLoad) {
        stopTraceCatchError = startTraceCatch();
    }
    if (traceInfo.step === BUS_PAY_STEP.end) {
        sendUbtDevTrace(
            BUS_PAY_STEP_TRACE_KEY,
            {
                allTraceSteps: traceSteps.stepInfo(),
            },
            ubtTrace
        );
        traceSteps.clear();
        stopTraceCatchError && stopTraceCatchError();
    } else {
        sendUbtDevTrace(BUS_PAY_STEP_TRACE_KEY, traceInfo, ubtTrace);
        stepMetric(traceInfo);
    }

    let printInfo = {
        step: traceInfo.step,
        time: new Date(stepTime).format('yyyy-MM-dd hh:mm:ss'),
        message: STEP_MESSAGE[traceInfo.step] || '未知',
    };
    if (traceInfo.step === BUS_PAY_STEP.jsError) {
        printInfo.errorInfo = traceInfo.errorInfo;
    }

    cwx.Observer.noti('o_bus_step_trace_print', printInfo);
}
function startTraceCatch() {
    const errorTrace = (err, inPromise) => {
        try {
            let errorJson = JSON.stringify(err);
            stepTrace({
                step: BUS_PAY_STEP.jsError,
                stepTime: new Date().getTime(),
                errorInfo: errorJson,
                inPromise,
            });
            console.log(errorJson);
        } catch (err2) {
            console.log(err2);
        }
    };

    const inPromiseErrorCatch = (err) => {
        errorTrace(err, true);
    };
    cwx.onError(errorTrace);
    if (cwx.canIUse('onUnhandledRejection')) {
        cwx.onUnhandledRejection(inPromiseErrorCatch);
    }
    return () => {
        cwx.offError(errorTrace);
        if (cwx.canIUse('offUnhandledRejection')) {
            cwx.offUnhandledRejection(inPromiseErrorCatch);
        }
    };
}

(() => {
    if (cwx.canIUse('getPerformance')) {
        const performance = cwx.getPerformance();
        const observer = performance.createObserver((entryList) => {
            // 手机有 script 类型统计，IDE 没有
            let entryArr = entryList.getEntries() || [];
            entryArr &&
                entryArr.forEach((item) => {
                    observer.disconnect(); // 取消监听
                    let { name, path, startTime } = item;
                    if (
                        name !== BUS_PAY_STEP.appLaunch ||
                        path !== 'pages/bus/router/index'
                    ) {
                        return;
                    }

                    let stepTime = new Date().getTime();
                    let durationFromLast = item.duration;
                    let durationFromStart = stepTime - startTime;
                    stepTrace({
                        step: BUS_PAY_STEP.appLaunch,
                        startTime: startTime,
                        stepTime,
                        duration: item.duration,
                        durationFromLast,
                        durationFromStart,
                    });
                });
        });
        observer.observe({ entryTypes: ['navigation'] });
    }
})();
function point(data) {
    // data = {
    // pointName:"",
    // result:"",
    // errMsg:"",
    // orderNumber:"",
    // ext:"",
    // pointTime:"",
    // }
    data.pointTime = new Date().format('yyyy-MM-dd hh:mm:ss');
    return Pservice.point(data).then((res) => {
        console.log('res', res);
    });
}

export { stepTrace, BUS_PAY_STEP, BUS_PAY_STEP_TRACE_KEY, point };
