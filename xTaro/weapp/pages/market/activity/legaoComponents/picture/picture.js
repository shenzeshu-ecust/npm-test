// pages/market/legaoComponents/picture/picture.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      value: {
        background: '',
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
  attached() {
    // this._setProps()
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _setProps() {
      let data = {}
      data = Object.assign({}, this.data)
      if (data.item.background) {
        data.item.background = this._formatImgUrl(data.item.background)
      }
      this.setData(data)
    },
    _formatImgUrl(url) {
      return /^http/.test(url.toString()) ? url : `https:${url}`
    }
  }
})
