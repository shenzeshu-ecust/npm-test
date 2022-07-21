// 判断服务器上有没有upload目录。
// 如果有--不操作
// 没有---创建
const fs = require('fs')
let path = './upload'
fs.stat(path, (err, data) => {
    if (err) {
        console.log(err);
        return
    }
    if (!data.isDirectory()) {
        // 如果不是目录，先删除这个文件
        fs.unlink(path, err => {
                console.log(err);
                return
            })
            // 然后创建目录
        mkdir(path)
    } else {
        console.log('目录已存在');
    }
})

function mkdir(path) {
    fs.mkdir(path, err => {
        if (err) {
            console.log(err);
            return
        }
        console.log('创建成功');
    })
}