import { cwx } from "../../../../../cwx/cwx.js";

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    guideBasicInfo: {
      type: Object,
      value: {}
    },
    orderAmount: {
      type: String,
      value: ''
    },
    guideSuccess: {
      type: Boolean,
    },
    guideLoading: {
      type: Boolean,
    },
    hideCityTop: {
      type: Boolean,
    },
    ubtInfo:{
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    guideIdJump: function () {
      const url = this.data?.guideBasicInfo?.homeH5Url
      cwx.sendUbtByPage.ubtTrace("gst_qrcode_axiangdaoren_click", {
        ...this.data.ubtInfo,
        url
      });
      // H5地址
      if (url) {
        const data = {
          url: encodeURIComponent(`${url}&allianceid=${this.data.ubtInfo.allianceid}`),
          pageId:"10650038741",
          isShareWebUrl: true
        };
        cwx.navigateTo({
          url: '/cwx/component/cwebview/cwebview?data=' + JSON.stringify(data)
        });
      }
    },
    cityTopJump: function () {
      let url = this.data?.guideBasicInfo?.cityTopInfo?.h5Url
      cwx.sendUbtByPage.ubtTrace("gst_qrcode_akoubei_click", {
        ...this.data.ubtInfo,
        url
      });
      // H5地址
      if (url) {
        // url = url.replace('districtId==', 'districtId=')
        const data = {
          url: encodeURIComponent(`${url}&allianceid=${this.data.ubtInfo.allianceid}`),
          pageId:"10650087476",
          isShareWebUrl: true
        };
        cwx.navigateTo({
          url: '/cwx/component/cwebview/cwebview?data=' + JSON.stringify(data)
        });
      }

    },
  }
})
