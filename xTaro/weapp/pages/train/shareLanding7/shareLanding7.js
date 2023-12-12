import { cwx } from '../../../cwx/cwx'
import TPage from '../common/TPage'
const page = {
  data: {},
  pageId: '10650097506',
  onLoad(options) {
    console.log('-----------/pages/train/shareLanding7/shareLanding7')
    const { url = '' } = options
    cwx.redirectTo({
      url: url ? decodeURIComponent(url) : '/pages/train/index/index'
    })

    return
  },
}
TPage(page)
