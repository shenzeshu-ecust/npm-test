/*

“同源（Same Origin）”策略限制了窗口（window）和 frame 之间的相互访问。

这个想法出于这样的考虑，如果一个用户有两个打开的页面：一个来自 john-smith.com，另一个是 gmail.com，那么用户将不希望 john-smith.com 的脚本可以读取 gmail.com 中的邮件。
~ 所以，“同源”策略的目的是保护用户免遭信息盗窃。

如果两个 URL 具有相同的协议，域和端口，则称它们是“同源”的。

以下的几个 URL 都是同源的：

    http://site.com
    http://site.com/
    http://site.com/my/page.html

但是下面这几个不是：

    http://www.site.com（另一个域：www. 影响）
    http://site.org（另一个域：.org 影响）
    https://site.com（另一个协议：https）
    http://site.com:8080（另一个端口：8080）

“同源”策略规定：

    ~ 如果我们有对另外一个窗口（例如，一个使用 window.open 创建的弹窗，或者一个窗口中的 iframe）的引用，并且该窗口是同源的，那么我们就具有对该窗口的全部访问权限。
    ~ 否则，如果该窗口不是同源的，那么我们就无法访问该窗口中的内容：变量，文档，任何东西。
        * 唯一的例外是 location：我们可以修改它（进而重定向用户）。但是我们无法读取 location（因此，我们无法看到用户当前所处的位置，也就不会泄漏任何信息）。

*/

// iframe的错误文档陷阱
// 当一个 iframe 来自同一个源时，我们可能会访问其 document，但是这里有一个陷阱。它与跨源无关，但你一定要知道。
// ~ 在创建 iframe 后，iframe 会立即就拥有了一个文档。但是该文档不同于加载到其中的文档！

/*
<iframe src="/" id="iframe"></iframe>

<script>
  let oldDoc = iframe.contentDocument;
  iframe.onload = function() {
    let newDoc = iframe.contentDocument;
    *  加载的文档与初始的文档不同！
    alert(oldDoc == newDoc); // false
  };
</script>




我们不应该对尚未加载完成的 iframe 的文档进行处理，因为那是 错误的文档。如果我们在其上设置了任何事件处理程序，它们将会被忽略。

? 如何检测文档就位（加载完成）的时刻呢？

 * 正确的文档在 iframe.onload 触发时肯定就位了。但是，只有在整个 iframe 和它所有资源都加载完成时，iframe.onload 才会触发。

 * 我们可以尝试通过在 setInterval 中进行检查，以更早地捕获该时刻：

<iframe src="/" id="iframe"></iframe>

<script>
  let oldDoc = iframe.contentDocument;

  / 每 100ms 检查一次文档是否为新文档
  let timer = setInterval(() => {
    let newDoc = iframe.contentDocument;
    if (newDoc == oldDoc) return;

    alert("New document is here!");

    clearInterval(timer); // 取消 setInterval，不再需要它做任何事儿
  }, 100);
</script>
*/
