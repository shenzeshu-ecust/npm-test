// pages/market/legaoComponents/banner/banner.js
import {cwx} from "../../../../../cwx/cwx.js";
import { goTargetUrl } from '../common/legaoUtil';

Component({
  /**
   * 组件的属性列表
   */
  
  properties: {
    tplId:{
      type: Number,
      value: 0
    },
    tplName:{
      type: String,
      value: ''
    },
    componentId:{
      type: Number,
      value: 0
    },
    componentName:{
      type: String,
      value: ''
    },
    item: {
      type: Object,
      value: {
        top: '0px',
        paddingLR: 0,
        height: 0,
        background: '//pic.c-ctrip.com/vacation_v2/h5/group_travel/no_product_pic.png'
      },
      observer: '_setProps'
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
    _setProps() {
      let data = {}
      data = Object.assign({}, this.data)
      console.log('banner-data', data);
      let _paddingLR = data.item.paddingLR || 0;
      let _naturalWidth = data.item._naturalWidth || 0;
      let _naturalHeight = data.item._naturalHeight || 0;
      if (_naturalWidth && _naturalHeight) {
        let height = this._calcHeight(_naturalWidth, _naturalHeight, _paddingLR);
        data.item.height = height;
      }
      //修改top适配顶部留白
      data.item.top =  Number(data.item.top.replace('px',''));
      this.setData(data)
    },
    _calcHeight (width, height, padding) {
      const availWidth = wx.getSystemInfoSync().windowWidth - padding * 2;
      const _height = parseFloat(((height * availWidth) / width).toFixed(2));
      return _height;
    },
    _handleClick() {
      let item = this.data.item;
      //btnid埋点
      let traceData={ 
        tplId: this.data.tplId,
        tplName: this.data.tplName,
        componentId: this.data.componentId,
        componentName: this.data.componentName,
        elementIdx: item.idx||1,
        elementCnt: item.url,
        openid: cwx.cwx_mkt.openid,
        category: 'button_click',
        time:new Date().getTime()
      }
      console.log(traceData);
      cwx.getCurrentPage().ubtTrace(188746, traceData);

       //跳转
       let mpUrl = item.mpurl;
       if(mpUrl && mpUrl != ''){
        goTargetUrl(mpUrl);
       }
     }
    }
})
