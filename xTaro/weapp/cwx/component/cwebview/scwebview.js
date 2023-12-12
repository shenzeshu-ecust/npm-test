/**
 * swebview组件
 * @module cwx/CWebview
 */

import CWebviewBase from 'CWebviewBaseClass.js';
import {
  cwx,
  __global
} from '../../cwx.js';

class CWebview extends CWebviewBase {
  onShareAppMessage = null;
  type = "scwebview";
  feature = 'middlePage'; // 标记了这个 webview 页面的功能，若为 middlePage，将不会执行 cwebviewBaseClass 的 onLoad 解析参数等逻辑，预防报错和其他不可预知的问题
  preOnLoad = function (options) {
    let keys = Object.keys(options);
    let url = __global.scwebview.targetPagePath; // 兜底值，实际还会异步动态从 MCDConfig 中获取
      keys.forEach(function (key, index) {
        console.log('遍历 options, index:', index, 'key:', key, 'value:', options[key]);
        let value = options[key];
        if (Object.prototype.toString.call(value) == '[object Object]') {
          let mirrorVal = {
            ...value
          };
          try {
            value = JSON.stringify(mirrorVal); // 处理入参 options 的 属性值为 object
          } catch (error) {
            value = options[key];
          }
        }
        url = url + (index === 0 ? '?' : '&') + key + '=' + value;
      })
      console.log('最终重新拼接得出的url:', url);
      wx.redirectTo({
        url: url
      })
  }
  constructor(props) {
    super(props);
    this.data.pageId = "10650059679"
  }
}
new CWebview().register();