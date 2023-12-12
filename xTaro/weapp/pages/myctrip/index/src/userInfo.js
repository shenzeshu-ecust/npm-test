import { _, cwx } from '../../../../cwx/cwx';
import {
    USER_WELFARE_LIST, DEFAULT_USER_GRADE,
    DEFAULT_USERNAME
} from './indexConfs';

// 存取我携首页storage信息的key
const MY_CTRIP_USER_NAME_STORAGE_KEY = 'MY_CTRIP_USER_NAME_STORAGE_KEY';

/**
 * 从storage中获取用户名
 * @returns {*}
 */
function getUserNameFromStorage () {
    return cwx.getStorageSync(MY_CTRIP_USER_NAME_STORAGE_KEY);
}

/**
 * 将用户名存放在storage中
 * @param info
 */
function setUserNameStorage (info) {
    const startTimeStamp = new Date().getTime();
    const storageInfo = info;
    storageInfo.startTimeStamp = startTimeStamp;
    cwx.setStorageSync(MY_CTRIP_USER_NAME_STORAGE_KEY, storageInfo);
}

/**
 * 获取用户头像链接
 * @param {object} data
 * @param {array} data.AvatarNameEntities
 * @param {string} data.AvatarNameEntities[].URL
 * @return {*|string}
 */
const getUserAvatar = (data = {}) => {
    const ret = _.isArray(data.AvatarNameEntities) && data.AvatarNameEntities[0] && data.AvatarNameEntities[0].URL || '';

    return ret || '';
};

/**
 * 将从概要服务拿到的UserName信息存放进Storage
 * 过期时间 60d
 * 如果从服务拿到的UserName和上一次的不一致，则进行更新
 * @param data
 */
const setUserNameToStorage = (data) => {
    const storageCache = getUserNameFromStorage();
    const nowTimeStamp = new Date().getTime();
    // 60天有效期
    const isOverDue = storageCache && storageCache.startTimeStamp
        ? (nowTimeStamp - storageCache.startTimeStamp) > (60 * 24 * 60 * 60 * 1000)
        : false;
    const isNotMatch = data && storageCache && data.UserName !== storageCache.UserName;

    // 1 无缓存；2 缓存过期；3 缓存中的信息和接库返回的不一致。都会进行重新设置Storage的中的用户名信息
    if (!storageCache || isOverDue || isNotMatch) {
        setUserNameStorage({
            UserName: data && data.UserName || DEFAULT_USERNAME
        });
    }
}

/**
 * 获取用户名
 * @param {object} data
 * @param {string} data.UserName
 * @return {*|string}
 */
const getUserName = () => {
    const data = getUserNameFromStorage();
    return data && data.UserName || DEFAULT_USERNAME;
};

/**
 * 获取用户优惠券数量
 * @param {object} data
 * @param {number} data.userAvailableCouponCount
 * @return {string|number}
 */
const getUserCouponCount = (data) => {
    let count = data.userAvailableCouponCount || 0;

    if (count && count >= 1000) {
        count = '999+'
    }

    return count ? `${count}张` : '';
};

/**
 * 获取服务下发的等级信息
 * @param {*} data
 * @returns
 */
const getGrade = (data) => {
    if (!data || !data.Grade) {
        return 0;
    }

    return parseInt(data.Grade, 10);
}

/**
 * 获取用户等级
 * @param {object} data
 * @param {string} data.Grade
 * @return {number}
 */
const getUserLevel = (data) => {
    if (!data || !data.Grade) {
        return 0;
    }

    const grade = getGrade(data);
    let level = 0;

    switch (grade) {
        case 10: {
            level = 1;
            break;
        }
        case 20: {
            level = 2;
            break;
        }
        case 30: {
            level = 3;
            break;
        }
        case 35: {
            level = 4;
            break;
        }
        case 40: {
            level = 5;
            break;
        }
        default: {
            break;
        }
    }

    return level;
};

/**
 * 获取用户权益等级
 * @param data
 * @return {string}
 */
const getUserWelfare = (data) => {
    const level = getUserLevel(data);
    return USER_WELFARE_LIST[level] || '';
};

// 获取指定信息
const getMemberAssetSummaries = (data = null, type = '') => {
    if (!data || !type) {
        return {};
    }

    const { MemberAssetSummaries: memberAssetSummaries = [] } = data;

    const target = memberAssetSummaries.find((item) => {
        const { AssetType: assetType = '' } = item;
        return assetType === type;
    });

    return target || {};
}

/**
 * 从服务获取会员等级名
 * @param data
 * @returns {string}
 */
const getUserGradeText = (data) => {
    const { DescInfo: userGrade = DEFAULT_USER_GRADE } = getMemberAssetSummaries(data, 'UserGrade');

    return userGrade;
}

// 积分数量
const getPointCount = (data) => {
    const { Balance: point = 0 } = getMemberAssetSummaries(data, 'Point');
    let pointCount = point;

    // 正积分>9999999, 显示>100w
    // 福积分<-999999, 显示<-10w
    if (point > 9999999) {
        pointCount = '>100w';
    }
    if (point < -999999) {
        pointCount = '<-10w';
    }
    return pointCount;
}

// 优惠券数量信息
const getCouponCount = (data) => {
    const { Balance: coupon = 0 } = getMemberAssetSummaries(data, 'Promocode');
    let couponStr = coupon;

    if (coupon > 99) {
        couponStr = '>99'
    }

    return couponStr;
}

// 是否展示“超级会员”tag
const getIsShowSuperVip = ({ SVIP: sVip = false }) => {
    return sVip;
}

export {
    getUserLevel,
    getUserAvatar,
    getUserCouponCount,
    getGrade,
    getUserName,
    getUserWelfare,
    getUserGradeText,
    getPointCount,
    getCouponCount,
    getIsShowSuperVip,
    setUserNameToStorage
}