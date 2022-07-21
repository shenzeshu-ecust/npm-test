// 封装创建静态资源的方法
const fs = require('fs')
const path = require('path');
const url = require('url');
let getMime = function(extname) {
        switch (extname) {
            case '.html':
                return 'text/html'
            case '.css':
                return 'text/css'
            case '.js':
                return 'text/javascript'
            default:
                return 'text/html'

        }
    }
    // 同步fs
let getFileMime = function(extname) {
    let data = fs.readFileSync('./data/mime.json')
    let mime = JSON.parse(data.toString())
    return mime[extname] //根据json文件获取对应的content-type

}
exports.static = function(req, res, staticPath) {
    //1、获取地址
    let pathname = url.parse(req.url).pathname;
    pathname = pathname == '/' ? '/index.html' : pathname;
    let extname = path.extname(pathname);
    //2、通过fs模块读取文件
    if (pathname != '/favicon.ico') {
        fs.readFile('./' + staticPath + pathname, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html;charset="utf-8"' });
                res.end('404这个页面不存在');
            }
            let mime = getFileMime(extname);
            res.writeHead(200, { 'Content-Type': '' + mime + ';charset="utf-8"' });
            res.end(data);
        })
    }
}