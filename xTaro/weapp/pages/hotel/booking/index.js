import { CPage, cwx, _, __global } from '../../../cwx/cwx';
import reqUtil from './requtil.js';
import util from '../common/utils/util.js';
import dateUtil from '../common/utils/date.js';
import storageUtil from '../common/utils/storage.js';
import commonfunc from '../common/commonfunc';
import bookingtrace from '../common/trace/bookingtrace.js';
import pricetrace from '../common/trace/pricetrace.js';
import travelCoupon from '../common/travelcoupon.js';
// eslint-disable-next-line camelcase
import { mpConfig, MEMBER_POINTS_fIRST_ROOM_CHARGE, MEMBER_POINTS_PART_FREE_FEE, MEMBER_POINTS_FREE_CANCEL } from './memberpointsconf.js';
import validateUtil from '../common/utils/validate';
import screenshotstrace from '../common/trace/screenshotstrace';
import huser from '../common/hpage/huser';
import commonrest from '../common/commonrest';
import constConf from '../common/C';
import macaocoupontrace from '../common/trace/macaocoupontrace';
import validateidcard from '../common/utils/validateidcard';
import exposeTraceKey from '../common/trace/exposetracekey.js';

const KEY_REJECT_QUICKCHECKIN = 'P_HOTEL_USER_REJECT_QUICKCHECKIN';
const COLOR_BTN_BLUE = '#006FF6';
const BU_TYPE = 'HTL';
const DISABLE_PLATFORM_DISCOUNT_KEY = '1'; // url上禁用平台促销标识
const DEV_PHONE_SOURCE_KEY = '1694192522441125888'; // 测试环境
const PRD_PHONE_SOURCE_KEY = '1692087727741607936'; // 生产环境
const payResultCode = { // 支付回调的code
    unavailableCode: 205 // 支付前校验未通过
};

const getDefaultContact = () => {
    return {
        ccode: '86',
        phoneNum: '',
        isFocus: false,
        showClose: false,
        errMsg: '',
        showWarning: false
    };
};
const getDefaultEmail = () => {
    return {
        value: '',
        isFocus: false,
        showClose: false,
        errMsg: ''
    };
};
const getDefaultPassenger = (cardInfo = {}) => {
    return {
        fullName: '',
        cardInfo,
        isFocus: false,
        showClose: false,
        errMsg: ''
    };
};
const getDefaultMpinfo = () => {
    return {
        enable: false,
        initialized: false, // 积分信息是否初始化
        staticList: [], // 静态说明权益，目前仅会员专属通道
        plusList: [], // 加号选择类型，目前仅早餐
        checkboxList: [], // 对勾选择类型
        selectedList: [], // 已选权益
        topOrderList: [], // 高优先级权益
        freeCancelInfo: {} // 免费兑取消标签
    };
};

const getDefaultCoupon = () => {
    return {
        showLayer: false, // 展示选优惠券浮层
        isUsedCouponsTab: true, // 浮层当前tab为可用券
        selectedAmountText: '', // 立减xxx
        incentiveText: '', // 已享最大优惠
        amount: 0, // 已经优惠价格
        selectedCoupons: [] // 已选择优惠券
    };
};

CPage({
    pageId: '10650078592',
    checkPerformance: true, // 白屏检测标志位
    autoExpose: 2, // 添加autoExpose属性，并设置其值为 2
    exposeThreshold: 0.3, // 发送曝光埋点相交比例的阈值
    exposeDuration: 500, // 发送曝光埋点停留时长的阈值
    data: {
        isIOS: commonfunc.isIOS(),
        showMask: false, // page-meta防止滚动穿透
        isIphoneX: util.isIPhoneX(),
        showLoading: false,
        showHalfFishBone: false, // 初始进入页面展示鱼骨
        showFishBone: true, // 初始进入页面展示鱼骨
        hotelName: '',
        isOutland: false,
        dateInfo: {
            inDay: dateUtil.today(), // YYYY-MM-dd
            inDayText: '', // x月x日
            inDayDesc: '', // eg.今天
            outDay: dateUtil.tomorrow(),
            outDayText: '',
            outDayDesc: '',
            days: 1,
            selectMorning: false,
            isLongRent: false

        },
        showGetPhoneNumberIcon: false, // 一键唤起手机号
        cancelPolicy: {},
        confirmPolicy: {},
        noticeTips: [], // 订房必读
        showNoticeLayer: false, // 订房必读浮层
        inspireTips: [], // 滚动激励话术
        roomQuantity: 1, // 选中房间数
        quantityArr: [], // 房间数选择渲染用
        showQuantityLayer: false, // 房间数选择浮层
        passengerList: [], // 国内住客，一维数组
        foreignPassengerList: [], // 海外住客，二维数组，按房间号索引
        showForeignName: false, // 是否填海外入住人
        showNameWarning: false, // 创单姓名输入错误提示
        macaoRealNameTip: '', // 澳门券姓名一致提示,
        showNameBlankTips: false, // 初始姓名为空提示
        showGuestTips: false, // 住客说明浮层
        requiredInfo: {}, // 需要住客身份证等证件信息
        showPhoneLoadingMask: false,
        contact: getDefaultContact(),
        email: getDefaultEmail(),
        arrivalInfo: {
            showLayer: false,
            currentIndex: 0,
            userSelectArrivalTime: false, // 是否用户选择
            arrivalTimeList: []
        },
        showGetPhoneBtn: false, // 是否展示一键获取手机号按钮
        phoneNumberParams: { // 一键获取手机号参数设置。https://tripdocs.nfes.ctripcorp.com/tripdocs/book?dynamicDir=189&docId=4698
            limitTriggerCGP: true,
            // sourceKey申请流程：http://conf.ctripcorp.com/pages/viewpage.action?pageId=1779853687
            sourceKey: '', // 生产环境
            disableLoading: false, // 是否使用默认默认loading动画效果，默认效果为：文案前转圈
            btnErrorText: '', // 校验失败，按钮不可用时，展示的提示文案
            limitFrequency: false, // 控制按钮调用频率（单位：秒），单位：秒
            btnReadyText: '', // 按钮处于可使用状态时，展示的提示文案, 默认：手机号快速验证
            btnLoadingText: ' ', // loading 时，按钮展示的提示文案, 默认：loading 中，请稍候
            className: 'phone-btn'
        },
        userLevelInfo: {},
        baseRoomInfo: {},
        subRoomInfo: {},
        showRoomLayer: false,
        showGiftLayer: false,
        showGdprLayer: false,
        priceInfo: {},
        uiInfo: {}, // 服务下发price文案
        showPriceDetailLayer: false, // 展示费用明细浮层
        showDiscountDetail: false, // 展开优惠促销明细
        availCouponLen: 0, // 可用优惠券长度
        availCouponGroups: [], // 可用优惠券组
        availCouponMap: {}, // 每组可用优惠券组对应的优惠券
        unavailableCoupons: {},
        couponData: getDefaultCoupon(),
        mpInfo: getDefaultMpinfo(), // 积分
        showPointsRule: false,
        pointsGetInfo: {},
        invoiceInfo: {},
        customRemark: {}, // 特别要求
        showBedServiceLayer: false,
        quickCheckin: {},
        remarkTips: [], // 底部扣款说明等
        groupVipInfo: {}, // 会员互通
        agreeIdCard: false, // 是否勾选同意证件授权
        agreeGDPR: false, // 是否勾选授权GDPR
        hasAgreeIdCardErr: false,
        isBaidu: commonfunc.isBaidu(),
        isWechat: commonfunc.isWechat(),
        isQuickApp: commonfunc.isQuickApp(),
        isRoomNoTipsShow: false, // 展示房间号说明弹窗
        yanZhuRoomIdList: [''], // 扫码延住房间号列表
        isYanZhuChannel: false, // 根据有无fromscan参数判断是否扫码延住
        yanZhuRoomFocus: false, // 扫码延住房间号模块focus
        newCustomerInfo: {}, // 新客信息
        showForceLogin: false, // 强登标志
        showBottomTips: false, // 是否展示底部温馨提示
        showTravelCouponLayer: false, // 超值旅行家浮层
        superTravellerInfos: [], // 超值旅行家券包信息
        clientCountryCode: { // 用户的证件签发国家/地区信息
            country: '', // 用户选择的国家码
            countryName: '', // 用户选择的国家名字
            errMsg: '',
            showWarning: false
        },
        showRetainPop: false, // 是否显示挽留弹窗
        retainPopInfo: null // 挽留弹窗信息
    },
    pageStatus: {
        showTravelCouponInspireToast: false, // 展示超旅勾选激励
        userSelectSuperTravellerId: [], // 用户选择的超旅券包id
        hasDefaultContact: false,
        hasDefaultNameUsed: false, // 初始化才填充默认姓名，后续使用用户输入
        hasGroupVipInit: false,
        selectedCoupons: [], // 当前所选优惠券，每次重发可订后更新
        reservationCheckParams: { // 与页面渲染无关的可订请求参数
            disableQuickCheckin: false,
            userSelectQuickCheckin: false, // 用户操作闪住后为true
            userArrivalTime: '', // 服务下发担保字段userSelectValue
            lastPage: 1, // 默认1，填写页重发请求3；1:酒店详情页, 2:订单详情页, 3:订单填写页
            sessionData: '' // 透传到下一次可订
        },
        createOrderParams: { // 创单请求参数；页面渲染无关的
            passToNextRequest: '',
            passToCreateOrder: '',
            ignoreRepeatOrder: 0, // 是否忽略重复订单 1=是 0=否
            ignoreTravelConflict: 0, // 是否忽略行程冲突 1=是 0=否
            eid: '' // 联合会员员工码ID
        },
        defaultPhoneNumber: '', // 可订下发的默认手机号
        needTimeConsumeTrace: true,
        isFirstReservation: true, // 非页面间数等改动重发可订
        bookTrackInfo: '', // 填写一致率所需信息
        detailTrackInfo: '', // 详情一致率所需信息
        createOrderSuccess: false, // 创单成功标识
        retainPopStartTime: null, // 挽留弹窗触发计时
        retainPop: false, // 挽留弹窗状态
        bookingABTestResults: {} // 填写页AB实验结果
    },
    async onLoad (options) {
        const ps = this.pageStatus;
        ps.preTime = Date.now();
        this.options = options;
        const { fromscan, eid, third, appscan, disableplatformdiscount } = options;
        // 联合会员延住渠道号标识
        if (fromscan === '1') {
            this.setData({
                isYanZhuChannel: true
            });
        }
        // 闪住初始根据用户上次选择
        const { reservationCheckParams } = ps;
        reservationCheckParams.disableQuickCheckin = !!storageUtil.getStorage(KEY_REJECT_QUICKCHECKIN);
        reservationCheckParams.disablePlatformDiscount = disableplatformdiscount === DISABLE_PLATFORM_DISCOUNT_KEY;

        ps.stayStartTime = new Date().getTime();

        // 初始化联合会员员工码ID
        ps.createOrderParams.eid = eid;

        // 联合会员ordertags是否新增key
        if (appscan === '1') {
            ps.createOrderParams.appscan = appscan;
        }
        ps.isThird = third === '1';

        // 用于执行可订前的读取缓存的逻辑
        this.covertStorageToData();

        // 处理AB实验结果
        await this.handleABResult();

        // 判断预加载并处理
        this.processPreLoadInfo();

        const hasLogin = await huser.checkLoginStatus(true);

        this.setData({
            showGetPhoneBtn: true,
            'phoneNumberParams.sourceKey': __global.env === 'prd' ? PRD_PHONE_SOURCE_KEY : DEV_PHONE_SOURCE_KEY,
            hasLogin
        });
        // 百度静默登录
        this.silentLogin();
        // 页面开关
        this.checkUniversalSwitches();
    },
    /* 将storage数据同步到appData */
    covertStorageToData () {
        const defaultPsgInfo = storageUtil.getStorage(constConf.KEY_DEFAULT_NAME) || {};
        const storageToData = {};
        if (defaultPsgInfo.country) {
            Object.assign(storageToData, {
                'clientCountryCode.country': defaultPsgInfo.country || '',
                'clientCountryCode.countryName': defaultPsgInfo.countryName || ''
            });
        }
        storageToData.agreeGDPR = defaultPsgInfo.agreeGDPR || false;
        this.setData(storageToData);
    },
    /* 页面开关状态 */
    checkUniversalSwitches: function () {
        const keys = [
            'booking_get_phone_number',
            'enableBookSeaPersonalAuth'
        ];
        commonrest.getWechatSoaSwitch(keys, (data) => {
            if (data?.result?.length) {
                const switches = new Map();
                data.result.forEach(item => {
                    switches.set(item.key, item.value);
                });
                this.setData({
                    showGetPhoneNumberIcon: switches.get('booking_get_phone_number') === '1',
                    enableBookSeaPersonalAuth: switches.get('enableBookSeaPersonalAuth') === 'T'
                });
            }
        });
    },
    onUnload () {
        const ps = this.pageStatus;
        const { couponData } = this.data;
        ps.preLoadBookingInterval && clearInterval(ps.preLoadBookingInterval);
        screenshotstrace.removeScreenObserver(this.screenShotTrace);

        this.updateDefaultName();
        const selectedCoupons = couponData?.selectedCoupons || [];
        // 创单成功且使用优惠券时，回退刷新房型列表
        if (this.pageStatus.createOrderSuccess && selectedCoupons.length) {
            this.setReloadRoomListStatus();
        }
    },
    onShow () {
        // 截屏埋点
        screenshotstrace.addScreenObserver(this.screenShotTrace);
        // 判断第三方是否登陆
        this.isThirdLogin();
        // 挽留弹窗开始时间记录
        this.pageStatus.retainPopStartTime = Date.now();
    },
    onHide () {
        // 移除截屏埋点
        screenshotstrace.removeScreenObserver(this.screenShotTrace);
    },
    // 处理AB实验结果
    async handleABResult () {
        const ABTestingMap = {
            ABTESTING_HTL_WLTC: '', // booking_inspire 填写页激励
            ABTESTING_TRAVEL_COUPON: '' // 超值旅行家
        };

        const { abVersionData, adVersionStatus: bookingABTestResults } = await commonfunc.getABTestingResults(ABTestingMap);
        this.pageStatus.bookingABTestResults = bookingABTestResults;
        Object.keys(abVersionData).length && this.setData(abVersionData);
    },
    // 处理挽留弹窗的显示
    handleRetainPop: function (options) {
        // 若有option，则发送挽留弹窗点击埋点
        options && this.clickRetainPopTrace(options);
        this.setData({
            showRetainPop: !this.data.showRetainPop
        });
    },
    // 用来处理 扫码延住的房间号模块的输入
    handleRoomIdInput: function (e) {
        const val = e.detail.value || '';
        const idx = e.currentTarget.dataset.idx;
        const yanZhuRoomIdList = this.data.yanZhuRoomIdList;
        yanZhuRoomIdList[idx] = val;
        this.setData({
            yanZhuRoomIdList
        });

        // 挽留弹窗
        this.pageStatus.retainPop = true;
    },
    handleYanZhuRoomIdFocus: function () {
        this.setData({
            yanZhuRoomFocus: true
        });

        // 挽留弹窗
        this.pageStatus.retainPop = true;
    },
    handleYanZhuRoomIdBlur: function () {
        const yanZhuList = this.data.yanZhuRoomIdList || [];
        const yanZhuRoomIdList = yanZhuList.map(item => {
            if (typeof item === 'string') {
                return item.trim();
            }
            return '';
        });
        this.setData({
            yanZhuRoomFocus: false,
            yanZhuRoomIdList
        });
    },
    // 扫码延住 单间房
    showRoomNoTips: function () {
        const show = this.data.isRoomNoTipsShow;
        this.setData({ isRoomNoTipsShow: !show });
    },
    /**
     * 处理详情页预加载的信息
     * @prevPage 为引用，retry中可获取新值
     */
    processPreLoadInfo () {
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        if (!prevPage || prevPage.pageName !== 'hotelDetail') {
            this.reqReservation(true);

            // 开始bookingCheck埋点
            bookingtrace.timeConsuming(this, {
                pageId: this.pageId,
                source: 'bookingnew_ready_to_load',
                time: Date.now() - this.pageStatus.preTime
            });
            return;
        }
        this.processHeadInfo(prevPage);
        this.processReservationInfo(prevPage);
    },
    /**
     * 处理详情页预加载的头部信息
     */
    processHeadInfo (prevPage) {
        const preLoadHeadInfo = prevPage.pageStatus?.preLoadHeadInfo;
        if (!preLoadHeadInfo) return;
        const { baseRoomInfo } = preLoadHeadInfo;
        this.setData({
            ...preLoadHeadInfo,
            showHalfFishBone: true,
            canToggleLayerBtn: !!baseRoomInfo
        });
    },
    /**
     * 处理详情页预加载的可订信息
     */
    processReservationInfo (prevPage) {
        const afterCompleted = () => {
            const {
                bookingInfo,
                roomId,
                policyTraceData,
                detailTracePrice,
                trackInfo: detailTrackInfo,
                shareFrom,
                isNewVersion,
                user
            } = prevPage.pageStatus?.bookingLoadInfo || {};
            this.pageStatus.policyTraceData = policyTraceData; // 政策一致率埋点
            this.pageStatus.detailTracePrice = detailTracePrice; // 价格一致率埋点
            this.pageStatus.detailTrackInfo = detailTrackInfo || ''; // 记CK需要的一致率数据
            this.pageStatus.shareFrom = shareFrom; // 行程分享来源
            this.pageStatus.isNewVersion = isNewVersion; // 行程分享新老版
            this.pageStatus.user = user; // 加密的主态uid
            if (!bookingInfo || roomId !== +this.options.roomid) {
                this.reqReservation(true);
                return;
            }

            this.pageStatus.fromPreLoad = true;
            this.reservationSuccess(bookingInfo);
            // 清空预加载数据
            prevPage.pageStatus.bookingLoadInfo = {};
        };

        if (hasPreLoadCompleted()) {
            afterCompleted();
        } else {
            let retryTimes = 0;
            this.pageStatus.preLoadBookingInterval = setInterval(() => {
                if (hasPreLoadCompleted() || retryTimes > 50) {
                    clearInterval(this.pageStatus.preLoadBookingInterval);
                    afterCompleted();
                }
                retryTimes++;
            }, 50);
        }

        function hasPreLoadCompleted () {
            return prevPage.pageStatus?.bookingLoadInfo?.isCompeleted;
        };
    },
    handleCustomBack (e) {
        const retainPopStartTime = this.pageStatus.retainPopStartTime;
        const retainPopEndTime = Date.now();
        const stayTime = Math.round((retainPopEndTime - retainPopStartTime) / 1000);
        if (stayTime >= 30 && stayTime <= 80) this.pageStatus.retainPop = true;

        const { retainPopInfo } = this.data;
        const { retainPop } = this.pageStatus;
        if (retainPop && retainPopInfo) {
            // 挽留弹窗曝光埋点
            const { type } = retainPopInfo;
            const retainPopExposeObj = {
                data: { windowType: type },
                ubtKeyName: exposeTraceKey.HOTEL_BOOKING_RETAINPOP_KEY
            };
            retainPopInfo.retainPopExposeObj = retainPopExposeObj;
            this.setData({ retainPopInfo });

            // 处理挽留弹窗显示逻辑
            this.handleRetainPop();
        } else {
            this.navigateBack();
        }
    },
    backDetail (options) {
        // 若有option，则发送挽留弹窗点击埋点
        options && this.clickRetainPopTrace(options);
        cwx.navigateBack();
    },
    setReloadRoomListStatus () {
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2]; // 上一个页面
        // 通知详情页返回后需刷新房型列表
        if (prevPage && prevPage.pageStatus) {
            prevPage.pageStatus.needRefreshRoomList = true;
        }
    },
    /**
     * 可订请求
     * @param {*} fromDetail 是否详情过来首次请求，页面重发可订为false; 未登录=>登录时，第一次发可订为true（初始化请求）
     */
    reqReservation (fromDetail) {
        const {
            indate: checkIn,
            outdate: checkOut,
            hotelid: hotelId,
            roomid: roomId,
            shadowid: shadowId,
            paytype: payType,
            subpaytype: subPayType,
            rateid: rateId = '',
            rateadult: rateAdult,
            checkavid: checkAVId,
            rateplanid: ratePlanId = '',
            passfromdetail: passFromDetail = '',
            starplanetid: starPlanetId = '',
            price_decimal: priceDecimal
        } = this.options;
        const { couponData, roomQuantity, showFishBone, showHalfFishBone, superTravellerInfos } = this.data;
        !showFishBone && !showHalfFishBone && this.setData({
            showLoading: true
        });
        const { disableCoupon, selectedCoupons = [] } = couponData;
        const { reservationCheckParams, isFirstReservation, isThird, bookingABTestResults } = this.pageStatus;
        const userSelectSuperTravellerId = superTravellerInfos?.reduce((a, b) => {
            return b.selected ? a.concat(b.id) : a;
        }, []);
        this.pageStatus.userSelectSuperTravellerId = userSelectSuperTravellerId;
        reservationCheckParams.lastPage = fromDetail ? 1 : 3;

        // 当用户手动主动勾选优惠券时，用户勾选的券信息才不为空：userSelectPromotionId，userSelectCouponCode，userSelectCoupons
        const userSelectedCoupon = disableCoupon === undefined;
        const params = {
            ...reservationCheckParams,
            checkIn,
            checkOut,
            hotelId: +hotelId,
            roomId: +roomId,
            shadowId: +shadowId,
            roomQuantity,
            adult: 1, // 成人数等暂未接入，传入默认值
            children: 0,
            ages: 0,
            payType: +payType,
            subPayType: +subPayType,
            disableCoupon: !!disableCoupon,
            userSelectPromotionId: (userSelectedCoupon ? '' : selectedCoupons[0]?.id) ?? '',
            userSelectCouponCode: (userSelectedCoupon ? '' : selectedCoupons[0]?.code) ?? '',
            userSelectCoupons: userSelectedCoupon ? [] : selectedCoupons.map(coupon => ({ id: coupon.id, code: coupon.code })),
            rateId,
            rateAdult: rateAdult ? +rateAdult : 0,
            checkAVId: checkAVId ? +checkAVId : 0,
            ratePlanId,
            passFromDetail: isFirstReservation ? passFromDetail : '',
            rmsToken: cwx.clientID,
            starPlanetId,
            ABTest: bookingABTestResults,
            thirdBooking: isThird,
            userSelectSuperTravellerId
        };
        priceDecimal !== undefined && (params.isPriceWithDecimal = priceDecimal === '1');
        const reqRewards = this.rewardParamsToReservation() || [];
        reqRewards.length && (params.memberPointRewardCampaigns = reqRewards);
        const reqCountryCode = this.countryParamsToReservation() || [];
        reqCountryCode.length && (params.passengerInfoList = reqCountryCode);
        reqUtil.reservationCheck(params, this.reservationSuccess, this.reservationFail);
    },
    // 与可订相关的权益，暂时只传积分抵房费权益信息
    rewardParamsToReservation () {
        const result = [];
        const mpInfo = this.data.mpInfo;
        const needReqRewards = mpInfo.checkboxList.filter(item => item.needReqReservation && item.isSelected);

        if (needReqRewards.length) {
            needReqRewards.forEach(item => {
                const { prepayCampaignID, tagID, id, costPoints, unitNum } = item;
                result.push({
                    prepayCampaignId: prepayCampaignID,
                    tagId: tagID,
                    rewardId: id,
                    costPoints,
                    useQuantity: unitNum,
                    effectDate: ''
                });
            });
        }
        return result;
    },
    // 调用证件签发国家/地区组件请求可订，传参时需根据房间数 * 每间房可住人数，拆分成多个，若每间房可住人数maxNum不存在，则默认取值为1
    countryParamsToReservation () {
        const { clientCountryCode, roomQuantity = 1, subRoomInfo = {} } = this.data;
        if (!clientCountryCode.country) return;
        const maxNum = subRoomInfo.maxNum || 1;
        const countryParams = {
            clientCountryCode: clientCountryCode.country
        };
        const result = commonfunc.arrayFill(roomQuantity * maxNum, countryParams);
        return result;
    },
    reservationSuccess (res = {}) {
        const pageS = this.pageStatus;
        pageS.bookTrackInfo = res.trackInfo || '';

        const {
            result,
            resultMessage,
            arrivalTimeList = [],
            roomBasicInfo = {},
            promptInfo = {},
            reservationNoticeInfo = {},
            roomAvail = {},
            memberDefault,
            memberInfo = {},
            invoiceInfo = {},
            priceInfo = {},
            uiInfo = {},
            promotionInfo = {},
            hotelSummary = {},
            requiredInfo = {},
            touristTaxTipInfo = {},
            restrictionType = '',
            superTravellerInfos = []
        } = res;
        if (result !== 0) {
            this.disableBooking(res, resultMessage);
            return;
        }

        // 日期后续数据处理用到，先set
        this.setData({
            dateInfo: this.getDateInfo(res)
        });

        this.showReceiveCouponTip();

        // 取返回值
        let { baseRoomInfo = {}, subRoomInfo = {} } = roomBasicInfo;
        subRoomInfo = this.constructSuiteInfo(subRoomInfo);
        const cancelPolicy = subRoomInfo.cancelPolicyInfo || {};
        const { rewardMealInfo, enableRewardMealAndCancel } = subRoomInfo;
        subRoomInfo.isShowReward = enableRewardMealAndCancel || '';
        const {
            confirmPolicy = {},
            remarkTips = [],
            customRemark = {},
            inspireTips = [],
            policyChangeTips = [],
            retainPopInfo = null
        } = promptInfo;
        customRemark.otherRemarkText = '';
        customRemark.remarkText = '';
        const {
            availableCoupons = [],
            unavailableCoupons = [],
            memberPointRewards = [],
            pointsGetInfo = {},
            enableMultipleCoupon,
            isBestSelect, // 是否最大优惠
            newCouponTip // 澳门券用券提示
        } = promotionInfo;

        const { minQuantity, maxQuantity } = roomAvail;
        const isOutland = hotelSummary.countryId !== 1;
        const isHMT = this.isHMT(hotelSummary);
        const showForeignName = isOutland || isHMT;

        // 多间起订时，先校正房间数
        if (this.data.roomQuantity < minQuantity) {
            this.setData({ roomQuantity: minQuantity });
        }
        // 根据bookcheck返回的房间数 重置 yanzhuroomidlist
        if (this.data.isYanZhuChannel) {
            const yanZhuRoomNum = this.data.roomQuantity < minQuantity ? minQuantity : this.data.roomQuantity;
            const yanZhuRoomIdList = this.data.yanZhuRoomIdList.slice(0, yanZhuRoomNum);
            for (let m = 0; m < yanZhuRoomNum; ++m) {
                if (yanZhuRoomIdList[m] === undefined) {
                    yanZhuRoomIdList[m] = '';
                }
            }
            this.setData({ yanZhuRoomIdList });
        }
        const pageId = isOutland ? '10650002392' : '10320654893';
        pageId !== this.pageId && util.exUbtSendPV(this, { pageId });

        // 赋值
        const dataToSet = {
            canToggleLayerBtn: true,
            showLoading: false,
            showFishBone: false,
            showHalfFishBone: false,
            superTravellerInfos: travelCoupon.getTravelCoupons(superTravellerInfos, { hotelId: this.options.hotelid, ubtKey: exposeTraceKey.HOTEL_BOOKING_TRAVEL_COUPON_CARD }),
            isOutland,
            isHMT,
            showForeignName,
            hotelName: hotelSummary.hotelName || '',
            cancelPolicy,
            confirmPolicy,
            quantityArr: this.getQuantityArr(minQuantity, maxQuantity),
            requiredInfo,
            baseRoomInfo,
            subRoomInfo,
            inspireTips,
            invoiceInfo,
            customRemark,
            remarkTips,
            arrivalInfo: this.getArrivalInfo({ arrivalTimeList, policyChangeTips, isHourRoom: subRoomInfo.isHourRoom }),
            noticeTips: this.getNoticeTips(reservationNoticeInfo.reservationNoticeTips),
            topNoticeTips: reservationNoticeInfo.topNoticeTips || [],
            noticeTitle: reservationNoticeInfo.title || '订房必读',
            ...this.groupCoupons(availableCoupons, enableMultipleCoupon),
            unavailableCoupons,
            macaoRealNameTip: newCouponTip,
            couponData: this.getCouponData(availableCoupons, isBestSelect),
            enableMultipleCoupon,
            pointsGetInfo,
            quickCheckin: this.getQuickCheckin(priceInfo.specialPayTypes),
            userLevelInfo: this.getUserLevelInfo(memberInfo),
            newCustomerInfo: this.getNewCustomerInfo(memberInfo, priceInfo.priceItems),
            freeRewardPic: promptInfo?.freeRewardPopInfo?.pictureUrl || '', // 会员享免费兑获取图片
            touristTaxTipInfo,
            showCountryInfo: restrictionType === '1' // restrictionType等于'1'时展示证件签发国家/地区组件
        };

        // 电话号码初始值
        const resDefaultContact = this.getResDefaultContact(memberDefault);
        resDefaultContact && (dataToSet.contact = resDefaultContact);

        // 住客姓名初始值与房间数改变后校正
        const newPassenger = this.correctPassenger({
            showForeignName,
            memberDefault,
            maxPassengerNum: subRoomInfo.maxNum,
            certificate: (requiredInfo.certificateTypes || [])[0]
        });
        newPassenger && Object.assign(dataToSet, newPassenger);

        // 积分初始化
        const initMpInfo = this.getMpInfo({
            uiInfo,
            memberPointRewards,
            memberInfo,
            maxPassengerNum: subRoomInfo.maxNum,
            isShowReward: subRoomInfo.isShowReward,
            rewardMealInfo
        });
        initMpInfo && (dataToSet.mpInfo = initMpInfo);

        // 前端价格计算，pricebar和浮层
        const priceChangeInfo = this.handlePriceChange(uiInfo, priceInfo, initMpInfo);
        dataToSet.priceInfo = this.getPriceInfo(priceChangeInfo.priceInfo);
        dataToSet.uiInfo = priceChangeInfo.uiInfo;
        this.showBottomPriceBarTrace();
        // 会员互通初始化
        const initGroupVip = this.getGroupVipInfo(res);
        initGroupVip && (dataToSet.groupVipInfo = initGroupVip);

        // 挽留弹窗信息处理
        const retainPopInfoRes = retainPopInfo && this.getRetainPopInfo(retainPopInfo);
        retainPopInfoRes && (dataToSet.retainPopInfo = retainPopInfoRes);

        this.setData(dataToSet);

        const loadTime = Date.now() - pageS.preTime;

        this.setPassParams(res);

        // 加载可订完成埋点
        if (pageS.needTimeConsumeTrace) {
            pageS.needTimeConsumeTrace = false;
            bookingtrace.timeConsuming(this, {
                pageId: this.pageId,
                source: pageS.fromPreLoad ? 'bookingnew_preload_finish' : 'bookingnew_load_finish',
                time: loadTime
            });
        }
        const requestId = commonfunc.getResponseLogId(res, 'request-id');
        pageS.requestId = requestId;
        pageS.isFirstReservation = false;
        this.policyTrace(res);
        this.detailPriceTrace(res);
        if (pageS.showTravelCouponInspireToast) {
            cwx.showToast({
                title: '购买超值旅行家，已为您重新计算价格',
                icon: 'none',
                duration: 2000
            });
            pageS.showTravelCouponInspireToast = false;
        }
        cancelPolicy && this.showCancelPolicyTrace();
        newCouponTip && macaocoupontrace.bookingMacaoTipShow(this, {
            page: this.pageId,
            red_font: newCouponTip
        });
        // 房型卡片发送曝光埋点
        const { id: roomId, roomNo } = subRoomInfo;
        const exposureData = {
            roomInfoExposeObj: {
                data: {
                    triggerTime: new Date().getTime(),
                    page: this.pageId,
                    ordload_tracelogid: requestId,
                    roomid: roomId,
                    room_token: roomNo
                },
                ubtKeyName: exposeTraceKey.HOTEL_BOOKING_ROOM_INFO_KEY
            },
            reInfoExposeObj: {
                data: {
                    triggerTime: new Date().getTime(),
                    page: this.pageId
                },
                ubtKeyName: exposeTraceKey.HOTEL_BOOKING_RESERVATION_INFO_KEY
            },
            noticeInfoExposeObj: {
                data: {
                    triggerTime: new Date().getTime(),
                    page: this.pageId
                },
                ubtKeyName: exposeTraceKey.HOTEL_BOOKING_POLICY_KEY
            },
            priceBarExposeObj: {
                data: {
                    triggerTime: new Date().getTime(),
                    page: this.pageId
                },
                ubtKeyName: exposeTraceKey.HOTEL_BOOKING_PRICE_BAR_KEY
            }
        };
        this.sendExposureTrace(exposureData);
    },
    reservationFail (res) {
        this.pageStatus.bookTrackInfo = res.trackInfo || '';
        this.pageStatus.isFirstReservation = false;

        this.detailPriceTrace(res, 'error');
        this.disableBooking(res);
    },
    // 目前只包含勾选权益的积分抵房费，若后续还有其他加号权益，需要重新计算价格
    handlePriceChange (uiInfo = {}, priceInfo = {}, mpInfo) {
        uiInfo = util.clone(uiInfo);
        priceInfo = util.clone(priceInfo);
        mpInfo = util.clone(mpInfo || this.data.mpInfo);
        mpInfo.totalReducePrice = mpInfo.checkboxList.filter(item => item.isSelected).reduce((a, b) => a + b.maxFreePrice, 0);
        if (mpInfo.totalReducePrice) {
            uiInfo.priceMainAmount -= mpInfo.totalReducePrice;
            priceInfo.amount -= mpInfo.totalReducePrice;
        }
        return { uiInfo, priceInfo };
    },
    detailPriceTrace (res, type) {
        // 澳门券 不领券直接订 不发埋点 cancelReceiveCoupons=1
        const { receiveCouponFailed, cancelReceiveCoupons } = this.options;
        if (receiveCouponFailed === '1' || cancelReceiveCoupons === '1') return;
        const ps = this.pageStatus;

        if (!ps.hasSendPriceTrace && ps.detailTracePrice) {
            ps.hasSendPriceTrace = true;
            // 错误埋点
            if (type === 'error') {
                pricetrace.toBookingPage(this, { error: res || {} });
                return;
            }
            pricetrace.toBookingPage(this, { checkResult: res });
        }
    },
    policyTrace (res) {
        const ps = this.pageStatus;
        if (!ps.policyTraceData || ps.hasSentPolicyTrace) return;
        ps.hasSentPolicyTrace = true;
        const extraInfo = {
            user: ps.user,
            sharefrom: ps.shareFrom,
            isNewVersion: ps.isNewVersion
        };
        bookingtrace.policyTrace(this, {
            detailinfo: this.options,
            bookingData: res,
            detailTrackInfo: ps.detailTrackInfo,
            bookTrackInfo: ps.bookTrackInfo,
            extraInfo
        });
    },
    constructSuiteInfo (room) {
        const roomPackageInfo = room.roomPackageInfo || {};
        const packageIdMap = {
            1: '住',
            2: '食',
            3: '享'
        };
        if (roomPackageInfo?.packageInfoList?.length) {
            room.isCalendarSuite = true;
            roomPackageInfo.packageInfoList.forEach(item => { item.icon = packageIdMap[item.type]; });
        }
        return room;
    },
    disableBooking (res, msg) {
        this.setData({
            showLoading: false
        });
        this.policyTrace(res);
        this.detailPriceTrace(res);

        cwx.showModal({
            content: msg || '该房型不可订。',
            showCancel: false,
            success: res => {
                if (res.confirm) {
                    // 更新详情页数据（返回后刷新房型列表用）
                    this.setReloadRoomListStatus();

                    this.backDetail();
                }
            }
        });
    },
    showReceiveCouponTip () {
        const ps = this.pageStatus;
        // 澳门券 不领券直接订 不出弹窗 cancelReceiveCoupons=1
        const { receiveCouponFailed, cancelReceiveCoupons } = this.options;
        if (ps.hasShownCouponTip || receiveCouponFailed === undefined || cancelReceiveCoupons === '1') return; // 只出一次

        ps.hasShownCouponTip = true;
        if (receiveCouponFailed === '1') {
            const self = this;
            cwx.showModal({
                title: '优惠券信息发生变动，重新为您计算价格。',
                confirmText: '继续预订',
                showCancel: true,
                success (res) {
                    if (res) {
                        if (res.cancel) {
                            self.ubtTrace(112948, { action_key: 'xcx_txy_wlq_qx' });
                            cwx.navigateBack();
                        } else if (res.confirm) {
                            self.ubtTrace(112947, { action_key: 'xcx_txy_wlq_jxyd' });
                        }
                    }
                }
            });
        } else if (receiveCouponFailed === '0') {
            cwx.showToast({ title: '领券成功，订单已享最大优惠', icon: 'none', duration: 2000 });
        }
    },
    // 处理挽留弹窗信息
    getRetainPopInfo (res) {
        const { content, subDesc, subContent, colors } = res;

        // 检查挽留弹窗信息完整性，防止展示不完整的弹窗
        if (!content || !colors || !colors.buttons) return null;

        const leftBtn = colors.buttons.filter(item => item.type === 'left')[0]; // 弹窗左边按钮样式
        const rightBtn = colors.buttons.filter(item => item.type === 'right')[0]; // 弹窗右边按钮样式

        const subTitle = subDesc ? {
            text: subDesc,
            color: colors.highlight,
            bkgColor: colors.subBkgColor || ''
        } : null;

        const contentObj = {
            title: subContent,
            color: colors.subTitle
        };

        const leftBtnStyle = {
            color: leftBtn.messageColor,
            borderColor: leftBtn.buttonColor[0]
        };
        const rightBtnStyle = {
            color: rightBtn.messageColor,
            bkgColor: rightBtn.buttonColor.length === 1 ? rightBtn.buttonColor[0] : '',
            bkg: rightBtn.buttonColor.length === 1 ? '' : `linear-gradient(90deg, ${rightBtn.buttonColor[0]} 0%, ${rightBtn.buttonColor[1]} 100%)`
        };

        const title = this.handleContent(content, colors.highlight);

        const result = {
            type: res.type,
            style: res.style || 'default',
            bubble: res.bubble || '',
            bkgUrl: res.pictureUrl,
            title,
            subDesc: subTitle,
            content: contentObj,
            btnStyles: {
                leftBtn: leftBtnStyle,
                rightBtn: rightBtnStyle
            }
        };

        return result;
    },
    /**
     * 挽留弹窗content处理
     * content字符串可能包含花括号{}，括号内的是需要高亮的
     * 形式如：'最高可享{200}元,{立刻}下单'
     * */
    handleContent (content, highlightColor) {
        // 如果无花括号，则直接返回对应数据结构
        if (!content.includes('{')) {
            return [{
                text: content,
                color: ''
            }];
        }

        const reg = /\{(.+?)\}/g;
        const textArr = content.match(reg);

        const result = [];

        let cur = 0;
        textArr.forEach(item => {
            const idx = content.indexOf(item);
            const uContent = content.slice(cur, idx);
            const hContent = item.replace(/\{|}/g, '');

            uContent && result.push({
                text: uContent,
                color: ''
            });

            result.push({
                text: hContent,
                color: highlightColor
            });

            cur = idx + item.length;
        });

        if (cur !== content.length) {
            result.push({
                text: content.slice(cur, content.length),
                color: ''
            });
        }

        return result;
    },
    getDateInfo (res) {
        const { timeZone } = res.hotelSummary || {};
        const tzone = timeZone == null ? 0 : timeZone - 28800; // 相对北京时间的偏移量
        const { checkIn, checkOut, days, isWeeHour } = res.roomAvail || {};
        !this.pageStatus.timeZoneDate && (this.pageStatus.timeZoneDate = new dateUtil.TimeZoneDate(null, null, tzone));
        const { timeZoneDate, isHourroomDate } = this.pageStatus;
        const inDayArr = commonfunc.getDateDisp(checkIn, timeZoneDate, isWeeHour) || [];
        const outDayArr = commonfunc.getDateDisp(isHourroomDate ? checkIn : checkOut, timeZoneDate, isWeeHour) || [];

        return {
            inDay: checkIn,
            inDayText: isWeeHour ? inDayArr[2] : inDayArr[0], // x月x日
            inDayDesc: inDayArr[1], // 今天
            outDay: checkOut,
            outDayText: isWeeHour && (inDayArr[2] === outDayArr[0]) ? '' : outDayArr[0], // 凌晨单离店时间不展示 x月x日
            outDayDesc: outDayArr[1],
            days: isHourroomDate ? 0 : days,
            selectMorning: isWeeHour,
            isLongRent: days > constConf.longRentLimitDay
        };
    },
    getNoticeTips (resNoticeTips = []) {
        const res = [];
        resNoticeTips.forEach(tip => {
            const { subs = [], title = '', category = -1 } = tip;
            const subInfo = [];
            subs.forEach(subItem => {
                subItem?.items?.forEach(item => {
                    subInfo.push(item);
                });
            });
            res.push({
                title,
                category,
                items: subInfo
            });
        });
        return res;
    },
    getResDefaultContact (memberDefault = {}) {
        const pageS = this.pageStatus;
        const {
            mobilePhone = '',
            countryCode = '86'
        } = memberDefault;

        if (pageS.hasDefaultContact) return;

        pageS.hasDefaultContact = true;
        pageS.defaultPhoneNumber = mobilePhone;
        return {
            ...getDefaultContact(),
            phoneNum: mobilePhone,
            ccode: countryCode
        };
    },
    getArrivalInfo ({ arrivalTimeList, policyChangeTips, isHourRoom }) {
        const { arrivalInfo } = this.data;
        const result = {
            ...arrivalInfo,
            arrivalTimeList,
            title: isHourRoom ? '时段选择' : '预计到店时间',
            subTitle: isHourRoom ? '请按照所选时段入住，若有变化，请及时联系酒店' : '',
            policyTips: policyChangeTips.find(it => it.position === 2)?.content || ''
        };
        if (!arrivalInfo.userSelectArrivalTime) {
            const selectedIndex = arrivalTimeList.findIndex(item => item.isSelected);
            result.currentIndex = selectedIndex > -1 ? selectedIndex : 0;
        }

        return result;
    },
    /**
     *
     * @param {*} minQuantity
     * @param {*} maxQuantity
     * @returns 房间数遍历用数组
     */
    getQuantityArr (minQuantity, maxQuantity) {
        const result = [];
        if (!minQuantity || !maxQuantity) return result;

        let i = minQuantity;
        while (i <= maxQuantity) {
            result.push(i);
            i++;
        }

        return result;
    },
    /**
     * 根据groupId区分优惠券组别，相同groupId的优惠券为一组
     * @param availableCoupons: 可用优惠券
     * @param enableMultipleCoupon: 是否允许叠加券
     * couponsGroups: 所有优惠券组
     * couponsMap: 每组对应的优惠券
     * availCouponLen: 可用优惠券的数量
     */
    groupCoupons (availableCoupons = [], enableMultipleCoupon) {
        const availCouponMap = {};
        const availCouponGroups = [];
        availableCoupons.forEach(coupon => {
            const groupId = enableMultipleCoupon ? coupon.groupId : 0;
            coupon.groupId = groupId;
            coupon.isSelect = coupon.isDefaultSelect;
            if (!availCouponMap[groupId]) {
                availCouponMap[groupId] = [];
                availCouponGroups.push(groupId);
            }
            availCouponMap[groupId].push(coupon);
        });

        return { availCouponMap, availCouponGroups, availCouponLen: availableCoupons.length };
    },
    getCouponData (availableCoupons = [], isBestSelect) {
        const couponData = getDefaultCoupon();
        if (!availableCoupons.length) return couponData;

        let amoutSum = 0;
        const selectedCoupons = availableCoupons.filter(coupon => {
            coupon.isDefaultSelect && (amoutSum += coupon.amount);
            return coupon.isDefaultSelect;
        });
        // 记录当前所选优惠券，每次重发可订更新
        this.pageStatus.selectedCoupons = selectedCoupons;

        const { itemType, incentiveText } = selectedCoupons[0] || {};
        return itemType && amoutSum > 0
            ? {
                ...couponData,
                isBestSelect,
                selectedAmountText: `${itemType === 1 ? '立减' : '返'}¥${amoutSum}`,
                incentiveText,
                amount: amoutSum,
                selectedCoupons
            }
            : couponData;
    },
    getPriceInfo (resPrice) {
        const { priceItems = [], guaranteeInfo = {}, additionPriceItems } = resPrice;
        guaranteeInfo.localAmount = +guaranteeInfo.localAmount?.toFixed(2);
        return {
            additionPriceItems: additionPriceItems ?? [],
            amount: resPrice.amount,
            localAmount: +resPrice.localAmount?.toFixed(2),
            realCost: resPrice.realCost,
            avgRealCost: resPrice.avgRealCost,
            localCurrency: resPrice.localCurrency,
            isOnlinePayRoom: resPrice.isOnlinePayRoom,
            dailyDetails: resPrice.dailyDetails || [],
            priceTags: resPrice.priceTags || [],
            deductionItems: getDeductionItems(priceItems),
            ...getBackAmount(priceItems),
            ...getTaxFee(resPrice.taxFee || {}),
            guaranteeInfo: resPrice.guaranteeInfo
        };

        // 减优惠items
        function getDeductionItems (priceItems) {
            return priceItems.filter(it => it.deductionType === 1).map(item => ({
                title: item.title,
                amount: item.amount,
                isCoupon: item.priceKey === 1
            }));
        }
        // 返优惠
        function getBackAmount (priceItems) {
            const result = {
                backAmountAll: 0,
                backItems: []
            };
            priceItems.forEach(item => {
                if (item.deductionType === 2) {
                    const { title, amount } = item;
                    result.backAmountAll += amount;
                    result.backItems.push({
                        title,
                        amount
                    });
                }
            });

            return result;
        }
        // 税费
        function getTaxFee (taxFee) {
            const { groups = [] } = taxFee;
            const extraTaxInfo = groups.find(it => it.type === 2) || {};

            // 是否需要显示税费到店支付模块
            const isShowExtraTax = extraTaxInfo.amount > 0 || (extraTaxInfo.items && extraTaxInfo.items.length) ? true : false;
            
            extraTaxInfo.localAmount = +extraTaxInfo.localAmount?.toFixed(2);
            return {
                taxInPriceDesc: groups.find(it => it.type === 1)?.desc || '',
                isShowExtraTax,
                extraTax: {
                    showDesc: false,
                    ...extraTaxInfo
                },
                extraTaxItems: extraTaxInfo.items || [],
                touristTaxTip: groups.find(it => it.type === 1)?.touristTaxExtraFix || ''
            };
        }
    },
    getQuickCheckin (specialPayTypes) {
        const quickCheckin = {
            isShown: false
        };

        for (const item of specialPayTypes) {
            if (item.payType === 'AfterPay') {
                quickCheckin.isShown = true;
                quickCheckin.isSelected = item.isSelected;
                quickCheckin.specialCopy = item.specialCopy;
                quickCheckin.specialDescription = item.specialDescription;
                break;
            }
        }

        return quickCheckin;
    },
    getUserLevelInfo (memberInfo) {
        const { userLevel, userLevelName, userLevelType } = memberInfo || {};

        return {
            userLevel,
            userLevelName,
            userLevelType
        };
    },
    getNewCustomerInfo (memberInfo = {}, priceItems = []) {
        const { isNewMember = false } = memberInfo;
        const priceItem = priceItems.find(p => p.priceKey === 2 && p.deductionType === 1);
        const deductionAmount = priceItem?.amount || 0;
        return {
            isNewMember,
            deductionAmount
        };
    },
    /**
     * 是否港澳台
     */
    isHMT (hotelSummary) {
        const { cityId, provinceId } = hotelSummary || {};
        return [58, 59].includes(cityId) || provinceId === 53;
    },
    correctPassenger ({ showForeignName, memberDefault, maxPassengerNum, certificate }) {
        const { roomQuantity, passengerList, foreignPassengerList } = this.data;
        const pageS = this.pageStatus;
        const defaultNameStorage = pageS.hasDefaultNameUsed ? {} : (storageUtil.getStorage(constConf.KEY_DEFAULT_NAME) || {});

        if (showForeignName) {
            const pLen = foreignPassengerList.length;
            const pDiff = roomQuantity - pLen;
            if (!pDiff) return;

            if (pDiff < 0) { // 房间数减少
                return {
                    foreignPassengerList: foreignPassengerList.slice(0, roomQuantity)
                };
            }

            // 初始赋值或房间数增加
            const passengerPerRoom = commonfunc.arrayFill(maxPassengerNum, getDefaultForeignPassenger());
            const res = [
                ...foreignPassengerList,
                ...commonfunc.arrayFill(pDiff, passengerPerRoom)
            ];

            if (!pageS.hasDefaultNameUsed && res.length) {
                // 房间1的入住人1使用默认值
                const ffPassenger = res[0][0] || {};
                ffPassenger.firstName.value = defaultNameStorage.enFirstName || memberDefault.enFirstName || '';
                ffPassenger.lastName.value = defaultNameStorage.enLastName || memberDefault.enLastName || '';
                pageS.hasDefaultNameUsed = true;
            }
            return {
                foreignPassengerList: res
            };

            function getDefaultForeignPassenger () {
                return {
                    firstName: {
                        value: '',
                        isFocus: false,
                        showClose: false,
                        errMsg: ''
                    },
                    lastName: {
                        value: '',
                        isFocus: false,
                        showClose: false,
                        errMsg: ''
                    }
                };
            }
        } else {
            const pLen = passengerList.length;
            const pDiff = roomQuantity - pLen;
            if (!pDiff) return;

            if (pDiff < 0) { // 房间数减少
                return {
                    passengerList: passengerList.slice(0, roomQuantity),
                    showNameBlankTips: false
                };
            }

            // 初始赋值或房间数增加
            const cardInfo = (() => {
                const { type, name } = certificate || {};
                return type
                    ? {
                        cardType: type,
                        cardName: name,
                        cardNo: ''
                    }
                    : {};
            })();
            const res = [
                ...passengerList,
                ...commonfunc.arrayFill(pDiff, getDefaultPassenger(cardInfo))
            ];
            let showNameBlankTips = true; // 无默认住客或房间数增加显示
            if (!pageS.hasDefaultNameUsed) {
                const defaultCnName = defaultNameStorage.cnName || memberDefault.cnName || '';
                res[0].fullName = defaultCnName;
                showNameBlankTips = !defaultCnName;
                pageS.hasDefaultNameUsed = true;
            }

            return {
                passengerList: res,
                showNameBlankTips
            };
        }
    },
    /**
     * 更新默认住客姓名缓存
     * 场景：创单和退出页面
     */
    updateDefaultName () {
        try { // 避免影响创单
            const defaultNameStorage = storageUtil.getStorage(constConf.KEY_DEFAULT_NAME) || {};
            const { passengerList, foreignPassengerList } = this.data;
            const cnName = passengerList[0]?.fullName;
            cnName && (defaultNameStorage.cnName = cnName);

            const { enFirstName, enLastName } = (() => {
                const firstRoomFirstName = foreignPassengerList[0] && foreignPassengerList[0][0];
                if (!firstRoomFirstName) return {};

                return {
                    enFirstName: firstRoomFirstName.firstName?.value || '',
                    enLastName: firstRoomFirstName.lastName?.value || ''
                };
            })();

            if (enFirstName && enLastName) {
                defaultNameStorage.enFirstName = enFirstName;
                defaultNameStorage.enLastName = enLastName;
            }

            storageUtil.setStorage(constConf.KEY_DEFAULT_NAME, defaultNameStorage, 24 * 30);
        } catch (error) {
            // console.log(error);
        }
    },

    /**
     * 透传创单和可订参数
     */
    setPassParams (res) {
        const { passToCreateOrder, passToNextRequest, sessionData } = res;

        const { createOrderParams, reservationCheckParams } = this.pageStatus;
        createOrderParams.passToCreateOrder = passToCreateOrder;
        createOrderParams.passToNextRequest = passToNextRequest;
        reservationCheckParams.sessionData = sessionData;
    },

    toggleRoomLayer (e) {
        if (!this.data.canToggleLayerBtn) return;
        this.setData({ showRoomLayer: !this.data.showRoomLayer }, !this.data.showRoomLayer && this.clickRoomLayerTrace());
    },
    toggleNoticeLayer (e) {
        const noticeLayerPos = e.currentTarget.dataset.id || '';
        this.setData({
            showNoticeLayer: !this.data.showNoticeLayer,
            showBottomTips: noticeLayerPos === 'bottom-tips'
        }, !this.data.showNoticeLayer && this.clickNoticeLayerTrace());
    },
    toggleGdprLayer (e) {
        this.setData({
            showGdprLayer: !this.data.showGdprLayer
        });
    },
    toggleGdprAgree (e, callback) {
        this.setData({
            agreeGDPR: !this.data.agreeGDPR,
            showGdprLayer: false
        }, () => {
            const defaultNameStorage = storageUtil.getStorage(constConf.KEY_DEFAULT_NAME) || {};
            defaultNameStorage.agreeGDPR = this.data.agreeGDPR;
            storageUtil.setStorage(constConf.KEY_DEFAULT_NAME, defaultNameStorage, 24 * 30);
            if (callback && typeof callback === 'function') {
                callback();
            }
        });
    },
    toggleGdprAgreeAndPay (e) {
        this.toggleGdprAgree(e, this.toCreateOrder);
    },

    /**
     * 房间数操作
     */
    toggleQuantityLayer (e) {
        this.setData({
            showMask: !this.data.showQuantityLayer,
            showQuantityLayer: !this.data.showQuantityLayer
        });
    },
    roomMinus (e) {
        const { roomQuantity, quantityArr } = this.data;
        const minQuantity = quantityArr[0] || 1;
        if (roomQuantity <= minQuantity) return;

        this.setRoomQuantity(roomQuantity - 1);
    },
    roomPlus (e) {
        const { roomQuantity } = this.data;
        if (roomQuantity >= this.data.quantityArr.length) return;

        this.setRoomQuantity(roomQuantity + 1);
    },
    selectQuantity (e) {
        const { quantity: selectQuan } = e.currentTarget.dataset;
        const { roomQuantity } = this.data;
        if (selectQuan === roomQuantity) return;

        this.setRoomQuantity(selectQuan);
    },
    setRoomQuantity (selectQuan) {
        this.setData({
            mpInfo: getDefaultMpinfo(), // 房间数改变，重置积分信息
            roomQuantity: selectQuan,
            showMask: false,
            showQuantityLayer: false
        }, this.reqReservation);
    },

    /**
     * 住客姓名
     */
    toggleGuestTips (e) {
        this.setData({ showGuestTips: !this.data.showGuestTips });
    },
    nameInput (e) {
        const { value } = e.detail;
        const { idx } = e.currentTarget.dataset;

        this.setData({
            [`passengerList[${idx}]`]: {
                ...this.data.passengerList[idx],
                fullName: value,
                showClose: !!value
            }
        });
    },
    nameFocus (e) {
        const { idx, value } = e.currentTarget.dataset;
        this.setData({
            [`passengerList[${idx}]`]: {
                ...this.data.passengerList[idx],
                isFocus: true,
                errMsg: '',
                showClose: !!value
            },
            showNameWarning: false,
            showNameBlankTips: false
        });

        // 挽留弹窗
        this.pageStatus.retainPop = true;

        if (this.data.isYanZhuChannel && this.data.roomQuantity > 1) {
            this.handleYanZhuRoomIdFocus();
        }
        this.clickNameInputTrace();
    },
    nameBlur (e) {
        const { value = '' } = e.detail;
        const name = value.trim();
        const { idx } = e.currentTarget.dataset;

        this.setData({
            [`passengerList[${idx}]`]: {
                ...this.data.passengerList[idx],
                showClose: false,
                isFocus: false,
                fullName: name,
                errMsg: this.getNameErrMsg(name)
            }
        });
        if (this.data.isYanZhuChannel && this.data.roomQuantity > 1) {
            this.handleYanZhuRoomIdBlur();
        }
    },
    /**
     *  创单校验所有中文姓名和证件信息
     *  @return resErr 第一个有误的住客提示
     */
    checkAllCnPassenger () {
        let resErr = '';
        const { passengerList } = this.data;
        passengerList.forEach(item => {
            const { fullName, cardInfo } = item;
            const errMsg = this.getNameErrMsg(fullName);
            item.errMsg = errMsg;

            // 证件校验
            const { cardType, cardNo } = cardInfo || {};
            const cardErrMsg = cardType ? this.getCardErrMsg(cardType, cardNo) : '';
            cardInfo.errMsg = cardErrMsg;

            // 保证resErr不被后续校验通过的住客信息覆盖
            !resErr && (resErr = errMsg || cardErrMsg);
        });

        this.setData({
            passengerList,
            showNameWarning: !!resErr
        });

        return resErr;
    },
    getNameErrMsg (name) {
        if (!name) return '请输入住客姓名';
        const _name = name.replaceAll('·', '');
        const isChinese = validateUtil.isChinese(_name);
        const isEnglish = validateUtil.isEnglish(_name);
        const isEnglishName = validateUtil.isEnglishName(_name);

        if (!isChinese && !isEnglish) return '请输入中文姓名或者英文姓名，不能包含数字、特殊字符、空格';
        if (isChinese && _name.length < 2) return '中文姓名不能少于2个汉字';
        if (isEnglish && !isEnglishName) return '英文姓和名用“/”隔开，如Michael/Jordan';
        return '';
    },

    /**
     * 住客姓名海外
     */
    lastNameInput (e) {
        const { value } = e.detail;
        const { idxm, idxn } = e.currentTarget.dataset;
        const currentP = this.data.foreignPassengerList[idxm][idxn];
        currentP.lastName = {
            ...currentP.lastName,
            value,
            showClose: !!value
        };

        this.setData({
            [`foreignPassengerList[${idxm}][${idxn}]`]: currentP
        });
    },
    lastNameFocus (e) {
        const { idxm, idxn, value } = e.currentTarget.dataset;
        const currentP = this.data.foreignPassengerList[idxm][idxn];
        currentP.lastName = {
            ...currentP.lastName,
            isFocus: true,
            errMsg: '',
            showClose: !!value
        };

        this.setData({
            [`foreignPassengerList[${idxm}][${idxn}]`]: currentP
        });

        // 挽留弹窗
        this.pageStatus.retainPop = true;

        this.clickNameInputTrace();
    },
    lastNameBlur (e) {
        const { value = '' } = e.detail;
        const { idxm, idxn } = e.currentTarget.dataset;
        const { foreignPassengerList } = this.data;
        if (!foreignPassengerList[idxm] || !foreignPassengerList[idxm][idxn]) return;

        const currentP = foreignPassengerList[idxm][idxn];
        currentP.lastName = {
            ...currentP.lastName,
            showClose: false,
            isFocus: false,
            value: value.trim(),
            errMsg: this.getEnNameErrMsg(value.trim(), '姓')
        };

        this.setData({
            foreignPassengerList: this.removeForeignPassengerErr(foreignPassengerList)
        });
    },
    firstNameInput (e) {
        const { value } = e.detail;
        const { idxm, idxn } = e.currentTarget.dataset;
        const currentP = this.data.foreignPassengerList[idxm][idxn];
        currentP.firstName = {
            ...currentP.firstName,
            value,
            showClose: !!value
        };

        this.setData({
            [`foreignPassengerList[${idxm}][${idxn}]`]: currentP
        });
    },
    firstNameFocus (e) {
        const { idxm, idxn, value } = e.currentTarget.dataset;
        const currentP = this.data.foreignPassengerList[idxm][idxn];
        currentP.firstName = {
            ...currentP.firstName,
            isFocus: true,
            errMsg: '',
            showClose: !!value
        };

        this.setData({
            [`foreignPassengerList[${idxm}][${idxn}]`]: currentP
        });

        // 挽留弹窗
        this.pageStatus.retainPop = true;
    },
    firstNameBlur (e) {
        const { value = '' } = e.detail;
        const { idxm, idxn } = e.currentTarget.dataset;
        const { foreignPassengerList } = this.data;
        if (!foreignPassengerList[idxm] || !foreignPassengerList[idxm][idxn]) return;

        const currentP = foreignPassengerList[idxm][idxn];
        currentP.firstName = {
            ...currentP.firstName,
            showClose: false,
            isFocus: false,
            value: value.trim(),
            errMsg: this.getEnNameErrMsg(value.trim(), '名')
        };

        this.setData({
            foreignPassengerList: this.removeForeignPassengerErr(foreignPassengerList)
        });
    },
    getEnNameErrMsg (name, type) {
        if (!name) return `请输入${type}(拼音或英文)`;
        const _name = name.replaceAll(/\s|-|\./g, '');
        const isEnglish = validateUtil.isEnglish(_name);
        if (!isEnglish) return '英文姓名不能包含中文、数字或特殊字符';
        return '';
    },
    /**
     *  创单校验所有房间英文姓名
     *  @return hasErr
     */
    checkEnPassenger () {
        let resErr = '';
        const { foreignPassengerList } = this.data;
        foreignPassengerList.forEach(room => {
            // 一个房间只需校验一位姓名, 允许其他姓名空，不允许输入有误
            let hasNameValid = false;
            let hasInputErr = false;
            room.forEach(item => {
                const { firstName = {}, lastName = {} } = item;
                const errMsgfirst = this.getEnNameErrMsg(firstName.value, '名');
                const errMsgLast = this.getEnNameErrMsg(lastName.value, '姓');
                if (!errMsgfirst && !errMsgLast) { // 有姓名校验通过
                    hasNameValid = true;
                }

                // 有输入，校验不通过
                const hasInput = firstName.value || lastName.value;
                if (hasInput && (errMsgfirst || errMsgLast)) {
                    hasInputErr = true;
                }

                firstName.errMsg = errMsgfirst;
                lastName.errMsg = errMsgLast;
            });
            if (!hasNameValid || hasInputErr) { resErr = '英文姓名填写有误'; };
        });

        this.setData({
            foreignPassengerList: this.removeForeignPassengerErr(foreignPassengerList)
        });
        return resErr;
    },
    removeForeignPassengerErr (foreignPassengerList) {
        foreignPassengerList.forEach(room => {
            const hasNameValid = room.some(item => {
                const { firstName = {}, lastName = {} } = item;
                const errMsgfirst = this.getEnNameErrMsg(firstName.value, '名');
                const errMsgLast = this.getEnNameErrMsg(lastName.value, '姓');
                return !errMsgfirst && !errMsgLast; // 有姓名校验通过
                // if (!errMsgfirst && !errMsgLast) { // 有姓名校验通过
                //     return true;
                // }
            });

            hasNameValid && room.forEach(item => {
                const { firstName = {}, lastName = {} } = item;
                const hasInput = firstName.value || lastName.value;
                if (!hasInput) { // 未输入不用校验
                    item.firstName.errMsg = '';
                    item.lastName.errMsg = '';
                }
            });
        });

        return foreignPassengerList;
    },

    /**
     * 调用常旅组件
     * @param {*} e
     */
    choosePassenger (e) {
        if (!this.data.hasLogin) {
            this.toLogin();
            return;
        }
        const { idxm } = e.currentTarget.dataset;
        const { showForeignName, passengerList = [], foreignPassengerList = [], contact } = this.data;
        // 最大可选常旅数
        const maxCount = showForeignName ? foreignPassengerList[idxm].length : passengerList.length;

        // 已经选择的常旅信息，暂未支持
        const choosedPassengers = [];

        // 选择一个常旅对象时回调函数，判断该旅客是否满足当前业务证件需求
        const filterFunc = p => {
            if (showForeignName) { // 原booking逻辑
                if (p.ENFirstName === '' || p.ENLastName === '') {
                    return [false, 1003, 0];
                }
            }
        };

        // 原booking逻辑 http://conf.ctripcorp.com/pages/viewpage.action?pageId=135634639
        const displayItems = showForeignName ? [[8, 0], [9, 1]] : [[8, 1], [9, 0]];

        const dataToSet = {};

        cwx.passenger.choosePassenger(data => { // 选完后的回调
            if (showForeignName) {
                let showErrToast = true;
                foreignPassengerList[idxm].forEach((pItem, i) => {
                    const dataItem = data[i];
                    if (!dataItem) {
                        pItem.firstName.value = '';
                        pItem.lastName.value = '';
                    } else {
                        const { ENLastName, ENFirstName, MobilePhone } = dataItem;
                        pItem.psgPhoneNumber = MobilePhone;
                        if (ENFirstName) {
                            pItem.firstName.value = ENFirstName;
                            pItem.firstName.errMsg = '';
                        }
                        if (ENLastName) {
                            pItem.lastName.value = ENLastName;
                            pItem.lastName.errMsg = '';
                        }

                        if (ENFirstName && ENLastName) {
                            showErrToast = false;
                        }
                    }
                });

                if (showErrToast) {
                    cwx.showToast({
                        title: '请输入拼音或英文，不可包含数字或特殊字符',
                        icon: 'none',
                        duration: 3000
                    });
                }

                this.setData({
                    [`foreignPassengerList[${idxm}]`]: foreignPassengerList[idxm]
                });
            } else {
                passengerList.forEach((pItem, i) => {
                    const dataItem = data[i];
                    if (!dataItem) {
                        pItem.fullName = '';
                    } else {
                        const { CNName, ENLastName, ENFirstName, MobilePhone } = dataItem;
                        pItem.fullName = CNName || `${ENLastName}/${ENFirstName}`;
                        pItem.errMsg = '';
                        pItem.psgPhoneNumber = MobilePhone;
                    }
                });
            }
            const firstForeignPsg = foreignPassengerList[0]?.[0] || {};
            const { psgPhoneNumber } = (showForeignName ? firstForeignPsg : passengerList[0]) || {};

            const psgName = showForeignName ? (firstForeignPsg.lastName.value + '/' + firstForeignPsg.firstName.value) : passengerList[0]?.fullName;
            dataToSet.psgReplaceText = psgPhoneNumber + ' ' + psgName;
            dataToSet.isShowReplace = psgPhoneNumber !== contact.phoneNum;
            dataToSet.passengerList = passengerList;
            if (psgPhoneNumber !== contact.phoneNum) {
                dataToSet.replaceText = psgPhoneNumber ? '替换成' : '请注意是否用此号码接收订单信息';
                dataToSet.isReplace = !!psgPhoneNumber;
            }
            this.setData(dataToSet);
        }, maxCount, choosedPassengers, filterFunc, displayItems);
    },
    // 关闭按钮
    closeReplaceContainer (e) {
        this.setData({
            isShowReplace: false
        });
    },

    // 更换手机号
    replacePsgPhone (e) {
        const { showForeignName, foreignPassengerList = [], passengerList = [] } = this.data;
        const phoneNum = showForeignName ? foreignPassengerList[0]?.[0]?.psgPhoneNumber : passengerList[0]?.psgPhoneNumber;
        this.setData({
            'contact.phoneNum': phoneNum,
            isShowReplace: false,
            'contact.errMsg': ''
        });
    },

    /**
     * 证件信息
     */
    cardTypeSelect (e) {
        const { certificateTypes = [] } = this.data.requiredInfo || {};
        if (certificateTypes.length < 2) return;

        const { index } = e.currentTarget.dataset;
        const curPassenger = this.data.passengerList[index] || {};
        const { cardType } = curPassenger.cardInfo || {};

        const itemList = certificateTypes.map(item => item.name);
        wx.showActionSheet({
            itemList,
            success: res => {
                if (res.cancel) return;

                const { tapIndex } = res;
                const { type, name } = certificateTypes[tapIndex];
                if (cardType === type) return;

                this.setData({
                    [`passengerList[${index}].cardInfo`]: {
                        cardType: type,
                        cardName: name,
                        cardNo: ''
                    }
                });
            }
        });
    },
    cardInput (e) {
        const { value } = e.detail;
        const { index } = e.currentTarget.dataset;
        const curPassenger = this.data.passengerList[index];

        this.setData({
            [`passengerList[${index}].cardInfo`]: {
                ...curPassenger.cardInfo,
                cardNo: value
            }
        });
    },
    cardFocus (e) {
        const { index } = e.currentTarget.dataset;
        const curPassenger = this.data.passengerList[index];

        this.setData({
            [`passengerList[${index}]`]: {
                ...curPassenger,
                cardInfo: {
                    ...curPassenger.cardInfo,
                    errMsg: ''
                },
                isFocus: true
            },
            showNameWarning: false
        });

        // 挽留弹窗
        this.pageStatus.retainPop = true;
    },
    cardBlur (e) {
        const { value } = e.detail;
        const { index, type } = e.currentTarget.dataset;
        const curPassenger = this.data.passengerList[index];

        this.setData({
            [`passengerList[${index}]`]: {
                ...curPassenger,
                cardInfo: {
                    ...curPassenger.cardInfo,
                    errMsg: this.getCardErrMsg(+type, value)
                },
                isFocus: false
            }
        });
    },
    /**
     * 检查证件有效性
     * @param {string} type 证件类型
     * @param {string} value 证件号码
     * @return {string} errMsg 错误消息
     */
    getCardErrMsg (type, value) {
        if (!value) return '请输入证件号';

        let noError = true;
        if (type === 1) { // 身份证
            return validateidcard.isValidIdentityCodeByTips(value); // app的身份证匹配规则
            // noError = validateUtil.isIdCard(value);
        } else {
            const len = value.length;
            noError = (len >= 5 && len <= 15) && validateUtil.isAlphanumericStr(value);
        }
        if (!noError) {
            return '请输入正确的证件号';
        }

        return '';
    },
    toggleIdCardAuth (e) {
        this.setData({
            agreeIdCard: !this.data.agreeIdCard,
            hasAgreeIdCardErr: false
        });
    },
    toAuthorizationText: function () {
        cwx.component.cwebview({
            data: {
                url: 'https://pages.c-ctrip.com/hotels/h5/pages/Rules/ctripAuthorization.html'
            }
        });
    },

    /**
     * 从区号选择控件选择区号，回显
     */
    selectPhonecode (e) {
        const { contact } = this.data;
        cwx.component.areas({
            data: { selectedCode: contact.ccode },
            immediateCallback: res => {
                this.setData({
                    'contact.ccode': '' + res.code
                });
            }
        });
    },
    phoneFocus (e) {
        const { value } = e.currentTarget.dataset;
        this.setData({
            contact: {
                ...this.data.contact,
                isFocus: true,
                errMsg: '',
                showWarning: false,
                showClose: !!value
            }
        });

        // 挽留弹窗
        this.pageStatus.retainPop = true;
    },
    phoneInput (e) {
        const { value } = e.detail;

        this.setData({
            contact: {
                ...this.data.contact,
                phoneNum: value,
                showClose: !!value
            }
        });
    },
    /**
     * 页面失焦与创单均触发
     * @returns errMsg 用于创单校验和埋点
     */
    phoneBlur (e) {
        let { ccode, phoneNum } = this.data.contact;
        phoneNum = phoneNum.trim();
        const contactNew = {
            ...this.data.contact,
            showClose: false,
            isFocus: false,
            phoneNum
        };

        if (!phoneNum) { // 空
            contactNew.errMsg = '请输入手机号码';
        } else if (!validateUtil.isPhone(phoneNum, ccode)) { // 校验不通过
            contactNew.errMsg = '请输入正确的手机号码';
        } else { // 正确输入
            contactNew.errMsg = '';
        }

        // 创单才出背景warning提示
        if (!e && contactNew.errMsg) {
            contactNew.showWarning = true;
        }

        bookingtrace.phoneNumberClick({
            pageId: this.pageId,
            currentNumber: phoneNum,
            originNumber: this.pageStatus.defaultPhoneNumber
        });

        this.setData({
            contact: contactNew
        });
        return contactNew.errMsg;
    },
    phoneClear () {
        this.setData({
            contact: {
                ...this.data.contact,
                phoneNum: '',
                isFocus: true,
                showClose: false,
                errMsg: ''
            }
        });
    },
    phoneAuthTap (e) {
        this.pageStatus.userBindPhoneType = e.currentTarget.dataset.type;
        this.setData({
            showPhoneLoadingMask: true
        });
    },
    hidePhoneLoadingMask (e) {
        setTimeout(() => {
            this.setData({ showPhoneLoadingMask: false });
        }, 1000);
    },

    /**
     * email
     */
    emailFocus (e) {
        const { value } = e.currentTarget.dataset;
        this.setData({
            email: {
                ...this.data.email,
                isFocus: true,
                errMsg: '',
                showClose: !!value
            }
        });

        // 挽留弹窗
        this.pageStatus.retainPop = true;
    },
    emailInput (e) {
        const { value } = e.detail;
        this.setData({
            email: {
                ...this.data.email,
                value,
                showClose: !!value
            }
        });
    },
    emailBlur () {
        const { value = '' } = this.data.email;
        const email = value.trim();

        const emailNew = {
            ...this.data.email,
            showClose: false,
            isFocus: false,
            value: email
        };

        // 空
        if (!email) {
            emailNew.errMsg = '请输入Email地址';
        } else if (!validateUtil.isEmail(email)) { // 校验不通过
            emailNew.errMsg = '请输入正确的Email地址';
        } else { // 正确输入
            emailNew.errMsg = '';
        }

        this.setData({
            email: emailNew
        });
        return emailNew.errMsg;
    },
    emailClear (e) {
        this.setData({
            email: {
                ...getDefaultEmail(),
                isFocus: true
            }
        });
    },

    /**
     * 到店时间浮层
     */
    showArrivalLayer () {
        this.setData({ 'arrivalInfo.showLayer': true });
        this.clickArrivalLayerTrace();
    },
    closeArrivalLayer () {
        this.setData({ 'arrivalInfo.showLayer': false });
    },
    selectArrivalTime (e) {
        const { index } = e.currentTarget.dataset;
        const { currentIndex, arrivalTimeList } = this.data.arrivalInfo || {};
        if (currentIndex === index) {
            this.closeArrivalLayer();
            return;
        }

        this.setData({
            arrivalInfo: {
                ...this.data.arrivalInfo,
                currentIndex: index,
                userSelectArrivalTime: true,
                showLayer: false
            }
        });

        // 担保id变化，重发可订
        const { guaranteeId: currentId } = arrivalTimeList[currentIndex];
        const { guaranteeId: newId, userSelectValue } = arrivalTimeList[index];
        if (currentId !== newId) {
            const { reservationCheckParams } = this.pageStatus;
            reservationCheckParams.userArrivalTime = userSelectValue;

            this.reqReservation();
        }
    },
    bedMark (e) {
        const { id } = e.currentTarget.dataset;
        const { bedId, outerRemarkList = [] } = this.data.customRemark;
        if (bedId === id) { // 反选
            this.setData({
                'customRemark.bedId': '',
                'customRemark.bedConfirmDesc': ''
            });
        } else {
            const bedConfirmDesc = outerRemarkList.find(item => item.remarkId === id)?.justifyConfirmDesc;
            this.setData({
                'customRemark.bedId': id,
                'customRemark.bedConfirmDesc': bedConfirmDesc || ''
            });
        }
    },
    chooseBedRadio (e) {
        const { value } = e?.detail || {};
        this.setData({
            'customRemark.chooseComplexBedIdx': value
        });
    },

    toggleGiftLayer (e) {
        this.setData({
            showMask: !this.data.showGiftLayer,
            showGiftLayer: !this.data.showGiftLayer
        });
    },

    /**
     * 优惠促销
     */
    toggleDiscountDetail (e) {
        this.setData({ showDiscountDetail: !this.data.showDiscountDetail });
    },
    toggleCouponLayer () {
        const { couponData } = this.data;
        const ps = this.pageStatus;
        // 关闭浮层&&优惠券选择改变时重发可订
        if (couponData.showLayer && !_.isEqual(couponData.selectedCoupons, ps.selectedCoupons)) {
            this.reqReservation();
        }
        this.setData({
            showMask: !couponData.showLayer,
            'couponData.showLayer': !couponData.showLayer
        });
        const exposureData = {
            couponExposeObj: {
                data: {
                    triggerTime: new Date().getTime(),
                    page: this.pageId
                },
                ubtKeyName: exposeTraceKey.HOTEL_BOOKING_COUPON_KEY
            }
        };
        this.sendExposureTrace(exposureData);
    },
    showCouponLayer (e) {
        this.toggleCouponLayer();
    },
    closeCouponLayer (e) {
        this.toggleCouponLayer();
    },
    changeCouponLayer (e) {
        const { type } = e.currentTarget.dataset;
        const showCanUse = this.data.couponData.isUsedCouponsTab;
        if (type === 'canUse') {
            if (!showCanUse) {
                this.setData({
                    'couponData.isUsedCouponsTab': true
                });
            }
        } else if (type === 'disUse') {
            if (showCanUse) {
                this.setData({
                    'couponData.isUsedCouponsTab': false
                });
            }
        }
    },
    couponSelect (e) {
        const { idx, groupid, current } = e.currentTarget.dataset;
        const { availCouponMap = {}, couponData } = this.data;
        const groupCoupons = availCouponMap[groupid] || [];
        // 同组优惠券互斥
        groupCoupons.forEach((coupon, index) => {
            coupon.isSelect = false;
            idx === index && (coupon.isSelect = !current);
        });
        const selectedCoupons = _.flatten(Object.values(availCouponMap)).filter(coupon => coupon.isSelect);
        this.setData({
            availCouponMap,
            couponData: {
                ...couponData,
                showLayer: true, // 关闭浮层时才重发可订
                selectedCoupons,
                disableCoupon: !selectedCoupons.length
            }
        });
    },

    /**
     * 积分
     * isShowReward: 免费兑早餐和取消 的开关，控制头部标签文案(免费兑·)+头部动画+房型浮层样式
     */
    getMpInfo ({ memberPointRewards, memberInfo, maxPassengerNum, isShowReward, rewardMealInfo, uiInfo }) {
        const mp = util.clone(this.data.mpInfo);
        if (mp.initialized) return;
        const { dateInfo, roomQuantity } = this.data;
        let { totalAvailablePoint = 0 } = memberInfo || {};
        for (let i = 0, len = memberPointRewards.length; i < len; i++) {
            const item = memberPointRewards[i];
            const {
                id,
                costPoints,
                priceValueSummary,
                freeRewards = [],
                count,
                isSelected,
                extensions = [],
                prepayCampaignID,
                tagID
            } = item;
            let { maxLimit } = item;

            // 填写页展示会员享免费兑取消标签
            if (isShowReward && item.id === MEMBER_POINTS_FREE_CANCEL) {
                mp.freeCancelInfo = {
                    isShowFreeCancel: isSelected && !!item.priceValueSummary,
                    priceValueSummary
                };
            }

            // 首晚房费 todo
            // eslint-disable-next-line camelcase
            if (+id === MEMBER_POINTS_fIRST_ROOM_CHARGE) {
                continue;
            }

            const mpIdx = `mp${id}`;
            const mpConf = mpConfig[mpIdx] || {};
            if (!mpConf.title) continue; // 未接入的权益

            // 静态说明权益，目前仅会员专属通道
            if (mpConf.staticTitle) {
                const { staticTitle, desc } = mpConf;
                mp.staticList.push({
                    title: mpConf.title,
                    staticTitle,
                    desc
                });
                continue;
            }

            const rewardUseFirst = freeRewards[0] || {};
            // -1即不限次数
            const freeTimes = rewardUseFirst.quantity === -1
                ? -1
                : freeRewards.map(it => it.remainTimes).reduce((sum, cur) => sum + cur, 0);
            const freeTimesDesc = freeTimes > 0 ? `(账户余${freeTimes}份)` : '';
            const hotelRemainsDesc = count < 10 ? `酒店仅剩${count}份` : '';
            const hasEnoughPoints = totalAvailablePoint >= costPoints;
            const showPointsPart = memberInfo.totalAvailablePoint >= costPoints; // 用户原始积分是否满足积分兑xx，满足则展示积分兑xx模块

            // 标签与选中权益信息处理
            let [freeTitle, freeTag, remainingEnoughPoints] = ['', '', false];
            const zeroPoints = costPoints === 0; // 积分为0
            if (mpConf.plusType === 1 ? zeroPoints && freeTimes : zeroPoints) {
                freeTitle = '本单送1份';
                freeTag = '酒店赠送';
                remainingEnoughPoints = hasEnoughPoints; // 兑换积分抵房费等权益后的剩余积分，是否足够用于积分兑XX
            } else if (freeTimes === -1) {
                freeTitle = '本单送1份';
                freeTag = rewardUseFirst.tagName;
            } else {
                freeTitle = freeTimes ? '免费兑换' : '';
                freeTag = rewardUseFirst.tagName;
                remainingEnoughPoints = hasEnoughPoints; // 兑换积分抵房费等权益后的剩余积分，是否足够用于积分兑XX
            }
            isSelected && mp.selectedList.push({
                name: `兑换 · ${mpConf.title}`,
                tag: freeTag || '',
                trueCost: 0
            });

            // 加号类型
            if (mpConf.plusType) {
                const { days = 1 } = dateInfo;
                const displaySelectBar = days > 1;

                // 不限次校正
                if (freeTimes === -1) {
                    const correctNum = maxPassengerNum * roomQuantity * days;
                    maxLimit = Math.min(correctNum, count);
                    freeTitle = `本单送${maxLimit}份`;
                }

                const dailyMax = Math.min(maxPassengerNum * roomQuantity, maxLimit);
                const plusFreeItem = {
                    id,
                    prepayCampaignID,
                    tagID,
                    title: mpConf.title, // 礼遇名称
                    hotelRemainsDesc,
                    desc: priceValueSummary,
                    costPoints,
                    freeTitle,
                    freeTag,
                    maxLimit, // 酒店可提供的最大份数
                    dailyMax,
                    freeRewards,
                    freeTimes, // 账号剩余总份数
                    freeTimesDesc,
                    showPointsPart,
                    displaySelectBar, // 是否展示日期份数选择bar
                    detailFreeExpanded: false, // 默认收起
                    detailsFree: [], // 日期抵扣明细(免费部分)
                    detailPointsExpanded: false,
                    detailsNeedPoints: [] // 日期抵扣明细(需积分部分)
                };

                // 默认填充免费部分
                let newCount; // 最大的免费兑换数量
                if (freeTimes < 0) newCount = maxLimit;
                else newCount = Math.min(maxLimit, freeTimes);
                for (let i = 0; i < days; i++) {
                    const dailySelectedCount = Math.min(dailyMax, newCount); // 当天已选兑换数量
                    const ymd = dateUtil.addDay(dateInfo.inDay, i + 1);
                    plusFreeItem.detailsFree.push({
                        ymd, // 兑换日期
                        count: isShowReward && rewardMealInfo ? dailySelectedCount : 0, // 已选兑换数量
                        enablePlus: !rewardMealInfo // 是否允许增加兑换数量
                    });
                    newCount -= dailySelectedCount;
                    if (newCount < 0) newCount = 0;
                    showPointsPart && plusFreeItem.detailsNeedPoints.push({
                        ymd,
                        count: 0,
                        enablePlus: isShowReward && rewardMealInfo ? (maxLimit > freeTimes) && (dailySelectedCount < dailyMax) : remainingEnoughPoints
                    });
                }

                mp.plusList.push(plusFreeItem);
                continue;
            }

            // 对勾类型
            const delayTime = extensions.find(it => it.type === 'RewarddeadLine')?.value;
            const subTitle = delayTime ? `至${delayTime}` : '';
            const itemInfo = {
                id,
                prepayCampaignID,
                tagID,
                title: mpConf.title,
                subTitle,
                hotelRemainsDesc,
                isSelected,
                unitPoint: freeTitle ? 0 : costPoints, // 选一份消耗的积分数
                costPoints,
                freeTitle,
                freeTag,
                desc: priceValueSummary,
                maxLimit,
                enablePlus: freeTitle ? true : remainingEnoughPoints,
                showPointsPart,
                freeRewards,
                freeTimesDesc,
                maxFreePrice: 0,
                unit: mpConf.unitUseNights ? `${dateInfo.days}晚${roomQuantity}间` : `${roomQuantity}间`,
                unitNum: mpConf.unitUseNights ? dateInfo.days * roomQuantity : roomQuantity
            };
            const {
                partFreeInfo,
                remainingPoints
            } = this.handlePartFreeInfo(item, totalAvailablePoint, mp, uiInfo?.priceMainAmount);
            Object.assign(itemInfo, partFreeInfo);
            maxLimit && mp.checkboxList.push(itemInfo);

            totalAvailablePoint = remainingPoints;
        }
        mp.topOrderList = mp.checkboxList.filter(item => item.isOrderTop);
        mp.enable = !!(mp.plusList.length || mp.checkboxList.length || mp.staticList.length);
        mp.remainingPoints = totalAvailablePoint;
        mp.initialized = true;

        return mp;
    },
    // 对勾类型，积分兑房费单独处理，已经选择了则不需要计算剩余积分可兑换份数
    handlePartFreeInfo (item, remainingPoints, mp, roomPrice = 0) {
        if (item.id === MEMBER_POINTS_PART_FREE_FEE && !item.isSelected) {
            const { costPoints, maxLimit, priceValue } = item;
            let partFreeInfo = {};
            let maxFreePrice = 0; // 兑换的总钱数
            const numForCompare = [maxLimit, Math.floor(remainingPoints / costPoints)];
            // roomPrice/priceValue -> 价格所能抵扣的总份数，防止价格过低时出现负价格
            roomPrice && numForCompare.push(roomPrice / priceValue);
            const maxExchangeNum = Math.min(...numForCompare);
            maxFreePrice = maxExchangeNum * priceValue;
            partFreeInfo = {
                costPoints,
                maxFreePrice,
                unitNum: maxExchangeNum,
                trueCost: maxExchangeNum * costPoints,
                unitPoint: costPoints,
                priceValue,
                subTitle: `￥${maxFreePrice}`,
                isPartFree: true,
                isOrderTop: true,
                needReqReservation: true // 需要重发可订，与可订相关的权益
            };
            Object.assign(item, partFreeInfo);
            // 默勾逻辑处理
            if (maxExchangeNum && this.pageStatus.isFirstReservation) {
                item.isSelected = true;
                remainingPoints -= maxExchangeNum * costPoints;
                this.handleDefaultSelected(item, mp);
                this.setData({
                    showPartFreeBanner: true,
                    maxPartFreePrice: maxFreePrice
                });
            }
        }
        return {
            partFreeInfo: item,
            remainingPoints
        };
    },
    // 单独处理需要前端默勾的逻辑
    handleDefaultSelected (item, mp) {
        const mpIdx = `mp${item.id}`;
        const mpConf = mpConfig[mpIdx] || {};
        mp.selectedList.push({
            name: `兑换 · ${mpConf.title}`,
            tag: item.freeTag || '',
            trueCost: item.trueCost
        });
    },
    toggleBreakfastSelect (e) {
        const { id, type } = e.currentTarget.dataset;
        const { plusList = [] } = this.data.mpInfo || {};
        const currentIdx = plusList.findIndex(it => id === it.id);
        if (currentIdx < 0) return;

        type === 'free' && this.setData({
            [`mpInfo.plusList[${currentIdx}].detailFreeExpanded`]: !plusList[currentIdx].detailFreeExpanded
        });
        type === 'points' && this.setData({
            [`mpInfo.plusList[${currentIdx}].detailPointsExpanded`]: !plusList[currentIdx].detailPointsExpanded
        });
    },
    /**
     * 对勾型权益正选反选
     */
    togglePointReward (e) {
        const { enable, id } = e.currentTarget.dataset;
        if (!enable) return;

        let needReqReservation = false;
        const { mpInfo, subRoomInfo } = this.data;
        const { isShowReward } = subRoomInfo;
        const rewardItem = mpInfo.checkboxList?.find(it => it.id === id);
        if (!rewardItem) return;

        let { isSelected, unitPoint } = rewardItem;

        // 积分抵房费重发可订
        if (id === MEMBER_POINTS_PART_FREE_FEE) {
            unitPoint = rewardItem.trueCost || 0;
            needReqReservation = true;
        }

        if (isSelected) { // 反选
            mpInfo.remainingPoints += unitPoint;
        } else { // 正选
            mpInfo.remainingPoints -= unitPoint;
        }
        rewardItem.isSelected = !isSelected;

        const dataToSet = {
            mpInfo: this.freshPointsInfo(mpInfo)
        };

        // 是否勾选免费兑取消来切换标签的展示
        if (isShowReward && id === MEMBER_POINTS_FREE_CANCEL) {
            dataToSet['mpInfo.freeCancelInfo.isShowFreeCancel'] = rewardItem.isSelected;
        }

        this.setData({ ...dataToSet }, needReqReservation && this.reqReservation());
    },
    /**
     * 早餐加
     */
    pointPlus (e) {
        const { enable, id, idx, type } = e.currentTarget.dataset;
        if (!enable) return;

        const { mpInfo } = this.data;
        const rewardItem = mpInfo.plusList?.find(it => it.id === id);
        if (!rewardItem) return;

        const { detailsFree = [], detailsNeedPoints = [], costPoints } = rewardItem;
        if (type === 'free') detailsFree[idx] && detailsFree[idx].count++;
        if (type === 'points') {
            detailsNeedPoints[idx] && detailsNeedPoints[idx].count++;
            mpInfo.remainingPoints -= costPoints;
        };

        this.setData({
            mpInfo: this.freshPointsInfo(mpInfo)
        });
    },
    /**
     * 早餐减
     */
    pointMinus (e) {
        const { id, idx, type } = e.currentTarget.dataset;

        const { mpInfo } = this.data;
        const rewardItem = mpInfo.plusList?.find(it => it.id === id);
        if (!rewardItem) return;

        const { detailsFree = [], detailsNeedPoints = [], costPoints } = rewardItem;
        if (type === 'free') detailsFree[idx] && detailsFree[idx].count--;
        if (type === 'points') {
            detailsNeedPoints[idx] && detailsNeedPoints[idx].count--;
            mpInfo.remainingPoints += costPoints;
        };

        this.setData({
            mpInfo: this.freshPointsInfo(mpInfo)
        });
    },
    /**
     * ++--操作后，更新整个积分选择状态, 主要计算enablePlus和selectedList
     * @param {mpInfo} 单项+-操作后的mpInfo
     * @returns 整体更新后的mpInfo
     */
    freshPointsInfo (mpInfo) {
        const { remainingPoints, plusList = [], checkboxList = [] } = mpInfo;
        const selectedList = [];

        // 加号类型
        plusList.forEach(pItem => {
            const { detailsFree = [], detailsNeedPoints = [], maxLimit, dailyMax, freeTimes, costPoints, title, freeRewards } = pItem;
            const selectedCountFree = selectedCount(detailsFree);
            const selectedCountPoints = selectedCount(detailsNeedPoints);
            const hasRemains = selectedCountFree + selectedCountPoints < maxLimit; // 有库存
            const dailySelectInfo = getDailySelectInfo(detailsFree, detailsNeedPoints) || {};

            detailsFree.forEach(freeItem => {
                freeItem.enablePlus = hasRemains &&
                    dailySelectInfo[freeItem.ymd] < dailyMax &&
                    (freeTimes === -1 || selectedCountFree < freeTimes);
            });
            detailsNeedPoints.forEach(pointsItem => {
                pointsItem.enablePlus = hasRemains &&
                    dailySelectInfo[pointsItem.ymd] < dailyMax &&
                    costPoints < remainingPoints;
            });

            // 权益部分区分不同类型的兑换明细
            if (selectedCountFree) {
                let needPushTimes = selectedCountFree;
                freeRewards.some(rewardItem => {
                    const freeTimes = rewardItem.quantity === -1 ? -1 : rewardItem.remainTimes;
                    selectedList.push({
                        name: `兑换 · ${title}`,
                        tag: rewardItem.tagName || '',
                        trueCost: 0
                    });
                    if (freeTimes === -1) return true;

                    needPushTimes -= freeTimes;
                    return needPushTimes <= 0;
                });
            }

            selectedCountPoints && selectedList.push({
                name: `兑换 · ${title}`,
                tag: '',
                trueCost: costPoints * selectedCountPoints
            });
        });

        // 对勾类型
        checkboxList.forEach(item => {
            item = this.handlePartFreeInfo(item, remainingPoints).partFreeInfo;
            const { unitPoint, isSelected, title, freeTitle, freeTag, costPoints, trueCost } = item;
            item.enablePlus = unitPoint === 0 || unitPoint <= remainingPoints;
            isSelected && selectedList.push({
                name: `兑换 · ${title}`,
                tag: freeTag || '',
                trueCost: trueCost || (freeTitle ? 0 : costPoints)
            });
        });

        mpInfo.selectedList = selectedList;
        mpInfo.totalReducePrice = checkboxList.reduce((a, b) => a + b.maxFreePrice, 0);
        return mpInfo;

        function selectedCount (details) {
            return details.map(it => it.count).reduce((sum, cur) => sum + cur, 0);
        }
        function getDailySelectInfo (detailsFree, detailsNeedPoints) {
            const res = {};
            const addCount = details => {
                details.forEach(item => {
                    const { ymd, count } = item;
                    res[ymd] = (res[ymd] || 0) + count;
                });
            };
            addCount(detailsFree);
            addCount(detailsNeedPoints);
            return res;
        }
    },
    togglePointsRule (e) {
        this.setData({ showPointsRule: !this.data.showPointsRule });
    },

    /**
     * 特别要求
     */
    showSpecialRemark (e) {
        this.setData({ 'customRemark.showLayer': true });
    },
    closeSpecialRemark (e) {
        const { remarkList = [] } = this.data.customRemark;
        remarkList.forEach(item => {
            item.isTempSelected = item.isSelected || false;
        });
        this.setData({
            'customRemark.showLayer': false,
            'customRemark.remarkList': remarkList
        });
    },
    submitSpecialRemark () {
        let { remarkList = [], otherRemarkText = '' } = this.data.customRemark;
        otherRemarkText = otherRemarkText.trim();
        const remarkTextArr = []; // 回显用
        remarkList.forEach(item => {
            item.isSelected = item.isTempSelected || false;
            item.isTempSelected && remarkTextArr.push(item.hotelDescription);
        });
        remarkTextArr.push(otherRemarkText);

        this.setData({
            'customRemark.showLayer': false,
            'customRemark.otherRemarkText': otherRemarkText,
            'customRemark.remarkText': remarkTextArr.join('、')
        });
    },
    toggleSpecialRemark (e) {
        const { id } = e.currentTarget.dataset;
        const { remarkList = [] } = this.data.customRemark;
        const toggleIdx = remarkList.findIndex(it => it.remarkId === id);
        if (toggleIdx < 0) return;

        const toggleItem = this.data.customRemark.remarkList[toggleIdx];
        const isTempSelected = toggleItem.isTempSelected || false;
        this.setData({
            [`customRemark.remarkList[${toggleIdx}]`]: {
                ...toggleItem,
                isTempSelected: !isTempSelected
            }
        });
    },
    toggleBedServiceRule (e) {
        this.setData({
            showBedServiceLayer: !this.data.showBedServiceLayer
        });
    },
    // 计算输入框字符
    remarkInputAction (e) {
        const value = e?.detail?.value || '';
        const len = value.trim()?.length;
        if (len > 0 && len <= 100) {
            this.setData({
                currentLen: len,
                'customRemark.otherRemarkText': value
            });
        }

        // 挽留弹窗
        this.pageStatus.retainPop = true;
    },

    /**
     * 费用明细
     */
    togglePriceDetail (e) {
        this.setData({
            showMask: !this.data.showPriceDetailLayer,
            showPriceDetailLayer: !this.data.showPriceDetailLayer
        }, !this.data.showPriceDetailLayer && this.clickPriceDetailTrace());
        const exposureData = {
            priceDetailExposeObj: {
                data: {
                    triggerTime: new Date().getTime(),
                    page: this.pageId
                },
                ubtKeyName: exposeTraceKey.HOTEL_BOOKING_PRICE_DETAIL_KEY
            }
        };
        this.sendExposureTrace(exposureData);
    },
    toggleExtraTaxDesc (e) {
        this.setData({ 'priceInfo.extraTax.showDesc': !this.data.priceInfo.extraTax.showDesc });
    },

    /**
     * 闪住
     */
    toCreditTxt (e) {
        cwx.component.cwebview({
            data: { url: 'https://m.ctrip.com/webapp/hotel/html/credittxt.html' }
        });
    },
    toggleQuickCheckin (e) {
        const qcTap = e.currentTarget.dataset.type === 'quickCheckin';
        const { quickCheckin } = this.data;
        const useQuickCheckin = quickCheckin.isSelected;
        if (qcTap === useQuickCheckin) return;

        // 重发可订
        const { reservationCheckParams } = this.pageStatus;
        reservationCheckParams.disableQuickCheckin = !qcTap;
        reservationCheckParams.userSelectQuickCheckin = true;
        this.reqReservation();

        // 记录用户选择
        storageUtil.setStorage(KEY_REJECT_QUICKCHECKIN, !qcTap, 24 * 7);
    },

    /**
     * 条款说明
     */
    toOrderRule (e) {
        cwx.component.cwebview({
            data: { url: 'https://pages.c-ctrip.com/hotels/wechat/static/booking/orderrule.html' }
        });
    },
    toPersonAuth (e) {
        cwx.component.cwebview({
            data: { url: 'https://pages.c-ctrip.com/hotels/wechat/static/booking/personauth.html' }
        });
    },
    toOverseaPersonAuth (e) {
        cwx.component.cwebview({
            data: { url: 'https://pages.c-ctrip.com/hotels/rn/img/booking/rules/personInfoClause.html' }
        });
    },

    /**
     * 会员互通 start
     */
    getGroupVipInfo ({ thirdPartInfo = {}, memberInfo = {} }) {
        const { hasGroupVipInit } = this.pageStatus;
        if (hasGroupVipInit) return;

        this.pageStatus.hasGroupVipInit = true;
        const {
            isNeedRegister,
            showModels = [],
            thirdPartTypeId,
            registerTip,
            registerRemark,
            privacyTerms = [],
            isCheckName,
            certificateInfoList = [],
            requireVerified
        } = thirdPartInfo;

        if (!isNeedRegister || !showModels.length) return { isShown: false };

        const { certificateNo, certificateType, cnName } = memberInfo;
        const result = {
            isShown: true,
            groupTypeId: thirdPartTypeId,
            registerTip,
            registerRemark,
            privacyTerms,
            isPrivacyCheckd: false,
            hasCheckErr: false, // 未同意授权
            isCheckName,
            certificateInfoList,
            hasTripAuth: certificateNo && cnName && requireVerified // 已有携程账号实名
        };

        needShown(1) && (result.cnName = {
            val: cnName || '',
            errMsg: '',
            isFocus: false
        });
        needShown(4) && Object.assign(result, {
            eFirstName: {
                val: '',
                errMsg: '',
                isFocus: false
            },
            eLastName: {
                val: '',
                errMsg: '',
                isFocus: false
            }
        });
        needShown(6) && (result.phone = {
            ccode: '86',
            phoneNum: '',
            errMsg: '',
            isFocus: false
        });
        needShown(7) && (result.email = {
            val: '',
            errMsg: '',
            isFocus: false
        });
        needShown(8) && (result.card = { // 身份证
            cardType: 1,
            cardName: '身份证',
            cardNo: '',
            errMsg: '',
            isFocus: false
        });
        needShown(10) && (result.gender = {
            type: 'M',
            errMsg: ''
        });
        needShown(11) && (result.card = { // 全量证件
            cardType: certificateType || 1,
            cardNo: certificateNo || '',
            cardName: certificateInfoList.find(it => it.type === certificateType)?.name || '身份证',
            errMsg: '',
            isFocus: false
        });

        return result;

        function needShown (id) {
            return showModels.includes(id);
        }
    },
    groupCnNameInput (e) {
        const { value } = e.detail;
        this.setData({
            'groupVipInfo.cnName': {
                ...this.data.groupVipInfo.cnName,
                val: value
            }
        });
    },
    groupCnNameFocus (e) {
        this.setData({
            'groupVipInfo.cnName': {
                ...this.data.groupVipInfo.cnName,
                errMsg: '',
                isFocus: true
            }
        });
    },
    groupCnNameBlur () {
        let hasErr = true;
        const { val = '' } = this.data.groupVipInfo.cnName;
        const cnName = val.trim();

        const cnNameNew = {
            ...this.data.groupVipInfo.cnName,
            isFocus: false
        };

        const errMsg = this.getNameErrMsg(cnName);
        if (!cnName) {
            cnNameNew.errMsg = '请输入注册人姓名';
        } else if (errMsg) { // 校验不通过
            cnNameNew.errMsg = errMsg;
        } else { // 正确输入
            cnNameNew.errMsg = '';
            hasErr = false;
        }

        this.setData({
            'groupVipInfo.cnName': cnNameNew
        });
        return hasErr;
    },
    groupLastNameInput (e) {
        const { value } = e.detail;
        this.setData({
            'groupVipInfo.eLastName': {
                ...this.data.groupVipInfo.eLastName,
                val: value
            }
        });
    },
    groupLastNameFocus (e) {
        this.setData({
            'groupVipInfo.eLastName': {
                ...this.data.groupVipInfo.eLastName,
                errMsg: '',
                isFocus: true
            }
        });
    },
    groupLastNameBlur () {
        let hasErr = true;
        const { val = '' } = this.data.groupVipInfo.eLastName;
        const lastName = val.trim();

        const lastNameNew = {
            ...this.data.groupVipInfo.eLastName,
            isFocus: false,
            val: lastName
        };

        if (!validateUtil.isEnglish(lastName)) { // 校验不通过
            lastNameNew.errMsg = '英文姓名不能包含中文、数字或特殊字符';
        } else { // 正确输入
            lastNameNew.errMsg = '';
            hasErr = false;
        }

        this.setData({
            'groupVipInfo.eLastName': lastNameNew
        });
        return hasErr;
    },
    groupFirstNameInput (e) {
        const { value } = e.detail;
        this.setData({
            'groupVipInfo.eFirstName': {
                ...this.data.groupVipInfo.eFirstName,
                val: value
            }
        });
    },
    groupFirstNameFocus (e) {
        this.setData({
            'groupVipInfo.eFirstName': {
                ...this.data.groupVipInfo.eFirstName,
                errMsg: '',
                isFocus: true
            }
        });
    },
    groupFirstNameBlur () {
        let hasErr = true;
        const { val = '' } = this.data.groupVipInfo.eFirstName;
        const firstName = val.trim();

        const firstNameNew = {
            ...this.data.groupVipInfo.eFirstName,
            isFocus: false,
            val: firstName
        };

        if (!validateUtil.isEnglish(firstName)) { // 校验不通过
            firstNameNew.errMsg = '英文姓名不能包含中文、数字或特殊字符';
        } else { // 正确输入
            firstNameNew.errMsg = '';
            hasErr = false;
        }

        this.setData({
            'groupVipInfo.eFirstName': firstNameNew
        });
        return hasErr;
    },
    groupPhonecode (e) {
        const { phone } = this.data.groupVipInfo || {};
        cwx.component.areas({
            data: { selectedCode: phone.ccode },
            immediateCallback: res => {
                this.setData({
                    'groupVipInfo.phone': {
                        ...phone,
                        ccode: '' + res.code
                    }
                });
            }
        });
    },
    groupPhoneInput (e) {
        const { value } = e.detail;
        this.setData({
            'groupVipInfo.phone': {
                ...this.data.groupVipInfo.phone,
                phoneNum: value
            }
        });
    },
    groupPhoneFocus (e) {
        this.setData({
            'groupVipInfo.phone': {
                ...this.data.groupVipInfo.phone,
                isFocus: true,
                errMsg: ''
            }
        });
    },
    groupPhoneBlur () {
        let hasErr = true;
        const { phone } = this.data.groupVipInfo || {};
        const { ccode, phoneNum: inputNum } = phone || {};
        const phoneNum = inputNum.trim();
        const phoneNew = {
            ...phone,
            isFocus: false,
            phoneNum
        };

        if (!phoneNum) { // 空
            phoneNew.errMsg = '请输入手机号码';
        } else if (!validateUtil.isPhone(phoneNum, ccode)) { // 校验不通过
            phoneNew.errMsg = '请输入正确的手机号码';
        } else { // 正确输入
            phoneNew.errMsg = '';
            hasErr = false;
        }

        this.setData({
            'groupVipInfo.phone': phoneNew
        });
        return hasErr;
    },
    groupEmailInput (e) {
        const { value } = e.detail;
        this.setData({
            'groupVipInfo.email': {
                ...this.data.groupVipInfo.email,
                val: value
            }
        });
    },
    groupEmailFocus (e) {
        this.setData({
            'groupVipInfo.email': {
                ...this.data.groupVipInfo.email,
                errMsg: '',
                isFocus: true
            }
        });
    },
    groupEmailBlur () {
        let hasErr = true;
        const { val = '' } = this.data.groupVipInfo.email;
        const email = val.trim();

        const emailNew = {
            ...this.data.groupVipInfo.email,
            isFocus: false,
            val: email
        };

        // 空
        if (!email) {
            emailNew.errMsg = '请输入Email';
        } else if (!validateUtil.isEmail(email)) { // 校验不通过
            emailNew.errMsg = '请输入正确的Email地址';
        } else { // 正确输入
            emailNew.errMsg = '';
            hasErr = false;
        }

        this.setData({
            'groupVipInfo.email': emailNew
        });
        return hasErr;
    },
    groupCardInput (e) {
        const { value } = e.detail;
        this.setData({
            'groupVipInfo.card': {
                ...this.data.groupVipInfo.card,
                cardNo: value
            }
        });
    },
    groupCardFocus (e) {
        this.setData({
            'groupVipInfo.card': {
                ...this.data.groupVipInfo.card,
                errMsg: '',
                isFocus: true
            }
        });
    },
    groupCardBlur () {
        let hasErr = true;
        const { cardNo, cardType } = this.data.groupVipInfo.card;

        const cardNew = {
            ...this.data.groupVipInfo.card,
            isFocus: false
        };

        const cardErrMsg = this.getCardErrMsg(cardType, cardNo);
        cardNew.errMsg = cardErrMsg;
        hasErr = !!cardErrMsg;

        this.setData({
            'groupVipInfo.card': cardNew
        });

        return hasErr;
    },
    groupCardSelect (e) {
        const { certificateInfoList = [] } = this.data.groupVipInfo || {};
        if (certificateInfoList.length < 2) return;

        const { cardType } = this.data.groupVipInfo.card;
        const itemList = certificateInfoList.map(item => item.name);
        wx.showActionSheet({
            itemList,
            success: res => {
                if (res.cancel) return;

                const { tapIndex } = res;
                const { type, name } = certificateInfoList[tapIndex];
                if (cardType === type) return;

                this.setData({
                    'groupVipInfo.card': {
                        cardType: type,
                        cardName: name,
                        cardNo: ''
                    }
                });
            }
        });
    },
    groupGenderSelect (e) {
        const { type } = e.target.dataset;
        if (!type) return;

        this.setData({
            'groupVipInfo.gender': {
                type,
                errMsg: ''
            }
        });
    },
    toggleGroupPrivacy (e) {
        const { groupVipInfo = {} } = this.data;
        this.setData({
            'groupVipInfo.isPrivacyCheckd': !groupVipInfo.isPrivacyCheckd,
            'groupVipInfo.hasCheckErr': false
        });
    },
    toGroupPrivacy (e) {
        const { url = '' } = e.currentTarget.dataset;
        if (!url) return;

        cwx.component.cwebview({
            data: { url }
        });
    },
    showGroupAuthTip (e) {
        cwx.showToast({
            title: '集团要求注册人信息与携程实名认证的信息一致，暂不支持修改',
            icon: 'none',
            duration: 5000
        });
    },
    isGroupVipValid () {
        const {
            isShown,
            cnName,
            eFirstName,
            eLastName,
            phone,
            email,
            card,
            hasTripAuth
        } = this.data.groupVipInfo || {};
        if (!isShown) return true;

        let result = true;
        if (cnName) {
            this.groupCnNameBlur() && (result = false);
        }
        if (eFirstName) {
            this.groupFirstNameBlur() && (result = false);
        }
        if (eLastName) {
            this.groupLastNameBlur() && (result = false);
        }
        if (phone) {
            this.groupPhoneBlur() && (result = false);
        }
        if (email) {
            this.groupEmailBlur() && (result = false);
        }
        if (card && !hasTripAuth) { // 已实名，身份证掩码不校验
            this.groupCardBlur() && (result = false);
        }

        return result;
    },
    /**
     * 会员名与其中一个入住人一致
     */
    hasGroupNameErr () {
        const { isCheckName, cnName, eFirstName, eLastName } = this.data.groupVipInfo;
        if (!isCheckName) return false;

        const { val: groupVipName } = cnName;
        const { passengerList = [], foreignPassengerList = [], isOutland } = this.data;
        let hasSameName = false;
        if (isOutland) {
            hasSameName = _.flatten(foreignPassengerList)?.some((item) => {
                return item.firstName?.value === eFirstName?.val && item.lastName?.value === eLastName?.val;
            });
        } else {
            hasSameName = passengerList.some(item => item.fullName === groupVipName);
        }

        if (hasSameName) return false;
        cwx.showModal({
            content: '验证未通过，请确保填写的住客姓名之一与会员名一致',
            showCancel: false
        });
        return true;
    },
    hasGroupAuthErr () {
        const { privacyTerms = [], isPrivacyCheckd } = this.data.groupVipInfo;

        const hasErr = privacyTerms.length && !isPrivacyCheckd;
        hasErr && this.setData({
            'groupVipInfo.hasCheckErr': true
        });

        return hasErr;
    },

    /**
     * 创单
     */
    toCreateOrder: util.throttle(function (e) {
        this.updateDefaultName();

        if (!this.data.hasLogin) {
            this.toLogin();
            return;
        }
        if (!this.isFormValid()) {
            this.data.showPriceDetailLayer && this.setData({
                showMask: false,
                showPriceDetailLayer: false
            });
            return;
        }

        // 校验凌晨时间是否失效
        if (this.data.dateInfo?.selectMorning) {
            const isMorningNow = dateUtil.checkIsMorning(this.pageStatus.timeZoneDate);
            if (!isMorningNow) {
                this.showCalenderTips();
                this.traceOrderIsSuccess({
                    error_type: '7',
                    error_msg: '凌晨时间失效',
                    is_successfully_created: '2'
                });
                return;
            }
        }

        // 校验成功
        this.orderPost();
    }, 400),
    orderPost () {
        const { showLoading } = this.data;
        if (showLoading) return;
        this.showLoading();
        const createOrderParams = this.getOrderParams();
        reqUtil.createOrder(createOrderParams, this.orderPostSuccess, this.orderPostFail);
        this.savePassengerName(createOrderParams.passengerList);
    },
    orderPostSuccess (res) {
        const { result, resultCode, resultMessage, repeatOrder = {}, isReturnLatestPageForError } = res;
        if (result === constConf.NEED_LOGIN) {
            this.toLogin();
            return;
        }

        const onFail = () => {
            this.hideLoading();
            // 创单是否成功埋点
            this.traceOrderIsSuccess({
                error_type: '500',
                error_msg: resultMessage || '',
                is_successfully_created: '2'
            });

            const { createOrderParams } = this.pageStatus;
            const { repeatOrderType, message: repeatMessage } = repeatOrder;

            const priceChange = () => {
                cwx.showModal({
                    content: '该房间价格已发生变化',
                    cancelColor: COLOR_BTN_BLUE,
                    confirmColor: COLOR_BTN_BLUE,
                    confirmText: '重新预订',
                    cancelText: '继续预订',
                    showCancel: true,
                    success: res => {
                        if (res.confirm) {
                            this.setReloadRoomListStatus();
                            this.backDetail();
                        } else if (res.cancel) {
                            this.reqReservation();
                        }
                    }
                });
            };
            const handleRepeat = (type) => {
                const repeatOrderTypeMap = {
                    1: {
                        message: repeatMessage
                    },
                    2: {
                        message: repeatMessage || '您已提交过同时段的订单，是否继续预订？',
                        updateParam: 'ignoreRepeatOrder'
                    },
                    3: {
                        message: resultMessage,
                        updateParam: 'ignoreTravelConflict'
                    }
                };
                const repeatOrderInfo = repeatOrderTypeMap[type];
                if (!repeatOrderInfo) return;
                cwx.showModal({
                    content: repeatOrderInfo.message,
                    cancelColor: COLOR_BTN_BLUE,
                    confirmColor: COLOR_BTN_BLUE,
                    confirmText: '继续预订',
                    cancelText: '先不订了',
                    showCancel: true,
                    success: res => {
                        if (res.confirm) {
                            createOrderParams.repeatOrderType = repeatOrderType;
                            createOrderParams[`${repeatOrderInfo.updateParam}`] = 1;
                            this.orderPost();
                        }
                    }
                });
            };
            const failModal = () => {
                cwx.showModal({
                    content: result === 2 ? resultMessage : '未能生成订单，请重新查询预订或拨打95010联系客服。',
                    confirmColor: COLOR_BTN_BLUE,
                    showCancel: false,
                    success: res => {
                        if (res.confirm && isReturnLatestPageForError) {
                            this.setReloadRoomListStatus();
                            this.backDetail();
                        }
                    }
                });
            };

            if (repeatOrderType) {
                handleRepeat(repeatOrderType);
                return;
            }
            if ([8, 9].includes(resultCode)) {
                priceChange();
                return;
            }

            failModal();
        };

        const onSuccess = () => {
            this.toPay(res);

            // 市场统计订单埋点
            cwx.mkt.sendUnionTrace(this, res.orderId, BU_TYPE);

            // 创单成功基础埋点
            const traceData = this.constructTraceData(res.orderId);
            bookingtrace.submitnew(this, traceData);

            // 创单是否成功埋点
            this.traceOrderIsSuccess({
                error_type: '',
                error_msg: '',
                is_successfully_created: '1'
            });
            this.pageStatus.createOrderSuccess = true;
        };

        result === 0 ? onSuccess() : onFail();

        if (res?.ResponseStatus?.Ack?.toUpperCase() === 'SUCCESS') {
            this.toPayTraceInfo(res, 'success');
        }
    },
    orderPostFail () {
        this.hideLoading();
        cwx.showToast({
            title: '请重试',
            icon: 'none',
            duration: 2000
        });

        this.traceOrderIsSuccess({
            error_type: '500',
            error_msg: '创单接口失败',
            is_successfully_created: '2'
        });
    },
    savePassengerName (passengerList) {
        try {
            const showForeignName = this.data.showForeignName;
            const saveItems = [];
            passengerList.forEach(psg => {
                const { detailInfo = {}, fullName = '' } = psg;
                const passengerName = {
                    cnName: '',
                    enFirstName: '',
                    enLastName: ''
                };
                if (showForeignName) {
                    passengerName.enFirstName = detailInfo.firstName;
                    passengerName.enLastName = detailInfo.lastName;
                } else {
                    passengerName.cnName = fullName;
                }
                saveItems.push({
                    passenger: passengerName
                });
            });
            const savePsgParams = {
                accessToken: '1b570804-31b1-453c-8dd4-fc4c01ac6ff3',
                saveItems
            };
            reqUtil.savePassengerNames(savePsgParams);
        } catch (e) {
        }
    },
    constructTraceData (orderId) {
        const { hotelid, roomid, paytype, shadowid } = this.options;
        const { roomQuantity, uiInfo, priceInfo, couponData, quickCheckin, roomInfoExposeObj = {} } = this.data;
        // eslint-disable-next-line camelcase
        const { room_token } = roomInfoExposeObj.data || {};
        const { requestId = '' } = this.pageStatus;
        return {
            traceInfo: {
                hotelid,
                roomid,
                // eslint-disable-next-line camelcase
                room_token,
                quantity: roomQuantity,
                payType: paytype,
                isinvoice: 'F',
                Shadowid: shadowid,
                price: uiInfo.priceMainAmount,
                coupon: couponData.amount || 0,
                staytime: new Date().getTime() - this.pageStatus.stayStartTime,
                orderid: orderId,
                returncode: priceInfo.priceTags.find(item => item.key === 2)?.amount || 0,
                ordload_tracelogid: requestId
            },
            isQuickIn: quickCheckin.isSelected
        };
    },
    toPayTraceInfo (res = {}, type) {
        try {
            const { hotelid, roomid, shadowid } = this.options;
            const { dateInfo, roomQuantity, priceInfo = {}, couponData, quickCheckin, uiInfo } = this.data;
            const { inDay, outDay } = dateInfo;
            this.pageStatus.orderTraceInfo = {
                cashReturn: {
                    amout: priceInfo.priceTags?.filter(item => item.key === 2)?.[0]?.amount || 0
                },
                prices: {
                    exg: 1, // todo: 汇率，先默认给1
                    useEType: 0 // 埋点未使用该字段，默认给0
                },
                Coupon: {
                    couponReduce: couponData.amount || 0
                },
                isUserSelectQuick: !!quickCheckin.isSelected
            };
            pricetrace.toPay(this, {
                request: {
                    hotelId: hotelid,
                    roomInfo: {
                        roomID: roomid,
                        checkInDate: inDay,
                        checkOutDate: outDay,
                        quantity: roomQuantity,
                        shadowID: shadowid
                    }
                },
                response: {
                    orderId: res.orderId,
                    price: 0, // todo: 未下发，先默认0，埋点不考虑价格一致
                    tax: 0 // todo: 未下发，先默认0，埋点不考虑价格一致
                },
                price: uiInfo.priceMainAmount,
                oldResultCode: res.oldResultCode,
                resultMessage: res.resultMessage,
                bookTrackInfo: this.pageStatus.bookTrackInfo,
                orderCreateTraceInfo: res.trackInfo,
                bookable: type === 'success' && res.resultCode === 1 // 埋点用于显示是否!可订
            });
        } catch (e) {}
    },
    toPay (res) {
        const { requestId, orderId, payToken, busType } = res;
        const { operationType } = res.orderNextStepInfo || {};
        const afterPay = () => {
            this.hideLoading();
            this.toOrderDetail(orderId);
        };

        // 无需支付，去订详
        if (operationType === 1) {
            afterPay();
            return;
        }

        const payFail = () => {
            this.hideLoading();
            wx.showModal({
                content: '提交订单失败',
                confirmColor: COLOR_BTN_BLUE,
                showCancel: false
            });
        };

        // 预付支付前校验，校验不通过场景
        const callPayFail = (result) => {
            this.hideLoading();
            // 支付前校验，根据错误回调的参数选择跳转不同的页面
            if (result?.code === payResultCode.unavailableCode && result.res?.confirmUrl) {
                const { page, orderid } = util.returnUrlParams(result.res.confirmUrl);
                if (page === 'hoteldetail') {
                    this.setReloadRoomListStatus();
                    this.backDetail();
                    return;
                }
                if (page === 'orderfinish' && orderid) {
                    this.toOrderDetail(orderid);
                    return;
                }
                payFail();
                return;
            }
            payFail();
        };

        // 预付
        const callPay = () => {
            const params = {
                serverData: {
                    requestId,
                    orderId,
                    payToken,
                    busType: +busType || 301
                },
                // 成功回调
                sbackCallback: result => {
                    afterPay();
                },
                // 错误、失败的回调
                ebackCallback: result => {
                    callPayFail(result);
                },
                // 取消的回调
                rbackCallback: result => {
                    this.hideLoading();
                },
                // 回退的回调
                fromCallback: result => {
                    this.hideLoading();
                }
            };

            cwx.payment.callPay2(params);
        };

        // 闪住后付
        const withholdPay = () => {
            const paymentObj = {
                token: {
                    requestId,
                    orderId,
                    payToken
                },
                sbackCallback: () => {
                    afterPay();
                },
                ebackCallback: callbackParam => {
                    const { rc } = callbackParam;
                    if (rc === 6) { // 后付授权失败，支持转预付
                        const toPrePayEvent = {
                            currentTarget: {
                                dataset: { type: 'toPrePay' }
                            }
                        };
                        this.toggleQuickCheckin(toPrePayEvent);
                        return;
                    }
                    payFail();
                }
            };
            cwx.payment.withholdPay2(paymentObj);
        };

        operationType === 4 ? withholdPay() : callPay();
        // 防止支付异常时未执行回调函数
        clearTimeout(this.pageStatus.payTimeOut);
        this.pageStatus.payTimeOut = setTimeout(() => {
            this.hideLoading();
        }, 1500);
    },
    toOrderDetail (oid) {
        cwx.redirectTo({
            url: `../orderdetail/index?id=${oid}&from=booking`
        });
    },
    getOrderParams () {
        const getContractInfo = () => {
            const { ccode, phoneNum } = this.data.contact || {};
            const { value: emailVaule } = this.data.email || {};
            return {
                countryCode: ccode,
                mobilePhone: ccode === '86' ? phoneNum : '',
                mobilephoneFG: ccode === '86' ? '' : phoneNum,
                email: emailVaule,
                name: '',
                faxNumber: '',
                idCard: ''
            };
        };

        const getPassengerList = () => {
            const { showForeignName, passengerList, foreignPassengerList, clientCountryCode } = this.data;

            // 中文姓名
            if (!showForeignName) {
                return passengerList.map((item, index) => {
                    const { cardType, cardNo } = item.cardInfo;
                    const fullName = item.fullName;
                    let firstName, lastName;
                    if (validateUtil.isEnglish(fullName)) {
                        firstName = fullName.split('/')[1];
                        lastName = fullName.split('/')[0];
                    }
                    const result = {
                        roomIndex: index + 1,
                        fullName,
                        detailInfo: {
                            firstName: firstName || '',
                            lastName: lastName || ''
                        }
                    };
                    // 延住渠道传房间号
                    if (this.data.isYanZhuChannel) {
                        result.roomNumber = this.data.yanZhuRoomIdList[index];
                    }
                    cardNo && (result.cardInfo = {
                        cardType,
                        cardNo
                    });
                    return result;
                });
            }

            // 英文姓名
            const result = [];
            foreignPassengerList.forEach((perRoom, index) => {
                perRoom.forEach(item => {
                    const { firstName = {}, lastName = {} } = item;
                    (lastName.value && firstName.value) && result.push({
                        roomIndex: index + 1,
                        fullName: `${lastName.value}/${firstName.value}`,
                        detailInfo: {
                            firstName: firstName.value,
                            lastName: lastName.value,
                            clientCountryCode: clientCountryCode.country
                        }
                    });
                });
            });
            return result;
        };

        const getArrivalTimeInfo = () => {
            const { arrivalTimeList, currentIndex, userSelectArrivalTime } = this.data.arrivalInfo;
            const { earliestArrivalTime, hourSpan, latestArrivalTime, checkOutTime } = arrivalTimeList[currentIndex] || {};
            const resInfo = {
                earlyArrivalTime: earliestArrivalTime,
                hourSpan,
                latestArrivalTime,
                userSelectArrivalTime
            };
            checkOutTime && (resInfo.checkOutTime = checkOutTime); // 钟点房离店时间

            return resInfo;
        };

        const getGroupInfo = () => {
            const {
                isShown,
                groupTypeId,
                cnName,
                eFirstName,
                eLastName,
                phone,
                email,
                card,
                gender
            } = this.data.groupVipInfo || {};
            if (!isShown) return {};

            return {
                groupTypeId,
                cnName: (cnName && cnName.val) || '', // 中文姓名
                eFirstName: (eFirstName && eFirstName.val) || '', // 英文名字
                eLastName: (eLastName && eLastName.val) || '', // 英文姓氏
                email: (email && email.val) || '',
                countryCode: (phone && phone.ccode) || '',
                contactNo: (phone && phone.phoneNum) || '',
                gender: (gender && gender.type) || '',
                certificateNo: (card && card.cardNo) || '',
                certificateType: (card && card.cardType) || 1
            };
        };

        const getMPreward = () => {
            const { enable, plusList = [], checkboxList = [] } = this.data.mpInfo;
            if (!enable) return {};

            const res = {
                pointRewardItems: [], // 所有权益部分
                promotionPointRewardItem: [] // 账户内免费权益部分
            };

            // 加号类型
            plusList.forEach(pItem => {
                const {
                    id,
                    prepayCampaignID,
                    tagID,
                    detailsFree = [],
                    detailsNeedPoints = [],
                    costPoints
                } = pItem;
                const freeRewardsPick = util.clone(pItem.freeRewards || []);

                // 按日期拆分
                const dailyList = getDailyList();
                dailyList.forEach(dayItem => {
                    const { ymd, promotionQuantity, useQuantity } = dayItem;
                    // 区分免费权益兑换的memberType(有多个身份权益)
                    if (promotionQuantity > 0) {
                        let needPushTimes = promotionQuantity; // 每日需要使用的份数
                        freeRewardsPick.some(rewardItem => {
                            const freeTimes = rewardItem.quantity === -1 ? -1 : rewardItem.remainTimes;

                            // 新参数canUseTimes表示该memberType还能使用的次数
                            if (rewardItem.canUseTimes == null) rewardItem.canUseTimes = freeTimes;
                            if (freeTimes !== -1 && rewardItem.canUseTimes < 1) return false; // 已使用完

                            const useTimes = freeTimes === -1 ? needPushTimes : Math.min(rewardItem.canUseTimes, needPushTimes);
                            res.promotionPointRewardItem.push({
                                promotionType: 2, // 免费权益，固定
                                rewardType: id,
                                useQuantity: useTimes,
                                effectDate: ymd,
                                costPoint: 0,
                                extendParameters: {
                                    MemberType: rewardItem.memberType,
                                    MemberRewardType: rewardItem.rewardType
                                }
                            });
                            if (freeTimes === -1) return true;

                            // 去掉已使用的次数
                            rewardItem.canUseTimes -= useTimes;

                            // 剩余传参次数
                            needPushTimes -= useTimes;
                            return needPushTimes <= 0;
                        });
                    }

                    res.pointRewardItems.push({
                        pointRewardCampaignId: prepayCampaignID,
                        tagId: tagID,
                        rewardType: id,
                        effectDate: ymd,
                        useQuantity,
                        realQuantity: 1, // 积分单位
                        costPoint: costPoints
                    });
                });

                // useQuantity为总的份数，promotionQuantity为免费权益份数
                function getDailyList () {
                    const dailyList = [];
                    detailsFree.forEach(item => {
                        const { ymd, count } = item;
                        count && dailyList.push({
                            ymd,
                            promotionQuantity: count,
                            useQuantity: count
                        });
                    });
                    detailsNeedPoints.forEach(item => {
                        const { ymd, count } = item;
                        if (count) {
                            const thisDayItem = dailyList.find(it => it.ymd === ymd);
                            thisDayItem
                                ? (thisDayItem.useQuantity += count)
                                : dailyList.push({
                                    ymd,
                                    promotionQuantity: 0,
                                    useQuantity: count
                                });
                        }
                    });

                    return dailyList;
                }
            });

            // 对勾类型
            checkboxList.filter(it => it.isSelected).forEach(cItem => {
                const { id, prepayCampaignID, tagID, freeRewards = [], unitNum, costPoints } = cItem;
                const freeUseInfo = freeRewards[0];
                if (freeUseInfo) {
                    const { memberType, rewardType } = freeUseInfo;
                    res.promotionPointRewardItem.push({
                        promotionType: 2, // 免费权益，固定
                        rewardType: id,
                        useQuantity: 1,
                        costPoint: 0,
                        extendParameters: {
                            MemberType: memberType,
                            MemberRewardType: rewardType
                        }
                    });
                }

                const checkboxRewardInfo = {
                    pointRewardCampaignId: prepayCampaignID,
                    tagId: tagID,
                    rewardType: id,
                    useQuantity: 1,
                    realQuantity: unitNum, // 积分单位
                    costPoint: costPoints
                };
                // 积分抵房费单独处理
                if (id === MEMBER_POINTS_PART_FREE_FEE) {
                    checkboxRewardInfo.useQuantity = unitNum;
                    checkboxRewardInfo.realQuantity = 1;
                }
                res.pointRewardItems.push(checkboxRewardInfo);
            });

            return res;
        };

        const getTicketGiftList = () => {
            const selectedCoupons = this.data.couponData.selectedCoupons || [];
            return selectedCoupons.map(coupon =>
                coupon.isSelect && ({
                    type: 11,
                    ticketId: coupon.id,
                    code: coupon.code
                })
            );
        };

        const getRemarkList = () => {
            const res = [];
            const { bedId, outerRemarkList = [] } = this.data.customRemark;
            if (bedId) { // 大双床
                const selectedBed = outerRemarkList.find(it => it.remarkId === bedId);
                selectedBed && res.push({
                    key: selectedBed.key,
                    remarkId: selectedBed.remarkId,
                    title: selectedBed.title
                });
            }
            // 特殊要求勾选项
            // remarkList.forEach(item => {
            //     item.isSelected &&  res.push({
            //         key: item.key,
            //         remarkId: item.remarkId,
            //         title: item.title,
            //     });
            // })

            return res;
        };

        const getComplexBedList = () => {
            const { bedOptionItems = [], chooseComplexBedIdx } = this.data.customRemark;
            const res = [];
            if (!chooseComplexBedIdx) return res;
            const choosedBedItem = bedOptionItems?.[+chooseComplexBedIdx]?.bedInfos || [];
            choosedBedItem.forEach(bed => {
                bed && res.push({
                    bedCount: bed.bedCount,
                    bedId: bed.bedId
                });
            });
            return res;
        };

        const requestData = {
            ...this.pageStatus.createOrderParams,
            modifyOrder: 0, // 暂无修改单
            isMorning: this.data.dateInfo?.selectMorning ? 1 : 0,
            userCoordinate: getUserCoordinate(),
            contractInfo: getContractInfo(),
            passengerList: getPassengerList(),
            arrivalTimeInfo: getArrivalTimeInfo(),
            groupVipRegisterInfo: getGroupInfo(), // 集团会员
            memberPointRewards: getMPreward(),
            ticketGiftList: getTicketGiftList(), // 优惠券信息
            remarkList: getRemarkList(), // 大、双床和特殊要求选项
            customerRemark: this.data.customRemark.otherRemarkText || '',
            minPriceRoomTraceInfo: '', // 非必传，列表起价房埋点信息json串 todo
            invoiceInfo: {}, // 去订详开票
            rmsToken: cwx.clientID,
            userSelectSuperTravellerId: this.pageStatus.userSelectSuperTravellerId,
            ABTest: this.pageStatus.bookingABTestResults,
            childBeds: getComplexBedList() // 复杂床型
        };
        if (this.data.isYanZhuChannel) {
            requestData.sourceFrom = 'fromscan';
        }
        return requestData;

        function getUserCoordinate () {
            const cache = cwx.locate.getCachedGeoPoint();
            if (!cache) return {};

            return {
                latitude: cache.latitude,
                longitude: cache.longitude,
                coordinateType: 3 // 2.Google, 3.高德 4.百度
            };
        };
    },
    /**
     * 创单表单是否有效
     */
    isFormValid () {
        const {
            isOutland,
            isHMT,
            showForeignName,
            contact,
            requiredInfo,
            agreeIdCard,
            hasAgreeIdCardErr,
            showCountryInfo,
            agreeGDPR,
            enableBookSeaPersonalAuth
        } = this.data;
        let [
            cnPassengerErr,
            enPassengerErr,
            idCardAuthErr,
            phoneErr,
            emailErr,
            groupVipErr,
            groupNameErr,
            groupAuthErr,
            complexBedErr,
            countryCodeErr
        ] = Array(10).fill('');

        // 入住人校验
        if (showForeignName) {
            enPassengerErr = this.checkEnPassenger();
        } else {
            cnPassengerErr = this.checkAllCnPassenger();
        }

        // 证件授权校验
        if (requiredInfo.requireCertificate && !agreeIdCard) {
            idCardAuthErr = '证件未授权';

            !hasAgreeIdCardErr && this.setData({
                hasAgreeIdCardErr: true
            });
            cwx.showToast({
                title: '请先同意下述条款内容',
                icon: 'none',
                duration: 2000
            });
        }

        // 电话校验
        phoneErr = this.phoneBlur();

        if (showCountryInfo) {
            // 证件签发国家/地区校验
            countryCodeErr = this.isCountryCodeValid();
        }

        // email校验
        if (isOutland || contact.ccode !== '86') {
            emailErr = this.emailBlur();
        } else {
            this.emailClear();
        }
        complexBedErr = this.hasComplexBedErr();

        const errMsgArr = [
            cnPassengerErr,
            enPassengerErr,
            idCardAuthErr,
            phoneErr,
            emailErr,
            complexBedErr,
            countryCodeErr
        ];
        const firstErrIndex = errMsgArr.findIndex(item => !!item);
        if (firstErrIndex > -1) {
            this.scrollToElmById('#reservationModule');
            const traceConf = { // 新增模块注意映射关系
                type0: '1',
                type1: '2',
                type2: '3',
                type3: '4',
                type4: '5',
                type5: '8',
                type6: '9'
            };
            this.traceOrderIsSuccess({
                error_type: traceConf[`type${firstErrIndex}`] || '',
                error_msg: errMsgArr[firstErrIndex] || '',
                is_successfully_created: '2'
            });

            return false;
        }

        // 会员互通校验
        groupVipErr = !this.isGroupVipValid();
        groupNameErr = this.hasGroupNameErr();
        groupAuthErr = this.hasGroupAuthErr();

        const groupValid = [
            groupVipErr,
            groupNameErr,
            groupAuthErr
        ].every(item => !item);
        if (!groupValid) {
            this.scrollToElmById('#groupVip');
            this.traceOrderIsSuccess({
                error_type: '6',
                error_msg: '会员互通信息填写有误',
                is_successfully_created: '2'
            });

            return false;
        }

        // 个人信息出境授权声明校验
        if (enableBookSeaPersonalAuth && (isHMT || isOutland) && !agreeGDPR) {
            this.setData({
                showGdprLayer: true
            });
            return false;
        }

        return true;
    },
    hasComplexBedErr () {
        const { bedOptionItems, chooseComplexBedIdx } = this.data.customRemark || {};
        let bedErr = '';
        if (bedOptionItems?.length && !chooseComplexBedIdx) {
            bedErr = '请选择床型要求';
            this.setData({
                'customRemark.complexBedErr': bedErr
            });
        }
        return bedErr;
    },
    /**
     * 页面滚动到指定元素
     */
    scrollToElmById (id, duration = 300) {
        try {
            if (!id) return;

            const query = wx.createSelectorQuery();
            query.selectViewport().scrollOffset();
            query.select(id).boundingClientRect();
            query.select('#mp-navigation').boundingClientRect();
            query.exec((res) => {
                const miss = res[0].scrollTop + res[1].top - res[2].height;
                wx.pageScrollTo({
                    scrollTop: miss,
                    duration
                });
            });
        } catch (err) {
            // console.log(err);
        }
    },
    traceOrderIsSuccess (opt) {
        const { shareFrom, isNewVersion, user } = this.pageStatus;
        bookingtrace.orderIsSuccess(this, {
            ...opt,
            page: this.pageId,
            user,
            sharefrom: shareFrom,
            isNewVersion
        });
    },

    /**
     * 凌晨时间发生变化时出提示,返回到详情页,详情页需要刷新房型列表
     */
    showCalenderTips () {
        cwx.showModal({
            title: '日期已过期,请重新选择入离日期',
            confirmText: '知道了',
            showCancel: false,
            success: res => {
                if (res.confirm) {
                    this.setReloadRoomListStatus();
                    this.backDetail();
                }
            }
        });
    },

    showLoading () {
        this.setData({ showLoading: true });
    },
    hideLoading () {
        this.setData({ showLoading: false });
    },
    screenShotTrace () {
        const { dateInfo, subRoomInfo } = this.data;
        const { hotelid, roomid } = this.options;
        screenshotstrace.orderScreenShotsTrace(this, {
            pageid: this.pageId,
            checkin: dateInfo.inDay,
            checkout: dateInfo.outDay,
            masterhotelid: hotelid,
            roomname: subRoomInfo.name,
            roomid,
            tracelogid: this.pageStatus.requestId
        });
    },
    toLogin () {
        const self = this;
        cwx.user.login({
            callback: function (data = {}) {
                if (data.ReturnCode === '0') {
                    this.setData({
                        mpInfo: getDefaultMpinfo(), // 未登录->登录，未重置积分
                        hasLogin: true,
                        showForceLogin: false
                    });
                    self.reqReservation(true); // 初始化请求
                    cwx.showToast({ title: '登录成功，请继续预订', icon: 'none', duration: 2000 });
                } else {
                    this.setData({
                        hasLogin: false
                    });
                    cwx.showToast({ title: '登录失败，请重新登录', icon: 'none', duration: 2000 });
                }
            }
        });
    },
    // 百度小程序点击去支付唤起登录
    handleThirdLogin: async function (res) {
        const params = {
            getPhoneNumberRes: res
        };
        const { code } = await cwx.user.MobileOneTapLogin.login(params);
        switch (code) {
        case cwx.user.MobileOneTapLogin.RETURN_CODE.AUTHENTICATE_DENY: {
            cwx.showToast({ title: '登录失败，请重新登录', icon: 'none', duration: 2000 });
            break;
        }
        default: {
            this.setData({
                mpInfo: getDefaultMpinfo(), // 未登录->登录，未重置积分
                hasLogin: true
            });
            this.reqReservation(true); // 初始化请求
            cwx.showToast({ title: '登录成功，请继续支付', icon: 'none', duration: 2000 });
            break;
        }
        }
    },
    // 未登录百度账号唤起登录+授权弹窗，已经登录百度账号唤起授权携程弹窗
    silentLogin: function () {
        const { allianceid } = cwx.mkt.getUnion();
        const { isBaidu, hasLogin } = this.data;
        const { isThird } = this.pageStatus;
        if (isThird && isBaidu && !hasLogin) {
            commonrest.getSwitch(['BaiduThirdbookingAutoLogin'], switches => {
                if (switches && switches.BaiduThirdbookingAutoLogin === 1) {
                    this.handleLoginAuth(allianceid);
                }
            });
        }
    },
    handleLoginAuth: async function (aid) {
        if (+aid !== 3212318) return;
        const self = this;
        return new Promise((resolve) => {
            swan.getPhoneNumber({
                success: async (res) => {
                    const params = {
                        detail: {
                            encryptedData: res.data,
                            iv: res.iv,
                            errMsg: 'getPhoneNumber:ok'
                        }
                    };
                    const { code } = await cwx.user.MobileOneTapLogin.login({ getPhoneNumberRes: params });
                    if (code !== -1) {
                        self.setData({
                            mpInfo: getDefaultMpinfo(), // 未登录->登录，未重置积分
                            hasLogin: true
                        });
                        self.reqReservation(true); // 初始化请求
                    }
                    resolve();
                },
                fail: () => {
                    resolve();
                }
            });
        });
    },

    // 取消政策曝光埋点
    showCancelPolicyTrace () {
        bookingtrace.cancelPolicyShow(this, {
            page: this.pageId
        });
    },

    // 底部价格bar曝光埋点
    showBottomPriceBarTrace () {
        bookingtrace.bottomPriceBarShow(this, {
            page: this.pageId
        });
    },

    // 费用明细点击埋点
    clickPriceDetailTrace () {
        bookingtrace.priceDetailClick(this, {
            page: this.pageId
        });
    },

    // 房型浮层点击埋点
    clickRoomLayerTrace () {
        bookingtrace.roomLayerClick(this, {
            page: this.pageId
        });
    },

    // 订房必读点击埋点
    clickNoticeLayerTrace () {
        bookingtrace.noticeLayerClick(this, {
            page: this.pageId
        });
    },

    // 住客姓名提示点击埋点
    clickNameInputTrace () {
        bookingtrace.nameInputClick(this, {
            page: this.pageId
        });
    },

    // 到店时间点击埋点
    clickArrivalLayerTrace () {
        bookingtrace.arrivalLayerClick(this, {
            page: this.pageId
        });
    },

    // 挽留弹窗点击埋点
    clickRetainPopTrace (options) {
        const { clickType } = options.detail;
        bookingtrace.retainPopClick(this, {
            page: this.pageId,
            clickType
        });
    },

    /* Empty method, do nothing */
    noop () {},

    forceToLogin () {
        this.toLogin(true);
    },

    // 第三方渠道来未登录强登
    isThirdLogin: function () {
        const needlogin = this.pageStatus.isThird && !huser.isLogin();
        if (needlogin) {
            this.setData({ showForceLogin: true });
        }
    },

    // 展示税费说明信息，仅当用户选择国家是非马来西亚籍才展示
    showTaxTipInfo (e) {
        const { touristTaxTipInfo = {} } = this.data;
        this.setData({
            showDialog: true,
            dialogTitle: touristTaxTipInfo.floatTitle,
            dialogContent: [touristTaxTipInfo.floatDesc]
        });
    },

    // 关闭弹窗浮层
    closeDialog () {
        this.setData({
            showDialog: false
        });
    },

    /**
     * 服务下发restrictionType等于'1'时展示证件签发国家/地区组件，
     * 用户选择证件签发国家/地区，回显
     */
    selectCountryCode (e) {
        const { clientCountryCode } = this.data;
        cwx.component.areas({
            data: { selectedCountry: clientCountryCode.country },
            immediateCallback: res => {
                const defaultNameStorage = storageUtil.getStorage(constConf.KEY_DEFAULT_NAME) || {};
                const defaultCountryStorage = {
                    ...defaultNameStorage,
                    countryName: res.cn,
                    country: res.country
                };
                const resCountryCode = {
                    countryName: res.cn,
                    country: res.country,
                    errMsg: '',
                    showWarning: false
                };
                this.setData({
                    clientCountryCode: resCountryCode
                });
                // 将用户选择的证件签发国家/地区信息存入缓存
                storageUtil.setStorage(constConf.KEY_DEFAULT_NAME, defaultCountryStorage, 24 * 30);
                this.reqReservation();
            }
        });
    },
    /**
     * 获取用户手机号
     * 用户主动点击时触发
     * @param e
     */
    onGetPhoneNumber (e) {
        const { userAllow, detail } = e.detail;
        const code = detail?.code;
        if (!code) return;

        const errTip = () => {
            cwx.showToast({
                title: '手机号获取失败',
                icon: 'none',
                duration: 2000
            });
        };
        const samePhone = () => {
            cwx.showToast({
                title: '授权手机号和当前手机号相同',
                icon: 'none',
                duration: 2000
            });
        };

        // 不同意授权
        if (!userAllow) {
            this.setData({
                showPhoneLoadingMask: false
            });
            errTip();
            return;
        }

        // 同意授权
        const params = {
            code,
            sourceKey: this.data.phoneNumberParams.sourceKey
        };
        reqUtil.getUserPhoneNumber(params, (res) => {
            const { resultCode, purePhoneNumber, countryCode = '86' } = res;
            if (!purePhoneNumber || resultCode !== 0) {
                errTip();
                return;
            }
            const { groupVipInfo, contact = {} } = this.data;

            // 会员互通模块
            if (this.pageStatus.userBindPhoneType === 'groupvipphone') {
                const groupPhone = groupVipInfo.phone || {};
                if (groupPhone.phoneNum === purePhoneNumber && groupPhone.ccode === countryCode) samePhone();
                this.setData({
                    showPhoneLoadingMask: false,
                    'groupVipInfo.phone': {
                        ccode: countryCode,
                        phoneNum: purePhoneNumber,
                        errMsg: '',
                        isFocus: false
                    }
                });
                return;
            }
            // 入住人手机号
            if (contact.phoneNum === purePhoneNumber && contact.ccode === countryCode) samePhone();
            this.setData({
                showPhoneLoadingMask: false,
                contact: {
                    ccode: countryCode,
                    phoneNum: purePhoneNumber,
                    isFocus: false,
                    showClose: false,
                    errMsg: ''
                }
            });
        }, () => {
            errTip();
        });
    },
    /**
     * 一键获取手机号组件，状态更新回调
     * 组件改变状态时触发：1. loading态 2. ready态  3. error态
     * @param e
     */
    onPhoneNumberStatusChange (e) {
        // 获取手机号状态枚举
        const statusMap = {
            loading: 'loading',
            ready: 'ready',
            error: 'error'
        };
        const { status } = e.detail;
        // sourceKey失效
        if (status === statusMap.error) {
            this.setData({
                showGetPhoneBtn: false
            });
        }
    },

    // 证件签发国家/地区校验，创单触发
    isCountryCodeValid (e) {
        const { clientCountryCode } = this.data;
        if (!clientCountryCode.country) {
            clientCountryCode.errMsg = '请选择证件签发国家/地区';
            clientCountryCode.showWarning = true;
        } else {
            // 已选择国家
            clientCountryCode.errMsg = '';
        }
        this.setData({
            clientCountryCode
        });
        return clientCountryCode.errMsg;
    },
    // 发送曝光埋点
    sendExposureTrace (exposureData) {
        this.setData(exposureData, () => {
            // 异步动态设置曝光埋点节点，必须在设置class完成后，调用 cwx.sendUbtExpose.refreshObserve
            cwx.sendUbtExpose.refreshObserve(this); // 入参 当前页面的实例
        });
    },
    // 超值旅行家浮层
    toggleTravelCouponLayer (e) {
        const index = e?.currentTarget?.dataset?.idx;
        const { showTravelCouponLayer, superTravellerInfos } = this.data;
        const dataToSet = {
            showTravelCouponLayer: !showTravelCouponLayer,
            showMask: !showTravelCouponLayer
        };
        if (!showTravelCouponLayer) {
            const travelCouponLayerInfo = util.clone(superTravellerInfos[Number(index)] ?? {});
            dataToSet.travelCouponBtn = travelCouponLayerInfo.salePrice ? `¥${travelCouponLayerInfo.salePrice}元购买` : '';
            if (travelCouponLayerInfo.exposeData) {
                travelCouponLayerInfo.exposeData.ubtKeyName = exposeTraceKey.HOTEL_BOOKING_TRAVEL_COUPON_LAYER;
            }
            dataToSet.travelCouponLayerInfo = travelCouponLayerInfo;
        }
        this.setData({
            ...dataToSet
        });
    },
    toggleTravelCouponSelect (e) {
        const { id } = e.currentTarget.dataset;
        this.changeTravelCouponSelected({
            detail: {
                id,
                type: 'card'
            }
        });
    },
    changeTravelCouponSelected (e) {
        const bookingTravelCouponType = 'card';
        const { superTravellerInfos } = this.data;
        const { id, type } = e?.detail ?? {};
        let neesReqReservation = false;
        const currentTravelCoupon = superTravellerInfos.find(item => item.id === id) ?? {};
        const dataToSet = {
            showMask: false,
            showTravelCouponLayer: false
        };
        if (type === bookingTravelCouponType || !currentTravelCoupon.selected) {
            currentTravelCoupon.selected = !currentTravelCoupon.selected;
            neesReqReservation = true;
        }
        dataToSet.superTravellerInfos = superTravellerInfos;
        if (currentTravelCoupon.selected) {
            this.pageStatus.showTravelCouponInspireToast = true;
        }

        this.setData({
            ...dataToSet
        }, neesReqReservation && this.reqReservation);
        bookingtrace.travelCouponClick({
            page: this.pageId,
            bubbletext: currentTravelCoupon.popDesc,
            isbubble: currentTravelCoupon.popDesc ? 'T' : 'F',
            masterhotelid: this.options.hotelid,
            package_type: currentTravelCoupon.name,
            click_type: currentTravelCoupon.selected ? 1 : 0
        });
    }
});
