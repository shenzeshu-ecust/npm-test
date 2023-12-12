import chalk from 'chalk';
import ProgressBar from 'progress'

console.log('我的%s已经%d岁', '猫', 2);
/**
 *      %s 会格式化变量为字符串
        %d 会格式化变量为数字
        %i 会格式化变量为其整数部分
        %o 会格式化变量为对象
 */
console.log('%o', Number)
// 若不加 %o 输出[Function: Number]
// ! 清空控制台
// console.clear()
// ! console.count() 计数
// count 方法会对打印的字符串的次数进行计数，并在其旁边打印计数：
const x = 1
const y = 2
const z = 3
console.count(
  'x 的值为 ' + x + ' 且已经检查了几次？'
)
console.count(
  'x 的值为 ' + x + ' 且已经检查了几次？'
)
console.count(
  'y 的值为 ' + y + ' 且已经检查了几次？'
)
const oranges = ['橙子', '橙子']
const apples = ['苹果']
oranges.forEach(fruit => {
  console.count(fruit)
})
apples.forEach(fruit => {
  console.count(fruit)
})
// ! 打印堆栈踪迹
const function2 = () => console.trace()
const function1 = () => function2()
function1()
// ! 计算耗时
// 可以使用 time() 和 timeEnd() 轻松地计算函数运行所需的时间：
const doSomething = () => console.log('测试')
const measureDoingSomething = () => {
  console.time('doSomething()')
  //做点事，并测量所需的时间。
  doSomething()
  console.timeEnd('doSomething()')
}
measureDoingSomething()
// ! 为输出着色
// 可以使用 转义序列 在控制台中为文本的输出着色。 转义序列是一组标识颜色的字符。
console.log('\x1b[33m%s\x1b[0m', '你好') // 这是执行此操作的底层方法
// ~ 为控制台输出着色的最简单方法是使用库。 Chalk 是一个这样的库，除了为其着色外，它还有助于其他样式的设置（例如使文本变为粗体、斜体或带下划线）。
// const chalk = require('chalk')
// 找到 package.json 文件，在里面的配置中加一行 "type": "module"
console.log(chalk.yellow('你好'))
console.log(chalk.blue('Hello') + ' World' + chalk.red('!'));
console.log(chalk.blue.bgRed.bold('Hello world!'));
console.log(chalk.blue('Hello', 'World!', 'Foo', 'bar', 'biz', 'baz'));
console.log(chalk.red('Hello', chalk.underline.bgBlue('world') + '!'));
console.log(chalk.hex('#DEADED').bold('Bold gray!'));
console.log(chalk.rgb(123, 45, 67).underline('Underlined reddish color'));

// ! 创建进度条
// Progress 是一个很棒的软件包，可在控制台中创建进度条。 使用 npm install progress 进行安装。

const bar = new ProgressBar(':bar', { total: 50 })
const timer = setInterval(() => {
  bar.tick()
  if (bar.complete) {
    clearInterval(timer)
  }
}, 100)