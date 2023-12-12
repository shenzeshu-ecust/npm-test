import { cwx, _ } from '../../../../cwx/cwx';
import { fetch, toLoginPage } from '../../common/utils';

const serviceCode = '18083'
const api = {
  getActivityConfig: (params) => fetch(serviceCode, 'getActivityConfig', params), // offline的配置
  openHomePage: (params) => fetch(serviceCode, 'openHomePage', params), // 各种状态
  startAssist: (params) => fetch(serviceCode, 'startAssist', params), // 开始助力
  getUserInfo: (params) => fetch(serviceCode, 'getWechatInfo', params), // 更新用户信息
  updateUserInfo: (params) => fetch(serviceCode, 'saveUserInfo', params), // 更新用户信息
  getAwardInfo: (params) => fetch(serviceCode, 'getAwardInfo', params), // 获取奖品详情
  getActivityConf: (params) => fetch(serviceCode, 'getActivityConf', params),
  canReceiveAward: (params) => fetch(serviceCode, 'canReceiveAward', params), // 客态下,是否可领取奖励
  provideCoupons: (params) => fetch(serviceCode, 'provideCoupons', params), // 客态下,领取奖励
  usedDeductList: (params) => fetch(serviceCode, 'usedDeductList', params), // 弹幕
  receiveCoupon: (params) => fetch(serviceCode, 'receiveCoupon', params), // 领取奖励
  subscribeTemplate: (params) => fetch('18624', 'subscribeTemplate', params), // 订阅
  getRollInfo: (params) => fetch(serviceCode, 'getRollInfo', params), //弹幕
  getElderAuthInfo: (params) => fetch('13350', 'getElderAuthInfo', params), // 老年人认证
  getWeComAssistResult: (params) => fetch('18083', 'getWeComAssistResult', params), // 查询企微助力结果
}

function loginByPhone(e) {
  return new Promise((resolve, reject) => {
    toLoginPage((res)=>{
      resolve({resCode: res.ReturnCode, resMsg: '登录成功'})
    },(res)=>{
      resolve({resCode: res.ReturnCode, resMsg: '登录失败'})
    })
    // cwx.user.wechatPhoneLogin(e, '', 'pages/market/directory/assistNew/index', (resCode, funtionName, resMsg) => {
    //   resolve({resCode, resMsg})
    // });
  })
}

module.exports = {
  loginByPhone,
  api
};