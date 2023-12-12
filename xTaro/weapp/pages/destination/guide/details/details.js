import { cwx, CPage } from '../../../../cwx/cwx.js';
// let app = getApp();
let WxParse = require('../../common/wxParse/wxParse.js');

CPage({
  pageId: '10650023923',
  articleId: null,
  sourcefrom:1,
  source:null,
  data: {
    width:0,
    height:0,
    pocketBookCatalogContent:{}

  },

  onLoad(options) {
    let that = this
    // 传入参数
    if (!options.data) {
      let tmp = {};
      tmp['data'] = options;
      options = tmp;
    }
    //console.log('传入参数：',options)
    // 参数装配
    options.data = options.data || options;

    this.articleId = parseInt(options.data.articleId);
    this.sourcefrom = parseInt(options.data.sourcefrom) || 1;
    this.source = options.data.source || '';

    let width = wx.getSystemInfoSync().windowWidth;
    let height = wx.getSystemInfoSync().windowHeight;

    this.setData({width: width,height: height,sourcefrom:this.sourcefrom});
    this.fetchGuideDetail();
    
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '携程攻略 — '+this.data.catalogName,
      desc: '干货！旅行达人带你玩转' + this.data.districtName + '旅行带上携程攻略就够了！',
      path: '/pages/destination/guide/details/details?articleId=' + this.articleId + '&sourcefrom=' + this.sourcefrom
    }
  },


  /*************** 事件处理函数 ***************/
  
  linked_to_detail(e){
    let jumpUrl = e.currentTarget.dataset.jumpurl;
    if(!!jumpUrl){
      cwx.navigateTo({
        url: jumpUrl,
      })
    }
    
  },

  redirect_to_detail(e){
    let jumpUrl = e.currentTarget.dataset.jumpurl;
    if(!!jumpUrl){
      cwx.redirectTo({
        url: jumpUrl,
      })
    }
    
  },

  links_to_guidebook(){
    let districtId = this.data.districtId;
    cwx.redirectTo({
      url: `/pages/destination/guide/catalog/catalog?districtId=${districtId}`,
    })
  },

  /************** 数据处理函数 **************/

  fetchGuideDetail(){
    let that =this;
    cwx.showLoading();
    let url = '/restapi/soa2/18712/json/invokeOnDemand';
    let params = {catalogId:this.articleId};
    if(!!this.source){
      params = {
        catalogId:this.articleId,
        source:this.source
      }
    }
    if(this.sourcefrom == 2){
      cwx.request({
        url:url,
        data:{
          serviceName:"pocketbookcoreservice.getBookContentByCatalogId",
          data:JSON.stringify(params)
        },
        success: (res) => {
          cwx.hideLoading();
          if(res.data){
            let newData = JSON.parse(res.data.data);
            console.log("===222==="+ res.data.data);
            if (!!newData.catalogDetail) {
              wx.setNavigationBarTitle({ title:newData.catalogDetail.catalogName || '口袋攻略' });
            }

            var text_list = [];
            var catalog_list = newData.catalogList;

            catalog_list.forEach((val,index)=>{
              if(!!val.catalogContentList){
                val.catalogContentList.forEach((v,i)=>{
                  var item = {};
                  item['text'] = v.content
                  item['index'] = i
                  item['rank'] = index
                  text_list.push(item)
                });
              }
              
            });

            // 章节和rank索引
            var rank_index = []
            if(text_list.length>0){
              var tmp_text_list = []
              text_list.forEach((val,index)=>{
                tmp_text_list.push(val.text)
                  
                let rank_index_item = {}
                rank_index_item['chapter'] = parseInt(val.index);
                rank_index_item['rank'] = parseInt(val.rank);
                rank_index.push(rank_index_item)
              })
              
              //  富文本
              tmp_text_list.forEach((v,i)=>{
                WxParse.wxParse('text' + i, v, that);
                if (i === tmp_text_list.length - 1) {
                  WxParse.wxParseTemArray("textTemArray", 'text', tmp_text_list.length, that)
                }
              })
            }
            

            that.setData({
              districtName:newData.catalogDetail.districtName,
              catalogName:newData.catalogDetail.catalogName,
              districtId:newData.catalogDetail.districtId,
              rank_index: rank_index,
              pocketBookCatalogContent:newData.catalogDetail,
              authorList:[newData.author],
              travelPhotoContentList:newData.catalogList,
              pocketBookCatalogList:newData.pocketBookCatalogList
            })
          }
        }
      })
    }else{
      cwx.request({
        url:url,
        data:{
          serviceName:"pocketbookcoreservice.getTravelPhotoContentById",
          data:JSON.stringify(params)
        },
        success: (res) => {
          cwx.hideLoading();
          if(res.data){
            let newData = JSON.parse(res.data.data);
            console.log("===111==="+newData);
            if (!!newData.catalogDetail) {
              wx.setNavigationBarTitle({ title:newData.pocketBookCatalogContent.catalogName || '口袋攻略' });
              that.districtName = newData.pocketBookCatalogContent.districtName;
              that.catalogName = newData.pocketBookCatalogContent.catalogName;
              that.districtId = newData.pocketBookCatalogContent.districtId;
            }


            var catalog_list = newData.pocketBookCatalogContent.travelPhotoContentList;

            // 章节和rank索引
            var rank_index = []
            var tmp_text_list = []
            catalog_list.forEach((val,index)=>{
              tmp_text_list.push(val.content)
                
              var rank_index_item = {}
              rank_index_item['chapter'] = index;
              rank_index.push(rank_index_item)
            })

            
            //  富文本
            tmp_text_list.forEach((v,i)=>{
              WxParse.wxParse('text' + i, v, that);
              if (i === tmp_text_list.length - 1) {
                WxParse.wxParseTemArray("textTemArray", 'text', tmp_text_list.length, that)
              }
            })

            that.setData({
              districtName : newData.pocketBookCatalogContent.districtName,
              catalogName : newData.pocketBookCatalogContent.catalogName,
              districtId : newData.pocketBookCatalogContent.districtId,
              rank_index:rank_index,
              pocketBookCatalogContent:newData.pocketBookCatalogContent,
              authorList:newData.pocketBookCatalogContent.authorList,
              travelPhotoContentList:newData.pocketBookCatalogContent.travelPhotoContentList,
              pocketBookCatalogList:newData.pocketBookCatalogContent.pocketBookCatalogList
            })
          }
        }
      })
    }
    
  },


});
