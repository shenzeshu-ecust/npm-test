import hPromise from "../hpage/hpromise";

const ModelUtil = require("../utils/model.js");
import hrequest from "../hpage/request"

function escapeRegExp(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getSuggestingItemParts(name, inputValue) {
	let parts = [];
	if (name) {
		let keyword = inputValue || "";
		let re = new RegExp(escapeRegExp(keyword), "gi");
		let separator = "|~|";
		let processStr = name.replace(re, separator + keyword + separator);
		let pArr = processStr.split(separator) || [];
		pArr.forEach(function (item) {
			item && parts.push(item);
		});
	}

	return parts;
}

function getSuggestingItemPartsEn(nameEn, inputValue) {
	let partsEn = [];
	if (nameEn) {
		let keyword = inputValue || "";
		let re = new RegExp(escapeRegExp(keyword), "gi");
		let separator = "|~|";
		let processStr = nameEn.replace(re, separator + keyword + separator);
		let pArr = processStr.split(separator) || [];
		pArr.forEach(function (item) {
			item && partsEn.push(item);
		});
	}

	return partsEn;
}

function sortDestinationData(inputValue = "", data) {
	return data.map(
		({ id, name, nameEn, type, typeName, isOversea, regionInfo = {} }) => {
			let lat, lon, idData, hotelId;
			let {
				cityId,
				cityName,
				newDisplayText,
				cityNameEn,
				timeZone: tzone,
				districtId: did,
			} = regionInfo;

			if (id) {
				[idData, lat, lon] = id.split("|");
				if (type === 64) {
					[, hotelId] = idData.split("-");
				}
			}

			return {
				name, // 搜索结果显示名称
				nameEn,
				dtype: type, // 类型
				typeName, // 地标名
				lat, // 纬度
				lon, // 经度
				hotelId, // 酒店id
				newDisplayText, // 搜索结果地区文案
				tzone,
				did,
				cityId,
				cityName,
				isOversea,
				type: isOversea === 1 ? 2 : 1, // 国内海外
				currentTab: isOversea ? "1" : "0",
				key: id,
				parts: getSuggestingItemParts(name, inputValue),
				partsEn: getSuggestingItemPartsEn(nameEn, inputValue),
			};
		}
	);
}

function convertSearchResponse(inputValue, { destinationList = [] }) {
	return sortDestinationData(inputValue, destinationList.slice(0, 10));
}

function fotMatCity(data, type) {
	let city = {
		cityId: data.id,
		cname: data.name,
		cPY: data.py,
		cJP: data.jp,
		cfrl: data.firstLetter,
		ctryId: data.countryId,
		did: data.districtId,
		seo: data.seo,
		type: type,
		cityName: data.name,
	};
	return city;
}

function resetCityMainList(listdata, type) {
	let mainListData = {};

	for (let i = 0; i < listdata.length; i++) {
		let firstLetter = listdata[i].firstLetter;
		let list = listdata[i] && listdata[i].cityList;
		let cityListData = [];
		list.forEach((item) => {
			cityListData.push(fotMatCity(item, type));
		});
		mainListData[firstLetter] = cityListData;
	}

	return mainListData;
}

function forMatData(citydata) {
	let cityData = {
		inlandCities: {
			historyCities: [],
			hotCities: [],
			cityMainList: {},
		},
		interCities: {
			historyCities: [],
			hotCities: [],
			cityMainList: {},
		},
	};

	let inlandHotCitys =
		(citydata.inlandCitiesOrigin &&
			citydata.inlandCitiesOrigin.hotCityList) ||
		[];
	let interHotCitys =
		(citydata.interCitiesOrigin &&
			citydata.interCitiesOrigin.hotCityList) ||
		[];
	inlandHotCitys &&
		inlandHotCitys.forEach((item) => {
			cityData.inlandCities.hotCities.push(fotMatCity(item, 1));
		});
	interHotCitys &&
		interHotCitys.forEach((item) => {
			cityData.interCities.hotCities.push(fotMatCity(item, 2));
		});

	cityData.inlandCities.cityMainList = resetCityMainList(
		citydata.inlandCitiesOrigin.cityGroupList,
		1
	);
	cityData.interCities.cityMainList = resetCityMainList(
		citydata.interCitiesOrigin.cityGroupList,
		2
	);

	return cityData;
}

module.exports = {
	doRequest: function (onSuccess, onError) {
		const tasks = [];
		let citydata = {};
		tasks.push(
			new hPromise((resolve) => {
				hrequest.hrequest({
					url: ModelUtil.serveUrl("cityList"),
					data: { oversea: false },
					success: function (result) {
						resolve(result.data);
					},
				});
			})
		);

		tasks.push(
			new hPromise((resolve) => {
				hrequest.hrequest({
					url: ModelUtil.serveUrl("cityList"),
					data: { oversea: true },
					success: function (result) {
						resolve(result.data);
					},
				});
			})
		);

		hPromise.all(tasks).then((options) => {
			citydata.inlandCitiesOrigin = {
				hotCityList: options[0] && options[0].hotCityList,
				cityGroupList: options[0] && options[0].cityGroupList,
			};
			citydata.interCitiesOrigin = {
				hotCityList: options[1] && options[1].hotCityList,
				cityGroupList: options[1] && options[1].cityGroupList,
			};
			let data = forMatData(citydata);
			onSuccess && onSuccess(data);
		});
	},
	doSearch: function (inputValue = "", currentTab, onSuccess, onError) {
		inputValue = inputValue.trim();
		hrequest.hrequest({
			url: ModelUtil.serveUrl("getdestination"),
			data: { contentType: "json", word: inputValue },
			success: function (result) {
				if (
					result &&
					result.data &&
					result.data.ResponseStatus &&
					result.data.destinationList &&
					(result.data.ResponseStatus.Ack === 0 ||
						result.data.ResponseStatus.Ack === "Success")
				) {
					onSuccess &&
						onSuccess(
							convertSearchResponse(inputValue, result.data)
						);
				} else {
					onError && onError(result);
				}
			},
			fail: function (error) {
				onError && onError(error);
			},
		});
	},
	forMatData
};
