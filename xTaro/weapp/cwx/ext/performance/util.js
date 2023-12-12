import { __global } from "../../cwx";

let n = 0;

/**
 * 创建 guid
 * @param prefix 允许自定义，兜底值 miniapp
 * @returns {`${string}_${number}`}
 */
export const createGUID = function (prefix) {
  prefix = prefix || "miniapp";
  return `${prefix}_${n++}`;
}

/**
 * 校验 GUID 的有效性
 * @param { string } guid 
 * @param { object } cache 
 * @return { boolean } isValid: guid 是否有效
 */
export function checkValidGUID(guid, cache) {
  return guid && cache[guid];
}

/**
 * 从 options 中提取 url（获取不包含参数 且 无"/"前缀的 页面路径）
 * @param {*} options
 * @return { string } url
 */
export function getPagePathFromOpts (options) {
  let { url = "" } = options || {};
  try {
    const REG = /^(\/)?([^\?]+)/;
    if (url.match(REG)) {
      url = url.match(REG)[2]; 
    }
  } catch (e) {
    console.error("解析页面路径报错，e:", e);
  }
  return url;
}

/**
 * 给 options.url 添加路径参数
 * @param { object } options 
 * @param { object } queryMap 
 * @return { object } options
 */
export function addQueryToOptUrl (options, queryMap) {
  try {
    let { url = "" } = options;
    if (!url) {
      return options;
    }
    let query = url.split("?")[1] || "";
    for (let key in queryMap) {
      const REG = new RegExp("[\?&](" + key + "=[^&]*)", "g");
      query = query.replace(REG, "");
      query += (query ? "&" : "") + `${key}=${queryMap[key]}`;
    }

    options.url = `${url.split("?")[0]}?${query}`;
  } catch (e) {
    console.error("添加页面参数报错，e:", e);
  }
  return options;
}

export const getCommonInfo = function () {
  return {
    mcdAppId: __global.mcdAppId,
    version: __global.version, // 小程序版本
  }
}