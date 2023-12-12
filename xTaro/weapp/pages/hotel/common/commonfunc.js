import { _, __global, cwx } from '../../../cwx/cwx.js';
import C from '../common/C';
import components from '../components/components';
import huser from '../common/hpage/huser';
import DateUtil from '../common/utils/date.js';
import util from '../common/utils/util.js';
import hrequest from '../common/hpage/request';
import storage from './utils/storage.js';
import model from '../common/utils/model';
import locateFailedTrace from '../common/trace/locatefailedtrace.js';
import commontrace from './trace/commontrace';
const SEARCH_KEYWORD = 'P_HOTEL_KEYWORD_SEARCH_HISTORY';
const SKIP_FORCE_LOGIN_KEY = 'SkipForceLogin';

/**
 * 根据定位失败errMsg对失败原因分类。
 * 返回值 1：未授权给小程序；2：网络原因；3：其他原因(包含微信app拿不到定位)
 */
const locateFailedType = (errMsg) => {
    if (!errMsg) return;
    let failType = 0;
    switch (errMsg) {
    case 'getLocation:fail auth deny':
    case 'getLocation:fail:auth denied':
    case 'getLocation:fail authorize no response':
    case 'getLocation:fail:auth canceled':
        failType = 1;
        break;
    case 'getLocation:fail:ERROR_NETWORK':
        failType = 2;
        break;
    case 'getLocation:fail:ERROR_NOCELL&WIFI_LOCATIONSWITCHOFF':
    case 'getLocation:fail:system permission denied':
    case 'getLocation:fail system permission denied':
    case 'getLocation:fail:ERROR_SERVER_NOT_LOCATION':
        failType = 3;
        break;
    default:
        failType = 3;
        break;
    }
    return failType;
};
const appIdConfig = {}; // 屏蔽各端小程序的差异，有差异的属性可以往里面扩展
appIdConfig[C.APPID_WEAPP] = { // 微信
    lbsSource: 'hotel-wxlbs'
};
appIdConfig[C.APPID_ALIPAY] = { // 支付宝
    lbsSource: 'hotel-alipay-lbs'
};
appIdConfig[C.APPID_BAIDU] = { // 百度
    lbsSource: 'hotel-baidu-lbs'
};
appIdConfig[C.APPID_TT] = { // 头条
    lbsSource: 'hotel-toutiao-lbs'
};
appIdConfig[C.APPID_QUICK] = { // 快应用
    lbsSource: 'hotel-quickapp-lbs'
};

/**
 * AB实验mock数据
 * @return {String} 实验版本
 * @param key
 */
const valueForKeyMock = (key) => {
    const abs = wx.getStorageSync(C.ABTESTING_MANAGER_MOCK);
    if (abs) {
        for (let i = 0, n = abs.length; i < n; i++) {
            const ab = abs[i];
            if (ab.expCode === key) {
                return ab.abValue;
            }
        }
    }
    return null;
};

export default {
    askHotel: function (isPreSale, pageCode, isOversea, sceneCode, thirdPartytoken, otherParams) {
        const ensureParams = 'isHideNavBar=YES&isFreeLogin=0&platform=wechat';
        const bizType = (sceneCode === 0 && isPreSale === 0) ? '1341' : '1356';
        const { appId = 'wx0e6ed4f51db9d078', channel = 'EBK' } = otherParams;
        let params = ensureParams + `&appId=${appId}&sceneCode=${sceneCode}&channel=${channel}&bizType=${bizType}&isPreSale=${isPreSale}&pageCode=${pageCode}`;
        thirdPartytoken && (params += `&thirdPartytoken=${thirdPartytoken}`);
        if (otherParams) {
            otherParams.source && (params += `&source=${otherParams.source}`);
            otherParams.aiParam && (params += `&aiParam=${encodeURIComponent(JSON.stringify(otherParams.aiParam))}`);
            otherParams.orderInfo && (params += `&orderInfo=${encodeURIComponent(encodeURIComponent(JSON.stringify(otherParams.orderInfo)))}`);
            otherParams.cardInfo && (params += `&cardInfo=${encodeURIComponent(JSON.stringify(otherParams.cardInfo))}`);
        }
        const url = `https://m.ctrip.com/webapp/servicechatv2/${encodeURIComponent(`?${params}`)}`;

        const toAskHotel = () => {
            components.webview({
                url,
                needLogin: true
            });
        };

        if (cwx.user.isLogin()) {
            toAskHotel();
        } else {
            huser.login({
                param: {},
                callback: (res) => {
                    if (res && res.ReturnCode === '0') {
                        toAskHotel();
                    }
                }
            });
        }
    },
    getDateDisp: function (date, timeZoneDate, selectMorning) {
        date = DateUtil.formatTime('yyyy-MM-dd', DateUtil.parse(date));
        const arr = date.split('-');
        const ret = ['', ''];
        const allArr = [arr[1], '月', arr[2], '日'];
        const weekArr = ['日', '一', '二', '三', '四', '五', '六', '日'];
        const sdate = DateUtil.parse(date);

        if (timeZoneDate.today() === date) {
            ret[1] = '今天 ';
        } else if (timeZoneDate.tomorrow() === date) {
            ret[1] = '明天 ';
        } else if (timeZoneDate.aftertomorrow() === date) {
            ret[1] = '后天 ';
        } else {
            ret[1] = '周' + weekArr[sdate.getDay()] + ' ';
        }

        // 凌晨时间状态
        if (selectMorning && timeZoneDate.yesterday() === date) {
            ret[1] = '今天凌晨 ';
            const todayArr = timeZoneDate.today().split('-');
            ret[2] = `${todayArr[1]}月${todayArr[2]}日`;
        }
        if (selectMorning && timeZoneDate.today() === date) {
            ret[1] = '今天中午 ';
        }

        ret[0] = allArr.join('');
        return ret;
    },
    getInDayText: function (inDay) {
        const date = DateUtil.formatTime('yyyy-MM-dd', DateUtil.parse(inDay));
        const arr = date.split('-');
        const allArr = [arr[1], '月', arr[2], '日'];
        return allArr.join('');
    },
    receiveRightsNew (params) {
        return new Promise((resolve) => {
            if (params) {
                hrequest.hrequest({
                    url: model.serveUrl('receiveRights'),
                    data: params,
                    success: (res) => {
                        const rd = util.successSoaResponse(res) ? res.data : null;
                        resolve(rd);
                    },
                    fail: (err) => {
                        resolve(err);
                    }
                });
            } else {
                resolve();
            }
        });
    },
    getMaocaoCoupons (params) {
        return new Promise((resolve) => {
            if (params) {
                hrequest.hrequest({
                    url: model.serveUrl('getMacaoPopUpInfo'),
                    data: params,
                    success: (res) => {
                        const rd = util.successSoaResponse(res) ? res.data : null;
                        resolve(rd);
                    },
                    fail: (err) => {
                        resolve(err);
                    }
                });
            } else {
                resolve();
            }
        });
    },
    sendPyamidTrace: function (request) {
        this.postRequest(model.serveUrl('pyramidclickevent'), request);
    },
    /**
     * 获取挂牌ICON
     * @param level {Interger} 挂牌等级
     */
    getMedalIcon (level) {
        let iconUrl = '';
        const path = 'https://pages.c-ctrip.com/hotels/wechat/img/medals/';
        const whiteList = ['ma2', 'm2', 'ma3', 'm3', 'ma4', 'm4', 'ma2_24', 'm2_24', 'ma3_24', 'm3_24', 'ma4_24', 'm4_24'];
        const key = `m${level}_24`; // v7.5: 挂牌标签不区分直采和代理，都用直采的标签
        if (whiteList.indexOf(key) > -1) {
            iconUrl = `${path}${key}.png`;
        }
        return iconUrl;
    },
    featureIconClass () {
        return {
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
        };
    },
    setKeywordStorage (cityId, keyword, hotelId, key) {
        if (!keyword || !cityId) return;

        let targetObjs = [{
            text: keyword,
            id: hotelId || 0,
            key: key || '',
            cityId
        }];
        const cacheItems = this.getKeywordsStorage();
        if (cacheItems) {
            const maxEnableLen = 40;
            let delCityId = null;
            if (cacheItems.length > maxEnableLen) {
                const delItem = cacheItems.pop();
                delCityId = delItem?.cityId;
            }
            const vaildItems = [];
            cacheItems.forEach(item => {
                const curCityId = item.cityId;
                if (curCityId === cityId) { // 当前城市历史信息
                    item.text !== keyword && targetObjs.push(item);
                } else if (curCityId && curCityId !== delCityId) { // 有效历史记录
                    vaildItems.push(item);
                }
            });
            // 单个城市最多存8个历史数据
            if (targetObjs.length > 8) {
                targetObjs.splice(8);
            }

            targetObjs = targetObjs.concat(vaildItems);
        }

        storage.setStorage(SEARCH_KEYWORD, targetObjs, 240);
    },
    getKeywordsStorage (cityId) {
        const cacheItems = storage.getStorage(SEARCH_KEYWORD);
        if (cacheItems && cityId) {
            return cacheItems.filter(item => item.cityId === cityId);
        }

        return cacheItems;
    },
    clearKeywordsHistoryItems () {
        storage.setStorage(SEARCH_KEYWORD, null);
    },
    postRequest (url, reqData, onSuccess, onError) {
        hrequest.hrequest({
            url,
            data: reqData,
            success: function (result) {
                if (util.successSoaResponse(result)) {
                    onSuccess && onSuccess(result.data);
                } else {
                    onError && onError();
                }
            },
            fail: function (error) {
                onError && onError(error);
            }
        });
    },
    isLandingPage () {
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];

        if (util.isEmpty(prevPage)) {
            return true;
        }
        return false;
    },
    isFromPage (routeStr) {
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        const prevRoute = prevPage?.route || '';
        return prevRoute.indexOf(routeStr) > -1;
    },
    // 判断用户定位失败类型
    locateFailContent: function (failType) {
        if (!failType) return;
        let failContent = '';
        switch (failType) {
        case 1:
            failContent = '未授权小程序';
            break;
        case 2:
            failContent = '网络原因';
            break;
        case 3:
            failContent = '其他原因';
            break;
        default:
            failContent = '其他原因';
            break;
        }
        return failContent;
    },

    /**
     * 定位失败后，根据不同原因作出反应。
     * errMsg可传失败原因对应的数字
     * callback为未授权给小程序的回调
     */
    afterLocateFailed (page, errMsg, callback, from) {
        if (!errMsg) return;

        const failTypeConf = {
            type1: {
                title: '定位失败',
                content: '请开启定位，为您查询附近酒店',
                confirmText: '去开启',
                cancelText: '再想想'

            },
            type2: {
                title: '定位失败',
                content: '网络异常，请检查网络后重试',
                confirmText: '我知道了'
            },
            type3: {
                title: '定位失败',
                content: '请手动选择城市，为您查询酒店',
                confirmText: '选择城市',
                cancelText: '关闭'
            }
        };
        const failType = typeof errMsg === 'number' ? errMsg : locateFailedType(errMsg.trim());
        const locationFailure = this.locateFailContent(failType);
        const failIdx = `type${failType}`;
        const failConf = failTypeConf[failIdx];
        if (!failConf || !failConf.title) return;
        locateFailedTrace.showlocatefailedTrace(page, {
            location_failure: locationFailure
        });
        if (failType === 2) {
            wx.showModal({
                title: failConf.title,
                content: failConf.content,
                confirmText: failConf.confirmText,
                showCancel: false,
                confirmColor: '#4289FF',
                success (res) {
                    if (res.confirm) {
                        locateFailedTrace.clickLocateFailedButtonTrace(page, {
                            location_failure: locationFailure,
                            button_name: failConf.confirmText
                        });
                    }
                }
            });
        } else {
            if (from && failType === 3) {
                if (from === 'city') {
                    wx.showModal({
                        title: failConf.title,
                        content: failConf.content,
                        confirmText: '我知道了',
                        showCancel: false,
                        confirmColor: '#4289FF',
                        success (res) {
                            if (res.confirm) {
                                locateFailedTrace.clickLocateFailedButtonTrace(page, {
                                    location_failure: locationFailure,
                                    button_name: failConf.confirmText
                                });
                            }
                        }
                    });
                }
                if (from === 'listmap') {
                    wx.showModal({
                        title: failConf.title,
                        content: '请开启定位，为您查询附近酒店',
                        confirmText: '我知道了',
                        showCancel: false,
                        confirmColor: '#4289FF',
                        success (res) {
                            if (res.confirm) {
                                locateFailedTrace.clickLocateFailedButtonTrace(page, {
                                    location_failure: locationFailure,
                                    button_name: failConf.confirmText
                                });
                            }
                        }
                    });
                }
            } else {
                wx.showModal({
                    title: failConf.title,
                    content: failConf.content,
                    confirmText: failConf.confirmText,
                    cancelText: failConf.cancelText,
                    confirmColor: '#4289FF',
                    success (res) {
                        if (res.confirm) {
                            callback && callback();
                            locateFailedTrace.clickLocateFailedButtonTrace(page, {
                                location_failure: locationFailure,
                                button_name: failConf.confirmText
                            });
                        }
                        if (res.cancel) {
                            locateFailedTrace.clickLocateFailedButtonTrace(page, {
                                location_failure: locationFailure,
                                button_name: failConf.cancelText
                            });
                        }
                    },
                    fail (e) {
                        // ignore
                    }
                });
            }
        }
    },
    /**
     * 根据服务返回是否中反爬信息确认是否需要强制登录
     */
    loginRequired (resStatus) {
        let rs = false;
        if (resStatus && resStatus.Extension) {
            for (let i = 0, n = resStatus.Extension.length; i < n; i++) {
                const item = resStatus.Extension[i];
                if (item.Id === 'enforce-login' && item.Value === 'true') {
                    rs = true;
                    break;
                }
            }
        }

        return rs;
    },
    showCustomNav () {
        let version = '';
        try {
            version = wx.getSystemInfoSync().version;
        } catch (err) {
            return true;
        }
        return util.compareVersion(version, '7.0.0') >= 0;
    },
    /**
     * 整理价格明细浮层数据for hotelList
     */
    priceDetailNew (hotelInfo, isLongRent) {
        if (!hotelInfo) return {};

        const totalPriceInfo = isLongRent && hotelInfo.totalPriceInfo; // 长租房场景
        const { price = 0, priceFloatInfo = {}, priceCalcItems } = totalPriceInfo || hotelInfo;
        const { roomName = '', encryptedRoomId = '' } = hotelInfo.minRoomInfo || {};
        return {
            name: roomName,
            roomNo: encryptedRoomId,
            isHourRoom: (hotelInfo.duringTime || 0) > 0,
            price,
            priceFloatInfo,
            priceCalcItems
        };
    },
    setGlobalData (option) {
        try {
            const app = getApp();
            app.globalData.hotel || (app.globalData.hotel = {});
            Object.assign(app.globalData.hotel, option);
        } catch (err) {
            // ignore
        }
    },
    getGlobalData (key) {
        return getApp().globalData?.hotel?.[key];
    },
    getDefaultListReq () {
        return {
            cityId: 2,
            districtId: '',
            checkinDate: '',
            checkoutDate: '',
            pageCode: 'hotel_miniprogram_list',
            pageIndex: 1,
            pageSize: 10,
            preCount: 0,
            preHotelIds: null,
            nearbySearch: 0,
            sourceFromTag: '',
            sessionId: '',
            hiddenHotelIds: null,
            isMorning: 0,
            userCoordinate: null,
            topHotelIds: [],
            filterInfo: {
                lowestPrice: 0,
                highestPrice: 0,
                filterItemList: [],
                starItemList: [],
                keyword: ''
            }
        };
    },
    /**
     * 构造getroomlist需要的filter参数，列表与详情下发filterId不一致时，服务校正处理
     */
    getFilterParamsForRoom (filterIds = []) {
        return filterIds.map(item => ({
            filterId: item,
            type: item.split('|')[0]
        }));
    },
    /**
     * 反爬触发验证码校验
     */
    showVerification (page, callback) {
        if (!page) return;

        cwx.locate.startGetCtripCity(function (resp) { // 依赖于cwx封装的获取地位坐标信息方法
            let cityLatitude, cityLongitude, countryName, provinceName, cityName;
            if (!resp.error) {
                cityLatitude = resp.data.CityLatitude;
                cityLongitude = resp.data.CityLongitude;
                countryName = resp.data.CountryName;
                provinceName = resp.data.ctripPOIInfo && resp.data.ctripPOIInfo.provinceLocalName;
                cityName = resp.data.ctripPOIInfo && resp.data.ctripPOIInfo.districtName;
            } else {
                cityLatitude = 'error';
                cityLongitude = 'error';
                countryName = 'error';
                provinceName = 'error';
                cityName = 'error';
            }
            page.setData({
                showVerificationBar: true,
                verificationSettings: { // settings为captcha标签内settings属性的值，可自行定义
                    appId: '100014036', // 申请的appId值
                    businessSite: 'hotel_antibot_miniapp', // 申请的businessSite值
                    dev: __global.env === 'prd' ? 'pro' : 'uat', // 接口环境
                    width: '280px', // 滑块宽度
                    height: '40px', // 滑块高度
                    margin: 'auto', // 滑块边距
                    textslider: false, // 是否文字光影效果
                    language: cwx.util.systemInfo.language, // 微信设置的语言
                    openid: cwx.cwx_mkt.openid, // 小程序的用户openid
                    unionid: cwx.cwx_mkt.unionid, // 小程序的用户unionid
                    model: cwx.util.systemInfo.model, // 用户手机型号
                    wx_version: cwx.util.systemInfo.version, // 微信版本号
                    gpsLatitude: cityLatitude, // GPS横坐标
                    gpsLongitude: cityLongitude, // GPS纵坐标
                    country: countryName, // 国家
                    province: provinceName, // 省份
                    city: cityName, // 城市
                    duid: cwx.user.duid, // 携程duid
                    windowWidth: cwx.util.systemInfo.windowWidth, // 窗口宽度
                    windowHeight: cwx.util.systemInfo.windowHeight, // 窗口宽度
                    chooseOpt: { // 选字验证码属性
                        position: 'fixed', // 选字图片定位方式
                        width: '240px', // 选字图片宽度
                        height: '160px', // 选字图片高度
                        type: 'pop' // 选字框浮动方式
                    },
                    // 风险检测结果
                    resultHandler: e => {
                        if (e.checkState === 'success' || e.checkState === 'hidden') {
                            const params = {
                                token: e.token || '',
                                rid: e.rid || '',
                                version: e.version || ''
                            };

                            hrequest.hrequest({
                                url: model.serveUrl('casverify'),
                                data: params,
                                success: () => {
                                    const temp = page.selectComponent('#captcha');
                                    if (temp && temp.data) {
                                        temp.data.loadingInfoInterval && clearInterval(temp.data.loadingInfoInterval);
                                        temp.data.cptInfoInterval && clearInterval(temp.data.cptInfoInterval);
                                        temp.data.textSliderInter && clearInterval(temp.data.textSliderInter);
                                        temp.data.selectInfoInterval && clearInterval(temp.data.selectInfoInterval);
                                        temp.data.overTimeInterval && clearInterval(temp.data.overTimeInterval);
                                    }
                                    page.setData({
                                        showVerificationBar: false
                                    });

                                    callback && callback();
                                },
                                fail: () => {
                                    page.setData({
                                        captchaRefresh: true
                                    });
                                }
                            });
                        } else {
                            page.setData({
                                captchaRefresh: true
                            });
                        }
                    }
                }
            });
        });
    },
    /**
     * 从response中取LogId
     * @param {Object} rsp
     * @param {String} key: LogId对应的Id名，例如，'request-id'
     * @returns {String}
     */
    getResponseLogId: function (rsp, key) {
        const traceLogIdObj = rsp?.ResponseStatus?.Extension?.find(item => item?.Id === key) || {};
        return traceLogIdObj.Value || '';
    },
    /**
     * 获取LBS用source信息
     */
    getLocationSource () {
        const config = appIdConfig[cwx.appId] || appIdConfig[C.APPID_WEAPP];
        return config.lbsSource;
    },
    isWechat () {
        const appId = cwx.appId || C.APPID_WEAPP;
        return appId === C.APPID_WEAPP;
    },
    isBaidu () {
        return cwx.appId === C.APPID_BAIDU;
    },
    isQuickApp () {
        return cwx.appId === C.APPID_QUICK;
    },
    isAliApp () {
        return cwx.appId === C.APPID_ALIPAY;
    },
    /**
     * 根据response中的extension判断是否跳过强制登录
     */
    skipForceLogin (res) {
        return this.getResponseLogId(res, SKIP_FORCE_LOGIN_KEY) === '1';
    },
    /**
     * 是否是开发版/体验版
     */
    isDevEnv () {
        try {
            const accountInfo = cwx.getAccountInfoSync();
            const envVersion = accountInfo?.miniProgram?.envVersion || '';
            // console.log('当前小程序的版本（开发/体验/正式）：', accountInfo?.miniProgram?.envVersion);
            return envVersion === 'develop' || envVersion === 'trial';
        } catch (e) {
            return false;
        }
    },
    /**
     * 一致率埋点写入CK，
     * @param prevExt: 上一页的trackInfo
     * @param currentExt: 当前页的trackInfo
     * @param data: 前端 track 埋点的 JSON 数据
     */
    toCK (prevExt, currentExt, data) {
        if (!this.isWechat()) return;

        hrequest.hrequest({
            url: model.serveUrl('track'),
            data: {
                data: JSON.stringify(data),
                prev: prevExt,
                current: currentExt
            },
            success () { },
            fail () { }
        });
    },

    /**
     * ab实验通用文件
     * @see http://conf.ctripcorp.com/pages/viewpage.action?pageId=137790917
     * 注意: 依据公共的ab统计流量方案，业务方在调用 cwx.ABTestingManager.valueForKeySync 方法时会发送流量统计，所以不可以在业务逻辑以外的地方获取实验版本，比如 data 默认值、页面生命周期。
     *
     * @param {String} key 实验号 '170511_hod_ocxsn'
     * @param {String} ver 实验版本 A|B|C|D
     * @returns {Boolean}  是否要验证的实验版本
     */
    equalABTestingVer (key, ver = 'B') {
        let result = false;
        let value = '';
        if (wx.getStorageSync(C.HOTEL_AB_MOCK_SWITCH)) { // 走MOCK数据
            value = valueForKeyMock(key);
        } else { // 正常实验分流
            value = cwx.ABTestingManager.valueForKeySync(key);
        }
        if (value && ver) {
            result = value.toLocaleUpperCase() === ver.toLocaleUpperCase();
        }
        return result;
    },
    // 授权提醒
    toSubscribe (tmpIds, onSuccess, onFail) {
        try {
            cwx.mkt.subscribeMsg(tmpIds, (res = {}) => {
                // 用户拒绝授权也会走到该回调函数，文档说，授权结果可根据res[tmpId]判断: 接受-accept，拒绝：reject;实际：拒绝与文档一致，而接受没有res[tmpId]，只有res.templateSubscribeStateInfos
                onSuccess && onSuccess(res);
            }, err => {
                onFail && onFail(err);
            });
        } catch (error) {
            onFail && onFail(error);
        }
    },
    /**
     * 获取缓存中未过期的id数组，不包括当前需要缓存的id
     * 过滤掉过期的id，并且将新的id添加到缓存数组中
     *
     * @param currentId: 当前需要添加到缓存数组中的id
     * @param storageKey: 缓存的key
     * @param expiredDay: 缓存过期时间，单位：天, 默认7天
     * @param num: Number 数组中最多保存的元素数目，默认50
     * @returns {Array} 数组内未过期的id数组，不包含currentId
     */
    getStoragedIds (currentId, storageKey, expiredDay = 7, num = 50) {
        const today = DateUtil.today();
        const result = [];
        let newStorageIds = [];
        const oldStoredIds = storage.getStorage(storageKey) || [];

        // 历史id
        oldStoredIds.forEach(item => {
            const arr = item.split('_');
            const roomId = parseInt(arr[0]);
            if (DateUtil.calDays(arr[1], today) <= expiredDay) {
                result.push(roomId);
                newStorageIds.push(item);
            }
        });

        // 若当前id不在数组中，则加入缓存数组中
        !result.includes(currentId) && newStorageIds.push(`${currentId}_${today}`);
        newStorageIds = newStorageIds.slice(-num);
        storage.setStorage(storageKey, newStorageIds, 24 * expiredDay);
        return result;
    },
    toLogin (page, success, fail) {
        cwx.user.login({
            callback: function (data) {
                if (data && data.ReturnCode === '0') {
                    _.isFunction(success) && success();
                } else {
                    _.isFunction(fail) && fail();
                }
            }
        });

        try {
            page && page.ubtTrace && page.ubtTrace(140873, { sourceid: cwx.scene });
        } catch (err) {
            // ignore
        }
    },
    toHelpGetCoupon (e) {
        const { id: activityId, unitid } = e.currentTarget.dataset;
        if (!activityId || !unitid) return;
        cwx.navigateTo({
            url: `/pages/market/directory/assistNew/index?activityId=${activityId}&assistActivityId=${unitid}`
        });
        return true;
    },
    isIOS () {
        try {
            const platform = cwx.wxSystemInfo?.platform || '';
            return platform.toLowerCase() === 'ios';
        } catch (e) {

        }
    },
    // 获取节点信息
    getBoundingClientRect (id) {
        try {
            return new Promise((resolve, reject) => {
                wx.createSelectorQuery().select(id)
                    .boundingClientRect(rect => {
                        resolve(rect);
                    }).exec();
            });
        } catch (err) {
            // ignore
        }
    },
    /**
     * result: 在原始fill上断开各元素之间的引用
     * 原始fill函数构造引用类型的元素，填充的是值的引用；
     * 因此改变一个元素时，其它所有元素都被改变；
     * @param {*} num 数组长度
     * @param {*} value 数组每个元素的值
     */
    arrayFill (num = 0, value) {
        let i = 0;
        const result = [];
        while (i < num) {
            result.push(util.clone(value));
            i++;
        }

        return result;
    },

    /**
     * 动态切图-https://docs.fx.ctripcorp.com/docs/nephele/how-to/image/process/
     * 图片水印: 由于channel控制(需配置)，切图默认带水印，-_M<watermarkName>_<watermarkPosition>_R<dissolve>
     * @param urlBody {String} - 图片链接body部分
     * @param urlExtend {String} - 默认图片后缀,默认为: .jpg
     * @param type {String} - 切图类型, 包括R-固定宽高; C-固定宽高; W-高固定，宽（原图比例计算），宽固定，高（原图比例计算） （压缩）;Z-高固定，宽（原图比例计算），宽固定，高（原图比例计算）;X-居中抠图;Y-压缩或拉升至指定宽高
     * @param width {Number} - 图片宽度
     * @param height {Number} - 图片高度
     * @param quality {Number} - 图片质量,默认70.值越大，图片越清晰,相应的文件size也越大。有效值：100, 90, 80, 70, 60, 50, 40, 30, 20, 10
     * @param waterMarkName {string} - 水印名，已注册水印：https://docs.fx.ctripcorp.com/docs/nephele/how-to/image/process/registered_watermark
     * @param waterMarkPosition {Number} - 水印位置，https://docs.fx.ctripcorp.com/docs/nephele/how-to/image/process/watermark/image_watermark
     */
    getDynamicImageUrl ({ urlBody, urlExtend = '.jpg', type, width, height, quality = 70, waterMarkName, waterMarkPosition }) {
        // 动态切图域名
        const pictureDomain = 'https://dimg04.c-ctrip.com/images';
        // webp文件后缀名
        const webpPostfix = '.webp';
        // 是否支持webp缓存的值,由于其他端也在使用该缓存key,暂不更改缓存值类型
        const webpSupportStorage = 'true';
        const postfix = cwx.getStorageSync(C.STORAGE_WEBP)?.val === webpSupportStorage ? webpPostfix : urlExtend;
        const pictureDynamicParam = `_${C.PICTURE_CUT_TYPE[type]}_${width}_${height}_Q${quality}`;
        const waterMark = waterMarkName ? (waterMarkPosition ? `_M${waterMarkName}_${waterMarkPosition}` : `_M${waterMarkName}`) : '';
        return `${pictureDomain}${urlBody}${pictureDynamicParam}${waterMark}${postfix}`;
    },
    /**
     * https://tripdocs.nfes.ctripcorp.com/tripdocs/book?dynamicDir=189&docId=5359
     * 监听用户点击隐私弹窗的操作
     * @param rejectCallback，拒绝隐私弹窗后的回调函数
     */
    monitorPrivacyAuthorize (rejectCallback) {
        cwx.Observer.addObserverForKey('privacy_authorize', (res) => {
            const agree = res?.agree;
            if (!agree && rejectCallback) rejectCallback();
            commontrace.clickPrivacyDialog({
                agree
            });
        });
    },
    /**
     * 获取AB实验结果的公共方法（异步）
     * @param ABTestingMap {Object} AB实验映射，包含 实验名key:前端渲染字段name，如：ABTESTING_HTL_XCXJL: 'jlbABResult'，若前端无须渲染，请赋值空字符串
     * @return {Object} 包含 abVersionData 和 abVersionStatus
    */
    async getABTestingResults (ABTestingMap) {
        const abKeys = Object.keys(ABTestingMap).map(item => C[item]);
        const abStatus = Object.values(ABTestingMap);
        const abResults = await this.handleABTestPromises(abKeys);

        const abVersionData = {}; // 放到this.data中，用于前端渲染
        const adVersionStatus = {}; // 放到this.pageStatus中，用于将AB实验结果传给服务

        for (let i = 0; i < abKeys.length; i++) {
            const [key, status, res] = [abKeys[i], abStatus[i], abResults[i]]; // 实验名 前端渲染字段 实验结果

            adVersionStatus[`${key}`] = res; // 传给服务：实验名+版本号 形式
            const isVersionB = res && res.toLocaleUpperCase() === 'B'; // 前端渲染：前端渲染字段 + 是否为新版布尔值 形式
            status && (abVersionData[status] = isVersionB);
        }

        return { abVersionData, adVersionStatus };
    },
    
    async handleABTestPromises (tasks) {
        const taskQueue = [];

        tasks.forEach(task => {
            cwx.ABTestingManager.valueForKeyAsync(task, value => taskQueue.push(Promise.resolve(value)))
        });

        return Promise.all(taskQueue);
    }
};
