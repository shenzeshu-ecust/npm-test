import {
    cwx,
    CPage,
    __global
} from "../../../../cwx/cwx.js";
const UTILS = require("../../common/utils.js");

CPage({
    pageId: "10650087444",
    checkPerformance: true,
    shareInfo: {},
    data: {
        activityid: "",

        bgimgUrl: "",
        chatGroupUrl: "", // 企微加群组件url
        entryid: "",
        cityid: null,
        time: "",
        contentTop: 0,
        showMask: false, // 遮罩显示控制
        maskType: "local", // 列表显示local还是activityType
        maskSelectList: [], // 选择用列表内容

        Corpwechatentrylocation: [], // 定位信息
        Corpwechatentrysearch: [], // 层级关系
        CorpwechatentryOtherText: {}, // 一些其他的文案信息

        typeList: [], // type列表

        isrepeat: 1, // 检查
        type: "", // 选中的type
        local: "", // 选中的local
        activityType: "", // 选中的activityType
        typeText: "", // type对应的文案
        chatGroupType: "", // 企微入口类型， qrCode  miniQrCode
        pageOptions: null, // 页面的options
        chatId: "",

        welcomeTitle: "梁小章邀请你加入",
    },
    onLoad(options) {
        // 参数赋值
        const list = [
            "entryid",
            "cityid",
            "time",
            "typeid",
            "activityid",
            "isrepeat",
        ];
        const tempObj = {};
        Object.keys(options).forEach((item) => {
            if (list.includes(item.toLowerCase())) {
                tempObj[item.toLowerCase()] = options[item];
            }
        });
        console.log("当前的url option配置", tempObj);
        this.setData(tempObj);
        // 获取活动配置
        this.getActivityConfig();
        this.logDevUbt("load", options);
    },
    handleCustomParams(options) {
        const canShare = options.canShare;
        if (canShare === true) {
            if (options.shareImgUrl) {
                this.shareInfo.imageUrl = options.shareImgUrl;
            }
            if (options.shareTitle) {
                this.shareInfo.title = options.shareTitle;
            }
        } else {
            wx.hideShareMenu();
        }

        if (options.welcomeTitle) {
            this.setData({
                welcomeTitle: options.welcomeTitle,
            });
        }
    },
    // 点击tab
    changeTab(e) {
        // 切换typetab的时候 默认选中type下第一类
        const type = typeof e === "string" ? e : e.currentTarget.dataset.typeid;

        // 和当前type 相同return 否则会重置local等信息
        if (type === this.data.type) return;

        const target = this.data.Corpwechatentrysearch.find(
            (item) => item.type === type
        );

        this.setData({
            type,
            typeText: this.data.CorpwechatentryOtherText.typeText.find(
                (item) => item.type === type
            )?.typeGroupText,
            local: target.local,
            activityType: target.activityType,
        });

        this.getEnrtyId();
    },
    // 点击local下拉
    changeLocal(e) {
        // 获取当前tab下的local list
        let localList = [];
        this.data.Corpwechatentrysearch.forEach((item) => {
            if (item.type === this.data.type && localList.indexOf(item.local) < 0) {
                localList.push(item.local);
            }
        });

        this.setData({
            showMask: true,
            maskSelectList: localList,
            maskType: "local",
        });
    },
    // 点击ActivityType下拉
    changeActivityType(e) {
        let activityTypeList = [];
        this.data.Corpwechatentrysearch.forEach((item) => {
            if (
                item.type === this.data.type &&
                item.local === this.data.local &&
                activityTypeList.indexOf(item.activityType) < 0
            ) {
                activityTypeList.push(item.activityType);
            }
        });

        this.setData({
            showMask: true,
            maskSelectList: activityTypeList,
            maskType: "activityType",
        });
    },
    // 关闭mask
    closeMask() {
        this.setData({
            showMask: false,
        });
    },
    // 选择项处理
    handleSelectChange(e) {
        const val = e.currentTarget.dataset.val;

        // local情况下 需要重置一下activityType
        if (this.data.maskType === "local") {
            if (val === this.data.local) {
                this.setData({
                    showMask: false,
                });
                return;
            }

            const target = this.data.Corpwechatentrysearch.find(
                (item) => item.type === this.data.type && item.local === val
            );

            this.setData({
                local: val,
                showMask: false,
                activityType: target.activityType,
            });
        } else {
            if (val === this.data.activityType) {
                this.setData({
                    showMask: false,
                });
                return;
            }
            this.setData({
                activityType: val,
                showMask: false,
            });
        }

        this.getEnrtyId();
    },

    // 获取位置信息id
    getCityInfo(successCb, failCb) {
        const cachedCityInfo = cwx.locate.getCachedCtripCity();
        if (cachedCityInfo && cachedCityInfo.data) {
            console.log("==========已授权的缓存数据=========");
            successCb &&
                successCb({
                    cityId: cachedCityInfo.data.CityEntities[0].CityID ||
                        cachedCityInfo.data.CityEntities[0].cityID,
                    provinceId: cachedCityInfo.data.ctripPOIInfo.provinceId,
                });
        } else {
            cwx.locate.startGetCtripCity((res) => {
                if (res && res.data) {
                    successCb &&
                        successCb({
                            cityId: res.data.CityEntities[0].CityID ||
                                res.data.CityEntities[0].cityID,
                            provinceId: res.data.ctripPOIInfo.provinceId,
                        });
                } else {
                    failCb && failCb();
                }
            }, "marketluckyactivity-lbs");
        }
    },
    // 统一获取entryid
    getEnrtyId() {
        const {
            type,
            local,
            activityType
        } = this.data;
        console.log(
            "每次需要置空一下 否则群信息会缓存上一次的",
            type,
            local,
            activityType
        );
        this.setData({
            chatGroupUrl: "",
        });
        const target = this.data.Corpwechatentrysearch.find(
            (item) =>
            item.type === this.data.type &&
            item.local === this.data.local &&
            item.activityType === this.data.activityType
        );
        console.log("当前getEnrtyId>>>>", target);
        if (!target) return;

        this.setData({
            entryid: target?.entryId,
        });

        this.getRegionEntryGroupConf();
    },
    // 获取引流url
    getRegionEntryGroupConf() {
        const {
            isrepeat
        } = this.data;
        console.log("请求url>>>", this.data.entryid, this.data.time);
        if (!this.data.entryid) return;
        const params = {
            entryId: this.data.entryid,
            time: this.data.time,
            isRepeat: isrepeat * 1,
            unionId: cwx.cwx_mkt.unionid || "",
        };

        cwx.showLoading({
            title: "加载中~",
            mask: true,
        });

        this.logTrace("getRegionEntryGroupConf request", params || {});
        UTILS.fetch("13218", "getRegionEntryGroupConf", params).then((res) => {
            this.logTrace("getRegionEntryGroupConf response", res || {});
            if (res && !res.errcode) {
                console.log("getRegionEntryGroupConf 返回值", res);
                if (res.miniQrCode) {
                    this.setData({
                        chatGroupUrl: res.miniQrCode,
                        chatGroupType: "miniQrCode",
                        chatId: res.chatId || "",
                    });
                } else {
                    this.setData({
                        chatGroupUrl: res.qrCode,
                        chatGroupType: "qrCode",
                        chatId: res.chatId || "",
                    });
                }
            }
            cwx.hideLoading();
        });
    },
    // 获取活动配置
    getActivityConfig() {
        console.log("此时的页面 entryid ：", this.data.entryid);
        UTILS.fetch("18083", "getActivityConfig", {
            activityId: this.data.activityid,
        }).then((res) => {
            this.logTrace("getActivityConfig response", res || {});
            if (res && !res.errcode) {
                console.log("活动配置>>>", res.activityCustomfields);

                const Corpwechatentrylocation = res.activityCustomfields
                    .Corpwechatentrylocation ?
                    JSON.parse(res.activityCustomfields.Corpwechatentrylocation) : [];

                const Corpwechatentrysearch = res.activityCustomfields
                    .Corpwechatentrysearch ?
                    JSON.parse(res.activityCustomfields.Corpwechatentrysearch) : [];

                const CorpwechatentryOtherText = res.activityCustomfields
                    .CorpwechatentryOtherText ?
                    JSON.parse(res.activityCustomfields.CorpwechatentryOtherText) : {};

                this.handleCustomParams(CorpwechatentryOtherText);


                this.setData({
                    Corpwechatentrylocation,
                    Corpwechatentrysearch,
                    CorpwechatentryOtherText: CorpwechatentryOtherText,
                    bgimgUrl: CorpwechatentryOtherText.bgimgUrl,
                    contentTop: CorpwechatentryOtherText.contentTop,
                });

                // 设置type列表渲染用
                const typeList = [];
                Corpwechatentrysearch.forEach((item) => {
                    if (typeList.indexOf(item.type) < 0) {
                        typeList.push(item.type);
                    }
                });

                this.setData({
                    typeList,
                });

                // 根据参数定位逻辑
                this.handleRenderByParam();

                this.getEnrtyId();
            }
        });
    },
    // 初始化根据链接传参定位逻辑
    handleRenderByParam() {
        // entryid 优先级最高
        if (this.data.entryid) {
            console.log("有entryid>>>");
            const target = this.data.Corpwechatentrysearch.find(
                (item) => item.entryId === this.data.entryid
            );

            if (!target) {
                return;
            }

            this.setData({
                type: target.type,
                typeText: this.data.CorpwechatentryOtherText.typeText.find(
                    (item) => item.type === target.type
                )?.typeGroupText,
                local: target.local,
                activityType: target.activityType,
            });
        } else if (this.data.typeid) {
            if (this.data.cityid) {
                console.log("有typeid和cityid>>>");
                // cityid结合typeid定位local和type  再反拿actype
                const locationInfo = this.data.Corpwechatentrylocation.find((item) => {
                    return (
                        item.typeid === this.data.typeid && item.cityId == this.data.cityid
                    );
                });

                if (!locationInfo) {
                    console.log("没有获取到locationInfo");
                    // typeid+cityid 如果拿不到定位区域 就直接拿typeid下第一个
                    const target = this.data.Corpwechatentrysearch.find(
                        (item) => item.typeid === this.data.typeid
                    );

                    if (!target) {
                        return;
                    }

                    this.setData({
                        type: target.type,
                        typeText: this.data.CorpwechatentryOtherText.typeText.find(
                            (item) => item.type === target.type
                        )?.typeGroupText,
                        local: target.local,
                        activityType: target.activityType,
                    });

                    // 定位是异步 需要再查找一次entryid
                    this.getEnrtyId();
                    return;
                }

                console.log("获取到locationInfo>>", locationInfo);
                // typeid+cityid 能拿到定位区域 正常查找
                const target = this.data.Corpwechatentrysearch.find(
                    (item) =>
                    item.type === locationInfo.type && item.local === locationInfo.local
                );

                if (!target) {
                    return;
                }

                this.setData({
                    type: target.type,
                    typeText: this.data.CorpwechatentryOtherText.typeText.find(
                        (item) => item.type === target.type
                    )?.typeGroupText,
                    local: target.local,
                    activityType: target.activityType,
                });

                // 定位是异步 需要再查找一次entryid
                this.getEnrtyId();
            } else {
                console.log("有typeid无cityid,需定位>>>");
                // typeid优先级>cityid
                this.getCityInfo(
                    (res) => {
                        console.log("位置信息成功获取cb>>>", res);
                        // cityid结合typeid定位local和type  再反拿actype
                        const locationInfo = this.data.Corpwechatentrylocation.find(
                            (item) => {
                                return (
                                    item.typeid === this.data.typeid &&
                                    (item.cityId == res.cityId ||
                                        item.provinceId == res.provinceId)
                                );
                            }
                        );

                        if (!locationInfo) {
                            console.log("没有获取到locationInfo");
                            // typeid+cityid 如果拿不到定位区域 就直接拿typeid下第一个
                            const target = this.data.Corpwechatentrysearch.find(
                                (item) => item.typeid === this.data.typeid
                            );

                            if (!target) {
                                return;
                            }

                            this.setData({
                                type: target.type,
                                typeText: this.data.CorpwechatentryOtherText.typeText.find(
                                    (item) => item.type === target.type
                                )?.typeGroupText,
                                local: target.local,
                                activityType: target.activityType,
                            });

                            // 定位是异步 需要再查找一次entryid
                            this.getEnrtyId();
                            return;
                        }

                        console.log("获取到locationInfo>>", locationInfo);
                        // typeid+cityid 能拿到定位区域 正常查找
                        const target = this.data.Corpwechatentrysearch.find(
                            (item) =>
                            item.type === locationInfo.type &&
                            item.local === locationInfo.local
                        );

                        if (!target) {
                            return;
                        }

                        this.setData({
                            type: target.type,
                            typeText: this.data.CorpwechatentryOtherText.typeText.find(
                                (item) => item.type === target.type
                            )?.typeGroupText,
                            local: target.local,
                            activityType: target.activityType,
                        });

                        // 定位是异步 需要再查找一次entryid
                        this.getEnrtyId();
                    },
                    () => {
                        console.log("位置信息获取失败cb>>>");
                        // 不给定位的时候 拿typeid下第一个就行
                        const target = this.data.Corpwechatentrysearch.find(
                            (item) => item.typeid === this.data.typeid
                        );

                        if (!target) {
                            return;
                        }

                        this.setData({
                            type: target.type,
                            typeText: this.data.CorpwechatentryOtherText.typeText.find(
                                (item) => item.type === target.type
                            )?.typeGroupText,
                            local: target.local,
                            activityType: target.activityType,
                        });

                        // 定位是异步 需要再查找一次entryid
                        this.getEnrtyId();
                    }
                );
            }
        } else if (this.data.cityid) {
            console.log("无typeid 有cityid>>>");
            // cityid定位local和type  再反拿actype
            const locationInfo = this.data.Corpwechatentrylocation.find(
                (item) => item.cityId === this.data.cityid
            );
            if (!locationInfo) {
                this.changeTab(this.data.typeList[0]);
                return;
            }
            const target = this.data.Corpwechatentrysearch.find(
                (item) =>
                item.type === locationInfo.type && item.local === locationInfo.local
            );

            if (!target) {
                this.changeTab(this.data.typeList[0]);
                return;
            }

            this.setData({
                type: target.type,
                typeText: this.data.CorpwechatentryOtherText.typeText.find(
                    (item) => item.type === target.type
                )?.typeGroupText,
                local: target.local,
                activityType: target.activityType,
            });
        } else {
            console.log("什么参数都没有>>>");
            // 什么参数都没有 保底 模拟点击第一个tab
            this.changeTab(this.data.typeList[0]);
        }
    },
    startmessage(res) {
        console.log("startmessage", res);
        this.ubtTrace(229006, {
            activityid: this.data.activityid,
            unionid: cwx.cwx_mkt.unionid,
            entryid: this.data.entryid,
            chatid: this.data.chatId || "",
        });
    },
    completemessage(res) {
        console.log("completemessage", res);
        this.logDevUbt("completemessage", {
            ...this.data,
            detail: res.detail,
        });
    },
    logDevUbt(actionName, params) {
        try {
            this.ubtDevTrace(221061, {
                action: actionName,
                ...params,
            });
        } catch (error) {}
    },
    logTrace(actioncode, actionMsg) {
        try {
            const params = {
                keyname: "mkt_2021Activity",
                PlatForm: "miniapp",
                actioncode: actioncode || "",
                actionMsg: actionMsg || "",
                pageId: this.pageId || "",
                openId: cwx.cwx_mkt.openid || "",
                activityName: "tencent",
                activityId: this.data.activityId,
            };
            this.ubtTrace(201002, params);
        } catch (e) {
            console.log("埋点报错", e);
        }
    },
    previewGroupQrcode() {
        wx.previewImage({
            urls: [this.data.chatGroupUrl],
        });
    },
    onShareAppMessage() {
        return {
            title: this.shareInfo.title || "携程旅行",
            imageUrl: this.shareInfo.imageUrl,
        };
    },
    onShareTimeline() {
        return {
            title: this.shareInfo.title || null,
        }
    },
});