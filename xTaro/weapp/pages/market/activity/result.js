import { cwx, CPage, __global } from '../../../cwx/cwx'
import util, { model } from 'common/util'
const ADDR_CONF = {
  'fat': {
    aid: 10000,
    sid: 10000
  },
  'prd': {
    aid: 100319,
    sid: 1001736
  }
}[__global.env]
const ICON_URL = {
  'Coupon': 'https://pages.c-ctrip.com/activitysetupapp/webresource2/component/lottery/coupon.png',
  'ThirdCoupon': 'https://pages.c-ctrip.com/activitysetupapp/webresource2/component/lottery/coupon.png',
  'Point': 'https://pages.c-ctrip.com/activitysetupapp/webresource2/component/lottery/point.png',
  "Holder": 'https://pages.c-ctrip.com/activitysetupapp/webresource2/component/lottery/gift.png',
}
const log = console.log.bind(console)
CPage({
  /**
   * 页面的初始数据
   */
  data: {
    scenecode: '',
    // 回到首页
    isHomeBtn: false,
    // 签名
    sign: '',
    // 顶部banner
    banner: {
      img: '',
      url: ''
    },
    dataList: [],
    // 券码浮层
    isModalShow: false,
    // 券码图片
    couponCode: {
      qrcode: '',
      barcode: '',
      code: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this
    const { scenecode } = options
    if (!scenecode) {
      wx.showModal({
        title: '提示',
        content: '缺少活动相关信息，请退出重试',
        confirmText: '我知道了',
        success(data) {
          if (data.confirm) { }
        }
      })
      return
    }
    this.setData({
      scenecode: scenecode
    })
    this.ubtMetric({
      name: 101573,
      tag: { "sceneCode": scenecode, "openid": cwx.cwx_mkt.openid, "page": 'result' },
      value: 1
    })
    if (!cwx.user.isLogin()) {
      util.resultHandler('login', true, () => {
        cwx.user.login({
          callback() {
            self.fetchJoinList()
          }
        })
      })
      return
    }
    this.fetchJoinList()

  },
  /**
   * 打开/关闭券码浮层
   */
  toggleModal(e) {
    let self = this
    let isModalShow = this.data.isModalShow
    if (!isModalShow) {
      let dataSet = e.currentTarget.dataset
      const { procode, code } = dataSet
      if (!procode || !code) {
        wx.showModal({
          title: '提示',
          content: '缺少券码信息',
          showCancel: false,
          confirmText: '我知道了',
          success(data) { }
        })
        return
      }
      wx.showLoading({
        title: '加载中'
      })
      this.fetchAwardList(procode, (prizeRecords = []) => {
        let codeArr = prizeRecords.filter(item => {
          return item.prizeCode == code
        })
        log(codeArr, 'codeArr')
        if (codeArr.length && codeArr[0] && codeArr[0].serialCode) {
          let serialCode = codeArr[0].serialCode
          self.fetchCodeImg(serialCode, (arr = []) => {
            let couponCode = {
              qrcode: '',
              barcode: '',
              code: serialCode
            }
            arr.forEach(item => {
              if (item.encodeType === 0) {
                couponCode.barcode = 'data:image/jpeg;base64,' + item.encodedContent
              }
              if (item.encodeType === 1) {
                couponCode.qrcode = 'data:image/jpeg;base64,' + item.encodedContent
              }
            })
            self.setData({
              couponCode: couponCode
            })
          })
          self.setData({
            isModalShow: !isModalShow
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '暂无券码',
            showCancel: false,
            confirmText: '我知道了',
            success(data) { }
          })
        }
      })
    } else {
      self.setData({
        isModalShow: !isModalShow
      })
    }
  },
  /**
   * 展示奖品明细
   */
  togglePromotion(e) {
    let self = this
    let dataSet = e.currentTarget.dataset
    const { idx, procode, url } = dataSet
    let btnTxt = '去查看'
    let item = this.data.dataList[idx]
    if (!item) {
      return
    }
    if (!item.children.length) {
      wx.showLoading({
        title: '加载中'
      })
      this.fetchPromotionList(procode, (childPrizeInfos = []) => {
        let prizeList = childPrizeInfos.map(item => {
          let obj = {},
            ext = {},
            cus = {}
          try {
            ext = JSON.parse(item.extension || '{}')
            cus = JSON.parse(item.custom || '{}')
          } catch (e) {
            log('parse prizeList ext/cus error', e)
          }
          obj.name = item.name
          obj.code = item.code
          obj.proCode = procode
          obj.isThirdCoupon = item.type === 'ThirdCoupon'
          obj.fig = util.formatImgurl(ext.iconSrc || ICON_URL[item.type] || ICON_URL.Holder)
          obj.btn = ext.btnText || btnTxt
          obj.link = ext.wxUrl || url
          return obj
        })
        item.children = prizeList
        item.isChildShow = !item.isChildShow
        this.setData({
          [`dataList[${idx}]`]: item
        })
      })
    } else {
      item.isChildShow = !item.isChildShow
      this.setData({
        [`dataList[${idx}]`]: item
      })
    }
  },
  /**
   * 获取奖品列表
   * @param  {Array}  list [description]
   */
  renderJoinList(list = []) {
    let pList = list.map((item, index) => {
      let obj = {},
        ext = {},
        cus = {}
      try {
        ext = JSON.parse(item.prizeInfo.extension || '{}')
        cus = JSON.parse(item.prizeInfo.custom || '{}')
      } catch (e) {
        log('setprize parse err:', e)
      }
      let type = item.prizeInfo.prizeType
      obj.title = item.prizeInfo.name || '奖品'
      obj.date = util.formatDate(item.joinTime)
      obj.imgurl = util.formatImgurl(ext.url || ICON_URL.Holder)
      obj.link = cus.wxUrl || ''
      obj.btn = cus.btnText || ''
      obj.children = []
      obj.isChildShow = false
      // 实物奖直接跳转填写地址页
      if (type === 2) {
        obj.link = `/pages/market/activity/address?aid=${ADDR_CONF.aid}&sid=${ADDR_CONF.sid}&scenecode=${this.data.scenecode}`
        obj.btn = '填写地址'
      }
      obj.isBtn = !!obj.link
      // 虚拟奖可以展开查看更多
      if (type === 1) {
        obj.proCode = item.prizeInfo.promotionCode
        obj.isMore = true
        obj.isBtn = false
      }
      return obj
    })

    this.setData({
      dataList: pList
    })

    if (pList.length === 0) {
      this.setData({
        isHomeBtn: true
      })
    }
  },
  /**
   * 渲染顶部头图
   * @param  {Object} sceneInfo [description]
   */
  renderHeading(sceneInfo = {}) {
    if (sceneInfo.extension) {
      let ext = {}
      try {
        ext = JSON.parse(sceneInfo.extension)
      } catch (e) {
        console.log(e)
      }
      let img = ext.titleImg || 'https://pages.c-ctrip.com/amsweb/mycoupons/img/bar.jpg'
      let url = ext.wxUrl
      this.setData({
        banner: {
          img: util.formatImgurl(img),
          url: url
        }
      })
    }
  },
  fetchJoinList() {
    let self = this
    model('13458', 'queryJoinList')({
      data: {
        sceneCode: this.data.scenecode
      },
      success(res) {
        if (res.code == 0) {
          self.renderHeading(res.sceneInfo)
          self.renderJoinList(res.recordInfos)
        } else {
          util.errorHandler(res.code, '(-4)')
        }
      }
    })
  },
  fetchPromotionList(promotionCode, callback) {
    model('13458', 'queryPromotionInfo')({
      data: {
        promotionCode,
        pageNo: 1,
        pageSize: 10,
        identifier: ''
      },
      success(res) {
        if (res.code == 0) {
          callback && callback(res.childPrizeInfos)
        } else {
          util.errorHandler(res.code, '(-5)')
        }
      },
      complete() {
        wx.hideLoading()
      }
    })
  },
  /**
   * 生成签名
   * 只有中了实物奖才能得到结果
   * @return {[type]} [description]
   */
  fetchSign() {
    let self = this
    model('13458', 'generateSign')({
      data: {
        sceneCode: self.data.scenecode,
        aid: ADDR_CONF.aid,
        sid: ADDR_CONF.sid
      },
      success(res) {
        const { code, signature } = res
        if (code === 0) {
          self.setData({
            isVerified: true,
            signature: signature
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '签名获取失败，请稍后再试',
            showCancel: false,
            confirmText: '我知道了',
            success(data) {

            }
          })
        }
      }
    })
  },
  fetchAwardList(promotionCode, callback) {
    model('13458', 'queryAwardList')({
      data: {
        identifier: '',
        promotionCode,
        pageNo: 1,
        pageSize: 10
      },
      success(res) {
        const { code, prizeRecords } = res
        if (code === 0) {
          callback && callback(prizeRecords)
        } else {
          util.errorHandler(code)
        }
      },
      complete() {
        wx.hideLoading()
      }
    })
  },
  fetchCodeImg(serialCode, callback) {
    model('13458', 'generateEncodedCode')({
      data: {
        encodeParams: [{
          encodeType: 1,
          content: serialCode
        }, {
          encodeType: 0,
          content: serialCode
        }]
      },
      success(res) {
        console.log(res, 'fetchCodeImg')
        const { code, encodedCodes } = res
        if (code === 0) {
          callback && callback(encodedCodes)
        }
      }
    })
  },
  validate(obj) {
    let o = obj || {}
    for (let i in o) {
      if (!o[i]) {
        return false
      }
    }
    return true
  },
  jump(e) {
    let url = e.currentTarget.dataset.url

    if (!url) {
      return
    } else if (url.includes('/myctrip/index') || url.includes('/home/homepage')) {
      cwx.switchTab({ url: url })
    } else {
      cwx.navigateTo({ url: url })
    }
  }
})