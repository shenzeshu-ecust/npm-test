import { cwx } from "../cwx";

class CPage_Module_Base {
    constructor(options) {
        var _this = this;
        var c = 0;
        for (var key in options){
            if (options.hasOwnProperty(key)){
                switch (key){
                    case 'onLoad':
                    case 'onReady':
                    case 'onShow':
                    case 'onHide':
                    case 'onUnload':
                        this['__' + key] = options[key];
                        break;
                    default:
                        this[key] = options[key];
                        break;
                }
            }
        }

        let __global = require('../ext/global.js').default;
        var CPage = __global.CPage;
		this.__isComponent = !!CPage.__isComponent;

        wrapLifeCycle(this, 'onLoad', true);
        wrapLifeCycle(this, 'onReady', false);
        wrapLifeCycle(this, 'onShow', false);
        wrapLifeCycle(this, 'onHide', false);
        wrapLifeCycle(this, 'onUnload', true);
    };
};

function wrapLifeCycle(cpage, type, isOnce){
    var __type = '__' + type;
    var fn = cpage[type];
    var invoked = false;
    cpage[type] = function(){
        var args = Array.prototype.slice.call(arguments, 0);
        if (!isOnce || isOnce && !invoked){
            invoked = true;
            if (type == 'onLoad'){
                cpage.__page = this;
                this.__cpage = cpage;
            }
            fn && fn.apply(cpage, args);
        }
        if (type === 'onLoad' && !cwx.checkInTimeline()) {
          // 处理参数值：如果有 enterQueryGUID, 换真实的参数值
          if (args && args[0] && args[0].enterQueryGUID) {
            console.log("%c [base.js] args[0] 111", "color:red;", args[0])
            const enterQuery = cwx.getEnterQueryByGUID(args[0].enterQueryGUID);
            if (enterQuery) {
              Object.assign(args[0], enterQuery)
              console.log("%c [base.js] args[0] 222", "color:red;", args[0])
            }
          }
          // 个人信息保护指引相关处理：不是 个保指引页，并且用户未同意授权，则需要重定向至 个保指引页
          // 20230626 新增：组件级别个保整改方案 仅设置页面实例标志位，不在框架层面做其他处理
          if(!cwx.checkRediToGuide({
            isPIPGPage: this.isPIPGPage,
            isForceShowAuthorization: this.isForceShowAuthorization,
            pagePath: cwx.getCurrentPageRouter(this),
            pageQuery: args && args[0] || {}
          })) {
            // 主板小程序（除快手、快应用外），使用 组件级别的个保整改方案，使用特定的标识位
            if (cwx.checkUsePerInfoProtectComponent()) {
              this.isShowGuideComponent = true;
            } else {
              this.isRediToGuide = true;
              return;
            }
          }
        }
        // 1. BU主动入参，控制：如果是在朋友圈打开，是否执行业务生命周期逻辑；
        // 2. 重定向到个保指引页的首屏页面，不执行业务生命周期
        if (this.isRediToGuide || (this.stopRunLifeInTL && cwx.checkInTimeline())) {
            return;
        }
        cpage[__type] && cpage[__type].apply(this, args); 
    };
}

export default CPage_Module_Base;