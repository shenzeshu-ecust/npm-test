console.log("this is a test file");
//环境变量process.env拿到package.json字段值
// 通过 npm_package_前缀 可以拿到package.json里的字段
console.log(process.env.npm_package_config_env); //production
console.log(process.env.npm_package_main); //01-example.js