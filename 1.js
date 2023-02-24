// let array = [1, 2, 3];
// for (let i = 0; i < array.length; i++) {
//   console.log(i);
// }
// const a = ["asda/sasda", "/aads/adb", "/ade/asdr/fdgft"];

// let res = a.map((v) => {
//   let index = v.lastIndexOf("/");
//   return v.slice(index + 1);
// });
// console.log(res);

// const obj = [
//   { key1: "a", key2: "b", key3: "c" },
//   { key1: "a", key2: null, key3: "c" },
//   { key1: "d", key2: "e", key3: "f" },
// ];

// console.log(Object.values(obj[0]));
// let r = obj.filter((item) => {
//   const value = Object.values(item); // 得到的是 value: [ 'a', 'b', 'c' ]
//   return value.every((v) => v !== null); // 判断有没有null，有则返回 false
// });
// console.log(r);
// let b = false;
// if (typeof b === "boolean") {
//   return b === true ? "y" : "n";
// } else {
//   return test;
// }
// const state = ["b"];
// function change(state) {
//   state.push("a");
// }
// change(state);
// console.log(state);
// let obj1 = { a: 1, b: 2, c: 3 };
// let obj2 = { a: "a", b: "b", c: "c" };
// Object.assign(obj1, obj2);
// console.log(obj1);
// let obj = {}
// Object.defineProperty(obj, 'name', {
//     value: 1,
//     writable: true
// })
// console.log(obj) // obj为 {}
const arr = [
  {
    id: 5,
    channel: "",
    biztypesource: "特价酒店",
    departure: "杭州,杭州市",
    destination: "",
    travelsdate: null,
    traveledate: null,
    isStu: 1,
    level: 4,
    bannerImg: "",
    popupImg: "",
    mprice: 50,
    topImg: "",
    desctxt: "赶快分享给你的小伙伴吧~",
    guideMap: "",
    tags: "",
    createdAt: "2022-10-21T07:48:14.000Z",
    updatedAt: "2022-10-21T07:48:14.000Z",
  },
  {
    id: 6,
    channel: "小红书",
    biztypesource: "特价酒店",
    departure: "杭州,杭州市",
    destination: "",
    travelsdate: null,
    traveledate: null,
    isStu: 1,
    level: 4,
    bannerImg: "",
    popupImg: "",
    mprice: 50,
    topImg: "",
    desctxt: "赶快分享给你的小伙伴吧~",
    guideMap: "",
    tags: "#智行出行,#我的飞行日记",
    createdAt: "2022-10-21T08:30:06.000Z",
    updatedAt: "2022-10-21T08:30:06.000Z",
  },
  {
    id: 7,
    channel: "抖音",
    biztypesource: "特价酒店",
    departure: "杭州,杭州市",
    destination: "上海,上海市",
    travelsdate: null,
    traveledate: null,
    isStu: 1,
    level: 4,
    bannerImg: "",
    popupImg: "",
    mprice: 50,
    topImg: "",
    desctxt: "赶快分享给你的小伙伴吧~",
    guideMap: "",
    tags: "#智行出行,#我的飞行日记",
    createdAt: "2022-10-21T08:30:19.000Z",
    updatedAt: "2022-10-21T08:30:19.000Z",
  },
];
let res = arr.map((config, i) => ({
  ...config,
  departure: config.departure && config.departure.split(","),
  destination: config.destination && config.destination.split(","),
  guideMap: config.guideMap && config.guideMap.split(","),
  tags: config.tags && config.tags.split(","),
}));
console.log(res);

// async function getMatchConfigData(
//   {
//     channel,
//     biztypesource,
//     departure,
//     destination,
//     travelsdate,
//     traveledate,
//     isStu,
//   },
//   req
// ) {
//   const { ZtripPublicAreaMaster } = req.model.trnztripmarket;
//   const record = await ZtripPublicAreaMaster.findOne({
//     where: {},
//     order: [["level", "asc"]],
//   });
//   return {};
// }
// module.exports = {
//   getMatchConfigData,
// };
// const obj = {};
// const arr1 = [{ m_character_id: "123" }, { m_server_id: "456" }];
// const result = arr1.reduce((pre, cur) => ({ ...pre, ...cur }));
// console.log(result);
// let s = [
//   {
//     optionKey: "expireTime",
//     optionValue: '{"startValue":"2022-11-09","endValue":"2022-12-05"}',
//   },
//   { optionKey: "productLine", optionValue: "1" },
//   {
//     optionKey: "promotionId",
//     optionValue:
//       '[{"labelName":"黑钻年卡150元满减券","labelType":1,"labelId":"655921041"},{"labelName":"开户奖励-火车50元满减券","labelType":1,"labelId":"361389034"}]',
//   },
// ];
// console.log(s.split(",").join("，"));
// const arr1 = [1, 0];
// console.log(arr1.slice(1));
// console.log(Number(""));
// console.log(JSON.parse("false"));
// console.log(JSON.parse("true"));
// import moment from "moment";
// const a = [
//   { time: "10:30" },
//   { time: "09:10" },
//   { time: "12:30" },
//   { time: "00:12" },
// ]; // 对数组进行排序（按时间先后）

// const result = a.sort((a, b) => {
//   let m = new Date("2022-4-1 " + a.time).getTime();
//   let n = new Date("2022-4-1 " + b.time).getTime();
//   return m - n;
// });
// console.log(result);
// var fruits = ["Banana", "Orange", "Apple", "Mango"];
// fruits.reverse();
// console.log(fruits.reverse(), fruits);

// var findNumberIn2DArray = function (matrix, target) {
//   let length = matrix.length - 1;
//   return fn(length, 0, target, matrix);
// };
// function fn(m, n, target, matrix) {
//   let col = matrix[0].length;
//   if (m < 0 || n == col) return false;
//   if (matrix[m][n] === target) return true;
//   else if (matrix[m][n] > target) {
//     m--;
//   } else {
//     n++;
//   }
//   return fn(m, n, target, matrix);
// }

// let arrlist = [
//   [1, 4, 7, 11, 15],
//   [2, 5, 8, 12, 19],
//   [3, 6, 9, 16, 22],
//   [10, 13, 14, 17, 24],
//   [18, 21, 23, 26, 30],
// ];
// console.log(findNumberIn2DArray(arrlist, 5));

// let str = "abc";
// str[1] = "d"; // 无法通过这种方式原地改变字符串
// console.log(str);

// console.log("a  c".split(""));
// console.log("" == " ");

// const arrrr = JSON.parse(
//   '[{"resource_amount":258,"index":0,"resource_did":3301000604}]'
// );
// console.log(arrrr[0]);

// console.log(Object.prototype.toString.call(1) === "[object String]");

// console.log(5 / 3);
// let i = 2;
// console.log(i & 1);
// console.log(i);

const TOUCH_RANGE_WAY_LABEL_OPTIONS = [
  {
    label: "短信",
    value: "Sms",

    sendCountName: "smsUserCount",
  },
  {
    label: "公众号模板",
    value: "WechatOfficial",

    sendCountName: "officialUserCount",
  },
  {
    label: "订阅消息",
    value: "WechatMiniProgram",

    sendCountName: "routineUserCount",
  },
  {
    label: "app推送",
    value: "AppPush",

    sendCountName: "pushUserCount",
  },
  {
    label: "外呼",
    value: "OutCall",

    sendCountName: "outCallCount",
    noVarWay: true,
  },
  {
    label: "公众号文章",
    value: "WechatOfficialArticle",

    sendCountName: "officialArticleUserCount",
    noVarWay: true,
  },
  {
    label: "企微群发",
    value: "QyWechat",

    sendCountName: "qyWechatUserCount",
  },
  {
    label: "企微朋友圈",
    value: "QyWechatPyq",

    sendCountName: "qyWechatUserCount",
    noVarWay: true,
  },
  {
    label: "Edm",
    value: "Edm",

    sendCountName: "edmUserCount",
  },
  {
    label: "站内信",
    value: "Internal",

    sendCountName: "pushUserCount",
  },
  {
    label: "企微流失召回",
    value: "QyWechatReCall",

    sendCountName: "qyWechatUserCount",
  },
  {
    label: "整体运营",
    value: "Combination",

    sendCountName: "allUserCount",
  },
];
// const sendWayMap = TOUCH_RANGE_WAY_LABEL_OPTIONS.map((item) => {
//   const key = item.value;
//   const val = item.label;
//   return {
//     key,
//     val,
//   };
// });
// let obj = {};
// sendWayMap.forEach((item) => {
//   obj[item.key] = item.val;
// });
// console.log(obj);
// haodou;

// function partition(nums, target) {
//   let i = 0;
//   let j = nums.length - 1;
//   while (i < j) {
//     let mid = Math.floor((i + j) / 2);
//     if (nums[mid] >= target) j = mid;
//     else i = mid + 1;
//   }
//   return i;
// }

// let arrlist = [1, 3, 4, 4, 6, 7];
// console.log("*", partition(arrlist, 0));
// let a = {
//   // * 这种是属性
//   eat: function () {},
// };

// let b = {
//   __proto__: a,
//   eat() {
//     super.eat();
//   },
// };
// b.eat(); // 报错：错误调用super!  因为这里没有[[HomeObject]]
// let ss = console.log("维京狂战团是维京战士中巅峰战力的集结。\n在战场之上，总是会爆发出惊人的战力。他们仿佛不知疲倦、不知疼痛，宛如发狂一般杀入敌阵，直至战斗结束或者彻底不能动弹。\n维京狂战团狂暴的战斗方式令敌人胆颤。在交锋之前，披着熊皮的他们会借助强悍的身体，像战车一样高速冲向敌阵，将敌人击倒在地。而紧随的战士将会高高跃起，以泰山崩裂般的气势，将手中的双斧砸向敌人的头顶。当战斗陷入胶着，这些狂暴的维京战士于战斗中积攒的怒意将会完全爆发，陷入彻底的疯狂。进入疯狂状态的战士的力量将会更胜平常，将给周边敌人造成毁灭的打击。但同时，获得疯狂力量的代价则是丧失全部理智，沦为只知战斗的杀戮机器，直至战斗结束，或者死亡。");
// console.log(Object.getOwnPropertyNames({ a: "1" }));
// new Promise((resolve, reject) => {
//   unde();
// })
//   .then()
//   .catch(() => {
//     console.log(1);
//   })
//   .catch(() => {
//     console.log(2);
//   });

// new Promise((resolve, reject) => {
//   unde();
// })
//   .then()
//   .catch(() => {
//     console.log(1);
//   })
//   .then(() => {
//     console.log(2);
//   });
// new Promise(function (resolve, reject) {
//   setTimeout(() => {
//     try {
//       throw new Error("Whoops!");
//     } catch (error) {
//       console.log(error.name);
//     }
//   }, 1000);
// }).catch(console.log);

// let map = new Map([
//   [1, "a"],
//   [2, "b"],
// ]);
// let s = map.entries();
// console.log(s);
// Promise.any([
//   new Promise((resolve, reject) =>
//     setTimeout(() => reject(new Error("Ouch!")), 1000)
//   ),
// ]).then(null, (error) => {
//   console.log(error.constructor.name); // AggregateError
//   console.log(error.errors[0]); // Error: Ouch!
// });
// let ress = Promise.resolve(1);
// console.log(ress.then());
// let b = {
//   a: "a",
// };
// console.log(Object.values(b)[]);

// a为是都线上， ’1‘为线上
let array = [
  { a: true },
  { a: false },
  { a: true },
  { a: false },
  { a: false },
  { a: true },
  { a: false },
];
// 双指针
function sort(arr) {
  let i = 0;
  let j = arr.length - 1;
  while (i < j) {
    while (i < j && arr[j].a === false) j--;
    while (i < j && arr[i].a === true) i++;
    if (i < j) {
      let temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
      i++;
      j--;
    }
  }
  return arr;
}
let ress = sort(array);
console.log(ress);
