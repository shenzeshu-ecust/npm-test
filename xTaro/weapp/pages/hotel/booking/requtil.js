import ModelUtil from '../common/utils/model.js';
import util from '../common/utils/util';
import hrequest from '../common/hpage/request';
import casReq from '../cas/casReq';

const needEncodeReqList = ['reservation', 'createorder', 'getphonenumber'];
const needCasReqList = ['reservation'];

const reqMethod = (name, params, onSuccess, onError) => {
    const needEncodeReq = needEncodeReqList.includes(name) ? 1 : 0;
    const request = needCasReqList.includes(name) ? casReq.request : hrequest.hrequest;
    request({
        url: ModelUtil.serveUrl(name),
        data: params,
        encodeReqData: needEncodeReq, // 请求加密
        success: function (result) {
            if (util.successSoaResponse(result)) {
                onSuccess && onSuccess(result.data, result);
            } else {
                onError && onError(result.data);
            }
        },
        fail: function (error) {
            onError && onError(error);
        }
    });
};

export default {
    reservationCheck: function () {
        reqMethod('reservation', ...arguments);
    },
    createOrder: function () {
        reqMethod('createorder', ...arguments);
    },
    savePassengerNames: function () {
        reqMethod('savepassengernames', ...arguments);
    },
    getUserPhoneNumber: function () {
        reqMethod('getphonenumber', ...arguments);
    }

};
