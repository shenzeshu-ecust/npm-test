import {
  ctsFormatFromStringDate,
  CTS_DATE_FORMATE
} from '../../ctsDateUtil.js';

export const isSearchConditionValid = function(searchCondition) {
  return searchCondition != undefined &&
    searchCondition != null &&
    searchCondition.length > 0 &&
    searchCondition[0] != " " &&
    searchCondition[searchCondition.length - 1] != " ";
}

export const HISTORY_SELECTED_AIRPORT_KEY = 'historySelectedAirport';

export const getFormatTimeForShow = function(datetime) {
  if (!datetime || datetime === '00010101000000') {
    return '--';
  } else {
    return ctsFormatFromStringDate(datetime, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_06);
  }
}

export const getFormatTimeForCalendar = function(datetime) {
  if (!datetime || datetime === '00010101000000') {
    return null;
  } else {
    return ctsFormatFromStringDate(datetime, CTS_DATE_FORMATE.FORMATE_02, CTS_DATE_FORMATE.FORMATE_01);
  }
}

export const getFormatTimeForAddSuccss = function(datetime) {
  if (!datetime || datetime === '00010101000000') {
    return null;
  } else {
    return ctsFormatFromStringDate(datetime, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_03);
  }
}

export const valicateAirportIsSame = function(departAirportCode, arriveAirportCode) {
  return isSearchConditionValid(departAirportCode) &&
    isSearchConditionValid(arriveAirportCode) &&
    departAirportCode == arriveAirportCode;
}

export const isFlightNoValid = function(flightNo) {
  let reg = new RegExp("^[0-9]*$");
  if (reg.test(flightNo)) {
    wx.showToast({
      icon: "none",
      title: "请输入完整的航班号",
    });
    return false;
  }

  reg = new RegExp('\\b[A-Z0-9a-z]{0,7}\\b');
  if (!(reg.test(flightNo))) {
    wx.showToast({
      icon: "none",
      title: "请填写正确的航班号",
    });
    return false;
  }
  return true;
}

export const processLongText = function(text) {
  let textLength = text.length;
  if (textLength <= 5) {
    return text;
  } else if (textLength > 5 && textLength <= 10) {
    let firstPart = text.substring(0, 5);
    let secondPart = text.substring(5, textLength);
    return firstPart + "\r\n" + secondPart;
  } else {
    let firstPart = text.substring(0, 5);
    let secondPart = text.substring(5, 9);
    return firstPart + "\r\n" + secondPart + "...";
  }
}