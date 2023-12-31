function addMethod(object, name, fn) {
  var old = object[name]; // ~ 把前一次添加的方法存在一个临时变量old里面
  object[name] = function () {
    // ~ 重写了object[name]的方法
    // ~ 如果调用object[name]方法时，传入的参数个数跟预期的一致，则直接调用
    if (fn.length === arguments.length) {
      return fn.apply(this, arguments);
      // ~ 否则，判断old是否是函数，如果是，就调用old
    } else if (typeof old === "function") {
      return old.apply(this, arguments);
    }
  };
}

addMethod(window, "fn", (name) => console.log(`我是${name}`));
addMethod(window, "fn", (name, age) => console.log(`我是${name},今年${age}岁`));
addMethod(window, "fn", (name, age, sport) =>
  console.log(`我是${name},今年${age}岁,喜欢运动是${sport}`)
);

/*
 * 实现效果
 */

window.fn("林三心"); // 我是林三心
window.fn("林三心", 18); // 我是林三心，今年18岁
window.fn("林三心", 18, "打篮球"); // 我是林三心，今年18岁，喜欢运动是打篮球
