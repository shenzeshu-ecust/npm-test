import {
  sendUbt
} from '../../thirdPlugin/paynew/common/combus'
import {
  sendSms,
  checkSms
} from './SmsController'
import {
  PayParamsStore
} from '../../thirdPlugin/paynew/models/stores'

const payParamsStore = PayParamsStore()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 短信掩码
    showPhoneNo: String,
    payToken: String,
    sendPhone: String,
  },

  /**
   * 组件的初始数据
   */
  data: {
    codeValue: '', // 验证码的值
    countDown: 0, // 倒计时时间
  },

  lifetimes: {
    created() {},
    attached: function () {
      // 在组件实例进入页面节点树时执行
      const smsCountDownDate = payParamsStore.getAttr('smsCountDownDate')
      const nowDate = new Date().getTime()
      if (smsCountDownDate && nowDate - smsCountDownDate < 60 * 1000) {
        this.startCountDown(60 - ((nowDate - smsCountDownDate) / 1000).toFixed(0))
      } else {
        payParamsStore.setAttr('smsCountDownDate', '')
        this.getSms()
      }
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
      this.dealCountNumber()
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    dealCountNumber() {
      // 如果倒计时未结束，先缓存倒计时开始时间戳
      if (this.data.countDown > 0) {
        payParamsStore.setAttr('smsCountDownDate', new Date().getTime() - (60 - this.data.countDown) * 1000)
      } else {
        payParamsStore.setAttr('smsCountDownDate', '')
      }
    },
    onInputDone(e) {
      this.setData({
        codeValue: e.detail.value,
      })
    },
    onClose() {
      sendUbt({
        a: 'c_pay_sms_close',
        type: 'click',
        dd: '短信点击关闭',
      })
      this.triggerEvent('smsclose')
    },
    async onSubmit() {
      sendUbt({
        a: 'c_pay_sms_submit',
        type: 'click',
        dd: '短信点击提交',
        codes: this.data.codeValue
      })
      if (this.data.codeValue.length < 6) return
      const res = await checkSms({
        codes: this.data.codeValue
      })
      this.triggerEvent('submitpay', res)
    },
    // 发送短信
    async getSms() {
      const res = await sendSms({
        payToken: this.properties.payToken,
        sendPhone: this.properties.sendPhone,
      })
      if (res.result == 'success') {
        this.startCountDown()
      }
    },
    // 倒计时
    startCountDown(count = 60) {
      this.setData({
        countDown: count,
      })
      const timer = setInterval(() => {
        let countDown = this.data.countDown
        countDown--
        this.setData({
          countDown
        })
        if (countDown <= 0) {
          clearInterval(timer)
        }
      }, 1000);
    },

    // 重新获取短信
    onResend() {
      sendUbt({
        a: 'c_pay_sms_resend',
        type: 'click',
        dd: '短信点击重新发送',
      })
      this.getSms()
    }
  }
})