import ModelUtil from '../common/utils/model.js';
import util from '../common/utils/util';
import hrequest from '../common/hpage/request';

export default {
    getFavoriteHotelList: function (request, onSuccess, onError) {
        hrequest.hrequest({
            url: ModelUtil.serveUrl('getuserhotellist'),
            data: request,
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
};
