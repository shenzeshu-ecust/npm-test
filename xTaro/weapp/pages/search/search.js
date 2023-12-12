import { cwx, CPage, __global } from '../../cwx/cwx.js';

const HOT_SEARCH_DOMIN = 'https://m.ctrip.com/restapi/soa2/14854/json/gethotsearchrespbysmallprogram';
const NEW_LENOVO = "https://m.ctrip.com/restapi/soa2/26872/search"
//定位传参用
const SOURCE_KEY = 'gloablsearch-slb';

var isClickTag = false;
var traceKey = 'wx_search_page';
var lat = '';
var lon = '';
var windowWidth = 375;
var windowHeight = 675;
var cityInfo = '';
var platform = cwx.wxSystemInfo.system.indexOf('iOS') > -1 ? 'ios' : 'android';
var resultPageUrl = '';
var personalRecommendSwitch = false;
var app = getApp()
CPage({
    pageId: '10650016415',
    searchIconType: "search",
    title: '搜索',
    // 白屏检测接入文档： http://tripdocs.nfes.ctripcorp.com/tripdocs/book?dynamicDir=189&docId=3192    张秋雨
    checkPerformance: true,  // 添加白屏检测标志位
    data: {
        showListView: false,
        loading: false,
        listTagWidth: 49,
        searhViewWidth: 0,
        listSightTagWidth: 49,
        focus: false,
        inputValue: "",
        listData: [],
        homeData: [],
        hotSearchData: {},
        isIOS: platform == 'ios' ? true : false,
    },
    onLoad: function (options) {
        // wx.setNavigationBarTitle({
        //   title: '携程旅行',
        // })

        this._refreshLocationInfo();

        var systeminfo = wx.getSystemInfoSync() || {};
        windowWidth = systeminfo.windowWidth || 375;
        windowHeight = systeminfo.windowHeight || 675;
        const { keyword = '' } = options;
        if (keyword.length > 0) {
            this.setData({
                inputValue: keyword,
                loading: true
            }, () => {
                this._lenovoRequest(keyword);
            })
        }
    },
    onShow: function () {
        cwx.setNavigationBarTitle({
            title: '携程旅行',
        })
        this._refreshLocationInfo()
        this.setData({
            listTagWidth: (windowWidth - 48 - 30 - 20) / 4,
            searhViewWidth: (windowWidth - 40 - 35),
            listSightTagWidth: (windowWidth - 48 - 20 - 15) / 3,
        })
        let self = this;
        try {
            cwx.getPRSetting().then(res => {
                personalRecommendSwitch = res?.personalRecommendSwitch || false;
                self._refreshHotWord();
            }).catch(err => {
                self._refreshHotWord();
            })
        } catch (error) {
            self._refreshHotWord();
        }
    },
    _refreshLocationInfo: function () {
        const cachedGeoPoint = cwx.locate.getCachedGeoPoint();
        if (!!cachedGeoPoint) {
            lat = cachedGeoPoint.latitude || '';
            lon = cachedGeoPoint.longitude || '';
        }
        const cachedCtripCity = cwx.locate.getCachedCtripCity();

        if (cachedCtripCity && cachedCtripCity.data && cachedCtripCity.data.CityEntities && cachedCtripCity.data.CityEntities.length > 0) {
            cityInfo = cachedCtripCity.data.CityEntities[0];
        }
    },
    _refreshHotWord: function () {
        var self = this;
        if (this.data.inputValue.length == 0) {
            self._refRequest();
        } else {
            this.setData({
                showListView: true,
            })
        }
    },
    onShareAppMessage: function () {
        this.ubtTrace(traceKey, {
            actionCode: 'c_share',
        })
        return {
            title: '搜索目的地/交通/景点/酒店',
            desc: '搜索目的地/交通/景点/酒店',
            path: '/pages/search/search'
        }
    },
    bindKeyInput: function (e) {
        this.setData({
            inputValue: e.detail.value,
            // loading:true
        })
        var input = this.data.inputValue;
        this._lenovoRequest(input);
    },
    upper: function (e) {
        // console.log(e)
    },
    lower: function (e) {
        // console.log(e)
    },
    scroll: function (e) {
        // console.log(e)
    },
    clearText: function () {
        this.setData({
            inputValue: "",
            showListView: false,
            listData: [],
            loading: false
        })
        this._refRequest();
        this.ubtTrace(traceKey, {
            actionCode: 'cleartext',
        })
    },
    searchBtnClick: function () {
        const { listData = [], inputValue = '' } = this.data;
        if (listData.length > 0 && inputValue.length > 0) {
            var firstItem = listData[0] || {};
            if (!firstItem) {
                return;
            }
            var historyItem = firstItem;
            var targetUrl = firstItem.url;
            if (resultPageUrl.length > 0 && resultPageUrl != firstItem.url) {
                historyItem = {
                    word: this.data.inputValue,
                    url: resultPageUrl
                };
                targetUrl = resultPageUrl;
            }

            this._addClickItemToHis(historyItem);
            this._gotoTargetPage(targetUrl);

            this.ubtTrace('c_wx_sb', {
                url: targetUrl || '',
                keyword: firstItem.word || '',
                type: firstItem.type || '',
                sort: 1,
                code: firstItem.code || '',
                cityId: cityInfo.cityID || '',
                lat: lat,
                lon: lon,
                inputkeyword: this.data.inputValue,
                clientId: cwx.clientID || '',
                OS: platform,
                queryrule: firstItem.queryrule,
            })
        }
    },
    cancelClick: function () {
        cwx.navigateBack();
        this.ubtTrace("c_wx_cancel", {
            actionCode: 'cancel',
        })
    },
    hotWordClick: function (e) {
        var itemData = e.currentTarget.dataset.itemdata || {};
        var isHistory = e.currentTarget.dataset.history || false;
        var sort = e.currentTarget.dataset.sort || 0;
        itemData.iconSrc = '';

        this._gotoTargetPage(itemData.url);

        var actionType = isHistory == 1 ? 'c_wx_his' : 'c_wx_hot';
        if (isHistory == 1) {
            this._addDataToHistory(itemData);
        }
        this.ubtTrace(actionType, {
            url: itemData.url || '',
            actionCode: actionType,
            keyword: itemData.historyWord || itemData.text || '',
            type: itemData.type || '',
            sort: sort + 1,
            cityId: cityInfo.cityID || '',
            lat: lat,
            lon: lon,
            clientId: cwx.clientID || '',
            OS: platform,
        })
    },
    deleteHistoryClick: function () {
        cwx.removeStorageSync("SEARCH_HISTORY_CLICK");
        this._updateDeleteView({});
        this.ubtTrace('c_wx_ch', {
            actionCode: 'c_ch',
            cityId: cityInfo.cityID || '',
            lat: lat,
            lon: lon,
            OS: cwx.wxSystemInfo.platform || "ios",
        })
    },
    listTagClick: function (e) {
        isClickTag = true;
        var tagData = e.currentTarget.dataset.info || {};
        this._addClickItemToHis(tagData);
        this._gotoTargetPage(tagData.url);

        this.ubtTrace('c_wx_ac', {
            URL: tagData.url || '',
            keyword: tagData.word || '',
            type: tagData.type || '',
            sort: 1,
            code: tagData.code || '',
            cityId: tagData.cityID || '',
            lat: lat,
            lon: lon,
            inputkeyword: this.data.inputValue,
            clientId: cwx.clientID || '',
            OS: platform,
            queryrule: tagData.queryrule,
        })

    },
    suggestItemClick: function (e) {
        if (isClickTag) {
            isClickTag = false;
            return;
        }
        var suggestData = e.currentTarget.dataset.info || {};
        var sort = e.currentTarget.dataset.sort || 0;
        this._addClickItemToHis(suggestData);
        this._gotoTargetPage(suggestData.url);
        if (!!suggestData.traceInfo) {
            this._sendExposefn(suggestData, "click");
        }
        this.ubtTrace('c_wx_ac', {
            url: suggestData.url || '',
            keyword: suggestData.word || '',
            type: suggestData.type || '',
            sort: sort + 1,
            code: suggestData.code || '',
            cityId: cityInfo.cityID || '',
            lat: lat,
            lon: lon,
            inputkeyword: this.data.inputValue,
            clientId: cwx.clientID || '',
            OS: platform,
        })
    },
    bindReplaceInput: function (e) {
        var value = e.detail.value;
        var pos = e.detail.cursor;
        if (pos != -1) {
            //光标在中间
            var left = e.detail.value.slice(0, pos);
            //计算光标的位置
            pos = left.replace(/11/g, '2').length;
        }

        //直接返回对象，可以对输入进行过滤处理，同时可以控制光标的位置
        return {
            value: value.replace(/11/g, '2'),
            cursor: pos
        }

        //或者直接返回字符串,光标在最后边
        //return value.replace(/11/g,'2'),
    },
    bindHideKeyboard: function (e) {
        if (e.detail.value === "123") {
            //收起键盘
            wx.hideKeyboard();
        }
    },
    _refRequest: function () {
        var self = this;

        if (this.data && this.data.hotSearchData && this.data.hotSearchData.itemList) {
            this._showHotSearchView(this.data.hotSearchData);
        } else {
            cwx.request({
                url: HOT_SEARCH_DOMIN,
                data: {
                    "action": "hotword",
                    "cityId": cityInfo.cityID || 0,
                    "clientId": cwx.clientID || '',
                    "clientSystem": "ios",
                    "coordAccuracy": "5.000000",
                    "from": "String",
                    "lat": lat || -180,
                    "lon": lon || -180,
                    "screenWidth": windowWidth,
                    "sheight": windowHeight,
                    "appVersion": "8.1.0",
                    "personalRecommendSwitch": personalRecommendSwitch
                },
                success: function (res) {
                    let respInfo = {};
                    if (res && res.data && res.data.respInfo) {
                        respInfo = res.data.respInfo || {}
                    }
                    let recHotSearch = self._configHotWordIcon(respInfo.recHotSearch || {}) || {};
                    self._showHotSearchView(recHotSearch);
                },
                fail: function (error) {
                    console.log(error);
                }
            })
        }
    },
    _getHighLightStrArray: function (str, highLights) {

        var outPutStr = str;
        for (var i = 0; i < highLights.length; i++) {
            var key = highLights[i];
            try {
                outPutStr = outPutStr.replace(new RegExp(`${key}`, 'g'), `%%${key}%%`);
            } catch (error) {

            }
        }
        return outPutStr.split('%%');
    },
    _processUrl: function (url = '') {
        if (!!url) {
            if (url.indexOf('http') < 0) {
                return url.indexOf('/') == 0 ? url : "/" + url;
            } else {
                return url;
            }
        } else {
            return '';
        }
    },

    _processData: function (data = {}, input) {

        var array = data.data || [];
        var highLights = data.highLights || [];

        if (undefined == array || array.length <= 0) {
            resultPageUrl = '';
            this.setData({
                showListView: true,
                listData: [],
                loading: false
            })
            return;
        }
        resultPageUrl = data.resultPageUrl || '';
        for (var i = 0; i < array.length; i++) {
            var cell = array[i] || {};
            cell.imgSrc = this._getImgeSrc(cell);
            cell.queryrule = data.queryRule || '';
            cell.highLights = highLights;

            cell.searchArray = this._getHighLightStrArray(cell.word, highLights);
            // 存放分割的每个自负是否需要高亮
            let highArray = [];
            cell.searchArray.map((item, k) => {
                highArray.push(cell.highLights.indexOf(item) > -1);
            })
            cell.highArray = highArray;
            cell.tempName = this._setTempName(cell.type);
            if (!!cell.traceInfo) {
                this._sendExposefn(cell, "show");
            }
        }
        this.setData({
            showListView: true,
            listData: array,
            loading: false
        })
    },

    _setTempName: function (type) {
        if (type === 'hotelstore') {
            return 'hotelStoreTmp';
        } else if (type === 'plantshipflag') {
            return 'plantshipflagTmp';
        } else if (type === 'author') {
            return 'authorTmp';
        }
        return 'listItemTmp';
    },

    _getIconSrc: function (iconType) {
        var iconSrc = "hot";
        var iconPath = "//images3.c-ctrip.com/search/native_images/search_icon_sr_";
        if (!!iconType) {
            if (iconType.indexOf("icon") == 0) {
                iconSrc = iconType.replace("icon", "");
            }
            return iconPath + iconSrc + ".png";
        }
        return "";
    },

    _getImgeSrc: function (cell = {}) {
        var imgSrc = "district";
        var type = cell.type || '';
        var imgPath = "//images3.c-ctrip.com/search/native_images/search_";
        if (!!type) {
            if (['car', 'bus'].indexOf(type) > -1) {
                imgSrc = "car";
            } else if (['travel', 'flighthotel'].indexOf(type) > -1) {
                imgSrc = "travel";
            } else if (['train'].indexOf(type) > -1) {
                imgSrc = "train";
            } else if (['sight'].indexOf(type) > -1) {
                imgSrc = "sight";
            } else if (['hotel'].indexOf(type) > -1) {
                imgSrc = "hotel";
            } else if (['plane'].indexOf(type) > -1) {
                imgSrc = "flight";
            } else if (['ticket'].indexOf(type) > -1) {
                imgSrc = "tiket";
            } else if (['group'].indexOf(type) > -1) {
                imgSrc = "tuan";
            } else if (['food'].indexOf(type) > -1) {
                imgSrc = "food";
            } else if (['shop'].indexOf(type) > -1) {
                imgSrc = "shop";
            } else if (['huodong', 'entertainment'].indexOf(type) > -1) {
                imgSrc = "fun";
            } else if (['cruise', 'port'].indexOf(type) > -1) {
                imgSrc = "ship";
            } else if (['inn'].indexOf(type) > -1) {
                imgSrc = "inn";
            } else if (['hotplaylist'].indexOf(type) > -1) {
                imgSrc = "netredspot";
            }
        }

        if (cell.imageUrl && type == 'hotelstore') {
            return cell.imageUrl;
        }
        return imgPath + imgSrc + ".png";
    },

    _configHotWordIcon: function (dataSource = {}) {

        var itemList = dataSource.itemList || [];
        for (var i = 0; i < itemList.length; i++) {
            var item = itemList[i] || {};
            item.iconSrc = this._getIconSrc(item.iconType);
        }
        dataSource.itemList = itemList;

        return dataSource;
    },

    _removeSameItem: function (array = [], item = {}) {
        var newArray = [];
        for (var i = 0; i < array.length; i++) {
            var hisObj = array[i] || {};
            if (item.text != hisObj.text) {
                newArray.push(hisObj);
            }
        }
        return newArray;
    },

    _addDataToHistory: function (itemData = {}) {

        var historyData = cwx.getStorageSync("SEARCH_HISTORY_CLICK") || {};
        var historyList = historyData.itemList || [];
        if (historyList.length > 0) {
            historyList = this._removeSameItem(historyList, itemData);
            historyList.unshift(itemData);
        } else {
            historyList = [itemData];
        }
        var maxHisCount = 10;
        if (historyList.length > maxHisCount) {
            historyList.pop();//历史最多显示
        }
        historyData = {
            title: "历史搜索",
            itemList: historyList
        };
        cwx.setStorageSync("SEARCH_HISTORY_CLICK", historyData);
    },

    _updateDeleteView: function (hisData = {}) {
        var hData = this.data.homeData || [];
        if (hData.length > 1) {
            hData.splice(0, 1);
        }
        if (hisData.title == '历史搜索') {
            hData.unshift(hisData);
        }
        this.setData({
            homeData: hData,
        });
    },
    _showHotSearchView: function (recHotSearch) {
        var historyData = cwx.getStorageSync("SEARCH_HISTORY_CLICK") || {};
        historyData = this._configHotWordIcon(historyData);

        let arrayList;
        if (historyData.itemList && historyData.itemList.length > 0) {
            arrayList = [historyData, recHotSearch];
        } else {
            arrayList = [recHotSearch];
        }
        this.setData({
            homeData: arrayList,
            hotSearchData: recHotSearch,
            showListView: false,
            listData: [],
            loading: false
        });

        this.ubtTrace('c_wx_hot_req', {
            cityId: cityInfo.cityID,
            lat: lat,
            lon: lon,
            historyCount: historyData.itemList.length || 0,
            clientId: cwx.clientID || '',
            OS: platform,
        })
    },

    // 替换时间戳函数
    _replaceTsFn: function (url) {
        let nowTs = new Date().getTime()
        if (url.indexOf('__TS__') != -1 || url.indexOf('{{TS}}') != -1) {
            url = url.replace('__TS__', nowTs)
            url = url.replace('{{TS}}', nowTs)
            return url
        } else {
            return url
        }
    },

    // 客户端曝光链接监测发送
    _sendExposefn: function (pvObj, type) {
        var self = this;
        if (!!pvObj.traceInfo) {
            var traceInfo = pvObj.traceInfo;

            var moniterLinkList = [];
            if (type == 'show') {
                moniterLinkList = traceInfo.impTrackingUrls || [];
            } else {
                moniterLinkList = traceInfo.clickTrackingUrls || [];
            }
            if (moniterLinkList && moniterLinkList.length > 0) {
                moniterLinkList.forEach(item => {
                    let sendUrl = item;
                    if (sendUrl) {
                        let logItem = {
                            data: JSON.parse(JSON.stringify(item)),
                            event: type,
                            type: 'min_app'
                        }
                        sendUrl = this._replaceTsFn(sendUrl)
                        try {
                            cwx.request({
                                url: sendUrl,
                                method: "GET",
                                success: function (res) {
                                    logItem.success = JSON.stringify(res)
                                    self.ubtTrace('129055', logItem)
                                },
                                fail: function (e) {
                                    logItem.error = JSON.stringify(e)
                                    // 请求失败埋点
                                    self.ubtTrace('129056', logItem)
                                }
                            })
                        } catch (err) {
                            logItem.error = JSON.stringify(err) + 'catch error'
                            // 请求失败埋点
                            self.ubtTrace('129056', logItem)
                        }

                    }
                })
            }
        }

    },

    _addClickItemToHis: function (itemData = {}) {
        if (!itemData || itemData === 'undefined') {
            return;
        }
        var configHistoryData = {
            text: itemData.word || '',
            type: itemData.type || '',
            url: itemData.url || '',
            historyWord: itemData.word || '',
            ishistory: '1',
        }
        if (!!itemData.word && !!itemData.url) {
            this._addDataToHistory(configHistoryData);
        }
    },

    _gotoTargetPage: function (url = '') {
        var jumpUrl = this._processUrl(url);
        if (!!jumpUrl) {
            var supportWebView = cwx.canIUse('web-view');
            if (jumpUrl.toLowerCase().indexOf('http') == 0 && supportWebView) {
                var h5url = jumpUrl.replace(/[\u4e00-\u9fa5]+/g, function (str) {
                    return encodeURIComponent(str)
                })
                cwx.component.cwebview({
                    data: {
                        url: encodeURIComponent(h5url),
                        needLogin: false
                    }
                })
            } else {
                cwx.navigateTo({
                    url: jumpUrl
                });
            }
        }
    },

    _lenovoRequest: function (input) {
        if (input.length == 0) {
            this._refRequest();
            return;
        }
        var self = this;
        var currentCityID = cityInfo.cityID || '';

        let params = {
            "action": "wechat",
            "clientId": cwx.clientID || ""
        }

        let locationInfo = {}
        if (!!lat) {
            locationInfo["lat"] = parseFloat(lat);
        }
        if (!!lon) {
            locationInfo["lon"] = parseFloat(lon);
        }
        if (!!currentCityID) {
            locationInfo["cityId"] = parseInt(currentCityID);
        }
        params["locationInfo"] = locationInfo;
        if (!!input) {
            params["keyword"] = input;
        }
        params["personalRec"] = personalRecommendSwitch ? 1 : 0;
        params["clientInfo"] = {
            "system": "ios"
        }
        params["userId"] = "11"
        cwx.request({
            url: NEW_LENOVO,
            data: params,
            header: {
                'content-type': 'application/json'
            },
            method: "POST",
            success: function (data) {
                if (input == self.data.inputValue) {
                    self._processData(data.data, input);
                }
                self.ubtTrace('c_wx_req', {
                    cityId: cityInfo.cityID || '',
                    lat: lat,
                    lon: lon,
                    inputkeyword: input,
                    clientId: cwx.clientID || '',
                    OS: platform,
                    queryrule: data.data.queryRule,
                })
            },
            fail: function (error) {
                if (input == self.data.inputValue) {
                    self._processData({}, input);
                }
            }
        });
    }
})