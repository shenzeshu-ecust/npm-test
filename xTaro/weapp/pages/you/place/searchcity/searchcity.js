import { cwx, CPage } from '../../../../cwx/cwx.js';
import { getInLandCityList, getInterCityList, getLocationList } from '../service/request';
/*页面场景值获取所需js*/
import  commonUtil from "../../common/common.js"
cwx.config.init();

let cityListToTop = [], alphaListToTop = [],setTime=null;
CPage({
  pageId: "10650055115",
  checkPerformance: true,  // 添加标志位
  data: {
    searchPlaceHolder: '热门目的地',
    iphonexFlag: false,
    searchScrollHeight: 0,
    toSearchView: 'Hot',
    searchTabBarList: [ // 自定tabBar配置项

    ],
    searchCurrentTab: '国内',
    searchHotCityList: null, //搜索热门城市列表
    searchAllCityList: null,
    searchInlandHasRender: false, //国内城市已渲染标志
    searchInterHasRender: false, //国外城市已渲染标志
    searchInlandData: {},
    searchInterData: {},
    searchHotSpotList: [
    ],
    searchScrollTop: 0, //滚动高度
    searchAlphabetBarList: [],//字母搜索索引
    searchTouchFlag: false, //用于标志字母栏是否被触摸
    searchTitleFixed: '热门城市',
    searchResultLocationList: '',
    searchResultPoiList: '',
    searchInputContent: '', //搜索框中内容
    searchInputValue: '', //input的value值
    searchIsFree: 0,
    searchShowBigAlpha: false,
    searchScrollAnimation: true,
    searchAlphabarShow: true,
    isCrhPage: 0,//根据参数中是否含有isCrhPage
    fromHomePage: 0, //根据参数是否含有fromHomePage，页面是否来自高铁游首页的标志
    fromCityID: 0,
    topRank:false, //判断页面是否来自榜单
    rankingId:'', //榜单参数
    fromPage : ''
  },

  onLoad: function (opt) {
    let self = this,
        title = '城市列表';
    if(parseInt(opt.fromTopRank)) {
      self.setData({
        topRank:true
      })
    }
    if(opt.rankingId) {
      self.setData({
        rankingId:opt.rankingId
      })
    }
    if(opt.fromPage){
      self.setData({
        fromPage:decodeURIComponent(opt.fromPage || "")
      })
    }
    if (opt.fromDistrictId) {
      // self.fromCityID = parseInt(opt.fromDistrictId, 10);
      self.setData({
        fromCityID: parseInt(opt.fromDistrictId)
      })
      console.log('opt.fromDistrictId');
    }
    if (opt.isCrhPage) {
      // self.isCrhPage = 1;
      self.setData({
        isCrhPage: 1
      })
    }
    if (opt.fromHomePage) {
      // self.fromHomePage = 1;
      self.pageId = '10650009668';
      self.setData({
        fromHomePage: 1,
        searchPlaceHolder: '搜索热门出发地'
      })
    }else{
      self.pageId = '10650009739';
      self.setData({
        searchPlaceHolder: '热门目的地'
      })
    }
    cwx.setNavigationBarTitle({
      title: title
    });
    self.getIphoneFlag(); //判断当前手机是否是iphonex
  },
  onShow: function () {
    // console.log('this is search page');
    let self = this;
    //请求数据
    let renderIndex = 0;
    self.toRequestCityData(renderIndex);
    if (self.data.fromHomePage) {
      console.log('来自高铁游频道页');
      self.setData({
        searchTabBarList: []
      })
    }else{
      self.setData({
        searchTabBarList: [
          {
            tabText: '国内',
            ac: 1,
          },
          {
            tabText: '海外',
            ac: 0,
          }
        ]
      })
    }
  },
  onReady: function () {
    let self = this;
    //获取屏幕高度
    cwx.getSystemInfo({
      success({ windowHeight }) {
        self.setData({
          searchScrollHeight: (windowHeight) * 2
        })
      }
    });
  },
  login: function () {

  },
  //判断当前手机型号是否是iPhone X
  getIphoneFlag: function() {
    let self = this;
    console.log('logic ---getIphoneFlag---');
    console.log('isIphoneX',commonUtil.isIphoneX());
    if (commonUtil.isIphoneX()) {
      self.setData({
        iphonexFlag: true
      })
    }else{
      self.setData({
        iphonexFlag: false
      })
    }
  },
  //根据参数请求国内海外数据
  toRequestCityData: function (renderIndex) {
    let self = this;
    cwx.showLoading({
      title: '加载中',
    })
    console.log('renderIndex',renderIndex);

    // ********获取城市列表请求param*******
    let param = {};
    if (self.data.fromHomePage) {
      param = {
        type:"CRH",
        pageType: 'None',
        bizType: 'None',
        from: '',
        responseHash: '',
        businessId: self.data.rankingId,
      };
    }
    else if(self.data.topRank){
      param = {
        pageType: 'TopRank',
        bizType: 'None',
        businessId: self.data.rankingId,
      }
    }
    else(
          param = {
            pageType: 'None',
            bizType: 'None',
            from: '',
            responseHash: '',
            businessId: self.data.rankingId,
          }
      )

    if (renderIndex) {
      if (!self.data.searchInterHasRender) {
        console.log('第一次加载国外城市数据');
        getInterCityList(param, function (res) {
          console.log('getInterCityList',res);
          let newAlphabet = self.toHandleAlphaList(res);
          res.data.alphaList = newAlphabet;
          self.setData({
            searchHotCityList: res.data.hotCities,
            searchAllCityList: res.data.cityMainList,
            searchAlphabetBarList: res.data.alphaList,
            searchInterData: res.data,
            searchInterHasRender: true
          }, function () {
            self.setData({
              toSearchView: 'Hot',
              searchTitleFixed: '热门城市',
              searchScrollTop: 0
            },function(){
              cwx.hideLoading();
              self.searchScrollEleTop();
            })
          })
        })
      }else{
        console.log('已经加载过国外城市数据');
        self.setData({
          searchHotCityList: self.data.searchInterData.hotCities,
          searchAllCityList: self.data.searchInterData.cityMainList,
          searchAlphabetBarList: self.data.searchInterData.alphaList
        },function(){
          self.setData({
            toSearchView: 'Hot',
            searchTitleFixed: '热门城市',
            searchScrollTop: 0
          },function(){
            cwx.hideLoading();
            self.searchScrollEleTop();
          })
        })
      }
    } else {
      if (!self.data.searchInlandHasRender) {
        console.log('第一次加载国内城市数据');
        getInLandCityList(param,function (res) {
          console.log('getInLandCityList',res);
          // self.toHandleAlphaList(res);
          let newAlphabet = self.toHandleAlphaList(res);
          // let newAlphabet = self.toHandleAlphaList(res);
          res.data.alphaList = newAlphabet;
          self.setData({
            searchHotCityList: res.data.hotCities,
            searchAllCityList: res.data.cityMainList,
            searchAlphabetBarList: res.data.alphaList,
            searchInlandData: res.data,
            searchInlandHasRender: true
          }, function () {
            self.setData({
              toSearchView: 'Hot',
              searchTitleFixed: '热门城市',
              searchScrollTop: 0
            },function(){
              cwx.hideLoading();
              self.searchScrollEleTop();
            })
          })
        })
      }else{
        console.log('已经加载过国内城市数据');
        self.setData({
          searchHotCityList: self.data.searchInlandData.hotCities,
          searchAllCityList: self.data.searchInlandData.cityMainList,
          searchAlphabetBarList: self.data.searchInlandData.alphaList
        },function(){
          self.setData({
            toSearchView: 'Hot',
            searchTitleFixed: '热门城市',
            searchScrollTop: 0
          },function(){
            cwx.hideLoading();
            self.searchScrollEleTop();
          })
        })
      }
    }
  },

  //从请求的数据里面取出字母栏
  toHandleAlphaList: function (citydata) {
    let self = this;
    console.log('logic --- toHandleAlphaList ---',citydata);
    let cityData = citydata.data.cityMainList;
    let newAlphabetList = [];
    let alphaStr = {};
    alphaStr.alpha = 'Hot';
    newAlphabetList.push(alphaStr);
    if(!!cityData){
      (cityData || []).forEach(function (data) {
          let alphaStr = {
            alpha: data.categoryName
          }
          newAlphabetList.push(alphaStr);
        })
    }

    console.log('getAlphabetList',newAlphabetList);
    return newAlphabetList;
  },

  //tab点击事件
  searchTabBarClick: function (e) {
    let self = this,
        index = e.currentTarget.dataset.index,
        tabLen = this.data.searchTabBarList.length,
        searchTab = this.data.searchCurrentTab,
        clickTab = e.currentTarget.dataset.tab;
    console.log({index:index,tabLen:tabLen,searchTab:searchTab,clickTab:clickTab});
    if (searchTab === clickTab) {
      console.log('点击的是同一个page');
    } else {
      console.log('点击的是不同page');
      self.searchScrollFlag = false;
      // self.setData({
      //   searchScrollTop: 80
      // })
      console.log('searchScrollTop',self.data.searchScrollTop);
      for (let i = 0; i < tabLen; i++) {
        if (i === index) {
          let currentIndex = 'searchTabBarList[' + index + '].ac';
          this.setData({
            [currentIndex]: 1
          })
        } else {
          let isAct = 'searchTabBarList[' + i + '].ac';
          this.setData({
            [isAct]: 0
          })
        }
      }
      self.toRequestCityData(index);
      self.setData({
        searchCurrentTab: clickTab
      })
      console.log('点击的tab是',self.data.searchCurrentTab);

      console.log(self.data.toSearchView);
    }


  },

  //搜索框输入文字联想搜索
  searchInputClick: function (e) {
    let self = this;
    let inputVal = e.detail.value;
    if (inputVal) {
      console.log('输入框不为空');
      self.setData({
        searchInputContent: e.detail.value,
        searchAlphabarShow: false
      })
      if(!!setTime){
        clearTimeout(setTime);
        setTime = null;
      }
      setTime = setTimeout(function () {
        self.toRequestSearchResult(inputVal);
      },400)
    } else {
      console.log('输入框为空');
      if(!!setTime){
        clearTimeout(setTime);
        setTime = null;
      }
      self.setData({
        searchResultLocationList: '',
        searchInputValue: '',
        searchAlphabarShow: true
      })
    }
  },
  searchInputTrace: function() {
    let self = this;
    self.ubtTrace('', {
      'pageId': self.pageId,
      'actioncode':'c_search'
    });
  },
  openOrClosed:function(e){
    const index = e.currentTarget.dataset.index;
    const {searchResultLocationList} = this.data;
    const show = searchResultLocationList[index].showRows;
    searchResultLocationList[index].showRows = !show;
    this.setData({
      searchResultLocationList
    })
  },
  toRequestSearchResult: function (keyword) {
    let self = this;
    let param;
    if (self.data.fromHomePage) {
      param = {
        "keyword": keyword,
        "type":"CRH"
      };
    }else{
      param = {
        "keyword": keyword,
        // "type":"SMART"
      };
    }
    // 与APP同步接口
    let _param = {
      'data':JSON.stringify({
        "keyword": keyword,
      }),
      'serviceName': "DestinationCoreService.suggestDistrict"
    }
    cwx.request({
      url: '/restapi/soa2/17916/json/invokeOnDemand',
      data: _param,
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          let result;
          if (res.data.responseStatus) {
            result = res.data.responseStatus.ack;
          } else if (res.data.ResponseStatus) {
            result = res.data.ResponseStatus.Ack;
          }
          if (result === "Success") {
            let getData = JSON.parse(res.data && res.data.data || {});
            console.log('logic ---getDistrictPageGetData---',getData);
            const tmp_locations = [];
            (getData && getData.searchGroupList || []).forEach((result_item)=>{
              let locations_item = {
                cityId : result_item.parentLocation.districtId,
                cityName : result_item.parentLocation.unionName,
                districtId : result_item.parentLocation.districtId,
                districtName : result_item.parentLocation.unionName,
                eCityName : result_item.parentLocation.eunionName,
                parentName : "",
                type : result_item.parentLocation.geocategoryId,
                typeName : result_item.parentLocation.geocategoryName,
                h5url : result_item.parentLocation.h5Url,
                url : result_item.parentLocation.url,
                showRows : false,
                subLocations : result_item.subLocations
              };
              // 正则匹配
              if(param.keyword) {
                let word = result_item.parentLocation.unionName || "";
                let test = param.keyword
                let reg = new RegExp(`^${test}|${test}$`,"g")
                let otherList = word.split(test)
                let wordsList = []
                if(reg.test(word)){
                  if(word === test){
                    otherList.pop()
                  }
                  if(!!otherList){
                    (otherList || []).forEach((item,index)=>{
                      if(item.length === 0){
                        otherList.splice(index,1,test)
                      }
                    })
                  }

                  wordsList = otherList
                }else{
                  if(!!otherList) {
                    (otherList || []).forEach((item) => {
                      wordsList.push(item)
                      wordsList.push(test)
                    })
                  }
                  wordsList.pop()
                }
                locations_item['highlight'] = wordsList
              }
              if(param.keyword) {
                let word = result_item.parentLocation.eunionName || "";
                let test = param.keyword
                let reg = new RegExp(`^${test}|${test}$`,"g")
                let otherList = word.split(test)
                let wordsList = []
                if(reg.test(word)){
                  if(word === test){
                    otherList.pop()
                  }
                  if(!!otherList) {
                    (otherList || []).forEach((item, index) => {
                      if (item.length === 0) {
                        otherList.splice(index, 1, test)
                      }
                    })
                  }
                  wordsList = otherList
                }else{
                  if(!!otherList) {
                    (otherList || []).forEach((item) => {
                      wordsList.push(item)
                      wordsList.push(test)
                    })
                  }
                  wordsList.pop()
                }
                locations_item['ehighlight'] = wordsList
              }
              tmp_locations.push(locations_item)

            })
            console.log("tmp_locations",tmp_locations)
            if(!!tmp_locations){
              (tmp_locations || []).forEach(val=>{
                val['keyword'] = keyword
              })
            }
            self.setData({
              searchResultLocationList: tmp_locations
            })
          }
        }
      },
      fail: (res) => {
        console.log(res)
      }
    });
    /*getLocationList(param, function (res) {
      console.log('searchdata',res);
      if (res.statusCode === 200) {
        res.data.locations.forEach(val=>{
          val['keyword'] = keyword
        })
        self.setData({
          searchResultLocationList: res.data.locations,
        })
      }
    })*/
  },
  //搜索确定事件
  searchConfirm: function () {
    console.log('searchConfirmBtn');
  },
  //搜索取消事件
  searchCancel: function () {
    let self = this;
    console.log('clickcancelgetinputvalue', self.data.searchInputContent);
    if (self.data.searchInputContent) {
      self.setData({
        searchResultLocationList: '',
        searchInputValue: '',
        searchInputContent: '',
        searchAlphabarShow: true
      })
      cwx.setNavigationBarTitle({
        title: '城市列表'
      })
      console.log('getinputvalue', self.data.searchInputContent);
    } else {
      cwx.navigateBack();
      console.log('点击取消返回上一页');
    }
  },
  //字母点击事件定位城市列表
  searchAlphabetClick: function (e) {
    let self = this;
    let alphaList = self.data.searchAlphabetBarList;
    let alphaLen = alphaList.length;
    let currentTab = e.currentTarget.dataset.alpha.alpha;
    self.setData({
      toSearchView: currentTab
    })
    console.log('AlphabetTouch',e);
    // console.log('currentCityList', cityListToTop);
    let currentCity = cityListToTop;
    for (let i = 0; i < currentCity.length; i++) {
      if (currentTab === currentCity[i].cityID) {
        if (currentTab === 'Hot') {
          self.setData({
            searchTitleFixed: '热门城市',
          })
        } else {
          self.setData({
            searchTitleFixed: currentTab
          })
        }
        self.setData({
          searchShowBigAlpha: true
        })
        setTimeout(function () {
          self.setData({
            searchShowBigAlpha: false
          })
        }, 1000)
      } else {

      }
    }
  },
  searchScrollFun: function (e) {
    let self = this;
    // console.log('e',e.detail.scrollTop);
    // for (let i = 0; i < cityListToTop.length; i++) {
    //   console.log('lastAlbetTop',cityListToTop[cityListToTop.length-1].cityTop)
    //   if (e.detail.scrollTop < cityListToTop[i].cityTop - 94 && i !== 0 && e.detail.scrollTop > cityListToTop[i - 1].cityTop - 94) {
    //     console.log({ e: e.detail.scrollTop, cityListToTop1: cityListToTop[i].cityTop, cityListToTop0: cityListToTop[i - 1].cityTop });
    //     let nextTit = cityListToTop[i - 1].cityID;
    //     if (nextTit === 'Hot') {
    //       nextTit = '热门城市'
    //     }
    //     if (self.data.searchTitleFixed === nextTit) {

    //     } else {
    //       if (i === 1) {
    //         self.setData({
    //           searchTitleFixed: '热门城市',
    //         })
    //       } else {
    //         self.setData({
    //           searchTitleFixed: cityListToTop[i - 1].cityID
    //         })
    //       }
    //       console.log('searchTitleFixed',self.data.searchTitleFixed);
    //     }
    //     console.log('currentCityIndex',i);
    //   } else if (i == (cityListToTop.length - 1) && e.detail.scrollTop > cityListToTop[cityListToTop.length - 1].cityTop - 94) {
    //     console.log('cityListToTop[cityListToTop.length - 1].cityID',cityListToTop[cityListToTop.length - 1].cityID);
    //     self.setData({
    //       searchTitleFixed: cityListToTop[cityListToTop.length - 1].cityID
    //     })
    //     console.log('searchTitleFixed',self.data.searchTitleFixed);
    //   } else {

    //   }
    // }
  },
  searchScrollEleTop: function () {
    let self = this;
    let scrollEleArr = self.data.searchAlphabetBarList;
    cityListToTop = [];
    alphaListToTop = [];
    cwx.createSelectorQuery().selectAll('.searchcity-item').boundingClientRect(function (rects) {
      if(!!rects){
        (rects || []).forEach(function (rect) {
          // console.log('rect',rect);
          let citylistStr = {
            cityID: rect.id,
            cityTop: rect.top
          }
          cityListToTop.push(citylistStr);
          // console.log('getcityListTop',cityListToTop);
        })
      }
    }).exec();
    cwx.createSelectorQuery().selectAll('.searchalphabetbar-item').boundingClientRect(function (rects) {
      if(!!rects) {
        (rects || []).forEach(function (rect) {
          // console.log('rect',rect);
          let alphalistStr = {
            alphaID: rect.id,
            alphaTop: rect.top
          }
          alphaListToTop.push(alphalistStr);
          // console.log('getalphaListToTop',alphaListToTop);
        })
      }
    }).exec();
  },

  // 城市标签跳转
  searchCityJump: function (e) {
    let self = this;
    let viewCityID = e.currentTarget.dataset.citydata.cityID;
    let viewCityName = e.currentTarget.dataset.citydata.cityName;
    console.log('cityItemInfo',e.currentTarget.dataset.citydata);

    self.ubtTrace('', {
      'pageId': self.pageId,
      'actioncode':'c_click_destination'
    });
    if(!!self.data.fromPage){
      cwx.setStorageSync('SEARCHCITYCITYID_DESTINATIONPAGE',viewCityID);
      cwx.navigateBack();
      return;
    }
    let url;
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2]; //上一个页面
    let changeData;
    if (self.data.isCrhPage) {
      changeData = {
        isCrhPage: 1,
        viewDistrictId: viewCityID,
        fromDistrictId: self.data.fromCityID,
        fromSearch: true
      };
      console.log('changeData',changeData);
    }else if(self.data.fromHomePage){
      changeData = {
        fromCityId: viewCityID,
        fromSearch: true,
        fromCity: viewCityName
      }
    }else if(self.data.topRank){
      changeData = {
        districtId: viewCityID
      }
    }else{
      changeData = {
        viewDistrictId: viewCityID,
        fromSearch: true
      };
    }
    if(pages.length > 1){
        if (!self.data.fromHomePage) {
            prevPage.toTraceSelectCity &&
            prevPage.toTraceSelectCity(viewCityID);
        }
        prevPage.setData && prevPage.setData(changeData);
        cwx.navigateBack({
          delta: 1
        });
      }

  },

  // 搜索标签跳转
  searchResultJump: function (e) {
    let self = this;
    let viewCityID = e.currentTarget.dataset.districtid;
    let viewCityName = e.currentTarget.dataset.cityname;
    console.log('cityItemInfo',viewCityName,viewCityID);

    self.ubtTrace('', {
      'pageId': self.pageId,
      'actioncode':'c_click_destination'
    });
    if(!!self.data.fromPage){
      cwx.setStorageSync('SEARCHCITYCITYID_DESTINATIONPAGE',viewCityID);
      cwx.navigateBack();
      return;
    }
    let url;
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2]; //上一个页面
    let changeData;

    if (self.data.isCrhPage) {
      changeData = {
        isCrhPage: 1,
        viewDistrictId: viewCityID,
        fromDistrictId: self.data.fromCityID,
        fromSearch: true
      };
    }else if(self.data.fromHomePage){
      changeData = {
        fromCityId: viewCityID,
        fromSearch: true,
        fromCity: viewCityName
      }
    }else if(self.data.topRank){
      changeData = {
        districtId: viewCityID
      }
    }else{
      changeData = {
        viewDistrictId: viewCityID,
        fromSearch: true
      };
    }
    if(pages.length > 1){
      if (!self.data.fromHomePage) {
        prevPage.toTraceSelectCity &&  prevPage.toTraceSelectCity(viewCityID);
      }
      prevPage.setData && prevPage.setData(changeData)
      cwx.navigateBack({
        delta: 1
      });
    }
  }
});

