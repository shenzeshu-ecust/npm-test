import {
  cwx
 } from '../../../../cwx/cwx.js';
 
 function getLiveSlideList(param, fn){
  cwx.request({
    url: '/restapi/soa2/13184/json/getLiveSlideList',
    data: param,
    success: (res) => {
      fn(res);
    },
    fail: (res) => {
      fn(res);
    }
  })
 }

function watchLive(param, fn) {
    cwx.request({
      url: '/restapi/soa2/13184/json/watchLive',
      data: param,
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      }
    })
}

function watchLiveGuest(param, fn) {
    cwx.request({
      url: '/restapi/soa2/13184/json/watchLiveGuest',
      data: param,
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      }
    })
}

function searchUserCard(param, fn) {
    cwx.request({
      url: '/restapi/soa2/13184/json/searchUserCard',
      data: {
        ctripUserID: param.ctripUserID,
        isGuest: true
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      }
    })
}

function reserveLive(param, fn) {
    cwx.request({
      url: '/restapi/soa2/13184/json/reserveLive',
      data: param,
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      }
    })
}



function getGoodsList(param, fn) {
    cwx.request({
      url: '/restapi/soa2/13184/json/getGoodsList',
      data: param,
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      }
    })
}


function sendChatRoomMessage(param, fn) {
  let data ={
    message: param.message,
    liveId: param.liveId
  }
  if(param.localId) data.localId = param.localId;
    cwx.request({
      url: '/restapi/soa2/13256/json/sendChatRoomMessage',
      data,
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      }
    })
  }
  
function getMessage(param,fn) {
  cwx.request({
    url:'/restapi/soa2/13256/json/getMessages',
    data:{
      //lastMessageId:param.lastMessageId,
      //chatRoomId:param.chatRoomId,
      nextMessageKey: param.nextMessageKey,
      liveId: param.liveId
    },success:(res) =>{
      fn(res);
    },fail:(res)=>{
      fn(res); 
    }
  })
}


function followUser(param, fn) {
    cwx.request({
      url: '/restapi/soa2/13184/json/followUser',
      data: {
        fromCtripUserID: "",
        toCtripUserID: param.toCtripUserID
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      }
    })
} 

function cancelFollowUser(param, fn) {
    cwx.request({
      url: '/restapi/soa2/13184/json/cancelFollowUser',
      data: {
        fromCtripUserID: "",
        toCtripUserID: param.toCtripUserID
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      }
    })
} 

function getRoomUsersByPage(param, fn) {
    cwx.request({
      url: '/restapi/soa2/13256/json/getRoomUsersByPage',
      data: {
        //chatRoomId: param.chatRoomId,
        pageSize: param.pageSize,
        direction:param.direction,
        lastTimeStamp:param.lastTimeStamp,
        liveId: param.liveId
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      }
    })
}

function getLottery(param, fn) {
    cwx.request({
      url: '/restapi/soa2/13184/json/lottery',
      data: {
        ...param
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => {
        fn(res);
      }
    })
}

function getLiveAds(param, fn) {
    cwx.request({
      url: '/restapi/soa2/13184/json/getLiveAds',
      data: {
        ...param
      },
      success: (res) => {
        fn(res);
      },
      fail: (res) => { 
        fn(res);
      }
    })
}

function receiveCouponCodeList(param, fn) {
    cwx.request({
      url: '/restapi/soa2/20880/json/receiveCouponCodeList',
      data: param,
      success: (res) => {
        fn(res);
      },
      fail: (res) => { 
        fn(res);
      }
    })
}

function getLiveSquare(param, fn) {
    cwx.request({
      url: '/restapi/soa2/13184/json/getLiveSquare',
      data: param,
      success: (res) => {
        fn(res);
      },
      fail: (res) => { 
        fn(res);
      }
    })
}

function getLiveGoods(param, fn) {
    cwx.request({
      url: '/restapi/soa2/13184/json/getLiveGoods',
      data: param,
      success: (res) => {
        fn(res);
      },
      fail: (res) => { 
        fn(res);
      }
    })
}

//福袋中奖人员
function lotteryResultList(param, fn) {
  cwx.request({
    url: '/restapi/soa2/13184/json/lotteryResultList',
    data: param,
    success: (res) => {
      fn(res);
    },
    fail: (res) => { 
      fn(res);
    }
  })
}

function postSuggestExplainGoods(param, fn) {
  cwx.request({
    url: '/restapi/soa2/13184/json/postSuggestExplainGoods',
    data: param,
    success: (res) => {
      fn(res);
    },
    fail: (res) => { 
      fn(res);
    }
  })
}

function joinChatRoom(param, fn) {
    cwx.request({
      url: '/restapi/soa2/13256/json/joinChatRoom',
      data: param,
      success: (res) => {
        fn(res);
      },
      fail: (res) => { 
        fn(res);
      }
    })
  }

  function getImPlusChatInfo(param, fn) {
    cwx.request({
      url: '/restapi/soa2/13184/json/getImPlusChatInfo',
      data: param,
      success: (res) => {
        fn(res);
      },
      fail: (res) => { 
        fn(res);
      }
    })
  }

  function getRecommendLiveGoods(param,fn) {
    cwx.request({
      url: '/restapi/soa2/13184/json/getRecommendLiveGoods',
      data: param,
      success: (res) => {
        fn(res);
      },
      fail: (res) => { 
        fn(res);
      }
    })
  }

  function getDisplayTheme(param,fn) {
    cwx.request({
      url: '/restapi/soa2/13184/json/getDisplayTheme',
      data: param,
      success: (res) => {
        fn(res);
      },
      fail: (res) => { 
        fn(res);
      }
    })
  }

  function batchQueryFormSceneInfo(param,fn){
    cwx.request({
      url: '/restapi/soa2/13458/batchQueryFormSceneInfo',
      data: param,
      success: (res) => {
        fn(res);
      },
      fail: (res) => { 
        fn(res);
      }
    })
  }

  function getLiveInfo(param){
    return new Promise((resolve,reject)=>{
      cwx.request({
        url: '/restapi/soa2/13184/getLiveInfo',
        data: param,
        success: (res) => {
            resolve(res)
        },
        fail: (res) => { 
          reject(res)
        }
      })
    })
    
  }


module.exports = {
  getLiveSlideList:getLiveSlideList,
  watchLive: watchLive,
  watchLiveGuest: watchLiveGuest,
  searchUserCard: searchUserCard,
  reserveLive: reserveLive,
  getGoodsList: getGoodsList,
  sendChatRoomMessage: sendChatRoomMessage,
  followUser: followUser,
  getMessage: getMessage,
  getRoomUsersByPage: getRoomUsersByPage,
  getLottery: getLottery,
  getLiveAds: getLiveAds,
  receiveCouponCodeList: receiveCouponCodeList,
  getLiveSquare: getLiveSquare,
  getLiveGoods: getLiveGoods,
  cancelFollowUser: cancelFollowUser,
  lotteryResultList:lotteryResultList,
  postSuggestExplainGoods: postSuggestExplainGoods,
  joinChatRoom: joinChatRoom,
  getImPlusChatInfo: getImPlusChatInfo,
  getRecommendLiveGoods:getRecommendLiveGoods,
  getDisplayTheme:getDisplayTheme,
  batchQueryFormSceneInfo:batchQueryFormSceneInfo,
  getLiveInfo:getLiveInfo
}