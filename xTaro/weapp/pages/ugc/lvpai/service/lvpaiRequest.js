import { cwx, CPage, __global } from '../../../../cwx/cwx.js';
import { API_HOST, DEBUG } from '../../common/common.js';

function doBeforeRequest({ url, data, success, fail, complete }) {
  let extensions = {
    head: {
      extension: [{ name: 'GsMiniPlantform', value: 'wechatMiniapp' }],
    },
  };
  Object.assign(data, extensions);
  cwx.request({
    url,
    data,
    //   method,
    //   header: isCanary ? { 'x-ctrip-canary-req': '1' } : null,
    success(res) {
      success(res);
    },
    fail(res) {
      fail && fail(res);
    },
    complete() {
      complete && complete();
    },
  });
}
//详情页基础信息 ,已登录用auth 为登录用token
function tripShoot(param, fn) {
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/14045/json/tripShoot',
      data: {
        action: param.action,
        articleId: param.articleId,
        tripShoot: param.tripShoot,
        sharer: param.sharer,
        reader: param.reader,
        needPoiTag: true,
        needCtagTypes: [2, 4],
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}

//详情页分享、点赞调用，获取clientauth 和 token
function action(param, fn) {
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/14045/json/action',
      data: {
        action: param.action,
        targetId: param.targetId,
        targetType: param.targetType,
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}

//获取发布页poi
function searchPoi(param, fn) {
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/14045/json/searchPoi',
      data: {
        keyword: param.keyword,
        picLon: param.picLon,
        picLat: param.picLat,
        lon: param.lon,
        lat: param.lat,
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}
//获取发布页标签
function searchTopicList(param, fn) {
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/14045/json/searchTopicList',
      data: {
        keyword: param.keyword,
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}
//上传视频获取videoid
function initUploadVideo(param, fn) {
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/13180/initUploadVideo',
      data: {
        originFileName: param.originFileName,
        clientChannel: param.clientChannel,
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}
//上传视频
function uploadVideo(param, fn) {
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/13180/fragmentUploadVideo',
      data: {
        initParam: param.initParam,
        totalSizeInByte: param.totalSizeInByte,
        currentStartOffset: param.currentStartOffset,
        bufferInBase64: param.bufferInBase64,
        uploadContext: param.uploadContext,
        complete: param.complete,
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}
//获取用户信息
function getUserInfo(param, fn) {
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/10615/json/getUserHeadNickGender',
      data: {},
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}
//详情页分享调用，绑定token
function bindShareToken(param, fn) {
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/14045/json/bindShareToken',
      data: {
        token: param.token,
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}

//详情页分享调用，他的笔记
function getMyTripShootDtoList(param, fn) {
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/14045/json/getMyTripShootDtoList',
      data: {
        articleId: param.articleId,
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}
//CMS小滑块
function moduleListSearch(param, fn) {
  doBeforeRequest({
    url: '/restapi/soa2/16189/json/moduleListSearch',
    data: {
      lat: param.lat,
      lon: param.lon,
      locationDistrictId: param.locationDistrictId,
      pageCode: param.pageCode,
    },
    success: (res) => {
      fn(res);
    },
    fail: (res) => {
      fn(res);
    },
  });
}
//星球号商品卡片埋点
function getreportMktProductClick(param, fn) {
  doBeforeRequest({
    url: '/restapi/soa2/20725/json/reportMktProductClick',
    data: {
      clientAuth: param.clientAuth,
      pageid: param.pageid,
      page_type: param.page_type,
      materialid: param.materialid,
      product_infos: param.product_infos,
      click_type: param.click_type,
      note: param.note,
    },
    success: (res) => {
      fn(res);
    },
    fail: (res) => {
      fn(res);
    },
  });
}
//详情页调用，获取openId
function getJscode2session(param, fn) {
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/15416/json/scode2Session',
      data: {
        appId: param.appId,
        code: param.code,
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}

//详情页调用，相关笔记 瀑布流
function relatedRecommend(param, fn) {
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/14045/json/relatedRecommend',
      data: {
        articleId: param.articleId,
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}

//详情页 点评列表
function secondLevelCommentList(param, fn) {
  let data = {
    articleId: param.articleId,
    para: param.para,
  };
  if (typeof param.isNeedShowTag !== 'undefined')
    data.isNeedShowTag = param.isNeedShowTag;
  if (typeof param.isNeedInteractTag !== 'undefined')
    data.isNeedInteractTag = param.isNeedInteractTag;
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/14045/json/secondLevelCommentList',
      data: data,
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}

function ruleSortCommentList(param, fn) {
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/14045/json/ruleSortCommentList',
      data: param,
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}

//详情页 发布点评
function comment(param, fn) {
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/14045/json/comment',
      data: {
        action: param.action,
        commentId: param.commentId,
        comment: param.comment,
        isNeedInteractTag: true,
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}

//详情页 去关注
function attention(param, fn) {
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/14045/json/attention',
      data: {
        friendClientAuth: param.friendClientAuth,
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}

//详情页 取消关注
function cancelAttention(param, fn) {
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/10356/json/deleteFriendForApp',
      data: {
        UserClientAuth: param.userClientAuth,
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}

//是否实名认证
function isUserRealName(fn) {
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/15416/json/isUserRealName',
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}

//详情页 取消收藏
function cancelCollection(param, fn) {
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/10356/json/CollectionInfoCancel',
      data: {
        CollectionInfo: param.CollectionInfo,
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}

//详情页获取活动url
function advertBannerInfo(param, fn) {
  console.log('advertBannerInfoparam', param);
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/10319/json/advertBannerInfo',
      data: {
        Position: param.position,
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}

//详情页获取酒店卡片
function getHotelCard(param, fn) {
  console.log('getHotelCard', param);
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/14045/json/hotelForTest',
      data: {
        articleId: param.articleId,
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}

//根据话题id查询话题名字
function getTopicListByIds(param, fn) {
  console.log('getHotelCard', param);
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/14045/json/getTopicListByIds',
      data: {
        ids: param.ids,
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}

//详情页商品卡片
// function getTripShootProducts(param, fn) {
//   if (!__global.mock) {
//     doBeforeRequest({
//       url: '/restapi/soa2/14045/json/getTripShootProducts',
//       data: {
//         articleId: param.articleId,
//       },
//       success: (res) => {
//         fn(res);
//       },
//       fail: (res) => {
//         fn(res);
//       }
//     })
//   }
// }

//详情页商品卡片2
function getTripShootProducts(param, fn) {
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/14045/json/getTripShootGoods',
      data: {
        articleId: param.articleId,
        showCustomizedGoods: param.showCustomizedGoods,
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}

function getWechatAppOpenID(param, fn) {
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/15416/json/getWechatAppOpenID',
      data: {
        appId: param.appId,
        code: param.code,
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}

function submitUserSubscribeTimes(param, fn) {
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/16486/json/submitUserSubscribeTimes',
      data: {
        subscribeType: 1,
        businessType: 1,
        businessId: param.clientAuth,
        otherParameter: param.openID,
        submitType: 1,
        submitCount: 1,
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}

//详情页商品卡片
function getRiskInfo(param, fn) {
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/20725/json/getRiskInfo',
      data: {},
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}
// 获取任务积分
function drawRewardList(param, fn) {
  doBeforeRequest({
    url: '/restapi/soa2/16700/json/drawRewardList',
    data: {
      userTaskIdList: param,
    },
    success: (res) => {
      fn(res);
    },
    fail: (res) => {
      fn(res);
    },
  });
}

// 获取分享图
function requestGetShareImage(param, fn) {
  if (!__global.mock) {
    doBeforeRequest({
      url: '/restapi/soa2/15416/json/getShareImage',
      data: param,
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      },
    });
  }
}

module.exports = {
  tripShoot: tripShoot,
  action: action,
  bindShareToken: bindShareToken,
  getMyTripShootDtoList: getMyTripShootDtoList,
  getJscode2session: getJscode2session,
  searchPoi: searchPoi,
  relatedRecommend: relatedRecommend,
  searchTopicList: searchTopicList,
  secondLevelCommentList: secondLevelCommentList,
  ruleSortCommentList: ruleSortCommentList,
  initUploadVideo: initUploadVideo,
  uploadVideo: uploadVideo,
  comment: comment,
  attention: attention,
  cancelAttention: cancelAttention,
  getUserInfo: getUserInfo,
  isUserRealName: isUserRealName,
  cancelCollection: cancelCollection,
  advertBannerInfo: advertBannerInfo,
  getHotelCard: getHotelCard,
  getTopicListByIds: getTopicListByIds,
  getTripShootProducts: getTripShootProducts,
  getWechatAppOpenID: getWechatAppOpenID,
  submitUserSubscribeTimes: submitUserSubscribeTimes,
  getRiskInfo: getRiskInfo,
  moduleListSearch: moduleListSearch,
  getreportMktProductClick: getreportMktProductClick,
  drawRewardList: drawRewardList,
  requestGetShareImage: requestGetShareImage,
};
