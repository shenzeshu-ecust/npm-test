import cwx from '../../../../../cwx/cwx'
import { getConfigInfoJSON } from '../../common'
import util from '../../util'
import { shared } from '../../trainConfig'
let buConfigs = {}
function getBuList(ConfigKey) {
    if (!shared.isCtripApp) {
        return Promise.resolve()
    }
    if (buConfigs[ConfigKey]) {
        return Promise.resolve(buConfigs[ConfigKey])
    }

    return getConfigInfoJSON(ConfigKey).then(data => {
        buConfigs[ConfigKey] = data

        return data
    })
}

function goBu(url) {
    if (url == "/pages/home/homepage") {
        return util.reLaunchCHome()
    }
    // 用原生跳转是为了避免 data 被覆盖的问题
    cwx.navigateTo({
        url,
    })
}

function goCHome(param) {
    return util.reLaunchCHome(param)
}

export { getBuList, goBu, goCHome }
export const buMapMixin = {
    methods: {
        getBuList,
        goBu,
        goCHome,
    },
}
