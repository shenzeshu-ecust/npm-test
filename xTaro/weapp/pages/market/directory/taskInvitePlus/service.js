import {
  cwx,
  __global
} from "../../../../cwx/cwx.js";
const UTILS = require('../../common/utils.js');
import model from './model'
import {
  eventMenu
} from '../task/index'
import localUtils from './utils'

class TaskService {
  async getTaskList(args = {}) {
    let channelCode = args.channelCode
    const res = await model.userTaskList({
      channelCode
    })
    if (res.code == 200) {
      let taskList = this.__resolveTask(res)
      taskList = this.__resolveAvatarData(taskList)
      let inviteExtendDetailList = []
      const res2 = await model.queryInviteExtend({
        channelCode: channelCode,
        taskId: taskList[0]?.id
      })
      if (res2.code == 200) {
        inviteExtendDetailList = res2?.inviteExtend?.inviteExtendDetailList
      }
      if (taskList) {
        taskList.forEach(item => {
          item.channelCode = channelCode
          item.inviteExtendDetailList = inviteExtendDetailList
          if (item.itemList) {
            item.itemList.forEach((avatar, index) => {
              avatar.currenyData = inviteExtendDetailList[index]
            })
          }
        })
      }
      return {
        taskList,
        channelCode: res.channelCode,
        isLogin: res.isLogin,
      }
    } else {
      return res
    }
  }
  __resolveTask({
    todoTaskList,
    finishTaskList
  }) {
    return [...todoTaskList, ...finishTaskList]
  }
  __resolveAvatarData = (taskList) => {
    const resolveAvatarList = (list = [], target) => {
      if (list.length < 4) {
        let temp = Array.from({
          length: target - list.length
        }).fill({})
        list.push(...temp)
      }
      return list
    }

    let listMap = {}
    // 邀请任务，处理头像
    taskList.forEach(item => {
      const hasAvatar = [eventMenu.inviteHelp, eventMenu.inviteTaskAB].includes(item.eventType)
      if (hasAvatar) {
        item.itemList = resolveAvatarList(item.itemList, item.eventTarget)
        const curMap = listMap[item.id]
        if (curMap) {
          item.itemList.forEach((m, index) => {
            item.itemList[index] = {
              ...m,
              acount: curMap.awards[index]
            }
          })
        }
      }
    })
    return taskList
  }
  batchReceiveProjectTask = async (args = {}) => {
    const channelCode = args.channelCode
    const res = await model.batchReceiveProjectTask({
      channelCodeList: [channelCode],
    })
    if (res.code === 200) {}
  }
  async receiveTask(taskItem, context) {
    const res = await model.todoTask({
      channelCode: taskItem.channelCode,
      taskId: taskItem.id,
      status: taskItem.status,
      done: 0,
    })
    if (res.code == 100) {
      toLogin()
      return;
    }
    if (res.code == 200) {
      // 分享
      this._handleShare(taskItem, res, context)
    }
  }
  async todoTask(taskItem, context) {
    const res = await model.todoTask({
      channelCode: taskItem.channelCode,
      taskId: taskItem.id,
      status: taskItem.status,
      done: 0,
    })
    if (res.code == 100) {
      toLogin()
      return;
    }
    if (res.code == 200) {
      // 分享
      this._handleShare(taskItem, res, context)
    }
  }
  async receiveAward(taskItem) {
    const res = await model.awardTask({
      channelCode: taskItem.channelCode,
      taskId: taskItem.id,
    })
    if (res.code == 100) {
      toLogin()
    }
    return res
  }
  async receiveSmallAward(taskItem, index) {
    let taskinvite = JSON.parse(taskItem.eventDisplay)?.taskinvite
    let id = taskItem.itemList[index]?.data?.id
    const res = await model.inviteHelpAward({
      id: id,
      token: taskinvite,
    })
    if (res.code == 100) {
      toLogin()
    }
    return res
  }

  async _handleShare(taskItem, res = {}, context) {
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
    } = await resolveParams(res, taskItem)

    context.setData({
      shareConfig: {
        activityId,
        sharePath: sharePath, //分享路径
        shareTitle: shareTitle, // 标题
        shareBg: shareBg, // 卡片图
        pageBottomShareType: 'C',
        posterBgImg: posterBg,
        userAvatar: userAvatar,
        userName: userName,
      },
      showSharePanel: true,
    })
  }
  replacePlaceHolder = (url, place, target) => {
    return url.replace(place, target)
  }
  _customerShare = async (shareConfig) => {

  }
  // A 好友 B朋友圈 C都有
  resolvePageBottomType = (shareMode) => {
    let pageBottomShareType = 'C'
    if (shareMode) {
      const friendIcon = shareMode[0]
      const circleIcon = shareMode[1]
      if (circleIcon === "none") {
        pageBottomShareType = 'A'
      }
      if (friendIcon === 'none') {
        pageBottomShareType = 'B'
      }
    } else {
      pageBottomShareType = 'C'
    }
    return pageBottomShareType
  }
}

function toLogin() {
  cwx.user.login({
    param: {
      sourceId: "market"
    },
  });
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
    shareTitle = eventDisplay.shareTitle;
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

async function getUserAvatar(token) {
  const res = await model.inviteInfo({
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

export default new TaskService()