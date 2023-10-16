# package.json 中的字段含义

我们经常会看到main、jsnext:main、module、browser等字段，那么这些字段都代表了什么意思呢？其实这跟npm包的工作环境有关系，我们知道，npm包分为以下几种类型的包：

    只能在浏览器端使用的
    只能在服务器端使用的
    浏览器/服务器端都可使用

## 在Webpack配置全解析中我们介绍到，mainFields就是webpack用来解析模块的，默认会按照顺序解析browser、module、main字段

假如我们现在开发一个npm包，既要支持浏览器端，也要支持服务器端（比如axios、lodash等），需要在不同的环境下加载npm包的不同入口文件，只通过一个字段已经不能满足需求。

    [main] 它是nodejs默认文件入口, 支持最广泛，主要使用在引用某个依赖包的时候需要此属性的支持；如果不使用main字段的话，我们可能需要这样来引用依赖：import('some-module/dist/bundle.js') -- 这里的文件一般是commonjs(cjs)模块化的。

    [module] 有一些打包工具，例如webpack或rollup，本身就能直接处理import导入的esm模块，那么我们可以将模块文件打包成esm模块，然后指定module字段；由包的使用者来决定如何引用。

    [jsnext:main] 和module字段的意义是一样的，都可以指定esm模块的文件；但是jsnext:main是社区约定的字段，并非官方，而module则是官方约定字段，因此我们经常将两个字段同时使用。

    [browser] 有时候我们还想要写一个同时能够跑在浏览器端和服务器端的npm包（比如axios），但是两者在运行环境上还是有着细微的区别，比如浏览器请求数据用的是XMLHttpRequest，而服务器端则是http或者https；那么我们要怎样来区分不同的环境呢？
    　　  除了我们可以在代码中对环境参数进行判断（比如判断XMLHttpRequest是否为undefined），也可以使用browser字段，在浏览器环境来替换main字段。browser的用法有以下两种，如果browser为单个的字符串，则替换main成为浏览器环境的入口文件，一般是umd模块的：

    {
        "browser": "./dist/bundle.umd.js"
    }

    browser还可以是一个对象，来声明要替换或者忽略的文件；这种形式比较适合替换部分文件，不需要创建新的入口。key是要替换的module或者文件名，右侧是替换的新的文件，比如在axios的packages.json中就用到了这种替换：
    {
        "browser": {
            "./lib/adapters/http.js": "./lib/adapters/xhr.js"
        }
    }

在有一些包中我们还会看到types字段，指向types/index.d.ts文件，这个字段是用来包含了这个npm包的变量和函数的类型信息；比如我们在使用lodash-es包的时候，有一些函数的名称想不起来了，只记得大概的名字；比如输入fi就能自动在编译器中联想出fill或者findIndex等函数名称，这就为包的使用者提供了极大的便利，不需要去查看包的内容就能了解其导出的参数名称，为用户提供了更加好的IDE支持。

