require('@ctrip/node-vampire-vi-ignite');
const path = require('path');
const http = require('http');
const url = require('url');
const packageConfig = require(path.resolve(__dirname, './package.json'));
const appConfig = require('@ctrip/node-vampire').appConfig;
const port = packageConfig.config.port;
let server = http.createServer(handler);
server.listen(port);

function handler(req, res) {
    var urlObj = url.parse(req.url, true);
    // 需要全局初始化或只能支持化一次的组件可在点火前(应用生命周期的初始阶段)完成,请参考：http://pages.release.ctripcorp.com/fx-front-end/node-vampire-books/commonModules/viIgnite.html
    // 该脚手架已默认开启vi点火，且已默认支持健康检查接口
        if (urlObj.pathname === '/') {
            showHTML(res, [
                '<!DOCTYPE html>',
                '<html xmlns="http://www.w3.org/1999/xhtml">',
                '<head>',
                '<meta http-equiv="content-type" content="text/html; charset=UTF-8" />',
                '<title>Hello NodeJS</title>',
                '<style>',
                'body { font-family: "Consolas", "Microsoft Yahei"; font-size: 14px; }',
                '</style>',
                '</head>',
                '<body>',
                '<h2>Hello NodeJS!</h2>',
                '<ul>',
                '	<li>AppID :' + appConfig.AppID + '</li>',
                '	<li>Env :' + appConfig['env'] + '</li>',
                '	<li>HealthCheck: <a href="/slbhealthcheck.html">/slbhealthcheck.html</a></li>',
                '	<li>HealthCheck1: <a href="/vi/health">/vi/health</a></li>',
                '</ul>',
                '</body>',
                '</html>'
            ].join('\r\n'));
        } else {
            show404(res);
        }
}

function showHTML(res, content) {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.end(content);
}

function show404(res) {
    res.writeHead(404, {
        'Content-Type': 'text/html'
    });
    res.end('File Not Found');
}
