import { cwx, CPage, _, __global } from '../../../cwx/cwx.js';
import reqUtil from './requtil.js';
import exposeTraceKey from '../common/trace/exposetracekey';
import constConf from '../common/C';
import pricetrace from '../common/trace/pricetrace.js';
import bookingReqUtil from '../booking/requtil.js';
import screenshotstrace from '../common/trace/screenshotstrace';
import browsedHoteldata from '../detail/browsehistory/browsehistoydata.js';
import util from '../common/utils/util.js';
import urlUtil from '../common/utils/url.js';
import dateUtil from '../common/utils/date.js';
import storageUtil from '../common/utils/storage.js';
import components from '../components/components.js';
import commonfunc from '../common/commonfunc';
import commonrest from '../common/commonrest.js';
import huser from '../common/hpage/huser';
import couponListRest from '../components/coupon/couponlistrest';
import detailtrace from '../common/trace/detailtrace';
import funScoreData from '../market/funscore/funscoredata.js';
import coupontrace from '../common/trace/coupontrace.js';
import card from '../common/market/card.js';
import chooseHotel from './choosehotel';
import macaocoupontrace from '../common/trace/macaocoupontrace.js';
import forceLoginTrace from '../common/trace/forcelogintrace';
import loginbartrace from '../common/trace/loginbartrace.js';
import coupondata from '../common/coupondata';
import datetrace from '../common/trace/datetrace';

const BOOKABLE_ROOM_STATUS = 1; // 可订房型的status值
const HIDDEN_TITLE_LIMIT_SCROLL_TOP = 80;
const MAX_TILING_ROOMS_LIMIT = 10;
const HOTEL_DETAIL_SHARE_ROOM_LIST = 'P_HOTEL_DETAIL_SHARE_ROOM_LIST'; // 好友推荐标签
const MAX_SHARE_ROOM_VAILD_DAYS = 7; // 分享房型id最大缓存时间
const KEY_REJECT_QUICKCHECKIN = 'P_HOTEL_USER_REJECT_QUICKCHECKIN';
const TO_BOOKING_FUNC = 'layerToBooking'; // 价格明细浮层中确定按钮触发事件，去预定
const CLOSE_PRICE_DETAIL = 'closePriceDetail';// 价格明细浮层中确定按钮触发事件，关闭浮层
const APP_SHARE_COUPON_DIALOG = 'P_HOTEL_APP_SHARE_COUPON_DIALOG_LIST';// 订后分享酒店，出优惠券弹窗
const APP_SHARE_COUPON_DIALOG_EXPIRED_TIME = 7;// 优惠券弹窗过期时间
const LOCAL_COUPON_TYPE_LIST = [14, 15]; // 本地优惠券的type值，14: 城市一致,15: 省份一致
const h5Host = __global.env === 'prd' ? 'm.ctrip.com' : 'm.ctrip.fat369.qa.nt.ctripcorp.com';

CPage({
    pageId: 'ignore_page_pv',
    pageName: 'hotelDetail',
    calendarPlugin: 'calendar',
    autoExpose: 2, // 添加autoExpose属性，并设置其值为 2
    exposeThreshold: 0.3, // 发送曝光埋点相交比例的阈值
    exposeDuration: 500, // 发送曝光埋点停留时长的阈值
    checkPerformance: true, // 白屏检测添加标志位
    data: {
        mpNavHeight: 0, // 自定义导航栏的高度
        scrollTopHeight: 0, // 页面scroll-view是否需要top值，用于锚定准确性
        highStarLimit: 4, // 高星级界限
        isHourroomModule: false,
        hotelId: 0,
        isIphoneX: util.isIPhoneX(),
        showForceLogin: false,
        showLoading: false,
        navigationBar: { // 自定义导航
            back: false,
            animated: false,
            title: '',
            color: '#000',
            background: '',
            leftCls: 'white'
        },
        collectStorage: false, // 收藏引导是否展示
        fixedHeight: 0, // 固定头部高度
        showAllHeadPic: false, // 首屏请求2张头图，滑动切下一张再请求所有图片
        hotelBaseInfo: {},
        headInfo: {
            headPictures: [],
            headPicTypes: [] // todo: 用于后续图片tab展示&跳转
        }, // 头部信息
        collection: { // 收藏相关
            collected: false,
            collectClass: 'wechat-font-collect',
            actionKey: ''
        },
        hotelProduct: { // 酒店预售套餐
            list: []
        },
        commentInfo: {
            enable: false,
            tags: [],
            comment: {}
        },
        gqlComment: { // 住客评价
            enable: false
        },
        askInfo: {
            enable: false,
            count: 0,
            List: []
        },
        gqlNoticeList: {}, // 订房必读
        gqlPolicyList: [], // 政策
        nearbyFacility: [], // 美食景点等周边
        nearbyHotels: [],
        showBottomBar: false,
        isLandingPage: false,
        isAppShare: +cwx.scene === 1036,
        isWechatShare: [1044, 1007, 1008, 1058].includes(+cwx.scene),
        appWakeRight: false, // app分享场景悬浮球是否向右收起
        share: {
            hidden: true,
            friendShareImg: ''
        },
        hasPromotionBack: false, // 优惠信息已返回，用于鱼骨
        promotionTags: [], // 优惠banner的tag文案
        showCouponLayer: false, // 展示新版优惠券浮层
        couponsToLayer: [], // 优惠浮层：券
        wxSEOdata: { // SEO结构化数据
            type: 'general',
            uniq_id: '',
            title: '',
            thumbs: [],
            cover: '',
            digest: '',
            tags: []
        },
        dateInfo: {
            inDay: dateUtil.today(), // YYYY-MM-dd
            inDayText: '', // x月x日
            inDayDesc: '', // eg.今天
            outDay: dateUtil.tomorrow(),
            outDayText: '',
            outDayDesc: '',
            days: 1,
            selectMorning: false,
            isMorning: false,
            isLongRent: false
        },
        quickFilterIds: [],
        filterSelectedMap: {}, // key: filterId; value: 是否选中
        hasFilterSelected: false, // 是否有房型筛选项选中
        priceFilter: {}, // 价格筛选
        isRoomLoading: true,
        noRoomRes: false,
        friendShareRoom: {},
        guessLikeRoom: {},
        baseRoomList: [], // 展示用结构索引，筛选后改变
        tilingRoomList: [],
        moreTilingRoomBtn: false,
        hourRoomList: [],
        baseRoomMap: {}, // 服务返回房型信息
        subRoomMap: {},
        roomLayer: {
            isShown: false,
            key: '', // baseRoom索引
            skey: '' // subRoom索引
        },
        showPriceDetail: false,
        priceDetailSkey: '', // 优惠明细浮层对应房型
        showPlanetStyle: false, // 星球号
        showPresalePackage: false, // 预售渠道
        rightsPop: { // 惊喜会员福利弹窗
            enable: false,
            imgSrc: ''
        },
        isLoggedin: true,
        showShareBar: true, // 一起选酒店bar
        isBaidu: commonfunc.isBaidu(),
        isQuickApp: commonfunc.isQuickApp(),
        isWechat: commonfunc.isWechat(), // 是否微信小程序
        planetBanner: {
            logo: '', // avatar图片
            isLive: false, // 是否直播中
            liveClickUrl: '', // 点avatar跳转地址
            targetUrl: '', // 进店跳转地址
            title: '', // 酒店名称
            subTitle: '', // 粉丝数
            vendorText: '', // 商家文案，展示优先于权益
            rightTagsArr: [] // 权益文案
        },
        realNamePop: { // 澳门券实名认证弹窗
            enable: false,
            message: '',
            skey: '' // 房型key
        },
        weworkInfo: {
            status: 0, // 1: 可参与 2: 参与中 3: 已参与
            show: false,
            title: '',
            desc: '',
            maxAmount: '',
            activityId: '' // 活动id
        },
        showCalendarBar: false, // 日历bar
        showCalendar: false, // 日历，第一次roomlist回来之前不展示，防止用户点击进入日历选择页
        minHourroomPrice: 0,
        minSubroomPrice: 0,
        noRoomDefaultImage: 'https://pages.c-ctrip.com/wireless-app/imgs/search_no_result.png', // 无可订房型时兜底图片
        canNotBeOrderedInfo: {}, // 房型不可订原因
        groupArticleList: [], // 达人晒图
        moreHourRoomShow: true,
        showTravelCouponLayer: false, // 超值旅行家浮层
        bannerBasicInfo: {}, // 优惠券banner
        bannerFloatData: null, // 优惠券弹窗 - base data
        hotelCouponsModule: null, // 优惠券弹窗 - 优惠券列表
        rewardModule: null, // 优惠券弹窗 - 权益模块
        travelCouponRules: [], // 超值旅行家规则
        enableGuestComment: false, // 详情二屏新点评开关
        atmosphereBannerInfo: null // 特色房banner
    },
    pageStatus: {
        scrollTop: 0, // scroll-view元素向上滚动的距离
        isFirstShow: true, // 是否是第一次onShow
        needJumpToLogin: true, // 是否需要强登
        timeZoneDate: null, // 此处初始化拿不到prototype
        calendarJumping: false, // 阻止日历点击多次跳转
        isHourroomDate: false,
        payType: 0, // 0=ALL 1=现付 2=预付 3=闪住
        minpPriceInfo: '',
        veilDifPriceInfo: '',
        lastCouponId: null, // 最低价房型未领优惠券（券后价相关）
        planetBatchCode: '', // 星球号批次号，仅roomlist传
        starPlanetId: '', // 星球号Id
        cityId: 0,
        cityName: '',
        allSubRoomMap: {}, // 服务返回全量房型，房型过多分页情况存在
        originRoomList: [], // 服务返回全量房型
        originHourRoomList: [], // 服务返回全量钟点房
        hasSetFilterInfo: false, // 更新room保持筛选信息不变
        subRoomSwiperTimeOut: null,
        imgSwitching: false, // 房型浮层切换图片
        channelList: '', // 渠道号：预售爆款需更改渠道号
        preLoadDetailInterval: null,
        bookingLoadInfo: {}, // 预加载填写可订信息
        needTimeConsumeTrace: true,
        passFromList: '',
        sourceFromTag: '',
        nearbySpots: [], // 酒店周边-景点
        newNearbyFacilityList: [], // 新接口酒店周边
        clientCityInfo: null, // 用户定位的城市信息
        reqGraphQLEnd: false,
        reqRoomListEnd: false,
        couponStrategyId: '', // 当前领取的优惠券策略id
        detailABTestResults: {} // 用于存储需要发给服务的AB实验结果
    },
    async onLoad (options) {
        const isLoggedin = cwx.user.isLogin();

        if (isLoggedin) {
            // 前端校验通过场景，才走服务登录校验，防止本地auth失效导致登录bar不显示
            cwx.user.checkLoginStatusFromServer((isLogin) => {
                this.setData({
                    isLoggedin: isLogin
                });
            });
        } else {
            this.setData({
                isLoggedin: false
            });
        }

        this.onLoadBody(options);
        commonfunc.monitorPrivacyAuthorize();
    },
    async onShow () {
        const ps = this.pageStatus;
        ps.calendarJumping = false;

        // 回退场景才走登录校验
        if (!ps.isFirstShow) {
            const { isLoggedin } = this.data;
            const actualLogin = await huser.checkLoginStatus(true);
            if (isLoggedin !== actualLogin) {
                this.setData({
                    isLoggedin: actualLogin
                });
                ps.needRefreshRoomList = true;
            }
        }

        // 场景：填写页不可订时返回等
        if (ps.needRefreshRoomList) {
            ps.needRefreshRoomList = false;
            this.setData({
                isRoomLoading: true
            });
            this.reqRoomList();
        }

        // 从一起选酒店页面回来
        if (this.data.showShareList) {
            this.setChooseEntry(1);
        }
        // 截屏埋点
        screenshotstrace.addScreenObserver(this.screenShotTrace);
        !ps.isFirstShow && util.exUbtSendPV(this, {
            pageId: this.pageId,
            isBack: true
        });
        ps.isFirstShow = false;
    },
    onHide () {
        // 移除截屏埋点
        screenshotstrace.removeScreenObserver(this.screenShotTrace);
    },
    onUnload () {
        const ps = this.pageStatus;
        ps.subRoomSwiperTimeOut && clearTimeout(ps.subRoomSwiperTimeOut);
        ps.promotionTimeInterval && clearInterval(ps.promotionTimeInterval);
        ps.preLoadDetailInterval && clearInterval(ps.preLoadDetailInterval);
        // todo lastcouponid

        if (this.getOpenerEventChannel) {
            const { inDay, outDay } = this.data.dateInfo;
            const ec = this.getOpenerEventChannel();
            if (ec && ec.emit) {
                // 回带入离日期
                if (inDay) {
                    ec.emit('dateChangeNotify', {
                        inDay,
                        outDay,
                        isHourroomDate: ps.isHourroomDate
                    });
                }
            }
        }
        // 移除截屏埋点
        screenshotstrace.removeScreenObserver(this.screenShotTrace);
        // 停止监听页面元素相交状态
        if (this.pageStatus.interObserver) {
            this.pageStatus.interObserver.disconnect();
        }
    },
    async onLoadBody (options) {
        this.pageStatus.preTime = Date.now();
        this.pageStatus.firstReqRoomList = true;
        this.pageStatus.sourceFromTag = options.source_from_tag;
        this.pageStatus.priceDecimal = options.price_decimal;
        this.pageStatus.htlRequestId = options.requestId;
        options.rankid = options.rankid ?? options.rankingId;
        this.options = options;
        this.getOptionInfo(); // options参数整理到pageStatus
        const cacheDate = storageUtil.getStorage(constConf.STORAGE_USER_SELECT_DATE);

        const {
            inday = (cacheDate?.inDay ?? dateUtil.today()),
            outday = (cacheDate?.outDay ?? dateUtil.tomorrow()),
            explosivepresale,
            biz = 1,
            starPlanetId,
            planetBatchCode,
            countdown = '{}'
        } = this.options;
        // 交叉浏览倒计时
        const countdownParams = JSON.parse(countdown);
        const filterSelectedMap = this.getUrlFilterIds();
        const priceFilter = this.getPriceFilter();

        // 钟点房special
        const isHourroomModule = options.ishourroommodule === '1';
        isHourroomModule && (this.calendarPlugin = 'hourroomcalendar');

        // 初始不校验凌晨单失效，此时timeZone还未取到
        const dateGetParams = { inDay: inday, outDay: outday, ignoreMorning: true };
        this.setData({
            isLandingPage: commonfunc.isLandingPage(),
            hotelId: +options.id,
            dateInfo: this.getDateInfo(dateGetParams),
            filterSelectedMap,
            priceFilter,
            collectStorage: !storageUtil.getStorage('P_HOTEL_COLLECTION_GUIDE_OPEN'),
            showPlanetStyle: starPlanetId || planetBatchCode,
            showPresalePackage: explosivepresale === '1',
            isHourroomModule,
            countdownParams
        }, () => {
            // graphql点评、订房必读、政策，依赖入离日期
            this.reqDetailInfo();
        });
        this.setPageIdCom(+biz);
        const { isLoggedin } = this.data;
        !isLoggedin && this.showLoginBarTrace();

        // list传递过来的用户经纬度
        this.getClientCoordinate();

        // AB实验公共方法：先获取实验结果，再处理请求结果
        await this.handleABResult();

        // 判断预加载并处理
        this.processPreLoadInfo();

        // graphql酒店信息
        this.reqHotelInfo();
        this.reqHotelDetail();
        this.handleScoreTask();
        this.reqGroupArticle();

        // 万能开关
        this.checkUniversalSwitches();

        this.setDateStorage(options.inday, options.outday);

        try {
            // 监听房型列表是否与导航栏相交，相交则展示日历bar
            const interObserver = this.createIntersectionObserver();
            this.pageStatus.interObserver = interObserver;
            interObserver.relativeTo('#mp-navigation').observe('#room_mod', (res) => {
                const { height } = res.intersectionRect;
                // 防止多次setData
                if (height > 0 && !this.data.showCalendarBar) {
                    this.setData({
                        showCalendarBar: true
                    });
                } else if (height === 0 && this.data.showCalendarBar) {
                    this.setData({
                        showCalendarBar: false
                    });
                }
            });
        } catch (e) { }
    },
    // 处理AB实验结果
    async handleABResult () {
        const ABTestingMap = {
            ABTESTING_HTL_XCXJL: '',
            ABTESTING_HTL_WLTC: '',
            ABTESTING_TRAVEL_COUPON: ''
        };

        const { abVersionData, adVersionStatus: detailABTestResults } = await commonfunc.getABTestingResults(ABTestingMap);
        this.pageStatus.detailABTestResults = detailABTestResults;
        Object.keys(abVersionData).length && this.setData(abVersionData);
    },
    /**
     * 处理列表页预加载的roomList信息
     * @prevPage 为引用，retry中可获取新值
     */
    processPreLoadInfo () {
        const ps = this.pageStatus;
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        if (!prevPage || prevPage.pageName !== 'hotelList') {
            this.reqRoomList();

            // 开始load roomList埋点
            detailtrace.timeConsuming(this, {
                pageId: this.pageId,
                source: 'detailnew_ready_to_load',
                time: Date.now() - this.pageStatus.preTime
            });
            return;
        }

        const afterCompleted = () => {
            const { detailInfo, hotelId, listPriceTrace, passFromList = '', trackInfo: listTrackInfo } = prevPage.model?.detailLoadInfo || {};
            ps.listPriceTrace = listPriceTrace; // 价格一致率埋点
            ps.listTrackInfo = listTrackInfo; // 记CK需要的一致率数据
            ps.passFromList = passFromList;
            if (!detailInfo || hotelId !== this.options.id) {
                hotelId !== this.options.id && (ps.passFromList = '');
                this.reqRoomList();
                return;
            }

            ps.fromPreLoad = true;
            this.roomListSuccess(detailInfo);
            // 清空预加载数据
            prevPage.model.detailLoadInfo = {};
        };

        if (hasPreLoadCompleted()) {
            afterCompleted();
        } else {
            let retryTimes = 0;
            ps.preLoadDetailInterval = setInterval(() => {
                if (hasPreLoadCompleted() || retryTimes > 50) {
                    clearInterval(ps.preLoadDetailInterval);
                    afterCompleted();
                }
                retryTimes++;
            }, 50);
        }

        function hasPreLoadCompleted () {
            return prevPage.model?.detailLoadInfo?.isCompeleted;
        };
    },
    // 依赖日期的请求
    timeDependentReqs () {
        const pageS = this.pageStatus;
        if (pageS.firstReqRoomList) {
            this.setData({
                showCalendar: true
            }, () => {
                // 获取自定义navigationBar + 日历bar 的高度
                const tasks = [];
                tasks.push(new Promise((resolve, reject) => {
                    this.createSelectorQuery().select('#mp-navigation')
                        .boundingClientRect(rect => {
                            resolve(rect);
                        }).exec();
                }));
                tasks.push(new Promise((resolve, reject) => {
                    this.createSelectorQuery().select('#calendar-bar')
                        .boundingClientRect(rect => {
                            resolve(rect);
                        }).exec();
                }));
                Promise.all(tasks).then((opts = []) => {
                    const [mpDom = {}, calendarDom = {}] = opts;
                    const mpNavHeight = mpDom?.height ?? 0;
                    const calendarBarHeight = calendarDom?.height ?? 0;
                    this.setData({
                        mpNavHeight,
                        fixedHeight: mpNavHeight + calendarBarHeight
                    });
                });
            });
            pageS.firstReqRoomList = false;
            this.reqAdditionInfo();
        }
        this.reqHotelProduct();
        pageS.reqRoomListEnd = true;
        !this.data.isHourroomModule && this.reqNearbyHotels();
        this.reqNearbyFacilities();
    },
    /**
     * 酒店周边
     */
    buildNearByFacilityInfo () {
        // 酒店周边发送曝光埋点
        const nearbyFacilityExposeObj = {
            data: {
                page: this.pageId
            },
            ubtKeyName: '227544'
        };
        const { nearbySpots, newNearbyFacilityList } = this.pageStatus;
        this.setData({
            nearbyFacility: nearbySpots.concat(newNearbyFacilityList),
            nearbyFacilityExposeObj
        });
    },
    /**
     * 酒店周边新接口-暂只接入美食，依赖入离日期，更改日期时需重新调用
     * 接口入参：1: '美食'，2: '购物'，3: '娱乐', 4: '景点', 5: '交通', 6: '热门',
     */
    reqNearbyFacilities () {
        const displayType = ['Dining'];
        const nearbyType = {
            Dining: {
                name: '美食',
                paramsType: 1,
                type: 'Dining', // 后续可用于埋点
                ubtKey: 'xcx_actmdy_food',
                subUbtKey: 'xcx_xqy_mskp'
            }
        }; // 目前仅接入美食
        const { hotelId, dateInfo } = this.data;
        const tasks = [];
        const params = {
            hotelId,
            checkinDate: dateInfo.inDay,
            checkoutDate: dateInfo.outDay
        };
        displayType.forEach(type => {
            tasks.push(new Promise(resolve => {
                params.type = nearbyType[type].paramsType;
                reqUtil.getNewNearbyFacility(params, res =>
                    res.placeInfos?.length && resolve({ placeInfos: res.placeInfos, data: nearbyType[type] })
                );
            }));
        });

        Promise.all(tasks)
            .then(results => {
                this.pageStatus.newNearbyFacilityList = results.map(res => {
                    const facList = res.placeInfos.map(item => {
                        return ({
                            ...item,
                            extraDesc: Number(item.poiPrice?.price) ? `${item.poiPrice.currency}${item.poiPrice.price}` : ''
                        });
                    });
                    return ({
                        ...res.data,
                        current: false,
                        newFacility: true,
                        facList
                    });
                });
                this.buildNearByFacilityInfo();
            });
    },
    toNearbyFacility (e) {
        const { url } = e.currentTarget.dataset;
        cwx.component.cwebview({
            data: {
                url: encodeURIComponent(url),
                needLogin: true
            }
        });
    },

    // 我的积分页面查看酒店/分享好友获取积分任务
    handleScoreTask () {
        const pageStatus = this.pageStatus;
        const hasShareTask = this.checkShareTask();
        // 查看酒店获取积分
        if (hasShareTask) {
            funScoreData.getUserTaskList({}, (res) => {
                if (res?.taskList) {
                    pageStatus.taskShareId = res.taskList[0]?.shareId;
                }
            }, () => {
            });
        }
        // 分享任务链接进入时，已登录好友要发请求
        const { shareid: shareId, id } = this.options;
        if (shareId) {
            const requestData = {
                shareId: +shareId,
                hotelId: id
            };
            funScoreData.clickSharedHotel(requestData);
        }
    },
    getOptionInfo () {
        const {
            pay = 0,
            veilDifPriceInfo = '',
            unreceivedcoupon = '',
            planetBatchCode = '',
            starPlanetId = '',
            ishourroomdate = '',
            ismorning,
            explosivepresale,
            passfromlist = '',
            shareFrom, // 分享的渠道
            user, // 神盾加密的uid
            isNewVersion, // 与shareFrom同组，用于判断分享场景是展示新/老样式，新样式有弹窗
            needcouponlayer = 1 // 行程分享页进入详情页不出弹窗
        } = this.options;

        this.pageStatus = Object.assign({}, this.pageStatus, {
            payType: +pay, // todo兼容
            veilDifPriceInfo,
            lastCouponId: unreceivedcoupon ? +unreceivedcoupon : null,
            planetBatchCode,
            starPlanetId,
            isHourroomDate: ishourroomdate === '1',
            fromMorning: ismorning === '1',
            channelList: explosivepresale === '1' ? '118' : '',
            passFromList: passfromlist,
            shareFrom: shareFrom === undefined ? shareFrom : (shareFrom === 'wechat' ? shareFrom : +shareFrom),
            isNewVersion: isNewVersion === undefined ? isNewVersion : +isNewVersion,
            user: decodeURIComponent(user),
            needCouponLayer: +needcouponlayer
        });
    },
    getClientCoordinate () {
        const { clientlat, clientlng } = this.options || {};
        if (!clientlat || !clientlng) return;

        this.pageStatus.userCoordinate = {
            latitude: clientlat,
            longitude: clientlng
        };
    },
    getUrlFilterIds () {
        const { filter = '[]' } = this.options;
        const result = {};
        try {
            const filterIds = JSON.parse(filter) || [];
            filterIds.forEach(id => { result[id] = true; });
        } catch (error) {
            // ignore
        }

        return result;
    },
    getPriceFilter () {
        const { price = '' } = this.options;
        if (!price) return {};

        const [low, high] = price.split('|').map(item => +item);
        if (!util.isNumber(low) || !util.isNumber(high)) return {};

        return {
            isShown: true,
            low,
            high,
            text: priceText()
        };
        function priceText () {
            if (!high) return `¥${low}以上`;
            if (!low) return `¥${high}以下`;
            return `¥ ${low}-${high}`;
        }
    },
    reqRoomList () {
        const {
            payType,
            minpPriceInfo = '',
            veilDifPriceInfo,
            planetBatchCode,
            starPlanetId,
            channelList,
            firstReqRoomList,
            passFromList,
            sourceFromTag,
            priceDecimal,
            detailABTestResults
        } = this.pageStatus;
        const { inDay: checkinDate, outDay: checkoutDate } = this.data.dateInfo;
        const isHourRoomSearch = () => {
            const isHourroomFilted = () => {
                return (this.data.filterSelectedMap || {})['1|99999999'];
            };
            return this.data.isHourroomModule || this.pageStatus.isHourroomDate || isHourroomFilted();
        };

        const filterIds = this.getSelectedFilters();
        const { clientlat, clientlng, cityid } = this.options || {};
        const params = {
            hotelId: +this.options.id,
            checkinDate,
            checkoutDate,
            payType,
            isHourRoomSearch: isHourRoomSearch(),
            minpPriceInfo,
            filterItemList: commonfunc.getFilterParamsForRoom(filterIds),
            veilDifPriceInfo,
            planetBatchCode,
            starPlanetId,
            passFromList: firstReqRoomList ? passFromList : '', // 第二次请求房型列表时，passFromList=''
            userCoordinate: {
                latitude: clientlat,
                longitude: clientlng,
                cityId: cityid
            },
            ABTest: detailABTestResults
        };
        // 币种精度
        priceDecimal !== undefined && (params.isPriceWithDecimal = priceDecimal === '1');

        // 头部扩展
        const extension = [];
        channelList && extension.push({
            name: 'channelList',
            value: channelList
        });
        sourceFromTag && extension.push({
            name: 'sourceFrom',
            value: sourceFromTag
        });

        if (extension.length) {
            params.head = { extension };
        }

        // 加房型列表实验结果全切了B版, 所以这里直接传B
        params.mtbABResult = 'B';

        reqUtil.getRoomList(params, this.roomListSuccess, this.roomListErr);
    },
    loginCheck (res) {
        const ps = this.pageStatus;
        const skipForceLogin = commonfunc.skipForceLogin(res);
        // 根据服务下发extension->SkipForceLogin字段判断是否跳登录
        ps.skipForceLogin = skipForceLogin;
        if (!skipForceLogin && ps.needJumpToLogin) {
            ps.needJumpToLogin = false;
            this.toLogin();
        }
    },
    roomListSuccess (res = {}) {
        // 状态码201->强制登录
        if (res.result === constConf.NEED_LOGIN) {
            this.toLogin(true);
            return;
        }

        const { isLoggedin } = this.data;

        !isLoggedin && this.loginCheck(res);
        // 保存服务返回原始数据
        const pageS = this.pageStatus;
        pageS.originRoomList = res.roomList || [];
        pageS.originHourRoomList = RoomListSort(res.hourSaleRoomList);
        pageS.guessLikeRoom = res.favoriteRoom || {};
        if (!pageS.hasSetFilterInfo) { // 未初始化筛选项
            pageS.hasSetFilterInfo = true;

            this.setData({
                quickFilterIds: this.data.isHourroomModule ? [] : res.quickFilterIds,
                filterSummary: this.getFilterSummary(res),
                filterInfo: this.getFilterInfo(res)
            }, () => {
                // 后续选中筛选id判断依赖this.data.filterInfo等
                this.afterRoomSuccess(res);
            });
        } else {
            this.afterRoomSuccess(res);
        }

        function RoomListSort (roomList) {
            if (!roomList || !roomList.length) return [];

            const subRoomMap = res.subRoomMap || {};
            roomList.sort((a, b) => {
                if (!subRoomMap[a.skey] || !subRoomMap[b.skey]) return 0;
                return subRoomMap[a.skey].price - subRoomMap[b.skey].price;
            });
            return [...roomList.filter(r => subRoomMap[r.skey]?.status === BOOKABLE_ROOM_STATUS),
                ...roomList.filter(r => subRoomMap[r.skey]?.status !== BOOKABLE_ROOM_STATUS)];
        }
    },
    afterRoomSuccess (res) {
        // 前端筛选
        const { roomList, hourRoomList } = this.filterRooms(res.subRoomMap);
        const { isHourroomModule } = this.data;
        const pageS = this.pageStatus;
        pageS.filteredRoomList = roomList;
        pageS.trackId = res.trackId;
        pageS.userExtraInfo = res.userExtraInfo || {};
        pageS.trackInfoNoRoom = res.trackInfoNoRoom || '';
        pageS.requestId = commonfunc.getResponseLogId(res, 'request-id');
        const showHourRoomList = !isHourroomModule && hourRoomList?.length > 1 ? hourRoomList.slice(0, 1) : hourRoomList;
        // 整理roomData
        const dataToSet = this.getRoomData({
            baseRoomMap: res.baseRoomMap || {},
            subRoomMap: res.subRoomMap || {},
            guessLikeRoom: res.favoriteRoom || {},
            roomList,
            hourRoomList,
            fromRoomReq: true,
            canNotBeOrderedInfo: res.canNotBeOrderedInfo || {},
            showHourRoomList
        });

        // 服务日期校正，因为timeZone存在，每次请求都会走到
        const { checkinDate, checkoutDate, timeZoneInfo = {} } = res.modifyInfo || {};
        if (checkinDate || checkoutDate || timeZoneInfo) {
            const timeZone = timeZoneInfo?.timeZone || 0;
            dataToSet.dateInfo = this.getDateInfo({
                inDay: checkinDate,
                outDay: checkoutDate,
                serverTime: res.serverTime,
                timeZone
            });
        }

        // 房型不可订原因
        dataToSet.canNotBeOrderedInfo = res.canNotBeOrderedInfo || {};
        // 房型不可订时，可订日期推荐
        dataToSet.recommendDateList = res.priceCalendarMultiDate?.map(item => {
            const timeZoneDate = pageS.timeZoneDate;
            return ({
                checkIn: dateUtil.formatTime('yyyy-MM-dd', item.checkIn),
                checkOut: dateUtil.formatTime('yyyy-MM-dd', item.checkOut),
                inDayText: commonfunc.getDateDisp(item.checkIn, timeZoneDate)[0],
                outDayText: commonfunc.getDateDisp(item.checkOut, timeZoneDate)[0],
                minPrice: item.minPrice,
                minPriceBeforeTax: item.minPriceBeforeTax,
                night: item.night
            });
        }) ?? [];
        const selectedFilterIds = this.getSelectedFilters() || []; // 选中筛选项
        dataToSet.sortedQuickFilterIds = this.constructQuickFilterIds(selectedFilterIds);

        // 是否有筛选选中
        dataToSet.hasFilterSelected = selectedFilterIds.length > 0;
        // 房型列表下载成功后展示倒计时挂件
        dataToSet.countdownParams = pageS.countdownParams;

        // 等待roomList请求成功后再展示banner
        dataToSet.hasPromotionBack = true;
        const bannerInfo = this.handlePromotionBanner(res.bannerInfo) || {};
        this.setData({
            ...dataToSet,
            ...bannerInfo
        }, () => {
            cwx.sendUbtExpose.refreshObserve(this);
        });
        const loadTime = Date.now() - pageS.preTime;
        this.setLimitedTime(res.subRoomMap);
        this.timeDependentReqs();
        this.showNoShareRoomId(dataToSet.friendShareRoom);

        // roomlist显示完成埋点
        if (pageS.needTimeConsumeTrace) {
            pageS.needTimeConsumeTrace = false;
            detailtrace.timeConsuming(this, {
                pageId: this.pageId,
                source: pageS.fromPreLoad ? 'detailnew_preload_finish' : 'detailnew_load_finish',
                time: loadTime,
                roomCount: util.keys(dataToSet.subRoomMap || {}).length
            });
        }

        this.noRoomTrace(res);
        // 一致率埋点
        this.tracePrice();
        // 基础埋点
        this.baseTrace(res);
    },
    roomListErr () {
        this.timeDependentReqs();
    },
    /**
     * 快筛项列表页与详情页联动处理，排序：已选在前，未选在后
     * @return
     * [...selectedQFIds, ...remainedQFIds] 排序后的快筛数组id
     */
    constructQuickFilterIds (selectedFilterIds = []) {
        const reverseSelectedIds = selectedFilterIds.reverse();
        const { quickFilterIds = [] } = this.data;
        // 已选的快筛数组id
        const selectedQFIds = reverseSelectedIds.filter(item => quickFilterIds.includes(item));
        // 未选的快筛数组id
        const remainedQFIds = quickFilterIds.filter(item => !selectedQFIds.includes(item));
        return [...selectedQFIds, ...remainedQFIds];
    },
    handlePromotionBanner (bannerInfo) {
        if (!bannerInfo) return;
        const { basicInfo: bannerBasicInfo = {}, bannerFloating = {}, atmosphereBannerInfo } = bannerInfo;
        const hotelId = this.data.hotelId ?? this.options.id;

        // 处理优惠券浮层数据
        const bannerFloatData = coupondata.getBannerFloatData(bannerFloating);
        const hotelCouponsModule = coupondata.gethotelCouponsData(bannerFloating, { hotelId, ubtKey: exposeTraceKey.HOTEL_DETAIL_TRAVEL_COUPON_MODULE });
        const rewardModule = coupondata.getRewardData(bannerFloating);
        const { bannerTags = [], bannerButtonData = {} } = bannerBasicInfo;
        // 处理banner标签数据格式
        bannerBasicInfo.bannerTags = bannerTags.map(item => {
            const couponTags = {};
            couponTags.exposeData = {
                ubtKeyName: exposeTraceKey.HOTEL_DETAIL_TRAVEL_COUPON_TAG,
                data: {
                    page: this.pageId,
                    masterhotelid: hotelId,
                    display_text: item,
                    package_type: item
                }
            };
            if (item?.indexOf('·') !== -1) {
                couponTags.showCouponText = true;
                [couponTags.leftText, couponTags.rightText] = item?.split('·');
            } else {
                couponTags.tag = item;
            }
            return couponTags;
        });
        // 详情页banenr标题
        bannerBasicInfo.headTitle = '订房优惠';
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
        if (bannerBasicInfo.bannerTags.length) {
            this.showCouponsTrace(bannerBasicInfo.bannerTags);
        }
        // 特色房banner曝光埋点数据
        const marketBannerExposeObj = {
            data: {
                masterhotelid: this.data?.hotelId,
                atmosphereBannerInfo: {
                    headTitle: atmosphereBannerInfo?.headTitle || '',
                    desc: atmosphereBannerInfo?.desc || ''
                }
            },
            ubtKeyName: exposeTraceKey.HOTEL_DETAIL_ROOM_MARKET_BANNER_KEY
        };
        return {
            bannerBasicInfo,
            bannerFloatData,
            hotelCouponsModule,
            rewardModule,
            atmosphereBannerInfo,
            marketBannerExposeObj
        };
    },
    showNoShareRoomId (room = {}) {
        const ps = this.pageStatus;
        const fromFriendShare = !!this.options.shareroomid;
        if (fromFriendShare && !ps.hasShowNoShareRoom && !room.id) {
            ps.hasShowNoShareRoom = true;
            cwx.showToast({
                title: '小程序暂不支持预订好友分享的房型',
                icon: 'none',
                duration: 2000
            });
        }
    },
    /**
     * subRooms整理，eg.按钮文案
     * @param {*} subRooms
     * @returns 整理后的subRooms
     */
    buildSubroomExtraInfo (subRooms = {}) {
        const { requestId = '', htlRequestId = '' } = this.pageStatus;
        const sharedIds = this.getFriendShareStoreIds() || [];
        const packageIdMap = {
            1: '住',
            2: '食',
            3: '享'
        };
        const { isLongRent } = this.data.dateInfo;

        Object.values(subRooms).forEach(room => {
            let saleBtnText = '订';
            let customSaleTextCls = '';
            // 按钮文案
            const { status, receivableCouponInfo, roomPackageInfo, isLongRentAutoCoverd, priceStr, price, enableRewardMealAndCancel: isShowReward, id: roomId = '', roomNo = '' } = room;
            const { strategyIds, strategyId } = receivableCouponInfo || {};
            if (status === 1 && (strategyIds?.length || strategyId)) {
                saleBtnText = '领券订';
                customSaleTextCls = 'fs24';
            } else if (isLongRentAutoCoverd) {
                saleBtnText = '申请';
            }

            if (status !== 1) {
                customSaleTextCls = 'fs28';
                saleBtnText = '订完';
            }

            // 未登录单独处理
            if (price === 0 && priceStr) {
                saleBtnText = '解锁';
                room.showFuzzyPrice = true;
            }

            room.isShowReward = isShowReward;
            room.saleBtnText = saleBtnText;
            room.customSaleTextCls = customSaleTextCls;
            sharedIds.length && (room.isFriendRecommendRoom = sharedIds.includes(room.id));

            // 套餐
            if (roomPackageInfo?.packageInfoList?.length) {
                room.isCalendarSuite = true;
                roomPackageInfo.packageInfoList.forEach(item => { item.icon = packageIdMap[item.type]; });
            }

            // 长租房
            if (isLongRent) {
                const { price, originPrice, priceStr } = room.totalPriceInfo || {};
                const showPrice = room.showFuzzyPrice ? priceStr : price;
                if (showPrice) {
                    room.priceAvg = room.price;
                    room.price = price;
                    room.priceStr = priceStr;
                    room.originPrice = originPrice;
                }
            }

            // 会员享免费兑取消
            if (isShowReward && room.cancelPolicyInfo?.labelExtensions) {
                const labelExtensions = room.cancelPolicyInfo.labelExtensions;
                room.limitCancelDesc = labelExtensions.find(it => it.type === 'LimitCancelDesc')?.value;
            }

            // 售卖房型卡片发送曝光埋点
            room.subRoomExposeObj = {
                data: {
                    page: this.pageId,
                    roomid: roomId,
                    triggerTime: new Date().getTime(),
                    rmlist_tracelogid: requestId,
                    masterhotelid_tracelogid: htlRequestId,
                    room_token: roomNo
                },
                ubtKeyName: exposeTraceKey.HOTEL_DETAIL_ROOM_CARD_KEY
            };
        });

        return subRooms;
    },
    /**
     * @param {*} res 服务返回结果（无筛选项时）；或者前端筛选后的房型信息
     * @returns 待set房型数据
     */
    getRoomData (res) {
        let {
            canNotBeOrderedInfo = {}, // 不可订原因
            baseRoomMap,
            subRoomMap,
            guessLikeRoom,
            roomList = [], // key索引
            hourRoomList = [],
            fromRoomReq
        } = res;
        let [minSubroomPrice, minHourroomPrice] = [0, 0];

        subRoomMap = this.buildSubroomExtraInfo(subRoomMap);
        const { isHourroomModule } = this.data;
        const showHourRoomList = !isHourroomModule && hourRoomList?.length > 1 ? hourRoomList.slice(0, 1) : hourRoomList;
        const { moreTilingRoomBtn, rooms: tilingRoomList } = this.getTilingRooms(res);
        const dataToSet = {
            friendShareRoom: this.getFriendShareRoom(roomList, hourRoomList),
            tilingRoomList,
            moreTilingRoomBtn,
            hourRoomList,
            subRoomMap,
            showHourRoomList
        };
        // 是否存在可订房型；status ===1 时，房型可订；只有当无房型或者所有房型均不可订，即hasBookingRoom为false时，才展示不可订原因
        const hasBookingRoom = Object.values(subRoomMap).some(room => room.status === BOOKABLE_ROOM_STATUS);
        dataToSet.noRoomRes = Boolean(((!roomList.length && !hourRoomList.length) || !hasBookingRoom) && canNotBeOrderedInfo?.messageBold);

        dataToSet.isRoomLoading = false;

        // 猜你喜欢
        const hasGuessLikeRoom = this.isInRoomList(roomList, guessLikeRoom?.skey);
        dataToSet.guessLikeRoom = hasGuessLikeRoom ? guessLikeRoom : {}; // 筛选后的房型中不含猜你喜欢，猜你喜欢房型赋值为{}

        // 遍历baseRoomMap, 给物理房型添加titleIcon
        for (const key in baseRoomMap) {
            const room = baseRoomMap[key];
            const tagIconItem = room?.extensionInfos?.find(item => item?.key === 'tagIcon');
            room.titleIcon = tagIconItem?.value || '';
        }

        // 折叠房型
        const bookingList = [];
        const fullBookList = [];
        if (!tilingRoomList.length) {
            // 起价子房型存minPriceSkey
            roomList.every(bRoom => {
                if (!bRoom.subRoomList || !bRoom.subRoomList.length || !baseRoomMap[bRoom.key]) return true;

                // minBookingPrice: 可定房型起价，minBookingSkey：可定起价房型skey
                // minDisplayPrice: 可定房型起价，不包含小数点，展示在底部bar
                // minFullPrice: 订完房型起价，minFullSkey：订完起价房型skey
                let [minBookingPrice, minFullPrice, minBookingSkey, minFullSkey, minDisplayPrice] = [undefined, undefined, '', '', 0];
                bRoom.subRoomList.forEach(subRoom => {
                    const subRoomInfo = subRoom?.skey ? subRoomMap[subRoom.skey] : null;
                    if (!subRoomInfo) return;
                    const status = subRoomInfo.status;
                    // 海外税费新增 pickMinPrice 用于起价房型挑选
                    const price = subRoomInfo.pickMinPrice || subRoomInfo.price;
                    const displayPrice = subRoomInfo.price;
                    // 叠加券时有价格为0的情况，最低价初始值minBookingPrice/minFullPrice，分别使用第一个可订/不可订房型的价格
                    if (status === BOOKABLE_ROOM_STATUS && (minBookingPrice === undefined || price < minBookingPrice)) {
                        minBookingPrice = price;
                        minDisplayPrice = displayPrice;
                        minBookingSkey = subRoom.skey;
                    }
                    if (status !== BOOKABLE_ROOM_STATUS && (minFullPrice === undefined || price < minFullPrice)) {
                        minFullPrice = price;
                        minFullSkey = subRoom.skey;
                    }
                });
                if (minBookingPrice >= 0) {
                    baseRoomMap[bRoom.key].minPriceSkey = minBookingSkey;
                    bRoom.minPrice = minBookingPrice;
                    bRoom.minDisplayPrice = minDisplayPrice;
                    bookingList.push(bRoom);
                } else {
                    baseRoomMap[bRoom.key].minPriceSkey = minFullSkey;
                    bRoom.minPrice = minFullPrice;
                    fullBookList.push(bRoom);
                }

                // 物理房型卡片发送曝光埋点
                const baseRoomId = baseRoomMap[bRoom.key].id;
                const skey = bRoom.subRoomList[0].skey;
                const baseRoomNo = subRoomMap[skey].roomNo;
                baseRoomMap[bRoom.key].baseRoomExposeObj = {
                    data: {
                        page: this.pageId,
                        masterbasicroomid: baseRoomId,
                        triggerTime: new Date().getTime(),
                        showIcon: baseRoomMap[bRoom.key].titleIcon ? 'T' : 'F',
                        room_token: baseRoomNo
                    },
                    ubtKeyName: '227533'
                };
                return true;
            });

            bookingList.sort((a, b) => a.minPrice - b.minPrice);
            fullBookList.sort((a, b) => a.minPrice - b.minPrice);
            minSubroomPrice = bookingList[0]?.minDisplayPrice ?? 0;
            // 分页
            const { roomListShow, moreBaseRoomTxt } = this.doRoomPage(bookingList.concat(fullBookList), baseRoomMap);
            dataToSet.baseRoomList = roomListShow;
            dataToSet.moreBaseRoomTxt = moreBaseRoomTxt;
        } else {
            tilingRoomList.filter(room => room.skey && (subRoomMap[room.skey]?.status === BOOKABLE_ROOM_STATUS)).forEach(item => {
                const subRoom = subRoomMap[item.skey];
                minSubroomPrice = minSubroomPrice || subRoom.price;
                minSubroomPrice = subRoom.price < minSubroomPrice ? subRoom.price : minSubroomPrice;
            });
        }
        hourRoomList.filter(room => room.skey && (subRoomMap[room.skey]?.status === BOOKABLE_ROOM_STATUS)).forEach(item => {
            const hourRoom = subRoomMap[item.skey];
            minHourroomPrice = minHourroomPrice || hourRoom.price;
            minHourroomPrice = hourRoom.price < minHourroomPrice ? hourRoom.price : minHourroomPrice;
        });

        if (fromRoomReq) {
            Object.keys(baseRoomMap).forEach(k => {
                baseRoomMap[k].hiddenSub = true;
            });
            dataToSet.subRoomMap = subRoomMap;
        }

        dataToSet.baseRoomMap = baseRoomMap;
        // 钟点房房型起价
        dataToSet.minHourroomPrice = minHourroomPrice;
        // 物理房型起价
        dataToSet.minSubroomPrice = minSubroomPrice;

        return dataToSet;
    },
    /**
     * 房型分页处理
     * @return
     * roomListShow 页面展示用roomList
     * moreBaseRoomTxt 更多物理房型按钮文案
     */
    doRoomPage (roomList, baseRoomMap) {
        // 子房型分页规则: {maxDisplayRoomCount}-10-10...
        const roomListShow = util.clone(roomList);
        const moreSubRooms = {}; // 存放隐藏子房型
        roomListShow.forEach(bRoom => {
            const bKey = bRoom.key;
            const baseRoomInfo = baseRoomMap[bKey];
            const displayRoomCount = baseRoomInfo.maxDisplayRoomCount || 5;
            const { subRoomList } = bRoom;
            if (subRoomList.length > displayRoomCount) {
                bRoom.subRoomList = subRoomList.slice(0, displayRoomCount);
                const leftSubRooms = subRoomList.slice(displayRoomCount);
                moreSubRooms[bKey] = leftSubRooms;
                baseRoomInfo.moreSubRoomTxt = this.getMoreSubRoomTxt(leftSubRooms.length);
            } else {
                baseRoomInfo.moreSubRoomTxt = ''; // 防止筛选后出 展开更多 按钮
            }
        });
        this.pageStatus.moreSubRooms = moreSubRooms;

        // baseRoom分页: 10-更多
        let moreBaseRoomTxt = '';
        if (roomListShow.length > 10) {
            const moreBaseRooms = roomListShow.slice(10);
            this.pageStatus.moreBaseRooms = moreBaseRooms;
            moreBaseRoomTxt = `查看其他${moreBaseRooms.length}个房型`;
        }

        return {
            roomListShow: roomListShow.slice(0, 10),
            moreBaseRoomTxt
        };
    },
    /**
     * return 筛选后的roomList 和 hourRoomList
     */
    filterRooms (subRoomMap = this.data.subRoomMap) {
        let { originRoomList, originHourRoomList, isHourroomDate } = this.pageStatus;
        isHourroomDate && (originRoomList = []);
        const noFilterRes = { roomList: originRoomList, hourRoomList: originHourRoomList };
        if (this.data.dateInfo.isLongRent) return noFilterRes;

        const selectedIds = this.getSelectedFilters(); // 选中筛选项
        const { priceFilter = {} } = this.data;
        if (!selectedIds.length && !priceFilter.isShown) return noFilterRes;

        // 普通房型
        const roomList = [];
        originRoomList.forEach(bRoom => {
            const bResult = {
                id: bRoom.id,
                key: bRoom.key,
                subRoomList: []
            };

            bRoom.subRoomList?.forEach(sRoom => {
                isFit(subRoomMap[sRoom.skey]) && bResult.subRoomList.push(sRoom);
            });
            bResult.subRoomList.length && roomList.push(bResult);
        });

        // 钟点房
        const hourRoomList = [];
        originHourRoomList.forEach(hRoom => {
            isFit(subRoomMap[hRoom.skey]) && hourRoomList.push(hRoom);
        });

        return { roomList, hourRoomList };

        function isFit (checkRoom = {}) {
            const filterIds = checkRoom.filterIds || [];
            const price = checkRoom.filterPrice || checkRoom.price; // 海外税费新增filterPrice字段用于房型过滤
            const { isShown, low, high } = priceFilter;
            if (isShown) { // 价格过滤
                if (!high) { // xx价格以上
                    if (price < low) return false;
                } else if (price < low || price > high) {
                    return false;
                }
            }

            return !selectedIds.some(id => !filterIds.includes(id));
        }
    },
    getFilterInfo (res) {
        return JSON.parse(res.filterInfo || '[]');
    },
    getFilterSummary (res) {
        const filterSummary = JSON.parse(res.filterSummary || '{}');
        const result = {};
        Object.keys(filterSummary).forEach(fKey => {
            const { title, key: oldKey, nodeType, paths, data = {} } = filterSummary[fKey];
            const { filterId } = data;
            result[fKey] = {
                title,
                filterId,
                oldKey,
                excludeBrothers: nodeType === 2, // 需排除其他兄弟选项，eg.全部优惠
                path: paths[0] || [] // filterInfo中的索引
            };
        });

        return result;
    },
    showFilterLayer (e) {
        const filterLayerExposeObj = {
            data: {
                page: this.pageId,
                triggerTime: new Date().getTime()
            },
            ubtKeyName: exposeTraceKey.HOTEL_DETAIL_FILTER_LAYER_KEY
        };
        this.setData({
            showFilterLayer: true,
            filterLayerExposeObj
        });
        this.clickFilterLayerTrace();
    },
    closeFilterLayer (e) {
        this.setData({ showFilterLayer: false });
    },
    handleFilterReset () {
        this.setData({
            filterSelectedMap: {},
            hasFilterSelected: false
        }, this.updateRoomsByFilter);
    },
    cancelPriceFilter (e) {
        this.setData({
            priceFilter: {}
        }, this.updateRoomsByFilter);
    },
    /**
     * 选中/反选某个筛选项
     */
    filterSelect (e) {
        const { key } = e.currentTarget.dataset;
        const { filterSelectedMap } = this.data;
        const toSelect = !filterSelectedMap[key];
        const curSelectedIds = this.getSelectedFilters();

        this.pageStatus.filtered = true;

        if (toSelect) { // 正选
            const brotherMutexIds = this.getBrotherMutexIds(key);
            const otherMutexIds = this.getOtherMutexIds(key);
            const mutexIds = [...brotherMutexIds, ...otherMutexIds];

            const selectedIds = [...curSelectedIds, key].filter(id => !mutexIds.includes(id));
            const selectedMapNew = {};
            selectedIds.forEach(item => {
                selectedMapNew[item] = true;
            });
            const sortedQuickFilterIds = this.constructQuickFilterIds(selectedIds);
            this.setData({
                filterSelectedMap: selectedMapNew,
                hasFilterSelected: true,
                sortedQuickFilterIds
            }, this.updateRoomsByFilter);
        } else {
            filterSelectedMap[key] = false;
            const selectedIds = this.getSelectedFilters() || [];
            const sortedQuickFilterIds = this.constructQuickFilterIds(selectedIds);
            this.setData({
                filterSelectedMap,
                hasFilterSelected: curSelectedIds?.length !== 1,
                sortedQuickFilterIds
            }, this.updateRoomsByFilter);
        }
    },
    updateRoomsByFilter () {
        this.setData({
            isRoomLoading: true,
            noRoomRes: false
        });

        const { roomList, hourRoomList } = this.filterRooms();

        const tData = this.data;
        const pageS = this.pageStatus;
        const dataToSet = this.getRoomData({
            baseRoomMap: tData.baseRoomMap,
            subRoomMap: tData.subRoomMap,
            guessLikeRoom: pageS.guessLikeRoom,
            canNotBeOrderedInfo: tData.canNotBeOrderedInfo,
            roomList,
            hourRoomList,
            fromRoomReq: false
        });
        this.setData(dataToSet);
    },
    /**
     * @returns Array 选中filterIds
     */
    getSelectedFilters () {
        const { filterSelectedMap, filterSummary = {} } = this.data;

        return Object.keys(filterSelectedMap).filter(key => {
            return filterSelectedMap[key] && isRoomFilter(key);
        });

        // 从列表带过来的筛选项包含酒店和房型维度
        function isRoomFilter (id) {
            return Object.keys(filterSummary).includes(id);
        }
    },
    /**
     * @param {*} filterId
     * @returns Array 同级互斥筛选项
     */
    getBrotherMutexIds (filterId) {
        const result = [];
        const { filterSummary, filterInfo } = this.data;
        const { path = [], excludeBrothers } = filterSummary[filterId] || {};
        const idx = path[0];
        if (!idx) return result;

        const filter = filterInfo[idx] || {};
        const { isMultiSelect } = filter.operation || {};
        if (!excludeBrothers && isMultiSelect) return result;

        const { subItems = [] } = filter;
        subItems.forEach(item => {
            const id = item.data?.filterId;
            if (id && id !== filterId) result.push(id);
        });

        return result;
    },
    getOtherMutexIds (filterId) {
        const otherMutexTypes = this.getMutexType(filterId, 'otherMutexIds');
        if (!otherMutexTypes) return [];

        const curSelectedIds = this.getSelectedFilters();
        return curSelectedIds.filter(sID => {
            const slefMutexTypes = this.getMutexType(sID, 'selfMutexIds');
            let hasSameId = false;
            for (let i = 0, n = slefMutexTypes.length; i < n; i++) {
                if (otherMutexTypes.includes(slefMutexTypes[i])) {
                    hasSameId = true;
                    break;
                }
            }

            return hasSameId;
        });
    },
    getMutexType (filterId, type) {
        const { filterInfo, filterSummary } = this.data;
        const { path = [] } = filterSummary[filterId] || {};

        let curNode = {};
        const resType = new Set();
        path.forEach((pItem, idx) => {
            curNode = idx === 0 ? filterInfo[pItem] : curNode.subItems[pItem];
            const typeItems = curNode.operation?.[type] || [];
            typeItems.forEach(type => resType.add(type));
        });
        return [...resType];
    },
    /**
     * subRoomMap加上倒计时显示用字段countdown; 格式hh:mm:ss
     * 每秒setData更新
     * @param {*} subRoomMap
     */
    setLimitedTime (subRoomMap = {}) {
        let hasEventRunning = false;
        // clear倒计时
        clearInterval(this.pageStatus.promotionTimeInterval);

        this.pageStatus.promotionTimeInterval = setInterval(() => {
            const needCountDownRooms = {};
            Object.keys(subRoomMap).forEach(k => {
                const limitedTimePromotionTip = subRoomMap[k].roomInspireInfo?.limitedTimePromotionTip || {};
                const { endTime = 0 } = limitedTimePromotionTip; // 倒计时毫秒数
                if (endTime > 0) {
                    let totalEndSec = Math.floor(endTime / 1000);
                    let countdown = '';
                    if (totalEndSec > 0) {
                        hasEventRunning = true;
                        totalEndSec--;
                        const hh = formartZero(Math.floor(totalEndSec / 3600));
                        const mm = formartZero(Math.floor((totalEndSec / 60 % 60)));
                        const ss = formartZero(Math.floor((totalEndSec % 60)));
                        countdown = [hh, mm, ss].join(':');
                    } else {
                        countdown = '';
                    }

                    limitedTimePromotionTip.countdown = countdown;
                    limitedTimePromotionTip.endTime = endTime - 1000;
                    needCountDownRooms[`subRoomMap.${k}.roomInspireInfo.limitedTimePromotionTip`] = limitedTimePromotionTip;

                    function formartZero (num) {
                        return (num < 10 ? '0' : '') + num;
                    }
                }
            });

            this.setData({
                ...needCountDownRooms
            });
            if (!hasEventRunning) {
                clearInterval(this.pageStatus.promotionTimeInterval);
            }
            hasEventRunning = false;
        }, 1000);
    },
    getFriendShareRoom (roomList, hourRoomList) {
        let result = {};
        const id = +this.options.shareroomid;
        if (!id) return result;

        roomList.some(broom => {
            return (broom.subRoomList || []).some(sroom => {
                if (id === sroom.id) {
                    result = sroom;
                    return true;
                }
                return false;
            });
        });
        if (!result.id) {
            hourRoomList.some(room => {
                if (id === room.id) {
                    result = room;
                    return true;
                }
                return false;
            });
        }
        return result;
    },
    getFriendShareStoreIds () {
        const id = +this.options.shareroomid;
        if (!id) return;
        const today = dateUtil.today();
        const result = [];
        let newStorageIds = [];
        const oldStoredIds = storageUtil.getStorage(HOTEL_DETAIL_SHARE_ROOM_LIST) || [];

        // 历史分享房型ID
        oldStoredIds.forEach(item => {
            const arr = item.split('_');
            const roomId = parseInt(arr[0]);
            if (roomId !== id &&
                dateUtil.calDays(arr[1], today) <= MAX_SHARE_ROOM_VAILD_DAYS) {
                result.push(roomId);
                newStorageIds.push(item);
            }
        });

        // 当前分享
        result.push(id);
        newStorageIds.push(`${id}_${today}`);
        newStorageIds = newStorageIds.slice(-50);
        storageUtil.setStorage(HOTEL_DETAIL_SHARE_ROOM_LIST, newStorageIds, 24 * MAX_SHARE_ROOM_VAILD_DAYS);
        return result;
    },
    isInRoomList (roomList, skey) {
        if (!skey) return false;

        return roomList.some(broom => {
            return (broom.subRoomList || []).some(sroom => sroom.skey === skey);
        });
    },
    getTilingRooms (res) {
        const result = {
            moreTilingRoomBtn: false,
            rooms: []
        };
        const {
            roomList = [],
            subRoomMap = {}
        } = res;

        const bookRooms = [];
        const fullRooms = [];
        let onlyOneSubRoom = true; // 每个物理房型下都不多于一个可订房
        let showTilingRoom = true;
        roomList.some(broom => {
            let canBookCount = 0;
            (broom.subRoomList || []).some(sroom => {
                const { skey } = sroom;
                const { status, flatRank } = (subRoomMap[skey] || {});
                const hidden =
                    status ? fullRooms.length > 0 : bookRooms.length >= MAX_TILING_ROOMS_LIMIT;
                const roomItem = {
                    ...sroom,
                    hidden,
                    flatRank
                };
                if (status) {
                    canBookCount++;
                    bookRooms.push(roomItem);
                } else {
                    fullRooms.push(roomItem);
                }

                if (canBookCount > 1) {
                    onlyOneSubRoom = false;
                }
                if (bookRooms.length > MAX_TILING_ROOMS_LIMIT && !onlyOneSubRoom) {
                    showTilingRoom = false;
                    return true;
                }
                return false;
            });
            return !showTilingRoom;
        });
        if (!showTilingRoom) return result;

        bookRooms.sort((a, b) => b.flatRank - a.flatRank);
        fullRooms.sort((a, b) => b.flatRank - a.flatRank);
        result.rooms = bookRooms.concat(fullRooms);
        if (result.rooms.length > MAX_TILING_ROOMS_LIMIT || fullRooms.length > 1) {
            result.moreTilingRoomBtn = true;
        }

        return result;
    },
    toggleSubRoom (e) {
        const { key } = e.currentTarget.dataset;
        const { baseRoomMap, fixedHeight } = this.data;
        const hiddenSub = !baseRoomMap[key].hiddenSub;
        const id = `b${key}`; // 用于滚动
        if (!hiddenSub) {
            const query = wx.createSelectorQuery();
            query.select(`#${id}`).boundingClientRect();
            query.exec(res => {
                const currentDomTop = res?.[0]?.top || 0;
                this.setData({
                    [`baseRoomMap.${key}.hiddenSub`]: hiddenSub,
                    scrollTopHeight: this.pageStatus.scrollTop + currentDomTop - fixedHeight
                });
            });
        } else {
            this.setData({ [`baseRoomMap.${key}.hiddenSub`]: hiddenSub });
        }
        !hiddenSub && this.roomClickTrace(209476);
    },
    moreBaseRoomShow (e) {
        const { moreBaseRooms = [] } = this.pageStatus;
        if (!moreBaseRooms.length) return;

        this.setData({
            baseRoomList: [
                ...this.data.baseRoomList,
                ...moreBaseRooms
            ],
            moreBaseRoomTxt: ''
        });
    },
    /**
     * 展开更多子房型
     * this.pageStatus存放剩余房型递减; 展示房型subRoomList递增
     */
    moreSubRoomShow (e) {
        const { baseKey, baseIndex } = e.currentTarget.dataset;
        const { moreSubRooms = {} } = this.pageStatus;
        const moreSubs = moreSubRooms[baseKey] || [];
        const moreSubLen = moreSubs.length;
        if (!moreSubLen) return;

        const subRoomListNow = this.data.baseRoomList[baseIndex].subRoomList;
        if (moreSubLen <= 10) {
            this.setData({
                [`baseRoomList[${baseIndex}].subRoomList`]: subRoomListNow.concat(moreSubs),
                [`baseRoomMap.${baseKey}.moreSubRoomTxt`]: ''
            });
            this.pageStatus.moreSubRooms[baseKey] = [];
        } else {
            const leftMoreSubs = moreSubs.slice(10);
            this.getMoreSubRoomTxt(leftMoreSubs.length);
            this.setData({
                [`baseRoomList[${baseIndex}].subRoomList`]: subRoomListNow.concat(moreSubs.slice(0, 10)),
                [`baseRoomMap.${baseKey}.moreSubRoomTxt`]: this.getMoreSubRoomTxt(leftMoreSubs.length)
            });
            this.pageStatus.moreSubRooms[baseKey] = leftMoreSubs;
        }

        this.clickMoreSubRoomTrace(baseKey);
    },
    getMoreSubRoomTxt (leftSubRoomsLen) {
        return leftSubRoomsLen > 10 ? '查看更多10个价格' : `查看其他${leftSubRoomsLen}个价格`;
    },
    /**
     * 预览房型图片
     * @param e
     */
    showRoomImgLayer (e) {
        const { key } = e.currentTarget.dataset;
        const baseRoom = this.data.baseRoomMap[key] || {};
        let previewPictures = [];
        let { pictureList = [], newPictureList = [], previewPictureList } = baseRoom;
        if (!pictureList.length) return;

        if (!previewPictureList?.length && newPictureList.length) {
            previewPictureList = newPictureList.map(picture => {
                const { urlBody, urlExtend } = picture;
                const [pictureType, width, height, quality, waterMarkName, waterMarkPosition] = ['C', 1280, 853, 90, 'ht8', 3];
                return commonfunc.getDynamicImageUrl({
                    urlBody,
                    urlExtend,
                    type: pictureType, // 切图类型
                    width, // 图片宽度
                    height, // 图片宽度
                    quality, // 图片质量
                    waterMarkName, // 水印名
                    waterMarkPosition // 水印位置
                });
            });
            this.setData({
                [`baseRoomMap.${key}.previewPictureList`]: previewPictureList
            });
        }

        previewPictures = previewPictureList?.length ? previewPictureList : pictureList;
        wx.previewImage({
            current: previewPictures[0],
            urls: previewPictures
        });
    },
    showRoomLayer (e) {
        const { key, skey } = e.currentTarget.dataset;
        const { baseRoomMap, subRoomMap } = this.data;
        if (!baseRoomMap[key] || !subRoomMap[skey]) return;
        // 房型浮层发送曝光埋点
        const { headTitle = '', skipPage = '', roomAtmosphereFacilityInfos = {} } = baseRoomMap[key]?.roomAtmosphereInfo || {};
        const roomLayerExposeObj = {
            data: {
                triggerTime: new Date().getTime(),
                page: this.pageId,
                roomAtmosphereInfo: {
                    headTitle,
                    showIcon: skipPage ? 'T' : 'F',
                    roomAtmosphereFacilityInfos: JSON.stringify(roomAtmosphereFacilityInfos)
                } // 特色房型信息
            },
            ubtKeyName: exposeTraceKey.HOTEL_DETAIL_ROOM_LAYER_KEY
        };
        this.setData({
            roomLayer: {
                isShown: true,
                key,
                skey,
                roomLayerExposeObj
            }
        });

        // 房型列表点击埋点
        this.clickRoomListTrace(e);
    },
    hiddenRoomLayer: function (e) {
        this.setData({ 'roomLayer.isShown': false });
    },
    // 用户行为埋点, key: 209477-展开价格明细浮层； 209476-展开子房型
    roomClickTrace (key, roomId) {
        const { hotelBaseInfo, dateInfo } = this.data;
        const { cityId = 2, starLevel } = hotelBaseInfo;
        detailtrace.roomClickTrace(this, {
            key,
            pageId: this.pageId,
            hotelId: this.data.hotelId,
            roomId,
            cityId,
            starLevel,
            checkin: dateInfo.inDay,
            checkout: dateInfo.outDay
        });
    },

    starPriceDetailInfo (e) {
        const { subRoomMap, dateInfo, nearbyHotels } = this.data;
        const { hid: hotelId, type } = e.currentTarget.dataset;
        const { isLongRent = false } = dateInfo;

        this.clickPriceInfoTrace();

        // 房型
        if (type === 'hotelRoom') {
            const { skey } = e.currentTarget.dataset;
            if (!skey) return;
            const status = subRoomMap[skey]?.status;
            const priceDetail = getPriceDetail(subRoomMap[skey]);
            this.setData({
                showPriceDetail: true,
                priceDetail,
                priceLayerSubtitle: priceDetail.isHourRoom ? '' : `${dateInfo.inDayText}-${dateInfo.outDayText} ${dateInfo.days}晚`,
                priceDetailSkey: skey,
                confirmBtnText: status !== BOOKABLE_ROOM_STATUS ? '关闭' : '去预订',
                priceDetailConfirmFuc: status !== BOOKABLE_ROOM_STATUS ? CLOSE_PRICE_DETAIL : TO_BOOKING_FUNC
            });
            this.roomClickTrace(209477, subRoomMap[skey].id);
            return;
        }

        // 附近酒店列表
        dateInfo.shortInDay = dateInfo.inDay;
        dateInfo.shortOutDay = dateInfo.outDay;
        const hotelInfo = nearbyHotels.filter(item => item.hotelId === hotelId)?.[0];
        if (hotelInfo) {
            const priceDetail = commonfunc.priceDetailNew(hotelInfo, isLongRent);
            this.setData({
                showPriceDetail: true,
                priceDetail,
                priceLayerSubtitle: priceDetail.isHourRoom ? '' : `${dateInfo.inDayText}-${dateInfo.outDayText} ${dateInfo.days}晚`,
                confirmBtnText: '关闭',
                priceDetailConfirmFuc: CLOSE_PRICE_DETAIL
            });
        }

        function getPriceDetail (roomInfo = {}) {
            const totalPriceInfo = isLongRent && roomInfo.totalPriceInfo; // 长租房场景
            const { price = 0, priceFloatInfo = {}, priceCalcItems } = totalPriceInfo || roomInfo;
            return {
                name: roomInfo.name,
                roomNo: roomInfo.roomNo,
                isHourRoom: roomInfo.isHourRoom,
                price,
                priceFloatInfo,
                priceCalcItems
            };
        }
    },

    scrollPriceDetail () {
        this.setData({
            priceId: 'price-detail'
        });
    },
    closePriceDetail (e) {
        this.setData({ showPriceDetail: false });
    },
    shareGoList (e) {
        try {
            this.ubtTrace('139155', {});
        } catch (err) {
            // do nth
        }
        this.handleCustomBack();
    },

    layerToBooking () {
        const { priceDetailSkey: roomId } = this.data;
        this.toBooking({
            currentTarget: {
                dataset: {
                    skey: roomId
                }
            }
        });
    },

    toBooking: util.throttle(async function (e) {
        const { skey, key } = e.currentTarget.dataset;
        if (!skey) return;
        const self = this;
        const { timeZoneDate, skipForceLogin } = this.pageStatus;

        const { isBaidu } = this.data;

        // 验凌晨单
        const { selectMorning } = this.data.dateInfo;
        if (selectMorning) {
            const isMorning = dateUtil.checkIsMorning(timeZoneDate);
            if (!isMorning) {
                this.showCalenderTips();
                return;
            }
        }

        if (!(isBaidu && skipForceLogin)) {
            // 验登录态有效
            const hasLogin = await huser.checkLoginStatus(true);
            if (!hasLogin) {
                cwx.user.login({
                    callback: function (data = {}) {
                        if (data.ReturnCode === '0') {
                            self.jumpBooking(skey, {
                                baseroomKey: key,
                                cancelReceiveCoupons: false,
                                skipPriceTrace: true
                            });
                        }
                    }
                });
                return;
            }
        }

        this.jumpBooking(skey, { baseroomKey: key });
    }, 400),
    receiveCouponsBeforeBooking (skey) {
        const subRoom = this.data.subRoomMap[skey] || {};
        // todo 领券订全量后，strategyId可删除
        const { strategyIds = [], strategyId } = subRoom.receivableCouponInfo || {};
        if (!strategyId && !strategyIds.length) return;

        const params = {
            coupons: strategyIds.length
                ? strategyIds.map(it => ({
                    promotionId: +it
                }))
                : [{
                    promotionId: strategyId
                }],
            hotelId: this.data.hotelId
        };
        const pageS = this.pageStatus;
        // 领券订回退需刷券刷房型
        pageS.needRefreshRoomList = true;

        return new Promise((resolve, reject) => {
            commonrest.receiveMutilCoupon(params, res => {
                if (res && res.success === 1) {
                    resolve('0');
                } else {
                    if (res && res.resultCode === 53 && res.macaoNeedAuthMsg) {
                        // 实名认证失败，出实名认证弹窗
                        this.onShowRealNamePop({ msg: res.macaoNeedAuthMsg, skey });
                        resolve('2');
                    } else {
                        resolve('1');
                    }
                }
            }, () => {
                resolve('1');
            });
        });
    },
    async jumpBooking (skey, extraVal = {}) {
        const self = this;
        const { requestId = '', starPlanetId } = self.pageStatus;
        const { biz } = self.data;
        const sourceId = cwx.scene;
        const bookingRoom = this.data.subRoomMap[skey];
        if (!bookingRoom || bookingRoom.status !== BOOKABLE_ROOM_STATUS) return;
        const { cancelReceiveCoupons = false, skipPriceTrace, baseroomKey } = extraVal;
        const baseRoom = this.data.baseRoomMap[baseroomKey];
        // 领券订
        let receiveCouponFailed;
        if (!cancelReceiveCoupons) { // true = 不领券直接订
            receiveCouponFailed = await this.receiveCouponsBeforeBooking(skey);
            if (receiveCouponFailed === '2') {
                // 需要实名认证
                return;
            }
        }

        // 填写头部信息
        this.gatherBookingHeadInfo(bookingRoom, baseRoom);
        // 预加载可订
        this.preLoadReservation(bookingRoom, skipPriceTrace);
        // 跳转之前关闭房型浮层，防止未登录=>登录时，浮层上价格数据未更新
        this.hiddenRoomLayer();

        const {
            id: roomId,
            roomNo = '',
            shadowId,
            paymentInfo,
            rateId,
            rateAdult,
            checkAVId = 0,
            ratePlanId = '',
            passToOrderInput,
            isPriceWithDecimal
        } = bookingRoom;

        let url = '../booking/index?';
        const { dateInfo, hotelId } = this.data;
        const urlParams = {
            hotelid: hotelId,
            roomid: roomId,
            shadowid: shadowId,
            indate: dateInfo.inDay,
            outdate: dateInfo.outDay,
            paytype: paymentInfo.type,
            subpaytype: paymentInfo.subType,
            rateid: rateId,
            rateadult: rateAdult,
            checkavid: checkAVId,
            rateplanid: ratePlanId,
            receiveCouponFailed,
            cancelReceiveCoupons: cancelReceiveCoupons ? '1' : '0',
            passfromdetail: passToOrderInput,
            starplanetid: starPlanetId
        };

        url += urlUtil.paramString(urlParams);
        isPriceWithDecimal !== undefined && (url += `&price_decimal=${isPriceWithDecimal ? '1' : '0'}`);
        cwx.navigateTo({
            url,
            events: {
                bookBackToDetail: function (data) {
                    detailtrace.bookBackToDetailTrace(self, {
                        ordmasterhotelid: data.ordmasterhotelid,
                        ordroomid: data.ordroomid,
                        subtab: data.subtab,
                        sourceid: sourceId
                    });
                }
            }
        });
        // 房型列表预订按钮点击埋点
        const { allianceid } = cwx.mkt.getUnion();
        detailtrace.bookingBtnClick(this, {
            masterhotelid: hotelId,
            roomid: roomId,
            room_token: roomNo,
            allianceid,
            sourceid: sourceId,
            rmlist_tracelogid: requestId,
            subtab: biz !== 1 ? 'oversea' : 'inland'
        });
    },
    getPriceTraceInfo (room) {
        const { dateInfo, hotelId, hotelBaseInfo, biz, isLoggedin } = this.data;
        const { inDay, outDay } = dateInfo;
        const { trackId } = this.pageStatus;
        const traceInfo = room.traceInfo || {};
        return {
            status: room.status,
            id: room.id,
            originPrice: room.originPrice,
            shadowId: room.shadowId,
            taxAmount: room.priceFloatInfo?.taxFee?.priceSum?.price || 0,
            quickCheckin: room.quickCheckInDesc ? 1 : 0, // 是否存在闪住标签
            ismemberlogin: isLoggedin, // 是否登录
            trackId,
            ticketTotal: traceInfo.cashbackAmount || 0,
            isCouponTicket: 0, // 优惠券返，无法判别，先给定默认值
            isOversea: biz !== 1,
            totalPriceAfterDiscountIncludeTax: traceInfo.totalPriceAfterDiscountIncludeTax,
            exchange: room.exchange || 1, // 汇率， todo: 未下发，先给定默认值1
            baseInfo: {
                id: hotelId,
                groupId: hotelBaseInfo.mgrGroupId
            },
            inDay,
            outDay
        };
    },
    constructPolicyTraceInfo (room) {
        const { cancelPolicyInfo, breakfast, bed, paymentInfo, priceFloatInfo = {}, price, priceCalcItems = [] } = room;
        const { isGuarantee, type } = paymentInfo || {};
        return {
            cancelPolicy: cancelPolicyInfo?.cardTitle || '',
            meal: breakfast,
            bedType: bed,
            payType: isGuarantee ? 2 : type, // 0: 在线付  1: 到店付  2: 需担保
            totalDiscount: priceFloatInfo.price - price,
            discountList: priceCalcItems.map(item => ({ amount: item.amount, title: item.title }))
        };
    },
    // 填写页可订请求回来之前，头部信息可使用详情页信息
    gatherBookingHeadInfo (bookingRoom = {}, baseRoom) {
        const ps = this.pageStatus;
        ps.preLoadHeadInfo = {};
        const { dateInfo } = this.data;
        const { cancelPolicyInfo, confirmInfo } = bookingRoom;
        ps.preLoadHeadInfo = {
            dateInfo: util.clone(dateInfo),
            subRoomInfo: util.clone(bookingRoom),
            cancelPolicy: util.clone(cancelPolicyInfo),
            baseRoomInfo: baseRoom
        };
        if (confirmInfo) {
            ps.preLoadHeadInfo.confirmPolicy = {
                style: confirmInfo.adType,
                policy: confirmInfo.title
            };
        }
    },
    preLoadReservation (bookingRoom, skipPriceTrace) {
        const { dateInfo, hotelId } = this.data;
        const {
            id: roomId,
            shadowId,
            paymentInfo,
            rateId,
            rateAdult,
            checkAVId = 0,
            ratePlanId = '',
            trackInfo = '',
            isPriceWithDecimal
        } = bookingRoom;
        const passFromDetail = bookingRoom.passToOrderInput || '';
        const policyTraceData = this.constructPolicyTraceInfo(bookingRoom); // 取消政策埋点
        const detailTracePrice = skipPriceTrace ? null : this.getPriceTraceInfo(bookingRoom); // 价格一致率埋点
        const { starPlanetId, shareFrom, isNewVersion, user, detailABTestResults } = this.pageStatus;

        const params = {
            disableQuickCheckin: !!storageUtil.getStorage(KEY_REJECT_QUICKCHECKIN),
            userSelectQuickCheckin: false,
            userArrivalTime: '',
            lastPage: 1,
            sessionData: '',
            checkIn: dateInfo.inDay,
            checkOut: dateInfo.outDay,
            hotelId: +hotelId,
            roomId,
            shadowId,
            roomQuantity: 1,
            adult: 1,
            children: 0,
            ages: 0,
            payType: paymentInfo.type,
            subPayType: paymentInfo.subType,
            disableCoupon: false,
            userSelectPromotionId: '',
            userSelectCouponCode: '',
            userSelectCoupons: [],
            rateId,
            rateAdult,
            checkAVId,
            ratePlanId,
            rmsToken: cwx.clientID,
            starPlanetId,
            passFromDetail,
            ABTest: detailABTestResults
        };
        // 币种精度
        isPriceWithDecimal !== undefined && (params.isPriceWithDecimal = isPriceWithDecimal);
        const constantDetailInfo = { // 不受可订检查成功/失败影响的变量
            roomId,
            policyTraceData,
            detailTracePrice,
            trackInfo, // 记CK需要的一致率数据
            shareFrom,
            user, // 加密的主态uid
            isNewVersion
        };
        const defaultCountryStorage = storageUtil.getStorage(constConf.KEY_DEFAULT_NAME) || {};
        if (defaultCountryStorage && defaultCountryStorage.country) {
            const reqCountryCode = this.countryParamsToReservation(defaultCountryStorage, bookingRoom) || [];
            reqCountryCode.length && (params.passengerInfoList = reqCountryCode);
        }
        this.pageStatus.bookingLoadInfo = {}; // 请求前确保不存在历史脏数据
        bookingReqUtil.reservationCheck(params, res => {
            this.pageStatus.bookingLoadInfo = {
                bookingInfo: res,
                isCompeleted: true,
                ...constantDetailInfo
            };
        }, () => {
            this.pageStatus.bookingLoadInfo = {
                bookingInfo: null,
                isCompeleted: true,
                ...constantDetailInfo
            };
        });
    },

    // 调用证件签发国家/地区组件请求可订，传参时需根据房间数 * 每间房可住人数，拆分成多个，预加载可订请求房间数roomQuantity按1处理
    countryParamsToReservation (defaultCountryStorage, bookingRoom) {
        const maxNum = bookingRoom?.maxNum || 1;
        const countryParams = {
            clientCountryCode: defaultCountryStorage.country
        };
        const result = commonfunc.arrayFill(maxNum, countryParams);
        return result;
    },

    /**
     * 凌晨时间过期提示
     */
    showCalenderTips () {
        cwx.showModal({
            title: '日期已过期,请重新选择入离日期',
            confirmText: '知道了',
            showCancel: false,
            success: res => {
                if (res.confirm) {
                    this.showCalender();
                }
            }
        });
    },

    /**
     * 入离日期
     */
    getDateInfo ({ inDay, outDay, serverTime, timeZone = 0, ignoreMorning = false }) {
        if (serverTime) {
            this.pageStatus.timeZoneDate = new dateUtil.TimeZoneDate(new Date(serverTime), new Date(), timeZone);
        }
        const dateInfo = this.data.dateInfo;
        !inDay && (inDay = dateInfo.inDay);
        !outDay && (outDay = dateInfo.outDay);
        !this.pageStatus.timeZoneDate && (this.pageStatus.timeZoneDate = new dateUtil.TimeZoneDate());
        const { timeZoneDate, isHourroomDate } = this.pageStatus;
        const isMorning = dateUtil.checkIsMorning(timeZoneDate);
        const selectMorning = isMorning && (inDay === timeZoneDate.yesterday());
        const inDayArr = commonfunc.getDateDisp(inDay, timeZoneDate, selectMorning) || [];
        const outDayArr = commonfunc.getDateDisp(isHourroomDate ? inDay : outDay, timeZoneDate, selectMorning) || [];
        const days = isHourroomDate ? 0 : dateUtil.calDays(inDay, outDay);

        // yyyy-MM-dd，将x月x日中的数字拆出来。例如：07月27日，其中07和27需要拆出
        // 凌晨单的入住展示内容 使用今天的日期 - x月x日 今天凌晨
        const indayNumArr = selectMorning ? timeZoneDate.today().split('-') : inDay.split('-');
        const outdayNumArr = isHourroomDate ? inDay.split('-') : outDay.split('-');

        !ignoreMorning && this.checkMorningExpired(isMorning);

        return {
            inDay,
            inDayText: !isHourroomDate && selectMorning ? inDayArr[2] : inDayArr[0], // x月x日
            inDayDesc: inDayArr[1], // 今天
            inDayNumber: { // 日历栏的展示
                month: indayNumArr[1],
                day: indayNumArr[2]
            },
            outDayNumber: { // 日历栏的展示
                month: outdayNumArr[1],
                day: outdayNumArr[2]
            },
            outDay,
            outDayText: outDayArr[0],
            outDayDesc: outDayArr[1],
            days,
            selectMorning,
            isMorning,
            showMorningOutTips: isMorning && outDay === timeZoneDate.today(),
            isLongRent: days > constConf.longRentLimitDay
        };
    },

    checkMorningExpired (isMorning) {
        const ps = this.pageStatus;
        if (ps.fromMorning && !isMorning) {
            ps.fromMorning = false;
            this.showCalenderTips();
        }
    },
    showCalender (e) {
        const { calendarJumping, timeZoneDate } = this.pageStatus;
        if (e && calendarJumping) return;
        this.pageStatus.calendarJumping = true;

        if (!timeZoneDate) return;

        const dateInfo = this.data.dateInfo;
        const params = {
            inDay: dateUtil.formatTime('yyyy-M-d', dateUtil.parse(dateInfo.inDay)),
            outDay: dateUtil.formatTime('yyyy-M-d', dateUtil.parse(dateInfo.outDay)),
            endDate: dateUtil.addDay(dateUtil.today(), 365),
            timeZoneDate,
            title: '选择日期',
            isMorning: dateInfo.isMorning,
            maxStayDays: 180
        };
        if (this.calendarPlugin === 'calendar') {
            params.allowHourroomDate = this.data.biz === 1;
            this.pageStatus.isHourroomDate && (params.outDay = params.inDay);
        }

        components[this.calendarPlugin](params, this.updateDate.bind(this));

        this.clickCalenderTrace();
    },
    /**
     * 当前日期不可订时，推荐日期组件回调，用于更新入离日期
     * @param e - 组件回调带入的event
     */
    replaceCurrentDate (e) {
        const { checkIn, checkOut } = e.detail;
        this.updateDate({
            inDay: checkIn,
            outDay: checkOut,
            isHourroomDate: false
        });
    },
    /**
     * 只要用户有修改日期的行为,与入离日期相关的接口就要重刷，不判断日期是不是跟之前一样
     */
    updateDate ({ inDay, outDay, isHourroomDate }) {
        const pageS = this.pageStatus;
        pageS.isHourroomDate = isHourroomDate;
        const dateInfo = this.getDateInfo({ inDay, outDay });

        // dateInfo不放入roomListSuccess，意为先让用户看到date变化
        this.setData({
            isRoomLoading: true,
            noRoomRes: false,
            dateInfo
        });
        this.reqRoomList();
        // 切换日期时，更新订房必读信息
        this.reqDetailInfo();
        this.setDateStorage(dateInfo.inDay, dateInfo.outDay);
    },

    /**
     * 缓存入离日期，缓存的时机为：1-url上拼接了入离日期  2-日历更改了入离日期
     * @param inDay
     * @param outDay
     */
    setDateStorage (inDay, outDay) {
        if (!inDay || !outDay) return;
        storageUtil.setStorage(constConf.STORAGE_USER_SELECT_DATE, {
            inDay,
            outDay
        }, 24);
        datetrace.storageDateTrace({ inDay, outDay });
    },

    setPageIdCom (biz = 1) {
        const pageId = biz === 1 ? '10320654891' : '10650002401';

        if (pageId !== this.pageId) {
            util.exUbtSendPV(this, {
                pageId
            });
        }
    },

    /**
     * 酒店静态信息hotelBaseInfo
     */
    reqHotelDetail () {
        const { inDay: checkinDate, outDay: checkoutDate } = this.data.dateInfo;
        const params = {
            hotelId: this.data.hotelId,
            checkinDate,
            checkoutDate
        };
        reqUtil.hotelDetail(params, this.detailLoadSuccess, this.detailLoadErr);
    },
    detailLoadSuccess (res = {}) {
        const dataToSet = {
            collection: this.getCollectionInfo(res.isFavoriteHotel),
            showAskHotel: res.isShowIMEntrance || false,
            isPrimeHotel: res.needShowPrimeIcon
        };

        this.setData(dataToSet);
        this.getBaseInfoStatus(res);

        this.memberRights();

        // 一致率埋点
        this.tracePrice();

        setTimeout(() => {
            this.setSEOdata(res);
        }, 0);
    },
    detailLoadErr () {

    },
    reqHotelInfo () {
        const { hotelId, dateInfo: { inDay, outDay } } = this.data;
        const { poiValue = '', rankid: rankId = '' } = this.options;
        const query = reqUtil.getHeadInfoQuery(hotelId, inDay, outDay, poiValue, rankId);
        commonrest.graphQLExecute(query, 'hotel_detail_head', this.graphQLSuccess);
    },
    graphQLSuccess (data) {
        const { isQuickApp, hotelId, isHourroomModule } = this.data;
        const headInfo = this.getHeadInfo(data);
        const hotelInfo = this.getHotelBaseInfo(data);
        const biz = +this.options.biz || (hotelInfo.isOversea ? 2 : 1);
        this.setData({
            biz,
            headInfo,
            hotelBaseInfo: hotelInfo
        }, () => {
            isQuickApp && wx.setNavigationBarTitle({
                title: headInfo.displayHotelName || '酒店详情'
            });
            this.getPromotionBannerInfo(); // 优惠信息传参依赖biz
        });
        // 屏蔽携程城市酒店
        hotelInfo.cityId === 22249 && cwx.reLaunch({
            url: '/pages/hotel/inquire/index'
        });
        this.setPageIdCom(biz);
        browsedHoteldata.addBrowsedHotel(+hotelId, biz, hotelInfo.cityId);

        this.pageStatus.reqGraphQLEnd = true;
        !isHourroomModule && this.reqNearbyHotels();
    },
    getHotelBaseInfo (data) {
        const htlInfo = data?.hotel;
        if (!htlInfo || !htlInfo.getBaseInfo) return {};
        const {
            isOversea,
            cityId,
            cityName,
            starInfo,
            coordinate
        } = htlInfo.getBaseInfo;
        return {
            isOversea,
            cityId,
            cityName,
            starLevel: starInfo?.star,
            coordinate: {
                cityId,
                latitude: Number(coordinate.latitude),
                longitude: Number(coordinate.longitude)
            }
        };
    },
    getHeadInfo (headData) {
        const htlInfo = headData?.hotel;
        const { detailPositionDesc = '' } = this.options;

        if (!htlInfo || !htlInfo?.getBaseInfo || !htlInfo?.getDetailTag) return {};
        const {
            hotelName,
            hotelEnName,
            address,
            zoneName,
            openYear,
            fitmentYear,
            commentScore = 0,
            commentDesc,
            commentCount = 0,
            bestCommentSentence,
            fuzzyAddressTip,
            isOversea,
            starInfo,
            hotelCategoryOutlineImages,
            totalPictureCount
        } = htlInfo.getBaseInfo;
        const topAwardInfo = htlInfo.getBaseInfo.topAwardInfo || {};

        const {
            starTag,
            dStarTag,
            medalTag,
            primeTag,
            facilityTags,
            categoryTag
        } = htlInfo.getDetailTag;

        // 展示酒店名字
        const displayHotelName = !isOversea ? hotelName : (hotelName ? `${hotelName}(${hotelEnName})` : hotelEnName);

        // 展示开业/装修时间
        let displayHotelTime = null;
        if (fitmentYear) {
            displayHotelTime = `${fitmentYear}年装修`;
        } else if (openYear) {
            displayHotelTime = `${openYear}年开业`;
        }

        const { awardIconUrl, listSubTitle, annualListAwardIconUrl, annualListTagUrl } = topAwardInfo;
        // 勋章发送曝光埋点
        if (awardIconUrl) {
            topAwardInfo.medalExposeObj = {
                data: {
                    page: this.pageId,
                    labelid: topAwardInfo.lableId,
                    rankingid: topAwardInfo.rankId
                },
                ubtKeyName: '224743'
            };
        };

        // 榜单标签发送曝光埋点
        if (listSubTitle) {
            topAwardInfo.labelExposeObj = {
                data: {
                    page: this.pageId,
                    labelid: topAwardInfo.lableId,
                    rankingid: topAwardInfo.rankId,
                    listTagContent: topAwardInfo.listSubTitle
                },
                ubtKeyName: '224737'
            };
        };

        // 判断是否年榜
        topAwardInfo.isAnnualList = !!(annualListAwardIconUrl || annualListTagUrl);
        // 酒店头部信息模块发送曝光埋点
        const headInfoExposeObj = {
            data: {
                triggerTime: new Date().getTime(),
                page: this.pageId
            },
            ubtKeyName: exposeTraceKey.HOTEL_DETAIL_HEAD_INFO_KEY
        };
        return {
            displayHotelName,
            address,
            zoneName,
            displayHotelTime,
            commentScore: commentScore?.toFixed(1),
            commentDesc,
            commentCount,
            bestCommentSentence: bestCommentSentence || '期待您入住后留下宝贵的点评',
            fuzzyAddressTip,
            detailPositionDesc,
            trafficeDesc: htlInfo.getTrafficDetail?.defaultTrafficText,
            topAwardInfo,
            starTag,
            dStarTag,
            medalTag,
            primeTag,
            facilityTags,
            categoryTag,
            totalPictureCount,
            ...this.getHeadPictureInfo(hotelCategoryOutlineImages, starInfo?.star),
            headInfoExposeObj
        };
    },
    reqDetailInfo () {
        const { hotelId, dateInfo: { inDay, outDay } } = this.data;
        const query = reqUtil.getDetailQuery(hotelId, inDay, outDay);
        commonrest.graphQLExecute(query, 'hotel_detail_addition', (data = {}) => {
            if (data.hotel) {
                const { getComment, getReservation, getPolicy, getMyCommentDetails } = data.hotel;

                // 政策发送曝光埋点
                const policyExposeObj = {
                    data: {
                        triggerTime: new Date().getTime(),
                        page: this.pageId
                    },
                    ubtKeyName: exposeTraceKey.HOTEL_DETAIL_POLICY_KEY
                };
                // 订房必读发送曝光埋点
                const noticeExposeObj = {
                    data: {
                        triggerTime: new Date().getTime(),
                        page: this.pageId
                    },
                    ubtKeyName: exposeTraceKey.HOTEL_DETAIL_NOTICE_KEY
                };
                const newPolicyData = {
                    gqlNoticeList: this.getNoticeTips(getReservation),
                    gqlPolicyList: getPolicy?.topPolicies || [],
                    policyExposeObj,
                    noticeExposeObj
                };

                this.setData({
                    gqlComment: this.getCommentInfo(getComment),
                    ...newPolicyData,
                    gqlWaitComment: this.getWaitCommentInfo(getMyCommentDetails) || {}
                });
            }
        });
    },
    getCommentInfo (commentInfo) {
        if (!commentInfo) return;
        const { hotelId } = this.data;
        // 兼容服务下发数据为null的场景
        const commentRating = commentInfo.commentRating || {};
        const commentTags = commentInfo.commentTags || [];
        const similarCommentRating = commentInfo.similarCommentRating || {};
        let comment = commentInfo.comment || {}; // 兼容comment为null的场景
        const { enableGuestComment } = this.data;
        const { ratingRoom, ratingLocation, ratingService, ratingFacility, ratingAll } = commentRating;
        // 修正全部点评和相似点评分数的小数点位数
        commentRating.ratingAll = ratingAll?.toFixed(1);
        similarCommentRating.ratingAll = similarCommentRating.ratingAll?.toFixed(1);
        const { language = '', translatedContent = '', content = '', imageCuttingsList = [], videoList = [] } = comment;
        const userInfo = comment.userInfo || {};
        const levelInfo = userInfo.levelInfo || {};
        const grade = userInfo.grade || {};
        // 点评内容
        comment.displayContent = (language === 'CN' || !translatedContent) ? content : translatedContent;
        comment.hotelId = hotelId;
        // 点评分数处理函数
        let rateArr = [];
        const fillRating = (title, score) => {
            if (!title || !score) return;
            const fullScore = 5;
            rateArr.push({
                title,
                score: score.toFixed(1),
                progress: `${Math.min(Math.ceil((score / fullScore) * 100), 100)}%`,
                isFullScore: score >= fullScore
            });
        };
        // 如果新版点评开关打开走新逻辑，否则老逻辑
        if (enableGuestComment) {
            // 点评细项及分数处理
            fillRating('卫生', ratingRoom);
            fillRating('环境', ratingLocation);
            fillRating('服务', ratingService);
            fillRating('设施', ratingFacility);
            // 点评内容处理,点评内容一行大概为33字数
            const commentLineList = {
                ONE_LINE: 33
            };
            // 计算点评内容行数
            const commentLines = Math.ceil(comment.displayContent?.length / commentLineList.ONE_LINE);
            comment = {
                ...comment,
                hasMoreComment: commentLines > 2, // 点评内容是否大于2行
                hasHugeComment: commentLines > 10, // 点评内容行数是否大于10行
                userInfo: {
                    ...userInfo,
                    userLevel: levelInfo?.curLevelIcon,
                    userGrade: grade?.title
                },
                mediaInfo: this.constructMediaList(imageCuttingsList, videoList)
            };
            comment.hasMediaComment = Boolean(comment.mediaInfo);
        } else {
            ratingRoom && rateArr.push(`卫生${ratingRoom}`);
            ratingLocation && rateArr.push(`环境${ratingLocation}`);
            ratingService && rateArr.push(`服务${ratingService}`);
            ratingFacility && rateArr.push(`设施${ratingFacility}`);
            rateArr = rateArr.join(' ');
        }

        // 住客评价发送曝光埋点
        const commentExposeObj = {
            data: {
                triggerTime: new Date().getTime(),
                page: this.pageId,
                masterhotelid: hotelId,
                commentId: comment.id
            },
            ubtKeyName: exposeTraceKey.HOTEL_DETAIL_LIVE_COMMENT_KEY
        };
        return {
            commentRating,
            commentTags,
            comment,
            rateDesc: rateArr,
            enable: !!content,
            commentExposeObj,
            similarCommentRating,
            hasSimComment: similarCommentRating.ratingAll >= 0
        };
    },
    // 重构图片和视频列表
    constructMediaList (imgList = [], videoList = []) {
        // 计算图片数量
        const imgListLen = imgList.length || 0;
        // 计算视频数量
        const videoListLen = videoList.length || 0;
        // 图片和视频总数量
        const sumLen = imgListLen + videoListLen;
        // 图视频数大于等于3才会展示，否则return
        if ((!imgListLen && !videoListLen) || sumLen < 3) return;
        // 外露展示数量，最多外露展示4张图和视频数，优先展示视频
        const maxDisplayVideoCount = Math.min(4, videoListLen);
        const maxDisplayImgCount = Math.min(4 - maxDisplayVideoCount, imgListLen);
        // 外露展示的图片和视频数量
        const maxDisplayMediaCount = maxDisplayVideoCount + maxDisplayImgCount;
        // 全部视频列表
        const allVideoList = videoList.map(item => ({
            url: item?.url,
            type: 'video',
            poster: item?.cover
        }));
        // 全部图片列表，图片放大预览模式采用大图
        const allImgList = imgList.map(item => ({
            url: item?.bigImageUrl,
            type: 'image'
        }));
        // 全部图片和视频列表
        const allMediaList = allVideoList.concat(allImgList);
        // 外露展示的视频列表
        const displayVideoList = allVideoList.slice(0, maxDisplayVideoCount);
        // 外露展示的图片列表
        const displayImgList = imgList.slice(0, maxDisplayImgCount).map((img) => {
            const isCountThree = (maxDisplayVideoCount + maxDisplayImgCount) === 3;
            // 若3张图不展示数量，尺寸为中图，若为4张图不展示数量，尺寸为小图，若大于4张图展示数量，尺寸为小图。
            const url = isCountThree ? img?.mediumImageUrl : img?.smallImageUrl;
            return {
                url,
                type: 'image'
            };
        });
        // 外露的图片和视频列表
        const displayMediaList = displayVideoList.concat(displayImgList);
        return {
            allMediaList,
            displayMediaList,
            displayVideoList,
            displayImgList,
            allMediaCount: sumLen - maxDisplayMediaCount ? `+${sumLen - maxDisplayMediaCount}` : '' // 图片和视频数量
        };
    },
    getWaitCommentInfo (waitCommentInfo) {
        const { enableGuestComment, headInfo, biz, hotelId } = this.data;
        if (!waitCommentInfo || !enableGuestComment) return {};
        const waitCommentList = waitCommentInfo.waitCommentList || [];
        const result = waitCommentList.map(item => ({
            encourageInfo: item?.encourageInfo,
            orderId: item?.orderId,
            showWaitComment: Boolean(waitCommentList.length),
            hotelInfo: {
                displayHotelName: headInfo?.displayHotelName,
                hotelId,
                biz
            },
            waitCommentExposeObj: {
                data: {
                    triggerTime: new Date().getTime(),
                    page: this.pageId,
                    orderid: item?.orderId,
                    masterhotelid: hotelId
                },
                ubtKeyName: exposeTraceKey.HOTEL_DETAIL_WAIT_COMMENT_KEY
            }
        }));
        // 目前待点评模块仅展示一个
        return result[0];
    },
    getNoticeTips (reservation) {
        if (!reservation?.topNoticeTips?.length) return {};
        const content = _.flatten(reservation.topNoticeTips.map(notice => notice.contents)) || [];
        const noticeItem = reservation?.topNoticeTips[0]; // 标题和类型只取数组第一项
        const res = {
            title: noticeItem.title || '订房必读',
            category: noticeItem.category || -1,
            content
        };
        return res;
    },

    /**
     *
     * @param pics 服务下发的图片种类
     * @param star {Number} 酒店星级
     * @returns {Object} |{
     *      headPicTypes: [{
     *          categoryName, 图片种类名,例如:封面 外观
     *          picIndex      不同种类对应的图片索引值,后续用于点击跳转至对应的图片
     *      }],
     *      headPictures: []  所有酒店图片
     * }
     */
    getHeadPictureInfo (pics, star) {
        if (!pics?.length) return {};
        // 固定宽度
        const fixedWidth = 750;
        // 固定宽高比,四星级以上,宽高比为3:2,四星级以下宽高比为2:1
        const height = star >= this.data.highStarLimit ? 500 : 375;

        const allPictures = [];
        const picTypes = []; // 图片种类：名称&种类对应图片索引
        pics.forEach(item => {
            const { categoryName, pictureList } = item;
            const singleTypePics = pictureList?.reduce((a, b) => {
                const picUrl = commonfunc.getDynamicImageUrl({
                    urlBody: b.urlBody,
                    urlExtend: b.urlExtend,
                    type: constConf.PICTURE_CUT_TYPE.C,
                    width: fixedWidth,
                    height
                });
                return a.concat(picUrl);
            }, []) || [];
            pictureList && allPictures.push(...singleTypePics);
            picTypes.push({
                categoryName,
                picIndex: allPictures.length - 1
            });
        });
        return {
            headPictures: allPictures,
            headPicTypes: picTypes
        };
    },
    /**
     * 判断走h5相册页
     * h5相册页中tab：0-相册 1-达人晒图
     * url schema http://conf.ctripcorp.com/pages/viewpage.action?pageId=1526343236
     */
    toPhotoList (e) {
        const { type = 0 } = e?.currentTarget?.dataset || {};
        const { hotelId } = this.data;
        const url = `https://${h5Host}/webapp/hotel/album?hotelid=${hotelId}&tab=${type}&hiddenback=1`;
        cwx.component.cwebview({
            data: {
                hideShareMenu: true,
                url: encodeURIComponent(url)
            }
        });
        type === '1' && detailtrace.blogArticleClick(this, {
            page: this.pageId,
            masterhotelid: this.options.id,
            areaType: 2
        });
    },
    lastToPhotoList (e) {
        this.pageStatus.headPictureLastestIndex = e.detail.current;
        this.pageStatus.enableToPhotoList = false;
        !this.data.showAllHeadPic && this.setData({ showAllHeadPic: true });
    },
    headPicAnimation (e) {
        this.pageStatus.headPictureDx = e.detail.dx;
    },
    headPicTouchend (e) {
        const ps = this.pageStatus;
        const lastestIndex = ps.headPictureLastestIndex;
        const lastPicIndex = this.data.headInfo.headPictures.length - 1;
        // 滑动到最后一张时跳转到图片列表
        if (ps.enableToPhotoList && lastestIndex === lastPicIndex && ps.headPictureDx > 30) {
            this.toPhotoList();
        } else {
            ps.enableToPhotoList = true;
        }
    },

    /**
     * custom back
     */
    handleCustomBack (e) {
        const tData = this.data;
        if (tData.isLandingPage) {
            this.goToList();
        } else {
            cwx.navigateBack({
                fail: () => {
                    this.goToList();
                }
            });
        }

        detailtrace.navBackClick(this, {
            hotelid: this.data.hotelId,
            isoversea: tData.biz === 1 ? 'inland' : 'oversea',
            btnType: tData.isShareToMore ? 0 : 1
        });
    },
    goToList: function () {
        const { cityId = 2, isHourroomDate, sourceFromTag } = this.pageStatus;
        const { inDay, outDay } = this.data.dateInfo;
        const { biz } = this.data;
        let url = `../list/index?cityid=${cityId}`;
        if (inDay && outDay) {
            url += `&inday=${inDay}&outday=${outDay}`;
        }
        // 钟点房
        isHourroomDate && (url += '&ishourroomdate=1');
        // 订单来源
        sourceFromTag && (url += `&source_from_tag=${sourceFromTag}`);

        if (this.data.isShareToMore) {
            const placeName = this.data.headInfo.zoneName;
            placeName && (url += `&keyword=${placeName}`);
        }
        url += `&biz=${biz}`;
        cwx.reLaunch({ url });
    },

    /**
     * collection
     */
    getCollectionInfo (collected) {
        return {
            collected,
            collectClass: collected ? 'wechat-font-collected' : 'wechat-font-collect',
            actionKey: collected ? 'xcx_jdxq_qxsc' : 'xcx_jdxq_scdj'
        };
    },
    changeCollect (e) {
        const tdata = this.data;
        if (!tdata.isLoggedin) {
            this.toLogin();
            return;
        }
        const collected = !tdata.collection.collected;
        const reqData = {
            operateType: collected ? 'add' : 'remove',
            hotelId: this.data.hotelId,
            cityId: tdata.hotelBaseInfo.cityId
        };

        reqUtil.operatorfavHotel(reqData, (data = {}) => {
            let text = '';
            if (data.result) {
                text = collected ? '收藏成功' : '已取消收藏';
                this.setData({
                    collection: this.getCollectionInfo(collected)
                });
            } else {
                text = collected ? '收藏失败' : '取消收藏失败';
            }

            cwx.showToast({
                title: text,
                icon: 'none',
                duration: 2000
            });
        });

        this.clickCollectTrace();
    },

    /**
     * share
     */
    showSharePlugin (e) {
        this.setData({
            share: {
                hidden: false,
                friendShareImg: `https://yunhai.ctrip.com/wechatimage/raffle?id=${this.data.hotelId}`
            }
        });
    },
    shareClose (e) {
        this.setData({ 'share.hidden': true });
    },
    onShareAppMessage (res) {
        const desc = '住得好一点，很有必要，携程让你的每一天都成为一种享受';
        const { dateInfo, hotelId, biz = 1, headInfo, subRoomMap, baseRoomMap, roomLayer } = this.data;
        const { timeZoneDate, taskShareId } = this.pageStatus;
        const tzone = timeZoneDate?.tzone || 0;
        const { explosivepresale, fromMgm, rankid: rankId } = this.options;

        // 成功分享埋点，区分携程与微信分享按钮
        this.ubtTrace('htlwechat_detail_forwards_click', {
            subtab: biz === 1 ? 'inland' : 'oversea',
            isctripshare: res.from === 'button' ? 'T' : 'F'
        });

        const toRoute = 'pages/hotel/detail/index?';
        let path = toRoute +
            'id=' + hotelId +
            '&inday=' + dateInfo.inDay +
            '&outday=' + dateInfo.outDay +
            '&biz=' + biz +
            '&tzone=' + tzone;

        cwx.clientID && (path += `&sf=${cwx.clientID}`);
        taskShareId && (path += '&shareid=' + taskShareId);
        fromMgm && (path += '&fromMgm=1');
        explosivepresale && (path += `&explosivepresale=${explosivepresale}`);
        rankId && (path += `&rankid=${rankId}`);

        const { id: shareId = '' } = res.target || {};
        const result = {
            bu: 'hotel',
            title: '携程酒店',
            desc,
            path,
            imageUrl: ''
        };
        const traceData = {
            id: hotelId,
            inday: dateInfo.inDay,
            outday: dateInfo.outDay,
            biz
        };

        if (shareId === 'roomshare' && roomLayer.isShown) {
            traceData.type = 'room';

            const subRoom = subRoomMap[roomLayer.skey];
            const room = baseRoomMap[roomLayer.key];
            const roomPhoto = room.pictureList?.[0];
            const roomName = subRoom.name;
            const roomNum = subRoom.id;
            result.title = '我发现' + headInfo.displayHotelName + '的' + roomName + '不错，快来看看吧';
            result.path += '&shareroomid=' + roomNum;
            roomPhoto && (result.imageUrl = roomPhoto);
        } else {
            result.title = headInfo.displayHotelName;
            if (headInfo.headPictures?.length) {
                result.imageUrl = headInfo.headPictures[0];
            }
        }

        this.ubtTrace('hotel_detail_share', traceData);

        return result;
    },
    /**
     * 获取星球号banner数据
     */
    reqPlanetBanner () {
        const { inDay: checkinDate, outDay: checkoutDate } = this.data.dateInfo;
        const params = {
            hotelId: String(this.data.hotelId),
            checkinDate,
            checkoutDate
        };
        const successCallback = (res = {}) => {
            const { logo = '', isLive = false, liveClickUrl = '', targetUrl = '', title = '', subTitle = '', tags = [] } = res;
            if (!targetUrl) {
                return;
            }
            let vendorText = '';
            const rightTagsArr = [];
            tags.forEach(item => {
                if (item.type === 2) {
                    vendorText = item.content;
                } else if (item.type === 3) {
                    rightTagsArr.push(item);
                }
            });
            const planetBannerExposeObj = {
                data: {
                    page: this.pageId
                },
                ubtKeyName: '227539'
            };
            const planetBanner = { logo, isLive, liveClickUrl, targetUrl, title, subTitle, vendorText, rightTagsArr, planetBannerExposeObj };
            this.setData({ planetBanner });
        };
        reqUtil.getPlanetBanner(params, successCallback);
    },

    /**
     * check是否领取了分享酒店换积分的任务
     */
    checkShareTask: function () {
        const shareStorage = storageUtil.getStorage('P_FUNSCORE_SHARE_HOTEL');
        const today = dateUtil.today();
        return !!(shareStorage && shareStorage.hasTask && (dateUtil.calDays(shareStorage.date, today) <= 1));
    },

    /* ----------------------------------------------------------
        优惠信息整合(券+砍价+助力券) start, 非微信屏蔽砍价
    ---------------------------------------------------------- */
    async getPromotionBannerInfo () {
        const hasLocalAuth = await this.getLocalAuth();
        const tasks = [this.reqCouponList(hasLocalAuth)];

        Promise.all(tasks).then((res = []) => {
            const [couponRes = {}] = res;
            const { couponsToLayer = [] } = this.getCouponsPromotion(couponRes || {});

            const couponsLayerInfo = [...couponsToLayer];

            this.setData({
                couponsToLayer: couponsLayerInfo
            });
            this.showCouponDialog(couponRes);
        });
    },
    // 分享场景出领取优惠券弹窗
    showCouponDialog (couponRes = {}) {
        const { hotelId } = this.data;
        const { coupons = [] } = couponRes;
        const { isNewVersion, needCouponLayer, user } = this.pageStatus;
        if (!isNewVersion || !coupons.length || !needCouponLayer) return;

        const storageIds = commonfunc.getStoragedIds(hotelId, APP_SHARE_COUPON_DIALOG, APP_SHARE_COUPON_DIALOG_EXPIRED_TIME);
        const hasPoped = storageIds.includes(hotelId);
        if (hasPoped) return;

        const coupon = coupons[0];
        this.setData({
            showCouponDialog: true,
            shareCoupnLayerInfo: coupon
        });
        detailtrace.showCoupnDialog(this, {
            user,
            pageId: this.pageId,
            content: coupon.promotionName
        });
    },
    closeCouponDialog () {
        this.setData({
            showCouponDialog: false
        });
    },

    /**
     *
     * @param needLocate: boolean, 是否需要定位
     * @returns {Promise} 查券后结果promise
     */
    async reqCouponList (needLocate) {
        const { hotelId, dateInfo, biz, isLandingPage, isAppShare, isWechatShare } = this.data;
        let { timeZoneDate, clientCityInfo } = this.pageStatus;
        if (!clientCityInfo && needLocate) {
            clientCityInfo = await this.handleClientLocate();
        }
        const userCityId = clientCityInfo?.cityId || 0;
        const { inday, outday } = dateUtil.correctInOutDay(timeZoneDate, dateInfo.inDay, dateInfo.outDay);
        const userCouponGetInfo = {
            hotelId,
            pageFrom: 2,
            checkIn: inday,
            checkOut: outday,
            desCity: this.pageStatus.cityId
        };
        const params = {
            isfromscan: false,
            isOversea: biz === 1 ? 0 : 1,
            userCouponGetInfo,
            isFirstPage: (isLandingPage && (isAppShare || isWechatShare)) ? 1 : 0,
            userCityId
        };

        return new Promise((resolve, reject) => {
            couponListRest.doRequest(params, (res = {}) => {
                resolve(res);
            }, () => {
                resolve({});
            });
        });
    },
    // 用户是否授权定位
    getLocalAuth () {
        let locationAuth = false;
        return new Promise((resolve) => {
            wx.getSetting({
                success (res) {
                    res.authSetting['scope.userLocation'] && (locationAuth = true);
                    resolve(locationAuth);
                },
                fail (res) {
                    resolve(locationAuth);
                }
            });
        });
    },
    beginLocate: util.throttle(function () {
        const self = this;
        const failModal = (type = 2) => {
            const errMsg = {
                1: '请开启定位后重试',
                2: '网络异常，请检查网络后重试'
            };
            wx.showModal({
                title: '定位失败',
                content: errMsg[type],
                confirmText: '我知道了',
                showCancel: false,
                confirmColor: '#4289FF'
            });
        };
        const successCallback = async () => {
            const clientCityInfo = await self.handleClientLocate();
            if (clientCityInfo.hasLocate) {
                !self.data.showLoading && self.setData({
                    showLoading: true
                });
                // 根据新老优惠券开关来处理回调
                self.reqRoomList();
            } else {
                failModal();
            }
        };

        wx.getSetting({
            success (res) {
                if (res.authSetting['scope.userLocation'] === false) {
                    wx.openSetting({
                        success (res) {
                            if (res.authSetting['scope.userLocation']) {
                                self.setData({
                                    showLoading: true
                                });
                                successCallback();
                            } else {
                                failModal(1);
                            }
                        }
                    });
                } else {
                    successCallback();
                }
            },
            fail () {
                failModal(2);
            }
        });
    }, 400),

    handleClientLocate () {
        const clientCityInfo = {
            cityId: 0,
            hasLocate: false
        };
        const ps = this.pageStatus;
        return new Promise((resolve) => {
            cwx.locate.getCtripCity((res) => {
                if (res.data) {
                    const City = res.data.CityEntities[0] || {};
                    clientCityInfo.cityId = City.CityID || (City.geoCategoryID === 3 && City.geoID) || 0;
                    clientCityInfo.hasLocate = true;
                    ps.clientCityInfo = clientCityInfo;
                }
                resolve(clientCityInfo);
            }, commonfunc.getLocationSource());
        });
    },

    // discardBoostCoupon助力券开关，开关开，不使用下发的boostCoupon
    getCouponsPromotion ({ coupons = [], boostCoupon = [], discardBoostCoupon }) {
        if (!coupons.length && !boostCoupon.length) return { };

        let couponsToLayer = [];
        const unReceivedCoupons = [];
        const receivedCoupons = [];
        const couponTags = [];
        boostCoupon.forEach(item => item?.strategyId && (item.promotionID = item.strategyId));
        boostCoupon = discardBoostCoupon ? [] : boostCoupon;

        coupons.forEach(c => {
            const dc = {
                promotionID: c.promotionID,
                amount: c.amount,
                amountDesc: c.type === 1 ? '最高立减' : '立减',
                discountVal: '', // 折扣券折扣值
                promotionName: c.promotionName,
                condition: c.condition,
                couponTag: c.couponTag || '',
                disableDate: c.disableDate,
                isDiscountCoupon: false, // 是否折扣券
                owned: c.owned === 1,
                shortRemark: c.shortRemark,
                // 以下领券服务参数用
                type: c.type,
                sourceFrom: c.sourceFrom || 0,
                btnText: '立即领取',
                ...handleLocalCoupon(c)
            };
            // 优惠券展示文案设置
            if (c.deductionInfoList && c.deductionInfoList[0]) {
                const isDiscountCoupon = c.deductionInfoList[0].deductionType === 1;
                if (isDiscountCoupon) { // 折扣券
                    dc.isDiscountCoupon = true;
                    dc.discountVal = (c.amount * 10).toFixed(1);
                }
            }
            if (c.shareBeforeBinding && discardBoostCoupon) { // 助力领券
                dc.useCouponListDetail = true;
                boostCoupon.push(dc);
                return;
            }

            couponTags.push(c.couponTag || `优惠券减¥${c.amount}`);
            dc.owned ? receivedCoupons.push(dc) : unReceivedCoupons.push(dc);
        });
        // 未领在前，已领在后
        couponsToLayer = [...unReceivedCoupons, ...receivedCoupons];

        return { couponTags, couponsToLayer, boostCoupon };

        function handleLocalCoupon (coupon) {
            const { type, owned, statusReason } = coupon;
            if (LOCAL_COUPON_TYPE_LIST.includes(type) && owned === 2 && statusReason) {
                const localCouponText = {
                    1: {
                        btnText: '定位后领券',
                        remark: '还不知道您的位置，开启“位置权限”后方能领取本地优惠红包'
                    },
                    2: {
                        btnText: '',
                        remark: '您的位置不在酒店所在城市，无法领取'
                    }
                };
                coupon.owned = owned === 1;
                coupon.disabled = statusReason === 2;
                coupon.extraRemark = localCouponText[statusReason].remark;
                coupon.btnText = localCouponText[statusReason].btnText;
                coupon.needLocate = statusReason === 1;
            }
            return coupon;
        }
    },
    reqCutprice () {
        return reqUtil.isCutpriceHotelRequest({ hotelId: this.data.hotelId });
    },
    handleCouponReceive (e) {
        const { id: promotionID, isLayerClick = true } = e.currentTarget.dataset;
        this.receiveCouponReq(promotionID).then(res => {
            const coupons = util.clone(this.data.couponsToLayer);
            const couponIdx = coupons.findIndex(c => c.promotionID === promotionID);
            const dataToSet = {
                [`couponsToLayer[${couponIdx}].owned`]: 1
            };
            res.disableDate && _.assignIn(dataToSet, { [`couponsToLayer[${couponIdx}].disableDate`]: res.disableDate });
            this.setData(dataToSet);

            // 同步微信卡券
            this.addWechatCards([`${promotionID}`]);
            // 领券成功后刷新房型列表
            this.reqRoomList();
            this.conponSubscribe();
        });

        isLayerClick && coupontrace.promotionsLayerClick(this, {
            subtab: this.data.biz === 1 ? 'inland' : 'oversea',
            benefitstype: '优惠券',
            pageId: this.pageId
        });
    },
    // 领取成功后，授权提醒
    conponSubscribe () {
        const { subscribeNoticeSwitch } = this.pageStatus;
        if (!subscribeNoticeSwitch) return;
        const { biz } = this.data;
        const tmpId = 'F3HaACHAEbOpFkpTQIr65zjhjlCX3hY4IMqPLePVIpY';
        const tmpIds = [].concat(tmpId);
        commonfunc.toSubscribe(tmpIds, (res) => {
            if (res?.[tmpId] === 'accept' || res?.templateSubscribeStateInfos) {
                coupontrace.authorizeSucess(this, {
                    key: biz === 1 ? 215450 : 215449,
                    pageId: this.pageId
                });
            }
        });
    },
    receiveCouponReq (promotionID) {
        const coupons = util.clone(this.data.couponsToLayer);
        const coupon = coupons.find(c => c.promotionID === promotionID);
        if (!coupon) {
            return new Promise((resolve, reject) => {
                // eslint-disable-next-line
                reject();
            });
        }

        const { clientCityInfo = {} } = this.pageStatus;
        const params = {
            promotionId: promotionID,
            category: coupon.type,
            hotelId: this.data.hotelId
        };
        if (LOCAL_COUPON_TYPE_LIST.includes(coupon.type)) {
            params.userCityId = clientCityInfo.cityId || 0;
        }
        return new Promise((resolve, reject) => {
            commonrest.receiveCoupon(params, (r) => {
                if (r && r.success === 1) {
                    resolve(r);
                    this.sentCouponUbt(coupon);
                } else {
                    if (r && r.resultCode === 53 && r.macaoNeedAuthMsg) {
                        // 实名认证失败，出实名认证弹窗
                        this.onShowRealNamePop({ msg: r.macaoNeedAuthMsg, promotionID });
                    } else {
                        cwx.showToast({ title: r.resultMessage || '领券失败', icon: 'none' });
                        // eslint-disable-next-line
                        reject();
                    }
                }
            });
        });
    },
    // 领券成功埋点
    sentCouponUbt (data) {
        data.subtab = this.data.biz === 1 ? 'inland' : 'oversea';
        coupontrace.getCouponSuccess(this, 'htlwechat_detail_getsuccess_show', data);
    },
    /**
     * 根据策略ID发微信卡券
     * @param promoitionIds {array} promoitionIds promoitionId(string) list
     */
    addWechatCards (promoitionIds = []) {
        if (!promoitionIds.length) return;

        commonrest.getWechatSoaSwitch(['wechat_card_bound_coupon'], data => {
            if (data) {
                const rs = data.result || [];
                const idStr = rs[0] ? rs[0].value : '';
                if (idStr) {
                    const vaildIds = idStr.split(',');
                    const ids = promoitionIds.filter(id => vaildIds.includes(id));
                    card.addWxCard(this, ids, function () {
                        cwx.showToast({ title: '领取成功，已放至您的微信卡包', icon: 'none' });
                    }, function () {
                        cwx.showToast({ title: '领取成功', icon: 'none' });
                    });
                }
            }
        });
    },
    /* ----------------------------------------------------------
        优惠信息整合 end
    ---------------------------------------------------------- */
    getBaseInfoStatus (res) {
        const pageS = this.pageStatus || {};
        pageS.cityId = res.cityId;
        pageS.cityName = res.cityName;
    },
    gotoSellingPoint (e) {
        const { id: levelID } = e.currentTarget.dataset;
        const { hotelId, dateInfo } = this.data;
        const host = __global.env === 'prd' ? 'm.ctrip.com' : 'm.ctrip.fat369.qa.nt.ctripcorp.com';
        let qs = `hotelid=${hotelId}&checkin=${dateInfo.inDay}&checkout=${dateInfo.outDay}`;
        levelID && (qs += `&type=${levelID}`);

        cwx.component.cwebview({
            data: {
                hideShareMenu: true,
                url: encodeURIComponent(`https://${host}/webapp/hotels/sellingpoint?${qs}`)
            }
        });

        if (levelID === 'notice') {
            this.clickReservationNoticeTrace();
        } else if (levelID === 'policy') {
            this.clickPolicyInfoTrace();
        } else {
            this.clickSellingPointTrace();
        }
    },
    hotelNameLP (e) {
        this.setData({ showHotelNameCopy: true });
        this.pageStatus.copyNameTO = setTimeout(() => {
            this.data.showHotelNameCopy && this.setData({ showHotelNameCopy: false });
        }, 5000);
    },
    copyHotelName (e) {
        cwx.setClipboardData({
            data: this.data.headInfo.displayHotelName,
            success () {
            },
            fail (res) {
                cwx.showToast({ title: '复制失败', icon: 'none', duration: 2000 });
            },
            complete: () => {
                this.setData({ showHotelNameCopy: false });
                this.pageStatus.copyNameTO && clearTimeout(this.pageStatus.copyNameTO);
            }
        });
    },
    toComment (tagId, tagName, commentType) {
        const {
            headInfo = {},
            headInfo: {
                displayHotelName: name
            },
            biz,
            hotelId
        } = this.data;
        // 偏好相似点评点击跳转传statisticid=7，其余全部点评点击跳转不传statisticid
        const STATISTIC_SIMILAR_VALUE = 7;
        const STATISTIC_SIMILAR_TYPE = 'statistic_similar';
        let statisticid;
        if (commentType === STATISTIC_SIMILAR_TYPE) {
            statisticid = STATISTIC_SIMILAR_VALUE;
        }
        let qs = `id=${hotelId}&hotelname=${name}&biz=${biz}`;
        tagId && (qs += `&tagid=${tagId}`);
        tagName && (qs += `&tagname=${tagName}`);
        statisticid && (qs += `&statisticid=${statisticid}`);
        headInfo.commentCount && cwx.component.cwebview({
            data: {
                hideShareMenu: true,
                url: encodeURIComponent(`https://${h5Host}/webapp/hotels/commentlist?${qs}&ftype=v`)
            }
        });
    },
    childClickComment (e) {
        const { id: tagId, value: tagName, type: commentType } = e.detail;
        this.toComment(tagId, tagName, commentType);
    },
    parentClickComment (e) {
        const { id: tapId, dataset } = e.currentTarget;
        const { id: tagId, value: tagName } = dataset;
        // 点评点击埋点
        const DETAIL_TOP_COMMET_BANNER = 'autotest_detailpage_commentbanner';
        if (tapId === DETAIL_TOP_COMMET_BANNER) {
            this.clickCommentTrace();
        }
        this.toComment(tagId, tagName);
    },
    toMap (e) {
        const { hotelBaseInfo: baseInfo, headInfo } = this.data;
        const coordinate = baseInfo.coordinate || {};
        if (!coordinate.latitude) return;

        wx.openLocation({
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            name: headInfo.displayHotelName,
            address: headInfo.address
        });
        const mapExposeObj = {
            data: {
                page: this.pageId,
                triggerTime: new Date().getTime()
            },
            ubtKeyName: exposeTraceKey.HOTEL_DETAIL_MAP_KEY
        };
        this.setData({
            mapExposeObj
        });
        this.clickMapTrace();
    },

    /**
     * hotel product 酒店预售套餐
     */
    reqHotelProduct () {
        const hotelId = +this.options.id;
        if (!hotelId) return;

        const { inDay: checkIn, outDay: checkOut } = this.data.dateInfo || {};
        const planetId = this.pageStatus.starPlanetId;
        const params = { hotelId, checkIn, checkOut, planetId };
        reqUtil.getHotelProduct(params, (data = {}) => {
            const { products: list = [], totalCount = 0, tags = '' } = data;
            this.setData({
                hotelProduct: {
                    list,
                    totalCount,
                    tags
                }
            });

            list.forEach(item => {
                this.showProductDetailTrace(item.productId);
            });
        });
    },

    toProductDetail (e) {
        const { idx, id } = e.currentTarget.dataset;
        const h5Url = this.data.hotelProduct.list[idx]?.h5Url;
        if (!h5Url) return;

        const productDeatilUrl = h5Url.startsWith('https://') ? h5Url : `https://m.ctrip.com${h5Url}`;

        cwx.component.cwebview({
            data: {
                url: encodeURIComponent(productDeatilUrl),
                needLogin: true
            }
        });

        this.clickProductDetailTrace(id);
    },
    toProductList (e) {
        const { cityId, cityName } = this.pageStatus;
        const { hotelId } = this.data;
        const options =
            `?masterHotelId=${hotelId}&hotelId=${hotelId}&cityId=${cityId}&cityName=${cityName}&fromPage=sc_wechatapp`;

        cwx.component.cwebview({
            data: {
                url: 'https://m.ctrip.com/webapp/cw/hotel/instoreflagship/instoreHome.html' + encodeURIComponent(options)
            }
        });

        this.clickProductListTrace();
    },
    toPlanetStore () {
        const { targetUrl } = this.data.planetBanner;
        cwx.component.cwebview({
            data: {
                url: encodeURIComponent(targetUrl)
            }
        });

        this.clickPlanetBannerTrace();
    },
    toPlanetLive () {
        const { liveClickUrl } = this.data.planetBanner;
        if (!liveClickUrl) return;

        cwx.navigateTo({
            url: liveClickUrl
        });
    },
    /**
     * hotel additionInfo
     */
    reqAdditionInfo () {
        const { inDay: checkinDate, outDay: checkoutDate } = this.data.dateInfo;
        const { hotelId: hotelID } = this.data;
        if (!hotelID) return;

        const successBack = res => {
            this.reqNearbySpots(res); // scroll 触发 todo

            this.setData({
                askInfo: this.getQuesAnsInfo(res.askInfo)
            });
        };
        const params = {
            hotelId: ~~hotelID,
            checkinDate,
            checkoutDate
        };

        reqUtil.hotelSelling(params, successBack);
    },
    getPrivilegeInfo (tags = []) {
        const result = {};
        tags.some(additionItem => {
            if (additionItem.tagkey === '401') { // 优享会
                result.title = additionItem.tagTitle;
                result.iconImg = additionItem.tagDrawble;
                return true;
            }
            return false;
        });
    },
    getQuesAnsInfo (askInfo = {}) {
        const result = {
            enable: false,
            list: []
        };
        // eslint-disable-next-line
        const { pagefrom, enable_qa } = this.options;
        let enableQuesAns = true;
        enableQuesAns = pagefrom !== 'hotel_qa';
        // eslint-disable-next-line
        if (enable_qa) {
            // eslint-disable-next-line
            enableQuesAns = enable_qa === '1';
        }
        if (!enableQuesAns) return result;

        const { askList = [] } = askInfo;
        if (askList.length) {
            result.enable = true;
            result.count = askInfo.totalCount;
            askList.forEach(askItem => {
                // 使用富文本处理特殊符号
                askItem.node = [{
                    name: 'div',
                    attrs: {
                        class: 'ask-eliipsis-box'
                    },
                    children: [{
                        type: 'text',
                        text: askItem.title
                    }]
                }];
                result.list.push(askItem);
            });
        }

        // 疑问解答发送曝光埋点
        result.quesAnsExposeObj = {
            data: {
                page: this.pageId
            },
            ubtKeyName: '227547'
        };

        return result;
    },
    toQuestionPage (e) {
        cwx.component.cwebview({
            data: {
                url: encodeURIComponent(`https://m.ctrip.com/webapp/you/hotelasks/${this.data.hotelId}.html?isInHotelAskWeixin=1`),
                needLogin: true
            }
        });

        this.clickQuesAnsInfoTrace();
    },

    /**
     * 酒店周边-景点，接口不依赖入离日期，只调用一次
     * todo: 全部更换新接口时可删除
     */

    reqNearbySpots (res) {
        const coordinateInfo = res.coordinate || {};
        const facilityType = 'LandScape';
        const params = {
            hotelId: this.data.hotelId,
            hotelStar: res.hotelStar,
            nearbyFacilityType: facilityType,
            mapType: coordinateInfo.coordinateType,
            latitude: coordinateInfo.latitude,
            longitude: coordinateInfo.longitude,
            oversea: res.isOversea,
            pageIndex: 1
        };
        reqUtil.getNearbyFacilityInfo(params, r => {
            this.getNearbySpots(r, facilityType);
        });
    },
    getNearbySpots (res = [], type) {
        const nearbySpots = [];
        const { facilityList = [] } = res || {};
        const facList = [];
        facilityList.forEach((fac, idx) => {
            if (idx < 10) {
                let extraDesc = '';
                if (fac.commentCount) {
                    extraDesc = `${fac.commentCount}点评`;
                }
                facList.push({
                    id: fac.id,
                    districtId: fac.districtId || '',
                    name: fac.name,
                    desc: `直线距离${fac.distanceForShow}`,
                    picture: fac.pictureUrl,
                    commentRate: fac.commentRating ? fac.commentRating.toFixed(1) : '',
                    extraDesc
                });
            }
        });

        const nearbyInfo = {
            ubtKey: 'xcx_actmdy_scenery',
            subUbtKey: 'xcx_xqy_jdkp',
            name: '景点'
        };
        facilityList.length && nearbySpots.push({
            name: nearbyInfo.name,
            current: true,
            type,
            facList,
            ubtKey: nearbyInfo.ubtKey,
            subUbtKey: nearbyInfo.subUbtKey
        });

        this.pageStatus.nearbySpots = nearbySpots;
        this.buildNearByFacilityInfo();
    },
    nearbyFacilityTab (e) {
        const { type, current } = e.currentTarget.dataset || {};
        if (current || !type) return;

        const { nearbyFacility = [] } = this.data;
        nearbyFacility.forEach(item => {
            item.current = item.type === type;
        });
        this.setData({ nearbyFacility });

        this.clickNearbyFacilityTrace();
    },
    toNearbyItem (e) {
        const { type, id, districtId } = e.currentTarget.dataset;
        if (!id || !type) return;

        switch (type) {
        case 'Dining':
            districtId && cwx.navigateTo({
                url: `/pages/foods/resDetail/resDetail?id=${id}&districtId=${districtId}&sourcefrom=hotel`
            });
            break;
        case 'LandScape':
            cwx.navigateTo({
                url: `/pages/gs/sight/newDetail?sightId=${id}`
            });
            break;
        default:
            break;
        }

        this.clickNearbyFacilityTrace();
    },

    /**
     * 附近同类型
     */
    reqNearbyHotels () {
        const { reqGraphQLEnd, reqRoomListEnd, userCoordinate } = this.pageStatus;
        if (!reqGraphQLEnd || !reqRoomListEnd || +this.options.fromMgm) return;
        const { hotelId, dateInfo, hotelBaseInfo: hInfo, headInfo, biz } = this.data;
        const { inDay: checkinDate, outDay: checkoutDate, selectMorning, isLongRent } = dateInfo;
        const { cityId, starLevel, coordinate } = hInfo;
        const reqData = commonfunc.getDefaultListReq();
        reqData.pageCode = 'hotel_miniprogram_detail';
        const extraData = {
            channel: 1,
            checkinDate,
            checkoutDate,
            cityId,
            isHourRoomSearch: false,
            isMorning: selectMorning ? 1 : 0,
            isOrderByUser: false,
            preHotelIds: '' + hotelId,
            nearbyHotHotel: {
                hotelCityId: cityId,
                hotelId,
                hotelName: headInfo.displayHotelName,
                hotelStar: starLevel,
                nearbySubType: 'HotelDetail',
                coordinate: coordinate || null
            }
        };
        _.assignIn(reqData, extraData);
        userCoordinate && (extraData.userCoordinate = userCoordinate);

        reqUtil.nearbyHotelList(reqData, res => {
            const hotelInfoList = res.hotelInfoList?.map((htl, index) => {
                const { totalPriceInfo, price, medal, commenterNumber, collectedNumber, isAdHotel, hotelId: curHotelId, minPriceInfo = '{}' } = htl;
                const longRentPriceInfo = {};

                if (isLongRent && totalPriceInfo) { // 长租房
                    if (totalPriceInfo.price) {
                        longRentPriceInfo.priceAvg = price;
                        longRentPriceInfo.price = totalPriceInfo.price;
                        longRentPriceInfo.originPrice = totalPriceInfo.originPrice;
                    }
                }
                const parsedMinPriceInfo = this.parseMinPrice(minPriceInfo);
                const hotelCardExposeObj = {
                    data: {
                        triggerTime: new Date().getTime(),
                        page: this.pageId,
                        htlrank: index,
                        hotelid: curHotelId,
                        advertiseid: (isAdHotel && parsedMinPriceInfo.adtraceid) || '',
                        dispatchId: (isAdHotel && parsedMinPriceInfo.dispatchId) || '',
                        xqyhotelid: hotelId
                    },
                    ubtKeyName: biz === 1 ? exposeTraceKey.IN_NEARBY_HOTEL_SHOW_KEY : exposeTraceKey.OS_NEARBY_HOTEL_SHOW_KEY
                };
                return ({
                    ...htl,
                    ...longRentPriceInfo,
                    // 点评数
                    commentNumberText: commenterNumber > 0 ? `${commenterNumber}点评` : '',
                    // 收藏浏览数
                    collectedText: getCollectedText(collectedNumber),
                    medalIconSrc: commonfunc.getMedalIcon(medal),
                    ubt: {
                        item: `xcx_hotel_list_near_hotel_${index}`,
                        autotest_item: `autotest_xcx_hotel_list_near_hotel_${index}`,
                        autotest_price: 'autotest_xcx_hotel_near_list_priceintro'
                    },
                    inspireTag: getInspireTagInfo(htl.inspireTag),
                    hotelCardExposeObj
                });
            });
            function getInspireTagInfo (inspireTag = {}) {
                if (!inspireTag || !inspireTag.extensions?.length || inspireTag.id !== 20005) return inspireTag;
                inspireTag.rankType = inspireTag.extensions.find(item => item.type === 'rankType')?.value;
                return inspireTag;
            }
            this.setData({
                nearbyHotels: hotelInfoList || []
            });
            // 异步动态设置曝光埋点节点，必须在设置class完成后，调用 cwx.sendUbtExpose.refreshObserve
            setTimeout(() => cwx.sendUbtExpose.refreshObserve(this), 0);
        });

        // 收藏数
        function getCollectedText (collectedNumber) {
            if (collectedNumber <= 0) return '';

            const [tenValue, thousandValue, tenThousandValue] = [10, 1000, 10000];
            if (collectedNumber < tenThousandValue) {
                return `${collectedNumber}收藏`;
            }
            // 保留一位小数
            const thousands = Math.floor(collectedNumber / thousandValue);
            return `${thousands / tenValue}万收藏`;
        }
    },
    hoteltap (e) {
        const { inDay, outDay } = this.data.dateInfo;
        const dataset = e.currentTarget.dataset;
        const { idx, id } = dataset;
        const nearbyHotels = this.data.nearbyHotels;
        const countdown = this.options.countdown;
        let currentHotelInfo = {};
        if (nearbyHotels && nearbyHotels.length > 0) {
            currentHotelInfo = nearbyHotels[idx];
            this.pyramidTraceLog(currentHotelInfo, idx);
        }

        let url = '../detail/index?' +
            `id=${dataset.id}` +
            `&inday=${inDay}` +
            `&outday=${outDay}` +
            `&biz=${this.data.biz}` +
            '&enable_qa=0' +
            `&cityid=${this.pageStatus.cityId}`;
        currentHotelInfo.passFromList && (url += `&passfromlist=${currentHotelInfo.passFromList}`);
        countdown && (url += `&countdown=${countdown}`);
        cwx.redirectTo({
            url
        });
        this.clickNearbyHotelTrace(idx, id);
    },
    /**
     * 金字塔埋点
     */
    pyramidTraceLog: function (currentHotelInfo, hotelIndex) {
        if (currentHotelInfo && (currentHotelInfo.isAdHotel || currentHotelInfo.isAdSlot)) {
            const cityId = this.pageStatus.cityId;
            const minpPriceInfo = currentHotelInfo.minpPriceInfo ? JSON.parse(currentHotelInfo.minpPriceInfo || '{}') : {};
            const requestParams = {
                cityId,
                disctrictId: 0,
                filterItemList: [],
                locationItemList: [],
                starItemList: [],
                keywordFilterItem: '',
                keyword: '',
                masterHotelId: parseInt(currentHotelInfo.hotelID, 10),
                hotelIndex,
                isAdHotel: currentHotelInfo.isAdHotel,
                isAdSlot: currentHotelInfo.isAdSlot,
                traceId: minpPriceInfo.traceid || '',
                adTraceId: minpPriceInfo.adtraceid || '',
                isFullBooking: !!currentHotelInfo.isFullBooking,
                lowestPrice: 0,
                highestPrice: 0,
                scenario: 2
            };

            commonfunc.sendPyamidTrace(requestParams);
        }
    },

    /**
     * 查看房型按钮事件
     */
    scrollRoomTop (e) {
        const query = wx.createSelectorQuery();
        query.select('#room_mod').boundingClientRect();
        query.exec(res => {
            const currentDomTop = res?.[0]?.top || 0;
            this.setData({
                scrollTopHeight: this.pageStatus.scrollTop + currentDomTop - this.data.mpNavHeight
            });
        });
    },
    parseMinPrice (minPriceInfo) {
        try {
            return JSON.parse(minPriceInfo || '{}') || {};
        } catch (error) {
            return {};
        }
    },
    onScrollEnd (e) {
        const scrollTop = e.detail.scrollTop;
        this.pageStatus.scrollTop = scrollTop || 0;
    },
    onScroll: util.throttle(function (e) {
        const tData = this.data;

        // nav bar style
        const scrollTop = e.detail.scrollTop;
        if (scrollTop > HIDDEN_TITLE_LIMIT_SCROLL_TOP) {
            if (!tData.navigationBar.title) {
                this.setData({
                    'navigationBar.title': tData.headInfo.displayHotelName || '酒店详情',
                    'navigationBar.background': '#fff',
                    'navigationBar.leftCls': ''
                });
            }
        } else {
            if (tData.navigationBar.title) {
                this.setData({
                    'navigationBar.title': '',
                    'navigationBar.background': '',
                    'navigationBar.leftCls': 'white'
                });
            }
        }

        wx.createSelectorQuery()?.select('#roomList')
            ?.boundingClientRect(roomList => {
                const roomBottom = roomList?.bottom || 0;
                const showbottom = roomBottom - tData.fixedHeight < 0;
                if (showbottom !== tData.showBottomBar) {
                    this.setData({
                        showBottomBar: showbottom
                    });
                }
            }).exec();

        // 0元住gif向右隐藏
        if (this.data.isAppShare && !this.data.appWakeRight) {
            this.setData({ appWakeRight: true });

            this.pageStatus.gifTimeOut && clearTimeout(this.pageStatus.gifTimeOut);
            this.pageStatus.gifTimeOut = setTimeout(() => {
                if (this.data.appWakeRight) {
                    this.setData({ appWakeRight: false });
                }
            }, 2000);
        }

        // 曝光埋点 todo
    }, 150, true),

    askHotel (e) {
        const ps = this.pageStatus;
        if (ps.askHotelProcessing) return;
        ps.askHotelProcessing = true;

        const pData = this.data;
        const { hotelBaseInfo: hInfo, dateInfo, biz, hotelId, headInfo } = this.data;
        const isOverSea = biz !== 1;
        let pageCode = isOverSea ? '10650002401' : '10320654891';
        const sceneCode = 2; // 0: 问携程，2：问酒店
        const thirdPartytoken = {
            hotelStar: hInfo.starLevel,
            cityName: hInfo.cityName,
            checkinDate: dateUtil.formatTime('yyyyMMdd', dateInfo.inDay),
            isOverSea,
            pageCode,
            fromPage: pageCode,
            cityID: hInfo.cityId,
            checkoutDate: dateUtil.formatTime('yyyyMMdd', dateInfo.outDay),
            hotelID: hotelId,
            clientID: cwx.clientID,
            isEBK: 'true',
            isMinipro: 'true',
            point: headInfo.commentScore || 0,
            hotelName: headInfo.displayHotelName,
            sourcePage: isOverSea ? 201 : 101
        };

        if (hInfo.coordinate) {
            thirdPartytoken.coordinateItemList = [{
                coordinateEType: isOverSea ? 2 : 3,
                longitude: hInfo.coordinate.longitude,
                latitude: hInfo.coordinate.latitude
            }];
        }

        const { isRoomlayer } = e.currentTarget.dataset;
        if (isRoomlayer) {
            const roomLayer = pData.roomLayer || {};
            thirdPartytoken.baseRoomID = roomLayer.key;
            thirdPartytoken.roomId = roomLayer.skey?.split('_')[0];
            pageCode = isOverSea ? 'minipro_wechat_ohtlRoomde' : 'minipro_wechat_inhtlRoomde';
        }

        const otherParams = {
            source: 'minipro_app',
            orderInfo: {
                amount: '',
                bu: 'EBK',
                cid: '0',
                ctype: '',
                currency: '',
                supplierId: hotelId,
                supplierName: headInfo.displayHotelName,
                title: headInfo.displayHotelName
            }
        };

        commonrest.askhotelTPK(thirdPartytoken, (TPKkey) => {
            ps.askHotelProcessing = false;
            commonfunc.askHotel(1, pageCode, isOverSea, sceneCode, TPKkey, otherParams);
        }, () => {
            ps.askHotelProcessing = false;
        });
    },
    /**
     * 微信SEO
     * todo: 更换graphql数据源，缺少字段：tdk，locationName，commentTags（getComment->commentTags）
     * todo: 缺少字段：featureTags 需要服务与getBaseInfo.featureTags对比
     */
    setSEOdata: function (res) {
        const { headPictures } = this.data.headInfo;
        const {
            name,
            tdk = {},
            cityName,
            locationName,
            star,
            commentScore,
            commentDesc,
            commentTags = [],
            featureTags = []
        } = res || {};
        let cover = '';
        const thumbs = [];

        const picCutReg = /_C_.*?\./;
        const coverSize = '_C_1600_900.';
        const thumbsSize = '_C_500_500.';
        try {
            if (headPictures.length) {
                headPictures.forEach((img, i) => {
                    if (i === 0) {
                        cover = img.replace(picCutReg, coverSize);
                    }
                    i < 9 && (thumbs.push(img.replace(picCutReg, thumbsSize)));
                });
            }

            if (!thumbs.length) return;

            const tags = [cityName, locationName];
            star && tags.push(star);
            commentScore && tags.push(commentScore + '分');
            commentDesc && tags.push(commentDesc);
            commentTags.length && tags.push(commentTags[0]);
            featureTags.length && tags.push(featureTags[0]);

            this.setData({
                wxSEOdata: {
                    type: 'general',
                    uniq_id: 'HTL_' + this.data.hotelId,
                    title: name,
                    thumbs,
                    cover,
                    digest: tdk.description,
                    tags
                }
            });
        } catch (err) {
            // ignore
        }
    },

    pageImageSuccess (e) {
        storageUtil.setStorage(constConf.STORAGE_WEBP, 'true');
    },

    /* 页面开关状态 */
    checkUniversalSwitches: function () {
        const self = this;
        const ps = self.pageStatus;
        const keys = [
            'enable_share_tomore',
            'room_friend_share',
            'detail_choose_hotel_entry',
            'switch_planet_banner',
            'coupon_subscribe_notice',
            'detail_nearbyhotels_title',
            'detail_guest_comment_info'
        ];
        commonrest.getWechatSoaSwitch(keys, (data) => {
            if (data) {
                const rs = data.result || [];
                for (let i = 0, n = rs.length; i < n; i++) {
                    const curItem = rs[i] || {};
                    const key = curItem.key;
                    const opened = curItem.value === '1';
                    const val = curItem.value || '';
                    switch (key) {
                    case 'enable_share_tomore':
                        if (opened) {
                            self.matchShareToMore();
                        }
                        break;
                    case 'switch_planet_banner':
                        if (opened) {
                            self.reqPlanetBanner();
                        }
                        break;
                    case 'room_friend_share':
                        self.setData({
                            isShareShow: opened
                        });
                        break;
                    case 'detail_choose_hotel_entry':
                        if ((+cwx.scene === 1044 || +cwx.scene === 1036) && cwx.shareTicket && commonfunc.isLandingPage() && val) {
                            self.pageStatus.reqTimes = 0;
                            self.setChooseEntry();
                        }
                        break;
                    case 'coupon_subscribe_notice':
                        ps.subscribeNoticeSwitch = opened;
                        break;
                    case 'detail_nearbyhotels_title':
                        this.setData({
                            nearbyHotelsTitle: val
                        });
                        break;
                    case 'detail_guest_comment_info':
                        self.setData({
                            enableGuestComment: opened
                        });
                        break;
                    default:
                        break;
                    }
                }
            }
        });
    },

    matchShareToMore () {
        const { isShareToMore, isAppShare, isLandingPage } = this.data;
        if (isShareToMore) return;

        if (isAppShare && isLandingPage) {
            this.setData({ isShareToMore: true });
        }
    },

    toZero: function () {
        cwx.navigateTo({
            url: '../../market/directory/liveMidpage/index?type=jdlhhyzxs',
            events: {
                backFromLiveMidPage: () => { }
            }
        });
    },

    async memberRights () {
        const { isPrimeHotel } = this.data; // 优享会酒店
        if (isPrimeHotel) {
            const receiveRsp = await commonfunc.receiveRightsNew({}) || {};
            const { gradePopBanner: imageAddr, newGuestType } = receiveRsp;
            if (newGuestType && !storageUtil.getStorage(constConf.STORAGE_NEWER_RIGHTS_DIALOG)) {
                this.setData({
                    newerPop: {
                        enable: true,
                        newGuestType
                    }
                });
                storageUtil.setStorage(constConf.STORAGE_NEWER_RIGHTS_DIALOG, '1', 24);
                return;
            }

            if (imageAddr) {
                this.setData({
                    rightsPop: {
                        imgSrc: imageAddr,
                        enable: true
                    }
                });
            }
        }
    },

    /**
     * 一致率埋点，从列表进入详情页触发
     */
    tracePrice () {
        const self = this;
        const { trackId, filtered, hasSentPriceTrace, filteredRoomList, listPriceTrace: listInfo, listTrackInfo, userExtraInfo = {}, trackInfoNoRoom } = this.pageStatus;
        if (!listInfo) return;

        const { isLoggedin, biz, dateInfo, hourRoomList = [], subRoomMap, filterSummary, priceFilter = {} } = this.data;
        if (!listInfo.bookable || filtered || !biz || !filteredRoomList || hasSentPriceTrace) return; // 防止biz/filteredRoomList未赋值就发埋点
        this.pageStatus.hasSentPriceTrace = true;

        const { inDay: checkin, outDay: checkout } = dateInfo;
        const validRooms = []; // 非钟点房&可订房型
        const hourRooms = []; // 钟点房房型
        filteredRoomList.forEach(broom => {
            broom.subRoomList.forEach(sroom => {
                const room = subRoomMap[sroom.skey];
                +room.price >= 0 && room.status === BOOKABLE_ROOM_STATUS && (validRooms.push(room));
            });
        });
        hourRoomList.forEach(item => {
            hourRooms.push(subRoomMap[item.skey]);
        });
        const onlyHourRoom = validRooms.length < 1 && hourRoomList.length > 0;
        const rooms = onlyHourRoom ? hourRooms : validRooms;
        rooms.sort((a, b) => a.price - b.price);
        const listRoomId = Object.keys(subRoomMap).filter(key => {
            const room = subRoomMap[key];
            return room.id === listInfo.roomid && room.shadowId === listInfo.shadowid;
        })[0];
        let listRoom = listRoomId ? subRoomMap[listRoomId] : {};

        let room = rooms[0] || {}; // 起价房型
        // 无论列表和详情房型id|shadowid是否匹配，使用与起价房型价格一致的房型
        if (~~room.price === ~~listRoom.price) {
            room = listRoom;
        } else if (~~room.price === ~~listInfo.price) {
            // 列表和详情房型id|shadowid不匹配，但价格匹配
            listRoom = room;
        }

        !room.trackInfo && (room.trackInfo = trackInfoNoRoom);
        listInfo.trackInfo = listTrackInfo;
        // 兼容老版埋点filter字段
        const filterItemList = contructFilterItem() || [];
        // 用户属性
        const propertyIds = (userExtraInfo && userExtraInfo.propertyIds) || [];
        pricetrace.listToDetail(this, {
            room,
            biz,
            trackId,
            isLoggedin,
            checkin,
            checkout,
            filterItemList,
            listRoomBookable: room.price >= 0 && room.status === BOOKABLE_ROOM_STATUS,
            listPage: this.options,
            listInfo,
            propertyIds
        });

        function contructFilterItem () {
            const result = [];
            const selectedIds = self.getSelectedFilters() || []; // 选中筛选项
            const selectFilters = _.pick(filterSummary, selectedIds);
            !util.isEmptyObject(selectFilters) && result.push(selectFilters);
            priceFilter.isShown && (result.push(priceFilter));
            return result;
        }
    },

    /**
     * 一起选酒店
     */
    setChooseEntry: function (back) {
        const self = this;
        const { hotelId } = this.data;
        const ps = this.pageStatus;
        chooseHotel.setChooseEntry(back, hotelId, (result) => {
            if (result.success) {
                self.setData({
                    showShareList: true,
                    floatingItems: result.floatingItems,
                    userUpdated: result.userUpdated,
                    total: result.total,
                    openGId: result.gid,
                    canIUseGetUserProfile: !!wx.getUserProfile
                });
                detailtrace.chooseHotelEntranceShow(self, {
                    hotelid: hotelId,
                    gid: result.gid,
                    count: result.total
                });
            } else {
                !ps.reqTimes && chooseHotel.updateSharingList(self.setChooseEntry);
                ps.reqTimes++;
            }
        }, () => {
            !ps.reqTimes && chooseHotel.updateSharingList(self.setChooseEntry);
            ps.reqTimes++;
        });
    },
    closeShareBar: function () {
        if (!this.data.showShareBar) return;
        this.setData({
            showShareBar: false
        });
    },
    showShareBarLayer: function () {
        this.setData({
            showShareBar: true
        });
    },
    goToShareList: function (e) {
        this.pageStatus.hasToChooseHotel = true;
        const { userUpdated, dateInfo, hotelId, openGId, total } = this.data;
        const page = this;
        const params = {
            inDay: dateInfo.inDay,
            outDay: dateInfo.outDay,
            hotelId,
            openGId,
            total
        };
        if (!userUpdated) {
            chooseHotel.goToShareList(e, { params, page });
        } else {
            chooseHotel.jumpChooseHotel({ params, page });
        }
    },

    // 点击去登录单独处理
    toLoginTap () {
        this.toLogin();
        this.clickLoginBarTrace();
    },
    // 登录引导
    toLogin (isForceLogin) {
        commonfunc.toLogin(this, () => {
            this.setData({
                'roomLayer.isShown': false,
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

    // 点击强制登录
    forceToLogin () {
        this.toLogin(true);
        forceLoginTrace.clickFLbutton(this);
    },

    screenShotTrace () {
        const { dateInfo, hotelId } = this.data;
        const { inDay, outDay } = dateInfo;
        screenshotstrace.detailScreenShotsTrace(this, {
            pageid: this.pageId,
            checkin: inDay,
            checkout: outDay,
            tracelogid: this.pageStatus.requestId,
            masterhotelid: hotelId
        });
    },
    baseTrace: function (res) {
        const { hotelId, dateInfo } = this.data;
        const { cityId = 2, shareFrom, isNewVersion, user } = this.pageStatus;
        const info = {
            hotelId,
            cityId,
            checkin: dateInfo.inDay,
            checkout: dateInfo.outDay,
            sharefrom: shareFrom,
            isNewVersion,
            user
        };
        detailtrace.trace(this, { info, res });
    },
    // 无房型埋点
    noRoomTrace: function (res) {
        const { roomList = [], hourSaleRoomList = [], result } = res;
        if (roomList.length || hourSaleRoomList.length) return;
        detailtrace.noRoomTrace(this, {
            requestId: commonfunc.getResponseLogId(res, 'request-id') || '',
            spider: result === 203
        });
    },
    /* 特色房banner点击埋点 */
    marketBannerClick: function (res) {
        const { staticPage } = res?.detail;
        if (staticPage) {
            detailtrace.marketBannerClick(this, { staticPage });
        }
    },
    /* 特色房浮层模块点击埋点 */
    roomSceneLayerClick: function (res) {
        const { staticPage } = res?.detail;
        if (staticPage) {
            detailtrace.roomSceneLayerClick(this, { staticPage });
        }
    },
    /* 打开实名认证弹窗 */
    onShowRealNamePop ({ msg, skey, promotionID }) {
        this.setData({
            realNamePop: {
                enable: true,
                message: msg || '',
                skey,
                promotionID
            }
        });
        macaocoupontrace.detailRealNamePopShow(this, {
            page: this.pageId
        });
    },
    /* 关闭实名认证弹窗 */
    onCloseRealName () {
        this.setData({
            realNamePop: { enable: false }
        });
    },
    /* 实名认证成功回调，批量领取澳门券 */
    onAuthRealNameCallback (e) {
        const { skey = '', promotionID = '', cancelAuthRealName = false } = e.detail;
        if (promotionID) {
            // 领券banner单张券领取
            this.handleCouponReceive({ currentTarget: { dataset: { id: promotionID, isLayerClick: false } } });
        } else if (skey) {
            if (cancelAuthRealName) {
                // 不领券直接订
                this.jumpBooking(skey, { cancelReceiveCoupons: true });
            } else {
                // 实名认证成功，领券订
                this.jumpBooking(skey);
            }
        }
    },
    /**
     * 请求企微福利官活动状态
     */
    reqWeComBanner () {
        const params = { hotelId: +this.options.id };

        return new Promise((resolve) => {
            reqUtil.getWeComBanner(params, (res = {}) => {
                resolve(res);
            }, () => {
                resolve({});
            });
        });
    },

    reqRegisterActivity (activityId) {
        const params = { activityIds: [activityId] };

        return new Promise((resolve) => {
            reqUtil.registerActivity(params, (res = {}) => {
                resolve(res);
            }, () => {
                resolve({});
            });
        });
    },

    setWeworkCoupon (res) {
        const { show = 0, status = 0, title = '', desc = '', maxAmount = '', tag = '', activityId } = res;
        const checkShow = show === 1 && [1, 2, 3].includes(status) && maxAmount > 0;
        this.setData({
            weworkInfo: {
                show: checkShow,
                status,
                title,
                desc,
                maxAmount,
                activityId
            }
        });
        const weworkCouponTags = [];
        if (checkShow && tag) {
            weworkCouponTags.push(tag);
        }
        const pageS = this.pageStatus;
        pageS.weworkCouponTags = weworkCouponTags;
        return weworkCouponTags;
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
                this.toWeworkExposure();
                function promotionStr (tData) {
                    const promotionArr = [];
                    const hotelCoupons = tData?.hotelCouponsModule?.hotelCoupons || [];
                    hotelCoupons.length > 0 && hotelCoupons.forEach((item) => {
                        promotionArr.push(item?.couponName);
                    });
                    return promotionArr.join('/');
                }
                cwx.sendUbtExpose.refreshObserve(this); // 入参当前页面的实例
            }
        });
    },
    handleGetCoupon: util.throttle(function (e) {
        const { id: couponStrategyId, isLayerClick = true } = e.currentTarget.dataset;
        if (this.pageStatus.couponStrategyId !== couponStrategyId) {
            this.pageStatus.couponStrategyId = couponStrategyId;
            this.receiveCouponRequest(couponStrategyId).then(() => {
                // 同步微信卡券
                this.addWechatCards([`${couponStrategyId}`]);
                // 领券成功后刷新房型列表
                this.reqRoomList();
                this.conponSubscribe();

                this.pageStatus.couponStrategyId = '';
            });

            isLayerClick && coupontrace.promotionsLayerClick(this, {
                subtab: this.data.biz === 1 ? 'inland' : 'oversea',
                benefitstype: '优惠券',
                pageId: this.pageId
            });
        }
    }, 1000),

    receiveCouponRequest (couponStrategyId) {
        const coupons = util.clone(this.data?.hotelCouponsModule?.hotelCoupons) || [];
        const coupon = coupons?.find(c => c.couponStrategyId === couponStrategyId);
        if (!coupon) {
            return new Promise((resolve, reject) => {
                // eslint-disable-next-line
                reject();
            });
        }

        const { clientCityInfo = {} } = this.pageStatus;
        const params = {
            promotionId: couponStrategyId,
            category: coupon.couponCategory,
            hotelId: this.data.hotelId
        };
        if (LOCAL_COUPON_TYPE_LIST.includes(coupon.couponCategory)) {
            params.userCityId = clientCityInfo.cityId || 0;
        }
        return new Promise((resolve, reject) => {
            commonrest.receiveCoupon(params, (r) => {
                if (r && r.success === 1) {
                    resolve(r);
                    this.sentCouponUbt(coupon);
                } else {
                    if (r && r.resultCode === 53 && r.macaoNeedAuthMsg) {
                        // 实名认证失败，出实名认证弹窗
                        this.onShowRealNamePop({ msg: r.macaoNeedAuthMsg, couponStrategyId });
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
     * 助力券点击跳转 新老版本都走该方法
    */
    toHelpGetCoupon (e) {
        const canJumpH5 = commonfunc.toHelpGetCoupon(e);
        const { id: activityId } = e?.currentTarget?.dataset || {};
        if (canJumpH5) {
            this.pageStatus.needRefreshRoomList = true;
            coupontrace.goToAssistClick(this, {
                subtab: this.data.biz === 1 ? 'inland' : 'oversea',
                benefitstype: '去助力',
                activityId
            });
        }
    },

    /**
     * 福利官相关逻辑 New
     */
    async toRewardCoupon () {
        const { state, activityId } = this.data.rewardModule.additionalBenefits;
        if (state !== 1 && state !== 2) return;
        reqUtil.recordUserAction({
            detail: {
                type: 1,
                hotelId: +this.options.id
            }
        });
        detailtrace.gotoWeworkClick(this, {
            pageId: this.pageId,
            hotelId: this.options.id,
            activityContent: '企微福利官',
            activityState: state === 1 ? '可参加' : '参与中'
        });

        if (state === 1) {
            const result = await this.reqRegisterActivity(activityId);
            const { registerResult = [] } = result || {};
            const { code } = registerResult?.find(item => item.activityId === activityId) || {};
            // 200表示注册成功 303表示活动正在进行中 除这两种情况外 直接return
            // 309 该用户已达到此活动的参与上限
            if (code !== 200 && code !== 303) {
                cwx.showToast({
                    title: '活动异常，请稍后重试',
                    icon: 'none',
                    duration: 2000
                });
                // 领券后调roomlist方法
                this.reqRoomList();
                return;
            }
        }
        // 领券订回退需刷券刷房型
        this.pageStatus.needRefreshRoomList = true;
        cwx.navigateTo({
            url: '/pages/market/web/index?from=https%3A%2F%2Fcontents.ctrip.com%2Factivitysetupapp%2Fmkt%2Findex%2Fjfdff%3Fentryid%3D1306%26innersid%3D427'
        });
    },

    /**
     * 新版优惠券 function end
     */
    /**
     * 企微福利官曝光埋点 - New
     */
    toWeworkExposure () {
        const { btnText = '' } = this.data.rewardModule?.additionalBenefits || {};
        if (btnText !== '') {
            detailtrace.gotoWeworkShow(this, {
                pageId: this.pageId,
                hotelId: this.options.id,
                activityContent: '企微福利官',
                activityState: btnText
            });
        }
    },
    /**
     * 展示全部钟点房
     */
    moreHourRoom () {
        if (this.data.moreHourRoomShow) {
            this.setData({
                moreHourRoomShow: false,
                showHourRoomList: this.data.hourRoomList
            });
        } else {
            this.setData({
                moreHourRoomShow: true,
                showHourRoomList: this.data.hourRoomList.slice(0, 1)
            });
        }
    },

    /**
     *
     * 榜单标签和勋章点击事件
     */
    rankClick (e) {
        const pagesLen = getCurrentPages().length;
        if (pagesLen > 4) return;
        const { type } = e.currentTarget.dataset;
        const rankUrl = this.data.headInfo?.topAwardInfo?.listUrl;
        if (rankUrl) {
            cwx.component.cwebview({
                data: {
                    url: encodeURIComponent(rankUrl)
                }
            });
        }
        // 点击埋点
        this.rankClickTrace(type);
    },

    /**
     * 榜单标签和勋章点击埋点
     */
    rankClickTrace (type) {
        const { topAwardInfo } = this.data.headInfo;
        if (!topAwardInfo) return;
        if (type === 'medal') { // 勋章
            detailtrace.rankMedalClick(this, {
                page: this.pageId,
                labelid: topAwardInfo.lableId,
                rankingid: topAwardInfo.rankId

            });
        } else if (type === 'label') { // 标签
            detailtrace.rankLabelClick(this, {
                page: this.pageId,
                labelid: topAwardInfo.lableId,
                rankingid: topAwardInfo.rankId,
                listTagContent: topAwardInfo.listSubTitle
            });
        };
    },

    /**
     * 价格明细点击埋点
     */
    clickPriceInfoTrace () {
        detailtrace.priceInfoClick(this, { page: this.pageId });
    },

    /**
     * 唤起日历浮层点击埋点
     */
    clickCalenderTrace () {
        detailtrace.calenderClick(this, { page: this.pageId });
    },

    /**
     * 筛选按钮点击埋点
     */
    clickFilterLayerTrace () {
        detailtrace.filterLayerClick(this, { page: this.pageId });
    },

    /**
     * 点评模块点击埋点
     */
    clickCommentTrace () {
        detailtrace.commentClick(this, { page: this.pageId });
    },

    /**
     * 地理信息模块点击埋点
     */
    clickMapTrace () {
        detailtrace.mapClick(this, { page: this.pageId });
    },

    /**
     * 酒店头部卖点页点击埋点
     */
    clickSellingPointTrace () {
        detailtrace.sellingPointClick(this, { page: this.pageId });
    },

    /**
     * 物理房型卡片展开更多价格点击埋点
     */
    clickMoreSubRoomTrace (key) {
        const { baseRoomMap } = this.data;
        const baseRoomId = baseRoomMap[key].id || '';
        detailtrace.moreSubRoomClick(this, {
            page: this.pageId,
            masterbasicroomid: baseRoomId
        });
    },

    /**
     * 收藏按钮点击埋点
     */
    clickCollectTrace () {
        detailtrace.collectClick(this, { page: this.pageId });
    },

    /**
     * 酒店周边点击埋点
     */
    clickNearbyFacilityTrace () {
        detailtrace.nearbyFacilityClick(this, { page: this.pageId });
    },

    /**
     * 预售套餐点击埋点
     */
    clickProductListTrace () {
        detailtrace.storeListClick(this, { page: this.pageId });
    },

    /**
     * 预售套餐房型卡片点击埋点
     */
    clickProductDetailTrace (roomId) {
        detailtrace.storeDetailClick(this, {
            page: this.pageId,
            roomid: roomId
        });
    },

    /**
     * 集团图标点击埋点
     */
    clickPlanetBannerTrace () {
        detailtrace.planetBannerClick(this, { page: this.pageId });
    },

    /**
     * 疑问解答点击埋点
     */
    clickQuesAnsInfoTrace () {
        detailtrace.quesAnsInfoClick(this, { page: this.pageId });
    },

    /**
     * 订房必读点击埋点
     */
    clickReservationNoticeTrace () {
        detailtrace.reservationNoticeClick(this, { page: this.pageId });
    },

    /**
     * 政策点击埋点
     */
    clickPolicyInfoTrace () {
        detailtrace.policyInfoClick(this, { page: this.pageId });
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

    // 领券banner曝光埋点
    showCouponsTrace (bannerTags) {
        const { biz, isLoggedin } = this.data;
        this.setData({
            detailCouponsExposeObj: {
                data: {
                    subtab: biz === 1 ? 'inland' : 'oversea',
                    userstatus: isLoggedin ? 'T' : 'F',
                    issingle: bannerTags.length === 1 ? 'T' : 'F',
                    page: this.pageId,
                    sourceid: cwx.scene
                },
                ubtKeyName: exposeTraceKey.HOTEL_PROMOTION_BANNER_KEY
            }
        }, () => {
            // 异步动态设置曝光埋点节点，必须在设置class完成后，调用 cwx.sendUbtExpose.refreshObserve
            cwx.sendUbtExpose.refreshObserve(this); // 入参当前页面的实例
        });
    },

    // 预售套餐房型发送曝光埋点
    showProductDetailTrace (productId) {
        this.setData({
            storeDetailExposeObj: {
                data: {
                    page: this.pageId,
                    roomid: productId
                },
                ubtKeyName: '227542'
            }
        }, () => {
            // 异步动态设置曝光埋点节点，必须在设置class完成后，调用 cwx.sendUbtExpose.refreshObserve
            cwx.sendUbtExpose.refreshObserve(this); // 入参 当前页面的实例
        });
    },
    // 达人晒图
    reqGroupArticle () {
        const self = this;
        const hotelId = self.options.id;
        const params = {
            masterHotelId: hotelId,
            pageNum: 1,
            pageSize: 3,
            source: 1
        };
        reqUtil.reqGroupArticle(params, (res) => {
            if (!res || !res.groupArticleInfoList) return;
            res.groupArticleInfoList.forEach((item, index) => {
                const traceInfo = self.blogArticleTraceInfo(item, index + 1);
                // 曝光埋点
                item.exposeTraceObj = {
                    ubtKeyName: exposeTraceKey.BLOG_ARTICLE_SHOW_KEY,
                    data: traceInfo
                };
            });
            self.setData({
                groupArticleList: res.groupArticleInfoList
            });
        });
    },
    toLvPai (e) {
        const { id, idx } = e?.currentTarget?.dataset || {};
        const { groupArticleList } = this.data;
        const currentArticle = groupArticleList.find(item => item.id === +id);
        const url = currentArticle?.wxUrl;
        if (!url) return;
        detailtrace.blogArticleClick(this, this.blogArticleTraceInfo(currentArticle, idx, 1));
        cwx.navigateTo({
            url
        });
    },

    blogArticleTraceInfo (article, index, type) {
        const { id: articleid, level, pictureType } = article;
        return {
            page: this.pageId,
            articleid,
            articlequality: level,
            articletype: pictureType === 2 ? 0 : 1,
            masterhotelid: this.data.hotelId,
            areaType: type,
            cardRank: index
        };
    },

    // 附近同类型酒店发送点击埋点
    clickNearbyHotelTrace (hotelrank, nearbymasterhotelid) {
        const { biz, hotelId } = this.data;
        detailtrace.nearbyHotelClick(this, {
            masterhotelid: hotelId,
            nearbymasterhotelid,
            hotelrank: hotelrank + 1,
            page: this.pageId,
            isOverSea: biz !== 1
        });
    },
    // 房型列表点击埋点
    clickRoomListTrace (e) {
        const { roomid } = e.currentTarget.dataset;
        const { requestId = '' } = this.pageStatus;
        detailtrace.roomListClick(this, {
            rmlist_tracelogid: requestId,
            roomid
        });
    },
    // 超值旅行家浮层
    toggleTravelCouponLayer (e) {
        const index = e.currentTarget?.dataset?.idx;
        const { showTravelCouponLayer, hotelCouponsModule } = this.data;
        const dataToset = {
            showTravelCouponLayer: !showTravelCouponLayer
        };
        if (!showTravelCouponLayer) {
            dataToset.travelCouponLayerInfo = util.clone(hotelCouponsModule?.travelCoupons?.[index] ?? {});
            if (dataToset.travelCouponLayerInfo.exposeData) {
                dataToset.travelCouponLayerInfo.exposeData.ubtKeyName = exposeTraceKey.HOTEL_DETAIL_TRAVEL_COUPON_LAYER;
            }
        }
        this.setData(dataToset);
    },
    /**
     * 购买超值旅行家券包
     * @param e
     */
    bookTravelCoupons (e) {
        const { travelCoupons } = this.data.hotelCouponsModule;
        const id = e.currentTarget.dataset.id;
        const currentCoupon = travelCoupons.find(item => item.id === id) ?? {};
        detailtrace.bookTravelCoupon({
            page: this.pageId,
            package_type: currentCoupon.name,
            masterhotelid: this.data.hotelId ?? this.options.id
        });

        const params = {
            productId: id
        };
        this.setData({
            showLoading: true
        });

        const hideLoading = () => {
            this.setData({
                showLoading: false
            });
        };
        const afterPay = () => {
            hideLoading();
            cwx.showToast({
                title: '购买成功',
                icon: 'none',
                duration: 2000
            });
            this.reqRoomList();
        };
        const onFail = () => {
            hideLoading();
            cwx.showToast({
                title: '支付失败',
                icon: 'none',
                duration: 2000
            });
        };
        const onSuccess = res => {
            const { orderId, requestId, payToken, busType, result } = res;
            if (result !== 0) {
                onFail();
                return;
            }
            const params = {
                serverData: {
                    requestId,
                    orderId,
                    payToken,
                    busType: +busType
                },
                // 成功回调
                sbackCallback: result => {
                    afterPay();
                },
                // 错误、失败的回调
                ebackCallback: result => {
                    onFail(result);
                },
                // 取消的回调
                rbackCallback: result => {
                    hideLoading();
                },
                // 回退的回调
                fromCallback: result => {
                    hideLoading();
                }
            };

            cwx.payment.callPay2(params);
        };

        reqUtil.createTravelCouponOrder(params, onSuccess, onFail);
    },
    /* Empty method, do nothing */
    noop () { }
});
