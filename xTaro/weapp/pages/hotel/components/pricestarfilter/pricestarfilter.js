import { cwx } from '../../../../cwx/cwx';

import pricestarfunc from './pricestarfunc';
import util from '../../common/utils/util.js';
import psDefaData from './pricestardata.js';

Component({
    properties: {
        hidden: {
            type: Boolean,
            value: false
        },
        pageFrom: {
            type: String,
            value: ''
        },
        isIphoneX: {
            type: Boolean,
            value: false
        },
        cityID: {
            type: String,
            value: ''
        },
        isOversea: {
            type: Boolean,
            value: false
        },
        isLongRent: {
            type: Boolean,
            value: false
        },
        priceInfo: {
            type: Object,
            value: {}
        },
        isHourRoom: {
            type: Boolean,
            value: false
        },
        priceStarXtaroSwitch: {
            type: Boolean,
            value: false
        }
    },
    data: {
        boxClass: '',
        priceSilder: { // 价格滑块
            min: 0,
            max: 0,
            step: 50,
            minValue: 0,
            maxValue: 0,
            temp: {
                minValue: 0, // 临时值，只有确定后才同步至min
                maxValue: 0, // 临时值，只有确定后才同步至max
                text: ''
            }
        },
        psStates: { // 价格浮层信息
            hidden: false,
            psData: {
                price: [],
                star: []
            },
            lastData: {}
        },
        showCnStarLayer: false,
        showOverseaStarLayer: false
    },
    attached () {
        this.initData();
    },
    methods: {
        initData: function () {
            this.handleClass();
            this.setStarData();
            this.setPriceData();
        },
        handleClass: function () {
            let boxClass = '';
            let discBox = 'disc-box';
            let inquireClass = 'global-layer';
            let notInquireClass = 'price-star-c animated fadeInDown';
            const pageFrom = this.properties.pageFrom;
            if (pageFrom === 'inquire') {
                inquireClass += this.properties.isIphoneX ? ' fix-iphonex-border' : '';
                boxClass = inquireClass;
            } else {
                notInquireClass += pageFrom === 'listmap' ? ' ftop-map' : ' filter-topa';
                boxClass = notInquireClass;
            }
            pageFrom === 'list' && (discBox += ' disc-box-list');
            this.setData({
                boxClass,
                discBox
            });
        },
        // 星级区间
        setStarData: function () {
            const isOversea = this.properties.isOversea;
            const priceInfo = this.properties.priceInfo;
            const psData = isOversea ? util.clone(psDefaData.overseasData) : util.clone(psDefaData.cnData);
            this.data.psStates.psData = psData;

            priceInfo && this.setPriceSelectorData(priceInfo, 'star');
            this.setData({
                'psStates.psData': psData
            });
        },
        // 初始化价格滑块+区间
        setPriceData: function () {
            const { priceInfo, cityID, isOversea, isLongRent } = this.properties;
            const psStates = this.data.psStates;
            if (!psStates.hidden) {
                const renderP = (pr, needTrace) => {
                    this.setPriceSliderData(pr);
                    psStates.lastData = util.clone(psStates.psData);
                    psStates.psData.price = util.clone(pr.priceRange);
                    priceInfo && this.setPriceSelectorData(priceInfo, 'price');
                    this.setData({
                        priceSilder: this.data.priceSilder,
                        psStates
                    });

                    if (needTrace) {
                        this.needTraceMap = true;
                    }
                };
                pricestarfunc.resPriceData({
                    cityID,
                    isOversea,
                    isLongRent,
                    callback: renderP
                });
            } else {
                psStates.psData = util.clone(psStates.lastData);
                this.setData({ psStates });
            }
        },
        // 设置控件选中状态
        setPriceSelectorData: function (priceInfo, key) {
            if (!priceInfo[key]?.length) {
                return;
            }
            const psData = this.data.psStates.psData;
            const oldKeyArr = psData[key] || [];
            const newKeyArr = priceInfo[key];
            if (key === 'star') {
                newKeyArr.forEach((item) => {
                    for (let i = 0, n = oldKeyArr.length; i < n; i++) {
                        if (item.key === oldKeyArr[i].key) {
                            oldKeyArr[i].current = true;
                            break;
                        }
                    }
                });
            }
            if (key === 'price') {
                const { min, max } = this.handleMismathPrice(newKeyArr[0].min, newKeyArr[0].max);
                for (let i = 0, n = oldKeyArr.length; i < n; i++) {
                    oldKeyArr[i].current = min === oldKeyArr[i].min && max === oldKeyArr[i].max;
                }
            }
        },
        handleMismathPrice: function (min, max) {
            min = Math.min(+min, this.data.priceSilder.max);
            max = Math.min(+max, this.data.priceSilder.max);
            this.data.priceSilder = this.getPriceSliderData(min, max);
            return { min, max };
        },
        handleMaskClick: function (e) {
            !this.data.psStates.hidden && this.triggerEvent('closeStarFilter', this.needTraceMap);
        },
        /* 价格滑块数据 */
        setPriceSliderData: function (priceRangeInfo) {
            let curMin = 0;
            let curMax = 0;
            const price = this.properties.priceInfo?.price || [];
            if (price.length) {
                curMin = parseInt(price[0].min);
                curMax = parseInt(price[0].max);
            }

            pricestarfunc.setPriceSliderData(priceRangeInfo, this.data.priceSilder, curMin, curMax);
        },
        onPriceLowValueChange: function (e) {
            const priceSilder = this.data.priceSilder;
            const minValue = e.detail.lowValue;
            const maxValue = priceSilder.temp.maxValue;
            if (minValue > maxValue && maxValue !== 0) return;

            priceSilder.temp.minValue = minValue;

            this.updatePriceSelector(minValue, maxValue);
        },
        onPriceHighValueChange: function (e) {
            const priceSilder = this.data.priceSilder;
            const minValue = priceSilder.temp.minValue;
            const maxValue = e.detail.highValue;
            if (minValue > maxValue && maxValue !== 0) return;

            priceSilder.temp.maxValue = maxValue;

            this.updatePriceSelector(minValue, maxValue);
        },
        /* 更新价格模块显示状态 */
        updatePriceSelector: function (min, max) {
            const psStates = this.data.psStates;
            const price = psStates.psData.price || [];
            for (let i = 0, n = price.length; i < n; i++) {
                price[i].current = min === price[i].min && max === price[i].max;
            }
            const priceSilder = this.getPriceSliderData(min, max);
            this.setData({
                priceSilder,
                psStates
            });
            this.priceStarTrace('price', 'slider', priceSilder.temp.text);
        },
        getPriceSliderData: function (min, max) {
            const ps = this.data.priceSilder || {};
            pricestarfunc.getPriceSliderData(min, max, ps);
            return ps;
        },
        /* 重置价格选择控件数据 */
        resetPriceStarSelectorData: function () {
            const psData = this.data.psStates.psData;
            psData.price.forEach((item) => {
                item.current = false;
            });
            psData.star.forEach((item) => {
                item.current = false;
            });
        },
        getDefaultPricestarName: function (isOversea) {
            return `价格/${isOversea ? '钻' : '星'}级`;
        },
        handlePriceChoose: function (e) {
            const psStates = this.data.psStates;
            const psData = psStates.psData;
            const dataset = e.currentTarget.dataset;
            const _idx = dataset.index;
            const properties = this.properties;
            const isOversea = properties.isOversea;
            const pageFromInquire = properties.pageFrom === 'inquire';
            const priceTitle = pageFromInquire ? '' : this.getDefaultPricestarName(isOversea);
            const priceInfo = util.clone(properties.priceInfo) || {};
            let priceSilderData = null;
            const requestFilterInfo = {}; // 请求
            let d = null;
            let isCurrent;
            let min = 0;
            let max = 0;
            switch (dataset.type) {
            case 'price':
                isCurrent = !psData.price[_idx].current;
                if (psData.price[_idx].current) {
                    psData.price[_idx].current = false;
                    min = this.data.priceSilder.min || 0;
                    max = 0;
                } else {
                    psData.price.forEach(function (v, k) {
                        v.current = false;
                    });
                    psData.price[_idx].current = true;
                    min = psData.price[_idx].min;
                    max = psData.price[_idx].max;
                }
                priceSilderData = this.getPriceSliderData(min, max);
                isCurrent && this.priceStarTrace('price', 'label', priceSilderData.temp.text);
                break;
            case 'star':
                isCurrent = !psData.star[_idx].current;
                psData.star[_idx].current = !psData.star[_idx].current;
                isCurrent && this.priceStarTrace('star', '', psData.star[_idx].text);
                break;
            case 'confirm':
                psStates.hidden = true;
                /* eslint-disable */
                let curCount = 0;
                let psStatesName = []; // 选中区间名

                // 处理星级
                const starData = psStates.psData.star || [];
                const curStarFilter = starData.filter((v) => { return v.current; }) || [];
                const curStar = curStarFilter && curStarFilter.map(function (v, k) {
                    return v.key;
                });

                if (curStar.length) {
                    priceInfo.star = curStarFilter;
                    requestFilterInfo.starItemList = curStar;
                    psStatesName = psStatesName.concat(curStarFilter.map((v) => v.text));
                    curCount++;
                } else {
                    priceInfo.star = [];
                    requestFilterInfo.starItemList = [];
                }

                // 处理价格
                const curPrice = [];
                const priceSilder = this.data.priceSilder;
                // 保存选择值
                priceSilder.minValue = priceSilder.temp.minValue;
                priceSilder.maxValue = priceSilder.temp.maxValue;
                const pText = priceSilder.temp.text;
                if (priceSilder.minValue !== 0 || priceSilder.maxValue !== 0) {
                    psStatesName.push(pText);
                    curPrice.push({
                        current: true,
                        key: priceSilder.minValue + '|' + priceSilder.maxValue,
                        min: priceSilder.minValue,
                        max: priceSilder.maxValue,
                        text: pText
                    });
                    curCount++;
                }

                psStates.curCount = curCount;
                requestFilterInfo.lowestPrice = priceSilder.minValue;
                requestFilterInfo.highestPrice = priceSilder.maxValue;
                priceInfo.filtersNum = curCount ? psStatesName.length : 0;

                priceInfo.text = pageFromInquire ? psStatesName.join('、') : priceTitle;
                priceInfo.price = curPrice;
                priceInfo.star = curStarFilter;

                d = { psStates };
                if (pageFromInquire) {
                    d['searchInfo.priceInfo'] = priceInfo;
                } else {
                    psStates.curStateName = priceTitle;
                    d.priceStar = priceInfo;
                    d.requestFilterInfo = requestFilterInfo;
                }
                this.triggerEvent('updateStarFilterData', d);

                /* eslint-enable */
                break;
            case 'reset':
                this.resetPriceStarSelectorData();
                priceSilderData = this.getPriceSliderData(min, max);
                break;
            }
            d = { psStates };
            priceSilderData && (d.priceSilder = priceSilderData);
            this.setData(d);
        },

        // 国内星级、钻级说明
        showStarLayer (e) {
            const { isOversea, priceStarXtaroSwitch } = this.properties;
            const isMainland = isOversea ? 2 : 1;
            const url = `https://m.ctrip.com/webapp/hotel/xtaro/ct/starDiamond?isMainland=${isMainland}&isHideHeader=1`;
            if (priceStarXtaroSwitch) {
                cwx.component.cwebview({
                    data: {
                        url: encodeURIComponent(url),
                        needLogin: false,
                        needWriteCrossTicket: false
                    }
                });
                return;
            }

            if (this.properties.isOversea) {
                this.setData({
                    showOverseaStarLayer: true
                });
            } else {
                this.setData({
                    showCnStarLayer: true
                });
            }
        },
        closeStarlayer (e) {
            this.setData({
                showCnStarLayer: false,
                showOverseaStarLayer: false
            });
        },
        noop: function () {},

        // 埋点
        priceStarTrace: function (type, labeltype = '', labelvalue) {
            try {
                const tPage = cwx.getCurrentPage() || {};
                const isOversea = this.properties.isOversea;
                tPage.ubtTrace && tPage.ubtTrace('htl_c_applet_filterpricestar_click', {
                    subtab: isOversea ? 'oversea' : 'inland',
                    pageid: tPage.pageId,
                    type,
                    labeltype,
                    labelvalue
                });
            } catch (e) {
                // console.error(e);
            }
        }
    }
});
