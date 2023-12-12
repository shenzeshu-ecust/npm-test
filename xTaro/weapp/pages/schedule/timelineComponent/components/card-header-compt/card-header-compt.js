Component({
  /**
   * 组件的属性列表
   */
  properties: {
    iconUrl: {
      type: String
    },
    title: {
      type: String
    },
    subTitle: {
      type: String
    },
    carrierContent: {
      type: String
    },
    cardOperationData: {
      type: Object,
      value: "",
    },
    sharedCard: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    iconUrl: "",
    title: "",
    subTitle:"",
    carrierContent: "",
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})