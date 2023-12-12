import { CPage, cwx } from '../../../../cwx/cwx.js';
import hPromise from '../../common/hpage/hpromise';
import listData from '../listdata';
import C from '../../common/C';

import dateUtil from '../../common/utils/date.js';
import commonfunc from '../../common/commonfunc';
import commonrest from '../../common/commonrest.js';
import geoService from '../../common/geo/geoservice.js';
import country from '../../common/geo/country.js';
import util from '../../common/utils/util.js';
import listfunc from '../../list/listfunc';

const ILL_SORT_KEY = 'sort-45|1'; // 智能排序
const POPULARITY_SORT_KEY = 'sort-0|1'; // 欢迎度排序
const SET_LATITUDE_LIST_FIRST = 'listFirst'; // 设置地图中心点-第一次进入地图页
const SET_LATITUDE_FILTER = 'filter'; // 设置地图中心点-更改位置筛选项
const PRICE_CONFIRM_FUNC = 'hoteltap'; // 价格明细浮层中确定按钮触发事件，去详情

CPage({
    pageId: '10650042326',
    checkPerformance: true, // 白屏检测标志位
    data: {
        hotelResText: '',
        hotelShowCount: 0, // 仅展示酒店数小于总酒店数时非0
        longitude: '', // 地图
        latitude: '',
        scale: 12,
        markers: [],
        priceDetail: null, // 价格问号浮层
        dateInfo: { // 入离日期信息
            shortInDay: dateUtil.today().slice(5),
            shortOutDay: dateUtil.tomorrow().slice(5),
            inDay: dateUtil.today(),
            outDay: dateUtil.tomorrow(),
            days: 1,
            isMorning: false,
            selectMorning: false
        },
        showLoading: true,
        fromMap: true, // 引用template时适应class
        filterSummary: {
            filter: { // 综合筛选
                displayText: '筛选',
                current: '',
                hidden: true,
                selectedItems: [],
                suggestItems: [], // 地图会带和酒店列表返回后更新组件用
                extra: {}
            },
            area: { // 位置区域
                displayText: '位置区域',
                current: '',
                hidden: true,
                selectedItems: [],
                suggestItems: [], // 地图会带和酒店列表返回后更新组件用
                extra: {}
            },
            priceStar: { // 星级价格
                hidden: true,
                curCount: 0,
                current: '',
                data: {
                    text: '价格/星级',
                    star: [],
                    price: [],
                    requestFilterInfo: {}
                }
            },
            sort: {
                current: '',
                selectedInfo: {
                    title: '欢迎度排序',
                    id: 'sort-0|1', // 默认选中排序
                    filterId: '',
                    isOrderByUser: false // 是否用户主动选择排序
                },
                hidden: true,
                isShowIllSort: false // 是否展示智能排序
            }
        } // 筛选项信息
    },
    /* 与页面渲染无关的一些参数 */
    pageStatus: {
        keywordInfo: { // 关键词信息（考虑选搜设计成对象）
            text: ''
        },
        resHotels: [], // 酒店列表，无起价或者经纬度信息不参与展示
        userCoordinate: { // 客户端位置信息
            cityId: 0,
            latitude: 0,
            longitude: 0
        },
        timeZoneDate: null, // 时间工具类
        regionChangeByUser: true,
        poiInfo: { // 选搜打点信息
            name: '',
            latitude: '',
            longitude: ''
        },
        sourceFromTag: ''
    },
    onLoad (option) {
        this.setData({
            isLoggedin: cwx.user.isLogin()
        });
        this.pageStatus.timeZoneDate = dateUtil.TimeZoneDate.create();
        this.mapCtx = wx.createMapContext('listNewMap'); // 在data中设置无效
        this.initPageInfo(option);
        this.loadHotels(SET_LATITUDE_LIST_FIRST);
        // 下载排序项
        this.loadSortItems();
        commonfunc.monitorPrivacyAuthorize();
    },
    onShow () {
        const { isLoggedin } = this.data;
        const actualLogin = cwx.user.isLogin();
        if (isLoggedin !== actualLogin) {
            this._setData({
                isLoggedin: actualLogin
            }, true);
        }
    },
    initPageInfo (option) {
        const od = util.clone(option.data);
        if (od) {
            const ps = this.pageStatus;
            const { cityInfo, dateInfo, filterSummary, userCoordinate, isPOI, sourceFromTag, topHotelIds, keywordInfo, searchAddr, referencePoint, chooseHourroomDate, countdownParams } = od;
            // 我的位置
            userCoordinate && (ps.userCoordinate = userCoordinate);
            // 搜索poi进入
            ps.isPOI = !!isPOI;
            ps.sourceFromTag = sourceFromTag;
            ps.topHotelIds = topHotelIds;
            ps.keywordInfo = keywordInfo;
            ps.poiInfo.name = keywordInfo?.text || '';
            ps.referencePoint = referencePoint;
            ps.chooseHourroomDate = chooseHourroomDate;
            ps.countdownParams = countdownParams || {};
            this.setNavTitle(cityInfo);

            this.setData({
                cityInfo,
                dateInfo,
                centerPointerText: searchAddr,
                filterSummary
            });
        }
    },
    setPoiMarker () {
        const pageS = this.pageStatus;
        return {
            id: -1,
            iconPath: 'https://pages.c-ctrip.com/hotels/wechat/img/listmap-annotation.png',
            latitude: pageS.poiInfo.latitude,
            longitude: pageS.poiInfo.longitude,
            zIndex: 2,
            height: '62rpx',
            width: '46rpx',
            callout: {
                content: `${pageS.poiInfo.name}`,
                color: '#111111',
                fontSize: 14,
                borderRadius: 8,
                borderColor: '#e0e1e5',
                borderWidth: 1,
                padding: 4,
                bgColor: '#fff',
                display: 'ALWAYS',
                textAlign: 'center'
            }
        };
    },
    loadHotels (setLatType) {
        const reqData = this.getSearchParams();
        const pageS = this.pageStatus;
        this.setData({
            showLoading: true
        });
        listData.loadHotelList('gethotellist', reqData, (res) => {
            pageS.isKeywordPOI = res.hasLocationFilterRelated && reqData.filterInfo.keyword;
            this.handleRenderData(res, false, setLatType);
        }, () => {
            this.setData({
                showLoading: false
            });
        });
    },
    handleRenderData (res, hideCenterAddr, setLatType) {
        const pageS = this.pageStatus;
        const hotels = res.hotelInfoList || [];
        const { filterSummary, centerPointerText } = this.data;
        const dataToSet = {
            markers: [],
            showLoading: false,
            filterSummary
        };

        // 设置初始或者poi中心点
        if (setLatType) {
            dataToSet.showCenterPointer = true;
            dataToSet.centerPointerText = '';

            const referLocationInfo = res.referLocationInfo || {};
            if (referLocationInfo.latitude && referLocationInfo.longitude) {
                dataToSet.latitude = referLocationInfo.latitude;
                dataToSet.longitude = referLocationInfo.longitude;
            }
            if (setLatType === SET_LATITUDE_LIST_FIRST) {
                Object.assign(pageS.poiInfo, referLocationInfo); // 选搜打点默认经纬度
                dataToSet.centerPointerText = centerPointerText || '';
            }
        }
        const uiModifyInfo = res.uiModifyInfo || {};
        // 日期信息（如果前端传入的时间过期了服务会校正）
        if (uiModifyInfo.checkinDate && uiModifyInfo.checkoutDate) {
            dataToSet.dateInfo = this.getDateInfo(uiModifyInfo.checkinDate, uiModifyInfo.checkoutDate);
        }
        // 智能排序
        const isShowIllSort = uiModifyInfo.isShowIntelligentSortItem;
        filterSummary.sort.isShowIllSort = isShowIllSort;
        const adjustFilterId = this.getAdjustSortId(isShowIllSort);
        // 如果adjustFilterId有值，则需调整；如果为空字符串，则需要默认选中欢迎度排序
        filterSummary.sort = this.adjustSortInfo(filterSummary.sort.items, adjustFilterId);
        
        // 展示的酒店+地图打点
        const hotelsRender = [];
        if (hotels.length) {
            const { markers } = dataToSet;
            let idx = 0;
            for (let i = 0, hLen = hotels.length; i < hLen; i++) {
                const htl = hotels[i] || {};
                const coordinate = htl.coordinate || {};
                const { latitude: resLat, longitude: resLng } = coordinate;
                // 无起价或者经纬度信息不参与展示
                if (~~htl.price < 0 || !resLat || !resLng) {
                    continue;
                }

                if (pageS.poiInfo.name === htl.hotelName) { // 选搜POI和酒店名称一致时，使用酒店的经纬度
                    Object.assign(pageS.poiInfo, coordinate);
                }
                // 酒店卡片
                htl.positionDesc = (centerPointerText && htl.positionDesc?.replace(/\{0\}/g, centerPointerText)) || htl.positionDesc;
                htl.commentScore = htl.commentScore ? htl.commentScore.toFixed(1) : '';
                htl.commentNumberText = htl.commenterNumber > 0 ? `${htl.commenterNumber}点评` : '';
                htl.collectedText = this.getCollectedText(htl.collectedNumber);
                // 挂牌酒店ICON
                htl.medalIconSrc = commonfunc.getMedalIcon(htl.medal);
                htl.ubt = {
                    item: 131983
                };
                htl.isFullBooking = htl.isFullBooking && !htl.isClose && !htl.isHotelNoPrice;
                // 灰色蒙层
                htl.showGrayFilter = (htl.canNotBeOrderedInfo?.messageBold && (htl.isClose || htl.isHotelNoPrice)) || htl.isFullBooking;
                htl.idx = i;
                hotelsRender.push(htl);

                htl.price = htl.price >= 0 ? htl.price : htl.priceStr; // 价格打码
                const markerItem = this.mapInfoProc(idx++, coordinate, htl.price, htl.isFullBooking);
                markers.push(markerItem);
            }

            const hotelResLen = hotelsRender.length;
            dataToSet.hotelResText = `共${res.hotelCount}家酒店`;
            dataToSet.hotelShowCount = hotelResLen < res.hotelCount ? hotelResLen : 0;
            dataToSet.hotel = hotelsRender[0];
            dataToSet.curHotelIdx = 0;
            dataToSet.isLastHotel = markers.length <= 1;
        }
        const poiMarker = this.setPoiMarker();
        pageS.isPOI && (dataToSet.markers.push(poiMarker));
        pageS.resHotels = hotelsRender;

        // 无结果
        if (!hotelsRender.length) {
            cwx.showToast({ title: '未找到符合条件的酒店，请重新查询', icon: 'none', duration: 3000 });
            Object.assign(dataToSet, this.noHotelsData(hideCenterAddr));
        }
        // 比例尺适中处理
        if (setLatType === SET_LATITUDE_LIST_FIRST) {
            this.setData(dataToSet);
        } else {
            // eslint-disable-next-line
            new hPromise((resolve) => {
                this.mapCtx.getScale({
                    success: (scaleRes) => {
                        const scale = (scaleRes && scaleRes.scale) || 11;
                        resolve(scale);
                    },
                    fail: () => {
                        resolve();
                    }
                });
            }).then((scale) => {
                scale < 11 && (dataToSet.scale = 11);
                scale > 15 && (dataToSet.scale = 15);
                this.setData(dataToSet);
            });
        }
    },
    noHotelsData (hideCenterAddr) {
        const noHotelsData = {
            hotelResText: '未找到符合条件的酒店，请修改条件重新查询',
            hotelShowCount: 0,
            hotel: {},
            isLastHotel: true,
            curHotelIdx: 0,
            markers: [],
            includePoints: []
        };
        if (hideCenterAddr) {
            noHotelsData.showCenterAddr = false;
            noHotelsData.centerPointerText = '';
        }
        return noHotelsData;
    },
    getCollectedText (collectedNumber) {
        let collectedDesc = '';
        if (collectedNumber > 0) {
            if (collectedNumber < 10000) {
                collectedDesc = `${collectedNumber}收藏`;
            } else {
                const thousands = Math.floor(collectedNumber / 1000);
                collectedDesc = `${thousands / 10}万收藏`;
            }
        }

        return collectedDesc;
    },
    // 地图标记信息
    mapInfoProc (idx = -1, coordinate, price, isFullBooking) {
        // 判断价格是否是打码后的价格
        const isPriceStar = typeof price === 'number' && !isNaN(price);
        const { latitude: resLat, longitude: resLng } = coordinate;
        const markerItem = {
            id: idx++,
            iconPath: 'https://pages.c-ctrip.com/hotels/wechat/img/map-transparent.png',
            latitude: resLat,
            longitude: resLng,
            zIndex: 0,
            height: 1,
            width: 1,
            callout: {
                content: `￥${price}${isPriceStar ? '起' : ''}`,
                color: isFullBooking ? '#888888' : '#006FF6',
                fontSize: 14,
                borderRadius: 8,
                borderColor: '#e0e1e5',
                borderWidth: 1,
                padding: 4,
                bgColor: '#fff',
                display: 'ALWAYS',
                textAlign: 'center'
            }
        };
        if (idx === 1) {
            markerItem.callout.color = '#fff';
            markerItem.callout.bgColor = isFullBooking ? '#bbb' : '#006FF6';
            markerItem.callout.borderWidth = 0;
            markerItem.zIndex = 1;
        }
        return markerItem;
    },

    getDateInfo (inDay, outDay) {
        const timeZoneDate = this.pageStatus.timeZoneDate;
        const isMorning = dateUtil.checkIsMorning(timeZoneDate);
        const selectMorning = isMorning && (inDay === timeZoneDate.yesterday());
        const inDayArr = commonfunc.getDateDisp(inDay, timeZoneDate, selectMorning) || [];
        const outDayArr = commonfunc.getDateDisp(outDay, timeZoneDate, selectMorning) || [];
        return {
            shortInDay: dateUtil.formatTime('MM-dd', dateUtil.parse(inDay)),
            shortOutDay: dateUtil.formatTime('MM-dd', dateUtil.parse(outDay)),
            inDayText: selectMorning ? inDayArr[2] : inDayArr[0], // x月x日
            outDayText: outDayArr[0],
            inDay,
            outDay,
            days: dateUtil.calDays(inDay, outDay),
            isMorning: dateUtil.checkIsMorning(timeZoneDate),
            selectMorning
        };
    },

    getSearchParams () {
        const pageS = this.pageStatus;
        const d = this.data;

        const { dateInfo, cityInfo = {} } = d;
        const searchParams = commonfunc.getDefaultListReq();

        searchParams.cityId = cityInfo.cityId || 2;
        searchParams.districtId = cityInfo.did || 0;
        searchParams.checkinDate = dateInfo.inDay || dateUtil.today();
        searchParams.checkoutDate = dateInfo.outDay || dateUtil.tomorrow();
        searchParams.isMorning = ~~dateInfo.isMorning;
        this.pageStatus.selectMorning = dateInfo.selectMorning;

        const userCoordinate = pageS.userCoordinate;
        // 用户定位信息
        userCoordinate.cityId > 0 && (searchParams.userCoordinate = userCoordinate);
        searchParams.sourceFromTag = pageS.sourceFromTag;
        searchParams.nearbySearch = cityInfo.isGeo ? 1 : 0; // 我的附近查询;
        searchParams.topHotelIds = pageS.topHotelIds;

        searchParams.filterInfo = this.fillSearchFilterInfo(searchParams.filterInfo);
        searchParams.isOrderByUser = d.filterSummary.sort.selectedInfo.isOrderByUser;
        searchParams.isHourRoomSearch = pageS.chooseHourroomDate;

        return searchParams;
    },
    fillSearchFilterInfo (searchFilterInfo) {
        if (!searchFilterInfo) return;
        const fs = this.data.filterSummary;
        const selectedFilterIds = [];
        let allSelectedItems = [];
        // 筛选 + 位置区域 + 快筛
        if (fs.filter.selectedItems) {
            allSelectedItems = allSelectedItems.concat(fs.filter.selectedItems);
        }
        if (fs.area.selectedItems) {
            allSelectedItems = allSelectedItems.concat(fs.area.selectedItems);
        }
        const filterItemList = [];
        allSelectedItems.forEach((item, index) => {
            const filterId = item.data?.filterId;
            if (!selectedFilterIds.includes(filterId)) {
                selectedFilterIds.push(filterId);
                filterItemList.push(item.data);
            }
        });
        searchFilterInfo.filterItemList = filterItemList || [];
        // 价格星级
        const starPriceInfo = fs.priceStar.data?.requestFilterInfo;
        if (starPriceInfo) {
            searchFilterInfo.lowestPrice = starPriceInfo.lowestPrice || 0;
            searchFilterInfo.highestPrice = starPriceInfo.highestPrice || 0;
            searchFilterInfo.starItemList = starPriceInfo.starItemList || [];
        }
        // 排序
        searchFilterInfo.orderItem = fs.sort.selectedInfo.id;
        // 关键字
        searchFilterInfo.keyword = this.pageStatus.keywordInfo.text || '';

        // 经纬度
        searchFilterInfo.referencePoint = this.pageStatus.referencePoint || null;

        return searchFilterInfo;
    },
    // 导航栏标题
    setNavTitle (option) {
        const { did, displayText, cityName, dName } = option || {};
        // 地图页title 显示景点信息
        const scenicSpot = displayText || dName;
        const title = (cityName && ((+did > 0 && scenicSpot && `${scenicSpot}(${cityName})`) || cityName)) || '';
        cwx.setNavigationBarTitle({
            title
        });
    },
    nextHotel (e) {
        const hotelIdx = e.currentTarget.dataset.hotelidx;
        const curHotelIdx = hotelIdx + 1;
        if (!curHotelIdx) return;

        this.setCurHotelData(curHotelIdx, hotelIdx, true);
    },
    preHotel (e) {
        const hotelIdx = e.currentTarget.dataset.hotelidx || 0;
        if (!hotelIdx) return;

        const curHotelIdx = hotelIdx - 1;
        this.setCurHotelData(curHotelIdx, hotelIdx, true);
    },
    setCurHotelData (curHotelIdx, preHotelIdx, changeCenterPoint) {
        const resHotels = this.pageStatus.resHotels || [];
        const curHotel = resHotels[curHotelIdx] || {};
        const freshData = {
            hotel: curHotel,
            curHotelIdx,
            isLastHotel: curHotelIdx >= (resHotels.length - 1),
            [`markers[${curHotelIdx}].callout.color`]: '#fff',
            [`markers[${curHotelIdx}].callout.bgColor`]: curHotel.isFullBooking ? '#bbb' : '#006FF6',
            [`markers[${curHotelIdx}].callout.borderWidth`]: 0,
            [`markers[${curHotelIdx}].zIndex`]: 1,
            [`markers[${preHotelIdx}].callout.color`]: resHotels[preHotelIdx].isFullBooking ? '#888888' : '#006FF6',
            [`markers[${preHotelIdx}].callout.bgColor`]: resHotels[preHotelIdx].isFullBooking ? '#fff' : '#EBF3FF',
            [`markers[${preHotelIdx}].callout.borderWidth`]: 1,
            [`markers[${preHotelIdx}].zIndex`]: 0
        };
        if (changeCenterPoint) {
            const coordinate = curHotel.coordinate || {};
            Object.assign(freshData, {
                showCenterPointer: false,
                showCenterAddr: false
            });
            // 对比直接set经纬度，moveToLocation有过渡平滑动画
            this.mapCtx.moveToLocation({
                latitude: coordinate.latitude,
                longitude: coordinate.longitude,
                fail: () => {
                    freshData.latitude = coordinate.latitude;
                    freshData.longitude = coordinate.longitude;
                }
            });
            this.pageStatus.regionChangeByUser = false;
        }
        this.setData(freshData);
    },

    calloutTap (e) {
        const markerId = e.markerId;
        if (markerId < 0) {
            return;
        }
        const lastHotelIdx = this.data.curHotelIdx;
        if (lastHotelIdx === markerId) return;
        if (markerId > -1) {
            this.setCurHotelData(markerId, lastHotelIdx, false);
        }
        try {
            this.ubtTrace && this.ubtTrace('131982', {});
        } catch (err) {
            // ignore
        }
    },
    handleFilterComponentReady (e) {
        // 保存筛选组件实例
        this.pageStatus.filterComponentObj = e.detail;
    },
    handleAreaComponentReady (e) {
        // 保存筛选组件实例
        this.pageStatus.areaComponentObj = e.detail;
    },
    handleFilterComponentClose (e) {
        this.toggleFilterStatus('filter');
    },
    /**
     * 筛选确认
     * */
    handleFilterComponentConfirm (e) {
        const detail = e.detail || {};
        const filterItems = detail.selectedItems || [];
        let filterSummary = this.data.filterSummary;
        filterSummary.filter.selectedItems = filterItems;
        filterSummary.filter.hidden = true;
        const title = '筛选';
        let filtersItems = [];
        if (filterItems.length) {
            filtersItems = filterItems.map(item => item.title);
        }
        filterSummary.filter.displayText = title;
        filterSummary.filter.filtersNum = filtersItems.length;
        filterSummary = this.fillFilterCurrentStatus(filterSummary, 'filter');
        // 更新快筛状态
        filterSummary = this.fillQuickFilterStatus(filterSummary, filterItems, C.FILTER_CATEGORY_FILTER);

        filterSummary.filter.extra = {};

        this._setData({
            filterSummary
        }, true);
    },
    handleAreaComponentClose (e) {
        this.toggleFilterStatus('area');
    },
    /**
     * 位置区域确认
     * */
    handleAreaComponentConfirm (e) {
        this.pageStatus.referencePoint = null;// 更改条件时，经纬度信息清空
        const detail = e.detail || {};
        const filterItems = detail.selectedItems || [];
        const subCityItem = filterItems.find(item => item.data?.type === '21');
        if (subCityItem) { // 下辖市县
            // 关闭组件
            this.setData({
                'filterSummary.area.hidden': true
            });
            // 刷新城市
            const subCity = JSON.parse(subCityItem.data?.value || '');
            if (subCity.cityID) {
                const cityInfo = this.setCityInfo({
                    cityId: subCity.cityID,
                    cityName: subCity.cityName || '',
                    did: subCity.districtID || 0,
                    type: subCity.countryID || 1,
                    isGeo: false,
                    tzone: subCity.timeZone || 0,
                    name: '',
                    key: ''
                });
                // 筛选项+关键字置空
                this.pageStatus.keywordInfo.text = '';
                this._setData({
                    cityInfo,
                    centerPointerText: '',
                    filterSummary: this.getDefaultFilterSummary()
                }, true, SET_LATITUDE_FILTER);
            }
        } else {
            const extra = detail.extra || {};
            let filterSummary = this.data.filterSummary;
            filterSummary.area.selectedItems = filterItems;
            filterSummary.area.hidden = true;
            const title = '位置区域';
            let filtersItems = [];
            if (filterItems.length) {
                filtersItems = filterItems.map(item => item.title);
            }
            filterSummary.area.displayText = title;
            filterSummary.area.filtersNum = filtersItems.length;
            filterSummary = this.fillFilterCurrentStatus(filterSummary, 'area');
            // 更新快筛状态
            filterSummary = this.fillQuickFilterStatus(filterSummary, filterItems, C.FILTER_CATEGORY_AREA_FILTER);
            const reloadHotels = !extra.fromTrigger;
            filterSummary.area.extra = {};

            this._setData({
                filterSummary,
                centerPointerText: ''
            }, reloadHotels, SET_LATITUDE_FILTER);
        }
    },
    fillQuickFilterStatus (filterSummary, selectedItems = [], scenario) {
        const selectedIds = selectedItems.map(item => item.data?.filterId);
        filterSummary.qs.items.forEach(item => {
            const scenarios = item.scenarios || [];
            if (scenarios.includes(scenario)) {
                item.extra.selected = selectedIds.includes(item.data?.filterId);
            }
        });

        return filterSummary;
    },
    priceStarFilterClose (e) {
        let filterSummary = this.data.filterSummary;
        filterSummary.priceStar.hidden = true;
        filterSummary = this.fillFilterCurrentStatus(filterSummary, 'priceStar');
        this.setData({
            filterSummary
        });
    },
    /**
     * 价格/星级 确认
     * */
    priceStarFilterConfirm (e) {
        const psData = e.detail;
        const filterSummary = this.data.filterSummary;
        filterSummary.priceStar = {
            hidden: true,
            curCount: psData.psStates.curCount,
            current: psData.psStates.curCount ? 'current' : '',
            data: {
                ...psData.priceStar,
                requestFilterInfo: psData.requestFilterInfo
            }
        };

        this._setData({
            filterSummary
        }, true);
    },
    handleSortSelect (e) {
        const filterId = e.currentTarget.dataset.filterid;
        let filterSummary = this.data.filterSummary;

        // 已选中某个筛选项时，再次点击不刷新列表，也不关闭浮层
        const { filterId: currentFilterId } = filterSummary.sort.selectedInfo;
        if (currentFilterId === filterId) return;

        // 更新选中排序项
        filterSummary.sort = this.adjustSortInfo(filterSummary.sort.items, filterId);
        // 更新选中状态
        filterSummary.sort.hidden = true;
        filterSummary = this.fillFilterCurrentStatus(filterSummary, 'sort');

        this._setData({
            filterSummary
        }, true);
    },
    handleSort (e) {
        this.toggleFilterStatus('sort');
    },
    handleLocation (e) {
        this.toggleFilterStatus('area');
    },
    handlePriceStar (e) {
        this.toggleFilterStatus('priceStar');
    },
    handleFilter (e) {
        this.toggleFilterStatus('filter');
    },
    /**
     * 筛选下拉组件 展开/收起 状态控制
     * @param {string | undefined} 当前操作筛选类型
     * */
    toggleFilterStatus (type) {
        let fs = this.data.filterSummary;
        type !== 'filter' && (fs.filter.hidden = true);
        type !== 'area' && (fs.area.hidden = true);
        type !== 'priceStar' && (fs.priceStar.hidden = true);
        type !== 'sort' && (fs.sort.hidden = true);
        if (type && fs[type]) { // hidden or show someone
            fs[type].hidden = !fs[type].hidden;
        }
        // 设置current状态
        fs = this.fillFilterCurrentStatus(fs);

        this.setData({ filterSummary: fs });
    },
    fillFilterCurrentStatus (filterSummary, type) {
        const filter = filterSummary.filter;
        const area = filterSummary.area;
        const priceStar = filterSummary.priceStar;
        const sort = filterSummary.sort;
        const _filter = (filter) => {
            filter.current = (!filter.hidden || filter.selectedItems.length) ? 'current' : '';
        };
        const _area = (area) => {
            area.current = (!area.hidden || area.selectedItems.length) ? 'current' : '';
        };
        const _priceStar = (priceStar) => {
            priceStar.current = (!priceStar.hidden || priceStar.curCount > 0) ? 'current' : '';
        };
        const _sort = (sort) => {
            sort.current = (!sort.hidden || sort.selectedInfo.isOrderByUser) ? 'current' : '';
        };
        if (type) {
            if (type === 'filter') {
                _filter(filter);
            } else if (type === 'area') {
                _area(area);
            } else if (type === 'priceStar') {
                _priceStar(priceStar);
            } else if (type === 'sort') {
                _sort(sort);
            }
        } else {
            _filter(filter);
            _area(area);
            _priceStar(priceStar);
            _sort(sort);
        }

        return filterSummary;
    },
    /**
     * 加载排序
     */
    loadSortItems () {
        const req = this.constructSortRequest();
        commonrest.getHotelFilter(req, (data) => {
            if (data && data.filterInfo) {
                try {
                    const sortItems = JSON.parse(data.filterInfo);
                    // 保存排序项，getDefaultFilterSummary会从这里取
                    this.pageStatus.sortItems = sortItems;
                    this.setData({
                        'filterSummary.sort': this.adjustSortInfo(sortItems)
                    });
                } catch {

                }
            }
        }, () => {
        });
    },
    constructSortRequest () {
        const cityInfo = this.data.cityInfo;
        const dateInfo = this.data.dateInfo;
        const userCoordinate = this.pageStatus.userCoordinate;
        return {
            outdate: dateInfo.outDay,
            districtId: cityInfo.did,
            userCoordinate,
            channel: 1,
            indate: dateInfo.inDay,
            cityId: cityInfo.cityId,
            category: C.FILTER_CATEGORY_SORT
        };
    },
    getAdjustSortId (isShowIllSort) {
        const sortInfo = this.data.filterSummary.sort;
        const items = sortInfo.items || [];
        const curKey = sortInfo.selectedInfo.id;
        let adjustKey = '';
        if (isShowIllSort) { // 展示智能排序（如果选中了欢迎度排序需要切换为智能排序）
            adjustKey = curKey === POPULARITY_SORT_KEY ? ILL_SORT_KEY : '';
        } else { // 展示欢迎度排序（如果选中了欢迎度排序需要切换到智能排序）
            adjustKey = curKey === ILL_SORT_KEY ? POPULARITY_SORT_KEY : '';
        }
        const adjustItems = items.find(item => item.key === adjustKey);

        return adjustItems ? adjustItems.data?.filterId : '';
    },
    adjustSortInfo (sortItems, filterId) {
        const sortInfo = this.data.filterSummary.sort;
        const items = sortItems || sortInfo.items;
        const curFilterId = filterId || sortInfo.selectedInfo.filterId;
        const curKey = sortInfo.selectedInfo.id;
        if (items && items.length) {
            items.forEach(item => {
                // 有filterId优先用filterId判，否则用key
                const isCurrent = curFilterId
                    ? (item.data?.filterId === curFilterId)
                    : (item.key === curKey);
                if (isCurrent) {
                    sortInfo.selectedInfo = {
                        id: item.key,
                        title: item.title || ''
                    };
                }
                item.extra.selected = isCurrent;
            });
            sortInfo.items = items;
        }
        sortInfo.selectedInfo.filterId = curFilterId;
        const selectedId = sortInfo.selectedInfo.id;
        sortInfo.selectedInfo.isOrderByUser = selectedId !== ILL_SORT_KEY && selectedId !== POPULARITY_SORT_KEY;

        return sortInfo;
    },
    /**
     * 页面更新
     * @param {Object} renderData - 更新到页面的数据
     * @param {boolean} needLoadHotels - 是否需要重新加载酒店列表
     * @param {string} needSetLat -是否需要设置地图中心点，参数为设置中心点的类型
     */
    _setData (renderData, needLoadHotels, needSetLat) {
        this.setData(renderData);
        needLoadHotels && this.loadHotels(needSetLat);
    },
    regionChange (e) {
        // 阻止非用户手动触发的视野改变
        if (!this.pageStatus.regionChangeByUser) {
            e.type === 'end' && (this.pageStatus.regionChangeByUser = true);
            return;
        }

        this.pageStatus.addrFromMyLoc = false;
        const tData = this.data;
        if (e.type === 'begin') {
            tData.showCenterAddr && this.setData({ showCenterAddr: false });
        } else if (e.type === 'end') {
            // 缩放时中心点不变,不重发请求
            if (e.causedBy === 'drag') {
                const afterCenterLoc = (res) => {
                    const lat = res && res.latitude;
                    const lng = res && res.longitude;
                    if (!lat) return;

                    // 海外出无结果提示
                    if (country.outOfChina(lng, lat)) {
                        cwx.showToast({ title: '跑太远啦！暂不支持定位海外酒店哟', icon: 'none', duration: 3000 });
                        this.setData(this.noHotelsData(true));
                        return;
                    }

                    // 逆地址解析
                    const coordOpt = {
                        lat,
                        lng
                    };
                    geoService.locateWithCityInfo(coordOpt, this.addrThenReqHotels.bind(this), () => {});
                };

                this.mapCtx.getCenterLocation({
                    // type: 'gcj02',
                    success: afterCenterLoc
                });
            } else {
                tData.centerPointerText && tData.showCenterPointer && this.setData({ showCenterAddr: true });
            }
        }
    },
    addrThenReqHotels (resAddr) {
        resAddr || (resAddr = {});

        const pageS = this.pageStatus;
        const addr = resAddr.poiName || resAddr.address || '';
        // 设置中心点
        const freshData = {
            showCenterPointer: true,
            showCenterAddr: true,
            centerPointerText: addr,
            latitude: resAddr.lat,
            longitude: resAddr.lng
        };

        const defaultFilterSummary = this.getDefaultFilterSummary();
        // 拖动地图时，位置筛选项置空
        freshData['filterSummary.area'] = defaultFilterSummary.area;
        // 更新快筛状态
        freshData.filterSummary = this.fillQuickFilterStatus(this.data.filterSummary, [], C.FILTER_CATEGORY_AREA_FILTER);
        // 关键字命中poi，关键字清空
        pageS.isKeywordPOI && (pageS.keywordInfo.text = '');

        if (pageS.addrFromMyLoc) { // 我的定位
            const { lng, lat } = resAddr || {};
            if (country.outOfChina(lng, lat)) {
                cwx.showToast({ title: '跑太远啦！暂不支持定位海外酒店哟', icon: 'none', duration: 3000 });
                pageS.addrFromMyLoc = false;
                return;
            }
            pageS.userCoordinate = {
                cityId: resAddr.cityId,
                latitude: lat,
                longitude: lng
            };
            delete pageS.referencePoint;
            freshData.latitude = lat;
            freshData.longitude = lng;
            freshData.cityInfo = this.setCityInfo({ ...resAddr, isGeo: true });
        } else {
            pageS.referencePoint = {
                latitude: resAddr.lat,
                longitude: resAddr.lng
            };
        }
        // 城市被切换
        if (resAddr.cityId && this.data.cityInfo.cityId !== resAddr.cityId) {
            this.setNavTitle(resAddr);
            freshData.cityInfo = this.setCityInfo(resAddr);
            // 筛选项+关键字置空
            freshData.filterSummary = defaultFilterSummary;
            pageS.keywordInfo.text = '';
        }
        pageS.regionChangeByUser = false;
        this.setData(freshData);

        pageS.listTimer && clearTimeout(pageS.listTimer);
        pageS.listTimer = setTimeout(() => {
            this.loadHotels();
        }, 100);
    },

    setCityInfo (addrInfo = {}) {
        if (!addrInfo.cityId) return;

        const cityInfo = this.getDefaultCityInfo();
        cityInfo.cityId = addrInfo.cityId;
        cityInfo.cityName = addrInfo.cityName;
        if (addrInfo.isGeo) {
            const addr = addrInfo.poiName || addrInfo.address || '';
            cityInfo.isGeo = true;
            cityInfo.address = addr;
        }
        this.setNavTitle(cityInfo);
        return cityInfo;
    },
    getDefaultCityInfo () {
        return {
            cityId: 2,
            did: 0,
            cityName: '上海',
            dName: '', // 景区名
            address: '',
            poiName: '',
            biz: 1,
            tzone: 0,
            isGeo: false
        };
    },
    getLocation (e) {
        const self = this;
        wx.getSetting({
            success: (res) => {
                if (!res.authSetting['scope.userLocation']) {
                    commonfunc.afterLocateFailed(self, 1, () => {
                        wx.openSetting({
                            success (res) {
                                if (res.authSetting['scope.userLocation']) {
                                    self.getUserLoc();
                                };
                            }
                        });
                    });
                    this.setData({
                        showCenterPointer: false,
                        showCenterAddr: false
                    });
                } else {
                    self.getUserLoc();
                }
            },
            fail: (e) => {
                commonfunc.afterLocateFailed(self, 2); // 网络原因
            }
        });
    },
    getUserLoc () {
        this.pageStatus.addrFromMyLoc = true;
        geoService.locateWithCityInfo({ noCache: true }, this.addrThenReqHotels.bind(this), (err) => {
            this.pageStatus.addrFromMyLoc = false;
            const failMsg = (err && err.errMsg) || '';
            commonfunc.afterLocateFailed(this, failMsg, {}, 'listmap');
        });
    },
    closePriceDetail () {
        this.setData({
            showPriceDetail: false
        });
    },
    starPriceDetailInfo (e) {
        const { hid: hotelId } = e.currentTarget.dataset;
        const { hotel: hotelInfo, dateInfo } = this.data;
        if (hotelInfo) {
            const priceDetail = commonfunc.priceDetailNew(hotelInfo);

            this.setData({
                priceDetail,
                priceLayerSubtitle: priceDetail.isHourRoom ? '' : `${dateInfo.inDayText}-${dateInfo.outDayText} ${dateInfo.days}晚`,
                detailRoomId: hotelId,
                showPriceDetail: true,
                confirmBtnText: '酒店详情',
                priceDetailConfirmFuc: PRICE_CONFIRM_FUNC
            });
        }
    },
    getDefaultFilterSummary () {
        return {
            filter: { // 综合筛选
                displayText: '筛选',
                current: '',
                hidden: true,
                initialSelectedIds: null, // 初始化时需要选中的筛选项ID
                selectedItems: [],
                suggestItems: [], // 地图会带和酒店列表返回后更新组件用
                extra: {}
            },
            area: { // 位置区域
                displayText: '位置区域',
                current: '',
                hidden: true,
                initialSelectedIds: null, // 初始化时需要选中的筛选项ID
                selectedItems: [],
                suggestItems: [], // 地图会带和酒店列表返回后更新组件用
                optionSelectedItems: [], // 通过参数带入且在筛选项中不存在的项，页面回显用
                extra: {},
                optionAreaFilterId: '' // 参数带入位置区域筛选id
            },
            priceStar: { // 星级价格
                hidden: true,
                curCount: 0,
                current: '',
                data: {
                    text: '价格/星级',
                    star: [],
                    price: [],
                    requestFilterInfo: {}
                }
            },
            sort: {
                current: '',
                selectedInfo: {
                    title: '欢迎度排序',
                    id: 'sort-0|1', // 默认选中排序
                    filterId: '',
                    isOrderByUser: false // 是否用户主动选择排序
                },
                hidden: true,
                items: util.clone(this.pageStatus.sortItems),
                isShowIllSort: false // 是否展示智能排序
            },
            qs: { // 快筛
                hidden: true,
                items: [],
                selectedItems: []
            }
        };
    },
    hoteltap () {
        const id = this.data.hotel.hotelId;
        this.toDetailBody(id);
    },
    toDetailBody (hotelId) {
        if (!hotelId) return;

        const { countdownParams, selectMorning, sourceFromTag } = this.pageStatus;
        const { dateInfo: { inDay, outDay }, cityInfo: { cityId }, hotel: { isPriceWithDecimal, detailPositionDesc } } = this.data;

        let detailUrl = `../../detail/index?id=${hotelId}`;
        if (inDay && outDay) {
            detailUrl += `&inday=${inDay}&outday=${outDay}`;
        }
        selectMorning && (detailUrl += '&ismorning=1');
        // 来源标识
        sourceFromTag && (detailUrl += `&source_from_tag=${sourceFromTag}`);

        // 币种精度，透传
        if (isPriceWithDecimal !== undefined) {
            detailUrl += `&price_decimal=${isPriceWithDecimal ? '1' : '0'}`;
        }

        const filterInfo = this.getFilterInfo();
        const urlFilter = listfunc.urlToDetail(filterInfo);
        urlFilter && (detailUrl += urlFilter);

        detailUrl += cityId ? `&cityid=${cityId}` : '';
        countdownParams.showCountdown && (detailUrl += `&countdown=${JSON.stringify(countdownParams)}`);

        // 透传到详情页展示的位置信息
        if (detailPositionDesc) {
            detailUrl += `&detailPositionDesc=${detailPositionDesc}`;
        }
        cwx.navigateTo({
            url: detailUrl
        });
    },
    /**
     * 返回老版列表的filterInfo节点，以兼容埋点部分的逻辑，整体上线后可考虑重构此处
     * */
    getFilterInfo () {
        const fs = this.data.filterSummary;
        const starPriceInfo = fs.priceStar.data?.requestFilterInfo || {};
        const filterItemList = fs.filter.selectedItems
            .filter(item => item.operation?.isRoomFilter)
            .map(item => item.key);

        return {
            lowestPrice: starPriceInfo.lowestPrice || 0,
            highestPrice: starPriceInfo.highestPrice || 0,
            filterItemList,
            locationItemList: fs.area.selectedItems.map(item => item.key || item.data?.filterId),
            starItemList: fs.priceStar.data?.requestFilterInfo.starItemList || [],
            keyword: this.pageStatus.keywordInfo.text || ''
        };
    },

    onUnload () {
        this.toggleFilterStatus(); // 关闭所有弹窗
        const d = this.data;
        const pageS = this.pageStatus;
        pageS.listTimer && clearTimeout(pageS.listTimer);
        this.invokeCallback({
            cityInfo: d.cityInfo,
            dateInfo: d.dateInfo,
            keywordInfo: pageS.keywordInfo,
            filterSummary: d.filterSummary,
            referencePoint: pageS.referencePoint,
            searchAddr: d.centerPointerText,
            userCoordinate: pageS.userCoordinate || null,
            isPOI: false
        });
    },
    backList (e) {
        cwx.navigateBack();
    }
});
