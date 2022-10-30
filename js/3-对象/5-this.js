// 如果不用this  可能导致不可靠
let user = {
  name: "John",
  age: 27,
  sayHi() {
    console.log(user.name);
  },
};
let admin = user;
user = null;
admin.sayHi(); // 错误

// ! this的值在代码运行时计算出来，取决于代码上下文
function sayHi() {
  alert(this.name);
}

user.f = sayHi;
admin.f = sayHi;

// 这两个调用有不同的 this 值
// 函数内部的 "this" 是“点符号前面”的那个对象
user.f(); // John（this == user）
admin.f(); // Admin（this == admin）

admin["f"](); // Admin（使用点符号或方括号语法来访问这个方法，都没有关系。）
