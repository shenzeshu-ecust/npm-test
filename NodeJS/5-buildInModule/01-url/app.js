//---- 因日 使用log4js 可以将结果都记录在自动生成的文件中---------------
const log4js = require('log4js')
log4js.configure({
    appenders: { cheese: { type: "file", filename: "cheese.log" } },
    categories: { default: { appenders: ["cheese"], level: "error" } }
});

const logger = log4js.getLogger("cheese");
// logger.trace("Entering cheese testing");
// logger.debug("Got cheese.");
// logger.info("Cheese is Comté.");
// logger.warn("Cheese is quite smelly.");
// logger.error("Cheese is too ripe!");
// logger.fatal("Cheese was breeding ground for listeria.");
logger.level = "debug";

//-------------------------------------------------------
const url = require('url')
const urlString = 'https://www.baidu.com:443/path/index.html?id=2#tag=3'
    // 1 解析url
let myUrl = new URL(urlString)

// console.log(myUrl);不适用console.log了。用log4js 记录结果
logger.debug(myUrl)

// console.log(url.parse(urlString,true)); // 不推荐了
// 2 对象转换成url
// format
let urlObj = {
    href: 'https://www.baidu.com/path/index.html?id=2#tag=3',
    origin: 'https://www.baidu.com',
    protocol: 'https:',
    username: '',
    password: '',
    host: 'www.baidu.com',
    hostname: 'www.baidu.com',
    port: '',
    pathname: '/path/index.html',
    search: '?id=2',
    hash: '#tag=3'
}
logger.debug(url.format(urlObj))
    // 3 resolve(from,to)
logger.debug(url.resolve('https://www.abc.com/a', '../')) //  https://www.abc.com/
logger.debug(url.resolve('https://www.abc.com/a', '/b')) // https://www.abc.com/b