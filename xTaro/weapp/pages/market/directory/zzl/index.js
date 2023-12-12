import { cwx, CPage, __global } from "../../../../cwx/cwx.js";
import util from "../../../../cwx/ext/util.js";
import utils from "../../common/utils";
import { checkIsFromTask } from '../components/countDown/utils'
let startPageX = 0;
let endPageX = 0;
const model  = require('./model');
let timer = null;
let floatTimer = null;
let showZzlFloatValue = 0;
let isShaking= false
let AccelerometerNum = -1;
let videoAd = null
let pageScrollTimer = null

CPage({
  pageId: '10650067831',
  data: {
    isFat: __global.env === 'fat',
    nickName: '',
    headImg: '',
    openId: '',
    navbarData: {
      showCapsule: 1, //是否显示头部左上角小房子 1显示 0 不显示
      showBack: 0, //是否显示返回 1显示 0不显示
      showColor: 0, //navbar背景颜色 1蓝色 0白色
      bgTransparent: true,
      iconColor: 'white',
      titleColor: 'white'
    },
    cardColor: {
      'spade': '♠️',
      'heart': '♥️',
      'club': '♣️',
      'diamond': '♦️',
    },
    prizeLevelCfg: {
      '1':'一',
      '2':'二',
      '3':'三',
      '4':'四',
    },
    isFront: true,
    animationData: {},
    maskData: {
      masktype: -1,
      award: 0,
      currentCardIdx: 0,
      floatCardList: [],
      isFront: true
    },
    isLogin: false,
    showShare: false,
    userCards:[],
    AdvertiseDataWidth: (cwx.wxSystemInfo.windowWidth - 22),
    AdvertiseDataHeight: (cwx.wxSystemInfo.windowWidth - 10) * 0.333,
    slideVideo: {
      dotPosition:'center'
    },
    activityCfg: {},
    leftTime: undefined,
    chanceNum: -1,
    channelConfigs: [],
    subscribeFlag: 0,
    templateIdList: ['Q48gxPI1m42FqyWaVH3tViWM8f44XebLnEX6C_qbTG0'],
    musicStatus: true,
    inviteOpenid: '',
    ciphertext: '', // 链接上带来的加密uid
    myCiphertext: '', // 自己的加密uid
    adStatus: false,
    channelEnvCfg: {},
    initStatus: true,
    showTaskLight: false,
    isShortScreen: false,
    lotterySource: ''
  },
  onLoad(options) {
    checkIsFromTask(this)
    try {
      const data = wx.getStorageSync('welcome_float')
      const needWelcome = !data || (data && (new Date().getTime() - parseInt(data)) > 7*24*60*60*1000)
      if(needWelcome) {
        this.setData({
          maskData: {
            masktype: 5,
          }
        },()=>{
          setTimeout(() => {
            this.setData({
              initStatus: false
            })
          }, 500);
        })
      } else {
        this.setData({
          initStatus: false
        })
      }
    } catch (err) {
      this.setData({
        initStatus: false
      })
    }
    utils.getOpenid(()=> {
      // 动态计算广告banner的宽高
      cwx.user.checkLoginStatusFromServer((checkLoginRes)=> {
        console.log('-------------- 初始化获取登录态--------------------', checkLoginRes)
        if (!checkLoginRes) {
          this.setData({
            isLogin: false
          })
        } else {
          this.setData({
            isLogin: true
          }, ()=>{
            this.countMyAwardCards()
            this.participateZzlActivity(options.openid, options.ciphertext)
          })
        }
      })

      this.setData({
        activityId: options.activityid || '',
        inviteOpenid: options.openid,
        ciphertext: options.ciphertext,
        lotterySource: options.lotterysource || ''
      }, ()=>{
        this.initPage();
        this.addChance(this.data.lotterySource, true)
        // this.addChance(this.data.channelEnvCfg.subscribe)
        // this.getZzlChannelConfig();
        this.getSubscribeMsgInfo()
      })
    }, (err)=>{})

    this.createVideoAd()
    const _channelEnvCfg= this.getEnv()
    this.setData({
      channelEnvCfg: _channelEnvCfg
    })

    wx.getSystemInfo({
      complete: (res) => {
        if(res && res.screenHeight < 750) {
          this.setData({
            isShortScreen: true
          })
        }
      },
    })

    this.ubtTrace && this.ubtTrace('mkt_wechat_activity_lottery', {
      "activityId": this.data.activityId,
      "openid":cwx.cwx_mkt.openid,
      "action": "zzl onload",
      "pageid": this.pageId
    });
  },
  onShow() {
    this.initPage()
    console.log('onshow  ')
  },
  onHide() {
    timer && clearInterval(timer)
    floatTimer && clearInterval(floatTimer)
    pageScrollTimer && clearTimeout(pageScrollTimer)
  },
  onUnload() {
  },
  onPageScroll(e) {
    if(pageScrollTimer) return
    pageScrollTimer = setTimeout(()=>{
      this.setData({
        pageScrollTop: e.scrollTop
      })
      pageScrollTimer = null
    }, 500)
  },
  getEnv() {
    switch (__global.env.toLowerCase()) {
      default:
      case "fat":
        return {
          ad: 'C1616393241446',
          share: 'C1616140531931',
          exchange: 'C1617080416826',
          subscribe: 'C1619775502764'
        };
      case "prd":
        return {
          ad: 'C1616985022852',
          share: 'C1616745549640',
          exchange: 'C1617011703149',
          subscribe: 'C1618312005275'
        };
    }
  },
  createVideoAd() {
    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-a7955824e6a79836'
      })
      videoAd.onLoad(() => {
        this.ubtTrace && this.ubtTrace('mkt_wechat_activity_lottery', {
          "activityId": this.data.activityId,
          "action": "onLoadAd",
          "openid": cwx.cwx_mkt.openid,
          "time": new Date().getTime()
        });
      })
      videoAd.onError((err) => {
        this.ubtTrace && this.ubtTrace('mkt_wechat_activity_lottery', {
          "activityId": this.data.activityId,
          "action": "errAd",
          "openid": cwx.cwx_mkt.openid,
          "time": new Date().getTime()
        });
      })
      videoAd.onClose(res => {
        // 用户点击了【关闭广告】按钮
        if (res && res.isEnded) {
          // 正常播放结束，可以下发游戏奖励
          console.log('广告播放完毕，开始发放奖励')
          this.ubtTrace && this.ubtTrace('mkt_wechat_activity_lottery', {
            "activityId": this.data.activityId,
            "action": "completeAd",
            "openid": cwx.cwx_mkt.openid,
            "time": new Date().getTime()
          });
          model.requestUrl('addZzlUserCard', {
            channelId: this.data.channelEnvCfg.ad
          }, res => {
            if(res.errCode == 0) {
              console.log('奖励发放成功, 更新用户次数')
              wx.showToast({
                title: '+1注周周乐',
              })
              this.getZzlUserCard(this.data.activityCfg.drawTime)
              this.ubtTrace && this.ubtTrace('mkt_wechat_activity_lottery', {
                "activityId": this.data.activityId,
                "action": "addZzlSendSuccess",
                "openid": cwx.cwx_mkt.openid
              });
            } else if(res.errCode == 4 || res.errCode == 5) {
              wx.showToast({
                title: '今日奖励已达上限，请明天再来！',
                icon: 'none'
              })
            } else if(res.errCode == 9) {
              wx.showToast({
                title: '很遗憾，您尚未满足活动参与条件哦~',
                icon: 'none'
              })
            } 
          })
        } else {
          // 播放中途退出，不下发游戏奖励
          console.log('播放中途退出，不下发游戏奖励')
          this.ubtTrace && this.ubtTrace('mkt_wechat_activity_lottery', {
            "activityId": this.data.activityId,
            "action": "adQuitMidway",
            "openid": cwx.cwx_mkt.openid,
            "time": new Date().getTime()
          });
        }
      })
    }
  },
  // URL领取 / 每日登录赠送
  addChance(channelId, isUrl) {
    if(channelId) {
      model.requestUrl('addZzlUserCard', {
        channelId: channelId,
        comeFrom: isUrl ? 'urlLink' : ''
      }, (res) => {
        this.logtrace({
          action: 'addZzlUserCard',
          errCode: res.errCode,
          channelId,
          isUrl
        })
        if(res.errCode == 0 ){
          this.data.activityCfg && this.data.activityCfg.drawTime && setTimeout(() => {
            this.getZzlUserCard(this.data.activityCfg.drawTime)
          }, 1000);
        } else if(res.errCode == 9) {
          wx.showToast({
            title: '很遗憾，您尚未满足活动参与条件哦~',
            icon: 'none'
          })
        }
      })
    }
  },
  initPage() {
    if(!this.data.activityId) {
      return;
    }
    model.requestUrl('getZzlActivityConfig', {
      activityId: this.data.activityId
    }, res => {
      if(res.errCode == 0) {
        if(new Date().getTime() > res.drawTime) {
          wx.showToast({
            title: 'sorry, 活动结束啦~'
          })
          return ;
        }
        this.setData({
          activityCfg: res
        },()=>{
          this.getZzlFirstCard()
          this.getZzlUserCard(res.drawTime)
        })
        timer = setInterval(() => {
          this.formatCountDownTime(res.drawTime)
        }, 1000);
      }
    })
  },
  addZzlUserCard(channelId) {
    model.requestUrl('addZzlUserCard', {
      channelId: channelId
    }, res => {
      if(res.errCode == 0) {
        console.log('奖励发放成功, 更新用户次数')
        wx.showToast({
          title: '+1注周周乐',
        })
      } else if(res.errCode == 4 || res.errCode == 5) {
        wx.showToast({
          title: '今日奖励已达上限，请明天再来！',
          icon: 'none'
        })
      } else if(res.errCode == 9) {
        wx.showToast({
          title: '很遗憾，您尚未满足活动参与条件哦~',
          icon: 'none'
        })
      }
      this.getZzlUserCard(this.data.activityCfg.drawTime)
    })
  },
  getZzlUserCard(drawTime, cb) {
    let _periodNum = ''
    if(drawTime) {
      const date = new Date(drawTime)
      const year = date.getFullYear()
      let month = date.getMonth() + 1
      let day = date.getDate()
  
      month = month < 10 ? '0'+month : ''+month
      day = day < 10 ? '0'+day : ''+day
      _periodNum = year+ '.' + month+ '.' +day
    }

    this.setData({
      periodNum: _periodNum
    },()=>{
      model.requestUrl('getZzlUserCard', {
        activityId: this.data.activityId,
        periodNum: _periodNum,
        pageNo: 1,
        pageSize: 100
      }, res => {
        if(res.errCode == 0) {
          this.setData({
            userCards:  res.userCards || [],
            chanceNum: res.chanceNum,
            myCiphertext: res.ciphertext
          })
          cb && typeof cb == 'function' && cb(res.userCards[0].cardConfigs)
        }
      })
    })
  },

  getZzlCardConfig(cardNos) {
    model.requestUrl('getZzlCardConfig', {
      activityId: this.data.activityId,
      cardNos: cardNos // array 卡牌对应对数字1-52
    }, res => {
      if(res.errCode == 0) {

      }
    })
  },
  sendZzlCardToUser() {
    this.setData({
      showTaskLight: false
    })
    model.requestUrl('sendZzlCardToUser',{
      openId: cwx.cwx_mkt.openid,
      activityId: this.data.activityId
    }, res => {
      if(res.errCode == 0) {
        model.requestUrl('getZzlUserCard', {
          activityId: this.data.activityId,
          periodNum: utils.formatDate(new Date(this.data.activityCfg.drawTime), 'YYYY.MM.DD'),
          pageNo: 1,
          pageSize: 100
        }, res => {
          if(res.errCode == 0) {
            const floatCardList = res.userCards[0].cardConfigs
            this.setData({
              showAnimation: true,
              maskData: {
                masktype: 99
              }
            },()=>{
              setTimeout(()=>{
                this.setData({
                  maskData: {
                    masktype: 1,
                    floatCardList: floatCardList,
                    currentCardIdx: 0,
                    dustCount: -1,
                    cardColorCfg: this.data.cardColor
                  },
                  isFront: true,
                  showAnimation: false,
                  showLight: false
                })
                setTimeout(() => {
                  this.closeMask()
                }, 1500)
              }, 3500)
            })
          } else if (res.errCode == 7) {
            wx.showToast({
              title: '很遗憾，您尚未满足活动参与条件哦~',
              icon: 'none'
            })
          }
        })
        
        this.ubtTrace && this.ubtTrace('mkt_wechat_activity_lottery', {
          "activityId": this.data.activityId,
          "openid":cwx.cwx_mkt.openid,
          "action": "sendZzlCardToUserSuccess",
          "pageid": this.pageId,
          "res": res
        });
      } else if(res.errCode == 6){
        // 没有机会  自动定位到任务处
        wx.pageScrollTo({
          scrollTop: 1600
        })
        this.setData({
          showTaskLight: true
        })
      } else if(res.errCode == 7){
        wx.showToast({
          title: '很遗憾，您尚未满足活动参与条件哦~',
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: '哎呀，系统开小差了，请稍后重试！',
          icon: 'none'
        })
        this.ubtTrace && this.ubtTrace('mkt_wechat_activity_lottery', {
          "activityId": this.data.activityId,
          "openid":cwx.cwx_mkt.openid,
          "action": "sendZzlCardToUserError",
          "pageid": this.pageId,
          "res": res
        });
      }
    })
  },

  /**
   * 获取用户订阅状态
   */
  getSubscribeMsgInfo() {
    cwx.mkt.getSubscribeMsgInfo(this.data.templateIdList, (data) => {
      console.log('周周乐查询订阅消息结果：',data)
      if (data && data.templateSubscribeStateInfos) {
        let arr = data.templateSubscribeStateInfos
        let _status = arr.some(item => {
          return item.subscribeState == 1
        })
        _status && this.setData({
          subscribeFlag: 1
        })
      }
    }, err => {
      console.error('周周乐查询订阅消息失败', err)
    })
  },
  handleSubscribeTemplateMsg() {
    model.requestUrl('subscribeTemplateMsg', {
      "openId": cwx.cwx_mkt.openid,
      "activityId": this.data.activityId
    }, res => {
      console.log('handleSubscribeTemplateMsg', res)
    })
  },

  // 抽卡订阅或者任务  去订阅
  async toSubscribeMsg(e) {
    const isSubscribe = e.target && e.target.dataset && e.target.dataset.subscribe == 'task' ? true : false
    const _templateIdList = isSubscribe ? ['zd_ENMAUnoP9nZLdMAhD2UIQmpsENMFhRTnDfGHBCb8'] : this.data.templateIdList
    cwx.mkt.subscribeMsg(_templateIdList, (data) => {
      if (data && data[_templateIdList[0]] && data[_templateIdList[0]] == 'reject') {
        console.log('我的 点击取消', data[_templateIdList[0]])
      } else {
        console.log('我的 点击确定', data)
        this.addChance(this.data.channelEnvCfg.subscribe)
      }
      if (data && data.templateSubscribeStateInfos && data.templateSubscribeStateInfos.length > 0) {
        console.log('-------------订阅消息成功---------------------');
        let isSuccess = data.templateSubscribeStateInfos.some(item => {
          return item.subscribeState == 1
        })
        if (isSuccess) {
          this.setData({
            subscribeFlag: 1
          })
          !isSubscribe && this.sendZzlCardToUser()
          isSubscribe && this.handleSubscribeTemplateMsg()
        }
      } else {
        !isSubscribe && this.sendZzlCardToUser()
      }
    }, (err) => {
      console.error('----------------订阅消息失败-----------------', err);
      !isSubscribe && this.sendZzlCardToUser()
    })
  },
  showRuleMask() {
    this.data.activityCfg && this.data.activityCfg.activityDesc && this.setData({
      maskData: {
        masktype: 4,
        content: this.data.activityCfg.activityDesc.split('|')
      }
    })
  },
  // 每日赠送

  // 邀请好友参与活动
  participateZzlActivity(inviteOpenid, inviteUid) {
    if(this.data.inviteOpenid || inviteOpenid) {
      model.requestUrl('participateZzlActivity', {
        activityId: this.data.activityId,
        openId: this.data.inviteOpenid || inviteOpenid,
        beInvitedOpenId: cwx.cwx_mkt.openid,
        ciphertext: decodeURIComponent(this.data.inviteUid || inviteUid),
        channelId: this.data.channelEnvCfg.share
      }, res => {
        if (res.errCode == 7) {
          wx.showToast({
            title: '很遗憾，您尚未满足活动参与条件哦~',
            icon: 'none'
          })
        }
        this.logtrace({
          "inviteOpenid": this.data.inviteOpenid || inviteOpenid,
          "activityId": this.data.activityId,
          "beInvitedOpenId": cwx.cwx_mkt.openid,
          "action": "participateZzlActivity",
          "res": res
        })
        // this.addChance(this.data.channelEnvCfg.subscribe)
      })
    } else {
      // this.addChance(this.data.channelEnvCfg.subscribe)
    }
    
  },
  // 周周乐首次加机会
  getZzlFirstCard() {
    model.requestUrl('zzlFirstCard', {
      activityId: this.data.activityId,
      openId: cwx.cwx_mkt.openid,
    }, res => {
      this.logtrace({
        "action": "zzlFirstCard",
        "errCode": res.errCode,
        "errMsg": res.errMsg,
      })
      if(res.errCode == 0) {
        if(this.data.activityCfg.drawTime) {
          this.getZzlUserCard(this.data.activityCfg.drawTime)
        }else {
          setTimeout(()=>{
            this.getZzlUserCard(this.data.activityCfg.drawTime)
          },2000)
        }
      } else if(res.errCode == 7) {
        wx.showToast({
          title: '很遗憾，您尚未满足活动参与条件哦~',
          icon: 'none'
        })
      }
    })
  },

  // 获取渠道配置
  getZzlChannelConfig() {
    model.requestUrl('getZzlChannelConfig', {
      activityId: this.data.activityId,
      channelId: ''
    }, res => {
      if(res.errCode == 0) {
        // res.channelConfigs.map(item => {
        //   if(item.endTime) {
        //     item.formatEndTime = utils.formatDate(new Date(item.endTime), 'YYYY.MM.DD') + '结束'
        //   }
        // })
        res.channelConfigs = res.channelConfigs.filter(item => {
          return item.channelId == this.data.channelEnvCfg.exchange
        })
        this.setData({
          channelConfigs: res.channelConfigs
        })
      }
    })
  },

  toLoginPhone(e) {
    utils.toLoginPage((res)=>{
      this.setData({ isLogin: true})
      this.getZzlUserCard(this.data.activityCfg.drawTime)
      this.getZzlFirstCard()
      this.addChance(this.data.lotterySource, true)
      this.participateZzlActivity()
      this.countMyAwardCards()

      // 往期开奖  渠道跳转  执行跳转
      if(e.target.dataset.url) {
        this.goTargetUrl(e)
      }
      if(e.target.dataset.jump == 'task') {
        wx.pageScrollTo({
          scrollTop: 2800
        })
      }
    },(res)=>{
      wx.showToast({ title: '登录失败', icon: 'none' })
    })
  },
  openWelcomeFloat() {
    this.setData({
      maskData: {
        masktype: 5,
        hasWelcome: true
      }
    },()=>{
      setTimeout(() => {
        this.setData({
          maskData: {
            masktype: -1
          }
        })
        this.countMyAwardCards()
      }, 1000);
    })
    // 24小时有效
    cwx.setStorage({
      key: "welcome_float",
      data: new Date().getTime()
    })
  },
  closeMask(e) {
    if(this.data.maskData.masktype == 1) {
      this.data.pageScrollTop >= 250 && wx.pageScrollTo({
        scrollTop: 0,
        duration: 300
      })

      // 关闭收卡浮层后 获取最新卡牌列表
      this.getZzlUserCard(this.data.activityCfg.drawTime, ()=>{
        this.setData({
          showLight: true,
          middleScrollTop: 0
        })
      })
    }
    if(this.data.maskData.masktype == 3 && this.data.maskData.isFront==false) {
      // 如果放大 预览 关闭都时候 是背面，则再调用一次翻转方法 回正
      this.changeFront()
    }
    this.setData({
      maskData: {
        masktype: -1
      }
    })

    const type = e && e.target && e.target.dataset.type
    type == 'jump' && this.ubtTrace && this.ubtTrace('mkt_wechat_activity_lottery', {
      "activityId": this.data.activityId,
      "openid":cwx.cwx_mkt.openid,
      "action": "tapJump",
      "pageid": this.pageId
    });
  },
  triggerShare() {
    this.data.showShare && this.ubtTrace && this.ubtTrace('mkt_wechat_activity_lottery', {
      "activityId": this.data.activityId,
      "openid":cwx.cwx_mkt.openid,
      "action": "openShare",
      "pageid": this.pageId
    });

    this.setData({
      showShare: !this.data.showShare
    })
    
  },
  generateQrcode() {
    // 如果是首页点击放大进行分享
    if(this.data.maskData.masktype == 3) {
      this.ubtTrace && this.ubtTrace('mkt_wechat_activity_lottery', {
        "activityId": this.data.activityId,
        "openid":cwx.cwx_mkt.openid,
        "action": "sharePosterFromPreview"
      });
      cwx.navigateTo({
        url: `/pages/market/directory/zzl/poster?img=${this.data.maskData.cardBackgroundImg}&activityid=${this.data.activityId}&openid=${cwx.cwx_mkt.openid}&ciphertext=${encodeURIComponent(this.data.myCiphertext)}`
      })
    } else {
      this.ubtTrace && this.ubtTrace('mkt_wechat_activity_lottery', {
        "activityId": this.data.activityId,
        "openid":cwx.cwx_mkt.openid,
        "action": "sharePosterFromFloat"
      });
      const list = this.data.maskData.floatCardList;
      const idx = this.data.maskData.currentCardIdx;
      list && list[idx] && cwx.navigateTo({
        url: `/pages/market/directory/zzl/poster?img=${list[idx]['cardBackgroundImg']}&activityid=${this.data.activityId}&openid=${cwx.cwx_mkt.openid}&ciphertext=${encodeURIComponent(this.data.myCiphertext)}`
      })
    }
  },
  onShareAppMessage(e) {
    const titleList = this.data.activityCfg && this.data.activityCfg.shareWords && this.data.activityCfg.shareWords.split('|')
    const _title = titleList[parseInt(Math.random()*titleList.length)] || '';

    const _path = `/pages/market/directory/zzl/index?innersid=1&activityid=${this.data.activityId}&openid=${cwx.cwx_mkt.openid}&ciphertext=${encodeURIComponent(this.data.myCiphertext)}`;

    console.log('周周乐分享路径：',_path)

    this.ubtTrace && this.ubtTrace('mkt_wechat_activity_lottery', {
      "activityId": this.data.activityId,
      "openid":cwx.cwx_mkt.openid,
      "action": "onShareAppMessageCard"
    });

    return {
      title: _title,
      path: _path,
      imageUrl: 'https://images3.c-ctrip.com/marketing/2022/02/zzl/zzl.jpg'
    }
  },
  cleanDust() {
    let currentDustCount = this.data.maskData.dustCount
    if(currentDustCount >= 0) {
      this.setData({
        maskData: Object.assign({},this.data.maskData, {
          dustCount: --currentDustCount
        })
      })
    }
  },
  changeFront() {
    this.setData({
      isFront: !this.data.isFront,
      maskData: Object.assign({}, this.data.maskData, {
        isFront: !this.data.isFront,
      })
    }, ()=>{
      console.log('changeFront',this.data.maskData)
    })

    this.ubtTrace && this.ubtTrace('mkt_wechat_activity_lottery', {
      "activityId": this.data.activityId,
      "action": "changeFront",
      "maskType": this.data.maskData.masktype
    });
  },
  closeMaskAndClearStorage(){
    this.closeMask()
  },
  handleTouchstart(e) {
    startPageX = e.changedTouches[0] && e.changedTouches[0].pageX
  },
  handleTouchend(e) {
    endPageX = e.changedTouches[0] && e.changedTouches[0].pageX
    if(startPageX - endPageX > 50) {
      this.nextCard()
    } 
    // 2021-03-22 产品不需要能返回看上一张逻辑，所以注释
    // if(endPageX - startPageX > 50){
    //   this.preCard()
    // }
  },
  nextCard() {
    console.error('next card')
    if(this.data.maskData.currentCardIdx == this.data.maskData.floatCardList.length - 1) {
      return
    }
    let nextIdx = ++this.data.maskData.currentCardIdx

    this.setData({
      isFront: true,
      maskData: Object.assign(this.data.maskData, {
        currentCard: this.data.maskData.floatCardList[nextIdx],
        currentCardIdx: nextIdx,
        isFront: true,
      })
    },()=>{
      console.log(this.data.maskData.currentCardIdx)
    })
    this.ubtTrace && this.ubtTrace('mkt_wechat_activity_lottery', {
      "activityId": this.data.activityId,
      "openid":cwx.cwx_mkt.openid,
      "action": "next card"
    });
  },
  preCard() {
    if(this.data.maskData.currentCardIdx == 0) {
      return
    }
    let preIdx = --this.data.maskData.currentCardIdx
    
    this.setData({
      isFront: true,
      maskData: Object.assign(this.data.maskData, {
        currentCard: this.data.maskData.floatCardList[preIdx],
        currentCardIdx: preIdx,
        isFront: true,
      })
    },()=>{
      console.log(this.data.maskData.currentCardIdx)
    })
  },
  saveUserInfo() {
    const { openId, nickName, headImg } = this.data
    if(!openId) return
    cwx.request({
      url: '/restapi/soa2/13218/saveUserInfo',
      data: {
        openId: openId,
        nickName: nickName,
        headImg: headImg
      },
      success: () => {
        console.log('saveUserInfo successful')
      },
      fail: (err) => {
        this.ubtTrace && this.ubtTrace('mkt_wechat_activity_lottery', {
          "activityId": this.data.activityId,
          "action": "saveUserInfoError",
          "pageid": this.pageId,
          "err": err
        });
      }
    });
  },
  goTargetUrl(e) {
    const url = e.target.dataset.url || e.currentTarget.dataset.url
    utils.goTargetUrl(url)
  },
  closeFloatByMask() {
    if(this.data.maskData.masktype == 3 || this.data.maskData.masktype == 4) {
      this.closeMask()
      this.setData({
        showShare: false
      })
    }
  },
  formatCountDownTime(drawTime) {
    const currentTime = new Date().getTime()
    if(drawTime < currentTime) {
      return;
    }

    const remain = (drawTime - currentTime) / 1000

    const day = Math.floor(remain / 60 / 60 / 24) < 10 ? "0" + (Math.floor(remain / 60 / 60 / 24)) : Math.floor(remain / 60 / 60 /24); 
    const hour = Math.floor(remain / 60 / 60 % 24) < 10 ? "0" + (Math.floor(remain / 60 / 60 % 24)) : Math.floor(remain / 60 / 60 % 24);
    const minute = Math.floor(remain / 60 % 60) < 10 ? "0" + Math.floor(remain / 60 % 60) : Math.floor(remain / 60 % 60);
    const second = Math.floor(remain % 60) < 10 ? "0" + Math.floor(remain % 60) : Math.floor(remain % 60);

    this.setData({
      leftTime: `${day}天${hour}小时${minute}分${second}秒`
    })
  },
  showBigImg(e) {
    this.setData({
      maskData: {
        masktype: 3,
        cardFrontImg: e.target.dataset.frontimg,
        cardBehindImg: e.target.dataset.behindimg,
        cardColor: e.target.dataset.color,
        cardName: e.target.dataset.name,
        cardColorCfg: this.data.cardColor,
        cardBackgroundImg: e.target.dataset.poster,
        url: e.target.dataset.url
      }
    })
    this.ubtTrace && this.ubtTrace('mkt_wechat_activity_lottery', {
      "activityId": this.data.activityId,
      "action": "showPreviewImg",
      "cardName": e.target.dataset.name
    });
  },
  // 任务完成后的回调
  completeTask(val) {
    console.log('订阅后的回调', val)
    this.handleSubscribeTemplateMsg()
  },
  // 看广告 拿周周乐
  handleAd(){
    this.ubtTrace && this.ubtTrace('mkt_wechat_activity_lottery', {
      "activityId": this.data.activityId,
      "action": "openAd",
      "openid": cwx.cwx_mkt.openid,
      "time": new Date().getTime()
    });
    videoAd.show()
            .then(() => console.log('激励视频 广告显示'))
              .catch(() => {
                wx.showToast({
                  title: '哎呀，系统开小差了，请稍后重试！',
                })
                videoAd.load()
                .then(() => videoAd.show())
                .catch(err => {
                  console.log('激励视频 广告显示失败')
                })
              })
  },
  // 积分兑换周周乐
  handleExchange() {
    this.ubtTrace && this.ubtTrace('mkt_wechat_activity_lottery', {
      "activityId": this.data.activityId,
      "openid":cwx.cwx_mkt.openid,
      "action": "handle exchange click"
    });

    wx.showModal({
      title: '提示',
      content: '确认使用20积分兑换1注周周乐',
      success: (res) => {
        if (res.confirm) {
          console.log('用户点击确定， 开始积分兑换周周乐')
          model.requestUrl('addZzlUserCard', {
            channelId: this.data.channelEnvCfg.exchange
          }, res => {
            if(res.errCode == 0) {
              console.log('奖励发放成功, 更新用户次数')
              wx.showToast({
                title: '+1注周周乐',
              })
              this.getZzlUserCard(this.data.activityCfg.drawTime)
            } else if(res.errCode == 7) {
              wx.showToast({
                title: '积分不足，兑换失败！',
                icon: 'none'
              })
            } else if(res.errCode == 4 || res.errCode == 5) {
              wx.showToast({
                title: '今日兑换已达上限，请明天再来！',
                icon: 'none'
              })
            } else if(res.errCode == 9) {
              wx.showToast({
                title: '很遗憾，您尚未满足活动参与条件哦~',
                icon: 'none'
              })
            } 

            this.ubtTrace && this.ubtTrace('mkt_wechat_activity_lottery', {
              "activityId": this.data.activityId,
              "action": "addZzlUserCard",
              "channelId": this.data.channelEnvCfg.exchange,
              "pageid": this.pageId,
              "errCode": res.errCode
            });
          })
        } else if (res.cancel) {
          console.log('用户点击取消， 放弃兑换')
          this.ubtTrace && this.ubtTrace('mkt_wechat_activity_lottery', {
            "activityId": this.data.activityId,
            "openid":cwx.cwx_mkt.openid,
            "action": "handle exchange discontinue"
          });
        }
      }
    })
  },
  updateUserZzlChance(e) {
    if(e.detail && e.detail.code == 200) {
      console.log('componentAcceptPrize', e)
      // user had accept prize in component
      // e.detail.currencyNum.   获得的奖励值
     setTimeout(() => {
      this.getZzlUserCard(this.data.activityCfg.drawTime)
     }, 1000);
    }
  },
  handleOpenAward() {
    this.setData({
      maskData: Object.assign({}, this.data.maskData, {openAward: true})
    })
    wx.setStorage({
      data: showZzlFloatValue,
      key: 'showZzlFloat'
    })
  },
  handleGuide1() {
    this.setData({
      maskData: {
        masktype: 7
      }
    })
  },
  catchMove(){
    
  },
  // 计算用户上一期是否有中奖
  // 需要在登陆情况下执行函数  和 引导浮层一起判断  开奖浮层优先
  countMyAwardCards() {
    const guideFloat = cwx.getStorageSync('guide_float')
    const handleGuideFloat = ()=>{
      if(!guideFloat) {
        this.setData({
          maskData: {
            masktype: 6
          }
        })
        cwx.setStorage({
          key: "guide_float",
          data: new Date().getTime()
        })
        return;
      }
    }

    if(this.data.maskData.masktype == 5) {
      return;
    }
    if(!this.data.isLogin) {
      handleGuideFloat()
      return;
    }

    // 获取上一期的periodNum
    model.requestUrl('getZzlActivityConfig', {
      activityId: this.data.activityId
    }, res => {
      this.logtrace({
        action: 'api_getZzlActivityConfig',
        data: res
      })

      const preDrawtime = res.drawTime-7*24*60*60*1000
      let _periodNum = utils.formatDate(new Date(preDrawtime), 'YYYY.MM.DD')
      showZzlFloatValue = preDrawtime
      if(new Date().getTime() <= preDrawtime ) {
        return ;
      }

      try {
        var value = wx.getStorageSync('showZzlFloat')
        if(value && preDrawtime <= value  || res.drawTime  == value) {
          handleGuideFloat()
          return;
        }
      } catch (e) {
        console.error('getStorageInfoSync showZzlFloat error')
        return;
      }

      // 获取上一期颁布的中奖号码
      const promisePeriod = new Promise((resolve, reject) => {
        model.requestUrl('getZzlPeriodCard', {
          activityId: this.data.activityId,
          periodNum: _periodNum
        }, res => {
          if(res.errCode == 0 && res.periodCards) {
            this.logtrace({
              action: 'api_getZzlPeriodCard',
              periodNum: _periodNum,
              status: 'success'
            })
            const periodCards = res.periodCards.filter(item => {
              return item.drawPrize == 1
            })
            resolve(periodCards)
          }else {
            reject()
            handleGuideFloat()
            this.logtrace({
              action: 'api_getZzlPeriodCard',
              periodNum: _periodNum,
              status: 'fail',
            })
          }
        })
      })
      // 获取用户上一期的卡牌
      const promiseUserCard = new Promise((resolve, reject) => {
        model.requestUrl('getZzlUserCard', {
          activityId: this.data.activityId,
          periodNum: _periodNum,
          pageNo: 1,
          pageSize: 100
        }, res => {
          if(res.errCode == 0 && res.userCards) {
            this.logtrace({
              action: 'api_getZzlUserCard',
              periodNum: _periodNum,
              status: 'success',
              chanceNum: res.chanceNum
            })
            resolve(res.userCards)
          } else {
            reject()
            handleGuideFloat()
            this.logtrace({
              action: 'api_getZzlUserCard',
              periodNum: _periodNum,
              status: 'fail',
            })
          }
        })
      })
      // 对比获得中奖卡牌
      Promise.all([promisePeriod, promiseUserCard]).then(resultList => {
        const promisePeriodArr = resultList[0] && resultList[0][0];
        const _periodCards = [promisePeriodArr.cardA, promisePeriodArr.cardB, promisePeriodArr.cardC, promisePeriodArr.cardD]
        const userCards = resultList[1]
        let _userPeriodCards = []
        let firstPrize = []
        let secondPrize = []
        let thirdPrize = []
        let fourthPrize = []
        let noPrize = []

        for(let i=0,len=userCards.length;i<len;i++) {
          let count = 0
          _periodCards.indexOf(userCards[i].cardA) >= 0 && count ++
          _periodCards.indexOf(userCards[i].cardB) >= 0 && count ++
          _periodCards.indexOf(userCards[i].cardC) >= 0 && count ++
          _periodCards.indexOf(userCards[i].cardD) >= 0 && count ++

          switch(count) {
            case 4:
                firstPrize.push(userCards[i]);
                break;
              case 3:
                secondPrize.push(userCards[i]);
                break;
              case 2:
                thirdPrize.push(userCards[i]);
                break;
              case 1:
                fourthPrize.push(userCards[i]);
                break;
              default:
                noPrize.push(userCards[i]);
              break;
          }
        }
        _userPeriodCards = firstPrize.concat(secondPrize, thirdPrize, fourthPrize)
        this.setData({
          maskData: {
            masktype: '2',
            periodNum: _periodNum,
            periodCards: promisePeriodArr,
            userPeriodCards: _userPeriodCards,
            noPrize: noPrize,
            openAward: false,
            cardColorCfg: this.data.cardColor,
            prizeLevelCfg: this.data.prizeLevelCfg
          }
        })
      })
    })
  },
  trace() {
    this.ubtTrace && this.ubtTrace('mkt_wechat_activity_lottery', {
      "activityId": this.data.activityId,
      "openid":cwx.cwx_mkt.openid,
      "action": "handle exchange discontinue"
    });
  },
  logtrace(args) {
    this.ubtTrace && this.ubtTrace('o_mkt_zzlv2', {
      openid:cwx.cwx_mkt.openid,
      activityId: this.data.activityId,
      ...args
    });
  }
})