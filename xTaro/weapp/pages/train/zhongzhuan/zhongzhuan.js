import TPage from '../common/TPage';
import cDate from '../common/cDate';
import util from '../common/util';
import bookNotice from '../common/components/book-notice/book-notice';
import {
  GetQConfigContentModel,
  GetQConfigSwitchModel,
  TrainGetStationTipInfoModel,
} from '../common/model';
import { GetStationInfoV2Promise, getConfigInfoJSON } from '../common/common';
import trainNoticeMixin from '../common/components/TrainNotice/trainNotice';

import { shared } from '../common/trainConfig';

const page = {
  checkPerformance: true,
  pageId: shared.pageIds.zhongzhuan.pageId,
  /**
   * 页面的初始数据
   */
  data: {
    departureDate: '',
    departWeek: '',
    transferDepatureDate: '',
    trainInfo: {},
    departureMinIndex: '',
    transferMinIndex: '',
    totalPrice: '',
    showType: '',
    sameStation: false,
    splitFlag: false,
    noticeInfoList: [],
    noticeShortTips: '',
    scrollView: '',
    activeIndex: 0,
    firstNoticeDialog: false, // 首次打开公告栏
    hkticket: false,

    transferRob: false,
    departureRob: false,
    supportMergePay: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.handleData(options);
    this.configSwitch = this.getQConfigSwitch();
    this.configSwitch.then(() => {
      this.configSwitch = null;
    });
    this.getMergePaySwitch();

    this.getListNotice();
  },

  getMergePaySwitch() {
    const deferred = util.getDeferred();
    const params = {
      Key: 'TrainTransferBookingAndGrabMergeConfig',

      Version: 'V2',
    };

    GetQConfigContentModel(
      params,
      (res) => {
        try {
          const configContent = JSON.parse(res.Content);
          const mergePayConfig = configContent.mergePayConfig.wxSwitchList;
          (mergePayConfig || []).forEach((config) => {
            if (config.SubChannel === shared.requestChannel) {
              this.setData({ supportMergePay: config.SwitchConfig.isOpen });
            }
          });
          deferred.resolve();
        } catch (err) {
          deferred.resolve();
        }
      },
      (err) => {
        deferred.resolve();
      }
    );

    return deferred.promise;
  },

  getQConfigSwitch() {
    const deferred = util.getDeferred();
    const params = { key: 'CtripMultiRouteSplitBookingSwitchV2' };
    GetQConfigSwitchModel(
      params,
      (res) => {
        this.setData({ splitFlag: res.IsOpen });
        deferred.resolve();
      },
      () => {
        deferred.resolve();
      }
    );

    return deferred.promise;
  },

  handleData(options) {
    let { trainInfo } = options.data || { trainInfo: undefined };
    if (options.trainInfo && !trainInfo) {
      trainInfo = JSON.parse(decodeURIComponent(options.trainInfo));
    }
    if (!trainInfo?.TrainTransferInfos) {
      return;
    }
    trainInfo.costalltime = trainInfo.Costalltime || trainInfo.costalltime;
    let departtime = trainInfo.TrainTransferInfos[0].DepartDate;
    let trnasdeparttime =
      trainInfo.TrainTransferInfos[trainInfo.TrainTransferInfos.length - 1]
        .DepartDate;
    let departDate = cDate.parseCDateTime(departtime);
    let transdepartDate = cDate.parseCDateTime(trnasdeparttime);

    let firstArriveStation = trainInfo.TrainTransferInfos[0].ArriveStation;
    let secondDepartStation =
      trainInfo.TrainTransferInfos[trainInfo.TrainTransferInfos.length - 1]
        .DepartStation;

    if (firstArriveStation == secondDepartStation) {
      this.setData({
        sameStation: true,
      });
    }
    let tmp = trainInfo.TrainTransferInfos.map((item, index) => {
      item.runTimeStr = util.costTimeString(item.RunTime);

      let minPrice = Infinity;
      let minSeatIndex = 0;
      item.SeatList.forEach((element, seatIndex) => {
        if (element.disabled) {
          return;
        }
        if (element.SeatPrice < minPrice) {
          minPrice = element.SeatPrice;
          minSeatIndex = seatIndex;
        }
      });
      if (trainInfo.canSetSeat){
        const seatIndex = item.SeatList.findIndex((element)=>element.SeatName === item.recommendSeat)
        minSeatIndex =  seatIndex < 0 ? minSeatIndex : seatIndex
      } 
      let isRobTicket = item.SeatList[minSeatIndex].SeatInventory === 0;
      if (index) {
        this.setData({
          transferMinIndex: minSeatIndex,
          transferRob: isRobTicket,
        });
      } else {
        this.setData({
          departureMinIndex: minSeatIndex,
          departureRob: isRobTicket,
        });
      }

      return item;
    });
    trainInfo.TrainTransferInfos = tmp;
    let TrnFromScene = '底部方案';
    if (trainInfo.RecommendType) {
      const sceneArr = ['A', 'B', 'C', 'D', 'F', 'E'];
      TrnFromScene = sceneArr[trainInfo.RecommendType - 1];
    }

    this.setData({
      trainInfo: trainInfo,
      departureDate: new cDate(departDate.getTime()).format('n月j日'),
      transferDepatureDate: new cDate(transdepartDate.getTime()).format(
        'n月j日'
      ),
      departWeek: cDate.weekday(departDate.getTime()),
    });
    console.log(trainInfo, 'trainInfo');
    this.resetPrice();
    this.traceExposureTransInfo();
  },

  traceExposureTransInfo() {
    setTimeout(() => {
      const {
        trainInfo,
        departureRob,
        transferRob,
        sameStation,
        departureMinIndex,
        transferMinIndex,
      } = this.data;

      let TrnFromScene = '底部方案';
      if (trainInfo.RecommendType) {
        const sceneArr = ['A', 'B', 'C', 'D', 'F', 'E'];
        TrnFromScene = sceneArr[trainInfo.RecommendType - 1];
      }
      util.ubtTrace('TCWTrainTransit_exposure', {
        PageId: '10650001394',
        TripType: departureRob || transferRob ? 4 : sameStation ? 2 : 3,
        TrnFromScene,
        Status: trainInfo.isHasZhiDa ? 1 : 2,
        WaitingTime: trainInfo.transferTime,
        TrnSmcInfo: trainInfo.TrainTransferInfos.map((item, idx) => {
          let TicketSeat;
          if ((idx = 0)) {
            TicketSeat = item.SeatList[departureMinIndex];
          } else {
            TicketSeat = item.SeatList[transferMinIndex];
          }

          const ticketprice = +(TicketSeat?.SeatPrice || 0);
          return {
            TicketSeat: TicketSeat?.SeatName || '',
            departdatetime: item.DepartTime,
            arrivaldatetime: item.ArriveTime,
            departstationname: item.DepartStation,
            arrivestationname: item.ArriveStation,
            trainnumber: item.TrainNumber,
            route: idx + 1,
            ticketprice: ticketprice,
          };
        }),
      });
    }, 500);
  },

  selectSeat(e) {
    let index = e.currentTarget.dataset.index;
    let istransfer = e.currentTarget.dataset.train;
    const TrainTransferInfos = this.data.trainInfo.TrainTransferInfos;
    if (istransfer) {
      let element =
        TrainTransferInfos[TrainTransferInfos.length - 1].SeatList[index];
      if (element.disabled) {
        let { departureRob, supportMergePay } = this.data;
        if (departureRob || !supportMergePay) {
          return;
        }
        this.setData({
          transferMinIndex: index,
          transferRob: true,
        });
      } else {
        this.setData({
          transferMinIndex: index,
          transferRob: false,
        });
      }
    } else {
      let element = TrainTransferInfos[0].SeatList[index];
      if (element.disabled) {
        let { transferRob, supportMergePay } = this.data;
        if (transferRob || !supportMergePay) {
          return;
        }

        this.setData({
          departureMinIndex: index,
          departureRob: true,
        });
      } else {
        this.setData({
          departureMinIndex: index,
          departureRob: false,
        });
      }
    }
    this.resetPrice();
    this.traceExposureTransInfo();
  },

  resetPrice() {
    this.setData({
      totalPrice:
        this.data.trainInfo.TrainTransferInfos[0].SeatList[
          this.data.departureMinIndex
        ].SeatPrice +
        this.data.trainInfo.TrainTransferInfos[1].SeatList[
          this.data.transferMinIndex
        ].SeatPrice,
    });
  },

  nextStep() {
    if (this.configSwitch) {
      this.configSwitch.then(() => {
        if (this.data.splitFlag) {
          this.setData({
            showType: 'transitTip',
          });
        } else {
          this.goToBookingOrigin();
        }
      });
    } else {
      this.goToBookingOrigin();
    }
  },
  goToBooking(e) {
    const { index } = e.currentTarget.dataset;
    const tmp = this.data.trainInfo.TrainTransferInfos[index];
    this.data.trainInfo.TrainTransferInfos.forEach((item, seatIndex) => {
      item.SeatName =
        seatIndex == 0
          ? item.SeatList[this.data.departureMinIndex].SeatName
          : item.SeatList[this.data.transferMinIndex].SeatName;
      item.Price =
        seatIndex == 0
          ? item.SeatList[this.data.departureMinIndex].SeatPrice
          : item.SeatList[this.data.transferMinIndex].SeatPrice;
    });

    shared.train = tmp;
    (shared.splitTransit = true),
      (shared.transitObjSplit = this.data.trainInfo);
    this.goBookingPage({
      splitTransit: true,
      transitObjSplit: this.data.trainInfo,
    });
  },
  goToBookingOrigin() {
    if (!this.data.trainInfo.TrainTransferInfos) {
      return util.showModal({
        m: '车次信息获取失败，请稍候再试',
        done: () => this.navigateBack(),
      });
    }
    this.data.trainInfo.TrainTransferInfos[0].SeatName =
      this.data.trainInfo.TrainTransferInfos[0].SeatList[
        this.data.departureMinIndex
      ].SeatName;
    this.data.trainInfo.TrainTransferInfos[0].Price =
      this.data.trainInfo.TrainTransferInfos[0].SeatList[
        this.data.departureMinIndex
      ].SeatPrice;
    this.data.trainInfo.TrainTransferInfos[1].SeatName =
      this.data.trainInfo.TrainTransferInfos[1].SeatList[
        this.data.transferMinIndex
      ].SeatName;
    this.data.trainInfo.TrainTransferInfos[1].Price =
      this.data.trainInfo.TrainTransferInfos[1].SeatList[
        this.data.transferMinIndex
      ].SeatPrice;

    const { trainInfo, departureRob, transferRob } = this.data;
    let TrnFromScene = '底部方案';
    if (trainInfo.RecommendType) {
      const sceneArr = ['A', 'B', 'C', 'D', 'F', 'E'];
      TrnFromScene = sceneArr[trainInfo.RecommendType - 1];
    }
    util.ubtTrace('TCWTrainTransit_NextStep_click', {
      PageId: '10650001394',
      TripType: transferRob || departureRob ? 4 : this.data.sameStation ? 2 : 3,
      TrnFromScene,
      Status: trainInfo.isHasZhiDa ? 1 : 2,
      WaitingTime: trainInfo.transferTime,
      TrnSmcInfo: trainInfo.TrainTransferInfos.map((item, idx) => {
        return {
          TicketSeat: item.SeatName,
          departdatetime: item.DepartTime,
          arrivaldatetime: item.ArriveTime,
          departstationname: item.DepartStation,
          arrivestationname: item.ArriveStation,
          trainnumber: item.TrainNumber,
          route: idx + 1,
          ticketprice: item.Price,
        };
      }),
    });
    shared.transitObj = this.data.trainInfo;
    shared.train = {};
    this.goBookingPage({
      transitObj: this.data.trainInfo,
    });
  },
  goBookingPage(data) {
    this.navigateTo({
      url: '/pages/trainBooking/booking/ordinary/index',
      data,
    });
  },
  hideTips() {
    this.setData({
      showType: '',
    });
  },
  showTransferTips(e) {
    // this.setData({
    //   showType: 'transfer-tips'
    // })
    bookNotice.methods.showTips(e);
  },

  getListNotice() {
    const params = {
      ChannelName: 'ctripwx',
      DepartDate: shared.selectDate,
      FromType: 7,
      TicketList: [
        {
          Sequence: 1,
          DepartStation: this.data.trainInfo.DepartStation,
          ArriveStation: this.data.trainInfo.TransferStation,
        },
        {
          Sequence: 2,
          DepartStation: this.data.trainInfo.TransferStation,
          ArriveStation: this.data.trainInfo.ArriveStation,
        },
      ],
    };
    TrainGetStationTipInfoModel(params, (res) => {
      if (res.RetCode == 1) {
        this.noticeUrl = res.JumpUrl;
        const noticeInfoList = [];
        const trainNoticeTitle = [];
        let transferNoticeTipsList = [];
        if (res.CovidTipList?.length) {
          trainNoticeTitle.push('出行提醒');
          noticeInfoList.push({
            Title: '出行提醒',
            tipList: res.CovidTipList,
          });
        }
        if (res.CovidInfoList?.length) {
          // 处理中转数据
          transferNoticeTipsList = res.CovidInfoList.filter(
            (item) => item.StationName === this.data.trainInfo.TransferStation
          );
          if (
            res.CovidInfoList.filter(
              (item) =>
                item.StationName !== this.data.trainInfo.TransferStation &&
                item.LeavePolicy
            ).length !== 0
          ) {
            const temp = res.CovidInfoList.filter(
              (item) =>
                item.StationName !== this.data.trainInfo.TransferStation &&
                item.LeavePolicy
            )[0];
            noticeInfoList.push(temp);
            trainNoticeTitle.push(temp.Title.slice(0, temp.Title.length - 2));
          }

          noticeInfoList.push({
            Title: `中转${this.data.trainInfo.TransferStation}`,
            IsTransfer: true,
            transferTipsList: transferNoticeTipsList,
          });
          trainNoticeTitle.push(`中转${this.data.trainInfo.TransferStation}`);
          if (
            res.CovidInfoList.filter(
              (item) =>
                item.StationName !== this.data.trainInfo.TransferStation &&
                item.ComePolicy
            ).length !== 0
          ) {
            const temp = res.CovidInfoList.filter(
              (item) =>
                item.StationName !== this.data.trainInfo.TransferStation &&
                item.ComePolicy
            )[0];
            noticeInfoList.push(temp);
            trainNoticeTitle.push(temp.Title.slice(0, temp.Title.length - 2));
          }
        }
        noticeInfoList.forEach((item, index) => {
          if (item.LeavePolicy) {
            item.LeavePolicy = item.LeavePolicy.replace(/</gi, '&lt;');
          }
          if (item.ComePolicy) {
            item.ComePolicy = item.ComePolicy.replace(/</gi, '&lt;');
          }
          if (item.IsTransfer) {
            item.transferTipsList.forEach((ti) => {
              if (ti.LeavePolicy) {
                ti.LeavePolicy = ti.LeavePolicy.replace(/</gi, '&lt;');
              }
              if (ti.ComePolicy) {
                ti.ComePolicy = ti.ComePolicy.replace(/</gi, '&lt;');
              }
            });
          }
        });
        this.setData({
          noticeContent: res.Tips,
          noticeShortTips: res.ShortTips,
          noticeInfoList: noticeInfoList,
          trainNoticeTitle,
          noticeDesc: res.ReliefContent,
        });
        if (res.ShortTips) {
          util.ubtFuxiTrace('225060', { PageId: this.pageId });
        }
        this.noticeMoreUrl = res.MoreUrl;
      }
    });
  },
  isOverflowLine(height) {
    const lineNum = parseInt(height) / 24;
    return lineNum > 14;
  },
  jumpToTransfer() {
    util.ubtTrace('TCWTrainTransit_TransitTips_click', {
      PageId: '10650001394',
      ArriveStation: this.data.trainInfo.TrainTransferInfos[0].ArriveStation,
      WaitingTime: this.data.trainInfo.transferTime,
    });
    const station =
      this.data.trainInfo.TrainTransferInfos[0].ArriveStation + '站';
    const expire = this.data.trainInfo.transferTime;
    this.navigateTo({
      url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(
        `https://m.ctrip.com/webapp/train/activity/train-transfer-intro?station=${station}&expire=${expire}`
      )}`,
    });
  },
  async onClickGoWxMap() {
    util.ubtTrace('TCWTrainTransit_TransitMap_click', {
      PageId: '10650001394',
      DepartStation: this.data.trainInfo.TrainTransferInfos[0].ArriveStation,
      ArriveStation: this.data.trainInfo.TrainTransferInfos[1].DepartStation,
      WaitingTime: this.data.trainInfo.transferTime,
    });
    const station1 = await GetStationInfoV2Promise({
      StationName: this.data.trainInfo.TrainTransferInfos[0].ArriveStation,
      type: 0,
    });
    const MapContext = wx.createMapContext('myMap');
    MapContext.openMapApp({
      latitude: Number(station1.Latitude),
      longitude: Number(station1.Longitude),
      destination:
        this.data.trainInfo.TrainTransferInfos[0].ArriveStation + '站',
      complete() {
        console.log('complete!!');
      },
    });
  },
};

util.useMixin(page, [trainNoticeMixin]);

TPage(page);
