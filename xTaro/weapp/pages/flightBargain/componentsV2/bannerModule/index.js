import { FetchStatus } from '../../common/constants.js'

Component({

  properties: {
    pageStatus: {
      type: Number,
      value: FetchStatus.Loading
    },
    orderStatus: Number,
    banner: String,
    startTime: {
      type: String,
      value: '',
      observer: function(newVal, oldVal, changedPath) {
        // 监听数据是否有传进来
        if (changedPath == 'startTime' && newVal) {
          this._getOrderStatus()
        }
      }
    },
    duration: Number
  },

  data: {
    timer: null,
    hours: '--',
    minutes: '--',
    seconds: '--'
  },

  methods: {
    _getOrderStatus() {
      if (this.data.orderStatus === 2) {
        const { startTime, duration } = this.data,
          sTime = startTime.split('-').join('/'),
          currentTimestamp = new Date().getTime(),
          startTimestamp = new Date(sTime).getTime(),
          passedTime = Math.abs(currentTimestamp - startTimestamp),
          durationTime = duration * 60 * 60 * 1000,
          remainTime = durationTime - passedTime
        if (remainTime >= 0) {
          this._countDown(remainTime)
        } else {
          clearInterval(this.data.timer)
          this.data.timer = null
          this.setData({ hours: '00', minutes: '00', seconds: '00' })
        }
      } else {
        clearInterval(this.data.timer)
        this.data.timer = null
        this.setData({ hours: '00', minutes: '00', seconds: '00' })
      }
    },
    // 倒计时
    _countDown(remainTime) {
      this.setData({
        timer: setInterval(() => {
          this._formatCountDown(remainTime)
          remainTime -= 1000
          if (remainTime <= 0) {
            clearInterval(this.data.timer)
            this.data.timer = null
          }
        }, 1000)
      })
    },
    _formatCountDown(time) {
      const hr = Math.floor((time / (1000 * 60 * 60)) % 24),
        min = Math.floor((time / 1000 / 60) % 60),
        sec = Math.floor((time / 1000) % 60)

      this.setData({
        hours: this._checkTime(hr),
        minutes: this._checkTime(min),
        seconds: this._checkTime(sec)
      })
    },
    _checkTime(i) { // 将0-9的数字前面加上0，例1变为01
      if (i < 10) {
        i = '0' + i
      }

      return i
    }
  }

})
