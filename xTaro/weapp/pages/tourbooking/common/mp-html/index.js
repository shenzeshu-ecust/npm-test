/*! For license information please see index.js.LICENSE.txt */
"use strict";(wx["tripTaroGlobal30"]=wx["tripTaroGlobal30"]||[]).push([[5455],{59122:function(t,e,i){function s(t,e,i){return e in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}var n=i(89010),a=[];Component({data:{nodes:[]},properties:{containerStyle:String,content:{type:String,value:"",observer:function(t){this.setContent(t)}},copyLink:{type:Boolean,value:!0},domain:String,errorImg:String,lazyLoad:Boolean,loadingImg:String,pauseVideo:{type:Boolean,value:!0},previewImg:{type:Boolean,value:!0},scrollTable:Boolean,selectable:null,setTitle:{type:Boolean,value:!0},showImgMenu:{type:Boolean,value:!0},tagStyle:Object,useAnchor:null},created:function(){this.plugins=[];for(var t=a.length;t--;)this.plugins.push(new a[t](this))},detached:function(){clearInterval(this._timer),this._hook("onDetached")},methods:{in:function(t,e,i){t&&e&&i&&(this._in={page:t,selector:e,scrollTop:i})},navigateTo:function(t,e){var i=this;return new Promise((function(n,a){if(i.data.useAnchor){var r=wx.createSelectorQuery().in(i._in?i._in.page:i).select((i._in?i._in.selector:"._root")+(t?"".concat(">>>","#").concat(t):"")).boundingClientRect();i._in?r.select(i._in.selector).scrollOffset().select(i._in.selector).boundingClientRect():r.selectViewport().scrollOffset(),r.exec((function(t){if(t[0]){var r=t[1].scrollTop+t[0].top-(t[2]?t[2].top:0)+(e||parseInt(i.data.useAnchor)||0);i._in?i._in.page.setData(s({},i._in.scrollTop,r)):wx.pageScrollTo({scrollTop:r,duration:300}),n()}else a(Error("Label not found"))}))}else a(Error("Anchor is disabled"))}))},getText:function(t){var e="";return function t(i){for(var s=0;s<i.length;s++){var n=i[s];if("text"===n.type)e+=n.text.replace(/&amp;/g,"&");else if("br"===n.name)e+="\n";else{var a="p"===n.name||"div"===n.name||"tr"===n.name||"li"===n.name||"h"===n.name[0]&&n.name[1]>"0"&&n.name[1]<"7";a&&e&&"\n"!==e[e.length-1]&&(e+="\n"),n.children&&t(n.children),a&&"\n"!==e[e.length-1]?e+="\n":"td"!==n.name&&"th"!==n.name||(e+="\t")}}}(t||this.data.nodes),e},getRect:function(){var t=this;return new Promise((function(e,i){wx.createSelectorQuery().in(t).select("._root").boundingClientRect().exec((function(t){return t[0]?e(t[0]):i(Error("Root label not found"))}))}))},setContent:function(t,e){var i=this;this.imgList&&e||(this.imgList=[]),this._videos=[];var s,a={},r=new n(this).parse(t);if(e)for(var o=this.data.nodes.length,l=r.length;l--;)a["nodes[".concat(o+l,"]")]=r[l];else a.nodes=r;this.setData(a,(function(){i._hook("onLoad"),i.triggerEvent("load")})),clearInterval(this._timer),this._timer=setInterval((function(){i.getRect().then((function(t){t.height===s&&(i.triggerEvent("ready",t),clearInterval(i._timer)),s=t.height})).catch((function(){}))}),350)},_hook:function(t){for(var e=a.length;e--;)this.plugins[e][t]&&this.plugins[e][t]()},_add:function(t){t.detail.root=this}}})},89010:function(t){function e(t){for(var e=Object.create(null),i=t.split(","),s=i.length;s--;)e[i[s]]=!0;return e}function i(t,e){for(var i=t.indexOf("&");-1!==i;){var s=t.indexOf(";",i+3),n=void 0;if(-1===s)break;"#"===t[i+1]?(n=parseInt(("x"===t[i+2]?"0":"")+t.substring(i+2,s)),isNaN(n)||(t=t.substr(0,i)+String.fromCharCode(n)+t.substr(s+1))):(n=t.substring(i+1,s),(a.entities[n]||"amp"===n&&e)&&(t=t.substr(0,i)+(a.entities[n]||"&")+t.substr(s+1))),i=t.indexOf("&",i+1)}return t}function s(t){this.options=t.data||{},this.tagStyle=Object.assign({},a.tagStyle,this.options.tagStyle),this.imgList=t.imgList||[],this.plugins=t.plugins||[],this.attrs=Object.create(null),this.stack=[],this.nodes=[],this.pre=(this.options.containerStyle||"").includes("white-space")&&this.options.containerStyle.includes("pre")?2:0}function n(t){this.handler=t}var a={trustTags:e("a,abbr,ad,audio,b,blockquote,br,code,col,colgroup,dd,del,dl,dt,div,em,fieldset,h1,h2,h3,h4,h5,h6,hr,i,img,ins,label,legend,li,ol,p,q,ruby,rt,source,span,strong,sub,sup,table,tbody,td,tfoot,th,thead,tr,title,ul,video"),blockTags:e("address,article,aside,body,caption,center,cite,footer,header,html,nav,pre,section"),ignoreTags:e("area,base,canvas,embed,frame,head,iframe,input,link,map,meta,param,rp,script,source,style,textarea,title,track,wbr"),voidTags:e("area,base,br,col,circle,ellipse,embed,frame,hr,img,input,line,link,meta,param,path,polygon,rect,source,track,use,wbr"),entities:{lt:"<",gt:">",quot:'"',apos:"'",ensp:"\u2002",emsp:"\u2003",nbsp:"\xa0",semi:";",ndash:"\u2013",mdash:"\u2014",middot:"\xb7",lsquo:"\u2018",rsquo:"\u2019",ldquo:"\u201c",rdquo:"\u201d",bull:"\u2022",hellip:"\u2026"},tagStyle:{address:"font-style:italic",big:"display:inline;font-size:1.2em",caption:"display:table-caption;text-align:center",center:"text-align:center",cite:"font-style:italic",dd:"margin-left:40px",mark:"background-color:yellow",pre:"font-family:monospace;white-space:pre",s:"text-decoration:line-through",small:"display:inline;font-size:0.8em",strike:"text-decoration:line-through",u:"text-decoration:underline"}},r={},o=wx.getSystemInfoSync(),l=o.windowWidth,h=o.system,c=e(" ,\r,\n,\t,\f"),d=0;s.prototype.parse=function(t){for(var e=this.plugins.length;e--;)this.plugins[e].onUpdate&&(t=this.plugins[e].onUpdate(t,a)||t);for(new n(this).parse(t);this.stack.length;)this.popNode();return this.nodes},s.prototype.expose=function(){for(var t=this.stack.length;t--;){var e=this.stack[t];if(e.c||"a"===e.name||"video"===e.name||"audio"===e.name)return;e.c=1}},s.prototype.hook=function(t){for(var e=this.plugins.length;e--;)if(this.plugins[e].onParse&&!1===this.plugins[e].onParse(t,this))return!1;return!0},s.prototype.getUrl=function(t){var e=this.options.domain;return"/"===t[0]?"/"===t[1]?t=(e?e.split("://")[0]:"http")+":"+t:e&&(t=e+t):!e||t.includes("data:")||t.includes("://")||(t=e+"/"+t),t},s.prototype.parseStyle=function(t){var e=t.attrs,i=(this.tagStyle[t.name]||"").split(";").concat((e.style||"").split(";")),s={},n="";e.id&&!this.xml&&(this.options.useAnchor?this.expose():"img"!==t.name&&"a"!==t.name&&"video"!==t.name&&"audio"!==t.name&&(e.id=void 0)),e.width&&(s.width=parseFloat(e.width)+(e.width.includes("%")?"%":"px"),e.width=void 0),e.height&&(s.height=parseFloat(e.height)+(e.height.includes("%")?"%":"px"),e.height=void 0);for(var a=0,r=i.length;a<r;a++){var o=i[a].split(":");if(!(o.length<2)){var h=o.shift().trim().toLowerCase(),d=o.join(":").trim();if("-"===d[0]&&d.lastIndexOf("-")>0||d.includes("safe"))n+=";".concat(h,":").concat(d);else if(!s[h]||d.includes("import")||!s[h].includes("import")){if(d.includes("url")){var p=d.indexOf("(")+1;if(p){for(;'"'===d[p]||"'"===d[p]||c[d[p]];)p++;d=d.substr(0,p)+this.getUrl(d.substr(p))}}else d.includes("rpx")&&(d=d.replace(/[0-9.]+\s*rpx/g,(function(t){return parseFloat(t)*l/750+"px"})));s[h]=d}}}return t.attrs.style=n,s},s.prototype.onTagName=function(t){this.tagName=this.xml?t:t.toLowerCase(),"svg"===this.tagName&&(this.xml=(this.xml||0)+1)},s.prototype.onAttrName=function(t){t=this.xml?t:t.toLowerCase(),"data-"===t.substr(0,5)?"data-src"!==t||this.attrs.src?"img"===this.tagName||"a"===this.tagName?this.attrName=t:this.attrName=void 0:this.attrName="src":(this.attrName=t,this.attrs[t]="T")},s.prototype.onAttrVal=function(t){var e=this.attrName||"";"style"===e||"href"===e?this.attrs[e]=i(t,!0):e.includes("src")?this.attrs[e]=this.getUrl(i(t,!0)):e&&(this.attrs[e]=t)},s.prototype.onOpenTag=function(t){var e=Object.create(null);e.name=this.tagName,e.attrs=this.attrs,this.attrs=Object.create(null);var i=e.attrs,s=this.stack[this.stack.length-1],n=s?s.children:this.nodes,o=this.xml?t:a.voidTags[e.name];if(r[e.name]&&(i.class=r[e.name]+(i.class?" "+i.class:"")),"embed"===e.name){var h=i.src||"";h.includes(".mp4")||h.includes(".3gp")||h.includes(".m3u8")||(i.type||"").includes("video")?e.name="video":(h.includes(".mp3")||h.includes(".wav")||h.includes(".aac")||h.includes(".m4a")||(i.type||"").includes("audio"))&&(e.name="audio"),i.autostart&&(i.autoplay="T"),i.controls="T"}if("video"!==e.name&&"audio"!==e.name||("video"!==e.name||i.id||(i.id="v"+d++),i.controls||i.autoplay||(i.controls="T"),e.src=[],i.src&&(e.src.push(i.src),i.src=void 0),this.expose()),o){if(!this.hook(e)||a.ignoreTags[e.name])return void("base"!==e.name||this.options.domain?"source"===e.name&&s&&("video"===s.name||"audio"===s.name)&&i.src&&s.src.push(i.src):this.options.domain=i.href);var c=this.parseStyle(e);if("img"===e.name){if(i.src&&(i.src.includes("webp")&&(e.webp="T"),i.src.includes("data:")&&!i["original-src"]&&(i.ignore="T"),!i.ignore||e.webp||i.src.includes("cloud://"))){for(var p=this.stack.length;p--;){var u=this.stack[p];if("a"===u.name){e.a=u.attrs;break}var g=u.attrs.style||"";if(!g.includes("flex:")||g.includes("flex:0")||g.includes("flex: 0")||c.width&&c.width.includes("%"))if(g.includes("flex")&&"100%"===c.width)for(var f=p+1;f<this.stack.length;f++){var m=this.stack[f].attrs.style||"";if(!m.includes(";width")&&!m.includes(" width")&&0!==m.indexOf("width")){c.width="";break}}else g.includes("inline-block")&&(c.width&&"%"===c.width[c.width.length-1]?(u.attrs.style+=";max-width:"+c.width,c.width=""):u.attrs.style+=";max-width:100%");else{c.width="100% !important",c.height="";for(var v=p+1;v<this.stack.length;v++)this.stack[v].attrs.style=(this.stack[v].attrs.style||"").replace("inline-","")}u.c=1}e.i=this.imgList.length;var y=i["original-src"]||i.src;if(this.imgList.includes(y)){var x=y.indexOf("://");if(-1!==x){x+=3;for(var b=y.substr(0,x);x<y.length&&"/"!==y[x];x++)b+=Math.random()>.5?y[x].toUpperCase():y[x];b+=y.substr(x),y=b}}this.imgList.push(y)}"inline"===c.display&&(c.display=""),i.ignore&&(c["max-width"]=c["max-width"]||"100%",i.style+=";-webkit-touch-callout:none"),parseInt(c.width)>l&&(c.height=void 0),c.width&&(c.width.includes("auto")?c.width="":(e.w="T",c.height&&!c.height.includes("auto")&&(e.h="T")))}else if("svg"===e.name)return n.push(e),this.stack.push(e),void this.popNode();for(var w in c)c[w]&&(i.style+=";".concat(w,":").concat(c[w].replace(" !important","")));i.style=i.style.substr(1)||void 0}else("pre"===e.name||(i.style||"").includes("white-space")&&i.style.includes("pre"))&&2!==this.pre&&(this.pre=e.pre=1),e.children=[],this.stack.push(e);n.push(e)},s.prototype.onCloseTag=function(t){var e;for(t=this.xml?t:t.toLowerCase(),e=this.stack.length;e--&&this.stack[e].name!==t;);if(-1!==e)for(;this.stack.length>e;)this.popNode();else if("p"===t||"br"===t){var i=this.stack.length?this.stack[this.stack.length-1].children:this.nodes;i.push({name:t,attrs:{class:r[t],style:this.tagStyle[t]}})}},s.prototype.popNode=function(){var t=this.stack.pop(),e=t.attrs,i=t.children,s=this.stack[this.stack.length-1],n=s?s.children:this.nodes;if(!this.hook(t)||a.ignoreTags[t.name])return"title"===t.name&&i.length&&"text"===i[0].type&&this.options.setTitle&&wx.setNavigationBarTitle({title:i[0].text}),void n.pop();if(t.pre&&2!==this.pre){this.pre=t.pre=void 0;for(var r=this.stack.length;r--;)this.stack[r].pre&&(this.pre=1)}if("svg"===t.name){if(this.xml>1)return void this.xml--;var o="",h=e.style;return e.style="",e.viewbox&&(e.viewBox=e.viewbox),e.xmlns="http://www.w3.org/2000/svg",function t(e){if("text"!==e.type){for(var i in o+="<"+e.name,e.attrs){var s=e.attrs[i];s&&(o+=" ".concat(i,'="').concat(s,'"'))}if(e.children){o+=">";for(var n=0;n<e.children.length;n++)t(e.children[n]);o+="</"+e.name+">"}else o+="/>"}else o+=e.text}(t),t.name="img",t.attrs={src:"data:image/svg+xml;utf8,"+o.replace(/#/g,"%23"),style:h,ignore:"T"},t.children=void 0,void(this.xml=!1)}var c={};if(e.align&&("table"===t.name?"center"===e.align?c["margin-inline-start"]=c["margin-inline-end"]="auto":c.float=e.align:c["text-align"]=e.align,e.align=void 0),e.dir&&(c.direction=e.dir,e.dir=void 0),"font"===t.name&&(e.color&&(c.color=e.color,e.color=void 0),e.face&&(c["font-family"]=e.face,e.face=void 0),e.size)){var d=parseInt(e.size);isNaN(d)||(d<1?d=1:d>7&&(d=7),c["font-size"]=["xx-small","x-small","small","medium","large","x-large","xx-large"][d-1]),e.size=void 0}if((e.class||"").includes("align-center")&&(c["text-align"]="center"),Object.assign(c,this.parseStyle(t)),"table"!==t.name&&parseInt(c.width)>l&&(c["max-width"]="100%",c["box-sizing"]="border-box"),a.blockTags[t.name])t.name="div";else if(a.trustTags[t.name]||this.xml)if("a"===t.name||"ad"===t.name)this.expose();else if("video"===t.name||"audio"===t.name)t.children=void 0;else if("ul"!==t.name&&"ol"!==t.name||!t.c){if("table"===t.name){var p=parseFloat(e.cellpadding),u=parseFloat(e.cellspacing),g=parseFloat(e.border);if(t.c&&(isNaN(p)&&(p=2),isNaN(u)&&(u=2)),g&&(e.style+=";border:"+g+"px solid gray"),t.flag&&t.c){t.flag=void 0,c.display="grid",u?(c["grid-gap"]=u+"px",c.padding=u+"px"):g&&(e.style+=";border-left:0;border-top:0");var f=[],m=[],v=[],y={};!function t(e){for(var i=0;i<e.length;i++)"tr"===e[i].name?m.push(e[i]):t(e[i].children||[])}(i);for(var x=1;x<=m.length;x++){for(var b=1,w=0;w<m[x-1].children.length;w++,b++){var k=m[x-1].children[w];if("td"===k.name||"th"===k.name){for(;y[x+"."+b];)b++;k.c=1;var T=k.attrs.style||"",N=T.indexOf("width")?T.indexOf(";width"):0;if(-1!==N){var O=T.indexOf(";",N+6);-1===O&&(O=T.length),k.attrs.colspan||(f[b]=T.substring(N?N+7:6,O)),T=T.substr(0,N)+T.substr(O)}if(T+=(g?";border:".concat(g,"px solid gray")+(u?"":";border-right:0;border-bottom:0"):"")+(p?";padding:".concat(p,"px"):""),k.attrs.colspan&&(T+=";grid-column-start:".concat(b,";grid-column-end:").concat(b+parseInt(k.attrs.colspan)),k.attrs.rowspan||(T+=";grid-row-start:".concat(x,";grid-row-end:").concat(x+1)),b+=parseInt(k.attrs.colspan)-1),k.attrs.rowspan){T+=";grid-row-start:".concat(x,";grid-row-end:").concat(x+parseInt(k.attrs.rowspan)),k.attrs.colspan||(T+=";grid-column-start:".concat(b,";grid-column-end:").concat(b+1));for(var S=1;S<k.attrs.rowspan;S++)for(var C=0;C<(k.attrs.colspan||1);C++)y[x+S+"."+(b-C)]=1}T&&(k.attrs.style=T),v.push(k)}}if(1===x){for(var _="",I=1;I<b;I++)_+=(f[I]?f[I]:"auto")+" ";c["grid-template-columns"]=_}}t.children=v}else t.c&&(c.display="table"),isNaN(u)||(c["border-spacing"]=u+"px"),(g||p||t.c)&&function e(i){for(var s=0;s<i.length;s++){var n=i[s];t.c&&(n.c=1),"th"===n.name||"td"===n.name?(g&&(n.attrs.style="border:".concat(g,"px solid gray;").concat(n.attrs.style||"")),p&&(n.attrs.style="padding:".concat(p,"px;").concat(n.attrs.style||""))):n.children&&e(n.children)}}(i);if(this.options.scrollTable&&!(e.style||"").includes("inline")){var A=Object.assign({},t);t.name="div",t.attrs={style:"overflow-x:auto;padding:1px"},t.children=[A],e=A.attrs}}else if("td"!==t.name&&"th"!==t.name||!e.colspan&&!e.rowspan){if("ruby"===t.name){t.name="span";for(var L=0;L<i.length-1;L++)"text"===i[L].type&&"rt"===i[L+1].name&&(i[L]={name:"span",attrs:{style:"display:inline-block;text-align:center"},children:[{name:"div",attrs:{style:"font-size:50%;"+(i[L+1].attrs.style||"")},children:i[L+1].children},i[L]]},i.splice(L+1,1))}}else for(var j=this.stack.length;j--;)if("table"===this.stack[j].name){this.stack[j].flag=1;break}}else{var z={a:"lower-alpha",A:"upper-alpha",i:"lower-roman",I:"upper-roman"};z[e.type]&&(e.style+=";list-style-type:"+z[e.type],e.type=void 0),t.c=1;for(var B=i.length;B--;)"li"===i[B].name&&(i[B].c=1)}else t.name="span";if((c.display||"").includes("flex")&&!t.c)for(var V=i.length;V--;){var q=i[V];q.f&&(q.attrs.style=(q.attrs.style||"")+q.f,q.f=void 0)}var F=s&&(s.attrs.style||"").includes("flex")&&!t.c&&!(c.display||"").includes("inline");for(var R in F&&(t.f=";max-width:100%"),c)if(c[R]){var U=";".concat(R,":").concat(c[R].replace(" !important",""));F&&(R.includes("flex")&&"flex-direction"!==R||"align-self"===R||"-"===c[R][0]||"width"===R&&U.includes("%"))?(t.f+=U,"width"===R&&(e.style+=";width:100%")):e.style+=U}e.style=e.style.substr(1)||void 0},s.prototype.onText=function(t){if(!this.pre){for(var e,s="",n=0,a=t.length;n<a;n++)c[t[n]]?(" "!==s[s.length-1]&&(s+=" "),"\n"!==t[n]||e||(e=!0)):s+=t[n];if(" "===s&&e)return;t=s}var r=Object.create(null);r.type="text",r.text=i(t),this.hook(r)&&("force"===this.options.selectable&&h.includes("iOS")&&(this.expose(),r.us="T"),(this.stack.length?this.stack[this.stack.length-1].children:this.nodes).push(r))},n.prototype.parse=function(t){this.content=t||"",this.i=0,this.start=0,this.state=this.text;for(var e=this.content.length;-1!==this.i&&this.i<e;)this.state()},n.prototype.checkClose=function(t){var e="/"===this.content[this.i];return!!(">"===this.content[this.i]||e&&">"===this.content[this.i+1])&&(t&&this.handler[t](this.content.substring(this.start,this.i)),this.i+=e?2:1,this.start=this.i,this.handler.onOpenTag(e),"script"===this.handler.tagName?(this.i=this.content.indexOf("</",this.i),-1!==this.i&&(this.i+=2,this.start=this.i),this.state=this.endTag):this.state=this.text,!0)},n.prototype.text=function(){if(this.i=this.content.indexOf("<",this.i),-1!==this.i){var t=this.content[this.i+1];if(t>="a"&&t<="z"||t>="A"&&t<="Z")this.start!==this.i&&this.handler.onText(this.content.substring(this.start,this.i)),this.start=++this.i,this.state=this.tagName;else if("/"===t||"!"===t||"?"===t){this.start!==this.i&&this.handler.onText(this.content.substring(this.start,this.i));var e=this.content[this.i+2];if("/"===t&&(e>="a"&&e<="z"||e>="A"&&e<="Z"))return this.i+=2,this.start=this.i,void(this.state=this.endTag);var i="--\x3e";"!"===t&&"-"===this.content[this.i+2]&&"-"===this.content[this.i+3]||(i=">"),this.i=this.content.indexOf(i,this.i),-1!==this.i&&(this.i+=i.length,this.start=this.i)}else this.i++}else this.start<this.content.length&&this.handler.onText(this.content.substring(this.start,this.content.length))},n.prototype.tagName=function(){if(c[this.content[this.i]]){for(this.handler.onTagName(this.content.substring(this.start,this.i));c[this.content[++this.i]];);this.i<this.content.length&&!this.checkClose()&&(this.start=this.i,this.state=this.attrName)}else this.checkClose("onTagName")||this.i++},n.prototype.attrName=function(){var t=this.content[this.i];if(c[t]||"="===t){this.handler.onAttrName(this.content.substring(this.start,this.i));for(var e="="===t,i=this.content.length;++this.i<i;)if(t=this.content[this.i],!c[t]){if(this.checkClose())return;if(e)return this.start=this.i,void(this.state=this.attrVal);if("="!==this.content[this.i])return this.start=this.i,void(this.state=this.attrName);e=!0}}else this.checkClose("onAttrName")||this.i++},n.prototype.attrVal=function(){var t=this.content[this.i],e=this.content.length;if('"'===t||"'"===t){if(this.start=++this.i,this.i=this.content.indexOf(t,this.i),-1===this.i)return;this.handler.onAttrVal(this.content.substring(this.start,this.i))}else for(;this.i<e;this.i++){if(c[this.content[this.i]]){this.handler.onAttrVal(this.content.substring(this.start,this.i));break}if(this.checkClose("onAttrVal"))return}for(;c[this.content[++this.i]];);this.i<e&&!this.checkClose()&&(this.start=this.i,this.state=this.attrName)},n.prototype.endTag=function(){var t=this.content[this.i];if(c[t]||">"===t||"/"===t){if(this.handler.onCloseTag(this.content.substring(this.start,this.i)),">"!==t&&(this.i=this.content.indexOf(">",this.i),-1===this.i))return;this.start=++this.i,this.state=this.text}else this.i++},t.exports=s}},function(t){var e=function(e){return t(t.s=e)};e(59122)}]);
//# sourceMappingURL=index.js.map