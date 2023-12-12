import { cwx } from "../cwx.js"

const ubtQuery = {};

function sendUbtType(type) {
    const args = Array.prototype.slice.call(arguments, 1);
    let currentPage = cwx.getCurrentPage();
    if (!currentPage || typeof currentPage[type] !== 'function') {
        if (!ubtQuery[type]) {
            ubtQuery[type] = [];
        }
        //ubt发送时，要绑定触发当前埋点的上下
        ubtQuery[type].push({
            type,
            args
        });
        return false;
    }
    currentPage[type].apply(currentPage, args);
    return true;
}

export default {
    flush() {
        Object.keys(ubtQuery).forEach(function (item) {
            let leftArr = []
            ubtQuery[item].forEach(function ({type, args}) {
                if (!sendUbtType(type, ...args)) {
                    leftArr.push({type, args});
                }
            });
            if (leftArr.length === 0) {
                delete ubtQuery[item];
            } else {
                ubtQuery[item] = leftArr;
            }
        })
    },
    ubtTrace(name, value, extend) {
        sendUbtType("ubtTrace", name, value, extend);
    },
    ubtDevTrace(name, value) {
        sendUbtType("ubtDevTrace", name, value);
    },
    ubtMetric(option) {
        sendUbtType("ubtMetric", option);
    },
    ubtSet(name, value) {
        sendUbtType("ubtSet", name, value);
    },
    ubtSendPV(option) {
        sendUbtType("ubtSendPV", option);
    },
    ubtExposure(name, value) {
        sendUbtType("ubtExposure", name, value);
    },
    ubtTrackError(options){
        sendUbtType("ubtTrackError", options);
    }
}
