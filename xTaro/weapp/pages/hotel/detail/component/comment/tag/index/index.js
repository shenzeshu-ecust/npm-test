import commentClickPos from '../../comment';
Component({
    properties: {
        commentTags: {
            type: Array,
            value: []
        }
    },
    data: {},
    attached () {},
    methods: {
        clickCommentTags (e) {
            const { id, value } = e.currentTarget.dataset;
            // 点击类型 1点评标签
            const position = commentClickPos.COMMENT_TAG;
            this.triggerEvent('clickCommentTags', { id, value, position });
        }
    }
});
