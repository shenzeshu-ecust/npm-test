import { Utils } from '../../common/utils.js'
import { cwx } from '../../../../cwx/cwx.js'

Component({
  properties: {
    couponList: {
      type: Array,
      value: []
    },
    couponMsg: {
      type: String,
      value: ''
    },
    hasBargained: {
      type: Boolean,
      value: false
    },
    weixinGroup: {
      type: Object,
      value: {
        normalText: '',
        highlightText: '',
        subTitle: '',
        buttonText: '',
        jumpURL: '',
      }
    }
  },
  data: {
    showCouponDetail: false, // 是否展示砍价弹框
    isExpand: false, // 是否展开优惠券
    couponTitle: '',
    couponDetailList: [],
  },
  methods: {
    onClickCoupon(_res) {
      const index = Utils.getValue(_res, 'currentTarget.dataset.index'),
        coupon = this.data.couponList[index]
      this.setData({
        showCouponDetail: true, couponTitle: coupon.title, couponDetailList: this.getCouponDetailList(coupon.remark)
      })
      this.triggerEvent('logTrace', { code: 122795, value: { msg: '用户点击优惠券' } })
    },
    onClickGoUse(){
      this.triggerEvent('logTrace', { code: "C_Flt_N_kanjia_usecoupon", value: { msg: '点击优惠券去使用' } })
      const jumpURL = './groupDetail/index?groupURL=https://m.ctrip.com/html5/flight/swift/index' 
      cwx.navigateTo({ url: jumpURL}) 
    },
    onCloseCouponModal() {
      this.setData({ showCouponDetail: false })
    },
    onExpandCouponList() {
      this.setData({ isExpand: true })
    },
    onClickGroupEntry() {
      const jumpURL = './groupDetail/index?groupURL=' + this.data.weixinGroup.jumpURL
      cwx.navigateTo({ url: jumpURL})
    },

    getCouponDetailList(str) {
      if (!str) return
      let splits = []
      if (str.includes('\\\\')) {
        splits = str.split('\\\\')
        if (splits && splits.length > 0) {
          return splits
        }
      }
      splits.push(str)

      return splits
    }
  }
})
