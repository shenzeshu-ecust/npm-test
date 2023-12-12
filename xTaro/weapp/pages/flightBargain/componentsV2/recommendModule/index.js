import { Utils } from '../../common/utils.js'
import { cwx } from '../../../../cwx/cwx.js'
import { FetchStatus } from '../../common/constants.js'

Component({
  properties: {
    status: {
      type: Number,
      value: FetchStatus.LOADING
    },
    showLocation: {
      type: String,
      value: '上海'
    },
    recommendList: {
      type: Array,
      value: []
    }
  },
  data: {
    FetchStatus
  },
  methods: {
    launchAppError(e) {
      const index = Utils.getValue(e, 'currentTarget.dataset.index'),
        info = this.data.recommendList[index]
      cwx.navigateTo({ url: `/cwx/component/cwebview/cwebview?data={"url":"${Helper.constructJumpUrl(info)}"}` })
    },
    onClickLocation() {
      this.triggerEvent('onClickLocation', {})
    }
  }
})

const Helper = {
  constructJumpUrl(info) {
    const { dCityCode, dCityType, aCityCode, aCityType, departDate } = info,
      url = `https://m.ctrip.com/html5/flight/swift/${dCityType === 1 && aCityType === 1 ? 'domestic' : 'international'}/${dCityCode}/${aCityCode}/${departDate}`
    console.log('xc url', url)

    return encodeURIComponent(url)
  }
}
