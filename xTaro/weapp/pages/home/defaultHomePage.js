// 第二屏配置说明：
// position：在模块中显示的位置；
// bu：唯一值，和ubt值一样就行；
// buName：宫格中文名；
// ubt：埋点；
// h5url：H5跳转地址；
// url：小程序跳转地址；
// appId：独立小程序appId；
// path：独立小程序跳转地址（与appId同时出现）；
// imgUrl：icon地址。
// delete: Boolean 是否隐藏此宫格（默认不用配置）
// configure: { // 其他参数
//   needLogin: true // 是否需要登录
// }
module.exports = {
  "ABTest": "A",
  "titleItem": {
    "ubt": "titleqd",
    "url": "/pages/market/signIn/index?activityid=wechat_signin_activity"
  },
  "items": [
    {
      "bu": "hotel",
      "buName": "酒店",
      "ubt": "hotel",
      "url": "/pages/hotel/inquire/index",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.1.7/home-hotel.png"
    },
    {
      "bu": "flight",
      "buName": "机票",
      "ubt": "flight",
      "url": "/pages/flight/pages/home/index",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.1.7/home-flight.png"
    },
    {
      "bu": "train",
      "buName": "火车票",
      "ubt": "train",
      "url": "../train/index/index",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.1.7/home-train.png"
    },
    {
      "bu": "trip",
      "buName": "旅游",
      "ubt": "trip",
      "h5url": "https://m.ctrip.com/tangram/MTE1NjA=?ctm_ref=vactang_page_11560&isHideNavBar=YES",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.1.7/home-trip.png"
    },
    {
      "bu": "you",
      "buName": "攻略/景点",
      "ubt": "you",
      "url": "../you/destinationpage/destinationpage",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.1.7/home-you.png"
    },
    {
      "bu": "Homestay",
      "buName": "民宿/客栈",
      "ubt": "Homestay",
      "url": "/pages/tbnb/pages/common/webview/index?optionsData=%7B%22h5url%22%3A%22https%253A%252F%252Fm.tujia.com%253Fcode%253Dcmphome%22%7D",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.1.7/home-Homestay.png"
    },
    {
      "bu": "package",
      "buName": "机票+酒店",
      "ubt": "package",
      "h5url": "https://m.ctrip.com/webapp/cw/flight/flight-bundles/HomePage.html",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.1.7/home-transfer.png"
    },
    {
      "bu": "bus",
      "buName": "汽车/船票",
      "ubt": "bus",
      "url": "../bus/index/index",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.1.7/home-bus.png"
    },
    {
      "bu": "ticket",
      "buName": "门票/活动",
      "ubt": "ticket",
      "h5url": "https://m.ctrip.com/tangram/MTEyMzQ=?ctm_ref=vactang_page_11234&isHideNavBar=YES",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.1.7/home-ticket.png"
    },
    {
      "bu": "food",
      "buName": "美食",
      "ubt": "food",
      "testh5url": "https://m.uat.qa.nt.ctripcorp.com/webapp/gourmet/food/homeList/address.html?new=1&isHideNavBar=YES&ishideheader=true&seo=0",
      "h5url": "https://m.ctrip.com/webapp/gourmet/food/homeList/address.html?new=1&isHideNavBar=YES&ishideheader=true&seo=0",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.1.7/home-food.png",
      "configure": {
        "pageTitle":{
          "color": {
            "frontColor": "#ffffff",
            "backgroundColor": "#C82C2C" 
          }
        }
      }
    },
    {
      "bu": "hotelsale",
      "buName": "特价/爆款",
      "ubt": "hotelsale",
      "h5url": "https://m.ctrip.com/webapp/cw/gs/onsale/boomHome.html?sct=mini-ggrk",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.1.7/home-hotelsale.png"
    },
    {
      "bu": "transfer",
      "buName": "接送机/包车",
      "ubt": "transfer",
      "h5url": "https://m.ctrip.com/webapp/zhuanche/airport-transfers/index?s=car_back&channelid=235375",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/home-pickup.png"
    },
    {
      "bu": "car",
      "buName": "租车",
      "ubt": "car",
      "url": "/pages/carNew/isd/indexNew/index",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/home-car.png"
    },
    {
      "bu": "newvisa",
      "buName": "签证",
      "ubt": "newvisa",
      "h5url": "https://m.ctrip.com/tangram/visa?ctm_ref=vactang_page_4980&isHideNavBar=YES",
      "imgUrl": "https://dimg04.c-ctrip.com/images/0AS5612000aoashv5B8CD.png"
    },
    // {
    //   "bu": "oneday",
    //   "buName": "一日游",
    //   "ubt": "oneday",
    //   "h5url": "https://m.ctrip.com/webapp/activity/dest/dt-%E4%B8%8A%E6%B5%B7-2?titlename=%E4%B8%8A%E6%B5%B7&pshowcode=1daytrip&fromminiapp=weixin&allianceid=263528&sid=2812094&ouid=&sourceid=55555546&_cwxobj=%7B%22cid%22%3A%2209031064310782656071%22%2C%22appid%22%3A%22wx0e6ed4f51db9d078%22%2C%22mpopenid%22%3A%228cc2ba56-c891-499a-8c71-640cd714fa94%22%2C%22allianceid%22%3A%22263528%22%2C%22sid%22%3A%222812094%22%2C%22ouid%22%3A%22%22%2C%22sourceid%22%3A%2255555546%22%2C%22scene%22%3A1089%7D",
    //   "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.1.7/home-oneday.png"
    // }
    {
      "bu": "shopping",
      "buName": "购物/免税",
      "ubt": "shopping",
      "appId": "wx6dbd75f7ad6d94bc",
      "path": "/pages/gshop/h5index/index",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.1.7/home-shopping.png",
      "needOpenEmbedded": true
    }

  ],
  "cusitems": [
    {
      "bu": "oneday",
      "buName": "一日游",
      "ubt": "oneday",
      "h5url": "https://m.ctrip.com/webapp/activity/dest/dt-%E4%B8%8A%E6%B5%B7-2?titlename=%E4%B8%8A%E6%B5%B7&pshowcode=1daytrip&fromminiapp=weixin&allianceid=263528&sid=2812094&ouid=&sourceid=55555546&_cwxobj=%7B%22cid%22%3A%2209031064310782656071%22%2C%22appid%22%3A%22wx0e6ed4f51db9d078%22%2C%22mpopenid%22%3A%228cc2ba56-c891-499a-8c71-640cd714fa94%22%2C%22allianceid%22%3A%22263528%22%2C%22sid%22%3A%222812094%22%2C%22ouid%22%3A%22%22%2C%22sourceid%22%3A%2255555546%22%2C%22scene%22%3A1089%7D",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-oneday.png"
    },
    {
      "bu": "guide",
      "buName": "向导/包车",
      "ubt": "guide",
      "h5url": "https://m.ctrip.com/tangram/localguide?ctm_ref=vactang_page_6093&isHideNavBar=YES",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-guide.png"
    },
    {
      "bu": "insurance",
      "buName": "保险",
      "ubt": "insurance",
      "h5url": "https://m.ctrip.com/webapp/vacations/insurance/index",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-insurance.png"
    },    
    {
      "bu": "leader",
      "buName": "微领队",
      "ubt": "leader",
      "h5url": "https://m.ctrip.com/webapp/vacations/vtm/index?isHideNavBar=YES",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-leader.png",
      "configure": {
        "needLogin": true
      }
    },
    {
      "bu": "custom",
      "buName": "定制游",
      "ubt": "custom",
      "appId": "wx93b9f9d8c9b3e54d",
      "path": "pages/home/homepage",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-custom.png"
    },
    {
      "bu": "exchange",
      "buName": "外币兑换",
      "ubt": "exchange",
      "appId": "wx5213ca4731ec41c1",
      "path": "pages/forex/index/index?bid=35",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-exchange.png"
    },
    {
      "bu": "visa",
      "buName": "签证",
      "ubt": "visa",
      "h5url": "https://m.ctrip.com/tangram/visa?ctm_ref=vactang_page_4980&isHideNavBar=YES",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-visa.png"
    },
    {
      "bu": "wifi",
      "buName": "WiFi电话卡",
      "ubt": "wifi",
      "h5url": "https://m.ctrip.com/webapp/activity/wifilist?pshowcates=48&type=dt&cityId=100041&keyword=%E6%97%A5%E6%9C%AC&target=wifi",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-wifi.png"
    },    
    {
      "bu": "store",
      "buName": "携程门店",
      "ubt": "store",
      "h5url": "https://m.ctrip.com/webapp/vacations/csplatform/storelist",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-store.png"
    },
    {
      "bu": "sos",
      "buName": "紧急支援",
      "ubt": "sos",
      "h5url":"https://m.ctrip.com/webapp/vacations/vtm/sos?isHideNavBar=YES",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-sos.png"
    },
    // {
    //   "bu": "fqsc",
    //   "buName": "分期商城",
    //   "ubt": "fqsc",
    //   "h5url": "https://jr.ctrip.com/m/nano/page/ctrip/stagingMall?mktype=homescroll&isHideNavBar=YES",
    //   "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-fqsc.png"
    // },
    // {
    //   "bu": "lipin",
    //   "buName": "礼品卡",
    //   "ubt": "lipin",
    //   "h5url": "https://m.ctrip.com/webapp/lipin/money",
    //   "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-lipin.png",
    //   "configure": {
    //     "pageTitle": {
    //       "color": {
    //         "frontColor": "#000000",
    //         "backgroundColor": "#ffffff"
    //       }
    //     }
    //   }
    // },
    // {
    //   "bu": "deposit",
    //   "buName": "理财",
    //   "ubt": "deposit",
    //   "h5url": "https://secure.ctrip.com/webapp/wealth/home?platform=5&isHideNavBar=YES&bustype=1&position=29&bid=1001&cid=1005&pid=1001",
    //   "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-deposit.png"
    // },
    // {
    //   "bu": "loan",
    //   "buName": "借钱",
    //   "ubt": "loan",
    //   "h5url":"https://jr.ctrip.com/m/cano/page/ctrip/home?mktype=c_home_card&isHideNavBar=YES",
    //   "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-loan.png"
    // },
    // {
    //   "bu": "nqh",
    //   "buName": "拿去花",
    //   "ubt": "nqh",
    //   "h5url": "https://jr.ctrip.com/m/nano/page/ctrip/index?mktype=home_more&isHideNavBar=YES&navBarStyle=white",
    //   "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-nqh.png"
    // },
    // {
    //   "bu": "credit",
    //   "buName": "信用卡",
    //   "ubt": "credit",
    //   "h5url": "https://m.ctrip.com/webapp/ccard/list?isHideNavBar=YES&bid=8&cid=2&pid=3&popup=close",
    //   "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-credit.png",
    //   "configure": {
    //     "needLogin": true
    //   }
    // },
    // {
    //   "bu": "qiandao",
    //   "buName": "会员/签到",
    //   "ubt": "qiandao",
    //   "h5url": "https://m.ctrip.com/webapp/membercenter/index?isHideNavBar=YES&pushcode=sygg",
    //   "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-qiandao.png",
    //   "configure": {
    //     "needLogin": true
    //   }
    // },
    // {
    //   "bu": "super",
    //   "buName": "超级会员",
    //   "ubt": "super",
    //   "h5url": "https://contents.ctrip.com/buildingblocksweb/special/membershipcard/index.html?sceneid=1&productid=14912&ishidenavbar=yes&pushcode=act_svip_hm28",
    //   "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-super.png"
    // },
    // {
    //   "bu": "youpin",
    //   "buName": "会员商城",
    //   "ubt": "youpin",
    //   "h5url": "https://m.ctrip.com/webapp/mall/index",
    //   "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-youpin.png"
    // },
    // {
    //   "bu": "student",
    //   "buName": "学生权益",
    //   "ubt": "student-rights",
    //   "h5url": "https://m.ctrip.com/webapp/train/activity/20200710-ctrip-stu-member-card/?isHideNavBar=Yes",
    //   "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-student.png"
    // },   
    // {
    //   "bu": "c_crh_travel",
    //   "buName": "旅游地图",
    //   "ubt": "c_crh_travel",
    //   "url": "/pages/crh/webview/webview?h5Url=https%3a%2f%2fm.ctrip.com%2fwebapp%2ftrain%2fcrh%2fplan%2fcrhList.html%3finMini%3d1",
    //   "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-c_crh_travel.png"
    // },
    // {
    //   "bu": "poetry",
    //   "buName": "携程小诗机",
    //   "ubt": "poetry",
    //   "h5url": "https://pages.c-ctrip.com/ailee/poetry/index.html?time=20180213",
    //   "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-poetry.png"
    // },
    // {
    //   "bu": "baggage",
    //   "buName": "行李寄送",
    //   "ubt": "baggage",
    //   "h5url": "https://m.ctrip.com/webapp/cloudbag/home/booksp?channel=54",
    //   "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-baggage.png",
    //   "configure": {
    //     "needLogin": true
    //   }
    // },
    {
      "bu": "business",
      "buName": "企业差旅",
      "ubt": "business",
      "h5url": "https://ct.ctrip.com/webapp/corp-campaign/campaign/movements/wxxcx.html",
      "imgUrl": "https://dimg04.c-ctrip.com/images/0AS0x1200099c09nh39F9.png"
    },
    // {
    //   "bu": "conference",
    //   "buName": "公司会务",
    //   "ubt": "conference",
    //   "h5url": "https://mice.ctrip.com/purposeh5",
    //   "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-conference.png"
    // },
    // {
    //   "bu": "card",
    //   "buName": "银行卡优惠",
    //   "ubt": "card",
    //   "h5url": "https://pages.c-ctrip.com/Finance/201907/media/index.html?from_native_page=1&title=银行卡优惠",
    //   "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-card.png"
    // },
    {
      "bu": "join",
      "buName": "加盟合作",
      "ubt": "join",
      "h5url": "https://m.ctrip.com/webapp/more/cooperation.html",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-join.png"
    },
    // {
    //   "bu": "cooperation",
    //   "buName": "旅游局合作",
    //   "ubt": "cooperation",
    //   "h5url": "https://dstn.ctrip.com/index",
    //   "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-cooperation.png"
    // },
    // {
    //   "bu": "immigration",
    //   "buName": "移民服务",
    //   "ubt": "immigration",
    //   "h5url": "https://m.hinabian.com/assess/index.html?cid=ctripmore170906",
    //   "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-immigration.png"
    // },
    // {
    //   "bu": "ownership",
    //   "buName": "海外置业",
    //   "ubt": "ownership",
    //   "h5url": "https://m.hinabian.com/hf/ctrip/?cid=ctrip.ctriph5.GDW.20190403",
    //   "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-ownership.png"
    // },
    {
      "bu": "alleviation",
      "buName": "旅游扶贫",
      "ubt": "alleviation",
      "h5url": "https://contents.ctrip.com/activitysetupapp/mkt/index/zhuangmeishanhe",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-alleviation.png"
    },
    {
      "bu": "welfare",
      "buName": "携程公益",
      "ubt": "welfare",
      "h5url": "https://contents.ctrip.com/webapp/publicwelfare/index?popup=close&disable_webview_cache_key=1&pushcode=main",
      "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.7.1/more-welfare.png"
    }
  ]
}
