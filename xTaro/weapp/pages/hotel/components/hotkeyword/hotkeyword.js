import commonfunc from '../../common/commonfunc.js';
import storage from '../../common/utils/storage.js';
import commonrest from '../../common/commonrest';
import C from '../../common/C';
import dateUtil from '../../common/utils/date';
import util from '../../common/utils/util';

const HOT_SEARCH_INFO_KEY = 'P_HOTEL_HOTKEYWORD_SEARCH_RESULT';

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        /** 组件是否可见 */
        display: {
            type: Boolean,
            value: true
        },
        /** 城市ID */
        cityId: {
            type: Number,
            value: 0,
            observer (cityId) {
                this._loadHotKeywords(cityId, this.data.did);
            }
        },
        inday: {
            type: String,
            value: ''
        },
        outday: {
            type: String,
            value: ''
        },
        from: {
            type: String,
            value: ''
        },
        /** 区域ID */
        did: Number,
        /** 已选择关键字 */
        selectedKeyword: String,
        /** 是否展示历史搜索模块 */
        enableHistory: {
            type: Boolean,
            value: true
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        historyItems: [],
        filterItems: [],
        isIPhoneX: util.isIPhoneX()
    },

    /**
     * 组件的方法列表
     */
    methods: {
        /**
         * 热门搜索信息
         */
        _loadHotKeywords (cityId, did) {
            const { inday = dateUtil.today(), outday = dateUtil.tomorrow() } = this.properties;
            const historyData = storage.getStorage(HOT_SEARCH_INFO_KEY);
            if (historyData && historyData[cityId]) {
                this.renderKeywords(cityId, historyData[cityId]);
            } else {
                const params = {
                    cityId,
                    districtId: did || 0,
                    indate: inday,
                    outdate: outday,
                    userCoordinate: {},
                    channel: 1,
                    category: C.FILTER_CATEGORY_HOT_KEYWORD
                };
                commonrest.getHotelFilter(params, (res) => {
                    if (res && res.filterInfo) {
                        const skInfo = {};
                        skInfo[cityId] = res.filterInfo;
                        storage.setStorage(HOT_SEARCH_INFO_KEY, skInfo, 24);
                        this.renderKeywords(cityId, res.filterInfo);
                    }
                }, (err) => {});
            }
        },
        renderKeywords (cityId, keywordsInfo = '{}') {
            const iconMap = {
                30: 'wechat-font-hotkey font-hotkey-color', // 热门关键词，热搜关键字
                1002: 'wechat-font-brand font-brand-color', // 品牌
                1008: 'wechat-font-shopping font-shopping-color', // 商业区
                1018: 'wechat-font-spots font-spots-color', // 景点
                1010: 'wechat-font-air font-air-color', // 机场车站
                1001: 'wechat-font-special font-special-color', // 特色
                1009: 'wechat-font-office font-office-color', // 行政区
                1011: 'wechat-font-train font-train-color', // 地铁站
                1034: 'wechat-font-university font-university-color', // 大学
                1035: 'wechat-font-hospital font-hospital-color', // 医院
                1027: 'wechat-font-buy font-buy-color', // 商场
                1026: 'wechat-font-eating font-eating-color', // 餐厅
                70: 'wechat-font-key-hotel font-reshotel-color', // 酒店？
                69: 'wechat-font-key-search font-resothers-color' // 民宿？
            };
            try {
                const { filterItems = [] } = JSON.parse(keywordsInfo) || {};

                filterItems.forEach((item) => {
                    item.icon = iconMap[item.data.filterId];
                    if (item.subItems?.length > 8) {
                        item.needFoldUp = true;
                        item.isFold = true;
                    }
                });
                // history keywords
                const keyObjs = commonfunc.getKeywordsStorage(cityId) || [];

                this.setData({
                    filterItems,
                    historyItems: keyObjs
                });
            } catch (e) {
            }
        },
        searchKeyword (e) {
            const dt = e.currentTarget.dataset;
            const val = dt.val;
            const id = dt.id;
            const key = dt.key;
            commonfunc.setKeywordStorage(this.data.cityId, val, id, key);
            this.triggerEvent('searchKeyword', { val, hotelid: '', key });
        },
        clearHistoryItems (e) {
            commonfunc.clearKeywordsHistoryItems();
            this.setData({ historyItems: [] });
        },
        toggleSearchList (e) {
            const searchIdx = e.currentTarget.dataset.index;
            const filterItems = this.data.filterItems || [];
            const currentItem = filterItems[searchIdx] || {};

            if (currentItem.subItems?.length > 16) {
                this.setData({
                    showMoreKeyword: true,
                    filterLayer: currentItem
                });
                return;
            }

            this.setData({
                [`filterItems[${searchIdx}].isFold`]: !currentItem.isFold
            });
        },
        closeFilterLayer () {
            this.setData({
                showMoreKeyword: false
            });
        }
    }
});
