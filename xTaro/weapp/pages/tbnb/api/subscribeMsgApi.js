import tjFetch from './tjFetch';
import hostConfig from '../config/ctrip/host';
var MP_TUJIA_HOST = hostConfig.MP_TUJIA_HOST;
var apiConfig = {
  getTemplate: MP_TUJIA_HOST + "/bingo/mp/formInfo/gettemplate",
  addReport: MP_TUJIA_HOST + "/bingo/mp/formInfo/addreport"
};
var api = {
  getTemplate: function (_a) {
    var pageSite = _a.pageSite;
    return tjFetch.post(apiConfig.getTemplate, {
      params: {
        pageSite: pageSite
      }
    });
  },
  addReport: function (_a) {
    var templateIdList = _a.templateIdList;
    return tjFetch.post(apiConfig.addReport, {
      params: {
        templateIdList: templateIdList
      }
    });
  }
};
export default api;