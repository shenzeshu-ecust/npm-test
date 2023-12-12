String.parseToArray || (String.prototype.parseToArray = function (bit, s) {
  if (bit === void 0) {
    bit = 0;
  }
  if (s === void 0) {
    s = '|';
  }
  var ret = this.split(s);
  return bit ? function (l) {
    for (; l--;) {
      ret[l] = parseInt(ret[l], bit);
    }
    return ret;
  }(ret.length) : ret;
});
String.trim || (String.prototype.trim = function () {
  var str = this,
    str = str.replace(/^\s\s*/, ''),
    ws = /\s/,
    i = str.length;
  while (ws.test(str.charAt(--i))) {}
  return str.slice(0, i + 1);
});
String.replaceTpl || (String.prototype.replaceTpl = function (o) {
  return this.replace(/#\{([^}]*)\}/gm, function (v, k) {
    console.log(v);
    return v = o[k.trim()];
  });
});
Date.addMinutes || (Date.prototype.addMinutes = function (value) {
  return this.addMilliseconds(value * 60000);
});
Date.addMilliseconds || (Date.prototype.addMilliseconds = function (value) {
  this.setMilliseconds(this.getMilliseconds() + value * 1);
  return this;
});
var gdateconf, GDate;
gdateconf || (gdateconf = {}), GDate || (GDate = {});
var map = gdateconf.date = {
    days: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    feast: {
      '1-1': '元旦节',
      '2-14': '情人节',
      '3-5': '雷锋日',
      '3-8': '妇女节',
      '3-12': '植树节',
      '3-15': '消费日',
      '4-1': '愚人节',
      '5-1': '劳动节',
      '5-4': '青年节',
      '6-1': '儿童节',
      '7-1': '建党节',
      '8-1': '建军节',
      '9-10': '教师节',
      '10-1': '国庆节',
      '12-24': '平安夜',
      '12-25': '圣诞节'
    },
    lunar: {
      tpl: '#{y}-#{m}-#{d} 星期#{W} 农历 #{CM}#{CD} #{gy}(#{sx}) #{gm} #{gd} #{so} #{cf} #{gf}',
      leap: 'ezc|esg|wog|gr9|15k0|16xc|1yl0|h40|ukw|gya|esg|wqe|wk0|15jk|2k45|zsw|16e8|yaq|tkg|1t2v|ei8|wj4|zp1|l00|lkw|2ces|8kg|tio|gdu|ei8|k12|1600|1aa8|lud|hxs|8kg|257n|t0g|2i8n|13rk|1600|2ld2|ztc|h40|2bas|7gw|t00|15ma|xg0|ztj|lgg|ztc|1v11|fc0|wr4|1sab|gcw|xig|1a34|l28|yhy|xu8|ew0|xr8|wog|g9s|1bvn|16xc|i1j|h40|tsg|fdh|es0|wk0|161g|15jk|1654|zsw|zvk|284m|tkg|ek0|xh0|wj4|z96|l00|lkw|yme|xuo|tio|et1|ei8|jw0|n1f|1aa8|l7c|gxs|xuo|tsl|t0g|13s0|16xg|1600|174g|n6a|h40|xx3|7gw|t00|141h|xg0|zog|10v8|y8g|gyh|exs|wq8|1unq|gc0|xf4|nys|l28|y8g|i1e|ew0|wyu|wkg|15k0|1aat|1640|hwg|nfn|tsg|ezb|es0|wk0|2jsm|15jk|163k|17ph|zvk|h5c|gxe|ek0|won|wj4|xn4|2dsl|lk0|yao'.parseToArray(36),
      jqmap: '0|gd4|wrn|1d98|1tuh|2akm|2rfn|38g9|3plp|46vz|4o9k|55px|5n73|64o5|6m37|73fd|7kna|81qe|8io7|8zgq|9g4b|9wnk|ad3g|ath2|'.parseToArray(36),
      jqnames: '小寒|大寒|立春|雨水|惊蛰|春分|清明|谷雨|立夏|小满|芒种|夏至|小暑|大暑|立秋|处暑|白露|秋分|寒露|霜降|立冬|小雪|大雪|冬至'.parseToArray(),
      c1: '|一|二|三|四|五|六|七|八|九|十'.parseToArray(),
      c2: '初|十|廿|卅|'.parseToArray(),
      wk: '日一二三四五六',
      tg: '甲乙丙丁戊己庚辛壬癸',
      dz: '子丑寅卯辰巳午未申酉戌亥',
      sx: '鼠牛虎兔龙蛇马羊猴鸡狗猪',
      feast: {
        '1-1': '春节',
        '1-15': '元宵节',
        '5-5': '端午节',
        '8-15': '中秋节',
        '9-9': '重阳节',
        '12-8': '腊八节'
      },
      fixDate: ['2018-1-1~2018-1-16=0|-1|0', '2018-1-16~2018-2-15=0|-1|0']
    }
  },
  _ = {
    isDate: function (date) {
      return date instanceof Date;
    },
    getDate: function (date) {
      !_.isDate(date) && (date = new Date());
      return {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate()
      };
    },
    format: function (pattern, date) {
      date = date || new Date();
      pattern = pattern || 'yyyy-MM-dd';
      var li;
      var d = _.getDate(date);
      var o = {
        M: d.m,
        d: d.d,
        h: date.getHours(),
        m: date.getMinutes(),
        s: date.getSeconds()
      };
      for (var k in o) {
        li = o[k];
        pattern = pattern.replace(new RegExp('(' + k + '+)', 'g'), function (_a, b) {
          return li < 10 && b.length > 1 ? '0' + li : li;
        });
      }
      return pattern.replace(/(y+)/gi, function (_a, b) {
        return (d.y + '').substr(4 - Math.min(4, b.length));
      });
    },
    getDaysByLunarMonth: function (y, m) {
      return map.lunar.leap[y - 1900] & 0x10000 >> m ? 30 : 29;
    },
    getLeapMonth: function (y) {
      return map.lunar.leap[y - 1900] & 0xf;
    },
    getLeapDays: function (y) {
      return _.getLeapMonth(y) ? map.lunar.leap[y - 1900] & 0x10000 ? 30 : 29 : 0;
    },
    getDaysByMonth: function (y, m) {
      return new Date(y, m, 0).getDate();
    },
    getDaysByYear: function (y) {
      for (var i = 0x8000, sum = 348; i > 0x8; i >>= 1) {
        sum += map.lunar.leap[y - 1900] & i ? 1 : 0;
      }
      return sum + _.getLeapDays(y);
    },
    getDateBySolar: function (y, n) {
      var d = new Date(31556925974.7 * (y - 1900) + map.lunar.jqmap[n] * 60000 + Date.UTC(1900, 0, 6, 2, 5));
      return {
        m: d.getUTCMonth() + 1,
        d: d.getUTCDate()
      };
    },
    getFeast: function (m, d, type, y, date) {
      var name = (type ? map.lunar.feast : map.feast)[m + '-' + d] || '';
      if (type && y && m >= 12 && _.getDaysByLunarMonth(y, m) == d) {
        var nextDay = new Date(date[0] + '-' + date[1] + '-' + date[2]).addMinutes(24 * 60);
        var nextLunar = _.toLunar(nextDay.getFullYear(), nextDay.getMonth() + 1, nextDay.getDate());
        if (nextLunar.cd == 1 && nextLunar.cm == 1) {
          name = '除夕';
        }
      }
      return name;
    },
    getSolar: function (y, m, d) {
      var solarNames = map.lunar.jqnames;
      var l = solarNames.length;
      var solarName;
      while (l--) {
        solarName = _.getDateBySolar(y, l);
        if (solarName.m == m && solarName.d == d) {
          return solarNames[l];
        }
      }
      return '';
    },
    cyclical: function (n) {
      return map.lunar.tg.charAt(n % 10) + map.lunar.dz.charAt(n % 12);
    },
    fixResult: function (data, Y, M, D, y, m, d) {
      if (data && data.length) {
        var l = data.length,
          val = void 0,
          li = void 0;
        var _match = function (y1, m1, d1, str, pre, suf) {
          if (pre === void 0) {
            pre = [];
          }
          if (suf === void 0) {
            suf = [];
          }
          str = str.split('~');
          str[1] = str[1] || str[0];
          pre = str[0].split('-');
          suf = str[1].split('-');
          return new Date(y1, m1, d1) >= new Date(pre[0], pre[1], pre[2]) && new Date(y1, m1, d1) <= new Date(suf[0], suf[1], suf[2]);
        };
        while (l--) {
          li = data[l].split('=');
          val = li[1].split('|');
          _match(Y, M, D, li[0]) && (y = y + ~~val[0], m = m + ~~val[1], d = d + ~~val[2]);
        }
      }
      return {
        y: ~~y,
        m: ~~m,
        d: ~~d
      };
    },
    toLunar: function (Y, M, D) {
      var m = 1900,
        n = 0,
        d = (+new Date(Y, M - 1, D) - +new Date(1900, 0, 31)) / 86400000,
        isleap = false,
        _y;
      var leap = _.getLeapMonth(Y);
      for (; m < 2050 && d > 0; m++) {
        n = _.getDaysByYear(m);
        d -= n;
      }
      if (d < 0) {
        ;
        d += n, m--;
      }
      _y = m;
      for (m = 1; m < 13 && d > 0; m++) {
        if (leap > 0 && m == leap + 1 && isleap === false) {
          --m;
          isleap = true;
          n = _.getLeapDays(_y);
        } else {
          n = _.getDaysByLunarMonth(_y, m);
        }
        if (isleap == true && m == leap + 1) {
          isleap = false;
        }
        d -= n;
      }
      if (d == 0 && leap > 0 && m == leap + 1 && !isleap) {
        --m;
      }
      if (d < 0) {
        d += n;
        --m;
      }
      if (d == 0) {
        isleap = m == leap;
      }
      d = d + 1;
      var _fixDate = _.fixResult(map.lunar.fixDate, Y, M, D, Y - (M < m ? 1 : 0), m, d);
      return {
        cy: _fixDate.y,
        cm: _fixDate.m,
        cd: _fixDate.d,
        CM: (isleap ? '闰' : '') + ((_fixDate.m > 9 ? '十' : '') + map.lunar.c1[_fixDate.m % 10]).replace('十二', '腊').replace(/^一/, '正') + '月',
        CD: {
          '10': '初十',
          '20': '二十',
          '30': '三十'
        }[_fixDate.d] || map.lunar.c2[Math.floor(_fixDate.d / 10)] + map.lunar.c1[~~_fixDate.d % 10],
        isleap: isleap
      };
    },
    formatLunar: function (y, m, d) {
      var lunar = _.toLunar(y, m, d);
      var w = new Date(y, m - 1, d).getDay();
      return {
        y: y,
        m: m,
        d: d,
        w: w,
        W: map.lunar.wk.charAt(w),
        cf: _.getFeast(lunar.cm, lunar.cd, 1, lunar.cy, arguments),
        gf: _.getFeast(m, d, null, null, arguments),
        isleap: lunar.isleap
      };
    }
  };
GDate.date = _;
export default GDate;