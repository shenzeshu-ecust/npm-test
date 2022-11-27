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
const arr1 = [1, 0];
console.log(arr1.slice(1));
