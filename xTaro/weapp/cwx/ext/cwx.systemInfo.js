// 同步获取设备信息
let systemInfo = null;

if(!systemInfo) {
  getSystemInfoSync(); // 调用这个函数时，自动会把结果存到内存变量中的
}

function getSystemInfoSync(useCache = true) {
  // console.log('是否使用缓存的设备信息：', useCache);
  if(useCache && systemInfo && typeof systemInfo === 'object' && Object.keys(systemInfo).length) {
    return systemInfo;
  }

  // 不使用缓存数据 / 内存变量中没有有效值，都需要重新调同步API，获取设备信息后再返回
  console.log('调用原生API获取设备信息');
  systemInfo = wx.getSystemInfoSync();
  // 绑定微信版本
  if (!systemInfo.SDKVersion && systemInfo.version) {
      systemInfo.SDKVersion = systemInfo.version;
  }
  console.log(systemInfo);
  return systemInfo;
}

export default {
  systemInfo,
  getSystemInfoSync
}