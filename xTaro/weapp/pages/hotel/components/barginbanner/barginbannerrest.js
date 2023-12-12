import util from '../../common/utils/util';
import hrequest from '../../common/hpage/request';
import model from '../../common/utils/model.js';
import commonrest from '../../common/commonrest';
import hPromise from '../../common/hpage/hpromise';

const rJavaDateTicks = /\d+(\+\d+)?/;
function convertResponse (res, canInitiate) {
    if (!res || (res.status === 1 && !canInitiate)) {
        return { showBlock: false };
    }

    if (res.bargain && res.bargain.beginTime && res.status === 2) {
        const ticks = rJavaDateTicks.exec(res.bargain.beginTime);
        const beginTime = new Date(parseInt(ticks[0], 10));
        beginTime.setDate(beginTime.getDate() + 1);

        res.bargain.remainSeconds = Math.floor((beginTime.getTime() - (new Date()).getTime()) / 1000);
    }

    return res;
}

export default {
    doRequest (options, onSuccess, onError) {
        if (util.isEmpty(options) || !util.isFunction(onSuccess)) {
            return;
        }

        new hPromise((resolve, reject) => {
            commonrest.getWechatSoaSwitch(['MpCutPriceSwitch', 'MpCutPriceCreateSwitch'], (switches) => {
                if (util.isEmpty(switches) || util.isEmpty(switches.result)) {
                    return reject();
                }

                const canShow = switches.result.MpCutPriceSwitch === '1';
                const canInitiate = switches.result.MpCutPriceCreateSwitch === '1';

                if (!canShow) {
                    return reject();
                }

                resolve(canInitiate);
            }, 'json');
        })
            .then((canInitiate) => {
                const { orderId, masterHotelId, orderStatus } = options;

                hrequest.hrequest({
                    url: model.serveUrl('wechatbargaindetail'),
                    checkAuth: true,
                    data: {
                        orderStatus,
                        masterHotelId,
                        orderId
                    },
                    success: function (res) {
                        if (util.successSoaResponse(res)) {
                            return onSuccess(convertResponse(res.data, canInitiate));
                        }

                        onError && onError();
                    },
                    fail: function () {
                        onError && onError();
                    }
                });
            })
            .catch(() => {
                onError && onError();
            });
    }
};
