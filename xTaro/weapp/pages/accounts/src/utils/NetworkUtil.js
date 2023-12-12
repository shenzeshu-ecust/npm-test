import { __global } from '../../../../cwx/cwx';
import { PassportGatewayDomainMap } from '../confs/fetchConf';

export default class NetworkUtil {
    static isHttpsUrl(url) {
        return /^http(s):\/\//.test(url);
    }

    static buildPassportGatewayUrl(url) {
        if (!url) {
            return '';
        }
        if (this.isHttpsUrl(url)) {
            return url;
        }
        const domain = PassportGatewayDomainMap[__global.env] || PassportGatewayDomainMap.prd;
        return `${domain}/gateway/api/soa2/${url}`;
    }
}
