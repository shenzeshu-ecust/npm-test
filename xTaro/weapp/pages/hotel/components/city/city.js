import { cwx, CPage } from '../../../../cwx/cwx.js';
import hPromise from '../../common/hpage/hpromise';

import storage from '../../common/utils/storage.js';
import util from '../../common/utils/util.js';
import cityModel from '../../common/city/index.js';
import commonfunc from '../../common/commonfunc';
import locatefailedTrace from '../../common/trace/locatefailedtrace.js';
import associatewordtrace from '../../common/trace/associatewordtrace';
// citylist.js
let originInlandCities = null;
let originInterCities = null;
let selectedCities = null;
let currentCityLength = 0;

CPage({
    pageId: '10650004235',
    checkPerformance: true, // 白屏检测标志位
    data: {
        title: '城市选择',
        hotSearchTitle: '', // 当地热搜
        isShowCurrentPosition: true,
        isFoldShow: false,
        currentTab: 0, // 0-tab选中国内;1-选中海外
        currentCity: {
            cityName: '定位中...'
        },
        locationType: 0, // 0定位中，1定位成功，2定位失败
        toView: 'positon',
        searchValue: '',
        isSearchView: false,
        inputKeyword: '',
        hourroom: 0,
        loadDataFinish: false,
        currentTag: '',
        currentAppend: '',
        showInter: false,
        cityTags: [], // 默认的索引
        selectedCity: '', // 选择的城市
        holderText: '全球城市/区域/位置/酒店名',
        currentIndexTag: '', // 当前点击索引id
        currentIndexVal: '', // 当前点击索引value
        currentIndexTagHidden: true,
        isIphoneX: util.isIPhoneX(), // 是否为iPhoneX
        displayHotSearch: false // 当地热搜
    },
    pageStatus: {
        associateScrollTrace: false, // 联想词是否滚动埋点
        associateWordList: [], // 埋点使用的联想词埋点字段
        suggestingTimer: null,
        fromList: false,
        showLoading: false // 判断showLoading方法是否执行中
    },
    indexBarInfo: { // 右侧字母索引列表信息
        inland: null,
        oversea: null,
        touchStartY: 0,
        touchStartTag: '',
        spacing: 0,
        timer: null
    },
    searchModel: {},

    onReady: function () {
        cwx.setNavigationBarTitle({
            title: this.title
        });
        this.loadData((cityData) => {
            this._onDataLoaded(cityData);
        });
        this.initSpacingCalc();
        this.getHistoryWidth();
    },
    onLoad: function (options) {
        this._showLoading();

        const d = options.data;
        const sModel = this.searchModel;
        const sp = d.searchParams;
        let isHourroomModule = false;
        let checkin = '';
        let checkout = '';
        if (sp) {
            checkin = sp.checkin || '';
            checkout = sp.checkout || '';
            if (sp.userCityId && sp.userLat) {
                this.pageStatus.userCityId = sp.userCityId;
                sModel.user = {
                    cityId: sp.userCityId,
                    lat: sp.userLat,
                    lng: sp.userLng
                };
            }
            sp.fromList && (this.pageStatus.fromList = true);
            isHourroomModule = sp.isHourroomModule;
        }

        this.title = d.title || this.data.title;
        let isFoldShow = this.data.isFoldShow;
        if (typeof d.isFoldShow !== 'undefined') {
            isFoldShow = d.isFoldShow;
        }
        let isShowCurrentPosition = this.data.isShowCurrentPosition;
        if (typeof d.isShowCurrentPosition !== 'undefined') {
            isShowCurrentPosition = d.isShowCurrentPosition;
        }
        let selectedCityName = d.selectedCityName;
        selectedCityName = selectedCityName || '';

        this.setData({
            checkin,
            checkout,
            isFoldShow,
            isShowCurrentPosition,
            loadDataFinish: false,
            selectedCity: selectedCityName,
            isHourroomModule
        });
        this.loadData = d.loadData || function () { };
        this.data.handleCurrentPosition = d.handleCurrentPosition;
        this.beginLocate(false);
        commonfunc.monitorPrivacyAuthorize();
    },

    onUnload: function () {
        this._hideLoading();
    },

    onScroll: util.throttle(function () {
        const { associateScrollTrace, associateTraceParams, associateWordList = [] } = this.pageStatus;
        if (!associateScrollTrace && associateWordList.length > 7 && associateTraceParams) {
            this.pageStatus.associateScrollTrace = true;
            associatewordtrace.destinationTrace(this, {
                key: 209275,
                ...associateTraceParams,
                associateWordList: associateWordList.slice(7)
            });
        }
    }),

    getHistoryWidth: function () {
        const self = this;
        const historyCities = (self.data.currentTabCities && self.data.currentTabCities.historyCities) || [];
        if (historyCities.length > 0) {
            for (let i = 0; i < historyCities.length; i++) {
                wx.createSelectorQuery().select(`#width_${i}`).boundingClientRect((res) => {
                    if (res && res.width > 80) {
                        historyCities[i].isFontChange = 'city-module_name2';
                    }
                    self.data.currentTabCities.historyCities = historyCities;
                    this.setData({
                        currentTabCities: self.data.currentTabCities
                    });
                }).exec();
            }
            try {
                this.ubtTrace && this.ubtTrace(204502, {
                    pageId: '10650004235'
                });
            } catch {
                // do nothing
            }
        }
    },

    locateAgain (e) {
        this.beginLocate(true);
    },
    /**
     * @param {*} showLocateDialog 是否走失败原因弹窗提示
     */
    beginLocate (showLocateDialog, callback) {
        this.setData({
            locationType: 0,
            currentCity: { cityName: '定位中...' }
        });

        const cache = cwx.locate.getCachedGeoPoint();
        const success = function (resp) {
            callback && callback();
            if (typeof this.data.handleCurrentPosition === 'function') {
                this.data.handleCurrentPosition(resp, this._onHandleCurrentPosition);
            }
        }.bind(this);

        if (cache) {
            success(cache);
            return;
        }
        const that = this;
        cwx.locate.startGetGeoPoint({
            success,
            fail: function (e) {
                if (showLocateDialog) {
                    const failMsg = (e && e.errMsg) || '';
                    commonfunc.afterLocateFailed(that, failMsg, () => {
                        wx.openSetting({
                            success (res) {
                                if (res.authSetting['scope.userLocation']) {
                                    that.beginLocate(true, () => {
                                        locatefailedTrace.locateFailtoSuccessTrace(that, {
                                            location_failure: '未授权小程序',
                                            is_success: 'T'
                                        });
                                    });
                                };
                            }
                        });
                    }, 'city');
                    that.setData({
                        locationType: 2,
                        currentCity: { cityName: '定位失败，请重新定位' }
                    });
                } else {
                    that._onHandleCurrentPosition(null);
                }
                // eslint-disable-next-line
                console.log('cwx.locate.startGetGeoPoint error ', e);
            }
        });
    },
    keyboardSearch (e) {
        if (!this.data.searchResult) return;

        const selectCity = this.data.searchResult[0];
        this.invokeCallback(selectCity);
        this.navigateBack();
    },
    cityTap: function (e) {
        this.processingCityTap(e.currentTarget.dataset);
        this.associateWordClickTrace(e.currentTarget.dataset.row);
    },
    onSearchHotKeyword (e) {
        const detail = e.detail;
        const currentCity = this.data.currentCity;
        this.processingCityTap({
            section: 'hotkeywordsearch',
            hotelid: detail.hotelid,
            cityid: currentCity.cityId,
            poival: detail.val
        });

        try {
            this.ubtTrace('143529', {
                keyword: detail.val,
                pageid: this.pageId
            });
        } catch (err) {
            // ignore
        }
    },
    handleHeadTabClick (e) {
        const dataset = e.target.dataset;
        const selectTab = dataset.tab;
        if (this.data.currentTab === selectTab) return;

        if (selectTab === 3) {
            this.setData({
                currentTab: selectTab,
                displayHotSearch: true
            });
        } else if (selectTab === 0 || selectTab === 1) {
            selectedCities = originInlandCities;
            if (selectTab === 1) {
                selectedCities = originInterCities;
            }
            currentCityLength = 0;

            this.data.currentTab = selectTab;
            this.data.currentAppend = selectedCities.cityTags[0];
            this.data.currentTabCities = null;
            let currentTabCities = null;
            do {
                currentTabCities = this._appendNextSection(this.data.currentAppend);
                // eslint-disable-next-line
            } while (currentCityLength < 30 && currentTabCities != null);

            if (currentTabCities) {
                this.setData({
                    currentAppend: this.data.currentAppend,
                    currentTab: selectTab,
                    currentTabCities,
                    cityTags: selectedCities.cityTags
                });
                this.setData({
                    toView: this.data.currentAppend
                });
            }
            this.getHistoryWidth();
        }
    },

    searchInput: function (e) {
        const value = e.detail.value || '';
        let hourroom = 0;
        if (this.data.currentTab === 2) { /* 钟点房currentTab = 2, 城市搜索只支持搜酒店名称 */
            hourroom = 1;
        }
        const regex = /^[0-9a-zA-Z\s]+$/g;
        this.setData({
            inputKeyword: value,
            hourroom,
            isInputValueEn: regex.test(value)
        });

        clearTimeout(this.pageStatus.suggestingTimer);
        this.pageStatus.suggestingTimer = setTimeout(function () {
            // 搜索联想服务
            const sModel = this.searchModel;
            sModel.word = this.data.inputKeyword;
            sModel.hourroom = this.data.hourroom;
            this.searchSuggestion(sModel, this._onHandleSearchResult);
        }.bind(this), 500);
    },
    gotoSearch: function (e) {
        if (this.data.isSearchView) {
            return;
        }
        this.setData({
            isSearchView: true
        });
    },
    searchClear: function (e) {
        this.setData({
            inputKeyword: ''
        });
        this._onHandleSearchResult([]);
    },
    searchCancel: function (e) {
        this.setData({
            isSearchView: false,
            inputKeyword: ''
        });
        this._onHandleSearchResult([]);
        wx.hideKeyboard();
    },

    tagTap: function (e) {
        const citytag = e.currentTarget.dataset.citytag;
        if (this.data.isFoldShow) {
            this.setData({
                currentTag: citytag
            });
        }
        this.data.currentAppend = citytag;
        const currentTabCities = this._appendNextSection(this.data.currentAppend);
        if (currentTabCities) {
            this.setData({
                currentAppend: this.data.currentAppend,
                currentTabCities
            });
        }
        this.setData({
            toView: citytag
        });
    },

    tagTouchStart: function (e) {
        const dataset = e.currentTarget.dataset;
        const cityTag = dataset.citytag;
        const val = dataset.val;
        this.indexBarInfo.touchStartY = e.touches[0].pageY;
        this.indexBarInfo.touchStartTag = cityTag;
        this.tipCurrentTag(cityTag, val);
    },
    tagTouchMove: function (e) {
        const pageY = e.touches[0].pageY;
        const toTag = this.calcCurrentMoveTag(pageY);
        if (toTag && toTag !== this.data.currentIndexTag) {
            const newTagInfo = this.findIndexTagByKey(toTag);
            newTagInfo && this.tipCurrentTag(newTagInfo.key, newTagInfo.val);
        }
    },
    tagTouchCancel: function (e) {
        this.setToView(this.data.currentIndexTag);
    },
    tagTouchEnd: function (e) {
        this.setToView(this.data.currentIndexTag);
    },
    processingCityTap (dataset) {
        const poiVal = dataset.poival || ''; // 联想结果首个城市的6个POI
        const cityName = dataset.cityname;
        const hotelId = dataset.hotelid;
        const section = dataset.section;
        const row = dataset.row;
        let selectCity;
        const cityID = dataset.cityid;
        const { checkin, checkout } = this.data;

        // 酒店到list（list页过来走回退）
        if (hotelId && cityID && !this.pageStatus.fromList) {
            let url = `/pages/hotel/list/index?cityid=${cityID}`;
            checkin && (url += `&inday=${checkin}`);
            checkout && (url += `&outday=${checkout}`);
            dataset.keyword && (url += `&keyword=${dataset.keyword}`);
            cityID !== this.data.currentCity.cityId && (url += '&needupdatecity=1');

            cwx.redirectTo({
                url
            });
            return;
        }

        if (this.data.currentCity.cityName === cityName) {
            const tempCity = this.data.currentCity;
            this.invokeCallback(tempCity);
            this.navigateBack();
            return;
        }
        switch (section) {
        case 'historyCities':
            this.data.currentTabCities.historyCities[row].fromhistory = 1;
            selectCity = this.data.currentTabCities.historyCities[row];
            break;
        case 'hotCities':
            selectCity = this.data.currentTabCities.hotCities[row];
            break;
        case 'search': // 搜索结果点击
            selectCity = this.data.searchResult[row];
            if (poiVal) {
                selectCity.name = poiVal;
                selectCity.dtype = null;
            }
            break;
        case 'hotkeywordsearch':
            selectCity = this.data.currentCity;
            selectCity.isGeo = false;
            selectCity.name = poiVal;
            // 当地热搜关键字点击需要trim掉空格，否则历史搜索模块可能会出现两个一样的城市
            selectCity.cityName = selectCity.cityName.trim();
            selectCity.address = '';
            break;
        default:
            selectCity = this.data.currentTabCities.cityMainList[section][row];
            break;
        }

        this.invokeCallback(selectCity);
        this.navigateBack();
    },
    tipCurrentTag: function (tagId, displayValue) {
        wx.vibrateShort();
        this.setData({
            currentIndexTag: tagId,
            currentIndexVal: displayValue,
            currentIndexTagHidden: false
        });

        clearTimeout(this.indexBarInfo.timer);
        this.indexBarInfo.timer = setTimeout(() => {
            this.setData({
                currentIndexTagHidden: true
            });
        }, 800);
    },
    calcCurrentMoveTag: function (curPageY) {
        let rs = '';
        const spacing = this.indexBarInfo.spacing;
        if (spacing) {
            const currentIndexTag = this.indexBarInfo.touchStartTag;
            const currentIndices = this.getCurrentIndices();
            const touchStartY = this.indexBarInfo.touchStartY;
            const moveCount = Math.floor(Math.abs((touchStartY - curPageY) / spacing));
            if (moveCount > 0) {
                const isMoveUp = curPageY < touchStartY;
                const maxLent = currentIndices.length;
                let curTagIdx = 0;
                for (let i = 0; i < maxLent; i++) {
                    if (currentIndexTag === currentIndices[i].key) {
                        curTagIdx = i;
                        break;
                    }
                }
                if (isMoveUp) {
                    rs = currentIndices[Math.max(curTagIdx - moveCount, 0)].key;
                } else {
                    rs = currentIndices[Math.min(curTagIdx + moveCount, maxLent - 1)].key;
                }
            } else {
                rs = currentIndexTag;
            }
        }

        return rs;
    },
    setToView: function (citytag) {
        if (this.data.isFoldShow) {
            this.setData({
                currentTag: citytag
            });
        }
        this.data.currentAppend = citytag;
        const currentTabCities = this._appendNextSection(this.data.currentAppend);
        if (currentTabCities) {
            this.setData({
                currentAppend: this.data.currentAppend,
                currentTabCities
            });
        }
        this.setData({
            toView: citytag
        });
    },
    initSpacingCalc: function () {
        let spacing = 14; // default value
        const cityTags = this.data.cityTags;
        if (cityTags && cityTags.length > 1) {
            const tag0 = cityTags[0];
            const tag1 = cityTags[1];
            const tasks = [];
            tasks.push(
                // eslint-disable-next-line
                new hPromise((resolve, reject) => {
                    const query = wx.createSelectorQuery();
                    query.select(`#idx_${tag0}`).boundingClientRect((res) => {
                        if (res) {
                            resolve(res.top);
                        }
                    }).exec();
                })
            );

            tasks.push(
                // eslint-disable-next-line
                new hPromise((resolve, reject) => {
                    const query = wx.createSelectorQuery();
                    query.select(`#idx_${tag1}`).boundingClientRect((res) => {
                        if (res) {
                            resolve(res.top);
                        }
                    }).exec();
                })
            );

            hPromise.all(tasks)
                .then((result) => {
                    this.indexBarInfo.spacing = spacing = result[1] - result[0];
                });
        } else {
            this.indexBarInfo.spacing = spacing;
        }
    },
    getCurrentIndices: function () {
        const data = this.data;
        const prop = data.currentTab === 0 ? 'inland' : 'oversea';
        let indices = this.indexBarInfo[prop];

        if (!indices) {
            const indexArr = [];
            // 当前位置
            if (data.isShowCurrentPosition && data.currentCity.cityName.length) {
                indexArr.push({
                    key: 'positon',
                    val: '当前'
                });
            }

            // 历史
            if (data.currentTabCities.historyCities.length) {
                indexArr.push({
                    key: 'history',
                    val: '历史'
                });
            }

            // 热门
            if (data.currentTabCities.hotCities && data.currentTabCities.hotCities.length) {
                indexArr.push({
                    key: 'hot',
                    val: '热门'
                });
            }

            // 字母索引
            if (data.cityTags) {
                data.cityTags.forEach((item) => {
                    indexArr.push({
                        key: item,
                        val: item
                    });
                });
            }

            this.indexBarInfo[prop] = indexArr;
            indices = indexArr;
        }

        return indices;
    },

    findIndexTagByKey: function (key) {
        let rs = null;
        const prop = this.data.currentTab === 0 ? 'inland' : 'oversea';
        const indices = this.indexBarInfo[prop];
        if (indices) {
            for (let i = 0, n = indices.length; i < n; i++) {
                if (key === indices[i].key) {
                    rs = indices[i];
                    break;
                }
            }
        }

        return rs;
    },

    _trimeData: function (data) {
        originInlandCities = data.inlandCities;
        originInterCities = data.interCities;
        // 保护
        originInlandCities.historyCities = originInlandCities.historyCities || [];
        originInterCities.historyCities = originInterCities.historyCities || [];

        const inlandCityTags = [];
        for (const key in originInlandCities.cityMainList) {
            const citys = originInlandCities.cityMainList[key];
            if (citys.length > 0) {
                inlandCityTags.push(key);
            } else {
                delete originInlandCities.cityMainList[key];
            }
        }
        originInlandCities.cityTags = inlandCityTags;

        const interCityTags = [];
        for (const key in originInterCities.cityMainList) {
            const citys = originInterCities.cityMainList[key];
            if (citys.length > 0) {
                interCityTags.push(key);
            } else {
                delete originInterCities.cityMainList[key];
            }
        }

        originInterCities.cityTags = interCityTags;

        const type = data.type || '';
        selectedCities = (type === 'oversea') ? originInterCities : originInlandCities;

        this.data.currentAppend = inlandCityTags && inlandCityTags.length && inlandCityTags[0];// 追加默认第一组
    },
    _appendNextSection: function (currentAppend) {
        // console.log("append....... ", currentAppend);
        let currentTabCities = this.data.currentTabCities;
        if (!currentTabCities) {
            currentTabCities = cwx.util.copy(selectedCities);
            currentTabCities.cityMainList = {};
            currentTabCities.cityTags = [];
        }
        const index = selectedCities.cityTags.indexOf(currentAppend);
        // eslint-disable-next-line
        if (index == -1 || currentTabCities.cityMainList[currentAppend] || currentTabCities.cityTags.indexOf(currentAppend) != -1) {
            // console.log("_appendNextSection error：未找到正确的索引");
            return null;
        }
        // 追加要显示的city section
        const cities = selectedCities.cityTags;
        for (let i = 0; i < cities.length; i++) {
            if (i <= index) {
                const append = cities[i];
                // eslint-disable-next-line
                if (!currentTabCities.cityMainList[append] && currentTabCities.cityTags.indexOf(append) == -1) {
                    const tmpCity = selectedCities.cityMainList[append];
                    currentCityLength += tmpCity.length; // 追加长度
                    currentTabCities.cityMainList[append] = tmpCity;
                    currentTabCities.cityTags.push(append);
                }
            }
        }
        if (index < selectedCities.cityTags.length - 1) {
            this.data.currentAppend = selectedCities.cityTags[index + 1];
        }

        return currentTabCities;
    },
    _onDataLoaded: function (data) {
        this._hideLoading();

        currentCityLength = 0;
        const type = data.type || '';

        let currentTab = 0;
        if (type === 'oversea') {
            currentTab = 1;
        } else if (type === 'hourroom') {
            currentTab = 2;
        } else {
            currentTab = 0;
        }
        // let currentTab = (type === 'oversea') ? 1 : 0;
        // 过滤掉空的数据
        this._trimeData(data);
        let currentTabCities = null;
        do {
            currentTabCities = this._appendNextSection(this.data.currentAppend);
            // eslint-disable-next-line
        } while (currentCityLength < 30 && currentTabCities != null);

        this.data.loadDataFinish = true;
        if (currentTabCities) {
            this.setData({
                currentAppend: this.data.currentAppend,
                loadDataFinish: this.data.loadDataFinish,
                currentTabCities,
                // eslint-disable-next-line
                showInter: (originInterCities.cityTags.length != 0),
                cityTags: selectedCities.cityTags,
                currentTab
            });
        }
    },
    handlerScrollLower: function (e) {
        const currentTabCities = this._appendNextSection(this.data.currentAppend);
        if (currentTabCities) {
            this.setData({
                currentTabCities
            });
        }
    },
    searchSuggestion: function (params, callback) {
        const self = this;
        cityModel.doSearch(params, function (searchResult, res) {
            callback && callback(searchResult);
            const requestId = commonfunc.getResponseLogId(res, 'request-id');
            self.associateWordShowTrace(searchResult, requestId);
        });
    },
    // 联想词曝光埋点
    associateWordShowTrace: function (res = [], requestId) {
        if (!res.length) return;
        const ps = this.pageStatus;
        ps.associateTraceParams = {
            pageId: this.pageId,
            keyword: this.data.inputKeyword,
            cityId: ps.userCityId || 2,
            keywordTracelogid: requestId
        };
        ps.associateScrollTrace = false;

        // 构造埋点字段associateWordList：['索引,联想词,联想词类型,newtypeid,'',联想词描述']
        const associateWordList = res.map((item, index) => {
            const { isOversea, nameEn = '', name = '', typeName, dtype, newDisplayText = '' } = item;
            const keyword = isOversea ? nameEn : name;
            return [index, keyword, typeName, dtype, '', newDisplayText];
        });
        ps.associateWordList = associateWordList.map(item => item.join(','));
        associatewordtrace.destinationTrace(this, {
            key: 209275,
            ...ps.associateTraceParams,
            associateWordList: ps.associateWordList.slice(0, 7)
        });
    },
    // 联想词点击埋点
    associateWordClickTrace: function (index) {
        const ps = this.pageStatus;
        associatewordtrace.destinationTrace(this, {
            key: 209273,
            ...ps.associateTraceParams,
            associateWordList: ps.associateWordList[index]
        });
    },
    _onHandleSearchResult: function (data) {
        this.setData({
            searchResult: data
        });
    },
    _onHandleCurrentPosition: function (data) {
        if (data === null) {
            this.setData({
                locationType: 2,
                currentCity: { cityName: '定位失败，请重新定位' }
            });
            return;
        }

        let hotSearchTitle = this.data.hotSearchTitle;
        if (data.cityId && data.cityName) {
            hotSearchTitle = data.cityName.trim() + '热搜';
        }
        this.setData({
            currentCity: data,
            locationType: 1,
            hotSearchTitle
        });
    },
    _showLoading () {
        if (!this.pageStatus.showLoading) {
            this.pageStatus.showLoading = true;
            cwx.showLoading({ title: '加载中..' });
        }
    },
    _hideLoading () {
        this.pageStatus.showLoading = false;
        cwx.hideLoading();
    },
    clearHistory (e) {
        if (this.data.currentTab === 0) {
            originInlandCities.historyCities = [];
            storage.setStorage('P_HOTEL_CITY_HISTORY_INLAND', null);
        } else {
            originInterCities.historyCities = [];
            storage.setStorage('P_HOTEL_CITY_HISTORY_OVERSEA', null);
        }
        this.setData({
            'currentTabCities.historyCities': []
        });
        try {
            this.ubtTrace && this.ubtTrace(204503, {
                pageId: '10650004235'
            });
        } catch {
            // do nothing
        }
    }
});
