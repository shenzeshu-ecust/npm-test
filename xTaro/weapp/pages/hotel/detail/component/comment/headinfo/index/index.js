import commentClickPos from '../../comment.js';
Component({
    properties: {
        commentRating: {
            type: Object,
            value: {}
        },
        rateDesc: {
            type: Array,
            value: {}
        },
        similarCommentRating: {
            type: Object,
            value: {}
        },
        hasSimComment: {
            type: Boolean,
            value: false
        }
    },
    data: {},
    attached () {},
    methods: {
        clickCommentTab (e) {
            const { type } = e.currentTarget.dataset;
            const STATISTIC_SIMILAR_TYPE = 'statistic_similar'; // 相似点评类型
            // 点击类型 6相似点评 5全部点评
            const position = type === STATISTIC_SIMILAR_TYPE ? commentClickPos.SIMILAR_COMMENT : commentClickPos.ALL_COMMENT;
            this.triggerEvent('clickCommentTab', { type, position });
        }
    }
});
