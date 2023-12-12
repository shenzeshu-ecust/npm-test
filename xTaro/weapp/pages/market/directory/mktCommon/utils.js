import {
  cwx,
  CPage,
  __global
} from "../../../../cwx/cwx.js";

function savePic(url) {
  try {
    return new Promise((resolve, reject) => {
      if (wx.saveImageToPhotosAlbum) {
        wx.saveImageToPhotosAlbum({
          filePath: url,
          success: function (res) {
            wx.showToast({
              title: '保存成功',
              icon: 'none',
              mask: true,
              duration: 2000
            });
            resolve(res)
          },
          fail: function (res) {
            console.log(res);
          }
        })
      } else {
        // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
        wx.showModal({
          title: '提示',
          content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
        })
      }
    })
  } catch (error) {}
}


/**
 * 保存图片到手机相册
 * @param [String] url 图片网络路径
 */
const toSave = function (url) {
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.writePhotosAlbum'] == undefined) {
          console.log("undefined");
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              savePic(url).then(res => {
                resolve()
              })
            },
            fail() {
              console.log("未授权");
              console.log(res);
              reject()
            }
          })
        } else if (res.authSetting['scope.writePhotosAlbum'] == false) {
          console.log("false");
          wx.hideLoading();
          wx.showModal({
            title: "提示",
            content: "相册系统未授权，请重新授权并保存图片",
            success: function (stRes) {
              if (stRes.confirm) {
                wx.openSetting({
                  success(res) {
                    //重新授权
                    resolve()
                  }
                })
              } else if (stRes.cancel) {
                console.log('用户点击取消');
                reject()
              }
            }
          })
        } else {
          console.log("true");
          savePic(url).then(res => {
            resolve()
          })
        }
      },
      fail(res) {
        console.log("fail");
        console.log(res);
        wx.authorize({
          scope: 'scope.writePhotosAlbum',
          success() {
            savePic(url).then(res => {
              resolve()
            })
          },
          fail() {
            console.log("未授权");
            console.log(res);
            reject
          }
        })
      }
    })
  })

}

/**
 * 跳转链接
 * @param {*} targetUrl 
 * @param {*} cb 
 */
const goTargetUrl = (targetUrl, cb) => {
  if (targetUrl) {
    // 跳转独立小程序
    if (targetUrl.indexOf("thirdAppId") > 0) {
      wx.navigateToMiniProgram({
        appId: getUrlQuery(targetUrl, "thirdAppId"),
        path: targetUrl.trim(),
        extraData: {},
        success(res) {
          // console.info('独立小程序打开成功：',res);
        },
      });
    } else if (
      targetUrl.indexOf("https://") == 0 ||
      targetUrl.indexOf("http://") == 0
    ) {
      // 跳转H5页面
      cwx.component.cwebview({
        data: {
          url: encodeURIComponent(targetUrl),
        },
      });
    } else {
      cwx.navigateTo({
        url: targetUrl.trim(),
        fail: function (e) {
          cb && cb(e);
        },
      });
    }
  } else {
    cb && cb();
  }
}

/**
 * 随机数
 */
function roll(min, max) {
  return Math.round(Math.random() * (max - min)) + min;
}

/**
 * 处理 from 信息
 * @param {*} str 
 */
function regStr(str) {
  if (!str) return
  const arr = str.split(/{{.*}}/)
  const tempStr = str.match(/\{{.*\}}/)?.[0]?.replace("{{", "")?.replace("}}", "") || ''
  arr.splice(1, 0, tempStr)
  return arr
}

const isChinese = (temp) => {
  let re = new RegExp("[\\u4E00-\\u9FFF]+", "g");
  return re.test(temp);
};
const isEnglish = (temp) => {
  let re = new RegExp("[A-Za-z]+");
  return re.test(temp);
};
const isNumber = (temp) => {
  let re = new RegExp("[0-9]+");
  return re.test(temp);
};
const resolveNicknameTooLong = (text) => {
  if (!text) return ""
  let arr = text.split("");
  let len = 0;
  let ret = "";
  for (let i = 0; i < arr.length; i++) {
    let item = arr[i];
    if (isChinese(item)) {
      len += 17;
      ret += item;
    } else if (isEnglish(item) || isNumber(item)) {
      len += 10;
      ret += item;
    } else {
      len += 17;
      ret += item;
    }
    if (len >= 100 && i < arr.length - 1) {
      return ret + "...";
    }
  }
  return ret;
};

const rpxToPx = (rpx) => {
  let px = rpx * (wx.getSystemInfoSync().windowWidth / 750)
  return px
}

const authCamera = (sucessCb, failCb) => {
  wx.getSetting({
    success(res) {
      if (res.authSetting['scope.camera'] == undefined) {
        wx.authorize({
          scope: 'scope.camera',
          success() {
            sucessCb()
          },
          fail() {
            console.log("未授权");
            console.log(res);
            failCb()
          }
        })
      } else if (res.authSetting['scope.camera'] == false) {
        wx.showModal({
          title: "提示",
          content: "摄像头未授权，请重新授权",
          success: function (stRes) {
            if (stRes.confirm) {
              wx.openSetting({
                success(res) {
                  //重新授权
                  // sucessCb()
                }
              })
            } else if (stRes.cancel) {
              console.log('用户点击取消');
              failCb()
            }
          }
        })
      } else {
        sucessCb()
      }
    },
    fail(res) {
      console.log("fail");
      console.log(res);
      wx.authorize({
        scope: 'scope.camera',
        success() {},
        fail() {
          console.log("未授权");
          console.log(res);
        }
      })
    }
  })
}

const compareVersion = (v1, v2) => {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}
/**
 * @param doLast 是否执行最后一次
 */
const throttle = function (func, wait) {
  let timeout;
  return function () {
    let context = this;
    let args = arguments;
    if (!timeout) {
      timeout = setTimeout(() => {
        timeout = null;
        func.apply(context, args)
      }, wait)
    }
  }
}

/**
 * 返回rgb对应的hsl
 * @param {*} r 
 * @param {*} g 
 * @param {*} b 
 */
function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

const debounceFunc = (fn, interval) => {
  var timer;
  var gapTime = interval || 500; //间隔时间，如果interval不传，则默认1000ms
  return function () {
    clearTimeout(timer);
    var context = this;
    var args = arguments; //保存此处的arguments，因为setTimeout是全局的，arguments不是防抖函数需要的。
    timer = setTimeout(function () {
      fn.call(context, ...args);
    }, gapTime);
  };
}

function judgeProtect(successCb, failCb) {
  if (wx.getStorageSync('PERSONAL_INFO_AUTHORIZATION_CACHE') === '1' || wx.getStorageSync('PERSONAL_INFO_AUTHORIZATION_CACHE') === '2') {
    successCb && successCb()
  } else {
    cwx.Observer.addObserverForKey("privacy_authorize", (e) => {
      if (e.agree) {
        successCb && successCb()
      } else {
        failCb && failCb()
      }
    })
  }
}

function backPrevPage() {
  console.log('返回上一个页面')
  const pages = getCurrentPages();
  const hasPrevPage = pages.length > 1 ? true : false;
  const canIUseExit = wx.canIUse("exitMiniProgram");
  if (hasPrevPage) {
    cwx.navigateBack()
  } else {
    if (canIUseExit) {
      // 退出小程序
      wx.exitMiniProgram({
        success: () => {
          console.log("退出小程序成功")
        },
        fail: () => {
          console.error("退出小程序失败")
        },
        complete: () => {},
      });
      return true;
    }
    return false;
  }
}

export {
  toSave,
  goTargetUrl,
  roll,
  regStr,
  resolveNicknameTooLong,
  rpxToPx,
  authCamera,
  compareVersion,
  throttle,
  rgbToHsl,
  judgeProtect,
  debounceFunc,
  backPrevPage
}