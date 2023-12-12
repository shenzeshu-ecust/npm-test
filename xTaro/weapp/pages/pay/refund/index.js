/*
 * @Chinese description: enter your description
 * @English description: enter your description
 * @Autor: chen.yun
 * @Date: 2022-04-25 18:06:22
 * @LastEditors: chen.yun
 * @LastEditTime: 2022-06-15 11:00:39
 */
import { cwx, CPage, _ } from "../../../cwx/cwx.js";
var Business = require("../../thirdPlugin/pay/common/business.js");
var Util = require("../../thirdPlugin/paynew/common/util.js");
var RefundCtrl = require("./ctrl.js");

CPage({
  pageId: "10650039318",
    checkPerformance: true, // 白屏检测
    data: {
    hasMore: false,
    refundInfos: [],
    netLoaded: false,
  },
  onLoad: function (options) {
    const that = this;
    //rdata diff navigate data name
    let refundData = options.data || options; //navigate data
    if (!!refundData.subRefundNos) {
      const refund = options.data || options;
      const cusparams = encodeURIComponent(JSON.stringify(refund));
      const accountInfo = wx.getAccountInfoSync();
      var env = accountInfo.miniProgram.envVersion || __wxConfig.envVersion;
      //console.log('http://localhost:8080/webapp/payment6/refund?&cusparams='+cusparams)
      var refundUrl =
        env === "develop"
          ? "https://secure.fat5069.qa.nt.ctripcorp.com/webapp/payment6/refund?cusparams=" +
            cusparams
          : "https://gateway.secure.ctrip.com/webapp/payment6/refund?cusparams=" +
            cusparams;
        cwx.component.cwebview({
              data: {
                url: encodeURIComponent(refundUrl),
                needLogin:true,  
                pageTitle:{
                  title:"退款详情",               //页面加载时显示的loading，但是页面加载完成之后会被H5页面中的title覆盖
              }       
              }
          });
    } else {
      if (!refundData) {
        refundData = options.rdata; //direct rdata
        that.directRefund = true;
      } else {
        refundData = refundData.rdata;
      }
      Business.sendUbt({
        a: "refund-onload-data",
        c: 100002,
        d: "refund:options.data",
        dd: "支付退款页面进入onLoad",
      });

      RefundCtrl.init(refundData, function (refundInfos) {
        const REFUNDLEN = refundInfos.length;
        if (REFUNDLEN > 0) {
          let hasMore = false;
          if (REFUNDLEN > 1) {
            hasMore = true;
          }
          const REFUND_NEW = refundInfos.reduce(function (pre, item) {
            if (item.currency == "CNY") {
              item.currency = "￥";
            }

            //amount fixed
            const AMOUNTARR = Util.transNumToFixedArray(item.amount);
            item.amount = AMOUNTARR[0] + "." + AMOUNTARR[1];

            const PROCESS_INFO = item.processInfo;
            const PROCESS_ARR = PROCESS_INFO.reduce(function (
              processInfo,
              pitem
            ) {
              if (pitem.procdesc) {
                pitem.desc = pitem.procdesc;
              } else {
                const PROTIME = new Date(pitem.protime);
                pitem.desc = Util.dateFormat("mm月dd日 HH:MM", PROTIME);
              }
              processInfo.push(pitem);
              return processInfo;
            },
            []);

            item.processInfo = PROCESS_ARR;

            pre.push(item);
            return pre;
          }, []);

          that.setData({
            netLoaded: true,
            hasMore: hasMore,
            refundInfos: REFUND_NEW,
          });
        } else {
          that.setData({
            netLoaded: true,
          });
        }
      });
    }
  },
  onShow: function (res) {},
});
