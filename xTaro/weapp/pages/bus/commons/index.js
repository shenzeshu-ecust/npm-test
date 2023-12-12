/*
 * @Author: jhyi jhyi@trip.com
 * @Date: 2023-02-28 10:52:45
 * @LastEditTime: 2023-02-28 11:30:08
 * @LastEditors: jhyi jhyi@trip.com
 * @Description:
 * @FilePath: /taro-bus/src/pages/bus/common/index.js
 *
 */

const {
    cwx,
    __global,
    CPage,
    _,
    agreementConfig,
    getAgreementPath,
} = require('./cwx/index');
const cDate = require('./date').default;

let Bus = (function () {
    let Bus = Object.create(
        {},
        {
            _: {
                get() {
                    return _;
                },
                enumerable: true,
            },
            __global: {
                get() {
                    return __global;
                },
                enumerable: true,
            },
            cwx: {
                get: function () {
                    return cwx;
                },
                enumerable: true,
            },
            agreementConfig: {
                get: function () {
                    return agreementConfig;
                },
                enumerable: true,
            },
            getAgreementPath: {
                get: function () {
                    return getAgreementPath;
                },
                enumerable: true,
            },
            originCPage: {
                get: function () {
                    return CPage;
                },
                enumerable: true,
            },
            Pservice: {
                get: function () {
                    return require('./productservice.js').default;
                },
                enumerable: true,
                configurable: true,
            },
            BusRouter: {
                get: function () {
                    return require('./BusRouter.js').default;
                },
                enumerable: true,
            },
            PageConfig: {
                get: function () {
                    return require('./bus.pageConfig');
                },
                enumerable: true,
            },
            BusDetail: {
                get: function () {
                    return require('./BusDetail.js').default;
                },
                enumerable: true,
            },
            URLUtil: {
                get: function () {
                    return require('./URLUtil.js').default;
                },
                enumerable: true,
            },
            Utils: {
                get: function () {
                    return require('./Utils.js').default;
                },
                enumerable: true,
            },
            cDate: {
                get: function () {
                    return cDate;
                },
                enumerable: true,
            },
            orderUtils: {
                get: function () {
                    return require('./orderUtils.js').default;
                },
                enumerable: true,
            },
            BusConfig: {
                get: function () {
                    return require('./busConfig.js').default;
                },
                enumerable: true,
            },
            showCustomNaviBar: {
                get: function () {
                    return showCustomNaviBar;
                },
                enumerable: true,
            },
            BusShared: {
                get: function () {
                    return require('./BusShared').default;
                },
                enumerable: true,
                configurable: true,
            },
            Storage: {
                get: function () {
                    return require('./Storage.js').default;
                },
                enumerable: true,
            },
            PromiseBuilder: {
                get: function () {
                    return require('./PromiseBuilder').default;
                },
                enumerable: true,
            },
            TaskScheduler: {
                get: function () {
                    return require('./TaskScheduler').TaskScheduler;
                },
                enumerable: true,
            },
            Scheduler: {
                get: function () {
                    return require('./TaskScheduler').Scheduler;
                },
                enumerable: true,
            },
            createEventManager: {
                get: function () {
                    return require('./createEventManager').createEventManager;
                },
                enumerable: true,
            },
            EventManager: {
                get: function () {
                    return require('./createEventManager').EventManager;
                },
                enumerable: true,
            },
            ubt: {
                get: function () {
                    return require('./ubt');
                },
                enumerable: true,
            },
            traceStep: {
                get: function () {
                    return require('./utils/traceStep');
                },
                enumerable: true,
            },
        }
    );
    return Bus;
})();

cwx.busCommon = Bus;
module.exports = Bus;
function showCustomNaviBar() {
    if (
        (cwx.getSystemInfoSync().platform || '')
            .toLowerCase()
            .indexOf('devtools') != -1
    ) {
        return true;
    } else {
        // 获取版本号
        const version = cwx.getSystemInfoSync().version;
        if (compareVersion(version, '7.0.0') >= 0) {
            // 版本号大于7.0.0时，显示自定义头部
            return true;
        } else {
            //   // 版本号低于7.0.0时，隐藏自定义头部
            return false;
        }
    }
}
// 版本号比较函数
function compareVersion(v1, v2) {
    v1 = v1.split('.');
    v2 = v2.split('.');
    const len = Math.max(v1.length, v2.length);
    while (v1.length < len) {
        v1.push('0');
    }
    while (v2.length < len) {
        v2.push('0');
    }
    for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1[i]);
        const num2 = parseInt(v2[i]);
        if (num1 > num2) {
            return 1;
        } else if (num1 < num2) {
            return -1;
        }
    }
    return 0;
}
