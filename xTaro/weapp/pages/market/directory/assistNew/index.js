import { cwx, CPage, _ } from "../../../../cwx/cwx";
import { timerToUTC, getDaysBetween, numberGetFloat, toTimeStamp } from "../../common/utils"
import { checkIsFromTask } from '../components/countDown/utils'
const UTILS = require('../../common/utils.js');
const model = require('./model.js');

// 弹窗类型
const MODAL_TYPE = {
  assistSuccess: 'assistSuccess', // 助力成功
  rule: 'rule', // 活动规则
  masterStartAssistFail: 'masterStartAssistFail' // 主态发起活动的反馈
}

const defaultConfig = {
  headImage: 'https://pages.c-ctrip.com/union/Richard/defaultimage.png', // 默认头像
  nickName: '携程用户',
  assistTempIds: ['7KFUTObo43RjjzQV7QT6CS2dAC0bwOwC9dnTOxqqwSw','2E1ELYo4Z5znqwutTUMh1EP4YHB7HNvYynuoSpUlFjk'],
  QRMiddleImg: 'https://images3.c-ctrip.com/marketing/2019/08/xcx_deductAmount/ctripLogo.png', // B码中间图【QR_MIDDLE_IMG】
}

CPage({
  pageId: '10650061110',
  ubtCode: 193800,
  keyname: 'mkt_newAssistActivity',
  assistTempIdsStatus: false, // 订阅状态
  checkPerformance: true,  
  data: {
    activityMode:'3',//1老版2澳门
    activityId: '', // 助力活动id
    assistActivityId: '', // 助力组件id
    identityId: '', // 身份标识
    channel: '', // 渠道

    userInfo: null, // 个人信息
    masterInfo: null, // 主人信息
    showShare: false, // 是否展示分享浮层
    prizeType: 0, // 主态奖品类型 1 优惠券 2.实体商品
    masterRenderData: { // 主态下助力文案
      title: '',
      btns: []
    },
    prizeModalRenderData: { // 客态助力弹窗渲染数据
      title: '',
      subTitle: '',
      btns: []
    },
    masterStartAssistFail: { // 主态重新发起活动的弹窗
      title: '',
      content: [],
      showClose:false,
      btnType:''
    },
    modalType: '', // 弹窗类型
    activityConfig: null, // 助力活动信息
    activityConf: null, // 助力组件展示信息
    activityCustomfields: null,
    remainTime: null,
    ruleExpand: true, // 使用规则展开
    ruleHeight: 0, // 使用规则的高
    ruleHeightLimit: 0, // 使用规则高度限制
    activityStatus: {isMaster:true}, // 活动的各种状态
    // 奖品相关
    assistCouponList: [], // 客态助力奖品
    couponList: [], // 主态奖品
    receivePhone: '', //奖品发放至
    receivedNum: 0, // 奖品领取数量
    isShowGetBtn: false
  },
  onLoad: async function(options) {
    checkIsFromTask(this)
    
    // 助力组件加载成功的promise
    this.getAssistInfoPromise = new Promise((resolve) => {
      this.getAssistInfoResolve = resolve
    })

    // 处理url参数
    const { activityId, identityId, channel, assistActivityId } = options
    this.setData({
      activityId,
      identityId,
      assistActivityId,
      channel
    })

    await this.initPage()
    const { activityProcess } = this.data.activityStatus
    if (activityProcess == 1) {
      UTILS.showToast('活动还未开始哦~')
    }
   
    await this.usedDeductList(); // 获取弹幕素材

    // 埋点
    const { isMaster } = this.data.activityStatus
    if (isMaster) {
      this.logTrace('masterLoad', {
        actionMsg: '主态页PV'
      })
    } else {
      this.logTrace('guestLoad', {
        actionMsg: '客态页PV'
      })
    }
    // 添加广告埋点曝光
    this.addShowTrackObserve(['.market-assist-new__recommend', '.market-assist-new__area'], this.adShowTrack)

    wx.hideShareMenu();
    // TODO
    // if (options.loginToken) {
    //   cwx.dynamicLogin.subscribe((success) => {
    //     //同步app登录态
    //     this.fetchActivity()
    //     this.checkLogin()
    //   })
    // } else {
    //   this.fetchActivity()
    //   this.checkLogin()
    // }

  },
  onReady(){
    // 延迟获取设置规则的高度
    setTimeout(()=>{
      this.getRuleHeight()
    },1000) 
  },

  onUnload() {
    this.removeShowTrackObserve()
  },

  async initPage() {
    // 拉取活动配置信息
    await this.getActivityConfig()
    // 获取各种状态
    await this.getOpenHomePage()
    // 客人态:获取助力组件信息, 主客态都使用组件接口的
    await this.getActivityConf()
    // 获取奖品
    await this.getAwardInfo()
    // 设置倒计时
    await this.setCountDown()
    // 等待助力组件加载成功,回调
    await this.getAssistInfoPromise
    // 展示各种状态
    this.showBtnsByStatus()
    // 注册用户信息uid
    this.updateUserInfo()
    
    // 埋点
    this.devTrace('page initPage AppData', {
      actionMsg: '页面init之后data',
      result: {
        activityStatus:this.data.activityStatus,
        assistTempIdsStatus: this.assistTempIdsStatus
      }
    })
  },
  

  /** 获取活动配置 */
  async getActivityConfig() {
    const { activityId } = this.data
    const res = await model.api.getActivityConfig({
      activityId
    })
    if (res.errcode == 0) {
      let { activitlyConfig, activityCustomfields } = res
      activitlyConfig.activityRule = activitlyConfig.activityRule.split('|')
      this.setData({
        activityConfig: activitlyConfig,
        activityCustomfields: resolveCustomfields(activityCustomfields)
      })
     
      if(activityCustomfields.informWhenUndone && JSON.parse(activityCustomfields.informWhenUndone) && JSON.parse(activityCustomfields.informWhenUndone).inform=="true"){
        //72h未助力成功订阅
        defaultConfig.assistTempIds=['7KFUTObo43RjjzQV7QT6CS2dAC0bwOwC9dnTOxqqwSw','BsQ-j76DZe4wkyVw-3qnZ-U2qwGCH9ugw-xyuBIwbXs','2E1ELYo4Z5znqwutTUMh1EP4YHB7HNvYynuoSpUlFjk']
      }
      this.getUserSubscribeStatus()
      setPageTitle(activityCustomfields.pageTitle)
      this.devTrace('getActivityConfig', {
        actionMsg: 'fetchAcvityConfig success'
      })
    } else {
      this.devTrace('getActivityConfig', {
        actionMsg: 'fetchAcvityConfig error',
        result: res.errmsg
      })
    }
  },

  // 获取各种状态
  async getOpenHomePage() {
    const { activityId, identityId } = this.data
    const res = await model.api.openHomePage({
      activityId,
      identityId
    })
    if (res.errCode == 0) {
      this.setData({
        activityStatus: {
          ...this.data.activityStatus,
          ...res.activityStatus,
        },
        receivePhone: res.phone
      })
      // 主人态 无身份id,需要获取正在进行的身份id
      if (!identityId && res.activityStatus.isMaster) {
        this.setData({
          identityId: res.identityId
        })
      }
      this.devTrace('openHomePage', {
        actionMsg: 'fetch openHomePage success',
        result: this.data?.activityStatus
      })
    } else {
      this.devTrace('openHomePage', {
        actionMsg: 'fetch openHomePage fail',
        result: res?.errMsg
      })
    }
  },

  // 根据各种状态展示动态信息
  showBtnsByStatus() {
    const { prizeType } = this.data
    const { activityProcess, isLogin, receiveResult, getIdentity, completeAssist, canStartAssist, haveStock, needNum } = this.data.activityStatus
    let { customerBrowseButtonText, customerBrowseButtonImg, customerJoinButtonImg, customerAssistButtonImg,isBatch,canAssistNum } = this.data.activityConf || {}
    let { btnInvite: masterInviteButtonText, btnInviteImg: masterInviteButtonImg } = this.data.activityCustomfields
    if (activityProcess == '1') {
      //  未开始
      if (!isLogin) {
        this.setData({
          'masterRenderData.title': `邀请${needNum}位好友助力 即可领取`,
          'masterRenderData.btns': [{
            type: 'login',
            text: '登录参与',
            bg: masterInviteButtonImg
          }]
        })
      } else {
        this.setData({
          'masterRenderData.title': `邀请${needNum}位好友助力 即可领取`,
          'masterRenderData.btns': [{
            type: 'startAssist',
            text: masterInviteButtonText,
            bg: masterInviteButtonImg
          }]
        })
      }
    } else if (activityProcess == '3') {
      // 活动已结束
      if (!isLogin) {
        // 未登录,活动已结束
        this.setData({
          'masterRenderData.title': '您来晚了,活动已结束',
          'masterRenderData.btns': [{
            type: 'login',
            text: '查看我的奖励',
            bg: customerBrowseButtonImg
          }]
        })
      } else if (!getIdentity) {
        // 没有发起过活动
        this.setData({
          'masterRenderData.title': '您来晚了，活动已结束',
          'masterRenderData.btns': [{
            type: 'more',
            text: customerBrowseButtonText,
            bg: customerBrowseButtonImg
          }]
        })
      } else if (!completeAssist) {
        // 助力未满
        this.setData({
          'masterRenderData.title': '活动已结束！很遗憾您未获得奖励',
          'masterRenderData.btns': [{
            type: 'more',
            text: customerBrowseButtonText,
            bg: customerBrowseButtonImg
          }]
        })
      } else if (receiveResult == 1) {
        // 奖励发放成功
        if (prizeType == 2) {
          // 实物
          this.setData({
            'masterRenderData.title': `活动已结束！恭喜您已获得奖励`,
            'isShowGetBtn': true,
            'masterRenderData.btns': [{
              type: 'more',
              text: customerBrowseButtonText,
              bg: customerJoinButtonImg
            }, {
              type: 'address',
              text: '领取奖励',
              bg: customerAssistButtonImg
            }]
          })
        } else {
          // 已获得奖励,活动已结束
          this.setData({
            'masterRenderData.title': '活动已结束！恭喜您已获得奖励',
            'isShowGetBtn': true,
            'masterRenderData.btns': [{
              type: 'more',
              text: customerBrowseButtonText,
              bg: customerBrowseButtonImg
            }]
          })
        }
      } else if(receiveResult == 4) {
        // 奖励发放中
        this.setData({
          'masterRenderData.title': `活动已结束！稍等，奖励发放中`,
          'masterRenderData.btns': [{
            type: 'void',
            text: '奖励发放中',
            bg: customerBrowseButtonImg
          }]
        })
      }  else {
        // 未获得奖励, 活动已结束
        this.setData({
          'masterRenderData.title': '活动已结束！很遗憾您未获得奖励',
          'masterRenderData.btns': [{
            type: 'more',
            text: customerBrowseButtonText,
            bg: customerBrowseButtonImg
          }]
        })
      }
    } else {
      // 进行中
      if (!isLogin) {
        this.setData({
          'masterRenderData.title': `邀请${needNum}位好友助力 即可领取`,
          'masterRenderData.btns': [{
            type: 'login',
            text: '登录参与',
            bg: masterInviteButtonImg
          }]
        })
      } else {
        if (getIdentity) {
          // 发起过
          if (completeAssist) {
            // 助力已满

            if (receiveResult == 1) {
              // 奖励已经发放
              if (prizeType == 2) {
                // 实物
                this.setData({
                  'masterRenderData.title': `恭喜!您已获得奖励`,
                  'isShowGetBtn': true,
                  'masterRenderData.btns': [{
                    type: 'shareActivity',
                    text: '分享活动',
                    bg: customerJoinButtonImg
                  }, {
                    type: 'address',
                    text: '领取奖励',
                    bg: customerAssistButtonImg
                  }]
                })
              } else if (isBatch) {
                // 可继续发起助力
                this.setData({
                  'masterRenderData.title': `恭喜您已获得奖励`,
                  'isShowGetBtn': true,
                  'masterRenderData.btns': [{
                    type: 'startAssist',
                    text: '再领一张',
                    bg: masterInviteButtonImg
                  }]
                })
              } else {
                this.setData({
                  'masterRenderData.title': `恭喜您已获得奖励`,
                  'isShowGetBtn': true,
                  'masterRenderData.btns': [{
                    type: 'shareActivity',
                    text: '分享活动',
                    bg: masterInviteButtonImg
                  }]
                })
              }
            } else if (receiveResult == 2) {
              // 库存原因
              this.setData({
                'masterRenderData.title': `很遗憾，奖励发放失败`,
                'masterRenderData.btns': [{
                  type: 'more',
                  text: customerBrowseButtonText,
                  bg: customerBrowseButtonImg
                }]
              })
            } else if (receiveResult == 4) {
              // 奖励发放中
              this.setData({
                'masterRenderData.title': `稍等，奖励发放中`,
                'masterRenderData.btns': [{
                  type: 'void',
                  text: '奖励发放中',
                  bg: customerBrowseButtonImg
                }]
              })
            } else {
              // 奖励发放失败
              this.setData({
                'masterRenderData.title': `很遗憾，奖励发放失败`,
                'masterRenderData.btns': [{
                  type: 'more',
                  text: customerBrowseButtonText,
                  bg: customerBrowseButtonImg
                }]
              })
            }
          } else {
            //  助力未满 此时一定有额度
            this.setData({
              'masterRenderData.title': `邀请${needNum}位好友助力 即可领取`,
              'masterRenderData.btns': [{
                type: 'assist',
                text: masterInviteButtonText,
                bg: masterInviteButtonImg
              }]
            })
          }
        } else {
          // 未发起过
          if (haveStock) {
            // 发起人有额度
            this.setData({
              'masterRenderData.title': `邀请${needNum}位好友助力 即可领取`,
              'masterRenderData.btns': [{
                type: 'startAssist',
                text: masterInviteButtonText,
                bg: masterInviteButtonImg
              }],
            })
          } else {
            this.setData({
              'masterRenderData.title': `太火爆了，今日限量已抢完，明天再来吧~`,
              'masterRenderData.btns': [{
                type: 'more',
                text: customerBrowseButtonText,
                bg: customerBrowseButtonImg
              }]
            })
          }
        }

      }
    }
  },

  // 点击邀请按钮 或 助力按钮
  handleClickInvite(e) {
    const { type } = e.target.dataset
    const { activityProcess } = this.data.activityStatus
    if (activityProcess == 1) {
      // 未开始
      UTILS.showToast('活动还未开始哦~')
    } else if (activityProcess == 2) {
      this.shareType = type // 点击分享弹窗时使用,判断生成的路径
      // 进行中 主人态进入这里一定是成功,或者未发起
      if (type == 'assist') {
        // 分享助力
        this.triggerShare()
      }
      if (type == 'startAssist') {
        // 发起助力接口 gogogo!
        this.startAssist()
      }
      if (type == 'shareActivity') {
        // 只分享活动
        this.triggerShare()
      }
    } else {
      // 已结束 不会进入此按钮
    }
    this.devTrace('handleClickInvite', {
      actionMsg: '点击邀请按钮 或 助力按钮',
      type: 'click',
      btnType: type
    })
    this.setUserProfile()
  },

  // 发起助力
  async startAssist() {
    // 未订阅 先订阅 成功失败都不影响流程
    if (!this.assistTempIdsStatus) {
      const status = await this.asyncWxSubMsg()
      if (status) {
        model.api.subscribeTemplate({
          openId: cwx.cwx_mkt.openid,
          templateIds: defaultConfig.assistTempIds
        })
      }
      this.assistTempIdsStatus=status

      this.devTrace('asyncWxSubMsg', {
        actionMsg: '用户是否订阅',
        status
      })
    }
    const { activityId } = this.data
    const res = await model.api.startAssist({
      activityId,
      openId: cwx.cwx_mkt.openid
    })
    this.logTrace('startAssist', {
      type: 'click',
      actionMsg: '点击发起助力活动',
      result: res
    })
    let { errCode, errMsg, identityId } = res
    const { completeAssist } = this.data.activityStatus
    const { dailyStartAssistTime="" } = this.data.activityCustomfields||{}
    /**
     * 29 库存不足
     * 30 没有完成上次助力
     * 31 没有领取奖励
     * 10 腾讯风控
     * 11 携程风控
     * 36 未实名
     * 37 实名不符合要求
     * 35 其他原因不可领
     * 39 没到每日发起助力时间
     * 33 没有发起次数
     * 34 之前领的券仍然可用
     */
    if (errCode == 0) {
      // 有库存且通过风控校验, 弹出分享浮层
      this.setData({
        identityId,
        'activityStatus.getIdentity': true // 因为助力组价不刷新,需要手动更新这个是否发起过的值
      })
      
      if (completeAssist) {
        // 重新发起 再领一张
        this.reloadToAct()
      } else {
        await this.initPage()
        this.triggerShare();
      }
    } else if (errCode == 29) {
      // 无库存 页面展示无库存 弹窗
      this.setData({
        masterStartAssistFail: {
          title: '太火爆了，今日限量已抢完，明天再来吧~',
          content: [],
          showClose:false,
          btnType:''
        }
      })
      this.showModal(MODAL_TYPE.masterStartAssistFail)
    }  else if (errCode == 38) {
      // 不在cms白名单范围内
      this.setData({
        masterStartAssistFail: {
          title: '您暂时不可以发起邀请哦~',
          content: [],
          showClose:false,
          btnType:''
        }
      })
      this.showModal(MODAL_TYPE.masterStartAssistFail)
    }else if (errCode == 10 || errCode == 11) {
      // 有库存,未通过风控 页面展示未满足条件
      this.setData({
        masterStartAssistFail: {
          title: '很抱歉，您尚未满足活动参与条件哦',
          content: [],
          showClose:false,
          btnType:''
        }
      })
      this.showModal(MODAL_TYPE.masterStartAssistFail)
    }else if (errCode == 36) {
      // 未实名
      this.setData({
        masterStartAssistFail: {
          title: '领取澳门酒店优惠券需要完成实名认证',
          content: [],
          showClose:false,
          btnType:'realName'
        }
      })
      this.showModal(MODAL_TYPE.masterStartAssistFail)
    } else if (errCode == 37) {
      // 实名不符合要求
      this.setData({
        masterStartAssistFail: {
          title: '您的实名方式不符合领券要求',
          content: [],
          showClose:false,
          btnType:''
        }
      })
      this.showModal(MODAL_TYPE.masterStartAssistFail)
    } else if (errCode == 35) {
      // 其他原因不可领
      this.setData({
        masterStartAssistFail: {
          title: '抱歉，您尚未满足领券条件',
          content: [],
          showClose:false,
          btnType:''
        }
      })
      this.showModal(MODAL_TYPE.masterStartAssistFail)
    }else if(errCode == 39){
      if (completeAssist) {
        // 重新发起 再领一张
        UTILS.showToast(`${dailyStartAssistTime}后才可以发起新的助力哦~`)
      } else {
        UTILS.showToast(`您尚未参与活动，${dailyStartAssistTime}后可发起助力`)
      }
    }else if (errCode == 33) {
      // 没有发起次数
      this.setData({
        masterStartAssistFail: {
          title: '很抱歉，您已达到发起助力次数上限',
          content: [],
          showClose:false,
          btnType:''
        }
      })
      this.showModal(MODAL_TYPE.masterStartAssistFail)
    }else if (errCode == 34) {
      // 没有发起次数
      this.setData({
        masterStartAssistFail: {
          title: '您之前领的券仍然可用哦~',
          content: [],
          showClose:false,
          btnType:''
        }
      })
      this.showModal(MODAL_TYPE.masterStartAssistFail)
    }else if(errCode == 30){
      //有未完成的助力
      UTILS.showToast(`您有一个邀请助力还未完成哦`)
      setTimeout(()=>{
        this.reloadToAct()
      },1500)
    }else{
      UTILS.showToast(`活动太火爆了，请稍后再试【${errCode}】`)
    }
  },
  //实名认证
  toRealName(){
    const realNameData = {
      isNavBack:true,
      pageSource: "ctripwechatmini_macao_coupon_realname", 
      returnCallBack: (data)=>{
        console.log(data)
        //实名回调
        if(data && data.realNamed){
          //认证成功
          this.setData({
            modalType: ''
          })
        }
      }
    };
    this.navigateTo({
      url:'/pages/wallet/setrealname/index',
      data:realNameData,
      callback:(returnData)=>{
        return realNameData.returnCallBack(returnData);
      }
    })
  },
  handleClickAddress() {
    const url = this.data.activityCustomfields?.masterCouponTargetUrl
    this.goTargetUrl(url)
    this.devTrace('clickAddress', { type: 'click' })
  },

  // 设置倒计时
  async setCountDown() {
    const { activityProcess } = this.data.activityStatus
    let { startTime, endTime, currentTime } = this.data.activityConfig
    let remainTime
    // 未开始:开始时间   进行中,已结束:结束时间
    if (activityProcess == 1) {
      remainTime = transformDateStrToTimestamp(startTime) - transformDateStrToTimestamp(currentTime)
    } else if (activityProcess == 2) {
      remainTime = transformDateStrToTimestamp(endTime) - transformDateStrToTimestamp(currentTime)
    } else {
      remainTime = 0
    }
    this.setData({
      remainTime
    })
  },

  //助力组件后台配置字段
  async getActivityConf() {
    let { assistActivityId } = this.data;
    const res = await model.api.getActivityConf({
      activityId: assistActivityId
    })
    if (res.errCode == 0) {
      let { activityConf } = res || {}
      // 分享标题文案
      activityConf.shareTitleArr = activityConf.shareTitle ? str2Arr(activityConf.shareTitle) : [];
      this.bntsMenu = [{
          type: 'startAssist',
          text: activityConf.masterInviteButtonText,
          bg: activityConf.masterInviteButtonImg
        },
        {
          type: 'assist',
          text: activityConf.masterInviteButtonText,
          bg: activityConf.masterInviteButtonImg
        },
      ]

      this.setData({
        activityConf
      })
    } else {
      UTILS.showToast(res.errMsg)
    }
  },

  // 助力组件 发起助力
  toIndex(e) {

  },

  // 助力组件获取助力信息 设置奖励相关
  afterGetAssist(e) {
    const { activityInfo, masterInfo } = e.detail
    const { completeAssist, getIdentity, needNum, friendList } = activityInfo
    // 检测组价内部是否切换登录态,如果切换就重新加载
    const isLogin = this.data?.activityStatus?.isLogin
    if (!isLogin) {
      cwx.user.checkLoginStatusFromServer((checkLoginRes) => {
        if (checkLoginRes) {
          this.initPage()
        }
      });
    }
    this.setData({
      activityStatus: {
        ...(this.data.activityStatus || {}),
        completeAssist,
        getIdentity,
        needNum,
        remainNum: needNum - friendList.length
      },
      masterInfo
    })

    this.getAssistInfoResolve()
  },

  afterAssist({ detail: res }) {
    if (res.errCode == 0) {
      // 助力成功
      this.toReceiveAward()
      this.devTrace('assist success', {
        actionMsg: '客态助力成功',
        result: res
      })
    } else if (res.errCode == '1013') {
      // 老年认证
      let curUrl = this.getCurrentUrl()
      curUrl = encodeURIComponent(curUrl)
      curUrl = `https://m.ctrip.com/webapp/memberactivity/old/home?isBack=1&pushcode=oldManAssist`
      curUrl = `/pages/market/web/index?from=${encodeURIComponent(curUrl)}&needLogin=true`
      this.goTargetUrl(curUrl)
    }  else if (res.errCode == 1015) {
      const {activityConf,activityCustomfields}=this.data
      // 加企微好友
      let curUrl=`https://m.ctrip.com/webapp/market-app/wechat/qwMidpage?title=${encodeURIComponent(activityCustomfields.pageTitle)}&color=${encodeURIComponent(activityConf.weComBackgroundColor)}&img=${encodeURIComponent(activityConf.weComBackground)}&entryId=${activityConf.weComEntrtyId}`
      curUrl = `/pages/market/web/index?from=${encodeURIComponent(curUrl)}&needLogin=true`
      this.goTargetUrl(curUrl)
    } else {
      this.devTrace('assist fail', {
        actionMsg: '客态助力失败',
        result: res
      })
    }
  },

  // 加群判断
  async assistToRedirectBefore() {
    const { authRule } =  this.data.activityConf
    if (authRule == 2) {
      // 老年人
      const data = await await model.api.getElderAuthInfo()
      if (data.code === 0) {
        const isEnterGroup = data.elderInfo?.isEnterGroup
        if (!isEnterGroup) {
          // 进群
          let targetH5 = 'https://m.ctrip.com/webapp/memberactivity/old/group'
          let url = `/pages/market/web/index?from=${encodeURIComponent(targetH5)}&needLogin=true`
          this.goTargetUrl(url)
        } else {
          this.handleCustomerStartAssist()
        }
      } else {
        this.handleCustomerStartAssist()
      }
    } else {
      this.handleCustomerStartAssist()
    }
  },

  // 判断奖励条件,弹出奖励弹窗
  async toReceiveAward() {
    const { activityId, activityStatus,identityId } = this.data
    if (activityStatus.isMaster) {
      // 主态
    } else {
      // 客态
      let awardType = 2 // 助力奖励
      const res = await model.api.canReceiveAward({
        identityId,
        activityId,
        awardType
      })
      if (res.errCode == 0) {
        if (!res.canReceive) {
          // 没有奖励的时候再提示
          UTILS.showToast('助力成功！')
          return
        }
        // 弹出领取奖励弹窗
        const length = this.data.assistCouponList.length
        this.setData({
          prizeModalRenderData: {
            title: `助力成功，送您${length}张优惠券`,
            subTitle: '',
            btns: [{
              type: 'receivePrize',
              text: '开心收下'
            }]
          }
        })
        this.showModal(MODAL_TYPE.assistSuccess)
      }
      this.devTrace('canReceiveAward', {
        actionMsg: '助力成功之后,判断是否可领取奖励',
        result: res?.errMsg
      })
    }
  },

  // 获取奖品信息 
  async getAwardInfo() {
    const { activityId } = this.data
    const { isMaster } = this.data.activityStatus

    if (isMaster) {
      const res = await model.api.getAwardInfo({
        activityId,
        awardType: 1
      })
      if (res.errCode == 0) {
        this.setData({
          couponList: resolveCouponList(res.awardInfo?.couponList),
          prizeType: res.awardInfo.couponList?.[0]?.awardType == 'ctripCoupon' ? 1 : 2,
          receivedNum: res.awardInfo?.receivedNum
        })
      } else {
        this.devTrace('getAwardInfo fail', {
          actionMsg: 'awardType: 1 优惠券 fail'
        })
      }
    } else {
      let fetchList = [
        model.api.getAwardInfo({
          activityId,
          awardType: 1
        }),
        model.api.getAwardInfo({
          activityId,
          awardType: 2
        }) // 奖励
      ]
      Promise.all(fetchList).then(([res1, res2]) => {
        if (res1.errCode == 0) {
          this.setData({
            couponList: resolveCouponList(res1.awardInfo?.couponList),
            prizeType: res1.awardInfo.couponList?.[0]?.awardType == 'ctripCoupon' ? 1 : 2,
          })
        } else {
          this.devTrace('getAwardInfo fail', {
            actionMsg: 'awardType: 1 优惠券 fail'
          })
        }
        if (res2.errCode == 0) {
          this.setData({
            assistCouponList: resolveCouponList(res2.awardInfo?.couponList),
          })
        } else {
          this.devTrace('getAwardInfo fail', {
            actionMsg: 'awardType: 2 实体 fail'
          })
        }
      })
    }
  },

  // 客态点击弹窗按钮去发起
  handleCustomerStartAssist() {
    const { customerJoinButtonUrl } = this.data.activityConf
    this.goTargetUrl(customerJoinButtonUrl)
    this.devTrace('handleCustomerStartAssist', {
      actionMsg: '客态点击弹窗按钮去发起'
    })
  },

  // 客态点击开心收下领取奖励
  async receivePrize() {
    const { activityId,identityId } = this.data
    let { customerJoinButtonText } = this.data.activityConf
    const res = await model.api.receiveCoupon({
      openId: cwx.cwx_mkt.openid,
      activityId,
      identityId
    })
    if (res.errcode == 0) {
      let length = 0
      const { assistCouponList } = this.data
      assistCouponList.forEach(item => {
        let isExist = res.bizResultList.find(bizItem => bizItem.awardId == item.awardId && bizItem.code == 0) 
        if (isExist) {
          length ++
          item.status = 3 // 已获得
        } else {
          item.status = 2 // 未获得
        }
      })
      this.setData({
        assistCouponList,
        prizeModalRenderData: {
          title: `已成功领取${length}张优惠券`,
          subTitle: '可在“小程序-我的优惠券”中查看和使用',
          btns: [{
            type: 'startAssist',
            text: customerJoinButtonText
          }]
        }
      })
    } else {
      this.setData({
        prizeModalRenderData: {
          title: `很遗憾，优惠券领取失败`,
          subTitle: '',
          btns: [{
            type: 'startAssist',
            text: customerJoinButtonText
          }]
        }
      })
    }
  },

  showRule() {
    this.showModal(MODAL_TYPE.rule)
  },

  // 获取优惠券使用规则的高度
  getRuleHeight() {
    const lineCount = 3
    const ruleHeightLimit = 36 * lineCount // rpx转换为px
    let query = wx.createSelectorQuery();
    query.select('.coupon-rule-content').boundingClientRect((rect) => {
      let domHeight = rect ? rect.height * 2 : 0
      this.setData({
        ruleHeight: domHeight,
        ruleHeightLimit,
        ruleExpand: domHeight > ruleHeightLimit ? false : true
      })
    }).exec();
  },

  // 获取用户订阅状态
  getUserSubscribeStatus() {
    cwx.mkt.getSubscribeMsgInfo(defaultConfig.assistTempIds, (data) => {
      const statusIndex=data.templateSubscribeStateInfos.findIndex((item)=>{
        return item.subscribeState==0
      })
      this.assistTempIdsStatus=statusIndex==-1?1:0
      this.devTrace('getUserSubscribeStatus', {
        actionMsg: '获取订阅状态',
        result: data
      })
    }, () => {
      this.devTrace('getUserSubscribeStatus fail', {
        actionMsg: '获取订阅状态失败'
      })
    })
    
  },

  // 关闭弹窗
  closeModal() {
    this.setData({
      modalType: ''
    })
  },

  // 展示弹窗
  showModal(type) {
    this.setData({
      modalType: type
    })
  },

  // 优惠券使用规则展开折叠切换
  toggleExpandRule() {
    this.setData({
      ruleExpand: !this.data.ruleExpand
    })
  },

  // 用户授权登录
  async toLogin(e) {
    await this.setUserProfile()
    this.devTrace('login');
    const res = await model.loginByPhone(e)
    if (res.resCode == 0) {
      this.devTrace('login_allow');
      // 因为组件内部也需要获得登录态,所以需要重新加载此页面
      this.reload()
    } else {
      this.devTrace('login_refuse');
      UTILS.showToast(res.resMsg)
    }
  },

  getCurrentUrl() {
    let pages = getCurrentPages()
    const currentPage = pages[pages.length - 1];
    let optionsParams = UTILS.genUrlParams(currentPage.options)
    const url = `/${currentPage.route}?${optionsParams}`;
    return url
  },

  reload() {
    const url = this.getCurrentUrl()
    cwx.redirectTo({ url })
  },

  // 跳转新批次活动
  reloadToAct() {
    let pages = getCurrentPages()
    const currentPage = pages[pages.length - 1];
    const url = '/' + currentPage.route + '?' + UTILS.genUrlParams({ 
      activityId: this.data.activityId,
      assistActivityId: this.data.assistActivityId
     })
    cwx.redirectTo({ url })
  },

  async setUserProfile() {
    if (this.data.userInfo) return

    //const userInfo = await this.getUserInfo()
    const userInfo = await model.api.getUserInfo({})
    let params
    if (userInfo && userInfo.nickName) {
      params = { ...userInfo }
    } else {
      params = { ...defaultConfig }
    }
    this.setData({ userInfo: params })
    this.updateUserInfo(params)
  },

  // 更新用户的个人信息 传userinfo更新操作 不传是保存uid操作
  async updateUserInfo(userInfo = {}) {
    try {
      const { nickName, headImage } = userInfo
      let params = {
        appId: cwx.appId,
        activityId: this.data.activityId,
        openId: cwx.cwx_mkt.openid,
        nickName,
        headImage
      }
      if (nickName && headImage) {
        params.nickName = nickName
        params.headImage = headImage
      }
      const res = await model.api.updateUserInfo(params)
      if (!nickName && !headImage) {
        this.devTrace('saveUserInfo', {
          result: res,
          type: '注册uid',
        })
      } else{
        this.devTrace('saveUserInfo', {
          result: res,
          type: '更新用户名头像',
        })
      }
      
    } catch (err) {
      this.devTrace('updateUserInfo', {
        result: err,
        type: 'error',
      })
    }
  },

  // 点击跳转其他活动
  async handleClickMore() {
    const { customerBrowseButtonUrl } = this.data.activityConf
    this.goTargetUrl(customerBrowseButtonUrl)
    this.devTrace('clickMore', { type: 'click' })
  },

  // 订阅消息
  asyncWxSubMsg() {
    return new Promise((resolve) => {
      wx.requestSubscribeMessage({
        tmplIds: defaultConfig.assistTempIds,
        success(res) {
          const values = Object.values(res)
          const isAccept = values.indexOf('accept') > -1
          if (isAccept) {
            console.log('点击了同意')
            resolve(true)
          } else {
            console.log('点击了取消')
            resolve(false)
          }
        },
        fail(err) {
         // this.devTrace('Submsg fial', { type: 'error', result: err })
          resolve(true)
        }
      })
    })
  },

  /** 点击【推荐使用】中各BU的模块，跳转至相应BU的首页 */
  toBUPage: function(e) {
    this.devTrace(e.currentTarget.dataset.action);
    if (e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.url) {
      let url = e.currentTarget.dataset.url;
      this.goTargetUrl(url);
    }
    // 新增埋点-点击相关推荐
    try {
      const { item } = e.currentTarget.dataset
      this.devTrace('clickRecommendArea', {
        clickIndex: item.id,
        actionMsg: '相关推荐点击',
        targetUrl: item.pageUrl
      })
    } catch (err) {
      console.log(err)
    }
  },

  /** 点击前往使用优惠券 */
  toUseCoupon(e) {
    if (this.data.index.couponSellOut) return;
    this.devTrace('toUseCoupon');
    this.goTargetUrl(this.data.activityCustomfields.masterCouponTargetUrl);
  },

  /** 点击【活动专区的Banner】，跳转 */
  toAds(e) {
    this.devTrace(e.currentTarget.dataset.action);
    if (e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.url) {
      let url = e.currentTarget.dataset.url;
      url = url.match('\\?') ? (url + '&') : (url + '?');
      url = url + 'allianceid=' + this.data.activityConfig.allianceid + '&sid=' + this.data.activityConfig.sid;
      this.goTargetUrl(url);
    }
    // 新增埋点-点击活动专区
    try {
      const { item } = e.currentTarget.dataset
      this.logTrace('clickActivityArea', {
        clickIndex: item.id,
        actonMsg: '活动专区点击',
        targetUrl: item.pageUrl
      })
    } catch (err) {
      console.log(err)
    }
  },
  jump(e) {
    let formatExt = e.target?.dataset?.formatext || []
    if (!formatExt || formatExt.length < 1) {
      return;
    }
    let url = "";
    for (let i = 0; i < formatExt.length; i++) {
      if (formatExt[i].key == "jumpUrl") {
        url = formatExt[i].value;
        break;
      }
    }
    this.goTargetUrl(url)
  },
  /** 跳转到目标页 */
  goTargetUrl(targetUrl) {
    let that = this;
    if (targetUrl) {
      // 跳转独立小程序
      if (targetUrl.indexOf('thirdAppId') > 0) {
        wx.navigateToMiniProgram({
          appId: UTILS.getUrlQuery(targetUrl, 'thirdAppId'),
          path: targetUrl.trim(),
          extraData: {},
          success(res) {}
        });
      } else if (targetUrl.indexOf('https://') >= 0 || targetUrl.indexOf('http://') >= 0) {
        // 跳转H5页面
        cwx.component.cwebview({
          data: {
            url: encodeURIComponent(targetUrl)
          }
        })
      } else {
        cwx.navigateTo({
          url: (targetUrl.trim()[0] !== '/') ? ('/' + targetUrl.trim()) : targetUrl.trim(),
          fail: function(e) {
            that.devTrace('goTargetUrl fail', { actionMsg: "跳转到目标页---fail", targetUrl })
            that.toHome();
          }
        });
      }
      that.devTrace('goTargetUrl', { targetUrl })
    } else {
      that.devTrace('goTargetUrl fail', { actionMsg: "跳转到目标页---没有传目标页" })
      that.toHome();
    }
  },

  /** 埋点：业务埋点 */
  logTrace(action, more = {}) {
    // console.log(action, more)
    // action = action.split(',')
    const { activityConfig, assistActivityId, identityId, activityId, channel } = this.data
    try {
      let params = {
        keyname: this.keyname,
        platform: 'miniApp',
        actioncode: action,
        openid: cwx.cwx_mkt.openid,
        clientID: cwx.clientID,
        allianceid: activityConfig && activityConfig.allianceid,
        sid: activityConfig && activityConfig.sid,
        channel,
        pageId: this.pageId,
        activityId,
        assistActivityId,
        identityId,
        ...more
      }
      for(let key in params) {
        if(typeof params[key] == 'object') {
          params[key] = JSON.stringify(params[key])
        }
      }
      console.log(`%cAction:${action} => ${JSON.stringify(params)}`,'color:#0f0;')
      this.ubtTrace(this.ubtCode, params)
  } catch (e) {
      console.log(e)
    }
  },

  // 开发辅助埋点
  devTrace(actioncode, more = {}) {
    this.logTrace(actioncode, more)
  },

  setBulletsConfig() {
    if (this.bulletsCompInstance) return

    let compInstance = this.selectComponent('.bullets')
    if (!compInstance) return

    this.bulletsCompInstance = compInstance
    compInstance.setConfig({
      isLoop: true,
      time: 1500, // ms
      lanes: [{ duration: 4, height: 40 }, { duration: 7, height: 40 }, { duration: 6, height: 40 }]
    })
  },

  // 获取弹幕素材
  async usedDeductList() {
    const { barrageTextHL, barrageTextStart, barrageTextEnd } = this.data.activityCustomfields
    const res = await model.api.getRollInfo({
      activityId: this.data.activityId
    })
    if (res.errcode === 0) {
      let bulletsList = res.rollInfoList; // 获取弹幕
      bulletsList = bulletsList.map((item, index) => {
        return {
          id: index,
          image: item.headImage,
          textList: [
            {
              content: item.nickName,
            },
            {
              content: barrageTextStart,
            },
            {
              content: barrageTextHL,
              style: 'color: #FF2525;'
            },
            {
              content: barrageTextEnd,
            },
          ],
        }
      }).sort(() => Math.random() > 0.5 ? -1 : 1) // 随机排序下
      let bulletsCompInstance = this.selectComponent('.bullets')
      if (bulletsCompInstance) {
        if (bulletsList.length > 0) {
          bulletsCompInstance.addData(bulletsList)
          bulletsCompInstance.start()
        }
      }
    } else {
      this.devTrace('usedDeductList', {
        type: 'fail',
        result: res,
      })
    }
  },

  clickBanner(){
    
  },

  /** 跳转到指定页面 */
  routerUrl(e) {
    const { url } = e.currentTarget.dataset
    if (url) {
      this.goTargetUrl(url);
    }
  },

  /** 跳转至小程序首页*/
  toHome() {
    this.devTrace('tohome');
    cwx.switchTab({
      url: "/pages/home/homepage"
    });
  },

  /** 跳转至签到页  */
  toEndPage() {
    this.devTrace('toEndPage');
    this.goTargetUrl(this.data.activityCustomfields.actEndTargetUrl);
  },

  // 展示 或 隐藏分享组件
  triggerShare() {
    this.setData({
      showShare: !this.data.showShare,
      maskType: !this.data.showShare ? 'showShare' : false
    })
  },

  /** 分享卡片 */
  onShareAppMessage(res) {
    const { activityId, assistActivityId, identityId } = this.data
    let path = '';
    let sharePath = '';
    let shareTitle = this.data.activityConf.shareTitleArr[random(this.data.activityConf.shareTitleArr.length)]
    this.triggerShare(); // 分享完成后隐藏
    const shareType = this.shareType
    switch (shareType) {
      case 'shareActivity':
        // 只分享活动
        path = '/pages/market/directory/assistNew/index?' + UTILS.genUrlParams({
          activityId,
          assistActivityId
        })
        break;
      case 'assist':
      case 'startAssist':
        path = '/pages/market/directory/assistNew/index?' + UTILS.genUrlParams({
          activityId,
          assistActivityId,
          identityId
        })
        break;
    }
    sharePath = 'pages/home/homepage?toUrl=' + encodeURIComponent(path);
    this.logTrace('shareCard', {
      actionMsg: '右下角邀请卡片转发',
      title: shareTitle,
      path: sharePath,
      imageUrl: this.data.activityConf?.shareImg
    });
    return {
      title: shareTitle,
      path: sharePath,
      imageUrl: this.data.activityConf?.shareImg
    }
  },

  /** 调用接口生成圆码 => 跳转海报页面，生成海报，分享至朋友圈 */
  generateQrcode() {
    let path = '';
    const { activityId, assistActivityId, identityId } = this.data
    const shareType = this.shareType
    switch (shareType) {
      case 'shareActivity':
        // 只分享活动
        path = '/pages/market/directory/assistNew/index?' + UTILS.genUrlParams({
          activityId,
          assistActivityId,
          channel: 'poster'
        })
        break;
      case 'assist':
      case 'startAssist':
        path = '/pages/market/directory/assistNew/index?' + UTILS.genUrlParams({
          activityId,
          assistActivityId,
          channel: 'poster',
          identityId
        })
        break;
    }

    let sharePath = 'pages/home/homepage?toUrl=' + encodeURIComponent(path);
    this.triggerShare();

    // 生成海报时应【头像、昵称、圆码链接】过去，圆码的链接里要加【openid、poster的标记】
    const navTo = (qrUrl) => {
      let navUrlParams = UTILS.genUrlParams({
        qrUrl: encodeURIComponent(qrUrl),
        activityId: encodeURIComponent(activityId),
        nickName: this.data.userInfo.nickName || defaultConfig.nickName,
        avatarUrl: this.data.userInfo.headImage || defaultConfig.headImage,
      })
      cwx.navigateTo({
        url: '/pages/market/directory/assistNew/poster?' + navUrlParams
      });
      this.devTrace('jumpToPoster', {
        actionMsg: '跳转海报页',
        sharePath,
        qrUrl,
        activityId,
        nickName: this.data.userInfo.nickName || defaultConfig.nickName,
        avatarUrl: this.data.userInfo.headImage || defaultConfig.headImage,
        navigateTo:  '/pages/market/directory/assistNew/poster?' + navUrlParams
      })
    }
    UTILS.generateQrcode(sharePath, defaultConfig.QRMiddleImg, '新助力活动', this.pageId, navTo)
    this.logTrace('sharePoster', {
      actionMsg: '左下角邀请海报生成',
    })
  },

  // 添加曝光
  addShowTrackObserve(selectors, cb) {
    setTimeout(() => {
      try {
        this._observer = []
        selectors.forEach((item) => {
          let ob = wx.createIntersectionObserver(this)
          this._observer.push(ob)
          ob.relativeToViewport().observe(item, cb)
        })
      } catch (error) {
        console.log(error)
      }
    }, 2000)
  },

  removeShowTrackObserve() {
    try {
      if (this._observer?.length > 0) {
        this._observer.forEach((item) => {
          item.disconnect()
        })
      }
    } catch (error) {
      console.log(error)
    }
  },

  adShowTrack(res) {
    const { id, intersectionRatio } = res
    if (intersectionRatio <= 0) return

    switch (id) {
      case 'ad_recommand':
        this.devTrace('ad_recommand');
        break;

      case 'ad_area':
        this.devTrace('ad_area');
        break;

      default:
        break;
    }
  }

})

function setPageTitle(title) {
  wx.setNavigationBarTitle({
    title
  })
}

// 逻辑见: https://tc40pn.axshare.com/#id=z1azsr&p=4__%E6%96%B0%E7%89%88%E6%A0%B7%E5%BC%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E5%90%AB%E5%8F%96%E5%AD%97%E6%AE%B5%E9%80%BB%E8%BE%91%EF%BC%89&g=1
function resolveCouponList(data) {
  if(!data) return []
  try {
    data.forEach(i => {
      i.status = 1
      if (i.awardType == 'ctripCoupon') {
        i.couponTime = getDaysBetween(i.couponStartDate, i.couponEndDate)
        i.startAmount = parseInt(Math.round(Number(i.startAmount)));
        i.discountAmount = Number(i.discountAmount)
        // i.discountAmount = i.deductionType == 0 ? parseInt(Math.round(Number(i.discountAmount))) : numberGetFloat((100.0 - Number(i.discountAmount)) / 10, 1, false);
  
        // 这里是PM要求改的，他说不让前端取时间戳计算，直接取接口返回的单位+数值。此处特此备注，是PM自己要求要这么做。
        if (i.limitTimeTypeId === 0) {
          i.invalidTime = (i.invalidTime / (1000 * 3600 * 24))
          i.dynamicEffectiveMAXValueUnit = i.dynamicEffectiveMAXValueUnit == 'd' ? '天' : i.dynamicEffectiveMAXValueUnit
        }
        i.invalidEndDay = timerToUTC(toTimeStamp(i.couponEndDate), 'assistEndTime')
      }
      if (i.awardType == 'materialItem') {
        i.couponTime = 0
        i.startAmount = 0
        i.discountAmount = 0
        i.couponName = i.awardName
        // 自定义活动、奖品有效期
        i.imageUrl = i.imageUrl || ''
        if (i.limitTimeTypeId === 0) {
          i.invalidTime = (i.invalidTime / (1000 * 3600 * 24))
          i.dynamicEffectiveMAXValueUnit = i.dynamicEffectiveMAXValueUnit == 'd' ? '天' : i.dynamicEffectiveMAXValueUnit
        }
        i.invalidEndDay = timerToUTC(i.endTime, 'assistEndTime')
      }
      // 处理自定义数据
      if(i.ext && i.ext.indexOf('jumpUrl') > 0) {
        i.jump = true
      }
      const firChar = i.ext.substr(0,1)
      let extList;
      try {
        if(firChar && firChar == '{') {
            extList = "[" + i.ext + "]";
            extList = JSON.parse(extList)
        } else if (firChar && firChar == '[') {
            extList = JSON.parse(i.ext)
        } else {
          extList = [];
        }
        i.formatExt = extList;
      } catch (e) {
        i.formatExt = [];
      }
    })
  } catch (error) {
    console.log(error)
  }
  return data
}

function str2Arr(str) {
  let arr = str.split('|').filter(item => {
    return item.trim();
  })
  return arr;
}

// 处理自定义字段中的跳转逻辑
function resolveCustomfields(data) {
  // 推荐
  let recommendImgArr = data.recommendImgArr ? str2Arr(data.recommendImgArr) : [];
  let recommendJumpUrlArr = data.recommendJumpUrlArr ? str2Arr(data.recommendJumpUrlArr) : [];
  let recommendArr = recommendImgArr.map((item, index) => {
    return {
      id: index,
      bgImg: item,
      pageUrl: recommendJumpUrlArr[index]
    }
  });
  // 专区
  let bannerImgArr = data.bannerImgArr ? str2Arr(data.bannerImgArr) : [];
  let bannerJumpUrlArr = data.bannerJumpUrlArr ? str2Arr(data.bannerJumpUrlArr) : [];
  let bannerArr = bannerImgArr.map((item, index) => {
    return {
      id: index,
      bgImg: item,
      pageUrl: bannerJumpUrlArr[index]
    }
  })
  //每日发起时间10:00:00 展示10:00
  data.dailyStartAssistTime=data.dailyStartAssistTime?data.dailyStartAssistTime.substring(0,data.dailyStartAssistTime.length-3):""
  // 使用说明
  let useIntroArr = data.useIntroArr ? str2Arr(data.useIntroArr) : []
  return {
    ...data,
    recommendArr,
    recommendJumpUrlArr,
    bannerArr,
    bannerJumpUrlArr,
    useIntroArr
  }
}

// 0 - num 之间的随机数
function random(num) {
  return Math.floor(Math.random() * num)
}

function transformDateStrToTimestamp(str) {
  let reg = /\((.+)\)/g
  str = str.match(reg)[0].split('+')[0]
  return str.substring(1, str.length)
}