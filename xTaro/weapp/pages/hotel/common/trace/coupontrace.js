import { cwx } from '../../../../cwx/cwx';

export default {
    getCouponSuccess: function (page, key, couponInfo) {
        try {
            const discountType = couponInfo.deductionType === 1 ? '折' : '元';
            const traceObj = {
                couponsid: couponInfo.promotionID,
                couponsname: couponInfo.promotionName,
                couponstype: couponInfo.methodId === 1 ? '立减' : '后返',
                maxdiscount: couponInfo.amount + discountType,
                validdate: couponInfo.disableDays
            };
            if (couponInfo.subtab) {
                traceObj.subtab = couponInfo.subtab;
            }
            page.ubtTrace && page.ubtTrace(key, traceObj);
        } catch (e) {
            // console.error(e);
        }
    },
    // 领取优惠券成功后，触发用户提醒授权弹窗
    authorizeSucess: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(options.key, {
                page: options.pageId
            });
        } catch (e) {
            // console.error(e);
        }
    },
    promotionsLayerShow (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(146403, {
                ...options,
                sourceid: cwx.scene
            });
        } catch (e) {
            // ignore
        }
    },
    promotionsLayerClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(146406, {
                ...options,
                sourceid: cwx.scene
            });
        } catch (e) {
            // ignore
        }
    },
    goToAssistClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(194677, {
                ...options,
                sourceid: cwx.scene
            });
        } catch (e) {
            // ignore
        }
    }
};
