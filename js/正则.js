// ! 1 str.search() --> return: index
var str = "Visit Runoob!";
// 1）可以是正则
var n = str.search(/Runoob/i); // 6
// 2）也可以是字符串 字符串参数自动转化为正则表达式
var m = str.search("Run"); // 6
console.log(n, m);

// ! 2 str.replace(reg, otherStr) / str.replace(toReplaceStr, otherStr)
console.log(str.replace(/Run/i, "HAHA"));
console.log(str.replace("Run", "HAHA"));

// ! 3 正则表达式修饰符
/*
    i 	执行对大小写不敏感的匹配。
    g 	执行全局匹配（查找所有匹配而非在找到第一个匹配后停止）。
    m 	执行多行匹配。
*/

// ! 4 正则表达式模式
// ~ 1) 方括号用于查找某个范围内的字符：

/*
    [abc] 	查找方括号之间的任何字符。
    [^abc] 	查找任何不在方括号之间的字符。
    [0-9] 	查找任何从 0 至 9 的数字。
    (x|y) 	查找任何指定的选项。 
    [a-z] 	查找任何从小写 a 到小写 z 的字符。
    [A-Z] 	查找任何从大写 A 到大写 Z 的字符。
    [A-z] 	查找任何从大写 A 到小写 z 的字符。
    [adgk] 	查找给定集合内的任何字符。
    [^adgk] 查找给定集合外的任何字符。
 */
// ~ 2) 元字符是拥有特殊含义的字符
/*
    \d 	查找数字。
    \s 	查找空白字符。
    \b 	匹配单词边界。
    \uxxxx 	查找以十六进制数 xxxx 规定的 Unicode 字符。
*/
// ~ 3) 量词
/**
    n+ 	匹配任何包含至少一个 n 的字符串。例如，/a+/ 匹配 "candy" 中的 "a"，"caaaaaaandy" 中所有的 "a"。
    n* 	匹配任何包含零个或多个 n 的字符串。
    n? 	匹配任何包含零个或一个 n 的字符串。
    n{X}    匹配包含 X 个 n 的序列的字符串。 例如，/a{2}/ 不匹配 "candy," 中的 "a"，但是匹配 "caandy," 中的两个 "a"，且匹配 "caaandy." 中的前两个 "a"。
    n{X,} 	X 是一个正整数。前面的模式 n 连续出现至少 X 次时匹配。 例如，/a{2,}/ 不匹配 "candy" 中的 "a"，但是匹配 "caandy" 和 "caaaaaaandy." 中所有的 "a"。
    n{X,Y} 	X 和 Y 为正整数。前面的模式 n 连续出现至少 X 次，至多 Y 次时匹配。 例如，/a{1,3}/ 不匹配 "cndy"，匹配 "candy," 中的 "a"，"caandy," 中的两个 "a"，匹配 "caaaaaaandy" 中的前面三个 "a"。注意，当匹配 "caaaaaaandy" 时，即使原始字符串拥有更多的 "a"，匹配项也是 "aaa"。
    n$ 	匹配任何结尾为 n 的字符串。
    ^n 	匹配任何开头为 n 的字符串。
    ?=n 	匹配任何其后紧接指定字符串 n 的字符串。
    ?!n 	匹配任何其后没有紧接指定字符串 n 的字符串。
*/

// ! 5 regexp.test()  -> return: boolean
var pattern = /[0-9]/;
console.log(pattern.test("My age is 27")); // true

// ! 6 regexp.exec()  -> return: [] | null
// exec() 方法用于检索字符串中的正则表达式的匹配。
// 该函数返回一个数组，其中存放匹配的结果。如果未找到匹配，则返回值为 null。

console.log(/est/.exec("The best things in life are free!"));
/*
[
  'est',
  index: 5,
  input: 'The best things in life are free!',
  groups: undefined
]

*/
console.log(/[0-9]/.exec("The best things in life are free!")); // null
