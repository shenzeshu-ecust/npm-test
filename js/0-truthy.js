// ! 在 JavaScript 中，truthy（真值）指的是在布尔值上下文中，转换后的值为 true 的值。被定义为假值以外的任何值都为真值。
// !（即所有除 false、0、-0、0n、""、null、undefined 和 NaN 以外的皆为真值）。

// JavaScript 中的真值示例如下（将被转换为 true，因此 if 后的代码段将被执行）：
if (true)
if ({})
if ([])
if (42)
if ("0")
if ("false")
if (new Date())
if (-42)
if (12n)
if (3.14)
if (-3.14)
if (Infinity)
if (-Infinity){}
