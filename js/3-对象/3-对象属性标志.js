/*
  ! 对象属性（properties），除 value 外，还有三个特殊的特性（attributes），也就是所谓的“标志”：

  ~ writable — 如果为 true，则值可以被修改，否则它是只可读的。
  ~ enumerable — 如果为 true，则会被在循环中列出，否则不会被列出。
  ~ configurable — 如果为 true，则此属性可以被删除，这些特性也可以被修改. false的话，既不可以删除属性，又不可以重新配置对象属性。
*/

// 1 Object.getOwnPropertyDescriptor(obj, property)

// 当我们用“常用的方式”创建一个属性时，它们都为 true

let user = {
  name: "John"
};

let descriptor = Object.getOwnPropertyDescriptor(user, 'name');

console.log( JSON.stringify(descriptor, null, 2 ) );
/* 属性描述符：
{
  "value": "John",
  "writable": true,
  "enumerable": true,
  "configurable": true
}
*/

// 当使用Object.defineProperty()时，创建的对象默认标志都为false
let person = {}
Object.defineProperty(person, 'name', {
  value: 'szs'
})
console.log(Object.getOwnPropertyDescriptor(person, 'name'));
/*
  {
    value: 'szs',
    writable: false,
    enumerable: false,
    configurable: false
  }
*/

// 2 writable 只读属性，不许修改
let person1 = {}
Object.defineProperty(person1, 'name', {
  value: 'z',
  writable: false,
  configurable: true,
  enumerable: true
})
person1.name = 'dlf'
console.log('writable:', person1.name); // 'z' 没有修改成功！  严格模式下会报错！
// 重新定义可以(前提是configurable为true)
Object.defineProperty(person1, 'name', { value: 'dlf' })
console.log('writable:', person1.name); // 可以重新定义属性name！

// 3 enumerable 不可枚举
// 通常 对象内键的 toString是不可枚举的  用for in 显示不出
// 显示添加一个可以被枚举出来的toString()
let obj = {
  name: "John",
  toString() {
    return this.name;
  }
};

// 默认情况下，我们的两个属性都会被列出：
for (let key in obj) console.log(key); // name, toString

// 现在 想让toString无法被枚举
Object.defineProperty(obj, 'toString', {
  enumerable:false
})
// in  Object.keys()都无法枚举出toString
for (let key in obj) console.log(key); // name
console.log(Object.keys(obj)) // ['name']

// 4 configurable 配置属性
// 不可配置的属性不能被删除，它的特性（attribute）不能被修改

// Math.PI 是只读的、不可枚举和不可配置的：
console.log(Object.getOwnPropertyDescriptor(Math, 'PI'))
/*
  {
    value: 3.141592653589793,
    writable: false,
    enumerable: false,
    configurable: false
  }
*/
// 我们无法将Math.PI重新覆盖（因为writable也是false） 或者删除
// 也无法重新配置writable属性为true

// Error，因为 configurable: false
// Object.defineProperty(Math, "PI", { writable: true });

// ! configurable: false 防止更改和删除属性标志，但是允许更改对象的值。
let user1 = {
  name: "John" // * 字面量创建的对象默认的三个标志都为true  这里name可改写！
};

Object.defineProperty(user1, "name", {
  configurable: false
});

user1.name = "Pete"; // 正常工作
console.log(user1.name) // 'Pete
delete user1.name; // Error

// ! configurable: false + writable: false 一起可以创建一个像常量一样无法被更改的属性，就像内建的 Math.PI

// 5 Object.defineProperties()
// 允许一次定义多个属性
let user2 ={
  name: '',
  surname: ''
}
Object.defineProperties(user2, {
  name: { value: "John", writable: true },
  surname: { value: "Smith", writable: false },
  // ...
})
console.log('***', JSON.stringify(user2, null, 2))

/*
  ~ 当Object.defineProperties()方法同时定义或修改多个属性的时候，如果发生错误，那么发生错误之前定义或修改的属性还是会生效，而发出错误所在行及之后的属性不会生效。
  ~ 并且，Object.defineProperty/ies都针对对象中已经存在的属性！
  
  比如：
    let obj = {}
    Object.defineProperty(obj, 'name', {
        value: 1,
        writable: true
    })
  *  console.log(obj) // obj为 {}
  */

// 6 Object.getOwnPropertyDescriptors
// 要一次获取所有属性描述符
// 它与 Object.defineProperties 一起可以用作克隆对象的“标志感知”方式
let clone = Object.defineProperties({}, Object.getOwnPropertyDescriptors(obj));
console.log(clone);

/*
  浅拷贝并不能复制标志。所以如果我们想要一个“更好”的克隆，那么 Object.defineProperties 是首选。

  另一个区别是 for..in 会忽略 symbol 类型的和不可枚举的属性，但是 Object.getOwnPropertyDescriptors 返回包含 symbol 类型的和不可枚举的属性在内的 所有 属性描述符。
*/

// 7 属性描述符在单个属性的级别上工作。还有一些限制访问 整个 对象的方法：

Object.preventExtensions(obj) // 禁止向对象添加新属性。
Object.seal(obj) // 禁止添加/删除属性。为所有现有的属性设置 configurable: false。
Object.freeze(obj) //禁止添加/删除/更改属性。为所有现有的属性设置 configurable: false, writable: false。

// 还有针对它们的测试：

Object.isExtensible(obj) // 如果添加属性被禁止，则返回 false，否则返回 true。
Object.isSealed(obj) // 如果添加/删除属性被禁止，并且所有现有的属性都具有 configurable: false则返回 true。
Object.isFrozen(obj) // 如果添加/删除/更改属性被禁止，并且所有当前属性都是 configurable: false, writable: false，则返回 true。