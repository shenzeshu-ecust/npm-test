const UTILS = require('../../../common/utils')

const model = {
  queryStatus: (params) => UTILS.fetch('13458', 'queryStatus', params),
  join: (params) => UTILS.fetch('13458', 'join', params),
  queryPrizeInfo: (params) => UTILS.fetch('13458', 'queryPrizeInfo', params),
  generateSign: (params) => UTILS.fetch('13458', 'generateSign', params),
  loadLegaoTemplate: (params) => UTILS.fetch('13458', 'loadTemplate', params),
}

export default model