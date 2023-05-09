// 原函数（一键复制）
// 本来函数每次执行都要判断浏览器支不支持navigator.clipboard
// 但其实没必要。只需要执行一次就行
function copyText(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    // IE等不支持clipboard的情况下
    const input = document.createElement("input");
    input.setAttribute("value", text);
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
  }
}
/*
    如果浏览器支持navigator.clipboard
    那么函数应该变成
copyText = (text) => {
    navigator.clipboard.writeText(text);
}
    不支持，那么
copyText = (text) => {
    const input = document.createElement("input");
    input.setAttribute("value", text);
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
}
...
*/
// ~ 惰性函数
// 在函数第一次调用的初始化自己
function copyText(text) {
  if (navigator.clipboard) {
    copyText = (text) => {
      navigator.clipboard.writeText(text);
    };
    copyText(text); // 第一调用时，确定下copyText的最终形式，同时也要执行一次
  } else {
    copyText = (text) => {
      const input = document.createElement("input");
      input.setAttribute("value", text);
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    };
    copyText(text);
  }
}

// ! 进阶：在调用之前 其实就知道支不支持了。所以创建一个包装函数
function createCopyText() {
  if (navigator.clipboard) {
    return (text) => {
      navigator.clipboard.writeText(text);
    };
  } else {
    return (text) => {
      const input = document.createElement("input");
      input.setAttribute("value", text);
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    };
  }
}

// 然后创建一个函数
const copyText1 = createCopyText();
