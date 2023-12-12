import { logWithUbtTrace} from '../../common/utils/util';
import Api from "../../market/assistcutprice/indexrest.js";

const StorageUtil = require("../utils/storage.js");
const NOTICE_TYPES = {
    "PROCESS": {
        "tmplId": "BRzPWkkhV7XeWUULogfYvTo_ai9SsV3oZrJOQ5H0Oi4"
    }
};

const subscribeMessage = function(key, options) {
    return new Promise((resolve,reject) => {
        if (key && NOTICE_TYPES[key]) {
            if (notNeedSendMessage(key, options)) {
               return resolve({isShowed: 1});
            } 

            showMessageDialog(key, options);
            wx.requestSubscribeMessage({
                tmplIds: [NOTICE_TYPES[key].tmplId],
                success(res) {
                    const isAccept = res && res[Object.keys(res)[0]] == 'accept';
                    afterSuccessMessage(key, isAccept, options);

                    if (isAccept) {
                        resolve({isAccept: 1})
                    } else {
                        resolve({isAccept: -1})
                    }
                },
                fail(err) {
                    reject(err)
                }
            });
        } else {
            resolve(false);
        }
    });
}
const getTimplId = function(key) {
    return NOTICE_TYPES[key]?.tmplId || '';
}
const notNeedSendMessage = function(key, options) {
    const {orderId, point} = options;
    //进程通知
    if (key === 'PROCESS') {
        //已通知过，关卡以逗号相隔
        const storageValue = StorageUtil.getStorage(`${key}_${orderId}`);

        if (storageValue?.split(',')?.includes(point?.toString())) {
            return true;
        }

        return false;
    }

    return false;
}
const showMessageDialog = function(key, options) {
    const {orderId} = options;
    if (key === 'PROCESS') { 
        logWithUbtTrace('197554',{
            orderid: orderId,
            type:'小程序订阅'
        });
    }
}

function afterSuccessMessage(key, accept, options) {
    const {orderId, point} = options;
    //进程通知
    if (key === 'PROCESS') {
        if (accept) {
            //增加storage
            const storageValue = StorageUtil.getStorage(`${key}_${orderId}`) || '';
            StorageUtil.setStorage(`${key}_${orderId}`, `${storageValue},${point}`, 525600);
            sendAssistNotice(key, orderId, point);
        }

        //埋点
        logWithUbtTrace('197555',{
            orderid:orderId,
            type:'小程序订阅',
            operate: accept ? '确定' : '取消'
        });
    }
}


function sendAssistNotice (key, orderId, point){
    const keyId = NOTICE_TYPES[key]?.tmplId;
    if (!keyId || keyId.length === 0) {
        return;
    }

    const options = {
        orderId,
        point,
        acceptStatus:{}
    };

    options.acceptStatus[keyId] = "accept";
    Api.assistNotice(options);
}

module.exports = {subscribeMessage, getTimplId};