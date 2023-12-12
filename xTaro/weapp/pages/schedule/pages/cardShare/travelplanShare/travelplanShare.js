import { cwx, CPage } from '../../../../../cwx/cwx.js';
import { loadNeededCardData, loadLocalCardData } from './biz.js';
import { shareSuccess } from '../../../utils/util.js';
import {
  calcDistance,
  deleteTravelPlan,
  getTravelPlanInfo,
  saveTravelPlan,
  updateTravelPlanInfo
} from "../../sendService";
import {getAddedRequst, getDistanceKey, getPoiLocation} from "./biz";


CPage({
  pageId: '10650007450',
  checkPerformance: true,
  _queryParam: undefined,

  data: {
    isLoadCompleted: false,
    loadSuccess: false,
    failText:'分享路线已被删除',
    travelPlanInfo: null,
    screenHeight:wx.getSystemInfoSync().screenHeight,
    screenWidth:wx.getSystemInfoSync().screenWidth,
    showAllOverview: false,
    canvasTempImg: null,
    showCanvas: false,
    //底部按钮状态:  1-不显示  2-保存为我的路线  3-查看我的路线
    travelStatus: 2
  },

  onLoad: function (options) {
    this._queryParam = options || {};
    if (this._queryParam.travelStatus) {
      this.setData({travelStatus: Number(this._queryParam.travelStatus)});
    }
    //
    const screenW = wx.getSystemInfoSync().screenWidth;
    const ctx = wx.createCanvasContext('image-canvas');
    // ctx.rect(0, 0, 120, 8);
    const grd = ctx.createLinearGradient(screenW/2, 0, screenW/2, 292);
    grd.addColorStop(0, 'rgba(4, 38, 50, 0.0)');
    grd.addColorStop(0.3, 'rgba(4, 38, 50, 1.0)');
    ctx.setFillStyle(grd);
    ctx.fillRect(0, 0, screenW, 292)
    ctx.draw(true, this.canvasToTempImage);
    //
    if (!options || !options.travelPlanId) {
      wx.showToast({
        title: "没有请求参数",
        icon: 'none'
      })
    } else {
      this.loadData();
    }
  },
  // 生成图片
  canvasToTempImage: function() {
    wx.canvasToTempFilePath({
      canvasId: 'image-canvas',
      success: (res) => {
        this.setData({canvasTempImg: res.tempFilePath});
      },
      fail: () => {
        this.setData({canvasTempImg: 'none'});
      }
    }, this);
  },

  showAllOverview(e) {
    this.setData({showAllOverview: true});
  },

  onShareAppMessage: function (res) {
    // let that = this;
    // if (res.from === 'button') {
    //   this.ubtTrace(102324, {
    //     actionCode: 'c_mp_train_detail_share_click',
    //     actionType: 'click',
    //   })
    // }
    return {
      title: "你的好友分享了一条路线“" + this.data.travelPlanInfo.title + "”～",
      path: "pages/schedule/pages/cardShare/travelplanShare/travelplanShare?travelPlanId=" + this.data.travelPlanInfo.travelPlanId,
      imageUrl:  "https://pages.c-ctrip.com/schedule/photo/sku_wxshare_photo.png",
      success: function (res) {
        shareSuccess(res, that);
      }
    }
  },

  loadData: function () {
    const { travelPlanId, source }  = this._queryParam;

    cwx.showLoading({
      title: '加载中',
      mask: true
    })
    getTravelPlanInfo(travelPlanId, source || 'WxShare').then(travelPlanData => {
      cwx.hideLoading()
      if(travelPlanData?.smartRouteList === undefined || travelPlanData?.smartRouteList === null){
        this.loadFail('分享路线已被删除');
        return;
      }

      const travelPlanInfo = travelPlanData?.smartRouteList[0];
      const { dailyPathInfoList } = travelPlanInfo;

    //   //获得坐标
    //   const calculateDistances = [];
    //   dailyPathInfoList?.forEach((path) => {
    //     const { pathElementList } = path;
    //     if(pathElementList && pathElementList.length > 1){
    //       for (let i = 1; i < pathElementList.length; i += 1) {
    //         const poiItem = pathElementList[i];
    //         const lastPOIItem = pathElementList[i - 1];
    //         const { coordinate: from } = lastPOIItem;
    //         const { coordinate: to } = poiItem;
    //         if (from && to) {
    //           calculateDistances.push([from, to]);
    //         }
    //       }
    //     }
    //   });
    //   //计算距离
    //   if (calculateDistances.length > 0) {
    //     const points = [];
    //     for (let i = 0; i < calculateDistances.length; i += 1) {
    //       const [from, to] = calculateDistances[i];
    //       points.push({ from, to });
    //     }

    //     calcDistance(points).then(results => {
    //       if (!results || results.length === 0) {
    //         return;
    //       }
    //       let distanceMap = {};
    //       calculateDistances.forEach((coor, i) => {
    //         const result = results[i];
    //         const key = getDistanceKey(coor[0], coor[1]);
    //         distanceMap[key] = result;
    //       });

    //       this.setData({
    //         loadSuccess: true,
    //         isLoadCompleted: true,
    //         travelPlanInfo: loadNeededCardData(travelPlanInfo, distanceMap),
    //         showAllOverview: travelPlanInfo.routeDays <= 2,
    //         showCanvas: travelPlanInfo.routeDays >= 2
    //       })
    //     }).catch(err => {
    //       this.setData({
    //         loadSuccess: true,
    //         isLoadCompleted: true,
    //         travelPlanInfo: loadNeededCardData(travelPlanInfo),
    //         showAllOverview: travelPlanInfo.routeDays <= 2,
    //         showCanvas: travelPlanInfo.routeDays >= 2
    //       })
    //     })

    //   }else{
        this.setData({
          loadSuccess: true,
          isLoadCompleted: true,
          isLogin: cwx.user.isLogin(),
          travelPlanInfo: loadNeededCardData(travelPlanInfo),
          showAllOverview: travelPlanInfo.routeDays <= 2,
          showCanvas: travelPlanInfo.routeDays >= 2
        })
    //   }

    }).catch(err => {
      cwx.hideLoading()
      this.loadFail('未加载成功');
    })
  },

  loadFail: function (failText) {
    this.setData({
      loadSuccess: false,
      isLoadCompleted: true,
      isLogin: cwx.user.isLogin(),
      failText
    })
  },
  tryLoadAgin: function() {
    this.setData({
      isLoadCompleted: false,
    });
    this.loadData();
  },
  saveRoute:function () {
    let that = this;
    cwx.showLoading({
      title: '提交中',
      mask: true
    });
    cwx.user.checkLoginStatusFromServer(function (res) {
      if (res) {
        that._saveTravelPlanInfo();
      } else {
        cwx.hideLoading();
        cwx.user.login({
          callback: (res) => {
            if (res.ReturnCode === "0") {//登录成功
              that._saveTravelPlanInfo();
            }
          }
        })
      }
    });
  },
  _saveTravelPlanInfo() {
    const { source, travelPlanId } = this._queryParam;
    const isFromFlowShare = source === 'aiRouteWxShare'; // 来自信息流分享
    const params = isFromFlowShare ? {
        requestType: 8, // 8: 信息流路线分享添加, 5: travelPlanId导入旅行计划
        source: 7, // 7: 信息流路线分享添加 5: 自建路线微信分享
        aiRouteId: travelPlanId,
      } : {
        requestType: 5,
        source: 5,
        travelPlanId,
      };
    saveTravelPlan(params).then(data => {
      wx.showToast({
        icon: "none",
        title: '已保存至行程-我的路线！',
      });
      this.setData({
        travelStatus: 3
      });
    }).catch(() => {
      wx.showToast({
        icon: "none",
        title: '保存未成功，请稍后再试',
      });
    }).finally(() => {
      cwx.hideLoading();
    });
  },
  goToDetails:function () {
    cwx.navigateTo({
      url: '/pages/schedule/pages/travelLineList/travelLineList',
    })
  },
  orderSimilarRoute: function() {
    const { orderSimilarRouteUrl = "" }  = this._queryParam;
    // orderSimilarRouteUrl线路榜跳过来的时候就会做一层编码
    // cwebview打开页面的方法传的url正好也是需要encodeURIComponent编码的,所以直接传
    cwx.component.cwebview({
      data: {
        url: orderSimilarRouteUrl
      }
    })
  }
})