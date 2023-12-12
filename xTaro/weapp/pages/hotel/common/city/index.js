import HPromise from '../hpage/hpromise';

import ModelUtil from '../utils/model.js';
import DateUtil from '../utils/date.js';
import hrequest from '../hpage/request';

function escapeRegExp (str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSuggestingItemParts (name, inputValue) {
    const parts = [];
    if (name) {
        const keyword = inputValue || '';
        const re = new RegExp(escapeRegExp(keyword), 'gi');
        const separator = '|~|';
        const processStr = name.replace(re, separator + keyword + separator);
        const pArr = processStr.split(separator) || [];
        pArr.forEach(function (item) {
            item && parts.push(item);
        });
    }

    return parts;
}

function getSuggestingItemPartsEn (nameEn, inputValue) {
    const partsEn = [];
    if (nameEn) {
        const keyword = inputValue || '';
        const re = new RegExp(escapeRegExp(keyword), 'gi');
        const separator = '|~|';
        const processStr = nameEn.replace(re, matchValue => separator + matchValue + separator);
        const pArr = processStr.split(separator) || [];
        pArr.forEach(function (item) {
            item && partsEn.push({
                name: item,
                isValueEqual: item.toLowerCase() === keyword.toLowerCase()
            });
        });
    }

    return partsEn;
}

function sortDestinationData (inputValue = '', data = []) {
    return data.map(({ id, name, nameEn, type, typeName, isOversea, regionInfo, topSearchKeywords, startPrice = {} }) => {
        let lat, lon, idData, hotelId;
        const {
            cityId, cityName, newDisplayText,
            timeZone: tzone,
            districtId: did
        } = regionInfo;

        if (id) {
            [idData, lat, lon] = id.split('|');
            if (type === 64) {
                [, hotelId] = idData.split('-');
            }
        }

        return {
            name, // 搜索结果显示名称
            nameEn,
            dtype: type, // 类型
            typeName, // 地标名
            lat, // 纬度
            lon, // 经度
            hotelId, // 酒店id
            newDisplayText, // 搜索结果地区文案
            tzone,
            did,
            cityId,
            cityName,
            isOversea,
            type: isOversea === 1 ? 2 : 1, // 国内海外
            currentTab: isOversea ? '1' : '0',
            key: id,
            parts: getSuggestingItemParts(name, inputValue),
            partsEn: getSuggestingItemPartsEn(nameEn, inputValue),
            topSearchKeywords: topSearchKeywords || [],
            startPrice: startPrice || {}
        };
    });
}

// function convertSearchResponse (inputValue, { destinationList = [] }) {
//     return sortDestinationData(inputValue, destinationList.slice(0, 10));
// }

function fotMatCity (data, type) {
    const city = {
        cityId: data.id,
        cname: data.name,
        cPY: data.py,
        cJP: data.jp,
        cfrl: data.firstLetter,
        ctryId: data.countryId,
        did: data.districtId,
        seo: data.seo,
        type,
        cityName: data.name
    };
    return city;
}

function resetCityMainList (listdata, type) {
    const mainListData = {};

    for (let i = 0; i < listdata.length; i++) {
        const firstLetter = listdata[i].firstLetter;
        const list = listdata[i] && listdata[i].cityList;
        const cityListData = [];
        list.forEach((item) => {
            cityListData.push(fotMatCity(item, type));
        });
        mainListData[firstLetter] = cityListData;
    }

    return mainListData;
}

function forMatData (citydata) {
    const cityData = {
        inlandCities: {
            historyCities: [],
            hotCities: [],
            cityMainList: {}
        },
        interCities: {
            historyCities: [],
            hotCities: [],
            cityMainList: {}
        }
    };

    const inlandHotCitys = (citydata.inlandCitiesOrigin && citydata.inlandCitiesOrigin.hotCityList) || [];
    const interHotCitys = (citydata.interCitiesOrigin && citydata.interCitiesOrigin.hotCityList) || [];
    inlandHotCitys && inlandHotCitys.forEach((item) => {
        cityData.inlandCities.hotCities.push(fotMatCity(item, 1));
    });
    interHotCitys && interHotCitys.forEach((item) => {
        cityData.interCities.hotCities.push(fotMatCity(item, 2));
    });

    cityData.inlandCities.cityMainList = resetCityMainList(citydata.inlandCitiesOrigin.cityGroupList, 1);
    cityData.interCities.cityMainList = resetCityMainList(citydata.interCitiesOrigin.cityGroupList, 2);

    return cityData;
}

export default {
    doRequest: function (onSuccess, onError) {
        const tasks = [];
        const citydata = {};
        tasks.push(
            new HPromise((resolve) => {
                hrequest.hrequest({
                    url: ModelUtil.serveUrl('cityList'),
                    data: { oversea: false },
                    success: function (result) {
                        resolve(result.data);
                    }
                });
            })
        );

        tasks.push(
            new HPromise((resolve) => {
                hrequest.hrequest({
                    url: ModelUtil.serveUrl('cityList'),
                    data: { oversea: true },
                    success: function (result) {
                        resolve(result.data);
                    }
                });
            })
        );

        HPromise.all(tasks).then((options) => {
            citydata.inlandCitiesOrigin = {
                hotCityList: options[0] && options[0].hotCityList,
                cityGroupList: options[0] && options[0].cityGroupList
            };
            citydata.interCitiesOrigin = {
                hotCityList: options[1] && options[1].hotCityList,
                cityGroupList: options[1] && options[1].cityGroupList
            };
            const data = forMatData(citydata);
            onSuccess && onSuccess(data);
        });
    },
    doSearch: function (params, onSuccess, onError) {
        if (!params) return;
        const word = params.word ? params.word.trim() : '';
        const reqData = {
            contentType: 'json',
            word,
            hourroom: params.hourroom || 0
        };
        if (params.checkin) {
            reqData.checkin = DateUtil.formatTime('yyyyMMdd', params.checkin);
        }
        if (params.checkout) {
            reqData.checkout = DateUtil.formatTime('yyyyMMdd', params.checkout);
        }
        // 用户定位信息
        const userInfo = params.user;
        if (userInfo && userInfo.cityId && userInfo.lat) {
            reqData.userCityId = userInfo.cityId;
            reqData.userPosition = {
                lat: userInfo.lat,
                lon: userInfo.lng
            };
        }

        hrequest.hrequest({
            url: ModelUtil.serveUrl('getdestination'),
            data: reqData,
            success: function (result) {
                if (result && result.data && result.data.ResponseStatus && result.data.destinationList && (result.data.ResponseStatus.Ack === 0 || result.data.ResponseStatus.Ack === 'Success')) {
                    onSuccess && onSuccess(sortDestinationData(word, result.data.destinationList), result.data);
                } else {
                    onError && onError(result);
                }
            },
            fail: function (error) {
                onError && onError(error);
            }
        });
    }
};
