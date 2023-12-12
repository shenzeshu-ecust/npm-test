import { cwx, CPage, _ } from "../../../cwx/cwx";
var model = require('./model.js');
var utils = require('../common/utils.js');
CPage({
  pageId: '10650069470',
  data: {
    pageId: '10650069470',
    availablePoints: 0,       // 积分总额
    totalEarned: 0,           // 总共赚取的积分 - 未展示
    totalUsed:0,              // 总共使用的积分 - 为未展示
    pageSize:10,              // 请求页面的页数
    integral_detail_list: [], // 积分明细列表
  },
  /** 页面开始加载 */
  onLoad(options) {
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    utils.getOpenid(() => {
      this.getUserIntegrationInfo(0,10)
      wx.hideLoading();
    }, () => {
      wx.hideLoading();
      wx.showToast({ title: '获取用户信息失败，请退出重试', icon: 'none', mask: true })
    })
  },

  /** 页面触底加载更多 */
  onReachBottom() {
    this.setData({
      pageSize : this.data.pageSize + 10
    })
    this.getUserIntegrationInfo(0,this.data.pageSize)
  },

  /** 获取积分总数和明细 */
  getUserIntegrationInfo(type,pageSize) {
    model.requestUrl('userIntegrationInfo', { 'type': type, 'pageSize': pageSize || 10},res => {
      if (res.errcode === 0 && res.integrationInfo){
        this.ubtTrace(103414, { pageName: "signInPage——Integration", step: "获取积分总数和明细", integrationInfo: res.integrationInfo });
        let integrationInfo = JSON.parse(res.integrationInfo)
        for (let i = 0; i < integrationInfo.integrationDetails.length;i++){
          integrationInfo.integrationDetails[i].earnedTime = this.formatTime(true, new Date(parseInt(integrationInfo.integrationDetails[i].earnedTime)))
        }
        this.setData({
          availablePoints: integrationInfo.availablePoints,
          totalEarned: integrationInfo.totalEarned,
          totalUsed: integrationInfo.totalUsed,
          integral_detail_list: integrationInfo.integrationDetails || []
        })
      }
    })
  },

  /** 格式化时间参数 */
  formatTime(needYear, date) {
    date = date ? date : new Date()
    if (needYear) {
      return date.getFullYear() + '-' + (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-' + date.getDate()
    } else {
      return date.getMonth() + 1 + '/' + date.getDate()
    }
  }

})