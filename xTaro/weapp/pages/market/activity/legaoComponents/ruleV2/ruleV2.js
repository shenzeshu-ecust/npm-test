// pages/market/legaoComponents/ruleV2/ruleV2.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      value: {
        isOpen: true,
        rules: '',
        bgType: 2,
        bgContent: 'transparent',
        titleColor: '#000',
        top: '0px'
      },
      observer: '_setProps'
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
    _setProps() {
      let data = {}
      data = Object.assign({}, this.data)
      if (data.item.rules) {
        data.item.rules = this._formatRule(data.item.rules)
      }
      this.setData(data)
    },
    _formatRule(rule) {
      return rule.split('$')
    },
    toggleRule() {
      let item = this.data.item
      let isOpen = item.isOpen
      item.isOpen = !isOpen
      console.log(item.isOpen)
      this.setData({
        item: item
      })
    }
  }
})
