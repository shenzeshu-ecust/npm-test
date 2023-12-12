import { cwx } from '../../../../../cwx/cwx.js';
import detailtrace from '../../../common/trace/detailtrace';
// 点击位置类型: 1点评标签 2展开 3收起 4图视频 5全部点评 6偏好相似点评
const commentClickPos = {
    COMMENT_TAG: '1',
    CONTENT_OPEN: '2',
    CONTENT_FOLD: '3',
    MEDIA: '4',
    ALL_COMMENT: '5',
    SIMILAR_COMMENT: '6'
};
Component({
    properties: {
        enable: {
            type: Boolean,
            value: false
        },
        commentRating: {
            type: Object,
            value: {}
        },
        similarCommentRating: {
            type: Object,
            value: {}
        },
        rateDesc: {
            type: Array,
            value: []
        },
        hasSimComment: {
            type: Boolean,
            value: false
        },
        commentTags: {
            type: Array,
            value: []
        },
        comment: {
            type: Object,
            value: {}
        },
        commentExposeObj: {
            type: Object,
            value: {},
            observe: 'refreshExposeNode'
        },
        gqlWaitComment: {
            type: Object,
            value: {}
        }
    },
    data: {
        showCommentInfo: false,
        isShowVideoBtn: true
    },
    attached () {
        // 若自定义组件需要发曝光埋点，必须在attatch中初始化监听器，调用cwx.sendUbtExpose.observe(this);
        cwx.sendUbtExpose.observe(this);
    },
    methods: {
        toggleCommentInfo (e) {
            const { showCommentInfo } = this.data;
            this.setData({
                showCommentInfo: !showCommentInfo
            });
            // 点击类型 3收起 2展开
            const position = showCommentInfo ? commentClickPos.CONTENT_FOLD : commentClickPos.CONTENT_OPEN;
            this.clickCustomerCommentTrace(position);
        },
        toPreviewMedia (e) {
            const { idx } = e.currentTarget.dataset;
            const { comment } = this.data;
            const allMediaList = comment?.mediaInfo?.allMediaList;
            const url = allMediaList[idx];
            if (!url) return;
            this.setData({
                isShowVideoBtn: false
            });
            // 发送点击埋点，点击类型 4图视频
            this.clickCustomerCommentTrace(commentClickPos.MEDIA);
            cwx.previewMedia({
                sources: allMediaList,
                current: idx,
                url,
                complete: () => {
                    this.setData({
                        isShowVideoBtn: true
                    });
                },
                fail: () => {
                    this.errorVideo();
                }
            });
        },
        errorVideo () {
            cwx.showModal({
                title: '温馨提示',
                content: '播放失败',
                showCancel: false,
                confirmText: '关闭'
            });
        },
        clickComment (type, id, value) {
            this.triggerEvent('clickComment', { type, id, value });
        },
        parentClickComment (e) {
            const { type, position } = e.currentTarget.dataset;
            this.clickCustomerCommentTrace(position);
            this.clickComment(type);
        },
        childClickComment (e) {
            const { id, value, type, position } = e.detail;
            this.clickCustomerCommentTrace(position);
            this.clickComment(type, id, value);
        },
        closeWaitComment (e) {
            const { showWaitComment } = e.detail;
            this.setData({
                'gqlWaitComment.showWaitComment': showWaitComment
            });
        },
        refreshExposeNode () {
            cwx.sendUbtExpose.refreshObserve(this); // 当组件中需要发曝光埋点的目标节点有变化时更新
        },
        // 住客评价点击埋点
        clickCustomerCommentTrace (position) {
            const currentPage = cwx.getCurrentPage() || {};
            const { comment } = this.data;
            // 点击位置类型: 1点评标签 2展开 3收起 4图视频 5全部点评 6偏好相似点评
            const clickPosition = Number(position);
            detailtrace.customerCommentClick(currentPage, {
                page: this.pageId,
                masterhotelid: comment?.hotelId,
                clickposition: clickPosition,
                commentId: comment?.id
            });
        }
    }
});
export default commentClickPos;
