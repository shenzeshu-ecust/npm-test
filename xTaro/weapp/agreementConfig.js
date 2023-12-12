
const h5Container = "/cwx/component/cwebview/cwebview";
const agreementConfig = {
    accountsAgreement: { // 登录页底部和弹窗的协议
        text: "服务协议",
        h5Url: 'https://m.ctrip.com/webapp/abouth5/common/agreement?type=1&back=true'
    },
    accountsPolicy: { // 登录页底部和弹窗的协议
        text: "个人信息保护指引",
        h5Url: 'https://contents.ctrip.com/activitysetupapp/mkt/index/infopectionguide_new'
    },
    msgPrivacyPolicy: { // 我携 => 设置 
        text: "个人信息保护政策",
        h5Url: "https://contents.ctrip.com/huodong/privacypolicyh5/index?type=2"
    }
}
function getAgreementPath(type) {
    let dataVal = {
        url: encodeURIComponent(agreementConfig[type].h5Url),
        needLogin: false
    }
    return `${h5Container}?data=${JSON.stringify(dataVal)}`;
}

// 个保指引弹窗的文案和链接，需修改 perInfoProtectGuide 及 perInfoProtectFloat 的 data 
const perInfoProtectGuidePath = "/cwx/component/perInfoProtectGuide/index"; // 个保指引页面路径

const resolvePrivacyAuth = false; // 使用【隐私信息授权】解决方案

export {
  agreementConfig,
  getAgreementPath,
  perInfoProtectGuidePath,
  resolvePrivacyAuth
}