import { _, cwx } from '../../../../cwx/cwx';

/**
 * 判断是否登录，有callback时，是异步
 * @param {function} [callback]
 * @return {*}
 */
const checkLogin = (callback) => {
    if (_.isFunction(callback)) {
        cwx.user.checkLoginStatusFromServer(callback); // 异步判断，从服务端判断
        return;
    }

    return cwx.user.isLogin(); // 同步判读，读取本地auth值，不确定auth是否还有效
};

/**
 * 去登录，若有callback，仅返回是否登录成功
 * @param {function} [callback]
 */
const login = (callback) => {
    cwx.user.login({
        param: {},
        callback: (data) => {
            if (_.isFunction(callback)) {
                callback(data && data.ReturnCode == 0);
            }
        }
    });
};

/**
 * 退出登录，二次弹窗确认。
 * 调用传入的callback，传递是否退出登录成功
 * 失败时默认toast
 *
 * @param {function} callback
 */
const logout = (callback) => {
    cwx.showModal({
        title: '提示信息',
        content: '您确定要退出登录吗？',
        cancelText: '点错了',
        confirmText: '确定',
        success: function (res) {
            if (res && res.confirm) {
                cwx.showLoading();
                cwx.user.logout((success) => {
                    if (!success) {
                        cwx.showModal({
                            title: '退出登录失败，请重新再试！',
                            showCancel: false
                        });
                    }
                    if (_.isFunction(callback)) {
                        callback(success);
                    }
                    cwx.hideLoading();
                });
            }
        }
    });
};

/**
 * 跳转手机号查单验证地址
 */
const jumpToMobileValidate = (url) => {
    try {
        cwx.user.mobileQueryOrder({
            from: url
        })
    } catch (e) {
        // console.warn(e);
    }
};

export {
    checkLogin,
    login,
    logout,
    jumpToMobileValidate
};