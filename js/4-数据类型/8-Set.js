// ! 1 Set 是一个特殊的类型集合 —— “值的集合”（没有键），它的每一个值只能出现一次。
// new Set(iterable) —— 创建一个 set，如果提供了一个 iterable 对象（通常是数组），将会从数组里面复制值到 set 中。

// ~ 它的主要特点是，重复使用同一个值调用 set.add(value) 并不会发生什么改变。这就是 Set 里面的每一个值只出现一次的原因。
// Set 的替代方法可以是一个用户数组，用 arr.find 在每次插入值时检查是否重复。但是这样性能会很差，因为这个方法会遍历整个数组来检查每个元素。Set 内部对唯一性检查进行了更好的优化。

// ! 2 Set 迭代（iteration） for..of  forEach keys() values()  entries()
let set = new Set(["oranges", "apples", "bananas"]);

for (let value of set) console.log(value);

// 与 forEach 相同：
set.forEach((value, valueAgain, set) => {
  console.log(value);
});

// ~ 注意一件有趣的事儿。forEach 的回调函数有三个参数：一个 value，然后是 同一个值 valueAgain，最后是目标对象。没错，同一个值在参数里出现了两次。
// ~ forEach 的回调函数有三个参数，是为了与 Map 兼容。当然，这看起来确实有些奇怪。但是这对在特定情况下轻松地用 Set 代替 Map 很有帮助，反之亦然。
// ~
/*
* Map 中用于迭代的方法在 Set 中也同样支持：

    set.keys() —— 遍历并返回一个包含所有值的可迭代对象，
    set.values() —— 与 set.keys() 作用相同，这是为了兼容 Map，
    set.entries() —— 遍历并返回一个包含所有的实体 [value, value] 的可迭代对象，它的存在也是为了兼容 Map。

*/
