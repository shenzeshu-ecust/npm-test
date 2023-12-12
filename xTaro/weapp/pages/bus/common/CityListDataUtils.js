import { Pservice, cwx } from './index';

import debounce from './debounce';

export function type(obj) {
    var ret = '';
    if (obj === null) {
        ret = 'null';
    } else if (obj === undefined) {
        ret = 'undefined';
    } else {
        var t = Object.prototype.toString.call(obj);
        var arr = t.match(/^\[object (\w+?)\]$/);
        if (arr) {
            ret = arr[1].toLowerCase();
        } else {
            ret = t;
        }
    }
    return ret;
}
export function deepCopy(obj) {
    var ret;
    switch (type(obj)) {
        case 'array':
            ret = obj.map(deepCopy);
            break;
        case 'object':
            ret = {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    ret[key] = deepCopy(obj[key]);
                }
            }
            break;
        case 'date':
            ret = new Date(+obj);
            break;
        default:
            ret = obj;
            break;
    }
    return ret;
}

export const BUS_KEY_HISTORY_TO = 'BUS_HISTORY_TO';
export const BUS_KEY_HISTORY_FROM = 'BUS_HISTORY_FROM';
export const BUS_KEY_STATIONS_SAVETIME = 'BUS_STATIONS_SAVETIME';
export const BUS_KEY_BUS_STATIONS = 'BUS_STATIONS';

export const BUS_KEY_HISTORY_LIST = 'BUS_HISTORY_LIST';

var hongkongFilter = function (val) {
    if (!val) return;
    if (
        val == '九龙' ||
        val == '香港西九龙' ||
        val == '香港红磡' ||
        val == '香港'
    ) {
        return '中国 - ' + val;
    } else {
        return val;
    }
};

function getDisplayedStr(nm, keyword = '') {
    if (keyword && keyword.length > 0) {
        const reg = new RegExp(`${keyword}`, 'g');
        let tempStr = nm.replace(reg, ($0) => `|${$0}|`);
        const tempArr = tempStr.split('|');
        const displayedStrArr = tempArr
            .filter((item) => {
                return item.length > 0;
            })
            .map((item) => ({
                text: item,
                style: keyword.indexOf(item) >= 0 ? 'highlight' : 'normal',
            }));
        return displayedStrArr;
    } else {
        return [
            {
                text: nm,
                style: 'normal',
            },
        ];
    }
}

async function getFromCityList(params = { cityName: '' }) {
    let fromCityList = getFromCityListFromStore();
    if (!fromCityList || fromCityList.length == 0) {
        fromCityList = await Pservice.getFromCityListSOA(params)
            .then((res) => {
                let cityList = res.return || [];
                return cityList;
            })
            .catch((err) => {
                return [];
            });
        if (fromCityList.length > 0) {
            saveFromCityListToStore(fromCityList);
        }
    }

    return fromCityList;
}

async function getToCityList(params = { fromCity: '', fromStation: '' }) {
    let toCityList = await Pservice.getToCityListSOA(params)
        .then((res) => {
            let list = res.return || [];

            return list.map(function (item) {
                var d = {
                    cs: item.citySort,
                    gd: item.grade,
                    nm: item.spotName || item.name,
                    py: item.pinyin,
                    sp: item.shortPinyin,
                    ct: item.cityType || '',
                    id: item.id || '',
                    pn: item.province,
                };
                return d;
            });
        })
        .catch((err) => {
            return [];
        });
    return toCityList;
}

// 格式化suggest数据
function formatSuggestList(suggestList = [], searchText = '', isFrom) {
    if (suggestList.length == 0) {
        return [
            {
                cityName: searchText,
                srcCity: searchText,
                srcStation: '',
                forceSearch: true,
            },
        ];
    }

    let matchedList = [];

    suggestList.forEach((item) => {
        if (item.cityName) {
            let city = {
                dis: getDisplayedStr(item.cityName, item.keyWord),
                cityName: hongkongFilter(item.cityName),
                province: item.pName || '',
                srcCity: item.cityName,
                keyWord: item.keyWord,
                srcStation: '',
                cityId: item.cityId,
            };
            if (item.sl && item.sl.length > 0) {
                city.stations = item.sl.map((station) => {
                    return {
                        dis: getDisplayedStr(station.name, station.keyWord),
                        cityName: hongkongFilter(station.name),
                        srcCity: item.cityName,
                        srcStation: station.name,
                        tag: station.tag,
                        bizType: station.bizType,
                        cityType: station.bizType == 2 ? 'pointbus' : '',
                        tagList: station.tagList,
                    };
                });
            }
            matchedList.push(city);
        }
    });

    return matchedList;
}

function getSuggestFunction(isFrom) {
    let requestFunction = isFrom
        ? Pservice.fromCitySuggest
        : Pservice.toCitySuggest;
    return async function (params = { key: '' }) {
        return requestFunction(params)
            .then((res) => {
                let result = res.data;
                let searchData = formatSuggestList(result, params.key, isFrom);
                return searchData;
            })
            .catch((err) => {
                return [];
            });
    };
}

function formatAndMergeHistory(cityList, key) {
    let cityListData = formatCityData(cityList);
    let historyCities = getHistoryCity(key);
    cityListData.inlandCities.historyCities = historyCities;
    return cityListData;
}

function getHistoryCity(key) {
    // add history city
    var toList = cwx.getStorageSync(key) || [];
    var historyCities = [];
    toList.forEach(function (item) {
        historyCities.push({
            cityName: item,
        });
    });
    return historyCities;
}

function formatCityData(data) {
    let hotCityList = [],
        mainList = {},
        wordArr = [];
    // 先排个序
    for (let i = 0, len = data.length; i < len; i++) {
        let item = data[i];
        // 脏数据
        if (!item.nm || !item.sp) {
            continue;
        }
        // hot city
        if (item.gd == 1) {
            hotCityList.push({
                province: item.pn || '',
                cityName: item.nm,
                cityID: item.id,
            });
        }
        // city groupby word
        var word = item.sp[0].toUpperCase();
        if (!mainList[word]) {
            mainList[word] = [];
            wordArr.push(word);
        }
        mainList[word].push({
            province: item.pn || '',
            cityName: item.nm,
            cityID: item.id,
        });
    }
    wordArr = wordArr.sort(function (a, b) {
        return a < b ? -1 : a == b ? 0 : 1;
    });
    // 为 cityMainList 排序
    var cityMainList = {};
    wordArr.forEach(function (item) {
        cityMainList[item] = mainList[item];
    });

    cityMainList['*'] = [];
    return {
        inlandCities: {
            hotCities: hotCityList,
            cityMainList: cityMainList,
        },
        interCities: {},
    };
}

function searchCity(key, sourceData) {}

function getFromCityListFromStore() {
    let saveTime = cwx.getStorageSync(BUS_KEY_STATIONS_SAVETIME),
        nowTime = new Date().getTime();
    let ValidTime = 5 * 60 * 1000;
    let data = cwx.getStorageSync(BUS_KEY_BUS_STATIONS);
    if (nowTime - saveTime < ValidTime && data) {
        return data;
    } else {
        return null;
    }
}

function saveFromCityListToStore(data) {
    cwx.setStorage({
        key: BUS_KEY_BUS_STATIONS,
        data: data,
    });
    cwx.setStorage({
        key: BUS_KEY_STATIONS_SAVETIME,
        data: new Date().getTime(),
    });
}

function showFromCityPage({ page, params, callback }) {
    showCityList({ mode: 'from', page, params, selectedCallback: callback });
}
function showToCityPage({ page, params, callback }) {
    showCityList({ mode: 'to', page, params, selectedCallback: callback });
}

const filter = function () {
    let str = this;
    str = str.replace(/^\s\s*/, '');
    let ws =
        /[`\s\n\t ~!@#$%^&*()+=|{}:;[\].<>/?~！@#￥%……&*（）——+|{}【】‘；：”“’。，、？'\u00a0\u0020\u3000\u2002\u2003\u8198]/g;

    let rs = '';
    for (let i = 0; i < str.length; i++) {
        rs = rs + str.substr(i, 1).replace(ws, '');
    }
    return rs;
};

function suggest(params, callback) {
    let matchList;
    let didCallback = false;
    let timeout = setTimeout(() => {
        if (params.isFrom) {
            matchList = getMatchedCityList(params.key, params.cityList);
        } else {
            matchList = getMatchedToCityList(params.key, params.cityList);
        }
        didCallback = true;
        callback(matchList);
    }, 500);

    let searchFromServer = async () => {
        matchList = await getSuggestFunction(params.isFrom)({
            key: params.key || '',
            fromCity: params.fromCity || '',
        });
        if (matchList.length > 0 && !didCallback) {
            clearTimeout(timeout);
            callback(matchList);
        }
    };
    searchFromServer();
}
const debouncedSuggest = debounce(suggest, 100);

function showCityList({ mode = 'from', page, params, selectedCallback }) {
    var self = this;

    let cityList = [];
    const getCityList = (callback) => {
        if (mode === 'from') {
            getFromCityList(params).then((list) => {
                cityList = list;
                let cityListData = formatAndMergeHistory(
                    cityList,
                    BUS_KEY_HISTORY_FROM
                );

                page.hideLoading();
                callback(cityListData);
            });
        } else {
            getToCityList(params).then((list) => {
                cityList = list;
                let cityListData = formatAndMergeHistory(
                    cityList,
                    BUS_KEY_HISTORY_TO
                );
                page.hideLoading();
                if (cityList.length == 0) {
                    page.showToast({
                        message: '暂无到达列表,换个出发城市试试',
                        icon: 'none',
                    });
                }
                callback(cityListData);
            });
        }
    };

    const citySelectedTraceUbtMetric = (metricData) => {
        let ubt_metric = {
            name: 102667,
            tag: {
                key: metricData.cityName,
                cityType: metricData.cityType,
                searchType: metricData.forceSearch ? 'forceSearch' : 'selected',
            },
            value: 1,
        };
        page.ubtMetric(ubt_metric);
    };

    const immediateCallback = (selectedcity = {}) => {
        let json =
            mode === 'from'
                ? {
                      from: selectedcity.srcCity || selectedcity.cityName || '',
                      fromCity:
                          selectedcity.srcCity || selectedcity.cityName || '',
                      fromStation: selectedcity.srcStation || '',
                      fromCityID:
                          selectedcity.cityID || selectedcity.cityId || '',
                      fromCityType: selectedcity.cityType || '',
                      BUS_SEARCH_KEY: params.BUS_SEARCH_KEY || 'BUS_SEARCH',
                  }
                : {
                      to: selectedcity.srcCity || selectedcity.cityName || '',
                      toCity:
                          selectedcity.srcCity || selectedcity.cityName || '',
                      toStation: selectedcity.srcStation || '',
                      toCityID:
                          selectedcity.cityID || selectedcity.cityId || '',
                      toCityType: selectedcity.cityType || '',
                      BUS_SEARCH_KEY: params.BUS_SEARCH_KEY || 'BUS_SEARCH',
                  };
        saveSInfo(json);
        citySelectedTraceUbtMetric({
            ...selectedcity,
            cityType: selectedcity.cityType || mode,
        });
        selectedCallback.call(page, json);
    };

    const data = {
        loadData: function (callback) {
            getCityList(callback);
        },
        handleSearch: function (inputValue, currentTab, callback) {
            inputValue = '' + (inputValue || '');
            if (inputValue) {
                inputValue = inputValue.toLowerCase();
            }

            inputValue = filter.call(inputValue);
            if (inputValue.length === 0) {
                callback([]);
                return;
            }
            debouncedSuggest(
                {
                    isFrom: mode === 'from',
                    key: inputValue || '',
                    cityList,
                    fromCity: params.fromCity || '',
                },
                (matchList) => {
                    callback(matchList);
                }
            );
        },
        selectedCityName: params.currentCity,
    };
    if (mode !== 'from') {
        data.isShowCurrentPosition = false;
    } else {
        data.handleCurrentPosition = (location, callback) => {
            locateCity()
                .then((res) => getLocationStationList(res))
                .then((res) => {
                    callback(res);
                });
        };
    }
    var currentPage = cwx.getCurrentPage();
    currentPage.navigateTo({
        url: '/pages/bus/city/index',
        data: data,
        immediateCallback: immediateCallback,
    });
}

function getLocationStationList({ cityName = '', geo }) {
    if (!cityName) {
        return Promise.resolve(null);
    } else {
        return Pservice.locationCityList({
            cityName,
            longitude: geo.longitude,
            latitude: geo.latitude,
            coordType: geo.coordType,
        })
            .then((res) => {
                console.log(res);
                let currentCity = res.data;

                return {
                    cityName: hongkongFilter(currentCity.nm),
                    srcCity: currentCity.nm,
                    cityID: currentCity.id,
                    hot: (currentCity.hot || []).map((city) => {
                        return {
                            cityName: hongkongFilter(city.nm),
                            secCity: city.nm,
                        };
                    }),
                    stations: (currentCity.sl || []).map((station) => {
                        return {
                            cityName: hongkongFilter(station.nm),
                            distance: station.distanceString || '',
                            srcCity: currentCity.nm,
                            srcStation: station.nm,
                            tag: station.tag,
                        };
                    }),
                };
            })
            .catch((err) => {
                return {
                    cityName,
                };
            });
    }
}
function locateCity() {
    return new Promise(function (resolve, reject) {
        cwx.locate.startGetCtripCity(function (resp) {
            if (!resp.error) {
                if (
                    resp.data &&
                    resp.data.CityEntities &&
                    resp.data.CityEntities.length > 0
                ) {
                    let cityName = resp.data.CityEntities[0].CityName;
                    let geo = resp.data.gpsInfo;
                    resolve({
                        cityName,
                        geo,
                    });
                } else {
                    resolve({ cityName: '' });
                }
            } else {
                resolve({ cityName: '' });
            }
        }, 'Bus-wx-lbs');
    });
}

// 搜索
function formatMatchedList(srcList) {
    srcList = srcList || [];
    srcList = srcList.sort(function (item1, item2) {
        return item1.cs * item1.gd < item2.cs * item2.gd ? -1 : 1;
    });
    var mFormated = [];
    srcList.forEach(function (item) {
        let city = {
            cityName: hongkongFilter(item.nm),
            province: item.pn,
            srcCity: item.nm,
            cityID: item.id || '',
            srcStation: '',
        };

        var mStations = item.sl || [];
        mStations = mStations.sort(function (item1, item2) {
            return item1.gd - item2.gd;
        });
        city.stations = mStations.map(function (sItem) {
            return {
                cityName: hongkongFilter(sItem.nm),
                srcCity: item.nm,
                cityID: item.id || '',
                srcStation: sItem.nm,
            };
        });
        mFormated.push(city);
    });
    return mFormated;
}

function isMatchedCity(srcStr, srcObj) {
    srcObj = srcObj || {};
    var patten = null;
    try {
        patten = new RegExp('(^' + srcStr + '|\\|' + srcStr + ')', 'i');
    } catch (ex) {
        return false;
    }
    if ((srcObj.nm || '').indexOf(srcStr) >= 0) {
        return true;
    }
    if (patten.test((srcObj.py || '') + '|' + (srcObj.sp || ''))) {
        return true;
    }
    return false;
}

function getMatchedStations(srcStr, srcList) {
    srcList = srcList || [];
    var matchedList = [];
    if (!srcStr || !srcList || srcList.length <= 0) {
        return matchedList;
    }
    var patten = null;
    try {
        patten = new RegExp('(^' + srcStr + '|\\|' + srcStr + ')', 'i');
    } catch (ex) {
        return matchedList;
    }
    srcList.forEach(function (item) {
        item = item || {};
        var bFlag =
            (item.nm || '').indexOf(srcStr) >= 0 ||
            patten.test((item.py || '') + '|' + (item.sp || ''));

        bFlag && matchedList.push(deepCopy(item));
    });
    return matchedList;
}

// 搜索出发城市
function getMatchedCityList(srcStr, srcList) {
    srcList = srcList || [];
    var matchedList = [],
        patten = null;

    if (!srcStr) {
        return matchedList;
    }

    srcList.forEach(function (item) {
        item = item || {};
        if (isMatchedCity(srcStr, item)) {
            matchedList.push(deepCopy(item));
        } else {
            var srcStations = item.sl || [];
            var mStations = getMatchedStations(srcStr, srcStations);
            if (!!mStations && mStations.length > 0) {
                var mItem = deepCopy(item);
                mItem.sl = mStations;
                matchedList.push(mItem);
            }
        }
    });
    var mFormated = formatMatchedList(matchedList);
    // 强搜逻辑暂时去掉
    if (mFormated.length == 0) {
        mFormated.push({
            cityName: srcStr,
            srcCity: srcStr,
            tag: '仍然搜索',
            srcStation: '',
            forceSearch: true,
        });
    }
    return mFormated;
}
// 到达城市匹配城市搜索
function getMatchedToCityList(inputValue, dataList) {
    var matchList = dataList.filter(function (item) {
        var isMatchName = item.nm.indexOf(inputValue) > -1;
        var isMatchPinYin =
            item.py.indexOf(inputValue) == 0 ||
            item.sp.indexOf(inputValue) == 0;
        return isMatchName || isMatchPinYin;
    });
    if (matchList) {
        // 按照热门优先级
        matchList = matchList.sort(function (item1, item2) {
            return item1.cs * item1.gd < item2.cs * item2.gd ? -1 : 1;
        });
    } else {
        matchList = [];
    }
    var formatList = [];
    matchList.forEach(function (item) {
        formatList.push({
            cityName: hongkongFilter(item.nm) + (item.ct ? '-旅游专线' : ''),
            cityID: item.id || '',
            srcCity: item.nm,
            cityType: item.ct,
            province: item.pn,
            srcStation: '',
        });
    });
    if (formatList.length == 0) {
        formatList.push({
            cityName: inputValue,
            srcCity: inputValue,
            srcStation: '',
            forceSearch: true,
        });
    }
    return formatList;
}

const isInArray = function (item, list) {
    let result = list.find(function (listitem) {
        return listitem == item;
    });

    return !!result;
};

function saveSInfo(json) {
    let BUS_SEARCH_KEY = json.BUS_SEARCH_KEY || 'BUS_SEARCH';
    let o_search = cwx.getStorageSync(BUS_SEARCH_KEY) || {};
    o_search = Object.assign({}, o_search, json);
    cwx.setStorage({
        key: BUS_SEARCH_KEY,
        data: o_search,
    });

    if (BUS_SEARCH_KEY === 'BUS_SEARCH') {
        // 出发
        if (json.fromCity) {
            let fromList = cwx.getStorageSync('BUS_HISTORY_FROM') || [];
            if (!isInArray(json.fromCity, fromList)) {
                fromList.unshift(json.fromCity);
                if (fromList.length > 3) {
                    fromList = fromList.slice(0, 3);
                }
                cwx.setStorage({
                    key: 'BUS_HISTORY_FROM',
                    data: fromList,
                });
            }
        }
        // 到达
        if (json.toCity) {
            let toList = cwx.getStorageSync('BUS_HISTORY_TO') || [];
            if (!isInArray(json.toCity, toList)) {
                toList.unshift(json.toCity);
                if (toList.length > 3) {
                    toList = toList.slice(0, 3);
                }
                cwx.setStorage({
                    key: 'BUS_HISTORY_TO',
                    data: toList,
                });
            }
        }
    }
}

function saveHistoryList(data, callback) {
    let BUS_HISTORY_LIST_KEY =
        data.BUS_HISTORY_LIST_KEY || BUS_KEY_HISTORY_LIST;
    var historyList = cwx.getStorageSync(BUS_HISTORY_LIST_KEY) || [];
    var index = -1;
    historyList.forEach((item, idx) => {
        if (item.fromCity == data.fromCity && item.toCity == data.toCity) {
            index = idx;
        }
    });
    if (index >= 0) {
        console.log(index);
        historyList.splice(index, 1);
    } else {
    }
    historyList.unshift(data);
    if (historyList.length > 5) {
        historyList = historyList.slice(0, 5);
    }
    cwx.setStorage({
        key: BUS_HISTORY_LIST_KEY,
        data: historyList,
    });

    callback(historyList);
}

export default {
    getFromCityList,
    getToCityList,
    searchCity,
    showFromCityPage,
    showToCityPage,
    saveSInfo,
    saveHistoryList,
    locateCity,
};
