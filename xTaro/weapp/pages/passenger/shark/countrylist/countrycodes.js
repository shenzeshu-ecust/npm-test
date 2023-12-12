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
    title: '请选择国家码',
    soaCountryUrl: "/restapi/soa2/12687/json/getCountryCode",
    soacountrydata: {},
    countrydata: {},
    currentTab: 0,
    toView: 'hot',
    searchValue: "",
    inputKeyword: "",
    loadDataFinish: false,
    currentCountry: { countryname: '中国', countrycode: 'CN',code:"86" },
    currentTag: '',
    currentAppend: '',
    countryTags: [],//默认的索引
    selectedCode: '', //选择的国家码
    isSearchView:false,
    countryIndexs:[],
    hotselected:0
  },
  onReady: function () {
    cwx.setNavigationBarTitle({ title: this.title });
    this.showLoading();
    this.getCountryData();
  },
  onLoad: function (options) {
    this.title = options.data.title || this.data.title;
    var code = options.data.selectedCode ? options.data.selectedCode : this.data.currentCountry.code;
    var countrycode = options.data.countrycode ? options.data.countrycode : this.data.currentCountry.countrycode;
    var countryname = options.data.countryname ? options.data.countryname : this.data.currentCountry.countryname;
    var country = { countryname: countryname, countrycode: countrycode, code: code };

    this.setData({ loadDataFinish: false, selectedCode: code});
    this.setData({ currentCountry: country });
  },
  countryTap: function (e) {
    //   console.log(JSON.stringify(e));
    var code = e.currentTarget.dataset.code;

    if (this.data.currentCountry.code === code) {
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
    } else if (section == "search") {
      selectcountry = this.data.searchResult[row];
    } else {
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
      this.setData({ currentAppend: this.data.currentAppend, currentTabCountries: currentTabCountries });
    }
    this.setData({ toView: countrytag });
    if (this.data.countryIndexs) {
      for (var i = 0; i < this.data.countryIndexs.length; i++) {
        if (countrytag == this.data.countryIndexs[i].countryindex) {
          this.data.countryIndexs[i].isselected = 1;
        } else {
          this.data.countryIndexs[i].isselected = 0;
        }
      }
      this.setData({ countryIndexs: this.data.countryIndexs });
    }
  },
  searchInput: function (e) {
    var self=this;
    var value = e.detail.value;
    this.setData({ inputKeyword: value });
    var data = self.data.soacountrydata;
    var country = {};
    var countryMain = [];
    var indexCN=0;
    var indexEN=0;
    if (data && data.inlandCountries && data.inlandCountries.countryMainList) {
      var countryList = data.inlandCountries.countryMainList;
      for (var prop in countryList) {
        countryList[prop].forEach(function (item) {
          var formatItemEn = item.en ? item.en.toLowerCase() : ''; // en下发的格式为:China，此处需要格式化，否则不支持纯小写搜索
          indexCN = item.cn ? item.cn.indexOf(value) : -1;
          indexEN = formatItemEn ? formatItemEn.indexOf(value.toLowerCase()) : -1;
          if (indexCN != -1 || indexEN!= -1) {
          country = { code: item.code, countrycode: item.country, countryname: item.cn, countryename: item.en, selectedCountry: 0 };
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
      this.setData({ currentTabCountries: currentTabCountries });
    }
  },
  showLoading: function () {
    if (this.data.loadDataFinish) return;
    var that = this;
    cwx.showToast({
      title: '加载中..',
      icon: 'loading',
      duration: 10000,
      complete: function () { that.showLoading(); }
    });
  },
  getCountryData: function () {
    var self = this;
    var soadata = {};
    cwx.request({
      url: self.data.soaCountryUrl, data: soadata,
      success: function (res) {
        var data = res.data;
        if (data && data.ResponseStatus && data.ResponseStatus.Ack == "Success" && data.countryInfoList && data.countryInfoList.length>0) {
          self.parseCountrys(data.countryInfoList);
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
  parseCountrys: function (data) {
    var self = this;
    var ret = {};
    // 热门国家
    var hotcountry = data.slice(0, 5);

    // 按字母排序数据
    var sortData = data.sort(self.compareToPy.bind(self));
    sortData.forEach(function (item, i) {
      // needSMS === 1 过滤支持短信发送的国家列表
      if (self.needSMS !== 1 || item.open === 1) {
        // 首字母大写
        var initial = item.py.substr(0, 1).toUpperCase();
        if (ret[initial]) {
          ret[initial].push(item);
        } else {
          ret[initial] = [item];
        }
      }
    });
    var countrydata = { inlandCountries: { hotCountries: hotcountry, countryMainList: ret }, interCountries: { hotCountries: [], countryMainList: {} } };
    self.setData({ soacountrydata: countrydata });
  },
  createCountryList: function () {
    var self = this;
    var data = self.data.soacountrydata;
    var hotcountrylist = [];
    var country = {};
    var selCountry=0;
    if (data && data.inlandCountries && data.inlandCountries.hotCountries) {
      data.inlandCountries.hotCountries.forEach(function (item, j) {
        if (self.isDefaultHighLight(item)) {
          index = prop;
          selCountry=1;
        } else {
          selCountry = 0;
        }
        country = { code: item.code, countrycode: item.country, countryname: item.cn, countryename: item.en, selectedCountry: selCountry };
        hotcountrylist.push(country);
      });
    }
    var countryTaglist = [];
    var countryMain = {};
    var cIndexs = [];
    var index = "";
    if (data && data.inlandCountries && data.inlandCountries.countryMainList) {
      for (var prop in data.inlandCountries.countryMainList) {
        index ="";
        //过滤掉空的数据
        if (data.inlandCountries.countryMainList[prop].length>0){
          data.inlandCountries.countryMainList[prop].forEach(function (item, i) {
            var countrydata = {};
            if (self.isDefaultHighLight(item)) {
              index = prop;
              selCountry = 1;
            } else {
              selCountry = 0;
            }
            country = { code: item.code, countrycode: item.country, countryname: item.cn, countryename: item.en, selectedCountry: selCountry };
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
    this.setData({ countryIndexs: cIndexs });
    var tmps = {inlandCountries: { hotCountries: hotcountrylist, countryMainList: countryMain }, interCountries: { hotCountries: [], countryMainList: {} } };
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
  compareToPy: function (a, b) {
    var py1 = this.getPyInitial(a.py), py2 = this.getPyInitial(b.py);
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
    if (!this.data.selectedCode) { return false; }
    var selcode = this.data.selectedCode;
      if (data.code != selcode) {
        return false;
      }
    return true;
  }
})