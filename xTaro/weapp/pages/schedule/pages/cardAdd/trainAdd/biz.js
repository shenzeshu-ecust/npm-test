import {
  ctsFormatFromStringDate,
  CTS_DATE_FORMATE,
  ctsFormate01DateWithString
} from '../../ctsDateUtil.js';

export const getStationNameList = function(stations) {
  if (!stations) {
    return null;
  }

  return stations.map(item => item.name);
}

export const getHotCityNameList = function(cities) {
  if (!cities) {
    return [];
  }

  return cities.map(item => item.name);
}

export const getTrainList = function(soaTrainList) {
  if (!soaTrainList || soaTrainList.length == 0) {
    return null;
  }

  return soaTrainList.map(item => {
    let result = {
      "arrivalStationName": item.arrivalStationName,
      "arrivalTime": getFormatTime(item.arrivalTime),
      "departureStationName": item.departureStationName,
      "departureTime": getFormatTime(item.departureTime),
      "trainName": item.trainName,
      "duration": timeDiff(item.arrivalTime, item.departureTime)
    };

    return result;
  })
}

export const getGtTrainList = function(allTrains) {
  if (!allTrains || allTrains.length == 0) {
    return null;
  }

  return allTrains.filter(item => item.trainName && (item.trainName.charAt(0) === 'G' || item.trainName.charAt(0) === 'D'));
}

export const getToday = function() {
  let now = new Date();
  return now.getFullYear() + "-" + _ctsAppendZeroString(now.getMonth() + 1) + "-" + _ctsAppendZeroString(now.getDate());
}

export const getEndDate = function() {
  let date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.getFullYear() + "-" + _ctsAppendZeroString(date.getMonth() + 1) + "-" + _ctsAppendZeroString(date.getDate());
}

export const timeDiff = function(endTimeStr, beginTimeStr) {
  if (!endTimeStr || endTimeStr.length !== 14 || '00010101000000' === endTimeStr) {
    console.log('endTimeStr error')
    return null;
  }

  if (!beginTimeStr || beginTimeStr.length !== 14 || '00010101000000' === beginTimeStr) {
    console.log('beginTimeStr error')
    return null;
  }

  let endTime = ctsFormate01DateWithString(endTimeStr);
  let startTime = ctsFormate01DateWithString(beginTimeStr);

  let diff = endTime.getTime() - startTime.getTime();
  let hours = Math.floor(diff / (3600 * 1000));
  let leave = Math.floor(diff % (3600 * 1000));
  let minutes = Math.floor(leave / (60 * 1000));

  if (hours == 0) {
    return minutes + '分';
  }
  if (minutes == 0) {
    return hours + '时';
  }
  return hours + '时' + minutes + '分';
}

export const getFormatTimeForDateBox = function(datetime) {
  if (!datetime || datetime === '00010101000000') {
    return null;
  } else {
    return ctsFormatFromStringDate(datetime, CTS_DATE_FORMATE.FORMATE_02 /*yyyy-MM-dd*/ , CTS_DATE_FORMATE.FORMATE_03 /*MM月dd日*/ );
  }
}

export const getFormatTimeForAddService = function(datetime) {
  if (!datetime || datetime === '00010101000000') {
    return null;
  } else {
    return ctsFormatFromStringDate(datetime, CTS_DATE_FORMATE.FORMATE_02 /*yyyy-MM-dd*/ , CTS_DATE_FORMATE.FORMATE_01 /*yyyyMMddHHmmss*/ );
  }
}

export const getFormatTimeForAddSuccss = function(datetime) {
  if (!datetime || datetime === '00010101000000') {
    return null;
  } else {
    return ctsFormatFromStringDate(datetime, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_03);
  }
}

const getFormatTime = function(datetime) {
  if (!datetime || '00010101000000' === datetime) {
    return '--';
  } else {
    return ctsFormatFromStringDate(datetime, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_06 /*hh:mm*/ );
  }
}

const getFormatDate = function(datetime) {
  if (!datetime || '00010101000000' === datetime) {
    return '--';
  } else {
    return ctsFormatFromStringDate(datetime, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_03)
  }
}

const _ctsAppendZeroString = function(number) {
  if (number < 10) {
    return '0' + number;
  } else {
    return number;
  }
}