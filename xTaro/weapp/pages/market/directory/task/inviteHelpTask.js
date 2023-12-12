const model = require('./model');
import cwx, { __global } from "../../../../cwx/cwx.js";
import localUtils from './utils'

import {compareVersion} from '../../common/utils'

const receiveInviteHelpTask = (context, taskId) => {
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
      return;
    }
    if (res.code == 200) {
      // 领奖成功需要提示，阻断做任务的动作
      const receiveSuccess = await context.receiveTaskSendAward(taskId, res.infoMap.receivedTaskId)
      if (receiveSuccess) {
        return
      }
      const currentItem = context.data.taskList.find(item => item.id == taskId)
      context.customerTriggerEvent('receiveTask', {
        taskItem: currentItem
      })
      // 点击去完成
      context.customerTriggerEvent('clickTodo', {
        taskItem: currentItem
      });
      const wechatMp = await customShare(res, currentItem, context)
      if (wechatMp) {
        context.goTargetUrl(wechatMp, currentItem)
      }
    }
  }, () => {
    wx.showToast({
      title: res.errmsg,
      icon: 'none'
    })
  })
}

const toReceiveSmallAward = async (context, taskItem, index) => {
  const mktUnionData = context.mktUnionData
  let taskinvite = JSON.parse(taskItem.eventDisplay)?.taskinvite
  let id = taskItem.itemList[index].data.id

  const taskList = context.data.taskList
  const res = await model.fetch('inviteHelpAward', {
    'id': id,
    'token': taskinvite,
    'allianceid': mktUnionData.allianceid,
    'sid': mktUnionData.sid,
    'ouid': mktUnionData.ouid,
    'sourceid': mktUnionData.sourceid,
    'pushcode': mktUnionData.pushcode,
    'innersid': mktUnionData.innersid,
    'innerouid': mktUnionData.innerouid
  })

  if (res.code == 100) {
    cwx.user.login({
      param: {
        sourceId: "market"
      },
    });
    return;
  }
  if (res.code == 200) {
    taskItem.itemList[index].data.awardStatus = '1'
    context.setData({
      taskList
    })
    wx.showToast({
      title: '领取成功 前往我的-优惠券查看',
      icon: 'none'
    })
    try {
      context.customerUbtTrace({
        type: '助力领奖',
        taskId: taskItem.taskId
      })
    } catch (error) {
      
    }
    
    return
  }

  wx.showToast({
    title: res.message,
    icon: 'none'
  })
  
}

async function resolveParams(res, taskItem, context) {
  let sharePath,
    posterBg,
    shareTitle,
    shareBg,
    bgdPic,
    activityId,
    pageTitle,
    btnPic,
    userName,
    userAvatar,
    queryQrCodeCoordinate,
    queryHeadCoordinate,
    queryNicknameCoordinate;

  let eventDisplay = JSON.parse(taskItem.eventDisplay)

  if (res.infoMap && res.infoMap.taskinvite) {
    const userInfo = await getUserAvatar(res.infoMap.taskinvite)
    userName = userInfo.userName
    userAvatar = userInfo.userAvatar

    sharePath = buildUrl(eventDisplay.activityEndUrl, {
      taskinvite: res.infoMap.taskinvite
    })
    posterBg = res.infoMap.posterBg;
    shareTitle = res.infoMap.shareTitle;
    shareBg = res.infoMap.shareBg;
    activityId = res.infoMap.activityId;
    bgdPic = res.infoMap.bgdPic;
    pageTitle = res.infoMap.pageTitle;
    btnPic = res.infoMap.btnPic;
    queryQrCodeCoordinate = res.infoMap.queryQrCodeCoordinate;
    queryHeadCoordinate = res.infoMap.queryHeadCoordinate;
    queryNicknameCoordinate = res.infoMap.queryNicknameCoordinate
  } else {
    const userInfo = await getUserAvatar(eventDisplay.taskinvite)
    userName = userInfo.userName
    userAvatar = userInfo.userAvatar

    sharePath = eventDisplay.activityEndUrl;
    posterBg = eventDisplay.posterBg;
    shareTitle =eventDisplay.shareTitle;
    shareBg = eventDisplay.shareBg;
    activityId = eventDisplay.activityId;
    bgdPic = eventDisplay.bgdPic;
    pageTitle = eventDisplay.pageTitle;
    btnPic = eventDisplay.btnPic;
    queryQrCodeCoordinate = eventDisplay.queryQrCodeCoordinate;
    queryHeadCoordinate = eventDisplay.queryHeadCoordinate;
    queryNicknameCoordinate = eventDisplay.queryNicknameCoordinate
  }
  // 仅用于lol
  if (context?.data?.posterBgStr) {
    posterBg = context?.data?.posterBgStr
  }
  if (localUtils.isH5(sharePath)) {
    sharePath = `pages/market/web/index?from=${encodeURIComponent(sharePath)}`;
  }
  if (!activityId) {
    activityId = __global.env === 'fat' ? 'MKT_ShareSubscribe_1626424771459' : 'MKT_ShareSubscribe_1626328166703'
  }
  return {
    sharePath,
    posterBg,
    shareTitle,
    shareBg,
    bgdPic,
    activityId,
    pageTitle,
    btnPic,
    userName,
    userAvatar,
    queryQrCodeCoordinate,
    queryHeadCoordinate,
    queryNicknameCoordinate
  }
}

async function customShare(res, taskItem, context) {
  const {
    sharePath,
    posterBg,
    shareTitle,
    shareBg,
    bgdPic,
    activityId,
    pageTitle,
    btnPic,
    userName,
    userAvatar,
    queryQrCodeCoordinate,
    queryHeadCoordinate,
    queryNicknameCoordinate
  } = await resolveParams(res, taskItem, context)

  let params = {
    activityId,
    sharePath: encodeURIComponent(sharePath),
    posterBgImg: encodeURIComponent(posterBg),
    shareTitle,
    shareBg: encodeURIComponent(shareBg),
    bgdPic: encodeURIComponent(bgdPic),
    btnPic: encodeURIComponent(btnPic),
    pageTitle,
    userAvatar: encodeURIComponent(userAvatar),
    userName,
    queryQrCodeCoordinate,
    queryHeadCoordinate,
    queryNicknameCoordinate
  }
  let mPage = cwx.getCurrentPage()
  const isTT = mPage.route.indexOf('addTrafficActivity') > -1
  const ver = cwx.wxSystemInfo.SDKVersion;
  let caniuse = compareVersion(ver, '2.25.2')
  if (caniuse >= 0 && !isTT) {
    context.setData({
      shareConfig: {
        sharePath: sharePath, //分享路径
        shareTitle: shareTitle,// 标题
        shareBg: shareBg,// 卡片图
        pageBottomShareType: 'C',
        posterBgImg: posterBg,
        userAvatar: userAvatar,
        userName: userName,
        // hideAvatar: true,
      },
      showSharePanel: true,
    })
  } else{
    // 天天领现金需要这个路径
    let wechatMp = genUrl('/pages/market/directory/relayPage/index', params)
    return wechatMp
  }
}

async function getUserAvatar(token) {
  const res = await model.fetch('inviteInfo', {
    eventType: 'INVITE_HELP',
    token
  })

  if (res.code === 200) {
    const {
      headUrl,
      nickName
    } = res.inviteInfoDto
    return {
      userAvatar: headUrl,
      userName: nickName
    }
  }
  return {
    userAvatar: '',
    userName: ''
  }
}

function buildUrl(url, queryConfig) {
  if (!url) return ''
  
  const pageUrl = url.split('?')[0]
  let paramsStr = url.split('?')[1]
  let params = {}
  if (paramsStr) {
    let paramsArr = paramsStr.split('&')
    paramsArr.forEach((item) => {
      let key = item.split('=')[0]
      let value = item.split('=')[1]
      params[key] = value
    })
  }
  params = {
    ...params,
    ...queryConfig
  }
  return genUrl(pageUrl, params)
}

function genUrl(url, params) {
  let ret = url

  let keys = Object.keys(params)
  keys = keys.filter(key => {
      if (params[key] == '' || params[key] == 'undefined' || typeof params[key] == 'undefined') {
          return false
      }
      return true
  })
  keys.forEach((key, index) => {
      ret += `${index === 0 ? '?' : '&'}${key}=${params[key]}`
  })
  return ret
}

module.exports = {
  receiveInviteHelpTask,
  toReceiveSmallAward,
  customShare
}