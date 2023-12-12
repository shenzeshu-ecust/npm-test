import listData from '../../list/listdata.js';

// 价格区间历史数据，以cityID-isLongRent作为key，存3个
let priceHistory = null;
let canIUseMap = true;
try {
    priceHistory = new Map();
} catch (err) {
    canIUseMap = false;
}

const resPriceData = ({ cityID, isOversea, isLongRent = false, callback }) => {
    if (!cityID) return;

    const priceMapKey = `${cityID}-${+isLongRent}`;
    const priceRangeInfo = canIUseMap ? priceHistory.get(priceMapKey) : null;
    if (priceRangeInfo) {
        callback && callback(priceRangeInfo);
    } else {
        listData.loadPriceRange({ cityID, isLongShortRent: isLongRent }, res => {
            if (res && res.maxPrice) {
                const rangeInfo = {
                    min: res.minPrice,
                    max: res.maxPrice,
                    step: res.scale,
                    priceRange: res.priceRangeList
                };
                try {
                    priceHistory.set(priceMapKey, rangeInfo);
                    if (priceHistory.size > 3) {
                        const firstKey = priceHistory.keys().next().value;
                        priceHistory.delete(firstKey);
                    }
                } catch (err) {
                    // ignore
                }

                callback && callback(rangeInfo, !canIUseMap);
            }
        }, (err) => {
            callback && callback(isOversea ? { min: 0, max: 1400, step: 50, priceRange: {} } : { min: 0, max: 700, step: 50, priceRange: {} });
        });
    }
};
const getPriceText = (min, max) => {
    let pText = '';
    if (min === 0 && max === 0) return pText;

    if (min === 0) {
        pText = `¥${max}以下`;
    } else if (max === 0) {
        pText = `¥${min}以上`;
    } else {
        pText = `¥${min}-${max}`;
    }
    return pText;
};
const getPriceSliderData = (min, max, ps) => {
    if (max !== 0 && min > max) return;
    // 保存选择值
    ps.temp.minValue = min;
    ps.temp.maxValue = max;
    ps.temp.text = getPriceText(min, max);
};
const setPriceSliderData = function (priceRangeInfo, ps, curMin, curMax) {
    ps.min = priceRangeInfo.min;
    ps.max = priceRangeInfo.max;
    ps.step = priceRangeInfo.step;
    ps.minValue = curMin || priceRangeInfo.min;
    ps.maxValue = curMax || 0;
    ps.temp.minValue = curMin || priceRangeInfo.min;
    ps.temp.maxValue = curMax || 0; // 无上限
    ps.temp.text = getPriceText(~~curMin, ~~curMax);
};
const getDefaultPriceSilder = () => {
    return {
        min: 0,
        max: 0,
        step: 50,
        minValue: 0,
        maxValue: 0,
        temp: { // 临时值，用于页面实时显示，不是hotelList请求数据
            minValue: 0,
            maxValue: 0,
            text: ''
        }
    };
};

export default {
    resPriceData,
    getPriceSliderData,
    setPriceSliderData,
    getDefaultPriceSilder,
    getPriceText
};
