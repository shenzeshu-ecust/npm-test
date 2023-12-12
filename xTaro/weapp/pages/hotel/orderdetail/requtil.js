import hrequest from '../common/hpage/request';
import ModelUtil from '../common/utils/model.js';
import util from '../common/utils/util';

const reqMethod = (name, params, onSuccess, onError) => {
    hrequest.hrequest({
        url: ModelUtil.serveUrl(name),
        data: params,
        success: function (result) {
            if (util.successSoaResponse(result)) {
                onSuccess && onSuccess(result.data);
            } else {
                onError && onError();
            }
        },
        fail: function (error) {
            onError && onError();
        }
    });
};
export default {
    getOrderDetail: function () {
        reqMethod('getorderdetailnew', ...arguments);
    },
    getOrderStatus: function () {
        reqMethod('getorderstatus', ...arguments);
    },
    toPay: function () {
        reqMethod('newpayget', ...arguments);
    },
    checkPassengerInfo: function () {
        reqMethod('checkOrderPassenger', ...arguments);
    },
    submitNps: function () {
        reqMethod('npssubmit', ...arguments);
    },
    getSwiperBannerData: function () {
        reqMethod('swiperBannerForOrder', ...arguments);
    },
    getModule: function () {
        reqMethod('SmzGetModuleListV3', ...arguments);
    },
    doHomestayRequest: function () {
        reqMethod('homestayinfo', ...arguments);
    }
};
