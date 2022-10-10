/*
    行为驱动开发（BDD）

    我们来使用一种名为 行为驱动开发 或简言为 BDD 的技术。

    BDD 包含了三部分内容：测试、文档和示例。

    规范有三种使用方式：

    作为 测试 —— 保证代码正确工作。
    作为 文档 —— describe 和 it 的标题告诉我们函数做了什么。
    作为 案例 —— 测试实际工作的例子展示了一个函数可以被怎样使用。

*/
describe("pow", function () {
  it("2 raised to power 3 is 8 ", function () {
    assert.equal(pow(2, 3), 8);
  });
  // ~ 保持测试之间独立，有助于我们获知代码中正在发生什么
  // ~ 此外，我们可以通过编写 it.only 而不是 it 来隔离单个测试，并以独立模式运行它：
  //  Mocha 将只运行这个代码块
  it.only("3 raised to power 4 is 81 ", function () {
    assert.equal(pow(3, 4), 81);
  });
});
/*

    * describe("title", function() { ... })

    表示我们正在描述的功能是什么。在我们的例子中我们正在描述函数 pow。用于组织“工人（workers）” —— it 代码块。
    * it("use case description", function() { ... })

    it 里面的描述部分，我们以一种 易于理解 的方式描述特定的用例，第二个参数是用于对其进行测试的函数。
    * assert.equal(value1, value2)

    it 块中的代码，如果实现是正确的，它应该在执行的时候不产生任何错误。

    * assert.* 函数用于检查 pow 函数是否按照预期工作。在这里我们使用了其中之一 —— assert.equal，它会对参数进行比较，如果它们不相等则会抛出一个错误。这里它检查了 pow(2, 3) 的值是否等于 8。还有其他类型的比较和检查，我们将在后面介绍到。

规范可以被执行，它将运行在 it 块中指定的测试。
*/
// ! 除了手动地编写 it 代码块，我们可以使用 for 循环来生成它们：
describe("pow", function () {
  // 我们可以设置 before/after 函数来在运行测试之前/之后执行。
  // 也可以使用 beforeEach/afterEach 函数来设置在执行 每一个 it 之前/之后执行。
  // * 通常，beforeEach/afterEach 和 before/after 被用于执行初始化，清零计数器或做一些介于每个测试（或测试组）之间的事情。
  before(() => console.log("Testing started – before all tests")); // 最开始执行一次
  after(() => console.log("Testing finished – after all tests"));

  beforeEach(() => console.log("Before a test – enter a test"));
  afterEach(() => console.log("After a test – exit a test")); // 末尾执行一次

  describe("raises x to power 3", function () {
    function makeTest(x) {
      let expected = x * x * x;
      it(`${x} in the power 3 is ${expected}`, function () {
        assert.equal(pow(x, 3), expected);
      });
    }
    for (let x = 1; x <= 5; x++) {
      makeTest(x);
    }
  });
  describe("raises x to power 2", function () {
    function makeTest(x) {
      let expected = x * x;
      it(`${x} in the power 2 is ${expected}`, function () {
        assert.equal(pow(x, 2), expected);
      });
    }
    for (let x = 1; x <= 5; x++) {
      makeTest(x);
    }
  });
  it("for negative n the result is NaN", function () {
    assert.isNaN(pow(2, -1));
  });

  it("for non-integer n the result is NaN", function () {
    assert.isNaN(pow(2, 1.5));
  });
  /*
    请注意断言语句 assert.isNaN：它用来检查 NaN。

    在 Chai 中也有其他的断言，例如：

        assert.equal(value1, value2) —— 检查相等 value1 == value2。
        assert.strictEqual(value1, value2) —— 检查严格相等 value1 === value2。
        assert.notEqual，assert.notStrictEqual —— 执行和上面相反的检查。
        assert.isTrue(value) —— 检查 value === true。
        assert.isFalse(value) —— 检查 value === false。
  */
});
