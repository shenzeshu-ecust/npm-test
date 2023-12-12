/** 离子封装 时间定时器，可插拔，放在组件里，到期or不用后自动GC回收，不要放在Page里 */
export default Behavior({
  behaviors: [],
  properties: {
    time: {
      type: Number,
      value: 0,
      observer: function (newVal, oldVal) {
        console.log('observer time:', newVal, oldVal)
        if(newVal){
          this.setData({
            endTime: new Date().getTime() + newVal * 1000 + 10,
            lineEnd: false
          })
          this.getLatestTime();
        }
      }
    },
    isZeroPadd: {
      type: Boolean,
      value: true,
    },
    isClearInterval: {
      type: Boolean,
      value: true
    }
  },
  data: {
    date: '',
    endTime: '',
    lineEnd: false
  },
  timer: null,
  ready: function () {
    this.getLatestTime();
  },

  detached: function () {
    if (this.data.isClearInterval) {
      clearInterval(this.timer);
    }
  },

  pageLifetimes: {
    hide() {
      // 特别重要，一定要交给组件自动回收，而不是交给page，否则无法自动交给GC回收
      if (this.data.isClearInterval) {
        clearInterval(this.timer);
      }

    },
    show() {
      if (this.data.isClearInterval) {
        this.getLatestTime();
      }
    }
  },

  methods: {
    // 自动补零
    zeroPadding(num) {
      num = num.toString();
      return num[1] ? num : '0' + num;
    },

    init() {
      clearInterval(this.timer);
      this.getLatestTime.call(this);
    },

    getLatestTime() {
      const {
        endTime
      } = this.data
      const time = endTime - new Date().getTime()

      setTime.call(this)
      clearTimeout(this.timer)
      if (time <= 0) {
          this._getTimeValue(0);
          clearTimeout(this.timer)
          this.CountdownEnd();
          return;
      }

      this.timer = setTimeout(() => {
          setTime.call(this)
          this.getLatestTime();
      }, 1000);
      
      function setTime(){
          const dateString = this._getTimeValue(time);
          // console.log('getLatestTime', dateString);
          this.setData({
              date: dateString
          });
      }

    },

    _getTimeValue: function(time){
      return this.formatTime(time/1000)
    },

    formatTime: function (time) {
      const format = n => this.zeroPadding(Math.floor(n))
      const second = format(time % 60)
      const minute = format(time / 60 % 60)
      const hour = format(time / 3600)
      return `${hour}:${minute}:${second}`
    },

    CountdownEnd() {
      this.setData({
        lineEnd: true
      })
      if(this.data.time>0){
        this.triggerEvent('lineEnd', {});
      }
    },
  }
});
