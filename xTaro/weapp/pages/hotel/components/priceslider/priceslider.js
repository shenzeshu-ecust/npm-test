import HPromise from '../../common/hpage/hpromise';

/**
 * 将小程序的API封装成支持Promise的API
 * @params fn {Function} 小程序原始API，如wx.login
 */
const wxPromisify = fn => {
    return function (obj = {}) {
        return new HPromise((resolve, reject) => {
            obj.success = function (res) {
                resolve(res);
            };

            obj.fail = function (res) {
                reject(res);
            };

            fn(obj);
        });
    };
};

Component({
    /**
   * 组件的属性列表
   */
    properties: {
    /** slider 最小值 */
        min: {
            type: Number
        },
        /** slider 最大值（0表示无上限） */
        max: {
            type: Number
        },
        /** 步进 （没做，有时间再说，项目里没用到撒） */
        step: {
            type: Number
        },
        /** 预选选择的小值 */
        minValue: {
            type: Number,
            observer: function (newVal, oldVal, changedPath) {
                this._checkStatus(newVal);
                this._updateLeft(newVal);
            }
        },
        /** 预选选择的大值 */
        maxValue: {
            type: Number,
            observer: function (newVal, oldVal, changedPath) {
                this._checkStatus(newVal);
                this._updateRight(newVal);
            }
        },
        /** 滑块颜色 */
        blockColor: {
            type: String
        },
        /** 未选择进度条颜色 */
        backgroundColor: {
            type: String
        },
        /** 已选择进度条颜色 */
        selectedColor: {
            type: String
        }
    },

    /**
   * 组件的初始数据
   */
    data: {
        min: 0,
        max: 100,
        step: 50,
        leftValue: 0,
        rightValue: 100,
        totalLength: 0, // 总长度
        ratio: 0.5, // 设备像素比
        sliderLength: 38, // 滑块长度
        unitLength: 1, // 单位长度(根据step和最大最小值计算)
        containerLeft: 0, // 标识整个组件，距离屏幕左边的距离
        hideOption: false, // 初始状态为显示组件
        bubbleProp: 'left', // 价格气泡当前设置属性名
        bubbleValue: 0, // 价格气泡偏移值
        activeValue: 0, // 价格气泡显示值
        hideBubble: true // 价格气泡是否隐藏
    },

    /**
   * 组件的方法列表
   */
    methods: {
    /**
     * 左边滑块滑动
     * @param pageX 触点相对于屏幕左边沿的X坐标
     */
        _minMove: async function (e) {
            const d = this.data;
            let pagex = e.changedTouches[0].pageX / d.ratio - d.containerLeft - d.sliderLength / 2 - 16; /* 需要额外减去滑块与容器之间的边距16 */
            if (Math.abs(pagex - d.leftValue) < d.unitLength) return; // 小于一个step的移动距离

            // 根据pageX和leftValue判断左右移动方向，并结合unitLength调整pageX
            if (pagex > d.leftValue) { // 从左向右移动
                pagex = pagex - pagex % d.unitLength;
            } else { // 从右向左移动
                pagex = pagex - pagex % d.unitLength + d.unitLength;
            }

            // pageX限制小于rightValue - unitLength
            // 需要注意的是：当rightValue很小的时候（如为unitLength），pageX可能为0或负数
            if (pagex >= d.rightValue - d.unitLength) {
                pagex = d.rightValue - d.unitLength;
            } else if (pagex <= 0) {
                pagex = 0;
            }

            const lowValue = parseInt(Math.round(pagex / d.unitLength) * d.step);
            this.setData({
                minValue: lowValue,
                leftValue: pagex,
                activeValue: lowValue,
                bubbleValue: await this._calcBubbleValue('L', pagex),
                bubbleProp: 'left'
            });
        },

        _minMoveEnd: function (e) {
            const myEventDetail = { lowValue: this.data.minValue };
            this.triggerEvent('lowValueChange', myEventDetail);

            this._hideBubble();
        },

        /**
     * 右边滑块滑动
     */
        _maxMove: async function (e) {
            const d = this.data;
            let pagex = e.changedTouches[0].pageX / d.ratio - d.containerLeft - d.sliderLength - 16; /* 需要额外减去滑块与容器之间的边距16 */
            if (Math.abs(pagex - d.rightValue) < d.unitLength) return; // 小于一个step的移动距离

            if (pagex > d.rightValue) { // 从左向右移动
                pagex = pagex - pagex % d.unitLength;
            } else { // 从右向左移动
                pagex = pagex + d.unitLength - pagex % d.unitLength;
            }

            if (pagex <= d.leftValue + d.unitLength) {
                pagex = d.leftValue + d.unitLength;
            } else if (pagex >= d.totalLength) {
                pagex = d.totalLength;
            }

            let highValue = parseInt(Math.round(pagex / d.unitLength) * d.step);
            highValue = highValue > d.max ? 0 : highValue; // 最大值之后为0，表示无上限
            this.setData({
                maxValue: highValue,
                rightValue: pagex,
                activeValue: highValue === 0 ? (d.max + '+') : highValue, // 为0时显示 最大金额 + '+'
                bubbleValue: await this._calcBubbleValue('R', pagex),
                bubbleProp: 'right'
            });
        },

        _maxMoveEnd: function (e) {
            const myEventDetail = { highValue: this.data.maxValue };
            this.triggerEvent('highValueChange', myEventDetail);

            this._hideBubble();
        },

        /**
     * 更新最小值
     */
        _updateLeft: function (minValue) {
            const left = this._calcLen(minValue, this.data.unitLength);
            this.setData({
                leftValue: left
            });
        },

        /**
     * 更新最大值
     */
        _updateRight: function (maxValue) {
            const d = this.data;
            const right = maxValue === 0 ? d.totalLength : this._calcLen(maxValue, d.unitLength);
            this.setData({
                rightValue: right
            });
        },

        _calcLen: function (value, unitLength) {
            const d = this.data;
            return (value - d.min) / d.step * unitLength;
        },

        _checkStatus: function (val) {
            if (val > this.data.max) {
                !this.data.hideOption && this.hide();
            } else {
                this.data.hideOption && this.show();
            }
        },

        /**
     *  显示价格气泡
     */
        _showBubble: async function (e) {
            const d = this.data;
            const curType = e.currentTarget.dataset.type;
            let bv = 0;
            let prop = '';
            let activeValue = 0;
            let hideBubble = true;
            if (curType === 'L') { // left touch
                activeValue = d.minValue;
                bv = await this._calcBubbleValue('L', d.leftValue);
                prop = 'left';
                hideBubble = false;
            } else if (curType === 'R') { // right touch
                activeValue = d.maxValue === 0 ? (d.max + '+') : d.maxValue;
                bv = await this._calcBubbleValue('R', d.rightValue);
                prop = 'right';
                hideBubble = false;
            }

            this.setData({
                bubbleValue: bv,
                activeValue,
                hideBubble,
                bubbleProp: prop
            });
        },

        /**
     * 计算bubble偏移位置
     * @param type {String} 'L': left; 'R': right
     * @param baseVal {Number} current base value
     */
        _calcBubbleValue: async function (type, baseVal) {
            const { sliderLength, totalLength } = this.data;
            // 获取bubble宽度
            const bubbleWidth = await this._getBubbleWidth();

            // 计算偏移值
            let offsetValue = 0;
            if (type === 'L') {
                offsetValue = baseVal + sliderLength / 2 - bubbleWidth / 2 + 16;
            } else if (type === 'R') {
                offsetValue = totalLength - baseVal + sliderLength - bubbleWidth / 2;
            }
            return offsetValue;
        },

        /**
         * 动态获取气泡框的宽度
        */
        _getBubbleWidth: function () {
            const d = this.data;
            return new Promise((resolve, reject) => {
                const query = this.createSelectorQuery().in(this);
                query.select('.bubble').boundingClientRect().exec(rect => {
                    if (!rect) reject(new Error('This element does not exist.'));
                    const bubbleWidth = rect[0].width / d.ratio;
                    resolve(bubbleWidth);
                });
            });
        },

        /**
     *  隐藏价格气泡
     */
        _hideBubble: function () {
            this.setData({
                hideBubble: true
            });
        },

        /**
     * 隐藏组件
     */
        hide: function () {
            this.setData({
                hideOption: true
            });
        },
        /**
     * 显示组件
     */
        show: function () {
            this.setData({
                hideOption: false
            });
        },
        /**
    * 重置
    */
        reset: function () {
            this.setData({
                rightValue: this.data.totalLength,
                leftValue: 0
            });
        }

    },

    ready: function () {
        const self = this;
        wxPromisify(wx.getSystemInfo)()
            .then(res => {
                const ratio = res.windowWidth / 750;
                self.setData({
                    ratio
                });
            })
            .then(() => {
                const query = wx.createSelectorQuery().in(this);
                query.select('.container').boundingClientRect(function (res) {
                    if (!res) return;
                    const d = self.data;
                    const totalLength = res.width / d.ratio - d.sliderLength - 2 * 16; /* 需要额外减去滑块与容器之间的边距 */
                    const unitLength = totalLength / ((d.max - d.min) / d.step + 1);

                    // 设置左滑块的值
                    const left = self._calcLen(d.minValue, unitLength);
                    // 设置右滑块的值
                    const right = d.maxValue === 0 ? totalLength : self._calcLen(d.maxValue, unitLength);

                    self.setData({
                        totalLength,
                        containerLeft: res.left / d.ratio,
                        unitLength,
                        leftValue: left,
                        rightValue: right
                    });
                }).exec();
            });
    }
});
