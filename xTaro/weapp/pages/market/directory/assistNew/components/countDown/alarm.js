/**
*remainTime 应该是毫秒数
*
*/

var Alarm = function (opts, countFunc, endFunc) {
    this.options = {
      showDay: false,
      remainTime: 0,
      ...opts
    }
    this.time = this.options.remainTime / 1000; //Math.floor((endtime - startime) / 1000); //距离截止期的剩余时间
    this.countFunc = countFunc; //计时放方法
    this.endFunc = endFunc; //结束方法
    this.flag = "t" + Date.parse(new Date());
  };
  
  Alarm.prototype.start = function () {
    var self = this;
  
    self.flag = setInterval(function () {
      if (self.time < 0) {
        clearInterval(self.flag);
        self.endFunc();
      } else {
        let minute, hour, day, second;
        let t = self.options.showDay ? 0 : 24
  
        day = Math.floor(self.time / 60 / 60 / 24);
        hour = day * t + Math.floor(self.time / 60 / 60 % 24) < 10 ? "0" + (day * t + Math.floor(self.time / 60 / 60 % 24)) : day * t + Math.floor(self.time / 60 / 60 % 24);
        minute = Math.floor(self.time / 60 % 60) < 10 ? "0" + Math.floor(self.time / 60 % 60) : Math.floor(self.time / 60 % 60);
        second = Math.floor(self.time % 60) < 10 ? "0" + Math.floor(self.time % 60) : Math.floor(self.time % 60);
  
        self.countFunc(hour, minute, second,day);
        self.time--;
      }
    }, 1000);
  }
  
  Alarm.prototype.stop = function () {
    var self = this;
    clearInterval(self.flag);
    console.log("======clearInterval===========")
  }
  
  
  module.exports = Alarm;