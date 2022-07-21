let users  = {name:'app',age:23}
let copy = {...users} // 扩展运算符本是用于数组。但也可以 用于复制对象（前提有 花括号{} ）
// 复制时 修改  相当于Object.assign()
let copynew = {...users,age:8}
console.log(copy);
console.log(copynew);
/**
 * { name: 'app', age: 23 }
{ name: 'app', age: 8 }  修改了
 */