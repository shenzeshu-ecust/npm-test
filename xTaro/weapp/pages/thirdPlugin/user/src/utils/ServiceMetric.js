import { _, cwx } from '../../../../../cwx/cwx';

const ServiceMetricKeyName = 'bbz_accounts_service_result_metric';
// const ServiceMetricKeyId = 174673;

/**
 * @typedef ServiceMetricParams
 * @property {string} method 接口名
 * @property {string} channel wx | baidu | h5 | ibuH5 ....
 * @property {'success' | 'failed'} result
 * @property {number} latency 耗时
 * @property {'fatal' | 'network' | 'service'} [errType] 错误类型 当result 为failed时传入
 * @property {number | string} [errCode] 错误码 当errType为service时，取服务的返回码； 当errType为network时，取错误信息； 当errType为fatal时，默认-1000
 * @property {'service' | 'local'} [serviceType] 有些service有本地判断
 */

/**
 * @typedef ErrorInfo
 * @property {'fatal' | 'network' | 'service'} [errType] 错误类型 当result 为failed时传入
 * @property {number | string} [errCode] 错误码 当errType为service时，取服务的返回码； 当errType为network时，取错误信息； 当errType为fatal时，默认-1000
 */

export const ServiceMetricTypeEnum = {
    service: 'service',
    local: 'local'
};

export const ServiceErrTypeEnum = {
    fatal: 'fatal',
    service: 'service',
    gateway: 'gateway',
    network: 'network'
};

export const ServiceResultEnum = {
    success: 'success',
    failed: 'failed'
}

const STORAGE_STATUS = {
    NA: 0, // 异常case
    NO_AUTH_KEY: 1, // storage中没有auth字段
    HAS_AUTH_KEY: 2 // storage中有auth字段
};

export default class ServiceMetric {
    constructor(method) {
        /**
         * @private
         */
        this.method = method;
        /**
         * @private
         * @type {number}
         */
        this.startTime = Date.now();
    }

    /**
     * @private
     * @return {page}
     */
    getCurrentPage() {
        return cwx.getCurrentPage();
    }

    /**
     * @private
     * @param result
     * @param errInfo
     * @return {{result: any, method: any, latency: number, channel: string}}
     * @param type
     */
    buildServiceMetricParams(result, errInfo, type) {
        const ret = {
            method: this.method,
            result
        };

        if (errInfo && errInfo.errType) {
            ret.errType = errInfo.errType;
        }

        if (errInfo && errInfo.errCode) {
            ret.errCode = errInfo.errCode;
        }

        if (type) {
            ret.serviceType = type;
        }

        return ret;
    }

    getStorageStatus() {
        let ret = STORAGE_STATUS.NA;
        try {
            const authKey = 'auth';
            const info = cwx.getStorageInfoSync();
            if (info && info.keys instanceof Array) {
                let hasAuthKey = false;
                for (let i = 0; i < info.keys.length; i += 1) {
                    if (info.keys[i] === authKey) {
                        hasAuthKey = true;
                        break;
                    }
                }
                ret = hasAuthKey ? STORAGE_STATUS.HAS_AUTH_KEY : STORAGE_STATUS.NO_AUTH_KEY;
            }
        } catch(e) {
            console.warn(e);
        }
        return ret;
    }

    /**
     * @public
     * @param {'success' | 'failed' } result
     * @param {ErrorInfo} [errInfo],
     * @param {'service' | 'local'} [type]
     * @param {string} [stage]
     */
    send(result, errInfo, type, stage) {
        try {
            const latency = Date.now() - this.startTime;
            cwx.sendUbtByPage.ubtMetric({
                name: ServiceMetricKeyName,
                value: Math.max(latency, 1),
                tag: {
                    stage: stage || 'NA',
                    storageStatus: this.getStorageStatus(),
                    unionid: Boolean(cwx.cwx_mkt.unionid),
                    ...this.buildServiceMetricParams(result, errInfo, type)
                }
            });
        } catch (e) {
            // ...
        }
    }
}
