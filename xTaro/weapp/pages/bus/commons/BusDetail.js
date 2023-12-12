import { Pservice } from './productservice';
import { getBusTagName } from './utils/getBusTagName';
import { formatSupportPassengerTypes } from './utils/supportPassengerTypes';
import { _, BusShared, Utils } from '../index';

let _DAY1 = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

let packageDataPreFormat = {
    isInurance: function (item = {}) {
        let type = (item.type || '').toLowerCase();
        let extraType = (item.extraMap.packageType || '').toLowerCase();
        return (
            type.indexOf('insurance') >= 0 ||
            extraType.indexOf('insurance') >= 0
        );
    },
    isFiveMin: function (item = {}) {
        let extraType = (item.extraMap.packageType || '').toLowerCase();
        return (
            extraType.indexOf('fivemin') >= 0 ||
            extraType.indexOf('superright') >= 0
        );
    },
    isEasyRefund: function (item = {}) {
        let extraType = (item.extraMap.packageType || '').toLowerCase();
        return extraType.indexOf('easyrefund') >= 0;
    },
    formatXList: function (list, params) {
        let rewardFee = params.rewardFee || 0;
        let xList = (list || []).filter((item) => {
            item.isX = true;
            item.ticketUnitOriginalPrice = params.ticketUnitOriginalPrice;
            item.subTitleTag = (item.subTitleX || '')
                .split('|')
                .filter((item) => item.length);
            item.isInsurance = packageDataPreFormat.isInurance(item);

            // channelColour, channelIcon, channelMainTitle, channelSubTitle

            // item.channelIcon = 'https://pages.c-ctrip.com/bus-images/busapp/rnbus/superMember/superMbLogo.png',
            // item.channelMainTitle = '超级会员';
            // item.channelSubTitle = '超级会员XXX,asdasdadsadasdasdasdasdsadasdasdasdasd,asdasdasdasdX';
            // item.channelColour = '#ff00ff|#00ffff';

            if (item.channelMainTitle) {
                let chnnelColor =
                    item.channelColour || '#FFC003|#FE9202|#FFFFFF';
                let colorArray = chnnelColor.split('|');
                item.channelColorArray = colorArray;
                item.channelLastColor = colorArray.slice(-1).pop();
            }
            if (params.isPresale) {
                item.rewardFee = 0;
            } else {
                item.rewardFee = Number(
                    (item.singleCashBackAmount || 0) + rewardFee
                ).toFixed(1);
            }
            return item.show || item.type == 'seat';
        });
        // if (xList.length > 0) {
        var seatIndex = -1;
        for (let i = 0; i < xList.length; i++) {
            let item = xList[i];
            if (item.type == 'seat') {
                seatIndex = i;
                break;
            }
        }
        if (seatIndex >= 0) {
            //不处理
        } else {
            xList.push({
                ticketUnitOriginalPrice: params.ticketUnitOriginalPrice,
                type: 'seat',
            });
        }
        // }

        return xList;
    },
    fromatSaleList: function (list, travelSaleChannelId) {
        let saleList = (list || []).filter((item) => {
            item.open = item.defaultOpen || item.followingFlag;
            item.isInsurance = packageDataPreFormat.isInurance(item);
            item.isDiscount = item.type === 'discount';
            if (item.isDiscount) {
                item.discount = item.showPrice - item.price;
            }
            item.channelId = travelSaleChannelId;
            return item.show && item.packageCode != '404';
        });
        return saleList;
    },
    formatPackageList: function (list, weaListChannelId) {
        let hasOpen = false;
        let xPackage = {};
        // let hasVirusIns = false;
        let packageList = (list || []).filter((item, index) => {
            if (!hasOpen) {
                item.open = item.defaultOpen;
                item.isInsurance = packageDataPreFormat.isInurance(item);
                hasOpen = item.defaultOpen;
                if (item.open) {
                    xPackage = item;
                }
            } else {
                item.open = false;
            }
            item.channelId = weaListChannelId;
            return item.show && item.packageCode != '404';
        });
        return { xPackage, packageList };
    },

    formatButtonRecommend: function (list, params) {
        let buttonRecommend = [];
        let buttonRecommendInsurance = null;
        let buttonRecommendCoupon3 = null;
        let buttonRecommendFiveMin = null;
        let buttonRecommendEasyRefund = null;
        if (list && list.length > 0) {
            (list || []).forEach((item) => {
                item.subTitleTag = (item.subTitle || '')
                    .split('|')
                    .filter((item) => item.length);
                item.isInsurance = packageDataPreFormat.isInurance(item);
                item.isFiveMin = packageDataPreFormat.isFiveMin(item);
                item.isEasyRefund = packageDataPreFormat.isEasyRefund(item);
                console.log(
                    item.isInsurance,
                    item.isEasyRefund,
                    '  item.isEasyRefund '
                );
                if (item.isInsurance) {
                    buttonRecommendInsurance = item;
                }
                if (item.type == 'coupon3') {
                    buttonRecommendCoupon3 = item;
                }
                if (item.isFiveMin) {
                    buttonRecommendFiveMin = item;
                }
                if (item.isEasyRefund) {
                    buttonRecommendEasyRefund = item;
                }
            });
        }
        console.log(
            buttonRecommendEasyRefund,
            buttonRecommendInsurance,
            '22buttonRecommendEasyRefund'
        );
        return {
            buttonRecommendInsurance,
            buttonRecommendCoupon3,
            buttonRecommendFiveMin,
            buttonRecommendEasyRefund,
        };
    },
};

function getSupplierDetailData(tempFields) {
    return {
        carrierInfo: tempFields.carrierInfo,
        sellerName: tempFields.sellerName
            ? tempFields.sellerName.split(' ')[0]
            : '',
        contact:
            tempFields.sellerName &&
            (tempFields.sellerName.split(' ')[1] || ''),
        businessLicense: tempFields.businessLicense,
    };
}

function getAlternativeTime({ date, time }) {
    if (/^([0-1]{1}\d|2[0-3]):([0-5]\d)$/g.test(time)) {
        let start = '';
        let end = '';
        const timeArr = time.split(':');
        const hour = timeArr[0];
        const minute = timeArr[1];
        if (hour > 0 && hour < 23) {
            start = hour * 1 - 1 < 10 ? `0${hour * 1 - 1}` : hour * 1 - 1;
            end = hour * 1 + 1 < 10 ? `0${hour * 1 + 1}` : hour * 1 + 1;
            // 不要改成全等
        } else if (hour == '23') {
            start = 22;
            end = '00';
            // 不要改成全等
        } else if (hour == 0) {
            start = 23;
            end = '01';
        }
        return {
            alternativeTimes: [
                {
                    start: `${date} ${start}:${minute}`,
                    end: `${date} ${end}:${minute}`,
                },
            ],
        };
    }
    return null;
}

export function formatBusInfo(detail = {}) {
    const {
        tempFields = {},
        fromCity,
        toCity,
        fromStation,
        buyTicketRule = {},
        isPresale,
        serviceChargeInfo = {},
        shiftType,
        toStationShow,
        toStation,
        passStationList = [],
        isWayStation,
        transferPorts,
        fromTime,
        fromDate,
        startTime,
        endTime,
    } = detail;
    let date = new Date(fromDate.replace(/\-/g, '/'));
    const formatDate = date.format('MM月dd日');
    const weekDay = date.getDayDesc();

    let time = formatDate + ' ' + _DAY1[date.getDay()] + ' ' + fromTime;

    let busTagName = getBusTagName(detail);
    const toStationDisplay = toStationShow || toStation;
    let displayTime = `${fromTime}出发`;
    if (shiftType === 1) {
        if (startTime && endTime) {
            displayTime = `${startTime}～${endTime}乘车`;
        } else if (endTime) {
            displayTime = `${endTime}前出发`;
        } else {
            displayTime = `${fromTime}前出发`;
        }
    }

    let showPassStationList = false;
    let showPassText = '';
    if (passStationList.length > 0 && isWayStation) {
        showPassStationList = true;
        showPassText = '途径信息';
        const shouldPassList = passStationList.filter(
            (station) => station.flag === 1
        );
        const showNumber = Math.max(shouldPassList.length - 2, 0);
        if (showNumber > 0) {
            showPassText = `途径${showNumber}站`;
        }
    }

    const lastBookTime = tempFields.lastBookTime || '';
    const title = fromCity && toCity ? `${fromCity}-${toCity}` : '订单填写';
    const hasServicePrice = serviceChargeInfo && serviceChargeInfo.price > 0;
    const supplierDetailData = getSupplierDetailData(tempFields);
    let alternativeData = null;
    if (isPresale) {
        alternativeData = getAlternativeTime({
            date: fromDate,
            time: fromTime,
        });
    }

    let timeDesc = `${formatDate} ${weekDay} ${displayTime}`;

    detail.ticketUnitOriginalPrice = detail.ticketUnitOriginalPrice || 0;

    detail.timeDesc = timeDesc;
    detail.busTagName = busTagName;
    detail.date = fromDate;
    detail.toStationDisplay = toStationDisplay;
    detail.showPassText = showPassText;
    detail.showPassStationList = showPassStationList;
    detail.ticketUnitOriginalPrice = detail.ticketUnitOriginalPrice || 0;

    return {
        detail,
        ticketPrice: detail.ticketUnitOriginalPrice,
        ticketUnitSalePrice: detail.ticketUnitSalePrice,
        childTicketPrice: detail.childTicketUnitSalePrice,
        isSaleChildTicket: buyTicketRule.isSaleChildTicket,
        isSaleTakeChildTicket: buyTicketRule.isSaleTakeChildTicket,
        supportPassengerTypes: formatSupportPassengerTypes(
            buyTicketRule?.supportPassengerIdentityTypes || '[身份证]'
        ),

        ticketExplainJsonData: detail.ticketExplainJsonData,
        subTicketServiceExplainJsonData: detail.subTicketServiceExplainJsonData,
        returnRuleJsonData: detail.returnRuleJsonData,
        fromCity,
        toCity,
        fromStation,
        toStation: toStationDisplay,
        fromDate,
        date: fromDate,
        hasServicePrice,
        serviceChargeInfo,

        supplierDetailData,
        isPreSaleTicket: isPresale,
        isPresale: isPresale,
        lastBookTime,
        maxSaleTicketNumber: buyTicketRule.maxSaleTicketNumber || 1,
        supportTakeChildNumber: buyTicketRule.supportTakeChildNumber || 0,
        alternativeData,
        timeDesc,
        date,
        toStationDisplay,
        showPassText,
        showPassStationList,
        time,
        title,
        busTagName,
    };
}

function getBusDetail(params) {
    return new Promise((resolve) => {
        if (params.bookData) {
            try {
                var bookData = BusShared.get(params.bookData);
                var busDetail = JSON.parse(decodeURIComponent(bookData));
                // used
                // BusShared.delete(params.bookData);
                if (!busDetail) {
                    resolve({});
                } else {
                    resolve(busDetail);
                }
            } catch (err) {
                resolve({});
            }
        } else {
            resolve({});
        }
    }).then((res) => {
        if (res && res.detail && res.detail.busNumber) {
            return res;
        }
        params['contentType'] = 'json';

        var { fromDate, scanId } = params;
        //增加一层容错避免外部输入日期不规范导致问题
        if (!fromDate) {
            fromDate = new Date().format('yyyy-MM-dd');
        } else {
            fromDate = new Date(fromDate.replace(/\-/g, '/')).format(
                'yyyy-MM-dd'
            );
        }
        params.fromDate = fromDate;
        let activityType = ((params || {})['activityType'] || '0') * 1;
        return Pservice.getBusDetail(params).then((res) => {
            let detail = res.data;

            return {
                ...formatBusInfo(detail),
                scanId,
                isSupportNewUser: activityType == 3,
                activityType: activityType,
            };
        });
    });
}

function formatPackList(data) {
    const mState = {};
    // x套餐展示埋点
    const xlist = data.xlist || [];
    const extend = data.extend || {};
    const { xListShowNum, maxCouponPrice } = extend;
    const packageList = [];
    if (xListShowNum) {
        mState.xListShowNum = xListShowNum || 5;
    }
    if (maxCouponPrice && maxCouponPrice > 0) {
        mState.maxCouponPrice = maxCouponPrice;
    }
    for (let i = 0; i < xlist.length; i++) {
        const item = xlist[i];
        if (item) {
            item.originalImage =
                'https://pages.c-ctrip.com/bus-resource/busxcx/X-test-icon/icon-%E6%99%AE%E9%80%9A%E8%B4%AD%E7%A5%A8.png';
        }
        if (item && item.channelName !== 'x_original') {
            item.excludeTicketPrice =
                item.showPriceAndServerFee || item.excludeTicketPrice;
        }

        if (item.extraMap && item.extraMap.xTags) {
            try {
                let xTags = JSON.parse(item.extraMap.xTags);

                let tags = xTags.map((item) => {
                    let val = Utils.formatHighLight(item.value);

                    return {
                        texts: val,
                        icon: item.key === 'Y' ? 'icon-yes' : 'icon-no',
                    };
                });
                item.extraTags = tags;
            } catch (e) {
                console.log(e);
            }
        }
        if (item.extraMap && item.extraMap.modalTags) {
            try {
                let mTags = JSON.parse(item.extraMap.modalTags);

                let modalTags = mTags.map((item) => {
                    let val = Utils.formatHighLight(item.value);

                    return {
                        texts: val,
                        icon: item.key === 'Y' ? 'icon-yes' : 'icon-no',
                    };
                });
                item.modalTags = modalTags;
            } catch (e) {}
        }
        if (item.extraMap && item.extraMap.channelType) {
            item.recommendTitle = item.extraMap.channelType;
        }
        item.iconImageSrc = `https://pic.c-ctrip.com/bus/resource/list/icon_${
            item.type || 'original'
        }.png`;
        packageList.push(item);
    }

    mState.xList = packageList;
    mState.hasX = packageList.length > 0;
    return mState;
}

function getXList(params) {
    return Pservice.activityXList(params)
        .then((res) => {
            // 格式化xList;
            let packages = formatPackList(res);
            return packages;
        })
        .catch((err) => {
            return {
                xList: [
                    {
                        channelId: '1000014',
                        channelName: 'x_original',
                        hallwayTitle: '车站原价预订',
                        tag: '车站原价预订',
                        ticketPrice: 16,
                    },
                ],
                hasX: false,
            };
        });
}

function getBookingActivity(params) {
    return Pservice.getBookingActivity(params)
        .then((res) => {
            let data = res.return;
            // 极速出票
            let travelSale =
                (data.travelSale && data.travelSale.attachPackages) || [];
            let travelSaleChannelId =
                (data.travelSale && data.travelSale.channelId) || '';
            let saleList = packageDataPreFormat.fromatSaleList(
                travelSale,
                travelSaleChannelId
            );
            // 意外险
            let weaList = (data.weaList && data.weaList.attachPackages) || [];
            let weaListChannelId =
                (data.weaList && data.weaList.channelId) || '';
            let { packageList } = packageDataPreFormat.formatPackageList(
                weaList,
                weaListChannelId
            );
            // 立减卡
            let reductionCardInfo = data.reductionStoreCard || {};
            let reductionCardChannel = data.reductionCard || {};
            const wechatShowReduceCard = data.wechatShowReduceCard || {};
            const tempReductionCardChannel =
                (reductionCardChannel &&
                    reductionCardChannel.attachPackages &&
                    reductionCardChannel.attachPackages[0]) ||
                {};
            reductionCardInfo.checked =
                wechatShowReduceCard &&
                wechatShowReduceCard.accountHasReduceCard &&
                !!reductionCardInfo.quantity;
            //
            reductionCardInfo.open =
                wechatShowReduceCard &&
                wechatShowReduceCard.accountHasReduceCard &&
                !!reductionCardInfo.quantity;
            reductionCardInfo.packageCode =
                tempReductionCardChannel &&
                tempReductionCardChannel.packageCode;
            reductionCardInfo.extraMap =
                tempReductionCardChannel && tempReductionCardChannel.extraMap;
            const {
                totalQuantity,
                quantity,
                discountFee,
                reductionCardDesc,
                expireDate,
            } = reductionCardInfo;
            const saveMoney =
                ((totalQuantity - quantity) * discountFee).toFixed(1) * 1;
            const canShowDeductionCard =
                !_.isEmpty(reductionCardInfo) &&
                !_.isEmpty(reductionCardChannel);
            reductionCardInfo.reductionCardDesc = !reductionCardInfo.checked
                ? reductionCardDesc
                : `${expireDate}到期，已为您节省${saveMoney}元`;
            // 预约票逻辑

            // 弹窗保险
            let {
                buttonRecommendInsurance,
                buttonRecommendCoupon3,
                buttonRecommendFiveMin,
                buttonRecommendEasyRefund,
            } = packageDataPreFormat.formatButtonRecommend(
                data.buttonRecommend,
                params
            );
            if (
                buttonRecommendInsurance &&
                buttonRecommendInsurance.extraMap &&
                buttonRecommendInsurance.extraMap.modalTags
            ) {
                try {
                    let mTags = JSON.parse(
                        buttonRecommendInsurance.extraMap.modalTags
                    );

                    let modalTags = mTags.map((item) => {
                        let val = Utils.formatHighLight(item.value);

                        return {
                            texts: val,
                            icon: item.key === 'Y' ? 'icon-yes' : 'icon-no',
                        };
                    });
                    buttonRecommendInsurance.modalTags = modalTags;
                } catch (e) {}
            }

            if (
                buttonRecommendFiveMin &&
                buttonRecommendFiveMin.extraMap &&
                buttonRecommendFiveMin.extraMap.modalTags
            ) {
                try {
                    let mTags = JSON.parse(
                        buttonRecommendFiveMin.extraMap.modalTags
                    );

                    let modalTags = mTags.map((item) => {
                        let val = Utils.formatHighLight(item.value);

                        return {
                            texts: val,
                            icon: item.key === 'Y' ? 'icon-yes' : 'icon-no',
                        };
                    });
                    buttonRecommendFiveMin.modalTags = modalTags;
                } catch (e) {}
            }
            if (
                buttonRecommendEasyRefund &&
                buttonRecommendEasyRefund.extraMap &&
                buttonRecommendEasyRefund.extraMap.modalTags
            ) {
                try {
                    let mTags = JSON.parse(
                        buttonRecommendEasyRefund.extraMap.modalTags
                    );

                    let modalTags = mTags.map((item) => {
                        let val = Utils.formatHighLight(item.value);

                        return {
                            texts: val,
                            icon: item.key === 'Y' ? 'icon-yes' : 'icon-no',
                        };
                    });
                    buttonRecommendEasyRefund.modalTags = modalTags;
                } catch (e) {}
            }

            return {
                buttonRecommendInsurance,
                buttonRecommendCoupon3,
                buttonRecommendFiveMin,
                buttonRecommendEasyRefund,
                packageList,
                saleList,
                reductionCardInfo,
                reductionCardChannel,
                canShowDeductionCard,
                wechatShowReduceCard,
            };
        })
        .catch((err) => {
            return {};
        });
}

function getPurseBalanceFee(param) {
    return new Promise((resolve, reject) => {
        var ticketPrice = param.ticketPrice;
        if (!param.isPresale) {
            Pservice.getPurseBalanceFee({
                ticketFee: ticketPrice,
                fromCity: param.fromCity,
                fromStation: param.fromStation,
                channelId: '' + (param.channelId || '0'),
                activityId: param.activityId || '0',
            })
                .then((res) => {
                    console.log(res);
                    var purseInfo = res.purseInfo || {};
                    // purseInfo.available = false;
                    resolve({ purseInfo, rewardChannel: purseInfo.available });
                })
                .catch((err) => {
                    resolve({ purseInfo: {}, rewardChannel: false });
                });
        } else {
            resolve({ purseInfo: {}, rewardChannel: false });
        }
    });
}

function discountNoticeBeforeBuy(data) {
    return new Promise((resolve, reject) => {
        Pservice.discountNoticeBeforeBuy(data).then((res) => {
            resolve(res.data);
        });
    });
}

export default {
    getBusDetail,
    getPurseBalanceFee,
    getXList,
    getBookingActivity,
    packageDataPreFormat,
    discountNoticeBeforeBuy,
};

export {
    getBusDetail,
    getPurseBalanceFee,
    getXList,
    getBookingActivity,
    packageDataPreFormat,
    discountNoticeBeforeBuy,
};
