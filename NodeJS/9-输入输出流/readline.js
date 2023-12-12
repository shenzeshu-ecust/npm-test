import readline from 'readline'
import chalk  from 'chalk'
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

function ask(question) {
    rl.question(question, answer => {
        // ~ 你想成功退出使用 0，如果你想失败退出使用 1。
        if(answer === 'szs') {
            const txt = chalk.red.bgCyan('正确答案！')
            rl.write(txt + '\n')
            process.exit(0)
        }
        rl.write(`The answer received: ${answer}\n`)

        ask(question)
    })
}


ask("What is your name?\n")