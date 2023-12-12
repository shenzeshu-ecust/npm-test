const ratingIconList = Array(5).fill('https://pages.c-ctrip.com/hotels/wechat/img/ordercomment-score-default.png'); // 点评笑脸表情
Component({
    properties: {
        ratingDescList: {
            type: Array,
            value: []
        },
        ratingType: {
            type: String,
            value: ''
        }
    },
    data: {
        ratingIconList
    },
    methods: {
        handleRatingIcon (e) {
            const idx = e.target.dataset.index;
            const { ratingDescList, ratingType } = this.data;
            const ratingIconList = this.getScoreIcons(5, idx + 1);
            const ratingNumberList = {
                [ratingType]: idx + 1,
                ratingType
            };
            const ratingDesc = `${ratingNumberList[ratingType]}分 / ${ratingDescList[idx]}`;
            this.setData({
                ratingIconList,
                ratingNumberList,
                ratingDesc
            });
            this.triggerEvent('handleRatingIcon', { ratingNumberList });
            this.triggerEvent('acceptTraceType', { actionType: 2 });
        },
        getScoreIcons (maxScore, score) {
            const url = 'https://pages.c-ctrip.com/hotels/wechat/img/';
            return [...Array(score).fill(`${url}ordercomment-score-${score}.png`), ...Array(maxScore - score).fill(`${url}ordercomment-score-default.png`)];
        }
    }
});
