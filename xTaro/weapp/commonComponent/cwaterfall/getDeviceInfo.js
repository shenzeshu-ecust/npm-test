import { cwx } from '../../cwx/cwx';
/**
 * 获取设备和系统信息
 * @param {function} callback
 */
function getDeviceInfo(callback) {
  cwx.getSystemInfo({
    success (res) {
      const {system = '', platform = ''} = res;
      const systemArr = system.split(' ');
      const info = {
        screenHeight: res.screenHeight,
        screenWidth: res.screenWidth,
        deviceType: '',
        os: systemArr[0],
        osv: systemArr[1],
        type: "MINIAPP"
      };
      if(platform.toLowerCase() == 'windows' || platform.toLowerCase() == 'mac') {
        info.deviceType = 'PC';
      } else {
        info.deviceType = 'PHONE';
      }
      callback && callback(info);
    },
    fail(error) {
      console.log('[getDeviceInfo]获取设备及系统信息失败:', error);
    }
  })
}

export default getDeviceInfo;
