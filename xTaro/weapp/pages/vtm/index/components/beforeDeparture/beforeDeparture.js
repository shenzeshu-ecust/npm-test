import { cwx } from "../../../../../cwx/cwx.js";
import { sendExposeData } from '../../../utils/index'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    noGuideInfo: {
      type: Boolean
    },
    weatherSuccess: {
      type: Boolean
    },
    weatherLoading: {
      type: Boolean
    },
    beforeDepartureSuccess: {
      type: Boolean
    },
    beforeDepartureLoading: {
      type: Boolean
    },
    weatherInfo: {
      type: Object,
      value: {},
      observer: function (data) {
        cwx.sendUbtExpose.refreshObserve(this); // 当组件中的需要发曝光埋点的目标节点有变化时
      }
    },
    beforeDepartureList: {
      type: Array,
      value: [],
      observer: function (data) {
        if (data?.length) {
          cwx.sendUbtExpose.refreshObserve(this); // 当组件中的需要发曝光埋点的目标节点有变化时
        }
      }
    },
    gs_cid: {
      type: String,
      value: ''
    },
    ubtInfo: {
      type: Object,
      observer: function (data) {
        this.setData({
          exposeTravel: {
            ...this.data.exposeTravel,
            data
          },
          exposeWeather: {
            ...this.data.exposeWeather,
            data
          },
          exposeData: {
            EXCHANGE_BILL: {
              ubtKeyName: 'gst_qrcode_xqhh_expo',
              data
            },
            INSURANCE: {
              ubtKeyName: 'gst_qrcode_xqbx_expo',
              data
            },
            RENT_CAR: {
              ubtKeyName: 'gst_qrcode_xqzc_expo',
              data
            },
            LUGGAGE_STORAGE: {
              ubtKeyName: 'gst_qrcode_xqxlgj_expo',
              data
            },
            GLOBAL_SHOPPING: {
              ubtKeyName: 'gst_qrcode_xqcxqd_expo',
              data
            }
          },
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
    exposeWeather: {
      ubtKeyName: 'gst_qrcode_xqqqg_expo',
    },
    exposeTravel: {   // 1.3 data 添加 期望曝光埋点上报的数据，data-expose 的值必须是 Object 类型
      ubtKeyName: 'gst_qrcode_xqcxqd_expo',
    },
    exposeData: {
      EXCHANGE_BILL: {
        ubtKeyName: 'gst_qrcode_xqhh_expo',
      },
      INSURANCE: {
        ubtKeyName: 'gst_qrcode_xqbx_expo',
      },
      RENT_CAR: {
        ubtKeyName: 'gst_qrcode_xqzc_expo',
      },
      LUGGAGE_STORAGE: {
        ubtKeyName: 'gst_qrcode_xqxlgj_expo',
      },
      GLOBAL_SHOPPING: {
        ubtKeyName: 'gst_qrcode_xqcxqd_expo',
      }
    },
    ubtclick: {
      EXCHANGE_BILL: 'gst_qrcode_axqhh_click',
      INSURANCE: 'gst_qrcode_axqbx_click',
      RENT_CAR: 'gst_qrcode_axqzc_click',
      LUGGAGE_STORAGE: 'gst_qrcode_axqxlgj_click',
      GLOBAL_SHOPPING: 'gst_qrcode_axqqqg_click',
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getExposeData: sendExposeData,
    weatherJump: function () {
      const gs_cid = this.data?.gs_cid
      cwx.sendUbtByPage.ubtTrace("gst_qrcode_atianqi_click", {
        ...this.data.ubtInfo
      });
      const data = {
        url: encodeURIComponent(`https://m.ctrip.com/webapp/you/gsdestination/weather/d${gs_cid}.html?seo=0&hideheader=true`),
        pageId: '10650017289',
        isShareWebUrl: true
      };
      cwx.navigateTo({
        url: '/cwx/component/cwebview/cwebview?data=' + JSON.stringify(data)
      });

    },
    toVtmMini:function (){
      cwx.sendUbtByPage.ubtTrace('gst_qrcode_axqcxqd_click', {
        ...this.data.ubtInfo
      });
      const data = {
        url: encodeURIComponent(`https://m.ctrip.com/webapp/vacations/vtmportal/triplist?DestCityId=${this.data.ubtInfo.destcityid}&sourcefrom=vtmMini`),
        pageId: '10320642318',
        isShareWebUrl: true
      };
      cwx.navigateTo({
        url: '/cwx/component/cwebview/cwebview?data=' + JSON.stringify(data)
      });
      // cwx.user.getToken((token) => {
      //   cwx.cwx_navigateToMiniProgram({
      //     appId: 'wxa3711a5a43126c81',
      //     path: `pages/triplist/triplist?districtid=${this.data.ubtInfo.destcityid}&cityname=${this.data.ubtInfo.destcityname}&__userToken=${token}`,
      //   })
      // });
    },
    travelJump: function (e) {
      const url = e.currentTarget.dataset['url'];
      const code = e.currentTarget.dataset['code'];
      let key = this.data.ubtclick[code]
      cwx.sendUbtByPage.ubtTrace(key, {
        ...this.data.ubtInfo,
        url
      });
      const Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/
      const exp = new RegExp(Expression);
      if (url) {
        if (exp.test(url)) {
          const data = {
            url: encodeURIComponent(url),
            isShareWebUrl: true
          };
          cwx.navigateTo({
            url: '/cwx/component/cwebview/cwebview?data=' + JSON.stringify(data)
          });
        } else {
          cwx.sendUbtByPage.ubtDevTrace("dcs_ediath_dev_log", {
            title: "miniprogram_vtm_to_page_no_h5",
            url
          })
          cwx.cwx_navigateToMiniProgram({
            shortLink: url
          })
        }
      }
    }
  }
})
