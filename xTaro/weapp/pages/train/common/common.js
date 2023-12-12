// util中引用model.js会引起循环引用问题
import { cwx, _, __global } from '../../../cwx/cwx'
import util from './util'
import {
    TrainModifyPassengerModel,
    ConfigInfoModel as _ConfigInfoModel,
    RobTicketShareInfoModel as _RobTicketShareInfoModel,
    CalculateAcceleratePackageModel as _CalculateAcceleratePackageModel,
    ShareGrabModel as _ShareGrabModel,
    AccelerateGrabTicketRateModel as _AccelerateGrabTicketRateModel,
    GetGrabTicketSucRateInfoModel as _GetGrabTicketSucRateInfoModel,
    CouponListModel as _CouponListModel,
    TrainListModel,
    TrainChangeGrabTicketDetailOuterModel,
    GetPaySignModel,
    AcquireActivityCouponModel,
    GetCancelOrderRecommendInfoModel,
    GetOnTrainThenByTicketSoluModel,
    OrderCancelModel,
    PreHoldSeatResultModel,
    OrderDetailModel,
    TransferListModel,
    TrainGetPassengerListModel,
    trainGrabForecastInfoModel,
    GetRegister12306UserInfoModel,
    RegisterUserAccountInfoV2Model,
    CheckAccountCanLogOutV2Model,
    ctripNewGuestStepModel,
    LBSModel,
    modelList,
    createModel,
    TrainStationModel,
    getPrePayInfoForH5Model,
    GetActivityCouponInfoModel,
    GetShareImgModel,
    GetOrderHBInfoV2Model,
    getHBPeakPeriodStrategyModel,
    TrainGetPaymentRequestIdAuthModel,
    AddOrderAccountInfoModel,
    getConfigByKeysModel,
    getVendorListInfoV5Model,
    Sync12306OrderInfoModel,
    GetStationInfoV2Model,
    handleChildTicketModel,
    getDirectListTopQuickModel,
    getTrainSearchConditionModel,
    getLossGiftDetailModel,
    receiveLossGiftModel,
    promotionSendCouponInfoModel
} from './model'
import { TrainBookStore, TrainStationStore } from './store'
import { onLogin12306Success } from './account12306'
import cDate from './cDate'
import { shared } from './trainConfig'
export * from './service/12306'
export * from './service/success-rate'
export * from './service/book'


const DEBUG = false

// const env = __global.env

let host = 'https://m.ctrip.com/'
// if (env == 'fat') {
//     host = 'https://m.fws.qa.nt.ctripcorp.com/'
// } else if (env == 'uat') {
//     host = 'https://m.ctrip.uat.qa.nt.ctripcorp.com/'
// }

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));
function createPromise(...args) {
    return util.promisifyModel(createModel(...args))
}

let common = {
    upload12306pas(passengers, doneCb, progressCb) {
        if (passengers) {
            if (passengers.length == 0) {
                if (doneCb) {
                    doneCb()
                }

                return
            }

            let pas = passengers[0]
            if (pas.CheckStatus != 1) {
                common.upload12306pas(passengers.slice(1), doneCb, progressCb)

                return
            }

            const params = {
                Channel: 'ctripwx',
                TrainModifyInfo: {
                    CNName: pas.PassengerName,
                    IdentityNo: pas.IDNo,
                    IdentityType: ((IDType) => {
                        // IDType 1 二代身份证、C 港澳通行证、G台湾通行证、B护照
                        switch (IDType) {
                            case '1': case 1: default:
                                return 1
                            case 'C':
                                return 7
                            case 'G':
                                return 8
                            case 'B':
                                return 2
                        }
                    })(pas.IDType),
                    PassengerType: pas.PassengerType,
                },
            }

            let cb = () => {
                let tips = '导入12306联系人失败，请稍候再试'
                util.hideLoading()
                util.showToast(tips)
            }

            TrainModifyPassengerModel(params, data => {
                if (data && data.RetCode == 1) {
                    if (progressCb) {
                        progressCb({
                            pas: passengers[0],
                        })
                    }
                    common.upload12306pas(passengers.slice(1), doneCb, progressCb)
                } else {
                    cb.call(null)
                }
            }, () => {
                cb.call(null)
            }, () => {
            })
        }
    },
    setConfigSwitchAsync(ConfigKey, key = ConfigKey) {
        const params = {
            ConfigKey,
        }

        return new Promise((resolve) => {
            _ConfigInfoModel(params, data => {
                if (data.ConfigInfo && data.ConfigInfo.Content) {
                    resolve([util.setConfigSwitch(key, data.ConfigInfo.Content), key])
                } else {
                    resolve([util.setConfigSwitch(key, false), key])
                }
            }, () => {
                resolve([util.setConfigSwitch(key, false), key])
            })
        })
    },
    ShareGrabModel(...args) {
        return _ShareGrabModel(...args)
    },
    RobTicketShareInfoModel(...args) {
        return _RobTicketShareInfoModel(...args)
    },
    AccelerateGrabTicketRateModel(...args) {
        return _AccelerateGrabTicketRateModel(...args)
    },
    CalculateAcceleratePackageModel(...args) {
        return _CalculateAcceleratePackageModel(...args)
    },
    _GetPaySignPromise: util.promisifyModel(GetPaySignModel),
}

export default common

export function saveUserFormID(formId) {
    if (!formId) {
        return
    }
    cwx.mkt.saveUserFormID && cwx.mkt.saveUserFormID(formId)
}

export function TrainChangeGrabTicketDetailOuterPromise(params) {
    const _params = {
        "OrderId": '',
        "Channel": "ctripwx",
        "OrderType": "JL",
        "IsMember": true,
        "DepartStation": '',
        "ArriveStation": '',
        "DepartDateTime": '',
        "VendorID": "7", // 配置 key 为 7
    }
    Object.assign(_params, params)

    return util.promisifyModel(TrainChangeGrabTicketDetailOuterModel)(_params)
}
export function GetShareImgNew() {
    const params = {
        ConfigKey: 'train_wx_robshare_shareimgs_20191219',
    }

    return ConfigInfoPromise(params).then(data => {
        if (data.ConfigInfo && data.ConfigInfo.Content) {
            return data.ConfigInfo.Content.split(',')
        }
    })
}

/**
 * [GetShareImgPromise description]
 * @param    ShareKey: this.oid,
             RequestId: cwx.cwx_mkt.openid,
             ReqTime: '' + (new Date()).getTime(),
             Partner: 'ctrip',
             FromStation: '',
             ToStation: 'TicketInfos[0].ArriveStation',
             PassagePhotoUrl: '',
             channel: shared.channel
 * @constructor
 */
export function GetShareImgPromise(opts) {
    const deferred = util.getDeferred()
    let params = {
        ...opts,
        RequestId: cwx.cwx_mkt.openid,
        ReqTime: '' + (
            new Date()).getTime(),
        Partner: 'ctrip',
        channel: shared.channel,
    }
    GetShareImgModel(params, res => {
        if (res.ImgUrl) {
            deferred.resolve(res)
        } else {
            deferred.reject()
        }
    }, err => {
        deferred.reject(err)
    })

    return deferred.promise
}

/**
 * 发起带签名的支付
 * 注意虽然返回的是个promise，但成功状态下不会resolve，方便复用旧逻辑
 * @param {{token: String, extend: String}} params
 * @param {*} param1
 */
export function SignPay({ token = '',extend = '' }, {sbackCallback, ebackCallback, rbackCallback}) {
    if (token.oid) {
        token.oid = parseInt(token.oid)
    }

    function resetUnionFn(fn = () => {}) {
        return function (...args) {
            return fn(...args)
        }
    }

    let _sbackCallback = resetUnionFn(sbackCallback)
    let _ebackCallback = resetUnionFn(ebackCallback)
    let _rbackCallback = resetUnionFn(rbackCallback)

    let jsonToken = JSON.stringify(token)
    let jsonExtend = JSON.stringify(extend)
    const _params = {
        Token: jsonToken,
        Extend: jsonExtend,
    }

    return common._GetPaySignPromise(_params)
        .then(({ RetCode, PaySign, Message }) => {
            if (RetCode === 1) {
                if (DEBUG) {
                    const currentPage = cwx.getCurrentPage()
                    currentPage.ubtTrace(101554, {
                        s: PaySign,
                        extend: jsonExtend,
                        token: jsonToken,
                        t: cwx.util.base64Encode(jsonToken),
                        e: cwx.util.base64Encode(jsonExtend),
                    })
                }
                cwx.payment.callPay({
                    "data": {
                        'bustype': 4,
                        'oid': token.oid,
                        'token': cwx.util.base64Encode(jsonToken),
                        'extend': cwx.util.base64Encode(jsonExtend),
                        'sign': PaySign,
                    },
                    "sbackCallback": _sbackCallback,
                    "ebackCallback": _ebackCallback,
                    "rbackCallback": _rbackCallback,
                })
            } else {
                // resetUnion()

                return new Promise((resolve, reject) => {
                    reject({
                        RetCode,
                        Message,
                    })
                })
            }
        }, (err) => {
            // resetUnion()

            return new Promise((resolve, reject) => {reject(err)})
        })
}

/**
 * 火车票发起支付通用方法，会先请求 requestId， 再请求 paySign, 最后调用支付的 callPay
 * @param {{token, extend, options}} payParams 传递给callPay的所有参数,
 *          其中options目前只有是否启用立减金的设置
 * @param {*} callbacks 传递回调函数，包括支付回调，以及接口请求失败的回调
 */
export function RequestSignPay({
    token = {}
}, {
    sbackCallback,
    ebackCallback,
    rbackCallback
}) {
    if (token.oid) {
        token.oid = parseInt(token.oid)
    }
    TrainGetPaymentRequestIdAuthModel({
        OrderNumber: token.oid,
        Channel: 'ctrip.wx',
    }, res => {
        try {
            if (res.RetCode == 1 && res.PayType == 1) { // 新流程支付
                cwx.payment.callPay2({
                    "serverData": {
                        'orderId':token.oid,
                        'payToken': res.PayToken,
                        'busType': 4,
                        'requestId': res.PaymentRequestId,
                    },
                    "sbackCallback": sbackCallback,
                    "ebackCallback": ebackCallback,
                    "rbackCallback": rbackCallback,
                })
            } else { // 老流程支付
                throw new Error('请求失败')
            }
        } catch (error) {
            util.showModal({m: '支付遇到问题，请稍后重试'})
        }

    })
}
export function GetOnTrainThenByTicketSoluPromise(params) {
    return util.promisifyModel(GetOnTrainThenByTicketSoluModel)(params)
        .then(data => {
            const { GetOnTrainThenByTicketSoluList = [] } = data
            GetOnTrainThenByTicketSoluList.sort((trainA, trainB) => {
                const getSeatCount = (train) => {
                    const {
                        SolutionInfoList = [],
                    } = train
                    if (!SolutionInfoList.length) {
                        return 0
                    }
                    const {
                        SeatInfoList = [],
                    } = SolutionInfoList[0]
                    if (!SeatInfoList.length) {
                        return 0
                    }

                    return SeatInfoList[0].SeatCount
                }
                const getSoltionPrice = (train) => {
                    const {
                        SolutionInfoList = [],
                    } = train
                    if (!SolutionInfoList.length) {
                        return 0
                    }

                    return SolutionInfoList[0].RecommendPrice
                }
                let seatA = getSeatCount(trainA)
                let seatB = getSeatCount(trainB)
                if (seatA > 0 && seatB <= 0) {
                    return -1
                } else if (seatB > 0 && seatA <= 0) {
                    return 1
                } else {
                    let priceA = getSoltionPrice(trainA)
                    let priceB = getSoltionPrice(trainB)

                    return priceA - priceB
                }
            })

            return data
        })
}


export function trainGetPassengerListPromise(param) {
    const _params = {
        channel: 'ctripwx',
        ...param,
    }

    return util.promisifyModel(TrainGetPassengerListModel)(_params)
        .then(data => {
            if (data.TrainPassengerList) {
                let memberPas = util.handleMemPas(data.TrainPassengerList)
                memberPas = util.sortMemPas(memberPas)

                return { memberPas }
            } else {
                let memberPas = util.handleMemPas([])
                memberPas = util.sortMemPas(memberPas)

                return { memberPas }
            }
        }).catch(() => {
            let memberPas = util.handleMemPas([])
            memberPas = util.sortMemPas(memberPas)

            return { memberPas }
        })
}

export function GetOrderHBInfoV2Promise(params) {
    return util.promisifyModel(GetOrderHBInfoV2Model)(params)
}

export function getHBPeakPeriodStrategyPromise(params) {
    return util.promisifyModel(getHBPeakPeriodStrategyModel)(params)
}

/**
 * 暑运活动读取渠道列表，在以下渠道中，才符合唤起立减金的一个条件
 */
export function GetSummerUnions() {
    return ConfigInfoPromise({
        ConfigKey: 'train_wx_summeractivity_unions',
    }).then(data => {
        if (data.ConfigInfo && data.ConfigInfo.Content) {
            const unionList = data.ConfigInfo.Content.split(',')
            util.setConfig('train_wx_summeractivity_unions', unionList)

            return unionList
        }
    })
}

export function GetPreSaleDayConfig() {
    const ConfigKey = 'sale-day-12306'

    return ConfigInfoPromise({ ConfigKey })
        .then(res => {
            if (res.ConfigInfo && res.ConfigInfo.Content){
                const content = JSON.parse(res.ConfigInfo.Content)
                const { preSaleDays, preRobDays } = changeDay(content)
                shared.preSaleDays = preSaleDays || 30
                shared.preRobDays = preRobDays || 60
                shared.calendarTip = content.calendarTip || '春运火车票火热抢购中，提前下单出行更轻松'
            } else {
                shared.preSaleDays = 30
                shared.preRobDays = 60
                shared.calendarTip = '春运火车票火热抢购中，提前下单出行更轻松'
            }
        }).catch(() =>{
            shared.preSaleDays = 30
            shared.preRobDays = 60
            shared.calendarTip = '春运火车票火热抢购中，提前下单出行更轻松'
        },
        )
}

function changeDay({preSaleDays = 30, preRobDays = 60, policyChangeDate = '', policyEndDate = ''}){
    let res = {
        preSaleDays,
        preRobDays,
    }
    if (!policyChangeDate || !policyEndDate){
        return res
    }

    const changeDate = new Date(policyChangeDate).setHours(0,0,0,0)
    const endDate = new Date(policyEndDate).setHours(0,0,0,0)
    const nowStart = new Date().setHours(0,0,0,0)
    const diff = (endDate - nowStart) / (24 * 60 * 60 * 1000)
    const commonDiff = preRobDays - preSaleDays

    if (nowStart < changeDate){
        preSaleDays = diff
        preRobDays = commonDiff + preSaleDays
        res = {
            preSaleDays,
            preRobDays,
        }
    } else {
        res = {
            preSaleDays,
            preRobDays,
        }
    }

    return res
}

export function getConfigInfoJSON(ConfigKey = '') {
    return ConfigInfoPromise({ ConfigKey })
        .then(data => JSON.parse(data.ConfigInfo.Content))
        .catch(e => {
            console.log(e)
        })
}

/**
 * 读取候补票配置 V2
 */
let _hbConfigV2 = null
export function getHBConfigV2() {
    if (_hbConfigV2) {
        return Promise.resolve(_hbConfigV2)
    }
    const ConfigKey = 'train_wx_hbconfig_v2'

    return getConfigInfoJSON(ConfigKey)
        .then(data => {
            _hbConfigV2 = data

            return _hbConfigV2
        })
}

/**
 * 打开日历
 * @param {*} options 日历配置参数
 * {enddate: string} 默认为当前日期之后的第n天 n为可以抢票天数
 * @param {*} callback 选择日期后的回调函数
 */
export function openCalendar(options, callback) {
    const {
        choosenDate = '',
        title,
        enddate,
        withoutInfo = false,
    } = options
    let {
        tips = '',
    } = options
    let choosenDate_Ynj = cDate.createUTC8CDate(choosenDate).format('Y-n-j')
    let today = cDate.createUTC8CDate().format('Y-n-j')
    let endDate = enddate || cDate.createUTC8CDate().addDay(shared.preRobDays - 1).format('Y-n-j')
    let info = withoutInfo ? null : util.getCalendarInfo(endDate)
    if (!util.isUTC8()) {
        tips = '出发到达时间均为北京时间'
    }
    cwx.component.calendar({
        choosenDate: choosenDate_Ynj,
        beginDate: today,
        endDate,
        title,
        tips,
        info,
    }, callback)
}

/**
 * 打开国家地区手机区号
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
export function openCountryCode (options) {
    cwx.component.areas({
        immediateCallback: options.callback,
    })
}

const hotCities = [
    {
        cityName: "北京",
    }, {
        cityName: "上海",
    }, {
        cityName: "广州",
    }, {
        cityName: "深圳",
    }, {
        cityName: "苏州",
    }, {
        cityName: "杭州",
    },
    {
        cityName: "天津",
    }, {
        cityName: "南京",
    }, {
        cityName: "成都",
    }, {
        cityName: "西安",
    }, {
        cityName: "重庆",
    }, {
        cityName: "郑州",
    },
    {
        cityName: "长沙",
    }, {
        cityName: "合肥",
    }, {
        cityName: "昆山",
    }, {
        cityName: "宁波",
    },
]
let hasInitStation = false
export function openCity(options = {}, callback) {
    const {
        title,
    } = options

    let gotoCity = function () {
        let citydata = {
            inlandCities: TrainStationStore.get() || {},
            interCities: {},
        }
        // 国内热门城市
        citydata.inlandCities.hotCities = hotCities
        let all = []
        for (let key in citydata.inlandCities.cityMainList) {
            all = all.concat(citydata.inlandCities.cityMainList[key])
        }

        function handleSearch(val, tab, cb) {
            let v = val.toLowerCase()
            let result = all.filter(c => {
                return c.cityName.indexOf(v) > -1 || c.py.indexOf(v) > -1 || c.pyHead.indexOf(v) > -1
            })

            result = _.sortBy(result, 'cityID')

            cb(result)
        }
        // 清除历史按钮回调函数
        const handleClearHistory = () => {
            TrainStationStore.setAttr('historyCities', '')
            util.ubtTrace('c_trn_c_10320654345', {"bizKey" : 'clearHistory', version:shared.isCtripApp ? '主版' : '独立版' })
        }
        cwx.component.city({
            title,
            handleSearch,
            loadData(callback) {
                callback(citydata)
            },
            handleCurrentPosition(location, cb) {
                const params = {
                    Latitude: location.latitude,
                    Longitude: location.longitude,
                    Language: "CN",
                }

                LBSModel(params, data => {
                    cb({
                        cityName: handleTrainStationFromLoc(data),
                    })
                }, () => {

                })
            },
            handleClearHistory,
        }, obj => {
            pushToHistory(obj)
            callback(obj)
        })
    }

    if (!hasInitStation) {
        loadTrainStation().then(() => {
            gotoCity()
        })
    } else {
        gotoCity()
    }
}

//处理部分由于定位带来的问题
function handleTrainStationFromLoc(locInfo){
    if (!locInfo){
        return ''
    }
    //首先检查省份，针对类似直辖市
    if (checkStationExistByName(locInfo.ProvinceName)){
        return locInfo.ProvinceName
    }
    //检查二级行政区划
    let cityName = locInfo.CityEntities && locInfo.CityEntities[0].CityName
    if (!cityName){
        return ''
    }
    if (checkStationExistByName(cityName)){
        return cityName
    }
    //处理县、市结尾的定位信息
    let endStr = cityName.substr(cityName.length - 1,cityName.length)
    if (endStr == '市' || endStr == '县' || endStr == '旗'){
        cityName = cityName.substr(0 ,cityName.length - 1)
    }

    return cityName
}

function checkStationExistByName(name){
    if (!name){
        return false
    }
    const storeStation = TrainStationStore.get() || {}
    for (let letterTerm in storeStation.cityMainList){
        for (let i of storeStation.cityMainList[letterTerm]){
            if (i && i.cityName == name){
                return true
            }
        }
    }

    return false
}


function pushToHistory(data) {
    let hList = TrainStationStore.getAttr('historyCities') || []

    let tmp = _.find(hList, h => (h.cityName == data.cityName))
    let idx = hList.indexOf(tmp)

    if (idx > -1) {
        hList.splice(idx, 1)
    }

    hList.unshift(data)
    hList = hList.slice(0, 6)

    TrainStationStore.setAttr('historyCities', hList)
}

/**
 * [loadTrainStation 获取所有火车站信息并缓存]
 * @return {[type]} [description]
 */
export function loadTrainStation () {
    let handleStation = function (all) {
        if (!all.length) return
        let stations = []
        let tmp = {}
        _.each(all, (station) => {
            let temp = {
                cityName: station.StationName,
                cityID: station.StationID,
                CtripCityName: station.CityName,
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

            tmp[s.firstLetter].push({
                cityName: s.cityName,
                CtripCityName: s.CtripCityName,
                cityID: s.cityID,
                py: s.py,
                pyHead: s.pyHead,
                CtripCityID: s.CtripCityID,
            })
        })
        TrainStationStore.setAttr('cityMainList', tmp)
        hasInitStation = true
    }
    const promise = new Promise((resolve) => {
        util.showLoading()
        let _lastUpdate = TrainStationStore.getAttr("cityMainList_lastUpdateTime") || ""
        TrainStationModel({
            ChannelName:"ctrip.wx",
            LastUpdateTime:_lastUpdate,
        }, (data) => {
            if (data && data.LastUpdateTime){
                TrainStationStore.setAttr('cityMainList_lastUpdateTime', data.LastUpdateTime)
            }
            if (data.TrainStationsInfo) {
                let rawData = data.TrainStationsInfo
                handleStation(rawData)
            }
            util.hideLoading()
            resolve()
        }, () => {})
    })

    return promise
}

/**
 * 获取地推渠道
 */
export const getOfflineUnions = (function() {
    let unionList = null

    return () => {
        if (unionList) {
            return Promise.resolve(unionList)
        }

        return ConfigInfoPromise({
            ConfigKey: 'train_wx_offline_unions',
        }).then( res => {
            if (res.ConfigInfo && res.ConfigInfo.Content) {
                unionList = res.ConfigInfo.Content.split(",")
            }

            return unionList
        }).catch(() => {
            return []
        })
    }
})()

/**
 * 成功率转换为难度汉字
 */

export const getTrainSuccessRangeList = () => {
    if (shared.trainSuccessRangeList) {
        return Promise.resolve()
    }
    const ConfigKey = 'CTrainGrabSucRateConfig'

    return ConfigInfoPromise({
        ConfigKey,
    }).then(data => {
        if (data.ConfigInfo && data.ConfigInfo.Content) {
            let res = JSON.parse(data.ConfigInfo.Content)
            if (res.isOpen) {
                let { trainSuccessRangeList = [] } = res
                shared.trainSuccessRangeList = trainSuccessRangeList
            }
        }
    }).catch(() => {})
}

export const handleGrabRate = rate => {
    if (!rate) return '23.1%'
    if (shared.trainSuccessRangeList) {
        if (+rate > 1) {
            rate = +rate / 100
        }

        return shared.trainSuccessRangeList.find(item => { return +rate >= item.minValue && +rate < item.maxValue }).levelDesc
    } else {
        if (+rate < 1) {
            rate = (rate * 100).toFixed(1)
        }

        return rate + '%'
    }
}

/**
 * [获取当前账户绑定手机号]
 * @return {[string]} [undefined: 未绑定手机号; string: 当前账户绑定手机号]
 */
export const getUserBindedPhoneNumber = function () {
    let promise = new Promise((resolve, reject) => {
        cwx.user.getPhoneNumberByTicket(function (resCode, foo, errorMsg, phoneNumber) {
            if (resCode != 0) {
                // util.showModal({
                //   m: errorMsg
                // })
                console.warn(errorMsg)
                reject()
            } else {
                if (phoneNumber === undefined) {
                    // util.showModal({
                    //     m: '该账户未绑定手机号'
                    // })

                } else {
                    // util.showModal({
                    //     m: '该账户已绑定手机号'
                    // })
                }
            }
            resolve(phoneNumber)
            console.info('getPhoneNumberByTicket, phoneNumber:' + phoneNumber + ', resCode:' + resCode + ', errMsg:' + errorMsg)
        })
    })

    return promise
}

export const ShareGrabModel = common.ShareGrabModel
export const trainGrabForecastInfoPromise = util.promisifyModel(trainGrabForecastInfoModel)
export const RobTicketShareInfoModel = common.RobTicketShareInfoModel
export const AccelerateGrabTicketRateModel = common.AccelerateGrabTicketRateModel
export const CalculateAcceleratePackageModel = common.CalculateAcceleratePackageModel
export const ConfigInfoPromise = util.promisifyModel(_ConfigInfoModel)
export const GetGrabTicketSucRateInfoPromise = util.promisifyModel(_GetGrabTicketSucRateInfoModel)
export const CouponListPromise = util.promisifyModel(_CouponListModel)
export const setConfigSwitchAsyncPromise = common.setConfigSwitchAsync
export const TrainListPromise = util.promisifyModel(TrainListModel)
export const GetPaySignPromise = common._GetPaySignPromise
export const AcquireActivityCouponPromise = util.promisifyModel(AcquireActivityCouponModel)
export const GetCancelOrderRecommendInfoPromise = util.promisifyModel(GetCancelOrderRecommendInfoModel)
export const OrderCancelPromise = util.promisifyModel(OrderCancelModel)
export const PreHoldSeatResultPromise = util.promisifyModel(PreHoldSeatResultModel)
export const GetPrePayInfoForH5Promise = util.promisifyModel(getPrePayInfoForH5Model)
export const OrderDetailPromise = util.promisifyModel(OrderDetailModel)
export const GetRegister12306UserInfoPromise = util.promisifyModel(GetRegister12306UserInfoModel)
export const CheckAccountCanLogOutV2Promise = util.promisifyModel(CheckAccountCanLogOutV2Model)
export const ctripNewGuestStepPromise = util.promisifyModel(ctripNewGuestStepModel)
export const GetConfigInfoPromise = ConfigInfoPromise
export const GrabTicketApproachRecommendPromise = createPromise(modelList.GrabTicketApproachRecommend)
export const GetActivityCouponInfoPromise = util.promisifyModel(GetActivityCouponInfoModel)
export const AddOrderAccountInfoPromise = util.promisifyModel(AddOrderAccountInfoModel)
export const getConfigByKeysPromise = util.promisifyModel(getConfigByKeysModel)
export const getVendorListInfoV5ModelPromise = util.promisifyModel(getVendorListInfoV5Model)
export const Sync12306OrderInfoPromise = util.promisifyModel(Sync12306OrderInfoModel)
export const GetStationInfoV2Promise = util.promisifyModel(GetStationInfoV2Model)
export const TrainListModelPromise = util.promisifyModel(TrainListModel)
export const getDirectListTopQuickPromise = util.promisifyModel(getDirectListTopQuickModel)
export const getTrainSearchConditionPromise = util.promisifyModel(getTrainSearchConditionModel)
export const getLossGiftDetail = util.promisifyModel(getLossGiftDetailModel)
export const receiveLossGift = util.promisifyModel(receiveLossGiftModel)
export const promotionSendCouponInfoPromise = util.promisifyModel(promotionSendCouponInfoModel)
export function ctripNewGuestStepAction() {
    return ctripNewGuestStepPromise({})
        .then(data => {
            if (data.RetCode == 1) {
                return data.IsCtripNewGuest
            } else {
                return false
            }
        }).then(data => {
            data = data || TrainBookStore.getAttr('IsCtripNewGuest')
            TrainBookStore.setAttr('IsCtripNewGuest', data)
            util.setConfig('IsCtripNewGuest', data)

            return data
        }).catch((err) => {
            console.log(err)

            return false
        })
}
export function getNewCardConfig() {
    const ConfigKey = 'train_wx_hongkongnewcard'
    ConfigInfoPromise({
        ConfigKey,
    }).then(data => {
        if (data.ConfigInfo && data.ConfigInfo.Content == 1) {
            shared.isOpenNewCard = true
        }
    })
}

export function getWorkTimeConfig() {
    return ConfigInfoPromise({
        ConfigKey: 'train_fe_12306_resttime',
    }).then(data => {
        let configTimes = JSON.parse(data.ConfigInfo.Content)
        let now = new Date()

        const todayRestTimeConfig = configTimes[now.getDay()]

        shared.isWorkTime = todayRestTimeConfig.restTimes.every(item => {
            const {start, end} = item
            let beginHour = parseInt(start.split(':')[0])
            let beginmin = parseInt(start.split(':')[1])
            let endHour = parseInt(end.split(':')[0])
            let endmin = parseInt(end.split(':')[1])
            let restStart = new Date(now).setHours(beginHour, beginmin,0)
            let restEnd = new Date(now).setHours(endHour, endmin, 0)
            return now <= restStart || now >= restEnd
        })
        shared.workTimeNotice = todayRestTimeConfig.timeNotice
    }).catch(() => {
        let now = +new Date()
        let early = new Date(now).setHours(1,0,0)
        let night = new Date(now).setHours(5,0,0)

        shared.isWorkTime = now <= early || now >= night
        shared.workTimeNotice = "01:00-5:00"
    })
}

export function getGotoLogin12306TypeConfig() {
    return ConfigInfoPromise({
        ConfigKey: 'train_fe_goto_login_12306_type',
    }).then(data => {
        let config = JSON.parse(data.ConfigInfo.Content)
        shared.gotoLogin12306Type = config.loginType || 'page'
    }).catch(() => {
        shared.gotoLogin12306Type = 'page'
    })
}

export const ShareGrabPromise = util.promisifyModel(_ShareGrabModel)
export function TransferListPromise(params) {
    return util.promisifyModel(TransferListModel)(params)
        .then(data => {
            if (data.TrainTransferGroupInfos && data.TrainTransferGroupInfos.length > 0) {
                const dayMS = 24 * 60 * 60 * 1000
                let tmp = data.TrainTransferGroupInfos.filter(item => {
                    let transferTakeTime = item.TransferTakeTime
                    let isShow = item.TrainTransferInfos.every((traininfo) => {
                        transferTakeTime -= traininfo.RunTime
                        traininfo.SeatList.forEach((seatInfo) => {
                            if (seatInfo.SeatInventory != 0 && seatInfo.SeatBookable) {
                                traininfo.isOk = true
                            } else {
                                seatInfo.disabled = true
                            }
                        })

                        return traininfo.isOk
                    })
                    // 每一程的主座席 目前设置的是有席位的第一个
                    item.TrainTransferInfos.forEach(transfer => {
                        if (transfer.SeatList.filter(seatItem => seatItem.SeatInventory != 0 && seatItem.SeatBookable).length) {
                            transfer.mainSeat = transfer.SeatList.filter(seatItem => seatItem.SeatInventory != 0 && seatItem.SeatBookable)[0].SeatName
                        }
                    })
                    let departCDate = cDate.parseCDateTime(item.TrainTransferInfos[0].DepartDate)
                    let arriveCDate = cDate.parseCDateTime(item.TrainTransferInfos[item.TrainTransferInfos.length - 1].ArriveDate)
                    item.isShow = isShow
                    item.transferTime = transferTakeTime
                    item.transtimestr = util.costTimeString(transferTakeTime)
                    item.costalltime = util.costTimeString(item.TransferTakeTime)
                    // 将出发到达日期的时分秒去掉，再加上1000毫秒
                    item.takeDays = Math.floor((arriveCDate.trimDay().getTime() + 1000 - departCDate.trimDay().getTime()) / dayMS)
                    item.paramDepartDate = params.DepartDate

                    return item.isShow
                })
                console.log('tmp', tmp)
                return tmp
            } else {
                return []
            }
        })
        .catch(err => {
            console.error(err)

            return []
        })
}

/**
    * [downloadFile  将网络图片下载为本地图片]
    * @return {[type]} [description]
    */
export const downloadFile = url => {
    return new Promise((resolve, reject) => {
        wx.downloadFile({
            url,
            success(res) {
                // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
                if (res.statusCode === 200) {
                    if (res.tempFilePath) {
                        resolve(res.tempFilePath)
                    } else {
                        reject(res)
                    }
                }
            },
            fail(res) {
                util.showToast(res.errMsg || '下载失败', 'none')
            },
        })
    })
}
/**
    * [doSaveImageToAlbum 授权后 保存网络图片到系统相册]
    * @return {[type]} [description]
    */
export const doSaveImageToAlbum = (tempFilePath, succCallback, failCallback) => {
    wx.saveImageToPhotosAlbum({
        filePath: tempFilePath,
        success() {
            succCallback && succCallback()
        },
        fail(res) {
            console.log(res)
            failCallback && failCallback()
        },
    })
}
/*
    * [saveImageToAlbum 保存图片到系统相册事件]
    * @return {[type]} [description]
    * 1.了解是否有权限
    * 2.如果有保存图片并下载
    * 3. 如果没有引导用户去授权
    */
export const saveImageToAlbumHandle = (url, successCb, failCb, rejectCb) => {
    // 通过 wx.getSetting 先查询一下用户是否授权了 "scope.writePhotosAlbum" 这个 scope
    wx.getSetting({
        success(res) {
            if (!res.authSetting['scope.writePhotosAlbum']) {
                wx.authorize({
                    scope: 'scope.writePhotosAlbum',
                    success: () => {
                        // 保存图片
                        downloadFile(url).then(tempFilePath => {
                            doSaveImageToAlbum(tempFilePath, successCb, failCb)
                        })
                    },
                    fail: () => {
                        util.showToast('请先授权相册权限', 'none')
                        rejectCb()
                    },
                })
            } else {
                // 用户之前同意了授权
                // 保存图片
                downloadFile(url).then(tempFilePath => {
                    doSaveImageToAlbum(tempFilePath, successCb, failCb)
                })
            }
        },
        fail(res) {
            util.showToast('授权失败', 'none')
            console.log(res)
        },
    })
}

/**
    * 小程序环境内登录12306
    * 跳转到h5登录注册 登录成功后 回调函数获取登录信息
*/
export const login12306 = ({
    from = '',
    push = '',
    success,
    fail,
    scene,
    userName = '',
    refundPsgName = '',
    refundPassportNumber = ''
}) => {
    const webviewCb = (e) => {
        console.log('TRN PROPS gotten', e.detail.data)
        if (e.detail.data) {
            success?.(e.detail.data)
            const [{
                userName = '',
                displayName = '',
                loginPW = '',
            }] = e.detail.data
            if (userName && loginPW) {
                let tmp = {
                    displayName,
                    name: userName,
                    // pwd: loginPW,
                }
                TrainBookStore.setAttr('bind12306', tmp)
                TrainBookStore.setAttr('auth', cwx.user.auth)
                onLogin12306Success({
                    userName,
                    displayName,
                    loginPW,
                })
            }
        } else {
            fail?.()
        }
    }
    const curPage = cwx.getCurrentPage()
    curPage.navigateTo({
        url: `/pages/train/webview/webview`,
        data: {
            url: `${host}webapp/train/activity/ctrip-train-12306/#/login?from=${from}&userName=${userName}&refundPsgName=${refundPsgName}&refundPassportNumber=${refundPassportNumber}&push=${push}&source=${scene}`,
            bridgeIns: webviewCb,
            needLogin: true,
        },
    })
}

/**
    * 小程序环境内注册12306
    * 跳转到h5注册 注册成功后 回调函数获取登录信息
*/
export const register12306 = ({
    from = '',
    success,
    fail,
    userName = '',
    idNumber = '',
    mobile = '',
    passportType = '',
    logout = 0,
}) => {
    const webviewCb = (e) => {
        console.log('TRN PROPS gotten', e.detail.data)
        if (e.detail.data) {
            success?.(e.detail.data)
            const [{
                userName = '',
                displayName = '',
                loginPW = '',
            }] = e.detail.data
            if (userName && loginPW) {
                let tmp = {
                    name: userName,
                    displayName,
                    // pwd: loginPW,
                }
                TrainBookStore.setAttr('bind12306', tmp)
                TrainBookStore.setAttr('auth', cwx.user.auth)
                onLogin12306Success({
                    userName,
                    displayName,
                    loginPW,
                })
            }
        } else {
            fail?.()
        }
    }
    const curPage = cwx.getCurrentPage()
    curPage.navigateTo({
        url: `/pages/train/webview/webview`,
        data: {
            url: `${host}webapp/train/activity/ctrip-train-12306/#/register?from=${from}&userName=${encodeURIComponent(userName)}&idNumber=${idNumber}&mobile=${mobile}&passportType=${passportType}&userQuery=1&logout=${logout}`,
            bridgeIns: webviewCb,
            needLogin: true,
        },
    })
}

/**
    * 小程序环境内注册12306的第二步
    * 跳转到h5注册 注册成功后 回调函数获取登录信息
*/
export const register12306Check = ({
    from = '',
    success,
    fail,
    mobile = '',
    registerKey = '',
    randomAccount = '',
    randomPassword = 0,
}) => {
    const webviewCb = (e) => {
        console.log('TRN PROPS gotten', e.detail.data)
        if (e.detail.data) {
            success?.(e.detail.data)
            const [{
                userName = '',
                displayName = '',
                loginPW = '',
            }] = e.detail.data
            if (userName && loginPW) {
                let tmp = {
                    displayName,
                    name: userName,
                    // pwd: loginPW,
                }
                TrainBookStore.setAttr('bind12306', tmp)
                TrainBookStore.setAttr('auth', cwx.user.auth)
                onLogin12306Success({
                    userName,
                    loginPW,
                })
            }
        } else {
            fail?.()
        }
    }
    const curPage = cwx.getCurrentPage()
    curPage.navigateTo({
        url: `/pages/train/webview/webview`,
        data: {
            url:`${host}webapp/train/activity/ctrip-train-12306/#/register?mobile=${mobile}&registerKey=${registerKey}&randomAccount=${randomAccount}&randomPassword=${randomPassword}&from=${from}`,
            bridgeIns: webviewCb,
            needLogin: true,
        },
    })
}
/**
    * 小程序环境内找回12306密码
    * 跳转到h5找回密码页 找回成功后 回调函数获取登录信息
*/
export const retrieve12306 = ({
    from = '',
    success,
    fail,
    userName = '',
    idNumber = '',
    passportType = '',
}) => {
    const webviewCb = (e) => {
        console.log('TRN PROPS gotten', e.detail.data)
        if (e.detail.data) {
            success?.(e.detail.data)
            const [{
                userName = '',
                displayName = '',
                loginPW = '',
            }] = e.detail.data
            if (userName && loginPW) {
                let tmp = {
                    displayName,
                    name: userName,
                    // pwd: loginPW,
                }
                TrainBookStore.setAttr('bind12306', tmp)
                TrainBookStore.setAttr('auth', cwx.user.auth)
                onLogin12306Success({
                    userName,
                    loginPW,
                })
            }
        } else {
            fail?.()
        }
    }
    const curPage = cwx.getCurrentPage()
    curPage.navigateTo({
        url: `/pages/train/webview/webview`,
        data: {
            url: `${host}webapp/train/activity/ctrip-train-12306/#/retrieve?from=${from}&userName=${encodeURIComponent(userName)}&idNumber=${idNumber}&passportType=${passportType}`,
            bridgeIns: webviewCb,
            needLogin: true,
        },
    })
}
// 检查用户信息是否可以注册 接口为异步轮询
const registerUserAccountInfoV2 = util.promisifyModel(RegisterUserAccountInfoV2Model)
const registerUserAccountInfoV2Promise = (params) => {
    return new Promise((resolve, reject) => {
        registerUserAccountInfoV2(params).then(res => {
            if (res.retCode === 1 && (res.registerStatus === 1 || res.registerStatus === 2)){
                resolve(res)
            } else {
                reject(res)
            }
        }).catch(err => {
            reject(err)
        })
    })
}
export const registerUserAccountInfoPromise = (params) => {
    return new Promise((resolve, reject) => {
        let registerTime = 0
        let registerInterval = null

        registerUserAccountInfoV2Promise(params).then(data => {
            if (data.registerStatus === 2){
                resolve(data)

                return
            }
            registerTime = data.pollRate * 1000
            if (registerInterval){
                clearInterval(registerInterval)
            }
            registerInterval = setInterval(async () => {
                registerUserAccountInfoV2Promise({
                    ...params,
                    RegisterKey: data.registerKey,
                }).then(res => {
                    if (res.registerStatus === 2){
                        resolve(res)
                        clearInterval(registerInterval)
                    }
                }).catch(err => {
                    reject(err)
                    clearInterval(registerInterval)
                })
            }, registerTime)
        }).catch(err => {
            reject(err)
            clearInterval(registerInterval)
        })
    })
}

export async function handleChildTicket(data) {
    let res = {};
    do {
        if (res.Result === 3) {
            await sleep(res.Rate * 1000);
        }
        res = await util.promisifyModel(handleChildTicketModel)({
            ...data,
            Pollingkey: res.PollingKey
        });
        if (res.RetCode !== 1) {
            return res;
        }
        await sleep(res.Rate);
    } while (res.Result === 3);
    return res;
}

