import {
  Bullet
} from './utils'

const DURATION = 7
const HEIGHT = 40

Component({
  options:{
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    isLoop: {
      type: Boolean,
      value: true
    },
    intervalTime: {
      type: Number,
      value: 2000 // 计时器 ms
    },
    lanes: {
      type: Array,
      value: [
        {
          duration: DURATION,
          height: HEIGHT
        }
      ]
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    bulletsLanes: [],
    pause: false
  },

  lifetimes: {
    attached: function () { 
      this.countIndex = 0 // 推送如弹道的序列
      this.storeList = [] // 弹幕存储,以便循环发送
      this.LaneShootingIndex = 0 // 正在发射弹幕的弹道序列
      this.init()
    },
    detached: function() {
      this.close()
    }
  },

  pageLifetimes: {
    // show: function() {
    //   // 页面被展示
    //   console.log('弹幕page show')
    //   this.toggle(true)
    // },
    // hide: function() {
    //   console.log('弹幕page hide')
    //   this.toggle(false)
    // }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    init() {
      const {
        lanes,
      } = this.data

      let bulletsLanes = [...lanes]
      bulletsLanes.forEach((item) => {
        item.duration = item.duration || DURATION
        item.height = item.height || HEIGHT
        item.bullets = []
      })
      this.setData({
        bulletsLanes
      })
    },
    start() {
      if (this.timer) return

      this.timer = setInterval(() => {
        if (this._needAddData()) {
          this.addData(this.storeList)
          this.storeList = []
        }
        this._animationMove()
        this._updateLanes()
      }, this.data.intervalTime)
    },
    close() {
      clearInterval(this.timer)
      this.timer = null
    },
    addData(data) {
      const {
        bulletsLanes
      } = this.data
      if (bulletsLanes.length == 0) return 
      
      const genDataList = data.map(item => {
        return new Bullet({
          ...item
        })
      })
      genDataList.forEach(item => {
        this._pushToLane([item], bulletsLanes)
      })
      this.setData({
        bulletsLanes
      })
    },
    _animationMove() {
      const { bulletsLanes } = this.data
      const { lanes } = this.data
      this.LaneShootingIndex = (++this.LaneShootingIndex) % lanes.length
      let bullets = bulletsLanes[this.LaneShootingIndex].bullets
      for (let n = 0; n < bullets.length; n++) {
        if (!bullets[n].moving) {
          bullets[n].moving = true
          break;
        }
      }
      // for (let m = 0; m < bulletsLanes.length; m++) {
      //   let bullets = bulletsLanes[m].bullets
      //   for (let n = 0; n < bullets.length; n++) {
      //     if (!bullets[n].moving) {
      //       bullets[n].moving = true
      //       break;
      //     }
      //   }
      // }
      this.setData({
        bulletsLanes
      })
    },
    /**
     * 
     * @param {array} source  
     * @param {array} target
     * 将sourcepush到不同的赛道中 
     */
    _pushToLane(source, target) {
      const {
        lanes
      } = this.data
      const i = this.countIndex % lanes.length
      target[i].bullets.push(...source)
      this.countIndex++
    },
    toggle(toMove) {
      console.log('弹幕是否移动', toMove)
      this.setData({
        pause: !toMove
      })
      if (toMove) {
        this.start()
      } else {
        this.close()
      }
    },
    _onAnimationend(e) {
      const data = e.currentTarget.dataset
      const { lane, bulletId } = data
      const { bulletsLanes } = this.data
      bulletsLanes[lane].bullets.forEach(item => {
        if (item.id == bulletId) {
          item.isPass = true
        }
      })
      this.setData({
        bulletsLanes
      })
    },
    // 更新lanes中的bullets,移除掉已经结束的
    _updateLanes() {
      const { bulletsLanes } = this.data
      for (let m = 0; m < bulletsLanes.length; m++) {
        let lane = bulletsLanes[m]
        for (let i = lane.bullets.length - 1; i >= 0; i--) {
          if (lane.bullets[i].isPass) {
            let [deleteItem] = lane.bullets.splice(i, 1)
            deleteItem.moving = false
            deleteItem.isPass = false
            this.storeList.push(deleteItem)
          }
        }
      }
      this.setData({
        bulletsLanes
      })
    },
    _needAddData() {
      const { bulletsLanes, isLoop } = this.data
      return isLoop && bulletsLanes.some((item) => item.bullets.length < 5)
    }
  }
})