// 此文件用于配置跨域代理。文件名不能改。
// 按照commonJS规范写代码
// ! 这种方式可以灵活配置是否走代理
const proxy = require('http-proxy-middleware')
module.exports = function(app) {
        app.use(
            proxy('/api1', { // 遇见/api1前缀的请求，就会触发该代理配置
                target: 'http://localhost:5000', // 请求转发给谁
                changeOrigin: true, // 控制服务器收到的请求头中Host字段的值
                pathRewrite: { '^/api1': '' } ///重写请求路径（将请求路劲中的/api1换成空字符串）
            }),
            proxy('/api2', {
                target: 'http://localhost:5001',
                changeOrigin: true,
                pathRewrite: { '^/api2': '' }
            })
        )
    }
    // ! 如果是简单的只有一个请求目标，在package.json中加proxy字段就行。
    // ? “proxy":"http://localhost:5000"