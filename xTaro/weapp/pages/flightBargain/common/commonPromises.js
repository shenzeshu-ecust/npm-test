import { cwx, _ } from '../../../cwx/cwx.js'

let cachedOpenId
export const getOpenId = (timeout) => {
  return new Promise((resolve, reject) => {
    if (cachedOpenId) {
      resolve(cachedOpenId)
    } else {
      let retryCount = 1
      const timer = setInterval(() => {
        if (cwx.cwx_mkt.openid) {
          clearInterval(timer)
          cachedOpenId = cwx.cwx_mkt.openid
          resolve(cachedOpenId)
        } else if (retryCount++ >= timeout / 100) {
          clearInterval(timer)
          reject(cachedOpenId)
        }
      }, 100)
    }
  })
}

let cachedLocation
export const getLocation = () => {
  return new Promise((resolve, reject) => {
    if (cachedLocation) {
      resolve(cachedLocation)
    } else {
      cwx.locate.startGetCtripCity((ret) => {
        let latitude = 0
        let longitude = 0
        if(ret.data){
          latitude = ret.data && ret.data.CityLatitude || 0;
          longitude = ret.data && ret.data.CityLongitude || 0;
          cachedLocation = ret.data && ret.data.CityEntities[0]
        }
      
        if (cachedLocation) {
          delete cachedLocation.CityID
          delete cachedLocation.CityName
          cachedLocation.latitude = latitude
          cachedLocation.longitude = longitude
          resolve(cachedLocation)
        } else {
          reject(new Error('Promise Error'))
        }
      }, 'flight-bargain')
    }
  })
}

let cacheUserInfo
export const getUserInfo = () => new Promise((resolve, reject) => {
  if (cacheUserInfo) {
    resolve(cacheUserInfo)
  } else {
    checkUserInfoScope()
      .then((isAccess) => {
        if (!isAccess) {
          resolve({
            nickName: '',
            avatarUrl: ''
          })
        }
        cwx.getUserInfo({
          success: (res) => {
            if (res && res.userInfo) {
              cacheUserInfo = res.userInfo
              resolve(res.userInfo)

              return
            }

            reject(new Error('res data error'))
          },
          fail: (err) => {
            reject(err)
          }
        })
      })
      .catch((err) => {
        reject(err)
      })
  }
})

export const checkUserInfoScope = () => new Promise((resolve, reject) => {
  cwx.getSetting({
    success: (res) => {
      const ret = res.authSetting['scope.userInfo']

      // 用户信息需要用户点击触发
      resolve(!!ret)
    },
    fail: (err) => {
      reject(err)
    }
  })
})

/**
 * 判断是否登录，有callback时，是异步
 * @param {function} [callback]
 * @return {*}
 */
export const checkLogin = () => {
  return cwx.user.isLogin()
}
