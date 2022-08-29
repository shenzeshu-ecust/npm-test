class GenericNumber<T> { // ! 与接口一样，直接把泛型类型放在类后面，可以帮助我们确认类的所有属性都在使用相同的类型。
    zeroValue: T
    add: (x: T, y: T) => T
}

let myGenericNumber = new GenericNumber<number>()
myGenericNumber.zeroValue = 0
myGenericNumber.add = function(x, y) { 
    return x + y;
}
// ~ 类有两部分：静态部分和实例部分。 泛型类指的是实例部分的类型，所以类的 静态属性 不能使用这个泛型类型。 
