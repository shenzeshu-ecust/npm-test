/**
*startime 应该是毫秒数
*
*/

var Alarm = function (remainingTime, countFunc, endFunc) {
  this.time = remainingTime / 1000; //Math.floor((endtime - startime) / 1000); //距离截止期的剩余时间
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
      var minute, hour, day, second;

      day = Math.floor(self.time / 60 / 60 / 24);
      hour = day * 24 + Math.floor(self.time / 60 / 60 % 24) < 10 ? "0" + (day * 24 + Math.floor(self.time / 60 / 60 % 24)) : day * 24 + Math.floor(self.time / 60 / 60 % 24);
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