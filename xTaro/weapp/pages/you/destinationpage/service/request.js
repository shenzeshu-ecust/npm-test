import { cwx, CPage, __global } from '../../../../cwx/cwx.js';

//请求城市列表
function getCityList(param,fn){
  if (!__global.mock) {
    cwx.request({
      url: '/restapi/soa2/15455/json/getCityList',
      data: {
        'pageType': param.pageType,
        'responseHash': '',
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      }
    });
  }
}
//搜索城市
function suggestCity(param,fn){
  if (!__global.mock) {
    cwx.request({
      url: '/restapi/soa2/15455/json/suggestCity',
      data: {
        'pageType': param.pageType,
        'keyword': param.keyword,
        'lat':param.lat,
        'lon':param.lon,
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      }
    });
  }
}

// 新API数据装配
// 参数inland_oversea：1为国内，0为国外
function cityListAssemble(param,fn,inland_oversea) {
  cwx.request({
    url: '/restapi/soa2/13342/json/getStaticDistrictCategoryList',
    data:param,
    success: (res) => {
      console.log('getStaticDistrictCategoryList请求参数：',param)
      console.log('getStaticDistrictCategoryList返回值：',res)
      let tmp_res = {}
      let tmp_data = {}
      if(inland_oversea){
        var districtCategory = res.data.districtCategoryInChina
        var hotDistrict = res.data.hotDistrictInChina
      }
      else{
        var districtCategory = res.data.districtCategoryOverSea
        var hotDistrict = res.data.hotDistrictOverSea
      }

      // alphaList
      let alphaList = [{alpha:'Hot'}]
      districtCategory.forEach((val)=>{
        let tmp_obj = {}
        tmp_obj['alpha'] = val.categoryName
        alphaList.push(tmp_obj)
      })
      tmp_data['alphaList'] = alphaList

      // cityMainList
      let tmp_cityMainList = []
      districtCategory.forEach((val)=>{
        let cityMainList_item = {}
        cityMainList_item['categoryName'] = val.categoryName
        let tmp_categoryList = []
        val.indexes.forEach((v)=>{
          let ategoryList_item = {}
          ategoryList_item['cityID'] = v.districtId
          ategoryList_item['cityName'] = v.districtName
          ategoryList_item['isHot'] = v.isHot
          ategoryList_item['isOverSea'] = v.isOverSea
          ategoryList_item['parentName'] = v.parentName
          ategoryList_item['url'] = v.url
          ategoryList_item['h5Url'] = v.h5Url
          ategoryList_item['cityEname'] = v.districtEname
          tmp_categoryList.push(ategoryList_item)
        })
        cityMainList_item['categoryList'] = tmp_categoryList
        tmp_cityMainList.push(cityMainList_item)
      })
      tmp_data['cityMainList'] = tmp_cityMainList

      // hotCities
      let tmp_hotCities = []
      hotDistrict.forEach((val)=>{
        let hotCities_item = {}
        hotCities_item['cityEname'] = ''
        hotCities_item['cityID'] = val.districtId
        hotCities_item['cityName'] = val.districtName
        hotCities_item['h5Url'] = val.h5Url
        hotCities_item['isCurrent'] = val.isCurrent
        hotCities_item['isOverSea'] = val.isOverSea
        hotCities_item['marketTag'] = val.marketTag
        hotCities_item['url'] = val.url
        tmp_hotCities.push(hotCities_item)
      })
      tmp_data['hotCities'] = tmp_hotCities

      // data
      tmp_res['data'] = tmp_data
      fn(tmp_res)
    },
    fail: (res) => {
      fn(res)
    }
  });
}

//请求国内城市列表
function getInLandCityList(param,fn) {
  if (!__global.mock) {
    cityListAssemble(param,fn,1)
    // cwx.request({
    //   url: '/restapi/soa2/14546/json/getInLandCityList',
    //   data: param,
    //   success: (res) => {
    //     fn(res);
    //   },
    //   fail: (res) => {
    //     fn(res);
    //   }
    // });
  } else {
    var res = Mock.mock({
      data: {
        hotCities: [
          {
            cityName: '上海',
            url: '/pages/home/homepage'
          },
          {
            cityName: '上海迪士尼旅游度假区',
            url: '/pages/home/homepage'
          },
          {
            cityName: '北京',
            url: '/pages/home/homepage'
          },
          {
            cityName: '北京',
            url: '/pages/home/homepage'
          },
          {
            cityName: '北京',
            url: '/pages/home/homepage'
          },
          {
            cityName: '北京',
            url: '/pages/home/homepage'
          },
          {
            cityName: '北京',
            url: '/pages/home/homepage'
          },
          {
            cityName: '北京',
            url: '/pages/home/homepage'
          }
        ],
        cityMainList: [
          {
            alpha: 'A',
            cityList: [
              {
                cityName: '阿坝',
                cityProvince: '四川',
                cityOtherName: 'sichuan'
              },
              {
                cityName: '阿尔山',
                cityProvince: '兴安盟',
                cityOtherName: 'sichuan'
              },
              {
                cityName: '阿拉善盟',
                cityProvince: '内蒙古',
                cityOtherName: 'sichuan'
              },
              {
                cityName: '阿勒泰',
                cityProvince: '新疆',
                cityOtherName: 'sichuan'
              },
              {
                cityName: '阿里',
                cityProvince: '西藏',
                cityOtherName: 'sichuan'
              }
            ]
          },
          {
            alpha: 'B',
            cityList: [
              {
                cityName: '阿坝',
                cityProvince: '四川',
                cityOtherName: 'sichuan'
              },
              {
                cityName: '阿尔山',
                cityProvince: '兴安盟',
                cityOtherName: 'sichuan'
              },
              {
                cityName: '阿拉善盟',
                cityProvince: '内蒙古',
                cityOtherName: 'sichuan'
              },
              {
                cityName: '阿勒泰',
                cityProvince: '新疆',
                cityOtherName: 'sichuan'
              },
              {
                cityName: '阿里',
                cityProvince: '西藏',
                cityOtherName: 'sichuan'
              },
              {
                cityName: '阿里',
                cityProvince: '西藏',
                cityOtherName: 'sichuan'
              },
              {
                cityName: '阿里',
                cityProvince: '西藏',
                cityOtherName: 'sichuan'
              }
            ]
          }
        ]
      },
    })
    fn(res);
  }
}

//请求海外城市列表
function getInterCityList(param,fn) {
  if (!__global.mock) {
    cityListAssemble(param,fn,0)
    // cwx.request({
    //   url: '/restapi/soa2/14546/json/getInterCityList',
    //   data: {},
    //   success: (res) => {
    //     fn(res);
    //   },
    //   fail: (res) => {
    //     fn(res);
    //   }
    // });
  } else {
    var res = Mock.mock({
      data: {
        hotCities: [
          {
            cityName: '上海',
            url: '/pages/home/homepage'
          },
          {
            cityName: '上海迪士尼旅游度假区',
            url: '/pages/home/homepage'
          },
          {
            cityName: '北京',
            url: '/pages/home/homepage'
          },
          {
            cityName: '北京',
            url: '/pages/home/homepage'
          },
          {
            cityName: '北京',
            url: '/pages/home/homepage'
          },
          {
            cityName: '北京',
            url: '/pages/home/homepage'
          },
          {
            cityName: '北京',
            url: '/pages/home/homepage'
          },
          {
            cityName: '北京',
            url: '/pages/home/homepage'
          }
        ],
        cityMainList: [
          {
            alpha: 'A',
            cityList: [
              {
                cityName: '阿坝',
                cityProvince: '四川',
                cityOtherName: 'sichuan'
              },
              {
                cityName: '阿尔山',
                cityProvince: '兴安盟',
                cityOtherName: 'sichuan'
              },
              {
                cityName: '阿拉善盟',
                cityProvince: '内蒙古',
                cityOtherName: 'sichuan'
              },
              {
                cityName: '阿勒泰',
                cityProvince: '新疆',
                cityOtherName: 'sichuan'
              },
              {
                cityName: '阿里',
                cityProvince: '西藏',
                cityOtherName: 'sichuan'
              }
            ]
          },
          {
            alpha: 'B',
            cityList: [
              {
                cityName: '阿坝',
                cityProvince: '四川',
                cityOtherName: 'sichuan'
              },
              {
                cityName: '阿尔山',
                cityProvince: '兴安盟',
                cityOtherName: 'sichuan'
              },
              {
                cityName: '阿拉善盟',
                cityProvince: '内蒙古',
                cityOtherName: 'sichuan'
              },
              {
                cityName: '阿勒泰',
                cityProvince: '新疆',
                cityOtherName: 'sichuan'
              },
              {
                cityName: '阿里',
                cityProvince: '西藏',
                cityOtherName: 'sichuan'
              },
              {
                cityName: '阿里',
                cityProvince: '西藏',
                cityOtherName: 'sichuan'
              },
              {
                cityName: '阿里',
                cityProvince: '西藏',
                cityOtherName: 'sichuan'
              }
            ]
          }
        ]
      },
    })
    fn(res);
  }
}

// 搜索城市列表 新API数据装配
function getAppSearchDistricts(param,fn) {
  cwx.request({
    url: '/restapi/soa2/13342/json/getAppSearchDistricts',
    data: param,
    success: (res) => {
      console.log('原始数据！！',res)
      let searchdata = {}
      let tmp_data = {}
      let tmp_locations = []
      if(typeof res.data.result != 'undefined'){
        res.data.result.forEach((result_item)=>{
          let locations_item = {}
          locations_item['cityId'] = result_item.districtId
          locations_item['cityName'] = result_item.districtName
          locations_item['districtId'] = result_item.districtId
          locations_item['districtName'] = result_item.districtName
          locations_item['parentName'] = result_item.parentDistrictName
          locations_item['type'] = result_item.districtType
          locations_item['h5url'] = result_item.h5url
          locations_item['url'] = result_item.url
          // 正则匹配
          if(param.keyword) {
            let word = result_item.districtName
            let test = param.keyword
            let reg = new RegExp(`^${test}|${test}$`,"g")
            let otherList = word.split(test)
            let wordsList = []
            if(reg.test(word)){
              if(word === test){
                otherList.pop()
              }
              otherList.forEach((item,index)=>{
                if(item.length === 0){
                  otherList.splice(index,1,test)
                }
              })
              wordsList = otherList
            }else{
              otherList.forEach((item)=>{
                wordsList.push(item)
                wordsList.push(test)
              })
              wordsList.pop()
            }
            locations_item['highlight'] = wordsList
          }
          tmp_locations.push(locations_item)

        })
      }
      tmp_data['locations'] = tmp_locations
      searchdata['data'] = tmp_data
      searchdata['statusCode'] = res.statusCode
      fn(searchdata)
    },
    fail: (res) => {
      console.log(res)
    }
  });
}


//搜索城市列表
function getLocationList(param, fn) {
  if (!__global.mock) {
    getAppSearchDistricts(param,fn)
    // cwx.request({
    //   url: '/restapi/soa2/14546/json/getLocationList',
    //   data: param,
    //   success: (res) => {
    //     fn(res);
    //   },
    //   fail: (res) => {
    //     fn(res);
    //   }
    // });
  } else {
    var res = Mock.mock({
      data: {

      },
    })
    fn(res);
  }
}

//获取 目的地页面数据
function getDistrictPageData(param, fn) {
  if (!__global.mock) {
    cwx.request({
      url: '/restapi/soa2/15455/json/getDistrictPage',
      data: param,
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      }
    });
  } else {
    var res = Mock.mock({
      data: {

      },
    })
    fn(res);
  }
}

// 新榜单详情信息
function getRankingModule(params,fn) {
  cwx.request({
    url: '/restapi/soa2/13342/json/getRankingModule',
    data: params,
    success: (res) => {
      fn(res);
    },
    fail: (res) => {
      fn(res);
    }
  });
}

// 同步APP榜单详情信息
function getRankingModuleDetail(params,fn) {
  cwx.request({
    url: '/restapi/soa2/17916/json/invokeOnDemand',
    data: params,
    success: (res) => {
      fn(res);
    },
    fail: (res) => {
      fn(res);
    }
  });
}

//获取 新目的地页面数据
function getDistrictAndPoiPage(param, fn) {
  if (!__global.mock) {
    cwx.request({
      url: '/restapi/soa2/15455/json/getDistrictAndPoiPage',
      data: param,
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      }
    });
  } else {
    var res = Mock.mock({
      data: {

      },
    })
    fn(res);
  }
}

//瀑布流数据接口
function getPickedProducts(param,fn){
  if (!__global.mock) {
    cwx.request({
      url: '/restapi/soa2/15453/json/getPickedProducts',
      data: {
        'fromCityId': 2,
        'channel': '2',
        'flag':'',
        "pageSize": 4
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      }
    })
  }
}

//详情页调用，相关笔记 瀑布流  ---------- for test
function relatedRecommend(param, fn) {
  cwx.request({
      url: '/restapi/soa2/16189/json/searchTripShootListForHomePageV2',
      data: {
        'districtId': param.districtId,
        'groupChannelCode':param.groupChannelCode,
        'imageCutType':1,
        'locatedDistrictId':param.locatedDistrictId,
        'lat':param.lat,
        'lon':param.lon,
        'type':param.type,
        'includeCardTypes':[1],
        'pagePara':{
          pageIndex:param.pagePara.pageIndex,
          pageSize:param.pagePara.pageSize,
          sortDirection:param.pagePara.sortDirection,
          sortType:param.pagePara.sortType
        }
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      }
    })
}


//地图接口
function searchPointsByCoor(param,fn){
  if (!__global.mock) {
    console.log("searchPointsByCoor",param);
    cwx.request({
      url: '/restapi/soa2/15453/json/searchPointsByCoor',
      data: {
        'districtId': param.districtId,
        'mapShowLevel': param.mapShowLevel,
        'leftTop': param.leftTop,
        'rightBottom': param.rightBottom,
        'previousLeftTop': param.previousLeftTop,
        'previousRightBottom': param.previousRightBottom,
        'mapType': 2,
        'dpi':param.dpi,
        'platform': param.platform,
        'mapWidth': param.mapWidth,
        'mapHeight': param.mapHeight
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      }
    })
  }
}

//地图首次请求接口

function getMapInitData(param,fn){
  if (!__global.mock) {
    cwx.request({
      url: '/restapi/soa2/15453/json/getMapInitData',
      data: {
        'userLocation': param.userLocation,
        'districtId': param.districtId
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      }
    })
  }
}

//请求地图的线
function getLineConfig(fn){
  if (!__global.mock) {
    cwx.request({
      url: '/restapi/soa2/15453/json/getLineConfig',
      data: {},
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      }
    })
  }
}

//宝箱助力信息获取接口
function shareActivity(param, fn) {
    console.log("shareActivity request:",JSON.stringify(param));
    if (!__global.mock) {
        cwx.request({
            url: '/restapi/soa2/16522/json/shareActivity',
            data: param,
            success: (res) => {
                console.log("shareActivity response:",JSON.stringify(res));
                fn(res);
            },
            fail: (res) => {
                console.log("shareActivity err:",JSON.stringify(res));
                fn(res);
            }
        });
    } else {
        var res = Mock.mock({
            data: {

            },
        })
        fn(res);
    }
}

//宝箱助力接口
function voteActivity(param, fn) {
    console.log("voteActivity request:",JSON.stringify(param));
    if (!__global.mock) {
        cwx.request({
            url: '/restapi/soa2/16522/json/voteActivity',
            data: param,
            success: (res) => {
                console.log("voteActivity response:",JSON.stringify(res));
                fn(res);
            },
            fail: (res) => {
                console.log("voteActivity err:",JSON.stringify(res));
                fn(res);
            }
        });
    } else {
        var res = Mock.mock({
            data: {

            },
        })
        fn(res);
    }
}


module.exports = {
  getCityList: getCityList,
  suggestCity: suggestCity,
  getInLandCityList: getInLandCityList,
  getInterCityList: getInterCityList,
  getLocationList: getLocationList,
  getDistrictPageData: getDistrictPageData,
  getRankingModule:getRankingModule,
  getRankingModuleDetail:getRankingModuleDetail,
  getPickedProducts: getPickedProducts,
  searchPointsByCoor: searchPointsByCoor,
  getMapInitData: getMapInitData,
  getLineConfig: getLineConfig,
  getDistrictAndPoiPage:getDistrictAndPoiPage,
  voteActivity:voteActivity,
  shareActivity:shareActivity,
  cityListAssemble:cityListAssemble,
  relatedRecommend: relatedRecommend
  // getAppSearchDistricts:getAppSearchDistricts
}
