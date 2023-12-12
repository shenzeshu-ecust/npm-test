export default {
    // 头部
    showOrderId (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(224586, options);
        } catch (e) {}
    },
    // 订单状态
    showOrderStatus (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(224588, options);
        } catch (e) {}
    },
    clickOrderStatus (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(224587, options);
        } catch (e) {}
    },
    // 动态卡片
    showOrderCard (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(224590, options);
        } catch (e) {}
    },
    clickOrderCard (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(224589, options);
        } catch (e) {}
    },
    // 底部操作区
    showOperateBtn (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(224592, options);
        } catch (e) {}
    },
    clickOperateBtn (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(224591, options);
        } catch (e) {}
    },
    // 客服入口
    showCustomerEntrance (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(224616, options);
        } catch (e) {}
    },
    clickCustomerService (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(224615, options);
        } catch (e) {}
    },
    // Nps
    showNps (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(224614, options);
        } catch (e) {}
    },
    clickNps (page, options) {
        try {
            const { pageId, type, score } = options;
            const btnTypeMap = {
                1: 'nps分数: ' + score,
                2: 'nps提交',
                3: 'nps弹窗-补充提交'
            };
            page.ubtTrace && page.ubtTrace(224613, {
                page: pageId,
                buttonType: btnTypeMap[type]
            });
        } catch (e) {}
    },
    // 预订信息
    showReservateInfo (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(224612, options);
        } catch (e) {}
    },
    clickReservateInfo (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(224611, options);
        } catch (e) {}
    },
    // 已购及赠送
    showGiftInfo (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(224610, options);
        } catch (e) {}
    },
    clickGiftInfo (page, options) {
        try {
            const { pageId, type } = options;
            const btnTypeMap = {
                1: '套餐信息',
                2: '展开按钮',
                3: '收起按钮'
            };
            page.ubtTrace && page.ubtTrace(224609, {
                page: pageId,
                buttonType: btnTypeMap[type]
            });
        } catch (e) {}
    },
    // 套餐另含餐食
    showMealSuite (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(224606, options);
        } catch (e) {}
    },
    clickMealSuite (page, options) {
        try {
            const { pageId, type } = options;
            const btnTypeMap = {
                1: '套餐信息',
                2: '展开按钮',
                3: '收起按钮'
            };
            page.ubtTrace && page.ubtTrace(224605, {
                page: pageId,
                buttonType: btnTypeMap[type]
            });
        } catch (e) {}
    },
    // 房型餐食
    showMealInfo (page, options) {
        try {
            const { hasToggleBtn, title = '' } = options;
            const firstText = title.indexOf('无') ? '无餐食' : '有餐食';
            const lastText = hasToggleBtn ? '-展开按钮' : '';
            page.ubtTrace && page.ubtTrace(224604, {
                page: page.pageId,
                buttonType: firstText + lastText
            });
        } catch (e) {}
    },
    clickMealInfo (page, options) {
        try {
            const { showMore, title = '', pageId } = options;
            const firstText = title.indexOf('无') ? '无餐食' : '有餐食';
            const lastText = showMore ? '-展开按钮' : '收起按钮';
            page.ubtTrace && page.ubtTrace(224603, {
                page: pageId,
                buttonType: firstText + lastText
            });
        } catch (e) {}
    },
    // 预订信息
    showCheckinInfo (page, options) {
        try {
            const { pageId } = options;
            page.ubtTrace && page.ubtTrace(224602, {
                page: pageId,
                buttonType: '房型信息',
                buttonText: ''
            });
        } catch (e) {}
    },
    clickCheckinInfo (page, options) {
        try {
            const { pageId, type, name } = options;
            page.ubtTrace && page.ubtTrace(224600, {
                page: pageId,
                buttonType: type === 1 ? '房型信息' : '儿童加床政策',
                buttonText: type === 1 ? name : '儿童·加床政策'
            });
        } catch (e) {}
    },
    // 酒店卡片
    showHotelCard (page, options) {
        try {
            const { pageId, hotelInfo = {}, coordinate, hotelTelInfo } = options;
            const { name, address } = hotelInfo;
            const combineString = (stringArr) => {
                return stringArr.reduce((a, b) => b ? a + ',' + b : a, '');
            };
            let btnType = '';
            name && (btnType += '酒店名');
            address && (btnType += ',地址');
            hotelTelInfo?.call && (btnType += ',联系酒店');
            coordinate && (btnType += ',地图/导航');
            page.ubtTrace && page.ubtTrace(224599, {
                page: pageId,
                buttonType: btnType,
                buttonText: combineString([name, address])
            });
        } catch (e) {}
    },
    clickHotelCard (page, options) {
        try {
            const { pageId, type, name = '' } = options;
            const btnTypeMap = {
                1: '酒店名',
                2: '地址',
                3: '联系酒店',
                4: '地图/导航'
            };
            page.ubtTrace && page.ubtTrace(224598, {
                page: pageId,
                buttonType: btnTypeMap[type],
                buttonText: name
            });
        } catch (e) {}
    },
    // 价格区域
    showPriceArea (page, options) {
        try {
            const { pageId, reservationOrder, priceSummaryList, bargain, cancelInfo } = options;
            let btnType = '';
            reservationOrder !== 1 && priceSummaryList?.length && (btnType += '每晚明细');
            cancelInfo?.detail && (btnType += ',取消政策');
            bargain?.showBargainBlock && bargain.topBtnText && (btnType += ',砍价/助力返现');
            page.ubtTrace && page.ubtTrace(224597, {
                page: pageId,
                buttonType: btnType
            });
        } catch (e) {}
    },
    clickPriceArea (page, options) {
        try {
            const { pageId, type } = options;
            const typeMap = {
                1: '每晚明细',
                2: '取消政策',
                3: '砍价/助力返现'
            };
            page.ubtTrace && page.ubtTrace(224596, {
                page: pageId,
                buttonType: typeMap[type]
            });
        } catch (e) {}
    },
    timeConsuming (page, options = {}) {
        try {
            page.ubtTrace && page.ubtTrace(195660, options);
        } catch (e) {
            // ignore
        }
    },
    cutpriceshow: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('htlwechat_orddtl_cutprice_show', {
                subtab: options.region,
                orderid: options.orderid,
                orderstatus: options.status,
                cutpricestatus: '待砍'
            });
        } catch (e) {
            // console.error(e);
        }
    },
    clicksmzfunction: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('HTL_c_wechat_orddtl_function_click', {
                masterhotelid: options.hotelId,
                functionId: options.id
            });
        } catch (e) {

        }
    },
    showpublic: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(146411, {
                subtab: options.subtab
            });
        } catch (e) {
            // ignore
        }
    },
    clickpublic: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(146413, {
                subtab: options.subtab
            });
        } catch (e) {
            // ignore
        }
    },
    imTrace: function (page, name) {
        const options = {
            subtab: page.pageStatus.region,
            orderid: page.data.orderId,
            orderstatus: page.data.status && page.data.status.title
        };
        const traceKey = 'htl_c_applet_orddtl_im_' + name; // askhotel: 联系酒店图标,   askctrip: 客服浮标,   phonenumber: 浮层店家电话,  copytel: 客服浮层复制号码,    callphone: 客服浮层拨打点击号码
        try {
            page.ubtTrace && page.ubtTrace(traceKey, options);
        } catch (e) {
            // ignore
        }
    },
    clickOptionCancelBtn: function (page, options) { // 协商取消点击埋点
        try {
            page.ubtTrace && page.ubtTrace('htl_c_applet_orderdetail_actionbutton_click', {
                actionType: options.actionType, // 1 表示协商取消
                orderid: options.orderid
            });
        } catch (e) {
            // ignore
        }
    },
    showOptionCancelBtn: function (page, options) { // 协商取消曝光埋点
        try {
            page.ubtTrace && page.ubtTrace('tl_c_applet_orderdetail_actionbutton_show', {
                actionType: options.actionType, // 1 表示协商取消
                orderid: options.orderid
            });
        } catch (e) {
            // ignore
        }
    },
    clickCheckoutEarlyBtn: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(204093, {
                platform: options.platform,
                pageid: options.pageid
            });
        } catch (e) {
            // ignore
        }
    },
    showCheckoutEarlyBtn: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(204091, {
                platform: options.platform,
                pageid: options.pageid
            });
        } catch (e) {
            // ignore
        }
    },
    // 姓名鉴权弹窗曝光
    showCheckNameValid: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(204781, {
                pageid: options.pageid
            });
        } catch (e) {
            // ignore
        }
    },
    // 点击姓名鉴权弹窗，type: 1.点击提交；2.点击关闭
    clickCheckNameLayer: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(204782, {
                operation_type: options.type,
                page: options.pageid
            });
        } catch (e) {
            // ignore
        }
    },
    // 姓名鉴权弹窗失败toast，曝光
    showValidFailToast: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(204783, {
                page: options.pageid
            });
        } catch (e) {
            // ignore
        }
    },
    // 取消政策按钮点击埋点
    clickCancelLayer: function (page, isEasyCancel) {
        try {
            page.ubtTrace && page.ubtTrace(211653, {
                page: page.pageId,
                card_type: isEasyCancel ? 1 : 2 // 1: 安心取消；2：正常的取消政策
            });
        } catch (e) {
            // ignore
        }
    },
    // 取消政策弹窗曝光
    showLadderDetail: function (page) {
        try {
            page.ubtTrace && page.ubtTrace(211654, {
                page: page.pageId
            });
        } catch (e) {
            // ignore
        }
    },

    // 安心取消按钮曝光
    showEasyCancel: function (page) {
        try {
            page.ubtTrace && page.ubtTrace(217691, {
                page: page.pageId
            });
        } catch (e) {
            // ignore
        }
    }
};
