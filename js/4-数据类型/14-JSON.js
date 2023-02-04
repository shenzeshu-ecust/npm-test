// JSON（JavaScript Object Notation）是表示值和对象的通用格式。在 RFC 4627 标准中有对其的描述。最初它是为 JavaScript 而创建的，但许多其他编程语言也有用于处理它的库。
// 因此，当客户端使用 JavaScript 而服务器端是使用 Ruby/PHP/Java 等语言编写的时，使用 JSON 可以很容易地进行数据交换。

/*
* 请注意，JSON 编码的对象与对象字面量有几个重要的区别：

    1 字符串使用双引号。JSON 中没有单引号或反引号。所以 'John' 被转换为 "John"。
    2 对象属性名称也是双引号的。这是强制性的。所以 age:30 被转换成 "age":30。


* JSON.stringify 也可以应用于原始（primitive）数据类型。

JSON 支持以下数据类型：

    Objects { ... }
    Arrays [ ... ]
    Primitives：
        strings，
        numbers，
        boolean values: true/false，
        null。

* JSON 不支持注释。向 JSON 添加注释无效。
*/

// 数字在 JSON 还是数字
console.log(JSON.stringify(1)); // 1
// 字符串在 JSON 中还是字符串，只是被双引号扩起来
console.log(JSON.stringify("test")); // "test"
console.log(JSON.stringify(true)); // true
console.log(JSON.stringify([1, 2, 3])); // [1,2,3]

/*
~ JSON 是语言无关的纯数据规范，因此一些特定于 JavaScript 的对象属性会被 JSON.stringify 跳过。

即：

    1 函数属性（方法）。
    2 Symbol 类型的键和值。
    3 存储 undefined 的属性。

*/
let user = {
  sayHi() {
    // 被忽略
    console.log("Hello");
  },
  [Symbol("id")]: 123, // 被忽略
  something: undefined, // 被忽略
};

console.log(JSON.stringify(user)); // {}（空对象）

// ! JSON.stringify() 支持 嵌套 转换
// ! 但是： 不能循环引用
let room = {
  number: 23,
};

let meetup = {
  title: "Conference",
  participants: [{ name: "john" }, { name: "ann" }],
  place: room, // meetup 引用了 room
};

room.occupiedBy = meetup; // room 引用了 meetup

// JSON.stringify(meetup); // Error: Converting circular structure to JSON

// ! let json = JSON.stringify(value[, replacer, space])
// replacer: 要编码的[属性数组] 或 映射函数 function(key, value)。
// space: 用于格式化的空格数量

// 如果我们需要微调替换过程，比如过滤掉循环引用，我们可以使用 JSON.stringify 的第二个参数。

// ~ 属性列表应用于了整个对象结构(嵌套转换的)。所以 participants 是空的，因为 name 不在列表中。
console.log(JSON.stringify(meetup, ["title", "participants"])); // {"title":"Conference","participants":[{},{}]}
// 想要包含除了'occupiedBy'属性外的所有属性以消除循环引用，但是这样第二个属性参数数组 太长了
// ~ -->  函数： 该函数会为每个 (key,value) 对调用并返回“已替换”的值，该值将替换原有的值。
// ! 如果需要跳过，则return  undefined。

let json = JSON.stringify(meetup, (key, value) => {
  console.log(`${key}: ${value}`);
  return key === "occupiedBy" ? undefined : value;
});
console.log(json); // {"title":"Conference","participants":[{"name":"john"},{"name":"ann"}],"place":{"number":23}}

/*
 ~ 请注意 replacer 函数会获取每个键/值对，包括嵌套对象和数组项。它被递归地应用。replacer 中的 this 的值是包含当前属性的对象。
 ~ 第一个调用很特别。它是使用特殊的“包装对象”制作的：{"": meetup}。
 ~ 换句话说，第一个 (key, value) 对的键是空的，并且该值是整个目标对象。这就是上面的示例中第一行是 ":[object Object]" 的原因。
 ~ 这个理念是为了给 replacer 提供尽可能多的功能：如果有必要，它有机会分析并替换/跳过整个对象。
  * : [object Object]
    title: Conference
    participants: [object Object],[object Object]
    0: [object Object]
    name: john
    1: [object Object]
    name: ann
    place: [object Object]
    number: 23
    occupiedBy: [object Object]
*/

// ! stringify的第三个参数 space:用于优化格式的空格数量。
let a = {
  m: 3,
};
console.log(JSON.stringify(a, null, 4));
// ~ 第三个参数也可以是字符串。在这种情况下，字符串用于缩进，而不是空格的数量。
console.log(JSON.stringify(a, null, "缩进"));
/*
 * 字符串代替了空格来缩进
{
缩进"m": 3
}
*/

// ! toJSON
// 像 toString 进行字符串转换，对象也可以提供 toJSON 方法来进行 JSON 转换。如果可用，JSON.stringify 会自动调用它。
let m = {
  title: "Conference",
  date: new Date(Date.UTC(2017, 0, 1)),
};
console.log(JSON.stringify(m)); // {"title":"Conference","date":"2017-01-01T00:00:00.000Z"}
// ~ date的值变成了一个字符串，因为 所有的日期有内建的 toJSON 方法
let n = {
  age: 23,
  toJSON() {
    return this.age;
  },
};
console.log(JSON.stringify(n)); // 23

// ! let value = JSON.parse(str, [reviver]);
// reviver 可选的函数 function(key,value)，该函数将为每个 (key, value) 对调用，并可以对值进行转换。
let str = '{"title":"Conference","date":"2017-11-30T12:00:00.000Z"}';
let res = JSON.parse(str, (key, value) => {
  if (key == "date") return new Date(value);
  return value;
});
console.log(res.date.getDate()); // 30

// ~ reviver 也适用于嵌套对象
let schedule = `{
    "meetups": [
      {"title":"Conference","date":"2017-11-30T12:00:00.000Z"},
      {"title":"Birthday","date":"2017-04-18T12:00:00.000Z"}
    ]
  }`;

schedule = JSON.parse(schedule, function (key, value) {
  if (key == "date") return new Date(value);
  return value;
});

// TEST
// 编写 replacer 函数，移除引用 meetup 的属性，并将其他所有属性序列化：
let room1 = {
  number: 23,
};

let meetup1 = {
  title: "Conference",
  occupiedBy: [{ name: "John" }, { name: "Alice" }],
  place: room1,
};

room1.occupiedBy = meetup1;
meetup1.self = meetup1;

console.log(
  JSON.stringify(meetup1, function replacer(key, value) {
    // ! 这里我们还需要判断 key=="" 以排除第一个调用时 value 是 meetup 的情况。
    return key != "" && value == meetup1 ? undefined : value;
  })
);

/*
  {
    "title":"Conference",
    "occupiedBy":[{"name":"John"},{"name":"Alice"}],
    "place":{"number":23}
  }
  */
