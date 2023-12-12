import { Utils } from '../common/utils.js'
import { CPage, cwx, __global } from '../../../cwx/cwx.js'
import { FetchStatus } from '../common/constants.js'
import { getQueryBargainOrderInfo, getDoBargainInfo, getGuessLikeInfo, doShareInfo } from '../common/model.js'
import { getOpenId, getLocation, getUserInfo, checkLogin } from '../common/commonPromises.js'

CPage({
  pageId: '10650028564',
  data: {
    orderId: '',
    openId: '',
    prev_openid: '',
    phoneNumber: '',
    avatarUrl: '',
    nickName: '',
    showBargainDetail: false, // 是否展示砍价弹框
    orderInfo: {}, // 13105301
    weixinGroupInfo: {}, //13105301
    recommendList: [], // 机票列表数据
    bannerInfo: {}, // 13105301 banner
    pageStatus: FetchStatus.LOADING,
    getPhoneNumberLoading: true,
    pageErrorMsg: '没找到砍价订单哦～',
    recommendStatus: FetchStatus.LOADING,
    canIUseProfile: false,
    mobileToken: '',
    isUerLogin: false,
    isShowGroupEntry: true,
    bargainUserInfo: {}, // 13105401 bguser
    couponList: [], // 13105401 cplist
    couponMsg: '', // 13105401 msg
    couponTitle: '', // 13105401 砍价后弹窗头部文案
    shareIncentiveMsg: '', // 13105401 砍价后弹窗分享激励文案
    hasClickLocation: false,
    showLocation: '上海',
    hasHistoryBargained: false,
    showHistoryBargainedModal: false,
    isScroll: false,
    hasEndScroll: false,
    ani_top_left: null,
    ani_bottom: null,
    ani_top: null,
    ani_top_right: null,
    ani_modal_hidden: null,
    userInfoShow: false,
    numberNeeded: 0,
    anchorPoint: '',
    scrollBottom: '',
  },

  onLoad(query) {
    const { oids, prev_openid } = query
    if(prev_openid){
      this.setData({prev_openid})
    }
    var self = this
    this.ubtTrace('c_new_kanjia_show', {})
    if(wx.getUserProfile){
      this.setData({canIUseProfile: true})
    }
    var animation = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease',
      delay: 0
    });
    var next = true;
    setInterval(function(){
      if (next) {
        animation.translate(8, 8).step()
        next = !next;
       } else {
        animation.translate(0, 0).step()
        next = !next;
       }      
      this.setData({
          ani_top_left: animation.export()
      })
    }.bind(this), 400)

    var animation_bottom = wx.createAnimation({
        duration: 600,
        timingFunction: 'linear',
        delay: 400
    });
    var next2 = true;
    setInterval(function(){
        if (next2) {
          animation_bottom.scale(0.8, 1.2).step()
          next2 = !next2;
        } else {
          animation_bottom.scale(1, 1).step({duration: 150, timingFunction: 'linear', delay: 0})
          next2 = !next2;
        }      
        this.setData({
            ani_bottom: animation_bottom.export()
        })
      }.bind(this), 750)

    var animation_top = wx.createAnimation({
      duration: 600,
      timingFunction: 'linear',
      delay: 400
    });
    var next3 = true;
    setInterval(function(){
        if (next3) {
          animation_top.translateY(-8).scale(0.9, 1).step()
          next3 = !next3;
        } else {
          animation_top.translateY(0).scale(1, 1).step({duration: 150, timingFunction: 'linear', delay: 0})
          next3 = !next3;
        }      
        this.setData({
          ani_top: animation_top.export()
        })
      }.bind(this), 750)

    var animation_top_right = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease',
      delay: 0
    });
    var next4 = true;
    setInterval(function(){
      if (next4) {
        animation_top_right.translate(-6, 6).step()
        next4 = !next4;
      } else {
        animation_top_right.translate(0, 0).step()
        next4 = !next4;
      }      
      this.setData({
        ani_top_right: animation_top_right.export()
      })
    }.bind(this), 400)

    if (!oids) {
      this.setData({ pageStatus: FetchStatus.NO_RESULT, recommendStatus: FetchStatus.NO_RESULT })
    } else {
      this.setData({ isUerLogin: !!checkLogin() })
      if (checkLogin()) {
        cwx.user.getPhoneNumberByTicket(function(resCode, funtionName, errorMsg, phoneNumber) {
          console.log('phoneNumber', phoneNumber)
          if (resCode === 0) {
            self.setData({
              phoneNumber,
              getPhoneNumberLoading: false
            })
          } else {
            self.ubtTrace(122794, { msg: '请求getPhoneNumberByTicket失败' })
            self.setData({
              getPhoneNumberLoading: false
            })
          }
        })
      } else {
        self.setData({
          getPhoneNumberLoading: false
        })
      }
      getUserInfo().then(userInfo => this.setData({ avatarUrl: userInfo && userInfo.avatarUrl, nickName: userInfo && userInfo.nickName }))
      this.setData({ orderId: oids }, () => {
        getOpenId(3000).then(openId => this.setData({ openId }, this.fetchQueryBargainOrderInfo)).catch(this.fetchQueryBargainOrderInfo)
        this.fetchRecommendList()
      })
    }
  },

  onShow: function() {
    const DECIMAL = 10
    if (cwx.user.wechatcode === '') {
      cwx.user.wxLogin(function(resCode, funtionName, errorMsg) {
        if (parseInt(resCode, DECIMAL) !== 0) {
          console.error('phoneNumberHandler1 errMsg:' + errorMsg)
        }
      })
    } else {
      console.log('wechatcode存在')
    }
  },

  onPageScroll(){
    const { hasEndScroll } = this.data
    if(!hasEndScroll){
      var animation_modal_hidden = wx.createAnimation({
        duration: 200,
        timingFunction: 'linear',
        delay: 0
      });
      animation_modal_hidden.translateX('14vw').opacity(0.5).step(); 
      this.setData({
          ani_modal_hidden: animation_modal_hidden.export(),
          isScroll: true
      })
    }
  },

  handleUnPhoneVerify: function() {
    this.errorMsgShow('砍价暂不可用，请稍后再试', 3);
  },

  // 登录注册
  phoneNumberHandler: function(res) {
    if (!res || !res.detail || !res.detail.res || !res.detail.res.detail || typeof res.detail.res.detail.userAllow !== 'boolean') return;
    const { canIUseProfile } = this.data
    const self = this,
      DECIMAL = 10
    wx.getNetworkType({
      success: function(res0) {
        console.log(res0)
        if (res0 && res0.networkType !== 'none') {
          self.showLoading('手机登录中...')
          cwx.user.wechatPhoneLogin(res.detail.res.detail, '81990788', self.getCurrentPageUrl(), function(resCode, funtionName, errorMsg) {
            self.hideLoading()
            if (parseInt(resCode, DECIMAL) !== 0) {
              self.errorMsgShow(errorMsg, 3)
            }else if(canIUseProfile){
              self.setModalVisible()
            }else{
              self.getPhoneNumberByTicket()
            }
          })
        } else {
          self.errorMsgShow('网络不稳定，请稍后再试', 3)
        }
      }
    })
  },

  errorMsgShow: function(msg, _logintype, _errorElement) {
    cwx.showToast({
      title: msg,
      icon: 'none',
      duration: 3000,
      complete: function() {}
    })
  },

  showBargainModal() {
    this.setData({ showBargainDetail: true })
  },

  showLoading: function(title) {
    title = title || ''
    try {
      wx.showLoading({
        title: title,
        mask: true
      })
    } catch (err) {
      wx.showToast({
        title: title,
        icon: 'loading',
        duration: 10000,
        mask: true
      })
    }
  },
  hideLoading: function() {
    try {
      wx.hideToast()
      wx.hideLoading()
    } catch (err) {

    }
  },

  /**
    * 获取当前页不带参数的url
    */
  getCurrentPageUrl() {
    const pages = getCurrentPages(), // 获取加载的页面
      currentPage = pages[pages.length - 1], // 获取当前页面的对象
      url = currentPage.route // 当前页面url

    return url
  },

  // 判断是否是手机号登录
  getPhoneNumberByTicket: function(_res) {
    var self = this
    const { phoneNumber } = self.data
    wx.getNetworkType({
      success: function(res0) {
        if (res0 && res0.networkType !== 'none') {
          if (phoneNumber && phoneNumber.length) {
            self.fetchDoBargainInfo(phoneNumber)
          } else {
            cwx.user.getPhoneNumberByTicket(function(resCode, funtionName, errorMsg, phoneNumber) {
              if (resCode === 0) {
                self.setData({
                  phoneNumber,
                  isUerLogin: true
                })
                self.fetchDoBargainInfo(phoneNumber)
              }
            })
          }
        } else {
          self.errorMsgShow('网络不稳定，请稍后再试', 3)
        }
      }
    })
  },

  fetchDoBargainInfo(phoneNumber) {
    const { orderId, openId } = this.data
    getDoBargainInfo({ oid: orderId, openid: openId, phone: phoneNumber }).then((res) => {
      console.log('请求到的getDoBargainInfo', JSON.stringify(res))
      if (res.sr && res.sr.rt === 0) {
        this.setData({
          showBargainDetail: true,
          couponList: Helper.getCouponList(res.cplist),
          bargainUserInfo: res.bguser,
          couponMsg: res.msg,
          couponTitle: Helper.getNoteTypeText(res.ninfos, 2),
          shareIncentiveMsg: Helper.getNoteTypeText(res.ninfos, 3)
        })
      } else {
        this.errorMsgShow('砍价失败，请稍后再试', 3)
        this.setData({ couponList: [], bargainUserInfo: {}, couponMsg: '' })
      }
    })
      .catch(_e => {
        this.errorMsgShow('砍价失败，请稍后再试', 3)
        this.setData({ couponList: [], bargainUserInfo: {}, couponMsg: '' })
      })
  },

  onCloseBargainDetailModal() {
    const { avatarUrl, nickName } = this.data
    this.setData({ showBargainDetail: false })
    this.fetchQueryBargainOrderInfo(avatarUrl, nickName, true)
  },

  getUserProfile: function(e) {
    const { userInfoShow } = this.data
    if(userInfoShow){
      this.setData({
          userInfoShow: false
      })
    }
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        const avatarUrl = res.userInfo ? res.userInfo.avatarUrl : '',
          nickName = res.userInfo ? res.userInfo.nickName : ''
        this.setData({ avatarUrl, nickName })
        this.fetchQueryBargainOrderInfo(avatarUrl, nickName, true);
        this.getPhoneNumberByTicket()
      },
      fail: () => {
        this.getPhoneNumberByTicket()
      }
    })
},

getScrollBottom(){
  wx.pageScrollTo({
    scrollTop: 800, // 滚动到的位置（距离顶部 px）
    duration: 300 //滚动所需时间 如果不需要滚动过渡动画，设为0（ms）
  })
},

  // getUserInfo: function(e) {
  //   const avatarUrl = e.detail.userInfo ? e.detail.userInfo.avatarUrl : '',
  //     nickName = e.detail.userInfo ? e.detail.userInfo.nickName : ''
  //   this.setData({ userInfoShow: false, avatarUrl, nickName })
  //   this.fetchQueryBargainOrderInfo(avatarUrl, nickName, true)
  // },

  setModalVisible(){
    this.setData({
      userInfoShow: true
    })
  },

  setModalInvisible(){
    this.setData({
      userInfoShow: false
    })
    this.getPhoneNumberByTicket()
  },

  mobileTokenSeizeBind: function(res) {
    if (!res || !res.detail || !res.detail.res || !res.detail.res.detail || typeof res.detail.res.detail.userAllow !== 'boolean') return;
    var self = this
    wx.getNetworkType({
      success: function(res0) {
        if (res0 && res0.networkType !== 'none') {
          cwx.user.getMobileToken(res.detail.res.detail, function(resCode, funtionName, errorMsg, mobileToken) {
            if (resCode === 0) {
              const mToken = mobileToken
              cwx.user.getUidByMobileToken(mToken, function(resCode, funtionName, errorMsg, _mobileToken) {
                if (resCode === 0) { // 成功且已绑定
                  cwx.user.mobileTokenLogin(mToken, function(resCode, funtionName, errorMsg) {
                    if (resCode === 0) {
                      self.getPhoneNumberByTicket()
                    } else {
                      self.errorMsgShow(errorMsg, 3)
                    }
                  })
                } else if (resCode === 1) { // 成功且未绑定
                  cwx.user.mobileTokenSeizeBind(mToken, function(resCode, funtionName, errorMsg) {
                    if (resCode === 0) {
                      self.getPhoneNumberByTicket()
                    } else {
                      self.errorMsgShow(errorMsg, 3)
                    }
                  })
                } else {
                  self.errorMsgShow(errorMsg, 3)
                }
              })
            } else {
              self.errorMsgShow(errorMsg, 3)
            }
          })
        } else {
          self.errorMsgShow('网络不稳定，请稍后再试', 3)
        }
      }
    })
  },

  onShareAppMessage(_res) {
    var self = this;
    this.ubtTrace(106121, { msg: '点击分享' })
    // 上报用户分享次数
    self.fetchDoShareInfo();
    return {
      bu: 'flight',
      title: '就差你一刀了，帮我砍完你也领补贴',
      imageUrl: 'https://pic.c-ctrip.com/AssetCatalog/wx/bargainActivity/weixin_friend_share.png',
      path: `/pages/flightBargain/componentsV2/index?oids=${this.data.orderId}&prev_openid=${this.data.openId}`
    }
  },
  onShowRuleDetailsModal() {
    this.ubtTrace(106123, { msg: '点击活动规则' })
    const ruleUrl = './ruleDetail/index?ruleUrl=' + this.data.bannerInfo.ruleUrl
    cwx.navigateTo({ url: ruleUrl })
  },

  onCloseModal(){
    this.setData({
      isShowGroupEntry: false
    })
  },

  onClickEntry(){
    const jumpUrl = './groupDetail/index?groupURL=' + this.data.weixinGroupInfo.jumpURL
    cwx.navigateTo({ url: jumpUrl})
  },

  onScrollStart(){
     this.setData({
       hasEndScroll: false
     })
  },

  onScrollEnd(){
    const { isScroll } = this.data
    if(isScroll){
      setTimeout(() => {
        var animation_modal_hidden = wx.createAnimation({
          duration: 200,
          timingFunction: 'linear',
          delay: 800
        });
        animation_modal_hidden.translate(0, 0).opacity(1).step(); 
        this.setData({
          ani_modal_hidden: animation_modal_hidden.export(),
          isScroll: false,
          hasEndScroll: true
        })
      }, 200);
    }
  },

  onClickLocation() {
    var self = this
    getLocation().then(dCity => {
      self.errorMsgShow('已切换至定位地', 3)
      this.setData({
        dCity,
        showLocation: !dCity ? '上海' : dCity.cityName && dCity.cityName.length > 3 ? dCity.cityName.substr(0, 2) + '...' : dCity.cityName,
        hasClickLocation: true
      }, this.fetchRecommendList)
    }
    ).catch(() => {
      self.errorMsgShow('获取定位失败', 1.5)
    })
  },
  fetchDoShareInfo() {
    const { orderId, openId, orderInfo, avatarUrl, nickName } = this.data
    const requestParam = {
      oid: orderId,
      openid: openId,
      scount: 1
    }
    return doShareInfo(requestParam).then((res) => {
      console.log('用户分享的次数上报给服务', JSON.parse(res));
      // 分享结束刷新落地页
      // this.fetchQueryBargainOrderInfo(avatarUrl, nickName, true)
    }).catch(e => {
      console.log('fetch doshareinfo error', e);
      // 分享结束刷新落地页
      // this.fetchQueryBargainOrderInfo(avatarUrl, nickName, true)
    })
  },
  fetchQueryBargainOrderInfo(avatarUrl, nickName, isAfterDoBargain) {
    console.log("avatarUrl: " + avatarUrl + " nickName: " + nickName + " isAfter: " + isAfterDoBargain)
    const { orderId, openId, prev_openid } = this.data,
      requestParam = isAfterDoBargain
        ? {
          oid: orderId,
          openid: openId,
          name: nickName && nickName.length ? nickName : '匿名用户',
          icon: avatarUrl && avatarUrl.length ? avatarUrl : 'https://pic.c-ctrip.com/AssetCatalog/wx/bargainActivity/user_icon.png',
          qtype: 1
        } : {
          oid: orderId,
          openid: openId,
          sopenid: prev_openid
        }
    console.log('request param is ' + JSON.stringify(requestParam))
    return getQueryBargainOrderInfo(requestParam).then((res) => {
      console.log('请求到的getQueryBargainOrderInfo', JSON.stringify(res))
      if (res.sr && res.sr.rt === 0) {
        this.setData({
          pageStatus: FetchStatus.OK,
          orderStatus: res.bgorder.status || 1,
          orderInfo: Helper.processOrderInfo(res, openId),
          bannerInfo: Helper.getBannerInfo(res),
          weixinGroupInfo: Helper.getGroupInfo(res),
          numberNeeded: 4 * Math.ceil(res.bguserlist.length / 4) + 1 - res.bguserlist.length,
          anchorPoint: 'id' + (4 * Math.floor((res.bguserlist.length - 1) / 4))
        })
        const bargainTraceMsg = res.bgorder.status === 2 && !res.hasbgd ? 'bargain' : res.bgorder.status === 2 && res.hasbgd ? 'share' : 'nobargain'
        this.ubtTrace(106124, { msg: bargainTraceMsg })
      } else {
        const showNoResult = res.sr &&
                (
                  res.sr.errcode === '501' ||
                res.sr.errcode === 501 ||
                res.sr.errcode === '8' ||
                res.sr.errcode === 8 ||
                res.sr.errcode === '2' ||
                res.sr.errcode === 2),
          updateErrorMsg = res.sr &&
                (
                  res.sr.errcode === '8' ||
                res.sr.errcode === 8 ||
                res.sr.errcode === '2' ||
                res.sr.errcode === 2)
        this.setData({
          pageStatus: showNoResult ? FetchStatus.NO_RESULT : FetchStatus.ERROR,
          pageErrorMsg: updateErrorMsg ? res.sr.errmsg : '没找到砍价订单哦～',
          orderInfo: {},
          bannerInfo: {}
        })
      }
    }).catch(e => {
      this.setData({ pageStatus: FetchStatus.ERROR })
      console.log('fetch order info failed, the error is:', e)
    })
  },
  fetchRecommendList() {
    const cityCode = this.data.dCity && this.data.dCity.cityCode ? this.data.dCity.cityCode : 'SHA'
    console.log('请求fetchRecommendList', cityCode)

    return getGuessLikeInfo({
      DCityCode: cityCode,
      TripType: 1,
      Channel: 'bargain'
    }).then(({ routeList = [] }) => {
      if (routeList.length === 0) {
        this.setData({ recommendStatus: FetchStatus.NO_RESULT, recommendList: [] })
      } else {
        this.setData({ recommendStatus: FetchStatus.OK, recommendList: Helper.processRmdList(routeList) })
      }
    }).catch(e => {
      this.setData({ recommendStatus: FetchStatus.NO_RESULT, recommendList: [] })
      console.log('fetch recommend list failed, the error is:', e)
    })
  },
  showHistoryBargained() {
    this.setData({ hasHistoryBargained: true, showHistoryBargainedModal: true })
  },
  closeHistoryBargainedModal() {
    this.setData({ showHistoryBargainedModal: false })
  },
  logTrace(evt) {
    const { code, value } = evt.detail
    this.ubtTrace(code, value)
  }
})

const Helper = {
  // 处理主卡片数据
  processOrderInfo(res, openId) {
    var self = this
    if (!res) return {}
    const btnlist = self.getButton(res),
      totalBarrageNum = res.bgconfig.retcnt || 1,
      hasBarrageNum = res.bgorder.num || 0,
      needBarrageNum = Number(((totalBarrageNum - hasBarrageNum) * 100 / totalBarrageNum).toFixed()) || 0,
      bigAmountLeft = res.bgconfig.ctlist.filter(item => item > hasBarrageNum),
      bigAmountNum = bigAmountLeft[0] - hasBarrageNum,
      bargainedPrice = res.bgorder.bgdprice || 0,
      maxPrice = Math.ceil(res.bgorder.mxbgprice) || 0,
      // const canReturnCash = res.bgorder.canretcash || false;
      // 原来是通过是否可返现来判断AB版进度条，由于订单状态发生改变后，可返现参数服务会配置成false，所以改为通过已砍刀数和配置的返现数量来判断进度条展示
      canReturnCash = hasBarrageNum >= totalBarrageNum || false
    let progress = 0
    if (canReturnCash) {
      // 可返现，走B版价格维度进度条
      progress = this.getProgress(maxPrice, bargainedPrice)
    } else {
      progress = Math.ceil(hasBarrageNum / totalBarrageNum * 100)
    }

    const orderInfo = {
      // 砍多少刀能提现（配置）
      totalBarrageNum,
      // 已砍次数
      hasBarrageNum,
      // 距离可提现还差多少刀
      needBarrageNum,
      // 距离大金额还差多少刀
      bigAmountNum,
      // 已砍金额
      bargainedPrice,
      // 剩余可砍金额
      leftBargainedPrice: res.bgorder.lbgprice || 0,
      // 最大可砍金额
      maxPrice,
      // 暴击刀位置（配置）
      critList: self.getCritList(res, canReturnCash),
      // 进度条位置
      progress,
      // 好友助力榜
      // gloryList: self.getGloryList(res.bguserlist, openId) || {},
      gloryList: {},
      // 按钮
      buttonText: btnlist.buttonText,
      //按钮文案第二行
      buttonTextLittle: btnlist.buttonTextLittle,
      buttonType: btnlist.buttonType,
      historyBargainText: btnlist.historyBargainText,
      historyBargainTextLittle: btnlist.historyBargainTextLittle,
      imageUrl: btnlist.imageUrl,
      // 当前用户是否砍过
      hasBargained: res.hasbgd || false,
      // 是否可提现
      canReturnCash,
      // 优惠券列表
      couponList: Helper.getCouponList(res.cplist),
      // 优惠券提示语
      couponMsg: res.msg || '',
      // 在配置时间内是否有历史的砍价记录
      hashtybgd: res.hashtybgd || false,
      // 有历史砍价数据时的拦截提示
      icptipList: res.icptip.split('|'),
      // 弹幕
      brglist: res.brglist,
      //   额外砍价状态
      //0:用户未砍价|用户有历史砍价记录无法砍价，1. 用户砍过改订单，分享为0， 2， 用户分享次数 > 0 但不满足额外刀条件 3:允许砍额外刀，4:砍过额外刀
      extstatus: res.extstatus,
      // 额外刀开关
      extswitch: res.bgconfig.extswitch || false,
      // 用户分享数量
      scount: res.scount,
      extTip : this.getExtraTip(Helper.getNoteTypeText(res.ninfos, 1)),
      //砍价用户名单
      bguserlist: res.bguserlist,
      //进度条是否可滑动
      canScroll: (res.flag & 1) === 1 ? true : false,
      isBlackList: (res.flag & 2) === 2 ? true : false,
      isPhoneVerify: (res.flag & 4) === 4 ? true : false, // 是否支持手机号验证开关
      phoneDataVerifyData: {
        sourceKey: '1693896678378962944',
        disableLoading: true,
        limitFrequency: false,
      }
    }

    console.log('orderInfo', orderInfo)

    return orderInfo
  },

  getExtraTip(str) {
    if (!str) {
      return null;
    }
    let extTipFront = '';
    let extTipHighLight = '';
    let extTipEnd = '';
    const arr1 = str.split('[');
    extTipFront = arr1[0];
    if (arr1[1]) {
      const arr2 = arr1[1].split(']');
      extTipHighLight = arr2[0];
      extTipEnd = arr2[1] || '';
    }
    return {
      extTipFront,
      extTipHighLight,
      extTipEnd
    }
  },

  getBannerInfo(res) {
    return {
      banner: res.bgconfig.bgurl || '',
      ruleUrl: res.bgconfig.rurl || '',
      startTime: res.bgorder.start || '',
      duration: res.bgorder.duration || 0
    }
  },

  getGroupInfo(res) {
    if(res && res.atinfos && res.atinfos.length){
      let normalText = '';
      let highlightText = '';
      let mainTitle = res && res.atinfos && res.atinfos[0].mtitle
      normalText = mainTitle.split('[')[0]
      highlightText = mainTitle.split('[')[1].replace(']', '')
      return {
        normalText: normalText,
        highlightText: highlightText,
        subTitle: res.atinfos[0].stitle || '',
        buttonText: res.atinfos[0].button || '',
        jumpURL: res.atinfos[0].jurl || ''
      }
    }
    return {}
  },

  // 处理暴击刀位置/进度条
  getCritList(res, canReturnCash) {
    var self = this
    const critList = [],
      totalBarrageNum = res.bgconfig.retcnt || 0,
      bargainedPrice = parseInt(res.bgorder.bgdprice) || 0,
      currentNum = res.bgorder.num || 0,
      maxPrice = Math.ceil(res.bgorder.mxbgprice) || 0
    // 暴击刀位置
    let ctlist = res.bgconfig.ctlist || []
    if (canReturnCash) {
      ctlist = res.bgconfig.ctlist.filter(item => item >= totalBarrageNum)
    }
    ctlist.forEach(item => {
      const listItem = res.bguserlist.find(listItem => listItem.index === item),
        price = (listItem && listItem.bgprice) || 0,
        dPrice = (listItem && listItem.bgdprice) || 0,
        isCrited = currentNum >= item

      if (canReturnCash) {
        const targetPrice = (item - currentNum) * 1 + bargainedPrice
        let critPosition = self.getProgress(maxPrice, targetPrice)
        if (isCrited) {
          critPosition = self.getProgress(maxPrice, dPrice)
        }
        critList.push({
          isCrited,
          number: item,
          price,
          position: critPosition
        })
      } else {
        critList.push({
          isCrited,
          number: item,
          price,
          position: Math.ceil(item / totalBarrageNum * 100)
        })
      }
    })

    return critList
  },

  // 处理进度条通用方法
  getProgress(maxPrice, bargainedPrice) {
    let progressLength = 0
    const lengthQuarter = 25,
      lengthHalf = 50,
      quarter = Math.ceil(maxPrice / 4),
      half = Math.ceil(maxPrice / 2)

    if (bargainedPrice <= quarter && bargainedPrice > 0) {
      // 已砍金额小于可砍金额的四分之一
      progressLength = Math.ceil((bargainedPrice / quarter) * lengthHalf)
    } else if (bargainedPrice > quarter && bargainedPrice <= (quarter * 2)) {
      // 已砍金额大于四分之一，小于二分之一
      progressLength = Math.ceil((bargainedPrice - quarter) / quarter * lengthQuarter) + lengthHalf
    } else {
      progressLength = Math.ceil((bargainedPrice - half) / half * lengthQuarter) + lengthHalf + lengthQuarter
    }

    return progressLength
  },

  // 处理砍价按钮
  getButton(res) {
    const btnlist = res.bgconfig.btnlist
    // 额外刀开关
    const extswitch = res.bgconfig.extswitch || false
    let buttonText = ''
    let imageUrl = ''
    let buttonType = ''
    let buttonTextLittle = ''
    if (!extswitch) {
      // 额外砍一刀开关关闭保持原来逻辑不变
      buttonText = this.getButtonText(btnlist, 1) || '砍一刀，有券拿'
      imageUrl = '//pic.c-ctrip.com/AssetCatalog/wx/bargainActivity/bargain_button_bg.png'  
      buttonType = 'bargain'
      buttonTextLittle = this.getButtonTextLittle(btnlist, 1)
      // 已砍过，展示分享按钮
      if (res.bgorder.status === 2 && res.hasbgd) {
        buttonText = this.getButtonText(btnlist, 2) || '逛逛低价机票'
        imageUrl = '//pic.c-ctrip.com/AssetCatalog/wx/bargainActivity/bargain_button_bg.png'
        buttonType = ''
        buttonTextLittle = this.getButtonTextLittle(btnlist, 2)
      }
    } else {
      // 额外砍一刀开关打开
      switch (res.extstatus) {
        case 0:
          if (!res.hasbgd) {
            buttonText = this.getButtonText(btnlist, 1) || '砍一刀，有券拿';
            buttonType = 'bargain'
            buttonTextLittle = this.getButtonTextLittle(btnlist, 1)
          }
          break;
        case 2:
          buttonText = this.getButtonText(btnlist, 4);
          buttonTextLittle = this.getButtonTextLittle(btnlist, 4);
          buttonType = ''
          break;
        case 1:
          buttonText = this.getButtonText(btnlist, 5);
          buttonTextLittle = this.getButtonTextLittle(btnlist, 5);
          buttonType = ''
          break;
        case 3:
          buttonText = this.getButtonText(btnlist, 6);
          buttonTextLittle = this.getButtonTextLittle(btnlist, 6);
          buttonType = 'bargain'
          break;
      }
      imageUrl = '//pic.c-ctrip.com/AssetCatalog/wx/bargainActivity/bargain_button_bg.png'
      // 已砍过，展示分享按钮
      if (res.bgorder.status === 2 && res.extstatus === 4) {
        buttonText = this.getButtonText(btnlist, 2) || '邀好友砍价'
        imageUrl = '//pic.c-ctrip.com/AssetCatalog/wx/bargainActivity/bargain_button_bg.png'
        buttonType = ''
        buttonTextLittle = this.getButtonTextLittle(btnlist, 2);
      }
    }
    
    // 砍价结束、已返现
    if (res.bgorder.status === 3 || res.bgorder.status === 4 || res.bgorder.status === 5) {
      buttonText = '砍价已结束'
      imageUrl = '//pic.c-ctrip.com/AssetCatalog/wx/bargainActivity/button_disable.png'
      buttonType = ''
      buttonTextLittle = '';
    }
    const historyBargainText = this.getButtonText(btnlist, 2) || '邀好友砍价'
    const historyBargainTextLittle = this.getButtonTextLittle(btnlist, 2)

    return {
      buttonText,
      buttonType,
      historyBargainText,
      buttonTextLittle,
      imageUrl,
      historyBargainTextLittle
    }
  },

  // 处理砍价按钮文案
  getButtonText(btnlist, type) {
    const btnInfo = btnlist.find(item => item.btntype === type)
    if (btnInfo && btnInfo.btntext) {
      return btnInfo.btntext.split('/')[0];
    }

    return null
  },

  // 处理砍价按钮文案第二行
  getButtonTextLittle(btnlist, type) {
    const btnInfo = btnlist.find(item => item.btntype === type)
    if (btnInfo && btnInfo.btntext) {
      return btnInfo.btntext.split('/')[1] || '';
    }

    return null
  },

  // 处理助力榜：砍价金额从高到低降序，本人需要置顶处理
  getGloryList(bguserlist, openId) {
    if (!bguserlist) return []
    let temp = Object.assign([], bguserlist)
    const topList = temp.filter(item => item.openid === openId),
      sortList = temp.sort((next, prev) => {
        return prev.bgprice - next.bgprice
      })

    return {
      topList,
      sortList
    }
  },

  // 机票列表数据
  processRmdList(routeList) {
    return (routeList.length && routeList.map((item) => {
      const flightRate = item.rate * 10,
        showLittleText = !!(item.departure.cityName.length >= 3 && item.arrival.cityName.length >= 3)

      return ({
        showDCityName: item.departure.cityName.length > 3 ? item.departure.cityName.substr(0, 2) + '...' : item.departure.cityName,
        dCityName: item.departure.cityName,
        dCityCode: item.departure.cityCode,
        dCityType: item.departure.cityType,
        showACityName: item.arrival.cityName.length > 3 ? item.arrival.cityName.substr(0, 2) + '...' : item.arrival.cityName,
        aCityName: item.arrival.cityName,
        aCityCode: item.arrival.cityCode,
        aCityType: item.arrival.cityType,
        jumpH5Url: item.jumpH5Url,
        rate: item.rate ? flightRate.toFixed(1) + '折' : '',
        lowPrice: item.lowPrice,
        departDate: item.departDate,
        dDate: item.departDate.substr(5, 5) + '去',
        showLittleText
      })
    })) || []
  },

  // 处理优惠券数据
  getCouponList(couponList) {
    return (couponList && couponList.length && couponList.map((item) => {
      return {
        ...item,
        effect: '有效期至' + item.effect.substr(0, 10).split('-').join('.')
      }
    })) || []
  },

  // 唤醒app失败，跳转小程序列表页
  constructJumpUrl(info) {
    const { dCityCode, dCityName, dCityType, aCityCode, aCityType, aCityName, departDate } = info,
      prefix = 'https://m.ctrip.com/webapp/flightactivity/muse/cityListPage.html?',
      suffix = '&popup=close&autoawaken=close',
      urlObj = {
        tripDays: [2, 15],
        showTripDays: false,
        dCities: [{ name: dCityName, code: dCityCode, stype: dCityType, type: 4 }],
        aCities: [{ name: aCityName, code: aCityCode, stype: aCityType, type: 4 }],
        departDateRange: [Utils.parseDate(departDate), Utils.parseDate(departDate)]
      }

    return encodeURIComponent(prefix + Utils.obj2params(urlObj) + suffix)
  },
  
  // 获取配置文案
  getNoteTypeText(noteList, noteType) {
    const noteItem = (noteList || []).find(item => item.ntype === noteType);
    return noteItem && noteItem.cont || '';
  }
}
