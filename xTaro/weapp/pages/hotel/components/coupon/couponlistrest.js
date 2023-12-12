import model from '../../common/utils/model';
import util from '../../common/utils/util';
import hrequest from '../../common/hpage/request';

const convertResponse = (res) => {
    if (!res.data) {
        return;
    }

    const { coupons, loginType, type, remarkForLayer, couponPrompt, remarks, isLogin, boostCoupon, discardBoostCoupon } = res.data;
    if (util.isEmpty(coupons)) {
        if (!util.isEmpty(boostCoupon)) {
            return {
                boostCoupon
            };
        }
        return;
    }

    if (!coupons.length) {
        if (couponPrompt !== '') {
            return {
                couponPrompt
            };
        } else {
            return;
        }
    }

    let owned = true;
    coupons.forEach((c) => {
        if (!c.owned) {
            owned = false;
        }
    });

    return {
        loginType,
        coupons,
        owned,
        isLogin,
        remarkForLayer,
        couponPrompt,
        remarks,
        type,
        boostCoupon,
        discardBoostCoupon
    };
};

export default {
    doRequest: function (params, callback, errCallback) {
        if (!params) return;

        const userCouponGetInfo = params.userCouponGetInfo || {};
        const pageFrom = userCouponGetInfo.pageFrom || 0;
        const isFirstPage = params.isFirstPage || 0;
        const requestData = {
            isOversea: params.isOversea || 0,
            userCouponGetInfo,
            isFirstPage
        };
        params.userCityId && (requestData.userCityId = params.userCityId);

        if (params.isfromscan) {
            requestData.head = {
                extension: [
                    {
                        name: 'sourceFrom',
                        value: 'fromscan'
                    }
                ]
            };
        }

        hrequest.hrequest({
            url: model.serveUrl('couponlist'),
            checkAuth: true,
            data: requestData,
            success: function (res) {
                if (!util.successSoaResponse(res)) {
                    errCallback && errCallback();
                }

                let result = res.data;

                // 查询页不走过滤逻辑
                if (pageFrom !== 3) {
                    result = convertResponse(res);
                }

                if (result) {
                    callback(result);
                } else {
                    errCallback && errCallback(res);
                }
            }
        });
    }
};
