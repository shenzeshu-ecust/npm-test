// remove_console.input.js
export const sum = (a, b) => {
    console.log('计算下面两个数的和：', a, b);
    return a + b;
};

export const minus = (a, b) => {
    console.log('计算下面两个数的差：' + a + ',' + b);
    return a - b;
};

export const multiply = (a, b) => {
    console.warn('计算下面两个数的积：', a, b);
    return a * b;
};

export const divide = (a, b) => {
    console.error(`计算下面两个数相除 ${a}, ${b}`);
    return a / b;
};
