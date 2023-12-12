import {
    cwx,
    CPage,
    BusRouter,
    Pservice,
    URLUtil,
    terminalBooking,
    traceStep
} from '../index.js';

import CustomModal from '../common/template/CustomModal';
const { stepTrace, BUS_PAY_STEP, point } = traceStep;
import BusPage from '../common/extend';

// var AppConfig = BusConfig.configWithAppid(__global.appId);

const InsuranceRecordKey = 'c_bus_insurance_record';

var inputContent = {};

function isInsurance(item = {}) {
    let type = (item.type || '').toLowerCase();
    return type.indexOf('insurance') >= 0;
}
let _DAY1 = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

let fromObj = {
    5: '设备切支付',
    6: '设备换系统',
    7: '窗口切支付',
};
const systemInfoSync = wx.getSystemInfoSync();

function formatXlist(list) {
    let saleList = (list || [])
        .map((item) => {
            return {
                id: item.Id,
                defaultOpen: item.DefaultOpen,
                buttonIcon: item.ButtonIcon,
                descUrl: item.DescUrl,
                littleTags: item.LittleTags,
                maxSellNum: item.MaxSellNum,
                needLogin: item.NeedLogin,
                position: item.Position,
                price: item.Price,
                richTextTitle: item.RichTextTitle,
                rollingNum: item.RollingNum,
                salePrice: item.SalePrice,
                sellType: item.SellType,
                show: item.Show,
                showPrice: item.ShowPrice,
                singleCashBackAmount: item.SingleCashBackAmount,
                subTitle: item.SubTitle,
                subTitleX: item.SubTitleX,
                supChild: item.SupChild,
                superTag: item.SuperTag,
                tag: item.Tag,
                tagList: item.TagList,
                ticketPrice: item.TicketPrice,
                ticketReducedPrice: item.TicketReducedPrice,
                ticketShowPrice: item.TicketShowPrice,
                title: item.Title,
                type: item.Type,
                vendorPrice: item.VendorPrice,
                alertTitle: item.alertTitle || '',
                alertMessage: item.alertMessage || '',
                alertImageUrl: item.alertImageUrl || '',
                alertDesc: item.alertDesc || '',
                promptDesc: item.promptDesc || '',
            };
        })
        .filter((item) => {
            item.open = false;
            item.isInsurance = isInsurance(item);
            item.isDiscount = item.type === 'discount';
            if (item.isDiscount) {
                item.discount = item.showPrice - item.price;
            }
            item.isnew = false;
            return item.show && item.id != '404';
        });
    return saleList;
}

function formatXProductList(list) {
    let saleList = (list || [])
        .map((item) => {
            return {
                id: item.productCode,
                descUrl: item.descUrl,
                price: item.price,
                sellType: item.sellType,
                showPrice: item.showPrice,
                subTitle: item.subTitle,
                tag: item.tag,
                title: item.title,
                type: item.type,
                vendorPrice: item.vendorPrice,
                alertTip: item.alertTip,
                alertTitle: item.alertTitle || '',
                alertMessage: item.alertMessage || '',
                alertImageUrl: item.alertImageUrl || '',
                alertDesc: item.alertDesc || '',
                promptDesc: item.promptDesc || '',
                selectType: item.selectType,
                productType: item.productType,
            };
        })
        .filter((item) => {
            item.open = false;
            item.isInsurance = isInsurance(item);
            item.isDiscount = item.type === 'discount';
            if (item.isDiscount) {
                item.discount = item.showPrice - item.price;
            }
            item.isnew = true;
            return item.id != '404';
        });
    return saleList;
}

function detachRecommend(buttonRecommendList, xlist) {
    let buttonRecommend = {};
    buttonRecommendList.every((item) => {
        let otherItem = {};
        xlist.some((item2) => {
            if (!item2.isnew && item2.type == item.type) {
                otherItem = item2;
                return true;
            }
            if (item2.isnew && item2.id === item.id && item2.alertTip) {
                otherItem = item2;
                return true;
            }
        });
        if (JSON.stringify(otherItem) !== '{}' && otherItem.open != true) {
            buttonRecommend = JSON.parse(JSON.stringify(item));
            return false;
        }
        return true;
    });

    buttonRecommend.hidden = true;
    return buttonRecommend;
}

function getRichTextDesc({
    string,
    type = 'text',
    style = 'color:#333333;font-size:17px',
    highlightStyle = 'color:#00B87A;',
}) {
    if (type == 'text') {
        string = string.replace(
            /\{(.*?)\}/g,
            `<b style="${highlightStyle}">$1</b>`
        );
    } else {
        return `<img style="${style}" src="${string}" />`;
    }

    return `<p style="${style}">${string}</p>`;
}

CPage({
    customStyle: 'custom',
    data: {
        statusBarHeight: global.globalData.statusBarHeight,
        titleBarHeight: global.globalData.titleBarHeight,
        buttonStyle: 0,
        detail: {},
        totalPrice: 0,
        showTotal: 0,
        ticketCount: 0,
        xlist: [],
        buttonRecommendList: [],
        buttonRecommend: {},
        isLoading: true,
        focusInput: '',
        isShowPhoneNumberHint: false,
        insertTime: '',
        riskOrder: false,
        servicePrice: 0,
        messageIds: [],
    },
    ubtTraceInsunrance: function (type, extraInfo) {
        this.ubtTrace(InsuranceRecordKey, {
            ...extraInfo,
            action_time: new Date().getTime(),
            type: type,
            page_id: this.pageId,
        });
    },

    loadData() {
        let options = this.params;
        this.showLoading();
        this.getBusDetail(options)
            .then((res) => {
                this.setData({
                    ...res,
                    isLoading: false,
                });
                this.countPrice(this.data);
                this.hideLoading();
                this.setNavigationBarTitle({
                    title: '待支付',
                });
                terminalBooking.updateInfo({
                    Id: options.id,
                    BookingStatus: 1,
                });
            })
            .catch((err) => {
                this.hideLoading();
                this.showMsg(
                    err.message || err.Message || '加载失败，请重试',
                    () => {
                        if (err && err.orderNumber) {
                            terminalBooking.toOrder(
                                err,
                                false,
                                options.orderType
                            );
                        } else {
                            this.toDefaultPage(options);
                        }
                    }
                );
            });
    },

    onLoad: function (options) {
        this.setData({
            insertTime: new Date().getTime(),
            newApi: parseInt(options.newapi || '0'),
        });
        // Do some initialize when page load.
        stepTrace({
            step: BUS_PAY_STEP.pageLoad,
            pageId: this.pageId,
        });
        this.params = options;
        new CustomModal(this);

        if (options.didLogin) {
            this.loadData();
        } else {
            BusRouter.checkLogin(2).then(this.loadData);
        }
    },
    onUnload: function () {
        this.ubtTraceInsunrance(9);
        this.didUnload = true;
        let outTime = new Date().getTime();
        this.onUbtTrace(
            'time',
            'keyid:177215',
            '停留时长',
            this.data.insertTime,
            outTime
        );
    },

    getBusDetail(options) {
        stepTrace({
            step: BUS_PAY_STEP.beforeFetchData,
            apiName: 'miniAppOrderInfo',
            pageId: this.pageId,
        });
        point({
            pointName: 'beforeFetchDetail',
            result: 1,
            ext: '请求订单数据前',
            orderNumber: options.id || '',
        });
        const openId = cwx && cwx.cwx_mkt && cwx.cwx_mkt.openid;
        let newApi = parseInt(options.newapi || '0');
        let getDetailApi = newApi
            ? Pservice.orderConfig
            : Pservice.miniAppOrderInfo;
        let obj = {
            id: options.id || '',
            openid: openId,
        };
        if (!newApi) {
            obj.did = options.did || '';
        }
        return getDetailApi(obj)
            .then(async (res) => {
                point({
                    pointName: 'afterFetchDetail',
                    result: 1,
                    ext: '请求订单数据成功',
                    orderNumber: options.id || '',
                });
                let data = newApi ? res.data : res.Data;
                let outData = newApi ? data : res;
                let phoneNumber = outData.phoneNumber || '';
                let showPhoneNumber = outData.showPhoneNumber;
                let phoneNumberPlaceHolder =
                    outData.phoneNumberPlaceHolder || '用于接收取票信息';
                if (!phoneNumber) {
                    showPhoneNumber = true;
                }
                inputContent['phone'] = phoneNumber;
                if (!phoneNumber) {
                    this.setData({
                        isShowPhoneNumberHint: true,
                    });
                    this.onUbtTrace(
                        'exposure',
                        'book_mobilePhone_hint_icon',
                        '请输入正确手机号提示'
                    );
                }
                let xlist = [];
                let buttonRecommendList = [];
                let orderFrom = '';
                let time;
                let fromDate;
                let buttonRecommend;
                let riskData = {};
                let buttonStyle = 0;
                if (newApi) {
                    if (data.xproductList && data.xproductList.length > 0) {
                        xlist = formatXProductList(data.xproductList);
                        buttonRecommendList = formatXProductList(
                            data.xproductList
                        );
                    }
                    buttonRecommend = detachRecommend(
                        buttonRecommendList,
                        xlist
                    );

                    fromDate = new Date(data.fromDate);
                    time =
                        fromDate.format('MM月dd日') +
                        ' ' +
                        _DAY1[fromDate.getDay()] +
                        ' ' +
                        data.fromTime;
                    let owner = data.owner;
                    orderFrom = fromObj[owner] ? fromObj[owner] : '设备';
                    riskData = {
                        servicePrice: data.servicePrice,
                        riskOrder: data.riskOrder,
                        riskMsg: data.riskMsg,
                        priceDetails: data.details,
                        messageIds: data.messageIds,
                    };
                    buttonStyle = data.buttonStyle || 0;
                } else {
                    if (data.Xlist && data.Xlist.length > 0) {
                        xlist = formatXlist(data.Xlist);
                    }
                    if (data.Packages && data.Packages.length > 0) {
                        buttonRecommendList = formatXlist(data.Packages);
                    }

                    buttonRecommend = detachRecommend(
                        buttonRecommendList,
                        xlist
                    );
                    fromDate = new Date(res.fromDate);
                    time =
                        fromDate.format('MM月dd日') +
                        ' ' +
                        _DAY1[fromDate.getDay()] +
                        ' ' +
                        res.fromTime;

                    stepTrace({
                        step: BUS_PAY_STEP.afterFetchData,
                        apiName: 'miniAppOrderInfo',
                        pageId: this.pageId,
                    });
                }

                return {
                    xlist,
                    buttonRecommend,
                    buttonRecommendList,
                    totalPrice: outData.sumPrice,
                    ticketCount: outData.ticketCount,
                    showTotal: outData.sumPrice,
                    phoneNumber,
                    phoneNumberPlaceHolder,
                    showPhoneNumber,
                    buttonStyle,
                    ...riskData,
                    detail: {
                        time: time,
                        fromDate: outData.fromDate,
                        fromStation: outData.fromStationName,
                        toStation: outData.toStationName,
                        fromTime: outData.fromTime,
                        shiftType: outData.shiftType,
                    },
                    priceComposeDesc: outData.orderDesc || '',
                    onLineDescUrl: outData.insDetailUrl,
                    orderFrom,
                };
            })
            .catch((err) => {
                point({
                    pointName: 'afterFetchDetail',
                    result: 0,
                    ext: '请求订单数据成失败',
                    orderNumber: options.id || '',
                    errMsg: JSON.stringify(err),
                });
                try {
                    stepTrace({
                        step: BUS_PAY_STEP.error,
                        errorInfo: JSON.stringify(err),
                        pageId: this.pageId,
                    });
                } catch (e) {}
                throw err;
            });
    },

    onReady: function () {
        // 缓存影响参数
        cwx.mkt.getUnion(
            function (unionData) {
                this.unionData = unionData;
            }.bind(this)
        );
    },

    bindInputChange: function (e) {
        inputContent[e.currentTarget.id] = e.detail.value;
        if (e.currentTarget.id == 'phone') {
            this.setData({
                phoneNumber: e.detail.value,
            });
            let phoneNumber = e.detail.value;
            let pNumReg = /^(13|14|15|17|18|16|19)[0-9]{9}$/;
            if (!pNumReg.test(phoneNumber)) {
                if (!this.data.isShowPhoneNumberHint) {
                    this.onUbtTrace(
                        'exposure',
                        'book_mobilePhone_hint_icon',
                        '请输入正确手机号提示'
                    );
                }
                this.setData({
                    isShowPhoneNumberHint: true,
                });
            } else {
                this.setData({
                    isShowPhoneNumberHint: false,
                });
            }
        }
    },

    togglePriceDetail: function (e) {
        this.setData({
            showPriceDetail: !this.data.showPriceDetail,
        });
    },

    // 显示地图
    showMap(e) {
        var fromStationInfo = this.data.detail.fromStationInfo || {};
        var noXYHasAddress = () => {
            if (fromStationInfo.address) {
                this.showMsg({
                    title: '出发车站地址',
                    message: fromStationInfo.address,
                });
            }
        };

        if (fromStationInfo.amapX && fromStationInfo.amapY) {
            wx.openLocation({
                latitude: +fromStationInfo.amapY,
                longitude: +fromStationInfo.amapX,
                address: fromStationInfo.address || '',
                name: fromStationInfo.name || '',
                scale: 28,
                fail: () => {
                    noXYHasAddress();
                },
            });
        } else {
            noXYHasAddress();
        }
    },

    // 显示说明
    showExplain(e) {
        var index = e.currentTarget.dataset.index;
        this.setData({
            showExplain: true,
            showExplainIndex: index,
        });
    },

    disMissExplain(e) {
        this.setData({
            showExplain: false,
        });
    },

    toDefaultPage: (options = {}) => {
        BusRouter.redirectTo('index', options);

        // BusRouter.navigateTo('/pages/bus/router/list/list?fromCity=上海&toCity=南通',{
        //   fromCity: '上海',
        //   toCity: '南通'
        // });
    },
    validInput() {
        let phoneNumber = inputContent['phone'];
        let pNumReg = /^(13|14|15|17|18|16|19)[0-9]{9}$/;
        if (!pNumReg.test(phoneNumber)) {
            this.onUbtTrace(
                'exposure',
                'book_mobilePhone_hint_icon',
                '请输入正确手机号提示'
            );
            this.setData({
                isShowPhoneNumberHint: true,
                focusInput: 'phone',
            });
            return false;
        }
        this.setData({
            isShowPhoneNumberHint: false,
        });
        return true;
    },

    beforeSubmit(e) {
        if (this.data.messageIds.length > 0) {
            BusPage.wxSubscribeMsg(this.data.messageIds).then((res) => {
                this.doSubmit(e);
            });
        } else {
            this.doSubmit(e);
        }
    },

    doSubmit: function (e) {
        point({
            pointName: 'clickDoSubmit',
            result: 1,
            ext: '点击去支付按钮',
            orderNumber: this.params.id || '',
        });
        this.onUbtTrace('click', 'book_topay_button', '去支付');
        var method = e.currentTarget.dataset.method || '';

        if (!this.validInput()) {
            return;
        }

        if (method == 'next') {
            var addorderBlock = (data) => {
                this.countPrice(data);
                this.addOrder(this.buildOrderParam(data));
            };
            if (this.data.buttonRecommend && this.data.buttonRecommend.id) {
                this.showProductModal(this.data.buttonRecommend).then(
                    ({ didOpen }) => {
                        this.data.buttonRecommend.open = didOpen;

                        addorderBlock(this.data);
                        if (this.data.buttonRecommend.isInsurance) {
                            this.ubtTraceInsunrance(
                                this.data.buttonRecommend.open ? 5 : 6,
                                {
                                    insurance_name:
                                        this.data.buttonRecommend.title,
                                    insurance_price:
                                        this.data.buttonRecommend.price,
                                    scan_id: '',
                                }
                            );
                        }
                    }
                );
            } else {
                addorderBlock(this.data);
            }
        }
    },

    showProductModal(product) {
        let buttonStyle = this.data.buttonStyle;
        return new Promise((resolve, reject) => {
            let extraSale = product;

            if (extraSale.isInsurance) {
                let config = {
                    // alertTitle: '您尚未添加出行保障',
                    // alertMessage: '为使家人{更安心},是否购买',
                    // alertImageUrl: 'https://pic.c-ctrip.com/bus/resource/book/icon_insurance.png',
                    // alertDesc: '1元综合险 ¥1/人',
                    promptDesc:
                        '本模块为投保页面，由携程保险代理有限公司管理并运营。请仔细阅读投保须知等内容，并知晓承保保险公司和产品条款内容，为确保您的投保权益，您的投保信息轨迹将被记录。',
                };
                extraSale = { ...extraSale, ...config };
            }

            let richTextTitle = `<div class="antiPadding boxroundTop" style="font-size:17px;line-height: 50px; color:#333333;position:relative;">
    <p class="boxroundTop" style="color:#333333;">
        <b class="close-tips icon-font icon-close" style="font-size:17px;position:absolute;left:15px;color: #666666"></b>
        ${getRichTextDesc({
            string: extraSale.alertTitle || '',
            type: 'text',
            style: 'font-size:17px;color:#333333;margin-bottom:5px;',
        })}
    </p>
</div>`;
            let richTextMessage = `<div style="font-size:16px;color:#ffffff;position:relative;">
    <div style="position:relative;margin:auto;">
        ${getRichTextDesc({
            string: extraSale.alertImageUrl || '',
            type: 'img',
            style: 'height:109px;width:auto;margin-bottom:8px;',
        })}
        <p style="font-size:20px;color:#333333;position:relative;" >
            ${getRichTextDesc({
                string: extraSale.alertMessage || '',
                type: 'text',
                style: 'font-size:20px;color:#333333;font-weight:600;margin-top:10px;',
                highlightStyle: 'color:#00B87A;',
            })}
        </p>
    </div>
</div>`;
            let richTextDesc =
                extraSale.promptDesc && extraSale.promptDesc.length > 0
                    ? `<div style="position:relative;">
<div style="margin:10px 0 0;border-top:1px solid #f4f4f4; padding:10px 0 5px;">            
    <p style="font-size:10px;color:#999999;position:relative;" >
        ${getRichTextDesc({
            string: extraSale.promptDesc || '',
            type: 'text',
            style: 'font-size:10px;color:#999999;position:relative;',
            highlightStyle: 'color:#00B87A;',
        })}
    </p>
</div>
</div>`
                    : '';

            const showModalData = {
                richTextTitle,
                richTextMessage,
                richTextDesc: richTextDesc,
                extra: 1,
                buttons: [
                    {
                        buttonTitle:
                            extraSale.isInsurance || buttonStyle != 1
                                ? '否'
                                : '放弃',
                        buttonColor: '#ffffff',
                        buttonTextColor: '#666666',
                        buttonStyle: 'border-color:#dddddd;',
                        action: () => {
                            resolve({ didOpen: false });
                        },
                    },
                    {
                        buttonTitle:
                            extraSale.isInsurance || buttonStyle != 1
                                ? '是'
                                : '继续支付',
                        buttonColor:
                            extraSale.isInsurance || buttonStyle != 1
                                ? this.data.colorConfig.mainColor
                                : 'linear-gradient(-90deg, rgb(255, 119, 0) 0%, rgb(255, 165, 10) 100%)',
                        buttonTextColor: '#ffffff',
                        action: () => {
                            resolve({ didOpen: true });
                        },
                    },
                ],
                bottomModal: true,
                isIPhoneX:
                    systemInfoSync.platform !== 'android' &&
                    systemInfoSync.statusBarHeight > 25,
            };
            if (extraSale.alertDesc && extraSale.descUrl) {
                if (extraSale.isInsurance) {
                    showModalData.others = [
                        {
                            title: extraSale.alertDesc,
                            style: 'color: #333333;font-size:13px;font-weight:300;',
                            action: (e) => {
                                console.log(e);
                                if (extraSale.descUrl) {
                                    BusRouter.navigateTo('web', {
                                        url: encodeURIComponent(
                                            extraSale.descUrl
                                        ),
                                        title: '产品说明',
                                        naviColor:
                                            this.data.colorConfig
                                                .headerBgColor || '',
                                    });
                                }
                            },
                        },
                        {
                            title: '详细说明',
                            style: 'color: #999999;font-size:13px;font-weight:300;',
                            isInsuranceTip: true,
                            needAction: true,
                            action: (e) => {
                                console.log(e);
                                if (extraSale.descUrl) {
                                    BusRouter.navigateTo('web', {
                                        url: encodeURIComponent(
                                            extraSale.descUrl
                                        ),
                                        title: '产品说明',
                                        naviColor:
                                            this.data.colorConfig
                                                .headerBgColor || '',
                                    });
                                }
                            },
                        },
                    ];
                } else {
                    showModalData.others = [
                        {
                            title: extraSale.alertDesc,
                            style: 'color: #333333;font-size:13px;font-weight:300;',
                            needAction: true,
                            action: (e) => {
                                console.log(e);
                                if (extraSale.descUrl) {
                                    BusRouter.navigateTo('web', {
                                        url: encodeURIComponent(
                                            extraSale.descUrl
                                        ),
                                        title: '产品说明',
                                        naviColor:
                                            this.data.colorConfig
                                                .headerBgColor || '',
                                    });
                                }
                            },
                        },
                    ];
                }
            }
            this.showCustomModal(showModalData);
        });
    },
    buildOrderParam(data) {
        let xlist = data.xlist;
        let buttonRecommend = data.buttonRecommend;
        let allSalePack = [...xlist, buttonRecommend]
            .filter((item) => item.open)
            .map((item) => '' + item.id);
        let resultData = {
            id: this.params.id,
            newapi: this.params.newapi || '0',
            orderType: this.params.orderType || '',
            xproducts: allSalePack,
            phoneNumber: data.phoneNumber,
        };

        if (this.data.newApi) {
            let xProductReqs = [...xlist, buttonRecommend]
                .filter((item) => item.open)
                .map((item) => {
                    return {
                        productType: item.productType,
                        productPrice: item.showPrice,
                        productCount: item.sellType == 1 ? data.ticketCount : 1,
                        productCode: item.id,
                    };
                });
            resultData.xProductReqs = xProductReqs;
        }

        return resultData;
    },
    inLoading: false,
    addOrder(params) {
        if (this.inLoading) {
            return;
        }
        this.inLoading = true;
        setTimeout(() => {
            this.inLoading = false;
        }, 5000); //5秒解锁避免卡死
        var terminal = terminalBooking(
            this,
            params.id,
            params.orderType,
            params
        );

        terminal
            .getOfflinePayParam()
            .then((order) => {
                this.sendUnionTrace(order.orderNumber);
                return terminal.pay(order, point, point);
            })
            .then((res) => {
                this.inLoading = false;
                this.showToast('支付成功', () => {
                    // BusRouter.redirectTo('payresult', {
                    //   orderNumber: res.orderID,
                    //   orderPrice: res.price
                    // });
                    terminalBooking.toOrder(res, true, params.orderType);
                });
                this.ubtTraceInsunrance(8);
            })
            .catch((err) => {
                this.inLoading = false;
                var message = '支付失败，请重新扫码';
                if (err.data && err.data.riskMsg) {
                    let servicePrice = `服务费  ${err.data.servicePrice}元/份`;
                    let riskMsg = err.data.riskMsg;
                    this.riskControl(servicePrice, riskMsg);
                } else {
                    if (err.message) {
                        message = err.message;
                    } else {
                        if (err.hasOwnProperty('type')) {
                            message =
                                err.type == 0 ? '用户取消支付' : '支付失败';
                        }
                    }
                    setTimeout(() => {
                        this.showMsg(message, () => {
                            if (
                                err.orderNumber &&
                                ('' + err.orderNumber).length > 10
                            ) {
                                terminalBooking.toOrder(
                                    { ...err, orderNumber: err.orderNumber },
                                    false,
                                    params.orderType
                                );
                            } else {
                                this.toDefaultPage();
                            }
                        });
                    }, 0);
                    try {
                        stepTrace({
                            step: BUS_PAY_STEP.error,
                            errorInfo: JSON.stringify(err),
                            pageId: this.pageId,
                        });
                    } catch (e) {}
                }
            });
    },

    switchSalePackage: function (e) {
        var index = e.currentTarget.dataset.index;
        var mutil = e.currentTarget.dataset.mutil;
        var xlist = this.data.xlist;
        let currentItem = xlist[index];
        var checked = currentItem.open;
        if (!mutil) {
            xlist.forEach((item) => {
                item.open = false;
            });
        }
        currentItem.open = !checked;
        // this.countPrice(this.data);
        let buttonRecommend = detachRecommend(
            this.data.buttonRecommendList,
            xlist
        );

        let openedInsurance = xlist.filter((item) => {
            return item.isInsurance;
        });
        let hasInsurance = openedInsurance.length > 0;

        this.countPrice({
            ...this.data,
            buttonRecommend,
            hasInsurance,
            openedInsurance,
            xlist,
        });
        if (currentItem.isInsurance) {
            this.ubtTraceInsunrance(currentItem.open ? 5 : 6, {
                insurance_name: currentItem.title,
                insurance_price: currentItem.price,
                scan_id: '',
            });
        }
    },
    showOnlinePackageExplain: function (e) {
        var url = e.currentTarget.dataset.url;
        if (url) {
            BusRouter.navigateTo('web', {
                url: encodeURIComponent(url),
                title: '产品说明',
                naviColor: this.data.colorConfig.headerBgColor || '',
            });
        }
        this.ubtTraceInsunrance(7, {
            scan_id: '',
        });
    },

    showPackageExplain: function (e) {
        var url = e.currentTarget.dataset.url;
        let index = e.currentTarget.dataset.index;
        let currentItem;
        if (index >= 0) {
            currentItem = this.data.xlist[index];
        }
        if (url) {
            BusRouter.navigateTo('web', {
                url: encodeURIComponent(url),
                title: '产品说明',
                naviColor: this.data.colorConfig.headerBgColor || '',
            });
        }
        if (currentItem && currentItem.isInsurance) {
            this.ubtTraceInsunrance(7, {
                insurance_name: currentItem.title,
                insurance_price: currentItem.price,
                scan_id: '',
            });
        }
    },
    inLoaging: false,
    sendUnionTrace: function (orderNumber) {
        cwx.mkt.sendUnionTrace(this, orderNumber, 'BUS');
    },

    showPolicy(e) {
        BusRouter.navigateTo('web', {
            url: encodeURIComponent(
                'https://pages.c-ctrip.com/bus-resource/bus_insurance/%E6%B1%BD%E8%BD%A6%E7%A5%A8%E9%A2%84%E8%AE%A2%E8%AF%B4%E6%98%8E.html'
            ),
            title: '预订协议',
            naviColor: this.data.colorConfig.headerBgColor || '',
        });
    },

    countPrice(data) {
        let totalPrice = data.totalPrice; //origin total;
        let ticketCount = data.ticketCount;

        let xlist = data.xlist;
        let buttonRecommend = data.buttonRecommend;
        let allSalePack = [...xlist, buttonRecommend].filter(
            (item) => item.open
        );

        let packagePurseFee = 0;
        let salePrice = 0;
        let hiddenSalePrice = 0;
        let priceList = [];
        if (data.riskOrder) {
            let details = data.priceDetails;
            details.forEach((item) => {
                let itm = {
                    name: item.name,
                    price: item.price,
                    count: item.count,
                    unit: item.unit,
                    tag: item.tag,
                };
                priceList.push(itm);
            });
        }
        allSalePack.forEach((item) => {
            var count = ticketCount;

            //计算价格
            var itemPrice =
                item.sellType == 1
                    ? item.price * count
                    : count > 0
                    ? item.price
                    : 0;
            if (!item.hidden) {
                salePrice += itemPrice;
            } else {
                hiddenSalePrice += itemPrice;
            }

            // 单独计算返现
            packagePurseFee += item.singleCashBackAmount || 0;
            //处理明细
            if (count > 0) {
                var itm = {
                    name: item.title,
                    price: item.price,
                    count: item.sellType == 1 ? count : 1,
                    unit: item.sellType == 1 ? '份' : '份',
                    discount: item.isDiscount ? item.discount : 0,
                    canCancel: true,
                    tag: '点击取消',
                    id: item.id,
                    hidden: item.hidden || false,
                    giveActivitys: (item.giveActivitys || []).map((give) => {
                        return {
                            ...give,
                            price: give.showPrice,
                            count: give.sellType == 1 ? count : 1,
                            unit: '份',
                        };
                    }),
                };
                item.saleCount = item.sellType == 1 ? count : 1;
                var giveProduct = item.giveProduct;
                if (giveProduct) {
                    item.giveProduct.saleCount =
                        giveProduct.sellType == 1 ? count : 1;
                    itm.hasGive = giveProduct ? true : false;
                    itm.giveProduct = {
                        price: giveProduct.showPrice,
                        title: giveProduct.title || '赠送产品',
                        count: giveProduct.sellType == 1 ? count : 1,
                        unit: '份',
                    };
                }
                priceList.push(itm);
            }
        });

        let showTotal = totalPrice + salePrice;
        showTotal = Number(showTotal).toFixed(2) * 1;
        this.setData({
            ...data,
            showTotal,
            priceList,
        });
    },
    bindInputClick() {
        this.onUbtTrace('click', 'book_mobilePhone_button', '联系手机输入框');
    },
    onUbtTrace(type, typeSnd, comment, insertTime, outTime) {
        let obj = {
            click: {
                key: 'bus_ctrip_offline_xcx_allpage_click',
                keyid: '201770',
                key_des: '汽车票小程序点击全埋点',
            },
            exposure: {
                key: 'bus_ctrip_offline_xcx_allpage_show',
                keyid: '201771',
                key_des: '汽车票小程序曝光全埋点',
            },
            time: {
                key: 'zhixing_page_hangxuan',
                keyid: '177215',
                key_des: '页面停留时长埋点',
            },
        };
        let key = obj[type].key;
        let keyid = obj[type].keyid;
        let key_des = obj[type].key_des;
        let info = {
            keyid,
            key_des,
            pageId: this.pageId,
            type: 'ctripxcx_wx_offline',
            typeSnd,
            utmSource: this.data.utmSource || '',
            from: this.data.orderFrom,
            comment,
        };
        if (type === 'time') {
            info['insert_time'] = insertTime;
            info['out_time'] = outTime;
        }
        console.log('info data', JSON.stringify(info));
        this.ubtTrace(key, info);
    },

    riskControl(servicePrice, riskMsg) {
        let richTextTitle = `<div>${getRichTextDesc({
            string: riskMsg,
            type: 'text',
            style: 'font-size:15px;color:#333333;margin-top:10px;',
            highlightStyle: 'color:#00B87A;',
        })}${getRichTextDesc({
            string: servicePrice,
            type: 'text',
            style: 'font-size:12px;color:#999999;margin-top:10px;',
            highlightStyle: 'color:#00B87A;',
        })}</div>`;

        let addorderBlock = () => {
            let data = this.data;
            this.addOrder(this.buildOrderParam(data));
        };

        let showModalData = {
            title: '重要提示',
            richTextMessage: richTextTitle,
            extra: 1,
            buttons: [
                {
                    buttonTitle: '否',
                    buttonColor: '#ffffff',
                    buttonTextColor: this.data.colorConfig.mainColor,
                    action: () => {
                        this.loadData();
                    },
                },
                {
                    buttonTitle: '继续支付',
                    buttonColor: this.data.colorConfig.mainColor,
                    buttonTextColor: '#ffffff',
                    action: () => {
                        addorderBlock();
                    },
                },
            ],
        };
        this.showCustomModal(showModalData);
    },
});
