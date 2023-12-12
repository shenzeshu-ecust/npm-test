import { cwx, CPage, _ } from '../../../cwx/cwx.js';
import C from '../common/C';
import listData from './listdata.js';
import Toolkit from './toolkit';
import detailReqUtil from '../detail/requtil.js';
import screenshotstrace from '../common/trace/screenshotstrace.js';
import listfunc from '../list/listfunc';
import psDefaData from '../components/pricestarfilter/pricestardata.js';
import huser from '../common/hpage/huser';
import commonfunc from '../common/commonfunc';
import commonrest from '../common/commonrest.js';
import components from '../components/components.js';
import cityModel from '../common/city/index.js';
import date from '../common/utils/date.js';
import util from '../common/utils/util.js';
import urlUtil from '../common/utils/url.js';
import storage from '../common/utils/storage.js';
import geoService from '../common/geo/geoservice.js';
import pricestarfunc from '../components/pricestarfilter/pricestarfunc';
import listtrace from '../common/trace/listtrace.js';
import macaocoupontrace from '../common/trace/macaocoupontrace.js';
import coupontrace from '../common/trace/coupontrace';
import forceLoginTrace from '../common/trace/forcelogintrace';
import loginbartrace from '../common/trace/loginbartrace.js';
import coupondata from '../common/coupondata';
import exposeTraceKey from '../common/trace/exposetracekey.js';
import datetrace from '../common/trace/datetrace';

const ILL_SORT_KEY = 'sort-45|1'; // 智能排序
const POPULARITY_SORT_KEY = 'sort-0|1'; // 欢迎度排序
const API_HOTEL_SEARCH = 'gethotellist'; // 主列表
const API_HOTEL_SEARCH_NEARBY = 'getnearbyhotellist'; // 唯一结果列表
const API_HOTEL_SEARCH_COMPENSATE = 'getcompensatehotellist'; // 搜索补偿列表
const PRICE_CONFIRM_FUNC = 'onPriceDetailConfirm'; // 价格明细浮层中确定按钮触发事件，去详情

const defaultFilterSummary = () => {
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
            isShowIllSort: false // 是否展示智能排序
        },
        qs: { // 快筛
            hidden: true,
            items: [],
            selectedItems: []
        }
    };
};

CPage({
    pageId: 'ignore_page_pv', // pageId初始值
    pageName: 'hotelList',
    autoExpose: 2, // 添加autoExpose属性，并设置其值为 2
    exposeThreshold: 0.3, // 发送曝光埋点相交比例的阈值
    exposeDuration: 500, // 发送曝光埋点停留时长的阈值
    checkPerformance: true, // 白屏检测添加标志位
    /* 页面渲染相关数据，与页面渲染无关的尽量不要放到这里面 */
    data: {
        isIOS: commonfunc.isIOS(),
        priceStarXtaroSwitch: false, // 价格/星级说明详情是否跳转xtaro页面开关
        hotels: [], // 主酒店列表（页面渲染用）
        recommendHotels: [], // 推荐酒店列表
        recommendDesc: '', // 推荐描述
        priceDetail: null, // 价格问号浮层
        cityInfo: {
            cityId: 0,
            cityName: '',
            did: 0,
            dName: '', // 景区名
            address: '',
            biz: 1,
            isGeo: false, // 我的附近查询
            tzone: 0
        },
        dateInfo: { // 入离日期信息
            shortInDay: date.today().slice(5),
            shortOutDay: date.tomorrow().slice(5),
            inDay: date.today(),
            outDay: date.tomorrow(),
            days: 1,
            isMorning: false,
            selectMorning: false,
            isLongRent: false // 长租房场景, days >= 30
        },
        keywordInfo: { // 关键词信息（考虑选搜设计成对象）
            key: '',
            text: ''
        },
        filterSummary: defaultFilterSummary(), // 筛选项信息
        selectedFilters: [], // 当前选中所有筛选项（底部回显用）
        sloganInfo: {
            list: [],
            desc: '携程提供极具竞争力的酒店价格'
        },
        hiddenNavBack: false,
        isIphoneX: util.isIPhoneX(),
        hotelCount: 0, // 酒店数量
        showHotelCountToast: false,
        showFishBone: true, // 初始展示鱼骨，再次请求展示loading
        showLoading: false, // 页面中间loading，初次进入页面/更改筛选条件时会出现
        hotelLoading: true, // 翻页时页面底部的loading
        loadingFirstPage: true,
        hasNextPage: true, // 是否有下一页
        noHotels: false, // 搜索酒店无结果
        hideBackToTop: true, // 是否展示一键返回顶部
        listTop: 0,
        hideTopShadow: true,
        hasEmegencyNotice: false,
        showCollectionGuide: false, // 是否展示收藏引导
        relatedCityInfo: null,
        isLoggedin: true,
        memberBannerSrc: '', // 会员等级banner
        isHourroomModule: false, // 是否是钟点房
        hourRoomLayer: {},
        isQuickApp: commonfunc.isQuickApp(), // 是否快应用
        isWechat: commonfunc.isWechat(), // 是否微信小程序
        realNamePop: { // 澳门券实名认证弹窗
            enable: false,
            message: ''
        },
        countdownParams: { // 倒计时挂件
            showCountdown: false
        },
        macaoPop: { // 澳门券发券弹窗
            enable: false,
            imgSrc: '',
            coupons: []
        },
        showThirteenBanner: false,
        thirteenBannerList: [],
        showCouponLayer: false,
        bannerFloatData: null,
        hotelCouponsModule: null,
        rewardModule: null,
        bannerBasicInfo: {} // 优惠券banner
    },
    /* 与页面渲染无关的一些参数 */
    pageStatus: {
        isFirstHotelList: true, // 是否是第一次hotellist标识。防止第一次hotellist请求回来之前，用户点击进入日历选择页
        isFirstShow: true, // 是否是第一次onShow
        oldFilterInfo: {},
        selectedCityInfo: null,
        sourceFromTag: '', // 页面来源参数
        listReqParams: { // 主列表请求参数（与页面渲染无关部分）
            pageIndex: 1,
            sessionId: '',
            topHotels: [],
            referencePoint: null // 参照点
        },
        chooseHourroomDate: false, // !isHourroomModule && 日历页选择了A住A离 || 查询页带参
        recommendPageIndex: 1, // 补偿酒店列表pageIndex
        recommendSessionId: '', // 补偿酒店列表sessionId
        currentListApiName: API_HOTEL_SEARCH, // 当前请求列表api名
        calendarJumping: false,
        isPOI: false,
        preLoadHotelsInterval: null,
        filterComponentObj: null, // 筛选组件实例
        areaComponentObj: null,
        windowHeight: 0,
        sloganIndex: 0,
        needJumpToLogin: true,
        sortItems: [], // 服务下发的所有排序项保存在这里
        traceTimeConsuming: true, // 是否需要页面耗时埋点
        trackId: null,
        isLandingPage: false,
        hotelListLoadProcessing: false, // 是否正在加载酒店列表
        hotelListLoadTaskQueue: [], // 酒店列表加载任务队列
        pictureSwiper: { current: 0, switching: false },
        hasSearchTrace: false, // 是否第一次触发搜索曝光埋点
        outScreen: true, // 十三位是不是不在曝光内
        thirteenBannerCurrent: 0, // 十三位当前banner下标
        listABTestResults: {} // 用于存储需要发给服务的AB实验结果
    },
    model: {
        timeZoneDate: null, // 时间工具类
        /* 客户端位置信息 */
        clientPos: {
            lng: 0,
            lat: 0,
            cityId: 0
        },
        hotelInfoMap: {}, // 服务下发的酒店信息放这里
        preloadInfo: { // 查询页预加载信息
            requestData: null
        },
        detailLoadInfo: {}, // 预加载酒店详情
        countDownTaskStatus: null // 交叉浏览任务状态
    },
    async onLoad (options) {
        let { ishourroommodule, ishourroomdate, needlogin, searchfilter, poiValue } = options;
        if (searchfilter) {
            this.pageStatus.searchFilter = JSON.parse(searchfilter);
        }
        if (poiValue) {
            this.pageStatus.poiValue = poiValue;
        }
        ishourroommodule = ishourroommodule === '1';
        this.pageStatus.chooseHourroomDate = !ishourroommodule && ishourroomdate === '1';
        this.pageStatus.needlogin = needlogin === '1'; // 需要强制登录

        this.model.timeZoneDate = date.TimeZoneDate.create();
        // 保存options
        this.options = options;

        const enablePreload = options.from !== 'keyword'; // 防止查询页搜索关键词后直接跳入列表页，hotellist使用了预加载数据，未带关键词

        this.setData({
            isLoggedin: cwx.user.isLogin(),
            isHourroomModule: ishourroommodule
        });
        this.initPage(options, enablePreload);

        // 处理AB实验结果
        await this.handleABResult();
    },
    onShow () {
        const ps = this.pageStatus;
        const { isLoggedin, dateInfo } = this.data;
        const actualLogin = cwx.user.isLogin();
        if (isLoggedin !== actualLogin) {
            this._setData({
                isLoggedin: actualLogin
            }, true);
            this.getPromotionBanner();
            this.checkFlowActivities(dateInfo.inDay, dateInfo.outDay);
        }

        ps.calendarJumping = false;
        // 截屏埋点
        screenshotstrace.addScreenObserver(this.screenShotTrace);
        !ps.isFirstShow && util.exUbtSendPV(this, {
            pageId: this.pageId,
            isBack: true
        });
        ps.isFirstShow = false;

        // 场景：点击助力后返回
        if (ps.needRefreshAssistCoupon) {
            ps.needRefreshAssistCoupon = false;
            this.getPromotionBanner();
        }

        // 筛选项反选
        if (this.pageStatus.searchFilter) {
            this.updateSuggestArea([this.pageStatus.searchFilter.filterId], { withoutReload: true });
            this.updateSuggestFilter([this.pageStatus.searchFilter.filterId], { withoutReload: true });
        }
    },
    toLoginTap () {
        this.toLogin();
        this.clickLoginBarTrace();
    },
    // 登录引导
    toLogin (isForceLogin) {
        commonfunc.toLogin(this, () => {
            this.setData({
                'hourRoomLayer.isShown': false,
                showForceLogin: false,
                hiddenNavBack: false
            });
        }, () => {
            if (isForceLogin) {
                this.setData({
                    showForceLogin: true,
                    hiddenNavBack: true
                });
                forceLoginTrace.showFLbutton(this);
            }
        });
    },
    forceToLogin () {
        this.toLogin(true);
        forceLoginTrace.clickFLbutton(this);
    },
    onHide () {
        // 移除截屏埋点
        screenshotstrace.removeScreenObserver(this.screenShotTrace);
    },
    onReady () {
        // 获取屏幕高度
        const self = this;
        wx.getSystemInfo({
            success (res) {
                if (res) {
                    self.pageStatus.windowHeight = res.windowHeight;
                }
            }
        });
    },
    onUnload () {
        const ps = this.pageStatus;
        clearInterval(ps.preLoadHotelsInterval);

        if (this.getOpenerEventChannel) {
            const ec = this.getOpenerEventChannel();
            const dates = this.data.dateInfo;
            const keywordInfos = this.data.keywordInfo;
            if (ec && ec.emit && dates.inDay) {
                const nd = {
                    selectedCityInfo: ps.selectedCityInfo,
                    keywordInfo: {
                        text: keywordInfos.text
                    },
                    dateInfo: {
                        inDay: dates.inDay,
                        outDay: dates.outDay,
                        isHourroomDate: ps.chooseHourroomDate
                    },
                    isHourroom: this.data.isHourroomModule
                };
                ec.emit('acceptInquireDataFromOpenedPage', nd);
            }
        }

        listtrace.navBackClick(this, {
            isoversea: this.data.cityInfo.biz === 1 ? 'inland' : 'oversea'
        });
        screenshotstrace.removeScreenObserver(this.screenShotTrace);
        if (ps.quickExposeObserver) {
            ps.quickExposeObserver.disconnect();
            delete ps.quickExposeObserver;
        }
    },
    onShareAppMessage () {
        const d = this.data;
        const cityInfo = d.cityInfo;
        const dateInfo = d.dateInfo;
        let title = '携程旅行酒店';
        let shareUrl = 'pages/hotel/list/index?';
        shareUrl += `cityname=${cityInfo.cityName}` +
            `&cityid=${cityInfo.cityId}` +
            `&did=${cityInfo.did}` +
            `&biz=${cityInfo.biz}`;
        if (cityInfo.isGeo && cityInfo.lat && cityInfo.lng) {
            title = `${cityInfo.address || ''}附近好店推荐，快来看看吧`;
            shareUrl += `&lat=${cityInfo.lat}&lng=${cityInfo.lng}&address=${cityInfo.address}&isgeo=true`;
        } else {
            title = `我分享了${cityInfo.cityName}的酒店给你`;
        }
        // 入离日期
        shareUrl += '&inday=' + dateInfo.inDay + '&outday=' + dateInfo.outDay;
        // 关键词
        const keyword = this.data.keywordInfo.text;
        if (keyword && this.data.hotels && this.data.hotels.length) {
            shareUrl += `&keyword=${keyword}`;
        }
        // 分享埋点
        this.ubtTrace('hotel_list_share', {
            cityid: cityInfo.cityId,
            cityname: cityInfo.cityName,
            inday: dateInfo.inDay,
            outday: dateInfo.outDay
        });

        return {
            bu: 'hotel',
            title,
            desc: '',
            path: shareUrl
        };
    },
    // yymmdd转yy-mm-dd
    formatTime (time) {
        return date.formatTime('yyyy-MM-dd', date.parse(time));
    },
    initPage (options, enablePreload) {
        const ps = this.pageStatus;
        ps.preTime = Date.now();
        if (options.tophotels) {
            ps.listReqParams.topHotels = options.tophotels.split(',');
        }
        ps.isLandingPage = commonfunc.isLandingPage();
        ps.sourceFromTag = options.source_from_tag || '';
        // 收藏引导气泡
        const showCollectionGuide = !storage.getStorage('P_HOTEL_COLLECTION_GUIDE_OPEN');
        // 城市
        const cityId = ~~options.cityid;
        const did = ~~options.did;
        const biz = ~~options.biz || 1;
        const isOversea = biz !== 1;
        const cityInfo = this.getDefaultCityInfo(); // TODO: 先给个默认值，可考虑改成走用户定位城市
        if (cityId) {
            cityInfo.cityId = cityId;
            cityInfo.cityName = options.cityname || '';
            cityInfo.did = did;
            cityInfo.biz = biz;
            cityInfo.dName = options.dname || '';
        }
        // 更新pageId
        this.setPageIdCom(biz);
        const { isLoggedin } = this.data;
        !isLoggedin && this.showLoginBarTrace();
        // 定位
        let { isgeo: isGeo, lat, lng } = options;
        if (lat && lng) {
            lat = +lat;
            lng = +lng;
            const locInfo = { lat, lng };
            if (isGeo) {
                cityInfo.isGeo = isGeo.trim().toLowerCase() === 'true';
                cityInfo.address = options.address || '';
                cityInfo.lat = lat;
                cityInfo.lng = lng;
                locInfo.cityId = cityId;
            }
            this.setClientPosition(locInfo);
        }

        // 日期
        const cacheDate = storage.getStorage(C.STORAGE_USER_SELECT_DATE);
        const inDay = this.formatTime(options.inday || cacheDate?.inDay || date.today());
        const outDay = this.formatTime(options.outday || cacheDate?.outDay || date.tomorrow());
        const dateInfo = this.getDateInfo(inDay, outDay);
        const keyword = options.filterval || options.keyword;
        // 关键词
        const keywordInfo = {
            key: options.filterkey || '',
            text: keyword ? decodeURIComponent(keyword) : ''
        };
        // poilat & poilng
        if (options.poilat && options.poilng) {
            ps.listReqParams.referencePoint = {
                latitude: options.poilat,
                longitude: options.poilng
            };
        }
        let filterSummary = this.getDefaultFilterSummary();
        // 星级价格
        if (options.pricekeys || options.starkeys) {
            let priceArr = [];
            let starArr = [];
            if (options.pricekeys) {
                priceArr = options.pricekeys.split(',');
            }
            if (options.starkeys) {
                starArr = options.starkeys.split(',');
            }
            filterSummary = this.fillPriceStarData(filterSummary, priceArr, starArr, biz !== 1);
        }
        // 优惠促销
        const filterIds = this.getInitialFilterIds(options);
        filterSummary.filter.initialSelectedIds = filterIds;
        // 距离
        const areaIds = this.getInitialAreaFilterIds(options);
        filterSummary.area.initialSelectedIds = areaIds;
        // 参数带入的地标
        if (options.sl) {
            filterSummary.area.optionAreaFilterId = options.sl;
        }

        this._setData({
            cityInfo,
            dateInfo,
            keywordInfo,
            filterSummary,
            showCollectionGuide,
            isOversea
        }, false);

        // 预加载
        const hasFilterSelected = !!filterIds.length || !!areaIds.length;
        this.processPreLoadInfo({ hasFilterSelected, enablePreload });
        // 处理参数传入筛选
        // 百度小程序生命周期和微信不太一样，会先触发组件的ready，所以需要在这里调用一下，防止转百度后参数不生效
        if (hasFilterSelected) {
            if (filterIds.length) {
                this.updateSuggestFilter(filterIds);
            }
            if (areaIds.length) {
                this.updateSuggestArea(areaIds);
            }
        }
        // 下载排序项
        this.loadSortItems();
        // 万能开关
        this.checkUniversalSwitches();
        // 澳门券发券弹窗
        this.macaoCoupons();
        // 检查交叉浏览任务状态
        this.checkFlowActivities(inDay, outDay);
        // 获取第十三位banner
        this.thirteenBanner();
        // 请求列表页新版优惠券banner
        this.getPromotionBanner();
        this.setDateStorage(options.inday, options.outday);
    },
    processPreLoadInfo ({ hasFilterSelected, enablePreload }) {
        // 带促销或距离等筛选，在筛选组件ready时加载筛选项，并confirm触发loadHotels
        if (hasFilterSelected) return;

        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        const needPreLoad = enablePreload && prevPage?.pageName === 'hotelInquire' && !this.isHourRoomSearch();
        if (!needPreLoad) {
            this.loadHotels();
            return;
        }

        // 使用预加载信息或者重试超时后loadHotels
        const afterCompleted = () => {
            const preLoadInfo = prevPage.model.hotelLoadInfo || {};
            const hotelListData = preLoadInfo.hotelListData || {};
            if (hotelListData.cityId !== this.data.cityInfo.cityId) {
                this.loadHotels();
                return;
            }

            this.pageStatus.fromPreLoad = true;
            // 保存预加载酒店的Request
            this.model.preloadInfo.requestData = preLoadInfo.requestData;
            // 保存预加载的trackId
            this.pageStatus.trackId = hotelListData.trackId;
            // 渲染预加载酒店列表
            this.processHotelData(hotelListData, 1);
            // 删除预加载数据
            prevPage.model.hotelLoadInfo = {};
        };

        if (hasPreLoadCompleted()) {
            afterCompleted();
        } else {
            let retryTimes = 0;
            this.pageStatus.preLoadHotelsInterval = setInterval(() => {
                if (hasPreLoadCompleted() || retryTimes > 50) {
                    clearInterval(this.pageStatus.preLoadHotelsInterval);
                    afterCompleted();
                }
                retryTimes++;
            }, 50);
        }

        function hasPreLoadCompleted () {
            return prevPage.model?.hotelLoadInfo?.completed;
        }
    },
    // 处理AB实验结果
    async handleABResult () {
        const ABTestingMap = {
            ABTESTING_HTL_XCXJL: '', // 房型列表激励实验
            ABTESTING_TRAVEL_COUPON: ''
        };

        const { abVersionData, adVersionStatus: listABTestResults } = await commonfunc.getABTestingResults(ABTestingMap);
        this.pageStatus.listABTestResults = listABTestResults;
        Object.keys(abVersionData).length && this.setData(abVersionData);
    },
    /**
     * 兼容暴露在url参数里的筛选参数，返回对应的filterId数组
     * */
    getInitialFilterIds (options) {
        const { hoteldiscount, h, filter } = options;
        const ids = [];
        // 全部优惠促销
        if (hoteldiscount === 'hoteldiscount') {
            ids.push('65|9999');
        }
        // 品牌
        if (h) {
            h.split(',').forEach(val => ids.push(`${C.BRAND_FILTER_PREFIX}${val}`));
        }
        // 筛选项
        if (filter) {
            filter.split(',').forEach(val => ids.push(val));
        }
        return ids;
    },
    /**
     * 兼容暴露在url参数里的位置区域参数，返回对应的filterId数组
     * */
    getInitialAreaFilterIds (options = {}) {
        const { distance } = options;
        const ids = [];
        if (distance === 'distance-3') {
            ids.push('14|2'); // 新版筛选没有3公里内，用2公里代替（filterId为 14|2）
        }

        return ids;
    },

    handleCustomBack (e) {
        const isLandingPage = this.pageStatus.isLandingPage;
        const { cityInfo, dateInfo } = this.data;
        let url = '../inquire/index?';
        const urlParams = {};
        if (!cityInfo.isGeo) {
            urlParams.cityid = cityInfo.cityId;
        }
        if (!isLandingPage) {
            cwx.navigateBack({
                fail: function () {
                    url += urlUtil.paramString(urlParams);
                    cwx.reLaunch({ url });
                }
            });
        } else {
            const { inDay, outDay } = dateInfo;
            const { chooseHourroomDate, sourceFromTag } = this.pageStatus;
            if (inDay && outDay) {
                urlParams.inday = inDay;
                urlParams.outday = outDay;
            }
            // 钟点房
            chooseHourroomDate && (urlParams.ishourroomdate = 1);
            // 来源标识
            sourceFromTag && (urlParams.source_from_tag = sourceFromTag);
            url += urlUtil.paramString(urlParams);
            cwx.reLaunch({ url });
        }
    },

    selectCity (e) {
        this.toggleFilterStatus();

        const biz = this.data.cityInfo.biz;
        const setHistory = (citydata) => {
            if (!citydata) return;

            if (citydata.inlandCities) {
                citydata.inlandCities.historyCities = storage.getStorage('P_HOTEL_CITY_HISTORY_INLAND') || [];
            }
            if (citydata.interCities) {
                citydata.interCities.historyCities = storage.getStorage('P_HOTEL_CITY_HISTORY_OVERSEA') || [];
            }
            citydata.type = (biz === 1) ? 'domestic' : 'oversea';
        };
        const self = this;
        const cp = this.model.clientPos;
        const dateInfo = this.data.dateInfo;
        const searchParams = {
            checkin: dateInfo.inDay,
            checkout: dateInfo.outDay,
            userCityId: cp.cityId,
            userLat: cp.lat,
            userLng: cp.lng,
            fromList: true,
            isHourroomModule: this.data.isHourroomModule
        };
        components.city({
            searchParams,
            loadData: function (callback) {
                const citydata = storage.getStorage('hotelCities');
                if (citydata) {
                    setHistory(citydata);
                    callback(citydata);
                } else {
                    cityModel.doRequest(function (citydata) {
                        storage.setStorage('hotelCities', citydata, 720);
                        setHistory(citydata);
                        callback(citydata);
                    });
                }
            },
            handleCurrentPosition: function (data, next) {
                geoService.locateWithCityInfo({
                    lat: data.latitude,
                    lng: data.longitude
                }, (city) => {
                    self.setClientPosition(city);
                    next({
                        cityName: city.cityName + ' ', // fixbug HTL12WL-3493,加个空格防止选择上海后因为城市名相等又展示了定位的数据
                        address: city.address,
                        title: city.address,
                        poiName: city.poiName,
                        cityId: city.cityId,
                        did: 0,
                        type: city.type,
                        biz: city.biz,
                        lat: city.lat,
                        lng: city.lng,
                        isGeo: true
                    }, () => {
                        next(null);
                    });
                });
            }
        }, this.updateCity);
    },
    showCalender (e) {
        if (e && this.pageStatus.calendarJumping && !this.pageStatus.isFirstHotelList) return;
        this.toggleFilterStatus();

        let calendarPlugin = 'calendar';
        this.pageStatus.calendarJumping = true;
        const chooseHourroomDate = this.pageStatus.chooseHourroomDate;
        const chooseDate = this.data.dateInfo;
        const { tzone = 0, biz = 1 } = this.data.cityInfo;
        const timeZoneDate = this.model.timeZoneDate;
        if (!timeZoneDate) {
            return false;
        };

        const params = {
            inDay: chooseDate.inDay,
            outDay: chooseDate.outDay,
            endDate: date.addDay(date.today(tzone), 365),
            title: '选择日期',
            timeZoneDate,
            isMorning: chooseDate.isMorning,
            maxStayDays: 180
        };

        if (this.data.isHourroomModule) {
            calendarPlugin = 'hourroomcalendar';
        }

        params.allowHourroomDate = biz === 1;
        chooseHourroomDate && (params.outDay = params.inDay);
        components[calendarPlugin](params, (d) => {
            this.updateDate(d.inDay, d.outDay, d.isHourroomDate);
        });
    },

    openKeyword (e) {
        const self = this;
        self.toggleFilterStatus();

        const d = self.data;
        const ps = self.pageStatus;
        const cityInfo = d.cityInfo;
        const dateInfo = d.dateInfo;
        const keywordInfo = d.keywordInfo;
        const userLoc = self.model.clientPos;
        cwx.getCurrentPage().navigateTo({
            url: `../keywordsearch/index?biz=${cityInfo.biz}`,
            data: {
                keyword: keywordInfo.text || '',
                cityid: cityInfo.cityId,
                cityname: cityInfo.cityName,
                did: cityInfo.did,
                inday: dateInfo.inDay,
                outday: dateInfo.outDay,
                userCityId: userLoc.cityId,
                lat: userLoc.lat,
                lng: userLoc.lng,
                from: 'list'
            },
            callback: function (keyBackInfo) {
                ps.searchAddr = ''; // 更改条件时，带入地图中心点位置清空
                ps.listReqParams.referencePoint = null;
                ps.isPOI = keyBackInfo.isPOI;
                ps.searchFilter = keyBackInfo.searchFilter;

                const keywordCityInfo = keyBackInfo.cityInfo || {};
                const { cityChanged, cityName, dtype, name } = keywordCityInfo;
                if (cityChanged) { // 异地(keyword修改在selectedcity中)
                    cwx.showToast({
                        title: `城市已切换到 ${(Number(dtype) === 12 && name && `${name}(${cityName})`) || cityName}`,
                        icon: 'none',
                        duration: 2000
                    });
                    self.updateCity(keywordCityInfo);
                } else { // 同城
                    // clear filer info
                    const selectedFilters = d.filterSummary.filter.selectedItems;
                    const selectedAreaFilters = d.filterSummary.area.selectedItems;
                    const selectedAreaOptionItems = d.filterSummary.area.optionSelectedItems;
                    if (!_.isEmpty(selectedFilters)) {
                        ps.filterComponentObj.updateBySuggestSelectedIds([], { withoutReload: true });
                    }
                    if (!_.isEmpty(selectedAreaFilters) || !_.isEmpty(selectedAreaOptionItems)) {
                        ps.areaComponentObj.updateBySuggestSelectedIds([], { withoutReload: true });
                    }
                    // update keyword
                    keywordInfo.text = keyBackInfo.keyword;
                    self._setData({
                        keywordInfo
                    }, true);
                }
            }
        });
        // 搜索模块发送曝光埋点
        const exposureData = {
            searchListExposeObj: {
                data: {
                    triggerTime: new Date().getTime(),
                    page: this.pageId
                },
                ubtKeyName: exposeTraceKey.HOTEL_LIST_SEARCH_KEY
            }
        };
        this.sendExposureTrace(exposureData);
    },
    clearKeyword (e) {
        const ps = this.pageStatus;
        const d = this.data;
        const selectedFilters = d.filterSummary.filter.selectedItems;
        const selectedAreaFilters = d.filterSummary.area.selectedItems;
        const selectedAreaOptionItems = d.filterSummary.area.optionSelectedItems;
        if (!_.isEmpty(selectedFilters)) {
            ps.filterComponentObj.updateBySuggestSelectedIds([], { withoutReload: true });
        }
        if (!_.isEmpty(selectedAreaFilters) || !_.isEmpty(selectedAreaOptionItems)) {
            ps.areaComponentObj.updateBySuggestSelectedIds([], { withoutReload: true });
        }
        this.pageStatus.searchFilter = null;
        this._setData({
            'keywordInfo.text': ''
        }, true);
    },

    toListMap (e) {
        this.toggleFilterStatus(); // 关闭所有弹窗
        const self = this;
        const pageS = this.pageStatus;
        const listParams = pageS.listReqParams;
        const d = this.data;
        const countdownParams = d.countdownParams;
        const dataToMap = {
            isPOI: pageS.isPOI,
            cityInfo: d.cityInfo,
            dateInfo: d.dateInfo,
            sourceFromTag: pageS.sourceFromTag,
            filterSummary: d.filterSummary,
            topHotelIds: listParams.topHotels,
            keywordInfo: d.keywordInfo,
            searchAddr: pageS.searchAddr,
            referencePoint: pageS.listReqParams.referencePoint,
            chooseHourroomDate: pageS.chooseHourroomDate
        };
        const clientPos = this.model.clientPos;
        if (clientPos.cityId > 0) {
            dataToMap.userCoordinate = {
                cityId: clientPos.cityId,
                latitude: clientPos.lat,
                longitude: clientPos.lng
            };
        }
        // 防止跳转地图页时交叉浏览参数丢失
        countdownParams.showCountdown && (dataToMap.countdownParams = countdownParams);
        cwx.getCurrentPage().navigateTo({
            data: dataToMap,
            url: 'listmap/index',
            callback: (mapBackInfo) => {
                if (mapBackInfo) {
                    const { cityInfo, dateInfo, keywordInfo, filterSummary, referencePoint, searchAddr, userCoordinate, isPOI } = util.clone(mapBackInfo);
                    pageS.isPOI = isPOI;
                    pageS.listReqParams.pageIndex = 1;
                    pageS.listReqParams.referencePoint = referencePoint;
                    pageS.searchAddr = searchAddr; // 地图逆地址解析地点
                    self.model.clientPos = {
                        lng: userCoordinate.longitude,
                        lat: userCoordinate.latitude,
                        cityId: userCoordinate.cityId
                    };
                    const selectedFilterIds = filterSummary.filter.selectedItems.map(item => item.data.filterId);
                    const selectedAreaFilterIds = filterSummary.area.selectedItems.map(item => item.data.filterId);
                    if (!_.isEmpty(selectedFilterIds)) {
                        pageS.filterComponentObj.updateBySuggestSelectedIds(selectedFilterIds, { withoutReload: true });
                    }
                    if (!_.isEmpty(selectedAreaFilterIds)) {
                        pageS.areaComponentObj.updateBySuggestSelectedIds(selectedAreaFilterIds, { withoutReload: true });
                    }
                    pageS.poiValue = null;
                    const filterObj = pageS.filterComponentObj;
                    if (filterObj && pageS.searchFilter?.filterId && !filterObj.existingInFilter(pageS.searchFilter.filterId)) {
                        pageS.searchFilter = null;
                    }
                    if (d.cityInfo.cityId !== cityInfo.cityId) {
                        pageS.searchFilter = null;
                        // 更新新版优惠券banner
                        self.getPromotionBanner();
                    }
                    self._setData({
                        cityInfo,
                        dateInfo,
                        keywordInfo,
                        filterSummary
                    }, true);
                    pageS.selectedCityInfo = cityInfo;
                    // 更新pageId
                    this.setPageIdCom(cityInfo.biz);
                }
            }
        });
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
        const exposureData = {
            filterExposeObj: {
                data: {
                    triggerTime: new Date().getTime(),
                    page: this.pageId
                },
                ubtKeyName: exposeTraceKey.HOTEL_LIST_FILTER_KEY
            }
        };
        this.sendExposureTrace(exposureData);
    },
    tapBrowsedFilter (e) {
        // TODO
    },
    updateFilterStatus (filterId = '', withoutFilterMap = false, withoutReload = false) {
        const filterSummary = this.data.filterSummary;
        const quickFilters = filterSummary?.qs?.items || [];
        const quickFilter = quickFilters.find(item => item.data?.filterId === filterId);
        // 仅更新选中状态一次
        if (!withoutReload) {
            quickFilter.extra.selected = !quickFilter.extra.selected;
        }
        // 标识筛选项中未存在的快筛id
        withoutFilterMap && (quickFilter.withoutFilterMapId = true);
        this._setData({
            filterSummary
        }, true);
    },
    /**
     * 快筛项的tab事件，目前快筛分3种：
     * 1. 筛选组件里的快筛项，需要更新筛选组件数据。
     *    组件未初始化时，为了不阻塞酒店列表更新，先setData更新酒店列表，异步更新组件；组件已初始化时直接走组件更新
     * 2. 位置区域组件里的快筛项（逻辑同1）
     * 3. 普通快筛，直接更新
     * */
    handleQuickFilter (e) {
        const self = this;
        const { id: filterId, index } = e.currentTarget.dataset || {};
        const filterSummary = this.data.filterSummary;
        const quickFilters = filterSummary.qs.items;
        const quickFilter = quickFilters.find(item => item.data?.filterId === filterId);
        if (quickFilter) {
            const scenarios = quickFilter.scenarios || [];
            if (scenarios.includes(C.FILTER_CATEGORY_FILTER)) { // 筛选
                const filterObj = this.pageStatus.filterComponentObj;
                if (filterObj) {
                    const initialized = filterObj.initialized();
                    // 组件未初始化数据的时候，在这里setData刷新酒店列表，否则走updateByTriggerFilterId里的更新
                    if (!initialized) {
                        this.updateFilterStatus(filterId);
                    }
                    filterObj.updateByTriggerFilterId(filterId, { withoutReload: !initialized });
                }
            } else if (scenarios.includes(C.FILTER_CATEGORY_AREA_FILTER)) { // 位置区域
                const areaObj = this.pageStatus.areaComponentObj;
                if (areaObj) {
                    const initialized = areaObj.initialized();
                    if (!initialized) {
                        this.updateFilterStatus(filterId);
                    }
                    areaObj.updateByTriggerFilterId(filterId, { withoutReload: !initialized });
                }
            } else { // 其他快筛
                this.updateFilterStatus(filterId);
            }
            clickTrace(quickFilter, index);
        }

        // 点击埋点
        function clickTrace (filter, index) {
            const { data, extra, title } = filter;
            const { isOversea, cityInfo } = self.data;
            if (extra.selected) {
                const { type, filterId } = data;
                listtrace.quickFilterClick(self, isOversea, {
                    filterrank: index + 1,
                    filtertype: type,
                    filterid: filterId,
                    filtername: title,
                    cityid: cityInfo.cityId,
                    masterhotelid_tracelogid: self.pageStatus.requestId,
                    propertylist: [],
                    masterhotelid_dispatchid: ''
                });
            }
        }
    },
    // 处理筛选项中未存在快筛项的选中状态
    handleQuickFilterSelectStatus (e) {
        const { filterKey: filterId, extra } = e.detail;
        const withoutReload = extra?.withoutReload;
        this.updateFilterStatus(filterId, true, withoutReload);
    },
    showQuickFilters () {
        const self = this;
        const ps = self.pageStatus;
        ps.exposeFilterId = {};
        const { isOversea, cityInfo, filterSummary } = self.data;
        const quickFilters = filterSummary.qs.items || [];
        let exposeSummaryNum = Math.min(5, quickFilters.length); // 曝光快筛总个数，大部分机型一屏展示5个，默认5

        try {
            ps.quickExposeObserver = wx.createIntersectionObserver(self, {
                thresholds: [0.5],
                observeAll: true
            })
                .relativeToViewport({ left: 0 })
                .observe('.quick-filter-item', (res) => {
                    const { id, dataset = {} } = res;
                    const quickFilter = quickFilters.find(item => item.data?.filterId === dataset.id);
                    if (!ps.exposeFilterId[id] && quickFilter) {
                        ps.exposeFilterId[id] = true;
                        const { data, title } = quickFilter;
                        dataset.index >= 5 && exposeSummaryNum++;
                        listtrace.quickFilterShow(self, isOversea, {
                            cityid: cityInfo.cityId,
                            subtab: isOversea ? 1 : 0,
                            masterhotelid_tracelogid: ps.requestId,
                            masterhotelid_dispatchid: '',
                            filterNum: exposeSummaryNum, // 列表页快筛项曝光的个数
                            fastfilterlist: [{
                                fastfiltertype: data.type,
                                fastfiltername: title,
                                fastfiltertitle: data.type,
                                fastfiltersubtype: data.subType,
                                fastfilterid: data.filterId,
                                fastfilterrank: dataset.index + 1
                            }]
                        });
                    }
                });
        } catch (e) {
            this.ubtDevTrace && this.ubtDevTrace('d_HTL_WX_list_expose_err', e);
        }
    },
    toTop (e) {
        this.setData({
            hideBackToTop: true,
            listTop: 0
        });
    },
    handleEmegencyNotice (e) {
        const hasEmegencyNotice = e.detail;
        this.setData({
            hasEmegencyNotice
        });
    },
    /**
     * 底部筛选条件删除
     * 价格星级，快筛删除时，需要手动维护selectedFilters里状态，筛选，位置区域和关键字会触发各自的confirm方法，不用在这里处理
     * */
    handleRemoveFilter (e) {
        const dataset = e.currentTarget.dataset;
        const id = dataset.id;
        const type = dataset.type;
        const filterSummary = this.data.filterSummary;
        const priceStar = filterSummary.priceStar;
        const isOversea = this.data.cityInfo.biz !== 1;
        if (type === 'filter') {
            this.pageStatus.filterComponentObj.updateByTriggerFilterId(id);
        } else if (type === 'price') {
            const priceArr = [];
            priceStar.data.price.forEach(item => {
                if (item.key !== id) {
                    priceArr.push(item.key);
                }
            });
            const starArr = priceStar.data.star.map(item => item.key);
            this._setData({
                filterSummary: this.fillPriceStarData(filterSummary, priceArr, starArr, isOversea)
            }, true);
        } else if (type === 'star') {
            const priceArr = priceStar.data.price.map(item => item.key);
            const starArr = [];
            priceStar.data.star.forEach(item => {
                if (item.key !== id) {
                    starArr.push(item.key);
                }
            });
            this._setData({
                filterSummary: this.fillPriceStarData(filterSummary, priceArr, starArr, isOversea)
            }, true);
        } else if (type === 'area') {
            this.pageStatus.areaComponentObj.updateByTriggerFilterId(id);
        } else if (type === 'keyword') {
            this.clearKeyword();
        } else if (type === 'qs') { // 快筛（排除筛选和位置区域后的部分）
            for (let i = 0, n = filterSummary.qs.items.length; i < n; i++) {
                const curItem = filterSummary.qs.items[i];
                if (curItem.data.filterId === id) {
                    curItem.extra.selected = false;
                    break;
                }
            }
            this._setData({
                filterSummary
            }, true);
        }
    },
    /**
     * 展开价格明细
     */
    starPriceDetailInfo (e) {
        const { hid: hotelId } = e.currentTarget.dataset;
        const hotelInfo = this.model.hotelInfoMap[hotelId]?.data;

        if (hotelInfo) {
            const { dateInfo, cityInfo } = this.data;
            const { isLongRent = false, inDay, outDay } = dateInfo;
            const priceDetail = commonfunc.priceDetailNew(hotelInfo, isLongRent);
            this.setData({
                priceDetail,
                priceLayerSubtitle: priceDetail.isHourRoom ? '' : `${dateInfo.inDayText}-${dateInfo.outDayText} ${dateInfo.days}晚`,
                detailRoomId: hotelId,
                showPriceDetail: true,
                confirmBtnText: priceDetail.isHourRoom ? '去预订' : '酒店详情',
                priceDetailConfirmFuc: PRICE_CONFIRM_FUNC
            });
            listtrace.priceDetailClick(this, {
                checkin: inDay,
                checkout: outDay,
                cityid: cityInfo.cityId,
                masterhotelid: hotelInfo.hotelId,
                source: 'wechat'
            });
        }
    },

    /**
     * 钟点房start
     * 钟点房点击跳填写页
     */
    hourhotelRoomtap: util.throttle(function (e) {
        const { hid: hotelId } = e.currentTarget.dataset;
        const currentHotelInfo = this.model.hotelInfoMap[hotelId]?.data;

        huser.checkLoginStatus(true).then((isLogin) => {
            const goToBooking = () => {
                if (currentHotelInfo.hasRoomLayer) {
                    this.hourroomToBooking(currentHotelInfo);
                } else {
                    // 跳booking需要roomList相关参数，如payType
                    this.loadRoomLayerInfo(currentHotelInfo.hotelId, this.hourroomToBooking);
                }
            };

            if (isLogin) { // 已登录，跳填写页下单
                goToBooking();
            } else { // 未登录，登录后刷新房型列表
                huser.login({
                    param: {},
                    callback: (res) => {
                        if (res && res.ReturnCode === '0') {
                            goToBooking();
                        }
                    }
                });
            }
        });
    }, 600),
    hourroomToBooking (hotelInfo) {
        if (!hotelInfo) return;

        let url = '../booking/index?';
        const { hotelId, roomInfo } = hotelInfo;
        if (!roomInfo) return;
        const { dateInfo } = this.data;
        const { subRoomInfo = {} } = roomInfo;
        const urlParams = {
            hotelid: hotelId,
            roomid: roomInfo.roomId,
            shadowid: roomInfo.shadowId,
            indate: dateInfo.inDay,
            outdate: dateInfo.outDay,
            paytype: subRoomInfo.paymentInfo?.type || 0,
            subpaytype: subRoomInfo.paymentInfo?.subType || 1,
            rateid: subRoomInfo.rateId,
            rateadult: subRoomInfo.rateAdult,
            checkavid: subRoomInfo.checkAVId,
            rateplanid: subRoomInfo.ratePlanId
        };

        url += urlUtil.paramString(urlParams);
        cwx.navigateTo({
            url
        });
    },
    // 钟点房浮层
    showRoomLayer (e) {
        const hotelID = e.currentTarget.dataset.hid;
        const roomID = e.currentTarget.dataset.room;
        const hotelInfo = this.getCurrentHotel(hotelID);
        const currentRoomInfo = hotelInfo && hotelInfo.roomInfos && hotelInfo.roomInfos.length > 0 ? hotelInfo.roomInfos[roomID] : {};
        currentRoomInfo.roomIdUnique = hotelID + '_' + roomID;

        if (hotelInfo && hotelInfo.hasRoomLayer) {
            this.setRoomInfo(hotelInfo);
        } else {
            this.loadRoomLayerInfo(hotelID, this.setRoomInfo);
        }

        listtrace.roomClick(this, { hotel: hotelInfo, room: currentRoomInfo, clicktype: 2 });
    },
    /**
     * 钟点房浮层信息请求getRoomList
     */
    loadRoomLayerInfo (hotelId, callback) {
        if (hotelId > 0) {
            const hotelInfo = this.getCurrentHotel(hotelId) || {};
            const roomInfo = hotelInfo.roomInfo;
            const encryptedRoomId = hotelInfo.minRoomInfo.encryptedRoomId;
            const request = {
                hotelId,
                cityId: Toolkit.getAttr(this.data, 'cityInfo.cityId') || 0,
                checkinDate: Toolkit.getAttr(this.data, 'dateInfo.inDay') || '',
                checkoutDate: Toolkit.getAttr(this.data, 'dateInfo.outDay') || '',
                /* 支付方式 0=ALL 1=现付 2=预付 3=闪住 */
                payType: Toolkit.getAttr(hotelInfo, 'roomInfo.payType'),
                isMorning: 0,
                isHourRoomSearch: true
            };

            listData.getHourRoomList(request, (res) => {
                if (!res || !res.subRoomMap) {
                    callback(roomInfo, hotelInfo);
                }
                try {
                    // todo: 后续服务将subRoomMap改为房型标号时，可使用res.subRoomMap[encryptedRoomId]获取房型信息
                    const subRoomInfo = Object.values(res.subRoomMap).find(item => item.roomNo === encryptedRoomId) || {};

                    subRoomInfo.name = roomInfo.name > 0 ? '(' + hotelInfo.hourRoomHours + '小时)' : '';
                    hotelInfo.roomInfo.subRoomInfo = subRoomInfo;
                    hotelInfo.roomInfo.baseRoomInfo = res.baseRoomMap[subRoomInfo.baseRoomId];
                    hotelInfo.hasRoomLayer = true;
                } catch (err) {
                    hotelInfo.hasRoomLayer = false;
                }

                callback(hotelInfo);
            }, () => {
                callback(hotelInfo);
            });
        }
    },
    setRoomInfo (hotelInfo) {
        const currentRoomInfo = hotelInfo.roomInfo || {};
        this.setData({
            hourRoomLayer: {
                isShown: true,
                baseRoom: currentRoomInfo.baseRoomInfo,
                subRoom: currentRoomInfo.subRoomInfo,
                hotelId: hotelInfo.hotelId,
                payType: currentRoomInfo.payType,
                payText: [2, 3].includes(currentRoomInfo.payType) ? '到店付' : '在线付'
            }
        });
    },
    /**
     * 关闭钟点房浮层
     */
    hiddenRoomLayer (e) {
        this.setData({
            'hourRoomLayer.isShown': false
        });
    },
    checkBigPhoto (e) {
        const current = e.detail.current;
        this.pageStatus.pictureSwiper.current = current;
        // 滑块切换加延迟，避免滑动过快导致组件崩溃
        if (!this.pageStatus.pictureSwiper.switching) {
            this.pageStatus.pictureSwiper.switching = true;
            this.setData({
                currentImageIndex: e.detail.current
            });

            this.pageStatus.subRoomSwiperTimeOut = setTimeout(() => {
                this.pageStatus.pictureSwiper.switching = false;
            }, 100);
        }
    },
    /** * 钟点房end ***/

    getPriceCalcItems2 (arrPriceCalcItems) {
        let result = [];
        let count = 0;

        if (arrPriceCalcItems && arrPriceCalcItems.length) {
            arrPriceCalcItems.forEach((v, i) => {
                count = count + Math.abs(v.amount);
            });

            if (count > 0) {
                result = arrPriceCalcItems.slice(0);

                result.push({
                    title: '优惠' + count
                });
            }
        }

        return result && result.length > 0 ? result : arrPriceCalcItems;
    },

    getCurrentHotel (hotelId) {
        const hotels = this.data.hotels || this.data.recommendHotels;

        for (let i = 0, n = hotels.length; i < n; i++) {
            const item = hotels[i];
            if (item.hotelId === hotelId) {
                return item;
            }
        }
    },
    onPriceDetailConfirm (e) {
        const { detailRoomId: hotelId, isHourroomModule } = this.data;
        if (isHourroomModule) {
            this.hourhotelRoomtap({ currentTarget: { dataset: { hid: hotelId } } });
        } else {
            this.seeHotelDetail(hotelId);
        }
    },

    hoteltap: util.throttle(function (e) {
        const id = e.currentTarget.dataset.id;
        this.seeHotelDetail(id);
        this.clickHotelCardTrace(e); // 酒店卡片发送曝光点击埋点
    }, 400),
    loadMore (e) {
        // hotelLoading确保在请求完成后，再重新发送请求
        if (this.data.hasNextPage && !this.data.hotelLoading) {
            if (this.isRecommendHotelLoad()) {
                this.pageStatus.recommendPageIndex++;
            } else {
                this.pageStatus.listReqParams.pageIndex++;
            }
            this.loadHotels();
        }
    },
    onScroll: util.throttle(function (e) {
        const scrollTop = e.detail.scrollTop;
        const d = this.data;
        const ps = this.pageStatus;
        if (scrollTop < 0) {
            return;
        }

        const renderData = {};
        // 吸顶阴影
        renderData.showTopShadow = scrollTop > 0;
        // 回顶部按钮
        renderData.hideBackToTop = scrollTop < ps.windowHeight / 2;
        if (scrollTop < 20 && !d.hotelLoading) {
            const sloganInfo = d.sloganInfo;
            let curIndex = ++ps.sloganIndex;
            if (curIndex === sloganInfo.list.length) {
                curIndex = 0;
            }
            ps.sloganIndex = curIndex;
            sloganInfo.desc = sloganInfo.list[curIndex];

            renderData.sloganInfo = sloganInfo;
        }

        this.setData(renderData);
        this.thirteenBannerScroll();
    }),
    handleFilterComponentReady (e) {
        const filetObj = e.detail;
        // 保存组件实例对象
        this.pageStatus.filterComponentObj = filetObj;

        // initPage时如果有initialSelectedIds，在这里调用组件的update方法来更新组件
        this.updateSuggestFilter();
    },
    handleAreaComponentReady (e) {
        // const areaObj = e.detail;
        // 保存组件实例对象
        this.pageStatus.areaComponentObj = e.detail;

        // initPage时如果有area节点的initialSelectedIds，在这里调用组件的update方法来更新组件
        this.updateSuggestArea();
    },
    updateSuggestFilter (filterIds, extra = {}) {
        const filetObj = this.pageStatus.filterComponentObj;
        if (!filetObj) return;

        const ids = filterIds || this.data.filterSummary.filter.initialSelectedIds;
        if (!_.isEmpty(ids)) {
            this.setData({
                'filterSummary.filter.initialSelectedIds': null
            });

            filetObj.updateBySuggestSelectedIds(ids, extra);
        }
    },
    updateSuggestArea (areaIds, extra = {}) {
        const areaObj = this.pageStatus.areaComponentObj;
        if (!areaObj) return;

        const ids = areaIds || this.data.filterSummary.area.initialSelectedIds;
        if (!_.isEmpty(ids)) {
            this.setData({
                'filterSummary.area.initialSelectedIds': null
            });

            areaObj.updateBySuggestSelectedIds(ids, extra);
        }
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
        const extra = detail.extra || {};
        const ps = this.pageStatus;
        const filterObj = this.pageStatus.filterComponentObj;
        if (filterObj && ps?.searchFilter?.filterId && filterObj.existingInFilter(ps.searchFilter.filterId) && !this.existInSelect(ps?.searchFilter, filterItems, false)) {
            ps.searchFilter = null;
            this._setData({
                'keywordInfo.text': ''
            }, false);
        }
        let filterSummary = this.data.filterSummary;
        filterSummary.filter.selectedItems = filterItems;
        filterSummary.filter.hidden = true;
        // 筛选title
        const title = '筛选';
        let filtersItems = [];
        if (filterItems.length) {
            filtersItems = filterItems.map(item => item.title);
        }
        filterSummary.filter.displayText = title;
        filterSummary.filter.filtersNum = filtersItems.length;
        // 筛选组件当前状态更新
        filterSummary = this.fillFilterCurrentStatus(filterSummary, 'filter');
        // 更新快筛状态
        filterSummary = this.fillQuickFilterStatus(filterSummary, filterItems, C.FILTER_CATEGORY_FILTER);

        this._setData({
            filterSummary
        }, !extra.withoutReload);
        // 筛选确认点击埋点
        listtrace.filterListClick(this, {
            page: this.pageId,
            triggerTime: new Date().getTime()
        });
    },
    handleAreaComponentClose (e) {
        this.toggleFilterStatus('area');
    },
    /**
     * 位置区域确认
     * */
    handleAreaComponentConfirm (e) {
        const ps = this.pageStatus;
        ps.searchAddr = ''; // 更改条件时，带入地图中心点位置清空
        ps.listReqParams.referencePoint = null;
        const detail = e.detail || {};
        const filterItems = detail.selectedItems || [];
        const areaObj = this.pageStatus.areaComponentObj;
        this.pageStatus.poiValue = null;
        if (areaObj && ps?.searchFilter?.filterId && areaObj.existingInFilter(ps.searchFilter.filterId) && !this.existInSelect(ps?.searchFilter, filterItems, false)) {
            ps.searchFilter = null;
            this._setData({
                'keywordInfo.text': ''
            }, false);
        }
        const subCityItem = filterItems.find(item => item.data?.type === '21');
        if (subCityItem) { // 下辖市县
            // 关闭组件
            this.setData({
                'filterSummary.area.hidden': true
            });
            // 刷新城市
            const subCity = JSON.parse(subCityItem.data?.value || '');
            if (subCity.cityID) {
                this.updateCity({
                    cityId: subCity.cityID,
                    cityName: subCity.cityName || '',
                    did: subCity.districtID || 0,
                    type: subCity.countryID || 1,
                    isGeo: false,
                    tzone: subCity.timeZone || 0,
                    name: '',
                    key: ''
                });
            }
        } else {
            const extra = detail.extra || {};
            let filterSummary = this.data.filterSummary;
            filterSummary.area.selectedItems = filterItems;
            filterSummary.area.hidden = true;
            // 仅不重新load列表或选中距离的时候保留参数带入的筛选
            const keepOptionFilter = extra.keepOptionFilter || (filterItems.length === 1 && filterItems[0].data?.type === '14');
            if (!keepOptionFilter) {
                filterSummary.area.optionAreaFilterId = '';
                filterSummary.area.optionSelectedItems = [];
            }
            // 位置区域title
            const title = '位置区域';
            let filtersItems = [];
            const optionItems = filterSummary.area.optionSelectedItems || [];
            if (filterItems.length || optionItems.length) {
                filtersItems = filterItems.concat(optionItems).map(item => item.title);
            }
            filterSummary.area.displayText = title;
            filterSummary.area.filtersNum = filtersItems.length;
            // 筛选组件当前状态更新
            filterSummary = this.fillFilterCurrentStatus(filterSummary, 'area');
            // 更新快筛状态
            filterSummary = this.fillQuickFilterStatus(filterSummary, filterItems, C.FILTER_CATEGORY_AREA_FILTER);

            this._setData({
                filterSummary
            }, !extra.withoutReload);
        }
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

    /* 页面开关状态 */
    checkUniversalSwitches () {
        const ps = this.pageStatus;
        const keys = [
            'list_slogan_text',
            'listnew_map_switch',
            'coupon_subscribe_notice',
            'price_star_xtaro'
        ];
        commonrest.getWechatSoaSwitch(keys, (data = {}) => {
            const res = data.result || [];
            const dataToSet = {};
            res.forEach((curItem = {}) => {
                const key = curItem.key;
                const value = curItem.value || '';
                const opened = value === '1';
                switch (key) {
                case 'list_slogan_text':
                    value && Object.assign(dataToSet, {
                        sloganInfo: { list: value.split('|') }
                    });
                    break;
                case 'listnew_map_switch':
                    dataToSet.listMapSwitch = opened;
                    break;
                case 'coupon_subscribe_notice':
                    ps.subscribeNoticeSwitch = opened;
                    break;
                case 'price_star_xtaro':
                    dataToSet.priceStarXtaroSwitch = opened;
                    break;
                default:
                    break;
                }
            });
            this._setData(dataToSet);
        });
    },

    /**
     * 加载酒店列表
     */
    loadHotels () {
        this.pageStatus.hotelListLoadTaskQueue.push({
            method: 'doHotelListLoad'
        });

        // 多处调用loadHotels时，按队列发送酒店列表请求
        if (!this.pageStatus.hotelListLoadProcessing) {
            this.doHotelListLoad();
        }
        this.getThirteenBannerList();
    },
    doHotelListLoad () {
        const pageS = this.pageStatus;
        pageS.hotelListLoadProcessing = true;
        const req = this.constructListRequest();
        // 搜索补偿的场景，补全搜索补偿查询条件
        if (this.isRecommendHotelLoad()) {
            this.addRecommendParams(req);
        };

        const pageIndex = req.pageIndex;
        this.showHotelLoading(pageIndex);
        listData.loadHotelList(pageS.currentListApiName, req, (data) => {
            this.data.isQuickApp && wx.setNavigationBarTitle({
                title: data.cityName || '酒店列表'
            });
            // 处理服务返回
            if (this.isRecommendHotelLoad()) {
                this.processRecommendHotelData(data, pageIndex);
            } else {
                this.processHotelData(data, pageIndex);
            }
            // 单次酒店load完毕
            this.hotelListLoadFinished();
            // save track info
            this.pageStatus.trackId = data.trackId;

            listtrace.newTrace(this, { request: req, result: data });

            commonfunc.setGlobalData({ hotelListTrackExt: data.trackExt });
        }, () => {
            this.hideHotelLoading();
            this.hotelListLoadFinished();
        }, this);
    },
    hotelListLoadFinished () {
        const tasks = this.pageStatus.hotelListLoadTaskQueue || [];
        tasks.shift(); // remove finished task
        this.pageStatus.hotelListLoadProcessing = false;
        this.pageStatus.isFirstHotelList = false;
        if (tasks.length) {
            const task = tasks[0];
            this[task.method]();
        }
    },
    showHotelLoading (pageIndex) {
        const loadingFirstPage = pageIndex === 1;
        this.setData({
            hasNextPage: true,
            showLoading: loadingFirstPage && !this.data.showFishBone,
            hotelLoading: true,
            loadingFirstPage
        });
    },
    hideHotelLoading () {
        this.setData({
            showLoading: false,
            hotelLoading: false,
            loadingFirstPage: false
        });
    },
    // 根据服务下发extension->SkipForceLogin字段判断是否跳登录
    loginCheck (res) {
        if (!commonfunc.skipForceLogin(res) && this.pageStatus.needJumpToLogin) {
            this.pageStatus.needJumpToLogin = false;
            this.toLogin();
        }
    },
    processHotelData (data, pageIndex) {
        const d = this.data;
        let { hotels, isLoggedin } = d;
        const pageS = this.pageStatus;
        pageS.requestId = commonfunc.getResponseLogId(data, 'request-id');
        // 状态码201->强制登录
        if (data.result === C.NEED_LOGIN || (!isLoggedin && pageS.needlogin)) {
            this.toLogin(true);
            return;
        }

        !isLoggedin && this.loginCheck(data);

        // 兼容进入页面没有城市名的场景，取response返回的城市名
        const cityInfo = d.cityInfo;
        if (!cityInfo.cityName) {
            cityInfo.cityName = data.cityName || '';
        }
        // 第一页返回时，要处理快筛和筛选项状态，以及入离时间
        const filterSummary = d.filterSummary;
        let hotelCount = d.hotelCount;
        let dateInfo = d.dateInfo;
        let relatedCityInfo = this.data.relatedCityInfo;
        let memberBannerSrc = this.data.memberBannerSrc;
        let uiModifyInfo = null;

        if (pageIndex === 1) {
            hotels = [];
            // 酒店信息
            this.model.hotelInfoMap = {};
            // 时区
            const tZone = data.timeZoneInfo?.timeZone;
            const serverTime = data.serverTime;
            if (typeof tZone === 'number' && serverTime) {
                this.model.timeZoneDate = date.TimeZoneDate.create(new Date(serverTime), new Date(), tZone);
            }
            // 快筛
            filterSummary.qs.hidden = false;
            const curQuickFilters = filterSummary.qs.items || [];
            if (!curQuickFilters.length) {
                filterSummary.qs.items = data.quickFilters || [];
            }
            // 酒店数量
            hotelCount = data.hotelCount;
            uiModifyInfo = data.uiModifyInfo || {};
            // 日期信息（如果前端传入的时间过期了服务会校正）
            if (uiModifyInfo.checkinDate && uiModifyInfo.checkoutDate) {
                dateInfo = this.getDateInfo(uiModifyInfo.checkinDate, uiModifyInfo.checkoutDate);
            }
            // 排序
            const isShowIllSort = uiModifyInfo.isShowIntelligentSortItem;
            filterSummary.sort.isShowIllSort = isShowIllSort;
            const adjustFilterId = this.getAdjustSortId(isShowIllSort);
            // 如果adjustFilterId有值，则需调整；如果为空字符串，则需要默认选中欢迎度排序
            filterSummary.sort = this.adjustSortInfo(filterSummary.sort.items, adjustFilterId);

            // 第一页时返回sessionId，翻页时会通过request里的sessionId字段带给服务
            pageS.listReqParams.sessionId = data.seqId;
            // 关联城市信息
            relatedCityInfo = this.getRelatedCityInfo(data.relatedCityInfo);
            // 会员banner
            memberBannerSrc = data.vipGradeBanner;
        }

        // 酒店列表
        const hotelInfoList = data.hotelInfoList || [];
        let loededHotelLen = hotels.length;
        hotelInfoList.forEach(hotelInfo => {
            const idx = ++loededHotelLen;
            this.model.hotelInfoMap[hotelInfo.hotelId] = {
                index: idx,
                data: hotelInfo
            };
            hotels.push(this.constructHotelCardInfo({ hotelInfo, index: idx, dateInfo, isRecommendHotel: false }));
        });
        const noHotels = !loededHotelLen;
        // 是否有下一页
        const hasNextPage = (loededHotelLen < hotelCount) && hotelInfoList.length;

        const dataToSet = {
            hotels,
            cityInfo,
            dateInfo,
            filterSummary,
            hotelCount,
            noHotels,
            hasNextPage,
            relatedCityInfo,
            memberBannerSrc,
            recommendDesc: '',
            recommendHotels: [],
            showFishBone: false,
            showLoading: false,
            hotelLoading: false
        };
        dataToSet.wordTypeId = data.matchWordInfo?.wordTypeId || '';
        dataToSet.wordId = data.matchWordInfo?.wordId || 0;
        this._setData(dataToSet, false, () => {
            // 位置区域筛选
            this.fillAreaFilterModify(uiModifyInfo);
            // 快筛曝光埋点
            pageIndex === 1 && data.quickFilters?.length && this.showQuickFilters();
        });
        // 搜索补偿
        if (data.isSearchOneHotel && hotelInfoList.length === 1) { // 唯一结果推荐
            pageS.currentListApiName = API_HOTEL_SEARCH_NEARBY;
            this.loadHotels();
        } else if (data.enableCompensate && !dateInfo.isLongRent) { // 少结果/无结果补偿
            pageS.currentListApiName = API_HOTEL_SEARCH_COMPENSATE;
            this.loadHotels();
        }

        this.noHotelTrace(data);
        // 列表页有结果发送曝光埋点
        if (hotelInfoList && hotelInfoList.length) {
            const exposureData = {
                hasHotelListExposeObj: {
                    data: {
                        triggerTime: new Date().getTime(),
                        page: this.pageId
                    },
                    ubtKeyName: exposeTraceKey.HOTEL_LIST_HAS_HOTEL_KEY
                }
            };
            this.sendExposureTrace(exposureData);
        }
        // TTI埋点
        this.timeConsumeTrace();
        this.setCountdownParams();
    },
    /**
     * 搜索补偿酒店
     * */
    processRecommendHotelData (data, pageIndex) {
        let recommendDesc = this.data.recommendDesc;
        if (pageIndex === 1) {
            this.pageStatus.recommendSessionId = data.seqId;
            recommendDesc = this.getCompensateText();
        }
        const recommendHotels = this.data.recommendHotels || [];
        const hotelInfoList = data.hotelInfoList || [];
        let loededHotelLen = this.data.hotels.length + recommendHotels.length;
        hotelInfoList.forEach(hotelInfo => {
            const idx = ++loededHotelLen;
            this.model.hotelInfoMap[hotelInfo.hotelId] = {
                index: idx,
                isRecommendHotel: true,
                data: hotelInfo
            };
            recommendHotels.push(this.constructHotelCardInfo({ hotelInfo, index: idx, isRecommendHotel: true }));
        });
        // 是否有下一页
        const hasNextPage = hotelInfoList.length && recommendHotels.length < data.hotelCount;
        // 处理发送酒店卡片曝光埋点所需的数据
        const wordTypeId = data.matchWordInfo?.wordTypeId || '';
        const wordId = data.matchWordInfo?.wordId || 0;
        this._setData({
            recommendHotels,
            recommendDesc,
            hasNextPage,
            showLoading: false,
            hotelLoading: false,
            wordTypeId,
            wordId
        });
    },

    /**
     * 根据服务返回的uiModifyInfo来设置位置区域模块的选中状态
     * 目前只处理了地标，如果有其他位置区域里的子分类，也可以在这里处理
     * */
    fillAreaFilterModify (uiModifyInfo) {
        const areaObj = this.pageStatus.areaComponentObj;
        if (!areaObj) return;

        if (!uiModifyInfo) {
            this.setData({
                'filterSummary.area.optionAreaFilterId': '',
                'filterSummary.area.optionSelectedItems': []
            });

            return;
        }

        const normalIds = [];
        const extraItems = [];
        const { markLandFilter } = uiModifyInfo;
        // 地标
        if (markLandFilter && markLandFilter.title) {
            const { filterId = '', title } = markLandFilter;
            const filterVal = filterId.split('|').pop();
            areaObj.dataReady(() => {
                const id = areaObj.existingFilter(filterVal, title);
                if (id) { // 位置区域存在改筛选项
                    normalIds.push(id);
                } else {
                    extraItems.push(markLandFilter);
                }
                if (normalIds.length || extraItems.length) {
                    const optionAreaFilterId = normalIds.length ? '' : this.data.filterSummary.area.optionAreaFilterId;
                    this.setData({
                        'filterSummary.area.optionAreaFilterId': optionAreaFilterId,
                        'filterSummary.area.optionSelectedItems': extraItems
                    });
                    const selectedAreaItems = this.data.filterSummary.area.selectedItems;
                    const ids = normalIds.concat(selectedAreaItems.map(item => item.data?.filterId));
                    areaObj.updateBySuggestSelectedIds(ids, { withoutReload: true, keepOptionFilter: true });
                }
            });
        }
    },

    noHotelTrace (res) {
        const { ResponseStatus, hotelCount, result } = res;

        if ((hotelCount && result) !== 203 || !ResponseStatus) return;
        const extensions = ResponseStatus.Extension || [];
        const requestId = extensions.filter(item => item.Id === 'request-id')?.[0]?.Value;
        listtrace.noHotelTrace(this, {
            requestId: requestId || '',
            spider: result === 203
        });
    },
    timeConsumeTrace () {
        const pageS = this.pageStatus;
        if (pageS.traceTimeConsuming) {
            pageS.traceTimeConsuming = false;
            listtrace.timeConsuming(this, {
                pageId: this.pageId,
                time: Date.now() - pageS.preTime,
                source: pageS.fromPreLoad ? 'list_preload_finish' : 'list_load_finish'
            });
        }
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
                    this.pageStatus.sortItems = util.clone(sortItems);
                    // 预加载的场景会先走到酒店列表的load，需要在这里判断是否选中智能排序
                    const isShowIllSort = this.data.filterSummary.sort.isShowIllSort;
                    let adjustFilterId = '';
                    if (isShowIllSort) {
                        adjustFilterId = this.getAdjustSortId(isShowIllSort, sortItems);
                    }

                    this.setData({
                        'filterSummary.sort': this.adjustSortInfo(sortItems, adjustFilterId)
                    });
                } catch {

                }
            }
        }, () => {
            // console.log(err);
        });
    },

    getDefaultCityInfo () {
        return {
            cityId: 2,
            cityName: '上海',
            did: 0,
            dName: '', // 景区名
            address: '',
            biz: 1,
            isGeo: false,
            tzone: 0
        };
    },
    getDefaultPricestarName: function (isOversea) {
        return `价格/${isOversea ? '钻' : '星'}级`;
    },
    getDefaultFilterSummary () {
        const filterSummary = defaultFilterSummary();
        filterSummary.sort.items = util.clone(this.pageStatus.sortItems);
        return filterSummary;
    },
    getDefaultFilterItem () {
        return {
            data: {
                filterId: '',
                type: '',
                value: '',
                subType: '',
                childValue: '',
                propertyValue: ''
            }
        };
    },
    getDateInfo (inDay, outDay, chooseHourroomDate = this.pageStatus.chooseHourroomDate) {
        const timeZoneDate = this.model.timeZoneDate;
        const isMorning = date.checkIsMorning(timeZoneDate);
        const selectMorning = isMorning && (inDay === timeZoneDate.yesterday());
        const { isHourroomModule } = this.data;
        // 显示的入住日期（如果是凌晨需要显示为今天）
        const shortInDay = this.inDayForShown(selectMorning, inDay);
        const inDayArr = commonfunc.getDateDisp(inDay, timeZoneDate, selectMorning) || [];
        const outDayArr = commonfunc.getDateDisp(isHourroomModule || chooseHourroomDate ? inDay : outDay, timeZoneDate, selectMorning) || [];
        const days = chooseHourroomDate ? 0 : date.calDays(inDay, outDay);

        return {
            shortInDay,
            shortOutDay: date.formatTime('MM-dd', date.parse(chooseHourroomDate ? inDay : outDay)),
            inDayText: !isHourroomModule && selectMorning ? inDayArr[2] : inDayArr[0], // x月x日
            outDayText: outDayArr[0],
            inDay,
            outDay,
            days,
            isMorning: date.checkIsMorning(timeZoneDate),
            selectMorning,
            isLongRent: days > C.longRentLimitDay
        };
    },
    constructListRequest () {
        const ps = this.pageStatus;
        const listParams = ps.listReqParams;
        const pageIndex = listParams.pageIndex;
        // sessionId 第一页不传，翻页时取服务返回的seqId
        const sessionId = listParams.sessionId;
        const preLoadRequestData = this.model.preloadInfo.requestData;
        const d = this.data;
        // 已加载过的酒店
        let preCount = 0;
        let preHotelIds = '';
        if (pageIndex > 1) {
            d.hotels.forEach(hotel => {
                preHotelIds += preHotelIds ? `,${hotel.hotelId}` : hotel.hotelId;
                preCount++;
            });
        }

        // 为了保证预加载酒店查询条件的一致性，预加载酒店翻页时，直接使用查询页传过来的查询条件
        if (preLoadRequestData) {
            return util.clone({
                ...preLoadRequestData,
                sessionId,
                pageIndex,
                preHotelIds,
                preCount
            });
        }

        const cityInfo = d.cityInfo;
        const dateInfo = d.dateInfo;
        const clientPos = this.model.clientPos;
        const req = commonfunc.getDefaultListReq();
        // 用户定位信息
        if (clientPos.cityId > 0) {
            req.userCoordinate = {
                cityId: clientPos.cityId,
                latitude: clientPos.lat,
                longitude: clientPos.lng
            };
        }
        // 钟点房请求参数
        req.isHourRoomSearch = this.data.isHourroomModule || ps.chooseHourroomDate;

        req.sessionId = sessionId;
        req.cityId = cityInfo.cityId;
        req.districtId = cityInfo.did;
        req.checkinDate = dateInfo.inDay;
        req.checkoutDate = dateInfo.outDay;
        req.nearbySearch = cityInfo.isGeo ? 1 : 0; // 我的附近查询
        req.pageIndex = pageIndex;
        req.pageSize = 10;
        req.sourceFromTag = ps.sourceFromTag;
        req.channel = 1;
        req.preCount = preCount;
        req.preHotelIds = preHotelIds;
        // 筛选信息
        req.filterInfo = this.fillSearchFilterInfo(req.filterInfo);
        req.isOrderByUser = d.filterSummary.sort.selectedInfo.isOrderByUser;

        req.topHotelIds = listParams.topHotels;

        return req;
    },
    addRecommendParams (request) {
        const pageIndex = this.pageStatus.recommendPageIndex;
        request.pageIndex = pageIndex;
        request.sessionId = this.pageStatus.recommendSessionId;
        // 已加载过的酒店
        let preCount = 0;
        let preHotelIds = '';
        const loadedHotels = this.data.hotels.concat(this.data.recommendHotels);
        loadedHotels.forEach(hotel => {
            preHotelIds += preHotelIds ? `,${hotel.hotelId}` : hotel.hotelId;
            preCount++;
        });
        request.preCount = preCount;
        request.preHotelIds = preHotelIds;
        // 唯一结果推荐参数
        if (this.isOneResultRecommend()) {
            const hotelId = this.data.hotels[0]?.hotelId;
            const hotelInfo = this.model.hotelInfoMap[hotelId]?.data;
            if (hotelInfo) {
                request.nearbyHotHotel = {
                    hotelId: parseInt(hotelInfo.hotelId, 10),
                    hotelName: hotelInfo.hotelName,
                    hotelCityId: hotelInfo.cityId,
                    hotelStar: hotelInfo.starLevel,
                    nearbySubType: 'HotelList', // 附近热卖子场景：列表 HotelList 详情 HotelDetail
                    /* 酒店坐标 */
                    coordinate: hotelInfo.coordinate
                };
            }
        }
    },
    /**
     * 构造列表请求筛选信息
     * */
    fillSearchFilterInfo (searchFilterInfo) {
        if (searchFilterInfo) {
            const fs = this.data.filterSummary;
            const selectedFilterIds = [];
            let allSelectedItems = [];
            /* 筛选 + 位置区域 + 快筛 */
            if (fs.filter.selectedItems) {
                allSelectedItems = allSelectedItems.concat(fs.filter.selectedItems);
            }
            const area = fs.area;
            const selectedAreaItems = area.selectedItems;
            if (selectedAreaItems) {
                allSelectedItems = allSelectedItems.concat(selectedAreaItems);
            }
            // 通过参数传进来的位置区域筛选项
            const hasAreaFilterSelected = selectedAreaItems && selectedAreaItems.some(item => {
                const fId = item?.data?.filterId || '';
                return fId.indexOf('14|') !== 0; // 14| 开头是距离信息，和地标不互斥
            });
            const optionAreaFilterId = area.optionAreaFilterId;
            if (optionAreaFilterId && !hasAreaFilterSelected) {
                const areaItem = this.getDefaultFilterItem();
                areaItem.data.filterId = `13|${optionAreaFilterId}`;
                allSelectedItems.push(areaItem);
            }

            fs.qs.items.forEach(item => {
                if (item.extra?.selected) {
                    allSelectedItems.push(item);
                }
            });
            const filterItemList = [];
            const { poiValue } = this.pageStatus;
            if (poiValue) {
                const poi = poiValue.split('|');
                const options = {
                    filterId: `10|${poi[3]}`,
                    type: '10',
                    value: poiValue,
                    subType: poi[5],
                    title: poi[2]
                };
                filterItemList.push(options);
            }
            allSelectedItems.forEach((item, index) => {
                const filterId = item.data?.filterId;
                if (!selectedFilterIds.includes(filterId)) {
                    selectedFilterIds.push(filterId);
                    filterItemList.push(item.data);
                }
            });
            const { searchFilter = '' } = this.pageStatus;
            if (searchFilter && !this.existInSelect(searchFilter, filterItemList)) {
                filterItemList.push(searchFilter);
            }
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
            searchFilterInfo.keyword = searchFilter ? '' : this.data.keywordInfo.text || '';
            // poi经纬度
            searchFilterInfo.referencePoint = this.pageStatus.listReqParams.referencePoint;
        }

        return searchFilterInfo;
    },

    constructSortRequest () {
        const cityInfo = this.data.cityInfo;
        const dateInfo = this.data.dateInfo;
        const clientPos = this.model.clientPos;

        return {
            isHourRoomSearch: this.data.isHourroomModule,
            outdate: dateInfo.outDay,
            districtId: cityInfo.did,
            userCoordinate: {
                cityId: clientPos.cityId,
                latitude: clientPos.lat,
                longitude: clientPos.lng
            },
            channel: 1,
            indate: dateInfo.inDay,
            cityId: cityInfo.cityId,
            category: C.FILTER_CATEGORY_SORT
        };
    },

    constructHotelCardInfo ({ hotelInfo, index, dateInfo, isRecommendHotel }) {
        let result = null;

        if (hotelInfo) {
            const searchAddr = this.pageStatus.searchAddr;
            let positionDesc = (searchAddr && hotelInfo.positionDesc)?.replace(/\{0\}/g, searchAddr) || hotelInfo.positionDesc;
            positionDesc = positionDesc?.indexOf('{0}') === -1 ? positionDesc : ''; // 兼容参数中传入经纬度的场景
            const totalPriceInfo = hotelInfo.totalPriceInfo;
            const isLongRent = (dateInfo || this.data.dateInfo).isLongRent && totalPriceInfo;
            const hourPeriod = this.getInOutDate(hotelInfo.hourEarliestArriveTime, hotelInfo.hourLatestArriveTime);
            const recommendDateList = hotelInfo.priceCalendarMultiDate?.map(item => {
                const timeZoneDate = this.model.timeZoneDate;
                return ({
                    checkIn: date.formatTime('yyyy-MM-dd', item.checkIn),
                    checkOut: date.formatTime('yyyy-MM-dd', item.checkOut),
                    inDayText: commonfunc.getDateDisp(item.checkIn, timeZoneDate)[0],
                    outDayText: commonfunc.getDateDisp(item.checkOut, timeZoneDate)[0],
                    minPrice: item.minPrice,
                    minPriceBeforeTax: item.minPriceBeforeTax,
                    night: item.night
                });
            });
            result = {
                hotelId: hotelInfo.hotelId,
                hotelName: hotelInfo.hotelName,
                isFullBooking: hotelInfo.isFullBooking && !hotelInfo.isClose && !hotelInfo.isHotelNoPrice,
                logoPic: hotelInfo.logoPic,
                needShowPrimeIcon: hotelInfo.isNewPrimeHotel,
                topRecommend: hotelInfo.topRecommend,
                topRecommendReason: hotelInfo.topRecommendReason,
                starLevel: hotelInfo.starLevel,
                isStarLicence: hotelInfo.isStarLicence,
                dStar: hotelInfo.dStar,
                starIcon: hotelInfo.starIcon,
                medalIconSrc: commonfunc.getMedalIcon(hotelInfo.medal),
                wowHotel: hotelInfo.wowHotel,
                featureHotelType: hotelInfo.featureHotelType,
                isAdSlot: hotelInfo.isAdSlot,
                commentScore: hotelInfo.commentScore ? hotelInfo.commentScore.toFixed(1) : '',
                commentNumberText: hotelInfo.commenterNumber > 0 ? `${hotelInfo.commenterNumber}点评` : '',
                commentDescription: hotelInfo.commentDescription,
                collectedText: this.getCollectedText(hotelInfo.collectedNumber),
                positionDesc,

                incentiveText: hotelInfo.lastBookingTimeRemark, // 最新预定
                priceStr: isLongRent ? totalPriceInfo.priceStr : hotelInfo.priceStr,
                hotelCardTags: (hotelInfo.hotelCardTags || []).reverse(), // 卡片左下标签
                inspireTag: getInspireTagInfo(hotelInfo.inspireTag), // 卡片激励文案
                pictureTags: hotelInfo.pictureTags, // 卡片图片上方标签
                pictureBottomTags: hotelInfo.pictureBottomTags, // 卡片下方标签
                featureHotelTag: hotelInfo.featureHotelTag, // 卡片标题后标签
                shaTag: hotelInfo.shaTag, // SHA-PLUS

                recommendDateList: recommendDateList || [], // 不可定日期推荐
                duringTime: hotelInfo.duringTime,
                price: isLongRent ? totalPriceInfo.price : hotelInfo.price, // 展示价格
                originPrice: isLongRent ? totalPriceInfo.originPrice : hotelInfo.originPrice, // 原价（划线价)
                priceAvg: hotelInfo.price, // 均价
                priceLabelDesc: hotelInfo.priceLabelDesc, // 价格左侧desc
                priceLabelExtraDesc: hotelInfo.priceLabelExtraDesc, // 价格下方描述 eg. 含税总价
                taxAmount: hotelInfo.taxAmount,
                browseClass: '', // 已浏览样式
                isClose: hotelInfo.isClose, // 房型不可订标识
                isHotelNoPrice: hotelInfo.isHotelNoPrice, // 房型不可订标识
                canNotBeOrderedInfo: hotelInfo.canNotBeOrderedInfo || {}, // 不可订原因
                // 灰色蒙层
                showGrayFilter: (hotelInfo.canNotBeOrderedInfo?.messageBold && (hotelInfo.isClose || hotelInfo.isHotelNoPrice)) || hotelInfo.isFullBooking,
                priceTags: hotelInfo.priceTags, // 标签（价格类）
                priceCalcItems: this.getPriceCalcItems2(isLongRent ? totalPriceInfo.priceCalcItems : hotelInfo.priceCalcItems),
                promotionTags: hotelInfo.promotionTags, // 标签（非价格类）

                // 钟点房 start
                hourRoomConfirmTag: hotelInfo.hourRoomConfirmTag,
                refundAmount: hotelInfo.refundAmount,
                hourRoomHours: hotelInfo.hourRoomHours, // 钟点房入住时长
                checkInInterval: hotelInfo.hourLivablePeriod || (hourPeriod ? hourPeriod + '可住' : ''), // 钟点房入住最早时间
                roomInfo: hotelInfo.roomInfo,
                // 钟点房 end
                minRoomInfo: hotelInfo.minRoomInfo,
                isRecommendHotel,
                hotelCardExposeObj: this.constructTraceData(isRecommendHotel, index - 1, hotelInfo) // 酒店卡片发送曝光埋点 传参：1.是否为搜索补偿酒店 2.当前酒店在列表排序
            };
            if (typeof index === 'number') {
                result.ubt = {
                    item: `xcx_hotel_list_hotelposition_${index}`,
                    price: 'xcx_hotellist_priceintro',
                    autotest_item: `autotest_xcx_hotel_list_hotelposition_${index}`,
                    autotest_item_info: 'autotest_listpage_hotellabel',
                    autotest_price: 'autotest_xcx_hotellist_priceintro'
                };
            }
        }
        hotelInfo.isFullBooking && listtrace.fullBookingHotel(this, hotelInfo.hotelId);
        !hotelInfo.logoPic && listtrace.noImageTrace(this, hotelInfo.hotelId);
        function getInspireTagInfo (inspireTag = {}) {
            if (!inspireTag || !inspireTag.extensions?.length || inspireTag.id !== 20005) return inspireTag;
            inspireTag.rankType = inspireTag.extensions.find(item => item.type === 'rankType')?.value;
            return inspireTag;
        }
        return result;
    },

    getInOutDate (start, end) {
        if (typeof start === 'number' && typeof end === 'number') {
            return Toolkit.formatMinToHour(start) + '~' + Toolkit.formatMinToHour(end);
        }

        return '';
    },
    getRelatedCityInfo (rcInfo) {
        let result = null;
        if (rcInfo && rcInfo.text && rcInfo.placeHolder) {
            const textArray = rcInfo.text.split('{0}');
            result = {
                prefix: textArray[0],
                placeHolder: rcInfo.placeHolder,
                suffix: textArray[1] || ''
            };
        }

        return result;
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
    closePriceDetail () {
        this.setData({
            showPriceDetail: false
        });
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
    fillPriceStarData (filterSummary, priceList, starList, isOversea) {
        const priceStar = filterSummary.priceStar;
        const requestFilterInfo = priceStar.data.requestFilterInfo;
        const psData = isOversea ? util.clone(psDefaData.overseasData) : util.clone(psDefaData.cnData);
        const sqs = priceStar.data;
        sqs.star = [];
        sqs.price = [];
        let curCount = 0;
        const psStatesName = [];
        // 星级
        if (starList && starList.length && starList[0] !== '-1') {
            requestFilterInfo.starItemList = starList;
            const star = psData.star;
            starList.forEach((sk) => {
                for (let i = 0, n = star.length; i < n; i++) {
                    const s = star[i];
                    if (sk === s.key) {
                        psStatesName.push(s.text);
                        sqs.star.push({
                            current: true,
                            key: s.key,
                            text: s.text
                        });

                        curCount++;
                        break;
                    }
                }
            });
        } else {
            // clear star condition
            requestFilterInfo.starItemList = [];
        }
        // 价格
        if (priceList && priceList.length && priceList[0] !== '-1') {
            const curKey = priceList[0];
            const priceArray = curKey.split('|');
            const curMin = parseInt(priceArray[0]);
            const curMax = parseInt(priceArray[1]);

            requestFilterInfo.lowestPrice = curMin;
            requestFilterInfo.highestPrice = curMax;
            // 滑块数据设置
            const priceText = pricestarfunc.getPriceText(curMin, curMax);
            psStatesName.push(priceText);

            sqs.price.push({
                current: true,
                key: curKey,
                min: curMin,
                max: curMax,
                text: priceText
            });
            curCount++;
        } else {
            // clear price condition
            requestFilterInfo.lowestPrice = 0;
            requestFilterInfo.highestPrice = 0;
        }
        priceStar.curCount = curCount;
        priceStar.current = curCount > 0 ? 'current' : '';
        if (curCount) {
            priceStar.data.filtersNum = psStatesName.length;
        } else {
            priceStar.data.filtersNum = 0;
        }

        return filterSummary;
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
            area.current = (!area.hidden || area.selectedItems.length || area.optionSelectedItems.length) ? 'current' : '';
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
    fillQuickFilterStatus (filterSummary, selectedItems = [], scenario) {
        const selectedIds = selectedItems.map(item => item.data?.filterId);
        filterSummary.qs.items.forEach(item => {
            const scenarios = item.scenarios || [];
            if (scenarios.includes(scenario) && !item.withoutFilterMapId) {
                item.extra.selected = selectedIds.includes(item.data?.filterId);
            }
        });

        return filterSummary;
    },
    fillFilterSuggestSelectedItems (filterSummary, extraFilters, excludeFilters) {
        const add = (items, filter) => {
            const filterId = filter.data?.filterId || '';
            if (!items.find(item => item.data?.filterId === filterId)) {
                items.push(filter);
            }
        };
        const remove = (items, filter) => {
            const filterId = filter.data?.filterId || '';
            return items.map(item => item.data?.filterId !== filterId);
        };
        let suggestFilterItems = filterSummary.filter.selectedItems;
        let suggestAreaItems = filterSummary.area.selectedItems;
        // 需要选择的筛选
        if (extraFilters) {
            extraFilters.forEach(filter => {
                const scenarios = filter.extra?.scenarios || [];
                if (scenarios.includes(C.FILTER_CATEGORY_FILTER)) {
                    add(suggestFilterItems, filter);
                } else if (scenarios.includes(C.FILTER_CATEGORY_AREA_FILTER)) {
                    add(suggestAreaItems, filter);
                } if (scenarios.includes(C.FILTER_CATEGORY_SORT)) {
                    // 排序
                    const filterId = filter.data?.filterId || '';
                    filterSummary.sort = this.adjustSortInfo(filterSummary.sort.items, filterId);
                }
            });
        }
        // 排除的筛选
        if (excludeFilters) {
            excludeFilters.forEach(filter => {
                const scenarios = filter.extra?.scenarios || [];
                if (scenarios.includes(C.FILTER_CATEGORY_FILTER)) {
                    suggestFilterItems = remove(suggestFilterItems, filter);
                } else if (scenarios.includes(C.FILTER_CATEGORY_AREA_FILTER)) {
                    suggestAreaItems = remove(suggestAreaItems, filter);
                }
            });
        }

        filterSummary.filter.suggestFilterItems = suggestFilterItems;
        filterSummary.area.suggestFilterItems = suggestAreaItems;

        return filterSummary;
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
    getAdjustSortId (isShowIllSort, sortItems) {
        const sortInfo = this.data.filterSummary.sort;
        const items = sortItems || sortInfo.items;
        if (!items) return '';

        const curKey = sortInfo.selectedInfo.id;
        let adjustKey = '';
        if (isShowIllSort) { // 展示智能排序（如果选中了欢迎度排序需要切换为智能排序）
            adjustKey = curKey === POPULARITY_SORT_KEY ? ILL_SORT_KEY : '';
        } else { // 展示欢迎度排序（如果选中了智能排序需要切换到欢迎度排序）
            adjustKey = curKey === ILL_SORT_KEY ? POPULARITY_SORT_KEY : '';
        }
        const adjustItems = items.find(item => item.key === adjustKey);

        return adjustItems ? adjustItems.data?.filterId : '';
    },

    /**
     * 获取页面当前筛选条件
     * */
    getSelectedFilters (filterSummary = {}, keywordInfo = {}) {
        const selectedFilters = [];
        // 筛选
        filterSummary.filter.selectedItems.forEach(item => {
            selectedFilters.push({
                title: item.title,
                id: item.data.filterId,
                type: 'filter'
            });
        });

        // 星级价格
        const priceArr = filterSummary.priceStar?.data?.price;
        const starArr = filterSummary.priceStar?.data?.star;
        if (priceArr && priceArr.length) {
            selectedFilters.push({
                title: priceArr[0].text || '',
                id: priceArr[0].key,
                type: 'price'
            });
        }
        if (starArr) {
            starArr.forEach(item => {
                selectedFilters.push({
                    title: item.text || '',
                    id: item.key,
                    type: 'star'
                });
            });
        }
        // 位置区域
        filterSummary.area.selectedItems.forEach(area => {
            selectedFilters.push({
                title: area.title,
                id: area.data.filterId,
                type: 'area'
            });
        });
        // 快筛（排除筛选或位置区域之后的）
        const qsItems = filterSummary.qs.items;
        qsItems.forEach(item => {
            const scenarios = item.scenarios || [];
            const selected = item.extra?.selected;
            if (selected &&
                !scenarios.includes(C.FILTER_CATEGORY_FILTER) &&
                !scenarios.includes(C.FILTER_CATEGORY_AREA_FILTER)) {
                selectedFilters.push({
                    title: item.title,
                    id: item.data?.filterId,
                    type: 'qs'
                });
            }
        });
        const filter = this.pageStatus.searchFilter;
        // 关键字
        if (keywordInfo.text && !this.existInSelect(filter, filterSummary.area.selectedItems, false) && !this.existInSelect(filter, filterSummary.filter.selectedItems, false)) {
            selectedFilters.push({
                title: keywordInfo.text,
                id: '',
                type: 'keyword'
            });
        }

        return selectedFilters;
    },

    updateCity (selectedCity) {
        this.pageStatus.searchFilter = null;
        this.pageStatus.poiValue = null;
        if (!selectedCity) {
            selectedCity = { cityId: 2, cityName: '上海', did: 0, type: 1, isGeo: false, tzone: 0, name: '', key: '' };
        }
        this.pageStatus.searchAddr = ''; // 更改条件时，带入地图中心点位置清空
        this.pageStatus.listReqParams.referencePoint = null;

        const { dtype, name, cityName, cityId, did, isGeo, lng, lat, type, address, fromhistory } = selectedCity;
        const biz = type;
        const isScenicArea = +did > 0; // 景区
        // 城市信息
        const cityInfo = {
            cityId,
            cityName,
            did,
            dName: did ? name : '',
            address,
            biz,
            isGeo,
            lat,
            lng,
            tzone: 0 // 切换城市后，加载酒店列表的时候会重置tzone
        };
        // 关键词
        let keywordText = '';
        if (name && dtype !== 32 && !isScenicArea && !fromhistory) { // 切换城市同时带keyword；dtype32表示城市类型
            keywordText = name;
        }

        this._setData({
            cityInfo,
            isOversea: biz !== 1,
            filterSummary: this.getDefaultFilterSummary(),
            keywordInfo: {
                text: keywordText
            }
        }, true);

        this.pageStatus.selectedCityInfo = {
            ...cityInfo,
            isOversea: biz !== 1
        };
        // 更新新版优惠券banner
        this.getPromotionBanner();
        // 历史选择城市更新
        if (!isGeo) {
            // eslint-disable-next-line
            const skey = type == 1 ? 'P_HOTEL_CITY_HISTORY_INLAND' : 'P_HOTEL_CITY_HISTORY_OVERSEA';
            let history = storage.getStorage(skey) || [];
            history = history.filter(function (i) {
                return i.cityName !== cityName;
            });
            history.unshift(Object.assign({}, selectedCity, { isHis: true }));
            storage.setStorage(skey, history.slice(0, 4), 24 * 30);
        }
        // 更新pageId
        this.setPageIdCom(biz);
    },

    setClientPosition (locInfo) {
        const { lng, lat, cityId } = locInfo;
        const clientPos = this.model.clientPos;
        if (cityId && _.isNumber(lng) && _.isNumber(lat)) {
            clientPos.lng = lng;
            clientPos.lat = lat;
            clientPos.cityId = cityId;
        } else {
            geoService.locateWithCityInfo({ lat, lng }, function (city) {
                if (city) {
                    clientPos.lng = city.lng;
                    clientPos.lat = city.lat;
                    clientPos.cityId = city.cityId;
                }
            }, () => { });
        }
    },
    /**
     * 缓存入离日期，缓存的时机为：1-url上拼接了入离日期  2-日历更改了入离日期
     * @param inDay
     * @param outDay
     */
    setDateStorage (inDay, outDay) {
        if (!inDay || !outDay) return;
        storage.setStorage(C.STORAGE_USER_SELECT_DATE, {
            inDay,
            outDay
        }, 24);
        datetrace.storageDateTrace({ inDay, outDay });
    },

    updateDate (inDay, outDay, chooseHourroomDate) {
        if (!inDay || !outDay) return;
        this.pageStatus.chooseHourroomDate = chooseHourroomDate;

        // 更新新版优惠券banner
        this.getPromotionBanner();

        const dateInfo = this.getDateInfo(inDay, outDay, chooseHourroomDate);
        const dataToSet = { dateInfo };
        if (dateInfo.isLongRent !== this.data.dateInfo.isLongRent) {
            dataToSet.filterSummary = this.getDefaultFilterSummary();
        }
        this.setDateStorage(inDay, outDay);

        this._setData(dataToSet, true);
    },

    getDateDisp (date) {
        return commonfunc.getDateDisp(date, this.model.timeZoneDate, this.data.dateInfo.selectMorning);
    },
    inDayForShown (selectMorning, inDay) {
        // 凌晨单显示入住日为今天
        const inDayForShown = selectMorning ? this.model.timeZoneDate.today() : inDay;
        return date.formatTime('MM-dd', date.parse(inDayForShown));
    },
    afterDateChange (inDay, outDay) {
        if (inDay && outDay) {
            this._setData({
                dateInfo: this.getDateInfo(inDay, outDay)
            }, true);
        }
    },

    setPageIdCom (biz) {
        const pageId = biz === 1 ? '10320654889' : '10650026877';
        if (pageId !== this.pageId) {
            util.exUbtSendPV(this, { pageId });
        }
    },

    // 处理列表页新版优惠券banner信息
    handlePromotionBanner (bannerInfo) {
        if (!bannerInfo) return;
        const { isHourroomModule } = this.data;
        const { basicInfo: bannerBasicInfo = {}, bannerFloating = {} } = bannerInfo;

        // 处理优惠券浮层数据
        const bannerFloatData = coupondata.getBannerFloatData(bannerFloating);
        const hotelCouponsModule = coupondata.gethotelCouponsData(bannerFloating);
        const rewardModule = coupondata.getRewardData(bannerFloating);
        const { bannerTagItemDatas = [], bannerButtonData = {} } = bannerBasicInfo;
        // 处理banner标签数据格式
        bannerBasicInfo.bannerTags = bannerTagItemDatas.map(item => {
            const couponTags = {};
            if (item?.tagDesc?.indexOf('.') !== -1) {
                couponTags.showCouponText = true;
                [couponTags.leftText, couponTags.rightText] = item?.tagDesc?.split('.');
            } else {
                couponTags.tag = item?.tagDesc;
            }
            return couponTags;
        });
        // 处理banner按钮部分
        const { buttonDesc = '' } = bannerButtonData;
        // 按钮有四种类型，1.HAS_RECEIVE: 已领取>，2.TO_VIEW: 查看>，3.领券，4.箭头，仅已领取和查看两种类型需要特殊处理
        const bannerButtonText = {
            HAS_RECEIVE: '已领取',
            TO_VIEW: '查看'
        };
        // 是否展示按钮箭头
        bannerButtonData.isShowArrow = [
            bannerButtonText.HAS_RECEIVE,
            bannerButtonText.TO_VIEW
        ].includes(buttonDesc);
        // 优惠券banner发送曝光埋点
        const bannerTags = bannerBasicInfo.bannerTags;
        if (!isHourroomModule && bannerTags.length) {
            this.showListCouponsTrace(bannerTags);
        }
        return {
            bannerBasicInfo,
            bannerFloatData,
            hotelCouponsModule,
            rewardModule
        };
    },
    /**
     * 列表页新版优惠券banner
     */
    getPromotionBanner () {
        const params = this.constructListRequest();
        listData.getPromotionBanner(params, (res) => {
            const dataToSet = this.handlePromotionBanner(res.bannerInfo) || {};
            this.setData(dataToSet);
        });
    },
    handleCouponReceive: function (e) {
        const { id: promotionID } = e.currentTarget.dataset;
        this.receiveCouponRequest(promotionID).then(() => {
            // 更新优惠券
            this.getPromotionBanner();
        });

        coupontrace.promotionsLayerClick(this, {
            subtab: this.data.cityInfo.biz === 1 ? 'inland' : 'oversea',
            benefitstype: '优惠券',
            pageId: this.pageId
        });
    },
    // 领取成功后，授权提醒
    conponSubscribe () {
        const { subscribeNoticeSwitch } = this.pageStatus;
        if (!subscribeNoticeSwitch) return;
        const { cityInfo } = this.data;
        const tmpId = 'F3HaACHAEbOpFkpTQIr65zjhjlCX3hY4IMqPLePVIpY';
        const tmpIds = [].concat(tmpId);
        commonfunc.toSubscribe(tmpIds, (res) => {
            if (res?.[tmpId] === 'accept' || res?.templateSubscribeStateInfos) {
                coupontrace.authorizeSucess(this, {
                    key: +cityInfo.biz !== 1 ? 215453 : 215452,
                    pageId: this.pageId
                });
            }
        });
    },
    /**
     * 跳转酒店详情页
     * @param {String} hotelId - 酒店id
     * @param [dateInfo] - 需要跳转的日期，默认为当前页面的入离日期
     */

    seeHotelDetail (hotelId, dateInfo = this.data.dateInfo) {
        const self = this;
        const dt = self.data;
        const ps = this.pageStatus;
        const htl = self.model.hotelInfoMap[hotelId];

        if (htl) {
            // 预加载roomList
            this.preloadRoomList(hotelId, dateInfo);

            const hotelIndex = htl.index;
            const hotelInfo = htl.data;
            const cityInfo = dt.cityInfo;
            const isRecommendHotel = htl.isRecommendHotel;
            const countdownParams = dt.countdownParams;
            const { isPriceWithDecimal, detailPositionDesc = '' } = hotelInfo;
            let toDetailURL = `../detail/index?id=${hotelId}&inday=${dateInfo.inDay}&outday=${dateInfo.outDay}&biz=${cityInfo.biz}`;
            !isRecommendHotel && (toDetailURL += `${this.getFilterStrForDetail()}`);
            // 选择凌晨日期
            dateInfo.selectMorning && (toDetailURL += '&ismorning=1');
            // 用户定位
            const { lat: clientLat, lng: clientLng } = self.model.clientPos || {};
            if (clientLat && clientLng) {
                toDetailURL += `&clientlat=${clientLat}&clientlng=${clientLng}`;
            }
            // 钟点房
            dt.isHourroomModule && (toDetailURL += '&ishourroommodule=1');
            ps.chooseHourroomDate && (toDetailURL += '&ishourroomdate=1');
            // 来源标识
            ps.sourceFromTag && (toDetailURL += `&source_from_tag=${ps.sourceFromTag}`);
            // 币种精度，透传
            if (isPriceWithDecimal !== undefined) {
                toDetailURL += `&price_decimal=${isPriceWithDecimal ? '1' : '0'}`;
            }
            // 透传到详情页展示的位置信息
            if (detailPositionDesc) {
                toDetailURL += `&detailPositionDesc=${detailPositionDesc}`;
            }
            // 反爬需求 跳转到详情页场景加cityid
            toDetailURL += `&cityid=${cityInfo.cityId}`;
            countdownParams.showCountdown && (toDetailURL += `&countdown=${JSON.stringify(countdownParams)}`);
            const { poiValue } = this.pageStatus;
            if (poiValue) {
                toDetailURL += `&poiValue=${poiValue}`;
            }
            // 详情页曝光点击埋点，需要传酒店列表的tracelog-id
            const { requestId = '' } = ps;
            toDetailURL += `&requestId=${requestId}`;

            cwx.navigateTo({
                url: toDetailURL,
                events: {
                    dateChangeNotify: function (ad) {
                        const dateInfo = self.data.dateInfo;
                        if (ad && (dateInfo.inDay !== ad.inDay || dateInfo.outDay !== ad.outDay || ps.chooseHourroomDate !== ad.isHourroomDate)) {
                            ps.chooseHourroomDate = ad.isHourroomDate;
                            self.afterDateChange(ad.inDay, ad.outDay);
                        }
                    },
                    reloadHotelsNotify: function () {
                        // self.loadHotels();
                    }
                }
            });
            // 金字塔埋点
            this.pyramidTraceLog(hotelInfo, hotelIndex);
        }
    },
    preloadRoomList (hotelId, dateInfo) {
        const { inDay, outDay } = dateInfo || {};
        const filterIds = this.getFilterIdsForDetail();
        const hotelInfo = this.model.hotelInfoMap[hotelId].data;
        const { isPriceWithDecimal } = hotelInfo;
        const params = {
            hotelId: +hotelId,
            checkinDate: inDay,
            checkoutDate: outDay,
            payType: 0,
            filterItemList: commonfunc.getFilterParamsForRoom(filterIds),
            isHourRoomSearch: this.isHourRoomSearch(),
            passFromList: hotelInfo.passToDetail || '',
            ABTest: this.pageStatus.listABTestResults
        };
        isPriceWithDecimal !== undefined && (params.isPriceWithDecimal = isPriceWithDecimal);
        // 头部扩展
        const extension = [];
        const sourceFromTag = this.pageStatus.sourceFromTag;
        sourceFromTag && extension.push({
            name: 'sourceFrom',
            value: sourceFromTag
        });
        if (extension.length) {
            params.head = { extension };
        }
        // 用户定位
        const { lat: latitude, lng: longtitude, cityId } = this.model.clientPos || {};
        params.userCoordinate = {
            latitude,
            longtitude,
            cityId
        };

        // 加房型列表实验结果全切了B版, 所以这里直接传B
        params.mtbABResult = 'B';

        const listPriceTrace = this.getPriceTraceInfo(hotelId); // 价格一致率

        const constantListInfo = { // 不受房价下载成功/失败影响的变量
            passFromList: hotelInfo.passToDetail || '',
            trackInfo: hotelInfo.trackInfo || '',
            listPriceTrace,
            hotelId
        };
        this.model.detailLoadInfo = {}; // 请求前确保不存在历史脏数据
        detailReqUtil.getRoomList(params, res => {
            this.model.detailLoadInfo = {
                detailInfo: res,
                isCompeleted: true,
                ...constantListInfo
            };
        }, () => {
            this.model.detailLoadInfo = {
                detailInfo: null,
                isCompeleted: true,
                ...constantListInfo
            };
        });
    },
    getFilterStrForDetail () {
        const { selectedFilters = [] } = this.data;
        const filterIds = this.getFilterIdsForDetail();
        let result = `&filter=${JSON.stringify(filterIds)}`;

        let priceId = '';
        selectedFilters.some(filter => {
            const { type, id } = filter;
            if (type === 'price') {
                priceId = id;
                return true;
            }
            return false;
        });
        priceId && (result += `&price=${priceId}`);

        return result;
    },
    getFilterIdsForDetail () {
        return (this.data.selectedFilters || []).filter(filter => ['filter', 'qs'].includes(filter.type))
            .map(item => item.id);
    },
    isHourRoomSearch () {
        const isHourroomFilted = () => {
            return !!(this.data.selectedFilters || []).find(filter => filter.id === '1|99999999');
        };
        return this.data.isHourroomModule || this.pageStatus.chooseHourroomDate || isHourroomFilted();
    },

    /**
     * 新版优惠券 function start
     */
    toggleCouponList () {
        this.setData({
            showCouponLayer: !this.data.showCouponLayer
        }, () => {
            if (this.data.showCouponLayer) {
                coupontrace.promotionsLayerShow(this, {
                    subtab: this.data.biz === 1 ? 'inland' : 'oversea',
                    benefitstype: promotionStr(this.data)
                });
                function promotionStr (tData) {
                    const promotionArr = [];
                    const { hotelCoupons = [] } = tData?.hotelCouponsModule || {};
                    hotelCoupons?.forEach((item) => {
                        promotionArr.push(item.couponName);
                    });
                    return promotionArr.join('/');
                }
            }
        });
    },
    handleGetCoupon: util.throttle(function (e) {
        const { id: couponStrategyId, isLayerClick = true } = e.currentTarget.dataset;
        this.receiveCouponRequest(couponStrategyId).then(() => {
            // 领券返回后刷新券列表
            this.getPromotionBanner();
            // 更新酒店列表
            this.loadHotels();
            // TODO 测试下澳门券场景
            this.conponSubscribe();
        });

        isLayerClick && coupontrace.promotionsLayerClick(this, {
            subtab: this.data.biz === 1 ? 'inland' : 'oversea',
            benefitstype: '优惠券',
            pageId: this.pageId
        });
    }, 1000),
    receiveCouponRequest (couponStrategyId) {
        const coupons = util.clone(this.data.hotelCouponsModule?.hotelCoupons);
        const coupon = coupons.find(c => c.couponStrategyId === couponStrategyId);
        if (!coupon) {
            return new Promise((resolve, reject) => {
                // eslint-disable-next-line
                reject();
            });
        }

        const params = {
            promotionId: couponStrategyId,
            category: coupon.couponCategory,
            hotelId: this.data.hotelId
        };

        return new Promise((resolve, reject) => {
            commonrest.receiveCoupon(params, (r) => {
                if (r && r.success === 1) {
                    resolve(r);
                } else {
                    if (r && r.resultCode === 53 && r.macaoNeedAuthMsg) {
                        // 实名认证失败，出实名认证弹窗
                        this.onShowRealNamePop({ detail: { msg: r.macaoNeedAuthMsg, promotionID: couponStrategyId } });
                    } else {
                        cwx.showToast({ title: r.resultMessage || '领券失败', icon: 'none' });
                        // eslint-disable-next-line
                        reject();
                    }
                }
            });
        });
    },
    /**
     * 助力券点击跳转
    */
    toHelpGetCoupon (e) {
        const canJumpH5 = commonfunc.toHelpGetCoupon(e);
        const { id: activityId } = e?.currentTarget?.dataset || {};
        if (canJumpH5) {
            this.pageStatus.needRefreshAssistCoupon = true;
            coupontrace.goToAssistClick(this, {
                subtab: this.data.biz === 1 ? 'inland' : 'oversea',
                benefitstype: '去助力',
                activityId
            });
        }
    },
    /**
     * 新版优惠券 function end
     */

    /**
     * 埋点使用的过滤项
     * */
    getFilterInfo () {
        const fs = this.data.filterSummary;
        const starPriceInfo = fs.priceStar.data?.requestFilterInfo || {};
        const filterItemList = fs.filter.selectedItems
            .filter(item => item.operation?.isRoomFilter)
            .map(item => item.title);

        return {
            lowestPrice: starPriceInfo.lowestPrice || 0,
            highestPrice: starPriceInfo.highestPrice || 0,
            filterItemList,
            locationItemList: fs.area.selectedItems.map(item => item.key || item.data?.filterId),
            starItemList: fs.priceStar.data?.requestFilterInfo.starItemList || [],
            keyword: this.data.keywordInfo.text || ''
        };
    },
    getPriceTraceInfo (id) {
        const hotel = this.model.hotelInfoMap[id];
        if (!hotel || hotel.data?.isFullBooking) return;

        const { hotelId, minRoomInfo, totalPriceInfo } = hotel.data;
        const { isLongRent } = this.data.dateInfo;
        const { originPrice, price, priceFloatInfo = {} } = (isLongRent && totalPriceInfo) || hotel.data;
        const taxAmount = priceFloatInfo.taxFee?.priceSum?.price;
        const filterInfo = this.getFilterInfo();
        return {
            masterhotelid: hotelId,
            roomid: minRoomInfo.roomId,
            amount: originPrice,
            price,
            taxAmount: taxAmount || 0,
            arrange: this.data.filterSummary.sort.selectedInfo.id,
            ismemberlogin: cwx.user.isLogin(),
            bookable: 1,
            isshadow: !!minRoomInfo.shadowId,
            shadowid: minRoomInfo.shadowId,
            hasfilters: hotel.isRecommendHotel ? false : listfunc.hasFilters(filterInfo),
            filter: hotel.isRecommendHotel ? {} : filterInfo,
            trackId: this.pageStatus.trackId
        };
    },
    /**
     * 是否推荐酒店查询
     * */
    isRecommendHotelLoad () {
        const listApiName = this.pageStatus.currentListApiName;

        return listApiName === API_HOTEL_SEARCH_NEARBY || listApiName === API_HOTEL_SEARCH_COMPENSATE;
    },
    isOneResultRecommend () {
        return this.pageStatus.currentListApiName === API_HOTEL_SEARCH_NEARBY;
    },
    /**
     * 推荐酒店描述文案
     * */
    getCompensateText () {
        let text = '';
        const listApiName = this.pageStatus.currentListApiName;
        if (listApiName === API_HOTEL_SEARCH_NEARBY) {
            text = '您可能喜欢的酒店';
        } else if (listApiName === API_HOTEL_SEARCH_COMPENSATE) {
            text = '以下酒店满足您的部分需求';
        }

        return text;
    },
    /**
     * 金字塔广告埋点
     * */
    pyramidTraceLog (hotel, hotelIndex) {
        if (hotel && (hotel.isAdHotel || hotel.isAdSlot)) {
            const filter = this.getFilterInfo();
            const cityInfo = this.data.cityInfo;
            const minPriceInfo = hotel.minPriceInfo ? JSON.parse(hotel.minPriceInfo) : {};
            const requestParams = {
                ...filter,
                cityId: cityInfo.cityId,
                disctrictId: cityInfo.did,
                keywordFilterItem: '',
                masterHotelId: parseInt(hotel.hotelId, 10),
                hotelIndex: hotelIndex - 1, // 前端从0开始计算
                isAdHotel: hotel.isAdHotel,
                isAdSlot: hotel.isAdSlot,
                traceId: minPriceInfo.traceid || '',
                adTraceId: minPriceInfo.adtraceid || '',
                isFullBooking: !!hotel.isFullBooking,
                scenario: 1
            };

            commonfunc.sendPyamidTrace(requestParams);
        }
    },

    noImageTrace (e) {
        const id = e.currentTarget.dataset.id;
        listtrace.noImageTrace(this, id);
    },
    screenShotTrace () {
        const { inDay, outDay } = this.data.dateInfo;
        screenshotstrace.listScreenShotsTrace(this, {
            pageid: this.pageId,
            checkin: inDay,
            checkout: outDay,
            tracelogid: this.pageStatus.requestId
        });
    },
    /* 澳门券发券弹窗 */
    async macaoCoupons () {
        const macaoPop = C.STORAGE_MACAO_COUPON_DIALOG;
        const hasPopAlready = storage.getStorage(macaoPop);
        if (hasPopAlready) return;
        const params = {
            cityId: this.data.cityInfo.cityId,
            pageCode: 'hotel_inland_list'
        };
        const res = await commonfunc.getMaocaoCoupons(params) || {};
        const { image, coupons } = res;
        if (image && coupons.length) {
            this.setData({
                macaoPop: {
                    enable: true,
                    imgSrc: image,
                    coupons
                }
            });
            const tomorrowMorning = date.tomorrowMorning();
            storage.setStorageByMillisecond(macaoPop, true, tomorrowMorning.getTime() - Date.now());
            macaocoupontrace.listMacaoOrRealNamePopShow(this, {
                page: this.pageId,
                window_type: '1'
            });
        }
    },
    /* 打开实名认证弹窗 */
    onShowRealNamePop (e) {
        const { msg, promotionID, coupons } = e.detail;
        this.setData({
            realNamePop: {
                enable: true,
                message: msg || '',
                promotionID, // 领券banner单张券领取
                coupons // 发券弹窗一键领取
            }
        });
        macaocoupontrace.listMacaoOrRealNamePopShow(this, {
            page: this.pageId,
            window_type: '2'
        });
    },
    /* 关闭实名认证弹窗 */
    onCloseRealName () {
        this.setData({
            realNamePop: { enable: false }
        });
    },
    /* 实名认证成功回调，领取澳门券 */
    onAuthRealNameCallback (e) {
        const { promotionID = '', coupons = [] } = e.detail;
        if (promotionID) {
            // 领券banner单张券领取
            this.handleCouponReceive({ currentTarget: { dataset: { id: promotionID } } });
        } else {
            // 一键领取澳门券
            const params = {
                coupons
            };
            commonrest.receiveMutilCoupon(params, res => {
                if (res && res.success === 1) {
                    cwx.showToast({ title: '领券成功', icon: 'none', duration: 2000 });
                    this.onUpdateCouponsAndHotels();
                } else {
                    cwx.showToast({ title: '领券失败', icon: 'none', duration: 2000 });
                }
            });
        }
    },
    /* 澳门券一键领取成功，更新优惠券浮层&酒店列表 */
    onUpdateCouponsAndHotels () {
        // 更新新版优惠券banner
        this.getPromotionBanner();
        // 更新酒店列表
        this.loadHotels();
    },
    // 保存组件实例对象，倒计时组件
    countdownComponentReady (e) {
        this.pageStatus.countdownComponentObj = e.detail;
        this.pageStatus.countdownComponentObj.removeStorage();
    },
    // 检查交叉浏览任务是否在任务中
    checkFlowActivities (inday, outday) {
        const isLoggedin = cwx.user.isLogin();
        const ps = this.pageStatus;
        const {
            flowActivity,
            activityId,
            scene,
            relationId,
            orderUrl,
            cityid = 2
        } = this.options;
        // 老版本不需要查看订单状态
        if (flowActivity !== '1' || !isLoggedin || ps.hasCheckFlowActivity) return;
        ps.hasCheckFlowActivity = true;
        const params = {
            activityId: ~~activityId,
            scene: ~~scene,
            relationId,
            orderUrl,
            cityId: ~~cityid,
            inday,
            outday
        };
        const success = (res) => {
            if (!res || res.status !== 1) return;
            const { actionId, userTaskActionId } = res;
            ps.countDownTaskStatus = {
                actionId,
                userTaskActionId
            };
            this.setCountdownParams();
        };
        listData.getFlowActivities(params, success);
    },
    setCountdownParams () {
        const { isDirectlyCountDown, gtask, gaction, taskId, flowActivity } = this.options;
        const { countDownTaskStatus, requestId, hasSetCountdownParams } = this.pageStatus;
        const useNew = flowActivity === '1'; // 使用新接口
        // 列表请求完成后才展示倒计时挂件，使用新接口时需要查看任务状态，getFlowActivities
        if (hasSetCountdownParams || !requestId || (useNew && !countDownTaskStatus)) return;
        this.pageStatus.hasSetCountdownParams = true;

        const countdownParams = {
            showCountdown: isDirectlyCountDown === '1',
            taskid: useNew ? taskId : gtask,
            actionid: useNew ? countDownTaskStatus.actionId : gaction,
            usenew: ~~flowActivity,
            userTaskActionId: countDownTaskStatus?.userTaskActionId
        };
        this.setData({
            countdownParams
        });
    },

    // 登录bar曝光埋点
    showLoginBarTrace () {
        loginbartrace.loginBarShow(this, {
            page: this.pageId,
            sceneid: cwx.scene
        });
    },

    // 登录bar点击埋点
    clickLoginBarTrace () {
        loginbartrace.loginBarClick(this, {
            page: this.pageId,
            sceneid: cwx.scene
        });
    },

    // 领券banner发送曝光埋点
    showListCouponsTrace (bannerTags) {
        const { cityInfo, isLoggedin } = this.data;
        this.setData({
            listCouponsExposeObj: {
                data: {
                    subtab: cityInfo.biz === 1 ? 'inland' : 'oversea',
                    userstatus: isLoggedin ? 'T' : 'F',
                    issingle: bannerTags.length === 1 ? 'T' : 'F',
                    page: this.pageId,
                    sourceid: cwx.scene
                },
                ubtKeyName: exposeTraceKey.HOTEL_PROMOTION_BANNER_KEY
            }
        }, () => {
            // 异步动态设置曝光埋点节点，必须在设置class完成后，调用 cwx.sendUbtExpose.refreshObserve
            cwx.sendUbtExpose.refreshObserve(this); // 入参 当前页面的实例
        });
    },

    /**
     * 处理发送酒店卡片曝光埋点的数据
     */
    constructTraceData (isRecommendHotel, rank, hotelInfo) {
        const { keywordInfo = {}, isOversea, dateInfo = {}, cityInfo = {}, wordTypeId = '', wordId = 0 } = this.data;
        const { requestId = '', listReqParams = {} } = this.pageStatus;
        const { sessionId = '' } = listReqParams;
        const { inDay, outDay } = dateInfo;
        const { did, cityId, isGeo } = cityInfo;
        const regionId = did === 0 ? cityId : did;
        let regionType;
        if (isGeo) {
            regionType = '5';
        } else {
            if (isOversea) {
                regionType = regionId === did ? '4' : '1';
            } else {
                regionType = regionId === did ? '3' : '1';
            }
        }
        const searchType = keywordInfo.text ? (keywordInfo.key ? '1' : '2') : ''; // 搜索类型 1:直搜 2:选搜
        const hotelCardExposeObj = {
            data: {
                triggerTime: new Date().getTime(),
                page: this.pageId,
                keyword: keywordInfo.text,
                regionid: regionId, // 区域id 代表当前页面的城市/省份/国家/景区id
                regiontype: regionType, // 区域类型：城市记为1，省份记为2，国内景区记为3，国外景区记为4，我的位置记为5
                searchtype: searchType,
                tracelogid: requestId,
                newtypeid: wordTypeId,
                attributeid: wordId,
                checkin: inDay,
                checkout: outDay,
                htllist_query_id: sessionId, // 标识一次搜索行为，酒店列表发生变化时变更，翻页不变
                masterhotelid_rank: rank, // 酒店在酒店列表的排序，0到无穷大，不同列表从0重新计算
                masterhotelid: hotelInfo?.hotelId,
                masterhotelid_token: hotelInfo?.hotelId
            },
            ubtKeyName: isRecommendHotel ? exposeTraceKey.HOTEL_LIST_RECOMMEND_HOTEL_KEY : exposeTraceKey.HOTEL_LIST_HOTEL_KEY
        };
        return hotelCardExposeObj;
    },
    /**
     * 当前日期不可订时，推荐日期组件回调，用于跳转不同日期的详情页
     * @param e - 组件回调带入的event
     */
    recommendDateToDetail (e) {
        const { checkIn, checkOut, hotelId } = e.detail;
        const dateInfo = this.getDateInfo(checkIn, checkOut, false);
        this.seeHotelDetail(hotelId, dateInfo);
    },

    /* Empty method, do nothing */
    noop () { },

    /**
     * 页面更新
     * @param {Object} renderData - 更新到页面的数据
     * @param {boolean} needLoadHotels - 是否需要重新加载酒店列表
     *
    */
    _setData (renderData, needLoadHotels, callback) {
        const pageS = this.pageStatus;
        needLoadHotels && (renderData.listTop = 0); // 兼容其他小程序，方式更改查询条件时，scroll-view未滚动到顶部
        if (renderData) {
            // 底部筛选回显
            if (renderData.filterSummary || renderData.keywordInfo) {
                const filterSummary = renderData.filterSummary || this.data.filterSummary;
                const keywordInfo = renderData.keywordInfo || this.data.keywordInfo;
                renderData.selectedFilters = this.getSelectedFilters(filterSummary, keywordInfo);
            }

            this.setData(renderData, () => {
                callback && callback();
            });
        }

        if (needLoadHotels) {
            // 清空预加载酒店Request信息
            this.model.preloadInfo.requestData = null;
            const curPageIndex = pageS.listReqParams.pageIndex;
            // 更改条件查询的时候，需要清除参数带入的poi经纬度信息
            if (curPageIndex > 1) {
                pageS.listReqParams.referencePoint = null;
            }
            // 通过_setData触发酒店load的，都认为是查询条件变更，重置pageIndex和sessionId，简单翻页走loadMore
            pageS.listReqParams.pageIndex = 1;
            pageS.listReqParams.sessionId = '';
            pageS.recommendPageIndex = 1;
            pageS.recommendSessionId = '';
            // 重置酒店列表查询API
            pageS.currentListApiName = API_HOTEL_SEARCH;

            this.loadHotels();
        }
    },

    /**
     * 第十三位展示情况
     */
    thirteenBanner () {
        // 判断是否本地记过关闭缓存
        const close = storage.getStorage('thirteenBannerClose');
        if (close) {
            return;
        }
        this.setData({
            showThirteenBanner: true
        });
    },

    /**
     * 监听swiper变化
     * @param {*} e
     */
    swiperChange (e) {
        // 修改当前item并且判断是否触发曝光埋点
        if (!this.pageStatus.outScreen) {
            this.thirteenBannerShowTrace();
        }

        this.pageStatus.thirteenBannerCurrent = e.detail.current;
    },
    /**
     * 第十三位跳转
     * @param {*} e
     */
    thirteenBannerTap () {
        const item = this.pageStatus.thirteenBannerCurrent;
        const options = {
            page: this.pageId,
            cityid: this.data.cityInfo.cityId,
            listTagid: this.data.thirteenBannerList[item].rankId,
            listTagType: this.data.thirteenBannerList[item].articleId ? 2 : this.data.thirteenBannerList[0].leftCornerIcon ? 3 : 1
        };
        listtrace.thirteenlistClick(this, options);
        cwx.navigateTo({
            url: '/pages/hotel/components/webview/webview?data=' + `${JSON.stringify({
                url: encodeURIComponent(this.data.thirteenBannerList[item].url)
            })}`
        });
    },

    /**
     * 关闭第十三位
     */
    bannerClose () {
        this.setData({
            showThirteenBanner: false
        });
        storage.setStorage('thirteenBannerClose', true, 720);
    },

    /**
     * 滑动时监听十三位banner是否曝光
     */
    thirteenBannerScroll () {
        const self = this;
        const { windowHeight } = wx.getSystemInfoSync();
        const query = wx.createSelectorQuery();
        query
            .selectAll('.recommend')
            .boundingClientRect();
        query.exec(function (res) {
            res?.forEach((resArray) => {
                resArray?.forEach((item) => {
                    if (item.top + item.height < windowHeight && item.top > 200) {
                        // 滑动曝光 滑进滑出各记一次
                        if (self.pageStatus.outScreen) {
                            self.pageStatus.outScreen = false;
                            // 触发曝光埋点
                            self.thirteenBannerShowTrace();
                        }
                    } else {
                        self.pageStatus.outScreen = true;
                    }
                });
            });
        });
    },

    /**
     * 第十三位曝光埋点整合
     */
    thirteenBannerShowTrace () {
        const item = this.pageStatus.thirteenBannerCurrent;
        if (this.data.thirteenBannerList.length === 0) return;
        const options = {
            page: this.pageId,
            cityid: this.data.cityInfo.cityId,
            listTagid: this.data.thirteenBannerList[item].rankId,
            listTagType: this.data.thirteenBannerList[item].articleId ? 2 : this.data.thirteenBannerList[0].leftCornerIcon ? 3 : 1
        };
        listtrace.thirteenlistShow(this, options);
    },

    /**
     * 获取十三位数据
     */
    getThirteenBannerList () {
        const listParams = this.pageStatus.listReqParams;
        const pageIndex = listParams.pageIndex;

        const {
            dateInfo: { inDay, outDay, isMorning },
            cityInfo: { cityId, did, isGeo }
        } = this.data;
        const clientPos = this.model.clientPos;
        const req = {
            cityId,
            districtId: did,
            checkinDate: inDay,
            checkoutDate: outDay,
            nearbySearch: isGeo ? 1 : 0,
            isMorning,
            // 十三位中filterInfo与酒店列表中的filterInfo字段取值相同
            filterInfo: listParams.filterInfo
        };
        if (clientPos.cityId > 0) {
            req.userCoordinate = {
                cityId: clientPos.cityId,
                latitude: clientPos.lat,
                longitude: clientPos.lng
            };
        }
        // hotellist第2页调取
        if (pageIndex === 2) {
            listData.getThirteenBanner(req, (res) => {
                const data = res.datas || [];
                const newData = data.map((item) => {
                    if (item?.title?.length > 24) { item.title = item.title.substring(0, 24) + '...'; }
                    return item;
                });
                this.setData({
                    thirteenBannerList: newData
                });
            });
        }
    },

    /**
     * 判断是否为位置区域和筛选的重复项
     */

    existInSelect (filter, filterItemList = [], hasData = true) {
        let flag = false;
        for (let i = 0; i < filterItemList.length; i++) {
            if (hasData) {
                if (filterItemList[i].filterId === filter?.filterId) {
                    flag = true;
                    break;
                }
            } else {
                if (filterItemList[i]?.data?.filterId === filter?.filterId) {
                    flag = true;
                    break;
                }
            }
        }
        return flag;
    },
    // 发送曝光埋点
    sendExposureTrace (exposureData) {
        this.setData(exposureData, () => {
            // 异步动态设置曝光埋点节点，必须在设置class完成后，调用 cwx.sendUbtExpose.refreshObserve
            cwx.sendUbtExpose.refreshObserve(this); // 入参 当前页面的实例
        });
    },
    // 酒店卡片点击埋点
    clickHotelCardTrace (e) {
        const { id, price, idx } = e.currentTarget.dataset;
        const { recommendHotels = [], hotels = [] } = this.data;
        const { listReqParams = {}, requestId = '' } = this.pageStatus;
        const { sessionId = '' } = listReqParams;
        const hotelList = hotels.concat(recommendHotels);
        const hotel = hotelList.find(item => item?.hotelId === id) || [];
        const { isFullBooking, isRecommendHotel } = hotel;
        const traceKey = isRecommendHotel ? 'htl_c_applet_list_recomhotellist_click' : 'htl_c_applet_list_tag_click';
        const { allianceid } = cwx.mkt.getUnion();
        listtrace.hotelCardClick(this, {
            page: this.pageId,
            hotelId: id,
            price,
            rank: idx, // 酒店在酒店列表排序
            bookable: !isFullBooking, // 是否可以预订
            aid: allianceid,
            sessionId, // 标识一次搜索行为，酒店列表发生变化时变更，翻页不变
            requestId, // 请求服务id
            traceKey, // 点击埋点key值
            masterhotelid: hotel?.hotelId,
            masterhotelid_token: hotel?.hotelId
        });
    }
});
