const USER_WELFARE_LIST = ['领会员福利', '领黄金福利', '领铂金福利', '领钻石福利'];

const DEFAULT_USER_GRADE = '普通会员';
const DEFAULT_USERNAME = '尊敬的携程用户';
const DEFAULT_USER_AVATAR = 'http://pic.c-ctrip.com/h5/rwd_myctrip/portrain_unlogin.png'; // 保底头像
const DEFAULT_USER_WELFARE = '领会员福利';

const loginPah = '/H5Login/logout?useminiProJump=T&from=/pages/myctrip/index/index&isTabBar=T';
const LOGINOUT_H5_CTICKET_URL = {
    fat: `https://accounts.fat466.qa.nt.ctripcorp.com${loginPah}`,
    uat: `https://accounts.uat.qa.nt.ctripcorp.com${loginPah}`,
    prd: `https://accounts.ctrip.com${loginPah}`
};

export {
    USER_WELFARE_LIST,

    DEFAULT_USER_GRADE,
    DEFAULT_USERNAME,
    DEFAULT_USER_AVATAR,
    DEFAULT_USER_WELFARE,

    LOGINOUT_H5_CTICKET_URL
}