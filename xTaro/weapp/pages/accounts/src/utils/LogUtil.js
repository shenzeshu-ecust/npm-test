import { _, __global, cwx } from '../../../../cwx/cwx';
import { bbz_accounts_wx_flow, TraceKeyMap } from '../conf/logConf';

const getPageInfo = () => {
    const ret = {
        path: 'NA',
        pageId: 'NA'
    }
    const currentPage = cwx.getCurrentPage() || {};
    if (currentPage.route) {
        ret.path = currentPage.route;
    }
    if (currentPage.pageId) {
        ret.pageId = currentPage.pageId;
    }
    return ret;
}

export default class LogUtil {
    /**
     * @private
     * @param props
     */
    static isDebugEnv(...props) {
        return __global.env === 'fat';
    }

    static getTraceKeyNameById(id) {
        let ret = '';
        _.each(TraceKeyMap, (val, key) => {
            if (val === id) {
                ret = key;
            }
        });
        return ret;
    }

    /**
     * @public
     * @param info
     */
    static logDevTrace(info) {
        try {
            if (this.isDebugEnv()) {
                console.log('%c[bbz accounts devTrace]', 'color: forestgreen;font-weight: bold', info);
            }
            cwx.sendUbtByPage.ubtDevTrace(bbz_accounts_wx_flow, info || {});
        } catch (e) {
            console.error('LogUtil.logDevTrace failed', e);
        }
    }

    /**
     * @public
     * @param keyId
     * @param info
     */
    static logTrace(keyId, info) {
        try {
            if (this.isDebugEnv()) {
                console.log(
                    '%c[bbz accounts trace]',
                    'color: pink;font-weight: bold',
                    `keyId: ${keyId}, keyName: ${this.getTraceKeyNameById(keyId)}, info: `,
                    info
                );
            }
            cwx.sendUbtByPage.ubtTrace(keyId, info || {});
        } catch (e) {
            console.error('LogUtil.logTrace failed', e);
        }
    }

    static logRequestFailed(method, err) {
        this.logDevTrace({
            Method: method,
            Type: 'request',
            Stage: 'failed',
            ErrMsg: err && err.errMsg ? err.errMsg : 'NA'
        });
    }

    /**
     * @param {boolean} success
     * @param {Object} tags
     * @param {string} tags.scene
     * @param {string} [tags.stage]
     * @param {string|number} [tags.code]
     * @param {number} [tags.latency]
     */
    static monitor(success, tags) {
        const {
            scene,
            stage, code, latency
        } = tags || {};
        const fullTags = {
            groupPlatform: 'ctrip_wechat',
            source: 'sdk1.0',
            stage: stage || '',
            code: typeof code === 'undefined' ? 0 : code,
            appId: __global.appId,
            scene: scene,
            result: success ? 'success' : 'failed',
            path: getPageInfo().path
        };
        cwx.sendUbtByPage.ubtMetric({
            name: 'bbz_accounts_login_statistics',
            tag: fullTags,
            value: typeof latency === 'undefined' ? 1 : parseInt(latency || '', 10)
        });
    }
}

/**
 *
 * @param {object} config
 * @param {string} config.scene
 * @param {string} [config.totalScene]
 * @param {string} config.traceType
 * @returns {function(): {fail: function(*): void, success: function(*=): void, start: function(): void}}
 */
export const createLogMonitor = (config) => () => {
    const { scene, traceType } = config;
    let totalScene = config.totalScene
    if (!totalScene) {
        totalScene = `${scene}_total`;
    }
    let startAt = 0;
    return {
        start: () => {
            startAt = Date.now();
            LogUtil.monitor(true, {
                scene: totalScene
            });
        },
        success: (traceSubtype = '') => {
            LogUtil.logTrace(TraceKeyMap.c_wechat_login_success, {
                type: traceType,
                subtype: traceSubtype
            });
            LogUtil.monitor(true, {
                scene,
                latency: Date.now() - startAt,
                code: 0
            });
        },
        fail: (code) => {
            const fullCode = typeof code === 'undefined' ? -1000 : code;
            LogUtil.monitor(false, {
                scene,
                latency: Date.now() - startAt,
                code: fullCode
            });
        }
    }
};