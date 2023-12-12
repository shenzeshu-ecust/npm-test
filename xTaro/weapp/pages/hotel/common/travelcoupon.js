// 超值旅行家
import { cwx } from '../../../cwx/cwx.js';
const buildTravelRules = (instruction = '') => {
    return instruction.split('<br/>').map(item => {
        const rule = item?.replaceAll('｜', '|')?.split('|') ?? [];
        return ({
            title: rule.length > 1 ? rule[0] : '',
            desc: rule.length > 1 ? rule[1] : rule[0]
        });
    });
};
const buildTravelCouponItems = (coupons = []) => {
    return coupons.map((coupon) => {
        // type: 1-优惠券 2-权益
        const isCoupon = coupon.type === 1;
        return ({
            classifier: isCoupon ? '张' : '次',
            name: isCoupon ? coupon.discountValue : '',
            discountValueSuffix: isCoupon ? coupon.discountValueSuffix : coupon.name?.substring(0, 6),
            useCondition: coupon.useCondition,
            quantity: coupon.quantity,
            description: coupon.description
        });
    });
};
const getTravelCoupons = (superTravellerInfos = [], ubtData) => {
    const tPage = cwx.getCurrentPage();
    return superTravellerInfos.map(item => {
        return ({
            name: item.name ?? '',
            desc: item.desc ?? '',
            id: item.id ?? '',
            popDesc: item.popDesc ?? '',
            selected: Boolean(item.selected),
            items: buildTravelCouponItems(item.items),
            linePrice: item.linePrice,
            salePrice: item.salePrice,
            useRule: item.useRule?.replaceAll('｜', ',')?.split(',') ?? [],
            instruction: buildTravelRules(item.instruction),
            exposeData: {
                data: {
                    page: tPage.pageId,
                    masterhotelid: ubtData.hotelId,
                    package_type: item.name,
                    isbubble: item.popDesc ? 'T' : 'F',
                    bubbletext: item.popDesc
                },
                ubtKeyName: ubtData.ubtKey
            }
        });
    });
};
export default {
    getTravelCoupons
};
