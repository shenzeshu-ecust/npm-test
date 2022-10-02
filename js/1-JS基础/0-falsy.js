// ! 在 JavaScript 中只有 8 个 falsy 值。
/*
    -值 	-说明

    false 	false 关键字
    0 	数值 zero
    -0 	数值 负 zero
    0n 	当 BigInt 作为布尔值使用时，遵从其作为数值的规则. 0n 是 falsy 值。
    "", '', `` 	这是一个空字符串 (字符串的长度为零). JavaScript 中的字符串可用双引号 "", 单引号 '', 或 模板字面量 `` 定义。
    null 	null - 缺少值
    undefined 	undefined - 原始值
    NaN 	NaN - 非数值
*/
// ~ JavaScript 中 falsy 值的例子 (在布尔值上下文中被转换为 false，从而绕过了 if 代码块):
if (false){}
if (null){}
if (undefined){}
if (0){}
if (0n){}
if (NaN){}
if (''){}
if (""){}
if (``){}
if (document.all){}
// 备注： document.all 在过去被用于浏览器检测，是 HTML 规范在此定义了故意与 ECMAScript 标准相违背的（译者注：document.all 虽然是一个对象，但其转换为 boolean 类型是 false），
// 以保持与历史代码的兼容性 (if (document.all) { // Internet Explorer code here } 或使用 document.all 而不先检查它的存在：document.all.foo).