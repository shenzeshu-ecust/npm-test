import { cwx, CPage } from '../../../cwx/cwx.js';
CPage({
  onLoad: function (options) {
    console.log('options', options);

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
    cwx.sendUbtByPage.ubtDevTrace('user', true);
    cwx.redirectTo({
      url: '/pages/ugc/user/index' + param,
    });
  },
});
