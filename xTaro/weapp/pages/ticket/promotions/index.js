import { _, cwx, TPage, config, getHost, locateSource} from "../common.js";
import utils from '../groupresdetail/index.util';
import location from '../locate';
let ticketmodel = require('../service/ticketmodel.js'),
    ticketstore = require('../service/ticketstore.js');

const charMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const options = {
    data: {
        navbarData: {
            title: '任性砍5折',
            showBack: 1,
            showCapsule: 1,
            showColor: 1
        },
        appWakeSchema: 'ctrip://wireless/h5?url=L3JuX3R0ZC9fY3JuX2NvbmZpZz9DUk5Nb2R1bGVOYW1lPXJuX3R0ZCZDUk5UeXBlPTEmaW5pdGlhbFBhZ2U9dGlja2V0JmFsbGlhbmNlaWQ9OTE3MjcyJnNpZD0xOTU0NDk3&type=5',
        appWakeSchemaList:null,
        showTips: true,
        activeIndex: 0,
        geoCity: {},
        showCoupon: false,
        showRisk: false,
        isChangeTab: false,
        canScroll: true,
        scrollHeight: 667,
        scrollTop: 0
    },
    name : 'promotions',
    onLoad: function(options) {
        this.cutId = options && options.cutid || "";
        this.fromtype = options && options.fromtype || "";
        this.orderId = options && options.orderid || "";

        //埋点相关数据
        this.setData({
          traceCutId: this.cutId,
          traceOrderId: this.orderId,
          traceFromtype: this.fromtype,
        })


        this.setData({
            orderId: this.orderId,
            titleHeight: config.Base.titleheight
        })
        this.checkCutOrderInfo(); //回去curId
        // 从app分享卡片或者app打开
        if (cwx.scene == 1036 || cwx.scene == 1069) {
            this.setData({
                canBackApp: true
            });

        }
    },
    onShow: function() {
        this.showTips();
        this.fetchInitPageData();
        this.posCity();
    },
    onHide: function() {
        this.setData({showRisk: false, showCoupon: false, showRecord: false, scrollTop: 0});
        clearInterval(this.intervalTimer);
        //底部可回APP按钮展示曝光后置，因为是展示及参数需要多个异步结果共同参与，故放在页面隐藏(跳转其他页面)时发出。
        const { canBackApp } = this.data;
        if (canBackApp) {
          this.ubtTrace && this.ubtTrace(`tkt_buttom_toapp_expose`, {
            curId: this.data.curId,
          })
        }
    },
    onUnload: function() {
        this.setData({showRisk: false, showCoupon: false, showRecord: false, scrollTop: 0});
        clearInterval(this.intervalTimer);
        //底部可回APP按钮展示曝光后置，因为是展示及参数需要多个异步结果共同参与，故放在页面销毁(跳转首页等上级页面)时发出。
        const { canBackApp } = this.data;
        if (canBackApp) {
          this.ubtTrace && this.ubtTrace(`tkt_buttom_toapp_expose`, {
            curId: this.data.curId,
          })
        }

    },
    showTips: function() {
        let that = this;
        if (this.data.showTips) {
            setTimeout(function() {
                that.setData({showTips: false})
            }, 6000);
        }
    },
    formatStatusSubDesc: function (template, data) {
        var pattern = new RegExp('\\{(\\w*[:]*[=]*\\w+)\\}(?!})', 'g');
        return template.replace(pattern, function (_, key) {
            return data[key];
        });
    },
    checkCutOrderInfo:function(){
      const self = this;
      ticketmodel.CheckCutOrderInfo.request({
        data: {
          curId:this.cutId,
          orderId: this.orderId
        },
        success: function (res) {
            self.setData({
              statusSubDesc: self.formatStatusSubDesc(res.statusSubDesc, res),
              curId:res.cutId
          })
        },
        fail: function (res) {
          console.log(res);
        }
      })
    },
    prepareShema:function(){
      const { cityid = 2, cityname = '上海', viewId } = this.data || {};
      const listurl = this.base64encode(`/rn_ttd/_crn_config?CRNModuleName=rn_ttd&CRNType=1&initialPage=list&allianceid=917272&sid=1954497&type=dt&id=${cityid}&name=${cityname}`);
      const detailurl = this.base64encode(`/rn_ttd/_crn_config?CRNModuleName=rn_ttd&CRNType=1&initialPage=detail&allianceid=917272&sid=1954497&id=${viewId}`);
      this.setData({
        appWakeSchemaList: `ctrip://wireless/h5?url=${listurl}&type=5`,
        appWakeSchemaDetail: `ctrip://wireless/h5?url=${detailurl}&type=5`
      })
      console.log(this.data.appWakeSchemaList)
    },
    fetchInitPageData: function() {
        wx.showLoading({title: '加载中...'});
        this.getCutOrderInfoData();
        // this.getCutPublicInfo();
        // this.getLocation(this.getSceneProduct);
    },
    fixedNumber :function(n, fixindex){
      if (isNaN(n)) return n;
      const x = 10;
      const strn = Number(n).toFixed(fixindex + x) + '';
      return Number(strn.substring(0, strn.lastIndexOf('.') + (fixindex + 1)));
    },
    ConverData:function(res){
      let { commentCount } = res;
      if (commentCount && !isNaN(commentCount)){
        if (res.commentCount >= 10000){
          res.commentCount = this.fixedNumber(commentCount / 10000, 1) + '万+';
        }
      }
      return res;
    },
    getCutOrderInfoData: function() {
        this.getCutOrderInfo()
        .then(res => {
            if (!_.isEmpty(res)) {
                res = this.ConverData(res);

                this.setData({
                    ...res,
                    curId: res.cutId ?res.cutId:this.data.curId,
                    navbarData: {
                        ...this.data.navbarData,
                        title: res.activityTitle || '任性砍5折',
                    }
                })
                if (res.startUser) {
                    // 如果是发起用户重定向到h5 发起页
                  const startUserH5 = `/webapp/ticket/promotions?ssr=false&cutid=${this.cutId}&orderid=${this.orderId}${this.fromtype ? '&fromtype=' + this.fromtype:''}`;
                    this.ctripOpenWebView(startUserH5, true);
                    wx.hideLoading();
                    return;
                }
                if (res.status === 8) {
                    this.setData({activeOver: true});
                    wx.hideLoading();
                    return;
                }
                this.sceneCode = res.sceneCode;
                res.expiredTime && this.checkRemainTime(res.expiredTime);
                this.getCutPublicInfo();
                this.getCouponList().then(res => {
                    if (!_.isEmpty(res)) { this.setData({ ...res})};
                });
                this.getLocation(this.getSceneProduct);
            } else {
                this.showErrorPage();
                wx.hideLoading();
            }
            this.prepareShema();
        })
        .catch(e => {
            wx.hideLoading();
            wx.showToast({title: e && e.head && e.head.errmsg || '网络异常，请重试～', icon: 'none'});
        })
    },
    onShareAppMessage: function (res) {
        if (res.from === 'button') {
            this.setData({showCoupon: false, canScroll: true});
            this.ubtTrace && this.ubtTrace('tkt_pageid_ticket_expo',{
                curId: this.data.curId,
                orderid: this.orderId
            });
        }
        const imageCard = this.data.miniProgramCardImg;
        const imageTitle = this.data.miniProgramCardTitle;
        const targetUrl = encodeURIComponent(`/pages/ticket/promotions/index?cutid=${this.cutId}&orderid=${this.orderId}`);
        return {
            title: imageTitle || '兄dei，帮我砍一刀！这里有红包拿，我只告诉你！快来~',
            desc: '携程订酒店机票火车票汽车票门票',
            path: `/pages/home/homepage?toUrl=${targetUrl}`,
            imageUrl: imageCard || ''
        }
    },
    // 倒计时
    checkRemainTime: function(expiredTime) {
        const starttime = new Date().getTime();
        const endtime = new Date(expiredTime.replace(/-/g, '/')).getTime();
        const totalTime = (endtime - starttime) / 1000;
        if (totalTime < 0) {
            this.setData({remainTime: ''});
            return;
        }
        this.checklastTime(Math.ceil(totalTime), this.getCutOrderInfoData);
    },
    jumpToList: function(){
      //跳转小程序附近列表
      const { cityid, cityname } = this.data;
      const jumpObject = {
        'ticket': `/pages/ticket/list/list?type=n&allianceid=${917272}&sid=${1954495}`,
      }
      // this.ubtTrace && this.ubtTrace(`tkt-${this.pageId}-bottom-button-附近热门景点-${this.cutId}`,{})
      this.jumpFunction('ticket',jumpObject)
    },
    jumpToActivity: function(){
      const { cityid,cityname } = this.data;
      const startUserH5 = `/webapp/activity/dest/dt-${cityname}-${cityid}?titlename=${cityname}&allianceid=${917272}&sid=${1954495}`;
      // this.ubtTrace && this.ubtTrace(`tkt-${this.pageId}-bottom-button-附近热门景点-${this.cutId}`,{})
      this.ctripOpenWebView(startUserH5, false,true);
    },
    jumpToHome: function() {
        // this.ubtTrace && this.ubtTrace(`tkt-${this.pageId}-bottom-button-酒店·机票·火车票-${this.cutId}`,{})
        wx.switchTab({ url: `/pages/home/homepage?allianceid=${917272}&sid=${1954495}`});
    },
    jumpToRule: function() {
        cwx.navigateTo({
            url: '/pages/ticket/web/index?data=' + encodeURIComponent(this.data.activityRule)
        })
    },
    helpFriend: function() {
        const islogin = cwx.user.isLogin();
        const self = this;
        // 帮砍价
        const cutOperate = function() {
            const { wxShareUser, lng, lat } = self.data;
            ticketmodel.BargainForCashBack.request({
                data: {
                    pageid: self.pageId,
                    cutOrderId: +self.cutId,
                    weChatOpenId: cwx.cwx_mkt && cwx.cwx_mkt.openid || '',
                    nickName: wxShareUser && wxShareUser.nickName || '',
                    avatarUrl: wxShareUser && wxShareUser.headImage || '',
                    longitude: lng || 0,
                    latitude: lat || 0
                },
                success: function(res) {
                    if (!_.isEmpty(res)) {
                        if (res.success && res.errorCode === '0') {
                            const cutAmount = res.cutAmount;
                            self.getCutOrderInfoData();
                            self.getCouponList(res.sceneCode).then(res => {
                                if (!_.isEmpty(res.promotions)) {
                                    const result = _.filter(res.promotions, (data) => {
                                        return data.promotionStatus === 1
                                    })
                                    self.setData({
                                        showCouponData: {
                                            promotions: result,
                                            cutAmount: cutAmount,
                                            showRisk: false
                                        },
                                        showCoupon: true,
                                        canScroll: false
                                    })
                                } else {
                                    self.setData({
                                        showCouponData: {
                                            promotions: [],
                                            cutAmount: cutAmount,
                                            showRisk: false
                                        },
                                        showCoupon: true,
                                        canScroll: false
                                    })
                                }
                            }).catch(e => {
                                self.setData({
                                    showCouponData: {
                                        promotions: [],
                                        cutAmount: cutAmount,
                                        showRisk: true
                                    },
                                    showCoupon: true,
                                    canScroll: false
                                })
                            })
                        } else {
                            if (res.errorCode === '1') {
                                wx.showToast({title: '该订单已取消，无法帮砍', icon: 'none'})
                                return;
                            }
                            self.setData({
                                showCouponData: {
                                    promotions: [],
                                    cutAmount: res.cutAmount,
                                    showRisk: true,
                                    customerErrorMessage: res.customerErrorMessage
                                },
                                showCoupon: true,
                                canScroll: false
                            })
                        }

                    }
                },
                fail: function(res) {
                    wx.showToast({title: '砍价失败，请稍后重试～', icon: 'none'});
                    cwx.user.auth = "";
                    cwx.user.duid = "";
                }
            })
        }
        // 登录之后的回调
        const startUserH5 = `/webapp/ticket/promotions?ssr=false&cutid=${this.cutId}&orderid=${this.orderId}${this.fromtype ? '&fromtype=' + this.fromtype:''}`;
        const loginCallBack = function() {
            self.getCutOrderInfo().then(res => {
                if (res && res.startUser) {
                    // 跳转到发起用户h5页面
                    self.ctripOpenWebView(startUserH5, true);
                } else {
                    self.getWXUserInfo(cutOperate);
                }
            })
        }
        if(!islogin){
            self.weChatLogin(loginCallBack);
        }else{
            loginCallBack();
        }
    },
    // // 授权用户信息
    // getWxSetting: function(cutOperate) {
    //     const self = this;
    //     wx.getSetting({
    //         success(res) {
    //             if (res.authSetting['scope.userInfo']) {
    //                 // 已经授权，可以直接调用 getUserInfo 获取头像昵称
    //                 self.getWXUserInfo(cutOperate);
    //             } else {
    //                 wx.openSetting({
    //                     success: function(res) {
    //                         if (res.authSetting && res.authSetting["scope.userInfo"]) {
    //                             self.getWXUserInfo(cutOperate);
    //                         } else {
    //                             wx.showToast({title: '还未授权哦～', icon: 'none'})
    //                         }
    //                     }
    //                 })
    //             }
    //         }
    //     })
    // },
    useCoupon: function(e) {
        const linkUrl = e.currentTarget.dataset.linkurl;
        // 判断是否是https 开头
        const targetUrl = linkUrl.indexOf('?') !== -1 ? linkUrl.split('?')[0] : linkUrl;
        if(linkUrl && /https/.test(targetUrl)) {
            cwx.component.cwebview({
                data: { url: encodeURIComponent(linkUrl) }
            })
            return;
        }
        cwx.navigateTo({url: linkUrl});
    },
    fakeAction:function(e){
      //用来触发button 点击action埋点的假方法
    },
    launchAppErrorToast:function(e){
      //底部去APP

    },
    launchAppError: function(e) {
        //顶部去APP发起砍价按钮 && 好会推荐去APP
        const { spotid } = e.currentTarget.dataset;
        console.log('error', e,this.data);
        const self = this;
        this.ubtTrace && this.ubtTrace(`tkt_error_msg_expose`, {
            curId: this.data.curId,
        })
    },
    launchAppProductSuccess:function(){
      //好货推荐去APP
    },
    launchAppDetailSuccess:function(){
      //顶部去APP发起砍价按钮
      // this.ubtTrace && this.ubtTrace(`tkt-${this.pageId}-concern-button-去APP发起砍价-${this.data.curId}`)
    },
    launchAppSuccess: function() {
        //底部去APP按钮
        // this.ubtTrace && this.ubtTrace(`tkt-${this.pageId}-bottom-button-去APP-${this.data.curId}`)
        this.ubtTrace && this.ubtTrace(`tkt_${this.pageId}_mask_expo`, {
            curId: this.data.curId,
            orderid: this.orderId
        })
    },
    showRecord: function() {
        this.setData({showRecord: true, canScroll: false})
    },
    hideRecord: function() {
        this.setData({showRecord: false, canScroll: true})
    },
    showCoupon: function(){
        this.setData({showCoupon: true, canScroll: false})
    },
    hideCoupon: function() {
        this.setData({showCoupon: false, canScroll: true})
    },
    goToDetail: function(e) {
        const spotId = e.currentTarget.dataset.spotid;
        // this.ubtTrace && this.ubtTrace(`tkt-${this.pageId}-concern-button-去看看-${this.cutId}`)
        wx.navigateTo({url: `/pages/ticket/detail/index?id=${spotId}&allianceid=${917272}&sid=${1954495}`})
    },
    receiveCoupon: function(e) {
        //1-可领、2-已领券可使用、3、已领券不可使用、4-已抢光、5-已过期、6-未开始
        const secretid = e.currentTarget.dataset.secretid;
        const islogin = cwx.user.isLogin();
        const self = this;
        const fetchCoupon = function() {
            ticketmodel.ReceiveCoupons.request({
                data: {
                    pageId: self.pageId,
                    promotionSecretIds: [secretid]
                },
                success: function(res){
                    const { success} = res;
                    if(success) {
                        wx.showToast({title: '领取成功',icon: 'none'});
                        (self.data.promotions || []).forEach(element => {
                            if (element.promotionSecretId === secretid) {
                                element.promotionStatus = 2;
                            }
                        });
                        // const result = _.filter(self.data.promotions, (data) => {
                        //     return data.promotionStatus === 1
                        // })
                        self.setData({
                            promotions: self.data.promotions,
                            showCouponData: {
                                ...self.data.showCouponData,
                                promotions: self.data.promotions
                            }
                        });
                    } else {
                        wx.showToast({title: '你来晚了，优惠券已领完', icon: 'none'});
                        (self.data.promotions || []).forEach(element => {
                            if (element.promotionSecretId === secretid) {
                                element.promotionStatus = 4;
                            }
                        });
                        // const result = _.filter(self.data.promotions, (data) => {
                        //     return data.promotionStatus === 1
                        // })
                        self.setData({
                            promotions: self.data.promotions,
                            showCouponData: {
                                ...self.data.showCouponData,
                                promotions: self.data.promotions
                            }
                        });
                    }
                },
                fail: function(res) {
                    wx.showToast({title: '领取失败，请重试～',icon: "none",})
                }
            })
        }
        if (!islogin) {
            this.weChatLogin(fetchCoupon)
        } else {
            fetchCoupon();
        }

    },
    // 砍价详情
    getCutOrderInfo: function() {
        const self = this;
        return new Promise((resolve, reject) => {
            ticketmodel.GetCutOrderInfo.request({
                data: {
                    cutOrderId: +this.cutId,
                    pageid: this.pageId
                },
                format: function(res) {
                    const desc = ['', '首刀', '惊喜', '返现']
                    if (res.cutDetails && res.cutDetails.length) {
                        res.cutDetails.forEach((data => {
                            data.cutDesc = desc[data.bargainType];
                            data.amount = data.amount.toFixed(2);
                        }))
                    }
                    if (!res.cutDetails) {
                        res.cutDetails = [];
                    }
                    return res
                },
                success: function(res){
                    resolve(res)
                },
                fail: function(res) {
                    const { head } = (res || {});
                    const { errcode } = (head || {});
                    if(errcode === 1010){
                      const islogin = cwx.user.isLogin();
                      !islogin && self.weChatLogin();
                      const startUserH5 = `/webapp/ticket/promotions?ssr=false&cutid=${self.cutId}&orderid=${self.orderId}${self.fromtype ? '&fromtype=' + self.fromtype : ''}`;
                      self.ctripOpenWebView(startUserH5,true);
                      wx.hideLoading();
                      return;
                    }
                    resolve({});
                }
            })
        })
    },
    // 获取轮播用户信息
    getCutPublicInfo: function() {
        ticketmodel.GetCutPublicInfo.request({
            data: {
                cutId: +this.cutId,
                pageid: this.pageId
            },
            success: function(res){
                res && this.setData({...res})
            }.bind(this)
        })
    },
    // 优惠券
    getCouponList: function(sceneCode) {
        return new Promise((resolve, reject) => {
            ticketmodel.GetPromotionByScene.request({
                data: {
                    pageid: this.pageId,
                    sceneCode: sceneCode || this.sceneCode
                },
                format: this.formatCoupon.bind(this),
                success: function(res){
                   resolve(res);
                },
                fail: function() {
                    resolve([])
                }
            })
        })
    },
    ConverSceneProduct:function(res){
      let { tabProducts=[] } = res || {};
      (tabProducts || []).forEach( tp => {
        const { products=[] } = tp || {};
        (products || []).forEach( p => {
          if (p.canCut){
            p.shemaUrl = this.getSceneProductItemShema(p.id);
          }
        })
      })
      res.tabProducts = tabProducts;
      return res;
    },
    // 好货推荐
    getSceneProduct: function() {
        const { cityid, districtid} = this.data;
        ticketmodel.GetSceneProduct.request({
            data: {
                pageid: this.pageId,
                districtId: districtid || cityid || 2,
                imageSize: "C_336_224"
            },
            success: function(res){
                res = this.ConverSceneProduct(res);
                console.log(res);
                res && this.setData({...res});
                // 计算距离顶部窗口的高度
                setTimeout(this.calculateDomOffSetTop, 450);
                setTimeout(function() {
                    wx.hideLoading();
                }, 650);
            }.bind(this),
            fail: function() {
                wx.hideLoading();
            }
        })
    },
    // 定位服务
    getLocation: function(callback) {
        const locatCityInfo = ticketstore.PosCity.get() || {};
        const selectedCityInfo = ticketstore.TicketCityInfo.get() || {};
        if (locatCityInfo.cityid && selectedCityInfo.districtid &&
            locatCityInfo.cityid === selectedCityInfo.districtid)
        {
           callback();
        } else if (selectedCityInfo && selectedCityInfo.districtid){
            // 记住上次用户选择的城市，再次打开就是上次选择的城市，直到城市信息失效再走定位
            const cityinfo = {
                cityid:  selectedCityInfo.districtid,
                cityname: selectedCityInfo.districtname
            }
            this.setData({...cityinfo});
            callback();
        } else {
            cwx.locate.startGetCtripCity((data) => {
                let geoCity = data && data.data && data.data.CityEntities || [],
                    districtid = data && data.data && data.data.DistrictId
                if (!_.isEmpty(geoCity)) {
                    const cityinfo = {
                        cityid: districtid,
                        cityname: geoCity[0].cityName
                    }
                    this.setData({...cityinfo});
                    ticketstore.PosCity.setAsync(cityinfo);
                }
                callback();
            }, locateSource)
        }

    },
    getSceneProductItemShema:function(id){
      const url = this.base64encode(`/rn_ttd/_crn_config?CRNModuleName=rn_ttd&CRNType=1&initialPage=detail&id=${id}&allianceid=${917272}&sid=${1954497}`);
      const shemaUrl = `ctrip://wireless/h5?url=${url}&type=5`;
      return shemaUrl;
    },
    formatCoupon: function(data) {
        if (data && data.promotions && data.promotions.length) {
            data.promotions.forEach((item) => {
                if (item.deductionStrategyType === 1) { // 固定立减
                    item.desc = '无门槛';
                }
                if (item.deductionStrategyType === 3) { // 阶梯
                    if (item.deductionStrategy && item.deductionStrategy.length > 1) {
                        item.desc = '最高减';
                    } else {
                        item.desc = '满'+ item.startAmount + '可用';
                    }
                }
            })
        }
        return data || [];
    },
    backtoTop: function(){
      this.setData({
        scrollTop: 0,
      });
    },
    goRecList:function(){
      // this.ubtTrace && this.ubtTrace(`tkt-${this.pageId}-mask-button-${'好货推荐'}-${this.cutId}`)
      if(!this.data.isRecommendExpose){
        this.ubtTrace && this.ubtTrace(`tkt_recommend_mask_expose`,{
            curId: this.data.curId,
          });
          this.setData({
            isRecommendExpose:true,
          })
      }
      this.setData({
        intoview: 'product-list-bottom',
      })
    },
    changeTab: function(e){
        const activeIndex = e.currentTarget.dataset.index;
        const scrollTop = activeIndex > 0 ?
            this.pageposition.position[activeIndex - 1] :
            this.pageposition.parr[activeIndex];
        this.setData({
            activeIndex: activeIndex,
            scrollTop: scrollTop - this.data.flowHeadHeight,
            tabChange: true,
            rec_list_top:0
        });
        setTimeout(() => {
            this.setData({tabChange: false});
        }, 300)
    },
    jumpToDetail: function(e){
        const { spotid, id, tabtype } = e.currentTarget.dataset;
        const urlObj = {
            'ticket': `/pages/ticket/detail/index?id=${spotid}&allianceid=${917272}&sid=${1954495}`,
            'oneDayTour': `https://m.ctrip.com/webapp/activity/dest/t${spotid}.html?allianceid=${917272}&sid=${1954495}`,
            'surrounding': `https://m.ctrip.com/webapp/vacations/tour/detail?productId=${spotid}&departCityId=${id}&allianceid=${917272}&sid=${1954495}`,
            'packageTour': `https://m.ctrip.com/webapp/vacations/tour/detail?productId=${spotid}&departCityId=${id}&allianceid=${917272}&sid=${1954495}`
        }
        this.jumpFunction(tabtype, urlObj);
    },
    showMoreTicket: function(e) {
        const tabType = e.currentTarget.dataset.tabtype;
        const { districtid = 2, districtname = "上海", cityid, cityname } = this.data;
        const urlObj = {
            'ticket': '/pages/ticket/list/list',
            'oneDayTour': `https://m.ctrip.com/webapp/activity/dest/dt-${districtname || cityname}-${districtid || cityid}`,
            'surrounding': 'https://m.ctrip.com/webapp/vacations/tour/around',
            'packageTour': 'https://m.ctrip.com/webapp/vacations/tour/index'
        }
        this.jumpFunction(tabType, urlObj);
    },
    scrollHandle: function(e) {
        if (!this.data.tabChange && this.pageposition && this.pageposition.position) {
            let key = 0;
            for (let i = 0; i< this.pageposition.position.length; i++) {
                if (e.detail.scrollTop + this.data.flowHeadHeight > this.pageposition.position[i]) {
                    key = i + 1;
                }
            }
            if (this.data.activeIndex !== key && key >= 0) {
                this.setData({activeIndex: key});
            }
            const self = this;
            const query = wx.createSelectorQuery();
            query.select('#product-list-bottom').boundingClientRect()
            query.exec(function (res) {
              if (res[0].top < 100 && !self.data.isRecommendExpose) {
                self.ubtTrace && self.ubtTrace(`tkt_recommend_mask_expose`,{
                  curId: self.data.curId,
                });
                self.setData({
                    isRecommendExpose:true,
                })
              }
              self.setData({
                rec_list_top: res[0].top,
              })
            })
        }

    },
    calculateDomOffSetTop: function() {
        const position = [];
        const query = wx.createSelectorQuery();
        _.map(this.data.tabProducts, (item) => {
            query.select('#'+item.tabType).boundingClientRect();
            query.selectViewport();
        })
        query.select('.container').boundingClientRect();
        query.select('#flowheader').boundingClientRect();
        const parr = [];
        query.exec((res) =>{
            res && res.reduce((acc,resitem, index) => {
                if (resitem && resitem.id) {
                    if (resitem.id === 'flowheader') {
                        this.setData({ flowHeadHeight: Math.floor(resitem.height)});
                    } else {
                        const curtop = resitem.top - config.Base.titleheight;
                        const scrollTop = curtop + resitem.height; // top + height
                        parr.push(Math.floor(curtop));
                        position.push(Math.floor(scrollTop));
                        acc[index] = scrollTop;
                    }
                } else if (resitem) {
                    this.setData({ scrollHeight: Math.floor(resitem.height)});
                }
                return acc;
            },{});

            this.pageposition = {
                position,
                parr
            }
            //console.log('this page position', this.pageposition)
        })
    },
    jumpFunction: function(tabType, urlObj) {
        if (tabType === 'ticket') {
            cwx.navigateTo({
                url: urlObj[tabType]
            })
        } else {
            cwx.component.cwebview({
                data: { url: encodeURIComponent(urlObj[tabType]) }
            })
        }
    },
    changeCity: function(selected) {
        if(selected && selected.type === 'n' && selected.lng && selected.lat){
            ticketstore.TicketCityInfo.removeAsync();
            this.setData({
                lng: selected.lng,
                lat: selected.lat,
                districtid: '',
                districtname: ''
            })
            return;
        }
        //如果无切换城市
        if (!selected || !selected.districtid) {
            return;
        }
        //切换城市
        const cityinfo = {
            districtid: selected.districtid,
            districtname: selected.districtname
        }
        ticketstore.TicketCityInfo.set(cityinfo);
        this.setData({...cityinfo})
        //处理历史记录
        this.handleCityHistory(selected);
        //this.calculateDomOffSetTop();
    },
    base64encode:function(input){
      var str = String(input);
      var map = charMap;
      var block = 0,
        output = '';
      var prx = [2, 4, 6, 8];
      for (var code, idx = 3 / 4, uarr;
        // 能取到字符时、block未处理完时、长度不足时
        !isNaN(code = str.charCodeAt(idx)) || 63 & block || (map = '=', (idx - 3 / 4) % 1); idx += 3 / 4) {
        if (code > 0x7F) {
          // utf8字符处理
          (uarr = encodeURI(str.charAt(idx)).split('%')).shift();
          for (var hex, idx2 = idx % 1; hex = uarr[idx2 | 0]; idx2 += 3 / 4) {
            block = block << 8 | parseInt(hex, 16);
            output += map.charAt(63 & block >> 8 - idx2 % 1 * 8);
          }
          // 修复首字符为utf8字符时出错的BUG
          idx = idx === 3 / 4 ? 0 : idx;
          // idx补偿
          idx += 3 / 4 * uarr.length % 1;
        } else {
          block = block << 8 | code;
          output += map.charAt(63 & block >> 8 - idx % 1 * 8);
        }
      }
      return output;
    },
    base64decode:function(input){
      var str = String(input),
        map = charMap.slice(0, -1),
        prx = [6, 4, 2, 0],
        output = '',
        block = 0,
        code,
        buffer = 0,
        hex = '';
      try {
        for (var i = 0; (code = map.indexOf(str[i])) > -1; i++) {
          block = block << 6 | code;
          if (i % 4) {
            buffer = 255 & block >> prx[i % 4];
            if (buffer < 128) {
              output += hex ? decodeURI(hex) : '';
              output += String.fromCharCode(buffer);
              hex = '';
            } else {
              hex += '%' + ('0' + buffer.toString(16)).slice(-2);
            }
          }
        }
        output += hex ? decodeURI(hex) : '';
        return output;
      } catch (err) {
        // console.log(err);
        throw new Error('base64 malformed!');
      }
    },
    ctripOpenWebView: function(stringUrl,needLogin = false,isNavigate=false) {
        let host = getHost();
        cwx.component.cwebview({
            data: {
                url: encodeURIComponent('https://'+ host + stringUrl),
                needLogin:needLogin,
                isNavigate:isNavigate,
            }
        });
    }

}
TPage(Object.assign(options, location, utils))
