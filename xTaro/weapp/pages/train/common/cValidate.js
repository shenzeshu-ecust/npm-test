
/**
 * 是否为合法身份证号
 * @param card
 * @returns {boolean}
 */
export function isValidCardNum(card) {

    // 12306官方校验规则
    let f = 0
    let a = card
    let e = {
        11: "北京",
        12: "天津",
        13: "河北",
        14: "山西",
        15: "内蒙",
        21: "辽宁",
        22: "吉林",
        23: "黑龙",
        31: "上海",
        32: "江苏",
        33: "浙江",
        34: "安徽",
        35: "福建",
        36: "江西",
        37: "山东",
        41: "河南",
        42: "湖北",
        43: "湖南",
        44: "广东",
        45: "广西",
        46: "海南",
        50: "重庆",
        51: "四川",
        52: "贵州",
        53: "云南",
        54: "西藏",
        61: "陕西",
        62: "甘肃",
        63: "青海",
        64: "宁夏",
        65: "新疆",
        71: "台湾",
        81: "香港",
        82: "澳门",
        83: "台湾",
        91: "国外",
    }
    if (!/^\d{17}(\d|x)$/i.test(a)) {
        return false
    }
    a = a.replace(/x$/i, "a")
    if (e[parseInt(a.substr(0, 2))] == null) {
        return false
    }
    let c = a.substr(6, 4) + "-" + Number(a.substr(10, 2)) + "-" + Number(a.substr(12, 2))
    let h = new Date(c.replace(/-/g, "/"))
    if (c != (h.getFullYear() + "-" + (h.getMonth() + 1) + "-" + h.getDate())) {
        return false
    }
    for (let b = 17; b >= 0; b--) {
        f += (Math.pow(2, b) % 11) * parseInt(a.charAt(17 - b), 11)
    }
    if (f % 11 != 1) {
        return false
    }

    return true
}


/**
 * 是否为合法护照号码
 * @param card
 * @returns {boolean}
 */
export function isValidPassport(card) {
    let reg = /^[a-zA-Z0-9]{5,17}$/

    return reg.test(card)
}

/**
 * 是否为合法港澳通行证
 * @param card
 * @returns {boolean}
 */
export function isValidHKMacao(card) {
    let reg = /^[HMhm]{1}([0-9]{10}|[0-9]{8})$/

    return reg.test(card)
}

/**
 * 是否为合法港澳通行证
 * @param card
 * @returns {boolean}
 */
export function isValidTaiwan(card) {
    let reg1 = /^[0-9]{8}$/
    let reg2 = /^[0-9]{10}$/

    return reg1.test(card) || reg2.test(card)
}

/**
 * 外国人永久居留身份证
 * @param card
 * @returns {boolean}
 */
export function isValidFPCResidencePermit(card) {
    let reg1 = /^[a-zA-Z]{3}(\d){12}/

    return reg1.test(card)
}

/**
 * 港澳台居民居住证
 * @param card
 * @returns {boolean}
 */
export function isValidGATResidencePermit(card) {
    if (!card.startsWith("810000") && !card.startsWith("820000") && !card.startsWith("830000") ){
        return false
    }

    return isValidCardNum(card)
}

export function isValidCardEmail(val) {
    let reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/

    return reg.test(val)
}
