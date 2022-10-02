// ~ 1 字符串比较
// 在比较字符串的大小时，JavaScript 会使用“字典（dictionary）”或“词典（lexicographical）”顺序进行判定。
// * 换言之，字符串是按字符（母）逐个进行比较的。
/*
    字符串的比较算法非常简单：

    首先比较两个字符串的首位字符大小。
    如果一方字符较大（或较小），则该字符串大于（或小于）另一个字符串。算法结束。
    否则，如果两个字符串的首位字符相等，则继续取出两个字符串各自的后一位字符进行比较。
    重复上述步骤进行比较，直到比较完成某字符串的所有字符为止。
    如果两个字符串的字符同时用完，那么则判定它们相等，否则未结束（还有未比较的字符）的字符串更大。

*/

console.log("Z" > "A"); // true
console.log("Glow" > "Glee"); // true
console.log("Bee" > "Be"); // true
/*
    在上面的算法中，比较大小的逻辑与字典或电话簿中的排序很像，但也不完全相同。

    比如说，字符串比较对字母大小写是敏感的。大写的 "A" 并不等于小写的 "a"。
    哪一个更大呢？实际上小写的 "a" 更大。这是因为在 JavaScript 使用的内部编码表中（Unicode），小写字母的字符索引值更大。
*/
// ~ 2 不同类型间的比较
// 当对不同类型的值进行比较时，JavaScript 会首先将其转化为数字（number）再判定大小。
console.log("2" > 1); // true，字符串 '2' 会被转化为数字 2
console.log("01" == 1); // true，字符串 '01' 会被转化为数字 1)
// 对于布尔类型值，true 会被转化为 1、false 转化为 0。
console.log(true === 1); // true
console.log(false === 0); // true
/*
    有时候，以下两种情况会同时发生：

    若直接比较两个值，其结果是相等的。
    若把两个值转为布尔值，它们可能得出完全相反的结果，即一个是 true，一个是 false。
*/
let a = 0;
console.log(Boolean(a)); // ~ false
let b = "0";
console.log(Boolean(b)); // ~ true
console.log(a == b); // true

// ~ 3 严格相等 ===
// 普通的相等性检查 == 存在一个问题，它不能区分出 0 和 false：
console.log(0 == false); // true
console.log("" == false); // true
// 这是因为在比较不同类型的值时，处于相等判断符号 == 两侧的值会先被转化为数字。空字符串和 false 也是如此，转化后它们都为数字 0。

// ! 严格相等运算符 === 在进行比较时不会做任何的类型转换。
// ! 换句话说，如果 a 和 b 属于不同的数据类型，那么 a === b 不会做任何的类型转换而立刻返回 false。

// ~ 4 undefined and null
console.log(null === undefined); // false
// * 像是一对恋人 仅仅等于对方而不等于其他任何的值（只在非严格相等下成立）。
console.log(null == undefined); // true

// * 当使用数学式或其他比较方法 < > <= >= 时：
// * null/undefined 会被转化为数字：null 被转化为 0，undefined 被转化为 NaN。
console.log(null > 0); // false  (1)
console.log(null == 0); // false (2)
console.log(null >= 0); // true  (3)

/*
    是的，上面的结果完全打破了你对数学的认识。在最后一行代码显示“null 大于等于 0”的情况下，前两行代码中一定会有一个是正确的，然而事实表明它们的结果都是 false。

    ! 为什么会出现这种反常结果，这是因为相等性检查 == 和普通比较符 > < >= <= 的代码逻辑是相互独立的。
    ~ 进行值的比较时，null 会被转化为数字，因此它被转化为了 0。这就是为什么（3）中 null >= 0 返回值是 true，（1）中 null > 0 返回值是 false。

    ~ 另一方面，undefined 和 null 在相等性检查 == 中不会进行任何的类型转换，它们有自己独立的比较规则，所以除了它们之间互等外，不会等于任何其他的值。
    这就解释了为什么（2）中 null == 0 会返回 false。
*/

// ~ 4.1 特立独行的undefined
// undefined 不应该被与其他值进行比较：
console.log(undefined > 0); // false (1)
console.log(undefined < 0); // false (2)
console.log(undefined == 0); // false (3)
/*
    为何它看起来如此厌恶 0？返回值都是 false！

    原因如下：

    (1) 和 (2) 都返回 false 是因为 undefined 在比较中被转换为了 NaN，而 NaN 是一个特殊的数值型值，它与任何值进行比较都会返回 false。
    (3) 返回 false 是因为这是一个相等性检查，而 undefined 只与 null 相等，不会与其他值相等。

*/

// ! Conclusion
/*
    我们为何要研究上述示例？我们需要时刻记得这些古怪的规则吗？不，其实不需要。虽然随着代码写得越来越多，我们对这些规则也都会烂熟于胸，但是我们需要更为可靠的方法来避免潜在的问题：

    1 除了严格相等 === 外，其他但凡是有 undefined/null 参与的比较，我们都需要格外小心。
    2 除非你非常清楚自己在做什么，否则永远不要使用 >= > < <= 去比较一个可能为 null/undefined 的变量。对于取值可能是 null/undefined 的变量，请按需要分别检查它的取值情况。

*/
// test
console.log(null == "\n0\n"); // false undefined只与null 相等
