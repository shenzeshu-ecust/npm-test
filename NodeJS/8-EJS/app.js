const http = require('http');
const url = require('url');
const path = require('path');
const ejs = require('ejs');
const routes = require('./module/routes');


http.createServer(function (req, res) {
    //创建静态web服务
    routes.static(req, res, 'static');
    //路由
    let pathname = url.parse(req.url).pathname;
    let extname = path.extname(pathname);
    if (!extname) {   //如果有后缀名的话让静态web服务去处理 
        if (pathname == '/login') {
            let msg = "数据库里面获取的数据";
            let list = [
                {
                    title: '新闻111'
                },
                {
                    title: '新闻222'
                },
                {
                    title: '新闻3333'
                },
                {
                    title: '新闻4444'
                }, {
                    title: '新闻5555'
                }
            ]
            ejs.renderFile('./views/login.ejs', {
                msg: msg,
                list: list
            }, (err, data) => {
                res.writeHead(200, { 'Content-Type': 'text/html;charset="utf-8"' });
                res.end(data);
            })

        } else if (pathname == '/register') {
            res.writeHead(200, { 'Content-Type': 'text/html;charset="utf-8"' });
            res.end("执行注册");
        } else if (pathname == '/admin') {
            res.writeHead(200, { 'Content-Type': 'text/html;charset="utf-8"' });
            res.end("处理后的业务逻辑");
        } else {
            res.writeHead(404, { 'Content-Type': 'text/html;charset="utf-8"' });
            res.end("404");
        }
    }

}).listen(3000);

console.log('Server running at http://127.0.0.1:3000/');