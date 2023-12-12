function preFixInterge(num, n) {
    //num代表传入的数字，n代表要保留的字符的长度
    return (Array(n).join(0) + num).slice(-n);
} // 时间格式化输出，如3:25:19 86。每10ms都会调用一次

function getDuration(micro_second) {
    let flag = 1;

    if (micro_second < 0) {
        micro_second = -1 * micro_second;
        flag = -1;
    } // 秒数

    var second = Math.floor(micro_second / 1000); // 小时位

    var hr = Math.floor(second / 3600); //小时

    var min = Math.floor((second - hr * 3600) / 60); //分钟

    //秒
    return {
        hours: flag * hr,
        minutes: flag * min,
        seconds: flag * (second - hr * 3600 - min * 60),
    };
}

function countDown(endTime = '') {
    let endDate = new Date(endTime.replace(/\-/gm, '/'));
    let now = new Date();
    let remainTime = endDate.getTime() - now.getTime();
    return getDuration(remainTime);
}

export { countDown, preFixInterge, getDuration };
