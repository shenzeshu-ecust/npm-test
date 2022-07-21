//  wwwroot文件夹下面有几个文件夹和文件，
// 找出wwwroot目录下面所有的目录，放入数组中

// 由于fs中的方法都是异步的，想要循环打印目录
// 1 采用改造for循环，递归
const { rejects } = require('assert')
const fs = require('fs')
const { resolve } = require('path')

let path = '../wwwroot'
let dirArr = []
    // 一，读取所有目录、文件
    // fs.readdir(path, (err, data) => {
    //         if (err) {
    //             console.log(err);
    //             return
    //         }
    //         console.log(data);
    //         // 二、判断是否是目录
    //         (function getDir(i) {
    //             if (i == data.length) {
    //                 console.log(dirArr);
    //                 return
    //             }
    //             fs.stat(path + '/' + data[i], (error, status) => {
    //                 if (error) {
    //                     console.log(error);
    //                     return
    //                 }
    //                 if (status.isDirectory()) {
    //                     dirArr.push(data[i])
    //                 }
    //                 getDir(i + 1)
    //             })
    //         })(0)
    //     })
    // 2 采用async、await
    // 一、判断是否是目录：异步
async function isDir(path) {
    return new Promise((resolve, reject) => {
        fs.stat(path, (error, status) => {
            if (error) {
                console.log(error);

            }
            if (status.isDirectory()) {
                resolve(true)
            } else {
                resolve(false)
            }
        })
    })
}

function main() {
    fs.readdir(path, async(err, data) => { //异步方法外面的方法必须是异步
        if (err) {
            console.log(err);
            return;
        }
        for (var i = 0; i < data.length; i++) {
            if (await isDir(path + '/' + data[i])) {
                dirArr.push(data[i])
            }
        }
        console.log(dirArr);
    })
}
main()