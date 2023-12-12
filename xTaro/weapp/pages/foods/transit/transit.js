// 写点评中转页面
import {
  cwx,
  CPage
} from '../../../cwx/cwx.js';

cwx.config.init();
CPage({
  pageId: "",
  checkPerformance: true,  // 添加标志位
  data: {
    viewClicked: false, //已经点击
    type: '',
    poiId: 0,
    poiType: 0,
    districtId: 0,
    restId: 0,
    source: '',
  },
  onLoad: function (options) {
    console.log("options", options);
    let backgroundImage = 'https://pages.c-ctrip.com/you/livestream/gs-dianping-home2.jpg';

    // iphoneX 适配
    if (this.isIphonex()) {
      backgroundImage = 'https://pages.c-ctrip.com/you/livestream/gs-dianping-home-x2.jpg';
    }

    let self = this,
      type = options.type ? options.type : 'uploadImg',
      poiId = options.poiId ? parseInt(options.poiId) : 0,
      poiType = options.poiType ? parseInt(options.poiType) : 0,
      districtId = options.districtId ? parseInt(options.districtId) : 0,
      restId = options.restId ? options.restId : 0,
      source = options.source ? options.source : ''

    self.setData({
      type: type,
      poiId: poiId,
      poiType: poiType,
      districtId: districtId,
      restId: restId,
      source: source,
      backgroundImage: backgroundImage
    })
  },
  isIphonex: function () {
    const systemInfoSync = cwx.getSystemInfoSync();
    
    if (systemInfoSync.platform !== 'android') {
      return systemInfoSync.statusBarHeight > 25
    } else {
      let rate = systemInfoSync.windowWidth / systemInfoSync.windowHeight
      return rate > 750 / 1206
    }
  },
  gotoAgreement: function () {
    let url = 'https://contents.ctrip.com/activitysetupapp/mkt/index/miniproprivacy?popup=close'
    if (/^(https?:)?\/\//.test(url)) {
      cwx.component.cwebview({
        data: {
          url: encodeURIComponent(url),
        }
      })
      return;
    }
    cwx.navigateTo({
      url
    });
  },

  //跳转
  jumpToCtrip: function () {
    let self = this,
      data = self.data,
      type = data.type,
      poiId = data.poiId,
      poiType = data.poiType,
      districtId = data.districtId,
      restId = data.restId,
      source = data.source

    if (data.viewClicked) {
      return;
    }
    self.setData({
      viewClicked: true
    })
    setTimeout(() => {
      self.setData({
        viewClicked: false
      })
    }, 1000)
    cwx.user.getToken((token) => {
      cwx.cwx_navigateToMiniProgram({
        appId: 'wxd8c133444ecfdec8',
        path: `/pages/comment/add?BusinessId=${restId}&BusinessType=12&PoiId=${poiId}&districtId=${districtId}&type=food&token=${token}`,
        envVersion: "trial",
        complete: function () {
          console.log('cwx_navigateToMiniProgram complete ======');
        },
        success: function (res) {},
        fail: function (res) {}
      })
    });
  }
})