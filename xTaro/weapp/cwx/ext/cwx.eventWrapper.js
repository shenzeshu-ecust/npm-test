import {cwx} from "../cwx.js"

function __ubt_isEvent(args, __ubt_events, eventType) {
    const evt = args[0];
    let eventTypeArr = ['tap', 'longpress', 'longtap', 'back'];
    if(typeof eventType !== 'undefined') {
        eventTypeArr.push(eventType);
    }

    let ret = !!(evt
        && evt.timeStamp
        && eventTypeArr.includes(evt.type)
        && !__ubt_events.hasOwnProperty(evt.type + '_' + evt.timeStamp)
        && evt.target
        && evt.currentTarget);

    if(evt && evt.type === 'back') {
        return ret;
    }
    ret = ret && evt.touches && evt.touches[0]
    return ret;
        
}
function __ubt_getPageInfo (context){
    var ret = {};
    
    const currentPage = context || cwx.getCurrentPage();
    if (currentPage.__isComponent){
        var ins = currentPage.__page;
        while (!ins.__isComponent){
            ins = ins.__page;
        }
        ret.pageId = '' + (ins.pageId || ins.pageid || '0');
    }else{
        ret.pageId = '' + (currentPage.pageId || currentPage.pageid || '0');
    }
    return ret;
};
function __ubt_logTap(evt, fn, context) {
    const key = evt.type + '_' + evt.timeStamp;
    context.__ubt_events[key] = true;
    setTimeout(function () {
        delete context.__ubt_events[key];
    }, 1000);
    const ubtEvt = __ubt_getPageInfo(context);
    ubtEvt.type = evt.type;
    ubtEvt.xpath = '//Page';
    // currentTarget
    if (!cwx.util.compare(evt.currentTarget, evt.target)) {
        ubtEvt.xpath += '/CurrentTarget';
        let currentTargetId = evt.currentTarget.id;
        if (currentTargetId) {
            ubtEvt.xpath += '[@id=' + currentTargetId + ']';
        }
        let currentTargetCid = evt.currentTarget.dataset['ubtKey'];
        if (currentTargetCid) {
            ubtEvt.xpath += '[@cid=' + currentTargetCid + ']';
        }
    }
    // target
    ubtEvt.xpath += '/Target';
    const targetId = evt.target.id;
    if (typeof fn === 'string') {
        ubtEvt.xpath += '[@fn=' + fn + ']';
    }
    if (targetId) {
        ubtEvt.xpath += '[@id=' + targetId + ']';
    }
    const targetCid = evt.target.dataset['ubtKey'];
    if (targetCid) {
        ubtEvt.xpath += '[@cid=' + targetCid + ']';
    }
    ubtEvt.xpath += evt.touches && evt.touches.length ? '[@x=' + evt.touches[0].pageX + ']' : '[@x=]';
    ubtEvt.xpath += evt.touches && evt.touches.length ? '[@y=' + evt.touches[0].pageY + ']' : '[@y=]';

    if (cwx.config.ubtDebug) {
        console.log('UBT Page Event', ubtEvt);
    }

    context.__ubt_instance && context.__ubt_instance.send('useraction', {
        action: 'click',
        ts: +new Date(),
        xpath: ubtEvt.xpath
    });
}

export const uploadUserAction = function (evt, fnName, context, eventType) {
    //此处时log User Action
    let currentPage = context || cwx.getCurrentPage();
    if (currentPage.__cpage) {
        currentPage = currentPage.__cpage;
    }
    if (!currentPage.__ubt_events) {
        currentPage.__ubt_events = {};//事件触发缓存
    }
    if (__ubt_isEvent(arguments, currentPage.__ubt_events, eventType)) {
        __ubt_logTap(evt, fnName, currentPage);
    }
}
export default function eventWrapper(name, fn, isLogEvent, context, eventType) {
    //只需要绑定事件时的页面即可
    const currentPage = context || cwx.getCurrentPage();
    if (!currentPage) {
        //此处做个兼容处理，避免page没有时报错，需要加个埋点
        return fn
    }
    if (!currentPage.__ubt_events) {
        currentPage.__ubt_events = {};//事件触发缓存
    }
    currentPage[name] = function (evt) {
        //此处时log User Action
        if (isLogEvent && arguments.length === 1 && __ubt_isEvent(arguments, currentPage.__ubt_events, eventType)) {
            __ubt_logTap(evt, name, currentPage);
        }
        //执行并且将错误采集
        const args = Array.prototype.slice.call(arguments, 0);
        let ret;
        if (fn) {
            try {
                ret = fn.apply(currentPage, args);
            } catch (e) {
                // 错误数据收集
                try {
                    if (typeof e == 'string') {
                        e = new Error(e);
                    }

                    const obj = {
                        message: e && e.message,
                        file: 0,
                        category: 'inner-error',
                        framework: 'normal',
                        time: 0,
                        line: 0,
                        column: 0,
                        stack: e && e.stack && e.stack.split('\n'),
                        repeat: 1
                    }

                    currentPage.__cpage.__ubt_instance.send('error', obj);
                } catch (e) {
                }
                if (cwx.util.isDevice()) {
                    setTimeout(function () {
                        throw e;
                    }, 0);
                } else {
                    throw e;
                }
            }
        }
        return ret;
    };
    return currentPage[name];
}