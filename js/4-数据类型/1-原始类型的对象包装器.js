/**
 * 以下是 JavaScript 创建者面临的悖论：

    1 人们可能想对诸如字符串或数字之类的原始类型执行很多操作。最好使用方法来访问它们。
    2 原始类型必须尽可能的简单轻量。

    -- 而解决方案看起来多少有点尴尬，如下：

    1 原始类型仍然是原始的。与预期相同，提供单个值
    2 JavaScript 允许访问字符串，数字，布尔值和 symbol 的方法和属性。
    3 为了使它们起作用，创建了提供额外功能的特殊“对象包装器”，使用后即被销毁。

 */

// ! 1 “对象包装器”对于每种原始类型都是不同的，它们被称为 String、Number、Boolean、Symbol 和 BigInt。因此，它们提供了不同的方法。

// 字符串方法 str.toUpperCase() 返回一个大写化处理的字符串。
let str = "Hello";
console.log(str.toLowerCase());

/*
 * 以下是 str.toUpperCase() 中实际发生的情况：

    ~ 字符串 str 是一个原始值。因此，在访问其属性时，会创建一个包含字符串字面值的特殊对象，并且具有可用的方法，例如 toUpperCase()。
    ~ 该方法运行并返回一个新的字符串（由 log 显示）。
    ~ 特殊对象被销毁，只留下原始值 str。

所以原始类型可以提供方法，但它们依然是轻量级的。

JavaScript 引擎高度优化了这个过程。它甚至可能跳过创建额外的对象。但是它仍然必须遵守规范，并且表现得好像它创建了一样。
 */

// number类型也有类似的方法
console.log((1.234).toFixed(2));

/*
 ! 2 构造器 String/Number/Boolean 仅供内部使用

像 Java 这样的一些语言允许我们使用 new Number(1) 或 new Boolean(false) 等语法，明确地为原始类型创建“对象包装器”。

~ 在 JavaScript 中，由于历史原因，这(对象包装器创建原始类型)也是可以的，但极其 不推荐。因为这样会出问题。
 */
// ! 用对象包装器创建原始类型的bug
console.log(typeof new Number("0")); //  * "object"  不是number!

let zero = new Number(0);

// ~ zero 为对象 所以一直为true

if (zero) {
  console.log("zero is truthy"); // 会打印
}

// ! 3 对象包装器不带new 使用 --> 转换类型
let num = Number("1");
console.log(typeof num); // number

// ! 4 null/undefined 没有任何方法
// 特殊的原始类型 null 和 undefined 是例外。它们没有对应的“对象包装器”，也没有提供任何方法。从某种意义上说，它们是“最原始的”。

// ~ test
let strr = "hemm";
str.test = 5;
console.log(str.test); // ~ undefined

/*
! 根据你是否开启了严格模式 use strict，会得到如下结果：

    1 undefined（非严格模式）
    2 报错（严格模式）。

为什么？让我们看看在 (*) 那一行到底发生了什么：

    1 当访问 str 的属性时，一个“对象包装器”被创建了。
    ~ 2 在严格模式下，向其写入内容会报错。
    ~ 3 否则，将继续执行带有属性的操作，该对象将获得 test 属性，但是此后，“对象包装器”将消失，因此在最后一行，str 并没有该属性的踪迹。

! 这个例子清楚地表明，原始类型不是对象。

! 它们不能存储额外的数据。
*/
