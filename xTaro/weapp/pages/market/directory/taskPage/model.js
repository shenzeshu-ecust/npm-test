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
    params.version = '4'
    params.platform = 'miniprogramOrigin'
    params.osType = getOsType()
}

function fetchWrap(code, name, params = {}, opts) {
    mergeParams(params)
    return UTILS.fetch(code, name, params)
}

const model = {
    taskAssistant: (params) => fetchWrap('22598', 'taskAssistant', params),
    userTaskList: (params) => fetchWrap('22598', 'userTaskList', params),
    batchReceiveProjectTask: (params) => fetchWrap('22598', 'batchReceiveProjectTask', params),
    batchUploadPicture: (params) => fetchWrap('22598', 'batchUploadPicture', params),
    taskConfig: (params) => fetchWrap('22559', 'taskConfig', params),
    loadLegaoTemplate: (params) => fetchWrap('13458', 'loadTemplate', params),
}
export default model