
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.hello = {}));
})(this, (function (exports) { 'use strict';

  const Validate = {
    /**
     * 手机号校验
     */
    mobileCheck: value => /^[1][3,4,5,7,8][0-9]{9}$/.test(value),
    /**
     * 身份证校验
     */
    IDCardCheck: value => /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(value),
    /**
     * 邮箱校验
     */
    emailCheck: value => /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(value)
  };

  // 解决toFixed保留小数的问题
  const formatToFixed = (money, decimals = 2) => {
    return (Math.round((parseFloat(money) + Number.EPSILON) * Math.pow(10, decimals)) / Math.pow(10, decimals)).toFixed(decimals);
  };
  const Format = {
    // 格式化金额展示： 12341234.246 -> $ 12,341,234.25
    formatMoney: (money, symbol = "", decimals = 2) => formatToFixed(money, decimals).replace(/\B(?=(\d{3})+\b)/g, ",").replace(/^/, `${symbol}`)
  };

  exports.Format = Validate;
  exports.Validate = Format;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
