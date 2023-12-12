"use strict";require("../../../taroCommon"),(wx["tripTaroGlobal30"]=wx["tripTaroGlobal30"]||[]).push([[5751],{94416:function(e,r,i){var t=i(32180),n=i(298),a=i(19153),o=i(57042),l=i(24460),d=i(81876),s=i(79038),c=i(59772),u=i(21867),v=i(86066),f=i(45023),_=i(90201),m=i(71515),p=i(92954),g=i.n(p),h=i(33675),C=i.n(h),y=i(64341),x=i(81194),b=i(35418),N=i(90129),Z=i(22548),T=i(58115),k=i(70119),w=i(55060),j=i(74629),I=i(1558),A=w.Utils.getSharkValue,D={get save(){return A("save")},get driverCnName(){return A("driver_cn_name")},get driverCertificateNo(){return A("driver_certificate_no")},get driverContactPhone(){return A("driver_contact_phone")},get driverContactEmail(){return A("driver_contact_phone")},get driverCertificateType(){return A("driver_certificate_type")},get driverCtripName(){return A("driver_ctrip_name")},get driverAddNameTip(){return A("driver_add_name_tip")},get driverAddNameTipRule(){return A("driver_add_name_tip_rule")},get driverEnterFullname(){return A("driver_enter_fullname")},get driverValidateErrorIdName(){return A("driver_validate_error_id_name")},get driverValidateErrorOtherName(){return A("driver_validate_error_other_name")},get driverEnterCertificateType(){return A("driver_enter_certificate_type")},get driverValidateErrorIdno(){return A("driver_validate_error_idno")},get driverValidateErrorMobilephone(){return A("driver_validate_error_mobilephone")},get driverEnterMobile(){return A("driver_enter_mobile")},get driverCertificateCorrectlyTips(){return A("driver_certificate_correctly_tips")},get driverMobileUseFor(){return A("driver_mobile_use_for")},get driver_save_success(){return A("driver_save_success")},get driver_save_fail(){return A("driver_save_fail")},get driver_save_pending(){return A("driver_save_pending")},get driversAdd(){return A("drivers_add")},get driversEdit(){return A("drivers_edit")},get driver_en_lastname(){return A("driver_en_lastname")},get driver_en_firstname(){return A("driver_en_firstname")},get driver_ctrip_lastname_placeholder(){return A("driver_ctrip_en_lastname_placeholder")},get driver_trip_lastname_placeholder(){return A("driver_trip_en_lastname_placeholder")},get driver_ctrip_firstname_placeholder(){return A("driver_ctrip_en_firstname_placeholder")},get driver_trip_firstname_placeholder(){return A("driver_trip_en_firstname_placeholder")},get driver_enter_last_name(){return A("driver_enter_last_name")},get driver_enter_first_name(){return A("driver_enter_first_name")},get driver_validate_error_lastname(){return A("driver_validate_error_lastname")},get driver_validate_error_firstname(){return A("driver_validate_error_firstname")},get drivers_dateOfBirth(){return A("drivers_dateOfBirth")},get driver_enter_birthday(){return A("driver_enter_birthday")},get driver_enter_nationality(){return A("driver_enter_nationality")},get driver_nationality(){return A("driver_nationality")},get driver_noAgree_toast(){return A("driver_noAgree_toast")},get emailError(){return A("emailError")},get driver_go_modify(){return A("driver_go_modify")},get driver_confirm_correct(){return A("driver_confirm_correct")},driversDateOfBirthTooYoung:function(e){return A("drivers_dateOfBirthTooYoung",e)},driversDateOfBirthTooOld:function(e){return A("drivers_dateOfBirthTooOld",e)},driverEnterCertificateNo:function(e){return A("driver_enter_certificate_no",e)},driverCertificateNoLeastPlaceTips:function(e){return A("driver_certificate_no_least_place_tips",e)},driverCertificateNoMaximumPlaceTips:function(e){return A("driver_certificate_no_maximum_place_tips",e)},driver_certificate_placeholder:function(e){return A("driver_certificate_placeholder",e)}},S=i(2269),B=w.Utils.getDate,E="1900-01-01",V=(0,a.dayjs)().format("YYYY-MM-DD"),O=(0,a.dayjs)(new Date(1990,0,1)).format("YYYY-MM-DD"),M=function(e){var r=e.visible,i=e.curBirthDay,t=e.onConfirmBirthDay,n=e.onCancelBirthDay,a=i.split("-"),o=(0,N.Z)(a,3),l=o[0],d=o[1],s=o[2],c=B(E,V,{year:l,month:d}),u=(0,_.useState)(c.year),v=(0,N.Z)(u,2),f=v[0],m=v[1],p=(0,_.useState)(c.month),g=(0,N.Z)(p,2),h=g[0],C=g[1],y=(0,_.useState)(c.day),x=(0,N.Z)(y,2),b=x[0],Z=x[1],T=(0,_.useState)(f.findIndex((function(e){return e===+l}))),k=(0,N.Z)(T,2),w=k[0],j=k[1],A=(0,_.useState)(h.findIndex((function(e){return e===d}))),O=(0,N.Z)(A,2),M=O[0],P=O[1],U=(0,_.useState)(b.findIndex((function(e){return e===s}))),L=(0,N.Z)(U,2),R=L[0],q=L[1],F=(0,_.useCallback)((function(e){var r,i,t=(0,N.Z)(e,3),n=t[0],a=t[1],o=(t[2],String(f[n])),l=String(h[a]),d=B(E,V,{year:o,month:l});return(null===(r=d.month)||void 0===r?void 0:r.length)>0&&(null===(i=d.day)||void 0===i?void 0:i.length)>0&&(C(d.month),Z(d.day)),l}),[E,V,f,h,b]),Y=(0,_.useCallback)((function(e,r,i){t({year:f[e],month:h[r],day:b[i]})}),[f,h,b]);return(0,_.useEffect)((function(){var e=i.split("-"),r=(0,N.Z)(e,3),t=r[0],n=r[1],a=r[2],o=B(E,V,{year:t,month:n});m(o.year),C(o.month),Z(o.day),j(f.findIndex((function(e){return e===+t}))),P(h.findIndex((function(e){return e===n}))),q(b.findIndex((function(e){return e===a})))}),[i]),r?(0,S.jsx)(I.Z,{title:D.drivers_dateOfBirth,visible:r,selected:w,selected2:M,selected3:R,list:f,list2:h,list3:b,notShowSelected:!0,valueChangeCallback:F,confirmCallback:Y,cancelCallback:n}):null},P=M,U=w.Utils.isFull18IdCard,L=w.Utils.isIdCard,R=w.Utils.isMobile,q=w.Utils.nameForIDTypeCheck,F=w.Utils.isCtripOsd,Y=w.Utils.isFirstName,G=w.Utils.isLastName,J=w.Utils.getFullAge,X=w.Utils.isInLimitAgeIdCard,z=j.DriverConstants.CertificateType,H=j.DriverConstants.certificateArray,K=j.DriverConstants.isdCertificateTypeList,Q=j.DriverConstants.certificateTypesArray,$=j.DriverConstants.DriverInputTypes,W={passengerId:"",firstName:"",lastName:"",fullName:"",birthday:"",age:0,nationality:"",nationalityName:"",countryCode:"",nationalityCode:"",mobile:"",email:"",certificateList:[],isCreditQualified:!1},ee=[z.id,z.passport,z.homereturnpermit,z.mtps],re=function(){},ie="86",te=function(e){var r=e.onSave,i=e.tips,t=e.oldAge,o=e.yongAge,l=(0,_.useState)(W),d=(0,N.Z)(l,2),s=d[0],c=d[1],u=(0,_.useState)(""),v=(0,N.Z)(u,2),f=v[0],p=v[1],h=(0,_.useState)(""),y=(0,N.Z)(h,2),w=y[0],j=y[1],I=(0,_.useState)(""),A=(0,N.Z)(I,2),B=A[0],E=A[1],V=(0,_.useState)(""),M=(0,N.Z)(V,2),te=M[0],ne=M[1],ae=(0,_.useState)(""),oe=(0,N.Z)(ae,2),le=(oe[0],oe[1]),de=(0,_.useState)(""),se=(0,N.Z)(de,2),ce=se[0],ue=se[1],ve=(0,_.useState)(""),fe=(0,N.Z)(ve,2),_e=fe[0],me=fe[1],pe=(0,_.useState)(""),ge=(0,N.Z)(pe,2),he=ge[0],Ce=ge[1],ye=(0,_.useState)(""),xe=(0,N.Z)(ye,2),be=xe[0],Ne=xe[1],Ze=(0,_.useState)(""),Te=(0,N.Z)(Ze,2),ke=Te[0],we=Te[1],je=(0,_.useState)(""),Ie=(0,N.Z)(je,2),Ae=Ie[0],De=Ie[1],Se=(0,_.useState)([]),Be=(0,N.Z)(Se,2),Ee=Be[0],Ve=Be[1],Oe=(0,_.useState)(!1),Me=(0,N.Z)(Oe,2),Pe=Me[0],Ue=Me[1],Le=(0,_.useState)(!1),Re=(0,N.Z)(Le,2),qe=Re[0],Fe=Re[1],Ye=(0,_.useRef)(null),Ge=(0,_.useRef)(null),Je=(0,_.useRef)(null),Xe=(0,_.useRef)(null),ze=(0,_.useRef)({}),He=F(),Ke=(0,_.useCallback)((function(){var e=s.certificateList,r=void 0===e?[]:e,i=r.find((function(e){return e.certificateType===f}))||{},t=i.certificateNo,n=void 0===t?"":t;j(n),E(H[f])}),[f,s]);(0,_.useEffect)((function(){var r,i,t,n=e.availableCertificates,a=void 0===n?[]:n,o=e.data,l=void 0===o?W:o,d=e.curCertificates,s=void 0===d?{}:d,u=e.certificateType,v=l.certificateList,f=void 0===v?[]:v,_=l.passengerId,m=void 0===_?"":_;((null===(r=a)||void 0===r?void 0:r.length)<=0||null===(i=a)||void 0===i||!i.includes)&&(a=ee);var g=[],h=function(e){return a.find((function(r){return r===e}))};Q.forEach((function(e){h(e)&&g.push({text:K[e],id:e})}));var C=[];f.forEach((function(e){e.certificateNo&&C.push(e.certificateType)}));var y=ee.concat(a).filter((function(e){var r;return ee.includes(e)&&(null===(r=a)||void 0===r?void 0:r.includes(e))}));C.length>0&&(y=y.concat(C).filter((function(e){return y.includes(e)&&C.includes(e)})));var x=s[m],b=null!==(t=a)&&void 0!==t&&t.includes(x)?x:"",N=b||u||y[0]||a[0];c(l),ze.current=l,p(N),E(H[N]),Ve(g)}),[e]),(0,_.useEffect)((function(){Ke()}),[f,s,Ke]);var Qe=(0,_.useCallback)((function(){var r=s.fullName,i=void 0===r?"":r,t=s.mobile,n=void 0===t?"":t,a=s.certificateList,o=void 0===a?[]:a,l=s.firstName,d=s.lastName,c=s.birthday,u=s.countryCode,v=e.yongAge,_=void 0===v?0:v,m=e.oldAge,p=void 0===m?0:m;i=i.trim(),n=n.replace(/\s/g,"");var g=!0;if(He){i||(ue(D.driverEnterFullname),g=!1),d?G(d)||(Ce(D.driver_validate_error_lastname),g=!1):(Ce(D.driver_enter_last_name),g=!1),l?Y(l)||(me(D.driver_validate_error_firstname),g=!1):(me(D.driver_enter_first_name),g=!1),c||(Ne(D.driver_enter_birthday),g=!1);var h=J(c);_>0&&h<_&&(Ne(D.driversDateOfBirthTooYoung(_)),g=!1),p>0&&h>p&&(Ne(D.driversDateOfBirthTooOld(p)),g=!1)}else{var C=o.find((function(e){return e.certificateType===f}))||{},y=C.certificateNo,x=void 0===y?"":y;x=x.replace(/\s/g,""),i?q(f,i)||(f===z.id?ue(D.driverValidateErrorIdName):ue(D.driverValidateErrorOtherName),g=!1):(ue(D.driverEnterFullname),g=!1),f||(le(D.driverEnterCertificateType),g=!1),x&&(f!==z.id||L(x))?f!==z.id||U(x)||(ne(D.driversDateOfBirthTooYoung(18)),g=!1):(ne(D.driverValidateErrorIdno),g=!1);var b=X(x,p,_);if(f===z.id&&b&&(ne(b),g=!1),["2","7","8"].includes(f)){var N="";/^[\dA-Z]+$/.test(x)?(x.length<5&&(N=D.driverCertificateNoLeastPlaceTips(5)),x.length>15&&(N=D.driverCertificateNoMaximumPlaceTips(15))):N=D.driverEnterCertificateNo(K[f]),N&&(ne(N),g=!1)}}return n?u!==ie||R(n,!0)||(De(D.driverEnterMobile),g=!1):(De(D.driverValidateErrorMobilephone),g=!1),g}),[f,s,He,t,o]),$e=(0,_.useCallback)((function(e){var r=(0,n.Z)({},s),i=r.certificateList,t=void 0===i?[]:i,a=JSON.parse(JSON.stringify(t)),o=a.find((function(e){return e.certificateType===f})),l=e;o?o.certificateNo=l:(o={certificateType:f,certificateNo:l},a.push(o)),r.certificateList=a,c(r),ze.current=r,j(l),ne("")}),[f,s]),We=(0,_.useCallback)((function(e){var r=e.target,i=r.dataset.itemId;p(i),ne(""),le("")}),[]),er=(0,_.useCallback)((function(e){var r=(0,n.Z)({},s);r.mobile=e,c(r),ze.current=r,De("")}),[s]),rr=(0,_.useCallback)((function(e){var r=(0,n.Z)({},s);r.fullName=e,c(r),ze.current=r,ue("")}),[s]),ir=(0,_.useCallback)((function(e){var r=(0,n.Z)({},s);r.firstName=e,c(r),ze.current=r,me("")}),[s]),tr=(0,_.useCallback)((function(e){var r=(0,n.Z)({},s);r.firstName=null===e||void 0===e?void 0:e.trim().toUpperCase(),c(r),ze.current=r,Ce("")}),[s]),nr=(0,_.useCallback)((function(e){var r=(0,n.Z)({},s);r.lastName=e,c(r),ze.current=r,Ce("")}),[s]),ar=(0,_.useCallback)((function(e){var r=(0,n.Z)({},s);r.lastName=null===e||void 0===e?void 0:e.trim().toUpperCase(),c(r),ze.current=r,Ce("")}),[s]),or=(0,_.useCallback)((function(){var e,r,i,t;null===(e=Ye.current)||void 0===e||e.blur(),null===(r=Ge.current)||void 0===r||r.blur(),null===(i=Je.current)||void 0===i||i.blur(),null===(t=Xe.current)||void 0===t||t.blur(),Fe(!0)}),[Fe]),lr=(0,_.useCallback)((function(){Fe(!1)}),[Fe]),dr=(0,_.useCallback)((function(e){var r=e.year,i=e.month,t=e.day;if(r&&i&&t){var a=(0,n.Z)({},ze.current);a.birthday="".concat(r,"-").concat(i,"-").concat(t);var o=J(a.birthday);a.age=o,c(a),ze.current=a,Ne("")}lr()}),[]),sr=(0,_.useCallback)((function(){C().component.areas({data:{selectedCode:s.nationalityCode},immediateCallback:function(e){var r=(0,n.Z)({},s);r.nationality=null===e||void 0===e?void 0:e.country,r.nationalityName=null===e||void 0===e?void 0:e.cn,r.nationalityCode=null===e||void 0===e?void 0:e.code,c(r),ze.current=r,we("")}})}),[s]),cr=(0,_.useCallback)((function(e){var r=(0,n.Z)({},s);r.countryCode=e,c(r),ze.current=r}),[s]),ur=(0,_.useCallback)((function(){var e=s.countryCode||ie;return(0,S.jsx)(k.Z,{areaCode:e,handleChangeAreaCode:cr})}),[s]),vr=(0,_.useMemo)((function(){return(0,S.jsx)(x.Z,{type:"icon",className:"driverEdit-right-arrow",children:b.q.FCC})}),[]),fr=(0,_.useCallback)((function(){Ue(!Pe)}),[Pe,s]),_r=(0,_.useCallback)((function(){var e=s.fullName,i=void 0===e?"":e,t=s.firstName,a=void 0===t?"":t,o=s.lastName,l=void 0===o?"":o,d=s.mobile,u=void 0===d?"":d,v=s.certificateList,_=void 0===v?[]:v,m=_.filter((function(e){return e.certificateType===f})),p=JSON.parse(JSON.stringify(m));p.forEach((function(e){e.certificateNo=(e.certificateNo||"").replace(/\s/g,"")}));var g=(0,n.Z)((0,n.Z)({},s),{},{fullName:i.trim(),firstName:a.trim().toUpperCase(),lastName:l.trim().toUpperCase(),mobile:u.replace(/\s/g,""),certificateList:p});c(g),ze.current=g,Qe()&&r(g)}),[f,s,r,Qe]),mr=(0,_.useCallback)((function(){Pe?setTimeout(_r,50):g().showToast({title:D.driver_noAgree_toast,icon:"none",duration:2e3})}),[Pe,_r]);return(0,S.jsxs)(S.Fragment,{children:[(0,S.jsxs)(m.View,{className:"form-wrap",children:[(0,S.jsx)(T.Z,{value:s.fullName,ref:Je,cursor:-1,label:D.driverCnName,placeholder:D.driverCtripName,errorText:ce,onInput:rr}),!He&&(0,S.jsxs)(m.View,{className:"input-select-container",children:[(0,S.jsx)(m.Label,{className:"input-select-label",children:D.driverCertificateType}),(0,S.jsx)(m.View,{className:"input-select-content",children:Ee.map((function(e){return(0,S.jsx)(m.View,{className:(0,a.classnames)("input-select-tab border-px1",f===e.id?"active-tab":""),"data-itemId":e.id,onClick:We,children:e.text},e.id)}))}),B&&(0,S.jsxs)(m.View,{className:"input-select-tip",children:[(0,S.jsx)(m.Text,{className:"tip-info-icon icon-warnings"}),(0,S.jsx)(m.Text,{className:"tip-info-text",children:B})]})]}),!He&&(0,S.jsx)(T.Z,{isValueSpit:f===z.id,inputType:$.id,value:w,placeholder:D.driver_certificate_placeholder(K[f]),onInput:$e,onBlur:$e,label:D.driverCertificateNo,errorText:te}),He&&(0,S.jsx)(T.Z,{value:s.lastName,ref:Ge,cursor:-1,label:D.driver_en_lastname,placeholder:D.driver_ctrip_lastname_placeholder,errorText:he,onInput:nr,onBlur:ar}),He&&(0,S.jsx)(T.Z,{value:s.firstName,ref:Ye,cursor:-1,label:D.driver_en_firstname,placeholder:D.driver_ctrip_firstname_placeholder,errorText:_e,onInput:ir,onBlur:tr}),He&&(0,S.jsx)(m.View,{onClick:or,children:(0,S.jsx)(T.Z,{value:s.birthday,label:D.drivers_dateOfBirth,placeholder:"",rightChildern:vr,errorText:be,disabled:!0,onInput:re,onBlur:re})}),He&&(0,S.jsx)(m.View,{onClick:sr,children:(0,S.jsx)(T.Z,{value:s.nationalityName,label:D.driver_nationality,placeholder:"",rightChildern:vr,errorText:ke,disabled:!0,onInput:re,onBlur:re})}),(0,S.jsx)(T.Z,{isValueSpit:!0,ref:Xe,inputType:$.phone,placeholder:D.driverMobileUseFor,leftChildern:He&&(0,S.jsx)(ur,{}),value:s.mobile,cursor:-1,label:D.driverContactPhone,onInput:er,onBlur:er,onPressContact:er,errorText:Ae})]}),i&&(null===i||void 0===i?void 0:i.length)>=2&&(0,S.jsxs)(m.View,{children:[(0,S.jsxs)(m.View,{className:"message-auth-title",onClick:fr,children:[(0,S.jsx)(x.Z,{type:"icon",className:(0,a.classnames)("check-radiobox",Pe?"checked":""),children:Pe?b.q._w3:b.q.rpw}),(0,S.jsx)(m.Text,{className:"message-auth-title-text",children:i[0].content})]}),(0,S.jsx)(m.View,{className:"message-auth-content",children:i[1].content})]}),(0,S.jsx)(m.View,{className:"save-btn",children:(0,S.jsx)(Z.Z,{onClick:mr,children:D.save})}),(0,S.jsx)(P,{visible:qe,curBirthDay:s.birthday||O,onConfirmBirthDay:dr,onCancelBirthDay:lr})]})},ne=te,ae=i(29316),oe=function(e){(0,u.Z)(i,e);var r=(0,v.Z)(i);function i(e){var t;return(0,o.Z)(this,i),t=r.call(this,e),(0,f.Z)((0,d.Z)(t),"skipIssuesTemp",[]),(0,f.Z)((0,d.Z)(t),"confirmedCodes",[]),(0,f.Z)((0,d.Z)(t),"showBlockConfirmModal",(function(e){var r;C().showModal({title:"",content:null===e||void 0===e||null===(r=e[0])||void 0===r?void 0:r.msg,confirmText:D.driver_go_modify})})),(0,f.Z)((0,d.Z)(t),"showSkipConfirmModal",(function(e){var r=t.skipIssuesTemp.shift();t.confirmedCodes.push(null===r||void 0===r?void 0:r.code),C().showModal({title:"",content:null===r||void 0===r?void 0:r.msg,confirmText:D.driver_confirm_correct,cancelText:D.driver_go_modify,complete:function(r){var i;r.confirm&&((null===(i=t.skipIssuesTemp)||void 0===i?void 0:i.length)>0?setTimeout((function(){t.showSkipConfirmModal(e)}),500):t.modifyDriver(e,t.confirmedCodes))}})})),(0,f.Z)((0,d.Z)(t),"modifyDriver",(function(e,r){var i=t.props,n=i.modifyDriver,a=i.yongAge,o=i.oldAge,l={driver:e,yongAge:a,oldAge:o,confirmedCodes:r};n(l,(function(r){var i=r.isSuccess,n=r.blockIssues,a=r.skipIssues;i?w.ToastLoading.showToast({title:D.driver_save_success,duration:2e3,success:function(){var e=g().getCurrentPages(),r=e.findIndex((function(e){return e.pageId===w.Channel.getPageId().BOOK.ID}));if(r>-1){var i=e.length-1-r;C().navigateBack({delta:i})}else C().navigateBack(1)}}):(null===n||void 0===n?void 0:n.length)>0?t.showBlockConfirmModal(n):(null===a||void 0===a?void 0:a.length)>0?(t.skipIssuesTemp=a,t.confirmedCodes=[],t.showSkipConfirmModal(e)):w.ToastLoading.showToast({title:D.driver_save_fail,duration:3e3})}))})),(0,f.Z)((0,d.Z)(t),"onSave",(function(e){var r;null!==(r=t.state)&&void 0!==r&&r.isLoading||t.modifyDriver(e)})),(0,f.Z)((0,d.Z)(t),"goToDriverRule",(0,a.debounce)((function(){(0,ae.V4)("/pages/carNew/isd/subPages/driverRule/index")}))),t.state={driver:{}},t.checkPerformance=!0,t}return(0,l.Z)(i,[{key:"getPageId",value:function(){return this.pageId=w.Channel.getPageId().DRIVER_EDIT.ID,this.pageId}},{key:"onReady",value:function(){(0,s.Z)((0,c.Z)(i.prototype),"onReady",this).call(this)}},{key:"componentDidMount",value:function(){var e,r=null===(e=(0,p.getCurrentInstance)())||void 0===e||null===(e=e.router)||void 0===e?void 0:e.params;if(null!==r&&void 0!==r&&r.data){var i=w.Utils.jsonParse(decodeURIComponent(null===r||void 0===r?void 0:r.data));this.setState({driver:null===i||void 0===i?void 0:i.driver}),null!==i&&void 0!==i&&i.isAdd?g().setNavigationBarTitle({title:D.driversAdd}):g().setNavigationBarTitle({title:D.driversEdit})}}},{key:"render",value:function(){var e=this,r=w.Utils.isCtripOsd(),i=this.props,t=i.oldAge,n=i.yongAge;return(0,S.jsxs)(m.View,{className:"driver-edit-container",children:[(0,S.jsxs)(m.View,{className:"head-tip",children:[(0,S.jsx)(m.Text,{children:D.driverAddNameTip}),(0,S.jsx)(m.View,{className:"driver-add-rule",onClick:this.goToDriverRule,children:r&&(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(m.Text,{className:"driver-add-rule-text",children:D.driverAddNameTipRule}),(0,S.jsx)(x.Z,{type:"icon",className:"driver-add-rule-icon",children:b.q.FCC})]})})]}),(0,S.jsx)(ne,(0,f.Z)((0,f.Z)({tips:this.props.tips,onSave:this.onSave,data:this.state.driver,curCertificates:this.props.curCertificates,yongAge:this.props.yongAge,oldAge:this.props.oldAge,availableCertificates:this.props.availableCertificates},"oldAge",t),"yongAge",n)),(0,S.jsx)(m.View,{className:"view-check",onAnimationEnd:function(){return e.viewReadyHandle&&e.viewReadyHandle()}})]})}}]),i}(y.Z),le=oe,de=i(94704),se=i(73613),ce=i(62813),ue=i(70753),ve=i(34719),fe=i(86504),_e=i(58419),me=i(27110),pe=i(22189),ge=i(6017),he=function(e){var r,i,t=(0,ce.z9)(e),n=(0,ue.XE)(t)||{},a=n.ageRestriction,o=void 0===a?{}:a,l=(o.maxDriverAge,o.minDriverAge,(null===(r=(0,ce.MP)(e))||void 0===r?void 0:r.youngDriverAge)||(0,de.jN)(e)),d=(null===(i=(0,ce.MP)(e))||void 0===i?void 0:i.oldDriverAge)||(0,de.NS)(e);return{curCertificates:(0,de.nX)(e),availableCertificates:(0,de.Pj)(e),tips:(0,de.V4)(e),yongAge:l,oldAge:d}},Ce=function(e){var r=(0,ve.z9)(e),i=(0,fe.XE)(r)||{},t=i.ageRestriction,n=void 0===t?{}:t,a=n.maxDriverAge,o=n.minDriverAge,l=o,d=a;return{curCertificates:(0,de.nX)(e),availableCertificates:(0,de.Pj)(e),tips:(0,de.V4)(e),yongAge:l,oldAge:d}},ye=function(e){return{modifyDriver:function(r,i){return e((0,se.q)(r,i))},backToBooking:function(r){e((0,_e.EL)(r)),e((0,_e.BG)(!0))}}},xe=function(e){return{modifyDriver:function(r,i){return e((0,se.q)(r,i))},backToBooking:function(r){e((0,me.EL)(r)),e((0,pe.BG)(!0))}}},be=w.Utils.isCtripOsd()?(0,a.connect)(Ce,xe)(le):(0,a.connect)(he,ye)(le),Ne=(0,ge.Z)(be),Ze=function(e){return(0,S.jsx)(Ne,(0,n.Z)({},e))},Te=Ze,ke={navigationBarTextStyle:"black",navigationBarBackgroundColor:"#ffffff"};Page((0,t.createPageConfig)(Te,"pages/carNew/isd/subPages/driverEdit/index",{root:{cn:[]}},ke||{}))},79181:function(e){e.exports=require("../../../../../cwx/cpage/initNavigator")},91783:function(e){e.exports=require("../../../../../cwx/cpage/ubt_wx")},56884:function(e){e.exports=require("../../../../../cwx/cwx")},65238:function(e){e.exports=require("../../../../../cwx/ext/global")},33675:function(e){e.exports=require("../../../../../cwx/cwx")},44353:function(e){e.exports=require("../../../../../cwx/cwx.js")},46346:function(e){e.exports=require("../../../../../cwx/ext/global")}},function(e){var r=function(r){return e(e.s=r)};e.O(0,[7606,2107,1216,8592],(function(){return r(94416)}));e.O()}]);
//# sourceMappingURL=index.js.map