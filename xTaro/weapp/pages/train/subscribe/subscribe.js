import { cwx } from '../../../cwx/cwx'
import TPage from '../common/TPage'
import { SubscribeMessageTemplateModel } from "../common/model"
import util from "../common/util"

const page = {
    checkPerformance: true,
    pageId: '10650042267',
    data: {
        showType: '',
        launchAPPUrl:'ctrip://wireless/h5?url=L3JuX3RyYWluX21haW4vbWFpbi5qcz9DUk5Nb2R1bGVOYW1lPVRyYWluQ1JOJkNSTlR5cGU9MSZpbml0aWFsUGFnZT1TcHJpbmdGZXN0aXZhbEluZGV4&type=5',
    },
    onLoad(options) {
        console.log('TRN SUBSCRIBE', options)
        // 因为路径里的data会被 navigator.js 里的 data 覆盖，所以添加了 params 这个名字
        const data = options.params || options.data || options || {}
        let params = {}
        if (typeof data === 'string') {
            try {
                params = JSON.parse(decodeURIComponent(data))
            } catch (e) {}
        } else {
            params = data
        }

        let {
            templateIdList = [], // 模板号list
            orderId = '', // 订单号
            channel = '', // 渠道来源: h5 app
            bgUrl = '', // 页面背景图片
            btnUrl = '', // 订阅按钮背景图片
            jumpUrl = '', // h5回跳地址
            from = '', // h5的订阅环境: app mp
            ubtKey = 'activity',
            isRedirect = false, // 是否重定向
        } = params

        console.log('--------- TRN SUBSCRIBE', params)
        this.templateIdList = templateIdList
        this.orderId = orderId

        this.setData({
            isRedirect,
            channel,
            from,
            ubtKey,
            bgUrl: decodeURIComponent(bgUrl),
            btnUrl: decodeURIComponent(btnUrl),
            jumpUrl: decodeURIComponent(jumpUrl),
        })

        cwx.getSystemInfo({
            success: (res) => {
                let systemHeight = res.windowHeight;
                let statusBarHeight = res.statusBarHeight;
                this.setData({
                    systemHeight,
                    statusBarHeight,
                });
            },
        });
    },
    onShow() {},
    openIdPromise() {
        return util.getOpenId().then(OpenId => {
            this.openId = OpenId
            this.ubtDevTrace('c_train_openid', OpenId)
        }).catch(e => {
        })
    },
    clickSubscribe() {
        console.log('this.templateIdList', this.templateIdList)
        cwx.mkt.subscribeMsg(this.templateIdList, (data) => {
            console.log('subscribeMsg', data)
            this.ubtTrace('subscribeMsg', data)
            if (data?.errMsg) {
                this.ubtDevTrace('c_train_subscribemsgerr', data?.errMsg)
                util.showToast('订阅不成功，请稍后再试', 'none')
            } else {
                if (this.data.channel == 'h5') {
                    this.openIdPromise().then(() => {
                        if (this.data.from == 'app') { // 需要返回app
                            const realUrl = cwx.util.base64Encode(`${this.data.jumpUrl}&subscribeStatus=1&openId=${this.openId}`)
                            const launchAPPUrl = `ctrip://wireless/h5?url=${realUrl}&type=2`
                            this.setData({ launchAPPUrl })
                        }
                        this.setData({ showType: 'success' })
                    })
                        .catch(e => {
                            util.showToast('获取openid失败')
                        })
                } else {
                    this.openIdPromise().then(this.subScirbeInfo).then(() => {
                        this.setData({ showType: 'success' })
                    }).catch(e => {
                        util.showToast('订阅不成功，请稍后再试', 'none')
                    })
                }
            }
        }, (err) => {
            console.log(err)
        })


    },
    /**
     * 订阅消息落库
     */
    subScirbeInfo() {
        const deferred = util.getDeferred()
        const params = {
            TemplateIDList: this.templateIdList,
            OpenId: this.openId,
            OrderNumber: this.orderId,
        }
        SubscribeMessageTemplateModel(params, res => {
            if (res.RetCode == 1) {
                deferred.resolve()
            } else {
                deferred.reject()
            }
        })

        return deferred.promise
    },
    backToPreviousApp() {},
    backToPreviousInMp() {
        const url = `${this.data.jumpUrl}&subscribeStatus=1&openId=${this.openId}`

        this.hidePop()
        if (this.data.isRedirect) {
            cwx.redirectTo({
                url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(url)}`,
            })
        } else {
            this.navigateTo({
                url: '/pages/train/authorise/web/web',
                data: {
                    url,
                },
            })
        }
    },
    hidePop() {
        this.setData({ showType: '' })
    },
    goBack() {
        if (getCurrentPages().length === 1) {
            const url = `${this.data.jumpUrl}&subscribeStatus=1&openId=${this.openId}`
            cwx.redirectTo({
                url: '/pages/train/authorise/web/web',
                data: {
                    url,
                },
            })
        } else {
            cwx.navigateBack();
        }
    },
}
TPage(page)
