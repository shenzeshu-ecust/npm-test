// pages/countrylist/countrylist.js
import { cwx, CPage } from '../../../../cwx/cwx.js';
var utils = require('../../passengerUtils.js');

var originInlandCountries = null;
var originInterCountries = null;
var selectedCountries = null;
var currentCountryLength = 0;

CPage({
  pageId: "10650016066",
  checkPerformance:true, // 白屏检测标志位
  data: {
    title: '请选择国籍',
    soaCountryUrl: "/restapi/soa2/10846/GetCountryForH5.json",
    soacountrydata: {},
    currentTab: 0,
    toView: 'hot',
    searchValue: "",
    inputKeyword: "",
    loadDataFinish: false,
    currentCountry: {countryname: '中国',countrycode:'CN'},
    currentTag: '',
    currentAppend: '',
    countryIndexs:[],
    countryTags: [],//默认的索引
    selectedCountryCode: '', //选择的国籍
    isSearchView: false,
    hotselected: 0
  },
  onReady: function () {
    cwx.setNavigationBarTitle({title: this.title});
    this.showLoading();
    this.getCountryData();
  },
  onLoad: function (options) {
    this.title = options.data.title || this.data.title;
    var countryname = options.data.selectedCountryCode ? options.data.selectedCountryCode : this.data.currentCountry.countryname;
    var countrycode = options.data.selectedCountryName ? options.data.selectedCountryName : this.data.currentCountry.countrycode;
    var country = { countryname: countryname , countrycode: countrycode};

    this.setData({ loadDataFinish: false, selectedCountryCode: countryname});
    this.setData({ currentCountry: country});
  },
  countryTap: function (e) {
    //   console.log(JSON.stringify(e));
    var countrycode = e.currentTarget.dataset.countrycode;

    if (this.data.currentCountry.countrycode === countrycode) {
      var tempcountry = this.data.currentCountry;
      this.invokeCallback(tempcountry);
      this.navigateBack();
      return;
    }
    var section = e.currentTarget.dataset.section;
    var row = e.currentTarget.dataset.row;
    var selectcountry;
    if (section == "hotCountries") {
      selectcountry = this.data.currentTabCountries.hotCountries[row];
    }else if (section == "search") {
      selectcountry = this.data.searchResult[row];
    }else {
      selectcountry = this.data.currentTabCountries.countryMainList[section][row];
    }
    //   console.log('+++'+JSON.stringify(selectcountry));
    this.invokeCallback(selectcountry);
    this.navigateBack();
  },
  tagTap: function (e) {
    var countrytag = e.currentTarget.dataset.countrytag;
    this.data.currentAppend = countrytag;
    var currentTabCountries = this.appendNextSection(this.data.currentAppend);
    if (currentTabCountries) {
      this.setData({currentAppend: this.data.currentAppend,currentTabCountries: currentTabCountries});
    }
    this.setData({toView: countrytag});
    if (this.data.countryIndexs){
      for (var i = 0; i < this.data.countryIndexs.length;i++){
        if (countrytag == this.data.countryIndexs[i].countryindex) {
          this.data.countryIndexs[i].isselected=1;
      }else{
          this.data.countryIndexs[i].isselected=0;
      }
    }
      this.setData({ countryIndexs: this.data.countryIndexs });
    }
  },
  searchInput: function (e) {
    var self = this;
    var value = e.detail.value;
    this.setData({ inputKeyword: value });
    var data = self.data.soacountrydata;
    var country = {};
    var countryMain = [];
    var indexCN = 0;
    var indexEN = 0;
    if (data && data.inlandCountries && data.inlandCountries.countryMainList) {
      var countryList = data.inlandCountries.countryMainList;
      for (var prop in countryList) {
        countryList[prop].forEach(function (item) {
          var formatItemEname = item.ename ? item.ename.toLowerCase() : ''; // ename下发的格式为:china，此处需要格式化，否则不支持带有大写字母的搜索
          indexCN = item.name ? item.name.indexOf(value) : -1;
          indexEN = formatItemEname ? formatItemEname.indexOf(value.toLowerCase()) : -1;
          if (indexCN != -1 || indexEN != -1) {
            country = { countrycode: item.scode, countryname: item.name, countryename: item.ename, selectedCountry: 1 };
            countryMain.push(country);
          }
        });
      }
    }
    this.onHandleSearchResult(countryMain);
  },
  gotoSearch: function (e) {
    if (this.data.isSearchView) {
      return;
    }
    this.setData({ isSearchView: true });
  },
  searchClear: function (e) {
    this.setData({
      inputKeyword: ""
    })
    this.onHandleSearchResult([]);
  },
  searchCancel: function (e) {
    this.setData({
      isSearchView: false,
      inputKeyword: ""
    })
    this.onHandleSearchResult([]);
    wx.hideKeyboard()
  },
  onHandleSearchResult: function (data) {
    this.setData({
      searchResult: data,
    })
  },
  appendNextSection: function (currentAppend) {
    // console.log("append....... ", currentAppend);
    var currentTabCountries = this.data.currentTabCountries;
    if (!currentTabCountries) {
      currentTabCountries = cwx.util.copy(selectedCountries);
      currentTabCountries.countryMainList = {};
      currentTabCountries.countryTags = [];
    }
    var index = selectedCountries.countryTags.indexOf(currentAppend);
    if (index == -1 || currentTabCountries.countryMainList[currentAppend] || currentTabCountries.countryTags.indexOf(currentAppend) != -1) {
      // console.log("appendNextSection error：未找到正确的索引");
      return null;
    }
    //追加要显示的country section
    var countries = selectedCountries.countryTags;
    for (var i = 0; i < countries.length; i++) {
      if (i <= index) {
        var append = countries[i];
        if (!currentTabCountries.countryMainList[append] && currentTabCountries.countryTags.indexOf(append) == -1) {
          var tmpcountrys = selectedCountries.countryMainList[append];
          currentCountryLength += tmpcountrys.length; //追加长度
          currentTabCountries.countryMainList[append] = tmpcountrys;
          currentTabCountries.countryTags.push(append);
        }
      }
    }
    if (index < selectedCountries.countryTags.length - 1) {
      this.data.currentAppend = selectedCountries.countryTags[index + 1];
    }
    return currentTabCountries;
  },
  conuntryHandlerScrollLower: function (e) {
    var currentTabCountries = this.appendNextSection(this.data.currentAppend);
    if (currentTabCountries) {
      this.setData({currentTabCountries: currentTabCountries});
    }
  },
  showLoading: function () {
    if (this.data.loadDataFinish) return;
    var that = this;
    cwx.showToast({
      title: '加载中..',
      icon: 'loading',
      duration: 10000,
      complete: function () {that.showLoading();}
    });
  },
  getCountryData: function () {
    var self = this;
    var soadata = {};
    cwx.request({
      url: self.data.soaCountryUrl, data: soadata, success: function (res) {
        var data = res.data;
        if (data && data.result && data.result.resultCode === 0 && data.ResponseStatus.Ack == "Success") {
          self.parseCountrys(data.countryInfoListByFirstLetter, data.countryInfoListHot);
          self.createCountryList();
          self.hideLoading();
        }
      },
      fail: function (data) {
        self.hideLoading();
      },
    });
  },
  hideLoading: function () {
    cwx.hideToast()
  },
  parseCountrys: function (countryData, hotcountry) {
    var self = this;
    var ret = {};
    // 按字母排序数据
    var sortData = countryData.sort(self.compareToInitial.bind(self));
    sortData.forEach(function (item, i) {
      // 首字母大写
      var initial = item.initial.substr(0, 1).toUpperCase();
      if (ret[initial]) {
        ret[initial].push(item);
      } else {
        ret[initial] = [item];
      }
    });
    var countrydata = { inlandCountries: { hotCountries: hotcountry, countryMainList: ret }, interCountries: { hotCountries: [], countryMainList: {}}};
    self.setData({ soacountrydata: countrydata});
  },
  createCountryList: function () {
    var self = this;
    var data = self.data.soacountrydata;
    var hotcountrylist = [];
    var country = {};
    var hotIsSelected=0;
    if (data && data.inlandCountries && data.inlandCountries.hotCountries) {
      data.inlandCountries.hotCountries.forEach(function (item, j) {
        if (self.isDefaultHighLight(item)) {
          country = { countrycode: item.scode, countryname: item.name, countryename: item.ename, selectedCountry: 1 };
          hotIsSelected=1;
        } else {
          country = { countrycode: item.scode, countryname: item.name, countryename: item.ename, selectedCountry: 0 };
        }
        hotcountrylist.push(country);
      });
    }
    this.setData({ hotselected: hotIsSelected});
    var countryTaglist = [];
    var countryMain = {};
    var cIndexs = [];
    var index = "";
    var selCountry=0;
    if (data && data.inlandCountries && data.inlandCountries.countryMainList) {
      for (var prop in data.inlandCountries.countryMainList) {
        //过滤掉空的数据
        index = "";
        if (data.inlandCountries.countryMainList[prop].length > 0) {
          data.inlandCountries.countryMainList[prop].forEach(function (item, i) {
            if (self.isDefaultHighLight(item)) {
              index = prop;
              selCountry=1;
            } else {
              selCountry = 0;
            }
            country = { countrycode: item.scode, countryname: item.name, countryename: item.ename, selectedCountry: selCountry };
            if (countryMain[prop]) {
              countryMain[prop].push(country);
            } else {
              countryMain[prop] = [country];
            }
          });
          countryTaglist.push(prop);
          if (index && index.length > 0) {
            cIndexs.push({ countryindex: prop, isselected: 1 });
          } else {
            cIndexs.push({ countryindex: prop, isselected: 0 });
          }
        }
      }
    }

    this.setData({ countryIndexs: cIndexs});
    var tmps = {inlandCountries:{hotCountries:hotcountrylist, countryMainList: countryMain }, interCountries: { hotCountries: [], countryMainList: {} } };
    currentCountryLength = 0;
    originInlandCountries = tmps.inlandCountries;
    originInlandCountries.countryTags = countryTaglist;
    originInterCountries = tmps.interCountries;
    originInterCountries.countryTags = [];
    selectedCountries = originInlandCountries;
    //追加默认第一组
    this.data.currentAppend = countryTaglist && countryTaglist.length && countryTaglist[0];

    var currentTabCountries = null;
    do {
      currentTabCountries = this.appendNextSection(this.data.currentAppend);
    } while (currentCountryLength < 30 && currentTabCountries != null)

    this.data.loadDataFinish = true;
    if (currentTabCountries) {
      this.setData({
        currentAppend: this.data.currentAppend,
        loadDataFinish: this.data.loadDataFinish,
        currentTabCountries: currentTabCountries,
        showInter: (originInterCountries.countryTags.length != 0),
        countryTags: selectedCountries.countryTags,
      })
    }
    wx.hideToast();
  },
  /**
 * 根据拼音排序
 * @return {[type]} [description]
 */
  compareToInitial: function (a, b) {
    var py1 = this.getPyInitial(a.initial), py2 = this.getPyInitial(b.initial);
    // 获取较长的拼音的长度
    var length = py1.length > py2.length ? py1.length : py2.length;
    // 依次比较字母的unicode码，相等时返回0，小于时返回-1，大于时返回1
    for (var i = 0; i < length; i++) {
      var differ = py1.charCodeAt(i) - py2.charCodeAt(i);
      if (differ == 0) {
        continue;
      } else {
        if (py1.charAt(i) == '_') {
          return -1;
        }
        return differ;
      }
    }
    if (i == length) {
      return py1.length - py2.length;
    }
  },
  /**
  * 根据空格获取每个字的拼音首字母
  * @return {[type]} [description]
  */
  getPyInitial: function (py) {
    if (typeof py !== 'string') { return py; }

    return py.split(' ').map(function (item) {
      return item[0]
    }).join('');
  },
  /**
  * 是否默认高亮显示
  * @param  {[type]}  data [description]
  * @return {Boolean}      [description]
  */
  isDefaultHighLight: function (data) {
    if (!this.data.selectedCountryCode) { return false; }
    var selcode = this.data.selectedCountryCode;
    if (selcode && selcode.length > 0) {
      if (data.scode != selcode) {
        return false;
      }
    }
    return true;
  }
})