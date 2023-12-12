import { cwx } from '../../../../cwx/cwx';
import commonfunc from '../commonfunc';
import util from '../utils/util';

const lbsSource = commonfunc.getLocationSource();

function locatePoi (noCache, success, error) {
    const cachedPoint = !noCache ? cwx.locate.getCachedGeoPoint() : null;
    if (cachedPoint) {
        return success && success({
            lat: cachedPoint.latitude,
            lng: cachedPoint.longitude
        });
    }

    cwx.locate.startGetGeoPoint({
        success: function (res) {
            success && success({
                lat: res.latitude,
                lng: res.longitude
            });
        },
        fail: function (e) {
            error && error(e);
        }
    });
}

function locateWithCityInfo (options, success, error) {
    const { lat, lng, coordType } = options;
    const cityHandle = (res) => {
        if (util.successSoaResponse(res)) {
            // const data = res.data;
            const { ctripPOIInfo = {}, htlCurrentCity: city, pOIInfo } = res.data;
            const { timeZoneInfo = {}, countryId, cityIDList } = ctripPOIInfo;
            const biz = countryId > 1 ? 2 : 1;
            const utcOffSet = timeZoneInfo.utcOffSetWithDst || timeZoneInfo.utcOffSet;
            // 城市信息优先取htlCurrentCity取值，cityIDList做兜底
            let cityId = 2;
            let cityName = '上海';
            if (city?.geoCategoryID === 3) { // 城市
                cityId = city.geoID;
                cityName = city.geoCName;
            } else if (cityIDList && cityIDList.length) {
                cityId = cityIDList[0].cityID;
                cityName = cityIDList[0].cityName;
            }

            success && success({
                cityId,
                cityName,
                did: 0,
                address: _getSematicAddress(pOIInfo),
                type: biz,
                biz,
                lat: res.latitude,
                lng: res.longitude,
                isGeo: true, // TODO
                tzone: typeof utcOffSet === 'number' ? (utcOffSet - 28800) : 0
            });
        } else {
            error && error(res);
        }
    };

    if (typeof lat !== 'number' || typeof lng !== 'number') { // 定位查询
        cwx.locate.startGetCtripCity(cityHandle, lbsSource, coordType);
    } else { // 传入经纬度查询
        cwx.locate.startGetCtripCityByCoordinate(lat, lng, cityHandle, lbsSource, coordType);
    }
}

function getCachedPoi () {
    return cwx.locate.getCachedGeoPoint();
}

function getCachedAddress () {
    const addressInfo = cwx.locate.getCachedAddress();
    return addressInfo && addressInfo.pois.length > 0 ? addressInfo.pois[0].name + addressInfo.pois[0].direction : null;
}
function getAddressByCoordinate (options, success, error) {
    const { lat, lng, coordType } = options;
    if (typeof lat !== 'number' || typeof lng !== 'number') return;

    cwx.locate.startGetAddressByCoordinate(lat, lng, (res) => {
        handle(res, success);
    }, lbsSource, coordType);
}

function _getSematicAddress (poi) {
    let sematicAddress = '';
    if (poi) {
        sematicAddress = poi.detailAddress;
        const pois = poi.poiList || [];
        if (pois && pois.length) {
            sematicAddress = pois[0].name;
        }
    }

    return sematicAddress;
}

export default {
    // POI定位
    locatePoi,
    // 带城市信息和时区信息的 POI定位
    locateWithCityInfo,
    // Poi缓存，无则返回null
    getCachedPoi,
    // Address缓存，无则返回null
    getCachedAddress,
    // 逆地址解析(仅国内)
    getAddressByCoordinate
};
