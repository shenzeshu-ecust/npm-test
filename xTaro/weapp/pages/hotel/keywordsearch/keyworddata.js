import ModelUtil from '../common/utils/model.js';
import util from '../common/utils/util.js';
import date from '../common/utils/date.js';
import hrequest from '../common/hpage/request';

function _request (url, reqData, onSuccess, onError) {
    hrequest.hrequest({
        url,
        data: reqData,
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
}

export default {
    keywordAssociation: function (params, success, error) {
        const url = ModelUtil.serveUrl('keywordAssociation');
        const reqData = {
            cityId: params.cityID,
            districtId: params.did ?? 0,
            keyword: params.keyword,
            checkin: date.formatTime('yyyyMMdd', params.inday),
            checkout: date.formatTime('yyyyMMdd', params.outday),
            from: params.from
        };
        if (params.userCityId && params.lat) {
            reqData.userCoordinate = {
                cityId: params.userCityId,
                latitude: params.lat,
                longitude: params.lng
            };
        }
        _request(url, reqData, success, error);
    }
};
