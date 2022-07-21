const http = require('http')
const url = require('url')
http.createServer((req, res) => {
    // 获取url的信息
    console.log(req.url);
    res.writeHead(200, { "Content-Type": "text/html;charset=UTF-8" })
    res.write("This is node.js 我自己写的")
    res.write("<h2>你试试点我</h2>")

    res.end()

}).listen(8000)