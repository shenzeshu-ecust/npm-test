Date.prototype.addDays = function (value) {
    if (!value || isNaN(value)) value = 0;
    var newDate = new Date();
    newDate.setTime(this.getTime());
    newDate.setDate(this.getDate() + value);
    return newDate;
};
Date.prototype.format = function (fmt) {
    var o = {
        'M+': this.getMonth() + 1, //月份
        'd+': this.getDate(), //日
        'h+': this.getHours(), //小时
        'm+': this.getMinutes(), //分
        's+': this.getSeconds(), //秒
        'q+': Math.floor((this.getMonth() + 3) / 3), //季度
        S: this.getMilliseconds(), //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(
            RegExp.$1,
            (this.getFullYear() + '').substr(4 - RegExp.$1.length)
        );
    for (var k in o)
        if (new RegExp('(' + k + ')').test(fmt))
            fmt = fmt.replace(
                RegExp.$1,
                RegExp.$1.length == 1
                    ? o[k]
                    : ('00' + o[k]).substr(('' + o[k]).length)
            );
    return fmt;
};

Date.prototype.getDaySymbol = function () {
    var now = new Date();
    var daySymbol = '';
    if (this.getFullYear() === now.getFullYear()) {
        if (this.getMonth() === now.getMonth()) {
            if (this.getDate() === now.getDate()) {
                daySymbol = '今天';
            } else if (this.getDate() === now.addDays(1).getDate()) {
                daySymbol = '明天';
            } else if (this.getDate() === now.addDays(2).getDate()) {
                daySymbol = '后天';
            }
        }
    }
    return daySymbol;
};
Date.prototype.getDayDesc = function () {
    return this.getDaySymbol() || this.getWeek();
};

Date.prototype.getWeek = function () {
    const day = this.getDay();
    let week = '';
    switch (day) {
        case 0:
            week = '周日';
            break;
        case 1:
            week = '周一';
            break;
        case 2:
            week = '周二';
            break;
        case 3:
            week = '周三';
            break;
        case 4:
            week = '周四';
            break;
        case 5:
            week = '周五';
            break;
        case 6:
            week = '周六';
            break;
        default:
    }
    return week;
};

Date.prototype.getDayDesc = function () {
    return this.getDaySymbol() || this.getWeek();
};
Date.prototype.getWeek = function () {
    const day = this.getDay();
    let week = '';
    switch (day) {
        case 0:
            week = '周日';
            break;
        case 1:
            week = '周一';
            break;
        case 2:
            week = '周二';
            break;
        case 3:
            week = '周三';
            break;
        case 4:
            week = '周四';
            break;
        case 5:
            week = '周五';
            break;
        case 6:
            week = '周六';
            break;
        default:
    }
    return week;
};

let cDate = {
    parse: function (str, isNative) {
        if (typeof str === 'undefined') {
            return new Date();
        }
        if (typeof str === 'string') {
            str = str || '';
            var regtime = /^(\d{4})\-?(\d{1,2})\-?(\d{1,2})/i;
            if (str.match(regtime)) {
                str = str.replace(regtime, '$2/$3/$1');
            }
            var st = Date.parse(str);
            var t = new Date(st || new Date());
            return t;
        } else if (typeof str === 'number') {
            return new Date(str);
        } else {
            return new Date();
        }
    },
    formatCountDown: function (micro_second) {
        function PreFixInterge(num, n) {
            //num代表传入的数字，n代表要保留的字符的长度
            return (Array(n).join(0) + num).slice(-n);
        }
        // 秒数
        var second = Math.floor(micro_second / 1000);
        // 小时位
        var hour = Math.floor(second / 3600);
        var hr = PreFixInterge(hour, 2);
        // 分钟位
        var min = PreFixInterge(Math.floor((second - hr * 3600) / 60), 2);
        // 秒位
        var sec = PreFixInterge(second - hr * 3600 - min * 60, 2); // equal to => var sec = second % 60;
        if (hour > 0) {
            return hr + ':' + min + ':' + sec;
        } else {
            return min + ':' + sec;
        }
    },
};

export default cDate;
