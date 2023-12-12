/**
 * 178095
 * @type {string}
 */
export const bbz_accounts_wx_flow = 'bbz_accounts_wx_flow';

export const TraceKeyMap = {
    c_wechat_mobiletoken_login: '184593', //	手机号一键登录button点击		微信授权手机一键登录按钮点击
    c_wechat_otherphone_button: '184594', //	其他手机号登录点击		其他手机号登录入口点击
    c_wechat_mobilephone_show: '184595', //	手机号输入蒙版曝光		手机号验证码登录蒙版曝光
    c_wechat_verifycode_send: '184596', //	获取验证码button点击		获取验证码和重发验证码点击
    c_wechat_mobilephone_login: '184597', //	登录button点击		手机验证码登录button点击
    c_wechat_mobilephone_close: '184598', //	手机号输入蒙版close点击		手机号验证码登录蒙版关闭按钮点击
    c_wechat_thirdlogin_button: '184599', //	微信登录button点击		微信授权登录按钮点击
    c_wechat_phonelink_show: '184600', //	微信联合登录蒙版曝光
    c_wechat_phonelink_button: '184602', //	微信联合登录一键绑定手机button点击
    // c_wechat_phonelink_success: '184603', //	手机号绑定成功并登录成功埋点  FIXME 这里埋点没有埋
    c_wechat_login_back: '184605', //	登录页返回按钮点击		登录页返回按钮点击
    c_wechat_login_success: '184606', //	微信小程序前端登录成功埋点		微信小程序前端登录成功埋点
    c_wechat_login_fail: '184607', //	微信小程序前端登录失败埋点		微信小程序前端登录失败埋点
    c_wechat_phonelink_showB: '184608', //	社交账号登录多账号选择弹窗曝光
    c_wechat_phonelink_bindB: '184609', //	选择账号button点击
    c_wechat_phonelink_nobindB: '184610', //	暂不合并button点击
    c_wechat_nolink_button: '184617' // 微信联合登录直接登录button点击 不绑手机直接登录入口点击
};

export const PageIdMap = {
    login: '10650052979'
};

export const ERROR_CODE_MAP = {
    NETWORK_ERROR: -1000,
    VALIDATE_INPUT_ERROR: -1200,
    VALIDATE_AGREEMENT_ERROR: -1201
};