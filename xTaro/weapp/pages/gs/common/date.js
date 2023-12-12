import {_} from '../../../cwx/cwx.js';

function simpleDate(date) {
  var m = date.getMonth() + 1;
  m = m < 10 ? '0' + m : m;
  return date.getFullYear() + '-' + m + '-' + date.getDate();
};

function parse(date) {
  if (_.isString(date)) {
    date = date.replace(/-/g, '/');
  }

  return new Date(date);
}

module.exports = {
  simpleDate: simpleDate,

  parse: parse,

  today: function () {
    return this.formatTime("yyyy-MM-dd", new Date());
    //return simpleDate(new Date());
  },

  tomorrow: function () {
    var d = new Date();
    var day = d.getDate();
    d.setDate(day + 1);
    return this.formatTime("yyyy-MM-dd", d);
    //return simpleDate(d);
  },
  aftertomorrow: function () {
    var d = new Date();
    var day = d.getDate();
    d.setDate(day + 2);
    return this.formatTime("yyyy-MM-dd", d);
    //return simpleDate(d);
  },
  addDay: function (date, count) {
    var Ms = 86400000;
    var time = parse(date).getTime();
    time += Ms * count;
    var newDate = new Date(time);
    return this.formatTime("yyyy-MM-dd", newDate);//newDate.getFullYear() + "-"+ (newDate.getMonth()+1) + "-" + newDate.getDate();
  },
  addMinutes: function (date, count) {
    return new Date(parse(date).getTime() + count * 60000);
  },
  toFormat: function (dateTime) {
    return this.formatTime('yyyy-MM-dd hh:mm:ss', dateTime);
  },
  calDays: function (inDay, outDay) {
    return (parse(outDay).getTime() - parse(inDay).getTime()) / 60 / 60 / 24 / 1000;
  },
  /**
   * 加减天数
   * @param date Date类型
   * @param count 具体的天数
   * @return {Date} 一个Date类型
   */
  dateAddDay: function (date, count) {
    var Ms = 86400000, time = date.getTime();
    time += Ms * count;
    return new Date(time);
  },
  /**
  * >> ('yy-MM-dd hh:mm:ss')
  * => "2013-12-04 10:49:25"
  * >> ('yy-MM-dd hh:mm', '2013-12-23 18:33:22')
  * => "13-12-23 18:33"
  * >> ('M-d', '2014-03-10')
  * => "3-10"
  * 注意M需要大写，其它字母小写
  */
  formatTime: function (format, sTime) {
    var _date = new Date();
    if (!!sTime) {
      _date = parse(sTime);
    }
    var o = {
      "M+": _date.getMonth() + 1, //month
      "d+": _date.getDate(), //day
      "h+": _date.getHours(), //hour
      "m+": _date.getMinutes(), //minute
      "s+": _date.getSeconds(), //second
      "q+": Math.floor((_date.getMonth() + 3) / 3), //quarter
      "S": _date.getMilliseconds() //millisecond
    };
    if (!format) {
      format = "yyyy-MM-dd hh:mm:ss";
    }
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (_date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(format))
        format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    return format;
  },

  dateStrToDate: function (dateStr) {
    dateStr = dateStr.split('-').join('/') + ' 00:00:00';
    return new Date(dateStr);
  },
  Math: {
    /**
    * 获取扩展的位数
    */
    _getExt: function (x, y) {
      var extLengthX = (String(x || 0).split('.')[1] || '').length;
      var extLengthY = (String(y || 0).split('.')[1] || '').length;
      var extLength = Math.max(extLengthX, extLengthY);
      var ext = Math.pow(10, extLength);

      return ext;
    },
    plus: function (x, y) {
      var ext = this._getExt(x, y);
      x = this.multi(x, ext);
      y = this.multi(y, ext);

      return (x + y) / ext;
    },
    minus: function (x, y) {
      var ext = this._getExt(x, y);
      x = this.multi(x, ext);
      y = this.multi(y, ext);

      return (x - y) / ext;
    },
    multi: function (x, y) {
      var extLengthX = (String(x || 0).split('.')[1] || '').length;
      var extLengthY = (String(y || 0).split('.')[1] || '').length;
      var extLength = extLengthX + extLengthY;

      x = Number(String(x || 0).replace('.', ''));
      y = Number(String(y || 0).replace('.', ''));

      return (x * y) / Math.pow(10, extLength);
    },
    div: function (x, y) {
      var ext = this._getExt(x, y);
      x = this.multi(x, ext);
      y = this.multi(y, ext);

      return x / y;
    }
  }
}
