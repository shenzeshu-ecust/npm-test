interface Bird {
  fly();
  layEggs();
}
interface Fish {
  swim();
  layEggs();
}
// 1 自定义类型保护 param is IInterface
// 以下代码相当于告诉编译器，如果返回结果为 true，则代表 pet 是 Fish 类型：
function isFish(pet: Fish | Bird): pet is Fish {
  return (<Fish>pet).swim !== undefined;
}
// 'swim' 和 'fly' 调用都没有问题了
function getPet(pet): void {
  if (isFish(pet)) {
    pet.swim();
  } else {
    pet.fly();
  }
}

// 2 typeof 类型保护
function padLeft(value: string, padding: string | number) {
  if (typeof padding === "number") {
    return Array(padding + 1).join(" ") + value;
  }
  if (typeof padding === "string") {
    return padding + value;
  }
  throw new Error(`Expected string or number, got '${padding}'.`);
}
// 这些* typeof类型保护 * 只有两种形式能被识别： typeof v === "typename"和 typeof v !== "typename"
//  "typename"必须是 "number"， "string"， "boolean"或 "symbol"。
//  但是TypeScript并不会阻止你与其它字符串比较，语言不会把那些表达式识别为类型保护。

// 3 instanceof 类型保护
//  instanceof类型保护是通过构造函数来细化类型的一种方式。
interface Padder {
  getPaddingString(): string;
}

class SpaceRepeatingPadder implements Padder {
  constructor(private numSpaces: number) {}
  getPaddingString() {
    return Array(this.numSpaces + 1).join(" ");
  }
}

class StringPadder implements Padder {
  constructor(private value: string) {}
  getPaddingString() {
    return this.value;
  }
}

function getRandomPadder() {
  return Math.random() < 0.5
    ? new SpaceRepeatingPadder(4)
    : new StringPadder("  ");
}

// 类型为SpaceRepeatingPadder | StringPadder
let padder: Padder = getRandomPadder();

if (padder instanceof SpaceRepeatingPadder) {
  padder; // 类型细化为'SpaceRepeatingPadder'
}
if (padder instanceof StringPadder) {
  padder; // 类型细化为'StringPadder'
}
