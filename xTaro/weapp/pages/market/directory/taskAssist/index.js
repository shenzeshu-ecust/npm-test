import { cwx } from "../../../../cwx/cwx.js";
import model from './model'
const UTILS = require('../../common/utils.js');
const eventMenu = {
  invitation: 'INVITATION',
  inviteHelp: 'INVITE_HELP'
}
const localStorageKey = 'mkt_taskAssist_userInfo'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    token: {
      type: String,
      value: ''
    },
    tempid: {
      type: String,
      value: ''
    },
    compid: {
      type: String,
      value: ''
    },
  },

  observers: {
    'token': function (token) {
      if (token) {
        this.initPage();
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    assistType: 2,
    inviteHelpInfo: null,
    invitePopupOpen: false,
    isLogin: true,
    userInfo: null,
    showSuccessModal: false,
    awardPic: '',
    inviteBtn: { status: '0', btnText: '助力' }
  },

  attached: function () {
    this.initPageBind = this.initPage.bind(this)
      try {
        this.mPage = cwx.getCurrentPage()
        this.pageId = this.mPage ? (this.mPage.pageId || '') : ''
        this.getConf().then(() => {
            cwx.user.checkLoginStatusFromServer((checkLoginRes) => {
                console.log('登陆态', checkLoginRes)
                if (!checkLoginRes) {
                  UTILS.getLoginCode()
                }
                this.setData({
                  isLogin: checkLoginRes
                })
              });
              this.initPage()
        })
        cwx.Observer.addObserverForKey('dynamicLoginSuccess',this.initPageBind);
      } catch (error) {
        this.logTrace({
            type: 'attached error',
            data: error
        })
      }
    this.logTrace({
      type: 'getUserProfile canIUse',
      data: wx.canIUse('getUserProfile')
    })
  },

  detached: function() {
    try {
        cwx.Observer.removeObserverForKey('dynamicLoginSuccess', this.initPageBind);
    } catch (error) {
    }
  },

  pageLifetimes: {
    show: function () {
      if (this.data.invitePopupOpen) {
        cwx.user.checkLoginStatusFromServer((checkLoginRes) => {
          console.log('登陆态', checkLoginRes)
          if (!checkLoginRes) {
            UTILS.getLoginCode()
          }
          this.setData({
            isLogin: checkLoginRes
          })
        });
        this.initPage()
      }
      // 批量领取需要页面onshow也执行，处理组合任务的领取
      const taskInfo = this.data.taskInfo
      if (taskInfo && taskInfo.assistType == 4) {
        this.processBatchReceiveTask(taskInfo.channelCode)
      }
      if (!this.mpage) {
        this.mPage = cwx.getCurrentPage()
        this.pageId = this.mPage ? (this.mPage.pageId || '') : ''
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initPage: async function() {
      console.log('【taskAssist】组件加载成功')
      await this.fetchTemplateData()
      if (!this.data.taskInfo) {
        wx.showToast({
          title: '乐高id错误',
          icon: 'none'
        })
        return
      }
      const { assistType, channelCode } = this.data.taskInfo
      switch (+assistType) {
        case 1:
          console.warn('暂不支持此类型')
          break;
        case 2:
          this.getInviteInfo();
          break;
        case 3:
          console.warn('暂不支持此类型')
          break;
        case 4:
          await this.initUnionData()
          this.processBatchReceiveTask(channelCode)
          break;
        case 5:
          this.bindInvite(channelCode)
          break;
      }

      this.getUserInfo()
    },

    fetchTemplateData: async function()  {
      const templateCode = this.data.tempid
      const res = await model.loadLegaoTemplate({
        templateCode,
      })
      if (res.code == 0 && res.template) {
        try {
          const pageComps = res.components
          let _taskInfo = pageComps.find(item => item.id == this.data.compid)
          _taskInfo = resolveJsonToObj(_taskInfo.property)
          _taskInfo.assistType =  Number(_taskInfo.assistType)
          this.setData({
            taskInfo: _taskInfo
          })
        } catch (e) {
          console.log('tpl JSON parse err: ', e)
        }
      }
      this.logTrace({
        type: 'fetchTemplateData',
        data: res
      })
    },

    initUnionData() {
      return new Promise((resolve) => {
        cwx.mkt.getUnion((unionData) => {
          let mktUnionData = {}
          mktUnionData['allianceid'] = String(unionData.allianceid) || ''
          mktUnionData['sid'] = String(unionData.sid) || ''
          mktUnionData['ouid'] = String(unionData.ouid) || ''
          mktUnionData['sourceid'] = String(unionData.sourceid) || ''
          let extUnionData = JSON.parse(unionData.exmktid)
          mktUnionData['pushcode'] = String(extUnionData.pushcode) || ''
          mktUnionData['innersid'] = String(extUnionData.innersid) || ''
          mktUnionData['innerouid'] = String(extUnionData.innerouid) || ''
          this.mktUnionData = mktUnionData
          resolve(mktUnionData)
        })
      })
    },

    getInviteInfo: async function () {
      let mpage = this.mPage ||  cwx.getCurrentPage()
      const { options } = mpage
      const token = options.taskinvite;
      if (!token) {
        console.warn("miss invitation token");
        return;
      }
      let res = await model.inviteInfo({
        eventType: eventMenu.inviteHelp,
        token
      })
      if (res.code === 200) {
        if (res?.inviteInfoDto?.masterState == 1) {
          this._triggerEvent('taskAssistPopupResult', { status: 'openFail', reason: '主态不弹出' })
          return
        }

        const { inviteInfoDto } = res
        // 客态时提示信息 1:token无效;2:活动过期;3:助力满了;4:重复助力
        const { isLogin } = this.data
        const { msgCode } = inviteInfoDto
        if (msgCode == '1') {
          this._triggerEvent('taskAssistPopupResult', { status: 'openFail', reason: 'token无效' })
          return
        }
        if (isLogin) {
          if (msgCode == '2') {
            this.setData({
              inviteBtn: { status: '1', btnText: '助力已过期，我也要参与' }
            })
          }
          if (msgCode == '3') {
            this.setData({
              inviteBtn: { status: '1', btnText: '助力已满，我也要参与' }
            })
          }
          if (msgCode == '4') {
            this.setData({
              inviteBtn: { status: '1', btnText: '之前已助力，我也要参与'}
            })
          }
        }
        
        const resolveAvatarList = (list = [], target) => {
          list.forEach(item => {
            item.avatarUrl = item.data && item.data.headUrl
            item.nickName = item.data && item.data.nickName
            if(item.avatarUrl) {
              item.haveHead = true
            }
          });

          // 补充够邀请数量 
          const defaultConfig = {
            avatarUrl: 'https://images3.c-ctrip.com/marketing/2021/06/xcx_assist/head.png', // 默认头像
            nickName: '待助力',
          }
          while (list.length < target) {
            list.push({
              ...defaultConfig
            })
          }
          return list
        }

        resolveAvatarList(inviteInfoDto.itemList, inviteInfoDto.eventTarget)
        console.log('inviteHelpInfo------', inviteInfoDto)

        this._triggerEvent('taskAssistPopupResult', { status: 'openSuccess', reason: 'success' })
        this.setData({
          inviteHelpInfo: inviteInfoDto,
          invitePopupOpen: true
        })
      } else {
        this._triggerEvent('taskAssistPopupResult', { status: 'openFail', reason: '活动已结束' })
        UTILS.showToast('活动已结束')
      }
      this.logTrace({
        type: 'getInviteInfo',
        data: res
      })
    },

    getUserInfo: function() {
      const { userInfo, start } = cwx.getStorageSync(localStorageKey) || {}
      const day = 3
      let time = day * 24 * 60 * 60 * 1000 // 时长
      const now = Date.now()
      if (now - start >  time) {
        cwx.removeStorageSync(localStorageKey)
        this.logTrace({
          type: `removeStorageSync ${localStorageKey}`
        })
        return
      }
      if (userInfo) {
        this.setData({
          userInfo
        })
      }
      this.logTrace({
        type: `getStorageSync ${localStorageKey}`,
        data: '在有效期内'
      })
    },

    setUserInfo: function(data) {
      const now = Date.now()
      const params = {
        userInfo: data, 
        start: now
      }
      cwx.setStorageSync(localStorageKey, params)
      this.logTrace({
        type: `setStorageSync ${localStorageKey}`,
        data: params
      })
    },

    processInviteHelpTask: async function() {
      // const token = this.data.token
      let mpage  = this.mPage
      const { options } = mpage
      const token = options.taskinvite;
      if (!token) {
        console.warn("miss invitation token");
        return;
      }

      let res = await model.trigger({
        eventType: 'INVITE_HELP',
        extensionMap: {
          inviteToken: token
        }
      })
      if (res.code === 100) {
        this.logTrace({
          type: 'processInviteHelpTask resCode 100',
          data: res
        })
        cwx.user.login({
          param: {
            sourceId: "market"
          },
        });
        return;
      }
      /**
       *  400136		INVALID_INVITE_TOKEN 无效邀请
          400124		INVITE_INVALID_USER 不可给自己助力哦
          400119		RISK_INTERCEPT 很抱歉, 您尚未满足活动参与条件
          400135		EVENT_TYPE_NON_RELATED_TASK 活动已结束
          40009		USER_NOT_RECEIVE_TASK 活动已结束
          40010		USER_TASK_STATUS_NOT_PROCESS 您来晚一步
          -1		    INTERNAL_ERROR	请稍后再试
          400137		INVITE_HELP_FIRST_TIME 恭喜您, 获取一张优惠券		
          40110		TASK_NO_ONLINE 活动已结束
          40104		TASK_OVER_OPEN_END_TIME 活动已结束
          40111		REPETITIVE_OPERATION 请稍后再试
          400132		INVITE_HELP_OVER_LIMIT 您的助力次数已达到上限
          400133		INVITE_HELP_REPEATED_INVITE 您已助力过, 不可重复助力
       */

      // 领奖成功 
      if (res.code === 400137) {
        if (res.extMap?.awardPic) {
          this.setData({
            invitePopupOpen: false,
            showSuccessModal: true,
            awardPic: res.extMap.awardPic
          })
        } else {
          this.getInviteInfo()
          UTILS.showToast(res.message)
        }
      } else {
        UTILS.showToast(res.message)
      }
      this.logTrace({
        type: 'processInviteHelpTask success',
        data: res
      })
    },

    handleClickInvite: async function () {
      const { inviteBtn } = this.data
      if (inviteBtn.status == 0) {
        this.processInviteHelpTask()
      } else if (inviteBtn.status == 1) {
        this.handleInvitePopupClose()
      } else {
          console.log('error: no inviteBtn.status', inviteBtn)
      }
    },

    handleInvitePopupClose: function () {
      this.setData({
        invitePopupOpen: false
      })
      this._triggerEvent('closePopup')
      this._triggerEvent('taskAssistPopupResult', { status: 'closeSuccess', reason: 'closeSuccess' })
      this.logTrace({
        type: 'click closePopup',
      })
    },

    processBatchReceiveTask:async function(channelCode){
      channelCode = channelCode.split(',')
      let res = await model.batchReceiveProjectTask({
          channelCodeList: channelCode,
          ...this.mktUnionData
      })
      if (res.code === 100) {
          return;
      }
      if (res.code === 200) {
        this.logTrace({
          type: 'processBatchReceiveTask success',
          data: res
        })
      }
      this._triggerEvent('batchReceiveResult', { result: res })
    },

    bindInvite: async function(channelCode) {
      const { forceLogin } = this.data.taskInfo
      if (channelCode) {
        await this.processBatchReceiveTask(channelCode)
      }
      let mpage  = this.mPage ||  cwx.getCurrentPage()
      const { options } = mpage
      const token = options.taskinvite;
      this.logTrace('options', options)
      if (!token) {
        this.logTrace({
          msg: 'url param taskinvite miss'
        })
        return
      }
      const res = await model.taskAssistant({
        businessType: 'INVITE_HELP_TASK_BIND',
        paramMap: {
          token
        }
      })
      if (forceLogin && res.code == 100) {
        cwx.user.login({
          param: {
            sourceId: "market"
          },
          callback:() => {
            this.initPage()
          }
        });
        return
      }
      if (res.code == 200) {
        this._triggerEvent('bindInvite', res)
      }
      this.logTrace({
        action: 'bindInvite',
        res
      })
      return res
    },

    loginPhone: function(event) {
      const e = event.detail
      
      let curpath = ''
      const currentPage = cwx.getCurrentPage() || {};
      if (currentPage.route) {
        curpath = currentPage.route;
      }

      UTILS.loginPhone(e, curpath, ()=>{
        this.setData({
          isLogin: true
        })
        this._triggerEvent('userLogin', { loginStatus: true })
        this.initPage()
        this.logTrace({
          type: 'loginPhone success',
          data: e
        })
      })
    },

    async setUserProfile(e) {
      try {
        console.log('>>>bindgetuserinfo',e.detail);
        this.logTrace({
          type: 'setUserProfile e detail', 
          data: e.detail
        })
        const userInfo = await cwx.requireUserPic();

        this.setData({
          userInfo
        })
        this.setUserInfo(userInfo)
        this.logTrace({
          type: '成功返回头像昵称', 
          data: userInfo
        })
        console.log('成功返回头像昵称', userInfo.nickName, userInfo.avatarUrl);
      } catch (error) {
        this.logTrace({
          type: 'setUserProfile', 
          error: error
        })
        console.log('发生错误', error);
      }
      this.processInviteHelpTask()
    },

    getConf: async function() {
      const res = await model.getActivityConfig({
        activityId: 'MKT_ShareSubscribe_1632906673391'
      })
      const openAvatar = res?.activityCustomfields?.needAvatar == 'true'
      if (!openAvatar) {
        this.setData({
          openAvatarSetting: openAvatar,
          userInfo: {
            nickName: '',
            avatarUrl: ''
          }
        })
      }
      this.logTrace({
        type: 'openAvatar',
        data: openAvatar
      })
    },

    toLogin() {
      cwx.user.login({
        param: {
          sourceId: "market"
        },
      });
    },

    closeSuccessModal: function() {
      this.setData({
        showSuccessModal: false,
      })
    },

    _triggerEvent(type, data) {
      console.log('【taskAssist组件 triggerEvent】', type, data)
      switch(type){
        case 'batchReceiveResult':
          this.triggerEvent('batchReceiveResult', data)
          break;
        case 'closePopup':
          this.triggerEvent('closePopup', data)
          break;
        case 'userLogin':
          this.triggerEvent('userLogin', data)
          break;
        case 'bindInvite':
          this.triggerEvent('bindInvite', data)
          break;
        // 弹窗结果
        case 'taskAssistPopupResult':
          this.triggerEvent('taskAssistPopupResult', data)
          break;
      }
    },

    logTrace: function(params) {
      try {
        const _params = {
          "openid": cwx.cwx_mkt.openid || '',
          "pageid": this.pageId,
          ...params
        }
        console.log('o_mkt_miniapp_taskAssist->', _params)
        this.mPage && this.mPage.ubtDevTrace && this.mPage.ubtDevTrace('o_mkt_miniapp_taskAssist', _params);
      } catch (error) {
      }
    }
  }
})

function resolveJsonToObj(str) {
  let ret = {}
  try {
    // str = str.replace(/[ ]|[\r\n]/g, '')
    ret = JSON.parse(str)
  } catch (error) {
    // console.log(error)
  }
  return ret
}
