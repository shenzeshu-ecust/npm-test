/*
    JavaScript 的精髓在于创建一个函数并将其传递到某个地方。

    ~ 在这样的函数中，我们通常不想离开当前上下文。这就是箭头函数的主战场啦。
*/
// ! 1 箭头函数 没有this 如果需要this，从外部获取

let group = {
  title: "Our Group",
  students: ["John", "Pete", "Alice"],

  showList() {
    this.students.forEach((student) =>
      console.log(this.title + ": " + student)
    );
  },
  // 如果我们使用正常的函数，则会出现错误：
  /*
    showList() {
        this.students.forEach(function(student) {
            *  Error: Cannot read property 'title' of undefined
            alert(this.title + ': ' + student);
        });
    }
    * 报错是因为 forEach 运行它里面的这个函数，
    * 但是这个函数的 this 为默认值 this=undefined，因此就出现了尝试访问 undefined.title 的情况。
   */
};

group.showList();
// 这里 forEach 中使用了箭头函数，所以其中的 this.title 其实和外部方法 showList 的完全一样。那就是：group.title。

// ! 2 不能对箭头函数进行 new 操作

// ~ 不具有 this 自然也就意味着另一个限制：箭头函数不能用作构造器（constructor）。不能用 new 调用它们。

// ! 3 ()=>{}  vs arr.bind(this)

/*

箭头函数 VS bind

箭头函数 => 和使用 .bind(this) 调用的常规函数之间有细微的差别：

    .bind(this) 创建了一个该函数的“绑定版本”。
    箭头函数 => 没有创建任何绑定。箭头函数只是没有 this。this 的查找与常规变量的搜索方式完全相同：在外部词法环境中查找。

*/

// ! 4 箭头函数没有 “arguments”
// 当我们需要使用当前的 this 和 arguments 转发一个调用时，这对装饰器（decorators）来说非常有用。

// 例如，defer(f, ms) 获得了一个函数，并返回一个包装器，该包装器将调用延迟 ms 毫秒：
function defer(f, ms) {
  return function () {
    // ! 箭头函数的arguments来源于这里的参数
    setTimeout(() => f.apply(this, arguments), ms); // ! 本来function会指向window，但是箭头函数this会去外面寻找
  };
}

function sayHi(who) {
  alert("Hello, " + who);
}

let sayHiDeferred = defer(sayHi, 2000);
sayHiDeferred("John"); // 2 秒后显示：Hello, John

// ~ 假如采用普通函数实现defer
function defer(f, ms) {
  // ~ 需要保存参数
  return function (...args) {
    let ctx = this; // ~ 需要保存函数的this
    setTimeout(function () {
      return f.apply(ctx, args);
    }, ms);
  };
}

// ! 5 它们也没有 super
