const Alarm = require('./alarm');

Component({
  options:{
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    remainTime: {
      type: Number,
      value: 0
    },
    showDay: {
      type: Boolean,
      value: false
    } 
  },

  /**
   * 组件的初始数据
   */
   data: {
    remainTimer: null,
  },

  observers: {
    'remainTime': function(remainTime) {
      if(remainTime == 0) {
        return
      }
      this.setTimer(remainTime)
    }
  },

  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () { 
    },
    moved: function () { },
    detached: function () { 
      this.timer && this.timer.stop();
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    setTimer(remainTime) {
      this.timer && this.timer.stop();
      this.timer = new Alarm({ remainTime, showDay: this.data.showDay }, (hour, minute, second, day)=> {
        this.setData({ remainTimer: {day,hour,minute,second} });
      }, ()=> {
        this.triggerEvent('timeup')
      });
      this.timer.start();
    }
  }
})
