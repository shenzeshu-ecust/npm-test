// babel-preset-taro 更多选项和默认值：
// https://github.com/NervJS/taro/blob/next/packages/babel-preset-taro/README.md
var taroConfig = require('./config/initConfig');

var configObj = {
  presets: [
    ['taro', {
      framework: process.env.FRAMEWORK  === 'PReact' ? 'preact' : 'react',
      ts: true,
      hot: false
    }]
  ]
}
if (taroConfig && taroConfig.babelConfig && taroConfig.babelConfig.plugins && taroConfig.babelConfig.plugins.length) {
  configObj["plugins"] = taroConfig.babelConfig.plugins;
}

module.exports = configObj;
