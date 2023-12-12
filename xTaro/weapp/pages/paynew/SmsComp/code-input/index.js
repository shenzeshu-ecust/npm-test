import { sendUbt } from '../../../thirdPlugin/paynew/common/combus'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 验证码
    codeValue: '',
    // 渲染用数组
    inputItems: new Array(6).fill(''),
    // 聚焦到input
    focus: true,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onInput(e){
      const value = e.detail.value
      this.setData({
        codeValue: value,
        inputItems: value.padEnd(6).split('')
      })
      this.triggerEvent('inputdone', {value})
    },
    // 整个组件点击事件： 定位到输入框
    onBoxTap(){
      sendUbt({
        a: 'c_pay_sms_input_tap',
        type: 'click',
        dd: '短信输入框点击',
      })
      this.setData({
        focus: true
      })
    },
    onBlur(){
      this.setData({focus: false})
    }
  }
})
