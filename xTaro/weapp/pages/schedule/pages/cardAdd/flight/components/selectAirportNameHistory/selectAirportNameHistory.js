import {
  HISTORY_SELECTED_AIRPORT_KEY
} from '../../biz.js';

Component({

  properties: {

  },

  data: {
    historyAirportList: []
  },

  ready: function() {
    let localThis = this;
    wx.getStorage({
      key: HISTORY_SELECTED_AIRPORT_KEY,
      success(res) {
        localThis.setData({
          historyAirportList: res.data
        });
      }
    });
  },

  methods: {
    selectAirport: function(e) {
      this.triggerEvent("selectHistoryAirport", {
        airportName: e.target.dataset.airportname,
        airportCode: e.target.dataset.airportcode,
        index: e.target.dataset.index
      });
    }
  }
})