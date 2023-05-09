// 在 JavaScript 中，日期和时间使用 Date 对象来表示。
// ~ 我们不能单独创建日期或时间，Date 对象总是同时创建两者。

// ! 1 创建日期 new Date()
// ~ 1) 无参数
let now = new Date();
console.log(now); // 2023-02-01T08:20:37.256Z

// ~ 2) new Date(milliseconds) 创建一个 Date 对象，其时间等于 1970 年 1 月 1 日 UTC+0 之后经过的毫秒数
let Jan01_1970 = new Date(0);
console.log(Jan01_1970); // 1970-01-01T00:00:00.000Z

// + 1d
let Jan02_1970 = new Date(24 * 3600 * 1000);
console.log(Jan02_1970); // 1970-01-02T00:00:00.000Z

// 1.01.1970 之前的日期带有负的时间戳，
let Dec31_1969 = new Date(-24 * 3600 * 1000);
console.log(Dec31_1969); // 1969-12-31T00:00:00.000Z

// ~ 3) new Date(datestring) 如果只有一个参数，并且是字符串，那么它会被自动解析。
// 该算法与 Date.parse 所使用的算法相同
let today = new Date("2023-2-1 16:32:00");
console.log(today); // 2023-02-01T08:32:00.000Z
let dt = new Date("2012-1-20T03:12:00");
console.log(dt);
// ! ---------   如果未指定具体时间，所以假定时间为格林尼治标准时间（GMT）的午夜零点
// ! ---------   并根据运行代码时的用户的时区进行调整

// ~ 4) new Date(year, month, date, hours, minutes, seconds, ms) 精度可以到1毫秒
/*
~ 使用当前时区中的给定组件创建日期。只有前两个参数是必须的。

    year 应该是四位数。为了兼容性，也接受 2 位数，并将其视为 19xx，例如 98 与 1998 相同，但强烈建议始终使用 4 位数。
  * month 计数从 0（一月）开始，到 11（十二月）结束。
    date 是当月的具体某一天，如果缺失，则为默认值 1。
  * 如果 hours/minutes/seconds/ms 缺失，则均为默认值 0。

*/
let date1 = new Date(2023, 1, 2, 1, 14, 15, 567);
console.log(date1); // 2023-02-01T17:14:15.567Z

// ! 2 访问日期组件
// ~ 很多 JavaScript 引擎都实现了一个非标准化的方法 getYear()。不推荐使用这个方法。它有时候可能会返回 2 位的年份信息。永远不要使用它。要获取年份就使用 getFullYear()。
// 1）getFullYear() 获取年份（4 位数）
// ~ 2）getMonth() 获取月份，从 0 到 11。
// 3）getDate() 获取当月的具体日期，从 1 到 31，这个方法名称可能看起来有些令人疑惑。
// 4）getHours()，getMinutes()，getSeconds()，getMilliseconds()
// ~ 5）getDay() 获取一周中的第几天，从 0（星期日）到 6（星期六）。第一天始终是星期日

// 以上的所有方法返回的组件都是基于当地时区的。
// 当然，也有与当地时区的 UTC 对应项，它们会返回基于 UTC+0 时区的日、月、年等：getUTCFullYear()，getUTCMonth()，getUTCDay()。只需要在 "get" 之后插入 "UTC" 即可。

console.log(now.getHours()); // 17  当地时区的小时数
console.log(now.getUTCHours()); // 9 在 UTC+0 时区的小时数（非夏令时的伦敦时间） 17 - 8

// 除了上述给定的方法，还有两个没有 UTC 变体的特殊方法：
// 6）getTime() 返回日期的时间戳 —— 从 1970-1-1 00:00:00 UTC+0 开始到现在所经过的毫秒数。
// 7) getTimezoneOffset() 返回 UTC 与本地时区之间的时差，以分钟min为单位：
// 如果你在时区 UTC-1，输出 60
// 如果你在时区 UTC+3，输出 -180
console.log(new Date().getTimezoneOffset()); // -480 UTC+8

// ! 3 设置日期组件
/*
下列方法可以设置日期/时间组件：

    setFullYear(year, [month], [date])
    setMonth(month, [date])
  * setDate(date)  其中date默认从1开始  如果设置为0， 也就是设置为上个月的最后一天
    setHours(hour, [min], [sec], [ms])
    setMinutes(min, [sec], [ms])
    setSeconds(sec, [ms])
    setMilliseconds(ms)
    setTime(milliseconds)（使用自 1970-01-01 00:00:00 UTC+0 以来的毫秒数来设置整个日期）

以上方法除了 setTime() 都有 UTC 变体，例如：setUTCHours()。
*/
let t = new Date();
t.setFullYear(2011, 1, 2); // ~ 未提及的组件不会被修改
console.log(t); // 2011-02-02T09:10:10.799Z

// ! 4 Date对象可以自动校准，当设置超过范围的数值，就会自动校准
// 假设我们要在日期 “28 Feb 2016” 上加 2 天。结果可能是 “2 Mar” 或 “1 Mar”，因为存在闰年。但是我们不需要考虑这些，只需要直接加 2 天，剩下的 Date 对象会帮我们处理：
let date = new Date(2016, 1, 28);
// ~ 会改变date
date.setDate(date.getDate() + 2);
console.log(date); // 2016-02-29T16:00:00.000Z  这显示的事UTC + 0 的时间，本时区应该是2016-3-1
// 甚至可以负值
// ~ setDate(0)
let date3 = new Date(2022, 0, 2);
date3.setDate(0); // ~ 天数最小可以设置为 1，所以这里设置的是上一月的最后一天
console.log(date3); // 2021-12-30T16:00:00.000Z 因为是显示UTC+0时区的时间
date3.setDate(-1);
console.log(date3); // 2021-11-28T16:00:00.000Z
console.log("直接加", new Date(2002, 0 + 1, 27 + 3));

// ! 5 +new Date()  当 Date 对象被转化为数字时，得到的是对应的时间戳 与使用 date.getTime() 的结果相同
console.log(+new Date()); // 1675243588511

// ~ 有一个重要的副作用：日期可以相减，相减的结果是以毫秒为单位时间差（减号左右的自动被转换为数字类型）。

// ~ 这个作用可以用于时间测量 （ms）

// ! 6 Date.now() 它会返回当前的时间戳
// 如果我们仅仅想要测量时间间隔，我们不需要 Date 对象。 相当于 new Date().getTime()
// ~ 但它不会创建中间的 Date 对象。因此它更快，而且不会对垃圾回收造成额外的压力。
// 这种方法很多时候因为方便，又或是因性能方面的考虑而被采用，例如使用 JavaScript 编写游戏或其他的特殊应用场景。
// ~ 或者用 Date.now()
let start = new Date(); // 开始测量时间
// do the job
for (let i = 0; i < 100000; i++) {
  let doSomething = i * i * i;
}

let end = new Date(); // 结束测量时间

console.log(`The loop took ${end - start} ms`);

console.log(Date.now()); // 1675244002607

// ? 问题： 获取时间差，date直接相减，date.getTime() 后相减 哪个方式更高效？
function diffSubtract(date1, date2) {
  return date2 - date1;
}

function diffGetTime(date1, date2) {
  return date2.getTime() - date1.getTime();
}
function bench(f) {
  let date1 = new Date(0);
  let date2 = new Date();

  let start = Date.now();
  for (let i = 0; i < 100000; i++) f(date1, date2);
  return Date.now() - start;
}

let time1 = 0;
let time2 = 0;

// 交替运行 bench(diffSubtract) 和 bench(diffGetTime) 各 10 次
for (let i = 0; i < 10; i++) {
  time1 += bench(diffSubtract);
  time2 += bench(diffGetTime);
}

console.log("Total time for diffSubtract: " + time1); // 92
console.log("Total time for diffGetTime: " + time2); // 9

// ! date.getTime更高效！ 这是因为它没有进行类型转换，对引擎优化来说更加简单。

// ! 7 Date.parse(str) 可以从一个字符串中读取日期。并返回【时间戳】。如果给定字符串的格式不正确，则返回 NaN。
// 字符串的格式应该为  YYYY-MM-DDTHH:mm:ss.sssZ
// 其中，字符 "T" 是一个分隔符。可选字符 'Z' 为 +-hh:mm 格式的时区。单个字符 Z 代表 UTC+0 时区

// 简短形式也是可以的，比如 YYYY-MM-DD 或 YYYY-MM，甚至可以是 YYYY。
console.log(Date.parse("2023-2"));
console.log(Date.parse("2012-01-26T13:51:50.417-07:00")); // 1327611110417
console.log(Date.parse("0-0-0")); // NaN
// 时间戳转化为标准时间格式
let datee = new Date(Date.parse("2023-2"));
console.log(datee); // 2023-01-31T16:00:00.000Z

// ! 8 更精确的时间

// 有时我们需要更加精准的时间度量。JavaScript 自身并没有测量微秒的方法（百万分之一秒），但大多数运行环境会提供。

// 浏览器有 performance.now() 方法来给出从页面加载开始的以毫秒为单位的微秒数（精确到毫秒的小数点后三位）：
// Node.js 可以通过 microtime 模块或使用其他方法。
// 从技术上讲，几乎所有的设备和环境都允许获取更高精度的时间数值，只不过不是使用 Date 对象。

// TEST
// 1 编写一个函数 getWeekDay(date) 以短格式来显示一个日期的星期数：‘MO’，‘TU’，‘WE’，‘TH’，‘FR’，‘SA’，‘SU’。
function getWeekDay(date) {
  let days = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  return days[date.getDay()];
}

// 2 欧洲国家的星期计算是从星期一（数字 1）开始的，然后是星期二（数字 2），直到星期日（数字 7）。编写一个函数 getLocalDay(date)，并返回日期的欧洲式星期数。
function getLocalDay(date) {
  let res = date.getDay();
  if (res === 0) return 7;
  else return res;
}

// 3 写一个函数 getDateAgo(date, days)，返回特定日期 date 往前 days 天是该个月的哪一天。
function getDateAgo(date, days) {
  // 修改了原日期
  let d = date.getDate() - days;
  date.setDate(d);
  return date.getDate();
}
function getDateAgo2(date, days) {
  // 不修改原日期
  let dateCopy = new Date(date);
  dateCopy.setDate(dateCopy.getDate() - days);
  return dateCopy.getDate();
}
let dd = new Date(2015, 0, 2);
console.log(getDateAgo(dd, 1));
console.log(getDateAgo(dd, 365));

// 4 写一个函数 getLastDayOfMonth(year, month) 返回 month 月的最后一天。有时候是 30，有时是 31，甚至在二月的时候会是 28/29。
function getLastDayOfMonth(year, month) {
  // 让我们使用下个月创建日期，但将零作为天数（day）传递：
  // let date = new Date(year, month + 1);
  // date.setDate(0); // 前一天
  let date = new Date(year, month + 1, 0);
  return date.getDate();
}
// ~ 通常，日期从 1 开始，但从技术上讲，我们可以传递任何数字，日期会自动进行调整。因此，当我们传递 0 时，它的意思是“一个月的第一天的前一天”，换句话说：“上个月的最后一天”。
console.log(getLastDayOfMonth(2012, 0)); // 31
console.log(getLastDayOfMonth(2012, 1)); // 29
console.log(getLastDayOfMonth(2013, 1)); // 28

// 5 今天过去了多少秒？
function getSecondsToday() {
  let now = new Date();
  // 使用当前的 day/month/year 创建一个对象
  //  小时 分 秒 默认00:00:00
  let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let diff = now - today;
  return Math.round(diff / 1000); // 默认毫秒
}
console.log(getSecondsToday());

// 另一种解决方法是获取 hours/minutes/seconds，然后把它们转换为秒数：

function getSecondsToday() {
  let d = new Date();
  return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
}

// 6 距离明天还有多少秒？
function getSecondsToTomorrow() {
  let now = new Date();
  let tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  let diff = tomorrow - now;
  return Math.round(diff / 1000); // 默认毫秒
}

// 另一种解法：

function getSecondsToTomorrow() {
  let now = new Date();
  let hour = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();
  let totalSecondsToday = (hour * 60 + minutes) * 60 + seconds;
  let totalSecondsInADay = 86400; // 一天总共秒数

  return totalSecondsInADay - totalSecondsToday;
}

// 请注意，很多国家有夏令时（DST），因此他们的一天可能有 23 小时或者 25 小时。我们对这些天数要区别对待。
