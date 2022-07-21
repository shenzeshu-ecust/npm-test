// 可以省略.js
let { name, age } = require('./app') // 就算在同一个文件夹下，也要写 ./ 不然会去全局寻找
name.getSurName()
console.log('年龄： ' + age.age);