import { cwx } from '../../../../cwx/cwx.js';

const CityInfo = {
  cityId:2
}

const currentCity = function () {
  const cachedCityInfo = cwx.locate.getCachedCtripCity();
  let cityId = 0;
  if (cachedCityInfo && cachedCityInfo.data) {
    const { CityID = 0 } = cachedCityInfo.data.CityEntities[0];
    if (CityID === 0) {
      CityID = this.CityInfo.cityId;
    }
    cityId = CityID;
  } else if (CityInfo.cityId != 0) {
    cityId = CityInfo.cityId
  }
  CityInfo.cityId = cityId
  console.log("城市ID", cityId);
  return cityId;
}

const rpxTopx= function(rpx){
    let deviceWidth = wx.getSystemInfoSync().windowWidth;
    let px = (deviceWidth/750)*Number(rpx)
    return Math.floor(px)
}

const substrByByte= function (str,num) {
	var len = 0;
		for (var i = 0; i < str.length; i++) {
				var c = str.charCodeAt(i);
				//单字节加1
				if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
						len++;
				} else {
						len += 2;
				}
				if(len>num){
					return str.substr(0, i) + '...';
				}
		}
		return str;

}

module.exports = {
  currentCity,
	rpxTopx,
	substrByByte
}