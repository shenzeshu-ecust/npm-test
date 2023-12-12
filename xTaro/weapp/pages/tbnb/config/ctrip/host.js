import buildEnvUtils from '../utils/build_env_utils';
import envConfigBuild from './deploy_build';
import envConfigGray from './deploy_gray';
var envInitHandle = buildEnvUtils.envInitHandle;
var config = envInitHandle({
  envConfigBuild: envConfigBuild,
  envConfigGray: envConfigGray
});
console.log(config, 'apiconfig');
export default config;