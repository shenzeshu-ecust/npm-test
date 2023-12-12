import { cwx } from "../../../../../cwx/cwx.js";
const UTILS = require('../../../common/utils')
const model = {
  taskBrowseCheck: (params) => UTILS.fetch('22598', 'taskBrowseCheck', params),
  taskBrowseDone: (params) => UTILS.fetch('22598', 'taskBrowseDone', params),
}
const UN_START = 1
const START_ING = 2
const END = 3
const PAUSE_ING = 4
const FINAL = 5

const TipsMenu = {
  loginTips: 'loginTips', // 展示未登录提示
  firstTips: 'firstTips', // 展示首次提示
  continueTips: 'continueTips', // 展示继续浏览提示
}

/**
 * 1 未登录时 展示【登录后完成任务领取奖励】
 * 2 用户当天首次进入这个去重活动页面弹出一个toast 提示3s 接口提供文案
 * 3 浏览过程中用户点击，不跳转出一个2s的提示 【再看xxs即可完成浏览任务】
 */

Component({
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    UN_START,
    START_ING,
    END,
    PAUSE_ING,
    FINAL,
    status: UN_START,
    showTipType: '',
    task_times: 0, // 倒计时 市场
    taskPopType: '',  // 倒计时样式
    taskJumpUrl: '',  // 跳转url
    mktTaskCountTimes: '', // 倒计时总次数
    showCountDown: false, // 展示倒计时
    _taskDetailId: '', // 页面url 带参数
    _mktTaskActivityId:  '', // 参数传入的id
    isLogin: true
  },
  lifetimes: {
    attached: function() {
      this.onShowOnce('attached')
      cwx.Observer.addObserverForKey('dynamicLoginSuccess', () => {
        console.log('登录成功')
        this.setData({
          status: UN_START
        }, () => {
          this.init()
        })
    });
    },
    detached: function() {
      
    },
  },
  pageLifetimes: {
    show: function() {
      this.reStart()
      // if (this.isLoad) {
      //   // 第二次才会执行
      //   this.reStart()
      //   return
      // }
      // // 只执行一次
      this.onShowOnce('pageshow')
      // this.isLoad = true
    },
    hide: function() {
      this.toPause()
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 此方法进入页面只需要执行一次
    // 因为异步分包化pageshow不执行，所以需要在atached执行此方法
    // 但是非异步化使用时，atached组件拿不到page实例,需要在pageshow中执行
    // 所以使用loadCount参数判断保证，此方法只执行一次，并且确保拿到page实例一次
    onShowOnce(type) {
      this.loadCount = this.loadCount || 0
      if (this.loadCount > 0) return
      console.log(`show in ${type}`)

      const mPage = getCurrentPage()
      this.mPage = mPage
      const options = mPage.options

      if (!options) {
        return
      }
      this.loadCount ++

      const url = getPageUrl(mPage) 
      this.biTrace({
        action: 'countDownShow',
        url
      })
      console.log(`show in ${type} set success ${options._mktTaskActivityId}`)
      this.setData({
        _mktTaskActivityId: options._mktTaskActivityId,
        _taskDetailId: url
      })

      if (options._mktTaskActivityId) {
        this.init()
      }

    },
    async init() {
      await this.taskBrowseCheck()
      const { showCountDown } = this.data
      if (showCountDown) {
        this.toStart() 
      } else {
        this.toFinal()
      }
    },
    async taskBrowseCheck() {
      const res = await model.taskBrowseCheck({
        _taskDetailId: this.data._taskDetailId,
        _mktTaskActivityId:  this.data._mktTaskActivityId,
      })
      if (res.code == 100) {
        this.showLoginTips()
        return
      }
      if (res.code == 200) {
        const { countDown, _taskTimes, _taskPopType, _taskJumpUrl, _taskWxJumpUrl, _mktTaskCountTimes, countdownDesc } = res.taskBrowseCheckData
        this.setData({
          showCountDown: countDown,
          task_times: _taskTimes,
          taskPopType: _taskPopType || '201', 
          taskJumpUrl: _taskWxJumpUrl || _taskJumpUrl, 
          mktTaskCountTimes: _mktTaskCountTimes,
          countdownDesc: countdownDesc,
          showTipType: '',
          isLogin: true
        })
        this.biTrace({
          action: 'taskBrowseCheckData',
          ...res.taskBrowseCheckData
        })
        if (countDown) {
          this.showFirstTips()
        }
      }
    },
    async taskBrowseDone() {
      const res = await model.taskBrowseDone({
        _taskDetailId: this.data._taskDetailId,
        _mktTaskActivityId:  this.data._mktTaskActivityId,
      })
      if (res.code == 100) return
      if (res.code == 200) {
        this.biTrace({
          action: 'taskDone'
        })
      } else {
        UTILS.showToast(res.message)
      }
    },
    checkLogin: async function() {
      return new Promise((resolve, reject) => {
        UTILS.checkLogin(() => {
          resolve(true)
        })
      })
    },
    toStart(){
      if (this.data.status !== UN_START) return
      this.setData({
        status: START_ING
      })
      this.startCountTimes()
    },
    toFinal() {
      this.setData({
        status: FINAL
      })
    },
    toPause(){
      if (this.data.status !== START_ING) return
      this.setData({
        status: PAUSE_ING
      })
      this.pauseCountTimes()
    },
    reStart() {
      if (this.data.status !== PAUSE_ING) return
      this.setData({
        status: START_ING
      })
      this.reStartCountTimes()
    },
    startCountTimes() {
      const { task_times } = this.data
      this.timesAcount = task_times
      this.timer = setInterval(() => {
        this.timesAcount --
        if (this.timesAcount <= 0) {
          clearInterval(this.timer)
        }
      }, 1000)
    },
    reStartCountTimes() {
      if (!this.timesAcount) return
      this.timer = setInterval(() => {
        this.timesAcount --
        if (this.timesAcount <= 0) {
          clearInterval(this.timer)
        }
      }, 1000)
    },
    pauseCountTimes() {
      if (this.timer) {
        clearInterval(this.timer)
      }
    },
    showLoginTips() {
      this.setData({
        showTipType: TipsMenu.loginTips,
        taskPopType: '201',
        isLogin: false
      })
      this.logTrace({
        action: 'showLoginTips'
      });
    },
    showFirstTips() {
      const { _mktTaskActivityId, countdownDesc, task_times } = this.data
      const storageLocalKey = `TASK_COUNT_DOWN__tips`
      let val = '' //当前id的时间戳
      let storageVal = cwx.getStorageSync(storageLocalKey)
      if (storageVal) {
        
      } else {
        storageVal = {}
        cwx.setStorageSync(storageLocalKey, storageVal)
      }
      val = storageVal[_mktTaskActivityId]
      if (!val || !isSameDay(val)) {
          // 不存在 或者 已过期
          storageVal[_mktTaskActivityId] = Date.now(); 
          cwx.setStorageSync(storageLocalKey, storageVal)
          // 弹出提示
          this.setData({
            showTipType: TipsMenu.firstTips,
            taskPopType: '201'
          })
          UTILS.showToast(countdownDesc || `浏览${task_times}s即可完成浏览任务`, 3000)
          this.logTrace({
            action: 'showFirstTips'
          });
      } else {
      }
    },
    showContinueTips() {
      this.setData({
        showTipType: TipsMenu.continueTips
      })
      UTILS.showToast(`再看${this.timesAcount}s即可完成浏览任务`, 2000)
      this.logTrace({
        action: 'showContinueTips',
        timesAcount: this.timesAcount
      });
    },
    handleClick() {
      const { status, isLogin } = this.data
      if (!isLogin) {
        // 去登录
        cwx.user.login({
          param: {
            sourceId: "market"
          },
          callback:() => {
            // this.setData({
            //   status: UN_START
            // }, () => {
            //   this.init()
            // })
          }
        });
        return
      }
      if (status == FINAL || status == END) {
        const taskJumpUrl = this.data.taskJumpUrl
        if (taskJumpUrl) {
          const pageLength = getCurrentPages().length
          if (pageLength >= 9) {
            gotoTarget(taskJumpUrl, 'reLaunch', 
              () => {
                this.triggerEvent('onJump', { success: 1, taskJumpUrl })
                this.biTrace({
                  action: 'onJump success reLaunch',
                  taskJumpUrl
                })
              },
              () => {
                this.triggerEvent('onJump', { success: 0, taskJumpUrl })
                this.biTrace({
                  action: 'onJump fail reLaunch',
                  taskJumpUrl
                })
              }
            )
          } else {
            gotoTarget(taskJumpUrl, 'navigateTo',
              () => {
                this.triggerEvent('onJump', { success: 1, taskJumpUrl })
                this.biTrace({
                  action: 'onJump success navigateTo',
                  taskJumpUrl
                })
              }, 
              () => {
                this.triggerEvent('onJump', { success: 0, taskJumpUrl })
                this.biTrace({
                  action: 'onJump fail navigateTo',
                  taskJumpUrl
                })
              }
            )
          }
        } else {
          try {
            cwx.navigateBack()
          } catch (error) {
            console.log(error)
          }
          // this.triggerEvent('onJump', { success: 0, taskJumpUrl })
          this.biTrace({
            action: 'onJump fail',
            taskJumpUrl
          })
        }
      } else {
        this.showContinueTips()
      }
    },
    async handleAnimationEnd() {
      await this.taskBrowseDone()
      this.setData({
        status: END
      })
    },
    logTrace(args) {
      console.warn('【logTrace countDown】', args)
      const pageId = this.mPage?.pageId
      this.mPage && this.mPage.ubtTrace && this.mPage.ubtTrace(209927, {
        "openid": cwx.cwx_mkt.openid,
        "clientid": cwx.clientId,
        "pageid": pageId,
        ...args
      });
    },
    biTrace(args) {
      console.warn('biTrace countDown】', args)
      const pageId = this.mPage?.pageId
      this.mPage && this.mPage.ubtTrace && this.mPage.ubtTrace(209107, {
        "openid": cwx.cwx_mkt.openid,
        "clientid": cwx.clientId,
        "pageid": pageId,
        ...args
      });
    }
  }
})

function getCurrentPage() {
  return  getCurrentPages()[getCurrentPages().length - 1] || {}
}

function gotoTarget(targetUrl, type = 'reLaunch', successCallback, failCallback) {
  if (targetUrl.startsWith('http')) {
      // 跳转H5页面
      wx[type]({
        url: `/pages/market/web/index?from=${encodeURIComponent(targetUrl)}`
      })
    } else {
      if(targetUrl[0] == '/' && targetUrl.slice) {
        targetUrl = targetUrl.slice(1)
      }
      wx[type]({
        url: "/" + targetUrl.trim(),
        success: function(res) {
          successCallback(res)
        },
        fail: function (e) {
          failCallback(e)
        }
      })
    }
}

function getPageUrl(mpage) {
  const { route, options } = mpage
  return route + '?' + UTILS.genUrlParams(options)
}

function isSameDay(t) {
  return new Date(t).toDateString() == new Date().toDateString()
}
