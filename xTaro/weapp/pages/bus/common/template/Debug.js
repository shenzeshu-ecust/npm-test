// pages/bus/common/template/Coupon.js
import { _, cwx, BusRouter } from '../../index.js';
class Debug {
    constructor(page) {
        this.page = page;
        this.page.debugIconMove = this.debugIconMove.bind(this);
        this.page.debugIconClicked = this.debugIconClicked.bind(this);
    }
    get data() {
        return (this.page && this.page.data) || {};
    }
    debugIconMove(e) {
        console.log(e);
    }
    debugIconClicked(e) {
        console.log(e);
        // 进入测试页面
        BusRouter.navigateTo('router', {
            isDebug: true,
        });
    }
}

Debug.prototype.setData = function () {
    this.page && this.page.setData.apply(this.page, arguments);
};

export default Debug;
