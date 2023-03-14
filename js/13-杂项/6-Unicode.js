// 正如我们所知，JavaScript 的字符串是基于 Unicode 的：每个字符由 1-4 个字节的字节序列表示。

// JavaScript 允许我们通过下述三种表示方式之一将一个字符以其十六进制 Unicode 编码的方式插入到字符串中：

// ! 1 \xXX
// XX 必须是介于 00 与 FF 之间的两位十六进制数，\xXX 表示 Unicode 编码为 XX 的字符。
// 因为 \xXX 符号只支持两位十六进制数，所以它只能用于前 256 个 Unicode 字符。
// 这前 256 个字符包括拉丁字母、最基本的语法字符和其他一些字符。例如，"\x7A" 表示 "z" (Unicode 编码为 U+007A)。

console.log("\x7A"); // z
console.log("\xA9"); // © (版权符号)

// ! 2 \uXXXX
// XXXX 必须是 4 位十六进制数，值介于 0000 和 FFFF 之间。此时，\uXXXX 便表示 Unicode 编码为 XXXX 的字符。
// Unicode 值大于 U+FFFF 的字符也可以用这种方法来表示，但在这种情况下，我们要用到代理对（我们将在本章的后面讨论它）。
console.log("\u00A9"); // ©, 等同于 \xA9，只是使用了四位十六进制数表示而已
console.log("\u044F"); // я（西里尔字母）
console.log("\u2191"); // ↑（上箭头符号）

// ! 3 \u{X…XXXXXX}
// X…XXXXXX 必须是介于 0 和 10FFFF（Unicode 定义的最高码位）之间的 1 到 6 个字节的十六进制值。这种表示方式让我们能够轻松地表示所有现有的 Unicode 字符。
console.log("\u{20331}"); // 佫, 一个不常见的中文字符（长 Unicode）
console.log("\u{1F60D}"); // 😍, 一个微笑符号（另一个长 Unicode）

// ~ 代理对
/* 
所有常用字符都有对应的 2 字节长度的编码（4 位十六进制数）。大多数欧洲语言的字母、数字、以及基本统一的 CJK 表意文字集（CJK —— 来自中文、日文和韩文书写系统）中的字母，均有对应的 2 字节长度的 Unicode 编码。

最初，JavaScript 是基于 UTF-16 编码的，只允许每个字符占 2 个字节长度。但 2 个字节只允许 65536 种组合，这对于表示 Unicode 里每个可能符的号来说，是不够的。

因此，需要使用超过 2 个字节长度来表示的稀有符号，我们则使用一对 2 字节长度的字符编码，它被称为“代理对”（surrogate pair）。

这种做也有副作用 —— 这些符号的长度为 2：
*/
console.log("𝒳".length); // 2, 大写的数学符号 X
console.log("😂".length); // 2, 笑哭的表情
console.log("𩷶".length); // 2, 一个少见的中文字符
console.log("\uD834\uDF06"); // 𠮷
console.log("\uD834\uDF07"); // 𠮸
console.log("\uD834\uDF08"); // 𠮹
console.log("\uD834\uDF09"); // 𠮺

// 如何获取这些符号，也是一个棘手的问题：因为编程语言的大部分功能都将代理对当作两个字符对待。
/*
 从技术上讲，可以通过代理对的编码来检测代理对：如果一个字符的编码在 0xd800..0xdbff 这个范围中，那么它就是代理对的前一个部分。下一个字符（第二部分）的编码必须在 0xdc00..0xdfff 范围中。这两个范围中的编码是规范中专为代理对预留的。

~ 基于此，JavaScript 新增了 String.fromCodePoint 和 str.codePointAt 这两个方法来处理代理对。 
它们本质上与 String.fromCharCode 和 str.charCodeAt 相同，但它们可以正确地处理代理对。


 */
// charCodeAt 不会考虑代理对，所以返回了 𝒳 前半部分的编码:

console.log("𝒳".charCodeAt(0).toString(16)); // d835

// codePointAt 可以正确处理代理对
console.log("𝒳".codePointAt(0).toString(16)); // 1d4b3，读取到了完整的代理对

// 也就是说，如果我们从 𝒳 的位置 1 开始获取对应的编码（这么做是不对的），那么这两个方法都只会返回此代理对的后半部分：

console.log("𝒳".charCodeAt(1).toString(16)); // dcb3
console.log("𝒳".codePointAt(1).toString(16)); // dcb3
// 无意义的代理对后半部分
