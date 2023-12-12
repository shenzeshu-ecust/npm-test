// {{page}}.js
import { cwx, CPage } from '../../../../cwx/cwx.js';
cwx.config.init();
CPage({
  checkPerformance: true, // 添加标志位

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let keys = Object.keys(options);
    let param = '';
    keys.forEach(function (key, index) {
      // console.log('遍历 options, index:', index, 'key:', key, 'value:', options[key]);
      let value = options[key];
      if (Object.prototype.toString.call(value) == '[object Object]') {
        let mirrorVal = {
          ...value,
        };
        try {
          value = JSON.stringify(mirrorVal); // 处理入参 options 的 属性值为 object
        } catch (error) {
          value = options[key];
        }
      }
      param = param + (index === 0 ? '?' : '&') + key + '=' + value;
    });
    cwx.sendUbtByPage.ubtDevTrace('lvpai_shareimage', true);

    cwx.redirectTo({
      url: '/pages/ugc/lvpai/shareImage/shareImage' + param,
    });
  },
});
