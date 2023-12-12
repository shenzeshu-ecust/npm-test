import { deepCopy, uuid } from '../common/common';
import {
    BUS_KEY_HISTORY_TO,
    BUS_KEY_HISTORY_FROM,
} from '../../../common/CityListDataUtils';
import { cwx } from '../../../common/index';

var originInlandCities = null;
var originInterCities = null;
var selectedCities = null;
var currentCityLength = 0;

let cityListDataMap = {};
function createCityListContext(callback, didLocation) {
    let id = uuid(8, 16);

    let context = Object.create(
        {},
        {
            id: {
                writable: false,
                configurable: false,
                value: id,
            },
            didLoadData: {
                writable: false,
                configurable: false,
                value: function (data) {
                    callback && callback(data);
                },
            },
            didLoadLocation: {
                writable: false,
                configurable: false,
                value: function (data) {
                    didLocation && didLocation(data);
                },
            },
        }
    );
    cityListDataMap[id] = Object.context;
    return context;
}
function clearContext(contextId) {
    delete cityListDataMap[contextId];
}

// wx.createCityListContext = createCityListContext;
wx.getCityListContext = function (contextId) {
    return cityListDataMap[contextId];
};

Component({
    properties: {
        cityListContext: {
            type: String,
            value: '',
        },
        showCurrent: {
            type: Boolean,
            value: false,
            observer: function (newVal, oldVal, changedPath) {
                this.setData({
                    isShowCurrentPosition: newVal,
                });
            },
        },

        selectedCity: {
            type: String, //选择的城市,
            value: '',
        },
        color: {
            type: String,
            value: '#0086f6',
        },
    },
    data: {
        isFoldShow: false,
        currentTab: 0,
        currentCity: {
            cityName: '定位中',
            stattions: [],
        },
        locationType: 0, //0 定位中 ，1 定位成功 ， 2定位失败
        toView: 'positon',
        loadDataFinish: false,
        currentTag: '',
        currentAppend: '',
        showInter: false,
        cityTags: [], //默认的索引
        isShowCurrentPosition: true,
    },
    attached: function () {
        this.context = createCityListContext(
            (data) => {
                this._onDataLoaded(data);
            },
            (data) => {
                this._onHandleCurrentPosition(data);
            }
        );
    },
    detached: function () {
        clearContext(this.context.id);
    },

    ready: function () {
        var myEventDetail = {
            context: this.context,
        }; // detail对象，提供给事件监听函数
        var myEventOption = {
            bubbles: false,
        }; // 触发事件的选项
        this.triggerEvent('loaddata', myEventDetail, myEventOption);

        if (this.properties.showCurrent) {
            this.beginLocate();
        }
    },
    observers: {
        currentTab: function (currentTab) {
            var myEventDetail = {
                context: this.context,
                currentTab,
            }; // detail对象，提供给事件监听函数
            var myEventOption = {
                bubbles: false,
            }; // 触发事件的选项
            this.triggerEvent('tabchange', myEventDetail, myEventOption);
        },
    },
    methods: {
        //加载数据完成
        _onDataLoaded: function (data) {
            currentCityLength = 0;
            //过滤掉空的数据
            this._trimeData(data);
            var currentTabCities = null;
            this.data.currentTabCities = null;
            do {
                currentTabCities = this._appendNextSection(
                    this.data.currentAppend
                );
            } while (currentCityLength < 30 && currentTabCities != null);

            this.data.loadDataFinish = true;
            if (currentTabCities) {
                this.setData({
                    currentAppend: this.data.currentAppend,
                    loadDataFinish: this.data.loadDataFinish,
                    currentTabCities: currentTabCities,
                    showInter: originInterCities.cityTags.length != 0,
                    cityTags: selectedCities.cityTags,
                });
            } else {
                this.setData({
                    loadDataFinish: this.data.loadDataFinish,
                    currentAppend: this.data.currentAppend,
                });
            }
            wx.hideToast();
        },
        beginLocate: function () {
            this.setData({
                locationType: 0,
            });
            var myEventDetail = { context: this.context }; // detail对象，提供给事件监听函数
            var myEventOption = {}; // 触发事件的选项
            this.triggerEvent('location', myEventDetail, myEventOption);
        },
        //过滤数据
        _trimeData: function (data) {
            originInlandCities = data.inlandCities || {};
            originInterCities = data.interCities || {};
            //保护
            originInlandCities.historyCities =
                originInlandCities.historyCities || [];
            originInterCities.historyCities =
                originInterCities.historyCities || [];

            var inlandCityTags = [];
            for (var key in originInlandCities.cityMainList) {
                var citys = originInlandCities.cityMainList[key];
                if (citys.length > 0) {
                    inlandCityTags.push(key);
                } else {
                    delete originInlandCities.cityMainList[key];
                }
            }
            originInlandCities.cityTags = inlandCityTags;

            var interCityTags = [];
            for (var key in originInterCities.cityMainList) {
                var citys = originInterCities.cityMainList[key];
                if (citys.length > 0) {
                    interCityTags.push(key);
                } else {
                    delete originInterCities.cityMainList[key];
                }
            }

            originInterCities.cityTags = interCityTags;
            selectedCities = originInlandCities;
            this.data.currentAppend =
                inlandCityTags && inlandCityTags.length && inlandCityTags[0]; //追加默认第一组
        },
        _appendNextSection: function (currentAppend) {
            // console.log("append....... ", currentAppend);
            let currentTabCities = this.data.currentTabCities;

            //增加容错
            selectedCities = selectedCities || {};
            selectedCities.cityTags = selectedCities.cityTags || [];
            selectedCities.cityMainList = selectedCities.cityMainList || {};
            if (!currentTabCities) {
                currentTabCities = deepCopy(selectedCities);
                currentTabCities.cityMainList = {};
                currentTabCities.cityTags = [];
            } else {
                currentTabCities.cityMainList =
                    currentTabCities.cityMainList || {};
                currentTabCities.cityTags = currentTabCities.cityTags || [];
            }

            var index = selectedCities.cityTags.indexOf(currentAppend);
            if (
                index == -1 ||
                currentTabCities.cityMainList[currentAppend] ||
                currentTabCities.cityTags.indexOf(currentAppend) != -1
            ) {
                console.log('_appendNextSection error：未找到正确的索引');
                return null;
            }
            //追加要显示的city section
            var cities = selectedCities.cityTags;
            for (var i = 0; i < cities.length; i++) {
                if (i <= index) {
                    var append = cities[i];
                    if (
                        !currentTabCities.cityMainList[append] &&
                        currentTabCities.cityTags.indexOf(append) == -1
                    ) {
                        var tmpCity = selectedCities.cityMainList[append];
                        currentCityLength += tmpCity.length; //追加长度
                        currentTabCities.cityMainList[append] = tmpCity;
                        currentTabCities.cityTags.push(append);
                    }
                }
            }
            if (index < selectedCities.cityTags.length - 1) {
                this.data.currentAppend = selectedCities.cityTags[index + 1];
            }

            return currentTabCities;
        },

        inlandTabClick: function () {
            selectedCities = originInlandCities;
            currentCityLength = 0;

            this.data.currentTab = 0;
            this.data.currentAppend = originInlandCities.cityTags[0];
            this.data.currentTabCities = null;
            var currentTabCities = null;
            do {
                currentTabCities = this._appendNextSection(
                    this.data.currentAppend
                );
            } while (currentCityLength < 30 && currentTabCities != null);

            if (currentTabCities) {
                this.setData({
                    currentAppend: this.data.currentAppend,
                    currentTab: 0,
                    currentTabCities: currentTabCities,
                    cityTags: selectedCities.cityTags,
                });
                this.setData({
                    toView: this.data.currentAppend,
                });
            }
        },

        //交互
        interTabClick: function () {
            selectedCities = originInterCities;
            currentCityLength = 0;

            this.data.currentAppend = originInterCities.cityTags[0];
            this.data.currentTab = 1;
            this.data.currentTabCities = null;
            var currentTabCities = null;

            do {
                currentTabCities = this._appendNextSection(
                    this.data.currentAppend
                );
            } while (currentCityLength < 30 && currentTabCities != null);

            if (currentTabCities) {
                this.setData({
                    currentAppend: this.data.currentAppend,
                    currentTab: 1,
                    currentTabCities: currentTabCities,
                    cityTags: selectedCities.cityTags,
                });
                this.setData({
                    toView: this.data.currentAppend,
                });
            }
        },
        handlerScrollLower: function (e) {
            var currentTabCities = this._appendNextSection(
                this.data.currentAppend
            );
            if (currentTabCities) {
                this.setData({
                    currentTabCities: currentTabCities,
                });
            }
        },
        cityTap: function (e) {
            //   console.log(JSON.stringify(e));
            var cityName = e.currentTarget.dataset.cityname;

            if (cityName === '定位中') {
                //'定位中'
                return;
            }
            if (cityName === '定位失败，点击刷新') {
                //'定位失败，点击刷新'
                this.beginLocate();
                return;
            }
            var section = e.currentTarget.dataset.section;
            var row = e.currentTarget.dataset.row;
            var selectCity;
            let event = '';
            if (section === 'location') {
                let type = e.currentTarget.dataset.type;
                if (type === 'expand') {
                    this.triggerEvent('cityDate', {
                        event: 'expand',
                        isShowCurrentPosition: this.data.isShowCurrentPosition,
                    });
                    this.setData({
                        [`currentCity.showSlice`]:
                            !this.data.currentCity.showSlice,
                    });
                    return;
                } else if (type === 'station') {
                    event = 'cityTap';
                    selectCity = this.data.currentCity.stations[row];
                } else {
                    event = 'cityTap';
                    selectCity = {
                        cityName: this.data.currentCity.cityName,
                    };
                }
            } else if (section == 'historyCities') {
                event = 'historyCities';
                selectCity = this.data.currentTabCities.historyCities[row];
            } else if (section == 'hotCities') {
                event = 'hotCities';
                selectCity =
                    this.data.currentTabCities &&
                    this.data.currentTabCities.hotCities
                        ? this.data.currentTabCities.hotCities[row]
                        : {};
            } else if (section == 'search') {
                selectCity = this.data.searchResult[row];
            } else {
                event = 'character';
                selectCity =
                    this.data.currentTabCities.cityMainList[section][row];
            }
            this.triggerEvent('cityDate', {
                event,
                isShowCurrentPosition: this.data.isShowCurrentPosition,
            });
            //   console.log('+++'+JSON.stringify(selectCity));
            var myEventDetail = {
                selectCity: selectCity,
            }; // detail对象，提供给事件监听函数
            var myEventOption = { bubbles: true }; // 触发事件的选项
            this.triggerEvent('select', myEventDetail, myEventOption);
        },
        tagTap: function (e) {
            var citytag = e.currentTarget.dataset.citytag;
            if (this.data.isFoldShow) {
                this.setData({
                    currentTag: citytag,
                });
            }
            this.data.currentAppend = citytag;
            var currentTabCities = this._appendNextSection(
                this.data.currentAppend
            );
            if (currentTabCities) {
                this.setData({
                    currentAppend: this.data.currentAppend,
                    currentTabCities: currentTabCities,
                });
            }
            this.setData({
                toView: citytag,
            });
        },

        //定位
        _onHandleCurrentPosition: function (data) {
            if (data === null) {
                this.data.currentCity = { cityName: '定位失败，点击刷新' };
                this.setData({
                    currentCity: this.data.currentCity,
                    locationType: 2,
                });
                return;
            }

            if (data.stations && data.stations.length > 3) {
                data.showSlice = true;
                data.showStations = data.stations.slice(0, 3);
            }

            let adata = {
                currentCity: data,
                locationType: 1,
            };
            if (data.hot) {
                adata['currentTabCities.hotCities'] = data.hot;
            }
            this.setData(adata);
        },

        onDeleteHistory: function () {
            let data = JSON.parse(JSON.stringify(this.data.currentTabCities));
            data.historyCities = [];
            let key = this.data.isShowCurrentPosition
                ? BUS_KEY_HISTORY_FROM
                : BUS_KEY_HISTORY_TO;
            cwx.setStorage({
                key,
                data: [],
            });
            this.setData({
                currentTabCities: data,
            });
        },
    },
});
