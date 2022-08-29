/**
 * function loggingIdentity<T>(arg: T): T {
    console.log(arg.length);  // Error: T doesn't have .length
    return arg;
}
 */
// ?  如何获取如果入参是数组的数组长度？
function loggingIdentity1<T>(arg: T[]): T[] {
    console.log(arg.length);
    return arg
}
// 或者
function loggingIdentity2<T>(arg: Array<T>): Array<T> {
    console.log(arg.length);  // Array has a .length, so no more error
    return arg;
}
