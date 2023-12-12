import { cwx } from '../../../../cwx/cwx';
import storage from '../../common/utils/storage.js';

Component({
    data: {
        showCollect: false,
        collectPointerLeft: 0 // 收藏引导指示位置动态px
    },

    attached () {
        this.showCollection();
    },

    methods: {
        // 判断展示收藏小程序浮窗
        showCollection: function () {
            if (!this.data.showCollect) {
                storage.setStorage('P_HOTEL_COLLECTION_GUIDE_OPEN', true, 24 * 30);

                // 获取右上按钮位置以对齐
                const topMenu = wx.getMenuButtonBoundingClientRect();
                let collectPointerLeft = 290;
                if (topMenu) {
                    collectPointerLeft = topMenu.left + Math.round(topMenu.width / 4) - 7;
                }

                this.setData({
                    showCollect: true,
                    collectPointerLeft
                });

                // 7s后自动消失
                setTimeout(() => {
                    this.data.showCollect && this.closeCollection();

                    // 曝光埋点
                    const tPage = cwx.getCurrentPage() || {};
                    this.collectionTrace('158420', tPage);
                }, 7000);
            }
        },

        // 关闭收藏小程序的浮窗提示
        closeCollection: function (e) {
            this.setData({
                showCollect: false
            });
            // 点击埋点
            const tPage = cwx.getCurrentPage() || {};
            !this.data.showCollect && e && this.collectionTrace('158421', tPage);
        },

        collectionTrace: function (id, page) {
            try {
                page.ubtTrace && page.ubtTrace(id, {
                    scene_value: cwx.scene
                });
            } catch (e) {
                // ignore
            }
        }
    }
});
