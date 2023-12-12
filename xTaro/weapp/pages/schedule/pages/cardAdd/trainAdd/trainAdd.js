import {
  cwx,
  CPage
} from '../../../../../cwx/cwx.js';

import {
  searchTrainStation,
  trainSearch,
  addTrainCard
} from '../../sendService.js'

import {
  getStationNameList,
  getTrainList,
  getGtTrainList,
  getFormatTimeForDateBox,
  getFormatTimeForAddService,
  getFormatTimeForAddSuccss,
  getToday,
  getEndDate
} from './biz.js';

cwx.config.init();

CPage({
  pageId: "10650013768",
  checkPerformance: true,
  locationInfo: {
    cityID: 0
  },

  /**
   * 页面的初始数据
   */
  data: {
    departBoxSelected: true, //出发框选中
    arrivalBoxSelected: false, //到达框选中
    dateBoxSelected: false, //日期选择框选中
    departStation: null,
    arrivalStation: null,
    trainLoading: false,
    reloadTrain: false,
    trainSearched: false, //已经搜索出车次列表
    stationSearched: false, //已经搜索车站列表
    departDateDisplay: null,
    departDate: null,
    gtChecked: false, //高铁动车选择
    trains: null, //UI显示的车次列表
    stations: null, //UI显示的车站列表
    selectedTrain: null, //选中的车次号
    trainAdding: false,
    today: getToday(),
    endDate: getEndDate(),

    locateCity: null,
    historyCities: [],
    hotCities: [
      ['北京', '上海', '杭州'],
      ['广州', '南京', '成都'],
      ['西安', '郑州', '重庆']
    ],
    cardData: null,

    stationScrollViewHeight: 400, //默认400px

    lastIsScrollDown: true,
    lastScrollTop: 0,
    scrollLength: 0,
    isFixTop: false,
    isShowTopShadow: false
  },

  _trains: null, //搜索到的车次列表
  _searchHistoryKey: cwx.cwx_mkt.openid + '_station_history',
  _rpxRatio: 0.5, //默认值
  _inputBoxHeight: 162, //默认值162px

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let self = this;

    self.setData({
      locateCity: cwx.schedule.g_locationCity
    });

    wx.getStorage({
      key: this._searchHistoryKey,
      success: function(res) {
        self.setData({
          historyCities: res.data
        })
      }
    });

    wx.getSystemInfo({
      success: function(res) {
        let rpxRatio = res.screenWidth / 750;
        let scrollHeight = res.windowHeight - (224 /*inputBox height rpx*/ + 50 /*空白rpx*/ ) * rpxRatio;
        self._inputBoxHeight = 224 * rpxRatio;
        self._rpxRatio = rpxRatio;
        self.setData({
          stationScrollViewHeight: scrollHeight
        });
      }
    });

    // getHotCityList(6)
    //   .then(res => {
    //       self.setData({
    //         hotCities: getHotCityNameList(res)
    //       });
    //     },
    //     rej => {
    //       console.log('>>getHotCityList service error', rej);
    //     });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  // /**
  //  * 用户点击右上角分享
  //  */
  // onShareAppMessage: function() {

  // },

  onPageScroll: function(res) {
    let scrollDistance = res.scrollTop - this.data.lastScrollTop;
    if (scrollDistance >= 0) {
      if (this.data.lastIsScrollDown) {
        this.data.scrollLength += scrollDistance;
      } else {
        this.data.scrollLength = 0;
        this.data.scrollLength = scrollDistance;
      }
      this.data.lastIsScrollDown = true;
    } else {
      if (this.data.lastIsScrollDown) {
        this.data.scrollLength = 0;
        this.data.scrollLength = Math.abs(scrollDistance);
      } else {
        this.data.scrollLength += Math.abs(scrollDistance);
      }
      this.data.lastIsScrollDown = false;
    }
    this.data.lastScrollTop = res.scrollTop;
    this.setData({
      isFixTop: !this.data.lastIsScrollDown && this.data.scrollLength >= 80,
      isShowTopShadow: res.scrollTop > this._inputBoxHeight
    });
  },

  /**
   * 点击出发输入框
   */
  bindInputLeftTap: function(e) {
    console.log('>>depart input tap');

    this.ubtTrace(102325, {
      actionCode: 'c_addtrip_search_stationfordeparture_click',
      actionType: 'click'
    });

    if (this.data.departBoxSelected) {
      return;
    }
    this.setData({
      departBoxSelected: true,
      arrivalBoxSelected: false,
      dateBoxSelected: false,
      stationSearched: false,
      trainSearched: false,
      isFixTop: false,
      reloadTrain: false,
      selectedTrain: null,
      stations: null
    });
    if (this.data.departStation && !this.data.trainLoading) {
      searchTrainStation(this.data.departStation)
        .then(res => {
          this.setData({
            isFixTop: false,
            stationSearched: true,
            stations: getStationNameList(res)
          });
        });
    }
  },

  /**
   * 点击到达输入框
   */
  bindInputRightTap: function(e) {
    console.log('>>arrival input tap');

    this.ubtTrace(102325, {
      actionCode: 'c_addtrip_search_stationforarrival_result_click',
      actionType: 'click'
    });

    if (this.data.arrivalBoxSelected) {
      return;
    }
    this.setData({
      departBoxSelected: false,
      arrivalBoxSelected: true,
      dateBoxSelected: false,
      stationSearched: false,
      trainSearched: false,
      isFixTop: false,
      reloadTrain: false,
      selectedTrain: null,
      stations: null
    });
    if (this.data.arrivalStation && !this.data.trainLoading) {
      searchTrainStation(this.data.arrivalStation)
        .then(res => {
          this.setData({
            isFixTop: false,
            stationSearched: true,
            stations: getStationNameList(res)
          });
        });
    }
  },

  /**
   * 输入框获取焦点
   */
  bindInputFocus: function(e) {
    console.log('>>foucus', e.currentTarget.dataset.name);
  },

  /**
   * 输入框输入
   */
  bindKeyInput: function(e) {
    console.log(">>input:", e.detail.value);
    let keyword = e.detail.value;
    if (!keyword || keyword.length == 1) return;
    if (keyword && keyword.charAt(keyword.length - 1) === ' ') {
      return keyword.substring(0, keyword.length - 1);
    }

    if (this.data.departBoxSelected) {
      if (keyword == this.data.departStation) {
        return;
      }
      this.setData({
        departStation: keyword,
        selectedTrain: null,
        trainSearched: false,
        stationSearched: false,
        stations: null
      });
    } else if (this.data.arrivalBoxSelected) {
      if (keyword == this.data.arrivalStation) {
        return;
      }
      this.setData({
        arrivalStation: keyword,
        selectedTrain: null,
        trainSearched: false,
        stationSearched: false,
        stations: null
      });
    }

    if (keyword) {
      searchTrainStation(keyword)
        .then(res => {
          this.setData({
            stationSearched: true,
            stations: getStationNameList(res)
          });
        });
    }
  },

  /**
   * 清除输入
   */
  cleanIconTap: function(e) {
    if (e.currentTarget.dataset.name === 'depart') {
      this.setData({
        trainLoading: false,
        reloadTrain: false,
        trainSearched: false,
        stationSearched: false,
        isFixTop: false,
        departStation: null
      });
    } else {
      this.setData({
        trainLoading: false,
        reloadTrain: false,
        trainSearched: false,
        stationSearched: false,
        isFixTop: false,
        arrivalStation: null
      });
    }
  },

  /**
   * 点击交换
   */
  bindReversalTap: function(e) {
    let dstation = this.data.arrivalStation;
    let astation = this.data.departStation;
    if (dstation == astation) {
      if (this.data.dateBoxSelected) {
        this.setData({
          dateBoxSelected: false
        });
      }
      return;
    }

    this.setData({
      departBoxSelected: false,
      arrivalBoxSelected: false,
      dateBoxSelected: false,
      departStation: dstation,
      arrivalStation: astation,
      stationSearched: false,
      trainSearched: false,
      trainLoading: false,
      isFixTop: false,
      selectedTrain: null,
      reloadTrain: false,
      trains: null
    });

    if (this._canSearchTrain()) {
      this.setData({
        trainLoading: true
      });

      trainSearch(dstation, astation, this.data.departDate)
        .then(res => {
            this._trains = getTrainList(res);
            let trains = this._trains;
            if (this.data.gtChecked) {
              trains = getGtTrainList(trains);
            }
            this.setData({
              trainSearched: true,
              trainLoading: false,
              trains: trains
            });
          },
          rej => {
            this.setData({
              trainLoading: false,
              reloadTrain: true
            });
          });
    }
  },

  /**
   * 点击日期选择框
   */
  showCalendar: function() {
    this.ubtTrace(102325, {
      actionCode: 'c_addtrip_search_departuredate_click',
      actionType: 'click'
    });

    this.setData({
      departBoxSelected: false,
      arrivalBoxSelected: false,
      dateBoxSelected: true,
      stationSearched: false,
      isFixTop: false
    });
    let currentPage = cwx.getCurrentPage();
    let localThis = this;
    currentPage.navigateTo({
      url: '../../calendar/calendar',
      data: {
        isSingleSelect: true,
        title: "选择日期",
        inDayToast: '请选择出发日期',
        confirmActionCode: 'c_addtrip_train_calendar_date_choose_ok_click',
        chooseDateActionCode: 'c_addtrip_train_calendar_date_choose_click'
      },
      callback: function(e) {
        let date = e.inDay;

        localThis.setData({
          departDateDisplay: getFormatTimeForDateBox(date),
          departDate: getFormatTimeForAddService(date),
          dateBoxSelected: false,
          trains: null,
          selectedTrain: null,
          trainSearched: false,
          trainLoading: false,
          stationSearched: false,
          reloadTrain: false
        });

        if (localThis._canSearchTrain()) {
          localThis.setData({
            trainLoading: true
          });

          trainSearch(localThis.data.departStation, localThis.data.arrivalStation, localThis.data.departDate)
            .then(res => {
                localThis._trains = getTrainList(res);
                let trains = localThis._trains;
                if (localThis.data.gtChecked) {
                  trains = getGtTrainList(trains);
                }
                localThis.setData({
                  trains: trains,
                  trainSearched: true,
                  trainLoading: false
                });
              },
              rej => {
                localThis.setData({
                  trainLoading: false,
                  reloadTrain: true
                });
              });
        } else {
          setTimeout(() => {
            let arrivalBoxSelect = false;
            let departBoxSelect = false;
            if (!localThis.data.departStation) {
              departBoxSelect = true;
            } else if (!localThis.data.arrivalStation) {
              arrivalBoxSelect = true;
            }
            if (arrivalBoxSelect || departBoxSelect) {
              localThis.setData({
                departBoxSelected: departBoxSelect,
                arrivalBoxSelected: arrivalBoxSelect
              });
            }
          }, 200)
        }
      }
    });
  },

  /**
   * 选择高铁动车
   */
  gtCheckBoxChange: function(e) {
    this.ubtTrace(102325, {
      actionCode: 'c_addtrip_train_highspeed_choose_click',
      actionType: 'click'
    });

    let checked = !this.data.gtChecked;
    let trains = this._trains;
    if (checked) {
      trains = getGtTrainList(trains);
    }

    this.setData({
      gtChecked: checked,
      trains: trains,
      selectedTrain: null,
      departBoxSelected: false,
      arrivalBoxSelected: false,
      dateBoxSelected: false,
      stationSearched: false
    });
  },

  /**
   * 点击城市
   */
  bindCityTap: function(e) {
    let source = e.currentTarget.dataset.type;
    if (source == 'locate') {
      this.ubtTrace(102325, {
        actionCode: 'c_addtrip_search_train_locationcity_click',
        actionType: 'click'
      });
    } else if (source == 'history') {
      this.ubtTrace(102325, {
        actionCode: 'c_addtrip_search_train_history_click',
        actionType: 'click'
      });
    } else if (source == 'hot') {
      this.ubtTrace(102325, {
        actionCode: 'c_addtrip_search_train_recommend_click',
        actionType: 'click'
      });
    } else if (source == 'search') {
      if (this.data.departBoxSelected) {
        this.ubtTrace(102325, {
          actionCode: 'c_addtrip_search_stationfordeparture_result_click',
          actionType: 'click'
        });
      } else {
        this.ubtTrace(102325, {
          actionCode: 'c_addtrip_search_stationforarrival_result_click',
          actionType: 'click'
        });
      }
    }

    let city = e.currentTarget.dataset.city;
    let history = this._updateHistoryCache(city);

    if (this.data.departBoxSelected) {
      if (city == this.data.arrivalStation) {
        this._showStationSameToast();
        return;
      }
      let arrivalBoxSelect = false;
      let dateBoxSelect = false;
      if (!this.data.arrivalStation) {
        arrivalBoxSelect = true;
      } else if (!this.data.departDate) {
        dateBoxSelect = true;
      }
      this.setData({
        departStation: city,
        stationSearched: false,
        trainSearched: false,
        departBoxSelected: false,
        arrivalBoxSelected: arrivalBoxSelect,
        dateBoxSelected: dateBoxSelect,
        historyCities: history
      });
    } else if (this.data.arrivalBoxSelected) {
      if (city == this.data.departStation) {
        this._showStationSameToast();
        return;
      }
      let departBoxSelect = false;
      let dateBoxSelect = false;
      if (!this.data.departStation) {
        departBoxSelect = true;
      } else if (!this.data.departDate) {
        dateBoxSelect = true;
      }
      this.setData({
        arrivalStation: city,
        stationSearched: false,
        trainSearched: false,
        departBoxSelected: departBoxSelect,
        arrivalBoxSelected: false,
        dateBoxSelected: dateBoxSelect,
        historyCities: history
      });
    }

    if (this._canSearchTrain()) {
      this.setData({
        departBoxSelected: false,
        arrivalBoxSelected: false,
        trainLoading: true,
        trainSearched: false,
        reloadTrain: false,
        stationSearched: false,
        selectedTrain: null
      });

      trainSearch(this.data.departStation, this.data.arrivalStation, this.data.departDate)
        .then(res => {
            this._trains = getTrainList(res);
            let trains = this._trains;
            if (this.data.gtChecked) {
              trains = getGtTrainList(trains);
            }
            this.setData({
              trainSearched: true,
              trainLoading: false,
              trains: trains
            });
          },
          rej => {
            this.setData({
              trainLoading: false,
              reloadTrain: true
            });
          });
    }
  },

  /**
   * 点击车次
   */
  trainClicked: function(e) {
    if (e.currentTarget.dataset.trainname === this.data.selectedTrain) {
      this.ubtTrace(102325, {
        actionCode: 'c_addtrip_search_train_result_cancel_click',
        actionType: 'click'
      });

      this.setData({
        selectedTrain: null
      });
    } else {
      this.ubtTrace(102325, {
        actionCode: 'c_addtrip_search_train_result_click',
        actionType: 'click'
      });

      this.setData({
        selectedTrain: e.currentTarget.dataset.trainname
      });
    }
  },

  /**
   * 重新加载
   */
  bindReloadTap: function(e) {
    if (this._canSearchTrain()) {
      this.setData({
        departBoxSelected: false,
        arrivalBoxSelected: false,
        trainLoading: true,
        trainSearched: false,
        reloadTrain: false,
        stationSearched: false,
        selectedTrain: null,
      });

      trainSearch(this.data.departStation, this.data.arrivalStation, this.data.departDate)
        .then(res => {
            this._trains = getTrainList(res);
            let trains = this._trains;
            if (this.data.gtChecked) {
              trains = getGtTrainList(trains);
            }
            this.setData({
              trainSearched: true,
              trainLoading: false,
              trains: trains
            });
          },
          rej => {
            this.setData({
              trainLoading: false,
              reloadTrain: true
            });
          });
    }
  },

  /**
   * 点击添加按钮
   */
  bindAddTap: function(e) {
    if (!this.data.selectedTrain || !this.data.departDate || !this._trains) {
      return;
    }
    let train = this._trains.find(item => item.trainName == this.data.selectedTrain);
    if (!train) {
      return;
    }

    this.setData({
      trainAdding: true
    });

    let promise = addTrainCard(
      train.trainName,
      train.departureStationName,
      train.arrivalStationName,
      this.data.departDate
    );
    promise.then(res => {
      this.ubtTrace(102325, {
        actionCode: 'c_addtrip_train_add',
        actionType: 'click'
      });

      this.setData({
        cardData: {
          dateText: getFormatTimeForAddSuccss(this.data.departDate),
          smartTripId: res
        },
        selectedTrain: null,
        trainAdding: false
      });
      cwx.reLaunch({
        url: '/pages/schedule/index/index?smartTripId=' + this.data.cardData.smartTripId
      })
    }).catch(error => {
      this.setData({
        trainAdding: false
      });
      if (error && error.resultMessage) {
        wx.showToast({
          icon: "none",
          title: error.resultMessage,
        })
      } else {
        wx.showToast({
          icon: "none",
          title: '添加失败',
        })
      }
    });
  },

  _canSearchTrain: function() {
    return this.data.departStation &&
      this.data.arrivalStation &&
      this.data.departDate &&
      this.data.departStation != this.data.arrivalStation;
  },

  _updateHistoryCache: function(city) {
    let history = this.data.historyCities;
    if (!history) {
      history = [];
    }
    let index = history.findIndex(item => item === city);
    const LIMIT = 3;
    if (index == -1) {
      if (history.length >= LIMIT) {
        for (let i = history.length - 1; i > 0; i--) {
          history[i] = history[i - 1];
        }
        history[0] = city;
      } else {
        history.push(history[history.length - 1]);
        for (let i = history.length - 2; i > 0; i--) {
          history[i] = history[i - 1];
        }
        history[0] = city;
      }
    } else {
      for (let i = index; i > 0; i--) {
        history[i] = history[i - 1];
      }
      history[0] = city;
    }

    wx.setStorage({
      key: this._searchHistoryKey,
      data: history
    });

    return history;
  },

  _showStationSameToast: function() {
    wx.showToast({
      icon: "none",
      title: '出发车站和到达车站不能相同，请重新选择',
    });
  },

  logStatus: function(place) {
    console.log("<<---" + place + "--->>");
    console.log("  isFixTop", this.data.isFixTop);
    console.log("  departBoxSelected", this.data.departBoxSelected);
    console.log("  arrivalBoxSelected", this.data.arrivalBoxSelected);
    console.log("  trainLoading", this.data.trainLoading);
    console.log("  trainSearched", this.data.trainSearched);
    console.log("  stationSearched", this.data.stationSearched);
    console.log("  reloadTrain", this.data.reloadTrain);
    console.log("  canSearchTrain", this._canSearchTrain());
    console.log("------------");
  }

})