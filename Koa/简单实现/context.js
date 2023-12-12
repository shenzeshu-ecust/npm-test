
const { delegate } = require('./utils')
// 然后要实现 app.use() 方法，我们看到 app.use() 中内部有 ctx.body

// 创建一个 context.js，内部导出 ctx 对象，分别通过 get 和 set，实现可以获取和设置 ctx.body 的值：
const context = ( module.exports = {
    get  body() {
        return this._body;
    },
    set body(value) {
        this._body = value;
    }
})

delegate(context, 'request').getter('query')
delegate(context, 'response').getter('message').setter('message')

