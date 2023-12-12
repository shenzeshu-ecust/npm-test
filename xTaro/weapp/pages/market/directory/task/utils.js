import {
    cwx
  } from "../../../../cwx/cwx.js";
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

function handleSubScribe(templateIdList, projectCode, taskId, context) {
    return new Promise(resolve => {
        cwx.mkt.subscribeMsg(templateIdList, async (data) => {
              if (data && data.templateSubscribeStateInfos) {
              console.log('-------------mkt task component 订阅消息成功---------------------');
              resolve(data)
              context.customerUbtTrace({
                action: 'beforeTodo 订阅成功',
                projectCode: projectCode,
                taskId: taskId,
                data
              })
            } else {
              resolve(data)
              context.customerUbtTrace({
                action: 'beforeTodo 订阅失败',
                projectCode: projectCode,
                taskId: taskId,
                data
              })
              console.error('----------------订阅消息失败-----------------', JSON.stringify(data));
            }
          }, (err) => {
            resolve(err)
            console.error('----------------订阅消息失败 err-----------------', JSON.stringify(err));
            context.customerUbtTrace({
              action: 'beforeTodo 订阅失败',
              projectCode: projectCode,
              taskId: taskId,
              err: err
            })
        })
    })
}
// 结束时间之前 触发一次事件
// 有存储值表示执行过一次，执行过就判断时间是够过期
function createTriggerFnByTime(fn, { key, itemKey, endTime }) {
    let storageData = wx.getStorageSync(key) || []
    const current = storageData.find(item => item.itemKey == itemKey)
    const now = Date.now()
    const end = current?.endTime
    if (current && end < now) {
        storageData = storageData.filter(item => item.itemKey != itemKey)
        wx.setStorageSync(key, storageData)
    }
    return function(...args) {
        const _current = storageData.find(item => item.itemKey == itemKey)
        if (!_current) {
            storageData.push({ itemKey, endTime })
            wx.setStorageSync(key, storageData)
            return fn(...args)
        } 
    }
}

function isH5(url) {
    return url.startsWith('http');
}

function parseJson(str, defVal = {}) {
  let ret = defVal
  try {
    ret = JSON.parse(str)
  } catch (error) {
  }
  return ret
}

const RATE_LEVEL_MAP = {
    1: '审核中',
    2: '审核未通过',
    3: '一般',
    4: '优质',
    5: '已过期'
}

// 组合类型{1:non,无组合;2:group,组合;3:exclude,互斥;4:classify,分类}
export const COMB_TYPE = {
  normal: 1,
  group: 2,
  MutuallyExclusive: 3,
  classify: 4,
}

// 排序分类
export const SORT_TYPE = {
    default: 1,  // 默认排序 按照状态排序 sortType = 1
    byIndex: 2,  // 固定排序，按照后台配置sort升序排列
    byDoneDown: 3,  // 固定排序 + 已完成沉底
    class: 'class', // 分类推荐排序
}

/**
 * 
 * 任务列表存在 负数，就是用负数置顶逻辑，忽略status状态的排序 同时根据sort排序，越小越靠前
 * 其他的都按照正常的顺序排列 不变
 * 
 */
const sortByTop = (taskList) => {
    const hasNegative = taskList.find(item => item.sort < 0)
    if (!hasNegative) {
        return taskList
    }
    let toplist = []
    let normalList = []
    taskList.forEach(item => {
        if (item.sort < 0) {
            toplist.push(item)
        } else {
            normalList.push(item)
        }
    })
    toplist = toplist.sort((a, b) => a.sort - b.sort)
    return [...toplist, ...normalList]
  }

module.exports = {
  buildUrl,
  genUrl,
  handleSubScribe,
  createTriggerFnByTime,
  isH5,
  parseJson,
  RATE_LEVEL_MAP,
  COMB_TYPE,
  SORT_TYPE,
  sortByTop,
}