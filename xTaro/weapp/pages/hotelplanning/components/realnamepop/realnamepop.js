import { cwx } from '../../../../cwx/cwx';

Component({
    properties: {
        enable: {
            type: Boolean,
            value: false
        },
        message: { // 文案
            type: String,
            value: ''
        },
        coupons: { // 发券弹窗一键领取
            type: Array,
            value: []
        },
        promotionID: { // 领券banner单张券实名认证领取
            type: String,
            value: ''
        },
        skey: { // 领券订
            type: String,
            value: ''
        }
    },
    data: {},
    methods: {
        close() {
            this.triggerEvent('closeRealName');
        },
        toAuthRealName() {
            const currentPage = cwx.getCurrentPage() || {};
            // 领券订实名认证确认
            const realNameData = {
                pageSource: 'ctripwechatmini_hoteldianping_realname',
                isNavBack: 'true'
            };
            const that = this;
            const { skey = '', promotionID = '' } = that.data;
            const rulePromotionID = promotionID ? parseInt(promotionID) : '';
            currentPage.navigateTo && currentPage.navigateTo({
                url: '/pages/wallet/setrealname/index',
                data: realNameData,
                callback: function (res) {
                    if (res?.realNamed) {
                        // 实名认证成功回调
                        that.triggerEvent('authRealNameCallback', { skey, cancelAuthRealName: false, promotionID: rulePromotionID });
                    }
                }
            });
            this.close();
        },
        cancel() {
            // 取消领券订实名认证, 不领券直接订
            if (this.data.skey) {
                this.triggerEvent('authRealNameCallback', { skey: this.data.skey, cancelAuthRealName: true });
            }
            this.close();
        },
    }
});