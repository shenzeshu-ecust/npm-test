Component({
  properties: {
    // 这里是外部传入的数据
    /**
     * 可选，自定义服务端数据接口
     */
    url: {
      type: String,
    },
    /**
     * 必传，场景id
     */
    source: {
      type: String,
    },
    // 必传，appid
    appId: {
      type: String,
    },
    // "0(行前)/1(行中)"
    tripStatus: {
      type: String
    },
    /**
     * 手选城市信息
     * @param {string} type 统一地址类型,使用IGGI统一规范,1(国家)|2(省)|3(城市)|4(区县)5|(景区)|6(商圈,攻略系)|7(乡镇)|9(大洲下辖地区)|10000(大洲)
     * @param {string} id 统一地址id
     * @param {string} name 地址名称，如：'上海'，'北京'
     * @param {string} geoType "base"(酒店系)，"gs_district"(攻略系)
     */
    globalInfo: {
      type: Object
    },
    /**
     * 酒店价格查询
     * @param {string} checkIn 入住日期
     * @param {string} checkOut 离开日期
     */
    hotelInfo: {
      type: Object
    },
    // 是否跳过定位，传true时将跳过定位 发送给服务端的定位信息为空
    ignoreLocation: {
      type: Boolean
    },
    // extra为json_string，并通过ext.extra透传给服务端。
    extra: {
      type: String
    },
    // 自定义组件最外层类名
    className: {
      type: String
    },
    // 自定义组件最外层style样式
    cStyle: {
      type: String
    },
    // 点击卡片时的回调，需自行处理跳转, 回传整个卡片信息
    callback: {
      type: Function
    }
  },
  data: {
    // 这里是组件内部使用的数据
    waterfallLeftList: new Array(3),
    waterfallRightList: new Array(3),
  },
  methods: {
    getListMore: function () {}
  }
})
