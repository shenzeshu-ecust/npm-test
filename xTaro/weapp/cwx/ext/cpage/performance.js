import {cwx} from "../../cwx";

const WHITE_LIST = ["onHide", "onUnload"];

/**
 * cwx 记录 onHide, onUnload 内部逻辑执行的耗时
 * begin: 从触发 BU 页面的生命周期开始
 * end: 到 BU 页面的生命周期内部逻辑执行结束
 * promise:
 * @param {*} param0
 *
 * @param { string } stage begin, end, promise
 * @param { string } lifeType 生命周期名称
 * @param { string } pagePath 页面路径
 * @param { * } funcRes BU 在生命周期内写的返回值
 * @returns
 */
export function sendUbtCutBackPage({begin, lifeType, pagePath, funcRes}) {
  try {
    if (!WHITE_LIST.includes(lifeType)) {
      return;
    }

    let diff = new Date().getTime() - begin;
    const sendUbt = createSendUbtFn({
      diff,
      pagePath
    });
    if (diff > 100) {
      sendUbt(lifeType);
    }

    if (Object.prototype.toString.call(funcRes) === "[object Promise]") {
      funcRes
        .then(function (res) {
          sendUbt(lifeType, {
            res,
            diff: new Date().getTime() - begin
          });
        })
        .catch(function (err) {
          sendUbt(lifeType, {
            err,
            diff: new Date().getTime() - begin
          });
          throw err;
        });
    }
  } catch (e) {

  }
}

const createSendUbtFn = function (baseOptions = {}) {
  return function (lifeType, options = {}) {
    let traceName = `wxapp_CPage_${lifeType}_consume_time_long`;
    if (options.type === "promise") {
      traceName = `wxapp_CPage_${lifeType}_promise_consume_time_long`;
    }
    delete options.type;
    cwx.sendUbtByPage.ubtDevTrace(traceName, {
      ...baseOptions,
      ...options
    });
  }

}
