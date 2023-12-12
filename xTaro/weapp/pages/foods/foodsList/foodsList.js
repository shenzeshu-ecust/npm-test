import { cwx, CPage } from "../../../cwx/cwx.js";
import { base64Encode } from '../utils/common.js'

CPage({
  pageId: 10650016805,
  data: {
    key: 100091,
    filterName: [],
    isScroll: true,
    scrollIntoView: '',
    nomore: false,
    listLoading: false,
    PageIndex: 1,
    PageSize: 10,
    Lat: 0,
    Lon: 0,
    nodata: false,
    nodata2: false,
    districtId: 2,
    isNearLandmark: false, //是否显示距地标
    topShow: false,

    CurrentDestId: 0,
    DistanceFilter: 0,
    FoodFilters: [],
    IsBusinessOpen: false,
    IsMeiShiLin: true,
    IsOnlyList: false,
    OrderType: 0,
    Platform: 2,
    SceneFilter: [],
    SellFilter: [],
    SubVersion: 1,

    PositionLat: 0,
    PositionLon: 0,
    ZoneId: 0,
    RegionId: 0,
    MetroId: 0,
    CuisineFilter: [],
    MeiShiLinTypes: [],
    PriceFilter: [],
    showOpenApp: false,
    appUrl: '',
    isNewStyle: true,
  },
  onLoad: function (options) {
    cwx.showLoading({
      title: '加载中...'
    })
    if (options.sellFilter) {
      this.setData({
        sellFilter: options.sellFilter
      })
    }
    this.districtId = options.districtId;
    this.orderType = options.orderType && options.orderType > 0 ? options.orderType : 0;
    this.sceneFilter = options.sceneFilter ? options.sceneFilter : [];
    this.sceneName = options.sceneName ? options.sceneName : '';
    this.SellFilter = options.sellFilter ? options.sellFilter : [];
    this.lat = parseInt(options.lat) || 0;
    this.lon = parseInt(options.lon) || 0;
    this.pageLoading = false;
    this.setData({
      districtId: parseInt(this.districtId),
      SceneFilter: this.sceneFilter && this.sceneFilter.length > 0 ? [parseInt(this.sceneFilter)] : [],
      SellFilter: this.SellFilter && this.SellFilter.length > 0 ? [parseInt(this.SellFilter)] : []
    })
    this._getSystemInfo();
    this._getLocation().then((res) => {
      let filterName = [{ name: '位置', current: 0 }, { name: '菜系', current: 0 }, { name: '筛选', current: 0 }, { name: '附近智能', current: 0 }];
      this.setData({
        Lat: res.lat,
        Lon: res.lon,
        _OrderType: parseInt(this.orderType),
        filterName: filterName
      }, () => {
        let { Lat, Lon } = this.data,
          params = {
            LatLng: {
              Lng: Lon,
              Lat: Lat
            },
            NeedInheritedDistricts: true,
          };
        this._getGsLocationInfo(params).then((res2) => {
          console.log(res2)
          let DistrictId = res2 && res2.inheritedResult[0] && res2.inheritedResult[0].districtId ? res2.inheritedResult[0].districtId : 2;
          this.setData({
            CurrentDestId: DistrictId
          }, () => {
            this._getFirstPageDatas();
          })
        }, (error) => {
          console.log('getGsLocationInfo接口失败', error)
        });
      })
    }, (error) => {
      let filterName = [{ name: '位置', current: 0 }, { name: '菜系', current: 0 }, { name: '筛选', current: 0 }, { name: '综合排序', current: 0 }];
      this.setData({
        Lat: parseInt(this.lat),
        Lon: parseInt(this.lon),
        filterName: filterName,
      }, () => {
        this._getFirstPageDatas();
      })
    })
    if (this.sceneName) {
      cwx.setNavigationBarTitle({
        title: this.sceneName,
      })
    }

    // iphoneX 适配
    this.systemInfo = cwx.util.systemInfo;
    if ('model' in this.systemInfo) {
      let { model } = this.systemInfo;
      this.setData({
        isIphoneX: model.search('iPhone X') != -1 ? true : false
      })
    }

  },
  onReady: function () {

  },
  onShow: function () {
    let scene = cwx.scene
    if (scene === 1036 || scene === 1069) {
      this.setData({
        showOpenApp: true
      })
    } else {
      this.setData({
        showOpenApp: false
      })
    }
  },
  _initAppUrl() {
    let { districtId, CuisineFilter, RegionId, SceneFilter, SellFilter, MeiShiLinTypes, OrderType } = this.data
    let url = base64Encode(`/food/index.html#foods/${districtId}.html?isHideNavBar=YES&ishideheader=true&anchor=all&CuisineFilter=${CuisineFilter}&RegionId=${RegionId}&SceneFilter=${SceneFilter}&SellFilter=${SellFilter}&MeiShiLinTypes=${MeiShiLinTypes}&OrderType=${OrderType}`)
    this.setData({
      appUrl: `ctrip://wireless/h5?type=5&url=${url}`
    }, () => {
      console.log(this.data.appUrl)
    })
  },
  onHide: function () {

  },
  // onShareAppMessage: function () {

  // },
  _getFilterData(e) {
    let { PositionLat, PositionLon, ZoneId, RegionId, MetroId, CuisineFilter, MeiShiLinTypes, PriceFilter, SellFilter, OrderType } = this.data;
    if (e.detail) {
      if ('PositionLat' in e.detail && 'PositionLon' in e.detail) {
        let { PositionLat, PositionLon } = e.detail,
          addParams = Object.assign({}, { PositionLat: PositionLat, PositionLon: PositionLon }, { ZoneId: 0 }, { RegionId: 0 }, { MetroId: 0 }, { CuisineFilter: CuisineFilter }, { MeiShiLinTypes: MeiShiLinTypes }, { PriceFilter: PriceFilter }, { OrderType: OrderType }, { SellFilter: SellFilter });
        if (PositionLat !== 0 || PositionLon !== 0) {
          this.setData({
            PositionLat: PositionLat,
            PositionLon: PositionLon,
            ZoneId: 0,
            RegionId: 0,
            MetroId: 0,
            isNearLandmark: true
          })
        } else {
          this.setData({
            PositionLat: PositionLat,
            PositionLon: PositionLon,
            isNearLandmark: false
          })
        }
        this._filter(addParams);
      }

      if ('ZoneId' in e.detail) {
        let { ZoneId } = e.detail,
          addParams = Object.assign({}, { PositionLat: 0 }, { PositionLon: 0 }, { ZoneId: parseInt(ZoneId) }, { RegionId: 0 }, { MetroId: 0 }, { CuisineFilter: CuisineFilter }, { MeiShiLinTypes: MeiShiLinTypes }, { PriceFilter: PriceFilter }, { OrderType: OrderType }, { SellFilter: SellFilter });
        if (ZoneId !== 0) {
          this.setData({
            PositionLat: 0,
            PositionLon: 0,
            ZoneId: ZoneId,
            RegionId: 0,
            MetroId: 0,
            isNearLandmark: false
          })
        } else {
          this.setData({
            ZoneId: ZoneId,
            isNearLandmark: false
          })
        }
        this._filter(addParams);
      }

      if ('RegionId' in e.detail) {
        let { RegionId } = e.detail,
          addParams = Object.assign({}, { PositionLat: 0 }, { PositionLon: 0 }, { ZoneId: 0 }, { RegionId: parseInt(RegionId) }, { MetroId: 0 }, { CuisineFilter: CuisineFilter }, { MeiShiLinTypes: MeiShiLinTypes }, { PriceFilter: PriceFilter }, { OrderType: OrderType }, { SellFilter: SellFilter });
        if (RegionId !== 0) {
          this.setData({
            PositionLat: 0,
            PositionLon: 0,
            ZoneId: 0,
            RegionId: RegionId,
            MetroId: 0,
            isNearLandmark: false
          })
        } else {
          this.setData({
            RegionId: RegionId,
            isNearLandmark: false
          })
        }
        this._filter(addParams);
      }

      if ('MetroId' in e.detail) {
        let { MetroId } = e.detail,
          addParams = Object.assign({}, { PositionLat: 0 }, { PositionLon: 0 }, { ZoneId: 0 }, { RegionId: 0 }, { MetroId: parseInt(MetroId) }, { CuisineFilter: CuisineFilter }, { MeiShiLinTypes: MeiShiLinTypes }, { PriceFilter: PriceFilter }, { OrderType: OrderType }, { SellFilter: SellFilter });
        if (MetroId !== 0) {
          this.setData({
            PositionLat: 0,
            PositionLon: 0,
            ZoneId: 0,
            RegionId: 0,
            MetroId: MetroId,
            isNearLandmark: true
          })
        } else {
          this.setData({
            MetroId: MetroId,
            isNearLandmark: false
          })
        }
        this._filter(addParams);
      }

      if ('CuisineFilter' in e.detail) {
        let { CuisineFilter } = e.detail,
          addParams = Object.assign({}, { PositionLat: PositionLat }, { PositionLon: PositionLon }, { ZoneId: ZoneId }, { RegionId: RegionId }, { MetroId: MetroId }, { CuisineFilter: CuisineFilter }, { MeiShiLinTypes: MeiShiLinTypes }, { PriceFilter: PriceFilter }, { OrderType: OrderType }, { SellFilter: SellFilter });
        this.setData({
          CuisineFilter: CuisineFilter,
        })
        this._filter(addParams);
      }

      if ('MeiShiLinTypes' in e.detail && 'PriceFilter' in e.detail && 'SellFilter' in e.detail) {
        let { MeiShiLinTypes, PriceFilter, SellFilter } = e.detail,
          addParams = Object.assign({}, { PositionLat: PositionLat }, { PositionLon: PositionLon }, { ZoneId: ZoneId }, { RegionId: RegionId }, { MetroId: MetroId }, { CuisineFilter: CuisineFilter }, { MeiShiLinTypes: MeiShiLinTypes }, { PriceFilter: PriceFilter }, { OrderType: OrderType }, { SellFilter: SellFilter });
        this.setData({
          MeiShiLinTypes: MeiShiLinTypes,
          PriceFilter: PriceFilter,
          SellFilter: SellFilter
        })
        this._filter(addParams);
      }

      if ('OrderType' in e.detail) {
        let { OrderType } = e.detail,
          addParams = Object.assign({}, { PositionLat: PositionLat }, { PositionLon: PositionLon }, { ZoneId: ZoneId }, { RegionId: RegionId }, { MetroId: MetroId }, { CuisineFilter: CuisineFilter }, { MeiShiLinTypes: MeiShiLinTypes }, { PriceFilter: PriceFilter }, { OrderType: OrderType }, { SellFilter: SellFilter });
        this.setData({
          OrderType: OrderType,
        })
        this._filter(addParams);
      }
      if ('isOpenFilter' in e.detail) {
        let { isOpenFilter } = e.detail,
          isScroll = isOpenFilter ? false : true;
        this.setData({
          isScroll: isScroll
        })
      }

    }

  },
  _getSystemInfo() {
    cwx.getSystemInfo({
      success: (res) => {
        let Platform = res.platform === 'ios' ? 1 : 2;
        this.setData({
          Platform: Platform
        })
      },
      fail: (error) => { console.log('获取设备信息失败') }
    })
  },
  _getLocation() {
    return new Promise((resolve, reject) => {
      cwx.getLocation({
        type: 'wgs84',
        success: (res) => {
          let latitude = res.latitude,
            longitude = res.longitude;
          resolve({ lat: latitude, lon: longitude })
        },
        fail: (error) => { console.log('获取定位失败'); resolve({ lat: 0, lon: 0 }) }
      })
    });
  },

  // 获取首屏数据
  _getFirstPageDatas() {
    let { Lat, Lon, PageSize, CurrentDestId, DistanceFilter, FoodFilters, IsBusinessOpen, IsMeiShiLin, IsOnlyList, MeiShiLinTypes, MetroId, OrderType, Platform, PositionLat, PositionLon, PriceFilter, RegionId, SceneFilter, SellFilter, SubVersion, ZoneId, showOpenApp } = this.data,
      firstParams = {
        CuisineFilter: [],
        CurrentDestId: CurrentDestId,
        DistanceFilter: DistanceFilter,
        FoodFilters: FoodFilters,
        IsBusinessOpen: IsBusinessOpen,
        IsMeiShiLin: IsMeiShiLin,
        IsOnlyList: IsOnlyList,
        Lat: Lat,
        Lon: Lon,
        MeiShiLinTypes: MeiShiLinTypes,
        MetroId: parseInt(MetroId),
        OrderType: OrderType,
        PageIndex: 1,
        PageSize: PageSize,
        Platform: Platform,
        PositionLat: PositionLat,
        PositionLon: PositionLon,
        PriceFilter: PriceFilter,
        RegionId: parseInt(RegionId),
        SceneFilter: SceneFilter,
        SellFilter: SellFilter,
        SubVersion: SubVersion,
        ViewDestId: this.districtId.toString(),
        ZoneId: parseInt(ZoneId)
      }
    if (showOpenApp) {
      this.ubtTrace(this.data.key, {
        actiontype: 'browse',
        actioncode: 'o_openapp',
        districtId: this.districtId
      })
    }
    this._initAppUrl()
    this._getHomePageRestaruantListV706(firstParams).then((data) => {
      console.log(data)
      let { Restaurants, Filter, TotalCount } = data,
        { PageSize, filterName } = this.data;
      if (Restaurants.length === 0 && !Filter.DefaultSort) {
        this.setData({
          nodata2: true
        }, () => {
          cwx.hideLoading();
          return;
        })
      }

      let menuName = Filter.DefaultSort[0].Name;
      filterName = [{ name: '位置', current: 0 }, { name: '菜系', current: 0 }, { name: '筛选', current: 0 }, { name: menuName, current: 0 }];

      this.setData({
        filterName: filterName,
        Restaurants: Restaurants,
        Filter: Filter,
        nomore: Restaurants.length >= PageSize ? false : !!Filter.DefaultSort ? true : false,
        isNewStyle: data.isNew
      }, () => {
        let { _OrderType, filterName, Filter } = this.data;
        if ('DefaultSort' in Filter && !!Filter.DefaultSort) {
          filterName[3].name = Filter.DefaultSort[_OrderType].Name;
          filterName[_OrderType].current = 1;
          this.setData({
            filterName: filterName
          })
        }

        cwx.hideLoading();
      })


    }, (error) => {
      console.log(error)
    });
  },



  // 触底加载
  _scrolltolower() {
    let { Lat, Lon, PositionLat, PositionLon, ZoneId, RegionId, MetroId, CuisineFilter, MeiShiLinTypes, PriceFilter, OrderType, PageIndex, PageSize, CurrentDestId, DistanceFilter, FoodFilters, IsBusinessOpen, IsMeiShiLin, Platform, SubVersion, SellFilter, SceneFilter, listLoading, nomore } = this.data,
      _PageIndex = PageIndex + 1;


    let nextParams = {
      CuisineFilter: CuisineFilter,
      CurrentDestId: CurrentDestId,
      DistanceFilter: DistanceFilter,
      FoodFilters: FoodFilters,
      IsBusinessOpen: IsBusinessOpen,
      IsMeiShiLin: IsMeiShiLin,
      IsOnlyList: true,
      Lat: Lat,
      Lon: Lon,
      MeiShiLinTypes: MeiShiLinTypes,
      MetroId: parseInt(MetroId),
      OrderType: OrderType,
      PageIndex: _PageIndex,
      PageSize: PageSize,
      Platform: Platform,
      PositionLat: PositionLat,
      PositionLon: PositionLon,
      PriceFilter: PriceFilter,
      RegionId: parseInt(RegionId),
      SceneFilter: SceneFilter,
      SellFilter: SellFilter,
      SubVersion: SubVersion,
      ViewDestId: this.districtId.toString(),
      ZoneId: parseInt(ZoneId),
    };
    if (!listLoading && !nomore) {
      this.setData({
        listLoading: true
      }, () => {
        this._getHomePageRestaruantListV706(nextParams).then((data) => {
          let { Restaurants, Filter, TotalCount } = data,
            { PageSize } = this.data;
          this.setData({
            Restaurants: this.data.Restaurants.concat(Restaurants),
            nomore: Restaurants.length >= PageSize ? false : true,
            listLoading: false,
            PageIndex: _PageIndex
          })
        }, (error) => {
          console.log(error)
        });
      })
    }


  },


  // 筛选刷新
  _filter(addParams) {
    let { Lat, Lon, PageSize, CuisineFilter, CurrentDestId, DistanceFilter, FoodFilters, IsBusinessOpen, IsMeiShiLin, MeiShiLinTypes, MetroId, OrderType, Platform, PositionLat, PositionLon, PriceFilter, RegionId, SceneFilter, SellFilter, SubVersion, ZoneId } = this.data,
      Params = {
        CuisineFilter: CuisineFilter,
        CurrentDestId: CurrentDestId,
        DistanceFilter: DistanceFilter,
        FoodFilters: FoodFilters,
        IsBusinessOpen: IsBusinessOpen,
        IsMeiShiLin: IsMeiShiLin,
        IsOnlyList: true,
        Lat: Lat,
        Lon: Lon,
        MeiShiLinTypes: MeiShiLinTypes,
        MetroId: parseInt(MetroId),
        OrderType: OrderType,
        PageIndex: 1,
        PageSize: PageSize,
        Platform: Platform,
        PositionLat: PositionLat,
        PositionLon: PositionLon,
        PriceFilter: PriceFilter,
        RegionId: parseInt(RegionId),
        SceneFilter: SceneFilter,
        SellFilter: SellFilter,
        SubVersion: SubVersion,
        ViewDestId: this.districtId.toString(),
        ZoneId: parseInt(ZoneId),
      },
      contentParams = Object.assign({}, Params, addParams);
    console.log(Params);
    this.setData({
      Restaurants: [],
      listLoading: true,
      nodata: false,
    }, () => {
      this._initAppUrl()
      this._getHomePageRestaruantListV706(contentParams).then((data) => {
        cwx.hideLoading();
        console.log(data)
        let { Restaurants, Filter } = data;
        if (Restaurants && Restaurants.length > 0) {
          this.setData({
            Restaurants: Restaurants,
            // Filter: Filter,
            PageIndex: 1,
            nodata: false,
            listLoading: false,
            nomore: Restaurants && Restaurants.length >= PageSize ? false : true,
          })
        } else {
          this.setData({
            Restaurants: Restaurants,
            // Filter: Filter,
            PageIndex: 1,
            nodata: true,
            listLoading: false,
            nomore: Restaurants && Restaurants.length >= PageSize ? false : true,
          })
        }
      }, (error) => {
        console.log(error)
      });
    })


  },

  _onScroll(e) {

  },
  _getHomePageRestaruantListV706(params) {

    this.pageLoading = true;
    return new Promise((resolve, reject) => {
      cwx.request({
        url: '/restapi/soa2/10332/json/GetHomePageRestaruantListV706',
        data: params,
        success: (res) => {
          this.pageLoading = false;
          if (res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack === "Success") {
            //接口请求成功
            resolve(res.data);
          } else {
            //接口请求成功，返回异常
            reject('GetHomePageRestaruantListV706接口报错')
          }
        },
        fail: (err) => {
          //接口请求失败
          reject(err);
        }
      })
    })
  },
  _getGsLocationInfo(params) {
    return new Promise((resolve, reject) => {
      cwx.request({
        url: '/restapi/soa2/13342/json/getgslocationinfo',
        data: params,
        success: (res) => {
          if (res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack === "Success") {
            //接口请求成功
            resolve(res.data);
          } else {
            //接口请求成功，返回异常
            reject('getgslocationinfo接口报错')
          }
        },
        fail: (err) => {
          //接口请求失败
          reject(err);
        }
      })
    });
  },
  // 去详情页
  _goDetail(e) {
    const self = this;
    let { id } = e.detail;
    self.ubtTrace(100093, {
      actionType: 'click',
      actionCode: 'c_tesecai',
      districtId: self.districtId,
      RestaurantId: id,
    })

    cwx.navigateTo({
      url: '/pages/foods/resDetail/resDetail?id=' + id + "&districtId=" + self.districtId,
    });

  },
  openApp() {
    let { districtId } = this.data
    console.log(districtId)
    this.ubtTrace(this.data.key, {
      actioncode: 'c_openapp',
      actiontype: 'click',
      districtid: districtId
    })
  }
})