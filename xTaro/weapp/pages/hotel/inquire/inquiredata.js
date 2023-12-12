import ModelUtil from '../common/utils/model.js';
import util from '../common/utils/util';
import hrequest from '../common/hpage/request';

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
            onError && onError(error);
        }
    });
};

export default {
    getCityInfo: function () {
        reqMethod('getcityinfo', ...arguments);
    },
    newGuestGift: function () {
        reqMethod('newguestgift', ...arguments);
    },
    getRankUrlInfo: function () {
        reqMethod('getrankurlinfo', ...arguments);
    }
};
