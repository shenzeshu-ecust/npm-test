const tripInfo = {};

export const setTripStatus = function (info = {}) {
	for (let pro in info) {
        tripInfo[pro] = info[pro];
  }
  // console.log('---tripInfo:', JSON.stringify(tripInfo));
};

// 清除上一次请求服务端返回的所有信息
export const clearTripStatus = function () {
    try {
        const keys = Object.keys(tripInfo);
        for (let index = 0; index < keys.length; index++) {
            const key = keys[index];
            delete tripInfo[key];
        }
    } catch (e) {
        console.log(e);
    }
};

function getTripStatus() {
	return tripInfo;
}

export default getTripStatus;
