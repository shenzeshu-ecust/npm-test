// 个人信息保护指引页
import { cwx, __global } from '../../cwx';
import { setUserAllowCache, setUserRejectCache, getUserAuthStatus } from "../../ext/perInfoProtect/checkRediToGuide"
import { addComponentToMap, removeComponentFromMap, canIUseExit, handleUserChoice, exitMiniProgram } from "../../ext/applyForAuth/privacyAuthorize";

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    forceExitMiniapp: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false, // 是否显示
    canIUseExit: canIUseExit,
    rejectBtnText: canIUseExit ? "不同意" : "若您不同意，请点击右上角关闭小程序", // 低版本不支持这个API时，显示另一个提示文案
    descList: [
      // 一个段落的内容
      [{
        text: "感谢您使用携程旅行！",
      }],
      // 一个段落的内容
      [{
          text: "我们非常重视您的个人信息和隐私保护。依据最新法律法规要求，我们更新了",
        },
        {
          text: "《个人信息保护指引》",
          url: "https://contents.ctrip.com/activitysetupapp/mkt/index/infopectionguide?popup=close"
        },
        {
          text: "。",
        },
      ],
      // 一个段落的内容
      [{
          text: "为向您提供更好的旅行服务，在使用我们的产品前，请您阅读完整版",
        },
        {
          text: "《服务协议》",
          url: "https://contents.ctrip.com/huodong/privacypolicyh5/index?type=1"
        },
        {
          text: "和",
        },
        {
          text: "《个人信息保护指引》",
          url: "https://contents.ctrip.com/activitysetupapp/mkt/index/infopectionguide?popup=close"
        },
        {
          text: "的所有条款，包括：",
        },
      ],
      // 一个段落的内容
      [{
        text: "1、为向您提供包括账户注册、旅游服务预订、交易支付在内的基本功能，我们可能会基于具体业务场景收集您的个人信息；",
      }, ],
      // 一个段落的内容
      [{
        text: "2、我们会基于您的授权来为您提供更好的旅行服务，这些授权包括定位（为您精确推荐附近的优质旅游资源）、设备信息（为实现信息推送，保障账户和交易安全，获取包括IMEI、 IMSI、MAC在内的设备标识符）、存储权限（更改头像、发送社区动态、保存图片到本地等），您有权拒绝或取消这些授权；",
      }, ],
      // 一个段落的内容
      [{
        text: "3、我们会基于先进的技术和管理措施保护您个人信息的安全；",
      }, ],
      // 一个段落的内容
      [{
        text: "4、未经您的同意，我们不会将您的个人信息共享给第三方；",
      }, ],
      // 一个段落的内容
      [{
        text: "5、为向您提供更好的携程网络会员服务，您同意提供及时、详尽及准确的个人资料；",
      }, ],
      // 一个段落的内容
      [{
        text: "6、您在享用携程网络会员服务的同时，授权并同意接受携程向您的电子邮件、手机、通信地址等发送商业信息，包括不限于最新的携程产品信息、促销信息等。若您选择不接受携程提供的各类信息服务，您可以按照携程提供的相应设置拒绝该类信息服务。",
      }, ],
    ]
  },

  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () {
        // console.log("perInfoProtectFloat attached ------")
    },
    ready: function () {
      console.log("%c [个保指引组件] ready", "color: red;")
      // 没有在 pageLifetimes 的 show 里做处理是因为，Taro 页面不会触发 pageLifetimes 的 show
      if (this.data.show) {
        return;
      }

      // 将 guid 绑定到组件实例上，方便后续移除
      this.guid = addComponentToMap(this);

      // 判断 isShowGuideComponent 为 true 则将 show 置为 true
      const curPageList = getCurrentPages();
      const currentPage = curPageList.length && curPageList[curPageList.length - 1] || {};
      // const isShow = currentPage.isShowGuideComponent && this.properties.forceExitMiniapp;
      const isShow = currentPage.isShowGuideComponent;
      console.log("%c [个保指引组件] isShow:", "color: red;", isShow)
      if (isShow || currentPage._authTimer) {
        console.log("%c [个保指引组件] 需显示授权弹窗", "color: red;")
        if (currentPage._authTimer) {
          clearTimeout(currentPage._authTimer);
          currentPage._authTimer = null;
        }
        this.handleShow();
        if (__global.tabbar.includes(cwx.getCurrentPageRouter(currentPage))) {
          console.log("%c [个保指引组件] 是 tabbar 页面，才需要隐藏 tabbar", "color: red;")
          wx.hideTabBar()
          this.hideTabBar = true; // 添加标志位
        }
      }
      cwx && cwx.sendUbtByPage && cwx.sendUbtByPage.ubtDevTrace(`weapp_perInfoProtect_component_ready`, {
        canIUseExit,
        isShowGuideComponent: currentPage.isShowGuideComponent,
        hideTabBar: this.hideTabBar
      });
    },
    moved: function () { },
    detached: function () {
      // 从组件实例上获取 guid, 并移除
      const guid = this.guid;
      guid && removeComponentFromMap(guid);
    },
    error: function (err) {
        cwx && cwx.sendUbtByPage && cwx.sendUbtByPage.ubtDevTrace(`weapp_perInfoProtect_component_error`, {
            errStack: err && err.stack || '',
            errMsg: err && err.message || ''
        });
    }
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () {
        // console.log("perInfoProtectFloat page show ------")
        // 重新检查授权状态
        if (this.data.show && getUserAuthStatus()) {
          console.log("%c [个保指引组件] 用户在另一个页面点击了同意授权，当前页面可以隐藏授权弹窗了", "color: red;")
            this.handleAgree()
        }
    },
    hide: function () { },
    resize: function () { },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleShow: function () {
        cwx && cwx.sendUbtByPage && cwx.sendUbtByPage.ubtDevTrace(`weapp_perInfoProtect_component_handleShow`, {});
        console.log("%c [个保指引组件] 显示授权弹窗", "color: red;")
        this.setData({ show: true });
        cwx.Observer.noti("privacy_authorize_show", {
            isShow: true,
            pagePath: cwx.getCurrentPageRouter()
        });
    },
    handleHide: function () {
        cwx && cwx.sendUbtByPage && cwx.sendUbtByPage.ubtDevTrace(`weapp_perInfoProtect_component_handleHide`, {});
      console.log("%c [个保指引组件] 隐藏授权弹窗", "color: red;")
      this.setData({ show: false });

      if (this.hideTabBar) {
        console.log("%c [个保指引组件] 用户点击同意，显示 tabbar", "color: red;")
        wx.showTabBar()
        this.hideTabBar = false; // 添加标志位
      }
      cwx.Observer.noti("privacy_authorize_hide", {
          isShow: true,
          pagePath: cwx.getCurrentPageRouter()
      });
    },
    navToUrl: function (e) {
      if (e && e.target && e.target.dataset && e.target.dataset.url) {
        wx.navigateTo({
          url: '/cwx/component/cwebview/cwebview?data=' + JSON.stringify({
            url: encodeURIComponent(e.target.dataset.url)
          })
        })
      }
    },

    handleAgreePrivacyAuthorization: function (e) {
      console.log("%c [个保指引组件] 用户点击同意，上报给微信", "color: red;");
      handleUserChoice(true);
    },

    handleAgree: function (e) {
      console.log("%c [个保指引组件] 用户点击同意，本地缓存记录用户选择", "color: red;")
      if (e) {
        setUserAllowCache();
      }
      this.handleHide()
      const curPageList = getCurrentPages()
      const currentPage = curPageList.length && curPageList[curPageList.length - 1] || {};
      currentPage.isShowGuideComponent = false; // 置为否，避免跳转到别的页面再返回，又展示个保指引弹窗
      cwx.Observer.noti("privacy_authorize", {
        agree: true
      })
      cwx && cwx.sendUbtByPage && cwx.sendUbtByPage.ubtDevTrace(`weapp_perInfoProtect_component_handleAgree`, {});
    },
    handleReject: function (e) {
      console.log("%c [个保指引组件] 用户点击不同意，拒绝授权", "color: red;")
      cwx && cwx.sendUbtByPage && cwx.sendUbtByPage.ubtDevTrace(`weapp_perInfoProtect_component_handleReject`, {});

      handleUserChoice(false);
      setUserRejectCache();
      cwx.Observer.noti("privacy_authorize", {
        agree: false
      })

      // 如果是需要退出小程序的页面：退出小程序；不需要退出小程序的页面：发埋点，并隐藏组件
      if (this.properties.forceExitMiniapp) {
        if (!canIUseExit) {
            return;
        }
        exitMiniProgram("用户点击不同意，拒绝授权");
      } else {
        this.handleHide()
      }
    },
  }
})
