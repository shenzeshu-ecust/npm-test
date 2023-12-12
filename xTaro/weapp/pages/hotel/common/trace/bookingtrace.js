import {
    cwx
} from '../../../../cwx/cwx.js';

export default {
    trace: function (page, options) {
        try {
            cwx.mkt.getUnion((data) => {
                let aid = '';
                let sid = '';
                let cxlj; let hyqy = false;
                let riskType = '';
                if (data) {
                    aid = data.allianceid || '';
                    sid = data.sid || '';
                }
                const preList = options.data.prepayDiscountList || [];
                if (preList && preList.length) {
                    preList.forEach(item => {
                        if (Number(item.id) === 99999) {
                            hyqy = true;
                        } else if (Number(item.id) !== 99999 && item.id > 0) {
                            cxlj = true;
                        }
                    });
                }
                if (!page.data.created) {
                    riskType = options.data.riskType;
                }
                page.ubtTrace && page.ubtTrace('htl_c_applet_order_load', {
                    city: options.pageData.roomData.hbaseInfo.baseInfo.cityId,
                    hotelid: options.pageData.roomData.hbaseInfo.baseInfo.id,
                    roomid: options.pageData.roomData.info.id,
                    roomprice: options.data['prices.cny'],
                    roomnum: options.pageData.roomNum,
                    checkin: options.pageData.dates.inDay,
                    checkout: options.pageData.dates.outDay,
                    Shadowid: options.pageData.roomData.info.sroominfo.id,
                    refundprice: options.data['cashReturn.amout'] || 0,
                    couponprice: options.data['Coupon.couponReduce'] || 0,
                    ISdfbd: options.data['reservationNotice.reservationNoticeTips'] ? 'T' : 'F',
                    ISkjrk: options.pageData.displayCutpriceIntroduction ? 'T' : 'F',
                    ISjlwa: options.data.orderEncourage || options.data.paymentInfo || options.data.loversBookCheckInspirit ? 'T' : 'F',
                    ISsz: options.data['quickin.flag'] ? 'T' : 'F',
                    ISjfdh: options.data.memberPointsRewardList && options.data.memberPointsRewardList.length ? 'T' : 'F',
                    IScxlj: cxlj ? 'T' : 'F',
                    IShyqy: hyqy ? 'T' : 'F',
                    ISlhxx: options.data.giftDesc ? 'T' : 'F',
                    ISzsjf: options.data.pointReturnForDisplay ? 'T' : 'F',
                    ISfp: options.pageData.invoiceNew ? 'T' : 'F',
                    allianceid: aid,
                    alliancesid: sid,
                    sourceid: cwx.scene,
                    cid: cwx.clientID,
                    riskType,
                    is_recommend_room_show: !!(options.pageData.roomData?.is_recommend_room_show)
                });
            });
        } catch (e) {
            // console.error(e);
        }
    },
    ordersuccess: function (page, orderId, pageData) {
        try {
            // 生成订单埋点开始
            const couponlist = [];
            if (pageData.Coupon.useCoupon) {
                const selectedCoupon = pageData.selectedCoupon;
                const couponStarDate = selectedCoupon.startDate ? new Date(selectedCoupon.startDate) : new Date();
                const validDay = parseInt((new Date(selectedCoupon.endDate).getTime() - couponStarDate.getTime()) / (1000 * 60 * 60 * 24)) + 1 + '天';
                couponlist.push({
                    couponsid: selectedCoupon.id,
                    couponsname: selectedCoupon.title,
                    couponstype: selectedCoupon.amt ? '立减' : '返现',
                    maxdiscount: selectedCoupon.amount > 1 ? `${selectedCoupon.amount}元` : `${selectedCoupon.amount * 10}折`,
                    validdate: validDay
                });
            }
            cwx.mkt.getUnion((data) => {
                if (data) {
                    page.ubtTrace && page.ubtTrace('htlwechat_orddtl_page_load', {
                        cityId: pageData.roomData.hbaseInfo.baseInfo.cityId,
                        hotelId: pageData.roomData.hbaseInfo.baseInfo.id,
                        subtab: pageData.isOversea ? 'oversea' : 'inland',
                        orderid: orderId,
                        aid: data.allianceid,
                        sid: data.sid,
                        couponlist
                    });
                }
            });
        } catch (e) {
            // ignore
        }
    },
    // 延住房间号选填项曝光
    roomNumExposeTrace: function (page) {
        try {
            page.ubtTrace && page.ubtTrace('htlwechat_order_room_num_opt_show', {
                pageId: '10320654893'
            });
        } catch (e) {
            // console.error(e);
        }
    },
    // 延住房间号选填项点击
    roomNumClickTrace: function (page) {
        try {
            page.ubtTrace && page.ubtTrace('htlwechat_order_room_num_opt_click', {
                pageId: '10320654893'
            });
        } catch (e) {
            // console.error(e);
        }
    },
    // 延住房间号选填说明问号点击
    roomNumIntroClickTrace: function (page) {
        try {
            page.ubtTrace && page.ubtTrace('htlwechat_order_roomnum_opt_question_mark_click', {
                pageId: '10320654893'
            });
        } catch (e) {
            // console.error(e);
        }
    },
    timeConsuming (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(195660, options);
        } catch (e) {
            // ignore
        }
    },
    submitnew (page, options) {
        try {
            cwx.mkt.getUnion((data) => {
                let aid = '';
                let sid = '';
                if (data) {
                    aid = data.allianceid || '';
                    sid = data.sid || '';
                }
                page.ubtTrace && page.ubtTrace('o_hotel_wechatapp_order_sumbit', {
                    ...options.traceInfo,
                    allianceid: aid,
                    alliancesid: sid,
                    sourceid: cwx.scene,
                    cid: cwx.clientID,
                    ...(options.isQuickIn ? { riskType: 'T' } : {})
                });
            });
        } catch (e) {
            // console.log(e);
        }
    },
    orderIsSuccess (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(208659, options);
        } catch (e) {
            // ignore
        }
    },
    policyTrace (page, options) {
        try {
            const { indate: checkin, outdate: checkout, hotelid: masterHotelid, roomid: roomId } = options.detailinfo;
            const { hotelSummary = {}, priceInfo = {}, result } = options.bookingData;
            const { dateInfo, quickCheckin, subRoomInfo } = page.data;
            const { id, bed, mealInfo, cancelPolicyInfo = {} } = subRoomInfo || {};
            const traceObj = {
                detailinfo: {
                    checkin,
                    checkout,
                    roomId,
                    bookable: true,
                    masterHotelid,
                    ...page.pageStatus.policyTraceData
                },
                bookinfo: {
                    checkin: dateInfo.checkIn,
                    checkout: dateInfo.checkOut,
                    masterHotelid: hotelSummary.hotelId,
                    roomId: id,
                    cancelPolicy: cancelPolicyInfo.cardTitle,
                    meal: mealInfo?.title,
                    bedType: bed,
                    bookable: result === 0,
                    isQuickPay: !!quickCheckin.isSelected,
                    totalDiscount: priceInfo.priceTags?.reduce((a, b) => ~~a.amount + ~~b.amount, 0),
                    discountList: priceInfo.priceItems?.map(item => ({ amount: item.amount, title: item.title })),
                    payType: priceInfo.guaranteeInfo?.id !== undefined ? 2 : (priceInfo.balanceType === 'PP' ? 0 : 1) // 0: 在线付  1: 到店付  2: 需担保
                },
                page: page.pageId,
                ...options.extraInfo
            };
            page.ubtTrace && page.ubtTrace(208693, traceObj);
        } catch (e) {
            // ignore
        }
    },
    cancelPolicyShow (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227569, options);
        } catch (e) {
            // ignore
        }
    },
    bottomPriceBarShow (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227573, options);
        } catch (e) {
            // ignore
        }
    },
    priceDetailClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227572, options);
        } catch (e) {
            // ignore
        }
    },
    roomLayerClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227574, options);
        } catch (e) {
            // ignore
        }
    },
    noticeLayerClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227575, options);
        } catch (e) {
            // ignore
        }
    },
    nameInputClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227576, options);
        } catch (e) {
            // ignore
        }
    },
    /**
     * 用户输入的手机号
     * @param options - 需要埋点的字段
     */
    phoneNumberClick (options) {
        try {
            const page = cwx.getCurrentPage();
            page.ubtDevTrace && page.ubtDevTrace('htl_c_applet_book_phone_click', {
                page: options.pageId,
                current_phone_number: '用户当前输入的手机号' + options.currentNumber,
                origin_phone_number: '可订下发的手机号' + options.originNumber
            });
        } catch (e) {
            // ignore
        }
    },
    arrivalLayerClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227577, options);
        } catch (e) {
            // ignore
        }
    },
    travelCouponClick (options) {
        try {
            const page = cwx.getCurrentPage();
            page.ubtTrace && page.ubtTrace('htl_c_applet_ord_promotion_tripbutler_click', options);
        } catch (e) {
            // ignore
        }
    },
    // 挽留弹窗点击埋点
    retainPopClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('htl_c_applet_fillorder_DetainmentWindow_click', options);
        } catch (e) {
            // ignore
        }
    }
};
