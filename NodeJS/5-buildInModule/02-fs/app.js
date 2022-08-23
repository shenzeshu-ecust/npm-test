/**
 * 1 fs.stat 文件属性，eg：检测是 文件还是目录
 * 2 fs.mkdir 创建目录
 * 3 fs.writeFile 创建写入文件
 * 4 fs.appendFile 追加文件
 * 5 fs.readFile 读取文件
 * 6 fs.readdir 读取目录
 * 7 fs.rename 重命名
 * 8 fs.rmdir 删除目录
 * 9 fs.unlink 删除文件
 */
// --------  fs 里的方法 是 异步！！！-----------
const fs = require('fs')
// * 1 fs.stat(url,callback) 查看文件属性（是否是文件还是目录、文件大小..）
    fs.stat('./html', (err, data) => {
        if (err) {
            console.log(err);
            return
        } else {
            console.log(`是目录：${data.isDirectory()}`);
            console.log(`是文件：${data.isFile()}`);
            data.isSymbolicLink() //false
            data.size //1024000 //= 1MB

    }
})
// * 2 fs.mkdir 创建目录
/**
 * 有三个参数
 * url
 * 权限  可以省略 默认777
 * 回调函数callback
 */
// fs.mkdir('./css', (err) => {
//     if (err) {
//         console.log(err);
//         return
//     }
//     console.log('创建成功');
// })
// * 3 fs.writeFile 创建写入文件————如果不存在则创建，如果存在则 替换！！！
/**
 * 4个参数
 * url
 * 写入内容
 * [options]
 * callback
 */
// fs.writeFile('./html/index.html', 'you are not a good people!', (err) => {
//     if (err) {
//         console.log(err);
//         return
//     }
//     console.log('创建成功');
// })
// * 4 fs.appendFile 追加文件__不存在也会创建一个
// fs.appendFile('./css/index.css', 'h6 {color:red}\n', err => {
//     if (err) {
//         console.log(err);
//         return
//     }
//     console.log('追加成功');
// })
// * 5 fs.readFile 读取文件
// fs.readFile('./html/index.html', (err, data) => {
//     console.log(data); //是buffer数据
//     console.log(data.toString()); //转换成字符
// })
// * 6 fs.readdir 读取目录
// fs.readdir('./css', (err, data) => {
//     console.log(data); //[ 'index.css','all.css' ]

// })
// * 7 fs.rename(oldpath,newpath,callback) 重命名
/**
 * 功能：！移动文件、重命名
 */
// fs.rename('./css/index.css', './html/index.css', err => {
//     if (err) {
//         console.log(err);
//         return
//     }
//     console.log('移动成功');
// })
// fs.rename('./css/all.css', './html/allNewName.css', err => {
//     if (err) {
//         console.log(err);
//         return
//     }
//     console.log('移动和修改命名成功');
// })
// * 8 fs.rmdir 删除目录（目录下有文件删不成功）
// fs.rmdir('./aaa', err => {
//         if (err) {
//             console.log(err);
//             return
//         }
//         console.log('删除目录成功');
//     })
//  * 9 fs.unlink 删除文件
// fs.unlink('./aaa/index.html', err => {
//     if (err) {
//         console.log(err);
//         return
//     }
//     console.log('删除文件成功');
// })