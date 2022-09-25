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
const obj1 = {a: true}
const obj2 = {a: false, b: 'name'}
const obj3 = {a: true}
const obj4 = {a: false, b: 'age'}

const arr = [obj1, obj2, obj3, obj4]
console.log(arr.sort((x, y) => Number(y.a) - Number(x.a) ))
