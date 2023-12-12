import {
  cwx,
  CPage,
  _
} from '../../../cwx/cwx.js';
import * as Util from '../../thirdPlugin/paynew/common/util.js';
import * as Business from '../../thirdPlugin/paynew/common/combus';
import mainBusiness, {openPaying} from '../../thirdPlugin/paynew/controllers/index.js';
const paymentStore = require('../../thirdPlugin/paynew/models/stores.js');

const orderDetailExtendStore = paymentStore.OrderDetailExtendStore();
let payWayStore = paymentStore.PayWayStore();
const paramStore = paymentStore.PayParamsStore()
let res303 = {}
CPage(Object.assign({
  pageId: '10320674321',
  checkPerformance: true, // 添加标志位
  data: {
    nopayment: false,
    payData: {},
    weiChatPay: false,

    isMoreTitle: false,
    introButtonShow: false, // 担保按钮是否显示
    instructionsModalHidden: true, //是否显示微信担保说明
    introTextData: { //showTips data
      title: '担保说明',
      subTitle: '',
      img: '',
      desc: ''
    },
    walletShowInfo: null,
    walletSelectAmount: null, // 钱包已选金额
    walletInfos: null, // 钱包已选支付方式
    restAmount: null, // 扣除其他后需要支付的金额,
    showSms: false, // 是否显示短信
    showPhoneNo: '', // 短信显示手机号
    sendPhone: '', // 短信发送手机号
    payToken: '',
    navbarData: {
      title: '安全收银台',
      customBack: true,
      showBack: true
    },
    showDetail: false,  // 是否显示订详
    orderSummary: {}, // 103订详信息
    res102: {},    // 102报文
  },
  onBack: function () {
    Business.sendUbt({
      type: 'chain',
      clickName: 'backButton',
      chainName: 'backButton',
      a: 'backButton.back',
      c: 30012,
      dd: '点击左上角回退'
    });

    try {
      mainBusiness.settings.fromCallback();
    } catch (error) {
      console.log(error)
    }
    wx.navigateBack()

  },

  onLoad: function (options) {
    if(!options.isUsingWallet){
      Business.initFullChain('pre_payment', 'H5')
    }
    Business.reportTraceLog({
      payToken: options.tradeNo || options.payToken,
      isDirect: !options.isUsingWallet
    })
    openPaying()
    cwx.payment.traceNoW = 1;
    if (!cwx.payment.sendUbtTrace) {
      cwx.payment.sendUbtTrace = Business.sendUbtTrace;
    };
    let that = this;
    let orderData = {};
    if (options == '' || !options || _.isEmpty(options)) {
      cwx.showModal({
        title: '提示',
        content: '系统异常，请重新提交订单(10000-0)',
        showCancel: false,
        success: function (res) {
          wx.navigateBack({
            delta: 1
          });
        }
      });

      Business.sendUbt({
        a: 'd-onload-start-receivedata',
        c: 100001,
        d: 'd-onload-start-receivedata',
        dd: '直连H5进入支付页面 onload 参数:' + 'directpayData: ' + JSON.stringify(options || '')
      });
      return;
    }

    if (options.tradeNo) {
      options.payToken = options.tradeNo
    }
    this.setData({
      payToken: options.payToken
    })
    orderData.serverData = options;

    orderData.data = options || {};

    Business.sendUbt({
      a: 'd-onload-start-parse',
      c: 100002,
      d: 'd-onload-start-parse',
      dd: '直连H5进入支付页面 onload start-parse',
      extend: options
    });
    if (options.isUsingWallet) {
      this.dealRes102()
    } else {
      //初始化数据，并提交102服务
      mainBusiness.init(orderData, true, this.dealRes102);
    }
  },

  dealRes102(response) {
    response = response || paramStore.get() || {};
    const weicat = response.weicat || {}
    //验证是否有微信支付方式
    const data = {}
    if (!weicat.brandId) {
      data.nopayment = true
    } else {
      data.weiChatPay = true
    }
    // 验证是否有钱包
    if (response.walletShowInfo) {
      data.walletShowInfo = response.walletShowInfo
    }
    // 取出详情
    const orderSummary = paramStore.getAttr('orderSummary') || {}
    const res102 = payWayStore.get()
    data.orderSummary = orderSummary
    data.res102 = res102
    
    this.setData(data)
    this.setOrderData();
    Business.sendUbt({
      type: 'chain',
      chainName: 'cashierShowDone',
      a: 'cashierShowDone',
      c: 100002,
      d: 'd-onload-start-parse',
      dd: '收银台展示成功'
    });
  },

  setOrderData: function () {
    const that = this;
    const orderInfoObj = Business.getOrderInfos();
    const payType = orderInfoObj.payType;
    console.log(orderInfoObj);
    const dispAmount = orderInfoObj.amount;
    let introButton = false;
    let introText = '';

    if (that.isInteger(dispAmount)) {
      orderInfoObj.disp_Amount = dispAmount.toFixed(2);
    } else {
      orderInfoObj.disp_Amount = dispAmount;
    }
    orderInfoObj.btnTxt = '支付'

    const newIntroData = Object.assign(that.data.introTextData, {
      desc: introText
    });
    let setDatas = {
      payData: orderInfoObj,
      introButtonShow: introButton,
      introTextData: newIntroData
    };

    console.log(setDatas);

    that.setData(setDatas);

  },
  onShow: function (res) {

  },
  onUnload: function () {
    cwx.hideToast();
    cwx.hideLoading();
  },
  isInteger: function (obj) {
    return (obj | 0) === obj
  },
  weicatPaysubmit: function () {
    Business.sendUbt({
      type: 'chain',
      clickName: 'paymentSubmit',
      chainName: 'paymentSubmit',
      isClickTrace: '1',
      a: 'd-weichat-submit-start',
      c: 100005,
      d: 'd-weichat-submit-start',
      dd: '开始提交支付 weichat-submit-start'
    });
    mainBusiness.showLoading('支付提交中...');
    mainBusiness.requestSubmit({
      walletInfos: this.data.walletInfos,
      restAmount: this.data.restAmount,
      submitCallBack: (res) => {
        res303 = res
        this.setData({
          showSms: true,
          showPhoneNo: res.showPhoneNo,
          sendPhone: res.sendPhone,
          payToken: res.tradeNo
        })
      }
    });
  },
  openInstructionsModal: function () {
    Business.sendUbt({
      a: 'd-db-ins',
      c: 100007,
      d: 'd-db-ins',
      dd: '担保说明点击'
    });
    const extendInfo = orderDetailExtendStore.get();
    this.setData({
      introTextData: {
        title: '担保说明',
        subTitle: '',
        img: '',
        desc: extendInfo.creditCardUseExplain || ''
      },
      cardBin: false,
      instructionsModalHidden: false
    });
  },
  closeInstructionsModal: function () {
    Business.sendUbt({
      a: 'd-db-ins-close',
      c: 100008,
      d: 'd-db-ins',
      dd: '担保说明关闭'
    });
    this.setData({
      instructionsModalHidden: true
    });
  },
  onSmsClose() {
    this.setData({
      showSms: false
    })
  },
  onSelectWallet() {
    Business.sendUbt({
      type: 'click',
      clickName: 'walletEnter',
      a: 'wallet-click',
      c: 100008,
      d: 'd-db-ins',
      dd: '点击钱包'
    });
    const mPage = cwx.getCurrentPage()
    Util.clearPaymentTraceId()
    if (this.data.walletInfos) paramStore.setAttr('walletInfos', this.data.walletInfos)
    mPage.navigateTo({
      url: '/pages/paynew/paywallet/paywallet',
      callback: (e) => {
        // 选择了钱包，需要混付
        if (e.type === 'usingWallet') {
          const {
            selectAmount,
            walletInfos
          } = e
          const restAmount = this.data.payData.disp_Amount - selectAmount
          this.setData({
            walletSelectAmount: selectAmount,
            walletInfos: walletInfos,
            restAmount: restAmount.toFixed(2)
          })
        } else {
          this.setData({
            walletSelectAmount: null,
            walletInfos: null,
            restAmount: this.data.payData.disp_Amount
          })
        }
      }
    })
  },
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
      walletInfos: this.data.walletInfos,
      restAmount: this.data.restAmount,
      riskParam,
      smsSubmitCallBack:()=>{
        this.setData({
          showSms: false
        })
      }
    })
  },
  onTapDetail(){
    this.setData({
      showDetail: true,
    })
  },
  onDetailClose(){
    this.setData({
      showDetail: false
    })
  }
}, {}))