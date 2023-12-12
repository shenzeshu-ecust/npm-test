import { cwx } from '../../../../cwx/cwx';

Component({
    properties: {
        recommendDateList: {
            type: Array,
            value: []
        },
        hotelId: {
            type: String
        }
    },
    data: {
        // 组件是否位于详情页
        fromDetail: false
    },
    attached () {
        const currentPage = cwx.getCurrentPage();
        // 详情页的pageName
        const detailPageName = 'hotelDetail';
        this.setData({
            fromDetail: currentPage.pageName === detailPageName
        });
    },
    methods: {
        /**
         * 跳转酒店详情页
         * @param e - event
         */
        toDetail (e) {
            const { idx } = e.currentTarget.dataset;
            const { recommendDateList, hotelId } = this.properties;
            if (!hotelId) return;
            const { checkIn, checkOut } = recommendDateList[idx];
            this.triggerEvent('recommendDateToDetail', {
                hotelId,
                checkIn,
                checkOut
            });
        },
        /**
         * 更新入离日期
         * @param e - event
         */
        updateDate (e) {
            const { idx } = e.currentTarget.dataset;
            const { recommendDateList } = this.properties;
            const { checkIn, checkOut } = recommendDateList[idx];
            this.triggerEvent('updateDate', {
                checkIn,
                checkOut
            });
        }
    }
});
