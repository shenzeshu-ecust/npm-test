import hrequest from '../../common/hpage/request';
import model from '../../common/utils/model';
import util from '../../common/utils/util';

export default {
    doRequest: function (request, callback) {
        if (!util.isFunction(callback)) {
            return;
        }
        hrequest.hrequest({
            url: model.serveUrl('getEmergencyInfo'),
            data: request,
            success: function (res) {
                if (!util.successSoaResponse(res)) {
                    return callback();
                }
                callback(res.data);
            },
            fail: function () {
                callback();
            }
        });
    }

};
