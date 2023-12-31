// 接口能够描述JavaScript里丰富的类型。 因为JavaScript其动态灵活的特点，有时你会希望一个对象可以同时具有上面提到的多种类型。

// 一个例子就是，一个对象可以同时做为函数和对象使用，并带有额外的属性。
interface Counter {
    (start: number): string
    interval: number
    reset(): void
}
function getCounter(): Counter {
    let counter = <Counter>function (start: number){}
    counter.interval = 123
    counter.reset = function() {}
    return counter
}
let d = getCounter()
d(10)
d.reset()
d.interval = 5.0

