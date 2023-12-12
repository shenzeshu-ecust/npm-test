import { cwx, _, __global } from '../../../../cwx/cwx';
import { fetch } from '../../common/utils';

const api = {
  queryFormSceneComponent: (params) => legaoFetch('queryFormSceneComponent', params), // legao的配置
  queryFormSceneInfo: (params) => legaoFetch('queryFormSceneInfo', params), // legao字段配置
  getTaskList: (params) => fetch('22598', 'userTaskList', params), // 获取任务列表
  taskAssistant: (params) => fetch('22598', 'taskAssistant', params), // 邀请任务用户绑定接口
  inviteInfo: (params) => fetch('22598', 'InviteInfo', params),
}

function loginByPhone(e) {
  return new Promise((resolve, reject) => {
    cwx.user.wechatPhoneLogin(e, '', 'pages/market/directory/assistNew/index', (resCode, funtionName, resMsg) => {
      resolve({resCode, resMsg})
    });
  })
}

const getUrlByEnv = () => {
  return "https://m.ctrip.com/restapi/mkt/"
  let url = "";
  if (__global.env == "fat") {
  url = "https://gateway.m.fws.qa.nt.ctripcorp.com/restapi/mkt/";
  } else if (__global.env === "uat") {
  url = "https://gateway.m.uat.qa.nt.ctripcorp.com/restapi/mkt/";
  } else {
  url = "https://m.ctrip.com/restapi/mkt/"
  }
  return url;
};

function legaoFetch(url, params){
  return new Promise((resolve, reject) => {
    url = getUrlByEnv() + 'newlightweight/' + url
    wx.request({
      url,
      data: params,
      success: (res) => {
        if (res && res.data && res.data.ResponseStatus && (res.data.ResponseStatus.Ack == "Success"||res.data.ResponseStatus.ack == "Success")) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: (err) => {
        reject(JSON.stringify(err));
      }
    })
  })
}

module.exports = {
  loginByPhone,
  api
};