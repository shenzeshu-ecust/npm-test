// child_process模块中所有函数都是基于spawn和spawnSync函数的来实现的，换句话来说，spawn和spawnSync函数的配置是最完全的，其它函数都是对其做了封装和修改。

/**
 * 它使用指定的命令行参数创建新进程，spawn 会返回一个带有stdout和stderr流的对象。
 * 你可以通过stdout流来读取子进程返回给Node.js的数据。
 * stdout拥有'data','end'以及一般流所具有的事件。
 * 当你想要子进程返回大量数据给Node时，比如说图像处理，读取二进制数据等等，你最好使用spawn方法

 */

 import { spawn } from 'child_process'
 import fs from 'fs'

 const spawnObj = spawn('ping', ['127.0.0.1'], {
    encoding: 'utf8',
 })

 spawnObj.stdout.on('data', (chunk) => {
    console.log(chunk.toString())
 })

 spawnObj.stderr.on('data', (data) => {
    console.log(data)
 });
 spawnObj.on('close', function(code) {
    console.log('close code : ' + code);
})
spawnObj.on('exit', (code) => {
    console.log('exit code : ' + code);
    fs.close(fd, function(err) {
        if(err) {
            console.error(err);
        }
    });
});

