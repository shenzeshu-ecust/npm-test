import { _, __global, cwx } from '../../../../cwx/cwx';
import { checkLogin, login } from './user';

const jump = (url, opts = {}) => {
    if (!url) {
        // console.warn('url不能为空');
        return;
    }

    if (/^https?:\/\//i.test(url)) {
        jumpToH5(url);
        return;
    }

    const ret = _.extend({}, opts, { url });

    cwx.navigateTo(ret);
};

const jumpWithLogin = (url, opts) => {
    const isLogin = checkLogin();

    if (isLogin) {
        jump(url, opts);
    } else {
        login((isLogin) => {
            if (isLogin) {
                jump(url, opts);
            }
        });
    }
};

const jumpToMiniProgram = (route = {}) => {
    const { appId } = route;

    if (!appId) {
        // console.warn('appId不能为空');
        return;
    }

    let path = route.appPath;

    if (!path) {
        if (route && route.appEnvPath) {
            const env = __global.env.toLowerCase();
            path = route.appEnvPath[env] || route.appEnvPath.prd || '';
        }

        if (!path) {
            // console.warn('path信息有误');
            return;
        }
    }

    // 此方法会默认在path后边添加业绩参数
    cwx.cwx_navigateToMiniProgram({
        appId: appId,
        path: path
    });
};

/**
 * 跳转直连地址
 * @param {string} url
 * @param {boolean} needLogin
 */
const jumpToH5 = (url, needLogin = true) => {
    if (!url) {
        // console.warn('缺少H5 url');
        return;
    }

    cwx.component.cwebview({
        data: {
            url: encodeURIComponent(url),
            needLogin
        }
    });
};

export { jump, jumpWithLogin, jumpToMiniProgram, jumpToH5 };