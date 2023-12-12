import {
  searchFlightSegment,
  searchAirport
} from '../../sendService.js'

import {
  cwx,
  CPage
} from '../../../../../cwx/cwx.js';

import {
  isSearchConditionValid,
  getFormatTimeForCalendar,
  isFlightNoValid,
  getFormatTimeForShow,
  valicateAirportIsSame,
  HISTORY_SELECTED_AIRPORT_KEY,
  processLongText
} from './biz.js';
let ubt = cwx.sendUbtByPage;

CPage({
  pageId: '10650013767',
  checkPerformance: true,
  data: {
    isSearchedByFlightNo: true,
    lastIsScrollDown: true,
    lastScrollTop: 0,
    scrollLength: 0,
    isFixTop: false,
    isShowTopShadow: false,
    topHeight: 328 / 2 /*rpx*/ ,
    isShowDeleteFlihtNoButton: false,
    isShowDeleteDepartAirportNameButton: false,
    isShowDeleteArriveAirportNameButton: false,
    isFlightNoInputFocus: false,
    isDepartAirportNameInputFocus: false,
    isArriveAirportNameInputFocus: false,
    isDepartDateFoucs: false,
    flightNo: "",
    departDate: "",
    departCityName: '',
    arriveCityName: '',
    departAirportCode: '',
    arriveAirportCode: '',
    isShowSearchNoResult: false,
    isShowLoading: false,
    isShowHistory: false,
    departAirportKeyWord: "",
    departAirportName: "",
    arriveAirportKeyWord: "",
    arriveAirportName: "",
    flightSegmentList: null,
    departAirportList: null,
    arriveAirportList: null,
    flightList: null
  },

  onLoad: function(options) {
    wx.hideShareMenu();
    let localThis = this;
    wx.getSystemInfo({
      success: function(res) {
        localThis.setData({
          topHeight: 328 * (res.screenWidth / 750)
        });
      }
    });
    this.searchByFlightNo();
  },

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
      isFixTop: !this.data.lastIsScrollDown && this.data.scrollLength >= this.data.topHeight,
      isShowTopShadow: res.scrollTop > this.data.topHeight
    });
  },

  searchByFlightNo: function() {
    // console.log("航班号搜索：");
    let initData = this.getInitData();
    initData.isSearchedByFlightNo = true;
    initData.isFlightNoInputFocus = true;
    this.setData(initData);
    ubt.ubtTrace(102324, {
      actionCode: "c_addtrip_search_flightnumber_click",
      actionType: 'click'
    });
  },

  searchByAirportName: function() {
    // console.log("起降地搜索：");
    let initData = this.getInitData();
    initData.isSearchedByFlightNo = false;
    initData.isDepartAirportNameInputFocus = true;
    this.setData(initData);
    ubt.ubtTrace(102324, {
      actionCode: "c_addtrip_search_airport_click",
      actionType: 'click'
    });
  },

  getInitData: function() {
    // console.log("触发初始化数据");
    return {
      isFixTop: false,
      lastIsScrollDown: true,
      lastScrollTop: 0,
      scrollLength: 0,
      isShowTopShadow: false,
      isShowDeleteFlihtNoButton: false,
      isShowDeleteDepartAirportNameButton: false,
      isShowDeleteArriveAirportNameButton: false,
      isFlightNoInputFocus: false,
      isDepartAirportNameInputFocus: false,
      isArriveAirportNameInputFocus: false,
      isDepartDateFoucs: false,
      flightNo: "",
      departDate: "",
      departCityName: '',
      arriveCityName: '',
      departAirportCode: '',
      arriveAirportCode: '',
      isShowSearchNoResult: false,
      isShowLoading: false,
      isShowHistory: false,
      departAirportKeyWord: "",
      departAirportName: "",
      arriveAirportKeyWord: "",
      arriveAirportName: "",
      flightSegmentList: null,
      departAirportList: null,
      arriveAirportList: null,
      flightList: null,
    };
  },

  clearFixTop: function() {
    this.setData({
      lastIsScrollDown: true,
      lastScrollTop: 0,
      scrollLength: 0,
      isFixTop: false,
    });
  },

  inputFlihtNo: function(e) {
    // console.log("航班号搜索：输入航班号");
    if (e.detail.value == this.data.flightNo) {
      return;
    }
    this.setData({
      flightNo: e.detail.value && e.detail.value != null ? e.detail.value.toUpperCase() : "",
      isShowDeleteFlihtNoButton: this.data.isFlightNoInputFocus && e.detail.value.length > 0
    });
    this.trySetFlightSegmentList();
  },

  deleteFlightNo: function() {
    // console.log("航班号搜索：删除航班号");
    this.setData({
      flightNo: "",
      isShowDeleteFlihtNoButton: false,
      isFlightNoInputFocus: true,
      flightSegmentList: null,
      departCityName: '',
      arriveCityName: '',
      departAirportCode: '',
      arriveAirportCode: '',
      isShowSearchNoResult: false,
    });
  },

  focusFlightNo: function() {
    // console.log("航班号搜索：tap聚焦航班号");
    this.setData({
      isFlightNoInputFocus: true,
      isShowDeleteFlihtNoButton: isSearchConditionValid(this.data.flightNo),
    });
    ubt.ubtTrace(102324, {
      actionCode: "c_addtrip_search_flightnumber_input_click",
      actionType: 'click'
    });
  },

  selectCityInfo: function(e) {
    let dataset = e.target.dataset;
    if (dataset == undefined || dataset == null || !isSearchConditionValid(dataset.departcityname)) {
      dataset = e.currentTarget.dataset;
    }

    if (this.data.departCityName == dataset.departcityname &&
      this.data.arriveCityName == dataset.arrivecityname &&
      this.data.departAirportCode == dataset.departairportcode &&
      this.data.arriveAirportCode == dataset.arriveairportcode) {
      this.setData({
        departCityName: "",
        arriveCityName: "",
        departAirportCode: "",
        arriveAirportCode: ""
      });
      ubt.ubtTrace(102324, {
        actionCode: "c_addtrip_search_flightnumber_result_cancel_click",
        actionType: 'click'
      });
      return;
    }

    this.setData({
      departCityName: dataset.departcityname,
      arriveCityName: dataset.arrivecityname,
      departAirportCode: dataset.departairportcode,
      arriveAirportCode: dataset.arriveairportcode,
    });
    ubt.ubtTrace(102324, {
      actionCode: "c_addtrip_search_flightnumber_result_click",
      actionType: 'click'
    });
  },

  trySetFlightSegmentList: function() {
    if (isSearchConditionValid(this.data.flightNo) && isSearchConditionValid(this.data.departDate)) {
      if (!isFlightNoValid(this.data.flightNo)) {
        this.setData({
          isFlightNoInputFocus: true
        });
        return;
      };
      this.setData({
        flightSegmentList: null,
        isShowingLoading: true
      });
      searchFlightSegment(this.data.flightNo, "", "", getFormatTimeForCalendar(this.data.departDate))
        .then(res => {
          let setData = {
            flightSegmentList: res || null,
            isShowSearchNoResult: !res || res == null || res.length == 0
          };
          if (res && res != null && res.length > 0) {
            let firstSegment = res[0];
            setData.departCityName = firstSegment.departCityName;
            setData.arriveCityName = firstSegment.arriveCityName;
            setData.departAirportCode = firstSegment.departAirportCode;
            setData.arriveAirportCode = firstSegment.arriveAirportCode;
          }
          setData.isShowingLoading = false;
          this.setData(setData);
        });
    } else {
      this.setData({
        isShowSearchNoResult: false,
      });
    }
  },

  showCalendar: function() {
    // console.log("航班号搜索：出发日历选择");
    ubt.ubtTrace(102324, {
      actionCode: "c_addtrip_search_departuredate_click",
      actionType: 'click'
    });
    this.setData({
      isFlightNoInputFocus: false,
      isShowDeleteFlihtNoButton: false,
    });
    let currentPage = cwx.getCurrentPage();
    let localThis = this;
    currentPage.navigateTo({
      url: '../../calendar/calendar',
      data: {
        isSingleSelect: true,
        title: "选择日期",
        inDayToast: '请选择出发日期',
        chooseDateActionCode: 'c_addtrip_flight_calendar_date_choose_click',
        confirmActionCode: 'c_addtrip_flight_calendar_date_choose_ok_click',
      },
      callback: function(result) {
        localThis.setData({
          departDate: result.inDay,
        });
        setTimeout(function() {
          if (!isSearchConditionValid(localThis.data.flightNo)) {
            localThis.focusFlightNoInput();
          }
        }, 500)
        localThis.trySetFlightSegmentList();
      }
    });
  },

  inputDepartAirportKeyWord: function(e) {
    // console.log("起降地搜索：输入出发机场");
    if (e.detail.value == this.data.departAirportKeyWord) {
      return;
    }
    if (!e.detail.value || e.detail.value.length == 1) return;
    this.clearFixTop();
    this.setData({
      departAirportKeyWord: e.detail.value,
      isShowDeleteDepartAirportNameButton: this.data.isDepartAirportNameInputFocus && e.detail.value.length > 0,
      departAirportName: "",
      departAirportCode: "",
      departAirportList: null,
      flightList: null,
      isShowSearchNoResult: false,
    });
    if (e.detail.value.length > 0) {
      if (isSearchConditionValid(this.data.departAirportKeyWord)) {
        searchAirport(this.data.departAirportKeyWord)
          .then(res => {
            this.setData({
              departAirportList: res || null,
              isShowHistory: false
            });
          });
      } else {
        this.setData({
          departAirportList: null,
          isShowHistory: false
        });
      }
    } else {
      this.setData({
        isShowHistory: true
      });
    }
    this.trySetFlightList();
  },

  inputArriveAirportKeyWord: function(e) {
    // console.log("起降地搜索：输入到达机场");
    if (!e.detail.value || e.detail.value.length == 1) return;
    if (e.detail.value == this.data.arriveAirportKeyWord) {
      return;
    }
    this.clearFixTop();
    this.setData({
      arriveAirportKeyWord: e.detail.value,
      isShowDeleteArriveAirportNameButton: this.data.isArriveAirportNameInputFocus && e.detail.value.length > 0,
      arriveAirportName: "",
      arriveAirportCode: "",
      arriveAirportList: null,
      flightList: null,
      isShowSearchNoResult: false,
    });
    if (e.detail.value.length > 0) {
      if (isSearchConditionValid(this.data.arriveAirportKeyWord)) {
        searchAirport(this.data.arriveAirportKeyWord).then(res => {
          this.setData({
            arriveAirportList: res || null,
            isShowHistory: false
          });
        });
      } else {
        this.setData({
          arriveAirportList: null,
          isShowHistory: false
        });
      }
    } else {
      this.setData({
        isShowHistory: true
      });
    }
    this.trySetFlightList();
  },

  deleteDepartAirportName: function() {
    // console.log("起降地搜索：删除出发机场");
    this.setData({
      departAirportKeyWord: "",
      departAirportName: "",
      isShowDeleteDepartAirportNameButton: false,
      departAirportCode: "",
      departAirportList: null,
      flightList: null,
      isShowHistory: true,
      isDepartAirportNameInputFocus: true,
      isArriveAirportNameInputFocus: false,
      isFixTop: false,
      isShowSearchNoResult: false
    });
    this.clearFixTop();
  },

  deleteArriveAirportName: function() {
    // console.log("起降地搜索：删除到达机场");
    this.setData({
      arriveAirportName: "",
      isShowDeleteArriveAirportNameButton: false,
      arriveAirportKeyWord: "",
      arriveAirportCode: "",
      arriveAirportList: null,
      flightList: null,
      isShowHistory: true,
      isArriveAirportNameInputFocus: true,
      isDepartAirportNameInputFocus: false,
      isFixTop: false,
      isShowSearchNoResult: false
    });
    this.clearFixTop();
  },

  focusDepartAirportName: function() {
    // console.log("起降地搜索：tap聚焦出发机场");
    this.setData({
      isDepartAirportNameInputFocus: true,
      isArriveAirportNameInputFocus: false,
      isDepartDateFoucs: false,
      isShowHistory: !this.data.departAirportKeyWord || this.data.departAirportKeyWord == null || this.data.departAirportKeyWord == "",
      isShowDeleteArriveAirportNameButton: false,
      isShowDeleteDepartAirportNameButton: isSearchConditionValid(this.data.departAirportKeyWord)
    });
    ubt.ubtTrace(102324, {
      actionCode: "c_addtrip_search_airportfordeparture_click",
      actionType: 'click'
    });
  },

  focusArriveAirportName: function() {
    // console.log("起降地搜索：tap聚焦到达机场");
    this.setData({
      isArriveAirportNameInputFocus: true,
      isDepartAirportNameInputFocus: false,
      isDepartDateFoucs: false,
      isShowHistory: !this.data.arriveAirportKeyWord || this.data.arriveAirportKeyWord == null || this.data.arriveAirportKeyWord == "",
      isShowDeleteDepartAirportNameButton: false,
      isShowDeleteArriveAirportNameButton: isSearchConditionValid(this.data.arriveAirportKeyWord)
    });
    ubt.ubtTrace(102324, {
      actionCode: "c_addtrip_search_airportforarrival_click",
      actionType: 'click'
    });
  },

  selectDepartAirportInfo: function(e) {
    if (valicateAirportIsSame(e.target.dataset.departairportcode, this.data.arriveAirportCode)) {
      this.showAirportSameToast();
      return;
    }
    this.setData({
      departAirportKeyWord: e.target.dataset.departairportname,
      departAirportName: e.target.dataset.departairportname,
      departAirportCode: e.target.dataset.departairportcode,
      departAirportList: null,
      isShowHistory: false,
      isShowDeleteDepartAirportNameButton: true,
      isShowDeleteArriveAirportNameButton: false
    });
    this.setLocalStorage(e.target.dataset.departairportname, e.target.dataset.departairportcode);
    this.resetFocus();
    this.trySetFlightList();
    ubt.ubtTrace(102324, {
      actionCode: "c_addtrip_search_airportfordeparture_result_click",
      actionType: 'click'
    });
  },

  selectArriveAirportInfo: function(e) {
    if (valicateAirportIsSame(this.data.departAirportCode, e.target.dataset.arriveairportcode)) {
      this.showAirportSameToast();
      return;
    }
    this.setData({
      arriveAirportKeyWord: e.target.dataset.arriveairportname,
      arriveAirportName: e.target.dataset.arriveairportname,
      arriveAirportCode: e.target.dataset.arriveairportcode,
      arriveAirportList: null,
      isShowHistory: false,
      isShowDeleteArriveAirportNameButton: true,
      isShowDeleteDepartAirportNameButton: false
    });
    this.setLocalStorage(e.target.dataset.arriveairportname, e.target.dataset.arriveairportcode);
    this.resetFocus();
    this.trySetFlightList();
    ubt.ubtTrace(102324, {
      actionCode: "c_addtrip_search_airportforarrival_result_click",
      actionType: 'click'
    });
  },

  showCalendarSearchedByAirportName: function() {
    // console.log("起降地搜索：触发日历选择");
    ubt.ubtTrace(102324, {
      actionCode: "c_addtrip_search_departuredate_click",
      actionType: 'click'
    });
    this.setData({
      isArriveAirportNameInputFocus: false,
      isDepartAirportNameInputFocus: false,
      isShowDeleteArriveAirportNameButton: false,
      isShowDeleteDepartAirportNameButton: false
    });
    let currentPage = cwx.getCurrentPage();
    let localThis = this;
    currentPage.navigateTo({
      url: '../../calendar/calendar',
      data: {
        isSingleSelect: true,
        title: "选择日期",
        inDayToast: '请选择出发日期',
        chooseDateActionCode: 'c_addtrip_flight_calendar_date_choose_click',
        confirmActionCode: 'c_addtrip_flight_calendar_date_choose_ok_click',
      },
      callback: function(result) {
        localThis.setData({
          departDate: result.inDay
        });
        setTimeout(function() {
          localThis.resetFocus();
        }, 500);
        localThis.trySetFlightList();
      }
    });
  },

  selectFlightNo: function(e) {
    if (this.data.flightNo == e.currentTarget.dataset.flightno) {
      this.setData({
        flightNo: ''
      });
      ubt.ubtTrace(102324, {
        actionCode: "c_addtrip_search_flightupdown_result_cancel_click",
        actionType: 'click'
      });
      return;
    }
    this.setData({
      flightNo: e.currentTarget.dataset.flightno
    });
    ubt.ubtTrace(102324, {
      actionCode: "c_addtrip_search_flightupdown_result_click",
      actionType: 'click'
    });
  },

  isShowHistory: function() {
    let localThis = this;
    wx.getStorage({
      key: HISTORY_SELECTED_AIRPORT_KEY,
      success(res) {
        if (!res || !res.data || res.data.length <= 0) {
          localThis.setData({
            isShowHistory: false
          });
        } else {
          localThis.setData({
            isShowHistory: true
          });
        }
      },
      fail(res) {
        localThis.setData({
          isShowHistory: false
        });
      }
    });
  },

  selectHistoryAirport: function(e) {
    if (this.data.isDepartAirportNameInputFocus) {
      if (valicateAirportIsSame(e.detail.airportCode, this.data.arriveAirportCode)) {
        this.showAirportSameToast();
        return;
      }
      this.setData({
        departAirportKeyWord: e.detail.airportName,
        departAirportName: e.detail.airportName,
        departAirportCode: e.detail.airportCode,
        departAirportList: null,
        isShowHistory: false,
        isShowDeleteDepartAirportNameButton: true
      });
      this.tryUpdateLocalStorage(e.detail.index);
      this.resetFocus();
      this.trySetFlightList();
    } else if (this.data.isArriveAirportNameInputFocus) {
      if (valicateAirportIsSame(this.data.departAirportCode, e.detail.airportCode)) {
        this.showAirportSameToast();
        return;
      }
      this.setData({
        arriveAirportKeyWord: e.detail.airportName,
        arriveAirportName: e.detail.airportName,
        arriveAirportCode: e.detail.airportCode,
        arriveAirportList: null,
        isShowHistory: false,
        isShowDeleteArriveAirportNameButton: true
      });
      this.tryUpdateLocalStorage(e.detail.index);
      this.resetFocus();
      this.trySetFlightList();
    }
    ubt.ubtTrace(102324, {
      actionCode: "c_addtrip_search_flight_history_click",
      actionType: 'click'
    });
  },

  switchSelectedAirport: function() {
    let airportKeyWord = this.data.departAirportKeyWord;
    let airportName = this.data.departAirportName;
    let airportCode = this.data.departAirportCode;
    let airportList = this.data.departAirportList;
    this.setData({
      departAirportKeyWord: this.data.arriveAirportKeyWord,
      departAirportName: this.data.arriveAirportName,
      departAirportCode: this.data.arriveAirportCode,
      departAirportList: this.data.arriveAirportList,
      arriveAirportKeyWord: airportKeyWord,
      arriveAirportName: airportName,
      arriveAirportCode: airportCode,
      arriveAirportList: airportList,
      flightList: null,
      isShowLoading: false,
      isShowSearchNoResult: false
    });
    this.trySetFlightList();
  },

  setLocalStorage: function(airportName, airportCode) {
    wx.getStorage({
      key: HISTORY_SELECTED_AIRPORT_KEY,
      success(res) {
        if (!res || !res.data || res.data.length <= 0) {
          return;
        }
        let isInHistory = false;
        let deleteItemIndex;
        for (let i = 0; i < res.data.length; i++) {
          if (res.data[i].code == airportCode) {
            isInHistory = true;
            deleteItemIndex = i;
            break;
          }
        }

        let historyAirportList = res.data;
        if (isInHistory) {
          historyAirportList.splice(deleteItemIndex, 1);
        }
        historyAirportList.unshift({
          name: airportName,
          code: airportCode
        });
        if (historyAirportList.length > 6) {
          historyAirportList = historyAirportList.slice(0, 6)
        }
        wx.setStorage({
          key: HISTORY_SELECTED_AIRPORT_KEY,
          data: historyAirportList
        });
      },
      fail(res) {
        wx.setStorage({
          key: HISTORY_SELECTED_AIRPORT_KEY,
          data: [{
            name: airportName,
            code: airportCode
          }]
        });
      }
    });
  },

  showAirportSameToast: function() {
    wx.showToast({
      icon: "none",
      title: '出发机场和到达机场不能相同，请重新选择',
    });
  },

  trySetFlightList: function() {
    if (isSearchConditionValid(this.data.departAirportCode) &&
      isSearchConditionValid(this.data.arriveAirportCode) &&
      isSearchConditionValid(this.data.departDate)) {
      this.setData({
        flightList: null,
        isShowLoading: true
      });
      searchFlightSegment(
          "",
          this.data.departAirportCode,
          this.data.arriveAirportCode,
          getFormatTimeForCalendar(this.data.departDate))
        .then(res => {
          if (res && res != null && res.length > 0) {
            for (let i = 0; i < res.length; i++) {
              res[i].formattedDepartDate = getFormatTimeForShow(res[i].departDate);
              res[i].formattedArriveDate = getFormatTimeForShow(res[i].arriveDate);
              if (res[i].airlineName == undefined || res[i].airlineName == null) {
                res[i].airlineName = "";
              }
              let isNeedProcess = res[i].airlineName.length > 5 || res[i].departAirportShortName.length > 5 || res[i].arriveAirportShortName.length > 5;
              if (!isNeedProcess) {
                continue;
              }
              res[i].airlineName = processLongText(res[i].airlineName);
              res[i].departAirportShortName = processLongText(res[i].departAirportShortName);
              res[i].arriveAirportShortName = processLongText(res[i].arriveAirportShortName);
            }
          }
          if (this.data.isFixTop) {
            wx.pageScrollTo({
              scrollTop: 0,
              duration: 0
            });
          }
          this.clearFixTop();
          this.setData({
            flightList: res || null,
            isShowHistory: false,
            isShowSearchNoResult: !res || res == null || res.length == 0,
            isShowLoading: false,
            isFixTop: false,
            isDepartDateFoucs: false,
            isDepartAirportNameInputFocus: false,
            isArriveAirportNameInputFocus: false,
          });
        });
    }
  },

  tryUpdateLocalStorage: function(selectIndex) {
    if (selectIndex <= 0 || selectIndex > 5) {
      return;
    }
    wx.getStorage({
      key: HISTORY_SELECTED_AIRPORT_KEY,
      success(res) {
        if (!res || !res.data || res.data.length <= 0 || selectIndex > (res.data.length - 1)) {
          return;
        }

        let historyAirportList = res.data;
        let deleteItem = historyAirportList.splice(selectIndex, 1);
        historyAirportList.unshift({
          name: deleteItem[0].name,
          code: deleteItem[0].code
        });
        wx.setStorage({
          key: HISTORY_SELECTED_AIRPORT_KEY,
          data: historyAirportList
        });
      }
    });
  },

  resetFocus: function() {
    if (!isSearchConditionValid(this.data.departAirportCode)) {
      this.focusDepartAirportNameInput();
    } else if (!isSearchConditionValid(this.data.arriveAirportCode)) {
      this.focusArriveAirportNameInput();
    } else if (!isSearchConditionValid(this.data.departDate)) {
      this.setData({
        isDepartDateFoucs: true,
        isDepartAirportNameInputFocus: false,
        isArriveAirportNameInputFocus: false,
      });
    }
  },

  focusFlightNoInput: function() {
    // console.log("航班号搜索：聚焦航班号");
    this.setData({
      isFlightNoInputFocus: true,
      isShowDeleteFlihtNoButton: isSearchConditionValid(this.data.flightNo),
    });
  },

  focusDepartAirportNameInput: function() {
    // console.log("起降地搜索：聚焦出发机场");
    this.setData({
      isDepartAirportNameInputFocus: true,
      isArriveAirportNameInputFocus: false,
      isDepartDateFoucs: false,
      isShowHistory: !this.data.departAirportKeyWord || this.data.departAirportKeyWord == null || this.data.departAirportKeyWord == "",
      isShowDeleteArriveAirportNameButton: false,
      isShowDeleteDepartAirportNameButton: isSearchConditionValid(this.data.departAirportKeyWord)
    });
  },

  focusArriveAirportNameInput: function() {
    // console.log("起降地搜索：聚焦到达机场");
    this.setData({
      isArriveAirportNameInputFocus: true,
      isDepartAirportNameInputFocus: false,
      isDepartDateFoucs: false,
      isShowHistory: !this.data.arriveAirportKeyWord || this.data.arriveAirportKeyWord == null || this.data.arriveAirportKeyWord == "",
      isShowDeleteDepartAirportNameButton: false,
      isShowDeleteArriveAirportNameButton: isSearchConditionValid(this.data.arriveAirportKeyWord)
    });
  },
})