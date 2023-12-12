// demo.js
import { cwx, CPage } from "../../../cwx/cwx.js";
import { sendExposeData, judgeProtect } from '../utils/index'
const allianceid = '3832775'
const pageId = '10650096504'
CPage({
  pageId: pageId,
  autoExpose: true, // 1.1.1 添加 autoExpose 属性，并设置其值为 2
  // exposeThreshold: 0.1, // 1.2.1 自定义发送曝光埋点的条件1：相交比例的阈值
  // exposeDuration: 500, // 1.2.2 自定义发送曝光埋点的条件2：停留时长的阈值
  data: {
    ubtInfo: {
      allianceid: allianceid,
      destcityid: '',
      destcityname: '',
      pageId: pageId
    },
    // 向导
    guideLoading: true,
    guideSuccess: false,
    guideBasicInfo: {},
    // 天气
    weatherSuccess: false,
    weatherLoading: true,
    weatherInfo: {},
    // 行前
    beforeDepartureSuccess: false,
    beforeDepartureLoading: true,
    beforeDepartureList: [],
    //攻略
    methodSuccess: false,
    methodLoading: true,
    methodInfo: {},
    // 问答
    askListSuccess: false,
    askListLoading: true,
    askList: [],
    askListAppUrl: '',
    // 信息流
    activeIndex: 0,
    globalInfo: {

    },
    exposeFind1: {
      ubtKeyName: 'gst_qrcode_scgl_expo',
    },
    exposeFind2: {
      ubtKeyName: 'gst_qrcode_yhfx_expo',
    },
    // footer bar
    footerTab: [{
      index: 0,
      text: '首页',
      icon: 'wechat_vtm_font-tiny-home',
      color: '#006FF6'
    }, {
      index: 1,
      text: '出行清单',
      icon: 'wechat_vtm_font-travel-list',
      color: '#111111'
    }, {
      index: 2,
      text: '紧急支援',
      icon: 'wechat_vtm_font-emergency-support',
      color: '#111111'
    }]
  },
  onLoad(options) {
    cwx.sendUbtByPage.ubtDevTrace("dcs_ediath_pageinfo", {
      pageid: pageId,
      title: "ediath_pageview",
      data: options
    });
    const { destSetName, cid, cnm, guideId, hideCityTop, destSetId, uid } = options
    // 大向导的携程uid
    this.query = {
      destSetId: destSetId,
      destSetName: destSetName ? decodeURIComponent(destSetName) : undefined,
      districtId: cid,
      districtName: cnm ? decodeURIComponent(cnm) : undefined,
      euid: options.uid,
      uid,
      guideId,  //fat 1686882 线上 74025
      hideCityTop: hideCityTop === '1',
      allianceid: options.allianceid || allianceid
    }
    // 修改营销参数
    const unionData = cwx.mkt.getUnion()
    unionData.allianceid = allianceid
    cwx.mkt.setUnion(unionData);

    const isLogin = cwx.user.isLogin()
    const { scene } = wx.getLaunchOptionsSync()
    if (isLogin || scene === 1154) {
      if (scene === 1154) {
        const systemInfo = wx.getSystemInfoSync();
        this.setData({
          safeAreaHeight: systemInfo.safeArea.height
        })
      }
      this.requestServer(options)
    } else {
      judgeProtect(() => {
        cwx.user.login({
          callback: () => {
            this.requestServer(options)
          }
        });
      }, () => {
        this.requestServer(options)
      })

    }
    cwx.sendUbtByPage.ubtDevTrace("dcs_ediath_dev_log", {
      title: "miniprogram_zbvtm_islogin",
      data: { isLogin }
    });


  },
  requestServer() {
    // 高度计算
    const systemInfo = wx.getSystemInfoSync();
    const bottomSafeArea = (systemInfo.screenHeight - systemInfo.safeArea.bottom) || 21;
    const scrollHeight = systemInfo.screenHeight - bottomSafeArea - 52;
    // 信息流 埋点
    const extraObj1 = { kpi: { allianceid: this.query.allianceid, sourceid: 'miniguide' } }
    const extraObj2 = { uids: this.query.uid, kpi: { allianceid: this.query.allianceid, sourceid: 'guideteam' } }
    const extraJsonString1 = JSON.stringify(extraObj1)
    const extraJsonString2 = JSON.stringify(extraObj2)
    const ubtInfo = {
      ...this.data.ubtInfo,
      destsegroupid: this.query.destSetId,
      advisorid: this.query.guideId,
      allianceid: this.query.allianceid,
      destcityid: this.query.districtId,
      destcityname: this.query.districtName
    }
    this.setData({
      ubtInfo,
      // 曝光埋点
      exposeFind1: {
        ...this.data.exposeFind1,
        data: ubtInfo,
      },
      exposeFind2: {
        ...this.data.exposeFind2,
        data: ubtInfo,
      },
      // 展示私家攻略tab(大向导uid的数据) 
      showTab: this.query.uid,
      //合集名称
      destSetName: this.query.destSetName,
      // 隐藏口碑榜
      hideCityTop: this.query.hideCityTop,
      // 高度计算
      scrollHeight,
      bottomSafeArea,
      // 营销参数
      extraJsonString1,
      // 营销参数 + 用户id
      extraJsonString2,
      // 城市信息
      globalInfo: {
        geoType: 'base',
        id: this.query.districtId,
        type: 3
      }
    })
    this.init()
    this.initTransferCid()
  },
  init() {
    // 向导人
    cwx.request({
      url: "/restapi/soa2/19684/json/getGuideDetailV2",
      method: "POST",
      data: {
        needOther: true,
        guideList: [{ "guideId": this.query.guideId }],
        sceneCode: "guide_detail",
      },
      success: (res) => {
        const guideDetail = res?.data.guideDetailList?.[0]
        const { orderAmount } = guideDetail?.guideOtherInfo || {}
        this.setData({
          orderAmount
        })
      },
      fail: function (e) { }
    });
    // 行前
    cwx.request({
      url: "/restapi/soa2/13310/json/VtmDestsetGetBeforeDepartureConfig",
      method: "POST",
      data: { destSetId: this.query.destSetId },
      success: (res) => {
        if (res.statusCode === 200) {
          const beforeDepartureConfig = res?.data?.data?.beforeDepartureConfig || []
          this.setData({
            beforeDepartureLoading: false,
            beforeDepartureSuccess: beforeDepartureConfig.length > 0,
            beforeDepartureList: beforeDepartureConfig
          })
        } else {
          this.setData({
            beforeDepartureLoading: false,
            beforeDepartureSuccess: false
          })
        }
      },
      fail: (res) => {
        this.setData({
          beforeDepartureLoading: false,
          beforeDepartureSuccess: false
        })
      }
    });
  },
  transferCid(cityId) {
    // 酒店 转 攻略 cityId
    return new Promise((resolve, reject) => {
      cwx.request({
        url: "/restapi/soa2/13373/json/map",
        method: "POST",
        data: {
          globalid: cityId,
          geocategoryid: 3, // 当type为base时 city=3(城市、县),
          type: 'base', // 表示传入的参数是酒店系的配置，返回中会返回三种城市信息，自行过滤
        },
        success: (res) => {
          const locations = res?.data?.locations || []
          let gs_cid = ''
          locations.forEach(item => {
            if (item.type === 'gs_district') {
              gs_cid = item.globalid
            }
          })
          if (gs_cid) {

            resolve({ gs_cid })
          } else {
            reject({ gs_cid, res })
          }
        },
        fail: function (error) {
          reject({ cityId, error })
        }
      });
    })

  },
  async initTransferCid() {
    // 问答
    try {
      const { gs_cid } = await this.transferCid(this.query.districtId)
      this.setData({
        gs_cid: gs_cid,
      })
      cwx.request({
        url: "/restapi/soa2/19684/json/getGuideDetailV2",
        method: "POST",
        data: {
          coverImageSize: "C_568_320",
          logoImageSize: "C_300_300",
          needComment: true,
          needCommentTag: true,
          needOther: true,
          needTag: true,
          needRecommendedReason: true,
          guideList: [{ "guideId": this.query.guideId }],
          sceneCode: "guide_detail",
          districtId: gs_cid
        },
        success: (res) => {
          if (res.statusCode === 200) {
            const guideDetail = res?.data.guideDetailList?.[0]
            const { logoImgUrl, name } = guideDetail?.guideBasicInfo || {}
            const { homeH5Url } = guideDetail?.guideOtherInfo || {}
            const { commentCount, recommendedReason } = guideDetail?.commentInfo || {}
            const tagList = guideDetail?.tagList || []
            let entrytimeStr = ''
            let cityTopInfo = null
            tagList.forEach(item => {
              if (item.code === 'entrytime') {
                entrytimeStr = item.content
              } else if (item.code === 'city_top') {
                cityTopInfo = {
                  content: `入选${this.query.destSetName || ''}·当地向导口碑榜`,
                  h5Url: item?.urls?.h5Url
                }
              }
            });
            this.setData({
              guideBasicInfo: {
                logoImgUrl,
                homeH5Url,
                name,
                entrytime: entrytimeStr,
                commentCount,
                recommendedReason,
                cityTopInfo
              },
              guideSuccess: !!guideDetail,
              guideLoading: false
            })
            if (!guideDetail) {
              cwx.sendUbtByPage.ubtDevTrace("dcs_ediath_dev_log", {
                title: `miniprogram_zbvtm_guide_${this.query.guideId}`,
              });
            }
          } else {
            this.setData({
              guideSuccess: false,
              guideLoading: false
            })
          }
        },
        fail: () => {
          this.setData({
            guideSuccess: false,
            guideLoading: false
          })
        }
      });
      cwx.request({
        url: "/restapi/soa2/13792/json/searchAskForH5",
        method: "POST",
        data: {
          "TagIdList": [0],
          "DistrictId": gs_cid,
          "PageSize": 3,
          "PageNum": 0,
          "SearchType": 1,
          "RelationType": 6,
        },
        success: (res) => {
          if (res.statusCode === 200) {
            const askList = res?.data?.AskList || []
            const askListAppUrl = res?.data?.AskListAppUrl
            this.setData({
              askListSuccess: askList.length > 0,
              askListLoading: false,
              askList,
              askListAppUrl
            })
          } else {
            this.setData({
              askListSuccess: false,
              askListLoading: false,
            })
          }
        },
        fail: () => {
          this.setData({
            askListSuccess: false,
            askListLoading: false,
          })
        }
      });
      // 攻略、榜单
      cwx.request({
        url: "/restapi/soa2/13310/json/VtmGetDestAggregateContent",
        method: "POST",
        data: { strategyDistrictId: gs_cid, districtId: gs_cid },
        success: (res) => {
          if (res.statusCode === 200) {
            const bookInfo = res?.data?.data?.searchBook?.bookInfo
            // const rankingInfo = res?.data?.data?.searchRankingAndTopNItemInfo
            this.setData({
              methodLoading: false,
              methodSuccess: true,
              methodInfo: {
                bookInfo: bookInfo ? {
                  ...bookInfo,
                  coverImage: bookInfo.coverImage ? `${bookInfo.coverImage}?proc=resize/m_c,w_360,h_210,B8E0` : ''
                } : null, //攻略书
                // rankingInfo //榜单
              }
            })
          } else {
            this.setData({
              methodLoading: false,
              methodSuccess: true
            })
          }

        },
        fail: (res) => {
          this.setData({
            methodLoading: false,
            methodSuccess: false
          })
        }
      });
      // 天气
      cwx.request({
        url: "/restapi/soa2/13310/json/VtmGetLiveWeather",
        method: "POST",
        data: { districtId: gs_cid },
        success: (res) => {
          if (res.statusCode === 200) {
            const weather = res?.data?.data?.weather
            this.setData({
              weatherSuccess: !!weather,
              weatherLoading: false,
              weatherInfo: weather,
              // districtId: cid,
            })
            if (weather?.wNo > 34) {
              cwx.sendUbtByPage.ubtDevTrace("dcs_ediath_dev_log", {
                title: `miniprogram_zbvtm_wNo_${weather?.wNo}`,
              });
              // 图片只支持到34 加埋点
            }
          } else {
            this.setData({
              weatherLoading: false,
              weatherSuccess: false
            })
          }
        },
        fail: (res) => {
          this.setData({
            weatherLoading: false,
            weatherSuccess: false
          })
        }
      });
    } catch (error) {
      cwx.sendUbtByPage.ubtDevTrace("dcs_ediath_dev_log", {
        title: "miniprogram_zbvtm_init_error",
        error
      });
    }
  },
  getExposeData: sendExposeData,
  getTitle() {
    return `Hi，我是你的${this.data.destSetName || ''}站领队，点击查看私藏攻略`
  },
  getQuery() {
    const { destSetId, destSetName, hideCityTop, guideId, districtId, districtName, euid, allianceid } = this.query
    return `destSetId=${destSetId}&destSetName=${destSetName}&hideCityTop=${hideCityTop ? '1' : ''}&guideId=${guideId}&cid=${districtId}&cnm=${districtName}&uid=${euid}&allianceid=${allianceid}`
  },
  onShareAppMessage() {
    return {
      title: this.getTitle(),
      path: `/pages/vtm/index/index?${this.getQuery()}`
    }
  },
  onShareTimeline() {
    return {
      title: this.getTitle(),
      query: `${this.getQuery()}`
    }
  },
  onAddToFavorites() {
    return {
      title: this.getTitle(),
      query: this.getQuery()
    }
  },
  handleBtnClick: function (e) {
    const index = e.currentTarget.dataset.index
    cwx.sendUbtByPage.ubtTrace(index === '0' ? "gst_qrcode_ayhfx_click" : 'gst_qrcode_ascgl_click', {
      ...this.data.ubtInfo,
    });
    this.setData({
      activeIndex: +index
    })
  },
  // 获取信息流组件实例，e.detail是组件实例，此方法与 waterfall的 bindgetref 绑定
  getWaterfallRef0: function (e) {
    this.waterfallRef0 = e.detail;
  },
  getWaterfallRef1: function (e) {
    this.waterfallRef1 = e.detail;
  },
  // 瀑布流加载，此方法需与 scroll-view 的 bindscrolltolower 绑定
  getWaterfallListMore: function () {
    if (this.data.activeIndex === 0) {
      this.waterfallRef0 && this.waterfallRef0.getListMore();
    } else {
      this.waterfallRef1 && this.waterfallRef1.getListMore();
    }
  },
  footerJump(e) {
    const index = e.currentTarget.dataset['index'];
    switch (index) {
      case 1:
        cwx.sendUbtByPage.ubtTrace('gst_qrcode_adbcxqd_click', {
          ...this.data.ubtInfo,
        });
        const data1 = {
          url: encodeURIComponent(`https://m.ctrip.com/webapp/vacations/vtmportal/triplist?DestCityId=${this.query.districtId}&sourcefrom=vtmMini`),
          pageId: '10320642318',
          isShareWebUrl: true
        };
        cwx.navigateTo({
          url: '/cwx/component/cwebview/cwebview?data=' + JSON.stringify(data1)
        });
        // cwx.user.getToken((token) => {
        //   cwx.cwx_navigateToMiniProgram({
        //     appId: 'wxa3711a5a43126c81',
        //     path: `pages/triplist/triplist?districtid=${this.query.districtId}&cityname=${this.query.districtName}&__userToken=${token}`,
        //   })
        // });
        break;
      case 2:
        cwx.sendUbtByPage.ubtTrace('gst_qrcode_asos_click', {
          ...this.data.ubtInfo,
        });
        const data = {
          url: encodeURIComponent('https://m.ctrip.com/webapp/vacations/vtmportal/sos?navBarStyle=white&isHideNavBar=YES&from_native_page=1'),
          pageId: '10320654818',
          isShareWebUrl: true
        };
        cwx.navigateTo({
          url: '/cwx/component/cwebview/cwebview?data=' + JSON.stringify(data)
        });
        break;
      default:
        break;
    }
  },
});
