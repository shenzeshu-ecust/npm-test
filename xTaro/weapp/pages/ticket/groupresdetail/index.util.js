
import {cwx, _, } from "../common.js";
var ticketmodel = require('../service/ticketmodel.js');
import { __global } from "../../../cwx/cwx.js";

var options = {

    showLoading: function() {
        wx.showLoading({title: '加载中...'});
    },
    hideLoading: function() {
        wx.hideLoading();
    },
    /**
     * 规则说明弹窗
     */
    showDetailAction: function () {
        this.setData({
            showdetail: true,
            details: {
                title: '规则说明',
                rainfos: this.data.rules
            }
        })
    },
    hideDetail: function () {
        this.setData({showdetail: false})
    },
    /**
     * 拼团下 去订单填写页
     */
    goForwardBooking: function(url, data, callback) {
        var page = cwx.getCurrentPage();
        page.navigateTo({
            url: url,
            data: data,
            callback: callback && callback()
        });
    },
    /**
     * 微信登陆
     */
    weChatLogin: function(callback) {
        cwx.user.login({
            callback: function (res) {
                if (res.ReturnCode == 0) {
                    wx.showToast({
                        title:res.Message,
                        icon:"success",
                        duration:1000,
                        complete:function(){
                            setTimeout(function(){
                                wx.hideToast();
                                //执行传入的回调
                                callback && _.isFunction(callback) && callback();
                            },1000)
                        }
                    })
                }
            },
        });
    },
    /**
     * 对字符串中带有[]标识的字符进行特殊处理
     */
    replaceBuyTips: function(str) {
        var arr = [];
        var reg = new RegExp('\\[(.+?)\\]',"g");
        str.replace(reg, ' |$1 ').split(' ').find(function(item, index){
            if(item.indexOf('|') !== -1){
                arr.push({isRed: true, text: item.slice(1)})
            } else {
                arr.push({isRed: false, text: item});
            }
        })
        return arr;
    },
    /**
     * 倒计时处理
     */
    checklastTime: function(totalTime, callback){
        if (totalTime <= 0) return;
        var self = this;
        //设置定时器
        this.intervalTimer = setInterval(function() {
            self.initRemainTime(totalTime);
            if (totalTime <= 0) {
                clearInterval(self.intervalTimer);
                callback && callback();
            }
            totalTime--;
        }, 1000)
    },
    initRemainTime: function(totalTime) {
        // 得到剩余时间
        let remainTime = this.dayTimeArr(totalTime);
        // 倒计时
        this.setData({remainTime: remainTime});
    },
    /**
     * 获取sid aid
     */
    getUnionData: function(callback) {
        this.unionData = {};
    },
    /**
     * 参团 获取团id
     */
    joinGroup: function(data, callback) {
        ticketmodel.JoinGroupPurchaseModel.request({
            data: data,
            success: function(res) {
                if(res && res.groupid) {
                    this.setData({...res});
                }
                callback && callback();
            }.bind(this),
            fail: function(res) {
                if (res.head.errcode !==0 && res.head.errmsg !=="") {
                   wx.showToast({title: res.head.errmsg, icon:'none'});
                }
            }.bind(this)
        })
    },
    /**
     * 获取拼团资源详情
     */
    getPurchaseResource: function(data, callback) {
        ticketmodel.PurchaseResourceModel.request({
            data: data,
            success: function (res) {
                this.setData({...res});
                callback && callback();
            }.bind(this),
        })
    },
    /**
     * 获取拼团详情页数据
     */
    getGroupPurchaseInfo: function(data, callback) {
        ticketmodel.GroupPurchaseInfoModel.request({
            data: data,
            success: function(res){
                this.setData({...res});
                callback && callback(res);
            }.bind(this)
        })
    },
    /**
     * 获取拼团推荐资源
     */
    getGroupPurchaseList: function(data, callback) {
        ticketmodel.PurchaseActivityListModel.request({
            data: data,
            success: function(res){
                this.setData({resList: res});
                callback && callback();
            }.bind(this)
        })
    },
    /**
     * 头图list
     */
    getViewSpotImages: function() {
        let param = {
            pageid: this.pageId,
            id: this.data.spotid,
            imagesizes: ['C_750_330'],
        };
        ticketmodel.ViewSpotImagesModel.request({
            data: param,
            success: function(res) {
                let imageList = [];
                if (res && res.imgs) {
                    if(res.imgs.length > 5) {
                        res.imgs = res.imgs.slice(0, 5);
                    };
                    _.map(res.imgs, (elem) => {
                        _.map(elem.imgsizes, (item) => {
                            if (item.url) {
                                imageList.push(item.url);
                            }
                        })
                    })
                }
                this.setData({imageList});
            }.bind(this)
        })
    },
    /**
     * 获取正在拼团的信息
     */
    getGroupPurchaseIngList: function(data, callback) {
        ticketmodel.GroupPurchaseIngModel.request({
            data: data,
            success: function(res) {
                // 筛选
                var that = this;
                if (res && res.groups) {
                    let groupsArr = _.filter(res.groups, function(item){
                        var lastTime = new Date(item.groupLastTime.replace(/-/g, '/'));
                        var systime = new Date(item.systemDate.replace(/-/g, '/'));
                        var time = (lastTime.getTime() - systime.getTime()) / 1000;
                        return (time > 0) && (item.groupId != that.groupid);
                    });
                    // 取前两个
                    if (groupsArr && groupsArr.length > 2) {
                        groupsArr = groupsArr.slice(0, 2);
                    }
                    this.setData({groups: groupsArr ||[]});
                    callback && callback();
                } else {
                    this.setData({groupList: []});
                    this.clearOtherTimeList();
                }
            }.bind(this)
        })
    },
    /**
     * 获取海报图片
     */
    getGroupPurchaseImage: function(data, callback) {
        ticketmodel.GroupPurchaseImageModel.request({
            data: data,
            success: function(res) {
                if (res && res.imageUrl) {
                    this.setData({sharePic: res.imageUrl});
                    callback && callback();
                } else {
                    wx.hideLoading();
                    wx.showToast({title: '海报生成失败，请重试', icon: 'none'});
                }
            }.bind(this),
            fail: function(res) {
                //console.log('res', res);
                wx.hideLoading();
                wx.showToast({title: '海报生成失败，请重试', icon: 'none'})
            }
        })
    },
    // 生成二维码
    getWxqrCode: function(data, callback) {
        ticketmodel.WxqrCodeModel.request({
            data: data,
            success: function(res) {
                if(res.errcode == 0) {
                    this.setData({qrCode: res.qrUrl, qrPath: res.path});
                    callback && callback();
                }else {
                    wx.hideLoading();
                    wx.showToast({title: '二维码生成失败', icon:'none'});
                }
            }.bind(this),
            fail: function(res) {
                wx.hideLoading();
                wx.showToast({title: '二维码生成失败', icon:'none'});
            }
        })
    },
    // 获取资源详细信息
    getResourceAddInfo: function(data, callback) {
        ticketmodel.GroupAddInfo.request({
            data: data,
            success: function(res) {
                if (res && res.ress && res.ress.length) {
                    this.setData({addInfosData: res.ress[0].rainfos, vendorInfo: res.ress[0].vendorinfo});
                    callback && callback();
                } else {
                  this.setData({ addInfosData: [], vendorInfo: []});
                }
            }.bind(this)
        })
    },
    /**
     * 获取微信用户的昵称和头像信息
     */
    getWXUserInfo(callback) {
        var that = this;

        wx.getUserInfo({
            success: function(res) {
                var userInfo = res.userInfo || {};
                //缓存微信用户信息
                that.setData({
                    wxShareUser: {
                        nickName: userInfo && userInfo.nickName,
                        headImage: userInfo && userInfo.avatarUrl
                    }
                });

                //执行传入的回调
                callback && _.isFunction(callback) && callback();
            },
            fail: function(err) {
                // console.log('微信头像获取失败', err);
                callback &&  _.isFunction(callback) && callback();
            }
        });
    },
    /**
     * 小程序跳转H5
     */
    goRedirect: function() {
        try {
           // var reg = /cwx\/component\/cwebview\/cwebview/gi;
            var reg = /pages\/ticket\/web\/index/gi;
            var delta = this.checkPageDelta(reg);
            if (delta <= 0) {
               this.openWebView('/webapp/ticket/grouplist?popup=close');
            } else {
                wx.navigateBack({
                    delta:  delta - 1
                });
            }
        } catch (error) {
            this.openWebView('/webapp/ticket/grouplist?popup=close');
        }
    },
    openWebView: function(stringUrl, redirect = false) {
        var host = '';
        if (__global.env.toLowerCase() === 'uat') {
            host = 'm.uat.qa.nt.ctripcorp.com'
        } else if (__global.env.toLowerCase() === 'fat') {
            host = 'm.uat.qa.nt.ctripcorp.com';
        }else{
            host = 'm.ctrip.com'; //生产
        }
        // cwx.component.cwebview({
        //     data: {
        //         url: encodeURIComponent('https://'+ host + stringUrl),
        //    }
        // });
        redirect ? cwx.redirectTo({
            url: '/pages/ticket/web/index?data=' + encodeURIComponent('https://'+ host + stringUrl),
            fail: function(e) {
                wx.showToast({title: '跳转失败', icon: 'none'});
            }
        }) :
        cwx.navigateTo({
           url: '/pages/ticket/web/index?data=' + encodeURIComponent('https://'+ host + stringUrl)
        })
    },
    /**
     * 小程序只能记录10个页面的跳转
     */
    checkPageDelta: function(reg) {
        var delta = -1,
            pages = getCurrentPages();
        for (var i = 0; i < pages.length - 1; i++) {
            if (reg.test(pages[i].route)) {
                delta = pages.length - i;
                break;
            }
        }
        return delta;
    },
    copyToClipBoard: function() {
        if (wx.canIUse('setClipboardData')) {
            wx.setClipboardData({
                data: this.data.helper && this.data.helper.wechatcode,
                success: function(res) {
                    wx.getClipboardData({
                        success: function(res) {
                            wx.showToast({
                                title: '复制成功，在“添加好友”时选择粘贴，可直接添加好友',
                                icon: 'none'
                            })
                        }
                    })
                }
            })
        } else {
            wx.showToast({
                title: '亲爱的用户，由于您的微信版本过低，无法使用复制粘贴功能，请尽快前往应用商店更新微信',
                icon: 'none'
            })
        }
    },
     /**
     * 列表倒计时,bb 表示totaltime = (endtime.gettime() - starttime.gettime())/1000
     */
    dayTimeArr: function(bb) {
        var bb = bb;
        const days = Math.floor(bb  / (60 * 60 * 24));
        const hours = Math.floor((bb  - days * (60 * 60 * 24) ) / (60 * 60));
        const minutes = Math.floor((bb  - days * (60 * 60 * 24) - hours * (60 * 60)) / 60);
        const seconds = bb  - days * (60 * 60 * 24) - hours * (60 * 60) - minutes * 60;
        var timeArr = [days, this.addEge(hours), this.addEge(minutes), this.addEge(seconds)];
        if(bb <= 0){
          //timeArr = [0,"00","00","00"];
          timeArr = '';
        }
        return timeArr;
    },
    addEge: function(time){
        return time < 10 ? time = "0" + time :time = time;
    },
    clearTimeList: function() {
        this.ids = this.ids || [];
        this.ids.forEach(function(id){
            clearInterval(id);
        })
    },
    clearOtherTimeList: function() {
        this.groupTimes = this.groupTimes || [];
        this.groupTimes.forEach(function(id){
            clearInterval(id);
        })
    },
    timeHandle: function(endTime, startTime){
        var endtime = new Date(endTime.replace(/-/g, '/'));
        var systime = new Date(startTime.replace(/-/g, '/'));
        return (endtime.getTime() - systime.getTime())/1000;
    },
    fetchOtherGroupList: function() {
        this.getGroupPurchaseIngList({
            pageid: this.pageId,
            groupSettingId: this.groupsettingid || this.data.groupsettingid,
            limit: 3
        }, this.initListTime);
    },
    initListTime: function() {
        const { groups } = this.data;
        let groupList = [];
        groups && groups.length && groups.map(function(data){
            data.totle = this.timeHandle(data.groupLastTime, data.systemDate);
            data.goodsTime = this.dayTimeArr(data.totle);
            groupList.push(data);
        }.bind(this));
        this.setData({groupList: groupList});
        this.handleGroupListTime();
    },
     // 参别人团的倒计时
    handleGroupListTime: function() {
        var self = this;
        var { groupList } = this.data;
        self.groupTimes = groupList && groupList.length && groupList.map(function(value, key){
            var aa = value.totle;
            value.goodsTime = self.dayTimeArr(aa);

            self.setData({groupList:groupList});

            return setInterval(function(){
                aa--;
                var timeArr = self.dayTimeArr(aa);
                value.goodsTime = timeArr;
                self.setData({groupList:groupList});

                if (aa <= 0) {
                    // clearInterval(self.groupTimes[key]);
                    self.clearOtherTimeList();
                    // 刷新数据todo
                    self.fetchOtherGroupList();
                }
            },1000);
        })
    },
    checkProductions: function() {
        const {productions, otherGroupid} = this.data;
        if (!productions) {
            wx.showToast({title:'请选择一个产品', icon: 'none',});
            return;
        }
        this.createGroup(otherGroupid);
    },
    initOtherGropid: function() {
        this.setData({otherGroupid: ''});
    },
    joinOtherGroup: function(e) {
        var otherGroupid = e.currentTarget.dataset.groupid;
        // console.log('othergroup:',groupid)
        // this.getUserInfoAndOperate(groupid);
        this.setData({otherGroupid: otherGroupid});
        this.checkResource(otherGroupid);
    },
    createGroup: function(otherGroupid) {
        var islogin = cwx.user.isLogin();
        if (!islogin) {
            this.weChatLogin(function() {
                this.getUserInfoAndOperate(otherGroupid);
            }.bind(this));
        } else {
            this.getUserInfoAndOperate(otherGroupid);
        }
    },
    getUserInfoAndOperate: function(groupid) {
        var { wxShareUser } = this.data;
         // 头像是否取到
        if (wxShareUser && wxShareUser.nickName) {
            this.handleJump(groupid);
        } else {
            this.getWXUserInfo(function(){ this.handleJump(groupid);}.bind(this));
        }
    },
    // 多资源
    checkResource: function(otherGroupid) {
        const { resources } = this.data;
        if (!_.isEmpty(resources) && resources.length > 1) {
            this.setData({
                showReslist: true,
                modalData: {
                    detail: resources,
                    detailArray: []
                },
                overflowHidden: true
            })
        } else {
           this.createGroup(otherGroupid);
        }
    },
    handleSelect: function(event) {
        const key = event.currentTarget.dataset.key;
        const num = event.currentTarget.dataset.num;
        console.log('key is', key);
        const {productions, spotid, modalData} = this.data;
        if (productions === key) return;
        this.setData({
            productions: key,
            currentItemId: num
        })
        this.getResourceAddInfo({
            pageid: this.pageId,
            resids: [key],
            viewid: spotid
        }, function(){
            this.setData({
              modalData: { ...modalData, detailArray: this.data.addInfosData, vendorInfo: this.data.vendorInfo }
            })
           console.log(this.data.modalData);
        }.bind(this));
    },
    hideResList: function() {
        this.setData({showReslist: false, overflowHidden: false, productions: ''});
    },
    handleGroupresJump: function(groupid, callback) {
        const { buyType, wxShareUser } = this.data;
        var params = {
            pageid: this.pageId,
            groupsettingid:  this.groupsettingid,
            userinfo: {
                wxopenid: cwx.cwx_mkt.openid|| '',
                nickname: wxShareUser && wxShareUser.nickName||'',
                avatarurl: wxShareUser && wxShareUser.headImage||''
            }
        }
        if (groupid) {
            params.groupid = groupid
        } else {
            params.groupid = buyType.grouptype && buyType.grouptype === 'join' ? this.data.groupid : 0;
        }
        console.log('params is:',params);
        this.joinGroup(params, callback);
    },
    handleJump: function(groupid) {
        var { wxShareUser, resid, spotid, funcType, productions } = this.data;
        var url = '../booking/index?tid='+ resid +"&spotid="+ spotid +"&from=group",
        forwardBookAction = function(){
            console.log('url',url)
            this.goForwardBooking(url,{ groupid: this.data.groupid || 0, nickname: wxShareUser && wxShareUser.nickName || '' });
        }.bind(this);
         // 多资源
        if (productions) {
            url = '../booking/index?tid='+ productions +"&spotid="+ spotid +"&from=group";
        }
        if (funcType) {
            this.handleGroupJump(funcType, forwardBookAction);
        } else {
            this.handleGroupresJump(groupid, forwardBookAction);
        }
    },
    getqrCode: function(pageUrl) {
        const {allianceid, sid} = this.unionData;
        var qrCodeParams = {
            "appId": cwx.appId,
            "buType": "ticket",
            "page": "pages/train/unlimitQRCode/unlimitQRCode",
            "path": pageUrl + '&allianceid=' + allianceid + '&sid=' + sid,
            "aid": "586924",
            "sid": "1410765",
            "pathName": "bargainShareQRcode",
            "centerUrl": "",
            "fromId": this.pageId.toString(),
            "needData": false,
            "autoColor": false,
            "lineColor": {
                "r": "0",
                "g": "0",
                "b": "0"
            }
        }
        // 二维码生成
        this.getWxqrCode(qrCodeParams, this.generatorPic);
    },
     /**
     * 生成图片
     */
    generatorPic: function() {
        const {resname, groupusercount, tags, imageurl, price} = this.data;
        let paramTag = [];
        (tags || []).map(function(data){
            paramTag.push(data.name);
        });
        let data = {
            pageid: this.pageId,
            title: resname || '',
            groupUserCount: groupusercount || 0,
            price: price || 0,
            tags: paramTag || [],
            imgUrl: imageurl || '',
            weChatCode: this.data.qrCode || ''
        },
        callback = function() {
            wx.hideLoading();
            this.setData({
                showPicture: true,
                overflowHidden: true,
            });
        }.bind(this);
        this.getGroupPurchaseImage(data, callback);
    },
    returnAction: function() {
        this.cancelAction();
        this.dialogViewShow();
    },
    cancelAction: function() {
        this.setData({showPicture: false,  overflowHidden: false});
    },
    downloadSharePic: function(e) {
        var picUrl = e.currentTarget.dataset.url || "";
        if (picUrl=="") {
            wx.showToast({title: "图片下载失败", icon: 'none'});
            return;
        }
        wx.downloadFile({
            url: picUrl,
            success: function(res) {
                if (res && res.tempFilePath) {
                    this.setData({
                        tempFilePath: res.tempFilePath
                    });
                    this.saveSharePic();
                } else {
                    wx.showToast({title: '图片下载失败，请重试', icon: 'none'});
                }
            }.bind(this),
            fail: function(e) {
                console.log(e);
                wx.showModal({
                    title: '提示',
                    content: '图片下载失败， 请重试',
                    showCancel: false,
                    confirmText: '我知道了'
                });
            }
        })
    },
    saveSharePic: function() {
        var that = this;

        if (!wx.saveImageToPhotosAlbum || !_.isFunction(wx.saveImageToPhotosAlbum)) {
            wx.showModal({
                title: "提示",
                content: "暂不支持保存图片至系统相册，请截图保存",
                showCancel: false
            });
            return;
        }
        wx.saveImageToPhotosAlbum({
            filePath: this.data.tempFilePath,
            success: function(sres) {
                wx.showToast({
                    title: that.userTitle || "已保存到手机相册，快到朋友圈分享图片吧",
                    mask: true,
                    icon: 'none'
                });
                that.cancelAction();
            },
            fail: function(e) {
                wx.showToast({
                    title: '保存失败，请重新尝试',
                    icon: 'none',
                    mask: true
                })
                that.reopenAuth(); //提示用户重新授权相册系统
            }
        })
    },
    reopenAuth() {
        var that = this;
        var authRes = false;

        wx.getSetting({
            success: function(res) {
                authRes = res.authSetting["scope.writePhotosAlbum"];

                if (authRes == undefined) {
                    cwx.cwx_mkt.refreshSessionKey();
                } else if (authRes == false) {
                    that.authFailedHandler();
                } else {
                    cwx.cwx_mkt.refreshSessionKey();
                    //that.saveSharePic();
                }
            }
        })
    },
    /**
     * 未授权处理，提示重新授权
     */
    authFailedHandler() {
        var that = this;

        wx.showModal({
            title: "提示",
            content: "相册系统未授权，请重新授权并保存图片",
            success: function(res) {
                if (res.confirm) {
                    that.openWXSetting();
                } else {
                    that.cancelAction();
                }
            }
        });
    },
     /**
     * 打开重新授权配置成功后处理
     */
    openWXSetting() {
        var that = this;

        wx.openSetting({
            success: function(res) {
                if (res.authSetting && res.authSetting["scope.writePhotosAlbum"]) {
                    cwx.cwx_mkt.refreshSessionKey();
                    that.saveSharePic();
                } else {
                    that.cancelAction();
                }
            }
        })
    },
    goMyOrder: function() {
        var islogin = cwx.user.isLogin();
        if (!islogin) {
            this.weChatLogin(function(){
               this.jumpMyOrder();
            }.bind(this))
            return;
        }
        this.jumpMyOrder();
    },
    jumpMyOrder: function() {
        try {
            var reg = /pages\/myctrip\/list\/list/gi;
            var delta = this.checkPageDelta(reg);
            if (delta <= 0) {
                wx.navigateTo({url: '../../myctrip/list/list?id=piao'});
            } else {
                wx.navigateBack({
                    delta:  delta - 1
                });
            }
        } catch (error) {
            wx.navigateTo({url: '../../myctrip/list/list?id=piao'});
        }
    }
}
export default options;
