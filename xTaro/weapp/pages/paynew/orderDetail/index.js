import {
  sendUbt
} from '../../thirdPlugin/paynew/common/combus'
import {
  PayParamsStore
} from '../../thirdPlugin/paynew/models/stores'

const payParamsStore = PayParamsStore()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    orderSummary: Object,
    res102: Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    KOrderDetail: {},
    KOrderTips: {},
    order: {},
    titleType: null,
    customTitle: [],
  },

  lifetimes: {
    created() {},
    attached: function () {
      const KOrderTips = this.properties.orderSummary.KOrderTips
      // const KOrderTips = {
      //   KOrderTipsTitle: 'KOrderTipsTitle',
      //   KOrderTipsContent: 'KOrdKOrderTipsContent',
      // }
      const KOrderDetail = this.properties.orderSummary.KOrderDetail
      const order = this.properties.res102.orderInfo.payOrderInfo.order

      // const payOrderInfo = JSON.parse("{\"header\":{\"version\":\"1.0\",\"scene\":\"INP\",\"requestId\":\"be409413-c0ba-47b8-9eaf-edf9714fdd1c\",\"outUserId\":\"M154335540\",\"uid\":\"M154335540\"},\"paymentType\":{\"payType\":9,\"payee\":1,\"paySubType\":1,\"autoPay\":false,\"paySourceType\":0,\"optType\":0},\"order\":{\"orderId\":\"28111535584\",\"externalNo\":\"\",\"orderAmount\":3536.000000,\"orderCurrency\":\"CNY\",\"exchangeRate\":\"\",\"orderTitle\":\"往返    海口-莫斯科\",\"autoApplyBill\":\"1\",\"displayTitle\":\"{\\\"titleType\\\":2,\\\"customTitle\\\":[{\\\"tag\\\":\\\"去程\\\",\\\"title\\\":\\\"海口美兰机场 - 莫斯科谢列蔑契娃机美兰机场 - 莫斯科谢列蔑契娃机美兰机场 - 莫斯科谢列蔑契娃机美兰机场 - 莫斯科谢列蔑契娃机场\\\",\\\"content\\\":\\\"2023-11-19 周日 18:55 起飞2023-11-19 周日 18:55 起飞2023-11-19 周日 18:55 起飞2023-11-19 周日 18:55 起飞2023-11-19 周日 18:55 起飞2023-11-19 周日 18:55 起飞\\\"},{\\\"tag\\\":\\\"返程\\\",\\\"title\\\":\\\"莫斯科谢列蔑契娃机场 - 海口美兰机场\\\",\\\"content\\\":\\\"2023-12-02 周六 18:40 起飞\\\"}]}\",\"payDeadLine\":\"\",\"displayAmount\":\"\",\"displayCurrency\":\"\",\"orderAvailableTime\":\"20231023171706\",\"showOrderAmount\":false,\"middleGround\":true},\"merchant\":{\"busType\":\"102\",\"merchantId\":\"200041\",\"recallUrl\":\"SOA20:http://webapi.soa.ctripcorp.com/api/13271/json/fltPayCallBackStatus\",\"isAppPaymentNotify\":0,\"notifyOptType\":1},\"payRestrict\":{\"payWayTypes\":0,\"blackPayWayTypes\":0,\"subPayWayTypes\":0,\"defaultPayType\":0,\"restrictBit\":0},\"payExtend\":{\"productList\":[{\"amount\":0,\"currency\":\"\",\"provider\":\"\",\"insurance\":false}],\"subTradeOrderList\":[{\"amount\":3536.0000,\"provider\":\"200041\",\"tradeType\":\"\",\"merchantName\":\"国际机票-无线\",\"insurance\":false}],\"travelerList\":[],\"invoiceInfo\":{\"needInvoice\":false,\"invoiceDeliveryFee\":0,\"includeInTotalPrice\":false},\"activityMaxCount\":0,\"loanPayStageCount\":\"\",\"loanPayBusType\":\"\",\"cashReceiverRanch\":0,\"cashReceiveSite\":0,\"disableDiscount\":false,\"supportedDiscountIds\":\"\",\"goodstag\":\"\",\"couponId\":\"\",\"lastGuranteeDay\":\"\",\"isIntegralGurantee\":\"\",\"integralGuranteeAmount\":0,\"attach\":\"\",\"payRemind\":\"[{\\\"text\\\":\\\"该价格仅剩3张票，请在19分钟内完成支付以免耽误出行\\\"}]\",\"islogin\":\"0\",\"thirdBankType\":\"\",\"osType\":\"\",\"allianceid\":\"\",\"sid\":\"\",\"qunarOpenId\":\"\",\"weixinOrgin\":\"\",\"paySort\":\"\",\"buSource\":0,\"selectedPayCategory\":0,\"selectedType\":0,\"avoidServiceCharge\":false,\"disableRealNameGuid\":false,\"supportNormalPay\":false,\"allowWechatDaifu\":false,\"supportFlightBeforePay\":false,\"repayment\":false},\"payOrderFlag\":1}")
      // const order = payOrderInfo.order

      console.log('orderSummary', this.properties.orderSummary)
      let { displayTitle = {} } = order;
      displayTitle = parseToJsonObj(displayTitle);
      const { titleType, customTitle = [] } = displayTitle;
      this.setData({
        KOrderDetail,
        KOrderTips,
        order,
        titleType,
        customTitle,
      })
    },
    detached: function () {},
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onClose(e) {
      sendUbt({
        a: 'c_pay_sms_close',
        type: 'click',
        dd: '短信点击关闭',
        id: e.target.id
      })
      if(/openBox|backModel|upClose/.test(e.target.id)){
        this.triggerEvent('detailclose')
      }
    },
  }
})

const parseToJsonObj = data => {
  console.log({ data }, 'parseData');
  if (data && isString(data)) {
      try {
          return JSON.parse(data);
      } catch (error) {
          console.log(error);
      }
  } else {
      return data;
  }
};

const isString = data => {
  var resStr = Object.prototype.toString.call(data);
  return resStr.toLowerCase() === '[object string]';
};