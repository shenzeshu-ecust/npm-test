import { CPage, cwx } from '../../../cwx/cwx.js';
import trace from '../common/trace/ordercommittrace';
import reqUtil from './requtil';

CPage({
    pageId: 10650088112,
    data: {
        commentSuccessInfo: {
            showPage: false,
            title: '',
            subTitle: '',
            totalCount: 0,
            encourageText: '',
            waitCommentList: [],
            loadingState: 0 // 0: 初始状态，1: 加载中, 2: 已全部加载
        }
    },
    pageStatus: {
        // 待点评列表分页信息
        commentPageInfo: {
            curPage: 1,
            pageSize: 7,
            totalCount: 0
        },
        loadingState: 0 // 0: 初始状态，1: 加载中, 2: 已全部加载
    },
    onLoad: function (options) {
        this.options = options;
        const { title, subtit, commentid, oid } = options;
        this.setData({
            'commentSuccessInfo.title': this.processHighlight(title),
            'commentSuccessInfo.subTitle': subtit
        });
        trace.commentExposure(this, {
            pageId: '10650088112',
            orderId: oid,
            commentId: commentid
        });
        this.loadComments();
    },
    loadComments: function () {
        if (this.pageStatus.loadingState > 0) return;
        const { curPage, pageSize } = this.pageStatus.commentPageInfo;
        const { waitCommentList: waitCommentListBefore } = this.data.commentSuccessInfo;
        const reqData = {
            pageIndex: curPage,
            pageSize
        };
        this.setData({ 'commentSuccessInfo.loadingState': 1 });
        this.pageStatus.loadingState = 1;
        reqUtil.waitCommentList(
            reqData,
            (data) => {
                const waitCommentInfo = data.waitCommentInfo || {};
                const waitCommentList = data.waitCommentList || [];
                const { totalCount = 0, encourageText = '' } = waitCommentInfo;
                if (totalCount > 0) {
                    this.setData({
                        'commentSuccessInfo.totalCount': totalCount
                    });
                    this.pageStatus.commentPageInfo.totalCount = totalCount;
                }
                if (waitCommentList.length) {
                    this.pageStatus.commentPageInfo.curPage = curPage + 1;
                }
                for (let i = 0; i < waitCommentList.length; i++) {
                    trace.commentCardExposure(this, {
                        pageId: '10650088112',
                        orderId: waitCommentList[i].orderId
                    });
                }
                const waitCommentListAfter = waitCommentListBefore.concat(waitCommentList.map(
                    (i) => ({
                        ...i,
                        encourageText: this.processHighlight(i.encourageInfo?.writingCommentTip || '')
                    })
                ));
                this.pageStatus.loadingState = waitCommentListAfter.length < this.pageStatus.commentPageInfo.totalCount ? 0 : 2;
                this.setData({
                    'commentSuccessInfo.loadingState': waitCommentListAfter.length < this.pageStatus.commentPageInfo.totalCount ? 0 : 2, // 若当页点评数不足totalCount 表示还可以继续加载
                    'commentSuccessInfo.encourageText': encourageText,
                    'commentSuccessInfo.waitCommentList': waitCommentListAfter
                });
            },
            (e) => {
                this.pageStatus.loadingState = 0;
                this.setData({ 'commentSuccessInfo.loadingState': 0 });
            }
        );
    },

    gotoComment: function (e) {
        const { commentinfo } = e.currentTarget.dataset;
        const { orderId, hotelId, hotelName } = commentinfo;
        const _search = '?oid=' + orderId + '&hotelid=' + hotelId + '&hotelname=' + hotelName;
        trace.commentCardSubmit(this, {
            pageId: this.pageId,
            orderId
        });
        cwx.redirectTo({
            url: '../ordercommit/index' + _search
        });
    },

    commentFillingClickTrace: function (actionType, isSubmit) {
        const logData = {
            pageId: '10650078883',
            orderId: this.options.orderId,
            actionType,
            commentChar: this.data.commentText,
            isSubmit
        };
        trace.commentFillingClick(this, logData);
    },
    processHighlight (str) {
        const orangeReg = /&#(.*?)&#/g;
        return str
            .replace(orangeReg, (item) => {
                const text = item.replace(/&#/g, '');
                return `<span class="orange-txt">${text}</span>`;
            });
    }
});
