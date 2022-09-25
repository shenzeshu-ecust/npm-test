// --strictNullChecks标记可以解决(可以把undefined 和null 赋值给任意类型)错误：当你声明一个变量时，它不会自动地包含 null或 undefined。
// 你可以使用联合类型明确的包含它们：
let s = "foo";
s = null; // 错误, 'null'不能赋值给'string'
let sn: string | null = "bar";
sn = null; // 可以
sn = undefined; // error, 'undefined'不能赋值给'string | null'

// ~ 去除null的方式
// 1 类型保护
function f1(sn: string | null): string {
  if (sn == null) {
    return "default";
  } else {
    return sn;
  }
}
// 2 短路运算符
function f2(sn: string | null): string {
  return sn || "default";
}
// ! 如果编译器不能够去除 null或 undefined，你可以使用 类型断言 手动去除。
// ! 语法是添加 !后缀： identifier!从 identifier的类型里去除了 null和 undefined：
function broken(name: string | null): string {
  function postfix(epithet: string) {
    return name.charAt(0) + ".  the " + epithet; // error, 'name' is possibly null
  }
  name = name || "Bob";
  return postfix("great");
}

function fixed(name: string | null): string {
  function postfix(epithet: string) {
    return name!.charAt(0) + ".  the " + epithet; // ok
  }
  name = name || "Bob";
  return postfix("great");
}
/*
    本例使用了嵌套函数，因为编译器无法去除嵌套函数的null（除非是立即调用的函数表达式）。 
    因为它无法跟踪所有对嵌套函数的调用，尤其是你将内层函数做为外层函数的返回值。 如果无法知道函数在哪里被调用，就无法知道调用时 name的类型
*/
