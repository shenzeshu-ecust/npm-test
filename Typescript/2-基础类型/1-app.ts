// 1 any 声明为 any 的变量可以赋予任意类型的值
/**
 * 任意值是 TypeScript 针对编程时类型不明确的变量使用的一种数据类型，它常用于以下三种情况。

 *
 */
// 1） 变量的值会动态改变时，比如来自用户的输入，任意值类型可以让这些变量跳过编译阶段的类型检查，示例代码如下：
let x:any = 1;
x = 'i a m'
x = false
// 2） 改写现有代码时，任意值允许在编译时可选择地包含或移除类型检查，示例代码如下
let y:any = 4
y.ifItExists() // 正确
y.toFixed(); // 正确
// 2 定义存储各种类型数据的数组时，示例代码如下：
let arrList:any[] = [1,false,'fine']
arrList[1] = 100
// 法1：数组类型
let arr:number[] = [1,2]
// 法2：或者使用泛型
let Arr:Array<number> = [2,3]
// 3 元祖 元组类型用来表示已知元素数量和类型的数组，各元素的类型不必相同，对应位置的类型需要相同。
let z:[string,number]
z = ['Run',1]
console.log(z[1]); // 1
// 4 枚举
enum Color {
    Red,
    Green,
    Blue
}
let color:Color = Color.Blue
console.log(color); // 2
const getValue = ()=> {
    return 0 
}
enum List {
    A = getValue(),
    B = 2, // 次数必须初始化，不然编译不通过
    C  
}
// A 的值是被计算出来的。注意注释部分，如果某个属性的值是计算出来的，那么它后面一位的成员必须要初始化值。
console.log(List.A); // 0
console.log(List.B); // 2
console.log(List.C); // 3
// 5 never
/**
 * never 是其它类型（包括 null 和 undefined）的子类型，代表从不会出现的值。这意味着声明为 never 类型的变量只能被 never 类型所赋值，
 * 在函数中它通常表现为抛出异常或无法执行到终止点（例如无限循环），示例代码如下：
 * 
        let x: never;
        let y: number;

        // 运行错误，数字类型不能转为 never 类型
        x = 123;

        // 运行正确，never 类型可以赋值给 never类型
        x = (()=>{ throw new Error('exception')})();

        // 运行正确，never 类型可以赋值给 数字类型
        y = (()=>{ throw new Error('exception')})();

        // 返回值为 never 的函数可以是抛出异常的情况
        function error(message: string): never {
            throw new Error(message);
        }

        // 返回值为 never 的函数可以是无法被执行到的终止点的情况
        function loop(): never {
            while (true) {}
        }
 */
// 6 void 用于标识方法返回值的类型,表示该方法无返回值
 function add():void  {
    x+=1
}





