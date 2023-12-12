import {
	cwx,
	CPage,
	__global
} from '../../../cwx/cwx.js';

cwx.config.init();
CPage({
	pageId: "10650008566",
	data:{
		options : null
	},
	onLoad: function (options) {
		this.setData({
			options: options
		})
		var url = "/pages/you/destinationpage/destinationpage"
		var urlList = [];
		if (options.districtId) {
			urlList.push("districtId=" + parseInt(options.districtId, 10))
		}
		if (options.viewDistrictId) {
			urlList.push("viewDistrictId=" + parseInt(options.viewDistrictId, 10))
		}
		if (options.fromDistrictId) {
			urlList.push("fromDistrictId=" + parseInt(options.fromDistrictId, 10))
		}
		if (options.isCrhPage){
			urlList.push("isCrhPage=" + options.isCrhPage)
		}
		if(options.hrefId){
			urlList.push("hrefId=" + options.hrefId && options.hrefId.replace(/(^\s*)|(\s*$)/g,"") || "")
		}
		if(urlList.length > 0 ){
			url = url + "?" + urlList.join("&")
		}

		cwx.redirectTo({
			url: url
		})
	}
})
