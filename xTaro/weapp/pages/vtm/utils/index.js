// http://tripdocs.nfes.ctripcorp.com/tripdocs/book?dynamicDir=189&docId=1410
import { cwx } from "../../../cwx/cwx.js";

function sendExposeData(options){
  const { exposeData } = options
  console.log(exposeData, 'options.exposeData')
  return {
    exposeData
  }
}

function judgeProtect(successCb, failCb) {
  if (wx.getStorageSync('PERSONAL_INFO_AUTHORIZATION_CACHE') === '1' || wx.getStorageSync('PERSONAL_INFO_AUTHORIZATION_CACHE') === '2') {
    console.log("vtmmmm原来就同意过");
    successCb && successCb()
  } else {
    cwx.Observer.addObserverForKey("privacy_authorize", (e) => {
      if (e.agree) {
        console.log("vtmmmm用户同意");
        successCb && successCb()
      } else {
        console.log("vtmmmm用户不同意");
        wx.exitMiniProgram({
          success: () => {
          },
          fail: () => {
          },
          complete: () => { },
        });
      }
    })
  }
}

export {
  sendExposeData,
  judgeProtect
};