var http = require('http'); // 获取模块
/*
    request 获取url传过来的信息
    response 给浏览器的响应信息
*/
http.createServer(function(request, response) {
    response.writeHead(200, { 'Content-Type': 'text/plain' }); // 设置响应头
    response.end('Hello World'); // 输出结果 并且结束响应
}).listen(8081); // 在8081端口

console.log('Server running at http://127.0.0.1:8081/');