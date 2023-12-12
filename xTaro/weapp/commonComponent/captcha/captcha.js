/**
 * @module captcha验证码组件
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    settings: {
      type: JSON
    },
    refresh: {
      type: Boolean,
      observer: function(newVal, oldVal, changedPath) {
        if (this.data.ready && newVal) {
          this.refresh();
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    appId: undefined, //申请的appId值
    businessSite: undefined, //申请的businessSite值
    dev: 'uat', //环境
    version: '1.0.0', //插件版本号
    width: '278px', //滑块宽度
    height: '38px', //滑块高度
    widthNum: 278, //滑块宽度值
    heightNum: 38, //滑块高度值
    margin: 'auto', //滑块边距
    textslider: true, //文字光影特效
    language: 'zh_CN', //微信设置的语言
    select_language: '', //选字语言
    openid: '', // 小程序的用户openid
    unionid: '', // 小程序的用户unionid
    model: '', // 用户手机型号
    wx_version: '', // 微信版本号
    gpsLatitude: '', // GPS横坐标
    gpsLongitude: '', // GPS纵坐标
    country: '', // 国家
    province: '', // 省份
    city: '', // 城市
    duid: '', // 携程duid
    windowWidth: 0, //窗口宽度
    windowHeight: 0, //窗口高度
    selectPosition: 'absolute', //选字框定位方式
    selectPicWidth: undefined, //选字大图宽度
    selectPicHeight: undefined, //选字大图高度
    selectType: 'pop', //选字框浮动方式
    stateChange: function() {}, //状态监听函数
    onSelectFail: function() {}, //选字错误后调用的函数
    onSelectClose: function() {}, //单击选字右上角叉后调用的函数
    resultHandler: function() {}, //风险检测结果
    baseUrl: 'https://ic.ctrip.uat.qa.nt.ctripcorp.com/', //校验接口地址默认uat
    errorUrl: 'https://gateway.m.uat.qa.nt.ctripcorp.com/restapi/infosec/', //错误日志接口地址默认uat
    interface_obj: {
      inter_base: 'captcha/',
      risk_inspect_app: 'risk_inspect_app',
      verify_slider_app: 'verify_slider_app',
      verify_text_app: 'verify_text_app',
      refresh_text_app: 'refresh_text_app',
      data_js: 'data/js'
    },
    loadingBoxHeight: 38, //loading框的height属性
    loadingImgMarginTop: 4, //loading图标的margin-top属性
    loadingBoxBgColor: '#f7f9fa', //loading框的background属性
    loadingBoxBorder: '1px solid #e4e7eb', //loading框的border属性
    loadingImgShow: 'inline-block', //loading加载gif的display属性
    loadingBoxShow: 'block', //loading框的display属性
    loadingInfoBoxHeight: 38, //loadingInfo框的height属性
    loadingInfoBoxLeft: '', //loadingInfo框的left属性
    loadingInfoBoxPos: '', //loadingInfo框的position属性
    loadingInfoBoxShow: 'none', //loadingInfo框的display属性
    loadingContentMarginTop: 10.5, //loadingContent框的margin-top属性
    loadingIconContentShow: 'none', //loadingContent框的display属性
    loadingRightShow: 'none', //loading成功图标的display属性
    loadingErrorShow: 'none', //loading错误图标的display属性
    loadingInfo: '', //loading检测结果文本
    loadingTextLineHeight: 38, //loading检测结果文本的line-height属性
    loadingTextColor: '#52ccba', //loading检测结果文本颜色
    loadingInfoInterval: null, //风险校验提示语滚动定时器
    moveStartX: 0, //滑块按钮的起始位置
    moveSlideBtnWidth: 40, //滑块按钮容器的width属性
    moveSlideBtnHeight: 40, //滑块按钮容器的height属性
    moveSlideBtnLeft: 0, //滑块按钮容器的left属性
    moveSlideBgWidth: 38, //滑块拖动后背景的width属性
    moveSlideBgHeight: 38, //滑块拖动后背景的Height属性
    moveSlideBtnTrans: 'none', //滑块动效
    cptDropBgClass: 'cpt-drop-bg-default', //滑块拖动背景的css样式
    slideBtnWidth: 36, //滑块按钮的width属性
    slideBtnHeight: 36, //滑块按钮的height属性
    slideBtnBgColor: '#4B9EEA', //滑块按钮的背景色
    slideBtnShadow: 'none', //滑块按钮的阴影
    slideBgColor: 'transparent', //滑块拖动背景颜色
    slideBgBorder: '1px solid transparent', //滑块拖动背景边框
    slideBgTrans: 'background 0.2s linear, border 0.2s linear', //滑块拖动背景动效
    logoBgPosition: '-1px 0px !important', //滑块logo背景位置
    moveable: true, //是否可滑动
    refreshable: false, //是否可刷新
    startTs: null, //起始滑动时间
    endTs: null, //结束滑动时间
    scrollList: [], //滑块轨迹数据
    timezone: new Date().getTimezoneOffset(), //获取时区
    auto: null,
    verify_msg: null, //风险校验参数
    cptImgClass: 'cpt-img-outer', //滑块logo容器类
    logoTransform: 'rotate(0deg) translateY(0)', //滑块logo变换属性
    logoOuterTransform: 'rotate(0deg)', //滑块logo容器变换属性
    deg: 0, //滑块logo旋转角度数值
    degMark: 0, //旋转标记：0顺时针1逆时针
    bgBarHeight: 38, //信息容器的height属性
    bgBarLineHeight: 38, //信息容器的line-height属性
    bgBarOpacity: 1, //信息容器的透明度属性
    infoBoardColor: '#566980', //信息文本颜色
    cptInfo: '', //提示信息文本
    infoBoardHeight: 38, //提示语的height属性
    infoBoardLeft: '', //提示语左边距
    infoBoardPosition: '', //提示语定位
    infoBoardBg: '', //提示语背景
    infoBoardFillColor: '', //提示语文本填充色
    cptInfoInterval: null, //提示语滚动定时器
    textSliderInter: null, //文字光影效果定时器
    selectShow: 'none', //选字是否显示
    selectBgShow: 'none', //选字背景是否显示
    selectBoxWidth: '', //选字框width属性
    selectBoxHeight: '', //选字框height属性
    selectBoxLeft: '-160', //选字框margin-left属性
    selectBoxTop: '-169.5', //选字框margin-top属性
    selectMsgBoxWidth: '', //选字框提示语文本容器width属性
    selectMsgLeft: '', //选字框提示语left属性
    selectMsgPosition: '', //选字框提示语position属性
    selectChooseMsg: '', //选字框提示语文本
    selectInfoInterval: null, //选字框提示语滚动定时器
    selectRefreshShow: 'block', //选字刷新图标display属性
    selectLoadingShow: 'none', //选字loading图标display属性   
    smallImgWidth: '120', //选字小图容器width属性
    smallImgHeight: '40', //选字小图容器height属性
    bigImgWidth: '300', //选字大图容器width属性
    bigImgHeight: '200', //选字大图容器height属性
    signList: [], //选字选择标记
    signCount: 0, //已选字个数
    selectLeft: 0, //选字框左边距
    selectTop: 0, //选字框顶距
    submitText: '', //选字提交按钮文本,
    inputStartTs: null, //选字弹窗时间
    inputEndTs: null, //选字提交时间
    warnText: '', //错误提示语
    warnTextObj: {
      'zh_CN': '出错啦，麻烦亲重新进入小程序尝试噢',
      'zh_TW': '出錯啦，麻煩請重新進入小程序嘗試噢',
      'zh_HK': '出錯啦，麻煩請重新進入小程序嘗試噢',
      'en': 'Something went wrong, please try running the applet again.',
      'ja': '何か問題が発生しました。再度アプレットを実行してみてください。',
      'ko': '문제가 발생했습니다. 애플릿을 다시 실행하십시오.',
      'fr': 'Quelque chose a mal tourné, veuillez essayer à nouveau de lancer l`applet.',
      'de': 'Es ist ein Fehler aufgetreten. Versuchen Sie, das Applet erneut auszuführen.',
      'es': 'Algo salió mal, intente ejecutar el applet de nuevo.',
      'ru': 'Что-то пошло не так, попробуйте снова запустить апплет.',
      'id': 'Terjadi kesalahan, coba jalankan applet lagi.',
      'ms': 'Ada masalah, sila cuba jalankan applet lagi.',
      'th': 'เกิดข้อผิดพลาดโปรดลองเรียกใช้แอพเพล็ตอีกครั้ง',
      'vi': 'Đã xảy ra sự cố, vui lòng thử chạy lại applet.',
      'it': "Sbagliato, per favore reinserisci l'applet per riprovare.",
      'pt': 'Errado, por favor, entre novamente no applet para tentar novamente.',
      'ar': 'خطأ ، الرجاء إعادة إدخال التطبيق الصغير للمحاولة مرة أخرى.',
      'tr': 'Yanlış, tekrar denemek için lütfen uygulamayı tekrar girin.'
    },
    msgTips: '',
    checkParas: {},
    overTime: 0, //获取参数超时时间
    overTimeInterval: null, //监听初始化定时器
    dimensions: {}, //维度属性
    aesDimensions: '', //维度属性加密串
    extendParam: {}, //补充参数属性
    aesExtendParam: '', //补充参数属性加密串
    CryptoJS: null, //Crypto加密算法模块
    AesUtil: null, //AES加密算法模块
    sign: null,
    sJSON: {
      stringify: function(obj, that) {
        var t = typeof(obj);
        if (t != 'object' || obj === null) {
          if (t == 'string') obj = quote(obj);
          return String(obj);
        } else {
          var n, v, json = [],
            arr = (obj && obj.constructor == Array);
          var self = that.data.sJSON.stringify;
          for (n in obj) {
            v = obj[n];
            t = typeof(v);
            if (obj.hasOwnProperty(n)) {
              if (t == 'string') {
                v = that.quote(v);
              } else if (t == 'object' && v !== null) {
                v = self(v, that);
              }
              json.push((arr ? '' : '"' + n + '":') + String(v));
            }
          }
          return (arr ? '[' : '{') + String(json) + (arr ? ']' : '}');
        }
      },
      parse: function(jsonString) {
        if (window.JSON) {
          return window.JSON.parse(jsonString);
        }
        return eval('(' + jsonString + ')');
      }
    },
    ready: false //是否执行ready生命周期
  },

  ready: function() {
    var that = this;
    // 初始化Crypto加密算法模块
    that.initCryptoJSAES();
    // 初始化AES加密算法模块
    that.initAesUtil();
    // 初始化参数信息
    that.data.overTimeInterval = setInterval(function() {
      if (that.data.settings) {
        clearInterval(that.data.overTimeInterval);
        that.data.overTime = 0;
        that.init(that.data.settings);
        that.data.ready = true;
        that.data.refresh = false;
      } else {
        that.data.overTime += 100;
        // 如果超时
        if (that.data.overTime >= 10000) {
          clearInterval(that.data.overTimeInterval);
          that.data.overTime = 0;
          that.data.ready = true;
          that.data.refresh = false;
          wx.getSystemInfo({
            success: function (res) {
              that.data.warnText = that.data.warnTextObj[res.language];
              if (!that.data.warnText) { // 新添加的语种默认使用英文
                that.data.warnText = that.data.warnTextObj['en']
              }
              that.changeLoadingState('error', that.data.warnText + '~');
            }
          }) 
        }
      }
    }, 100);
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 初始化参数
    init: function(settings) {
      var that = this;
      // 如果设置了windowWidth属性
      if (settings.windowWidth) {
        that.data.windowWidth = settings.windowWidth;
      }
      // 如果设置了windowHeight属性
      if (settings.windowHeight) {
        that.data.windowHeight = settings.windowHeight;
      }
      // 如果设置了wx_version属性
      if (settings.wx_version) {
        that.data.wx_version = settings.wx_version;
      }
      // 如果设置了appId属性
      if (settings.appId) {
        that.data.appId = settings.appId;
      }
      // 如果设置了businessSite属性
      if (settings.businessSite) {
        that.data.businessSite = settings.businessSite;
      }
      // 如果设置了dev属性
      if (settings.dev) {
        that.data.dev = settings.dev;
        if (settings.dev === 'pro') {
          that.data.baseUrl = 'https://ic.ctrip.com/';
          that.data.errorUrl = 'https://m.ctrip.com/restapi/infosec/';
        }
      }
      // 如果设置了width属性
      var isPercent = 0;
      if (settings.width) {
        var eleWidth = settings.width;
        if (eleWidth.substring(eleWidth.length - 2, eleWidth.length) === 'px') {
          eleWidth = +eleWidth.substring(0, eleWidth.length - 2) - 2 + 'px';
          if (eleWidth !== 'NaNpx') {
            that.data.width = eleWidth;
            that.data.widthNum = +eleWidth.substring(0, eleWidth.length - 2);
          }
        } else if (eleWidth.substring(eleWidth.length - 1, eleWidth.length) === '%') {
          that.data.width = eleWidth;
          isPercent = 1;
        }
      }
      // 如果设置了height属性
      if (settings.height) {
        var eleHeight = settings.height;
        if (eleHeight.substring(eleHeight.length - 2, eleHeight.length) === 'px') {
          var eleHeightNum = +eleHeight.substring(0, eleHeight.length - 2) - 2 > 78 ? 78 : +eleHeight.substring(0, eleHeight.length - 2) - 2;
          eleHeight = eleHeightNum + 'px';
          if (eleHeight !== 'NaNpx') {
            that.setData({
              height: eleHeight,
              heightNum: eleHeightNum,
              loadingBoxHeight: eleHeightNum,
              loadingImgMarginTop: (eleHeightNum - 30) / 2,
              moveSlideBtnWidth: eleHeightNum + 2,
              moveSlideBtnHeight: eleHeightNum + 2,
              slideBtnWidth: eleHeightNum - 2,
              slideBtnHeight: eleHeightNum - 2,
              moveSlideBgWidth: eleHeightNum,
              moveSlideBgHeight: eleHeightNum,
              bgBarHeight: eleHeightNum,
              bgBarLineHeight: eleHeightNum,
              infoBoardHeight: eleHeightNum,
              loadingTextLineHeight: eleHeightNum,
              loadingInfoBoxHeight: eleHeightNum,
              loadingContentMarginTop: (eleHeightNum - 17) / 2
            });
          }
        }
      }
      // 如果设置了margin属性
      if (settings.margin) {
        that.data.margin = settings.margin;
      }
      // 如果设置了textslider属性
      if (settings.textslider !== undefined) {
        that.data.textslider = settings.textslider;
      }
      // 如果设置了language属性
      if (settings.language) {
        that.data.language = settings.language;
        that.data.warnText = that.data.warnTextObj[that.data.language];
        if (!that.data.warnText) { // 新添加的语种默认使用英文
          that.data.warnText = that.data.warnTextObj['en']
        }
      } else {
        // 默认是用中文
        that.data.warnText = that.data.warnTextObj['zh_CN'];
      }
      // 如果设置了select_language属性
      if (settings.select_language) {
        that.data.select_language = settings.select_language;
      }
      // 如果设置了openid属性
      if (settings.openid) {
        that.data.openid = settings.openid;
      }
      // 如果设置了unionid属性
      if (settings.unionid) {
        that.data.unionid = settings.unionid;
      }
      // 如果设置了model属性
      if (settings.model) {
        that.data.model = settings.model;
      }
      // 如果设置了gpsLatitude属性
      if (settings.gpsLatitude) {
        that.data.gpsLatitude = settings.gpsLatitude;
      }
      // 如果设置了gpsLongitude属性
      if (settings.gpsLongitude) {
        that.data.gpsLongitude = settings.gpsLongitude;
      }
      // 如果设置了country属性
      if (settings.country) {
        that.data.country = settings.country;
      }
      // 如果设置了province属性
      if (settings.province) {
        that.data.province = settings.province;
      }
      // 如果设置了city属性
      if (settings.city) {
        that.data.city = settings.city;
      }
      // 如果设置了duid属性
      if (settings.duid) {
        that.data.duid = settings.duid;
      }
      // 如果设置了chooseOpt属性
      if (settings.chooseOpt) {
        // 如果设置了position属性
        if (settings.chooseOpt.position) {
          that.data.selectPosition = settings.chooseOpt.position;
        }
        // 如果设置了width属性
        if (settings.chooseOpt.width) {
          that.data.selectPicWidth = settings.chooseOpt.width;
        }
        // 如果设置了height属性
        if (settings.chooseOpt.height) {
          that.data.selectPicHeight = settings.chooseOpt.height;
        }
        // 如果设置了type属性
        if (settings.chooseOpt.type) {
          that.data.selectType = settings.chooseOpt.type;
        }
      }
      // 如果设置了stateChange方法
      if (settings.stateChange) {
        that.data.stateChange = settings.stateChange;
      }
      // 如果设置了onSelectFail方法
      if (settings.onSelectFail) {
        that.data.onSelectFail = settings.onSelectFail;
      }
      // 如果设置了onSelectClose方法
      if (settings.onSelectClose) {
        that.data.onSelectClose = settings.onSelectClose;
      }
      // 如果设置了resultHandler方法
      if (settings.resultHandler) {
        that.data.resultHandler = settings.resultHandler;
      }
      // 初始化滑块参数
      that.setData({
        width: that.data.width,
        height: that.data.height,
        margin: that.data.margin,
        selectPosition: that.data.selectPosition
      }, function() {
        if (isPercent === 1) {
          // 监听获取widthNum
          that.getWidthNum();
        }
        // 风险校验
        that.riskIdentification();
      });
    },

    // 刷新滑块
    refresh: function() {
      var that = this;
      clearInterval(that.data.loadingInfoInterval);
      clearInterval(that.data.cptInfoInterval);
      clearInterval(that.data.textSliderInter);
      clearInterval(that.data.selectInfoInterval);
      clearInterval(that.data.overTimeInterval);
      that.setData({
        loadingBoxBgColor: '#f7f9fa', //loading框的background属性
        loadingBoxBorder: '1px solid #e4e7eb', //loading框的border属性
        loadingImgShow: 'inline-block', //loading加载gif的display属性
        loadingBoxShow: 'block', //loading框的display属性
        loadingInfoBoxLeft: '', //loadingInfo框的left属性
        loadingInfoBoxPos: '', //loadingInfo框的position属性
        loadingInfoBoxShow: 'none', //loadingInfo框的display属性
        loadingIconContentShow: 'none', //loadingContent框的display属性
        loadingRightShow: 'none', //loading成功图标的display属性
        loadingErrorShow: 'none', //loading错误图标的display属性
        loadingInfo: '', //loading检测结果文本
        loadingTextColor: '#52ccba', //loading检测结果文本颜色
        moveStartX: 0, //滑块按钮的起始位置
        moveSlideBtnLeft: 0, //滑块按钮容器的left属性
        moveSlideBtnTrans: 'none', //滑块动效
        cptDropBgClass: 'cpt-drop-bg-default', //滑块拖动背景的css样式
        slideBtnBgColor: '#4B9EEA', //滑块按钮的背景色
        slideBtnShadow: 'none', //滑块按钮的阴影
        slideBgColor: 'transparent', //滑块拖动背景颜色
        slideBgBorder: '1px solid transparent', //滑块拖动背景边框
        slideBgTrans: 'background 0.2s linear, border 0.2s linear', //滑块拖动背景动效
        logoBgPosition: '-1px 0px !important', //滑块logo背景位置
        moveable: true, //是否可滑动
        refreshable: false, //是否可刷新
        startTs: null, //起始滑动时间
        endTs: null, //结束滑动时间
        scrollList: [], //滑块轨迹数据
        timezone: new Date().getTimezoneOffset(), //获取时区
        auto: null,
        verify_msg: null, //风险校验参数
        cptImgClass: 'cpt-img-outer', //滑块logo容器类
        logoTransform: 'rotate(0deg) translateY(0)', //滑块logo变换属性
        logoOuterTransform: 'rotate(0deg)', //滑块logo容器变换属性
        deg: 0, //滑块logo旋转角度数值
        degMark: 0, //旋转标记：0顺时针1逆时针
        bgBarOpacity: 1, //信息容器的透明度属性
        infoBoardColor: '#566980', //信息文本颜色
        cptInfo: '', //提示信息文本
        infoBoardLeft: '', // 提示语左边距
        infoBoardPosition: '', //提示语定位
        infoBoardBg: '', //提示语背景
        infoBoardFillColor: '', //提示语文本填充色
        selectShow: 'none', //选字是否显示
        selectBgShow: 'none', //选字背景是否显示
        selectBoxWidth: '', //选字框width属性
        selectBoxHeight: '', //选字框height属性
        selectMsgBoxWidth: '', //选字框提示语文本容器width属性
        selectMsgLeft: '', //选字框提示语left属性
        selectMsgPosition: '', //选字框提示语position属性
        selectChooseMsg: '', //选字框提示语文本
        selectRefreshShow: 'block', //选字刷新图标display属性
        selectLoadingShow: 'none', //选字loading图标display属性
        signList: [], //选字选择标记
        signCount: 0, //已选字个数
        selectLeft: 0, //选字框左边距
        selectTop: 0, //选字框顶距
        submitText: '', //选字提交按钮文本,
        inputStartTs: null, //选字弹窗时间
        inputEndTs: null, //选字提交时间
        msgTips: '',
        checkParas: {},
        overTime: 0, //获取参数超时时间
        dimensions: {}, //维度属性
        aesDimensions: '', //维度属性加密串
        extendParam: {}, //补充参数属性
        aesExtendParam: '', //补充参数属性加密串
        sign: null
      }, function() {
        that.properties.refresh = false;
        that.init(that.data.settings);
      });
    },

    // 风险校验
    riskIdentification: function(param) {
      var that = this;
      that.data.dimensions = {
        openid: that.data.openid,
        unionid: that.data.unionid,
        model: that.data.model,
        version: that.data.wx_version,
        gpsLatitude: that.data.gpsLatitude,
        gpsLongitude: that.data.gpsLongitude,
        country: that.data.country,
        province: that.data.province,
        city: that.data.city,
        district: that.data.district,
        adcode: that.data.adcode,
        street: that.data.street,
        wx_duid: that.data.duid
      };
      that.data.aesDimensions = that.JSAES(that.data.sJSON.stringify(that.data.dimensions, that), 0);
      that.data.extendParam = {
        'resolution_width': that.data.windowWidth,
        'resolution_height': that.data.windowHeight,
        'language': that.data.language
      };
      that.data.aesExtendParam = that.JSAES(that.data.sJSON.stringify(that.data.extendParam, that), 0);
      that.data.sign = that.data.CryptoJS.MD5('appid=' + that.data.appId + '&business_site=' + that.data.businessSite + '&version=' + that.data.version + '&dimensions=' +
        that.data.aesDimensions + '&extend_param=' + that.data.aesExtendParam);
      wx.request({
        url: that.data.baseUrl + 'captcha/' + that.data.interface_obj.risk_inspect_app,
        data: {
          'appid': that.data.appId,
          'business_site': that.data.businessSite,
          'version': that.data.version,
          'dimensions': encodeURIComponent(that.data.aesDimensions),
          'extend_param': encodeURIComponent(that.data.aesExtendParam),
          'sign': that.data.sign.toString()
        },
        header: {
          'content-type': 'application/json'
        },
        method: 'POST',
        success: function(res) {
          var code = res.data.code,
            result = res.data.result;
          if (code >= 400) {
            that.changeLoadingState('error', that.data.warnText);
            that.fireResultHandler(that.data.checkParas, 'error');
            that.verifyErr(that.data.interface_obj.risk_inspect_app, '200' + code);
          } else if (code === 0) {
            var risk_info = result['risk_info'],
              risk_level = risk_info['risk_level'],
              process_type = risk_info['process_type'].toLowerCase();
            that.data.msgTips = result['tip'];
            that.data.checkParas.rid = result['rid'] ? result['rid'] : null;
            if (risk_level === 0) {
              that.changeLoadingState('success', that.data.msgTips['pass_msg']);
              that.data.checkParas.token = result.token;
              that.fireResultHandler(that.data.checkParas, 'hidden');
            } else if (risk_level > 0 && process_type === 'slider') {
              that.setData({
                slideBtnShadow: '0 0 6px 2px rgba(75, 158, 234, 0.5)',
                loadingBoxShow: 'none',
                loadingImgShow: 'none',
                cptInfo: that.data.msgTips['slide_msg'],
                submitText: that.data.msgTips['submit_msg']
              }, function() {
                // 设置文字光影滚动
                if (that.data.textslider) {
                  clearInterval(that.data.textSliderInter);
                  that.textslider('#566980');
                }
                // 提示语滚动
                that.scrolltext(1, '.cpt-info-board');
              });
              that.data.stateChange(0);
            } else if (risk_level < 0) {
              that.changeLoadingState('wrong', that.data.msgTips['forbidden_msg']);
              that.fireResultHandler(that.data.checkParas, 'false');
            }
          }
        },
        fail: function(e) {
          that.changeLoadingState('error', that.data.warnText);
          that.fireResultHandler(that.data.checkParas, 'error');
          that.verifyErr(that.data.interface_obj.risk_inspect_app, 'http error');
        }
      });
    },

    // 滑块校验
    riskCheck: function() {
      var that = this;
      that.data.verify_msg = {
        'slidingTime': that.data.endTs - that.data.startTs,
        'slidingTrack': that.data.scrollList,
        'timezone': that.data.timezone,
        'display': that.data.windowWidth + 'x' + that.data.windowHeight
      };
      var aesVerify_msg = that.JSAES(that.data.sJSON.stringify(that.data.verify_msg, that), 0);
      that.data.extendParam = {
        'select_width': that.data.selectPicWidth ? that.data.selectPicWidth.replace('px', '') : undefined,
        'select_height': that.data.selectPicHeight ? that.data.selectPicHeight.replace('px', '') : undefined,
        'resolution_width': that.data.windowWidth,
        'resolution_height': that.data.windowHeight,
        'language': that.data.language,
        'select_language': that.data.select_language
      };
      that.data.aesExtendParam = that.JSAES(that.data.sJSON.stringify(that.data.extendParam, that), 0);
      that.data.sign = that.data.CryptoJS.MD5('appid=' + that.data.appId + '&business_site=' + that.data.businessSite + '&version=' + that.data.version + '&verify_msg=' +
        aesVerify_msg + '&dimensions=' + that.data.aesDimensions + '&extend_param=' + that.data.aesExtendParam);
      that.setData({
        cptImgClass: 'cpt-img-outer outer-rotation',
        moveSlideBtnLeft: that.data.widthNum - that.data.heightNum,
        moveSlideBgWidth: that.data.widthNum
      });
      wx.request({
        url: that.data.baseUrl + 'captcha/' + that.data.interface_obj.verify_slider_app,
        data: {
          'appid': that.data.appId,
          'business_site': that.data.businessSite,
          'version': that.data.version,
          'rid': that.data.checkParas.rid,
          'verify_msg': encodeURIComponent(aesVerify_msg),
          'dimensions': encodeURIComponent(that.data.aesDimensions),
          'extend_param': encodeURIComponent(that.data.aesExtendParam),
          'sign': that.data.sign.toString()
        },
        header: {
          'content-type': 'application/json'
        },
        method: 'POST',
        success: function(res) {
          var code = res.data.code,
            result = res.data.result;
          if (code >= 400) {
            //滑块显示校验失败
            that.sliderErrorShow('error', that.data.msgTips['error_msg']);
            //错误日志
            that.verifyErr(that.data.interface_obj.verify_slider, '200' + code);
          } else if (code === 0) {
            var param = result.param,
              risk_info = result['risk_info'],
              risk_level = risk_info['risk_level'],
              process_type = risk_info['process_type'].toLowerCase();
            if (risk_level === 0) {
              //滑块显示校验成功
              that.sliderSuccessShow(result.token);
            } else if (risk_level > 0) {
              if (process_type === 'slider') {
                that.setData({
                  moveable: true,
                  slideBtnBgColor: '#4B9EEA',
                  slideBtnShadow: '0 0 6px 2px rgba(75, 158, 234, 0.5)',
                  logoBgPosition: '-1px 0px !important',
                  logoTransform: 'rotate(0deg) translateY(0)',
                  logoOuterTransform: 'rotate(0deg)',
                  selectShow: 'none',
                  selectBgShow: 'none',
                  signList: [],
                  signCount: 0,
                  slideBgColor: 'transparent',
                  slideBgBorder: '1px solid transparent',
                  refreshable: false,
                  moveSlideBtnTrans: 'left 0.2s linear',
                  slideBgTrans: 'background 0.2s linear, border 0.2s linear, width 0.2s linear',
                  moveSlideBtnLeft: 0,
                  moveSlideBgWidth: that.data.heightNum,
                  cptDropBgClass: 'cpt-drop-bg-default',
                  bgBarOpacity: 1,
                  cptInfo: that.data.msgTips['retry_msg'],
                  infoBoardColor: '#566980'
                }, function() {
                  clearInterval(that.data.cptInfoInterval);
                  // 设置文字光影滚动
                  if (that.data.textslider) {
                    clearInterval(that.data.textSliderInter);
                    that.textslider('#566980');
                  }
                  // 初始化提示语滚动动画
                  that.scrolltext(1, '.cpt-info-board');
                });
              } else if (process_type === 'select') {
                that.data.checkParas.token = result['token'];
                that.data.auto = that.JSAES(param['auto'], 1);
                that.setData({
                  moveSlideBtnLeft: that.data.widthNum - that.data.heightNum,
                  moveSlideBgWidth: that.data.widthNum,
                  deg: 0,
                  degMark: 0,
                  logoTransform: 'rotate(0deg) translateY(0)',
                  logoOuterTransform: 'rotate(360deg)',
                  moveable: false,
                  selectShow: 'block',
                  selectBgShow: that.data.selectType === 'pop' ? 'block' : 'none',
                  selectBoxWidth: param.size['big_width'] + 20,
                  selectBoxHeight: param.size['big_height'] + 139,
                  selectMsgBoxWidth: param.size['big_width'] - param.size['width'] - 5,
                  selectChooseMsg: that.data.msgTips['select_msg'],
                  smallImgSrc: 'data:image/jpg;base64,' + risk_info['process_value']['small_image'],
                  smallImgWidth: param.size['width'],
                  smallImgHeight: param.size['height'],
                  bigImgSrc: 'data:image/jpg;base64,' + risk_info['process_value']['big_image'],
                  bigImgWidth: param.size['big_width'],
                  bigImgHeight: param.size['big_height'],
                  selectBoxLeft: -(param.size['big_width'] + 20) / 2,
                  selectBoxTop: -(param.size['big_height'] + 139) / 2
                }, function() {
                  //获取选字框左边距和顶距
                  wx.createSelectorQuery().in(that).select('.cpt-choose-box').boundingClientRect(function(res) {
                    that.data.selectLeft = res.left;
                    that.data.selectTop = res.top;
                  }).exec();
                  clearInterval(that.data.selectInfoInterval); //获取选字框左边距和顶距
                  wx.createSelectorQuery().in(that).select('.cpt-choose-box').boundingClientRect(function(res) {
                    that.data.selectLeft = res.left;
                    that.data.selectTop = res.top;
                  }).exec();
                  // 初始化提示语滚动动画
                  that.scrolltext(2, '.cpt-choose-msg');
                });
                that.data.inputStartTs = new Date().getTime();
                that.data.stateChange(1);
              }
            } else if (risk_level < 0) {
              that.changeLoadingState('wrong', that.data.msgTips['forbidden_msg']);
              that.fireResultHandler(that.data.checkParas, 'false');
            }
          }
          that.setData({
            cptImgClass: 'cpt-img-outer'
          });
        },
        fail: function(e) {
          that.sliderErrorShow('error', that.data.msgTips['error_msg']);
          that.verifyErr(that.data.interface_obj.verify_slider, 'http error');
          that.setData({
            cptImgClass: 'cpt-img-outer'
          });
        }
      });
    },

    // 触发resultHandler
    fireResultHandler: function(paras, state) {
      var that = this;
      paras.version = that.data.version;
      paras.checkState = state;
      if (!paras.token) {
        paras.token = that.getRanToken();
      }
      // 消除文本光影
      that.clearTextSlider();
      that.data.resultHandler(paras);
    },

    // 请求error处理
    verifyErr: function(url, type, json_obj) {
      var that = this;
      var json_obj = json_obj ? json_obj : {};
      json_obj.openid = that.data.openid;
      json_obj.unionid = that.data.unionid;
      json_obj.wx_duid = that.data.duid;
      json_obj.extend_param = {};
      var aes_json_str = that.JSAES(that.data.sJSON.stringify(json_obj, that), 0);
      var params = {
        a: that.data.appId,
        b: that.data.businessSite,
        c: that.data.version,
        d: url,
        e: type,
        f: encodeURIComponent(aes_json_str)
      };
      var cUrl = '';
      for (var i in params) {
        cUrl += '&' + i + '=' + params[i];
      }
      wx.request({
        url: that.data.errorUrl + that.data.interface_obj.data_js + '?callback=wx' + cUrl,
        header: {
          'content-type': 'application/json'
        },
        method: 'GET'
      });
    },

    // 消除文本光影
    clearTextSlider: function() {
      var that = this;
      if (that.data.textslider) {
        clearInterval(that.data.textSliderInter);
        that.setData({
          infoBoardBg: '',
          infoBoardFillColor: ''
        });
      }
    },

    // 改变滑块状态
    changeLoadingState: function(state, msg) {
      var that = this;
      switch (state) {
        case 'load':
          that.setData({
            slideBtnShadow: 'none',
            loadingBoxShow: 'block',
            loadingImgShow: 'inline-block',
            loadingInfoBoxShow: 'none',
            loadingIconContentShow: 'none',
            loadingRightShow: 'none',
            loadingErrorShow: 'none'
          });
          break;
        case 'success':
          that.setData({
            slideBtnShadow: 'none',
            loadingBoxBgColor: '#d2f4ef',
            loadingBoxBorder: '1px solid #52ccba',
            loadingBoxShow: 'block',
            loadingImgShow: 'none',
            loadingInfoBoxShow: 'inline-block',
            loadingIconContentShow: 'inline-block',
            loadingRightShow: 'block',
            loadingErrorShow: 'none',
            loadingInfo: msg,
            loadingTextColor: '#52ccba'
          }, function() {
            // 设置文字光影滚动
            if (that.data.textslider) {
              clearInterval(that.data.textSliderInter);
              that.textslider('#52ccba');
            }
            // 提示语滚动
            that.scrolltext(0, '.cpt-loading-info-box');
          });
          break;
        case 'wrong':
          that.setData({
            slideBtnShadow: 'none',
            loadingBoxBgColor: '#fce1e1',
            loadingBoxBorder: '1px solid #f57a7a',
            loadingBoxShow: 'block',
            loadingImgShow: 'none',
            loadingInfoBoxShow: 'inline-block',
            loadingIconContentShow: 'inline-block',
            loadingRightShow: 'none',
            loadingErrorShow: 'block',
            loadingInfo: msg,
            loadingTextColor: '#f57a7a'
          }, function() {
            // 设置文字光影滚动
            if (that.data.textslider) {
              clearInterval(that.data.textSliderInter);
              that.textslider('#f57a7a');
            }
            // 提示语滚动
            that.scrolltext(0, '.cpt-loading-info-box');
          });
          break;
        case 'error':
          that.setData({
            slideBtnShadow: 'none',
            loadingBoxBgColor: '#fce1e1',
            loadingBoxBorder: '1px solid #f57a7a',
            loadingBoxShow: 'block',
            loadingImgShow: 'none',
            loadingInfoBoxShow: 'inline-block',
            loadingIconContentShow: 'inline-block',
            loadingRightShow: 'none',
            loadingErrorShow: 'block',
            loadingInfo: msg,
            loadingTextColor: '#f57a7a'
          }, function() {
            // 设置文字光影滚动
            if (that.data.textslider) {
              clearInterval(that.data.textSliderInter);
              that.textslider('#f57a7a');
            }
            // 提示语滚动
            that.scrolltext(0, '.cpt-loading-info-box');
          });
          break;
      }
    },

    //滑块显示校验成功
    sliderSuccessShow: function(token) {
      var that = this;
      that.setData({
        moveSlideBtnLeft: that.data.widthNum - that.data.heightNum,
        moveSlideBgWidth: that.data.widthNum,
        deg: 0,
        degMark: 0,
        logoTransform: 'rotate(0deg) translateY(0)',
        logoOuterTransform: 'rotate(360deg)',
        moveable: false,
        cptDropBgClass: 'cpt-drop-bg-finish',
        slideBgColor: '#d2f4ef',
        slideBgBorder: '1px solid #52ccba',
        infoBoardColor: '#52ccba',
        refreshable: false,
        logoBgPosition: '-54px 0px !important',
        cptInfo: that.data.msgTips['right_msg'],
        bgBarOpacity: 1
      }, function() {
        clearInterval(that.data.cptInfoInterval);
        // 设置文字光影滚动
        if (that.data.textslider) {
          clearInterval(that.data.textSliderInter);
          that.textslider('#52ccba');
        }
        // 初始化提示语滚动动画
        that.scrolltext(1, '.cpt-info-board');
        that.data.checkParas.token = token;
        that.fireResultHandler(that.data.checkParas, 'success');
      });
    },

    //滑块显示校验失败
    sliderErrorShow: function(str, msg) {
      var that = this;
      that.setData({
        moveSlideBtnLeft: that.data.widthNum - that.data.heightNum,
        moveSlideBgWidth: that.data.widthNum,
        deg: 0,
        degMark: 0,
        logoTransform: 'rotate(0deg) translateY(0)',
        logoOuterTransform: 'rotate(360deg)',
        moveable: false,
        cptDropBgClass: 'cpt-drop-bg-finish',
        slideBgColor: '#fce1e1',
        slideBgBorder: '1px solid #f57a7a',
        infoBoardColor: '#f57a7a',
        refreshable: true,
        logoBgPosition: '-82px 0px !important',
        cptInfo: msg,
        bgBarOpacity: 1
      }, function() {
        clearInterval(that.data.cptInfoInterval);
        // 设置文字光影滚动
        if (that.data.textslider) {
          clearInterval(that.data.textSliderInter);
          that.textslider('#f57a7a');
        }
        // 初始化提示语滚动动画
        that.scrolltext(1, '.cpt-info-board');
        that.fireResultHandler(that.data.checkParas, str);
      });
    },

    // 获取一个随机的token字符串
    getRanToken: function() {
      var s = [];
      var hexDigits = '0123456789abcdef';
      for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
      }
      s[14] = '4';
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
      s[8] = s[13] = s[18] = s[23] = '-';
      var uuid = s.join('');
      return uuid;
    },

    // 在百分比宽度下监听width值
    getWidthNum: function() {
      var that = this;
      // 获取提示语宽度
      wx.createSelectorQuery().in(that).select('.verification-code').boundingClientRect(function(res) {
        if(!res) {
          return false
        }
        that.data.widthNum = res.width;
        var watchWidthInterval;
        // 针对将滑块放入模态框时父容器display为none的情况，需要监控width值
        if (that.data.widthNum === 0) {
          watchWidthInterval = setInterval(function() {
            wx.createSelectorQuery().in(that).select('.verification-code').boundingClientRect(function(res) {
              if(!res) {
                return false
              }
              that.data.widthNum = res.width;
              if (that.data.widthNum !== 0) {
                clearInterval(watchWidthInterval);
                // 设置widthNum
                that.setData({
                  width: that.data.widthNum - 4 + 'px',
                  widthNum: that.data.widthNum - 4
                })
              }
            }).exec();
          }, 100);
        } else {
          // 设置widthNum
          that.setData({
            width: that.data.widthNum - 4 + 'px',
            widthNum: that.data.widthNum - 4
          })
        }
      }).exec();
    },

    // 提示语滚动
    scrolltext: function(textType, className) {
      var that = this;
      // 获取提示语宽度
      wx.createSelectorQuery().in(that).select(className).boundingClientRect(function(res) {
        if(!res) {
          return false
        }
        var textWidth = res.width;
        var watchInfoWidthInterval;
        // 针对将滑块放入模态框时父容器display为none的情况，需要监控width值
        if (textWidth === 0) {
          watchInfoWidthInterval = setInterval(function() {
            wx.createSelectorQuery().in(that).select(className).boundingClientRect(function(res) {
              if(!res) {
                return false
              }
              textWidth = res.width;
              if (textWidth !== 0) {
                clearInterval(watchInfoWidthInterval);
                // 设置提示语状态
                if (textType === 0) {
                  that.moveLeftLoading(textWidth);
                } else if (textType === 1) {
                  that.moveLeftInfo(textWidth);
                } else {
                  that.moveLeftSelectInfo(textWidth);
                }
              }
            }).exec();
          }, 100);
        } else {
          // 设置提示语状态
          if (textType === 0) {
            that.moveLeftLoading(textWidth);
          } else if (textType === 1) {
            that.moveLeftInfo(textWidth);
          } else {
            that.moveLeftSelectInfo(textWidth);
          }
        }
      }).exec();
    },

    // 设置风险校验提示语状态
    moveLeftLoading: function(textWidth) {
      // 初始化提示语滚动动画
      var that = this;
      if (textWidth > that.data.widthNum) {
        that.data.loadingInfoBoxLeft = (that.data.widthNum - textWidth) / 2;
        that.data.loadingInfoInterval = setInterval(function() {
          if (that.data.loadingInfoBoxLeft <= -textWidth) {
            that.data.loadingInfoBoxLeft = that.data.widthNum;
          }
          that.setData({
            loadingInfoBoxLeft: that.data.loadingInfoBoxLeft - 0.6,
            loadingInfoBoxPos: 'absolute'
          })
        }, 1000 / 60);
      } else {
        that.setData({
          loadingInfoBoxLeft: 0,
          loadingInfoBoxPos: 'relative'
        })
      }
    },

    // 设置滑块提示语状态
    moveLeftInfo: function(textWidth) {
      // 初始化提示语滚动动画
      var that = this;
      if (textWidth > that.data.widthNum - 2 * that.data.heightNum) {
        that.data.infoBoardLeft = (that.data.widthNum - textWidth) / 2;
        that.data.cptInfoInterval = setInterval(function() {
          if (that.data.infoBoardLeft <= -textWidth) {
            that.data.infoBoardLeft = that.data.widthNum;
          }
          that.setData({
            infoBoardLeft: that.data.infoBoardLeft - 0.6,
            infoBoardPosition: 'absolute'
          })
        }, 1000 / 60);
      } else {
        that.setData({
          infoBoardLeft: 0,
          infoBoardPosition: 'relative'
        })
      }
    },

    // 设置选字提示语状态
    moveLeftSelectInfo: function(textWidth) {
      // 初始化提示语滚动动画
      var that = this;
      if (textWidth > that.data.selectMsgBoxWidth) {
        that.data.selectMsgLeft = 0;
        that.data.selectInfoInterval = setInterval(function() {
          if (that.data.selectMsgLeft <= -textWidth) {
            that.data.selectMsgLeft = that.data.selectMsgBoxWidth;
          }
          that.setData({
            selectMsgLeft: that.data.selectMsgLeft - 0.6,
            selectMsgPosition: 'absolute'
          })
        }, 1000 / 60);
      } else {
        that.setData({
          selectMsgLeft: 0,
          selectMsgPosition: 'relative'
        })
      }
    },

    // 设置文字光影滚动
    textslider: function(color) {
      var i = -3;
      var that = this;
      that.setData({
        infoBoardBg: '-webkit-gradient(linear,left top,right top,color-stop(0,' + color + '),color-stop(0,' + color + '),color-stop(0,#fff),color-stop(0,' + color + '),color-stop(1,' + color + '))',
        infoBoardFillColor: 'transparent',
        textSliderInter: setInterval(function() {
          i += 0.01;
          if (i >= 1) {
            i = -3;
          }
          if (i >= -0.4) {
            var i1 = i < 0 ? 0 : i,
              i2 = i + 0.2 < 0 ? 0 : (i + 0.2 > 1 ? 1 : i + 0.2),
              i3 = i + 0.4 > 1 ? 1 : i + 0.4;
            that.setData({
              infoBoardBg: '-webkit-gradient(linear,left top,right top,color-stop(0,' + color + '),color-stop(' + i1 + ',' + color + '),color-stop(' + i2 + ',#fff),color-stop(' + i3 + ',' + color + '),color-stop(1,' + color + '))'
            });
          }
        }, 400 / 60)
      });
    },

    // 开始移动
    moveSlideBtnStart: function(e) {
      var that = this;
      if (that.data.refreshable) {
        that.closeChoose();
        return;
      }
      if (!that.data.moveable) {
        return;
      }
      if (!e.touches || !e.touches.length || (typeof e.touches[0].pageX === 'undefined')) {
        return;
      }
      that.data.startTs = new Date().getTime();
      that.data.scrollList = [];
      that.data.scrollList.push({
        x: e.touches[0].pageX,
        y: e.touches[0].pageY
      });
      that.setData({
        moveStartX: e.touches[0].pageX,
        slideBgColor: '#0cf',
        slideBgBorder: '1px solid #4B9EEA',
        slideBtnBgColor: 'transparent',
        slideBtnShadow: 'none',
        logoBgPosition: '-28px 0px !important',
        moveSlideBtnTrans: 'none',
        slideBgTrans: 'background 0.2s linear, border 0.2s linear',
        bgBarOpacity: 0,
        cptDropBgClass: 'cpt-drop-bg'
      });
    },

    // 移动滑块按钮
    moveSlideBtn: function(e) {
      if (!this.data.moveable) {
        return;
      }
      if (!e.touches || !e.touches.length || (typeof e.touches[0].pageX === 'undefined')) {
        return;
      }
      var that = this;
      var left = e.touches[0].pageX - that.data.moveStartX;
      var deg = that.data.deg;
      var degMark = that.data.degMark;
      that.data.scrollList.push({
        x: e.touches[0].pageX,
        y: e.touches[0].pageY
      });
      if (deg >= 45) {
        degMark = 1;
      } else if (deg <= 0) {
        degMark = 0;
      }
      if (degMark === 0) {
        deg += 2;
      } else {
        deg -= 2;
      }
      var isUp = degMark === 0 ? -1 : 1;
      var maxLeft = that.data.widthNum - that.data.heightNum;
      if (0 <= left && left < maxLeft) {
        that.setData({
          moveSlideBtnLeft: left,
          moveSlideBgWidth: left + that.data.heightNum,
          deg: deg,
          degMark: degMark,
          logoTransform: 'rotate(' + deg + 'deg) translateY(' + (deg < 22.5 ? isUp * deg : isUp * (45 - deg)) / 4.5 + 'px)'
        })
      } else if (left >= maxLeft) {
        that.data.moveable = false;
        that.data.endTs = new Date().getTime();
        // 滑块校验
        that.riskCheck();
      }
    },

    // 结束移动
    moveSlideBtnEnd: function(e) {
      var that = this;
      if (that.data.refreshable) {
        return;
      }
      if (!that.data.moveable) {
        return;
      }
      that.data.endTs = new Date().getTime();
      var left = that.data.moveSlideBtnLeft;
      that.setData({
        slideBtnBgColor: '#4B9EEA',
        slideBtnShadow: '0 0 6px 2px rgba(75, 158, 234, 0.5)',
        logoBgPosition: '-1px 0px !important',
        deg: 0,
        degMark: 0,
        logoTransform: 'rotate(0deg) translateY(0)',
        slideBgColor: 'transparent',
        slideBgBorder: '1px solid transparent',
        moveSlideBtnTrans: 'left 0.2s linear',
        slideBgTrans: 'background 0.2s linear, border 0.2s linear, width 0.2s linear',
        moveSlideBtnLeft: 0,
        moveSlideBgWidth: that.data.heightNum,
        cptDropBgClass: 'cpt-drop-bg-default',
        bgBarOpacity: 1
      })
    },

    // 关闭选字
    closeChoose: function(event) {
      var that = this;
      that.setData({
        moveable: true,
        slideBtnBgColor: '#4B9EEA',
        slideBtnShadow: '0 0 6px 2px rgba(75, 158, 234, 0.5)',
        logoBgPosition: '-1px 0px !important',
        logoTransform: 'rotate(0deg) translateY(0)',
        logoOuterTransform: 'rotate(0deg)',
        selectShow: 'none',
        selectBgShow: 'none',
        signList: [],
        signCount: 0,
        slideBgColor: 'transparent',
        slideBgBorder: '1px solid transparent',
        refreshable: false,
        moveSlideBtnTrans: 'left 0.2s linear',
        slideBgTrans: 'background 0.2s linear, border 0.2s linear, width 0.2s linear',
        moveSlideBtnLeft: 0,
        moveSlideBgWidth: that.data.heightNum,
        cptDropBgClass: 'cpt-drop-bg-default',
        bgBarOpacity: 1,
        cptInfo: that.data.msgTips['retry_msg'],
        infoBoardColor: '#566980'
      }, function() {
        that.data.onSelectClose();
        clearInterval(that.data.cptInfoInterval);
        // 设置文字光影滚动
        if (that.data.textslider) {
          clearInterval(that.data.textSliderInter);
          that.textslider('#566980');
        }
        // 初始化提示语滚动动画
        that.scrolltext(1, '.cpt-info-board');
      });
    },

    // 单击图片选字
    clickImg: function(event) {
      if (!event.touches || !event.touches.length || (typeof event.touches[0].pageX === 'undefined')) {
        return;
      }
      var that = this;
      var cb = that.data.signList;
      var signCount = that.data.signCount + 1;
      if (that.data.signCount <= that.data.auto) {
        cb.push({
          signCount: signCount,
          coordinate: [
            Math.round(event.touches[0].pageX - that.data.selectLeft - 10),
            Math.round(event.touches[0].pageY - that.data.selectTop - 80)
          ]
        });
        that.setData({
          selectChooseMsg: that.data.msgTips['reselect_msg'],
          signCount: signCount,
          signList: cb
        }, function() {
          if (signCount === 1) {
            clearInterval(that.data.selectInfoInterval);
            // 初始化提示语滚动动画
            that.scrolltext(2, '.cpt-choose-msg');
          }
        });
      }
    },

    // 单击选字标记
    clickSign: function(event) {
      var that = this;
      var cb = that.data.signList;
      var signCount = that.data.signCount;
      var signIndex = event.currentTarget.dataset.index;
      cb = cb.slice(0, signIndex - 1);
      that.setData({
        signCount: signIndex - 1,
        signList: cb
      });
      if (signIndex === 1) {
        that.setData({
          selectChooseMsg: that.data.msgTips['select_msg']
        }, function() {
          clearInterval(that.data.selectInfoInterval);
          // 初始化提示语滚动动画
          that.scrolltext(2, '.cpt-choose-msg');
        });
      }
    },

    // 提交选字
    submitChoose: function(event) {
      var that = this;
      that.data.inputEndTs = new Date().getTime();
      if (that.data.verify_msg && typeof that.data.verify_msg.slidingTime !== 'undefined') {
        try {
          delete that.data.verify_msg.slidingTime;
          delete that.data.verify_msg.slidingTrack;
        } catch (e) {
          that.data.verify_msg.slidingTime = undefined;
          that.data.verify_msg.slidingTrack = undefined;
        }
      }
      if (!that.data.verify_msg) {
        that.data.verify_msg = {}
      }
      that.data.verify_msg.inputTime = that.data.inputEndTs - that.data.inputStartTs;
      var coordinates = [];
      that.data.signList.forEach(function(item) {
        coordinates = coordinates.concat(item.coordinate);
      });
      that.data.verify_msg.value = coordinates;
      var aesVerify_msg = that.JSAES(that.data.sJSON.stringify(that.data.verify_msg, that), 0);
      that.data.sign = that.data.CryptoJS.MD5('appid=' + that.data.appId + '&business_site=' + that.data.businessSite + '&version=' + that.data.version + '&verify_msg=' +
        aesVerify_msg + '&dimensions=' + that.data.aesDimensions + '&extend_param=' + that.data.aesExtendParam +
        '&token=' + that.data.checkParas.token + '&captcha_type=SELECT');
      that.changeTextLoadingState('load');
      wx.request({
        url: that.data.baseUrl + 'captcha/' + that.data.interface_obj.verify_text_app,
        data: {
          'appid': that.data.appId,
          'business_site': that.data.businessSite,
          'version': that.data.version,
          'token': that.data.checkParas.token,
          'rid': that.data.checkParas.rid,
          'verify_msg': encodeURIComponent(aesVerify_msg),
          'dimensions': encodeURIComponent(that.data.aesDimensions),
          'extend_param': encodeURIComponent(that.data.aesExtendParam),
          'sign': that.data.sign.toString(),
          'captcha_type': 'SELECT'
        },
        header: {
          'content-type': 'application/json'
        },
        method: 'POST',
        success: function(res) {
          that.selectResultHandler(res, 'verify');
        },
        fail: function(e) {
          that.textErrorHandler('error', that.data.msgTips['error_msg']);
          that.verifyErr(that.data.interface_obj.verify_text_app, 'http error');
        }
      })
    },

    // 刷新选字
    refreshVerify: function() {
      var that = this;
      that.data.inputEndTs = new Date().getTime();
      that.data.sign = that.data.CryptoJS.MD5('appid=' + that.data.appId + '&business_site=' + that.data.businessSite + '&version=' + that.data.version + '&dimensions=' + that.data.aesDimensions + '&extend_param=' + that.data.aesExtendParam +
        '&token=' + that.data.checkParas.token + '&captcha_type=SELECT');
      that.changeTextLoadingState('load');
      wx.request({
        url: that.data.baseUrl + 'captcha/' + that.data.interface_obj.refresh_text_app,
        data: {
          'appid': that.data.appId,
          'business_site': that.data.businessSite,
          'version': that.data.version,
          'token': that.data.checkParas.token,
          'rid': that.data.checkParas.rid,
          'dimensions': encodeURIComponent(that.data.aesDimensions),
          'extend_param': encodeURIComponent(that.data.aesExtendParam),
          'sign': that.data.sign.toString(),
          'captcha_type': 'SELECT'
        },
        header: {
          'content-type': 'application/json'
        },
        method: 'POST',
        success: function(res) {
          that.selectResultHandler(res, 'refresh');
        },
        fail: function(e) {
          that.textErrorHandler('error', that.data.msgTips['error_msg']);
          that.verifyErr(that.data.interface_obj.refresh_text_app, 'http error');
        }
      })
    },

    // 选字校验选字刷新结果处理
    selectResultHandler: function(res, type) {
      var that = this;
      var code = res.data.code,
        result = res.data.result;
      if (code >= 400) {
        //选字校验失败处理
        that.textErrorHandler('error', that.data.msgTips['error_msg']);
        that.verifyErr(that.data.interface_obj.refresh_text_app, '200' + code);
      } else if (code == 0) {
        var param = result.param,
          risk_info = result['risk_info'],
          risk_level = risk_info['risk_level'],
          process_type = risk_info['process_type'].toLowerCase();
        if (risk_level == 0) {
          //选字校验成功处理
          that.textSuccessHandler(result.token);
        } else if (risk_level > 0) {
          if (process_type === 'select') {
            that.data.auto = that.JSAES(param['auto'], 1);
            that.data.checkParas.token = result['token'];
            that.setData({
              signList: [],
              signCount: 0,
              selectBoxWidth: param.size['big_width'] + 20,
              selectBoxHeight: param.size['big_height'] + 139,
              selectMsgBoxWidth: param.size['big_width'] - param.size['width'] - 5,
              selectChooseMsg: that.data.msgTips['select_msg'],
              smallImgSrc: 'data:image/jpg;base64,' + risk_info['process_value']['small_image'],
              smallImgWidth: param.size['width'],
              smallImgHeight: param.size['height'],
              bigImgSrc: 'data:image/jpg;base64,' + risk_info['process_value']['big_image'],
              bigImgWidth: param.size['big_width'],
              bigImgHeight: param.size['big_height']
            }, function() {
              // 触发选字失败回调函数
              if (type === 'verify')
                that.data.onSelectFail();
              clearInterval(that.data.selectInfoInterval);
              // 初始化提示语滚动动画
              that.scrolltext(2, '.cpt-choose-msg');
              that.changeTextLoadingState('default');
            });
          } else if (process_type === 'slider') {
            that.setData({
              moveable: true,
              slideBtnBgColor: '#4B9EEA',
              slideBtnShadow: '0 0 6px 2px rgba(75, 158, 234, 0.5)',
              logoBgPosition: '-1px 0px !important',
              logoTransform: 'rotate(0deg) translateY(0)',
              logoOuterTransform: 'rotate(0deg)',
              selectShow: 'none',
              selectBgShow: 'none',
              signList: [],
              signCount: 0,
              slideBgColor: 'transparent',
              slideBgBorder: '1px solid transparent',
              refreshable: false,
              moveSlideBtnTrans: 'left 0.2s linear',
              slideBgTrans: 'background 0.2s linear, border 0.2s linear, width 0.2s linear',
              moveSlideBtnLeft: 0,
              moveSlideBgWidth: that.data.heightNum,
              cptDropBgClass: 'cpt-drop-bg-default',
              bgBarOpacity: 1,
              cptInfo: that.data.msgTips['error_msg'],
              infoBoardColor: '#566980'
            }, function() {
              that.data.stateChange(2);
              clearInterval(that.data.cptInfoInterval);
              // 设置文字光影滚动
              if (that.data.textslider) {
                clearInterval(that.data.textSliderInter);
                that.textslider('#566980');
              }
              // 初始化提示语滚动动画
              that.scrolltext(1, '.cpt-info-board');
              that.changeTextLoadingState('default');
            });
          }
        } else if (risk_level < 0) {
          that.textErrorHandler('false', that.data.msgTips['forbidden_msg']);
        }
      }
    },

    //切换选字刷新图标
    changeTextLoadingState: function(state) {
      var that = this;
      if (state === 'load') {
        that.setData({
          selectRefreshShow: 'none',
          selectLoadingShow: 'block'
        });
      } else if (state === 'default') {
        that.setData({
          selectRefreshShow: 'block',
          selectLoadingShow: 'none'
        });
      }
    },

    //选字校验成功处理
    textSuccessHandler: function(token) {
      var that = this;
      that.setData({
        selectBgShow: 'none',
        selectShow: 'none'
      }, function() {
        that.data.stateChange(2);
        //滑块显示校验成功
        that.sliderSuccessShow(token);
        that.changeTextLoadingState('default');
      });
    },

    //选字校验错误处理
    textErrorHandler: function(str, msg) {
      var that = this;
      that.setData({
        selectBgShow: 'none',
        selectShow: 'none'
      }, function() {
        that.data.stateChange(2);
        //滑块显示校验失败
        that.sliderErrorShow(str, msg);
        that.changeTextLoadingState('default');
      });
    },

    //初始化Crypto加密算法模块
    initCryptoJSAES: function() {
      var that = this;
      that.data.CryptoJS = that.data.CryptoJS || function(p, h) {
        var i = {},
          l = i.lib = {},
          r = l.Base = function() {
            function a() {}

            return {
              extend: function(e) {
                a.prototype = this;
                var c = new a;
                e && c.mixIn(e);
                c.$super = this;
                return c
              },
              create: function() {
                var a = this.extend();
                a.init.apply(a, arguments);
                return a
              },
              init: function() {},
              mixIn: function(a) {
                for (var c in a) a.hasOwnProperty(c) && (this[c] = a[c]);
                a.hasOwnProperty('toString') && (this.toString = a.toString)
              },
              clone: function() {
                return this.$super.extend(this)
              }
            }
          }(),
          o = l.WordArray = r.extend({
            init: function(a, e) {
              a =
                this.words = a || [];
              this.sigBytes = e != h ? e : 4 * a.length
            },
            toString: function(a) {
              return (a || s).stringify(this)
            },
            concat: function(a) {
              var e = this.words,
                c = a.words,
                b = this.sigBytes,
                a = a.sigBytes;
              this.clamp();
              if (b % 4)
                for (var d = 0; d < a; d++) e[b + d >>> 2] |= (c[d >>> 2] >>> 24 - 8 * (d % 4) & 255) << 24 - 8 * ((b + d) % 4);
              else if (65535 < c.length)
                for (d = 0; d < a; d += 4) e[b + d >>> 2] = c[d >>> 2];
              else e.push.apply(e, c);
              this.sigBytes += a;
              return this
            },
            clamp: function() {
              var a = this.words,
                e = this.sigBytes;
              a[e >>> 2] &= 4294967295 << 32 - 8 * (e % 4);
              a.length = p.ceil(e / 4)
            },
            clone: function() {
              var a =
                r.clone.call(this);
              a.words = this.words.slice(0);
              return a
            },
            random: function(a) {
              for (var e = [], c = 0; c < a; c += 4) e.push(4294967296 * p.random() | 0);
              return o.create(e, a)
            }
          }),
          m = i.enc = {},
          s = m.Hex = {
            stringify: function(a) {
              for (var e = a.words, a = a.sigBytes, c = [], b = 0; b < a; b++) {
                var d = e[b >>> 2] >>> 24 - 8 * (b % 4) & 255;
                c.push((d >>> 4).toString(16));
                c.push((d & 15).toString(16))
              }
              return c.join('')
            },
            parse: function(a) {
              for (var e = a.length, c = [], b = 0; b < e; b += 2) c[b >>> 3] |= parseInt(a.substr(b, 2), 16) << 24 - 4 * (b % 8);
              return o.create(c, e / 2)
            }
          },
          n = m.Latin1 = {
            stringify: function(a) {
              for (var e =
                  a.words, a = a.sigBytes, c = [], b = 0; b < a; b++) c.push(String.fromCharCode(e[b >>> 2] >>> 24 - 8 * (b % 4) & 255));
              return c.join('')
            },
            parse: function(a) {
              for (var e = a.length, c = [], b = 0; b < e; b++) c[b >>> 2] |= (a.charCodeAt(b) & 255) << 24 - 8 * (b % 4);
              return o.create(c, e)
            }
          },
          k = m.Utf8 = {
            stringify: function(a) {
              try {
                return decodeURIComponent(escape(n.stringify(a)))
              } catch (e) {
                throw Error('Malformed UTF-8 data');
              }
            },
            parse: function(a) {
              return n.parse(unescape(encodeURIComponent(a)))
            }
          },
          f = l.BufferedBlockAlgorithm = r.extend({
            reset: function() {
              this._data = o.create();
              this._nDataBytes = 0
            },
            _append: function(a) {
              'string' == typeof a && (a = k.parse(a));
              this._data.concat(a);
              this._nDataBytes += a.sigBytes
            },
            _process: function(a) {
              var e = this._data,
                c = e.words,
                b = e.sigBytes,
                d = this.blockSize,
                q = b / (4 * d),
                q = a ? p.ceil(q) : p.max((q | 0) - this._minBufferSize, 0),
                a = q * d,
                b = p.min(4 * a, b);
              if (a) {
                for (var j = 0; j < a; j += d) this._doProcessBlock(c, j);
                j = c.splice(0, a);
                e.sigBytes -= b
              }
              return o.create(j, b)
            },
            clone: function() {
              var a = r.clone.call(this);
              a._data = this._data.clone();
              return a
            },
            _minBufferSize: 0
          });
        l.Hasher = f.extend({
          init: function() {
            this.reset()
          },
          reset: function() {
            f.reset.call(this);
            this._doReset()
          },
          update: function(a) {
            this._append(a);
            this._process();
            return this
          },
          finalize: function(a) {
            a && this._append(a);
            this._doFinalize();
            return this._hash
          },
          clone: function() {
            var a = f.clone.call(this);
            a._hash = this._hash.clone();
            return a
          },
          blockSize: 16,
          _createHelper: function(a) {
            return function(e, c) {
              return a.create(c).finalize(e)
            }
          },
          _createHmacHelper: function(a) {
            return function(e, c) {
              return g.HMAC.create(a, c).finalize(e)
            }
          }
        });
        var g = i.algo = {};
        return i
      }(Math);
      (function() {
        var p = that.data.CryptoJS,
          h = p.lib.WordArray;
        p.enc.Base64 = {
          stringify: function(i) {
            var l = i.words,
              h = i.sigBytes,
              o = this._map;
            i.clamp();
            for (var i = [], m = 0; m < h; m += 3)
              for (var s = (l[m >>> 2] >>> 24 - 8 * (m % 4) & 255) << 16 | (l[m + 1 >>> 2] >>> 24 - 8 * ((m + 1) % 4) & 255) << 8 | l[m + 2 >>> 2] >>> 24 - 8 * ((m + 2) % 4) & 255, n = 0; 4 > n && m + 0.75 * n < h; n++) i.push(o.charAt(s >>> 6 * (3 - n) & 63));
            if (l = o.charAt(64))
              for (; i.length % 4;) i.push(l);
            return i.join('')
          },
          parse: function(i) {
            var i = i.replace(/\s/g, ''),
              l = i.length,
              r = this._map,
              o = r.charAt(64);
            o && (o = i.indexOf(o), -1 != o && (l = o));
            for (var o = [], m = 0, s = 0; s < l; s++)
              if (s % 4) {
                var n = r.indexOf(i.charAt(s - 1)) << 2 * (s % 4),
                  k = r.indexOf(i.charAt(s)) >>> 6 - 2 * (s % 4);
                o[m >>> 2] |= (n | k) << 24 - 8 * (m % 4);
                m++
              }
            return h.create(o, m)
          },
          _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
        }
      })();
      (function(p) {
        function h(f, g, a, e, c, b, d) {
          f = f + (g & a | ~g & e) + c + d;
          return (f << b | f >>> 32 - b) + g
        }

        function i(f, g, a, e, c, b, d) {
          f = f + (g & e | a & ~e) + c + d;
          return (f << b | f >>> 32 - b) + g
        }

        function l(f, g, a, e, c, b, d) {
          f = f + (g ^ a ^ e) + c + d;
          return (f << b | f >>> 32 - b) + g
        }

        function r(f, g, a, e, c, b, d) {
          f = f + (a ^ (g | ~e)) + c + d;
          return (f << b | f >>> 32 - b) + g
        }

        var o = that.data.CryptoJS,
          m = o.lib,
          s = m.WordArray,
          m = m.Hasher,
          n = o.algo,
          k = [];
        (function() {
          for (var f = 0; 64 > f; f++) k[f] = 4294967296 * p.abs(p.sin(f + 1)) | 0
        })();
        n = n.MD5 = m.extend({
          _doReset: function() {
            this._hash = s.create([1732584193, 4023233417,
              2562383102, 271733878
            ])
          },
          _doProcessBlock: function(f, g) {
            for (var a = 0; 16 > a; a++) {
              var e = g + a,
                c = f[e];
              f[e] = (c << 8 | c >>> 24) & 16711935 | (c << 24 | c >>> 8) & 4278255360
            }
            for (var e = this._hash.words, c = e[0], b = e[1], d = e[2], q = e[3], a = 0; 64 > a; a += 4) 16 > a ? (c = h(c, b, d, q, f[g + a], 7, k[a]), q = h(q, c, b, d, f[g + a + 1], 12, k[a + 1]), d = h(d, q, c, b, f[g + a + 2], 17, k[a + 2]), b = h(b, d, q, c, f[g + a + 3], 22, k[a + 3])) : 32 > a ? (c = i(c, b, d, q, f[g + (a + 1) % 16], 5, k[a]), q = i(q, c, b, d, f[g + (a + 6) % 16], 9, k[a + 1]), d = i(d, q, c, b, f[g + (a + 11) % 16], 14, k[a + 2]), b = i(b, d, q, c, f[g + a % 16], 20, k[a + 3])) : 48 > a ? (c =
              l(c, b, d, q, f[g + (3 * a + 5) % 16], 4, k[a]), q = l(q, c, b, d, f[g + (3 * a + 8) % 16], 11, k[a + 1]), d = l(d, q, c, b, f[g + (3 * a + 11) % 16], 16, k[a + 2]), b = l(b, d, q, c, f[g + (3 * a + 14) % 16], 23, k[a + 3])) : (c = r(c, b, d, q, f[g + 3 * a % 16], 6, k[a]), q = r(q, c, b, d, f[g + (3 * a + 7) % 16], 10, k[a + 1]), d = r(d, q, c, b, f[g + (3 * a + 14) % 16], 15, k[a + 2]), b = r(b, d, q, c, f[g + (3 * a + 5) % 16], 21, k[a + 3]));
            e[0] = e[0] + c | 0;
            e[1] = e[1] + b | 0;
            e[2] = e[2] + d | 0;
            e[3] = e[3] + q | 0
          },
          _doFinalize: function() {
            var f = this._data,
              g = f.words,
              a = 8 * this._nDataBytes,
              e = 8 * f.sigBytes;
            g[e >>> 5] |= 128 << 24 - e % 32;
            g[(e + 64 >>> 9 << 4) + 14] = (a << 8 | a >>>
              24) & 16711935 | (a << 24 | a >>> 8) & 4278255360;
            f.sigBytes = 4 * (g.length + 1);
            this._process();
            f = this._hash.words;
            for (g = 0; 4 > g; g++) a = f[g], f[g] = (a << 8 | a >>> 24) & 16711935 | (a << 24 | a >>> 8) & 4278255360
          }
        });
        o.MD5 = m._createHelper(n);
        o.HmacMD5 = m._createHmacHelper(n)
      })(Math);
      (function() {
        var p = that.data.CryptoJS,
          h = p.lib,
          i = h.Base,
          l = h.WordArray,
          h = p.algo,
          r = h.EvpKDF = i.extend({
            cfg: i.extend({
              keySize: 4,
              hasher: h.MD5,
              iterations: 1
            }),
            init: function(i) {
              this.cfg = this.cfg.extend(i)
            },
            compute: function(i, m) {
              for (var h = this.cfg, n = h.hasher.create(), k = l.create(), f = k.words, g = h.keySize, h = h.iterations; f.length < g;) {
                a && n.update(a);
                var a = n.update(i).finalize(m);
                n.reset();
                for (var e = 1; e < h; e++) a = n.finalize(a), n.reset();
                k.concat(a)
              }
              k.sigBytes = 4 * g;
              return k
            }
          });
        p.EvpKDF = function(i, l, h) {
          return r.create(h).compute(i,
            l)
        }
      })();
      that.data.CryptoJS.lib.Cipher || function(p) {
        var h = that.data.CryptoJS,
          i = h.lib,
          l = i.Base,
          r = i.WordArray,
          o = i.BufferedBlockAlgorithm,
          m = h.enc.Base64,
          s = h.algo.EvpKDF,
          n = i.Cipher = o.extend({
            cfg: l.extend(),
            createEncryptor: function(b, d) {
              return this.create(this._ENC_XFORM_MODE, b, d)
            },
            createDecryptor: function(b, d) {
              return this.create(this._DEC_XFORM_MODE, b, d)
            },
            init: function(b, d, a) {
              this.cfg = this.cfg.extend(a);
              this._xformMode = b;
              this._key = d;
              this.reset()
            },
            reset: function() {
              o.reset.call(this);
              this._doReset()
            },
            process: function(b) {
              this._append(b);
              return this._process()
            },
            finalize: function(b) {
              b && this._append(b);
              return this._doFinalize()
            },
            keySize: 4,
            ivSize: 4,
            _ENC_XFORM_MODE: 1,
            _DEC_XFORM_MODE: 2,
            _createHelper: function() {
              return function(b) {
                return {
                  encrypt: function(a, q, j) {
                    return ('string' == typeof q ? c : e).encrypt(b, a, q, j)
                  },
                  decrypt: function(a, q, j) {
                    return ('string' == typeof q ? c : e).decrypt(b, a, q, j)
                  }
                }
              }
            }()
          });
        i.StreamCipher = n.extend({
          _doFinalize: function() {
            return this._process(!0)
          },
          blockSize: 1
        });
        var k = h.mode = {},
          f = i.BlockCipherMode = l.extend({
            createEncryptor: function(b, a) {
              return this.Encryptor.create(b,
                a)
            },
            createDecryptor: function(b, a) {
              return this.Decryptor.create(b, a)
            },
            init: function(b, a) {
              this._cipher = b;
              this._iv = a
            }
          }),
          k = k.CBC = function() {
            function b(b, a, d) {
              var c = this._iv;
              c ? this._iv = p : c = this._prevBlock;
              for (var e = 0; e < d; e++) b[a + e] ^= c[e]
            }

            var a = f.extend();
            a.Encryptor = a.extend({
              processBlock: function(a, d) {
                var c = this._cipher,
                  e = c.blockSize;
                b.call(this, a, d, e);
                c.encryptBlock(a, d);
                this._prevBlock = a.slice(d, d + e)
              }
            });
            a.Decryptor = a.extend({
              processBlock: function(a, d) {
                var c = this._cipher,
                  e = c.blockSize,
                  f = a.slice(d, d +
                    e);
                c.decryptBlock(a, d);
                b.call(this, a, d, e);
                this._prevBlock = f
              }
            });
            return a
          }(),
          g = (h.pad = {}).Pkcs7 = {
            pad: function(b, a) {
              for (var c = 4 * a, c = c - b.sigBytes % c, e = c << 24 | c << 16 | c << 8 | c, f = [], g = 0; g < c; g += 4) f.push(e);
              c = r.create(f, c);
              b.concat(c)
            },
            unpad: function(b) {
              b.sigBytes -= b.words[b.sigBytes - 1 >>> 2] & 255
            }
          };
        i.BlockCipher = n.extend({
          cfg: n.cfg.extend({
            mode: k,
            padding: g
          }),
          reset: function() {
            n.reset.call(this);
            var b = this.cfg,
              a = b.iv,
              b = b.mode;
            if (this._xformMode == this._ENC_XFORM_MODE) var c = b.createEncryptor;
            else c = b.createDecryptor,
              this._minBufferSize = 1;
            this._mode = c.call(b, this, a && a.words)
          },
          _doProcessBlock: function(b, a) {
            this._mode.processBlock(b, a)
          },
          _doFinalize: function() {
            var b = this.cfg.padding;
            if (this._xformMode == this._ENC_XFORM_MODE) {
              b.pad(this._data, this.blockSize);
              var a = this._process(!0)
            } else a = this._process(!0), b.unpad(a);
            return a
          },
          blockSize: 4
        });
        var a = i.CipherParams = l.extend({
            init: function(a) {
              this.mixIn(a)
            },
            toString: function(a) {
              return (a || this.formatter).stringify(this)
            }
          }),
          k = (h.format = {}).OpenSSL = {
            stringify: function(a) {
              var d =
                a.ciphertext,
                a = a.salt,
                d = (a ? r.create([1398893684, 1701076831]).concat(a).concat(d) : d).toString(m);
              return d = d.replace(/(.{64})/g, '$1\n')
            },
            parse: function(b) {
              var b = m.parse(b),
                d = b.words;
              if (1398893684 == d[0] && 1701076831 == d[1]) {
                var c = r.create(d.slice(2, 4));
                d.splice(0, 4);
                b.sigBytes -= 16
              }
              return a.create({
                ciphertext: b,
                salt: c
              })
            }
          },
          e = i.SerializableCipher = l.extend({
            cfg: l.extend({
              format: k
            }),
            encrypt: function(b, d, c, e) {
              var e = this.cfg.extend(e),
                f = b.createEncryptor(c, e),
                d = f.finalize(d),
                f = f.cfg;
              return a.create({
                ciphertext: d,
                key: c,
                iv: f.iv,
                algorithm: b,
                mode: f.mode,
                padding: f.padding,
                blockSize: b.blockSize,
                formatter: e.format
              })
            },
            decrypt: function(a, c, e, f) {
              f = this.cfg.extend(f);
              c = this._parse(c, f.format);
              return a.createDecryptor(e, f).finalize(c.ciphertext)
            },
            _parse: function(a, c) {
              return 'string' == typeof a ? c.parse(a) : a
            }
          }),
          h = (h.kdf = {}).OpenSSL = {
            compute: function(b, c, e, f) {
              f || (f = r.random(8));
              b = s.create({
                keySize: c + e
              }).compute(b, f);
              e = r.create(b.words.slice(c), 4 * e);
              b.sigBytes = 4 * c;
              return a.create({
                key: b,
                iv: e,
                salt: f
              })
            }
          },
          c = i.PasswordBasedCipher =
          e.extend({
            cfg: e.cfg.extend({
              kdf: h
            }),
            encrypt: function(a, c, f, j) {
              j = this.cfg.extend(j);
              f = j.kdf.compute(f, a.keySize, a.ivSize);
              j.iv = f.iv;
              a = e.encrypt.call(this, a, c, f.key, j);
              a.mixIn(f);
              return a
            },
            decrypt: function(a, c, f, j) {
              j = this.cfg.extend(j);
              c = this._parse(c, j.format);
              f = j.kdf.compute(f, a.keySize, a.ivSize, c.salt);
              j.iv = f.iv;
              return e.decrypt.call(this, a, c, f.key, j)
            }
          })
      }();
      (function() {
        var p = that.data.CryptoJS,
          h = p.lib.BlockCipher,
          i = p.algo,
          l = [],
          r = [],
          o = [],
          m = [],
          s = [],
          n = [],
          k = [],
          f = [],
          g = [],
          a = [];
        (function() {
          for (var c = [], b = 0; 256 > b; b++) c[b] = 128 > b ? b << 1 : b << 1 ^ 283;
          for (var d = 0, e = 0, b = 0; 256 > b; b++) {
            var j = e ^ e << 1 ^ e << 2 ^ e << 3 ^ e << 4,
              j = j >>> 8 ^ j & 255 ^ 99;
            l[d] = j;
            r[j] = d;
            var i = c[d],
              h = c[i],
              p = c[h],
              t = 257 * c[j] ^ 16843008 * j;
            o[d] = t << 24 | t >>> 8;
            m[d] = t << 16 | t >>> 16;
            s[d] = t << 8 | t >>> 24;
            n[d] = t;
            t = 16843009 * p ^ 65537 * h ^ 257 * i ^ 16843008 * d;
            k[j] = t << 24 | t >>> 8;
            f[j] = t << 16 | t >>> 16;
            g[j] = t << 8 | t >>> 24;
            a[j] = t;
            d ? (d = i ^ c[c[c[p ^ i]]], e ^= c[c[e]]) : d = e = 1
          }
        })();
        var e = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54],
          i = i.AES = h.extend({
            _doReset: function() {
              for (var c = this._key, b = c.words, d = c.sigBytes / 4, c = 4 * ((this._nRounds = d + 6) + 1), i = this._keySchedule = [], j = 0; j < c; j++)
                if (j < d) i[j] = b[j];
                else {
                  var h = i[j - 1];
                  j % d ? 6 < d && 4 == j % d && (h = l[h >>> 24] << 24 | l[h >>> 16 & 255] << 16 | l[h >>> 8 & 255] << 8 | l[h & 255]) : (h = h << 8 | h >>> 24, h = l[h >>> 24] << 24 | l[h >>> 16 & 255] << 16 | l[h >>> 8 & 255] << 8 | l[h & 255], h ^= e[j / d | 0] << 24);
                  i[j] = i[j - d] ^ h
                }
              b = this._invKeySchedule = [];
              for (d = 0; d < c; d++) j = c - d, h = d % 4 ? i[j] : i[j - 4], b[d] = 4 > d || 4 >= j ? h : k[l[h >>> 24]] ^ f[l[h >>>
                16 & 255]] ^ g[l[h >>> 8 & 255]] ^ a[l[h & 255]]
            },
            encryptBlock: function(a, b) {
              this._doCryptBlock(a, b, this._keySchedule, o, m, s, n, l)
            },
            decryptBlock: function(c, b) {
              var d = c[b + 1];
              c[b + 1] = c[b + 3];
              c[b + 3] = d;
              this._doCryptBlock(c, b, this._invKeySchedule, k, f, g, a, r);
              d = c[b + 1];
              c[b + 1] = c[b + 3];
              c[b + 3] = d
            },
            _doCryptBlock: function(a, b, d, e, f, h, i, g) {
              for (var l = this._nRounds, k = a[b] ^ d[0], m = a[b + 1] ^ d[1], o = a[b + 2] ^ d[2], n = a[b + 3] ^ d[3], p = 4, r = 1; r < l; r++) var s = e[k >>> 24] ^ f[m >>> 16 & 255] ^ h[o >>> 8 & 255] ^ i[n & 255] ^ d[p++],
                u = e[m >>> 24] ^ f[o >>> 16 & 255] ^ h[n >>> 8 & 255] ^
                i[k & 255] ^ d[p++],
                v = e[o >>> 24] ^ f[n >>> 16 & 255] ^ h[k >>> 8 & 255] ^ i[m & 255] ^ d[p++],
                n = e[n >>> 24] ^ f[k >>> 16 & 255] ^ h[m >>> 8 & 255] ^ i[o & 255] ^ d[p++],
                k = s,
                m = u,
                o = v;
              s = (g[k >>> 24] << 24 | g[m >>> 16 & 255] << 16 | g[o >>> 8 & 255] << 8 | g[n & 255]) ^ d[p++];
              u = (g[m >>> 24] << 24 | g[o >>> 16 & 255] << 16 | g[n >>> 8 & 255] << 8 | g[k & 255]) ^ d[p++];
              v = (g[o >>> 24] << 24 | g[n >>> 16 & 255] << 16 | g[k >>> 8 & 255] << 8 | g[m & 255]) ^ d[p++];
              n = (g[n >>> 24] << 24 | g[k >>> 16 & 255] << 16 | g[m >>> 8 & 255] << 8 | g[o & 255]) ^ d[p++];
              a[b] = s;
              a[b + 1] = u;
              a[b + 2] = v;
              a[b + 3] = n
            },
            keySize: 8
          });
        p.AES = h._createHelper(i)
      })();
      (function() {
        var g = that.data.CryptoJS,
          i = g.lib,
          f = i.WordArray,
          i = i.Hasher,
          b = [],
          m = g.algo.SHA1 = i.extend({
            _doReset: function() {
              this._hash = f.create([1732584193, 4023233417, 2562383102, 271733878, 3285377520])
            },
            _doProcessBlock: function(f, n) {
              for (var d = this._hash.words, j = d[0], k = d[1], h = d[2], g = d[3], a = d[4], e = 0; 80 > e; e++) {
                if (16 > e) b[e] = f[n + e] | 0;
                else {
                  var c = b[e - 3] ^ b[e - 8] ^ b[e - 14] ^ b[e - 16];
                  b[e] = c << 1 | c >>> 31
                }
                c = (j << 5 | j >>> 27) + a + b[e];
                c = 20 > e ? c + ((k & h | ~k & g) + 1518500249) : 40 > e ? c + ((k ^ h ^ g) + 1859775393) : 60 > e ? c + ((k & h | k & g | h & g) - 1894007588) : c + ((k ^ h ^ g) -
                  899497514);
                a = g;
                g = h;
                h = k << 30 | k >>> 2;
                k = j;
                j = c
              }
              d[0] = d[0] + j | 0;
              d[1] = d[1] + k | 0;
              d[2] = d[2] + h | 0;
              d[3] = d[3] + g | 0;
              d[4] = d[4] + a | 0
            },
            _doFinalize: function() {
              var b = this._data,
                f = b.words,
                d = 8 * this._nDataBytes,
                j = 8 * b.sigBytes;
              f[j >>> 5] |= 128 << 24 - j % 32;
              f[(j + 64 >>> 9 << 4) + 15] = d;
              b.sigBytes = 4 * f.length;
              this._process()
            }
          });
        g.SHA1 = i._createHelper(m);
        g.HmacSHA1 = i._createHmacHelper(m)
      })();
      (function() {
        var g = that.data.CryptoJS,
          i = g.enc.Utf8;
        g.algo.HMAC = g.lib.Base.extend({
          init: function(f, b) {
            f = this._hasher = f.create();
            'string' == typeof b && (b = i.parse(b));
            var g = f.blockSize,
              l = 4 * g;
            b.sigBytes > l && (b = f.finalize(b));
            for (var n = this._oKey = b.clone(), d = this._iKey = b.clone(), j = n.words, k = d.words, h = 0; h < g; h++) j[h] ^= 1549556828, k[h] ^= 909522486;
            n.sigBytes = d.sigBytes = l;
            this.reset()
          },
          reset: function() {
            var f = this._hasher;
            f.reset();
            f.update(this._iKey)
          },
          update: function(f) {
            this._hasher.update(f);
            return this
          },
          finalize: function(f) {
            var b =
              this._hasher,
              f = b.finalize(f);
            b.reset();
            return b.finalize(this._oKey.clone().concat(f))
          }
        })
      })();
      (function() {
        var g = that.data.CryptoJS,
          i = g.lib,
          f = i.Base,
          b = i.WordArray,
          i = g.algo,
          m = i.HMAC,
          l = i.PBKDF2 = f.extend({
            cfg: f.extend({
              keySize: 4,
              hasher: i.SHA1,
              iterations: 1
            }),
            init: function(b) {
              this.cfg = this.cfg.extend(b)
            },
            compute: function(f, d) {
              for (var g = this.cfg, k = m.create(g.hasher, f), h = b.create(), i = b.create([1]), a = h.words, e = i.words, c = g.keySize, g = g.iterations; a.length < c;) {
                var l = k.update(d).finalize(i);
                k.reset();
                for (var q = l.words, t = q.length, r = l, s = 1; s < g; s++) {
                  r = k.finalize(r);
                  k.reset();
                  for (var v = r.words, p = 0; p < t; p++) q[p] ^= v[p]
                }
                h.concat(l);
                e[0]++
              }
              h.sigBytes = 4 * c;
              return h
            }
          });
        g.PBKDF2 = function(b, d, f) {
          return l.create(f).compute(b, d)
        }
      })();
    },

    //初始化AES加密算法模块
    initAesUtil: function() {
      var that = this;
      that.data.AesUtil = function(keySize, iterationCount) {
        this.keySize = keySize / 32;
        this.iterationCount = iterationCount;
        this.key = {
          'words': [250181692, 1287279318, -2018848139, 38282178, -1732303752],
          'sigBytes': 16
        };
      };

      that.data.AesUtil.prototype.encrypt = function(iv, plainText) {
        var encrypted = that.data.CryptoJS.AES.encrypt(
          plainText,
          this.key, {
            iv: that.data.CryptoJS.enc.Hex.parse(iv)
          });
        return encrypted.ciphertext.toString(that.data.CryptoJS.enc.Base64);
      }

      that.data.AesUtil.prototype.decrypt = function(iv, cipherText) {
        var cipherParams = that.data.CryptoJS.lib.CipherParams.create({
          ciphertext: that.data.CryptoJS.enc.Base64.parse(cipherText)
        });
        var decrypted = that.data.CryptoJS.AES.decrypt(
          cipherParams,
          this.key, {
            iv: that.data.CryptoJS.enc.Hex.parse(iv)
          });
        return decrypted.toString(that.data.CryptoJS.enc.Utf8);
      }
    },

    //对字符串str进行AES加密解密 boo 0：加密，1：解密
    JSAES: function(str, boo) {
      var that = this;
      var iv = '3d70d6aee9810adac87eac0a78ba69be';
      var iterationCount = 1000,
        keySize = 128,
        aesUtil = new that.data.AesUtil(keySize, iterationCount);
      return boo === 0 ? aesUtil.encrypt(iv, str) : aesUtil.decrypt(iv, str);
    },

    //json序列化中的转义部分
    quote: function(string) {
      var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
      return rx_escapable.test(string) ?
        '\"' + string.replace(rx_escapable, function(a) {
          var c = meta[a];
          return typeof c === 'string' ?
            c :
            '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '\"' :
        '\"' + string + '\"';
    }
  }
})