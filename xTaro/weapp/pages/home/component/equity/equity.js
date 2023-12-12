import { cwx, _ } from "../../../../cwx/cwx.js";
import { URL_MAP } from '../../common/confs/fetchConfs';
import { TRACE_SHOW_EQUITY_CARD, TRACE_SLIDE_UP_EQUITY_CARD } from '../../common/confs/ubtConfs';
import { logWithUbtTrace, logWithUbtMetric } from '../../common/utils';

const EQUITY_STATUS = 'equityStatus';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    equityShowStatus: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    startY: 0,
    animationData: {},
    equityFlag: false,
    equityData: {}
  },
  observers: {
    'equityShowStatus': function() {
      if(this.data.equityShowStatus) {
        this.showCard();
      }
    }
  },
  pageLifetimes: {
    show: function() {
      this.showCard();
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showCard: function() {
      let self = this;
      let { equityShowStatus } = self.data;
      let storage = cwx.getStorageSync(EQUITY_STATUS) || false;
      let { auth, duid } = cwx.user;
      let lastShow = storage && JSON.parse(storage);
      let timeInterval = lastShow && (new Date().getTime() - lastShow.time)/86400000;
      let equityAB = cwx.ABTestingManager.valueForKeySync("210220_BBZ_qyxk");
      let expResult = cwx.ABTestingManager.valueForExpresultSync("210220_BBZ_qyxk");
      try{
        cwx.sendUbtByPage.ubtSet && cwx.sendUbtByPage.ubtSet("abtest", expResult); // ab数据上报
      }catch(e){
        console.log("提交equityAB埋点异常");
      }
      // 登录时 没有显示过卡片 或者 auth不相同 或者 时间间隔相差90天以上显示
      if(auth && equityShowStatus && (equityAB == 'B') && (!lastShow || (lastShow.auth !== auth) || timeInterval > 90)) {
        self.getEquityCard((res) => {
          if(res.statusCode == 200 && res.data.ResponseStatus.Ack == "Success" && res.data.isShow == '1') {
            let { ResponseStatus, isShow, result, avatar, curLevelCode, ...item } = res.data;
            let level = '';
            switch (curLevelCode+'') {
              case '0':
                level = 'ordinary'
                break;
              case '10':
                level = 'gold'
                break;
              case '20':
                level = 'platinum'
                break;
              case '30':
                level = 'diamond'
                break;
              case '35':
                level = 'gold-diamond'
                break;
              case '40':
                level = 'black-diamond'
                break;
              default:
                level = 'hidden'
                break;
            }
            self.setData({
              equityData: {
                ...item,
                avatar: avatar.length ? avatar : '//pic.c-ctrip.com/platform/h5/mini_programe/equity/default.jpg',
                level
              },
              equityFlag: true
            }, () => {
              self.timeOut = setTimeout(() => {
                self.cardDisappear();
              }, 3000)
            })
            let data = {
              auth: auth,
              time: new Date().getTime()
            }
            cwx.setStorageSync(EQUITY_STATUS, JSON.stringify(data));
            logWithUbtTrace({
              uid: duid,
              cid: cwx.clientID
            }, TRACE_SHOW_EQUITY_CARD);
            logWithUbtMetric({
              "type": "show",
              "position": "equity"
            })
          }
          console.log('-------getEquityCard--------',res)
        })
      }
    },
    getEquityCard: function (fn) {
      cwx.request({
        url: URL_MAP.getEquityCard,
        success: (res) => {
          fn(res);
        },
        fail: (res) => {
          fn(res);
        }
      })
    },
    touchStart: function (event) {
      let startY = event.touches[0].pageY;
      this.setData({
        startY
      })
    },
    touchEnd: function (event) {
      let { startY } = this.data;
      let endY = event.changedTouches[0].pageY;
      if(endY < startY) {
        this.cardDisappear();
        logWithUbtTrace({
          uid: cwx.user.duid,
          cid: cwx.clientID
        }, TRACE_SLIDE_UP_EQUITY_CARD);
        logWithUbtMetric({
          "type": "end",
          "position": "equity"
        })
      }
    },
    cardDisappear: function () {
      const animation = wx.createAnimation({
        duration: 300,
        timingFunction: 'linear',
      })
      animation.opacity(0).translateY(-10).step()
      this.setData({
        animationData: animation.export()
      })
    },
    equityHidden: function () {
      // 为了清除动画，所以创建了初始动画状态
      const animation = wx.createAnimation({
        duration: 0,
        timingFunction: 'linear',
      })
      animation.opacity(1).translateY(0).step({ duration: 0 })
      this.setData({
        startY: 0,
        animationData: animation.export(),
        equityFlag: false,
        equityData: {}
      })
      clearTimeout(this.timeOut);
    }
  }
})
