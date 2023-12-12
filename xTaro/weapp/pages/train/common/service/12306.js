import {
    Login12306Model,
    Check12306Model,
    createModel,
    CheckFaceSuccessNotifyModel,
    TrainFaceAuthenticationRiskModel,
} from '../model'
import { cwx } from '../../../../cwx/cwx'
import util from '../util'
export const Login12306Promise = util.promisifyModel(Login12306Model)
export const Check12306Promise = util.promisifyModel(Check12306Model)
import { TrainBookStore } from '../store'

class Error12036 {
    constructor(errcode = 0, errmsg = '',failCode = -1, originData = {}) {
        this.errcode = errcode
        this.errmsg = errmsg
        this.failCode = failCode
        this.originData = originData
    }
}
Error12036.errcodes = {
    login: 1,
    checkTimeout: 2,
    accountError: 3,
    other: 4,
}

export const TrainFaceAuthenticationRiskPromise = util.promisifyModel(TrainFaceAuthenticationRiskModel)

export async function checkScanFace (param) {
    const res = await TrainFaceAuthenticationRiskPromise(param)
    const { RetCode, IsCanFaceAuthentication } = res
    if (RetCode == 1 && IsCanFaceAuthentication) {
        return true
    }
    return false
}
export function login12306Action({
    UserName,
    Password,
    IsCheckExist = 0,
    ...rest
}) {
    return Login12306Promise({
        UserName,
        Password,
        IsCheckExist,
        ...rest,
    }).then(data => {
        if (data.Code != 0) {
            throw new Error12036(Error12036.errcodes.login, `12306故障，请稍候重试(${Error12036.errcodes.login})`, data.Code, data)
        }

        return check12306Action({
            RequestKey: data.RequestKey,
            Password,
            UserName,
        })
    })
}

export function check12306Action ({
    RequestKey,
    UserName,
    PartnerName = 'Ctrip.Train',
    Token = '',
    Password,
    ...rest
}) {
    let timeout = false
    let timer1 = setTimeout(() => {
        clearTimeout(timer1)
        timeout = true
    }, 8000)

    const params = {
        RequestKey,
        UserName,
        PartnerName,
        Token,
        ...rest,
    }

    return Check12306Promise(params).then(data => {
        //0登录成功  ；3正在处理中；4登录失败；5夜间系统维护中，6=用户名或密码错误；7=需短信核验；8=刷脸
        if (data.Code == 0 || data.Code == 1) {
            let tmp = {
                name: UserName,
                // pwd: Password,
                passengerList12306: data.PassengerList || [],
            }

            TrainBookStore.setAttr('bind12306', tmp)

            return data
        } else if (data.Code == 3) {
            if (timeout) {
                const errcode = Error12036.errcodes.checkTimeout
                throw new Error12036(errcode, `系统异常，请稍后重试(${errcode})`, data.Code, data)
            } else {
                const deferred = util.getDeferred()
                setTimeout(() => {
                    deferred.resolve()
                }, 1000)

                return deferred.promise
                    .then(() => {
                        return check12306Action(params)
                    })
            }
        } else if (data.Code == 4) {
            const errcode = Error12036.errcodes.accountError
            const failCode = data.Code
            const errmsg = data.Message === '用户名或密码错误' ? '输入有误' : (data.Message || `系统异常，请稍后重试(${errcode})`)
            throw new Error12036(errcode, errmsg, failCode, data)
        } else {
            const failCode = data.Code
            const errcode = Error12036.errcodes.other
            const errmsg = `系统异常，请稍后重试(${errcode})`
            throw new Error12036(errcode, errmsg, failCode, data)
        }
    })
}



// let geoPoint = null
// function getGeoPoint() {
//     // todo: 缓存结果
//     cwx.locate.startGetGeoPoint(
//         {
//             type:'wgs84',
//             success:function(res) {
//                 if (!res.error) {
//                     geoPoint = {
//                         latitude: res.latitude,
//                         longitude: res.longitude,
//                     }
//                 }
//             },
//             fail:function(resp){
//                 console.log("fail getGeoPoint" + resp.error)
//             },
//         },
//     )
// }
