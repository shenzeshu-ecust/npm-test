import { _, BusRouter } from '../../../index';

Component({
  properties: {
    shipRecommendData: {
      type: Object,
      observer: function (recommendData) {
        const hasHotBoatLine =
          recommendData.hotBoatLine &&
          recommendData.hotBoatLine.cityList &&
          recommendData.hotBoatLine.cityList.length > 0 &&
          recommendData.hotBoatLine.boatList &&
          recommendData.hotBoatLine.boatList.length > 0;
        const hasCheaperLine =
          (recommendData.topLine && recommendData.topLine.length > 0) ||
          (recommendData.bottomLine && recommendData.bottomLine.length > 0);
        const hasIslandLine =
          recommendData.islandLine && recommendData.islandLine.length > 0;
        let { selectedShipTab, selectedCity, boatData, selectedBoatList } =
          this.data;
        if (selectedShipTab === 'hot') {
          if (hasHotBoatLine) {
            selectedShipTab = 'hot';
          } else if (hasCheaperLine) {
            selectedShipTab = 'cheaper';
          } else if (hasIslandLine) {
            selectedShipTab = 'island';
          }
        }

        if (hasHotBoatLine && !selectedCity) {
          selectedCity = recommendData.hotBoatLine.cityList[0];
          recommendData.hotBoatLine.boatList.forEach((item) => {
            boatData[item.cityName] = item.boatLine;
          });
          selectedBoatList = boatData[selectedCity];
        }
        this.setData({
          recommendData,
          selectedShipTab,
          selectedCity,
          boatData,
          selectedBoatList,
        });
      },
    },
    shipTabs: {
      type: Array,
      observer: function (shipTabs) {
        this.setData({
          shipTabs,
        });
      },
    },
  },
  data: {
    recommendData: {},
    shipTabs: [],
    selectedShipTab: 'hot',
    selectedCity: null,
    boatData: {},
    selectedBoatList: [],
    moreLine: [],
    showModal: false,
  },
  methods: {
    jumpShipList(e) {
      const { item } = e.currentTarget.dataset;
      const url = `https://m.ctrip.com/webapp/ship/index.html?utmSource=ship_index_wechat#/pages/newship/list/index?__navigator=0&fromCity=${item.fromCity}&toCity=${item.toCity}&depDate=${item.recommendDate}`;
      BusRouter.navigateTo(url, {}, 0);
    },
    toSwitchShipTab(e) {
      const { item } = e.currentTarget.dataset;
      this.setData({
        selectedShipTab: item.type,
      });
    },
    toSwitchCityTab(e) {
      const { city } = e.currentTarget.dataset;
      const { boatData } = this.data;
      this.setData({
        selectedCity: city,
        selectedBoatList: boatData[city],
      });
    },
    onJump(e) {
      const { item } = e.currentTarget.dataset;
      const {
        fromCity,
        toCity,
        recommendDate,
        website,
        fromStation,
        toStation,
      } = item;
      const url = `https://m.ctrip.com/webapp/ship/index.html#/pages/newship/list/index?shiptype=new&fromCity=${fromCity}&toCity=${toCity}&depDate=${recommendDate}&website=${website}&fromStationName=${fromStation}&toStationName=${toStation}`;
      BusRouter.navigateTo(url, {}, 0);
    },
    onBook(e) {
      const { item } = e.currentTarget.dataset;
      if (item.moreLine && item.moreLine.length === 1) {
        const li = item.moreLine[0];
        const { fromCity, toCity, recommendDate } = li;
        const url = `https://m.ctrip.com/webapp/ship/index.html?utmSource=ship_index_wechat#/pages/newship/list/index?shiptype=new&fromCity=${fromCity}&toCity=${toCity}&depDate=${recommendDate}`;
        BusRouter.navigateTo(url, {}, 0);
      } else {
        this.triggerEvent('myevent', { moreLine: item.moreLine });
      }
    },
    lookMore(e) {
      const { item } = e.currentTarget.dataset;
      const { fromCity, toCity, recommendDate } = item;
      const url = `https://m.ctrip.com/webapp/newship/index.html#/pages/newship/island/index?shiptype=new&fromCity=${fromCity}&toCity=${toCity}&recommendDate=${recommendDate}`;
      BusRouter.navigateTo(url, {}, 0);
    },
  },
});
