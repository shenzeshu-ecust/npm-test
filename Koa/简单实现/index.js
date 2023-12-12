const Koa = require('./application')
const app = new Koa()

app.use((ctx, next) => {
    ctx.message = 'ok'
    console.log(1)
    next()
    console.log(2)
})

app.use((ctx, next) => {
    console.log(3)
    next()
    console.log(4)
})

app.use((ctx, next) => {
    console.log(ctx.message)
    console.log(ctx.query)
    ctx.body = 'hello my koa'
})

app.listen(3000, () => {
    console.log('server listening on port 3000')
})