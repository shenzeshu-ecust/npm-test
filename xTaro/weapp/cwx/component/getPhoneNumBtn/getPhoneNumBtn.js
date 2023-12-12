// cwx/component/getPhoneNumBtn/getPhoneNumBtn.js

const { cwx, __global } = require("../../cwx");
const STORAGE_KEY = "cwx_getPhoneNumBtn_timer"

Component({
  options: {
    multipleSlots: true,
    styleIsolation: 'shared'
  },
  /**
   * 组件的属性列表
   */
  properties: {
    limitTriggerCGP: {
      type: Boolean,
      value: false
    },

    // 标识使用方来源
    sourceKey: {
      type: String,
      value: ""
    },
    // 是否使用默认的 loading 效果
    disableLoading: {
      type: Boolean,
      value: true
    },
    // loading 时，按钮展示的提示文案
    btnLoadingText: {
      type: String,
      value: "loading 中，请稍候"
    },
    // loading 时，按钮的样式类名
    btnLoadingClassName: {
      type: String,
      value: "loading"
    },
    // 按钮处于可使用状态时，展示的提示文案
    btnReadyText: {
      type: String,
      value: "手机号快速验证"
    },
    // 按钮处于可使用状态时，按钮的样式类名
    btnReadyClassName: {
      type: String,
      value: "ready"
    },
    // 校验失败，按钮不可用时，展示的提示文案
    btnErrorText: {
      type: String,
      value: "校验失败，请使用其他方式验证手机号"
    },
    // 校验失败，按钮不可用时，按钮的样式类名
    btnErrorClassName: {
      type: String,
      value: "error"
    },
    // 控制按钮调用频率（单位：秒）
    limitFrequency: {
      type: Number,
      optionalTypes: [Boolean],
      value: 60
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    passCheck: false, // sourceKey 是否通过校验
    isInit: true,
    disableBtn: true, // 按钮是否可用（source 校验通过后才可置为可用）
    showLoading: true, // 正在检查 sourceKey
    content: "", // 按钮显示内容
    countdown: 0, // 倒计时
    isCountdown: false,
    btnClassName: "",
  },

  lifetimes: {
    created: function () {
      // 时机太早，拿不到页面传来的数据
    },
    attached: function () {
      // console.log("attached, this.properties:", this.properties)
      cwx.sendUbtByPage.ubtTrace('mkt_getPhoneNumber_load', {
        launchtime: new Date().getTime(),
        source: this.properties.sourceKey,
        type: "getPhoneNumber",
      });
      
      // 如果本地缓存中 sourceKey 有值，则先倒计时
      this.initCountDown = this.getStoreCountDown();

      this.checkSource("init");
    },
    detached: function () {
      this.timer = null;
      // 将倒计时缓存到本地
      this.setStoreCountDown();
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    setStoreCountDown: function () {
      let storage = cwx.getStorageSync(STORAGE_KEY)
      if (!storage) {
        storage = {}
      } else {
        try {
          storage = JSON.parse(storage)
        } catch (err) {
          console.error(err);
          storage = {};
        }
      }
      storage[this.properties.sourceKey] = this.data.countdown;
      cwx.setStorageSync(STORAGE_KEY, JSON.stringify(storage))
    },
    getStoreCountDown: function () {
      let storage = cwx.getStorageSync(STORAGE_KEY)
      if (!storage) {
        storage = {}
      } else {
        try {
          storage = JSON.parse(storage)
        } catch (err) {
          console.error(err);
          storage = {};
        }
      }
      return storage && this.properties.sourceKey && storage[this.properties.sourceKey] || 0;
    },
    // 正在检查 sourceKey
    setLoadingStatus: function () {
      this.setData({
        disableBtn: true, // 按钮不可用
        showLoading: !this.properties.disableLoading, // 是否显示默认的 loading 效果
        btnClassName: this.properties.btnLoadingClassName,
        content: this.properties.btnLoadingText
      })
      // 需告知使用方校验结果
      this.triggerEventByStatus("loading", "正在校验 sourceKey")
    },
    triggerEventByStatus: function (status, message) {
      this.triggerEvent("clistenbtnstatus", {
        status,
        message,
        sourceKey: this.properties.sourceKey
      })
      
      if (this.properties.limitTriggerCGP) {
        return;
      }
      
      this.triggerEvent("cgetphonenumber", {
        status,
        message,
        sourceKey: this.properties.sourceKey
      })
    },

    setReadyStatus: function () {
      // 校验通过，将按钮置为可用状态
      this.setData({
        disableBtn: false,
        showLoading: false,
        btnClassName: this.properties.btnReadyClassName,
        content: this.properties.btnReadyText
      })
      // 需告知使用方校验结果
      this.triggerEventByStatus("ready", "sourceKey 校验成功，可使用手机号快速校验功能")
    },
    setErrorStatus: function (message) {
      this.setData({
        disableBtn: true,
        showLoading: false,
        btnClassName: this.properties.btnErrorClassName,
        content: this.properties.btnErrorText
      })
      // 需告知使用方校验结果
      this.triggerEventByStatus("error", message)
    },
    // 用户点击 button, 获取手机号，需要把手机号返回给 BU 
    getPhoneNumber: function (e) {
      // console.log("getPhoneNumber res:", e)
      // 需要兼容低版本基础库
      // 从 2.21.2 起，对getPhoneNumber接口进行了安全升级，bindgetphonenumber 返回的信息中增加code参数
      const { errMsg = "", code = "" } = e && e.detail || {}
      cwx.sendUbtByPage.ubtTrace('mkt_getPhoneNumber_click', {
        launchtime: new Date().getTime(),
        type: "getPhoneNumber",
        source: this.properties.sourceKey,
        code,
        resMsg: errMsg,
      });
      if (e.detail.errMsg !== "getPhoneNumber:ok") {
        // 用户未授权，不需要倒计时
        this.triggerEvent("cgetphonenumber", Object.assign(e, {
          userAllow: false
        }))
        return;
      }

      this.triggerEvent("cgetphonenumber", Object.assign(e, {
        sourceKey: this.properties.sourceKey,
        userAllow: true
      }))
      this.checkSource();
    },
    checkSource: function (type) {
      this.setLoadingStatus();
      const {
        sourceKey
      } = this.properties;
      console.log("%c 开始校验 sourceKey:", "color:red;", sourceKey);
      let data = {
        sourceKey: this.properties.sourceKey,
        thirdpartPlatformName: "WECHAT",
        thirdpartAppId: __global.appId
      };
      if (type === "init") {
        data.sceneType = 1;
      }
      cwx.request({
        url: '/restapi/soa2/29052/checkSourceKey',
        // 'http://gateway.m.fws.qa.nt.ctripcorp.com/restapi/soa2/29052/checkSourceKey',
        data,
        method: "POST",
        success: (res) => {
          console.log("checkSourceKey success:", res)
          this.handleCheckResult(res)
        },
        fail: (err) => {
          console.log("checkSourceKey fail:", err)
          this.handleCheckResult(err)
        }
      })
    },

    handleCheckResult: function (res) {
      const resData = res && res.data || {};
      if (resData.resultCode === 0 && resData.result && resData.result.valid) { // 根据接口契约修改
        console.log("%c sourceKey 校验通过，可以获取手机号", "color:green;");
        this.data.passCheck = true;
        // 可以倒计时
        this.setReadyStatus()
        this.handleCountDown()
        return;
      }

      console.log("%c sourceKey 校验失败，按钮不可用", "color:red;");
      this.data.passCheck = false;
      this.setErrorStatus(resData.result && resData.result.message || resData.resultMessage || "sourceKey 校验失败，请检查入参的 sourceKey 是否正确");
    },

    handleCountDown: function () {
      const { limitFrequency } = this.properties;
      
      // 如果 limitFrequency 是 boolean 并且为 false, 不限制频率，即没有倒计时，直接设置状态
      if (typeof limitFrequency === "boolean" && !limitFrequency) {
        this.data.isInit = false;
        this.setReadyStatus()
        return;
      }
      
      if (this.data.isInit) {
        this.data.isInit = false;
        
        if (!this.initCountDown) {
          this.setReadyStatus();
          return;
        }
        
        this.setData({
          isCountdown: true,
          countdown: this.initCountDown
        })
      }

      // 设置倒计时 初始值
      if (this.data.countdown === 0) {
        this.setData({
          isCountdown: true,
          countdown: this.properties.limitFrequency
        })
      }
      
      this.timer = setTimeout(() => {
        let _cd = this.data.countdown - 1;
        this.setData({
          countdown: _cd
        }, () => {
          if (this.data.countdown > 0) {
            this.handleCountDown();
            return;
          }
          
          // 结束倒计时
          this.setData({
            isCountdown: false
          })
          this.setReadyStatus();
        })
      }, 1000)
    },
  }
})