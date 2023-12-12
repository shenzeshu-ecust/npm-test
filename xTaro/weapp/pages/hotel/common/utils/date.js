import { _ } from '../../../../cwx/cwx.js';
// 兼容yymmdd格式
/**
 *
 * @param date: String, 所需要格式化的日期
 * @param needPrecise: Boolean, 是否需要精确到 时分秒
 * @returns {null|Date}
 */
function parse (date, needPrecise) {
    if (!date) return null;
    if (_.isString(date) && date.length >= 8) {
        if (date.includes('-')) {
            date = date.replace(/-/g, '/');
        } else {
            const per = {
                year: date.slice(0, 4),
                month: date.slice(4, 6),
                day: date.slice(6, 8),
                hour: date.slice(8, 10),
                minute: date.slice(10, 12),
                second: date.slice(12, 14)
            };
            const minuteTime = needPrecise && per.hour && per.minute && per.second ? ` ${per.hour}:${per.minute}:${per.second}` : '';
            date = per.year + '/' + per.month + '/' + per.day + minuteTime;
        }
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
function formatTime (format, sTime) {
    let _date = new Date();
    if (sTime) {
        _date = parse(sTime);
    }
    const o = {
        'M+': _date.getMonth() + 1, // month
        'd+': _date.getDate(), // day
        'h+': _date.getHours(), // hour
        'm+': _date.getMinutes(), // minute
        's+': _date.getSeconds(), // second
        'q+': Math.floor((_date.getMonth() + 3) / 3), // quarter
        S: _date.getMilliseconds() // millisecond
    };
    if (!format) {
        format = 'yyyy-MM-dd hh:mm:ss';
    }
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (_date.getFullYear() + '').substring(4 - RegExp.$1.length));
    }

    for (const k in o) {
        if (new RegExp('(' + k + ')').test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substring(('' + o[k]).length));
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
function TimeZoneDate (serverTime, clientTime, tzone) {
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
        if (typeof tzone === 'number') {
            this.tzone = tzone;
        }
        return this;
    },
    getNow: function () {
        const now = new Date();
        return new Date(this.serverTime.getTime() + (now - this.clientTime) + this.tzone * 1000);
    },
    simpleToday: function () {
        return formatTime('yyyy-M-d', this.getNow());
    },
    simpleTomorrow: function () {
        const d = this.getNow();
        const day = d.getDate();
        d.setDate(day + 1);
        return formatTime('yyyy-M-d', d);
    },
    today: function () {
        return formatTime('yyyy-MM-dd', this.getNow());
    },
    tomorrow: function () {
        const d = this.getNow();
        const day = d.getDate();
        d.setDate(day + 1);
        return formatTime('yyyy-MM-dd', d);
    },
    aftertomorrow: function () {
        const d = this.getNow();
        const day = d.getDate();
        d.setDate(day + 2);
        return formatTime('yyyy-MM-dd', d);
    },
    yesterday: function () {
        const d = this.getNow();
        const day = d.getDate();
        d.setDate(day - 1);
        return formatTime('yyyy-MM-dd', d);
    }
};

/**
 * 判断当前是否是凌晨
 * timeZoneDate.getNow() 返回的是当地时间,国内海外通用
 */
function checkIsMorning (timeZoneDate = {}) {
    if (!_.isFunction(timeZoneDate.getNow)) return false;

    const hours = timeZoneDate.getNow().getHours();
    if (hours >= 0 && hours < 6) {
        return true;
    }
    return false;
}
/**
 * 返回正确的入离
 * @returns {inday, outday}
 */
function correctInOutDay (timeZoneDate, inday, outday) {
    if (!timeZoneDate) return { inday, outday };

    const today = timeZoneDate.today();
    const tomorrow = timeZoneDate.tomorrow();
    const yesterday = timeZoneDate.yesterday();
    // 凌晨订单特殊处理
    const isMorning = checkIsMorning(timeZoneDate);
    const checkInDefault = isMorning ? yesterday : today;
    const checkOutDefault = isMorning ? today : tomorrow;

    const indayObj = parse(inday);
    const outdayObj = parse(outday);

    if (!indayObj || isNaN(indayObj.getTime()) || indayObj < parse(checkInDefault)) {
        inday = checkInDefault;
    }
    if (!outdayObj || isNaN(outdayObj.getTime()) || outdayObj < parse(checkOutDefault)) {
        outday = checkOutDefault;
    }
    if (parse(inday) > parse(outday)) {
        inday = checkInDefault;
        outday = checkOutDefault;
    }

    return { inday, outday };
}

export default {
    parse,

    simpleToday: function () {
        return this.formatTime('yyyy-M-d', new Date());
    },

    tomorrowMorning: function () {
        const d = new Date();
        const day = d.getDate();
        d.setDate(day + 1);
        return new Date(d.toLocaleDateString());
    },

    simpleTomorrow: function () {
        const d = new Date();
        const day = d.getDate();
        d.setDate(day + 1);
        return this.formatTime('yyyy-M-d', d);
    },

    today: function () {
        return this.formatTime('yyyy-MM-dd', new Date());
    },

    tomorrow: function () {
        const d = new Date();
        const day = d.getDate();
        d.setDate(day + 1);
        return this.formatTime('yyyy-MM-dd', d);
    },
    aftertomorrow: function () {
        const d = new Date();
        const day = d.getDate();
        d.setDate(day + 2);
        return this.formatTime('yyyy-MM-dd', d);
    },

    addDay: function (date, count) {
        const Ms = 86400000;
        let time = parse(date).getTime();
        time += Ms * count;
        const newDate = new Date(time);
        return this.formatTime('yyyy-MM-dd', newDate);// newDate.getFullYear() + "-"+ (newDate.getMonth()+1) + "-" + newDate.getDate();
    },
    calDays: function (inDay, outDay) {
        return Math.round((parse(outDay).getTime() - parse(inDay).getTime()) / 86400000);
    },
    getMonth: function (date) {
        return parse(date).getMonth() + 1;
    },
    getDay: function (date) {
        return parse(date).getDate();
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
    formatTime,

    dateStrToDate: function (dateStr) {
        try {
            dateStr = dateStr.split('-').join('/') + ' 00:00:00';
            return new Date(dateStr);
        } catch (e) {
            return null;
        }
    },
    Math: {
        /**
         * 获取扩展的位数
         */
        _getExt: function (x, y) {
            const extLengthX = (String(x || 0).split('.')[1] || '').length;
            const extLengthY = (String(y || 0).split('.')[1] || '').length;
            const extLength = Math.max(extLengthX, extLengthY);
            const ext = Math.pow(10, extLength);

            return ext;
        },
        plus: function (x, y) {
            const ext = this._getExt(x, y);
            x = this.multi(x, ext);
            y = this.multi(y, ext);

            return (x + y) / ext;
        },
        minus: function (x, y) {
            const ext = this._getExt(x, y);
            x = this.multi(x, ext);
            y = this.multi(y, ext);

            return (x - y) / ext;
        },
        multi: function (x, y) {
            const extLengthX = (String(x || 0).split('.')[1] || '').length;
            const extLengthY = (String(y || 0).split('.')[1] || '').length;
            const extLength = extLengthX + extLengthY;

            x = Number(String(x || 0).replace('.', ''));
            y = Number(String(y || 0).replace('.', ''));

            return (x * y) / Math.pow(10, extLength);
        },
        div: function (x, y) {
            const ext = this._getExt(x, y);
            x = this.multi(x, ext);
            y = this.multi(y, ext);

            return x / y;
        }
    },

    checkIsMorning,
    correctInOutDay,
    /**
     *  跨时区时间转换
     */
    TimeZoneDate
};
