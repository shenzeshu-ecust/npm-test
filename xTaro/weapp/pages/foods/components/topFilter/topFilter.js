import _ubt from "../../../../cwx/cpage/ubt_wx.js";

Component({
  properties: {
    districtId: {
      type: Number,
      value: 0
    },
    filter: {
      type: Object,
      value: {}
    },
    filterName: {
      type: Array,
      value: []
    },
    orderType: {
      type: Number,
      value: 0
    },
    sellFilter: {
      type: String,
      value: ''
    },
    isNewStyle:Boolean,
  },
  data: {
    //热门地标
    PositionLat: 0,
    PositionLon: 0,
    //热门商圈
    ZoneId: 0,
    //行政区
    RegionId: 0,
    //地铁
    MetroId: 0,


    showFilter1Col3: false,
    showFilter2Col3: false,
    isfilter1SelectTap1: false,
    isfilter1SelectTap2: false,
    isfilter2SelectTap1: false,
    isfilter2SelectTap2: false,
    filter1SelectTap1Index: 0,
    filter1SelectTap2Index: 0,
    filter2SelectTap1Index: 0,
    filter2SelectTap2Index: 0,

    active1Index2: 0,

    isOpenFilter: false,
    showFilter1: false,
    showFilter2: false,
    showFilter3: false,
    showFilter4: false,

    noMenu1: false,
    isReset: false,


    //星级
    MeiShiLinTypes: [],
    //价格
    PriceFilter: []
  },
  attached: function () {
    if (this.data.filter) {
      let { CuisineSort, DefaultSort, DistanceSort, FoodSort, LandmarkSort, MetroSort, PriceSort, _SellFilter, RegionSort, SceneSort, SellSort, ShiMeiLin, ZoneSort } = this.data.filter,
        addData = { 'Name': '不限', current: 1, },
        addData2 = { 'ZoneName': '不限', current: 1, },
        { orderType, filterName } = this.data,
        newFilterName = [];
      if ((_SellFilter && _SellFilter.length > 0) || this.data.sellFilter) {
        SellSort.forEach((x, i) => {
          if (x.Id == +this.data.sellFilter) {
            x.active = 1
          }
        })
        this.setData({
          showDot2: true
        })
      }
      if (LandmarkSort && LandmarkSort.length > 0) {
        LandmarkSort.unshift(Object.assign({}, addData));
      }

      if (ZoneSort && ZoneSort.length > 0) {
        ZoneSort.unshift(Object.assign({}, addData2));
      }

      //可能没有行政区
      if (RegionSort && RegionSort.length > 0) {
        RegionSort.unshift(Object.assign({}, addData));
      }

      //可能没有地铁
      if (MetroSort && MetroSort.length > 0) {
        MetroSort.forEach((x, i) => {
          x.Stations.unshift(Object.assign({}, addData));
        })

        MetroSort[0].current2 = 2;
      }

      CuisineSort.unshift(Object.assign({}, addData));
      CuisineSort[0].current2 = 2;

      // DefaultSort.forEach((x, i)=>{
      //   x.current = 0;
      // })
      if (orderType > 0) {
        DefaultSort[orderType].current = 1;
      } else {
        DefaultSort[0].current = 1;
      }


      let filterFirstItem1 = [],
        filterSecondItem1 = [],
        filterThirdItem1 = [],

        filterFirstItem2 = [
          {
            tab: '菜系',
            options: CuisineSort,
            current: 1,
          }
        ],
        filterSecondItem2 = [],
        filterThirdItem2 = [];

      //没有位置对menu的处理

      if (LandmarkSort && LandmarkSort.length > 0) {
        LandmarkSort.forEach((x, i) => {
          x.current = 0
        })
        // LandmarkSort[0].current = 1;
        filterFirstItem1.push({
          tab: '热门地标',
          options: LandmarkSort,
          current: 0,
        })
      }

      if (ZoneSort && ZoneSort.length > 0) {
        ZoneSort.forEach((x, i) => {
          x.current = 0
        })
        // ZoneSort[0].current = 1;
        filterFirstItem1.push({
          tab: '热门商圈',
          options: ZoneSort,
          current: 0,
        })
      }

      if (RegionSort && RegionSort.length > 0) {
        RegionSort.forEach((x, i) => {
          x.current = 0
        })
        // RegionSort[0].current = 1;
        filterFirstItem1.push({
          tab: '行政区',
          options: RegionSort,
          current: 0,
        })
      }

      if (MetroSort && MetroSort.length > 0) {
        MetroSort.forEach((x, i) => {
          x.current2 = 0
          if (x.Stations) {
            x.Stations.forEach((y, l) => {
              y.current = 0
            })
            // x.Stations[0].current = 1;
          }
        })
        // MetroSort[0].current2 = 2;
        filterFirstItem1.push({
          tab: '地铁',
          options: MetroSort,
          current: 0,
        })
      }

      if (filterFirstItem1.length > 0) {
        newFilterName = this.copy(filterName, []);
        this.setData({
          noMenu1: false
        })

        filterFirstItem1[0].current = 1;
        filterFirstItem1.forEach((x, i) => {
          if (x.tab === '热门地标' || x.tab === '热门商圈' || x.tab === '行政区') {
            x.options[0].current = 1;
          }
          if (x.tab === '地铁') {
            x.options[0].current2 = 2;
            x.options[0].Stations[0].current = 1;
            x.options.forEach((y, l) => {
              if (y.Stations && y.Stations.length > 0) {
                y.Stations[0].current = 1;
              }
            })
            if (x.current === 1) {
              this.setData({
                showFilter1Col3: true,
              })
            } else {
              this.setData({
                showFilter1Col3: false,
              })
            }
          }
          if (x.current === 1) {
            filterSecondItem1 = x.options;
            x.options.forEach((y, l) => {
              if (y.current2 === 2) {
                if (y.Stations && y.Stations.length > 0) {
                  filterThirdItem1 = y.Stations;
                }
              }
            })
          }
        })

        // copy前 过滤数据
        if (filterFirstItem1.length > 0) {
          filterFirstItem1.forEach((x, i) => {
            x.options.forEach((y, l) => {
              if ('Name' in y && y.Name === null) {
                x.options.splice(l, 1)
              }
            })
          })
        }
        // 备份筛选1，用于clear
        let copyFilterFirstItem = this.copy(filterFirstItem1, []);
        copyFilterFirstItem[0].current = 0;

        this.setData({
          copyFilterFirstItem: copyFilterFirstItem
        })
      } else {
        filterName.shift();
        newFilterName = this.copy(filterName, []);
        this.setData({
          noMenu1: true
        })
      }

      filterFirstItem2.forEach((x, i) => {
        if (x.current === 1) {
          filterSecondItem2 = x.options;
          x.options.forEach((y, l) => {
            if (y.current2 === 2) {
              if (y.Children && y.Children.length > 0) {
                filterThirdItem2 = y.Children;
              }
            }
          })
        }
      })

      this.setData({
        filterFirstItem1: filterFirstItem1,
        filterSecondItem1: filterSecondItem1,
        filterThirdItem1: filterThirdItem1,

        filterFirstItem2: filterFirstItem2,
        filterSecondItem2: filterSecondItem2,
        filterThirdItem2: filterThirdItem2,
        showFilter2Col3: true,
        isfilter2SelectTap2: true,

        defaultSort: DefaultSort,
        ShiMeiLin: ShiMeiLin,
        PriceSort: PriceSort,
        SellSort: SellSort,
        newFilterName: newFilterName,
      })
    }
  },
  methods: {

    _myCatchTouch(e) {
      return;
    },
    //筛选1点击col1
    _filter1SelectTap1(e) {
      let { index, tab } = e.currentTarget.dataset,
        { filterFirstItem1, filterSecondItem1, filterThirdItem1, filter1SelectTap1Index } = this.data,
        active1Index;

      if (tab === "地铁") {
        this.setData({
          showFilter1Col3: true,
        })
      } else {
        this.setData({
          showFilter1Col3: false,
        })
      }

      filterFirstItem1.forEach((x, i) => {
        x.current = 0;
      })

      filterFirstItem1[index].current = 1;

      filterFirstItem1.forEach((x, i) => {
        if (x.current === 1) {
          active1Index = i;
          filterSecondItem1 = x.options;

          x.options.forEach((y, l) => {

            if (y.current2 === 2) {

              if (y.Stations && y.Stations.length > 0) {
                filterThirdItem1 = y.Stations;
              }
            }
          })
        }
      })

      this.setData({
        filterFirstItem1: filterFirstItem1,
        filterSecondItem1: filterSecondItem1,
        filterThirdItem1: filterThirdItem1,
        active1Index: active1Index
      })
    },

    //筛选1点击col2
    _filter1SelectTap2(e) {
      let { index } = e.currentTarget.dataset,
        { copyFilterFirstItem, newFilterName, filterFirstItem1, filterSecondItem1, filterThirdItem1 } = this.data,
        tap1Name,
        tap1Index,
        newFilterFirstItem1,
        newFilterSecondItem1,
        newFilterThirdItem1;

      filterFirstItem1.forEach((x, i) => {
        if (x.current === 1) {
          tap1Name = x.tab;
          tap1Index = i;
        }
      })

      if (tap1Name === '热门地标' || tap1Name === '热门商圈' || tap1Name === '行政区') {
        newFilterFirstItem1 = this.copy(copyFilterFirstItem, []);
        newFilterFirstItem1[tap1Index].current = 1;
        newFilterFirstItem1[tap1Index].options[0].current = 0;
        newFilterFirstItem1[tap1Index].options[index].current = 1;
      } else if (tap1Name === '地铁') {
        let idx;
        filterFirstItem1[tap1Index].options.forEach((y, l) => {
          if (y.current === 1) {
            idx = l;
          }
        });
        newFilterFirstItem1 = this.copy(filterFirstItem1, []);
        newFilterFirstItem1[tap1Index].current = 1;
        newFilterFirstItem1[tap1Index].options.forEach((y, l) => { y.current = 0; y.current2 = 0; });
        if (idx >= 0) {
          newFilterFirstItem1[tap1Index].options[idx].current = 1;
        }

        newFilterFirstItem1[tap1Index].options[index].current2 = 2;
        newFilterThirdItem1 = newFilterFirstItem1[tap1Index].options[index].Stations;
      }
      newFilterSecondItem1 = newFilterFirstItem1[tap1Index].options;

      if (tap1Name === '热门地标') {

        if (index > 0) {
          let { Lat, Lon, Id, Name } = newFilterSecondItem1[index];
          newFilterName[0].name = Name;
          this.setData({
            filterFirstItem1: newFilterFirstItem1,
            filterSecondItem1: newFilterSecondItem1,
            newFilterName: newFilterName,
            PositionLat: Lat,
            PositionLon: Lon,
            PositionId: Id,
            isfilter1SelectTap1: true,
            isfilter1SelectTap2: false,
            filter1SelectTap1Index: tap1Index,
            showFilter1: false,
            isOpenFilter: false,
          }, () => {
            let { PositionLat, PositionLon, PositionId, districtId } = this.data,
              positionData = { PositionLat: PositionLat, PositionLon: PositionLon, isOpenFilter: false };
            _ubt.ubtTrace(100093, {
              actionType: 'click',
              actionCode: 'c_shaixuan',
              pageid: 10650009862,
              menuid: 1,
              typeid: 1,
              xiangmu: PositionId,
              districtid: districtId
            })
            this.triggerEvent('myevent', positionData)
          })
        } else {
          newFilterName[0].name = '位置';
          this.setData({
            filterFirstItem1: newFilterFirstItem1,
            filterSecondItem1: newFilterSecondItem1,
            newFilterName: newFilterName,
            PositionLat: 0,
            PositionLon: 0,
            isfilter1SelectTap1: false,
            filter1SelectTap1Index: 0,
            showFilter1: false,
            isOpenFilter: false,
          }, () => {
            let { PositionLat, PositionLon } = this.data,
              positionData = { PositionLat: PositionLat, PositionLon: PositionLon, isOpenFilter: false };
            this.triggerEvent('myevent', positionData)
          })
        }

      } else if (tap1Name === '热门商圈') {
        if (index > 0) {
          let { ZoneId, ZoneName } = filterSecondItem1[index];
          newFilterName[0].name = ZoneName;
          this.setData({
            filterFirstItem1: newFilterFirstItem1,
            filterSecondItem1: newFilterSecondItem1,
            newFilterName: newFilterName,
            ZoneId: ZoneId,
            isfilter1SelectTap1: true,
            isfilter1SelectTap2: false,
            filter1SelectTap1Index: tap1Index,
            showFilter1: false,
            isOpenFilter: false,
          }, () => {
            let { ZoneId, districtId } = this.data,
              positionData = { ZoneId: ZoneId, isOpenFilter: false };
            _ubt.ubtTrace(100093, {
              actionType: 'click',
              actionCode: 'c_shaixuan',
              pageid: 10650009862,
              menuid: 1,
              typeid: 2,
              xiangmu: ZoneId,
              districtid: districtId
            })
            this.triggerEvent('myevent', positionData);
          })
        } else {
          newFilterName[0].name = '位置';
          this.setData({
            filterFirstItem1: newFilterFirstItem1,
            filterSecondItem1: newFilterSecondItem1,
            newFilterName: newFilterName,
            ZoneId: 0,
            isfilter1SelectTap1: false,
            filter1SelectTap1Index: 0,
            showFilter1: false,
            isOpenFilter: false,
          }, () => {
            let { ZoneId } = this.data,
              positionData = { ZoneId: ZoneId, isOpenFilter: false };
            this.triggerEvent('myevent', positionData)
          })
        }

      } else if (tap1Name === '行政区') {

        if (index > 0) {

          let { Id, Name } = filterSecondItem1[index];
          newFilterName[0].name = Name;
          this.setData({
            filterFirstItem1: newFilterFirstItem1,
            filterSecondItem1: newFilterSecondItem1,
            newFilterName: newFilterName,
            RegionId: Id,
            isfilter1SelectTap1: true,
            isfilter1SelectTap2: false,
            filter1SelectTap1Index: tap1Index,
            showFilter1: false,
            isOpenFilter: false,
          }, () => {
            let { RegionId, districtId } = this.data,
              positionData = { RegionId: RegionId, isOpenFilter: false };
            _ubt.ubtTrace(100093, {
              actionType: 'click',
              actionCode: 'c_shaixuan',
              pageid: 10650009862,
              menuid: 1,
              typeid: 3,
              xiangmu: RegionId,
              districtid: districtId
            })
            this.triggerEvent('myevent', positionData)
          })
        } else {
          newFilterName[0].name = '位置';
          this.setData({
            filterFirstItem1: newFilterFirstItem1,
            filterSecondItem1: newFilterSecondItem1,
            newFilterName: newFilterName,
            RegionId: 0,
            isfilter1SelectTap1: false,
            filter1SelectTap1Index: 0,
            showFilter1: false,
            isOpenFilter: false,
          }, () => {
            let { RegionId } = this.data,
              positionData = { RegionId: RegionId, isOpenFilter: false };
            this.triggerEvent('myevent', positionData)
          })
        }



      } else if (tap1Name === '地铁') {
        this.setData({
          filterFirstItem1: newFilterFirstItem1,
          filterSecondItem1: newFilterSecondItem1,
          filterThirdItem1: newFilterThirdItem1,
        })
      }
    },

    //筛选1点击col3
    _filter1SelectTap3(e) {
      let { index, id, name } = e.currentTarget.dataset,
        { copyFilterFirstItem, newFilterName, filterFirstItem1, filterSecondItem1, filterThirdItem1 } = this.data,
        tap1Name,
        tap1Index,
        tap2Index,
        newFilterFirstItem1,
        newFilterSecondItem1,
        newFilterThirdItem1;

      filterFirstItem1.forEach((x, i) => {
        if (x.current === 1) {
          tap1Name = x.tab;
          tap1Index = i;
        }
      })

      filterSecondItem1.forEach((x, i) => {
        if (filterSecondItem1[i].Stations) {
          filterSecondItem1[i].Stations.forEach((y, j) => {
            if (y.Id === id) {
              tap2Index = i;
            }
          })
        }
      })

      if (tap1Name === '地铁') {
        newFilterFirstItem1 = this.copy(copyFilterFirstItem, []);
        newFilterFirstItem1[tap1Index].current = 1;
        newFilterFirstItem1[tap1Index].options[0].current2 = 0;
        newFilterFirstItem1[tap1Index].options[tap2Index].current2 = 2;
        newFilterFirstItem1[tap1Index].options.forEach((x, i) => { x.current = 0; });
        newFilterFirstItem1[tap1Index].options[tap2Index].current = 1;
        newFilterSecondItem1 = newFilterFirstItem1[tap1Index].options;
        newFilterThirdItem1 = newFilterFirstItem1[tap1Index].options[tap2Index].Stations;
        newFilterThirdItem1.forEach((x, i) => { x.current = 0; });
        newFilterThirdItem1[index].current = 1;
      }

      if (index > 0) {
        newFilterName[0].name = filterThirdItem1[index].Name;
        let { Id } = filterThirdItem1[index];
        this.setData({
          filterFirstItem1: newFilterFirstItem1,
          filterSecondItem1: newFilterSecondItem1,
          filterThirdItem1: newFilterThirdItem1,
          newFilterName: newFilterName,
          MetroId: Id,
          isfilter1SelectTap1: true,
          isfilter1SelectTap2: true,
          filter1SelectTap1Index: tap1Index,
          filter1SelectTap2Index: tap2Index,
          showFilter1: false,
          isOpenFilter: false,
        }, () => {
          let { MetroId, districtId } = this.data,
            positionData = { MetroId: MetroId, isOpenFilter: false };
          _ubt.ubtTrace(100093, {
            actionType: 'click',
            actionCode: 'c_shaixuan',
            pageid: 10650009862,
            menuid: 1,
            typeid: 3,
            xiangmu: MetroId,
            districtid: districtId
          })
          this.triggerEvent('myevent', positionData)
        })
      } else {
        newFilterFirstItem1[tap1Index].options[0].current2 = 2;
        newFilterName[0].name = '位置';
        this.setData({
          filterFirstItem1: newFilterFirstItem1,
          filterSecondItem1: newFilterSecondItem1,
          filterThirdItem1: newFilterThirdItem1,
          newFilterName: newFilterName,
          MetroId: 0,
          isfilter1SelectTap1: false,
          isfilter1SelectTap2: false,
          filter1SelectTap1Index: 0,
          filter1SelectTap2Index: 0,
          showFilter1: false,
          isOpenFilter: false,
        }, () => {
          let { MetroId } = this.data,
            positionData = { MetroId: MetroId, isOpenFilter: false };
          this.triggerEvent('myevent', positionData)
        })
      }
    },

    //筛选2点击col1
    _filter2SelectTap1(e) {
      let { index } = e.currentTarget.dataset,
        { filterFirstItem2, filterSecondItem2, filterThirdItem2, filter1SelectTapIndex2 } = this.data,
        active1Index2;

      filterFirstItem2.forEach((x, i) => {
        x.current = 0;
      })

      filterFirstItem2[index].current = 1;

      filterFirstItem2.forEach((x, i) => {
        if (x.current === 1) {
          active1Index2 = i;
          filterSecondItem2 = x.options;

          x.options.forEach((y, l) => {

            if (y.current2 === 2) {

              if (y.Children && y.Children.length > 0) {
                filterThirdItem2 = y.Children;
              }
            }
          })
        }
      })

      this.setData({
        filterFirstItem2: filterFirstItem2,
        filterSecondItem2: filterSecondItem2,
        filterThirdItem2: filterThirdItem2,
        active1Index2: active1Index2
      })
    },

    //筛选2点击col2
    _filter2SelectTap2(e) {
      let { index } = e.currentTarget.dataset,
        { newFilterName, filterFirstItem2, filterSecondItem2, filterThirdItem2, noMenu1 } = this.data,
        tap1Index;

      filterFirstItem2.forEach((x, i) => {
        if (x.current === 1) {
          tap1Index = i;
        }
      })

      if (index > 0) {

        if (tap1Index === 0) {

          if (index > 0) {
            if (filterSecondItem2[index].Children && filterSecondItem2[index].Children.length === 0) {
              filterThirdItem2.forEach((x, i) => {
                x.current = 0
              })
              if (noMenu1) {
                newFilterName[0].name = filterSecondItem2[index].Name;
              } else {
                newFilterName[1].name = filterSecondItem2[index].Name;
              }

              let { Id } = filterSecondItem2[index],
                CuisineFilter = [];
              CuisineFilter.push(Id);

              this.setData({
                filterThirdItem2: filterThirdItem2,
                newFilterName: newFilterName,
                CuisineFilter: CuisineFilter,
                isfilter2SelectTap1: true,
                isfilter2SelectTap2: true,
                filter2SelectTap1Index: tap1Index,
                filter2SelectTap2Index: index,
                showDot: true,
                showFilter2: false,
                isOpenFilter: false,
              }, () => {
                let { CuisineFilter, districtId } = this.data,
                  positionData = { CuisineFilter: CuisineFilter, isOpenFilter: false };
                _ubt.ubtTrace(100093, {
                  actionType: 'click',
                  actionCode: 'c_shaixuan',
                  pageid: 10650009862,
                  menuid: 2,
                  typeid: 1,
                  xiangmu: CuisineFilter[0],
                  districtid: districtId
                })
                this.triggerEvent('myevent', positionData)
              })

            }
            filterSecondItem2.forEach((x, i) => {
              x.current2 = 0;
            })
            filterSecondItem2[index].current2 = 2;
            this.setData({
              filterSecondItem2: filterSecondItem2,
              filterThirdItem2: filterSecondItem2[index].Children,
            })


          } else {
            filterSecondItem2[0].current2 = 2;
            this.setData({
              filterSecondItem2: filterSecondItem2,
              filterThirdItem2: filterSecondItem2[index].Children,
            })
          }

        }
      } else {
        filterSecondItem2.forEach((x, i) => {
          x.current = 0;
          x.current2 = 0;
        });

        filterSecondItem2[0].current2 = 2;

        filterThirdItem2.forEach((x, i) => {
          x.current = 0
        })

        filterSecondItem2[0].current1 = 1;

        if (noMenu1) {
          newFilterName[0].name = '菜系';
        } else {
          newFilterName[1].name = '菜系';
        }

        this.setData({
          filterSecondItem2: filterSecondItem2,
          filterThirdItem2: [],
          newFilterName: newFilterName,
          CuisineFilter: [],
          isfilter2SelectTap1: false,
          isfilter2SelectTap2: true,
          filter2SelectTap1Index: 0,
          filter2SelectTap2Index: 0,
          showDot: false,
          showFilter2: false,
          isOpenFilter: false,
        }, () => {
          let { CuisineFilter } = this.data,
            positionData = { CuisineFilter: CuisineFilter, isOpenFilter: false };
          this.triggerEvent('myevent', positionData)
        })
      }
    },

    //筛选2点击col3
    _filter2SelectTap3(e) {
      let { index, id } = e.currentTarget.dataset,
        { newFilterName, filterFirstItem2, filterSecondItem2, filterThirdItem2, noMenu1 } = this.data,
        tap1Index,
        tap2Index;

      filterFirstItem2.forEach((x, i) => {
        if (x.current === 1) {
          tap1Index = i;
        }
      })

      filterSecondItem2.forEach((x, i) => {
        if (filterSecondItem2[i].Children) {
          filterSecondItem2[i].Children.forEach((y, j) => {
            if (y.Id === id) {
              tap2Index = i;
            }
          })
        }
      })


      if (tap1Index === 0) {


        // if (index > 0) {

        filterThirdItem2.forEach((x, i) => {
          x.current = 0;
        })
        filterThirdItem2[index].current = 1;
        filterSecondItem2.forEach((x, i) => {
          if (x.current2 !== 2) {
            if (x.Children) {
              x.Children.forEach((y, l) => {
                y.current = 0;
              })
            }
            //x.Children[0].current = 1;
          }
        })

        if (noMenu1) {
          if (index > 0) {
            newFilterName[0].name = filterThirdItem2[index].Name;
          } else {
            newFilterName[0].name = filterSecondItem2[tap2Index].Name;
          }
        } else {
          if (index > 0) {
            newFilterName[1].name = filterThirdItem2[index].Name;
          } else {
            newFilterName[1].name = filterSecondItem2[tap2Index].Name;
          }
        }


        let { Id } = filterThirdItem2[index],
          CuisineFilter = [];
        CuisineFilter.push(Id)

        this.setData({
          filterSecondItem2: filterSecondItem2,
          filterThirdItem2: filterThirdItem2,
          newFilterName: newFilterName,
          CuisineFilter: CuisineFilter,
          isfilter2SelectTap1: true,
          isfilter2SelectTap2: true,
          filter2SelectTap1Index: tap1Index,
          filter2SelectTap2Index: tap2Index,
          showDot: true,
          showFilter2: false,
          isOpenFilter: false,
        }, () => {
          let { CuisineFilter, districtId } = this.data,
            positionData = { CuisineFilter: CuisineFilter, isOpenFilter: false };
          _ubt.ubtTrace(100093, {
            actionType: 'click',
            actionCode: 'c_shaixuan',
            pageid: 10650009862,
            menuid: 2,
            typeid: 1,
            xiangmu: CuisineFilter[0],
            districtid: districtId
          })
          this.triggerEvent('myevent', positionData)
        })
      }
    },

    _filter3item1(e) {
      let { index, id } = e.currentTarget.dataset,
        { ShiMeiLin, districtId } = this.data;
      if (index > 0) {
        ShiMeiLin[0].active = 0;
        if (ShiMeiLin[index].active === 0) {
          _ubt.ubtTrace(100093, {
            actionType: 'click',
            actionCode: 'c_shaixuan',
            pageid: 10650009862,
            menuid: 3,
            typeid: 1,
            xiangmu: 0,
            districtid: districtId
          })
        }
        ShiMeiLin[index].active = ShiMeiLin[index].active === 1 ? 0 : 1;
      } else {
        if (ShiMeiLin[0].active === 0) {
          _ubt.ubtTrace(100093, {
            actionType: 'click',
            actionCode: 'c_shaixuan',
            pageid: 10650009862,
            menuid: 3,
            typeid: 1,
            xiangmu: 0,
            districtid: districtId
          })
          ShiMeiLin.forEach((x, i) => {
            x.active = 0;
          })
          ShiMeiLin[0].active = 1;
        } else {
          ShiMeiLin[0].active = 0;
        }
      }

      this.setData({
        ShiMeiLin: ShiMeiLin,
      })
    },

    _filter3item2(e) {
      let { index, id } = e.currentTarget.dataset,
        { PriceSort, districtId } = this.data;
      if (PriceSort[index].active === 0) {
        _ubt.ubtTrace(100093, {
          actionType: 'click',
          actionCode: 'c_shaixuan',
          pageid: 10650009862,
          menuid: 3,
          typeid: 2,
          xiangmu: 0,
          districtid: districtId
        })
      }
      PriceSort[index].active = PriceSort[index].active === 1 ? 0 : 1;
      this.setData({
        PriceSort: PriceSort
      })
    },

    _filter3item3(e) {
      let { index, id } = e.currentTarget.dataset,
        { SellSort, districtId } = this.data;
      if (SellSort[index].active === 0) {
        _ubt.ubtTrace(100093, {
          actionType: 'click',
          actionCode: 'c_shaixuan',
          pageid: 10650009862,
          menuid: 3,
          typeid: 3,
          xiangmu: 0,
          districtid: districtId
        })
      }
      SellSort[index].active = SellSort[index].active === 1 ? 0 : 1;
      this.setData({
        SellSort: SellSort
      })
    },

    _filter3Reset() {
      let { ShiMeiLin, PriceSort, MeiShiLinTypes, PriceFilter, isReset, SellSort } = this.data;
      ShiMeiLin.forEach((x, i) => {
        x.active = 0;
      })
      PriceSort.forEach((x, i) => {
        x.active = 0;
      })

      SellSort.forEach((x, i) => {
        x.active = 0;
      })

      this.setData({
        // MeiShiLinTypes: [],
        // PriceFilter: [],
        isReset: true,
        ShiMeiLin: ShiMeiLin,
        PriceSort: PriceSort,
        SellSort: SellSort,
      })
    },

    _filter3Submit() {
      let { ShiMeiLin, PriceSort, isReset, SellSort } = this.data,
        MeiShiLinTypes = [],
        PriceFilter = [],
        SellFilter = [],
        _MeiShiLinTypes = [],
        _PriceFilter = [],
        _SellFilter = [];

      if (isReset) {
        MeiShiLinTypes = [];
        PriceFilter = [];
        _MeiShiLinTypes = [];
        _PriceFilter = [];
        _SellFilter = [];
        SellFilter = [];
      } else {
        ShiMeiLin.forEach((x, i) => {
          if (x.active === 1) {
            MeiShiLinTypes.push(x.Id);
            _MeiShiLinTypes.push({ filterId: x.Id, filterName: x.Name });
          }
        })
        PriceSort.forEach((x, i) => {
          if (x.active === 1) {
            PriceFilter.push(x.Id);
            _PriceFilter.push({ filterId: x.Id, filterName: x.Name });
          }
        })
        SellSort.forEach((x, i) => {
          if (x.active === 1) {
            SellFilter.push(x.Id);
            _SellFilter.push({ filterId: x.Id, filterName: x.Name });
          }
        })
      }
      this.setData({
        MeiShiLinTypes: MeiShiLinTypes,
        PriceFilter: PriceFilter,
        _MeiShiLinTypes: _MeiShiLinTypes,
        _PriceFilter: _PriceFilter,
        showFilter3: false,
        isOpenFilter: false,
        isReset: false,
        _SellFilter: _SellFilter,
        SellFilter: SellFilter,
      }, () => {
        let { MeiShiLinTypes, PriceFilter, _MeiShiLinTypes, _PriceFilter, districtId, _SellFilter, SellFilter } = this.data,
          positionData = { MeiShiLinTypes: MeiShiLinTypes, PriceFilter: PriceFilter, isOpenFilter: false, SellFilter: SellFilter };
        if (MeiShiLinTypes.length > 0 || PriceFilter.length > 0 || SellFilter.length > 0) {
          this.setData({
            showDot2: true
          })
        } else {
          this.setData({
            showDot2: false
          })
        }
        if (_MeiShiLinTypes.length > 0) {
          _MeiShiLinTypes.forEach((x, i) => {
            _ubt.ubtTrace(100093, {
              actionType: 'click',
              actionCode: 'c_shaixuan',
              pageid: 10650009862,
              menuid: 3,
              typeid: 0,
              xiangmu: 0,
              filterType: 1,
              filterId: x.filterId,
              filterName: x.filterName,
              districtid: districtId
            })
          })
        }
        if (_PriceFilter.length > 0) {
          _PriceFilter.forEach((x, i) => {
            _ubt.ubtTrace(100093, {
              actionType: 'click',
              actionCode: 'c_shaixuan',
              pageid: 10650009862,
              menuid: 3,
              typeid: 0,
              xiangmu: 0,
              filterType: 11,
              filterId: x.filterId,
              filterName: x.filterName,
              districtid: districtId
            })
          })
        }
        if (_SellFilter.length > 0) {
          _SellFilter.forEach((x, i) => {
            _ubt.ubtTrace(100093, {
              actionType: 'click',
              actionCode: 'c_shaixuan',
              pageid: 10650009862,
              menuid: 3,
              typeid: 0,
              xiangmu: 0,
              filterType: 11,
              filterId: x.filterId,
              filterName: x.filterName,
              districtid: districtId
            })
          })
        }
        this.triggerEvent('myevent', positionData)
      })
    },

    _filter4(e) {
      let { index, id } = e.currentTarget.dataset,
        { newFilterName, defaultSort, noMenu1 } = this.data;

      defaultSort.forEach((x, i) => {
        x.current = 0;
      })

      defaultSort[index].current = 1;

      if (noMenu1) {
        newFilterName[2].name = defaultSort[index].Name;
      } else {
        newFilterName[3].name = defaultSort[index].Name;
      }


      this.setData({
        defaultSort: defaultSort,
        newFilterName: newFilterName,
        OrderType: id,
        showFilter4: false,
        isOpenFilter: false,
      }, () => {
        let { OrderType, districtId } = this.data,
          positionData = { OrderType: OrderType, isOpenFilter: false };
        _ubt.ubtTrace(100093, {
          actionType: 'click',
          actionCode: 'c_shaixuan',
          pageid: 10650009862,
          menuid: 4,
          typeid: 0,
          xiangmu: OrderType,
          districtid: districtId
        })
        this.triggerEvent('myevent', positionData)
      })
    },

    _onFilterMenu(e) {
      let { index } = e.currentTarget.dataset,
        { showFilter1, showFilter2, showFilter3, showFilter4, newFilterName, noMenu1 } = this.data;

      newFilterName.forEach((x, i) => {
        x.current = 0;
      })
      newFilterName[index].current = 1;

      if (noMenu1) {
        if (index === 0) {
          this.setData({
            showFilter1: false,
            showFilter2: !showFilter2,
            showFilter3: false,
            showFilter4: false,
            newFilterName: newFilterName,
          }, () => {
            let { showFilter2, showFilter3, showFilter4 } = this.data,
              isOpenFilter = showFilter2 || showFilter3 || showFilter4 ? true : false,
              positionData = { isOpenFilter: isOpenFilter };
            this.setData({
              isOpenFilter: isOpenFilter
            })
            this.triggerEvent('myevent', positionData)
          })
        } else if (index === 1) {
          this.setData({
            showFilter1: false,
            showFilter2: false,
            showFilter3: !showFilter3,
            showFilter4: false,
            newFilterName: newFilterName,
          }, () => {
            let { showFilter2, showFilter3, showFilter4 } = this.data,
              isOpenFilter = showFilter2 || showFilter3 || showFilter4 ? true : false,
              positionData = { isOpenFilter: isOpenFilter };
            this.setData({
              isOpenFilter: isOpenFilter
            })
            this.triggerEvent('myevent', positionData)
          })
        } else if (index === 2) {
          this.setData({
            showFilter1: false,
            showFilter2: false,
            showFilter3: false,
            showFilter4: !showFilter4,
            newFilterName: newFilterName,
          }, () => {
            let { showFilter2, showFilter3, showFilter4 } = this.data,
              isOpenFilter = showFilter2 || showFilter3 || showFilter4 ? true : false,
              positionData = { isOpenFilter: isOpenFilter };
            this.setData({
              isOpenFilter: isOpenFilter
            })
            this.triggerEvent('myevent', positionData)
          })
        }
      } else {

        if (index === 0) {
          this.setData({
            showFilter1: !showFilter1,
            showFilter2: false,
            showFilter3: false,
            showFilter4: false,
            newFilterName: newFilterName,
          }, () => {
            let { showFilter1, showFilter2, showFilter3, showFilter4 } = this.data,
              isOpenFilter = showFilter1 || showFilter2 || showFilter3 || showFilter4 ? true : false,
              positionData = { isOpenFilter: isOpenFilter };
            this.setData({
              isOpenFilter: isOpenFilter
            })
            this.triggerEvent('myevent', positionData)
          })
        } else if (index === 1) {
          this.setData({
            showFilter1: false,
            showFilter2: !showFilter2,
            showFilter3: false,
            showFilter4: false,
            newFilterName: newFilterName,
          }, () => {
            let { showFilter1, showFilter2, showFilter3, showFilter4 } = this.data,
              isOpenFilter = showFilter1 || showFilter2 || showFilter3 || showFilter4 ? true : false,
              positionData = { isOpenFilter: isOpenFilter };
            this.setData({
              isOpenFilter: isOpenFilter
            })
            this.triggerEvent('myevent', positionData)
          })
        } else if (index === 2) {
          this.setData({
            showFilter1: false,
            showFilter2: false,
            showFilter3: !showFilter3,
            showFilter4: false,
            newFilterName: newFilterName,
          }, () => {
            let { showFilter1, showFilter2, showFilter3, showFilter4, ShiMeiLin, PriceSort, SellSort } = this.data,
              isOpenFilter = showFilter1 || showFilter2 || showFilter3 || showFilter4 ? true : false,
              positionData = { isOpenFilter: isOpenFilter };
            let _ShiMeiLin = this.copy(ShiMeiLin, []),
              _PriceSort = this.copy(PriceSort, []),
              _SellSort = this.copy(SellSort, []);

            this.setData({
              isOpenFilter: isOpenFilter,
              _ShiMeiLin: _ShiMeiLin,
              _PriceSort: _PriceSort,
              _SellSort: _SellSort
            })
            this.triggerEvent('myevent', positionData)
          })
        } else if (index === 3) {
          this.setData({
            showFilter1: false,
            showFilter2: false,
            showFilter3: false,
            showFilter4: !showFilter4,
            newFilterName: newFilterName,
          }, () => {
            let { showFilter1, showFilter2, showFilter3, showFilter4 } = this.data,
              isOpenFilter = showFilter1 || showFilter2 || showFilter3 || showFilter4 ? true : false,
              positionData = { isOpenFilter: isOpenFilter };
            this.setData({
              isOpenFilter: isOpenFilter
            })
            this.triggerEvent('myevent', positionData)
          })
        }
      }

    },
    _onMaskView() {
      let { isOpenFilter, _ShiMeiLin, _PriceSort, noMenu1, showFilter2, showFilter3, _SellSort } = this.data;
      if (noMenu1) {
        if (showFilter2) {
          this.setData({
            isOpenFilter: false,
            showFilter1: false,
            showFilter2: false,
            showFilter3: false,
            showFilter4: false,
            isReset: false,
            ShiMeiLin: _ShiMeiLin,
            PriceSort: _PriceSort,
            SellSort: _SellSort
          }, () => {
            let { isOpenFilter } = this.data,
              positionData = { isOpenFilter: isOpenFilter };
            this.triggerEvent('myevent', positionData)
          })
        } else {
          this.setData({
            isOpenFilter: false,
            showFilter1: false,
            showFilter2: false,
            showFilter3: false,
            showFilter4: false,
            isReset: false,
          }, () => {
            let { isOpenFilter } = this.data,
              positionData = { isOpenFilter: isOpenFilter };
            this.triggerEvent('myevent', positionData)
          })
        }
      } else {
        if (showFilter3) {
          this.setData({
            isOpenFilter: false,
            showFilter1: false,
            showFilter2: false,
            showFilter3: false,
            showFilter4: false,
            isReset: false,
            ShiMeiLin: _ShiMeiLin,
            PriceSort: _PriceSort,
            SellSort: _SellSort
          }, () => {
            let { isOpenFilter } = this.data,
              positionData = { isOpenFilter: isOpenFilter };
            this.triggerEvent('myevent', positionData)
          })
        } else {
          this.setData({
            isOpenFilter: false,
            showFilter1: false,
            showFilter2: false,
            showFilter3: false,
            showFilter4: false,
            isReset: false,
          }, () => {
            let { isOpenFilter } = this.data,
              positionData = { isOpenFilter: isOpenFilter };
            this.triggerEvent('myevent', positionData)
          })
        }

      }

      // this.setData({
      //   isOpenFilter: false,
      //   showFilter1: false,
      //   showFilter2: false,
      //   showFilter3: false,
      //   showFilter4: false,
      //   isReset: false,
      //   ShiMeiLin: _ShiMeiLin,
      //   PriceSort: _PriceSort
      // },()=>{
      //   let { isOpenFilter } = this.data,
      //     positionData = { isOpenFilter: isOpenFilter };
      //   this.triggerEvent('myevent', positionData)
      // })
    },

    //深拷贝
    copy(obj1, obj2) {
      var obj2 = obj2 || {}; //最初的时候给它一个初始值=它自己或者是一个json
      for (var name in obj1) {
        if (obj1[name] !== null && typeof obj1[name] === "object") { //先判断一下obj[name]是不是一个对象
          obj2[name] = (obj1[name].constructor === Array) ? [] : {}; //我们让要复制的对象的name项=数组或者是json
          this.copy(obj1[name], obj2[name]); //然后来无限调用函数自己 递归思想
        } else {
          obj2[name] = obj1[name];  //如果不是对象，直接等于即可，不会发生引用。
        }
      }
      return obj2; //然后在把复制好的对象给return出去
    }
  },
})
