import {
	cwx,
	CPage,
	__global
} from '../../../cwx/cwx.js';

cwx.config.init();
CPage({
	pageId: "10650008566",
	checkPerformance: true,  // 添加标志位
	data:{
		options : null
	},
	onLoad: function (options) {
		this.setData({
			options: options
		})
	},
	onShow : function(){
		const _topFilterComponent = this.selectComponent('#componentDestination');
		const viewCityID = cwx.getStorageSync("SEARCHCITYCITYID_DESTINATIONPAGE");
		const viewDistrictId =  this.data.viewDistrictId;
		if(!!viewCityID){
			cwx.removeStorageSync("SEARCHCITYCITYID_DESTINATIONPAGE");
		}
		_topFilterComponent.searchLoad && _topFilterComponent.searchLoad(viewCityID || viewDistrictId,!!viewCityID);
	},
	onShareAppMessage: function (res) {
		const _topFilterComponent = this.selectComponent('#componentDestination');
		const _message = _topFilterComponent.onShareMessage && _topFilterComponent.onShareMessage();
		return ({
			imageUrl: _message.image,
			title: _message.title,
			path: _message.url,

		});
	},
	toTraceSelectCity : function (departid) {
		const _topFilterComponent = this.selectComponent('#componentDestination');
		_topFilterComponent.toTraceSelectCity && _topFilterComponent.toTraceSelectCity(departid);
	}
})
