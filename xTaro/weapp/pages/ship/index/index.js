import { cwx, CPage } from '../../../cwx/cwx.js';
CPage({
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        cwx.redirectTo({
            url: '/pages/bus/index/index?selectedTab=1',
        });
    },
});
