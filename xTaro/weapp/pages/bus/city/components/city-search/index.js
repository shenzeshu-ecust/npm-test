import debounce from '../../../common/debounce';

Component({
    properties: {
        color: {
            type: String,
            value: '#0086f6',
        },
        showCurrent: {
            type: Boolean,
            value: false,
            observer: function (newVal) {
                this.setData({
                    isShowCurrentPosition: newVal,
                });
            },
        },
    },
    data: {
        searchValue: '',
        inputKeyword: '',
        isSearchView: false,
        loadDataFinish: false,
    },
    attached: function () {},
    detached: function () {},
    ready: function () {
        this.debouncedSearch = debounce(this.searchData, 400, { trailing: true });
    },
    methods: {
        gotoSearch: function (e) {
            this.triggerEvent('cityDate', {event:'goToSearch', isShowCurrentPosition: this.data.isShowCurrentPosition});
            if (this.data.isSearchView) {
                return;
            }
            this.setData({
                isSearchView: true,
            });
        },
        searchInput: function (e) {
            var value = e.detail.value;
            this.setData({
                inputKeyword: value,
            });
            this.debouncedSearch(value, this._onHandleSearchResult.bind(this));
        },
        searchData: function (searchValue, handleResult) {
            var myEventDetail = {
                searchValue,
                searchCallback: handleResult,
            }; // detail对象，提供给事件监听函数
            var myEventOption = {
                bubbles: false,
            }; // 触发事件的选项
            this.triggerEvent('search', myEventDetail, myEventOption);
        },
        searchClear: function (e) {
            this.setData({
                inputKeyword: '',
            });
            this._onHandleSearchResult([]);
        },
        searchCancel: function (e) {
            this.setData({
                isSearchView: false,
                inputKeyword: '',
            });
            this._onHandleSearchResult([]);
            wx.hideKeyboard();
        },
        _onHandleSearchResult: function (data = []) {
            console.log('search result', data);
            // if (city.dataset)
            let searchResult = data.map((item) => {
                if (item.stations && item.stations.length > 3) {
                    item.showStations = item.stations.slice(0, 3);
                    item.showSlice = true;
                }
                return item;
            });
            this.setData({
                searchResult: searchResult,
            });
        },
        cityTap: function (e) {
            //   console.log(JSON.stringify(e));
            var cityName = e.currentTarget.dataset.cityname;

            var section = e.currentTarget.dataset.section;
            var row = e.currentTarget.dataset.row;
            var type = e.currentTarget.dataset.type;

            let city = this.data.searchResult[section];

            var selectCity;
            if (type === 'expand') {
                city.showSlice = !city.showSlice;

                this.setData({
                    [`searchResult[${section}]`]: city,
                });
                return;
            }
            if (type == 'city') {
                selectCity = city;
            } else {
                selectCity = city.stations[row];
            }
            //   console.log('+++'+JSON.stringify(selectCity));
            var myEventDetail = {
                selectCity: selectCity,
            }; // detail对象，提供给事件监听函数
            var myEventOption = { bubbles: true }; // 触发事件的选项
            this.triggerEvent('select', myEventDetail, myEventOption);
        },
    },
});
