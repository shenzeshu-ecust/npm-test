const utils = require('../util/utils')
import {
  getRecommendLiveGoods,
} from '../service/webcastRequest.js';
import common from '../../common/common.js';
import { values } from '../../../../3rd/lodash.core.min.js';
module.exports = Behavior({

  properties: {
    displayThemes: {
      type:Object,
      value: []
    }
  },
  data: {
    masterRecommendGoods: [],
    displayTheme: String,
    changeHeight: Number
  },
  ready: function () {

  },
  methods: {
    refreshBg: function(){
      let displayTheme = "";
      if(this.data.masterRecommendGoods.length > 1){
        displayTheme = this.properties.displayThemes.bg3
      }else{
        if (!this.data.disPlayThemeIsTwo) {
          displayTheme = this.properties.displayThemes.bg1
        } else {
          displayTheme = this.properties.displayThemes.bg2
        }
      }
      this.setData({
        displayTheme
      })
    },
    reqRecommend: function (liveID, source) {
      let param = {
        liveId: liveID,
        source: source,
        localCityId: utils.currentCity()
      }
      getRecommendLiveGoods(param, (res) => {
        if (common.checkResponseAck(res) && res.data.recommendGoods && res.data.recommendGoods.length > 0) {
          const items = [];
          let disPlayThemeIsTwo = false
          res.data.recommendGoods.map((item, i ) => {
            let masterGoods = item;
            let priceIsNum = masterGoods.fromPrice && masterGoods.fromPrice.price && !isNaN(parseFloat(masterGoods.fromPrice.price))
            masterGoods.priceIsNum = !!priceIsNum;//只显示数字价格
            let title = masterGoods.title

            if (!disPlayThemeIsTwo && title.length > 8) {
              disPlayThemeIsTwo = true
            } 
            if (masterGoods.priceType == 2) {//区间价 超出一行展示最低价，产品视觉要求的逻辑
              let rangePriceString = masterGoods.fromPrice.price + (masterGoods.toPrice.price ? '-' + masterGoods.toPrice.price : '')
              if (rangePriceString.length > 10) {
                rangePriceString = masterGoods.fromPrice.price;
                masterGoods.rangePriceStringSuffix = '起';
              }
              masterGoods.rangePriceString = rangePriceString;
            }
            items.push(masterGoods);
          })
          let displayTheme = "";
          let changeHeight = 252;
          if(items.length > 1){
            changeHeight = 232
            displayTheme = this.properties.displayThemes.bg3
          }else{
            if (!disPlayThemeIsTwo) {
              changeHeight = 190
              displayTheme = this.properties.displayThemes.bg1
            } else {
              changeHeight = 220
              displayTheme = this.properties.displayThemes.bg2
            }
          }
          this.setData({
            masterRecommendGoods: items,
            displayTheme,
            changeHeight,
            disPlayThemeIsTwo
          })

        } else {
          this.setData({
            masterRecommendGoods: [],
          })
        }
      });
    },
  }
})

