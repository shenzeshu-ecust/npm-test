//  监听输入
process.stdin.on('data', data => {
    // 将输入大写转化完成后 输出
    data = data.toString().toUpperCase()
    process.stdout.write(data + '\n')
})