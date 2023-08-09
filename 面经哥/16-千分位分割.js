function insertDot(nums) {
  let str = nums.toString();
  let res = [];
  let init = 0;
  // ! 注意是str的length。数字没有length属性
  // todo  从后往前遍历
  for (let i = str.length - 1; i >= 0; i--) {
    console.log(i);
    if (init === 3) {
      init = 0;
      res.push(",");
    }
    res.push(str[i]);
    init++;
  }
  return res.reverse().join("");
}

// 正则一个表达式(?=pattern)，术语叫零宽断言，或者也叫正向肯定预查。
// 指的是：配合正则表达式进行匹配，但是不获取该匹配。下次匹配还是从该位置开始。
let num = 100000000;
let s = num.toString().replace(/\B(?=(\d{3})+$)/g, ",");
console.log(s);

function formatNumber(num) {
  num = num.toString();
  let reg = num.indexOf(".") > -1 ? /\B(?=(\d{3})+\.)/g : /\B(?=(\d{3})+$)/g;
  return num.replace(reg, ",");
}

let s1 = formatNumber(1234.5678); // "1,234.5678"
let s2 = formatNumber(1234); // "1234"
console.log(s1, s2);
