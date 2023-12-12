import {
  _,
  __global,
  cwx,
  CPage,
  Pservice,
  cDate,
  URLUtil,
  orderUtils,
  BusRouter,
  BusDetail,
  Utils,
  BusConfig,
  BusShared,
} from '../index.js';

var Passenger = require('../common/template/passengerModel.js');
var PassengerUtil = Passenger.PassengerUtil;

import Modal from '../common/template/Modal';
import CustomModal from '../common/template/CustomModal';

import getInsuranceClause from '../common/getInsuranceClause.js';

var AppConfig = BusConfig.configWithAppid(__global.appId);

var inputContent = {};

var roundomCount = {};

const systemInfoSync = wx.getSystemInfoSync();

CPage({
  customStyle: 'custom',
  pageCallback: null,
  _DAY1: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  inputContent: {},
  data: {
    statusBarHeight: global.globalData.statusBarHeight,
    titleBarHeight: global.globalData.titleBarHeight,
    showPkgPage: false,
    navbarData: {
      customBack: true,
      showCapsule: false,
    },
    detail: {},
    purseInfo: {},
    saleList: [],
    packageList: [],
    selectPagckageIndex: -1,
    showAllPackage: false,
    inSelectX: false,
    xList: [],
    passList: [],
    memberPas: [],
    allMemberPas: [],
    ticketPicker: null,
    passengerListSlice: [],
    showAllPassenger: false,
    delPassId: null,
    actionSheetHidden: true,
    acceptFloat: false, // 备选车次
    totalPrice: 0,
    originTotalPrice: 0,
    isShowInvoice: false,
    isNeedInvoice: false,
    insDesc: '', // 保险套餐说明文案
    showInsDesc: false, // 控制保险套餐说明文案
    phoneNum: '',
    rewardChannel: true,
    servicePrice: 0,
    isNewCustomer: true,
    isSupportNewUser: false,
    usedCoupon: null,
    couponList: [],
    maxCoupon: null,
    isLoading: true,
    showType: '',
    priceList: [],
    utmSource: '',
    bShowTip: false,
    extraSale: {},
    showExplainIndex: 0,
    hasVirusIns: false,
    hasVirusInsChecked: false,
    lotteryCouponPrice: '',
    effectiveTime: '',
    renderLottery: false,
    hotelDiscountTip: {},
    isAgreeChild: false,
    moveAnim: {},
    isSelectChild: false,
    newUseBannerDesc: [],
    showServiceInfo: true,
    supportAfterPay: false,
    supportOcr: AppConfig.supportOcrComponent,
    selectXlist: {},
    selectPackage: {},
    showInsuranceModal: false,
    selectInstantDeductionCard: false,
    showInstantDeductionModal: false,
    showInstantDeductionRule: false,
    isShowDeductionCard: true,
    reductionCardInfo: {},
    usedDeductionCard: false,
    buyTicketRule: {},
  },
  beforOnload(options) {
    console.log(options);
  },
  showMask: function () {
    this.setData({
      isShowMask: true,
    });
  },
  hideMask: function () {
    this.setData({
      isShowMask: false,
      showPriceDetail: false,
      showType: '',
    });
  },
  bindInputChange: function (e) {
    inputContent[e.currentTarget.id] = e.detail.value;
    if (e.currentTarget.id == 'phone') {
      this.setData({
        phoneNum: e.detail.value,
      });
    }
  },
  togglePriceDetail: function (e) {
    console.log('togglePriceDetail');
    if (!this.data.showPriceDetail) {
      this.onUbtTrace(
        'click',
        'book_payPriceDetail_button',
        '填写页支付按钮旁边的“明细上拉按钮”',
        ''
      );
    }
    this.setData({
      showPriceDetail: !this.data.showPriceDetail,
      isShowDeductionCard: this.data.showPriceDetail ? true : false,
      showInstantDeductionModal: false,
      showInstantDeductionRule: false,
    });
  },
  changeFloat: function () {
    this.onUbtTrace(
      'click',
      'book_otherTrip_button',
      '填写页备选车次选择按钮',
      ''
    );
    this.setData({
      acceptFloat: !this.data.acceptFloat,
    });
  },
  changeUsePurseFloat: function () {
    this.setData(
      {
        rewardChannel: !this.data.rewardChannel,
      },
      () => {
        this.countPrice(this.data);
      }
    );
  },

  onSelectNewUser: function () {
    this.setData({
      isNewCustomer: !this.data.isNewCustomer,
    });
  },

  //显示常旅列表
  choosePassengers: function (e) {
    this.onUbtTrace('click', 'book_passengerAdd_button', '填写页添加乘客', '');
    let self = this;
    BusRouter.checkLogin(2).then(() => {
      self.setData({
        showType: 'pas',
      });
    });
  },
  cancelPasChoose() {
    this.resetChoosen(this.data.passList);
    this.hideMask();
  },

  resetChoosen(passList) {
    var list = [];
    if (passList) {
      list = passList;
    } else {
      var list = [];
      let pasList = this.data.memberPas.filter((p) => p.chosen);
      for (var i = 0; i < pasList.length; i++) {
        var item = pasList[i];
        var pas = Passenger.getPassengerInfo(item);
        if (pas.cardName && pas.cardNum) {
          list.push(pas);
        }
      }
    }
    this.storePassengerData(list);
  },

  confirmPasChoose() {
    this.resetChoosen();
    this.hideMask();
  },

  checkAddable(all) {
    return _.find(all, (p) => !p.isChild);
  },

  selectX(e) {
    this.setData({
      inSelectX: false,
    });
  },

  onShowOfferDesc(e) {
    this.onUbtTrace(
      'click',
      'book_companyDetail_button',
      '填写页查看企业资质',
      ''
    );
    this.setData({
      showOfferDesc: true,
    });
  },

  hideOfferDesc(e) {
    this.setData({
      showOfferDesc: false,
    });
  },

  //显示红包使用说明
  showPurseInfo(e) {
    var tips = [
      '温馨提示：',
      '红包返现金额为单张票价的1%，乘以票张数，购买附加产品会有额外的返现金额。',
      '当天返现累计金额不得超过30元，返现金额无法用于提现。',
      '预约票、儿童票暂不支持返现和红包抵扣，未登录用户无法使用红包功能。',
      '支付成功后，返现金额会存入暂不可用余额，出行成功后24小时内转移到可用余额账户。',
      '退票后，下单时的返现金额取消，且使用的红包金额不予退还。',
      '抵扣金额为票价的0.1%(部分区域不支持抵扣)，结果四舍五入到“角”，最少抵扣金额0.1元。每月最多抵扣20次。',
      '选择极速出票、权益立减礼包、超级会员等套餐可抵扣更高金额。',
      '返现及抵扣功能暂时只支持汽车票业务线的产品，船票游艇、旅游专线、机场巴士等产品暂不支持。',
      '红包金额有效期为1年，自返现至可用余额时开始计算，到期后失效。',
      '使用过程中，如用户出现或涉嫌违法违规行为，我们将有权冻结用户的红包金额及账户。',
      '部分区域及线下渠道不支持抵扣。',
      '最终解释权归携程旅行所有。',
    ];
    var tipsHtml = tips
      .map((item, index) => {
        return `<p style="text-align:left">${
          index > 0 ? index + '、' : ''
        } ${item}</p>`;
      })
      .join('');
    var showModalData = {
      title: '温馨提示',
      richTextMessage: `<div>${tipsHtml}</div>`,
      extra: 1,
      buttons: [
        {
          buttonTitle: '知道了',
          buttonColor: '#ffffff',
          buttonTextColor: '#666666',
          action: () => {},
        },
      ],
    };
    this.showCustomModal(showModalData);
  },
  // 下单按钮点击
  onBook(e) {
    var data = this.data;
    var bookType = e.currentTarget.dataset.type;
    var bookItem = e.currentTarget.dataset.item;
    bookItem.open = true;

    if (bookType === 'x') {
      var selectX = {};
      data.xList.forEach((item) => {
        if (item.id == bookItem.id) {
          item.open = true;
          selectX = item;
        } else {
          item.open = false;
        }
      });
      data.selectX = selectX;
      data.packageList.forEach((item) => {
        item.open = false;
      });
    } else {
      data.selectX = {};
      data.packageList.forEach((item) => {
        if (item.id == bookItem.id) {
          item.open = true;
        } else {
          item.open = false;
        }
      });
      data.xList.forEach((item) => {
        item.open = false;
      });
    }
    data.inSelectX = false;
    data.bookAnchor = 'bus-book';
    this.setData(data, () => {
      this.countPrice(this.data);
      this.setTitle();
    });
  },

  // 乘客页面
  toPassenger(pas, showOcr) {
    BusShared.pas = pas || undefined;
    let detail = this.data.detail;
    let {
      buyTicketRule: rule = {},
      childTicketUnitSalePrice,
      ticketUnitSalePrice,
    } = detail;
    let supportPassengerIdentityTypes =
      (rule && rule.supportPassengerIdentityTypes) || [];
    let json = JSON.stringify(supportPassengerIdentityTypes);
    let params = {
      ticketChild: rule.isSaleChildTicket ? 1 : 0,
      ticketTakeChild: rule.isSaleTakeChildTicket ? 1 : 0,
      supportPassengerTypes: encodeURIComponent(json),
      childTicketUnitSalePrice: childTicketUnitSalePrice || 0,
      ticketUnitSalePrice: ticketUnitSalePrice || 0,
      showOcr: showOcr ? 1 : 0,
    };
    BusRouter.navigateTo('passenger', params);
  },
  // 显示地图
  showMap(e) {
    this.onUbtTrace('click', 'book_map_button', '填写页车站地址', '');
    var fromStationInfo = this.data.detail.fromStationInfo || {};
    var noXYHasAddress = () => {
      if (fromStationInfo.address) {
        this.showMsg({
          title: '出发车站地址',
          message: fromStationInfo.address,
        });
      }
    };

    if (fromStationInfo.amapX && fromStationInfo.amapY) {
      wx.openLocation({
        latitude: +fromStationInfo.amapY,
        longitude: +fromStationInfo.amapX,
        address: fromStationInfo.address || '',
        name: fromStationInfo.name || '',
        scale: 28,
        fail: () => {
          noXYHasAddress();
        },
      });
    } else {
      noXYHasAddress();
    }
  },
  // 显示说明
  showExplain(e) {
    var index = e.currentTarget.dataset.index;
    if (index !== undefined) {
      let typeSndobj = {
        0: {
          typeSnd: 'book_bkDtBookingNotice_button',
          comment: '填写页须知-预订须知tab',
        },
        1: {
          typeSnd: 'book_bkDtGetticketNotice_button',
          comment: '填写页须知-取票说明tab',
        },
        2: {
          typeSnd: 'book_bkDtlReturnNotice_tab',
          comment: '填写页须知-退改说明tab',
        },
      };
      this.onUbtTrace(
        'click',
        typeSndobj[index].typeSnd,
        typeSndobj[index].comment,
        ''
      );
    } else {
      this.onUbtTrace('click', 'book_bookDetail_button', '填写页须知', '');
    }
    this.setData({
      showExplain: true,
      showExplainIndex: index,
    });
  },
  disMissExplain(e) {
    this.setData({
      showExplain: false,
    });
  },

  choosePasAndReset(e) {
    this.onUbtTrace(
      'click',
      'book_passengerSelect_button',
      '填写页乘客选择',
      ''
    );
    let idx = e.currentTarget.dataset.index;
    let pas = this.data.memberPas[idx];

    this.choosePassenger(pas);
    this.confirmPasChoose();
  },
  choosePas(e) {
    this.onUbtTrace(
      'click',
      'book_passengerAddInvolvemore_button',
      '填写页新增乘客弹窗-增加已有乘客',
      ''
    );
    let pas = e.detail.pas;
    this.choosePassenger(pas);
  },
  choosePassenger(pas) {
    Passenger.PassengerData.choosePassenger(pas, ({ errMessage, toEdit }) => {
      if (errMessage) {
        this.showMsg(errMessage || '未知错误');
      }
      if (toEdit) {
        this.toPassenger(pas);
      }
    });
  },

  editPas(e) {
    let pas = e.detail.pas;
    this.toPassenger(pas);
  },
  // 乘客数据存储
  storePassengerData(passList) {
    let isSelectChild = false;
    passList.forEach((item) => {
      if (item.child) {
        isSelectChild = true;
      }
    });
    this.setData({
      isSelectChild,
      isAgreeChild: false,
    });
    Passenger.PassengerData.resetChoosen(passList);
    this.setData(
      {
        update: 1,
      },
      () => {
        this.countPrice(this.data, () => {
          var { maxCoupon } = this.updateCouponList(this.data.couponList);
          var usedCoupon = this.data.usedCoupon;
          if (passList.length > 0) {
            if (
              !usedCoupon &&
              !(
                this.data.isSupportNewUser &&
                this.data.bShow &&
                this.data.isNewCustomer
              )
            ) {
              usedCoupon = maxCoupon;
            } else {
            }
          } else {
            usedCoupon = null;
          }
          this.setData(
            {
              usedCoupon,
              maxCoupon,
            },
            () => {
              this.countPrice(this.data);
            }
          );
        });
      }
    );
  },
  actionSheetChange: function () {
    this.setData({
      actionSheetHidden: true,
    });
  },
  onLoad: function (options) {
    // Do some initialize when page load.
    new CustomModal(this);
    new Modal(this);

    let supportAfterPay = BusConfig.supportAfterPay;

    var loadData = () => {
      var bShow = this.data.isPromotion;
      Utils.sendExposeTrace('xcx_whtc_booking_pay_button_show', {
        comment: '填写页挽回弹窗实验去支付按钮曝光上报',
      });
      let offlineOldUser = options.offlineOldUser;
      this.getBusDetail(options)
        .then((res) => {
          this.setData({
            ...res,
            supportAfterPay,
            offlineOldUser,
          });
          this.getBusNoticeData(res.detail);
          this.getPassengerList(res.detail.buyTicketRule);

          return this.getBookingActivity(res);
        })
        .then((data) => {
          this.discountNoticeBeforeBuy();
          return this.getPurseBalanceFee(data).then((res) => {
            return { ...data, ...res };
          });
        })
        .then(this.setView)
        .then((data) => {
          this.getPhoneNum().then((mobile) => {
            this.setData({
              phoneNum: mobile,
            });
            inputContent['phone'] = mobile;
          });
          this.getParentID();
          this.hideLoading();
          this.setData(
            {
              isLoading: false,
            },
            () => {
              if (this.data.showType.length > 0) {
                this.resetChoose();
              }
              this.countPrice(this.data);
              this.getCouponList();
              this.getGuestActivity();
            }
          );

          Pservice.checkBusNewUser()
            .then((res) => {
              this.setData({
                isNewUser: true,
              });
            })
            .catch((err) => {
              this.setData({
                isNewUser: false,
              });
            });
        })
        .catch((err) => {
          console.log(err);
          this.setData({
            isLoading: false,
          });
          this.hideLoading();
          this.showMsg('加载失败，请重试');
        });
    };

    BusShared.save('usedCoupon', null);

    if (options.didLogin) {
      loadData();
    } else {
      BusRouter.checkLogin(2).then(loadData);
    }
  },
  onUnload: function () {
    this.removePassengerObserver && this.removePassengerObserver();
    this.removePassengerObserver = null;
  },

  discountNoticeBeforeBuy() {
    BusDetail.discountNoticeBeforeBuy({ tag: 'wechatxcx' }).then((res) => {
      let title = ((res && res.title) || '').replace(
        /(\()(\d*)(\))/g,
        '<span style="color: #ff6600">$2</span>'
      );
      this.setData({
        hotelDiscountTip: { ...res, title },
      });
    });
  },
  getPurseBalanceFee(data) {
    var openXPackage = {};
    (data.xList || []).forEach((item) => {
      if (item.open) {
        openXPackage = item;
      }
    });
    var aParams = {
      ticketPrice: data.detail.ticketUnitSalePrice,
      isPresale: data.detail.isPresale,
      fromCity: data.detail.fromCity,
      fromStation: data.detail.fromStation,
      channelId: '' + (openXPackage.channelId || '1'),
      activityId: openXPackage.id || '0',
    };
    return BusDetail.getPurseBalanceFee(aParams);
  },

  getBookingActivity(res) {
    var detail = res.detail;
    var selectX = res.selectX || {};
    var params = {
      fromCity: detail.fromCity,
      toCity: detail.toCity,
      fromStation: detail.fromStation,
      toStation: detail.toStation,
      busNumber: detail.busNumber,
      symbol: detail.symbol,
      utmSource: this.data.utmSource || '',
      channelId: '' + (selectX.channelId || '0'),
      fromDate: detail.fromDate,
      fromTime: detail.fromTime,
    };
    return BusDetail.getBookingActivity(params).then((bookData) => {
      let servicePrice = 0;
      if (detail.serviceChargeInfo && detail.serviceChargeInfo.price > 0) {
        servicePrice = detail.serviceChargeInfo.price;
      }
      if (servicePrice === 0) {
        let list = [];
        let { saleList } = bookData;
        saleList.forEach((item) => {
          let productSubType = item.descContentShow
            ? item.descContentShow.includeProducts[0].productSubType
            : '';
          if (productSubType !== 'free_service_priv_card') {
            list.push(item);
          }
        });
        bookData.saleList = list;
      }
      if (bookData.canShowDeductionCard && this.data.isShowDeductionCard) {
        Utils.sendExposeTrace('booking_ljk_channel_show', {
          comment: '填写页立减卡通道曝光上报',
        });
      }
      if (bookData.reductionCardInfo && bookData.reductionCardInfo.checked) {
        // 默认勾选
        Utils.sendExposeTrace('booking_ljk_default_choose_show', {
          comment: '填写页立减卡特权默认勾选模块曝光上报',
        });
        this.setData({
          selectInstantDeductionCard: true,
        });
      }
      return {
        ...res,
        ...bookData,
      };
    });
  },

  getBusDetail(options) {
    var params = {
      bookData: options.bookData || false,
      fromCity: options.fromCity,
      toCity: options.toCity,
      busNumber: options.busNumber,
      fromStation: options.fromStation,
      toStation: options.toStation,
      fromDate: options.date || options.fromDate,
      fromTime: options.fromTime,
      fullPrice: options.fullPrice,
      isNeedBusInfo: true,
      utmSource: this.data.utmSource,
      symbol: options.symbol,
      abTest: [{ name: '160818_crm_nwpkg', version: 'B' }],
      scanId: options.scanId,
    };
    return BusDetail.getBusDetail(params);
  },

  getPhoneNum: function () {
    return new Promise(function (resolve, reject) {
      var phoneNumber = cwx.getStorageSync('BUS_PHONE_NUMBER') || '';
      if (phoneNumber) {
        resolve(phoneNumber);
      } else {
        return Pservice.getMobileByAuth({})
          .then((data) => {
            data = (data || {})['return'];
            resolve(data['mobile'] || '');
          })
          .catch((res) => {
            resolve('');
          });
      }
    });
  },

  getParentID: function () {
    var parentIdNumber = cwx.getStorageSync('BUS_PARENT_NUMBER') || '';
    var parentName = cwx.getStorageSync('BUS_PARENT_NAME') || '';
    inputContent['parentName'] = parentName;
    inputContent['parentIdNumber'] = parentIdNumber;
  },

  setView: function (data) {
    var { detail } = data;
    var servicePrice = 0;
    var buyTicketRule = detail.buyTicketRule;
    // 这个是服务费
    if (detail.serviceChargeInfo && detail.serviceChargeInfo.price > 0) {
      servicePrice = detail.serviceChargeInfo.price;
    }
    let ticketExplainList = JSON.parse(detail.ticketExplainJsonData || '[]');
    let returnRuleList = JSON.parse(detail.returnRuleJsonData || '[]');

    detail.explainList = [
      {
        title: '退改规则',
        content: returnRuleList,
      },
      {
        title: '购取说明',
        content: ticketExplainList,
      },
    ];

    detail.explainList.forEach((item) => {
      item.content = this.formatData(item.content);
    });

    var saveData = {
      ...data,
      servicePrice: servicePrice,
      buyTicketRule: buyTicketRule,
      acceptFloat: detail.isPresale ? true : false,
    };
    this.setData(saveData);
    this.setTitle(saveData);
    this.traceDetailLog.apply(this, arguments);
    return detail;
  },

  getBusNoticeData({ fromCity, toCity, fromStation, toStationShow }) {
    // location  1:首页 2:列表页 3:订单填写页 4:订单详情页 5:X页
    Pservice.getShipNotice({
      location: 3,
      fromCity,
      toCity,
      fromStation,
      toStation: toStationShow,
    })
      .then((res) => {
        if (res && res.code === 1 && res.data) {
          const { content, title } = res.data;
          this.setData({
            busNoticeData: {
              noticeContentWidth: 618,
              busNoticeContent: content,
              busNoticeTitle: title,
            },
            hasBusNotice: true,
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  },

  onBusNoticeClick(e) {
    this.setData({
      showBusNoticeModal: true,
    });
  },
  onClosebusNoticeModal() {
    this.setData({
      showBusNoticeModal: false,
    });
  },
  traceDetailLog(data) {
    try {
      var mparms = {};
      var mdetail = data.detail || {};
      var mtempFields = mdetail.tempFields || {};
      var mwebiste = mtempFields.webiste;
      var mbuyTicketRule = mdetail.buyTicketRule || {};
      let msupportCardsarry =
        mbuyTicketRule?.supportPassengerIdentityTypes || [];
      var msupportCards = msupportCardsarry.join('|');
      var mmaxSaleTicketNumber = mbuyTicketRule.maxSaleTicketNumber || 0;
      var misSaleChildTicket = mbuyTicketRule.isSaleChildTicket;
      var misSaleTakeChildTicket = mbuyTicketRule.isSaleTakeChildTicket;
      var misPresale = mdetail.isPresale || false;
      var misSupportRefundTicket =
        mdetail.refundTicketRule.isSupportRefundTicket || false;
      var mrefundRule = '';
      var mbusType = mdetail.busType || '';
      var mserviceChargeInfo = mdetail.mdetail || {};
      var mservicePrice = mserviceChargeInfo.price || 0;
      //默认搭售
      var mxProductarray = [];
      var mpackageList = data.packageList || [];
      var msaleList = data.saleList || [];

      mparms['hasDefaultX'] = 0;
      if (mpackageList.length > 0 || msaleList.length > 0) {
        mparms['hasDefaultX'] = 1;
      }
      mpackageList.forEach(function (item) {
        if (item.defaultOpen) {
          mxProductarray.push(item.id);
        }
      });
      msaleList.forEach(function (item) {
        if (item.defaultOpen) {
          mxProductarray.push(item.id);
        }
      });
      if (mxProductarray.length > 0) {
        var mxProduct = mxProductarray.join('|');
        mparms['xProduct'] = mxProduct;
      }
      mparms['supportCards'] = msupportCards;
      mparms['bookingWebsite'] = mwebiste;
      mparms['maxTicketCount'] = mmaxSaleTicketNumber;
      mparms['isSupportChildTicket'] = misSaleChildTicket ? 1 : 0;
      mparms['isSupportFreeChildTicket'] = misSaleTakeChildTicket ? 1 : 0;
      mparms['isPreBook'] = misPresale ? 1 : 0;
      mparms['isSupportRefund'] = misSupportRefundTicket ? 1 : 0;
      mparms['refundRule'] = mrefundRule;
      mparms['busType'] = mbusType;
      mparms['servicePrice'] = mservicePrice;
      this.ubtTrace(102113, mparms);
    } catch (e) {
      console.log(e);
    }
  },

  getPassengerList: function (rule) {
    let passengerData = Passenger.PassengerData;
    passengerData.setOptions({
      rule,
      sliceLine: 1,
    });
    this.removePassengerObserver = passengerData.ObserverPassengerDataChange(
      (data) => {
        console.log('passengerData----', data);
        const res = data.data;
        this.setData({
          hasSelf: res.hasSelf || false,
          passList: res.passList,
          passengerMinSlice: res.passengerMinSlice,
          passengerListSlice: res.passengerListSlice,
          memberPas: res.passengerList,
          allMemberPas: res.passengerList,
          ticketPicker: res.ticketPicker,
          isSelectChild: res.isSelectChild,
        });
      }
    );
    passengerData.setNeedUpdate();
    // return Passenger.GetPassengerList(rule, 1)
    //     .then((res) => {
    //
    //         return {
    //             hasSelf: res.hasSelf || false,
    //             passList: res.passList,
    //             passengerMinSlice: res.passengerMinSlice,
    //             passengerListSlice: res.passengerListSlice,
    //             memberPas: res.passengerList,
    //             allMemberPas: res.passengerList,
    //             ticketPicker: res.ticketPicker,
    //         };
    //     })
    //     .catch((err) => {
    //         return {};
    //     });
  },

  showAllPassenger: function (e) {
    this.setData({
      showAllPassenger: true,
    });
  },
  hideAllPassenger: function (e) {
    this.setData({
      showAllPassenger: false,
    });
  },

  setTitle: function (data) {
    data = data || this.data;
    var title;
    // if (this.data.hasX && !this.data.inSelectX) {
    //     title = this.data.time;
    // } else {
    title = data.detail.fromCity + '-' + data.detail.toCity;
    // }
    this.setNavigationBarTitle({
      title: title,
    });
  },
  getEventData: function (e) {
    const data = e.detail;
    this.setData({
      lotteryCouponPrice: data.lotteryCouponPrice,
      effectiveTime: data.effectiveTime,
    });
  },
  onReady: function () {
    // 缓存影响参数
    cwx.mkt.getUnion(
      function (unionData) {
        this.unionData = unionData;
      }.bind(this)
    );
  },
  onHide: function () {
    this.setData({
      renderLottery: false,
    });
  },
  onShow: function () {
    this.setData({
      renderLottery: true,
    });
    if (this.pageCallback) {
      this.pageCallback();
      this.pageCallback = null;
    }
    let mCoupon = BusShared.get('usedCoupon');
    console.log('mCoupon', mCoupon);
    if (mCoupon) {
      let couponList = null;
      if (mCoupon.length > 0) {
        couponList = mCoupon[0];
      }
      console.log('couponList', couponList);
      this.countPrice(
        _.extend(this.data, {
          usedCoupon: couponList,
        })
      );
    }
  },
  onBackConfirm() {
    this.setData({
      showPriceDetailModal: false,
    });
    cwx.navigateBack();
  },
  traceLogModal: function (e) {
    Utils.sendExposeTrace('xcx_whtc_booking_pay_button_show', {
      comment: '填写页挽回弹窗实验去支付按钮曝光上报',
    });
    this.traceXCancelButton();
  },
  traceXCancelButton() {
    let xList = this.data.xList;
    xList.forEach((item) => {
      if (item.open) {
        Utils.sendExposeTrace('xcx_whtc_booking_cancel_product_show', {
          productType: item.type,
          comment: '填写页挽回弹窗实验x产品曝光上报',
        });
      }
    });
  },

  onBack() {
    if (this.data.showType) {
      this.cancelPasChoose();
      return;
    }
    if (this.data.didAlertCoupon) {
      cwx.navigateBack();
    }
    var showBackAlert = () => {
      var symbol = this.data.detail.symbol;
      var manCount = 0;
      if (roundomCount[symbol] > 0) {
        manCount = roundomCount[symbol];
      } else {
        manCount = Utils.getRoundomNumber(20, 40);
        roundomCount[symbol] = manCount;
      }
      var customModalData = {};
      if (this.data.selectInstantDeductionCard && this.data.reductionCardInfo) {
        var customModalData = {
          richTextTitle: `<b style="font-size:18px;color:#000000;font-weight:700;">您已选购【立减卡】</b><br/><b>比车站<b style="color:#00B87A">便宜${
            this.data.reductionCardInfo.discountFee
          }元</b>，连续享<b style="color:#00B87A">${
            this.data.reductionCardInfo.productQuantity ||
            this.data.reductionCardInfo.totalQuantity
          }单优惠</b></b>`,
          richTextMessage: `<b style="font-size:12px;color:#999999;">您确定要离开吗?</b>`,
          color: '#666666',
          modalHeadImage:
            'https://pages.c-ctrip.com/bus-images/busapp/back_reduce.png',
          buttons: [
            {
              buttonTitle: '狠心离开',
              buttonColor: '#ffffff',
              buttonTextColor: '#888888',
              action: () => {
                cwx.navigateBack();
                this.ubtMetric({
                  name: '104437',
                  value: 1,
                  tag: { action: 'back' },
                  callback: function (res) {
                    console.log('callback ： res = ', res);
                  },
                });
              },
            },
            {
              buttonTitle: '继续预订',
              buttonColor:
                'linear-gradient(90deg,rgba(255,165,10,1) 0%,rgba(255,119,0,1) 100%)',
              buttonTextColor: '#ffffff',
              action: () => {
                this.onUbtTrace(
                  'click',
                  'book_backtoPreviousPageGoon_button',
                  '填写页挽留弹窗-继续预定',
                  ''
                );
                this.ubtMetric({
                  name: '104437',
                  value: 1,
                  tag: { action: 'done' },
                  callback: function (res) {
                    console.log('callback ： res = ', res);
                  },
                });
              },
            },
          ],
        };
      } else {
        customModalData = {
          richTextTitle: `<b style="font-size:18px;color:#000000;font-weight:700;"><b style="font-size:26px;color:#FF6600;">${manCount}人</b>正在浏览该班次</b>`,
          richTextMessage: `<b style="font-size:12px;color:#999999;">您确定要离开吗?</b>`,
          color: '#666666',
          buttons: [
            {
              buttonTitle: '离开',
              buttonColor: '#ffffff',
              buttonTextColor: '#888888',
              action: () => {
                cwx.navigateBack();
                this.ubtMetric({
                  name: '104437',
                  value: 1,
                  tag: { action: 'back' },
                  callback: function (res) {
                    console.log('callback ： res = ', res);
                  },
                });
              },
            },
            {
              buttonTitle: '继续预订',
              buttonColor:
                'linear-gradient(90deg,rgba(255,165,10,1) 0%,rgba(255,119,0,1) 100%)',
              buttonTextColor: '#ffffff',
              action: () => {
                this.onUbtTrace(
                  'click',
                  'book_backtoPreviousPageGoon_button',
                  '填写页挽留弹窗-继续预定',
                  ''
                );
                this.ubtMetric({
                  name: '104437',
                  value: 1,
                  tag: { action: 'done' },
                  callback: function (res) {
                    console.log('callback ： res = ', res);
                  },
                });
              },
            },
          ],
        };
      }
      this.showCustomModal(customModalData);
    };
    if (this.data.isNewUser && !this.data.isPromotion) {
      // 新客请求发券接口
      let {
        fromCity,
        toCity,
        fromStation,
        toStation,
        busNumber,
        fromTime,
        fromDate,
        symbol,
      } = this.data.detail;
      let utmsource = this.data.utmSource;
      let params = {
        fromCity,
        toCity,
        fromStation,
        toStation,
        busNumber,
        symbol,
        fromDate,
        fromTime,
        utmsource,
      };
      params.type = 'get';
      Pservice.newUserSaveCoupon(params)
        .then((res) => {
          if (res.data) {
            //  res.data
            let coupon = res.data;
            this.setData({
              didAlertCoupon: true,
            });
            let customModalData = {
              richTextTitle: `<div style="font-size:18px;color:#000000;font-weight:700;margin-top:20px;">${coupon.title}</div>`,
              extraBackgroundTop: `<div style="height:50px;width:100px;position:absolute;right:0;right:-40px;top:-31px">
              <img style="height:61px;width:89px;" src="https://pages.c-ctrip.com/bus-images/busapp/rnbus/book-coupon-bg1.png" />
            </div>`,
              extraBackgroundBottom: `<div style="height:50px;width:100px;position:absolute;left:0;left:-30px;top:-152px">
              <img style="height:162px;width:69px;" src="https://pages.c-ctrip.com/bus-images/busapp/rnbus/book-coupon-bg2.png" />
            </div>`,
              richTextMessage: `<div style="font-size:16px;color:#ffffff;position:relative;">
              <div style="width:220px;height:58px;position:relative;background-size:100%;margin:auto;background-image:url(https://pages.c-ctrip.com/bus-images/busapp/rnbus/book-coupon-item-bg.png);">
                <div style="position:absolute;width:72px;left:0;top:0;height:58px;line-height:58px;font-size:24px;display:flex;flex-direction:column;algin-items:center:justify-content:center;" ><p style="font-size:14px;">¥<b style="font-size:24px;">${coupon.couponPrice}</b></p></div>
                <div style="position:absolute;width:138px;left:72px;top:0;height:58px;display:flex;flex-direction:column;algin-items:center:justify-content:center;">
                  <div style="margin:auto;">
                    <p style="font-size:14px;">${coupon.tip1}</p>
                    <p style="font-size:11px;">${coupon.tip2}</p>
                  </div>
                </div>
              </div>
            </div>`,
              color: '#666666',
              showClose: true,
              buttons: [
                {
                  buttonTitle: '立即领取',
                  buttonStyle: 'flex-grow:0.5;width:50% important!;',
                  buttonColor: '#ffffff',
                  buttonTextColor: 'rgba(255,119,0,1)',
                  action: () => {
                    this.requestSaveAndRefreshCoupon({
                      ...params,
                      type: 'send',
                    });
                  },
                },
              ],
            };
            this.showCustomModal(customModalData);
          } else {
            showBackAlert();
          }
        })
        .catch((err) => {
          showBackAlert();
        });
    } else {
      showBackAlert();
    }
  },
  onPayConfirm(e) {
    this.setData({
      showPriceDetailModal: false,
    });
    this.doSubmit(e);
  },

  requestSaveAndRefreshCoupon(params) {
    Pservice.newUserSaveCoupon(params)
      .then((res) => {
        this.getCouponList();
        this.showToast({ message: '领取成功', icon: 'none' });
      })
      .catch((err) => {
        this.getCouponList();
        this.showToast({ message: '领取失败', icon: 'none' });
      });
  },

  resetChoose: function () {
    if (this.data.showType == 'pas') {
      this.choosePassengers();
    }
  },

  switchSale: function (e) {
    var index = e.currentTarget.dataset.index;
    var saleList = this.data.saleList;
    saleList[index].open = !saleList[index].open;
    let sale = saleList[index];
    let productSubType = sale.descContentShow
      ? sale.descContentShow.includeProducts[0].productSubType
      : '';
    if (sale.packageCode === '1CQCJSCP305T0221' && !sale.open) {
      Utils.sendClickTrace('booking_x5minset_cancel_click', {
        comment: '填写页-新人极速出票取消勾选',
        isNew: this.data.offlineOldUser ? '0' : '1',
      });
    } else if (productSubType === 'free_service_priv_card' && !sale.open) {
      Utils.sendClickTrace('booking_x5minset_cancel_click', {
        comment: '填写页-新人极速出票取消勾选',
        isNew: this.data.offlineOldUser ? '0' : '1',
      });
    } else {
      this.onUbtTrace('click', 'book_payFastter_product', '填写页极速出票', '');
    }
    this.setData(
      {
        saleList,
      },
      () => {
        this.countPrice(this.data);
      }
    );
  },

  checkPackage: function (index, mutil, callback) {
    var packageList = this.data.packageList;
    var checked = packageList[index].open;
    this.setData({
      selectPackage: {
        index,
        mutil,
        ...packageList[index],
      },
    });

    if (!mutil) {
      packageList.forEach((item) => {
        item.open = false;
      });
    }
    packageList[index].open = !checked;
    let hasVirusInsChecked = false;
    packageList.forEach((item) => {
      if (
        item.open &&
        (item.packageCode == '71020' || item.packageCode == '71021')
      ) {
        hasVirusInsChecked = true;
      }
    });
    this.countPrice(
      {
        ...this.data,
        hasVirusInsChecked,
      },
      callback
    );
  },

  openButtonRecommendInsurance: function (open, callback) {
    let packageList = this.data.packageList || [];
    let saleList = this.data.saleList || [];
    let buttonRecommend = this.data.buttonRecommend;
    let buttonRecommendInsurance = this.data.buttonRecommendInsurance;
    let buttonRecommendFiveMin = this.data.buttonRecommendFiveMin;
    let buttonRecommendEasyRefund = this.data.buttonRecommendEasyRefund;
    if (
      packageList &&
      buttonRecommendInsurance &&
      open &&
      buttonRecommendInsurance.extraMap.packageType ===
        buttonRecommend.extraMap.packageType
    ) {
      let isPackageCode = packageList.some((item) => {
        if (
          !item.open &&
          item.packageCode === buttonRecommendInsurance.packageCode
        ) {
          return true;
        }
      });
      // 选 是 的情况, 如果 packageList 保险 和 buttonRecommendInsurance packageCode 是一样的
      // 购买的是 packageList 保险

      if (isPackageCode) {
        let checkIndex = -1;
        let packageList = this.data.packageList;
        for (let i = 0; i < packageList.length; i++) {
          let item = packageList[i];
          if (
            !item.open &&
            item.packageCode === buttonRecommendInsurance.packageCode
          ) {
            checkIndex = i;
            break;
          }
        }

        if (checkIndex >= 0) {
          this.checkPackage(checkIndex, false);
        }
      }
    }
    if (
      open &&
      saleList &&
      buttonRecommendFiveMin &&
      buttonRecommendFiveMin.extraMap.packageType ===
        buttonRecommend.extraMap.packageType
    ) {
      let isPackageCode = saleList.some((item) => {
        if (
          !item.open &&
          item.packageCode === buttonRecommendFiveMin.packageCode
        ) {
          return true;
        }
      });
      // 选 是 的情况, 如果 saleList 保险 和 buttonRecommendFiveMin packageCode 是一样的
      // 购买的是 saleList
      if (isPackageCode) {
        saleList.forEach((item) => {
          if (
            !item.open &&
            item.packageCode === buttonRecommendFiveMin.packageCode
          ) {
            item.open = true;
          }
        });
        this.setData({
          saleList: this.data.saleList,
        });
      }
    }
    if (
      open &&
      saleList &&
      buttonRecommendEasyRefund &&
      buttonRecommendEasyRefund.extraMap.packageType ===
        buttonRecommend.extraMap.packageType
    ) {
      let isPackageCode = saleList.some((item) => {
        if (
          !item.open &&
          item.packageCode === buttonRecommendEasyRefund.packageCode
        ) {
          return true;
        }
      });
      // 选 是 的情况, 如果 saleList 保险 和 buttonRecommendEasyRefund packageCode 是一样的
      // 购买的是 saleList
      if (isPackageCode) {
        saleList.forEach((item) => {
          if (
            !item.open &&
            item.packageCode === buttonRecommendEasyRefund.packageCode
          ) {
            item.open = true;
          }
        });
        this.setData({
          saleList: this.data.saleList,
        });
      }
    }

    this.countPrice(
      {
        ...this.data,
      },
      callback
    );
  },

  switchSalePackage: function (e) {
    this.onUbtTrace('click', 'book_insur_product', '填写页保险商品', '');
    var index = e.currentTarget.dataset.index;
    var mutil = e.currentTarget.dataset.mutil;
    var packageList = this.data.packageList;
    this.checkPackage(index, mutil);
  },

  showPackageExplain: function (e) {
    var url = e.currentTarget.dataset.url;
    if (url) {
      BusRouter.navigateTo(url, {
        title: '产品说明',
        hideNavbar: 1,
        popup: 'close'
      });
    }
  },

  showPolicy(e) {
    this.onUbtTrace(
      'click',
      'book_bookAgreement_button',
      '填写页查看预定协议',
      ''
    );
    BusRouter.navigateTo('web', {
      url: encodeURIComponent(
        'https://pages.c-ctrip.com/bush5/busbooknotes.html' +
          (this.data.detail.isOutStationType ? '?show=9' : '')
      ),
      title: '预订协议',
      naviColor: this.data.colorConfig.headerBgColor || '',
    });
  },

  onShowAllPackage: function (e) {
    this.setData({
      showAllPackage: !this.data.showAllPackage,
    });
  },

  editPassenger: function (e) {
    var index = e.currentTarget.dataset.index * 1;
    var pas = this.data.passList[index];

    var passenger = this.data.memberPas.find((item) => {
      if (pas.id == item.PassengerID) {
        return true;
      }
    });
    if (passenger) {
      this.toPassenger(passenger);
    }
  },

  deletePassager: function (e) {
    this.onUbtTrace('click', 'book_passengerEdit_button', '填写页乘客编辑', '');
    var index = e.currentTarget.dataset.index * 1;
    this.setData({
      delPassId: index,
    });
    cwx.showModal({
      title: '提示',
      content: '确定要删除么',
      success: function (res) {
        if (res.confirm) {
          this.confirmToDeleteP();
        }
      }.bind(this),
    });
  },
  confirmToDeleteP: function () {
    if (this.data.delPassId != null) {
      var passList = this.data.passList;

      var pas = passList[this.data.delPassId];

      this.choosePassenger(pas.id);
      this.resetChoosen();
      this.setData({
        delPassId: null,
      });
    }
  },

  cancelSalePackage: function (e) {
    var itemid = e.currentTarget.dataset.id;
    if (!itemid) {
      return;
    }
    var data = this.data;
    var saleList = data.saleList || [],
      xList = data.xList || [],
      packageList = data.packageList || [],
      buttonRecommendCoupon3 = data.buttonRecommendCoupon3 || {},
      buttonRecommendInsurance = data.buttonRecommendInsurance || {},
      buttonRecommendFiveMin = data.buttonRecommendFiveMin || {},
      reductionCardInfo = data.reductionCardInfo || {};
    var salePackage = [
      ...saleList,
      ...packageList,
      ...xList,
      buttonRecommendCoupon3,
      buttonRecommendInsurance,
      buttonRecommendFiveMin,
      reductionCardInfo,
    ];
    let cancelPackage = null;
    salePackage.forEach((item) => {
      if (item.packageCode == itemid) {
        item.open = false;
        cancelPackage = item;
      }
    });
    // 立减卡
    if (reductionCardInfo && reductionCardInfo.packageCode === itemid) {
      data.selectInstantDeductionCard = false;
    }
    Utils.sendClickTrace('xcx_whtc_booking_cancel_product_click', {
      productType: cancelPackage.type,
      comment: '填写页挽回弹窗实验取消按钮点击上报',
    });
    this.setData(data, () => {
      this.countPrice(data);
    });
  },

  countPrice: function (data, callback) {
    // 总金额 = 人数 * (票单价 + 服务费 + 保险 + 搭售套餐)
    var detail = data.detail,
      isPromotion = data.isPromotion;
    var rewardChannel =
        detail.isPresale || isPromotion ? false : data.rewardChannel,
      passList = data.passList,
      servicePrice = data.servicePrice,
      usedCoupon = data.usedCoupon,
      buyTicketRule = data.buyTicketRule || {},
      saleList = data.saleList || [],
      xList = data.xList || [],
      packageList = data.packageList || [],
      reductionCardInfo = data.reductionCardInfo || {};

    let priceCompose = [];
    var purseAvailableFee = this.data.purseInfo.purseAvailableFee || 0;
    var purseBalance = this.data.purseInfo.purseBalanceFee || 0;
    var buyDeductionCardFee = Number(
      this.data.reductionCardChannel &&
        this.data.selectInstantDeductionCard &&
        this.data.reductionCardInfo &&
        !this.data.reductionCardInfo.checked
        ? reductionCardInfo.showPrice || 0
        : 0
    );
    var deductionCardFee = this.data.selectInstantDeductionCard
      ? this.data.reductionCardInfo.discountFee || 0
      : 0; // 立减卡金额
    var childs = [];
    var aldults = [];
    var takeChilds = [];
    _.each(passList, (p) => {
      if (p.passengerType == 'X') {
        takeChilds.push(p);
      } else if (p.passengerType == 'C') {
        childs.push(p);
      } else {
        aldults.push(p);
      }
    });
    var ticketPrice = detail.ticketUnitSalePrice;
    var ticketChildPrice = detail.childTicketUnitSalePrice || 0;
    var originPrice =
      detail.ticketUnitOriginalPrice || detail.ticketUnitSalePrice;
    var originChildPrice =
      detail.childTicketUnitOriginalPrice || ticketChildPrice;

    var aldultNum = aldults.length;
    var childsNum = childs.length;
    var takeChildsNum = takeChilds.length;

    var xListOpen = xList.filter((item) => item.open && item.packageCode);
    var saleListOpen = saleList.filter((item) => item.open);
    var packageOpen = packageList.filter((item) => item.open);
    var salePackage = [...packageOpen, ...saleListOpen];

    var salePrice = 0;

    var openedInsurance = this.getOpenedInsurance();

    let hasInsurance = openedInsurance.length > 0;

    let showPresalePrice = false && hasInsurance && detail.isPresale;

    //价格详情先计算好
    var priceList = [];
    var priceListExtra = [];

    var noServiceFee = false;

    var packagePurseFee = 0;
    var hasSuperMember = false;

    let hasOneFreeServiceFee = false;
    console.log(priceList, 'priceList1');
    var item = {
      name: showPresalePrice
        ? '预约票'
        : buyTicketRule.isSaleTakeChildTicket ||
          buyTicketRule.isSaleChildTicket > 0
        ? '成人票'
        : '票价',
      price: showPresalePrice ? ticketPrice : originPrice,
      count: aldultNum,
      unit: '张',
      tag: '车站原价',
    };
    priceList.push(item);
    if (childs.length) {
      var item = {
        name: '儿童票',
        price: showPresalePrice ? childPrice : originChildPrice,
        count: childsNum,
        unit: '张',
        tag: '车站原价',
      };
      priceList.push(item);
    }
    if (takeChilds.length > 0) {
      var item = {
        name: '免票携童',
        price: 0,
        count: takeChildsNum,
        unit: '张',
      };
      priceList.push(item);
    }

    priceCompose.push('汽车票');
    let insuranceFromXList = false;
    let insuranceFromSale = false;
    let selectXlist = {};

    if (xListOpen.length > 0) {
      priceCompose.push('附加选购产品');
      xListOpen.forEach(function (item) {
        if (item.noServiceFee) {
          noServiceFee = true;
        }
        var supChild = item.supChild != 0;
        var count = supChild ? aldultNum + childsNum : aldultNum;

        var truePrice = item.payShowPrice;
        //计算价格
        var itemPrice =
          item.sellType == 1 ? truePrice * count : count > 0 ? truePrice : 0;
        salePrice += itemPrice;

        if (item.type === 'insurance') {
          insuranceFromXList = true;
          selectXlist = item;
        }
        // 处理明细
        if (truePrice > 0 && count > 0) {
          var itm = {
            name: item.title,
            price: truePrice,
            count: item.sellType == 1 ? count : 1,
            unit: item.sellType == 1 ? '份' : '份',
            discount: item.isDiscount ? item.discount : 0,
            canCancel: false,
            tag: '',
            id: item.packageCode,
            giveActivitys: (item.giveActivitys || []).map((give) => {
              return {
                ...give,
                price: give.showPrice,
                count: give.sellType == 1 ? count : 1,
                unit: '份',
              };
            }),
          };

          item.saleCount = item.sellType == 1 ? count : 1;
          var giveProduct = item.giveProduct;
          if (giveProduct) {
            item.giveProduct.saleCount = giveProduct.sellType == 1 ? count : 1;
            itm.hasGive = giveProduct ? true : false;
            itm.giveProduct = {
              price: giveProduct.showPrice,
              title: giveProduct.title || '赠送产品',
              count: giveProduct.sellType == 1 ? count : 1,
              unit: '份',
            };
          }
          priceList.push(itm);
        }
        //单独计算返现
        packagePurseFee += item.singleCashBackAmount || 0;
      });
    }
    console.log(priceList, 'priceList2');

    if (salePackage.length) {
      salePackage.forEach(function (item) {
        if (item.noServiceFee) {
          noServiceFee = true;
        }
        let productSubType = item.descContentShow
          ? item.descContentShow.includeProducts[0].productSubType
          : '';
        hasOneFreeServiceFee =
          productSubType === 'free_service_priv_card' && item.open;
        item.hasOneFreeServiceFee = hasOneFreeServiceFee;
        var supChild = item.supChild != 0;
        var count = supChild ? aldultNum + childsNum : aldultNum;
        console.log('salePackage count', JSON.stringify(count));
        //计算价格
        var itemPrice =
          item.sellType == 1
            ? item.payPrice * count
            : count > 0
            ? item.payPrice
            : 0;

        salePrice += itemPrice;

        if (item.type === 'insurance') {
          insuranceFromSale = true;
        }

        // 单独计算返现
        packagePurseFee += item.singleCashBackAmount || 0;
        //处理明细
        if (count > 0) {
          var itm = {
            name: item.title,
            price: item.isX
              ? item.showPrice + item.ticketShowPrice
              : item.showPrice,
            count: item.hasOneFreeServiceFee
              ? 1
              : item.sellType == 1
              ? count
              : 1,
            unit: item.sellType == 1 ? '份' : '份',
            discount: item.isDiscount ? item.discount : 0,
            canCancel: item.hasOneFreeServiceFee ? false : true,
            tag: item.hasOneFreeServiceFee ? '不可取消' : '点击取消',
            id: item.packageCode,
            hidden: false,
            giveActivitys: (item.giveActivitys || []).map((give) => {
              return {
                ...give,
                price: give.showPrice,
                count: give.sellType == 1 ? count : 1,
                unit: '份',
              };
            }),
          };
          item.saleCount = item.sellType == 1 ? count : 1;
          var giveProduct = item.giveProduct;
          if (giveProduct) {
            item.giveProduct.saleCount = giveProduct.sellType == 1 ? count : 1;
            itm.hasGive = giveProduct ? true : false;
            itm.giveProduct = {
              price: giveProduct.showPrice,
              title: giveProduct.title || '赠送产品',
              count: giveProduct.sellType == 1 ? count : 1,
              unit: '份',
            };
          }
          console.log(itm, 'priceListitm');

          priceList.push(itm);
        }
      });
    }
    console.log(priceList, 'priceList3');

    var realServicePrice = noServiceFee ? 0 : servicePrice;
    var aldultsPrice = aldultNum * (ticketPrice + realServicePrice);
    var childPrice = childsNum * (ticketChildPrice + realServicePrice);
    let freeServiceCount = hasOneFreeServiceFee ? 1 : 0;
    let freeServicePrice = freeServiceCount * realServicePrice;

    var countPurseFee =
      Math.min(purseAvailableFee * aldults.length, purseBalance).toFixed(2) * 1;
    var rewardPurseFee = rewardChannel ? countPurseFee : 0;

    let exceptCouponPrice =
      (
        aldultsPrice +
        childPrice -
        freeServicePrice +
        salePrice -
        rewardPurseFee -
        deductionCardFee +
        buyDeductionCardFee
      ).toFixed(2) * 1;

    let couponPrice = 0;
    if (usedCoupon) {
      if (exceptCouponPrice > usedCoupon['deductionAmount']) {
        couponPrice = -(usedCoupon['deductionAmount'] * 1);
      } else {
        this.data.usedCoupon = null;
        usedCoupon = null;
      }
    }

    var totalPrice =
      (
        aldultsPrice +
        childPrice -
        freeServicePrice +
        couponPrice +
        salePrice -
        rewardPurseFee -
        deductionCardFee +
        buyDeductionCardFee
      ).toFixed(2) * 1;
    var originTotalPrice =
      (
        aldultNum * (originPrice + realServicePrice) +
        childsNum * (originChildPrice + realServicePrice) -
        freeServicePrice +
        couponPrice +
        salePrice -
        rewardPurseFee -
        deductionCardFee +
        buyDeductionCardFee
      ).toFixed(2) * 1;

    var realTotalPrice = totalPrice.toFixed(2);
    var realOriginTotalPrice = originTotalPrice.toFixed(2);
    if (servicePrice > 0) {
      let servicePriceCount = aldultNum + childsNum;
      let freeServiceCount = hasOneFreeServiceFee ? 1 : 0;
      servicePriceCount -= freeServiceCount;
      var item = {
        name: detail.serviceChargeInfo.title,
        price: servicePrice,
        count: servicePriceCount,
        decount: noServiceFee,
        unit: '份',
        tag: noServiceFee ? '' : '不可取消',
      };
      if (servicePriceCount > 0) {
        priceList.push(item);
      }
    }

    if (realServicePrice > 0) {
      priceCompose.push('服务费');
    }
    if (salePackage.length > 0 && xListOpen.length === 0) {
      priceCompose.push('附加选购产品');
    }

    let priceComposeDesc = '订单包含' + priceCompose.join('、');
    let decountFee = 0;
    if (usedCoupon) {
      var item = {
        name: '优惠券',
        price: -usedCoupon['deductionAmount'],
        count: -1,
        unit: '',
      };
      priceList.push(item);
      decountFee = usedCoupon['deductionAmount'];
    }
    let tempFieldsRewardFee = this.data.detail?.tempFields?.rewardFee || 0;

    let purseFee = !detail.isPresale
      ? tempFieldsRewardFee + packagePurseFee
      : 0;
    let rewardFee = (aldults.length * purseFee).toFixed(2) * 1 || 0;

    if (rewardPurseFee > 0) {
      var item = {
        name: '红包抵扣',
        price: -countPurseFee,
        count: -1,
        unit: '',
      };
      priceList.push(item);
      decountFee += countPurseFee;
    }

    if (freeServicePrice > 0) {
      decountFee += freeServicePrice;
    }
    if (
      this.data.reductionCardChannel &&
      this.data.selectInstantDeductionCard &&
      buyDeductionCardFee > 0 &&
      this.data.reductionCardInfo &&
      !this.data.reductionCardInfo.checked
    ) {
      var item = {
        name: this.data.reductionCardInfo.name,
        price: this.data.reductionCardInfo.showPrice,
        count: 1,
        decount: '',
        unit: '份',
        tag: '点击取消',
        canCancel: true,
        id: this.data.reductionCardInfo.packageCode,
      };
      priceList.push(item);
    }
    if (deductionCardFee > 0 && this.data.selectInstantDeductionCard) {
      var item = {
        name: '特惠权益',
        price: -deductionCardFee,
        count: -1,
        unit: '',
      };
      priceList.push(item);
      decountFee += deductionCardFee;
    }
    var openedInsurance = this.getOpenedInsurance();
    var hasCoupon3 =
      (this.data.selectX &&
        (this.data.selectX.type == 'coupon3' ||
          this.data.selectX.type == 'coupon1')) ||
      false;
    // 判断逻辑增加超级会员极速出票
    if (
      insuranceFromXList != this.data.insuranceFromXList ||
      insuranceFromSale != this.data.insuranceFromSale
    ) {
      this.noticeChangeInsuranceChange(insuranceFromXList, insuranceFromSale);
    }
    console.log(priceList, 'priceList');
    this.setData(
      {
        ...data,
        realServicePrice,
        priceList,
        priceListExtra,
        salePackage,
        hasSalePackage: salePackage.length > 0,
        totalPrice,
        originTotalPrice,
        showPresalePrice,
        realTotalPrice,
        realOriginTotalPrice,
        isShowInvoice: passList.length && servicePrice,
        countPurseFee,
        decountFee,
        hasInsurance: hasInsurance,
        openedInsurance,
        hasCoupon3,
        childs,
        aldults,
        rewardFee,
        takeChilds,
        noServiceFee,
        priceComposeDesc,
        insuranceFromXList,
        insuranceFromSale,
        freeServicePrice,
        selectXlist,
      },
      () => {
        callback && callback(totalPrice);
      }
    );
  },
  serviceFeeTip() {
    this.showMsg(
      '服务费包含支付手续费，短信费，技术接入费；如产生退票，服务费不退。'
    );
  },

  hideInsDesc: function () {
    this.setData({
      showInsDesc: false,
    });
    this.hideMask();
  },
  showDetailInfo: function () {
    this.setData({
      showBusInfoDetail: true,
    });
  },
  dissMissBusInfoDetail: function () {
    this.setData({
      showBusInfoDetail: false,
    });
  },
  showCouponExplain: function () {},
  onShowCouponList: function () {
    this.onUbtTrace('click', 'book_coupon_button', '填写页券使用', '');
    let { couponList } = this.updateCouponList(this.data.couponList);
    BusShared.save('couponList', couponList);
    BusShared.save('usedCoupon', this.data.usedCoupon);
    BusRouter.navigateTo('coupon', {
      couponList: 'couponList',
      usedCoupon: 'usedCoupon',
    });
  },

  onPressInsuranceDesc(e) {
    let openedInsrance = this.getOpenedInsurance();

    if (openedInsrance.length > 0) {
      let data = e.currentTarget.dataset || {};
      let { key } = data;
      if (key) {
        let insdesc = getInsuranceClause(openedInsrance[0], 'bus');
        let descUrl = insdesc[key];
        if (descUrl) {
          BusRouter.navigateTo('web', {
            url: encodeURIComponent(descUrl.url),
            title: '产品说明',
            naviColor: this.data.colorConfig.headerBgColor || '',
          });
        }
        if (key === 'insuranceNotice') {
          Utils.sendClickTrace('booking_InsuInstruction__click', {
            commnet: '填写页-投保须知曝光',
          });
        }
      }
    }
  },

  updateCouponList: function (data) {
    var self = this,
      mList = [],
      index = 0,
      totalPrice = self.data.totalPrice || 0;
    var servicePrice = this.data.servicePrice || 0;
    var selectPackage = {};
    var packageList = this.data.packageList || [];
    for (var i = 0; i < packageList.length; i++) {
      var item = packageList[i];
      if (item.open) {
        selectPackage = item;
        break;
      }
    }

    var mNow = new Date().getTime();

    var maxCanuseCoupon = null;
    var maxCouponPrice = 0;
    let decountCouponFee = 0;
    let usedCoupon = this.data.usedCoupon;
    if (usedCoupon) {
      decountCouponFee = usedCoupon['deductionAmount'] * 1;
    }
    data.forEach(function (item) {
      var mStart =
          new Date(item['couponStartDate'].replace(/\-/g, '/')).getTime() * 1,
        mEnd =
          new Date(item['couponEndDate'].replace(/\-/g, '/')).getTime() * 1;

      item['_aviable'] = mStart <= mNow && mNow <= mEnd;

      item['_canuse'] = true;

      item.alartMessage = [];

      if (
        totalPrice + decountCouponFee < item.limitPrice ||
        totalPrice + decountCouponFee < item.deductionAmount
      ) {
        item['_canuse'] = false;
        item.alartMessage.push('订单金额不满足');
      }
      if (servicePrice < item.limitServiceFee) {
        item['_canuse'] = false;
        item.alartMessage.push('仅服务费路线可用');
      }
      item['_ishowMsg'] = false;

      var couponPrice = item.deductionAmount;
      if (item._canuse && item._aviable && couponPrice > maxCouponPrice) {
        maxCanuseCoupon = item;
        maxCouponPrice = couponPrice;
      }

      index++;
      mList.push(item);
    });
    return { couponList: mList, maxCoupon: maxCanuseCoupon };
  },
  getCouponList: function () {
    var self = this;
    let { fromCity, toCity, fromStation, toStation } = this.data.detail;
    return Pservice.filteredCouponQuery({
      city: {
        fromName: fromCity,
        toName: toCity,
      },
      station: {
        fromName: fromStation,
        toName: toStation,
      },
      lever: 0,
    })
      .then((res) => {
        let availableList = res.data.availableCoupons || [];
        let unavailableList = res.data.unavailableCoupons || [];
        if (unavailableList.length > 0) {
          unavailableList.forEach((item) => {
            item['_unavailable'] = true;
          });
        }
        let mList = availableList.concat(unavailableList);
        var { couponList, maxCoupon } = self.updateCouponList(mList);
        var usedCoupon = null;
        if (
          !(
            this.data.isSupportNewUser &&
            this.data.bShow &&
            this.data.isNewCustomer
          )
        ) {
          usedCoupon = maxCoupon;
        }
        self.setData(
          {
            couponList: couponList,
            maxCoupon: maxCoupon,
            usedCoupon: usedCoupon,
          },
          () => {
            self.countPrice(self.data);
          }
        );
      })
      .catch((data) => {
        self.setData({
          couponList: [],
          usedCoupon: null,
        });
        self.countPrice(self.data);
      });
  },

  addNewPas: function (e) {
    console.log('e', e);
    this.onUbtTrace(
      'click',
      'book_passengerAddInputfresh_button',
      '填写页新增乘客弹窗-增加全新乘客',
      ''
    );
    let showOcr = e.detail.showOcr;
    if (showOcr) {
      const pas = {
        takeChild: 0,
        isChild: 0,
        PassengerID: 0,
        cname: '',
        idcard: {
          type: 1,
          text: '身份证',
          CardNo: '',
          no: '',
        },
        idcards: [],
        birth: '1990-10-10',
      };
      cwx.component.ocr(
        {
          bizType: 'BUS',
          title: '证件识别',
        },
        (result) => {
          console.log('ocr result', result);

          if (result && result.idCardNo) {
            pas.idcard.no = result.idCardNo.toUpperCase();
            pas.idcard.CardNo = result.idCardNo.toUpperCase();
            pas.cname = result.name;
            pas.fromScan = true;
            this.showToast({
              icon: 'none',
              message: '识别成功, 请确认信息后保存',
            });
            this.toPassenger(pas, false);
          } else {
            this.showToast({
              icon: 'none',
              message: '未识别到证件请重试',
            });
          }
        }
      );
    } else {
      this.toPassenger(undefined, showOcr);
    }
  },
  getOpenedEasyRefund: function () {
    let openedEasyRefund = [];
    let saleList = this.data.saleList || [];
    saleList.forEach((item) => {
      if (
        item &&
        item.open &&
        item.packageCode === this.data.buttonRecommendEasyRefund?.packageCode
      ) {
        openedEasyRefund.push(item);
      }
    });
    return openedEasyRefund;
  },
  getOpenedSale: function () {
    let openedSale = [];
    let saleList = this.data.saleList || [];
    saleList.forEach((item) => {
      if (
        item &&
        item.open &&
        item.packageCode === this.data.buttonRecommendFiveMin?.packageCode
      ) {
        openedSale.push(item);
      }
    });
    return openedSale;
  },
  getOpenedInsurance: function () {
    var openedInsurance = [],
      packageList = this.data.packageList,
      xList = this.data.xList || [];
    packageList.forEach((item) => {
      if (
        item.open &&
        item.packageCode != '404' &&
        (item.type || '').toLowerCase().indexOf('insurance') >= 0
      ) {
        openedInsurance.push(item);
      }
    });
    xList.forEach((item) => {
      if (
        item.open &&
        (item.type || '').toLowerCase().indexOf('insurance') >= 0
      ) {
        openedInsurance.push(item);
      }
    });
    return openedInsurance;
  },

  checkInput: function () {
    // 乘客
    var passList = this.data.passList;
    if (!passList.length) {
      this.showMsg('请至少选择一名乘客');
      return false;
    }
    //成人
    var aldults = this.data.aldults || [];
    if (!aldults.length) {
      this.showMsg('请至少添加一名成人');
      return false;
    }
    // 取票人
    var ticketPicker = this.data.ticketPicker;
    if (!ticketPicker || !ticketPicker.name) {
      this.showMsg('取票人不能为空');
      return false;
    }

    // 手机号
    var phoneNum = inputContent['phone'];
    if (!phoneNum || !phoneNum.length) {
      this.showMsg('手机号不能为空');
      return false;
    }

    //修改手机号码校验规则。只要是11数字就通过
    var pNumReg = /^[0-9]{11}$/;
    if (!pNumReg.test(phoneNum)) {
      this.showMsg('请填写正确的手机号');
      return;
    }
    cwx.setStorage({
      key: 'BUS_PHONE_NUMBER',
      data: phoneNum,
    });

    return true;
  },

  checkParentAge: function (number) {
    let nowDateNum = new Date().format('yyyyMMdd') * 1;
    let birthDay = number.slice(6, 14);
    return nowDateNum - birthDay > 180000;
  },

  checkParent: function () {
    var parentName = inputContent.parentName || '';
    var parentIdNumber = inputContent.parentIdNumber || '';
    var checkName = (cname = '') => {
      const trimC = /[a-zA-Z0-9^.$()¦*+?]/;
      if (trimC.test(cname)) {
        return 2;
      }
      cname = cname.replace(/[^\u4e00-\u9fa5]/gi, '');
      const cNameReg = /^[\u4e00-\u9fa5]+[\u4e00-\u9fa5]{1,14}$/;
      if (!cname) {
        return 1;
      }
      if (!cNameReg.test(cname)) {
        return 2;
      }
      cwx.setStorage({
        key: 'BUS_PARENT_NAME',
        data: parentName,
      });
      cwx.setStorage({
        key: 'BUS_PARENT_NUMBER',
        data: parentIdNumber,
      });
      return 0;
    };
    if (checkName(parentName) > 0) {
      this.showMsg('请输入正确中文名');
      return false;
    }
    if (!PassengerUtil.isIdCard(parentIdNumber)) {
      this.showMsg('请输入正确身份证号');
      return false;
    }
    if (!this.checkParentAge(parentIdNumber)) {
      this.showMsg('请填写父/母最新一代身份证号码');
      return false;
    }
    return true;
  },

  canBuyInsurance: function () {
    let passList = this.data.passList;
    let checked = 0;
    let hasAldult = false;
    let hasChild = false;
    let errMsg = '';
    if (passList.length > 0) {
      for (let i = 0; i < passList.length; i++) {
        let pas = passList[i];
        if (Passenger.cardTypesName[pas.cardName] == 1) {
          if (pas.cardNum.length == 18) {
            let nowDateNum = new Date().format('yyyyMMdd') * 1;
            let pasCardBirth = (pas.birthDay || nowDateNum + '').replace(
              /-/g,
              ''
            );
            if (nowDateNum - pasCardBirth > 180000) {
              hasAldult = true;
            } else {
              //避免其他不通过情况出现
              hasChild = true;
            }
          } else {
            //可以终止
            checked = 1;
            errMsg = `<b style="color:#999999;font-size:12px;">乘客 ${pas.name} 证件格式不支持投保，请填写最新一代身份证号码</b>`;
            break;
          }
        } else {
          //可以终止
          checked = 1;
          errMsg = `<b style="color:#999999;font-size:12px;">乘客 ${pas.name} 证件格式不支持投保，请填写最新一代身份证号码</b>`;
          break;
        }
      }
      if (checked == 0 && !hasAldult && hasChild) {
        checked = 2;
        errMsg = `<b style="color:#999999;">目前保险不支持未成年人投保，请补充 父/母身份证信息 投保</b>`;
      }
    }
    return {
      checked,
      errMsg,
    };
  },

  checkCanBuyInsurance: function () {
    var openedInsurance = this.getOpenedInsurance();
    if (openedInsurance.length > 0) {
      let { checked, errMsg } = this.canBuyInsurance();
      return {
        checked,
        errMsg,
        openedInsurance,
      };
    } else {
      return {
        checked: 0,
        errMsg: '',
        openedInsurance,
      };
    }
  },

  doSubmit: function (e) {
    if (this.data.isSelectChild && !this.data.isAgreeChild) {
      this.onChildTrace('payClick');
      this.onMove();
      return;
    } else {
      this.onChildTrace('optionPayClick');
      this.setData({
        moveAnim: {},
      });
    }
    var checkedInput = this.checkInput();
    if (!checkedInput) {
      return;
    }
    var method = e.currentTarget.dataset.method || '';
    if (method === 'afterpay') {
      this.onUbtTrace('click', 'book_creditPay_icon', '填写页信用付按钮', '');
    } else {
      this.onUbtTrace('click', 'book_pay_icon', '填写页“去支付”按钮', '');
    }
    let { checked } = this.canBuyInsurance();

    if (checked === 0) {
      let openedInsurance = this.getOpenedInsurance();
      if (
        openedInsurance.length == 0 &&
        method != 'afterpay' &&
        !this.data.hasCancelInsurance &&
        this.data.buttonRecommendInsurance
      ) {
        let virusIns = this.data.buttonRecommendInsurance;
        this.setData({
          showInsuranceModal: true,
          buttonRecommend: this.data.buttonRecommendInsurance,
        });
        Utils.sendExposeTrace('booking_InsuInstruction_show', {
          commnet: '填写页-投保须知曝光',
        });
        this.onUbtTrace(
          'exposure',
          'book_insur_pop',
          '填写页点击去支付按钮后的意外险弹窗展现',
          ''
        );
        return;
      }
    }
    if (this.data.buttonRecommendFiveMin) {
      let openedSale = this.getOpenedSale();
      if (openedSale.length == 0 && method != 'afterpay') {
        this.setData({
          showInsuranceModal: true,
          buttonRecommend: this.data.buttonRecommendFiveMin,
        });
        return;
      }
    }
    if (this.data.buttonRecommendEasyRefund) {
      let openedEasyRefund = this.getOpenedEasyRefund();
      if (openedEasyRefund.length == 0 && method != 'afterpay') {
        this.setData({
          showInsuranceModal: true,
          buttonRecommend: this.data.buttonRecommendEasyRefund,
        });
        return;
      }
    }

    this.openButtonRecommendInsurance(false, () => {
      this.doSubmitAfterbuttonRecommend(method);
    });
  },

  noticeChangeInsuranceChange(insuranceFromXList, insuranceFromSale) {
    if (insuranceFromSale || insuranceFromXList) {
      Utils.sendExposeTrace('booking_InsuInstruction_show', {
        commnet: '填写页-投保须知曝光',
      });
    }
  },

  doSubmitAfterbuttonRecommend: function (method) {
    var { checked, errMsg, openedInsurance } = this.checkCanBuyInsurance();
    if (checked > 0) {
      var customModalData = {
        richTextMessage: errMsg,
        title: '温馨提示',
        color: '#666666',
        buttons: [
          {
            buttonTitle: '取消保险',
            buttonColor: '#ffffff',
            buttonTextColor: '#888888',
            action: () => {
              //取消所有保险类搭售
              openedInsurance.forEach((item) => {
                item.open = false;
              });
              if (
                this.data.selectX &&
                this.data.selectX.type &&
                (this.data.selectX.type || '')
                  .toLowerCase()
                  .indexOf('insurance') >= 0
              ) {
                this.data.selectX = {};
              }
              this.setData(this.data);
              this.countPrice(this.data, () => {
                this.nextStep(method);
              });
            },
          },
          {
            buttonTitle: `重新填写`,
            buttonColor: '#FF9A14',
            buttonTextColor: '#ffffff',
            action: () => {},
          },
        ],
      };
      if (checked == 2) {
        customModalData.inputs = [
          {
            title: '父/母姓名:',
            value: inputContent.parentName || '',
            placeholder: '请输入姓名',
            id: 'parentName',
            cursorSpacing: '80',
            action: this.bindInputChange,
          },
          {
            title: '身份证:',
            value: inputContent.parentIdNumber || '',
            placeholder: '请输入证件号码',
            type: 'idcard',
            id: 'parentIdNumber',
            cursorSpacing: '80',
            maxLength: 18,
            action: this.bindInputChange,
          },
        ];
        customModalData.buttons = [
          {
            buttonTitle: '取消保险',
            buttonColor: '#ffffff',
            buttonTextColor: '#cbcbcb',
            action: () => {
              //取消所有保险类搭售
              openedInsurance.forEach((item) => {
                item.open = false;
              });
              if (
                this.data.selectX &&
                this.data.selectX.type &&
                (this.data.selectX.type || '')
                  .toLowerCase()
                  .indexOf('insurance') >= 0
              ) {
                this.data.selectX = {};
              }
              this.setData(this.data);

              this.countPrice(this.data, () => {
                this.nextStep(method);
              });
            },
          },
          {
            buttonTitle: `获得保障`,
            buttonColor: '#FF9A14',
            buttonTextColor: '#ffffff',
            actionBeforeHidden: true,
            action: () => {
              var passCheck = this.checkParent();
              if (passCheck) {
                setTimeout(() => {
                  this.nextStep(method);
                }, 0);
              }
              return passCheck;
            },
          },
        ];
      }
      setTimeout(() => {
        this.showCustomModal(customModalData);
      }, 200);
      return;
    }
    this.nextStep(method);
  },
  inLoading: false,

  buildOrderParam(method) {
    var isCredit = method === 'afterpay';
    var busInfo = this.data.detail,
      isPromotion = this.data.isPromotion,
      passList = this.data.passList,
      xList = this.data.xList,
      salePackage = this.data.salePackage || [],
      coupon = this.data.usedCoupon || {},
      reductionCardChannel = this.data.reductionCardChannel || {},
      reductionCardInfo = this.data.reductionCardInfo || {};
    var takeChildCnt = passList.filter((p) => p.passengerType === 'X').length;
    var systemInfo = cwx.util.systemInfo || {};
    var mUtmsource = Utils.getUtmSource();
    var ticketPicker = this.data.ticketPicker;
    let { isPresale, fromDate, fromTime } = busInfo;
    let alternativeData = null;
    let timeParam = { date: fromDate, time: fromTime };
    if (isPresale) {
      alternativeData = this.getAlternativeTime(timeParam);
    }
    // 乘车人信息赋值
    let fetchInfo = {};
    var passengerList = passList.map((item) => {
      let isFetcher = false;
      if (!_.isEmpty(ticketPicker) && !item.isChild && !item.isTakeChild) {
        isFetcher = true;
        fetchInfo = item;
      }
      var passengerType =
        item.passengerType === 'X' ? 'TC' : item.passengerType || 'A';
      var pType;
      switch (passengerType) {
        case 'X':
        case 'TC': {
          pType = 3;
          break;
        }
        case 'C':
        case 'c': {
          pType = 2;
          break;
        }
        case 'A': {
          pType = 1;
          break;
        }
        default:
          pType = 1;
      }
      return {
        name: item.name,
        lastName: item.eNLastName,
        firstName: item.eNFirstName,
        passengerType: pType,
        birth: item.birthDay,
        nationality: item.nationality,
        idCard: [
          {
            idType: item.idType,
            idNum: item.cardNum,
            cardCount: null,
            visaDate: item.cardTimelimit,
            effectiveDate: null,
            chinaEntry: null,
            taiwanEntry: null,
          },
        ],
        stayDays: null,
        address: null,
        mobile: item.mobile,
        fetcher: isFetcher,
        policyHolder: inputContent.parentName
          ? {
              name: inputContent.parentName || '',
              idNum: inputContent.parentIdNumber || '',
              idType: '1',
            }
          : null,
      };
    });

    var openedSale = [];

    [...xList].map((item) => {
      item.isX = true;
      if (item.open) {
        openedSale.push(item);
        if (item.giveProduct && item.giveProduct.id) {
          openedSale.push(item.giveProduct);
        }
      }
    });
    if (
      this.data.selectInstantDeductionCard &&
      this.data.reductionCardInfo &&
      !this.data.reductionCardInfo.checked &&
      reductionCardChannel
    ) {
      openedSale.push({
        packageCode: reductionCardInfo.packageCode,
        saleCount: 1,
        channelId: '' + (reductionCardChannel.channelId || '0'),
        page: 2, // todo
      });
    }
    let usedCardTypeList = [];
    if (
      this.data.reductionCardInfo &&
      this.data.reductionCardInfo.checked &&
      this.data.selectInstantDeductionCard
    ) {
      usedCardTypeList.push(this.data.reductionCardInfo.cardType);
    }
    openedSale = openedSale.concat(salePackage);
    var appendProductList = openedSale.map((item) => {
      return {
        packageCode: item.packageCode,
        buyNumber: item.saleCount,
        channelId: '' + (item.channelId || '0'),
        page: item.xPosition === 'x' ? 1 : item.xPosition === 'list' ? 5 : 2,
      };
    });
    var openXPackage = {};
    xList.forEach((item) => {
      if (item.open) {
        openXPackage = item;
      }
    });

    var param = {
      productLine: 1,
      fromCity: busInfo.fromCity,
      toCity: busInfo.toCity,
      fromStation: busInfo.fromStation,
      toStation: busInfo.toStation,
      fromDate: this.options.date || this.options.fromDate,
      fromTime: busInfo.fromTime,
      website: busInfo.website,
      lineCode: busInfo.symbol,
      number: busInfo.busNumber,
      fetcher: {
        //取票人信息
        name: fetchInfo.name || ticketPicker.name || '',
        lastName: fetchInfo.eNLastName || ticketPicker.eNLastName || '',
        firstName: fetchInfo.eNFirstName || ticketPicker.eNFirstName || '',
        idNum: fetchInfo.cardNum || ticketPicker.cardNum || '',
        idType: fetchInfo.cardType || ticketPicker.cardType || '',
        contactMobile: inputContent['phone'] || fetchInfo.mobile || '',
        contactAreaCode:
          fetchInfo.countryCode || ticketPicker.countryCode || '',
        contactEmail: fetchInfo.contactEmail || ticketPicker.contactEmail || '',
      },
      passengers: passengerList,
      ticketCnt: passengerList.length,
      childticketCnt: takeChildCnt, //不需要传这个值
      couponCode: !_.isEmpty(coupon) ? coupon.couponCode : '',
      useRedPackage:
        busInfo.isPresale || isPromotion
          ? false
          : this.data.rewardChannel || false,
      alternative: alternativeData, // 备选班次;
      appendProductList: appendProductList, // 附加产品
      usedCardTypeList: usedCardTypeList, // 使用的权益类型 1:兑换券 2:超级会员权益卡 3:超级会员极速出票卡 602:立减卡
      busParams: {
        payMethod: isCredit ? 1 : 2,
        channelId: '1',
        activityId: '0',
      },
      union: {
        awakeUnion: JSON.stringify(this.unionData || {}),
        clientType: systemInfo.platform + BusConfig.suffix,
        clientVersion: BusConfig.client_version || systemInfo.version,
        clientId: cwx.clientID,
        utmSource: mUtmsource,
        vid: __global.vid || '',
        allianceId: '' + ((this.unionData || {}).allianceid || ''),
        sid: '' + ((this.unionData || {}).sid || ''),
        ouid: '' + ((this.unionData || {}).ouid || ''),
        sourceId: '' + ((this.unionData || {}).sourceid || ''),
        scanId: this.data.scanId,
      },
      memberBenefitCheckRealName: true,
    };

    return param;
  },
  nextStep: function (method) {
    if (this.inLoading) {
      return;
    }
    this.inLoading = true; //加锁
    setTimeout(() => {
      this.inLoading = false;
    }, 5000); //5秒解锁避免卡死

    let nextBlock = () => {
      // 地推直接下单
      this.addOrder(method);
    };

    var isCredit = method === 'afterpay';
    var busInfo = this.data.detail;
    var totalPrice = this.data.totalPrice;
    var orignTotalPrice = this.data.originTotalPrice;
    var supportAfterPay = this.data.supportAfterPay;

    if (
      busInfo.isPresale &&
      !isCredit &&
      totalPrice != orignTotalPrice &&
      supportAfterPay
    ) {
      var customModalData = {
        richTextTitle: `<b style="font-size:18px;color:#000000;font-weight:700;">普通支付</b>`,
        richTextMessage: `<b style="font-size:12px;color:#999999;">目前票价¥${orignTotalPrice}，车站开售时可能涨价，请先支付¥${totalPrice}，若有差价，出票后退还</b>`,
        color: '#666666',
        buttons: [
          {
            buttonTitle: '容我想想',
            buttonColor: '#ffffff',
            buttonTextColor: '#888888',
            action: () => {
              //不参加立减活动
            },
          },
          {
            buttonTitle: '去支付',
            buttonColor: '#FF9913',
            buttonTextColor: '#ffffff',
            action: () => {
              //立即支付
              nextBlock();
            },
          },
        ],
      };
      this.showCustomModal(customModalData);
    } else {
      nextBlock();
    }
  },

  toPay: function (e) {
    if (this.inLoading) {
      return;
    }
    this.inLoading = true; //加锁
    setTimeout(() => {
      this.inLoading = false;
    }, 5000); //5秒解锁避免卡死
    let { payMethod } = this.data;
    this.addOrder(payMethod);
  },

  addOrder: function (method = 'normal') {
    var param = this.buildOrderParam(method);
    this.showLoading('正在下单...');
    orderUtils.addOrder(param).then((order) => {
      // 营销统计

      if (order.orderNumber) {
        this.sendOrderTrace(order.orderNumber);
        this.orderNumber = order.orderNumber;
        if (AppConfig.usingPayComponents) {
          this.hideToastAction(false);
        } else {
          this.orderPay(order, method);
        }
      } else {
        this.inLoading = false; //解锁
        this.showMsg(order.message || '提交订单失败，请重试', () => {});
        this.ubtTrace(100985, order || { errorMsg: '未知错误' });
      }

      this.traceAddOrder(param, order);
      this.inLoading = false; //解锁
      this.hideLoading();
    });
  },
  orderPay: function (_data, method) {
    // 获取流水号之前埋点
    var busInfo = this.data.detail;
    const { ticketUnitOriginalPrice } = busInfo;
    this.orderNumber = _data.orderNumber;
    this.pageCallback = function () {
      this.hideLoading();
    }.bind(this);

    orderUtils
      .pay(_data)
      .then((res) => {
        this.showToast('支付成功', () => {
          this.hideToastAction(true, ticketUnitOriginalPrice, method);
        });
      })
      .catch((err) => {
        // 支付失败
        this.showToast(
          {
            message: err.type == 0 ? '支付取消' : '支付失败',
            icon: 'warn',
          },
          () => {}
        );
        this.setData(
          {
            isNewCustomer: false,
          },
          () => {
            this.getCouponList();
            this.getPurseBalanceFee(this.data).then((res) => {
              this.setData(res, () => {
                this.countPrice(this.data);
              });
            });
          }
        );
      });
  },

  showPriDesc: function (e) {
    let item = e.currentTarget.dataset.item;
    let descArray = item.desc.split('|');
    // this.showModal()

    let innerHtml = '';
    descArray.forEach((desc) => {
      innerHtml += `<p style="text-align:left">${desc}</p>`;
    });
    var customModalData = {
      richTextMessage: `<div>${innerHtml}</div>`,
      title: '温馨提示',
      color: '#666666',
      buttons: [
        {
          buttonTitle: '知道了',
          buttonColor: '#ffffff',
          buttonTextColor: '#888888',
          action: () => {
            //取消
          },
        },
      ],
    };
    this.showCustomModal(customModalData);
  },

  traceAddOrder(params, order) {
    this.ubtTrace(102687, {
      params: JSON.stringify(params),
      orderNumber: order.orderNumber,
    });
  },

  hideToastAction: function (didPay, ticketUnitOriginalPrice, payType) {
    // 订单详情需要1秒时间刷新状态
    setTimeout(() => {
      if (this.orderNumber) {
        var params = {
          oid: this.orderNumber,
          showCoupon: 1,
          fromPage: didPay ? 'booking' : '',
          ticketUnitOriginalPrice,
          payType,
        };
        BusRouter.redirectTo('orderdetail', params, true, 5);
      }
    }, 1000);
  },
  sendUnionTrace: function (orderNumber) {
    cwx.mkt.sendUnionTrace(this, orderNumber, 'BUS');
  },
  sendOrderTrace: function (orderNumber) {
    let openXPackage = {};
    let xList = this.data.xList;
    xList.forEach((item) => {
      if (item.open) {
        openXPackage = item;
      }
    });
    let isAB = cwx.ABTestingManager.valueForKeySync('220117_BUS_XCXX1') || '';
    Utils.sendClickTrace('xcx_booking_pay_button_click', {
      orderNumber: orderNumber,
      abVersion: isAB,
      channelName: openXPackage.channelName || '',
    });
    // 埋点是否要治理一下，同一个按钮存在多个埋点
    Utils.sendClickTrace('xcx_whtc_booking_pay_button_click', {
      commnet: '填写页挽回弹窗实验去支付按钮点击上报',
    });
  },

  onUbtTrace(type, typeSnd, comment, content, abVersion = '') {
    let key =
      type === 'click'
        ? 'bus_ctrip_wxxcx_allpage_click'
        : 'bus_ctrip_wxxcx_allpage_show';
    let keyid = type === 'click' ? '200534' : '200558';
    let key_des =
      type === 'click' ? '汽车票小程序点击全埋点' : '汽车票小程序曝光全埋点';
    let info = {
      keyid,
      key_des,
      pageId: this.pageId,
      type: 'ctripwxxcx',
      typeSnd,
      utmSource: this.data.utmSource || '',
      comment,
      abVersion,
    };
    if (content) {
      info['content'] = content;
    }
    this.ubtTrace(key, info);
  },

  bindClickPhoneInpunt() {
    this.onUbtTrace(
      'click',
      'book_mobilePhone_button',
      '填写页联系手机修改栏',
      ''
    );
  },

  onAgreeChild() {
    if (!this.data.isAgreeChild) {
      this.onChildTrace('check');
    } else {
      this.onChildTrace('cancelCheck');
    }
    this.setData({
      isAgreeChild: !this.data.isAgreeChild,
    });
  },

  onChildTrace(type) {
    let obj = {
      payClick: {
        text: '保险合规_填写页_未勾选协议下支付',
        typeSnd: 'ctrip_bus_book_pay_click',
      },
      optionPayClick: {
        text: '保险合规_填写页_勾选协议下支付',
        typeSnd: 'ctrip_bus_book_option_pay_click',
      },
      check: {
        text: '保险合规_填写页_选中协议',
        typeSnd: 'ctrip_bus_book_childrenclause_check_click',
      },
      cancelCheck: {
        text: '保险合规_填写页_取消协议',
        typeSnd: 'ctrip_bus_book_childrenclause_check_cancel_click',
      },
    };
    this.ubtTrace('ctrip_allline_book_click', {
      keyid: '203574',
      key_des: obj[type].text,
      pageId: this.pageId,
      type: 6,
      typeSnd: obj[type].typeSnd,
      scanId: '',
      utmSource: this.data.utmSource,
      comment: obj[type].text,
    });
  },

  onMove() {
    this.setData({
      bookAnchor: 'pagesBottom',
    });
    setTimeout(() => {
      let animation = wx.createAnimation({
        duration: 100,
      });
      animation.translateX(5).step();
      animation.translateX(-5).step();
      animation.translateX(5).step();
      animation.translateX(-5).step();

      this.setData(
        {
          moveAnim: animation.export(),
          bookAnchor: '',
        },
        () => {
          this.setData({
            moveAnim: {},
          });
        }
      );
    }, 500);
  },

  getNewGuestActivity(type) {
    let { ticketUnitSalePrice } = this.data.detail;
    Pservice.getNewGuestActivity({
      type, // 1:首页弹窗 2:首页banner 3:填写页
      price: `${ticketUnitSalePrice}`,
    })
      .then((res) => {
        if (
          res.data &&
          res.data.giftPackageDesc &&
          res.data.giftPackageDesc.length > 0
        ) {
          Utils.sendExposeTrace('booking_newerBanner_show', {
            comment: '填写页-新人活动banner曝光',
            isNew: this.data.offlineOldUser ? '0' : '1',
          });
          let data = res.data.giftPackageDesc;
          this.setData({
            fromBook: true,
            isShowNewUseBanner: true,
            newUseBannerDesc: data,
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  },
  getServiceFeeExplain() {
    let mdetail = this.data.detail || {};
    let mtempFields = mdetail.tempFields || {};
    let mwebiste = mtempFields.webiste;
    return Pservice.getServiceFeeExplain(mwebiste)
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        console.log('error');
        return {};
      });
  },

  onShowServiceFeeDesc(e) {
    this.getServiceFeeExplain().then((res) => {
      this.setData({
        serviceFeeExplainData: res,
        showServiceFeeDesc: true,
      });
    });
  },

  hideServiceFeeDesc(e) {
    this.setData({
      showServiceFeeDesc: false,
    });
  },

  formatData(data) {
    if (!data) {
      return [];
    }
    const keyList = Object.keys(data);
    const list = [];
    keyList.forEach((item) => {
      if (item !== 'easyRefund') {
        const tempItem = {};
        tempItem._title = item;
        tempItem._list = data[item];
        list.push(tempItem);
      }
    });
    return list;
  },

  onClickExplainShowMap(e) {
    let station = e.currentTarget.dataset.station;
    if (station) {
      this.showMap();
    }
  },

  getAlternativeTime(param) {
    let { date, time } = param;
    if (/^([0-1]{1}\d|2[0-3]):([0-5]\d)$/g.test(time)) {
      let start = '';
      let end = '';
      const timeArr = time.split(':');
      const hour = timeArr[0];
      const minute = timeArr[1];
      if (hour > 0 && hour < 23) {
        start = hour * 1 - 1 < 10 ? `0${hour * 1 - 1}` : hour * 1 - 1;
        end = hour * 1 + 1 < 10 ? `0${hour * 1 + 1}` : hour * 1 + 1;
        // 不要改成全等
      } else if (hour === '23') {
        start = 22;
        end = '00';
        // 不要改成全等
      } else if (hour === 0) {
        start = 23;
        end = '01';
      }
      return {
        alternativeTimes: [
          {
            start: `${date} ${start}:${minute}`,
            end: `${date} ${end}:${minute}`,
          },
        ],
      };
    }
    return null;
  },

  getGuestActivity() {
    if (this.data.offlineOldUser) {
      this.getOldGuestActivity(3);
    } else {
      this.getNewGuestActivity(3);
    }
  },

  getOldGuestActivity(type) {
    let { ticketUnitSalePrice } = this.data.detail;
    Pservice.getOldGuestActivity({
      type, // 1:首页弹窗 2:首页banner 3:填写页
      price: `${ticketUnitSalePrice}`,
    }).then((res) => {
      if (
        res.data &&
        res.data.giftPackageDesc &&
        res.data.giftPackageDesc.length > 0
      ) {
        Utils.sendExposeTrace('booking_newerBanner_show', {
          comment: '填写页-新人活动banner曝光',
          isNew: this.data.offlineOldUser ? '0' : '1',
        });
        let data = res.data.giftPackageDesc;
        this.setData({
          fromBook: true,
          isShowOldUseBanner: true,
          oldUseBannerDesc: data,
        });
      }
    });
  },

  onCancelInsuranceModal() {
    this.setData({
      showInsuranceModal: false,
    });
  },
  onActionInsuranceModal(e) {
    let { action, method } = e.currentTarget.dataset;
    if (this.data.buttonRecommendInsurance) {
      if (action == 'false') {
        this.onUbtTrace(
          'click',
          'book_insurPopCancel_button',
          '填写页意外险弹窗-否',
          ''
        );
      } else {
        this.onUbtTrace(
          'click',
          'book_insurPopSelect_button',
          '填写页意外险弹窗-是',
          ''
        );
      }
    }
    this.setData({
      showInsuranceModal: false,
    });
    this.openButtonRecommendInsurance(action, () => {
      this.doSubmitAfterbuttonRecommend(method);
    });
  },
  onGoExtraUrl(e) {
    var url = e.currentTarget.dataset.url;
    if (url) {
      Utils.sendClickTrace('booking_InsuInstruction_click', {
        commnet: '填写页-投保须知曝光',
      });
      BusRouter.navigateTo('web', {
        url: encodeURIComponent(url),
        title: '产品说明',
        naviColor: this.data.colorConfig.headerBgColor || '',
      });
    }
  },
  onClickInstantDeductionModal: function (e) {
    console.log(
      this.data.showInstantDeductionModal,
      'this.data.showInstantDeductionModal'
    );
    this.setData(
      {
        showInstantDeductionModal: !this.data.showInstantDeductionModal,
      },
      () => {
        if (this.data.showInstantDeductionModal) {
          Utils.sendExposeTrace('booking_pop_ljk_channel_show', {
            comment: '填写页立减卡通道弹窗曝光上报',
          });
        }
      }
    );
  },
  onClickInstantDeductionRule: function (e) {
    this.setData({
      showInstantDeductionRule: !this.data.showInstantDeductionRule,
    });
    Utils.sendClickTrace('booking_pop_ljk_detail_click', {
      comment: '填写页立减卡通道弹窗详细规则点击上报',
    });
  },
  onClickInstantDeductionBtn: function (e) {
    const isSelectDeductionStatus = !this.data.selectInstantDeductionCard;
    const reductionCardInfo = this.data.reductionCardInfo || {};
    reductionCardInfo.open = !this.data.showInstantDeductionModal;
    if (
      !this.data.showInstantDeductionModal &&
      !this.data.selectInstantDeductionCard
    ) {
      this.setData(
        {
          showInstantDeductionModal: !this.data.showInstantDeductionModal,
        },
        () => {
          if (this.data.showInstantDeductionModal) {
            Utils.sendExposeTrace('booking_pop_ljk_channel_show', {
              comment: '填写页立减卡通道弹窗曝光上报',
            });
          }
        }
      );
    }
    if (isSelectDeductionStatus) {
      Utils.sendClickTrace('booking_ljk_purchase_click', {
        comment: '填写页立减卡购买点击上报',
      });
    } else {
      if (this.data.reductionCardInfo && this.data.reductionCardInfo.checked) {
        Utils.sendClickTrace('booking_ljk_cancel_default_choose_click', {
          comment: '填写页取消默认勾选立减卡点击上报',
        });
      } else {
        Utils.sendClickTrace('booking_ljk_cancel_purchase_click', {
          comment: '填写页立减卡取消购买点击上报',
        });
      }
    }
    this.setData(
      {
        selectInstantDeductionCard: !this.data.selectInstantDeductionCard,
        reductionCardInfo: reductionCardInfo,
      },
      () => {
        this.countPrice(this.data);
      }
    );
  },
});
