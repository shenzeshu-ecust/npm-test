function promise1() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('1');
        }, 1000);
    });
}

function promise2(value) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('value:' + value);
        }, 1000);
    });
}

function* readFile() {
    const value = yield promise1();
    const result = yield promise2(value);
    return result;
}

// ! 所谓 Async 其实就是将 Generator 包裹了一层 co 函数，所以它被称为 Generator 和 Promise 的语法糖。

// ~ 其实关于异步迭代时，大多数情况下都可以使用类似该函数中的递归方式来处理。
function co(gen) {
    return new Promise((resolve, reject) => {
        const g = gen();
        function next(param) {
            const { done, value } = g.next(param);
            if (!done) {
                // 未完成 继续递归
                Promise.resolve(value).then((res) => next(res));
            } else {
                // 完成直接重置 Promise 状态
                resolve(value);
            }
        }
        next();
    });
}

co(readFile).then((res) => console.log(res));
/*
函数中稍微有三点需要大家额外注意：

首先我们可以看到 next 函数接受传入的一个 param 的参数。
这是因为我们使用 Generator 来处理异步问题时，通过 const a = yield promise 将 promise 的 resolve 值交给 a ，所以我们需要在每次 then 函数中将 res 传递给下一次的 next(res) 作为上次 yield 的返回值。

其次，细心的同学可以留意到这一句代码Promise.resolve(value).then((res) => next(res));。
我们使用 Promise.resolve 将 value 进行了一层包裹，这是因为当生成器函数中的 yield 方法后紧挨的并不是 Promise 时，此时我们需要统一当作 Promise 来处理，因为我们需要统一调用 .then 方法。

最后，首次调用 next() 方法时，我们并没有传入 param 参数。
相信这个并不难理解，当我们不传入 param 时相当于直接调用 g.next() ，上边我们提到过当调用生成器对象的 next 方法传入参数时，该参数会当作上一次 yield 语句的返回值来处理。

因为首次调用 g.next() 时，生成器函数内部之前并不存在 yield ，所以传入参数是没有任何意义的。
*/