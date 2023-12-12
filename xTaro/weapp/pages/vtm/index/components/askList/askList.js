// pages/vtm/index/component/ask/askList.js
import { cwx } from "../../../../../cwx/cwx.js";
import { sendExposeData } from '../../../utils/index'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    askListSuccess: {
      type: Boolean
    },
    askListLoading: {
      type: Boolean
    },
    askList: {
      type: Array,
      value: [],
      observer: function(data){
        cwx.sendUbtExpose.refreshObserve(this); // 当组件中的需要发曝光埋点的目标节点有变化时
      }
    },
    askListAppUrl: {
      type: String,
      value: []
    },
    ubtInfo:{
      type: Object,
      observer: function(data){
        this.setData({
          exposeAsk:{
            ...this.data.exposeAsk,
            data
          }
        })
      }
    }
  },
  lifetimes: {
    attached: function () {
      cwx.sendUbtExpose.observe(this); // 在 attached 中绑定监听器
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    exposeAsk: {   // 1.3 data 添加 期望曝光埋点上报的数据，data-expose 的值必须是 Object 类型
      ubtKeyName: 'gst_qrcode_cjwd_expo',
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getExposeData: sendExposeData,
    askJumpAll() {
      const url = this.data.askListAppUrl
      cwx.sendUbtByPage.ubtTrace("gst_qrcode_acjwd_click", {
        ...this.data.ubtInfo,
        url,
        isAll: 1
      });
      const data = {
        url: encodeURIComponent(url),
        pageId: '245007',
        isShareWebUrl: true
      };
      cwx.navigateTo({
        url: '/cwx/component/cwebview/cwebview?data=' + JSON.stringify(data)
      });
    },
    askJump(e) {
      const index = e.currentTarget.dataset['index'];
      const { DistrictEName, DistrictId, AskId } = this.data.askList[index]
      const url = `https://m.ctrip.com/webapp/you/asks/${DistrictEName}${DistrictId}/${AskId}.html`
      cwx.sendUbtByPage.ubtTrace("gst_qrcode_acjwd_click", {
        ...this.data.ubtInfo,
        url,
      });
      const data = {
        url: encodeURIComponent(url),
        pageId: '214073',
        isShareWebUrl: true
      };
      cwx.navigateTo({
        url: '/cwx/component/cwebview/cwebview?data=' + JSON.stringify(data)
      });
    }
  }
})
