import {
	cwx,
	CPage,
	__global
} from '../../../../../cwx/cwx.js';
/*页面场景值获取所需js*/
import  commonUtil from "../../../common/common.js"
import utils from "../../../../../cwx/ext/util.js"
import _ubt from "../../../../../cwx/cpage/ubt_wx.js";
// import { getBannerData, getSquareData, getTrainData, getHotelData, getStrategyData, getGowhereData, getThemeData, getWaterfallData} from "../common/data/mockup_data.js"
import { getDistrictPageData,relatedRecommend,getRankingModule,getRankingModuleDetail  } from '../../service/request';
let useMockUpData = false;
let moduleListToTop = [];
Component({
	properties: {
		options:{
			type: Object,
			value: {}
		},
		pageId : {
			type: String,
			value: ""
		}
	},
	data: {
		hrefId : "",
		optionHrefId : "",
		iphonexFlag: false,
		bannerData: useMockUpData ? getBannerData() : null, //banner头模块数据
		squareData: useMockUpData ? getSquareData() : null, //九宫格模块数据
		trainData: useMockUpData ? getTrainData() : null, //火车票入口数据
		hotelData: useMockUpData ? getHotelData() : null, //酒店入口数据
		localGuideData:null,	//当地指南模块
		weatherData:null,	//天气
		strategyData: useMockUpData ? getStrategyData() : null, //口袋攻略书入口数据
		gowhereData: useMockUpData ? getGowhereData() : null, //去哪儿玩模块数据
		specialFoods: useMockUpData ? getSpecialFoods() : null, //特色菜模块数据
		themeData: useMockUpData ? getThemeData() : null, //特色主题模块数据
		routeData:null,	//行程路线模块
		askData:null,	//问答模块
		foodData: useMockUpData ? getFoodData() : null, //笔记瀑布流模块数据
		lat: 0, //请求目的地数据接口所需参数lat，默认是0
		lon: 0, //请求目的地数据接口所需参数lon，默认是0
		viewDistrictId: 0, //请求目的地数据接口所需参数viewDistrictId，默认是0
		fromDistrictId: 0, //请求目的地数据接口所需参数fromDistrictId，默认是0
		userLocationId: 0, //用户定位地Id，通过定位获取
		isCrhPage: 0, //用于判断页面是否是高铁游目的地页
		searchLoad: true,
		animation:'',
		pageLoad : false,
		playLiveEatList : null,
		compassGuideModuleV2 : null,
		// *** 榜单聚合 ***
		// listCompData:{
		// 	currentTagOne:0,
		// 	currentTagTwo:0,
		// 	currentTagThree:0,
		// 	listTwoData:[{title:'芒果糯米饭',up:'8630',imageUrl:'https://pages.c-ctrip.com/you/component-local/default.png',recommend:'39家餐厅推荐',desc:'在泰国芒果和糯米上淋一层浓香椰浆,在泰国芒果和糯米上淋一层浓香椰浆,在泰国芒果和糯米上淋一层浓香椰浆浓香椰浆浓香椰浆浓香椰浆浓香椰浆'},{title:'冬阴功汤',up:'8630',imageUrl:'',recommend:'15家餐厅推荐',desc:'在泰国芒果和糯米上淋一层浓香椰浆,在泰国芒果和糯米上淋一层浓香椰浆,在泰国芒果和糯米上淋一层浓香椰浆'},{title:'芒果糯米饭',up:'8630',imageUrl:'',recommend:'15家餐厅推荐',desc:'在泰国芒果和糯米上淋一层浓香椰浆,在泰国芒果和糯米上淋一层浓香椰浆,在泰国芒果和糯米上淋一层浓香椰浆'},{title:'芒果糯米饭',up:'8630',imageUrl:'',recommend:'15家餐厅推荐',desc:'在泰国芒果和糯米上淋一层浓香椰浆,在泰国芒果和糯米上淋一层浓香椰浆,在泰国芒果和糯米上淋一层浓香椰浆'},{title:'芒果糯米饭',up:'8630',imageUrl:'',recommend:'15家餐厅推荐',desc:'在泰国芒果和糯米上淋一层浓香椰浆,在泰国芒果和糯米上淋一层浓香椰浆,在泰国芒果和糯米上淋一层浓香椰浆'}],
		// },
		listCompData: null,
		// ********

		relevantList: [],  //相关笔记
		listOffsetTop: 0,   //相关笔记距离顶部的距离
		waterfallLeftList: [],   //瀑布流左列
		waterfallRightList: [],  //瀑布流右列
		showDetail: false,   //有基础信息显示页面，没有显示空页面
		showRelevantList: true,  //是否隐藏相关笔记模块
		showHeaderTop: 0, //自定义导航栏之后，头部需要距离顶部一定的距离
		showLoading:false, //瀑布流loading
		totalCount:0,
		windowHei:0,

		pagePara:{
			pageIndex:1,
			pageSize:10,
			sortDirection:0,
			sortType:9
		},
		siteObj : null,
		adWidth:utils.systemInfo.windowWidth*694/750,
		adHeight:utils.systemInfo.windowWidth*111/750,
		adWidth2:utils.systemInfo.windowWidth*0.16,
		adWidth3 : utils.systemInfo.windowWidth*(341 / 750 ),
		isHasAd : false
	},
	windowHei: 0, //界面的高度
	shareTitle: '', //分享的标题
	shareImage: '', //分享的图片
	_animation : '',
	_animationIndex : 0,
	_animationIntervalId :0,
	/*
		生命周期函数
  	*/
	attached: function () {
		let self = this;
		const {options} = this.data;
		cwx.getSystemInfo({
			success({windowHeight}) {
				console.log('windowsheight',windowHeight);
				self.windowHei = windowHeight;
				self.setData({
					windowHei:windowHeight
				})
			}
		});
		console.log("page ---onLoad---",options);
		console.log('_global',__global);
		if (options.districtId) {
			self.setData({
				viewDistrictId: parseInt(options.districtId, 10)
			})
		}
		if (options.viewDistrictId) {
			self.setData({
				viewDistrictId: parseInt(options.viewDistrictId, 10)
			})
		}
		else{
			console.log('pagenooption',self.viewDistrictId);
		}
		if (options.fromDistrictId) {
			self.setData({
				fromDistrictId: parseInt(options.fromDistrictId, 10)
			})
		}
		if (options.isCrhPage){
			// self.pageId = '10650009667';
			self.setData({
				isCrhPage: 1
			})
		}else{
			// self.pageId = '10650008566';
		}
		if(options.hrefId){
			self.setData({
				optionHrefId: options.hrefId && options.hrefId.replace(/(^\s*)|(\s*$)/g,"") || ""
			})
		}
		console.log('cwx.getCurrentPage()',cwx.getCurrentPage());
		self.getIphoneFlag(); //判断当前手机是否是iphonex
		self.getInitData();
	},
	ready: function () {



	},
	methods :{
		searchLoad : function(viewDistrictId,fromSearch){
			let self = this;
			console.log("page ---onShow---");
			console.log(self.data.viewDistrictId,self.data.fromDistrictId);
			console.log("fromSearch",fromSearch)
			if (fromSearch && self.data.searchLoad) {
				console.log('fromSearch');
				self.setData({
					searchLoad: false,
					viewDistrictId : viewDistrictId || 0,
					relevantList: [],
					totalCount:0,
					pagePara:{
						pageIndex:1,
						pageSize:10,
						sortDirection:0,
						sortType:9
					},
				},function(){
					self.getInitData();
				})
			}

			self._animation = cwx.createAnimation({
				duration: 500,
				timingFunction: 'linear',
				delay: 0,
				transformOrigin: '50% 50% 0'
			})
		},
		rotateAni:function(n){
			this._animation.rotate(120 * (n)).step();
			this.setData({
				animation: this._animation.export()
			})
		},
		getWXAdData : function(e){
			this.setData({
				isHasAd :e.detail && e.detail && e.detail.adData.length > 0 || false
			})
		},
		startAnimationInterval:function(){
			let self = this;
			self.rotateAni(++self._animationIndex);
			self._animationIntervalId = setInterval(function(){
				self.rotateAni(++self._animationIndex);
			},500);
		},
		stopAnimationInterval:function(){
			let self = this;
			if (self._animationIntervalId> 0) {
				clearInterval(self._animationIntervalId);
				self._animationIntervalId = 0;
			}
		},
		onHide: function () {
			let self = this;
			console.log("page ---onHide---");
		},
		onUnload: function () {
			let self = this;
			console.log("page ---onUnload---");
		},
		onPageScroll: function (e) {
			let self = this;
			// console.log("page ---onPageScroll---",e);
			for (let i = 0; i < moduleListToTop.length; i++) {
				if ( e.scrollTop > moduleListToTop[i].moduleTop - self.windowHei) {
					moduleListToTop[i].moduleIsShow = true;
				}
			}
			self.destinationViewUbt();
		},
		// 初始请求数据
		getInitData:function (){
			console.log("page ---getInitData---");
			let self = this;
			cwx.showLoading({
				title: '城市数据加载中',
				mask: true
			});
			if (self.data.isCrhPage) {  //如果参数中的isCrhPage为1说明是高铁游目的地页
				self.getInterfaceData();
			}else{  //如果参数中没有isCrhPage说明是普通目的地页
				/*if (self.data.viewDistrictId) { //判断参数中是否给浏览地id，有的话传给后端，没有的话去定位
                    self.getInterfaceData();
                    console.log('来自tab')
                }else{*/
				self.getUserLocation(function(){
					self.getInterfaceData();  //页面获取到定位之后，根据获取的经纬度去请求数据接口
					console.log('来自tab并且请求定位')
				});
				/*	}*/
			}
		},
		//分享功能
		onShareMessage: function (res) {
			console.log("page ---onShareAppMessage---");
			let self = this;

			//点击分享时埋一个tracelog埋点
			let ubtLocationId = self.data.userLocationId; //定位城市id
			let ubtDistrictId = self.data.viewDistrictId; //当前浏览目的地id
			let ubtChufaId = self.data.fromDistrictId; //当前用户定位id
			_ubt.ubtTrace(102403, {
				'pageId': self.data.pageId,
				'actioncode':'c_share',
				'locationGlobalID': ubtLocationId,
				'departid': ubtChufaId,
				'districtid': ubtDistrictId,
			});
			self.setUbt("115303","gs_dst_home_Click_share","click",{});
			let title = self.shareTitle;
			let image = self.shareImage;

			let viewId = self.data.viewDistrictId;
			let fromId = self.data.fromDistrictId;
			let isCrhPage = self.data.isCrhPage;

			let url;

			if (isCrhPage) {
				url = 'pages/you/destinationpage/destinationpage?isCrhPage=' + isCrhPage + '&viewDistrictId=' + viewId + '&fromDistrictId=' + fromId;
			}else{
				url = 'pages/you/destinationpage/destinationpage?viewDistrictId=' + viewId;
			}

			return ({
				image: image,
				title: title,
				url: url,
			});
		},
		/*
            页面逻辑函数
          */
		//获取页面中每个模块距离页面顶部的距离
		searchScrollEleTop: function (callback) {
			let self = this;
			console.log('logic ---searchScrollEleTop---');
			moduleListToTop = [];
			cwx.createSelectorQuery().selectAll('.destination-section').boundingClientRect(function (rects) {
				if(rects){
					rects.forEach(function (rect) {
						let moduleStr = {
							moduleTop: rect.top,
							moduleName: rect.dataset.modulename,
							moduleIsShow: false,
							moduleHasView: false
						}
						moduleListToTop.push(moduleStr);
					})
				}

			}).exec(function(){
				console.log('moduleListToTop',moduleListToTop);
				return callback && callback();
			});
		},
		//用户一进入页面没有拖动页面时判断在可视区域内的元素
		getIsInsight: function () {
			let self = this;
			console.log('logic ---getIsInsight---');
			for (let i = 0; i < moduleListToTop.length; i++) {
				if (moduleListToTop[i].moduleTop < self.windowHei) {
					moduleListToTop[i].moduleIsShow = true;
				}
			}
			self.destinationViewUbt();
		},
		//判断当前手机型号是否是iPhone X
		getIphoneFlag: function() {
			let self = this;
			console.log('logic ---getIphoneFlag---');
			console.log('isIphoneX',commonUtil.isIphoneX());
			if (commonUtil.isIphoneX()) {
				self.setData({
					iphonexFlag: true
				})
			}else{
				self.setData({
					iphonexFlag: false
				})
			}
		},
		getSiteType:function(type){
			let siteType = "";
			switch(type){
				case 0:
					siteType = "";
					break;
				case 1:
					siteType = "POICOUNTRY";
					break;
				case 2:
					siteType = "POIPROVINCE";
					break;
				case 3:
					siteType = "POICITY";
					break;
				case 4:
					siteType = "POISCENIC";
					break;
				case 5:
					siteType = "POILOCATION";
					break;
				case 6:
					siteType = "POITRADINGAREA";
					break;
				case 7:
					siteType = "POITOWN";
					break;
				default:
					siteType = "";
					break;

			}
			return siteType
		},
		//获取定位之后根据获取到的经纬度和页面传参请求getDistrictPageData接口
		getInterfaceData: function(callback){
			let self = this;
			// console.log('logic ---getInterfaceData---');

			// let districtParam;
			// if (self.data.isCrhPage) {
			// 	districtParam = {
			// 		"lat":self.data.lat,
			// 	    "lon":self.data.lon,
			// 	    "viewDistrictId":self.data.viewDistrictId,
			// 	    "fromDistrictId":self.data.fromDistrictId,
			// 			'type': 'CRH',
			// 			'customVersion':0, //version flag
			// 			"userCurrentDistrictId":0,
			// 			// head:{
			// 			// 	'cver':'8.10'
			// 			// }
			// 	}
			// }else{
			// 	districtParam = {
			// 		"lat":self.data.lat,
			// 	    "lon":self.data.lon,
			// 	    "viewDistrictId":self.data.viewDistrictId,
			// 	    "fromDistrictId":self.data.fromDistrictId,
			// 			'type': 'normal',
			// 			'customVersion':0, //version flag
			// 			"userCurrentDistrictId":0,
			// 			// head:{
			// 			// 	'cver':'8.10'
			// 			// }
			// 	}
			// }

			// getDistrictPageData(districtParam, function (res) {
			//   	if (res.statusCode === 200 && res.data) {
			//     let result;
			//     if (res.data.responseStatus) {
			//       result = res.data.responseStatus.ack;
			//     } else if (res.data.ResponseStatus) {
			//       result = res.data.ResponseStatus.Ack;
			//     }
			//   		if (result==="Success") {
			//   			let getData = res.data;
			// 		    console.log('logic ---getInterfaceDataGetData---',getData);
			// 		    console.log('squareLen',getData.entries.length);
			// 			if(!!getData.ranking && !!getData.ranking.detail){
			// 				// console.log('====================================');
			// 				// console.log(JSON.parse(getData.ranking.detail.mixTemplateData));
			// 				// console.log(JSON.parse(JSON.parse(getData.ranking.detail.mixTemplateData).templateData));
			// 				// console.log('====================================');
			// 			}
			//   		}else{
			//   		}
			//     }else{
			//     };
			// });


			// 与APP同步接口
			let _param = {
				'data':JSON.stringify({
					'districtId': self.data.viewDistrictId,
					'locatedDistrictId': self.data.userLocationId,
					"departDistrictId":self.data.userLocationId,
					'location':(!self.data.lat && !self.data.lon) ? {} : {
						'latitude': self.data.lat,
						'longitude': self.data.lon
					},
				}),
				'serviceName': "DestinationCoreService.getDestEntrance"
			}
			console.log('**********请求参数:',_param);
			const {optionHrefId} = self.data;
			cwx.request({
				url: '/restapi/soa2/17916/json/invokeOnDemand',
				data: _param,
				success: res => {
					// console.log(res);
					if (res.statusCode === 200 && res.data) {
						let result;
						if (res.data.responseStatus) {
							result = res.data.responseStatus.ack;
						} else if (res.data.ResponseStatus) {
							result = res.data.ResponseStatus.Ack;
						}
						if (result==="Success") {
							let getData = JSON.parse(res.data.data);
							self.setData({
								routeData:null,
								strategyData:null,
								squareData:null,
								askData:null,
								localGuideData:null,
								weatherData:null,
								siteObj : null,
								playLiveEatList : null,
								compassGuideModuleV2 : null
							},function () {
								console.log('logic ---getDistrictPageGetData---',getData);
								getData = getData.destPage || {};
								let _districtType = "",_districtId = "";
								if(!!getData.head && !!getData.head.district ){
									_districtType = getData.head.district.districtType;
									_districtId = getData.head.district.districtId;
								}
								self.setData({
									residentId : !!getData.head && !!getData.head.residentDistrictId ? getData.head.residentDistrictId : null,
									bannerData: {
										districtInfo: !!getData.head && !!getData.head.district ? getData.head.district : null,
									},
									siteObj :{
										siteId : _districtId ||  null,
										siteType : self.getSiteType(_districtType || null),
									},
									viewDistrictId : _districtId ||  null,
								})

								/*getData.templateList.push( {
									"type": 32,
									"moduleType": "compassGuideV2",
									"compassGuideModuleV2": {
										"titleImage": {
											"url": "https://dimg04.c-ctrip.com/images/0105i1200095km78235C5.png",
											"width": 250,
											"height": 40
										},
										"subTitle": "已帮助175.6w位想去的人",
										"rankingDetail": {
											"rankList": [
												{
													"id": 100700000010,
													"name": "特色展馆推荐1",
													"type": "ranking",
													"icon": "https://dimg04.c-ctrip.com/images/0100n1200095l651v7D70.png",
													"imageUrl": "https://dimg.uat.qa.nt.ctripcorp.com/images/0101y12000004ru1fC32E_D_343_180.webp",
													"jumpUrl": "ctrip://wireless/h5?path=cranking&page=index.html#/cranking/crankingCity/100700000010.html&ishideheader=true&isHideNavBar=YES",
													"itemList": [
														{
															"id": 1094352,
															"rankingNo": 1,
															"name": "EPSON teamLab 无界美术馆",
															"commentScore": "",
															"commentCount": ""
														},
														{
															"id": 1094355,
															"rankingNo": 2,
															"name": "上海大自然野生昆虫馆",
															"commentScore": "",
															"commentCount": ""
														},
														{
															"id": 1094360,
															"rankingNo": 3,
															"name": "浦东美术馆",
															"commentScore": "",
															"commentCount": ""
														}
													]
												},
												{
													"id": 100001406061,
													"name": "亲子景点推荐",
													"type": "ranking",
													"icon": "https://dimg04.c-ctrip.com/images/0100n1200095l651v7D70.png",
													"imageUrl": "https://dimg.uat.qa.nt.ctripcorp.com/images/0105612000004q5ap2AA8_D_343_180.jpg",
													"jumpUrl": "ctrip://wireless/h5?path=cranking&page=index.html#/cranking/crankingCity/100001406061.html&ishideheader=true&isHideNavBar=YES",
													"itemList": [
														{
															"id": 1094215,
															"rankingNo": 1,
															"name": "东方明珠",
															"imageUrl": "https://dimg.uat.qa.nt.ctripcorp.com/images/0106m12000004wk1x987E_D_72_72.jpg",
															"commentScore": "4.7分",
															"commentCount": "32条点评"
														},
														{
															"id": 1094216,
															"rankingNo": 2,
															"name": "上海野生动物园",
															"imageUrl": "https://dimg.uat.qa.nt.ctripcorp.com/images/0102112000004uo5dAF19_D_72_72.jpg",
															"commentScore": "4.2分",
															"commentCount": "18条点评"
														},
														{
															"id": 1094218,
															"rankingNo": 3,
															"name": "锦江乐园",
															"imageUrl": "https://dimg.uat.qa.nt.ctripcorp.com/images/0101412000004uo54A649_D_72_72.jpg",
															"commentScore": "4.3分",
															"commentCount": "4条点评"
														}
													]
												},
												{
													"id": 100700000008,
													"name": "10大亲子景点推荐",
													"type": "ranking",
													"icon": "https://dimg04.c-ctrip.com/images/0100n1200095l651v7D70.png",
													"imageUrl": "https://dimg.uat.qa.nt.ctripcorp.com/images/0106t12000004rain0848_D_343_180.jpg",
													"jumpUrl": "ctrip://wireless/h5?path=cranking&page=index.html#/cranking/crankingCity/100700000008.html&ishideheader=true&isHideNavBar=YES",
													"itemList": [
														{
															"id": 1094331,
															"rankingNo": 1,
															"name": "外滩",
															"imageUrl": "https://dimg.uat.qa.nt.ctripcorp.com/images/0105912000004g4i3022D_D_72_72.jpg",
															"commentScore": "4.4分",
															"commentCount": "13条点评"
														},
														{
															"id": 1094345,
															"rankingNo": 2,
															"name": "齐民市集(衡山路店)",
															"commentScore": "4.7分",
															"commentCount": "55条点评"
														},
														{
															"id": 1094341,
															"rankingNo": 3,
															"name": "上海迪士尼度假区",
															"imageUrl": "https://dimg.uat.qa.nt.ctripcorp.com/images/0105v12000004td8rFD02_D_72_72.png",
															"commentScore": "4.5分",
															"commentCount": "154条点评"
														}
													]
												},
												{
													"id": 100001405836,
													"name": "10大网红人气酒店榜",
													"type": "ranking",
													"icon": "https://dimg04.c-ctrip.com/images/0100n1200095l651v7D70.png",
													"imageUrl": "https://dimg.uat.qa.nt.ctripcorp.com/images/0105612000004q5ap2AA8_D_343_180.jpg",
													"jumpUrl": "ctrip://wireless/h5?path=cranking&page=index.html#/cranking/crankingCity/100001405836.html&ishideheader=true&isHideNavBar=YES",
													"itemList": [
														{
															"id": 1081308,
															"rankingNo": 1,
															"name": "上海中航虹桥机场泊悦酒店<中国国际航空公司>--NEW",
															"commentScore": "",
															"commentCount": ""
														},
														{
															"id": 1068409,
															"rankingNo": 2,
															"name": "上海外滩W酒店",
															"commentScore": "",
															"commentCount": ""
														},
														{
															"id": 1068404,
															"rankingNo": 3,
															"name": "上海迪士尼乐园酒店",
															"commentScore": "",
															"commentCount": ""
														}
													]
												},
												{
													"id": 100001405954,
													"name": "6大小而美酒店榜",
													"type": "ranking",
													"icon": "https://dimg04.c-ctrip.com/images/0100n1200095l651v7D70.png",
													"imageUrl": "https://dimg.uat.qa.nt.ctripcorp.com/images/0106812000004rtyuEE8D_D_343_180.webp",
													"jumpUrl": "ctrip://wireless/h5?path=cranking&page=index.html#/cranking/crankingCity/100001405954.html&ishideheader=true&isHideNavBar=YES",
													"itemList": [
														{
															"id": 1068147,
															"rankingNo": 1,
															"name": "上海云峰大饭店",
															"commentScore": "",
															"commentCount": ""
														},
														{
															"id": 1068148,
															"rankingNo": 2,
															"name": "上海中星君亭酒店",
															"imageUrl": "https://dimg04.c-ctrip.com/images/0206g1200000bcmw55F82_D_72_72.jpg",
															"commentScore": "",
															"commentCount": ""
														},
														{
															"id": 1068150,
															"rankingNo": 3,
															"name": "维也纳酒店(上海浦东机场店)",
															"commentScore": "",
															"commentCount": ""
														}
													]
												}
											]
										},
										"guideDetail": {
											"more": {
												"text": "查看全部",
												"icon": "https://dimg02.c-ctrip.com/images/10070z000000nwz3pA4F0.png",
												"url": "https://m.uat.qa.nt.ctripcorp.com/webapp/you/gsdestination/destination/guideList.html?districtId=2&sourcePageType=4&ishidenavbar=yes"
											},
											"guideList": [
												{
													"id": 126187,
													"title": "经典路线",
													"subTitle": "行程推荐-通用副标题",
													"imageUrl": "https://dimg04.c-ctrip.com/images/0106c120009jldodgE9E4_R_460_10000.jpg",
													"jumpUrl": "https://m.uat.qa.nt.ctripcorp.com/webapp/you/gsdestination/destination/guideDetail.html?districtId=2&catalogId=126187&ishidenavbar=yes",
													"authorCount": 1,
													"authorList": [
														{
															"avatar": "https://dimg.uat.qa.nt.ctripcorp.com/images/100h1b00000004gjh1B65.png",
															"name": "携程攻略专家",
															"level": "",
															"vIcon": "https://dimg04.c-ctrip.com/images/0104h1200082xuj970D87.png"
														}
													]
												},
												{
													"id": 125946,
													"title": "上海必体验",
													"subTitle": "第一次 打卡地 必玩",
													"imageUrl": "https://dimg04.c-ctrip.com/images/0106c120009jldodgE9E4_R_460_10000.jpg",
													"jumpUrl": "https://m.uat.qa.nt.ctripcorp.com/webapp/you/gsdestination/destination/guideDetail.html?districtId=2&catalogId=125946&ishidenavbar=yes",
													"tag": {
														"url": "https://dimg04.c-ctrip.com/images/0101g1200095nir1t2A1F.png",
														"width": 90,
														"height": 48
													},
													"authorCount": 1,
													"authorList": [
														{
															"avatar": "https://dimg.uat.qa.nt.ctripcorp.com/images/100h1b00000004gjh1B65.png",
															"name": "携程攻略专家",
															"level": "",
															"vIcon": "https://dimg04.c-ctrip.com/images/0104h1200082xuj970D87.png"
														}
													]
												},
												{
													"id": 121916,
													"title": "住宿指南",
													"subTitle": "位置 星级 性价比",
													"imageUrl": "https://dimg04.c-ctrip.com/images/0106c120009jldodgE9E4_R_460_10000.jpg",
													"jumpUrl": "https://m.uat.qa.nt.ctripcorp.com/webapp/you/gsdestination/destination/guideDetail.html?districtId=2&catalogId=121916&ishidenavbar=yes",
													"authorCount": 1,
													"authorList": [
														{
															"avatar": "https://dimg.uat.qa.nt.ctripcorp.com/images/100h1b00000004gjh1B65.png",
															"name": "携程攻略专家",
															"level": "",
															"vIcon": "https://dimg04.c-ctrip.com/images/0104h1200082xuj970D87.png"
														}
													]
												},
												{
													"id": 121966,
													"title": "上海特色美食",
													"subTitle": "本帮菜 舌尖上的上海",
													"imageUrl": "https://dimg04.c-ctrip.com/images/0106c120009jldodgE9E4_R_460_10000.jpg",
													"jumpUrl": "https://m.uat.qa.nt.ctripcorp.com/webapp/you/gsdestination/destination/guideDetail.html?districtId=2&catalogId=121966&ishidenavbar=yes",
													"authorCount": 1,
													"authorList": [
														{
															"avatar": "https://dimg.uat.qa.nt.ctripcorp.com/images/100h1b00000004gjh1B65.png",
															"name": "携程攻略专家",
															"level": "",
															"vIcon": "https://dimg04.c-ctrip.com/images/0104h1200082xuj970D87.png"
														}
													]
												},
												{
													"id": 126149,
													"title": "上海周边游",
													"subTitle": "小众趣处 轻松户外游",
													"imageUrl": "https://dimg04.c-ctrip.com/images/0106c120009jldodgE9E4_R_460_10000.jpg",
													"jumpUrl": "https://m.ctrip.com/webapp/you/gsdestination/destination/guideList.html?bookId=2464&ishidenavbar=yes&from_native_page=1&scene=znzgl",
													"authorCount": 1,
													"authorList": [
														{
															"avatar": "https://dimg.uat.qa.nt.ctripcorp.com/images/100h1b00000004gjh1B65.png",
															"name": "携程攻略专家",
															"level": "",
															"vIcon": "https://dimg04.c-ctrip.com/images/0104h1200082xuj970D87.png"
														}
													]
												},
												{
													"id": 125948,
													"title": "人气网红地",
													"subTitle": "文艺马路 博物馆美术馆 露营地",
													"imageUrl": "https://dimg04.c-ctrip.com/images/0106c120009jldodgE9E4_R_460_10000.jpg",
													"jumpUrl": "https://m.uat.qa.nt.ctripcorp.com/webapp/you/gsdestination/destination/guideDetail.html?districtId=2&catalogId=125948&ishidenavbar=yes",
													"authorCount": 1,
													"authorList": [
														{
															"avatar": "https://dimg.uat.qa.nt.ctripcorp.com/images/100h1b00000004gjh1B65.png",
															"name": "携程攻略专家",
															"level": "",
															"vIcon": "https://dimg04.c-ctrip.com/images/0104h1200082xuj970D87.png"
														}
													]
												},
												{
													"id": 121962,
													"title": "上海特色点心",
													"subTitle": "生煎 锅贴 老字号",
													"imageUrl": "https://dimg04.c-ctrip.com/images/0106c120009jldodgE9E4_R_460_10000.jpg",
													"jumpUrl": "https://m.uat.qa.nt.ctripcorp.com/webapp/you/gsdestination/destination/guideDetail.html?districtId=2&catalogId=121962&ishidenavbar=yes",
													"tag": {
														"url": "https://dimg04.c-ctrip.com/images/0100c1200095nhlyn872A.png",
														"width": 90,
														"height": 48
													},
													"authorCount": 1,
													"authorList": [
														{
															"avatar": "https://dimg.uat.qa.nt.ctripcorp.com/images/100h1b00000004gjh1B65.png",
															"name": "携程攻略专家",
															"level": "",
															"vIcon": "https://dimg04.c-ctrip.com/images/0104h1200082xuj970D87.png"
														}
													]
												},
												{
													"id": 126150,
													"title": "当季最好玩",
													"subTitle": "水上乐园 亲子必去",
													"imageUrl": "https://dimg04.c-ctrip.com/images/0106c120009jldodgE9E4_R_460_10000.jpg",
													"jumpUrl": "https://m.uat.qa.nt.ctripcorp.com/webapp/you/gsdestination/destination/guideDetail.html?districtId=2&catalogId=126150&ishidenavbar=yes",
													"authorCount": 1,
													"authorList": [
														{
															"avatar": "https://dimg.uat.qa.nt.ctripcorp.com/images/100h1b00000004gjh1B65.png",
															"name": "携程攻略专家",
															"level": "",
															"vIcon": "https://dimg04.c-ctrip.com/images/0104h1200082xuj970D87.png"
														}
													]
												}
											]
										},
										"browsUserAvatarList": [
											"https://youimg1.c-ctrip.com/target/Z80p180000013uw9yF21F.jpg",
											"https://youimg1.c-ctrip.com/target/Z80p180000013uw9yF21F.jpg",
											"https://youimg1.c-ctrip.com/target/Z80o180000013ulo9C34A.jpg",
											"https://youimg1.c-ctrip.com/target/t1/headphoto/258/512/704/6bce7506eecc48f8a4a6d3177e0acf24.jpg"
										]
									}
								})*/
								if(getData.templateList && getData.templateList.length > 0){
									getData.templateList.forEach((temp)=>{

										if(temp.moduleType == "destHead"){
											let _districtType = "",_districtId = "";
											if(!!temp.headModule && !!temp.headModule.district){
												_districtType = temp.headModule.district.districtType;
												_districtId = temp.headModule.district.districtId;
											}
											self.setData({
												siteObj :{
													siteId : _districtId ||  null,
													siteType : self.getSiteType(_districtType || null),
												}
											})
										}
										// Banner
										if(temp.moduleType == "weather"){
											self.setData({
												bannerData: {
													districtInfo: !!getData.head && !!getData.head.district ? getData.head.district : null,
													weatherInfo: temp.weatherInfo,
												}
											})
										}
										// 天气
										if(temp.moduleType == "weather" && !!temp.weatherInfo){
											self.setData({
												weatherData:temp
											})
										}
										// 宫格
										if(temp.moduleType == "entries" && !!temp.template1){
											self.setData({
												squareData: {
													list: temp.template1.itemList,
													indicatorDots: (temp.template1.itemList.length > 5) ? true : false,  //swiper参数配置
													autoplay: false,  //swiper参数配置是否自动播放
													displayitem: 1,  //swiper参数配置
													vertical: false,  //swiper参数配置
													circular: false,  //swiper参数配置
													interval: 2000,  //swiper参数配置
													duration: 500,  //swiper参数配置
													previousMargin: 0,  //swiper参数配置
													nextMargin: 0,  //swiper参数配置
													indicatorColor: 'rgba(0,0,0,.14)',  //swiper参数配置指示点颜色
													indicatorActiveColor: 'rgba(0,0,0,.5)',  //swiper参数配置当前选中的指示点颜色
													current: 0
												}
											})
										}
										// 当地指南
										if (temp.moduleType == "compassGuideV2") {
											const obj = temp.compassGuideModuleV2  || {};
											const {guideDetail} = obj;
											if(!!guideDetail && guideDetail.guideList.length > 1){
												const {guideList} = guideDetail;
												const guideListBig = [];
												const guideListSmall = [];
												for(let i = 0 ; i < guideList.length ; i++){
													if(i === 0 || i === 1){
														guideListBig.push(guideList[i])
													}else{
														guideListSmall.push(guideList[i])
													}
												}
												obj.guideDetail.guideListBig = guideListBig;
												obj.guideDetail.guideListSmall = guideListSmall;
												self.setData({
													compassGuideModuleV2: obj
												})
											}
										}
										if(temp.moduleType == "localGuide"){
											let subTemplateType = temp.template3.subTemplateType;
											self.setData({
												localGuideData:{
													subTemplateType,
													subTemplate:temp.template3["subTemplate"+subTemplateType],
													weather:self.data.weatherData
												}
											})
										}
										// 口袋攻略入口
										if(temp.moduleType == "pocketBook"){
											self.setData({
												strategyData: {
													hasGuide: !!temp.pocketbookInfo && !!temp.pocketbookInfo.url ? true : false,
													guideSchema: temp.pocketbookInfo.url
												},
											})
										}
										// 榜单聚合
										if (temp.moduleType == "hotRecommend") {
											const list = temp.hotRecommendModule && temp.hotRecommendModule.hotRecommendTabList;
											if(!!list){
												self.setData({
													playLiveEatList: {
														tabIndex: 0,
														data: list
													}
												})
											}
										}
										if(temp.moduleType == "ranking"){
											self.setData({
												listCompData: {
													// ranking : temp.template4,
													catalog : temp.template4.tabList,
													detail: temp.template4.subTemplate,
													// templateData: JSON.parse(JSON.parse(getData.ranking.detail.mixTemplateData).templateData),
													currentTagOne:0,
													currentTagTwo:0,
													currentTagThree:0,
													currentFirstmodulecode:0,
													currentSecModuleCode:temp.template4.tabList[0].subTabList[0].tabId,
													isNotEmpty:true,
													// currentPrimaryCode:getData.ranking.catalog.firstCatalogModuleList[0].secCatalogModuleList[0].primaryCode,
													currentPrimaryCode:'',
													isLoading: false,
												},
											})
										}
										// 行程路线
										if(temp.moduleType == "itinerary" && !!temp.template5){
											self.setData({
												routeData:temp.template5
											})

										}
										// 问答
										if(temp.moduleType == "askAndAnswer" && !!temp.askAndAnswerInfo){
											let askData = {};
											askData.totalCount = temp.askAndAnswerInfo.itemList.length;
											askData.sightAskItemBOS = temp.askAndAnswerInfo.itemList;
											askData.moreInfo = temp.askAndAnswerInfo.moreInfo;
											self.setData({
												askData:askData
											})

										}
										// if (getData.specialFoodsV2 && Object.keys(getData.specialFoodsV2).length !== 0) {
										// 	self.setData({
										// 		specialFoods:{
										// 			title:getData.specialFoodsV2.title,
										// 			appId:getData.specialFoodsV2.appId,
										// 			moreText:getData.specialFoodsV2.moreText,
										// 			moreSchema:getData.specialFoodsV2.moreSchema,
										// 			specialFoodsList:getData.specialFoodsV2.items,
										// 			scrollLeft:0
										// 		},
										// 	})
										// }
									})
								}

								if(!optionHrefId){
									cwx.hideLoading();
								}
								self.shareTitle = getData.shareInfo && getData.shareInfo.title;
								self.shareImage = getData.shareInfo && getData.shareInfo.coverImage;
								self.searchScrollEleTop(function(){
									self.getIsInsight(); //判断在可视区域内的元素
								}); //数据请求结束后获取每个模块距离页面顶部的距离
								// return callback && callback();
							})

						}
						else{
							if(!optionHrefId){
								cwx.hideLoading();
							}
							_ubt.ubtTrace(102403, {
								'pageId': self.data.pageId,
								'err_info':'res.data.responseStatus.ack error'
							});
						}
					}
					// 接口无数据
					else{
						if(!optionHrefId){
							cwx.hideLoading();
						}
						_ubt.ubtTrace(102403, {
							'pageId': self.data.pageId,
							'err_info':'res.statusCode !=== 200 or res.data = "undefined"'
						});
					};
					// 瀑布流数据
					setTimeout(()=> {
						let param = {
							'districtId': self.data.viewDistrictId,
							'groupChannelCode': "tourphoto_all",
							'imageCutType': 1,
							'lat': self.data.lat,
							'lon': self.data.lon,
							'locatedDistrictId': self.data.userLocationId,
							'type': 0,
							'pagePara': self.data.pagePara
						};
						self.getRelatedRecommend(param);
						setTimeout(function () {
							self.setUbt("115185", "gs_dst_home_Browse", "browse", {});
						}, 0)
					},100)
				},
				fail: res => {
					console.log(res);
					setTimeout(function () {
						self.setUbt("115185","gs_dst_home_Browse","browse",{});
					},0)
				}
			});
			console.log('====================================');
			console.log(self.data);
			console.log('====================================');
		},

		//滚动到底部
		_scrolltolower:function(e){
			let self=this,
				{ pagePara ,totalCount ,showLoading} = self.data,
				nextPara = {};

			nextPara = {
				pageIndex : pagePara.pageIndex+1,
				pageSize : pagePara.pageSize,
				sortDirection:pagePara.sortDirection,
				sortType:pagePara.sortType
			}

			let param = {
				'districtId': self.data.viewDistrictId,
				'groupChannelCode':"tourphoto_all",
				'imageCutType':1,
				'lat':self.data.lat,
				'lon':self.data.lon,
				'locatedDistrictId':self.data.userLocationId,
				'type':0,
				'pagePara':nextPara
			};


			if(pagePara.pageIndex * pagePara.pageSize < totalCount){
				if (!showLoading ){
					self.setData({
						showLoading:true,
					},()=>{
						self.startAnimationInterval();
						self.getRelatedRecommend(param);
						self.setData({
							pagePara:nextPara,
							showLoading:false
						},()=>{
							self.stopAnimationInterval();
						})
					})
				}
			}

		},

		//瀑布流 相关笔记，他的笔记
		getRelatedRecommend: function (param) {
			let self = this,
				WaterFalllist = self.data.relevantList,
				relevantList = [];

			relatedRecommend(param, function (res) {


				if (commonUtil.checkResponseAck(res) && !res.data.result) {
					let recommendArticles = res.data.resultList; //相关笔记
					let totalCount = res.data.totalCount;
					if (recommendArticles && recommendArticles.length) {
						let newRelevantList = [];
						recommendArticles.forEach((articles, index) => {
							let newRelevantListItem = {};
							let item = articles.article;
							newRelevantListItem.articleId = item.articleId;
							let image = {};
							image.url = item.images && item.images[0] ? item.images[0].dynamicUrl : '';
							image.width = item.images && item.images[0] ? item.images[0].width : '';
							image.height = item.images && item.images[0] ? item.images[0].height : '';
							newRelevantListItem.image = image;
							let author = {};
							author.nickName = item.author ? item.author.nickName : '';
							author.avatUrl = item.author && item.author.coverImage ? item.author.coverImage.dynamicUrl : '';
							author.identityType = item.author && item.author.identityType ? item.author.identityType : false;
							newRelevantListItem.author = author;
							newRelevantListItem.tag = item.topics && item.topics[0] ? item.topics[0].topicName : '';
							newRelevantListItem.poiName = item.pois && item.pois[0] ? item.pois[0].poiName : '';
							newRelevantListItem.title = item.articleTitle;
							newRelevantListItem.praiseCount = item.likeCount;
							newRelevantListItem.isVideo = item.hasVideo ? item.hasVideo : '';
							newRelevantListItem.isVip = item.author && item.author.isVip ? item.author.isVip : '';
							newRelevantListItem.isLike = item.isLike;
							newRelevantListItem.itemIndex = index;
							newRelevantList.push(newRelevantListItem);
						})
						relevantList = newRelevantList;
					} else {
						relevantList = relevantList;
					}

					WaterFalllist = WaterFalllist.concat(relevantList);


					self.setData({
						relevantList: WaterFalllist,
						totalCount:totalCount
					}, () => {
						self.getWaterFallList(param);
					})
				}
			})

		},

		//瀑布流处理
		getWaterFallList: function (param) {
			let self = this,
				relevantList = self.data.relevantList || [],
				waterfallLeftList = [],
				waterfallRightList = [],
				leftHeight = 0,   //左列高度
				rightHeight = 0; //右列高度
			relevantList.forEach((item, index) => {
				if (!item.image.width) {
					item.image.width = 341;
				}
				if (!item.image.height) {
					item.image.height = 341;
				}
				let picHeight = 341 / item.image.width * item.image.height;
				picHeight = parseInt(picHeight);
				item.image.picWidth = 341;
				item.image.picHeight = picHeight;
				if (picHeight < 300) {
					item.image.picHeight = 300
				}
				if (leftHeight <= rightHeight) {
					waterfallLeftList.push(item);
					leftHeight = leftHeight + self.getWarterFallPicHeight(picHeight);
				} else {
					waterfallRightList.push(item);
					rightHeight = rightHeight + self.getWarterFallPicHeight(picHeight);
				}
			})

			self.setData({
				waterfallLeftList: waterfallLeftList,
				waterfallRightList: waterfallRightList
			}, () => {
				self.getListOffsetTop();
				self.setUbt("133124","gs_dst_home_Show_tripshoot_flow","view",{
					"pageindex" : param.pagePara && param.pagePara.pageIndex
				});
				const {optionHrefId,pageLoad} = self.data;
				if(param.pagePara && param.pagePara.pageIndex === 1 && !!optionHrefId){
					cwx.hideLoading();
					if(!pageLoad){
						setTimeout(function () {
							// hrefId : sight,itinerary,ask,lvpai
							self.setData({
								hrefId:  optionHrefId || "",
								pageLoad : true
							})
						},100)
					}

				}
			})
		},

		//获取相关笔记距离顶部的距离
		getListOffsetTop: function () {
			let self = this,
				query = cwx.createSelectorQuery(),
				relevantList = self.data.relevantList,
				showDetail = self.data.showDetail,
				showRelevantList = self.data.showRelevantList,
				scrollTop = 0,
				showHeaderTop = self.data.showHeaderTop;
			if (!showDetail || !relevantList || relevantList.length == 0) {
				return
			}

			if (relevantList && relevantList.length && showRelevantList) {
				cwx.createSelectorQuery().selectViewport().scrollOffset(function (res) {
					scrollTop = res.scrollTop || 0;
					query.select('#relevant-list').boundingClientRect();
					query.exec(function (rectRes) {
						let rectResTop = 0;
						if (rectRes && rectRes.length) {
							rectResTop = rectRes[0].top;
						}
						let offset = scrollTop + rectResTop;
						offset = offset - showHeaderTop;  //减去自定义的头部的高度
						self.setData({
							listOffsetTop: offset
						})
					})
				}).exec()

			}

		},

		//瀑布流图片高度 + 文字处理
		getWarterFallPicHeight: function (picHeight) {
			let temp = 0,
				totalHeight = 0;
			if (picHeight > 600) {
				temp = 600;
			} else if (picHeight < 300) {
				temp = 300;
			} else {
				temp = picHeight;
			}
			totalHeight = temp + 52 + 58 + 24; //加上的为底部信息的高度
			return totalHeight;
		},

		//跳转至详情页
		jumpToDetail: function(e){
			let self = this,
				articleId = e.currentTarget.dataset.id,
				type =  e.currentTarget.dataset.type,
				index = e.currentTarget.dataset.index,
				fromDetail = 0;  //是不是从详情页跳转过来的
			if(type == "waterfall"){
				_ubt.ubtTrace('c_gs_tripshoot_detail_relatedarticle',{
					"articleId": self.data.articleId,
					"relatedArticlePosition": index.toString(),
					"relatedArticleId": articleId.toString()
				});
				if(index){
					if(index.indexOf("左")!== -1){
						const _index = index.replace("左","") || "0";
						index = "左" + (parseInt(_index) + 1);
					}else if(index.indexOf("右")!== -1){
						const _index = index.replace("右","") || "0";
						index = "右" + (parseInt(_index) + 1);
					}
				}
				const {pagePara} = this.data;
				self.setUbt("133125","gs_dst_home_Click_tripshoot","click",{
					"articleId": articleId.toString(),
					"articlePostion":index.toString(),
					"pageindex":pagePara.pageIndex
				});
			}
			let url = '/pages/you/lvpai/detail/detail?fromDetail=1&articleId=' + articleId;
			if(fromDetail == 1){
				cwx.redirectTo({
					url: url
				})
			} else {
				cwx.navigateTo({
					url: url
				})
			}


		},

		//点赞+1
		toPraise: function(e){

		},



		//跳转口袋攻略
		toguideBook :function(e){
			// let url = '/pages/destination/guide/catalog/catalog?districtId=' + this.data.viewDistrictId + '&districtName=' + this.data.bannerData.districtInfo.name;
			let url = this.data.strategyData.guideSchema
			cwx.navigateTo({
				url: url
			});
		},
		// ********* 公共组件方法 *********
		jumpTemperatureUrl:function (res) {
			let url = res.currentTarget.dataset.url;
			this.commonJumpUrl(url)
		},
		// 公共跳转
		commonJumpUrl:function (url) {
			if(!url){
				return ;
			}
			if (/^https?:\/\//i.test(url)) {
				/*console.log('httpsUrl');*/
				cwx.component.cwebview({
					data: {
						url: encodeURIComponent(url),
						shareData:{
							path: encodeURIComponent(url)
						}
					}
				});
			}else{
				cwx.navigateTo({
					url: url
				})
			}
		},
		// ********* 公共组件方法end *********

		// ********* 当地指南模块 *********
		// A版跳转更多
		goToLgAMore:function (res) {
			let _jumpUrl = res.currentTarget.dataset && res.currentTarget.dataset.jumpurl || "";
			const {subtemplatetype} =  res.currentTarget.dataset;
			this.setUbt("115267","gs_dst_home_Click_guide_topic","click",{
				"subtemplatetype":subtemplatetype == 2 ? "A" :subtemplatetype == 1 ? "B" : "C",
				"itemPosition" : "more"
			});
			this.commonJumpUrl(_jumpUrl)
		},
		// A版跳转详情
		goToLgADetail:function (res) {
			const {url,idx,subtemplatetype,itemid} =  res.currentTarget.dataset;
			this.setUbt("115267","gs_dst_home_Click_guide_topic","click",{
				"subtemplatetype":subtemplatetype == 2 ? "A" :subtemplatetype == 1 ? "B" : "C",
				"itemPosition" :  parseInt(idx || 0) + 1,
				"itemId" : itemid
			});
			this.commonJumpUrl(url)
		},
		//  B版跳转更多
		goToLgBMore:function (res) {
			const {url,subtemplatetype} =  res.currentTarget.dataset;
			this.setUbt("115267","gs_dst_home_Click_guide_topic","click",{
				"subtemplatetype":subtemplatetype == 2 ? "A" :subtemplatetype == 1 ? "B" : "C",
				"itemPosition" : "more"
			});
			this.commonJumpUrl(url)
		},
		// B版section1跳转详情
		goToLgBSection1Deatil:function (res) {
			const {url,idx,subtemplatetype,itemid} =  res.currentTarget.dataset;
			this.setUbt("115267","gs_dst_home_Click_guide_topic","click",{
				"subtemplatetype":subtemplatetype == 2 ? "A" :subtemplatetype == 1 ? "B" : "C",
				"itemPosition" :  parseInt(idx || 0) + 1,
				"itemId" : itemid
			});
			this.commonJumpUrl(url)
		},
		// B版section2跳转详情
		goToLgBSection2Deatil:function (res) {
			//let url = res.currentTarget.dataset.url;
			const {url,idx,subtemplatetype,itemid} =  res.currentTarget.dataset;
			this.setUbt("115267","gs_dst_home_Click_guide_topic","click",{
				"subtemplatetype":subtemplatetype == 2 ? "A" :subtemplatetype == 1 ? "B" : "C",
				"itemPosition" :  parseInt(idx || 0) + 1,
				"itemId" : itemid
			});
			this.commonJumpUrl(url)
		},
		// ********* 当地指南模块end *********
		// *** 榜单聚合 ***
		// 一级Tag点击事件
		tabPlayClick:function(e){
			let dataset = e.currentTarget.dataset;
			const {itemtype,idx} = dataset;
			const {playLiveEatList} = this.data;
			if(playLiveEatList.data[idx].hotRecommendItemList && playLiveEatList.data[idx].hotRecommendItemList.length > 0 ){
				this.setData({
					['playLiveEatList.tabIndex']:idx
				})
				return;
			}
			this.setData({
				['playLiveEatList.tabIndex']:idx,
				['playLiveEatList.loading']:true,
			})
			const that = this;
			let _param = {
				'data':JSON.stringify({
					'districtId': that.data.viewDistrictId,
					'type':itemtype,
					'locatedDistrictId':  that.data.userLocationId,
					'location': {
						'latitude': that.data.lat,
						'longitude': that.data.lon
					},
				}),
				'serviceName': "DestinationCoreService.getHotRecommendModuleDetail"
			}
			getRankingModuleDetail(_param,(res)=>{
				const {playLiveEatList} = that.data;
				playLiveEatList.loading = false;
				if(!res.data){
					that.setData({
						playLiveEatList
					})
					return;
				}
				let result;
				if (res.data.responseStatus) {
					result = res.data.responseStatus.ack;
				} else if (res.data.ResponseStatus) {
					result = res.data.ResponseStatus.Ack;
				}
				if (result==="Success" && res.data.data) {
					let getData = JSON.parse(res.data.data);
					if(getData.detail){
						playLiveEatList.data[idx] = getData.detail;
						playLiveEatList.tabIndex = idx;
						that.setData({
							playLiveEatList
						})
					}else{
						playLiveEatList.data[idx] = [];
						playLiveEatList.tabIndex = idx;
						that.setData({
							playLiveEatList
						})
					}
				}else{
					that.setData({
						playLiveEatList
					})
				}
			})
		},
		tabGuideClickGo : function(res){
			let that = this;
			const {h5url} = res.currentTarget.dataset;
			this.checkHrefGo(h5url);
		},
		tabPlayClickGo : function(res){
			let that = this;
			const {h5url} = res.currentTarget.dataset;
			this.checkHrefGo(h5url);
		},
		tapTagLv1: function(res){
			var that = this;
			let _data = res.currentTarget.dataset._data;
			this.setData({
				['listCompData.currentTagOne']:res.currentTarget.dataset.idx,
				['listCompData.currentTagTwo']:0,
				['listCompData.currentTagThree']:0,
				['listCompData.currentFirstmodulecode']:res.currentTarget.dataset.idx,
				['listCompData.currentSecModuleCode']:_data.subTabList[0].tabId,
				// ['listCompData.currentPrimaryCode']:_data.secCatalogModuleList[0].primaryCode,
				['listCompData.isLoading']:true,
			})
			let _param = {
				'data':JSON.stringify({
					'districtId': that.data.viewDistrictId,
					'sectionId':_data.subTabList[0].tabId,
					'locatedDistrictId': that.data.userLocationId,
					'location': {
						'latitude': that.data.lat,
						'longitude': that.data.lon
					},
				}),
				'serviceName': "DestinationCoreService.getRankingModuleDetail"
			}
			const {itemtype} = res.currentTarget.dataset;
			that.setUbt("133121","gs_dst_home_Click_htl_sight_rst","click",{
				"tabname":itemtype,
			});
			getRankingModuleDetail(_param,(res)=>{
				let detail = JSON.parse(res.data.data).detail
				if (!!detail) {
					that.setData({
						// ['listCompData.ranking']:res.data,
						['listCompData.detail']:detail,
						// ['listCompData.templateData']:JSON.parse(JSON.parse(res.data.detail.mixTemplateData).templateData),
						['listCompData.isNotEmpty']:true,
						['listCompData.isLoading']:false,
					})
					console.log(that.data.listCompData);
				}
				else{
					that.setData({
						['listCompData.isNotEmpty']:false,
						['listCompData.isLoading']:false,
					})
				}
			})
			// let params = {
			// 	districtId: this.data.viewDistrictId,
			// 	tab1: _data.firstModuleCode,
			// 	tab2: _data.secCatalogModuleList[0].secModuleCode,
			// 	head:{sysCode:'30'},
			// }
			// getRankingModule(params,(res)=>{
			// 	if (res.data.detail && res.data.detail.mixTemplateData) {
			// 		that.setData({
			// 			['listCompData.ranking']:res.data,
			// 			['listCompData.detail']:JSON.parse(res.data.detail.mixTemplateData),
			// 			['listCompData.templateData']:JSON.parse(JSON.parse(res.data.detail.mixTemplateData).templateData),
			// 			['listCompData.isNotEmpty']:true,
			// 			['listCompData.isLoading']:false,
			// 		})
			// 		console.log(that.data.listCompData);
			// 	}
			// 	else{
			// 		that.setData({
			// 			['listCompData.isNotEmpty']:false,
			// 			['listCompData.isLoading']:false,
			// 		})
			// 	}
			// })
		},
		// 二级Tag点击事件
		tapTagLv2: function(res){
			let that = this;
			let _data = res.currentTarget.dataset._data;
			this.setData({
				['listCompData.currentTagTwo']:res.currentTarget.dataset.idx,
				['listCompData.currentTagThree']:0,
				['listCompData.currentSecModuleCode']:_data.tabId,
				// ['listCompData.currentPrimaryCode']:_data.primaryCode,
				['listCompData.isLoading']:true,
			})
			let _param = {
				'data':JSON.stringify({
					'districtId': that.data.viewDistrictId,
					'sectionId':_data.tabId,
					'locatedDistrictId': that.data.userLocationId,
					'location': {
						'latitude': that.data.lat,
						'longitude': that.data.lon
					},
				}),
				'serviceName': "DestinationCoreService.getRankingModuleDetail"
			}
			const {itemtype,tabrankname,idx} = res.currentTarget.dataset;
			that.setUbt("133122","gs_dst_home_Click_poi_ranktab","click",{
				"tabname":itemtype,
				"tabrankName" : tabrankname,
				"tabrankPosition" : parseInt(idx || 0) + 1
			});
			getRankingModuleDetail(_param,(res)=>{
				let detail = JSON.parse(res.data.data).detail
				if (!!detail) {
					that.setData({
						// ['listCompData.ranking']:res.data,
						['listCompData.detail']:detail,
						// ['listCompData.templateData']:JSON.parse(JSON.parse(res.data.detail.mixTemplateData).templateData),
						['listCompData.isNotEmpty']:true,
						['listCompData.isLoading']:false,
					})
					console.log(that.data.listCompData);
				}
				else{
					that.setData({
						['listCompData.isNotEmpty']:false,
						['listCompData.isLoading']:false,
					})
				}
			})
			// let params = {
			// 	districtId: this.data.viewDistrictId,
			// 	primaryCode: _data.primaryCode,
			// 	tab1: that.data.listCompData.currentFirstmodulecode,
			// 	tab2: _data.secModuleCode,
			// 	head:{sysCode:'30'},
			// }
			// getRankingModule(params,(res)=>{
			// 	if (res.data.detail && res.data.detail.mixTemplateData) {
			// 		that.setData({
			// 			['listCompData.ranking']:res.data,
			// 			['listCompData.detail']:JSON.parse(res.data.detail.mixTemplateData),
			// 			['listCompData.templateData']:JSON.parse(JSON.parse(res.data.detail.mixTemplateData).templateData),
			// 			['listCompData.isNotEmpty']:true,
			// 			['listCompData.isLoading']:false,
			// 		})
			// 		console.log(that.data.listCompData);
			// 	}
			// 	else{
			// 		that.setData({
			// 			['listCompData.isNotEmpty']:false,
			// 			['listCompData.isLoading']:false,
			// 		})
			// 	}
			// })
		},
		// 三级Tag点击事件
		tapTagLv3: function(res){
			this.setData({
				['listCompData.currentTagThree']:res.currentTarget.dataset.idx,
			})
		},
		checkHrefGo:function(url){
			if(!url){
				return;
			}
			if(url){
				if (/^https?:\/\//i.test(url)) {
					cwx.component.cwebview({
						data: {
							url: encodeURIComponent(url),
							shareData:{
								path: encodeURIComponent(url)
							}
						}
					});
				}else{
					cwx.navigateTo({url:url})
				}
			}
		},
		// 美食更多
		tapTagLv3More :function(res) {
			const {itemtype,tabrankname,idx2,moreurl} = res.currentTarget.dataset;
			this.setUbt("133123","gs_dst_home_Click_poidetail","click",{
				"tabname":itemtype,
				"tabrankName" : tabrankname,
				"tabrankPosition" : parseInt(idx2 || 0) + 1,
				"itemPosition" : "more",
			});
			this.checkHrefGo(moreurl);
		},
		// CommentList点击跳转
		_goToCommentListDetail(res){
			let _data = res.currentTarget.dataset.commentlistdata;
			let url = _data && _data.jumpUrl || "";
			const {itemtype,tabrankname,idx,idx2} = res.currentTarget.dataset;
			this.setUbt("133123","gs_dst_home_Click_poidetail","click",{
				"tabname":itemtype,
				"tabrankName" : tabrankname,
				"tabrankPosition" : parseInt(idx2 || 0) + 1,
				"itemPosition" : parseInt(idx || 0) + 1,
			});
			this.checkHrefGo(url);
		},
		// CommentList seemore
		_seeMore(res){
			let _data = res.currentTarget.dataset;
			const {itemtype,tabrankname,idx2} = _data;
			this.setUbt("133123","gs_dst_home_Click_poidetail","click",{
				"tabname":itemtype,
				"tabrankName" : tabrankname,
				"tabrankPosition" : parseInt(idx2 || 0) + 1,
				"itemPosition" : "more",
			});

			this.checkHrefGo(_data.moreurl);
		},
		// Line点击跳转
		_goToLineDetail(res){
			let _data = res.currentTarget.dataset;
			const {itemtype,tabrankname,idx,idx2} = _data;
			this.setUbt("133123","gs_dst_home_Click_poidetail","click",{
				"tabname":itemtype,
				"tabrankName" : tabrankname,
				"tabrankPosition" : parseInt(idx2 || 0) + 1,
				"itemPosition" : parseInt(idx || 0) + 1,
			});
			this.checkHrefGo(_data.url);
		},
		// 空态刷新
		_refresh(){
			let that = this;
			that.setData({
				['listCompData.isLoading']:true,
			})
			let params = {
				districtId: that.data.viewDistrictId,
				primaryCode: that.data.listCompData.currentPrimaryCode,
				tab1: that.data.listCompData.currentFirstmodulecode,
				tab2: that.data.listCompData.currentSecModuleCode,
				head:{sysCode:'30'},
			}
			getRankingModule(params,(res)=>{
				if (res.data.detail && res.data.detail.mixTemplateData) {
					that.setData({
						['listCompData.ranking']:res.data,
						['listCompData.detail']:JSON.parse(res.data.detail.mixTemplateData),
						['listCompData.templateData']:JSON.parse(JSON.parse(res.data.detail.mixTemplateData).templateData),
						['listCompData.isNotEmpty']:true,
						['listCompData.isLoading']:false,
					})
					console.log(that.data.listCompData);
				}
				else{
					that.setData({
						['listCompData.isNotEmpty']:false,
						['listCompData.isLoading']:false,
					})
				}
			})
		},
		// **** end 榜单聚合 ****

		// *** 行程路线 ***
		_goToRouteMore(res) {
			let _data = res.currentTarget.dataset;
			let url = _data.moreurl;
			this.setUbt("133091","gs_dst_home_Click_route","click",{
				"itemPosition": "more"
			});
			this.checkHrefGo(url);
		},

		_goToRouteDetail(res) {
			let _data = res.currentTarget.dataset;
			let url = _data && _data.jumpurl || "";
			const {itemid,itemindex} = _data;
			this.setUbt("133091","gs_dst_home_Click_route","click",{
				"itemId":itemid,
				"itemPosition":parseInt(itemindex || 0) + 1
			});
			this.checkHrefGo(url);
		},

		// *** 行程路线end ***

		// *** 问答模块 ***
		toAskDetail:function(e){
			const {detailUrl,itemid,itemindex} = e.currentTarget.dataset;
			this.setUbt("133092","gs_dst_home_Click_ask","click",{
				"itemId":itemid,
				"itemPosition":parseInt(itemindex || 0) + 1
			});
			// todo接口下发H5url
			this.checkHrefGo(detailUrl);
		},
		toAskList: function (e) {
			const moreurl = e.currentTarget.dataset.moreurl;
			this.setUbt("133092","gs_dst_home_Click_ask","click",{
				"itemPosition": "more"
			});
			this.checkHrefGo(moreurl);
		},
		// *** 问答模块end ***

		//处理火车票数据
		dealTrainData: function(traindata){
			let self = this;
			console.log('traindata',traindata);
			if(traindata && traindata.transfer){
				let newData = {
					iconUrl: traindata.transfer.split(',')[0],
					iconWidth: traindata.transfer.split(',')[1] * 2,
					iconHeight:  traindata.transfer.split(',')[2] * 2,
					destStationName: traindata.destStationName,
					duration: traindata.duration,
					fromStationName: traindata.fromStationName,
					price: traindata.price,
					routeSchema: traindata.routeSchema,
					trainCount: traindata.trainCount,
					icon: traindata.icon
				}
				return newData;
			}

		},
		// 页面刚打开是获取用户定位
		getUserLocation:function(callback){
			let self = this;
			console.log('logic ---getUserLocationSuccess---');
			const _viewDistrictId = self.data.viewDistrictId;
			cwx.locate.startGetCtripCity(function(resp){
				if (resp) {
					if (!resp.error && resp.data) {
						console.log('logic ---getUserLocationSuccess---',resp);
						console.log({'getUserLocation---longitude经度---':resp.data.CityLatitude,'getUserLocation---latitude纬度---':resp.data.CityLongitude});
						self.setData({
							lat: resp.data.CityLatitude,
							lon: resp.data.CityLongitude,
							viewDistrictId: _viewDistrictId ? _viewDistrictId : (resp.data.DistrictId ? resp.data.DistrictId : 2),
							userLocationId: resp.data.DistrictId ? resp.data.DistrictId : 2
						})
						return callback && callback();
					}else{
						console.log('logic ---getUserLocationFailure---');
						let storageSyncGet = {};
						const nowTime = (new Date()).getTime();
						if(!storageSyncGet ||  (nowTime > (storageSyncGet.time || 0 ))){
							storageSyncGet = {};
						}
						self.setData({
							lat: storageSyncGet.lat || 0,
							lon: storageSyncGet.lon ||  0,
							viewDistrictId:  _viewDistrictId ? _viewDistrictId : (storageSyncGet.viewDistrictId || null),
							userLocationId: storageSyncGet.userLocationId || null,
						})
						_ubt.ubtTrace(102403, {
							'pageId': self.data.pageId,
							'err_info':'cwx.locate.startGetCtripCity resp.error or resp.data = "undefined"'
						});
						return callback && callback();
					}
				}else{
					_ubt.ubtTrace(102403, {
						'pageId': self.data.pageId,
						'err_info':'resp = "undefined"'
					});
				}

			},"destination-place",null,2500);
		},

		/*
              click event页面点击事件集合
        */
		// banner跳转大搜
		toSearch:function(e) {
			this.setUbt("115238","gs_dst_home_Click_search","click",{});
			this.checkHrefGo( '/pages/search/search');
		},
		// banner城市名称点击跳转到城市搜索页
		toSelectCity: function(e) {
			let self = this;
			console.log("click ---toSelectCity---",e);
			let url;
			if (self.data.isCrhPage) {   //点击城市切换跳转的时候如果是来自普通目的地，需要传isCrhPage=1过去
				url = '/pages/you/place/searchcity/searchcity?isCrhPage=1&fromDistrictId='+ self.data.fromDistrictId + "&fromPage="+ encodeURIComponent("/pages/you/destinationpage/destinationpage");
			}else{
				url = '/pages/you/place/searchcity/searchcity?fromPage=' + encodeURIComponent("/pages/you/destinationpage/destinationpage");
			}
			self.setUbt("115294","gs_dst_home_Click_changecity","click",{});
			self.checkHrefGo(url);
			self.setData({
				searchLoad: true
			})
		},
		// 点击城市选择之后的埋点
		toTraceSelectCity: function(departid){
			let self = this;
			console.log("click ---toTraceSelectCity---",departid);
			_ubt.ubtTrace(102403, {
				'pageId': self.data.pageId,
				'actioncode':'c_changecity',
				'departid':departid
			});

			self.setData({relevantList:[],listCompData:null});
		},
		// square每个模块点击跳转到不同的频道
		toDifferChannel: function(e) {
			let self = this;
			console.log("click ---toDifferChannel---",e);
			console.log("click ---toDifferChannelSchema---",e.currentTarget.dataset.channelinfo);

			let channelinfo = e.currentTarget.dataset.channelinfo;
			const {ubtname,ubtindex} = e.currentTarget.dataset;
			let url = channelinfo && channelinfo.jumpUrl || "";
			let type = channelinfo && (!!channelinfo.type ? channelinfo.type : null) || null;
			let appid = channelinfo && (!!channelinfo.appid ? channelinfo.appid : null) || null;
			self.setUbt("115233","gs_dst_home_Click_gongge","click",{
				"itemName":ubtname,
				"itemPosition": parseInt(ubtindex || 0) + 1
			});
			if(!url){
				return;
			}
			if(!!appid){
				cwx.navigateToMiniProgram({
					appId: appid,
					path: url,
				})
			}else{
				if (type===2||type===6||type===7||type===8) {
					cwx.navigateTo({
						url: url
					})
				}else{
					if (/^https?:\/\//i.test(url)) {
						console.log('httpsUrl')
						let title = channelinfo && channelinfo.title
						cwx.component.cwebview({
							data: {
								url: encodeURIComponent(url),
							}
						});
					}
					else{
						cwx.navigateTo({
							url: url
						})
					}
				}
			}
			self.destinationBindUbt(e);
		},
		// trainticket点击立即购票跳转到购票页面
		toBuyTrainTicket: function(e) {
			let self = this;
			console.log("click ---toBuyTrainTicket---",e);
			let url = e.currentTarget.dataset.ticketschema;
			self.checkHrefGo(url);
			self.destinationBindUbt(e);
		},
		// hotel点击每一个酒店跳转到酒店详情页面
		toHotelDetail:function(e) {
			let self = this;
			console.log("click ---toHotelDetail---",e);
			console.log("click ---HotelDetailTitle---",e.currentTarget.dataset.hoteldetail);
			let url = e.currentTarget.dataset.hoteldetail;
			self.checkHrefGo(url);
			self.destinationBindUbt(e);
		},
		// hotel点击查看更多预定更多目的地酒店
		toViewMoreHotel: function(e) {
			let self = this;
			console.log("click ---toViewMoreHotel---",e);
			let url = e.currentTarget.dataset.moreschema;
			self.checkHrefGo(url);
			self.destinationBindUbt(e);
		},
		// strategybook点击快速了解当地跳转到携程官方攻略
		toViewStrategyBook:function(e){
			let self = this;
			console.log("click ---toViewStrategyBook---",e);
			this.setUbt("115267","gs_dst_home_Click_guide_topic","click",{
				"subtemplatetype":"C",
				"itemPosition" : "more"
			});
			self.destinationBindUbt(e);
		},
		// gowhere点击更多查看更多必玩景点
		toMorePlace: function(e) {
			let self = this;
			console.log("click ---toMorePlace---",e);
			let url = e.currentTarget.dataset.moreschema;
			self.checkHrefGo(url);
		},
		// gowhere点击每一个景点跳转必玩景点详情页
		toPlaceDetail: function(e) {
			let self = this;
			console.log("click ---toPlaceDetail---",e);
			self.checkHrefGo(e.currentTarget.dataset.sightschema);
			self.destinationBindUbt(e);
		},
		// 特色菜详情
		toSpecialFoodDetail:function(e){
			console.log('---------',e.currentTarget.dataset.fooddetailschema);
			console.log(e.currentTarget.dataset.fooddetailschema);
			let self = this;
			self.checkHrefGo(e.currentTarget.dataset.fooddetailschema);
			self.destinationBindUbt(e);
		},
		// theme点击更多查看更多主题
		toMoreTheme: function(e) {
			let self = this;
			console.log("click ---toMoreTheme---",e);
		},
		// theme点击每一个特色主题跳转必玩特色主题详情页
		toThemeDetail: function(e) {
			let self = this;
			console.log("click ---toThemeDetail---",e);
			self.destinationBindUbt(e);
		},
		toFoodDetail:function(e){
			let self = this;
			console.log("click ---toFoodDetail---",e);
			self.destinationBindUbt(e);
		},
		// 目的地页面ubt埋点
		destinationBindUbt:function(e) {
			let self = this;
			console.log("ubt ---destinationBindUbt---",e);

			let ubtdata = e.currentTarget.dataset;

			let ubtLocationId = self.data.userLocationId; //定位城市id
			let ubtDistrictId = self.data.viewDistrictId; //当前浏览目的地id
			let ubtChufaId = self.data.fromDistrictId; //当前用户定位id
			let ubtTitle = ubtdata.ubttitle; //模块title，如宫格、口袋攻略、火车票等
			let ubtItemId = ubtdata.ubtitemid; //点击的具体id，如酒店单品
			let ubtItemName = ubtdata.ubtname; //点击的具体内容，如宫格里的景玩入口、酒店名称
			_ubt.ubtTrace(102403, {
				'pageId': self.data.pageId,
				'actioncode':'c_click',
				'locationGlobalID': ubtLocationId,
				'departid': ubtChufaId,
				'districtid': ubtDistrictId,
				'item_type': ubtTitle,
				'item_id': ubtItemId,
				'item_name': ubtItemName
			});
		},
		setUbt:function(key,actioncode,actiontype,json){
			const self = this;
			//userLocationId 定位城市 ； viewDistrictId浏览城市 ； residentId常居地城市
			const {userLocationId,viewDistrictId,residentId} = self.data;
			_ubt.ubtTrace(key, {
				'type' : function () {
					let type = "3";
					if(residentId == viewDistrictId){
						type = "2";
					}else{
						if(userLocationId == viewDistrictId){
							type = "1"
						}else{
							type = "0"
						}
					}
					return type

				}(),
				'pageId': self.data.pageId,
				'residentId' : residentId,
				'actiontype' : actiontype,
				'actioncode':actioncode,
				'locationGlobalId': userLocationId,
				'districtId': viewDistrictId,
				...(json || {})
			});
		},
		//页面元素曝光率埋点
		destinationViewUbt: function() {
			let self = this;
			console.log("ubt ---destinationViewUbt---");
			for (let i = 0; i < moduleListToTop.length; i++) {
				if (moduleListToTop[i].moduleIsShow && !moduleListToTop[i].moduleHasView) {
					moduleListToTop[i].moduleHasView = true;
					let ubtLocationId = self.data.userLocationId; //定位城市id
					let ubtDistrictId = self.data.viewDistrictId; //当前浏览目的地id
					let ubtChufaId = self.data.fromDistrictId; //当前用户出发城市
					let ubtTitle = moduleListToTop[i].moduleName; //模块title，如宫格、口袋攻略、火车票等
					_ubt.ubtTrace(102403, {
						'pageId': self.data.pageId,
						'actioncode':'c_view',
						'locationGlobalID': ubtLocationId,
						'departid': ubtChufaId,
						'districtid': ubtDistrictId,
						'item_type': ubtTitle
					});
				}
			}
		}
	}

})
