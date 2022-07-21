// 创建目录的一个包 mkdirp
// npm i mkdirp -S
// 可以创建深层目录
const mkdirp = require('mkdirp')
mkdirp('./newdir', err => {
    if (err) {
        console.log(err);
    }
})
mkdirp('./another/a/b', err => {
    if (err) {
        console.log(err);
    }
})