import { cwx, __global } from '../../../cwx/cwx';
import { TRACE_HOME, METRIC_HOME, DEV_TRACE_HOME } from '../common/confs/ubtConfs';

const env = __global.env;


function appendZero (time) {
  if (time < 10) {
    return time == 0 ? '00' : '0' + time
  } else {
    return time
  }
}

function formatDuring(mss) {
  var hours = parseInt(mss / (1000 * 60 * 60));
  var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((mss % (1000 * 60)) / 1000);
  return appendZero(hours) + ":" + appendZero(minutes) + ":" + appendZero(seconds);
}

function abValue(items,abtest) {
  items && items.map(item => {
    for (const key in abtest) {
      const element = abtest[key];
      if(item.bu === key) {
        item.buName = item.buName || item[`buName${element}`] || item.buNameA
        item.ubt = item.ubt || item[`ubt${element}`] || item.ubtA
        item.imgUrl = item.imgUrl || item[`imgUrl${element}`] || item.imgUrlA
        if (item.appId || item[`appId${element}`]) {
          item.appId = item.appId || item[`appId${element}`] || item.appIdA
          item.path = item.path || item[`path${element}`] || item.pathA
        } else if (item.h5url || item[`h5url${element}`]) {
          item.h5url = item.h5url || item[`h5url${element}`] || item.h5urlA
        } else {
          item.url = item.url || item[`url${element}`] || item.urlA
        }
      }
    }
  })
  return items
}

const currentEnv = env.toLowerCase();

const logWithUbtTrace = (value, key = TRACE_HOME) => {
  let { sendUbtByPage } = cwx;
  if (sendUbtByPage && sendUbtByPage.ubtTrace) {
    try {
      sendUbtByPage.ubtTrace(key, value)
    } catch (error) {
      console.warn(error);
    }
  }
}

const logWithUbtMetric = (tag, metricName = METRIC_HOME) => {
    let { sendUbtByPage } = cwx;
    if (sendUbtByPage && sendUbtByPage.ubtMetric) {
        try {
            sendUbtByPage.ubtMetric({
                name: metricName,
                tag,
                value: 1
            });
        } catch (error) {
            console.warn(error);
        }
    }
};

const logWithUbtDevTrace = (value, key = DEV_TRACE_HOME) => {
  let { sendUbtByPage } = cwx;
  if (sendUbtByPage && sendUbtByPage.ubtDevTrace) {
    try {
      sendUbtByPage.ubtDevTrace(key, value)
    } catch (error) {
      console.warn(error);
    }
  }
};

//版本号检测
const version = (curV, reqV) => {
  var arr1 = curV.split(".");
  var arr2 = reqV.split(".");

  var maxL = Math.max(arr1.length, arr2.length);
  var pos = 0;
  var diff = 0;

  while (pos < maxL) {
    diff = parseInt(arr1[pos]) - parseInt(arr2[pos]);
    console.log(diff, parseInt(arr1[pos]), parseInt(arr2[pos]))
    if (diff != 0) {
      break;
    }
    pos++;
  }
  if (diff > 0 || diff == 0) {
    //新版本、稳定版
    return 1
  } else {
    // 旧版本
    return 0
  }
}

module.exports = {
  formatDuring,
  abValue,
  currentEnv, 
  logWithUbtTrace,
  logWithUbtMetric,
  logWithUbtDevTrace,
  version
}