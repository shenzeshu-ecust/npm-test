// JavaScript 允许将 throw 与任何参数一起使用，所以从技术上讲，我们自定义的 error 不需要从 Error 中继承。但是，如果我们继承，那么就可以使用 obj instanceof Error 来识别 error 对象。因此，最好继承它。

// JavaScript 自身定义的内建的 Error 类的“伪代码”
/*
class Error {
  constructor(message) {
    this.message = message;
    this.name = "Error"; // (不同的内建 error 类有不同的名字)
    this.stack = <call stack>; // 非标准的，但大多数环境都支持它
  }
}
*/
// 现在让我们从其中继承 ValidationError，并尝试进行运行
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

function test() {
  throw new ValidationError("Whoops");
}

try {
  test();
} catch (error) {
  console.log(error.message); // Whoops!
  console.log(error.name); // ValidationError
  console.log(error.stack); //  一个嵌套调用的列表，每个调用都有对应的行号
}

class PropertyRequiredError extends ValidationError {
  constructor(property) {
    super("No property: " + property);
    this.name = "PropertyRequiredError";
    this.property = property;
  }
}

// 用法
function readUser(json) {
  let user = JSON.parse(json);

  if (!user.age) {
    throw new PropertyRequiredError("age");
  }
  if (!user.name) {
    throw new PropertyRequiredError("name");
  }

  return user;
}

// try..catch 的工作示例

try {
  let user = readUser('{ "age": 25 }');
} catch (err) {
  if (err instanceof ValidationError) {
    console.log("Invalid data: " + err.message); // Invalid data: No property: name
    console.log(err.name); // PropertyRequiredError
    console.log(err.property); // name
  } else if (err instanceof SyntaxError) {
    console.log("JSON Syntax Error: " + err.message);
  } else {
    throw err; // 未知 error，将其再次抛出
  }
}

// 在每个自定义 error 类中都要进行 this.name = <class name> 赋值操作。
// ~ 我们可以通过创建自己的“基础错误（basic error）”类来避免这种情况，该类进行了 this.name = this.constructor.name 赋值。然后让所有我们自定义的 error 都从这个“基础错误”类进行继承。
class MyError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class ValidateError extends MyError {}
class PropertyRequiredError1 extends ValidateError {
  constructor(property) {
    super("No property:" + property);
    this.property = property;
  }
}

console.log(new PropertyRequiredError1("field").name); // PropertyRequiredError1

// ! 包装异常

// 因为我们将“低级别”的异常“包装”到了更抽象的 ReadError 中。它被广泛应用于面向对象的编程中。
class ReadError extends Error {
  constructor(message, cause) {
    super(message);
    this.cause = cause;
    this.name = "ReadError";
  }
}

class ValidationError extends Error {
  /*...*/
}
class PropertyRequiredError extends ValidationError {
  /* ... */
}

function validateUser(user) {
  if (!user.age) {
    throw new PropertyRequiredError("age");
  }

  if (!user.name) {
    throw new PropertyRequiredError("name");
  }
}

function readUser(json) {
  let user;

  try {
    user = JSON.parse(json);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new ReadError("Syntax Error", err);
    } else {
      throw err;
    }
  }

  try {
    validateUser(user);
  } catch (err) {
    if (err instanceof ValidationError) {
      throw new ReadError("Validation Error", err);
    } else {
      throw err;
    }
  }
}

// ~ 调用 readUser 的代码只需要检查 ReadError，而不必检查每种数据读取 error。并且，如果需要更多 error 细节，那么可以检查 readUser 的 cause 属性。
try {
  readUser("{bad json}");
} catch (e) {
  if (e instanceof ReadError) {
    console.log(e);
    // Original error: SyntaxError: Unexpected token b in JSON at position 1
    console.log("Original error: " + e.cause);
  } else {
    throw e;
  }
}
