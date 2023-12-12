/*
* 视频号任务
* 1. 授权头像昵称
* 2. 跳转配置的H5页面
* 3. 用户点赞视频号
*/
import { cwx } from "../../../../cwx/cwx.js";
const mPage = cwx.getCurrentPage();
const model = require('./model');
const DEFAULT_HEADIMG = 'https://images3.c-ctrip.com/marketing/2020/08/xcx_energy/default.png';
const DEFAULT_NAME = '神秘用户';

const handleTripVideo = (context, url, taskId) => {
  const mktUnionData = context.mktUnionData || {}
  context.customerUbtTrace({
    action: 'handleTripVideo',
    projectCode: context.data.projectCode,
    taskId: taskId
  })

  // 接任务
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
  }, async (res) => {
    if (res.code == 100) {
      cwx.user.login({
        param: {
          sourceId: "market"
        },
      });
      return
    }
    // 领奖成功需要提示，阻断做任务的动作
    const receiveSuccess = await context.receiveTaskSendAward(taskId, res.infoMap.receivedTaskId)
    if (receiveSuccess) {
      return
    }
    context.customerTriggerEvent('receiveTask', {
      taskItem: context.data.taskList.find(item => item.taskId == taskId)
    })
    context.goTargetUrl(url)
  })
  
}

export {
  handleTripVideo
}