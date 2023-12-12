import C from '../../common/C';
import StorageUtil from '../../common/utils/storage.js';
import DateUtil from '../../common/utils/date.js';
const VALID_DATE = 7; // 7天内数据有效

// 获取7天内浏览历史酒店列表
function getBrowseHotelStore () {
    const browseStoreList = StorageUtil.getStorage('WX_HOTEL_BROWSE_HISTORY');
    const hotelBrowseHistory = browseStoreList && browseStoreList.hotelBrowseHistory || [];
    // 7内的浏览历史
    const hotelHistoryList = [];
    const today = DateUtil.today();
    for (let i = 0, n = hotelBrowseHistory.length; i < n; i++) {
        if (DateUtil.calDays(hotelBrowseHistory[i].date, today) <= 7) {
            hotelHistoryList.push(hotelBrowseHistory[i]);
        }
    }
    return hotelHistoryList;
}

// 获取除当前酒店外的其它浏览历史酒店
function getExceptBrowseHotelList (hotelId) {
    let browseHotels = [];
    const hotelBrowseHistory = getBrowseHotelStore();
    if (hotelBrowseHistory && hotelBrowseHistory.length) {
    	const today = DateUtil.today();
        browseHotels = hotelBrowseHistory.filter(item => {
        	return item.oridata.hotelid !== hotelId && DateUtil.calDays(item.date, today) <= VALID_DATE;
        });
    }
    return browseHotels;
}

// 保存最新的浏览历史酒店列表
function setBrowseHistoryHotelIdList (newHotelHistory, hotelsHistoryList) {
    const hotelList = hotelsHistoryList || [];
    hotelList.unshift(newHotelHistory);
    StorageUtil.setStorage('WX_HOTEL_BROWSE_HISTORY', {
        hotelBrowseHistory: hotelList
    }, 72); // 缓存有效期为3天
}

// 每个浏览酒店是key
function createItemKey (hotelId, biz, cityId) {
    return `${hotelId}.${biz}.${cityId}`;
}

// 创建一个当前浏览酒店对象
function createItem (hotelId, biz, cityId) {
    return {
        timeStamp: (new Date()).getTime(),
        uniqId: createItemKey(hotelId, biz, cityId),
        date: DateUtil.today(),
        oridata: {
            hotelid: hotelId,
            biz,
            cityid: cityId
        }
    };
}

export default {
    // 将当前酒店加入浏览历史缓存中,暴露给外部调用
    addBrowsedHotel: function (hotelId, biz, cityId) {
        const hotelsHistoryList = getExceptBrowseHotelList(hotelId);
        const newHotelHistory = createItem(hotelId, biz, cityId);
        setBrowseHistoryHotelIdList(newHotelHistory, hotelsHistoryList);
    },
    getAllBrowseHotelIds: function () {
        const hotelBrowseHistory = getBrowseHotelStore();
        const browseHotelIdList = [];
        for (let i = 0; i < hotelBrowseHistory.length; i++) {
            const hotelId = hotelBrowseHistory[i].oridata && hotelBrowseHistory[i].oridata.hotelid;
            browseHotelIdList.push(hotelId);
        }
        return browseHotelIdList;
    },
    getBrowseHotelIdsBySameCity: function (cityid, hotelid) {
        const hotelBrowseHistory = getBrowseHotelStore();
        const result = [];
        for (let i = 0; i < hotelBrowseHistory.length; i++) {
            const hotelId = hotelBrowseHistory[i].oridata && hotelBrowseHistory[i].oridata.hotelid;
            const cityId = hotelBrowseHistory[i].oridata && hotelBrowseHistory[i].oridata.cityid;
            if (cityId === cityid && hotelId != hotelid) {
                result.push(hotelId);
            }
        }
        return result;
    },
    addBrowsedCityId (cityId) {
        StorageUtil.setStorage(C.STORAGE_BROWED_HOTEL_CITYID_HISTORY, { cityId });
    }
};
