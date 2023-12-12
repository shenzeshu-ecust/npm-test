import { cwx, __global } from '../../../../cwx/cwx';
import { METRIC_KEY_LIST } from '../confs/ubtConf';

const env = __global.env;

const currentEnv = env.toLowerCase();

/**
 *
 * @param {Object} tag
 * @param {string} tag.name 记录小程序的类型，wx、baidu...
 * @param {string} tag.type 记录埋点用在的位置，比如：我携首页、订单列表页...
 *
 * @param metricName
 */
const logWithUbtMetric = (tag, metricName = METRIC_KEY_LIST) => {
    let { sendUbtByPage } = cwx;
    if (sendUbtByPage && sendUbtByPage.ubtMetric) {
        sendUbtByPage.ubtMetric({
            name: metricName || METRIC_KEY_LIST,
            tag,
            value: 1
        });
    }
};

export { currentEnv, logWithUbtMetric };
