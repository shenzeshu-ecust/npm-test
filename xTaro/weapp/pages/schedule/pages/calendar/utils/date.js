import { _ } from '../../../../../cwx/cwx.js';

function parse(date) {
  if (_.isString(date)) {
    date = date.replace(/-/g, '/');
  }

  return new Date(date);
}

/**
 * >> ('yy-MM-dd hh:mm:ss')
 * => "2013-12-04 10:49:25"
 * >> ('yy-MM-dd hh:mm', '2013-12-23 18:33:22')
 * => "13-12-23 18:33"
 * >> ('M-d', '2014-03-10')
 * => "3-10"
 * 注意M需要大写，其它字母小写
 */
 function formatTime(format, sTime) {
    let _date = new Date();
    if (!!sTime) {
        _date = parse(sTime);
    }
    const o = {
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
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (_date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    for (let k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
}

/**
 * 跨时区Date
 * @param serverTime 页面加载时的服务器时间(beijing)
 * @param clientTime 服务器时间对应的本地时间
 * @param tzone 相对于北京+0800的时区偏移量
 * @constructor
 */
function TimeZoneDate(serverTime, clientTime, tzone) {
    const now = new Date();

    this.serverTime = serverTime || now;
    this.clientTime = clientTime || now;
    this.tzone = tzone || 0;
}

TimeZoneDate.create = function (serverTime, clientTime, tzone) {
    return new TimeZoneDate(serverTime, clientTime, tzone);
};

TimeZoneDate.prototype = {
    constructor: TimeZoneDate,

    setZone: function (tzone) {
      if(typeof tzone === 'number'){
          this.tzone = tzone;
      }
      return this;
    },
    getNow: function () {
        const now = new Date();
        return new Date(this.serverTime.getTime() + (now - this.clientTime) + this.tzone * 1000);
    },
    simpleToday: function () {
        return formatTime("yyyy-M-d", this.getNow());
    },
    simpleTomorrow: function () {
        let d = this.getNow();
        const day = d.getDate();
        d.setDate(day + 1);
        return formatTime("yyyy-M-d", d);
    },
    today: function () {
        return formatTime("yyyy-MM-dd", this.getNow());
    },
    tomorrow: function () {
        const d = this.getNow();
        const day = d.getDate();
        d.setDate(day + 1);
        return formatTime("yyyy-MM-dd", d);
    },
    aftertomorrow: function () {
        const d = this.getNow();
        const day = d.getDate();
        d.setDate(day + 2);
        return formatTime("yyyy-MM-dd", d);
    }
};


module.exports = {
    parse: parse,

    simpleToday: function () {
        return this.formatTime("yyyy-M-d", new Date());
    },

    simpleTomorrow: function () {
        let d = new Date();
        const day = d.getDate();
        d.setDate(day + 1);
        return this.formatTime("yyyy-M-d", d);
    },

    today: function () {
        return this.formatTime("yyyy-MM-dd", new Date());
    },

    tomorrow: function () {
        const d = new Date();
        const day = d.getDate();
        d.setDate(day + 1);
        return this.formatTime("yyyy-MM-dd", d);
    },
    aftertomorrow: function () {
        const d = new Date();
        const day = d.getDate();
        d.setDate(day + 2);
        return this.formatTime("yyyy-MM-dd", d);
    },


    addDay: function (date, count) {
        const Ms = 86400000;
        let time = parse(date).getTime();
        time += Ms * count;
        const newDate = new Date(time);
        return this.formatTime("yyyy-MM-dd", newDate);//newDate.getFullYear() + "-"+ (newDate.getMonth()+1) + "-" + newDate.getDate();
    },
    calDays: function (inDay, outDay) {
        return (parse(outDay).getTime() - parse(inDay).getTime()) / 60 / 60 / 24 / 1000;
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
    formatTime: formatTime,

    dateStrToDate: function (dateStr) {
        try {
            dateStr = dateStr.split('-').join('/') + ' 00:00:00';
            return new Date(dateStr);
        } catch (e){
            return null;
        }
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
    },

    /**
     *  跨时区时间转换
     */
    TimeZoneDate: TimeZoneDate
};
