/* eslint-disable no-undef */
class cDate {
    constructor (date) {
        this.date = date ? new Date(date) : new Date()

        //星期数据
        this._DAY1 = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        this._DAY2 = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

        //时间格式化函数集
        this._MAPS = {
        //有前导零的日期值
            'd': function (str, date, key) {
                let d = date.getDate().toString()
                if (d.length < 2){
                    d = '0' + d
                }

                return str.replace(new RegExp(key, 'mg'), d)
            },
            //无前导零的日期值
            'j': function (str, date, key) {
                return str.replace(new RegExp(key, 'mg'), date.getDate())
            },
            //星期中的第几天 1-7
            'N': function (str, date, key) {
                let d = date.getDay()
                if (d === 0){
                    d = 7
                }

                return str.replace(new RegExp(key, 'mg'), d)
            },
            'w': function (str, date, key) {
                let d = date.getDay()
                let title = this._DAY1[d]

                return str.replace(new RegExp(key, 'mg'), title)
            },
            'W': function (str, date, key) {
                let d = date.getDay()
                let title = this._DAY2[d]

                return str.replace(new RegExp(key, 'mg'), title)
            },
            //有前导零的月份
            'm': function (str, date, key) {
                let d = (date.getMonth() + 1).toString()
                if (d.length < 2){
                    d = '0' + d
                }

                return str.replace(new RegExp(key, 'mg'), d)
            },
            //无前导零的月份
            'n': function (str, date, key) {
                return str.replace(key, date.getMonth() + 1)
            },
            //四位年份
            'Y': function (str, date, key) {
                return str.replace(new RegExp(key, 'mg'), date.getFullYear())
            },
            //两位年份
            'y': function (str, date, key) {
                return str.replace(new RegExp(key, 'mg'), date.getYear())
            },
            //无前导零的小时,12小时制
            'g': function (str, date, key) {
                let d = date.getHours()
                if (d >= 12){
                    d = d - 12
                }

                return str.replace(new RegExp(key, 'mg'), d)
            },
            //无前导零的小时，24小时制
            'G': function (str, date, key) {
                return str.replace(new RegExp(key, 'mg'), date.getHours())
            },
            //有前导零的小时，12小时制
            'h': function (str, date, key) {
                let d = date.getHours()
                if (d >= 12){
                    d = d - 12
                }
                d += ''
                if (d.length < 2){
                    d = '0' + d
                }

                return str.replace(new RegExp(key, 'mg'), d)
            },
            //有前导零的小时，24小时制
            'H': function (str, date, key) {
                let d = date.getHours().toString()
                if (d.length < 2){
                    d = '0' + d
                }

                return str.replace(new RegExp(key, 'mg'), d)
            },
            //有前导零的分钟
            'i': function (str, date, key) {
                let d = date.getMinutes().toString()
                if (d.length < 2) {
                    d = '0' + d
                }

                return str.replace(new RegExp(key, 'mg'), d)
            },
            //有前导零的秒
            's': function (str, date, key) {
                let d = date.getSeconds().toString()
                if (d.length < 2){
                    d = '0' + d
                }

                return str.replace(new RegExp(key, 'mg'), d)
            },
            //无前导零的分钟
            'I': function (str, date, key) {
                let d = date.getMinutes().toString()

                return str.replace(new RegExp(key, 'mg'), d)
            },
            //无前导零的秒
            'S': function (str, date, key) {
                let d = date.getSeconds().toString()

                return str.replace(new RegExp(key, 'mg'), d)
            },
            //转换为今天/明天/后天
            'D': function (str, date, key) {
                let now = cDate.getServerDate()
                now.setHours(0, 0, 0, 0)
                date = new Date(date.valueOf())
                date.setHours(0, 0, 0, 0)
                let day = 60 * 60 * 24 * 1000,
                    tit = '',
                    diff = date - now
                if (diff >= 0) {
                    if (diff < day) {
                        tit = '今天'
                    } else if (diff < 2 * day) {
                        tit = '明天'
                    } else if (diff < 3 * day) {
                        tit = '后天'
                    }
                }

                return str.replace(new RegExp(key, 'mg'), tit)
            },
        }
    }

    addDay (n) {
        n = n || 0
        this.date.setDate(this.date.getDate() + n)

        return this
    }

    valueOf () {
        return this.date
    }

    getTime () {
        return this.date.valueOf()
    }

    format (format) {
        if (typeof format !== 'string'){
            format = ''
        }

        for (let key in this._MAPS) {
            format = this._MAPS[key].call(this, format, this.date, key)
        }

        return format
    }
    trimDay(){
        this.date.setHours(0)
        this.date.setMinutes(0)
        this.date.setSeconds(0)

        return this
    }
    stamp(){
        return parseInt(this.date.getTime() / 1000)
    }
    static parse (str, isNative) {
        if (typeof str === 'undefined') {
            return new Date()
        }
        if (typeof str === 'string') {
            str = str || ''
            let regtime = /^(\d{4})\-?(\d{1,2})\-?(\d{1,2})/i
            if (str.match(regtime)) {
                str = str.replace(regtime, "$2/$3/$1")
            }
            let st = Date.parse(str)
            let t = new Date(st || new Date())

            return isNative ? t : new cDate(t)
        } else if (typeof str === 'number') {
            return new Date(str)
        } else {
            return new Date()
        }
    }

    static format (obj, str) {
        return cDate.createUTC8CDate(obj).format(str)
    }

    static weekday (d) {
        let day = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
        let dd = cDate.createUTC8CDate(d).valueOf()

        return day[dd.getDay()]
    }

    static getServerDate (callback) {
        let now = cDate.createUTC8CDate().valueOf()
        let applyCallback = function (date) {
            if (typeof callback === 'function') {
                return callback(date)
            }

            return date
        }

        let webCallback = function () {
            if (typeof __SERVERDATE__ === 'undefined' || !__SERVERDATE__.server) {
                return applyCallback(now)
            }

            let servertime = new Date(__SERVERDATE__.server.valueOf() + (new Date().valueOf() - __SERVERDATE__.local.valueOf()))

            return applyCallback(servertime)
        }

        return webCallback()
    }

    /**
     * todo: enhancement 整理一下占位符，与本身相同
     * @example getFormatDate('20180925080500', 'yyyy-MM-dd')
     * @param {*} date
     * @param {*} format
     */
    static getFormatDate(date, format) {
        if (date) {
            switch (format) {
                case 'yyyy-MM-dd':
                    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`
                case 'yyyy-MM-dd hh:mm:ss':
                    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)} ${date.slice(8, 10)}:${date.slice(10, 12)}:${date.slice(12, 14)}`
                case 'yyyyMMdd':
                    return `${date.slice(0, 4)}${date.slice(4, 6)}${date.slice(6, 8)}`
                case 'yyyy/MM/dd':
                    return `${date.slice(0, 4)}/${date.slice(4, 6)}/${date.slice(6, 8)}`
                case 'hh:mm':
                    return `${date.slice(8, 10)}:${date.slice(10, 12)}`
                case 'hh:mm:ss':
                    return `${date.slice(8, 10)}:${date.slice(10, 12)}:${date.slice(12, 14)}`
                case 'MM月mm日':
                    return `${date.slice(4, 6)}月${date.slice(6, 8)}日`
                case 'M月D日H时I分':
                    return `${date.slice(4, 6)}月${date.slice(6, 8)}日${date.slice(8, 10)}时${date.slice(10, 12)}分`
                case 'M月D日H:I':
                    return `${date.slice(4, 6)}月${date.slice(6, 8)}日${date.slice(8, 10)}:${date.slice(10, 12)}`
                default:
                    return date
            }
        } else {
            return ''
        }
    }

    static parseCDateTime(time, z) {
        return new cDate(toDate(time, z))
    }

    /**
     * cDate.parse 的 alias 方法
     * 参数必须只有日期，之前存在的问题是，
     * 如果以 2018-09-30 格式初始化 date 时，会从 utc 的 2018-09-30 00:00:00 转变为
     * local 的日期， 2018-09-29 18:00:00
     * 但是如果调用 parse 方法，以 09/30/2018 进行格式化，则会是 local 的 2018-09-30
     * @param {String} date
     */
    static createUTC8CDate(date) {
        let res = cDate.parse(date)

        return new cDate(res.getTime())
    }
}
/**
 * 我携 expansion toDate 进行了改造
 * @param {*} z
 */
function toDate(time = '', z = 8) {
    // "/Date(-62135565484000+0800)/" => ["/Date(-62135565484000+0800)/", "-", "62135565484000", "+0800", "+", "0800"]
    let Reg = /(-?)([0-9]+)(([+|-])([0-9]+))?/igm
    let result = Reg.exec(time)
    let fmt

    if (result) {
        let value = parseInt(result[1] + result[2], 10)
        fmt = toDateInZ(value, z)
        let ISOString = fmt.toISOString()
        let isFaultDate = ISOString.indexOf('0001-01-01') > -1

        if (isFaultDate) {
            fmt.__invalid = true
        }
    } else {
        fmt = new Date()
        fmt.__invalid = true
    }

    return fmt
}

/**
 *
 * @param {number} z 时区偏移
 */
function toDateInZ(value, z = 8) {
    const localOffset = new Date(value).getTimezoneOffset() * 60000 + (z ? z : 0) * 60 * 60000

    return new Date(value + localOffset)
}

export default cDate

/**
 * 指定日期离今天有几天
 * @param {*} date
 * @param {*} n
 */
export function isDayAfterN(date, n = 0) {
    if (!date || !(date instanceof Date)) {
        return false
    }
    let now = new Date()
    let tomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + n,
    )
    if (
        tomorrow.getDate() === date.getDate() &&
        tomorrow.getMonth() === date.getMonth() &&
        tomorrow.getYear() === date.getYear()
    ) {
        return true
    }

    return false
}
