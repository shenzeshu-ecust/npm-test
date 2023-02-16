// 通常，如果发生错误，脚本就会“死亡”（立即停止），并在控制台将错误打印出来。

// 但是有一种语法结构 try...catch，它使我们可以“捕获（catch）”错误，因此脚本可以执行更合理的操作，而不是死掉。
/**
 * 它按照以下步骤执行：

    首先，执行 try {...} 中的代码。
    如果这里没有错误，则忽略 catch (err)：执行到 try 的末尾并跳过 catch 继续执行。
    如果这里出现错误，则 try 执行停止，控制流转向 catch (err) 的开头。变量 err（我们可以使用任何名称）将包含一个 error 对象，该对象包含了所发生事件的详细信息。

 */
// ! 1 try...catch 仅对运行时的 error 有效
/*
~ 要使得 try...catch 能工作，代码必须是可执行的；如果代码包含语法错误，那么 try..catch 将无法正常工作，例如含有不匹配的花括号：
    try {
        {{{{{{{{{{{{
    } catch (err) {
        console.log("引擎无法理解这段代码，它是无效的");
    }
~ JavaScript 引擎首先会读取代码，然后运行它。在读取阶段发生的错误被称为“解析时间（parse-time）”错误，并且无法恢复（从该代码内部）。这是因为引擎无法理解该代码。

~ 所以，try...catch 只能处理有效代码中出现的错误。这类错误被称为“运行时的错误（runtime errors）”，有时被称为“异常（exceptions）”。
*/

// ! 2 try...catch 同步执行
// ~ 如果在“计划的（scheduled）”代码中发生异常，例如在 setTimeout 中，则 try...catch 不会捕获到异常：
try {
  setTimeout(() => {
    // error // ~ 如果脚本这里有错误
  }, 1000);
} catch (error) {
  console.log(error);
}
// ~ 因为 try...catch 包裹了计划要执行的函数，该函数本身要稍后才执行，这时引擎已经离开了 try...catch 结构。

// 为了捕获到计划的（scheduled）函数中的异常，那么 try...catch 必须在这个函数内：

setTimeout(function () {
  try {
    noSuchVariable; // try...catch 处理 error 了！
  } catch {
    console.log("error 被在这里捕获了！");
  }
}, 1000);

// ! 3 error对象
/*
对于所有内建的 error，error 对象具有两个主要属性：

~ 1 name
    Error 名称。例如，对于一个未定义的变量，名称是 "ReferenceError"。
~ 2 message
    关于 error 的详细文字描述。

还有其他非标准的属性在大多数环境中可用。其中被最广泛使用和支持的是：

~ stack
    当前的调用栈：用于调试目的的一个字符串，其中包含有关导致 error 的嵌套调用序列的信息。
*/

// 例如：

try {
  lalala; // error, variable is not defined!
} catch (err) {
  console.log(err.name); // ReferenceError
  console.log(err.message); // lalala is not defined
  console.log(err.stack); // ReferenceError: lalala is not defined at (...call stack)

  // 也可以将一个 error 作为整体显示出来
  // error 信息被转换为像 "name: message" 这样的字符串
  console.log(err); // ReferenceError: lalala is not defined
}

// ~ 这个catch(err) 中的err可以省略
try {
} catch {} // 没有error，这是一个最近添加到 JavaScript 的特性。 旧式浏览器可能需要 polyfills.

// ! 4 使用try catch
// ~ 如果JSON.parse(str) 中的jsonStr有错误，JSON.parse 就会生成一个 error，因此脚本就会“死亡”。

let json = "{ bad json }";

try {
  let user = JSON.parse(json); // <-- 当出现 error 时...
  console.log(user.name); // 不工作
} catch (err) {
  // ...执行会跳转到这里并继续执行
  console.log("很抱歉，数据有错误，我们会尝试再请求一次。");
  console.log(err.name); // SyntaxError
  console.log(err.message); // Unexpected token b in JSON at position 2
}

// ! 5 throw  抛出自定义的error 以进入catch
// throw 操作符会生成一个 error 对象。
// throw <error object>

// 技术上讲，我们可以将任何东西用作 error 对象。甚至可以是一个原始类型数据，例如数字或字符串，
// ~ 但最好使用对象，最好使用具有 name 和 message 属性的对象（某种程度上保持与内建 error 的兼容性）。

// ~ JavaScript 中有很多内建的标准 error 的构造器：Error，SyntaxError，ReferenceError，TypeError 等。我们也可以使用它们来创建 error 对象。

// 它们的语法是：

let error1 = new Error(message);
// 或
let error2 = new SyntaxError(message);
let error3 = new ReferenceError(message);
// ~ 对于内建的 error（不是对于其他任何对象，仅仅是对于 error），name 属性刚好就是构造器的名字。message 则来自于参数（argument）。
let error = new Error("Things happen o_O");

console.log(error.name); // Error
console.log(error.message); // Things happen o_O
let jsonstr = '{ "age": 30 }';
try {
  let user = JSON.parse(json);
  if (!user.name) {
    throw new SyntaxError("数据不全，没有name");
  }
} catch (error) {
  console.log(error.name); // SyntaxError
  console.log(err.message); // 数据不全，没有name
}

// ! 6 ReThrowing 再次抛出
// 实际上，catch 会捕获到 所有 来自于 try 的 error。
/*
~ catch 应该只处理它知道的 error，并“抛出”所有其他 error。

“再次抛出（rethrowing）”技术可以被更详细地解释为：

    1 Catch 捕获所有 error。
    2 在 catch (err) {...} 块中，我们对 error 对象 err 进行分析。
    3 如果我们不知道如何处理它，那我们就 throw err。

*/
// ~ 通常，我们可以使用 instanceof 操作符（或者error.name）判断错误类型：
let json1 = '{ "age": 30 }'; // 不完整的数据
try {
  let user = JSON.parse(json1);
  if (!user.name) {
    throw new SyntaxError("数据不全：没有 name");
  }

  blabla(); // 预料之外的 error

  console.log(user.name);
} catch (err) {
  if (err instanceof SyntaxError) {
    console.log("JSON Error: " + err.message);
  } else {
    throw err; // 再次抛出 (*)
  }
}
/*
~ 如果 (*) 标记的这行 catch 块中的 error 从 try...catch 中“掉了出来”，那么它也可以被外部的 try...catch 结构（如果存在）捕获到，如果外部不存在这种结构，那么脚本就会被杀死。
~ 所以，catch 块实际上只处理它知道该如何处理的 error，并“跳过”所有其他的 error。
下面这个示例演示了这种类型的 error 是如何被另外一级 try...catch 捕获的：
*/
function readData() {
  let json = '{ "age": 30 }';

  try {
    // ...
    blabla(); // error!
  } catch (err) {
    // ...
    if (!(err instanceof SyntaxError)) {
      throw err; // 再次抛出（不知道如何处理它）
    }
  }
}

try {
  readData();
} catch (err) {
  console.log("External catch got: " + err); // 捕获了它！
}

// ! 7 try{} catch {} finally{}
// finally中的代码无论如何都会执行

// ! tips: 如果使用let const 在try块中声明变量，那么该变量只在try块中可见

// ! 8 finally 和 return
// finally 子句适用于 try...catch 的 任何 出口。这包括显式的 return。
// ~ 在下面这个例子中，在 try 中有一个 return。在这种情况下，finally 会在控制转向外部代码前被执行。
function func() {
  try {
    return 1;
  } catch (error) {
  } finally {
    console.log("finally");
  }
}
func(); // finally

// ! 9 全局catch
// 设想一下，在 try...catch 结构外有一个致命的 error，然后脚本死亡了。这个 error 就像编程错误或其他可怕的事儿那样。有什么办法可以用来应对这种情况吗？我们可能想要记录这个 error，并向用户显示某些内容（通常用户看不到错误信息）等。
// ~ 规范中没有相关内容，但是代码的执行环境一般会提供这种机制，因为它确实很有用。例如，Node.JS 有 process.on("uncaughtException")。在浏览器中，我们可以将一个函数赋值给特殊的 window.onerror 属性，该函数将在发生未捕获的 error 时执行。

// 语法如下：

window.onerror = function (message, url, line, col, error) {
  // ...
};
/*
message
    error 信息。
url
    发生 error 的脚本的 URL。
line，col
    发生 error 处的代码的行号和列号。
error
    error 对象。
*/

window.onerror = function (message, url, line, col, error) {
  alert(`${message}\n At ${line}:${col} of ${url}`);
};

function readData() {
  badFunc(); // 啊，出问题了！
}

readData();
/*

全局错误处理程序 window.onerror 的作用通常不是恢复脚本的执行 —— 如果发生编程错误，恢复脚本的执行几乎是不可能的，它的作用是将错误信息发送给开发者。

也有针对这种情况提供 error 日志的 Web 服务，例如 https://errorception.com 或 http://www.muscula.com。

它们会像这样运行：

    我们注册该服务，并拿到一段 JavaScript 代码（或脚本的 URL），然后插入到页面中。
    该 JavaScript 脚本设置了自定义的 window.onerror 函数。
    当发生 error 时，它会发送一个此 error 相关的网络请求到服务提供方。
    我们可以登录到服务方的 Web 界面来查看这些 error。
*/

// TEST
// 比较下面两个代码片段。

// 第一个代码片段，使用 finally 在 try..catch 之后执行代码：

try {
  // 工作
} catch (err) {
  // 处理 error
} finally {
  // * 清理工作空间
}

// 第二个代码片段，将清空工作空间的代码放在了 try...catch 之后：

try {
  // 工作
} catch (err) {
  // 处理 error
}

// * 清理工作空间

// ? 哪个更好？
// 如果在这有“跳出” try..catch 的行为（return  throw..），那么这两种方式的表现就不同了。
function f() {
  try {
    alert("start");
    return "result";
  } catch (err) {
    /// ...
  } finally {
    alert("cleanup!");
  }
}

f(); // cleanup!
// ~ 当 try...catch 中有 return 时。finally 子句会在 try...catch 的 任意 出口处起作用，即使是通过 return 语句退出的也是如此：在 try...catch 刚刚执行完成后，但在调用代码获得控制权之前。

// TEST
// 继承 SyntaxError

class FormatError extends SyntaxError {
  constructor(type) {
    super(type);
    this.name = "FormatError";
  }
}
