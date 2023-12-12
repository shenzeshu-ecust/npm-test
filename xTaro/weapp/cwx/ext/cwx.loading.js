/**
 * todo: 
 * 1. 支持以 Promise 的方式调用 需要测试一下
 * 2. catch 住报错
 * @param {*} options 
 */
export const hideLoading  = function (options = {}) {
  let calledWithPromise = true; // 任意一个回调存在，都不是以 Promise 的风格调用

  // 只判断 success, fail, complete 这3个回调函数
  for (let fnName of ["success", "complete", "fail"]) {
    if (typeof options[fnName] === "function") {
      calledWithPromise = false;
      break;
    }
  }
  if (!calledWithPromise) {
    const noop = function (err) {
      console.error("showLoading fail, err:", err)
    };
    options.fail = typeof options.fail === "function" && options.fail || noop;
  }
  const p = wx.hideLoading(options)
  if (calledWithPromise) {
    p && p.catch(err => {
      console.error("hideLoading 捕获到报错信息, err:", err)
    })
  }
  
  return p;
}