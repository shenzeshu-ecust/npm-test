// 对泛型T进行约束
// ! 使用extends实现
/**
 * function loggingIdentity<T>(arg: T): T {
    console.log(arg.length);  // Error: T doesn't have .length
    return arg;
}

 */
interface Lengthwise {
    length: number
}
function loggingIdentity3<T extends Lengthwise>(arg: T): T {
    console.log(arg.length); // ! // Now we know it has a .length property, so no more error
    return arg
}
// 现在这个泛型函数被定义了约束，因此它不再是适用于任意类型：
loggingIdentity3(3) // Error, number doesn't have a .length property

loggingIdentity3({length: 10, value: 3}); // ✅
