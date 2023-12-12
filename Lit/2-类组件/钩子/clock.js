"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClockController = void 0;
var ClockController = /** @class */ (function () {
    function ClockController(host) {
        this.interval = 0;
        this.date = new Date();
        this.host = host;
        host.addController(this);
    }
    ClockController.prototype.hostConnected = function () {
        var _this = this;
        this.interval = setInterval(function () { return _this.tick(); }, 1000);
    };
    ClockController.prototype.tick = function () {
        this.date = new Date();
        // ~  告知托管组件运行更新生命周期。
        this.host.requestUpdate();
    };
    ClockController.prototype.hostDisconnected = function () {
        clearInterval(this.interval);
    };
    ClockController.prototype.hostUpdate = function () {
    };
    ClockController.prototype.hostUpdated = function () {
    };
    return ClockController;
}());
exports.ClockController = ClockController;
