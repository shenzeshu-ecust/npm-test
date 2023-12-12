/*
 * @Author: jhyi jhyi@trip.com
 * @Date: 2023-07-03 17:10:43
 * @LastEditors: jhyi jhyi@trip.com
 * @LastEditTime: 2023-07-03 17:30:15
 * @FilePath: /bus/orderdetail/orderdetail.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { CPage, __global, URLUtil, cwx, BusRouter } from '../common/index.js';

const MyWebView = require('../utils/webview').default;

const IndexWebView = {
  type: 'bus_order_detail',

  buildLink(options) {
    let fromPage = options.fromPage || '';
    let oid = options.oid || '';
    console.log('options', JSON.stringify(options));
    let params = {
      oid,
      showCoupon: 1,
      bShow: true,
      miniProgramPath: encodeURIComponent(
        BusRouter.map('orderdetail', {
          oid,
          fromPage,
        })
      ),
      fromPage: `${fromPage}&`,
    };
    let _url =
      __global.env === 'uat'
        ? 'https://m.uat.qa.nt.ctripcorp.com'
        : 'https://m.ctrip.com';
    let url = URLUtil.serializeURL(
      `${_url}/webapp/bus/offlineOrder?t=1&appId=${__global.appId}`,
      params
    );
    if (cwx.mkt.getUnion()) {
      let union = cwx.mkt.getUnion();
      if (union.allianceid) {
        url = url + '&allianceid=' + union.allianceid;
      }
      if (union.sid) {
        url = url + '&sid=' + union.sid;
      }
      if (union.sourceid) {
        url = url + '&sourceid=' + union.sourceid;
      }
      if (union.ouid) {
        url = url + '&ouid=' + union.ouid;
      }
    }
    return {
      ...options,
      doRefreshWhileBack: true,
      url: encodeURIComponent(url),
    };
  },
};
Object.setPrototypeOf(IndexWebView, MyWebView);
IndexWebView.register();
