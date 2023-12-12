import { cwx } from "../../../../../cwx/cwx.js";
import {sendExposeData} from '../../../utils/index'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    gs_cid:{
      type: String,
    },
    methodLoading:{
      type: Boolean
    },
    methodSuccess:{
      type: Boolean
    },
    methodInfo: {
      type: Object,
      value: {},
      observer: function(){
        cwx.sendUbtExpose.refreshObserve(this); // 当组件中的需要发曝光埋点的目标节点有变化时
      }
    },
    ubtInfo:{
      type: Object,
      observer: function(data){
        this.setData({
          exposeBook:{
            ...this.data.exposeBook,
            data
          },
          exposeRanking:{
            ...this.data.exposeRanking,
            data
          }
        })
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    exposeBook: {   // 1.3 data 添加 期望曝光埋点上报的数据，data-expose 的值必须是 Object 类型
      ubtKeyName: 'gst_qrcode_znzgl_expo',
    },
    exposeRanking: {   // 1.3 data 添加 期望曝光埋点上报的数据，data-expose 的值必须是 Object 类型
      ubtKeyName: 'gst_qrcode_glbd_expo',
    }
  },
  lifetimes: {
    attached: function() {
      cwx.sendUbtExpose.observe(this); // 在 attached 中绑定监听器
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    getExposeData: sendExposeData,
    bookJump: function () {
      const url = this?.data?.methodInfo?.bookInfo?.bookJumpUrl
      cwx.sendUbtByPage.ubtTrace("gst_qrcode_aznzgl_click", {
        ...this.data.ubtInfo,
        url
      });
      const data = {
        url: encodeURIComponent(`${url}&allianceid=${this.data.ubtInfo.allianceid}`),
        pageId: '10650073218',
        isShareWebUrl: true
      };
      cwx.navigateTo({
        url: '/cwx/component/cwebview/cwebview?data=' + JSON.stringify(data)
      });
    },
    rankingJump: function () {
      const url = `https://m.ctrip.com/webapp/you/cranking/crankingHome.html?isHideNavBar=YES&ishideheader=true&districtId=${this.data.gs_cid}&allianceid=${this.data.ubtInfo.allianceid}`

      cwx.sendUbtByPage.ubtTrace("gst_qrcode_aglbd_click", {
        ...this.data.ubtInfo,
        url
      });
      const data = {
        url: encodeURIComponent(url),
        pageId: '10650065488',
        isShareWebUrl: true
      };
      cwx.navigateTo({
        url: '/cwx/component/cwebview/cwebview?data=' + JSON.stringify(data)
      });
    },
  }
})
