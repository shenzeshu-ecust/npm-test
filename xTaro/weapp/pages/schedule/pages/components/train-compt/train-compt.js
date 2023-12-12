import { ctsFormatFromStringDate, CTS_DATE_FORMATE } from '../../ctsDateUtil.js';
// import { localStopStationList } from '../../cardDetail/train/data.js';
import { getTrainStopStationList } from '../../sendService.js';

Component({

  properties: {
    trainCardInfo: {
      type: Object,
      value: {
        departureCityName: null,
        departureStationName: null,
        departureDateTime: null,
        departureTime: null,
        departureDate: null,
        arrivalCityName: null,
        arrivalStationName: null,
        arrivalTime: null,
        arrivalDate: null,
        trainName: null,
        ticketGates: null,
        ticketCode: null,
        passengerList: [{
          passengerName: null,
          seatName: null,
          seatNo: null
        }],
        departureAddress: null,
        location: {
          latitude: 0,
          longitude: 0,
          name: '',
          address: '',
          title: '',
          description: ''
        },
        isFixed: false,
        grabTrainOrderInfo: {
          isReserve: false,
          buyingStatus: null,
          departureDates: null,
          trainNames: null,
          hasMultipleTrains: false,
          seats: null,
          hasStartedSelling: false,
          startDate: null
        },
        isOrder: false
      },
      observer: function(newVal, oldVal) {}
    },
    isShowDialog: {
      type: Boolean,
      value: false
    }
  },

  data: {
    isShowTrainMap: false,
    showStopStation: false,
    trainInfo: null,
    stopStationList: null,
    allStopStationList: null,
    // 是否抢票
    isGrabTicket: false,
    // 是否预约抢票
    isReserve: false,
    // 是否是单车次
    isSingleTrain: false,
    isShowGrabTime: false,
    grabTime: null,
    isShowTrainNames: false
  },

  ready: function() {
    this._parseData();
  },

  methods: {
    _parseData: function() {
      if (!this.properties.trainCardInfo) {
        throw new Error("TrainCardInfo is invalid.");
      }

      getTrainStopStationList(
        this.properties.trainCardInfo.trainName,
        this.properties.trainCardInfo.departureStationName,
        this.properties.trainCardInfo.arrivalStationName,
        this.properties.trainCardInfo.departureDateTime).then(res => {
        //res = localStopStationList;

        let obj = {
          isShowTrainMap: this.properties.trainCardInfo.location && this.properties.trainCardInfo.location != null || false,
          trainInfo: this.properties.trainCardInfo || null,
          stopStationList: res && res.length > 0 ? this._getStopStationList(res) : null,
          allStopStationList: res && res.length > 0 ? res : null,
        };

        if (this.properties.trainCardInfo.grabTrainOrderInfo) {
          let isGrabTicket = !this.properties.trainCardInfo.isFixed;
          let isReserve = this.properties.trainCardInfo.grabTrainOrderInfo.isReserve || false;
          let hasStartedSelling = this.properties.trainCardInfo.grabTrainOrderInfo.hasStartedSelling || false;
          let isShowGrabTime = isGrabTicket && isReserve && !hasStartedSelling && this.properties.trainCardInfo.grabTrainOrderInfo && (this.properties.trainCardInfo.grabTrainOrderInfo.startDate || false) && this.properties.trainCardInfo.grabTrainOrderInfo.startDate != "00010101000000";
        
          obj = {
            ...obj,
            isGrabTicket: isGrabTicket,
            isReserve: isReserve,
            isSingleTrain: !this.properties.trainCardInfo.grabTrainOrderInfo.hasMultipleTrains || false,
            isShowGrabTime: isShowGrabTime,
            grabTime: isShowGrabTime ? ctsFormatFromStringDate(this.properties.trainCardInfo.grabTrainOrderInfo.startDate, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_03) + ' ' + ctsFormatFromStringDate(this.properties.trainCardInfo.grabTrainOrderInfo.startDate, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_06) : "",
            isShowTrainNames: this.properties.trainCardInfo.grabTrainOrderInfo.hasMultipleTrains || false
          };
        }

        this.setData({
          ...obj
        })
        if (this.properties.isShowDialog) {
          this.onShowStopStation();
        }
      });
    },

    onShowStopStation: function() {
      let myEventDetail = {};
      myEventDetail.result = true;
      this.triggerEvent('showStopStationLayer', myEventDetail);
      this.setData({
        showStopStation: true
      })
    },

    onHideStopStation: function() {
      let myEventDetail = {};
      myEventDetail.result = false;
      this.triggerEvent('showStopStationLayer', myEventDetail);
      this.setData({
        showStopStation: false
      })
    },

    _getStopStationList: function(originStopStationList) {
      let validStopStation = [];
      originStopStationList && originStopStationList.map((item) => {
        item.stopType !== 0 && validStopStation.push(item);
      })
      return validStopStation;
    },
  }
})