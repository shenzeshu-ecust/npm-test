
// /* eslint-disable*/
// /**
//  * @file 直连12306相关接口
//  */
// const origin12306 = 'https://kyfw.12306.cn/'
// // 存储上一次获取到的余票接口地址
// let prevQueryUrl = ''
// let foundSecret = null
// let cookieStr = ""

// function fetch(url, method = 'GET', data = null) {
//     let header = {
//         "content-type": "application/json;charset=UTF-8",
//     }
//     if (cookieStr) {
//         header["cookie"] = cookieStr
//     }

//     return new Promise((resolve, reject) => {
//         wx.request({
//             url,
//             data,
//             header:header,
//             method,
//             success(res) {
//                 resolve(res)
//             },
//             fail(res) {
//                 reject(res)
//             },
//         })
//     })
// }

// function fetch12306(pathname, ...rest) {
//     return fetch(`${origin12306}${pathname}`, ...rest)
// }

// /**
//  * 获取查询余票接口地址
//  */
// export function queryLeftTicketInit() {
//     if (!foundSecret) {
//         foundSecret = new Set()
//     }
//     if (prevQueryUrl) {
//         return Promise.resolve(prevQueryUrl)
//     }
//     const path = 'otn/leftTicket/init'

//     return fetch12306(path)
//         .then(res => {
//             const reg = /CLeftTicketUrl\s*=\s*'([^']+)/
//             const queryUrl = res.data.match(reg)[1]
//             console.log('CLeftTicketUrl: ' + queryUrl)
//             prevQueryUrl = queryUrl

//             return queryUrl
//         })
// }

// /**
//  * 通过指定余票接口地址读取车次列表
//  */
// export function queryLeftTicketWithPath(pathname, date, from_station, to_station, purpose_codes = 'ADULT') {
//     if (!pathname) {
//         throw new Error('no leftTicket pathname')
//     }
//     initCookie(date)
//     const fullpath = `otn/${pathname}?leftTicketDTO.train_date=${date}&leftTicketDTO.from_station=${from_station}&leftTicketDTO.to_station=${to_station}&purpose_codes=${purpose_codes}`

//     return fetch12306(fullpath)
// }

// function initCookie(date){
//     if (cookieStr){
//         return
//     }
//     cookieStr = `_jc_save_fromStation=%u9E21%u4E1C%2CJOB; _jc_save_toStation=%u9E21%u897F%2CJXB; _jc_save_wfdc_flag=dc; _jc_save_fromDate=${date}; _jc_save_toDate=${date}`
// }


// /**
//  * 读取车次列表
//  * @param {*} date
//  * @param {*} from_station
//  * @param {*} to_station
//  * @param {*} purpose_codes
//  */
// export function queryLeftTicket(options, ...args) {
//     return queryLeftTicketInit()
//         .then(queryUrl => queryUrl, () => prevQueryUrl)
//         .then((queryUrl) => queryLeftTicketWithPath(queryUrl, ...args))
//         .then(res => parseLeftTicketToStr(res.data, options))
// }

// let _pushedKeys = []
// let tempTrains = []
// function filterPushedKeyTrain(needPushTrains){
//     if (needPushTrains.length === 0){
//         return []
//     }

//     let noPushedTrains = needPushTrains.filter(_t => {
//         if (_t.seats.length === 0){
//             return false
//         }
//         if (!_t.secretStr){
//             return false
//         }
//         let t = _t.queryLeftNewDTO
//         let isPushed = !!_pushedKeys.find(_key => {
//             let key = _key.queryLeftNewDTO
//             if (key.station_train_code === t.station_train_code && key.start_train_date === t.start_train_date && key.from_station_name === t.from_station_name && key.to_station_name === t.to_station_name){
//                 if (_t.seats.every(s => {
//                     let kSeat = _key.seats.find(ks => ks.name === s.name)
//                     if (kSeat && kSeat.name === s.name && kSeat.amount === s.amount){
//                         return true
//                     }

//                     return false
//                 })){
//                     return true
//                 }
//             }

//             return false
//         })

//         if (!isPushed){
//             tempTrains.push(_t)

//             return true
//         }

//         return false
//     }) || []

//     return noPushedTrains
// }


// export function parseLeftTicketToStr(originalData, options) {
//     const { Condition: condition } = options
//     const filterMap = condition ? generateFilter(condition) : null
//     const data = originalData.data
//     let newData = []
//     if (!Array.isArray(data)) {
//         if (data && data.flag == 1 && data.result && data.map) {
//             newData = decodeTrainInfo(data.result, data.map)
//         } else {
//             newData = []
//         }
//     }
//     let res = []
//     let _nowData = filterPushedKeyTrain(newData)
//     _nowData.map(newDataItem => {
//         const {
//             queryLeftNewDTO,
//             secretStr,
//             seats,
//         } = newDataItem
//         const {
//             station_train_code: train_number,
//             from_station_name: from_station,
//             to_station_name: to_station,
//             start_time: startTime,
//             exchange_train_flag:exchangeTrainFlag
//         } = queryLeftNewDTO
//         let _seats = seats.map(item => ({
//             seat_name: item.name,
//             seat_yupiao: item.amount,
//             isCanHB:item.isCanHB,
//         }))

//         if (filterMap) {
//             let filter = filterMap.get(train_number)
//             if (!filter) {
//                 return
//             }
//             _seats = _seats.filter(filter)
//         }
//         if (!_seats.length) {
//             return
//         }

//         const seatsStr = _seats.map(seat => (seat.seat_yupiao == 0 && !seat.isCanHB) ? "" : `${seat.seat_name},${seat.seat_yupiao}`).filter(it => !!it).join('#')
//         if (!seatsStr){
//             return
//         }
//         foundSecret.add(secretStr)
//         res.push(`${train_number}|${from_station}|${to_station}|${startTime}|${secretStr}|${seatsStr}|${exchangeTrainFlag}`)
//     })
//     _pushedKeys = _pushedKeys.concat(tempTrains)
//     tempTrains.length = 0

//     console.log(res)

//     return res.join(';')
// }

// /**
//  * [Serializable]
//     public class TaskConditionEntity
//     {
//         /// <summary>
//         /// 抢票类型（0：按车次座席抢票 1：按时间段抢票）GrabType
//         /// </summary>
//         public int GrabType { get; set; }

//         /// <summary>
//         /// 具体条件list Conditions
//         /// </summary>
//         public List<ConditionEntity> Conditions { get; set; }
//     }

//     [Serializable]
//     public class ConditionEntity {
//         /// <summary>
//         /// 车次或者时间点
//         /// </summary>
//         public string C { get; set; }
//         public List<SeatEntity> SS { get; set; }

//     }

//     [Serializable]
//     public class SeatEntity
//     {
//         /// <summary>
//         ///
//         /// </summary>
//         public string S { get; set; }
// }

// Demo:
// [{"GrabType":0,"Conditions":[{"C":"Z49","SS":[{"S":"硬座"},{"S":"软座"}]},{"C":"Z50","SS":[{"S":"硬卧"},{"S":"软卧"}]}]},{"GrabType":1,"Conditions":[{"C":"1","SS":[{"S":"二等座"}]},{"C":"2","SS":[{"S":"一等座"}]},{"C":"3","SS":[{"S":"商务座"}]}]}]

//  * @param {*} conditions
//  */
// export function generateFilter(conditions) {
//     if (!conditions) {
//         return () => true
//     }
//     const map = new Map()
//     // 小程序只需要支持按车次座席抢票
//     conditions = conditions.filter(condition => condition.GrabType === 0).forEach(trainFilter => {
//         trainFilter.Conditions.forEach(condition => {
//             const {
//                 SS = [],
//                 C = '',
//             } = condition
//             if (!C || !SS.length) {
//                 return
//             }
//             const targetSeats = SS.map(item => item.S)
//             const filter = (seat) => {
//                 return targetSeats.includes(seat.seat_name) && (seat.seat_yupiao > 0 || (seat.isCanHB && seat.seat_yupiao == 0))
//             }
//             map.set(C, filter)
//         })
//     })

//     return map
// }

// /** below copied from train-base f036b7d323781b5f5d0e974fdfe6f4d6145c3389 */
// function invert(obj) {
//     let new_obj = {}
//     for (let prop in obj) {
//         if (obj.hasOwnProperty(prop)) {
//             new_obj[obj[prop]] = prop
//         }
//     }

//     return new_obj
// }

// function decodeTrainInfo(ct, cv) {
//     let cs = []
//     for (let cr = 0; cr < ct.length; cr++) {
//         let cw = {}
//         let cq = ct[cr].split("|")
//         cw.secretHBStr = cq[36]
//         cw.secretStr = cq[0]
//         cw.buttonTextInfo = cq[1]
//         let cu = {}
//         cu.train_no = cq[2]
//         cu.station_train_code = cq[3]
//         cu.start_station_telecode = cq[4]
//         cu.end_station_telecode = cq[5]
//         cu.from_station_telecode = cq[6]
//         cu.to_station_telecode = cq[7]
//         cu.start_time = cq[8]
//         cu.arrive_time = cq[9]
//         cu.lishi = cq[10]
//         cu.canWebBuy = cq[11]
//         cu.yp_info = cq[12]
//         cu.start_train_date = cq[13]
//         cu.train_seat_feature = cq[14]
//         cu.location_code = cq[15]
//         cu.from_station_no = cq[16]
//         cu.to_station_no = cq[17]
//         cu.is_support_card = cq[18]
//         cu.controlled_train_flag = cq[19]
//         cu.gg_num = cq[20] ? cq[20] : "--"
//         cu.gr_num = cq[21] ? cq[21] : "--"
//         cu.qt_num = cq[22] ? cq[22] : "--"
//         cu.rw_num = cq[23] ? cq[23] : "--"
//         cu.rz_num = cq[24] ? cq[24] : "--"
//         cu.tz_num = cq[25] ? cq[25] : "--"
//         cu.wz_num = cq[26] ? cq[26] : "--"
//         cu.yb_num = cq[27] ? cq[27] : "--"
//         cu.yw_num = cq[28] ? cq[28] : "--"
//         cu.yz_num = cq[29] ? cq[29] : "--"
//         cu.ze_num = cq[30] ? cq[30] : "--"
//         cu.zy_num = cq[31] ? cq[31] : "--"
//         cu.swz_num = cq[32] ? cq[32] : "--"
//         cu.srrb_num = cq[33] ? cq[33] : "--"
//         cu.yp_ex = cq[34]
//         cu.seat_types = cq[35]
//         cu.exchange_train_flag = cq[36]
//         cu.from_station_name = cv[cq[6]]
//         cu.to_station_name = cv[cq[7]]
//         cu.houbu_train_flag = cq[37]
//         if (cq.length > 38){
//             cu.houbu_seat_limit = cq[38]
//         }
//         cw.queryLeftNewDTO = cu
//         cw.seats = parseSeats(cu)
//         cs.push(cw)
//     }

//     return cs
// }
// /** ticket price info **/
// //var mapSeatCodeAndName   = {"0":"棚车","1":"硬座","2":"软座","3":"硬卧","4":"软卧","5":"包厢硬卧","6":"高级软卧","7":"一等软座","8":"二等软座","9":"商务座","A":"鸳鸯软卧","B":"混编硬座","C":"混编硬卧","D":"包厢软座","E":"特等软座","F":"四人软包","G":"二人软包","H":"一人软包","I":"一等双软","J":"二等双软","K":"混编软座","L":"混编软卧","M":"一等座","O":"二等座","P":"特等座","Q":"观光座","S":"一等包座"}
// let mapSeatCodeAndName = { "0": "棚车", "1": "硬座", "2": "软座", "3": "硬卧", "4": "软卧", "5": "包厢硬卧", "6": "高级软卧", "7": "一等软座", "8": "二等软座", "9": "商务座", "A": "高级动卧", "B": "混编硬座", "C": "混编硬卧", "D": "包厢软座", "E": "特等软座", "F": "动卧", "G": "高级软卧", "H": "一人软包", "I": "一等双软", "J": "二等双软", "K": "混编软座", "L": "混编软卧", "M": "一等座", "O": "二等座", "P": "特等座", "Q": "观光座", "S": "一等包座" },
//     mapSeatNameAndCode = invert(mapSeatCodeAndName),
//     seatTypeRateMap = { "0": 41, "1": 23, "2": 22, "3": 21, "4": 20, "5": 40, "6": 18, "7": 24, "8": 25, "9": 10, "A": 26, "B": 27, "C": 28, "D": 29, "E": 30, "F": 31, "G": 32, "H": 33, "I": 34, "J": 35, "K": 36, "L": 37, "M": 14, "O": 16, "P": 12, "Q": 38, "S": 39 }

// mapSeatNameAndCode["无座"] = "1"
// mapSeatNameAndCode["高级软卧"] = "6"

// let gSeatTypes = ["商务座", "特等座", "一等座", "二等座", "高级软卧", "软卧", "硬卧", "软座", "硬座", "无座", "动卧", "其他"],
//     gGDSeatTypes = ["商务座", "特等座", "一等座", "二等座", "高级动卧", "软卧", "硬卧", "软座", "硬座", "无座", "动卧", "其他"],
//     gSeatTypes1 = "swz,tz,zy,ze,gr,rw,yw,rz,yz,wz,srrb,qt".split(","),
//     gSeatTypes2 = "91,P1,M1,O1,61,41,31,21,11,W1,F1".split(",")
//     // trainClasses = {
//     //     "z": "直特",
//     //     "t": "特快",
//     //     "k": "快速",
//     //     "g": "高铁",
//     //     "c": "城际",
//     //     "d": "动车",
//     //     "y": "临时旅游",
//     //     "l": "临客",
//     //     "1": "普快",
//     //     "2": "普快",
//     //     "3": "普快",
//     //     "4": "普快",
//     //     "5": "普快",
//     //     "6": "普客慢车",
//     //     "7": "普客慢车",
//     //     "8": "普客慢车"
//     // };

// function processYpInfo(ypinfo) {
//     if (!ypinfo){
//         return []
//     }
//     let arrayLength = ypinfo.length / 10
//     let obj = new Array()
//     let temp_seat_rate = 50 // 对于没有定义的座位，rate值从50开始递增
//     for (let i = 0, m = 6, n = 10, x = 0, y = 1; i < arrayLength; i++, m = m + 10, n = n + 10, x = x + 10, y = y + 10) {
//         let seat_type_id = ypinfo.substring(x, y)
//         let seat_type = null
//         let seat_type_rate = null
//         let seat_num = 0
//         let ztcode //无座时为0
//         if (parseInt(ypinfo.substring(m, m + 1), 10) >= 3) {
//             seat_type = "无座"
//             seat_type_rate = 100
//             seat_num = parseInt(ypinfo.substring(m, n), 10) - 3000
//             ztcode = 0
//         } else {
//             seat_type = mapSeatCodeAndName[seat_type_id]
//             ztcode = seat_type_id
//             seat_type_rate = seatTypeRateMap[seat_type_id]
//             if (seat_type_rate === null || seat_type_rate === undefined) {
//                 seat_type_rate = temp_seat_rate
//                 temp_seat_rate = temp_seat_rate + 1
//             }
//             seat_num = parseInt(ypinfo.substring(m, n), 10)
//         }

//         obj[i] = {
//             type_id: seat_type_id,
//             type: seat_type,
//             ztcode: ztcode,
//             type_rate: seat_type_rate, // 保存座位rate用于排序
//             num: seat_num,
//             price: (parseFloat(ypinfo.substring(y, m), 10) / 10),
//         }
//     }
//     let sortedObjs = sortYpInfo(obj)

//     return sortedObjs
// }

// // 按照座位的type_rate进行排序，规则如下
// // 商务座、特等座、一等座、二等座、高级软卧、软卧、硬卧、软座、硬座、（...）、无座 的顺序显示；
// // 如果出现其余席别，显示在这些席别的后面，顺序暂不限，其中 无座 总放在最后面。
// function sortYpInfo(ypinfoArray) {
//     let by = function(name) {
//         return function(o, p) {
//             let a, b
//             if (typeof o === "object" && typeof p === "object" && o && p) {
//                 a = o[name]
//                 b = p[name]
//                 if (a === b) {
//                     return 0
//                 }
//                 if (typeof a === typeof b) {
//                     return a < b ? -1 : 1
//                 }

//                 return typeof a < typeof b ? -1 : 1
//             } else {
//                 return 0
//                 //throw ("error");
//             }
//         }
//     }
//     ypinfoArray.sort(by("type_rate"))

//     return ypinfoArray
// }

// let reduceSeats = ["商务座", "高级软卧", "特等座", "软卧", "一等座", "二等座", "硬卧", "软座", "硬座", "无座", "其他"]

// function parseSeats(train) {
//     let tickets = [],
//         yp_ex = train.yp_ex,
//         is_houbu_train = train.houbu_train_flag == '1',
//         houbu_seat_limit = train.houbu_seat_limit,
//         info = processYpInfo(train.yp_info_cover || train.yp_info),
//         cover = train.yp_info_coverFlag == "1",
//         trainCode = train.station_train_code.substr(0, 1).toLowerCase(),
//         seat_types = train.seat_types || "",
//         isGD = trainCode == "g" || trainCode == "d" || trainCode == "c",
//         isDW = isGD && ( seat_types.indexOf("F") != -1 )//判断是否是动卧

//     if (train.fromMobile) {
//         let flag = train.flag != "0"
//         for (let j = 0; j < info.length; j++) {
//             let ticket = info[j],
//                 num = ticket.num,
//                 type = ticket.type,
//                 txt = cover ? ( num > 20 ? "有" : num ) : num
//                 //txt = flag ? (num > 0 ? (num > 20 ? "有" : num) : "无") : "*"
//             if (!flag) {
//                 num = -3
//             }
//             if ( !ticket.type_id ){
//                 continue
//             }
//             tickets.push({ code: ticket.type_id, name: type, amount: num, price: ticket.price || 0, ztcode: ticket.ztcode, txt: txt })
//         }
//     } else {

//         let infoOb = {},
//             hasPrice
//         //for (var i = 0; i < info.length; i++) {
//         //  var ob = info[i];
//         //  infoOb[ob.type] = ob;
//         //  if (ob.price) {
//         //      hasPrice = train.hasPrice = true;
//         //  }
//         //};
//         let erdengruan = false
//         if ( !isGD ){
//             if ( train["ze_num"] && train["ze_num"] != "--" && train["ze_num"] != "*" && train["yz_num"] == "--"){
//                 erdengruan = true
//             }
//         }
//         let flag = true
//         for (let k = 0; k < gSeatTypes1.length; k++) {
//             // eslint-disable-next-line no-var
//             var kk = gSeatTypes1[k],
//                 txt = train[kk + "_num"],
//                 typeKey = kk.toUpperCase() + "_",
//                 key = gSeatTypes2[k],
//                 ex = yp_ex ? yp_ex.indexOf(key) : -1,
//                 discount = false,
//                 num = -2,
//                 type = isDW ? gGDSeatTypes[k] : gSeatTypes[k],
//                 type = isGD ? type : (type == "一等座" ? "一等软座" : (type == "二等座" ? "二等软座" : type)),
//                 price = hasPrice && infoOb[type] && infoOb[type].price || 0,
//                 markup = "",
//                 code = mapSeatNameAndCode[type] || ""

//             if (type == "无座") {
//                 code = isGD ? "O" : "1"
//                 code = erdengruan ? "8" : code
//                 if (txt == "--"){
//                     continue
//                 }
//             }

//             if (infoOb[type]) {
//                 code = infoOb[type].type_id
//                 num = infoOb[type].num
//             }

//             if (!code){
//                 continue
//             }

//             ex = ex > -1 && ex % 2 == 0
//             if ("有" == txt) {
//                 num = 99
//                 discount = ex
//             } else if ("*" == txt) {
//                 flag = false
//                 num = -3
//             } else if ("无" == txt) {
//                 num = 0
//             } else if (parseInt(txt)) {
//                 if (num == -2)
//                     num = parseInt(txt)
//                 discount = ex
//             } else if (seat_types.indexOf(code) % 2 == 0){
//                 num = 0
//             } else {
//                 continue
//             }
//             tickets.push({ name: type, code: code, amount: num, price: price, discount: discount, ztcode: type == "无座" ? 0 : code, txt: txt })
//         }
//         //if (info.length) {
//         //    tickets = [];
//         //    for (var j = 0; j < info.length; j++) {
//         //        var ticket = info[j],
//         //            num = ticket.num,
//         //            type = ticket.type,
//         //            txt = flag ? (num > 0 ? (num > 20 ? "有" : num) : "无") : "*"
//         //        if (!flag) {
//         //            num = -3;
//         //        }
//         //        tickets.push({ code: ticket.type_id, name: type, amount: num, price: ticket.price || 0, ztcode: ticket.ztcode });
//         //    }
//         //}
//     }

//     if (tickets.length > 0) {
//         tickets.sort(function(a, b) {
//             let ai = reduceSeats.indexOf(a.name)
//             let bi = reduceSeats.indexOf(b.name)
//             if (ai - bi > 0) {
//                 return -1
//             }
//             if (ai - bi < 0) {
//                 return 1
//             }

//             return 0
//         })
//         let wuzuoArray = tickets.filter(function(t) {
//             return t.ztcode == 0
//         })
//         let wuzuo = wuzuoArray[0]
//         if (wuzuo) {
//             let tempTickets = tickets.filter(function(t) {
//                 return t.ztcode != 0
//             })
//             let yingzuoArray = tempTickets.filter(function(t) {
//                 return t.code == wuzuo.code
//             })
//             let yingzuo = yingzuoArray[0]
//             if (yingzuo && yingzuo.amount <= 0 && wuzuo.amount > 0) {
//                 tempTickets.unshift(wuzuo)
//             } else {
//                 tempTickets.push(wuzuo)
//             }
//             tickets = tempTickets
//         }
//         tickets.forEach(it => {
//             if (it.name == "无座") {
//                 it.isCanHB = false
//                 it.seat_hb_status = "3"

//                 return
//             }
//             let canHb = false
//             if (is_houbu_train) {
//                 if (!houbu_seat_limit || houbu_seat_limit.indexOf(it.code) < 0) {
//                     canHb = true
//                 }
//             }
//             it.isCanHB = canHb
//         })
//     }

//     return tickets
// }
