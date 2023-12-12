const path = require("path");
/**
 * 目前只支持alias以及externals属性
 * alias要使用唯一性标记，建议以bundle为标记
 * @type {{alias: {}, externals: []}}
 */
const taroEnv = process.env.TARO_ENV || "mini";
module.exports = {
  alias: {
    '@\/miniapp\/cwx': taroEnv.toUpperCase() !== 'H5' ? '@/miniapp' : path.resolve(__dirname, '../node_modules/@ctrip/taro-web/lib'),
  },
  externals: [],
  babelConfig: {
    plugins: []
  },
  copy: {
    patterns: []
  }
}
