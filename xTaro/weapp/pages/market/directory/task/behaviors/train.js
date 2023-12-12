/**
 * 火车票的mixin 这种方式方便快速上下线
 * 只有交互逻辑
 * http://conf.ctripcorp.com/pages/viewpage.action?pageId=1490021318
 */
import { openWxVideoHandler } from '../taskType'
import {
  cwx
} from "../../../../../cwx/cwx.js";
module.exports = Behavior({
  properties: {

  },
  data: {
    trainShowTipsContent: '',
    trainAwardData: null,
    trainWxVideoModal: null, // 展示视频号任务弹窗
  },
  attached: function () {
    // setTimeout(() => {
    //   cwx.Observer.noti('train_task_event', { eventName: 'assistSuccess', data: { assistCount:2, awardText: '送您一张优惠券' } })
    // }, 4000)
    this.onTrainEvent = this._onTrainEvent.bind(this)
    cwx.Observer.addObserverForKey('train_task_event', this.onTrainEvent)
  },
  detached: function () {
    cwx.Observer.removeObserverForKey('train_task_event', this.onTrainEvent)
  },
  methods: {
    // 点击问号提示
    handleTips(e) {
      const taskId = e.target.dataset.taskid
      this.showtrainTips(taskId)
    },

    // 火车票提示
    showtrainTips(taskId) {
      const taskItem = this.data.taskList.find(item => item.taskId == taskId)
      const tips = taskItem.extendObj.trainTips
      this.setData({
        trainShowTipsContent: tips,
      })
      // wx.showToast({
      //   title: tips,
      //   icon: 'none'
      // })
    },
    handleCloseTrainTips() {
      this.setData({
        trainShowTipsContent: '',
      })
    },
    handleCloseTrainAwardModal() {
      this.setData({
        trainAwardData: null,
      })
    },
    /**
     * 计算抽奖次数信息
     * 计算助力包信息
     */
    completeTrainAward(taskList) {
      function complete(taskList, typeFn) {
        let totalCount = 0
        let receivedCount = 0
        taskList.forEach(item => {
          let currencyDtoList = item.currencyDtoList
          currencyDtoList.forEach(curreny => {
            if (typeFn(curreny.type)) {
              let acount = curreny.number
              if (item.status == 3) {
                receivedCount += acount
              }
              totalCount += acount
            }
          })
        })
        return {
          totalCount,
          receivedCount,
          remaindCount: totalCount - receivedCount
        }
      }
      // 乐高次数
      const choujiang = complete(taskList, isLegaoChoujiang)
      const zhuli = complete(taskList, isSuduPackage)
      return {
        choujiang,
        zhuli
      }
    },
    handleTrainAwardItemShow(res) {
      const data = completeTrainAwardItem(res)
      if (data.showType == 3) {
        wx.showToast({
          title: '领取成功',
        })
      } else {
        this.setData({
          trainAwardData: data
        })
      }
    },
    completeTrainAwardItem: completeTrainAwardItem,
    _onTrainEvent({eventName, data}){
      switch (eventName) {
        case "assistSuccess":
          this.handleAssistSuccessToShowPopup(data)
          break;
      
        default:
          break;
      }
    },
    // 火车票助力成功，通知任务弹出视频号弹窗
    handleAssistSuccessToShowPopup(data) {
      const _taskList = this.data.taskList.filter(item => {
        return item.eventType === 'OPEN_WX_VIDEO' && [0, 1].includes(+item.status) && item.eventDisplayObj.openType === 'videoPage'
      })
      if (_taskList.length === 0) {
        console.log('tasklist不存在视频号任务或者次任务已完成')
        cwx.Observer.noti('mkt_task_event', { eventName: 'videoModal', data: { status: 'openFail', reason: 'tasklist不存在视频号任务或者次任务已完成' } })
        return
      }
      if (_taskList.length >= 1) {
        let taskItem = _taskList.find(item => {
          const {
            feedId: feedIds
          } = item.eventDisplayObj
          let feedIdStr = feedIds[openWxVideoHandler.randomNum(0, feedIds.length)]
          let [ feedId, feedImg ] = feedIdStr.split(';')
          return  feedId && feedImg
        })
        if (taskItem) {
          const {
            feedId: feedIds
          } = taskItem.eventDisplayObj
          let feedIdStr = feedIds[openWxVideoHandler.randomNum(0, feedIds.length)]
          let [ feedId, feedImg ] = feedIdStr.split(';')
          const zlbMoreCount = taskItem.currencyDtoList.find(item => isSuduPackage(item.type))?.number
          if (feedId && feedImg) {
            this.setData({
              trainWxVideoModal: {
                zlbCount: data.assistCount,
                awardText: data.awardText,
                cardImg: feedImg,
                zlbMoreCount,
                taskId: taskItem.id,
                feedId, 
                feedImg
              }
            })
            cwx.Observer.noti('mkt_task_event', { eventName: 'videoModal', data: { status: 'openSuccess' } })
          }
        } else {
          cwx.Observer.noti('mkt_task_event', { eventName: 'videoModal', data: { status: 'openFail', reason: '视频号任务没有配置视频号id或者图片' } })
          console.log('视频号任务没有配置视频号id或者图片')
        }
      }

      
    },
    handleCloseTrainVideoModal() {
      this.setData({
        trainWxVideoModal: null
      })
      cwx.Observer.noti('mkt_task_event', { eventName: 'videoModal', data: { status: 'close' } })
    },
    // 点击去看视频号按钮
    handleTrainWxVideoTask() {
      cwx.Observer.noti('mkt_task_event', { eventName: 'videoModal', data: { status: 'clickBtn' } })
      this.handleTask(this.data.trainWxVideoModal.taskId)
    }
  }
})
const AWARD_TYPE = {
  jiasubao: 8,
  jiasubaoDingdan: 15,
  legaoChoujiang: 4
}
/**
 * 展示逻辑
 * 1. 只有加速包：展示，n个助力包 + 省下¥10n
 * 2. 加速包+抽奖机会：展示，n个助力包 + 抽奖机会+m
 * 3. 其他：toast提示
 * 0: {id: 1, name: "积分", worth: 0.004, number: 1, type: 1, awardNumberType: 1, minNumber: 0, maxNumber: 0,…}
awardNumberType: 1
icon: "https://pages.c-ctrip.com/union/game/task/jifen.png"
id: 1
maxNumber: 0
minNumber: 0
name: "积分"
number: 1
type: 1
worth: 0.004
 * 
 */
function isSuduPackage(type) {
  return type == AWARD_TYPE.jiasubao || type == AWARD_TYPE.jiasubaoDingdan
}

function isLegaoChoujiang(type) {
  return type == AWARD_TYPE.legaoChoujiang
}

function getPriceBySuduPkg(count) {
  return count * 2
}

function completeTrainAwardItem(data) {
  const {
    currencyDtoList,
    awardDesc
  } = data
  let hasSuduPackage = false
  let hasLegaoChoujiang = false
  let showType = 0
  let zhuliCount = 0
  let choujiangCount = 0

  currencyDtoList.forEach(item => {
    let {
      type,
      number
    } = item
    if (isSuduPackage(type)) {
      zhuliCount += number
      hasSuduPackage = true
    }
    if (isLegaoChoujiang(type)) {
      choujiangCount += number
      hasLegaoChoujiang = true
    }
  })
  if (hasSuduPackage && hasLegaoChoujiang) {
    showType = 2
    return {
      zhuliCount,
      price: getPriceBySuduPkg(zhuliCount),
      choujiangCount,
      showType
    }
  } else if (hasSuduPackage && !hasLegaoChoujiang) {
    showType = 1
    return {
      zhuliCount,
      price: getPriceBySuduPkg(zhuliCount),
      showType
    }
  } else {
    showType = 3
    return {
      awardDesc,
      showType
    }
  }

}