const lodash = require('lodash');
// let arr = [1, 5, 1, 7, 8, 5, 6, 0]
// let res = lodash.chunk(arr, 2) // 分组——> 二维数组
// console.log(res);
function myChunk(arr) {
    let res = lodash.chunk(arr, 2)
    return res
}
module.exports = myChunk