/*
* 优惠券data reset
*/
import travelCoupon from './travelcoupon';

const findExtensionsValue = (extensions = [], key) => {
    if (!extensions?.length) return '';
    return extensions?.find(item => item.key === key)?.value || '';
};

// 返回助力券的领取状态icon list
const buildAssistIcons = (extensions = []) => {
    if (!extensions.length) return '';
    const assistedNum = parseInt(findExtensionsValue(extensions, 'assistedNum') || 0);
    const needAssistNum = parseInt(findExtensionsValue(extensions, 'needAssistNum') || 0);
    return [...Array(assistedNum).fill('https://pages.c-ctrip.com/hotels/wechat/img/icons/hook-icon.png'), ...Array(needAssistNum).fill('https://pages.c-ctrip.com/hotels/wechat/img/icons/point-icon.png')];
};

// 返回不同场景的优惠券button文案
const getCouponButtonText = (HotelCoupon) => {
    let bottonText = '立即领取';
    const SHARE = 10; // 助力券
    const FOLLOW = 11; // 关注并领券
    const { couponCategory } = HotelCoupon;
    // couponCategory - 券类别,具体含义如下:
    // 1:新客券; 2:闪住券; 3:个性化券; 4:途家优选券；5:春节特惠券; 6:流失召回券; 7:定向券; 9:钟点房券; 10:助力券; 11:关注领券; 12:实名认证优惠券; 13=意向券/酒店挽留券; 14=城市一致; 15=省份一致
    switch (couponCategory) {
    case SHARE: // 助力券
        bottonText = '分享领券';
        break;
    case FOLLOW: // 关注并领券, 文本从extensions中取
        bottonText = findExtensionsValue(HotelCoupon.extensions, 'buttonText');
        break;
    default:
        break;
    }
    return bottonText;
};

// 优惠券副标题 - 满减文案拼接
const parseStaircaseCouponBrief = (coupon, position) => {
    if (!coupon || !coupon.deductions || !coupon.deductions[position]) {
        return '';
    }

    const deductionModel = coupon.deductions[position];
    const { startAmount, deductionType, deductionAmountText, deductionAmount } = deductionModel;
    const couponDesc = coupon.couponType === 1 ? '减' : '返';
    const deductionTypeText = deductionType === 1 ? `打${deductionAmountText}折` : `${couponDesc}${deductionAmount}`;

    return `满${startAmount}${deductionTypeText}`;
};

// 优惠券副标题二行文案，阶梯优惠券场景加"|"分割
const getBrief = (coupon) => {
    let briefStr = '';
    const { deductions = [] } = coupon;
    if (isStaircaseCoupon(coupon)) {
        for (let i = 0; i < deductions?.length; i++) {
            if (i !== 0) {
                briefStr += ' | ';
            }
            briefStr += parseStaircaseCouponBrief(coupon, i);
        }
    }
    return briefStr;
};

// 判断是否为阶梯优惠
const isStaircaseCoupon = (coupon) => {
    const { deductions = [] } = coupon;

    if (deductions?.length === 0) {
        return false;
    }
    return !(deductions?.length === 1 && deductions[0].startAmount === '0');
};

export default {
    // 优惠券浮层title & 返现模块是否展示
    getBannerFloatData: (bannerFloating) => {
        return {
            cutPriceHotel: bannerFloating?.cutPriceHotel || false,
            floatingTopText: bannerFloating?.floatingTopText || '优惠详情'
        };
    },
    // 前端重新整合coupon data
    gethotelCouponsData: (bannerFloating, extraInfo) => {
        const originCoupon = bannerFloating?.bannerList?.find((item) => {
            return item.type === 'COUPON';
        });

        const hotelCoupons = originCoupon?.hotelCouponsFlow?.hotelCoupons || [];
        const superTravellerInfos = originCoupon?.hotelCouponsFlow?.superTravellerInfos || [];
        if (!hotelCoupons.length && !superTravellerInfos.length) return null;

        const coupons = [];
        hotelCoupons.forEach(c => {
            const coupon = {
                couponCategory: c.couponCategory,
                couponStrategyId: c.couponStrategyId,
                couponName: c.couponName,
                shortRemark: c.shortRemark,
                deductionAmountLimitDesc: c.deductionAmountLimitDesc,
                extraShortRemark: getBrief(c),
                deductions: c.deductions,
                couponDesc: c.couponDesc,
                state: c.state,
                btnText: getCouponButtonText(c),
                assistIcons: buildAssistIcons(c.extensions, 'assistedNum'),
                assistJumpUrl: findExtensionsValue(c.extensions, 'assistJumpUrl'),
                activityId: findExtensionsValue(c.extensions, 'activityId'),
                assistActivityId: findExtensionsValue(c.extensions, 'assistActivityId')
            };
            coupons.push(coupon);
        });

        return {
            modelName: originCoupon.modelName || '优惠券',
            btnText: '领取',
            hotelCoupons: coupons,
            travelCoupons: travelCoupon.getTravelCoupons(superTravellerInfos, extraInfo)
        };
    },
    // 权益模块数据
    getRewardData: (bannerFloating) => {
        const rewardModule = bannerFloating?.bannerList?.find((item) => {
            return item.type === 'REWARD';
        });
        if (!rewardModule) return null;

        // eslint-disable-next-line array-callback-return
        rewardModule?.options?.map((item) => {
            if (item.key === 'RewardTipDesc') {
                rewardModule.rewardTipDesc = item.value;
            }
            if (item.key === 'RewardTipIcon') {
                rewardModule.rewardTipIcon = item.value;
            }
        });

        return rewardModule;
    }
};
