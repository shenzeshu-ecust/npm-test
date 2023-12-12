import cwx from '../../../../cwx/cwx';
import localUtils from './utils';
const model = require('./model');

const handleTask = (context, taskId) => {
    const taskItem = context.data.taskList.find(item => item.taskId == taskId)
    const eventDisplay = localUtils.parseJson(taskItem.eventDisplay)
    if (eventDisplay._rateLevel == 1) {
        wx.showToast({
            title: '审核中 请耐心等待',
            icon: 'none'
          })
        return
    }
    if (eventDisplay._rateLevel == 2  && eventDisplay._multipleAudit != 'yes') {
        wx.showToast({
            title: '仅可提交一次',
            icon: 'none'
          })
        return
    }

    const mktUnionData = context.mktUnionData
    model.requestUrl('userTodoTask', {
      'channelCode':context.data.taskInfo.channelCode,
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
    }, async (res)=>{
      if (res.code == 100) {
        cwx.user.login({
          param: {
            sourceId: "market"
          },
        });
        return
      };
      if(res.code === 200) {
        context.customerTriggerEvent('receiveTask', {
          taskItem: context.data.taskList.find(item => item.taskId == taskId)
        })
        // 领奖成功需要提示，阻断做任务的动作
        const receiveSuccess = await context.receiveTaskSendAward(taskId, res.infoMap.receivedTaskId)
        if (receiveSuccess) {
          return
        }
        // 跳转审核页面
        const channelCode = context.data.taskInfo.channelCode
        const tempid = context.data.tempid
        const compid = context.data.compid
        cwx.navigateTo({
          url: `/pages/market/directory/taskPage/notesAudit?channelCode=${channelCode}&taskId=${taskId}&tempid=${tempid}&compid=${compid}`,
        })
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


export {
    handleTask,
    
}