import { cwx, __global } from '../cwx.js';
import ubt from './cwx.sendUbtByPage';

const CFG = {
    // url
    GET_USER_SOA_URL: '/restapi/soa2/11838/getUserCommunityInfo',
    SAVE_USER_SOA_URL: '/restapi/soa2/11838/saveUserInfo',
    // trace_cwx_require_user_pic
    DEV_TRACE_CODE: '188164',
    // 188256
    METRIC_CODE: 'metric_cwx_require_user_pic',
    // getUserProfile reason,
    REASON: '同步ctrip小程序昵称头像',
    // scene
    API_CALL: 'api.call',
    SOA_GET: 'getUserCommunityInfo',
    SOA_SAVE: 'saveUserInfo',
    WECHAT_GET: 'adaptGetUserInfo',
    // status
    SUCCESS: 'success',
    FAIL: 'fail',
    INFO: 'info',
    // error code
    CTRIP_ERROR_NICK_NAME: -102,// 昵称非法字符
    NICK_NAME_EXISTS: -103, // 保存昵称重复
    // error info
    NO_AUTH: { message: '未登录', code: -100 },
    SVC_ERROR: { message: '服务错误', code: -101 },
    EMPTY_USER: { message: '空数据', code: -102 }
}

const logDevTrace = (info) => {
    if (__global.env === 'fat') {
        console.log('%c[DevTrace %s]', 'color:forestgreen;font-size:2rem;', CFG.DEV_TRACE_CODE, info);
    }
    try {
        ubt.ubtDevTrace(CFG.DEV_TRACE_CODE, info || {});
    } catch (e) {
        console.error('logDevTrace failed', e);
    }
};

const logMetric = (tags, value = 1) => {
    if (__global.env === 'fat') {
        console.log('%c[Metric %s]', 'color:palevioletred;font-size:2rem;', CFG.METRIC_CODE, tags, value);
    }
    try {
        ubt.ubtMetric({
            name: CFG.METRIC_CODE,
            tag: tags, //自定义Tag
            value
        });
    } catch (e) {
        console.error('logMetric failed', e);
    }
}

/**
 * [兼容适配getUserInfo](https://developers.weixin.qq.com/community/develop/doc/000cacfa20ce88df04cb468bc52801)
 * 优先使用wx.getUserProfile获取
 */
const getUserInfoPromise = () => new Promise((resolve, reject) => {
    const onSuccess = (result) => resolve(result);
    const onFail = (error) => reject(error);
    if (wx.getUserProfile) {
        wx.getUserProfile({ desc: CFG.REASON, success: onSuccess, fail: onFail });
    } else {
        // @2021-4-13后wx.getUserInfo获取头像,昵称为匿名数据
        wx.getUserInfo({ success: onSuccess, fail: onFail });
    }
});

const soaRequest = (
    url, param
) => new Promise((resolve, reject) => cwx.request({
    method: 'post', url, data: param,
    success: (response) => resolve(response.data),
    fail: (error) => reject(error)
}));

async function getCtripUserInfo(bizType) {
    const param = {
        parameterList: [
            { "key": "biztype", "value": bizType },
            { "key": "self", "value": "1" }
        ]
    };
    const response = await soaRequest(CFG.GET_USER_SOA_URL, param);
    if (
        response
        && Array.isArray(response.userCommunityInfoList)
        && response.userCommunityInfoList.length > 0
    ) {
        const {
            nickName,
            isDefaultSystemPhoto,
            avatarPictureURL: avatarUrl
        } = response.userCommunityInfoList[0];
        return {
            nickName: nickName || '',
            avatarUrl: avatarUrl || '',
            isDefaultPic: '1' === isDefaultSystemPhoto
        };
    }
    throw CFG.EMPTY_USER;
}

async function mergeBySave(bizType, ctripUserInfo, wechatUserInfo) {
    let merged = {
        nickName: ctripUserInfo.nickName,
        avatarUrl: ctripUserInfo.avatarUrl
    };
    const param = {
        thisUserInfo: { nickName: null, avatarPictureURL: null },
        parameterList: [{ "key": "biztype", "value": bizType }]
    };
    if (!merged.nickName) {
        merged.nickName = wechatUserInfo.nickName;
        param.thisUserInfo.nickName = wechatUserInfo.nickName;
    }
    if (ctripUserInfo.isDefaultPic) {
        merged.avatarUrl = wechatUserInfo.avatarUrl;
        param.thisUserInfo.avatarPictureURL = wechatUserInfo.avatarUrl;
    }
    const saveResponse = await soaRequest(CFG.SAVE_USER_SOA_URL, param);
    if (!saveResponse || !saveResponse.result) {
        throw CFG.SVC_ERROR;
    }
    const { resultCode } = saveResponse.result;
    logDevTrace({
        bizType,
        scene: CFG.SOA_SAVE,
        status: CFG.INFO,
        message: `resultCode=${resultCode},merged=${JSON.stringify(merged)}`
    });
    if ([CFG.NICK_NAME_EXISTS, CFG.CTRIP_ERROR_NICK_NAME].indexOf(resultCode) > -1) {
        // [审核中]或[昵称失败],还原历史昵称
        merged.nickName = ctripUserInfo.nickName;
    }
    return merged;
}

/**
 * 【微信组件获取头像+昵称】
 *  Promise\<NickNameWithPicUrl\>
 * @param {string} bizType default='BASE'
 * @returns `{ nickName, avatarUrl }`
 */
export default async function requireUserPic(bizType = 'BASE') {
    logMetric({ bizType, scene: CFG.API_CALL });
    // STEP:0-CHECK_LOGIN
    if (!cwx.user.isLogin()) throw CFG.NO_AUTH;
    // STEP:1-SOA_GET
    let response = null;
    try {
        response = await getCtripUserInfo(bizType);
        logDevTrace({
            bizType,
            scene: CFG.SOA_GET,
            status: CFG.SUCCESS,
            message: JSON.stringify(response)
        });
    } catch (error) {
        logDevTrace({
            bizType,
            scene: CFG.SOA_GET,
            status: CFG.FAIL,
            message: error.message
        });
        // 区分是否 已知错误
        if (error.code) throw error;
        else throw CFG.SVC_ERROR;
    }
    // 判断是否 默认头像或者空昵称 nickName in [null/undefined/""/0/false]
    if (!response.isDefaultPic && response.nickName) {
        delete response.isDefaultPic;
        return response;
    }

    // STEP:2-WECHAT_GET
    let wechatUserInfo = {};
    try {
        const wechatResponse = await getUserInfoPromise();
        if (wechatResponse && wechatResponse.userInfo) {
            const { nickName, avatarUrl } = wechatResponse.userInfo;
            wechatUserInfo = { nickName, avatarUrl };
        } else throw CFG.EMPTY_USER;
    } catch (error) {
        logDevTrace({
            bizType,
            scene: CFG.WECHAT_GET,
            status: CFG.FAIL,
            message: error.message || error.errMsg || 'N/A'
        });
        delete response.isDefaultPic;
        return response;
    }

    // STEP:3-SOA_SAVE
    try {
        const merged = await mergeBySave(bizType, response, wechatUserInfo);
        logDevTrace({
            bizType,
            scene: CFG.SOA_SAVE,
            status: CFG.SUCCESS,
            message: JSON.stringify(merged)
        });
        return merged;
    } catch (error) {
        logDevTrace({
            bizType,
            scene: CFG.SOA_SAVE,
            status: CFG.FAIL,
            message: error.message
        });
        delete response.isDefaultPic;
        return response;
    }
};