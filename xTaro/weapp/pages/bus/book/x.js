import {
    _,
    __global,
    CPage,
    BusRouter,
    BusShared,
    BusDetail,
    Pservice,
    Utils,
    cwx,
} from '../index.js';

CPage({
    customStyle: 'custom',
    pageId: '10650076784',
    data: {
        isLoading: true,
        showAllXList: false,
        showExplainIndex: 0,
    },

    onLoad: function (options) {
        // Do some initialize when page load.

        var loadData = (res) => {
            this.getBusDetail(options)
                .then((busDetail) => {
                    return this.setView(busDetail);
                })
                .then((data) => {
                    let isAB =
                        cwx.ABTestingManager.valueForKeySync(
                            '220117_BUS_XCXX1'
                        ) || '';
                    this.busXAbVersion = isAB;
                    this.setTitle();
                    this.hideLoading();
                    this.setData({
                        isLoading: false,
                    });
                    this.exposureOnLoad();
                })
                .catch((err) => {
                    console.log(err);
                    this.setData({
                        isLoading: false,
                    });
                    this.hideLoading();
                    this.showMsg('加载失败，请重试');
                });
            this.getServiceFeeExplain();
        };
        if (options.didLogin) {
            loadData();
        } else {
            BusRouter.checkLogin(1).then(loadData);
        }
    },

    getBusDetail(options) {
        if (!this.options.date) {
            this.options.date = new Date().format('yyyy-MM-dd');
        }

        // let params = {
        //     fromCity: '上海',
        //     toCity: '南通',
        //     busNumber: 'pud-nan-F-114',
        //     fromStation: '上海浦东机场',
        //     toStation: '南通',
        //     fromDate: '2022-01-14',
        //     fromTime: '18:00',
        //     fullPrice: 25,
        //     symbol: 'BjcHm13x7qTI53Z5j1g9dlSa2GKkwCEcoYaIP4OKO40VhExYVoqjPr',
        //     bookable: true,
        //     appVersion: '842.000',
        //     utmsource: 'pltUtm_chrome_debug',
        //     abList: [{ abVersion: '200917_DSJT_tpsxf', abValue: '' }],
        //     searchToCity: '南通',
        //     userId: 'M28896396',
        //     basicParams: {
        //         app: 'ctrip',
        //         bigChannel: 'bus',
        //         smallChannel: '',
        //         operatSystem: 'ios',
        //         bigClientType: 'rn',
        //         smallClientType: '',
        //         clientVersion: '4.0.5',
        //         insideVersion: '',
        //     },
        // };
        var params = {
            fromCity: options.fromCity,
            toCity: options.toCity,
            fromStation: options.fromStation,
            toStation: options.toStation,
            busNumber: options.busNumber,
            fromDate: options.date,
            fromTime: options.fromTime,
            symbol: options.symbol,
            utmSource: this.data.utmSource,
            fullPrice: options.fullPrice,
            bookable: options.bookable || 1,
            abList: [
                {
                    abVersion: '200917_DSJT_tpsxf',
                    abValue: 'B',
                },
            ],
            // basicParams: {
            //     app: 'ctrip',
            //     bigChannel: 'bus',
            //     smallChannel: '',
            //     operatSystem: 'ios',
            //     bigClientType: 'rn',
            //     smallClientType: '',
            //     clientVersion: '4.0.5',
            //     insideVersion: '',
            // },
        };

        return BusDetail.getBusDetail(params).then((res) => {
            var detail = res.detail;
            this.getBusNoticeData(detail);
            return BusDetail.getXList(params).then((xData) => {
                return {
                    ...res,
                    ...xData,
                };
            });
        });
    },

    setView: function (data) {
        var { detail } = data;
        var servicePrice = 0;
        var buyTicketRule = detail.buyTicketRule;
        let showInXList = false;
        // 这个是服务费
        if (detail.serviceChargeInfo && detail.serviceChargeInfo.price > 0) {
            servicePrice = detail.serviceChargeInfo.price;
            showInXList = detail.serviceChargeInfo.showInXList;
        }
        let ticketExplainList = JSON.parse(
            detail.ticketExplainJsonData || '[]'
        );
        let returnRuleList = JSON.parse(detail.returnRuleJsonData || '[]');

        detail.explainList = [
            {
                title: '退改规则',
                content: returnRuleList,
            },
            {
                title: '购取说明',
                content: ticketExplainList,
            },
        ];

        detail.explainList.forEach((item) => {
            item.content = this.formatData(item.content);
        });

        var saveData = {
            ...data,
            servicePrice: servicePrice,
            buyTicketRule: buyTicketRule,
            showInXList,
        };
        this.setData(saveData);
        return Promise.resolve(detail);
    },

    getBusNoticeData({ fromCity, toCity, fromStation, toStationShow }) {
        let notice = [];
        // location  1:首页 2:列表页 3:订单填写页 4:订单详情页 5:X页
        Pservice.getShipNotice({
            location: 5,
            fromCity,
            toCity,
            fromStation,
            toStation: toStationShow,
        })
            .then((res) => {
                if (res && res.code === 1 && res.data) {
                    const { content, title } = res.data;
                    this.setData({
                        busNoticeData: {
                            noticeContentWidth: 654,
                            busNoticeContent: content,
                            busNoticeTitle: title,
                        },
                        hasBusNotice: true,
                    });
                }
            })
            .catch((err) => {
                console.log(err);
            });
    },

    onBusNoticeClick(e) {
        this.setData({
            showBusNoticeModal: true,
        });
    },
    onClosebusNoticeModal() {
        this.setData({
            showBusNoticeModal: false,
        });
    },

    setTitle: function () {
        var options = this.options;
        if (!options) return;
        var title = options.fromCity + '-' + options.toCity;
        this.setNavigationBarTitle({
            title: title,
        });
    },

    onReady: function () {},
    onShow: function () {},
    showAllList: function () {
        this.setData({
            showAllXList: true,
        });
    },
    onBookWithDismissDesc(e) {
        let item = e.currentTarget.dataset.item;
        Utils.sendClickTrace('xcx_x_pop_reserve_button_click', {
            comment: 'x页浮层预定按钮点击上报',
            abVersion: this.busXAbVersion,
            channelName: item.channelName,
        });
        this.onUbtTrace(
            'click',
            `${item.channelName}_popReserve_button_click`,
            `${item.hallwayTitle}通道浮层预定按钮点击`,
            this.busXAbVersion
        );

        this.hiddenExplainDesc();
        this.onBook(e);
    },
    showExtraDesc(e) {
        var item = e.currentTarget.dataset.item;
        console.log(item);
        this.hiddenExplainDesc();
        BusRouter.map('member', { price: item.price });

        this.navigateTo({
            url: BusRouter.map('member', { price: item.price }),
            immediateCallback: () => {
                this.onBook(e);
            },
        });
    },
    getServiceFeeExplain() {
        let mdetail = this.data.detail || {};
        let mtempFields = mdetail.tempFields || {};
        let mwebiste = mtempFields.webiste;
        return Pservice.getServiceFeeExplain(mwebiste)
            .then((res) => {
                this.setData({
                    serviceFeeExplainData: res.data,
                });
            })
            .catch((error) => {
                console.log('error');
            });
    },
    showServiceFeeDesc(e) {
        this.onUbtTrace(
            'click',
            'bus_x_serviceFeeDetail_button_click',
            'X页-服务费须知点击'
        );
        console.log('showServiceFeeDesc---');
        this.setData({
            showServiceFeeDesc: true,
        });
    },
    hideServiceFeeDesc(e) {
        this.setData({
            showServiceFeeDesc: false,
        });
    },
    onBook(e) {
        var bookType = e.currentTarget.dataset.type;
        var bookItem = e.currentTarget.dataset.item;
        bookItem.open = true;
        let trace = e.currentTarget.dataset.trace;
        if (trace === 'onBook') {
            Utils.sendClickTrace('xcx_x_reserve_button_click', {
                comment: 'x页预定按钮点击上报',
                abVersion: this.busXAbVersion,
                channelName: bookItem.channelName,
            });
            this.onUbtTrace(
                'click',
                `${bookItem.channelName}_reserve_button_click`,
                `${bookItem.hallwayTitle}通道预定按钮点击`,
                this.busXAbVersion
            );
        }
        var data = { ...this.data };
        data.busNoticeData = undefined;
        var selectX = undefined;
        data.xList.forEach((item) => {
            item.open = false;
            item.xPosition = 'x';
        });
        if (!!bookItem.type) {
            data.xList.forEach((item) => {
                if (item.channelId === bookItem.channelId) {
                    item.open = true;
                    selectX = item;
                } else {
                    item.open = false;
                }
            });
        }
        if (selectX) {
            data.selectX = selectX;
        }

        let dataJson = JSON.stringify(data);
        BusShared.save('bookDataParams', encodeURIComponent(dataJson));

        BusRouter.navigateTo(
            'book',
            { bookData: 'bookDataParams', ...this.options },
            2,
            5
        );
    },

    serviceFeeTip() {
        this.showMsg(
            '服务费包含支付手续费，短信费，技术接入费；如产生退票，服务费不退。'
        );
    },

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
    showExplain(e) {
        this.onUbtTrace(
            'click',
            'bus_x_reserveNotice_button_click',
            'X页-预订须知点击'
        );
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

    showPackageExplain: function (e) {
        var url = e.currentTarget.dataset.url;
        if (url) {
            BusRouter.navigateTo('web', {
                url: encodeURIComponent(url),
                title: '产品说明',
                naviColor: this.data.colorConfig.headerBgColor || '',
            });
        }
    },
    showPackageExplainDesc: function (e) {
        var item = e.currentTarget.dataset.item;
        this.onUbtTrace(
            'click',
            `${item.channelName}_text_button_click`,
            `${item.hallwayTitle}通道优势文案点击`
        );
        if (item.type == 'superMember') {
            this.showExtraDesc(e);
        } else {
            if (item.hallwayDesc) {
                this.setData({
                    showDescContent: true,
                    descContentItem: item,
                });
            }
        }
    },
    hiddenExplainDesc() {
        this.setData({
            showDescContent: false,
            descContent: [],
        });
    },

    showOfferDesc(e) {
        this.setData({
            showOfferDesc: true,
        });
    },

    hideOfferDesc(e) {
        this.setData({
            showOfferDesc: false,
        });
    },

    hideInsDesc: function () {
        this.setData({
            showInsDesc: false,
        });
        this.hideMask();
    },

    exposureOnLoad() {
        let xList = this.data.xList;
        if (xList && xList.length > 0) {
            xList.forEach((item) => {
                let typeSnd = `${item.channelName}_reserve_show`;
                let comment = `${item.hallwayTitle}通道曝光`;
                Utils.sendExposeTrace('xcx_x_channel_show', {
                    comment: 'x页通道曝光上报',
                    abVersion: this.busXAbVersion,
                    channelName: item.channelName,
                });
                this.onUbtTrace(
                    'exposure',
                    typeSnd,
                    comment,
                    this.busXAbVersion
                );
            });
        }
    },

    onUbtTrace(type, typeSnd, comment, abVersion) {
        let key =
            type === 'click'
                ? 'bus_ctrip_wxxcx_allpage_click'
                : 'bus_ctrip_wxxcx_allpage_show';
        let keyid = type === 'click' ? '200534' : '200558';
        let key_des =
            type === 'click'
                ? '汽车票小程序点击全埋点'
                : '汽车票小程序曝光全埋点';
        let info = {
            keyid,
            key_des,
            pageId: this.pageId,
            type: 'ctripwxxcx',
            typeSnd,
            utmSource: this.data.utmSource || '',
            comment,
        };
        if (abVersion) {
            info.abVersion = abVersion;
        }
        this.ubtTrace(key, info);
    },

    formatData(data) {
        if (!data) {
            return [];
        }
        const keyList = Object.keys(data);
        const list = [];
        keyList.forEach((item) => {
            if (item !== 'easyRefund') {
                const tempItem = {};
                tempItem._title = item;
                tempItem._list = data[item];
                list.push(tempItem);
            }
        });
        return list;
    },

    onClickExplainShowMap(e) {
        let station = e.currentTarget.dataset.station;
        if (station) {
            this.showMap();
        }
    },
});
