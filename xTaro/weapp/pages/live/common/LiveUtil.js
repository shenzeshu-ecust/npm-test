/*
 * @Author: sun_ping
 * @Date: 2023-04-14 08:11:48
 * @LastEditors: sun_ping
 * @LastEditTime: 2023-05-19 09:58:59
 * @Description: 
 */
import {
  cwx,
  __global
} from '../../../cwx/cwx.js';
import common from './common'
var LiveUtil = {
  isDebugEnv() {
    return __global.env !== 'prd';
  },
  sendUbtTrace(key = '', data = {}) {
    const pages = getCurrentPages();
    let currentPage = pages?.find(page=>page.route.includes('pages/live/webcast/home'));
    if (!currentPage) {
      return;
    }
    let liveID = currentPage.liveID + '';
    let liveStatusText = currentPage.liveStatusText;
    let master = currentPage.data.master || {};
    let liveInfo = currentPage.data.liveInfo || {};
    let innersource = currentPage.innersource;
    let source = currentPage.source;
    let logExt = currentPage.logExt;
    let params = {
      liveID: liveID,
      liveState: liveStatusText,
      source: source + '',
      innersource: innersource + '',
      poiid: master?.poiID,
      districtid: master?.districtID,
      liveType: liveInfo?.isPrivate ? '1' : '0',
      recomStrategy: '', //保留字段
      ext: '',
      replayType: '', //小程序回放是内嵌H5
      note: '',
    }
    if (logExt && logExt.length > 0) {
      params = Object.assign({}, params, JSON.parse(logExt) || {});
    }
    if (LiveUtil.isDebugEnv()) {
      console.log('%c[live accounts ubtTrace]', 'color: forestgreen;font-weight: bold', params);
    }
    cwx.sendUbtByPage.ubtTrace(key, Object.assign(params, data));

  },
  jumpToProductItem(url, methods = 'navigateTo') {
    if (url.startsWith('https')) {
      let param = {
        url: encodeURIComponent(url),
        needLogin: false,
        isNavigate: true,
      }
      common.jumpToWebview(param, methods)
    } else {
      cwx[methods]({
        url: url,
        fail(error) {
          if (error) {
            cwx.switchTab({
              url: url
            })
          }
        }
      })
    }
  },
  jumpToBagInfo(e,bagResult,lotteryResult) {
    // const currentPage = cwx.getCurrentPage();
    let type = e.currentTarget.dataset.type || '';
    let url = '';
    // let bagResult = currentPage.data.bagResult;
    // let lotteryResult = currentPage.data.lotteryResult;
    if (type == 'prize') {
      //url = '/pages/market/myprize/myprize';
      url = 'https://contents.ctrip.com/huodong/myprize/index?popup=close';
      if (__global.env.toLowerCase() === 'uat') {
        url = 'https://contents.ctrip.market.uat.qa.nt.ctripcorp.com/huodong/myprize/index?popup=close'
      } else if (__global.env.toLowerCase() === 'fat') {
        url = 'https://contents.ctrip.fat411.qa.nt.ctripcorp.com/huodong/myprize/index?popup=close';
      }
      LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_myprize_click')
    } else if (type == 'rule') {
      url = bagResult.lotteryRuleURL || 'https://contents.ctrip.com/activitysetupapp/mkt/index/lotteryregulations';
    } else if (type == 'couponrule') {
      url = lotteryResult.result && lotteryResult.result.lotteryRuleURL || 'https://contents.ctrip.com/activitysetupapp/mkt/index/lotteryregulations'
      LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_lotteryrule_click')
    }
    common.jumpToDetail(url);
  }



};
export default LiveUtil;