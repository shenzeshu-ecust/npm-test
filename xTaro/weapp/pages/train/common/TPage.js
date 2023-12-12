import { CPage, cwx } from '../../../cwx/cwx'
import {
    ConfigInfoModel,
} from './model'
import { getConfigByKeysPromise } from '../common/common'

let shareConfig = null

const shareConfigPromise = new Promise((resolve, reject) => {
    ConfigInfoModel(
        {
            ConfigKey: 'train_wx_webview_share_new_config',
        },
        res => {
            if (res.ConfigInfo && res.ConfigInfo.Content) {
                resolve(JSON.parse(res.ConfigInfo.Content))
            } else {
                reject(res)
            }
        },
        reject,
    )
})

const getOfflineConfig = getConfigByKeysPromise({
    keys: ["train-wx-page-offline-config"]
}).then(res => {
    if (res.resultCode != 1) {
        throw '获取配置失败'
    }
    return res.configs[0].data
}).catch(e => console.log(e))

shareConfigPromise.then(data => {
    shareConfig = data
})

const TPage = (pageData) => {
    if (pageData.onShareAppMessage) {
        try {
            const onShareAppMessage = pageData.onShareAppMessage;
            function wrapOnShareAppMessage (res) {
                let originShareData = onShareAppMessage.call(this,res) || {}
                const promise = new Promise((resolve, reject) => {
                    const getFinalData = (data) => {
                        const { path } = data
                        let finalPath = path
                        shareConfig.forEach(item => {
                            const reg = new RegExp(`^${item.originalPath}`)
                            if (reg.test(path)) {
                                finalPath = `${item.targetPath}?url=${encodeURIComponent(path)}`
                            }
                        })

                        return {
                            ...data,
                            path: finalPath
                        }
                    }

                    const getShareConfig = (data) => {
                        shareConfigPromise.then((configData) => {
                            shareConfig = configData
                            resolve(getFinalData(data))
                        }).catch(reject)
                    }

                    if (originShareData.promise) {
                        originShareData.promise.then((data) => {
                            getShareConfig(data)
                        }).catch(reject)
                    } else {
                        getShareConfig(originShareData)
                    }
                })

                return {...originShareData, promise}
            }

            function wrapOnShow(res) {
                const onShowFn = pageData.onShow;
                onShowFn && onShowFn.call(this,res) 
                const pages = getCurrentPages();
                if(pages.length > 0) {
                    const currentPage = pages[pages.length - 1]; 
                    const currentPagePath = currentPage?.route; 
                    getOfflineConfig.then(data => 
                        data?.forEach(item => {
                            const reg = new RegExp(`^${item.offlinePath?.slice(1)}`)
                            if (reg.test(currentPagePath)) {
                                cwx.redirectTo({
                                    url: `/pages/train/offlinePage/offlinePage?title=${item.offlineTitle}&subtitle=${item.offlineSubTitle}`,
                                })
                            }
                        })
                    ).catch(e => console.log(e))
                }
            }
            
            const clone = {...pageData, onShareAppMessage: wrapOnShareAppMessage, onShow: wrapOnShow}

            return CPage(clone)
        } catch (e) {
            console.error(e);
        }
    }

    return CPage(pageData)
}

export default TPage
