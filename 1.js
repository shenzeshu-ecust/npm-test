// let array = [1, 2, 3];
// for (let i = 0; i < array.length; i++) {
//   console.log(i);
// }
const a = ["asda/sasda", "/aads/adb", "/ade/asdr/fdgft"];

let res = a.map((v) => {
  let index = v.lastIndexOf("/");
  return v.slice(index + 1);
});
console.log(res);

const obj = [
  { key1: "a", key2: "b", key3: "c" },
  { key1: "a", key2: null, key3: "c" },
  { key1: "d", key2: "e", key3: "f" },
];

console.log(Object.values(obj[0]));
let r = obj.filter((item) => {
  const value = Object.values(item); // 得到的是 value: [ 'a', 'b', 'c' ]
  return value.every((v) => v !== null); // 判断有没有null，有则返回 false
});
console.log(r);
