// delete也可以删除数组元素，但是数组长度不变，原来位置变为undefined
let arr = ["I", "go", "home", "right", "now"];

delete arr[1]; // remove "go"

console.log(arr[1]); // undefined

// now arr = ["I",  , "home"];
console.log(arr.length); // 5 不变！
// ~ 这很正常，因为 delete obj.key 是通过 key 来移除对应的值。对于对象来说是可以的。但是对于数组来说，我们通常希望剩下的元素能够移动并占据被释放的位置。我们希望得到一个更短的数组。

// ! 1 splice(start[, deleteCount, elem1, ..., elemN])
// 删除数组的前三项，并使用其他内容代替它们
arr.splice(0, 3, "Let's", "dance");
console.log(arr); // [ "Let's", 'dance', 'right', 'now' ]
// ~  splice 返回了被删除的元素所组成的数组：
console.log(arr.splice(0, 2)); // [ "Let's", 'dance' ]

// ~ 允许负向索引！
// 在这里和其他数组方法中，负向索引都是被允许的。它们从数组末尾计算位置
arr.splice(-1, 0, 3, 4);
console.log(arr); // [ 'right', 3, 4, 'now' ]

// ! 2 concat  它接受任意数量的参数 —— 数组或值都可以。
let arr2 = [1, 2];
console.log(arr2.concat([3, 4], 5, 6)); // [ 1, 2, 3, 4, 5, 6 ]

// 通常，它只复制数组中的元素。其他对象，即使它们看起来像数组一样(类数组)，但仍然会被作为一个整体添加：
let arrLike = {
  0: "something",
  length: 1,
};
console.log(arr2.concat(arrLike)); // [ 1, 2, { '0': 'something', length: 1 } ]
// ~ 但是，如果类数组对象具有 Symbol.isConcatSpreadable 属性，那么它就会被 concat 当作一个数组来处理：此对象中的元素将被添加：
let arrayLike = {
  0: "something",
  1: "else",
  [Symbol.isConcatSpreadable]: true,
  length: 2,
};
console.log(arr2.concat(arrayLike)); // [ 1, 2, 'something', 'else' ]

// ! 3 includes 可以正确处理NaN,而indexOf不行，这是因为includes较晚的被加入js中，用了更新的比较算法
const arr5 = [NaN];
console.log(arr5.indexOf(NaN)); // -1
console.log(arr5.includes(NaN)); // true

// ! 4 奇怪的sort
// 1） 对数组进行 原位（in-place） 排序
// 2） 返回排序后的数组
// ~ 3） 这些元素默认情况下被按字符串进行排序
console.log([1, 2, 15].sort()); // ? [ 1, 15, 2 ] 从字面上看，所有元素都被转换为字符串，然后进行比较。对于字符串，按照词典顺序进行排序，实际上应该是 "2" > "15"。
console.log([1, 2, 15].sort((a, b) => a - b)); // 正确按数字大小排序
// 4）对于许多字母，最好使用 str.localeCompare 方法正确地对字母进行排序，例如 Ö。
let countries = ["Österreich", "Andorra", "Vietnam"];

console.log(countries.sort((a, b) => (a > b ? 1 : -1))); // Andorra, Vietnam, Österreich（错的）
console.log(countries.sort((a, b) => a.localeCompare(b))); // Andorra,Österreich,Vietnam（对的！）

// ! 5 arr.split(delim, length) split 方法有一个可选的第二个数字参数 —— 对数组长度的限制。如果提供了，那么额外的元素会被忽略
console.log("Bilbo, Gandalf, Nazgul, Saruman".split(", ", 2)); // [ 'Bilbo', 'Gandalf' ]

// ! 6 reduce / reduceRight（arr.reduceRight 和 arr.reduce 方法的功能一样，只是遍历为从右到左。）
// ~ 它们用于根据数组计算单个值
/*

    let value = arr.reduce(
    function (accumulator, item, index, array) {
    ~ accumulator 是上一个函数调用的结果，第一次等于 initial（如果提供了 initial 的话）
    },
    [initial]
    );
    ~ 如果没有初始值initial，那么 reduce 会将数组的第一个元素作为初始值，并从第二个元素开始迭代。
*/
// 应用函数时，上一个函数调用的结果将作为第一个参数传递给下一个函数。
let numArr = [1, 2, 3, 4, 5];
console.log(numArr.reduce((sum, cur) => sum + cur, 0)); // 15

// ~ 没有初始值 使用需要非常小心。如果数组为空，那么在没有初始值的情况下调用 reduce 会导致错误。
numArr = [];
// console.log(numArr.reduce((sum, cur) => sum + cur)); // 报错：没初值

// ! 9 大部分数组方法都支持“thisArg”
// 几乎所有调用函数的数组方法 —— 比如 find，filter，map，除了 sort 是一个特例，都接受一个可选的附加参数 thisArg。
// ? arr.find(func, thisArg); arr.map(func, thisArg); thisArg 是可选的最后一个参数

// 在这里我们使用 army 对象方法作为过滤器，thisArg 用于传递上下文（passes the context）
let army = {
  minAge: 18,
  maxAge: 27,
  canJoin(user) {
    return user.age >= this.minAge && user.age < this.maxAge;
  },
};

let users = [{ age: 16 }, { age: 20 }, { age: 23 }, { age: 30 }];

// 找到 army.canJoin 返回 true 的 user
let soldiers = users.filter(army.canJoin, army);
let soldiers_copy = users.filter((user) => army.canJoin(user), army); // ******

console.log(soldiers.length); // 2
console.log(soldiers[0].age); // 20
console.log(soldiers[1].age); // 23
// ~ 如果在上面的示例中我们使用了 users.filter(army.canJoin)，那么 army.canJoin 将被作为独立函数调用，并且这时 this=undefined，从而会导致即时错误。
// ~ 可以用 users.filter(user => army.canJoin(user)) 替换对 users.filter(army.canJoin, army) 的调用。前者的使用频率更高，因为对于大多数人来说，它更容易理解。

// ! 10  arr.every(fn) arr.some(fn)
// 如果 fn 返回一个真值，arr.some() 立即返回 true 并停止迭代其余数组项；
// 如果 fn 返回一个假值，arr.every() 立即返回 false 并停止对其余数组项的迭代。

// ~ 我们可以使用 every 来比较数组：
function arraysEqual(arr1, arr2) {
  return (
    arr1.length === arr2.length &&
    arr1.every((value, index) => value === arr2[index])
  );
}
console.log(arraysEqual([1, 2], [1, 2])); // true

// TEST
function camelize(str) {
  let arr = str.split("-");
  let upperArr = arr.map((item, i) => {
    if (i > 0) {
      let up = item[0].toUpperCase();
      return up + item.slice(1);
    }
    return item;
  });
  return upperArr.join("");
}
console.log(camelize("background-color")); // backgroundColor
console.log(camelize("-webkit-transition")); // WebkitTransition

// 原位过滤范围
// 写一个函数 filterRangeInPlace(arr, a, b)，该函数获取一个数组 arr，并删除其中介于 a 和 b 区间以外的所有值。检查：a ≤ arr[i] ≤ b。
// 该函数应该只修改数组。它不应该返回任何东西。

function filterRangeInPlace(arr, a, b) {
  for (let i = 0; i < arr.length; i++) {
    let val = arr[i];

    // 如果超出范围，则删除
    if (val < a || val > b) {
      arr.splice(i, 1);
      // ~ 删除了元素  后面的元素来到了被删除元素的位置，如果不i-- 其实下一个循环的元素是下下个元素
      i--;
    }
  }
}

let arr11 = [5, 3, 8, 1];

filterRangeInPlace(arr11, 1, 4); // 删除 1 到 4 范围之外的值

// 我们有一个字符串数组 arr。我们希望有一个排序过的副本，但保持 arr 不变。
function copySorted(arr) {
  // 用slice创建一个副本
  // 也可以直接sort()
  return arr.slice().sort((a, b) => a.localeCompare(b));
}

let strArr = ["HTML", "JavaScript", "CSS"];
console.log(copySorted(strArr));
console.log(strArr);

// 创建“可扩展”的 calculator 对象
class Calculator {
  constructor() {
    this.methods = {
      "-": (a, b) => a - b,
      "+": (a, b) => a + b,
    };
  }

  calculate(props) {
    const [param1, sep, param2] = props.split(" ");
    if (!this.methods[sep] || isNaN(param1) || isNaN(param2)) return NaN;
    return this.methods[sep](param1, param2);
  }

  addMethod(name, func) {
    this.methods[name] = func;
  }
}
let calc = new Calculator();
console.log(calc.calculate("3 - 7"));

calc.addMethod("*", (a, b) => a * b);
calc.addMethod("/", (a, b) => a / b);
calc.addMethod("**", (a, b) => a ** b);

let result = calc.calculate("2 ** 3");
console.log(result);

// ~ 随机打乱数组 shuffle
// 1 不是均等概率的方法
function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}
// ~  2 很棒的算法叫作 Fisher-Yates shuffle。其思路是：逆向遍历数组，并将每个元素与其前面的随机的一个元素互换位置：
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // 从 0 到 i 的随机索引
    [array[i], array[j]] = [array[j], array[i]];
  }
}
// ~ 在性能方面，Fisher — Yates 算法要好得多，没有“排序”开销。

// 所有可能排列的出现次数
let count = {
  123: 0,
  132: 0,
  213: 0,
  231: 0,
  321: 0,
  312: 0,
};

for (let i = 0; i < 1000000; i++) {
  let array = [1, 2, 3];
  shuffle(array);
  count[array.join("")]++;
}

// 显示所有可能排列的出现次数
for (let key in count) {
  console.log(`${key}: ${count[key]}`);
}

// 获取平均年龄
let john = { name: "John", age: 25 };
let pete = { name: "Pete", age: 30 };
let mary = { name: "Mary", age: 29 };

let arr3 = [john, pete, mary];
function getAverageAge(arr) {
  return arr.reduce((sum, cur, index) => sum + cur.age, 0) / arr.length;
}
console.log(getAverageAge(arr3)); // (25 + 30 + 29) / 3 = 28

// ~ 从数组创建键值对像  用reduce
let users1 = [
  { id: "john", name: "John Smith", age: 20 },
  { id: "ann", name: "Ann Smith", age: 24 },
  { id: "pete", name: "Pete Peterson", age: 31 },
];

function groupById(users) {
  return users.reduce((acc, cur) => {
    acc[cur.id] = cur;
    return acc;
  }, {});
}

let usersById = groupById(users1);
console.log(usersById);
/*
  // 调用函数后，我们应该得到：
  
  usersById = {
    john: {id: 'john', name: "John Smith", age: 20},
    ann: {id: 'ann', name: "Ann Smith", age: 24},
    pete: {id: 'pete', name: "Pete Peterson", age: 31},
  }
  */
