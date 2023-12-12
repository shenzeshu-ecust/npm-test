import { cwx } from '../../cwx/cwx';
import getTripStatus from './tripInfo';
const { sendUbtByPage } = cwx;

// 数据请求埋点
export function fetchDataLog(datas, error, ext) {
  ext = ext || {};
  const info = {
    ...getTripStatus(),
    data: datas,
		error: error,
		...ext
	};
	// console.log('---fetchDataLog:', info);
  sendUbtByPage.ubtDevTrace('waterFlow_fetch_data', info);
}

// 记录请求fail埋点
export function fetchFailLog(error, ext) {
    const info = {
        ...getTripStatus(),
        error: error,
        ...(ext || {})
    };
    sendUbtByPage.ubtDevTrace('mini_waterFlow_fetch_fail', info);
}

// 开发类埋点
export function sendDevTrace(id, info) {
	sendUbtByPage.ubtDevTrace(id, info);
}
function sendTrace(id, info) {
	sendUbtByPage.ubtTrace(id, info);
}
function getInfoFromProduct(product, tabId) {
    if(!product) {
        return {};
    }
	const posIndexArr = (product.posIndex || '').split("_");
	const ext = product.ext || {};
	const {
		cityid,
		...extOthers
	} = ext;
	const productInfo = {
		...getTripStatus(), //先将共有的信息埋进去
		tabid: tabId,
		page: posIndexArr[0],
		index: product.index,
		productid: product.id,
		productcityid: cityid,
		...(extOthers || {}),
		styletype: product.type,
	};
	// console.log('---productInfo:', productInfo);
	return productInfo;
}
// 曝光埋点
export function productExposureLog(product, tabId) {
	sendTrace('o_applet_waterflow_block', getInfoFromProduct(product, tabId));
}

// 卡片点击埋点
export function productClickLog(product, tabId) {
	sendTrace('c_applet_waterflow_click', getInfoFromProduct(product, tabId));
}

