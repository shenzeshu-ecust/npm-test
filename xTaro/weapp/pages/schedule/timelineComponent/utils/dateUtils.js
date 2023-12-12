function isTimeValid(timeStr) {
  return timeStr && timeStr.length === 14 && timeStr.substr(0, 8) != "00010101";
}


function monthForTimeStr(timeStr) {
  if (isTimeValid(timeStr)) {
    var month = parseInt(timeStr.substr(4, 2));
    if (month < 10) {
      return "0" + month;
    }
    return month;
  }
  return null;
}

function monthForTimeStr2(timeStr) {
  if (isTimeValid(timeStr)) {
    var month = parseInt(timeStr.substr(4, 2));
    return month;
  }
  return null;
}

function dayForTimeStr(timeStr) {
  if (isTimeValid(timeStr)) {
    var day = parseInt(timeStr.substr(6, 2));
    if (day < 10) {
      return "0" + day;
    }
    return day;
  }
  return null;
}

function dayForTimeStr2(timeStr) {
  if (isTimeValid(timeStr)) {
    var day = parseInt(timeStr.substr(6, 2));
    return day;
  }
  return null;
}

function hourForTimeStr(timeStr) {
  if (isTimeValid(timeStr)) {
    return timeStr.substr(8, 2);
  }
  return null;
}

function hourForTimeStr2(timeStr) {
  if (isTimeValid(timeStr)) {
    return parseInt(timeStr.substr(8, 2));
  }
  return null;
}

function minuteForTimeStr(timeStr) {
  if (isTimeValid(timeStr)) {
    return timeStr.substr(10, 2);
  }
  return null;
}

function timeStr2TimeStandard(stringDate) {
  if (stringDate) {
    var pattern = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/;
    var formatedDate = stringDate.replace(pattern, '$1/$2/$3 $4:$5:$6');
    let date = new Date(formatedDate);
    return date;
  }
  return null;
}

function fetchPhoneTimeZone() {
  let d = new Date()
  let timeOffset = d.getTimezoneOffset();
  let gmtHours = parseInt(timeOffset / 60);
  let prefix = 'GMT-';
  if (gmtHours < 0) {
    prefix = 'GMT+';
    gmtHours = -gmtHours;
  }
  return prefix + gmtHours + ':' + (Math.abs(timeOffset) % 60);
}

function daysBetweenDate(earlyDate, lateDate) {
  if (isTimeValid(earlyDate) && isTimeValid(lateDate)) {
    let earlyDateObj = new Date(parseInt(yearForTimeString(earlyDate)),
      parseInt(monthForTimeStr(earlyDate)) - 1,
      parseInt(dayForTimeStr(earlyDate))
    );

    let lateDateObj = new Date(parseInt(yearForTimeString(lateDate)),
      parseInt(monthForTimeStr(lateDate)) - 1,
      parseInt(dayForTimeStr(lateDate))
    );
    let days = (lateDateObj.getTime() - earlyDateObj.getTime()) / (24 * 3600 * 1000);
    return days;
  }
  return '';
}

function yearForTimeString(timeStr) {
  if (isTimeValid(timeStr)) {
    return timeStr.substr(0, 4);
  }
  return null;
}

function weekForTimeString(timeStr){
  let date = timeStr2TimeStandard(timeStr);
  let week = '';
  if(date){
    switch(date.getDay())
    {
      case 0:
        week = '星期天';
        break;
      case 1:
        week = '星期一';
        break;
      case 2:
        week = '星期二';
        break;
      case 3:
        week = '星期三';
        break;
      case 4:
        week = '星期四';
        break;
      case 5:
        week = '星期五';
        break;
      case 6:
        week = '星期六';
        break;
      default:
        break;
    } 
  }
  return week;
}

function isSameDate(firstDate, secondeDate){
  firstDate = firstDate || '';
  secondeDate = secondeDate || '';
  if (firstDate.length < 8 || secondeDate.length < 8){
    return false;
  }
  return firstDate.substr(0, 8) === secondeDate.substr(0, 8);
}

/////
function hourMinuteForTimeStr(timeStr) {
  if (isTimeValid(timeStr)) {
    return timeStr.substr(8, 2) + ":" + timeStr.substr(10, 2);
  }
  return null;
}

//2019-02-21
function formatDateForTimeStr(timeStr) {
  if (isTimeValid(timeStr)) {
    return yearForTimeString(timeStr) + '-' + monthForTimeStr(timeStr) + '-' + monthForTimeStr(timeStr);
  }
  return null;
}

module.exports = {
  isTimeValid: isTimeValid,
  monthForTimeStr: monthForTimeStr,
  dayForTimeStr: dayForTimeStr,
  hourForTimeStr: hourForTimeStr,
  minuteForTimeStr: minuteForTimeStr,
  timeStr2TimeStandard: timeStr2TimeStandard,
  fetchPhoneTimeZone: fetchPhoneTimeZone,
  hourMinuteForTimeStr: hourMinuteForTimeStr,
  daysBetweenDate: daysBetweenDate,
  monthForTimeStr2: monthForTimeStr2,
  dayForTimeStr2: dayForTimeStr2,
  hourForTimeStr2,
  isSameDate,
  weekForTimeString,
  formatDateForTimeStr,
}