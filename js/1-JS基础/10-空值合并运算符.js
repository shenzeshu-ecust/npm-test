// 空值合并运算符（nullish coalescing operator）的写法为两个问号 ??
// 当一个值既不是 null 也不是 undefined 时，我们将其称为“已定义的（defined）”
// a ?? b 的结果是：
// ! 换句话说，如果第一个参数不是 null/undefined，则 ?? 返回第一个参数。否则，返回第二个参数。

// 重写 ??
// let res = a !== null && a !== undefined ? a : b;

// 使用场景
// ~ 1 提供默认值
let user;
console.log(user ?? "匿名"); // 匿名  因为user未定义
let user1 = "John";
console.log(user1 ?? "匿名"); // John 因为user已经定义

// ~ 2 使用 ?? 序列从一系列的值中选择出第一个非 null/undefined 的值
let firstName = null;
let lastName;
let nickName = "SuperCoder";
console.log(firstName ?? lastName ?? nickName ?? "匿名"); // SuperCoder

// ! 与或|| 区别
/*
    它们之间重要的区别是：

    ~    || 返回第一个 真 值。
    ~    ?? 返回第一个 已定义的 值。
*/

let height = 0;
console.log(height || 100); // 100 首先会检查 height 是否为一个假值，它是 0，确实是假值。
console.log(height ?? 100); // 0   首先会检查 height 是否为 null/undefined，发现它不是。

// ?? 和 !! 优先级相同  优先级都为4
// 空值合并运算符在 = 和 ? 运算前计算，但在大多数其他运算（例如 + 和 *）之后计算。

// ! 出于安全原因，JavaScript 禁止将 ?? 运算符与 && 和 || 运算符一起使用，除非使用括号明确指定了优先级。
// let x = 1 && 2 ?? 3
let y = (1 && 2) ?? 3;
console.log(y); // 2

console.log("" ?? "已定义"); // ''
console.log(false ?? "已定义"); // false
console.log(0 ?? "已定义"); // 0

// false、''、0、都被认为已定义， 也就是除了null 和 undefined 其他都认！
