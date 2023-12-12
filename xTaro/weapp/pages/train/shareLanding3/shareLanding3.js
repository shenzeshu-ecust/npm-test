import { cwx } from '../../../cwx/cwx'
import TPage from '../common/TPage'
const page = {
  data: {},

  onLoad(options) {
    console.log('-----------/pages/train/shareLanding3/shareLanding3')
    const { url = '' } = options
    cwx.redirectTo({
      url: url ? decodeURIComponent(url) : '/pages/train/index/index'
    })

    return
  },
}
TPage(page)
