/**
 * 国际城市组件
 * @module component/city
 */
import util from "../../../common/util"
import TPage from '../../../common/TPage'
import { cwx } from '../../../../../cwx/cwx.js'
import { OverseaStationStore } from "../../../common/store"
import {
  citySearchInner
} from '../../../common/model'
import {
  getConfigByKeysPromise
} from '../../../common/common'
TPage({
  pageId: "",
  data: {
    title: '请选择城市',
    searchValue: "",
    isSearchView: false, //搜索页面
    isSearchFocus: false, //搜索框是否聚焦
    inputKeyword: "",
    loadDataFinish: false, //初始加载
    currentTag: '', //当前点击的右侧字母tag
    currentLeftTab: 'history', //当前点击的左侧标签,分为三类：'history','hot',countryCode
    showInter: false,
    cityTags: [],//右侧tag
    selectedCity: '', //选择的城市
    showMask: false,
    locationsData: {},//初始获取的全部数据
    currentTabCities: {},
    scrollIntoViewDomId: '',
    stationType: '', //出发or到达
    currentCountryName: '',
    searchListData: [],
    searchListTmpData: [],
    showMoreTabBarVisible: true, //展开更多数据
    showKorea: true,
  },

  onReady() {
    cwx.setNavigationBarTitle({
      title: this.title,
    })
    this.initCurrentTab()
  },
  async onLoad(options) {
    const { title, selectCityName, showKorea } = options
    cwx.setNavigationBarTitle({
      title,
    })
    this.selectCityName = selectCityName
    let locationsData = {
      countryLocation: OverseaStationStore.getAttr('countryLocation') || [],
      hotCountryList: OverseaStationStore.getAttr('hotCountryList') || [],
      hotLocationList: OverseaStationStore.getAttr('hotLocationList') || [],
      historyLocationList: this.preHandleHistoryData(),
    }
    this.setData({
      locationsData,
      showKorea,
    })
  },
  preHandleHistoryData() {
    let historyLocationList = OverseaStationStore.getAttr('historyLocationList') || []
    historyLocationList.forEach((e) => {
      e.active = (e.CName === this.selectCityName || e.EName === this.selectCityName)
    })
    return historyLocationList
  },
  clearHistory() {
    this.setData({
      locationsData: {
        ...this.data.locationsData,
        historyLocationList: [],
      },
    })
    OverseaStationStore.setAttr('historyLocationList',[])
  },

  cityTap(e) {
    let dataItem = e.currentTarget.dataset.dataitem
    console.log(dataItem)

    let selectCity = dataItem
    if (selectCity.hasOwnProperty('CNameColor')) {
      delete selectCity.CNameColor
    }
    if (selectCity.hasOwnProperty('ENameColor')) {
      delete selectCity.ENameColor
    }
    if (selectCity.hasOwnProperty('active')) {
      delete selectCity.active
    }

    this.invokeCallback(selectCity)
    this.navigateBack()
  },
  searchInput(e) {
    console.log(e)
    const value = e.detail.value
    console.log(value)
    this.setData({
      inputKeyword: value,
    })
    if (this.data.inputKeyword === '') {
      this.setData({
        isSearchView: false,
        showMask: true,
      })

      return
    }
    this.search()
  },
  async search() {
    const params = {
      key: this.data.inputKeyword,
      searchType: 2,
      tab: 'eurail',
      type: 0,
    }
    try {
      const res = await util.promisifyModel(citySearchInner)(params)
      if (res.header.retCode === 200) {
        //过滤欧铁数据
        const result = res.CityItems
        let corlorTxt = (item, keyword) => {
          const indexStart = item.indexOf(keyword)
          const indexEnd = indexStart + keyword.length
          if (indexStart === -1) return item

          return `<p>${item.slice(0, indexStart)}<span style="color: #016FF6">${item.slice(indexStart, indexEnd)}</span>${item.slice(indexEnd)}</p>`
        }
        result.forEach(res => {
          res.CNameColor = corlorTxt(res.CName, this.data.inputKeyword)
          res.ENameColor = corlorTxt(res.EName, this.data.inputKeyword)
        })
        this.setData({
          searchListTmpData: result,
          searchListData: result.slice(0,7),
          isSearchView: true,
          showMask: false,
          showMoreTabBarVisible: true,
        })
      }
    } catch (error) {
      console.log('citySearchInner接口错误', error)
    }
  },
  tapMask() {
    this.setData({
      isSearchFocus: false,
      showMask: false,
    })
  },
  disableScroll() {
    this.setData({
      scrollStyle: 'disableScroll',
    })
  },
  gotoSearch() {
    if (this.data.isSearchView) {
      return
    }
    this.setData({
      isSearchFocus: true,
      showMask: true,
    })
  },
  searchClear() {
    this.setData({
      inputKeyword: "",
      showMask: true,
      isSearchView: false,
      searchResult: [],
    })
    // const query = wx.createSelectorQuery().select('.search-module_input')
    // query.exec()
    // console.log(query)
  },
  onClickCancel() {
    this.setData({
      isSearchView: false,
      inputKeyword: "",
      showMask: false,
      isSearchFocus: false,
      searchResult: [],
    })
    wx.hideKeyboard()
  },
  //点击右侧tag
  tagTap(e) {
    const tag = e.currentTarget.dataset.citytag
    console.log(tag)
    this.setData({
      scrollIntoViewDomId: tag,
    })
    console.log(this.data.scrollIntoViewDomId)
  },
  //点击左侧tab
  onClickTab(e) {
    const currentLeftTab = e.currentTarget.dataset.currentlefttab
    this.setData({
      currentLeftTab,
    })
    e.currentTarget.dataset?.currentcountryname && this.setData({
      currentCountryName: e.currentTarget.dataset?.currentcountryname,
    })
    if (currentLeftTab === 'history') return
    let currentTabCities = this.data.locationsData.countryLocation[currentLeftTab]
    let cityTags = Object.keys(currentTabCities.allLocationList)
    const tag = currentTabCities.hotLocationList.length > 0 ? 'hot' : cityTags.length > 0 ? cityTags[0] : null
    this.setData({
      currentTabCities,
      cityTags,
      scrollIntoViewDomId: tag,
    })
  },
  //获取tab标签
  initCurrentTab() {
    if (this.data.locationsData?.hotLocationList?.length > 0 || this.data.locationsData?.historyLocationList?.length > 0) {
      this.setData({
        currentLeftTab: 'history',
      })
    } else if (this.data.locationsData?.hotCountryList?.length > 0) {
      const currentLeftTab = this.data.locationsData?.hotCountryList[0].countryCode
      const currentTabCities = this.data.locationsData.countryLocation[currentLeftTab]
      this.setData({
        currentLeftTab,
        currentTabCities,
        cityTags: Object.keys(currentTabCities.allLocationList),
      })
    }
    this.setData({
      loadDataFinish: true,
    })
  },
  showMore() {
    this.setData({
      searchListData: this.data.searchListTmpData,
      showMoreTabBarVisible: false,
    })
  },
  dropList() {
    this.setData({
      searchListData: this.data.searchListTmpData.slice(0,7),
      showMoreTabBarVisible: true,
    })
  },
})
