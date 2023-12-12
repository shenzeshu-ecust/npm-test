import {
  cwx,
  _
} from './../../../../../../cwx/cwx';
const ServerUrls = {
  queryFormSceneInfo: "/restapi/soa2/13458/queryFormSceneInfo",
  queryFormSceneComponent: "/restapi/soa2/13458/queryFormSceneComponent",
  batchQueryFormSceneInfo: "/restapi/soa2/13458/batchQueryFormSceneInfo",
  loadTemplate: "/restapi/soa2/13458/loadTemplate",
  checkLogin: "/restapi/soa2/22559/checkLoginStatus",
}

/** 接口请求方法封装，新增任务队列，拒绝ES5 的 callback 写法，全部改成ES7 */
const apiServer = function (urlName, params) {
  try {
    return new Promise((resolve, reject) => {
      cwx.request({
        url: ServerUrls[urlName],
        data: params,
        success(res) {
          resolve(res.data)
        },
        fail(err) {
          reject(err)
        }
      })
    })
  } catch (error) {
    console.log('小程序请求报错了', error)
  }
}


const getInputSize = (value) => {
  if (!value) {
    return 0
  }
  const charCount = value.split('').reduce((prev, curr) => {
    // 英文字母和数字等算一个字符；这个暂时还不完善；
    if (/[a-z]|[0-9]|[,;.!@#-+/\\$%^*()<>?:"'{}~]/i.test(curr)) {
      return prev + 1.2
    }
    // 其他的算是2个字符
    return prev + 2
  }, 0)

  // 向上取整，防止出现半个字的情况
  return Math.ceil(charCount / 2)
}

const filterProps = function (val, scene) {
  // console.log('组件拿到的商品销售状态', val);
  // console.log('组件拿到的商品销售状态 1',  val["index"],  val["marketPrice"])
  if (!val || Object.keys(val).length == 0) return;
  try {
    val["change"] = true;
    let productPrice;
    if (typeof val["price"] !== "object") {
      productPrice = val["price"]
    }
    if (!val["btnText"]) {
      if (!val["displayPriceType"]) {
        if (!val["price"]) {
          val["btnText"] = "去看看"
        } else {
          val["btnText"] = "抢购"
        }
      } else {
        if (!val["price"]) {
          val["btnText"] = "去看看"
        } else {
          val["btnText"] = "抢购"
        }
      }
    }
    // console.log('拿到props 2', val,  val["btnText"])


    Object.keys(val).forEach((item, index) => {
      // score 评分 展示字符串 
      if (["score"].includes(item)) {
        val[item] = val[item] + ''
      }
      // 将产品价格保存下来
      if (["price"].includes(item)) {
        if (typeof (val["price"] * 1) == "string" || typeof val["price"] == "number") {
          productPrice = val["price"] || 0;
        } else {
          productPrice = val["price"] || ""
          val["price"] = ""
        }
      }
      // 产品图片
      if (val["imageUrl"]) {
        val["imageUrl"] = val["imageUrl"] || 'https://images3.c-ctrip.com/marketing/2022/11/sk/defalt_product.png'
      } else {
        val["imageUrl"] = 'https://images3.c-ctrip.com/marketing/2022/11/sk/defalt_product.png'
      }
      // 商品按钮
      if (["btnText"].includes(item)) {
        if (val.hasOwnProperty("saleStatus")) {
          if (val["saleStatus"] == 0) {
            val[item] = {
              "saleStatus": 0,
              "hide": "0",
              "content": ""
            }
          }
          if (val["saleStatus"] == 1) {
            if (typeof val["btnText"] === "string") {
              val[item] = {
                "saleStatus": 1,
                "hide": "1.0",
                "content": val["btnText"]
              }
            }
          }
          if (val["saleStatus"] == 3) {
            val["explainStatus"] = 0;
            val["recommendStatus"] = false;
            if (typeof val["btnText"] === "string") {
              val[item] = {
                "saleStatus": 3,
                "hide": "0.5",
                "content": val["btnText"]
              }
            }
          }
          if (val["saleStatus"] == 4) {
            val["explainStatus"] = 0;
            val["recommendStatus"] = false;
            if (typeof val["btnText"] === "string") {
              val[item] = {
                "saleStatus": 4,
                "hide": "0.5",
                "content": val["btnText"]
              }
            }
          }
        } else {
          if (typeof val["btnText"] === "string") {
            val[item] = {
              "saleStatus": 1,
              "hide": "1",
              "content": val["btnText"]
            }
          }
        }
      }

      // 商品名称
      if (["name"].includes(item)) {
        const currNameLen = getInputSize(val["name"], 2)
        if (val["goodsId"] == 481960) {
          // console.log('当前标题长度', currNameLen, val["name"], val["activityTag"])
        }

        const exportName = val["name"].substring(0, 30)
        // console.log('当前标题长度', currNameLen, val["name"])
        // console.log('当前标题长度 exportName', exportName)
        if (val.hasOwnProperty("activityTag")) {
          if (currNameLen > 26) {
            if (typeof val["name"] == "string") {
              let currName = val["name"];
              val["name"] = {
                "wrap": "one",
                "content": (currName.substring(0, 26) + '...') || (val["name"].substring(0, 26) + '...')
              }
            }
          }
        } else {
          if (currNameLen > 30) {
            if (typeof val["name"] == "string") {
              let currName = val["name"]
              val["name"] = {
                "wrap": "two",
                "content": (currName.substring(0, 30) + '...') || (val["name"].substring(0, 30) + '...')
              }
            }
          } else {
            if (typeof val["name"] == "string") {
              let currName = val["name"]
              val["name"] = {
                "wrap": "two",
                "content": currName || val["name"]
              }
            }
          }
        }
      }
      // 活动标签
      if (["customerTags"].includes(item)) {
        if (val[item] && val[item].length) {
          const allWord = val[item].reduce((acc, i) => acc += i);
          const allWordLen = allWord.length;
          if (allWordLen >= 16) {
            val[item].length = 4
            if (allWordLen >= 17) {
              val[item].length = val[item].length >= 4 ? 3 : val[item].length
            }
      
          }
          if (allWordLen < 13) {
            val[item].length = val[item].length
          }
          val[item] = val[item].filter(i => i != null)
        }
      }
      // 一些价格类的属性和字段
      if (["price", "marketPrice", "priceText", "couponPrice", "maxPrice", "predPrice", "displayPriceType"].includes(item)) {


        if (item == "price") {
          if (typeof productPrice == "number") {
            val["price"] = {
              "showUnit": true,
              "unit": "¥",
              "isshowqi": true,
              "text": false,
              "count": productPrice
            }
          } else {
            if (typeof (productPrice + 1) == "number") {
              val["price"] = {
                "showUnit": true,
                "unit": "¥",
                "isshowqi": true,
                "text": false,
                "count": productPrice
              }
            } else {
              val["price"] = {
                "showUnit": true,
                "unit": "¥",
                "isshowqi": true,
                "text": true,
                "count": productPrice
              }
            }
          }
          // console.log('当前的产品价格', val["price"])
        }
        // 商品价格
        if (item == "price" && !val["price"]) {
          val["marketPrice"] = ""
          // val["priceText"] = ""
          val["couponPrice"] = ""
          val["maxPrice"] = ""
          val["predPrice"] = ""
          val["discount"] = ""
          val["reduction"] = ""
        }
        // 促销规则
        if (item == "displayPriceType" && val["displayPriceType"]) {
          //   GTTD 价格展示类型
          //   1：展示 “免费预约”
          //   2：展示 “门票￥XX起”
          //   3：展示 “门市价￥XX起”
          //   4：起价 展示“免费”
          //   5：起价 展示空
          //   6：展示 “暂无报价”
          if (val["displayPriceType"] == 1) {
            val["price"] = {
              "showUnit": false,
              "unit": "text",
              "isshowqi": false,
              "text": true,
              "count": val["priceText"] || "免费预约"
            }
            val["marketPrice"] = ""
            val["priceText"] = ""
            val["couponPrice"] = ""
            val["maxPrice"] = ""
            val["predPrice"] = ""
            val["discount"] = ""
            val["reduction"] = ""
          }
          // 后端接口业务报错的err 弹窗，是项目本身就封装好的，在axios那里。 不是页面弹，我不应该也不能改 项目全局的 message 
          if (val["displayPriceType"] == 2 && productPrice && productPrice.count) {
            val["price"] = {
              "showUnit": false,
              "unit": "¥",
              "text": true,
              "isshowqi": false,
              "text": true,
              // "count": val["priceText"] || `门票¥${productPrice.count}起`
              "count": val["priceText"] || `¥${productPrice.count}`
            }
            val["priceText"] = "";
          }
          if (val["displayPriceType"] == 3 && productPrice && productPrice.count) {
            val["price"] = {
              "showUnit": false,
              "unit": "¥",
              "isshowqi": false,
              "text": true,
              "count": ""
            }
            // console.log('门市价 2',  val["price"])
          }
          if (val["displayPriceType"] == 4) {
            val["price"] = {
              "showUnit": false,
              "unit": "text",
              "isshowqi": false,
              "text": true,
              "count": val["priceText"] || "免费"
            }
            val["marketPrice"] = ""
            val["priceText"] = ""
            val["couponPrice"] = ""
            val["maxPrice"] = ""
            val["predPrice"] = ""
            val["discount"] = ""
            val["reduction"] = ""
          }
          if (val["displayPriceType"] == 5) {
            val["price"] = {
              "showUnit": false,
              "unit": "text",
              "isshowqi": false,
              "text": true,
              "count": val["priceText"] || ""
            }
            val["marketPrice"] = ""
            val["priceText"] = ""
            val["couponPrice"] = ""
            val["maxPrice"] = ""
            val["predPrice"] = ""
            val["discount"] = ""
            val["reduction"] = ""
          }
          if (val["displayPriceType"] == 6) {
            val["price"] = {
              "showUnit": false,
              "unit": "¥",
              "isshowqi": false,
              "text": true,
              // "count": val["priceText"] || "暂无报价"
              "count": val["priceText"] || ""
            }
            val["marketPrice"] = ""
            val["priceText"] = ""
            val["couponPrice"] = ""
            val["maxPrice"] = ""
            val["predPrice"] = ""
            val["discount"] = ""
            val["reduction"] = ""
          }
        }
        // 折扣价格
        if (["marketPrice"].includes(item) && val["marketPrice"] && val["price"]) {
          const processedPrice = Number(`${typeof val["price"] === "object" ? val["price"].count : val["price"]}`.replace('￥', ''));
          const processedMarketPrice = Number(`${val["marketPrice"]}`.replace('￥', ''));
          let showMarketPrice = true,
            discount, reduction;

          // console.log('需要展示折扣价格 1', processedPrice,  processedMarketPrice, val["discount"] );
          // console.log('需要展示折扣价格 marketPrice', val["marketPrice"],  );

          try {
            if (processedPrice === 0 || processedMarketPrice === 0 || processedMarketPrice === processedPrice) {
              showMarketPrice = false;
              val["marketPrice"] = "";
            }
            if (item === 'discount') {
              discount = (Math.ceil((processedPrice / processedMarketPrice) * 100) / 10).toFixed(1);
              if (discount === '0.0' || discount.includes('-')) {
                val["discount"] = {
                  "showMarketPrice": false,
                  "count": discount
                }
              } else {
                val["discount"] = {
                  "showMarketPrice": true,
                  "count": discount
                }
              }
            } else {
              discount = (Math.ceil((processedPrice / processedMarketPrice) * 100) / 10).toFixed(1);

              if (discount === '0.0' || discount.includes('-')) {
                showMarketPrice = false;
                val["marketPrice"] = ""
              }
              if (discount > 9.0) {
                val["discount"] = {
                  "showMarketPrice": false,
                  "count": ""
                }
              } else {
                val["discount"] = {
                  "showMarketPrice": true,
                  "count": discount
                }
              }

              reduction = (processedMarketPrice - processedPrice).toFixed(0);
              if (reduction === '0' || reduction.includes('-')) {
                val["reduction"] = {
                  "showMarketPrice": false,
                  "count": ""
                }
              } else {
                val["reduction"] = {
                  "showMarketPrice": true,
                  "count": reduction
                }
              }
            }
          } catch (error) {
            showMarketPrice = false;
          }
        }
        try {
          if (val["marketPrice"] && val["priceText"] == "免费") {
            console.log('当前遇到的商品是 资源类 且 价格是0，需要展示 免费')
            val["marketPrice"] = ""
          }
        } catch (error) {
          console.log('商卡折扣字段报错', error)
        }
      }
    })

    return val
  } catch (error) {
    console.log('解析报错', error)
  }
}

const filterSimpleProps = function (val, originVal) {


  if (!val || Object.keys(val).length == 0) return;
  if (val["filterNum"] && val["filterNum"] == 1) return val;
  try {
    val["filterNum"] = 1;
    val["title"] = val["name"] + '';
    val["change"] = true;
    let productPrice;
    if (typeof val["price"] !== "object") {
      productPrice = val["price"]
    }
    if (!val["btnText"]) {
      if (!val["displayPriceType"]) {
        if (!val["price"]) {
          val["btnText"] = ""
        } else {
          val["btnText"] = "抢"
        }
      } else {
        if (!val["price"]) {
          val["btnText"] = ""
        } else {
          val["btnText"] = "抢"
        }
      }
    }

    Object.keys(val).forEach((item, index) => {
      // score 评分 展示字符串 
      if (["score"].includes(item)) {
        val[item] = val[item] + ''
      }
      // 将产品价格保存下来
      if (["price"].includes(item)) {
        if (typeof (val["price"] * 1) == "string" || typeof val["price"] == "number") {
          productPrice = val["price"] || 0;
        } else {
          productPrice = val["price"] || ""
          val["price"] = ""
        }
      }
      // 产品图片
      if (val["imageUrl"]) {
        val["imageUrl"] = val["imageUrl"] || 'https://images3.c-ctrip.com/marketing/2022/11/sk/defalt_product.png'
      } else {
        val["imageUrl"] = 'https://images3.c-ctrip.com/marketing/2022/11/sk/defalt_product.png'
      }
      // 商品按钮
      if (["btnText"].includes(item)) {
        if (val.hasOwnProperty("saleStatus")) {
          if (val["saleStatus"] == 0) {
            val[item] = {
              "saleStatus": 0,
              "hide": "0",
              "content": ""
            }
          }

          if (val["saleStatus"] == 1) {
            if (typeof val["btnText"] === "string") {
              val[item] = {
                "saleStatus": 1,
                "hide": "1.0",
                "content": val["btnText"]
              }
            }
          }

          // 20230830新增逻辑
          if (val["saleStatus"] == 2) {
            if (typeof val["btnText"] === "string") {
              val[item] = {
                "saleStatus": 1,
                "hide": "1.0",
                "content": val["btnText"]
              }
            }
          }

          if (val["saleStatus"] == 3) {
            // val["explainStatus"] = 0;
            // val["recommendStatus"] = false;
            if (typeof val["btnText"] === "string") {
              val[item] = {
                "saleStatus": 3,
                "hide": "1.0",
                "content": val["btnText"]
              }
            }
          }
          if (val["saleStatus"] == 4) {
            // val["explainStatus"] = 0;
            // val["recommendStatus"] = false;
            if (typeof val["btnText"] === "string") {
              val[item] = {
                "saleStatus": 4,
                "hide": "1.0",
                "content": val["btnText"]
              }
            }
          }
        } else {
          if (typeof val["btnText"] === "string") {
            val[item] = {
              "saleStatus": 1,
              "hide": "1",
              "content": val["btnText"]
            }
          }
        }
      }

      // 活动标签
      if (["customerTags"].includes(item)) {
        if (val[item] && val[item].length) {
          const allWord = val[item].reduce((acc, i) => acc += i);
          const allWordLen = allWord.length;

          if (allWordLen >= 15) {
            val[item].length = 4;
            if (allWordLen >= 16) {
              val[item].length = val[item].length >= 4 ? 3 : val[item].length
            }
          }
          if (allWordLen < 13) {
            val[item].length = val[item].length
          }
          val[item] = val[item].filter(i => i != null)
        }
      }


      // 一些价格类的属性和字段
      if (["price", "marketPrice", "priceText", "couponPrice", "maxPrice", "predPrice", "displayPriceType"].includes(item)) {

        if (item == "price") {
          if (typeof productPrice == "number") {
            val["price"] = {
              "showUnit": true,
              "unit": "¥",
              "isshowqi": true,
              "text": false,
              "count": productPrice
            }
          } else {
            if (typeof (productPrice + 1) == "number") {
              val["price"] = {
                "showUnit": true,
                "unit": "¥",
                "isshowqi": true,
                "text": false,
                "count": productPrice
              }
            } else {
              val["price"] = {
                "showUnit": true,
                "unit": "¥",
                "isshowqi": true,
                "text": true,
                "count": productPrice
              }
            }
          }
          // console.log('当前的产品价格', val["price"])
        }
        // 商品价格
        if (item == "price" && !val["price"]) {
          val["marketPrice"] = ""
          // val["priceText"] = ""
          val["couponPrice"] = ""
          val["maxPrice"] = ""
          val["predPrice"] = ""
          val["discount"] = ""
          val["reduction"] = ""
        }
        // 促销规则
        if (item == "displayPriceType" && val["displayPriceType"]) {
          //   GTTD 价格展示类型
          //   1：展示 “免费预约”
          //   2：展示 “门票￥XX起”
          //   3：展示 “门市价￥XX起”
          //   4：起价 展示“免费”
          //   5：起价 展示空
          //   6：展示 “暂无报价”
          if (val["displayPriceType"] == 1) {
            val["price"] = {
              "showUnit": false,
              "unit": "text",
              "isshowqi": false,
              "text": true,
              "count": val["priceText"] || "免费预约"
            }
            val["marketPrice"] = ""
            val["priceText"] = ""
            val["couponPrice"] = ""
            val["maxPrice"] = ""
            val["predPrice"] = ""
            val["discount"] = ""
            val["reduction"] = ""
          }
          if (val["displayPriceType"] == 2 && productPrice && productPrice.count) {
            val["price"] = {
              "showUnit": false,
              "unit": "¥",
              "text": true,
              "isshowqi": false,
              "text": true,
              // "count": val["priceText"] || `门票¥${productPrice.count}起`
              "count": val["priceText"] || `¥${productPrice.count}`
            }
            val["priceText"] = "";
          }
          if (val["displayPriceType"] == 3 && productPrice && productPrice.count) {
            val["price"] = {
              "showUnit": false,
              "unit": "¥",
              "isshowqi": false,
              "text": true,
              "count": ""
            }
            // console.log('门市价 2',  val["price"])
          }
          if (val["displayPriceType"] == 4) {
            val["price"] = {
              "showUnit": false,
              "unit": "text",
              "isshowqi": false,
              "text": true,
              "count": val["priceText"] || "免费"
            }
            val["marketPrice"] = ""
            val["priceText"] = ""
            val["couponPrice"] = ""
            val["maxPrice"] = ""
            val["predPrice"] = ""
            val["discount"] = ""
            val["reduction"] = ""
          }
          if (val["displayPriceType"] == 5) {
            val["price"] = {
              "showUnit": false,
              "unit": "text",
              "isshowqi": false,
              "text": true,
              "count": val["priceText"] || "去看看"
            }
            val["marketPrice"] = ""
            val["priceText"] = ""
            val["couponPrice"] = ""
            val["maxPrice"] = ""
            val["predPrice"] = ""
            val["discount"] = ""
            val["reduction"] = ""
          }
          if (val["displayPriceType"] == 6) {
            val["price"] = {
              "showUnit": false,
              "unit": "¥",
              "isshowqi": false,
              "text": true,
              "count": val["priceText"] || "去看看"
            }
            val["marketPrice"] = ""
            val["priceText"] = ""
            val["couponPrice"] = ""
            val["maxPrice"] = ""
            val["predPrice"] = ""
            val["discount"] = ""
            val["reduction"] = ""
          }
        }
        // 折扣价格
        if (["marketPrice"].includes(item) && val["marketPrice"] && val["price"]) {
          const processedPrice = Number(`${typeof val["price"] === "object" ? val["price"].count : val["price"]}`.replace('￥', ''));
          const processedMarketPrice = Number(`${val["marketPrice"]}`.replace('￥', ''));
          let showMarketPrice = true,
            discount, reduction;

          try {
            if (processedPrice === 0 || processedMarketPrice === 0 || processedMarketPrice === processedPrice) {
              showMarketPrice = false;
              val["marketPrice"] = "";
            }
            if (item === 'discount') {
              discount = (Math.ceil((processedPrice / processedMarketPrice) * 100) / 10).toFixed(1);
              if (discount === '0.0' || discount.includes('-')) {
                val["discount"] = {
                  "showMarketPrice": false,
                  "count": discount
                }
              } else {
                val["discount"] = {
                  "showMarketPrice": true,
                  "count": discount
                }
              }
            } else {
              discount = (Math.ceil((processedPrice / processedMarketPrice) * 100) / 10).toFixed(1);
              if (discount === '0.0' || discount.includes('-')) {
                showMarketPrice = false;
                val["marketPrice"] = ""
              }
              if (discount > 9.0) {
                val["discount"] = {
                  "showMarketPrice": false,
                  "count": ""
                }
              } else {
                val["discount"] = {
                  "showMarketPrice": true,
                  "count": discount
                }
              }

              reduction = (processedMarketPrice - processedPrice).toFixed(0);
              if (reduction === '0' || reduction.includes('-')) {
                val["reduction"] = {
                  "showMarketPrice": false,
                  "count": ""
                }
              } else {
                val["reduction"] = {
                  "showMarketPrice": true,
                  "count": reduction
                }
              }

              if (val["discount"].count) {
                val["reduction"] = {
                  "showMarketPrice": false,
                  "count": ""
                }
              }
            }
          } catch (error) {
            showMarketPrice = false;
          }
        }
        try {
          if (val["marketPrice"] && val["priceText"] == "免费") {
            val["marketPrice"] = ""
          }
        } catch (error) {
          console.log('商卡折扣字段报错', error)
        }
      }

      // 商品名称
      if (["name"].includes(item)) {
        const currNameLen = getInputSize(val["name"], 2)
        if (val["goodsId"] == 481960) {
          // console.log('当前标题长度', currNameLen, val["name"], val["activityTag"])
        }
        // console.log('当前标题长度', currNameLen, val["name"])
        // console.log('当前标题长度 exportName', exportName)
        if (val.hasOwnProperty("activityTag")) {
          if (currNameLen > 26) {
            if (typeof val["name"] == "string") {
              let currName = val["name"];
              val["name"] = {
                "wrap": "one",
                "content": (currName.substring(0, 26) + '...') || (val["name"].substring(0, 26) + '...')
              }
            }
          }
        } else {
          if (currNameLen > 30) {
            if (typeof val["name"] == "string") {
              let currName = val["name"]
              val["name"] = {
                "wrap": "two",
                "content": (currName.substring(0, 30) + '...') || (val["name"].substring(0, 30) + '...')
              }
            }
          } else {
            if (!val["reduction"] && !val["discount"]) {
              if (typeof val["name"] == "string") {
                let currName = val["name"]
                val["name"] = {
                  "wrap": "one",
                  "content": currName || val["name"]
                }
              }
            } else {
              if (typeof val["name"] == "string") {
                let currName = val["name"]
                val["name"] = {
                  "wrap": "two",
                  "content": currName || val["name"]
                }
              }
            }

          }
        }
      }
    })


    // 去看看：无价格+2行标题+榜单  、 无价格+2行标题+标签

    // 价格见商品页：文字类价格+2行标题、文字类价格+标题+榜单、文字类价格+标题+标签、无价格+2行标题+无标签
    const titleLine = val["name"].wrap;
    const discount = val["discount"] ? val["discount"].showMarketPrice : false;
    const reduction = val["reduction"] ? val["reduction"].showMarketPrice : false;
    const showCustomerTags = originVal["customerTags"] ? (originVal["customerTags"].length ? true : false) : false;
    const showRankTag = originVal["rankTag"] ? (originVal["rankTag"] ? true : false) : false;
    const showPrice = originVal["price"] ? true : false;
    const showPriceText = originVal["priceText"] ? true : false;

    if ((!showPrice && titleLine == "two" && showRankTag) || (!showPrice && titleLine == "two" && showCustomerTags)) {
      val["price"].count = "去看看"
    }
    if (
      (!showPrice && titleLine == "two" && !showCustomerTags && !showRankTag) ||
      (!showPrice && showPriceText && titleLine == "two" && !showCustomerTags && !showRankTag) ||
      (!showPrice && showPriceText && titleLine == "two" && showCustomerTags && !showRankTag) ||
      (!showPrice && showPriceText && titleLine == "two" && !showCustomerTags && showRankTag)
    ) {
      val["price"].count = originVal["priceText"]
    }
    if (
      (!showPrice && titleLine == "one" && !showCustomerTags && !showRankTag) ||
      (!showPrice && titleLine == "one" && showCustomerTags && !showRankTag) ||
      (!showPrice && titleLine == "one" && !showCustomerTags && showRankTag) ||
      (!showPrice && showPriceText && titleLine == "one" && !showCustomerTags && !showRankTag) ||
      (!showPrice && showPriceText && titleLine == "one" && showCustomerTags && !showRankTag) ||
      (!showPrice && showPriceText && titleLine == "one" && !showCustomerTags && showRankTag)
    ) {
      if(val["price"]) {
        val["price"].count = originVal["priceText"]
      }
    }
    if (titleLine == "one") {
      if ((discount || reduction) && (showCustomerTags || showRankTag)) {
        val["name"].wrap = "two";
      }
    }

    if (val["price"] && val["price"].count == "去看看") {
      val["btnText"] = {
        "saleStatus": 0,
        "hide": "0",
        "content": ""
      }
    }
    if (val["price"] && val["price"].count == originVal["priceText"]) {
      val["btnText"]["content"] = "抢"
    }
    // priceText 字段有，但是为空， 有 price 字段
    if (!val["priceText"] && (val["price"] && !val["price"].count) && (val["price"] && val["price"].unit == "text")) {
      val["price"].count = "去看看"
      val["btnText"] = {
        "saleStatus": 0,
        "hide": "0",
        "content": ""
      }
    }

    // 无price 无 priceText
    // console.log('商品价格为空', val["price"], val["priceText"])
    if (!val["priceText"] && (!val["price"] || (!val["price"]["count"]))) {
      val["price"] = {
        "showUnit": false,
        "unit": "text",
        "isshowqi": false,
        "text": true,
        "count": "去看看"
      }
      val["btnText"] = {
        "saleStatus": 0,
        "hide": "0",
        "content": ""
      }
    }

    console.log('原始数据', originVal)
    // console.log('展示价格-数字', showPrice)
    // console.log('展示价格-文字', showPriceText)
    // console.log('标题行数', titleLine)
    // console.log('展示折扣', discount)
    // console.log('展示满减', reduction)
    // console.log('展示标签', showCustomerTags)
    // console.log('展示榜单', showRankTag)
    // console.log('遍历后的商品信息', val)

    return val
  } catch (error) {
    console.log('解析报错', error)
  }
}



module.exports = {
  apiServer: apiServer,
  filterProps: filterProps,
  filterSimpleProps: filterSimpleProps
};