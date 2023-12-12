
/**
 * 
 * @param {number} a 
 * @param {number} b 
 * @returns 
 */
function add2(a, b) {
    return a + b;
}
let res2 = add2(1, 'a')

/**
 * @type {Promise<string>}
 */
 let obj;

 
 /**
  * @type {(s: string, b: boolean) => string}
  */
 let func;

 
 // ~ 如果类型被多处用到，可以用 @typedef 抽出来，单独命名：
 /**
  * @typedef {(s: string, b: boolean) => string} MyFunc
  */
 /**
  * @type {MyFunc}
  */
 let fff;
/**
 * @type {import("./eg").MyF}
 */
 let func2;

/**
 * 
 * @param {string} p1 
 * @param {string=} p2 可选参数第一种写法
 * @param {string} [p3] 可选参数第二种写法
 * @param {string} [p4="test"] 加上默认值
 * @returns {string}
 */
 function eg(p1, p2,p3, p4) {
    return ''
 }
 eg()

/**
 * @template T
 * @param {T} x 
 * @returns {Promise<T>}
 */
 function g(x) {
    return Promise.resolve(x)
 }
 let a = g(2)

 /**
  * @template P
  * @typedef {P extends Promise<infer T> ? T : never} TiCao
  */
/**
 * @type {TiCao<Promise<string>>}
 */
 let guang = 1;