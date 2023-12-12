const model = require('./model');
import cwx, {
  __global
} from "../../../../cwx/cwx.js";

const {
  buildUrl,
  parseJson
} = require('./utils')
const {
  goTargetUrl
} = require('../../common/utils')

const signinTaskHandler = {
  handleSign: async function (context, taskId) {
    const mktUnionData = context.mktUnionData
    let {
      taskList
    } = context.data
    const taskItem = taskList.find(item => item.id == taskId)

    const res = await model.fetch('userTodoTask', {
      'channelCode': context.data.taskInfo.channelCode,
      'taskId': taskId,
      'done': 1,
      'status': taskItem.taskStatus,
      'allianceid': mktUnionData.allianceid,
      'sid': mktUnionData.sid,
      'ouid': mktUnionData.ouid,
      'sourceid': mktUnionData.sourceid,
      'pushcode': mktUnionData.pushcode,
      'innersid': mktUnionData.innersid,
      'innerouid': mktUnionData.innerouid,
      ...context.commonParams(),
    })

    if (res.code == 100) {
      cwx.user.login({
        param: {
          sourceId: "market"
        },
      });
      return
    };

    if (res.code == 200) {
      // 任务领取成功后 广播任务内容
      context.customerTriggerEvent('receiveTask', {
        taskItem
      })
      // 领奖成功需要提示，阻断做任务的动作
      const receiveSuccess = await context.receiveTaskSendAward(taskId, res.infoMap.receivedTaskId)
      if (receiveSuccess) {
        return
      }
      context.updateStatusToComplete(taskItem)
      // taskList.find(task => task.id == taskId).taskStatus = 2;
      // 任务进入完成状态 广播任务内容
      try {
        context.customerTriggerEvent('complateTask', {
          taskItem,
          taskList
        })
      } catch (error) {
        console.log('customerTriggerEvent', error)
      }

      context.setData({
        taskList
      })
      context.customerUbtTrace({
        action: 'signin success',
        channelCode: context.data.taskInfo.channelCode,
        taskId: taskId,
        done: 1,
      })
      return true
    }

    wx.showToast({
      title: res.errmsg,
      icon: 'none'
    })
    context.customerUbtTrace({
      action: 'signin error',
      channelCode: context.data.taskInfo.channelCode,
      taskId: taskId,
      done: 1,
      result: res
    })
  },
  // 找到第一个需要弹窗的签到任务，然后弹窗；没有就退出
  checkSigninTaskStatus: async function (context) {
    const {
      taskList,
    } = context.data

    let taskItem = null
    let extendJson = {}
    for (let i = 0; i < taskList.length; i++) {
      let item = taskList[i]
      if (item.eventType === 'SIGN_IN' && [0, 1].includes(item.status)) {
        try {
          extendJson = JSON.parse(item.extendJson)
        } catch (error) {
          console.log('extendJson error', extendJson)
        }

        if (extendJson.popUp) {
          taskItem = item
          break;
        }
      }
    }

    if (!taskItem) return

    const res = await signinTaskHandler.handleSign(context, taskItem.taskId)
    if (res) {
      context.setData({
        showSignModal: true,
        signInModalData: {
          taskId: taskItem.taskId,
          picture: extendJson.picture,
          tips: `恭喜你获得${taskItem.currencyNum}`,
        }
      })
      return true
    }
  }
}

const externalThirdHandler = {
  handleTask: async function (context, taskId) {
    const mktUnionData = context.mktUnionData
    let {
      taskList
    } = context.data
    const taskItem = taskList.find(item => item.id == taskId)

    const res = await model.fetch('userTodoTask', {
      'channelCode': context.data.taskInfo.channelCode,
      'taskId': taskId,
      'done': 0,
      'status': taskItem.taskStatus,
      'allianceid': mktUnionData.allianceid,
      'sid': mktUnionData.sid,
      'ouid': mktUnionData.ouid,
      'sourceid': mktUnionData.sourceid,
      'pushcode': mktUnionData.pushcode,
      'innersid': mktUnionData.innersid,
      'innerouid': mktUnionData.innerouid,
      ...context.commonParams(),
    })

    if (res.code == 100) {
      cwx.user.login({
        param: {
          sourceId: "market"
        },
      });
      return
    };

    if (res.code == 200) {
      context.customerTriggerEvent('receiveTask', {
        taskItem: context.data.taskList.find(item => item.taskId == taskId)
      })
      // 领奖成功需要提示，阻断做任务的动作
      const receiveSuccess = await context.receiveTaskSendAward(taskId, res.infoMap.receivedTaskId)
      if (receiveSuccess) {
        return
      }
      const currentItem = context.data.taskList.find(item => item.id == taskId)
      this.customJump(res, currentItem)
    }
  },
  customJump: async function (res, taskItem) {
    let path
    if (res.infoMap && res.infoMap.taskunion) {
      let params = {
        taskunion: res.infoMap.taskunion,
      }
      if (res.infoMap.openid) {
        params.openid = res.infoMap.openid
      }
      path = buildUrl(taskItem.wechatUrl, params)
    } else {
      path = taskItem.wechatUrl;
    }

    goTargetUrl(path)
  }
}

const integralTaskHandler = {
  handleIntegral: async function (context, taskId) {
    const mktUnionData = context.mktUnionData
    let {
      taskList
    } = context.data
    const taskItem = taskList.find(item => item.id == taskId)

    const res = await model.fetch('userTodoTask', {
      'channelCode': context.data.taskInfo.channelCode,
      'taskId': taskId,
      'done': 1,
      'status': taskItem.taskStatus,
      'allianceid': mktUnionData.allianceid,
      'sid': mktUnionData.sid,
      'ouid': mktUnionData.ouid,
      'sourceid': mktUnionData.sourceid,
      'pushcode': mktUnionData.pushcode,
      'innersid': mktUnionData.innersid,
      'innerouid': mktUnionData.innerouid,
      ...context.commonParams(),
    })

    if (res.code == 100) {
      cwx.user.login({
        param: {
          sourceId: "market"
        },
      });
      return
    };

    if (res.code == 200) {
      // 任务领取成功后 广播任务内容
      context.customerTriggerEvent('receiveTask', {
        taskItem
      })
      // 领奖成功需要提示，阻断做任务的动作
      const receiveSuccess = await context.receiveTaskSendAward(taskId, res.infoMap.receivedTaskId)
      if (receiveSuccess) {
        return
      }
      context.updateStatusToComplete(taskItem)
      // 任务进入完成状态 广播任务内容
      try {
        context.customerTriggerEvent('complateTask', {
          taskItem,
          taskList
        })
      } catch (error) {
        console.log('customerTriggerEvent', error)
      }

      context.setData({
        taskList
      })
      context.customerUbtTrace({
        action: '积分兑换 success',
        channelCode: context.data.taskInfo.channelCode,
        taskId: taskId,
        done: 1,
      })
      return true
    } else if (res.code == 400153) {
      // 任务领取成功后 广播任务内容
      context.customerTriggerEvent('receiveTask', {
        taskItem
      })

      taskList.find(task => task.id == taskId).taskStatus = 1;
      context.setData({
        taskList
      })
      wx.showToast({
        title: '您的积分不足，无法扣减',
        icon: 'none'
      })
      context.customerUbtTrace({
        action: '积分不足',
        channelCode: context.data.taskInfo.channelCode,
        taskId: taskId,
      })
      return
    }

    wx.showToast({
      title: res.errmsg,
      icon: 'none'
    })
    context.customerUbtTrace({
      action: '积分兑换 error',
      channelCode: context.data.taskInfo.channelCode,
      taskId: taskId,
      done: 1,
      result: res
    })
  },

}

/**
 * yo票扣减事件
 */
const yoDeductionTaskHandler = {
  handleTask: async function (context, taskId) {
    const mktUnionData = context.mktUnionData
    let {
      taskList
    } = context.data
    const taskItem = taskList.find(item => item.id == taskId)
    const extendJson = parseJson(taskItem.extendJson, {})

    const res = await model.fetch('userTodoTask', {
      'channelCode': context.data.taskInfo.channelCode,
      'taskId': taskId,
      'done': 1,
      'status': taskItem.taskStatus,
      'allianceid': mktUnionData.allianceid,
      'sid': mktUnionData.sid,
      'ouid': mktUnionData.ouid,
      'sourceid': mktUnionData.sourceid,
      'pushcode': mktUnionData.pushcode,
      'innersid': mktUnionData.innersid,
      'innerouid': mktUnionData.innerouid,
      ...context.commonParams(),
    })

    if (res.code == 100) {
      cwx.user.login({
        param: {
          sourceId: "market"
        },
      });
      return
    };

    if (res.code == 200) {
      // 任务领取成功后 广播任务内容
      context.customerTriggerEvent('receiveTask', {
        taskItem
      })
      // 领奖成功需要提示，阻断做任务的动作
      const receiveSuccess = await context.receiveTaskSendAward(taskId, res.infoMap.receivedTaskId)
      if (receiveSuccess) {
        return
      }
      context.updateStatusToComplete(taskItem)
      // 任务进入完成状态 广播任务内容
      try {
        context.customerTriggerEvent('complateTask', {
          taskItem,
          taskList
        })
      } catch (error) {
        console.log('customerTriggerEvent', error)
      }

      context.setData({
        taskList
      })
      context.customerUbtTrace({
        action: 'Yo票兑换 success',
        channelCode: context.data.taskInfo.channelCode,
        taskId: taskId,
        done: 1,
      })
      return true
    } else if (res.code == 400160) {
      // 任务领取成功后 广播任务内容
      context.customerTriggerEvent('receiveTask', {
        taskItem
      })

      taskList.find(task => task.id == taskId).taskStatus = 1;
      context.setData({
        taskList
      })
      wx.showToast({
        title: extendJson.yoNotEnoughText || res.message || '您的Yo票不足，无法兑换',
        icon: 'none'
      })
      context.customerUbtTrace({
        action: 'Yo票不足',
        channelCode: context.data.taskInfo.channelCode,
        taskId: taskId,
      })
      return
    }

    wx.showToast({
      title: res.errmsg,
      icon: 'none'
    })
    context.customerUbtTrace({
      action: 'Yo票兑换 error',
      channelCode: context.data.taskInfo.channelCode,
      taskId: taskId,
      done: 1,
      result: res
    })
  },
}

const qywxAddFriendHandler = {
  handleTask: async function (context, taskId) {
    const mktUnionData = context.mktUnionData
    let {
      taskList
    } = context.data
    const taskItem = taskList.find(item => item.id == taskId)
    const res = await model.fetch('userTodoTask', {
      'channelCode': context.data.taskInfo.channelCode,
      'taskId': taskId,
      'done': 0,
      'status': taskItem.taskStatus,
      'allianceid': mktUnionData.allianceid,
      'sid': mktUnionData.sid,
      'ouid': mktUnionData.ouid,
      'sourceid': mktUnionData.sourceid,
      'pushcode': mktUnionData.pushcode,
      'innersid': mktUnionData.innersid,
      'innerouid': mktUnionData.innerouid,
      ...context.commonParams(),
    })

    if (res.code == 100) {
      cwx.user.login({
        param: {
          sourceId: "market"
        },
      });
      return
    };

    if (res.code == 200) {
      let url = taskItem.wechatUrl
      const extendJson = parseJson(taskItem.extendJson)

      // 任务领取成功后 广播任务内容
      context.customerTriggerEvent('receiveTask', {
        taskItem
      })
      // 领奖成功需要提示，阻断做任务的动作
      const receiveSuccess = await context.receiveTaskSendAward(taskId, res.infoMap.receivedTaskId)
      if (receiveSuccess) {
        return
      }
      const mPage = cwx.getCurrentPage()
      const urlEntryId = mPage.options && mPage.options.entryId
      const {
        entryId
      } = extendJson
      if (entryId && urlEntryId) {
        url = this.replaceUrl(url, entryId, urlEntryId)
      }
      context.customerUbtTrace({
        action: '企微添加好友',
        channelCode: context.data.taskInfo.channelCode,
        taskId: taskId,
        done: 1,
        entryId,
        urlEntryId,
        url,
      })
      context.receiveTask(
        taskId,
        () => context.goTargetUrl(url)
      )
    }
  },
  replaceUrl(url, current, target) {
    return url.replace(current, target)
  }
}
// 视频号任务 视频号主页任务
const canIopenChannelsActivity = wx.canIUse('openChannelsActivity') // 视频号
const canIopenChannelsUserProfile = wx.canIUse('openChannelsUserProfile') // 视频号首页
const openWxVideoHandler = {
  handleTask: async function (context, taskId) {
    const mktUnionData = context.mktUnionData
    let {
      taskList
    } = context.data
    const taskItem = taskList.find(item => item.id == taskId)

    const res = await model.fetch('userTodoTask', {
      'channelCode': context.data.taskInfo.channelCode,
      'taskId': taskId,
      'done': 0,
      'status': taskItem.taskStatus,
      'allianceid': mktUnionData.allianceid,
      'sid': mktUnionData.sid,
      'ouid': mktUnionData.ouid,
      'sourceid': mktUnionData.sourceid,
      'pushcode': mktUnionData.pushcode,
      'innersid': mktUnionData.innersid,
      'innerouid': mktUnionData.innerouid,
      ...context.commonParams(),
    })

    if (res.code == 100) {
      cwx.user.login({
        param: {
          sourceId: "market"
        },
      });
      return
    };

    if (res.code == 200) {
      context.customerTriggerEvent('receiveTask', {
        taskItem: context.data.taskList.find(item => item.taskId == taskId)
      })
      // 领奖成功需要提示，阻断做任务的动作
      const receiveSuccess = await context.receiveTaskSendAward(taskId, res.infoMap.receivedTaskId)
      if (receiveSuccess) {
        return
      }
      const currentItem = context.data.taskList.find(item => item.id == taskId)
      const success = await this.openVideo(context, res, currentItem)
      if (success) {
        context.setTaskdone(taskItem.id)
      }
    }
  },
  openVideo: async (context, res, taskItem) => {
    const {
      openType
    } = taskItem.eventDisplayObj
    // 视频号
    if (openType == 'videoPage') {
      return openWxVideoHandler.videoPage(context, taskItem)
    }
    // 视频号首页
    if (openType == 'homePage') {
      return openWxVideoHandler.homePage(context, taskItem)
    }
    return false
  },
  videoPage: (context, taskItem) => {
    return new Promise((resolve) => {
      if (canIopenChannelsActivity) {
        const {
          finderUserName,
          feedId: feedIds
        } = taskItem.eventDisplayObj
        let feedId = feedIds[openWxVideoHandler.randomNum(0, feedIds.length)]
        feedId = feedId.split(';')[0]

        // 火车票视频号弹窗逻辑，feedId在弹窗弹出就确定了
        if (context.data.trainWxVideoModal?.feedId) {
          feedId = context.data.trainWxVideoModal?.feedId
        }

        wx.openChannelsActivity({
          finderUserName: finderUserName,
          feedId: feedId,
          success: (res) => {
            resolve(true)
            context.customerUbtTrace({
              action: 'openVideo打开成功',
            })
            context.setData({
              trainWxVideoModal: null
            })
          },
          fail: (err) => {
            resolve(false)
            context.customerUbtTrace({
              action: 'openVideo打开失败',
              err
            })
          }
        })
      } else {
        resolve(false)
        console.log('提高基础库')
        wx.showToast({
          title: '当前微信版本号过低，请升级到最新版本',
          icon: 'none'
        })
        context.customerUbtTrace({
          action: '当前微信版本号过低，请升级到最新版本',
          err
        })
      }
    })

  },
  homePage: (context, taskItem) => {
    return new Promise((resolve) => {
      if (canIopenChannelsUserProfile) {
        const {
          finderUserName
        } = taskItem.eventDisplayObj
        wx.openChannelsUserProfile({
          finderUserName: finderUserName,
          success: (res) => {
            resolve(true)
            context.customerUbtTrace({
              action: 'homePage打开成功',
            })
          },
          fail: (err) => {
            resolve(true)
            context.customerUbtTrace({
              action: 'homePage打开失败',
              err
            })
          }
        })
      } else {
        resolve(false)
        console.log('提高基础库')
        wx.showToast({
          title: '当前微信版本号过低，请升级到最新版本',
          icon: 'none'
        })
        context.customerUbtTrace({
          action: '当前微信版本号过低，请升级到最新版本',
          err
        })
      }
    })
  },
  randomNum: (m, n) => {
    let diff = n - m;
    let randFloat = Math.random(); // 生成0到1之间的随机小数
    let randInt = Math.floor(randFloat * diff); // 将随机小数乘以diff并向下取整
    return randInt + m;
  }
}

/**
 * 五星好评
 */
const goodReviewsHandler = {
  handleTask: async function (context, taskId) {
    const mktUnionData = context.mktUnionData
    let {
      taskList
    } = context.data
    const taskItem = taskList.find(item => item.id == taskId)
    const res = await model.fetch('userTodoTask', {
      'channelCode': context.data.taskInfo.channelCode,
      'taskId': taskId,
      'done': 0,
      'status': 0,
      'allianceid': mktUnionData.allianceid,
      'sid': mktUnionData.sid,
      'ouid': mktUnionData.ouid,
      'sourceid': mktUnionData.sourceid,
      'pushcode': mktUnionData.pushcode,
      'innersid': mktUnionData.innersid,
      'innerouid': mktUnionData.innerouid,
      ...context.commonParams(),
    })

    if (res.code == 100) {
      cwx.user.login({
        param: {
          sourceId: "market"
        },
      });
      return
    };

    if (res.code == 200) {
      let url = taskItem.wechatUrl
      // 任务领取成功后 广播任务内容
      context.customerTriggerEvent('receiveTask', {
        taskItem
      })
      // 领奖成功需要提示，阻断做任务的动作
      const receiveSuccess = await context.receiveTaskSendAward(taskId, res.infoMap.receivedTaskId)
      if (receiveSuccess) {
        return
      }
      const mPage = cwx.getCurrentPage()
      context.customerUbtTrace({
        action: '五星好评',
        channelCode: context.data.taskInfo.channelCode,
        taskId: taskId,
        done: 1,
        res,
        url,
      })
      console.log('五星好评', res)
      requirePlugin.async("wxacommentplugin").then((wxacommentpluginPlugin) => {
        wxacommentpluginPlugin.openComment({
          wx_pay_id: res.infoMap._wxOrderPayId, // 交易评价类账号选填
          success: (res)=>{
            console.log('plugin.openComment success', res)
          },
          fail: (res) =>{
            console.log('plugin.openComment fail', res)
          }
        })
      })
    }
  },
}

module.exports = {
  signinTaskHandler,
  externalThirdHandler,
  integralTaskHandler,
  qywxAddFriendHandler,
  openWxVideoHandler,
  yoDeductionTaskHandler,
  goodReviewsHandler,
}