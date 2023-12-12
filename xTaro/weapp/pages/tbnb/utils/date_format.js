Date.prototype.addDays = function (n) {
  this.setTime(this.getTime() + Number(n) * 24 * 60 * 60 * 1000);
  return this;
};
function dateFormat(date, fmt) {
  var o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
    }
  }
  return fmt;
}
function getDays(year, month) {
  var d = new Date();
  var m = month + 1 || d.getMonth() + 1;
  if (m === 2) {
    return year % 4 === 0 ? 29 : 28;
  } else if (m === 1 || m === 3 || m === 5 || m === 7 || m === 8 || m === 10 || m === 12) {
    return 31;
  } else {
    return 30;
  }
}
export default {
  dateFormat: dateFormat,
  getDays: getDays
};