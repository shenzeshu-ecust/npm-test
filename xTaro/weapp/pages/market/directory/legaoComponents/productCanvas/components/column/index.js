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
    },
  },

})
