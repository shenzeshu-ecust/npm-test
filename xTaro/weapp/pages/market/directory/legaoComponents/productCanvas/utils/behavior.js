
module.exports = Behavior({
  data: {
    currModuleName: "",
    currModule: "",
    currProduct: {},
    showItems: 0,
  },
  ready: function () {

  },
  methods: {

    getTextWidth(text, font) {},
    clickHandlers() {
      const { data } = this.data;
      if (data) {
        wx.setStorageSync('currModuleName', data ? data.props.values.name : '')
        wx.setStorageSync('currModule', data || {})
      }
      try { this.returnComponent(wx.getStorageSync('currModuleName') || "empty", wx.getStorageSync('currModule')) } catch (error) {
      };
    },

    /** 处理px转rpx */
    pxTorpx(px) {
      let rpx = px * 750 / wx.getSystemInfoSync().windowWidth;
      rpx = Math.ceil(rpx)
      return rpx;
    },

    /** 跳转宽高 */
    transFormBoxwh(styles) {
      if (styles['width'] === 0 || styles['width'] === '0px' || styles['width'] === '0' || styles['width'] === 'NaNpx') {
        delete styles['width']
      }
      if (styles['height'] === 0 || styles['height'] === '0px' || styles['height'] === '0' || styles['height'] === 'NaNpx') {
        delete styles['height']
      }
      if (styles['max-height'] === 0 || styles['max-height'] === 'NaNpx' || styles['max-height'] === "auto") {
        delete styles['max-height']
      }
      if (styles['max-width'] === 0 || styles['max-width'] === 'NaNpx' || styles['max-width'] === "auto") {
        delete styles['max-width']
      }
      if (styles['min-height'] === 0 || styles['min-height'] === 'NaNpx' || styles['min-height'] === "auto") {
        delete styles['min-height']
      }
      if (styles['min-width'] === 0 || styles['min-width'] === 'NaNpx' || styles['min-width'] === "auto") {
        delete styles['min-width']
      }
      if (styles['background-image'] === 'url("")') {
        delete styles['background-image']
      }
      if (styles['position'] != "absolute") {
        if (styles['top'] != 0) {
          styles['margin-top'] = styles['top'];
          delete styles['top']
        }
        if (styles['right'] != 0) {
          styles['margin-right'] = styles['right'];
          delete styles['right']
        }
        if (styles['bottom'] != 0) {
          styles['margin-bottom'] = styles['bottom'];
          delete styles['bottom']
        }
        if (styles['left'] != 0) {
          styles['margin-left'] = styles['left'];
          delete styles['left']
        }
      }
      return styles
    },

    /** 跳转宽高 */
    transFormBoxAnimation(styles) {
      Object.keys(styles).forEach((item, index) => {
        if (styles[item] == "" || styles[item] == undefined) {
          delete styles[item]
        }
        if (styles[item] && typeof styles[item] === "string" && (styles[item].indexOf("px") > -1)) {
          // 轮廓属性(Outline)
          if (["outline", "outline-color", "outline-offset", "outline-style"].includes(item)) {

          }
          // 视觉格式属性 
          if (["display", "position", "top", "right", "bottom", "left", "float", "clear", "z-index", "overflow", "overflow-x", "overflow-y", "resize", "clip", "visibility", "cursor", "box-shadow", "box-sizing"].includes(item)) {

          }
          // 过渡属性(Transition)
          if (["transition", "transition-delay", "transition-duration", "transition-property", "transition-timing-function"].includes(item)) {

          }
          // 转换属性(Transform)
          if (["backface-visibility", "perspective", "perspective-origin", "transform", "transform-origin", "transform-style"].includes(item)) {

          }
          // 文字属性(Text)
          if (["backface-visibility", "perspective", "perspective-origin", "transform", "transform-origin", "transform-style"].includes(item)) {

          }
        }
      })
      return styles
    },

    transFormBoxBorder(styles) {
      Object.keys(styles).forEach((item, index) => {
        if (["border", "border-left", "border-top", "border-right", "border-bottom",].includes(item)) {
          styles[item] = styles[item].replace(new RegExp('px', "gm"), 'rpx');
        }
      })
      return styles
    },

    transFormBoxPadding(styles) {
      Object.keys(styles).forEach((item, index) => {
        if (["padding", "padding-left", "padding-top", "padding-right", "padding-bottom"].includes(item)) {
          styles[item] = styles[item].replace(new RegExp('px', "gm"), 'rpx');
        }
      })
      return styles
    },

    transFormBoxMargin(styles) {
      Object.keys(styles).forEach((item, index) => {
        if (["margin", "margin-left", "margin-top", "margin-right", "margin-bottom"].includes(item)) {
          // console.log('边距处理前', styles[item])
          styles[item] = styles[item].replace(new RegExp('px', "gm"), 'rpx');
          // console.log('边距处理后', styles[item])
        }
      })
      return styles
    },

    transFormDomRpx(styles) {
      let result = ''
      Object.keys(styles).forEach((item, index) => {
        if (styles[item] && typeof styles[item] === "string" && (styles[item].indexOf("px") > -1)) {
          if (!["border", "border-left", "border-top", "border-right", "border-bottom", "padding", "padding-left", "padding-top", "padding-right", "padding-bottom", "margin", "margin-left", "margin-top", "margin-right", "margin-bottom"].includes(item)) {
            styles[item] = styles[item].replace(new RegExp('px', "gm"), 'rpx');
            let currKey = styles[item].split('rpx');
            let currKeyLength = currKey.length;

            if (currKey[currKey.length - 1] == "") {
              currKey.length = currKeyLength - 1
            }
            if (currKey.length >= 5) {
              currKey.length = 4
            }

            let newCurrKey = []
            if (currKey && currKey.length) {
              currKey.forEach((nodeitem, index) => {
                if (typeof (nodeitem * 1) == "number") {
                  if (nodeitem.charAt(0) == " ") {
                    newCurrKey[index] = ' ' + this.pxTorpx(nodeitem * 1);
                  } else {
                    newCurrKey[index] = this.pxTorpx(nodeitem * 1) + ''
                  }
                }
              })
            }
            currKey = newCurrKey;

            let currKeyArr = '';
            currKey.forEach((item, index) => {
              currKeyArr += item + 'rpx'
            })
            currKey = currKeyArr;
            styles[item] = currKey;

          }
        }
        result += `${item}:${styles[item]};`
      })
      return result
    },

    /** 处理dom的styles格式 */
    filterSceneBoxStyles(styles, log = false, currTagElement) {
      // console.log('首页接口请求乐高接口 0', styles)
      if (!styles) return {};
      if (typeof styles === "string") return styles;
      // console.log('传递归来的style需要处理', styles)
      styles = this.transFormBoxwh(styles)
      styles = this.transFormBoxAnimation(styles)
      styles = this.transFormBoxBorder(styles)
      styles = this.transFormBoxPadding(styles)
      styles = this.transFormBoxMargin(styles)
      return this.transFormDomRpx(styles)
    },


  }
})

