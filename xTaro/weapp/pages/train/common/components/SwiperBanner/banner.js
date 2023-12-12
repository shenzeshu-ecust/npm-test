import { cwx } from '../../../../../cwx/cwx.js';
// import { ubtTrace } from '../../../../../cwx/cpage/ubt_wx.js';

Component({
  properties: {
    arrivedCity: {
      type: Array,
    },
    arrivedStation: {
        type: Array,
    },
    pageId: {
      type:String,
    },
    bannerItemList: {
        type: Array,
    },
    Width: {
      type:String
    },
    Height: {
      type:String
    },
    Radius: {
      type: String
    },
    clickUbtKey: {
      type: String
    },
    exposureUbtKey: {
      type: String
    }
  },
  data: {
    interval: 3000,
    duration: 1000,
    _bannerItemList: [],
    // 第一张图片埋点
    isInit: true
  },
  observers: {
    'bannerItemList,arrivedStation,arrivedCity': function(bannerItemList,arrivedCity,arrivedStation) {
      if(bannerItemList.length && arrivedCity.length && arrivedStation.length){
        this.setData({
          _bannerItemList: this.filtList(bannerItemList)
        })
      }
    }
  },

  methods: {
    // 处理城市
    filtList:function() {
      const arrivedStation = this.properties.arrivedStation;
      const arrivedCity = this.properties.arrivedCity;
      const arr = this.properties.bannerItemList.filter(item => {
        // 定时上下线功能
        const curTs = +new Date()
        if (!((+new Date(item.beginTime || null)) < curTs && curTs < (+new Date(item.endTime || null)))) {
          return false
        }
        // 全量投放地区
        if(item.showAllArea) {
          return true
        }
        // 到达站点优先级大于到达城市，如果站点显示有，城市没有，那么就一定会显示
        // 如果站点显示没有，但是城市有，那还是显示
        let intersectionStation = item.arrivedStation.filter(v => arrivedStation.includes(v));
        let intersectionCity = item.arrivedCity.filter(v => arrivedCity.includes(v));
        if(intersectionStation.length > 0){ return true;};
        if(intersectionCity.length > 0){ return true;};
      })
      // 第一张图片埋点少计算一次
      if(this.data.isInit && arr.length){
        this.setData({ isInit: false });
        cwx.getCurrentPage().ubtTrace(this.properties.exposureUbtKey,{
          pageId:this.properties.pageId,
          index:0,
          data:arr[0].pageData
        })
      }
      return arr;
    },
    //点击图片触发事件
    swiperclick (e) {
      let item = e.currentTarget.dataset.item;
      const { redirectType, linkObj, pageData} = item;
      if(cwx.getCurrentPage()){
        cwx.getCurrentPage().ubtTrace(this.properties.clickUbtKey,{
          pageId:this.properties.pageId,
          pageData
        })
      }
      // 跳转:先判断链接类型，三种内部小程序，外部小程序，h5，再跳转
      if(redirectType === 'h5' || redirectType === 'innerMini'){
        const { url = '' } = linkObj;
        if(!url) return;
        cwx.navigateTo({
          url: url,
          data: {
            url
          },
          callback: () => {}
        })

      }else if(redirectType === 'outerMini'){
        const { appId, url } = linkObj;
        if(!url || !appId) return;
        // 跳转外部
        cwx.navigateToMiniProgram({
          appId: appId,
          path: url,
          envVersion: 'release', // develop开发版 trial体验版  release正式版
          success:() => {
              // 打开成功
          },
      })

      }
    },
    // 切换
    swiperChange(e){
      const index = e.detail.current;
      const data = this.data._bannerItemList[index].pageData;
      if(cwx.getCurrentPage()){
        cwx.getCurrentPage().ubtTrace(this.properties.exposureUbtKey,{
          pageId:this.properties.pageId,
          index,
          data
        })
      }

    }
  },

})
