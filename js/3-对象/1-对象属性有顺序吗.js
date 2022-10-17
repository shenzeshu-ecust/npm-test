// 对象有顺序吗？换句话说，如果我们遍历一个对象，我们获取属性的顺序是和属性添加时的顺序相同吗？这靠谱吗？

// ! answer: “有特别的顺序”：整数属性会被进行排序，其他属性则按照创建的顺序显示
let codes = {
  49: "Germany",
  41: "Switzerland",
  44: "Great Britain",
  // ..,
  1: "USA",
};

for (let code in codes) {
  console.log(code); // 1, 41, 44, 49
}
// ~ 因为这些电话号码是整数，所以它们以升序排列。所以我们看到的是 1, 41, 44, 49。

// * 这里的“整数属性”指的是一个可以在不做任何更改的情况下与一个整数进行相互转换的字符串。
// * 所以，"49" 是一个整数属性名，因为我们把它转换成整数，再转换回来，它还是一样的。但是 “+49” 和 “1.2” 就不行了：

// Number(...) 显式转换为数字
// Math.trunc 是内建的去除小数部分的方法。
console.log(String(Math.trunc(Number("49")))); // "49"，相同，整数属性
console.log(String(Math.trunc(Number("+49")))); // "49"，不同于 "+49" ⇒ 不是整数属性
console.log(String(Math.trunc(Number("1.2")))); // "1"，不同于 "1.2" ⇒ 不是整数属性

// ! 如果属性名不是整数，那它们就按照创建时的顺序来排序，例如：
let user = {
  name: "John",
  surname: "Smith",
};
user.age = 25; // 增加一个

// 非整数属性是按照创建的顺序来排列的
for (let prop in user) {
  console.log(prop); // name, surname, age
}

// ! 所以，为了解决电话号码的问题，我们可以使用非整数属性名来 欺骗 程序。只需要给每个键名加一个加号 "+" 前缀就行了。
// (因为目标对象是德国  希望德国排前面)
let codesAsThink = {
  "+49": "Germany",
  "+41": "Switzerland",
  "+44": "Great Britain",
  // ..,
  "+1": "USA",
};

for (let code in codesAsThink) {
  console.log(+code); // 49, 41, 44, 1
}
