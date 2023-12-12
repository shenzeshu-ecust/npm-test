import {
  cwx,
  CPage,
  __global,
  _
} from "../../../../cwx/cwx.js";
const UTILS_H5 = require('./../taskInvitePlus/utils.js');

CPage({
  pageId: '10650079980',
  checkPerformance: true,
  isForceShowAuthorization: true,
  data: {
    isForceShowAuthorization: true,
    updateType: "refresh",
    env: __global.env || "PROD",
    incrementalUpdateProduct: {},
    filteredGoodsList: [],
    activityId: "MKT_zeroConfig_1699496909970",

  },
  async onLoad() {
    this.checkCommonUtils()
  },
  checkCommonUtils() {
    console.log('当前环境', UTILS_H5.default.isH5("https://www.ctrip.com"))

  
  }
})