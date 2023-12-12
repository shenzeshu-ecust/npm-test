import { cwx } from "../cwx.js"

export class MiniAppSocketClient {
    constructor(props) {
        this.source = props.source || ""; // 调用方标识
        this.socketKey = props.socketKey || "";
        this.keep = false;
        this.url = props.url || "";
        this.socket = null;
        this.onMessage = props.onMessage;
        this.onOpen = props.onOpen;
        this.onGetKey = props.onGetKey;
        this.onError = props.onError;
        this.onClose = props.onClose;
        this.socketUrl = props.socketUrl || "wss://m.ctrip.com/miniapp/sockets/wss/";
        this.requestUrl = props.requestUrl || "https://m.ctrip.com/miniapp/sockets/createSignatureKey";
        this.type = "miniapp";
        this.retry = 0; // 记录重试的次数
        this.retrying = false;
        this.connectError = false;
        this.messageArr = [];
        this.messagePos = props.pos || 0;
        this.request = props.request || cwx.request;
        this.messageNum = 0;
        this.messageReceived = {};
        this.messageResend = {};
        this._handledMessageIdQueue = [];
        this.eventObj = {};
        // 客户端预校验 source 值, 服务端做二次校验
        if (!this.checkSourceExit()) {
            return;
        }
        this.getSocketsKey().then(() => {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            if (this.socketKey && typeof this.onGetKey === "function") {
                if (this.url) {
                    let d = (this.url.indexOf("?") !== -1) ? "&" : "?";
                    this.url += `${d}minisocketkey=${this.socketKey}`
                }
                this.onGetKey(this.url || this.socketKey);
            }
            this.initSocket();
        }).catch((e) => {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this._flushEvent("onError", {
                status: "1002",
                ...e,
                message: "Get socketKey error."
            });
        });
        this.timer = setTimeout(() => {
            //获取key超时，则不进行socket的链接，因为H5页面等不到这么久打开
            this.connectError = true;
            this._flushEvent("onError", {
                status: "1003",
                message: "get socketKey timeout."
            });
        }, props.timeout || 10 * 1000);
    }

    initSocket() {
        if (this.connectError) {
            return;
        }
        if (!this.socketKey) {
            this._flushEvent("onError", {
                status: "1004",
                errMsg: "no valid socketKey found."
            });
            this.connectError = true;
            return;
        }
        if (this.checkSocketValid()) {
            this._flushMessage();
            return;
        }
        
        // 记录建立过几次连接，会补充后缀: firstTry, retry; 加一起是总的建连次数
        this.sendUbt("connectSocket","", {})
        // console.log("----call connectSocket---");
        //重连时messagePos可能不等于0
        const socketClient = wx.connectSocket({
            url: `${this.socketUrl}?key=${this.socketKey}&type=${this.type}&pos=${this.messagePos}`,
            success: (res) => {
                console.log("socket success:", res)
                // 记录触发微信 success 回调的次数
                this.sendUbt("connectSocket_success", {})
            },
            fail: (e) => {
                console.log("socket fail:", e)
                // 记录触发微信 fail 回调的次数
                this.sendUbt("connectSocket_fail", {
                    errCode: e && e.errno || "",
                    errMsg: e && (e.message || e.errMsg) || ""
                })
            }
        })
        // new WebSocket(this.socketUrl, `${this.socketKey}_${this.type}_${this.messagePos}`);
        socketClient.onOpen(() => {
            console.log("socket open success.");
            
            if (this.retry > 0 && !this.hadConnectedSuccess) {
                this.sendUbt("retryConnectSuccess", {})
            }
            this.hadConnectedSuccess = true;

            // 记录触发 onOpen 的次数
            this.sendUbt("onOpen", {})
        });
        console.log("socketClient: ", socketClient);
        socketClient.onError((e) => {
            console.log("developClient Open Error", e);
            // 记录触发 onError 的次数
            this.sendUbt("onError", {
                errMsg: e && (e.message || e.errMsg) || "",
                connectError: this.connectError,
                serverError: socketClient.serverError,
                clientClose: socketClient.clientClose,
                serverClose: socketClient.serverClose
            })
            if (!this.connectError && !(socketClient.serverError || socketClient.clientClose || socketClient.serverClose)) {
                this.reConnect();
            } else {
                this._flushEvent("onError", {
                    status: "1008",
                    ...e,
                    errMsg: "Socket onError."
                });
            }
        });
        socketClient.onClose((e) => {
            console.log("onClose:", e);
            this.sendUbt("onClose", {
                serverClose: socketClient.serverClose,
                clientClose: socketClient.clientClose,
                connectError: this.connectError,
                serverError: socketClient.serverError,
            })
            if (socketClient.serverClose || socketClient.clientClose) {
                this._flushEvent("onClose", {
                    message: " Socket Close."
                });
            } else if (!this.connectError && !socketClient.serverError) {
                //需要重新链接
                this.reConnect();
            }
        });
        socketClient.onMessage((message) => {
            console.log("message:", message);
            if (typeof message.data === 'string') {
                try {
                    (JSON.parse(message.data) || []).forEach((msg = {}) => {
                        const {type, data, _messageId, _bTime} = msg
                        if (type === "message") {
                            //成功接收一条消息，就将消息位置+1，给重连时使用
                            this.messagePos += 1;
                            if (_bTime) {
                                try {
                                    //记录下接收到h5消息的时间埋点
                                    const page = cwx.getCurrentPage();
                                    cwx.sendUbtByPage.ubtMetric({
                                        name: "mini_socket_h5_message_time",
                                        tag: {
                                            mPos: this.messagePos,
                                            mLength: message.data.length,
                                            h5Url: page && page.loadedUrl || "",
                                            pagePath: page.route,
                                            messageId: _messageId
                                        },
                                        value: new Date().getTime() - _bTime
                                    });
                                } catch (e) {
                                    console.log(e);
                                }
                            }
                            if (data && data._messageId && data.isReceived) {
                                this._flushmessageReceived(data._messageId);
                            } else {
                                if (this._handledMessageIdQueue.includes(_messageId)) {
                                    console.log("This Message Has Already Used.", _messageId);
                                } else if (typeof this.onMessage === "function") {
                                    msg._messageId && this._handledMessageIdQueue.push(_messageId);
                                    this.onMessage(data);
                                }
                            }
                            if (_messageId) {
                                this.send({
                                    isReceived: true,
                                    _messageId: _messageId
                                }, true);
                            }
                        } else if (type === "close") {
                            //主动关闭客户端
                            socketClient.serverClose = true;
                        } else if (type === "error") {
                            socketClient._error = data;
                            socketClient.serverError = true;
                            this.connectError = true;
                            this._flushEvent("onError", {
                                status: "1005",
                                message: msg.data
                            });
                        } else if (type === "open") {
                            this._flushMessage();
                            if (typeof this.onOpen === "function") {
                                this.onOpen();
                                //只执行一次open;
                                this.onOpen = null;
                            }
                        }
                    });
                } catch (e) {
                    console.log(e);
                    this._flushEvent("onError", {
                        status: "1006",
                        message: message.data
                    });
                }
            } else {
                this._flushEvent("onError", {
                    status: "1007",
                    message: message
                });
            }
        });
        this.socket = socketClient;
    }

    _createMessageId() {
        return `${this.type}_${new Date().getTime()}_${this.messageNum++}_${parseInt('' + 100 * Math.random())}`
    }

    reConnect() {
        console.log("socket connected error.");
        if (this.retrying || this.connectError) {
            return;
        }
        this.retrying = true;
        this.retry++;
        if (this.retry > 10) {
            if (typeof this.onError === "function") {
                this.onError({
                    message: "socket connected error."
                });
            }
            this.connectError = true;
            return;
        }
        setTimeout(() => {
            this.retrying = false;
            this.initSocket();
        }, 3 * 1000);
    }

    // 客户端预校验 source 值, 服务端做二次校验
    checkSourceExit () {
        if (this.source) {
            return true;
        }
        this.connectError = true;
        this._flushEvent("onError", {
            status: "1010",
            message: "source is required!"
        });
    }

    getSocketsKey() {
        return new Promise((resolve, reject) => {
            cwx.Observer.addObserverForKey("CIDReady", (clientId) => {
                console.log("clientId:", clientId);
                console.log("openid:", cwx.cwx_mkt.openid);
                this.request({
                    data: {
                        cid: clientId,
                        openId: cwx.cwx_mkt.openid || "",
                        source: this.source // 服务端二次校验，会校验其准确性
                    },
                    url: this.requestUrl,
                    success: (res = {}) => {
                        this.socketKey = res.data && res.data.key || "";
                        if (!this.socketKey) {
                            console.log(res);
                            return reject({
                                status: "1009",
                                message: "Get socketKey failed."
                            });
                        }
                        console.log("this.socketKey:", this.socketKey);
                        resolve(this.socketKey);
                    },
                    fail: (e) => {
                        reject(e);
                    }
                })
            })
        });
    }

    _flushEvent(eventType, event) {
        //异常事件只执行一次
        if (this.eventObj[eventType]) {
            return;
        }
        if (typeof this[eventType] === "function") {
            this.eventObj[eventType] = true;
            this[eventType](event);
        }
    }

    _flushMessage() {
        let msg = null;
        while (msg = this.messageArr.shift()) {
            //如果socket 有效直接发送
            this._send(msg, true);
        }
    }

    _flushmessageReceived(messageId) {
        if (this.messageReceived[messageId]) {
            const {resolve, timer} = this.messageReceived[messageId];
            if (timer) {
                clearTimeout(timer);
            }
            this._ubtSendStatus(messageId, "resolve")
            delete this.messageReceived[messageId];
            resolve();
        }
    }

    _send(msg, isFlush) {
        //此处需要等待socket创建或者重连成功
        if (this.checkSocketValid()) {
            msg = JSON.stringify(msg);
            //如果socket 有效直接发送
            this.socket.send({
                data: msg,
                success: (res) => {
                    console.log("send msg success: ", res);
                },
                fail: (e) => {
                    console.log("send msg fail: ", e);
                }
            });
        } else if (this.connectError) {
            //链接以及重连失败，直接触发错误回调
            this._flushEvent("onError", {
                status: 400,
                message: "client connect error."
            })
        } else {
            //将发送消息保存起来
            if (!isFlush) {
                this.messageArr.push(msg);
            }
        }
    }

    sendUbt (key, data) {
        try {
            cwx.sendUbtByPage.ubtMetric({
                name: `miniapp_minisocket_${key}_${this.retry === 0 ? "firstTry" : "retry"}`,
                tag: {
                    ...data,
                    socketKey: this.socketKey,
                    messagePos: this.messagePos,
                    source: this.source || ""
                },
                value: this.retry
            });
        } catch (error) {
            console.error("sendUbt error:", error);
        }
    }

    _ubtSendStatus(messageId, status) {
        try {
            const msgObj = this.messageReceived[messageId]
            if (msgObj) {
                const {_bTime} = msgObj;
                if(_bTime){
                    //记录下小程序发送消息和获取消息确认状态的埋点
                    const page = cwx.getCurrentPage();
                    cwx.sendUbtByPage.ubtMetric({
                        name: "mini_socket_miniApp_send_status",
                        tag: {
                            h5Url: page && page.loadedUrl || "",
                            pagePath: page.route,
                            messageId,
                            status
                        },
                        value: new Date().getTime() - _bTime
                    });
                }
            }

        } catch (e) {
            console.log(e);
        }
    }

    send(msg, isReceived, messageId) {
        return new Promise((resolve, reject) => {
            let message = {
                type: "message",
                data: msg,
                _bTime: new Date().getTime()
            }
            if (!isReceived) {
                let _messageId = messageId || this._createMessageId();
                let timer = setTimeout(() => {
                    this._ubtSendStatus(_messageId, "reject");
                    delete this.messageReceived[_messageId];
                    console.log("msg._messageId timeout:", _messageId);
                    this.messageResend[_messageId] = msg;
                    reject(_messageId);
                }, 10 * 1000);//10s钟都没收到客户端的反馈信息，当作失败
                this.messageReceived[_messageId] = {
                    resolve,
                    timer,
                    _bTime: new Date().getTime()
                };
                message._messageId = _messageId;
            }
            return this._send(message);
        });
    }

    reSend(_messageId) {
        return new Promise((resolve, reject) => {
            if (!this.messageResend[_messageId]) {
                return reject(`no message with messageId ${_messageId}`);
            }
            this.send(this.messageResend[_messageId], false, _messageId).then(resolve).catch(reject);
        });
    }

    close() {
        // todo, 加个 force 参数，加个埋点
        if (this.checkSocketValid()) {
            this.socket.send(JSON.stringify({
                type: "close"
            }));
            this.socket.clientClose = true;
            this.socket.close();
        } else if (this.socket && this.socket.readyState === 3) {
            this._flushEvent("onClose", {
                message: "Socket already closed."
            });
        }
    }

    checkSocketValid() {
        return this.socket && this.socket.readyState === 1 && !this.socket.clientClose;
    }
}

export default function (options = {}) {
    let socketClient;
    if (options.socketObserverKey) {
        ["onMessage", "onOpen", "onError", "onClose"].forEach(function (event) {
            const oldFn = options[event];
            options[event] = function (args) {
                oldFn && oldFn.apply(null, args);
                cwx.Observer.noti(options.socketObserverKey, {
                    event,
                    args
                });
            }
        })
        cwx.Observer.addObserverForKey(options.socketObserverKey, function (msg = {}) {
          socketClient && socketClient.send(msg);
        });
    }
    socketClient = new MiniAppSocketClient(options);
    return socketClient;
}