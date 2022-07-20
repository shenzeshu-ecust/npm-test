const {createProxyMiddleware} = require('http-proxy-middleware')
module.exports = function (app) {
    app.use(
        createProxyMiddleware('/api1', { // 遇见/api1前缀的请求，就会触发代理配置
            target: 'http://localhost:5001', // 请求转发给谁
            changeOrigin: true, // 控制服务器收到的请求头中Host字段的值（去服务器中查看host）--欺骗服务器请求来源于proxy的5001端口。不加则默认false，服务器知道你来自3000端口
            pathRewrite: { '^/api1': '' } // 重写请求路径（删去/api1）-- 必须要。否则请求无法成功
        }),
        createProxyMiddleware('/api2', {
            target: 'http://localhost:5002',
            changeOrigin: true,
            pathRewrite: { '^/api2': '' }
        })
    )
}