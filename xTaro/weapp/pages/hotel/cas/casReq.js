import { cwx } from '../../../cwx/cwx.js';
import ModelUtil from '../common/utils/model.js';
import hrequest from '../common/hpage/request';

export default {
    request: function (opts) {
        cwx.createAntiSpiderRequest({
            url: ModelUtil.serveUrl('getSessionKey'),
            requestFn: hrequest.hrequest,
            fixedParams: {
                appid: '100014036'
            },
            callback: function (token, res) {
                const sessionKey = res?.data?.sessionKey || '';
                opts.data.session = {
                    key: token,
                    sessionKey
                };
                hrequest.hrequest(opts);
            },
            getScriptFromRsp: function (rsp) {
                return rsp && rsp.data && rsp.data.data;
            }
        });
    }
};
