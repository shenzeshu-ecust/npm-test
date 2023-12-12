import { exec } from 'child_process'
import path from 'path'
// exec函数第一个参数是要执行的命令，的第二个函数是配置选项，
// 第三个参数是回调函数，第二个参数中一个比较常用的就是子进程的工作目录
exec('ls -l', (err, stdout, stderr) => {
    if(err) {
        console.log(err)
        return
    }
    console.log(`stdout: ${stdout}`)
    console.log(`stderr: ${stderr}`)

})

 // 在当前目录下的scripts文件夹里执行hexo g命令
 exec('hexo g', { cwd: path.join(process.cwd(), 'scripts')}, (err, stdout, stderr) => {
    console.log(process.cwd())
    if(err) {
        console.log(err)
        return
    }
    console.log(`stdout: ${stdout}`)
 })