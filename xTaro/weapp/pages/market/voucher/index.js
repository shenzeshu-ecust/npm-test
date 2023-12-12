import { cwx, CPage, _ } from '../../../cwx/cwx.js';

var PAGE_SOURCE = 'VOUCHER_INDEX';
var ubtKeys = { //错误码回应的埋点key
  "0": 100727,
  "1001": 100770,
  "2001": 100771,
  "2002": 100772,
  "3000": 100773,
  "3002": 100774,
  "3004": 100775,
  "3005": 100776,
  "3013": 100777,
  "3114": 100778,
  "3119": 100779,
  "3120": 100780,
  "-100": 100743,
  "-200": 100744,
  "-300": 100745,
  "-400": 100746,
  "-500": 100747,
  "-600": 100749,
  "-700": 101219,
  "-1000": 100753
};

CPage({
  pageId: '10320656429',
  data: {
    status: 0, //0: 默认点击领券页  1：优惠券展示页 2：错误提示页
    tipsTitle: '',
    tipsMsg: '',
    fButtonText: '',
    fButtonAction: '',
    sButtonText: '',
    sButtonAction: '',
    couponList: []
  },
  onLoad(options) {
    this.ubtDevTrace('mkt_wechat_voucher', {
      action:'page onload',
      options: options,
      source: PAGE_SOURCE
    });
  },
  /**
   * 检测用户登录态
   */
  checkLogin() {
    var that = this;

    cwx.user.checkLoginStatusFromServer(function(checkLoginRes) {
      if (checkLoginRes) {
        that.ubtDevTrace('mkt_wechat_voucher', {
          action:'login status and sendCoupon',
          checkLoginRes: checkLoginRes,
          source: PAGE_SOURCE
        });
        that.sendCoupon();
      } else {
        that.ubtDevTrace('mkt_wechat_voucher', {
          action: 'handle login',
          checkLoginRes: checkLoginRes,
          source: PAGE_SOURCE
        });
        that.userLogin();
      }
    });
  },
  /**
   * 执行发券
   */
  sendCoupon() {
    var that = this,
      unionData = cwx.mkt.getUnion() || {},
      beforeRequestTime = '',
      params = {},
      ubtVal = '',
      resCode = '',
      resMsg = '',
      couponInfos = [];

    cwx.showToast({
      title: '优惠券领取中...',
      icon: 'loading',
      duration: 60000
    })

    params = {
      'PlatformType': 'WECHAT',
      'AppID': cwx.appId,
      'ActivityCode': String(unionData.allianceid),
      'OpenID': cwx.cwx_mkt.openid,
      'SourcePage': 'COMMON_SEND_COUPON_MIDDLE_PAGE',
      'MarketInfo': {
        'AID': String(unionData.allianceid),
        'SID': String(unionData.sid),
        'OUID': unionData.ouid,
        'SourceID': String(unionData.sourceid),
        'OuterID': ''
      }
    }

    console.log('****** 通用领券页 - 发券入参 ******');
    console.log(params);

    beforeRequestTime = new Date();
    this.ubtDevTrace('mkt_wechat_voucher', {
      action:'handle request activityCouponDistrbut',
      requestTime: beforeRequestTime,
      request: JSON.stringify(params),
      source: PAGE_SOURCE
    });

    cwx.request({
      data: params,
      url: '/restapi/soa2/12673/activityCouponDistrbut',
      success: function(res) {
        console.log('****** 通用领券页 - 发券结果 ******');
        console.log(res);

        //隐藏领券进度提示
        cwx.hideToast();

        //处理领券结果
        if (res && res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack === 'Success') {
          resCode = res.data.resultCode || '';
          resMsg = res.data.resultMsg || '';
          couponInfos = res.data.couponList || [];
          //strategyList = res.data.strategyList || [];

          //发券结果埋点统计
          ubtVal = {
            resCode: resCode,
            resMsg: resMsg,
            timeDuration: that.getTimeDuration(beforeRequestTime),
            source: PAGE_SOURCE
          };

          if (ubtKeys.hasOwnProperty(resCode)) {
            that.ubtDevTrace(ubtKeys[resCode], ubtVal);
          } else {
            that.ubtTrace(100750, ubtVal);
          }

          //发券结果页渲染
          if (resCode === '0' && couponInfos.length !== 0) {
            //that.addWxCard(strategyList, couponInfos); //暂时不用发放微信卡券
            that.successRender(couponInfos);
          } else if (resCode === '-700') {
            that.duplicateRender(resCode);
          } else {
            that.failRender(resCode);
          }
        } else {
          that.failRender();
        }
      },
      fail: function(e) {
        cwx.hideToast();
        that.ubtDevTrace('mkt_wechat_voucher', {
          action:'request activityCouponDistrbut fail',
          resMsg: '错误信息：' + e,
          timeDuration: that.getTimeDuration(beforeRequestTime),
          source: PAGE_SOURCE
        });
        that.timeoutRender();
      }
    });
  },
  /**
   * 发券成功
   */
  addWxCard(strategyList, couponInfos) {
    var that = this;

    if (strategyList && strategyList.length > 0) {
      try {
        cwx.mkt.addCard(strategyList, 'STRATEGY', function() {
          that.successRender(couponInfos);
        }, function() {
          that.successRender(couponInfos);
        });
      } catch (e) {
        that.successRender(couponInfos);
      }
    } else {
      that.successRender(couponInfos);
    }
  },
  /**
   * 发券成功，展示所有优惠券
   */
  successRender(couponInfos) {
    this.setData({
      status: 1,
      couponList: couponInfos
    });
  },
  /**
   * 重复领券提示
   */
  duplicateRender(resCode) {
    this.setData({
      status: 2,
      tipsTitle: '很抱歉',
      tipsMsg: '您已经领过优惠券啦' + (!isNaN(Number(resCode)) ? ' ：' + Math.abs(Number(resCode)) : ''),
      fButtonText: '返回',
      fButtonAction: 'goHome',
      sButtonText: '',
      sButtonAction: ''
    });
  },
  /**
   * 发券失败提示
   */
  failRender(resCode) {
    this.setData({
      status: 2,
      tipsTitle: '很抱歉',
      tipsMsg: '服务器开小差了，优惠券没领到' + (!isNaN(Number(resCode)) ? ' ：' + Math.abs(Number(resCode)) : ''),
      fButtonText: '重新领取',
      fButtonAction: 'sendCoupon',
      sButtonText: '返回',
      sButtonAction: 'goHome'
    });
  },
  /**
   * 发券超时提示
   */
  timeoutRender() {
    this.setData({
      status: 2,
      tipsTitle: 'Oops!',
      tipsMsg: '您的网络不给力哦，请重试',
      fButtonText: '重新领取',
      fButtonAction: 'sendCoupon',
      sButtonText: '返回',
      sButtonAction: 'goHome'
    });
  },
  /**
   * 跳转登录页
   */
  userLogin() {
    var that = this;

    cwx.user.login({
      callback: function(res) {
        if (res && res.ReturnCode === '0') { //登录成功
          that.ubtDevTrace('mkt_wechat_voucher', {
            action:'login success',
            loginRes: res,
            source: PAGE_SOURCE
          });
          that.sendCoupon();
        } else { //防止：调起登录页，选择返回键，再次回到本页面出现白屏情况
          that.setData({
            status: 2,
            tipsTitle: '您还没登录呢',
            tipsMsg: '登录后可获得“优享优惠券”',
            fButtonText: '登录领券',
            fButtonAction: "userLogin",
            sButtonText: "返回",
            sButtonAction: "goHome"
          });
        }
      }
    })
  },
  /**
   * 跳转BU页
   */
  goBUPage(e) {
    var that = this;
    var buPath = typeof e === "string" ? e : e.currentTarget.dataset.url;

    cwx.navigateTo({
      url: buPath ? (buPath.substr(0, 1) === "/" ? "" : "/") + buPath.trim() : "",
      fail: function(e) {
        that.ubtDevTrace('mkt_wechat_voucher', {
          action:'goBUPage',
          buPath: buPath,
          errmsg: "错误信息：" + (e.errMsg || e),
          source: PAGE_SOURCE
        });
        that.goHome(); //若跳转BU页失败，则默认转至首页
      }
    });
  },
  /**
   * 跳转首页
   */
  goHome() {
    cwx.switchTab({
      url: '/pages/home/homepage'
    });
  },
  /**
   * 请求耗时
   */
  getTimeDuration(beforeRequestTime) {
    if (!beforeRequestTime) {
      return '';
    }

    return ((new Date() - beforeRequestTime) + 'ms');
  }
})