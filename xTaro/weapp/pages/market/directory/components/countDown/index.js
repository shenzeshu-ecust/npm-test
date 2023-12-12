import { cwx } from "../../../../../cwx/cwx.js";
let timer, _this;

Component({
  properties: {
    diyBottom: {
      type: Number,
      default: 300
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    wxpopup: '',
    lineWidth: '0',
    timeCount: 0,
    timeTotal: 0
  },
  lifetimes: {
    attached: function() {
      
    },
    detached: function() {
      // 在组件实例被从页面节点树移除时执行
      if(this.data.timeCount < this.data.timeTotal) {
        timer && clearInterval(timer)
        this.setData({
          isFromTask: false
        })
        wx.setStorage({
          data: this.data.timeCount,
          key: 'wxpopupTimeCount',
        })
      }
    },
  },
  pageLifetimes: {
    show: function() {
      // 页面被展示
      _this=getCurrentPages()[getCurrentPages().length - 1] || {}
      const options = _this.options
      this.setData({
        wxpopup: options.wxpopup,
        timeTotal: options.times
      },()=>{
        setTimeout(()=>{
          this.init()
        }, 0)
      })
    },
    hide: function() {
      if(this.data.timeCount < this.data.timeTotal) {
        timer && clearInterval(timer)
        wx.setStorage({
          data: this.data.timeCount,
          key: 'wxpopupTimeCount',
        })
      }
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    init() {
      timer && clearInterval(timer)
      try {
        const value = wx.getStorageSync('wxpopupTimeCount')
        if (value) {
          // 继续上一次的倒计时
          this.setData({
            timeCount: value
          },() => {
            this.handleCountDown()
          })
        } else {
          // 从0开始
          this.handleCountDown()
        }
      } catch (e) {
        // 当作没看做，从0开始
        this.handleCountDown()
      }
    },
    handleCountDown() {
      timer = setInterval(()=>{
        if(this.data.timeCount == this.data.timeTotal) {
          clearInterval(timer)
          timer = null
        }
        const currentTimeLeft = ++this.data.timeCount
        if(currentTimeLeft > this.data.timeTotal) {
          wx.removeStorage({
            key: 'wxpopupTimeCount',
          })
          return
        }
        this.setData({
          timeCount: currentTimeLeft,
          lineWidth: parseInt(currentTimeLeft/this.data.timeTotal * 100)
        })
      },1000)
    },
    /***************************** utils *****************************/
    goTargetUrl() {
      if(this.data.timeCount < this.data.timeTotal) return
      cwx.navigateBack({
        delta: 1
      })
    }
  }
})