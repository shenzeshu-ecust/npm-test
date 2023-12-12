import { cwx, __global } from '../../../cwx/cwx.js';
const ISLOCAL = false; //是否测试本地页面

function newUrlPrefix() {
  let prefix;
  if (__global.env.toLowerCase() === 'uat') {
    if (ISLOCAL) {
      prefix = 'http://a.uat.qa.nt.ctripcorp.com/webapp/you/tripshoot/paipai/';
    } else {
      prefix = 'https://m.uat.qa.nt.ctripcorp.com/webapp/you/tripshoot/paipai/';
    }
  } else if (__global.env.toLowerCase() === 'fat') {
    prefix =
      'https://m.ctrip.fat325.qa.nt.ctripcorp.com/webapp/you/tripshoot/paipai/';
  } else {
    prefix = 'https://m.ctrip.com/webapp/you/tripshoot/paipai/'; //生产
  }
  return prefix;
}

module.exports = {
  newUrlPrefix,
};
