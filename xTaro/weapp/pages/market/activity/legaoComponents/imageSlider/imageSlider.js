// pages/market/legaoComponents/imageSlider/imageSlider.js
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
    },
    
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
      console.log('imageSlider-data', data);
      let banners = JSON.parse(data.item.bannerData || []);
      let sliderData = [];
      if (banners.length) {
        sliderData = banners.slice().map((item, index) => {
            item.idx = index+1;
            return item;
        });
      }
      console.log('sliderData', sliderData);
      data.item.sliderData = sliderData;
      this.setData(data)
    },
    _handleClick(e) {
      let item = e.currentTarget.dataset['item'];
      //btnid埋点
      let traceData={ 
        tplId: this.data.tplId,
        tplName: this.data.tplName,
        componentId: this.data.componentId,
        componentName: this.data.componentName,
        elementIdx: item.idx,
        elementCnt: item.image,
        openid: cwx.cwx_mkt.openid,
        category: 'button_click',
        time:new Date().getTime()
      }
      console.log(traceData);
      cwx.getCurrentPage().ubtTrace(188746, traceData);

      //跳转
      let mpUrl =item.wxUrl;
      if(mpUrl && mpUrl != ''){
        goTargetUrl(mpUrl);
      }
    }
  }
})
