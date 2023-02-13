// !  instanceof 操作符用于检查一个对象是否属于某个特定的 class。同时，它还考虑了继承。
// ~ 1 通常，instanceof 在检查中会将--【原型链】-- 考虑在内。
let arr = [1];
console.log(arr instanceof Array); // true
console.log(arr instanceof Object); // true

// ~ 此外，我们还可以在静态方法 Symbol.hasInstance 中设置自定义逻辑。
// * obj instanceof Class 算法的执行过程大致如下：

// ! 1) 如果这儿有 静态方法 Symbol.hasInstance，那就直接调用这个方法：

// 例如：

// 设置 instanceOf 检查
// 并假设具有 canEat 属性的都是 animal
class Animal {
  static [Symbol.hasInstance](obj) {
    if (obj.canEat) return true;
  }
}

let obj = { canEat: true };

console.log(obj instanceof Animal); // true：Animal[Symbol.hasInstance](obj) 被调用

// ! 2) 大多数 class 没有 Symbol.hasInstance。在这种情况下，标准的逻辑是：使用 obj instanceOf Class 检查 Class.prototype 是否等于 obj 的原型链中的原型之一。
/*
    obj.__proto__ === Class.prototype?
    obj.__proto__.__proto__ === Class.prototype?
    obj.__proto__.__proto__.__proto__ === Class.prototype?
...
/ 如果任意一个的答案为 true，则返回 true
/ 否则，如果我们已经检查到了原型链的尾端，则返回 false

*/

// ! 2 objA.isPrototypeOf(objB)
// 如果 objA 处在 objB 的原型链中，则返回 true
// ~ 可以将 obj instanceof Class == Class.prototype.isPrototypeOf(obj)

// * 这很有趣，但是 Class 的 constructor 自身是不参与检查的！检查过程只和原型链以及 Class.prototype 有关。

// ! 3 增强版的检查类型——替代typeof 和 instanceof(不仅能检查原始数据类型，而且适用于内建对象Array、Date...，更可贵的是还支持自定义。)
let s1 = Object.prototype.toString.call(123); // [object Number]
let s2 = Object.prototype.toString.call("123"); // [object String]
let s3 = Object.prototype.toString.call([]); // [object Array]
let s4 = Object.prototype.toString.call(null); //  [object Null]
let s5 = Object.prototype.toString.call(undefined); //  [object Undefined]
let s6 = Object.prototype.toString.call(function () {}); //  [object Function]
let s7 = Object.prototype.toString.call(new Date()); //  [object Date]
console.log(s7);

// ! 4 Symbol.toStringTag
// 可以使用特殊的对象属性 Symbol.toStringTag 自定义对象的 toString 方法的行为。
let u = {
  [Symbol.toStringTag]: "User",
};
console.log({}.toString.call(u)); // [object User]

// 对于大多数特定于环境的对象，都有一个这样的属性。下面是一些特定于浏览器的示例：
// 特定于环境的对象和类的 toStringTag：
console.log(window[Symbol.toStringTag]); // Window
console.log(XMLHttpRequest.prototype[Symbol.toStringTag]); // XMLHttpRequest

console.log({}.toString.call(window)); // [object Window]
console.log({}.toString.call(new XMLHttpRequest())); // [object XMLHttpRequest]

// * 所以，如果我们想要获取内建对象的类型，并希望把该信息以字符串的形式返回，而不只是检查类型的话，我们可以用 {}.toString.call 替代 instanceof。

// TEST
// ~ 1 不按套路出牌的 instanceof
// 在下面的代码中，为什么 instanceof 会返回 true？我们可以明显看到，a 并不是通过 B() 创建的。
function A() {}
function B() {}

A.prototype = B.prototype = {};

let a = new A();

console.log(a instanceof B); // true
/*
    ~ instanceof 并不关心函数，而是关心函数的与原型链匹配的 prototype。

    ~ 并且，这里 a.__proto__ == B.prototype，所以 instanceof 返回 true。

    ~ 总之，根据 instanceof 的逻辑，真正决定类型的是 prototype，而不是构造函数。
*/
