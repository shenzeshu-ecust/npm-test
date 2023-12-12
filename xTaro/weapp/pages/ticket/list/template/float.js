import { cwx, _ } from "../../../../cwx/cwx.js";
// var __global = require("../../../cwx/ext/global.js");
// var utils = require('../common/utils.js');

var _this, _floatData = {};
var gShowSwingFloat = false;  //是否展示小浮层
var couponList = [];
var couponCount = 0;

/**
* 常量定义
*/
var _const = {
  LS_MKT_MASK_INFO: "mkt_mask_info"
};

/**
* 通用方法
*/
var _utils = {
  getOpenid : function (onSuccess, onError) {
    var interval;
    var checkCount = 60;
    //侦听openid - 定时器模式
    interval = setInterval(function () {
      checkCount--;
      if (checkCount < 0) {
        clearInterval(interval);
        onError && onError();
      } else if (cwx.cwx_mkt.openid) {
        console.log("定时器模式");
        clearInterval(interval);
        onSuccess && onSuccess();
      }
    }, 100);
  },
  /**
  * 获取当前页不带参数的url
  */
  getCurrentPage: function () {
    const pages = getCurrentPages(); //获取加载的页面
    const currentPage =pages[pages.length - 1]||{}; //获取当前页面的对象
    return {
      url: currentPage.route||'',
      pageid: currentPage.pageId ? currentPage.pageId : currentPage.pageid?currentPage.pageid:''
    };
  },

  //写入ls缓存数据和view视图数据，重新渲染页面
  setMaskInfo: function (lsData, viewData) {
    !_this.data.marketFloatData && _this.setData({ marketFloatData: {} });

    var ls = cwx.getStorageSync(_const.LS_MKT_MASK_INFO) || {};
    var vw = _this.data.marketFloatData.view || {};

    //写入ls缓存数据
    if (lsData) {
      _.forEach(lsData, function (item, key) {
        ls[key] = item;
      });

      cwx.setStorageSync(_const.LS_MKT_MASK_INFO, ls);
    }

    //写入view视图数据
    if (viewData) {
      _.forEach(viewData, function (item, key) {
        if (!vw[key]) {
          vw[key] = {};
        }

        if (Object.prototype.toString.call(item) == "[object Object]") {
          _.forEach(item, function (sItem, sKey) {
            vw[key][sKey] = sItem;
          });
        }
      });
    }

    //重新渲染页面
    _this.setData({
      marketFloatData: {
        ls: cwx.getStorageSync(_const.LS_MKT_MASK_INFO),
        view: vw
      }
    });
  },

  //强制清除废弃的缓存标识
  /*clearCache: function () {
      var maskInfo = cwx.getStorageSync(_const.LS_MKT_MASK_INFO);

      if (maskInfo && maskInfo.hasOwnProperty("shareSmallMode")) {
          //cwx.setStorageSync(_const.LS_MKT_MASK_INFO, {floatShowMask: maskInfo.floatShowMask});
      }
  },*/
};

/**
* 事件触发
*/
var _events = {
  //记录formid
  homeFormSubmit: function (e) {
    //e && e.detail && e.detail.formId && cwx.mkt.saveUserFormID(e.detail.formId, 6);
  },
  //首页活动 - 显示小图标
  showSmall: function () {
    var maskInfo = cwx.getStorageSync(_const.LS_MKT_MASK_INFO);
    var showMaskSmall = maskInfo ? maskInfo["showSmallPop"] : true;
    _utils.setMaskInfo({ showBigPop: false, showSmallPop: showMaskSmall }, { floatData: { isAnimate: true } });
  },
  //首页活动 - 进入活动页面
  toPage: function (e) {
    var _url = e.currentTarget.dataset.url,
      _ctype = e.currentTarget.dataset.ctype,
      _isRedirect = e.currentTarget.dataset.isredirect,
      _appid = e.currentTarget.dataset.appid;
    //_events.showSmall();
    if (_url && _isRedirect == true && _appid) {
      cwx.cwx_navigateToMiniProgram({
        appId: _appid,
        path: _url
      })
    } else if (_url && _isRedirect == false) {
      cwx.navigateTo({ url: _url });
    }
    _ctype == "float" ? _this.ubtTrace(101186, { openid: cwx.cwx_mkt.openid || '', currentTime: new Date(), url: _url || '', pageid: _utils.getCurrentPage().pageid || '' }) : _this.ubtTrace(101117, { openid: cwx.cwx_mkt.openid || '', url: _url || '', pageid: _utils.getCurrentPage().pageid || '' })
  },
  //首页浮层动态隐藏/显示 小浮层尺寸120*120
  showHomeFloat: function (isShow) {
    // if (isShow){
    //   _utils.setMaskInfo(null, { floatData: _floatData });
    // }else{
    //   if (_floatData.fright && _floatData.fright.indexOf('px') > -1 && _floatData.fwidth.indexOf('px') > -1){
    //     _utils.setMaskInfo(null, { floatData: { fright: (-parseInt(_floatData.fright) - parseInt(_floatData.fwidth)) + 'px' } });
    //   }

    //   if (_floatData.fright && _floatData.fright.indexOf('%') > -1 && _floatData.fwidth.indexOf('%') > -1){
    //     _utils.setMaskInfo(null, { floatData: { fright: (-parseInt(_floatData.fright) - parseInt(_floatData.fwidth)) + '%' } });
    //   }   
    // }
    // _this = getCurrentPages()[getCurrentPages().length - 1];
    // if (isShow){
    //   _utils.setMaskInfo({ swingShowSmallPop: gShowSwingFloat}, { swingInfo: { right: '0' } });
    // }else{
    //   _utils.setMaskInfo({ swingShowSmallPop: gShowSwingFloat }, { swingInfo: { right: '-120'} });   
    // }
  },
  closeHdp: function (e) {
    var _couponType = e.currentTarget.dataset.coupontype||'', _aid = e.currentTarget.dataset.aid||'', _sid = e.currentTarget.dataset.sid||'';
    _utils.setMaskInfo({ hdpShowBigMask: false });
    _this.setData({ disableMove: false });
    if (_couponType.indexOf('vip') > -1 || _couponType.indexOf('car') > -1) {
      cwx.mkt.getUnion(function (unionData) {
        cwx.navigateTo({
          url: '/pages/market/promocode/index/index?allianceid=' + unionData.allianceid.toString() + '&sid=' + unionData.sid.toString()
        })
      })
      _this.ubtTrace(101128, { couponType: _couponType });
    }

  },
  getHdpCoupon: function (res) {
    console.log(res);
    var _sid = res.currentTarget.dataset.sid;
    wx.showLoading({ title: '登录中...' });
    cwx.user.wechatPhoneLogin(res, String(_this.pageId), 'pages/home/homepage', function (resCode, funtionName, errorMsg) {
      wx.hideLoading();
      if (resCode == 0) {
        if (_sid =='1538409'){
          _utils.setMaskInfo({ hdpShowBigMask: true }, { hdpInfo: { hdpPic: 'lc' } });
        }else{
          _init.hdpFloat();
        }
      } else {
        wx.showToast({ title: errorMsg + '【' + resCode + '】', icon: 'none' })
      }
      _this.ubtTrace(102666, { msg: errorMsg, code: resCode, type: 'wechatPhoneLogin' });
    });
  },
  getSouYiSouCoupon: function (e) {
    // 判断下 是登录态下的领取  还是未登录的领取
    // var handleSendCoupon = () => {
      wx.showLoading({ title: '领取中...' });
      cwx.request({
        url:'/restapi/soa2/12673/sendCouponPackage',
        data: {
          appId:"wx0e6ed4f51db9d078",
          type: "AppFloat",
        },
        success: (res) => {
          if(res.data.errcode == 0) {
            wx.hideLoading()
            _utils.setMaskInfo({ souYiSouFloatShow: true, isReceive: true, loginStatus: true });
          } else {
            wx.hideLoading()
            wx.showToast({
              title: res.errmsg,
              icon: 'none'
            })
          }
        }
      })
  },
  // 判断是否已经领券
  checkIsSouYiSouGetCoupon(e) {
    var queryCouponPackage = function() {
      cwx.request({
        url: '/restapi/soa2/12673/queryCouponPackage',
        data: {
          appId:"wx0e6ed4f51db9d078",
          type: "AppFloat"
        },
        success: (res) => {
          // 根据返回结果展示  是否已经领取了：  立即领取     去使用
          if(res.data.errcode == 0 ) {
            // 已经领取
            if(res.data.couponList && res.data.couponList.length > 0) {
              if(!loginStatus) {
                _utils.setMaskInfo({ souYiSouFloatShow: true, 
                  isReceive: true, loginStatus: true},{floatData: {couponList: couponList,couponCount: couponCount}});
              } else {
                // 已登录  已领取   不出浮层
                _utils.setMaskInfo({ souYiSouFloatShow: false});
              }
            } else {
              if(loginStatus) {
                // 已经登陆态下的未领取
                _utils.setMaskInfo({ souYiSouFloatShow: true, 
                  isReceive: false, loginStatus: true},{floatData: {couponList: couponList,couponCount: couponCount}});
              } else {
                // 未登录时候点击的领取按钮  直接调用领取接口
                _events.getSouYiSouCoupon()
              }
            }
          } else {
            _this.ubtTrace(102629, { data: JSON.stringify(res.data) || {}, currentTime: new Date() });
          }
        }
      })
    }
    const loginStatus = e.currentTarget ? e.currentTarget.dataset.loginstatus : e   // 获取用户点击检查是否领券时候的登录态
    // 如果用户是未登录状态下  在登陆成功回调里调用的检查券
    if(loginStatus === false) {
      wx.showLoading({ title: '登录中...' });
      cwx.user.wechatPhoneLogin(e, String(_this.pageId), 'pages/home/homepage', function (resCode, funtionName, errorMsg) {
        wx.hideLoading();
        if (resCode == 0) {
          // 执行领券
          queryCouponPackage()
        } else {
          wx.showToast({ title: errorMsg + '【' + resCode + '】', icon: 'none' })
        }
        _this.ubtTrace(102666, { msg: errorMsg, code: resCode, type: 'wechatPhoneLogin' });
      });
    } else {
      queryCouponPackage()
    }

    
  },
  // 首页摇一摇
  showRules: function () {
    _this = getCurrentPages()[getCurrentPages().length - 1];
    _utils.setMaskInfo({ swingShowRules: true, swingShowSmallPop: gShowSwingFloat });
    _this.ubtTrace(101162, { openid: cwx.cwx_mkt.openid || '', currentTime: new Date(), pageid: _utils.getCurrentPage().pageid || '' });
  },
  closeSwingPop: function () {
    _this = getCurrentPages()[getCurrentPages().length - 1];
    _utils.setMaskInfo({ swingShowRules: false, swingShowBigPop: false, swingShowSmallPop: gShowSwingFloat });
    _this.ubtTrace(101187, { openid: cwx.cwx_mkt.openid || '', currentTime: new Date(), pageid: _utils.getCurrentPage().pageid || '' });
  },
  closeSouYiSouPop: function () {
    _this = getCurrentPages()[getCurrentPages().length - 1];
    _utils.setMaskInfo({ souYiSouFloatShow: false });
    _this.ubtTrace(101187, { openid: cwx.cwx_mkt.openid || '', currentTime: new Date(), pageid: _utils.getCurrentPage().pageid || '' });
  },
  //道音接口
  sendbizofdaoyin: function () {
    var _wholeUrl, _aid, _sid, _port;
    _utils.getOpenid(function () {
      _sid = _this.options.sid || "";
      _aid = _this.options.allianceid || "";
      var _params = {
        openID: cwx.cwx_mkt.openid || "",
        appID: cwx.appId,
        marketInfo: {
          aID: _aid,
          sID: _sid
        },
        port: ""
      }
      _this.ubtTrace(102742, _params);

      if (_this.pageId == '10320613574' && _sid == "1538409") {
        _wholeUrl = _this.options.q && decodeURIComponent(_this.options.q) || "";
        _port = utils.getUrlQuery(_wholeUrl, 'port') || _this.options.port || "";
        _params['port'] = _port;
        _params['layerType'] = '3';
      } else if ((_this.pageId == '10320613574' && _sid == "1494284") || (_this.pageId == '10320613574' && _sid == "1637639") || (_this.pageId == '10650012159' && _sid == "1538406") || (_this.pageId == '10650012159' && _sid == "1616900") || (_this.pageId == '10650012159' && _sid == "1616895") || (_this.pageId == '10650012159' && _sid == "1616893")) {
        _params['layerType'] = (_sid == "1494284" || _sid == "1637639") ? '1' : '2';
        _this.ubtTrace(102743, _params);
      }
      cwx.request({
        url: "/restapi/soa2/12673/sendbizofdaoyin",
        data: _params,
        success: function (res) {
          console.log("【互动屏】匹配结果");
          console.log(res);
          if (res && res.data && (res.data.errcode == 1 || res.data.errcode == 0 || res.data.errcode == 10001)) {
            _.isFunction(matchCallback) && matchCallback(res.data, _aid, _sid);
            hdpUbtTrace(res.data);
          } else {
            hdpUbtTrace(res.data);
            _.isFunction(dismatchCallback) && dismatchCallback(res.data);
          }
        },
        fail: function (e) {
          hdpUbtTrace(e);
          _.isFunction(dismatchCallback) && dismatchCallback(e);
        }
      });
    }, function () {
      _init.homeFloat();
    })

    function hdpUbtTrace(data) {
      console.log(data);
      try {
        _this.ubtTrace && _this.ubtTrace(102744, _.extend({
          msg: data.errmsg || data.errMsg || "",
          code: data.errcode || "",
          currentTime: new Date()
        }, _params));
      } catch (e) { }
    }
    var matchCallback = function (result, aid, sid) {
      //hdpStatus 未登录发券-1 | 发券成功1
      if (result.errcode == 1) {
        //手机号登录前要先获取登录凭证
        cwx.user.wxLogin(function (resCode, funtionName, errorMsg) {
          if (resCode != 0) {
            wx.showToast({ title: errorMsg, icon: 'none' })
          }
        })
        //var _pic = sid == "1538409" ? 'red03' : 'red';
        _utils.setMaskInfo({ hdpShowBigMask: true }, { hdpInfo: { hdpPic: 'red' } });
      } else if (result.errcode == 10001) {
        //var _pic = sid == "1538409" ? 'red03' : 'red';
        _utils.setMaskInfo({ hdpShowBigMask: true }, { hdpInfo: { hdpPic: 'red' } });
        wx.showModal({
          title: '提示',
          content: '优惠红包只能领取一次哦',
          showCancel: false,
          confirmText: '知道啦',
          success(res) {
            if (res.confirm) {
              _utils.setMaskInfo({ hdpShowBigMask: false });
              _this.setData({ disableMove: false });
            }
          }
        })
      } else {
        var _couponType = aid == '1020272' ? 'hotel02' : result.couponType + '04';
        _utils.setMaskInfo({ hdpShowBigMask: true }, { hdpInfo: { hdpPic: _couponType || '', aid: aid || '', sid: sid || '' } });
      }
      _this.setData({ disableMove: true });
    };

    var dismatchCallback = function (data) {
      data.errcode && wx.showToast({ title: "啊哦，网络太差券券获取失败，再扫一遍二维码吧【" + data.errcode + "】", icon: 'none', duration: 3000 });
      _utils.setMaskInfo({ hdpShowBigMask: false });
    };
  }

};

/**
* 初始化主流程
*/
var _init = {
  //首页活动浮层TODO 首页浮层位置有变动，待改造
  homeFloat: function () {
    var mktBigFloatImg = cwx.getStorageSync('mkt_float_img') || "";
    cwx.mkt.getUnion(function (unionData) {
      console.log("-----【浮层匹配】渠道参数==============");
      console.log(_this.pageId);
      var _params = {
        appId: "wx0e6ed4f51db9d078",
        pageId: _this.pageId ? _this.pageId + '' : _this.pageid + '',
        aid: unionData.allianceid.toString(),
        sid: unionData.sid.toString(),
        appType: 2
      }
      console.log(JSON.stringify(_params));
      cwx.request({
        url: '/restapi/soa2/12673/getAppFloatConfig',
        data: _params,
        success: function (res) {
          console.log("【浮层匹配】匹配结果");
          console.log(JSON.stringify(res.data));
          if (res && res.data && res.data.resultCode == "0" && res.data.appFloatConfigResultList && res.data.appFloatConfigResultList.length > 0 && res.data.appFloatConfigResultList[0].resultCode == "0") {
            _floatData = res.data.appFloatConfigResultList[0];
            _.forEach(_floatData, function (item, key) {
              if (key == "floatPosition") {
                _floatData['fbottom'] = item.split('*') && item.split('*')[0];
                _floatData['fright'] = item.split('*') && item.split('*')[1];
              }
              if (key == "floatSize") {
                _floatData['fwidth'] = item.split('*') && item.split('*')[0];
                _floatData['fheight'] = item.split('*') && item.split('*')[1];
              }
            })

            var showMaskSmall = false, showMaskBig = false;
            //1:小浮层|2：大浮层|3：大小浮层
            if (_floatData.floatType == "1") {
              showMaskSmall = true;
            } else if (_floatData.floatType == "2") {
              showMaskBig = true;
            } else {
              showMaskBig = true;
              showMaskSmall = true;
            }
            console.log(mktBigFloatImg);

            //设置【大浮层】显示 大浮层图片地址
            if (showMaskBig && ((mktBigFloatImg && mktBigFloatImg.indexOf(_floatData.bigFloatImage) == -1) || !mktBigFloatImg)) {
              _utils.setMaskInfo({ showBigPop: true }, { floatData: _floatData });
              cwx.setStorageSync('mkt_float_img', mktBigFloatImg + ',' + _floatData.bigFloatImage);
              _this.ubtTrace(101116, { currentTime: new Date() });
            } else {
              _utils.setMaskInfo({ showBigPop: false }, { floatData: _floatData });
            }
            //设置【小浮层】显示
            if (showMaskSmall) {
              _utils.setMaskInfo({ showSmallPop: true }, { floatData: _floatData });
            } else {
              _utils.setMaskInfo({ showSmallPop: false }, { floatData: _floatData });
            }

            console.log("=======数据处理==============");
            console.log(_this.data.marketFloatData);

          } else {
            _utils.setMaskInfo({ showBigPop: false, showSmallPop: false }, { floatData: { floatType: "-1" } });
          }
          _this.ubtTrace(102629, { data: JSON.stringify(res) || {}, currentTime: new Date() });
        },
        fail: function (res) {
          _this.ubtTrace(102629, { data: JSON.stringify(res) || {}, currentTime: new Date() });
          console.log(JSON.stringify(res));
        }
      })
    });
  },
  hdpFloat: function () {
    var _aid, _sid;
    _sid = _this.options.sid || "";
    _aid = _this.options.allianceid || "";
    _this.setData({ disableMove: false });
    //超级会员打印 aid 1027031 sid 1637639
    //超级会员充电 aid 921013 sid 1538409
    //老超级会员 aid 921013 sid 1494284   酒店aid 921013 sid 1538406
    //新酒店aid 1020272 sid 1616900 | aid 1020272 sid 1616895 | aid 1020272 sid 1616893
    if (_this.pageId == '10320613574' && _sid == "1538409") {
      //_wholeUrl = _this.options.q && decodeURIComponent(_this.options.q) || "";
      //_port = utils.getUrlQuery(_wholeUrl, 'port') || _this.options.port || "";
      //_params['port'] = _port;
      cwx.user.checkLoginStatusFromServer(function (checkLoginRes) {
        if (!checkLoginRes) {
          //未登录
          //手机号登录前要先获取登录凭证
          cwx.user.wxLogin(function (resCode, funtionName, errorMsg) {
            if (resCode != 0) {
              wx.showToast({ title: errorMsg, icon: 'none' })
            }
          })
          //var _pic = sid == "1538409" ? 'red03' : 'red';
          _utils.setMaskInfo({ hdpShowBigMask: true }, { hdpInfo: { hdpPic: 'red04' } });
          
        } else {
          _utils.setMaskInfo({ hdpShowBigMask: true }, { hdpInfo: { hdpPic: 'lc' } });
          
        }
      });
    } else if ((_this.pageId == '10320613574' && _sid == "1494284") || (_this.pageId == '10320613574' && _sid == "1637639") || (_this.pageId == '10650012159' && _sid == "1538406") || (_this.pageId == '10650012159' && _sid == "1616900") || (_this.pageId == '10650012159' && _sid == "1616895") || (_this.pageId == '10650012159' && _sid == "1616893")) {
      //_params['layerType'] = (_sid == "1494284" || _sid == "1637639") ? '1' : '2';
      //_this.ubtTrace(102743, _params);
      _events.sendbizofdaoyin()
    }else {
      _init.homeFloat();
    }
   
  },
  swingFloat: function () {
    var canShake = true;
    _init.rollLuckyBag(function (data) {
      gShowSwingFloat = data.showSmallFloat;
      _utils.setMaskInfo({ swingShowSmallPop: gShowSwingFloat }, null);
    });
    _this.shake(function () {
      if (canShake) {
        //初始化全局this，防止onshow返回当前页面this变了
        _this = getCurrentPages()[getCurrentPages().length - 1];
        canShake = false;
        _utils.setMaskInfo({ swingShowBigPop: false }, null);
        //随机获取产品
        _init.rollLuckyBag(function (data) {
          if (_this.data.marketFloatData && _this.data.marketFloatData.ls && _this.data.marketFloatData.ls.showBigPop) {
          } else {
            _utils.setMaskInfo({ swingShowBigPop: true, swingShowRules: false, swingShowSmallPop: gShowSwingFloat }, { swingInfo: { bigPic: data.bigFloatImage, isRedirect: data.isRedirect, url: data.url, appId: data.appId } });
            _this.ubtTrace(101163, { openid: cwx.cwx_mkt.openid || '', currentTime: new Date(), url: data.url, pageid: _utils.getCurrentPage().pageid || '' });
          }
          canShake = true;
        })
      }
    })
  },
  souYiSouFloat: function () {
    const aid = _this.options && _this.options.allianceid && _this.options.allianceid.toString()
    const sid = _this.options && _this.options.sid && _this.options.sid.toString()
    if(!aid || !sid) {
      return
    }
    _utils.getOpenid(function () {
      cwx.request({
        url: '/restapi/soa2/12673/getFloatInfo',
        data: {
          appId:"wx0e6ed4f51db9d078",
          type: "AppFloat",
          mktOpenId: cwx.cwx_mkt.openid,
          pageId: _this.pageId ? _this.pageId + '' : _this.pageid + '',
          allianceId: aid,
          sId: sid
        },
        success: (res)=> {
          if(res.data.errcode == 0) {
            couponList = res.data.couponList
            couponCount = 0
            for(let i=0;i<couponList.length;i++) {
              couponCount += couponList[i].discountAmount
            }
            cwx.user.checkLoginStatusFromServer(function (checkLoginRes) {
              console.log('--------------获取登录态--------------------', checkLoginRes)
              if (!checkLoginRes) {
                //未登录情况下获取登录凭证
                console.log('微信搜一搜发券   未登录---------------')
                cwx.user.wxLogin(function (errCode, funtionName, errorMsg) {
                  if (errCode != 0) {
                    wx.showToast({ title: errorMsg, icon: 'none' })
                  }
                  // 展示浮层 用户点击  进行登录  登录完毕 直接发券
                  _utils.setMaskInfo({ souYiSouFloatShow: true, loginStatus: false },
                    {floatData: {couponList: couponList, couponCount: couponCount}});
                })
              } else {
                console.log('微信搜一搜发券   已经登录-----')
                // 判断领券状态
                _events.checkIsSouYiSouGetCoupon(true)
              }
            })
          }
        },
        fail: (e)=> {
          _this.ubtTrace(102629, { data: JSON.stringify(e) || {}, currentTime: new Date() });
        }
      })
    })
    
  },
  rollLuckyBag: function (matchCallback, dismatchCallback) {
    cwx.request({
      url: "/restapi/soa2/12673/rollLuckyBag",
      data: {
        appId: "wx0e6ed4f51db9d078",
        pageId: _utils.getCurrentPage().pageid + '',
        appType: 2
      },
      success: function (res) {
        console.log(res);
        if (res && res.data && res.data.resultCode == 0) {
          _.isFunction(matchCallback) && matchCallback(res.data);
        } else {
          _.isFunction(dismatchCallback) && dismatchCallback(res.data);
        }
      },
      fail: function (e) {
        _.isFunction(dismatchCallback) && dismatchCallback(e);
      }
    });
  }

};

var marketfloatUtils = function (context, floatType, proId) {
  _this = context && context.data ? context : context.__page;
  //初始关闭所有浮层
  _utils.setMaskInfo({
    showSmallPop: false,
    showBigPop: false,
    hdpShowBigMask: false,
    swingShowBigPop: false,
    swingShowSmallPop: false,
    swingShowRules: false,
    souYiSouFloatShow: false
  }, { floatData: { floatType: "-1", isAnimate: false } });

  //大首页 |酒店首页
  if (_this.pageId == "10320613574" || _this.pageId == "10650017812" || _this.pageId == "10650044253") {
    _init.hdpFloat();
  }
  //火车票train/orderdetail  bus/index  
  if (_this.pageId == "10320613574" || _this.pageId == "10650012159" || _this.pageId == "10320640941" || _this.pageId == "10320614135" || _this.pageId == "10320661727") {
    _init.swingFloat();
  }

  // 微信小程序_POI详情页
    _init.souYiSouFloat();

  return {
    showSmall: _events.showSmall,
    toPage: _events.toPage,
    homeFormSubmit: _events.homeFormSubmit,
    showHomeFloat: _events.showHomeFloat,
    closeHdp: _events.closeHdp,
    getHdpCoupon: _events.getHdpCoupon,
    showRules: _events.showRules,
    closeSwingPop: _events.closeSwingPop,
    closeSouYiSouPop: _events.closeSouYiSouPop,
    sendbizofdaoyin: _events.sendbizofdaoyin,
    getSouYiSouCoupon: _events.getSouYiSouCoupon,
    checkIsSouYiSouGetCoupon: _events.checkIsSouYiSouGetCoupon
  }
};

module.exports = marketfloatUtils;