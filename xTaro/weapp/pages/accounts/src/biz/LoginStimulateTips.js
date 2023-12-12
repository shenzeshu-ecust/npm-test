import { _, cwx } from '../../../../cwx/cwx';
import { DEFAULT_LOGIN_STIMULATE_TIPS } from '../conf/pageConf';
import NetworkUtil from '../utils/NetworkUtil';
import { FetchUrlMap } from '../confs/fetchConf';
import ServiceMetric, { ServiceErrTypeEnum, ServiceResultEnum } from '../ServiceMetric';
import LogUtil from '../utils/LogUtil';

export default class LoginStimulateTips {
    static metric = new ServiceMetric(`LoginStimulateTips`);

    static keyName = 'loginStimulateTipsForTinyWeixin';

    static processResp(resp) {
        let errInfo;
        // response failed
        if (!resp || !resp.data) {
            errInfo = {
                errType: ServiceErrTypeEnum.network,
                errCode: 'no resp or resp.data'
            };
            return [errInfo, null];
        }

        // gateway failed
        if (resp.data.ReturnCode !== 0) {
            errInfo = {
                errType: ServiceErrTypeEnum.gateway,
                errCode: resp.data.ReturnCode
            };
            return [errInfo, null];
        }

        try {
            const result = JSON.parse(resp.data.Result);
            // service failed
            if (!result || result.returnCode !== 0) {
                errInfo = {
                    errType: ServiceErrTypeEnum.service,
                    errCode: result ? result.returnCode : 'NA'
                };
                return [errInfo, null];
            }

            // right
            if (result.item && result.item.keyName === this.keyName && result.item.value) {
                const config = JSON.parse(result.item.value);
                if (config && !_.isEmpty(config)) {
                    return [null, config];
                }
            }

            // wrong
            return [null, {}];
        } catch (e) {
            errInfo = {
                errType: ServiceErrTypeEnum.fatal,
                errCode: -1000
            };
            return [errInfo, null];
        }
    }

    static async getTips(sceneId) {
        if (!sceneId) {
            LogUtil.logDevTrace({
                method: 'LoginStimulateTips.getTips',
                message: 'no sceneId'
            });
            return Promise.resolve(DEFAULT_LOGIN_STIMULATE_TIPS);
        }

        return new Promise((resolve) => {
            cwx.request({
                url: NetworkUtil.buildPassportGatewayUrl(FetchUrlMap.getConfigs),
                data: {
                    AccountHead: {},
                    Data: {
                        appId: '100004116',
                        keyName: this.keyName
                    }
                },
                success: (resp) => {
                    const [errInfo, config] = this.processResp(resp);
                    if (errInfo) {
                        this.metric.send(ServiceResultEnum.failed, errInfo);
                        LogUtil.logDevTrace({
                            method: 'LoginStimulateTips.getTips',
                            info: errInfo,
                            requestId: resp && resp.data ? resp.data.RequestId : 'NA'
                        });
                        resolve(DEFAULT_LOGIN_STIMULATE_TIPS);
                        return;
                    }

                    LogUtil.logDevTrace({
                        method: 'LoginStimulateTips.getTips',
                        info: JSON.stringify(config)
                    });
                    resolve(config[sceneId] || DEFAULT_LOGIN_STIMULATE_TIPS);
                },
                fail: (err) => {
                    this.metric.send(
                        ServiceResultEnum.failed,
                        {
                            errType: ServiceErrTypeEnum.network,
                            errCode: err && err.errMsg ? err.errMsg : 'NA'
                        }
                    );
                    resolve(DEFAULT_LOGIN_STIMULATE_TIPS);
                }
            });
        })
    }
}
