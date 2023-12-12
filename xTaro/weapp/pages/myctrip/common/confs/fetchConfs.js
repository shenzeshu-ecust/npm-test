const COMMON_PATH = '/restapi/soa2/';
const URL_MAP = {
    getUserInfo: `${COMMON_PATH}10098/GetMemberSummaryInfo.json`,
    getUserVerify: `${COMMON_PATH}10098/GetFinanceUserVerify.json`,
    getRouteList: `${COMMON_PATH}15618/commonConfig.json`,
    getMyFavorite: `${COMMON_PATH}10279/json/GetMyFavorites`,
    getMyCtripActivity: `${COMMON_PATH}12673/queryWeChatHotEvent`
};

export { URL_MAP };