import ModelUtil from '../common/utils/model';
import hrequest from '../common/hpage/request';
import util from '../common/utils/util';
export default {
    waitCommentList: function (oData, onSuccess, onError) {
        hrequest.hrequest({
            url: ModelUtil.serveUrl('waitcommentlist'),
            data: oData,
            success: function (result) {
                if (util.successSoaResponse(result)) {
                    onSuccess && onSuccess(result.data);
                } else {
                    onError && onError();
                }
            },
            fail: function (err) {
                onError && onError(err?.data);
            }
        });
    }
};
