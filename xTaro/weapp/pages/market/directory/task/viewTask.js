/*
* 浏览任务
*/
const model = require('./model');
import cwx, { __global } from "../../../../cwx/cwx.js";

const goTargetView = (context, taskId, url, progress=0)=> {
  const mktUnionData = context.mktUnionData
  // 第一步 领取任务
  let params = {
    'channelCode': context.data.taskInfo.channelCode,	//int	项目id
    'taskId': taskId,	//long	任务id
    'status': 0,
    'done': 0,
    'allianceid': mktUnionData.allianceid,
    'sid': mktUnionData.sid,
    'ouid': mktUnionData.ouid,
    'sourceid': mktUnionData.sourceid,
    'pushcode': mktUnionData.pushcode,
    'innersid': mktUnionData.innersid,
    'innerouid': mktUnionData.innerouid
  }
  model.requestUrl('userTodoTask', params, async (res) => {
    if (res.code == 100) {
      cwx.user.login({
        param: {
          sourceId: "market"
        },
      });
      return
    };
    if(res.code === 200) {
      // 领奖成功需要提示，阻断做任务的动作
      const receiveSuccess = await context.receiveTaskSendAward(taskId, res.infoMap.receivedTaskId)
      if (receiveSuccess) {
        return
      }
      const taskItem = context.data.taskList.find(item => item.taskId == taskId)
      context.customerTriggerEvent('receiveTask', {
        taskItem
      })
      // 第二步 当前时间存入本地
      try {
        wx.setStorage({
          key: `mkt_taskId_${taskId}`,
          data: new Date().getTime(),
          success: () => {
            // 第三步 存入成功后跳转
            const urlArr = url.split(',')
            const _url = urlArr[progress] || urlArr[0]
            context.goTargetUrl(_url, taskItem)
          },
          fail: () => {
            wx.showToast({
              title: 'something error',
              icon: 'none'
            })
          }
        })
      } catch (e) { 

      }
    } else {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
    }
  }, () => {
    wx.showToast({
      title: 'something error',
      icon: 'none'
    })
  })
}

const goTargetViewNoRepeat = (context, taskId, url, progress=0) => {
  const mktUnionData = context.mktUnionData
  // 第一步 领取任务
  let params = {
    'channelCode': context.data.taskInfo.channelCode,	//int	项目id
    'taskId': taskId,	//long	任务id
    'status': 0,
    'done': 0,
    'allianceid': mktUnionData.allianceid,
    'sid': mktUnionData.sid,
    'ouid': mktUnionData.ouid,
    'sourceid': mktUnionData.sourceid,
    'pushcode': mktUnionData.pushcode,
    'innersid': mktUnionData.innersid,
    'innerouid': mktUnionData.innerouid,
    ...context.commonParams(),
  }
  model.requestUrl('userTodoTask', params, async (res) => {
    if (res.code == 100) {
      cwx.user.login({
        param: {
          sourceId: "market"
        },
      });
      return
    };
    if(res.code === 200) {
      const taskItem = context.data.taskList.find(item => item.taskId == taskId)
      context.customerTriggerEvent('receiveTask', {
        taskItem
      })
      // 领奖成功需要提示，阻断做任务的动作
      const receiveSuccess = await context.receiveTaskSendAward(taskId, res.infoMap.receivedTaskId)
      if (receiveSuccess) {
        return
      }
      // 点击去完成
      context.customerTriggerEvent('clickTodo', {
        taskItem: context.data.taskList.find(item => item.taskId == taskId)
      });
      // 跳转
      const urlArr = url.split(',')
      const _url = urlArr[progress] || urlArr[0]
      context.goTargetUrl(_url, taskItem)
    } else {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
    }
  }, () => {
    wx.showToast({
      title: 'something error',
      icon: 'none'
    })
  })
}

// 前端检查任务是否完成（浏览任务）
const checkViewTaskStatus = async (context) => {
  let isStatusChange = false
  const { taskList } = context.data
  if(taskList && taskList.length > 0) {
    const len = taskList.length
    for(let i=0; i< len; i++) {
      switch(taskList[i].eventType) {
        case 'BROWSE':
        case 'BROWSE_DYNAMIC_URL':
          let data = wx.getStorageSync(`mkt_taskId_${taskList[i]['taskId']}`)
          console.log(`mkt_taskId_${taskList[i]['taskId']}`,data)
          const current = new Date().getTime()
          if(data && (current - data) > (taskList[i].viewTime * 1000)) {
            // 清理该任务的缓存
            wx.removeStorageSync(`mkt_taskId_${taskList[i]['taskId']}`)
            await model.fetch('userTodoTask', {
              'channelCode':context.data.taskInfo.channelCode,
              'taskId': taskList[i].taskId,
              'done': 1,
              'status': 1
            })
            isStatusChange = true
          } else {
            // 如果没完成，就回来了，那么时间重置
            try {
              wx.removeStorageSync(`mkt_taskId_${taskList[i]['taskId']}`)
            } catch (e) { 
            }
          }
          break;
        default:
          break;
      }
    }
  }
  return isStatusChange
}

export {
  goTargetView,
  checkViewTaskStatus,
  goTargetViewNoRepeat
}