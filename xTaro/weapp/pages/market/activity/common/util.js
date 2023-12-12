import { cwx } from '../../../../cwx/cwx'
const BASE_URL = '/restapi/soa2'
const CODE = {
  ERROR: -1,
  SUCCESS: 0,
  UNDERSTOCK: 10003,
  UNBOUND_MOBILE: 40007,
  USER_NOT_LOGIN: 40006,
  USER_DUPLICATE_JOIN: 40012,
  MOBILE_DUPLICATE_JOIN: 40013,
  CLIENT_DUPLICATE_JOIN: 40014,
  NOT_QULIFIED: 40026,
  DAY_DUPLICATE: 40028,
  WEEK_DUPLICATE: 40029,
  MONTH_DUPLICATE: 40030,
  USER_INFO_FAIL: 40035,
  DUPLICATE_JOIN: 40036
}
const DEFAULT_CONFIG = {
  error_cnt: '活动繁忙，请稍后再试',
  btn: '我知道了',
  duplicate_cnt: '您已经参与过了哦',
  understock_cnt: '参与活动的人太多了，请稍后再试',
  unqualified_cnt: '不好意思，您不符合参与条件哦',
  fail_cnt: '参与活动的人太多了，请稍后再试',
  phone_cnt: '参与活动需要先绑定手机哦',
  phone_btn: '去绑定',
  login_cnt: '登录后即可参与',
  login_btn: '去登录',
  userinfo_cnt: '获取用户信息失败，请退出重试',
  dayDuplicate_cnt: '今天已经参与过了哦，明天再来吧',
  weekDuplicate_cnt: '这周已经参与过了哦，下周再来吧',
  monthDuplicate_cnt: '本月已经参与过了哦，下月再来吧',
}
const errCallback = (msg) => {
  cwx.showModal({
    title: '提示',
    content: msg || '请检查网络后再试',
    showCancel: false,
    confirmText: '知道了'
  })
}

export const model = (code, path) => {
  let url = `${BASE_URL}/${code}/${path}`
  return function ({ data, success, fail = errCallback, complete = () => { } }) {
    cwx.request({
      url,
      data,
      success(res) {
        if (res && res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack == "Success") {
          console.log(res, `model res: ${path}`)
          success && success(res.data)
        }
      },
      fail(res) {
        fail && fail()
      },
      complete() {
        complete()
      }
    })
  }
}

let util = {
  showLoading(t) {
    if (wx.showLoading) {
      return wx.showLoading({
        title: t || '正在加载',
        mask: true
      })
    }

    wx.showToast({
      title: t || '正在加载',
      icon: 'loading',
      duration: 10000,
      mask: true
    })
  },
  hideLoading() {
    if (wx.hideLoading) {
      return wx.hideLoading()
    }
    wx.hideToast()
  },
  showToast(t) {
    wx.showToast({
      title: t,
      icon: 'success',
      mask: true
    })
  },
  hideToast() {
    wx.hideToast()
  },
  errorHandler(code, posi) {
    let msg = '',
      p = posi || ''
    switch (code) {
      case CODE.ERROR:
        this.resultHandler('error')
        break
      case CODE.UNDERSTOCK:
        this.resultHandler('understock')
        break
      case CODE.UNBOUND_MOBILE:
        this.resultHandler('phone', true, () => {
          cwx.user.login({
            callback(){}
          })
        })
        break
      case CODE.USER_NOT_LOGIN:
        this.resultHandler('login', true, () => {
          cwx.user.login({
            callback(){}
          })
        })
        break
      case CODE.USER_DUPLICATE_JOIN:
      case CODE.MOBILE_DUPLICATE_JOIN:
      case CODE.CLIENT_DUPLICATE_JOIN:
      case CODE.DUPLICATE_JOIN:
        this.resultHandler('duplicate')
        break
      case CODE.DAY_DUPLICATE: //重复领取
        this.resultHandler('dayDuplicate')
        break
      case CODE.WEEK_DUPLICATE:
        this.resultHandler('weekDuplicate')
        break
      case CODE.MONTH_DUPLICATE:
        this.resultHandler('monthDuplicate')
        break
      case CODE.NOT_QULIFIED:
        this.resultHandler('unqualified')
        break
      default:
        this.resultHandler('error')
    }
  },
  resultHandler(type, isCancel = false, callback) {
    let cntTxt = DEFAULT_CONFIG[`${type}_cnt`] || ''
    let btnTxt = DEFAULT_CONFIG[`${type}_btn`] || DEFAULT_CONFIG[`btn`]
    if (cntTxt) {
      wx.showModal({
        title: '提示',
        content: cntTxt,
        confirmText: btnTxt,
        showCancel: isCancel,
        success(data) {
          if (data.confirm) {
            callback && callback()
          }
        }
      })
    }
  },
  /**
   * 对Gateway返回的json数据进行日期格式化
   * 格式化后其中的日期格式会变为 yyyy-MM-dd HH:mm:ss 格式
   * @param {Object}
   * @return {Object}
   */
  formatDate(data) {
    return JSON.parse(
      JSON.stringify(data).replace(/\/Date\(\-?(\d+)(?:\-|\+)(?:\d+)\)\//g, function () {
        return new Date(Number(arguments[1]) + 8 * 3600 * 1000).
          toISOString().replace(/^(.*)T(.*)\.\d+Z$/, '$1 $2')
      })
    )
  },
  formatImgurl(url) {
    return /^http/.test(url.toString()) ? url : `https:${url}`
  },
  compareVersion(v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')
    let len = Math.max(v1.length, v2.length)

    while (v1.length < len) {
      v1.push('0')
    }
    while (v2.length < len) {
      v2.push('0')
    }

    for (let i = 0; i < len; i++) {
      let num1 = parseInt(v1[i])
      let num2 = parseInt(v2[i])

      if (num1 > num2) {
        return 1
      } else if (num1 < num2) {
        return -1
      }
    }

    return 0
  }
}

export default util