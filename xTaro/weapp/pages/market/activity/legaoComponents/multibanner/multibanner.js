// pages/market/legaoComponents/multibanner/multibanner.js
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
        list: [],
        rows: 2,
        borderRadius: '0px',
        spacing: '0px',
        isSideSpace: false,
        isScrollx: false,
        rowHeight: '100px',
        fig:'https://pic.c-ctrip.com/vacation_v2/h5/group_travel/no_product_pic.png',
        isExt: false,
        showMore:false,
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
      data = Object.assign({}, this.data);
      console.log('multibanner-data', data);
      if (data.item.list) {
        data.item.list = this._parseData(data.item.list);
        data.item.isExt = data.item.rows < data.item.list.length;
      }
      //默认值
      data.item.rowHeight = data.item.rowHeight || '150px';
      this.setData(data);
    },
    _parseData(list) {
      let newlist = [];
      try{
        newlist = JSON.parse(list || "[]");
      }catch(e){
        newlist = [];
      }
      let idx = 1;
      newlist.forEach((item) => {
        if (Array.isArray(item)) {
          item.forEach((obj) => {
              obj.idx = idx;
              idx++;
          });
        }
      });
      console.log('newList', newlist);
      return newlist;
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
        elementCnt: item.fig,
        openid: cwx.cwx_mkt.openid,
        category: 'button_click',
        time:new Date().getTime()
      }
      console.log(traceData);
      cwx.getCurrentPage().ubtTrace(188746, traceData);

      //跳转
      let mpUrl = item.mpUrl;
      if(mpUrl && mpUrl != ''){
        goTargetUrl(mpUrl);
      }
    }
  }
})
