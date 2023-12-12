import { CPage, __global, BusShared } from '../index.js';

CPage({
    customStyle: 'custom',
    data: {
        navbarData: {
            customHome: false,
            customBack: true,
            showCapsule: false,
            showBack: false,
            showColor: false,
            navigationBarColor: '#ffffff',
        },
        couponList: [],
        unUseChecked: false,
    },

    onLoad: function (options) {
        let couponList = BusShared.get(options.couponList);
        let usedCoupon = BusShared.get(options.usedCoupon);
        if (couponList && couponList.length > 0) {
            let mCoupon = [];
            couponList.forEach((item) => {
                let date = new Date(item.couponEndDate.replace(/\-/g, '/'));
                item.couponEndDate = date.format('yyyy-MM-dd hh:mm');
                item.canCheck = item['_unavailable']
                    ? false
                    : item['_aviable'] && item['_canuse'];
                item.unUsedMessage = item['_unavailable']
                    ? item['unavailableReason']
                    : item.alartMessage.join(';');
                item.checked = false;
                if (usedCoupon && usedCoupon.couponCode === item.couponCode) {
                    item.checked = true;
                    mCoupon.push(item);
                }
            });
            this.setData(
                {
                    usedCoupon: mCoupon,
                    couponList,
                },
                () => {
                    BusShared.save('usedCoupon', this.data.usedCoupon);
                }
            );
        }
        if (!usedCoupon) {
            this.onUnUseCoupon();
        }
    },

    onBack: function () {
        this.navigateBack();
        BusShared.save('usedCoupon', this.data.usedCoupon);
    },

    openRemark(e) {
        let { couponList } = this.data;
        let { index } = e.currentTarget.dataset;
        let item = couponList[index];
        if (item.canCheck) {
            if (item.remark.length > 30) {
                couponList[index].showRemark = !couponList[index].showRemark;
                this.setData({
                    couponList,
                });
            }
        } else {
            if (item.unUsedMessage.length > 18) {
                couponList[index].showMessage = !couponList[index].showMessage;
                this.setData({
                    couponList,
                });
            }
        }
    },

    deleteCoupon() {
        let { couponList } = this.data;
        couponList.forEach((item) => {
            item.checked = false;
        });
        this.setData({
            couponList,
        });
    },

    onUnUseCoupon() {
        if (!this.data.unUseChecked) {
            this.deleteCoupon();
            this.setData(
                {
                    usedCoupon: [],
                },
                () => {
                    BusShared.save('usedCoupon', this.data.usedCoupon);
                }
            );
        }
        this.setData({
            unUseChecked: !this.data.unUseChecked,
        });
    },

    onSelectCoupon(e) {
        let { couponList } = this.data;
        let { index } = e.currentTarget.dataset;
        let item = couponList[index];
        if (item.canCheck && !item.checked) {
            this.deleteCoupon();
            this.setData({
                unUseChecked: false,
            });
            couponList[index].checked = !couponList[index].checked;
            let mCoupon = [];
            let couponId = e.currentTarget.dataset.id || '';
            let mSrcList = this.data.couponList || [];
            mSrcList.forEach(function (item) {
                if (couponId === item['couponCode']) {
                    mCoupon.push(item);
                }
            });
            this.setData(
                {
                    usedCoupon: mCoupon,
                    couponList,
                },
                () => {
                    BusShared.save('usedCoupon', this.data.usedCoupon);
                }
            );
        }
    },
});
