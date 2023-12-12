import { cwx, CPage } from '../../../../cwx/cwx.js';

const dateUtil = require('./utils/date.js');
const util = require('./utils/util.js');

const DEFAULT_MONTH = 5;//最多显示12个月数据
const INITIAL_MONTHS = 2;//初始3个月的数据
const LANG = {
  "TITLE": "选择日期",
  "YEAR_POSTFIX": "年",
  "MONTH_NAMES": ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
  "YEAR_MONTH_SEPERATOR": "",
  "DAY_NAMES": ["日", "一", "二", "三", "四", "五", "六"],
};

const HOLIDAYS = [
  ['2017-12-25', '圣诞节'],
  ['2018-1-1', '元旦'],
  ['2018-2-14', '情人节'],
  ['2018-2-15', '除夕'],
  ['2018-2-16', '春节'],
  ['2018-3-2', '元宵节'],
  ['2018-4-5', '清明'],
  ['2018-5-1', '劳动节'],
  ['2018-6-1', '儿童节'],
  ['2018-6-18', '端午节'],
  ['2018-9-10', '教师节'],
  ['2018-9-24', '中秋节'],
  ['2018-10-1', '国庆节'],
  ['2018-12-25', '圣诞节']

];

const EXTRA_RESTDAYS = [
  '2017-12-30',
  '2017-12-31',
  '2018-1-1',
  '2018-2-15',
  '2018-2-16',
  '2018-2-17',
  '2018-2-18',
  '2018-2-19',
  '2018-2-20',
  '2018-2-21',
  '2018-4-5',
  '2018-4-6',
  '2018-4-7',
  '2018-4-29',
  '2018-4-30',
  '2018-5-1',
  '2018-6-16',
  '2018-6-17',
  '2018-6-18',
  '2018-9-22',
  '2018-9-23',
  '2018-9-24',
  '2018-10-1',
  '2018-10-2',
  '2018-10-3',
  '2018-10-4',
  '2018-10-5',
  '2018-10-6',
  '2018-10-7',
];

const EXTRA_WORKDAYS = [
  '2018-2-11',
  '2018-2-24',
  '2018-4-8',
  '2018-4-28',
  '2018-9-29',
  '2018-9-30'
];

const rDateStr = /-/g;


function _stringToDate(str) {
  if (!str) return null;
  return new Date(str.replace(rDateStr, "/"));
}

function _getDateValue(year, month, date) {
  return [year, month + 1, date].join('-');
}

//tczhu 新增一个选中日期判断
function _getMonthDates(year, month, inDay, outDay, beginDate, endDate, opt, isSingleSelect) {
  var someday = new Date(year, month, 1);
  var pushDate = function (d) {
    var outOfRange = false, dateValue = _getDateValue(year, month, d);

    /*
        处理不在范围内的日期
    */
    if (_since) {
      if (year < _since.year) outOfRange = true;
      if (year === _since.year && month < _since.month) outOfRange = true;
      if (year === _since.year && month === _since.month && d < _since.date) outOfRange = true;
    }

    if (beginDate) {
      var dateSplits = beginDate.split("-");
      var beginYear = parseInt(dateSplits[0]);
      var beginMonth = parseInt(dateSplits[1]) - 1; //月份是从0开始的
      var beginDay = parseInt(dateSplits[2]);
      if (year < beginYear) outOfRange = true;
      if (year === beginYear && month < beginMonth) outOfRange = true;
      if (year === beginYear && month === beginMonth && d < beginDay) outOfRange = true;
    }
    if (endDate) {
      var dateSplits = endDate.split("-");
      var endYear = parseInt(dateSplits[0]);
      var endMonth = parseInt(dateSplits[1]) - 1;
      var endDay = parseInt(dateSplits[2]);
      if (year > endYear) outOfRange = true;
      if (year === endYear && month > endMonth) outOfRange = true;
      if (year === endYear && month === endMonth && d > endDay) outOfRange = true;
    }

    var holiday = false;
    HOLIDAYS.forEach(function (item) {
      if (item[0] === dateValue) holiday = item[1];
    });

    var info = outOfRange || !opt || !opt[dateValue] ? false : opt[dateValue];
    if (!outOfRange && info.disable) {
      outOfRange = info.disable
    }

    if (dateValue === inDay) {
      info = { title: isSingleSelect ? '':'入住' }
    } else if (dateValue === outDay) {
      info = { title: isSingleSelect ? '' :'离店' };
    } else {
      info = {};
    }

    dates.push({
      choose: (dateValue === inDay || dateValue === outDay),
      inDay: inDay && dateValue === inDay,
      outDay: outDay && dateValue === outDay,
      stay: _isStayDay(inDay, outDay, dateValue),
      value: dateValue,
      date: d,
      outOfRange: outOfRange,
      today: (dateValue === _todayValue),
      tomorrow: (dateValue === _tomorrowValue),
      holiday: holiday,
      workday: (EXTRA_WORKDAYS.indexOf(dateValue) >= 0),
      restday: (EXTRA_RESTDAYS.indexOf(dateValue) >= 0),
      info: info //获取额外的信息
    })
  };

  var dates = [];
  var day = someday.getDay();
  for (var i = 0; i < day; i++) {
    dates.push({
      date: null
    });
  }

  var d = 1;
  for (; d < 28; d++) {
    pushDate(d);
  }

  while (someday.getMonth() == month) {
    pushDate(d);
    someday.setDate(++d);
  }
  return dates;
}

//是否为居住期
function _isStayDay(inDay, outDay, day) {
  if (!inDay || !outDay) {
    return false;
  }

  const inDayObj = inDay != null ? new Date(inDay.replace(rDateStr, '/')) : null;
  const outDayObj = outDay != null ? new Date(outDay.replace(rDateStr, '/')) : null;
  const dayObj = new Date(day.replace(rDateStr, '/'));

  return dayObj > inDayObj && dayObj < outDayObj;
}

var _today = new Date();
var _year = 1900 + _today.getYear();
var _month = _today.getMonth();
var _date = _today.getDate();
var _todayValue = _getDateValue(_year, _month, _date);
var _tomorrowValue = dateUtil.simpleTomorrow();


var _since = {
  year: _year,
  month: _month,
  date: _date
};

/*
  inDay:入住日期
  outDay:离店日期
	// choosenDate:选中的日期,格式为2016-10-15
	beginDate:开始日期
	endDate:结束日期，
  cancelActionCode:'',
  confirmActionCode:'',
  chooseDateActionCode:'',
	info:{
		"2016-10-15":{
			title:"第一级标题", //显示价格等
			subTitle:"第二级标题"//显示自定义文案
		}
	}
*/
/*
	默认日历控件显示12个月，
	如果只传递了开始时间，就是开始时间-24
	如果只传递了结束时间，就是今天-结束时间
	如果都传递：开始时间-结束时间
*/
CPage({
  // pageId: "",
  checkPerformance: true,
  data: {
    DAY_NAMES: LANG.DAY_NAMES,
    monthDates: [],
    year_month_seperator: LANG.YEAR_MONTH_SEPERATOR,
    HOLIDAYS: HOLIDAYS,
    inDay: null,
    outDay: null,
    scrollToID: null,
    tips: null,
    timeZoneDate: null,
    biz: 1,
    /*qwf start*/
    isSingleSelect:true,//默认单选
    inDayToast:null,
    outDayToast:null,
    /*qwf end*/
  },
  onLoad: function (options) {
    this.options = this.processOptions(options);
    // cwx.showToast({
    //   title: '加载中..',
    //   icon: 'loading',
    // });

    this.data.timeZoneDate = options.data.timeZoneDate || dateUtil.TimeZoneDate.create();

    this.data.biz = this.data.timeZoneDate.tzone === 0 ? 1 : 2;

    /*qwf start*/
    this.data.isSingleSelect = options.data.isSingleSelect !== undefined ? options.data.isSingleSelect:true;
    this.data.inDayToast = options.data.inDayToast;
    this.data.outDayToast = options.data.outDayToast;
    // this.data.cancelActionCode = options.data.cancelActionCode;
    this.data.confirmActionCode = options.data.confirmActionCode;
    this.data.chooseDateActionCode = options.data.chooseDateActionCode;
    /*qwf end*/
    this.updateMonthDates(options.data, INITIAL_MONTHS);

    this.title = options.data.title;
  },
  onReady: function () {
    if (this.title) {
      cwx.setNavigationBarTitle({
        title: this.title,
      });
    }
    // cwx.hideToast();

    /*qwf start*/
    let localThis = this;
    setTimeout(function(){
      localThis.updateMonthDates(localThis.options.data, DEFAULT_MONTH);
    },1000)
    /*qwf end*/
  },

  onDateTap: function (e) {
    this.ubtTrace(102324, {
      actionCode: this.data.chooseDateActionCode,
      actionType: 'click'
    });
    var data = e.currentTarget.dataset;
    if (this.data.isSingleSelect) {
      this.data.inDay = data.date;
    } else {
      this.updateInOutDay(data.date);
    }
    var monthes = this.updateChooseDate(data.date);

    // TODO inDay out date
    this.setData({
      inDay: this.data.inDay,
      outDay: this.data.outDay,
      monthDates: monthes,
    });

    /*qwf start */
    //控制权交给BU
    // if (this.data.inDay && this.data.outDay) {

    //   const inDayDate = dateUtil.parse(this.data.inDay);
    //   const outDayDate = dateUtil.parse(this.data.outDay);
    //   this.invokeCallback({
    //     inDay: dateUtil.formatTime('yyyy-MM-dd', inDayDate),
    //     outDay: dateUtil.formatTime('yyyy-MM-dd', outDayDate),
    //     days: dateUtil.calDays(inDayDate, outDayDate)
    //   });
    //   this.navigateBack();
    // }
    /*qwf end */
  },

  /*qwf start */
  confirmSelect:function() {
    
    if (this.data.isSingleSelect) {
      if (!this.data.inDay) {
        cwx.showToast({
          title: this.data.inDayToast || '请选择出发日期',
          icon: 'none'
        })
        return;
      }
      this.ubtTrace(102324, {
        actionCode: this.data.confirmActionCode,
        actionType: 'click'
      });
      const inDayDate = dateUtil.parse(this.data.inDay);
      this.invokeCallback({
        inDay: dateUtil.formatTime('yyyy-MM-dd', inDayDate),
      });
      this.navigateBack();
      return;
    }

    if (!this.data.inDay) {
      cwx.showToast({
        title: this.data.inDayToast || '请选择入住日期',
        icon:'none'
      })
      return;
    }
    if (!this.data.outDay) {
      cwx.showToast({
        title: this.data.outDayToast || '请选择离店日期',
        icon: 'none'
      })
      return;
    }
    
    if (this.data.inDay && this.data.outDay) {
      this.ubtTrace(102324, {
        actionCode: this.data.confirmActionCode,
        actionType: 'click'
      });
      const inDayDate = dateUtil.parse(this.data.inDay);
      const outDayDate = dateUtil.parse(this.data.outDay);
      this.invokeCallback({
        inDay: dateUtil.formatTime('yyyy-MM-dd', inDayDate),
        outDay: dateUtil.formatTime('yyyy-MM-dd', outDayDate),
        days: dateUtil.calDays(inDayDate, outDayDate)
      });
      this.navigateBack();
    }

  },
  /*qwf end */

  // onHolidayTap: function (e) {
  //   this.setData({
  //     choosenDate: 'date-' + e.currentTarget.dataset.date
  //   });
  // },
  updateChooseDate: function (date) {
    var inDay = this.data.inDay;
    var outDay = this.data.outDay;
    var monthes = this.data.monthDates;
    var beginDate = new Date(_today.getFullYear(), _today.getMonth(), _today.getDate());
    var limitOutDay;

    /*qwf start */
    if (!this.data.isSingleSelect && inDay && !outDay) {
      //日历双选有日期限制，最多可以选择28天
      limitOutDay = dateUtil.parse(dateUtil.addDay(inDay, 28));
    }
    /*qwf end */
    let localThis = this;
    monthes.forEach(function (month) {
      if (month.dates && month.dates instanceof Array) {
        month.dates.forEach(function (ob) {
          if (ob && ob.value) {
            var obDay = dateUtil.parse(ob.value);
            ob.inDay = inDay && ob.value === inDay;
            ob.outDay = outDay && ob.value === outDay;
            ob.choose = ob.inDay || ob.outDay;
            ob.stay = _isStayDay(inDay, outDay, ob.value);
            ob.outOfRange = limitOutDay && limitOutDay < obDay || obDay < beginDate;
            if (ob.value === inDay) {
              /**qwf start */
              ob.info = { title: localThis.data.isSingleSelect ? '' :'入住' };
              /**qwf end */
            } else if (ob.value === outDay) {
              /**qwf start */
              ob.info = { title: localThis.data.isSingleSelect ? '' :'离店' };
              /**qwf end */

            } else {
              ob.info = {};
            }
          }
        })
      }
    });
    return monthes
  },

  updateInOutDay: function (date) {
    const inDay = this.data.inDay;
    const outDay = this.data.outDay;

    const inDayObj = inDay != null ? new Date(inDay.replace(rDateStr, '/')) : null;
    const outDayObj = outDay != null ? new Date(outDay.replace(rDateStr, '/')) : null;
    const dateObj = new Date(date.replace(rDateStr, '/'));

    if (!inDay && !outDay) {
      this.data.inDay = date;
      return;
    }

    if (inDay && outDay) {
      this.data.inDay = date;
      this.data.outDay = null;
      return;
    }

    if (inDay && dateObj < inDayObj) {
      this.data.inDay = date;
      return;
    }

    if (inDay && dateObj > inDayObj) {
      this.data.outDay = date;
    }
  },

  updateToday: function () {
    const date = this.data.timeZoneDate.getNow();

    //设置当前时间
    _year = 1900 + date.getYear();
    _month = date.getMonth();
    _date = date.getDate();
    _todayValue = _getDateValue(_year, _month, _date);
    date.setDate(date.getDate() + 1);
    _tomorrowValue = dateUtil.formatTime('yyyy-M-d', date);
  },
  /*
      组合显示的元素
  */
  updateMonthDates: function (data,numberOfMonths) {
    // console.log( "calendar data = ", data )
    var inDay = data.inDay;
    var outDay = data.outDay;
    var beginDate = data.beginDate;
    var endDate = data.endDate;
    var info = data.info;


    this.updateToday();

    _today = _stringToDate(beginDate) || this.data.timeZoneDate.getNow();
    //设置当前时间
    _year = 1900 + _today.getYear();
    _month = _today.getMonth();
    _date = _today.getDate();
    _since = {
      year: _year,
      month: _month,
      date: _date
    };

    /*qwf start*/
    // var _endDate = _stringToDate(endDate) || new Date(_year+2, _month, _date);

    var _endDate = _stringToDate(endDate) || new Date(_year, _month + numberOfMonths, _date);
    /*qwf end*/

    var _endYear = _endDate.getFullYear();//获取到结束日期
    var _endMonth = _endDate.getMonth();//

    //显示到一年后
    var _monthDates =  [];
    _month = _month;
    var n = (_endYear - _year) * 12 + (_endMonth - _month) + 1;
    while (n--) {
      _monthDates.push({
        monthID: "mid" + _year + "-" + (_month + 1), //id不能数字大头
        monthName: _year + LANG.YEAR_POSTFIX + LANG.YEAR_MONTH_SEPERATOR + LANG.MONTH_NAMES[_month],
        /**qwf start */
        dates: _getMonthDates(_year, _month, inDay, outDay, beginDate, endDate, info, this.data.isSingleSelect)
        /**qwf end */
      });
      if (_month === 11) {
        _year++;
        _month = 0;
      }
      else {
        _month++
      }
    }

    //滚动到制定位置
    var scrollToID = null;
    if (inDay) {
      var split = inDay.split("-");
      scrollToID = "mid" + split[0] + "-" + split[1] //
    }
    /*
        添加酒店特殊悬浮标题
    */
    var tips = data.tips || '';
    this.setData({
      tips: tips,
      biz: this.data.biz,
      monthDates: _monthDates,
      scrollToID: scrollToID
    })
  },

  processOptions: function (options) {
    if (util.isEmpty(options.data)) {
      return options;
    }

    let { inDay, outDay } = options.data;
    inDay = dateUtil.formatTime('yyyy-M-d', dateUtil.parse(inDay));
    outDay = dateUtil.formatTime('yyyy-M-d', dateUtil.parse(outDay));

    options.data.inDay = inDay;
    options.data.outDay = outDay;
    return options;
  }

});