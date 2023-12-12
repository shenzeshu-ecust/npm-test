// pages/market/directory/duobao/index.js
import { cwx, __global, CPage } from "../../../../cwx/cwx.js";
import { cmsActFat, cmsActProd } from './config'
import { fetch } from './model'
import { parseJson } from './utils'
CPage({
  pageId: '10650084805',
  checkPerformance: true,  
  /**
   * 页面的初始数据
   */
  data: {
    env: __global.env,
    actId: __global.env == 'fat' ? cmsActFat : cmsActProd,
    navbarData: {
      showCapsule: 1, //是否显示头部左上角小房子 1显示 0 不显示
      showBack: 1, //是否显示返回 1显示 0不显示
      showColor: 0, //navbar背景颜色 1蓝色 0白色
      bgTransparent: true,
      iconColor: 'white',
      titleColor: 'white'
    },
    tab: '1',
    rule: [],
    guide: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.hideShareMenu()
    const { index } = options
    this.setData({
        tab: index
    })
    this.fetchRule()
  },

  handleSwitchTab(e) {
    const index = e.target.dataset.index
    this.setData({
        tab: index
    })
  },
  async fetchRule(){
    const res = await fetch('getActivityConfig', {
        "activityId": this.data.actId,
    })
    if (res && res.errcode == 0) {
        this.setData({
            rule: parseJson(res.activityCustomfields.duobao_rule),
            guide: res.activityCustomfields.duobao_guide.split(',')
        })
    }
  }
})