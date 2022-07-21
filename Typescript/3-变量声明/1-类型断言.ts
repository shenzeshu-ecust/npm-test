// 类型断言可以用来手动指定一个值的类型，即允许变量从一种类型更改为另一种类型。
/**
 * 语法§

值 as 类型

或

<类型>值

在 tsx 语法（React 的 jsx 语法的 ts 版）中必须使用前者，即 值 as 类型。

形如 <Foo> 的语法在 tsx 中表示的是一个 ReactNode，在 ts 中除了表示类型断言之外，也可能是表示一个泛型。

故建议大家在使用类型断言时，统一使用 值 as 类型 这样的语法，本书中也会贯彻这一思想。
 */
interface Animal {
    name:string
}
interface Cat {
    name:string,
    run():void
}
const animal:Animal = {
    name:'tom'
}
// let tom:Cat = animal; // 报错：类型 "Animal" 中缺少属性 "run"，但类型 "Cat" 中需要该属性。
let tom = animal as Cat // 断言
// ----------  类型声明是比类型断言更加严格的。 ----------
interface ApiError extends Error {
    code: number;
}
interface HttpError extends Error {
    statusCode: number;
}

function isApiError(error: Error) {
    if (typeof (error as ApiError).code === 'number') { // 如果直接用error.code会报错：因为HttpError没有code字段！
        return true;
    }
    return false;
}
/**
 * 
 * window.foo = 1;

// index.ts:1:8 - error TS2339: Property 'foo' does not exist on type 'Window & typeof globalThis'.

上面的例子中，我们需要将 window 上添加一个属性 foo，但 TypeScript 编译时会报错，提示我们 window 上不存在 foo 属性。

此时我们可以使用 as any 临时将 window 断言为 any 类型：

(window as any).foo = 1;

在 any 类型的变量上，访问任何属性都是允许的。

需要注意的是，将一个变量断言为 any 可以说是解决 TypeScript 中类型问题的最后一个手段。

它极有可能掩盖了真正的类型错误，所以如果不是非常确定，就不要使用 as any。

上面的例子中，我们也可以通过[扩展 window 的类型（TODO）][]解决这个错误，不过如果只是临时的增加 foo 属性，as any 会更加方便。
 */