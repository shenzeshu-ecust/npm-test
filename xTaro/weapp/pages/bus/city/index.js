/**
 * 城市组件
 * @module component/city
 */
import { cwx, CPage } from '../index';

CPage({
    pageId: '10320654345',
    data: {
        title: '请选择城市',
        isShowCurrentPosition: true,
        currentCity: {
            cityName: '定位中',
        },
        selectedCity: '', //选择的城市,
        color: '#0086f6',
    },

    onReady: function () {
        cwx.setNavigationBarTitle({
            title: this.title,
        });
    },

    onLoad: function (options) {
        this.title = options.data.title || this.data.title;
        var isShowCurrentPosition = this.data.isShowCurrentPosition;
        if (typeof options.data.isShowCurrentPosition !== 'undefined') {
            isShowCurrentPosition = options.data.isShowCurrentPosition;
        }
        var selectedCityName = options.data.selectedCityName;
        selectedCityName = selectedCityName ? selectedCityName : '';

        this.setData({
            isShowCurrentPosition: isShowCurrentPosition,
            currentCity: { cityName: '定位中' },
            selectedCity: selectedCityName,
        });
        this.loadData = options.data.loadData || function () {};
        this.currentTab = 0;
        this.handleSearch = options.data.handleSearch;
        this.handleCurrentPosition = options.data.handleCurrentPosition;
    },
    onLoadData: function (e) {
        cwx.showLoading({
            title: '正在加载...',
            duration: 10000,
        });
        this.loadData((data) => {
            e.detail.context && e.detail.context.didLoadData(data);
            cwx.hideLoading();
        });
    },
    startLocation: function (e) {
        var cache = cwx.locate.getCachedGeoPoint();
        var success = (resp) => {
            if (typeof this.handleCurrentPosition === 'function') {
                this.handleCurrentPosition(resp, (data) => {
                    this._onHandleCurrentPosition(e.detail.context, data);
                });
            }
        };

        if (cache) {
            success(cache);
            return;
        }
        var that = this;
        cwx.locate.startGetGeoPoint({
            success: success,
            fail: (err) => {
                that._onHandleCurrentPosition(e.detail.context, null);
                console.log('cwx.locate.startGetGeoPoint error ', err);
            },
        });
    },
    _onHandleCurrentPosition: function (context, data) {
        context.didLoadLocation && context.didLoadLocation(data);
    },
    onSeletCity: function (e) {
        //   console.log(JSON.stringify(e));
        const { selectCity } = e.detail;
        if (this.invokeCallback && typeof this.invokeCallback === 'function') {
            this.invokeCallback(selectCity);
        }
        if (this.navigateBack && typeof this.navigateBack === 'function') {
            this.navigateBack();
        } else {
            cwx.navigateBack();
        }
    },
    onCityTabChange: function (e) {
        const { currentTab } = e.detail;
        this.currentTab = currentTab;
    },

    onSearchData: function (e) {
        const { searchValue, searchCallback } = e.detail;
        this.isShowCurrentPosition = this.data.isShowCurrentPosition;
        this.handleSearch(searchValue, this.currentTab, searchCallback);
    },

    exposureAndClickForCity: function (e) {
        console.log('城市列表页 点击e', JSON.stringify(e))
        const data = e.detail;
        let pageId =  data.isShowCurrentPosition ? '10650067388' : '10650067390'
        if (data.event === 'goToSearch') {
            let typeSnd = data.isShowCurrentPosition ? 'fromsuggest_search' : 'tosuggest_search'
            let comment = data.isShowCurrentPosition ? '出发城市选择页搜索框' : '到达城市选择页搜索框'
            this.onUbtTrace('click', typeSnd, comment, '', pageId)
        } else if (data.event === 'cityTap') {
            let typeSnd = data.isShowCurrentPosition ? `fromsuggest_lacation` : `tosuggest_lacation`
            let comment = data.isShowCurrentPosition ? '出发城市选择页当前（城市&车站）' : '到达城市选择页当前（城市&车站）'
            this.onUbtTrace('click', typeSnd, comment, '', pageId)
        } else if (data.event === 'expand') {
            if (data.isShowCurrentPosition) {
                this.onUbtTrace('click', 'fromsuggest_lacation_more_button', '出发城市选择页当前（城市&车站） 更多出发车站', '', pageId)
            }
        } else if (data.event === 'historyCities') {
            let typeSnd = data.isShowCurrentPosition ? `fromsuggest_historySelect` : `tosuggest_historySelect`
            let comment = data.isShowCurrentPosition ? '出发城市选择页历史' : '到达城市选择页历史'
            this.onUbtTrace('click', typeSnd, comment, '', pageId)
        } else if (data.event === 'hotCities') {
            let typeSnd = data.isShowCurrentPosition ? `fromsuggest_hotCity` : `tosuggest_hotCity`
            let comment = data.isShowCurrentPosition ? '出发城市选择页热门' : '到达城市选择页热门'
            this.onUbtTrace('click', typeSnd, comment, '', pageId)
        } else if (data.event === 'character') {
            let typeSnd = data.isShowCurrentPosition ? `fromsuggest_character` : `tosuggest_character`
            let comment = data.isShowCurrentPosition ? '出发城市选择页首字母' : '到达城市选择页首字母'
            this.onUbtTrace('click', typeSnd, comment, '', pageId)
        }

    },

    onUbtTrace(type, typeSnd, comment, content, pageId) {
        let key = type === 'click' ? 'bus_ctrip_wxxcx_allpage_click' : 'bus_ctrip_wxxcx_allpage_show';
        let keyid = type === 'click' ? '200534' : '200558';
        let key_des = type === 'click' ? '汽车票小程序点击全埋点' : '汽车票小程序曝光全埋点';
        let info = {
            keyid,
            key_des,
            pageId,
            type: "ctripwxxcx",
            typeSnd,
            utmSource: this.data.utmSource || '',
            comment,
        }
        if (content) {
            info["content"] = content
        }
        this.ubtTrace(key, info)
    },
});
