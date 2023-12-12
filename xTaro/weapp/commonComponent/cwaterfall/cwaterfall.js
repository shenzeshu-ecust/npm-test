import { cwx } from '../../cwx/cwx';
import { concatImgSuffix, concatImgSize, caclTitleHeight, handleImageInfo, addItagToTitle } from './utils';
import getTripStatus, {setTripStatus, clearTripStatus } from './tripInfo';
import {fetchDataLog, fetchFailLog, productExposureLog, productClickLog, sendDevTrace} from './infoCollect';
import getDeviceInfo from './getDeviceInfo';
import sendExposeFn from './advertiseAspect';


Component({
    properties: {
        // 这里是外部传入的数据
        /**
         * 可选，自定义服务端数据接口
         */
        url: {
            type: String,
        },
        /**
         * 必传，场景id
         */
        source: {
            type: String,
        },
        // 必传，appid
        appId: {
            type: String,
        },
        // "0(行前)/1(行中)"
        tripStatus: {
            type: String
        },
        /**
         * 手选城市信息
         * @param {string} type 统一地址类型,使用IGGI统一规范,1(国家)|2(省)|3(城市)|4(区县)5|(景区)|6(商圈,攻略系)|7(乡镇)|9(大洲下辖地区)|10000(大洲)
         * @param {string} id 统一地址id
         * @param {string} name 地址名称，如：'上海'，'北京'
         * @param {string} geoType "base"(酒店系)，"gs_district"(攻略系)
         */
        globalInfo: {
            type: Object
        },
        /**
         * 酒店价格查询
         * @param {string} checkIn 入住日期
         * @param {string} checkOut 离开日期
         */
        hotelInfo: {
            type: Object
        },
        // 是否跳过定位，传true时将跳过定位 发送给服务端的定位信息为空
        ignoreLocation: {
            type: Boolean
        },
        // extra为json_string，并通过ext.extra透传给服务端。
        extra: {
            type: [String, Object]
        },
        // 自定义组件最外层类名
        className: {
            type: String
        },
        // 自定义组件最外层style样式
        cStyle: {
            type: String
        },
        // 点击卡片时的回调，需自行处理跳转, 回传整个卡片信息
        callback: {
            type: Function
        },
        // 封面保底图色值，如：'#eeeeee'
        defaultImgBgColor: {
            type: String
        },
        /**
         * tab主题色值配置
         * @param {String} backgroundColor tabbar的背景颜色， 如：'#ff0000'
         * @param {String} titleFontColor tabbar title的字体颜色
         * @param {String} subtitleFontColor tabbar subtitle的字体颜色
         * @param {String} activeTitleFontColor 选中 tab title的字体颜色
         * @param {String} activeSubtitleFontColor 选中 tab subtitle的字体颜色
         * @param {String} activeSubtitleBackgroundColor 选中 tab subtitle的背景颜色
         */
        tabThemeConfig: {
            type: Object,
            value: {}
        },
        /**
         * tab间距配置
         * @param {Number} titleLeftGap 代表tab最左侧固定预留的间距（不包含在两个tab的间隙），单位rpx，如：12
         * @param {Number} titleMiddleGap 代表两个tab中间距离的一半，并且同时代表一个tab自身的独立间隙，单位rpx
         * @param {Number} titleRightGap 代表tab最右侧固定预留的间距（不包含在两个tab的间隙），单位rpx
         */
        tabGapConfig: {
            type: Object,
            value: {}
        }
    },
    observers: {
        "globalInfo, hotelInfo": function() {
            if(!this.attached) {
                return;
            }
            this.init();
        }
    },
    data: {
        // 这里是组件内部使用的数据
        tabs: [],
        waterfallLeftList: [],
        waterfallRightList: [],
        loadingState: 1,  //0正常，1加载中，2到底了 3失败
        windowHeight: cwx.wxSystemInfo.windowHeight,
        tabFixed: false,
        selectedTabIndex: 0,
        hideItemIds: {}, // 应该隐藏的卡片，比如：wxsdk
    },
    lifetimes: {
        created: function (){
            console.log('---cwaterfall----created--------');
            this.resetInnerData();
        },
        attached: function () {
            const props = this.properties;
            // 在组件实例进入页面节点树时执行
            console.log('---cwaterfall----attached--------');
            // 先清除上次请求数据
            clearTripStatus();
            // 设置基本信息
            setTripStatus({
                sourceid: props.source,
                appId: props.appId
            });
            // console.log('--props.tripStatus:', props.tripStatus);
            if (props.tripStatus != '') {
                setTripStatus({
                    tripStatus: props.tripStatus
                });
            }
            // 设备及系统信息
            getDeviceInfo((info) => {
                this.innerData.deviceInfo = info;
            });
            this.initRelevantData();
            this.attached = true;
        },
        detached: function () {
            console.log('---cwaterfall----detached--------');
            if (this._observer) {
                // 解绑
                this._observer.disconnect()
            }
            this.attached = false;
        }
    },
    ready: function() {
        // 触发bu绑定的获取实例的事件
        // detail 参数是实例
        this.triggerEvent('getref', this);
    },
    methods: {
        // 清空内部数据状态
        resetInnerData: function() {
            this.innerData = {
                currentWaterfallList: [], // 当前list
                waterfallLeftList: [],
                waterfallRightList: [],
                waterfallLeftHeight: 0,
                waterfallRightHeight: 0,
                pageIndex: 1,
                coordinate: {
                    coordsInfo: {
                        type: null,
                        latitude: null,
                        longitude: null,
                        overSea: false,
                    },
                    time: 0
                },
                tabs: [],
                tabIndex: 0,
                deviceInfo: null,
                startRenderTime: 0, // 开始渲染时间，用于计算微信广告是否超时（共用同一个开始时间，因为setData后广告组件会重新渲染）
            };
        },
        // 初始化：重置所有状态，供外部重新渲染组件时调用
        init: function() {
            this.setData({
                waterfallLeftList: [],
                waterfallRightList: [],
                loadingState: 1,  //0正常，1加载中，2到底了 3失败
                tabs: [],
                tabFixed: false,
                selectedTabIndex: 0,
            });
            this.resetInnerData();
            this.initRelevantData();
        },
        // 检查是否应该渲染请求返回的数据，fix频繁快速的切换globalInfo时请求返回延迟导致渲染前一个城市的数据
        checkShouldRenderData: function(extInfo) {
            const curGlobalInfo = this.properties.globalInfo;
            const curGlobalId = curGlobalInfo && curGlobalInfo.id || '';
            const returnedGlobalId = extInfo && extInfo.globalID || '';
            const isSameGlobalId = String(curGlobalId) === String(returnedGlobalId);
            return isSameGlobalId;
        },
        getWaterList: function () {
            let tempCurrentWaterfallList = [];
            let loadingState = 1
            const self = this;
            this.getWaterflowInfo((res) => {
                // console.log('---------getWaterflowInfo---------', res)
                const extInfo = res && res.data && res.data.data && res.data.data.ext || {};
                if(!this.checkShouldRenderData(extInfo)){
                    return;
                }
                if (res && res.statusCode == 200 && res.data && res.data.ResponseStatus.Ack == "Success" && res.data.data && res.data.data.items && res.data.data.items.length > 0) {
                    if(!this.innerData.tabs || this.innerData.tabs.length === 0) {
                        this.innerData.tabs = res.data.data.tabs;
                    }
                    let items = res.data.data.items;
                    items.map((item, index) => {
                        try{
                            const temp = item.replace(/\n/g, '').replace(/\r/g, '');
                            let article = JSON.parse(temp);
                            article.posIndex = this.innerData.pageIndex + '_' + index;
                            article.pageIndex = this.innerData.pageIndex;
                            const createFunc = self.getTemplateFunc(article.type);
                            let waterfallItem = createFunc(article, tempCurrentWaterfallList.length);

                            waterfallItem && tempCurrentWaterfallList.push(waterfallItem)
                        }catch(e) {
                            console.log('[getWaterflowInfo]error:', e);
                            sendDevTrace('waterFlow_data_error', {item: item, pageIndex:this.innerData.pageIndex, index:index})
                        }
                    })
                    // console.log('--------waterfallList-------this.innerData.tabs-', this.innerData.tabs)
                    loadingState = 0
                    // pageIndex++;
                    this.innerData.pageIndex += 1;
                    if (tempCurrentWaterfallList && tempCurrentWaterfallList.length) {
                        this.innerData.currentWaterfallList = tempCurrentWaterfallList;
                        this.getWaterFallList();
                    }
                    this.setData({
                        loadingState
                    })
                } else if (res && res.data && res.data.data && (res.data.data.items && res.data.data.items.length == 0 || res.data.data.done == '1')) {

                    this.setData({
                        loadingState: 2,
                    })
                } else {
                    this.setData({
                        loadingState: 3
                    })
                }
            })
        },
        getTemplateFunc: function(type) {
            switch(type){
                case 'pictxt':
                    return this.createPictxtItem;
                    break;
                case 'destcard':
                    return this.createDestcardItem;
                    break;
                case 'simplepic':
                    return this.createSimplepicItem;
                    break;
                case 'channel':
                    return this.createChannelItem;
                    break;
                case 'wxsdk':
                    return this.createWxsdkItem;
                default: return function(){
                    return null;
                }
            }

        },
        createWxsdkItem: function(article, index) {
            const waterfallItem = {...article};
            if(!waterfallItem.image) {
              // 固定高度
              waterfallItem.image = {width: 343, height: 257};
            }
            // 不同page存在相同id的数据，pageIndex+code 作为唯一标识
            waterfallItem.innerId = article.pageIndex + '-' + article.id;
            // 传给广告组件，组件回调中返回
            waterfallItem.extension = [{
              name: 'customData',
              value: {
                id: waterfallItem.innerId
              }
            }];
            waterfallItem.index = index;
            waterfallItem.infoHeight = -20; // paddingBottom
            return waterfallItem;
        },
        createChannelItem: function(article, index) {
            const waterfallItem = {...article};
            waterfallItem.ext = article.ext;
            waterfallItem.image = handleImageInfo(article.img && article.img.img3);
            waterfallItem.channelInfo = article.channelInfo || {};
            waterfallItem.showChannelInfo = waterfallItem.channelInfo.name || waterfallItem.channelInfo.image1;
            if(waterfallItem.channelInfo.image1) {
                const { height, width } = waterfallItem.channelInfo.image1;
                waterfallItem.channelInfo.image1.realWidth = height && width && (Number(height) > 0) ? (Number(width) / Number(height) * 40 + 'rpx'): 'calc(100% - 40rpx)';
            }
            waterfallItem.channelInfo.fontColor = waterfallItem.channelInfo.fontColor ? '#' + waterfallItem.channelInfo.fontColor : '#333';
            const background = article.viewStyle && article.viewStyle.background || {};
            waterfallItem.channelView = {
                url: waterfallItem.channelInfo.backgroundUrl,
                startcolor: background.startcolor || 'FFFFFF',
                endcolor: background.endcolor || 'D4F1E9'
            };
            waterfallItem.showLive = typeof article.liveStatus !== 'undefined'; // 展示直播状态
            if(waterfallItem.showLive) {
                // 保底文案
                const backText = article.liveStatus === 0 ? '直播中':(article.liveStatus === 12 ? '直播预告':'直播回放');
                waterfallItem.liveStatusText = article.liveStatusText || backText;
            }
            waterfallItem.showUser = article.user && article.user.icon && article.user.nickname;
            waterfallItem.biztype = article.ext && article.ext.biztype;
            waterfallItem.jumpUrl = article.jumpurl || article.bus;
            waterfallItem.index = index;
            // 计算图片下方文字部分的高度，用于计算整个卡片的高度
            let infoHeight = 0;
            const shouldAddItagToTitle = waterfallItem.itag ? addItagToTitle(waterfallItem.title,  waterfallItem.itag.text, !!waterfallItem.itag.icon) : false;
            waterfallItem.shouldAddItagToTitle = shouldAddItagToTitle;
            if(waterfallItem.title) {
                infoHeight += caclTitleHeight(waterfallItem.title, 12);
            }
            if(waterfallItem.itag && waterfallItem.itag.text && !shouldAddItagToTitle) {
                infoHeight += 40; //28+12
            }
            if(waterfallItem.showChannelInfo) {
                infoHeight += 138; //116 + 22;
                if(!waterfallItem.channelInfo.text) {
                    infoHeight -= 36; //24+12
                }
            }
            waterfallItem.infoHeight = infoHeight;
            return waterfallItem;
        },
        createSimplepicItem: function(article, index) {
            const waterfallItem = {...article};
            waterfallItem.isadvert = article.isadvert; // 是否有广告
            waterfallItem.videoUrl = article.videourl;
            waterfallItem.image = handleImageInfo(article.img && article.img.img3);
            waterfallItem.ext = article.ext;
            waterfallItem.biztype = article.ext && article.ext.biztype;
            waterfallItem.jumpUrl = article.jumpurl;
            waterfallItem.index = index;
            waterfallItem.infoHeight = -20; // paddingBottom
            return waterfallItem
        },
        createDestcardItem: function(article, index) {
            const waterfallItem = {...article};
            waterfallItem.subtitle1 = article.subtitle;
            waterfallItem.videoUrl = article.videourl;
            waterfallItem.jumpUrl = article.jumpurl;
            waterfallItem.ext = article.ext;
            waterfallItem.biztype = article.ext && article.ext.biztype;
            let image = {};
            image.url = concatImgSuffix(article.imageUrl, true);
            waterfallItem.image = image;
            waterfallItem.index = index;
            // 计算图片下方文字部分的高度，用于计算整个卡片的高度
            let infoHeight = 0;
            if(waterfallItem.title) {
                infoHeight += caclTitleHeight(waterfallItem.title, 16 + 16 + 32);
            }
            if(waterfallItem.itag || waterfallItem.stag || waterfallItem.tag) {
                infoHeight += 38;
            }
            if(waterfallItem.subtitle1) {
                infoHeight += 38;
            }
            infoHeight += 4; // paddding + margin - 父级paddingBottom (与pictxt相差的paddingBottom)
            waterfallItem.infoHeight = infoHeight;
            return waterfallItem
        },
        createPictxtItem: function(article, index) {
            const waterfallItem = {...article};
            // 计算文字部分高度
            let infoHeight = 0;
            waterfallItem.type = article.type;
            waterfallItem.id = article.id;
            waterfallItem.price = article.price ? Math.round(article.price) : undefined;
            waterfallItem.text = article.text;
            waterfallItem.jumpUrl = article.jumpurl;
            waterfallItem.ext = article.ext;
            waterfallItem.biztype = article.ext ? article.ext.biztype : '';
            waterfallItem.isadvert = article.isadvert;
            waterfallItem.protag = article.protag;
            let image = {};
            image.url = article.img.img3 ? article.img.img3.url : '';
            image.width = article.img.img3 ? article.img.img3.width : '';
            image.height = article.img.img3 ? article.img.img3.height : '';
            const isHorizontalImage = Number(image.width) >= Number(image.height);
            image.height = isHorizontalImage ? image.width : ('' + Number(image.width) * 4 / 3);
            image.url = concatImgSuffix(image.url, isHorizontalImage);

            waterfallItem.image = image;
            if (article.user) {
                let vicon = !(article.user.identitycomment && article.user.identitycomment.length) ? '' : article.user.isbusinessuser === "0" ? 'https://pic.c-ctrip.com/platform/h5/mini_programe/v2021.1.7/home/C-user.png' : article.user.isbusinessuser === "1" ? 'https://pic.c-ctrip.com/platform/h5/mini_programe/v2021.1.7/home/B-user.png' : ''
                waterfallItem.author = {
                    isbusinessuser: article.user.isbusinessuser,
                    nickName: article.user.nickname,
                    avatUrl: concatImgSize(article.user.icon, '_D_68_68'), // 加切图参数控制图片大小,
                    vicon,
                    identitycomment: article.user.identitycomment
                }
            }
            // let author = {};
            // author.nickName = article.author ? article.author.nickName : '';
            // author.avatUrl = article.author ? article.author.coverImage.dynamicUrl : '';
            // author.identityType = article.author ? article.author.identityType : false;
            // waterfallItem.author = author;
            waterfallItem.title = article.title;
            waterfallItem.subtitle1 = article.subtitle1
            waterfallItem.itag = article.itag;
            waterfallItem.stag = article.stag;
            waterfallItem.tag = article.tag;
            waterfallItem.poiName = article.ext ? article.ext.cityname : '';
            waterfallItem.isVideo = article.showvideoicon == '1' ? true : false;
            waterfallItem.videoUrl = article.preloadVideoUrl;
            waterfallItem.isVip = article.author ? article.author.isVip : '';
            waterfallItem.index = index;

            if(waterfallItem.title) {
                infoHeight += caclTitleHeight(waterfallItem.title, 32);
            }
            if(waterfallItem.itag || waterfallItem.stag || waterfallItem.tag) {
                infoHeight += 38;
            }
            if(waterfallItem.subtitle1) {
                infoHeight += 38;
            }
            if(waterfallItem.price) {
                infoHeight += 52;
            } else if(waterfallItem.author && waterfallItem.author.avatUrl && waterfallItem.author.nickName) {
                infoHeight += 68;
                if(waterfallItem.author.identitycomment) {
                    infoHeight += 10;
                }
            }
            waterfallItem.infoHeight = infoHeight;

            return waterfallItem;
        },

        //瀑布流处理
        getWaterFallList: function () {
            let self = this,
                leftList = this.innerData.waterfallLeftList,
                rightList = this.innerData.waterfallRightList,
                leftHeight = this.innerData.waterfallLeftHeight,//左列高度
                rightHeight = this.innerData.waterfallRightHeight; //右列高度

            this.innerData.currentWaterfallList.forEach((item, index) => {
                // console.log('---item.type:', item.type);
                if (item.image && !item.image.width) {
                    item.image.width = 343;
                }
                if (item.image && !item.image.height) {
                    item.image.height = 343;
                }
                let picHeight = Number(item.image.width) >= Number(item.image.height) ? 343 : (343 * 4 / 3);
                picHeight = parseInt(picHeight);
                item.image.picWidth = 343;
                item.image.picHeight = picHeight;

                // todo: 高度计算有问题 ！！！
                // 1. 计算单列内容区域宽度 2. 计算一行能展示的字的个数=列宽 * dpi/fontSize 3. 计算行数=字数 > 单行字数 > 2 ： 1
                if (leftHeight <= rightHeight) {
                    leftList.push(item);
                    // leftHeight = leftHeight + self.getWarterFallPicHeight(item.image.picHeight, item.type);
                    leftHeight = leftHeight + item.image.picHeight + item.infoHeight;
                    this.innerData.waterfallLeftHeight = leftHeight;
                } else {
                    rightList.push(item);
                    // rightHeight = rightHeight + self.getWarterFallPicHeight(item.image.picHeight, item.type);
                    rightHeight = rightHeight + item.image.picHeight + item.infoHeight;
                    this.innerData.waterfallRightHeight = rightHeight;
                }
            });

            const tabs = this.data.tabs || [];
            (tabs.length === 0) && this.innerData.tabs.forEach((item, index) => {
                if(!item.name) {
                    return;
                }
                const newItem = {...item};
                // 主标题宽度限制200px，超长中间... 也就是最多12.5个汉字，处理逻辑：长度小于等于12时全部展示，大于12个时，展示前6个字+...+后五个字
                if(item.name.length > 12) {
                    const originName = item.name;
                    newItem.name = originName.substring(0, 6) + "..." + originName.substring(originName.length-5);
                }
                // 副标题字数宽度限制140px，超长中间... 也就是最多12.7个汉字，处理逻辑同name字段
                if(item.subName && item.subName.length > 12) {
                    const originSubtitle = item.subName;
                    newItem.subName = originSubtitle.substring(0, 6) + "..." + originSubtitle.substring(originSubtitle.length-5);
                }
                newItem.picIcon2 = item.picIcon2 || item.picIcon; // 选中态icon
                tabs.push(newItem);
            });

            this.innerData.startRenderTime = Date.now();

            self.setData({
                waterfallLeftList: leftList,
                waterfallRightList: rightList,
                tabs: tabs
            }, () => {
                this.interSection();
            });
        },
        // 获取更多数据，滚动节点需绑定此函数
        getListMore: function () {
            console.log('=========getListMore翻页==============')
            let loadingState = this.data.loadingState;
            if (loadingState == 0 || loadingState == 3) {
                this.setData({
                    loadingState: 1
                })
                this.getWaterList();
            }
        },
        // 错误重试
        refreshList: function () {
            this.setData({
                loadingState: 1
            })
            this.getWaterList();
        },
        //数据复位
        initRelevantData: function () {
            // pageIndex = 1;
            // waterfallLeftList = [];
            // waterfallRightList = [];
            // tabs = [];
            // tabIndex = 0;

            // this.setData({
            //   loadingState: 1,
            // })
            this.getWaterList();
        },
        // 跳转至详情页
        jumpToDetail: function (e) {
            const props = this.properties;
            const url = e.currentTarget.dataset.jump;
            const location = e.currentTarget.dataset.location;
            const product = this.getProductFromPosIndex(location) || {};
            const jumpType = e.currentTarget.dataset.jumptype;
            if(!product.isAlreadyExposure) {
                // fix: 点击时若未曝光，则补一次曝光
                product.isAlreadyExposure = true;
                productExposureLog(product, this.innerData.tabs && this.innerData.tabs[this.innerData.tabIndex] && this.innerData.tabs[this.innerData.tabIndex].id);
                // 纵横曝光埋点
                if(product && product.ext && product.ext.mktmoniterlinks) {
                    sendExposeFn({
                        moniterLinkList: product.ext.mktmoniterlinks
                    }, 'show');
                }
            }
            // 卡片点击埋点
            const clickLogData = jumpType === 'channelInfo' ? {
                ...product,
                ext: {
                    ...(product.ext || {}),
                    channelJumpurl: url,
                    itemext: product.channelInfo && product.channelInfo.ext
                }
            } : product;
            productClickLog(clickLogData, this.innerData.tabs && this.innerData.tabs[this.innerData.tabIndex] && this.innerData.tabs[this.innerData.tabIndex].id);
            // 纵横点击埋点
            if(product && product.ext && product.ext.mktmoniterlinks) {
                sendExposeFn({
                    moniterLinkList: product.ext.mktmoniterlinks
                }, 'click');
            }
            if(!url) {
              // url 可能不存在，比如：wxsdk卡片
              return;
            }
            if(typeof props.callback === 'function') {
                props.callback({...product, jumpUrl: url, jumpurl: url});
                return;
            }
            if(/^(https?:)?\/\//.test(url)) {
                // H5地址
                const data = {
                    url: encodeURIComponent(url)
                };
                cwx.navigateTo({
                    url:'/cwx/component/cwebview/cwebview?data='+JSON.stringify(data)
                });
                return;
            }
            cwx.navigateTo({
                url
            });
        },
        // 获取经纬度
        getCurrentPosition: function() {
            const setCache = (coords) => {
                this.innerData.coordinate = {
                    coordsInfo: coords,
                    time: new Date().getTime()
                };
                cwx.setStorage({
                    key: 'm_Locate_Cache',
                    data: this.innerData.coordinate,
                    success(res) {
                        console.log('cwaterfall set locate cache success res:', res);
                    },
                    fail(err) {
                        console.log('cwaterfall set locate cache  fail err:', err);
                    }
                });
            };
            return new Promise((resolve) => {
                const send = (coords) => {
                    resolve(coords);
                    return;
                };

                if(this.innerData.coordinate.coordsInfo && ((new Date().getTime() - this.innerData.coordinate.time) < 60 * 1000)) {
                    // 定位缓存有效1分钟
                    send(this.innerData.coordinate.coordsInfo);
                    return;
                }

                cwx.locate.startGetGeoPoint({
                    type: 'gcj02', // type 的默认值是 'gcj02'
                    success(res) {
                        // console.log('startGetGeoPoint====== success res:', JSON.stringify(res));
                        const {latitude, longitude} = res;
                        const coordsInfo = {
                            "latitude": latitude,
                            "longitude": longitude,
                            "type": 'gcj02'
                        };
                        setCache(coordsInfo);
                        send(coordsInfo);
                    },
                    fail(err) {
                        console.log('====== fail err:', err);
                        send({});
                    }
                });
            });

        },
        getWaterflowInfo: function (fn) {
            const props = this.properties;
            const dataUrl = props.url || '/restapi/soa2/13012/getWaterflowInfo';

            const currentTab = this.innerData.tabs && this.innerData.tabs[this.innerData.tabIndex] || {};
            const fetch = (coords) => {
                const startTime = new Date().getTime();
                const tripInfo = getTripStatus();
                if(!this.innerData.deviceInfo) {
                    getDeviceInfo((info) => {
                        this.innerData.deviceInfo = info;
                    });
                }
                cwx.request({
                    url: dataUrl,
                    data: {
                        ...tripInfo, //将服务端获取的设备以及位置数据，回传到服务端
                        "appId": props.appId || "99999999",
                        "source": props.source || "wxhome",
                        "componentType": "miniapp",
                        "tabType": currentTab.type || '',

                        "tabId": currentTab.id || '',
                        "pageInfo": {
                            index: this.innerData.pageIndex,
                            size: props.pageSize || 20
                        },
                        "globalInfo": props.globalInfo || {},
                        "hotelInfo": props.hotelInfo || {},
                        "deviceInfo": this.innerData.deviceInfo || {},
                        "coordinate": coords,
                        "ext": {
                            "cver": '9999.000', // 为了解决版本号的问题，传入的"9999.000"，保证获取的都是新版数据
                            "extra": props.extra
                        },
                        head: {
                            syscode: "30", // 微信小程序固定为30
                        }
                    },
                    success: (res) => {
                        const _data = res.data.data || {};
                        try {
                            const ext = _data.ext || {};
                            //收集tripInfo
                            setTripStatus({
                                tripStatus: _data.tripStatus,
                                ...ext
                            });
                        } catch (e) {
                            console.warn(e);
                        }

                        if(this.innerData.pageIndex == 1) {
                            // 第一次请求的数据加埋点，只发一条数据以及总的数据量，数据太多ubt埋点会发送失败
                            const dataLength = _data.items && _data.items.length;
                            const firstItem = _data.items && _data.items[0];
                            const firstData = { length:dataLength, item:firstItem };
                            const fetchTime = new Date().getTime() - startTime;
                            fetchDataLog(firstData, null, {waterFlow_fetch_time: fetchTime});
                        }
                        fn(res);
                    },
                    fail: (res) => {
                        const fetchTime = new Date().getTime() - startTime;
                        const info = {
                            source: props.source,
                            pageIndex: this.innerData.pageIndex,
                            waterFlow_fetch_time: fetchTime
                        };
                        fetchFailLog(res, info);
                        fn(res);
                    }
                });
            };
            if(props.ignoreLocation) {
                fetch({});
            } else {
                this.getCurrentPosition().then((coords) => {
                    fetch(coords);
                });
            }
        },
        getProductFromPosIndex: function(location){
            if(!location) return {};
            const locationArr = location.split('-');
            const pos = locationArr[0];
            const index = locationArr[1];
            const list = pos == 'left' ? this.innerData.waterfallLeftList : this.innerData.waterfallRightList;
            return list[index];
        },
        // 信息流卡片曝光监听
        interSection: function () {
            let self = this;
            if (self._observer) {
                self._observer.disconnect();
            }
            self._observer = self.createIntersectionObserver({
                // 阈值设置少，避免触发过于频繁导致性能问题
                thresholds: [1],
                // 监听多个对象
                observeAll: true
            })
                .relativeToViewport({
                    bottom: 0
                })
                .observe('.wf-item-inner', (res) => {
                    const item = res;
                    if (item.intersectionRatio == 1) {
                        const dataset = item.dataset || {};
                        const {location = ''} = dataset;
                        if(!location) return;
                        const product = self.getProductFromPosIndex(location);
                        if(product && !product.isAlreadyExposure) {
                            // 仅记录一次曝光埋点
                            product.isAlreadyExposure = true;
                            productExposureLog(product, this.innerData.tabs && this.innerData.tabs[this.innerData.tabIndex] && this.innerData.tabs[this.innerData.tabIndex].id);
                            // 纵横曝光埋点
                            if(product && product.ext && product.ext.mktmoniterlinks) {
                                // console.log('---mktmoniterlinks:', product.ext.mktmoniterlinks);
                                sendExposeFn({
                                    moniterLinkList: product.ext.mktmoniterlinks
                                }, 'show');
                            }
                            // console.log('---product:', product.id);
                        }
                    }
                });
        },
        // tab吸顶监听，切换tab样式
        checkTabFixed: function(e) {
            // console.log('---fatherReact:', e);
            const query = this.createSelectorQuery().in(this);
            query.select('#cwaterfall-tab-container').boundingClientRect();
            query.exec((res) => {
                // res[0].top       // #the-id节点的上边界坐标
                // res[1].scrollTop // 显示区域的竖直滚动位置
                if(res[0] && (parseInt(res[0].top) <= e.target.offsetTop)) {
                    !this.data.tabFixed && this.setData({ tabFixed: true });
                } else {
                    this.data.tabFixed && this.setData({ tabFixed: false });
                }
            })
        },
        resetState: function() {
            this.setData({
                waterfallLeftList: [],
                waterfallRightList: [],
                loadingState: 1,  //0正常，1加载中，2到底了 3失败
            });
            this.innerData.currentWaterfallList = [];
            this.innerData.waterfallLeftList = [];
            this.innerData.waterfallRightList = [];
            this.innerData.waterfallLeftHeight = 0;
            this.innerData.waterfallRightHeight = 0;
            this.innerData.pageIndex = 1;
        },
        // 点击tab
        handleTabClick: function(e) {
            const index = e.currentTarget.dataset.index;
            const current = this.data.selectedTabIndex;
            if(current === index) {
                return;
            }
            this.setData({
                selectedTabIndex: index
            });
            this.innerData.tabIndex = index;
            this.resetState();
            this.initRelevantData();
        },
        getWXAdData: function(e) {
          console.log("---getWXAdData e:", e);
          const data = e.detail;
          let itemId = '';
          const curArr = {...this.data.hideItemIds};
          if(data.extension && data.extension[0] && (data.extension[0].name === 'customData')) {
            const customData = data.extension[0].value;
            itemId = customData.id;
            const time = Date.now() - this.innerData.startRenderTime;
            // 1s超时
            if(time > 1000) {
              console.log("[getWXAdData]: 1s超时!");
              curArr[itemId] = true;
              this.setData({
                hideItemIds: curArr
              });
              return;
            }
          }
          // 数据为空
          if((!data.adData || data.adData.length === 0) && itemId) {
            console.log("[getWXAdData]: empty ad data:", itemId);
            curArr[itemId] = true;
             this.setData({
              hideItemIds: curArr
            });
            console.log('====hideItemIds:', this.data.hideItemIds);
          }
        }
    }
})
