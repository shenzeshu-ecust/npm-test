import { cwx, _, __global } from "../../../../cwx/cwx.js";
const UTILS = require('../../common/utils.js');
let mPage, pageId = "";
const app = getApp()

Component({
  timer: null,
  externalClasses: ['mkt-collection-layout'],
  properties: {
    isWebview: {
      type: Boolean,
      value: false
    },
    //是否自定义导航
    isCustomNav:{
      type:Boolean,
      value:true
    },
    delayTime: {
      type: Number,
      value: 5000
    },
    collectText: {
      type: String,
      value: '点击"..."添加到我的小程序，下次使用更方便'
    },
    daysBetween: {
      type: Number,
      value: 7
    }
  },
  data: {
    colltectStatus: '',
    navHeight:4
  },
  pageLifetimes: {
    show: function () {
      mPage = cwx.getCurrentPage();
      // console.log('mPage======',mPage)
      pageId = mPage ? (mPage.pageid || mPage.pageId || '') : '';
    },
    hide: function () {
      this.setData({ colltectStatus: '' })
    }
  },
  async ready () {
    // console.log('%c 组件被加载了几遍，用于生产环境测试 组件同 web-view 重定向而不展示的情况', 'color: red')

    const { daysBetween } = this.data;
    let storageTime = cwx.getStorageSync('mkt_new_collect_time') || 0,
      clickClose = cwx.getStorageSync('mkt_new_collect_click') || false;
    storageTime = Number(storageTime);

    try {
      mPage = cwx.getCurrentPage();
      pageId = mPage ? (mPage.pageid || mPage.pageId || '') : '';
      const pageOptions = mPage.options;
      const pageRoute=mPage.route
      if(pageOptions && pageOptions.hideCollection && pageOptions.hideCollection == "T") return;
      if(this.data.isCustomNav){
        console.log('====是自定义导航===')
        this.setData({
          navHeight:app.globalData.statusBarHeight+app.globalData.titleBarHeight
        })
      }
      const result=await UTILS.fetch('22559', 'collectionConfig', {})
      let isBlack=false
      console.log('====收藏组件配置====',result)
      if(result.data && result.code==0 && result.data.black_list){
          for(let i=0;i<result.data.black_list.length;i++){
            let item=result.data.black_list[i]
            if(item==pageRoute||(pageRoute.startsWith('cwx/component') && pageOptions.data && JSON.parse(pageOptions.data).url && cwx.util.decodeURIComponentSafely(JSON.parse(pageOptions.data).url).includes(item))||(pageRoute=='pages/market/web/index' && cwx.util.decodeURIComponentSafely(pageOptions.from).includes(item))){
              console.log('===黑名单==',pageRoute)
              //查询当前页 是否 原生地址||cwebview h5地址||market web h5地址
              isBlack=true
              break;
            }
          }
      }
      if(isBlack){
        return
      }
      const cleanStorage = (pageOptions && pageOptions.cleanStorage) ? true : false;
      const sdkVersion = wx.getSystemInfoSync().SDKVersion || '0'; //sdk版本

      this.logTrace('userSdkVersion', '用户当前的基础库版本号', sdkVersion || '')
      
      if (UTILS.compareVersion(sdkVersion, '2.29.1') >= 0 && wx.checkIsAddedToMyMiniProgram) {
        wx.checkIsAddedToMyMiniProgram({
          success: (res) => {
            console.log('====检查是否需要展示 收藏组件1', res)
            if (!res.added) {
              //是否收藏过小程序
              let now = new Date()
              //点击关闭按钮间隔daysBetween天再展示，未点击关闭每天展示一次
              if (cleanStorage || !storageTime || (clickClose && (now.getTime() - storageTime > daysBetween * 24 * 3600 * 1000)) || (!clickClose && (now.getMonth() + '-' + now.getDate()) != (new Date(storageTime).getMonth() + '-' + new Date(storageTime).getDate()))) {
                console.log('======检查是否需要展示 收藏组件2',)
                this.setData({
                  colltectStatus: 'show'
                }, () => {
                  clearTimeout(this.timer)
                  this.logTrace('showCollection', '展示收藏浮层', '')
                  this.timer = setTimeout(() => {
                    //5s之后主动消失
                    this.setData({
                      colltectStatus: 'hide'
                    })
                  }, this.data.delayTime)
                })
                cwx.setStorageSync('mkt_new_collect_time', new Date().getTime());
              }

            }
          }
        })
      } else {
        //基础库版本过低不展示
        console.log('===基础库版本过低===')
      }
    } catch (error) {
      //异常
      console.log('====组件报错了吗', error)
    }
  },
  methods: {
    closeCollection() {
      clearTimeout(this.timer)
      this.setData({ colltectStatus: 'hide' })
      cwx.setStorageSync('mkt_new_collect_click', true);
      this.logTrace('closeCollection', '关闭收藏浮层', '')
    },
  
    /** 埋点 */
    logTrace(actioncode, actionMsg, content = "") {
      try {
        // console.log('%c 微信小程序收藏组件 上报', 'color: skyblue')
        mPage && mPage.ubtTrace && mPage.ubtTrace(201002, {
          keyName: "mkt_2021Activity",
          activityName: "mkt_collection_component",
          actioncode: actioncode || '',
          actionMsg: actionMsg || '',
          pageId: pageId || '',
          openId: cwx.cwx_mkt.openid || '',
          content: content || '',
        });
      } catch (error) {
        console.log('埋点报错', error)
      }
    }
  }
})