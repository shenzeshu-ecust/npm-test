import { cwx, CPage, _ } from '../../../../cwx/cwx'
import util from '../common/util'
import {channelConfig} from '../common/config'
var Model = require('../common/model.js');
CPage({
	pageId: util.indexPageId(),
	data:{
		isWechat:util.isWechat(),
		loadall:false,
		scrollTop:0,
		requestData:{
			userProductLineID : 0,
			couponStatus : 0,
			orderingRule : 0,
			pageSize : 10,
			startIndex : 1		
		},
		productLine : [],
        loading: true,
		totalCount:0,
		list:[],
		applyList: {
			hidden: true,
			curSort:{
                dir:"0",
                name:"适用范围",
            },
			data:[{
				promoTypeEnumName : '全部',
				promoTypeEnumValue : 0,
				current:true	
			}]			
		},
		latelyList:{
			hidden: true,
			curSort:{
                dir:"0",
                name:"最近领取",
            },
			latelyData : [{
				name : '最近领取',
				dir : 0,
				current:true
			}, {
				name : '最近到期',
				dir : 1
			}]
		}
	},
	productLineOpenKey(){
		var applyList = this.data.applyList;
		applyList.hidden = !applyList.hidden;
		this.data.latelyList.hidden = true;
        this.setData(this.data);		
	},
	productLineTap(e){
		var dataset = e.currentTarget.dataset,
		_idx = dataset.index,
        applyList = this.data.applyList;
        applyList.data.forEach(function(v, k){v.current = false;})
        applyList.data[_idx].current=true;
        applyList.hidden = true;
        applyList.curSort.name = applyList.data[_idx].promoTypeEnumName;
        applyList.curSort.dir = dataset.value;
		this.data.requestData.userProductLineID = applyList.curSort.dir;
		this.data.requestData.startIndex = 1;
		this.data.scrollTop = 0;
        this.getCouponList();
        this.setData(this.data);
	},
	triggerSort(){
		var latelyList = this.data.latelyList;
		latelyList.hidden = !latelyList.hidden;
		this.data.applyList.hidden = true;
        this.setData(this.data);
	},
	handleSortTap(e){
		var dataset = e.currentTarget.dataset,
        _idx = dataset.index,
        latelyList = this.data.latelyList;
        latelyList.latelyData.forEach(function(v, k){v.current = false;})
        latelyList.latelyData[_idx].current=true;
        latelyList.hidden = true;
        latelyList.curSort.name = latelyList.latelyData[_idx].name;
        latelyList.curSort.dir = dataset.dir;
		this.data.requestData.orderingRule = latelyList.curSort.dir;
		this.data.requestData.startIndex = 1;
		this.data.scrollTop = 0;
        this.getCouponList();
        this.setData(this.data);		
	},
	loadMore(e){
		if (!this.data.loading && !this.data.loadall) {
			this.data.requestData.startIndex += 1;
			this.setData(this.data);
			this.getCouponList();
		}
	},
	onLoad(options){
		//优惠券列表页临时跳首页 -放开
		//this.homeAction();
		this.resetData();
		if(options.p){
			//设置请求参数 浮层数据在请求产线接口后设置
			this.data.requestData.userProductLineID = parseInt(options.p);
		}
		if(options.o){
			//设置请求参数 并设置过滤浮层数据
			this.data.requestData.orderingRule =  parseInt(options.o) > 1 ? 0 : parseInt(options.o);
			var latelyList = this.data.latelyList,_idx = parseInt(options.o) > 1 ? 0 : parseInt(options.o);
			latelyList.latelyData.forEach(function(v, k){
				v.current = false;
			})
			latelyList.latelyData[_idx].current=true;
			latelyList.hidden = true;
			latelyList.curSort.name = latelyList.latelyData[_idx].name;
			latelyList.curSort.dir = parseInt(options.o);
		}
		this.setData(this.data);
		if(!cwx.user.isLogin()) {
			cwx.user.login({
				callback: function(res){
					if(res && res.ReturnCode == 0){
						this.getProductLine(parseInt(options.p));
						this.getCouponList();
					}
				}
			})
		} else {
			this.getProductLine(parseInt(options.p));
			this.getCouponList();
		}		
	},
    resetData() {
        this.data = {
            loadall:false,
            scrollTop:0,
            requestData:{
                userProductLineID : 0,
                couponStatus : 0,
                orderingRule : 0,
                pageSize : 10,
                startIndex : 1        
            },
            productLine : [],
            loading: true,
            totalCount:0,
            list:[],
            applyList: {
                hidden: true,
                curSort:{
                    dir:"0",
                    name:"适用范围",
                },
                data:[{
                    promoTypeEnumName : '全部',
                    promoTypeEnumValue : 0,
                    current:true    
                }]            
            },
            latelyList:{
                hidden: true,
                curSort:{
                    dir:"0",
                    name:"最近领取",
                },
                latelyData : [{
                    name : '最近领取',
                    dir : 0,
                    current:true
                }, {
                    name : '最近到期',
                    dir : 1
                }]
            }
        };
    },
	useAction(e) {
		let index = e.currentTarget.dataset.index >> 0,
		promotionid = e.currentTarget.dataset.promotionid,
		item = this.data.list[index];
		if(item.useUrl.trim()){
			this.ubtTrace('mkt_promocode_index_useclick', {pageid:this.pageId,promotionid:promotionid,url:item.useUrl.trim(),channel:channelConfig[cwx.appId] && channelConfig[cwx.appId].channelName,appid:item.outAppletID || cwx.appId});
		}
	},
	h5Action(e) {
		var self = this;
		let index = e.currentTarget.dataset.index >> 0,
		promotionid = e.currentTarget.dataset.promotionid,
		item = this.data.list[index];
		if(item.useUrl.trim()){
			this.ubtTrace('mkt_promocode_index_useclick', {pageid:this.pageId,promotionid:promotionid,url:item.useUrl.trim(),channel:channelConfig[cwx.appId] && channelConfig[cwx.appId].channelName,appid:item.outAppletID || cwx.appId});
		}
		//h5 URL处理&跳转
		let h5Url = item.useUrl.trim();
		h5Url = h5Url.indexOf("#promoid#") > -1 ? h5Url.replace("#promoid#", "promoid=" + promotionid) : h5Url;
		h5Url = h5Url.replace(/[\u4e00-\u9fa5]+/g, function(str){return encodeURIComponent(str)});
		cwx.component.cwebview({
		  data: {
			url: encodeURIComponent(h5Url),
			needLogin: true
		  }
		})
	},
	//未配置地址，跳首页
	homeAction(e) {
		cwx.switchTab({
		  url: "/pages/home/homepage"
		});
	},
	bindSuccess() {console.log('success','独立小程序跳转成功');},
	//展开优惠券明细
	expandAction(e) {
		return;
		let index = e.currentTarget.dataset.index >> 0,
		item = this.data.list[index];
		item.allowOpen =!item.allowOpen;
		this.setData({
			list: this.data.list
		});
	},
	//defaultProductLine 默认传参产线
	getProductLine(defaultProductLine) {
		util.showLoading();
		var params = {};
		Model.GetProductLineModel(params,data =>{
			if(data && data.code == 0 && data.productLineList && data.productLineList.length){
        var productLineList = this.data.applyList.data.concat(data.productLineList);
				this.data.applyList.data = productLineList;
				//设置默认产线浮层数据
				if(defaultProductLine){
					var _idx = 0,applyList = this.data.applyList;
					applyList.data.forEach(function(v, k){
						v.current = false;
						if(defaultProductLine == v.promoTypeEnumValue){
							_idx = k;
						}
					})
					applyList.data[_idx].current=true;
					applyList.hidden = true;
					if(_idx){
						applyList.curSort.name = applyList.data[_idx].promoTypeEnumName;
						applyList.curSort.dir = defaultProductLine;			
					}
				}
				this.setData(this.data);
			} else {
				console.log(data);
			}
		},err =>{
			console.log(err);
		},() =>{
			util.hideLoading();
		});			
	},
	//分页获取优惠券列表
	getCouponList(clear) {
		var that = this,params = that.getQueryParam(clear);
		that.data.loading = true;
		that.data.loadall = false;
		that.setData(that.data);
		util.showLoading();
		Model.SelectUserCouponModel(params,data =>{
			that.data.totalCount = data.totalCount;
			if(data && data.code == 0 && data.myPromoCouponList){
				var list = params.startIndex === 1 ? [] : that.data.list;
				var ver = cwx.wxSystemInfo.SDKVersion;
				_.each(data.myPromoCouponList, function(item){
					var listitem = {
						couponCode : item.couponCode,
						couponAvailableAmount:item.couponAvailableAmount,
						promotionID: item.promotionID ? item.promotionID : '',
						displayName: item.displayName,
						appLimit: item.appLimit,
						shortName: item.shortName,
						shortRemark: item.shortRemark,
						remark: item.remark,
						remarkHtml:util.formatRemarkHtml(item.remark,item.remarkTmpl),
						userProductLineIDs: item.userProductLineIDs ? item.userProductLineIDs : '',
						userProductLineIDsName: item.userProductLineIDsName,
						startDate: util.formatDateString(item.startDate),
						disableDate: util.formatDateString(item.disableDate),
						sceneType : item.sceneType,
						isExpiring:util.isExpiring(item.disableDate),
						discountRule: util.formatDiscountRule(item),
						FullReductionHtml: item,
						goH5:false
					}
					//由于wxml不支持toString转换 因此将 小数点获取 计算放在js中
					if(listitem.discountRule.price){
						var separationNum = listitem.discountRule.price.toString().split('.');
						listitem.decimal = separationNum[1] ? '.'+separationNum[1] : ''; 	
					}else{
						listitem.decimal = '';
					}
					//折扣上限
					var itemLimit = listitem.discountRule.deductionAmountLimit;
					listitem.deductionAmountLimit = itemLimit && util.isPositiveInteger(itemLimit) ? itemLimit : '';
					//券状态样式
					listitem.couponStatusClass = util.getCouponStatusClass(item);
					//券状态图标
					listitem.statusClass = util.getStatusClass(listitem,listitem.couponStatusClass);
					listitem.em = util.getEm(listitem.discountRule,listitem.deductionAmountLimit);
					listitem.fontClass = util.getFontClass(listitem.discountRule);
					var url='',id='';
					if(util.isWechat()){
						url = item.weChatAppletUrl ? item.weChatAppletUrl : '';
						id = item.weChatAppletID ? item.weChatAppletID : '';
					} else if (util.isBaidu()) {
						url = item.baiduUrl ? item.baiduUrl : '';
						id = item.baiduID ? item.baiduID : '';
					} else if (util.isAlipay()) {
						url = item.alipayUrl ? item.alipayUrl : '';
						id = item.alipayID ? item.alipayID : '';
                    } else if (util.isByteDance()) {
                        url = item.byteDanceUrl ? item.byteDanceUrl : '';
                        id = item.byteDanceID ? item.byteDanceID : '';
					}
					listitem.useUrl = url;
					listitem.outAppletID = id;
					//设置默认跳转数据
					listitem.navigatorData = {
						target:'self',
						url:'',
						openType:'navigate',
						appid:'',
						path:'',
						extraData:{},
					}
					if(listitem.useUrl.trim()){
						listitem.canGo = true;
						//非独立小程序跳转
						if(!listitem.outAppletID){
							//H5地址 必须http开头
							if(listitem.useUrl.trim().toLowerCase().indexOf('http') == 0){
								if(cwx.canIUse('web-view')){
									listitem.goH5 = true;
								}else{
									listitem.canGo = false;	
								}
							}else{
								//默认内部小程序地址跳转
								listitem.navigatorData.url = listitem.useUrl.trim() + '?promoid=' + listitem.promotionID;
								listitem.navigatorData.openType = 'navigate';	
							}
						}else{
							//独立小程序跳转
							if(util.compareVersion(ver, '2.0.7') > 0){
								listitem.navigatorData.target = 'miniProgram';
								listitem.navigatorData.appid = listitem.outAppletID
								listitem.navigatorData.path = listitem.useUrl.trim()
								listitem.navigatorData.extraData = {promoid: listitem.promotionID}
							}else{
								listitem.canGo = false;
							}
						}
					}else{
						listitem.canGo = false;
					}
					list.push(listitem);
				});
				that.data.list = list;
			} else {
				console.log(data);
			}
		},err =>{
			console.log(err);
		},() =>{
			if(that.data.list.length >= that.data.totalCount){that.data.loadall = true;}
			that.setData(that.data);
			that.data.loading = false;
			that.setData(that.data);
			util.hideLoading();
		});			
	},
	getQueryParam(clear) {
		if(clear){
			let params = {
				userProductLineID : 0,
				couponStatus : 0,
				orderingRule : 0,
				pageSize : 10,
				startIndex : 1	
			};
			if(util.isWechat()){
				params.useStations = [150];	
			}
			return params;	
		}else {
			if(util.isWechat()){
				this.data.requestData.useStations = [150];	
			}
			this.setData(this.data);
			return  this.data.requestData;
		}
	},
	goExchange(){
		this.navigateTo({
			url:'../collect/collect'
		})
	},
	onShareAppMessage() {
		return {
		  title: '携程优惠券',
		  desc: '好券在手，说省就省！',
		  path: 'pages/market/promocode/index/index'
		}
	}
})