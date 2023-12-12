import { _, cwx } from '../../../../cwx/cwx.js';
import { channel, clientVersion } from './device';

const BASE_PARAMS = {
    ClientVersion: clientVersion,
    Channel: channel,
    contentType: 'json'
};

const fetch = ({ url, params = {}, onSuccess, onError, onComplete }) => {
    if (!url) {
        // console.warn('url不能为空');
        return;
    }

    const data = _.extend({}, BASE_PARAMS, params);

    cwx.request({
        url,
        data,
        success: function (data) {
            if (data&& data.statusCode == 200) { // 某些安卓机下发的是"200" 坑
                if (data.data && data.data.ResponseStatus && data.data.ResponseStatus.Ack === 'Success') {
                    if (_.isFunction(onSuccess)) {
                        onSuccess(data.data);
                    }
                    return;
                }
            }

            if (_.isFunction(onError)) {
                onError(data);
            }
        },
        fail: function (data) {
            if (_.isFunction(onError)) {
                onError(data);
            }
        },
        complete: function (data) {
            if (_.isFunction(onComplete)) {
                onComplete(data);
            }
        }
    });
};

export { fetch };