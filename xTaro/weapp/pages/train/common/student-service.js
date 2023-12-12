import cDate from './cDate'
import {
    getConfigInfoJSON,
} from './common'

const availableStuSeats = ["硬卧", "二等座", "硬座", "无座"]
let availableMouth = [1, 2, 3, 6, 7, 8, 9, 12]
let stuOverrangeTip

getConfigInfoJSON('train_wx_stuentservice')
    .then(res => {
        availableMouth = res.availableMouth
        stuOverrangeTip = res.tips
    }).catch(e => {
        console.log(e)
    })

export function isValidStuSeats(seats = []) {
    if (seats.length === 0) {
        return false
    }

    return seats.every(seat => {
        return availableStuSeats.indexOf(seat) > -1
    })
}

//date 格式2017-07-05
export function isValidStuDates(dates = []) {
    if (dates.length === 0) {
        return false
    }

    return dates.every(date => {
        let mouth = cDate.parse(date, true).getMonth() + 1

        return availableMouth.indexOf(mouth) > -1
    })
}

/**
 *
 * stuPsgs 学生票乘客列表
 * seatNames
 * fromDate e.g. 2017-07-05
 */
export function isValidationForStu({
    stuPsgs, seatNames, dates,
}) {
    const v = {
        isPass: true,
        errMsg: "",
        btnName: "",
        code: 0,
    }

    if (!stuPsgs || !stuPsgs.length) {
        return v
    }

    if (!isValidStuSeats(seatNames)) {
        v.isPass = false
        v.errMsg = "学生票仅支持硬座、硬卧、二等座、无座座席优惠，您选择的座席不在优惠范围内，请重新选择，或购买成人票"
        v.btnName = "修改座席"
        v.code = 1

        return v
    }
    // 学生票现在没有时间限制
    // if (!isValidStuDates(dates)) {
    //     v.isPass = false
    //     v.errMsg = stuOverrangeTip || "学生票的乘车时间为6月1日-9月30日，12月1日-5月31日。您选择的日期不在优惠时间段内，请修改日期或购买全价成人票"
    //     v.btnName = "返回"
    //     v.code = 2

    //     return v
    // }

    return v
}
