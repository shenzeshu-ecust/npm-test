const path = require("path");
module.exports = function (rootPath, miniType, miniappPath) {
    if (miniappPath) {
        return {
            miniappPath
        }
    }
    rootPath = rootPath.replace(/\\/g, "/");
    miniappPath = path.join(rootPath, "../", miniType);

    let releasePath = path.join(rootPath, "../", miniType + "Release");
    if (rootPath.includes(".minicache")) {
      let outRootPath = rootPath.split("/.minicache")[0];
      miniappPath = path.join(outRootPath, miniType);
      releasePath = path.join(outRootPath, miniType + "Release");
    }

    return {
        miniappPath,
        releasePath
    }
}
