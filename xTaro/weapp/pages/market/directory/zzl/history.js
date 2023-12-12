import { cwx, CPage } from "../../../../cwx/cwx.js";
import utils from "../../common/utils";
const model  = require('./model');

CPage({
  pageId: '10650067839',
  data: {
    historyList: null,
    cardColor: {
      'spade': '♠️',
      'heart': '♥️',
      'club': '♣️',
      'diamond': '♦️',
    },
    prizeLevelCfg: {
      '1':'一',
      '2':'二',
      '3':'三',
      '4':'四',
    }
  },
  onLoad() {
    utils.getOpenid(()=> {
      this.initPage()
      this.ubtTrace && this.ubtTrace('mkt_wechat_activity_lottery', {
        "activityId": this.data.activityId,
        "openid":cwx.cwx_mkt.openid,
        "action": "zzl onload",
        "pageid": this.pageId
      });
    }, (err)=>{
      this.ubtTrace && this.ubtTrace('mkt_wechat_activity_lottery', {
        "activityId": this.data.activityId,
        "openid": '',
        "action": "zzl onload",
        "pageid": this.pageId
      });
    })
    wx.hideShareMenu()
  },
  async initPage() {
    let periodCards = await this.fetchHistory()
    periodCards = periodCards.filter(item => {
      return item.drawPrize == 1
    })

    let priodsList = periodCards.map(item => item.periodNum).join(',')

    const userCards = await this.fetchUserHistory({ priodsList })
    let _historyList = periodCards.map((item) => {
      item.userCards = []
      for(let i=0;i<userCards.length;i++) {
        if(userCards[i].periodNum == item.periodNum) {
          item.userCards.push(userCards[i])
        }
      }
      return item
    });
    _historyList.map(item => {
      let periodCards = [item.cardA,item.cardB,item.cardC,item.cardD]
      item['userOrderCards'] = this.formatOrder(periodCards, item.userCards)
      return item
    })

    this.setData({
      historyList: _historyList
    })
  },
  // 历史期数
  async fetchHistory() {
    return new Promise((resolve, reject) => {
      model.requestUrl('getZzlPeriodCard', {
        activityId: this.data.activityId,
        pageNo: 1,
        pageSize: 21
      }, res => {
        if(res.errCode == 0 && res.periodCards) {
          resolve(res.periodCards)
        }else {
          reject()
        }
      })
    })
  },
  // 用户期数
  async fetchUserHistory({ priodsList }) {
    return new Promise((resolve, reject) => {
      model.requestUrl('getZzlUserCard', {
        activityId: this.data.activityId,
        periodNum: priodsList
      }, res => {
        if(res.errCode == 0) {
          const cards = res.userCards || []
          resolve(cards)
        } else {
          reject()
        }
      })
    })
  },
  goTargetUrl(e) {
    const url = e.target.dataset.url || e.currentTarget.dataset.url
    utils.goTargetUrl(url)
  },
  formatOrder(periodCards, userCards) {
    let firstPrize = []
    let secondPrize = []
    let thirdPrize = []
    let fourthPrize = []
    let noPrize = []


    for(let i=0,len=userCards.length;i<len;i++) {
      let count = 0
      periodCards.indexOf(userCards[i].cardA) >= 0 && count ++
      periodCards.indexOf(userCards[i].cardB) >= 0 && count ++
      periodCards.indexOf(userCards[i].cardC) >= 0 && count ++
      periodCards.indexOf(userCards[i].cardD) >= 0 && count ++

      switch(count) {
        case 4:
            firstPrize.push(userCards[i]);
            break;
          case 3:
            secondPrize.push(userCards[i]);
            break;
          case 2:
            thirdPrize.push(userCards[i]);
            break;
          case 1:
            fourthPrize.push(userCards[i]);
            break;
          default:
            noPrize.push(userCards[i]);
          break;
      }
    }
    return firstPrize.concat(secondPrize, thirdPrize, fourthPrize, noPrize)
  },
  onShareAppMessage() {
    return {
      title: '',
      path: '',
      imageUrl: ''
    }
  }
})