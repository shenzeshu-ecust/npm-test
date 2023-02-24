// 导出（export）和导入（import）指令有几种语法变体。

// ! 我们把 import/export 语句放在脚本的顶部或底部，都没关系。
// 在实际开发中，导入通常位于文件的开头，但是这只是为了更加方便。
// ! 请注意在 {...} 中的 import/export 语句无效。

// 像这样的有条件的导入是无效的：

if (something) {
  import {sayHi} from "./say.js"; // Error: 导入声明只能在模块的顶层使用
}
// ? 如果想根据某些条件进行导入————动态导入
// ! 1 在声明前导出
// 导出数组
export let months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// ~ 导出 class/function 后没有分号
// 导出类
export class User {
  constructor(name) {
    this.name = name;
  }
}
export function sayHi(user) {
  console.log(`Hello, ${user}!`);
} // 在这里没有分号

// ! 2 导出与声明分开
// 📁 say.js
function sayHi(user) {
  alert(`Hello, ${user}!`);
}

function sayBye(user) {
  alert(`Bye, ${user}!`);
}

export { sayHi, sayBye }; // 导出变量列表

// ! 3 Import *
// 通常，我们把要导入的东西列在花括号 import {...} 中，就像这样：

// 📁 main.js
import { sayHi, sayBye } from "./say.js";

sayHi("John"); // Hello, John!
sayBye("John"); // Bye, John!

// 但是如果有很多要导入的内容，我们可以使用 import * as <obj> 将所有内容导入为一个对象，例如：

// 📁 main.js
import * as say from "./say.js";

say.sayHi("John");
say.sayBye("John");
// ~ 不建议用 * 全部导入
/*
    ~ 1 现代的构建工具（webpack 和其他工具）将模块打包到一起并对其进行优化，以加快加载速度并删除未使用的代码。

比如说，我们向我们的项目里添加一个第三方库 say.js，它具有许多函数：

/ 📁 say.js
export function sayHi() { ... }
export function sayBye() { ... }
export function becomeSilent() { ... }

现在，如果我们只在我们的项目里使用了 say.js 中的一个函数：

/ 📁 main.js
import {sayHi} from './say.js';

   * 那么，优化器（optimizer）就会检测到它，并从打包好的代码中删除那些未被使用的函数，从而使构建更小。这就是所谓的“摇树（tree-shaking）”。

    ~ 2 明确列出要导入的内容会使得名称较短：sayHi() 而不是 say.sayHi()。

    ~ 3 导入的显式列表可以更好地概述代码结构：使用的内容和位置。它使得代码支持重构，并且重构起来更容易。

*/

// ! 4 import as 重命名
import { sayHi as hi, sayBye as bye } from "./say.js";

hi("John"); // Hello, John!
bye("John"); // Bye, John!

// ! export as 重命名
// 我们将函数导出为 hi 和 bye：

// 📁 say.js
// ...
export { sayHi as hi, sayBye as bye }; // ~ 外部代码导入时用的就是 hi bye

// ! 5 export default 一个模块只做一件事

// 将 export default 放在要导出的实体前：

// 📁 user.js
export default class User {
  // 只需要添加 "default" 即可
  constructor(name) {
    this.name = name;
  }
}

// 每个文件应该只有一个 export default：

// ~ 然后将其导入而不需要花括号：

// 📁 main.js
import User from "./user.js"; // 不需要花括号 {User}，只需要写成 User 即可

new User("John");

// ~ 由于每个文件最多只能有一个默认的导出，因此导出的实体可能没有名称。
// 例如，下面这些都是完全有效的默认的导出：

/*
    export default function(user) { // 没有函数名
        alert(`Hello, ${user}!`);
    }
    export default class { // 没有类名
        constructor() {  }
    }
    / 导出单个值，而不使用变量
    export default ['Jan', 'Feb', 'Mar','Apr', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
*/

// ! 6 “default” 名称
// 1）例如，要将函数与其定义分开导出：

function sayHi(user) {
    alert(`Hello, ${user}!`);
  }
  
  // 就像我们在函数之前添加了 "export default" 一样
  export {sayHi as default};

// 2） 或者，另一种情况，假设模块 user.js 导出了一个主要的默认的导出和一些命名的导出（这种情况很少见，但确实会发生）：
// 📁 user.js
export default class User {
    constructor(name) {
      this.name = name;
    }
}

export function sayHi(user) {
    alert(`Hello, ${user}!`);
}
  
// 这是导入默认的导出以及命名的导出的方法：
  
  // 📁 main.js
  import {default as User, sayHi} from './user.js';
  
  new User('John');
  
//   如果我们将所有东西 * 作为一个对象导入，那么 default 属性正是默认的导出：
  
  // 📁 main.js
  import * as user from './user.js';
  
  let User = user.default; // 默认的导出
  new User('John');
  
// ! 默认default导出的 优缺点
// 命名的导出是明确的。它们确切地命名了它们要导出的内容，因此我们能从它们获得这些信息，这是一件好事。

// ~ 命名的导出会强制我们使用正确的名称进行导入；对于默认的导出，我们总是在导入时选择名称。
// ~ ，团队成员可能会使用不同的名称来导入相同的内容，这不好。
// ~ 为了避免这种情况并使代码保持一致，可以遵从这条规则，即导入的变量应与文件名相对应

// ! 7 重新导出
//  export ... from ... 允许导入内容，并立即将其导出（可能是用的是其他的名字），就像这样：

// ~ 其实就相当于
// 📁 auth/index.js  （这个文件是我们希望外部人员能够访问的）
// 导入 login/logout 然后立即导出它们
import {login, logout} from './helpers.js'; // helpers文件我们不希望别人访问，只能通过index.js访问helpers里面的函数之类
export {login, logout};

// ~ 重新导出 login/logout
// 📁 auth/index.js
export {login, logout} from './helpers.js';
// ~ export ... from 与 import/export 相比的显着区别是重新导出的模块在当前文件中不可用。所以在上面的 auth/index.js 示例中，我们不能使用重新导出的 login/logout 函数。

// ! 8重新导出默认导出

// 重新导出时，默认导出需要单独处理。

// 假设我们有一个 user.js 脚本，其中写了 export default class User，并且我们想重新导出类 User：

// 📁 user.js
export default class User {
  // ...
}
/*
我们可能会遇到两个问题：

    export User from './user.js' 无效。这会导致一个语法错误。

    要重新导出默认导出，我们必须明确写出 export {default as User}，就像上面的例子中那样。

    export * from './user.js' 重新导出只导出了命名的导出，但是忽略了默认的导出。

    ~ 如果我们想将命名的导出和默认的导出都重新导出，那么需要两条语句：

    ~ 1 export * from './user.js'; // 重新导出命名的导出
    ~ 2 export {default} from './user.js'; // 重新导出默认的导出

重新导出一个默认导出的这种奇怪现象，是某些开发者不喜欢默认导出，而是喜欢命名的导出的原因之一。
*/