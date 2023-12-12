import { cwx } from '../../../../cwx/cwx.js';
import commonrest from '../../common/commonrest';
import commonfunc from '../../common/commonfunc';
import C from '../../common/C';
import storage from '../../common/utils/storage';

const imgConf = {
    type1: 'https://pages.c-ctrip.com/hotels/wechat/img/member/newer-pop.png',
    type2: 'https://pages.c-ctrip.com/hotels/wechat/img/member/newer-diamond-pop.png'
};

Component({
    properties: {
        enable: {
            type: Boolean,
            value: false,
            observer: 'show'
        },
        newGuestType: {
            type: Number,
            value: 0
        },
        from: {
            type: String,
            value: ''
        }
    },
    data: {
        display: false,
        imgSrc: '',
        showNewerImage: false,
        isAbTest: commonfunc.equalABTestingVer(C.ABTESTING_NEWER_DIALOG)
    },
    attached: function () {
        const { from, isAbTest } = this.data;
        if (from === 'inquire' || isAbTest) { // ab实验
            commonrest.getNewerGift({ isOversea: false }, this.showNewerDialog.bind(this));
        }
    },
    methods: {
        show () {
            const { enable, newGuestType } = this.data;
            const imgSrc = imgConf[`type${newGuestType}`];
            if (enable && imgSrc) {
                this.setData({
                    display: true,
                    imgSrc
                });
            }
        },
        close (e) {
            this.setData({ display: false });
        },
        toSubscribe (e) {
            const tmpIds = ['PAbAFY7UFJ7sqvcWi7lxVE4pzCWMpFZJrl7CMuYDb4Q'];
            const subscribeSuccess = () => {
                wx.showToast({ title: '订阅成功', icon: 'none' });
                this.setData({ display: false });
            };
            const subscribeFail = () => {
                wx.showToast({ title: '订阅失败', icon: 'none' });
                this.setData({ display: false });
            };

            try {
                cwx.mkt.subscribeMsg(tmpIds, (res = {}) => {
                    res.templateSubscribeStateInfos ? subscribeSuccess() : subscribeFail();
                }, err => {
                    subscribeFail();
                });
            } catch (error) {
                subscribeFail();
            }
        },
        showNewerDialog (res) {
            if (!res.isShow) return;
            const { from, isAbTest } = this.data;
            // inquire页需展示新客好礼banner
            from === 'inquire' && this.triggerEvent('getNewerCouponInfo', res);
            // 弹窗部分
            const { coupons = [], rewards = [] } = res;
            const noCoupon = !coupons.length && !rewards.length;
            const hasPopped = storage.getStorage(C.STORAGE_NEWER_RIGHTS_DIALOG);
            if (noCoupon || hasPopped || !isAbTest) return;
            // 无缓存&中实验&可领券时出弹窗
            const availableCoupon = coupons.find(coupon => coupon.receivable);
            const showNewerImage = !!availableCoupon;
            this.setData({
                coupons,
                showNewerImage
            });
            showNewerImage && storage.setStorage(C.STORAGE_NEWER_RIGHTS_DIALOG, '1', 24);
        },
        closeNewerPop () {
            this.setData({
                showNewerImage: false
            });
        },
        receiveMultiCoupons () {
            const { coupons } = this.data;
            const params = {
                coupons: coupons.map(it => ({
                    promotionId: +it.id
                }))
            };
            commonrest.receiveMutilCoupon(params, res => {
                res?.success === 1 && cwx.showToast({ title: '领券成功', icon: 'none', duration: 2000 });
                this.closeNewerPop();
            }, () => {
                this.closeNewerPop();
            });
        }
    }

});
