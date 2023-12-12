import { fetch } from './fetch';
import { URL_MAP } from '../confs/fetchConfs';

const getFcStatus = key => new Promise((resolve, reject) => {
    if (!key) {
        reject(new Error('key is not defined'));
        return;
    }

    fetch({
        url: URL_MAP.getRouteList,
        params: {
            names: 'fc'
        },
        onSuccess: (data) => {
            try {
                const message = data && data.data && data.data[0] && data.data[0].message || '';

                if (!message) {
                    reject(new Error('message is empty'));
                    return;
                }

                const ret = JSON.parse(message) || {};

                if (ret && typeof ret[key] !== 'undefined') {
                    resolve(ret[key]);
                } else {
                    reject(new Error(`key is not existed in ret: ${JSON.stringify(ret)}`))
                }
            } catch (e) {
                reject(e);
            }
        },
        onError: (err) => {
            reject(err);
        }
    });
});

/**
 * 获取15618/commonConfig.json中指定文件的qconfig配置信息
 * @param {string} fileName 配置文件名字
 * @returns 
 */
const getQConfigInfo = fileName => new Promise((resolve, reject) => {
    if (!fileName) {
        reject(new Error('please give file name'));
        return;
    }

    fetch({
        url: URL_MAP.getRouteList,
        params: {
            names: fileName
        },
        onSuccess: (data) => {
            try {
                const message = data && data.data && data.data[0] && data.data[0].message || '';

                if (!message) {
                    reject(new Error('message is empty'));
                    return;
                }

                const ret = JSON.parse(message) || {};

                if (ret) {
                    resolve(ret);
                } else {
                    reject(new Error(`key is not existed in ret: ${JSON.stringify(ret)}`))
                }
            } catch (e) {
                reject(e);
            }
        },
        onError: (err) => {
            reject(err);
        }
    });
});

export { getFcStatus, getQConfigInfo };