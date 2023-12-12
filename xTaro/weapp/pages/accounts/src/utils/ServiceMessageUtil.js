import { DefaultMessageMap, ServiceMessageConfig, soa2UrlReg } from '../conf/serviceMessageConf';
import LogUtil from './LogUtil';

export default class ServiceMessageUtil {
    /**
     * @private
     * @param soa2Url
     * @return {{code: string, method: string}|null}
     */
    static getServiceCodeAndMethodByUrl(soa2Url) {
        const ret = soa2UrlReg.exec(soa2Url);
        if (ret && ret[1] && ret[2]) {
            return {
                code: ret[1],
                method: ret[2]
            };
        }
        return null;
    }

    /**
     * @private
     * @param codeAndMethod
     * @return {null|ServiceMessageConfig}
     */
    static getServiceMessageConfigByCodeAndMethod(codeAndMethod) {
        if (!codeAndMethod.code || !codeAndMethod.method) {
            return null;
        }

        const configByCode = ServiceMessageConfig[codeAndMethod.code];
        if (!configByCode) {
            return null;
        }

        return configByCode[codeAndMethod.method] || null;
    }

    /**
     * @public
     * @param soa2Url
     * @return {string}
     */
    static getRequestFailedMessage(soa2Url) {
        const codeAndMethod = this.getServiceCodeAndMethodByUrl(soa2Url);
        if (!codeAndMethod) {
            LogUtil.logDevTrace({
                Method: 'ServiceMessageUtil.getRequestFailedMessage',
                Info: `cannot parse code and method from: ${soa2Url}`
            });
            return DefaultMessageMap.requestFailed;
        }

        const messageConfig = this.getServiceMessageConfigByCodeAndMethod(codeAndMethod);
        if (!messageConfig) {
            LogUtil.logDevTrace({
                Method: 'ServiceMessageUtil.getRequestFailedMessage',
                Info: `cannot find config from url: ${soa2Url}`
            });
            return DefaultMessageMap.requestFailed;
        }

        const { requestFailedMessage, methodCode } = messageConfig;
        return `${requestFailedMessage}(-${codeAndMethod.code}${methodCode})`;
    }
}
