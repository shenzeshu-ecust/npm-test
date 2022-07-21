const fs = require('fs')
exports.getMime = function(extname) {
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
exports.getFileMime = function(extname) {
        return new Promise((resolve, reject) => {
            // 读取content-type文件
            fs.readFile('./data/mime.json', (err, data) => { //因为在app.js调用 所以路劲相对于app.js
                if (err) {
                    console.log(err);
                    reject(err)
                    return
                }
                let mime = JSON.parse(data.toString())
                resolve(mime[extname]) //根据json文件获取对应的content-type
            })

        })
    }
    // 同步fs
exports.getFileMime2 = function(extname) {
    let data = fs.readFileSync('./data/mime.json')

    let mime = JSON.parse(data.toString())
    return mime[extname] //根据json文件获取对应的content-type
}