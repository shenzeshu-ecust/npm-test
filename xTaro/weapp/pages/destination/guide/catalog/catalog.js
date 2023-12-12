// 口袋攻略目录页
// 传入参数：districtId,articleId,districtName
// 输出参数：PageId

import { cwx, CPage } from "../../../../cwx/cwx.js";
// const app = getApp();

CPage({
    pageId: "10650023922",
    districtId: 0,
    data: {
        districtName: "",
        activeIndex: 0,
        height:0,
        catalogData: null
    },

    onLoad: function(options) {
        if (!options.data) {
            let tmp = {};
            tmp["data"] = options;
            options = tmp;
        }

        let height = wx.getSystemInfoSync().windowHeight;
        this.districtId = parseInt(options.data.districtId) || 2;
        this.setData({height: height});
        this.getTagsByDistrictId();
    },

    // 分享
  onShareAppMessage() {
    return {
      title: '携程攻略 — '+this.data.districtName,
      desc: '干货！旅行达人带你玩转' + this.data.districtName + '旅行带上携程攻略就够了！',
      path: '/pages/destination/guide/catalog/catalog?districtId=' + this.districtId 
    }
  },


    // 获取标签数据
    getTagsByDistrictId() {
        var that = this;
        cwx.showLoading();
        cwx.request({
            url: "/restapi/soa2/18712/json/invokeOnDemand",
            data: {
                serviceName: "pocketbookcoreservice.getBookCatalog",
                data: JSON.stringify({ districtId: that.districtId }),
            },
            method: "POST",
            success: res => {
                cwx.hideLoading();
                if (res.data && res.data.data) {
                    const response = JSON.parse(res.data.data);
                    if (response.catalogList && response.catalogList.length) {

                        const pocketBookDetail = response.pocketBookDetail;
                        wx.setNavigationBarTitle({ title:(pocketBookDetail.bookName || '口袋') +'攻略' });

                        const districtName = pocketBookDetail.districtName;
                        that.setData({
                            catalogData: response.catalogList,
                            pocketBookDetail,
                            districtName,
                        });
                    }
                }
            },
        });
    },

    // 切换横向列表项
    switchTap(e) {
        let index = e.currentTarget.dataset.index;
        this.setData({
            activeIndex: index,
        });
    },

    // 点击标签跳转至详情页
    goToDetails(e) {
        if (e && !!e.currentTarget.dataset.jumpurl) {
            const url = e.currentTarget.dataset.jumpurl;
            cwx.navigateTo({
                url,
            });
        }
    },

   
});
