import fs from 'fs'

fs.open('./logs.txt', 'w', (err, fd) => {
    console.log(fd)
    if(err) throw Error(err.message)
    process.stdin.on('data', data => {
        fs.writeFile(fd, data.toString() + '\n', err => {
            if(err) throw Error(err.message)
        })
    })
})