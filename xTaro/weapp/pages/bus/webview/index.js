/*
 * @Author: jhyi jhyi@trip.com
 * @Date: 2023-07-03 17:10:43
 * @LastEditors: jhyi jhyi@trip.com
 * @LastEditTime: 2023-07-05 17:44:20
 * @FilePath: /bus/webview/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { CPage, __global, URLUtil, cwx, BusRouter } from '../common/index.js';

const MyWebView = require('../utils/webview').default;

const IndexWebView = {
  buildLink(options) {
    let url = decodeURIComponent(options.url);
    let urlComponent = URLUtil.parseURLParam(url);
    return {
      ...options,
      needLogin: true,
      needSocket: urlComponent.needSocket || '',
    };
  },
  prePageCallback(options) {
    console.log('options----', options);
  },
  onSocketMessage(msg, socketClient) {
    console.log('message------', msg);
    switch (msg.type) {
      case 'openOcr': {
        cwx.component.ocr(
          {
            bizType: 'BUS',
            title: '证件识别',
          },
          (result) => {
            console.log('ocr result', result);
            if (result && result.idCardNo) {
              this.showToast({
                icon: 'none',
                message: '识别成功, 请确认信息后保存',
              });
              this.socketClient.send({
                type: msg.type,
                response: result,
              });
            } else {
              this.showToast({
                icon: 'none',
                message: '未识别到证件请重试',
              });
            }
          }
        );
      }
    }
  },
  onSocketOpen(options, socketClient) {
    console.log('options------', options);
  },
  onSocketClose(options, socketClient) {
    console.log('options------', options);
  },
  onError: function (e, socketClient) {
    console.log('e------', e);
  },
};
Object.setPrototypeOf(IndexWebView, MyWebView);
IndexWebView.register();
