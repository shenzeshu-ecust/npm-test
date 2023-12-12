import CWebviewBaseClass from '../../../cwx/component/cwebview/CWebviewBaseClass'
import { shared } from '../common/trainConfig'
class WebView extends CWebviewBaseClass {
    constructor() {
        super()
        Object.assign(this, {
            webPostMessage: function (e) {
                console.log('TRN data:' + e)
                // 向小程序传值
                this.data.bridgeIns && this.data.bridgeIns(e)
            },
            onReady: function () {
                let { bgColor = '', ftColor = '', title = ''} = this.data
                bgColor = bgColor ? (bgColor.includes('#') ? bgColor : '#' + bgColor) : ''
                ftColor = ftColor ? (ftColor.includes('#') ? ftColor : '#' + ftColor) : ''

                if (title) {
                    wx.setNavigationBarTitle({
                        title,
                    })
                }
                if (bgColor || ftColor) {

                    wx.setNavigationBarColor({
                        backgroundColor: bgColor || '#0086F6',
                        frontColor: ftColor || '#ffffff',
                    })
                }
            },
            onShow: function() {
                // 重新修改src会产生网页的history 导致点击左上角的返回时 会返回一次上一个网页 这里需要销毁旧的webview 就可以保证history中只有最新的记录 需要延时操作的目的是防止卡顿
                if (shared?.webviewData?.needReload && shared?.webviewData?.reloadUrl) {
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
            },
        })
    }
}
new WebView().register()
