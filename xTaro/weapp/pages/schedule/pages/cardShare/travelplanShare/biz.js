import { ctsFormate01DateWithString, _ctsFormat01StringWithDate } from '../../ctsDateUtil.js';
import {calcDistance} from "../../sendService";
import { hourMinuteForTimeStr } from "../../dateUtils"

export const getDistanceKey = function (from, to) {
  const { latitude: fLat, longitude: fLon } = from;
  const { latitude: tLat, longitude: tLon } = to;

  const key = `${fLat};${fLon};${tLat};${tLon}`;
  return key;
}

export const getPoiLocation = function (travelPlanData) {
  if (!travelPlanData || travelPlanData.result !== 0) {
    throw new Error('trainCardInfo error');
  }

  const travelPlanInfo = travelPlanData?.travelPlanList[0];
  const { dailyPathInfoList } = travelPlanInfo;

  if (!dailyPathInfoList || dailyPathInfoList.length === 0) {
    return [];
  }

  dailyPathInfoList?.forEach((path) => {
    const { pathElementList } = path;

    const points = [];

    for (let i = 1; i < pathElementList.length; i += 1) {
      const poiItem = pathElementList[i];
      const lastPOIItem = pathElementList[i - 1];
      const { coordinate: from } = lastPOIItem;
      const { coordinate: to } = poiItem;

      if (from && to) {
        points.push({ from, to });
      }
    }

    return points;
  });
}

export const getAddedRequst = function (storedTraelPlanInfo) {
  const {title, startDate, destinationLit,  dailyPathInfoList:mdailyPathInfoList } = storedTraelPlanInfo;

  const cityDistrictList = destinationLit?.map(item => {
    const {cityId, districtId} = item;
    return {cityId, districtId};
  });

  const dailyPathInfoList = mdailyPathInfoList?.map(item => {
    const {pathId, dayNumber, memo, pathElementList:mpathElementList } = item;
    const pathElementList = mpathElementList?.map(element => {
      const { type, itemId } = element;
      return { type, itemId };
    });

    return {
      pathId,
      dayNumber,
      memo,
      pathElementList
    }
  });

  const request = {
    requestType: 1,
    title,
    startDate,
    cityDistrictList,
    dailyPathInfoList
  }

  return request;
}

const defaultImage = "https://pages.c-ctrip.com/schedule/photo/sku_wxshare_photo.png";

function onHandleComments(commentsnum) {
  if (commentsnum && !Number.isNaN(commentsnum)) {
      if (Number(commentsnum) < 10000) {
          return `${commentsnum}条点评`;
      }
      return `${(Number(commentsnum) / 10000).toFixed(1)}w条点评`;
  }
  return null;
}

function handleTitleTag(element) {
  const { 
    type, poiType, featureMap, poivalue
  } = element;
  let titleTag = '';
    if (type === 2) {
      const starLevel = featureMap?.drilllevel;
      if (starLevel === '1') titleTag = '金钻';
      else if (starLevel === '2') titleTag = '铂钻';
    } else {
      if (poiType === 1 && poivalue) titleTag = poivalue && poivalue.indexOf('A') !== -1 ? poivalue : `${poivalue}A`;
      else if (poiType === 5) titleTag = '机';
      else if (poiType === 6) titleTag = '火';
      else if (poiType === 6) titleTag = '港';
      else if (poiType === 7) titleTag = '汽';
    }
    return titleTag;
}

function handleTrafficItem(element) {
    const { traffic } = element;
    const { 
        type: trafficType, icon, airlineName, trafficNo,
        departureCityName, arrivalCityName,
        departureTerminal, arrivalTerminal,
        departureTime, arrivalTime,
    } = traffic;
    let title
    let depart = departureTerminal || '';
    if (trafficType === 1) {
      title = `${airlineName} ${trafficNo}`;
    } else if (trafficType === 2) {
        title = `${trafficNo} ${departureCityName}-${arrivalCityName}`;
    } else {
        title = `汽车票 ${departureCityName}-${arrivalCityName}`;
    }

    if (depart.length > 6) depart = `${depart.substr(0, 6)}...`;

    const handleTime = (onlyStart) => {
        const start_time = hourMinuteForTimeStr(departureTime);
        const end_time = hourMinuteForTimeStr(arrivalTime);
        let addDayNum = '';
        if (departureTime && arrivalTime) {
            addDayNum = Number(arrivalTime.slice(0, 8)) - Number(departureTime.slice(0, 8));
        }
        const numDay = addDayNum ? `(+${addDayNum})` : '';
        return onlyStart ? `${start_time}出发` : `${start_time} - ${end_time} ${numDay}`;
    }
    return {
        trafficType,
        icon,
        title,
        depart,
        arrival: arrivalTerminal,
        timeStr: handleTime(trafficType === 3)
    }
}

export const loadNeededCardData = function (travelPlanInfo, distanceMap) {
  const { 
    smartRouteId, title, image, routeDays, poiNum, 
    dailyPathInfoList, startDate 
  } = travelPlanInfo;
  const dailyList = [];
  dailyPathInfoList?.forEach((path) => {
    const { dayNumber, memo, pathElementList, cityName } = path;
    const overList = [];
    const districtList = [];
    const elementList = pathElementList?.map((element, index) => {
      const { 
        poiId, type, poiType, itemName, image, lightspots, introduce, recommendReason,
        score, commentsnum, highlightRank, tags, playSpendTime, address, 
        zonename, distance, featureMap, ticketPrice, averageCost, 
        destinationInfo,detailUrl
      } = element;

      // poi, hotel, traffic 公用数据
      const commonData = {
        type,
        distance: createDistanceText(element),
        showUpLine: (pathElementList.length > 1 && index > 0) || [4001, 4002].includes(type),
        showDownLine: pathElementList.length > 1 && index < pathElementList.length -1
      };

      if (type === 3) { // 处理交通卡片
          const trafficData = handleTrafficItem(element);
        return {
            ...commonData,
            ...trafficData
        }
      }

      // 概览信息
      overList.push(itemName);
      // 拼接当天目的地名称
      if (destinationInfo && districtList.indexOf(destinationInfo.districtName) === -1) {
        districtList.push(destinationInfo.districtName);
      }
      // 4001 4002到达和返程服务返回没有destinationInfo字段,取cityName
      if ([4001, 4002].includes(type) && !districtList.includes(cityName)) {
        districtList.push(cityName);
      }
      // 标题下的描述文案  poi绿色 food浅红
      let description = null;
      if (poiType === 1) description = lightspots;
      else if (poiType === 2) description = introduce || recommendReason;
      else if (poiType >= 5 && poiType <= 8) description = address;
      // 标签
      const tagList = [];
      if (highlightRank && highlightRank.length > 0) {
        tagList.push({
          tag: highlightRank,
          color: '#ff7700',
          backgroundColor: '#fff8f2',
        });
      }
      tags?.forEach(tag => {
        tagList.push({
          tag,
          color: '#0086f6',
          backgroundColor: '#f2f8fe',
        })
      })
      // poi：游玩时长   food：菜系
      let subInfo = '';
      if (poiType === 1 && playSpendTime) { 
        subInfo = `游玩约${playSpendTime}`;
      } else if (poiType === 2 && featureMap?.cuisinename) {
        subInfo = featureMap.cuisinename
      }

      const scoreN = Number(score);
      return {
        ...commonData,

        poiId,
        poiType, // poi、hotel类型卡片
        titleTag: handleTitleTag(element), // 标题同行后的tag
        itemName,
        image,
        description,
        score: score ? `${scoreN}分` : null,
        commentNum: onHandleComments(commentsnum),
        tagList,
        subInfo,
        leftBottomText: zonename ? `${zonename} · ${distance}` : distance,
        price: poiType === 1 ? ticketPrice : averageCost,
        detailUrl
      }
    });
    const districtNames = districtList.join('-');

    dailyList.push({
      dailyTitle: districtNames ? `${generateCurrentDayStr(startDate, dayNumber)}·${districtNames}` : `${generateCurrentDayStr(startDate, dayNumber)}`,
      memo,
      elementList,
      overList
    });
  });

  return {
    travelPlanId: smartRouteId,
    title,
    image: image ? image : defaultImage,
    daysCount: routeDays,
    poiNum,
    startEndDate: generateTimeStr(startDate, routeDays),
    dailyList,
    jumpAppUrl: 'ctrip://wireless/schedule?from=wechat&travelPlanId=' + smartRouteId
  };
}

const createDistanceText = (element) => {
  if (!element) return null;
  const { trafficType, trafficDistance, trafficTime } = element;
    if (!trafficType) return null;

  let result = '';
  if (trafficDistance > 0) {
    if (trafficTime !== 0) {
      const hour = Math.trunc(trafficTime / 60);
      if (hour < 1) { // 小于一小时
        result += `${trafficTime}分钟`;
      } else {
        const min = trafficTime % 60;
        if (min !== 0) {
          result += `${hour}时${min}分`;
        } else {
          result += `${hour}小时`;
        }
      }
    }

    if (trafficDistance !== 0) {
      let distanceTxt;
      if (trafficDistance > 1000) {
        distanceTxt = `相距${Math.round(trafficDistance / 100) / 10}km`;
      } else {
        distanceTxt = `相距${Math.round(trafficDistance)}m`;
      }
      result += `·${distanceTxt}`;
    }
    return {
      distanceText : result || '',
      type : trafficType || 0
    };
  }

  return { distanceText : '暂无距离，查看导航' };
}

const generateTimeStr = (startDate, dayCount) => {
  if(!startDate)return '';

  const dateFormatStr = str => `${str.slice(0, 4)}.${str.slice(4, 6)}.${str.slice(6, 8)}`;
  const startStr = dateFormatStr(startDate);
  if (dayCount < 2) {
    return startStr;
  }

  const date = ctsFormate01DateWithString(startDate);
  const endDate = new Date(date.setDate(date.getDate() + dayCount - 1));
  const end = _ctsFormat01StringWithDate(endDate);
  return `${startStr}-${dateFormatStr(end)}`;
}

const generateCurrentDayStr = (startDate, dayCount) => {
  if(!startDate) {
    return `第${dayCount}天`;
  }
  const dateFormatStr = str => `${str.slice(4, 6)}月${str.slice(6, 8)}日`;
  const startStr = dateFormatStr(startDate);
  if (dayCount < 2) {
    return startStr;
  }

  const date = ctsFormate01DateWithString(startDate);
  const endDate = new Date(date.setDate(date.getDate() + dayCount - 1));
  const end = _ctsFormat01StringWithDate(endDate);
  return dateFormatStr(end);
}
