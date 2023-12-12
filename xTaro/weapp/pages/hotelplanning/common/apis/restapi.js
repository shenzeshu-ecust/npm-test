import hrequest from "../hpage/request"
const ModelUtil = require("../utils/model.js");
const util = require("../utils/util.js");

// 此处构造请求参数的实现可在业务调用时构造，后期可改造下线（每个接口都测一下能否正常调通），看逻辑除了个别接口做了某些参数的转换，大部分都是透传
const createParam = {
	SmzGetModuleListV3(searches) {
		return {
			hotelID: parseInt(searches.hotelId, 10),
			codeID: searches.codeID,
			source: searches.source,
			unionId: searches.unionId,
		};
	},
	gethoteldetail(hotelID) {
		return { hotelID };
	},
	smzReceiveUnionVip(params) {
		return params;
	},
	roomVendingRecord(params) {
		return params;
	},
    getRoomVendingReward(params) {
		return params;
	},
	roomVendingSupplierConfig(params) {
		return params;
	},
	getHotelMallProductList(params) {
		return params;
	},
	groupArticleInfoListGet(params) {
		return params;
	},
	hotelMiniProgramUrlGet(params) {
		return params;
	},
	getShuttleCar(hotelId) {
		return { hotelId };
	},
	getNearbySight(hotelId) {
		return { hotelId };
	},
	getWifiConnectModules(params) {
		return params;
	},
	restaurantProductInfoList(params) {
		return params;
	},
	getWeComQrCode(params) {
		return params
	},
	videoRoom(params) {
		return params
	},
	esportsRoom(params) {
		return params
	},
	getThirdPartyUrl(params){
		return params
	},
	getGroupEntryQrCode(params) {
		return params
	},
    recordWifiConnectSuc(params){
        return params
    },
	matchPmsOrderInfo(params) {
		return params;
	},
    recordQrCodeNearbyWifi(params) {
		return params;
	},
    updateEbkWifi(params) {
		return params;
	},
	getWechatUrl(params) {
		return params;
	},
    getAbTestVersion(params) {
		return params;
	},
    createHotelSuggestion(params) {
		return params;
	},
    sendShortMessage(params) {
		return params;
	},
};

function doRequest(name, search) {
	const params = createParam[name](search);
	return new Promise((resolve, reject) => {
		hrequest.hrequest({
			url: ModelUtil.serveUrl(name),
			data: params,
			success: function (res) {
				if (util.successSoaResponse(res)) {
					resolve(res.data);
				} else {
					reject(res);
				}
			},
			fail: function (error) {
				reject(error);
			},
		});
	});
}

export default {
	getSmzModuleListV3(searches) {
		return doRequest("SmzGetModuleListV3", searches).catch(() => ({
			result: false,
		}));
	},
	getVipCard(params) {
		return doRequest("smzReceiveUnionVip", params).catch(() => ({
			result: false,
		}));
	},
	roomVendingRecord(params) {
		return doRequest("roomVendingRecord", params).catch(() => ({
			result: false,
		}));
	},
	getRoomVendingReward(params) {
		return doRequest( "getRoomVendingReward", params).catch(() => ({
			result: false,
		}));
	},
	roomVendingSupplierConfig(params) {
		return doRequest("roomVendingSupplierConfig", params).catch(() => ({
			result: false,
		}));
	},
	getHotelMallProductList(params) {
		return doRequest("getHotelMallProductList", params).catch(() => ({
			result: false,
		}));
	},
	groupArticleInfoListGet(params) {
		return doRequest("groupArticleInfoListGet", params).catch(() => ({
			result: false,
		}));
	},
	hotelMiniProgramUrlGet(params) {
		return doRequest("hotelMiniProgramUrlGet", params).catch(() => ({
			result: false,
		}));
	},
	getShuttleCar(hotelId) {
		return doRequest("getShuttleCar", hotelId).catch(() => ({
			result: false,
		}));
	},
	getNearbySightTest(hotelId) {
		return doRequest("getNearbySight", hotelId).catch((e) => ({
			result: e,
		}));
	},
	getWifiConnectModules(params) {
		return doRequest("getWifiConnectModules", params).catch(() => ({
			result: false,
		}));
	},
	restaurantProductInfoList(params) {
		return doRequest("restaurantProductInfoList", params).catch(() => ({
			result: false
		}))
	},
	getWeComQrCode(params) {
		return doRequest("getWeComQrCode", params).catch(() => ({
			result: false
		}))
	},
	videoRoom(params) {
		return doRequest("videoRoom", params).catch(() => ({
			result: false
		}))
	},
	esportsRoom(params) {
		return doRequest("esportsRoom", params).catch(() => ({
			result: false
		})) 
	},
	getThirdPartyUrl(params) {
		return doRequest("getThirdPartyUrl", params).catch(() => ({
			result: false
		})) 
	},
	getGroupEntryQrCode(params) {
		return doRequest("getGroupEntryQrCode", params).catch(() => ({
			result: false
		})) 
	},
    recordWifiConnectSuc(params) {
		return doRequest("recordWifiConnectSuc", params).catch(() => ({
            result: false
		})) 
	},
	matchPmsOrderInfo(params) {
		return doRequest("matchPmsOrderInfo", params).catch(() => ({
            result: false
		})) 
	},
    recordQrCodeNearbyWifi(params) {
		return doRequest("recordQrCodeNearbyWifi", params).catch(() => ({
            result: false
		})) 
	},
    updateEbkWifi(params) {
		return doRequest("updateEbkWifi", params).catch(() => ({
            result: false
		})) 
	},
	getWechatUrl(params) {
		return doRequest("getWechatUrl", params).catch(() => ({
            result: false
		}))
	},
    getAbTestVersion(params) {
		return doRequest("getAbTestVersion", params).catch(() => ({
            result: false
		}))
	},
    createHotelSuggestion(params) {
		return doRequest("createHotelSuggestion", params).catch(() => ({
            result: false
		}))
	},
    sendShortMessage(params) {
		return doRequest("sendShortMessage", params).catch(() => ({
            result: false
		}))
	},
};
