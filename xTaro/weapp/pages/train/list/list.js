import { cwx, _ } from '../../../cwx/cwx';
import TPage from '../common/TPage';
import {
  TrainListModel,
  TrainGetStationTipInfoModel,
  SubscribeMessageTemplateModel,
  QuerySubscribeMessageStatusModel,
  TrainInsertTransferRouteRecommendModel,
  ConfigInfoModel,
  trainBookingByTrainNameV7Model,
  combineServiceProductDetailModel,
  getConfigByKeysModel,
} from '../common/model';
import cDate from '../common/cDate';
import util from '../common/util';
import {
  getConfigByKeysPromise,
  GetGrabTicketSucRateInfoPromise,
  GetOnTrainThenByTicketSoluPromise,
  openCalendar,
  openCity,
  setConfigSwitchAsyncPromise,
  TransferListPromise,
  handleGrabRate,
  getTrainSuccessRangeList,
  GetPreSaleDayConfig,
  getUserBindedPhoneNumber,
  getVendorListInfoV5ModelPromise,
  TrainListModelPromise,
  getDirectListTopQuickPromise,
  getTrainSearchConditionPromise,
  promotionSendCouponInfoPromise,
} from '../common/common';
import { shared } from '../common/trainConfig';
import { init12306Account } from '../common/account12306';
import { subscribeMixin } from '../common/components/Subscribe/Subscribe';
import searchCouponMixin from '../common/components/SearchCoupon/searchcoupon';
import { TrainActStore, TrainBookStore } from '../common/store';
import { newcustomerMixin } from '../common/components/NewCustomerRight/newcustomerMixin';
import trainNoticeMixin from '../common/components/TrainNotice/trainNotice';
import { getThenByTicketInfo } from '../common/components/thenByTicket/thenByTicket';

shared.preSaleDays = 30;
shared.preRobDays = 62;

const page = {
  checkPerformance: true,
  pageId: shared.pageIds.list.pageId,

  data: {
    isPrevDisable: false,
    isNextDisable: false,
    selectDateStr: '',
    selectDate: '',
    trainList: [],
    otherTrainList: [],
    filterNoTrain: false,
    filterTrainType: 1,
    filterTrainConditions: {
      Train_GC: false,
      Train_D: false,
      Train_ZTK: false,
      Train_YL: false,
    },
    filterTrainTime: 1,
    filterTimeConditions: {
      TIME_0_6: false,
      TIME_6_12: false,
      TIME_12_18: false,
      TIME_18_24: false,
    },
    sortType: 'DepartTimeStamp',
    sortAscending: true,
    isFilterViewAnimation: false,
    isPreSale: false,
    isReschedule: false,
    isOpenChangeArrival: false,
    stations: [], // 出发、到达车站
    dStation: '',
    aStation: '',
    GetOnTrainThenByTicketSoluList: [],
    isGetOnView: false,
    isHalfNoSeat: false,
    getOnMinTime: '',
    getOnMinPrice: '',
    isDisableChangeArrival: false,
    isReturn: false,
    trainTransferGroupInfos: [],
    isIphoneX: util.isIphoneX(),
    isLogin: false,
    seatCardIndex: -1,
    otherSeatCardIndex: -1,
    showSkeleton: true,
    displayLength: 100,
    noticeContent: '',
    activityCode: '',
    scene: cwx.scene,
    searchcouponHandle: false,
    isFromAwakenH5: false, // 是否由H5唤醒
    trainName: '',
    newTrainInfo: {},
    clickInfo: {},
    tinyBookingFlag: false,
    oldOrderInfo: {},
    noticeInfoList: [],
    noticeShortTips: '',
    scrollView: '',
    activeIndex: 0,
    firstNoticeDialog: false,
    isHasZhiDa: false,
    hkticket: false,
    omnipotentInfo: {},
    trainCombiInfo: {},
    omniInfoCache: [], // 缓存
    departAreaId: '',
    arriveAreaId: '', // areaid
    newGuestCardInfo: null, // 顶部新客卡片入口
    isPoint: false, //是否选中积分兑换
    subscribeGuideFlag: false,
    allLongSubFlag: false, //待订阅的消息是否长期订阅了
    remainingTime: 0, //发车剩余时间
  },
  onShareAppMessage() {
    let title =
      '我正在携程预订' +
      this.data.dStation +
      ' ⇀ ' +
      this.data.aStation +
      '的火车票';

    return {
      bu: 'train',
      title: title,
      path:
        '/pages/train/list/list?dstation=' +
        this.data.dStation +
        '&astation=' +
        this.data.aStation +
        '&ddate=' +
        shared.selectDate +
        '&departAreaId=' +
        this.data.departAreaId +
        '&arriveAreaId=' +
        this.data.arriveAreaId,
    };
  },
  // 支持 url 传参
  onLoad(options) {
    console.log('TRN list onLoad options begin:');
    console.log('TRN list onLoad options begin:', options);
    console.log('TRN list onLoad options end');
    init12306Account();
    let query = (shared.query = {});
    let { isReschedule = false } = shared;
    const { orderInfo: oldOrderInfo } = shared.rescheduleInfo || {};

    const outParams = util.getOutParams(options);
    query.dStation = outParams.dStation;
    query.aStation = outParams.aStation;
    query.departAreaId = outParams.departAreaId;
    query.arriveAreaId = outParams.arriveAreaId;
    this.setData({
      scopeData: {
        service_type: 44, // 此值固定为44
        from_loc: query.dStation,
        to_loc: query.aStation,
      },
      trainName: outParams.trainName,
      autoFilterDStation: outParams.autoFilterDStation,
      autoFilterAStation: outParams.autoFilterAStation,
      isFromAwakenH5: options.fromh5 === '1',
      isFromPC: options.fromPc, //  1 列表页 2 填写页
      isPoint: outParams.isPoint, //是否选中积分兑换标签
    });
    // taskOrderType 4为0元购， 5为特种兵
    if (options.taskOrderType) {
      this.taskOrderType = parseInt(options.taskOrderType);
    }
    // 是否锚定到中转车次推荐
    if (options.scrollToTransit) {
      this.scrollToTransit = true
    }
    let isGaotieOnly = outParams.isgd;
    shared.rescheduleCode = options.rescheduleCode || 0;
    // selectDate: YYYY-MM-DD
    shared.selectDate =
      outParams.dDate || new cDate().addDay(1).format('Y-m-d');
    const stack = getCurrentPages();
    if (stack.length == 1) {
      this.setData({ firstStack: true });
    }

    cwx.getSystemInfo({
      success: (res) => {
        // fix 在头部和底部元素的总高度
        let headAndFootHeight = 116 + 80;
        if (isReschedule) {
          headAndFootHeight += 80;
        }
        let systemHeight =
          res.windowHeight - (headAndFootHeight * res.windowWidth) / 750;
        let statusBarHeight = res.statusBarHeight;
        this.setData({
          systemHeight,
          statusBarHeight,
        });
      },
    });

    if (isGaotieOnly == 2) {
      this.setData({
        filterTrainType: 8 | 16,
        filterTrainConditions: {
          Train_GC: false,
          Train_D: false,
          Train_ZTK: true,
          Train_YL: true,
        },
      });
    } else if (isGaotieOnly) {
      this.setData({
        filterTrainType: 7,
        filterTrainConditions: {
          Train_GC: true,
          Train_D: true,
          Train_ZTK: false,
          Train_YL: false,
        },
      });
    }
    let hkticket = [shared.query.aStation, shared.query.dStation].some(
      (item) => !item.indexOf('香港')
    );
    this.setData({
      isReschedule,
      oldOrderInfo,
      aStation: shared.query.aStation,
      dStation: shared.query.dStation,
      departAreaId: shared.query.departAreaId,
      arriveAreaId: shared.query.arriveAreaId,
      aStationArea: shared.query.aStation,
      hkticket,
    });
    // 改签变更到站开关

    this.setChangeStation();

    setConfigSwitchAsyncPromise('train_wx_list_searchcoupon').then(([res]) => {
      this.setData({
        searchcouponHandle: res,
      });
      if (res) {
        if (
          (cwx.scene == '1053' || cwx.scene == '1005') &&
          this.data.isFromAwakenH5
        ) {
          this.ubtTrace('s_trn_c_trace_10320640939', {
            exposureType: 'normal',
            bizKey: 'couponBannerExposure',
            userid: cwx.user.duid,
          });
        }
      }
    });

    setConfigSwitchAsyncPromise('train_wx_list_autofilter').then(([res]) => {
      this.setData({
        autoFilterHandle: res,
      });
    });
    if (options.isdisablechangearrival) {
      this.setData({
        isDisableChangeArrival: true,
      });
    }
    if (options.return) {
      this.setData({
        isReturn: true,
      });
      this.goToCalendar(shared.selectDate);
    }
    // 此时 isGaotieOnly, isReschedule, aStation, dStation外部参数已经设置到data了
    this.loadData(shared.selectDate);
    // this.getListNotice()

    if (!isReschedule) {
      util.setTitle(`${this.data.dStation} ⇀ ${this.data.aStation}`);
    } else {
      util.setTitle('改签车次选择');
    }

    this.setData({
      isLogin: cwx.user.isLogin(),
      scene: cwx.scene,
    });

    if (!cwx.user.isLogin()) {
      cwx.user.wxLogin((_) => console.log('刷新登录态'));
    }

    wx.setBackgroundColor({
      backgroundColor: '#0086F6',
    });
    GetPreSaleDayConfig();

    // h5唤醒结果页发券
    console.log('--------scene', cwx.scene);
    if (options.fromh5 === '1') {
      this.setData({
        activityCode: 'ACB58CE9C317D2706BA30BB3F2D0DD91',
      });
      searchCouponMixin.getBusinessCouponList(
        'ACB58CE9C317D2706BA30BB3F2D0DD91'
      );
    }

    if (!this.data.isReschedule) {
      this.ubtTrace('c_trainwx_trafficlist_data', {
        openid: cwx.cwx_mkt.openid,
        dStation: this.data.dStation,
        aStation: this.data.aStation,
        departDate: cDate.parse(shared.selectDate).format('Y-m-d'),
        currentTime: Date.now(),
      });
    }

    // 顶部新客模块
    this.getNewCustomerRights();

    shared.orderSource =
      shared.orderSource || options.orderSource || options.OrderSource;
    this.getPassengerCountLimit();
    this.getConfig();
    // 判断templateArr是否都是长期订阅的消息
    this.setAllLongSubFlag();
  },
  onShow() {},
  onReady() {},

  onTrainListScroll: util.debounce(function (e) {
    const scrollTop = e.detail.scrollTop;
    this.setData({
      areaFlaot: scrollTop > 0,
      hideNotice: scrollTop > 20,
    });
  }, 16),

  async getTrainSearchCondition({
    dStation,
    aStation,
    departAreaId,
    arriveAreaId,
  }) {
    const transHongkong = (station) => {
      return station === '香港' ? '香港西九龙' : station;
    };
    try {
      const res = await getTrainSearchConditionPromise({
        DepartureName: transHongkong(dStation),
        ArrivalName: transHongkong(aStation),
        DepartureDate: cDate.parse(shared.selectDate).format('Ymd'),
        DepartureAreaId: departAreaId,
        ArrivalAreaId: arriveAreaId,
        ChannelName: 'ctrip.wx',
      });
      if (res.RetCode == 0) {
        this.setData({
          aStation:
            res.SearchConditionResults.find((item) => item.Type === 'Train')
              .ArrivalName || aStation,
          dStation:
            res.SearchConditionResults.find((item) => item.Type === 'Train')
              .DepartureName || dStation,
          departAreaId: departAreaId,
          arriveAreaId: arriveAreaId,
        });
      }
    } catch (e) {
      util.showToast('网络开小差，请稍后再试', 'none');
      throw e;
    }
  },
  async setChangeStation() {
    const config = await this.getInternationalConfig();
    const curConfig = config?.find((item) =>
      item.stations.some(
        (station) =>
          station.name === this.data.aStation ||
          station.name === this.data.dStation
      )
    );
    if (curConfig) {
      this.setData({
        isOpenChangeArrival: !curConfig.disableChangeStation,
      });
      return;
    }

    setConfigSwitchAsyncPromise('train_wx_list_openreschedule_arrival').then(
      ([res]) => {
        console.log('enter change', res);
        this.setData({
          isOpenChangeArrival: res,
        });
      }
    );
  },
  async getInternationalConfig() {
    const res = await util.promisifyModel(getConfigByKeysModel)({
      keys: ['international-train'],
    });
    return res.resultCode === 1 && res.configs[0].data;
  },
  initStationsAndselectedStations(rawList) {
    // 如果更新日期 筛选站点的选中状态不应该变化
    const {
      autoFilterDStation = '',
      autoFilterAStation = '',
      selectedStations: oldStations = [],
    } = this.data;
    let departStations = [],
      arriveStations = [],
      selectedStations = [];
    rawList.forEach((item) => {
      let { DepartStation, ArriveStation } = item;
      if (departStations.findIndex((i) => i.name === DepartStation) < 0) {
        departStations.push({
          name: DepartStation,
          isSelected:
            autoFilterDStation === DepartStation ||
            oldStations.find((v) => v.name === DepartStation)?.isSelected,
          isDepart: true,
        });
      }
      if (arriveStations.findIndex((i) => i.name === ArriveStation) < 0) {
        arriveStations.push({
          name: ArriveStation,
          isSelected:
            autoFilterAStation === ArriveStation ||
            oldStations.find((v) => v.name === ArriveStation)?.isSelected,
          isDepart: false,
        });
      }
    });
    const AllArriveStation = arriveStations.map((item) => item.name).join(',');
    const AllDepartStation = departStations.map((item) => item.name).join(',');
    const stations = departStations.concat(arriveStations);
    const stationsName = stations.map((item) => item.name);

    if (autoFilterDStation) {
      const item = stations.find((v) => v.name === autoFilterDStation);
      if (item) {
        item.isSelected = true;
      }
    }
    if (autoFilterAStation) {
      const item = stations.find((v) => v.name === autoFilterAStation);
      if (item) {
        item.isSelected = true;
      }
    }

    this.setData({
      autoFilterAStation: '', // 清空的原因是切换日期的话就不再设置了
      autoFilterDStation: '',
      AllArriveStation,
      AllDepartStation,
      selectedStations: stations.filter((v) => v.isSelected),
      stations,
    });
  },
  scrollToLower() {
    const expressTrainLength =
      this.data.trainList.length + this.data.otherTrainList.length;
    let displayLength = this.data.displayLength;
    displayLength =
      displayLength + 20 < expressTrainLength
        ? displayLength + 20
        : expressTrainLength;
    this.setData({
      displayLength,
    });
  },
  async loadData(date) {
    let selectDate = date;
    shared.selectDate = selectDate;

    this.updatePage(selectDate);
    // 获取areaid转换
    if (shared.query.departAreaId && shared.query.arriveAreaId) {
      // 没有获取areaid途径 目前需要到达出发都传areaid
      await this.getTrainSearchCondition(shared.query);
    }

    // 这个promise 获取优选中转（处理过的）和组合座信息 改签场景下不出现
    const TransferRecommedPromise = this.getTrainInsertTransferRouteRecommend(
      this.data.dStation,
      this.data.aStation,
      date,
      this.data.isReschedule
    );
    //

    const promise = this.getTrainList(
      this.data.dStation,
      this.data.aStation,
      true
    );
    const sucRatePromise = GetGrabTicketSucRateInfoPromise({
      DepartureStation: this.data.dStation,
      ArriveStation: this.data.aStation,
      DepartureDate: cDate.createUTC8CDate(shared.selectDate).format('Ymd'),
      StationsMappingList: this.StationsMapping,
    });

    const trainPromiseList = await Promise.all([
      promise,
      TransferRecommedPromise,
      sucRatePromise,
      getTrainSuccessRangeList(),
    ]);
    // TransferRecommedPromise组合座信息，和list数据一起渲染，否则抖动
    if (trainPromiseList[1].newMultipleTicketList) {
      this.rawList = this.rawList.map((train) => {
        return this.getTrainCombiInfo(
          trainPromiseList[1].newMultipleTicketList,
          train
        );
      });
    }
    if (trainPromiseList[1].onTrainThenByTicketSoluList) {
      this.getTrainThenByTicketList(
        this.rawList,
        trainPromiseList[1].onTrainThenByTicketSoluList
      );
    }
    // 优选中转在这里处理
    if (trainPromiseList[1].recommendLines) {
      this.rawList.push(...trainPromiseList[1].recommendLines);
      util.ubtTrace('s_trn_c_10320640939', {
        exposureType: 'normal',
        bizKey: 'transferSuggestion',
      });
      trainPromiseList[1].recommendLines.forEach((item) => {
        const sceneArr = ['A', 'B', 'C', 'D', 'F', 'E'];
        const TrnFromScene = sceneArr[item.RecommendType - 1];
        util.ubtTrace('TCWListPage_TransitRecommend_exposure', {
          PageId: '10320640939',
          DepartStation: this.data.dStation,
          ArriveStation: this.data.aStation,
          TrnFromScene,
        });
      });
    }
    // renderFiltered
    await this.initQuickFilter();

    this.getGrabTicketSucRateInfo(trainPromiseList[2]);

    this.renderFiltered();
    promise.then(async () => {
      this.setData({
        showSkeleton: false,
      });
      this.getListNotice();
    });

    return promise.then(() => {
      // 定位并打开对应车次
      setTimeout(() => {
        if (this.data.trainName) {
          this.scrollToTrain(this.data.trainName);
        }
        // 跳转到中转推荐
        if (this.scrollToTransit) {
          this.scrollToTransit = false
          this.onTapToTrainTransferList()
        }
      }, 200);
    });
  },
  loadGetOnList() {
    const params = {
      DepartStation: this.data.dStation,
      ArriveStation: this.data.aStation,
      DepartDate: cDate.parse(shared.selectDate).format('Ymd'),
      MainTrainNums: '',
      FromType: 0, // 列表页传 0
    };

    return GetOnTrainThenByTicketSoluPromise(params)
      .then((data) => {
        if (data.ResultCode == 0) {
          return data.GetOnTrainThenByTicketSoluList;
        }
      })
      .then((list) => {
        this.setData({
          GetOnTrainThenByTicketSoluList: list,
        });

        return list;
      });
  },
  getTrainList(dStation, aStation, notRender) {
    const deferred = util.getDeferred();
    util.showLoading();
    this.isLoading = true;

    const transHongkong = (station) => {
      return station === '香港' ? '香港西九龙' : station;
    };
    const params = {
      DepartStation: transHongkong(dStation),
      ArriveStation: transHongkong(aStation),
      DepartDate: shared.selectDate,
      ChannelName: 'ctrip.wx',
    };

    TrainListModel(
      params,
      (data) => {
        const TrainInfoList =
          (data && data.ResponseBody && data.ResponseBody.TrainInfoList) || [];
        let raw = TrainInfoList;
        raw = util.handleTrains(raw, params.DepartDate);
        this.setData({
          isHasZhiDa: raw.length ? true : false,
        });
        const noDataCb = () => {
          // 没有中转车次就将中转车次进行清空
          this.setData({
            trainTransferGroupInfos: [],
          });
          if (!raw.length) {
            util.hideLoading();

            return util.showModal({
              m: '暂无可售票，请换一天试试。',
            });
          }

          // 没有车次的话不应该发券 不然弹窗会被覆盖掉
          this.getListPromoPop({
            SceneType: 1,
            ArriveStation: this.data.aStation,
          });
        };
        if (!this.data.isReschedule) {
          TransferListPromise({
            DepartStation: transHongkong(dStation),
            ArriveStation: transHongkong(aStation),
            DepartDate: shared.selectDate,
            Channel: 'ctrip.wx',
          }).then((data) => {
            if (!data || !data.length) {
              noDataCb();

              return;
            }
            if (data[0].paramDepartDate !== shared.selectDate) {
              // 若获取到的车次日期与当前日期不符合，则返回，以免覆盖当前日期列表
              return;
            }

            util.ubtTrace('TCWListPage_BottomTransit_exposure', {
              PageId: '10320640939',
              DepartStation: this.data.dStation,
              ArriveStation: this.data.aStation,
              Status: raw.length ? 1 : 2,
            });
            this.setData({
              trainTransferGroupInfos: data.map((item) => {
                const departTimeMin =
                  parseInt(
                    item.TrainTransferInfos[0].DepartTime.split(':')[0] * 60
                  ) +
                  parseInt(item.TrainTransferInfos[0].DepartTime.split(':')[1]);
                return {
                  ...item,
                  _ShowPriceText: item.ShowPriceText.substring(
                    1,
                    item.ShowPriceText.length - 1
                  ),
                  DepartTimeStamp: departTimeMin,
                  RunTime: item.TransferTakeTime,
                  Price: parseInt(
                    item.ShowPriceText.substring(
                      1,
                      item.ShowPriceText.length - 1
                    )
                  ),
                  isHasZhiDa: this.data.isHasZhiDa,
                };
              }),
            });

            // const {trainList = [], otherTrainList = []} = this.data
            // this.render(trainList,otherTrainList )
          });
        } else {
          noDataCb();
        }

        const dDate = params.DepartDate;
        const now = new Date().getTime();

        raw.forEach((val) => {
          if (val.SaleNote.indexOf('列车运行图调整') !== -1) {
            val.isPreSale = true;
            val.preSaleTimeStr = '列车运行图调整，可预约抢票，开售自动抢';

            return;
          }
          let saleDay = cDate.parse(dDate).addDay(-val.PreSaleDay || 0);
          let saleDateStr = saleDay.format('Y-m-d');
          let saleDayStr = saleDateStr + ' ' + val.PreSaleTime || '00:00';
          let saleDate = cDate.parse(saleDayStr).getTime();
          if (saleDate - now > 0) {
            val.isPreSale = true;
            val.preSaleTimeStr =
              saleDay.format('n月j日') +
              val.PreSaleTime +
              '开售,可预约抢票,开售自动抢';
          }
          val.isUrgentSeat = this.handleIsUrgentSeat(val.SeatList);
        });
        // 保存原始车次列表
        this.rawList = raw;
        this.StationsMapping = getStationsMapping(raw);
        // 处理selectedStations 和 stations
        this.initStationsAndselectedStations(raw);
        this.getTopStations();
        !notRender && this.renderFiltered();
        util.hideLoading();
        this.isLoading = false;
        deferred.resolve(raw);
      },
      (err) => {
        util.hideLoading();
        this.isLoading = false;
        deferred.reject(err);
      },
      () => {}
    );

    return deferred.promise;
  },

  // 获取中转推荐方案
  getTrainInsertTransferRouteRecommend(dStation, aStation, date, isReschedule) {
    const defer = util.getDeferred();
    if (isReschedule) {
      defer.resolve({});
    } else {
      const DepartDate = date.replace(/-/g, '');
      const params = {
        DepartName: dStation,
        ArriveName: aStation,
        DepartDate,
        QueryType: 'Train',
      };
      TrainInsertTransferRouteRecommendModel(
        params,
        (data) => {
          const {
            TransferLines,
            NewMultipleTicketList,
            RetCode,
            OnTrainThenByTicketSoluList,
          } = data;
          let recommendLines = [],
            newMultipleTicketList = [],
            onTrainThenByTicketSoluList = [];
          if (RetCode !== 1) return defer.resolve({});

          if (TransferLines?.length) {
            recommendLines = this.handleRecommendTransferLines(TransferLines);
          }
          if (NewMultipleTicketList?.length) {
            newMultipleTicketList = NewMultipleTicketList;
          }
          if (OnTrainThenByTicketSoluList?.length) {
            onTrainThenByTicketSoluList = OnTrainThenByTicketSoluList;
          }
          console.log(
            'onTrainThenByTicketSoluList是有值的',
            onTrainThenByTicketSoluList
          );
          // 处理
          defer.resolve({
            recommendLines,
            newMultipleTicketList,
            onTrainThenByTicketSoluList,
          });
        },
        () => {
          defer.resolve({});
        }
      );
    }
    return defer.promise;
  },
  handleIsUrgentSeat(seatList) {
    if (!seatList || !seatList.length) return;
    return seatList.some((item) => item.IsUrgent);
  },
  getGrabTicketSucRateInfo(data) {
    const { ResultCode, TrainSucRateList } = data;
    if (ResultCode === 0 && TrainSucRateList.length > 0) {
      // getTrainListPromise.then((trainList) => {
      if (this.rawList && this.rawList.length > 0) {
        const trainSucRateMap = this.convertTrainSucRateList(TrainSucRateList);
        this.rawList = this.rawList.map((train) => {
          // 如果是优选中转，不处理成功率
          if (train.TrainTransferInfos) return train;
          if (
            trainSucRateMap[train.TrainNumber] &&
            this.isNeedShowGrabSucRate(train)
          ) {
            return Object.assign({}, train, {
              SucRate: handleGrabRate(trainSucRateMap[train.TrainNumber]),
            });
          }
          return train;
        });
      }

      // })
    }
  },

  getListNotice() {
    const params = {
      ChannelName: 'ctripwx',
      From: this.data.dStation,
      To: this.data.aStation,
      DepartDate: shared.selectDate,
      AllDepartStation: this.data.AllDepartStation,
      AllArriveStation: this.data.AllArriveStation,
      FromType: 0,
    };
    TrainGetStationTipInfoModel(params, (res) => {
      if (res.RetCode == 1) {
        this.noticeUrl = res.JumpUrl;
        const noticeInfoList = [];
        const trainNoticeTitle = [];
        if (res.CovidTipList?.length) {
          trainNoticeTitle.push('出行提醒');
          noticeInfoList.push({
            Title: '出行提醒',
            tipList: res.CovidTipList,
          });
        }
        if (res.CovidInfoList?.length) {
          noticeInfoList.push(...res.CovidInfoList);
          res.CovidInfoList.forEach((item) => {
            trainNoticeTitle.push(item.Title.slice(0, item.Title.length - 2));
          });
        }
        noticeInfoList.forEach((item, index) => {
          if (item.LeavePolicy) {
            item.LeavePolicy = item.LeavePolicy.replace(/</gi, '&lt;');
          }
          if (item.ComePolicy) {
            item.ComePolicy = item.ComePolicy.replace(/</gi, '&lt;');
          }
        });
        this.setData({
          noticeContent: res.Tips,
          noticeShortTips: res.ShortTips,
          noticeInfoList,
          trainNoticeTitle,
          noticeDesc: res.ReliefContent,
        });
        if (res.ShortTips) {
          util.ubtFuxiTrace('225038', { PageId: this.pageId });
        }
        this.noticeMoreUrl = res.MoreUrl;
      }
    });
  },
  recieveBusinessCoupon(e) {
    if (this.data.searchCouponInfo?.hasReceived) return;
    searchCouponMixin.recieveBusinessCoupon(e, async () => {
      // 已登录
      let HASSUBSCRIBED = TrainActStore.getAttr('HASSUBSCRIBED');
      if (shared.isCtripApp && !HASSUBSCRIBED) {
        let res = await this.getSubsribeStatus();
        console.log('-----------subscribeStatus', res);
        //  可以订阅 (未订阅过)
        if (res.Status !== 1) {
          this.setData({ showType: 'subscribeForRecieveCoupon' });
          this.setHasSubscribedStorageTimeout();
        }
      }
    });
  },
  // 高铁二等座、动车二等座、普通硬座硬卧,无票时显示抢票成功率
  isNeedShowGrabSucRate(train) {
    if (util.isGaoTie(train.TrainNumber) || util.isDongChe(train.TrainNumber)) {
      return train.SeatList.some(
        (seat) =>
          util.isSecondClassSeat(seat.SeatName) && seat.SeatInventory === 0
      );
    } else {
      return train.SeatList.some(
        (seat) =>
          (util.isHardSeat(seat.SeatName) ||
            util.isHardLieSeat(seat.SeatName)) &&
          seat.SeatInventory === 0
      );
    }
  },
  // 将数组转换成对象
  convertTrainSucRateList(list = []) {
    const map = {};
    for (let { TrainNum, SeatTypeSucRateList } of list) {
      map[TrainNum] = SeatTypeSucRateList[0].TrainSucRate;
    }

    return map;
  },

  // 车次排序
  sortBy(e) {
    let sortType = e.currentTarget.dataset.type;
    const { trainList = [], otherTrainList = [] } = this.data;
    this.ubtTrace('o_tra_dibutabjiage_click', sortType == 'Price');
    this.ubtTrace('o_tra_dibutabhaoshi_click', sortType == 'RunTime');
    this.ubtTrace('o_tra_dibutabshijian_click', sortType == 'DepartTimeStamp');
    util.ubtTrace('TCWListPage_BottomButton_click', {
      PageId: '10320640939',
      DepartStation: this.data.dStation,
      ArriveStation: this.data.aStation,
      Status: this.data.isHasZhiDa ? 1 : 2,
      clickType:
        sortType == 'DepartTimeStamp' ? 2 : sortType == 'RunTime' ? 3 : 4,
    });
    if (sortType == this.data.sortType) {
      this.setData({
        seatCardIndex: -1,
        sortAscending: !this.data.sortAscending,
      });
      this.render(trainList, otherTrainList);
      return;
    }

    this.setData({
      sortType,
      seatCardIndex: -1,
      sortAscending: true,
    });

    this.render(trainList, otherTrainList);
  },
  // 真正筛选的逻辑
  renderFiltered() {
    if (!this.rawList) {
      return;
    }
    // raw包含直达和智慧中转，根据时间和车型筛选
    let expressTrain = this.rawList;
    expressTrain = this.filterByTime(expressTrain);
    // 处理跑腿改签逻辑 this.data.isReschedule && todo
    if (this.data.isReschedule && shared.rescheduleCode == 2) {
      console.log('resc');
      expressTrain = this.filterArtiRescheduleStation(expressTrain);
    }
    const {
      selectedStations = [],
      stations = [],
      filterTrainType = 1,
      quickFilterTags = [],
    } = this.data;
    const hasSelectedTrainType = filterTrainType != 1;
    const hasSelectedStation = selectedStations?.some(
      (item) => item.isSelected
    );
    let mainTrainList = [],
      otherTrainList = [];
    // 如果只筛选车型，那么就只根据车型分为主要方案 和 其他方案
    if (hasSelectedTrainType && !hasSelectedStation) {
      const allTrain = expressTrain;
      mainTrainList = this.filterByType(allTrain);
      otherTrainList = allTrain.filter(
        (aTrain) =>
          !mainTrainList.find(
            (mTrain) => mTrain.TrainNumber === aTrain.TrainNumber
          )
      );
      // 同时有 车型筛选和城市筛选 数据根据城市分为主要方案和其他方案
    } else if (hasSelectedTrainType && hasSelectedStation) {
      const allTrain = this.filterByType(expressTrain);
      mainTrainList = selectedStations.length
        ? this.filterByStation(allTrain, selectedStations)
        : this.filterByStation(allTrain, stations);
      otherTrainList = allTrain.filter(
        (aTrain) =>
          !mainTrainList.find(
            (mTrain) => mTrain.TrainNumber === aTrain.TrainNumber
          )
      );
    } else {
      const allTrain = expressTrain;
      mainTrainList = selectedStations.length
        ? this.filterByStation(allTrain, selectedStations)
        : this.filterByStation(allTrain, stations);
      otherTrainList = allTrain.filter(
        (aTrain) =>
          !mainTrainList.find(
            (mTrain) => mTrain.TrainNumber === aTrain.TrainNumber
          )
      );
    }
    // 对于快筛标签（但是与筛选器无联动的选项）
    if (quickFilterTags) {
      const tagMapKey = {
        fuXingTag: 'IsFuXingTrain',
        silentTag: 'IsCanSilent',
        derictTag: 'trainType', //只有直达车次有这个字段
        enoughTag: 'IsBookable',
        pointTag: 'IsCanPointsPay',
      };
      const newTags = quickFilterTags.filter(
        (v) => v.isSelected && tagMapKey[v.tagType]
      );
      newTags.forEach((v) => {
        mainTrainList = mainTrainList.filter(
          (train) => train[tagMapKey[v.tagType]]
        );
        otherTrainList = otherTrainList.filter(
          (train) => train[tagMapKey[v.tagType]]
        );
      });
    }
    // 其他方案埋点
    if (otherTrainList.length)
      util.ubtTrace('s_trn_c_10320640939', {
        exposureType: 'normal',
        bizKey: 'preciseSearchNoResult',
      });
    this.render(mainTrainList, otherTrainList);
  },
  // 优化渲染性能
  render(mainTrainList, otherTrainList = []) {
    mainTrainList = _.sortBy(mainTrainList, this.data.sortType);
    otherTrainList = _.sortBy(otherTrainList, this.data.sortType);
    this.setData({
      scrollTopHeight: 0,
      areaFlaot: false,
      hideNotice: false,
    });
    if (!this.data.sortAscending) {
      mainTrainList.reverse();
      otherTrainList.reverse();
    }
    try {
      if (mainTrainList.length + otherTrainList.length > 20) {
        let part1 = mainTrainList.slice(0, 20);
        part1 =
          20 - mainTrainList.length > 0
            ? part1.concat(otherTrainList.slice(0, 20 - mainTrainList.length))
            : part1;
        this.setData({
          trainList: part1,
        });

        setTimeout(() => {
          this.setData({
            trainList: mainTrainList,
            otherTrainList,
          });
          this.renderTransfer();
        }, 50);
      } else {
        this.setData({
          trainList: mainTrainList,
          otherTrainList,
        });
        this.renderTransfer();
      }
    } catch (e) {}
  },
  renderTransfer() {
    const { trainTransferGroupInfos = [] } = this.data;
    let sortTrainTransferGroupInfos = _.sortBy(
      trainTransferGroupInfos,
      this.data.sortType
    );
    if (!this.data.sortAscending) {
      sortTrainTransferGroupInfos.reverse();
    }
    this.setData({
      trainTransferGroupInfos: sortTrainTransferGroupInfos,
    });
  },

  // 处理中转推荐车次信息
  handleRecommendTransferLines(TransferLines) {
    let recommandLines = [];
    const transToDate = (str) => {
      return str.replace(
        /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g,
        (_, $1, $2, $3, $4, $5, $6) => {
          return `${$1}/${$2}/${$3} ${$4}:${$5}:${$6}`;
        }
      );
    };
    const getTransferTakeTime = (Lines) => {
      if (!Lines) return 0;
      let DepartTime = transToDate(Lines[0].Train.DepartTime);
      let ArriveTime = transToDate(Lines[Lines.length - 1].Train.ArriveTime);

      let diff =
        new Date(ArriveTime).getTime() - new Date(DepartTime).getTime();
      return diff / 1000 / 60;
    };
    const getPeriod = (DepartTimeStamp) => {
      const hours = new Date(+DepartTimeStamp).getHours();
      const timeSlot = [0, 6, 12, 18];
      return hours >= timeSlot[0] && hours < timeSlot[1]
        ? 2
        : hours >= timeSlot[1] && hours < timeSlot[2]
        ? 4
        : hours >= timeSlot[2] && hours < timeSlot[3]
        ? 8
        : 16;
    };
    const getTrainType = (TrainNumber) => {
      const type = TrainNumber[0];
      const fastTrainSign = ['G', 'C'];
      const DTrainSign = ['D'];
      const ZTKTrainSign = ['Z', 'T', 'K'];
      if (fastTrainSign.indexOf(type) >= 0) {
        return 2;
      } else if (DTrainSign.indexOf(type) >= 0) {
        return 4;
      } else if (ZTKTrainSign.indexOf(type) >= 0) {
        return 8;
      } else {
        return 16;
      }
    };
    try {
      recommandLines = TransferLines.map((trainLine) => {
        const {
          TransferLineTip,
          TransferDesc,
          Lines = [],
          TotalPrice,
          RecommendType,
        } = trainLine;
        const TransferTakeTime = getTransferTakeTime(Lines); // 全程花费时间
        // 换乘需要时间
        const transtime = Lines.reduce(
          (pre, cur) => pre - cur.Train.RunTime,
          TransferTakeTime
        );
        const transtimestr = util.costTimeString(transtime);
        const costalltime = util.costTimeString(TransferTakeTime);
        const DAYMS = 24 * 60 * 60 * 1000;
        const departDate = transToDate(Lines[0].Train.DepartTime).split(' ')[0];
        const arriveDate = transToDate(
          Lines[Lines.length - 1].Train.ArriveTime
        ).split(' ')[0];
        const takeDays = Math.floor(
          (new Date(arriveDate).getTime() +
            1000 -
            new Date(departDate).getTime()) /
            DAYMS
        );
        const DepartTimeStamp = +new Date(
          transToDate(Lines[0].Train.DepartTime)
        ).getTime();
        const timePeriod = getPeriod(DepartTimeStamp);
        const firstTrainType = getTrainType(Lines[0].Train.TrainNumber);
        const secondTrainType = getTrainType(Lines[1].Train.TrainNumber);
        // 需要跳转中转页，字段与中转列车保持一致
        const TrainTransferInfos = Lines.map((train) => {
          const { Train = [], Index } = train;
          Train.SeatList.forEach((seatInfo) => {
            if (seatInfo.SeatInventory != 0 && seatInfo.SeatBookable) {
              Train.hasSeat = true;
            } else {
              seatInfo.disabled = true;
            }
          });
          if (!Train.hasSeat) return;
          const DepartTimeStamp = new Date(
            transToDate(Train.DepartTime)
          ).getTime();
          const ArriveTimeStamp = new Date(
            transToDate(Train.ArriveTime)
          ).getTime();
          // 变成这种格式/Date(1639721460000+0800)/
          Train.DepartDate = `/Date(${DepartTimeStamp}+0800)`;
          Train.ArriveDate = `/Date(${ArriveTimeStamp}+0800)`;
          Train.ArriveTime = transToDate(Train.ArriveTime)
            .split(' ')[1]
            .substring(0, 5);
          Train.DepartTime = transToDate(Train.DepartTime)
            .split(' ')[1]
            .substring(0, 5);
          Train.Sequence = Index + 1;
          Train.mainSeat = Train.SeatList.filter(
            (seatItem) => seatItem.SeatInventory != 0 && seatItem.SeatBookable
          )[0].SeatName;
          return Train.hasSeat && Train;
        });
        const [{ hasSeat: hasFirstSeat }, { hasSeat: hasSecondSeat }] =
          TrainTransferInfos;
        return {
          TransferLineTip,
          TransferDesc,
          ArriveStation: Lines[Lines.length - 1].Train.ArriveStation,
          DepartStation: Lines[0].Train.DepartStation,
          TransferStation: Lines[0].Train.ArriveStation,
          TransferTakeTime,
          costalltime,
          takeDays,
          transtimestr,
          TrainTransferInfos,
          _ShowPriceText: TotalPrice,
          ShowPriceText: `￥${TotalPrice}起`,
          RecommendType,
          // 插入中转列表时排序要用到的
          RunTime: TransferTakeTime,
          DepartTimeStamp,
          Price: TotalPrice,
          timePeriod,
          firstTrainType,
          secondTrainType,
          transferTime: transtime,
          isHasZhiDa: this.data.isHasZhiDa, // 中转页埋点
          IsBookable: hasFirstSeat || hasSecondSeat,
        };
      });
      recommandLines = recommandLines.filter(
        (line) =>
          line.TrainTransferInfos &&
          line.TrainTransferInfos.every((train) => train && train.hasSeat)
      );
    } catch (e) {
      console.log('处理中转推荐方案失败', e);
    }
    return recommandLines;
  },

  // feat 更改终点站按钮
  changeArrivalsHandle() {
    const { orderInfo: oldOrderInfo } = shared.rescheduleInfo || {};
    const hasStudent = oldOrderInfo.TicketInfos[0].PassengerInfos.some(
      (pas) => pas.TicketType == 3
    );
    let _this = this;
    let currentTime = +new Date();
    let departTime = new Date(
      (
        oldOrderInfo.TicketInfos[0].DepartDate +
        ' ' +
        oldOrderInfo.TicketInfos[0].DepartTime
      ).replace(/-/g, '/')
    ).getTime();
    if (departTime - currentTime <= 48 * 3600 * 1000) {
      util.showModal({
        m: '根据铁路局规定，变更到达站需在发车前48小时以上进行办理；如您仍需变更到达站，建议退票后重新购票',
        confirmText: '确定',
        showCancel: false,
        done(res) {
          if (res.confirm) {
            _this.ubtTrace(
              'train_wx_list_reschedule_change_arrival_forbidden',
              true
            );
          }
        },
      });

      return;
    } else {
      if (hasStudent) {
        util.showModal({
          m: '学生票需确保出发站和到达站与学生证上的优惠区间保持一致，否则无法取票，确定要变更到站吗',
          confirmText: '确定',
          showCancel: true,
          cancelText: '取消',
          done(res) {
            if (res.confirm) {
              _this.ubtTrace('train_wx_list_stureschedule', true);
              _this.changeArrivals();
            }
          },
        });
      } else {
        _this.changeArrivals();
      }
    }
  },
  // feat 更改终点站
  changeArrivals() {
    openCity({}, (obj) => {
      this.setData({
        aStation: obj.cityName,
      });
      this.getTrainList(this.data.dStation, obj.cityName);
    });
  },
  selectTime(e) {
    let time = e.currentTarget.dataset.time;
    let type = time ^ this.data.filterTrainTime;
    this.setData({
      filterTrainTime: type,
      filterTimeConditions: {
        TIME_0_6: type & 2,
        TIME_6_12: type & 4,
        TIME_12_18: type & 8,
        TIME_18_24: type & 16,
      },
    });
    const selectedTime = Object.keys(this.data.filterTimeConditions).filter(
      (key) => this.data.filterTimeConditions[key]
    );
    this.ubtDevTrace('c_train_list_actionbar_filter', {
      selectedTime: selectedTime.join(','),
    });
  },
  selectType(e) {
    let type = e.currentTarget.dataset.type;
    let filterType = type ^ this.data.filterTrainType;
    this.setData({
      filterTrainType: filterType,
      filterTrainConditions: {
        Train_GC: filterType & 2,
        Train_D: filterType & 4,
        Train_ZTK: filterType & 8,
        Train_YL: filterType & 16,
      },
    });
    const selectedType = Object.keys(this.data.filterTrainConditions).filter(
      (key) => this.data.filterTrainConditions[key]
    );
    this.ubtDevTrace('c_train_list_actionbar_filter', {
      selectedType: selectedType.join(','),
    });
  },
  filterByType(data) {
    if (!data) {
      return [];
    }

    return data.filter((val) => {
      let res = false;
      if (val.TransferLineTip) {
        res =
          val.firstTrainType & this.data.filterTrainType &&
          val.secondTrainType & this.data.filterTrainType;
      } else {
        res = val.trainType & this.data.filterTrainType;
      }
      return this.data.filterTrainType == 1 || res;
    });
  },
  filterByTime(data) {
    if (!data) {
      return [];
    }
    return data.filter((val) => {
      return (
        this.data.filterTrainTime == 1 ||
        val.timePeriod & this.data.filterTrainTime
      );
    });
  },
  filterArtiRescheduleStation(data) {
    if (!data) {
      return [];
    }
    let originalDepartTimeStamp = new Date(
      (
        shared.rescheduleInfo.orderInfo.TicketInfos[0].DepartDate +
        ' ' +
        shared.rescheduleInfo.orderInfo.TicketInfos[0].DepartTime
      ).replace(/-/g, '/')
    ).getTime();
    let currentDepartTimeStamp = new Date().getTime();
    console.log('filterArtiRescheduleStation', data);
    return data.filter((val) => {
      return val.DepartTimeStamp - currentDepartTimeStamp >= 1000 * 60 * 60;
    });
  },

  filterByStation(data, selectedStations) {
    if (!data) {
      return [];
    }
    // const selectedStations = stations.filter(val => val.isSelected)
    if (!selectedStations.length) {
      return data;
    }
    const selectedStationsDepart = selectedStations.filter(
      (item) => item.isDepart && item.isSelected
    );
    const selectedStationsArrive = selectedStations.filter(
      (item) => !item.isDepart && item.isSelected
    );

    if (selectedStationsDepart.length) {
      data = data.filter((val) =>
        selectedStationsDepart.find((s) => s.name === val.DepartStation)
      );
    }
    if (selectedStationsArrive.length) {
      data = data.filter((val) =>
        selectedStationsArrive.find((s) => s.name === val.ArriveStation)
      );
    }

    return data;
  },
  // 点击筛选浮层的车站
  selectStation(e) {
    const stations = this.data.stations;
    const s = stations[e.currentTarget.dataset.index];
    s.isSelected = !s.isSelected;
    this.setData({
      stations,
      selectedStations: stations.filter((v) => v.isSelected),
    });
  },
  resetFilter() {
    const stations = this.data.stations;
    stations.forEach((s) => (s.isSelected = false));
    this.setData({
      filterTrainType: 1,
      filterTrainTime: 1,
      filterTrainConditions: {
        Train_GC: false,
        Train_D: false,
        Train_ZTK: false,
        Train_YL: false,
      },
      filterTimeConditions: {
        TIME_0_6: false,
        TIME_6_12: false,
        TIME_12_18: false,
        TIME_18_24: false,
      },
      stations,
      selectedStations: stations.filter((v) => v.isSelected),
    });
    this.updateQuickFilter();
    this.renderFiltered();
  },
  confirmFilter() {
    if (this.data.filterTrainType !== 1) {
      this.ubtTrace('o_tra_shaixuanchexing_click', true);
    }
    if (this.data.filterTrainTime !== 1) {
      this.ubtTrace('o_tra_shaixuanshijian_click', true);
    }
    let hasSelectedStation = this.data.selectedStations?.some(
      (item) => item.isSelected
    );
    if (hasSelectedStation) {
      this.ubtTrace('o_tra_shaixuanzhan_click', true);
    }
    // this.initQuickFilter()
    this.hideFilterView();
  },
  updatePage(date) {
    let isPrevDisable = false,
      isPreSale = false,
      isNextDisable = false;
    let tmp = cDate.createUTC8CDate(date);
    let min = cDate.createUTC8CDate();
    let max = cDate.createUTC8CDate().addDay(shared.preSaleDays - 1);

    let selectDateStr =
      cDate.createUTC8CDate(date).format('n月j日') +
      ' ' +
      cDate.createUTC8CDate(date).format('D') +
      ' ' +
      cDate.weekday(date);

    // todo: enhancement 修复disable失效
    if (tmp.getTime() <= min.getTime()) {
      isPrevDisable = true;
    }
    if (
      new cDate().addDay(shared.preRobDays).format('n月j日') ===
      new cDate(date).format('n月j日')
    ) {
      isNextDisable = true;
    }
    if (tmp.getTime() >= max.getTime()) {
      isPreSale = true;
    }

    this.setData({
      isPrevDisable,
      isNextDisable,
      selectDateStr,
      isPreSale,
    });
    this.ubtTrace('listDateStr', selectDateStr);
  },
  chooseDate(e) {
    let departTimeStamp = this.data.isReschedule
      ? new Date(
          (
            shared.rescheduleInfo.orderInfo.TicketInfos[0].DepartDate +
            ' ' +
            shared.rescheduleInfo.orderInfo.TicketInfos[0].DepartTime
          ).replace(/-/g, '/')
        ).getTime()
      : '';
    let type = e.currentTarget.dataset.type;
    let current = shared.selectDate;
    let date;

    // 切换日期时不再显示下列表下拉领带
    this.setData({
      seatCardIndex: -1,
    });

    switch (type) {
      case 'prev':
        if (this.isLoading || this.data.isPrevDisable) return;
        date = cDate.createUTC8CDate(current).addDay(-1).format('Y-m-d');
        util.devTrace('', {
          desc: '列表页选择日期',
          date,
          isReschedule: this.data.isReschedule,
        });
        this.loadData(date);
        break;
      case 'next':
        if (this.isLoading || this.data.isNextDisable) return;

        // 48h内改签 选择日期为发车日期时 点击后一天出现弹框
        if (
          this.data.isReschedule &&
          departTimeStamp - new Date().getTime() < 48 * 3600 * 1000 &&
          current === shared.rescheduleInfo.orderInfo.TicketInfos[0].DepartDate
        ) {
          util.showModal({
            m: '铁路局规定，发车前48小时内改签，只能改签票面日期当日24:00以前的其他列车',
          });

          return;
        }

        date = cDate.createUTC8CDate(current).addDay(1).format('Y-m-d');
        util.devTrace('', {
          desc: '列表页选择日期',
          date,
          isReschedule: this.data.isReschedule,
        });
        this.loadData(date);
        break;
      case 'calendar':
        date = current;

        return this.goToCalendar(date);
    }
  },
  goToCalendar(date) {
    let tmp = cDate.createUTC8CDate(date).format('Y-n-j');
    let departTimeStamp = this.data.isReschedule
      ? new Date(
          (
            shared.rescheduleInfo.orderInfo.TicketInfos[0].DepartDate +
            ' ' +
            shared.rescheduleInfo.orderInfo.TicketInfos[0].DepartTime
          ).replace(/-/g, '/')
        ).getTime()
      : '';
    openCalendar(
      {
        choosenDate: tmp,
        title: this.data.isReturn ? '选择返程日期' : '选择出发日期',
        tips: shared.calendarTip,
        enddate:
          this.data.isReschedule &&
          departTimeStamp - new Date().getTime() < 48 * 3600 * 1000
            ? new cDate(departTimeStamp).format('Y-n-j')
            : '', // 当前时间距离当前车票出发时间大于48h 可以改签所有(当天到预售最后一天)日期车票 否则只能改签当前车车票当天及之前时间
      },
      (date) => {
        date = cDate.createUTC8CDate(date).format('Y-m-d');
        util.devTrace('', {
          desc: '列表页选择日期',
          date,
          isReschedule: this.data.isReschedule,
          isReturn: this.data.isReturn,
        });
        this.loadData(date);
      }
    );
  },
  onTapToTrainTransferList() {
    util.ubtTrace('c_trn_c_10320640939', { bizKey: 'transferSuggestionClick' });
    this.setData({
      scrollToView: 'train_transfer_list',
    });
  },

  async clickTrainItem(e) {
    const { index = 0, isfromotherlist = false } = e.currentTarget.dataset;
    let newTrain = await this.reGetTrainItem(index, isfromotherlist);
    const seatCardIndex = isfromotherlist
      ? this.data.otherSeatCardIndex
      : this.data.seatCardIndex;
    const trainList = isfromotherlist
      ? this.data.otherTrainList
      : this.data.trainList;
    this.newTrain = newTrain;
    this.isfromotherlist = isfromotherlist;
    this.selectTrainItemIndex = index;
    // 无票车次直接跳转到抢票页 会使用默认的座席 util.handleTrains
    // if (this.data.isReschedule && !newTrain.SeatCount) {
    //     if (!this.validateReschedule()) return
    // } else {
    // 展示下拉座席按钮
    if (!this.data.isReschedule && seatCardIndex > -1) {
      const oldTrain = trainList[seatCardIndex];
      if (oldTrain?.SeatList) {
        oldTrain.Price = oldTrain.SeatList[0]?.SeatPrice;
        this.setNewTrainList(oldTrain, isfromotherlist);
      }
    }
    if (newTrain?.isTingYun) {
      util.showToast('列车已停运', 'none');
    }
    if (index === seatCardIndex) {
      if (isfromotherlist) {
        this.setData({
          otherSeatCardIndex: -1,
        });
      } else {
        this.setData({
          seatCardIndex: -1,
        });
      }
    } else {
      // 临近发车提醒
      let selectedDepartTime = trainList[index].DepartTimeStamp;
      const curr = new cDate().getTime();
      const remainingTime = Math.floor((selectedDepartTime - curr) / 1000 / 60);
      if (remainingTime <= 20) {
        this.setData({
          remainingTime,
          showType: 'departureTimeTipPopShow',
        });
        return;
      }
      await this.handleTrainItemPullDownEvents();
    }
  },

  async handleTrainItemPullDownEvents() {
    if (this.isfromotherlist) {
      this.setData({
        otherSeatCardIndex: this.selectTrainItemIndex,
        seatCardIndex: -1,
      });
    } else {
      this.setData({
        seatCardIndex: this.selectTrainItemIndex,
        otherSeatCardIndex: -1,
      });
    }
    if (!this.data.isReschedule) {
      const processedTrain = await this.getSeatVendorInfo(this.newTrain);
      // 只有展开坐席才要去判断有无智慧方案，智慧方案是否一致
      this.setNewTrainList(processedTrain, this.isfromotherlist);
    }
    setTimeout(() => {
      this.calculateScrollTop(this.isfromotherlist);
    }, 200);
  },

  getTrainCombiInfo(newMultipleTicketList, trainItem) {
    const train = Object.assign({}, trainItem);
    const newMultipleTicketItem = newMultipleTicketList.find(
      (item) =>
        item.TrainNumber === train.TrainNumber &&
        item.DepartStation === train.DepartStation &&
        item.ArriveStation === train.ArriveStation
    );
    if (newMultipleTicketItem && !this.data.isReschedule) {
      newMultipleTicketItem?.SolutionInfoList.map((solution) => {
        const trainSeatItem = train.SeatList.find(
          (item) => item.SeatName === solution.SeatType
        );
        if (trainSeatItem) {
          train.hasWiseSeatRecommend = true;
          trainSeatItem.hasWiseSeatRecommend = true;
          trainSeatItem.wiseTag = '组合';
        }
      });
      const { Remark, SeatType, TicketList, TripType } =
        newMultipleTicketItem?.SolutionInfoList[0];
      util.ubtTrace('TCWListPage_IntelligentPlan_exposure', {
        PageId: '10320640939',
        DepartStation: newMultipleTicketItem.DepartStation,
        ArriveStation: newMultipleTicketItem.ArriveStation,
        scmType: 1,
        TrainNumber: newMultipleTicketItem.TrainNumber,
      });
      return {
        ...train,
        combiInfo: {
          remark: Remark,
          seatType: SeatType,
          ticketList: TicketList,
          tripType: TripType
        },
      };
    }
    return train;
  },
  getTrainThenByTicketList(rawList, onTrainThenByTicketSoluList) {
    if (this.data.isReschedule) return rawList;
    let copyRawList = [...rawList];
    onTrainThenByTicketSoluList = util.getLowerCaseKeyObject(
      onTrainThenByTicketSoluList
    );
    copyRawList.forEach((train) => {
      const thenByTrain = onTrainThenByTicketSoluList.find(
        (v) =>
          train.TrainNumber === v.trainNum &&
          train.DepartStation === v.originDepartStation &&
          train.ArriveStation === v.originArriveStation
      );
      if (thenByTrain) {
        // 如果同时有组合座,根据坐席的前后顺序排优先级
        if (train.combiInfo) {
          const { seatType: cSeatType } = train.combiInfo;
          const { seatType: tSeatType } = thenByTrain.solutionInfoList[0];
          const cidx = train.SeatList.findIndex(
            (v) => v.SeatName === cSeatType
          );
          const tidx = train.SeatList.findIndex(
            (v) => v.SeatName === tSeatType
          );
          if (cidx <= tidx) {
            return;
          } else {
            train.combiInfo = null;
          }
        }
        thenByTrain.solutionInfoList.map((solution) => {
          const trainSeatItem = train.SeatList.find(
            (item) => item.SeatName === solution.seatType
          );
          if (trainSeatItem) {
            train.hasWiseSeatRecommend = true;
            trainSeatItem.hasWiseSeatRecommend = true;
            // 上车补出发站一定是没有变化的 recommendDepartType
            trainSeatItem.wiseTag =
              solution.recommendDepartType === 0 &&
              solution.recommendArriveType < 0
                ? solution.actionType === 1 && solution.solutionType === 1
                  ? '组合'
                  : '上车补'
                : '多买';
          }
        });
        // 列表页未展开 默认取第一条 seatname是default
        console.log('122222', thenByTrain);
        train.thenByTicketInfo = getThenByTicketInfo(thenByTrain, 'DEFAULT', {
          productUrlConfig: this.data.productUrlConfig,
        });
        if (train.thenByTicketInfo) {
          util.ubtTrace('TCWListPage_IntelligentPlan_exposure', {
            PageId: '10320640939',
            DepartStation: train.DepartStation,
            ArriveStation: train.ArriveStation,
            scmType: train.thenByTicketInfo.scmType,
            TrainNumber: train.TrainNumber,
          });
        }
      }
    });
    return copyRawList;
  },
  combiDetailClick() {
    util.ubtTrace('TCWListPage_IntelligentActionbar_ChangeMark_click', {
      PageId: '10320640939',
    });
    this.setData({ showType: 'combiDetailPopShow' });
  },

  openWiseSeatPop(e) {
    const { keyIndex, isexpand, from, wiseType } = e.detail;
    const curTrainItem =
      from === 'fromMainTrainList'
        ? this.data.trainList[keyIndex]
        : this.data.otherTrainList[keyIndex];
    if (!curTrainItem) return;
    const { SeatList, curSeatIndex } = this.data.newTrainInfo;
    if (wiseType === 'THEN_BY') {
      const curThenByTicketInfo = isexpand
        ? SeatList[curSeatIndex].seatVendorList.find(
            (v) => v.VendorID === 65 || v.VendorID === 92
          )?.thenByTicketInfo
        : curTrainItem.thenByTicketInfo;
      // 为了跳转预订的时候能找到对应train信息
      curThenByTicketInfo.from = from;
      curThenByTicketInfo.keyIndex = keyIndex;
      // 埋点用的
      curThenByTicketInfo.isexpand = isexpand;

      this.setData({ showType: 'thenByPopShow', curThenByTicketInfo });
      util.ubtTrace('TCWListPage_IntelligentActionbar_exposure', {
        PageId: '10320640939',
        DepartStation: curTrainItem.DepartStation,
        ArriveStation: curTrainItem.ArriveStation,
        scmType: curThenByTicketInfo.scmType,
        TrainNumber: curTrainItem.TrainNumber,
        SeatType: curThenByTicketInfo.seatType,
        Source: isexpand ? 2 : 1,
      });
    } else if (wiseType === 'COMBINE') {
      let trainCombiInfo = isexpand
        ? SeatList[curSeatIndex].seatVendorList.find(
            (v) => v.VendorID === 65 || v.VendorID === 92
          )?.combiInfo
        : util.getLowerCaseKeyObject(curTrainItem?.combiInfo);
      util.ubtTrace('TCWListPage_IntelligentActionbar_exposure', {
        PageId: '10320640939',
        DepartStation: curTrainItem.DepartStation,
        ArriveStation: curTrainItem.ArriveStation,
        scmType: 1,
        TrainNumber: curTrainItem.TrainNumber,
        SeatType: trainCombiInfo?.seatType,
        Source: isexpand ? 2 : 1,
      });
      trainCombiInfo?.ticketList?.map((item) => {
        item.departTime = cDate.getFormatDate(item.departDateTime, 'hh:mm');
        item.arriveTime = cDate.getFormatDate(item.arriveDateTime, 'hh:mm');
        const DepartTimeStamp = new Date(
          util.transToDate(item.departDateTime)
        ).getTime();
        const ArriveDateTime = new Date(
          util.transToDate(item.arriveDateTime)
        ).getTime();
        item.departDateD = new cDate(DepartTimeStamp).format('n月j日');
        item.arriveDateD = new cDate(ArriveDateTime).format('n月j日');
        item.arriveDay = new cDate.parse(
          item.arriveDateTime.slice(0, 8)
        ).format('w');
        item.departDay = new cDate.parse(
          item.departDateTime.slice(0, 8)
        ).format('w');
      });
      trainCombiInfo.isexpand = isexpand;
      trainCombiInfo.cardIdx = keyIndex;
      trainCombiInfo.from = from;
      trainCombiInfo.isTakeDay =
        trainCombiInfo?.ticketList[0].departDateTime.slice(0, 8) !==
        trainCombiInfo?.ticketList[1].arriveDateTime.slice(0, 8);
      trainCombiInfo.isZhongzhuanTakeDay =
        trainCombiInfo?.ticketList[0].departDateTime.slice(0, 8) !==
        trainCombiInfo?.ticketList[0].arriveDateTime.slice(0, 8);
      trainCombiInfo.price =
        Number(trainCombiInfo?.ticketList[0].ticketPrice) +
        Number(trainCombiInfo?.ticketList[1].ticketPrice);
      this.setData({ showType: 'combiPopShow', trainCombiInfo });
    }
  },
  goCombiBuy(e) {
    const { fromPop, seatidx, seatvendoridx, keyidx, from } = e.detail;
    let transitObj = {},
      trainCombiInfo = {},
      fromMainList = true,
      cardIdx = keyidx;
    if (fromPop) {
      trainCombiInfo = this.data.trainCombiInfo;
      fromMainList = trainCombiInfo.from === 'fromMainTrainList';
      cardIdx = trainCombiInfo.cardIdx;
    } else {
      fromMainList = from === 'fromMainTrainList';
      const { SeatList } = this.data.newTrainInfo;
      trainCombiInfo =
        SeatList[seatidx].seatVendorList[seatvendoridx].combiInfo;
    }
    const curTrainItem = fromMainList
      ? this.data.trainList[cardIdx]
      : this.data.otherTrainList[cardIdx];
    if (fromPop) {
      util.ubtTrace('TCWListPage_IntelligentActionbar_click', {
        PageId: '10320640939',
        DepartStation: curTrainItem.DepartStation,
        ArriveStation: curTrainItem.ArriveStation,
        scmType: 1,
        TrainNumber: curTrainItem.TrainNumber,
        SeatType: trainCombiInfo.seatType,
        Source: trainCombiInfo.isexpand ? 2 : 1,
      });
    } else {
      util.ubtTrace('TCWListPage_ScheduledModule_click', {
        PageId: '10320640939',
        DepartStation: curTrainItem.DepartStation,
        ArriveStation: curTrainItem.ArriveStation,
        TrainNumber: curTrainItem.TrainNumber,
        SeatType: curTrainItem.SeatName,
        vendorId:
          this.data.newTrainInfo.SeatList[seatidx].seatVendorList[seatvendoridx]
            .VendorID,
        scmType: 1,
      });
    }
    if (!trainCombiInfo?.ticketList) {
      return util.showToast('获取智慧方案信息失败，请稍后再试', 'none');
    }
    const TrainTransferInfos = trainCombiInfo.ticketList.map((train, Index) => {
      const DepartTimeStamp = new Date(
        util.transToDate(train.departDateTime)
      ).getTime();
      const ArriveTimeStamp = new Date(
        util.transToDate(train.arriveDateTime)
      ).getTime();
      train.departTime = cDate.getFormatDate(train.departDateTime, 'hh:mm');
      train.arriveTime = cDate.getFormatDate(train.arriveDateTime, 'hh:mm');
      // 变成这种格式/Date(1639721460000+0800)/
      train.DepartDate = `/Date(${DepartTimeStamp}+0800)`;
      train.ArriveDate = `/Date(${ArriveTimeStamp}+0800)`;
      train.Sequence = Index + 1;
      train.price = Number(train.ticketPrice);
      return train;
    });
    transitObj.TrainTransferInfos = TrainTransferInfos;
    transitObj.TransferStation = trainCombiInfo.ticketList[0].arriveStation;
    transitObj.combiRemark = trainCombiInfo.remark;
    transitObj.isCombiSeat = true;
    transitObj.tripType = trainCombiInfo.tripType
    const DAYMS = 24 * 60 * 60 * 1000;
    const departDate = util
      .transToDate(TrainTransferInfos[0].departDateTime)
      .split(' ')[0];
    const arriveDate = util
      .transToDate(
        TrainTransferInfos[TrainTransferInfos.length - 1].arriveDateTime
      )
      .split(' ')[0];
    const takeDays = Math.floor(
      (new Date(arriveDate).getTime() + 1000 - new Date(departDate).getTime()) /
        DAYMS
    );
    transitObj.takeDays = takeDays;
    shared.transitObj = transitObj;
    shared.train = {};
    this.navigateTo({
      url: '/pages/trainBooking/booking/ordinary/index?vendorID=65',
      data: { transitObj },
    });
    this.setData({ showType: '' });
  },
  goTimeTable(e) {
    const { trainInfo } = e.detail;
    util.goTimeTable(trainInfo, this);
  },
  goThenByBuy(e) {
    // 有三个地方有 thenByTicketInfo
    // 一个是页面一开始的时候recommand接口会处理,然后挂载到了有智慧方案的车次上
    // 第二个是点击展开坐席的时候，会把相关方案放到坐席的vendor产品里面 可以从newtraininfo里面取
    // 第三个是打开浮层的时候 会根据是直接从未展开的列表里面还是展开的坐席包里面获取thenByTicketInfo vendor的优先级高于train上的
    const { fromPop } = e.detail;

    let { vendorid } = e.detail;
    let newTrainInfo = {};
    //TODO:
    if (fromPop) {
      const { from, keyIndex, isexpand } = this.data.curThenByTicketInfo;
      const curTrainItem =
        from === 'fromMainTrainList'
          ? this.data.trainList[keyIndex]
          : this.data.otherTrainList[keyIndex];
      // 如果是列表横条---》 浮层 ---》 预订 可能存在方案坐席不是二等座的情况， 但默认带过去的是二等座的信息 这个时候要改变train
      const changeTrain = this.changeSeatForWisePopBooking(
        JSON.parse(JSON.stringify(curTrainItem))
      );
      newTrainInfo = this.handleThenByTrainForBooking(changeTrain, {
        fromPop: true,
      });
    } else {
      newTrainInfo = this.handleThenByTrainForBooking(
        JSON.parse(JSON.stringify(this.data.newTrainInfo)),
        { fromPop: false }
      );
    }

    if (
      newTrainInfo &&
      newTrainInfo.thenByTicketInfo &&
      newTrainInfo.thenByTicketInfo.actionType === 1 &&
      newTrainInfo.thenByTicketInfo.solutionType === 1
    ) {
      vendorid = 92;
    }
    // 列表无方案 v7有方案的 要把方案带到train上面 带到填写页
    // if(!newTrainInfo.thenByTicketInfo) {
    //   const seatInfo = newTrainInfo.SeatList.find(v =>  v.SeatName ===newTrainInfo.SeatName);
    //   if(seatInfo.seatVendorList){
    //     newTrainInfo.thenByTicketInfo = seatInfo.seatVendorList.find(v => v.VendorID === 65)?.thenByTicketInfo;
    //   }
    // }

    const key = fromPop
      ? 'TCWListPage_IntelligentActionbar_click'
      : 'TCWListPage_ScheduledModule_click';
    const traceParams = {
      PageId: '10320640939',
      DepartStation: newTrainInfo.DepartStation,
      ArriveStation: newTrainInfo.ArriveStation,
      TrainNumber: newTrainInfo.TrainNumber,
      SeatType: newTrainInfo.SeatName,
      vendorId: vendorid,
      scmType: newTrainInfo.thenByTicketInfo.scmType,
    };
    if (fromPop)
      traceParams.Source = this.data.curThenByTicketInfo.isexpand ? 2 : 1;
    util.ubtTrace(key, traceParams);
    this.goTrainDetail(newTrainInfo, this.data.clickInfo, true, vendorid);
    this.setData({ showType: '' });
  },
  changeSeatForWisePopBooking(curTrainItem) {
    const thenByTicketInfo = this.data.curThenByTicketInfo;
    const curWiseName =
      thenByTicketInfo.seatType || thenByTicketInfo.recommendSeatType;
    if (curWiseName && curTrainItem.SeatName !== curWiseName) {
      curTrainItem.SeatName = curWiseName;
    }
    return curTrainItem;
  },
  handleThenByTrainForBooking(train, { fromPop }) {
    // 以下这些字段需要fix
    // TODO:
    let thenByTicketInfo = {};
    if (fromPop) {
      thenByTicketInfo = this.data.curThenByTicketInfo;
    } else {
      const seatInfo = train.SeatList.find(
        (v) => v.SeatName === train.SeatName
      );
      if (!seatInfo.seatVendorList) return train;
      thenByTicketInfo = seatInfo.seatVendorList.find(
        (v) => v.VendorID === 65 || v.VendorID === 92
      )?.thenByTicketInfo;
    }
    const {
      recommendDepartStation,
      recommendArriveStation,
      recommendDepStationTime,
      recommendArrStationTime,
      recommendDepStationDate,
      recommendArrStationDate,
      recommendPrice,
    } = thenByTicketInfo;
    // 这里传入的train是深拷贝的，所以直接复制也不会修改到原来的对象
    train.SeatList.forEach((item) => {
      const vendorSeat = thenByTicketInfo.seatInfoList.find(
        (v) => v.seatType === item.SeatName
      ); // 目前只返回一个，取第一位也可以
      if (vendorSeat) {
        item.ShowSeatPrice = item.SeatPrice = vendorSeat.seatPrice;
        item.SeatInventory = vendorSeat.seatCount;
      }
    });

    const diffPrice = recommendPrice - train.Price;
    const DAYMS = 24 * 60 * 60 * 1000;
    const depDate = new cDate.parse(recommendDepStationDate);
    const arrDate = new cDate.parse(recommendArrStationDate);
    // 用Y-M-d去解析是会有兼容问题的
    const depDateTimeStr =
      depDate.format('Y/m/d') + ' ' + recommendDepStationTime + ':00';
    const DepartTimeStamp = new cDate(depDateTimeStr).getTime();
    // const ArriveTimeStamp = arrDate.getTime();
    const TakeDays = Math.floor(
      (arrDate.getTime() + 1000 - depDate.getTime()) / DAYMS
    );
    const SelectedSeat = train.SeatList.find(
      (v) => v.SeatName === train.SeatName
    );
    const isJianLou = !!SelectedSeat.SeatInventory <= 0;
    const Price = SelectedSeat.SeatPrice;
    const extendThenByValue = getExtendValueForV7(thenByTicketInfo, {
      seatName: train.SeatName,
    }); // 后端要求值必须和v7保持一致，从列表页直接预订的要修改
    const newTrain = {
      isThenByTrainTicket: true,
      extendThenByValue,
      ...train,
      thenByTicketInfo,
      isJianLou,
      Price,
      SelectedSeat,
      TakeDays,
      diffPrice,
      DepartTimeStamp,
      DepartStation: recommendDepartStation,
      ArriveStation: recommendArriveStation,
      DepartTime: recommendDepStationTime,
      ArriveTime: recommendArrStationTime,
      // RunTime 方案取不到 ,
      SeatCount: SelectedSeat.SeatInventory,
    };
    return newTrain;
  },

  // TODO: fix计算上滑高度
  calculateScrollTop(fromOtherList) {
    const trainIndex = !fromOtherList
      ? this.data.seatCardIndex
      : this.data.otherSeatCardIndex;
    const id_prefix = !fromOtherList ? 'train_item_' : 'other_train_item_';
    if (trainIndex <= 0) return;
    let ps = [],
      that = this;
    ps.push(this.calculateScrollView('#train_scroll'));
    ps.push(this.calculateItem(`${id_prefix}${trainIndex}`));
    ps.push(this.calculateItem('ftbar'));
    Promise.all(ps)
      .then((itemsRect) => {
        // 下方筛选
        const ftbarRect = itemsRect.pop();
        const curTrainItem = itemsRect.pop();
        const wrapperEle = itemsRect.pop();
        if (curTrainItem.bottom > ftbarRect.top) {
          that.setData({
            // scrollTopHeight: preHeight - scrollRect.height + divider * (this.data.seatCardIndex + 1),
            scrollTopHeight:
              wrapperEle.scrollTop + (curTrainItem.bottom - ftbarRect.top) + 10,
          });
        }
      })
      .catch((e) => {
        console.log(e);
      });
  },
  calculateItem(itemId) {
    let deferred = util.getDeferred();
    wx.createSelectorQuery()
      .select('#' + itemId)
      .boundingClientRect(function (rect) {
        if (rect) {
          deferred.resolve(rect);
        } else {
          deferred.resolve(null);
        }
      })
      .exec();

    return deferred.promise;
  },
  calculateScrollView(ele) {
    let deferred = util.getDeferred();
    wx.createSelectorQuery()
      .select(ele)
      .scrollOffset(function (rect) {
        if (rect) {
          deferred.resolve(rect);
          console.log('123456', rect);
        } else {
          deferred.resolve(null);
        }
      })
      .exec();
    return deferred.promise;
  },

  getNewTrainArr(trainArr, newTrain) {
    const idx = trainArr.findIndex(
      (item) =>
        item.TrainNumber === newTrain?.TrainNumber &&
        item.DepartStation === newTrain?.DepartStation &&
        item.ArriveStation === newTrain?.ArriveStation
    );
    let newArr = [...trainArr];
    newArr.splice(idx, 1, newTrain);
    return newArr;
  },

  setNewTrainList(newTrain, isfromOtherList) {
    if (isfromOtherList) {
      const newArr = this.getNewTrainArr(this.data.otherTrainList, newTrain);
      this.setData({ otherTrainList: newArr });
    } else {
      const newArr = this.getNewTrainArr(this.data.trainList, newTrain);
      this.setData({ trainList: newArr });
    }
    this.setData({ newTrainInfo: newTrain });
  },

  // 通道vendorID曝光埋点
  exposureVendorId(vendorList, newTrain) {
    const scheduledModule = vendorList?.map((item, idx) => {
      return {
        Position: idx,
        VendorID: '' + item.vendorID,
        ScmType: '' + (item.scmType || -1),
      };
    });
    util.ubtTrace('TCWListPage_ScheduledModule_exposure', {
      PageId: '10320640939',
      DepartStation: newTrain.DepartStation,
      ArriveStation: newTrain.ArriveStation,
      TrainNumber: newTrain.TrainNumber,
      SeatType: newTrain.SeatName,
      ChannelInfo: scheduledModule,
    });
  },

  // 获取坐席服务包信息
  async getSeatVendorInfo(trainItem) {
    const newTrain = { ...trainItem };
    if (!newTrain.SeatList) {
      this.setData({
        seatCardIndex: -1,
        otherSeatCardIndex: -1,
      });
      return util.showToast('坐席列表拉取失败，请稍后再试', 'none');
    }
    newTrain.curSeatIndex = 0;
    newTrain.isJianLou = !newTrain.SeatList[0].SeatInventory;
    newTrain.SeatName = newTrain.SeatList[0].SeatName;
    newTrain.Price = newTrain.SeatList[0].SeatPrice;
    newTrain.SelectedSeat = newTrain.SeatList[0];
    if (
      newTrain.SeatList[0].seatVendorList &&
      newTrain.SeatList[0].vendorTextList
    ) {
      this.exposureVendorId(newTrain.SelectedSeat.vendorList, newTrain);
      return newTrain;
    }
    const {
      TrainNumber,
      ArriveStation,
      ArriveTime,
      DepartStation,
      DepartTime,
      IsBookable,
      SeatList,
      SaleNote,
    } = newTrain;
    const params = {
      TrainNumber,
      DepartStation,
      ArriveStation,
      DepartDate: cDate.parse(shared.selectDate).format('Ymd'),
      DepartTime,
      ArriveTime,
      IsBookable,
      SaleNote,
    };
    if (this.taskOrderType) {
      params.SourceType = this.taskOrderType;
    }
    params.SeatList = SeatList.map((item) => {
      return {
        SeatName: item.SeatName,
        SeatPrice: item.SeatPrice,
        SeatInventory: item.SeatInventory,
        Bookable: item.SeatBookable,
      };
    });
    try {
      const res = await util.promisifyModel(trainBookingByTrainNameV7Model)(
        params
      );
      if (res.RetCode === 1) {
        let wiseType = '';
        const { SeatList } = res.TrainBookingInfo;
        newTrain.SeatList.map((item, idx) => {
          // 当前坐席的服务包信息
          const curSeatV7Info =
            SeatList.find((seat) => seat.SeatName === item.SeatName) || {};
          newTrain.SeatList[idx].seatVendorList =
            curSeatV7Info.SeatVendorList || [];

          console.log(
            'newTrain.SeatList[idx].seatVendorList------',
            newTrain.SeatList[idx].seatVendorList
          );
          // 座位的最新数量要以服务包返回的为准
          item.SeatInventory = curSeatV7Info.SeatInventory;
          // 组合座/上车补/跨站
          const wiseVendorList = newTrain.SeatList[idx].seatVendorList.filter(
            (item) => item.VendorID === 65 || item.VendorID === 92
          );
          // 如果列表有方案
          if (wiseVendorList.length > 0) {
            wiseVendorList.map((wiseSeatInfo, index) => {
              const combiExtend = wiseSeatInfo?.ExtendList.find(
                (item) => item.Key === 'SectionTicketMultipleEntranceInfoList'
              );
              if (combiExtend?.Value) {
                const sectionTicketList = JSON.parse(combiExtend.Value)[0]
                  ?.ticketList;
                if (sectionTicketList) {
                  wiseSeatInfo.combiInfo = {
                    remark: wiseSeatInfo.TrainTicketSeatVendorInfo.VendorRemark,
                    seatType: item.SeatName,
                    ticketList: sectionTicketList,
                  };
                  item.hasWiseSeat = true;
                }
              }
              // 上车补/跨站
              const thenByExtend = wiseSeatInfo?.ExtendList.find(
                (item) => item.Key === 'OnTrainThenByTicketSoluList'
              );
              if (thenByExtend?.Value) {
                const sectionTicketInfo = util.getLowerCaseKeyObject(
                  JSON.parse(thenByExtend.Value)
                );
                if (sectionTicketInfo) {
                  // 目前只会返回一个， 所以取第一个就好
                  wiseSeatInfo.thenByTicketInfo = getThenByTicketInfo(
                    sectionTicketInfo[0],
                    item.SeatName,
                    { productUrlConfig: this.data.productUrlConfig }
                  );
                  item.hasWiseSeat = true;
                }
              }
            });
          }
          // 获取带任信息
          item.BannerTaskInfo = curSeatV7Info?.BannerTaskInfo;
        });
        // 无供应商信息走兜底
        if (newTrain.SeatList[0].seatVendorList.length === 0) {
          newTrain.isDoudi = true;
        }
        const curVendorList = newTrain.SeatList[0].seatVendorList?.map(
          (item) => {
            const { thenByTicketInfo, combiInfo } = item;
            const scmType = thenByTicketInfo
              ? thenByTicketInfo.scmType
              : combiInfo
              ? 1
              : -1;
            return {
              vendorID: item.VendorID,
              vendorType: item.TrainTicketSeatVendorInfo.VendorType,
              scmType,
            };
          }
        );
        newTrain.SeatList[0].vendorList = curVendorList;
        const promiselist = curVendorList.map((item) =>
          this.getVendorListInfo(newTrain, item)
        );
        const curVendorTextList = await Promise.all(promiselist);
        newTrain.SeatList[0].seatVendorList.map((item, idx) => {
          item.vendorText = curVendorTextList[idx];
        });
        newTrain.SeatList[0].vendorTextList = curVendorTextList;
        this.exposureVendorId(curVendorList, newTrain);
        // 如果列表页有智慧方案
        if (newTrain.hasWiseSeatRecommend) {
          handleWiseInfoToast(newTrain, newTrain.SeatList[0]);
        }
        return newTrain;
      }
    } catch (err) {
      console.log('获取坐席vendorID失败', err);
      throw err;
    }
    return newTrain;
  },

  // 获取X页供应商列表信息
  async getVendorListInfo(newTrain, vendorInfo) {
    const { TrainNumber, ArriveStation, DepartStation, SeatList, TakeDays } =
      newTrain;
    let mobileNum = 0;
    if (cwx.user.isLogin()) {
      mobileNum = await getUserBindedPhoneNumber();
    }
    const params = {
      Channel: 'ctripwx',
      TrainNumber,
      DepartStation,
      ArriveStation,
      DepartDateTime: cDate.parse(shared.selectDate).format('Y-m-d'),
      ArriveDateTime: cDate
        .parse(shared.selectDate)
        .addDay(TakeDays)
        .format('Y-m-d'),
      OrderType: vendorInfo.vendorType,
      VendorID: vendorInfo.vendorID,
      IsCtripMember: cwx.user.isLogin(),
      UserMobile: mobileNum,
      Type: 0,
      ExtendInfo: '263382&1464975',
    };
    params.SeatList = SeatList.map((item) => {
      return {
        SeatName: item.SeatName,
        SeatPrice: item.SeatPrice,
      };
    });
    try {
      const res = await getVendorListInfoV5ModelPromise(params);
      if (res.RetCode === 1) {
        const curVendorText = res.SeatList?.find(
          (item) => item.SeatName === newTrain.SeatName
        )?.VendorText;
        return curVendorText || '';
      }
      throw '获取X页供应商列表信息失败';
    } catch (err) {
      console.log('获取X页供应商列表信息失败', err);
      throw err;
    }
  },

  async reGetTrainItem(index, isFromOther) {
    const transHongkong = (station) => {
      return station === '香港' ? '香港西九龙' : station;
    };
    let trainItem = {};
    if (isFromOther) {
      trainItem = this.data.otherTrainList[index];
      if (index === this.data.otherSeatCardIndex) {
        return trainItem;
      }
    } else {
      trainItem = this.data.trainList[index];
      if (index === this.data.seatCardIndex) {
        return trainItem;
      }
    }
    try {
      const params = {
        DepartStation: transHongkong(this.data.dStation),
        ArriveStation: transHongkong(this.data.aStation),
        TrainName: trainItem.TrainNumber,
        DepartDate: shared.selectDate,
        ChannelName: 'ctrip.wx',
      };
      const res = await TrainListModelPromise(params);
      if (res.ResponseBody?.TrainInfoList) {
        const raw = util.handleTrains(
          res.ResponseBody.TrainInfoList,
          shared.selectDate
        );
        let newTrain = raw.find(
          (item) =>
            item.TrainNumber === trainItem.TrainNumber &&
            item.DepartStation === trainItem.DepartStation &&
            item.ArriveStation === trainItem.ArriveStation
        );
        const oldInventory = [],
          newInventory = [];
        if (newTrain) {
          trainItem.SeatList.forEach((item, index) => {
            if (item.SeatInventory <= 0) {
              oldInventory.push(index);
            }
          });
          newTrain.SeatList.forEach((item, index) => {
            if (item.SeatInventory <= 0) {
              newInventory.push(index);
            }
          });
          if (oldInventory.join() === newInventory.join()) {
            newTrain.SeatList = trainItem.SeatList;
          }
          return { ...trainItem, ...newTrain };
        } else {
          return { ...trainItem, isTingYun: true };
        }
      }
    } catch (e) {
      util.showToast('网络开小差，请稍后再试', 'none');
      throw e;
    }
    return trainItem;
  },

  async trainItemHandle(e) {
    // index: 车次列表的索引
    // selfindex: 坐席索引
    // jumpdirect：false: 点击横向的座位时，不需要直接跳转填写页; true: 无供应商走12306 或者 点击有供应商的买/抢票产品时
    // vendorid 全能抢票/专人抢票/智慧系列/优享预订等
    // newTrainInfo 获取坐席服务的时候改变了train相关信息
    // 直接点了智慧方案的 订 按钮的 wisetype 才有值
    const {
      index,
      selfindex,
      dstation,
      astation,
      seatinventory,
      seatname,
      price,
      from = '',
      isxpagenew,
      jumpdirect,
      vendorid,
      vendoridtype,
      wiseType,
    } = e.detail;
    // 只有展开坐席才要去判断有无智慧方案，智慧方案是否一致
    if (this.data.newTrainInfo?.hasWiseSeatRecommend) {
      handleWiseInfoToast(
        this.data.newTrainInfo,
        this.data.newTrainInfo.SeatList[selfindex]
      );
    }
    if (vendorid === 65 && wiseType === 'COMBINE') {
      this.goCombiBuy(e);
      return;
    }
    if ((vendorid === 65 || vendorid === 92) && wiseType === 'THEN_BY') {
      this.goThenByBuy(e);
      return;
    }
    if (jumpdirect && isxpagenew) {
      const newTrainInfo = this.data.newTrainInfo;
      if (vendorid) {
        util.ubtTrace('TCWListPage_ScheduledModule_click', {
          PageId: '10320640939',
          DepartStation: newTrainInfo.DepartStation,
          ArriveStation: newTrainInfo.ArriveStation,
          TrainNumber: newTrainInfo.TrainNumber,
          SeatType: newTrainInfo.SeatName,
          vendorId: vendorid,
          scmType: -1, // 智慧方案的订按钮是不会走到这里的
        });
      }
      console.log('1234567', newTrainInfo);
      this.goTrainDetail(
        newTrainInfo,
        this.data.clickInfo,
        isxpagenew,
        vendorid,
        vendoridtype
      );
      return;
    }
    const clickInfo = {
      index,
      selfindex,
      dstation,
      astation,
      seatinventory,
      seatname,
      price,
      from,
    };
    let newTrain = {};
    // 不是x页的话 就是从车次列表获取train信息
    if (from === 'fromOtherTrainList') {
      newTrain = this.data.otherTrainList[index];
    } else if (from === 'fromMainTrainList') {
      newTrain = this.data.trainList[index];
    }
    newTrain.SeatName = seatname;
    newTrain.Price = price;
    newTrain.isJianLou = !seatinventory;
    newTrain.SelectedSeat = newTrain.SeatList[selfindex];
    if (isxpagenew) {
      // 下面代码是切换坐席 eg.二等座 --> 一等座
      const curSeat = newTrain.SeatList[selfindex].seatVendorList || [];
      if (curSeat.length === 0) {
        newTrain.isDoudi = true;
      }
      const curVendorList =
        curSeat.map((item) => {
          const { thenByTicketInfo, combiInfo } = item;
          const scmType = thenByTicketInfo
            ? thenByTicketInfo.scmType
            : combiInfo
            ? 1
            : -1;
          return {
            vendorID: item.VendorID,
            vendorType: item.TrainTicketSeatVendorInfo.VendorType,
            scmType,
          };
        }) || [];
      this.exposureVendorId(curVendorList, newTrain);
      newTrain.SeatList[selfindex].vendorList = curVendorList;

      if (!newTrain.SeatList[selfindex].vendorTextList) {
        const promiselist = curVendorList.map((item) =>
          this.getVendorListInfo(newTrain, item)
        );
        const curVendorTextList = await Promise.all(promiselist);
        newTrain.SeatList[selfindex].seatVendorList.map(
          (item, idx) => (item.vendorText = curVendorTextList[idx])
        );
        newTrain.SeatList[selfindex].vendorTextList = curVendorTextList;
      }

      if (selfindex !== newTrain.curSeatIndex) {
        newTrain.curSeatIndex = selfindex;
      }
      if (from === 'fromOtherTrainList') {
        this.setNewTrainList(newTrain, true);
      } else if (from === 'fromMainTrainList') {
        this.setNewTrainList(newTrain);
      }
      this.setData({ clickInfo });
      return;
    }
    this.goTrainDetail(newTrain, clickInfo);
  },

  // 全能抢票弹窗信息缓存
  setOmniPopCache(payload) {
    const { omniInfoCache, omnipotentInfo } = this.data;

    this.setData({
      omniInfoCache: [
        ...omniInfoCache,
        { ...payload, ominPop: omnipotentInfo },
      ],
    });
  },
  getOmniPopCache(payload) {
    const { omniInfoCache } = this.data;
    if (!omniInfoCache.length) return false;

    const curr = omniInfoCache.find(
      (t) =>
        payload.DepartStation === t.DepartStation &&
        payload.ArriveStation === t.ArriveStation &&
        payload.DepartureDate === t.DepartureDate &&
        payload.TrainNumber === t.TrainNumber &&
        payload.SeatList[0].SeatName === t.SeatList[0].SeatName
    );

    return curr?.ominPop;
  },

  // 全能抢票浮层
  async getOmnipotentData() {
    const {
      SeatList,
      curSeatIndex,
      DepartTimeStamp,
      ArriveStation,
      DepartStation,
      TrainNumber,
      SeatName,
      Price,
    } = this.data.newTrainInfo;

    const verdor74 = SeatList[curSeatIndex].seatVendorList.find(
      (v) => v.VendorID === 74
    );
    const payload = {
      FromType: 1, // 1=X页；2=订单详情；3=多程x页
      VendorId: 74,
      DepartStation,
      ArriveStation,
      DepartureDate: new cDate(DepartTimeStamp).format('Ymd'),
      TrainNumber,
      SeatList: [
        {
          SeatName,
          SeatPrice: Price,
        },
      ],
    };

    // 加入上次点击车次坐席缓存判断
    const popCache = this.getOmniPopCache(payload);
    if (popCache) {
      this.setData({
        showType: 'omniShow',
        omnipotentInfo: popCache,
      });
      return;
    }

    util.showLoading();
    const { RetCode, RetMessage, ServiceDetailInfo } =
      await util.promisifyModel(combineServiceProductDetailModel)(payload);
    util.hideLoading();

    if (RetCode !== 1) throw RetMessage;

    this.setData({
      showType: 'omniShow',
      omnipotentInfo: {
        ...ServiceDetailInfo,
        vendorInfo: verdor74,
        price: Price,
      },
    });
    this.setOmniPopCache(payload);
  },
  goTrainDetail(newTrain, clickInfo, isXpageNew, vendorid, vendoridtype) {
    const {
      index,
      selfindex,
      dstation,
      astation,
      seatinventory,
      seatname,
      price,
      from = '',
    } = clickInfo;
    const self = this;
    const isAbroadSelect = [dstation, astation].includes('香港西九龙');
    const type = !newTrain.isJianLou ? 'ordinary' : 'grab';
    if (this.data.isReschedule) {
      const seat = newTrain.SeatList[selfindex];
      if (!this.validateReschedule(seat, newTrain)) {
        return;
      }
    }
    if (!this.validateJiulong(newTrain)) {
      return;
    }
    if (this.data.isReschedule) {
      const hasSeat = _.some(newTrain.SeatList, (item) => {
        return item.SeatInventory > 0 && item.SeatBookable;
      });
      if (!hasSeat) {
        util.showModal({
          m: '您选择的车次已没有空余座位，请选择别的车次',
        });
        return;
      }
      if (!shared.rescheduleInfo.isAbroad && isAbroadSelect) {
        util.showModal({
          m: '根据铁路局规定,不支持跨境车票改签',
        });
        return;
      }
      // if (shared.rescheduleInfo.isAbroad) {
      //     if (newTrain.DepartStation !== this.data.dStation || newTrain.ArriveStation !== this.data.aStation) {
      //         util.showModal({
      //             m: '根据铁路局规定,不支持跨境车票改签变更到站',
      //         })
      //         return
      //     }
      // }
      if (
        newTrain.ArriveStation !== this.data.aStation ||
        newTrain.DepartStation !== this.data.dStation
      ) {
        util.showModal({
          m:
            `您的出发站由原来${shared.query.dStation}变更为${newTrain.DepartStation}，` +
            `到达站由原来的${shared.query.aStation}更改为${newTrain.ArriveStation}，是否继续`,
          confirmText: '是',
          showCancel: true,
          cancelText: '否',
          done(res) {
            if (res.confirm) {
              self.goBooking(newTrain, type);
            }
          },
        });
      } else {
        self.goBooking(newTrain, type);
      }
    } else {
      if (newTrain.IsUrgent && newTrain.isJianLou) {
        return util.showToast('此座席已经无票，请选择其他座席', 'none');
      }
      self.goBooking(newTrain, type, isXpageNew, vendorid, vendoridtype);
    }
  },
  goBooking(tmp = {}, type, isXpageNew, vendorid, vendoridtype) {
    tmp = { ...tmp };
    if (type == 'grab') {
      delete tmp.thenByTicketInfo;
    }
    shared.train = {};
    for (let key in tmp) {
      shared.train[key] = tmp[key];
    }

    // 紧急购票十分钟内的拦截
    if (
      tmp.IsUrgent &&
      tmp.DepartTimeStamp &&
      tmp.DepartTimeStamp - Date.now() < 10 * 60 * 1000
    ) {
      this.setData({ showType: 'argentTip' });
      return;
    }
    console.log('1234567', shared.train);
    if (type == 'ordinary') {
      if (this.data.isReschedule) {
        return this.navigateTo({
          // 改签承接
          url: '/pages/trainBooking/booking/ordinary/index',
        });
      }
      if (isXpageNew) {
        return this.navigateTo({
          url: `/pages/trainBooking/booking/ordinary/index?vendorID=${vendorid}`,
        });
      }
      return this.navigateTo({
        url: `/pages/trainBooking/booking/ordinary/index`,
      });
    } else {
      // vendoridtype:1 专人抢票通道
      this.navigateTo({
        url: `/pages/trainBooking/booking/grab/index?vendorIDType=${vendoridtype}&vendorID=${vendorid}`,
        data: {
          train: {
            ...shared.train,
            departureDate: shared.selectDate,
            trainSuccessRangeList: shared.trainSuccessRangeList,
            orderSource: shared.orderSource,
          },
        },
      });
    }
    try {
      this.ubtDevTrace('o_train_list_item', tmp);
    } catch (e) {}
  },
  submitArgentTicket() {
    this.hideBackDrop();
    this.navigateTo({
      url: '/pages/trainBooking/booking/ordinary/index',
    });
  },
  validateReschedule(seat, tmp) {
    let trainInfo = {};
    for (let key in tmp) {
      trainInfo[key] = tmp[key];
    }
    const { ArriveStation, DepartStation, SeatName, TrainNumber } = trainInfo;
    if (!seat || !(seat.SeatInventory > 0 && seat.SeatBookable)) {
      if (!this.data.oldOrderInfo.IsCanGrabTicket) {
        util.showModal({
          m: '暂时不支持改签抢，请选择其它座席或车次',
        });
      } else {
        const urlParams = `ArriveStation=${ArriveStation}&DepartStation=${DepartStation}&SeatName=${SeatName}&TrainNumber=${TrainNumber}&departeDate=${shared.selectDate}`;
        const url = `https://m.ctrip.com/webapp/train/rescheduleGrab?orderId=${this.data.oldOrderInfo.OrderId}&${urlParams}`;
        this.navigateTo({
          url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(
            url + '&needLogin=true'
          )}`,
        });
      }
      return false;
    }
    return true;
  },
  showFilterView() {
    if (
      !this.data.trainList.length &&
      !this.data.otherTrainList.length &&
      this.data.trainTransferGroupInfos.length &&
      this.data.filterTrainType == 1 &&
      this.data.filterTrainTime == 1
    ) {
      util.showToast('中转方案不支持此筛选', 'none');
      return;
    }
    this.ubtTrace('e_tra_shaixuanfuceng_show', true);
    util.ubtTrace('TCWListPage_BottomButton_click', {
      PageId: '10320640939',
      DepartStation: this.data.dStation,
      ArriveStation: this.data.aStation,
      Status: this.data.isHasZhiDa ? 1 : 2,
      clickType: 1,
    });
    this.setData({
      isFilterViewAnimation: true,
    });
    this.prevFilterType = this.data.filterTrainType;
    this.prevFilterTime = this.data.filterTrainTime;
    this.prevFilterStations = this.data.stations.map((item) => ({
      ...item,
    }));
  },
  preventBackMove() {},
  hideFilterView() {
    this.setData({
      isFilterViewAnimation: false,
      seatCardIndex: -1,
    });
    // 筛选车次
    this.updateQuickFilter();
    this.renderFiltered();
    this.scrollToLower();
  },
  validateJiulong(
    train = {},
    ArriveStation = train.ArriveStation,
    DepartStation = train.DepartStation
  ) {
    if (util.isIntersection(['香港', '九龙'], [ArriveStation, DepartStation])) {
      util.showModal({ m: '小程序暂不支持购买广州到九龙的车票，请您谅解' });

      return false;
    }

    return true;
  },
  toTransitDetail(e) {
    const train =
      this.data.trainTransferGroupInfos[e.currentTarget.dataset.index];
    util.ubtTrace('TCWListPage_BottomTransit_click', {
      PageId: '10320640939',
      DepartStation: this.data.dStation,
      ArriveStation: this.data.aStation,
      Status: this.data.isHasZhiDa ? 1 : 2,
    });
    //记录当前中转条目数
    this.sendTransferClick();
    this.goZhongZhuan(train);
  },
  toRecommandTrainsitDetail(e) {
    let train;
    const { index, from } = e.currentTarget.dataset;
    if (from === 'fromMainTrainList') {
      train = this.data.trainList[index];
      const sceneArr = ['A', 'B', 'C', 'D', 'F', 'E'];
      const TrnFromScene = sceneArr[train.RecommendType - 1];
      util.ubtTrace('TCWListPage_TransitRecommend_click', {
        PageId: '10320640939',
        DepartStation: this.data.dStation,
        ArriveStation: this.data.aStation,
        TrnFromScene,
      });
    } else {
      train = this.data.otherTrainList[index];
    }
    this.goZhongZhuan(train);
  },
  async goZhongZhuan(train) {
    this.navigateTo({
      url: '../zhongzhuan/zhongzhuan',
      data: {
        trainInfo: train,
      },
    });
  },
  sendTransferClick() {
    const len = this.data.trainList.length + this.data.otherTrainList.length;
    util.insertActionLog('mini_transfer_click', len);
  },
  noop() {},
  // goTo(e) {
  //     const index = e.currentTarget.dataset.index
  //     let train = this.data.trainTransferGroupInfos[index]
  //     this.navigateTo({
  //         url: '../zhongzhuan/zhongzhuan',
  //         data: {
  //             trainInfo: train,
  //         }
  //     })
  // }
  setHasSubscribedStorageTimeout() {
    let d = new Date();
    d.setDate(new Date().getDate() + 1);

    let diff = d.setHours(0, 0, 0) - Date.now();
    let timeout = Math.floor(diff / 1000 / 60);
    console.log('timeout', timeout);
    // 订阅成功前端缓存成功状态 当天只提醒订阅一次
    TrainActStore.setAttr('HASSUBSCRIBED', { key: true, timeout });
  },
  goHome() {
    util.goToHomepage();
  },
  async goBackAndSubscribe() {
    // 已登录
    let HASSUBSCRIBED = TrainActStore.getAttr('HASSUBSCRIBED');
    if (!HASSUBSCRIBED && shared.isCtripApp && this.data.isFromAwakenH5) {
      try {
        if (!cwx.user.isLogin()) {
          this.setData({ showType: 'subscribe' });
          this.setHasSubscribedStorageTimeout();
        } else {
          let res = await this.getSubsribeStatus();
          console.log('-----------subscribeStatus', res);
          //  可以订阅 (未订阅过)
          if (res.Status !== 1) {
            this.setData({ showType: 'subscribe' });
            this.setHasSubscribedStorageTimeout();
          } else {
            cwx.navigateBack();
          }
        }
      } catch (error) {
        cwx.navigateBack();
      }
    } else if (this.data.isLogin && shared.isCtripApp && !HASSUBSCRIBED) {
      let res = await this.getSubsribeStatus();
      console.log('-----------subscribeStatus', res);
      //  可以订阅 (未订阅过)
      if (res.Status !== 1) {
        if (!this.data.allLongSubFlag) {
          this.setData({ subscribeGuideFlag: true });
        }
        cwx.mkt.subscribeMsg(
          ['DhLBZPFtgtvI3UxDslMDKqOczWUUW2m_euc2ujHV0S4'],
          (data) => {
            this.ubtTrace('o_tra_Backwardgetsub_requireA', true);
            this.setHasSubscribedStorageTimeout();
            if (data?.errMsg) {
              // 取消订阅
              this.ubtDevTrace('c_train_subscribemsgerr', data?.errMsg);
            } else {
              // 订阅成功
              let { templateSubscribeStateInfos = [] } = data;
              let hasSubscribedTemp =
                templateSubscribeStateInfos?.filter(
                  (item) => item.subscribeState
                ) ?? [];
              console.log(
                '-------templateSubscribeStateInfos',
                templateSubscribeStateInfos
              );
              console.log('-----hasSubscribedTemp', hasSubscribedTemp);
              const m = new Map();
              m.set(
                'DhLBZPFtgtvI3UxDslMDKqOczWUUW2m_euc2ujHV0S4',
                'CtripLineStatusAlert'
              );
              console.log('--- m', m);
              hasSubscribedTemp.forEach((item) => {
                if (m.has(item.templateId)) {
                  console.log(
                    '-----SubscribeMessageTemplateModel',
                    SubscribeMessageTemplateModel
                  );
                  let params = {
                    OpenID: (cwx.cwx_mkt && cwx.cwx_mkt.openid) || '',
                    TemplateIDList: [item.templateId],
                    ActivityCode: m.get(item.templateId),
                    OrderNumber: '',
                    ShareAuth: '',
                    NickName: '',
                    PhotoUrl: '',
                    FromType: 3,
                  };
                  SubscribeMessageTemplateModel(params, (res) => {
                    this.setData({ subscribeGuideFlag: false });
                    this.ubtDevTrace('subscribeModelRes', res);
                    if (res.RetCode == 1) {
                      util.showToast('订阅成功', 'none');
                    } else {
                      util.showToast('订阅失败', 'none');
                    }
                  });
                }
              });
            }
            this.setData({ subscribeGuideFlag: false });
            cwx.navigateBack();
          },
          (err) => {
            this.setData({ subscribeGuideFlag: false });
            console.log(err);
            cwx.navigateBack();
          }
        );
      } else {
        this.setData({ subscribeGuideFlag: false });
        cwx.navigateBack();
      }
    } else {
      cwx.navigateBack();
    }
  },
  getSubsribeStatus() {
    const params = {
      ActivityCode: 'CtripLineStatusAlert',
      FromType: 3,
    };

    return util.promisifyModel(QuerySubscribeMessageStatusModel)(params);
  },
  hideBackDrop() {
    this.setData({
      showType: '',
    });
  },
  onCloseSubscribeDialog() {
    this.setData({
      showType: '',
    });
    cwx.navigateBack();
  },
  async onClickSubscribeTicket() {
    this.setData({
      showType: '',
    });

    if (!cwx.user.isLogin()) {
      cwx.user.login({
        async callback(res) {
          if (res.ReturnCode == '0') {
            let result = await this.getSubsribeStatus();
            console.log('-----------subscribeStatus1', result);
            //  可以订阅 (未订阅过)
            if (result.Status !== 1) {
              this.setData({
                showType: 'subscribe',
              });
            } else {
              cwx.navigateBack();
            }
          }
        },
      });
    } else {
      this.subscribeTicket(cwx.navigateBack);
    }
  },
  async onClickSubscribeTicketForRecieveCoupon() {
    this.setData({
      showType: '',
    });

    this.subscribeTicket();
  },
  async subscribeTicket(cb = function () {}) {
    let res = await this.getSubsribeStatus();
    console.log('-----------subscribeStatus', res);
    //  可以订阅 (未订阅过)
    if (res.Status !== 1) {
      if (!this.data.allLongSubFlag) {
        this.setData({ subscribeGuideFlag: true });
      }
      cwx.mkt.subscribeMsg(
        ['DhLBZPFtgtvI3UxDslMDKqOczWUUW2m_euc2ujHV0S4'],
        (data) => {
          this.ubtTrace('o_tra_Backwardgetsub_requireA', true);
          if (data?.errMsg) {
            // 取消订阅
            this.ubtDevTrace('c_train_subscribemsgerr', data?.errMsg);
          } else {
            // 订阅成功
            let { templateSubscribeStateInfos = [] } = data;
            let hasSubscribedTemp =
              templateSubscribeStateInfos?.filter(
                (item) => item.subscribeState
              ) ?? [];
            console.log(
              '-------templateSubscribeStateInfos',
              templateSubscribeStateInfos
            );
            console.log('-----hasSubscribedTemp', hasSubscribedTemp);
            const m = new Map();
            m.set(
              'DhLBZPFtgtvI3UxDslMDKqOczWUUW2m_euc2ujHV0S4',
              'CtripLineStatusAlert'
            );
            console.log('--- m', m);
            hasSubscribedTemp.forEach((item) => {
              if (m.has(item.templateId)) {
                console.log(
                  '-----SubscribeMessageTemplateModel',
                  SubscribeMessageTemplateModel
                );
                let params = {
                  OpenID: (cwx.cwx_mkt && cwx.cwx_mkt.openid) || '',
                  TemplateIDList: [item.templateId],
                  ActivityCode: m.get(item.templateId),
                  OrderNumber: '',
                  ShareAuth: '',
                  NickName: '',
                  PhotoUrl: '',
                  FromType: 3,
                };
                SubscribeMessageTemplateModel(params, (res) => {
                  this.ubtDevTrace('subscribeModelRes', res);
                  if (res.RetCode == 1) {
                    util.showToast('订阅成功', 'none');
                  } else {
                    util.showToast('订阅失败', 'none');
                  }
                });
              }
            });
          }
          this.setData({ subscribeGuideFlag: false });
          cb();
        },
        (err) => {
          console.log(err);
          this.setData({ subscribeGuideFlag: false });
          cb();
        }
      );
    } else {
      cb();
    }
  },
  // 定位并打开对应车次
  async scrollToTrain(trainName) {
    const arr = this.data.trainList;
    const trainIndex = arr.findIndex((item) => item.TrainNumber == trainName);
    const newTrain = await this.reGetTrainItem(trainIndex);
    if (newTrain?.isTingYun) {
      util.showToast('列车已停运', 'none');
    }
    // 展示下拉座席按钮
    if (trainIndex === this.data.seatCardIndex) {
      this.setData({
        seatCardIndex: -1,
      });
    } else {
      this.setData({
        seatCardIndex: trainIndex,
      });
      if (newTrain && !this.data.isReschedule) {
        const processedTrain = await this.getSeatVendorInfo(newTrain);
        this.setNewTrainList(processedTrain);
      }
    }
    this.setData({
      scrollToView: 'train_item_' + trainIndex,
    });
  },
  // 其他方式登录
  ctripLogin() {
    return new Promise((resolve, reject) => {
      cwx.user.login({
        callback(res) {
          if (res.ReturnCode == 0) {
            TrainBookStore.setAttr('auth', cwx.user.auth);
            getUserBindedPhoneNumber().then((num) => {
              if (num) {
                this.userBindedMobile = num;
                this.setData({ mobile: num });
              }
            });
            resolve();
          } else {
            reject();
          }
        },
      });
    });
  },
  // 新客礼包逻辑
  async getNewCustomerRights() {
    if (!this.data.isLogin) return;

    const payload = {
      FromType: 5,
      PageFrom: 1,
      DepartureDate: shared.selectDate.replace(/-/g, ''),
      IsListPageNewFlow: true,
      DepartCity: this.data.scopeData.from_loc,
      ArriveCity: this.data.scopeData.to_loc,
    };
    const res = await newcustomerMixin.getListActivityStautsInfo(payload);

    if (!res) return;

    await newcustomerMixin.getUserNewCustomerRight(this, 21);

    this.setData({ newGuestCardInfo: res });
    util.ubtTrace('s_trn_c_10320640939', {
      bizKey: 'newgiftPositionExposure',
      exposureType: 'normal',
    });
  },
  convertReceiveType() {
    return this.data.isFromPC == 1 ? 10 : 11;
  },
  getPassengerCountLimit() {
    try {
      ConfigInfoModel(
        {
          ConfigKey: 'train_passenger_count_limit',
        },
        (data) => {
          if (data?.ConfigInfo?.Content) {
            let res = data?.ConfigInfo?.Content;
            shared.pasCntLimit = Number(res);
          }
        }
      );
    } catch (error) {
      console.log('pasCntLimit err', error);
    }
  },
  isOverflowLine(height) {
    const lineNum = parseInt(height) / 24;
    return lineNum > 14;
  },
  async getConfig() {
    util.showLoading();
    try {
      const configRes = await getConfigByKeysPromise({
        keys: [
          'train-children-age-date',
          'miniapp-list-quick-filter',
          'miniapp-product-detail-url',
        ],
      });
      if (configRes.resultCode != 1) {
        throw '配置获取失败';
      }
      const childAgeLimit = configRes?.configs?.[0]?.data?.childAgeLimit;
      const quickConfig = configRes.configs?.find(
        (v) => v.key === 'miniapp-list-quick-filter'
      )?.data;
      const productUrlConfig = configRes.configs?.find(
        (v) => v.key === 'miniapp-product-detail-url'
      )?.data;
      shared.childAgeLimit = childAgeLimit;
      quickConfig &&
        this.setData({
          quickConfig,
        });
      productUrlConfig &&
        this.setData({
          productUrlConfig,
        });
      console.log(childAgeLimit, 'childAgeLimit');
      util.hideLoading();
    } catch (err) {
      util.hideLoading();
      util.showToast('网络开小差，请稍后再试', 'none');
      throw err;
    }
  },
  async setAllLongSubFlag() {
    const temArr = ['DhLBZPFtgtvI3UxDslMDKqOczWUUW2m_euc2ujHV0S4'];
    const res = await subscribeMixin.getNotLongSubIds(temArr);
    this.setData({ allLongSubFlag: res.length === 0 });
  },
  // 获取高频的站点
  async getTopStations() {
    const {
      dStation,
      aStation,
      stations,
      topStations: oldTopStations,
    } = this.data;
    if (oldTopStations?.length) return oldTopStations;
    const AllDepartStation = stations
      .filter((v) => v.isDepart)
      .map((v) => v.name)
      .join(',');
    const AllArriveStation = stations
      .filter((v) => !v.isDepart)
      .map((v) => v.name)
      .join(',');
    const params = {
      ChannelName: 'app',
      From: dStation,
      To: aStation,
      DepartDate: '2023-04-24',
      AllDepartStation,
      AllArriveStation,
    };
    // const params = {
    //   "ChannelName":"wx","From":"上海","To":"北京","DepartDate":"20230501","AllDepartStation":"上海","AllArriveStation":"北京"
    // }
    try {
      const res = await getDirectListTopQuickPromise(params);
      if (res.RetCode !== 1) throw new Error();
      const resArr = [];
      res.DepartStationList?.forEach((v) => {
        resArr.push({
          name: v.StationName,
          isDepart: true,
          isTop: true,
        });
      });
      res.ArriveStationList?.forEach((v) => {
        resArr.push({
          name: v.StationName,
          isDepart: false,
          isTop: true,
        });
      });
      this.setData({
        topStations: resArr,
      });
      return resArr;
    } catch (e) {
      return [];
    }
  },
  onClickQuickTag(e) {
    this.setData({
      seatCardIndex: -1,
      otherSeatCardIndex: -1,
    });
    // 这个函数 改变tag + renderfilter
    const { tagType, name } = e.currentTarget.dataset;
    const {
      stations,
      quickFilterTags,
      filterTrainType: oldType,
      filterTrainConditions: oldConditions,
    } = this.data;
    const curTag = quickFilterTags.find((v) => v.name === name);
    util.ubtTrace('TCWListPage_SelectLabel_click', {
      Item: curTag.traceType,
      clickType: !curTag.isSelected ? 1 : 0,
    });
    curTag.isSelected = !curTag.isSelected; // 改变原对象
    if (tagType.includes('Station')) {
      const curStation = stations.find((v) => v.name === name);
      if (curStation) {
        curStation.isSelected = curTag.isSelected;
      } else {
        // 代码上没发现可能为空的情况，埋个埋点看看究竟有没有报错
        this.ubtDevTrace('c_train_list_curstation_not_found', {
          stationName: name,
        });
      }
      this.setData({
        stations,
        selectedStations: stations.filter((v) => v.isSelected),
        quickFilterTags,
        selectedQuickFilterTags: quickFilterTags.some((v) => v.isSelected),
      });
    } else if (tagType.includes('GDC')) {
      // 模拟点击筛选器
      this.selectType({
        currentTarget: {
          dataset: {
            type: 2,
          },
        },
      });
      this.selectType({
        currentTarget: {
          dataset: {
            type: 4,
          },
        },
      });
      this.setData({
        quickFilterTags,
        selectedQuickFilterTags: quickFilterTags.some((v) => v.isSelected),
      });
      // 前两种是跟筛选器联动的需要额外处理，其余情况转交render处理
    } else {
      this.setData({
        quickFilterTags,
        selectedQuickFilterTags: quickFilterTags.some((v) => v.isSelected),
      });
    }
    this.renderFiltered();
  },
  updateQuickFilter() {
    const {
      selectedStations = [],
      stations = [],
      filterTrainConditions = [],
      topStations = [],
      quickFilterTags = [],
    } = this.data;
    if (this.data.isReschedule) {
      return;
    }
    // 筛选器只会联动城市和gdc tag
    const newFilterTags = quickFilterTags.filter(
      (v) => !v.tagType.includes('Station')
    );
    // const oldStationTags =  quickFilterTags.filter(v => v.tagType.includes('Station'));
    const newStationTags = getStationTags(
      selectedStations,
      stations,
      topStations,
      quickFilterTags
    );
    // updateStationTags(selectedStations, oldStationTags);
    const GDCTags = newFilterTags.find((v) => v.tagType === 'GDCTag');
    if (GDCTags) {
      GDCTags.isSelected =
        filterTrainConditions.Train_D && filterTrainConditions.Train_GC;
    }
    this.setData({
      quickFilterTags: [].concat(newStationTags, newFilterTags),
      selectedQuickFilterTags: quickFilterTags.some((v) => v.isSelected),
    });
  },

  async initQuickFilter() {
    // rawList包括 所有车次信息 直达，智慧中转，
    const {
      selectedStations = [],
      stations = [],
      filterTrainConditions = [],
      quickFilterTags: oldFilterTag = [], // 可能是切换日期过来的
      quickConfig = {},
      dStation = '',
      aStation = '',
      isReschedule = false,
    } = this.data;
    if (isReschedule) {
      return;
    }
    const rawList = [...this.rawList];

    if (!rawList.length) {
      this.setData({
        quickFilterTags: [],
        selectedQuickFilterTags: false,
      });
      return;
    }
    const topStations = await this.getTopStations();
    // 是否精确搜索
    const stationTags = getStationTags(
      selectedStations,
      stations,
      topStations,
      oldFilterTag
    );
    const GDCTags = getGDCTags(filterTrainConditions, rawList, quickConfig);
    const derictTags = getDirectTags(rawList, oldFilterTag);
    const ticketEnoughTags = getTicketEnoughTags(
      rawList,
      quickConfig,
      oldFilterTag
    );
    const fuXingTags = rawList.some((train) => train.IsFuXingTrain)
      ? [
          {
            name: '复兴号',
            isSelected: oldFilterTag.find((v) => v.name === '复兴号')
              ?.isSelected,
            tagType: 'fuXingTag',
            traceType: 7,
          },
        ]
      : [];
    const silentTags = rawList.some((train) => train.IsCanSilent)
      ? [
          {
            name: '静音车厢',
            isSelected: !!oldFilterTag.find((v) => v.name === '静音车厢')
              ?.isSelected,
            tagType: 'silentTag',
            traceType: 8,
          },
        ]
      : [];
    //TODO:
    let pointTags = [];
    if (this.data.isPoint) {
      pointTags = rawList.some((train) => train.IsCanPointsPay)
        ? [
            {
              name: '积分兑换',
              isSelected: true,
              tagType: 'pointTag',
              traceType: 6,
            },
          ]
        : [];
    } else {
      pointTags = rawList.some((train) => train.IsCanPointsPay)
        ? [
            {
              name: '积分兑换',
              isSelected: !!oldFilterTag.find((v) => v.name === '积分兑换')
                ?.isSelected,
              tagType: 'pointTag',
              traceType: 6,
            },
          ]
        : [];
    }

    const quickFilterTags = [].concat(
      stationTags,
      ticketEnoughTags,
      derictTags,
      GDCTags,
      pointTags,
      fuXingTags,
      silentTags
    );
    this.setData({
      quickFilterTags,
      selectedQuickFilterTags: quickFilterTags.some((v) => v.isSelected),
    });
    util.ubtTrace('TCWListPage_SelectLabel_exposure', {
      ItemList: quickFilterTags.map((v) => v.traceType),
    });
    return quickFilterTags;
  },
  async getListPromoPop(params) {
    try {
      const res = util.getLowerCaseKeyObject(
        await promotionSendCouponInfoPromise(params)
      );
      if (res.retCode === 1 && res.promotionSendCouponAlertInfo) {
        res.promotionSendCouponAlertInfo.titleNode =
          res.promotionSendCouponAlertInfo.title.replace(
            params.ArriveStation,
            `<span style='color: rgb(246,255,0); -webkit-text-stroke: 0.9px rgb(246,255,0);'>${params.ArriveStation}<span>`
          );
        this.setData({
          arrPromoPopVisible: true,
          arrPromoPopInfo: res.promotionSendCouponAlertInfo,
        });
      }
    } catch (e) {
      // TODO: 记录错误
      throw e;
    }
  },
  onClosePromoPop() {
    this.setData({
      arrPromoPopVisible: false,
    });
  },
  onClickOpenNewGuestPop() {
    this.setData({ showType: 'newGuestInfoPop' });
    util.ubtTrace('c_trn_c_10320640939', {
      bizKey: 'newgiftPositionClick',
    });
  },
  onClickGoNewGuestRule() {
    this.navigateTo({
      url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(
        this.data.newGuestGiftInfo.JumpUrl
      )}`,
    });
  },
  async departureTimeTipPopClick() {
    this.setData({
      showType: '',
    });
    await this.handleTrainItemPullDownEvents();
  },
};
function getTicketEnoughTags(
  rawList = [],
  quickConfig = [],
  oldFilterTag = []
) {
  // 只看直达
  const isNoTicketLeftNum = rawList.reduce((pre, cur) => {
    return cur.IsBookable ? pre : pre + 1;
  }, 0);
  const bookAbleNum = rawList.length - isNoTicketLeftNum;
  const tags =
    bookAbleNum > 0 &&
    isNoTicketLeftNum / rawList.length >= quickConfig.ticketEnoughLimit
      ? [
          {
            name: '仅看有票',
            isSelected: !!oldFilterTag.find((v) => v.name === '仅看有票')
              ?.isSelected,
            tagType: 'enoughTag',
            traceType: 3,
          },
        ]
      : [];
  // if(tags)
  return tags;
}
function getDirectTags(rawList = [], oldFilterTag = []) {
  // 如果存在非直达车次，才会展示这个标签
  if (!rawList.find((train) => train.TrainTransferInfos)) {
    return [];
  } else {
    return [
      {
        name: '仅看直达',
        isSelected: !!oldFilterTag.find((v) => v.name === '仅看直达')
          ?.isSelected,
        tagType: 'derictTag',
        traceType: 4,
      },
    ];
  }
}
function getGDCTags(filterTrainConditions, rawList = [], quickConfig = {}) {
  const GDCSum = rawList.reduce((pre, cur) => {
    // 中转车次判断
    if (cur.TrainTransferInfos) {
      const [{ TrainNumber: firstTrainNo }, { TrainNumber: secondTrainNo }] =
        cur.TrainTransferInfos;
      // 两程里面任意一程有G,D,C 就算有
      return /G|D|C/g.test(firstTrainNo + secondTrainNo) ? pre + 1 : pre;
    } else {
      return /G|D|C/g.test(cur.TrainNumber) ? pre + 1 : pre;
    }
  }, 0);
  // 首页带过来的
  if (filterTrainConditions.Train_D && filterTrainConditions.Train_GC) {
    return [
      {
        name: 'GDC优先',
        isSelected: true,
        tagType: 'GDCTag',
        traceType: 5,
      },
    ];
  }
  if (!GDCSum) return [];
  if (GDCSum / rawList.length >= quickConfig.GDCLimit) {
    return [];
  } else {
    return [
      {
        name: 'GDC优先',
        isSelected:
          filterTrainConditions.Train_D && filterTrainConditions.Train_GC,
        tagType: 'GDCTag',
        traceType: 5,
      },
    ];
  }
}
function getStationTags(
  selectedStations = [],
  stations = [],
  topStations = [],
  oldFilterTag = []
) {
  if (!stations.length) return [];
  let dTags = [],
    aTags = [],
    oldStationTags = oldFilterTag.filter((v) => v.tagType.includes('Station'));
  // let stationTags = [];
  [...topStations, ...oldStationTags, ...selectedStations].forEach((v) => {
    if (!stations.find((u) => u.name === v.name)) {
      return;
    }
    if ([...dTags, ...aTags].find((u) => u.name === v.name)) {
      return;
    }
    v.isDepart || v.tagType?.includes('DStation')
      ? dTags.push({
          name: v.name,
          isSelected: !!selectedStations.find((u) => u.name === v.name),
          tagType: v.isTop ? 'permanentDStation' : 'commonDStation',
          traceType: 1,
        })
      : aTags.push({
          name: v.name,
          isSelected: !!selectedStations.find((u) => u.name === v.name),
          tagType: v.isTop ? 'permanentAStation' : 'commonAStation',
          traceType: 2,
        });
  });
  return [...dTags, ...aTags];
}
function getStationsMapping(data) {
  const StationsMapping = [];
  const map = {};
  data.forEach((item) => {
    map[`${item.DepartStation},${item.ArriveStation}`] = true;
  });
  Object.keys(map).forEach((key) => {
    const [DepartureStation, ArriveStation] = key.split(',');
    StationsMapping.push({
      DepartureStation,
      ArriveStation,
    });
  });

  return StationsMapping;
}
function getExtendValueForV7(thenByTicketInfo, options) {
  const {
    originInfo,
    recommendArrStationDate,
    recommendDepStationDate,
    recommendDepStationTime,
    recommendArrStationTime,
    recommendArriveStation,
    recommendDepartStation,
    recommendArriveType,
    recommendDepartType,
    recommendPrice,
    solutionType,
    seatInfoList = [],
  } = thenByTicketInfo;
  const newSeatInfoList = seatInfoList.filter(
    (v) => options.seatName === v.seatType
  );
  const value = {
    ...originInfo,
    solutionInfoList: [
      {
        recommendArrStationDate,
        recommendDepStationDate,
        recommendDepStationTime,
        recommendArrStationTime,
        recommendArriveStation,
        recommendDepartStation,
        recommendArriveType,
        recommendDepartType,
        recommendPrice,
        solutionType,
        seatInfoList: newSeatInfoList,
      },
    ],
  };
  return JSON.stringify(value);
}
// 处理方案刷新toast 能执行这个方法的都是有智慧方案的
function handleWiseInfoToast(train, seatInfo) {
  if (!seatInfo) return;
  const seatVendorWiseSeat = seatInfo.seatVendorList?.find(
    (v) => v.VendorID === 65 || v.VendorID === 92
  );
  // if(!seatVendorWiseSeat) {
  //   util.showToast('为您刷新当前最新方案及余票');
  // }
  //
  if (train.thenByTicketInfo) {
    const wiseSeatName = train.thenByTicketInfo.seatType;
    // 处理方案要区分坐席 不是同个坐席的不处理
    if (wiseSeatName !== seatInfo.SeatName) return;

    if (
      !seatVendorWiseSeat || //变成了无方案
      !seatVendorWiseSeat.thenByTicketInfo || // 说明是上车补变成了组合座
      seatVendorWiseSeat.thenByTicketInfo.tag !== train.thenByTicketInfo.tag || // 说明是补票跨站方案不一致
      seatVendorWiseSeat.thenByTicketInfo.crossType !==
        train.thenByTicketInfo.crossType
    ) {
      return util.showToast('为您刷新当前最新方案及余票', 'none');
    }
  }

  if (train.combiInfo) {
    const wiseSeatName = train.combiInfo.seatType;
    // 处理方案要区分坐席 不是同个坐席的不处理
    if (wiseSeatName !== seatInfo.SeatName) return;

    if (
      !seatVendorWiseSeat || //变成了无方案
      !seatVendorWiseSeat.combiInfo // 说明是组合座变成了上车补
    ) {
      return util.showToast('为您刷新当前最新方案及余票', 'none');
    }
  }
}
util.useMixin(page, [trainNoticeMixin]);

TPage(page);
