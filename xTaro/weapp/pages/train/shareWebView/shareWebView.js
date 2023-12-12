import { cwx } from '../../../cwx/cwx'
import TPage from '../common/TPage'
const page = {
  data: {},

  onLoad(options) {
    console.log('-----------/pages/train/shareWebView/shareWebView')
    const { data = '{}', needLogin = '', url = '', hideShare='', } = options
    cwx.redirectTo({
      url:
        '/pages/train/authorise/web/web?data=' +
        data +
        '&needLogin=' +
        needLogin +
        '&url=' +
        url +
        '&hideShare=' +
        hideShare
    })

    return
  },
}
TPage(page)
