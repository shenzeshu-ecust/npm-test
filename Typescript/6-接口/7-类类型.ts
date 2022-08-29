// ! TypeScript也能够用它来明确的强制一个类去符合某种契约。
interface ClockInterface1 {
    currentTime: Date
    setTime(d: Date)
}
class Clock1 implements ClockInterface1 {
    currentTime: Date
    setTime(d: Date) {
        this.currentTime = d
    }
    constructor(h: number, m: number) {}
}
// 接口描述了类的公共部分，而不是公共和私有两部分。 它不会帮你检查类是否具有某些私有成员。 
