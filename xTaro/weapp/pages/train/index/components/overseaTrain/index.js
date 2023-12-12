import { OverseaTrainQueryStore, OverseaStationStore } from "../../../common/store"
import cDate from "../../../common/cDate"
import util from "../../../common/util"
import {openCalendar} from "../../../common/common"
import { shared } from "../../../common/trainConfig"
import { cwx, _ } from "../../../../../cwx/cwx"
import {
  getHotLocation,
  getPTPPassengerAgeRangeInfo,
  getUserCouponByProductType
} from '../../../common/model'
import {
  getConfigByKeysPromise
} from '../../../common/common'

const systeminfo = wx.getSystemInfoSync()
const defaultPassengerInfo = {
  adultData: {
    max: 59,
    min: 30,
    chooseMaxNum: 3,
    num: 1,
  },
  childData: {
    max: 29,
    min: 4,
    chooseMaxNum: 9,
    num: 0,
    list: [],
  },
  oldData: {
    min: 60,
    chooseMaxNum: 3,
    num: 0,
  },
  tips: [
    '每笔订单最多可选择9名乘客',
    '3周岁（含）以下儿童不占座，免费乘车',
    '乘客年龄以乘车当天年龄为准'
  ],
  maxPassenagerNum: 9,
}
const DEFAULT_AGE_RANGE = {
  MaxPassenagerNum: 9,
  RangeList: [
    { MaxAge: 60, Type: 1, MinAge: 30 }, 
    { MaxAge: 30, Type: 2, MinAge: 4 }, 
    { MaxAge: 30, Type: 3, MinAge: 4}, 
    { MaxAge: 999, Type: 4, MinAge: 60 }, 
    { MaxAge: 4, Type: 5, MinAge: 0 }
  ]
}

Component({
  properties: {
    selectedtag: {
      type: String,
      value: '',
    },
    activeFlag: {
      type: Boolean,
      value: false,
    },
    overseaPassengerInfo: {
      type: Object,
      value: null
    },
    utmSource: {
      type: String,
      value: ''
    }
  },
  lifetimes: {
    attached: function() {
      this.loadQueryFromStore()
      this.getUserCoupon()
      this.getConfigs()
    },
  },
  data: {
    exchange: false,
    monthDay: "",
    dayInfo: "",
    fromCityStyle: 0,
    toCityStyle: 0,
    today:"",
    historyPairs:[],
    adultNumber: 1,
    childNumber: 0,
    elderNumber: 0,
    showChangeTip: false,
    passengerInfo:{},// 乘客信息
    newAdvertiseData: {
      width: systeminfo.windowWidth,
    },
    statusBarHeight: systeminfo.statusBarHeight,
    passengerChoiceVisible: false, //乘客数量选择器
    isTrainApp: shared.isTrainApp,
    isCtripApp: shared.isCtripApp,
    isIphoneX: util.isIphoneX(),
    userCoupon: {}, // 用户优惠券
    fromCity: '',
    toCity: '',
    departDate: null,
    departTime: null,
    showKoreaBanner: true,
    bannerDesc: '',
    fromType: '',
    toType: '',
    hiddenChoose: false
  },
  observers: {
    "fromCity":function(fromCity) {
      this.setData({
        fromCityStyle : fromCity.length < 6 ? 0 : fromCity.length < 18 ? 1 : 2,
      })
    },
    "toCity": function(toCity) {
      this.setData({
        toCityStyle: toCity.length < 6 ? 0 : toCity.length < 18 ? 1 : 2,
      })
    },
    "departDate": function(date) {
      let monthDay = cDate.parse(date).format("n月j日")
      let today = new cDate().format("n月j日")
      let dayInfo =
				cDate.parse(date).format("D") +
				" " +
				cDate.weekday(date)
      this.setData({
        monthDay,
        today,
        dayInfo,
      })
    },
    'activeFlag': async function(activeFlag) {
      if (activeFlag && !this.notFirstActive) {
        this.notFirstActive = true
        await this.initStationData()
        this.loadQueryFromStore()
        await this.getAgeRange()
      }
    },
    overseaPassengerInfo: function(overseaPassengerInfo) {
      if (!overseaPassengerInfo) {
        return 
      }
      this.setData({
        passengerInfo: overseaPassengerInfo
      })
    }
  },
  methods: {
    loadQueryFromStore() {
      const tmp = OverseaTrainQueryStore.get()
      const fromCity = tmp.fromCity || '罗马'
      const toCity = tmp.toCity || '佛罗伦萨'
      const fromType = tmp.overseaFromCityInfo?.CountryCName
      const toType = tmp.overseaToCityInfo?.CountryCName
      const fromCityCode = tmp.fromCityCode
      const toCityCode = tmp.toCityCode
      this.overseaFromCityInfo = tmp.overseaFromCityInfo || this.getCityInfoByNameCode(fromCity, fromCityCode)
      this.overseaToCityInfo = tmp.overseaToCityInfo || this.getCityInfoByNameCode(toCity, toCityCode)
      let departDate = tmp.departureDate || ""
      let departTime = tmp.departureTimeLow || ""
      const passengerInfo = tmp.passengerInfo || defaultPassengerInfo
      if (
        new cDate(departDate).getTime() <=
                    new cDate().addDay(-1).getTime() ||
                !departDate
      ) {
        departDate = new cDate().addDay(1).format("Y-m-d")
      }
      if ( !departTime ) {
        departTime = '08:00'
      }
      let hiddenChoose
      if(fromType === '韩国' || toType === '韩国') {
        hiddenChoose = true
      }

      this.setData({
        fromCity,
        toCity,
        departDate,
        departTime,
        passengerInfo,
        fromType,
        toType,
        hiddenChoose,
      })
    },
    getCityInfoByNameCode(name, code) {
      const countryLocation = OverseaStationStore.getAttr('countryLocation')
      if (!countryLocation) {
        return null
      }

      let cityInfo = null
      Object.keys(countryLocation).find(key => {
        const allLocation = countryLocation[key].allLocationList
        const hotLocationList = countryLocation[key].hotLocationList

        cityInfo = hotLocationList.find(item => item.CName === name || item.Code === code)
        if (cityInfo) {
          return true
        }

        return Object.keys(allLocation).find(letterKey => {
          cityInfo = allLocation[letterKey].find(item => item.CName === name || item.Code === code)

          return cityInfo
        })
      })

      return cityInfo
    },
    async getUserCoupon() {
      // prductTypeList 1: "欧洲点对点" 2: "欧洲通票" 3: "台湾普铁"4: "台湾高铁" 5: "香港通票"6: "日本通票"7: "日本点对点"8: "韩国点对点"
      // 9: "新马点对点"10: "韩国通票"11: "新马通票"12: "泰国点对点"13: "泰国通票"
      const params = {
        productTypeList:[1], // 目前只有欧洲点对点
      }
      try {
        const res = await util.promisifyModel(getUserCouponByProductType)(params)
        if (res.header.code === 200) {
          this.setData({
            userCoupon: {
              couponNum: res.couponList?.length,
              maxDiscountAmount: res.maxDiscountAmount,
            },
          })
          console.log("res",this.data.userCoupon)
        }
      } catch (e) {
        console.log(e)
      }
    },
    toCouponListPage() {
      cwx.navigateTo({url: `/pages/market/promocode/index/index?p=26&o=0`})
    },
    async chooseStation(e) {
      let type = e.currentTarget.dataset.type
      let oldCity = this.overseaFromCityInfo

      await this.initStationData()
      const city = await this.openForeignCity(type)
      this.pushToHistory(city)
      if (type === "d") {
        this.overseaFromCityInfo = city
        if(city.CountryCName === '韩国') {
          this.setData({
            hiddenChoose: true
          })
        } else if(this.data.toType !== '韩国') {
          this.setData({
            hiddenChoose: false
          })
        }
        this.setData({
          fromCity: city.CName !== '' ? city.CName : city.EName,
          fromType: city.CountryCName
        })
        // 更换出行地后，根据所选城市动态变更时间选择器
        this.compareDateRange(oldCity, city)
      } else {
        this.overseaToCityInfo = city
        if(city.CountryCName === '韩国') {
          this.setData({
            hiddenChoose: true
          })
        } else if(this.data.fromType !== '韩国') {
          this.setData({
            hiddenChoose: false
          })
        }
        this.setData({
          toCity: city.CName !== '' ? city.CName : city.EName,
          toType: city.CountryCName
        })
      }
      // 更换出行地或到达地选择城市后，根据所选城市判断乘客年龄范围
      await this.getAgeRange()


      // 切换车站，清空人数选择
      // this.setData({
      //     adultNumber: 1,
      //     childNumber: 0,
      //     elderNumber: 0,
      //     showChangeTip: true
      // })
    },
    pushToHistory(data) {
      let hList = OverseaStationStore.getAttr('historyLocationList') || []
      let tmp = _.find(hList, h => (h.Code == data.Code))
      let idx = hList.indexOf(tmp)
      if (idx > -1) {
        hList.splice(idx, 1)
      }
      hList.unshift(data)
      hList = hList.slice(0, 8)
      OverseaStationStore.setAttr('historyLocationList', hList)
    },
    async openForeignCity(type) {
      let cityRes = new Promise((res) => {
        const curpage = cwx.getCurrentPage()
        console.log(this.data.fromCity,this.data.toCity, type)
        curpage.navigateTo({
          url: `/pages/train/index/components/city/city?title=${type === 'd' ? '出发' : '到达'}&selectCityName=${type === 'd' ? this.data.fromCity : this.data.toCity}&showKorea=${this.data.showKoreaBanner}`,
          immediateCallback: res,
        })
      })

      return cityRes
    },
    async initStationData() {
      if (!this.getLocationsPromise) {
        this.retryNum = 0
        this.getLocationsPromise = this.loadForeignLocations()
      }

      const version = OverseaStationStore.getAttr('version') || ''
      //判断缓存的version 与 qconfig配置数据是否相同
      if (version !== this.stationVersion) {
        try {
          let res = await this.getLocationsPromise
          OverseaStationStore.setAttr('hotLocationList', res.hotLocationList)
          OverseaStationStore.setAttr('hotCountryList', res.hotCountryList)
          OverseaStationStore.setAttr('countryLocation', res.countryLocation)
          OverseaStationStore.setAttr('version', res.version)
        } catch(err) {
          console.log('getHotLocation接口错误', err)
          this.retryNum ++ 
          if(this.retryNum <= 3) {
            this.getLocationsPromise = this.loadForeignLocations()
            await this.initStationData()
          } else {
            cwx.showToast({
              title: '服务器出错，请稍后重试',
              icon: "none"
            })
          }
        }
      }
    },
    /**
         * [loadForeignLocations 获取所有火车站信息]
         * @return {[type]} [description]
         */
    handleStation(all) {
      if (all === {}) return
      let stations = []
      let result = {} //记录对每项的allLocationList排好序的数据
      //遍历countryLocation Map，对每个value（每个tab对应的城市信息，根据字母顺序进行排列）
      _.each(all, (e, key) => {
        let tmp = {}
        const {hotLocationList, allLocationList} = e
        stations = [...allLocationList]
        stations = _.sortBy(stations, 'SpellLetter')
        _.each(stations, s => {
          if (!tmp[s.SpellLetter]) {
            tmp[s.SpellLetter] = []
          }
          tmp[s.SpellLetter].push(s)
        })
        result[key] = {
          hotLocationList: hotLocationList,
          allLocationList: tmp,
        }
      })

      return result
    },
    async loadForeignLocations () {
      util.showLoading()
      const params = {
      }
      try {
        const res = await util.promisifyModel(getHotLocation)(params)
        if (res.header.retCode === 200) {
          const {countryLocation, hotLocationList, hotCountryList, version} = res
          let countryLocationSorted = this.handleStation(countryLocation)
          //屏蔽韩国、台湾
          let hotCountryListFiltered = hotCountryList.filter((e) =>
            e.countryCode !== 'TW'
          )
          // 调整韩国展示顺序
          const target = hotCountryListFiltered.pop()
          hotCountryListFiltered.unshift(target)
          util.hideLoading()

          return {
            hotLocationList: hotLocationList,
            hotCountryList: hotCountryListFiltered,
            countryLocation: countryLocationSorted,
            version: version,
          }
        }
      } catch (error) {
        util.hideLoading()
        console.log('getHotLocation失败', error)
      }
    },
    choosePassengerNum() {
      this.triggerEvent('onClickPassengerChoice', { passengerInfo: this.data.passengerInfo});
      this.hideTipTop();
    },
    chooseTime(e) {
      console.log("chooseTime",e)
      const { value } = e.detail
      this.setData({
        departTime: value,
      })
    },
    railWayConflict(from, to) {
      return (from === '韩国' && to !== '韩国') || (to === '韩国' && from !== '韩国')
    },
    isKoreaWay(from,to) {
      return from === '韩国' && to === '韩国'
    },
    search() {
      const {
        fromCity,
        exchange,
        toCity,
        departDate,
        departTime,
        passengerInfo,
        utmSource,
        fromType,
        toType
      } = this.data
      if (fromCity === toCity) {
        return util.showModal({ m: "出发和到达站不能相同，请重新选择" })
      }
      if(this.railWayConflict(fromType, toType)) {
        cwx.showToast({
          title: '该路线铁路暂未联通，请重新选择',
          icon: "none"
        })
        return
      }
      let tmp = {
        departureDate: departDate,
        departureTimeLow: departTime,
      }
      if (exchange) {
        tmp.fromCity = toCity
        tmp.toCity = fromCity
        tmp.overseaFromCityInfo = this.overseaToCityInfo || {}
        tmp.overseaToCityInfo = this.overseaFromCityInfo || {}
      } else {
        tmp.fromCity = fromCity
        tmp.toCity = toCity
        tmp.overseaFromCityInfo = this.overseaFromCityInfo || {}
        tmp.overseaToCityInfo = this.overseaToCityInfo || {}
      }
      tmp.passengerInfo = passengerInfo
      OverseaTrainQueryStore.set(tmp)

      const childData = tmp.passengerInfo.childData?.list || []
      const ageSet = new Set(childData)
      const childList = Array.from(ageSet).map(age => ({age, count: childData.filter(item => item === age).length}))
      const params = {
        fromcity: tmp.fromCity,
        fromcitycode: tmp.overseaFromCityInfo.Code,
        fromcityename: tmp.overseaFromCityInfo.EName,
        fromcitycountry: tmp.overseaFromCityInfo.CountryCName,
        tocity: tmp.toCity,
        tocityename: tmp.overseaToCityInfo.EName,
        tocitycode: tmp.overseaToCityInfo.Code,
        tocitycountry: tmp.overseaToCityInfo.CountryCName,
        searchPassengerInfo: {
          adults: tmp.passengerInfo.adultData?.num,
          seniors: tmp.passengerInfo.oldData?.num,
          teens: childList,
        },
        departuredate: tmp.departureDate,
        departuretimelow: tmp.departureTimeLow,
        selectedtag: 'eurail',
        childyouthrangelist: [],
        datatype: 1,
      }
      const paramsAsian = {
        fromCode: tmp.overseaFromCityInfo.Code,
        toCode: tmp.overseaToCityInfo.Code,
        from: tmp.fromCity,
        to: tmp.toCity,
        departureDate: tmp.departureDate,
        departuretimelow: tmp.departureTimeLow
      }
      if (utmSource) {
        params.utmSource = utmSource
      }
      if(this.isKoreaWay(fromType, toType) && this.data.showKoreaBanner) {
        const temp = `https://m.ctrip.com/webapp/train-abroad/koreaList?params=${JSON.stringify(paramsAsian)}`
        const url = `/cwx/component/cwebview/cwebview?data=${JSON.stringify({
          url: encodeURIComponent(temp)
        })}`
        cwx.navigateTo({
          url
        })
      } else {
        cwx.navigateTo({
          url:
            `/pages/trainAbroad/euList/index?params=${encodeURIComponent(JSON.stringify(params))}`,
        })
      }
    },
    getDateLength(fromCountry) {
      if (fromCountry === '瑞士' || fromCountry === '台湾') {
        return 60
      } else if (fromCountry === '西班牙' || fromCountry === '韩国' || fromCountry === '香港') {
        return 30
      }

      return 90
    },
    chooseDate() {
      let choosenDate = this.data.departDate
      openCalendar(
        {
          choosenDate,
          title: "选择出发日期",
          withoutInfo: true,
          enddate: cDate.createUTC8CDate().addDay(this.getDateLength(this.overseaFromCityInfo.CountryCName)).format('Y-n-j'),
        },
        date => {
          let departDate = cDate.parse(date).format("Y-m-d")
          let monthDay = cDate.parse(date).format("n月j日")
          let today = new cDate().format("n月j日")
          let nextDay = new cDate().addDay(1).format("n月j日")
          let dayInfo =
                    cDate.parse(date).format("D") +
                    " " +
                    cDate.weekday(departDate)

          this.setData({
            departDate,
            monthDay,
            nextDay,
            today,
            dayInfo,
          })
        }
      )
    },
    exchangeStation() {
      this.setData({
        exchange: !this.data.exchange,
      })
      // if (this.data.exchange) {
      //   this.setData({
      //     departCtripCityName: this.data.arriveCtripCityName,
      //     arriveCtripCityName: this.data.departCtripCityName,
      //   })
      // } else {
      //   this.setData({
      //     departCtripCityName: this.data.departCtripCityName,
      //     arriveCtripCityName: this.data.arriveCtripCityName,
      //   })
      // }
    },
    testHandle(event) {
      this.triggerEvent("testHandle", event)
    },
    async getConfigs() {
      try {
        const configRes = await getConfigByKeysPromise({
          keys: ["wechat-overseas-train-configs"],
        })
        if (configRes.resultCode != 1) {
          throw '配置获取失败'
        }
        this.stationVersion = configRes.configs[0].data.stationVersion
        this.koreaOpen = configRes.configs[0].data.koreaSwitch
        this.setData({
          showKoreaBanner: this.koreaOpen,
          bannerDesc: configRes.configs[0].data.koreaBannerTitle || '韩国火车票已支持预定!'
        })
      } catch (err) {
        console.log(err)
      }
    },
    async getAgeRange() {
      try {
        const res = await util.promisifyModel(getPTPPassengerAgeRangeInfo)({})
        console.log(res)
        if (res.RetCode === 1) {
          this.newAgeInfo = {};
          const fromCityCountry =  this.overseaFromCityInfo.CountryCName
          const toCityCountry =  this.overseaToCityInfo.CountryCName
          if (fromCityCountry === toCityCountry && fromCityCountry !== '荷兰') {
            this.newAgeInfo = res?.AgeRangeList.find(item => item.CountryName === fromCityCountry) || DEFAULT_AGE_RANGE;
          } else {
            this.newAgeInfo = res?.AgeRangeList.find(item => item.CountryName === 'system') || DEFAULT_AGE_RANGE;
          }
          let minChildNum = this.newAgeInfo.RangeList.find(item => item.Type === 5).MaxAge
          let passengerNums = ['adultData', 'childData','oldData'].reduce((pre,cur)=>pre+this.data.passengerInfo[cur].num,0);
          let passengerInfo = passengerNums <= this.newAgeInfo.MaxPassenagerNum ? this.data.passengerInfo : defaultPassengerInfo;
          this.setData({
            passengerInfo: {
              ...passengerInfo,
              tips: [
                `每笔订单最多可选择${this.newAgeInfo.MaxPassenagerNum}名乘客`,
                `${minChildNum-1}周岁（含）以下儿童不占座，免费乘车`,
                '乘客年龄以乘车当天年龄为准'
              ],
              maxPassenagerNum: this.newAgeInfo.MaxPassenagerNum,
            },
            showChangeTip: passengerNums > this.newAgeInfo.MaxPassenagerNum
          })
        }
      } catch (e) {
        console.log(e)
        cwx.showToast({
          title: '服务器出错，请稍后重试',
          icon: "none"
        })
      }
    },
    compareDateRange(oldCity, newCity) {
      const oldDateLength = this.getDateLength(oldCity.CountryCName)
      const newDateLength = this.getDateLength(newCity.CountryCName)
      if (newDateLength < oldDateLength) {
        const chooseDate = cDate.parse(this.data.departDate).getTime()
        const newDepartMaxDate  = new cDate().addDay(newDateLength).getTime()
        if (chooseDate > newDepartMaxDate) {
          cwx.showToast({
            title: '因切换出行地导致最长可售期改变，请重新选择出行日期',
            icon: "none"
          })
          this.setData({
            departDate: new cDate().format("Y-m-d")
          })
        }
      }
    },
    hideTipTop() {
      this.setData({
        showChangeTip: false
      })
    }
  },
})
