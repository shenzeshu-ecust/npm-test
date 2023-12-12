import hrequest from '../common/hpage/request';
import ModelUtil from '../common/utils/model.js';
import casReq from '../cas/casReq';
import util from '../common/utils/util';

const needCasReqList = ['gethotellist', 'getnearbyhotellist', 'getcompensatehotellist', 'getHourRoomList'];

const reqMethod = (name, params, onSuccess, onError) => {
    const request = needCasReqList.includes(name) ? casReq.request : hrequest.hrequest;
    request({
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
            onError && onError(error);
        }
    });
};

export default {
    loadHotelList: function () {
        reqMethod(...arguments);
    },
    loadPriceRange: function () {
        reqMethod('cityPriceRangeV2', ...arguments);
    },
    getHourRoomList: function () {
        reqMethod('getHourRoomList', ...arguments);
    },
    getFlowActivities: function () {
        reqMethod('getFlowActivities', ...arguments);
    },
    getThirteenBanner: function () {
        reqMethod('getThirteenBanner', ...arguments);
    },
    getPromotionBanner: function () {
        reqMethod('getHotelListBanner', ...arguments);
    }
};
