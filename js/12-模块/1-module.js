// 随着我们的应用越来越大，我们想要将其拆分成多个文件，即所谓的“模块（module）”。一个模块可以包含用于特定目的的类或函数库。
/*
列举一些（出于历史原因）：

    AMD —— 最古老的模块系统之一，最初由 require.js 库实现。
    CommonJS —— 为 Node.js 服务器创建的模块系统。
    UMD —— 另外一个模块系统，建议作为通用的模块系统，它与 AMD 和 CommonJS 都兼容。

现在，它们都在慢慢成为历史的一部分，但我们仍然可以在旧脚本中找到它们。
语言级的模块系统在 2015 年的时候出现在了标准（ES6）中，此后逐渐发展，现在已经得到了所有主流浏览器和 Node.js 的支持。
 */

// ! 1 模块定义
/*
~ 一个模块（module）就是一个文件。一个脚本就是一个模块。就这么简单。

模块可以相互加载，并可以使用特殊的指令 export 和 import 来交换功能，从另一个模块调用一个模块的函数：

    export 关键字标记了可以从当前模块外部访问的变量和函数。
    import 关键字允许从其他模块导入功能。
~ 由于模块支持特殊的关键字和功能，因此我们必须通过使用 <script type="module"> 特性（attribute）来告诉浏览器，此脚本应该被当作模块（module）来对待。
    浏览器会自动获取并解析（evaluate）导入的模块（如果需要，还可以分析该模块的导入），然后运行该脚本。
*/

// ! 2 模块与常规脚本不同之处

// ~ 1) 始终使用 “use strict”
// 模块始终在严格模式下运行。例如，对一个未声明的变量赋值将产生错误（译注：在浏览器控制台可以看到 error 信息）。
/*
    <script type="module">
    a = 5; // error
    </script>
*/

// ~ 2) 模块拥有自己的模块级作用域
// 每个模块都有自己的顶级作用域（top-level scope）。换句话说，一个模块中的顶级作用域变量和函数在其他脚本中是不可见的。

// 在浏览器中，对于 HTML 页面，每个 <script type="module"> 都存在独立的顶级作用域。

// ~ 3）模块代码仅在第一次导入时被解析
// ~ 如果同一个模块被导入到多个其他位置，那么它的代码只会执行一次，即在第一次被导入时。然后将其导出（export）的内容提供给进一步的导入（importer）。
// ~ 只执行一次会产生很重要的影响，我们应该意识到这一点。

// 首先，如果执行一个模块中的代码会带来副作用（side-effect），例如显示一条消息，那么多次导入它只会触发一次显示 —— 即第一次：
// 📁 alert.js
// alert("Module is evaluated!");

// 在不同的文件中导入相同的模块

// 📁 1.js
// import `./alert.js`; // Module is evaluated!

// 📁 2.js
// import `./alert.js`; // (什么都不显示) ~ 第二次导入什么也没显示，因为模块已经执行过了。

// ~ 这里有一条规则：顶层模块代码应该用于初始化，创建模块特定的内部数据结构。如果我们需要多次调用某些东西 —— 我们应该将其以函数的形式导出

// ! 模块导出的内容可以被修改，并且全局共享 这个变化

// eg: 我们假设一个模块导出了一个对象：
// 📁 admin.js
export let admin = {
  name: "John",
};
// 所有的导入都只获得了一个唯一的 admin 对象：
// 📁 1.js
import { admin } from "./admin.js";
admin.name = "Pete";

// 📁 2.js
import { admin } from "./admin.js";
alert(admin.name); // ! Pete

// * 1.js 和 2.js 引用的是同一个 admin 对象
// * 在 1.js 中对对象做的更改，在 2.js 中也是可见的
// ~ 这正是因为该模块只执行了一次。生成导出，然后这些导出在导入之间共享，因此如果更改了 admin 对象，在其他导入中也会看到。

/*
这种行为实际上非常方便，因为它允许我们“配置”模块。

~ 换句话说，模块可以提供需要配置的通用功能。例如身份验证需要凭证。那么模块可以导出一个配置对象，期望外部代码可以对其进行赋值。

这是经典的使用模式：

    1 模块导出一些配置方法，例如一个配置对象。
    2 在第一次导入时，我们对其进行初始化，写入其属性。可以在应用顶级脚本中进行此操作。
    3 进一步地导入使用模块。

 */

// 📁 admin.js
export let config = {};

export function sayHi() {
  alert(`Ready to serve, ${config.user}!`);
}
// 然后，在 init.js 中，我们应用的第一个脚本，我们从 init.js 导入了 config 并设置了 config.user：
// 📁 init.js
import { config } from "./admin.js";
config.user = "Pete";
// ~ 现在模块 admin.js 已经是被配置过的了。
// 其他导入可以调用它，它会正确显示当前用户：
// 📁 another.js
import { sayHi } from "./admin.js";

sayHi(); // Ready to serve, Pete!

// ! import.meta 包含关于当前模块的信息。
// 它的内容取决于其所在的环境。在浏览器环境中，它包含当前脚本的 URL，或者如果它是在 HTML 中的话，则包含当前页面的 URL。
/*
<script type="module">
  alert(import.meta.url); // 脚本的 URL
  / 对于内联脚本来说，则是当前 HTML 页面的 URL
</script>
*/

// ~ 4） 在一个模块中，“this” 是 undefined
/*
~ 将其与非模块脚本进行比较会发现，非模块脚本的顶级 this 是全局对象：
<script>
  alert(this); // * window
</script>

<script type="module">
  alert(this); // * undefined
</script>
*/

// ~ 5 与常规脚本相比，拥有 type="module" 标识的脚本有一些特定于浏览器的差异。
// * 模块脚本是延迟的
/*
~ 模块脚本 总是 被延迟的，与 defer 特性（在 脚本：async，defer 一章中描述的）对外部脚本和内联脚本（inline script）的影响相同。

也就是说：

    1 下载外部模块脚本 <script type="module" src="..."> 不会阻塞 HTML 的处理，它们会与其他资源并行加载。
    2 模块脚本会等到 HTML 文档完全准备就绪（即使它们很小并且比 HTML 加载速度更快），然后才会运行。
    3 保持脚本的相对顺序：在文档中排在前面的脚本先执行。

~ 它的一个副作用是，模块脚本总是会“看到”已完全加载的 HTML 页面，包括在它们下方的 HTML 元素。

<script type="module">
  alert(typeof button); // object：脚本可以“看见”下面的 button
  * 因为模块是被延迟的（deferred，所以模块脚本会在整个页面加载完成后才运行
</script>

相较于下面这个常规脚本：

<script>
  alert(typeof button); // button 为 undefined，脚本看不到下面的元素
  * 常规脚本会立即运行，常规脚本的运行是在在处理页面的其余部分之前进行的
</script>

<button id="button">Button</button>

~ 上面的第二个脚本实际上要先于前一个脚本运行！所以我们会先看到 undefined，然后才是 object。
~ 这是因为模块脚本是被延迟的，所以要等到 HTML 文档被处理完成才会执行它。而常规脚本则会立即运行，所以我们会先看到常规脚本的输出。
*/

// ! Async 适用于内联脚本（inline script）
/*
! 对于非模块脚本，async 特性（attribute）仅适用于外部脚本。异步脚本会在准备好后立即运行，独立于其他脚本或 HTML 文档。
! 对于模块脚本，它也适用于内联脚本。

~ 例如，下面的内联脚本具有 async 特性，因此它不会等待任何东西。

它执行导入（fetch ./analytics.js），并在导入完成时运行，即使 HTML 文档还未完成，或者其他脚本仍在等待处理中。

这对于不依赖任何其他东西的功能来说是非常棒的，例如计数器，广告，文档级事件监听器。

<!-- 所有依赖都获取完成（analytics.js）然后脚本开始运行 -->
<!-- 不会等待 HTML 文档或者其他 <script> 标签 -->
<script async type="module">
  import {counter} from './analytics.js';

  counter.count();
</script>
*/

// ! 具有 type="module" 的外部脚本（external script）在两个方面有所不同：
/*
~ 1 具有相同 src 的外部脚本仅运行一次：

<!-- 脚本 my.js 被加载完成（fetched）并只被运行一次 -->
<script type="module" src="my.js"></script>
<script type="module" src="my.js"></script>

~ 2 从另一个源（例如另一个网站）获取的外部脚本需要 CORS header，如我们在 Fetch：跨源请求 一章中所讲的那样。
~ 换句话说，如果一个模块脚本是从另一个源获取的，则远程服务器必须提供表示允许获取的 header Access-Control-Allow-Origin。

<!-- another-site.com 必须提供 Access-Control-Allow-Origin -->
<!-- 否则，脚本将无法执行 -->
<script type="module" src="http://another-site.com/their.js"></script>

默认这样做可以确保更好的安全性。
*/

// ! 不允许裸模块（“bare” module）
// ~ 在浏览器中，import 必须给出相对或绝对的 URL 路径。没有任何路径的模块被称为“裸（bare）”模块。在 import 中不允许这种模块。

// 例如，下面这个 import 是无效的：
import { sayHi } from "sayHi"; // Error，“裸”模块
// * 模块必须有一个路径，例如 './sayHi.js' 或者其他任何路径
// 某些环境，像 Node.js 或者打包工具（bundle tool）允许没有任何路径的裸模块，因为它们有自己的查找模块的方法和钩子（hook）来对它们进行微调。但是浏览器尚不支持裸模块。

// ! 兼容性，“nomodule”
// 旧时的浏览器不理解 type="module"。未知类型的脚本会被忽略。对此，我们可以使用 nomodule 特性来提供一个后备：
/*
<script type="module">
  alert("Runs in modern browsers");
</script>

<script nomodule>
  alert("Modern browsers know both type=module and nomodule, so skip this")
  alert("Old browsers ignore script with unknown type=module, but execute this.");
</script>
*/

// ! 构建工具
/*

在实际开发中，浏览器模块很少被以“原始”形式进行使用。通常，我们会使用一些特殊工具，例如 Webpack，将它们打包在一起，然后部署到生产环境的服务器。

* 使用打包工具的一个好处是 —— 它们可以更好地控制模块的解析方式，允许我们使用裸模块和更多的功能，例如 CSS/HTML 模块等。

~ 构建工具做以下这些事儿：

   1 从一个打算放在 HTML 中的 <script type="module"> “主”模块开始。
   2 分析它的依赖：它的导入，以及它的导入的导入等。
   3 使用所有模块构建一个文件（或者多个文件，这是可调的），并用打包函数（bundler function）替代原生的 import 调用，以使其正常工作。还支持像 HTML/CSS 模块等“特殊”的模块类型。
   4 在处理过程中，可能会应用其他转换和优化：
        删除无法访问的代码。
        删除未使用的导出（“tree-shaking”）。
        删除特定于开发的像 console 和 debugger 这样的语句。
        可以使用 Babel 将前沿的现代的 JavaScript 语法转换为具有类似功能的旧的 JavaScript 语法。
        压缩生成的文件（删除空格，用短的名字替换变量等）。

如果我们使用打包工具，那么脚本会被打包进一个单一文件（或者几个文件）
~ 在这些脚本中的 import/export 语句会被替换成特殊的打包函数（bundler function）。因此，最终打包好的脚本中不包含任何 import/export，它也不需要 type="module"，我们可以将其放入常规的 <script>：

<!-- 假设我们从诸如 Webpack 这类的打包工具中获得了 "bundle.js" 脚本 -->
<script src="bundle.js"></script>

关于构建工具说了这么多，但其实原生模块也是可以用的。
*/

// * 总结
/*
 *  1 一个模块就是一个文件。浏览器需要使用 <script type="module"> 以使 import/export 可以工作。模块（译注：相较于常规脚本）有几点差别：
        默认是延迟解析的（deferred）。
        Async 可用于内联脚本。
        要从另一个源（域/协议/端口）加载外部脚本，需要 CORS header。
        重复的外部脚本会被忽略
 *  2 模块具有自己的本地顶级作用域，并可以通过 import/export 交换功能。
 *  3 模块始终使用 use strict。
 *  4 模块代码只执行一次。导出仅创建一次，然后会在导入之间共享。
 
 */
