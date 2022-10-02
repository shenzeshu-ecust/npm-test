let a = "4";
// ! 强调一下，这里的相等是严格相等。被比较的值必须是相同的类型才能进行匹配。
switch (a) {
  case 3:
    console.log("ahhaha");
    break;
  case 4:
    console.log("hehehe");
    break;
  case "4":
    console.log("right!"); // 输出right!
    break; // ~ 如果没有 break，程序将不经过任何检查就会继续执行下一个 case。
  default:
    console.log("no match");
    break;
}
/*

    ! 1 比较 x 值与第一个 case（也就是 value1）是否 [严格相等]，然后比较第二个 case（value2）以此类推。
    2 如果相等，switch 语句就执行相应 case 下的代码块，直到遇到最靠近的 break 语句（或者直到 switch 语句末尾）。
    3 如果没有符合的 case，则执行 default 代码块（如果 default 存在）。

*/

// case分组
let b = 3;

switch (b) {
  case 4:
    console.log("Right!");
    break;

  case 3: // (*) 下面这两个 case 被分在一组
  case 5:
    console.log("Wrong!");
    console.log("Why don't you take a math class?");
    break;

  default:
    console.log("The result is strange. Really.");
}
/*
    现在 3 和 5 都显示相同的信息。
    
    switch/case 有通过 case 进行“分组”的能力，其实是 switch 语句没有 break 时的副作用。
    因为没有 break，case 3 会从 (*) 行执行到 case 5。
*/
