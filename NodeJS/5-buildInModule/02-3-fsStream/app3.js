// 管道流
// 用于复制大文件
const fs = require('fs')
const readS = fs.createReadStream('./牛.jpg')
const writeS = fs.createWriteStream('./img/牛不.jpg')
readS.pipe(writeS)