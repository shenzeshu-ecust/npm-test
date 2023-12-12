"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var lit_1 = require("lit");
var decorators_js_1 = require("lit/decorators.js");
var LitClock = /** @class */ (function (_super) {
    __extends(LitClock, _super);
    function LitClock() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.date = new Date();
        _this.timerId = -1;
        return _this;
    }
    LitClock.prototype.connectedCallback = function () {
        var _this = this;
        _super.prototype.connectedCallback.call(this);
        this.timerId = setInterval(function () { return _this.tick(); }, 1000);
    };
    LitClock.prototype.tick = function () {
        this.date = new Date();
    };
    LitClock.prototype.render = function () {
        return (0, lit_1.html)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n            <div>\n                <h1>Hello</h1>\n                <h2>It is ", "</h2>\n            </div>\n        "], ["\n            <div>\n                <h1>Hello</h1>\n                <h2>It is ", "</h2>\n            </div>\n        "])), this.date.toLocaleTimeString());
    };
    LitClock.prototype.disconnectedCallback = function () {
        _super.prototype.disconnectedCallback.call(this);
        clearInterval(this.timerId);
    };
    __decorate([
        (0, decorators_js_1.state)()
    ], LitClock.prototype, "date", void 0);
    LitClock = __decorate([
        (0, decorators_js_1.customElement)('lit-clock')
    ], LitClock);
    return LitClock;
}(lit_1.LitElement));
var templateObject_1;
