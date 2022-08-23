import  https from 'https'
const options = {
    hostname: 'nodejs.cn',
    port: 443,
    path: '/todos',
    method: 'GET'
}
 const req = https.request(options, res => {
    console.log(`状态码：${req.statusCode}`);
    res.on('data', d => {
        process.stdout.write(d)
    })
 })
 req.on('error', error => {
    console.error(error)
 })
 req.end()