process.argv.forEach((v, i) => {
    console.log(`${i}:${v}`);
});
/**
 * 获取参数值的方法是使用 Node.js 中内置的 process 对象。
    它公开了 argv 属性，该属性是一个包含所有命令行调用参数的数组。
    第一个参数是 node 命令的完整路径。
    第二个参数是正被执行的文件的完整路径。
    所有其他的参数从第三个位置开始。

    0:/Users/szz/.nvm/versions/node/v18.5.0/bin/node
    1:/Users/szz/Desktop/LearnReactAndVite/NodeJS/app.js
    2:name=joe
 */
const args = process.argv // ! 是一个数组
console.log('args:', args);
console.log('myArgs:', args.slice(2)[0]);
// ~ 使用 minimist 库，该库有助于处理参数：
const args1 = require('minimist')(process.argv.slice(2))
// 但是需要在每个参数名称之前使用双破折号：

// ? BASH
// ? node app.js --name=joe
console.log(args1['name']) //joe

