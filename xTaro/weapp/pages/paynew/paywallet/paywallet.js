import {
  cwx,
  CPage
} from '../../../cwx/cwx.js';
import __global from '../../../cwx/ext/global.js';
import Stores from '../../thirdPlugin/paynew/models/stores.js'
import {
  getWalletInfo,
  isSamePayways
} from '../../thirdPlugin/paynew/components/utilWallet.js';
import mainBusiness from '../../thirdPlugin/paynew/controllers/index.js';
import {
  sendUbt,
  reportErrorLog
} from '../../thirdPlugin/paynew/common/combus.js';
import * as Util from '../../thirdPlugin/paynew/common/util.js';

const PayWayStore = Stores.PayWayStore()
const paramStore = Stores.PayParamsStore()
let res303 = {}
CPage({
  /**
   * 组件的初始数据
   */
  data: {
    navbarData: {
      title: '钱包支付',
      customBack: true,
      showBack: true
    },
    walletWays: null, // 服务下发的钱包支付列表
    orderInfo: null,
    showWalletWays: null, // 用来展示的钱包支付列表
    selectAmount: 0, // 总和： 已选的卡金额
    needAmount: 0, // 剩余还需支付金额
    selectTips: [], // 抵扣须知 tip
    walletTips: [], // 钱包使用说明 tip
    showPhoneNo: '', // 风控短信手机号掩码
    showSms: false, // 是否显示短信
    showPhoneNo: '', // 短信显示手机号
    sendPhone: '', // 短信发送手机号
    payToken: '',
  },

  // 队列： 记录用户选择的钱包，以队列方式存储。 方便计算优先扣除金额
  stackPayways: [],
  orderTips: null,
  checkPerformance: true, // 添加标志位
  preWalletInfo: null, // 缓存上次的选择记录

  onBack: function () {
    sendUbt({
      type: 'click',
      clickName: 'walletBack',
      a: 'wallet.back',
      c: 30012,
      dd: '点击左上角回退'
    });

    // 如果之前和现在一样：直接返回
    if (isSamePayways(this.preWalletInfo, this.getPaymentWalletInfos())) {
      wx.navigateBack()
    } else {  // 如果之前和现在不一样
      // 如果现在为空，做挽留
      if(this.data.selectAmount == 0){
        wx.showModal({
          title: '确认不使用携程钱包的金额',
          confirmText: '不使用',
          cancelText: '再想想',
          success:(res)=>{
            if(res.confirm){
              sendUbt({
                type: 'click',
                a: 'back-confirm',
                dd: '确认不使用携程钱包的金额 - 不使用',
              })
              this.backWithPayway()
            }else{
              sendUbt({
                type: 'click',
                a: 'back-cancel',
                dd: '确认不使用携程钱包的金额 - 再想想',
              })
              // 啥也不做
            }
          }
        })
      }else{
        // 如果现在不为空，做确认
        wx.showModal({
          title: '您修改了使用选项',
          content: '请重新确认您使用的携程钱包金额',
          confirmText: '放弃修改',
          cancelText: '确定',
          success:(res)=>{
            if(res.confirm){
              sendUbt({
                type: 'click',
                a: 'back-confirm',
                dd: '确认不使用携程钱包的金额 - 放弃修改',
              })
              Util.clearPaymentTraceId()
              wx.navigateBack()
            }else{
              // 啥也不做
              sendUbt({
                type: 'click',
                a: 'back-cancel',
                dd: '您修改了使用选项 - 确定',
              })
            }
          }
        })
      }
    }
  },

  onLoad() {
    const Res102 = PayWayStore.get()
    const {
      orderInfo,
      displayInfo
    } = Res102
    const payway = getWalletInfo(Res102) || []
    const showWalletWays = payway
      .filter(i => i.brandId !== 'WelfareCredit') // 过滤疗休养
      .map(item => ({
        ...item,
        canUseAmount: Math.min(item.limitAmount || Infinity, item.availableAmount),
        usingAmount: 0,
        isUsing: false,
      }))
    const {
      tips
    } = displayInfo
    this.orderTips = tips
    const selectTips = tips.filter(i => i.key == 10)
    const walletTips = tips.filter(i => /^(11|12)$/.test(i.key))
    this.setData({
      walletWays: payway,
      showWalletWays,
      orderInfo: orderInfo,
      needAmount: orderInfo.orderAmount,
      selectTips,
      walletTips,
    })

    // 如果有选择过钱包，计算选择金额并渲染
    const walletInfos = paramStore.getAttr('walletInfos')
    if (walletInfos) {
      this.preWalletInfo = walletInfos
      this.stackPayways = walletInfos.map(i => {
        return showWalletWays.find(s => s.brandId == i.brandId)
      })
      this.computeShowPayWays()
      paramStore.setAttr('walletInfos', null) // 用后清空
    } else {
      this.preWalletInfo = null
    }

  },


  // 计算展示的列表
  computeShowPayWays() {
    if (!this.data.walletWays) return null
    const orderAmount = this.data.orderInfo.orderAmount || 0
    let sum = 0

    // 先清空
    this.data.showWalletWays.forEach(item => {
      item.usingAmount = 0
      item.isUsing = false
    })

    // 根据队列顺序计算抵扣金额
    for (const wayInStack of this.stackPayways) {
      let usingAmount = 0
      if (wayInStack.canUseAmount > orderAmount - sum) {
        usingAmount = Number(orderAmount - sum).toFixed(2)
        sum = orderAmount
      } else {
        usingAmount = Number(wayInStack.canUseAmount).toFixed(2)
        sum = Number(sum) + Number(usingAmount)
      }

      const showWay = this.data.showWalletWays.find(i => i.brandId == wayInStack.brandId)
      showWay.usingAmount = usingAmount
      showWay.isUsing = true
      wayInStack.usingAmount = usingAmount

      if (sum >= orderAmount) {
        break
      }
    }

    // 替换钱包说明文案
    const tip = this.data.walletTips.find(i => i.key == '11')
    tip.value = tip.value.replace('{0}', sum)

    this.setData({
      showWalletWays: this.data.showWalletWays,
      selectAmount: Number(sum).toFixed(2),
      needAmount: Number(orderAmount - sum).toFixed(2),
      walletTips: this.data.walletTips
    })
  },

  // 点击一个钱包
  onWalletWayClick(e) {
    const way = e.currentTarget.dataset.item
    sendUbt({
      type: 'click',
      a: 'onSelectWallet',
      dd: '点击一个余额选项',
      extend: way
    })
    if (way.status != '1') return
    const wayInStack = this.stackPayways.find(i => i.brandId == way.brandId)
    // 如果已经在队列中，删除这个卡，重新计算
    if (wayInStack) {
      this.stackPayways = this.stackPayways.filter(i => i.brandId != way.brandId)
    } else {
      // 如果不在队列，看是否已满，未满放到末尾， 重新计算
      if (this.data.needAmount <= 0) {
        return
      }
      this.stackPayways.push({
        ...way,
      })
    }

    this.computeShowPayWays()
  },

  // 返回收银台的参数： 选择的钱包抵扣详情
  getPaymentWalletInfos() {
    const res = this.stackPayways.map(item => ({
      payAmount: item.usingAmount,
      routerInfo: {
        routerWayId: item.routerWayId,
        paymentWayToken: item.paymentWayToken
      },
      brandId: item.brandId,
      ticketType: item.type
    }))
    return res
  },

  // 点击确认按钮
  weicatPaysubmit() {
    sendUbt({
      type: 'click',
      a: 'wallet_submit',
      dd: '余额页点击确认',
      needAmount: this.data.needAmount
    })
    if (this.data.selectAmount == 0) {
      return
    }
    if (this.data.needAmount == 0) {
      // 满足金额可直接支付
      mainBusiness.requestSubmit({
        walletInfos: this.getPaymentWalletInfos(),
        restAmount: 0,
        submitCallBack: (res) => {
          res303 = res
          // 验证短信
          if (res.head.code == 66) {
            sendUbt({
              type: 'chain',
              chainName: 'startRiskCheck',
              a: 'mini_wallet_startRiskCheck',
              c: 30012,
              dd: '钱包开始风控校验',
              extend: res
            });
            const {
              riskAndPwdInfos
            } = res
            if (riskAndPwdInfos.find(i => i.verifyCodeType == 1)) {
              // 开始短信验证
              this.setData({
                showSms: true,
                showPhoneNo: res.showPhoneNo,
                sendPhone: res.sendPhone,
                payToken: res.tradeNo
              })
            } else {
              cwx.showToast({
                title: '暂时无法使用钱包支付',
                icon: 'none',
              })
              reportErrorLog({
                errorType: 'mini_wallet_risk_pwd',
                errorMessage: `钱包下发了密码校验`,
                level: 'p0',
                extendInfo: riskAndPwdInfos
              })
              setTimeout(() => {
                cwx.navigateBack()
              }, 2000)
            }
          } else {
            wx.showToast({
              title: res.head.message || '系统异常，请稍后再试',
              icon: 'error'
            })
          }
        }
      })

    } else {
      // 金额未满则回退
      this.backWithPayway()
    }
  },
  // 带钱包选项返回
  backWithPayway() {
    const mPage = cwx.getCurrentPage()
    Util.clearPaymentTraceId()
    mPage.navigateBack({
      type: 'usingWallet',
      selectAmount: this.data.selectAmount,
      walletInfos: this.getPaymentWalletInfos()
    })
  },
  onSmsClose() {
    this.setData({
      showSms: false
    })
  },
  // 触发短信验证提交
  onSmsSubmitpay(param) {
    const riskParam = {
      vChainToken: res303.vChainToken,
      riskAndPwdInfos: [{
        riskVerifyToken: param.detail.riskVerifyToken,
        verifyCodeType: param.detail.verifyCodeType,
        verifyRequestId: param.detail.verifyRequestId,
      }]
    }
    mainBusiness.requestSubmit({
      isSmsSubmit: true,
      paymentTraceId: res303.paymentTraceId,
      walletInfos: this.getPaymentWalletInfos(),
      restAmount: 0,
      riskParam,
      smsSubmitCallBack: ()=>{
        this.setData({
          showSms: false
        })
      }
    })
  },
})