/*
在现代 JavaScript 中，数字（number）有两种类型：

   ! JavaScript 中的常规数字以 64 位的格式 IEEE-754 存储，也被称为“双精度浮点数”。这是我们大多数时候所使用的数字，我们将在本章中学习它们。

   ! BigInt 用于表示任意长度的整数。有时会需要它们，因为正如我们在前面的章节 数据类型 中提到的，常规整数不能安全地超过 (2^53-1) 或小于 -(2^53-1)。由于仅在少数特殊领域才会用到 BigInt，因此我们在特殊的章节 BigInt 中对其进行了介绍。

*/

// ! 1 表示10亿
let billion1 = 1000000000;

// ~ 我们也可以使用下划线 _ 作为分隔符：
let billion2 = 1_000_000_000;
console.log("billion2", billion2); //  billion2 1000000000

// ~ 这里的下划线 _ 扮演了“语法糖”的角色，使得数字具有更强的可读性。JavaScript 引擎会直接忽略数字之间的 _，所以 上面两个例子其实是一样的。

// ! 2 在 JavaScript 中，我们可以通过在数字后面附加字母 "e" 并指定零的个数来缩短数字：
let billion3 = 1e9; // ~ 10 亿，字面意思：数字 1 后面跟 9 个 0
console.log(billion3); //  1000000000
console.log(7.3e9); // 7300000000 73亿

/**
    1e3 === 1 * 1000; // e3 表示 *1000
    1.23e6 === 1.23 * 1000000; // e6 表示 *1000000
 */

// 现在让我们写一些非常小的数字。例如，1 微秒（百万分之一秒）：

let mcs1 = 0.000001;

// 就像以前一样，可以使用 "e" 来完成。如果我们想避免显式地写零，我们可以这样写：

let mcs2 = 1e-6; // 1 的左边有 6 个 0

/*
换句话说，e 后面的负数表示除以 1 后面跟着给定数量的 0 的数字：

    * -3 除以 1 后面跟着 3 个 0 的数字
    ~ 1e-3 === 1 / 1000; // 0.001

    * -6 除以 1 后面跟着 6 个 0 的数字
    ~ 1.23e-6 === 1.23 / 1000000; // 0.00000123

    * 一个更大一点的数字的示例
    ~ 1234e-2 === 1234 / 100; // 12.34，小数点移动两次
*/

// ! 3 十六进制，二进制和八进制数字
// 十六进制 数字在 JavaScript 中被广泛用于表示颜色，编码字符以及其他许多东西。所以自然地，有一种较短的写方法：0x，然后是数字。
console.log(0xff); // 255 等同于 0xFF  大小写没影响 f表式 15  --> 15 * 16(进制) + 16

// 二进制和八进制数字系统很少使用，但也支持使用 0b 和 0o 前缀：
let a = 0b11111111; // 二进制形式的 255
let b = 0o377; // 八进制形式的 255

console.log(a == b); // true，两边是相同的数字，都是 255

// ~ 只有这三种进制支持这种写法。对于其他进制，我们应该使用函数 parseInt

// ! 4 toString(base)   方法 num.toString(base) 返回在给定 base 进制数字系统中 num 的字符串表示形式。
// ~ base 的范围可以从 2 ~ 36。默认情况下是 10。 默认十进制
let num = 255;
console.log(num.toString(16)); // ff
console.log(num.toString(8)); // 377
console.log(num.toString(2)); // 11111111

/*
常见的用例如下：

    base=16 用于十六进制颜色，字符编码等，数字可以是 0..9 或 A..F。

    base=2 主要用于调试按位操作，数字可以是 0 或 1。

    base=36 是最大进制，数字可以是 0..9 或 A..Z。所有拉丁字母都被用于了表示数字。
    对于 36 进制来说，一个有趣且有用的例子是，当我们需要将一个较长的数字标识符转换成较短的时候，例如做一个短的 URL。可以简单地使用基数为 36 的数字系统表示：
*/
console.log((123456).toString(36)); //  2n9c  -->
// ~ 也可以是 123456..toString(16) 请注意 123456..toString(36) 中的两个点不是打错了。如果我们想直接在一个数字上调用一个方法，比如上面例子中的 toString，那么我们需要在它后面放置两个点 ..
// ~ 如果我们放置一个点：123456.toString(36)，那么就会出现一个 error，因为 JavaScript 语法隐含了第一个点之后的部分为小数部分。如果我们再放一个点，那么 JavaScript 就知道小数部分为空。

// ! 5 舍入 rounding
// 1) Math.floor()  向下取整
console.log(Math.floor(3.1)); // 3
console.log(Math.floor(-3.1)); // -4

// 2) Math.ceil()  向上取整
console.log(Math.ceil(3.1)); // 4
console.log(Math.ceil(-3.1)); // -3

// 3) Math.round()  四舍五入 向最近的整数舍入
console.log(Math.round(3.1)); // 3
console.log(Math.round(-3.5)); // -3
console.log(Math.round(3.5)); // 4

// 4）Math.trunc() 移除小数点后的所有内容而没有舍入 （IE 浏览器不支持这个方法）
console.log(Math.trunc(3.2)); // 3
console.log(Math.trunc(3.6)); // 3

// ~ 5) 将数字舍入到固定位数
// eg: 小数点后2位
let numb = 1.2345;
// ① 乘除法：要将数字舍入到小数点后两位，我们可以将数字乘以 100，调用舍入函数，然后再将其除回100
console.log(Math.round(numb * 100) / 100); // 1.23456 -> 123.456 -> 123 -> 1.23

// ② 函数 toFixed(n) 将数字舍入到小数点后 n 位，并以”字符串“形式返回结果
console.log(numb.toFixed(2)); // 1.23
// ! 1.225为什么会向下舍入？ 内部1.255是一个无限二进制小数，会造成精度损失
console.log((1.255).toFixed(2)); // 1.25
// ! 精度损失会造成数字变大或者变小，这就是1.255向下舍入的原因（它实际值比1.255小）
console.log((1.255).toFixed(20)); // ? 1.25499999999999989342
// ! 1.35 会怎么样
console.log((1.35).toFixed(20)); // ? 1.35000000000000008882 > 1.35 所以向上舍入
// ? 解决方法: 在进行舍入前，我们应该使其更接近整数：
console.log((6.35 * 10).toFixed(20)); // 63.50000000000000000000
// ! 63.5 完全没有精度损失。这是因为小数部分 0.5 实际上是 1/2。以 2 的整数次幂为分母的小数在二进制数字系统中可以被精确地表示，现在我们可以对它进行舍入：
console.log(Math.round(6.35 * 10) / 10); // 6.4
console.log((1.255 * 100).toFixed(20)); // 125.49999999999998578915
console.log((1.255 * 1000).toFixed(20)); // 1255.00000000000000000000
console.log(Math.round(1.255 * 1000) / 1000);

console.log((1.256).toFixed(2)); // 1.26

// 这会向上或向下舍入到最接近的值，类似于 Math.round
// ~ 请注意 toFixed 的结果是一个字符串。如果小数部分比所需要的短，则在结尾添加零：
console.log((1.23).toFixed(6)); // 1.230000
// ~ 我们可以使用一元加号或 Number() 调用，将其转换为数字，例如 +num.toFixed(5)。

// ! 6 不精确的计算
// js内部，数字是以 64 位格式 IEEE-754 表示的，所以正好有 64 位可以存储一个数字：
// ~ 其中 52 位被用于存储这些数字，其中 11 位用于存储小数点的位置，而 1 位用于符号。

// ~ 1）数字很大 --> 转化为一个特殊的数值Infinity
console.log(1e500); // Infinity

// ~ 2)精度损失（经常发生！）
console.log(0.1 + 0.2 === 0.3); // false
console.log(0.1 + 0.2); // ? 0.30000000000000004
console.log((0.1).toFixed(20)); // 0.10000000000000000555
/*
* Reason
但为什么会这样呢？

一个数字以其二进制的形式存储在内存中，一个 1 和 0 的序列。但是在十进制数字系统中看起来很简单的 0.1，0.2 这样的小数，实际上在二进制形式中是无限循环小数。
什么是 0.1？0.1 就是 1 除以 10，1/10，即十分之一。在十进制数字系统中，这样的数字表示起来很容易。将其与三分之一进行比较：1/3。三分之一变成了无限循环小数 0.33333(3)。
在十进制数字系统中，可以保证以 10 的整数次幂作为除数能够正常工作，但是以 3 作为除数则不能。

~ 也是同样的原因，在二进制数字系统中，可以保证以 2 的整数次幂作为除数时能够正常工作，但 1/10 就变成了一个无限循环的二进制小数。
使用二进制数字系统无法 精确 存储 0.1 (1/10)或 0.2 (1/5)，就像没有办法将三分之一存储为十进制小数一样。

IEEE-754 数字格式通过将数字舍入到最接近的可能数字来解决此问题。这些舍入规则通常不允许我们看到“极小的精度损失”，但是它确实存在。

~ 当我们对两个数字进行求和时，它们的“精度损失”会叠加起来。
~ 这就是为什么 0.1 + 0.2 不等于 0.3。
(其他语言PHP/JAVA/C...都有同样的问题)
*/

// ! 解决方法：
// 1 toFixed(n) 但是要注意toFixed()结果是 string 类型，注意某些场合需要转为数字类型
console.log(+(0.1 + 0.2).toFixed(2)); // 0.3

// 2 我们可以将数字临时乘以 100（或更大的数字），将其转换为整数，进行数学运算，然后再除回。当我们使用整数进行数学运算时，误差会有所减少，但仍然可以在除法中得到：
console.log((0.1 * 10 + 0.2 * 10) / 10); // 0.3
console.log((0.28 * 100 + 0.14 * 100) / 100); // 0.4200000000000001
// ~ 因此，乘/除法可以减少误差，但不能完全消除误差。

//出现了同样的问题：精度损失。有 64 位来表示该数字，其中 52 位可用于存储数字，但这还不够。所以最不重要的数字就消失了。
// JavaScript 不会在此类事件中触发 error。它会尽最大努力使数字符合所需的格式，但不幸的是，这种格式不够大到满足需求。

// Hello！我是一个会自我增加的数字！
console.log(9999999999999999); // 显示 10000000000000000

// ! 7 两个零 +0  -0
// 这是因为在存储时，使用一位来存储符号，因此对于包括零在内的任何数字，可以设置这一位或者不设置。
// 在大多数情况下，这种区别并不明显，因为运算符将它们视为相同的值。
console.log(+0 === -0); // true
console.log(Object.is(+0, -0)); // false

// ! 8 isNaN / isFinite

// Infinity（和 -Infinity）是一个特殊的数值，比任何数值都大（小）。
// NaN 代表一个 error。
// ~ Infinity、NaN 它们属于 number 类型，但不是“普通”数字，
console.log("NaN的类型", typeof NaN); // number
// 1）isNaN(value) 将其参数转换为数字，然后测试它是否为 NaN：
console.log(isNaN(NaN)); // true
console.log(isNaN("str")); // true

// ~ 但是我们需要这个函数吗？我们不能只使用 === NaN 比较吗？
// ~ 很不幸，这不行!
// * 值 “NaN” 是独一无二的，它不等于任何东西，包括它自身：
console.log(NaN === NaN); // false
console.log(NaN === "str"); // false

// 2) isFinite(value) 将其参数转换为数字，如果是常规数字而不是 NaN/Infinity/-Infinity，则返回 true：
console.log(isFinite("15")); // true
console.log(isFinite("str")); // false
console.log(isFinite(Infinity)); // false

// ~ isFinite 被用于验证字符串值是否为常规数字
// 请注意，在所有数字函数中，包括 isFinite，空字符串或仅有空格的字符串均被视为 0
console.log(isFinite("")); // true
console.log(isFinite(" ")); // true

// ! 9 Object.is() 它类似于 === 一样对值进行比较，但它对于两种边缘情况更可靠：
// 1） 它适用于 NaN：
console.log(Object.is(NaN, NaN)); // true
// 2) 值 0 和 -0 是不同的：
// ~ 从技术上讲这是对的，因为在内部，数字的符号位可能会不同，即使其他所有位均为零。
console.log(Object.is(0, -0)); // false

// Object.is()这种比较方式经常被用在 JavaScript 规范中。当内部算法需要比较两个值是否完全相同时，它使用 Object.is（内部称为 SameValue）

// ! 10 parseInt(str, radix) parseFloat
// 使用加号 + 或 Number() 的数字转换是严格的。如果一个值不完全是一个数字，就会失败：
console.log(+"100px"); // NaN
// 唯一的例外是字符串开头或结尾的空格，因为它们会被忽略
console.log(+" 100 "); // 100

// ~ parseInt(str, radix) (radix:2 ~ 36) 和 parseFloat 的作用。
// ~ 它们可以从字符串中“读取”数字，直到无法读取为止。如果发生 error，则返回收集到的数字。函数 parseInt 返回一个整数，而 parseFloat 返回一个浮点数：
console.log(parseInt("100px")); // 100
console.log(parseFloat("100.25em")); // 100.25
console.log(parseInt("90.23")); // 90  只有整数部分被返回了
console.log(parseFloat("12.3.4")); // 12.3 在第二个点出停止了读取

console.log(parseInt("str90.23")); // NaN  第一个符号停止了读取

// parseInt(str, radix) 具有第二个参数， 它指定了数字系统的基数，所以parseInt可以解析 十六进制数字、二进制数字等字符串
console.log(parseInt("0xff", 16)); // 255
console.log(parseInt("ff", 16)); // 255 没有 0x 仍然有效
console.log(parseInt("ff", 8)); // NaN
console.log(parseInt("133", 2)); // ~ 1 （3不是二进制的数字，停止读取）

// ~ parseInt(str, radix)中的radix为0时，默认十进制
console.log("进制为0：", parseInt("12313", 0)); // 12312
// 一进制 输出NaN
console.log(parseInt("23", 1)); //NaN

// ! TEST:
const res = ["1", "2", "3"].map(parseInt);
console.log(res); // ! [ 1, NaN, NaN ]

/*
 * 原因：
  ["1", "2", "3"].map(parseInt) 相当于
  * ["1", "2", "3"].map((value, i) => parseInt(value, i))
  则： 
  parseInt('1', 0) => 进制0默认十进制  输出 1
  parseInt('2', 1) => 没有进制1  输出NaN
  parseInt('3', 2) => 3超过进制2 输出NaN
  要是有 '4'  '5' ...也都输出NaN
 */
// ! 11 Math 库

// Math.random() 返回一个从 0 到 1 的随机数（不包括 1）
console.log(Math.random());

// Math.max(a, b, c, ...) Math.min(a, b, c...)

console.log(Math.max(3, 5, -10, 0, 1)); // 5
console.log(Math.min(3, 5, -10, 0, 1)); // -10

// Math.pow(base, power)
console.log(Math.pow(2, 10)); // 1024

// ~ 从 min 到 max 的随机数 ：编写一个 random(min, max) 函数，用以生成一个在 min 到 max 之间的随机浮点数（不包括 max)）。
function random(min, max) {
  return min + Math.random() * (max - min);
}

// 生成min _ max的随机整数
function randomInteger(min, max) {
  let rand = min + Math.random() * (max - min);
  return Math.round(rand);
}
// 如果只是在上面的基础上进行Math.round()  出现2的概率比1 和 3 高两倍
/*
values from 1    ... to 1.4999999999  become 1
values from 1.5  ... to 2.4999999999  become 2
values from 2.5  ... to 2.9999999999  become 3
*/
function randomInteger(min, max) {
  let ran = min + Math.random() * (max + 1 - min);
  return Math.floor(ran);
}
console.log(randomInteger(1, 3));
/*

现在所有间隔都以这种方式映射：

values from 1  ... to 1.9999999999  become 1
values from 2  ... to 2.9999999999  become 2
values from 3  ... to 3.9999999999  become 3

所有间隔的长度相同，从而使最终能够均匀分配。
*/
