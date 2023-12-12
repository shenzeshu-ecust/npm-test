import { cwx, CPage } from '../../../cwx/cwx.js';
import constConf from '../common/C';

import dateUtil from '../common/utils/date.js';
import storage from '../common/utils/storage.js';
import components from '../components/components.js';
import geoService from '../common/geo/geoservice.js';
import util from '../common/utils/util.js';
import cityModel from '../common/city/index.js';
import commonfunc from '../common/commonfunc';
import commonrest from '../common/commonrest.js';
import inquireData from './inquiredata.js';
import listData from '../list/listdata.js';
import locatefailedtrace from '../common/trace/locatefailedtrace.js';
import hourroomtrace from '../common/trace/hourroomtrace.js';
import inquiretrace from '../common/trace/inquiretrace.js';
import loginbartrace from '../common/trace/loginbartrace.js';
import datetrace from '../common/trace/datetrace';

const HIDDEN_TITLE_LIMIT_SCROLL_TOP = 80;
const PAGE_HEADER_HEIGHT = 44;

const getKeywordModel = () => {
    return {
        key: '',
        val: ''
    };
};

const getPriceStarModel = () => {
    return {
        key: '',
        text: '',
        price: [],
        star: []
    };
};

const defaultSearchInfo = {
    location: {
        displayText: '我的位置',
        cityId: 0,
        cityName: '',
        did: 0, // 区域ID
        dName: '', // 区域名
        isOversea: false,
        isGeo: false, // 是否定位查询
        tzone: 0
    },
    date: {
        inDay: dateUtil.today(), // YYYY-MM-dd
        outDay: dateUtil.tomorrow(),
        days: 1,
        inDay_disp: [],
        outDay_disp: [],
        isMorning: false,
        selectMorning: false, // 是否已选凌晨入住
        showMoningTip: false, // 凌晨日期提醒
        showMoningInTip: false, // 凌晨入住日期选择提醒
        isLongRent: false,
        checkinTip: '',
        checkoutTip: ''
    },
    keyword: getKeywordModel(),
    priceStar: getPriceStarModel()
};

const getOverseaSearch = () => {
    return {
        ...defaultSearchInfo,
        location: {
            displayText: '首尔',
            cityId: 274,
            cityName: '首尔',
            did: 0,
            isOversea: true,
            isGeo: false, // 是否定位查询
            tzone: 3600
        }
    };
};

const TYPE_DOMESTIC = 'domestic';
const TYPE_OVERSEA = 'oversea';
const TYPE_HOURROOM = 'hourroom';
const SEARCH_CONDITION = 'P_HOTEL_INQUIRE_SEARCH_INFO';

CPage({
    pageId: '10650012159',
    pageName: 'hotelInquire',
    checkPerformance: true, // 白屏检测添加标志位
    data: {
        curType: TYPE_DOMESTIC, // 当前Tab
        search: defaultSearchInfo,
        psStates: { // 价格浮层信息
            hidden: true
        },
        statusBarHeight: wx.getSystemInfoSync()?.statusBarHeight, // 状态栏高度
        shwoCollectTip: false, // 收藏引导是否展示
        priceStarXtaroSwitch: false, // 价格/星级说明详情是否跳转xtaro页面开关
        isLoggedin: true,
        showHotNearByView: false, // 附近热卖模块开关
        newerCoupon: { // 新客礼包入口，区分国内海外
            coupons: [],
            expiredTime: '',
            opened: false // 开关
        },
        newerPop: { // 新客弹窗
            enable: false,
            newGuestType: null
        },
        rightsPop: { // 惊喜会员福利弹窗
            enable: false,
            imgSrc: ''
        },
        macaoPop: { // 澳门券发券弹窗
            enable: false,
            imgSrc: '',
            coupons: []
        },
        realNamePop: { // 澳门券实名认证弹窗
            enable: false,
            message: ''
        },
        navigationBar: { // 自定义导航
            back: false,
            animated: false,
            title: '',
            color: '#000',
            background: '',
            leftCls: 'white'
        },
        adInfo: { // 公共广告系统
            site: {
                siteId: '', // 城市ID（低版本插件必须传字符串）
                siteType: ''
            },
            showPop: false,
            slider: {
                isVisible: true,
                slideVideo: {
                    dotPosition: 'right',
                    dotColor: '#FFF',
                    dotCurrentColor: '#FFF',
                    bottom: 45,
                    right: 10
                },
                advertiseDataWidth: 0,
                advertiseDataHeight: 0
            },
            lonAndLat: {
                isEnable: false
            },
            showAdSign: {
                show: true,
                position: 'left',
                left: 0,
                bottom: 50
            }
        },
        inquireTop: 0, // 回到顶部
        isIphoneX: util.isIPhoneX(),
        isWechat: commonfunc.isWechat(),
        isAliApp: commonfunc.isAliApp(),
        isQuickApp: commonfunc.isQuickApp(),
        isDevEnv: commonfunc.isDevEnv(), // 是否为开发版/体验版
        waterfallInfo: { // 信息流组件参数
            source: 'DomHtlApplet', // 场景id
            appId: '99999999',
            ignoreLocation: false, // 是否跳过定位
            cityInfo: { // 手选城市信息
                type: '', // 统一地址类型,1(国家)|2(省)|3(城市)|4(区县)5|(景区)|6(商圈,攻略系)|7(乡镇)
                id: '',
                name: '',
                geoType: '' // base(酒店系)/gs_district(攻略系)
            },
            dateInfo: { // 酒店价格查询
                checkIn: '',
                checkOut: ''
            },
            extra: ''
        },
        personalRecommendSwitch: false // 个性化推荐开关
    },
    pageStatus: {
        rankUrl: 'https://m.ctrip.com/webapp/you/cranking/crankingCity/100200078435.html?ishideheader=true&isHideNavBar=YES&skipAb=true', // 榜单页面URL
        sourceFromTag: '', // 来源标识
        firstLoadStorageDate: true // 仅第一次加载时使用缓存的入离日期
    },
    model: {
        timeZoneDate: null, // 时间工具类
        posInfo: { // 定位信息
            cityId: 0,
            cityName: '',
            address: '',
            isOversea: false,
            tzone: 0,
            lng: null,
            lat: null
        },
        search: { // 查询信息
            domestic: defaultSearchInfo,
            oversea: getOverseaSearch(),
            hourroom: defaultSearchInfo
        },
        hotelLoadInfo: { // 查询页预加载酒店信息
            requestData: null, // 酒店列表Request
            hotelListData: null, // 酒店列表Response
            completed: false
        }
    },

    async onLoad (options) {
        this.init(options);
        this.firstLoad(options);
        /** 查询页开关配置 */
        this.checkUniversalSwitches();
        // 澳门券发券弹窗
        this.macaoCoupons().then((maocaoPopResult) => {
            // ’1‘=展示澳门券发券弹窗，则不展示权益弹窗
            maocaoPopResult !== '1' && this.memberRights(); // 会员等级弹窗
        });
        commonfunc.monitorPrivacyAuthorize();
    },

    onShow () {
        const isLoggedin = this.data.isLoggedin;
        const actualLogin = cwx.user.isLogin();
        if (isLoggedin !== actualLogin) {
            this._setData({
                isLoggedin: actualLogin
            });
        }

        this.setDefultTop();

        this._ubtTrace('htlwechat_inquery_load_basic', { scene: cwx.scene });
    },
    /**
     * 设置页面锚定的默认高度
     */
    setDefultTop () {
        try {
            const query = wx.createSelectorQuery();
            query.select('.tbody').boundingClientRect();
            query.exec((res) => {
                this.pageStatus.defultTbodyTop = res[0]?.top - wx.getSystemInfoSync()?.statusBarHeight - PAGE_HEADER_HEIGHT;
            });
        } catch (e) {}
    },
    onShareAppMessage () {
        return {
            bu: 'hotel',
            title: '携程订酒店，优惠活动多多',
            // desc: '',
            path: 'pages/hotel/inquire/index'
        };
    },

    init (options) {
        // eslint-disable-next-line camelcase
        const { source_from_tag, jumpurl } = options;
        // eslint-disable-next-line camelcase
        this.pageStatus.sourceFromTag = source_from_tag;
        // 初始化timeZoneDate对象，防止定位回来前操作入离日期报错
        this.setTimeZoneDate(0);
        // 收藏引导气泡 & 登录bar初始化 & 初始显示日期
        const isLoggedin = cwx.user.isLogin();
        !isLoggedin && this.showLoginBarTrace();
        this.setData({
            isLoggedin,
            shwoCollectTip: !storage.getStorage('P_HOTEL_COLLECTION_GUIDE_OPEN')
        });
        // 清除扫码住标识
        this.clearSmzTag();

        if (jumpurl) {
            this.redirectByLink(jumpurl);
        }

        if (!isLoggedin) {
            this._ubtTrace(156571, { sourceid: cwx.scene });
        }
        // 个性化推荐开关
        this.getPRSetting(options);
    },

    handleCustomBack () {
        cwx.navigateBack({
            fail: function () {
                cwx.reLaunch({ url: '/pages/home/homepage' });
            }
        });
    },
    onScroll: util.throttle(function (e) {
        const tData = this.data;
        const { defultTbodyTop } = this.pageStatus; // tbody模块的初始化top值
        // nav bar style
        const scrollTop = e.detail.scrollTop;
        if (scrollTop > HIDDEN_TITLE_LIMIT_SCROLL_TOP) {
            if (!tData.navigationBar.title) {
                this.setData({
                    'navigationBar.title': '携程酒店',
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

        // 底部bar切换显示
        if (scrollTop > defultTbodyTop) {
            if (!tData.secondScreen) {
                this.setData({
                    secondScreen: true
                });
            }
        } else {
            if (tData.secondScreen) {
                this.setData({
                    secondScreen: false
                });
            }
        }

        // 曝光埋点 TODO
    }, 150, true),
    toTop (e) {
        const { curType, secondScreen, isOversea } = this.data;
        let top = 0;
        if (!secondScreen && curType !== TYPE_HOURROOM) {
            top = this.pageStatus.defultTbodyTop + (isOversea ? 0 : 70);
            this.setData({
                secondScreen: true,
                inquireTop: top
            });
        } else {
            this.setData({
                inquireTop: top
            });
        }
    },
    firstLoad (options) {
        const ps = this.pageStatus;
        const dateInfo = this.data.search.date;
        const { cityid, inday: inDay, outday: outDay } = options;
        // 优先使用传入城市
        if (cityid) {
            let bindingInfo;
            if (inDay && outDay) {
                bindingInfo = {
                    dateInfo: { inDay, outDay }
                };
            };
            this.onCityLoad(parseInt(cityid, 10), false, bindingInfo);

            return;
        }
        // 没有传城市? 看缓存
        const cacheData = storage.getStorage(SEARCH_CONDITION) || {};
        const cacheType = cacheData.curType;
        const cacheLoc = cacheData.search?.location || {};
        if (cacheType && cacheLoc.cityId && !cacheLoc.isGeo) {
            // 先用缓存信息set，后面通过onCityLoad校正更新
            this.setData({
                curType: cacheType,
                search: cacheData.search
            });
            this.onCityLoad(parseInt(cacheLoc.cityId, 10));

            return;
        }
        // 缓存也没有？ 走定位，3s内拿不到定位默认今住明离
        ps.firstLoadTimer = setTimeout(() => {
            if (!this.model.posInfo.cityId) {
                const defaultInday = inDay ?? dateInfo.inDay;
                const defaultOutDay = outDay ?? dateInfo.outDay;
                this.setData({
                    'search.date': this.getDate(defaultInday, defaultOutDay)
                });
            }
        }, 1000);
        geoService.locateWithCityInfo({}, (city) => {
            const posInfo = this.setPosInfo(city);
            this.onCityLoad(posInfo.cityId, true);
        }, () => {
            this.onCityLoad();
            // 定位失败点击埋点
            this.clickPosFailedTrace();
        });
    },

    onCityLoad (cityId, isGeo, bindingInfo) {
        const defaultCityInfo = {
            cityId: 2,
            cityName: '上海',
            isOversea: false,
            modifyInfo: {
                checkinDate: dateUtil.today(),
                checkoutDate: dateUtil.tomorrow()
            },
            timeZone: 0
        };

        const onCityLoaded = (cityRes) => {
            const { cityName, isOversea, timeZone: tzone, serverTime } = cityRes;
            const ps = this.pageStatus;
            this.setTimeZoneDate(tzone, serverTime);
            // 有cityId传入按照传入cityId加载
            // 没有cityId的场景（例：‘我的位置’），TimeZoneDate按上海(cityId: 2)来初始化
            if (cityId) {
                const { did, dName } = this.data.search.location;
                // 获取缓存的入离日期
                if (ps.firstLoadStorageDate) {
                    const { cacheInDay, cacheOutDay } = this.getStorageDate();
                    const dateInfo = bindingInfo?.dateInfo;
                    bindingInfo = {
                        ...bindingInfo,
                        dateInfo: {
                            inDay: dateInfo?.inDay || cacheInDay,
                            outDay: dateInfo?.outDay || cacheOutDay
                        }
                    };
                }
                this.renderByCity({ cityId, cityName, isOversea, tzone, did, dName, isGeo }, bindingInfo);
            } else {
                this.renderByCity();
            }
            ps.firstLoadStorageDate = false;
        };

        const params = {
            cityId: cityId || 2
        };
        inquireData.getCityInfo(params, (cityInfo = {}) => {
            if (cityInfo.cityId === cityId && cityInfo.cityName) {
                onCityLoaded(cityInfo);
                return;
            }

            onCityLoaded(defaultCityInfo);
        }, () => {
            // 请求异常，上海兜底
            onCityLoaded(defaultCityInfo);
        });
    },
    getStorageDate () {
        // 优先看缓存，缓存日期过期或没有缓存，默认今住明离
        const cacheDate = storage.getStorage(constConf.STORAGE_USER_SELECT_DATE) || {};
        const cacheInDay = cacheDate?.inDay || dateUtil.today();
        const cacheOutDay = cacheDate?.outDay || dateUtil.tomorrow();
        return { cacheInDay, cacheOutDay };
    },

    /**
     * 根据城市信息刷新页面查询信息
     * @param {city} Object 城市信息对象
     * @param {bindingInfo} Object 要随着城市信息一起更新的查询条件（比如关键字）
     * */
    renderByCity (city = {}, bindingInfo = {}) {
        const { cityId, cityName, isOversea, tzone, did = 0, dName = '', isGeo = false } = city;
        // 更新位置信息和入离日期信息
        const sd = this.data.search;
        const clearFilters = cityId !== sd.location.cityId || isGeo !== sd.location.isGeo;
        const timeZoneDate = this.model.timeZoneDate;
        sd.location = this.getLocation({ cityId, cityName, isOversea, did, dName, tzone, isGeo });
        // 城市发生变化时清空关键字和价格新级信息
        if (clearFilters) {
            sd.keyword = getKeywordModel();
            sd.priceStar = getPriceStarModel();
        }

        const { keyword, dateInfo = {}, completed: completedCallback } = bindingInfo; // 附带更新的信息
        keyword && (sd.keyword = keyword);
        // 日期更新
        const checkin = dateInfo.inDay || sd.date.inDay;
        const checkout = dateInfo.outDay || sd.date.outDay;
        const { inday, outday } = dateUtil.correctInOutDay(timeZoneDate, checkin, checkout);
        sd.date = this.getDate(inday, outday);
        // 获取城市信息的时候有兜底逻辑，这里校验一下防止走到兜底逻辑时出现当前tab和城市不匹配的CASE
        let curType = this.data.curType;
        if (isOversea) {
            curType = TYPE_OVERSEA;
        } else if (curType === TYPE_OVERSEA) {
            curType = TYPE_DOMESTIC;
        }
        if (!isOversea) {
            this.getRankUrl(cityId);
        }

        this._setData({ curType, search: sd }, completedCallback);
        this.loadByCityId(cityId, cityName, did, inday, outday);
    },

    renderByType (targetType) {
        const sd = this.model.search[targetType];
        if (!sd) return;

        const isOverseaTab = targetType === TYPE_OVERSEA;
        const loc = sd.location;
        const posInfo = this.model.posInfo;
        const timeZoneDate = this.model.timeZoneDate;
        timeZoneDate.setZone(loc.tzone);
        const { inday, outday } = dateUtil.correctInOutDay(timeZoneDate, sd.date.inDay, sd.date.outDay);
        sd.date = this.getDate(inday, outday);
        // 没有cityId，取定位城市做为默认值
        if (!loc.cityId && posInfo.cityId && posInfo.isOversea === isOverseaTab) {
            sd.location = this.getLocationByPosition();
        }

        this._setData({
            curType: targetType,
            search: sd
        }, () => {
            let { cityId, cityName, did } = sd.location;
            if (!cityId || cityId === 0) { // 没有cityId，默认值为上海
                cityId = 2;
                cityName = '上海';
            }
            this.loadByCityId(cityId, cityName, did, inday, outday);
        });

        this.clickSearchTrace();
    },

    renderByLocate (callback) {
        geoService.locateWithCityInfo({}, (city = {}) => {
            let posInfo = this.model.posInfo;
            const loc = this.data.search.location;
            // 位置不变
            if (loc.isGeo && posInfo.lng === city.lng && posInfo.lat === city.lat) return;
            // 先更新位置信息
            posInfo = this.setPosInfo(city);
            const bindingInfo = { completed: callback };
            const { cityId, cityName, isOversea, tzone } = posInfo;
            // 和上一次同一个城市
            if (loc.cityId === cityId) {
                return this.renderByCity({ cityId, cityName, isOversea, tzone, isGeo: true }, bindingInfo);
            }
            // 城市也不一样了
            return this.onCityLoad(cityId, true, bindingInfo);
        }, () => {
            commonfunc.afterLocateFailed(this, 3, () => {
                this.onSelectCity();
            });
        });
    },

    /**
     * 加载依赖cityId的模块
     * */
    loadByCityId (cityId, cityName, did, inDay, outDay) {
        this.setADSlider(cityId);

        const cityInfo = {
            type: (did !== 0 ? '5' : '3') || '',
            id: cityId || '',
            name: cityName || '',
            geoType: 'base'
        };
        const dateInfo = {
            checkIn: inDay || '',
            checkOut: outDay || ''
        };
        this.rerenderWaterfall(cityInfo, dateInfo);
    },

    clearSmzTag () {
        delete storage.removeStorage('P_HOTEL_FROM_SCAN');
    },

    redirectByLink (link) {
        if (link) {
            cwx.navigateTo({
                url: decodeURIComponent(link)
            });
        }
    },

    getLocationByPosition () {
        const posInfo = this.model.posInfo;
        if (posInfo.cityId) {
            return this.getLocation({ ...posInfo, isGeo: true });
        }

        return this.data.search.location;
    },

    getLocation (locInfo = {}) {
        const { cityId, cityName, did = 0, dName = '', tzone = 0, isOversea = false, isGeo = false } = locInfo;
        let displayText = '我的位置';
        const pos = this.model.posInfo;
        if (isGeo && cityName && pos.address) {
            displayText = `${cityName},${pos.address}附近`;
        } else {
            cityName && (displayText = cityName);
            if (dName && cityName) { // 景点
                displayText = `${dName}(${cityName})`;
            }
        }

        return {
            displayText,
            cityId,
            cityName,
            did,
            dName,
            isOversea,
            isGeo, // 是否定位查询
            tzone
        };
    },

    getDate (inDay, outDay) {
        const timeZoneDate = this.model.timeZoneDate;
        const isMorning = dateUtil.checkIsMorning(timeZoneDate);
        let selectMorning = false;
        let showMoningTip = false;
        let showMoningInTip = false;
        // const minDate = timeZoneDate.today();
        let checkinTip = '';
        let checkoutTip = '';
        if (isMorning) {
            selectMorning = inDay === timeZoneDate.yesterday();
            showMoningTip = inDay === timeZoneDate.today() || inDay === timeZoneDate.today();
            showMoningInTip = inDay === timeZoneDate.today();
            const isHourRoomTab = this.isHourroomModule();
            const minDateText = commonfunc.getInDayText(timeZoneDate.yesterday());
            checkinTip = isHourRoomTab ? `今晨6点前入住, 请选择${minDateText}入住` : '今晨6点前入住，请选择“今天凌晨”入住';
            checkoutTip = '如您不是今天离店，请点击修改';
        }
        const inDayDisp = commonfunc.getDateDisp(inDay, timeZoneDate, selectMorning);
        selectMorning && (inDayDisp[0] = inDayDisp[2]); // 凌晨日期显示今住今离
        const outDayDisp = commonfunc.getDateDisp(outDay, timeZoneDate, selectMorning);
        const days = dateUtil.calDays(inDay, outDay);
        const isLongRent = days > constConf.longRentLimitDay;

        if (selectMorning && inDayDisp[1] && outDayDisp[1]) {
            inDayDisp[1] = inDayDisp[1].replace('今天', '');
            outDayDisp[1] = outDayDisp[1].replace('今天', '');
        }

        return {
            inDay,
            outDay,
            days,
            inDay_disp: inDayDisp,
            outDay_disp: outDayDisp,
            isMorning,
            selectMorning,
            showMoningTip, // 凌晨日期提醒
            showMoningInTip, // 凌晨入住日期选择提醒
            isLongRent,
            checkinTip,
            checkoutTip
        };
    },

    getListBaseUrl (isHourroom) {
        const { location: loc, date: dt } = this.data.search;
        const { cityId, did, cityName, isOversea, isGeo, dName } = loc;
        const { lng, lat, address } = this.model.posInfo;
        const biz = isOversea ? 2 : 1;
        const outDay = isHourroom ? dateUtil.addDay(dt.inDay, 1) : dt.outDay;
        let url = `/pages/hotel/list/index?cityid=${cityId}`;
        url += `&cityname=${cityName}` +
            `&dname=${dName}` +
            `&biz=${biz}` +
            `&inday=${dt.inDay}` +
            `&outday=${outDay}` +
            `&did=${did}`;
        // 定位信息
        if (util.isNumber(lng) && util.isNumber(lat)) {
            url += `&lng=${lng}&lat=${lat}`;
            if (isGeo) {
                url += `&isgeo=${isGeo}&address=${address}`;
            }
        }
        // 来源标识
        const sourceFrom = this.pageStatus.sourceFromTag;
        sourceFrom && (url += `&source_from_tag=${sourceFrom}`);

        return url;
    },

    /**
     * https://developers.weixin.qq.com/miniprogram/dev/api/open-api/setting/wx.getSetting.html
     * wx.getSetting-小程序向用户请求过的权限
     *      1. 若用户拒绝权限，res.authSetting[attrName]值为false;
     *      2. 用户同意授权，res.authSetting[attrName]值为true。
     *      3. 小程序未向用户请求该权限，res.authSetting[attrName]为undefined
     * @param attrName 权限名称
     * @param success
     * @param error
     */
    getAuthSetting (attrName, success, error) {
        if (!attrName) return;

        wx.getSetting({
            success (res) {
                success && success(res.authSetting[attrName]);
            },
            fail (err) {
                error && error(err);
            }
        });
    },

    setTimeZoneDate (tzone, serverTime) {
        const m = this.model;
        if (m.timeZoneDate) {
            m.timeZoneDate.setZone(tzone);
        } else {
            const sst = serverTime ? new Date(serverTime) : null;
            m.timeZoneDate = dateUtil.TimeZoneDate.create(sst, null, tzone);
        }
    },

    setPosInfo (locCity) {
        let posInfo = this.model.posInfo;
        const { cityId, cityName, address, lng, lat, did = 0 } = locCity;
        if (cityId && cityName) {
            posInfo = {
                cityId,
                cityName,
                did,
                address,
                isOversea: locCity.biz !== 1,
                tzone: locCity.tzone || 0,
                lng,
                lat
            };
        }
        this.model.posInfo = posInfo;

        return posInfo;
    },

    setKeyword (k, v) {
        const sd = this.data.search;
        const keyword = getKeywordModel();
        k && (keyword.key = k);
        v && (keyword.val = v);
        sd.keyword = keyword;

        this._setData({ search: sd });
    },

    /* 澳门券发券弹窗 */
    async macaoCoupons () {
        const macaoPop = constConf.STORAGE_MACAO_COUPON_DIALOG;
        const hasPopAlready = storage.getStorage(macaoPop);
        if (hasPopAlready) return;

        return new Promise((resolve) => {
            const loc = this.data.search.location;
            const params = {
                cityId: loc.cityId,
                pageCode: loc.isOversea ? 'hotel_oversea_inquire' : 'hotel_inland_inquire'
            };
            commonfunc.getMaocaoCoupons(params).then((res) => {
                const { image = '', coupons = [] } = res || {};
                if (image && coupons.length) {
                    this.setData({
                        macaoPop: {
                            enable: true,
                            imgSrc: image,
                            coupons
                        }
                    });
                    const tomorrowMorning = dateUtil.tomorrowMorning();
                    storage.setStorageByMillisecond(macaoPop, true, tomorrowMorning.getTime() - Date.now());
                    resolve('1');
                } else {
                    resolve();
                }
            });
        });
    },

    /* 会员等级弹窗 */
    async memberRights () {
        const data = {};
        const res = await commonfunc.receiveRightsNew({}) || {};
        const { gradePopBanner: imageAddr, newGuestType } = res;
        if (newGuestType && !storage.getStorage(constConf.STORAGE_NEWER_RIGHTS_DIALOG)) {
            data.newerPop = {
                enable: true,
                newGuestType
            };
            this.setData(data);
            storage.setStorage(constConf.STORAGE_NEWER_RIGHTS_DIALOG, '1', 24);

            return;
        }
        const hasPopAlready = storage.getStorage(constConf.STORAGE_MEMBER_RIGHTS_DIALOG);
        if (imageAddr) {
            data.rightsPop = {
                imgSrc: imageAddr,
                enable: true
            };
        }
        if (!imageAddr || hasPopAlready) {
            data.adInfo = this.data.adInfo;
            data.adInfo.showPop = true;
        }
        this.setData(data);
    },

    /**
     * 市场广告组件
     * @see http://conf.ctripcorp.com/pages/viewpage.action?pageId=179571800
     * */
    setADSlider (cityId) {
        const adInfo = this.data.adInfo;
        const adSite = {
            siteId: `${cityId}`,
            siteType: 'HTLCITY'
        };
        if (adInfo.slider.advertiseDataWidth) { // 已初始化过
            this.setData({ 'adInfo.site': adSite });
        } else {
            // 动态计算广告banner的宽高
            let adwidth = cwx.wxSystemInfo.windowWidth;
            let adHeight = (cwx.wxSystemInfo.windowWidth) * 0.54;
            try {
                const query = wx.createSelectorQuery();
                query.select('.ad-slider').boundingClientRect();
                query.exec(res => {
                    if (res && res[0]) {
                        const { width, height } = res[0];
                        width && (adwidth = width);
                        height && (adHeight = height);
                    }
                });
            } catch (err) {}

            this.setData({
                'adInfo.site': adSite,
                'adInfo.slider.advertiseDataWidth': adwidth,
                'adInfo.slider.advertiseDataHeight': adHeight
            });
        }
    },

    setHistoryCity (city, isOversea) {
        if (!city) return;

        const key = isOversea ? 'P_HOTEL_CITY_HISTORY_OVERSEA' : 'P_HOTEL_CITY_HISTORY_INLAND';
        const targetCityArr = [city];
        const cacheCities = this.getHistoryCities(isOversea);
        cacheCities.forEach(item => {
            if (city.cityId !== item.cityId) {
                targetCityArr.push(item);
            }
        });

        storage.setStorage(key, targetCityArr.slice(0, 4), 24 * 30);
    },

    getHistoryCities (isOversea) {
        const key = isOversea ? 'P_HOTEL_CITY_HISTORY_OVERSEA' : 'P_HOTEL_CITY_HISTORY_INLAND';
        return storage.getStorage(key) || [];
    },

    selectCity (city = {}) {
        const { cityId, cityName, isGeo, type, did, name, key, dtype } = city;
        const curLoc = this.data.search.location;
        if (!cityId || (cityId === curLoc.cityId && isGeo === curLoc.isGeo)) return;

        let bindingInfo;
        if (!did && dtype !== 32 && name) { // 带入非城市关键词
            bindingInfo = {
                keyword: {
                    key,
                    val: name
                }
            };
        }
        const isOversea = type !== 1;
        this.setHistoryCity(city, isOversea);
        // 国内的时区时已知的，海外需要调服务获取
        if (isOversea) {
            this.onCityLoad(cityId, isGeo, bindingInfo);
        } else {
            this.setTimeZoneDate(0);
            this.renderByCity({
                cityId,
                cityName,
                isOversea,
                tzone: 0,
                did,
                dName: did > 0 ? name : '',
                isGeo
            }, bindingInfo);
        }
    },
    /**
     * 新客大礼包
     * */
    getNewerCouponInfo (e) {
        const res = e.detail;
        if (!res.isShow) return;

        const { coupons = [], rewards = [], expiredTime } = res;
        const noCoupon = !coupons.length && !rewards.length;
        if (noCoupon) return;

        const newerCouponShow = [];
        coupons.forEach(coupon => {
            const { deductionList = [] } = coupon;
            if (deductionList[0] && newerCouponShow.length < 3) {
                const { deductionType, deductionAmount, startAmount } = deductionList[0];
                newerCouponShow.push({
                    isDiscount: deductionType === 1, // 折扣
                    amount: deductionAmount,
                    text: startAmount ? `满${startAmount}减` : '首单优惠'
                });
            }
        });
        rewards.forEach(reward => {
            const { rewardType, rewardName, discountPercent = 0 } = reward;
            if (newerCouponShow.length < 3) {
                newerCouponShow.push({
                    type: rewardType,
                    isDiscount: rewardType === 212, // 折扣
                    amount: discountPercent,
                    text: rewardType === 212 ? '首单优惠' : rewardName
                });
            }
        });

        this.setData({
            newerCoupon: {
                coupons: newerCouponShow,
                expiredTime,
                opened: true
            }
        });
    },

    /**
     * 设置我的位置信息作为查询条件
     * @param {callback} function 成功定位并setData后执行的回调函数
     * */
    handleMyLocation (callback) {
        if (!this.model.timeZoneDate) return;

        const self = this;
        if (self.hasPositionInfo()) { // 已定位过，直接走更新
            self.renderByLocate(callback);

            return;
        }

        const attrName = 'scope.userLocation';
        self.getAuthSetting(attrName, (authorized) => {
            if (authorized) {
                self.renderByLocate(callback);
            } else {
                // errMsg: 1-开启定位权限; 3-手动选择城市
                const openSettingType = 1;
                const selectCityType = 3;
                if (authorized === undefined) {
                    commonfunc.afterLocateFailed(this, selectCityType, () => {
                        this.onSelectCity();
                    });
                    return;
                }

                commonfunc.afterLocateFailed(this, openSettingType, () => {
                    wx.openSetting({
                        success (res) {
                            if (res.authSetting[attrName]) {
                                self.renderByLocate(callback);
                                // send trace
                                locatefailedtrace.locateFailtoSuccessTrace(self, {
                                    location_failure: '未授权小程序',
                                    is_success: 'T'
                                });
                            };
                        }
                    });
                });
            }
        }, () => {
            commonfunc.afterLocateFailed(self, 2);
        });
    },

    openKeyword () {
        const self = this;
        const sd = self.data.search;
        const { cityId, cityName, did, displayText, isOversea } = sd.location;
        const { inDay, outDay } = sd.date;
        const { lat, lng, cityId: userCityId } = self.model.posInfo;

        cwx.getCurrentPage().navigateTo({
            data: {
                keyword: sd.keyword.val,
                cityid: cityId,
                cityname: cityName,
                did,
                displayText,
                inday: inDay,
                outday: outDay,
                userCityId,
                lat,
                lng,
                isHourroomModule: self.isHourroomModule()
            },
            url: `../keywordsearch/index?biz=${isOversea ? '1' : '2'}`,
            callback: (kd) => {
                if (kd) {
                    const cityInfo = kd.cityInfo || {};
                    const { cityChanged, cityId, cityName, dtype, name } = cityInfo;
                    if (cityChanged) {
                        const cityText = (dtype === 12 && name) ? `${name}(${cityName})` : cityName;
                        cwx.showToast({
                            title: `城市已切换到 ${cityText}`,
                            icon: 'none',
                            duration: 2000
                        });

                        const keyword = getKeywordModel();
                        keyword.key = kd.key;
                        keyword.val = kd.keyword;
                        self.onCityLoad(cityId, false, { keyword });

                        return;
                    }

                    self.setKeyword(kd.key, kd.keyword);
                }
            }
        });
    },

    updatePageInfoWithAcceptData (ad) {
        // 当前Tab和传入的是否钟点房模块一致的时候才同步带入数据
        if (ad && ad.isHourroom !== this.isHourroomModule()) return;
        const search = this.data.search;
        const acpInday = ad.dateInfo?.inDay;
        const acpOutDay = ad.dateInfo?.outDay;
        const keywordText = ad.keywordInfo?.text;
        const { inDay: oldInDay, outDay: oldOutDay } = search.date;

        const handleCityChange = (selectedCityInfo) => {
            if (!selectedCityInfo) return;
            const { cityId: oldCityId, did: oldDid } = search.location;
            const { cityId: acpCityId, did: acpDid, isOversea } = ad.selectedCityInfo;
            if (((acpCityId && acpCityId) !== oldCityId) || ((acpDid !== undefined) && (acpDid !== oldDid))) {
                const bindingInfo = {
                    dateInfo: {
                        inDay: acpInday,
                        outDay: acpOutDay
                    },
                    keyword: {
                        key: '',
                        val: keywordText
                    }
                };

                // 仅景区did变化时，sd.location的displayText也需要改动
                search.location = this.getLocation(ad.selectedCityInfo);
                this._setData({
                    curType: isOversea ? TYPE_OVERSEA : TYPE_DOMESTIC,
                    search
                }, () => {
                    // 城市变化时重新加载城市信息
                    acpCityId && acpCityId !== oldCityId && this.onCityLoad(acpCityId, false, bindingInfo);
                });
            }
        };
        // 城市/景点变化
        handleCityChange(ad.selectedCityInfo);
        // 只有日期变化时，直接刷新
        if ((acpInday && (acpInday !== oldInDay)) || (acpOutDay && (acpOutDay !== oldOutDay))) {
            search.date = this.getDate(acpInday, acpOutDay);
            // 列表页回退时，日期变换更新缓存
            this.setDateStorage(acpInday, acpOutDay);
            this._setData({ search });
            this.getWaterfallDate(acpInday, acpOutDay);
        }
    },
    /**
     * 缓存入离日期
     * @param inDay
     * @param outDay
     */
    setDateStorage (inDay, outDay) {
        if (!inDay || !outDay) return;
        storage.setStorage(constConf.STORAGE_USER_SELECT_DATE, {
            inDay,
            outDay
        }, 24);
        datetrace.storageDateTrace({ inDay, outDay });
    },

    hasPositionInfo () {
        const pos = this.model.posInfo;

        return util.isNumber(pos.lng) && util.isNumber(pos.lat);
    },

    doSearch (isHourroom = false, isNearbySearch = false) {
        const loc = this.data.search.location;
        if (loc.cityId) {
            this.viewHotelList(isHourroom, isNearbySearch);
        } else {
            this.handleMyLocation(() => {
                this.viewHotelList(isHourroom, isNearbySearch);
            });
        }
    },

    isHourroomModule () {
        return this.data.curType === TYPE_HOURROOM;
    },

    viewHotelList (isHourroom, isNearbySearch) {
        const self = this;
        let listUrl = self.getListBaseUrl(isHourroom);
        if (isNearbySearch) { // 附近热卖
            listUrl += '&distance=distance-3';
        } else {
            const { keyword, priceStar } = self.data.search;
            // 关键字信息
            const { key, val } = keyword;
            if (key) {
                listUrl += `&filterkey=${key}&filterval=${val}`;
            } else if (val) {
                listUrl += `&keyword=${val}`;
            }
            // 价格
            const { price, star } = priceStar;
            if (price && price.length) {
                const priceKeys = [];
                price.forEach((item) => {
                    priceKeys.push(`${item.min}|${item.max}`);
                });
                listUrl += `&pricekeys=${priceKeys.join(',')}`;
            }
            // 星级 or 钻级
            if (star && star.length) {
                const starKeys = [];
                star.forEach((item) => {
                    starKeys.push(item.key);
                });
                listUrl += `&starkeys=${starKeys.join(',')}`;
            }
            // 钟点房
            if (isHourroom || self.isHourroomModule()) {
                listUrl += '&ishourroommodule=1';
            }
        }

        cwx.navigateTo({
            url: listUrl,
            events: {
                acceptInquireDataFromOpenedPage: function (ad) {
                    self.updatePageInfoWithAcceptData(ad);
                }
            }
        });
    },

    /**
     * 下载酒店列表（列表页预加载用）
     */
    loadHotels (searchInfo) {
        this.model.hotelLoadInfo = {};
        const reqData = this.constructListRequest(searchInfo);
        listData.loadHotelList('gethotellist', reqData, (data) => {
            // 保存Request和Response
            if (this.isSameSearchParams(reqData)) {
                this.model.hotelLoadInfo.requestData = reqData;
                this.model.hotelLoadInfo.hotelListData = data;
                this.model.hotelLoadInfo.completed = true;
            }
        }, () => {
            if (this.isSameSearchParams(reqData)) {
                this.model.hotelLoadInfo.completed = true;
            }
        });
    },

    isSameSearchParams (reqData) {
        let result = false;
        const searchInfo = this.data.search;
        if (reqData) {
            const nearbySearch = searchInfo.location.isGeo ? 1 : 0; ;
            result = reqData.cityId === searchInfo.location.cityId &&
                reqData.districtId === searchInfo.location.did &&
                reqData.checkinDate === searchInfo.date.inDay &&
                reqData.checkoutDate === searchInfo.date.outDay &&
                reqData.nearbySearch === nearbySearch;
        }

        return result;
    },

    constructListRequest (searchInfo) {
        searchInfo = searchInfo || this.data.search;
        const req = commonfunc.getDefaultListReq();

        req.isHourRoomSearch = this.isHourroomModule();
        const { cityId, did, isGeo } = searchInfo.location;
        const { inDay, outDay } = searchInfo.date;
        req.cityId = cityId;
        req.districtId = did;
        req.checkinDate = inDay;
        req.checkoutDate = outDay;
        req.nearbySearch = isGeo ? 1 : 0; // 我的附近查询
        req.pageIndex = 1;
        req.pageSize = 10;
        req.sourceFromTag = 'inquire_preload';
        req.channel = 1;
        // 已加载过的酒店
        req.preCount = 0;
        req.preHotelIds = '';
        // 筛选信息
        req.filterInfo = this.fillSearchFilterInfo(req.filterInfo, searchInfo);
        req.topHotelIds = [];
        const clientPos = this.model.posInfo;
        if (clientPos.cityId > 0) {
            req.userCoordinate = {
                cityId: clientPos.cityId,
                latitude: clientPos.lat,
                longitude: clientPos.lng
            };
        }

        return req;
    },

    fillSearchFilterInfo (searchFilterInfo, searchInfo) {
        if (searchFilterInfo && searchInfo) {
            // 关键字
            searchFilterInfo.keyword = searchInfo.keyword.val || '';
            // 价格
            const price = searchInfo.priceStar?.price;
            const start = searchInfo.priceStar?.star;
            if (price && price.length) {
                searchFilterInfo.lowestPrice = price[0].min || 0;
                searchFilterInfo.highestPrice = price[0].max || 0;
            }
            // 星级
            if (start && start.length) {
                const starItemList = [];
                start.forEach(item => {
                    starItemList.push(item.key);
                });
                searchFilterInfo.starItemList = starItemList;
            }
        }

        return searchFilterInfo;
    },

    checkUniversalSwitches () {
        const keys = [
            'inquire_hot_nearby',
            'price_star_xtaro'
        ];
        commonrest.getWechatSoaSwitch(keys, (data) => {
            if (data) {
                const rs = data.result || [];
                const dataToSet = {};
                for (let i = 0, n = rs.length; i < n; i++) {
                    const curItem = rs[i] || {};
                    const { key, value } = curItem;
                    const opened = value === '1';
                    switch (key) {
                    case 'inquire_hot_nearby':
                        dataToSet.showHotNearByView = opened;
                        break;
                    case 'price_star_xtaro':
                        dataToSet.priceStarXtaroSwitch = opened;
                        break;
                    default:
                        break;
                    }
                }
                this.setData(dataToSet);
            }
        });
    },

    handleAdDataReady ({ detail = [] }) {
        const hasAd = !!detail.length;
        this.setData({
            'adInfo.slider.isVisible': hasAd
        });
    },

    pageImageSuccess (e) {
        storage.setStorage(constConf.STORAGE_WEBP, 'true');
    },

    onTabSwitch (e) {
        const { type } = e.target.dataset;
        const curType = this.data.curType;
        if (type === curType || !this.model.timeZoneDate) return;
        const { hourroom = {}, domestic = {}, date = {} } = this.model.search;
        // 国内、钟点房相互跳转时信息需要相互带入，todo: 后续钟点房和国内tab的城市、日期、关键字可使用同一字段
        if (curType === TYPE_DOMESTIC && type === TYPE_HOURROOM) {
            hourroom.location = domestic.location;
            hourroom.date = domestic.date;
            hourroom.date.days = 1;
            hourroom.date.inDay_disp = [];
            hourroom.date.outDay_disp = [];
            hourroom.date.outDay = dateUtil.addDay(hourroom.date.inDay, 1);
            hourroom.keyword = domestic.keyword;
        }
        if (curType === TYPE_HOURROOM && type === TYPE_DOMESTIC) {
            domestic.location = hourroom.location;
            domestic.date = hourroom.date;
            domestic.keyword = hourroom.keyword;
        }
        // 切换tab时，国内海外日期会变，所以更新缓存的入离日期
        this.setDateStorage(date.inDay, date.outDay);
        this.renderByType(type);
    },

    goToBnb (e) {
        const pagePath = '/pages/tbnb/pages/common/webview/index';
        cwx.navigateTo({
            url: `${pagePath}?h5url=https%3A%2F%2Fm.tujia.com%3Fcode%3Dctriphotelwx&needLogin=true`
        });
    },

    onSelectCity (e) {
        const self = this;
        const setHistory = (citydata) => {
            if (!citydata) return;

            if (citydata.inlandCities) {
                citydata.inlandCities.historyCities = this.getHistoryCities();
            }
            if (citydata.interCities) {
                citydata.interCities.historyCities = this.getHistoryCities(true);
            }
            citydata.type = self.data.search.location.isOversea ? 'oversea' : 'domestic';
        };
        const { inDay, outDay } = self.data.search.date;
        const { cityId: userCityId, lat, lng } = self.model.posInfo;
        const params = {
            checkin: inDay,
            checkout: outDay,
            userCityId,
            userLat: lat,
            userLng: lng,
            isHourroomModule: self.isHourroomModule()
        };

        components.city({
            searchParams: params,
            loadData: function (callback) {
                const citydata = storage.getStorage('hotelCities');
                if (citydata) {
                    setHistory(citydata);
                    callback(citydata);
                } else {
                    cityModel.doRequest((citydata) => {
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
                    self.setPosInfo(city);

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
        }, self.selectCity);

        this.clickCitySelectTrace();
    },

    onMyPosition (e) {
        this.handleMyLocation();

        this.clickCurPositionTrace();
    },

    onCalenderTap (e) {
        const { inDay, outDay, isMorning } = this.data.search.date;
        const isHourRoomTab = this.isHourroomModule();
        const params = {
            title: '选择日期',
            inDay: dateUtil.formatTime('yyyy-M-d', dateUtil.parse(inDay)),
            outDay: dateUtil.formatTime('yyyy-M-d', dateUtil.parse(outDay)),
            endDate: dateUtil.addDay(dateUtil.today(), 365),
            timeZoneDate: this.model.timeZoneDate,
            isMorning
        };
        if (isHourRoomTab) {
            params.allowHourroomDate = false;
            params.maxStayDays = 180;
        }
        const componentName = isHourRoomTab ? 'hourroomcalendar' : 'calendar';

        components[componentName](params, (date) => {
            const sd = this.data.search;
            sd.date = this.getDate(date.inDay, date.outDay);
            this.setDateStorage(date.inDay, date.outDay);
            this._setData({ search: sd });
            this.getWaterfallDate(date.inDay, date.outDay);
        });

        this.clickDateSelectTrace();
    },

    onKeywordTap (e) {
        if (this.data.search.location.cityId) {
            this.openKeyword();
        } else {
            this.handleMyLocation(() => {
                this.openKeyword();
            });
        }

        this.clickKewordInfoSearchTrace();
    },

    onClearKeyword (e) {
        this.setKeyword();
    },

    onPriceStar (e) {
        this.setData({
            'psStates.hidden': !this.data.psStates.hidden
        });

        this.clickPriceStarTrace();
    },

    onPriceStarClose (e) {
        this.setData({
            'psStates.hidden': true
        });
    },

    onPriceStarUpdate (e) {
        const detail = e.detail;
        const sd = this.data.search;
        sd.priceStar = detail['searchInfo.priceInfo'];
        this._setData({
            psStates: detail.psStates,
            search: sd
        });
    },

    onPriceStarClear (e) {
        const sd = this.data.search;
        sd.priceStar = getPriceStarModel();

        this._setData({
            search: sd
        });
    },

    onSearch (e) {
        this.doSearch();

        this.clickSearchTrace();
    },

    onHourRoomSearch (e) {
        this.doSearch(true);

        hourroomtrace.enterHourRoomTrace(this);

        this.clickHourRoomSearchTrace();
    },

    /**
     * 动态获取口碑页面链接
     */
    getRankUrl (cityId) {
        const { location = {} } = this.data.search;
        const requestData = {
            cityId: cityId || location.cityId || 2
        };
        inquireData.getRankUrlInfo(requestData, (res = {}) => {
            if (res?.rankJumpUrl) {
                this.pageStatus.rankUrl = res?.rankJumpUrl;
            }
        }, () => {});
    },

    /* 跳转到榜单页 */
    onRankPage (e) {
        // 调接口更换榜单页地址
        const pagePath = this.pageStatus.rankUrl;
        cwx.component.cwebview({
            data: {
                url: encodeURIComponent(pagePath)
            }
        });
    },

    onNearbySearch (e) {
        this.doSearch(false, true);

        this.clickNearbySearchTrace();
    },

    /**
     * 特价酒店，http://conf.ctripcorp.com/pages/viewpage.action?pageId=1857956072
     * @param e
     */
    toSpecialHotels (e) {
        let url = 'https://m.ctrip.com/webapp/hotel/eventsale/ninefloordijiazhupindao';
        const { date, location } = this.data.search;
        const checkin = dateUtil.formatTime('yyyyMMdd', date.inDay ?? dateUtil.today());
        const checkout = dateUtil.formatTime('yyyyMMdd', date.outDay ?? dateUtil.tomorrow());
        url += `?city=${location.cityId}&checkindate=${checkin}&checkoutdate=${checkout}`;
        cwx.component.cwebview({
            data: {
                url: encodeURIComponent(url),
                needLogin: true
            }
        });
        inquiretrace.specialHotelClick(this, {
            page: this.pageId,
            tabname: '国内',
            inday: checkin,
            outday: checkout,
            cityid: location.cityId
        });
    },

    /* 打开实名认证弹窗 */
    onShowRealNamePop (e) {
        const { msg, coupons } = e.detail;
        this.setData({
            realNamePop: {
                enable: true,
                message: msg || '',
                coupons
            }
        });
    },

    /* 关闭实名认证弹窗 */
    onCloseRealName (e) {
        this.setData({
            'realNamePop.enable': false
        });
    },

    /* 实名认证成功回调，批量领取澳门券 */
    onAuthRealNameCallback (e) {
        const params = {
            coupons: e.detail.coupons
        };
        commonrest.receiveMutilCoupon(params, res => {
            cwx.showToast({
                title: res?.success === 1 ? '领券成功' : '领券失败',
                icon: 'none',
                duration: 2000
            });
        });
    },

    onCloseNewerCoupon (e) {
        this.setData({
            'newerCoupon.coupons': []
        });
    },

    onTestConfigTap () {
        cwx.navigateTo({
            url: '/pages/testconfig/testconfig'
        });
    },

    toNewerCouponPage (e) {
        const { location: loc, date: dt } = this.data.search;
        const { inDay, outDay } = dt;
        const checkin = dateUtil.formatTime('yyyyMMdd', inDay);
        const checkout = dateUtil.formatTime('yyyyMMdd', outDay);
        const query = `?isOversea=false&navigateto=list&checkin=${checkin}&checkout=${checkout}&cityid=${loc.cityId}&source=wechat`;
        cwx.component.cwebview({
            data: {
                url: encodeURIComponent(`https://m.ctrip.com/webapp/hotel/newguestgift${query}`)
            }
        });
    },

    toLogin (e) {
        commonfunc.toLogin(this, () => {
            this._setData({
                isLoggedin: true
            });
        });
        this.clickLoginBarTrace();
    },

    // 获取信息流组件实例，e.detail是组件实例，此方法与 waterfall的 bindgetref 绑定
    getWaterfallRef (e) {
        this.waterfallRef = e.detail;
    },

    // 瀑布流加载，此方法需与 scroll-view 的 bindscrolltolower 绑定
    getWaterfallListMore () {
        this.waterfallRef && this.waterfallRef.getListMore();
    },

    // 重新渲染信息流组件
    rerenderWaterfall (newCityInfo, newDateInfo) {
        const { personalRecommendSwitch, waterfallInfo } = this.data;
        if (personalRecommendSwitch && !this.isHourroomModule()) {
            const { cityInfo, dateInfo } = waterfallInfo;
            newCityInfo = newCityInfo || cityInfo;
            newDateInfo = newDateInfo || dateInfo;
            const wf = {
                ...this.data.waterfallInfo,
                cityInfo: newCityInfo,
                dateInfo: newDateInfo
            };
            this.setData({
                waterfallInfo: wf
            });
        }
    },

    // 个性化推荐开关
    getPRSetting (options) {
        cwx.getPRSetting().then(res => {
            this.setData({
                ...res
            });
            const sd = this.data.search.date;
            const { inDay, outDay } = sd;
            this.getWaterfallDate(inDay, outDay);
        });
    },

    getWaterfallDate (inDay, outDay) {
        const dateInfo = {
            checkIn: inDay || '',
            checkOut: outDay || ''
        };
        this.rerenderWaterfall(null, dateInfo);
    },

    // 城市选择框点击埋点
    clickCitySelectTrace () {
        inquiretrace.citySelectClick(this, { page: this.pageId });
    },

    // 当前位置点击埋点
    clickCurPositionTrace () {
        inquiretrace.curPositionClick(this, { page: this.pageId });
    },

    // 选择入离日期点击埋点
    clickDateSelectTrace () {
        inquiretrace.dateSelectClick(this, { page: this.pageId });
    },

    // 关键词/位置/品牌/酒店名点击埋点
    clickKewordInfoSearchTrace () {
        inquiretrace.kewordInfoSearchClick(this, { page: this.pageId });
    },

    // 价格/星级点击埋点
    clickPriceStarTrace () {
        inquiretrace.priceStarClick(this, { page: this.pageId });
    },

    // 查询按钮点击埋点
    clickSearchTrace () {
        const { curType } = this.data;
        let inqureType;
        switch (curType) {
        case 'domestic': {
            inqureType = '1';
            break;
        }
        case 'oversea': {
            inqureType = '2';
            break;
        }
        case 'hourroom': {
            inqureType = '3';
            break;
        }
        default: break;
        }
        inquiretrace.searchClick(this, {
            page: this.pageId,
            inquretype: inqureType
        });
    },

    // 钟点房图标点击埋点
    clickHourRoomSearchTrace () {
        inquiretrace.hourRoomSearchClick(this, { page: this.pageId });
    },

    // 附近热卖点击埋点
    clickNearbySearchTrace () {
        inquiretrace.nearbySearchClick(this, { page: this.pageId });
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
    // 定位失败点击埋点
    clickPosFailedTrace () {
        inquiretrace.posFailedClick(this, {
            page: this.pageId
        });
    },
    _setData (data, callback, preLoad = true) {
        if (!data) return;

        let curCityId = this.data.search.location.cityId;
        const searchData = data.search;
        // 更新缓存
        if (searchData) {
            const type = data.curType || this.data.curType;
            storage.setStorage(SEARCH_CONDITION, {
                curType: type,
                search: searchData
            }, 24);
            this.model.search[type] = util.clone(searchData);

            curCityId = searchData.location.cityId;
        }

        this.setData(data, () => {
            callback && callback(data);
        });
        // 酒店列表预加载
        if (preLoad && curCityId) {
            this.loadHotels(searchData);
        }
    },
    onShareTimeline () {
        const { location = {}, date = {} } = this.data.search;
        const cityId = location.cityId || 2;
        const { inDay = dateUtil.today(), outDay = dateUtil.tomorrow() } = date;
        return {
            title: '携程旅行订酒店',
            query: `cityid=${cityId}&inday=${inDay}&outday=${outDay}`
        };
    },

    onUnload () {
        if (this.pageStatus.firstLoadTimer) {
            clearTimeout(this.pageStatus.firstLoadTimer);
        }
    },

    _ubtTrace (name, value) {
        try {
            this.ubtTrace && this.ubtTrace(name, value);
        } catch (err) {
            // ignore
        }
    }
});
