import { _ } from '../../../cwx/cwx.js';

const urlToDetail = (filterInfo) => {
    if (!filterInfo) return;

    const urlArr = [];
    let pricefilter = '';
    if (filterInfo.highestPrice > 0 || filterInfo.lowestPrice > 0) {
        pricefilter = `&pricefilter=${filterInfo.lowestPrice}|${filterInfo.highestPrice}`;
    }
    let breakfast = '';
    let bed = 0;
    let payType = 0;
    const ctripService = [];
    let ht = 0;
    const filterItems = [];
    filterInfo.filterItemList.forEach(function (f) {
        // 高铁游、砍价促销的filter不带入到详情页
        if (f !== 'hoteldiscount-99999|||高铁游|@hoteldiscount' && f.indexOf('kanjia-666') === -1) {
            filterItems.push(f);
        }

        if (f.indexOf('@breakfast') > -1) {
            breakfast = '&breakfast=1';
        } else {
            switch (f) {
            case 'bedtype-2|||大床房|@bedtype':
                bed = 22;
                break;
            case 'bedtype-4|||双床房|@bedtype':
                bed = 23;
                break;
            case 'bedtype-16|||多床房|@bedtype':
                bed = 6;
                break;
            case 'paytype-1|||在线付款|@paytype':
                payType = 5;
                break;
            case 'paytype-2|||到店付款|@paytype':
                payType = 2;
                break;
            case 'service-4|||立即确认|@service':
                ctripService.push(128);
                break;
            case 'service-32|||有条件取消|@service':
                ctripService.push(256);
                break;
            case 'service-2|||可取消|@service':
                ctripService.push(512);
                break;
            case 'service-2|||免费取消|@service':
                ctripService.push(512);
                break;
            case 'service-1|||携程自营|@service':
                ctripService.push(1024);
                break;
            case 'service-8|||可订|@service':
                ctripService.push(2048);
                break;
            case 'feature-202|||钟点房|@hoteltype':
                ht = 1024;
                break;
            }
        }
    });
    pricefilter && urlArr.push(pricefilter);
    breakfast && urlArr.push(breakfast);
    bed && urlArr.push(`&bedType=${bed}`);
    payType && urlArr.push(`&pay=${payType}`);
    ctripService.length && urlArr.push(`&service=${ctripService.join(',')}`);
    ht && urlArr.push(`&hotelType=${ht}`);
    filterItems.length && urlArr.push(`&hotelFilterItems=${JSON.stringify(filterItems)}`);

    return urlArr.join('');
};
const hasFilters = (filterInfo = {}) => {
    let result = false;
    for (const n in filterInfo) {
        const item = filterInfo[n];
        if (_.isArray(item) && item.length > 0) {
            result = true;
            break;
        } else if (_.isNumber(item) && item > 0) {
            result = true;
            break;
        }
    }
    return result;
};

export default {
    urlToDetail,
    hasFilters
};
