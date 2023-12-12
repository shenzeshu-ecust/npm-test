import { cwx, CPage } from '../../../../cwx/cwx.js'

const canWebView = cwx.canIUse('web-view')

CPage({
  data: {
    canWebView: canWebView,
    groupURL: ''
  },
  onLoad(query) {
    const { groupURL } = query
    if (groupURL) {
      this.setData({ groupURL })
    }
  }
})