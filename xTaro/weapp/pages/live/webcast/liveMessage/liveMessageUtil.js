/*
 * @Author: sun_ping
 * @Date: 2023-06-20 10:41:00
 * @LastEditors: sun_ping
 * @LastEditTime: 2023-06-26 11:17:43
 * @Description: 
 */

const messageType = {
  Notice: 0,      // 直播间公告
  Message: 1,     // 普通消息
  Fabulous: 2,    // 点赞
  Join: 3,        // 加入直播间
  Exit: 4,        // 退出直播间
  Kick: 5,        // 踢出直播间
  Gag: 6,         // 禁言
  At: 7,          // at发言
  Follow: 8,      // 关注主播
  Share: 9,       // 分享直播
  Poi: 10,        // poi变化
  End: 11,        // 直播结束
  Reward: 12,     // 有可领取奖励
  Mission: 13,    // 任务差多少领取 toast消息
  Cutoff: 14,     // 主播被断流
  Gift: 15,       // 礼物
  Alert: 16,      // 主播警告弹框
  Drift: 17,      // 直播间飘过公告
  Notify: 19,      // 系统通知， 蓝色的系统通知文本	
  V_REWARD: 101,   // 视频打赏

  STAT_LIVE: 102,   // 开始直播
  REFRESH_SHELVES: 103,   // 刷新货架
  SHOW_SHOP_CARD: 104,   // 显示商品卡片
  HIDE_SHOP_CARD: 105,   // 隐藏商品卡片
  TOP_MESSAGE: 106,  // 顶层消息
  TEMP_MESSAGE: 108,  // 临时消息
  SHOW_LOTTERY: 109,  //显示抽奖
  SHOW_LOTTERY_RESULT: 110,//开奖通知（福袋的抽奖结果）
  HIDE_LOTTERY: 200,   //隐藏抽奖
  SHOW_HOTBANNER: 201,  //显示爆款， 公告修改
  HIDE_HOTBANNER: 202, //隐藏爆款
  RELOAD_DATA: 203, //重新加载数据
  CHANGE_PULLSTREAM: 204, //切换视频流
  REFRESH_LIVE: 205,  //更新直播间相关信息
  MICROCONNECT: 300, //连麦消息通知
  ASK_GOODS_EXPLAIN: 207, //求讲解商品消息
  REPLY_TO_COMMENTS:111 , // 主播回复评论
  
}

function getLocalMessage(type, message, audience) {
  return {
    id: new Date().getTime(),
    liveMessage: {
      messageType: type,
      message: message,
      userPhoto: audience.imageUrl || "",
      inputObj: {
        text: message || '',
        wrapperStyle: `word-break:break-all; line-height:18px; font-size: 14px; color: #fff`, // 组件壳的行内样式（注意：行内样式中，尺寸单位应为 px）
        cemojiStyle: 'width:34rpx; height:34rpx; vertical-align:middle;'
      }
    },
    levelCode:audience.levelCode,
    nickName: audience.userName || "",
    isTempMsg : (type == messageType.Follow || type == messageType.Share)
  };
}



module.exports = {
  messageType,
  getLocalMessage,
}
