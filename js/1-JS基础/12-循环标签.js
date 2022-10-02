/*
    有时候我们需要一次从多层嵌套的循环中跳出来。

    例如，下述代码中我们的循环使用了 i 和 j，从 (0,0) 到 (3,3) 提示坐标 (i, j)：
    for (let i = 0; i < 3; i++) {

        for (let j = 0; j < 3; j++) {

            let input = prompt(`Value at coords (${i},${j})`, '');

            ~ 如果我想从这里退出并直接执行 alert('Done!')
        }
    }
    alert('Done')
*/
// ! 在 input 之后的普通 break 只会打破内部循环。这还不够
// ! 标签可以实现这一功能！
/*
    标签 是在循环之前带有冒号的标识符：

    labelName: for (...) {
    ...
    }
*/
// ~ break <labelName> 语句跳出循环至标签处：
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    // * 如果是空字符串或被取消，则中断并跳出这两个循环。
    let input = prompt(`Value at coords (${i},${j})`, "");
    if (!input) break outer; // ~ *
  }
}
/*
    我们还可以将标签移至单独一行：

    outer:
    for (let i = 0; i < 3; i++) { ... }
*/
// ! continue 指令也可以与标签一起使用。在这种情况下，执行跳转到标记循环的下一次迭代。

/*
    标签不允许我们跳到代码的任意位置。
    例如，这样做是不可能的：

    break label;  // 跳转至下面的 label 处（无效）
    label: for (...)

    break 指令必须在代码块内。从技术上讲，任何被标记的代码块都有效，例如：

    label: {
    // ...
    break label; // 有效
    // ...
    }
*/
// test 求2-n之间的素数（只能被1和自身整除）
let n = 20;
nextPrime: for (let i = 2; i <= n; i++) {
  for (let j = 2; j < i; j++) {
    if (i % j === 0) continue nextPrime;
  }
  console.log(i);
}
