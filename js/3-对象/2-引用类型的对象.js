// 1 对象与原始类型的根本区别之一是，对象是“通过引用”存储和复制的，
// 原始类型：字符串、数字、布尔值等 —— 总是“作为一个整体”复制

// 赋值了对象的变量存储的不是对象本身，而是该对象“在内存中的地址” —— 换句话说就是对该对象的“引用”。

let a = {}
b = a 
// 这里 a 和 b 两个变量都引用同一个对象，所以它们相等：
console.log(a === b) // true

let c = {}
// a 和 c是独立的对象， 所以不等
console.log(a === c); // false

// 2 Object.assign(dest, [src1, src2, src3...]) 实现浅拷贝
/*
  第一个参数 dest 是指目标对象。
  更后面的参数 src1, ..., srcN（可按需传递多个参数）是源对象。
  该方法将所有源对象的属性拷贝到目标对象 dest 中。换句话说，从第二个开始的所有参数的属性都被拷贝到第一个参数的对象中。
  调用结果返回 dest。
*/

let user = { name: "John" };

Object.assign(user, { name: "Pete" });
// 已存在的属性会被覆盖
console.log(user.name); // 现在 user = { name: "Pete" }

// 3 加入对象中含有值为引用类型的键
let obj = {
  name: 'szs',
  age: 16,
  location: {
    province: 'jiangsu',
    city: "nantong"
  }
}
// 使用Object.assign进行浅拷贝
let cloneObj = Object.assign({}, obj)
// 克隆对象和源对象的引用是同一个！
console.log(obj.location === cloneObj.location); // true !
cloneObj.location.province = 'zhejiang'
console.log(obj.location.province); // 'zhejiang' 源对象也被改变了！