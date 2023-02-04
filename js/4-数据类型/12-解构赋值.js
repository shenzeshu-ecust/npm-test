// 解构赋值 是一种特殊的语法，它使我们可以将数组或对象“拆包”至一系列变量中。有时这样做更方便。
// ———————————————————————————————— 1 数组解构 ————————————————————————————————
// ! 1 这种语法被叫做“解构赋值”，是因为它“拆开”了数组或对象，将其中的各元素复制给一些变量。[原来的数组或对象自身没有被修改]。
let [firstName, surname] = "John Smith".split(" ");
console.log(firstName); // John
console.log(surname); // Smith

// ! 2 想要忽略 使用逗号
let [a, , c] = ["Julius", "Caesar", "Consul", "of the Roman Republic"];
console.log(a); // Julius
console.log(c); // ~ Consul
// ~ 在上面的代码中，数组的第二个元素被跳过了，第三个元素被赋值给了 title 变量。数组中剩下的元素也都被跳过了（因为在这没有对应给它们的变量）。

// ! 3 等号右侧可以是任何可迭代对象(字符串、set、map...)
let [d, e, f] = "def";
console.log(e); // e

let [one, two] = new Set([1, 2]);
console.log(one); // 1

let [fir, sec] = new Map([
  ["1", "first"],
  ["2", "second"],
]);
console.log(fir); // [ '1', 'first' ]
// ~ 这种情况下解构赋值是通过迭代右侧的值来完成工作的。这是一种用于对在 = 右侧的值上调用 for..of 并进行赋值的操作的语法糖。

// ! 4 赋值给等号左侧的任何内容: 我们可以在等号左侧使用任何“可以被赋值的”东西。
let user = {};
[user.name, user.surname] = "John Smith".split(" ");
console.log(user.surname); // Smith

// ! 5 与 entries() 方法进行循环操作
// 使用循环遍历键—值对
for (let [key, value] of Object.entries(user)) {
  console.log(`${key}:${value}`); // name:John, then age:30
}
// ~ map更简单
let user1 = new Map();
user1.set("name", "John");
user1.set("age", "30");

// Map 是以 [key, value] 对的形式进行迭代的，非常便于解构
for (let [key, value] of user1) {
  console.log(`${key}:${value}`); // name:John, then age:30
}

// ! 6 交换变量值
let guest = "Jane";
let admin = "Pete";

// 让我们来交换变量的值：使得 guest = Pete，admin = Jane
[guest, admin] = [admin, guest];

console.log(`${guest} ${admin}`); // Pete Jane（成功交换！）

// ! 7 ... rest
let [name1, name2, ...namess] = [
  "Julius",
  "Caesar",
  "Consul",
  "of the Roman Republic",
];
console.log(namess); // [ 'Consul', 'of the Roman Republic' ]

// ! 8 默认值
// 如果数组比左边的变量列表短，这里不会出现报错。缺少对应值的变量都会被赋 undefined：
let [firstN, surN] = ["John"];
console.log(surN); // undefined

// ~ 提供默认值
let [name = "Guest", surName = "Anonymous"] = ["Julius"];
console.log(name); // Julius (来自数组的值）
console.log(surName); // Anonymous (默认值被使用了）
// ~ 默认值可以是更加复杂的表达式，甚至可以是函数调用。
let [m, n = getDefaultName()] = ["ll"];
function getDefaultName() {
  return "Nancy";
}
console.log(n); // Nancy

// ———————————————————————————————— 2 对象解构 ————————————————————————————————
// 解构赋值同样适用于对象。
let options = {
  title: "Menu",
  width: 100,
  height: 200,
};
// ! 1 顺序不重要！
let { width, title, height } = options;
console.log(title); // Menu

// ! 2 重命名
let { height: h, width: w } = options;
console.log(h, w); // 200 100

// ! 3 ... rest参数
let { height: ht, ...restt } = options;
console.log(restt); // { title: 'Menu', width: 100 }

// ! 4 不使用 let 时的陷阱
let tt, ww;
// ~ 没有最外层的（）会报错！ 问题在于 JavaScript 把主代码流（即不在其他表达式中）的 {...} 当做一个代码块
({ title: tt, width: ww } = options);
console.log(tt);

// ! 5 嵌套解构
let options1 = {
  size: {
    width: 100,
    height: 200,
  },
  items: ["Cake", "Donut"],
  extra: true,
};
// 为了清晰起见，解构赋值语句被写成多行的形式
let {
  size: {
    // 把 size 赋值到这里
    width: www,
    height: hhh,
  },
  items: [item1, item2], // 把 items 赋值到这里
  title2 = "Menu", // 在对象中不存在（使用默认值）
} = options1;

// ! 6 智能函数参数:
// 有时，一个函数有很多参数，其中大部分的参数都是可选的。
// 在实际开发中，记忆如此多的参数的位置是一个很大的负担
function showMenu({
  title = "Untitled",
  width = 200,
  height = 100,
  items = [],
}) {
  // title, items – 提取于 options，
  // width, height – 使用默认值
  console.log(`${title} ${width} ${height}`); // My Menu 200 100
  console.log(items); // Item1, Item2
}
let op = {
  title: "My menu",
  items: ["Item1", "Item2"],
};
showMenu(op); // My menu 200 100;[ 'Item1', 'Item2' ]
// ~ 请注意，这种解构假定了 showMenu() 函数确实存在参数。如果我们想让所有的参数都使用默认值，那我们应该传递一个空对象：{}
showMenu({}); // Untitled 200 100; []
showMenu(); // ? 报错
// ~ 可通过指定空对象 {} 为 整个参数对象 的默认值来解决这个问题：
function show({ title = "t" } = {}) {
  console.log(title);
}
show(); // t

// TEST
// 新建一个函数 topSalary(salaries)，返回收入最高的人的姓名。
let salaries = {
  John: 100,
  Pete: 300,
  Mary: 250,
};

function topSalary(salaries) {
  let max = 0;
  let winner = null;
  for (let [name, salary] of Object.entries(salaries)) {
    if (salary > max) {
      max = salary;
      winner = name;
    }
  }
  return winner;
}
