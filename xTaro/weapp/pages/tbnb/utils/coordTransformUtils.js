import gcoord from "./../npm/gcoord.js";
var COORD_TYPE = {
  unknown: '未知',
  bd09: 'bd09ll',
  wgs84: 'wgs84',
  gcj02: 'gcj02'
};
function BD09Transformer(_a) {
  var isOversea = _a.isOversea,
    type = _a.type,
    longitude = _a.longitude,
    latitude = _a.latitude;
  if (isOversea) {
    return {
      longitude: longitude,
      latitude: latitude
    };
  }
  if (type === COORD_TYPE.gcj02) {
    var res = gcoord.transform([longitude, latitude], gcoord.GCJ02, gcoord.BD09);
    return {
      longitude: res[0],
      latitude: res[1]
    };
  }
  if (type === COORD_TYPE.wgs84) {
    var res = gcoord.transform([longitude, latitude], gcoord.WGS84, gcoord.BD09);
    return {
      longitude: res[0],
      latitude: res[1]
    };
  }
  return {
    longitude: longitude,
    latitude: latitude
  };
}
function GCJ02Transformer(_a) {
  var isOversea = _a.isOversea,
    type = _a.type,
    longitude = _a.longitude,
    latitude = _a.latitude;
  if (isOversea) {
    return {
      longitude: longitude,
      latitude: latitude
    };
  }
  if (type === COORD_TYPE.wgs84) {
    var res_1 = gcoord.transform([longitude, latitude], gcoord.WGS84, gcoord.GCJ02);
    return {
      longitude: res_1[0],
      latitude: res_1[1]
    };
  }
  if (type === COORD_TYPE.gcj02) {
    return {
      longitude: longitude,
      latitude: latitude
    };
  }
  var res = gcoord.transform([longitude, latitude], gcoord.BD09, gcoord.GCJ02);
  return {
    longitude: res[0],
    latitude: res[1]
  };
}
export default {
  BD09Transformer: BD09Transformer,
  GCJ02Transformer: GCJ02Transformer
};