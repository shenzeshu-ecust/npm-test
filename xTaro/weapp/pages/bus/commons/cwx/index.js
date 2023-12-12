const cwxModule = require('../../../../cwx/cwx.js');

const {
    agreementConfig,
    getAgreementPath,
} = require('../../../../agreementConfig');
global.appStartTime = global.appStartTime || new Date().getTime();

const globalCwx = global.cwx || {};
const cwx = globalCwx.cwx || cwxModule.cwx;
const CPage = globalCwx.CPage || cwxModule.CPage;
const __global = globalCwx.__global || cwxModule.__global;
const _ = globalCwx._ || cwxModule._;
global.globalData = global.globalData || {};

cwx.config.init();
export default cwx;
export { CPage, cwx, __global, agreementConfig, getAgreementPath, _ };
