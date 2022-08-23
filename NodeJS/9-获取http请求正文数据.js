/*
 * 在连接回调中传入的 request 对象是一个流。

 * 因此，必须监听要处理的主体内容，并且其是按数据块处理的。
 */
const server = http.createServer((req, res) => {
    let data = ''
    req.on('data', chunk => [
        data += chunk
    ])
    req.on('end', () => {
        JSON.parse(data)
    })
})