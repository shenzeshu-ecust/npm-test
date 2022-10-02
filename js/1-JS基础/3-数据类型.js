// ~ 我们可以将任何类型的值存入变量。例如，一个变量可以在前一刻是个字符串，下一刻就存储一个数字：

// 没有错误
let message = "hello";
message = 123456;

// ! 允许这种操作的编程语言，例如 JavaScript，被称为“动态类型”（dynamically typed）的编程语言，
// ! 意思是虽然编程语言中有不同的数据类型，但是你定义的变量并不会在定义后，被限制为某一数据类型。

// ! 1 NaN 代表一个计算错误。它是一个不正确的或者一个未定义的数学操作所得到的结果，比如：
console.log( "not a number" / 2 ); // NaN，这样的除法是错误的
// NaN 是粘性的。任何对 NaN 的进一步数学运算都会返回 NaN：
console.log(NaN + 1);
console.log(NaN * 3);
// 所以，如果在数学表达式中有一个 NaN，会被传播到最终结果
// ~ 只有一个例外：
// NaN ** 0 结果为 1。
console.log(NaN ** 0);

// ! 2 BigInt 类型
// 在 JavaScript 中，“number” 类型无法安全地表示大于 (2**53-1)（即 9007199254740991），或小于 -(2**53-1) 的整数。
// 更准确的说，“number” 类型可以存储更大的整数（最多 1.7976931348623157 * 10**308），
// 但超出安全整数范围 ±(2**53-1) 会出现精度问题，因为并非所有数字都适合固定的 64 位存储。因此，可能存储的是“近似值”。

// 例如，这两个数字（正好超出了安全整数范围）是相同的：

console.log(9007199254740991 + 1); // 9007199254740992
console.log(9007199254740991 + 2); // 9007199254740992
// ~ 也就是说，所有大于 (253-1) 的奇数都不能用 “number” 类型存储。

// ~ 可以通过将 n 附加到整数字段的末尾来创建 BigInt 值。

// 尾部的 "n" 表示这是一个 BigInt 类型
const bigInt = 1234567890123456789012345678901234567890n
// 创建 bigint 的方式有两种：在一个整数字面量后面加 n 或者调用 BigInt 函数，该函数从字符串、数字等中生成 bigint。
const sameBigint = BigInt("1234567890123456789012345678901234567890");
const bigintFromNumber = BigInt(10); // 与 10n 相同

// BigInt 大多数情况下可以像常规数字类型一样使用，例如：

alert(1n + 2n); // 3

alert(5n / 2n); // 2

// ~ 请注意：除法 5/2 的结果向零进行舍入，舍入后得到的结果没有了小数部分。
// ~ 对 bigint 的所有操作，返回的结果也是 bigint。

// ~ 我们不可以把 bigint 和常规数字类型混合使用：

alert(1n + 2); // Error: Cannot mix BigInt and other types

// 如果有需要，我们应该显式地转换它们：使用 BigInt() 或者 Number()，像这样：

let bigint = 1n;
let number = 2;

// 将 number 转换为 bigint
alert(bigint + BigInt(number)); // 3

// 将 bigint 转换为 number
alert(Number(bigint) + number); // 3

// ! BigInt 不支持一元加法

// 一元加法运算符 +value，是大家熟知的将 value 转换成数字类型的方法。

// 为了避免混淆，在 bigint 中不支持一元加法：

let bigint1 = 1n;

alert( +bigint1 ); // error

// 所以我们应该用 Number() 来将一个 bigint 转换成一个数字类型。

// ! 比较运算符，例如 < 和 >，使用它们来对 bigint 和 number 类型的数字进行比较没有问题：

alert( 2n > 1n ); // true

alert( 2n > 1 ); // true

// ! 但是请注意，由于 number 和 bigint 属于不同类型，它们可能在进行 == 比较时相等，但在进行 ===（严格相等）比较时不相等：

alert( 1 == 1n ); // true

alert( 1 === 1n ); // false
// ! typeof --- 是运算符 等同于typeof(x)
typeof null // "object"  

typeof alert // "function"  
/*
 * typeof null 的结果为 "object"。这是官方承认的 typeof 的错误，这个问题来自于 JavaScript 语言的早期阶段，并为了兼容性而保留了下来。null 绝对不是一个 object。null 有自己的类型，它是一个特殊值。typeof 的行为在这里是错误的。
 * typeof alert 的结果是 "function"，因为 alert 在 JavaScript 语言中是一个函数。我们会在下一章学习函数，那时我们会了解到，在 JavaScript 语言中没有一个特别的 “function” 类型。
 * 函数隶属于 object 类型。但是 typeof 会对函数区分对待，并返回 "function"。这也是来自于 JavaScript 语言早期的问题。从技术上讲，这种行为是不正确的，但在实际编程中却非常方便。
 */