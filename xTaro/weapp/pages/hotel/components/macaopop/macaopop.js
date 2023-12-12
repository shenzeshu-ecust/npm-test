import { cwx } from '../../../../cwx/cwx';
import commonrest from '../../common/commonrest';
import macaocoupontrace from '../../common/trace/macaocoupontrace';

Component({
    properties: {
        enable: {
            type: Boolean,
            value: false,
            observer: 'show'
        },
        imgSrc: {
            type: String,
            value: ''
        },
        coupons: {
            type: Array,
            value: []
        },
        fromList: {
            type: Boolean,
            value: false
        }
    },
    data: {
        display: false
    },
    methods: {
        show () {
            const { enable, imgSrc } = this.data;
            if (enable && imgSrc) {
                this.setData({ display: true });
            }
        },
        close () {
            this.setData({ display: false });
        },
        toReceiveCoupon () {
            this.close();
            const currentPage = cwx.getCurrentPage() || {};
            macaocoupontrace.listMacaoPopClick(currentPage, {
                page: currentPage.pageId,
                click_button_type: '1'
            });
            // 一键领取澳门券
            const params = {
                coupons: this.data.coupons
            };
            commonrest.receiveMutilCoupon(params, res => {
                if (res && res.success === 1) {
                    cwx.showToast({ title: '领券成功', icon: 'none', duration: 2000 });
                    // 列表页领取成功刷新优惠券浮层&酒店列表
                    if (this.data.fromList) {
                        this.triggerEvent('updateCouponsAndHotels');
                    }
                } else {
                    if (res && res.resultCode === 53 && res.macaoNeedAuthMsg) {
                        // 实名认证失败，出实名认证弹窗
                        this.triggerEvent('showRealNamePop', { msg: res.macaoNeedAuthMsg, coupons: this.data.coupons });
                    } else {
                        cwx.showToast({ title: '领券失败', icon: 'none', duration: 2000 });
                    }
                }
            });
        },
        cancel () {
            this.close();
            const currentPage = cwx.getCurrentPage() || {};
            macaocoupontrace.listMacaoPopClick(currentPage, {
                page: currentPage.pageId,
                click_button_type: '2'
            });
        },
        /* Empty method, do nothing */
        noop: function () { }
    }
});
