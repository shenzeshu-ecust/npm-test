var http = require('http');
const url = require('url')
const path = require('path')
const routes = require('./module/routes')
http.createServer(function(req, res) {
    let flag = false
        // 创建静态服务
    flag = routes.static(req, res, 'static')
        // 路由
    let { url } = req;
    const { host } = req.headers;
    // console.log(req);
    const myURL = new URL(url, `http://${host}`);
    if (!flag) {
        if (myURL.pathname == '/login') {
            res.writeHead(200, { "Content-Type": "text/html;charset=utf-8" });
            res.end('执行登录！');
        }
    }
    // let pathname = url.parse(req.url).pathname
    // let extname = path.extname(pathname);
    // if (!extname) { //路径 如果不存在后缀名如 .css__就是路由
    //     if (pathname === '/login') {
    //         res.writeHead(200, { 'Content-Type': 'text/html;charset="utf-8"' })
    //         res.end('执行登陆')
    //     } else if (pathname === '/register') {
    //         res.writeHead(200, { 'Content-Type': 'text/html;charset="utf-8"' })
    //         res.end('注册页面')
    //     } else {
    //         res.writeHead(404, { 'Content-Type': 'text/html;charset="utf-8"' })
    //         res.end('页面不存在')
    //     }
    // }

}).listen(3000);

console.log('Server running at http://127.0.0.1:3000/');