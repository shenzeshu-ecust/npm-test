import { cwx, CPage, _ } from '../../../cwx/cwx.js';
import keyworddata from './keyworddata.js';
import commonfunc from '../common/commonfunc';
import util from '../common/utils/util.js';
import associatewordtrace from '../common/trace/associatewordtrace';

CPage({
    pageId: 'ignore_page_pv',
    checkPerformance: true, // 白屏检测标志位
    data: {
        cityID: 0,
        did: 0,
        cityName: '',
        keyword: '',
        inday: '',
        outday: '',
        inputingKeyword: '',
        showSearchResult: false, // 展示搜索结果；结果返回后置true
        disableHistory: false, // 屏蔽历史模块
        ubtKey1: 'xcx_cxy_sldj'
    },
    pageStatus: {
        cityID: 2, // 上个页面的city
        did: 0,
        needFeedback: true, // 是否需要返回上一页面
        suggestingTimer: null,
        userLoc: {}, // 定位信息
        fromList: false,
        associateWordList: [], // 埋点使用的搜索词联想埋点
        isHourroomModule: false,
        searchFilter: null // 选搜过滤器
    },
    suggestingCategory: {
        type1: '酒店',
        type2: '品牌',
        type3: '商业区',
        type4: '行政区',
        type5: '地标',
        type6: '地铁线',
        type7: '地铁站',
        type8: '机场车站',
        type9: '集团品牌',
        type10: '景点',
        type11: '城市',
        type12: '景区',
        type21: '旗舰店'
    },
    iconClass: {
        hotkeyword: 'wechat-font-hotkey font-hotkey-color',
        brand: 'wechat-font-brand font-brand-color',
        zone: 'wechat-font-shopping font-shopping-color',
        spot: 'wechat-font-spots font-spots-color',
        airportandtrainstation: 'wechat-font-air font-air-color',
        feature: 'wechat-font-special font-special-color',
        xingzhengqv: 'wechat-font-office font-office-color',
        metrostation: 'wechat-font-train font-train-color',
        university: 'wechat-font-university font-university-color',
        hospital: 'wechat-font-hospital font-hospital-color',
        shopping: 'wechat-font-buy font-buy-color',
        food: 'wechat-font-eating font-eating-color',
        resHotel: 'wechat-font-key-hotel font-reshotel-color',
        resOthers: 'wechat-font-key-search font-resothers-color'
    },
    onLoad: function (options) {
        util.exUbtSendPV(this, { pageId: +options.biz === 1 ? '10650001490' : '10650002403' });

        options = this.convertOptions(options);
        const { inday, outday, cityid: cityID, did, displayText, isHourroomModule, feedback, userCityId, lat, lng, from, nohistory, cityname, keyword } = options.data;
        const pageS = this.pageStatus;
        pageS.cityID = cityID;
        pageS.did = did;
        pageS.displayText = displayText;
        pageS.isHourroomModule = isHourroomModule;
        pageS.needFeedback = !(feedback === '0');
        const userLoc = pageS.userLoc;
        userLoc.userCityId = userCityId;
        userLoc.lat = lat;
        userLoc.lng = lng;

        if (from === 'list') {
            this.setData({
                ubtKey1: 'xcx_lby_sldj'
            });
            pageS.fromList = true;
        }

        this.setData({
            cityID,
            did,
            inday,
            outday,
            disableHistory: nohistory === '1',
            cityName: cityname,
            keyword: keyword || ''
        });
    },
    onScroll: util.throttle(function () {
        const { associateScrollTrace, associateWordList, associateTraceParams } = this.pageStatus;
        if (!associateScrollTrace && associateWordList.length > 9 && associateTraceParams) {
            this.pageStatus.associateScrollTrace = true;
            associatewordtrace.keywordTrace(this, {
                key: 209276,
                ...associateTraceParams,
                associateWordList: associateWordList.slice(9)
            });
        }
    }),
    convertOptions: function (options) {
        if (options && !options.data) {
            const od = util.clone(options);
            options.data = od;
        }

        return options;
    },
    inputKeyword: function (e) {
        const key = e.detail.value.trim();
        this.setDataAsync({
            inputingKeyword: e.detail.value
        });
        this.suggesting(key);
    },
    clearKeyword: function (e) {
        this.setDataAsync({
            keyword: '',
            inputingKeyword: '',
            showSearchResult: false,
            suggestingResult: {
                hasResult: false,
                key: '',
                items: []
            }
        });
    },
    /* 搜索输入框值 */
    searchInputValue: function (e) {
        const word = this.data.inputingKeyword;
        const wordTrim = word.trim();
        if (word && !wordTrim) {
            this.clearKeyword();
        }
        if (wordTrim) {
            commonfunc.setKeywordStorage(this.data.cityID, wordTrim);
            this.search(wordTrim);
        }
        this.clickSearchListTrace();
    },
    onSearchHotKeyword: function (e) {
        this.searchKeyword(e.detail);
    },
    handleSearchKeyword: function (e) {
        const dt = e.currentTarget.dataset;
        this.searchKeyword(dt);
        this.associateWordClickTrace(dt);
    },
    /* 搜索关键字 */
    searchKeyword: function (dt = {}) {
        const { val, hotelid: hotelID, key, cityid, did, dtype, filter } = dt;
        this.pageStatus.searchFilter = filter;
        let keyword = val;
        let keyInfo = key;
        const isScenicArea = +did > 0 && +dtype === 12; // 选择景区
        try {
            this.ubtTrace('143529', {
                keyword,
                pageid: this.pageId
            });
        } catch (err) {
            // ignore
        }
        const poiTypeArr = [1, 5, 7, 8, 10];
        poiTypeArr.includes(+dtype) && (this.pageStatus.isPOI = true);

        if (isScenicArea) {
            keyword = '';
            keyInfo = '';
        }
        commonfunc.setKeywordStorage(this.data.cityID, keyword, hotelID, keyInfo);
        if (hotelID && cityid && !this.pageStatus.fromList) { // to list
            this.goToList(keyword, cityid, did);
        } else { // back
            let cityInfo = {};
            // eslint-disable-next-line
            const cityChanged = cityid && (cityid !== this.pageStatus.cityID || this.pageStatus.did !== did) && cityid != -1; // 切换目的地
            if (cityChanged) {
                cityInfo = Object.assign({
                    cityChanged,
                    cityId: cityid,
                    cityName: dt.cityname,
                    did,
                    type: dt.oversea === 1 ? 2 : 1,
                    isGeo: false,
                    key: keyInfo,
                    name: val,
                    dtype
                }, cityInfo);
            }
            this.search(keyword, keyInfo, cityInfo);
        }
    },

    search (keyword, key, cityInfo) {
        const ps = this.pageStatus;
        if (ps.needFeedback) {
            const p = {
                keyword,
                key,
                isPOI: !!ps.isPOI,
                cityInfo,
                searchFilter: ps.searchFilter
            };
            this.invokeCallback(p);
            this.navigateBack();
        } else { // 跳列表
            this.goToList(keyword);
        }
    },

    goToList (keyword, cityID, did) {
        const ps = this.pageStatus;
        const { inday, outday } = this.data;
        if (!cityID) {
            cityID = ps.cityID;
        }
        let linkUrl = `/pages/hotel/list/index?cityid=${cityID}`;

        if (+did === +ps.did) { // 匹配当前景区下酒店
            linkUrl += `&did=${did}&displayText=${ps.displayText}`;
        }
        if (inday) {
            linkUrl += `&inday=${inday}`;
        }
        if (outday) {
            linkUrl += `&outday=${outday}`;
        }
        if (keyword) {
            linkUrl += `&keyword=${keyword}`;
        }
        if (ps.isPOI) {
            linkUrl += '&isPOI=1';
        }
        !ps.fromList && (linkUrl += '&from=keyword');

        if (ps.searchFilter) {
            linkUrl += `&searchfilter=${JSON.stringify(ps.searchFilter)}`;
        }
        cityID !== ps.cityID && (linkUrl += '&needupdatecity=1');

        cwx.redirectTo({
            url: linkUrl
        });
    },
    /**
     * 关键词联想服务
     */
    setSuggestingInfo (keyword) {
        if (!this.data.inputingKeyword) return;

        const { did, inday, outday } = this.data;
        const ps = this.pageStatus;
        const userLoc = ps.userLoc;
        const p = {
            cityID: ps.cityID,
            did,
            keyword,
            inday,
            outday,
            userCityId: userLoc.userCityId,
            lat: userLoc.lat,
            lng: userLoc.lng,
            isHourroomModule: ps.isHourroomModule,
            from: this.pageStatus.fromList ? 2 : 1
        };
        const suggestingItems = [];
        keyworddata.keywordAssociation(p, (res) => {
            const thisCityRes = res.keywordList || [];
            const otherCityRes = res.otherCityKeywordList || [];
            if (thisCityRes.length) {
                suggestingItems.push(this.citySuggestingData(thisCityRes, true));
            } else {
                suggestingItems.push([]);
            }
            if (otherCityRes.length) {
                suggestingItems.push(this.citySuggestingData(otherCityRes, false));
            }
            const requestId = commonfunc.getResponseLogId(res, 'request-id');
            this.associateWordShowTrace(keyword, suggestingItems, requestId);

            this.setDataAsync({
                suggestingResult: {
                    hasResult: !!(thisCityRes.length || otherCityRes.length),
                    key: keyword,
                    items: suggestingItems
                },
                showSearchResult: true,
                isHourroomModule: ps.isHourroomModule
            });
        }, () => {
            this.setDataAsync({
                showSearchResult: true,
                suggestingResult: {
                    hasResult: false,
                    key: keyword,
                    items: suggestingItems
                }
            });
        });
    },
    // 联想词曝光埋点
    associateWordShowTrace: function (keyword, suggestingItems, requestId) {
        const ps = this.pageStatus;
        const flattenItems = _.flatten(suggestingItems) || [];
        if (!flattenItems.length) return;
        ps.associateScrollTrace = false;
        ps.associateTraceParams = {
            pageId: this.pageId,
            keyword,
            cityId: ps.cityID,
            destination: '',
            destinationType: '',
            keywordTracelogid: requestId,
            isCompensationRec: 'F' // 是否为补偿推荐
        };
        ps.associateWordList = flattenItems.map((item, index) => {
            const { text, catg, dtype, nameEN = '', resDesc = '' } = item;
            return [index, text, catg, dtype, '', nameEN + resDesc];
        }).map(item => item.join(','));

        associatewordtrace.keywordTrace(this, {
            key: 209276,
            ...ps.associateTraceParams,
            associateWordList: ps.associateWordList.slice(0, 9)
        });
    },
    // 联想词点击埋点
    associateWordClickTrace: function (dataset) {
        const ps = this.pageStatus;
        const { cityid, dtype, idx, cityidx } = dataset;
        const suggestingResult = this.data.suggestingResult?.items || [];
        const keywordList = suggestingResult[0]?.length || 0;
        const index = cityidx === 0 ? idx : keywordList + idx;
        associatewordtrace.keywordTrace(this, {
            key: 209343,
            ...ps.associateTraceParams,
            destination: cityid,
            destinationType: this.suggestingCategory[`type${dtype}`],
            associateWordList: ps.associateWordList[index]
        });
    },
    /**
     * 联想结果整理
     */
    citySuggestingData (resList, isThisCity) {
        const resultList = [];
        const iconClass = commonfunc.featureIconClass();
        resList.forEach((item) => {
            const htlInfo = item.hotelInfo || {};
            // 评分、地区等描述
            const descArr = [];
            htlInfo.customerPoint && descArr.push(`${htlInfo.customerPoint}分`);
            !isThisCity && item.type === 1 && descArr.push(item.cityName);
            if (item.type === 1) {
                if (htlInfo.distance) {
                    descArr.push(htlInfo.distance);
                } else {
                    htlInfo.zoneName && descArr.push(htlInfo.zoneName);
                }
            } else {
                item.address && descArr.push(item.address);
            }
            // 起价
            const startPrice = htlInfo.startPrice || {};
            const priceObj = {
                price: parseInt(startPrice?.price) || 0,
                tax: startPrice.tax || ''
            };
            // 分类
            const categoryIdx = 'type' + item.type;

            resultList.push({
                id: htlInfo.hotelID || htlInfo.hotelId || 0,
                key: item.key,
                text: item.name,
                catg: this.suggestingCategory[categoryIdx],
                price: priceObj,
                iconc: item.type === 1 ? iconClass.resHotel : iconClass.resOthers,
                parts: this.getSuggestingItemParts(item.displayTexts[0]),
                city: item.cityName,
                cityID: item.cityId,
                overSea: ~~item.isOversea,
                nameEN: item.displayTexts[1],
                did: ~~item.districtId,
                dtype: ~~item.type,
                resDesc: descArr.join(' / '),
                displayTexts: item.displayTexts,
                filter: item.item.data
            });
        });

        return resultList;
    },
    suggesting: function (keyword) {
        if (!keyword) { // clear old data.
            this.setDataAsync({
                showSearchResult: false,
                suggestingResult: {
                    hasResult: false,
                    key: '',
                    items: []
                }
            });
            return;
        }

        clearTimeout(this.pageStatus.suggestingTimer);
        this.pageStatus.suggestingTimer = setTimeout(() => {
            this.setSuggestingInfo(keyword);
        }, 500);
    },
    getSuggestingItemParts: function (name) {
        const parts = [];
        if (name) {
            const keyword = this.data.inputingKeyword || '';
            const re = new RegExp(this.escapeRegExp(keyword), 'gi');
            const separator = '|~|';
            const processStr = name.replace(re, matchValue => separator + matchValue + separator);
            const pArr = processStr.split(separator) || [];
            pArr.forEach(function (item) {
                item && parts.push({
                    name: item,
                    isValueEqual: item.toLowerCase() === keyword.toLowerCase()
                });
            });
        }

        return parts;
    },

    escapeRegExp: function (str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    setDataAsync: function (data) {
        const self = this;
        if (!this.__delayData) {
            this.__dataTimer = 1;
            this.__delayData = [{}];
        }
        this.data = _.assignIn(this.data, data);
        this.__delayData.push(data);

        clearTimeout(this.__dataTimer);
        this.__dataTimer = setTimeout(() => {
            self.setData(_.assignIn.apply(_, self.__delayData));
            self.__delayData = null;
        }, 0);
    },
    /* Empty method, do nothing */
    noop () { },
    // 搜索列表点击埋点
    clickSearchListTrace () {
        associatewordtrace.searchListClick(this, {
            page: this.pageId,
            triggerTime: new Date().getTime()
        });
    }
});
