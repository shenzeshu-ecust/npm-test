let BusCommons = require('../commons/index');
var Bus = (function () {
    var Bus = Object.create(
        {},
        {
            _: {
                get: function () {
                    return BusCommons._;
                },
                enumerable: true,
            },
            __global: {
                get: function () {
                    return BusCommons.__global;
                },
                enumerable: true,
            },
            cwx: {
                get: function () {
                    return BusCommons.cwx;
                },
                enumerable: true,
            },
            originCPage: {
                get: function () {
                    return BusCommons.originCPage;
                },
                enumerable: true,
            },
            CPage: {
                get: function () {
                    return require('./extend.js').default;
                },
                enumerable: true,
            },
            Pservice: {
                get: function () {
                    return BusCommons.Pservice;
                },
                enumerable: true,
                configurable: true,
            },
            BusRouter: {
                get: function () {
                    return BusCommons.BusRouter;
                },
                enumerable: true,
            },
            BusDetail: {
                get: function () {
                    return BusCommons.BusDetail;
                },
                enumerable: true,
            },
            URLUtil: {
                get: function () {
                    return BusCommons.URLUtil;
                },
                enumerable: true,
            },
            Utils: {
                get: function () {
                    return BusCommons.Utils;
                },
                enumerable: true,
            },
            cDate: {
                get: function () {
                    return BusCommons.cDate;
                },
                enumerable: true,
            },
            orderUtils: {
                get: function () {
                    return BusCommons.orderUtils;
                },
                enumerable: true,
            },
            BusConfig: {
                get: function () {
                    return BusCommons.BusConfig;
                },
                enumerable: true,
            },
            terminalBooking: {
                get: function () {
                    return require('./terminalBooking.js').default;
                },
                enumerable: true,
            },
            ImagePreFetch: {
                get: function () {
                    return require('./ImagePreFetch.js').default;
                },
                enumerable: true,
            },
            showCustomNaviBar: {
                get: function () {
                    return BusCommons.showCustomNaviBar;
                },
                enumerable: true,
            },
            BusShared: {
                get: function () {
                    return BusCommons.BusShared;
                },
                enumerable: true,
                configurable: true,
            },
            PageConfig: {
                get: function () {
                    return BusCommons.PageConfig;
                },
                enumerable: true,
            },
            ubt: {
                get: function () {
                    return BusCommons.ubt;
                },
                enumerable: true,
            },
            Storage: {
                get: function () {
                    return BusCommons.Storage;
                },
                enumerable: true,
            },
            PromiseBuilder: {
                get: function () {
                    return BusCommons.PromiseBuilder;
                },
                enumerable: true,
            },
            TaskScheduler: {
                get: function () {
                    return BusCommons.TaskScheduler;
                },
                enumerable: true,
            },
            Scheduler: {
                get: function () {
                    return BusCommons.Scheduler;
                },
                enumerable: true,
            },
            createEventManager: {
                get: function () {
                    return BusCommons.createEventManager;
                },
                enumerable: true,
            },
            EventManager: {
                get: function () {
                    return BusCommons.EventManager;
                },
                enumerable: true,
            },

            CityListDataUtils: {
                get: function () {
                    return require('./CityListDataUtils').default;
                },
                enumerable: true,
                configurable: true,
            },
            ubt: {
                get: function () {
                    return BusCommons.ubt;
                },
                enumerable: true,
            },
            traceStep: {
                get: function () {
                    return BusCommons.traceStep;
                },
                enumerable: true,
            },
        }
    );

    return Bus;
})();

module.exports = Bus;
