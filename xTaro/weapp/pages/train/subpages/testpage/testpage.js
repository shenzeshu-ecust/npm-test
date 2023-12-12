import { cwx, __global } from "../../../../cwx/cwx"
import TPage from "../../common/TPage"
import util from "../../common/util"
import { getUserBindedPhoneNumber } from "../../common/common"
import { TrainActStore, TrainToolStroe } from "../../common/store"
const env = __global.env
TPage({
  pageId: "",
  /**
     * 页面的初始数据
     */
  data: {
    itemsEnv: [
      {
        name: "fat",
        value: "fat",
        checked: env == "fat",
      },
      {
        name: "uat",
        value: "uat",
        checked: env == "uat",
      },
      {
        name: "prd",
        value: "prd",
        checked: env == "prd",
      },
      {
        name: "canary",
        value: "canary",
        checked: env == "canary",
      }
    ],
    clientID: "",
    openid: "",
    userBindedPhoneNumber: "",
    uid: "",
    duid: "",
    auth: "",
    hasLogin: false,
    env: __global.env,
    launchAPPUrl:
            "ctrip://wireless/h5?url=aHR0cHM6Ly9tLmN0cmlwLmNvbS93ZWJhcHAvdHJhaW4vYWN0aXZpdHkvMjAyMDA2MTUtY3RyaXAtZ3Vlc3MtbG93ZXN0LXByaWNlP2lzSGlkZU5hdkJhcj1ZRVM=&type=2",
    enableProxyMock: false,
    urlList: [],
    openUrlList: false,
    storageKey: "",
    storageValue: "",
    storageRes: "",
    url: "",
    commonStoreKey: [
      'TRAIN_BOOK_STORE',
      'TRAIN_ACTIVITY_STORE',
      'TRAIN_QUERY_STORE',
      'TRAIN_STATION_STORE'
    ],
  },

  /**
     * 生命周期函数--监听页面加载
     */
  onLoad: function () {},

  /**
     * 生命周期函数--监听页面显示
     */
  onShow: function () {
    this.setData({
      hasLogin: cwx.user.isLogin(),
      env:
                wx.getStorageSync("globalEnvSetting") ||
                wx.getStorageSync("_globalEnvSetting"),
    })
    this.setCData()
    this.getUserInfo()
    this.setUserBindedPhoneNumber()
    this.getUid()
    this.getAbTest()
    if (this.data.env !== TrainActStore.getAttr("TESTPAGEENV", env)) {
      cwx.user.auth = ""
      cwx.user.duid = ""
      wx.setStorageSync("cwx_market_new", "")
    }
    TrainActStore.setAttr("TESTPAGEENV", this.data.env)
    this.setData({
      itemsEnv: [
        {
          name: "fat",
          value: "fat",
          checked: this.data.env == "fat",
        },
        {
          name: "uat",
          value: "uat",
          checked: this.data.env == "uat",
        },
        {
          name: "prd",
          value: "prd",
          checked: this.data.env == "prd",
        },
        {
          name: "canary",
          value: "canary",
          checked: this.data.env == "canary",
        }
      ],
      auth: cwx.user.auth,
      duid: cwx.user.duid,
    })
    const urlList = TrainToolStroe.getAttr("toolRouteUrlList") || []
    this.setData({
      urlList,
    })
    this.setData({
      enableProxyMock: wx.getStorageSync("_enableProxyMock") === "1",
    })
  },
  onClickBackBtn(){
    cwx.navigateBack()
  },
  onUrlListSwitchChange() {
    this.setData({
      openUrlList: !this.data.openUrlList,
    })
  },
  envChange(e) {
    // test
    if (e.detail.value === "canary") {
      wx.setStorageSync("_globalEnvSetting", e.detail.value)
      wx.setStorageSync("globalEnvSetting", "")
    } else {
      wx.setStorageSync("globalEnvSetting", e.detail.value)
      wx.setStorageSync("_globalEnvSetting", "")
    }
    wx.setEnableDebug({ enableDebug: true })
    if (cwx.useSocket == "1") {
      cwx.useSocket = "0"
    }
    this.onShow()
  },
  onProxyMockChange(e) {
    wx.setStorageSync("_enableProxyMock", e.detail.value ? "1" : "")
  },

  setUserBindedPhoneNumber() {
    if (!this.data.hasLogin) return

    return getUserBindedPhoneNumber()
      .then((res) => {
        if (res) {
          this.setData({ userBindedPhoneNumber: res })
        }
      })
      .catch((e) => {
        console.log("setUserBindedPhoneNumber", e)
      })
  },

  toLogin() {
    cwx.user.login({ callback: function () {} })
  },
  getUserProfile() {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: "用于完善会员资料", // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        const nickName = res.userInfo.nickName
        const avatarUrl = res.userInfo.avatarUrl
        this.setNickNameAndAvatar(nickName, avatarUrl)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
        })
        TrainActStore.setAttr("USERINFO", {
          ...res.userInfo,
          openid: cwx.cwx_mkt.openid,
        })
      },
    })
  },
  getUserInfo() {
    let userInfo = TrainActStore.getAttr("USERINFO")
    if (userInfo && userInfo.openid == cwx.cwx_mkt.openid) {
      const nickName = userInfo.nickName
      const avatarUrl = userInfo.avatarUrl
      console.log("userInfo", userInfo)
      this.setNickNameAndAvatar(nickName, avatarUrl)
    }
    // wx.getUserInfo({
    //     success: (res) => {
    //         const userInfo = res.userInfo
    //         const nickName = userInfo.nickName
    //         const avatarUrl = userInfo.avatarUrl
    //         console.log('userInfo', res)
    //         this.setNickNameAndAvatar(nickName, avatarUrl)
    //     },
    //     fail: () => {
    //         this.setNickNameAndAvatar('', '')
    //     },
    // })
  },
  clearStorage: function () {
    let that = this
    wx.clearStorage({
      success: function () {
        util.showToast('已清除')
        that.onShow()
      },
    })
  },
  setNickNameAndAvatar(nickName, avatarUrl) {
    this.setData({ nickName, avatarUrl })
  },

  getAbTest() {
    const abValues = [{ key: "200818_TRN_JSXFX", name: "cashbackAbTest" }]
    const valuearr = []
    let abtest = {}
    for (let item of abValues) {
      let abValue = cwx.ABTestingManager.valueForKeySync(item.key)
      const setAb = (abOpt) => {
        const abtestValUbt = `${item.key}:${abOpt};`
        valuearr.push(abtestValUbt)

        if (abOpt) {
          this.ubtSet("abtest", valuearr.join("")) // 埋点
          abtest[item.name] = abOpt
          this.setData({ abtest })
        }
      }
      setAb(abValue)
    }
  },
  /**
     * 用户点击右上角分享
     */
  onShareAppMessage: function () {
    return { title: "测试页", path: this.route }
  },

  copyToClipboard(e) {
    const { clipData } = e.currentTarget.dataset
    this.copy(clipData)
  },

  copy(clipData) {
    cwx.setClipboardData({
      data: clipData,
      success() {
        util.showToast("copied")
      },
      fail(res) {
        util.showModal({
          m: "复制失败，原因：" + JSON.stringify(res),
        })
      },
    })
  },

  scanCode() {
    wx.scanCode({
      success: (res) => {
        this.setData({ url: res.path })
      },
      fail() {
        util.showModal({ m: "扫码失败" })
      },
    })
  },
  routeTo(relaunchFlag) {
    let url = this.data.url
    if (url.indexOf('http') === 0) {
      url = `/pages/trainActivity/twebview/index?url=${encodeURIComponent(url)}`
    } else if (url[0] !== "/") {
      url = "/" + url
    }
    const urlList = this.data.urlList
    urlList.unshift(url)
    if (urlList.length > 10) {
      urlList.pop()
    }
    TrainToolStroe.setAttr("toolRouteUrlList", urlList)
    this.setData({
      url,
      urlList,
    })
    if (relaunchFlag) {
      return cwx.reLaunch({ url })
    }
    cwx.navigateTo({ url })
  },
  routeToPage() {
    this.routeTo()
  },
  relaunchToPage() {
    this.routeTo(true)
  },
  /**
     * 设置一些 cwx 上的变量
     */
  setCData() {
    this.setData({
      clientID: cwx.clientID,
      openid: cwx.cwx_mkt && cwx.cwx_mkt.openid,
    })
  },
  showAbValues() {
    this.getAbTestingValue()
      .then((abs) => {
        this.setData({ abs })
      })
      .catch(() => {
        util.showModal({ m: "读取ab实验失败" })
      })
  },
  getAbTestingValue() {
    const deferred = util.getDeferred()
    wx.getStorage({
      key: "ABTestingManager",
      success: function (res) {
        if (!res || !res.data) {
          deferred.reject()

          return
        }
        let abs = res.data
        deferred.resolve(abs)
      },
    })

    return deferred.promise
  },
  onAbChange(e) {
    const { index } = e.currentTarget.dataset
    const { abs } = this.data
    abs[index].abValue = e.detail.value.toUpperCase()
    this.setData({ abs })
  },
  setAbValues() {
    wx.setStorage({ key: "ABTestingManager", data: this.data.abs })
  },
  onInputUrl(e) {
    this.setData({
      url: e.detail.value,
    })
  },
  onInputStoreKey(e) {
    this.setData({
      storageKey: e.detail.value,
    })
  },
  onInputStoreValue(e) {
    this.setData({
      storageValue: e.detail.value,
    })
  },
  onClickUrl(e) {
    const { url } = e.target.dataset
    this.setData({ url })
  },
  getUid() {
    if (!this.data.isLogin) return
    // let env = this.data.env
    let host = "https://passport.ctrip.com"
    // if (env === 'fat') {
    //     host = "https://passport.fat466.qa.nt.ctripcorp.com"
    // } else if (env === 'uat') {
    //     host = "https://passport.ctrip.uat.qa.nt.ctripcorp.com"
    // } else if (env === 'prd' || env == 'canary') {
    //     host = "https://passport.ctrip.com"
    // }

    cwx.request({
      url: `${host}/gateway/api/soa2/13191/getAccountInfoByTicket.json`,
      method: "POST",
      data: {
        Data: { ticket: cwx.user.auth },
      },
      header: {
        "content-type": "application/json", // 默认值
      },
      success: (res) => {
        let result = JSON.parse(res.data.Result)
        this.setData({
          uid: result.uid,
        })
      },
    })
  },
  getStorage() {
    let res = cwx.getStorageSync(this.data.storageKey)
    if (typeof res === "object") {
      res = JSON.stringify(res)
    }
    this.setData({
      storageRes: res,
    })
  },
  setStorage() {
    if (!this.data.storageKey) {
      return util.showToast("key?!")
    }

    let value = this.data.storageValue

    if (!value) {
      return util.showModal({
        title: "提示",
        m: "是否删除该key的缓存",
        showCancel: true,
        cancelText: "否",
        confirmText: "是",
        done: (res) => {
          if (res.confirm) {
            cwx.removeStorageSync(this.data.storageKey)
          }
        },
      })
    }


    util.showModal({
      title: "提示",
      m: "是否以字符串类型保存",
      showCancel: true,
      cancelText: "否",
      confirmText: "是",
      done: (res) => {
        if (res.confirm) {
        } else {
          value = JSON.parse(value)
        }
      },
    })
    cwx.setStorageSync(this.data.storageKey, value)
  },
  onClickCommonStoreKey(e){
    const { key } = e.target.dataset
    this.setData({ storageKey: key })
  },
})
