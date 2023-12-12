import C from '../../common/C';
import { cwx } from '../../../../cwx/cwx.js';
import commonrest from '../../common/commonrest.js';
import util from '../../common/utils/util.js';

Component({
    // options: {
    //     pureDataPattern: '/^_/' // 指定所有 _ 开头的数据字段为纯数据字段
    // },
    /**
     * 组件的属性列表
     */
    properties: {
        cityId: {
            type: Number,
            observer: function (newVal, oldVal, changedPath) {
                if (newVal && (newVal !== oldVal)) {
                    this.clearFilterData();
                }
            }
        },
        districtId: {
            type: Number,
            observer: function (newVal, oldVal, changedPath) {
                if (newVal && (newVal !== oldVal)) {
                    this.clearFilterData();
                }
            }
        },
        inDay: { // 长租房筛选项个性化
            type: String,
            observer: 'clearFilterData'
        },
        outDay: {
            type: String,
            observer: 'clearFilterData'
        },
        category: {
            type: String
        },
        _selectedItems: {
            type: Array
        },
        filterFromMap: {
            type: Boolean
        },
        hide: {
            type: Boolean,
            value: true,
            observer: function (newVal, oldVal, changedPath) {
                if (!newVal) {
                    this.refresh(null, this.data._selectedItems);
                }
            }
        },
        filterExposeObj: {
            type: Object,
            value: {},
            observe: 'refreshExposeNode'
        }
    },
    data: {
    },
    attached () {
        this.setData(this.getDefaultData());
        // 若自定义组件需要发曝光埋点，必须在attatch中初始化监听器，调用cwx.sendUbtExpose.observe(this);
        this.bindObserve();
    },
    ready () {
        this.triggerEvent('ready', this);
    },
    methods: {
        getDefaultData () {
            return {
                hide: true,
                loading: false,
                filterItems: null,
                curView: '', // 右侧选项
                activeIndex_lv1: 0, // 当前高亮模块index值（第一层）
                activeIndex_lv2: 0, // 当前高亮模块index值（第二层）
                expandedMap: {}, // 展开/收起
                itemSelectedMap: {}, // 筛选项（叶子结点）选中状态
                confirmedItems: [],

                _filterMap: null,
                _keyMap: null, // 兼容老筛选id（key: 老筛选id; value: 新filterId）
                _tempFilterIds: [], // 未保存已选中的筛选项（组件渲染基于此节点来更新）
                _filterInfo: null, // 服务返回的filterInfo字符串
                _moduleHeigMap: {}
            };
        },
        /**
         * 重置
         */
        reset (e) {
            this.data._tempFilterIds = [];
            this.setData({
                filterItems: this.getFilterItems(),
                itemSelectedMap: {}
            });
        },
        confirm (e) {
            this._confirm();
        },
        /**
         * 左侧模块点击
         */
        handleModuleTap (e) {
            const d = this.data;
            const dataset = e.currentTarget?.dataset || {};
            const id = `SM_${dataset?.id}`;
            const level = dataset.level;
            const idx = dataset.idx;
            if (!id || !level || typeof idx !== 'number') return;
            const activeProp = `activeIndex_${level}`;
            if (idx !== d[activeProp]) {
                const renderData = {
                    curView: id
                };
                if (level === 'lv1') {
                    renderData.activeIndex_lv1 = idx;
                    let subIdx = 0;
                    // 目前activeIndex_lv2只在”位置区域“组件中有使用，这里判一下组件类型避免不必要的循环
                    if (d.category === C.FILTER_CATEGORY_AREA_FILTER) {
                        for (let i = 0, n = d.filterItems[idx].subItems.length; i < n; i++) {
                            const subItem = d.filterItems[idx].subItems[i];
                            if (subItem.extra?.selected) {
                                subIdx = i;
                                break;
                            }
                        }
                    }
                    renderData.activeIndex_lv2 = subIdx;
                } else if (level === 'lv2') {
                    renderData.activeIndex_lv2 = idx;
                }

                this.setData({ ...renderData });
            }
        },
        handleFilterItemTap (e) {
            const filterId = e.currentTarget?.dataset?.filterid;
            if (!filterId) return;

            this.select(filterId);
        },
        handleExpand (e) {
            const dataset = e.currentTarget?.dataset;
            const id = dataset.id;
            if (id) {
                const expandedMap = this.data.expandedMap || {};
                expandedMap[id] = !expandedMap[id];
                this.setData({
                    expandedMap,
                    curView: id
                });
            }
        },
        handleClose (e) {
            this.triggerEvent('close', '');
        },
        filterScroll: util.throttle(function (e) {
            const scrollTop = e.detail.scrollTop;
            const filterItems = this.data.filterItems || [];
            if (filterItems.length) {
                filterItems.forEach(item => {
                    const mId = item.id;
                    wx.createSelectorQuery().in(this).select(`#SM_${mId}`).boundingClientRect((res) => {
                        if (res) {
                            this.data._moduleHeigMap[mId] = res.height;
                        }
                    }).exec();
                });
                let heightSum = 0;
                for (let i = 0, n = filterItems.length; i < n; i++) {
                    const mId = filterItems[i].id;
                    heightSum += this.data._moduleHeigMap[mId] || 0;
                    if (scrollTop < heightSum) {
                        this.setData({
                            activeIndex_lv1: i
                        });
                        break;
                    }
                }
            }
        }),
        updateByTriggerFilterId (triggerFilterKey, extra) {
            if (this.data._filterInfo) { // 已初始化
                this.triggerFilterTap(triggerFilterKey, extra);
            } else {
                this.refresh(() => {
                    this.triggerFilterTap(triggerFilterKey, extra);
                });
            }
        },
        updateBySuggestSelectedIds (suggestSelectedIds, extra) {
            // eslint-disable-next-line
            const ids = suggestSelectedIds || [];
            // 刷新组件
            this.refresh(() => {
                // 模拟筛选项tap
                suggestSelectedIds.forEach(filterId => {
                    if (filterId) {
                        this.select(filterId);
                    }
                });
                // 确认返回
                this._confirm(extra);
            });
        },
        /**
         * 筛选项是否存在，存在返回正确的filterId
         * @param {string} filterVal 筛选id最后一个竖线后面的值
         * @param {string} title 筛选标题
         * */
        existingFilter (filterVal, title) {
            const filterMap = this.data._filterMap;
            if (!filterMap || !filterVal || !title) return undefined;

            const ids = Object.keys(filterMap);
            return ids.find(id => {
                const filter = filterMap[id] || {};
                if (filter.title === title) {
                    return id.split('|').pop() === filterVal;
                }

                return false;
            });
        },
        dataReady (callback) {
            const filterMap = this.data._filterMap;
            if (filterMap) {
                callback && callback();
            } else {
                this.refresh(() => {
                    callback && callback();
                });
            }
        },
        /**
         * 模拟筛选项的tap事件
         * @param {string} filterKey 筛选id或者老版筛选key
         * @param {Object} extra 组件调用方传进来数据，confirm的时候透传回去
         * */
        triggerFilterTap (filterKey, extra) {
            const filterMap = this.data._filterMap;
            const keyMap = this.data._keyMap || {};
            const filterId = keyMap[filterKey] || filterKey;
            if (filterMap[filterId]) {
                this.select(filterId);
                this._confirm(extra);
            } else {
                // 若筛选项中不存在快筛id，返回数据
                this.triggerEvent('select', {
                    filterKey,
                    extra
                });
            }
        },

        refresh (callback, selectedItems) {
            const _filterInfo = this.data._filterInfo;
            if (_filterInfo) {
                this.renderFilters(_filterInfo, selectedItems, callback);
            } else {
                this.showLoading();
                this.loadData(resData => {
                    this.hideLoading();
                    if (resData) {
                        this.renderFilters(resData.filterInfo, selectedItems, callback);
                    }
                });
            }
        },
        loadData (callback) {
            const d = this.data;
            const params = {
                outdate: d.outDay,
                districtId: d.districtId,
                userCoordinate: null, // TODO: 用户位置信息
                channel: 0,
                indate: d.inDay,
                cityId: d.cityId,
                category: d.category
            };
            commonrest.getHotelFilter(params, (data) => {
                callback && callback(data);
            }, (err) => {
                callback && callback(err);
            });
        },
        renderFilters (filterInfoStr, selectedItems, callback) {
            try {
                const d = this.data;
                const filterObj = JSON.parse(filterInfoStr);
                const filterMap = filterObj.filterMap;
                let filterItems = filterObj.filterItems;
                const renderData = this.getDefaultData();
                renderData.hide = d.hide;
                /* 设置已选中的筛选项 */
                let selectedFilterIds = [];
                if (selectedItems && selectedItems.length) {
                    selectedFilterIds = selectedItems.map(item => item.data?.filterId);
                    renderData.confirmedItems = selectedItems;
                }
                // 保留原始的筛选信息字符串
                renderData._filterInfo = filterInfoStr;

                renderData._filterMap = filterMap;
                renderData._tempFilterIds = selectedFilterIds;
                // 叶子节点状态
                const itemSelectedMap = {};
                selectedFilterIds.forEach(filterId => {
                    itemSelectedMap[filterId] = true;
                });
                renderData.itemSelectedMap = itemSelectedMap;
                // 左侧模块状态
                filterItems = this.fillFilterItemSelected(filterItems, selectedFilterIds, filterMap);
                renderData.filterItems = filterItems;
                // 当前scroll view位置
                let curView = filterItems[0].id;
                // eslint-disable-next-line
                let activeIndex_lv1 = 0;
                // eslint-disable-next-line
                let activeIndex_lv2 = 0;
                for (let i = 0, n = filterItems.length; i < n; i++) {
                    if (filterItems[i].extra?.selected) {
                        curView = filterItems[i].id;
                        // eslint-disable-next-line
                        activeIndex_lv1 = i;
                        break;
                    }
                }
                renderData.curView = curView;
                // 位置区域筛当前展示分类
                // eslint-disable-next-line
                const subItems = filterItems[activeIndex_lv1].subItems;
                if (d.category === C.FILTER_CATEGORY_AREA_FILTER && subItems) {
                    for (let i = 0, n = subItems.length; i < n; i++) {
                        if (subItems[i].extra?.selected) {
                            // eslint-disable-next-line
                            activeIndex_lv2 = i;
                            break;
                        }
                    }
                }
                // eslint-disable-next-line
                renderData.activeIndex_lv1 = activeIndex_lv1;
                // eslint-disable-next-line
                renderData.activeIndex_lv2 = activeIndex_lv2;

                this.setData({ ...renderData });
                callback && callback();
            } catch (err) {
                callback && callback(err);
            }
        },
        select (filterId) {
            let itemSelectedMap = this.data.itemSelectedMap;
            const filterMap = this.data._filterMap;
            // 无效数据直接返回
            if (!filterMap[filterId]) return;

            let selectedFilterIds = this.data._tempFilterIds;
            if (itemSelectedMap[filterId]) { // 反选
                selectedFilterIds = selectedFilterIds.filter(id => id !== filterId);
            } else { // 选中
                // 排除互斥筛选项
                selectedFilterIds = this.excludeMutexItems(selectedFilterIds, filterId);
                // 把自己加进去
                selectedFilterIds.push(filterId);
            }
            // 更新filterItems信息
            let filterItems = this.getFilterItems();
            filterItems = this.fillFilterItemSelected(filterItems, selectedFilterIds);
            // 更新当前选中筛选状态
            itemSelectedMap = {};
            selectedFilterIds.forEach(filterId => {
                itemSelectedMap[filterId] = true;
            });

            this.setData({
                filterItems,
                itemSelectedMap,
                _tempFilterIds: selectedFilterIds
            });
        },
        _confirm (extraInfo) {
            const d = this.data;
            const selectedItems = [];
            const tempFilterIds = d._tempFilterIds;
            const filterMap = d._filterMap;
            tempFilterIds.forEach(filterId => {
                const filter = filterMap[filterId];
                // 补充部分没有scenarios的筛选项
                if (!filter.scenarios) {
                    filter.scenarios = [d.category];
                }
                filter && selectedItems.push(filter);
            });
            this.setData({
                confirmedItems: selectedItems
            });
            // 返回数据
            this.triggerEvent('confirm', {
                selectedItems,
                extra: extraInfo || {}
            });
        },
        /**
         * 获取服务返回整个筛选的结构
         * */
        getFilterItems (filterInfo) {
            let result = [];
            filterInfo = filterInfo || this.data._filterInfo;
            if (filterInfo) {
                try {
                    result = JSON.parse(filterInfo).filterItems;
                } catch (ex) {
                    // ignore
                }
            }

            return result;
        },
        /**
         * 排除互斥选项并返回最新选中集合
         * @param {Array} tempFilterIds 临时选中值集合
         * @param {string} currentSelectedId 当前选中筛选项filterId
         * */
        excludeMutexItems (tempFilterIds = [], currentSelectedId) {
            if (currentSelectedId) {
                const filterMap = this.data._filterMap;
                // eslint-disable-next-line
                const currentFilter = filterMap[currentSelectedId];
                // 单选互斥
                const singleCategoryFilterId = this.getSingleSelectionRootFilterId(currentSelectedId);
                if (singleCategoryFilterId) {
                    tempFilterIds = tempFilterIds.filter(filterId => {
                        const categoryNode = this.getCategoryNodeById(filterId);
                        return categoryNode.data?.filterId !== singleCategoryFilterId;
                    });
                } else { // nodeType为2的节点互斥处理
                    tempFilterIds = tempFilterIds.filter(filterId => {
                        const tempFilter = filterMap[filterId];
                        if (tempFilter.nodeType === 2) {
                            const tempCategoryNode = this.getCategoryNodeById(filterId);
                            const curCategoryNode = this.getCategoryNodeById(currentSelectedId);
                            return tempCategoryNode.data?.filterId !== curCategoryNode.data?.filterId;
                        }

                        return true;
                    });
                }
                // 通过mutexId排除
                if (tempFilterIds.length) {
                    const curOtherMutexIds = this.getMutextIds(currentSelectedId, 'otherMutexIds');
                    tempFilterIds = tempFilterIds.filter(filterId => {
                        const selfMutexIds = this.getMutextIds(filterId, 'selfMutexIds');
                        let hasSameId = false;
                        for (let i = 0, n = selfMutexIds.length; i < n; i++) {
                            if (curOtherMutexIds.includes(selfMutexIds[i])) {
                                hasSameId = true;
                                break;
                            }
                        }

                        return !hasSameId;
                    });
                }
            }

            return tempFilterIds;
        },
        fillFilterItemSelected (filterItems, filterIds, filterMap) {
            filterMap = filterMap || this.data._filterMap;
            filterIds.forEach(filterId => {
                const paths = filterMap[filterId].paths || [];
                paths.forEach(path => {
                    let curNode = {};
                    for (let i = 0, n = path.length - 1; i < n; i++) {
                        const idx = path[i];
                        curNode = i === 0 ? filterItems[idx] : curNode.subItems[idx];
                        curNode.extra.selected = true;
                    }
                });
            });

            return filterItems;
        },
        /**
         * 通过filterId查找当前分类父级filterId（只返回单选分类或者nodeType为2的，如果是复选的则返回null)
         * @param {string} filterId 筛选filterId
         * @return {string | null} 单选类型的分类filterId
         * */
        getSingleSelectionRootFilterId (filterId) {
            let singleSelectionFilterId = null;
            if (filterId) {
                const currentFilter = this.data._filterMap[filterId];
                const categoryNode = this.getCategoryNodeById(filterId);
                // 类型为单选或者nodeType为聚合筛选项（比如 '全部中端酒店'）
                if (!categoryNode.operation?.isMultiSelect || currentFilter.nodeType === 2) {
                    singleSelectionFilterId = categoryNode.data?.filterId;
                }
            }

            return singleSelectionFilterId;
        },
        /**
         * 根据filterId找到当前筛选项在筛选树中的分类节点（从根节点开始找第一个有filterId的）
         * */
        getCategoryNodeById (filterId) {
            let result = {};
            if (filterId) {
                const filterItems = this.data.filterItems;
                const filter = this.data._filterMap[filterId];
                const paths = filter.paths;
                const findByPath = (path = [], filterId) => {
                    let rs = null;
                    let curNode = {};
                    for (let i = 0, n = path.length - 1; i < n; i++) {
                        const idx = path[i];
                        curNode = i === 0 ? filterItems[idx] : curNode?.subItems[idx];
                        const curId = curNode?.data?.filterId;
                        if (curId) {
                            rs = curNode;
                            break;
                        }
                    }

                    return rs;
                };
                for (let i = 0, n = paths.length; i < n; i++) {
                    const item = findByPath(paths[i], filterId);
                    if (item) {
                        result = item;
                        break;
                    }
                }
            }

            return result;
        },
        getMutextIds (filterId, mutexType) {
            let result = [];
            const filter = this.data._filterMap[filterId];
            const filterItems = this.data.filterItems;
            if (filter) {
                const paths = filter.paths;
                paths.forEach(path => {
                    let curNode = {};
                    path.forEach((idx, i) => {
                        curNode = i === 0 ? filterItems[idx] : curNode.subItems[idx];
                        if (curNode.operation && curNode.operation[mutexType]) {
                            result = result.concat(curNode.operation[mutexType]);
                        }
                    });
                });
            }

            return result;
        },
        clearFilterData () {
            this.setData(this.getDefaultData());
        },
        showLoading () {
            this.setData({
                loading: true
            });
        },
        hideLoading () {
            this.setData({
                loading: false
            });
        },
        /**
         * 组件数据是否已加载
         * */
        initialized () {
            return !!this.data._filterInfo;
        },
        noop () {},

        /**
         * 判断选搜的筛选项是不是这个类型
         * @param {*} filterVal
         * @returns
         */
        existingInFilter (filterVal) {
            const filterMap = this.data._filterMap;
            if (!filterMap || !filterVal) return undefined;

            const ids = Object.keys(filterMap);
            return ids.find(id => {
                const filter = filterMap[id] || {};
                // eslint-disable-next-line
                return filter?.data?.filterId == filterVal;
            });
        },
        bindObserve () {
            cwx.sendUbtExpose.observe(this); // 在attached中绑定监听器
        },
        refreshExposeNode () {
            cwx.sendUbtExpose.refreshObserve(this); // 当组件中需要发曝光埋点的目标节点有变化时更新
        }
    }
});
