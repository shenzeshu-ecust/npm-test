import { addpushVoucher } from '../utils/voucherutils.js'

Component({
  externalClasses: ['formid-button-class'],

  /**
   * 组件的属性列表
   */
  properties: {
    openType: {
      type: String,
      value: null
    },
    shareModel: {
      type: Object,
      value: null
    },
    transmitInfo: {
      type: Object,
      value: null
    },
    disabled: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  /**
   * 组件的方法列表
   */
  methods: {
    formSubmit: function (e) {
      console.log('formId为：', e.detail.formId);

      // addpushVoucher({
      //   voucher: e.detail.formId,
      //   type: 1
      // })
    }
  }
})
