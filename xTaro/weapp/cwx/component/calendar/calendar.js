/**
 * 日历组件
 * @module component/calendar
 */
import { cwx, CPage, __global } from '../../cwx.js';

const CACHE_TIMEOUT_MONTH = 11;
const CACHE_TIMEOUT_DAY = 1;
const STORAGE_KEY = 'publicHolidays';

var LANG = {
	"TITLE": "选择日期",
	"YEAR_POSTFIX": "年",
	"MONTH_NAMES": ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
	"YEAR_MONTH_SEPERATOR": "",
	"DAY_NAMES": ["日", "一", "二", "三", "四", "五", "六"]
};

let maxYear = new Date().getFullYear();
/*
 * 	【节日具体日期】 	HOLIDAYS
 *  【数据结构】		[['2020-12-25', '圣诞节'], ......]
 *  第一个元素 年-月-日；第二个元素 节日名称
 */
let HOLIDAYS = [];
/*
 * 	【所有放假的日子】 	EXTRA_RESTDAYS
 *  【数据结构】		['2021-1-1', ......]
 *  年-月-日
 */
let EXTRA_RESTDAYS = [];
/*
 * 	【所有调休的日子】 	EXTRA_WORKDAYS
 *  【数据结构】		['2021-1-1', ......]
 *  年-月-日
 */
let EXTRA_WORKDAYS = [];

function _stringToDate(str) {
	if (!str) return null;
	return new Date(str.replace(/-/g, "/"));
}

function _getDateValue(year, month, date) {
	return [year, month + 1, date].join('-');
}

//tczhu 新增一个选中日期判断
function _getMonthDates(year, month, choosenDate, beginDate, endDate, opt) {
  var dataInfo = opt.info;
	var someday = new Date(year, month, 1);
	var pushDate = function (d) {
		var outOfRange = false, dateValue = _getDateValue(year, month, d);

		/*
			处理不在范围内的日期
		*/
		if (_since) {
			if (year < _since.year) outOfRange = true;
			if (year == _since.year && month < _since.month) outOfRange = true;
			if (year == _since.year && month == _since.month && d < _since.date) outOfRange = true;
		}

		if (beginDate) {
			var dateSplits = beginDate.split("-");
			var beginYear = parseInt(dateSplits[0]);
			var beginMonth = parseInt(dateSplits[1]) - 1; //月份是从0开始的
			var beginDay = parseInt(dateSplits[2]);
			if (year < beginYear) outOfRange = true;
			if (year == beginYear && month < beginMonth) outOfRange = true;
			if (year == beginYear && month == beginMonth && d < beginDay) outOfRange = true;
		}
		if (endDate) {
			var dateSplits = endDate.split("-");
			var endYear = parseInt(dateSplits[0]);
			var endMonth = parseInt(dateSplits[1]) - 1;
			var endDay = parseInt(dateSplits[2]);
			if (year > endYear) outOfRange = true;
			if (year == endYear && month > endMonth) outOfRange = true;
			if (year == endYear && month == endMonth && d > endDay) outOfRange = true;
		}

		var holiday = false;
		HOLIDAYS.forEach(function (item) {
			if (item[0] == dateValue) holiday = item[1];
		});

    var info = outOfRange || !dataInfo || !dataInfo[dateValue] ? false : dataInfo[dateValue];
    if(!outOfRange && info.disable){
      outOfRange = info.disable
    }
    var disableNoneDate = opt.disableNoneDate || false
    /** 不存在info */
    if (false == info && false == outOfRange){
        outOfRange = disableNoneDate
    }

		dates.push({
			choose: (dateValue == choosenDate),
			value: dateValue,
			date: d,
			outOfRange: outOfRange,
			today: (dateValue == _todayValue),
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

var _today = new Date();
var _year = 1900 + _today.getYear();
var _month = _today.getMonth();
var _date = _today.getDate();
var _todayValue = _getDateValue(_year, _month, _date);


var _since = {
	year: _year,
	month: _month,
	date: _date
};

/*
	choosenDate:选中的日期,格式为2016-10-15
	beginDate:开始日期
	endDate:结束日期
	info:{
		"2016-10-15":{
			title:"第一级标题", //显示价格等
			subTitle:"第二级标题"//显示自定义文案
		}
	}
*/
/*
	默认日历控件显示24个月，
	如果只传递了开始时间，就是开始时间-24
	如果只传递了结束时间，就是今天-结束时间
	如果都传递：开始时间-结束时间
*/

CPage({
	pageId: "10320654340",
	QUERY_HOLIDAYS_URL: 'https://m.ctrip.com/restapi/soa2/12378/json/getGeneralConfigData?key=Holiday',
	data: {
		DAY_NAMES: LANG.DAY_NAMES,
		monthDates: [],
		year_month_seperator: LANG.YEAR_MONTH_SEPERATOR,
		HOLIDAYS: HOLIDAYS,
		choosenDate: null,
		scrollToID: null,
		tips: null,
	},

	onLoad: function (options) {
		this.options = options;
		cwx.showToast({
			title: '加载中..',
			icon: 'loading',
			duration: 10000,
			complete: function () {

			}
		});
	},

	onReady: function () {
		// 放假安排的数据源：缓存、接口返回的数据（缓存过期时间：xxx年的11月）
		this.getPublicHolidaysInfo();

		cwx.setNavigationBarTitle({
			title: (this.options && this.options.data && this.options.data.title) || '日历'
		})
	},
	
	onUnload: function () {
	  cwx.Observer.noti("calendar_onUnload")
	},

	addHolidays: function(year, hItem) {
		HOLIDAYS.push([
			[
				year, 
				this.getMonthNumInString(hItem.HolidayDay), 
				this.getDayNumInString(hItem.HolidayDay)
			].join('-'),
			hItem.HolidayName
		]);
	},

	addExtraRestdays: function(year, hItem) {
		const restdayCount = Number(hItem.HolidayCount);
		const restdayStart = hItem.StartDay;
		const restdayEnd = hItem.EndDay;
		if(this.getMonthNumInString(restdayStart) === this.getMonthNumInString(restdayEnd)) {
			for(let j = 0; j < restdayCount; j++) {
				EXTRA_RESTDAYS.push(
					[
						year, 
						this.getMonthNumInString(restdayStart), 
						this.getDayNumInString(restdayStart) + j
					].join('-')
				)
			}
		} else {
			// console.log('放假时间跨月份，从end往前加')
			// 放假时间跨月份，从end往前加
			for(let j = 0; j < restdayCount; j++) {
				// 从 end 往前加，一直加到 日小于1，从 start 开始加
				if(this.getDayNumInString(restdayEnd) - j < 1 ) {
					EXTRA_RESTDAYS.unshift(
						[
							year, 
							this.getMonthNumInString(restdayStart), 
							(this.getDayNumInString(restdayStart) -1) + (restdayCount - j) // 补偿
						].join('-')
					)
				} else {
					EXTRA_RESTDAYS.unshift(
						[
							year, 
							this.getMonthNumInString(restdayEnd), 
							this.getDayNumInString(restdayEnd) - j // 补偿
						].join('-')
					)
				}
			}
		}
	},

	addWorkdays: function(year, hItem) {
		let wItemArr = hItem.WorkDay.split(',');
		wItemArr = wItemArr.filter(item => {
			return item;
		})

		wItemArr.map(item => {
			EXTRA_WORKDAYS.push(
				[
					year,
					this.getMonthNumInString(item), 
					this.getDayNumInString(item)
				].join('-'))
		})
	},

	/**
	 * 整理数据：分组
	 * 目标：归类 【节日具体日期】 【所有放假的日子】 【所有调休的日子】
	 */
	sortoutHolidaysInfo: function(data) {
		let holidayData = data && data.Holiday ? data.Holiday : [];
		// console.log('去年-今年-明年的放假安排列表：', holidayData)
			
		holidayData.map(item => {
			// console.log('item', item);
			const holidayList = item.HolidayList;
			const year = item.Year;
			// 获取fecth的数据中最大的年份，过期时间就是这个年份
			maxYear = year > maxYear ? year : maxYear;

			for(let i = 0; i < holidayList.length; i++) {
				const hItem = holidayList[i];

				this.addHolidays(year, hItem)

				if (hItem.HolidayCount !== "") {
					this.addExtraRestdays(year, hItem);
				}

				if(hItem.WorkDay) {
					this.addWorkdays(year, hItem)
				}
			}
		})
		// console.log('处理结果: ')
		// console.log(HOLIDAYS)
		// console.log(EXTRA_RESTDAYS)
		// console.log(EXTRA_WORKDAYS)
	},

	getExpirTimeStamp: function() {
		let expirationYear = maxYear;
		let currentMonth = new Date().getMonth() + 1; // getMonth() 返回基于0的值
		// console.log('过期的年份为：', expirationYear);
		// console.log('当前的月份为：', currentMonth);
		// console.log(expirationYear)

		let cacheTimeout = this.convertDateToTimestamp(expirationYear, CACHE_TIMEOUT_MONTH, CACHE_TIMEOUT_DAY);
		// console.log('过期时间戳：', cacheTimeout)
		// console.log('过期日期：', this.convertTimestampToDate(cacheTimeout))
		return cacheTimeout;
	},
	
	convertDateToTimestamp: function(year, month, day) {
		return new Date(year, month - 1, day).getTime();
	},

	convertTimestampToDate: function(timestamp) {
		let year = new Date(timestamp).getFullYear();
		let month = new Date(timestamp).getMonth() + 1;
		let day = new Date(timestamp).getDate();
		// console.log([year, month, day].join('-'))

		return [year, month, day].join('-')
	},

	parseFetchData: function(data) {
		try {
			data = JSON.parse(data);
		} catch(e) {
			console.log('parse error message: ', e)
			return data;
		}

		try {
			data = JSON.parse(data.configList[0].configContent);
		} catch(e) {
			console.log('parse error message: ', e)
			return data;
		}
		return data;
	},
	/**
	 * 3种情况：
	 * 无缓存
	 * 有缓存 && 未过期
	 * 有缓存 && 已过期
	 */
	getPublicHolidaysInfo: function() {
		let storeData = this.getStoreData();

		if(!storeData) { 
			// 无缓存，请求数据。获取数据后：缓存数据、展示日历
			console.log('=======无缓存，请求数据')
			this.updateMonthDates();

			this.fetch(this.QUERY_HOLIDAYS_URL, {})
			.then((originData) => {
				let data = this.parseFetchData(originData);
				this.sortoutHolidaysInfo(data); // HOLIDAYS, EXTRA_RESTDAYS, EXTRA_WORKDAYS 完成梳理、赋值
				this.setStoreHolidaysInfo(originData);
				this.updateMonthDates();

				cwx.hideToast();
			})
			.catch(e => {
				console.log('=======获取日历信息失败，失败信息：', e)
				this.updateMonthDates();
				cwx.hideToast();
			})
		} else {
			let timestampIns = new Date().getTime();
			// console.log('=======当前日期：', this.convertTimestampToDate(timestampIns))
			// console.log('=======缓存的过期日期：', this.convertTimestampToDate(storeData.cacheTimeout))

			// 不管缓存是否过期，先用缓存将日历渲染出来，同步请求数据并更新缓存
			HOLIDAYS = storeData && storeData.formattedData && storeData.formattedData.holidaysArr || [];
			EXTRA_RESTDAYS = storeData && storeData.formattedData && storeData.formattedData.extraRestDaysArr || [];
			EXTRA_WORKDAYS = storeData && storeData.formattedData && storeData.formattedData.extraWorkdaysArr || [];
			this.updateMonthDates();
			cwx.hideToast();

      // 如果当前时间戳大于缓存的过期时间戳 或 缓存中的节假日数据不存在、不正确
      cwx.configService.watch('cwxCalendar', (res) => {
        if(
          res.update || 
          timestampIns > storeData.cacheTimeout || 
          !(HOLIDAYS && HOLIDAYS.length) || 
          !(EXTRA_RESTDAYS && EXTRA_RESTDAYS.length) || 
          !(EXTRA_WORKDAYS && EXTRA_WORKDAYS.length)
        ) {
          console.log('=======强制更新请求接口')

          // 请求接口，获取新数据
          this.fetch(this.QUERY_HOLIDAYS_URL, {})
          .then((originData) => {
            let data = this.parseFetchData(originData);
            
            // 如果接口返回的数据结构正确 且 与缓存中的 originData 不一致，则仍使用缓存 并且 不更新缓存
            if(data && data.Holiday && data.Holiday.length && (res.update || originData !== storeData.originData)) {
              console.log('=======更新缓存')
              this.sortoutHolidaysInfo(data);
              this.setStoreHolidaysInfo(originData);
            }

            this.updateMonthDates();
          })
          .catch(e => {
            console.log('获取日历信息失败')
            this.updateMonthDates();
            cwx.hideToast();
          })
        }
      })
		}
	},

	setStoreHolidaysInfo: function(originData) {
		console.log('更新本地缓存')
		let cacheTimeout = this.getExpirTimeStamp();

		cwx.setStorageSync(STORAGE_KEY, {
			formattedData: {
				holidaysArr: HOLIDAYS,
				extraRestDaysArr: EXTRA_RESTDAYS,
				extraWorkdaysArr: EXTRA_WORKDAYS
			},
			originData,
			cacheTimeout
		})
	},

	getStoreData() {
		let data = cwx.getStorageSync(STORAGE_KEY);
		return data;
	},

	getMonthNumInString: function(str) {
		return Number(str.slice(0, 2));
	},

	getDayNumInString: function(str) {
		return Number(str.slice(2, 4));
	},

	fetch: function(url, params) {
		return new Promise((resolve, reject) => {
			wx.request({
				url,
				data: params || {},
				method: 'GET',
				success: function(res) {
				    cwx.sendUbtByPage.ubtMetric({
				        name: 184769, //申请生成的Metric KEY
				        tag: { 
							"res": res, 
							"appId": __global.appId,
							"mktopenid": cwx.cwx_mkt.openid
						}, //自定义Tag
				        value: 1 //number 值只能是数字
					});
					
					if(res && res.statusCode === 200) {
						resolve && resolve(res.data.rspJsonStr)
					} else {
						reject && reject(res)
					}
				},
				fail: function(err) {
				    cwx.sendUbtByPage.ubtMetric({
				        name: 184770, //申请生成的Metric KEY
				        tag: { 
							"err_msg": err.message, 
							"err_stack": err.stack,
							"appId": __global.appId,
							"mktopenid": cwx.cwx_mkt.openid
						}, //自定义Tag
				        value: 1 //number 值只能是数字
				    });
					reject && reject(err)
				}
			})
		})
	},
	
	onDateTap: function (e) {
		var data = e.currentTarget.dataset;
		var monthes = this.updateChooseDate(data.date)
		this.setData({
			choosenDate: data.date,
			monthDates: monthes,
		});
		//控制权交给BU
		this.invokeCallback(data.date);
		this.navigateBack();
	},

	onHolidayTap: function (e) {
		this.setData({
			choosenDate: 'date-' + e.currentTarget.dataset.date
		});
	},

	updateChooseDate: function (date) {
		var monthes = this.data.monthDates;
		monthes.forEach(function (month) {
			if (month.dates && month.dates instanceof Array) {
				month.dates.forEach(function (ob) {
					if (ob) {
						ob.choose = false;
						if (ob.value === date) {
							// console.log("update choose date ",date);
							ob.choose = true;
						}
					}
				})
			}
		})
		return monthes
	},

	updateToday: function () {
		var date = new Date()
		//设置当前时间
		_year = 1900 + date.getYear();
		_month = date.getMonth();
		_date = date.getDate();
		_todayValue = _getDateValue(_year, _month, _date)
	},
	/**
	 * 组合显示的元素
	 */
	updateMonthDates: function () {
		let data = (this.options && this.options.data) || {};
		// console.log( "calendar data = ", data )
		var choosenDate = data.choosenDate;
		var beginDate = data.beginDate;
		var endDate = data.endDate;

		this.updateToday();

		_today = _stringToDate(beginDate) || new Date()
		//设置当前时间
		_year = 1900 + _today.getYear();
		_month = _today.getMonth();
		_date = _today.getDate();
		_since = {
			year: _year,
			month: _month,
			date: _date
		}

		var _endDate = _stringToDate(endDate) || new Date(_year + 2, _month, _date)
		var _endYear = _endDate.getFullYear();//获取到结束日期
		var _endMonth = _endDate.getMonth();//

		//显示到一年后
		var _monthDates = [];
		var n = (_endYear - _year) * 12 + (_endMonth - _month) + 1;
		while (n--) {
			_monthDates.push({
				monthID: "mid" + _year + "-" + (_month + 1), //id不能数字大头
				monthName: _year + LANG.YEAR_POSTFIX + LANG.YEAR_MONTH_SEPERATOR + LANG.MONTH_NAMES[_month],
        dates: _getMonthDates(_year, _month, choosenDate, beginDate, endDate, data)
			});
			if (_month == 11) {
				_year++;
				_month = 0;
			}
			else {
				_month++
			}
		}

		//滚动到制定位置
		var scrollToID = null;
		if (choosenDate) {
			var split = choosenDate.split("-")
			scrollToID = "mid" + split[0] + "-" + split[1] //
		}
		/**
		 * 添加酒店特殊悬浮标题
		 */
		var tips = data.tips;
		this.setData({
			tips: tips,
			monthDates: _monthDates,
      scrollToID: scrollToID,
		})
	}
})
