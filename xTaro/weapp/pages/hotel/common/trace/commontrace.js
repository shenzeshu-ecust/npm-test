import { cwx } from "../../../../cwx/cwx";

export default {
    /**
     * 隐私弹窗点击埋点
     */
    clickPrivacyDialog (options) {
        const page = cwx.getCurrentPage();
        try {
            const privacyStorageKey = 'PERSONAL_INFO_AUTHORIZATION_CACHE';
            const USER_REJECT = '0'; // 用户不同意授权
            const cacheStatus = wx.getStorageSync(privacyStorageKey);
            const lastTimeReject = cacheStatus === USER_REJECT;
            page.ubtDevTrace && page.ubtDevTrace('htl_c_applet_privacy_authorize', {
                cid: cwx.clientID || '',
                isAgree: options.agree,
                cacheAgree: cacheStatus ? `上次关闭了弹窗: ${lastTimeReject}` : '无缓存，第一次出现隐私弹窗',
                page: page.pageId
            });
        } catch (e) {

        }
    }
}
