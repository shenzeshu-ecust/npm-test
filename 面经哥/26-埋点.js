// 常见的埋点上报方式有ajax，img，navigator.sendBeacon下面介绍下这三种埋点上报方式

// ! 1 基于ajax的埋点上报
function buryingPointAjax(data) {
  return new Promise((resolve, reject) => {
    // 创建ajax请求
    const xhr = new XMLHttpRequest();
    // 定义请求接口
    xhr.open("post", "/buryingPoint", true);
    // 发送数据
    xhr.send(data);
  });
}
// * 缺点
// 一般而言，埋点域名并不是当前域名，因此请求会存在跨域风险，
// 且如果ajax配置不正确可能会浏览器拦截。因此使用ajax这类请求并不是万全之策。

// ! 2 基于img的埋点上报
// 我们可以通过一些支持跨域的标签去实现数据上报功能。
// script，link，img就是我们上报的数据的最好对象

// ~ script及link的缺陷
let a = document.createElement("script");
a.src =
  "https://lf-headquarters-speed.yhgfb-cn-static.com/obj/rc-client-security/web/stable/1.0.0.28/bdms.js";
// 这时不会发起请求

document.body.appendChild(a); // 这时才会发起请求
/*
 * 当我们使用script和link进行埋点上报时，需要挂载到页面上，
 * 而反复操作dom会造成页面性能受影响，而且载入js/css资源还会阻塞页面渲染，影响用户体验，
 * 因此对于需要频繁上报的埋点而言，script和link并不合适。
 */

// ~ img优势
// ~ 通常使用img标签去做埋点上报，img标签加载并不需要挂载到页面上(用 1x1 像素的gif图片)，
// ~ 基于js去new image()，设置其src之后就可以直接请求图片。

var img = new Image();
img.src =
  "https://lf3-cdn-tos.bytescm.com/obj/static/xitu_juejin_web/img/MaskGroup.13dfc4f1.png";
// 可以看到即便未被挂载到页面上依旧发起了请求
/*
因此当我们做埋点上报时，使用img是一个不错的选择。

    1 img兼容性好
    2 无需挂载到页面上，反复操作dom
    3 img的加载不会阻塞html的解析，但img加载后并不渲染，它需要等待Render Tree生成完后才和Render Tree一起渲染出来
 */

// ! 3 navigator.sendBeacon(url, data)
// 第二个参数是所要发送的数据（可选），可以是任意类型（字符串、表单对象、二进制对象等等
// sendBeacon 如果成功进入浏览器的发送队列后，会返回true；如果受到队列总数、数据大小的限制后，会返回false。返回true后，只是表示进入了发送队列，浏览器会尽力保证发送成功，但是否成功了，不会再有任何返回值。
/*
 * 优势 
    相较于img标签，使用navigator.sendBeacon会更规范，数据传输上可传输资源类型会更多。
    对于ajax在页面卸载时上报，ajax有可能没上报完，页面就卸载了导致请求中断，因此ajax处理这种情况时必须作为[同步]操作——xhr.open("POST", "/log", false); // third parameter indicates sync xhr. :(
    ~ sendBeacon是异步的，不会影响当前页到下一个页面的跳转速度，且不受同域限制。
    ~ 这个方法还是异步发出请求，但是请求与当前页面脱离关联，作为浏览器的任务，因此可以保证会把数据发出去，不拖延卸载流程。
    ~ 低优先级，sendBeacon 是低优先级的，它不会影响页面的其他网络请求

  *  缺点
   *  只能是 post 请求，不支持 get
   * 兼容性问题：旧的浏览器不支持
   * 发送的请求没有返回值，不能接收服务器的响应

 */
// ! 本项目 ajax
function xhr(e, t, n) {
  var i = win.ActiveXObject
    ? new win.ActiveXObject("Microsoft.XMLHTTP")
    : new win.XMLHttpRequest();
  i.open("POST", e, !0),
    i.setRequestHeader("content-type", "application/json"),
    (i.timeout = 6e4),
    (i.onreadystatechange = function () {
      var e;
      4 === i.readyState &&
        200 === i.status &&
        ((e = [i.responseText]), n) &&
        n(e);
    }),
    i.send(JSON.stringify({ d: t }));
}


// ! 最优解：
// ~  优先navigator.sendBeacon，降级使用1x1像素gif图片，根据实际情况需要采用xhr。
import {isSupportSendBeacon} from './util'
const isSupportSendBeacon = () => window.navigator.sendBeacon !== undefined && typeof window.navigator.sendBeacon === 'function'

// 如果浏览器不支持 sendBeacon，就使用图片打点
const sendBeacon = (function(){
    if(isSupportSendBeacon()){
      return window.navigator.sendBeacon.bind(window.navigator)
    }
    const reportImageBeacon = function(url, data){
        reportImage(url, data)
    }
    return reportImageBeacon
})()

 function reportImage(url, data) {
    const img = new Image();
    img.src = url + '?reportData=' + encodeURIComponent(JSON.stringify(data));
}

