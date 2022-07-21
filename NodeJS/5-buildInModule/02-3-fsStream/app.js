const fs = require('fs')
const readSream = fs.createReadStream('./test.txt')
let count = 0
let str = ''
readSream.on('data', (data) => {
    count = count + 1
    str += data
})
readSream.on('end', () => {
    console.log(str);
    console.log(count);
})
readSream.on('error', (err) => {
    console.log(err);
})