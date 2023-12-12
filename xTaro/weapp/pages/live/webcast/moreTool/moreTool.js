/*
 * @Author: sun_ping
 * @Date: 2023-04-14 14:29:04
 * @LastEditors: sun_ping
 * @LastEditTime: 2023-04-26 10:36:31
 * @Description: 
 */
// pages/live/webcast/moreTool/moreTool.js
import LiveUtil from '../../common/LiveUtil';
import {cwx} from '../../../../cwx/cwx.js';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pageType: {
      type: Number,
      value: 0
    },
    isIphoneX: {
      type: Boolean,
      value: 0
    },
    windowWidth: {
      type: Number,
      value: 0
    },
    currentQuality: {
      type: Number,
      value: 0
    },
    qualityList: {
      type: Array,
      value: []
    }

  },

  /**
   * 组件的初始数据
   */
  lifetimes: {
    ready() {
      this.currentPage = cwx.getCurrentPage() || {};
    },
    detached() {

    }
  },
  data: {
    moreToolsState: 0
  },



  /**
   * 组件的方法列表
   */
  methods: {
		catchtouchmove:function(){
      return false
		},
    hideToolPanel: function () {
      this.setData({
        moreToolsState: 0
      })
    },
    changeToolPanel: function (e) {
      let moreToolsState = this.data.moreToolsState;
      if (moreToolsState == 0) {
        moreToolsState = 1;
        LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_myprize_show');
        LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_livedefinition_show');
      } else if (moreToolsState == 1) {
        moreToolsState = 2;
      }

      LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_moretools');
      LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_moretools_pop');

      this.setData({
        moreToolsState: moreToolsState
      })
    },
    changePullQuality: function (e) {
      let url = e.currentTarget.dataset.url || '';
      let index = e.currentTarget.dataset.index || 0;
      wx.showLoading({
        title: '加载中'
      });
      LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_livedefinition_switch');
      console.log('this.currentPage===>',this.currentPage);
      this.currentPage.isChangingQuality = true;
      this.currentPage.preQualityStream = this.currentPage.data.pullStreamUrl;
      this.currentPage.preQualityStreamIndex = this.currentPage.data.currentQuality;
      this.currentPage.setData({
        pullStreamUrl: url,
        currentQuality: index,
      })
      this.setData({
        moreToolsState: 0
      })
    },
    jumpToBagInfo: function (e) {
      LiveUtil.jumpToBagInfo(e);
    }
  }
})