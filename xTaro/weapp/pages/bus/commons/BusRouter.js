import { cwx, __global } from './cwx/index';
import URLUtil from './URLUtil';
import { point } from './utils/traceStep';
import { pageId, RouterMap } from './bus.pageConfig';

let loginFunc = cwx.user.login

function isPdf(url) {
  if (url.endsWith('.pdf')) {
      return true;
  }
  return false;
}

var Router = {
  setLoginFunc(wrapedFunc) {
    loginFunc = wrapedFunc
  },
  autoLogin() {
    // 自动微信授权登录
    return new Promise((resolve, reject) => {
      const _fail = (err) => {
        resolve({ isLogin: false });
      };
      const _success = (res) => {
        resolve({ isLogin: true });
      };
      const loginBlock = (data) => {
        const block = () => {
          cwx.user.getThirdToken(
            {
              detail: {
                errMsg: 'getUserInfo:ok',
              },
            },
            (code, functionName, message, token) => {
              if (code === 0) {
                cwx.user.thirdTokenLogin(
                  token,
                  (code1, functionName1, message1) => {
                    if (code1 === 0) {
                      _success();
                    } else {
                      _fail();
                    }
                  }
                );
              } else {
                _fail;
              }
            }
          );
        };
        if (cwx.user.wechatcode == '') {
          cwx.user.wxLogin((code) => {
            // 尝试发起自动登录流程
            if (code == 0) {
              block();
            } else {
              _fail();
            }
          });
        } else {
          block();
        }
      };
      loginBlock();
    });
  },
  pageId: function (page, isPromotion) {
    return pageId(page, isPromotion);
  },
  checkInTab: function (name) {
    var page = RouterMap[name];

    var inTab = false;
    if (page && __global.tabbar.indexOf(page) >= 0) {
      inTab = true;
    }
    return inTab;
  },
  navigateTo: function (name, params, needLogin, pagelevel) {
    var scb = (isLogin) => {
      var url = Router.map(name, params, needLogin, true);
      if (!url) {
        return;
      }
      if (Router.checkInTab(name)) {
        cwx.reLaunch({
          url: url,
        });
        return;
      }
      //传入didLogin代表在上一级页面已经检查过登录态避免重复检查
      if (url.indexOf('http') == 0) {


        var path = `/cwx/component/cwebview/cwebview?data={"url":"${encodeURIComponent(
          url
        )}","needLogin":${
          needLogin ? true : false
        },"isNavigate":true, "observerKey":"__bus_cwebmesssage__"}`;
        cwx.navigateTo({
          url: path,
        });
      } else {
        Router._navigateTo(
          URLUtil.serializeURL(url, { didLogin: isLogin }),
          pagelevel
        );
      }
    };
    if (needLogin) {
      Router.checkLogin(needLogin, function ({ isLogin }) {
        if (isLogin) {
          scb(true);
        }
      });
    } else {
      scb(false);
    }
  },
  isLogin(onlineCheck) {
    return new Promise((resolve, reject) => {
      if (onlineCheck) {
        cwx.user.checkLoginStatusFromServer((isLogin) => {
          resolve({ isLogin });
        });
      } else {
        resolve({ isLogin: cwx.user.isLogin() });
      }
    });
  },
  checkLoginWithNonmember: function (isNonmeber) {
    return Router.isLogin(true).then(({ isLogin }) => {
      if (isLogin) {
        return { isLogin };
      } else {
        // 使用微信直接登录，如果登录失败再走非会员登录
        const login = () => {
          return new Promise((resolve) => {
            let loginCallback = (res) => {
              if (res && parseInt(res.ReturnCode) === 0) {
                point({
                  pointName: 'afterLogin',
                  result: 1,
                  ext: '微信登录成功',
                });
                resolve({ isLogin: true });
              } else {
                point({
                  pointName: 'afterLogin',
                  result: 0,
                  ext: '微信登录失败',
                  errMsg: JSON.stringify(res),
                });
                resolve({ isLogin: false });
              }
            };
            loginFunc({
              callback: loginCallback,
            });
          });
        };
        if (isNonmeber) {
          return Router.autoLogin().then(({ isLogin }) => {
            if (isLogin) {
              return { isLogin };
            } else {
              console.warn('user not login');
              if (cwx.user.nonmemberLogin) {
                return new Promise((resolve) => {
                  console.warn('user nonmeber login');
                  cwx.user.nonmemberLogin((res) => {
                    if (res && parseInt(res.returnCode, 10) === 0) {
                      point({
                        pointName: 'afterLogin',
                        result: 1,
                        ext: '非会员登录成功',
                      });
                      console.warn('user nonmeber login success');
                      resolve({ isLogin: true });
                    } else {
                      point({
                        pointName: 'afterLogin',
                        result: 0,
                        ext: '非会员登录失败',
                        errMsg: JSON.stringify(res),
                      });
                      resolve({ isLogin: false });
                    }
                  });
                });
              } else {
                return login();
              }
            }
          });
        } else {
          return login();
        }
      }
    });
  },
  checkLogin: function (needLogin, callBack) {
    return new Promise(function (resolve, reject) {
      Router.isLogin(needLogin > 1)
        .then(({ isLogin }) => {
          return { isLogin };
        })
        .then(({ isLogin }) => {
          if (!isLogin) {
            var currentPage = cwx.getCurrentPage();

            var loginCallback = (res) => {
              if (res && res.ReturnCode == 0) {
                callBack && callBack({ isLogin: true });
                resolve({ isLogin: true });
              } else {
                callBack && callBack({ isLogin: false });
                resolve({ isLogin: false });
              }
            };

            if (currentPage.showLoginWindow) {
              //简单模式登录
              currentPage.showLoginWindow({
                callback: loginCallback,
              });
            } else {
              loginFunc({
                callback: loginCallback,
              });
            }
          } else {
            callBack && callBack({ isLogin: true });
            resolve({ isLogin: true });
          }
        });
    });
  },
  navigateBack: function () {
    var pages = getCurrentPages();

    if (pages.length > 1) {
      cwx.navigateBack();
    } else {
      this.redirectTo('index');
    }
  },
  //返回到指定页面如果不在页面栈 navigateTo
  navigateBackTo: function (name, params, needLogin, pagelevel) {
    var scb = () => {
      var page = RouterMap[name];
      if (!page) {
        console.error(name, '----页面存在或不在配置列表');
        return;
      }
      if (Router.checkInTab(name)) {
        cwx.switchTab({
          url: url,
        });
        return;
      }

      var pages = getCurrentPages();
      var index = pages.findIndex(function (currentValue, index, arr) {
        return currentValue.route === page;
      });

      if (index >= 0) {
        cwx.navigateBack({
          delta: pages.length - index - 1,
        });
      } else {
        //不在页面栈，
        var url = (url = '/' + page + '?' + URLUtil.serializeParams(params));
        Router._navigateTo(url, pagelevel);
      }
    };
    if (needLogin) {
      Router.checkLogin(needLogin, function ({ isLogin }) {
        if (isLogin) {
          scb();
        }
      });
    } else {
      scb();
    }
  },

  navigateToMini(name, params) {
    var url = Router.map(name, { ...params }, true, false);
    cwx.reLaunch({
      url: url,
    });
  },
  redirectTo: function (name, params, needLogin, pagelevel) {
    var scb = (isLogin) => {
      var url = Router.map(name, params, needLogin, false);
      if (!url) {
        return;
      }
      if (Router.checkInTab(name)) {
        cwx.reLaunch({
          url: url,
        });
        return;
      }
      if (url.indexOf('http') == 0) {
        var path = `/cwx/component/cwebview/cwebview?data={"url":"${encodeURIComponent(
          url
        )}","needLogin":${needLogin ? true : false},"isNavigate":false}`;
        cwx.redirectTo({
          url: path,
        });
      } else {
        Router._redirectTo(url, pagelevel);
      }
    };

    if (needLogin) {
      Router.checkLogin(needLogin, function ({ isLogin }) {
        if (isLogin) {
          scb();
        }
      });
    } else {
      scb();
    }
  },
  reLaunch: function (name, params, needLogin) {
    var url = Router.map(name, params, needLogin, false);
    if (!url) {
      return;
    }
    if (needLogin) {
      Router.checkLogin(needLogin, function () {
        cwx.reLaunch({
          url: url,
        });
      });
    } else {
      cwx.reLaunch({
        url,
      });
    }
  },

  _redirectTo: function (url, level) {
    if (!level || level > 10) {
      level = 10;
    }
    var pages = getCurrentPages();
    var pagelevel = pages.length;
    if (pagelevel > level) {
      var delta = pagelevel - level + 1;
      Router._backAndPush(delta, url);
    } else {
      cwx.redirectTo({ url });
    }
  },
  _navigateTo: function (url, level) {
    if (!level) {
      level = 10;
    }
    var pages = getCurrentPages();
    if (pages.length >= level) {
      Router._redirectTo(url, level);
    } else {
      cwx.navigateTo({ url });
    }
  },
  _backAndPush: function (delta, url) {
    // var self = this;
    cwx.navigateBack({
      delta: delta,
      success: (data) => {
        setTimeout(() => {
          wx.showToast({
            title: '...请稍后',
            icon: 'loading',
            duration: 1000,
            mask: true,
          });
        }, 100);
      },
    });
    setTimeout(() => {
      wx.hideToast();
      cwx.navigateTo({ url });
    }, 1000);
  },

  map: function (name, params, needLogin, isNavigate = false) {
    var page = RouterMap[name];
    var url = '';
    if (!page) {
      if (typeof name == 'undefined') {
        return url;
      }
      if (name.indexOf('/') === 0) {
        url = name;
      } else if (name.indexOf('http') === 0) {

        var path  = '';
        if (isPdf(name)) {
          name = `https://m.ctrip.com/webapp/draw/pdfViewer?file=${encodeURIComponent(name)}`
          path = `/pages/bus/web/index?url=${encodeURIComponent(
            URLUtil.serializeURL(name, params)
          )}`
        } else {
          var path = `/cwx/component/cwebview/cwebview?data={"url":"${encodeURIComponent(
            URLUtil.serializeURL(name, params)
          )}","needLogin":${
            needLogin ? true : false
          },"isNavigate":${isNavigate}}`;
        }
    
        return path;
      } else {
        return '/' + name;
      }
    } else {
      url = '/' + page + '?' + URLUtil.serializeParams(params);
    }
    if (url.indexOf('pages/bus/list/list') > 0) {
      url = url.replace('pages/bus/list/list', 'pages/bus/taro/list/index');
    }
    return url;
  },
};

export default Router;
