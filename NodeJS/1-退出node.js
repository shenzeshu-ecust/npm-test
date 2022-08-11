console.log("Hi Nodejs!");
// 如果使用PHP编写后端代码时，需要Apache或者Nginx的HTTP服务器来处理客户端的请求。
// 但是 ： 对Node.js来说，概念完全不一样了。使用Node.js时，我们不仅仅在实现一个应用，同时还实现了整个HTTP服务器
let str = 'abcdefg'
console.log(str.slice(2));
console.log(str[1]);
// ! 退出node.js 
// ~ 1 process.exit(1) 您可以传入一个整数，向操作系统发出退出代码的信号.默认的退出码为 0，表示成功
// 也可以设置 process.exitCode 属性
process.exitCode = 1
process.exit()
// ~ 2 process.kill(process.pid, 'SIGTERM')