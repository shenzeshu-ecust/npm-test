import { cwx } from '../../../../../../../cwx/cwx';
import detailtrace from '../../../../../common/trace/detailtrace';
const ratingIconList = Array(5).fill('https://pages.c-ctrip.com/hotels/wechat/img/ordercomment-score-default.png'); // 点评笑脸表情
// 评分描述
const ratingDesc = {
    leftDesc: '很差',
    rightDesc: '很满意'
};
// 点击位置：1打分 2关闭
const clickLocation = {
    SCORE: 1,
    CLOSE: 2
};
Component({
    properties: {
        encourageInfo: {
            type: Object,
            value: {}
        },
        orderId: {
            type: String,
            value: ''
        },
        showWaitComment: {
            type: Boolean,
            value: false
        },
        hotelInfo: {
            type: Object,
            value: {}
        },
        waitCommentExposeObj: {
            type: Object,
            value: {},
            observe: 'refreshExposeNode'
        }
    },
    data: {
        ratingIconList,
        ratingDesc
    },
    attached () {
        // 若自定义组件需要发曝光埋点，必须在attatch中初始化监听器，调用cwx.sendUbtExpose.observe(this);
        this.bindObserve();
    },
    methods: {
        closeWaitComment (e) {
            e && this.clickWaitCommentTrace(clickLocation.CLOSE);
            this.triggerEvent('closeWaitComment', { showWaitComment: false });
        },
        goToComment (e) {
            const self = this;
            const { orderId, hotelInfo: { hotelId, displayHotelName, biz } } = self.data;
            const index = e.currentTarget.dataset.index;
            const score = index + 1;
            self.clickWaitCommentTrace(clickLocation.SCORE);
            cwx.navigateTo({
                url: `../ordercommit/index?oid=${orderId}&hotelid=${hotelId}&hotelname=${displayHotelName}&biz=${biz}&score=${score}`,
                events: {
                    refreshWaitCommentStatus: function (needCloseWaitComment) {
                        if (needCloseWaitComment) {
                            self.closeWaitComment();
                        }
                    }
                }
            });
        },
        bindObserve () {
            cwx.sendUbtExpose.observe(this); // 在attached中绑定监听器
        },
        refreshExposeNode () {
            cwx.sendUbtExpose.refreshObserve(this); // 当组件中需要发曝光埋点的目标节点有变化时更新
        },
        // 待点评卡片点击埋点
        clickWaitCommentTrace (clickLocation) {
            const currentPage = cwx.getCurrentPage() || {};
            const { orderId = '', hotelInfo: { hotelId = 0 } } = this.data;
            detailtrace.waitCommentClick(currentPage, {
                masterhotelid: hotelId,
                orderid: orderId,
                page: currentPage.pageId,
                clicklocation: clickLocation
            });
        }
    }
});
