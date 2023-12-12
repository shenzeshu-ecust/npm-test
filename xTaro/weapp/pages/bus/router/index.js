// pages/bus/router/index.js

var loadTimer = null;

global.appStartTime = new Date().getTime();

// pages/bus/router/index.js
import {
    cwx,
    CPage,
    BusRouter,
    Pservice,
    URLUtil,
    terminalBooking,
    traceStep,
} from '../index.js';
const { stepTrace, BUS_PAY_STEP, point } = traceStep;

var timer = null;
var renderTimer = null;

CPage({
    pageId: '10320677779',
    data: {
        origin: false,
        showTraceStep: false,
        traceSteps: [],
    },
    onReady: function (options) {
        cwx.mkt.getUnion(
            function (unionData) {
                this.unionData = unionData;
            }.bind(this)
        );
    },
    onUnload: function () {
        this.routerTimer && clearTimeout(this.routerTimer);
        timer && clearTimeout(timer);
        renderTimer && clearTimeout(renderTimer);
        this.didUnload = true;
        this.redirectTimer && clearTimeout(this.redirectTimer);

        cwx.Observer.removeObserverForKey(
            'o_bus_step_trace_print',
            this.observerStepTrace
        );
    },

    toDefaultPage() {
        this.clearRedirectTimer();
        stepTrace({
            step: BUS_PAY_STEP.beforeJump,
        });
        BusRouter.redirectTo('index', { bShow: true });
        stepTrace({
            step: BUS_PAY_STEP.end,
        });
    },
    /**
     * 跳转到目标页
     */
    goTargetUrl(url, params = {}) {
        stepTrace({
            step: BUS_PAY_STEP.beforeJump,
        });
        this.clearRedirectTimer();
        let urlComponent = URLUtil.parseURLParam(url);
        let targetUrl = BusRouter.map(url, params);
        if (targetUrl.indexOf('pages/home/homepage') !== -1) {
            //针对首页
            cwx.reLaunch({ url: '/' + targetUrl.trim() });
        } else if (
            targetUrl.includes('pages/you/destination/destination') ||
            targetUrl.includes('pages/you/lvpaiHome/lvpaiHome') ||
            targetUrl.includes('pages/schedule/index/index') ||
            targetUrl.includes('pages/myctrip/index/index')
        ) {
            //针对tab切换页，手动写入业绩
            cwx.switchTab({ url: targetUrl.trim() });
        } else if (targetUrl) {
            stepTrace({
                step: BUS_PAY_STEP.beforeLogin,
            });
            BusRouter.checkLoginWithNonmember(
                urlComponent.nonMember ? 1 : 0
            ).then(({ isLogin }) => {
                stepTrace({
                    step: BUS_PAY_STEP.afterLogin,
                });
                // anyway, check the inRouterCallback
                this.inRouterCallback && this.inRouterCallback();
                this.stopCallbackTimer();
                cwx.redirectTo({ url: targetUrl.trim() });
            });
        } else {
            this.toDefaultPage();
        }
        stepTrace({
            step: BUS_PAY_STEP.end,
        });
    },

    onShow: function () {
        if (this.noCallbackDisplayCount > 0 && this.inRouterCallback) {
            this.routerTimer && clearTimeout(this.routerTimer);
            if (this.noCallbackDisplayCount < 4) {
                this.routerTimer = setTimeout(() => {
                    stepTrace({
                        step: BUS_PAY_STEP.beforeRetryLogin,
                        pageId: this.pageId,
                    });
                    BusRouter.checkLoginWithNonmember(this.nonMember).then(
                        ({ isLogin }) => {
                            stepTrace({
                                step: BUS_PAY_STEP.afterRetryLogin,
                                pageId: this.pageId,
                            });
                            // anyway, check the inRouterCallback
                            this.inRouterCallback && this.inRouterCallback();
                            this.stopCallbackTimer();
                        }
                    );
                }, 3000);
            }
        }
        this.noCallbackDisplayCount++;
        if (this.inRouterCallback && this.noCallbackDisplayCount > 2) {
            this.stopCallbackTimer();
            this.showToast({
                message: '登录失败',
                icon: 'none',
            });
            stepTrace({
                step: BUS_PAY_STEP.unLogin,
                pageId: this.pageId,
            });
        }
    },
    stopCallbackTimer() {
        this.routerTimer && clearTimeout(this.routerTimer);
        this.inRouterCallback = null;
    },

    clearRedirectTimer() {
        this.redirectTimer && clearTimeout(this.redirectTimer);
    },

    setupRedirectToHome() {
        this.clearRedirectTimer();
        this.redirectTimer = setTimeout(() => {
            this.toDefaultPage();
        }, 5000);
    },

    observerStepTrace: function (stepInfo) {
        try {
            if (stepInfo.step === BUS_PAY_STEP.jsError) {
                this.setData({
                    showError: true,
                    errInfo: stepInfo.errorInfo,
                    clientID: cwx.clientID,
                });
                if (stepInfo.inPromise === true) {
                    this.setupRedirectToHome();
                }
            }
            console.log(`${stepInfo.step}-------, ${JSON.stringify(stepInfo)}`);
        } catch (error) {}
    },

    onLoad: function (options) {
        cwx.Observer.addObserverForKeyOnly(
            'o_bus_step_trace_print',
            this.observerStepTrace
        );

        console.log('options ---', options);
        if (options.isDebug) {
            this.setData({
                isDebug: options.isDebug,
            });
            return;
        }

        this.noCallbackDisplayCount = 0;
        stepTrace({
            step: BUS_PAY_STEP.pageLoad,
            pageId: this.pageId,
        });
        if (!options.q && !options.scene) {
            console.log('no q ---', options);
            this.toDefaultPage();
        } else {
            // 3秒没有跳转自动到首页。避免白屏卡住。
            timer = setTimeout(() => {
                this.hideLoading();
                this.toDefaultPage();
            }, 10000);

            renderTimer = setTimeout(() => {
                this.renderDefault();
            }, 5000);

            if (options.scene) {
                this.getSceneConfig(options.scene);
                clearTimeout(timer);
                clearTimeout(renderTimer);
            } else {
                let url = decodeURIComponent(options.q);
                console.log(url);
                if (
                    options.origin &&
                    options.origin !== 'false' &&
                    options.origin !== '0'
                ) {
                    this.goTargetUrl(url);
                    clearTimeout(timer);
                    clearTimeout(renderTimer);
                    return;
                }
                let urlComponent = URLUtil.parseURLParam(url);
                let nonMember = parseInt(urlComponent.nonMember, 10) === 1;
                this.nonMember = nonMember; //保存一下这个这个值
                if (
                    url.indexOf('webapp/bus/appbus/mbook') >= 0 ||
                    url.indexOf('/webapp/bus/iot/mbook') >= 0 ||
                    url.indexOf('/webapp/newbus/iot/mbook') >= 0
                ) {
                    // the last version;
                    stepTrace({
                        step: BUS_PAY_STEP.getParams,
                        params: urlComponent,
                    });
                    point({
                        pointName: 'getParams',
                        result: 1,
                        ext: '正在解析路径',
                        orderNumber: urlComponent.id || '',
                    });
                    clearTimeout(timer);
                    clearTimeout(renderTimer);
                    const callBack = () => {
                        this.goTargetUrl('obook', {
                            ...urlComponent,
                            nonMember,
                            bShow: true,
                        });
                    };
                    this.inRouterCallback = callBack;
                    stepTrace({
                        step: BUS_PAY_STEP.beforeLogin,
                        pageId: this.pageId,
                    });
                    point({
                        pointName: 'beforeLogin',
                        result: 1,
                        ext: '登录请求前',
                        orderNumber: urlComponent.id || '',
                    });
                    BusRouter.checkLoginWithNonmember(nonMember).then(
                        ({ isLogin }) => {
                            if (isLogin) {
                                stepTrace({
                                    step: BUS_PAY_STEP.afterLogin,
                                    pageId: this.pageId,
                                });
                                point({
                                    pointName: 'afterLogin',
                                    result: 1,
                                    ext: '登录请求后',
                                    orderNumber: urlComponent.id || '',
                                });
                                this.stopCallbackTimer();
                                callBack();
                            } else {
                                setTimeout(() => {
                                    this.showMsg(
                                        '登录失败, 请重新扫码登录',
                                        () => {
                                            this.toDefaultPage();
                                        }
                                    );
                                }, 0);
                            }
                        }
                    );
                    return;
                } else if (
                    (url.indexOf('/webapp/bus/appbus/opay') >= 0 ||
                        url.indexOf('/webapp/bus/iot/opay') >= 0 ||
                        url.indexOf('/webapp/newbus/iot/opay') >= 0) &&
                    urlComponent.id
                ) {
                    stepTrace({
                        step: BUS_PAY_STEP.getParams,
                        params: urlComponent,
                    });

                    clearTimeout(timer);
                    clearTimeout(renderTimer);
                    const callBack = () => {
                        var terminal = terminalBooking(
                            this,
                            urlComponent.id,
                            urlComponent.ordertype,
                            urlComponent
                        );

                        terminal.updateInfo({
                            Id: urlComponent.id,
                            BookingStatus: 1,
                        });

                        terminal
                            .getOfflinePayParam()
                            .then((order) => {
                                this.setData({
                                    showTraceStep: false,
                                });
                                return terminal.pay(order);
                            })
                            .then((res) => {
                                this.showToast('支付成功', () => {
                                    terminalBooking.toOrder(
                                        res,
                                        true,
                                        urlComponent.ordertype
                                    );
                                });
                            })
                            .catch((err) => {
                                var message = '支付失败，请重新扫码';
                                if (err.message) {
                                    message = err.message;
                                } else {
                                    if (
                                        Object.hasOwnProperty.call(err, 'type')
                                    ) {
                                        message =
                                            err.type == 0
                                                ? '用户取消支付'
                                                : '支付失败';
                                    }
                                }
                                setTimeout(() => {
                                    this.showMsg(message, () => {
                                        if (
                                            err.orderNumber &&
                                            ('' + err.orderNumber).length > 10
                                        ) {
                                            terminalBooking.toOrder(
                                                err,
                                                false,
                                                urlComponent.ordertype
                                            );
                                        } else {
                                            this.toDefaultPage();
                                        }
                                    });
                                }, 0);
                                try {
                                    stepTrace({
                                        step: BUS_PAY_STEP.error,
                                        errorInfo: JSON.stringify(err),
                                        pageId: this.pageId,
                                    });
                                } catch (e) {}
                            });
                    };
                    this.inRouterCallback = callBack;
                    stepTrace({
                        step: BUS_PAY_STEP.beforeLogin,
                        pageId: this.pageId,
                    });
                    BusRouter.checkLoginWithNonmember(nonMember).then(
                        ({ isLogin }) => {
                            if (isLogin) {
                                stepTrace({
                                    step: BUS_PAY_STEP.afterLogin,
                                    pageId: this.pageId,
                                });
                                this.stopCallbackTimer();
                                callBack();
                            } else {
                                setTimeout(() => {
                                    this.showMsg(
                                        '登录失败, 请重新扫码登录',
                                        () => {
                                            this.toDefaultPage();
                                        }
                                    );
                                }, 0);
                            }
                        }
                    );
                    return;
                } else if (
                    (url.indexOf('/webapp/bus/appbus/obook') >= 0 ||
                        url.indexOf('/webapp/bus/iot/obook') >= 0 ||
                        url.indexOf('/webapp/newbus/iot/obook') >= 0) &&
                    urlComponent.id
                ) {
                    clearTimeout(timer);
                    clearTimeout(renderTimer);
                    stepTrace({
                        step: BUS_PAY_STEP.beforeLogin,
                        pageId: this.pageId,
                    });
                    BusRouter.checkLoginWithNonmember(nonMember).then(() => {
                        stepTrace({
                            step: BUS_PAY_STEP.afterLogin,
                            pageId: this.pageId,
                        });
                        Pservice.getLongUrl({
                            id: urlComponent.id,
                        })
                            .then((res) => {
                                console.log(res);
                                var url = res.url;
                                if (!url) throw res;
                                this.goTargetUrl(url, {
                                    ...urlComponent,
                                    nonMember,
                                    bShow: true,
                                });
                            })
                            .catch(() => {
                                this.toDefaultPage();
                            });
                    });
                    return;
                } else if (
                    (url.indexOf('/webapp/bus/appbus/mpay') >= 0 ||
                        url.indexOf('/webapp/bus/iot/mpay') >= 0 ||
                        url.indexOf('/webapp/newbus/iot/mpay') >= 0) &&
                    urlComponent.id
                ) {
                    clearTimeout(timer);
                    clearTimeout(renderTimer);
                    BusRouter.checkLoginWithNonmember(nonMember).then(
                        ({ isLogin }) => {
                            if (isLogin) {
                                var terminal = terminalBooking(
                                    this,
                                    urlComponent.id
                                );
                                terminal
                                    .start()
                                    .then((order) => terminal.pay(order))
                                    .then((res) => {
                                        setTimeout(() => {
                                            this.showToast('支付成功', () => {
                                                var params = {
                                                    oid: res.orderID,
                                                    showCoupon: 1,
                                                    fromPage: 'booking',
                                                    bShow: true,
                                                };
                                                this.goTargetUrl(
                                                    'orderdetail',
                                                    params
                                                );
                                            });
                                        }, 0);
                                    })
                                    .catch((err) => {
                                        var message = '支付失败，请重新扫码';
                                        if (err.message) {
                                            message = err.message;
                                        } else {
                                            if (
                                                Object.hasOwnProperty.call(
                                                    err,
                                                    'type'
                                                )
                                            ) {
                                                message =
                                                    err.type == 0
                                                        ? '用户取消支付'
                                                        : '支付失败';
                                            }
                                        }
                                        setTimeout(() => {
                                            this.showMsg(message, () => {
                                                if (err.orderID) {
                                                    var params = {
                                                        oid: err.orderID,
                                                        showCoupon: 1,
                                                        bShow: true,
                                                    };
                                                    this.goTargetUrl(
                                                        'orderdetail',
                                                        params
                                                    );
                                                } else {
                                                    this.toDefaultPage();
                                                }
                                            });
                                        }, 0);
                                    });
                            } else {
                                setTimeout(() => {
                                    this.showMsg(
                                        '登录失败, 请重新扫码登录',
                                        () => {
                                            this.toDefaultPage();
                                        }
                                    );
                                }, 0);
                            }
                        }
                    );
                    return;
                } else if (
                    (url.indexOf('/webapp/bus/appbus/mcoupon') >= 0 ||
                        url.indexOf('/webapp/bus/iot/mcoupon') >= 0 ||
                        url.indexOf('/webapp/newbus/iot/mcoupon') >= 0) &&
                    urlComponent.id
                ) {
                    clearTimeout(timer);
                    clearTimeout(renderTimer);
                    BusRouter.checkLoginWithNonmember(nonMember).then(
                        ({ isLogin }) => {
                            if (isLogin) {
                                this.goTargetUrl('index', {
                                    fromPage: 'mcoupon',
                                    sendCouponParam: urlComponent,
                                });
                            } else {
                                setTimeout(() => {
                                    this.showMsg(
                                        '登录失败, 请重新扫码登录',
                                        () => {
                                            this.toDefaultPage();
                                        }
                                    );
                                }, 0);
                            }
                        }
                    );
                    return;
                } else if (
                    url.indexOf('/webapp/bus/appbus/spay') >= 0 ||
                    url.indexOf('/webapp/bus/iot/spay') >= 0 ||
                    url.indexOf('/webapp/newbus/iot/spay') >= 0
                ) {
                    clearTimeout(timer);
                    clearTimeout(renderTimer);
                    this.goTargetUrl('spay', { ...urlComponent, bShow: true });
                    return;
                }
                console.log('start get url ---', options);
                this.showLoading('...请稍后');
                Pservice.getLongUrlTrans(
                    { url: url },
                    (data) => {
                        clearTimeout(timer);
                        clearTimeout(renderTimer);
                        this.hideLoading();
                        if (data.code == 1 && data.return) {
                            let path = data.return;
                            if (path.indexOf('http') === 0) {
                                path = `/cwx/component/cwebview/cwebview?data={"url":"${encodeURIComponent(
                                    data.return
                                )}","needLogin":false}`;
                                this.goTargetUrl(path);
                            } else {
                                this.goTargetUrl(path);
                            }
                            console.log('options ---', data.return);
                        } else {
                            console.log('error ---', data.return);
                            this.toDefaultPage();
                        }
                    },
                    (err) => {
                        clearTimeout(timer);
                        clearTimeout(renderTimer);
                        this.hideLoading();
                        this.toDefaultPage();
                    },
                    self
                );
            }
        }
    },

    getSceneConfig(optionScene) {
        const params = {
            appid: cwx.appId,
            scene: optionScene,
            path: this.route,
            exInfo: null,
        };

        stepTrace({
            step: BUS_PAY_STEP.getParams,
            params: params,
        });

        stepTrace({
            step: BUS_PAY_STEP.beforeFetchData,
            apiName: 'exchangeAppPath',
        });
        Pservice.exchangeAppPath(params)
            .then((res) => {
                // 这里其实不处理
                throw res;
            })
            .catch((res) => {
                if (
                    res &&
                    res.ResponseStatus &&
                    res.ResponseStatus.Ack == 'Success'
                ) {
                    if (parseInt(res.errcode, 10) === 0) {
                        this.goTargetUrl(res.fullpath);
                        stepTrace({
                            step: BUS_PAY_STEP.afterFetchData,
                            apiName: 'exchangeAppPath',
                            status: 'success',
                        });
                    } else {
                        stepTrace({
                            step: BUS_PAY_STEP.afterFetchData,
                            apiName: 'exchangeAppPath',
                            status: 'error',
                        });
                        this.toDefaultPage();
                    }
                } else {
                    stepTrace({
                        step: BUS_PAY_STEP.afterFetchData,
                        apiName: 'exchangeAppPath',
                        status: 'error',
                    });
                    this.toDefaultPage();
                }
            });
    },

    renderDefault: function () {
        this.setData({
            showDefaultElement: true,
        });
    },

    onTest: function (e) {
        var tetsID = e.detail.value;

        BusRouter.navigateTo('router', {
            q: encodeURIComponent(tetsID),
            origin: this.data.origin,
        });
    },
    changeType: function (e) {
        this.setData({
            origin: e.detail.value,
        });
    },
});
