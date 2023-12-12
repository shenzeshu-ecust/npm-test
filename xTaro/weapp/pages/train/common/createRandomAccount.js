import { ConfigInfoModel } from './model'

let strChineseFirstPY = ''

ConfigInfoModel(
    {
        ConfigKey: 'train_wx_static_chinese_first_py',
    },
    res => {
        if (res.ConfigInfo && res.ConfigInfo.Content) {
            const content = JSON.parse(res.ConfigInfo.Content)
            strChineseFirstPY = content.text
            console.log('————中文首字母配置获取成功')
        } else {
            console.log('————中文首字母配置获取失败')
        }
    },
    err => {
        console.log('————中文首字母配置获取失败')
    }
)

function checkCh(ch) {
    let uni = ch.charCodeAt(0)
    //如果不在汉字处理范围之内,返回原字符,也可以调用自己的处理函数
    if (uni > 40869 || uni < 19968) {
        if ((uni >= 97 && uni <= 122) || (uni >= 65 && uni <= 90)) {
            return ch
        }

        return ''
    }

    //检查是否是多音字,是按多音字处理,不是就直接在strChineseFirstPY字符串中找对应的首字母
    return strChineseFirstPY.charAt(uni - 19968)
}

// 随机一个密码
export function createRandomPassword() {
    const number = ['2', '3', '4', '5', '6', '7', '8', '9']
    const lowercaseLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
    const uppercaseLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    const charList = [...uppercaseLetters, ...number, ...lowercaseLetters]
    let password = ''
    for (let i = 0; i < 6; i++) {
        password = password + charList[(Math.floor(Math.random() * charList.length))]
    }

    return password
}

// 根据姓名随机一个账户名
export function createRandomAccount(name) {
    let str = name || ''
    let arrResult = []
    for (let i = 0, len = str.length; i < len; i++) {
        let ch = str.charAt(i)
        let chCheck = checkCh(ch)
        if (chCheck) {
            arrResult.push(chCheck)
        }
    }
    const month = new Date().getMonth()
    const date = new Date().getDate()
    const hour = new Date().getHours()
    const minute = new Date().getMinutes()
    const time = `${month + 1 >= 10 ? (month + 1) : '0' + (month + 1)}` + `${date >= 10 ? date : '0' + date}` + `${hour >= 10 ? hour : '0' + hour}` + `${minute >= 10 ? minute : '0' + minute}`

    const randomAccount = arrResult.slice(0, 3).join('') + time

    return randomAccount
}
