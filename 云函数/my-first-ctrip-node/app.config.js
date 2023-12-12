const path = require('path');
const packageConfig = require(path.resolve(__dirname, './package.json'));
function standardEnv(env) {
    const ENV_MAP = {
        'dev': 'fws',
        'fat': 'fws',
        'fws': 'fws',
        'uat_nt': 'uat',
        'uat': 'uat',
        'lpt': 'lpt',
        'pro': 'pro',
        'prod': 'pro',
        'prd': 'pro',
    };
    env = env && env.toLowerCase();
    return ENV_MAP[env] || env
}
module.exports={
    AppID:packageConfig.AppID,
    Env:standardEnv(packageConfig.config.env),
    // 一些需要加载的qconfig文件可在这里配置
    'vi.ignite':true
};
