import {
    cwx,
    CPage,
    __global
} from '../../../cwx/cwx.js';
CPage({
    pageId: '10650016804',
    data: {},
    onLoad: function (options) {
        wx.hideShareMenu({
            menus: ['shareAppMessage', 'shareTimeline']
        })
        let H5BaseUrl = ''
        if (__global.env.toLowerCase() === 'uat') {
            H5BaseUrl = 'https://m.uat.qa.nt.ctripcorp.com';
        } else {
            H5BaseUrl = 'https://m.ctrip.com';
        }
        const url = H5BaseUrl + '/webapp/gourmet/food/fooddetail/' + options.districtId + '/' + options.id + '.html?seo=0&isHideNavBar=YES&ishideheader=true'
        cwx.component.cwebview({
            data: {
                url: encodeURIComponent(url),
                needLogin: false,
                isNavigate: false,
                hideShare: false
            }
        })
    }
})