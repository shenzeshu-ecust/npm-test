// 封装创建静态资源的方法
const fs = require('fs')
const path = require('path');
const url = require('url');

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
        try {
            let data = fs.readFileSync('./' + staticPath + pathname)

            if (data) {
                let mime = getFileMime(extname);
                res.writeHead(200, { 'Content-Type': '' + mime + ';charset="utf-8"' });
                res.end(data);
            }
        } catch (error) {

        }

    }
}