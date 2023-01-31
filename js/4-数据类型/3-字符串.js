// 字符串的内部格式始终是 UTF-16，它不依赖于页面编码。

// ! 1 单引号，双引号，反引号
// 反引号优点
// 1) 嵌入变量
// 2) 允许跨行

let guestList = `Guests:
 1 沈泽庶
 2 董雷飞
 ...
`;

console.log(guestList);

// 3) 反引号还允许我们在第一个反引号之前指定一个“模版函数”。语法是：func`string`。函数 func 被自动调用，接收字符串和嵌入式表达式，并处理它们。
// 你可以在 docs 中阅读更多关于它们的信息。这叫做 “tagged templates”。此功能可以更轻松地将字符串包装到自定义模版或其他函数中，但这很少使用。
let person = "Mike";
let age = 28;

function myTag(strings, personExp, ageExp) {
  let str0 = strings[0]; // "That "
  let str1 = strings[1]; // " is a "
  let str2 = strings[2]; // "."

  let ageStr;
  if (ageExp > 99) {
    ageStr = "centenarian";
  } else {
    ageStr = "youngster";
  }

  // We can even return a string built using a template literal
  return `${str0}${personExp}${str1}${ageStr}${str2}`;
}

let output = myTag`That ${person} is a ${age}.`;

console.log(output);
// That Mike is a youngster.

// ! 2 特殊字符
// “换行符（newline character）”，用以支持使用单引号和双引号来创建跨行字符串。换行符写作 \n，用来表示换行：
let guestList1 = "Guests:\n * John\n * Pete\n * Mary";
console.log(guestList1);
/*
    字符 	    描述
    \n 	    换行
    \r 	    在 Windows 文本文件中，两个字符 \r\n 的组合代表一个换行。而在非 Windows 操作系统上，它就是 \n。这是历史原因造成的，大多数的 Windows 软件也理解 \n。
    \',     \" 	引号
    \\ 	    反斜线
    \t 	    制表符
    \b,     \f, \v 	退格，换页，垂直标签 —— 为了兼容性，现在已经不使用了。
    \xXX 	具有给定十六进制 Unicode XX 的 Unicode 字符，例如：'\x7A' 和 'z' 相同。
    \uXXXX 	以 UTF-16 编码的十六进制代码 XXXX 的 Unicode 字符，例如 \u00A9 —— 是版权符号 © 的 Unicode。它必须正好是 4 个十六进制数字。
    \u{X…XXXXXX}（1 到 6 个十六进制字符） 	具有给定 UTF-32 编码的 Unicode 符号。一些罕见的字符用两个 Unicode 符号编码，占用 4 个字节。这样我们就可以插入长代码了。
 */

console.log("\u00A9"); // ©
console.log("\u{20331}"); // 佫，罕见的中国象形文字（长 Unicode）
console.log("\u{1F60D}"); // 😍，笑脸符号（另一个长 Unicode）

// ~ 所有的特殊字符都以反斜杠字符 \ 开始。它也被称为“转义字符”。

console.log("I'm 18 years old"); // I'm 18 years old
console.log(`The backslash: \\`); // The backslash: \

// ! 3 length
console.log("My\n".length); // 3 注意 \n 是一个单独的“特殊”字符，所以长度确实是 3。
console.log("\u{1F60D}".length); // 2  长度为2
console.log("\u00A9".length); // 1

// ! 4 访问字符
// 1 str[pos] 现代化方法
// 2 str.charAt(pos)  历史传下来的方法
// ~ 区别： 如果没有找到字符，[] 返回 undefined，而 charAt 返回一个空字符串：
let str = "Hello";
console.log(str[7]); // undefined
console.log(str.charAt(7)); // ''

// 3 for of 遍历
for (let char of "Hello") {
  console.log(char); // H,e,l,l,o（char 变为 "H"，然后是 "e"，然后是 "l" 等）
}

// ! 4 字符串 不可变！
// 在 JavaScript 中，字符串不可更改。改变字符是不可能的。
let tr = "Hello";
tr[0] = "1";
console.log(tr); // Hello 不变！

// 通常的解决方法是创建一个新的字符串，并将其分配给 str 而不是以前的字符串。
let strr = "Hi";
strr = "h" + strr[1]; // 替换字符串
console.log(strr); // hi

// ! 5 str.indexOf(target, startPos)
// 可选的第二个参数允许我们从一个给定的位置开始检索。
let strd = "Widget with id";
console.log(strd.indexOf("id", 2)); // 12

// 还有一个类似的方法 str.lastIndexOf(substr, position)，它从字符串的末尾开始搜索到开头。它会以相反的顺序列出这些事件。
// 如果我们对所有存在位置都感兴趣，可以在一个循环中使用 indexOf。每一次新的调用都发生在上一匹配位置之后：
let str1 = "As sly as a fox, as strong as an ox";

let target = "as"; // 这是我们要查找的目标

let pos = 0;
while (true) {
  let foundPos = str1.indexOf(target, pos);
  if (foundPos == -1) break;

  console.log(`Found at ${foundPos}`);
  pos = foundPos + 1; // 继续从下一个位置查找
}

/*
这里使用的一个老技巧是 bitwise NOT ~ 运算符。它将数字转换为 32-bit 整数（如果存在小数部分，则删除小数部分），然后对其二进制表示形式中的所有位均取反。

实际上，这意味着一件很简单的事儿：对于 32-bit 整数，~n 等于 -(n+1)。

例如：
*/
console.log(~2); // -3，和 -(2+1) 相同
console.log(~1); // -2，和 -(1+1) 相同
console.log(~0); // -1，和 -(0+1) 相同
console.log(~-1); // 0，和 -(-1+1) 相同

/*
正如我们看到这样，只有当 n == -1 时，~n 才为零（适用于任何 32-bit 带符号的整数 n）。

因此，仅当 indexOf 的结果不是 -1 时，检查 if ( ~str.indexOf("...") ) 才为真。换句话说，当有匹配时。

人们用它来简写 indexOf 检查：
*/

if (~str.indexOf("H")) {
  console.log("Found it");
}
// 确切地说，由于 ~ 运算符将大数字截断为 32 位，因此存在给出 0 的其他数字，最小的数字是 ~4294967295=0。这使得这种检查只有在字符串没有那么长的情况下才是正确的。
// 现在我们只会在旧的代码中看到这个技巧，因为现代 JavaScript 提供了 .includes 方法（见下文）。

// ! 6 includes，startsWith，endsWith
// 1） 更现代的方法 str.includes(substr, pos) 根据 str 中是否包含 substr 来返回 true/false。如果我们需要检测匹配，但不需要它的位置，那么这是正确的选择：
console.log("Widget".includes("id", 3)); // false 从位置 3 开始没有 "id"
// 2） 方法 str.startsWith 和 str.endsWith 的功能与其名称所表示的意思相同
console.log("Widget".startsWith("Wid")); // true，"Widget" 以 "Wid" 开始
console.log("Widget".endsWith("get")); // true，"Widget" 以 "get" 结束

// ! 7 获取子串 substring、substr 和 slice。

// 1）str.slice(start [, end]) 返回字符串从 start 到（但不包括）end 的部分。
let strExm = "stringify";
console.log(strExm.slice(2, 4)); // 'ri'
console.log(strExm.slice(0, 1)); // 's'

// 如果没有第二个参数，slice 会一直运行到字符串末尾：
console.log(strExm.slice(3)); // 'ingify'
// ~ start/end 也有可能是负值。它们的意思是起始位置从字符串结尾计算：
console.log(strExm.slice(-4, -1)); // 'gif'

// 2) str.substring(start [, end]) 返回字符串从 start 到（但不包括）end 的部分。
// 和slice类似
// ~ 1 但它允许 start 大于 end。
// ~ 2 不支持负参数（不像 slice），它们被视为 0。
// 这些对于 substring 是相同的
console.log(strExm.substring(2, 6)); // "ring"
console.log(strExm.substring(6, 2)); // "ring"

// ……但对 slice 是不同的：
console.log(strExm.slice(2, 6)); // "ring"（一样）
console.log(strExm.slice(6, 2)); // ""（空字符串）

// 3）str.substr(start [, length]) 这个允许我们指定 length 而不是结束位置：
console.log(strExm.substr(2, 4)); // 'ring'，从位置 2 开始，获取 4 个字符
// 第一个参数可能是负数，从结尾算起：
console.log(strExm.substr(-4, 2)); // 'gi'，从第 4 位获取 2 个字符

/**
 * 正式一点来讲，substr 有一个小缺点：它不是在 JavaScript 核心规范中描述的，而是在附录 B 中。
 * 附录 B 的内容主要是描述因历史原因而遗留下来的仅浏览器特性。因此，理论上非浏览器环境可能无法支持 substr，但实际上它在别的地方也都能用。
 */

// ! 8 比较字符串
// 字符串按字母顺序逐字比较。
// 不过，也有一些奇怪的地方。
// 1）小写字母总是大于大写字母：
console.log("a" > "Z"); // true
// 2) 带变音符号的字母存在“乱序”的情况：
console.log("Österreich" > "Zealand"); // true

// 原因：
// ~ 所有的字符串都使用 UTF-16 编码。即：每个字符都有对应的数字代码。有特殊的方法可以获取代码表示的字符，以及字符对应的代码。
// str.codePointAt(pos)    返回在 pos 位置的字符代码 :
console.log("a".codePointAt(0)); // 97
console.log("A".codePointAt(0)); // 65
// String.fromCodePoint(code)   通过数字 code 创建字符
console.log(String.fromCodePoint(90)); // 'Z'
// 我们还可以用 \u 后跟十六进制代码，通过这些代码添加 Unicode 字符：
// 在十六进制系统中 90 为 5a
console.log("\u005a"); // Z

// ~ 现在我们看一下代码为 65..220 的字符（拉丁字母和一些额外的字符），方法是创建一个字符串
str = "";
for (let i = 65; i <= 220; i++) {
  str += String.fromCodePoint(i);
}
console.log(str);

/**
 * ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~
    ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜ
    *  看到没？大写字符（65-90）  -->  一些特殊字符 --> 小写字符（97-122）  -->  带变音符号的字母
 */

// ! 正确的比较 srt.localeCompare(str2)
/**
 * 执行字符串比较的“正确”算法比看起来更复杂，因为不同语言的字母都不相同。因此浏览器需要知道要比较的语言。
 * 幸运的是，所有现代浏览器（IE10- 需要额外的库 Intl.JS) 都支持国际化标准 ECMA-402。
 * 它提供了一种特殊的方法来比较不同语言的字符串，遵循它们的规则。
 * 调用 str.localeCompare(str2) 会根据语言规则返回一个整数，这个整数能指示字符串 str 在排序顺序中排在字符串 str2 前面、后面、还是相同：

    如果 str 排在 str2 前面，则返回负数。
    如果 str 排在 str2 后面，则返回正数。
    如果它们在相同位置，则返回 0。

这个方法实际上在 文档 中指定了两个额外的参数，这两个参数允许它指定语言（默认语言从环境中获取，字符顺序视语言不同而不同）并设置诸如区分大小写，或应该将 "a" 和 "á" 作相同处理等附加的规则。
 */
console.log("Österreich".localeCompare("Zealand")); // -1

// ! 9 代理对
// 所有常用的字符都是一个 2 字节的代码。大多数欧洲语言，数字甚至大多数象形文字中的字母都有 2 字节的表示形式。
// 但 2 字节只允许 65536 个组合，这对于表示每个可能的符号是不够的。所以稀有的符号被称为“代理对”的一对 2 字节的符号编码。
// ~ 这些符号的长度是 2：
console.log("𝒳".length); // 2
console.log("😂".length); // 2 笑哭表情
console.log("𩷶".length); // 2 罕见的中国象形文字
console.log("你".length); // 1

/**
 * 注意，代理对在 JavaScript 被创建时并不存在，因此无法被编程语言正确处理！

我们实际上在上面的每个字符串中都有一个符号，但 length 显示长度为 2。

String.fromCodePoint 和 str.codePointAt 是几种处理代理对的少数方法。它们最近才出现在编程语言中。
在它们之前，只有 String.fromCharCode 和 str.charCodeAt。这些方法实际上与 fromCodePoint/codePointAt 相同，但是不适用于代理对。
 */

// 获取符号可能会非常麻烦，因为代理对被认为是两个字符：
console.log("𝒳"[0]); // �   奇怪的符号 请注意，代理对的各部分没有任何意义。因此，显示的实际上是垃圾信息

/**
 * 技术角度来说，代理对也是可以通过它们的代码检测到的：
 * 如果一个字符的代码在 0xd800..0xdbff 范围内，那么它是代理对的第一部分。下一个字符（第二部分）必须在 0xdc00..0xdfff 范围中。这些范围是按照标准专门为代理对保留的。
 */
// charCodeAt 不理解代理对，所以它给出了代理对的代码

console.log("𝒳".charCodeAt(0).toString(16)); // d835，在 0xd800 和 0xdbff 之间
console.log("𝒳".charCodeAt(1).toString(16)); // dcb3, 在 0xdc00 和 0xdfff 之间

// ! 10 变音符号与规范化
/**
 * 在许多语言中，都有一些由基本字符组成的符号，在其上方/下方有一个标记。
例如，字母 a 可以是 àáâäãåā 的基本字符。最常见的“复合”字符在 UTF-16 表中都有自己的代码。但不是全部，因为可能的组合太多。
为了支持任意组合，UTF-16 允许我们使用多个 Unicode 字符：基本字符紧跟“装饰”它的一个或多个“标记”字符。
 */
console.log("S\u0307"); // Ṡ 上点
console.log("S\u0307\u0323"); // Ṩ  上下有点

// ~ 这在提供良好灵活性的同时，也存在一个有趣的问题：两个视觉上看起来相同的字符，可以用不同的 Unicode 组合表示。
let s1 = "S\u0307\u0323"; // Ṩ，S + 上点 + 下点
let s2 = "S\u0323\u0307"; // Ṩ，S + 下点 + 上点

console.log(`s1: ${s1}, s2: ${s2}`);

console.log(s1 == s2); // false，尽管字符看起来相同（?!）

// ~ 为了解决这个问题，有一个 “Unicode 规范化”算法，它将每个字符串都转化成单个“通用”格式。
// ~ str.normalize()
console.log("S\u0307\u0323".normalize() == "S\u0323\u0307".normalize()); // true
// 有趣的是，在实际情况下，normalize() 实际上将一个由 3 个字符组成的序列合并为一个：\u1e68（S 有两个点）。
console.log("S\u0307\u0323".normalize().length); // 1
console.log("S\u0307\u0323".normalize() == "\u1e68"); // true
// 事实上，情况并非总是如此，因为符号 Ṩ 是“常用”的，所以 UTF-16 创建者把它包含在主表中并给它了对应的代码。
