/**
 * 扫码落地页
 */
 import { cwx, CPage, _ } from "../../../cwx/cwx.js";
 import aggregateCore from "./aggregateCore";
 import userSubscribeObj from "../common/subscribe/subscriptMessage";
 
 CPage(
     Object.assign(
         {
             pageId: "ignore_page_pv",
             pageName: "CoMemberLanding",
             source: "",
             checkPerformance: true,// 白屏标志位
         },
         { ...aggregateCore },
         { ...userSubscribeObj }
     )
 );
 