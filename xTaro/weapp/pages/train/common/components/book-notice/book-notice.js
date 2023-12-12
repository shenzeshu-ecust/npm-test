import { cwx } from '../../../../../cwx/cwx'

export default {
    methods: {
        showBookingProtocal() {
            this.navigateTo({
                url: `../../webview/webview`,
                data: {
                    url: 'https://m.ctrip.com/webapp/train/activity/orderservice/InsuranceDetail.aspx?ProductID=2007&terminal=1',
                    title:"火车票服务协议",
                },
            })
        },
        showBookingProtocal2() {
            this.navigateTo({
                url: `../../webview/webview`,
                data: {
                    url: 'https://m.ctrip.com/webapp/train/activity/orderservice/InsuranceDetail.aspx?ProductID=2021&terminal=0',
                    title:"火车票服务协议",
                },
            })
        },
        showTips(e) {
            let type = 0
            if (e && e.currentTarget && e.currentTarget.dataset){
                type = e.currentTarget.dataset.type || 0
            }
            cwx.component.cwebview({
                data: {
                    url: encodeURIComponent(`https://pages.ctrip.com/ztrip/document/ydxzctrip.html?noticetype=${type}&__ares_maxage=3m&mpenv=wx`),
                },
            })
        },
    },
}
