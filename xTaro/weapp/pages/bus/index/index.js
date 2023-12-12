import {
  _,
  __global,
  BusConfig,
  BusRouter,
  cDate,
  CityListDataUtils,
  CPage,
  cwx,
  orderUtils,
  Pservice,
  showCustomNaviBar,
  URLUtil,
  Utils,
} from '../index.js';
import Debug from '../common/template/Debug';
import tipMask from '../common/template/tipMask';
import BusPage from '../common/extend';

const shared = cwx.bus;

var orderCountDownTimer = null;
var axtInterval = null;
let BUS_SEARCH_KEY = 'BUS_SEARCH';
let BUS_HISTORY_LIST_KEY = 'BUS_HISTORY_LIST';
let BUS_HOME_BUTTON_CONFIG = 'BUS_HOME_BUTTON_CONFIG';
const systemInfoSync = cwx.getSystemInfoSync();

CPage({
  customStyle: {
    frontColor: '#000000',
  },
  pageId: '10320614135',
  _DAY1: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  data: {
    navbarData: {
      customBack: true,
      customHome: true,
      showCapsule: true,
      showBack: false,
      showColor: false,
      navigationBarColor: '#ffffff',
    },
    showCustomNaviBar: showCustomNaviBar(),
    statusBarHeight: global.globalData.statusBarHeight,
    titleBarHeight: global.globalData.titleBarHeight,
    loading: true,
    from: ' ',
    fromCity: ' ',
    fromCityID: '',
    fromStation: '',
    to: ' ',
    toCity: ' ',
    toCityID: '',
    toStation: '',
    date: '',
    showDate: '',
    displayDate: '',
    notice: '',
    isEx: false,
    utmSource: '',
    isShowNotesDetail: false,
    busNotice: {},
    otherEnterance: [],
    historyList: [],
    homeOrder: {},
    daySymbol: '',
    homePopupData: {
      popUpImg: '',
      showShareLogo: false,
      showSharePopup: false,
    },
    showCouponWindow: false,
    homeCouponNotice: {},
    isDebug: false,
    didTip: false,
    showBottomBar: BusConfig.showBottomBar,
    displayPrivacyPolicy: BusConfig.displayPrivacyPolicy,
    displayLogout: BusConfig.displayLogout,
    selectedTab: 0,
    tabs: [
      {
        key: 'bus',
        name: '汽车票',
        action: 'switch',
        icon: 'https://pic.c-ctrip.com/bus/resource/index/exchange_bus.png',
        cityBlock: {
          from: {
            desc: '出发城市',
            action: 'fromCityAction',
          },
          to: {
            desc: '到达城市',
            action: 'toCityAction',
          },
        },
        menus: [
          {
            title: '我的订单',
            action: 'toOrderList',
            icon: 'https://pages.c-ctrip.com/bus-images/bus/order.png',
          },
          {
            title: '我的优惠券',
            action: 'toCouponList',
            icon: 'https://pages.c-ctrip.com/bus-images/bus/coupon.png',
          },
          {
            title: '我的积分',
            action: 'toIntegrationModule',
            icon: 'https://pic.c-ctrip.com/bus/resource/index/jifen.png',
          },
        ],
      },
      {
        key: 'ship',
        name: '船票',
        action: 'switch',
        url: '/pages/ship/index/index?utmsource=ctripbus_home_direct',
        icon: 'https://pages.c-ctrip.com/bus-images/ship/wechat/exchange_ship.png',
        cityBlock: {
          from: {
            desc: '出发港口',
            action: 'fromShipCityAction',
          },
          to: {
            desc: '到达港口',
            action: 'toShipCityAction',
          },
        },
        menus: [
          {
            title: '在线咨询',
            action: 'toServicechat',
            icon: 'https://pages.c-ctrip.com/bus-images/bus/servicechat.png',
          },
          {
            title: '优惠券',
            action: 'toShipCouponList',
            icon: 'https://pages.c-ctrip.com/bus-images/bus/coupon.png',
          },
          {
            title: '游船',
            action: 'toShipCityList',
            icon: 'https://pages.c-ctrip.com/bus-images/bus/youchuan.png',
          },
          {
            title: '兑换券',
            action: 'toShipCouponactList',
            icon: 'https://pages.c-ctrip.com/bus-images/bus/couponcat.png',
          },
          {
            title: '我的订单',
            action: 'toShipOrderList',
            icon: 'https://pages.c-ctrip.com/bus-images/bus/order.png',
          },
        ],
      },
      {
        name: '旅游专线',
        action: 'jump',
        url: 'https://m.ctrip.com/webapp/tourbus/index?popup=close&autowake=close&deviceFrom=WeChat',
        icon: 'https://pic.c-ctrip.com/bus/resource/index/exchange_bus.png',
      },
      {
        name: '机场专线',
        action: 'jump',
        url: 'https://m.ctrip.com/webapp/tourbus/airportBusIndex?goback=close&popup=close&autowake=close&deviceFrom=WeChat',
        icon: 'https://pic.c-ctrip.com/bus/resource/index/exchange_bus.png',
      },
    ],
    homeBannerConfigList: [],
    homePushTemplateIds: [],
    mCoupon: {},
    renderLottery: false,
    fanXianActivity: {},
    productName: null,
    shipRecommendData: {},
    shipTabs: [],
    showShipBookModal: false,
    moreShipLineData: [],
    shipNoticeContent: '',
    shipNoticeTitle: '',
    shipCouponNotice: '',
    shipNoticeData: [],
    showShipNoticeModal: false,
    isShowGuidetoAdd: true,
    isOpenTagForJifen: true,
    bannerConfigList: [],
    appName: BusConfig.appName,
    newAdvertiseData: {
      width: systemInfoSync.windowWidth,
    },
    slideVideo: {
      delayTime: 5000,
      dotShow: true,
      dotWidthAndHeight: [5, 5],
      dotMargin: 4,
      dotCurrentColor: '#fff',
      dotCurrentType: 'pencil', //dot,pencil 【注：默认选中也是原点，和没有选中一样，pencil 类似老的系统，选中的是长条圆头】
      dotColor: '#fff',
      dotOpacity: 0.4,
      dotCurrentOpacity: 1,
      dotPosition: 'center',
      bottom: (systemInfoSync.windowWidth * 48) / 375,
      left: 10,
      right: 10,
    },
    busNoticeData: {},
    showBusNoticeModal: false,
    hasBusNotice: false,
    fromSchemeData: {
      isFromScheme: false,
    },
    isShowNewUserCoupon: false,
    newUserCoupon: {},
    expireCouponDate: {},
    newUseBannerDesc: [],
    impId: '05QCNVOG0549YSMBZNKWJQLH',
    isShowOldUserCoupon: false,
    offlineOldUser: '',
    axtCountDown: {},
  },

  beforOnload(options) {
    console.log(options);
  },

  handleTap1(e) {
    console.log(e);
  },

  onShareAppMessage: function () {
    return {
      title: '汽车票查询_汽车票预订【携程汽车票】',
      desc: '携程汽车票订购中心，为您提供汽车票网上订票服务，汽车票余票查询，汽车票价，预订长途汽车票。',
      path: '/pages/bus/index/index',
    };
  },
  onReachBottom: function () {},
  /** 浮层处理事件 */
  onPullDownRefresh: function () {
    // Do something when pull down.
    // wx.showNavigationBarLoading(
    // this.initPage({});
    this.otherHomeInfo();
    this.getShipHomeInfo();
  },
  onReady: function () {
    // 缓存影响参数
    cwx.mkt.getUnion((unionData) => {
      this.unionData = unionData || {};
    });
  },
  onLoad: function (options) {
    // Do some initialize when page load.
    BusRouter.isLogin(true).then(({ isLogin }) => {
      this.setData({
        isLogin,
      });
    });
    this.initPage(options);
    cwx.Observer.addObserverForKeyOnly('__bus_ship_cwebmesssage__', (opt) => {
      console.log('==========webview observer=========', opt);
      if (
        opt.options &&
        opt.options.detail &&
        opt.options.detail.data &&
        opt.options.detail.data.length &&
        opt.options.detail.data[0].shipline
      ) {
        const { fromCity, toCity, depDate, productName, utmSource } =
          opt.options.detail.data[0].shipline;
        const busSearchKey =
          BUS_SEARCH_KEY + this.getKeySuffix(this.data.selectedTab);
        let json = {
          from: fromCity,
          to: toCity,
          fromCity: fromCity,
          fromCityID: '',
          toCity: toCity,
          toCityID: '',
          fromStation: '',
          toStation: '',
          BUS_SEARCH_KEY: busSearchKey,
          productName: productName || null,
        };
        this.setData(json);
        if (!!utmSource) {
          this.setData({
            utmSource,
          });
        }

        CityListDataUtils.saveSInfo(json);
      }
    });
    this.isFirstOpen();
    this.onShowTagForJifen();
    this.onShowGuide();
    this.getSearchButtonSkin();
  },
  onShow: function () {
    // BusRouter.navigateTo('tourdetail');
    BusRouter.isLogin(true).then(({ isLogin }) => {
      console.log(isLogin, 'isLogin---');
      this.setData({
        isLogin,
        renderLottery: true,
      });
    });
    this.otherHomeInfo();
    this.getShipHomeInfo();
    this.getGuestActivity();
  },
  onHide: function () {
    clearTimeout(orderCountDownTimer);
    this.setData({
      renderLottery: false,
    });
  },
  onUnload: function () {
    clearTimeout(orderCountDownTimer);
    this.didUnload = true;
  },

  navigateToMainMini: function (link) {
    cwx.user.getToken((token) => {
      if (link.indexOf('http') == 0) {
        link = `/cwx/component/cwebview/cwebview?data={"url":"${encodeURIComponent(
          link
        )}","needLogin":true,"isNavigate":false}`;
      }
      cwx.navigateToMiniProgram({
        appId: 'wx0e6ed4f51db9d078',
        path: URLUtil.serializeURL(link, {
          __userToken: token,
        }),
        envVersion: 'release', //develop ,release , trial
        extraData: {
          auth: cwx.user.auth || '',
        },
        complete() {},
      });
    });
  },

  onBack: function () {
    if (__global.appId !== 'wx0e6ed4f51db9d078') {
      this.navigateToMainMini('pages/home/homepage');
    } else {
      this.navigateBack();
    }
  },
  onHome: function () {
    if (__global.appId !== 'wx0e6ed4f51db9d078') {
      this.navigateToMainMini('pages/home/homepage');
    } else {
      cwx.switchTab({
        url: '/pages/home/homepage',
      });
    }
  },
  getKeySuffix(selectedTab) {
    let key = this.data.tabs[selectedTab].key;
    return key ? '_' + key : '';
  },
  initPage: function (options) {
    let fromCity = options.fromCity;
    let toCity = options.toCity;
    let fromStation = options.fromStation;
    let toStation = options.toStation;
    let fromCityID = options.fromCityID;
    let toCityID = options.toCityID;
    let fromDate = options.date;

    let selectedTab = parseInt(options.selectedTab) || 0;

    let busSearchKey = BUS_SEARCH_KEY + this.getKeySuffix(selectedTab);

    let o_search = cwx.getStorageSync(busSearchKey) || {};
    let historyList =
      cwx.getStorageSync(
        BUS_HISTORY_LIST_KEY + this.getKeySuffix(selectedTab)
      ) || [];
    if (fromCity) {
      o_search.fromCity = fromCity;
      o_search.from = fromCity;
      o_search.fromStation = fromStation || '';
      o_search.fromCityID = fromCityID || '';
    }
    if (toCity) {
      o_search.toCity = toCity;
      o_search.to = toCity;
      o_search.toStation = toStation || '';
      o_search.toCityID = toCityID || '';
    }
    if (this.data.isPromotion) {
      this.ubtTrace(100880, { utmsource: this.data.utmSource || '' });
    }

    let date = new Date();
    let newDate;
    if (fromDate) {
      newDate = new Date(fromDate);
    } else {
      if (o_search.date) {
        newDate = new Date(o_search.date);
      } else {
        newDate = date;
      }
    }
    var current = date;
    if (newDate <= current) {
      newDate = current;
    }
    date = newDate;
    o_search.date = newDate.format('yyyy-MM-dd');

    if (!this.data.isPromotion) {
      date.getDate();
      var now = new Date();
      if (date.getDate() === now.getDate()) {
        if (date.getHours() >= 15) {
          date = date.addDays(1);
        }
      }
    }

    let website = options.website || '';
    let bizType = options.bizType || 'bus';
    let bigChannel = options.bigChannel || '';

    this.setData(
      {
        from: o_search.from || '',
        fromCity: o_search.fromCity || '',
        fromCityID: o_search.fromCityID || '',
        fromStation: o_search.fromStation || '',
        to: o_search.to || '',
        toCity: o_search.toCity || '',
        toCityID: o_search.toCityID || '',
        toStation: o_search.toStation || '',
        selectedTab,
        date: date.format('yyyy-MM-dd'),
        showDate: date.format('MM月dd日'),
        daySymbol: date.getDaySymbol(),
        displayDate: this._DAY1[date.getDay()],
        historyList: historyList,
        loading: false,
        offlineOldUser: options.offlineOldUser || '',
        website,
        bizType,
        bigChannel,
      },
      () => {
        if (!this.data.fromCity && !this.data.isPromotion) {
          this.setData({
            from: '定位中...',
          });
        }
        CityListDataUtils.locateCity().then((res) => {
          let data = { locateCity: res.cityName };

          if (!this.data.fromCity && !this.data.isPromotion) {
            data = {
              ...data,
              from: res.cityName,
              fromCity: res.cityName,
            };
          }
          this.setData(data);
        });
      }
    );

    // 公告
    new tipMask(this, o_search.fromStation);
    // new Coupon(this);
    new Debug(this);

    CityListDataUtils.saveSInfo({
      ...o_search,
      BUS_SEARCH_KEY: busSearchKey,
    });
    if (options.fromPage === 'mcoupon') {
      this.loadMcoupon(options);
    }
    this.getHomeCoupon();
  },
  onCouponIconMove(e) {
    console.log(e);
  },
  otherHomeInfo() {
    this.updateHomeOrder()
      .then(() => this.updateHomeNotice())
      .then(() => this.updateHomeConfig())
      .then((data) => {
        this.setData({
          ...data,
        });
        wx.stopPullDownRefresh();
      });
    this.getBusNoticeData();
    this.getCouponExpireNotice();
  },

  getSearchButtonConfig(pageSource) {
    return Pservice.getSearchButtonUrl({
      pageSource: pageSource,
    })
      .then((res) => {
        let tabConfig = {};
        if (res.code === 1) {
          if (res.buttonUrl) {
            tabConfig.buttonUrl = res.buttonUrl;
          }
          if (res.transButtonUrl) {
            tabConfig.transButtonUrl = res.transButtonUrl;
          }
        }
        return tabConfig;
      })
      .catch((err) => {
        return {};
      });
  },
  getSearchButtonSkin: async function () {
    let homeButtonConfig = cwx.getStorageSync('BUS_HOME_BUTTON_CONFIG') || {};
    let now = new Date().getTime() / 1000;
    let saveTime = (homeButtonConfig && homeButtonConfig.time) || 0;
    if (now - saveTime > 864000) {
      let busConfig = await this.getSearchButtonConfig(1);
      let shipConfig = await this.getSearchButtonConfig(2);
      homeButtonConfig.busConfig = busConfig;
      homeButtonConfig.shipConfig = shipConfig;
      cwx.setStorageSync('BUS_HOME_BUTTON_CONFIG', {
        ...homeButtonConfig,
        time: now,
      });
    }
    let { busConfig, shipConfig } = homeButtonConfig;
    let tabs = this.data.tabs;
    tabs.forEach((tab, index) => {
      if (tab.key === 'bus') {
        tab.buttonSkin = busConfig;
      } else if (tab.key === 'ship') {
        tab.buttonSkin = shipConfig;
      }
    });
    this.setData({
      tabs,
    });
  },
  updateHomeNotice() {
    Pservice.getHomeNotice({})
      .then((res) => {
        return res.return;
      })
      .catch((err) => {
        return {};
      })
      .then((res) => {
        this.setNotice(res);
      });
    Pservice.homeCouponNotice({})
      .then((res) => {
        console.log(res);
        let data = res.data;
        this.setData({
          homeCouponNotice: data,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  },

  getEventData(e) {
    const data = e.detail.activityData;
    const { activityId } = data;
    const orderDetail = this.data.homeOrder;
    if (!activityId) {
      this.showLoading('创建活动');
      return Pservice.cashBackCreate({
        orderNumber: orderDetail.orderNumber,
      })
        .then((res) => {
          const activity = res.data || {};
          this.hideLoading();
          BusRouter.navigateTo(
            'sharePage',
            { activityId: activity.activityId },
            2
          );
        })
        .catch((err) => {
          this.hideLoading();
          console.log(err, 'err');
        });
    }

    BusRouter.navigateTo('sharePage', { activityId }, 2);
  },
  updateHomeOrder() {
    return Pservice.getHomeOrder({
      debug: 0,
    })
      .then((res) => {
        return res.homeOrder;
      })
      .catch((err) => {
        return {};
      })
      .then((res) => {
        this.updateHomeCard(res);
      });
  },

  updateHomeConfig() {
    let keyOfHomeMarketing =
      __global.appId === 'wx0e6ed4f51db9d078'
        ? 'ctrip_xcx_home_marketing'
        : __global.appId === '2017081708237081'
        ? 'ctrip_ali_xcx_home_marketing'
        : 'ctrip_bus_xcx_home_marketing';
    return Pservice.getConfigInfo({
      keyName: 'test',
      keyList: [
        'newWeChatEntrance',
        'homeBannerConfigList',
        'ctrip_xcx_message_push_config',
        keyOfHomeMarketing,
      ],
    })
      .then((res) => {
        let result = res.result || {};

        let newWeChatEntranceString = result['newWeChatEntrance'] || '[]';
        let homeBannerConfigCtring = result['homeBannerConfigList'] || '[]';
        let homePushTemplateIdsString =
          result['ctrip_xcx_message_push_config'] || '[]';
        let bannerConfigListString = result[keyOfHomeMarketing] || '[]';

        let homeBannerConfigList = [];
        let newWeChatEntrance = [];
        let homePushTemplateIds = [];
        let bannerConfigList = [];

        newWeChatEntrance = JSON.parse(newWeChatEntranceString);
        homeBannerConfigList = JSON.parse(homeBannerConfigCtring);
        homePushTemplateIds = JSON.parse(homePushTemplateIdsString);
        bannerConfigList = JSON.parse(bannerConfigListString);

        return {
          otherEnterance: newWeChatEntrance,
          homePushTemplateIds,
          homeBannerConfigList,
          bannerConfigList,
        };
      })
      .catch((err) => {
        return {};
      });
  },
  getEasyStatusText(status) {
    let text = '免费领';
    switch (status) {
      case 0:
        text = '免费领';
        break;
      case 1:
        text = '去邀请';
        break;
      case 2:
        text = '去查看';
        break;
      case 3:
        text = '去查看';
        break;
      default:
        text = '免费领';
        break;
    }
    return text;
  },
  updateHomeCard(order) {
    clearTimeout(orderCountDownTimer);
    var orderCountDown = (timestamp) => {
      clearTimeout(orderCountDownTimer);
      if (timestamp > 0) {
        var countDownTime = cDate.formatCountDown(timestamp);
        this.setData({
          homeOrder: {
            ...this.data.homeOrder,
            countDown: countDownTime,
          },
        });
        orderCountDownTimer = setTimeout(() => {
          orderCountDown(timestamp - 1000);
        }, 1000);
      } else {
        this.setData({
          homeOrder: { ...this.data.homeOrder, countDown: '' },
        });
        this.updateHomeOrder();
      }
    };
    if (order.orderNumber) {
      var fromTime = order.departTime;
      var formatDate = fromTime.replace(/\-/g, '/');
      var date = new Date(formatDate);
      var dateString =
        date.format('MM月dd日') +
        ' ' +
        this._DAY1[date.getDay()] +
        ' ' +
        date.format('hh:mm') +
        ' ' +
        '出发';
      order.fromDateString = dateString;
      var lastPayTime = parseInt(order.lastPayDateTime || '0');
      if (lastPayTime > 0) {
        orderCountDown(lastPayTime * 1000);
      } else {
        order.countDown = '';
      }
    }
    if (order.easyRefund) {
      order.easyRefund.buttonTitle = this.getEasyStatusText(
        order.easyRefund.status
      );
      order.easyRefund.activityBannerDesc = Utils.formatHighLight(
        order.easyRefund.bannerDesc
      );
      this.onUbtTrace(
        'exposure',
        'home_tripCard_axtBanner_show',
        '首页-待出行卡片安心退banner曝光',
        ''
      );
    }
    if (
      order.easyRefund &&
      order.easyRefund.leftTime &&
      order.easyRefund.status === 1
    ) {
      this.renderInterval(order.easyRefund.leftTime);
    }
    this.setData(
      {
        homeOrder: {
          ...order,
        },
      },
      () => {}
    );
    this.exposureOnLoad();
  },

  loadMcoupon(options) {
    let params = {};
    try {
      params = JSON.parse(decodeURIComponent(options.sendCouponParam));
    } catch (err) {
      console.log(JSON.stringify(err));
    }
    params.openid = cwx.cwx_mkt.openid || '';

    Pservice.machineSendCoupon(params)
      .then((res) => {
        let data = res.data || {};
        let couponList = [];
        if (data.list && data.list.length > 0) {
          data.list.forEach((item) => {
            let couponItem = {
              couponPrice: item.couponMoney,
              title: item.couponName,
              couponDesc: item.subTitle,
              unit: item.unit,
              url: item.linkUrl,
            };
            couponList.push(couponItem);
          });
          this.setData({
            showCouponWindow: true,
            mCoupon: {
              rule: false,
              title: data.title,
              subTitle: data.subTitle,
              buttonText: data.buttonName || '查看所有红包',
              buttonUrl: data.buttonUrl,
              couponList,
            },
          });
        } else {
          throw {};
        }
      })
      .catch((err) => {
        cwx.showModal({
          title: '提示',
          content: err.result,
          showCancel: false,
        });
        console.log(JSON.stringify(err));
      });
  },

  homeOrderAction(e) {
    if (this.data.homeOrder.status === '待支付') {
      this.onUbtTrace('click', 'home_topay_button', '首页待支付-我的订单', '');
    } else {
      this.onUbtTrace(
        'click',
        'home_totravel_button',
        '首页待出行-我的订单',
        ''
      );
    }
    var data = e.currentTarget.dataset;
    if (data.type == 'pay') {
      var order = this.data.homeOrder;
      if (order.canPay) {
        this.showLoading('正在支付');
        Pservice.orderDetail({ orderNumber: order.orderNumber })
          .then((res) => {
            var orderDetail = res.return;
            return orderDetail;
          })
          .then((orderData) => {
            return orderUtils.pay(orderData);
          })
          .then((res) => {
            this.showToast('支付成功', () => {
              this.navigateTo({
                url:
                  '/pages/bus/orderdetail/orderdetail?oid=' +
                  order.orderNumber +
                  '&fromPage=booking',
              });
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
          });
      }
    } else {
      this.navigateTo({
        url: data.path,
      });
    }
  },

  clearDebugControl(e) {
    if (this.openDebugControlTimer) {
      clearTimeout(this.openDebugControlTimer);
    }
    this.openDebugControlTimer = setTimeout(() => {
      this.openDebugControl = 0;
    }, 5000);
  },
  onTapDebug(e) {
    console.log('e点击事件', e);

    this.openDebugControl += 1;
    if (this.openDebugControl > 10) {
      this.setData({
        isDebug: true,
      });
    }
    this.clearDebugControl();
  },
  onTapBanner(e) {
    console.log('e点击事件', e);
    let url = e.detail.landingURL;
    BusRouter.navigateTo(url, {}, 0);
  },
  onOtherEnterance(e) {
    var url = e.currentTarget.dataset.url;
    let index = e.currentTarget.dataset.index;
    let typeSndList = [
      {
        typeSnd: 'home_kingPointbusAirport_button',
        comment: '首页金刚位-机场专线',
      },
      {
        typeSnd: 'home_kingPointbusScenic_button',
        comment: '首页金刚位-旅游专线',
      },
      {
        typeSnd: 'home_kingShip_button',
        comment: '首页金刚位-船票',
      },
      {
        typeSnd: 'home_kingTrain_button',
        comment: '首页金刚位-火车票',
      },
    ];
    this.onUbtTrace(
      'click',
      typeSndList[index].typeSnd,
      typeSndList[index].comment,
      ''
    );
    if (url.indexOf('appid') !== -1) {
      let reg = new RegExp('appid' + '=([^&]*)(&|$)', 'i');
      let query = url.match(reg);
      let appId = unescape(query[1]);
      cwx.navigateToMiniProgram({
        appId,
        path: url,
        envVersion: 'release', //develop ,release , trial
        extraData: {
          auth: cwx.user.auth || '',
        },
      });
    } else if (
      url.indexOf('http') !== 0 &&
      __global.appId !== 'wx0e6ed4f51db9d078'
    ) {
      //非http链接独立版跳转到主小程序
      this.navigateToMainMini(url);
    } else {
      BusRouter.navigateTo(url, {}, 0);
    }
  },
  onGoEasyRefundActivity(e) {
    var data = e.currentTarget.dataset;
    this.onUbtTrace(
      'click',
      'home_tripCard_axtBanner_click',
      '首页-待出行卡片安心退banner点击',
      ''
    );
    this.navigateTo({
      url: data.path,
    });
  },
  changeTab(currentTab) {
    let o_search =
      cwx.getStorageSync(BUS_SEARCH_KEY + this.getKeySuffix(currentTab)) || {};
    let historyList =
      cwx.getStorageSync(
        BUS_HISTORY_LIST_KEY + this.getKeySuffix(currentTab)
      ) || [];
    var date = new Date();
    if (o_search.date) {
      var newDate = new Date(o_search.date);
      var current = date;
      if (newDate < current) {
        newDate = current;
        o_search.date = newDate.format('yyyy-MM-dd');
      }
      date = newDate;
    }
    this.setData({
      from: o_search.from || '',
      fromCity: o_search.fromCity || '',
      fromCityID: o_search.fromCityID || '',
      fromStation: o_search.fromStation || '',
      to: o_search.to || '',
      toCity: o_search.toCity || '',
      toCityID: o_search.toCityID || '',
      toStation: o_search.toStation || '',
      selectedTab: currentTab,
      date: date.format('yyyy-MM-dd'),
      showDate: date.format('MM月dd日'),
      daySymbol: date.getDaySymbol(),
      displayDate: this._DAY1[date.getDay()],
      historyList: historyList,
      loading: false,
    });
  },
  tapSwitchTab(e) {
    let typeSndList = [
      'home_bus_tab',
      'home_ship_tab',
      'home_pointbusScenic_tab',
      'home_pointbusAirport_tab',
    ];
    let { index } = e.currentTarget.dataset;
    let item = this.data.tabs[index];
    this.onUbtTrace('click', typeSndList[index], `首页tab-${item.name}`, '');
    if (item.action === 'switch') {
      if (parseInt(index) !== this.data.selectedTab) {
        this.changeTab(parseInt(index));
      }
    } else if (item.action === 'jump') {
      let url = item.url;
      let utmSource = Utils.getUtmSource();
      let { website } = this.data;
      BusRouter.navigateTo(
        url,
        {
          website,
          utmSource,
        },
        0
      );
    }
  },

  showNotes: function (e) {
    this.setData({
      isShowNotesDetail: true,
    });
  },

  hiddenNotice: function (e) {
    this.setData({
      isShowNotesDetail: false,
    });
  },

  setNotice: function (data) {
    var busNotice = data.title || data.content;
    //有通知则显示通知栏
    if (busNotice) {
      this.setData({
        notice: busNotice,
        busNotice: data,
      });
    }
  },
  exchange: function () {
    this.onUbtTrace(
      'click',
      'home_changeFromTo_button',
      '首页出发-到达城市对调',
      ''
    );
    if (this.data.isEx) return;
    var from = this.data.toCity,
      fromCity = this.data.toCity,
      fromStation = this.data.toStation,
      fromCityID = this.data.toCityID || '',
      fromCityType = this.data.toCityType || '';

    var to = this.data.fromCity,
      toCity = this.data.fromCity,
      toStation = this.data.fromStation,
      toCityID = this.data.fromCityID || '',
      toCityType = this.data.fromCityType || '';

    this.setData({
      isEx: true,
    });
    _.delay(
      function () {
        this.setData({
          from: from,
          fromCity: fromCity,
          fromStation: fromStation,
          fromCityID: fromCityID,
          fromCityType,
          to: to,
          toCity: toCity,
          toStation: toStation,
          toCityID: toCityID,
          toCityType,
          isEx: false,
        });
      }.bind(this),
      300
    );

    let busSearchKey =
      BUS_SEARCH_KEY + this.getKeySuffix(this.data.selectedTab);
    CityListDataUtils.saveSInfo({
      BUS_SEARCH_KEY: busSearchKey,
      from: from,
      fromCity: fromCity,
      fromStation: fromStation,
      fromCityID: fromCityID,
      fromCityType,
      to: to,
      toCity: toCity,
      toStation: toStation,
      toCityID: toCityID,
      toCityType,
    });
  },

  fromCityAction: function (e) {
    this.onUbtTrace('click', 'home_fromInput_button', '首页出发城市框', '');
    // show loading
    let busSearchKey =
      BUS_SEARCH_KEY + this.getKeySuffix(this.data.selectedTab);
    CityListDataUtils.showFromCityPage({
      page: this,
      params: {
        locateCity: this.data.locateCity || '',
        currentCity: this.data.fromCity || '',
        BUS_SEARCH_KEY: busSearchKey,
      },
      callback: (data) => {
        if (data.fromCity) {
          this.onUbtTrace(
            'click',
            'fromsuggest_citySelectresult',
            '出发城市选择页结果选择城市',
            data.fromCity
          );
        }
        if (data.fromStation) {
          this.onUbtTrace(
            'click',
            'fromsuggest_stationSelectresult',
            '出发城市选择页结果选择站点',
            data.fromStation
          );
        }
        this.setData(data);
      },
    });
  },
  toCityAction: function (e) {
    this.onUbtTrace('click', 'home_toInput_button', '首页到达城市框', '');
    // show loading
    if (!this.data.fromCity) {
      this.showToast({ message: '请先选择出发城市', icon: 'none' });
      return;
    }

    let busSearchKey =
      BUS_SEARCH_KEY + this.getKeySuffix(this.data.selectedTab);
    CityListDataUtils.showToCityPage({
      page: this,
      params: {
        fromCity: this.data.fromCity || '',
        fromStation: this.data.fromStation || '',
        currentCity: this.data.toCity || '',
        BUS_SEARCH_KEY: busSearchKey,
      },
      callback: (data) => {
        if (data.toCity) {
          this.onUbtTrace(
            'click',
            'tosuggest_citySelectresult',
            '到达城市选择页结果选择城市',
            data.toCity
          );
        }
        if (data.toStation) {
          this.onUbtTrace(
            'click',
            'tosuggest_stationSelectresult',
            '到达城市选择页结果选择站点',
            data.toStation
          );
        }
        this.setData(data);
      },
    });
  },

  toShip: function (e) {
    BusRouter.navigateTo('ship', { utmSource: 'ctripbus_home_direct' });
  },

  toOrderList: function (e) {
    this.onUbtTrace(
      'click',
      'home_bottomMyorder_button',
      '首页底部tab-我的订单',
      ''
    );
    BusRouter.checkLogin(2).then(({ isLogin }) => {
      if (isLogin) {
        var order = BusRouter.map('order', {
          data: {
            id: 'bus',
            biz: 'QiChe',
            name: '汽车票',
          },
          hideFilter: 'yes',
        });
        cwx.navigateTo({
          url: order,
        });
      }
    });
  },
  toMyWallet: function (e) {
    BusRouter.checkLogin(2).then(({ isLogin }) => {
      this.setData({
        isLogin: isLogin,
      });
      if (isLogin) {
        BusRouter.navigateTo('wallet', {}, 1);
      }
    });
  },

  dateAction: function (e) {
    this.onUbtTrace('click', 'home_fromDate_button', '首页出行日期框', '');
    var self = this;
    if (this.ubtTrace) {
      this.ubtTrace(100872, {});
    }

    var choosenDate = new Date(this.data.date.replace(/\-/g, '/')).format(
      'yyyy-M-d'
    );

    var callBack = () => {};
    cwx.component.calendar({
      data: {
        choosenDate: choosenDate,
        beginDate: new Date().format('yyyy-M-d'),
        endDate: new Date().addDays(60).format('yyyy-M-d'),
        title: '选择出发日期',
        info: {},
      },
      immediateCallback: (date) => {
        var _date = new Date(date.replace(/\-/g, '/'));

        let busSearchKey =
          BUS_SEARCH_KEY + this.getKeySuffix(this.data.selectedTab);
        var json = {
          date: _date.format('yyyy-MM-dd'),
          showDate: _date.format('MM月dd日'),
          displayDate: this._DAY1[_date.getDay()],
          daySymbol: _date.getDaySymbol(),
          BUS_SEARCH_KEY: busSearchKey,
          from: this.data.fromCity,
          to: this.data.toCity,
          fromCity: this.data.fromCity,
          toCity: this.data.toCity,
          // fromCityID: data.fromCityID || '',
          productName: this.data.productName || null,
        };

        this.setData(json);
        CityListDataUtils.saveSInfo(json);
      },
      navComplete: function () {},
    });
  },

  inLoading: false,

  onSearch: function (e) {
    // cwx.mkt.addCard(['150906992', '485278215'], 'STRATEGY', (data) => {
    //     console.log('data--',data);
    // }, (err) => {
    //     console.log(err);
    // });
    // return;
    //  BusRouter.navigateTo('sendCoupon',{
    // })
    // return;
    // BusRouter.navigateTo('router',{
    //   q:"https%3a%2f%2fm.ctrip.com%2fwebapp%2fbus%2fappbus%2fmpay%3fid%3d1084",
    //   isDebug:true
    // })

    // let data = {
    //     url: encodeURIComponent('https://m.ctrip.com/webapp/shipcm/couponact/list?orderNumber=DHQSPB100001&isHideNavBar=YES'),
    //     needLogin: false,
    //     isNavigate: true,
    //     noForceLogin: true,
    // };

    // wx.navigateTo({
    //     url: `/cwx/component/cwebview/cwebview?data=${JSON.stringify(data)}`,
    // });

    // return;
    const {
      selectedTab,
      tabs,
      fromCity,
      toCity,
      productName,
      bizType,
      bigChannel,
    } = this.data;
    let typeSndobj = {
      bus: {
        typeSnd: 'home_busSearch_icon',
        comment: '首页汽车查询按钮',
      },
      ship: {
        typeSnd: 'home_shipSearch_icon',
        comment: '首页船票查询按钮',
      },
    };
    let tab = tabs[selectedTab].key ? tabs[selectedTab].key : 'bus';
    this.onUbtTrace(
      'click',
      typeSndobj[tab].typeSnd,
      typeSndobj[tab].comment,
      ''
    );
    if (tabs[selectedTab].key === 'ship') {
      if (!this.data.fromCity) {
        this.showMsg('出发港口不能为空');
        return;
      }
      if (!this.data.toCity) {
        this.showMsg('到达港口不能为空');
        return;
      }
      let BUS_HISTORY_KEY =
        BUS_HISTORY_LIST_KEY + this.getKeySuffix(this.data.selectedTab);
      CityListDataUtils.saveHistoryList(
        {
          fromCity: fromCity,
          fromCityID: '',
          toCity: toCity,
          toCityID: '',
          BUS_HISTORY_LIST_KEY: BUS_HISTORY_KEY,
          productName: productName || null,
        },
        (historyList) => {
          this.setData({
            historyList: historyList,
          });
        }
      );
      const allianceid = this.unionData.allianceid || '';
      const sid = this.unionData.sid || '';
      let url = `https://m.ctrip.com/webapp/ship/index.html#/pages/newship/list/index?shiptype=new&fromCity=${fromCity}&toCity=${toCity}&depDate=${this.data.date}&utmSource=${this.data.utmSource}&productName=${productName}&allianceid=${allianceid}&sid=${sid}`;
      BusRouter.navigateTo(url, {}, 0);
      return;
    }
    if (this.inLoading) {
      return;
    }

    if (!this.data.fromCity) {
      this.showMsg('出发城市不能为空');
      return;
    }
    if (!this.data.toCity) {
      this.showMsg('到达城市不能为空');
      return;
    }
    if (this.ubtTrace) {
      this.ubtTrace(100873, this.data);
    }
    this.inLoading = true;
    var _date = new Date(this.data.date.replace(/\-/g, '/'));
    var date = _date.format('yyyy-MM-dd-hh-mm');
    var param = {
      fromCity: this.data.fromCity,
      fromCityID: this.data.fromCityID,
      fromStation: this.data.fromStation,
      toCity: this.data.toCity,
      toCityID: this.data.toCityID,
      toStation: this.data.toStation,
      date: date,
      utmsource: this.data.utmSource,
      didTip: this.data.didTip,
      bizType,
      bigChannel,
    };

    Pservice.getBusListType(param)
      .then((res) => {
        if (res.return.busListType == 1 && res.return.url) {
          BusRouter.navigateTo(res.return.url, {}, 0);
        } else {
          this.searchLine(param);
        }
        this.inLoading = false;
      })
      .catch((err) => {
        this.searchLine(param);
        this.inLoading = false;
      });
  },

  searchLine(param) {
    var data = param;
    let mixType =
      data.fromCityType == 'pointbus' || data.toCityType == 'pointbus' ? 3 : 1;
    data.busMixType = mixType;

    data.offlineOldUser = this.data.offlineOldUser;

    BusRouter.navigateTo('newlist', data);

    let BUS_HISTORY_KEY =
      BUS_HISTORY_LIST_KEY + this.getKeySuffix(this.data.selectedTab);
    CityListDataUtils.saveHistoryList(
      {
        fromCity: data.fromCity,
        fromCityID: data.fromCityID || '',
        toCity: data.toCity,
        toCityID: data.toCityID || '',
        BUS_HISTORY_LIST_KEY: BUS_HISTORY_KEY,
      },
      (historyList) => {
        this.setData({
          historyList: historyList,
        });
      }
    );
  },

  onHistory(e) {
    this.onUbtTrace(
      'click',
      'home_historySearch_icon',
      '首页查询按钮下的历史搜索',
      ''
    );
    var data = e.currentTarget.dataset.data;
    if (this.ubtTrace) {
      this.ubtTrace(100875, data);
    }
    let busSearchKey =
      BUS_SEARCH_KEY + this.getKeySuffix(this.data.selectedTab);
    var json = {
      from: data.fromCity,
      to: data.toCity,
      fromCity: data.fromCity,
      fromCityID: data.fromCityID || '',
      toCity: data.toCity,
      toCityID: data.toCityID || '',
      fromStation: '',
      toStation: '',
      BUS_SEARCH_KEY: busSearchKey,
      productName: data.productName || null,
    };
    this.setData(json, () => {
      this.onSearch();
    });
    CityListDataUtils.saveSInfo(json);
  },

  hiddenCouponWindow(e) {
    this.AfterShowCouponWindow();
  },

  AfterShowCouponWindow() {
    this.setData({
      showCouponWindow: false,
    });
  },

  onUseCoupon(e) {
    if (e.currentTarget.dataset.link) {
      let link = e.currentTarget.dataset.link;
      BusRouter.navigateTo(link, {}, 2);
    }
    this.AfterShowCouponWindow();
  },
  toCouponList() {
    this.onUbtTrace(
      'click',
      'home_bottomMycoupon_button',
      '首页底部tab-我的优惠券',
      ''
    );
    BusRouter.navigateTo('/pages/market/promocode/index/index?dded=222', {}, 2);
  },

  // 独立版小程序

  getHomeCoupon() {
    let wxMpSubscribe = (this.options && this.options.wxMpSubscribe) || 0;

    if (parseInt(wxMpSubscribe) !== 1) {
      return;
    }
    const { utmSource } = this.data;

    Pservice.getCouponList({
      type: 0,
      utmSource: utmSource,
    })
      .then((res) => {
        console.log('res---', res);

        let { data } = res;
        if (data.couponList.length > 0) {
          this.setData({
            showCouponWindow: true,
            mCoupon: {
              rule: false,
              title: data.title,
              subTitle: data.subTitle,
              buttonText: '查看优惠券列表',
              buttonUrl: '/pages/market/promocode/index/index?dded=222',
              couponList: data.couponList,
            },
          });
          this.onUbtTrace(
            'exposure',
            'home_officialAccountsCouponPop_show',
            '首页-公众号召回优惠券弹窗曝光',
            ''
          );
        } else {
          throw res;
        }
      })
      .catch((err) => {
        console.log('res---', err);
        if (err && err.code == '2' && err.message) {
          this.showToast({
            message: err.message,
            icon: 'none',
          });
        }
      });
  },
  // 船票的业务
  getShipHomeInfo() {
    this.getShipRecommend();
    this.getShipNoticeAndCouponData();
  },

  async getShipNoticeAndCouponData() {
    let notice = [];
    const systemInfo = wx.getSystemInfoSync();
    const basicParams = {
      app: BusConfig.app,
      bigChannel: 'ship',
      smallChannel: BusConfig.smallchannel,
      operatSystem: systemInfo.platform + BusConfig.suffix,
      bigClientType: BusConfig.big_client_type,
      clientVersion: BusConfig.client_version || systemInfo.version,
    };
    Pservice.getShipCouponData({
      baseCommonTypes: Utils.getBaseCommonTypes(),
      basicParams: basicParams,
    })
      .then((res) => {
        if (res && res.code === 1 && res.data) {
          const { couponNotice } = res.data;
          if (couponNotice) {
            notice.push({
              content: couponNotice,
              icon: 'https://pages.c-ctrip.com/bus-images/ship/home2/ship_coupon.png',
              title: '',
              type: 'coupon',
            });
          }
          this.setData({
            shipNoticeData: notice,
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
    Pservice.getShipNotice({ location: 1, basicParams: basicParams })
      .then((res) => {
        if (res && res.code === 1 && res.data) {
          const { content, title } = res.data;
          notice.push({
            content: content,
            icon: 'https://pages.c-ctrip.com/bus-images/ship/home2/ship_notice.png',
            title: title,
            type: 'notice',
          });
          this.setData({
            shipNoticeContent: content,
            shipNoticeTitle: title,
            shipNoticeData: notice,
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  },

  getShipRecommend() {
    return Pservice.getShipRecommend({
      baseCommonTypes: Utils.getBaseCommonTypes(),
    })
      .then((res) => {
        let shipData = {};
        let tabs = [];
        if (res && res.code === 1 && res.data) {
          const { data } = res;
          const hasHotBoatLine =
            data.hotBoatLine &&
            data.hotBoatLine.cityList &&
            data.hotBoatLine.cityList.length > 0 &&
            data.hotBoatLine.boatList &&
            data.hotBoatLine.boatList.length > 0;
          const hasCheaperLine =
            (data.cheaperLine &&
              data.cheaperLine.topLine &&
              data.cheaperLine.topLine.length > 0) ||
            (data.cheaperLine.bottomLine &&
              data.cheaperLine.bottomLine.length > 0);
          const hasIslandLine = data.islandLine && data.islandLine.length > 0;
          if (hasHotBoatLine) {
            shipData.hotBoatLine = data.hotBoatLine;
            tabs.push({
              name: '热门游船',
              icon: 'https://pages.c-ctrip.com/bus-images/ship/miniprograms/home/hotboat_icon.png',
              type: 'hot',
            });
          }

          if (hasCheaperLine) {
            shipData.topLine = data.cheaperLine.topLine;
            shipData.bottomLine = data.cheaperLine.bottomLine;
            tabs.push({
              name: '特惠船票',
              icon: 'https://pages.c-ctrip.com/bus-images/ship/miniprograms/home/cheapticket_icon.png',
              type: 'cheaper',
            });
          }
          if (hasIslandLine) {
            shipData.islandLine = data.islandLine;
            tabs.push({
              name: '海岛推荐',
              icon: 'https://pages.c-ctrip.com/bus-images/ship/miniprograms/home/island_icon.png',
              type: 'island',
            });
          }
          this.setData({
            shipRecommendData: shipData,
            shipTabs: tabs,
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  },
  getBookModalEvent(e) {
    this.setData({
      showShipBookModal: true,
      moreShipLineData: e.detail.moreLine,
    });
  },
  onCancelModal() {
    this.setData({
      showShipBookModal: false,
    });
  },
  onShipNoticeClick(e) {
    const { item } = e.currentTarget.dataset;
    if (item.type === 'coupon') {
      this.toShipCouponList();
    } else {
      this.setData({
        showShipNoticeModal: true,
      });
    }
  },
  onCloseShipNoticeModal() {
    this.setData({
      showShipNoticeModal: false,
    });
  },
  toShipOrderList() {
    BusRouter.checkLogin(2).then(({ isLogin }) => {
      if (isLogin) {
        var order = BusRouter.map('order', {
          data: {
            id: 'ship',
            biz: 'Ship',
            name: '船票',
          },
          hideFilter: 'yes',
        });
        cwx.navigateTo({
          url: order,
        });
      }
    });
  },
  toShipCouponactList() {
    let url = 'https://m.ctrip.com/webapp/shipcm/couponact/order';
    BusRouter.navigateTo(url, {}, true);
  },
  toShipCouponList() {
    let url =
      'https://m.ctrip.com/webapp/newship/index.html#/pages/newship/coupon/index';
    BusRouter.navigateTo(url, {}, true);
  },
  toShipCityList() {
    const { date, utmSource } = this.data;
    const allianceid = this.unionData.allianceid || '';
    const sid = this.unionData.sid || '';
    let url = `https://m.ctrip.com/webapp/ship/index.html#/pages/newship/citylist/index?index=3&comeFrom=index&depDate=${date}&utmSource=${utmSource}&allianceid=${allianceid}&sid=${sid}`;
    BusRouter.navigateTo(url, {}, 0);
  },
  toServicechat() {
    let url =
      'https://m.ctrip.com/webapp/servicechatv2/?bizType=1351&pageCode=600003988&channel=CBEFORESHIP&isPreSale=1&isHideNavBar=YES';
    BusRouter.navigateTo(url, {}, true);
  },
  fromShipCityAction() {
    const allianceid = this.unionData.allianceid || '';
    const sid = this.unionData.sid || '';
    const { date, utmSource } = this.data;
    let url = `https://m.ctrip.com/webapp/ship/index.html#/pages/newship/citylist/index?__navigator=0&depDate=${date}&comeFrom=index&utmSource=${utmSource}&allianceid=${allianceid}&sid=${sid}`;

    var path = `/cwx/component/cwebview/cwebview?data={"url":"${encodeURIComponent(
      url
    )}","needLogin":${false},"isNavigate":true, "observerKey":"__bus_ship_cwebmesssage__"}`;
    cwx.navigateTo({
      url: path,
    });
  },
  toShipCityAction() {
    const allianceid = this.unionData.allianceid || '';
    const sid = this.unionData.sid || '';
    const { date, fromCity, utmSource } = this.data;
    let url = `https://m.ctrip.com/webapp/ship/index.html#/pages/newship/citylist/index?__navigator=0&depDate=${date}&fromCity=${fromCity}&comeFrom=index&utmSource=${utmSource}&allianceid=${allianceid}&sid=${sid}`;
    var path = `/cwx/component/cwebview/cwebview?data={"url":"${encodeURIComponent(
      url
    )}","needLogin":${false},"isNavigate":true, "observerKey":"__bus_ship_cwebmesssage__"}`;
    cwx.navigateTo({
      url: path,
    });
  },

  onClickBanner(e) {
    let traceData = [
      {
        typeSnd: 'home_marketFirst_banner',
        comment: '首页固定营销入口banner',
      },
      {
        typeSnd: 'home_marketSecond_banner',
        comment: '首页0元坐汽车',
      },
      {
        typeSnd: 'home_travelReminder_banner',
        comment: '首页出行提醒',
      },
    ];
    let index = e.currentTarget.dataset.index;
    this.onUbtTrace(
      'click',
      traceData[index].typeSnd,
      traceData[index].comment,
      ''
    );
    let data = this.data.bannerConfigList[index];
    if (data.url) {
      let link = data.url;
      BusRouter.navigateTo(link, {}, 0);
    }
    if (data.templateIds) {
      let templateIds = data.templateIds;
      if (templateIds.length > 0) {
        BusPage.saveTemplateMessage(templateIds);
      }
    }
  },
  onClickToCloseGuidetoAdd() {
    this.delayCloseGuidetoAddModal(false);
    cwx.setStorageSync('closeGuideToAdd', true);
  },
  delayCloseGuidetoAddModal(isDelay) {
    if (isDelay) {
      setTimeout(() => {
        this.setData({
          isShowGuidetoAdd: false,
        });
      }, 5000);
    } else {
      this.setData({
        isShowGuidetoAdd: false,
      });
    }
  },
  showGuidetoAddModalInDay(day) {
    let nowTime = new Date();
    let firstOpenTimeForCollect = cwx.getStorageSync('firstOpenTimeForCollect');
    if (firstOpenTimeForCollect) {
      let lastDay = firstOpenTimeForCollect.getDate();
      let nowDay = nowTime.getDate();
      if (nowDay - lastDay < day) {
        this.delayCloseGuidetoAddModal(false);
      } else {
        cwx.setStorageSync('firstOpenTimeForCollect', nowTime);
        this.delayCloseGuidetoAddModal(true);
      }
    } else {
      cwx.setStorageSync('firstOpenTimeForCollect', nowTime);
      this.delayCloseGuidetoAddModal(true);
    }
  },
  isFirstOpen() {
    let closeGuideToAdd = cwx.getStorageSync('closeGuideToAdd');
    // 如果用户点击了 关闭 按钮
    if (closeGuideToAdd) {
      // 30天内仅展现1次，5秒后自动消失
      this.showGuidetoAddModalInDay(30);
    } else {
      // 1天仅展现1次，5秒后自动消失
      this.showGuidetoAddModalInDay(1);
    }
  },

  toIntegrationModule() {
    this.onUbtTrace(
      'click',
      'home_bottomMyintegral_button',
      '首页底部tab-我的积分',
      ''
    );
    BusRouter.navigateTo('/pages/market/signIn/index?innersid=882', {}, 2);
    if (this.data.isOpenTagForJifen) {
      let nowTime = new Date();
      cwx.setStorageSync('clickTagForJifenTime', nowTime);
      setTimeout(() => {
        this.setData({
          isOpenTagForJifen: false,
        });
      }, 6000);
    }
  },
  onShowTagForJifen() {
    let clickTagForJifenTime = cwx.getStorageSync('clickTagForJifenTime');
    let nowTime = new Date();
    if (clickTagForJifenTime) {
      let day = 1000 * 60 * 60 * 24;
      let diff = Math.floor(
        (nowTime.getTime() - clickTagForJifenTime.getTime()) / day
      );
      if (diff < 7) {
        this.setData({
          isOpenTagForJifen: false,
        });
      } else {
        this.setData({
          isOpenTagForJifen: true,
        });
        cwx.setStorageSync('clickTagForJifenTime', '');
      }
    }
  },
  onShowGuide() {
    if (this.data.appName === '汽车票大管家') {
      this.setData({
        impId: '05QCNVOG0549YSMBZNYHACGY',
      });
    }
  },
  getBusNoticeData() {
    Pservice.getShipNotice({ location: 1 })
      .then((res) => {
        if (res && res.code === 1 && res.data) {
          const { content, title } = res.data;
          this.setData({
            busNoticeData: {
              noticeContentWidth: 560,
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
  exposureOnLoad() {
    console.log('待出行卡片曝光');
    if (this.data.homeOrder.orderNumber) {
      if (this.data.homeOrder.status === '待支付') {
        this.onUbtTrace(
          'exposure',
          'home_topay_button',
          '首页待支付-我的订单',
          ''
        );
      } else {
        this.onUbtTrace(
          'exposure',
          'home_totravel_button',
          '首页待出行-我的订单',
          ''
        );
      }
    }
  },
  onUbtTrace(type, typeSnd, comment, content) {
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
      type: BusConfig.traceType || 'ctripwxxcx',
      typeSnd,
      comment,
    };
    let utmSource = this.data.utmSource || '';
    if (comment.indexOf('新人') >= 0) {
      utmSource = 'wxxcx_xrhd';
      info['isNew'] = this.data.offlineOldUser ? '0' : '1';
    }
    info['utmSource'] = utmSource;
    if (content) {
      info['content'] = content;
    }
    this.ubtTrace(key, info);
  },
  getShowEntryForLottery(e) {
    console.log('index e', JSON.stringify(e));
    const data = e.detail;
    let { type, showEntry, isHide } = data;
    if (this.data.isLogin) {
      if (type === 'click') {
        this.onUbtTrace(
          'click',
          'home_theFreshLottry_banner',
          '首页新人抽奖banner',
          ''
        );
      } else if (type === 'exposure') {
        if (showEntry) {
          this.onUbtTrace(
            'exposure',
            'home_theFreshLottry_banner',
            '首页新人抽奖banner',
            ''
          );
        } else if (!showEntry && isHide) {
          // 倒计时曝光
          this.onUbtTrace(
            'exposure',
            'home__thefresh_lottery_countdown_banner',
            '首页新人抽奖banner倒计时',
            ''
          );
        }
      }
    }
  },
  showPolicy(e) {
    let type = e.currentTarget.dataset.type;

    if (type === 'accountsAgreement') {
      Utils.sendClickTrace('home_buttom_serviceAgreement_click', {
        comment: '首页-底部服务协议点击',
      });
    } else {
      Utils.sendClickTrace('home_buttom_personalnfoPolicy_click', {
        comment: '首页-个人信息保护政策点击',
      });
    }

    let agreementConfig = require('../../../agreementConfig');
    const path = agreementConfig.getAgreementPath(type);
    BusRouter.navigateTo(path);
  },
  onDeleteHistory() {
    let key = BUS_HISTORY_LIST_KEY + this.getKeySuffix(this.data.selectedTab);
    cwx.setStorage({
      key,
      data: [],
    });
    this.setData({
      historyList: [],
    });
  },

  getNewGuestActivity(type) {
    return Pservice.getNewGuestActivity({
      type, // 1:首页弹窗 2:首页banner 3:填写页
    })
      .then((res) => {
        if (res.code === 1) {
          if (type === 1) {
            let data = res.data.giftPackageData || [];
            let couponList = [];
            let buttonText = '去购票';
            if (!this.data.isLogin) {
              buttonText = '登录领取新人礼';
              this.onUbtTrace(
                'exposure',
                'home_notLogin_newerPop_show',
                '首页-新人弹窗未登录曝光',
                ''
              );
            } else {
              this.onUbtTrace(
                'exposure',
                'home_login_newerPop_show',
                '首页-新人弹窗已登录曝光',
                ''
              );
            }
            let firstShowTime = cwx.getStorageSync('showNewGuestCouponTime');
            if (!firstShowTime) {
              // 7 天内弹 1 次, 所以需要记录时间
              cwx.setStorageSync('showNewGuestCouponTime', new Date());
            }
            data.forEach((item) => {
              let couponItem = {
                couponPrice: item.price,
                title: item.name,
                couponDesc: item.desc,
                unit: item.unit,
                state: item.state,
              };
              couponList.push(couponItem);
            });
            this.setData({
              isNewUser: !!res.data.newUser,
              isShowNewUserCoupon: true,
              newUserCoupon: {
                rule: true,
                title: 'Hi~新乘客，首次购票免费享',
                couponList,
                buttonText,
              },
            });
          } else if (type === 2) {
            this.onUbtTrace(
              'exposure',
              'home_newerBanner_show',
              '首页-新人活动banner曝光',
              ''
            );
            let data = res.data.bannerDesc || [];
            this.setData({
              isShowBgColor: true,
              isShowNewUseBanner: true,
              newUseBannerDesc: data,
            });
          }
        }
        return res;
      })
      .catch((err) => {
        if (type === 2) {
          this.setData({
            isShowNewUseBanner: false,
            newUseBannerDesc: [],
          });
        }
        return err;
      });
  },

  getCouponExpireNotice() {
    Pservice.getCouponExpireNotice()
      .then((res) => {
        this.onUbtTrace(
          'exposure',
          'home_couponOverdue_banner_show',
          '首页-优惠券即将过期banner曝光',
          ''
        );
        let data = res.data;
        this.setData({
          isShowExpireCoupon: true,
          expireCouponDate: data,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  },

  onNewUserCoupon() {
    if (!this.data.isLogin) {
      this.onUbtTrace(
        'click',
        'home_notlogin_newerPop_click',
        '首页-新人弹窗未登录-登录领取新人礼点击',
        ''
      );
      BusRouter.checkLogin(2).then(({ isLogin }) => {
        this.setData({
          isLogin: isLogin,
        });
        if (isLogin) {
          this.getNewGuestActivity(1).then((res) => {
            if (res.data.newUser) {
              this.showToast({
                message: '您已成功激活新人礼包，开始购票吧',
                icon: 'none',
              });
            } else {
              this.showToast({
                message: '抱歉您不是汽车票新用户，暂无法领取',
                icon: 'none',
              });
              this.getNewGuestActivity(2);
            }
          });
        }
      });
    } else {
      this.onUbtTrace(
        'click',
        'home_login_newerPop_click',
        '首页-新人弹窗已登录-去购票点击',
        ''
      );
    }
    this.closeNewUserCoupon();
  },

  closeNewUserCoupon() {
    this.setData({
      isShowNewUserCoupon: false,
    });
  },

  showNewUserCoupon() {
    this.getNewGuestActivity(1);
  },

  showNewPolicy(e) {
    BusRouter.navigateTo('web', {
      url: encodeURIComponent(
        'https://pages.c-ctrip.com/bus-resource/bus_insurance/%E5%B0%8F%E7%A8%8B%E5%BA%8F%E6%96%B0%E4%BA%BA%E6%B4%BB%E5%8A%A8%E8%A7%84%E5%88%99.html'
      ),
      title: '规则',
      naviColor: this.data.colorConfig.headerBgColor || '',
    });
  },

  showOldPolicy(e) {
    BusRouter.navigateTo('web', {
      url: encodeURIComponent(
        'https://pages.c-ctrip.com/bus-resource/bus_insurance/%E7%BA%BF%E4%B8%8B%E8%BD%AC%E7%BA%BF%E4%B8%8A%E8%80%81%E5%AE%A2%E6%B4%BB%E5%8A%A8%E8%A7%84%E5%88%99.html'
      ),
      title: '规则',
      naviColor: this.data.colorConfig.headerBgColor || '',
    });
  },

  onGetNewGuestActivity() {
    BusRouter.isLogin(false).then(({ isLogin }) => {
      this.setData({
        isLogin,
      });
      // 7 天后能调用接口
      let firstShowTime = cwx.getStorageSync('showNewGuestCouponTime');
      if (firstShowTime) {
        let lastTime = firstShowTime.getTime();
        let nowTime = new Date().getTime();
        let validTime = 7 * 24 * 60 * 60 * 1000;
        if (lastTime - nowTime >= validTime) {
          cwx.setStorageSync('showNewGuestCouponTime', '');
          this.getNewGuestActivity(1);
        }
      } else {
        this.getNewGuestActivity(1);
      }
    });
    this.getNewGuestActivity(2);
  },

  onGetOldGuestActivity() {
    BusRouter.isLogin(false).then(({ isLogin }) => {
      this.setData({
        isLogin,
      });
      // 7 天后能调用接口
      let firstShowTime = cwx.getStorageSync('showOldGuestCouponTime');
      if (firstShowTime) {
        let lastTime = firstShowTime.getTime();
        let nowTime = new Date().getTime();
        let validTime = 7 * 24 * 60 * 60 * 1000;
        if (lastTime - nowTime >= validTime) {
          cwx.setStorageSync('showOldGuestCouponTime', '');
          this.getOldGuestActivity(1);
        }
      } else {
        this.getOldGuestActivity(1);
      }
    });
    this.getOldGuestActivity(2);
  },

  getGuestActivity() {
    if (this.data.offlineOldUser) {
      this.onGetOldGuestActivity();
    } else {
      this.onGetNewGuestActivity();
    }
  },

  getOldGuestActivity(type) {
    return Pservice.getOldGuestActivity({
      type, // 1:首页弹窗 2:首页banner 3:填写页
    })
      .then((res) => {
        if (res.code === 1) {
          if (type === 1) {
            let data = res.data.giftPackageData || [];
            if (data.length > 0) {
              let couponList = [];
              let buttonText = '去购票';
              if (!this.data.isLogin) {
                buttonText = '登录领取';
                this.onUbtTrace(
                  'exposure',
                  'home_notLogin_newerPop_show',
                  '首页-新人弹窗未登录曝光',
                  ''
                );
              } else {
                this.onUbtTrace(
                  'exposure',
                  'home_login_newerPop_show',
                  '首页-新人弹窗已登录曝光',
                  ''
                );
              }
              let firstShowTime = cwx.getStorageSync('showOldGuestCouponTime');
              if (!firstShowTime) {
                // 7 天内弹 1 次, 所以需要记录时间
                cwx.setStorageSync('showOldGuestCouponTime', new Date());
              }
              data.forEach((item) => {
                let couponItem = {
                  couponPrice: item.price,
                  title: item.name,
                  couponDesc: item.desc,
                  unit: item.unit,
                  state: item.state,
                };
                couponList.push(couponItem);
              });
              this.setData({
                isShowOldUserCoupon: true,
                oldUserCoupon: {
                  rule: true,
                  title: '车站用户专享',
                  couponList,
                  buttonText,
                },
              });
            }
          } else if (type === 2) {
            this.onUbtTrace(
              'exposure',
              'home_newerBanner_show',
              '首页-新人活动banner曝光',
              ''
            );
            let data = res.data.bannerDesc || [];
            this.setData({
              isShowBgColor: true,
              isShowOldUseBanner: true,
              oldUseBannerDesc: data,
            });
          }
        }
        return res;
      })
      .catch((err) => {
        if (type === 2) {
          this.setData({
            isShowOldUseBanner: false,
            oldUseBannerDesc: [],
          });
        }
        return err;
      });
  },

  onOldUserCoupon() {
    if (!this.data.isLogin) {
      this.onUbtTrace(
        'click',
        'home_notlogin_newerPop_click',
        '首页-新人弹窗未登录-登录领取新人礼点击',
        ''
      );
      BusRouter.checkLogin(2).then(({ isLogin }) => {
        this.setData({
          isLogin: isLogin,
        });
        if (isLogin) {
          this.getOldGuestActivity(1).then((res) => {
            console.log('getOldGuestActivity res', res);
            if (res.data.toast) {
              this.showToast({
                message: res.data.toast,
                icon: 'none',
              });
            } else {
              this.getOldGuestActivity(2);
            }
          });
        }
      });
    } else {
      this.onUbtTrace(
        'click',
        'home_login_newerPop_click',
        '首页-新人弹窗已登录-去购票点击',
        ''
      );
    }
    this.closeOldUserCoupon();
  },

  closeOldUserCoupon() {
    this.setData({
      isShowOldUserCoupon: false,
    });
  },

  showOldUserCoupon() {
    this.getOldGuestActivity(1).then((res) => {
      if (res.data.toast) {
        this.showToast({ message: res.data.toast, icon: 'none' });
      }
    });
  },

  calculateTime(date) {
    const seconds = date; // 计算时间差,并把毫秒转换成秒
    // 取模（余数）
    const modulo = seconds % (60 * 60 * 24);
    // 小时数
    const h =
      Math.floor(modulo / 3600) < 10
        ? `0${Math.floor(modulo / 3600)}`
        : Math.floor(modulo / 3600);
    const m =
      Math.floor((seconds / 60) % 60) < 10
        ? `0${Math.floor((seconds / 60) % 60)}`
        : Math.floor((seconds / 60) % 60);
    const s =
      Math.floor(seconds % 60) < 10
        ? `0${Math.floor(seconds % 60)}`
        : Math.floor(seconds % 60);
    return { interval: { h, m, s }, seconds };
  },
  renderInterval(endTime) {
    let endDateTime = endTime;
    axtInterval && clearInterval(axtInterval);
    axtInterval = null;
    // 解决卡顿问题，页面appear时先执行一次
    const initTimeObj = this.calculateTime(endDateTime);
    if (initTimeObj.seconds < 1) {
      this.setData({
        axtCountDown: {},
      });
      this.updateHomeOrder();
    } else {
      this.setData({
        axtCountDown: initTimeObj.interval,
        seconds: initTimeObj.seconds,
      });
    }
    if (endDateTime) {
      axtInterval = setInterval(() => {
        endDateTime -= 1;
        const timeObj = this.calculateTime(endDateTime);
        // console.log('timeObj', timeObj)
        if (timeObj.seconds < 1) {
          this.setData({
            axtCountDown: {},
          });
          clearInterval(axtInterval);
          axtInterval = null;
          this.updateHomeOrder();
        }
        this.setData({
          axtCountDown: timeObj.interval,
          seconds: timeObj.seconds,
        });
      }, 1000);
    }
  },

  onLogout() {
    if (cwx.user.logout) {
      cwx.user.logout();
    } else {
      cwx.user.auth = '';
    }
    this.setData({
      isLogin: false,
    });
  },
});
