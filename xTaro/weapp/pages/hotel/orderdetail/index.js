import { _, __global, CPage, cwx } from '../../../cwx/cwx.js';
import reqUtil from './requtil';
import dateUtil from '../common/utils/date.js';
import commonfunc from '../common/commonfunc';
import commonrest from '../common/commonrest';
import orderTrace from '../common/trace/orderdetailtrace';
// import DateUtil from '../common/utils/date';
import util from '../common/utils/util';
import components from '../components/components';
import C from '../common/C';
import wechatMarket from '../common/market/wechatMarket';
import huser from '../common/hpage/huser';
import HPromise from '../common/hpage/hpromise';
import hrequest from '../common/hpage/request';
import model from '../common/utils/model';
import Storage from '../common/utils/storage';

const REPAY_CARD_TYPE = 10; // 重新支付
const CONTINUE_PAY_CARD_TYPE = 1; // 去支付，继续支付？
/* 1=未提交(待担保); 2=未提交(待支付); 3=确认中; 4=已确认; 5=已成交(无担保); 6=已成交(有担保);
7=已取消(现付或预付酒店无担保); 8=已取消(现付或预付酒店有担保); 9=已取消(预付携程); 10=支付失败（此时出重新支付按钮）; 11=房间已满（未上线）;
12=提交失败; 13=重新提交(支付); 14=重新提交(担保); 16=提交中
 */
const VAILD_TRAVEL_COUPON_STATUS = [4, 5, 6, 7, 8, 9];
const ORDER_LOG_STATUS = [3, 4, 5, 6, 7, 8, 9, 16]; // 可以展示订单进度的状态码
// 1：支付，2：确认进度，3：服务轨迹，4：入住必读，5：续住，6：发票进度， 7：点评，8：查看点评，
// 9：追加点评，10：重新支付,11：紧急事件，12：安心取消,13：退款进度 14：满房权益，15：满房补偿，23：高价值门票
const ORDER_CARD_SHOW_TYPE = [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 23]; // 可外露的动态卡片类型码
const SHOW_NPS_DELAY_TIME = 3600 * 32 * 1000; // 入住次日8点，nps模块上移
const rnHost = __global.env === 'prd' ? 'm.ctrip.com' : 'm.ares.fws.qa.nt.ctripcorp.com';
const h5Host = __global.env === 'prd' ? 'm.ctrip.com' : 'm.ctrip.fat369.qa.nt.ctripcorp.com';

// 发票信息按钮  ADD_INVOICE：开发票 SHOW_INVOICE：查看发票 RESERVE_INVOICE：预约发票 NO_INVOICE：无发票
const invoiceOperateBtns = {
    ADD_INVOICE: 'ADD_INVOICE',
    SHOW_INVOICE: 'SHOW_INVOICE',
    RESERVE_INVOICE: 'RESERVE_INVOICE',
    NO_INVOICE: 'NO_INVOICE'
};

CPage({
    pageId: '10650070071',
    checkPerformance: true, // 白屏检测标志位
    data: {
        showMask: false, // page-meta防止滚动穿透
        isWechat: commonfunc.isWechat(),
        navTitle: '订单详情', // 导航栏标题
        showFreshLoading: false, // 下拉刷新loading
        showCustomerServiceIcon: false, // 客服图标，防止订单详情响应未返回之前展示
        showFishBone: true, // 骨架屏
        showLoading: false,
        showNoticeLayer: false, // 订房必读
        showLogLayer: false, // 订单操作日志浮层
        operateInfo: null, // 订单操作日志
        noticeNum: 0, // 订房必读条数目
        reservationNoticeTips: [], // 订房必读条详情
        showCancelDescLayer: false, // 取消描述说明浮层
        priceSummaryList: [], // 价格信息
        priceDetail: null, // 价格明细
        remainingTime: '', // 支付倒计时，'hh:mm:ss'
        commonLayer: { // 通用浮层
            show: false,
            title: '',
            content: ''
        },
        nps: { // nps模块
            show: true,
            title: '',
            topPosition: false,
            submitted: false // 是否已提交nps
        },
        hotelInfo: { // 酒店信息
            hotelId: 0
        },
        dateInfo: {
            inday: dateUtil.today(), // YYYY-MM-dd
            indayDisplay: '', // x月x日 周x hh:mm-hh:mm
            outday: dateUtil.tomorrow(),
            outdayDisplay: '', // eg.今天
            orderDate: '', // YYYY-MM-dd hh:mm:ss
            days: 1
        },
        hourTimeInfo: null, // 钟点房时间信息
        showRoomLayer: false,
        isIphoneX: util.isIPhoneX(),
        concatInfo: {
            showCustomerLayer: false, // 客服浮层
            layerTitle: '',
            type: ''
        },
        showLoginLayer: false, // 登录弹窗
        showNameValidLayer: false, // 姓名验证浮层
        isQuickApp: commonfunc.isQuickApp(),
        reservationInfoList: [], // 预订信息
        reservateBtns: [], // 查看入住凭证, 发送确认信息
        basicFacility: [], // 基础设施
        subRoomInfo: {}, // 子房型
        baseRoomInfo: {}, // 物理房型
        mealInfo: { // 餐食
            hasToggleBtn: false, // 是否有展开收起按钮
            showMore: true, // 默认展开
            dailyMealList: []
        },
        mealSuite: { // 套餐内所含餐食
            hasToggleBtn: false, // 是否有展开收起按钮
            xItems: []
        },
        giftWithSuite: { // 已购及赠送服务
            hasToggleBtn: false, // 是否有展开收起按钮
            xItems: []
        },
        suiteLayer: {
            moreMenu: {},
            moreSuite: {},
            show: false
        },
        ticketList: [], // 套餐内高价值门票
        operateBtns: [], // 操作按钮，取消订单、再次预订等
        invoice: {
            need: 0,
            type: 0, // 支持的开票类型
            curType: 0, // 当前开票类型({0: 不需要 1:普通发票; 2:电子发票; 4:专票; 8:电子凭证})
            invoiceWay: 0, // 开票方
            isOversea: false, // 是否海外酒店
            invoicingPart: { // 开票方
                enable: false,
                text: '',
                electronicText: '',
                displayText: ''
            },
            invoiceTipText: '', // 发票文案
            invoiceSubTipText: '' // 描述
        },
        orderSubscribe: { // 订单确认消息模板订阅
            state: 0,
            template: [C.SUBSCRIBMSG_TMPID_ORDERCOMFIRM]
        },
        swiperBanner: { // 服务下发banner数据
            enable: false,
            banners: []
        },
        smz: 0, // 1 为扫码住订单
        smzModule: {
            show: false,
            functions: []
        },
        smzModuleSwitch: false,
        smzModuleText: {
            6: {
                tit: '一键连wifi',
                text: '方便又快捷'
            },
            3: {
                tit: '开发票',
                text: '快速开票，即开即领'
            },
            4: {
                tit: '酒店商城',
                text: '餐饮/休闲娱乐'
            },
            7: {
                tit: '景点门票',
                text: '吃喝玩乐更尽兴'
            },
            8: {
                tit: '打车租车',
                text: '用车分分钟搞定'
            }
        },
        homestayDisplay: false, // 是否为日本民宿
        bargain: { // 砍价浮层
            showLayer: false,
            showBargainBlock: false, // 订单卡片头部砍价按钮&砍价banner
            topBtnText: '砍价成功' // 订单卡片按钮文案
        },
        miniCut: 'true', // 砍价入口开关，1：开，跳小程序 0：关，跳 h5
        reservationOrder: 0, // 预售订单 1-是 0-否
        hotelTelInfo: { // 酒店电话信息
            call: '',
            display: ''
        },
        coordinate: null, // 酒店经纬度
        userInvoice: { // 用户发票信息
            displayText: '',
            displayTitle: ''
        },
        useCarInfo: {}, // 打车信息
        contentHeight: 0, // 自定义头部和底部操作按钮的高度
        invoiceInfoV2: { // 新版发票信息
            actionType: '', // 发票按钮类型
            linkText: '', // 发票按钮名称
            normalDesc: '', // 发票描述
            subtitle: '',
            title: '',
            specialDesc: '' // 底部发票说明
        }
    },
    pageStatus: {
        hasShownBargainLayer: false,
        newSellingPoint: false, // 跳转新卖点页开关
        userPermissionBan: false, // 用户是否有操作权限，false->无权限，需要姓名验证后进行操作; true-> 可直接操作
        sourcefrom: '', // 页面来源，official:携程旅行网公众号
        officialSmz: false, // 携程旅行网推送是否展示店内服务
        showTraceIsSend: {}, // 记录使用createIntersectionObserver发送的曝光埋点,每次重新请求订单详情都会重新发曝光埋点
        hasEBKIM: false,
        needLoadStartTrace: true, // 时间埋点，开始
        needLoadFinishTrace: true, // 时间埋点，结束
        operateBeforeValid: {} // 鉴权前原始点击事件；用户无权操作订单时，需先鉴权
    },
    onLoad: async function (options) {
        const ps = this.pageStatus;
        this.options = options;
        this.checkUniversalSwitches();
        const isLogin = cwx.user.isLogin();
        isLogin && this.reqOrderDetail();
        const contentHeight = await this.getContentHeight();
        this.setData({
            showLoginLayer: !isLogin,
            contentHeight
        });
        ps.sourcefrom = options.sourcefrom || '';
        ps.preTime = Date.now();
        this.initBannerList();
        commonfunc.monitorPrivacyAuthorize();
    },
    onShow () {
        // 协商取消、修改联系人等rn页回退刷新
        if (this.pageStatus.needFreshOrderStatus) {
            this.pageStatus.needFreshOrderStatus = false;
            this.reqOrderDetail();
        }
    },
    updateOrderStatus () {
        this.reqOrderDetail();
    },
    reqOrderDetail (orderId) {
        const { showFishBone } = this.data;
        !showFishBone && this.setData({
            showLoading: true
        });
        // 页面加载开始埋点
        const ps = this.pageStatus;
        if (ps.needLoadStartTrace) {
            ps.needLoadStartTrace = false;
            orderTrace.timeConsuming(this, {
                type: 'orderdetail_new',
                pageId: this.pageId,
                source: 'orderdetail_ready_to_load',
                time: Date.now() - ps.preTime
            });
        }

        const { id } = this.options;
        orderId = orderId || id;
        reqUtil.getOrderDetail({ orderId: +orderId }, this.detailLoadSuccess, this.detailLoadFail);
    },
    /**
     * 初始滚动banner
     */
    initBannerList: function () {
        reqUtil.getSwiperBannerData({}, (result) => {
            if (!result) return;
            this.setData({
                swiperBanner: {
                    enable: result.enable && result.banners?.length > 0,
                    banners: result.banners
                }
            });
        });
    },
    openComponentHongbaoWebview (e) {
        const order = e.currentTarget.dataset.order;
        const { targetType, h5, jumpType, page } = this.data.swiperBanner.banners[order];
        // h5跳转
        if (targetType === 1 && h5) {
            const { url, needLogin, shareCardImage: image } = h5;
            components.webview({
                url,
                needLogin,
                image,
                isNavigate: jumpType === 1
            });
            return;
        }
        // 小程序内跳转
        if (targetType === 2 && page) {
            const { url } = page;
            jumpType === 1 && cwx.navigateTo({
                url
            });
            jumpType === 2 && cwx.redirectTo({
                url
            });
        }
    },
    detailLoadSuccess (res = {}) {
        const ps = this.pageStatus;
        const self = this;
        const { result, resultMessage } = res;
        ps.showTraceIsSend = {}; // 已发曝光埋点初始化
        // 订单鉴权
        if (result !== 0) {
            let errMsg = '';
            result === C.NEED_LOGIN
                ? errMsg = '您目前账号与该订单所对应的账号信息不一致，请返回小程序首页切换账号再尝试'
                : errMsg = resultMessage || '订单查询失败';
            cwx.showModal({
                showCancel: false,
                title: errMsg,
                content: '',
                confirmText: '知道了',
                success: () => {
                    self.handleCustomBack();
                }
            });
            this.loadTimeTrace(false);
            return;
        }

        let { nps, invoice } = this.data;
        ps.orderDetail = res;
        // 头部信息
        const {
            orderId = self.options.id,
            orderStatus = {},
            orderCard = {},
            priceArea = {},
            roomBasicInfo = {},
            hotelInfo = {},
            dateInfo = {},
            mealInfo = {},
            packgeModel,
            addInvoiceInfo,
            paymentInfo,
            cancelPolicyInfo,
            subscribed,
            smz,
            quantity,
            reservationOrder,
            invoiceInfo: userInvoice,
            invoiceInfoV2 = {},
            needShowIM,
            userInfo,
            superTravellerInfo,
            packageModuleTitle
        } = res;
        if (superTravellerInfo) {
            superTravellerInfo.showDetail = VAILD_TRAVEL_COUPON_STATUS.includes(orderStatus?.status);
        }
        const reservationNoticeInfo = res.reservationNoticeInfo ?? {};
        reservationNoticeInfo.reservationNoticeTips = reservationNoticeInfo?.reservationNoticeTips?.filter(item => item?.category !== 3);
        hotelInfo.hotelId = hotelInfo.masterHotelId || hotelInfo.hotelId;
        ps.hasEBKIM = needShowIM;
        ps.reservationNoticeInfo = reservationNoticeInfo;
        ps.travelCouponLength = superTravellerInfo ? [].concat(superTravellerInfo).length : 0;
        // 动态卡片
        const { orderCardList = [], cardExtendInfo = {} } = orderCard;
        const { priceDetail, summaryList: priceSummaryList } = priceArea;
        // 房型信息
        let { baseRoomInfo = {}, subRoomInfo = {} } = roomBasicInfo;
        subRoomInfo = self.constructSuiteInfo(subRoomInfo);
        // nps信息
        nps = {
            ...nps,
            ...this.handleNpsInfo(res)
        };
        // 开发票信息
        const settleInvoiceInfo = self.getInvoiceInfo(addInvoiceInfo, paymentInfo, hotelInfo);
        const { isOversea, coordinate, coordinateList = [], phones: hotelPhone = [], useCarModelList = [] } = hotelInfo || {};
        const coordinateType = isOversea ? ['GG'] : ['GD', 'GG', 'BD']; // 海外使用谷歌，国内 高德、谷歌、百度都可以，取下发的第一个
        const dataToSet = {
            showFishBone: false,
            showLoading: false,
            showCustomerServiceIcon: true,
            orderId: +orderId,
            orderStatus,
            orderIsCanceled: [7, 8, 9].includes(orderStatus.status),
            reservationOrder,
            orderCardList: self.handleOrderCardInfo(orderCardList),
            cardExtendInfo,
            priceDetail,
            priceSummaryList,
            hotelInfo,
            useCarInfo: useCarModelList?.find(item => item.type === 5) || {},
            coordinate: coordinate?.lat && coordinate?.lon ? coordinate : coordinateList?.find(item => coordinateType.includes(item.type)),
            hotelTelInfo: {
                call: hotelPhone[0]?.call
            },
            roomQuantity: quantity,
            navTitle: '订单号' + orderId,
            dateInfo: self.getDateInfo(res),
            hourTimeInfo: dateInfo.hourRoomDateTimeInfo?.checkInDesc ? dateInfo.hourRoomDateTimeInfo : null,
            baseRoomInfo,
            subRoomInfo,
            roomBasicInfo,
            basicFacility: self.getBasicFacility(roomBasicInfo),
            ...self.buildReservationInfo(res),
            nps,
            mealInfo: self.handleMealInfo(mealInfo),
            ...self.buildPackageInfo(packgeModel),
            ticketList: self.buildHighValueTicket(packgeModel, orderStatus?.status) || [],
            operateBtns: invoiceInfoV2 && invoiceInfoV2.actionType ? self.getOperateBtnsV2(res) : self.getOperateBtns(res, settleInvoiceInfo?.showInvoiceButton),
            invoice: _.assignIn(invoice, settleInvoiceInfo),
            userInvoice,
            invoiceInfoV2: this.getInvoiceInfoV2(invoiceInfoV2),
            userInfo,
            orderSubscribe: self.buildSubscribeInfo(subscribed),
            superTravellerInfo: superTravellerInfo ?? null,
            packageModuleTitle
        };
        if (hotelPhone?.length) {
            const { call, display } = hotelPhone[0];
            dataToSet.hotelTelInfo = {
                call,
                display
            };
        }
        // 阶梯取消数据
        const cancelInfo = cancelPolicyInfo || {};
        dataToSet.cancelInfo = self.handleCancelInfo(cancelInfo);

        self.setPageIdCom(isOversea);

        self.setData({
            ...dataToSet,
            noticeNum: reservationNoticeInfo.reservationNoticeTips?.length || 0
        }, self.sendShowTrace);
        this.loadTimeTrace(true);
        this.checkUserRights(res);
        // 订单进度
        self.getOrderLog(orderId, orderStatus.status);
        // 去支付倒计时
        cardExtendInfo.continuePayTimeout && self.handlePayCountdown(cardExtendInfo.continuePayTimeout);
        // 扫码住订单
        self.handleSmzOrder(smz);
        // 是否展示资质备案入口
        this.checkHotelQualification();
        // 砍价浮层
        this.handleBargainLayer();
        this.stopPullDownRefresh();
    },
    detailLoadFail (res = {}) {
        this.loadTimeTrace(false);
        this.stopPullDownRefresh();
    },
    /**
     * 操作按钮，修改订单、取消订单、开发票（旧逻辑）、协商取消、去点评、再次预订等
     * todo: 开发票按钮接新逻辑验收通过后可下线该函数
     */
    getOperateBtns (res = {}, canGetInvoice) {
        canGetInvoice = canGetInvoice || this.data.invoice?.showInvoiceButton; // 是否展示开发票按钮
        const {
            canCancel, // 取消
            canComment, // 点评
            canConsultOutTimeCancel, // 协商取消
            canCheckOutEarly, // 提前离店
            canRebook, // 再次预订
            canRepayment, // 重新支付
            addInvoiceInfo
        } = res;
        const operateList = [];
        const connectInfo = (name, event, type) => {
            operateList.push({
                name,
                event,
                type
            });
        };
        let invoiceBtnText = '';
        if (canGetInvoice && addInvoiceInfo?.canAddInvoice) {
            invoiceBtnText = addInvoiceInfo.invoiceWay === 3 ? '预约开票' : '开发票';
        }
        // 操作按钮
        canRepayment && connectInfo('重新支付', 'toPay', REPAY_CARD_TYPE);
        !canConsultOutTimeCancel && canCancel && connectInfo('取消订单', 'cancelOrder');
        // 协商取消按钮文案暂时也展示为取消订单
        canConsultOutTimeCancel && connectInfo('取消订单', 'consultCancel');
        canCheckOutEarly && connectInfo('提前离店', 'handleCheckoutEarly');
        invoiceBtnText && connectInfo(invoiceBtnText, 'goToAddInvoicePage');
        canRebook && connectInfo('再次预订', 'goToDetail');
        canComment && connectInfo('去点评', 'goToComment');

        operateList.length > 4 && (operateList[3] = {
            name: `更多(${operateList.length - 3})`,
            event: 'showMoreOperateBtn'
        });
        return operateList;
    },

    // 底部操作按钮，开发票走新逻辑，后续可替换getOperateBtns()函数，下线旧发票逻辑
    getOperateBtnsV2 (res = {}) {
        const {
            canCancel, // 取消
            canComment, // 点评
            canConsultOutTimeCancel, // 协商取消
            canCheckOutEarly, // 提前离店
            canRebook, // 再次预订
            canRepayment, // 重新支付
            invoiceInfoV2 // 开发票
        } = res;
        const canGetInvoice = [
            invoiceOperateBtns.ADD_INVOICE,
            invoiceOperateBtns.RESERVE_INVOICE
        ].includes(invoiceInfoV2.actionType); // 是否展示开发票按钮，仅预约发票和开发票展示按钮
        const operateList = [];
        const connectInfo = (name, event, type) => {
            operateList.push({
                name,
                event,
                type
            });
        };
        // 操作按钮
        canRepayment && connectInfo('重新支付', 'toPay', REPAY_CARD_TYPE);
        !canConsultOutTimeCancel && canCancel && connectInfo('取消订单', 'cancelOrder');
        canConsultOutTimeCancel && connectInfo('取消订单', 'consultCancel');
        canCheckOutEarly && connectInfo('提前离店', 'handleCheckoutEarly');
        canGetInvoice && connectInfo(invoiceInfoV2.linkText, 'goToAddInvoicePage');
        canRebook && connectInfo('再次预订', 'goToDetail');
        canComment && connectInfo('去点评', 'goToComment');

        operateList.length > 4 && (operateList[3] = {
            name: `更多(${operateList.length - 3})`,
            event: 'showMoreOperateBtn'
        });
        return operateList;
    },

    /**
     * 处理新版发票信息
     */
    getInvoiceInfoV2 (invoiceInfoV2 = {}) {
        if (!invoiceInfoV2 || !invoiceInfoV2.specialDesc) return invoiceInfoV2;
        const specialDesc = invoiceInfoV2.specialDesc.split(';').filter(it => it !== '');
        return {
            ...invoiceInfoV2,
            specialDesc
        };
    },

    /**
     * 根据发票类型进行不同跳转（新逻辑）
     */
    handleInvoiceInfo (e) {
        const actionType = e.currentTarget.dataset.type;
        switch (actionType) {
        case invoiceOperateBtns.ADD_INVOICE || invoiceOperateBtns.RESERVE_INVOICE:
            this.goToAddInvoicePage();
            break;
        case invoiceOperateBtns.SHOW_INVOICE:
            this.goToInvoiceDetailPage();
            break;
        default:
            break;
        }
    },

    /**
     * 跳转到新版发票填写/修改页
     */
    goToAddInvoicePage () {
        this.pageStatus.needFreshOrderStatus = true;
        const { orderId } = this.data;
        cwx.component.cwebview({
            data: {
                url: encodeURIComponent(`https://${rnHost}/webapp/cw/hotel/optionalDetail/NewInvoicePage.html?orderID=${orderId}&operType=0&platform=wechat`)
            }
        });
    },

    /**
     * 跳转到新版发票详情页
     */
    goToInvoiceDetailPage () {
        this.pageStatus.needFreshOrderStatus = true;
        const { orderId } = this.data;
        cwx.component.cwebview({
            data: {
                url: encodeURIComponent(`https://${rnHost}/webapp/cw/hotel/optionalDetail/NewInvoiceInfoPage.html?orderID=${orderId}&platform=wechat`)
            }
        });
    },

    /**
     * 设置可开票信息，用于带入发票页
     */
    getInvoiceInfo (addInvoiceInfo, paymentInfo, hotelInfo) {
        if (!addInvoiceInfo || !addInvoiceInfo.canAddInvoice) return;
        const { invoiceWay, type } = addInvoiceInfo;
        let [invoiceTipText, invoiceSubTipText, invoicePartText, electronicPartText] = ['不需要发票', '', '', ''];
        // 1:酒店开票; 2:携程开票; 3:预约发票; 4:供应商开票
        switch (invoiceWay) {
        case 1:
            invoicePartText = '酒店开具';
            break;
        case 2:
            invoicePartText = '上海赫程国际旅行社有限公司或其分公司';
            break;
        case 3:
            invoiceTipText = '支持预约酒店发票';
            invoiceSubTipText = '提前预约, 节省离店等待时间';
            break;
        case 4:
            invoicePartText = '发票由供应商提供';
            paymentInfo?.type === 0 && (electronicPartText = '供应商'); // 0:预付,1:现付
            break;
        }
        return {
            invoiceWay,
            invoicingPart: {
                text: invoicePartText,
                electronicText: electronicPartText,
                enable: false,
                displayText: ''
            },
            type, // 支持的开票类型
            invoiceTipText,
            invoiceSubTipText,
            isOversea: hotelInfo.isOversea,
            tipMsg: this.pageStatus.invoiceTips || '',
            showInvoiceButton: true
        };
    },
    showMoreOperateBtn () {
        this.setData({
            showMoreOperateLayer: true
        });
    },
    closeMoreOperateBtn () {
        if (!this.data.showMoreOperateLayer) return;
        this.setData({
            showMoreOperateLayer: false
        });
    },
    handleCheckoutEarly () {
        const orderId = this.data.orderId;
        if (!orderId) return;
        cwx.component.cwebview({
            data: {
                hideShareMenu: true,
                url: encodeURIComponent(`https://${rnHost}/webapp/cw/hotel/optionalDetail/CheckoutEarlyPage.html?orderID=${orderId}&platform=wechat`)
            }
        });
        orderTrace.clickCheckoutEarlyBtn(this, {
            platform: 'wechat',
            pageid: this.pageId
        });
    },
    consultCancel () {
        const orderId = this.data.orderId;
        if (!orderId) return;

        this.pageStatus.needFreshOrderStatus = true;
        cwx.component.cwebview({
            data: {
                hideShareMenu: true,
                url: encodeURIComponent(`https://${rnHost}/webapp/cw/hotel/optionalDetail/NewCancelOrderPage.html?orderID=${orderId}&platform=wechat`)
            }
        });
        orderTrace.clickOptionCancelBtn(this, {
            actionType: 1,
            orderid: orderId
        });
    },
    toggleOrderLogLayer () {
        const showLogLayer = this.data.showLogLayer;
        this.setData({
            showLogLayer: !showLogLayer
        });
        !showLogLayer && orderTrace.clickOrderStatus(this, {
            page: this.pageId
        });
    },
    getOrderLog (orderId, status) {
        const self = this;
        ORDER_LOG_STATUS.includes(status) && reqUtil.getOrderStatus({ orderId: +orderId + '' }, (res) => {
            const statusDetails = res?.statusDetails;
            if (!statusDetails) return;
            const operateInfo = statusDetails.map(item => {
                const time = item.time?.replace(/-/g, '/') || '';
                const date = (time && new Date(time)) || '';
                let [day, clock] = ['', ''];
                if (time && !isNaN(Date.parse(time))) {
                    day = dateUtil.formatTime('yyyy-MM-dd', date);
                    clock = dateUtil.formatTime('hh:mm:ss', date);
                }
                return {
                    ...item,
                    day,
                    clock
                };
            });
            self.setData({ operateInfo });
        });
    },
    // 集成文案可能下发{price}¥100元{/price}类似，括号内部需要高亮，并且使用不同的样式
    handleBracket (string) {
        if (!string) return [];
        string = string.replace('{/', '{');
        // eslint-disable-next-line
        const classNames = string.match(/\{([^\}])+\}/g) || [];
        // eslint-disable-next-line
        const textArr = string.split(/\{[^\}]+\}/g);
        const result = [];
        textArr.forEach((item, index) => {
            item && result.push({ // 防止{price}在头尾时产生空数组
                name: item,
                color: index % 2 ? classNames[index].replace(/\{|\}/g, '') : '' // 往分割出的数组中塞样式
            });
        });
        return result;
    },
    // 卡片信息处理
    handleOrderCardInfo (orderCardList = []) {
        const self = this;
        const availableOrderCard = [];
        orderCardList.forEach(item => {
            const showOrderCard = item.cardDetails?.some(detail => ORDER_CARD_SHOW_TYPE.includes(detail.cardType));
            showOrderCard && availableOrderCard.push(item);
        });
        availableOrderCard.forEach(item => {
            item.cardDetails = item.cardDetails?.map(detail => self.constructDetailInfo(detail));
            item.hasExtraBtns = !!item.cardDetails?.find(detail => detail.extraBtns?.length > 0);
        });
        return availableOrderCard;
    },
    constructDetailInfo (detail) {
        const cardType = detail.cardType;
        if (cardType === 23) {
            detail = this.handleTicketInfo(detail);
        }
        const { title = '', subTitle = '', btnText = '', jumpUrl } = detail;
        const self = this;
        // eslint-disable-next-line
        const removeBracket = string => string.replace(/\{[^\}]+\}/g, '');

        /*
            若点击事件需要验证用户是否可写(userPermissionBan)，需要先进行operate方法验证后再进行event方法；
            无需验证用户是否可写->直接event方法
            text 表示按钮文案
        */
        const cardBtnEvent = {
            1: { // 支付，todo: 继续支付？
                event: 'toPay',
                operate: 'checkValidOperate'
            },
            4: { // 入住必读
                operate: 'toggleNoticeLayer'
            },
            7: {
                text: '去点评', // 点评
                event: 'goToComment',
                operate: 'checkValidOperate'
            },
            10: { // 重新支付
                text: '重新支付',
                event: 'toPay',
                operate: 'checkValidOperate'
            },
            23: { // 门票预约&查看
                text: btnText, // 去预约/去查看
                event: jumpUrl ? 'jumpH5Url' : 'scrollToElement',
                operate: 'checkValidOperate',
                jumpUrl,
                domId: 'package-info'
            }
            // 13: { todo: 先屏蔽
            //     id,
            //     text: '进度详情',
            //     event: 'viewRefund'
            // }, // 退款进度
        };
        const extraInfo = {
            titleList: self.handleBracket(title),
            subTitleList: self.handleBracket(subTitle),
            title: removeBracket(title),
            subTitle: removeBracket(subTitle),
            showDetailBtn: removeBracket(subTitle).length > 26,
            operateText: cardBtnEvent[cardType]?.text || '',
            operateType: cardBtnEvent[cardType]?.operate || '',
            event: cardBtnEvent[cardType]?.event || '',
            jumpUrl: cardBtnEvent[cardType]?.jumpUrl || '',
            domId: cardBtnEvent[cardType]?.domId || ''
        };
        return {
            ...detail,
            ...extraInfo
        };
    },

    // 头部动态卡片门票信息处理
    handleTicketInfo (detail) {
        const { orderCardExtras } = detail;
        if (!orderCardExtras && !orderCardExtras.length) return detail;
        const btnText = orderCardExtras.find(item => item?.key === 'appointType')?.value === '0' ? '去查看' : '去预约';
        let jumpUrl = '';
        const ticketUrl = orderCardExtras.find(item => item?.key === 'Url' && item?.value);
        if (ticketUrl) {
            jumpUrl = ticketUrl.value;
        }
        return {
            ...detail,
            jumpUrl: jumpUrl ? `${jumpUrl}&isHideNavBar=YES` : '',
            btnText
        };
    },

    // 门票预约,todo: 后续产品提需可改为这个地址
    appointTicket (e) {
        const { oid: orderId } = e.currentTarget.dataset;
        cwx.navigateTo({
            url: `/pages/orderttd/detail/index?orderid=${orderId}`
        });
    },
    toTravelCouponDetail (e) {
        const status = this.data.orderStatus?.status;
        if (VAILD_TRAVEL_COUPON_STATUS.includes(status)) {
            this.jumpH5Url(e);
        }
    },
    jumpH5Url (e) {
        const { url } = e.currentTarget.dataset;
        cwx.component.cwebview({
            data: {
                url: encodeURIComponent(url),
                needLogin: true
            }
        });
    },
    toggleNoticeLayer () {
        const { showNoticeLayer, reservationNoticeTips } = this.data;
        const { reservationNoticeTips: noticeTips } = this.pageStatus.reservationNoticeInfo;
        const dataToSet = {
            showMask: !showNoticeLayer,
            showNoticeLayer: !showNoticeLayer
        };
        if (reservationNoticeTips.length === 0) {
            dataToSet.reservationNoticeTips = noticeTips;
        }
        this.setData(dataToSet);
    },
    toPay (e) {
        const { type } = e.currentTarget.dataset;
        cwx.showToast({ title: '去支付...', icon: 'loading', duration: 10000, mask: true });
        const { orderId } = this.data;
        const params = {
            orderId: orderId + ''
        };
        type === REPAY_CARD_TYPE && (params.repayment = 1);
        reqUtil.toPay(params, (res) => {
            this.handlePayInfo(res, type);
        }, this.showErrToast);
    },
    handlePayInfo (res, type) {
        cwx.hideToast();
        const Msg = type === REPAY_CARD_TYPE ? '该订单不支持重新支付' : '该订单不支持继续支付';
        if (res?.orderOperateType === 1) {
            type === REPAY_CARD_TYPE && this.submitPayment(res); // 重新支付
            type === CONTINUE_PAY_CARD_TYPE && this.toContinuePay(res); // 继续支付
        } else {
            this.showMessage(Msg, '知道了');
        }
    },
    // 继续支付
    toContinuePay (data) {
        const self = this;
        const { repeatOrder, sameCityOrder, travelConflictOrder } = data;
        if (repeatOrder === 1) {
            this.showMessage('您已提交过相同姓名的订单，如需继续预订请修改入住人姓名。', '知道了');
            return;
        }
        if (sameCityOrder === 1) {
            showModal('您已提交过相同城市订单，是否继续预订？');
            return;
        }
        if (travelConflictOrder === 1) { // 交叉BU行程冲突
            const msg = data.resultMessage;
            msg ? showModal(msg) : this.submitPayment(data);
            return;
        }
        this.submitPayment(data);

        function showModal (msg) {
            cwx.showModal({
                content: msg,
                cancelColor: '#006FF6',
                confirmColor: '#006FF6',
                confirmText: '继续预订',
                showCancel: true,
                success: function (res) {
                    res.confirm && self.submitPayment(data);
                }
            });
        }
    },
    // 唤起支付
    submitPayment (data) {
        const self = this;
        const bizCode = data.busType || (data.oversea === 1 ? 302 : 301);
        const orderId = this.data.orderId;
        const paymentObj = {
            sbackCallback: result => {
                self.reqOrderDetail(orderId);
            },
            ebackCallback: result => {
                self.reqOrderDetail(orderId);
            }
        };
        const callPay = function () {
            paymentObj.data = {
                bustype: bizCode,
                oid: orderId,
                token: data.payToken,
                extend: data.payExtend
            };
            data.paySign && (paymentObj.data.sign = data.paySign);
            cwx.payment.callPay(paymentObj);
        };
        const callPayNew = function () {
            paymentObj.serverData = {
                requestId: data.payRequestId,
                orderId,
                payToken: data.payTokenNew,
                busType: bizCode
            };
            cwx.payment.callPay(paymentObj);
        };
        data.payTokenNew && data.payRequestId ? callPayNew() : callPay();
    },
    goToComment () {
        const { orderId, hotelInfo: { hotelId, name, isOversea } } = this.data;
        const biz = isOversea ? 2 : 1;
        cwx.navigateTo({
            url: `../ordercommit/index?oid=${orderId}&hotelid=${hotelId}&hotelname=${name}&biz=${biz}`
        });
    },
    // todo：退款进度
    viewRefund (e) {
        const id = e.currentTarget.dataset?.id;
        cwx.getCurrentPage().navigateTo({
            url: '/pages/pay/refund/index', // 如果不接服务Token默认地址是 /pages/wallet/refund/index
            data: {
                subRefundNos: [id]
            }
        });
    },
    showCardDetail (e) {
        const { msg, title } = e.currentTarget.dataset;
        const content = {
            title: msg
        };
        this.setData({
            universalLayer: {
                show: true,
                title,
                contentList: [content]
            }
        });
    },

    showErrToast (msg) {
        wx.showToast({
            title: msg
        });
    },
    showLoading (msg, showMask = false) {
        cwx.showToast({
            title: msg,
            icon: 'loading',
            duration: 10000,
            mask: showMask
        });
    },
    showMessage: function (msg, btnTxt, callback) {
        cwx.showModal({
            showCancel: false,
            title: msg,
            content: '',
            confirmText: btnTxt,
            success: function (res) {
                callback && callback();
            }
        });
    },
    showPayDesc (e) {
        const { index } = e.currentTarget.dataset;
        const { priceSummaryList } = this.data;
        const payAddtionInfo = priceSummaryList[+index]?.additionalInfo;
        if (!payAddtionInfo) return;
        const { innerTitle, innerContentList } = payAddtionInfo;
        const universalLayer = {
            show: true,
            title: innerTitle,
            contentList: innerContentList
        };
        this.setData({
            showMask: true,
            universalLayer
        });
    },
    closeUniversalLayer () {
        this.setData({
            showMask: false,
            'universalLayer.show': false
        });
    },
    togglePriceDetail () {
        const { show } = this.data.priceDetail;
        this.setData({
            showMask: !show,
            'priceDetail.show': !show
        });
        !show && orderTrace.clickPriceArea(this, {
            pageId: this.pageId,
            type: 1
        });
    },
    toggleCancelDescLayer (e) {
        const showCancelDescLayer = this.data.showCancelDescLayer;
        this.setData({
            showMask: !showCancelDescLayer,
            showCancelDescLayer: !showCancelDescLayer
        });
        !showCancelDescLayer && orderTrace.clickPriceArea(this, {
            pageId: this.pageId,
            type: 2
        });
    },
    handleCancelInfo (cancelInfo = {}) {
        const { cancelCelPolicyInfo, desc, anXinCancelInfo } = cancelInfo;
        const { celPolicyTable } = cancelCelPolicyInfo || {};
        const rows = celPolicyTable?.rows || [];
        let greyFlag = true; // 当前时间之前（过期时间）的都置灰，当前时间标识：highLight
        rows.forEach(item => {
            !item.headFlag && item.cells?.forEach(v => {
                v.context?.indexOf('免费') > -1 && (v.isFree = true);
                if (item.highLight) {
                    greyFlag = false;
                }
                greyFlag && (v.needGray = true);
            });
        });
        return {
            anXinCancelInfo,
            ...cancelCelPolicyInfo,
            simpleDesc: desc
        };
    },
    // 支付倒计时
    handlePayCountdown (remainTime) {
        if (remainTime <= 0) return;
        const ps = this.pageStatus;
        let [hours, minutes, seconds] = ['', '', ''];
        clearInterval(ps.countdownTimer);
        const formatTime = (time) => {
            return time < 10 ? '0' + time.toString() : time.toString();
        };
        ps.countdownTimer = setInterval(() => {
            if (remainTime > 0) {
                hours = formatTime(Math.floor(remainTime / 3600));
                minutes = formatTime(Math.floor((remainTime % 3600) / 60));
                seconds = formatTime(Math.floor((remainTime % 60)));
                remainTime--;
                this.setData({
                    remainingTime: `${hours}:${minutes}:${seconds}`
                });
            } else {
                this.setData({
                    remainingTime: ''
                });
                clearInterval(ps.countdownTimer);
            }
        }, 1000);
    },
    handleCustomBack () {
        const self = this;
        if (commonfunc.isLandingPage()) {
            self.toInquire();
        } else {
            cwx.navigateBack({
                fail: () => {
                    self.toInquire();
                }
            });
        }
    },
    toInquire () {
        cwx.redirectTo({
            url: '../inquire/index'
        });
    },
    checkUniversalSwitches () {
        const self = this;
        const ps = self.pageStatus;
        const keys = [
            'invoice_notice', // 疫情提示
            'orderdetail_show_smzmodule',
            'orderdetail_show_official_smzmodule'
        ];
        commonrest.getWechatSoaSwitch(keys, (rs) => {
            const result = rs?.result || [];
            for (let i = 0, n = result.length; i < n; i++) {
                const curItem = result[i] || {};
                const { key, value } = curItem;
                const opened = value === '1';
                switch (key) {
                case 'invoice_notice':
                    self.pageStatus.invoiceTips = value;
                    break;
                case 'orderdetail_show_smzmodule':
                    self.setData({
                        smzModuleSwitch: opened
                    });
                    break;
                case 'orderdetail_show_official_smzmodule':
                    ps.officialSmz = opened;
                    break;
                default:
                    break;
                }
            }
        });
    },
    closeNameValidLayer: function () {
        this.setData({
            showNameValidLayer: false
        });
        orderTrace.clickCheckNameLayer(this, {
            type: 2,
            pageid: this.pageId
        });
    },
    // 检测用户是否有读写权限
    checkUserRights (data) {
        const { userPermission, guestInfo = {} } = data;
        const passengerList = guestInfo?.passengerList || [];
        this.pageStatus.userPermissionBan = userPermission === 'Read';
        // 联系人姓名根据掩码*分割
        this.pageStatus.userPermissionBan && this.setData({
            psgName: passengerList[0]?.maskName?.split(/\*+/) || []
        });
    },
    // 操作取消订单/去点评...按钮之前先检测用户是否有权限，无权限(userPermissionBan)出姓名鉴权弹窗，有权限直接操作
    checkValidOperate (e) {
        const { event, name } = e?.currentTarget?.dataset || {};
        orderTrace.clickOperateBtn(this, {
            page: this.pageId,
            buttonType: name
        });
        const ps = this.pageStatus;
        if (ps.userPermissionBan) {
            this.setData({
                showNameValidLayer: true
            });
            orderTrace.showCheckNameValid(this, {
                pageid: this.pageId
            });
            // 用户无权操作点击事件时（如：去点评、开发票），先保留原有点击事件
            ps.operateBeforeValid = {
                operate: event,
                operateEvent: e
            };
            return;
        }
        event && this[event](e);
    },
    handleOrderCardClick (e) {
        const { operate, event } = e.currentTarget.dataset;
        operate && this[operate](e);
        orderTrace.clickOrderCard(this, {
            page: this.pageId,
            buttonType: event || operate
        });
    },
    submitName () {
        const { occupantName, orderId, psgName = [] } = this.data;
        if (!occupantName || !occupantName.trim() || !orderId) return;
        const params = {
            orderId: orderId + '',
            passenger: psgName.join(occupantName)
        };
        const ps = this.pageStatus;
        const self = this;
        reqUtil.checkPassengerInfo(params, (res) => {
            if (res && res.isPass) {
                ps.userPermissionBan = false;
                const { operate, operateEvent: e } = ps.operateBeforeValid;
                operate && this[operate](e);
            } else {
                cwx.showToast({ title: '验证不通过，如需修改请联系预定人', icon: 'none', duration: 2000 });
                orderTrace.showValidFailToast(self, {
                    pageid: self.pageId
                });
            }
        }, (e) => {
            cwx.showToast({ title: '验证不通过，如需修改请联系预定人', icon: 'none', duration: 2000 });
            orderTrace.showValidFailToast(self, {
                pageid: self.pageId
            });
        });
        orderTrace.clickCheckNameLayer(this, {
            type: 1,
            pageid: this.pageId
        });
        this.setData({
            showNameValidLayer: false
        });
    },
    inputUserName: function (e) {
        const occupantName = e.detail.value || '';
        this.setData({
            occupantName,
            occupantNameValid: occupantName.trim()
        });
    },
    toLogin () {
        const self = this;
        commonfunc.toLogin(self, () => {
            self.setData({
                showLoginLayer: false
            }, self.updateOrderStatus);
        });
    },
    cancelOrder () {
        this.pageStatus.needFreshOrderStatus = true;
        const { orderId } = this.data;
        cwx.component.cwebview({
            data: {
                hideShareMenu: true,
                url: encodeURIComponent(`https://${rnHost}/webapp/cw/hotel/optionalDetail/NewCancelOrderPage.html?orderID=${orderId}&fromPage=0&platform=wechat`),
                needLogin: true
            }
        });
    },
    hideLoading () {
        wx.hideToast();
    },
    // rn修改联系人
    toModifyContact () {
        this.pageStatus.needFreshOrderStatus = true;
        const { orderId } = this.data;
        cwx.component.cwebview({
            data: {
                hideShareMenu: true,
                url: encodeURIComponent(`https://${rnHost}/webapp/cw/hotel/optionalDetail/ContactEditPage.html?operType=0&orderId=${orderId}&platform=wechat`),
                needLogin: true
            }
        });
    },
    getDateInfo ({ dateInfo = {} }) {
        const { checkIn, checkOut, checkInDesc, checkOutDesc, arrivalText, departureText, timeZoneOffset } = dateInfo;
        if (!checkIn && !checkOut) return;
        const inday = dateUtil.formatTime('yyyy-MM-dd', dateUtil.parse(checkIn));
        const outday = dateUtil.formatTime('yyyy-MM-dd', dateUtil.parse(checkOut));
        const timeZoneDate = new dateUtil.TimeZoneDate(null, null, timeZoneOffset / 3600);
        const indayDesc = commonfunc.getDateDisp(inday, timeZoneDate)?.[0] || '';
        const outdayDesc = commonfunc.getDateDisp(outday, timeZoneDate)?.[0] || '';
        return {
            indayDesc, // x月x日
            outdayDesc, // x月x日
            indayDisplay: `${indayDesc} ${checkInDesc} ${arrivalText}`, // x月x日, 周x, mm:ss后入住
            outdayDisplay: `${outdayDesc} ${checkOutDesc} ${departureText}`, // x月x日, 周x, mm:ss前离店
            inday,
            outday,
            days: dateUtil.calDays(checkIn, checkOut),
            tzone: timeZoneOffset
        };
    },
    handleCopyTelephone (e) {
        this.handleCopy(e);
    },
    constructSuiteInfo (room) {
        const roomPackageInfo = room.roomPackageInfo || {};
        const packageIdMap = {
            1: '住',
            2: '食',
            3: '享'
        };
        if (roomPackageInfo?.pkId && roomPackageInfo?.packageInfoList?.length) {
            room.isCalendarSuite = true;
            roomPackageInfo.packageInfoList.forEach(item => { item.icon = packageIdMap[item.type]; });
        }
        return room;
    },
    getBasicFacility (roomBasicInfo = {}) {
        const { baseRoomInfo, subRoomInfo } = roomBasicInfo;
        const { area, floor } = baseRoomInfo || {};
        const { bed, maxNum, windowDesc, smokingDesc } = subRoomInfo || {};
        const maxPerson = maxNum ? `可住${maxNum}人` : '';
        const basicFacility = [bed, maxPerson, area, windowDesc, smokingDesc, floor];
        return basicFacility.filter(item => item);
    },
    toggleRoomLayer () {
        const { showRoomLayer, subRoomInfo = {}, roomQuantity } = this.data;
        this.setData({ showRoomLayer: !showRoomLayer });
        !showRoomLayer && orderTrace.clickCheckinInfo(this, {
            pageId: this.pageId,
            type: 1,
            name: `${subRoomInfo.name}${roomQuantity}间`
        });
    },
    tapGotoMap (e) {
        const { coordinate, hotelInfo } = this.data;
        if (!coordinate) return;
        wx.openLocation({
            latitude: coordinate.lat,
            longitude: coordinate.lon,
            name: hotelInfo.name,
            address: hotelInfo.address
        });
        orderTrace.clickHotelCard(this, {
            pageId: this.pageId,
            type: 4
        });
    },
    callPhone (e) {
        const dataset = e.currentTarget.dataset;
        if (dataset.tel) {
            wx.makePhoneCall({
                phoneNumber: dataset.tel
            });
        }
        dataset.from === 'layer' && (orderTrace.imTrace(this, 'callphone'));
        dataset.from === 'hotelcardBtn' && orderTrace.clickHotelCard(this, {
            pageId: this.pageId,
            type: 3
        });
    },
    useCar (e) {
        const { useCarInfo = {} } = this.data;
        cwx.navigateTo({
            url: useCarInfo.jumpUrl
        });
    },
    handleCopy (e) {
        const { text = '', type = '' } = e?.currentTarget?.dataset || {};
        text && cwx.setClipboardData({
            data: text + '',
            success () {
                cwx.showToast({ title: '复制成功', icon: 'none', duration: 2000 });
            },
            fail (res) {
                cwx.showToast({ title: '复制失败', icon: 'none', duration: 2000 });
            }
        });
        type === 'address' && orderTrace.clickHotelCard(this, {
            pageId: this.pageId,
            type: 2,
            name: this.data.hotelInfo?.address
        });
    },
    goToDetail (e) {
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        const fromDetail = prevPage?.pageName === 'hotelDetail';
        // 联合会员渠道的订详点击酒店名称返回联合会员落地页
        const fromScan = prevPage?.pageName === 'CoMemberLanding';
        if (fromDetail || fromScan) {
            // 从酒详到填写页成功提交订单: 刷券和房型
            prevPage.pageStatus.needRefreshRoomList = true;
            prevPage.pageStatus.needRefreshCoupon = true;
            cwx.navigateBack();
            return;
        }
        const { hotelInfo: { hotelId, name }, dateInfo } = this.data;

        const { inday, outday } = dateInfo || {};
        const qs = inday && outday ? `&inday=${inday}&outday=${outday}` : '';
        if (hotelId) {
            cwx.navigateTo({
                url: `/pages/hotel/detail/index?id=${hotelId}${qs}`
            });
        }

        const type = e?.currentTarget?.dataset?.type;
        type === 'title' && orderTrace.clickHotelCard(this, {
            pageId: this.pageId,
            type: 1,
            name
        });
    },
    handleAskClick (e) {
        const type = e?.currentTarget?.dataset?.type;
        orderTrace.imTrace(this, type + '_click');
        orderTrace.clickCustomerService(this, {
            page: this.pageId
        });

        if (this.pageStatus.hasEBKIM) {
            this.toggleCustomerLayer(e);
            return;
        }
        this.handleAskService(e);
    },
    // 客服/联系酒店浮层
    toggleCustomerLayer (e) {
        const type = e?.currentTarget?.dataset?.type;
        let layerTitle = '';
        const data = this.data;
        type === 'askctrip' && (layerTitle = '客服');
        type === 'askhotel' && (layerTitle = '联系酒店');
        const concatInfo = {
            type,
            layerTitle,
            showCustomerLayer: !data.concatInfo.showCustomerLayer
        };

        this.setData({
            showMask: concatInfo.showCustomerLayer,
            concatInfo: {
                ...data.concatInfo,
                ...concatInfo
            }
        });
    },
    // 预订信息
    buildReservationInfo (res) {
        const {
            hotelInfo = {},
            confirmInfo = {},
            orderStatus = {},
            contactInfo = {},
            guestInfo = {},
            customerRemark = '',
            remarkList,
            reservationNoticeInfo, // 入住须知
            confirmNo,
            orderId = +this.options.id,
            dateInfo,
            canModifyContactInfo, // 是否可以修改联系人
            canResendConfirmInfo // 能否 发送确认信息
        } = res || {};
        const reservationInfoList = []; // 预订信息
        const reservateBtns = []; // 查看入住凭证、发送确认信息按钮

        const mergeInfo = (info) => {
            info && reservationInfoList.push(info);
        };
        const orderStatusCode = orderStatus.status;
        let { orderDate } = dateInfo || {};
        orderDate = dateUtil.formatTime('yyyy-MM-dd hh:mm:ss', dateUtil.parse(orderDate, true));
        // 入住人信息
        mergeInfo(getPassengerInfo(guestInfo));
        // 联系方式
        mergeInfo(getContactInfo(contactInfo, canModifyContactInfo));
        // 特殊要求
        mergeInfo(getSpecialNeeds(customerRemark, remarkList));
        // 入住须知
        mergeInfo(getNoticeInfo(reservationNoticeInfo));
        // 确认号
        orderStatusCode === 4 && mergeInfo(getSimpleInfo('确认号', confirmNo, 'confirm'));
        // 订单号
        mergeInfo(getSimpleInfo('订单号', orderId, 'orderid'));
        // 下单时间
        mergeInfo(getSimpleInfo('下单时间', orderDate, 'orderdate', false));
        // 预订信息底部按钮：查看入住凭证/发送确认信息
        getReservationBtn();

        return {
            reservationInfoList,
            reservateBtns
        };

        // 入住人信息
        function getPassengerInfo (guestInfo) {
            const { passengerList } = guestInfo;
            if (!passengerList || !passengerList.length) return;
            const psgInfo = {
                name: '入住人',
                type: 'guest'
            };
            const hasCardNo = passengerList.some(item => item.certification?.encryptCardNo?.length); // 是否存在证件号
            if (!hasCardNo) {
                psgInfo.content = passengerList.reduce((a, b) => a + ',' + b.maskName, '').substring(1);
            } else {
                psgInfo.contentList = [];
                passengerList.forEach(item => {
                    psgInfo.contentList.push(item.maskName);
                    if (item.certification?.encryptCardNo) {
                        const { encryptCardNo } = item.certification;
                        psgInfo.contentList.push(`${encryptCardNo}`);
                    }
                });
            }
            guestInfo.hasCardNo = hasCardNo;
            return psgInfo;
        }
        // 联系方式
        function getContactInfo (contactInfo, canModify) {
            const { maskEmail, phone } = contactInfo || {};
            if (!maskEmail && !phone) return;

            const { countryCode, maskContactPhone } = phone || {};
            const result = {
                name: '联系方式',
                type: 'contact',
                contentList: [],
                className: canModify ? ' wechat-font-edit' : '',
                event: 'toModifyContact',
                needCheckValid: true,
                traceBtnText: canModify ? '修改联系方式按钮' : ''
            };
            const tel = ['86', ''].includes(countryCode) ? maskContactPhone : `+${countryCode} ${maskContactPhone}`;
            result.contentList.push(tel);
            maskEmail && result.contentList.push(maskEmail);
            return result;
        }
        // 特殊要求
        function getSpecialNeeds (customerRemark, remarkList, canModify) {
            if (!customerRemark && !remarkList?.length) return;
            return {
                name: '特别要求',
                type: 'special-info',
                content: customerRemark + remarkList.reduce((a, b) => a + b.desc, ''),
                className: canModify ? ' wechat-font-edit' : '',
                event: 'modifySpecialTip',
                needCheckValid: true,
                traceBtnText: canModify ? '修改特别要求按钮' : ''
            };
        }
        // 入住须知
        function getNoticeInfo (noticeInfo) {
            if (!noticeInfo?.reservationNoticeTips?.length) return;
            const noticeItem = noticeInfo.reservationNoticeTips.filter(item => item.category !== 3) || [];
            if (noticeItem.length) {
                return {
                    name: '入住须知',
                    type: 'notice-tips',
                    content: '城市通知',
                    event: 'toggleNoticeLayer',
                    className: ' wechat-font-notice-tip',
                    traceBtnText: '入住须知按钮'
                };
            }
        }
        // 确认号、订单号、下单时间
        function getSimpleInfo (title, content, type, hasIcon = true) {
            if (!content) return;
            return {
                name: title,
                type,
                content,
                className: hasIcon ? 'wechat-font-copy' : '',
                event: 'handleCopy',
                traceBtnText: hasIcon ? `${title}复制按钮` : ''
            };
        }
        // 查看入住凭证/发送确认信息
        function getReservationBtn () {
            (!hotelInfo.isInterHome || (hotelInfo.isInterHome && confirmInfo.entranceButtom)) &&
            [4, 5, 6].includes(orderStatusCode) &&
            reservateBtns.push({
                title: '查看入住凭证',
                icon: 'wechat-font-certificate',
                event: 'checkVoucher',
                needCheckValid: true,
                traceBtnText: '查看入住凭证'
            });
            // 发送确认信息
            canResendConfirmInfo &&
            reservateBtns.push({
                title: '发送确认信息',
                icon: 'wechat-font-send-message',
                event: 'sendConfirmMessage',
                needCheckValid: true,
                traceBtnText: '发送确认信息'
            });
        }
    },
    handleReservationBtn (e) {
        const { event, traceText, checkValid } = e?.currentTarget?.dataset || {};
        const operate = checkValid ? 'checkValidOperate' : event;
        operate && this[operate](e);
        orderTrace.clickReservateInfo(this, {
            page: this.pageId,
            buttonType: traceText
        });
    },
    /* nps */
    handleScoreSelect (e) {
        const dataset = e.currentTarget.dataset;
        const score = ~~dataset.score;
        let { nps } = this.data;
        nps = {
            ...nps,
            score,
            feedBackTitle: score >= 9 ? '您愿意推荐携程的原因是：' : (score < 7 ? '请填写您打低分的最主要原因：' : '您觉得携程有哪些方面需要改进：'),
            showFeedBack: true
        };

        this.setData({
            nps
        });

        this.scrollToElmById('#nps');
        orderTrace.clickNps(this, {
            pageId: this.pageId,
            type: 1,
            score
        });
    },
    inputNpsTrace () {
        orderTrace.clickNps(this, {
            pageId: this.pageId,
            type: 3
        });
    },
    // 发送确认信息
    sendConfirmMessage () {
        const { orderId } = this.data;
        cwx.component.cwebview({
            data: {
                url: encodeURIComponent(`https://${rnHost}/webapp/cw/hotel/optionalDetail/ContactEditPage.html?operType=1&orderId=${orderId}&platform=wechat`),
                needLogin: true,
                hideShareMenu: true
            }
        });
    },
    // 修改特别要求
    modifySpecialTip () {
        this.pageStatus.needFreshOrderStatus = true;
        const { orderId } = this.data;
        cwx.component.cwebview({
            data: {
                url: encodeURIComponent(`https://${rnHost}/webapp/cw/hotel/optionalDetail/SpecialRequirementPage.html?orderId=${orderId}&platform=wechat`),
                needLogin: true,
                hideShareMenu: true
            }
        });
    },
    // 查看入住凭证
    checkVoucher () {
        this.pageStatus.needFreshOrderStatus = true;
        const { orderId, orderStatus, hotelInfo } = this.data;
        const isGangAoTai = this.isHMT() ? 1 : 0;
        const query = `orderID=${orderId}&orderStatus=${orderStatus.status}&hotelId=${hotelInfo.hotelId}&isGangAoTai=${isGangAoTai}`;
        cwx.component.cwebview({
            data: {
                url: encodeURIComponent(`https://${rnHost}/webapp/cw/hotel/optionalDetail/ConfirmPage.html?${query}&platform=wechat`),
                needLogin: true,
                hideShareMenu: true
            }
        });
    },
    /**
     * 是否港澳台
     */
    isHMT () {
        const { hotelInfo } = this.data;
        const { cityId, provinceId } = hotelInfo || {};
        return [58, 59].includes(cityId) || provinceId === 53;
    },
    bindFormSubmit (e) {
        this.setData({
            showLoading: true
        });
        const self = this;
        const ps = this.pageStatus;
        const { orderId, nps } = this.data;
        const npstextarea = e.detail.value.textarea;
        const reqData = {
            questionId: 1,
            orderId: orderId + '',
            score: nps.score,
            comment: npstextarea
        };
        orderTrace.clickNps(self, {
            pageId: self.pageId,
            type: 2
        });

        reqUtil.submitNps(reqData, (data) => {
            this.setData({
                showLoading: false
            });
            if (!data) return;
            const resultCode = data.resultCode;
            if (resultCode === 200 || resultCode === 201) {
                // 更换提交成功样式
                self.setData({
                    'nps.submitted': true
                });
                // 3s后nps模块消失
                clearTimeout(ps.npsTimer);
                ps.npsTimer = setTimeout(() => {
                    self.setData({
                        'nps.show': false
                    });
                }, 3000);
            }
        }, (err) => {
            this.setData({
                showLoading: false
            });
            cwx.showToast({ title: err || '网络出错，请稍后再试', icon: 'none', duration: 3000 });
        });
    },
    scrollToElmById (id, duration = 300) {
        try {
            if (!id) return;

            const query = wx.createSelectorQuery();
            query.selectViewport().scrollOffset();
            query.select(id).boundingClientRect();
            query.exec((res) => {
                const miss = res[0].scrollTop + res[1].height;
                wx.pageScrollTo({
                    scrollTop: miss,
                    duration
                });
            });
        } catch (err) {
            // console.log(err);
        }
    },
    // nps位于第一屏，价格模块下方
    handleNpsInfo (res) {
        const { orderStatus, dateInfo, homestay, nps } = res;
        const { checkIn, localNow } = dateInfo || {};

        if (!localNow || !checkIn) return {};
        let showTopNps = false;
        if ([5, 6].includes(orderStatus)) {
            showTopNps = true;
        } else if (orderStatus === 4) {
            const currentDate = dateUtil.parse(localNow).getTime();
            const checkInDate = dateUtil.parse(checkIn).getTime();
            // 入住日第二天8点后上移
            showTopNps = currentDate > checkInDate + SHOW_NPS_DELAY_TIME;
        }
        return {
            show: !!(nps?.maxScore),
            topPosition: showTopNps,
            title: `预订${homestay ? '民宿' : '酒店'}，您愿意推荐好友使用携程吗？`
        };
    },
    // 消息订阅
    buildSubscribeInfo (subscribed) {
        let orderSubscribe = this.data.orderSubscribe;
        if (subscribed !== undefined) {
            orderSubscribe = {
                ...orderSubscribe,
                state: subscribed,
                display: [0, 1].includes(subscribed)
            };
        }
        return orderSubscribe;
    },
    subscribeMsgCb () {
        const { orderId } = this.data;
        this.setData({
            'orderSubscribe.state': 1
        });
        wechatMarket.wechatMsgFormIds({
            openId: cwx.cwx_mkt.openid,
            orderId: orderId + ''
        });
    },
    // 卖点页
    gotoSellingPoint (e) {
        const { hotelInfo, dateInfo = {} } = this.data;
        const hotelId = hotelInfo?.hotelId;
        const inday = dateInfo.inday || dateUtil.today();
        const outday = dateInfo.outday || dateUtil.tomorrow();
        if (!hotelId) return;
        const { type } = e?.currentTarget?.dataset;
        let qs = `hotelid=${hotelId}&disablemoreroom=1&checkin=${inday}&checkout=${outday}`;
        type && (qs += `&type=${type}`);
        cwx.component.cwebview({
            data: {
                hideShareMenu: true,
                url: encodeURIComponent(`https://${h5Host}/webapp/hotels/sellingpoint?${qs}`)
            }
        });
    },
    handleMealInfo (mealInfo = {}) {
        mealInfo = _.assignIn(this.data.mealInfo, mealInfo);
        const {
            dailyMealList = [],
            mealPolicyList = []
        } = mealInfo;
        const totalMealList = dailyMealList.concat(mealPolicyList);
        mealInfo.hasToggleBtn = totalMealList.length > 4;
        totalMealList.length === 0 && totalMealList.push({ title: '房型不含早餐', noMeal: true });
        mealInfo.dailyMealList = totalMealList;
        return mealInfo;
    },
    // 套餐字段构建, 套餐type： 1、住，2、食，3、享，4、礼盒，5、入住即享
    buildPackageInfo (packageModel) {
        if (!packageModel) return;
        const ps = this.pageStatus;
        let { packgeInfos = [], title: suiteTitle } = packageModel;
        // 构建需要渲染的字段
        // packageDescList中只使用了xItems字段，把xItems汇总，拉到同一层级
        packgeInfos = packgeInfos.map(item => {
            const { packageDescList, title, type } = item;
            const xItems = packageDescList?.reduce((a, b) => {
                return b.xItems?.length ? a.concat(b.xItems) : a;
            }, []);
            return ({
                title,
                type,
                xItems: xItems || []
            });
        });
        // 抽离xproduct项的所有xItems
        const getXItemInfo = (suiteList = [], isMealSuite) => {
            if (!suiteList.length) return;
            const allXItems = suiteList.reduce((a, b) => a.concat(b.xItems), []);
            const [topXItems, bottomXItems] = [[], []];
            // 需预约在上，不需预约在下，平铺展示
            allXItems.forEach(xitem => {
                // 门票单独处理
                if (!xitem.highValueTicket) {
                    xitem.showAppoint ? topXItems.push(xitem) : bottomXItems.push(xitem);
                }
            });
            const itemLength = isMealSuite ? allXItems.length : (ps.travelCouponLength + allXItems.length);
            return {
                type: isMealSuite ? 'meal' : 'giftwithsuite',
                showMore: true, // 默认展开
                title: isMealSuite ? suiteList[0].title : suiteTitle,
                xItems: topXItems.concat(bottomXItems),
                hasToggleBtn: itemLength > 3
            };
        };

        // 套餐另含餐食
        const mealSuite = packgeInfos.filter(item => item.type === 2);
        // 3、享，4、礼盒，5、入住即享
        const giftWithSuite = packgeInfos.filter(item => [3, 4, 5].includes(item.type));

        return {
            mealSuite: getXItemInfo(mealSuite, true) || null,
            giftWithSuite: getXItemInfo(giftWithSuite) || null
        };
    },
    // 套餐内的高价值门票，需要放上方展示
    buildHighValueTicket (packageModel, orderStatus) {
        if (!packageModel || !packageModel.packageXOrderCardInfos?.length) return;

        const { packageXOrderCardInfos: xProductList, packgeInfos } = packageModel;
        const ticketList = [];
        xProductList.forEach(item => {
            const {
                orderStatus: status = 0,
                token = '',
                showAppoint = false,
                url = '',
                name,
                highValueTicket = false,
                tips
            } = item;
            if (highValueTicket) {
                // 如果是已取消状态，隐藏其他信息; 1=已提交; 2=已成交; 4=已取消; 8=已付款; 16=确认中; 32=确认失败; 64=已确认; 1024=已退款
                const hideOtherInfo = status === 4;
                // 当前门票的详情信息
                const enjoyXProducts = packgeInfos.find(item => item.type === 3) || {};
                const enjoyXPackageDesc = enjoyXProducts.packageDescList?.find(item => item.type === 3) || {};
                const detail = enjoyXPackageDesc.xItems?.filter(item => item.token === token);

                ticketList.push({
                    ...item,
                    title: name,
                    type: 'ticket',
                    tips: hideOtherInfo ? [] : tips,
                    xItems: detail,
                    cancelText: hideOtherInfo ? '已取消' : '',
                    showAppointBtn: [4, 5, 6, 15].includes(orderStatus) && showAppoint, // 当前门票是否展示“预约门票”按钮
                    jumpUrl: url ? `${url}&isHideNavBar=YES` : '', // 门票跳转的URL
                    btnText: showAppoint ? '去预约' : '去查看' // 按钮文案
                });
            }
        });
        return ticketList;
    },
    toggleDetail (type) {
        const dataToSet = this.data[type];
        dataToSet && this.setData({
            [`${[type]}.showMore`]: !dataToSet.showMore
        });
    },
    toggleBreakfastDetail () {
        const { title, showMore } = this.data.mealInfo || {};
        orderTrace.clickMealInfo(this, {
            pageId: this.pageId,
            title,
            showMore
        });
        this.toggleDetail('mealInfo');
    },
    // 套餐内所含餐食
    toggleMealSuite () {
        const { mealSuite } = this.data;
        this.clickSuiteTrace('clickMealSuite', mealSuite.showMore ? 2 : 3);
        this.toggleDetail('mealSuite');
    },
    // 已购及赠送服务
    toggleGiftSuite () {
        const { giftWithSuite } = this.data;
        this.clickSuiteTrace('clickGiftInfo', giftWithSuite.showMore ? 2 : 3);
        this.toggleDetail('giftWithSuite');
    },
    // 套餐浮层, 每次展开收起时，初始化菜单、套餐详情展开态
    toggleSuiteLayer (e) {
        const type = e.currentTarget?.dataset?.type;
        const ticketidx = e.currentTarget?.dataset?.ticketidx;
        const { ticketList, giftWithSuite, mealSuite, suiteLayer } = this.data;
        const show = suiteLayer.show;
        // 浮层关闭时不需要设置suiteLayer的内容
        if (show) {
            this.setData({
                showMask: false,
                'suiteLayer.show': false
            });
            return;
        }
        const suitInfoMap = {
            giftwithsuite: giftWithSuite,
            meal: mealSuite,
            ticket: ticketList[ticketidx]
        };
        this.setData({
            showMask: true,
            suiteLayer: {
                type: type || '',
                moreMenu: {},
                moreSuite: {},
                show: true,
                suiteInfo: suitInfoMap[type]
            }
        });
        type === 'giftwithsuite' && this.clickSuiteTrace('clickGiftInfo', 1);
        type === 'meal' && this.clickSuiteTrace('clickMealSuite', 1);
    },
    clickSuiteTrace (event, value) {
        orderTrace[event](this, {
            pageId: this.pageId,
            type: value
        });
    },
    // 套餐浮层内的菜单展开/收起
    toggleMoreMenu (e) {
        const { index } = e.currentTarget?.dataset || {};
        if (index === undefined) return;
        const moreMenu = this.data.suiteLayer.moreMenu[index];
        this.setData({
            [`suiteLayer.moreMenu.${index}`]: !moreMenu
        });
    },
    toggleMoreSuite (e) {
        const { index } = e.currentTarget?.dataset || {};
        if (index === undefined) return;
        const moreSuite = this.data.suiteLayer.moreSuite[index];
        this.setData({
            [`suiteLayer.moreSuite.${index}`]: !moreSuite
        });
    },
    // 扫码住订单信息处理, 携程旅行网公众号推送 增加WIFI、发票、商城、X产品（门票、用车）等推荐
    handleSmzOrder (isSmz) {
        const { dateInfo, hotelInfo } = this.data;
        const { sourcefrom, officialSmz } = this.pageStatus;
        if (isSmz === 1 || (sourcefrom === 'official' && officialSmz)) {
            const checkoutdate = new Date(dateInfo.outday);
            checkoutdate.setHours(23);
            checkoutdate.setMinutes(59);
            checkoutdate.setSeconds(59);
            if (new Date() > checkoutdate) return;

            const params = {
                hotelID: ~~hotelInfo.hotelId,
                codeID: ''
            };
            reqUtil.getModule(params, (res) => {
                if (!res.functions || res.functions.length <= 1) {
                    return;
                }

                const functions = [];
                res.functions.forEach(func => {
                    if (['1', '9'].includes(func.id)) return;

                    Object.assign(func, {
                        ubtKey: sourcefrom === 'official'
                            ? `HTL_c_WeChatAPP_orddtl_official_smzmoduleid_${func.id}_c`
                            : `xcx_hotel_orderdetail_go_smzmoduleid_${func.id}`
                    });
                    functions.push(func);
                });

                if (functions.length <= 0) {
                    return;
                }

                this.setData({
                    smzModule: {
                        show: true,
                        functions
                    }
                });
            });
        }
    },
    goAggregate (e) {
        const targetTypeAttrs = {
            H5: 1,
            Page: 2,
            miniProgram: 3
        };
        const self = this;
        const dataset = e.currentTarget.dataset;
        const func =
            self.data.smzModule.functions.find(f => f.id === dataset.id);

        const { jumpType, targetType, h5, page, miniProgram } = func;

        const action = jumpType === 1 ? 'navigateTo' : 'redirectTo';

        if (self.pageStatus.sourcefrom === 'official') {
            orderTrace.clicksmzfunction(self, {
                hotelId: self.data.hotelInfo.hotelId,
                id: dataset.id
            });
        }

        // 打车，门票强制登陆后跳转，并屏蔽联合登陆
        if (func.id === '7' || func.id === '8') {
            huser.checkLoginStatus(true)
                .then(isLogin => {
                    if (isLogin) {
                        checkJumpType();
                        return;
                    }

                    huser.login({
                        param: {
                            IsAuthentication: 'F'
                        },
                        callback (res) {
                            if (res && res.ReturnCode === '0') {
                                checkJumpType();
                            }
                        }
                    });
                })
                .catch(() => {
                });

            return;
        }

        checkJumpType();

        function checkJumpType () {
            if (targetType === targetTypeAttrs.Page) {
                doJump(action, page.url);
                return;
            }

            if (targetType === targetTypeAttrs.H5) {
                doJump(
                    action,
                    `/pages/hotel/components/webview/webview?data=${JSON.stringify({
                        needLogin: h5.needLogin,
                        url: encodeURIComponent(h5.url)
                    })}`
                );
                return;
            }

            if (targetType === targetTypeAttrs.miniProgram) {
                const { appId, path } = miniProgram;
                cwx.navigateToMiniProgram({
                    appId,
                    path
                });
            }
        }
        function doJump (action, url) {
            try {
                cwx[action]({
                    url
                });
            } catch (e) {
                // do nothing
            }
        }
    },
    // 资质备案
    checkHotelQualification () {
        const self = this;
        if (self.pageStatus.hasCheckQualification) return;
        self.pageStatus.hasCheckQualification = true;
        const keys = ['display_hotel_homestay'];
        // 资质入口是否展示依赖酒店ID，不与其他开关一起下发
        commonrest.getWechatSoaSwitch(keys, (data) => {
            if (data) {
                const rs = data.result || [];
                const item = rs[0] || {};
                const opened = item.value === '1';

                if (opened) {
                    self.showHotelQualificationPart();
                }
            }
        });
    },
    // 资质备案
    showHotelQualificationPart () {
        const self = this;
        const { hotelId } = this.data.hotelInfo;
        if (hotelId) {
            const successFunc = (data) => {
                if (!data) return;
                const { isJapaneseHome: isJapanHomestay, name, businessNum, certificationNum, certificationDate, healthPlace } = data;
                let homestayDisplay = self.data.homestayDisplay;
                if (isJapanHomestay) {
                    // 有一个属性有值则为true
                    homestayDisplay = !!(name || businessNum || certificationNum || certificationDate || healthPlace);
                }
                self.setData({
                    homestayDisplay
                });
            };
            reqUtil.doHomestayRequest({ hotelId }, successFunc);
        }
    },
    // 砍价浮层
    handleBargainLayer () {
        const self = this;
        const ps = this.pageStatus;
        if (ps.hasShownBargainLayer || !this.data.isWechat) return;

        ps.hasShownBargainLayer = true;
        const { hotelInfo, orderStatus, orderId } = self.data;
        const tasks = [];
        tasks.push(
            new HPromise((resolve) => {
                hrequest.hrequest({
                    url: model.serveUrl('wechatbargaindetail'),
                    checkAuth: true,
                    data: {
                        orderStatus: orderStatus.statusCode,
                        masterHotelId: hotelInfo.masterHotelId + '',
                        orderId: orderId + ''
                    },
                    success: function (res) {
                        resolve(res);
                    },
                    fail: function () {
                    }
                });
            })
        );
        tasks.push(
            new HPromise((resolve) => {
                commonrest.getWechatSoaSwitch(['BargainOrderTitle', 'BargainOrderTitleEnd', 'BargainOrderSubTitle', 'BargainOrderButtonText', 'BargainOrderLayerSwitch'], (switches) => {
                    resolve(switches);
                }, 'json');
            })
        );
        HPromise.all(tasks)
            .then((options) => {
                const { status = 0, maxAmount, type, showBlock, bargain, statusMessage } = options[0].data || {};
                const {
                    BargainOrderLayerSwitch: bargainOrderLayerSwitch,
                    BargainOrderTitle: bargainTitle,
                    BargainOrderTitleEnd: bargainTitleEnd,
                    BargainOrderSubTitle: bargainSubTitle,
                    BargainOrderButtonText: bargainButtonText
                } = options[1].result || {};
                const showBargainBlock = showBlock && ![7, 8, 9].includes(orderStatus.status);
                if (+bargainOrderLayerSwitch !== 1) {
                    this.setData({
                        'bargain.showBargainBlock': showBargainBlock
                    });
                    return;
                }

                const showCashBackText = type === 1;
                // 订单卡片文案根据status映射
                const getBackUpBtnText = (status) => {
                    let btnText = '';
                    status === 1 && (btnText = `你有${maxAmount}元现金待领取`);

                    if (status === 2) {
                        const tickReg = /\d+(\+\d+)?/;
                        const ticks = tickReg.exec(bargain.beginTime);
                        const beginTime = new Date(parseInt(ticks[0], 10));
                        beginTime.setDate(beginTime.getDate() + 1);
                        const remainSeconds = Math.floor((beginTime.getTime() - (new Date()).getTime()) / 1000);
                        if (remainSeconds > 0) {
                            return '助力返现进行中';
                        }
                    }
                    [3, 4, 5].includes(status) && (btnText = '闯关结束');
                    status === 6 && (btnText = `返现¥${bargain.currentAmount}已到账`);
                    [7, 8].includes(status) && (btnText = '闯关失败');
                    return btnText;
                };

                const hasPopped = Storage.getStorage(C.STORAGE_BARGAIN_LAYER_POPED);
                !hasPopped && Storage.setStorage(C.STORAGE_BARGAIN_LAYER_POPED, 1, C.STORAGE_BARGAIN_LAYER_EXPIRED_TIME);
                self.setData({
                    bargain: {
                        showBargainBlock,
                        showLayer: status === 1 && !hasPopped,
                        topBtnText: statusMessage || getBackUpBtnText(), // 订单卡片按钮文案
                        title: showCashBackText ? '您有待领取的返现' : bargainTitle,
                        titleEnd: bargainTitleEnd,
                        subTitle: showCashBackText ? '邀请好友领现金，满3人可返现' : bargainSubTitle,
                        buttonText: showCashBackText ? '去领取' : bargainButtonText,
                        amount: maxAmount
                    }
                });
                if (showBargainBlock) {
                    orderTrace.cutpriceshow(self, {
                        region: hotelInfo.isOversea ? 'Oversea' : 'Inland',
                        orderid: orderId,
                        status: orderStatus.status && orderStatus.name
                    });
                }
            });
    },
    closeBargainLayer () {
        this.setData({
            'bargain.showLayer': false
        });
    },
    // 保存formid
    submitFromId (e) {
        const { type } = e.currentTarget.dataset;
        const { orderId } = this.data;
        const formid = e.detail.formId;
        wechatMarket.wechatSendSmsAfterSixDays({
            formid,
            oid: orderId + ''
        });
        type === 'btn' && orderTrace.clickPriceArea(this, {
            pageId: this.pageId,
            type: 3
        });
    },
    setPageIdCom (isOversea) {
        const pageId = isOversea ? '10650002404' : '10320654896';
        pageId !== this.pageId && util.exUbtSendPV(this, { pageId });
    },

    // 问酒店/问携程
    handleAskService (e) {
        const ps = this.pageStatus;
        if (ps.askHotelProcessing) return;
        ps.askHotelProcessing = true;

        const type = e?.currentTarget?.dataset?.type; // askhotel: 问酒店; askctrip: 问携程
        const pageCode = this.pageId;
        const {
            orderId,
            hotelInfo,
            concatInfo,
            priceSummaryList,
            dateInfo,
            roomQuantity,
            hourTimeInfo,
            subRoomInfo
        } = this.data;
        concatInfo.showCustomerLayer && this.setData({
            showMask: false,
            'concatInfo.showCustomerLayer': false
        });

        const { amount, currency, cnyAmount } = priceSummaryList?.[0] || {};
        const { days, indayDesc, outdayDesc } = dateInfo;
        const desc = hourTimeInfo?.hourRoomDesc ? `${hourTimeInfo.checkInDesc} ${hourTimeInfo.hourRoomDesc} ${roomQuantity}间` : `${indayDesc}-${outdayDesc} ${roomQuantity}间${days}晚`;
        let sceneCode = 0;
        type === 'askhotel' && (sceneCode = 2);

        const otherParams = {
            channel: 'HTL',
            appId: 5227,
            question: '',
            source: '',
            orderInfo: {
                ctype: 'ORD',
                cid: orderId + '',
                biz: 'HTL',
                desc, // 订单描述,
                title: hotelInfo.name, // 标题,
                price: amount || cnyAmount, // 价格,
                currency: currency === '¥' ? 'RMB' : currency,
                supplierId: hotelInfo.hotelId, // 酒店：hotelid
                supplierName: hotelInfo.name, // 酒店：酒店名称
                supplierPid: subRoomInfo.id // 酒店：房型id
            }
        };
        ps.askHotelProcessing = false;
        commonfunc.askHotel(0, pageCode, hotelInfo.isOversea, sceneCode, '', otherParams);
    },

    // 砍价入口
    goToJoin (e) {
        const { orderId } = this.data;
        const { rawData } = e.detail;
        // rawData可能undefined(如用户拒绝授权时)
        if (!orderId || !rawData) return;

        const { nickName, avatarUrl } = JSON.parse(rawData);
        cwx.navigateTo({
            url: `/pages/hotelplanning/market/assistcutprice/index?orderId=${orderId}&nickName=${encodeURIComponent(nickName)}&avatar=${encodeURIComponent(avatarUrl)}`
        });
    },

    onShareAppMessage: function () {
        const { hotelInfo = {}, roomBasicInfo = {}, dateInfo = {}, orderId } = this.data;
        const { name: hotelName, logoPic } = hotelInfo;
        const { quantity = 1, name: roomName } = roomBasicInfo.subRoomInfo || {};
        const indayDis = dateInfo.indayDisplay.substring(0, 5);
        const outdayDis = dateInfo.outdayDisplay.substring(0, 5);
        const shareTitle = `我预订了${hotelName}，${quantity}间${roomName}，${indayDis}入住，${outdayDis}离店`;
        const shareUrl = `https://${h5Host}/webapp/hotels/sharejourney?orderid=${orderId}&shareFrom=wechat&isNewVersion=1`;

        const data = {
            url: encodeURIComponent(shareUrl),
            title: encodeURIComponent(shareTitle),
            image: encodeURIComponent(logoPic)
        };

        return {
            bu: 'hotel',
            title: shareTitle || '携程酒店',
            path: `pages/hotel/components/webview/webview?data=${JSON.stringify(data)}`,
            imageUrl: logoPic
        };
    },
    // 各个曝光埋点
    sendShowTrace () {
        const self = this;
        try {
            const {
                orderId,
                orderCardList = [],
                operateBtns = [],
                reservationInfoList = [],
                reservateBtns = [],
                mealInfo = {},
                mealSuite,
                giftWithSuite,
                coordinate,
                hotelTelInfo,
                hotelInfo,
                reservationOrder,
                priceSummaryList,
                bargain,
                cancelInfo
            } = self.data;
            orderTrace.showOrderStatus(self, {
                page: self.pageId
            });
            orderTrace.showCustomerEntrance(self, {
                page: self.pageId
            });
            orderId && orderTrace.showOrderId(self, {
                page: self.pageId,
                orderid: orderId,
                buttonText: ''
            });
            orderCardList.length && orderTrace.showOrderCard(self, {
                page: self.pageId
            });
            operateBtns.length && orderTrace.showOperateBtn(self, {
                page: self.pageId,
                buttonType: operateBtns.slice(0, 4).reduce((a, b) => a + ',' + b.name, '')
            });
            const reservateBtnText = reservationInfoList.concat(reservateBtns)?.reduce((a, b) => b?.traceBtnText ? (a + ',' + b.traceBtnText) : a, '')?.substring(1);
            reservateBtnText && orderTrace.showReservateInfo(self, {
                page: self.pageId,
                buttonType: reservateBtnText
            });
            const showNpsTrace = () => {
                orderTrace.showNps(self, {
                    page: self.pageId,
                    buttonType: 'nps分数'
                });
            };
            self.watchDOMElement('#nps', showNpsTrace);
            orderTrace.showMealInfo(self, mealInfo);
            mealSuite && orderTrace.showMealSuite(self, {
                page: self.pageId,
                buttonType: '套餐信息' + (mealSuite.hasToggleBtn ? ',展开按钮' : '')
            });
            giftWithSuite && orderTrace.showGiftInfo(self, {
                page: self.pageId,
                buttonType: '套餐信息' + (giftWithSuite.hasToggleBtn ? ',展开按钮' : '')
            });
            orderTrace.showCheckinInfo(self, {
                pageId: self.pageId
            });
            orderTrace.showHotelCard(self, {
                pageId: self.pageId,
                coordinate,
                hotelTelInfo,
                hotelInfo
            });
            orderTrace.showPriceArea(self, {
                pageId: self.pageId,
                reservationOrder,
                priceSummaryList,
                bargain,
                cancelInfo
            });
        } catch (e) {
        }
    },
    loadTimeTrace (isSuccess) {
        const ps = this.pageStatus;
        if (ps.needLoadFinishTrace) {
            ps.needLoadFinishTrace = false;
            orderTrace.timeConsuming(this, {
                type: 'orderdetail_new',
                pageId: this.pageId,
                source: isSuccess ? 'orderdetail_load_finish' : 'orderdetail_load_error',
                time: Date.now() - ps.preTime
            });
        }
    },
    // 监听DOM元素是否展示
    watchDOMElement (selector, callback) {
        const self = this;
        const ps = self.pageStatus;
        const observer = wx.createIntersectionObserver(self);
        ps.observer = observer;
        if (ps.showTraceIsSend[selector]) return;
        observer.relativeToViewport({ bottom: 0 }).observe(selector, () => {
            ps.showTraceIsSend[selector] = true;
            callback && callback();
            observer.disconnect();
        });
    },
    unLoad () {
        const ps = this.pageStatus;
        if (ps.observer) {
            ps.observer.disconnect();
            delete ps.observer;
        }
    },
    // 上拉刷新
    handlePullDownRefresh () {
        const { showFishBone, showLoading, showFreshLoading } = this.data;
        if (!showFishBone && !showLoading && !showFreshLoading) {
            this.setData({
                showFreshLoading: true
            });
            this.updateOrderStatus();
        }
    },
    stopPullDownRefresh () {
        this.setData({
            showFreshLoading: false
        });
    },
    // 锚定功能
    scrollToElement (e) {
        const domId = e.currentTarget.dataset.domid;
        this.setData({
            toView: domId
        });
    },
    // 计算自定义头部和底部操作按钮的高度 单位:px
    async getContentHeight () {
        const mpNavElement = await commonfunc.getBoundingClientRect('#mp-navigation');
        const mpNavHeight = mpNavElement?.height || 0; // 计算自定义头部高度
        const bottomHeight = 166 / (750 / cwx.getSystemInfoSync().windowWidth); // rpx转换为px，其中166是底部操作按钮的高度，换算比例：750 / cwx.getSystemInfoSync().windowWidth
        return mpNavHeight + bottomHeight;
    },
    noop () {}
});
