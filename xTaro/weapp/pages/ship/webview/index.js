import CWebView from '../../../cwx/component/cwebview/CWebviewBaseClass';
import { CPage, cwx, __global } from '../../../cwx/cwx.js';

const MyWebView = {
    register() {
        let proto = Object.getPrototypeOf(this);
        let protoLink = [proto];
        while ((proto = Object.getPrototypeOf(proto))) {
            protoLink.push(proto);
        }

        let clone = Object.assign({});
        while (protoLink.length) {
            let lastProto = protoLink.pop();
            // Object.assign(this, lastProto);
            clone = Object.assign(clone, lastProto);
        }
        clone = Object.assign(clone, this);
        delete clone.constructor;
        CPage(clone);
    },

    onLoad(options) {
        const mainOptions = this.getH5UrlOptions(options);
        let mergedOptions = Object.assign({}, options, mainOptions);
        super.onLoad(mergedOptions);
    },

    buildLink(options) {
        return options;
    },

    getH5UrlOptions(options) {
        var afterBuildOptions = this.buildLink(options);
        return {
            ...afterBuildOptions,
            needLogin: true,
        };
    },
    navigateToMainMini: function (link) {
        console.log('navigateToMainMini---', link);
        cwx.user.getToken((token) => {
            if (link.indexOf('http') == 0) {
                link = `/cwx/component/cwebview/cwebview?data={"url":"${encodeURIComponent(
                    link
                )}","needLogin":true,"isNavigate":false}`;
            }
            console.log('navigateToMainMini---', link, 'token---', token);
            cwx.navigateToMiniProgram({
                appId: 'wx0e6ed4f51db9d078',
                path: URLUtil.serializeURL(link, {
                    __userToken: token,
                }),
                envVersion: 'release', //develop ,release , trial
                extraData: {
                    auth: cwx.user.auth || '',
                },
                complete() {},
            });
        });
    },
    webPostMessageB(e) {
        if (e.type === 'message') {
            let data = e.detail.data;

            for (let i = 0; i < data.length; i++) {
                if (data[i].type === 'navigateTo') {
                    if (__global.appId === 'wx0e6ed4f51db9d078') {
                        cwx.navigateTo({
                            url: data[i].url,
                        });
                    } else {
                        this.navigateToMainMini(data[i].url);
                    }

                    return;
                }
            }
        }
        this.webPostMessage(e);
    },
};

Object.setPrototypeOf(MyWebView, CWebView.prototype);

export default MyWebView;
