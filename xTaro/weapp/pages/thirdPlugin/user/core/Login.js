import { _, cwx } from '../../../../cwx/cwx';
import { qconfigSingleton } from './usercore';

// 获取 ABTest 结果
function getABVersion (expCode) {
    let ret = 'A';
    const value = cwx.ABTestingManager.valueForKeySync(expCode);
    if (typeof value === 'string' && !!value) {
        ret = value;
    }
    return ret;
};

/**
 * @typedef LoginCallbackRes
 * @property {string} ReturnCode // '0' 代表登录成功
 * @property {string} Message
 */

/**
 * @typedef LoginParams
 * @property {string} [IsAuthentication] // 控制是否出现微信账号登录，F表示不出现微信账号登录，默认是出现微信账号登录。
 * @property {string} [showDirectLoginBtn] // deprecated 控制使用微信账号注册并登录时，是否出现直接登录按钮。F表示不出现直接登录按钮，T表示出现直接登录按钮。如果都没有传，使用默认值，默认值是配置。
 * @property {string} [loginStimulateTipsId] // 登录页面，登录激励话术文案，传入场景值，登录注册从配置获取对应的文案展示。默认文案：登录后可享受会员权益
 */

/**
 * @typedef LoginOptions
 * @property {(loginCallbackRes: LoginCallbackRes) => void} [callback] 回调，会在onshow阶段执行
 * @property {LoginParams} [param] 参数
 */

export default class Login {
    static _newLoginPageUrl = '/pages/accounts/pages/newlogin/index';
    static _mobiledynamiclogin = '/pages/accounts/pages/mobiledynamiclogin/index'

    static _wrapCallbackFlag = '__bbz_accounts_wrap_cb_flag';

    static _wrapLifecycleMethod = 'onShow';

    static _observerKey = 'bbz_accounts_login_callback';

    /**
     * TODO 后续拆分出去维护
     * @type {string}
     * @private
     */
    static _devTraceName = 'bbz_accounts_wx_flow';

    /**
     * 获取B版本登录页实际url，参数是需要拼接下url上的
     * @private
     * @param {LoginParams} params
     * @return {string}
     */
    static _getNewLoginPageUrl(params) {
        // 手机授权登录开关： true、手手机授权登录；false、无手机授权登录
        const oneTapSwitch = qconfigSingleton.getCommonConfigByName('oneTapSwitch', true);
        // 快捷登录 AB 控制：A、老版本；B、新快捷登录
        const abVersion = getABVersion('230815_BBZ_click')
        const isOldVersion = abVersion != 'B';

        //  命中老版本 + 关 => 命中老版本，且关闭了手机授权登录 => 手机动态码页
        //  命中新版本 + 关 + 无后端标记 => 手机动态码
        //  其他情况都会进入 newlogin 页面，由页面控制展示内容
        const goMobileDynamic = (isOldVersion && !oneTapSwitch) || (!isOldVersion && !oneTapSwitch && !cwx.user.userInfo)

        // 只有在主版小程序且命中动态码，才会去动态码页面
        let url = goMobileDynamic && cwx.checkIsMasterMiniapp && cwx.checkIsMasterMiniapp()
                ? this._mobiledynamiclogin
                : this._newLoginPageUrl;

        cwx.sendUbtByPage.ubtDevTrace(this._devTraceName, {
            type: '_getNewLoginPageUrl',
            url: url,
            oneTapSwitch,
            abVersion,
        });

        const queryList = [];
        _.each(params, (val, key) => {
            queryList.push(`${key}=${val}`);
        });
        // 新增标记表明登录完成后应该直接返回还是返回两层
        // 如果是直接进入的动态码页面，就应该直接返回
        if (goMobileDynamic) {
            queryList.push('useDirectBack=T')
        }
        if (queryList.length > 0) {
            url = `${url}?${queryList.join('&')}`;
        }
        return url;
    }

    /**
     * 调用callback
     * @param callback
     * @private
     */
    static _callWrappedLoginCallback(callback) {
        try {
            callback({
                ReturnCode: cwx.user.isLogin() ? '0' : '-1',
                Message: ''
            });
        } catch (e) {
            cwx.sendUbtByPage.ubtDevTrace(this._devTraceName, {
                type: '_callWrappedLoginCallback',
                stage: 'failed',
                message: e.message
            });
            console.error(e);
        }
    }

    /**
     * 根据事件监听，包装调用页的onShow|componentDidShow事件，先执行callback，在执行origin方法
     * @param currentPage
     * @param callback
     * @private
     */
    static _processLoginCallback(currentPage, callback) {
        // 若func不存在，则不wrap
        const type = this._wrapLifecycleMethod;
        const originMethod = currentPage[type];
        if (!_.isFunction(originMethod)) {
            return;
        }

        // 若currentPage没有被wrap过，wrap下，标记
        if (!currentPage[this._wrapCallbackFlag]) {
            console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~start wrap method');
            currentPage[this._wrapCallbackFlag] = true;

            let wrappedMethod = (...props) => {
                console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~~call wrappedMethod: ${type}`);
                this._callWrappedLoginCallback(callback);
                console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~~call originMethod: ${type}`);
                originMethod.apply(currentPage, props);

                // 开始释放
                delete currentPage[this._wrapCallbackFlag];
                currentPage[type] = originMethod.bind(currentPage);
                wrappedMethod = null;
            }

            currentPage[type] = wrappedMethod.bind(currentPage);
        }
    }

    static _observerLoginCallback(currentPage, callback) {
        try {
            cwx.Observer.addObserverForKeyOnly(this._observerKey, () => {
                console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~has emit loginCallback');
                this._processLoginCallback(currentPage, callback)
            });
        } catch (e) {
            cwx.sendUbtByPage.ubtDevTrace(this._devTraceName, {
                type: '_observerLoginCallback',
                stage: 'failed',
                message: e.message
            });
            console.error(e);
        }
    }

    static _goNewLoginPage(currentPage, params, callback) {
        const url = this._getNewLoginPageUrl(params);
        this._observerLoginCallback(currentPage, callback);
        cwx.navigateTo({ url });
    }

    /**
     * 跳登录
     * @public
     * @param {LoginOptions} options
     */
    static goLogin(options) {
        const { callback, param } = options || {};
        const currentPage = cwx.getCurrentPage();
        const cb = _.isFunction(callback)
            ? callback.bind(currentPage)
            : () => {
            };
        const params = _.extend({}, param || {});

        this._goNewLoginPage(currentPage, params, cb);
    }
}
