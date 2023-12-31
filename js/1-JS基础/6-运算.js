// 1 运算元 —— 运算符应用的对象。比如说乘法运算 5 * 2，有两个运算元：左运算元 5 和右运算元 2。
// 有时候人们也称其为“参数”而不是“运算元”。

// 如果一个运算符对应的只有一个运算元，那么它是 一元运算符。比如说一元负号运算符（unary negation）-，它的作用是对数字进行正负转换
// 两个运算元 - 二元运算符： -  + * / 等

// 幂 **
console.log(4 ** (1/2)) // 2 

// 2 神奇的 + 运算符
// ~ 对于+号，只要任意一个 运算元 是字符串， 那么另一个运算元也将被转化为字符串
console.log('1' + 2) // 12
// 更复杂的例子
console.log('1' + 2 + 2) // 122
// 第一个操作数是一个字符串，所以编译器将其他两个操作数也视为了字符串。2 被与 '1' 连接到了一起，也就是像 '1' + 2 = "12" 然后 "12" + 2 = "122" 这样。

console.log(2 + 2 + '1') // 41
// ~ 在这里，运算符是按顺序工作。第一个 + 将两个数字相加，所以返回 4，然后下一个 + 将字符串 1 加入其中，所以就是 4 + '1' = '41'。

// 二元 + 是唯一一个以这种方式支持字符串的运算符。
// ! 其他算术运算符只对数字起作用，并且总是将其运算元转换为数字。

console.log( 6 - '2' ); // 4，将 '2' 转换为数字
console.log( '6' / '2' ); // 3，将两个运算元都转换为数字

console.log('"" - 1 + 0的结果为',"" - 1 + 0) // -1 因为不是+号， -号把左右都转化为数字！
/*
    "" + 1 + 0 = "10" // (1)
    "" - 1 + 0 = -1 // (2)
    true + false = 1
    6 / "3" = 2
    "2" * "3" = 6
    4 + 5 + "px" = "9px"
    "$" + 4 + 5 = "$45"
    "4" - 2 = 2
    "4px" - 2 = NaN
    "  -9  " + 5 = "  -9  5" // (3)
    "  -9  " - 5 = -14 // (4) -号把左右都转化为数字类型
    null + 1 = 1 // (5) 
    undefined + 1 = NaN // (6) Number(undefined) = NaN
    " \t \n" - 2 = -2 // (7) 相当于Number('\t \n') = 0
 */
// 3 + 还是一元运算符哦
// 一元运算符加号，或者说，加号 + 应用于单个值，对数字没有任何作用。
// ! 但是如果运算元不是数字，加号 + 则会将其转化为数字。
let y = -2
console.log(+y) // -2
// 作用和Number()一样
console.log(+false) // 0
console.log(+"") // 0
console.log(+" ") // 0 

console.log(+'2' + +'3') //5
// ~ 为什么会这样？ -- 一元运算符优先级更高！

// 4 =号 （赋值）
// 在 JavaScript 中，所有运算符都会返回一个值。这对于 + 和 - 来说是显而易见的，但对于 = 来说也是如此。
// 语句 x = value 将值 value 写入 x 然后返回 value。
let a = 1;
let b = 2;
let c = 3 - (a = b + 1);
console.log( a ); // 3
console.log( c ); // 0

// 5 原地修改
let n = 2
n *= 5
console.log('n:',n) // 10
// ~ *= 这类运算符的优先级与 普通赋值运算符= 的优先级相同，所以它们在大多数其他运算之后执行：
let m = 2
m *= 3 + 5
console.log(m) // 16

// 6 ++ 和 -- 自增、自减运算符
// ! 自增/自减只能应用于变量。试一下，将其应用于数值（比如 5++）则会报错。
/*
    运算符 ++ 和 -- 可以置于变量前，也可以置于变量后。

        当运算符置于变量后，被称为“后置形式”：counter++。
        当运算符置于变量前，被称为“前置形式”：++counter。
*/
// ~ 前置 后置区别
// 如果自增/自减的值不会被使用，那么两者形式没有区别：

let count = 0;
count++;
++count;
console.log( count ); // 2，以上两行作用相同

// 如果我们想要对变量进行自增操作，并且 需要立刻使用自增后的值(新值)，那么我们需要使用前置形式：

let count1 = 0;
let res1 = ++count1
console.log( res1 ); // 1

// 如果我们想要将一个数加一，但是我们想使用其自增之前的值(旧值)，那么我们需要使用后置形式：

let count2 = 0;
let res2 = count2++
console.log( res2 ); // 0

// 自增/自减和其它运算符的对比

// ~ ++/-- 运算符同样可以在表达式内部使用。它们的优先级比绝大部分的算数运算符要高。

let counter1 = 1;
console.log( 2 * ++counter1 ); // 4
console.log(counter1) // 2

// 与下方例子对比：

let counter2 = 1;
console.log( 2 * counter2++ ); // 2，因为 counter++ 返回的是“旧值”
console.log(counter2) // 2

// 7 逗号运算符
// 逗号运算符 , 是最少见最不常使用的运算符之一。有时候它会被用来写更简短的代码，因此为了能够理解代码，我们需要了解它。
// ~ 逗号运算符能让我们处理多个语句，使用 , 将它们分开。每个语句都运行了，但是只有最后的语句的结果会被返回。
let d = (1 + 2, 3 + 4)
console.log(d) // 7 (3+4)的结果
// 这里，第一个语句 1 + 2 运行了，但是它的结果被丢弃了。随后计算 3 + 4，并且该计算结果被返回。


// ! 逗号运算符的优先级非常低（优先级 1 ）

// 请注意逗号运算符的优先级非常低，比 = （优先级 2 ）还要低，因此上面你的例子中圆括号非常重要。

// ~ 如果没有圆括号：a = 1 + 2, 3 + 4 会先执行 +，将数值相加得到 a = 3, 7，然后赋值运算符 = 执行 a = 3，然后逗号之后的数值 7 不会再执行，它被忽略掉了。相当于 (a = 1 + 2), 3 + 4。

// 为什么我们需要这样一个运算符，它只返回最后一个值呢？
// 有时候，人们会使用它把几个行为放在一行上来进行复杂的运算。
// 举个例子：

// 一行上有三个运算符
for (a = 1, b = 3, c = a * b; a < 10; a++) {
    //  ...
}