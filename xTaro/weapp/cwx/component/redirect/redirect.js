/**
 * 右下角浮动
 * @module component/redirect
 */
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   * 用于组件自定义设置
   */
  // properties: {
  //   homeText: {            // 属性名
  //     type: String,     // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
  //     value: '去首页'     // 属性初始值（可选），如果未指定则会根据类型选择一个
  //   },
  //   appText: {
  //     type: String,
  //     value: '打开app'
  //   }
  // },
  /**
   * 私有数据,组件的初始数据
   * 可用于模版渲染
   */
  data: {
    // 显示控制
    showReturnHome: false,
    showOpenApp: false
  },

  /**
   * 组件的方法列表
   * 更新属性和数据的方法与更新页面数据的方法类似
   */
  methods: {
    /*
     * 公有方法
     */

    //显示去首页
    showHome() {
      this.setData({
        showReturnHome: true
      })
    },
    //显示打开app
    showApp() {
      this.setData({
        showOpenApp: true
      })
    },
    /*
    * 内部私有方法建议以下划线开头
    * triggerEvent 用于触发事件
    */
    _ToReturnHome() {
      this.triggerEvent("returnHome")
    },
    _ToOpenApp() {
      this.triggerEvent("openApp");
    }
  }
})