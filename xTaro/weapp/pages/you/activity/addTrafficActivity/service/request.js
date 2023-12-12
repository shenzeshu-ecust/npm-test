/*
 * @Auth: hyr
 * @Date: 2022-03-23 16:58:16
 * @LasEditors: 
 * @LastEditTime: 2022-03-24 12:13:44
 * @Description: 
 */
import {
	cwx,
	CPage,
	__global
} from '../../../../../cwx/cwx';
function doBeforeRequest({url, data, success, fail, complete}) {
    cwx.request({
        url,
        data,
        success(res) {
          success(res);
        },
        fail(res) {
            fail && fail(res)
        },
        complete() {
            complete && complete()
        },
    })
}
/**
 * 上传用户头像和昵称
 */
const contentFissionSaveUserInfo = ({ data, cb = () => {}}) => {
    doBeforeRequest({
        url: '/restapi/soa2/16225/contentFissionSaveUserInfo',
        data,
        success: cb,
    });
}

/**
 * 获取首页的接口信息
 */
const getDetailInfo = (data, cb = () => {}) => {
    doBeforeRequest({
        url: '/restapi/soa2/16225/json/getContentFissionCashIndex',
        data,
        success: res => cb(res.data),
    });
}


/**
 * 客态获取主态红包情况 判断助力资格
 */
const contentFissionAssistEntrance = (data, cb = () => {}) => {
    doBeforeRequest({
        url: '/restapi/soa2/16225/json/contentFissionAssistEntrance',
        data,
        success: res => cb(res.data),
    });
}

/**
 * 获取助力信息 助力
 */
const contentFissionAssist = (data, cb = () => {}) => {
    doBeforeRequest({
        url: '/restapi/soa2/16225/json/contentFissionAssist',
        data,
        success: res => cb(res.data),
    });
}

/**
 * 领取携程红包
 */
const contentFissionReceiveAward = (data, cb = () => {}) => {
    doBeforeRequest({
        url: '/restapi/soa2/16225/json/contentFissionReceiveAward',
        data,
        success: res => cb(res.data),
    });
}

//邀请接口，分享好友和生成海报之前调用
const contentFissionInvite = (data, cb = () => {}) => {
    doBeforeRequest({
        url: '/restapi/soa2/16225/json/contentFissionInvite',
        data,
        success: res => cb(res.data),
    });
}

//保存海报
const contentFissionGenerateReport = (data, cb = () => {}) => {
    doBeforeRequest({
        url: '/restapi/soa2/16225/json/contentFissionGenerateReport',
        data,
        success: res => cb(res.data),
    });
}

//获取弹窗信息
const getContentFissionCashDialogInfo = (data, cb = () => {}) => {
    doBeforeRequest({
        url: '/restapi/soa2/16225/json/getContentFissionCashDialogInfo',
        data,
        success: res => cb(res.data),
    });
}

//获取企微群码
const qyGetGroupEntryQrCodeWithUid=(data, cb = () => {})=>{
  doBeforeRequest({
    url: '/restapi/soa2/13218/json/qyGetGroupEntryQrCodeWithUid',
    data,
    success: res => cb(res.data),
});
}



module.exports = {
    contentFissionSaveUserInfo,
    getDetailInfo,// getContentFissionCashIndex
    contentFissionAssistEntrance,
    contentFissionAssist,
    contentFissionReceiveAward,
    contentFissionInvite,
    contentFissionGenerateReport,
    getContentFissionCashDialogInfo,
    qyGetGroupEntryQrCodeWithUid
}
