export const CTS_DATE_FORMATE = {
  FORMATE_01: 'yyyyMMddHHmmss',
  FORMATE_02: 'yyyy-MM-dd',
  FORMATE_03: 'MM月dd日',
  FORMATE_06: 'hh:mm'
}

export const ctsFormatFromStringDate = function(stringDate, originFormate, toFormate) {
  if (stringDate && originFormate && toFormate) {
    let dateObj = _ctsDateFromString(stringDate, originFormate);
    let dateString = _ctsFormatStringForDate(dateObj, toFormate);
    return dateString
  }
  return null;
}

export const ctsFormate01DateWithString = function(stringDate) {
  if (stringDate) {
    let pattern = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/;
    let formatedDate = stringDate.replace(pattern, '$1/$2/$3 $4:$5:$6');
    let date = new Date(formatedDate);
    return date;
  }
  return null;
}

export const ctsFormate02DateWithString = function(stringDate) {
  if (stringDate) {
    let pattern = /(\d{4})(\d{2})(\d{2})/;
    let formatedDate = stringDate.replace(pattern, '$1/$2/$3');
    let date = new Date(formatedDate);
    return date;
  }
  return null;
}

const _ctsDateFromString = function(stringDate, dateFormate) {
  if (stringDate && stringDate.length > 0) {
    if (dateFormate === CTS_DATE_FORMATE.FORMATE_01) {
      return ctsFormate01DateWithString(stringDate);
    } else if (dateFormate === CTS_DATE_FORMATE.FORMATE_02) {
      return ctsFormate02DateWithString(stringDate);
    } else {
      
    }
  }
  return null;
}

const _ctsFormatStringForDate = function(date, dateFormate) {
  if (date) {
    if (dateFormate === CTS_DATE_FORMATE.FORMATE_01) {
      return _ctsFormat01StringWithDate(date)
    } else if (dateFormate === CTS_DATE_FORMATE.FORMATE_02) {
      return _ctsFormat02StringWithDate(date)
    } else if (dateFormate === CTS_DATE_FORMATE.FORMATE_03) {
      return _ctsFormat03StringWithDate(date)
    } else if (dateFormate === CTS_DATE_FORMATE.FORMATE_06) {
      return _ctsFormat06StringWithDate(date);
    } 
  }
  return null;
}

export const _ctsFormat01StringWithDate = function(date) {
  if (!date) {
    return null;
  }

  return date.getFullYear() + "" + _ctsAppendZeroString(date.getMonth() + 1) + "" + _ctsAppendZeroString(date.getDate()) + "000000";
}

const _ctsFormat02StringWithDate = function(date) {
  if (!date) {
    return null;
  }
  return date.getFullYear() + "-" + _ctsAppendZeroString(date.getMonth() + 1) + "-" + _ctsAppendZeroString(date.getDate());
}

const _ctsFormat03StringWithDate = function(date) {
  if (!date) {
    return null;
  }
  return (date.getMonth() + 1) + "月" + _ctsAppendZeroString(date.getDate()) + "日";
}

const _ctsFormat06StringWithDate = function(date) {
  return _ctsAppendZeroString(date.getHours()) + ":" + _ctsAppendZeroString(date.getMinutes());
}

const _ctsAppendZeroString = function(number) {
  if (number < 10) {
    return '0' + number;
  } else {
    return number;
  }
}