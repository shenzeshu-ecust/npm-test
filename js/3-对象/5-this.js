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

/*
 
 * 在 JavaScript 中，this 是“自由”的，它的值是在调用时计算出来的，它的值并不取决于方法声明的位置，而是取决于在“点符号前”的是什么对象。

 * 在运行时对 this 求值的这个概念既有优点也有缺点。一方面，函数可以被重用于不同的对象。另一方面，更大的灵活性造成了更大的出错的可能。
 */

// ! 箭头函数没有自己的this，取决于外部“正常的”函数
let user = {
  firstName: "Ilya",
  sayHi() {
    let arrow = () => console.log(this.firstName); // ~ 这里的this取决于外部的sayHi方法
    arrow();
  },
};

user.sayHi(); // Ilya

// ! test
function makeUser() {
  return {
    name: "John",
    ref: this,
  };
}

let user = makeUser();
// ~ 因为它是被作为函数调用的，而不是通过点符号被作为方法调用。

console.log(user.ref.name); // undefined

// ! 实现链式调用
let ladder = {
  step: 0,
  up() {
    this.step++;
    return this; // ~ 在每次方法最后返回对象本身
  },
  down() {
    this.step--;
    return this;
  },
  showStep() {
    console.log(this.step);
    return this;
  },
};
ladder.up().up().showStep().down().showStep();
