/*
 * 订阅任务
 */
const model = require('./model');
import {
  cwx
} from "../../../../cwx/cwx.js";

const receiveSubscribeTask = (context, taskId, templateIdList) => {
  const mktUnionData = context.mktUnionData
  model.requestUrl('userTodoTask', {
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
  }, async (res) => {
    if (res.code == 100) {
      cwx.user.login({
        param: {
          sourceId: "market"
        },
      });
      return
    };
    if (res.code === 200) {
      context.customerTriggerEvent('receiveTask', {
        taskItem: context.data.taskList.find(item => item.taskId == taskId)
      })
      // 领奖成功需要提示，阻断做任务的动作
      const receiveSuccess = await context.receiveTaskSendAward(taskId, res.infoMap.receivedTaskId)
      if (receiveSuccess) {
        return
      }
      toSubscribeMsg(context, taskId, templateIdList)
    } else {
      wx.showToast({
        title: res.errmsg,
        icon: 'none'
      })
    }
  }, () => {
    wx.showToast({
      title: res.errmsg,
      icon: 'none'
    })
  })
}

const toSubscribeMsg = async (context, taskId, templateIdList) => {
  let taskItem = context.data.taskList.find(item => item.taskId == taskId)
  if (!taskItem) return

  let eventDisplay = {}
  try {
    eventDisplay = JSON.parse(taskItem.eventDisplay)
  } catch (error) {
    console.log('eventDisplay error', eventDisplay)
  }
  templateIdList = eventDisplay.subMessageConf?.map(c => c.tmpId);

  if (!templateIdList || templateIdList.length == 0) {
    return;
  }
  cwx.mkt.subscribeMsg(templateIdList, async (data) => {
    if (data && data.templateSubscribeStateInfos) {
      console.log('-------------mkt task component 订阅消息成功---------------------');
      context.customerUbtTrace({
        action: 'subscribeMsgSuccess',
        projectCode: context.data.projectCode,
        taskId: taskId
      })

      // 更新任务状态
      model.requestUrl('userTodoTask', {
        'channelCode': context.data.taskInfo.channelCode,
        'taskId': taskId,
        'done': 1,
        'status': 1
      }, (res) => {
        if (res.code === 200) {
          context.getTaskList()
        } else {
          wx.showToast({
            title: res.errmsg,
            icon: 'none'
          })
        }
      }, () => {
        wx.showToast({
          title: res.errmsg,
          icon: 'none'
        })
      })
      console.log('开始执行completeTask')
      context.customerTriggerEvent('completeTask', {
        code: 200,
        eventType: 'MP_SUBSCRIBE'
      })
    } else {
      context.customerUbtTrace({
        action: 'subscribeMsgFail',
        projectCode: context.data.projectCode,
        taskId: taskId
      })

      console.error('----------------订阅消息失败-----------------', JSON.stringify(data));
    }
  }, (err) => {
    console.error('----------------订阅消息失败 err-----------------', JSON.stringify(err));
    context.customerUbtTrace({
      action: 'subscribeMsgFail',
      projectCode: context.data.projectCode,
      taskId: taskId
    })
  })
}

export {
  receiveSubscribeTask
}