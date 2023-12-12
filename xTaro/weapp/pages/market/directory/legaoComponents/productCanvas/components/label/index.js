const behavior = require('./../../utils/behavior')

Component({
  behaviors: [behavior],
  externalClasses: ["custom_btnMenu"],
  options: {
    multipleSlots: true
  },
  properties: {
    data: {
      type: Object,
      value: false,
    },
  },

  data: {
    customNode: '',
    subData: null,
  },

  lifetimes: {
    attached() {
      let { data } = this.properties;
      let fields = data.props.values;
      if (data.props && data.props.values.name) {
        const customType = data.props.values.name;

        // 评级
        if (customType == "diyField_star") {
          data.props.values.value = Array(data.props.values.value).fill(1)
        }
        // 按钮
        if (customType == "diyField_btnText") {
          if(data.props.values && data.props.values.renderType == "simple") {
            // console.log('按钮传递了什么 this')
            // this.triggerEvent("clickHandlers", {
            //   component: data.props.values,
            //   product: data.props.values.renderData,
            // });
          }
          // console.log('按钮传递了什么 this', this)
        }
        // 推荐状态
        if (customType == "diyField_recommendStatus") {
          // console.log('传递了什么', data.props.values)
        }
        // 按钮
        if (customType == "diyField_btnClick") {
          const stockStatus = {
            0: '已售罄',
            1: '立即抢购',
            2: '已抢光',
            3: '预约秒杀',
          }
          data.props.values.status = 1
          data.props.values.stockStatus = stockStatus
        }
        // 描述文字
        if (customType == "diyField_decorateData") {
          data.props.values.leftCornerText = data.props.values.value.text || data.props.values.value
        }
        // 讲解状态
        if (customType == "diyField_explainStatus") {
          
        }
        // 酒店label
        if (customType == "diyField_holidayLabel") {
          // 检查这个周末不加价 是不是 数组
          const currValue = data.props.values.value;
          if (typeof currValue == 'string') {
            data.props.values.type = "string"
          } else {
            data.props.values.type = "array"
          }
        }
        // BU的类型
        if (customType == "diyField_businessType") {
          const exportTypeName = {
            "HOTEL_STORE": {
              "buSrc": "https://pages.c-ctrip.com/activitysetupapp/nfes_legao/components/recomendationCard/img/%E9%85%92%E5%BA%97icon.png",
              "buName": "酒店"
            },
            "FOOD_VOUCHERS": {
              "buSrc": "https://pages.c-ctrip.com/activitysetupapp/nfes_legao/components/recomendationCard/img/%E7%BE%8E%E9%A3%9Ficon.png",
              "buName": "美食"
            },
            "HOTEL_PACKAGE": {
              "buSrc": "https://pages.c-ctrip.com/activitysetupapp/nfes_legao/components/recomendationCard/img/%E9%85%92%E5%BA%97%E5%A5%97%E9%A4%90icon.png",
              "buName": "酒店套餐"
            },
            "TOUR": {
              "buSrc": "https://pages.c-ctrip.com/activitysetupapp/nfes_legao/components/recomendationCard/img/%E9%97%A8%E7%A5%A8icon.png",
              "buName": "门票"
            }
          }
          data.props.values.typeObj = exportTypeName[data.props.values.value]
        }
        // 是否展示
        if (customType == "diyField_isShowThumbsUp") {
          const isGray = fields['isNoPrice'] || fields['sellout'] || false;
          const grayIcon = 'https://pages.c-ctrip.com/activitysetupapp/nfes_legao/components/AtomProductX/images/gray_dood.png';
          let src = null;
          if (typeof fields["value"] === 'string' && fields["value"].length) {
            src = fields["value"];
          }
          src = src || (isGray ? grayIcon : (fields["iconUrl"] || 'https://images3.c-ctrip.com/amsweb/legaoResource/diy/thumbsUp.png'))
          data.props.values.value = src
        }
        // console.log('label组件的 外部值', localRenderData)
        this.setData({
          customNode: customType,
          subData: { ...data }
        })
      }
    },
  },

  methods: {
    checkImageLoadError(e) {
      console.log('图片加载失败', e)
    },
    checkImageLoad(e){
      console.log('图片加载成功', e)

    }
  }
})
