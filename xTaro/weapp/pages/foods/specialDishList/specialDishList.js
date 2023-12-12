import {
  cwx,
  CPage,
  __global
} from "../../../cwx/cwx.js";
CPage({
  pageId: '10650031645',
  data: {},
  onLoad(options) {
    wx.hideShareMenu({
      menus: ['shareAppMessage', 'shareTimeline']
    })
    let H5BaseUrl = ''
    if (__global.env.toLowerCase() === 'uat') {
      H5BaseUrl = 'https://m.uat.qa.nt.ctripcorp.com';
    } else {
      H5BaseUrl = 'https://m.ctrip.com';
    }
    const url = H5BaseUrl + '/webapp/gourmet/food/specialFood/' + options.districtId + '.html?seo=0&foodId=' + options.foodId + '&destFoodId=' + options.destFoodId + '&ishideheader=true&isHideNavBar=YES&navBarStyle=white'
    cwx.component.cwebview({
      data: {
        url: encodeURIComponent(url),
        needLogin: false,
        isNavigate: false,
        hideShare: false
      }
    })
  },

})