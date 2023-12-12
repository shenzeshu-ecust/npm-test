//@author qiuwf@Ctrip.com
import { cardClickParameter } from '../../utils/actionCode';

//使用须知：
//必须在Component中的 properties里面添加TimelineModelName属性（数据源class），参见car，selfdrive
module.exports = Behavior({
  /**
   * 组件的属性列表
   */
  properties: {
    cardData: {//卡片模型数据
      type: Object,
      value: {},
      observer: function (newVal, oldVal, changedPath) {
        if (newVal) {
          this.dataHandler(newVal);
        }
      }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    processedCard: {}
  },

  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  ready: function () {
    this.dataHandler(this.data.cardData);
  },

  /**
   * 组件的方法列表
   */
  methods: {
    dataHandler: function (originCard) {
      let processedCard = new this.properties.TimelineModelName(originCard);
      this.setData({
        processedCard: processedCard,
        logParameter: cardClickParameter(originCard)
      });
    },
  }
})