console.log(a) // undefined var声明的变量会变量提升
console.log(f) // 函数也是提升
console.log(c) // ~报错： 全局隐式变量不会，

var a = 1 // 全局变量
function f() {
  var b = 2
  c = 3 // ~ 隐式全局变量
}
f()
// 可以直接打印 a, c，但是没有 b
console.log(a, c)
// 全局变量删不掉
delete a
console.log('删不掉全局变量',a)
// 隐式全局变量可以删除
delete c
console.log(c) // 报错 c is not defined


// 所以 
var a = b = 'test'
// 可以拆解为
var a
b = 'test'
a = b