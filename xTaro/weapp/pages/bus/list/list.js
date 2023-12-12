import {
  cwx,
  CPage,
  Pservice,
  URLUtil,
  BusRouter,
  BusShared,
  BusDetail,
  Utils,
  cDate,
  BusConfig,
  __global,
} from '../index.js';

import CustomModal from '../common/template/CustomModal';

import BusPage from '../common/extend';
import { getBusTagName } from '../commons/utils/getBusTagName.js';

var systemInfo = wx.getSystemInfoSync();
var screenHeight = systemInfo.screenHeight;

var pageData = {
  pageId: '10320614136',
  customStyle: 'custom',
  mockData: null,
  mockFiltered: [],
  mockList: [],
  pagedList: [],
  extraInfo: {},
  pageSize: 20,
  listLength: 0,
  _currentPage: 0,
  _DAY1: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  data: {
    inLoading: true,
    timePeroid: ['00:00-06:00', '06:00-12:00', '12:00-18:00', '18:00-24:00'],
    scopeData: {},
    minDateNum: new Date().format('yyyyMMdd') * 1,
    maxDateNum: new Date().addDays(60).format('yyyyMMdd') * 1,
    curDateNum: 0,
    date: '',
    message: '',
    list: [],
    recommendA: [],
    anotherDates: [],
    showDate: '',
    displayDate: '',
    notes: {},
    isPrev: true,
    isNext: true,
    loadMsg: '',
    modalContent: '',
    fromStationList: [],
    toStationList: [],
    showMask: false,
    filterType: 'from',
    selectFromList: [],
    selectToList: [],
    selectTimeList: [],
    pageEnd: false,
    pageFrame: [],
    renderLottery: false,
    busNoticeData: {},
    showBusNoticeModal: false,
    hasBusNotice: false,
    fromSchemeData: {
      isFromScheme: false,
    },
    newUserCoupon: {},
    expandPage: -1,
    expandIndex: -1,
    expandXList: [],
    selectedExpandTab: 0,
    selectedExpandItem: undefined,
    isShowUnableList: true,
    showInsuranceModal: false,
    xModalInfo: {},
    insuranceText: '',
  },
  onShareAppMessage: function () {
    var from = this.loadInfo.fromCity,
      to = this.loadInfo.toCity;
    return {
      title: from + '到' + to + '汽车票【携程汽车票】',
      desc:
        '携程为您提供' +
        from +
        '到' +
        to +
        '汽车票网上预订订票服务，汽车票余票查询，汽车票票价，预订长途汽车票。',
      path: '/pages/bus/list/list?fromCity=' + from + '&toCity=' + to,
    };
  },

  hasPromised: false,

  onLoad: function (options) {
    if (options.utmSource === 'h5Scheme') {
      let aid = options.allianceid;
      let sid = options.sid;
      this.schemeToH5(aid, sid);
    }
    this.__defineGetter__('currentPage', function () {
      return this._currentPage;
    });
    this.__defineSetter__('currentPage', function (page) {
      this.setData({
        pageEnd: page < this.pagedList.length - 1 ? false : true,
      });
      this._currentPage = page;
    });

    this.__defineGetter__('hasPromised', function () {
      let { date } = cwx.getStorageSync('BUS:UserPromiseCheckVirus') || {};
      if (!date) {
        return false;
      }
      let now = new Date().getTime();

      if (now - date > 43200000) {
        return false;
      }
      return true;
    });
    this.__defineSetter__('hasPromised', function (value) {
      cwx.setStorageSync('BUS:UserPromiseCheckVirus', {
        date: '' + new Date().getTime(),
      });
    });

    new CustomModal(this);
    console.log(options);
    if (this.data.isPromotion) {
      this.ubtTrace(100880, { utmsource: this.data.utmSource || '' });
    }
    this.loadInfo = {
      ...options,
      fromCity: decodeURIComponent(options.fromCity),
      toCity: decodeURIComponent(options.toCity),
      fromStation: decodeURIComponent(options.fromStation),
      toStation: decodeURIComponent(options.toStation),
    };
    this.getBusNoticeData(this.loadInfo.fromCity, this.loadInfo.toCity);
    this.getGuestActivity();
    this.getCouponExpireNotice();
    if (this.loadInfo.fromStation) {
      this.selectFromList = [this.loadInfo.fromStation];
    }
    if (this.loadInfo.toStation) {
      this.selectToList = [this.loadInfo.toStation];
    }
    // this.showLoading();
    this.setDateInfo(this.loadInfo.date);

    BusRouter.isLogin(false).then(({ isLogin }) => {
      this.setData(
        {
          scopeData: {
            from_city: this.loadInfo.fromCity,
            to_city: this.loadInfo.toCity,
            service_type: 13,
          },
          isLogin,
          didTip: this.loadInfo.didTip || false,
        },
        () => {}
      );

      this.reloadData().then(() => {});
    });
    console.log('cwx flag', cwx.flag);
  },
  setDateInfo: function (date) {
    var newDate;
    var time = '';
    if (!date) {
      newDate = new Date();
    } else {
      var _date = date.substring(0, 10);
      time = date.substr(11, 5).replace(/\-/g, ':');
      var formatDate = _date.replace(/\-/g, '/');
      newDate = new Date(formatDate);
      var current = new Date();
      if (newDate < current) {
        newDate = current;
      }
    }
    var newDateString = newDate.format('yyyy-MM-dd');
    this.data.date = newDateString;
    this.setData({
      curDateNum: newDateString.replace(/\-/g, '') * 1,
      date: newDateString,
      time: time || '',
      showDate: newDate.format('MM-dd'),
      displayDate: this._DAY1[newDate.getDay()],
    });
    this.options.date = newDateString;
    this.loadInfo.date = newDateString;
  },

  getData: function (data) {
    var mUtmsource = this.data.utmSource;
    var params = {
      fromCity: data.fromCity,
      fromCityId: data.fromCityID,
      toCity: data.toCity,
      toCityId: data.toCityID,
      fromDate: data.date,
      utmsource: mUtmsource,
      toStation: !!data.toStation ? data.toStation : '',
      fromStationList: this.selectFromList || [],
      toStationList: this.selectToList || [],
      busListExtendParams: {
        busMixType: 2, // 是否混排标记，1混排；2仅汽车
      },

      fromTimeList:
        this.selectTimeList.map((item) => {
          return this.data.timePeroid.indexOf(item) + 1;
        }) || [],
    };

    return Pservice.busListV2(params).then((res) => {
      if (res.message) {
        this.onUbtTrace('exposure', 'list_noResult', '列表页无结果', '');
      }
      let { data } = res.data.bus;
      let newRes = {
        return: data,
        message: res.message,
      };
      if (!data.busList || data.busList === []) {
        throw newRes;
      } else {
        let busList = data.busList || [];
        let ableList = busList.filter((item) => item.isBookable);
        let unableList = busList.filter((item) => !item.isBookable);
        if (unableList.length > 0) {
          this.setData({
            isShowUnableList: false,
          });
          if (ableList.length > 0) {
            ableList[ableList.length - 1].isShowExpendunable = true;
          } else {
            unableList[0].isShowExpendunable = true;
          }
          Utils.sendExposeTrace('list_unSubscribableButton_show', {
            comment: '列表页-点击不可预订班次按钮曝光',
          });
        }
        newRes.return.busList = ableList.concat(unableList);
        newRes.return.abList = ableList;
        newRes.return.unableList = unableList;
        if (ableList.length > 0) {
          return newRes;
        } else {
          throw newRes;
        }
      }
    });
  },

  checkLineRecoverSubscribe() {
    const param = this.loadInfo;
    Pservice.lineRecoverSubscribeStatus({
      fromCity: param.fromCity,
      toCity: param.toCity,
      subscribe: 2,
      pageSource: 1,
      utmSource: this.data.utmSource || '',
    })
      .then((res) => {
        this.setData({
          recoverSubscribeStatus: res.subscribeStatus,
          showRecovery: true,
          templateId: (res && res.data && res.data.templateId) || [],
        });
        this.onUbtTrace(
          'show',
          'list_followLineMessage_show',
          '列表页-线路恢复通知订阅曝光',
          ''
        );
      })
      .catch((err) => {
        this.setData({
          recoverSubscribeStatus: 0,
          showRecovery: false,
        });
      });
  },
  processNoBusResult(param, err) {
    let didCallBackNear = false;
    let didCallBackRecommend = false;
    let fcb = ({ data, message, near, recommend, ...others }, check) => {
      if (near) {
        didCallBackNear = near;
      }
      if (recommend) {
        didCallBackRecommend = recommend;
      }

      this.hideLoading();

      if (data && data.busList && data.busList.length > 0) {
        var formatedData = this._formatData(data);
        this.pageListData(formatedData.busList);
        this.setData({
          ...others,
          message: message || '',
          loadFailed: true,
        });
      } else {
        // 无结果
        this.setData({
          ...others,
          list: [],
          listLength: 0,
          inLoading: false,
          note: '',
          message: data.message || '',
          loadFailed: true,
        });
      }
      if (check && !(others.anotherDates && others.anotherDates.length > 0)) {
        this.checkLineRecoverSubscribe();
      }
    };

    var data = err.return || err.data || {};
    var extraInfo = data.extraInfo || undefined;
    let resultType = data.resultType || 0;

    var callbackData = {
      data: data,
      message: err.message || '',
      extraInfo: extraInfo || {},
      resultType,
    };

    //临近日期
    if (extraInfo == undefined || extraInfo.needBookDates) {
      var mUtmsource = this.data.utmSource;
      var params = {
        fromCity: param.fromCity,
        fromCityId: param.fromCityID,
        toCity: param.toCity,
        toCityId: param.toCityID,
        fromDate: param.date,
        utmsource: mUtmsource,
      };
      this.requestNearDate(params)
        .then((res) => {
          if (!callbackData.message) {
            callbackData.message =
              '此线路为隔日发车，\n游游建议您选择以下有班次的日期';
          }
          fcb(
            {
              ...callbackData,
              anotherDates: res,
              near: true,
            },
            true
          );
          if (res) {
            this.logUserTrace('其他日期推荐');
          }
        })
        .catch((err) => {
          fcb(
            {
              ...callbackData,
              near: true,
            },
            true
          );
        });
    } else {
      didCallBackNear = true;
    }
    // 上下级推荐
    let nearAb = cwx.ABTestingManager.valueForKeySync('210413_BUS_near') || '';
    if (extraInfo == undefined || extraInfo.hasPlanA) {
      Pservice.getNoResultRecommend({
        fromCity: param.fromCity,
        fromCityId: param.fromCityID,
        toCity: param.toCity,
        toCityId: param.toCityID,
        date: param.date,
        abList: [{ abVersion: '210413_BUS_near', abValue: nearAb }],
      })
        .then((res) => {
          let plan_a = res.planA.planAList || [];
          if (plan_a.length > 0) {
            fcb({
              ...callbackData,
              recommendA: plan_a,
              recommend: true,
            });
            this.logUserTrace('临近大巴推荐');
          } else {
            fcb({
              ...callbackData,
              recommend: true,
            });
          }
        })
        .catch((err) => {
          fcb({
            ...callbackData,
            recommend: true,
          });
        });
    } else {
      didCallBackRecommend = true;
    }
    if (didCallBackNear && didCallBackRecommend) {
      fcb(callbackData);
    }
  },
  reloadData: function () {
    this.scanId = Utils.uuid();
    this.setData({
      isShowUnableList: true,
    });
    return this.getData(this.loadInfo)
      .then((res) => {
        this.setData({
          loadFailed: false,
        });
        this.setListView({ ...res.return, message: res.message }, () => {
          this.hideLoading();
        });
        this.fromCityNames = res.return.fromCityNames || [];
      })
      .catch((err) => {
        this.processNoBusResult(this.loadInfo, err);
      });
  },

  showNotes: function (e) {
    let notes = this.data.notes;
    var customModalData2 = {
      richTextMessage: `<div style="text-align:left">${notes.content}</div>`,
      title: notes.title,
      color: '#666666',
      buttons: [
        {
          buttonTitle: '知道了',
          buttonColor: '#ffffff',
          buttonTextColor: '#888888',
          action: () => {
            //取消
          },
        },
      ],
    };
    this.showCustomModal(customModalData2);
  },

  subscribe: function () {
    let loadInfo = this.loadInfo;
    Pservice.lineRecoverSubscribe({
      fromCity: loadInfo.fromCity,
      toCity: loadInfo.toCity,
      subscribe: 2,
      pageSource: 1,
      utmSource: this.data.utmSource || '',
    })
      .then((res) => {
        console.log(res);
        this.showToast({
          icon: 'none',
          message: '订阅成功',
        });
        this.checkLineRecoverSubscribe();
      })
      .catch((err) => {
        this.showToast({
          icon: 'none',
          message: '订阅失败',
        });
      });
  },
  subscribeLineRecover: function (e) {
    let loadInfo = this.loadInfo;
    let templateId = this.data.templateId || [];
    if (templateId.length > 0) {
      CPage.subscribeTemplateMessage(templateId, (success) => {
        if (success) {
          this.subscribe();
        } else {
          this.showToast({
            icon: 'none',
            message: '订阅失败',
          });
        }
      });
    } else {
      this.subscribe();
    }
    this.onUbtTrace(
      'click',
      'list_followLineMessage_click',
      '列表页-线路恢复通知订阅曝光',
      ''
    );
  },

  hiddenNotice: function (e) {
    this.setData({
      isShowNotesDetail: false,
    });
  },
  requestNearDate(parmas) {
    return Pservice.checkBookDate({
      fromCity: parmas.fromCity,
      toCity: parmas.toCity,
      fromDate: parmas.fromDate,
    }).then((res) => {
      console.log(res);
      var hasLine;
      res.return.forEach((item) => {
        item.date = new Date(item.fromDate.replace(/\-/g, '/')).format('MM-dd');
        item.price =
          item && item.lowerPrice && item.lowerPrice.length > 0
            ? `${(item.lowerPrice - 0) * 1}`
            : '';
        let day = new Date(item.fromDate).getDaySymbol();
        if (!day) {
          day = this._DAY1[new Date(item.fromDate).getDay()];
        }
        item.day = day;
        if (item.cnt !== '无票' && item.canBook) {
          hasLine = true;
        }
      });
      if (!hasLine) {
        throw res;
      } else {
        return res.return;
      }
    });
  },
  toSaveImage(e) {
    var url = e.currentTarget.dataset.url;
    console.log(url);
    this.onSaveImg(e);
  },
  toExtrapage(e) {
    var url = e.currentTarget.dataset.url;
    BusRouter.navigateTo(url);
  },
  onSwitchDate(e) {
    let { date, price } = e.currentTarget.dataset;
    Utils.sendClickTrace(
      'list_noRuseltModule_click',
      {
        comment: '列表页-搜索结果模块点击',
        recommentType: '其他日期推荐',
        scanId: this.scanId,
        lines: {
          realFromDate: date,
          realFromStation: this.loadInfo.fromStation || this.loadInfo.fromCity,
          realToStation: this.loadInfo.toStation || this.loadInfo.toCity,
          price: price,
        },
      },
      'wjgtj'
    );
    this.setDateInfo(date);
    var scope = this;
    this.showLoading();
    this.reloadData();
  },
  _formatData: function (result, needPv = false) {
    var busList = (result && result.busList) || [];
    var hasPointBus = false;

    let { reductPrice } = this.loadInfo || {};
    busList.forEach((item) => {
      item._show = true;
      // 格式化景区反馈的json字符串作相应处理
      if (item.businessType == 'pointBus' && item.extraJsonData) {
        var extraJsonData = JSON.parse(item.extraJsonData);
        if (extraJsonData.showDiscount) {
          item.offsetActivityType = 3;
        }
      } else {
        var offsetActivityType = +(
          (item.reductPriceInfo && item.reductPriceInfo.reductPriceType) ||
          '0'
        );
        item.offsetActivityType = offsetActivityType;
      }

      if (reductPrice) {
        item.reductPrice = reductPrice;
      }

      item._tagName = getBusTagName(item);
      if (item.businessType == 'pointBus') {
        hasPointBus = true;
      }
      if (item.toStationList && item.toStationList.length) {
        var len = item.toStationList.length;
        item._toStationName = item.toStationList[len - 1].stationAddress;
      } else {
        item._toStationName = item.toStationShow || item.toStation;
      }
      try {
        // item.extraJsonData
        var extraData = JSON.parse(item.tempFields.extraJsonData);
        item.isFloatTime = extraData.fromTimeType == '3';
        item.passStationDesc = extraData.pathStation || '';
        var extraTag = extraData.tag
          .map((tag) => {
            return tag.tagName;
          })
          .join(' ');
        item.extraTag = extraTag;
      } catch (err) {
        console.log(err);
      }
    });
    result.busList = busList;
    this.mockData = result;
    return {
      ...result,
      needPv: hasPointBus && needPv,
    };
  },
  setTitle: function () {
    if (!this.loadInfo.fromCity) return;
    this.setNavigationBarTitle({
      title: this.loadInfo.fromCity + ' - ' + this.loadInfo.toCity,
    });
  },
  onReady: function () {
    this.setTitle();
  },
  onShow: function () {
    this.setTitle();
    this.setData({
      renderLottery: true,
    });
  },
  onHide: function () {
    this.setData({
      renderLottery: false,
    });
  },
  dateAction: function () {
    this.onUbtTrace('click', 'list_calendar_button', '列表页顶部日历', '');
    var choosenDate = new Date(this.data.date.replace(/\-/g, '/')).format(
      'yyyy-M-d'
    );

    cwx.component.calendar(
      {
        chooseDate: choosenDate,
        beginDate: new Date().format('yyyy-M-d'),
        endDate: new Date().addDays(60).format('yyyy-M-d'),
        title: '选择出发日期',
        bu: 'bus',
        info: {},
      },
      (date) => {
        var o_date = new Date(date.replace(/\-/g, '/'));
        this.setDateInfo(o_date.format('yyyy-MM-dd'));

        this.showLoading();
        this.reloadData();
      }
    );
  },
  changeDay: function (e) {
    // if(this.data.curDateNum <= this.data.minDateNum || this.data.curDateNum >= this.data.maxDateNum){
    //     return;
    // }
    var target = e.currentTarget;
    var diffDay = target.dataset.day * 1;
    if (diffDay == -1) {
      this.onUbtTrace(
        'click',
        'list_dayBefore_button',
        '列表页顶部切换日期（前一天）',
        ''
      );
    }
    if (diffDay == 1) {
      this.onUbtTrace(
        'click',
        'list_dayAfter_button',
        '列表页顶部切换日期（后一天）',
        ''
      );
    }
    if (diffDay == -1 && this.data.curDateNum <= this.data.minDateNum) {
      return;
    }
    if (diffDay == 1 && this.data.curDateNum >= this.data.maxDateNum) {
      return;
    }
    var newDate = new Date(this.data.date.replace(/\-/g, '/'))
      .addDays(diffDay)
      .format('yyyy-MM-dd');
    this.setDateInfo(newDate);
    var scope = this;
    this.showLoading();
    this.reloadData();
  },
  setListView: function (res, callback, needPv = false) {
    //需要 callback 渲染时间过长
    var data = this._formatData(res, needPv);
    var busList = data.busList;
    if (data.needPv) {
      this.ubtSendPV({
        pageId: '10650009857',
      });
    }
    var fromStationList = (data.fromStationInfoList || []).map(
      (item) => item.name
    );
    this.setData(
      {
        fromStationList: fromStationList,
        toStationList: data.toStationList || [],
        message: res.message || '',
        extraInfo: data.extraInfo || {},
      },
      () => {
        this.pageListData(busList);
        callback && callback();
      }
    );
  },
  checkBook: function (e) {
    var target = e.currentTarget;
    var { index, page } = target.dataset;
    if (typeof index == 'undefined' || typeof page == 'undefined') {
      return;
    }
    let number = page * 10 + index;
    this.onUbtTrace('click', `list_station_${number}`, '列表页班次', '');
    var item = this.pagedList[page][index];
    if (!item.isBookable) return; // 不可预订
    if (this.inLoading) return; // 上一次点击还在处理中

    if (item) {
      this.inLoading = true;
      var checkTime = () => {
        var descArray = item.tempFields.stationNoBusinessDesc.split('|');
        var innerHtml = '';

        descArray.forEach((desc) => {
          innerHtml += `<p style="text-align:left">${desc}</p>`;
        });
        var customModalData = {
          richTextMessage: `<div>${innerHtml}</div>`,
          title: '温馨提示',
          color: '#666666',
          buttons: [
            {
              buttonTitle: '选择其他',
              buttonColor: '#ffffff',
              buttonTextColor: '#888888',
              action: () => {
                //取消
                this.inLoading = false;
              },
            },
            {
              buttonTitle: `依然选择`,
              buttonColor: '#FF9A14',
              buttonTextColor: '#ffffff',
              action: () => {
                var depTime;
                // 流水班
                if (item.shiftType == 1) {
                  depTime = item.endTime || item.fromTime;
                } else {
                  depTime = item.fromTime;
                }
                var dateString =
                  this.data.date.replace(/\-/g, '/') + ' ' + depTime;
                var depDate = new Date(dateString);
                var now = new Date();

                if (depDate.getTime() - now.getTime() < 1800000) {
                  //发车时间临近
                  var customModalData2 = {
                    richTextMessage: `<div style="text-align:left">您选择的车票距开车时间很近了，请确保有足够的时间抵达车站，以免耽误您的旅行</div>`,
                    title: '温馨提示',
                    color: '#666666',
                    buttons: [
                      {
                        buttonTitle: '选择其他',
                        buttonColor: '#ffffff',
                        buttonTextColor: '#888888',
                        action: () => {
                          //取消
                        },
                      },
                      {
                        buttonTitle: `依然选择`,
                        buttonColor: '#FF9A14',
                        buttonTextColor: '#ffffff',
                        action: () => {
                          this.doBooking(item);
                        },
                      },
                    ],
                  };
                  setTimeout(() => {
                    this.showCustomModal(customModalData2);
                  }, 200);
                } else {
                  if (item) {
                    this.doBooking(item);
                  }
                }
              },
            },
          ],
        };
        setTimeout(() => {
          this.showCustomModal(customModalData);
        }, 200);
      };
      if (item.tempFields.stationNoBusinessDesc) {
        checkTime();
      } else {
        this.doBooking(item);
      }
      this.lastActionItem = {
        page,
        index,
        item,
      };
    }
  },
  toRecommendLine: function (e) {
    var { from, to, fromCityId, toCityId, price } = e.currentTarget.dataset;
    Utils.sendClickTrace(
      'list_noRuseltModule_click',
      {
        comment: '列表页-搜索结果模块点击',
        recommentType: '临近大巴推荐',
        scanId: this.scanId,
        lines: {
          realFromDate: this.loadInfo.date,
          realFromStation: from,
          realToStation: to,
          price: price,
        },
      },
      'wjgtj'
    );
    let utmSource = this.data.utmSource;
    if (utmSource && utmSource.indexOf('_xcx_blurline') < 0) {
      utmSource = utmSource + '_xcx_blurline';
    }
    var data = {
      fromCity: from,
      fromCityID: fromCityId,
      toCity: to,
      toCityID: toCityId,
      date: this.loadInfo.date,
      utmsource: utmSource,
      offlineOldUser: this.loadInfo.offlineOldUser,
    };
    BusRouter.navigateTo('list', data);
  },
  showTagdesc: function (e) {
    var target = e.currentTarget;
    var { index, page } = target.dataset;
    if (typeof index == 'undefined' || typeof page == 'undefined') {
      return;
    }
    var item = this.pagedList[page][index];
    if (item) {
      if (item.shiftType == 1 || item.isWayStation) {
        var wayStationList = [];

        wayStationList.push({
          name: item.fromStation,
          isWay: true,
          type: '上车站',
        });

        if (item.endStation) {
          var isWay = item.endStation === item.toStation;
          wayStationList.push({
            name: item.toStation,
            isWay: true,
            lastWay: true,
            type: '下车站',
          });

          if (!isWay) {
            wayStationList.push({
              name: item.endStation,
              isWay: isWay,
              lastWay: false,
              type: '终点站',
            });
          }
        }
        var tagDescInfo = {
          isWayStation:
            item.isWayStation && (item.startStation || item.endStation),
          wayStationList: wayStationList,
          isShitBus:
            item.shiftType == 1 && (item.shiftTypeDesc || '').length > 0,
          shiftDesc: item.shiftTypeDesc || '流水班',
        };
        tagDescInfo.checkIndex = tagDescInfo.isWayStation ? 0 : 1;
        this.setData({
          showTagdesc: true,
          tagDescInfo: tagDescInfo,
        });
      } else {
        this.checkBook(e);
      }
    }
  },
  onCancelTagDesc: function (e) {
    this.setData({
      showTagdesc: false,
    });
  },
  changeTagIndex: function (e) {
    var index = e.currentTarget.dataset.index;
    this.setData({
      'tagDescInfo.checkIndex': index,
    });
  },
  inLoading: false,
  doBooking: function (item) {
    var mUtmsource = this.data.utmSource;
    if (!item.isBookable) {
      this.inLoading = false;
      return;
    } // 不可预订
    // 预约票不进行有无票校验
    var date = this.data.date;
    if (item.businessType == 'airBus') {
      var naviParams = {
        lineNo: item['busNumber'],
        from: item['fromCity'],
        to: item['toCity'],
        startSite: item['fromStation'],
        endSite: item['toStation'],
        beginTime: item['fromTime'],
        endTime: item['endTime'],
        date: date,
        utmSource: mUtmsource,
      };
      BusRouter.navigateTo('airbusbook', naviParams, 2);
      this.inLoading = false;
      return;
    }

    if (item.businessType == 'pointBus') {
      var naviParams = {
        deviceFrom: 'WeChat',
        date: date,
        fromCity: item['fromCity'],
        toCity: item['toCity'],
        fromStation: item['fromStation'],
        toStation: item['toStation'],
        symbol: item['busNumber'],
        fromDate: item['fromDate'],
        fromTime: item['fromTime'],
        isPointBus: 1,
        utmsource: mUtmsource || '',
        busType: item['busType'] || '',
      };
      // var url = "https://m.uat.qa.nt.ctripcorp.com/webapp/yueche/yueche/book?" + URLUtil.serializeParams(naviParams);
      let _url =
        __global.env === 'uat'
          ? 'https://m.uat.qa.nt.ctripcorp.com'
          : 'https://m.ctrip.com';
      let url =
        `${_url}/webapp/tourbus/yueche/book?` +
        URLUtil.serializeParams(naviParams);

      BusRouter.navigateTo(url, {}, true);

      this.inLoading = false;
      return;
    }
    var naviParams = {
      fromCity: item.fromCity,
      toCity: item.toCity,
      fromStation: item.fromStation,
      toStation: item.toStation,
      fromTime: item.fromTime,
      busNumber: item.busNumber,
      date: date,
      fromDate: date,
      isNeedBusInfo: true,
      fullPrice: item.ticketUnitOriginalPrice,
      activityType: item.offsetActivityType,
      utmSource: mUtmsource,
      symbol: item.symbol,
      isShowX: (item.tempFields && item.tempFields.isShowX) || false,
      abTest: [{ name: '160818_crm_nwpkg', version: 'B' }],
      scanId: this.scanId,
      offlineOldUser: this.loadInfo.offlineOldUser,
    };
    if (item.showTicketStyle == 2) {
      this.toBook(naviParams);
      return;
    }
    var params = {
      fromCity: item.fromCity,
      toCity: item.toCity,
      fromStation: item.fromStation,
      toStation: item.toStation,
      busNumber: item.busNumber,
      fromDate: this.data.date,
      fromTime: item.fromTime,
      utmSource: mUtmsource,
      symbol: item.symbol,
    };
    this.showLoading('检查有无票');

    let requestCheckbook = () => {
      Pservice.checkBook(params)
        .then((data) => {
          this.toBook(naviParams);
        })
        .catch((data) => {
          this.inLoading = false;
          this.hideLoading();
          cwx.showModal({
            title: '提示',
            content: data.message || '您选择的车次已无票，请重新选择车次',
            showCancel: false,
          });
        });
    };

    if (this.hasPromised) {
      requestCheckbook();
      return;
    }
    Pservice.confirmPromise({
      fromStationName: params.fromStation,
    })
      .then((res) => {
        this.hideLoading();
        if (res.data && res.data.title) {
          var customModalData = {
            richTextMessage: `<div style="text-align:left">${res.data.content}</div>`,
            title: res.data.title,
            color: '#666666',
            buttons: [
              {
                buttonTitle: '取消',
                buttonColor: '#ffffff',
                buttonTextColor: '#888888',
                action: () => {
                  //取消
                  this.inLoading = false;
                },
              },
              {
                buttonTitle: `确认`,
                buttonColor: '#FF9A14',
                buttonTextColor: '#ffffff',
                action: () => {
                  this.hasPromised = true;
                  Pservice.submitConfirmPromise({
                    vid: __global.vid || '',
                  }).catch((err) => {});
                  requestCheckbook();
                },
              },
            ],
          };
          setTimeout(() => {
            this.showCustomModal(customModalData);
          }, 0);
        } else {
          requestCheckbook();
        }
        console.log(res);
      })
      .catch((err) => {
        requestCheckbook();
      });

    this.logListClick(item);
  },

  toBook(naviParams) {
    // naviParams.utmSource = 'cscxxx'
    this.showLoading('正在加载...');

    let isAB = cwx.ABTestingManager.valueForKeySync('220117_BUS_XCXX1') || '';
    this.busXAbVersion = isAB;

    this.setData({
      busXAbVersion: this.busXAbVersion,
    });

    if (isAB === 'B') {
      BusRouter.navigateTo('x', { ...naviParams }, 2, 4);
      this.inLoading = false;
    } else if (
      isAB === 'E' ||
      isAB === 'F' ||
      isAB === 'G' ||
      isAB === 'H' ||
      isAB === 'I'
    ) {
      this.getXlist(naviParams);
    } else {
      BusRouter.navigateTo('book', { ...naviParams }, 2, 4);
      this.inLoading = false;
    }
  },

  getXlist(naviParams) {
    var params = {
      fromCity: naviParams.fromCity,
      toCity: naviParams.toCity,
      fromStation: naviParams.fromStation,
      toStation: naviParams.toStation,
      busNumber: naviParams.busNumber,
      fromDate: naviParams.date,
      fromTime: naviParams.fromTime,
      symbol: naviParams.symbol,
      utmSource: naviParams.utmSource,
      fullPrice: naviParams.fullPrice,
      bookable: naviParams.bookable || 1,
      abList: [
        {
          abVersion: '200917_DSJT_tpsxf',
          abValue: 'B',
        },
      ],
    };

    BusDetail.getXList(params)
      .then((res) => {
        if (res.xList && res.xList.length > 0 && res.xList[0].payPrice > 0) {
          this.expandItem({
            ...(this.lastActionItem || {}),
            expandXList: res.xList,
          });
        } else {
          BusRouter.navigateTo('book', { ...naviParams }, 2, 4);
        }
        this.inLoading = false;
        this.hideLoading();
      })
      .catch((err) => {
        this.inLoading = false;
        this.hideLoading();
        console.log('no xlist');
        BusRouter.navigateTo('book', { ...naviParams }, 2, 4);
      });
  },
  expandItem(item) {
    let selectedExpandTab = 0;
    let selectedExpandItem = item.expandXList[0];
    if (
      this.busXAbVersion === 'G' ||
      this.busXAbVersion === 'H' ||
      this.busXAbVersion === 'I'
    ) {
      for (let i = 0; i < item.expandXList.length; i++) {
        let channel = item.expandXList[i];
        if (channel.type !== 'fiveMin') {
          Utils.sendExposeTrace('xcx_x_channel_show', {
            comment: '列表页x通道曝光上报',
            abVersion: this.busXAbVersion,
            channelName: channel.channelName || '',
          });
        }
      }
    } else {
      Utils.sendExposeTrace('xcx_x_channel_show', {
        comment: '列表页x通道曝光上报',
        abVersion: this.busXAbVersion,
        channelName: selectedExpandItem.channelName || '',
      });
    }

    let typeSnd = `${selectedExpandItem.channelName || ''}_reserve_show`;
    let comment = `${selectedExpandItem.hallwayTitle}通道曝光`;
    this.onUbtTrace('show', typeSnd, comment, this.busXAbVersion);

    console.log('selectedExpandItem----', selectedExpandItem);
    this.setData({
      expandPage: item.page,
      expandIndex: item.index,
      expandXList: item.expandXList.map((item, index) => {
        return {
          ...item,
          xPosition: 'list',
        };
      }),
      scrollToView: `buslist_item_${item.page}_${item.index}`,
      scrollWithAnimation: true,
      selectedExpandTab,
      selectedExpandItem,
    });
  },
  tapSwitchTab(e) {
    let { index } = e.currentTarget.dataset;
    console.log('tapSwitchTab', index);
    let selectedExpandItem = this.data.expandXList[index];

    Utils.sendExposeTrace('xcx_x_channel_show', {
      comment: '列表页x通道曝光上报',
      abVersion: this.busXAbVersion,
      channelName: selectedExpandItem.channelName || '',
    });
    let typeSnd = `${selectedExpandItem.channelName || ''}_reserve_show`;
    let comment = `${selectedExpandItem.hallwayTitle}通道曝光`;
    this.onUbtTrace('show', typeSnd, comment, this.busXAbVersion);

    this.setData({
      selectedExpandTab: index,
      selectedExpandItem,
    });
  },

  onBook: function (e) {
    let { xindex, index, page, type } = e.currentTarget.dataset;
    if (type === 'insuranceModal') {
      xindex = this.data.xModalInfo.xindex;
      index = this.data.xModalInfo.index;
      page = this.data.xModalInfo.page;
      this.setData({
        showInsuranceModal: false,
      });
    }
    if (typeof index == 'undefined' || typeof page == 'undefined') {
      return;
    }
    var item = this.pagedList[page][index];
    let bookItem = this.data.expandXList[xindex];
    var date = this.data.date;
    var params = {
      fromCity: item.fromCity,
      toCity: item.toCity,
      fromStation: item.fromStation,
      toStation: item.toStation,
      busNumber: item.busNumber,
      fromDate: date,
      fromTime: item.fromTime,
      symbol: item.symbol,
      utmSource: this.data.utmSource,
      fullPrice: item.fullPrice,
      bookable: item.bookable || 1,
      abList: [
        {
          abVersion: '200917_DSJT_tpsxf',
          abValue: 'B',
        },
      ],
    };

    if (bookItem && bookItem.channelName) {
      Utils.sendClickTrace('xcx_x_reserve_button_click', {
        comment: '列表页x预定按钮点击上报',
        abVersion: this.busXAbVersion,
        channelName: bookItem.channelName || '',
      });
      this.onUbtTrace(
        'click',
        `${bookItem.channelName || ''}_reserve_button_click`,
        `${bookItem.hallwayTitle}通道预定按钮点击`
      );
    }

    if (this.data.expandXList && this.data.expandXList.length > 0) {
      this.data.expandXList.forEach((item) => {
        item.open = false;
      });
    }

    BusDetail.getBusDetail(params)
      .then((res) => {
        let data = { ...res, xList: this.data.expandXList, hasX: true };
        if (bookItem && bookItem.channelName) {
          bookItem.open = true;
          data.selectX = bookItem;
        }

        let dataJson = JSON.stringify(data);
        let key = BusShared.genKey('detail');
        BusShared.save(key, encodeURIComponent(dataJson));
        BusRouter.navigateTo('book', { bookData: key, ...params }, 2, 4);
        this.onTouchExpand();
      })
      .catch((err) => {
        this.onTouchExpand();
        BusRouter.navigateTo('book', { ...params }, 2, 4);
      });
  },

  mapListData(list) {
    list = list || [];
    return list.map((item) => {
      let showPrice = item.ticketUnitOriginalPrice || item.ticketUnitSalePrice;
      let reducePrice = item.ticketUnitReducedPrice; // 券减价格
      let discountTagList =
        item.discountTagList && item.discountTagList.length
          ? item.discountTagList[0]
          : '';

      let data = {
        isBookable: item.isBookable,
        isFloatTime: item.isFloatTime,
        businessType: item.businessType,
        startTime: item.startTime,
        endTime: item.endTime,
        _tagName: item._tagName,
        rewardFee: !item.isPresale ? item.tempFields?.rewardFee || 0 : 0,
        cashBack: item.cashBack,
        serviceFee: item.serviceFee,
        isWayStation: item.isWayStation,
        scenicCashBack: item.scenicCashBack,
        offsetActivityType: item.offsetActivityType,
        ticketUnitSalePrice: item.ticketUnitSalePrice,
        ticketUnitOriginalPrice: item.ticketUnitOriginalPrice,
        fromStation: item.fromStation,
        ticketStockStyle: item.ticketStockStyle,
        ticketStock: item.ticketStock,
        toStation: item.toStationShow || item.toStation,
        busType: item.busType,
        costTime: item.costTime,
        passStationDesc: item.passStationDesc,
        breakLine: item.breakLine,
        extraTag: item.extraTag,
        fromTime: item.fromTime,
        reductPrice: item.reductPrice,
        isShowExpendunable: item.isShowExpendunable || false,
        showPrice: showPrice,
        reducePrice,
        discountTagList,
      };
      return data;
    });
  },
  //数据本地分页避免白屏
  pageListData(list) {
    this.mockList = list;
    var splitArray = (arr, len) => {
      var a_len = arr.length;
      var result = [];
      for (var i = 0; i < a_len; i += len) {
        result.push(arr.slice(i, i + len));
      }
      return result;
    };
    this.pagedList = splitArray(list, this.pageSize);
    this.currentPage = 0;
    this.inPageUpdate = false;
    this.setData({
      currentPage: this.currentPage,
      listLength: list.length,
      allListLength: this.mockData.busList.length, //筛选之前的数据长度
      list: [this.mapListData(this.pagedList[this.currentPage])],
      selectFromList: this.selectFromList.slice(),
      selectToList: this.selectToList.slice(),
      needScroll: true,
      scrollTo: 0,
      inLoading: false,
    });

    this.logListDataExpose(list);
  },
  logListClick(item) {
    let loadInfo = this.loadInfo;
    let traceInfo = {
      pageId: this.pageId,
      utmSource: this.data.utmSource || '',
      type: BusConfig.traceType || 'ctripwxxcx',
      fromDate: loadInfo.date || '',
      scanId: this.scanId || '',
      typeSnd: 'list_hasRuseltModule_click',
      comment: '列表页-班次点击',
    };
    let hours = ((item.tempFields && item.tempFields.runMinutes) || 0) / 60;
    traceInfo.lines = [
      {
        fromTime: item.fromTime,
        min_take_time: hours,
        bus_type:
          (item.busLineTypeInfo && item.busLineTypeInfo.busType) ||
          item.busType ||
          '',
        price: item.ticketUnitSalePrice,
        discount: (item.discountTagList || []).join(','),
        payPrice: item.ticketUnitSalePrice,
        realFromCity: item.fromCity,
        realToCity: item.toCity,
        realFromStation: item.fromStation,
        realToStation: item.toStation,
        productLine: item.businessType == 'bus' ? 1 : 3,
      },
    ];
    console.log(traceInfo);
    console.log(traceInfo);
    console.log(traceInfo);
    console.log('  console.log(traceInfo);', traceInfo.lines);
    this.ubtTrace('155489', traceInfo);
  },

  logListDataExpose(list) {
    let loadInfo = this.loadInfo;

    if (list.length > 0) {
      let traceInfo = {
        pageId: this.pageId,
        utmSource: this.data.utmSource || '',
        type: BusConfig.traceType || 'ctripwxxcx',
        userFromCity: loadInfo.fromCity || '',
        userToCity: loadInfo.toCity || '',
        fromDate: loadInfo.date || '',
        scanId: this.scanId || '',
        isHasResult: 1,
        typeSnd: 'list_hasRuseltModule_show',
        comment: '列表页-班次曝光',
      };

      traceInfo.lines = list.map((item) => {
        let hours = ((item.tempFields && item.tempFields.runMinutes) || 0) / 60;
        return {
          fromTime: item.fromTime,
          min_take_time: hours,
          bus_type:
            (item.busLineTypeInfo && item.busLineTypeInfo.busType) ||
            item.busType ||
            '',
          price: item.ticketUnitSalePrice,
          discount: (item.discountTagList || []).join(','),
          payPrice: item.ticketUnitSalePrice,
          realFromCity: item.fromCity,
          realToCity: item.toCity,
          realFromStation: item.fromStation,
          realToStation: item.toStation,
          productLine: item.businessType == 'bus' ? 1 : 3,
        };
      });
      this.ubtTrace('138763', traceInfo);
    }
  },

  inPageUpdate: false,
  inPageLoading: false,
  reachPageTop() {
    if (this.inPageUpdate || !this.data.isShowUnableList) {
      return;
    }
    if (this.currentPage > 0) {
    }
  },
  onTouchScroll(e) {
    this.onScroll = true;
  },
  endTouchScroll(e) {
    this.onScroll = false;
  },

  onTouchExpand(e) {
    if (e) {
      e.stopPropagation && e.stopPropagation();
      e.preventDefault && e.preventDefault();
    }
    this.setData({
      expandIndex: -1,
      expandPage: -1,
      expandXList: [],
      selectedExpandTab: 0,
    });
  },
  clearXData() {
    if (
      this.onScroll &&
      this.data.expandIndex >= 0 &&
      this.data.expandPage >= 0
    ) {
      this.onTouchExpand();
    }
  },
  onListScroll(e) {
    if (this.inPageLoading) {
      return;
    }
    let { scrollTop } = e.detail;
    let currentPageFrame = this.data.pageFrame[this.currentPage];
    // 渲染上一页
    if (this.currentPage > 0) {
      let pageFrame = this.data.pageFrame[this.currentPage - 1];
      if (pageFrame) {
        if (scrollTop + screenHeight - pageFrame.lastBottom < -200) {
          this.inPageUpdate = true;
          this.currentPage -= 1;
          this.setData(
            {
              currentPage: this.currentPage,
            },
            () => {
              this.inPageUpdate = false;
            }
          );
        }
      }
    }
    // 渲染下一页
    if (currentPageFrame) {
      if (scrollTop - currentPageFrame.lastBottom > 200) {
        this.inPageUpdate = true;
        this.currentPage += 1;
        this.setData(
          {
            currentPage: this.currentPage,
          },
          () => {
            this.inPageUpdate = false;
          }
        );
      }
    }
    this.clearXData();
  },

  reachPageBottom() {
    if (!this.data.isShowUnableList) {
      // isShowUnableList 是 false 表示有 展开不可预订班次 按钮
      let nowList = this.flatMap(this.data.list);
      let isCanLoading = nowList.every((item) => item.isBookable);
      // 判断此时列表页数据，如果列表页数据都是可预订，说明 展开不可预订班次 按钮 未展示
      // 此时允许加载后面的数据
      this.setData({
        isCanLoading,
      });
      if (!isCanLoading) {
        // 如果列表页数据有不可预订的，说明 展开不可预订班次 按钮 已展示
        // 需要点击了按钮之后才能展示
        return;
      }
    }
    if (this.inPageLoading) {
      return;
    }
    this.inPageLoading = true;
    this.inPageUpdate = true;
    if (this.currentPage < this.pagedList.length - 1) {
      var self = this;
      var currentPage = this.currentPage;
      wx.createSelectorQuery()
        .select('#listpage-' + this.currentPage)
        .boundingClientRect(function (rect) {
          // var key = `pageHeight[${currentPage}]`
          let height = rect ? rect.height : 0;
          if (currentPage > 0) {
            var lastPage = self.data.pageFrame[currentPage - 1] || {
              lastBottom: height,
            };
            rect.lastBottom = lastPage.lastBottom + height;
          } else {
            rect.lastBottom = height;
          }
          self.setData({
            [`pageFrame[${currentPage}]`]: rect,
          });
        })
        .exec();

      this.currentPage = this.currentPage + 1;
      var nextPage = this.mapListData(this.pagedList[this.currentPage]);
      var key = `list[${this.currentPage}]`;
      var data = {};
      data[key] = nextPage;
      data.currentPage = this.currentPage;
      console.log(data);
      this.setData(data, () => {
        this.inPageLoading = false;
        this.inPageUpdate = false;
      });
    } else {
      this.setData(
        {
          pageEnd: true,
        },
        () => {
          this.inPageLoading = false;
          this.inPageUpdate = false;
        }
      );
    }
  },

  //筛选功能
  inFilter: false,

  mapSelectList(list, selectList) {
    return list.map((item) => {
      return {
        name: item,
        selected: selectList.indexOf(item) >= 0,
      };
    });
  },

  sortList(busList, sortType) {
    return new Promise((reslove, reject) => {
      var tempList = busList.slice();
      if (sortType == 'time') {
        tempList = tempList.sort((item1, item2) => {
          if (item1.isBookable && item2.isBookable) {
            var item1Time =
              (item1.tempFields && item1.tempFields.runMinutes) || 10000000;
            var item2Time =
              (item2.tempFields && item2.tempFields.runMinutes) || 10000000;
            if (item1Time < item2Time) {
              return -1;
            } else if (item1Time == item2Time) {
              return 0;
            } else {
              return 1;
            }
          } else {
            if (item1.isBookable) {
              return -1;
            } else if (item2.isBookable) {
              return 1;
            } else {
              return 0;
            }
          }
        });
      }
      reslove(tempList);
    }).catch((err) => {
      console.log('sort err---', err);
      return busList;
    });
  },
  onSortType(e) {
    this.onUbtTrace(
      'click',
      'list_tripdurationRank_button',
      '列表页耗时排序',
      ''
    );
    if (this.inFilter) {
      return;
    }
    var sortType = this.data.sortType;
    if (sortType == 'time') {
      sortType = '';
    } else {
      sortType = 'time';
    }
    this.inFilter = true;
    this.sortList(this.mockData.busList, sortType).then((list) => {
      this.inFilter = false;
      this.pageListData(list);
      this.setData({
        sortType: sortType,
      });
    });
  },
  selectFromList: [],
  selectToList: [],
  selectTimeList: [],
  onShowFilter(e) {
    this.onUbtTrace('click', 'list_filter_button', '列表页筛选按钮');
    var filterType = this.data.filterType;

    var fromStationList = this.data.fromStationList;
    var toStationList = this.data.toStationList;
    var timePeroid = this.data.timePeroid;

    if (fromStationList.length <= 1 && toStationList.length <= 1) {
      this.showMsg('无可筛选车站');
      return;
    }
    if (fromStationList.length <= 1) {
      filterType = 'to';
    }
    var fromStationListMap = this.mapSelectList(
      fromStationList,
      this.selectFromList
    );
    var toStationListMap = this.mapSelectList(toStationList, this.selectToList);
    var timePeroidListMap = this.mapSelectList(timePeroid, this.selectTimeList);

    var currentListMap =
      filterType == 'from' ? fromStationListMap : toStationListMap;
    this.setData({
      hiddenAnimation: '',
      showFilter: true,
      showMask: true,
      filterType,
      selectFromList: this.selectFromList.slice(),
      selectToList: this.selectToList.slice(),
      selectTimeList: this.selectTimeList.slice(),
      fromStationListMap,
      toStationListMap,
      timePeroidListMap,
      currentListMap: currentListMap,
    });
  },
  hiddenFilter() {
    this.setData(
      {
        hiddenAnimation: 'hidden',
      },
      () => {
        setTimeout(() => {
          this.setData({
            showMask: false,
          });
        }, 200);
      }
    );
  },
  showFromCityFilter(e) {
    this.onUbtTrace(
      'click',
      'list_filterFromStation_tab',
      '列表页筛选-出发车站-tab',
      ''
    );
    this.setData({
      filterType: 'from',
      currentListMap: this.data.fromStationListMap,
    });
  },
  showToCityFilter(e) {
    this.onUbtTrace(
      'click',
      'list_filterToStation_tab',
      '列表页筛选-到达车站-tab',
      ''
    );
    this.setData({
      filterType: 'to',
      currentListMap: this.data.toStationListMap,
    });
  },

  showTimeFilter(e) {
    this.onUbtTrace(
      'click',
      'list_filterFromDate_tab',
      '列表页筛选-出发时间-tab',
      ''
    );
    this.setData({
      filterType: 'time',
    });
  },
  selectFilterItem(e) {
    var filterType = e.currentTarget.dataset.type;
    var item = e.currentTarget.dataset.item;
    var itemIndex = e.currentTarget.dataset.index;
    var insertOrDeleteItem = (list, item) => {
      var index = list.indexOf(item);
      if (index >= 0) {
        list.splice(index, 1);
        // item.sle
      } else {
        list.push(item);
      }
      return list;
    };
    var itemList = [];
    if (filterType == 'from') {
      this.onUbtTrace(
        'click',
        `list_filterFromStation_${1 + itemIndex}`,
        '列表页筛选里出发车站按钮',
        ''
      );
      itemList = insertOrDeleteItem(this.data.selectFromList, item.name);
    } else if (filterType == 'to') {
      this.onUbtTrace(
        'click',
        `list_filterToStation_${1 + itemIndex}`,
        '列表页筛选里到达车站按钮',
        ''
      );
      itemList = insertOrDeleteItem(this.data.selectToList, item.name);
    } else if (filterType == 'time') {
      this.onUbtTrace(
        'click',
        `list_filterFromDate_${1 + itemIndex}`,
        '列表页筛选里出发时间按钮',
        ''
      );
      itemList = insertOrDeleteItem(this.data.selectTimeList, item.name);
    }
    this.updateSelectFilter(filterType, itemList);
  },
  updateSelectFilter(filterType, itemList) {
    if (filterType == 'from') {
      var fromStationListMap = this.mapSelectList(
        this.data.fromStationList,
        itemList
      );
      this.setData({
        selectFromList: itemList,
        fromStationListMap: fromStationListMap,
        currentListMap: fromStationListMap,
      });
    } else if (filterType == 'to') {
      var toStationListMap = this.mapSelectList(
        this.data.toStationList,
        itemList
      );
      this.setData({
        selectToList: itemList,
        toStationListMap: toStationListMap,
        currentListMap: toStationListMap,
      });
    } else if (filterType == 'time') {
      var timePeroidListMap = this.mapSelectList(
        this.data.timePeroid,
        itemList
      );
      this.setData({
        selectTimeList: itemList,
        timePeroidListMap: timePeroidListMap,
      });
    }
  },
  clearCurrentChoose(e) {
    var filterType = e.currentTarget.dataset.type;
    this.updateSelectFilter(filterType, []);
    let typeSndobj = {
      from: {
        typeSnd: 'list_filterFromStation_0',
        comment: '列表页筛选里出发车站按钮',
      },
      to: {
        typeSnd: 'list_filterToStation_0',
        comment: '列表页筛选里到达车站按钮',
      },
      time: {
        typeSnd: 'list_filterFromDate_0',
        comment: '列表页筛选里出发时间按钮',
      },
    };
    this.onUbtTrace(
      'click',
      typeSndobj[filterType].typeSnd,
      typeSndobj[filterType].comment,
      ''
    );
  },
  clearAllFilter(e) {
    this.selectFromList = [];
    this.selectToList = [];
    this.selectTimeList = [];

    this.setData(
      {
        selectFromList: this.selectFromList,
        selectToList: this.selectToList,
        selectTimeList: this.selectTimeList,
      },
      () => {
        this.confirmFilter();
      }
    );
  },
  onCancelFilter(e) {
    this.setData(
      {
        selectFromList: this.selectFromList,
        selectToList: this.selectToList,
        selectTimeList: this.selectTimeList,
      },
      () => {
        this.hiddenFilter();
      }
    );
  },

  confirmFilter(e) {
    var selectFromList = this.data.selectFromList;
    var selectToList = this.data.selectToList;

    this.selectFromList = selectFromList;
    this.selectToList = selectToList;
    this.selectTimeList = this.data.selectTimeList;
    this.showLoading();

    this.getData(this.loadInfo)
      .then((res) => {
        var data = this._formatData(res.return);
        var busList = data.busList;
        this.pageListData(busList);

        this.setData({
          message: res.message || '',
          extraInfo: data.extraInfo || {},
          loadFailed: false,
        });
        this.hiddenFilter();
        this.hideLoading();
      })
      .catch((err) => {
        this.processNoBusResult(this.loadInfo, err);
        this.hiddenFilter();
      });
  },

  //景区需求

  breakDesc(e) {
    var target = e.currentTarget;
    var { index, page } = target.dataset;
    var { index, page } = target.dataset;
    if (typeof index == 'undefined' || typeof page == 'undefined') {
      return;
    }
    var item = this.pagedList[page][index];

    if (item) {
      item.breakLine = true;
      var key = `list[${page}][${index}]`;
      this.setData({
        [key]: item,
      });
    }
  },

  getBusNoticeData(fromCity, toCity) {
    let notice = [];
    // location  1:首页 2:列表页 3:订单填写页 4:订单详情页 5:X页
    Pservice.getShipNotice({
      location: 2,
      fromCity,
      toCity,
    })
      .then((res) => {
        if (res && res.code === 1 && res.data) {
          const { content, title } = res.data;
          this.setData({
            busNoticeData: {
              noticeContentWidth: 618,
              busNoticeContent: content,
              busNoticeTitle: title,
            },
            hasBusNotice: true,
            isShowSwiper: true,
          });
          if (res.data.type && res.data.type === 1) {
            this.setData({
              showBusNoticeModal: true,
            });
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  },
  onBusNoticeClick(e) {
    this.setData({
      showBusNoticeModal: true,
    });
  },
  onClosebusNoticeModal() {
    this.setData({
      showBusNoticeModal: false,
    });
  },
  onUbtTrace(type, typeSnd, comment, abVersion) {
    let key =
      type === 'click'
        ? 'bus_ctrip_wxxcx_allpage_click'
        : 'bus_ctrip_wxxcx_allpage_show';
    let keyid = type === 'click' ? '200534' : '200558';
    let key_des =
      type === 'click' ? '汽车票小程序点击全埋点' : '汽车票小程序曝光全埋点';
    let info = {
      keyid,
      key_des,
      pageId: this.pageId,
      type: BusConfig.traceType || 'ctripwxxcx',
      typeSnd,
      comment,
    };
    let utmSource = this.data.utmSource || '';
    if (comment.indexOf('新人') >= 0) {
      utmSource = 'wxxcx_xrhd';
      let isNew = this.loadInfo.offlineOldUser ? '0' : '1';
      info['isNew'] = isNew;
    }
    info['utmSource'] = utmSource;
    if (abVersion) {
      info['abVersion'] = abVersion;
    }
    this.ubtTrace(key, info);
  },
  getShowEntryForLotteryList(e) {
    const data = e.detail;
    let { type, showEntry, isHide } = data;
    if (this.data.isLogin) {
      if (type === 'click') {
        this.onUbtTrace(
          'click',
          'list__thefresh_lottery_banner',
          '列表页新人抽奖banner',
          ''
        );
      } else if (type === 'exposure') {
        if (showEntry) {
          this.onUbtTrace(
            'exposure',
            'list__thefresh_lottery_banner',
            '列表页新人抽奖banner',
            ''
          );
        } else if (!showEntry && isHide) {
          // 倒计时曝光
          this.onUbtTrace(
            'exposure',
            'list__thefresh_lottery_countdown_banner',
            '列表页新人抽奖banner倒计时',
            ''
          );
        }
      }
    }
  },
  schemeToH5: function (aid, sid) {
    BusRouter.checkLogin(2).then(({ isLogin }) => {
      this.setData({
        isLogin: isLogin,
      });
      if (isLogin) {
        const fromSchemeData = {
          isFromScheme: true,
          aid,
          sid,
        };
        this.setData({
          renderLottery: true,
          fromSchemeData,
        });
      }
    });
  },
  onHasOpenH5: function (e) {
    const data = e.detail;
    let { openUrlToH5 } = data;
    if (openUrlToH5) {
      const fromSchemeData = {
        isFromScheme: false,
      };
      this.setData({
        fromSchemeData,
        aid: '',
        sid: '',
      });
    }
  },

  getCouponExpireNotice() {
    Pservice.getCouponExpireNotice()
      .then((res) => {
        this.onUbtTrace(
          'exposure',
          'list_couponOverdue_banner_show',
          '列表页-优惠券即将过期banner曝光',
          ''
        );
        let data = res.data;
        this.setData({
          isShowSwiper: true,
          isShowExpireCoupon: true,
          expireCouponDate: data,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  },

  getNewGuestActivity(type) {
    return Pservice.getNewGuestActivity({
      type, // 1:首页弹窗 2:首页banner 3:填写页
    })
      .then((res) => {
        if (res.code === 1) {
          if (type === 1) {
            let data = res.data.giftPackageData || [];
            let couponList = [];
            let buttonText = '去购票';
            if (!this.data.isLogin) {
              buttonText = '登录领取新人礼';
              this.onUbtTrace(
                'exposure',
                'list_notLogin_newerPop_show',
                '列表页-新人弹窗未登录曝光',
                ''
              );
            } else {
              this.onUbtTrace(
                'exposure',
                'list_login_newerPop_show',
                '列表页-新人弹窗已登录曝光',
                ''
              );
            }
            data.forEach((item) => {
              let couponItem = {
                couponPrice: item.price,
                title: item.name,
                couponDesc: item.desc,
                unit: item.unit,
                state: item.state,
              };
              couponList.push(couponItem);
            });
            this.setData({
              isNewUser: !!res.data.newUser,
              isShowNewUserCoupon: true,
              newUserCoupon: {
                rule: true,
                title: 'Hi~新乘客，首次购票免费享',
                couponList,
                buttonText,
              },
            });
          } else if (type === 2) {
            this.onUbtTrace(
              'exposure',
              'list_newerBanner_show',
              '列表页-新人活动banner曝光',
              ''
            );
            let data = res.data.bannerDesc || [];
            this.setData({
              isShowSwiper: true,
              isShowNewUseBanner: true,
              newUseBannerDesc: data,
            });
          }
        }
        return res;
      })
      .catch((err) => {
        if (type === 2) {
          if (this.data.hasBusNotice || this.data.isShowExpireCoupon) {
            this.setData({
              isShowSwiper: true,
            });
          } else {
            this.setData({
              isShowSwiper: false,
              isShowNewUseBanner: false,
              newUseBannerDesc: [],
            });
          }
        }
        return err;
      });
  },

  showNewPolicy(e) {
    BusRouter.navigateTo('web', {
      url: encodeURIComponent(
        'https://pages.c-ctrip.com/bus-resource/bus_insurance/%E5%B0%8F%E7%A8%8B%E5%BA%8F%E6%96%B0%E4%BA%BA%E6%B4%BB%E5%8A%A8%E8%A7%84%E5%88%99.html'
      ),
      title: '规则',
      naviColor: this.data.colorConfig.headerBgColor || '',
    });
  },

  showOldPolicy(e) {
    BusRouter.navigateTo('web', {
      url: encodeURIComponent(
        'https://pages.c-ctrip.com/bus-resource/bus_insurance/%E7%BA%BF%E4%B8%8B%E8%BD%AC%E7%BA%BF%E4%B8%8A%E8%80%81%E5%AE%A2%E6%B4%BB%E5%8A%A8%E8%A7%84%E5%88%99.html'
      ),
      title: '规则',
      naviColor: this.data.colorConfig.headerBgColor || '',
    });
  },

  onNewUserCoupon() {
    if (!this.data.isLogin) {
      this.onUbtTrace(
        'click',
        'list_notlogin_newerPop_click',
        '列表页-新人弹窗已登录-登录领取新人礼点击',
        ''
      );
      BusRouter.checkLogin(2).then(({ isLogin }) => {
        this.setData({
          isLogin: isLogin,
        });
        if (isLogin) {
          this.getNewGuestActivity(1).then((res) => {
            if (res.data.newUser) {
              this.showToast({
                message: '您已成功激活新人礼包，开始购票吧',
                icon: 'none',
              });
            } else {
              this.showToast({
                message: '抱歉您不是汽车票新用户，暂无法领取',
                icon: 'none',
              });
              this.getNewGuestActivity(2);
            }
            throw res;
          });
        }
      });
    } else {
      this.onUbtTrace(
        'click',
        'list_login_newerPop_click',
        '列表页-新人弹窗已登录-去购票点击',
        ''
      );
    }
    this.closeNewUserCoupon();
  },

  closeNewUserCoupon() {
    this.setData({
      isShowNewUserCoupon: false,
    });
  },

  showNewUserCoupon() {
    this.getNewGuestActivity(1);
  },

  closeShareCoupon() {
    this.setData({
      isShowShareCoupon: false,
    });
  },

  remindCoupon() {
    if (this.data.remindTemplateId && this.data.remindTemplateId.length > 0) {
      let templateIds = this.data.remindTemplateId;
      BusPage.saveTemplateMessage(templateIds);
    }
    this.closeShareCoupon();
  },

  getConfigInfo() {
    return Pservice.getConfigInfo({
      keyName: 'test',
      keyList: ['ctrip_xcx_coupon_remind_config'],
    })
      .then((res) => {
        let result = res.result || {};

        let remindTemplateIdString =
          result['ctrip_xcx_coupon_remind_config'] || '[]';

        let remindTemplateId = [];

        remindTemplateId = JSON.parse(remindTemplateIdString);

        this.setData({
          remindTemplateId,
        });
      })
      .catch((err) => {});
  },

  onShowUnableList() {
    if (!this.data.isShowUnableList) {
      Utils.sendClickTrace('list_unSubscribableButton_click', {
        comment: '列表页-点击不可预订班次按钮点击',
      });
    }
    this.setData(
      {
        isShowUnableList: !this.data.isShowUnableList,
      },
      () => {
        if (!this.data.isShowUnableList) {
          // 不可预订班次收起来之后
          let newList = [];
          let currentPage = this.currentPage;
          for (let i = 0; i < currentPage + 1; i++) {
            newList.push(this.mapListData(this.pagedList[i]));
          }
          this.setData(
            {
              list: newList,
              currentPage: this.currentPage,
            },
            () => {
              this.inPageLoading = false;
              this.inPageUpdate = false;
            }
          );
        }
      }
    );
  },

  logUserTrace(val) {
    let list = [];
    if (this.data.list.length > 0) {
      list = this.flatMap(this.data.list);
    }
    let unableList = list.filter((item) => !item.isBookable);
    let param = this.loadInfo;
    let lines = [];
    if (unableList.length > 0) {
      for (let i = 0; i < unableList.length; i++) {
        let item = unableList[i];
        let itemFilter = {
          real_from_station: item.fromStation,
          real_to_station: item.toStation,
          noResult_reason: item.ticketStock,
        };
        lines.push(itemFilter);
      }
    }
    Utils.sendExposeTrace(
      'list_noRuseltModule_show',
      {
        comment: '列表页-搜索结果模块曝光',
        userFromCont: param.fromStation || param.fromCity,
        userToCont: param.toStation || param.toCity,
        userFromContAtrr: param.userFromContAtrr || '站点',
        userToContAtrr: param.userToContAtrr || '站点',
        userFromCity: param.fromCity,
        userToCity: param.toCity,
        fromDate: this.data.date,
        scanId: this.scanId,
        isHasResult: 0,
        noResultType: list.length > 0 ? '有资源返回但不可预订' : '无资源返回',
        recommentType: val,
        lines,
      },
      'wjgtj'
    );
  },

  flatMap(arr) {
    let result = [];
    for (let i = 0; i < arr.length; i++) {
      let a = arr[i];
      if (Array.isArray(a)) {
        let aList = this.flatMap(a);
        result = result.concat(aList);
      } else {
        result.push(a);
      }
    }
    return result;
  },

  getGuestActivity() {
    if (this.loadInfo.offlineOldUser) {
      this.getOldGuestActivity(2);
    } else {
      this.getNewGuestActivity(2);
    }
  },

  getOldGuestActivity(type) {
    return Pservice.getOldGuestActivity({
      type, // 1:首页弹窗 2:首页banner 3:填写页
    })
      .then((res) => {
        if (res.code === 1) {
          if (type === 1) {
            let data = res.data.giftPackageData || [];
            if (data.length > 0) {
              let couponList = [];
              let buttonText = '去购票';
              if (!this.data.isLogin) {
                buttonText = '登录领取';
                this.onUbtTrace(
                  'exposure',
                  'list_notLogin_newerPop_show',
                  '列表页-新人弹窗未登录曝光',
                  ''
                );
              } else {
                this.onUbtTrace(
                  'exposure',
                  'list_login_newerPop_show',
                  '列表页-新人弹窗已登录曝光',
                  ''
                );
              }
              data.forEach((item) => {
                let couponItem = {
                  couponPrice: item.price,
                  title: item.name,
                  couponDesc: item.desc,
                  unit: item.unit,
                  state: item.state,
                };
                couponList.push(couponItem);
              });
              this.setData({
                isShowOldUserCoupon: true,
                oldUserCoupon: {
                  rule: true,
                  title: '车站用户专享',
                  couponList,
                  buttonText,
                },
              });
            }
          } else if (type === 2) {
            this.onUbtTrace(
              'exposure',
              'list_newerBanner_show',
              '列表页-新人活动banner曝光',
              ''
            );
            let data = res.data.bannerDesc || [];
            this.setData({
              isShowSwiper: true,
              isShowBgColor: true,
              isShowOldUseBanner: true,
              oldUseBannerDesc: data,
            });
          }
        }
        return res;
      })
      .catch((err) => {
        if (type === 2) {
          if (this.data.hasBusNotice || this.data.isShowExpireCoupon) {
            this.setData({
              isShowSwiper: true,
            });
          } else {
            this.setData({
              isShowSwiper: false,
              isShowNewUseBanner: false,
              newUseBannerDesc: [],
            });
          }
        }
        return err;
      });
  },

  onOldUserCoupon() {
    if (!this.data.isLogin) {
      this.onUbtTrace(
        'click',
        'home_notlogin_newerPop_click',
        '列表页-新人弹窗未登录-登录领取新人礼点击',
        ''
      );
      BusRouter.checkLogin(2).then(({ isLogin }) => {
        this.setData({
          isLogin: isLogin,
        });
        if (isLogin) {
          this.getOldGuestActivity(1).then((res) => {
            if (res.data.toast) {
              this.showToast({
                message: res.data.toast,
                icon: 'none',
              });
            } else {
              this.getOldGuestActivity(2);
            }
          });
        }
      });
    } else {
      this.onUbtTrace(
        'click',
        'home_login_newerPop_click',
        '列表页-新人弹窗已登录-去购票点击',
        ''
      );
    }
    this.closeOldUserCoupon();
  },

  closeOldUserCoupon() {
    this.setData({
      isShowOldUserCoupon: false,
    });
  },

  showOldUserCoupon() {
    this.getOldGuestActivity(1).then((res) => {
      if (res.data.toast) {
        this.showToast({ message: res.data.toast, icon: 'none' });
      }
    });
  },

  onShowInsuranceModal(e) {
    let { xindex, index, page, type } = e.currentTarget.dataset;
    if (type) {
      this.setData({
        showInsuranceModal: true,
        xModalInfo: {
          xindex,
          index,
          page,
        },
        insuranceText:
          '本模块为投保页面，由携程保险代理有限公司管理并运营。请仔细阅读投保须知等内容，并知晓承保保险公司和产品条款内容，为确保您的投保权益，您的投保信息轨迹将被记录。',
      });
    }
  },
  onCancelInsuranceModal() {
    this.setData({
      showInsuranceModal: false,
    });
  },
  onGoDesc(e) {
    const url = e.currentTarget.dataset.url;
    BusRouter.navigateTo('web', {
      url: encodeURIComponent(url),
      title: '产品说明',
    });
  },
};

CPage(pageData);
