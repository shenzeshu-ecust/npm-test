import {
  cwx,
  _
} from "../../../../../cwx/cwx.js";
import model from "./model.js";
import Machine from "./utils/machine.js"
import {
  debounceFunc,
  goTargetUrl
} from '../../../common/utils'

Component({
  properties: {
    sceneCode: {
      type: String,
      value: ''
    },
    tempid: {
      type: String,
      value: ''
    },
    compid: {
      type: String,
      value: ''
    },
  },
  data: {
    isShow: true,
    remainChance: 0,
    num1: 0,
    num2: 0,
    num3: 0,
    speed: 15,
    slotOneList: [],
    slotTwoList: [],
    slotThreeList: [],
    prizeInfo: null,
    sign: '',
    showPrizeModal: {}
  },

  lifetimes: {
    attached: function () {
      this.initTrace()
      this._onLoad()
      this.fetchCountCache = this.fetchCountSync.bind(this)
      cwx.Observer.addObserverForKey('mkt_taskevent_acceptprize', this.fetchCountCache)
    },
    detached: function () {
      cwx.Observer.removeObserverForKey('mkt_taskevent_acceptprize', this.fetchCountCache)
    }
  },
  pageLifetimes: {
    show: function () {
      this.initTrace()
    }
  },

  methods: {
    async _onLoad() {
      await this.fetchTemplateData(this.data.tempid, this.data.compid)
      await this.fetchPrize()
      await this.fetchCount()
      setTimeout(() => {
        this.initMachine()
      }, 500)
    },
    async initMachine() {
      const h = await this.getItemHeight()
      console.log('===========', h)
      this.machine = new Machine(this, {
        height: h || 65, //单个数字高度
        len: this.data.slotOneList.length,
        num1: this.data.num1,
        num2: this.data.num2,
        num3: this.data.num3,
        callback: debounceFunc(this.callback.bind(this), 600)
      })
    },
    getItemHeight() {
      return new Promise(resolve => {
        let query = wx.createSelectorQuery().in(this);
        query.select('.machine_item_ele').boundingClientRect(rect=>{
          let height = rect?.height;
          resolve(height)
        }).exec();
      })
    },
    async fetchCount() {
      const res = await model.queryStatus({
        sceneCode: this.data.sceneCode
      });
      if (res.code === 0 || res.code === '40048') {
        this.setData({
          remainChance: res.userStateInfo.remainingJoinTimes
        })
      }
      this.customerUbtTrace({
        action: 'queryStatus',
        res
      })
    },
    fetchCountSync() {
      setTimeout(() => {
        this.fetchCount()
      }, 300)
    },
    async join() {
      const sceneCode = this.data.sceneCode
      const prizeCode = ''
      const token = ''
      const rid = ''
      let sid = ''
      let ouid = ''
      let aid = ''
      let pushCode = ''
      const params = {
        sceneCode,
        prizeCode,
        token,
        rid,
        allianceInfo: {
          aid,
          ouid,
          pushCode,
          sid,
        },
        extension: {},
      };
      let res = await model.join(params)
      this.customerUbtTrace({
        action: 'join',
        res
      })
      const {
        code,
        prizeInfo = {}
      } = res;
      if (code === 0) {
        if (Object.keys(prizeInfo).length === 0) {
          console.error(`奖品包信息：${prizeInfo}`);
          return false;
        }
        this.setData({
          prizeInfo
        })
        if (prizeInfo.prizeType === 2) {
          // 获取签名
          this.getSign(); //抽到实体奖  签名即可调用成功
        }
        return true
      } else if (code === 40006) {
        // 未登录
        cwx.user.login({
          param: {
            sourceId: "market"
          },
        });
        return false
      } else if (code === 40012) {
        // 没有次数 锚点到任务
        scrollToTask()
        return false
      } else if ([40103, 40104, 40105, 40009].includes(code)) {
        // 风控
        cwx.showToast({
          title: '很抱歉，您尚未满足活动参与条件',
          icon: 'none'
        })
      } else {
        // this.setData({
        //   'showPrizeModal.show': true,
        //   'showPrizeModal.type': 3, // 错误 请重试
        // })
        cwx.showToast({
          title: '错误，请重试',
          icon: 'none'
        })

        return false
      }
    },
    async getSign() {
      try {
        const {
          signature
        } = await model.generateSign({
          sceneCode: this.state.sceneCode,
          aid: '',
          sid: '',
        });
        if (signature) {
          this.sign = signature;
          this.setState({
            sign: signature
          });
        }
      } catch (error) {}
    },
    async handleClickChoujiang() {
      if (this.data.remainChance == 0) {
        wx.showToast({
          title: '抽奖次数不足',
          icon: 'none'
        })
        scrollToTask()
        return
      }
      const ispass = await this.join()
      if (!ispass) return
      const {
        prizeInfo
      } = this.data
      const [oneIndex, twoIndex, threeIndex] = this.resolvePrizeIndex(prizeInfo)
      this.setSelect(1, oneIndex)
      this.setSelect(2, twoIndex)
      this.setSelect(3, threeIndex)
      this.machine.start()
    },
    callback() {
      // 0:空奖 1:虚拟奖品 2:实体奖品
      const {
        prizeInfo
      } = this.data
      if (prizeInfo?.prizeType && parseInt(prizeInfo?.prizeType) !== 0) {
        // wx.showToast({
        //   title: '恭喜您，赢得' + prizeInfo.name,
        //   icon: 'none'
        // })
        this.setData({
          'showPrizeModal.show': true,
          'showPrizeModal.prizeName': prizeInfo.name,
          'showPrizeModal.type': 1, // 正常展示奖品
        })
      } else {
        cwx.showToast({
          title: '很遗憾，您没有中奖',
          icon: 'none'
        })
        // this.setData({
        //   'showPrizeModal.show': true,
        //   'showPrizeModal.type': 2, // 没有中奖
        // })
      }
      this.machine.reset()
      this.fetchCount()
      this.setData({
        prizeInfo: null
      })
    },
    handleCloseTrainAwardModal() {
      this.setData({
        'showPrizeModal.show': false,
      })
    },
    resolvePrizeIndex(prizeInfo) {
      if (!prizeInfo?.name) {
        return [0, 0, 0]
      }
      const {
        slotOneList,
        slotTwoList,
        slotThreeList
      } = this.data
      let obj = {
        name: prizeInfo.name,
        url: JSON.parse(prizeInfo.extension).url,
        type: prizeInfo.prizeType,
      };
      const oneIndex = slotOneList.findIndex(item => item.name == obj.name)
      const twoIndex = slotTwoList.findIndex(item => item.name == obj.name)
      const threeIndex = slotThreeList.findIndex(item => item.name == obj.name)
      return [oneIndex, twoIndex, threeIndex]
    },
    /**
     * 获取模板数据 并且拉取任务数据
     * @param  {String} tempid 模板id
     */
    async fetchTemplateData(tempid, compid) {
      const res = await model.loadLegaoTemplate({
        templateCode: tempid
      })
      if (res.code == 0 && res.template) {
        try {
          const pageComps = res.components
          let i = 0,
            len = pageComps.length;
          let data = null;
          for (i; i < len; i++) {
            if (pageComps[i].id == compid) {
              data = JSON.parse(pageComps[i].property)
              break
            }
          }
          this.setData({
            compData: data,
            sceneCode: data.sceneCode
          })
        } catch (e) {
          console.log('tpl JSON parse err: ', e)
        }
      } else {
        // 组件过期或者关闭组件
        this.setData({
          isShow: false
        })
      }
    },
    async fetchPrize() {
      let {
        sceneCode,
        slotOneList,
        slotTwoList,
        slotThreeList
      } = this.data
      const res = await model.queryPrizeInfo({
        sceneCode,
      });
      const {
        code,
        sceneInfo,
        prizeInfos
      } = res;
      if (code === 0) {
        const defaultList = setDefaultSlotList(prizeInfos);
        const cloneList = _.clone(defaultList)
        slotOneList = randomSlotList(cloneList);
        slotTwoList = randomSlotList(cloneList);
        slotThreeList = randomSlotList(cloneList);
        slotOneList.unshift(defaultList[0]);
        slotTwoList.unshift(defaultList[1]);
        slotThreeList.unshift(defaultList[2]);
        this.setData({
          slotOneList,
          slotTwoList,
          slotThreeList
        })
      }
    },
    onStart() {
      this.machine.start()
    },
    numChage(e) {
      let num = e.target.dataset.num
      let value = e.detail.value;
      this.setSelect(num, value)
    },
    setSelect(line, value) {
      if (line == 1) {
        this.setData({
          num1: value
        })
      } else if (line == 2) {
        this.setData({
          num2: value
        })
      } else if (line == 3) {
        this.setData({
          num3: value
        })
      }
    },
    speedChange(e) {
      let speed = e.detail.value;
      this.setData({
        speed
      });
    },
    handleClickPrize() {
      const myPrizeUrl = "https://contents.ctrip.com/huodong/myprize/index?popup=close"
      goTargetUrl(myPrizeUrl)
    },
    initTrace() {
      let mPage = cwx.getCurrentPage()
      if (mPage) {
        this.mPage = mPage
      }
    },
    customerUbtTrace(args) {
      let pageId = this.mPage ? (this.mPage.pageid || this.mPage.pageId || '') : ''
      let openid = cwx.cwx_mkt.openid || ''
      console.warn({
        openid: openid,
          pageid: pageId,
          auth: cwx.user.auth,
          tempid: this.data.tempid,
          platform: 'miniProgram',
          ...args
      })
      this.mPage && this.mPage.ubtTrace && this.mPage.ubtTrace('o_mkt_task_slotmachine', {
          openid: openid,
          pageid: pageId,
          auth: cwx.user.auth,
          tempid: this.data.tempid,
          platform: 'miniProgram',
          ...args
      });
    },
  }

})

function scrollToTask() {
  wx.pageScrollTo({
    selector: '.assist-task-container'
  })
}

function setDefaultSlotList(list) {
  if (list.length < 3) {
    customerMessage.failLog({
      desc: "老虎机奖品配置需要不能少于三个"
    });
    return;
  }
  return list.reduce((arr, item, index) => {
    let obj = {
      id: index + 1,
      url: JSON.parse(item.extension).url,
      name: item.name,
      type: item.prizeType,
    };
    arr.push(obj);
    return arr;
  }, []);
};

function randomSlotList(list) {
  return shuffle(list);
};

// 洗牌算法
let shuffle = function (arr) {
  let ret = [...arr]
  // 得到一个在闭区间 [min, max] 内的随机整数
  const randInt = function (minNum, maxNum) {
    return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
  };
  const swap = (i, j) => {
    let t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
  }
  let n = arr.length;
  for (let i = 0; i < n; i++) {
    let rand = randInt(i, n - 1);
    // 交换 i rand 上的元素
    swap(i, rand);
  }
  return ret
}