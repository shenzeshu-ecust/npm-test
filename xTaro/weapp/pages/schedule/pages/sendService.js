import {
  cwx
} from '../../../cwx/cwx.js';

import dateUtil from './dateUtils.js'

/*
{
  cityId:
  smartTripIds: 卡片Id
}
*/
//分享列表服务
export const shareListSearch = function(parameter) {
  return new Promise(function(resolve, reject) {
    cwx.request({
      url: '/restapi/soa2/14912/json/SharedCardsSearch',
      data: {
        clientTimeZone: dateUtil.fetchPhoneTimeZone(),
        locatedCityId: parameter.cityId,
        smartTripIds: parameter.smartTripIds,
        fromUid: parameter.fromUid
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack === 'Success' && res.data.result === 0) {
          resolve(res.data);
          console.log('shareList=====', res.data)
        } else {
          reject('SharedCardsSearch接口报错');
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  })
}

export const fetchCard = function(smartTripId) {
  return new Promise(function(resolve, reject) {
    if (smartTripId && smartTripId > 0) {
      cwx.request({
        url: '/restapi/soa2/14912/json/scheduleCardDetailGet',
        data: {
          head: {
            cver: '',
            extension: [{
              // 'uid': cwx.
            }]
          },
          smartTripId: smartTripId,
          requestSource: 0,
          clientTimeZone: dateUtil.fetchPhoneTimeZone(),
          token: cwx.schedule.timelineToken
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data && res.data.result === 0 && res.data.card) {
            res.data.card.smartTripId = smartTripId;
            resolve(res.data.card);
          } else {
            reject('scheduleCardDetailGet接口报错');
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    } else {
      reject('scheduleCardDetailGet接口报错');

    }
  })
}

export const fetchShareCard = function(smartTripId, fromUid) {
  return new Promise(function(resolve, reject) {
    if (smartTripId && smartTripId > 0) {
      cwx.request({
        url: '/restapi/soa2/14912/json/sharedCardDetailGet',
        data: {
          head: {
            cver: '',
          },
          smartTripId: smartTripId,
          fromUid,
          clientTimeZone: dateUtil.fetchPhoneTimeZone()
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data && res.data.result === 0 && res.data.card) {
            res.data.card.smartTripId = smartTripId;
            resolve(res.data.card);
          } else {
            reject('fetchShareCard接口报错');
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    } else {
      reject('fetchShareCard接口报错');
    }
  })
}

export const getTravelPlanInfo = function(travelPlanId, source) {
  return new Promise(function(resolve, reject) {
    if (travelPlanId) {
      cwx.request({
        url: '/restapi/soa2/14912/json/AiSmartRouteDetail',
        data: {
          source,
          smartRouteId: travelPlanId
        },
        success: (res) => {
          const { result, smartRouteList } = res.data;
          if (result === 0 && smartRouteList) {
            resolve(res.data);
          } else {
            reject('GetTravelPlanInfo接口报错');
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    } else {
      reject('GetTravelPlanInfo接口报错');
    }
  })
}

export const updateTravelPlanInfo = function(travelPlanId) {
  return new Promise(function(resolve, reject) {

    cwx.request({
      url: '/restapi/soa2/14912/json/UpdateTravelPlanInfo',
      data: {
        requestType: 5,
        travelPlanId
      },
      success: (res) => {
        const { result, travelPlanId } = res.data;
        if (result === 0) {
          resolve(travelPlanId);
        } else {
          reject('UpdateTravelPlanInfo接口报错');
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  })
}


export const calcDistance = function(routes) {
  return new Promise(function(resolve, reject) {

    if (routes) {

      const pointId = 0;
      const requests = routes.map(({ from, to }, index) => ({
        requestId: index,
        points: [
          { coordinate: from, pointId },
          { coordinate: to, pointId }]
      }));

      cwx.request({
        url: '/restapi/soa2/14912/json/GetTrafficDistanceInfo',
        data: {
          requests
        },
        success: (res) => {
          const { result, trafficInfosList } = res.data;
          if (result === 0 && trafficInfosList) {
            const disList = routes.map((item, index) => {
              const tInfo = trafficInfosList.find(
                ({ requestId }) => requestId === index
              );

              if (tInfo) {
                const { trafficInfos } = tInfo;
                return trafficInfos[0];
              }

              return 0;
            });
            resolve(disList);
          } else {
            reject('GetTrafficDistanceInfo接口报错');
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    } else {
      reject('GetTrafficDistanceInfo接口报错');
    }
  })
}

export const addCard = function(smartTripId) {
  return new Promise(function(resolve, reject) {
    cwx.request({
      url: '/restapi/soa2/14912/json/AddSmartTrip',
      data: {
        isTokenRequired: false,
        phoneTimeZone: dateUtil.fetchPhoneTimeZone(),
        source: 1,
        importInfo: {
          smartTripId: smartTripId
        },
      },
      success: function(res) {
        if (res.statusCode === 200 && res.data && res.data.result === 0) {
          resolve();
        } else {
          let resultMessage = res.data.resultMessage
          reject({
            'resultMessage': resultMessage
          });
        }
      },
      fail: function(error) {
        reject(error);
      }
    })
  });
}

export const searchFlightSegment = function(flightNo, departAirportCode, arriveAirportCode, departDate) {
  return new Promise(function(resolve, reject) {
    cwx.request({
      url: '/restapi/soa2/14912/json/FlightSegmentSearch',
      data: {
        flightNo: flightNo,
        departAirportCode: departAirportCode,
        arriveAirportCode: arriveAirportCode,
        departDate: departDate
      },
      success: function(res) {
        if (res.statusCode === 200 && res.data && res.data.result === 0) {
          resolve(res.data.flightSegmentList);
        } else {
          resolve();
        }
      },
      fail: function(error) {
        reject(error);
      }
    })
  });
}

export const searchAirport = function(keyWord) {
  return new Promise(function(resolve, reject) {
    cwx.request({
      url: '/restapi/soa2/14912/json/SearchAirport',
      data: {
        keyWord: keyWord
      },
      success: function(res) {
        if (res.statusCode === 200 && res.data && res.data.result === 0) {
          resolve(res.data.airportList);
        } else {
          resolve();
        }
      },
      fail: function(error) {
        reject(error);
      }
    })
  });
}

export const addFlightCard = function(flightNo, departureAirportCode, arrivalAirportCode, departureDate) {
  return new Promise(function(resolve, reject) {
    cwx.request({
      url: '/restapi/soa2/14912/json/AddSmartTrip',
      data: {
        isTokenRequired: false,
        phoneTimeZone: dateUtil.fetchPhoneTimeZone(),
        source: 0,
        generalAddInfo: {
          addType: 3,
          flight: {
            flightNo: flightNo,
            departureDate: departureDate,
            departureAirportCode: departureAirportCode,
            arrivalAirportCode: arrivalAirportCode
          }
        },
      },
      success: function(res) {
        if (res.statusCode === 200 && res.data && res.data.result === 0) {
          if (res.data.smartTripId && res.data.smartTripId > 0) {
            resolve(res.data.jsSmartTripId);
          }
          if (res.data.smartTripId == 0 && res.data.duplicateSmartTripId > 0) {
            resolve(res.data.jsDuplicateSmartTripId);
          }
        } else {
          let resultMessage = res.data.resultMessage
          reject({
            'resultMessage': resultMessage
          });
        }
      },
      fail: function(error) {
        reject(error);
      }
    })
  });
}

export const batchAddCards = function(smartTripIds, canShowPassengers) {
  let tripIdList = smartTripIds.split(",");
  return new Promise(function(resolve, reject) {
    cwx.request({
      url: '/restapi/soa2/14912/json/BatchImportSmartTrip',
      data: {
        smartTripIdList: tripIdList,
        canShowPassengers
      },
      success: function(res) {
        if (res.statusCode === 200 && res.data && res.data.result === 0) {
          resolve(res.data);
        } else {
          reject({
            'resultMessage': "添加失败"
          });
        }
      },
      fail: function(error) {
        reject(error);
      }
    })
  });
}

export const getTrainStopStationList = function(trainName, departureStationName, arrivalStationName, departureTime) {
  return new Promise(function(resolve, reject) {
    cwx.request({
      url: '/restapi/soa2/14912/json/trainStopListSearch',
      data: {
        trainName: trainName || null,
        departureStation: departureStationName || null,
        arrivalStation: arrivalStationName || null,
        departureDate: departureTime || null
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.result === 0 && res.data.trainStopList) {
          resolve(res.data.trainStopList);
        } else {
          resolve(null);
        }
      },
      fail: (err) => {
        resolve(null);
      }
    });
  })
}

export const addTrainCard = function(trainNo, departureStationName, arrivalStationName, departureDate) {
  return new Promise(function(resolve, reject) {
    cwx.request({
      url: '/restapi/soa2/14912/json/AddSmartTrip',
      data: {
        isTokenRequired: false,
        phoneTimeZone: dateUtil.fetchPhoneTimeZone(),
        source: 0,
        generalAddInfo: {
          addType: 4,
          train: {
            trainNo: trainNo,
            departureDate: departureDate,
            departureStationName: departureStationName,
            arrivalStationName: arrivalStationName
          }
        },
      },
      success: function(res) {
        if (res.statusCode === 200 && res.data && res.data.result === 0) {
          if (res.data.smartTripId && res.data.smartTripId > 0) {
            resolve(res.data.jsSmartTripId);
          }
          if (res.data.smartTripId == 0 && res.data.duplicateSmartTripId > 0) {
            resolve(res.data.jsDuplicateSmartTripId);
          }
        } else {
          let resultMessage = res.data.resultMessage
          reject({
            'resultMessage': resultMessage
          });
        }
      },
      fail: function(error) {
        reject(error);
      }
    })
  });
}

export const searchTrainStation = function(keyword) {
  // console.log("****Call Service: searchTrainStation");
  return new Promise(function(resolve, reject) {
    cwx.request({
      url: '/restapi/soa2/14912/json/SearchTrainStation',
      data: {
        keyword: keyword
      },
      success: function(res) {
        if (res.statusCode === 200 && res.data && res.data.result === 0) {
          resolve(res.data.trainStationList);
        } else {
          resolve();
        }
      },
      fail: function(error) {
        reject(error);
      }
    })
  });
}

export const trainSearch = function(departStation, arrivalStation, departDate) {
  console.log("****Call Service: trainSearch");
  return new Promise(function(resolve, reject) {
    cwx.request({
      url: '/restapi/soa2/14912/json/TrainSearch',
      data: {
        departureStationName: departStation,
        arrivalStationName: arrivalStation,
        departureDate: departDate
      },
      success: function(res) {
        if (res.statusCode === 200 && res.data && res.data.result === 0) {
          resolve(res.data.trainList);
        } else {
          resolve();
        }
      },
      fail: function(error) {
        reject(error);
      }
    })
  });
}

export const getHotCityList = function(count) {
  // console.log("****Call Service: getHotCityList");
  return new Promise(function(resolve, reject) {
    cwx.request({
      url: '/restapi/soa2/14912/json/GetHotCityList',
      data: {
        count: count
      },
      success: function(res) {
        if (res.statusCode === 200 && res.data && res.data.result === 0) {
          resolve(res.data.cityList);
        } else {
          resolve();
        }
      },
      fail: function(error) {
        reject(error);
      }
    })
  });
}

export const updateTravelPlanDate = function(parameter) {
  cwx.request({
    url: '/restapi/soa2/14912/json/UpdateTravelPlanInfo',
    data: {
      requestType: 3,
      travelPlanId: parameter.travelPlanId,
      title: parameter.title,
      startDate: parameter.startDate,
    },
    success: function(res) {
      if (res.statusCode === 200 && res.data && res.data.result === 0) {
        parameter.callback(true, res.data);
      } else {
        parameter.callback(false);
      }
    },
    fail: function(error) {
      parameter.callback(false);
    }
  })
}


export const deleteTravelPlan = function(parameter) {
  cwx.request({
    url: '/restapi/soa2/14912/json/UpdateTravelPlanInfo',
    data: {
      requestType: 4,
      travelPlanId: parameter.travelPlanId,
    },
    success: function(res) {
      if (res.statusCode === 200 && res.data && res.data.result === 0) {
        parameter.callback(true, res.data);
      } else {
        parameter.callback(false);
      }
    },
    fail: function(error) {
      parameter.callback(false);
    }
  })
}

export const saveTravelPlan = (parameter) => {
  return new Promise((resolve, reject) => {
    cwx.request({
      url: '/restapi/soa2/14912/json/UpdateTravelPlanInfo',
      data: parameter,
      success: function(res) {
        if (res.statusCode === 200 && res.data && res.data.result === 0) {
          resolve(res.data)
        } else {
          reject();
        }
      },
      fail: function(error) {
        reject();
      }
    })
  })
}

export const getAuthInfo = function(parameter) {
  return new Promise((resolve, reject) => {
    cwx.request({
      url: '/restapi/soa2/14912/SchUserAuthGet',
      data: {
        serviceVersion: 0 // 直接传0
      },
      success: function(res) {
        if (res.statusCode === 200 && res.data && res.data.result === 0) {
          resolve(res.data);
        } else {
          reject('');
        }
      },
      fail: function(error) {
        reject('');
      }
    })
  })
 
}
