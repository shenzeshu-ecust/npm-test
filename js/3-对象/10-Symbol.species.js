// ~ 你可能希望在派生数组类 *MyArray *中返回 Array对象。这种 species 方式允许你覆盖默认的构造函数。

class MyArray extends Array {
    static get [Symbol.species]() {
        return Array
    }
}

let arr = new MyArray(1, 2,3 )
// 当使用像map()返回默认构造函数的方法时，你希望这些方法返回一个父Array对象，而不是MyArray对象。Symbol.species 符号可以让你这样做：
let m = arr.map(v => v * 2)
//  因为是实例
console.log(arr instanceof MyArray) // true

console.log(arr instanceof Array) // true

console.log(m instanceof MyArray) // false
console.log(m instanceof Array) // true
