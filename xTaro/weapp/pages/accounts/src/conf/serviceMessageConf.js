/**
 * @typedef ServiceMessageConfig
 * @property {string} methodCode 方法对应的code
 * @property {string} requestFailedMessage 请求失败时使用的文案
 * @property {string} defaultMessage 默认文案（保留原有的内容）
 */

/**
 *
 * @type {{requestFailed: string, requestFailedType: {login: string, validate: string}}}
 */
export const DefaultMessageMap = {
    requestFailed: '请求失败，系统或网络问题，请稍后重试(-1000)',
    // 区分请求类型，比如校验、登录、注册、发送等等
    requestFailedType: {
        validate: '验证失败，系统或网络问题，请稍后重试',
        login: '登录失败，系统或网络问题，请稍后重试',
        authenticate: '授权失败，系统或网络问题，请稍后重试',
        request: '请求失败，系统或网络问题，请稍后重试',
        loginOrRegister: '登录或注册失败，系统或网络问题，请稍后重试',
        bind: '绑定失败，系统或网络问题，请稍后重试',
        send: '发送失败，系统或网络问题，请稍后重试'
    }
}

export const ServiceCodeMap = {
    AccountsMessageService: '11448',
    PassportService: '12559',
    ThirdpartyAuthenticationService: '14553',
    UserAuthorization: '13191',
    UserRegister: '12343',
    AccountsManagementJService: '12715',
    AccountsBizService: '13775'
}

export const ServiceMessageConfig = {
    [ServiceCodeMap.AccountsMessageService]: {
        checkPhoneCode: {
            methodCode: '01',
            requestFailedMessage: DefaultMessageMap.requestFailedType.validate,
            defaultMessage: '请求校验动态码失败，请稍候再试(-1000)'
        },
        sendMessageByPhoneLogin: {
            methodCode: '02',
            requestFailedMessage: DefaultMessageMap.requestFailedType.send,
            defaultMessage: '网络不稳定，请稍后再试(-1000)'
        }
    },
    [ServiceCodeMap.PassportService]: {
        thirdPartyLogin: {
            methodCode: '01',
            requestFailedMessage: DefaultMessageMap.requestFailedType.login,
            defaultMessage: '登录失败，请重试(-1000)'
        },
        userLogin: {
            methodCode: '02',
            requestFailedMessage: DefaultMessageMap.requestFailedType.login,
            defaultMessage: '登录失败，请重试(-1000)'
        }
    },
    [ServiceCodeMap.ThirdpartyAuthenticationService]: {
        wechatLogin: {
            methodCode: '01',
            requestFailedMessage: DefaultMessageMap.requestFailedType.login,
            defaultMessage: '请求携程wechatLogin失败，请稍候再试(-1000)'
        },
        authenticate: {
            methodCode: '02',
            requestFailedMessage: DefaultMessageMap.requestFailedType.authenticate,
            defaultMessage: '请求微信用户信息授权失败，请稍候再试(-1000)'
        },
        mobileAuthenticate: {
            methodCode: '03',
            requestFailedMessage: DefaultMessageMap.requestFailedType.authenticate,
            defaultMessage: '请求微信手机授权失败，请稍候再试(-1000)'
        }
    },
    [ServiceCodeMap.UserAuthorization]: {
        getAccountInfoByToken: {
            methodCode: '01',
            requestFailedMessage: DefaultMessageMap.requestFailedType.request,
            defaultMessage: '请求第三方Token获取UserInfo失败，请稍候再试(-1000)'
        },
        getUidByMobileToken: {
            methodCode: '02',
            requestFailedMessage: DefaultMessageMap.requestFailedType.request,
            defaultMessage: '请求手机Token获取Uid失败，请稍候再试(-1000)'
        }
    },
    [ServiceCodeMap.UserRegister]: {
        userRegisterByToken: {
            methodCode: '01',
            requestFailedMessage: DefaultMessageMap.requestFailedType.loginOrRegister,
            defaultMessage: '微信绑定手机注册失败，请稍候再试(-1000)'
        }
    },
    [ServiceCodeMap.AccountsManagementJService]: {
        thirdBindByMobileToken: {
            methodCode: '01',
            requestFailedMessage: DefaultMessageMap.requestFailedType.bind,
            defaultMessage: '请求微信第三方绑定失败，请稍候再试(-1000)'
        }
    },
    [ServiceCodeMap.AccountsBizService]: {
        thirdPartyLogin: {
            methodCode: '01',
            requestFailedMessage: DefaultMessageMap.requestFailedType.loginOrRegister,
            defaultMessage: '请求微信第三方注册并登录失败，请稍候再试(-1000)'
        }
    }
}

// 将restapi/soa2/10098/GetOrderWithBM.json ->  10098 GetOrderWithBM
export const soa2UrlReg = /soa2.*\/(\d+).*\/([^?.]*)(\?|\.)?/;
