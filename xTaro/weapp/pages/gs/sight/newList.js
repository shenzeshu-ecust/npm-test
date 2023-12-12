// pages/sight/list.js
import {
  cwx,
  CPage
} from '../../../cwx/cwx.js';
import {
  showLoading,
  hideLoading
} from "../common/base.js"
let _app = getApp();
CPage({
  pageId: '10650014614',
  pageCount: 20,
  pageIndex: 1,
  pageLoading: false,
  data: {
    topObject: {},
    themeList: [],
    themeTitle: '',
    blurImg: '', //毛玻璃图片
    sightList: [], //景点列表
    hasNextPage: true,
    loadMoreFailed: false,
    swiperNextMargin: 250,
    swiperPreMargin: 32,
    swiperCurrent: 0,
    isIphoneX: false,
  },
  requestParams: {
    Index: 1,
    Count: 20,
    themeId: 0,
    level2ThemeId: 0,
    SortType:11
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    options.data = options.data || options;
    this.requestParams.districtId = this.districtId = parseInt(options.data.districtId);
    this.themeId = options.data.themeId
    this.canLoading = true;
    this.isFirstTheme=true,
    // iphoneX 适配
    this.systemInfo = cwx.util.systemInfo;
    if ('model' in this.systemInfo) {
      let {model} = this.systemInfo;
      this.setData({
        isIphoneX: model.search('iPhone X') != -1 ? true : false
      });
    }
    this._fetchSightData()
    .then((res) => {
      console.log(res)
      hideLoading();
      this.setData({
        topObject: res.topObject,
        themeList: res.themeList,
        themeTitle: '主题玩法',
        sightList: res.sightList,
      })
    })
    .catch((err)=>{console.log('_fetchSightData err',err)})

  },
  _fetchSightData() {
    let _this = this;

    this.pageIndex == 1 &&
    showLoading();

    this.canLoading = false;
    let sightData = (param) => {
      return new Promise((resolve, reject) => {
        this.requestParams = { ...this.requestParams, lat: param.lat, lon: param.lon}
        if(this.themeId){
          this.requestParams = { ...this.requestParams, themeId: parseInt(this.themeId), showAgg:true}
        }
        cwx.request({
          url: '/restapi/soa2/13342/json/getSightRecreationList',
          data: this.requestParams,
          success: (res) => {
            //容错处理
            res &&
            res.data &&
            res.data.ResponseStatus &&
            res.data.ResponseStatus.Ack &&
            res.data.ResponseStatus.Ack != "Success" &&
            reject('-1'); //接口错误
            if(
            res.data.result &&
            res.data.result.sightRecreationList &&
            res.data.result.sightRecreationList.length < this.requestParams.Count){
              this.setData({hasNextPage:false})
            }
            //接口数据包装
            let result = (res.data && res.data.result) || {};

            //top 数据过滤
            result.mustPlay &&
            result.mustPlay.topSightList &&
            result.mustPlay.topSightList.length > 0 &&
            result.mustPlay.topSightList.map((v) => {
              v.originCoverImageUrl = v.coverImageUrl;
              v.coverImageUrl = v.coverImageUrl.replace('.jpg', '_D_600_359_Mtg_7.jpg');
              return v;
            })

            //主题玩法数据过滤
            result.aggregationList =
            result.aggregationList &&
            result.aggregationList.length > 0 &&
            result.aggregationList.filter((v) => {
              v.originCoverImageUrl = v.originalImageUrl;
              v.originalImageUrl = v.originalImageUrl.replace('.jpg', '_D_210_130_Mtg_7.jpg');
              if (v.type !== 113) { //过滤top榜单数据
                return v;
              }
              
            });

            result.aggregationList &&
            result.aggregationList.length > 0 &&
            result.aggregationList.map((v)=>{
              if(parseInt(v.expCount)>10000){
                v.expCount=(v.expCount/1000).toFixed(1)+'万';
              }
            });

            //列表标签过滤
            result.sightRecreationList.map((item) => {
              if (item.tagNameList && item.tagNameList.length > 0) {
                try {
                  //过滤多余标签，取剩余的前两个
                  item.tagNameList = item.tagNameList.join('#')
                  .replace('可返')
                  .replace('今日可用')
                  .split('#')
                  .filter((v) => {
                    if (!!v && v != "undefined") return v;
                  }).slice(0, 2);
                } catch (e) {}

                parseInt(item.commentScore)==0?
                item.commentScore='-1':'';

                parseInt(item.commentCount)==0?
                item.commentCount='-1':'';

                item.zoneNames.length>0?
                item.distanceStr=item.distanceStr+' · '+item.zoneNames.join(''):'';

              }
              item.originCoverImageUrl = item.coverImageUrl;

              (item.poiTypeValue == 17 || item.poiTypeValue == 101) 
              ?
              item.coverImageUrl = item.coverImageUrl.replace('.jpg', '_W_228_170_Mtg_7.jpg')
              :
              item.coverImageUrl = item.coverImageUrl.replace('.jpg', '_D_228_170_Mtg_7.jpg');

              return item;
            })

            let data = {
              topObject: (result.mustPlay && result.mustPlay) || {}, //必玩榜单
              themeList: (result.aggregationList && result.aggregationList.length > 0 && result.aggregationList) || [], //主题玩法
              sightList: _this.data.sightList.slice(0).concat((result.sightRecreationList && result.sightRecreationList) || []), //
            }

            //加载更多的图标
            _this.pageIndex == 1 &&
            data.topObject.topSightList &&
            data.topObject.topSightList.push({
              coverImageUrl: 'https://pages.c-ctrip.com/you/wechat/sight_list_pic_more.png',
            })

            _this.canLoading = true;
            resolve(data)
          },
          fail: (err) => {
            reject(-1)
          }
        });
      })
    }
    return new Promise(function(resolve, reject) {
      cwx.getLocation({
        type: 'wgs84',
        success: function(res) {
          let latitude = res.latitude;
          let longitude = res.longitude;
          resolve({lat: latitude,lon: longitude})
        },
        fail: function() {resolve({lat: 0,lon: 0})}
      })
    }).then(sightData.bind(this));
  },
  _topListChange(e) {
    //动态设置swiper 两边卡片的距离
    if (e.detail.current == this.data.topObject.topSightList.length - 2) {
      this.setData({
        swiperNextMargin: 97,
        swiperPreMargin: 185,
      });
    } else {
      this.setData({
        swiperNextMargin: 250,
        swiperPreMargin: 32,
      });
    }
    if (e.detail.current == this.data.topObject.topSightList.length - 1) {
      this._goTop();
      setTimeout(() => {
        this.setData({
          swiperCurrent: parseInt(e.detail.current - 1)
        })
      }, 200)
    } else {
      // this.setData({
      //   blurImg: this.data.topObject.topSightList&&this.data.topObject.topSightList.slice(0)[e.detail.current].coverImageUrl
      // });
    }
  },

  scrollToLower() {
    if (!!this.data.hasNextPage && this.canLoading) {
      this.pageIndex++;
      this.requestParams.Index = this.pageIndex;
      this._fetchSightData()
      .then((res) => {
        this.setData({
          sightList: res.sightList,
        })
      })
      .catch((err) => {
        err == -2 && this.setData({
          hasNextPage: false
        })
      })
    }
  },
  goSightDetail(e) {
    let id = e.currentTarget.dataset.id;
    
    cwx.navigateTo({
      url: '/pages/gs/sight/newDetail?sightId='+id
    });
  }
})