// ! 1 Rest参数 ...
// ~ Rest 参数必须放到参数列表的末尾！
function showName(firstName, lastName, ...titles) {
  console.log(firstName + " " + lastName); // Julius Caesar

  // 剩余的参数被放入 titles 数组中
  // i.e. titles = ["Consul", "Imperator"]
  console.log(titles[0]); // Consul
  console.log(titles[1]); // Imperator
  console.log(titles.length); // 2
}

showName("Julius", "Caesar", "Consul", "Imperator");

// ! 2 “arguments”变量(伪数组！)
// 有一个名为 arguments 的特殊 【类数组对象】  可以在函数中被访问，该对象以参数在参数列表中的索引作为键，存储所有参数。
function fn() {
  console.log(arguments); // ~ [Arguments] { '0': 1, '1': 2, '2': 3 }
  console.log(arguments.length); // 3
  console.log(Array.isArray(arguments)); // ~ false
  for (let v of arguments) {
    console.log(v); // ~ 可遍历（有迭代器）
  }
}
fn(1, 2, 3);

/*
    在过去，JavaScript 中不支持 rest 参数语法，而使用 arguments 是获取函数所有参数的唯一方法。现在它仍然有效，我们可以在一些老代码里找到它。

    * 但缺点是，尽管 arguments 是一个类数组，也是可迭代对象，但它终究不是数组。它不支持数组方法，因此我们不能调用 arguments.map(...) 等方法。

    此外，它始终包含所有参数，我们不能像使用 rest 参数那样只截取参数的一部分。
*/
// ~ 箭头函数没有 "arguments"！
// 如果我们在箭头函数中访问 arguments，访问到的 arguments 并不属于箭头函数，而是属于箭头函数外部的“普通”函数。

function f() {
  let showArg = () => console.log(arguments[0]);
  showArg();
}

f(1); // 1

// 我们已经知道，箭头函数没有自身的 this。现在我们知道了它们也没有特殊的 arguments 对象。

// ! 3 spread语法: spread内部用迭代器实现对元素的收集，和for...of一样
let arr = [3, 5, 1];
let arr2 = [8, 9, 15];
// 比如Math.max不接受数组类型，需要一个个放进去
let max = Math.max(...arr, ...arr2);
console.log(max); // 15

// ~ 我们可以用 spread 语法这样操作任何可迭代对象
let s = "string";
console.log(...s); // s t r i n g
console.log([...s]); // [ 's', 't', 'r', 'i', 'n', 'g' ]

// ~ 对于这个任务，我们也可以用Array.from(str)
console.log(Array.from(s)); // [ 's', 't', 'r', 'i', 'n', 'g' ]

/*
不过 Array.from(obj) 和 [...obj] 存在一个细微的差别：

   ~ Array.from 适用于类数组对象也适用于可迭代对象。
   ~ Spread 语法只适用于可迭代对象。

* 因此，对于将一些“东西”转换为数组的任务，Array.from 往往更通用。
*/

// ! 4 用spread语法  实现复制 对象 或 数组
// 进行浅拷贝
// 之前使用Object.assign([], arr) / Object.assign({}, obj)
// ~ 现在 使用...
let list = [1, 3, 5];
let listCopy = [...list]; // ! 修改listCopy不会影响原数组list

// 数组内容相同
console.log(JSON.stringify(list) === JSON.stringify(listCopy)); // true
console.log(list === listCopy); // ! false(引用不同！)

let obj = { a: 1, b: 2, c: 3 };

let objCopy = { ...obj }; // 将对象 spread 到参数列表中
// 然后将结果返回到一个新对象

// 两个对象中的内容相同吗？
console.log(JSON.stringify(obj) === JSON.stringify(objCopy)); // true

// 两个对象相等吗？
console.log(obj === objCopy); // false (not same reference)

// 修改我们初始的对象不会修改副本：
obj.d = 4;
console.log(JSON.stringify(obj)); // {"a":1,"b":2,"c":3,"d":4}
console.log(JSON.stringify(objCopy)); // {"a":1,"b":2,"c":3}

// 这种方式比使用 let arrCopy = Object.assign([], arr) 复制数组，或使用 let objCopy = Object.assign({}, obj) 复制对象来说更为简便。因此，只要情况允许，我们倾向于使用它。
