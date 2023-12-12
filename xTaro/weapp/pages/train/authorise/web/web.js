import CWebviewBaseClass from '../../../../cwx/component/cwebview/CWebviewBaseClass'
import cwx, { _ } from '../../../../cwx/cwx'
import util from '../../common/util'
import { shared } from '../../common/trainConfig'
import { getUserBindedPhoneNumber } from '../../common/common'
import { onLogin12306Success } from '../../common/account12306'
import { TrainBookStore } from '../../common/store'

function parseQuery(qs = '') {
    const obj = {}
    const params = qs.replace(/^(\?|#)/, '').split(/&amp;|&/)
    for (let i = 0; i < params.length; i++) {
        if (params[i]) {
            let index = params[i].indexOf('=')
            if (index === -1) index = params[i].length
            const key = params[i].substring(0, index)
            const val = params[i].substring(index + 1)
            // eslint-disable-next-line no-prototype-builtins
            if (obj.hasOwnProperty(key)) {
                if (!Array.isArray(obj[key])) obj[key] = [obj[key]]
                obj[key].push(decodeURIComponent(val))
            } else {
                obj[key] = decodeURIComponent(val)
            }
        }
    }

    return obj
}

class WebView extends CWebviewBaseClass {
    constructor() {
        super()
        // 因为微信小程序只会触发到对象的onwProperty
        // 所以在此做修改
        const _onShow = this.onShow
        Object.assign(this, {
            pageId: '10650024797',
            onLoad(options) {
                let data = options.data || {}
                if (typeof data === 'string') {
                    try {
                        data = JSON.parse(data)
                    } catch (e) {/**/}
                }
                try {
                    Object.assign(this.data, data)
                } catch (e) {
                    //
                }

                let needLogin = data.needLogin || options.needLogin
                this.needLogin = needLogin

                let url = data.url || options.url
                let { bgColor = '#0086F6', ftColor = '#ffffff', title = ''} = data
                url = decodeURIComponent(url)

                let urlSearch = parseQuery(url.split('?')[1] || '')
                ftColor = urlSearch.ftColor || ftColor
                bgColor = urlSearch.bgColor || bgColor
                title = urlSearch.title || title
                bgColor = bgColor.indexOf('#') !== -1 ? bgColor : '#' + bgColor
                ftColor = ftColor.indexOf('#') !== -1 ? ftColor : '#' + ftColor
                let hideShare = data.hideShare || options.hideShare
                if (hideShare) {
                    wx.hideShareMenu()
                }

                if (title) {
                    wx.setNavigationBarTitle({
                        title,
                    })
                }

                wx.setNavigationBarColor({
                    frontColor: ftColor,
                    backgroundColor: bgColor,
                })

                if (url.includes('tmpdata')) {
                    this.trainSetUrl(url)
                } else {
                    // 要传给目的页的数据名称列表
                    const toUrlDatas = []
                    // 获取数据的 promise 列表
                    const dataPromises = []
                    this.toUrlDatas = toUrlDatas
                    let openidPromise = util.getOpenId()
                    toUrlDatas.push('openid')
                    dataPromises.push(openidPromise)

                    toUrlDatas.push('unionid')
                    dataPromises.push(openidPromise)

                    const userInfoDeferred = util.getDeferred()
                    toUrlDatas.push('userInfo')
                    dataPromises.push(userInfoDeferred.promise)
                    getUserInfo().then(
                        userInfo => {
                            userInfoDeferred.resolve(userInfo)
                        },
                        () => {
                            userInfoDeferred.resolve()

                            return
                        },
                    )

                    let idx = toUrlDatas.length
                    let mobilePromise = getBindMobile()
                        .then(([key, value] = []) => {
                            toUrlDatas[idx] = key

                            return value
                        })
                        .catch(() => {
                            return ''
                        })
                    toUrlDatas.push('PLACEHOLDER')
                    dataPromises.push(mobilePromise)

                    Promise.all(dataPromises)
                        .then(datas => {
                            return this.getUrlWithInfo(datas, url)
                        })
                        .then(url => {
                            this.trainSetUrl(url)
                        })
                        .catch(err => {
                            this.trainSetUrl(url)
                            console.error('TRN web: might set url failed')
                            console.error(err)
                        })
                }

            },
            onShow() {
                if (_.isFunction(_onShow)) {
                    _onShow()
                }

                if (this.urlToBeReload) {
                    this.reloadUrl(this.urlToBeReload)
                    this.urlToBeReload = ''
                } else if (shared.authWebData) {
                    // 保险措施,其实可以删除
                    // 因为是H5页面发起的跳转，所以从auth返回的时候，无法携带参数，只好放在全局变量里
                    this.reloadUrl(shared.authWebData.url)
                } else if (shared?.webviewData?.needReload && shared?.webviewData?.reloadUrl) {
                    this.setData({
                        url: '',
                    })
                    setTimeout(() => {
                        this.setData({
                            url: this.urlRewrite(shared?.webviewData?.reloadUrl),
                        })
                        shared.webviewData = null
                    }, 400)

                }
                delete shared.authWebData
            },
            webPostMessage: function (e) {
                console.log('TRN data:' + e)
                // 向小程序传值
                if (e.detail.data) {
                    const [{
                        from = '',
                        userName = '',
                        displayName = '',
                        loginPW = '',
                        passengerList,
                        cancelRobToZhongZhuanData = {},// cancelRob转H5传递中转数据
                    }] = e.detail.data
                    if (cancelRobToZhongZhuanData.trainInfo) {
                        setTimeout(() => {
                            this.navigateTo({
                                url: '/pages/train/zhongzhuan/zhongzhuan',
                                data: cancelRobToZhongZhuanData,
                            })
                        }, 500);
                    }
                    if (userName && from === 'orderbreak') {
                        onLogin12306Success({
                            userName,
                            displayName,
                            loginPW
                        })

                        let tmp = {
                            name: userName,
                            displayName,
                            passengerList12306: passengerList || [],
                        }

                        TrainBookStore.setAttr('bind12306', tmp)
                    }
                }
            },
            reloadUrl(url) {
                this.setData(
                    {
                        url: '',
                    },
                    () => {
                        let auth = cwx.user.auth
                        if (!auth || auth.length <= 0) {
                            //没有登录每次去除登录态
                            url = this.getLoginTokenUrl('', url)
                            this.webLoadUrl(url)
                        } else {
                            this.webGetTokenByAuth(url, auth)
                        }
                    },
                )
            },
            getUrlWithInfo(datas = [], url) {
                datas = this.toUrlDatas
                    .map((key, index) => {
                        let val = datas[index]
                        if (!val) {
                            return
                        }

                        return {
                            [key]:
                                typeof val === 'string'
                                    ? val
                                    : JSON.stringify(datas[index]),
                        }
                    })
                    .filter(item => !!item)
                    .reduce((dic, cur) => {
                        return Object.assign(dic, cur)
                    }, {})
                url = util.addSearch(
                    url,
                    'tmpdata',
                    encodeURIComponent(JSON.stringify(datas)),
                )
                console.log(url)

                return url
            },
            trainSetUrl(url) {
                // 需要强制登录: 1.有auth的情况下去换取token 成功后拼在accounts连接上写入登录态 然后跳转到目标页面 2.没有auth的情况下直接跳转登录页 登录成功后走入case1
                // 不需要强制登录: 1.同上 2.没有auth的情况 清空h5的登录态 并跳转到目标页面
                let auth = cwx.user.auth
                if (!this.needLogin) {
                    if (!auth || auth.length <= 0) {
                        //没有登录每次去除登录态
                        url = this.getLoginTokenUrl('', url)
                        this.setData({
                            url,
                        })
                        console.error('webview load url is', this.data.url)
                    } else {
                        this.webGetTokenByAuth(url, auth)
                    }
                } else {
                    this.webGetToken(url)
                }
            },
            onShareAppMessage: function (options) {
                return this.shareData
            },
        })
    }
}

new WebView().register()

function getUserInfo() {
    const deferred = util.getDeferred()
    cwx.getUserInfo({
        success(res) {
            const userInfo = res.userInfo
            deferred.resolve(userInfo)
        },
        fail(e) {
            deferred.reject(e)
        },
    })

    return deferred.promise
}

/**
 * 获取已登录账户里绑定的手机号
 */
function getBindMobile() {
    return getUserBindedPhoneNumber().then(mobile => {
        if (mobile) {
            return ['mobile', mobile]
        }
    })
}
