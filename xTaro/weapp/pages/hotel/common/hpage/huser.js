import { cwx } from '../../../../cwx/cwx';
import util from '../utils/util';
import deferred from '../utils/deferred';
import HPromise from '../../common/hpage/hpromise';
import commonrest from '../commonrest'; // 延迟读取缓存中的commonrest,从而避免循环引用

// 是否显示微信登录, 单例
let showWechatLogin = null;

/**
 * 是否显示微信登录的开关
 */
function getLoginSwitchAsync () {
    const def = deferred.create();

    // 只请求一次
    if (showWechatLogin !== null) {
        def.resolve(showWechatLogin);
    } else {
        commonrest.getWechatSoaSwitch(['isShowWechatLogin'], (data) => {
            if (data) {
                const result = data.result || {};
                showWechatLogin = result.isShowWechatLogin === 'true';
            }
            def.resolve(showWechatLogin);
        }, 'json');
    }

    return def.promise;
}

const login = function (obj) {
    const { param, callback } = obj;

    getLoginSwitchAsync()
        .then((showWechatLogin) => {
            const params = util.extend({
                IsAuthentication: showWechatLogin ? 'T' : 'F'
            }, param || {}, true);

            cwx.user.login({
                param: params,
                callback
            });
        });
};

const isLogin = function () {
    return cwx.user.isLogin();
};

const checkLoginStatus = function (checkFromServer) {
    return new HPromise((resolve, reject) => {
        if (checkFromServer) {
            cwx.user.checkLoginStatusFromServer((isLogin) => {
                resolve(isLogin);
            });
        } else {
            return resolve(cwx.user.isLogin());
        }
    });
};

export default {
    login,
    isLogin,
    checkLoginStatus
};
