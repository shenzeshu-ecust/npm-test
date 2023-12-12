import { cwx, CPage } from '../../../cwx/cwx.js';
import hPromise from '../common/hpage/hpromise';
import storage from '../common/utils/storage.js';
import util from '../common/utils/util.js';
import cityModel from '../common/city/index.js';
import urlUtil from '../common/utils/url';

let selectedCities = null;
let currentCityLength = 0;
const HOTEL_LIST_CITIES = 'hotelCities'; // 缓存，与列表使用相同名字，todo:可放到common.c中

CPage({
    pageId: '10650004236',
    data: {
        hotSearchTitle: '', // 当地热搜
        currentTab: 0, // 0-tab选中国内;1-选中海外
        toView: 'positon',
        searchValue: '',
        isSearchView: false,
        inputKeyword: '',
        loadDataFinish: false,
        currentTag: '',
        currentAppend: '',
        showInter: false,
        cityTags: [], // 默认的索引
        holderText: '全球城市/区域/位置/酒店名',
        currentIndexTag: '', // 当前点击索引id
        currentIndexVal: '', // 当前点击索引value
        currentIndexTagHidden: true,
        isIphoneX: util.isIPhoneX(), // 是否为iPhoneX
        displayHotSearch: false // 当地热搜
    },
    pageStatus: {
        suggestingTimer: null,
        inlandCities: {},
        interCities: {},
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
        this.initSpacingCalc();
    },
    onLoad: function (options) {
        this.options = options;
        this._showLoading();
        this.loadCityData();
    },

    loadCityData: function () {
        const { biz = 1 } = this.options;
        const setHistory = (citydata) => {
            citydata.type = (~~biz === 1) ? 'domestic' : 'oversea';
        };
        const citydata = storage.getStorage(HOTEL_LIST_CITIES);
        if (citydata) {
            setHistory(citydata);
            this.handleCityData(citydata);
        } else {
            cityModel.doRequest((data) => {
                if (data) {
                    storage.setStorage(HOTEL_LIST_CITIES, data, 720);
                    setHistory(data);
                    this.handleCityData(data);
                }
            });
        }
    },

    onUnload: function () {
        this._hideLoading();
    },
    /**
     * @param {*} showLocateDialog 是否走失败原因弹窗提示
     */
    keyboardSearch (e) {
        const { searchResult, inputKeyword } = this.data;
        if (!searchResult) return;

        const selectedCity = searchResult[0];
        this.jumpToList({
            cityid: selectedCity.cityId,
            cityname: selectedCity.cityName,
            keyword: inputKeyword
        });
    },
    cityTap: function (e) {
        this.jumpToList(e.currentTarget.dataset);
    },
    handleHeadTabClick (e) {
        const dataset = e.target.dataset;
        const selectTab = dataset.tab;
        const { inlandCities, interCities } = this.pageStatus;
        if (this.data.currentTab === selectTab) return;

        if (selectTab === 0 || selectTab === 1) {
            selectedCities = inlandCities;
            if (selectTab === 1) {
                selectedCities = interCities;
            }
            currentCityLength = 0;

            this.data.currentTab = selectTab;
            this.data.currentAppend = selectedCities.cityTags[0];
            this.data.currentTabCities = null;
            let currentTabCities = null;
            do {
                currentTabCities = this._appendNextSection(this.data.currentAppend);
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
        }
    },

    searchInput: function (e) {
        const value = e.detail.value || '';
        const regex = /^[0-9a-zA-Z\s]+$/g;
        this.setData({
            inputKeyword: value,
            isInputValueEn: regex.test(value)
        });

        clearTimeout(this.pageStatus.suggestingTimer);
        this.pageStatus.suggestingTimer = setTimeout(function () {
            // 搜索联想服务
            const sModel = this.searchModel;
            sModel.word = this.data.inputKeyword;
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

        const currentTabCities = this._appendNextSection(citytag);
        const dataToSet = {
            toView: citytag
        };
        if (currentTabCities) {
            dataToSet.currentAppend = citytag;
            dataToSet.currentTabCities = currentTabCities;
        }
        this.setData(dataToSet);
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

    buildCityData: function (data) {
        const ps = this.pageStatus;
        const { inlandCities, interCities, type = '' } = data;
        const inlandCityTags = [];
        const interCityTags = [];
        const trimeData = (cityInfo, cityTags = []) => {
            for (const key in cityInfo.cityMainList) {
                const citys = cityInfo.cityMainList[key];
                if (citys.length > 0) {
                    cityTags.push(key);
                } else {
                    delete cityInfo.cityMainList[key];
                }
            }
            cityInfo.cityTags = cityTags;
        };
        trimeData(inlandCities, inlandCityTags);
        trimeData(interCities, interCityTags);

        // 保留城市数据
        ps.inlandCities = util.clone(inlandCities);
        ps.interCities = util.clone(interCities);

        // todo: 可以拿到ps里
        selectedCities = (type === 'oversea') ? interCities : inlandCities;

        this.data.currentAppend = inlandCityTags.length && inlandCityTags[0];// 追加默认第一组
    },
    /**
     * 根据字母按顺序懒加载
     * @param {String} currentAppend 城市字母，例如，'A','B'
     * @returns {null|*}
     * @private
     */
    _appendNextSection: function (currentAppend) {
        let currentTabCities = this.data.currentTabCities;
        if (!currentTabCities) {
            currentTabCities = cwx.util.copy(selectedCities);
            currentTabCities.cityMainList = {};
            currentTabCities.cityTags = [];
        }
        const { cityTags = [] } = selectedCities || {}; // 所有城市名称首字母数组
        const index = cityTags.indexOf(currentAppend);
        // currentTabCities中已经包含currentAppend字母开头的城市，则不需要处理
        if (index === -1 || currentTabCities.cityMainList[currentAppend] || currentTabCities.cityTags.includes(currentAppend)) {
            return null;
        }

        // 追加要显示的city section
        for (let i = 0; i < cityTags.length; i++) {
            if (i <= index) {
                const append = cityTags[i];
                if (!currentTabCities.cityMainList[append] && !currentTabCities.cityTags.includes(append)) {
                    const tmpCity = selectedCities.cityMainList[append];
                    currentCityLength += tmpCity.length; // 追加长度
                    currentTabCities.cityMainList[append] = tmpCity;
                    currentTabCities.cityTags.push(append);
                }
            }
        }
        if (index < cityTags.length - 1) {
            this.data.currentAppend = cityTags[index + 1];
        }

        return currentTabCities;
    },
    handleCityData: function (data) {
        this._hideLoading();
        const ps = this.pageStatus;
        const type = data.type || '';

        currentCityLength = 0;
        // 过滤掉空的数据
        this.buildCityData(data);
        let currentTabCities = null;
        do {
            currentTabCities = this._appendNextSection(this.data.currentAppend);
        } while (currentCityLength < 30 && currentTabCities != null);

        if (currentTabCities) {
            this.setData({
                currentAppend: this.data.currentAppend,
                loadDataFinish: true,
                currentTabCities,
                showInter: (ps.interCities.cityTags.length !== 0),
                cityTags: selectedCities.cityTags,
                currentTab: (type === 'oversea') ? 1 : 0
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
        cityModel.doSearch(params, function (searchResult) {
            callback && callback(searchResult);
        });
    },
    _onHandleSearchResult: function (data) {
        this.setData({
            searchResult: data
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
    jumpToList ({ cityid, keyword, cityname }) {
        const { allianceid, sid, inday, outday, lat, lng, biz = 1, keyword: originKeyword, cityid: originCityid } = this.options;
        // 无论城市是否切换（微信要求），未传入关键词，则使用原关键词
        !keyword && (keyword = originKeyword);

        const queryStr = urlUtil.paramString({
            inday,
            outday,
            cityid: cityid || originCityid,
            biz,
            cityname,
            lat,
            lng,
            keyword,
            allianceid,
            sid
        });

        cwx.redirectTo({
            url: `/pages/hotel/list/index?${queryStr}`
        });
    }
});
