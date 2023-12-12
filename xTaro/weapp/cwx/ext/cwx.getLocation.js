import handleAsyncBaseClass from './handleAsyncBaseClass.js';

const filePath = '../../commonAPI/cwx.getLocation.js';
const func2CheckExist = 'getLocation'; // 根据 module 上是否包含这个属性来判断 require 成功与否

let handleAsync = new handleAsyncBaseClass({
  filePath, 
  func2CheckExist
})

function getLocation({
  success,
  fail,
  complete,
  type,
  interval,
  manual
}) {
  handleAsync.handleFunction('getLocation', {
    success,
    fail,
    complete,
    type,
    interval,
    manual
  }, {
    fail,
    complete
  })
}

/**
 * 内部暂时不存在cancel的情况，后续再查看该方法如何处理
 * @param uuid
 */
function cancelGetLocationWithUUID(uuid) {
  handleAsync.handleFunction('cancelGetLocationWithUUID', uuid, {
    fail: function(res) {
      console.log('fail res:', res);
    }
  })
}

export default getLocation;
export {
  cancelGetLocationWithUUID,
  getLocation
}