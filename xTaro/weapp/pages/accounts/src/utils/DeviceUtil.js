import { cwx, _ } from '../../../../cwx/cwx';

export default class DeviceUtil {
    static getNetworkType(callback) {
        const cb = _.isFunction(callback) ? callback : () => {};
        cwx.getNetworkType({
            success: (res) => {
                cb(res && res.networkType !== 'none');
            }
        })
    }
}
