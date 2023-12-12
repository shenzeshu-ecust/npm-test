import {
  cwx,
  __global,
  _
} from "../../../../../cwx/cwx";
const model = {
  getMemberInfo: (params) => fetch('/restapi/soa2/22559/getMemberInfo', params) , // 用户头像昵称
}

const fetch = (urlName, params = {}) => {
  return new Promise((resolve, reject) => {
    cwx.request({
      url: urlName,
      method: 'POST',
      data: params,
      success: function (res) {
        if (res && res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack == "Success") {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: function (res) {
        reject(res);
      }
    });
  })
}

export {
  model
};