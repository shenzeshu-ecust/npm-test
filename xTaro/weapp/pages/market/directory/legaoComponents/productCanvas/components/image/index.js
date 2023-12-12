const behavior = require('./../../utils/behavior')
Component({
  behaviors: [behavior],
  externalClasses: [],
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
  },

  lifetimes: {
    attached() {
      const { data } = this.properties;
      const customType = data.props.values.name;
      if (data.props && customType) {
        this.setData({
          customNode: customType
        })
      }
    }
  },

})
