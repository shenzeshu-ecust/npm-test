import {
    cwx,
    __global
} from "../../../../cwx/cwx.js";
const UTILS = require('../../common/utils')

const OS_TYPE = {
    ios: 'ios',
    android: 'android',
    windows: 'windows',
    mac: 'mac',
    devtools: 'ios'
}

function getOsTypeFactory() {
    let osType = ''
    return () => {
        if (osType) return osType
        try {
            const res = wx.getSystemInfoSync()
            osType = OS_TYPE[res.platform]
        } catch (e) {
            // Do something when catch error
        }
    }
}
const getOsType = getOsTypeFactory()

function mergeParams(params) {
    params.version = '3'
    params.platform = 'miniprogramOrigin'
    params.osType = getOsType()
}

function fetchWrap(code, name, params, opts) {
    mergeParams(params)
    return UTILS.fetch(code, name, params)
}

const model = {
    todoTask: (params) => fetchWrap('22598', 'todoTask', params),
    trigger: (params) => fetchWrap('22598', 'trigger', params),
    inviteInfo: (params) => fetchWrap('22598', 'InviteInfo', params),
    loadLegaoTemplate: (params) => fetchWrap('13458', 'loadTemplate', params),
    getActivityConfig: (params) => fetchWrap('18083', 'getActivityConfig', params), // offline的配置
    batchReceiveProjectTask: (params) => fetchWrap('22598', 'batchReceiveProjectTask', params),
    taskAssistant: (params) => fetchWrap('22598', 'taskAssistant', params),
}

export default model