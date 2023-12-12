import hrequest from '../../common/hpage/request';
const ModelUtil = require("../../common/utils/model.js")
const util = require("../../common/utils/util")
const casReq = require('../../cas/casReqNew')

const needCasReqList = ['getroomlist'];

const reqMethod = (name, params, onSuccess, onError) => {
    const request = needCasReqList.includes(name) ? casReq.request : hrequest.hrequest;
    request({
        url: ModelUtil.serveUrl(name),
        data: params,
        success: function(result) {
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
    getRoomList: function() {
        reqMethod('getroomlist', ...arguments);
    },
}