Component({
    properties: {
        priceCalcItems:{
            type: Array,
            value: [],
            observer: 'setPriceCalcTag'
        },
        hideIcon: {
            type: Boolean,
            value: false
        },
        fromLS: {
            type: Boolean,
            value: false
        },
        scanPriceTag: {
            type: String,
            value: ""
        }
    },
    data: {
        tagList: [],
        discountText: '',
    },
    methods: {
        setPriceCalcTag() {
            this.setData({
                tagList: [],
                discountText: '',
            });
            this.setData(this.getPriceCalcTag(this.data.priceCalcItems));
        },
        getPriceCalcTag(priceCalcItems = []) {
            const res = {tagList: []};
            const tagLen = priceCalcItems.length;
            if (!tagLen) return res;

            const minLen = tagLen > 2 ? 2 : 1;
            priceCalcItems.forEach((item) => {
                res.tagList.length < minLen && res.tagList.push({
                    text: item.title
                });
            });
            // 由于续住立享标签情况下隐藏券标签，需要筛选出特定标签
            if (this.data.fromLS) {
                res.tagList = res.tagList.filter(tag => tag.text === this.data.scanPriceTag)
            }
            res.discountText = tagLen > 1 ? priceCalcItems[tagLen-1].title : '';

            return res;
        },
    },
    attached() {
        // this.setPriceCalcTag();
    },
});