const http = require('http');
const path = require('path')
const url = require('url')
const fs = require('fs');
const common = require('./module/common')
http.createServer(function(req, res) {
    // http://127.0.0.1:3000/index.html
    // http://127.0.0.1:3000/login.html
    // 1 获取地址
    // console.log(req.url);


    let pathname = url.parse(req.url).pathname //去掉get传值后的path
        // 默认主页是index.html
    console.log('获得的path', pathname);
    pathname = pathname == '/' ? '/index.html' : pathname
    let extname = path.extname(pathname) //获取后缀
    if (pathname !== '/favicon.ico') { //过滤掉icon的一次请求
        // 获取内容
        fs.readFile('./static' + pathname, async(err, data) => { //这里的读取文件路径要写对，不能只写一个固定的index.html

            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html;charset=UTF-8' });
                res.end('该页面不存在');
            }
            // let mime = common.getMime(extname) 自己写的判断类型
            // 由于fs是异步，所以这里也需要异步处理
            // 法1 采用async await
            // 法2 common.getFileMime采用fs中的同步方法(等到读取完成才执行下一步)
            // fs.readFileSync()
            let mine = await common.getFileMime(extname) //根据已有用来判断文件类型的json文件，判断文件类型选择content-type
            res.writeHead(200, { 'Content-Type': '' + mine + ';charset=UTF-8' });
            res.end(data);
        })
    }

}).listen(3000);

console.log('Server running at http://127.0.0.1:3000/');