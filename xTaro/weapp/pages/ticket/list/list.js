import {cwx, _, TPage, config, search, locateSource} from '../common.js';
import utils from '../groupresdetail/index.util';
import {hackAdd, getResultWithFractionLength} from '../common';
import location from '../locate';
import { __global } from "../../../cwx/cwx.js";
let ticketmodel = require('../service/ticketmodel.js'),
    ticketstore = require('../service/ticketstore.js');
var marketFloatUtils = require('./template/float.js');

let options = {
    data: {
        scrollobj: {},
        containerData: {
            viewspots: [],
            listloopHidden: false,
            scrollTop: 1,
            noresultHidden: true
        },
        totalpage: 1,
        title: '',
        requestData: '',
        searchBar: {
            closeIconHidden: true,
            type: 'dt',
            inputValue: ''
        },
        shareOption: {},
        showBtn: false,
        marketFloatData: {}
    },
    citylist: null,
    name: 'list',
    lower: function () {
        let pidx = this.data && this.data.requestData && this.data.requestData.pidx;
        pidx++;
        this.requestTicket(pidx);
    },
    gotoList: function (e) {
        // cwx.navigateTo({url: '../middleware/index'})
      cwx.navigateTo({ url: '/pages/gs/sight/newDetail?sightId=' + e.currentTarget.dataset.id })
    },
    onReady: function () {
        cwx.setNavigationBarTitle({
            title: this.data.title
        });
    },
    onShow: function (e) {
        cwx.setNavigationBarTitle({
            title: this.data.title
        });
        if(__global.appId == 'wx0e6ed4f51db9d078') {
            this.checkStatus();
        }
    },
    marketFloatEntrance:function(e){
        this.mktFloat[e.target.dataset.type](e);
    },
    onLoad: function (options) {
        //let getsearch = search(options, this);
        // if(getsearch.activityflag || options.activityflag){
        //     this.mktFloat = marketFloatUtils(this,'LOTTERY');
        // }
        this.mktFloat = marketFloatUtils(this,'LOTTERY');
        let cityinfos = ticketstore.TicketCityInfo.get() || {};
        //附近
        if(options.type == 'n'){
            this.locate();
            cwx.locate.startGetAddress((data)=> {
                wx.hideToast();
                //获取定位成功
                if(data.location) {
                    cwx.setNavigationBarTitle({
                        title: '附近景点'
                    });
                    this.init(Object.assign(options,{
                        type:'n',
                        districtname: '我的位置'
                    },data.location));
                    return;
                }
                //获取定位失败
                wx.showModal({
                    title:'定位失败',
                    content:'未能获取到您的位置，请选择城市',
                    showCancel:false,
                    success:()=>{
                        this.forwardCitylist();
                    }
                });
                cwx.setNavigationBarTitle({
                    title: '景点门票'
                });
            }, locateSource);
            return;
        }
        //关键字
        if(options.type == 'k'){
            //有选城市，无需定位
            if(cityinfos.districtid && cityinfos.districtname){
                Object.assign(options, cityinfos);
                this.init(options);
                return;
            }
            //无选城市，需要定位
            if(options.locate == 1) {
                this.locate();
                cwx.locate.startGetCtripCity((data) => {
                    let CityEntities = data && data.data && data.data.CityEntities || [],
                        districtid = data && data.data && data.data.DistrictId;
                    let geoCityInfo = {};
                    if (CityEntities.length) {
                        geoCityInfo = {
                            districtid: districtid,
                            districtname: CityEntities[0].CityName
                        }
                    }
                    cwx.setNavigationBarTitle({
                        title: options.keyword
                    });
                    wx.hideToast();
                    Object.assign(options, geoCityInfo);
                    this.init(options);
            }, locateSource);
                return;
            }
            //无选城市，无需定位
            Object.assign(options, cityinfos);
            this.init(options);
            return;
        }
        //普通攻略城市
        //优先url，其次有过选择
        if (options.districtid && options.districtname) {
            this.init(options);
            return;
        }
        //无选择，需要定位
        if(options.locate){
            let t = this;
            t.locate();
            cwx.locate.startGetCtripCity((data)=>{
                let CityEntities = data && data.data && data.data.CityEntities || [],
                    districtid = data && data.data && data.data.DistrictId;
                let geoCityInfo = {
                    districtid: 2,
                    districtname: '上海'
                };
                //定位成功
                if(CityEntities.length){
                    geoCityInfo = {
                        districtid: districtid,
                        districtname: CityEntities[0].CityName
                    }
                    wx.hideToast();
                    Object.assign(options,geoCityInfo);
                    t.init(options);
                    return;
                }
                //定位失败
                wx.hideToast();
                wx.showModal({
                    title: '提示',
                    content: '定位失败，您可以手动切换城市',
                    showCancel: false,
                    success(res) {
                        Object.assign(options,geoCityInfo);
                        t.init(options);
                    }
                })
            }, locateSource);
            return;
        }
        //无选择，无需定位
        Object.assign(options, cityinfos);
        this.init(options);
        options.type !== 'k' && this.posCity();
    },
    locate: function () {
        wx.showToast({
            title: '定位中',
            icon: 'loading',
            duration: 10000
        });
    },
    init: function (options) {
        this.data.shareOption = options;
        let searchBar = this.data.searchBar,
            type      = options.type || 'dt',
            districtid = type === 'n' ? null : options.districtid || 2,
            districtname = options.districtname || '上海',
            keyword   = options.keyword;
        searchBar.districtid = districtid;
        searchBar.districtname = districtname;
        searchBar.type = type;
        let cityinfo = {
            districtid: districtid,
            districtname: districtname
        };

        let location = {
            lon:options.lng,
            lat:options.lat
        }

        cityinfo.districtname !== '我的位置' && ticketstore.TicketCityInfo.set(cityinfo);

        let containerData = this.data.containerData;
        containerData.scrollTop = 100;

        let requestData = {
            pageid: this.pageId,
            searchtype: ({dt: 1, n: 3, k: 2})[type] || 2,
            districtid: type === 'dt' ? districtid : null,
            keyword: type === 'k' ? keyword : '',
            needfact: false,
            radiusmin: null,
            radiusmax: type === 'n' ? 300 : null,
            noworder:false,
            sort: ({dt: 1, n: 6, k: 1})[type] || 1,
            pidx: 1,
            isintion: true,
            psize: 20,
            reltype: 1,
            assistfilter: (!!districtid && (districtid !== 'undefined') && (districtid !== 'null') && {userChooseSite: '' + districtid}) || null,
            spara: '',
            filters: [],
            imagesize: 'C_300_300',
            excepts: []
        };

        type === 'n' && Object.assign(requestData,location);
        this.data.requestData = requestData;
        this.setData({
            searchBar: searchBar,
            title: (function (type) {
                let title = '';
                switch (type) {
                    case 'dt':
                        title = '景点门票';
                        break;
                    case 'k':
                        title = keyword ? keyword : districtname;
                        break;
                    case 'n':
                        title = '附近景点'
                }
                return title;
            })(type),
            containerData: containerData
        });
        this.requestTicket(options.index || 1);
    },
    /**
     * 校验是否显示拼团按钮
     */
    checkStatus: function() {
        ticketmodel.PurchaseActivityListModel.request({
            data: {
                productline: 1,
                pageindex: 1,
                pagesize: 1,
                pageId: this.pageId
            },
            success: function(res){
                if (res.resources && res.resources.length) {
                    this.setData({showBtn: true})
                }
            }.bind(this)
        })
    },
    requestTicket: function (index) {
        let totalpage   = this.data.totalpage,
            that        = this,
            requestData = this.data.requestData;
        if (index != 1 && index > totalpage) {
            return;
        }
        requestData.pidx = index;
        wx.showToast({
            title: '加载中',
            icon: 'loading',
            duration: 10000
        });
        ticketmodel.ListSearch.request({
            data: requestData,
            success: function (listdata) {
                let listssss = listdata.viewspots||[];
                listssss.forEach(function (item) {
                    if(item.cmtscore) item.cmtscore = item.cmtscore + '分';
                    if(item.star) item.star = item.star + 'A景区';

                    function getSafetyPrice(price) {
                        return price ? Math.max(getResultWithFractionLength(price, 2), 0) : price;
                    }
                    function getPromotionInfo(tempPrice, minusPromotions, maxCashBackAmount, sameCashBackAmount) {
                        let sellingPrice,         // 卖价
                            bestPrice;     // 优惠价 用全免券 可能为0

                        // case E
                        let reducedAmount = 0;      // 已减金额

                        // 有起价价格并且有优惠信息
                        if (tempPrice > 0 && minusPromotions && minusPromotions.length) {
                            // item.type    优惠类型：1.立减，3.私券
                            // item.reductionMode折扣优惠方式：1.固定立减，2.百分比（折扣），3.阶梯（满减）, 4.限时减
                            // 1 => (1、4)    3 => (1、2、3)
                            let key;
                            minusPromotions.forEach(item => {
                                if (item.promotionStatus === 0) {       //可用
                                    key = item.type === 3 && item.reductionMode === 2 ? 'startAmount' : 'amount';       // 折扣金额 | 立减金额
                                    // E版本 或联想词搜索只涉及起价调整
                                    if (!(item.type === 3 && item.reductionMode === 3 && tempPrice < item.startAmount)) {       // 除了满减 卖价不到门槛的 其他都计入起价
                                        reducedAmount = hackAdd(reducedAmount, item[key]);
                                        bestPrice = hackAdd(tempPrice, -reducedAmount);
                                    }
                                }
                            });
                        }

                        const price = isNaN(bestPrice) ? getSafetyPrice(tempPrice) : getSafetyPrice(bestPrice);
                        sellingPrice = !isNaN(bestPrice) && bestPrice <= tempPrice ? getSafetyPrice(tempPrice) : sellingPrice;

                        return {
                            price,
                            reducedAmountText: reducedAmount ? `${sellingPrice}已减${getSafetyPrice(reducedAmount)}` : ''
                        };
                    }

                    let tempPrice = null;
                    switch (item.minPriceType) {
                        case 0:
                            tempPrice = item.price;
                            break;
                        case 2:
                        case 3:
                            tempPrice = item.rmbReferencePrice;
                            break;
                    }
                    item._promotionInfo = getPromotionInfo(tempPrice, item.minusPromotions, item.maxCashBackAmount, item.sameCashBackAmount);

                    function getTags(taginfos) {
                        let hasDiscountTag = false;
                        let serviceTags = [];
                        let discountTags = [];
                        taginfos && taginfos.forEach((taginfo) => {
                            if (taginfo.tagtype === 'service') {
                                serviceTags = taginfo.tags.reduce((acc, tag) => {
                                    if (tag.tid !== 1) {
                                        tag.orange = false;
                                        tag.tid === 3 && (tag.orange = true);
                                        acc.push(tag);
                                    }
                                    return acc;
                                }, []);
                            } else if (taginfo.tagtype === 'discount') {
                                discountTags = taginfo.tags.reduce((acc, tag) => {
                                    if (tag.tid !== 1) {
                                        tag.orange = true;
                                        acc.push(tag);
                                    }
                                    return acc;
                                }, []);
                                (discountTags.length) && (hasDiscountTag = true);
                            }
                        });
                        if (hasDiscountTag) {
                            serviceTags = serviceTags.slice(0, 4);
                        }
                        return serviceTags.concat(discountTags);
                    };
                    item._tags = getTags(item.taginfos);
                });
                that.data.totalpage = listdata.totalpage;
                //先处理列表
                let oldViewpots   = index === 1 ? [] : that.data.containerData.viewspots || [],
                    viewspots     = oldViewpots.concat(listdata && listdata.viewspots),
                    containerData = that.data.containerData;
                containerData.viewspots = viewspots;
                if (!listdata.totalpage) {
                    containerData.listloopHidden = true;
                    containerData.noresultHidden = false;
                } else {
                    containerData.listloopHidden = false;
                    containerData.noresultHidden = true;
                }
                that.setData({
                    'containerData': containerData
                });
                wx.hideToast();
            }
        });
    },
    inputAction: function (e) {
        let keyword = e.detail.value;
        this.keyword = keyword;
        if (!keyword) {
            this.handleHideCloseIcon(e);
        } else {
            this.handleShowCloseIcon(e);
        }
    },
    blurAction: function (e) {
        let keyword = e.detail.value;
        if (keyword) {
            this.handleShowCloseIcon(e);
            return;
        }
        this.handleHideCloseIcon(e);
    },
    searchAction: function (e) {
        //因为input的bindconfirm和表单的bindsubmit事件一样，所以取input value从2处获取，一处form下的，一处input的
        let inputValue = e.detail.value.input || (e.detail.value.input != "" && e.detail.value);
        if (!inputValue) {
            return;
        }
        let searchBar = this.data.searchBar,
            districtname  = searchBar.districtname,
            districtid    = searchBar.districtid;
        cwx.redirectTo({
            url: 'list?type=k&districtid=' + districtid + '&districtname=' + districtname + '&keyword=' + inputValue
        });
    },
    handleHideCloseIcon: function () {
        this.setData({
            'searchBar.closeIconHidden': !!1
        });
    },
    handleShowCloseIcon: function () {
        this.setData({
            'searchBar.closeIconHidden': !!0
        });
    },
    clearInputAction: function (e) {
        this.setData({
            'searchBar.inputValue': ' '
        });
        this.setData({
            'searchBar.inputValue': ''
        });
        this.blurAction(e);
    },
    //格式化城市
    getCityInfo: function (res) {
        let CityEntities = res && res.CityEntities && res.CityEntities[0],
            disctrictid = res && res.DisctrictId;
        if (!CityEntities || !disctrictid) {
            return {
                disctrictname: '定位失败',
                disctrictid: 0
            }
        }
        return {
            disctrictid: disctrictid,
            disctrictname: CityEntities.CityName,
            isdomestic: res.CountryName == '中国' ? true : false
        }
    },
    //切换后回调
    changeCity: function (selected) {
        //我附近
        if(selected && selected.type === 'n' && selected.lng && selected.lat){
            this.init({
                type:'n',
                districtname: '我的位置',
                lng:selected.lng,
                lat:selected.lat
            });
            return;
        }
        //如果无切换城市
        if (!selected || !selected.districtid || (this.data.searchBar.type == 'dt' && this.data.searchBar.districtid == selected.districtid)) {
            return;
        }
        //切换城市
        this.init({
            districtid: selected.districtid,
            districtname: selected.districtname,
            index: 1
        });
        //处理历史记录
        this.handleCityHistory(selected);
    },
    onShareAppMessage: function () {
        let option = this.data.shareOption || {},
            tmps   = [];
        let title = (option['keyword'] ? option['keyword'] + '相关' : (option['districtname']||''))+"景点门票";
        for (let key in option) {
            if (option[key]) {
                tmps.push(key + '=' + option[key]);
                if(key == 'keyword'){
                    delete option[key];
                }

            }

        }
        let searchs = tmps.join('&');

        return {
            bu: 'ticket',
            title: title,
            desc: '【携程旅行】-- 旅游门票,景点门票',
            path: 'pages/ticket/list/list?' + searchs
        }
    }
};
TPage(Object.assign(options, location, utils));
