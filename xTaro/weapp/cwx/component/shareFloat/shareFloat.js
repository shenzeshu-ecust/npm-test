// cwx/component/shareFloat/shareFloat.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    shareType: {
        type: String,
        value: "all"
    },
    floatTitle: {
        type: String,
        value: "请选择分享方式"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTimeline: true,
    showFriend: true,
    floatTitle: "请选择分享方式"
  },

  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () {
        // console.log("perInfoProtectFloat attached ------")
    },
    ready: function () {
        this.handleShowType();
    },
  },

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () {
        this.handleShowType();
    },
    hide: function () { },
    resize: function () { },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleShowType () {
        let data = {};
        if (this.properties.floatTitle && this.properties.floatTitle !== this.data.floatTitle) {
            data.floatTitle = this.properties.floatTitle;
        }
        if (this.properties.shareType === "timeline") {
            data.showFriend = false;
        } else if (this.properties.shareType === "friend") {
            data.showTimeline = false;
        }
        if (Object.keys(data).length) {
            this.setData(data);
        }
    },
    onCompHide(e) {
      // detail对象，提供给事件监听函数
      // 触发事件的选项
      this.triggerEvent('hideshare', {}, {})
    },
    onShare(e) {
      console.log(e)
      if (e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.type === "timeline") {
        this.triggerEvent('sharetimeline', {}, {})
      }
      setTimeout(function () {
        this.onCompHide()
      }.bind(this), 2000)
    }
  }
})
