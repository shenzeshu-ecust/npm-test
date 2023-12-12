import { cwx } from "../../cwx.js"

Component({
  options: {
    styleIsolation: 'isolated',
    pureDataPattern: /^_/ // 指定所有 _ 开头的数据字段为纯数据字段
  },
  externalClasses: ['cemojiClass'], // 外部样式类
  properties: {
    /**
     * @param { string } inputValue 文本
     * @param { string } wrapperStyle 壳的行内样式
     * @param { string } cemojiStyle 图片的行内样式
     * 注意：行内样式中，尺寸单位应为 px
     */
    inputObj: {
      type: Object,
      observer: "propertyDataChange"
    }
  },
  data: {
    // 这里是一些组件内部数据
    htmlSnip: '',
  },
  lifetimes: {
    created: function () {
      // 在组件实例刚刚被创建时执行
    },
    attached: function () {
      // 在组件实例进入页面节点树时执行
      // 不管缓存有没有数据，先使用缓存
      let that = this;
      cwx.getCEmojiMapData(function (data) {
        // 延迟 5s 再更新，防止用户看到内容突然变化
        setTimeout(() => {
          that.propertyDataChange(that.properties.inputObj);
        }, 5000)
      });
      // 初始渲染
      this.propertyDataChange(this.properties.inputObj)
    },
    ready: function () {
      // 在组件在视图层布局完成后执行 
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    }
  },
  methods: {
    propertyDataChange: function (inputObj) {
      const showContent = cwx.convertCEmojiInput(inputObj);
      if (this.data.htmlSnip !== showContent) {
        console.log("当前渲染的内容和输入内容不一致，重新渲染")
        this.setData({
          htmlSnip: showContent
        })
      }
    }
  }
})
