const BLUR_TYPE = 0; // 未输入状态type
const INPUT_TYPE = 1; // 输入评论
Component({
    properties: {
        commentPoints: {
            type: Array,
            value: []
        },
        placeholderText: {
            type: String,
            value: ''
        },
        imageLength: {
            type: Number,
            value: 0,
            observer: 'getBlurTip'
        },
        videoTime: {
            type: Number,
            value: 0,
            observer: 'getBlurTip'
        },
        wellCommentThreshold: {
            type: Object
        }
    },
    data: {
        defaultInputTip: '', // 默认输入态激励文案
        defaultBlurTip: '', // 默认非输入态激励文案
        commentText: '', // 输入的点评信息
        encourageTipArr: [] // 激励文案
    },
    attached () {
        const { commentPoints } = this.properties;
        const defaultInputTip = commentPoints.find(item => {
            return (item.type === INPUT_TYPE) && (item.start === 0) && (item.end === 0);
        })?.content || '';
        // todo：当前不支持视频上传，因此将视频上传相关文案删除；支持后可删除正则匹配内容
        // 正则匹配：删除/和$中间的字符串，不包含$
        const defaultBlurTip = commentPoints.find(item => item.type === BLUR_TYPE)?.content?.replace(/\/[^$]*(?=\$)/, '') || '';
        this.setData({
            defaultInputTip,
            defaultBlurTip,
            encourageTipArr: this.getHighLightText(defaultInputTip, '$')
        });
    },
    methods: {
        /**
         * 输入态和非输入态激励文案不一致
         */
        inputCommentText: function (e) {
            const commentText = e.detail.value?.trim() || '';
            this.triggerEvent('acceptInputComment', { comment: commentText });
            this.getInputTip(commentText);
        },
        inputCommentFocus (e) {
            const commentText = e.detail.value?.trim() || '';
            this.getInputTip(commentText);
            this.triggerEvent('acceptTraceType', { actionType: 6 });
        },
        /**
         * 获取输入态激励文案
         * @param commentText
         */
        getInputTip (commentText) {
            const { commentPoints } = this.properties;
            const matchComment = commentPoints.find(item => {
                const { start, end, type } = item;
                if (type !== 1) return false;
                return (commentText.length >= start) && (end === -1 || commentText.length <= end);
            });
            if (!matchComment) return;
            const { end, content } = matchComment;
            const encourageTip = content.replace('$n', `${end - commentText.length + 1}`);
            this.setData({
                commentText,
                encourageTipArr: this.getHighLightText(encourageTip, '$')
            });
        },

        getHighLightText (content = '', separator = '$') {
            return content.split(separator).map((text, index) => {
                return text && ({
                    content: text,
                    highLight: !!(index % 2)
                });
            }).filter(item => !!item);
        },
        inputCommentBlur () {
            this.getBlurTip();
            this.triggerEvent('acceptTraceType', { actionType: 6 });
            this.triggerEvent('acceptInputComment', { comment: this.data.commentText });
        },
        // 非输入态激励文案
        getBlurTip () {
            const { commentText, defaultBlurTip } = this.data;
            if (commentText.length < 5) return;
            const { imageLength, videoTime, wellCommentThreshold: threshold } = this.properties;
            const isImageMatch = imageLength >= threshold.imageLength;
            const isVideoMatch = videoTime >= threshold.videoTime;
            if (!isImageMatch && !isVideoMatch) {
                this.setData({
                    encourageTipArr: this.getHighLightText(defaultBlurTip)
                });
            } else {
                // 获得图视频奖励后，激励文案与输入态相同
                this.getInputTip(commentText);
            }
        }
    }
});
