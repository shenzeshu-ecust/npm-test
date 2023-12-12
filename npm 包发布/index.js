import Format from "../../npm 包发布/src/format";
import Validate from "../../npm 包发布/src/validate";

export { Format, Validate };

// ~ 注意 package.json中的 name 需要独一无二，否则会显示没权限之类的错误

// ~ 发布 npm publish
// ~ 更新 npm version patch/minor/major (补丁、新功能、大版本)
// ! 先行版本号 
/*
 * 　　常见的先行版本号有：

alpha：不稳定版本，一般而言，该版本的Bug较多，需要继续修改，是测试版本
beta：基本稳定，相对于Alpha版已经有了很大的进步，消除了严重错误
rc：和正式版基本相同，基本上不存在导致错误的Bug
release：最终版本

1.0​​.0-alpha
1.0.0-alpha.1
1.0.0-0.3.7

*  对应的版本命令
npm version prepatch/preminor/premajor/prerelease
 */