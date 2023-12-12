import { _ } from '../../../../../cwx/cwx'
import util from '../../../common/util'
import cDate from '../../../common/cDate'
import { TrainStationStore } from '../../../common/store'
import {
    TrainStationModel,
    trainOrderRecommendHotelV2Model
} from '../../../common/model'

export default {
    data: {
        hotelConfig: {
            inDay: '', // 入住时间
            outDay: '', // 离开时间
            days: 1, // 天数
            hasSelectedDate: false, // 是否主动选择过时间
            showHotel: true, // 显示酒店服务模块
            cityid: 2,
            cityname: '上海',
            handle: true,
        },
        paramTime: { // 酒店服务时间格式不统一 此处为传值格式
            inDay: '',
            outDay: '',
        },
        hotelList: [],
        jumpHotelIndexUrl :""
    },
    methods: {
        toTrainOrderRecommendHotel(e) {
            util.ubtTrace('c_trn_c_10320640941', {bizKey: "hotelUnitClick"});
            const { url } = e.currentTarget.dataset
            if(!url) {
                this.toHotelList()
            }
            util.jumpToUrl(url)
        },
        getHotelRecommendList(oid) {
            const params = {
                fromType: 'WX_XCX',
                OrderNumber: oid
            }
            trainOrderRecommendHotelV2Model(params, res => {
                if ( res.HotelList) {
                    this.setData({
                        hotelList:res.HotelList,
                        jumpHotelIndexUrl: res.JumpUrl
                    })
                    util.ubtTrace('s_trn_c_trace_10320640941', {bizKey: "hotelUnitRecommend",exposureType:"normal"});
                }
             })
        },
        // 初始化酒店信息
        initHotelTime ({arriveTime} = {}) {
            let hour = new Date(arriveTime).getHours()
            let hotelConfig = {}
            let paramTime = {}

            if ((Date.parse(new Date()) - arriveTime) > 24 * 3600 * 1000) {
                this.setData({
                    ['hotelConfig.showHotel']: false,
                })

                return
            }
            // 到达时间在凌晨 0 - 6点 入店时间为到达日期前一天  否则为到达日期
            if (hour >= 0 && hour <= 5) {
                hotelConfig.inDay = new cDate(arriveTime).addDay(-1).format('n月j日')
                paramTime.inDay = new cDate(arriveTime).addDay(-1).format('Y-m-d')
                hotelConfig.days = 2
            } else {
                hotelConfig.inDay = new cDate(arriveTime).format('n月j日')
                paramTime.inDay = new cDate(arriveTime).format('Y-m-d')
                hotelConfig.days = 1
            }
            hotelConfig.outDay = new cDate(arriveTime).addDay(1).format('n月j日')
            paramTime.outDay = new cDate(arriveTime).addDay(1).format('Y-m-d')

            this.setData({
                hotelConfig: Object.assign(this.data.hotelConfig, hotelConfig),
                paramTime: paramTime,
            })
            if (this.data.hotelConfig?.handle && this.data.isSuccess && this.data.hotelConfig?.cityname && this.data.hotelConfig?.showHotel) {
                this.ubtTrace('o_traapplets_orderdetailpage_hotel_expo', true)
            }
        },
        // 获取酒店城市信息
        getHotelCityInfo (shared) {
            const setHotel = (obj) => Object.keys(obj).forEach((key) => {
                for (let item of obj[key]) {
                    if (item.cityName === shared.orderinfos?.station?.arriveStation) {
                        this.setData({
                            ['hotelConfig.cityname']: item.CtripCityName,
                            ['hotelConfig.cityid']: item.CtripCityID,
                        })
                    }
                }
            })
            if (!TrainStationStore.get()?.cityMainList) {
                util.showLoading()
                TrainStationModel({}, (data) => {
                    if (data.TrainStationsInfo) {
                        let stations = []
                        let tmp = {}
                        _.each(data.TrainStationsInfo, (station) => {
                            let temp = {
                                cityName: station.StationName, // 火车站名称
                                CtripCityName: station.CityName, // 火车站所在城市名称
                                cityID: station.StationID,
                                py: station.PinYin,
                                pyHead: station.PinYinHead,
                                firstLetter: station.FirstLetter,
                                CtripCityID: station.CtripCityID,
                            }
                            stations.push(temp)
                        })

                        stations = _.sortBy(stations, 'firstLetter')

                        _.each(stations, s => {
                            if (!tmp[s.firstLetter]) {
                                tmp[s.firstLetter] = []
                            }

                            tmp[s.firstLetter].push({cityName: s.cityName,CtripCityName: s.CtripCityName, cityID: s.cityID, py: s.py, pyHead: s.pyHead, CtripCityID: s.CtripCityID})
                        })

                        TrainStationStore.setAttr('cityMainList', tmp)
                        // 可能存在存入缓存失败的情况 这里遍历存入缓存的数据而不是缓存
                        setHotel(tmp)
                    }
                }, () => {}, () => {
                    util.hideLoading()
                })
            } else {
                try {
                    let obj = TrainStationStore.get().cityMainList
                    console.log('TRN: getHotelCityInfo has cache')
                    // if (!obj) {
                    //     console.log(Object.keys(TrainStationStore.get()))

                    //     return
                    // }
                    setHotel(obj)
                } catch (error) {
                }
            }
        },
        // 酒店服务 前往酒店列表
        toHotelList () {
            this.ubtTrace('o_traapplets_orderdetailpage_hotel_click', true)
            const params = {
                cityid: this.data.hotelConfig.cityid, //城市id
                cityname: this.data.hotelConfig.cityname, //城市名称
                inday: this.data.paramTime.inDay, // 入住时间
                outday:  this.data.paramTime.outDay, // 离店时间
                biz: 1, // 1: 国内  2: 国外
                did: '', // 景区id
                allianceid: '', // 分销联盟id
                sid: '', // 站点id
                keyword: '', // POI或特色关键词
            }
            this.navigateTo({
                url: `/pages/hotel/list/index?cityid=${params.cityid}&cityname=${params.cityname}&biz=${params.biz}&inday=${params.inday}&outday=${params.outday}&allianceid=263382&sid=1464971`,
            })
        },
    },
}
