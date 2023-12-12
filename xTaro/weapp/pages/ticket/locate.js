import {cwx, _, config, locateSource} from './common.js';
let ticketmodel = require('./service/ticketmodel.js'),
    ticketstore = require('./service/ticketstore.js');

const options = {
    posCity: function () {
        let self = this;
        self.handleCityPosition(null, self.posSuccess)
    },
    posSuccess : function(currentcity){
        let lastcity = ticketstore.PosCity.get(),
            listcity = ticketstore.TicketCityInfo.get() || {},
            self = this;
        //如果定位缓存还在、没有定位城市、城市id不对、城市名没有、定位等于当前城市 返回  
        if(lastcity || !currentcity || !currentcity.districtid || !currentcity.districtname || (listcity.districtid == currentcity.districtid)){
            return;
        }

        //如果没有定位城市，保存
        if (!lastcity) {
            ticketstore.PosCity.setAsync(currentcity);
        }

        wx.showModal({
            title: '提示',
            content: '系统定位你在'+currentcity.districtname+',是否切换？',
            showCancel : true,
            cancelText: '取消',
            confirmText: '切换',
            success: function(res) {
                if (res.confirm) {
                    self.changeCity(currentcity);
                }
            }
        });
    },

     //城市切换
     forwardCitylist: function () {
        let self     = this,
            //成功回调
            success  = function (res, data) {
                //加上历史数据
                res = self.formatCityHistory(res);
                let cityinfos = ticketstore.TicketCityInfo.get() || ticketstore.PosCity.get() || {};
                //缓存城市数据给搜索用
                self.citylist = data;
                //跳转
                cwx.component.city({
                    data: {
                        title: config.Page.citylist.title,
                        loadData: function (callback) {
                            callback(res);
                        },
                        handleSearch: self.handleCitySearch,
                        handleCurrentPosition: self.handleCityPosition,
                        selectedCityName: cityinfos.districtname || cityinfos.cityname,
                        handleClearHistory: (e) => {
                            Object.keys(res).forEach(k => {
                                res[k].historyCities = [];
                            })
                            ticketstore.CityHistory.setAsync([]);
                        }
                    },
                    immediateCallback: self.changeCity
                })
            },
            //失败回调
            fail     = function (json) {},
            // //空数据
            filters  = function (res) {
                return !res.cities || (res.cities.length < 1);
            };
        //发起
        ticketmodel.CityList12530.request({
            data: {
                pageid: this.pageId,
                source: 0,
                type: 0
            },
            success: success,
            fail: fail,
            // filter: filters,
            format: self.cityListFormatter
        });
    },
    //城市切换数据历史记录
    formatCityHistory: function (data) {
        // return data;
        let history = this.handleCityHistory(),
            area = [];
        history.forEach(function (city) {
            area.push(city);
        })
        if(data && data.inlandCities) {
            data.inlandCities.historyCities = area;
        }
        if(data && data.interCities) {
            data.interCities.historyCities = area;
        }
        return data;
    },
    cityListFormatter: function (res) {
        const data = {
            inlandCities: {
                cityMainList: {},
                historyCities: [],
                hotCities: []
            },
            interCities: {
                cityMainList: {},
                historyCities: [],
                hotCities: []
            }
        };
        //if (res.domesticcity && res.overseascity) {
            function cityFormatter(c) {
                c.districtname = c.name;
                c.isdomestic = !c.isoversea;
                c.cityName = c.name;
                c.districtid = c.id;
            }

        res.domesticcity && res.domesticcity.cities.forEach(city => {
                city.cities.forEach(cityFormatter);
                data.inlandCities.cityMainList[city.firstchar] = city.cities;
            });
        res.overseascity && res.overseascity.cities.forEach(city => {
                city.cities.forEach(cityFormatter);
                data.interCities.cityMainList[city.firstchar] = city.cities;
            });
            data.inlandCities.hotCities = res && res.domesticcity && res.domesticcity.recommendcities || [];
            data.interCities.hotCities = res && res.overseascity && res.overseascity.recommendcities || [];
            data.inlandCities.hotCities.forEach(cityFormatter);
            data.interCities.hotCities.forEach(cityFormatter);

            //删除不存在的快捷
            Object.keys(data.inlandCities.cityMainList).map(function (key) {
                data.inlandCities.cityMainList[key].length < 1 && delete data.inlandCities.cityMainList[key];
            });
            Object.keys(data.interCities.cityMainList).map(function (key) {
                data.interCities.cityMainList[key].length < 1 && delete data.interCities.cityMainList[key];
            });
        //}
        return data;
    },
    //城市列表搜索
    handleCitySearch: function (inputValue, currentTab, onSuccess) {
        if (inputValue.length < 1) {
            onSuccess && onSuccess([]);
            return;
        }
        const data = {
            // districtid: 1,
            stype: 6,
            keyword: inputValue.replace(/\s/g, '').toLowerCase(),
            pageid: this.pageId
        };
        ticketmodel.autoCompleteSearch.request({
            data,
            success: function (data) {
                const acitems = data.acitems || [];
                acitems.forEach(item => {
                    item.districtname = item.name;
                    item.cityName = item.name;
                    item.districtid = item.id;
                    item.isdomestic = !item.isoversea;
                });
                onSuccess && onSuccess(acitems);
            },
        });
    },
    //城市定位
    handleCityPosition: function (data, next) {
        if (data && data.latitude && data.longitude) {
            var cachedAddress = cwx.locate.getCachedAddress();
            if(cachedAddress){
                next({
                    disctrictname: "我的位置",
                    cityName:"我的位置",
                    title:cachedAddress.address,
                    disctrictid: 0,
                    cityId:0,
                    type: 'n',
                    lat: data.latitude,
                    lng: data.longitude,
                    isGeo: true
                })
            }
            else{
                cwx.locate.startGetAddress(function(d){
                    next({
                        disctrictname: "我的位置",
                        cityName:"我的位置",
                        title: d.address,
                        disctrictid: 0,
                        cityId:0,
                        type: 'n',
                        lat: data.latitude,
                        lng: data.longitude,
                        isGeo: true
                    })
                }, locateSource);
            }

        }
    },
    //历史数据
    handleCityHistory: function (city) {
        let history = ticketstore.CityHistory.get() || [];
        if (!city) {
            return history;
        }
        if (history.length > 0) {
            let his = [];
            history.forEach(function (key) {
                if (key.districtid != city.districtid) {
                    his.push(key);
                }
            })
            history = his;
        }
        history.unshift(city);
        history = history.splice(0, 4); //最多8个
        ticketstore.CityHistory.setAsync(history);
        return history;
    },
}
export default options;
