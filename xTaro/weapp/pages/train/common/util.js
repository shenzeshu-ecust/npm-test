import { cwx, _ } from '../../../cwx/cwx';
import { shared } from './trainConfig';
import cDate from './cDate';
import { TrainBookStore, TrainStationStore } from './store';
import { InsertActionLog, getConfigByKeysModel } from './model';
import { WXVersion } from './WXVersion';
export * from './cValidate';

const cardTypes = {
  1: '二代身份证',
  2: '护照',
  7: '回乡证',
  8: '台胞证',
  28: '外国人永久居留身份证',
  32: '港澳台居民居住证',
};

const cardTypesByName = {
  二代身份证: 1,
  护照: 2,
  回乡证: 7,
  台胞证: 8,
  外国人永久居留身份证: 28,
  港澳台居民居住证: 32,
};

let util = {
  jumpToSchemePay(PrePayInfo, callback) {
    const curPage = cwx.getCurrentPage();
    curPage.navigateTo({
      url: `../../webview/webview`,
      data: {
        url: `https://m.ctrip.com/webapp/train/activity/ctrip-mini-scheme?wxurl=${PrePayInfo}`,
        needLogin: true,
        bridgeIns: callback,
      },
    });
  },
  jumpToUrl(url) {
    if (!url) return;
    // webview跳转
    if (url.indexOf('https') !== -1 || url.indexOf('http') !== -1) {
      let data = JSON.stringify({ url: encodeURIComponent(url) });
      cwx.navigateTo({
        url: `/pages/train/authorise/web/web?data=${data}`,
      });
    } else if (url.indexOf('appId') !== -1) {
      // 外部小程序跳转
      let reg = /[?&]([^=&#]+)=([^&#]*)/g;
      let querys = url.match(reg);
      let appId;
      for (let i in querys) {
        let query = querys[i].split('=');
        let key = query[0].substr(1);
        let value = query[1];
        if (key == 'appId') {
          appId = value;
        }
      }
      cwx.navigateToMiniProgram({
        appId: appId,
        path: url,
        envVersion: 'release', // develop开发版 trial体验版  release正式版
        success() {
          // 打开成功
        },
      });
    } else {
      cwx.navigateTo({
        url,
      });
    }
    console.log('---------------- navigateTo', url);
  },
  formatServerTimeStamp(time) {
    if (!time) return;

    return parseInt(time.replace(/[^0-9]/gi, '').slice(0, -4));
  },
  formatTimeStringStamp(time) {
    if (!time) return;
    let timeString;
    if (time.indexOf('-') > -1) {
      timeString = time.replace(/-/g, '/');
    }

    return Date.parse(timeString);
  },
  /**
   * [getCurrentCity 获取当前城市]
   * @param  {Function} cb [成功获取城市的回调函数 城市信息在cb中参数  失败的回调函数默认log错误]
   * @return {[type]}      [description]
   */
  getCurrentCity() {
    const cache = cwx.locate.getCachedCtripCity();
    const callback = (res) => {
      try {
        const cityName =
          (!!res.data && res.data.ctripPOIInfo.cityIDList[0].cityName) || '';

        return cityName;
      } catch (e) {
        console.log('getCurrentCity', e);
      }
    };
    if (cache) {
      return callback(cache);
    } else {
      return '';
    }
  },
  copyText(text, sucText) {
    wx.setClipboardData({
      data: text,
      success: function () {
        wx.getClipboardData({
          success: function () {
            if (sucText) {
              cwx.showToast({
                title: sucText,
                icon: 'none',
              });
            }
          },
        });
      },
    });
  },
  formatPhoneSecret(phone) {
    if (!phone) return '';
    phone = phone.replace(/\s+/g, '');
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1 **** $2');
  },
  formatIdcardSecret(idcard) {
    if (!idcard) return '';

    return idcard.replace(/^(.{4})(?:\d+)(.{3})$/, '$1*********$2');
  },
  formatOtherSecret(no) {
    if (no.length < 4) return no;
    let pre = Math.floor(no.length / 3);
    let mid = no.length - pre - 1;

    return no.slice(0, pre) + new Array(mid).join('*') + no.slice(-2);
  },
  compare(p) {
    //这是比较函数
    return function (m, n) {
      let a = m[p];
      let b = n[p];

      return a - b; //升序
    };
  },
  getAge(birthday, dDate) {
    let birthDayTime = new Date(birthday);
    let nowTime = dDate ? new Date(dDate) : new Date();
    return Math.floor(
      (nowTime - birthDayTime) / (365.25 * 24 * 60 * 60 * 1000)
    );
  },
  randomBirth(date = 1) {
    const year = new Date().getFullYear() - 5;
    const random = new Date(new Date().setYear(year)).setDate(date);

    return new Date(random).toISOString().slice(0, 10);
  },
  pad(n) {
    return n < 10 ? '0' + n : n;
  },
  isMobile(text, areaCode) {
    let reg;
    if (areaCode && areaCode !== '86') {
      reg = /^[0-9]+.?[0-9]*$/;
    } else {
      reg = /^(1[0-9][0-9])\d{8}$/;
    }

    return reg.test(text);
  },
  /**
   * 是否为合法代购中文姓名
   * @param str
   * @returns {boolean}
   */
  isValidChineseName(str) {
    let CNReg =
      /^([\u3400-\u9FFF]{1,20}((?:·|\.)[\u3400-\u9FFF]{1,20})|[\u3400-\u9FFF]{2,20}$|([\u3400-\u9FFF]{1,20}[a-zA-z]{1,20})$)/;

    return CNReg.test(str);
  },
  isWorkTime: function () {
    let now = +new Date();
    let early = new Date(now).setHours(6, 0, 0);
    let night = new Date(now).setHours(23, 30, 0);

    return now - early >= 0 && now <= night;
  },
  handleTrains(data, departDate) {
    let gTime = function (time) {
      return (
        +new Date(departDate.replace(/\-/g, '/') + ' ' + time + ':00') +
        (-8 - parseInt(new Date().getTimezoneOffset() / 60)) * 3600 * 1000
      );
    };

    let timeCost = function (t) {
      let hour = parseInt(t / 60);
      let min = t % 60;

      return `${hour > 0 ? `${hour}时` : ''}${min}分`;
    };

    let getPeriod = function (dTime) {
      return dTime >= timeSlot[0] && dTime <= timeSlot[1]
        ? 2
        : dTime >= timeSlot[1] && dTime <= timeSlot[2]
        ? 4
        : dTime >= timeSlot[2] && dTime <= timeSlot[3]
        ? 8
        : 16;
    };

    let getTrainType = function (type) {
      if (fastTrainSign.indexOf(type) >= 0) {
        // G C 开头车次
        return 2;
      } else if (DTrainSign.indexOf(type) >= 0) {
        // D 开头车次
        return 4;
      } else if (ZTKTrainSign.indexOf(type) >= 0) {
        // Z T K 开头车次
        return 8;
      } else {
        // Y L 等其它车次
        return 16;
      }
    };

    let timeSlot = [
      gTime('00:00'),
      gTime('06:00'),
      gTime('12:00'),
      gTime('18:00'),
    ];
    let fastTrainSign = ['G', 'C']; // 高铁、城际快速
    let DTrainSign = ['D']; // 动车
    let ZTKTrainSign = ['Z', 'T', 'K']; // 普通
    let res = [];
    let seat;

    data.forEach((val) => {
      if (val.SeatList.length == 0 || gTime(val.DepartTime) <= +new Date())
        return;

      seat = val.SeatList[0];
      val.SeatCount = this.handleSeats(val.SeatList);
      val.extraEmptytSeat = new Array(
        val.SeatList.length > 3 ? 0 : 4 - val.SeatList.length
      );
      val.Price = seat.SeatPrice;
      val.SeatName = seat.SeatName;
      val.isJianLou = !seat.SeatInventory;
      val.TimesCost = timeCost(val.RunTime);
      val.DepartTimeStamp = gTime(val.DepartTime);
      // val.IsLocked = (val.DepartTimeStamp - nTime) <= lockTimeStamp
      // 该车次属于的时段 2:早上,4:上午,8:下午,16:晚上
      val.timePeriod = getPeriod(val.DepartTimeStamp);
      // 车次类型
      val.trainType = getTrainType(val.TrainNumber[0]);
      // guard and default operator && ||
      val.SaleNote = (val.SaleNote || '').replace(/(<br\/>)/g, '');

      val.canRobTag = _.some(
        val.SeatList,
        (seat) => util.isSecondClassSeat(seat.SeatName) && !seat.SeatInventory
      );

      const newTrain = this.handleLocalTime(val, departDate);

      res.push({ ...val, ...newTrain });
    });

    return res;
  },
  handleLocalTime(train, departDate) {
    if (!train.LocalStartTime || !train.LocalArriveTime) {
      return {};
    }
    const [localStartDate, localStartTime] = (train.LocalStartTime || '').split(
      ' '
    );
    const [localArriveDate, localArriveTime] = (
      train.LocalArriveTime || ''
    ).split(' ');
    let timeZoneFlag = 0; // 0,1,2 代表无其他时区、出发非北京时区，到达非北京时区
    let res = {};
    if (localStartTime !== train.departTime) {
      res.ShowDepartTime = localStartTime;
      res.rescheduledDepartTime = localStartTime;
      timeZoneFlag = 1;
    }
    if (localArriveTime !== train.arriveTime) {
      res.ShowArriveTime = localArriveTime;
      res.rescheduledArriveTime = localArriveTime;
      timeZoneFlag = 2;
    }

    res.LocalStartDate =
      localStartDate !== departDate
        ? cDate.createUTC8CDate(localStartDate).format('n月j日')
        : '';
    res.LocalArriveDate =
      localArriveDate !== departDate
        ? cDate.createUTC8CDate(localArriveDate).format('n月j日')
        : '';
    res.TimeZoneFlag = timeZoneFlag;
    return res;
  },
  handleSeats(data) {
    let count = 0;
    data.forEach((s) => {
      count += s.SeatInventory;
    });

    return count;
  },
  setTitle(t) {
    wx.setNavigationBarTitle({
      title: t,
    });
  },
  setNavigationBarColor(o = {}) {
    util.safeWX('setNavigationBarColor', undefined, o);
  },
  canIUse(...args) {
    return util.safeWX('canIUse', undefined, ...args);
  },
  safeWX(method = '', NAcb = () => {}, ...args) {
    if (cwx[method]) {
      return cwx[method](...args);
    } else {
      return NAcb(...args);
    }
  },
  showLoading(c) {
    if (cwx.showLoading) {
      return cwx.showLoading({
        title: c || '正在加载',
        mask: true,
      });
    }

    cwx.showToast({
      title: c || '正在加载',
      icon: 'loading',
      duration: 10000,
      mask: true,
    });
  },
  hideLoading() {
    if (cwx.hideLoading) {
      return cwx.hideLoading();
    }
  },
  showToast(t, icon, duration) {
    cwx.showToast({
      title: t,
      icon: icon || 'success',
      mask: true,
      duration: duration || 1500,
    });
  },
  hideToast() {
    cwx.hideToast();
  },
  showModal(option) {
    wx.showModal({
      title: option.title || '提示',
      content: option.m,
      showCancel: option.showCancel || false,
      cancelText: option.cancelText || '取消',
      cancelColor: '#19a0f0',
      confirmText: option.confirmText || '确定',
      confirmColor: '#19a0f0',
      success: option.done,
    });
  },
  goToHomepage() {
    if (shared.isTrainApp) {
      cwx.switchTab({
        url: '/pages/train/index/index',
      });
    } else {
      cwx.switchTab({
        url: '/pages/home/homepage',
      });
    }
  },
  reLaunchCHome(param) {
    if (shared.isTrainApp) {
      cwx.reLaunch({
        url: '/pages/train/index/index' + (param ? '?' + param : ''),
      });
    } else {
      cwx.reLaunch({
        url: '/pages/home/homepage' + (param ? '?' + param : ''),
      });
    }
  },
  reLaunchHomePage(param) {
    if (shared.isTrainApp) {
      cwx.reLaunch({
        url: '/pages/train/index/index' + (param ? '?' + param : ''),
      });
    } else {
      cwx.redirectTo({
        url: '../index/index' + (param ? '?' + param : ''),
      });
    }
  },
  goTrainHome(param) {
    if (shared.isTrainApp) {
      cwx.reLaunch({
        url: '/pages/train/index/index' + (param ? '?' + param : ''),
      });
    } else {
      cwx.navigateTo({
        url: '/pages/train/index/index' + (param ? '?' + param : ''),
      });
    }
  },
  isForceBuy() {
    return util.getConfig('forceBuyPackage');
  },

  configs: {},
  setConfig(key = '', value = false) {
    util.configs[key] = value;

    return value;
  },
  getConfig(key, defaultValue) {
    return util.configs[key] || defaultValue;
  },
  setConfigSwitch(key = '', value = 0) {
    return util.setConfig(key, parseInt(value) ? true : false);
  },
  timeFomatStamp(time) {
    if (!time) return;

    return Date.parse(
      time.slice(0, 4) +
        '/' +
        time.slice(4, 6) +
        '/' +
        time.slice(6, 8) +
        '  ' +
        time.slice(8, 10) +
        ':' +
        time.slice(10, 12) +
        ':' +
        time.slice(-2)
    );
  },
  updateStamp(time) {
    let stamp = parseInt(time.replace(/[^0-9]/gi, '').slice(0, -4));

    return stamp;
  },
  formatDatemd(date) {
    let ints = date.split('-');
    if (ints && ints.length > 2) {
      return `${ints[1]}月${ints[2]}日`;
    } else {
      return '';
    }
  },
  getCalendarInfo(endDate) {
    let robStartDate = new cDate().addDay(shared.preSaleDays);
    let res = {};
    let endDateTime = cDate.parse(endDate).getTime();
    let robDay = cDate.parse(robStartDate.format('Y-n-j'));
    while (robDay.getTime() <= endDateTime) {
      res[robDay.format('Y-n-j')] = {
        title: '抢',
      };
      robDay = robDay.addDay(1);
    }

    return res;
  },

  isIntersection(...arrays) {
    if (arrays.length < 2) {
      return false;
    }
    let map = new Map();
    let res = false;
    arrays.forEach((arr = []) => {
      if (!res) {
        arr.forEach((i) => {
          if (!res) {
            if (map[i]) {
              res = true;

              return;
            } else {
              map[i] = 1;
            }
          }
        });
      }
    });

    return res;
  },

  validateNaviToMini() {
    if (!cwx.navigateToMiniProgram) {
      util.showModal({
        m: '亲爱的 你的微信版本太低啦 无法访问当前页面 快去更新微信APP吧',
        confirmText: '知道啦',
      });

      return false;
    }

    return true;
  },

  navigateToMiniProgram({ path = '', envVersion = 'release' }) {
    if (!util.validateNaviToMini()) {
      return;
    }
    cwx.navigateToMiniProgram({
      appId: 'wxd18d0e7f7784a6c4',
      envVersion,
      path,
    });
  },
  getHongKongStationNameShow(val) {
    if (!val) return;
    if (val == '香港') {
      return '中国' + val;
    } else {
      return val;
    }
  },
  goTimeTable(trainInfo = {}, self) {
    self.navigateTo({
      url: '/pages/train/webview/webview',
      data: {
        url: `https://m.ctrip.com/webapp/train/activity/ctrip-train-timetable?fromStation=${trainInfo.DepartStation}&toStation=${trainInfo.ArriveStation}&date=${trainInfo.DepartDate}&TrainNumber=${trainInfo.TrainNumber}`,
      },
    });
  },
  /**
   * 检查 auth 是否相同，不同则清空 store 更新 auth
   */
  setBookStore() {
    let bookInfo = TrainBookStore.get();
    if (cwx.user.isLogin() && cwx.user.auth === bookInfo.auth) {
      return;
    } else {
      TrainBookStore.set('');
      TrainBookStore.setAttr('auth', cwx.user.auth);
    }
  },
  getAbroadOutParams(options = {}) {
    let fromCity = decodeURIComponent(options.fromcity || options.fromCity);
    let fromCityCode = options.fromcitycode || options.fromCityCode;
    let toCity = decodeURIComponent(options.tocity || options.toCity);
    let toCityCode = options.tocitycode || options.toCityCode;
    let departureDate = options.departuredate || options.departureDate;
    let departureTimeLow = options.departuretimelow || options.departureTimeLow;
    let utmSource = options.utmSource || options.utmsource;
    return {
      fromCity,
      fromCityCode,
      toCity,
      toCityCode,
      departureDate,
      departureTimeLow,
      utmSource,
      hasOutParams:
        options.fromcity ||
        options.fromCity ||
        options.tocity ||
        options.toCity,
    };
  },
  getOutParams(options = {}) {
    let dstation = decodeURIComponent(
      options.dstation || options.dStation || '上海'
    );
    let astation = decodeURIComponent(
      options.astation || options.aStation || '北京'
    );
    let ddate = decodeURIComponent(
      options.ddate || options.dDate || options.ddata || options.dData || ''
    );
    let trainname = decodeURIComponent(
      options.trainname || options.trainName || ''
    ).toUpperCase();
    let seat = decodeURIComponent(options.seat || '');
    let isgd = options.isgd;
    let stu = options.stu;
    let autoFilterDStation = decodeURIComponent(
      options.autoFilterDStation || ''
    );
    let autoFilterAStation = decodeURIComponent(
      options.autoFilterAStation || ''
    );
    let arriveAreaId = options.arriveAreaId;
    let departAreaId = options.departAreaId;
    let isPoint = options.isPoint;
    return {
      dStation: dstation,
      aStation: astation,
      departAreaId,
      arriveAreaId,
      dDate: ddate,
      isgd: !isgd || isgd == '0' || isgd == 'false' ? false : isgd,
      seat,
      trainName: trainname,
      stu: stu ? true : false,
      hasOutParams:
        options.dstation ||
        options.dStation ||
        options.astation ||
        options.aStation ||
        options.dDate ||
        options.ddate ||
        stu ||
        isgd,
      autoFilterDStation,
      autoFilterAStation,
      isPoint,
    };
  },
  outparamsToString({
    dStation = '',
    aStation = '',
    dDate = '',
    trainName = '',
    seat = '',
    isgd = '',
    stu = '',
  }) {
    return (
      `dstation=${encodeURIComponent(dStation)}&astation=${encodeURIComponent(
        aStation
      )}` +
      `&ddate=${encodeURIComponent(
        dDate
      )}&trainname=${trainName}&seat=${encodeURIComponent(
        seat
      )}&isgd=${isgd}&stu=${stu}`
    );
  },
  /**
   *
   * @returns {{promise: Promise, resolve: Function, reject: Function}}
   */
  getDeferred() {
    const deferred = {};

    deferred.promise = new Promise(function (resolve, reject) {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });

    return deferred;
  },
  _openidPromise: null,
  getOpenId() {
    if (!util._openidPromise) {
      initOpenIdPromise();
    }

    return util._openidPromise;
  },
  getRobShareObj({
    ArriveStation = '',
    oid = '',
    avatar = '',
    subOrderId = '',
    shareImgs = [],
    aid = '1023020',
    sid = '1625631',
    success = () => {},
    fail = () => {},
    newFeatureFlag,
    filterType = '',
    stuFlag = 0,
    sharePath = '/pages/train/robshare/robshare',
    ref,
    type,
    shareKey,
    shareUserShareKey,
    webviewUrl,
  }) {
    const title = ArriveStation
      ? `我正在抢到${ArriveStation}的火车票，请求助力`
      : '我正在抢火车票，请求助力';
    let unionData;
    cwx.mkt.getUnion((data) => {
      unionData = data;
    });
    let path = `${sharePath}?oid=${oid}&stuFlag=${stuFlag}&newFeatureFlag=${newFeatureFlag}&channel=moreShare`;
    // let path = '/pages/train/unlimitQRCode/unlimitQRCode?scene=TRN_7A31DDD8CAD1EC6F'
    // let path =  '/pages/train/journey/unlimitQRCode/unlimitQRCode?scene=TRN_7A31DDD8CAD1EC6F'
    if (webviewUrl)
      path +=
        '&url=' +
        encodeURIComponent(
          `${webviewUrl}?oid=${oid}&stuFlag=${stuFlag}&newFeatureFlag=${newFeatureFlag}&subOrderId=${subOrderId}&allianceid=${aid}&sid=${sid}`
        );
    if (ref) path += '&ref=' + ref;
    if (avatar) path += '&avatar=' + avatar;
    if (subOrderId) path += '&subOrderId=' + subOrderId;
    if (type) path += '&type=' + type;
    if (shareKey) path += '&shareKey=' + shareKey;
    if (shareUserShareKey) path += '&shareUserShareKey=' + shareUserShareKey;

    if (aid && sid) {
      path = util.aidsidPath(path, aid, sid);
    } else if (unionData) {
      path = util.aidsidPath(path, unionData.allianceid, unionData.sid);
    }

    let imageUrl =
      'https://images3.c-ctrip.com/train/wechat/jiasu/onshareapp.jpg';
    if (shareImgs.length) {
      if (filterType === 'time') {
        let currDate = +new Date();
        let imageItem = shareImgs.find(
          (item) =>
            currDate >= +new Date(item.beginTime) &&
            currDate <= +new Date(item.endTime)
        );
        imageUrl =
          !!imageItem && !!imageItem.src
            ? imageItem.src
            : 'https://images3.c-ctrip.com/train/2023-3/zengzhang/7yue/xinke/img-zhuli@3x.jpg';
      } else {
        imageUrl = shareImgs[Math.floor(Math.random() * shareImgs.length)];
      }
    }

    console.log('分享路径', path);

    return {
      bu: 'train',
      title,
      path,
      imageUrl,
      success,
      fail,
    };
  },
  isGaoTie,
  isDongChe,
  isPuKuai,
  getTrainType(trainNumber) {
    let type = '其他';
    if (util.isGaoTie(trainNumber)) {
      type = '高铁';
    } else if (util.isDongChe(trainNumber)) {
      type = '动车';
    } else if (util.isPuKuai(trainNumber)) {
      type = '普快';
    }

    return type;
  },

  isFirstClassSeat(seatName) {
    return seatName === '一等座';
  },

  isSecondClassSeat(seatName) {
    return seatName === '二等座';
  },

  isBussinessClassSeat(seatName) {
    return seatName === '商务座';
  },

  isHardSeat(seatName) {
    return seatName === '硬座';
  },

  isSoftSeat(seatName) {
    return seatName === '软座';
  },

  isHardLieSeat(seatName) {
    return seatName === '硬卧';
  },

  isSoftLieSeat(seatName) {
    return seatName === '软卧';
  },

  isNoSeat(seatName) {
    return seatName === '无座';
  },

  isChoosingCRM(seatName) {
    return (
      util.isFirstClassSeat(seatName) ||
      util.isSecondClassSeat(seatName) ||
      util.isBussinessClassSeat(seatName)
    );
  },

  isCDGTrain(number) {
    return util.isDongChe(number) || util.isGaoTie(number);
  },
  isSameTrainType(trainNumber1, trainNumber2) {
    return util.getTrainType(trainNumber1) === util.getTrainType(trainNumber2);
  },

  // 数组去重
  unique(array) {
    let n = [];
    for (let i = 0; i < array.length; i++) {
      if (n.indexOf(array[i]) == -1) n.push(array[i]);
    }

    return n;
  },
  // 获取车次类型 ['G10', 'D11', '1895', 'D12'] -> ['G', 'D', 'O']
  getTrainTypes(trainNumbers) {
    const types = ['G', 'D', 'C'];
    const signs = trainNumbers
      .map((number) => number[0])
      .map((sign) => (types.indexOf(sign) > -1 ? sign : 'O'));

    return util.unique(signs);
  },
  // 计算捡漏票截止时间
  calJLEndTime(departTimeStamps = [], format = 'Y-m-d H:i:s') {
    const departTimeStamp = Math.max(...departTimeStamps);
    let jlExpireTimeStamp = departTimeStamp - 60 * 60 * 1000;
    let date = new Date(jlExpireTimeStamp);
    if (new Date().getTime() >= date.getTime()) {
      jlExpireTimeStamp = departTimeStamp - 35 * 60 * 1000;
      date = new Date(jlExpireTimeStamp);
    }

    return new cDate(date).format(format);
  },
  convertBlank(value) {
    if (
      value &&
      value.toLowerCase &&
      (value.toLowerCase() == 'null' || value.toLowerCase() == 'undefined')
    ) {
      value = '';
    }

    return value;
  },
  /**
   *
   * @param {Page} page
   * @param {Array} mixins 一个包括 methods 或者 data 或者都有的对象的数组
   */
  useMixin(page, mixins = []) {
    let _mixins;
    if (_.isArray(mixins)) {
      _mixins = mixins;
    } else {
      _mixins = [mixins];
    }
    _mixins.forEach((mixin) => {
      if (mixin.data) {
        Object.assign(page.data, mixin.data);
      }
      if (mixin.methods) {
        Object.keys(mixin.methods).forEach((key) => {
          page[key] = mixin.methods[key];
        });
      }
    });
  },

  /**
     * 二等座：票价X0.75
        硬座：票价X0.5
        硬卧：票价-硬座X0.5
     * @param {*} train
     */
  getStuPrice(train) {
    let trainPrice = train.Price;
    let SeatName = train.SeatName;
    if (this.isSecondClassSeat(SeatName)) {
      trainPrice = trainPrice * 0.75;
    } else if (this.isHardSeat(SeatName)) {
      trainPrice = trainPrice * 0.5;
    } else if (this.isHardLieSeat(SeatName)) {
      let hardSeatPrice = 0;
      train.SeatList.forEach((seat) => {
        if (this.isHardSeat(seat.SeatName)) {
          hardSeatPrice = seat.SeatPrice;
        }
      });
      trainPrice = trainPrice - hardSeatPrice * 0.5;
    }
    trainPrice = this.dealPriceInt(trainPrice);

    return trainPrice;
  },
  /**
     * 二等座、一等座、商务座、无座：票价X0.5
        硬座：票价X0.5
        硬卧：票价-硬座X0.5
     */
  getChildPrice(train) {
    let trainPrice = train.Price;
    let SeatName = train.SeatName;
    if (
      this.isSecondClassSeat(SeatName) ||
      this.isFirstClassSeat(SeatName) ||
      this.isBussinessClassSeat(SeatName) ||
      this.isNoSeat(SeatName)
    ) {
      trainPrice = trainPrice * 0.5;
    } else if (this.isHardSeat(SeatName)) {
      trainPrice = trainPrice * 0.5;
    } else if (this.isHardLieSeat(SeatName)) {
      let hardSeatPrice = 0;
      train.SeatList.forEach((seat) => {
        if (this.isHardSeat(seat.SeatName)) {
          hardSeatPrice = seat.SeatPrice;
        }
      });
      trainPrice = trainPrice - hardSeatPrice * 0.5;
    }
    trainPrice = this.dealPriceInt(trainPrice);

    return trainPrice;
  },
  isAuthValid(res) {
    if (
      res &&
      res.ResponseStatus &&
      res.ResponseStatus.Ack &&
      res.ResponseStatus.Ack == 'Failure'
    ) {
      let errors = res.ResponseStatus.Errors;
      if (errors && errors.length > 0) {
        let errorCode = errors[0].ErrorCode;
        if (
          errorCode &&
          errorCode.indexOf('MobileRequestFilterException') !== -1
        ) {
          return false;
        }
      }
    } else {
      return true;
    }
  },
  transToDate(str) {
    return str.replace(
      /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g,
      (_, $1, $2, $3, $4, $5, $6) => {
        return `${$1}/${$2}/${$3} ${$4}:${$5}:${$6}`;
      }
    );
  },
  promisifyModel(original, settings) {
    return function (...args) {
      let target;
      if (settings && settings.thisArg) {
        target = settings.thisArg;
      } else if (settings) {
        target = settings;
      }
      // Return the promisified function

      return new Promise(function (resolve, reject) {
        args.push(function succCallback(data) {
          resolve(data);
        });

        args.push(function failCallback(data) {
          reject(data);
        });

        args.push(function completeCallback() {});

        // Call the function
        original.apply(target, args);
      });
    };
  },
  aidsidPath(path = '', aid = '', sid = '') {
    let aidsid = `allianceid=${aid}&sid=${sid}`;

    return path.indexOf('?') > -1 ? path + `&${aidsid}` : path + `?${aidsid}`;
  },

  platform() {
    const systemInfo = cwx.util.systemInfo || {};

    return systemInfo.platform || '';
  },
  isIOS() {
    return ~util.platform().toLowerCase().indexOf('ios');
  },
  isAndroid() {
    return ~util.platform().toLowerCase().indexOf('android');
  },
  isIphoneX,
  ubtTrace,
  shareTrace,
  devTrace,
  ubtFuxiTrace,
  getUnion,
  validateJiulong(
    train = {},
    ArriveStation = train.ArriveStation,
    DepartStation = train.DepartStation
  ) {
    if (util.isIntersection(['香港', '九龙'], [ArriveStation, DepartStation])) {
      util.showModal({ m: '小程序暂不支持购买广州到九龙的车票，请您谅解' });

      return false;
    }

    return true;
  },
  fillZeroTime(t = '0') {
    const tString = t.toString();
    return tString.length > 1 ? tString : '0' + tString;
  },
  // 日期是否是当日
  isToday(d) {
    return new Date(d).toDateString() === new Date().toDateString();
  },
  delay(time = 1000) {
    return new Promise((resolve) => setTimeout(resolve, time));
  },
  buySame,
  getTicketInfo,
  costTimeString,
  setObjAttrFalse,
  handleMemPas,
  cardTypes,
  cardTypesByName,
  getHours,
  sortMemPas,
  dealPriceInt,
  goReward,
  showLicense,
  isUTC8,
  wait,
  compareVersion,
  isVersionGte,
  canAddMiniapp,
  safeInPageTimerFn,
  filterOutUnsupportTags,
  addSearch,
  insertActionLog,
  getLowerCaseKeyObject,
  getArrDiff,
  getNextDayTimeOut,
  openNationality,
  stringifyQuery,
  encodeAES,
  getRectDomHeight,
  calcOverflowStatus,
  debounce,
};

/**
 * 遍历对象所有属性（包括子属性为对象时,子属性的子属性），并设置为false
 * @param {*} obj
 */
function setObjAttrFalse(obj) {
  Object.keys(obj).forEach(function (key) {
    if (typeof obj[key] === 'object') {
      setObjAttrFalse(obj[key]);
    } else {
      obj[key] = false;
    }
  });
}

function initOpenIdPromise() {
  const deferred = util.getDeferred();
  if (cwx.cwx_mkt.openid || !cwx.Observer) {
    deferred.resolve(cwx.cwx_mkt.openid);
  } else {
    cwx.Observer.addObserverForKey('OpenIdObserver', openIdObserver);
    let checkCount = 80;
    let interval = setInterval(function () {
      checkCount--;
      if (checkCount < 0 || cwx.cwx_mkt.openid) {
        clearInterval(interval);
        cwx.Observer.removeObserverForKey('OpenIdObserver', openIdObserver);
        deferred.resolve(cwx.cwx_mkt.openid);
      }
    }, 100);
  }
  util._openidPromise = deferred.promise;

  return;

  function openIdObserver(openid) {
    cwx.Observer.removeObserverForKey('OpenIdObserver', openIdObserver);
    deferred.resolve(openid);
  }
}

function isGaoTie(number = '') {
  return /^G|C/.test(number);
}

function isDongChe(number) {
  return /^D/.test(number);
}

function isPuKuai(number) {
  return /^Z|K|T/.test(number);
}

function isIphoneX() {
  // https://www.theiphonewiki.com/wiki/Models
  // iPhone10,3 @iPhone X 国行(A1865)、日行(A1902)
  // iPhone10,6 @iPhone X 美版(Global/A1901)
  // iPhone11,2 @iPhone XS
  // iPhone11,4 @iPhone XS Max
  // iPhone11,6 @iPhone XS Max
  // iPhone12,1 @iPhone 11
  // iPhone12,3 @iPhone 11 Pro
  // iPhone12,5 @iPhone XR Pro Max
  const res = wx.getSystemInfoSync();
  const modelString = res.model.slice(
    res.model.indexOf('<') + 1,
    res.model.indexOf('>')
  );
  const iPhoneXArray = [
    'iPhone10,3',
    'iPhone10,6',
    'iPhone11,2',
    'iPhone11,4',
    'iPhone11,6',
    'iPhone11,8',
    'iPhone12,1',
    'iPhone12,3',
    'iPhone12,5',
  ];

  return iPhoneXArray.findIndex((m) => m === modelString) > -1 ? true : false;
}
function ubtFuxiTrace(keyId, data) {
  const curPage = cwx.getCurrentPage();
  data.channel = shared.traceChannel;
  if (curPage && curPage.ubtTrace && keyId) {
    curPage.ubtTrace(keyId, data);
  }
}
function ubtTrace(key, data) {
  const curPage = cwx.getCurrentPage();
  data.channel = shared.traceChannel;
  if (curPage && curPage.ubtTrace && key) {
    curPage.ubtTrace(key, data);
  }
}
function devTrace(key = 'trian_tinyapp_user_events', data) {
  const curPage = cwx.getCurrentPage();
  data.channel = shared.traceChannel;
  if (curPage && curPage.ubtTrace && key) {
    curPage.ubtDevTrace(key, data);
  }
}
function shareTrace({ c = -1, msg = '' }) {
  ubtTrace(101880, {
    c,
    msg,
  });
}
function getUnion() {
  const deferred = util.getDeferred();
  cwx.mkt.getUnion((data) => {
    deferred.resolve(data);
  });

  return deferred.promise;
}

/**
 * 跳转到同样日期的车次列表页、填写页
 * type 目前包括 book, list-cal, list
 * book 会跳转填写页, list-cal 会跳转列表页并且更换出发到达站且打开日历, list 会跳转列表页
 * @param {Object} param0
 */
function buySame({ orderInfo, type }) {
  let params = {
    dStation: orderInfo.TicketInfos[0].DepartStation,
    aStation:
      orderInfo.TicketInfos[orderInfo.TicketInfos.length - 1].ArriveStation,
    dDate: cDate
      .createUTC8CDate(orderInfo.TicketInfos[0].DepartDate)
      .format('Y-m-d'),
    trainname: orderInfo.TicketInfos[0].TrainNumber,
    seat: orderInfo.TicketInfos[0].SeatName,
  };

  const multipleBookingAndGrabSegmentation = orderInfo.ExtendList?.find(
    (item) => item.Key === 'MultipleBookingAndGrabSegmentation'
  )?.Value;

  if (multipleBookingAndGrabSegmentation) {
    const multipleBooking = JSON.parse(multipleBookingAndGrabSegmentation);
    const relationOrder =
      multipleBooking.relationOrderInfoList[0].ticketInfoList[0];
    if (multipleBooking.currentRouteSequence == 1) {
      params.aStation = relationOrder.arriveStation;
    } else {
      params.dStation = relationOrder.departStation;
      const departDateTime = relationOrder.departDateTime;
      params.dDate = `${departDateTime.substring(
        0,
        4
      )}-${departDateTime.substring(4, 6)}-${departDateTime.substring(6, 8)}`;
    }
  }

  if (type === 'list-cal') {
    let tmp = params.aStation;
    params.aStation = params.dStation;
    params.dStation = tmp;
  }
  let query = util.outparamsToString(util.getOutParams(params));
  let path = '/pages/train/list/list';
  if (type === 'list-cal') {
    query += '&return=1';
  }
  let routeObj = {
    url: `${path}?${query}`,
  };

  const page = cwx.getCurrentPage();
  page.navigateTo(routeObj);
}

function getTicketInfo({ orderInfo }) {
  return orderInfo.TicketInfos[0];
}

/*处理价格约数*/
function dealPriceInt(price) {
  let decimal = price - parseInt(price);
  if (decimal > 0.5) {
    return parseInt(price) + 1;
  } else if (decimal == 0.5) {
    return price;
  } else if (decimal < 0.5 && decimal > 0) {
    return parseInt(price);
  } else {
    return price;
  }
}

function costTimeString(minits) {
  let hour,
    min,
    timestr,
    day = Math.floor(minits / (24 * 60));
  if (day) {
    // hour = Math.floor((minits - (24 * 60)) / 60)
    // min = minits - day * (24 * 60) - hour * 60
    // timestr = day + '天' + hour + '小时' + min + '分'
    hour = Math.floor((minits / 60) % 24);
    min = Math.floor(minits % 60);
    timestr = day + '天' + hour + '时' + min + '分';
  } else {
    hour = Math.floor((minits / 60) % 24);
    min = Math.floor(minits % 60);
    timestr = hour ? hour + '时' + min + '分' : min + '分';
  }

  return timestr;
}
function handleMemPas(data = []) {
  let members = [];
  if (shared && shared.tmpFailPsg && shared.tmpFailPsg.length) {
    data = data.concat(shared.tmpFailPsg);
  }
  data = data.filter(
    (item) => item && (item.CNName || item.ENFirstName || item.ENLastName)
  );
  _.each(data, (p) => {
    let psg = {};

    psg.Birthday = p.Birthday;
    psg.CNName = p.CNName;
    psg.ENFirstName = p.ENFirstName;
    psg.ENLastName = p.ENLastName;
    psg.IdentityNo = p.IdentityNo;
    psg.IdentityType = p.IdentityType; // 即一种 cardTypes
    psg.IsENName = p.IsENName;
    psg.IsSelf = p.IsSelf;
    psg.PassengerID = p.PassengerID;
    psg.PassengerType = p.PassengerType; // 乘客类型 1：成人 2：儿童 3：学生
    psg.CheckStatus = p.CheckStatus;
    psg.CheckStatusName = p.CheckStatusName;
    psg.Nationality = p.Nationality;
    psg.NationalityName = p.NationalityName;
    psg.CountryCode = p.CountryCode;

    psg.ename = p.ENLastName + ' ' + p.ENFirstName;
    psg.birth = (p.Birthday && p.Birthday.split(' ')[0]) || '';
    psg.IsBind = p.IsBind;
    psg.IdentityLimitDate = p.IdentityLimitDate || '';
    psg.noDataType = p.IdentityNoDataType || p.noDataType || 0;
    psg.noMaskData = p.IdentityNoMaskData || p.noMaskData || '';
    psg.IdentityNoIsMatch = !!p.IdentityNoIsMatch;
    psg.MobilePhone = p.MobilePhone;
    psg.Email = p.Email;
    // 学生转换弹窗：添加字段判断是否转换为学生
    psg.convertStu = p.convertStu;
    // 过滤不支持的证件类型
    let text = cardTypes[p.IdentityType];
    if (text) {
      psg.idcard = {
        type: p.IdentityType,
        no: p.IdentityNo,
        text: cardTypes[p.IdentityType],
        noDataType: p.IdentityNoDataType || p.noDataType || 0,
        noMaskData: p.IdentityNoMaskData || p.noMaskData || '',
        IdentityNoIsMatch: !!p.IdentityNoIsMatch,
      };
    } else {
      psg.idcard = {};
    }

    psg.isChild = psg.PassengerType == 2;
    psg.needMobile = !psg.MobilePhone;
    psg.needEmail = !psg.Email;

    // 根据 isENName 决定 name
    psg.pasName =
      (psg.IsENName && (psg.ENFirstName || psg.ENLastName)) || !psg.CNName
        ? psg.ename
        : psg.CNName;

    if (psg.isChild || (psg.idcard.text && psg.idcard.no)) {
      members.push(psg);
    }
  });

  return members;
}

/**
 * 将信息不全乘客放在最后
 * @param {Passenger[]} data
 */
function sortMemPas(data) {
  let all = [];
  let validPas = data.filter((p) => {
    return p.idcard.text && p.idcard.no;
  });
  let invalidPas = data.filter((p) => {
    return !(p.idcard.text || p.idcard.no);
  });
  all = validPas.concat(invalidPas);

  return all;
}

function goReward(self) {
  self.navigateTo({
    url: '../summerdetail/summerdetail',
  });
}

function showLicense(self) {
  self.navigateTo({
    url: `../../webview/webview`, // 注意路径 这里是放在booking文件夹里使用的
    data: {
      url: 'https://pages.ctrip.com/ztrip/mp/licence/index.html',
    },
  });
}

function getHours() {
  return new Array(25)
    .fill()
    .map((item, index) => (index > 9 ? `${index}:00` : `0${index}:00`));
}

/**
 * promise resolved after {ms}
 * @param {number} ms
 */
function wait(ms = 0, route) {
  const curPage = cwx.getCurrentPage();
  let timeoutId;
  if (route && curPage.route !== route) {
    clearTimeout(timeoutId);
  } else {
    const deferred = util.getDeferred();
    timeoutId = setTimeout(deferred.resolve, ms);

    return {
      promise: deferred.promise,
      timeoutId,
    };
  }
}

/**
 * 判断当前时区是不是UTC+8
 */
function isUTC8() {
  const timezoneOffset = new Date().getTimezoneOffset();

  return timezoneOffset === -480;
}

/**
 * https://developers.weixin.qq.com/blogdetail?action=get_post_info&docid=000ea80cd78de80e9946942cb51401&highline=%E7%89%88%E6%9C%AC%E5%8F%B7
 * @example compareVersion('1.11.0', '1.9.9') // => 1 // 1 表示 1.11.0 比 1.9.9 要新
 * @example compareVersion('1.11.0', '1.11.0') // => 0 // 0 表示 1.11.0 和 1.11.0 是同一个版本
 * @example compareVersion('1.11.0', '1.99.0') // => -1 // -1 表示 1.11.0 比 1.99.0 要老
 * @param {*} v1
 * @param {*} v2
 */
function compareVersion(v1, v2) {
  v1 = v1.split('.');
  v2 = v2.split('.');
  let len = Math.max(v1.length, v2.length);
  while (v1.length < len) {
    v1.push('0');
  }
  while (v2.length < len) {
    v2.push('0');
  }
  for (let i = 0; i < len; i++) {
    let num1 = parseInt(v1[i]);
    let num2 = parseInt(v2[i]);
    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }
  }

  return 0;
}

/**
 * 判断微信版本号是否高于等于指定版本
 * @param {*} v
 */
function isVersionGte(v) {
  const { version = '0.0.0' } = cwx.getSystemInfoSync();

  return compareVersion(version, v) >= 0;
}

function canAddMiniapp() {
  const { platform = '' } = cwx.getSystemInfoSync();

  return platform.toLowerCase() === 'ios' && isVersionGte('6.7.1');
}

/**
 * 生成与某一个路径绑定的 timer 函数，离开页面就会自动清除定时器
 * @param {*} timerFn
 * @param {*} route
 */
function safeInPageTimerFn(timerFn, route) {
  let id;

  return (fn, ts) => {
    const _fn = () => {
      const curPage = cwx.getCurrentPage();
      if (curPage.route != route) {
        clearTimeout(id);
      } else {
        return fn();
      }
    };
    id = timerFn(_fn, ts);

    return id;
  };
}

/**
 * 去除后台下发文案中的标签，只留下纯文本
 */
function filterOutUnsupportTags(text) {
  return text.replace(/<.*?>(.*?)<\/.*?>/g, '$1');
}

/**
 * 将 key=value 添加到 search 里
 * 因为跳转H5页面的时候框架没有针对hash处理，会添加在hash后边，所以此处也不对hash进行处理
 */
function addSearch(url, key, value) {
  let result = '';
  if (url.includes(`${key}=`)) {
    let reg = new RegExp(`${key}=([^=&]*)`);
    url = url.replace(reg, `${key}=${value}`);
  } else {
    if (!url.includes('?')) {
      result += '?';
    } else {
      result += '&';
    }
    result += `${key}=${value}`;
  }

  return url + result;
}

function insertActionLog(actionName, code) {
  let params = {};
  let requestTime = new cDate().format('YmdHis');
  let channel = shared.channel;
  let deviceId = cwx.clientID;
  let logKey = '25pfgff7kn7z9rea5tdznyaerkh7agkt';
  let sign = `${requestTime}${channel}${actionName}${deviceId}${logKey}`;
  sign = cwx.md5 && cwx.md5(sign);
  if (!sign) {
    return;
  }
  params.channel = channel;
  params.code = code;
  params.actionName = actionName;
  params.appVersion = WXVersion;
  params.luaVersion = '';
  params.deviceId = deviceId;
  params.sign = sign.toLowerCase();
  params.reqTime = requestTime;
  InsertActionLog(params, (res) => {
    console.log('InsertActionLog', res);
  });
}

function getLowerCaseKeyObject(obj) {
  if (!obj || typeof obj !== 'object') {
    return null;
  }

  if (Object.prototype.toString.call(obj) === '[object Array]') {
    let correctCaseRes = [];
    correctCaseRes = obj.map((item) => {
      return typeof item === 'object' ? getLowerCaseKeyObject(item) : item;
    });

    return correctCaseRes;
  } else {
    let correctCaseRes = {};
    Object.keys(obj).forEach((key) => {
      let correctKey = '';
      if (key === 'ResponseHead' || key === 'ResponseStatus') {
        correctCaseRes[key] = obj[key];
        return;
      }
      correctKey = key[0].toLowerCase() + key.substring(1);

      if (typeof obj[key] === 'object') {
        correctCaseRes[correctKey] = getLowerCaseKeyObject(obj[key]);
      } else {
        correctCaseRes[correctKey] = obj[key];
      }
    });

    return correctCaseRes;
  }
}

// 两数组获取不同部分
function getArrDiff(a, b) {
  return a
    .concat(b)
    .filter((v, i, arr) => arr.indexOf(v) === arr.lastIndexOf(v));
}
// 获取当前距离明天 0点0分 还有多少分钟
function getNextDayTimeOut() {
  let d = new Date();
  d.setDate(new Date().getDate() + 1);
  const diff = d.setHours(0, 0, 0) - Date.now();
  return Math.floor(diff / 1000 / 60);
}

function openNationality(options = {}, callback) {
  const { title = '选择国家/地区' } = options;
  const loadNation = async () => {
    if (TrainStationStore.getAttr('mainNationList')) return;
    try {
      const res = await util.promisifyModel(getConfigByKeysModel)({
        keys: ['nationality-dictionary'],
      });
      res.resultCode === 1 &&
        TrainStationStore.setAttr('mainNationList', {
          data: res.configs[0].data,
          timeout: 60 * 24 * 30,
        });
    } catch (e) {
      console.log('获取国籍失败', e);
    }
  };
  const gotoNation = () => {
    const citydata = {
      inlandCities:
        { cityMainList: TrainStationStore.getAttr('mainNationList')?.data } ||
        {},
      interCities: {},
    };

    const handleSearch = (val, tab, cb) => {
      let all = [];
      for (const key in citydata.inlandCities.cityMainList) {
        if (/[A-Z]+/.test(key))
          all = all.concat(citydata.inlandCities.cityMainList[key]);
      }
      const v = val.toUpperCase();
      const result = all.filter((c) => {
        return (
          c.cityName.indexOf(v) > -1 || c.code.indexOf(v) > -1 || c.anchor === v
        );
      });
      cb(result);
    };

    cwx.component.city(
      {
        title,
        handleSearch,
        loadData(callback) {
          callback(citydata);
        },
        isShowCurrentPosition: false,
      },
      (obj) => {
        callback(obj);
      }
    );
  };
  loadNation().then(gotoNation);
}

function stringifyQuery(obj, withoutEncode) {
  let result = '';
  for (let key in obj)
    if (obj.hasOwnProperty(key)) {
      const val = obj[key];
      if (Array.isArray(val)) {
        for (let i = 0; i < val.length; i++) {
          result +=
            '&' +
            key +
            '=' +
            (withoutEncode ? val[i] : encodeURIComponent(val[i]));
        }
      } else {
        result +=
          '&' + key + '=' + (withoutEncode ? val : encodeURIComponent(val));
      }
    }
  return result.replace('&', '');
}

function encodeAES(text) {
  const key = cwx.aes.enc.Utf8.parse('-!@QWaszx#^GDFUN');
  const iv = cwx.aes.enc.Utf8.parse('09,.34ajoydfuEEi');
  const encryptText = cwx.aes.AES.encrypt(cwx.aes.enc.Utf8.parse(text), key, {
    mode: cwx.aes.mode.CBC,
    padding: cwx.aes.pad.Pkcs7,
    iv,
  });
  return encryptText.toString();
}

function getRectDomHeight(ele) {
  //获取点击元素的信息,ele为传入的id
  return new Promise((resolve, reject) => {
    let query = wx.createSelectorQuery();
    query
      .selectAll(ele)
      .boundingClientRect(function (res) {
        resolve(res.map((item) => item.height));
      })
      .exec();
  });
}
function calcOverflowStatus(ele) {
  return new Promise((resolve, reject) => {
    const query = wx.createSelectorQuery();
    query.selectAll(ele).boundingClientRect();
    query.exec((res) => {
      resolve(res);
    });
  });
}

function debounce(fn, wait, immediate) {
  let timer = null;
  return function (...args) {
    const _this = this;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    if (immediate && !timer) {
      fn.apply(_this, args);
    }

    timer = setTimeout(() => {
      fn.apply(_this, args);
    }, wait);
  };
}

export default util;
