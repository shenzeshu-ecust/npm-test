"use strict";require("../../../taroCommon"),(wx["tripTaroGlobal30"]=wx["tripTaroGlobal30"]||[]).push([[6595],{14477:function(e,s,t){var c=t(32180),i=t(298),n=t(19153),o=t(57042),r=t(24460),a=t(81876),l=t(79038),u=t(59772),d=t(21867),x=t(86066),m=t(45023),h=(t(90201),t(71515)),f=t(33675),p=t.n(f),v=t(55060),N={get feeDetail(){return v.Utils.getSharkValue("feeDetail")},get showFree(){return v.Utils.getSharkValue("showFree")}},g=t(74629),j=t(64341),T=t(96103),w=t(14885),y=t(2269),I=function(e){(0,d.Z)(t,e);var s=(0,x.Z)(t);function t(e){var c;return(0,o.Z)(this,t),c=s.call(this,e),(0,m.Z)((0,a.Z)(c),"options",void 0),(0,m.Z)((0,a.Z)(c),"isLoginPending",!1),c.state={},c.checkPerformance=!0,c}return(0,r.Z)(t,[{key:"getPageId",value:function(){return this.pageId=v.Channel.getPageId().COSTDETAIL.ID,this.pageId}},{key:"componentWillUnmount",value:function(){(0,l.Z)((0,u.Z)(t.prototype),"componentWillUnmount",this).call(this);var e=this.props.backToBooking;T.po.afterNavigateBack((function(s){e(s)})),p().Observer.removeAllObserversForKey("pressFunc")}},{key:"componentDidHide",value:function(){(0,l.Z)((0,u.Z)(t.prototype),"componentDidHide",this).call(this)}},{key:"render",value:function(){var e,s,t,c,i=this,o=this.props,r=o.feeDetailInfos,a=o.curPayModeInfo,l=o.isPriceLoading,u=function(){p().Observer.noti("pressFunc")};return(0,y.jsx)(y.Fragment,{children:(0,y.jsxs)(h.View,{className:"cost-modal",children:[r.chargesInfos&&(0,y.jsx)(h.View,{className:"cost-box",children:r.chargesInfos.map((function(e){var s;return e.code===g.Enums.CAR_RENTAL_FEE?(0,y.jsxs)(h.View,{className:"cost-item car-fee",children:[(0,y.jsxs)(h.View,{className:"cost-head",children:[(0,y.jsx)(h.Text,{className:"cost-title",children:e.title}),(0,y.jsxs)(h.Text,{className:"cost-price",children:[e.currencyCode,e.currentTotalPrice]})]}),null===e||void 0===e||null===(s=e.items)||void 0===s?void 0:s.map((function(e){return(0,y.jsxs)(h.View,{className:"cost-sub-head",children:[(0,y.jsx)(h.Text,{className:"cost-sub-title",children:e.title}),(0,y.jsxs)(h.Text,{className:(0,n.classnames)(e.code!==g.Enums.FEE_CODE?"discount":"","cost-sub-price"),children:[e.code!==g.Enums.FEE_CODE?"-":""," ",e.currencyCode,e.currentTotalPrice]})]})}))]}):(0,y.jsxs)(h.View,{className:"cost-item",children:[(0,y.jsxs)(h.View,{className:"cost-head",children:[(0,y.jsx)(h.Text,{className:"cost-title",children:e.title}),e.code===g.Enums.DIFFERENT_RENTAL_FEE&&e.showFree?(0,y.jsx)(h.Text,{className:"cost-price-free",children:N.showFree}):(0,y.jsxs)(h.Text,{className:"cost-price",children:[e.currencyCode,e.currentTotalPrice]})]}),(0,y.jsx)(h.Text,{className:"cost-price-text",children:e.size}),(null===e||void 0===e?void 0:e.description)&&(0,y.jsx)(h.Text,{className:"cost-text",children:e.description})]})}))}),(!(null===r||void 0===r||null===(e=r.couponInfos)||void 0===e||!e.length)||(null===r||void 0===r?void 0:r.activityInfo))&&(0,y.jsxs)(h.View,{className:"cost-box",children:[(null===r||void 0===r||null===(s=r.couponInfos)||void 0===s?void 0:s.length)&&(0,y.jsxs)(h.View,{className:"cost-item",children:[(0,y.jsxs)(h.View,{className:"cost-head",children:[(0,y.jsx)(h.Text,{className:"cost-title",children:r.couponInfos[0].title}),(0,y.jsxs)(h.Text,{className:"cost-price sale-price",children:["-",r.couponInfos[0].currencyCode,r.couponInfos[0].currentTotalPrice]})]}),(0,y.jsx)(h.Text,{className:"cost-text",children:r.couponInfos[0].subTitle})]}),(null===r||void 0===r?void 0:r.activityInfo)&&(0,y.jsxs)(h.View,{className:"cost-item",children:[(0,y.jsxs)(h.View,{className:"cost-head",children:[(0,y.jsx)(h.Text,{className:"cost-title",children:r.activityInfo.title}),(0,y.jsxs)(h.Text,{className:"cost-price sale-price",children:["-",r.activityInfo.currencyCode,r.activityInfo.currentTotalPrice]})]}),(0,y.jsx)(h.Text,{className:"cost-text",children:r.activityInfo.notices})]})]}),!(null===r||void 0===r||null===(t=r.equipmentInfos)||void 0===t||!t.length)&&(0,y.jsx)(h.View,{className:"cost-box",children:null===r||void 0===r||null===(c=r.equipmentInfos)||void 0===c?void 0:c.map((function(e,s){return(0,y.jsxs)(h.View,{className:(0,n.classnames)("cost-item car-fee",s===r.equipmentInfos.length-1&&"no-border-bt"),children:[(0,y.jsxs)(h.View,{className:"cost-head",children:[(0,y.jsx)(h.Text,{className:"cost-title",children:e.title}),(0,y.jsxs)(h.Text,{className:"cost-price",children:[e.currencyCode,e.currentTotalPrice]})]}),(0,y.jsx)(h.Text,{className:"cost-price-text",children:e.size})]})}))}),(null===r||void 0===r?void 0:r.chargesSummary)&&(0,y.jsx)(h.View,{className:"cost-box cost-total",children:(0,y.jsxs)(h.View,{className:"cost-item",children:[(0,y.jsxs)(h.View,{className:"cost-head",children:[(0,y.jsx)(h.Text,{className:"cost-title",children:r.chargesSummary.title}),(0,y.jsxs)(h.Text,{className:"cost-price",children:[r.chargesSummary.currencyCode,r.chargesSummary.currentTotalPrice]})]}),r.chargesSummary.items.map((function(e){return(0,y.jsx)(h.Text,{className:"cost-text",children:e.title})}))]})}),(0,y.jsx)(w.Z,{isShowCancelEncourage:!1,tipText:a&&a.tips&&a.tips[0],isLoading:l,onBookPress:u}),(0,y.jsx)(h.View,{className:"view-check",onAnimationEnd:function(){return i.viewReadyHandle&&i.viewReadyHandle()}})]})})}}]),t}(j.Z),E=I,b=t(62813),V=t(58419),P=t(6017),k=function(e){return{feeDetailInfos:(0,b.n0)(e),curPayModeInfo:(0,b.EY)(e),isPriceLoading:(0,b.Yc)(e)}},C=function(e){return{backToBooking:function(s){e((0,V.EL)(s)),e((0,V.BG)(!0))}}},Z=(0,n.connect)(k,C)(E),F=(0,P.Z)(Z),D=function(e){return(0,y.jsx)(F,(0,i.Z)({},e))},q=D,S={navigationBarTitleText:"\u8d39\u7528\u660e\u7ec6",navigationBarTextStyle:"black",navigationBarBackgroundColor:"#ffffff"};Page((0,c.createPageConfig)(q,"pages/carNew/isd/subPages/costDetail/index",{root:{cn:[]}},S||{}))},79181:function(e){e.exports=require("../../../../../cwx/cpage/initNavigator")},91783:function(e){e.exports=require("../../../../../cwx/cpage/ubt_wx")},56884:function(e){e.exports=require("../../../../../cwx/cwx")},65238:function(e){e.exports=require("../../../../../cwx/ext/global")},33675:function(e){e.exports=require("../../../../../cwx/cwx")},44353:function(e){e.exports=require("../../../../../cwx/cwx.js")},46346:function(e){e.exports=require("../../../../../cwx/ext/global")}},function(e){var s=function(s){return e(e.s=s)};e.O(0,[7606,2107,1216,8592],(function(){return s(14477)}));e.O()}]);
//# sourceMappingURL=index.js.map