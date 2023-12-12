import { cwx } from "../../cwx";

/**
 * 各类小程序平台通用的，从页面实例上获取页面路径的方法
 * @param page
 * @return pagePath
 */
export function getCurrentPageRouter(page) {
    const currentPage = page || cwx.getCurrentPage();
    return (
        (currentPage && currentPage.__route__) ||
        (currentPage && currentPage.route) ||
        ""
    );
}

export function getPagesRoute () {
  const pages = getCurrentPages() || [];
  let pagePaths = [];
  pages.forEach(function (p) {
      pagePaths.push(getCurrentPageRouter(p) || "");
  });
  return pagePaths
}

/**
 * todo, 修改一下方法，ubtKey 没必要传入
 * 检查当前页面堆栈长度，达到10时发送埋点
 * @param type 路由类型
 */
export function sendPageRoute({ type = "" }) {
    try {
        const pages = getCurrentPages() || [];
        if (pages.length < 10) {
            return;
        }
        let pagePaths = [];
        pages.forEach(function (p) {
            pagePaths.push(getCurrentPageRouter(p) || "");
        });
        cwx.sendUbtByPage.ubtDevTrace("weapp_cpage_onLoad_pageStack_reaches10", {
            count: pages && pages.length || 0,
            pagePaths: JSON.stringify(pagePaths),
            type,
        });
    } catch (error) {
        console.error(error);
    }
}

export default {
    getCurrentPageRouter,
    sendPageRoute,
};
