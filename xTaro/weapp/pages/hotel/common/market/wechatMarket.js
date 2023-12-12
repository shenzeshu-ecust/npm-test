import ModelUtil from '../utils/model.js';
import geoService from '../geo/geoservice.js';
import hrequest from '../hpage/request';
import HPromise from '../hpage/hpromise';

const wechatSendSmsAfterSixDays = (options) => {
    const { formid, oid } = options;

    new HPromise(
        (resolve, reject) => {
            geoService.locatePoi(true, (pos) => {
                resolve({
                    lat: pos.lat,
                    lng: pos.lng
                });
            }, () => {
                reject();
            });
        })
        .catch(() => {
            return {
                lat: null,
                lng: null
            };
        })
        .then((opt) => {
            hrequest.hrequest({
                url: ModelUtil.serveUrl('wechatsmsv2'),
                checkAuth: true,
                data: {
                    formid,
                    oid,
                    head: {
                        extension: [
                            {
                                name: 'clientlat',
                                value: opt.lat + ''
                            }, {
                                name: 'clientlon',
                                value: opt.lng + ''
                            },
                            {
                                name: 'clientcoord',
                                value: 'wgs84'
                            }]
                    }
                }
            });
        });
};

// 主流程formid服务(目前仅用于订单推送)
const wechatMsgFormIds = (options) => {
    const { formIds, openId, orderId } = options;

    hrequest.hrequest({
        url: ModelUtil.serveUrl('postMsgFormIds'),
        data: {
            formIds,
            openId,
            orderId
        }
    });
};
export default {
    wechatSendSmsAfterSixDays,
    wechatMsgFormIds
};
