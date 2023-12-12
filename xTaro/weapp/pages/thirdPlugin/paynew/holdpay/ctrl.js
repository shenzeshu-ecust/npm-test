  import {
    cwx  } from '../../../../cwx/cwx.js';
  import __global from '../../../../cwx/ext/global.js';
  import paymentStore from '../models/stores.js';
  import Util from '../common/util.js';
  import * as Business from '../common/combus';

  const {
    getParam,
    getOpenid
  } = Business
  const CommonUtils = Util

  import {
    paywayModel,
    getOrderInfo,
    paywaySubmitModel,
    payResModel,
    queryThirdPayStatus,
    appendQuery,
    getPageTraceId,
  } from '../libs/index';

  let payOptions = {}; // 原数据
  let payData = {}; // 处理后的数据
  let payItem = null; // 从102提取到的支付方式
  let isWxScoreConfirmChannel = false;
  let orderInfo = {};
  let res102 = {};
  let res303 = {};
  let shouldNavBack = false
  let shouldInvoke = false

  const isCtrip = true;

  const requestContext = {
    cwx: cwx,
    env: __global.env,
    subEnv: 'fat18'
  };

  const getRequestExtend = (params={}) => JSON.stringify({
    pageTraceId: getPageTraceId(),
    paymentTraceId: params.paymentTraceId || Util.getOrCreatePaymentTraceId()
  })
  const holdpayPath = '/pages/paynew/holdpay/index'
  const {
    CreateGuid
  } = Util
  const wxR = wx
  const MatchBrandId = 'WechatQuick'

  let orderDetailStore = paymentStore.HoldTokenStore(); // 保存整个orderInfo
  let payItemDisplayStore = paymentStore.HoldResultOrderStore(); // 从102提取到的支付方式显示信息
  let wxscoreStore = paymentStore.WxscoreStore(); // 给微信分页的参数
  const PayParamsStore = paymentStore.PayParamsStore
  const reportErrorLog = Business.reportErrorLog
  const sendUbt = Business.sendUbt

  const emptyFn = () => {};
  let initCallback = emptyFn;

  // 返回状态： rc： 1 成功、 2 取消、 3、 提交支付时失败 4、微信支付分开通失败 5、 超时 6、转预付
  const rcMap = {
    suc: 1,
    cancel: 2,
    fail: 3,
    failOpen: 4,
    timeout: 5,
    toPrePay: 6,
  };
  // scoreState  0 失败、 1 成功、2 跳转授权页成功、 -3 取消
  // rc映射为scoreState
  const scoreMapRc = {
    '1': 1,
    '2': -3,
    '3': 2,
    '4': 0,
    '5': 5,
    '6': 6,
  }

  const callbackDelay = 1500; // BU回调的延迟
  const showToastkDelay = 3000; // 提示信息留存时间

  // 返回地址优先级： BU直传>服务下发>回上一页
  function sBack({
    rc = rcMap.suc,
    delay = showToastkDelay,
    title = '下单成功'
  } = {}) {
    sendUbt({
      type: 'chain',
      chainName: 'paySuccess',
      a: 'sback',
      b: '5001',
      dd: '微信分授权成功',
      title,
      payOptions
    });
    try {
      wxR.showToast({
        title
      });
      const payOrderInfo = orderInfo.payOrderInfo || '';
      const merchant = payOrderInfo.merchant || {};
      const callbackParam = {
        rc,
        title,
        scoreState: scoreMapRc[rc] || rc,
      };
      // 跳转授权的，要直接返回，这是老逻辑
      if (payOptions.sbackCallback) {
        console.log('callbackParam', callbackParam);
        if (shouldNavBack) {
          const navBackParam = {
            type: 'sback',
            data: {
              orderID: orderInfo.outTradeNo || '',
              busType: merchant.busType || '',
              price: Number(orderInfo.orderAmount),
            }
          };
          sendUbt({
            a: 'sBack',
            b: '5004',
            dd: '需要nav回退',
            callbackParam
          });
          wxR.navigateBack(navBackParam);
        }
        //   延迟调用，支持BU立即跳转结果页
        setTimeout(() => {
          payOptions.sbackCallback(callbackParam);
        }, callbackDelay);
        return;
      }
      let jumpUrl = '';
      const sback = payOrderInfo.sback || (merchant.sback);
      if (payOptions.sBackUrl) {
        jumpUrl = payOptions.sBackUrl;
      } else if (sback) {
        jumpUrl = sback;
      }
      jumpPage(jumpUrl, rc, delay);
    } catch (error) {
      console.err('sBack err', error);
      sendUbt({ type: 'error', a: 'sBack-err', dd: 'sback执行失败', extend: error});
    }
  }

  function eBack(options = {}) {
    const thisOption = {
      rc: rcMap.fail,
      delay: showToastkDelay,
      title: '下单失败',
      needCheckSwitchPrePay: false, // 是否需要检查转预付逻辑
      ...options
    };
    const {
      rc,
      delay,
      title,
      needCheckSwitchPrePay
    } = thisOption;
    sendUbt({
      a: 'eBack',
      b: '5002',
      dd: '微信分授权失败',
      title
    });
    if (needCheckSwitchPrePay) {
      // 303看 head 100001， 且有directPayButtons
      const checkFrom303 = res303.head && res303.head.code === 1 && res303.directPayButtons;
      const supportDirectPay = checkFrom303;
      if (supportDirectPay) {
        sendUbt({
          a: 'supportDirectPay',
          b: '65264',
          dd: '后付失败-支持转预付',
          extend: thisOption
        });
        const title = res303.head && res303.head.message || '无法发起授权，试试在线支付吧';
        const directPayButtons = res303.directPayButtons || [];
        doSwitchPrePay({
          ...thisOption,
          title,
          directPayButtons,
        });
        return;
      }
    }
    wxR.showToast({
      title,
      icon: 'none'
    });
    const payOrderInfo = orderInfo.payOrderInfo || '';
    const merchant = payOrderInfo.merchant || {};
    const callbackParam = {
      rc,
      title,
      scoreState: scoreMapRc[rc] || rc,
      orderID: orderInfo.outTradeNo || '',
      busType: merchant.busType || '',
      price: Number(orderInfo.orderAmount),
    };
    if (payOptions.ebackCallback) {
      // 跳转授权的，要直接返回，这是老逻辑
      if (shouldNavBack) {
        sendUbt({
          a: 'sBack',
          b: '5005',
          dd: '需要nav回退',
          extend: callbackParam
        });
        wxR.navigateBack({
          type: 'eback',
          data: callbackParam
        });
      }
      //   延迟调用，支持BU立即跳转结果页
      setTimeout(() => {
        payOptions.ebackCallback(callbackParam);
      }, callbackDelay);
      return;
    }
    let jumpUrl = '';
    const eback = payOrderInfo.eback || payOrderInfo.fromUrl || merchant.eback || merchant.fromUrl;
    if (payOptions.eBackUrl) {
      jumpUrl = payOptions.eBackUrl;
    } else if (eback) {
      jumpUrl = eback;
    }
    jumpPage(jumpUrl, rc, delay);
  }

  function jumpPage(jumpUrl, rc, delay) {
    sendUbt({
      a: 'jumpPage',
      b: '5003',
      dd: '微信分授权跳转',
      extend: {
        jumpUrl,
        rc,
        delay
      }
    });
    setTimeout(() => {
      if (jumpUrl) {
        let resUrl = appendQuery(jumpUrl, 'rc=' + rc);
        resUrl = appendQuery(resUrl, 'scoreState=' + scoreMapRc[rc]);
        if (Util.isUrl(resUrl)) {
          sendUbt({
            a: 'jumpPage',
            b: '5004',
            dd: '微信分授权跳转 cwebview',
            jumpUrl
          });
          CommonUtils.openWebview({
            url: resUrl,
            isNavigate: false
          });
        } else {
          wxR.redirectTo({
            url: resUrl
          });
        }
      } else {
        wxR.navigateBack();
      }
    }, delay);
  }

  // 转预付方法，弹窗并调用回调或跳转url
  function doSwitchPrePay(ebackOptions) {
    const {
      rc,
      delay,
      title,
      directPayButtons = []
    } = ebackOptions;
    // const title = res303.head && res303.head.message || (res102.displayInfo.tips.find(item=>item.key === 'noPayWayTip')|| {}).value || '无法发起授权，试试在线支付吧'
    // const directPayButtons = res303.directPayButtons || res102.displayInfo.directPayButtons || []
    const confirmBtn = (directPayButtons.find(item => item.buttonType === 'pay') || {});
    const confirmText = confirmBtn.buttonName || '在线支付';
    const cancelText = (directPayButtons.find(item => item.buttonType === 'cancel') || {}).buttonName || '取消';
    wxR.showModal({
      title,
      confirmText,
      cancelText,
      success(res) {
        if (res.confirm) {
          // 直连的跳url，API的调用回调
          sendUbt({
            a: 'doSwitchPrePay',
            b: '89456',
            dd: '用户点击转预付-确认'
          });
          const paylink = confirmBtn.jumpUrl;
          if (payOptions.ebackCallback) {
            sendUbt({
              a: 'doSwitchPrePay',
              b: '7894',
              dd: '确认跳转预付，调用回调-ebackCallback'
            });
            const callbackParam = {
              rc: rcMap.toPrePay, // 转预付code
              title,
              scoreState: rcMap.toPrePay,
            };
            if (shouldNavBack) {
              const navBackParam = {
                type: 'switchPrePay',
                data: {
                  orderID: orderInfo.outTradeNo || '',
                }
              };
              sendUbt({
                a: 'switchPrePay',
                b: '5004',
                dd: 'switchPrePay需要nav回退',
                callbackParam
              });
              wxR.navigateBack(navBackParam);
            }
            //   延迟调用，支持BU立即跳转结果页
            setTimeout(() => {
              payOptions.ebackCallback(callbackParam);
            }, callbackDelay);
            return;
          } else {
            jumpPage(paylink, rc, delay);
          }
        } else if (res.cancel) {
          sendUbt({
            a: 'doSwitchPrePay',
            b: '89456',
            dd: '用户点击转预付-取消'
          });
          eBack({
            ...ebackOptions,
            needCheckSwitchPrePay: false
          });
        }
      }
    });
  }

  // api调用
  const init = (options, callback) => {
    Business.initFullChain('post_payment')
    payOptions = {
      ...options,
      isApiInit: true
    };
    payData = {
      h5: false // api
    };
    sendUbt({
      type: 'chain',
      chainName: 'init',
      a: 'init',
      b: '4001',
      dd: 'api接入后付开始',
      options
    });
    doPay(options, callback);
  };

  /**
   * h5直连后付
   * 步骤：
   * 1.中台请求102， paytoken为后付链接中的参数
   * 2.请求303发起支付
   *     code:70 处理（授权|需确认）
   */
  const initH5 = (options, callback) => {
    payOptions = options;
    payData = {
      h5: true
    }; // h5直连
    sendUbt({
      type: 'chain',
      chainName: 'init',
      a: 'initH5',
      b: '4000',
      dd: 'h5直连后付开始',
      options
    });
    doPay(options, callback);
  };

  const doPay = (options, callback) => {
    initCallback = callback || emptyFn;
    shouldNavBack = false;
    //   vChainToken 在rebind场景才需要，初始清空
    wxscoreStore.setAttr('vChainToken', '');
    const tradeNo = Util.getParam('tradeNo', options.cashierUrl);
    const _payToken = Util.getParam('payToken', options.cashierUrl);
    const payToken = options.tradeNo || options.payToken || tradeNo || _payToken;
    PayParamsStore().setAttr('payToken', payToken);
    if (!payToken) {
      eBack({
        title: '系统异常，请稍后再试 -1002'
      });
      reportErrorLog({
        errorType: '31001',
        errorMessage: '没有传tradeNo'
      });
      return;
    }
    payData.payToken = payToken;

    Business.reportTraceLog({
      pageTraceId: getPageTraceId(),
      payToken,
    })

    wxR.showLoading({
      title: '服务获取中..'
    });
    sendUbt({
      type: 'chain', 
      chainName: 'send102',
      a: 'paywayModel',
      b: '4002',
      dd: 'paywayModel 请求102 开始'
    });
    const extend = JSON.stringify({
      pageTraceId: getPageTraceId(),
    })
    const startTime = new Date()
    // 请求102
    paywayModel({
      data: {
        payToken: payToken,
      },
      h5plat: 29,
      context: requestContext,
      requestHead: {
        payScence: '4',
        extend,
      },
      success: (res) => {
        sendUbt({
          type: 'chain', 
          chainName: 'receive102',
          a: 'paywayModel_suc',
          b: '4002',
          dd: 'paywayModel 请求102 success'
        });
        Business.reportTraceLog({
          status102: res.head.code,
          reqPaywayTime: new Date().getTime() - startTime.getTime()
        })
        res102 = res
        wxR.hideLoading();
        // 设置协议链接
        wxscoreStore.setAttr('frontData', {
          ...res.displayInfo,
          withholdProtocolUrl: res.displayInfo && res.displayInfo.agreementUrl
        });
        const thirdList = res.payCatalogInfo && res.payCatalogInfo.thirdPartyList;
        if (!thirdList) {
          eBack({
            title: res.head.message || '系统异常，请稍后再试 -1003',
            needCheckSwitchPrePay: true
          });
          if(res.head.code == 100000){
            reportErrorLog({
              errorType: '31005',
              errorMessage: '没有传三方支付方式',
              extendInfo: res
            });
          }
          return;
        }
        // 微信分的支付方式
        payItem = thirdList.find(item => item.brandId === MatchBrandId);
        if (!payItem) {
          eBack({
            title: '系统异常，请稍后再试 -1004',
            needCheckSwitchPrePay: true
          });
          reportErrorLog({
            errorType: '31009',
            errorMessage: '没有下发支付方式-微信分'
          });
          return;
        }
        // 微信分支付方式显示信息
        const thirdPartyDisplayInfoList = res.displayInfo.thirdPartyDisplayInfoList;
        let payItemDisplay = {};
        if (thirdPartyDisplayInfoList) {
          payItemDisplay = thirdPartyDisplayInfoList.find(item => item.brandId === MatchBrandId) || {};
        }
        payItemDisplayStore.set(payItemDisplay);
        orderDetailStore.set(res.orderInfo);
        orderInfo = res.orderInfo || {};
        // 微信分需确认模式
        if (payItem.attachAttributes.includes('12')) {
          isWxScoreConfirmChannel = true;
          wxscoreStore.setAttr('wxScoreChannel', false);
          wxscoreStore.setAttr('isWxScoreConfirmChannel', true);
        } else {
          isWxScoreConfirmChannel = false;
          wxscoreStore.setAttr('wxScoreChannel', true);
          wxscoreStore.setAttr('isWxScoreConfirmChannel', false);
        }
        sendUbt({
          type: 'chain',
          chainName: 'parseData102Ok',
          a: 'paywayModel_suc_channel',
          b: '4004',
          dd: 'paywayModel 是否需确认模式',
          isWxScoreConfirmChannel
        });
        // submitPay.call(this, res);
        // 只有api且免确认的自动调用提交，否则拉起收银台
        if(!payData.h5 && !isWxScoreConfirmChannel){
          // 请求303
          submitPay.call(this, res);
        }else{
          // h5 渲染页面
          if(payData.h5){
            initCallback();
          }else{
            // api 跳转到收银台
            wxR.navigateTo({
              url: `${holdpayPath}?suc303=1&isConfirm=${isWxScoreConfirmChannel}`
            });
            shouldNavBack = true
          }
        }
      },
      fail: () => {
        Business.reportTraceLog({
          status102: '-1'
        })
        wxR.hideLoading();
        eBack({
          rc: rcMap.fail,
          title: '系统异常，请稍后再试 -1009',
          needCheckSwitchPrePay: true
        });
      },
      complete: () => {}
    }).excute();
  };

  // 请求303
  const submitPay = async (paywayModelData = res102) => {
    const {
      amount
    } = getOrderInfo(paywayModelData) || '';
    const {
      h5plat,
      appId,
      thirdSubTypeID
    } = getParam() || '';

    let mktopenid = getOpenid(); //市场openid

    let extendJson = {
      openid: payOptions.openId || mktopenid,
      wechatOpenId: mktopenid,
      thirdSubTypeID,
      extend: appId,
    };
    if(isCtrip){
      delete extendJson.openid
    }

    // 风控token，防止风控重复返回rebind
    const vChainToken = wxscoreStore.getAttr('vChainToken') || '';

    const dataParam = {
      payToken: payData.payToken,
      payTypes: ['3'],
      paymentMethodInfo: {
        thirdPayInfos: [{
          payAmount: amount,
          routerInfo: {
            paymentWayToken: payItem.paymentWayToken
          },
          extend: JSON.stringify(extendJson)
        }]
      },
      vChainToken
    };
    wxR.showLoading({
      title: '支付提交中..'
    });
    const cid = wxscoreStore.getAttr('cid') || Math.random();
    const nonce303 = CreateGuid();
    wxscoreStore.setAttr('nonce303', nonce303);
    sendUbt({
      a: 'submitPay',
      b: '5001',
      dd: 'submitPay 开始'
    });
    const requestHead = {
      extend: await getRequestExtend(payOptions.cashierUrl),
      payScence: '4',
      nonce: nonce303,
      'deviceInfo': {
        'userAgent': '',
        'clientId': cid,
        'sourceId': '8888',
        'userIp': '',
        'rmsToken': ''
      }
    }
    if (isCtrip) {
      delete requestHead.deviceInfo
    }
    paywaySubmitModel({
      data: dataParam,
      h5plat,
      requestHead,
      context: requestContext,
      success: function (res) {
        sendUbt({
          a: 'submitPay_suc',
          b: '1409',
          dd: 'submitPay 成功'
        });
        wxR.hideLoading();
        res303 = res;
        wxscoreStore.setAttr('vChainToken', res.vChainToken || '');
        res.head = res.head || {};
        if (res.head.code == 70) {
          // 如果是授权按钮点击，则直接唤起授权
          if(shouldInvoke){
            shouldInvoke = false
            toInvokeWxScore()
            return
          }
          // 需确认或未授权
          shouldNavBack = true;
          if (!res.thirdPartyInfo) {
            eBack({
              title: '系统异常，请稍后再试 -1007',
              needCheckSwitchPrePay: true
            });
            return;
          }

          wxscoreStore.setAttr('_payToken', payData.payToken);
          if (payData.h5) {
            initCallback();
          } else {
            wxR.navigateTo({
              url: `${holdpayPath}?suc303=1&isConfirm=${isWxScoreConfirmChannel}`
            });
          }

        } else if (res.head.code === 100000) {
          sBack();
        } else if (res.head.code === 24) {
          // code: 24 已提交
          sBack({
            title: res.head.message || '已授权，请勿重复提交'
          });
        }
        // code: 74, 走到rebind风控，重新提交303，带vchainToken
        else if (res.head.code === 74) {
          submitPay(paywayModelData);
        }
        // code: 81 倒计时结束，授权超时
        else if (res.head.code === 81) {
          eBack({
            rc: rcMap.timeout,
            title: res.head.message || '超过授权时限, 请重新下单',
            needCheckSwitchPrePay: true
          });
        } else {
          // 失败
          eBack({
            rc: rcMap.fail,
            title: res.head.message || '系统异常，请稍后再试 -1006',
            needCheckSwitchPrePay: true
          });
        }
      },
      fail: (e) => {
        wxR.hideLoading();
        sendUbt({
          dd: 'paywaySubmitModel_fail',
          a: '提交后付失败'
        });
        reportErrorLog({
          errorType: '31006',
          errorMessage: '303 request:fail 网络问题',
          extendInfo: e
        });
        eBack({
          rc: rcMap.fail,
          title: '系统异常，请稍后再试 -1005',
          needCheckSwitchPrePay: true
        });
      }
    }).excute();
  };

  // 提交支付获取签名，并拉起微信分
  const submitAndInvoke = ()=>{
    shouldInvoke = true
    wxR.showLoading({
      title: '支付提交中.'
    })
    submitPay()
  }

  // 唤起微信支付分
  const toInvokeWxScore = ({
    success = () => {}
  }={}) => {
    // 需确认，调用确认
    if (isWxScoreConfirmChannel) {
      wx.openBusinessView({
        businessType: 'wxpayScoreUse',
        extraData: getExtraData(),
        success: () => {
          sendUbt({
            dd: 'openBusinessView_wxpayScoreUse_success'
          });
          success();
        },
        fail: (e) => {
          sendUbt({
            dd: 'openBusinessView_wxpayScoreUse_fail'
          });
          eBack({
            rc: rcMap.failOpen,
            needCheckSwitchPrePay: true
          });
          wxR.showToast({
            title: '授权微信分失败',
            icon: 'none'
          });
          reportErrorLog({
            errorType: '31203',
            errorMessage: '唤起需确认失败',
            extendInfo: e
          });
        },
        complete: () => {
          sendUbt({
            dd: 'openBusinessView_wxpayScoreUse_complete'
          });
        }
      });
    } else {
      /**
       * 免确认、需授权
       * 去授权
       * 查询2301
       * 查询授权成功继续调用303
       */
      // 授权
      wx.openBusinessView({
        businessType: 'wxpayScoreEnable',
        extraData: getExtraData(),
        success: () => {
          // 查询 2301
          sendUbt({
            dd: 'openBusinessView_wxpayScoreUse_success'
          });
          success();
        },
        fail: (e) => {
          wxR.showToast({
            title: '授权微信分失败',
            icon: 'none'
          });
          if (/cancel/.test(e.errMsg)) {
            reportErrorLog({
              errorType: '31207',
              errorMessage: '免确认，用户取消',
              extendInfo: e
            });
          } else if (/not supported/.test(e.errMsg)) {
            reportErrorLog({
              errorType: '31208',
              errorMessage: '免确认，不支持微信支付分',
              extendInfo: e
            });
            wxR.showToast({
              title: '该客户端暂不支持微信支付分',
              icon: 'none'
            });
          } else {
            reportErrorLog({
              errorType: '31205',
              errorMessage: '唤起免确认失败',
              extendInfo: e
            });
          }
        },
      });
    }
  };

  // 需确认模式下，确认成功返回
  // 查询2101
  const getScoreConfrimResult = async () => {
    const dataParam = {
      payToken: payData.payToken,
      payNo: res303.payNo,
      payRefNo: wxscoreStore.getAttr('nonce303'),
    };
    sendUbt({
      a: 'getScoreConfrimResult',
      b: '5021',
      dd: '需确认查询结果-开始',
      dataParam
    });
    const {
      h5plat
    } = getParam() || '';
    const requestExtend = await getRequestExtend(payOptions.cashierUrl);
    payResModel({
      data: dataParam,
      h5plat,
      requestHead: {
        extend: requestExtend,
        payScence: '4'
      },
      context: requestContext,
      success: (res) => {
        wxR.hideLoading();
        sendUbt({
          a: 'payResModel',
          b: '5022',
          dd: '需确认查询结果-结束',
          res
        });
        const code = res.head.code;
        if (code === 100000) {
          sBack();
        } else if (code === 1 && res.directPayButtons) {
          // code为1， 检查是否有转预付配置
          doSwitchPrePay({
            rc: rcMap.toPrePay,
            title: res.head.message || '无法发起授权，试试在线支付吧',
            directPayButtons: res.directPayButtons
          });
        } else {
          reportErrorLog({
            errorType: '31201',
            errorMessage: '2101 需确认查询结果：未确认'
          });
          wxR.showToast({
            title: res.head.message || '查询失败',
            icon: 'none'
          });
          // eBack({
          //  title: res.head.message || '微信支付分授权未成功'
          // })
        }
      },
      fail() {
        wxR.showModal({
          title: '授权查询失败',
          confirmText: '确认',
          success() {
            // sendUbt
          }
        });
      }
    }).excute();
  };

  // 免确认模式下，确认成功返回
  // 查询2301, 成功后请求303
  // 失败则退出
  const GetHoldResult = async () => {
    const dataParam = {
      payToken: payData.payToken,
      paymentWayToken: payItem.paymentWayToken,
      routerWayId: payItem.routerWayId
    };
    sendUbt({
      a: 'GetHoldResult',
      b: '5020',
      dd: '免确认查询结果-开始',
      dataParam
    });
    const {
      h5plat
    } = getParam() || '';
    const requestExtend = await getRequestExtend(payOptions.cashierUrl);
    queryThirdPayStatus({
      data: dataParam,
      h5plat,
      requestHead: {
        extend: requestExtend,
        payScence: '4'
      },
      context: requestContext,
      success(res) {
        sendUbt({
          a: 'queryThirdPayStatus',
          b: '5023',
          dd: '免确认查询结果-结束',
          res
        });
        if (res.head.code == 100000 && res.thirdPayStatus === 1) {
          sendUbt({
            a: 'queryThirdPayStatus',
            b: '5023',
            dd: '免确认查询结果-授权成功'
          });
          // 请求303
          submitPay();
        } else {
          wxR.showToast({
            title: res.head.message || '微信支付分授权未成功',
            icon: 'none'
          });
          sendUbt({
            a: 'queryThirdPayStatus',
            b: '5024',
            dd: '免确认查询结果-授权失败'
          });
        }
      },
      fail() {
        wxR.showToast({
          title: '微信支付分授权查询失败',
          icon: 'none'
        });
        sendUbt({
          a: 'queryThirdPayStatus',
          b: '5025',
          dd: '微信支付分授权查询失败'
        });
        eBack({
          rc: rcMap.fail,
          needCheckSwitchPrePay: true
        });
      }
    }).excute();
  };

  export default {
    init,
    initH5,
    toInvokeWxScore,
    GetHoldResult,
    getScoreConfrimResult,
    eBack,
    sBack,
    submitAndInvoke,
  };

  // 获取微信分签名信息 包括需确认和免确认
  function getExtraData() {
    let result;
    res303.thirdPartyInfo = res303.thirdPartyInfo || {};
    try {
      // 免确认
      result = JSON.parse(res303.thirdPartyInfo.sig || '{}');
    } catch (error) {
      // 需确认
      result = Util.queryToParam(res303.thirdPartyInfo.sig || '');
    }
    return result;
  }