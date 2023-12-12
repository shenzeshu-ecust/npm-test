import { isValidLocation, isValidCoordinate, getBtnList } from 'detail-mapView-compt-biz.js';
import { cwx } from '../../../../../cwx/cwx.js'
import { jumpUrl } from '../../../utils/util.js'
let ubt = cwx.sendUbtByPage;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    location: {
      type: Object,
      value:{
        latitude: 0,
        longitude: 0,
        name: '',
        address: '',
        title: '',
        description: '',
        actionCode:'',//导航埋点
        btnList: [
          {
            icon: '',
            title: 0,
            type: '',// phone， url
            content: '',
            actionCode: ''
          }
        ]
      },
      observer: function(newVal, oldVal, changedPath){
        if (newVal && isValidLocation(newVal)) {
          console.log(newVal)
          this.setData({
            backgroundImage: 'https://pages.c-ctrip.com/schedule/pic/wxxcx/cts_map_default.jpg',
            isValidLocation: true,
            isValidCoordinate: isValidCoordinate(newVal.latitude, newVal.longitude),
            btns: getBtnList(newVal.btnList)
          });
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    backgroundImage: 'https://pages.c-ctrip.com/schedule/pic/wxxcx/cts_map_default2.png',
    isValidLocation: false,
    isValidCoordinate: false
  },

  /**
   * 组件的方法列表
   */
  methods: {

    onNavigationTap: function (event) {
      if (this.data.location && this.data.location.actionCode) {
        ubt.ubtTrace(102325, {
          actionCode: this.data.location.actionCode,
          actionType: 'click'
        });
      }
      console.log(this.data.location)
      wx.openLocation({
        latitude: this.data.location.latitude,
        longitude: this.data.location.longitude,
        name: this.data.location.name,
        address: this.data.location.address,
        fail: function(res) {
          wx.showToast({
            title: '导航失败',
            icon: 'none'
          });
        }
      });
    },
    navToUrl: function(e){
      console.log('navToUrl', e)
      let url = e.currentTarget.dataset.content
      let actionCode = e.currentTarget.dataset.actionCode
      if (actionCode) {
        ubt.ubtTrace(102324, {
          actionCode: actionCode,
          actionType: 'click'
        });
      }
      if(url){
        jumpUrl(url);
      }
    },
    callPhone: function(e){
      console.log('callPhone', e)
      let phone = e.currentTarget.dataset.content
      let actionCode = e.currentTarget.dataset.actioncode
      if (actionCode){
        ubt.ubtTrace(102324, {
          actionCode: actionCode,
          actionType: 'click'
        });
      }
      if (phone) {
        wx.makePhoneCall({
          phoneNumber: phone
        })
      }
    }
  }
})
