import cwx from "../../../../cwx/cwx";

const slice = [].slice;
const pluck = function (arr, prop) {
	let ret = [];
	if (!(arr instanceof Array)) {
		return ret;
	}
	arr.forEach(function (e) {
		ret.push(e[prop]);
	});
	return ret;
};

const clone = function (obj) {
	return JSON.parse(JSON.stringify(obj));
};

const type = (function () {
	const class2type = {};
	const baseTypes = [
		"Boolean",
		"Number",
		"String",
		"Function",
		"Array",
		"Date",
		"RegExp",
		"Object",
		"Error",
	];
	baseTypes.forEach((name) => {
		class2type["[object " + name + "]"] = name.toLowerCase();
	});

	return function (obj) {
		return obj == null
			? String(obj)
			: class2type[{}.toString.call(obj)] || "unknown";
	};
})();

const isPlainObject = function (obj) {
	return (
		type(obj) === "object" && Object.getPrototypeOf(obj) == Object.prototype
	);
};
const isArray = function (obj) {
	return type(obj) === "array";
};
const extend = function (target, source, deep) {
	for (const key in source) {
		if (!source.hasOwnProperty(key)) continue;

		if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
			if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
				target[key] = {};
			}
			if (isArray(source[key]) && !isArray(target[key])) {
				target[key] = [];
			}

			extend(target[key], source[key], deep);
			continue;
		}

		if (source[key] !== undefined) {
			target[key] = source[key];
		}
	}

	return target;
};

const successSoaResponse = function (result) {
	if (!result || !result.data) {
		return false;
	}

	const checkResponseStatus = (obj) => {
		return (
			isPlainObject(obj.ResponseStatus) &&
			(obj.ResponseStatus.Ack === "Success" ||
				obj.ResponseStatus.Ack === 0)
		);
	};

	if (!result.data.ResponseStatus && isPlainObject(result.data.head)) {
		return checkResponseStatus(result.data.head);
	}

	return checkResponseStatus(result.data);
};
const jsonToArray = function (json) {
	if (!isPlainObject(json)) {
		return [];
	}

	let arr = [];
	for (let i in json) {
		if (json.hasOwnProperty(i) && json[i] === 1) {
			arr.push(i);
		}
	}
	return arr;
};

const isEmptyObject = function (obj) {
	for (const t in obj) {
		if (obj.hasOwnProperty(t)) {
			return false;
		}
	}
	return true;
};

const isEmpty = (obj) => {
	const objType = type(obj);

	switch (objType) {
		case "string":
			return obj.trim().length === 0;
		case "object":
			return isEmptyObject(obj);
		case "null":
		case "undefined":
			return true;
		case "array":
			return obj.length === 0;
	}

	return false;
};

const keys = function (obj) {
	if (isEmpty(obj) || !isPlainObject(obj)) {
		return [];
	}

	const result = [];
	for (const key in obj) {
		if (obj.hasOwnProperty(key)) {
			result.push(key);
		}
	}

	return result;
};

/**
 * 类IPhoneX机型判断（底部有黑线）
 */
const isIPhoneX = function () {
	let rs = false;
	const systemInfo = wx.getSystemInfoSync();
	if (systemInfo) {
		const w = systemInfo.screenWidth;
		const h = systemInfo.screenHeight;
		const platform = systemInfo.platform;

		// IPhoneX: 375:812   IPhoneXR: 414:896  IPhoneXS max: 414:896
		if (
			platform === "ios" &&
			((w % 375 === 0 && h % 812 === 0) ||
				(w % 414 === 0 && h % 896 === 0))
		) {
			rs = true;
		}
	}

	return rs;
};

/**
 * 类IPhone12机型判断
 */
const isIPhone12 = function () {
	let rs = false;
	const systemInfo = wx.getSystemInfoSync();
	if (systemInfo) {
		const w = systemInfo.screenWidth;
		const h = systemInfo.screenHeight;
		const platform = systemInfo.platform;

		// IPhone12 mini: 360:780  IPhone12 | IPhone12 Pro: 390:844  IPhone12 Pro Max: 428:926
		if (
			platform.toLowerCase() === "ios" &&
			((w % 360 === 0 && h % 780 === 0) ||
				(w % 390 === 0 && h % 844 === 0) ||
				(w % 428 === 0 && h % 926 === 0))
		) {
			rs = true;
		}
	}

	return rs;
};

const createGuid = function () {
	function S1() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(4);
	}
	function newGuid() {
		var guid = "";
		for (var i = 1; i <= 20; i++) {
			guid += S1();
			if (i === 8 || i === 12 || i === 16 || i === 20) {
				guid += "-";
			}
		}
		var num = parseInt(8 * Math.random());
		var date = new Date().getTime() + "";
		guid += date.slice(0, num);
		for (var j = 0; j < 4; j++) {
			guid += S1();
		}
		guid += date.slice(num + 5, 13);
		return guid;
	}
	return newGuid();
};

const dynamicTemplates = (tpl, variables) => {
	if (isEmpty(variables) || isEmpty(variables)) {
		return tpl;
	}

	return tpl.replace(/\$\{(\w+)\}/g, (term, key) => {
		return variables[key] || term;
	});
};

const asyncToast = (params) => {
	return new Promise((resolve, reject) => {
		cwx.showToast({
			...params,
			success: () => {
				setTimeout(resolve, params.duration || 0);
			},
			fail: reject,
		});
	});
};

const throttle = (func, wait) => {
	let prev = Date.now();
	return function () {
		const now = Date.now();
		if (now - prev >= wait) {
			func.apply(this, arguments);
			prev = now;
		}
	};
};
const compareVersion = (v1, v2) => {
	v1 = v1.split(".");
	v2 = v2.split(".");
	const len = Math.max(v1.length, v2.length);

	while (v1.length < len) {
		v1.push("0");
	}
	while (v2.length < len) {
		v2.push("0");
	}

	for (let i = 0; i < len; i++) {
		const num1 = parseInt(v1[i]);
		const num2 = parseInt(v2[i]);

		if (num1 > num2) {
			return 1;
		} else if (num1 < num2) {
			return -1;
		}
	}

	return 0;
};
const subcribeVersionCompare = () => {
	const sdkVersion = wx.getSystemInfoSync().SDKVersion || "0"; // sdk版本
	const system = wx.getSystemInfoSync().system || "";
	const version = wx.getSystemInfoSync().version || "0"; // 微信版本号
	if (compareVersion(sdkVersion, "2.8.2") >= 0) {
		if (
			(system.indexOf("iOS") > -1 &&
				compareVersion(version, "7.0.7") >= 0) ||
			(system.indexOf("Android") > -1 &&
				compareVersion(version, "7.0.8") >= 0)
		) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
};
const getUrlQuery = (url, key) => {
	let locationArr = url.split("?");
	if (locationArr.length < 2) {
		return;
	}
	let query = locationArr[1];
	if (!query) {
		return;
	}
	let params = query.split("&");
	for (let i = 0; i < params.length; i++) {
		let pair = params[i].split("=");
		if (pair[0] === key) {
			return pair[1];
		}
	}
	return;
};
const logException = (pageInfo, type, errVal, page) => {
	try {
		pageInfo.ubtTrace &&
			pageInfo.ubtTrace("202808", {
				type,
				errVal,
				page,
			});
	} catch (e) {
		console.error(e);
	}
};
const logWithUbtTrace = function(ubtKey, data){
	if (!ubtKey) return;
	let log = cwx.sendUbtByPage.ubtTrace || this.ubtTrace;
	log(ubtKey, data);
};
/**
 * 获取对象数值
 * @param obj {object|JSON} 对象
 * @param keyName {string}? 路径 e.g 'a.b.c'
 * @param df {*}? 默认值
 * @returns {*}
 *
 * example:
 *      >> ({person: { name: { first: 'sun', last: 'cms' }, age: [{a: '1'}, {b: '2'}] }}, 'person.name.last')
 *      => 'cms'
 *      >> ({person: { name: { first: 'sun', last: 'cms' }, age: [{a: '1'}, {b: '2'}] }}, 'person.age.1.b')
 *      => '2'
 *      >> ({person: { name: { first: 'sun', last: 'cms' }, age: [{a: '1'}, {b: '2'}] }}, 'person.name.age',  'suncms')
 *      => 'suncms'
 *
 */
const getAttr = (obj, keyName, df) => {
	const keyArr = (keyName && keyName.split(".")) || [];

	if (typeof obj === "object") {
		let curr = obj,
			i = 0;

		while (keyArr[i]) {
			if (curr) {
				curr = curr[keyArr[i]];
				i++;
				continue;
			}
			return df;
		}

		return isNullOrUndefined(curr) ? df : curr;
	}

	return isNullOrUndefined(obj) ? df : obj;
};

const isNullOrUndefined = function (obj) {
	return obj === null || obj === undefined;
};

const ABTestResult = {
    A: "A",
    B: "B",
    C: "C",
    D: "D",
    E: "E"
}

// url:原图地址 cropM:切图命令 R:水印透明度 Q:图片质量 proc:文字水印
const convertCrop = function (url, cropM = 'C', width, height, R, Q = 50, proc) {
	if (!url) return url;

	// 未指定宽高
	if (!width || !height) {
		return url;
	}

	// 已切图
	if (/(R|C|D|W|Z|X|Y)_/.test(url)) {
		return url;
	}

	// 不在切图域名白名单
	if (!/(dimg(0[1-9]|1[0-9]|20).c-ctrip.com|images[4-8].c-ctrip.com|ak-d.tripcdn.com|image.kztpms.com|youimg1.(c-ctrip|tripcdn).com|pkgpic.(c-ctrip|ctrip|tripcdn).com)/.test(url)) {
		return url;
	}

	return url.replace(/(?=.(gif|jpg|jpeg|png|webp|GIF|JPG|PNG)(_.webp)?$)/, `_${cropM}_${width}_${height}_${R ? "R" + R + "_" : ''}Q${Q}`) + `${proc ? '?proc=' + proc : ''}`;
}

module.exports = {
	pluck: pluck,
	clone: clone,
	type: type,
	extend: extend,
	successSoaResponse: successSoaResponse,
	isNumber: (obj) => {
		return type(obj) === "number";
	},
	isFunction: (obj) => {
		return type(obj) === "function";
	},
	isNumeric: (obj) => {
		const t = type(obj);
		return (
			(t === "number" || t === "string") && !isNaN(obj - parseFloat(obj))
		);
	},
	isArray: isArray,
	isPlainObject: isPlainObject,
	jsonToArray: jsonToArray,
	isEmptyObject: isEmptyObject,
	isEmpty: isEmpty,
	keys: keys,
	isIPhoneX: isIPhoneX,
	isIPhone12: isIPhone12,
	createGuid: createGuid,
	dynamicTemplates: dynamicTemplates,
	asyncToast,
	throttle,
	compareVersion,
	subcribeVersionCompare,
	getUrlQuery,
	getAttr,
	isNullOrUndefined,
	logException,
	logWithUbtTrace: logWithUbtTrace,
	ABTestResult,
	convertCrop
};
