import { cwx } from '../../../cwx/cwx'
import TPage from '../common/TPage'

const page = {
  data: {},

  onLoad(options) {
    console.log('-----------/pages/train/robshare2/robshare2')

    const { oid = '', stuFlag = '', newFeatureFlag = '', subOrderId, ref = '', source='', newUserFlag = 0, type = 0, shareKey = '', shareUserShareKey = '' } = options
    cwx.redirectTo({
      url:
        '/pages/train/robshare/robshare?oid=' +
        oid +
        '&subOrderId=' +
        subOrderId +
        '&stuFlag=' +
        stuFlag +
        '&newFeatureFlag=' +
        newFeatureFlag +
        '&ref=' +
        ref +
        '&source=' +
        source +
        '&newUserFlag=' +
        newUserFlag +
        '&type=' +
        type +
        '&shareKey=' +
        shareKey +
        '&shareUserShareKey=' +
        shareUserShareKey
    })

    return
  },
}
TPage(page)
