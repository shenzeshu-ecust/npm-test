"use strict";require("../../taroCommon"),(wx["tripTaroGlobal30"]=wx["tripTaroGlobal30"]||[]).push([[847],{69375:function(e,t,a){var n=a(32180),i=a(74498),s=a(60328),r=a(91425),c=a(90129),l=a(90201),o=a(71515),u=a(5437),d=a(18228),f=a(29557),m=a(53096),h=a(84295),x=a(29085),g=a(65325),p=a(17321),v=a(72713),w=a(67107),y=a(45023),z=a(1098),N=a(22276),j=a(97659),D=a(298),X=a(79301),C=a(95308),V=a(92954),_=a.n(V),Y=(a(32180)["document"],_().getEnv());function Z(e){var t;switch(Y){case _().ENV_TYPE.WEB:var a,n=null===(a=e.touches)||void 0===a?void 0:a[0];if(!n)return{pageX:0,pageY:0,clientX:0,clientY:0,offsetX:0,offsetY:0,x:0,y:0};t={pageX:n.pageX,pageY:n.pageY,clientX:n.clientX,clientY:n.clientY,offsetX:n.offsetX,offsetY:n.offsetY,x:n.x,y:n.y};break;case _().ENV_TYPE.WEAPP:t={pageX:e.touches[0].pageX,pageY:e.touches[0].pageY,clientX:e.touches[0].clientX,clientY:e.touches[0].clientY,offsetX:e.target.offsetLeft,offsetY:e.target.offsetTop,x:e.target.x,y:e.target.y};break;case _().ENV_TYPE.ALIPAY:t={pageX:e.target.pageX,pageY:e.target.pageY,clientX:e.target.clientX,clientY:e.target.clientY,offsetX:e.target.offsetLeft,offsetY:e.target.offsetTop,x:e.target.x,y:e.target.y};break;case _().ENV_TYPE.SWAN:t={pageX:e.changedTouches[0].pageX,pageY:e.changedTouches[0].pageY,clientX:e.target.clientX,clientY:e.target.clientY,offsetX:e.target.offsetLeft,offsetY:e.target.offsetTop,x:e.detail.x,y:e.detail.y};break;default:t={pageX:0,pageY:0,clientX:0,clientY:0,offsetX:0,offsetY:0,x:0,y:0},console.warn("getEventDetail\u6682\u672a\u652f\u6301\u8be5\u73af\u5883");break}return t}function T(e,t){var a=(0,D.Z)((0,D.Z)({},e),t);return a}var b={range:"index-module_gXJpK",container:"index-module_T5xXZ",rail:"index-module_XqO7Q",track:"index-module_lzFef",slider:"index-module_PUbtF",disabled:"index-module_jTO7c",sliderText:"index-module_stlDt"},F=a(2269),k=function(e){var t=e.className,a=e.customStyle,n=e.sliderStyle,i=e.railStyle,s=e.trackStyle,u=e.blockSize,d=e.disabled,f=e.onChange,m=e.onAfterChange,h=e.min,x=void 0===h?0:h,g=e.max,p=void 0===g?100:g,v=p-x,w=(0,l.useState)(0),N=(0,c.Z)(w,2),j=N[0],V=N[1],_=(0,l.useState)(0),Y=(0,c.Z)(_,2),k=Y[0],S=Y[1],P=(0,l.useState)("aX"),M=(0,c.Z)(P,2),E=M[0],B=M[1],I=(0,l.useState)(0),O=(0,c.Z)(I,2),R=O[0],W=O[1],A=(0,l.useState)(0),q=(0,c.Z)(A,2),L=q[0],G=q[1],U=(0,l.useState)(""),K=(0,c.Z)(U,2),H=K[0],Q=K[1],J=function(e){if(E&&!d){var t=0,a=Z(e);t=a.clientX-k,te(E,t)}},$=function(e,t){if(!d){t.stopPropagation();var a=t.touches[0].clientX;te(e,a-k)}},ee=function(e){d||(Q(""),B(e),ne("onAfterChange"))},te=function(e,t){j||ie();var a=Math.min(Math.max(t,0),j),n=Math.floor(a/j*100);Number.isNaN(n)||("aX"===e?(W(n),"aX"!==H&&Q("aX"),ne("onChange",n,L)):"bX"===e&&(G(n),"bX"!==H&&Q("bX"),ne("onChange",R,n)))},ae=(0,l.useCallback)((function(e){var t=Math.round((e[0]-x)/v*100),a=Math.round((e[1]-x)/v*100);W(t),G(a)}),[v,x]),ne=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:R,a=arguments.length>2&&void 0!==arguments[2]?arguments[2]:L,n=Math.round(t/100*v)+x,i=Math.round(a/100*v)+x,s=[n,i].sort((function(e,t){return e-t}));"onChange"===e?f&&f(s):"onAfterChange"===e&&m&&m(s)},ie=function(){var e=(0,C.Z)((0,X.Z)().mark((function e(){var t;return(0,X.Z)().wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.next=2,(0,z.Mc)("#range-container",{rect:!0,size:!0,retry:3});case 2:if(t=e.sent,t){e.next=5;break}return e.abrupt("return");case 5:V(Math.round(t.width)),S(Math.round(t.left));case 7:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}();(0,l.useEffect)((function(){ie(),ae(e.value)}),[]);var se={width:u?"".concat(u,"PX"):"",height:u?"".concat(u,"PX"):"",marginLeft:u?"".concat(-u/2,"PX"):""},re=(0,D.Z)((0,D.Z)({},se),{},{left:"".concat(R,"%")}),ce=(0,D.Z)((0,D.Z)({},se),{},{left:"".concat(L,"%")}),le={height:u?"".concat(u,"PX"):""},oe=Math.min(R,L),ue=Math.abs(R-L),de={left:"".concat(oe,"%"),width:"".concat(ue,"%")},fe=(0,r.classnames)(b.range,(0,y.Z)({},b.disabled,d),t),me=Math.round(R/100*v)+x+"\u5929",he=Math.round(L/100*v)+x+"\u5929";return(0,F.jsx)(o.View,{className:fe,style:a,onClick:(0,r.trackFn)("handleClick--5c857",J),children:(0,F.jsxs)(o.View,{id:"range-container",className:b.container,style:le,children:[(0,F.jsx)(o.View,{className:b.rail,style:i}),(0,F.jsx)(o.View,{className:b.track,style:T(de,s)}),(0,F.jsx)(o.View,{className:b.slider,style:T(re,n),onTouchMove:function(e){return $("aX",e)},onTouchEnd:function(){return ee("aX")},children:"aX"===H&&(0,F.jsx)(o.View,{className:b.sliderText,children:me})}),(0,F.jsx)(o.View,{className:b.slider,style:T(ce,n),onTouchMove:function(e){return $("bX",e)},onTouchEnd:function(){return ee("bX")},children:"bX"===H&&(0,F.jsx)(o.View,{className:b.sliderText,children:he})})]})})},S=k,P=a(51070),M={fuzzyDate:"FuzzyDate-module_bi15Y",title:"FuzzyDate-module_H0lck",main:"FuzzyDate-module_a62z6",sub:"FuzzyDate-module_FdO3R",dates:"FuzzyDate-module_Sn2rT",dateItem:"FuzzyDate-module_e1WVq",weekItem:"FuzzyDate-module_mO2Wg",active:"FuzzyDate-module_RgONI",empty:"FuzzyDate-module_QngGF",angle:"FuzzyDate-module_YcfZ4",days:"FuzzyDate-module_mGyK4",right:"FuzzyDate-module_W13bX",icon:"FuzzyDate-module_BKCEa",switch:"FuzzyDate-module_XZg2Y",range:"FuzzyDate-module_DocVs",activeText:"FuzzyDate-module_WMtWf",confirmBtnWrap:"FuzzyDate-module_NxYT0",confirmBtn:"FuzzyDate-module_tS6xX"};function E(e,t,a){e&&(t.includes(e)?a(t.filter((function(t){return t!==e}))):a([].concat((0,N.Z)(t),[e])))}var B=[3,13],I=15,O=1;function R(e){var t=e.resolve,a=e.height,n=(0,f.Gm)("FuzzyFestivalConfig",[]),i=(0,w.C)(v.sP),s=i.departDateRange,u=i.weekDays,d=i.stayRange,m=d&&d.min&&d.max,h=(0,l.useState)([].concat((0,N.Z)((0,P.NE)(n)),(0,N.Z)(P.NR))),x=(0,c.Z)(h,2),g=x[0],p=x[1],z=(0,l.useState)((function(){var e,t=null===(e=s[0])||void 0===e?void 0:e.title;return t||P.Ti.title})),D=(0,c.Z)(z,2),X=D[0],C=D[1],V=(0,l.useState)((null===u||void 0===u?void 0:u.map((function(e){return e.title})))||[]),_=(0,c.Z)(V,2),Y=_[0],Z=_[1],T=(0,l.useState)(!!m),b=(0,c.Z)(T,2),k=b[0],R=b[1],W=(0,l.useState)(m?[d.min,d.max]:B),A=(0,c.Z)(W,2),q=A[0],L=A[1];(0,l.useEffect)((function(){p([].concat((0,N.Z)((0,P.NE)(n)),(0,N.Z)(P.NR)))}),[n]);var G=(0,l.useCallback)((function(e){L(e)}),[]),U=function(){var e=g.filter((function(e){return X===e.title})),a=P.Z9.filter((function(e){return Y.includes(e.title)}));t({departDateRange:e,weekDays:a,stayRange:k?{min:q[0],max:q[1]}:void 0,fuzzy:!0})},K=(0,N.Z)(g);while(K.length%4!==0)K.push({});return(0,F.jsxs)(o.View,{className:M.fuzzyDate,children:[(0,F.jsx)(o.View,{className:M.title,children:(0,F.jsx)(o.View,{className:M.main,children:"\u51fa\u53d1\u65f6\u95f4"})}),(0,F.jsx)(o.View,{className:M.dates,children:K.map((function(e,t){return(0,F.jsxs)(o.View,{className:(0,r.classnames)((0,y.Z)((0,y.Z)((0,y.Z)({},M.active,e.title&&X===e.title),M.dateItem,!0),M.empty,!e.title)),onClick:(0,r.trackFn)(t+"--65311",(function(){return C(e.title)})),children:[e.iconUrl&&(0,F.jsx)(j.Z,{className:M.icon,src:e.iconUrl}),(0,F.jsx)(o.View,{className:M.dateTitle,children:e.title}),X===e.title&&(0,F.jsx)(j.Z,{className:M.angle,src:"https://pages.c-ctrip.com/flight_h5/tinyapp/home/little-angle.png"})]},t)}))}),(0,F.jsxs)(o.View,{className:M.title,children:[(0,F.jsx)(o.View,{className:M.main,children:"\u5468\u51e0\u51fa\u53d1"}),(0,F.jsx)(o.View,{className:M.sub,children:"\u652f\u6301\u591a\u9009"})]}),(0,F.jsx)(o.View,{className:M.dates,children:P.Z9.map((function(e){return(0,F.jsx)(o.View,{className:(0,r.classnames)((0,y.Z)((0,y.Z)((0,y.Z)({},M.active,Y.includes(e.title)),M.weekItem,!0),M.dateItem,!0)),onClick:(0,r.trackFn)(e.title+"--fe6a5",(function(){return E(e.title,Y,Z)})),children:(0,F.jsx)(o.View,{className:M.dateTitle,children:e.title})},e.title)}))}),(0,F.jsxs)(o.View,{className:M.title,children:[(0,F.jsxs)(o.View,{className:M.main,children:[(0,F.jsx)(o.Text,{children:"\u51fa\u884c"}),k?(0,F.jsxs)(o.Text,{className:M.activeText,children:[" ",q.join("~"),"\u5929"]}):(0,F.jsx)(o.Text,{children:"\u5929\u6570"})]}),(0,F.jsx)(o.View,{className:M.sub+" "+M["switch"],children:(0,F.jsx)(o.Switch,{checked:k,color:"#006FF6",onChange:function(){return R(!k)},className:M["switch"]})})]}),k&&(0,F.jsxs)(o.View,{className:M.range,children:[(0,F.jsx)(S,{value:q,onChange:G,min:O,max:I}),(0,F.jsxs)(o.View,{className:M.days,children:[(0,F.jsxs)(o.View,{className:M.left,children:[O,"\u5929"]}),(0,F.jsxs)(o.View,{className:M.right,children:[I,"\u5929"]})]})]}),"auto"!==a&&(0,F.jsx)(o.View,{className:M.confirmBtnWrap,children:(0,F.jsx)(o.View,{className:M.confirmBtn,onClick:(0,r.trackFn)("confirm--141b6",U),children:"\u786e\u8ba4"})})]})}var W=R,A={titleBox:"FuzzyDateContainer-module_Ft7Y1",item:"FuzzyDateContainer-module_A6iB1",active:"FuzzyDateContainer-module_PbTlk",text:"FuzzyDateContainer-module_Jia0d",underline:"FuzzyDateContainer-module_irxiP",second:"FuzzyDateContainer-module_wQteV",slideWrap:"FuzzyDateContainer-module_kOFva",slideBox:"FuzzyDateContainer-module_dbu6S",slideItem:"FuzzyDateContainer-module_XDjAX",tipBox:"FuzzyDateContainer-module_TE_aN",tip:"FuzzyDateContainer-module_hV1bK"},q=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],t={};return e.forEach((function(e){var a=e.departureDate,n=e.lowestOfMonth,i=e.price;t[a]={price:i,lowestOfMonth:n}})),t},L=(0,l.memo)((function(e){var t=e.start,a=e.end,n=e.resolve,i=e.festivalDate,s=e.lowestPriceSearch,u=e.sendSpeed,d=(0,l.useState)({}),f=(0,c.Z)(d,2),m=f[0],h=f[1],x=(0,l.useState)("auto"),g=(0,c.Z)(x,2),v=g[0],N=g[1],j=(0,l.useState)(!0),D=(0,c.Z)(j,2),X=D[0],C=D[1],V=(0,w.C)(p.e_);return(0,l.useEffect)((function(){s(t,a).then((function(e){h(q(e))}))}),[s,t,a]),(0,l.useEffect)((function(){Promise.all([(0,z.Mc)("#slide-box",{size:!0,retry:3}),(0,z.Mc)("#navigation-box",{size:!0,retry:3})]).then((function(e){e[0]&&e[1]&&N("calc(100vh - var(--vh-offset, 0px) - "+Math.floor(e[0].height)+"px - "+Math.floor(e[1].height)+"px)")}))}),[]),(0,F.jsxs)(o.View,{children:[(0,F.jsxs)(o.View,{className:A.titleBox,id:"slide-box",children:[(0,F.jsx)(o.View,{className:(0,r.classnames)(A.item,(0,y.Z)({},A.active,X)),onClick:(0,r.trackFn)("slide-box--onClick--4cdc8",(function(){return C(!0)})),children:(0,F.jsx)(o.View,{className:A.text,children:"\u6a21\u7cca\u65e5\u671f"})}),(0,F.jsx)(o.View,{className:(0,r.classnames)(A.item,(0,y.Z)({},A.active,!X)),onClick:(0,r.trackFn)("slide-box--onClick--1cd6f",(function(){return C(!1)})),children:(0,F.jsx)(o.View,{className:A.text,children:"\u7cbe\u786e\u65e5\u671f"})}),(0,F.jsx)(o.View,{className:(0,r.classnames)(A.underline,(0,y.Z)({},A.second,!X))})]}),(0,F.jsx)(o.View,{className:A.slideWrap,style:{height:v},children:(0,F.jsxs)(o.View,{className:A.slideBox,style:{transform:"translateX(".concat(X?"0":"-100%",")")},children:[(0,F.jsx)(G,{flag:X,children:(0,F.jsx)(o.View,{className:A.slideItem,children:(0,F.jsx)(W,{resolve:n,height:v})})}),(0,F.jsx)(G,{flag:!X,children:(0,F.jsx)(o.View,{className:A.slideItem,children:(0,F.jsx)(r.OneTripDatePicker,{start:t,resolve:n,lowestPrice:m,festivalDate:i,sendSpeed:u,lowestPriceSearch:s,newVersion:!0,tripType:V})})})]})}),!X&&(0,F.jsx)(o.View,{className:A.tipBox,children:(0,F.jsx)(o.View,{className:A.tip,children:"\u6240\u9009\u65e5\u671f\u4e3a\u51fa\u53d1\u5730\u65e5\u671f\uff0c\u663e\u793a\u5355\u6210\u4eba\u4ef7\uff0c\u53d8\u4ef7\u9891\u7e41\u4ee5\u5b9e\u9645\u652f\u4ed8\u4ef7\u4e3a\u51c6"})})]})})),G=l.memo((function(e){var t=e.flag,a=e.children,n=(0,l.useRef)(0);return(0,l.useEffect)((function(){t&&n.current++}),[t]),0===n.current?t?a:null:a})),U=L,K=U,H=function(e){var t=(0,h.zF)(),a=(0,c.Z)(t,1),n=a[0],i=(0,f.aN)(e),s=i.start,y=i.end,z=i.inSpecial,N=i.disableChangeStart,j=i.isHasTax,D=void 0===j?"1":j,X=(0,w.C)(p.Wt),C=(0,w.C)(p.ww),V=(0,w.C)(p.Se),_=(0,w.C)(p.uV),Y=(0,w.C)(p.e_),Z=(0,w.C)(p.W$),T=(0,w.C)(p.kM),b=(0,w.C)(v.Fg),k=(0,w.C)(v.K),S=b.length>1||k.length>1||1===k.length&&k[0].isTheme,P=(0,l.useMemo)((function(){return(0,g.E)(T,!0)}),[T]),M=(0,l.useCallback)((function(e){if(S)return Promise.resolve([]);var t=(0,x.G)({regionType:Z,departureDate:(0,r.dayjs)().format("YYYY-MM-DD"),departureCode:X,arrivalCode:C,PassengerList:P,cabin:"INTERNATIONAL"===Z?_:V,tripType:Y,arrivalDate:(0,r.dayjs)().add(365,"day").format("YYYY-MM-DD"),isHasTax:"1"===D});return"ROUND_TRIP"===Y&&(t["startDate"]=e||"",t["returnDate"]=(0,r.dayjs)(e).add(3,"day").format("YYYY-MM-DD")||""),n(t).then((function(e){return(null===e||void 0===e?void 0:e.data)||[]}))}),[S,Z,X,C,P,_,V,Y,D,n]),E=(0,l.useCallback)((function(t){(0,d.jq)("c_calendar_resolve_date",t),(0,u.Hm)(e.resolve,t)}),[e]),B=(0,f.Gm)("festivalDate",[]);return(0,F.jsxs)(o.View,{className:"LowestDatePickerPage",children:[(0,F.jsx)(m.Z,{reject:e.reject,title:"\u9009\u62e9"+("ROUND_TRIP"===Y?"\u5f80\u8fd4":"\u53bb\u7a0b")+"\u65e5\u671f"}),z?(0,F.jsx)(K,{start:s,end:y,resolve:E,festivalDate:B,lowestPriceSearch:M,sendSpeed:d.jq}):(0,F.jsx)(r.DatePicker,{start:s,end:y,tripType:Y,resolve:E,lowestPriceSearch:M,festivalDate:B,sendSpeed:d.jq,ubtTrace:d.wn,disableChangeStart:!!N})]})},Q=H,J=Q,$=(0,i.Z)({pageId:s.Uz})(J),ee={navigationBarTitleText:"\u643a\u7a0b\u673a\u7968",navigationBarTextStyle:"black",titleBarColor:"#ffffff",navigationStyle:"custom"};Page((0,n.createPageConfig)($,"pages/flight/pages/lowestDatePicker/index",{root:{cn:[]}},ee||{}))},79181:function(e){e.exports=require("../../../../cwx/cpage/initNavigator")},91783:function(e){e.exports=require("../../../../cwx/cpage/ubt_wx")},56884:function(e){e.exports=require("../../../../cwx/cwx")},65238:function(e){e.exports=require("../../../../cwx/ext/global")}},function(e){var t=function(t){return e(e.s=t)};e.O(0,[4499,2107,1216,8592],(function(){return t(69375)}));e.O()}]);
//# sourceMappingURL=index.js.map