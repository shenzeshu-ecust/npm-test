import { __global } from '../../../../cwx/cwx.js';

const isPrd = __global.env === 'prd';

export default {
    host: isPrd ? 'm.ctrip.com' : 'm.fat43.qa.nt.ctripcorp.com'
};
