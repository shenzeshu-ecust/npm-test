/**
 * @Author: jhyi jhyi@trip.com
 * @Date: 2022-12-06 23:50:19
 * @LastEditTime: 2022-12-06 23:50:20
 * @LastEditors: jhyi jhyi@trip.com
 * @Description:
 * @FilePath: /taro-bus/src/pages/bus/common/createEventManager.js
 * @
 */

const createEventManager = function (ctx, isPublic) {
    let events = {};

    function $on(name, listener) {
        events[name] = events[name] || [];
        events[name].push(listener);
        return ctx;
    }

    function $emit(name, ...args) {
        const listeners = events[name];
        if (listeners) {
            listeners.forEach((listener) => listener.apply(ctx, args));
        }
        return ctx;
    }

    function $off(name, callback) {
        // all
        if (!arguments.length) {
            events = Object.create(null);
            return ctx;
        }
        // 特定事件
        const listeners = events[name];
        if (!listeners) {
            return ctx;
        }
        if (arguments.length === 1) {
            events[name] = null;
            return ctx;
        }
        // 特定回调
        listeners.some((listener, i) => {
            if (listener === callback) {
                listeners.splice(i, 1);
                return true;
            }
        });
        return ctx;
    }

    function $once(name, listener) {
        function on() {
            $off(name, on);
            listener.apply(ctx, arguments);
        }

        $on(name, on);
        return ctx;
    }

    return isPublic
        ? {
              isPublic,
              on: $on,
              emit: $emit,
              off: $off,
              once: $once,
          }
        : {
              isPublic,
              $on,
              $emit,
              $off,
              $once,
          };
};

const EventManager = createEventManager(void 0, true);

export default {
    createEventManager,
    EventManager,
};

export { createEventManager, EventManager };
