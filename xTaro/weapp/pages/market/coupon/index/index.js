import { cwx, CPage, _,__global } from '../../../../cwx/cwx.js';

CPage({
  pageId: '10650075558', // 之前是 10320656429，这里用于区分
  data: {
    title: "",
    msg: "",
    targetUrl: "",
    fButtonText: "",
    fButtonAction: "",
    sButtonText: "",
    sButtonAction: "",
    showTips: false
  },
  onLoad(options) {
    var that = this;

    wx.showToast({
      title: "数据请求中...",
      icon: "loading",
      duration: 60000
    })

    this.ubtDevTrace('mkt_main_coupon', {
        action: 'page onload',
        allianceid: options.allianceid || "", 
        sid: options.sid || "", 
        ouid: options.ouid || "", 
        sourceid: options.sourceid || ""
      });

    cwx.user.checkLoginStatusFromServer(function(checkLoginRes) {
      wx.hideToast();
      if (checkLoginRes) {
        that.ubtDevTrace('mkt_main_coupon', {
          action: 'hasLogin and start sendCoupon',
          checkLoginRes: checkLoginRes
        });
        that.sendCoupon();
      } else {
        that.ubtDevTrace('mkt_main_coupon', {
          action: 'not login and handle start login',
          checkLoginRes: checkLoginRes, 
          currentTime: new Date()});
        that.setData({ showTips: true, title: "您还没登录呢", msg: "登录后可获得“优享优惠券”", fButtonText: "登录领券", fButtonAction: "userLogin", sButtonText: "返回", sButtonAction: "goHome" }); //防止：调起登录页，选择返回键，再次回到本页面出现白屏情况
        //that.userLogin();
      }
    });
  },
  sendCoupon() {
    var that = this,
        uniondata = {},
        params = {},
        beforeRequestTime = "",
        requestCouponUbtVal = "",
        rescode = "",
        strategyList = [];

    cwx.mkt.getUnion(function(data) {
       uniondata = data;
    })

    params = {
      "PlatformType": "WECHAT",
      "AppID": cwx.appId,
      "ActivityCode": String(uniondata.allianceid),
      "OpenID": cwx.cwx_mkt.openid,
      "SourcePage": "SEND_COUPON_MIDDLE_PAGE",
      "MarketInfo": {
        "AID": String(uniondata.allianceid),
        "SID": String(uniondata.sid),
        "OUID": uniondata.ouid,
        "SourceID": String(uniondata.sourceid),
        "OuterID": ""
      }
    }

    wx.showToast({
      title: "优惠券领取中...",
      icon: "loading",
      duration: 60000
    })

    beforeRequestTime = new Date();
    this.ubtDevTrace('mkt_main_coupon', {
      action: 'start request activityCouponDistrbut',
      requestTime: beforeRequestTime
    });

    cwx.request({
        data: params,
        url: '/restapi/soa2/12673/activityCouponDistrbut?_fxpcqlniredt=' + cwx.clientID,
        success: function(res) {

          //隐藏领券进度提示
          wx.hideToast();

          //处理领券结果
          if (res && res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack == "Success") {

            rescode = res.data.resultCode || "";
            strategyList = res.data.strategyList || [];

            //strategyList = ["51417", "52357"]; //todo 测试

            //记录目标页地址
            that.setData({ targetUrl: res.data.targetUrl || "" });

            //发券结果埋点统计
            requestCouponUbtVal = { timeDuration: (new Date() - beforeRequestTime) + "ms", request: JSON.stringify(params) };

            switch (rescode) {
              case "0": //发券成功
                that.ubtDevTrace('mkt_main_coupon', Object.assign(requestCouponUbtVal,{action: 'send coupon success'}));
              break;
              case "-100": //请求体不完整
                that.ubtDevTrace('mkt_main_coupon', Object.assign(requestCouponUbtVal,{action: 'sendCoupon rescode -100'}));

              break;
              case "-200": //UID获取失败
                that.ubtDevTrace('mkt_main_coupon', Object.assign(requestCouponUbtVal,{action: 'sendCoupon rescode -200'}));
              break;
              case "-300": //无效的活动
                that.ubtDevTrace('mkt_main_coupon', Object.assign(requestCouponUbtVal,{action: 'sendCoupon rescode -300'}));

              break;
              case "-400": //策略未配置
                that.ubtDevTrace('mkt_main_coupon', Object.assign(requestCouponUbtVal,{action: 'sendCoupon rescode -400'}));
              break;
              case "-500": //发券部分失败
                that.ubtDevTrace('mkt_main_coupon', Object.assign(requestCouponUbtVal,{action: 'sendCoupon rescode -500'}));
              break;
              case "-600": //发券失败
                that.ubtDevTrace('mkt_main_coupon', Object.assign(requestCouponUbtVal,{action: 'sendCoupon rescode -600'}));
              break;
              case "-700": //重复发券
                that.ubtDevTrace('mkt_main_coupon', Object.assign(requestCouponUbtVal,{action: 'sendCoupon rescode -700'}));
              break;
              case "-1000": //token为空或者无效
                that.ubtDevTrace('mkt_main_coupon', Object.assign(requestCouponUbtVal,{action: 'sendCoupon rescode -1000'}));
              break;
              case "1001": //根据登录态获取UID异常
                that.ubtDevTrace('mkt_main_coupon', Object.assign(requestCouponUbtVal,{action: 'sendCoupon rescode 1001'}));
              break;
              case "2001": //活动配置不存在
                that.ubtDevTrace('mkt_main_coupon', Object.assign(requestCouponUbtVal,{action: 'sendCoupon rescode 2001'}));
              break;
              case "2002": //活动配置无效
                that.ubtDevTrace('mkt_main_coupon', Object.assign(requestCouponUbtVal,{action: 'sendCoupon rescode 2002'}));
              break;
              case "3000": //发券其他异常
                that.ubtDevTrace('mkt_main_coupon', Object.assign(requestCouponUbtVal,{action: 'sendCoupon rescode 3000'}));
              break;
              case "3002": //发券策略无效
                that.ubtDevTrace('mkt_main_coupon', Object.assign(requestCouponUbtVal,{action: 'sendCoupon rescode 3002'}));
              break;
              case "3004": //发券策略库存不足
                that.ubtDevTrace('mkt_main_coupon', Object.assign(requestCouponUbtVal,{action: 'sendCoupon rescode 3004'}));
              break;
              case "3005": //发券策略失效
                that.ubtDevTrace('mkt_main_coupon', Object.assign(requestCouponUbtVal,{action: 'sendCoupon rescode 3005'}));
              break;
              case "3013": //发券策略未生成
                that.ubtDevTrace('mkt_main_coupon', Object.assign(requestCouponUbtVal,{action: 'sendCoupon rescode 3013'}));
              break;
              case "3114": //发券策略风控拦截
                that.ubtDevTrace('mkt_main_coupon', Object.assign(requestCouponUbtVal,{action: 'sendCoupon rescode 3114'}));
              break;
              case "3119": //发券策略信息安全拦截
                that.ubtDevTrace('mkt_main_coupon', Object.assign(requestCouponUbtVal,{action: 'sendCoupon rescode 3119'}));
              break;
              case "3120": //发券策略风控及信息安全拦截
                that.ubtDevTrace('mkt_main_coupon', Object.assign(requestCouponUbtVal,{action: 'sendCoupon rescode 3120'}));
              break;
              default: //异常
                that.ubtDevTrace('mkt_main_coupon', Object.assign(requestCouponUbtVal,{action: 'sendCoupon rescode error'}));
            }

            if (rescode == "0" || rescode == "-700") { //领券成功 & 重复领券
              that.setData({ showTips: false });

              if (strategyList && strategyList.length > 0) {
                try {
                  //添加微信卡券，完成后跳转目标页
                  cwx.mkt.addCard(strategyList, "STRATEGY", function () {
                    console.log("************ 添加微信卡券 - 成功 ****************");
                    that.goTargetUrl();
                  }, function () {
                    console.log("************ 添加微信卡券 - 失败 ****************");
                    that.goTargetUrl();
                  });
                } catch (e) {
                  that.goTargetUrl();
                }
              } else {
                that.goTargetUrl();
              }

            } else { //领券失败
              that.setData({ showTips: true, title: "很抱歉", msg: "服务器开小差了，优惠券没领到" + (!isNaN(Number(rescode)) ? "：" + Math.abs(Number(rescode)) : ""), fButtonText: "继续购买", fButtonAction: "goTargetUrl", sButtonText: "", sButtonAction: "" });
            }

          } else {
            that.setData({ showTips: true, title: "很抱歉", msg: "服务器开小差了，优惠券没领到", fButtonText: "", fButtonAction: "", sButtonText: "返回", sButtonAction: "goHome"  });
          }

        },
        fail: function(e) {
          wx.hideToast();
          that.ubtDevTrace('mkt_main_coupon', { action:'sendCoupon request error',timeDuration: (new Date() - beforeRequestTime) + "ms", request: JSON.stringify(params), response: "错误信息：" + e });
          that.setData({ showTips: true, title: "Oops!", msg: "您的网络不给力哦，请重试", fButtonText: "重新领取", fButtonAction: "sendCoupon", sButtonText: "返回", sButtonAction: "goHome" });
        }
      });
  },
  userLogin() {
    var that = this;

    cwx.user.login({
      callback: function(res) {
        if(res && res.ReturnCode == "0"){
          that.ubtDevTrace('mkt_main_coupon', {action:'login success and handle sendCoupon', loginRes: res, currentTime: new Date()});
          that.setData({ showTips: false });
          that.sendCoupon();
        }
      }
    })
  },
  goTargetUrl() {
    var that = this;
    var _targetUrl = this.data.targetUrl;

    if (_.indexOf(__global.tabbar, _targetUrl) != -1) {
      cwx.switchTab({url: "/" + _targetUrl.trim()});
    } else if (_targetUrl) {
      cwx.redirectTo({
        url: "../../../../" + _targetUrl.trim(),
        fail: function (e) {
          that.goHome();
        }
      });
    } else {
      that.ubtDevTrace('mkt_main_coupon', {action:'coupon targetUrl is null',targetUrl: "未配置"});
      that.goHome();
    }
  },
  goHome() {
    cwx.switchTab({ url: "/pages/home/homepage" });
  }
})