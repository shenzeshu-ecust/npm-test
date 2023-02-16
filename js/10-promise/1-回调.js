// 回调地狱\厄运金字塔
// 、乍一看，它像是一种可行的异步编程方式。的确如此，对于一个或两个嵌套的调用看起来还不错。
// 但对于一个接一个的多个异步行为，代码将会变成这样：
loadScript("1.js", function (error, script) {
  if (error) {
    handleError(error);
  } else {
    // ...
    loadScript("2.js", function (error, script) {
      if (error) {
        handleError(error);
      } else {
        // ...
        loadScript("3.js", function (error, script) {
          if (error) {
            handleError(error);
          } else {
            // ...加载完所有脚本后继续 (*)
          }
        });
      }
    });
  }
});
// 嵌套调用的“金字塔”随着每个异步行为会向右增长。很快它就失控了。

// ~ 我们可以通过使每个行为都成为一个独立的函数来尝试减轻这种问题，如下所示：

loadScript("1.js", step1);

function step1(error, script) {
  if (error) {
    handleError(error);
  } else {
    // ...
    loadScript("2.js", step2);
  }
}

function step2(error, script) {
  if (error) {
    handleError(error);
  } else {
    // ...
    loadScript("3.js", step3);
  }
}

function step3(error, script) {
  if (error) {
    handleError(error);
  } else {
    // ...加载完所有脚本后继续 (*)
  }
}

// 它可以工作，但是代码看起来就像是一个被撕裂的表格。你可能已经注意到了，它的可读性很差，在阅读时你需要在各个代码块之间跳转。这很不方便，特别是如果读者对代码不熟悉，他们甚至不知道应该跳转到什么地方。

// 此外，名为 step* 的函数都是一次性使用的，创建它们就是为了避免“厄运金字塔”。没有人会在行为链之外重用它们。因此，这里的命名空间有点混乱。
