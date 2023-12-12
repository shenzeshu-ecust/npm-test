import { FetchStatus } from '../../common/constants.js'

Component({
  properties: {
    isUerLogin: {
      type: Boolean,
      value: false
    },
    phoneNumber: {
      type: String,
      value: ''
    },
    pageErrorMsg: {
      type: String,
      value: '没找到砍价订单哦～'
    },
    hasHistoryBargained: {
      type: Boolean,
      value: false
    },
    getPhoneNumberLoading: {
      type: Boolean,
      value: true
    },
    pageStatus: {
      type: Number,
      value: FetchStatus.LOADING
    },
    nickName: {
      type: String,
      value: ''
    },
    canIUseProfile: {
      type: Boolean,
      value: false
    },
    bguserlist: {
      type: Array,
      value: []
    },
    numberNeeded: Number,
    anchorPoint: {
      type: String,
      value: ''
    },
    orderStatus: Number,
    orderInfo: {
      type: Object,
      value: {
        needs: 5,
        helpers: [],
        orderId: '',
        status: 0,
        price: 0,
        backCash: 0,
        hashtybgd: false,
        historyBargainText: '邀好友砍价',
        icptip: '你已经帮别人砍过价啦，X天内仅能砍价一次哦'
      }
    }
  },
  data: {
    FetchStatus
  },
  methods: {
    getPhoneNumberByTicket() {
      this.triggerEvent('logTrace', { code: 106120, value: { msg: '点击砍价' } })
      this.triggerEvent('getPhoneNumberByTicket')
    },
    phoneNumberHandler(res) {
      this.triggerEvent('logTrace', { code: 106120, value: { msg: '未登录用户点击砍价' } })
      this.triggerEvent('phoneNumberHandler', { res })
    },
    mobileTokenSeizeBind(res) {
      this.triggerEvent('logTrace', { code: 106120, value: { msg: '已登录未绑定手机号用户点击砍价' } })
      this.triggerEvent('mobileTokenSeizeBind', { res })
    },
    showHistoryBargained() {
      this.triggerEvent('logTrace', { code: 106120, value: { msg: '帮别人购买过的用户点击砍价' } })
      this.triggerEvent('showHistoryBargained')
    },
    getUserProfile() {
      this.triggerEvent('getUserProfile')
    },
    getScrollBottom() {
      this.triggerEvent('logTrace', { code: 'C_Flt_N_kanjia_browseflight', value: { msg: '点击逛逛低价机票' } })
      this.triggerEvent('getScrollBottom')
    },
    shareFriend(){
      this.triggerEvent('logTrace', { code: 'C_Flt_N_kanjia_sharemore', value: { msg: '点击加号分享' } })
    },
    handleUnPhoneVerify() {
      this.triggerEvent('handleUnPhoneVerify');
    }

  }
})
