import { cwx, CPage } from '../../../../cwx/cwx.js';
// eslint-disable-next-line
import dateUtil from '../../common/utils/date.js';
import util from '../../common/utils/util.js';
// eslint-disable-next-line
import date from '../../common/utils/date.js';

import hrRest from './calendarrest.js';

const LANG = {
    TITLE: '选择日期',
    YEAR_POSTFIX: '年',
    MONTH_NAMES: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    YEAR_MONTH_SEPERATOR: '',
    DAY_NAMES: ['日', '一', '二', '三', '四', '五', '六']
};

const rDateStr = /-/g;

function _stringToDate (str) {
    if (!str) return null;
    return new Date(str.replace(rDateStr, '/'));
}

function _getDateValue (year, month, date) {
    return [year, month + 1, date].join('-');
}

// tczhu 新增一个选中日期判断
function _getMonthDates (year, month, inDay, outDay, beginDate, endDate, opt, isMorning, timeZoneDate, holidays, extraWorkdays, extraRestdays) {
    const someday = new Date(year, month, 1);
    const pushDate = function (d) {
        let outOfRange = false; const dateValue = _getDateValue(year, month, d);

        /*
            处理不在范围内的日期
        */
        if (_since) {
            if (year < _since.year) outOfRange = true;
            if (year === _since.year && month < _since.month) outOfRange = true;
            if (year === _since.year && month === _since.month && d < _since.date) outOfRange = true;
        }

        if (beginDate) {
            const dateSplits = beginDate.split('-');
            const beginYear = parseInt(dateSplits[0]);
            const beginMonth = parseInt(dateSplits[1]) - 1; // 月份是从0开始的
            const beginDay = parseInt(dateSplits[2]);
            if (year < beginYear) outOfRange = true;
            if (year === beginYear && month < beginMonth) outOfRange = true;
            if (year === beginYear && month === beginMonth && d < beginDay) outOfRange = true;
            // 新增凌晨订单时，yesterday的outOfRange设置为false
            const yesterDay = _stringToDate(timeZoneDate.yesterday());// d === _since.date-1;
            const y = 1900 + yesterDay.getYear();
            const isYesterDay = (year === y) && (month === yesterDay.getMonth()) && (d === yesterDay.getDate());
            if (isMorning && isYesterDay) outOfRange = false;
        }
        if (endDate) {
            const dateSplits = endDate.split('-');
            const endYear = parseInt(dateSplits[0]);
            const endMonth = parseInt(dateSplits[1]) - 1;
            const endDay = parseInt(dateSplits[2]);
            if (year > endYear) outOfRange = true;
            if (year === endYear && month > endMonth) outOfRange = true;
            if (year === endYear && month === endMonth && d > endDay) outOfRange = true;
        }

        let holiday = false;
        holidays.forEach(function (item) {
            if (item[0] === dateValue) holiday = item[1];
        });

        let info = outOfRange || !opt || !opt[dateValue] ? false : opt[dateValue];
        if (!outOfRange && info.disable) {
            outOfRange = info.disable;
        }

        // (1).chooseDay为yesterDay并且是凌晨时title = '凌晨入住';(2).满足(1)并且入住为一天时title = '中午离店'
        const ydate = _stringToDate(timeZoneDate.yesterday()).getDate();
        const indays = inDay ? (_stringToDate(inDay).getDate() || 0) : 0;
        const outdays = outDay ? (_stringToDate(outDay).getDate() || 0) : 0;
        const chooseMorning = (isMorning && (indays === ydate)) || false;
        let days = 0;
        if (outdays >= indays) {
            days = outdays - indays;
        } else {
            // eslint-disable-next-line
            days = ((ydate === indays) && (outdays - 1 === 0)) ? 1 : 0;
        }

        if (dateValue === inDay) {
            info = { title: chooseMorning ? '凌晨入住' : '入住' };
        } else {
            info = {};
        }

        dates.push({
            choose: (dateValue === inDay),
            inDay: inDay && dateValue === inDay,
            outDay: outDay && dateValue === outDay,
            stay: _isStayDay(inDay, outDay, dateValue),
            value: dateValue,
            date: d,
            outOfRange,
            today: (dateValue === _todayValue),
            tomorrow: (dateValue === _tomorrowValue),
            holiday,
            workday: (extraWorkdays.indexOf(dateValue) >= 0),
            restday: (extraRestdays.indexOf(dateValue) >= 0),
            info // 获取额外的信息
        });
    };

    var dates = [];
    const day = someday.getDay();
    for (let i = 0; i < day; i++) {
        dates.push({
            date: null
        });
    }

    let d = 1;
    for (; d < 28; d++) {
        pushDate(d);
    }
    // eslint-disable-next-line
    while (someday.getMonth() == month) {
        pushDate(d);
        someday.setDate(++d);
    }
    return dates;
}

// 是否为居住期
function _isStayDay (inDay, outDay, day) {
    if (!inDay || !outDay) {
        return false;
    }

    const inDayObj = inDay != null ? new Date(inDay.replace(rDateStr, '/')) : null;
    const outDayObj = outDay != null ? new Date(outDay.replace(rDateStr, '/')) : null;
    const dayObj = new Date(day.replace(rDateStr, '/'));

    return dayObj > inDayObj && dayObj < outDayObj;
}

let _today = new Date();
let _year = 1900 + _today.getYear();
let _month = _today.getMonth();
let _date = _today.getDate();
var _todayValue = _getDateValue(_year, _month, _date);
var _tomorrowValue = dateUtil.simpleTomorrow();
let _yesterday = null;

var _since = {
    year: _year,
    month: _month,
    date: _date
};

CPage({
    pageId: '10320654340',
    checkPerformance: true, // 白屏检测标志位
    data: {
        DAY_NAMES: LANG.DAY_NAMES,
        monthDates: [],
        year_month_seperator: LANG.YEAR_MONTH_SEPERATOR,
        HOLIDAYS: [],
        EXTRA_RESTDAYS: [],
        EXTRA_WORKDAYS: [],
        inDay: null,
        outDay: null,
        scrollToID: null,
        tips: null,
        timeZoneDate: null,
        biz: 1,
        morningBarInfo: {
            showMorningBar: false, // showMorningBar===ture时,凌晨入住提示bar展示
            inDayText: '' // 入住日期,eg：4月16日
        },
        inputEndDate: null, // 外部传入最大选择日期
        isMorning: false // isMorning===true,则为凌晨
    },
    dateTapProcessing: false,
    onLoad: function (options) {
        this.getHolidayDate(options.data); // 获取节假日信息
        this.options = this.processOptions(options);
        cwx.showToast({
            title: '加载中..',
            icon: 'loading',
            duration: 10000
        });
        this.data.timeZoneDate = options.data.timeZoneDate || date.TimeZoneDate.create();
        this.data.biz = this.data.timeZoneDate.tzone === 0 ? 1 : 2;
        // 设置isMorning的值
        this.data.isMorning = options.data.isMorning;
        // 保存最大可选时间
        if (options.data.endDate) {
            this.data.inputEndDate = options.data.endDate;
        }
        this.updateMonthDates(options.data, 2, 0);
        this.title = options.data.title || '日历';
    },
    onReady: function () {
        cwx.setNavigationBarTitle({
            title: this.title
        });
        this.updateMonthDates(this.options.data, null, 0);
        cwx.hideToast();
    },

    onDateTap: function (e) {
        if (this.dateTapProcessing) return;

        this.dateTapProcessing = true;
        const data = e.currentTarget.dataset;
        const chooseDate = data.date;
        const week = LANG.DAY_NAMES[data.index % 7];
        const chooseDateTomorrow = dateUtil.addDay(chooseDate, 1);
        this.updateInOutDay(chooseDate);
        const monthes = this.updateChooseDate(chooseDate);
        this.setData({
            inDay: this.data.inDay,
            outDay: chooseDateTomorrow,
            monthDates: monthes
        });
        // 控制权交给BU
        if (this.data.inDay && this.data.outDay) {
            const inDayDate = dateUtil.parse(this.data.inDay);
            const outDayDate = dateUtil.parse(this.data.outDay);
            this.invokeCallback({
                inDay: dateUtil.formatTime('yyyy-MM-dd', inDayDate),
                outDay: dateUtil.formatTime('yyyy-MM-dd', outDayDate),
                days: dateUtil.calDays(inDayDate, outDayDate),
                week
            });

            setTimeout(() => {
                this.navigateBack();
            }, 500);
        } else {
            this.dateTapProcessing = false;
        }
    },
    updateChooseDate: function (date) {
        const inDay = this.data.inDay;
        const outDay = this.data.outDay;
        const monthes = this.data.monthDates;
        const beginDate = new Date(_today.getFullYear(), _today.getMonth(), _today.getDate());
        const inputEndDate = this.data.inputEndDate;
        let limitOutDay;
        if (inDay && !outDay) {
            // 日历双选有日期限制，最多可以选择28天
            limitOutDay = dateUtil.parse(dateUtil.addDay(inDay, 28));
            // 当有传入最大时间限制时，两者取其小
            if (inputEndDate) {
                const maxEndDate = dateUtil.parse(inputEndDate);
                limitOutDay = limitOutDay < maxEndDate ? limitOutDay : maxEndDate;
            }
        }
        const isMorning = this.data.isMorning || false;
        const yd = _stringToDate(this.data.timeZoneDate.yesterday()).getDate();
        const td = _stringToDate(inDay).getDate();
        const chooseMorning = (isMorning && (yd === td)) || false;
        monthes.forEach(function (month) {
            if (month.dates && month.dates instanceof Array) {
                month.dates.forEach(function (ob) {
                    if (ob && ob.value) {
                        const obDay = dateUtil.parse(ob.value);
                        ob.inDay = inDay && ob.value === inDay;
                        ob.outDay = outDay && ob.value === outDay;
                        ob.choose = ob.inDay || ob.outDay;
                        ob.stay = _isStayDay(inDay, outDay, ob.value);
                        ob.outOfRange = (limitOutDay && limitOutDay < obDay) || obDay < beginDate;
                        // 凌晨单时，昨天也可以选择
                        const isYesterDay = (isMorning && ob.yesterday) || false;
                        if (isYesterDay) {
                            ob.outOfRange = false;
                        }
                        if (ob.value === inDay) {
                            ob.info = { title: chooseMorning ? '凌晨入住' : '入住' };
                        } else {
                            ob.info = {};
                        }
                    }
                });
            }
        });
        return monthes;
    },

    updateInOutDay: function (date) {
        const inDay = this.data.inDay;
        const outDay = this.data.outDay;
        const inDayObj = inDay != null ? new Date(inDay.replace(rDateStr, '/')) : null;
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
        // 设置当前时间
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
    updateMonthDates: function (data, limit, start) {
        const inDay = data.inDay;
        const outDay = data.outDay;
        const beginDate = data.beginDate;
        const endDate = data.endDate;
        const info = data.info;
        const timeZoneDate = this.data.timeZoneDate;
        const isMorning = data.isMorning || false;

        this.updateToday();

        _today = _stringToDate(beginDate) || this.data.timeZoneDate.getNow();
        // 设置当前时间
        _year = 1900 + _today.getYear();
        _month = _today.getMonth();
        _date = _today.getDate();
        if (isMorning) {
            _yesterday = _stringToDate(timeZoneDate.yesterday());
            if (_yesterday) {
                _year = 1900 + _yesterday.getYear();
                _month = _yesterday.getMonth();
                _date = _yesterday.getDate();
            }
        }
        _since = {
            year: _year,
            month: _month,
            date: _date
        };

        const _endDate = _stringToDate(endDate) || new Date(_year + 2, _month, _date);
        const _endYear = _endDate.getFullYear();// 获取到结束日期
        const _endMonth = _endDate.getMonth();//

        // 显示到一年后
        const _monthDates = [];
        _month = _month + (start || 0);

        let n = (_endYear - _year) * 12 + (_endMonth - _month) + 1;
        while (n-- && (limit == null || limit--)) {
            _monthDates.push({
                monthID: 'mid' + _year + '-' + (_month + 1), // id不能数字大头
                monthName: _year + LANG.YEAR_POSTFIX + LANG.YEAR_MONTH_SEPERATOR + LANG.MONTH_NAMES[_month],
                dates: _getMonthDates(_year, _month, inDay, outDay, beginDate, endDate, info, isMorning, timeZoneDate, this.data.HOLIDAYS, this.data.EXTRA_WORKDAYS, this.data.EXTRA_RESTDAYS)
            });
            if (_month >= 11) {
                _year++;
                _month = 0;
            } else {
                _month++;
            }
        }

        // 滚动到制定位置
        let scrollToID = null;
        if (inDay && limit == null) {
            const split = inDay.split('-');
            scrollToID = 'mid' + split[0] + '-' + split[1]; //
        }
        /*
            添加酒店特殊悬浮标题
        */
        const tips = data.tips || '';
        // 设置凌晨单相关
        const morningBarInfo = this.setMorningBarInfo(data);
        this.setData({
            tips,
            biz: this.data.biz,
            monthDates: _monthDates,
            isMorning,
            morningBarInfo,
            scrollToID
        });
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
    },

    /**
     * 设置凌晨单相关
     * @param {data}
     */
    setMorningBarInfo: function (data) {
        // 设置凌晨相关
        const isMorning = data.isMorning;
        const morningBarInfo = this.data.morningBarInfo || {};
        const timeZoneDate = this.data.timeZoneDate;

        // isMorning===true && selectDay!=toDay => morningBarInfo.showMorningBar === true
        const yesterday = timeZoneDate.yesterday();
        const toDay = timeZoneDate.getNow();
        const td = new Date(toDay).getDate();
        const inday = _stringToDate(data.inDay).getDate();
        if (isMorning && td === inday) {
            morningBarInfo.showMorningBar = true;
            morningBarInfo.inDayText = this.getInDayText(yesterday);
        } else {
            morningBarInfo.showMorningBar = false;
        }

        return morningBarInfo;
    },

    /**
     * 设置inDayText
     * @param {inDay}
     */
    getInDayText: function (inDay) {
        const date = dateUtil.formatTime('yyyy-MM-dd', dateUtil.parse(inDay));
        const arr = date.split('-');
        // eslint-disable-next-line
        const ret = ['', ''];
        const allArr = [arr[1], '月', arr[2], '日'];
        const indayText = allArr.join('');
        return indayText;
    },

    /**
     * @description 获取节假日信息
     * @param {Object} data options 中的 data 数据
     * @return {void}
     */
    getHolidayDate: function (optionsData) {
        hrRest.getHolidays({}, (data) => {
            // 将 holidayInfo 对象格式转为数组格式 [date, name]
            // 将 holidays, restdays, workdays 中日期的 mm-dd 中的0去除，例：09-01 -> 9-1
            const holidays = data.holidays.map(h => {
                let date = h.date.split('-');
                date[1] = date[1] > 9 ? date[1] : date[1].substring(1, 2);
                date[2] = date[2] > 9 ? date[2] : date[2].substring(1, 2);
                date = date.join('-');
                return [date, h.name];
            });
            const restdays = data.restdays.map(r => {
                let date = r.split('-');
                date[1] = date[1] > 9 ? date[1] : date[1].substring(1, 2);
                date[2] = date[2] > 9 ? date[2] : date[2].substring(1, 2);
                date = date.join('-');
                return date;
            });
            const workdays = data.workdays.map(w => {
                let date = w.split('-');
                date[1] = date[1] > 9 ? date[1] : date[1].substring(1, 2);
                date[2] = date[2] > 9 ? date[2] : date[2].substring(1, 2);
                date = date.join('-');
                return date;
            });
            this.setData({
                HOLIDAYS: holidays,
                EXTRA_RESTDAYS: restdays,
                EXTRA_WORKDAYS: workdays
            });

            // 更新日历展示
            this.updateMonthDates(optionsData, null, 0);
        });
    }
});
