import { execFile, execFileSync} from 'child_process'
import { log } from 'console'

// execFile('1.js', [], (err, stdout, stderr) => {
//     if(err) {
//         log(err)    
//         return
//     }
//     log(stdout)
// })

execFile('node', ['-v'], (err, stdout, stderr) => {
    log(stdout)
})
