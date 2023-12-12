import ModelUtil from '../../common/utils/model.js';
import util from '../../common/utils/util.js';
import hrequest from '../../common/hpage/request';

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
    getHolidays: function (reqData, success, error) {
        const url = ModelUtil.serveUrl('getHolidays');
        _request(url, reqData, success, error);
    }
};
