const fs = require('fs')
const writeStream = fs.createWriteStream('./output.txt')
let str = ''
for (let i = 0; i < 100; i++) {
    str += '你是个好人\n'
}
writeStream.write(str)
writeStream.end() //必须有这个end（）才可以监听到finish事件
writeStream.on('finish', () => {
    console.log('写入完成');
})