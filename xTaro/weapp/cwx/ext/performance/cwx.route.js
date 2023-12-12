// 【1期】：页面栈达到10时，再调用会增加页面栈数量的API时，发埋点，默认做redirectTo，允许开发者自定义页面栈溢出时的处理方式
import cwx from "../../cwx";
import { createRouteBegin } from "./checkFCP";
import { getPagesRoute } from "./cwx.getPageRoute"
import { checkNeedIntercept } from "../perInfoProtect/checkRediToGuide";

function sendUbt (ubtKeyName, toUrl) {
  try {
    cwx.sendUbtByPage.ubtDevTrace(ubtKeyName, {
      to: toUrl, 
      routes: JSON.stringify(getPagesRoute()),
    },{
      callback: function (res) {
        console.log(res)
      }
    });
  } catch (e) {
    console.error(e)
  }
}

const routeFnMap = function wrapRouteFns () {
  const noop = function () {
    return new Promise(function (resolve) {
      resolve()
    })
  };
  const routeFns = [
    "switchTab",
    "reLaunch",
    "redirectTo",
    "navigateTo",
    "navigateBack"
  ]
  const processOptFns = [
    "reLaunch",
    "redirectTo",
    "navigateTo",
  ]
  let fnMap = {}
  
  routeFns.forEach(function (fn) {
    const newFn = function (options = {}) {
      // 使用 个保整改三期 组件方案 时，这里不能做拦截：如果拦截，用户点击同意后，可能会停留在一个白屏页面
      if (!cwx.checkUsePerInfoProtectComponent() && checkNeedIntercept(options)) {
        console.log("%c 此时用户未同意授权，仅可跳转至白名单内的页面，但即将跳转的 url 不在白名单内：", "color:red", options.url)
        return;
      }

      if (fn === "navigateTo" && getCurrentPages().length >= 10) {
        // 开发者可通过 options 入参自定义后续处理方式
        if (typeof options.overflowPageStack === "function") {
          sendUbt("miniapp_route_custom_overflowPageStack", options.url || "")
          options.overflowPageStack(options)
          return;
        }
        fn = "redirectTo";
        sendUbt("miniapp_route_modified_navi_to_redi", options.url || "")
      }
      cwx.Observer.noti("cwx_route_start", {
        ...options,
        routeType: fn,
        cRouteBegin: Date.now()
      })
      if (processOptFns.includes(fn)) {
        options = createRouteBegin(fn, options);
      }
      return (wx[fn] || noop)(options);
    }
    fnMap[fn] = newFn;
  })
  return fnMap;
}()

export default routeFnMap;