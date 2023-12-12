import { cwx, CPage } from '../../../../cwx/cwx.js'

const canWebView = cwx.canIUse('web-view')

CPage({
  data: {
    canWebView: canWebView,
    ruleUrl: ''
  },
  onLoad(query) {
    const { ruleUrl } = query
    if (ruleUrl) {
      this.setData({ ruleUrl })
    }
  }
})
