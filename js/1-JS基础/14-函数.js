function add(a, b) {
  return a + b;
}
console.log(add(1)); // NaN 如果一个函数被调用，但有参数（argument）未被提供，那么相应的值就会变成 undefined。
// 1 + NaN = NaN
// ! 1 排除空值
// ! 空值合并运算符 ??
function showCount(count) {
  // 如果count为undefined或者null 提示unknown
  console.log(count ?? "unknown");
}
showCount(); // unknown
showCount(0); // 0
showCount(null); // unknown

// ! 2 没有return == return == return undefined
function doNothing() {}
function doNothing1() {
  return;
}
function doNothing2() {
  return undefined;
}

console.log(doNothing() === undefined); // true
console.log(doNothing1() === undefined); // true
console.log(doNothing2() === undefined); // true

// test pow(x, n) x的n次方
function pow(x, n) {
  if (n === 1) return x;
  return x * pow(x, n - 1);
}
console.log(pow(2, 10));
