import {
    cwx,
    __global
} from "../../../../cwx/cwx.js";
const UTILS = require('../../common/utils')
import utils from './utils'

async function loadTemplate(tempid, compid) {
    const templateCode = tempid
    const res = await UTILS.fetch('13458', 'loadTemplate', { templateCode }) 
    if (res.code == 0 && res.template) {
      try {
        const pageComps = res.components
        let legaoInfo = pageComps.find(item => item.id == compid)
        if (!legaoInfo) {
            console.log('tempid,compid 配置错误')
        }
        legaoInfo = utils.parseJson(legaoInfo.property)
        return legaoInfo
      } catch (e) {
        console.log('tpl JSON parse err: ', e)
        return
      }
    } else {
        console.log('tempid,compid 配置错误')
    }
}
const model = {
    loadTemplate: loadTemplate,
    getSignDetail: (params) => UTILS.fetch('22598', 'getSignDetail', params),
    getSignRule: (params) => UTILS.fetch('22598', 'getSignRule', params),
    signToday: (params) => UTILS.fetch('22598', 'signToday', params),
}
export default model