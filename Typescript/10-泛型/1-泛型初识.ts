/*
为什么需要泛型？ 
    function identity(arg: any): any {
        return arg;
    }

    使用any类型会导致这个函数可以接收任何类型的arg参数，这样就丢失了一些信息：传入的类型与返回的类型应该是相同的。
    如果我们传入一个数字，我们只知道任何类型的值都有可能被返回。 
 */
// ! 因此，我们需要一种方法使返回值的类型与传入参数的类型是相同的。 这里，我们使用了 类型变量，它是一种特殊的变量，只用于表示类型而不是值。
function identity<T>(arg: T): T {
    console.log(arg.length);  // Error: T doesn't have .length
    // ~ 如果这么做，编译器会报错说我们使用了arg的.length属性，但是没有地方指明arg具有这个属性。 记住，这些类型变量代表的是任意类型，所以使用这个函数的人可能传入的是个数字，而数字是没有 .length属性的。
    return arg
}
// 我们把这个版本的identity函数叫做泛型，因为它可以适用于多个类型。
// ! 不同于使用 any，它不会丢失信息，像第一个例子那像保持准确性，传入数值类型并返回数值类型。

// ~ 使用泛型
// 法1  传入所有参数，包括参数类型
let output = identity<string>('abc') // type of output will be 'string'
// 法2 更普遍 —— 利用类型推论- 即编译器会根据传入的参数自动地帮助我们确定T的类型：
let output1 = identity(123) // type of output will be 'number'

// 注意我们没必要使用尖括号（<>）来明确地传入类型；编译器可以查看myString的值，然后把T设置为它的类型。 类型推论帮助我们保持代码精简和高可读性。