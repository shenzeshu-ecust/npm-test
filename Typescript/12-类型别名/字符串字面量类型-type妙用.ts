/*
    字符串字面量类型允许你指定字符串必须的固定值。
    ~ 在实际应用中，字符串字面量类型可以与 联合类型， 类型保护 和 类型别名很好的配合。 
    ! 通过结合使用这些特性，你可以实现类似 枚举类型 的字符串。
*/

type Easing = "ease-in" | "ease-out" | "ease-in-out";
class UIElement {
  animate(dx: number, dy: number, easing: Easing) {
    if (easing === "ease-in") {
      // ...
    } else if (easing === "ease-out") {
    } else if (easing === "ease-in-out") {
    } else {
      // error! should not pass null or undefined.
    }
  }
}

let button = new UIElement();
button.animate(0, 0, "ease-in");
button.animate(0, 0, "uneasy"); // error: "uneasy" is not allowed here

// ! 还有数字字面量类型
function rollDie(): 1 | 2 | 3 | 4 | 5 | 6 {
  // ...
  return 1;
}
