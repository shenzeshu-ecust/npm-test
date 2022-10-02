// 1 字符串转换 显式
let v = 12
String(v) // 转化为字符串

// 2 数字类型转换
// ~ 算术函数 和 表达式 中，自动进行number类型转换
console.log('6' / '2') // string类型 自动转换成 number类型
// ~ 显示转换 Number(v)
/*
    值 	            变成……
    undefined 	    NaN
    null 	        0
    true 和 false 	1 and 0
    string 	        去掉首尾空白字符（空格、换行符 \n、制表符 \t 等）后的纯数字字符串中含有的数字。
                    如果剩余字符串为空，则转换结果为 0。否则，将会从剩余字符串中“读取”数字。
                    当类型转换出现 error 时返回 NaN。
 */
console.log(Number(undefined)) // NaN
console.log(Number(null)) // 0
console.log(Number(true)) // 1
console.log(Number(" 123    ")) // 123
console.log(Number('123zac')) // NaN  转换到z的时候 无法转换 -- NaN
// ! 请注意 null 和 undefined 在这有点不同：null 变成数字 0，undefined 变成 NaN。

// 3 布尔类型转换
Boolean(1)
/*
    值 	                                变成……
    0, null, undefined, NaN, "" 	   false
    其他值 	                            true
*/
// ! 对 "0" 和只有空格的字符串（比如：" "）进行布尔型转换时，输出结果为 true。
console.log(Boolean(' ')) // true
console.log(Boolean('0')) // true
let a = ' '
if(a) {
    console.log('a为true')
}







