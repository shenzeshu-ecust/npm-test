// ! 1 Map
// ~ 与对象不同，键不会被转换成字符串。键可以是任何类型。
// new Map([iterable]) —— 创建 map，可选择带有 [key,value] 对的 iterable（例如数组）来进行初始化。
/*
 * map[key] 不是使用 Map 的正确方式

~ 虽然 map[key] 也有效，例如我们可以设置 map[key] = 2，这样会将 map 视为 JavaScript 的 plain object，因此它暗含了所有相应的限制（仅支持 string/symbol 键等）。

~ 所以我们应该使用 map 方法：set 和 get 等。

 */

// ! 2 Map 还可以使用对象作为键。
// 使用对象作为键是 Map 最值得注意和重要的功能之一。
// 而在 Object 中，我们则无法使用对象作为键。在 Object 中使用字符串作为键是可以的，但我们无法使用另一个 Object 作为 Object 中的键。
// 例如
let john = { name: "John" };
let ben = { name: "Ben" };

let visitsCountObj = {}; // 尝试使用对象

visitsCountObj[ben] = 234; // 尝试将对象 ben 用作键
visitsCountObj[john] = 123; // 尝试将对象 john 用作键，但我们会发现使用对象 ben 作为键存下的值会被替换掉

// 变成这样了！
console.log(visitsCountObj["[object Object]"]); // 123
// ~ 因为 visitsCountObj 是一个对象，它会将所有 Object 键例如上面的 john 和 ben 转换为字符串 "[object Object]"。这显然不是我们想要的结果。

/*
 * 
    Map 是怎么比较键的？

~ Map 使用 SameValueZero 算法来比较键是否相等。它和严格等于 === 差不多，但区别是 NaN 被看成是等于 NaN。
~ 所以 NaN 也可以被用作键。

这个算法不能被改变或者自定义。

 */

// ! 3 Map可以链式调用 （每一次 map.set 调用都会返回 map 本身）
let map = new Map();
map.set("1", "str").set(1, 1).set({ name: "szs" }, { age: 17 });
console.log(map); // Map(3) { '1' => 'str', 1 => 1, { name: 'szs' } => { age: 17 } }

let obj = { name: "z" };
let obj1 = { name: "z" };
console.log(Object.is(obj, obj1)); // false  只是突然想到 试试

// ! 4 Map迭代: 迭代的顺序与插入值的顺序相同。与普通的 Object 不同，Map 保留了此顺序。
/*
如果要在 map 里使用循环，可以使用以下三个方法：

    map.keys() —— 遍历并返回一个包含所有键的可迭代对象，
    map.values() —— 遍历并返回一个包含所有值的可迭代对象，
    map.entries() —— 遍历并返回一个包含所有实体 [key, value] 的可迭代对象，for..of 在默认情况下使用的就是这个。

    ~ map.forEach()  map有内建的forEach 方法！

*/
let recipeMap = new Map([
  ["cucumber", 500],
  ["tomatoes", 350],
  ["onion", 50],
]);
console.log(recipeMap.keys()); // ~ [Map Iterator] { 'cucumber', 'tomatoes', 'onion' }
// 遍历所有的键（vegetables）
for (let vegetable of recipeMap.keys()) {
  console.log(vegetable); // cucumber, tomatoes, onion
}

// 遍历所有的值（amounts）
for (let amount of recipeMap.values()) {
  console.log(amount); // 500, 350, 50
}

// 遍历所有的实体 [key, value]
for (let entry of recipeMap) {
  // ~ 与 recipeMap.entries() 相同
  console.log(entry);
  /*
    [ 'cucumber', 500 ]
    [ 'tomatoes', 350 ]
    [ 'onion', 50 ]
  */
}

// ! 5 Object.entries：从对象创建 Map
// 键值对 [key, value] 数组
let map1 = new Map([
  ["1", "str1"],
  [1, "num1"],
  [true, "bool1"],
]);

console.log(map1.get("1")); // str1
// ~ 如果我们想从一个已有的普通对象（plain object）来创建一个 Map，那么我们可以使用内建方法 Object.entries(obj)
// ~ 该方法返回对象的键/值对数组，该数组格式完全按照 Map 所需的格式。(二维数组)
let o = {
  name: "John",
  age: 30,
};
// ~ Object.entries 返回键/值对数组：[ ["name","John"], ["age", 30] ]。这就是 Map 所需要的格式。
let map2 = new Map(Object.entries(o));
console.log(map2); // Map(2) { 'name' => 'John', 'age' => 30 }

// ! 6 Object.fromEntries：从 Map 创建对象
// ~ Object.fromEntries 方法的作用是相反的：给定一个具有 [key, value] 键值对的数组，它会根据给定数组创建一个对象：
let prices = Object.fromEntries([
  ["banana", 1],
  ["orange", 2],
  ["meat", 4],
]);

// 现在 prices = { banana: 1, orange: 2, meat: 4 }

console.log(prices.orange); // 2

// ? 我们可以使用 Object.fromEntries 从 Map 得到一个普通对象（plain object）
let map3 = new Map();
map3.set("banana", 1);
map3.set("orange", 2);
map3.set("meat", 4);
let res = Object.fromEntries(map3.entries()); // *
console.log(res); // { banana: 1, orange: 2, meat: 4 }
// ~ 我们可以把带 (*) 这一行写得更短：
let obj3 = Object.fromEntries(map); // 省掉 .entries()
// ~ 上面的代码作用也是一样的，因为 Object.fromEntries 期望得到一个可迭代对象作为参数，而不一定是数组。
// ~ 并且 map 的标准迭代会返回跟 map.entries() 一样的键/值对。因此，我们可以获得一个普通对象（plain object），其键/值对与 map 相同。

// ! 在 Map 和 Set 中迭代总是按照值插入的顺序进行的，所以我们不能说这些集合是无序的，但是我们不能对元素进行重新排序，也不能直接按其编号来获取元素。
