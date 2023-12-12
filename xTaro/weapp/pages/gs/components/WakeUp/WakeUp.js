import { cwx } from "../../../../cwx/cwx.js"
/*
  视频播放组件

  用法 在引入页面的json文件下
  "usingComponents": {
    "WakeUpComponent": "../components/WakeUp/WakeUp"
  }
  在相应的wxml中 引入
  <WakeUpComponent class="wakeUpComponnet" id="wakeUpComponnet" ></WakeUpComponent>

 */

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    wakeUpData: {
      type: Object,
      value: null
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
  },
  ready: function () {
    let { wakeUpData} = this.dataset;
    this.setData({
      wakeUpData: wakeUpData
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _wakeUpBackBtns(){
      // 拉出隐藏返回首页返回APP按钮组
      let { wakeUpData } = this.data;
      wakeUpData.wakeUpIsPull = !wakeUpData.wakeUpIsPull;
      this.setData({
        wakeUpData: wakeUpData
      })
    },
    _goHome(){
      let { wakeUpData } = this.data;
      console.log(wakeUpData)
      let tmp = {};
      wakeUpData.list.map((v) => {
        if (v.name === 'home') {
          tmp = v
        }
      });
      cwx.reLaunch({
        url: tmp.url,
      })
    }
  }
})
