import { cwx, CPage, __global } from "../../../../cwx/cwx.js";


function resolveStyles(obj) {
  let ret = ''
  for (let key in obj) {
    ret += `${key}: ${obj[key]};`
  } 
  return ret
}

async function getSystemInfo() {
  let key = 'mkt_system_info'
  let systemInfo = wx.getStorageSync(key)
  if (systemInfo) return systemInfo

  systemInfo = await wx.getSystemInfo()
  wx.setStorageSync(key, systemInfo)
  return systemInfo
}

function jsonParse(str, defaultType = 'object') {
  let ret
  try {
    ret = JSON.parse(str)
  } catch (error) {
    if (defaultType == 'object') ret = {}
    if (defaultType == 'array') ret = []
  }
  return ret
}

module.exports = {
  resolveStyles,
  getSystemInfo,
  jsonParse
}

